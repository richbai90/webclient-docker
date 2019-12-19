<?php

	//-- returns menu html based on a passed in definition file
	function create_navigation_menu($xmlDefinitionFile)
	{
		
		//-- open xml file find menu items and construct ul and li items 
		$xmlfile = file_get_contents($xmlDefinitionFile);
		$xmlfile = str_replace(">\n", '>', $xmlfile); //-- remove whitespace
		$xmlfile = str_replace(">\r", '>', $xmlfile);

		//-- create dom instance of the xml file
		//-- get the first child and loop through
		$xmlDoc = domxml_open_mem($xmlfile);
		$root = $xmlDoc->document_element();
		$intExpandAll = getAttribute("expandall", $root->attributes()); //-- do we want to expand all menu items?

		$child = $root->first_child();

		$counter=1;
		$strHTML = "<ul id='ul_menulist'>";
		while ($child) 
		{
			$strCurrentParentHTML = "";
			//-- if has attributes as valid menu item
			if($child->has_attributes())
			{
				//-- create html 
				$strID = getAttribute("id", $child->attributes());
				$strWebFlag = getAttribute("webflag", $child->attributes());
				$strConfigFlag = getAttribute("configflag", $child->attributes());
				$strShowIfAppRight = getAttribute("showonappright", $child->attributes());
				$strHideIfAppRight = getAttribute("hideonappright", $child->attributes());
				$strAccessFunction = getAttribute("accessfunction", $child->attributes());
				$strAddItemsFunction = getAttribute("additems", $child->attributes());
				$boolOK=true;

				if($strWebFlag!="")
				{
					//-- test customers permission
					eval("\$strWebFlag = ".$strWebFlag.";");
					if($customer_session->IsOption($strWebFlag)==false)
					{
						//-- user does not have menu permission
						$boolOK=false;
					}
				}
				else if($strConfigFlag!="")
				{
					//-- test config permission
					eval("\$strConfigFlag = ".$strConfigFlag.";");
					if(!($_SESSION['config_flags']&$strConfigFlag))
					{
						//-- config does not have menu permission
						$boolOK=false;
					}
				}

				//-- check app right is true then show i.e. when flag is something like "Show menu item if checked"
				if($strShowIfAppRight!="")
				{
					//-- expects A,1 or A,2 o A,3 etc
					$arrFlag = explode(",",$strShowIfAppRight);
					//echo haveappright($arrFlag[0],$arrFlag[1]);
					//exit;
					$boolOK= haveappright($arrFlag[0],$arrFlag[1]);
				}

				//-- if app right flag is false then show i.e. when flag is something like "Hide menu item if checked"
				if($strHideIfAppRight!="")
				{
					//-- expects A,1 or A,2 o A,3 etc
					$arrFlag = explode(",",$strHideIfAppRight);
					$boolOK=(!haveappright($arrFlag[0],$arrFlag[1]));
				}
				
				//-- do we have an additional access function
				if($strAccessFunction!="")
				{
					//-- test access test
					$strAccessFunction=parse_context_vars($strAccessFunction);
					eval("\$boolOK = ".$strAccessFunction.";");
				}


				if($boolOK)
				{
					$strItem = parse_context_vars(getAttribute("display", $child->attributes()));
					$strContent	= getAttribute("content", $child->attributes());
					$strActions = getAttribute("actions", $child->attributes());
					$strCurrentParentHTML = "<li><a href='#' id='mi_".$strID."' onclick='menu_item_selected(this);' ulid='ul_".$counter."' aparent='-1' expanded='0' phpactions='".$strActions."' phpcontent='".$strContent."' class='parentitemclass'>".$strItem."</a>";
		

					//-- see if this node has children or get chilsdren using additems function
					$strChildHTML="";
					if($strAddItemsFunction!="")
					{
						//-- call function to add additional items html to string
						$strAddItemsFunction=parse_context_vars($strAddItemsFunction);
						eval("\$strChildHTML = ".$strAddItemsFunction.";");
					}

					//-- see if we have hardcoded ones
					$secondlevelchild = $child->first_child();
					while ($secondlevelchild) 
					{
						if($secondlevelchild->has_attributes())
						{
							//-- create child html
							$strChildID = getAttribute("id", $secondlevelchild->attributes());
							//-- NWJ - 02.01.2008 - added parse_context_vars to display of sub menu items
							$strChildItem = parse_context_vars(getAttribute("display", $secondlevelchild->attributes()));
							$strChildContent	= getAttribute("content", $secondlevelchild->attributes());
							$strChildActions	= getAttribute("actions", $secondlevelchild->attributes());
							$strChildHTML .= "<li><a href='#' id='".$strChildID."' parentid='".$strID."' onclick='menu_item_selected(this);' aparent='0' expanded='0' phpactions='".$strChildActions."' phpcontent='".$strChildContent."' >".$strChildItem."</a>";
						}
						$secondlevelchild = $secondlevelchild->next_sibling();
					}
				
					//--
					//-- if had children append and set parent class
					$strParentclass = "";
					$strAParent = "aparent='0'";
					if($strChildHTML!="")
					{
						//-- set class based on setting to expand all meu items or not
						$strChildClass= ($intExpandAll=="1")?'childrenvisible':'childrenhidden';
						$strParentclass = ($intExpandAll=="1")?"class='withchildunselected'":"class='withchild'";
						$strAParent = "aparent='1'";

						$strCurrentParentHTML.= "<ul class='" . $strChildClass ."' id='ul_".$counter."'>".$strChildHTML."</ul>";
					}
					$strCurrentParentHTML = str_replace("class='parentitemclass'",$strParentclass,$strCurrentParentHTML); //-- set class 
					$strCurrentParentHTML = str_replace("aparent='-1'",$strAParent,$strCurrentParentHTML); //-- set as parent or not
					$strCurrentParentHTML .="</li>";

					$strHTML .= $strCurrentParentHTML;
				}//-- boolOK
			}
			//-- get the next menu item
		   $child = $child->next_sibling();
		   $counter++;
		}
		$strHTML .= "</ul>";

		return $strHTML;
	}
?>