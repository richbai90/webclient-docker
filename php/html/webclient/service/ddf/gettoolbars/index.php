<?php

	//-- v1.0.0
	//-- ddf/getschemalabels

	//-- get schema xml for application and return list of labels per binding
	//-- includes
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');

//-- create menu item div for toolbar item
function create_menu($strParentID,$xmlItems,$jsHandle, $parentXML)
{
	global $portal;

	$strMenuHTML = "";
	if($jsHandle=="")$jsHandle = "app.doesnotexist";

	$strHTML = "<div id='mnu_".$strParentID."' pid='".$strParentID."' class='menu-holder'><table cellspacing='0' id='mnu_tbl_".$strParentID."' cellpadding='0' border='0'>";
	foreach($xmlItems as $pos => $xmlNode)
	{
		//-- check if this menu item has children - if so create html
		$strItemID = $xmlNode->get_attribute("iid");
		if($strItemID=="split")
		{
			//-- a splitter
			$strHTML .= "<tr disabled class='mnu-row-split'><td><div class='mnu-icon'></div></td><td colspan='2' align='middle'><div class='mnu-splitter' disabled></div></td><td></td></tr>";
			//$strHTML .="";
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

			$strRowClass = "";
			$iDisable = $xmlNode->get_attribute("disabled");
			if($iDisable =="1")$strRowClass = "mnu-disabled";

			//-- set child class
			$strChildClass=($boolChildren)?"mnu-child":"mnu-nochild";
			//-- set img class
			if($strItemImgClass=="")$strItemImgClass="mnu-icon";
			$strImgHTML = ($boolImg)?"<img src='".$strItemImg."'>":"";

			//-- menu item html
			$strHTML .= "<tr id='mnu_".$strItemID."' $strRowClass pid='".$strParentID."'  disimg='".$strHasDisableImg."'  mnutype='".$strItemType."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(this.className!=\"mnu-disabled\"){if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\",event);}}}'><td><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";
		}
	} //-- eof for

	//-- check if we have a method to call which will add menu items
	$funcItemLoader =$parentXML->get_attribute("itemloader");
	if($funcItemLoader!="") 
	{
		$strHTML .= $funcItemLoader($strParentID,$jsHandle);
	}

	$strHTML .= "</table></div>";
	return $strHTML . $strMenuHTML;
}

//-- draw out toolbar
function toolbar_html($oTBar,$strControlName)
{
	global $portal;
	//-- get bar and js function handle to use
	$jsHandle = $oTBar->get_attribute("handler");
	//$strID = $oTBar->get_attribute("id");

	$strMenuHTML = "";
	$strHTML = "<div class='toolbar' id='toolbar_".$strControlName."' name='toolbar_".$strControlName."'>";

	$arrItems = $oTBar->get_elements_by_tagname("item");
	foreach($arrItems as $anItem)
	{
		$strItemID = $anItem->get_attribute("iid");
		if($strItemID=="split")
		{
			//-- a splitter
			//$strHTML .= "<div class='toolbar-split'><table cellspacing='0' cellpadding='0'><tr><td disabled>|</td></tr></table></div>";
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
			$strGrp = $anItem->get_attribute("grp");
			$strFlagStick = ($strGrp!="")?"1":"0";
			$strDisabled=($strFlagDisabled=="1")?"disabled='disabled'":"";
			$strClass=($strFlagDisabled=="1")?"toolbar-item-disable":"toolbar-item";

			$strToolTip = $anItem->get_attribute("tooltip"); //-- tooltip

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
					$strToolTip = $strText;
				}
				$strText = " ";
			}


			if($strText!="")
			{
				if($strText==".")
				{
					$strText = "<td></td>";
				}
				else
				{
					if($strEnhancedImgHTML!="")$strText .="&nbsp;";
					$strText = "<td>&nbsp;".$strText."</td>";
				}
			}
			$strImgHTML = ($boolImg)?"<td><img src='".$strItemImg."'></td>":"";
			$strHTML .= "<div id='tbi_".$strItemID."' pid='".$strControlName."' enhanced='".$intEnhanced."' enhancedmenuloader='".$strEnhancedMenuLoader."' disimg='".$strHasDisableImg."'  $strDisabled class='".$strClass."' btntype='".$strItemType."' checkgrp='".$strGrp."' stick='".$strFlagStick."' checked='0' onMouseOver='app.toolbar_mouseover(this, event);' onMouseOut='app.toolbar_mouseout(this, event);' onMouseDown='app.toolbar_mousedown(this,event);' onClick='if(this.className!=\"toolbar-item-disable\"){app.toolbar_check_btn_type(this,true);if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\");}}'><table cellspacing='0' cellpadding='0'><tr title='".$strToolTip."'>".$strImgHTML."".$strText."".$strEnhancedImgHTML."</tr></table></div>";
		}
	}

	$strHTML .= "</div>";
    return $strHTML . $strMenuHTML;
}



	$strFileName = $portal->fs_root_path . "client/forms/_system/toolbars.xml";
	$xmlfp = file_get_contents($strFileName);
	if(!$xmlfp)
	{
		echo "";
		exit;
	}
	else
	{
		$strHTML ="";
		$xmlDoc = domxml_open_mem($xmlfp);
		$arrToolbars = $xmlDoc->get_elements_by_tagname("toolbar");
		foreach($arrToolbars as $apos => $xmlToolbar)
		{
			if($strHTML!="")$strHTML.= "_sw2split_";
			$strID = $xmlToolbar->get_attribute("id");
			$strHTML .= $strID."_swsplit_".toolbar_html($xmlToolbar,$strID);
		}
		echo trim($strHTML);
		exit;
	}
?>