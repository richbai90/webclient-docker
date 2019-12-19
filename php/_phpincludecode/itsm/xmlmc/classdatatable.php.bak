<?php
//--
//-- NWJ - Added checkbox feature - can specify a column as a checkbox and call a oncheck event function
//-- include helpers file if there is one
@include('helpers/custom.datatable.functions.php');
@include('helpers/datatable.functions.php');

class oTableData
{
	var $xmlRoot=null;

	var $columns_url=Array();
	var $columns_checkbox=Array();
	var $columns_checkbox_checkv=Array();
	var $columns_checkbox_disablev=Array();
	var $columns_checkbox_disablephpfunc=Array();
	var $columns_checkbox_jsfunc=Array();
	var $columns_checkbox_jshover=Array();
	var $columns_checkbox_atts=Array();

	var $xmlTooltip = null;
	var $columns_align=Array();
	var $columns_hidden=Array();
	var $columns_convert=Array();
	var $columns_nowrap=Array();
	var $columns_usecontentasvalue=Array();
	var $columns = Array();
	
	var $isWSSM = true;

	var $intEndPageCount = 0;

	function output_data_table($strOrderBy = "", $strSortDir = "asc" , $intFilterByOption = 0, $intStartRow = 1, $intShowRowCount = -1, $strLookFor = "", $strLookIn = "", $tableFileName = "",$strAddFilter = "", $intShowPreview =  true)
	{
		//-- use default or passed in rowcount
		$intDefaultShowRowCount = $this->xmlRoot->get_attribute("rpp");

		//-- F0100082
		$boolInt = regex_match("/^[0-9]+$/",$intShowRowCount);
		$intShowRowCount  = ($intShowRowCount>0 && $boolInt)?$intShowRowCount:$intDefaultShowRowCount;
		//-- nwj - 28.07.2009 - allow to set height of table if need be (mozilla work around)
		$intFixed=getAttribute("fixed",$this->xmlRoot->attributes());

		if($intFixed=="1")
		{
			//--
			//-- height is to be restricted
			//-- nwj - 21.07.2009 - store table xml def name for standalone tables

			$strHeight=getAttribute("height",$this->xmlRoot->attributes()); //- -allow us to specify height and width of the table
			$strWidth=getAttribute("width",$this->xmlRoot->attributes());
			if($strHeight=="")$strHeight="95%";
			if($strWidth=="")$strWidth="100%";

			$strHTML = "<div xmlfile='". encodeHTML($tableFileName)."' id='". encodeHTML($tableFileName)."' totalrows='![table_fullrow_count]!' startrow='".encodeHTML($intStartRow)."' style='position:relative;overflow-x:auto;overflow-y:auto;padding-bottom:20px;width:".$strWidth.";height:".$strHeight.";'>";
		}
		else
		{
			//-- nwj - 21.07.2009 - store table xml def name for standalone tables
			$strHTML = "<div xmlfile='". encodeHTML($tableFileName)."' id='". encodeHTML($tableFileName)."' totalrows='![table_fullrow_count]!' startrow='".encodeHTML($intStartRow)."' style='position:relative;padding-bottom:20px;width:99%;height:95%;'>";
		}

		$strHTML .=	$this->create_table_dropfilter($intFilterByOption,$intStartRow,$intShowRowCount, $strLookFor, $strLookIn, $intShowPreview);
		$strHTML .= "<table class='dataTable' width='100%'>";
		$strHTML .= "	<thead>";
		$strHTML .=			$this->create_table_header($strOrderBy,$strSortDir);
		$strHTML .= "	</thead>";
		$strHTML .= "	<tbody>";
		$strHTML .= 		$this->create_table_data($strOrderBy,$strSortDir,$intFilterByOption ,$strAddFilter, $intStartRow, $intShowRowCount, $strLookFor, $strLookIn, $intShowPreview);
		$strHTML .= "	</tbody>";
		$strHTML .= "	<tfoot>";
		$strHTML .=			$this->create_table_footer();
		$strHTML .= "	</tfoot>";
		$strHTML .= "</table></div>";

		//-- replace html row count
		$strHTML = str_replace('![table_row_count]!',$GLOBALS['table_row_count'],$strHTML);
		$strHTML = str_replace('![table_fullrow_count]!',$GLOBALS['table_fullrow_count'],$strHTML);

		//-- set page row count title
		if($this->intEndPageCount > $GLOBALS['table_fullrow_count'])$this->intEndPageCount = $GLOBALS['table_fullrow_count'];
		$strHTML = str_replace('![table_pagerow_count]!',$this->intEndPageCount,$strHTML);

		unset($GLOBALS['table_row_count']);
		unset($GLOBALS['table_fullrow_count']);

		return $strHTML;
	}

	//-- nwj 30.07.2008 - create paging if we have it
	function create_paging($intStartRow,$intShowRowCount)
	{
		//-- check if rows per page is switched on RPP should be number of rows to show
		$intDefaultShowRowCount = $this->xmlRoot->get_attribute("rpp");
		if($intDefaultShowRowCount=="")return "";

		//-- use default or passed in rows
		$intShowRows  = $intShowRowCount;
		$intEndCount  = $intStartRow + $intShowRows -1;
		$intNextPos = $intEndCount + 1;
		$intPrevPos = $intStartRow - $intShowRows;

		$this->intEndPageCount = $intEndCount;
		if($this->isWSSM)
		{
			$strHTML = "<table cellpadding=0 cellspacing=0><tr><td noWrap>Rows Per Page :&nbsp;</td><td><input id='tbl_rpp' onchange='if(app.dtable_changerpp)app.dtable_changerpp(this);else dtable_changerpp(this);' type='text' size='3' value='".$intShowRows."'></td><td noWrap>&nbsp;&nbsp;&nbsp;<span class='tbl-first' onclick='if(app.dtable_goto)app.dtable_goto(1,this); else dtable_goto(1,this);'>&nbsp;&nbsp;</span>&nbsp;<span class='tbl-prev' onclick='if(app.dtable_goto)app.dtable_goto(".$intPrevPos.",this);else dtable_goto(".$intPrevPos.",this);'>&nbsp;&nbsp;</span></td><td noWrap>&nbsp;".encodeHTML($intStartRow)." to ![table_pagerow_count]! of ![table_fullrow_count]! &nbsp;</td><td noWrap><span class='tbl-next' onclick='if(app.dtable_goto)app.dtable_goto(".$intNextPos.",this); else dtable_goto(".$intNextPos.",this);'>&nbsp;&nbsp;</span>&nbsp;<span class='tbl-last' onclick='if(app.dtable_goto)app.dtable_goto(-9999,this); else dtable_goto(-9999,this);'>&nbsp;&nbsp;</span></td></tr></table>";
		}
		else
		{
			$strHTML = "<table cellpadding=0 cellspacing=0><tr><td noWrap>Rows Per Page :&nbsp;</td><td><input id='tbl_rpp' onchange='if(app.dtable_changerpp)app.dtable_changerpp(this);else dtable_changerpp(this);' type='text' size='3' value='".$intShowRows."'></td><td noWrap>&nbsp;&nbsp;&nbsp;<span class='tbl-first' onclick='if(app.dtable_goto)app.dtable_goto(0,this);else dtable_goto(0,this);'>&nbsp;&nbsp;</span>&nbsp;<span class='tbl-prev' onclick='if(app.dtable_goto)app.dtable_goto(1,this);else dtable_goto(1,this);'>&nbsp;&nbsp;</span></td><td id='tbl_disp' noWrap>&nbsp;".encodeHTML($intStartRow)." to ![table_pagerow_count]! of ![table_fullrow_count]! &nbsp;</td><td noWrap><span class='tbl-next' onclick='if(app.dtable_goto)app.dtable_goto(2,this);else dtable_goto(2,this);'>&nbsp;&nbsp;</span>&nbsp;<span class='tbl-last' onclick='if(app.dtable_goto)app.dtable_goto(3,this);else dtable_goto(3,this);'>&nbsp;&nbsp;</span></td></tr></table>";
		}

		return $strHTML;

	}
	
	//-- djh 03.12.2009 - create show preview option checkbox
	function create_showpreviewoption($intShowPreview)
	{
		$strPreviewToggleHTML = "";
		$xmlpreview = $this->xmlRoot->get_elements_by_tagname("preview");
		if(($xmlpreview)&&($xmlpreview[0]))
		{
			$bShowPreviewOption = getAttribute("showoptional",$xmlpreview[0]->attributes());
			if($bShowPreviewOption!=1)
				return;

			//--90049 remove some whitespace to fit within 1024x768 resolution
			$strPreviewToggleHTML = "<table cellpadding=0 cellspacing=0><tr><td noWrap>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id='showPreview' type='checkbox' onclick='if(app.dtable_togglepreview)app.dtable_togglepreview(this);else dtable_togglepreview(this);' ";
			
			if($intShowPreview==1)
			{
				$strPreviewToggleHTML.= 'checked';
			}
			$strPreviewToggleHTML .= "></td><td noWrap>&nbsp;Show Preview</td></tr></table>";
		}

		return $strPreviewToggleHTML;
	}

	//-- nwj - 21.07.2008 - changed so we can have many drop down filters
	function create_table_dropfilter($activeFilterOption,$intStartRow,$intShowRowCount,$strLookForText,$strLookForInColumn, $intShowPreview)
	{
		//-- creat html for the look for paging code
		$strPagingHTML = $this->create_paging($intStartRow,$intShowRowCount);

		//-- create html to toggle preview lines
		$strPreviewToggleHTML = $this->create_showpreviewoption($intShowPreview);
		
		//-- creat html for the look for code
		$strLookForHTML = $this->create_lookfor($strLookForText,$strLookForInColumn);

		$strHTML = "";
		$count=0;
		$arrFilterItems = explode(",",$activeFilterOption);
		$xmlDropFilters = $this->xmlRoot->get_elements_by_tagname("dropfilter");
		foreach ($xmlDropFilters as $itemPos => $aFilter)
		{
			$strHTML .= $this->create_adropfilter($aFilter,$arrFilterItems[$count]);
			$count++;
		}

		if(($strHTML!="")||($strPagingHTML!=""))
		{
			$strHTML = "<table><tr><td align='left' valign='top'>".$strPagingHTML."</td><td align='left' valign='top' noWrap>".$strPreviewToggleHTML."</td><td width='100%' align='right' valign='top' noWrap>".$strLookForHTML."<table><tr>".$strHTML."</tr></table></td></tr></table>";			

		}
		return $strHTML;
	}

	function create_adropfilter($xmlDropFilter,$activeFilterOption)
	{
			if (!isset($intPHP)) $intPHP=null;


			if($activeFilterOption=="") $activeFilterOption = 0;
			$strHTML = "";
			$strPHP = getAttribute("php",$xmlDropFilter->attributes());
			if($intPHP=="1")
			{
				$strHTML = parse_context_vars($xmlDropFilter->get_content());
			}
			else
			{

				$FilterLabel = "";
				$xmlFilterLabel = $xmlDropFilter->get_elements_by_tagname("label");
				if($xmlFilterLabel && $xmlFilterLabel[0])$FilterLabel = $xmlFilterLabel[0]->get_content();
				if($FilterLabel=="")$FilterLabel = "Filter by : ";

				$xmlDropItems = $xmlDropFilter->get_elements_by_tagname("item");
				if($xmlDropItems)
				{
					$counter=0;
					$strHTML .= "<td align='right' noWrap>";			
					$strHTML .= parse_context_vars($FilterLabel);
					$strHTML .= "</td>";			
					$strHTML .= "<td>";			
					$strHTML .="<select name='dtable_dropdownlb' onChange='dtable_userfilter(this)'>";

					foreach ($xmlDropItems as $itemPos => $anItem)
					{
						$strText = parse_context_vars(getAttribute("label",$anItem->attributes()));
						$strSelected =($counter==$activeFilterOption)?" selected ":"";
						$strHTML .= "<option $strSelected>$strText</option>";
						$counter++;
					}

					$strHTML .="</select>";
					$strHTML .= "</td>";				
				}
			}
			return $strHTML;
	}


	function create_lookfor($strLookForText,$strLookForColumn)
	{
		//-- do we have a look for?
		$intShowLookFor= $this->xmlRoot->get_attribute("lookfor");
		if($intShowLookFor!="1")return "";

		$strColumnOptions = "";

		//-- create lookfor text box and look in dropdown based on visible columns
		$xmlCols = $this->xmlRoot->get_elements_by_tagname("column");
		foreach ($xmlCols as $nodePos => $aCol)
		{
			if($aCol->has_attributes())
			{
				//-- if hidden then dont include
				if(getAttribute("hidden",$aCol->attributes())=="1")continue;
				$visible = true;
				if(getAttribute("accessfunction",$aCol->attributes()))
				{
                    eval("\$visible = ".parse_context_vars(getAttribute("accessfunction",$aCol->attributes())).';');
                }
                if(!$visible)
                {
                    continue;
                }
				else
				{

					$strDBname=getAttribute("id",$aCol->attributes());
					$strAsName=getAttribute("as",$aCol->attributes());

					//-- how to id col in js
					$strIdByName = ($strAsName!="")?$strAsName:$strDBname;

					$strTableName=getAttribute("dbtable",$aCol->attributes());
					$strHeader=parse_context_vars($aCol->get_content());
					if($strHeader=="")
					{
						if($strTableName=="")
						{
							//-- if getting from one table
							$xmlFrom = $this->xmlRoot->get_elements_by_tagname("from");
							$strTables = strToLower(trim($xmlFrom[0]->get_content()));

							if ( (strpos($strTables,",")===false) && (strpos($strTables," as ")===false) )
							{
								$strTableName=$strTables;
							}
						}
						$strHeader = parse_context_vars(get_column_header($strDBname, $strTableName));
					}

					//-- get value to use for column name when searching
					$strSelected = ($strIdByName==$strLookForColumn)?"selected": "";
					$strColumnOptions.="<option value='".$strIdByName."' $strSelected>".$strHeader."</option>";
				}
			}//-- eof if atts			
		}//-- eof for each


		//-- check if we have a preview column
		$xmlpreview = $this->xmlRoot->get_elements_by_tagname("preview");
		if(($xmlpreview)&&($xmlpreview[0]))
		{
			$strSelected = ("__preview_column"==$strLookForColumn)?"selected": "";
			$strColumnOptions.="<option value='__preview_column' $strSelected>Preview Row</option>";
		}

		//-- html to output
		$strHTML = "<table cellpadding=0 cellspacing=0><tr><td noWrap>Look for&nbsp;</td><td><input id='dtable_lookfor' type='text' value='".htmlentities($strLookForText,ENT_QUOTES,'UTF-8')."' title='To clear a look for filter empty this input and tab out.' onchange='if(app.datatable_checklookfor_value)app.datatable_checklookfor_value(this);else datatable_checklookfor_value(this);' class='datatable-lookfor'></td><td noWrap>&nbsp;&nbsp;in&nbsp;</td><td><select id='dtable_lookin' class='datatable-lookin'>".$strColumnOptions."</select></td><td>&nbsp;<span onclick='if(app.dtable_lookfor)app.dtable_lookfor(this);else dtable_lookfor(this);' class='datatable-lookfor-btn' title='Click to look for specified value in given column.'>&nbsp;&nbsp;&nbsp;</span></td></tr></table><br/>";
		return 	$strHTML;
	}


	function create_table_header($strOrderBy,$strSortDir)
	{
		//-- 28.07.2009 - nwj - check if we want to hide headers
		$strDisplayStyle="";
		$xmlCols = $this->xmlRoot->get_elements_by_tagname("columns");
		$intHide = $xmlCols[0]->get_attribute("hide");
		if($intHide=="1")$strDisplayStyle=" style='display:none;'";
		$strHTML = "<tr ".$strDisplayStyle.">";

		//--
		//-- read xml columns and construct header
		$xmlCols = $this->xmlRoot->get_elements_by_tagname("column");

		//-- store xml tooltip node
		$this->xmlTooltip = $this->xmlRoot->get_elements_by_tagname("tooltip");


		//-- check if we want to show the table row count
		if(getAttribute("showrowcount",$this->xmlRoot->attributes())=="1")
		{
			//-- 
			$strHTML .= "<td class='table-rowcount' colspan='".sizeOf($xmlCols)."'>";
			$strHTML .= "&nbsp;Row Count : ![table_row_count]!";
			$strHTML .= "</td>";
			$strHTML .= "</tr>";
			$strHTML .= "<tr>";
		}

		foreach ($xmlCols as $nodePos => $aCol)
		{
			if($aCol->has_attributes())
			{
				$visible = true;
				if(getAttribute("accessfunction",$aCol->attributes()))
				{
                    eval("\$visible = ".parse_context_vars(getAttribute("accessfunction",$aCol->attributes())).';');
                }
                if(!$visible)
                {
                    continue;
                }
				else
				{
					$strDBname=getAttribute("id",$aCol->attributes());
					$strAsName=getAttribute("as",$aCol->attributes());

					//-- how to id col in js
					$strIdByName = ($strAsName!="")?$strAsName:$strDBname;

					$strTableName=getAttribute("dbtable",$aCol->attributes());
					$strAlign=getAttribute("align",$aCol->attributes());
					if($strAlign=="")$strAlign="left";

					$strHidden=(getAttribute("hidden",$aCol->attributes())=="1")?"style='display:none'":"";
					$strNoWrap=(getAttribute("nowrap",$aCol->attributes())=="1")?"noWrap":"";
					$strURL=getAttribute("url",$aCol->attributes());
					$boolCheckBox=(getAttribute("checkbox",$aCol->attributes())=="1")?true:false;

					$strHeader=parse_context_vars($aCol->get_content());

					//-- no header so try get label from dd
					if($strHeader=="")
					{
						if($strTableName=="")
						{
							//-- if getting from one table
							$xmlFrom = $this->xmlRoot->get_elements_by_tagname("from");
							$strTables = strToLower(trim($xmlFrom[0]->get_content()));

							if ( (strpos($strTables,",")===false) && (strpos($strTables," as ")===false) )
							{
								$strTableName=$strTables;
							}
						}
						$strHeader = parse_context_vars(get_column_header($strDBname, $strTableName));
					}

					$this->columns_usecontentasvalue[strToLower($strIdByName)] = (getAttribute("usetextfordbvalue",$aCol->attributes())=="1")?true:false;
					$this->columns_convert[strToLower($strIdByName)] = getAttribute("conversion",$aCol->attributes());
					$this->columns_hidden[strToLower($strIdByName)] = $strHidden;
					$this->columns_align[strToLower($strIdByName)] = $strAlign;
					$this->columns_url[strToLower($strIdByName)] = $strURL;
					$this->columns_nowrap[strToLower($strIdByName)] = $strNoWrap;
					$this->columns_checkbox[strToLower($strIdByName)] = $boolCheckBox;
					$this->columns[strToLower($strIdByName)] = $strHeader;

					//-- set the checked value so we can test data when generating table
					if($boolCheckBox)
					{
						$this->columns_checkbox_checkv[strToLower($strIdByName)] = getAttribute("checkv",$aCol->attributes());
						$this->columns_checkbox_disablev[strToLower($strIdByName)] = getAttribute("disablev",$aCol->attributes());
						$this->columns_checkbox_disablephpfunc[strToLower($strIdByName)] = getAttribute("phpdisablefunc",$aCol->attributes());
						$this->columns_checkbox_jsfunc[strToLower($strIdByName)] = getAttribute("jsfunc",$aCol->attributes());
						$this->columns_checkbox_jshover[strToLower($strIdByName)] = getAttribute("jshover",$aCol->attributes());
						$this->columns_checkbox_atts[strToLower($strIdByName)] = getAttribute("atts",$aCol->attributes());
					}
				
					
					$class="";
					$strCheckOrderCol = ($strTableName=="")?$strIdByName:$strTableName.".".$strIdByName;
					if($strCheckOrderCol==$strOrderBy)
					{
						//-- col matches our order by so set style based on direction
						$class=($strSortDir=="ASC")?"class='dataTable-thead-asc'":"class='dataTable-thead-desc'";
					}

					$strHTML .=	"	<th noWrap onclick='if(app.dtable_sort)app.dtable_sort(this);else dtable_sort(this);' dbname='".$strIdByName."' tablename='".$strTableName."' ".$strHidden." align='".$strAlign."'>".$strHeader."<span ".$class.">&nbsp;&nbsp;&nbsp;&nbsp;</span></th>";
				}
			}
			
		}

		$strHTML .=	"</tr>";
		return $strHTML;
	}


	function create_table_data($strOrderBy = "",$strSortDir = "asc", $activeFilterOption = 0, $strAdditionalWhere = "", $intStartRow = 1, $intShowRowCount = -1, $strLookForConvertedValue = "", $strLookForInColumn = "", $intShowPreview)
	{

		if (!isset($this->columns_checkbox_jshover[strToLower('callref')]))
			$this->columns_checkbox_jshover[strToLower('callref')]=null;
		if (!isset($this->columns_checkbox_jshover[strToLower('callclass')]))
			$this->columns_checkbox_jshover[strToLower('callclass')]=null;
		if (!isset($this->columns_checkbox_jshover[strToLower('itsm_title')]))
			$this->columns_checkbox_jshover[strToLower('itsm_title')]=null;
		if (!isset($this->columns_checkbox_jshover[strToLower('status')]))
			$this->columns_checkbox_jshover[strToLower('status')]=null;
		if (!isset($this->columns_checkbox_jshover[strToLower('priority')]))
			$this->columns_checkbox_jshover[strToLower('priority')]=null;
		if (!isset($this->columns_checkbox_jshover[strToLower('c_rating')]))
			$this->columns_checkbox_jshover[strToLower('c_rating')]=null;
		if (!isset($this->columns_checkbox_jshover[strToLower('logdatex')]))
			$this->columns_checkbox_jshover[strToLower('logdatex')]=null;

		//-- get connection settings
		$strDSN=getAttribute("dsn",$this->xmlRoot->attributes());
		if($strDSN=="syscache")
		{
			$strUID = swcuid();    
			$strPWD = swcpwd();
			$tableODBC = new CSwDbConnection;;
			$boolConnected = $tableODBC->Connect($strDSN,$strUID,$strPWD);
		}
		else if($strDSN=="swdata")
		{
			$strUID = swuid();    
			$strPWD = swpwd();
			$tableODBC = new CSwDbConnection;;
			$boolConnected = $tableODBC->Connect($strDSN,$strUID,$strPWD);
		}else if($strDSN=="swkbase")
		{
			$tableODBC = new CSwKnowldgeBaseAccess;
			$boolConnected = $tableODBC->SwKbCacheConnect();
		}
		else
		{
			//-- expect userid and password in the xml node
			$strUID = getAttribute("uid",$this->xmlRoot->attributes());;    
			$strPWD = getAttribute("pwd",$this->xmlRoot->attributes());
			$tableODBC = new CSwDbConnection;;
			$boolConnected = $tableODBC->Connect($strDSN,$strUID,$strPWD);
		}

		//-- get onclick and dblclick event
		$strKeyVariable=getAttribute("keyvar",$this->xmlRoot->attributes());
		$strKeyCol=getAttribute("keycol",$this->xmlRoot->attributes());

		//-- get pass thru var info (when row clicked or popped open these values will be extracted from row data
		$strPassThruColumns=getAttribute("urlvars",$this->xmlRoot->attributes());


		$strAction=getAttribute("action",$this->xmlRoot->attributes());
		$strDblAction=getAttribute("dblaction",$this->xmlRoot->attributes());
		$strClicked=getAttribute("onrowclick",$this->xmlRoot->attributes());
		$strDblClicked=getAttribute("onrowdblclick",$this->xmlRoot->attributes());
		$strDblClickedParams=getAttribute("onrowdblclickparams",$this->xmlRoot->attributes());

		$strmouseover=getAttribute("onmouseover",$this->xmlRoot->attributes());
		$strmouseout=getAttribute("onmouseout",$this->xmlRoot->attributes());

		$strURL=getAttribute("url",$this->xmlRoot->attributes());
		
		if($strClicked=="")$strClicked="if(app.dtable_row_clicked)app.dtable_row_clicked(this,window);else dtable_row_clicked";
		$strClicked = "onclick='".$strClicked."(this, window);'";

		
		if($strDblClicked=="")$strDblClicked = "if(app.dtable_row_dblclicked)app.dtable_row_dblclicked(this,window".$strDblClickedParams.");else dtable_row_dblclicked";
		if($strDblClickedParams!="")$strDblClickedParams=",".$strDblClickedParams;
		$strDblClicked = "ondblclick='".$strDblClicked."(this,window".$strDblClickedParams.");'";

		if($strmouseover!="")
		{
			$strmouseover = "onmouseover='".$strmouseover."(this,window);'";
		}
		else
		{
			//-- default - highlight row
			$strmouseover = "onmouseover='if(app.dtable_row_highlight)app.dtable_row_highlight(this,window);else dtable_row_highlight(this,window);'";
		}

		if($strmouseout!="")
		{
			$strmouseout = "onmouseout='".$strmouseout."(this,window);'";
		}
		else
		{
			//-- default - lowlight row
			$strmouseout = "onmouseout='if(app.dtable_row_highlight)app.dtable_row_lowlight(this,window);else dtable_row_lowlight(this,window);'";		
		}

		//-- get dsn then construct sql
		//-- run it and get recordset object
		$xmlFrom = $this->xmlRoot->get_elements_by_tagname("from");
		$xmlWhere = $this->get_xml_where_clause();// f0077011
		$xmlOrder = $this->xmlRoot->get_elements_by_tagname("orderby");

		$strFrom = $xmlFrom[0]->get_content();
		$strWhere = $xmlWhere[0]->get_content();

		//-- determine if we have a drop filter (user can filter list via drop down list box - 1st item is added to filter when first drawing)
		$dropFilter = "";
		
		$arrFilterItems = explode(",",$activeFilterOption);
		$xmlDropFilters = $this->xmlRoot->get_elements_by_tagname("dropfilter");
		foreach ($xmlDropFilters as $itemPos => $aFilter)
		{
			$xmlDropItems = $aFilter->get_elements_by_tagname("item");
			$activePos = $arrFilterItems[$itemPos];
			if($activePos=="")$activePos = 0;
			if($xmlDropItems)$dropFilter .= $xmlDropItems[$activePos]->get_content();

		}

		if($strOrderBy!="")
		{
			$strOrder = $strOrderBy . " " . $strSortDir;
		}
		else
		{
			$strOrder = $xmlOrder[0]->get_content();
		}
		
		//--
		//-- read xml columns and construct select
		$strSelect = "";
		$xmlCols = $this->xmlRoot->get_elements_by_tagname("column");
		foreach ($xmlCols as $nodePos => $aCol)
		{
			if($aCol->has_attributes())
			{
				$visible = true;
				if(getAttribute("accessfunction",$aCol->attributes()))
				{
                    eval("\$visible = ".parse_context_vars(getAttribute("accessfunction",$aCol->attributes())).';');
                }
                if(!$visible)
                {
                    continue;
                }
				else
				{
					//-- get col name and as if substitute
					$strAsName=getAttribute("as",$aCol->attributes());
					$strConcat=getAttribute("concat",$aCol->attributes());
					if($strConcat!="")
					{
						$strConcat = $this->concat_conversion($strConcat);
						if($strAsName!="") $strConcat .= " as " . $strAsName;
						if($strSelect!="") $strSelect.=", ";
						$strSelect .= $strConcat;
					}
					else
					{
						//-- get col name and as if substitute
						$strDBname=getAttribute("id",$aCol->attributes());
						if($strAsName!="") $strDBname .= " as " . $strAsName;

						$strDBtable=getAttribute("dbtable",$aCol->attributes());
						if($strSelect!="") $strSelect.=", ";
						if($strDBtable!="")
						{
							$strSelect .= $strDBtable.".".$strDBname;
						}
						else
						{
							$strSelect .= $strDBname;
						}
					}
				}
			}
		}

		//-- nwj - 19.10.2007
		//-- preview column to place below normal row
		$boolPreviewCol=false;
		$xmlpreview = $this->xmlRoot->get_elements_by_tagname("preview");
		if(($xmlpreview)&&($intShowPreview))
		{
			if($intShowPreview>-1)
			{
				$strPreviewDisplayStyle = htmlentities($intShowPreview,ENT_QUOTES,"UTF-8");
			}
			else
			{
				$strVisibleOn=getAttribute("visibleon",$xmlpreview[0]->attributes());
				$strPreviewDisplayStyle = (strToLower($strVisibleOn)=="default")?"1":"0"; //-- to be used for hiding showing preview
			}
			if($strPreviewDisplayStyle)
			{
			
				//--
				//-- only ever one preview
				$xmlpreview=$xmlpreview[0];
				$strType=getAttribute("type",$xmlpreview->attributes());
				if($strType=="column")
				{
					$strConcat=getAttribute("concat",$xmlpreview->attributes());
					if($strConcat!="")
					{
						$strConcat = $this->concat_conversion($strConcat,$strDSN);
						$strPreviewColumnName =$strConcat;
						$this->columns_convert[strToLower($strConcat)] = getAttribute("conversion",$xmlpreview->attributes());
						$strAsName=getAttribute("as",$xmlpreview->attributes());
						if($strAsName!="")
						{
							$strConcat .= " as " . $strAsName;
							$strPreviewColumnName = $strAsName;
						}
						$strSelect .= ", " .$strConcat;
						$boolPreviewCol=true;
					}
					else
					{
						$strPreviewCol=getAttribute("colid",$xmlpreview->attributes());
						$strPreviewColumnName =$strPreviewCol;
						if($strPreviewCol!="")
						{
							$this->columns_convert[strToLower($strPreviewCol)] = getAttribute("conversion",$xmlpreview->attributes());
							$strAs=getAttribute("as",$xmlpreview->attributes());
							if($strAs!="")
							{
								$strPreviewCol .= " as " . $strAs;
								$strPreviewColumnName = $strAs;
							}
							$strSelect .= "," . $strPreviewCol;
							$boolPreviewCol=true;
						}
					}
				}
				elseif($strType=="phpfunc")
				{
					$boolPreviewCol=true;
				}
			}
		}

		//-- nwj - 22.05.2008 - check if we need to select tool tip
		$strToolTipText = "";
		if(isset($this->xmlTooltip[0]))
		{
			$strType=$this->xmlTooltip[0]->get_attribute("type");
			if(strToLower($strType)=="column")
			{
				//-- add to select
				$strTooltipColumnName =$this->xmlTooltip[0]->get_content();
				$strSelect .= "," . $strTooltipColumnName . " as systooltiptext";
			}
			else
			{
				//-- assume content as text
				$strToolTipText = parse_context_vars($this->xmlTooltip[0]->get_content());
			}
		}

		//-- create statement
		$boolHaveWhereClause = false;
		// -- Get the value for rowlimit
		$intRowLimit = "";
		
		$arrRowLimit = $this->xmlRoot->get_elements_by_tagname("rowlimit");
		if($arrRowLimit) $intRowLimit = $arrRowLimit[0]->get_content();
		{
			$strRowLimit = "";
		}
		if($intRowLimit>0)
		{
			$strRowLimit = $intRowLimit;
		}
		// -- Determine the database type
		$strDbType = "swsql";
		if(($strDSN != "syscache") && $boolConnected) // only get the database type if we're not connecting to Cache and we have a connection
		{
			$strDbType = $tableODBC->get_database_type();
		}
		//-- create statement
		$strSQL = "select " . $strSelect . " from " . $strFrom;
		// -- Append SQL statement if rowlimit is set
		if ($strRowLimit != "")
		{
			// -- Add "TOP" to select statement in MSSQL
			if($strDbType == "mssql")
			{
				$strSQL = "SELECT TOP " .$strRowLimit. " " . $strSelect . " FROM " . $strFrom;	
			}
		}
		
		if($strWhere != "")
		{
			$boolHaveWhereClause = true;
			$strSQL.= " where " . $strWhere;
		}
		if($dropFilter !="")
		{
			$boolHaveWhereClause = true;
			if($strWhere == "") $strSQL .= " where ";
			$strSQL.= " " . $dropFilter;
		}

		if(trim($strAdditionalWhere)!="")
		{
			$boolHaveWhereClause = true;
			$strSQL .=($strWhere == "")?" where ":" and ";
			$strSQL.= " " . $strAdditionalWhere;
		}

		if($strOrder != "")$strSQL.= " order by " . $strOrder;
		if($boolConnected==false)
		{
			$strHTML = "<center>Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.</center>";
		}
		else
		{
			// -- Append SQL statement if rowlimit is set
			if ($strRowLimit != "")
			{
				// -- Add "LIMIT" to select statement in SWSQL
				if($strDbType == "swsql")
				{
					$strSQL .= " LIMIT " . $strRowLimit;	
				}
			}

			// -- START - SQL Paging
			$strWhereClause = $strWhere;
			// -- Add additional filters to where clause for counting total recordset
			if($dropFilter !="")
			{
				if($strWhere == "") $strSQL .= " where ";
				$strWhereClause.= " " . $dropFilter;
			}		
			if(trim($strAdditionalWhere)!="")
			{
				$strWhereClause .= ($strWhere == "") ? " where ":" and ";
				$strWhereClause .= " " . $strAdditionalWhere;
			}
			$GLOBALS['table_fullrow_count'] = 0;
			$intTotalRecSet = $tableODBC->getRecordCount($strFrom,parse_context_vars($strWhereClause));
			$GLOBALS['table_fullrow_count'] = $intTotalRecSet;
			// -- Check if SQL paging is switched on
			$intDefaultShowRowCount = $this->xmlRoot->get_attribute("rpp");
			$strSQL = parse_context_vars($strSQL);
			if($intDefaultShowRowCount=="")
			{
				// -- Execute SQL statement
				$recSet = $tableODBC->Query($strSQL,true,false,null,$strRowLimit);
			}
			else
			{
				// -- Execute SQL statement
				// -- Use rowOffset and rowCount in data::sqlQuery to only Query on result that is being displayed
				// -- Limit cannot be used as it will take precedence over rowOffset and rowCount
				$recSet = $tableODBC->Query($strSQL,true,false,null,"",$intStartRow,$intShowRowCount);
			}
			// -- END - SQL Paging

			if(!$recSet)
			{
				//-- nwj 28.11.2008 - remove message that shows sql query as may be security risk.
				$strHTML = "<center>Could not run SQL query required for this data table. Please contact your Supportworks administrator<br></center>";
				//-- TK Add DSN and Table To Error Message
				$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> Table : " . $strFrom . "</center>";
				
				if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
				{
					$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
				}
			}
			else
			{
				//Just the case we are in the correct part of the app
				$queryCallRef = $_REQUEST[in_callref];
				//Before showing ONLY the content of our calls, it is necessary to check if we have the rights to do it
				if (isset($queryCallRef)) {
					//I can't see the call
					if (!$this->canViewCall($queryCallRef)){
							//-- PM00130750 16.02.2015 Securiy Message 
							$strHTML =  "<center><br/><br/><h3>Supportworks Security</h3><p>You are not authorised to see this request.<br/>";
							$strHTML .= "Please contact your system administrator.</p><br></center>";
							//-- TK Add DSN and Table To Error Message
							if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true){
								$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
							}

							echo($strHTML);

							exit(1);
					}
				}

				//-- loop through and create data (check fields for conversion)
				$arrKeys = Array();
				$strHTML = "";

				//-- how many rows we want to show on the page
				$intShowUpToRow = $intStartRow + $intShowRowCount;
				$strRowClass = "";
				
				//-- F0088780 add classname to use default cursor if no double click action
				if($xmlpreview)
				{
					if($strDblAction=="")
					{
						$strRowClass = " class='row-data-withpreview trow-default-cursor' ";
					}
					else
					{
						$strRowClass = " class='row-data-withpreview' ";
					}
				}
				else
				{
					if($strDblAction=="")
					{
						$strRowClass = " class='row-data trow-default-cursor' ";
					}
					else
					{
						$strRowClass = " class='row-data' ";
					}
				}

				$markCounter = $intStartRow-1; // -- Displaying rows from recordset
				$GLOBALS['table_row_count'] = 0;
				$recSet->movefirst();
				while (!$recSet->eof) 
				{
					//-- nwj - 13.01.2009 - do we want to filter rows by lookfor settings
					if($strLookForConvertedValue!="" && $strLookForInColumn!="" && $strLookForInColumn!="__preview_column")
					{
						$strLookForFieldName = strToLower($strLookForInColumn);
						$strDataValue = $recSet->recorddata[$recSet->currentrow][$strLookForFieldName]->value;
						$varConvertedValue = $this->convert_field_value($strFrom,$strLookForFieldName,$strDataValue);		
						//-- check if converted value matches lookforvalue if not then skip row
						$pos = strpos(strtolower($varConvertedValue), strToLower($strLookForConvertedValue));
						if ($pos === false) 
						{ 
							$recSet->movenext();
							continue;
						}
					}
					//-- 13.01.2009

					
					//-- local vars
					$rowcolumn_count=0;
					$boolSkip=false;
					$strRowKey = " keyvalue=''";
					$strCols ="";

					$strRow = "<tr ".$strRowClass." ".$strClicked." ".$strDblClicked."  ".$strmouseover." ".$strmouseout." urlvars='".$strPassThruColumns."' url='".$strURL."' action='".$strAction."' dblaction='".$strDblAction."' keyvar='".$strKeyVariable."' ";
					$strRowKeyValue = "";
					//--
					//-- for each field in the record
					foreach ($recSet->recorddata[$recSet->currentrow] as $fieldName => $aField) 
					{
						if( ($boolPreviewCol) && (strToLower($fieldName)==strToLower($strPreviewColumnName)) ) break;
						if(strToLower($fieldName)=="systooltiptext") 
						{
							$strRow .= " title='".$recSet->f("systooltiptext")."'";
							continue;
						}

						$rowcolumn_count++;
						if($fieldName!="")
						{
							$fieldValue = $aField->value;
							$fieldType = $aField->type;
							if($strKeyCol==$fieldName)
							{
								//-- to avoid duplicates (as we support diff dbs this has to be done as cant use distinct in some dbs)
								if(isset($arrKeys[$fieldValue]))
								{
									//-- this record has already been loaded
									$boolSkip=true;
									break;
								}

								$arrKeys[$fieldValue] = 1;
								$strRowKey = " keyvalue='".$fieldValue."'";
								$strRowKeyValue = $fieldValue;
							}

							if ($fieldValue == "")$fieldValue="";
							//-- 2.4 LANG added decode and parameters to html entities
							$fieldValue=lang_decode_to_utf($fieldValue);
							$fieldValue = htmlentities($fieldValue,ENT_QUOTES,'UTF-8');


							//-- should hide or nowrap?
							$strAlign = $this->columns_align[strToLower($fieldName)];
							$styleHide = $this->columns_hidden[strToLower($fieldName)];
							$strNoWrap = $this->columns_nowrap[strToLower($fieldName)];
							$strUrl = $this->columns_url[strToLower($fieldName)];
							$boolcheckbox = $this->columns_checkbox[strToLower($fieldName)];

							$varContentValue = $this->convert_field_value($strFrom,$fieldName,$fieldValue);
							$varDBvalue = ($this->columns_usecontentasvalue[strToLower($fieldName)])?$varContentValue:$fieldValue;

							//-- hover function
							$strHoverFunction = $this->columns_checkbox_jshover[strToLower($fieldName)];
							if($strHoverFunction=="") $strHoverFunction = "return true;";

							$GLOBALS['r_'.$fieldName] = $varDBvalue;
							//-- if a checkbox set content to be a input checkbox and auto tick based on dbvalue
							if($boolcheckbox)
							{
								$strChecked = ($this->columns_checkbox_checkv[strToLower($fieldName)] == $varDBvalue)?" checked ":"";
								$strDisabled = ($this->columns_checkbox_disablev[strToLower($fieldName)] == $varDBvalue)?" disabled ":"";
								
								//-- check if need to call php funct to determine if disabled
								$strPhpFunction = $this->columns_checkbox_disablephpfunc[strToLower($fieldName)];

								if($strPhpFunction!="")
								{
									eval("\$strDisabled = ".parse_context_vars($strPhpFunction).';');
								}

								$strFunction = $this->columns_checkbox_jsfunc[strToLower($fieldName)];
								$strAtts = parse_context_vars($this->columns_checkbox_atts[strToLower($fieldName)]);
								if($strFunction=="") $strFunction = "return true;";
								$varContentValue = "<input type='checkbox' $strDisabled class='radio' $strAtts onmouseover='".$strHoverFunction."(this,this.parentElement.parentElement);' onclick='".$strFunction."(this,this.parentElement.parentElement)' $strChecked dbvalue='".$varDBvalue."' dbtype='".$fieldType."' dbname='".$fieldName."'>";
							}
							else if($strUrl!="")
							{
								//-- need to create a url
								//echo parse_context_vars($strUrl);
								$varContentValue = "<a href='" . parse_context_vars($strUrl) ."' target='_new'>".$varContentValue."</a>";
							}

							$strCols .= "<td dbvalue='".$varDBvalue."' dbtype='".$fieldType."' dbname='".$fieldName."' ".$styleHide."  ".$strNoWrap." valign='top' align='".$strAlign."' onmouseover='".$strHoverFunction."(this, this.parentElement);'>".$varContentValue;
							$strCols .= "</td>";
						}
					}

					//-- check if we need to add a preview row
					$strPreviewRow="";
					if($boolPreviewCol)
					{
						$strVisibleOn=getAttribute("visibleon",$xmlpreview->attributes());
						$strType=getAttribute("type",$xmlpreview->attributes());
						//-- preview row is based on selected from table column
						if($strType=="column")
						{
							$strPreviewCol=getAttribute("colid",$xmlpreview->attributes());
							$strAs=getAttribute("as",$xmlpreview->attributes());
							if($strAs!="")$strPreviewCol = $strAs;

							//-- apply conversion								
							$strConversion=getAttribute("conversion",$xmlpreview->attributes());
							//-- F0100319
							$strData =$recSet->f($strPreviewCol);
							$strData = nl2br(htmlentities($strData,ENT_QUOTES,'UTF-8'));						
							$varContentValue = $this->convert_field_value($strFrom,$strPreviewCol,$strData);
			
							//-- F0088780 add classname to use default cursor if no double click action
							$strClass = "row-preview";
							if($strDblAction=="")
								$strClass .= " trow-default-cursor";

							$strPreviewRow = "<tr class='".$strClass."' ".$strClicked."  ".$strDblClicked." onmouseover='if(app.dtable_previewrow_highlight)app.dtable_previewrow_highlight(this);else dtable_previewrow_highlight;' onmouseout='if(app.dtable_previewrow_lowlight)app.dtable_previewrow_lowlight(this);else dtable_previewrow_lowlight(this);'><td colspan='".$rowcolumn_count."' ".$strPreviewDisplayStyle.">".$varContentValue."</td></tr>";
						}
						else if($strType=="phpfunc")
						{
							//-- preview column content is based on a function call that wil lreturn html to put into the preview row

							//-- call php function that will return the text to put into the row td
							$strFunction=getAttribute("phpfunc",$xmlpreview->attributes());
							$strFullFunction = parse_context_vars($strFunction);

							eval("\$varContentValue = ".$strFullFunction.';');
							$varContentValue =lang_decode_to_utf($varContentValue);
							$varContentValue = nl2br(htmlentities($varContentValue,ENT_QUOTES,'UTF-8'));						

							//-- F0088780 add classname to use default cursor if no double click action
							$strClass = "row-preview";
							if($strDblAction=="")
								$strClass .= " trow-default-cursor";
							//-- apply conversion								
							$strPreviewRow = "<tr class='".$strClass."' ".$strClicked."  ".$strDblClicked." onmouseover='if(app.dtable_previewrow_highlight)app.dtable_previewrow_highlight(this);else dtable_previewrow_highlight(this);' onmouseout='if(app.dtable_previewrow_lowlight)app.dtable_previewrow_lowlight(this);else dtable_previewrow_lowlight(this);'><td colspan='".$rowcolumn_count."' ".$strPreviewDisplayStyle.">".$varContentValue."</td></tr>";
						}

						//-- 14.01.2009 - check if we want to look for text in preview column
						if($strLookForConvertedValue!="" && $strLookForInColumn=="__preview_column")
						{
							//-- if value not found skip
							$pos = strpos(strtolower($varContentValue), strToLower($strLookForConvertedValue));
							if ($pos === false) 
							{ 
								$recSet->movenext();
								continue;
							}
						}
					}

					//-- row is before row we want to start page with so continue to next row
					$markCounter++;
					if(($intShowRowCount>0)&&($markCounter < $intStartRow)) 
					{					
						$recSet->movenext();
						continue;
					}

					//-- end of page - based on how many rows we want to show per page - so just loop round
					if(($intShowRowCount>0)&&($markCounter>=$intShowUpToRow))
					{				
						$recSet->movenext();
						continue;
					}
					
					//-- if we don't want this row
					if(!$boolSkip)
					{
						$GLOBALS['table_row_count']++; //-- inc row count
						$strRow .= $strRowKey . ">".$strCols."</tr>";
						$strRow .= $strPreviewRow;
						$strHTML.=$strRow;

					}
					else
					{
						//-- skipping
					}
					$recSet->movenext();
				}
			}
		}
		return $strHTML;
	}

	//Function which allow to know us if it is possible see the content of a call
	//Return False Not connection DB or problem
	//Return True Not problem
	function canViewCall($intCallref){
		
		$security = array("callref"=>$intCallref);

		if (in_array($security, $_SESSION['original_call']))
			return true;
		else
			return false; 
	}

	//-- create a table footer (NWJ - based on what though?)
	function create_table_footer()
	{
		return "";
	}

	//--
	//-- given a field value and name find if it needs converting
	function convert_field_value($fromTable, $fieldName, $fieldValue)
	{
		$conversion = $this->columns_convert[strToLower($fieldName)];
		if($fromTable=="")
		{
			$fieldName = $fromTable.".".$fieldName;
		}
			
		$fieldValue = common_convert_field_value($conversion,$fieldValue,$fieldName);
		return $fieldValue;
	}

	//--
	//-- check db type and get xml where clause to use (mysql=where tag, mssql = mswhere tag, oracle = orawhere tag)
	function get_xml_where_clause()
	{
		if(!isset($_SESSION['databasedriver']))
		{
			$odbcCon = new CSwDbConnection;
			$strDB = $odbcCon->get_database_type();
		}
		else
		{
			$strDB = $_SESSION['databasedriver'];
		}		

		$returnXML = $this->xmlRoot->get_elements_by_tagname("where"); 
		if($strDB=="mssql")
		{
			$tmpXML = $this->xmlRoot->get_elements_by_tagname("mswhere");
			if($tmpXML)$returnXML = $tmpXML;
		}
		elseif($strDB=="oracle")
		{

			$tmpXML = $this->xmlRoot->get_elements_by_tagname("orawhere");
			if($tmpXML)$returnXML = $tmpXML;
		}
		return $returnXML;
	}

	//--
	//-- given a field value and name find if it needs converting
	function concat_conversion($strConversion,$strDSN)
	{
		$arrConversion = explode(",,",$strConversion);
		if($strDSN=="Supportworks Cache")
		{
			$strReturn = "";
			$strStart = "concat(";
			$strOperator = " , ";
			$strEnd = ") ";
		}
		else
		{
			if($_SESSION['databasedriver']=="")
			{
				$odbcCon = new CSwDbConnection;
				$strDB = $odbcCon->get_database_type();
			}
			else
			{
				$strDB = $_SESSION['databasedriver'];
			}

			$strStart = "";
			$strEnd = "";
			$strOperator = "";
			$strReturn = "";

			if($strDB=="mssql")
			{
				$strOperator = " + ";
			}	
			elseif($strDB=="oracle")
			{
				$strOperator = " || ";
			}
			else
			{	
				//-- assume mysql
				$strStart = "concat(";
				$strOperator = " , ";
				$strEnd = ") ";
			}
		}

		for($i = 0 ; $i<count($arrConversion);$i++)
		{
			if($i>0)
				$strReturn .=$strOperator;
			$strReturn .=$arrConversion[$i];
		}

		return $strStart.$strReturn.$strEnd;
	}




	function output_data_table_from_recordset($strOrderBy = "", $strSortDir = "asc" , $intFilterByOption = 0, $intStartRow = 1, $intShowRowCount = -1, $strLookFor = "", $strLookIn = "", $tableFileName = "",$strAddFilter = "", $intShowPreview, $oRS, $colArray, $boolIsWSSM = true)
	{
		$this->isWSSM = $boolIsWSSM;
		//-- use default or passed in rowcount
		$intDefaultShowRowCount = $this->xmlRoot->get_attribute("rpp");
		$intShowRowCount  = ($intShowRowCount>0)?$intShowRowCount:$intDefaultShowRowCount;

		//-- nwj - 28.07.2009 - allow to set height of table if need be (mozilla work around)
		$intFixed=getAttribute("fixed",$this->xmlRoot->attributes());

		if($intFixed=="1")
		{
			//--
			//-- height is to be restricted
			//-- nwj - 21.07.2009 - store table xml def name for standalone tables

			$strHeight=getAttribute("height",$this->xmlRoot->attributes()); //- -allow us to specify height and width of the table
			$strWidth=getAttribute("width",$this->xmlRoot->attributes());
			if($strHeight=="")$strHeight="95%";
			if($strWidth=="")$strWidth="100%";

			$strHTML = "<div xmlfile='". encodeHTML($tableFileName)."' id='". encodeHTML($tableFileName)."' totalrows='![table_fullrow_count]!' startrow='".encodeHTML($intStartRow)."' style='position:relative;overflow-x:auto;overflow-y:auto;padding-bottom:20px;width:".$strWidth.";height:".$strHeight.";'>";
		}
		else
		{
			//-- nwj - 21.07.2009 - store table xml def name for standalone tables
			$strHTML = "<div xmlfile='". encodeHTML($tableFileName)."' id='". encodeHTML($tableFileName)."' totalrows='![table_fullrow_count]!' startrow='".encodeHTML($intStartRow)."' style='position:relative;overflow-x:auto;overflow-y:hidden;padding-bottom:20px;width:99%;height:95%;'>";
		}

		$strHTML .=	$this->create_table_dropfilter($intFilterByOption,$intStartRow,$intShowRowCount, $strLookFor, $strLookIn, $intShowPreview);
		$strHTML .= "<table class='dataTable' width='100%'>";
		$strHTML .= "	<thead>";
		$strHTML .=			$this->create_table_header($strOrderBy,$strSortDir);
		$strHTML .= "	</thead>";
		$strHTML .= "	<tbody>";
		$strHTML .= 		$this->create_table_data_from_recordset($strOrderBy,$strSortDir,$intFilterByOption ,$strAddFilter, $intStartRow, $intShowRowCount, $strLookFor, $strLookIn, $intShowPreview, $oRS, $colArray);
		$strHTML .= "	</tbody>";
		$strHTML .= "	<tfoot>";
		$strHTML .=			$this->create_table_footer();
		$strHTML .= "	</tfoot>";
		$strHTML .= "</table></div>";

		//-- replace html row count
		$strHTML = str_replace('![table_row_count]!',$GLOBALS['table_row_count'],$strHTML);
		$strHTML = str_replace('![table_fullrow_count]!',$GLOBALS['table_fullrow_count'],$strHTML);

		//-- set page row count title
		if($this->intEndPageCount > $GLOBALS['table_fullrow_count'])$this->intEndPageCount = $GLOBALS['table_fullrow_count'];
		$strHTML = str_replace('![table_pagerow_count]!',$this->intEndPageCount,$strHTML);

		unset($GLOBALS['table_row_count']);
		unset($GLOBALS['table_fullrow_count']);

		return $strHTML;
	}



	function create_table_data_from_recordset($strOrderBy = "",$strSortDir = "asc", $activeFilterOption = 0, $strAdditionalWhere = "", $intStartRow = 1, $intShowRowCount = -1, $strLookForConvertedValue = "", $strLookForInColumn = "", $intShowPreview, $recSet ,$colArray)
	{
		//-- get onclick and dblclick event
		$strKeyVariable=getAttribute("keyvar",$this->xmlRoot->attributes());
		$strKeyCol=getAttribute("keycol",$this->xmlRoot->attributes());

		//-- get pass thru var info (when row clicked or popped open these values will be extracted from row data
		$strPassThruColumns=getAttribute("urlvars",$this->xmlRoot->attributes());

		$strAction=getAttribute("action",$this->xmlRoot->attributes());
		$strDblAction=getAttribute("dblaction",$this->xmlRoot->attributes());
		$strClicked=getAttribute("onrowclick",$this->xmlRoot->attributes());
		$strDblClicked=getAttribute("onrowdblclick",$this->xmlRoot->attributes());
		$strDblClickedParams=getAttribute("onrowdblclickparams",$this->xmlRoot->attributes());

		$strmouseover=getAttribute("onmouseover",$this->xmlRoot->attributes());
		$strmouseout=getAttribute("onmouseout",$this->xmlRoot->attributes());

		$strURL=getAttribute("url",$this->xmlRoot->attributes());

		$strmouseover=getAttribute("onmouseover",$this->xmlRoot->attributes());
		$strmouseout=getAttribute("onmouseout",$this->xmlRoot->attributes());

		$strURL=getAttribute("url",$this->xmlRoot->attributes());
				
		if($strClicked=="")$strClicked="dtable_row_clicked";
		$strClicked = "onclick='".$strClicked."(this, window);'";

		
		if($strDblClicked=="")$strDblClicked = "dtable_row_dblclicked";
		if($strDblClickedParams!="")$strDblClickedParams=",".$strDblClickedParams;
		$strDblClicked = "ondblclick='".$strDblClicked."(this,window".$strDblClickedParams.");'";

		if($strmouseover!="")
		{
			$strmouseover = "onmouseover='".$strmouseover."(this,window);'";
		}
		else
		{
			//-- default - highlight row
			$strmouseover = "onmouseover='dtable_row_highlight(this,window);'";
		}

		if($strmouseout!="")
		{
			$strmouseout = "onmouseout='".$strmouseout."(this,window);'";
		}
		else
		{
			//-- default - lowlight row
			$strmouseout = "onmouseout='dtable_row_lowlight(this,window);'";		
		}

		//-- loop through and create data (check fields for conversion)
		$arrKeys = Array();
		$strHTML = "";

		//-- how many rows we want to show on the page
		$intShowUpToRow = $intStartRow + $intShowRowCount;
		$GLOBALS['table_fullrow_count'] = 0; //$recSet->recordcount;
		$markCounter=0;
		$GLOBALS['table_row_count'] = 0;
		$recSet->movefirst();
		while (!$recSet->eof) 
		{
			//-- row is before row we want to start page with so continue to next row
			$markCounter++;
			if(($intShowRowCount>0)&&($markCounter < $intStartRow)) 
			{		
				$strRowClass = ($xmlpreview)?" class='row-data-withpreview-invisible' ":" class='row-data-invisible' ";
			}
			elseif(($intShowRowCount>0)&&($markCounter>=$intShowUpToRow))
			{				
				$strRowClass = ($xmlpreview)?" class='row-data-withpreview-invisible' ":" class='row-data-invisible' ";
			}else
			{
				$strRowClass = ($xmlpreview)?" class='row-data-withpreview' ":" class='row-data' ";
			}


			//-- nwj - 13.01.2009 - do we want to filter rows by lookfor settings
			if($strLookForConvertedValue!="" && $strLookForInColumn!="" && $strLookForInColumn!="__preview_column")
			{
				$strLookForFieldName = strToLower($strLookForInColumn);
				$strDataValue = $recSet->recorddata[$recSet->currentrow][$strLookForFieldName]->value;
				$varConvertedValue = $this->convert_field_value($strFrom,$strLookForFieldName,$strDataValue);		
				//-- check if converted value matches lookforvalue if not then skip row
				$pos = strpos(strtolower($varConvertedValue), strToLower($strLookForConvertedValue));
				if ($pos === false) 
				{ 
					$recSet->movenext();
					continue;
				}
			}
			//-- 13.01.2009

			
			//-- local vars
			$rowcolumn_count=0;
			$boolSkip=false;
			$strRowKey = " keyvalue=''";
			$strCols ="";


			$strRow = "<tr id='".$markCounter."' ".$strRowClass." ".$strClicked." ".$strDblClicked."  ".$strmouseover." ".$strmouseout." urlvars='".$strPassThruColumns."' url='".$strURL."' action='".$strAction."' dblaction='".$strDblAction."' keyvar='".$strKeyVariable."' rowcount=".$markCounter." ";
			$strRowKeyValue = "";
			//--
			//-- for each field in the record
			foreach ($this->columns as $fieldName => $aField) 
			{
				$fieldValue = $recSet->recorddata[$recSet->currentrow][$fieldName]->value;
				$fieldType = $recSet->recorddata[$recSet->currentrow][$fieldName]->type;
				$rowcolumn_count++;
				if($strKeyCol==$fieldName)
				{
					//-- to avoid duplicates (as we support diff dbs this has to be done as cant use distinct in some dbs)
					if(isset($arrKeys[$fieldValue]))
					{
						//-- this record has already been loaded
						$boolSkip=true;
						break;
					}

					$arrKeys[$fieldValue] = 1;
					$strRowKey = " keyvalue='".$fieldValue."'";
					$strRowKeyValue = $fieldValue;
				}

				if ($fieldValue == "")$fieldValue="";
				//-- 2.4 LANG added decode and parameters to html entities
				$fieldValue=lang_decode_to_utf($fieldValue);
				$fieldValue = htmlentities($fieldValue,ENT_QUOTES,'UTF-8');



				//-- should hide or nowrap?
				$strAlign = $this->columns_align[strToLower($fieldName)];
				$styleHide = $this->columns_hidden[strToLower($fieldName)];
				$strNoWrap = $this->columns_nowrap[strToLower($fieldName)];
				$strUrl = $this->columns_url[strToLower($fieldName)];
				$boolcheckbox = $this->columns_checkbox[strToLower($fieldName)];

				$varContentValue = $this->convert_field_value($strFrom,$fieldName,$fieldValue);
				$varDBvalue = ($this->columns_usecontentasvalue[strToLower($fieldName)])?$varContentValue:$fieldValue;

				//-- hover function
				$strHoverFunction = $this->columns_checkbox_jshover[strToLower($fieldName)];
				if($strHoverFunction=="") $strHoverFunction = "return true;";

				$GLOBALS['r_'.$fieldName] = $varDBvalue;
				//-- if a checkbox set content to be a input checkbox and auto tick based on dbvalue
				if($boolcheckbox)
				{
					$strChecked = ($this->columns_checkbox_checkv[strToLower($fieldName)] == $varDBvalue)?" checked ":"";
					$strDisabled = ($this->columns_checkbox_disablev[strToLower($fieldName)] == $varDBvalue)?" disabled ":"";
					
					//-- check if need to call php funct to determine if disabled
					$strPhpFunction = $this->columns_checkbox_disablephpfunc[strToLower($fieldName)];

					if($strPhpFunction!="")
					{
						eval("\$strDisabled = ".parse_context_vars($strPhpFunction).';');
					}

					$strFunction = $this->columns_checkbox_jsfunc[strToLower($fieldName)];
					$strAtts = parse_context_vars($this->columns_checkbox_atts[strToLower($fieldName)]);
					if($strFunction=="") $strFunction = "return true;";
					$varContentValue = "<input type='checkbox' $strDisabled class='radio' $strAtts onmouseover='".$strHoverFunction."(this,this.parentElement.parentElement);' onclick='".$strFunction."(this,this.parentElement.parentElement);' $strChecked dbvalue='".$varDBvalue."' dbtype='".$fieldType."' dbname='".$fieldName."'>";
				}
				else if($strUrl!="")
				{
					//-- need to create a url
					//echo parse_context_vars($strUrl);
					$varContentValue = "<a href='" . parse_context_vars($strUrl) ."' target='_new'>".$varContentValue."</a>";
				}

				$strCols .= "<td dbvalue='".$varDBvalue."' dbtype='".$fieldType."' dbname='".$fieldName."' ".$styleHide."  ".$strNoWrap." valign='top' align='".$strAlign."' onmouseover='".$strHoverFunction."(this, this.parentElement);'>".$varContentValue;
				$strcols .= "</td>";
			}

			//-- increment total row count that match our needs
			$GLOBALS['table_fullrow_count']++;

			
			//-- if we don't want this row
			if(!$boolSkip)
			{
				$GLOBALS['table_row_count']++; //-- inc row count
				$strRow .= $strRowKey . ">".$strCols."</tr>";
				$strRow .= $strPreviewRow;
				$strHTML.=$strRow;

			}

			$recSet->movenext();
		}
		return $strHTML;
	}
}

	function encodeHTML($strValue = "")
	{
		return htmlentities($strValue,ENT_QUOTES,'UTF-8');
	}
?>