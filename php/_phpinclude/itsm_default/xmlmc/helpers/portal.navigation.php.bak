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
		//-- TK F0110889
		//-- Add WSSM_LINKS after help
		$strHTML .= create_optional_items();
		$strHTML .= "</ul>";

		return $strHTML;
	}
	//--
	//-- TK Function to get all menu Links from WSSM_LINKS Table
	function create_optional_items()
	{
		$strLinksHTML = "";
		//-- DB Connection
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			//-- Get All links in order
			$strQuery="select * from wssm_links order by view_order ASC";
			$rsBORecords = $connDB->query($strQuery,true);
			while(!$rsBORecords->eof)
			{	
				$temp = $rsBORecords->f("pk_id");
				$strDisplayType = "";
				if($rsBORecords->f("type") == "URL")
					$strDisplayType = "popup";
				$strFeatures = "";
				if($rsBORecords->f("type") == "HTML")
				{
					$strContent = "content/load_html.php?phpid=".$rsBORecords->f("pk_id")."";
				}else
				{
					$strContent = $rsBORecords->f("link");
				}

				if (!isset($strActions))
					$strActions=null;

				$strLinksHTML .= "<li><a href='#' id='mi_".$rsBORecords->f("pk_id")."' onclick='menu_item_selected(this);' ulid='ul_".$rsBORecords->f("pk_id")."' aparent='-1' expanded='0' displaytype='".$strDisplayType."' features='".$strFeatures."' phpactions='".$strActions."' phpcontent='".$strContent."' class='parentitemclass'>".$rsBORecords->f("description")."</a>";
				$strLinksHTML .="</li>";
				$rsBORecords->movenext();
			}
		}
		
		//-- Return HTML
		return $strLinksHTML;
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
				$boolOK=$boolOK && false;
			}
		}

		//-- check app right is true then show i.e. when flag is something like "Show menu item if checked"
		if($strShowIfAppRight!="")
		{
			//-- expects A,1 or A,2 o A,3 etc
			$arrFlag = explode(",",$strShowIfAppRight);
			$boolOK= $boolOK && haveappright($arrFlag[0],$arrFlag[1]);
		}

		//-- if app right flag is false then show i.e. when flag is something like "Hide menu item if checked"
		if($strHideIfAppRight!="")
		{
			//-- expects A,1 or A,2 o A,3 etc
			$arrFlag = explode(",",$strHideIfAppRight);
			$boolOK=$boolOK && (!haveappright($arrFlag[0],$arrFlag[1]));
		}
		
		//-- do we have an additional access function
		if($strAccessFunction!="")
		{
			//-- test access test
			$strAccessFunction=parse_context_vars($strAccessFunction);
			eval("\$boolAccessOK =  ".$strAccessFunction.";");
			$boolOK=$boolOK && $boolAccessOK;
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
		$strDisplayType = getAttribute("displaytype", $xmlSubGroup->attributes()); //-- nwj - allow for type of display (inline or popup [can add iframe in future])
		if($strDisplayType=="")$strDisplayType="inline";
		$strFeatures	= getAttribute("features", $xmlSubGroup->attributes()); // for popup window

		$strCurrentParentHTML = "<li><a href='#' id='mi_".$strMenuID."' onclick='menu_item_selected(this);' parentid='".$strParentMenuID."' ulid='ul_".$strMenuID."' aparent='-1' expanded='0' displaytype='".$strDisplayType."' features='".$strFeatures."' phpactions='".$strActions."' phpcontent='".$strContent."' class='parentitemclass'>".$strItem."</a>";
			
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
				//if(!bool_ok_to_show($secondlevelchild))continue;
				if(!bool_ok_to_show($secondlevelchild))
				{
					$secondlevelchild = $secondlevelchild->next_sibling();
					continue;
				}


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
					$strDisplayType = getAttribute("displaytype", $secondlevelchild->attributes()); //-- nwj - allow for type of display (inline or popup [can add iframe in future])
					if($strDisplayType=="")$strDisplayType="inline";
					$strFeatures	= getAttribute("features", $secondlevelchild->attributes()); // for popup window

					$strChildHTML .= "<li><a href='#' id='mi_".$strChildID."' parentid='".$strMenuID."' onclick='menu_item_selected(this);'  displaytype='".$strDisplayType."' features='".$strFeatures."' aparent='0' expanded='0' phpactions='".$strChildActions."' phpcontent='".$strChildContent."' >".$strChildItem."</a>";
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