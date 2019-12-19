<?php

	//-- will do security check
	if(!@$boolWebclientSessionFileLoaded)include_once('../../../php/session.php');


	function _swc_activepage_mes($appid,$strControlName)
	{
		return "<iframe src='../blank.htm' class='activepage' id='iform_".$strControlName."' name='iform_".$strControlName."' onload='try{top._swc_check_document_hrefs(this);}catch(e){}' onreadystatechange='try{top._swc_check_document_hrefs(this);}catch(e){}' src='' frameborder='0'></iframe>";
	}

	function _swc_activepage_callsearch()
	{
		return "<iframe src='../blank.htm' class='activepage' id='iform_".$strControlName."' name='iform_".$strControlName."' onload='try{top._swc_check_document_hrefs(this);}catch(e){}' onreadystatechange='try{top._swc_check_document_hrefs(this);}catch(e){}' src='' frameborder='0' style='width:100%;height:100%;'></iframe>";
	}

	function _swc_systempage_calendar($appid,$strControlName,$strControlType)
	{
		
		$iName = strToLower("iform_".$strControlType."_".$strControlName);
		return "<iframe  id='".$iName."' name='".$iName."' onload='try{top._swc_check_document_hrefs(this);}catch(e){}' onreadystatechange='try{top._swc_check_document_hrefs(this);}catch(e){}' src='_views/calendar/calendar.php' frameborder='0' style='width:100%;height:100%;'></iframe>";
	}

	function _swc_systempage_mail($appid,$strControlName,$strControlType)
	{
		$iName = strToLower("iform_".$strControlType."_".$strControlName);
		return "<iframe  src='../blank.htm' class='activepage' id='".$iName."' name='".$iName."' onload='try{top._swc_check_document_hrefs(this);}catch(e){}' onreadystatechange='try{top._swc_check_document_hrefs(this);}catch(e){}' src='_views/mail/mailpreview.php' frameborder='0' style='width:100%;height:100%;'></iframe>";
	}

	function _swc_systempage_reports($appid,$strControlName,$strControlType)
	{
		$iName = strToLower("iform_swreports");
		return "<iframe  src='../blank.htm' class='activepage notopborder' id='".$iName."' name='".$iName."' onload='try{top._swc_check_document_hrefs(this);}catch(e){}' onreadystatechange='try{top._swc_check_document_hrefs(this);}catch(e){}' src='_views/reports/reports.php' frameborder='0' style='width:100%;height:100%;'></iframe>";
	}


	function _swc_systempage_knowledgebase($appid,$strControlName,$strControlType)
	{
		$iName = strToLower("iform_".$strControlType."_".$strControlName);
		return "<iframe  src='../blank.htm'  class='activepage' id='".$iName."' name='".$iName."' onload='try{top._swc_check_document_hrefs(this);}catch(e){}' onreadystatechange='try{top._swc_check_document_hrefs(this);}catch(e){}' src='_views/knowledgebase/kbasepreview.php' frameborder='0' style='width:100%;height:100%;'></iframe>";
	}
	
	function _swc_systemtable($appid,$strControlName,$strControlType)
	{
		global $portal;

		//-- get contents and generate workspace view
		$strFileName = $portal->fs_workspace_path . "_views/".$strControlType."/datatable.xml";
		$xmlfp = file_get_contents($strFileName);
		if(!$xmlfp)
		{
			return "Error : Could not load system table xml. Please contact your administrator."; 
		}

		//-- open as xmldom - get xmlnode by custoemr id
		$xmlDoc = domxml_open_mem($xmlfp);	

		return dhtml_table($strControlName, $xmlDoc, "mes", "top");
	}



	function _swc_toolbar($appid,$strControlName,$strControlType)
	{
		global $portal;
		//-- get contents and generate workspace view
		$strFileName = $portal->fs_workspace_path . "_views/".$strControlType."/toolbar.xml";
		$xmlfp = file_get_contents($strFileName);
		if(!$xmlfp)
		{
			return "Error : Could not load toolbar definition. Please contact your administrator."; 
		}

		//-- open as xmldom - get xmlnode by custoemr id
		$xmlDoc = domxml_open_mem($xmlfp);	
		
		return toolbar_html($xmlDoc,$strControlName);

	}

	//-- helpdesk view
	function _swc_helpdesk_top($appid,$strControlName)
	{
		return _swc_helpdesk($appid,$strControlName,"top");
	}

	function _swc_helpdesk_bottom($appid,$strControlName,$strPos)
	{
		return 	_swc_helpdesk($appid,$strControlName,"bottom");
	}


	function _swc_helpdesk($appid,$strControlName,$strPos)
	{
		global $portal;

		//-- check for custom view
		$strFileName = $portal->fs_application_path . "_customisation/xml/globalparams/Global Parameters.xml";
		if(!file_exists($strFileName))
		{
			//-- get contents and generate workspace view
			$strFileName = $portal->fs_application_path . "xml/globalparams/Global Parameters.xml";
		}
		
		$xmlfp = file_get_contents($strFileName);
		if(!$xmlfp)
		{ 
			return "Error : Could not load global parameters xml. Please contact your administrator."; 
		}

		$xmlDoc = domxml_open_mem($xmlfp);	
		//-- get helpdesk xml object
		$xmlHelpdeskItems = swxml_helpdesk_view($xmlDoc, $strControlName, $strPos);

		$strHTML = "";
		if($xmlHelpdeskItems!=null)
		{
			$strTabItemsHtml = "";
			$strTabItemSpaceHtml  = "";
			$x=0;
			foreach($xmlHelpdeskItems as $aTabItem)
			{
				//-- are we showing this one
				$strShow = swxml_gparams_value($aTabItem,"visible");
				if(strToLower($strShow)!="yes") continue;

				$strName = swxml_childnode_content($aTabItem,"name");
				$strParamName = $strPos."/".$strName;
				$strName = str_replace(" ","_",$strName);
				$strClass = ($x==0)?"tabitem-selected":"tabitem";
				$strDisplay = swxml_gparams_value($aTabItem,"TabName");

				$strTiWorkspaceHtml = _swc_helpdesk_table($strName,$aTabItem, $strControlName, $strPos);

				//-- tab item
				$strTabItemsHtml .= "<span id='ti_" .$strName. "' class='" . $strClass . "' gparam='".$strParamName."' control='datatable:".$strName."' onmouseover='app.hilite_tabitem(this,event);' onmouseout='app.lolite_tabitem(this,event);' onclick='app.select_tabitem(this, event);'>".$strDisplay."</span>";
				
				//-- tab item content
				$strWorkspaceClass = ($x==0)?"tab-item-workspace-selected":"tab-item-workspace";
				$strTabItemSpaceHtml .= "<div id='tispace_ti_".$strName."' tiname='ti_".$strName."' class='".$strWorkspaceClass."'>".$strTiWorkspaceHtml."</div>";
				
				$x++;
			}
			$strHTML = "<table class='tabcontrol' id='".$strControlName."' border='0' resizeme='1' controltype='tabcontrol-holder'><tr><td><div id='itemholder' class='tabitemsholder'>".$strTabItemsHtml."</div></td></tr><tr><td height='100%'><div id='tabspace' class='tabspaceholder'>".$strTabItemSpaceHtml."</div></td></tr></table>";
		}
		return $strHTML;

	}

	function _swc_helpdesk_table($strControlName, &$xmlHelpdeskTab,$strParentControlName,$strPos = "top")
	{
		$oXmlTable = swxml_helpdesk_table($strControlName, $xmlHelpdeskTab,$strParentControlName,$strPos);
		return dhtml_table($strControlName,$oXmlTable,"hd",$strPos);
	}

	//-- 

	//-- search for calls results table
	function _swc_table_callsearch($appid,$strControlName)
	{
		global $portal;

		//-- check for custom view
		$strFileName = $portal->fs_application_path . "_customisation/xml/globalparams/Global Parameters.xml";
		if(!file_exists($strFileName))
		{
			//-- get contents and generate workspace view
			$strFileName = $portal->fs_application_path . "xml/globalparams/Global Parameters.xml";
		}

		$xmlfp = file_get_contents($strFileName);
		if(!$xmlfp)
		{
			return "Error : Could not load call search datatable xml from global parameters. Please contact your administrator."; 
		}
		$xmlDoc = domxml_open_mem($xmlfp);	
		if($xmlDoc)
		{
			$xmlSFC = swxml_view($xmlDoc, $strControlName);
			$xmlTable = swxml_sfc_table($xmlSFC,$strControlName);
			return dhtml_table($strControlName,$xmlTable,"mes");
		}
		else
		{
			return "Error : There was a parse error processing the table xml. Please contact your Administrator";
		}
	}
	
	//-- managed entity search results table
	function _swc_table_mes($appid,$strControlName)
	{
		global $portal;

		//-- get contents and generate workspace view
		$strFileName = $portal->fs_application_path . "xml/dbevs/Database Entity Views.xml";
		$xmlfp = file_get_contents($strFileName);
		if(!$xmlfp)
		{
			return "Error : Could not load database entity view xml. Please contact your administrator."; 
		}

		//-- open as xmldom - get xmlnode by custoemr id
		$xmlMES = null;
		$xmlDoc = domxml_open_mem($xmlfp);	
		$arrNodes = $xmlDoc->get_elements_by_tagname('dbev');
		foreach ($arrNodes as $aNode)
		{
			$nodeName = swxml_childnode($aNode,"name");
			if ( (strToLower($nodeName->tagname)=="name") && (strToLower($nodeName->get_content()) == strToLower($strControlName)) )
			{
				$xmlMES = $aNode;
				break;
			}
		}

		if($xmlMES==null)
		{
			return "Error : Could not load database entity view (".$strControlName."). Please contact your administrator."; 
		}

		//-- table and cols
		$strTable = swxml_childnode_content($xmlMES,"table");	
		$strTableColumns = swxml_childnode_content($xmlMES,"searchResultColumns");
		$strFilter = swxml_childnode_content($xmlMES,"searchFilter");


		//-- webclient ext
		$oXmlTable = swxml_table_xmldom($strTable, "", $strTableColumns,@$arrFilters,@$strTableColumnWidths, @$strTableColumnAlignments, "","",$strControlName,"no",$strFilter);
		return dhtml_table($strControlName,$oXmlTable,"mes");
	}


?>