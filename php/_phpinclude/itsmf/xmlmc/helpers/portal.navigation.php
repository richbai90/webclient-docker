<?php

	//-- 
	//-- create menu items allow for top->level1->level2 thats all as menu is fixed width
	function create_navigation_menu($xmlDefinitionFile)
	{
	    /**
	     * @var classcustomersession
	     */
		GLOBAL $customer_session;
		
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
				$strHTML .= create_menu_item($child,$counter,"",$intExpandAll);
			}
			//-- get the next menu item
		   $child = $child->next_sibling();
		   $counter++;
		}
		$strHTML .= "</ul>";

		return $strHTML;
	}

	//--
	//-- 26.09.2008 - return true or fals eif ok to show
	function bool_ok_to_show(&$xmlMenuItem)
	{
		GLOBAL $customer_session;

		$strID = getAttribute("id", $xmlMenuItem->attributes());
		$strWebFlag = getAttribute("webflag", $xmlMenuItem->attributes());
		$strConfigFlag = getAttribute("configflag", $xmlMenuItem->attributes());
		$strShowIfAppRight = getAttribute("showonappright", $xmlMenuItem->attributes());
		$strHideIfAppRight = getAttribute("hideonappright", $xmlMenuItem->attributes());
		$strAccessFunction = getAttribute("accessfunction", $xmlMenuItem->attributes());
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
			$arrFlag = preg_split("/,/",$strShowIfAppRight);
			$boolOK= haveappright($arrFlag[0],$arrFlag[1]);
		}

		//-- if app right flag is false then show i.e. when flag is something like "Hide menu item if checked"
		if($strHideIfAppRight!="")
		{
			//-- expects A,1 or A,2 o A,3 etc
			$arrFlag = preg_split("/,/",$strHideIfAppRight);
			$boolOK=(!haveappright($arrFlag[0],$arrFlag[1]));
		}
		
		//-- do we have an additional access function
		if($strAccessFunction!="")
		{
			//-- test access test
			$strAccessFunction=parse_context_vars($strAccessFunction);
			eval("\$boolOK = ".$strAccessFunction.";");
		}
		return $boolOK;
	}

	//--
	//-- 26.09.2008 - generate sub menu items
	function create_menu_item(&$xmlSubGroup,$counter,$strParentMenuID = "",$intExpandAll)
	{
		//- -check if ok to show
		if(!bool_ok_to_show($xmlSubGroup))return "";

		$strItem = parse_context_vars(getAttribute("display", $xmlSubGroup->attributes()));
		$strMenuID = getAttribute("id", $xmlSubGroup->attributes());
		$strContent	= getAttribute("content", $xmlSubGroup->attributes());
		$strActions = getAttribute("actions", $xmlSubGroup->attributes());

		//-- ability to add an image to the item - for AR - 19.02.2009
		$strImage = getAttribute("image", $xmlSubGroup->attributes());
		if($strImage!="")
		{
			$strImage = "<img src='img/icons/". $strImage ."'></img></br>";
		}

		$strCurrentParentHTML = "<li><a href='#' id='mi_".$strMenuID."' onclick='menu_item_selected(this);' parentid='".$strParentMenuID."' ulid='ul_".$strMenuID."' aparent='-1' expanded='0' phpactions='".$strActions."' phpcontent='".$strContent."' class='parentitemclass'>".$strImage.$strItem."</a>";
			
		//-- see if this subgroup has children or get chilsdren using additems function
		$strChildHTML="";
		$strAddItemsFunction = getAttribute("additems", $xmlSubGroup->attributes());
		if($strAddItemsFunction!="")
		{
			//-- call function to add additional items html to string
			$strAddItemsFunction=parse_context_vars($strAddItemsFunction);
			eval("\$strChildHTML = ".$strAddItemsFunction.";");
		}

		//-- see if we have hardcoded child items or subgroups
		$secondlevelchild = $xmlSubGroup->first_child();
		while ($secondlevelchild) 
		{
			if($secondlevelchild->has_attributes())
			{
				//-- check if ok to show
				if(!bool_ok_to_show($secondlevelchild))continue;

				//-- create child html
				$strType	= getAttribute("type", $secondlevelchild->attributes());
				$strChildID = getAttribute("id", $secondlevelchild->attributes());

				if($strType=="subgroup")
				{
					//-- the child is a subgroup of items
					$strChildHTML .= create_menu_item($secondlevelchild,0,$strMenuID,$intExpandAll);
				}
				else
				{
					//-- normal child item
					//-- NWJ - 02.01.2008 - added parse_context_vars to display of sub menu items
					$strChildItem = parse_context_vars(getAttribute("display", $secondlevelchild->attributes()));
					$strChildContent	= getAttribute("content", $secondlevelchild->attributes());
					$strChildActions	= getAttribute("actions", $secondlevelchild->attributes());
					$strChildHTML .= "<li><a href='#' id='".$strChildID."' parentid='".$strMenuID."' onclick='menu_item_selected(this);' aparent='0' expanded='0' phpactions='".$strChildActions."' phpcontent='".$strChildContent."' >".$strChildItem."</a>";
				}
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

			$strCurrentParentHTML.= "<ul class='" . $strChildClass ."' id='ul_".$strMenuID."'>".$strChildHTML."</ul>";

		}

		$strCurrentParentHTML = str_replace("class='parentitemclass'",$strParentclass,$strCurrentParentHTML); //-- set class 
		$strCurrentParentHTML = str_replace("aparent='-1'",$strAParent,$strCurrentParentHTML); //-- set as parent or not
		$strCurrentParentHTML .="</li>";

		return $strCurrentParentHTML;

	}
?>