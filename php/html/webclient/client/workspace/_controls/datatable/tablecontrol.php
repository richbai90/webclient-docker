<?php

	//-- will do security check
	if(!@$boolWebclientSessionFileLoaded)include_once('../../../../php/session.php');




	function tablecontrol_html($xmlControl,$strControlName,$appid)
	{
		return dhtml_table($strControlName,$xmlControl);
	}

	function dhtml_table($strControlName, $xmlControl, $strType = "mes", $strPos = "top")
	{
		//-- table class - differs if a mes
		$strDivClass = ($strType=="mes")?"dhtml_mes_table_holder":"dhtml_table_holder";
		$strTableHeaderTopClass = ($strType=="mes")?" nobordertop":"";

		//-- if control name has a / in it get last bit for id
		$arrName = explode("/" ,$strControlName);
		if(sizeof($arrName)>0)$strControlName = $arrName[sizeof($arrName)-1];
		
		//-- any related outlookid to refresh on
		$strOutlookID = "";
		$arrOutlookIDs = $xmlControl->get_elements_by_tagname("outlookcontrolid");
		if($arrOutlookIDs)$strOutlookID = $arrOutlookIDs[0]->get_content();

		//-- any related outlookid to refresh on
		$arrOnDataLoaded = $xmlControl->get_elements_by_tagname("ondataloadedjs");
		if($arrOnDataLoaded)$strOnDataLoaded = $arrOnDataLoaded[0]->get_content();

		//-- get anyactive filters or paging
		$strFilters = dhtml_table_filters($xmlControl);
		if($strFilters=="")
		{
			$strFilters = "<div id='table_filters' style='display:none;'></div>";
		}
		else
		{
			$strTableHeaderTopClass = "";
		}
		$intFilters = ($strFilters!="")?1:0;
		$currFilter = ($strFilters!="")?"0":"";

		//-- get table that it is running off
		$arrTableNode = $xmlControl->get_elements_by_tagname("table");
		if(@$arrTableNode[0])
		{
			$boolUsingTable = true;
			$strTableName =$arrTableNode[0]->get_content();
		}
		else
		{
			$boolUsingTable = false;		
			$arrXmlmcNode = $xmlControl->get_elements_by_tagname("xmlmc");
			if(@$arrXmlmcNode[0])
			{
				$strTableName ="xmlmc";
			}
		}
		
		
		//-- get static filter
		$strStaticFilter = "";
		$arrStaticFilterNodes = $xmlControl->get_elements_by_tagname("filter");
		if(@$arrStaticFilterNodes[0])$strStaticFilter =$arrStaticFilterNodes[0]->get_content();

		$intRowsPerPage = "";
		$xmlRPP = $xmlControl->get_elements_by_tagname("rowsperpage");
		if(@$xmlRPP[0])$intRowsPerPage=$xmlRPP[0]->get_content();

		$arrTableNodes = $xmlControl->get_elements_by_tagname("datatable");
		$xmlTableNode = @$arrTableNodes[0];
		$intDragDrop = $xmlTableNode->get_attribute("draganddrop");

		$strHTML = '<div class="'.$strDivClass.'" id="'.$strControlName.'" draganddrop="'.$intDragDrop.'" page="1" rpp="'.$intRowsPerPage.'" dbtablename="'.$strTableName.'" outlookid="'.$strOutlookID.'" tablepos="'.$strPos.'" staticfilter="'.$strStaticFilter.'" selectedfilter="'.$currFilter.'" hasfilters="'.$intFilters.'" ondataloaded="'.$strOnDataLoaded.'" resizeme="1" controltype="datatable-holder">';
		$strHTML .= $strFilters;
		$strHTML .= "<div id='table_columns' class='dhtml_table_header".$strTableHeaderTopClass."'>";
		$strHTML .= dhtml_table_headers($xmlControl,$strType);
		$strHTML .= "</div>";
		$strHTML .= "<div id='div_data' class='dhtml_div_data'  parentholderid='".$strControlName."' outlookid='".$strOutlookID."' onkeydown='app.datatable_keydown(this,event);' onkeyup='app.datatable_keyup(this,event);'  onmousedown='app.datatable_contextmenu(this, event);'  onScroll='app.datatable_scroll(this,event);'></div>";
		$strHTML .= '</div>';

		//-- context menu?
		$xmlMenu = $xmlControl->get_elements_by_tagname("contextmenu");
		if(@$xmlMenu[0])	
		{
			$strHTML .= html_table_contextmenu($strControlName, $xmlMenu[0]);
		}

		return $strHTML;
	}


	function dhtml_table_filters($xmlControl,$activefilter = -1)
	{
		global $__datatable_activefilter;

		$arrParamNodes = $xmlControl->get_elements_by_tagname("datatable");
		$xmlTableNode = $arrParamNodes[0];

		//-- do we need to show paging control
		$strPagingControl = "";
		$intRowsPerPage = swxml_childnode_content($xmlTableNode,"rowsperpage");
		$intRowsPerHelpdeskPage = swxml_childnode_content($xmlTableNode,"helpdeskPaging");

		if($intRowsPerPage!="")
		{
			$strPagingControl = "<table cellspacing='1' cellpadding='0' border='0'><tr><td class='paging_start' onclick='app._email_page_start(this);'></td><td class='paging_left' onclick='app._email_page_left(this);'></td><td class='paging_text'>Page # of #</td><td class='paging_right' onclick='app._email_page_right(this);'></td><td class='paging_end' onclick='app._email_page_end(this);'></td></tr></table>";
		}
		else if($intRowsPerHelpdeskPage!="")
		{
			$strPagingControl = "<table cellspacing='1' cellpadding='0' border='0'><tr><td class='paging_start' onclick='app._helpdesk_page_start(this);'></td><td class='paging_left' onclick='app._helpdesk_page_prev(this);'></td><td class='paging_text'>Page # of #</td><td class='paging_right' onclick='app._helpdesk_page_next(this);'></td><td class='paging_end' onclick='app._helpdesk_page_end(this);'></td></tr></table>";
		}


		$arrFilterNodes = $xmlTableNode->get_elements_by_tagname("iafilter");
		$strFilters = "";
		foreach($arrFilterNodes as $pos => $aNode)
		{
			$arrItems = $aNode->get_elements_by_tagname("listitem");
			if(count($arrItems)<1) continue;

			$strLabel = swxml_childnode_content($aNode, "label");
			$strFilters .= "<span class='dtable_filter_lbl'>".$strLabel."</span>"; 
			$strFilters .= "<select id='dtable_select_filter' class='dtable_filter_lb' onchange='app.datatable_interactivefilter(this,event);'>";
			
			foreach($arrItems as $xpos => $aItem)
			{
				$strLabel = swxml_childnode_content($aItem, "label");
				//$strFilter = swxml_childnode_content($aItem, "applyfilter");
				$strFilters .= '<option>'.$strLabel.'</option>';
			}
			$strFilters .= "</select>";
		}

		$strHTML="";
		if($strFilters!="" || $strPagingControl!="")
		{
			$strHTML = "<div id='table_filters' class='dhtml_table_filters' >";
			$strHTML .= "<table cellspacing='0' cellpadding='0' border='0' width='100%'><tr><td align='left' valign='middle' noWrap width='50%' style='display:none;'>".$strPagingControl."</td><td align='right'>".$strFilters."</td></tr></table></div>";
		}

		return $strHTML;
	}

	function dhtml_table_headers($xmlControl, $strType="")
	{
		$arrParamNodes = $xmlControl->get_elements_by_tagname("datatable");
		$xmlTableNode = $arrParamNodes[0];

		//-- get column headers
		$strSelectColumns = swxml_childnode_content($xmlTableNode, "header");
		$arrColumns = explode(",",$strSelectColumns);

		//-- see if we have overiding header titles
		$strTitleColumns = swxml_childnode_content($xmlTableNode, "headertitle");
		if($strTitleColumns!="")
		{
			$arrTitleColumns = explode(",",$strTitleColumns);
		}

		//-- get col widths 
		$strWidths = swxml_childnode_content($xmlTableNode, "columnwidth");
		$arrColWidths = explode(",",$strWidths);

		//-- get col align
		$strAlign = swxml_childnode_content($xmlTableNode, "columnalignment");
		$arrColAlign = explode(",",$strAlign);

		//-- get table that it is running off
		$arrTableNode = $xmlControl->get_elements_by_tagname("table");
		$strTableName = "";
		if(@$arrTableNode[0])
		{
			$strTableName =$arrTableNode[0]->get_content();
		}
		
		if($strTableName=="watchcalls")$strTableName="opencall";

		$strColumns = "";
		$iTableWidth = 0;
		foreach($arrColumns as $pos => $colName)
		{
			$swColClass = "";
			if(isSet($arrTitleColumns))
			{
				$swColName = $arrTitleColumns[$pos];
				$arrColType = explode(":",$swColName);
				if($arrColType[0]=="CSS")
				{
					$swColName = "";
					$swColClass = $arrColType[1];
				}
			}
			else
			{
				$arrColName = explode("." ,$colName);
				if(sizeof($arrColName)==1)
				{
					$swColName = swdti_getcoldispname(trim($strTableName).".".trim($colName));
				}
				else
				{
					$swColName = swdti_getcoldispname(trim($colName));
				}
			}

			$pxWidth = @$arrColWidths[$pos];
			$strAlign = @$arrColAlign[$pos];
			if($pxWidth=="")$pxWidth = 150;
			$iTableWidth +=$pxWidth;
			$strColumns .= "<td width='".$pxWidth."px' style='width:".$pxWidth."px;' type='".$strType."' align='".$strAlign."' dbname='".trim($colName)."' noWrap><div style='width:100%;' class='".$swColClass."'>".trim($swColName)."</div></td>";
		}
		//$strColumns .= "<td class='dhtml_table_header_etd'  style='width:20px' noWrap>&nbsp;</td>";
		return "<table border='0' onmousedown='app.datatable_start_resize_header(event,document);' onmouseup='app.datatable_mouseup_header(event,document);' onmousemove='app.datatable_set_cusor(event,document);' style='width:".$iTableWidth."px;table-layout:fixed;border-collapse:collapse;' cellspacing='0'><tr>".$strColumns."<td></td></tr></table>";
	
	}

	function html_table_contextmenu($strControlID,$xmlMenuNode,$jsHandle = "", $parentXML = null)//($strControlID, $xmlControl)
	{
		return "";
		if($jsHandle=="")
		{
			$jsHandle = $xmlMenuNode->get_attribute("mnuhandler");
			if($jsHandle=="")$jsHandle="app.doesnotexist";
		}
	
		$xmlItems = swxml_childnodes($xmlMenuNode,"mitem");

		$jsOnDrawHandle = $xmlMenuNode->get_attribute("ondraw");
			

		$strHTML = "<div id='contextmnu_".$strControlID."' pid='".$strControlID."' ondraw='".$jsOnDrawHandle."' class='menu-holder'><table cellspacing='0' cellpadding='0' border='0'>";
		foreach($xmlItems as $pos => $xmlNode)
		{
			//-- check if this menu item has children - if so create html
			$strItemID = $xmlNode->get_attribute("iid");
			if($strItemID=="split")
			{
				//-- a splitter
				//$strHTML .= "<tr class='mnu-row-split'><td><div class='mnu-icon'></div></td><td colspan='2' align='middle'><div class='mnu-splitter'></div></td><td></td></tr>";
				$strHTML .= "";
			}
			else
			{

				$strItemImgPath = $xmlNode->get_attribute("imgpath");
				if($strItemImgPath=="") $strItemImgPath="controls/toolbar/toolbarimages/";

				//-- get image info
				$boolImg=true;
				$strItemImgClass = $xmlNode->get_attribute("imgclass");
				$strItemImg = $xmlNode->get_attribute("img");
				if($strItemImg=="")	$boolImg=false;
				$strItemImg = $strItemImgPath .$strItemImg;

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
				$strHTML .= "<tr id='contextmnu_".$strItemID."' pid='".$strControlID."' context='1' mnutype='".$strItemType."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onmousedown='if(app.contextmenu_item_mousedown(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\",event);}}'><td><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";
			}
		}//-- eof for

		//-- check if we have a method to call which will add menu items
		if($parentXML!=null)
		{
			$funcItemLoader =$parentXML->get_attribute("itemloader");
			if($funcItemLoader!="") 
			{
				$strHTML .= $funcItemLoader($strControlID,$jsHandle);
			}
		}

		$strHTML .= "</table></div>";
		return $strHTML;
	}

?>



	

