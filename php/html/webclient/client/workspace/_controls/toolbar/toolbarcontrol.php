<?php

//-- will do security check
if(!@$boolWebclientSessionFileLoaded)include_once('../../../../php/session.php');


//--
//-- open a toolbar xml def and return root document
function open_toolbarxml($strTBarName)
{
    //-- open xml file based on tabformname
    $strFileName = $_SESSION['root_path']."/apps/".$_SESSION['application']."/_custom/toolbar/".$strTBarName.".xml";
	$xmlfp = file_get_contents($strFileName);
	if($xmlfp==false)
	{
		$strFileName = $_SESSION['root_path']."/apps/".$_SESSION['application']."/toolbar/".$strTBarName.".xml";
	    $xmlfp = file_get_contents($strFileName);
	}
    $xmlDoc = domxml_open_mem($xmlfp);
    $root = $xmlDoc->document_element();
    return $root;
}


//-- create menu item div for toolbar item
function create_menu($strParentID,$xmlItems,$jsHandle, $parentXML)
{
	global $portal;

	$strMenuHTML = "";
	if($jsHandle=="")$jsHandle = "app.doesnotexist";

	$strHTML = "<div id='mnu_".$strParentID."' pid='".$strParentID."' class='menu-holder'><table id='mnu_tbl_".$strParentID."' cellspacing='0' cellpadding='0' border='0' >";
	foreach($xmlItems as $pos => $xmlNode)
	{
		//-- check if this menu item has children - if so create html
		$strItemID = $xmlNode->get_attribute("iid");
		if($strItemID=="split")
		{
			//-- a splitter
			$strHTML .= "<tr class='mnu-row-split'><td class='mnu-icon-col'><div class='mnu-icon'></div></td><td colspan='2' align='middle'><div class='mnu-splitter'></div></td><td></td></tr>";
		}
		else
		{

			$strItemImgPath = $xmlNode->get_attribute("imgpath");
			if($strItemImgPath=="") $strItemImgPath=$portal->root_path . "client/workspace/_controls/toolbar/toolbarimages/";


			//-- get image info
			$boolImg=true;
			$strItemImgClass = $xmlNode->get_attribute("imgclass");
			$strItemImg = $xmlNode->get_attribute("img");
			if($strItemImg=="")	$boolImg=false;
			$strItemImg = $strItemImgPath .$strItemImg;

			$strHasDisableImg = $xmlNode->get_attribute("imgdis");			
			if($strHasDisableImg!="")$strHasDisableImg = $strItemImgPath . $strHasDisableImg;


			//-- check if has children
			$boolChildren = false;
			$strItemType = $xmlNode->get_attribute("type");
			if($strItemType=="menu")
			{
				//-- get text which is in label
				$label = swxml_childnode($xmlNode,"label");
				$strText = $label->get_content();

				//-- get menu items and create html
				$mnuHandle = $xmlNode->get_attribute("mnuhandler");
				$handler = ($mnuHandle!="")?$mnuHandle:$jsHandle;
				$strMenuHTML .= create_menu("mnu_".$strItemID,swxml_childnodes($xmlNode,"mitem"),$handler,$xmlNode);
				$boolChildren = true;
			}
			else
			{
				$strText = $xmlNode->get_content();
			}

			//-- set child class
			$strChildClass=($boolChildren)?"mnu-child":"mnu-nochild";
			//-- set img class
			if($strItemImgClass=="")$strItemImgClass="mnu-icon";
			$strImgHTML = ($boolImg)?"<img src='".$strItemImg."'>":"&nbsp;";

			$strItemLoader = $xmlNode->get_attribute("jsitemloader");

			$strFlagHidden = $xmlNode->get_attribute("hidden");
			$strHiddenStyle = ($strFlagHidden=="1")?"style='display:none;'":"";


			//-- menu item html
			$strHTML .= "<tr id='mnu_".$strItemID."' pid='".$strParentID."' itemloader='".$strItemLoader."' mnutype='".$strItemType."' disimg='".$strHasDisableImg."' $strHiddenStyle onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\",event);}}'><td class='mnu-icon-col' valign='middle'><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";
		}
	} //-- eof for

	//-- check if we have a method to call which will add menu items
	$funcItemLoader =$parentXML->get_attribute("itemloader");
	if($funcItemLoader!="") 
	{
		$arrAddItems = $funcItemLoader($strParentID,$jsHandle);
		$strHTML .= $arrAddItems[0];
		$strMenuHTML .= $arrAddItems[1];
	}

	$strHTML .= "</table></div>";
	return $strHTML . $strMenuHTML;
}

//-- draw out toolbar
function toolbar_html($xmlControl,$strControlName)
{
	global $portal;
	//-- get bar and js function handle to use
	$oTBar = $xmlControl->document_element();
	$jsHandle = $oTBar->get_attribute("handler");
	//$strID = $oTBar->get_attribute("id");
	
	$strMenuHTML = "";
	$strHTML = "<div class='toolbar' id='toolbar_".$strControlName."' name='toolbar_".$strControlName."' controlid='".$strControlName."'>";

	$arrItems = $oTBar->get_elements_by_tagname("item");
	foreach($arrItems as $anItem)
	{
		//-- do we want to show on toolbar menu?
		$strContextItemOnly = $anItem->get_attribute("contextonly");
		if($strContextItemOnly=="1") continue; //-- skip

		
		$strItemID = $anItem->get_attribute("iid");
		if($strItemID=="split")
		{
			//-- a splitter
			//$strHTML .= "<div disabled class='toolbar-split'><table cellspacing='0' cellpadding='0'><tr><td style='font-size:16px;' disabled>|</td></tr></table></div>";
			$strHTML .= "<div class='toolbar-split'></div>";
		}
		else
		{
			$strItemImgPath = $anItem->get_attribute("imgpath");
			if($strItemImgPath=="") $strItemImgPath=$portal->root_path . "client/workspace/_controls/toolbar/toolbarimages/";

			//-- get image info
			$boolImg=true;
			$strItemImg = $anItem->get_attribute("img");
			if($strItemImg=="")	$boolImg=false;
			$strItemImg = $strItemImgPath .$strItemImg;

			$strHasDisableImg = $anItem->get_attribute("imgdis");			
			if($strHasDisableImg!="")$strHasDisableImg = $strItemImgPath . $strHasDisableImg;

			$strFlagDisabled = $anItem->get_attribute("disabled");
			$strFlagHidden = $anItem->get_attribute("hidden");


			$strGrp = $anItem->get_attribute("grp");
			$strFlagStick = ($strGrp!="")?"1":"0";
			$strDisabled=($strFlagDisabled=="1")?"disabled='disabled'":"";
			$strClass=($strFlagDisabled=="1")?"toolbar-item-disable":"toolbar-item";
			$strHiddenStyle = ($strFlagHidden=="1")?"style='display:none;'":"";

			$strToolTip = $anItem->get_attribute("tooltip"); //-- tooltip
			$strButton = $anItem->get_attribute("button"); //-- should it be displayed like a button
			if($strButton=="1")$strClass = "toolbar-button";

			//-- get type (menu or nothing)
			$strItemType = $anItem->get_attribute("type");
			if($strItemType=="menu")
			{
				//-- get text which is in label
				$label = swxml_childnode($anItem,"label");
				$strText = $label->get_content();
				$mnuHandle = $anItem->get_attribute("mnuhandler");
				//-- get menu items and create html
				$strMenuHTML .= create_menu("tbi_".$strItemID,swxml_childnodes($anItem,"mitem"), $mnuHandle, $anItem);
			}
			else
			{
				//-- normal toolbar button
				$strText = $anItem->get_content();
			}


			//-- show additional dropdown arrow - for alt menu
			$strEnhancedImgHTML = "";
			$strEnhancedMenuLoader = "";
			$intEnhanced = $anItem->get_attribute("enhanced");
			if($intEnhanced=="1")
			{
				$strEnhancedImgHTML = "<td enhancedmenu='1'><div enhancedmenu='1' style='position:relative;'>&nbsp;<img enhancedmenu='1' style='position:relative;top:2px;' src='".$portal->root_path ."client/workspace/_controls/toolbar/menuimages/arr_down.gif'></div></td>";
				$strEnhancedMenuLoader = $anItem->get_attribute("jsenchancedloader");
			}

			//-- do we want to show text (may only want it for context menu)
			$strShowToolbarText = $anItem->get_attribute("toolbartext");
			if($strShowToolbarText=="0") 
			{
				if($strToolTip=="")
				{
					$strToolTip = trim($strText);
				}
				$strText = "";
			}

			if($strText!="")
			{
				if($strEnhancedImgHTML!="")$strText .="&nbsp;";
				$strText = "<td height='16px'>&nbsp;".$strText."</td>";
			}
			$strImgHTML = ($boolImg)?"<td align='middle'><img src='".$strItemImg."'></td>":"";
			//echo $jsHandle;
			$strHTML .= "<div disimg='".$strHasDisableImg."' id='tbi_".$strItemID."' enhanced='".$intEnhanced."' enhancedmenuloader='".$strEnhancedMenuLoader."' btn='".$strButton."' pid='".$strControlName."' $strDisabled   class='".$strClass."' ".$strHiddenStyle." btntype='".$strItemType."' checkgrp='".$strGrp."' stick='".$strFlagStick."' checked='0' onMouseUp='app.toolbar_mouseup(this,event);' onMouseOver='app.toolbar_mouseover(this, event);' onMouseOut='app.toolbar_mouseout(this, event);' onMouseDown='app.toolbar_mousedown(this,event);' onClick='if(this.className!=\"toolbar-item-disable\"){app.toolbar_check_btn_type(this,true);if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\");}}'><table border='0' height='100%' cellspacing='0' cellpadding='0' align='center'><tr title='".$strToolTip."'>".$strImgHTML."".$strText."".$strEnhancedImgHTML."</tr></table></div>";
		}
	}

	$strHTML .= "</div>";

	//-- check if we want context menu
	$strHoverHTML = "";
	if($oTBar->get_attribute("enablecontextmenu")=="1")	
	{
		$strHoverHTML .=  toolbar_html_contextmenu($xmlControl,$strControlName);
	}
	global $arrDropMenus;
	if(isset($arrDropMenus))
	{
		//-- running in workspace
		$arrDropMenus[]= $strMenuHTML . $strHoverHTML;
	    return $strHTML;
	}
	else
	{
	    return $strHTML . $strMenuHTML . $strHoverHTML;
	}

}

function toolbar_html_contextmenu($xmlControl,$strControlID)
{
	global $portal;

	$oTBar = $xmlControl->document_element();
	$jsHandle = $oTBar->get_attribute("handler");
	$jsOnDrawHandle = $oTBar->get_attribute("contextmenuondraw");

	$strHTML = "<div id='contextmnu_".$strControlID."' ondraw='".$jsOnDrawHandle."' pid='".$strControlID."' class='menu-holder'><table cellspacing='0' cellpadding='0' border='0'>";

	$xmlItems = $oTBar->get_elements_by_tagname("item");
	foreach($xmlItems as $pos => $xmlNode)
	{
		//-- do we want to show on context menu?
		$strToolbarItemOnly = $xmlNode->get_attribute("toolbaronly");
		if($strToolbarItemOnly=="1") continue; //-- skip

		//-- check if this menu item has children - if so create html
		$strItemID = $xmlNode->get_attribute("iid");

		if($strItemID=="split")
		{
			//-- a splitter
			$strHTML .= "<tr class='mnu-row-split' disabled><td><div class='mnu-icon'></div></td><td colspan='2' align='middle'><div class='mnu-splitter' disabled></div></td><td></td></tr>";	
		}
		else
		{
			$strItemImgPath = $xmlNode->get_attribute("imgpath");
			if($strItemImgPath=="") $strItemImgPath=$portal->root_path . "client/workspace/_controls/toolbar/toolbarimages/";

			//-- get image info
			$boolImg=true;
			$strItemImgClass = $xmlNode->get_attribute("imgclass");
			$strItemImg = $xmlNode->get_attribute("img");
			if($strItemImg=="")	$boolImg=false;
			$strItemImg = $strItemImgPath .$strItemImg;

			$strHasDisableImg = $xmlNode->get_attribute("imgdis");			
			if($strHasDisableImg!="")$strHasDisableImg = $strItemImgPath . $strHasDisableImg;


			//-- check if has children
			$boolChildren = false;
			$strItemType = $xmlNode->get_attribute("type");
			if($strItemType=="menu")
			{
				//-- get text which is in label
				$label = swxml_childnode($xmlNode,"label");
				$strText = $label->get_content();

				//-- get menu items and create html
				$mnuHandle = $xmlNode->get_attribute("mnuhandler");
				$handler = ($mnuHandle!="")?$mnuHandle:$jsHandle;
				$strMenuHTML .= create_menu("mnu_".$strItemID,swxml_childnodes($xmlNode,"mitem"),$handler,$xmlNode);
				$boolChildren = true;
			}
			else
			{
				$strText = $xmlNode->get_content();
			}

			//-- set child class
			$strChildClass=($boolChildren)?"mnu-child":"mnu-nochild";
			//-- set img class
			if($strItemImgClass=="")$strItemImgClass="mnu-icon";
			$strImgHTML = ($boolImg)?"<img src='".$strItemImg."'>":"";

			//-- menu item html
			$strHTML .= "<tr id='contextmnu_".$strItemID."' pid='".$strControlID."' context='1' mnutype='".$strItemType."' disimg='".$strHasDisableImg."'  onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onmousedown='if(app.contextmenu_item_mousedown(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\",event);}}'><td><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td align='left'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";
		}
	}//-- eof for


	$strHTML .= "</table></div>";
	return $strHTML;
}


?>