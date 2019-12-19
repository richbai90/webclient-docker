<?php

		//-- will do security check
	if(!@$boolWebclientSessionFileLoaded)include_once('../../../../php/session.php');
	


	function tabcontrol_html($xmlControl,$strControlName,$appid)
	{
		$strTabItemsHtml = "";
		$strTabItemSpaceHtml = "";
		$strHTML = "";
		if(!isset($xmlControl)) return "";

		$x=0;
		$arrTabItemNodes = $xmlControl->get_elements_by_tagname("tabitem");
		foreach ($arrTabItemNodes as $aTabItem)
		{	
			$strName = swxml_childnode_content($aTabItem,"name");
			$strDisplay = swxml_childnode_content($aTabItem,"display");

			$strControlType = swxml_childnode_content($aTabItem,"controltype");
			$strControlName = swxml_childnode_content($aTabItem,"controlname");

			$strSclass = ($x==0)?"tabitem-selected":"tabitem";
			$strTabItemsHtml .= "<span id='" .$strName. "' class='" . $strSclass . "' control='" .$strControlType.":".$strControlName."' onmouseover='app.hilite_tabitem(this,event);' onmouseout='app.lolite_tabitem(this,event);' onclick='app.select_tabitem(this, event);'>".$strDisplay."</span>";


			//-- get tab item html layout
			$strTiWorkspaceHtml = process_control_html($appid,$strControlType,$strControlName);
			$strWorkspaceClass = ($x==0)?"tab-item-workspace-selected":"tab-item-workspace";
			$strTabItemSpaceHtml .= "<div id='tispace_".$strName."' tiname='".$strName."' class='".$strWorkspaceClass."'>".$strTiWorkspaceHtml."</div>";
			
			$x++;
		}
		$strHTML = "<table class='tabcontrol' id='".$strControlName."' border='0' resizeme='1' controltype='tabcontrol-holder'><tr><td><div id='itemholder' class='tabitemsholder'>".$strTabItemsHtml."</div></td></tr><tr><td height='100%'><div id='tabspace' class='tabspaceholder'>".$strTabItemSpaceHtml."</div></td></tr></table>";
		//$strHTML = "<div class='tabcontrol' id='".$strControlName."' resizeme='1' controltype='tabcontrol-holder'><div id='itemholder' class='tabitemsholder'>".$strTabItemsHtml."</div><div id='tabspace' class='tabspaceholder'>".$strTabItemSpaceHtml."</div></div>";
		return $strHTML;
	}
?>


