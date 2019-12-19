<?php

	//-- v1.0.0
	//-- service/form/sqllistdata

	//-- get data for form sqllist control

	//-- includes
	include('../../../php/session.php');
	include('../../../php/db.helpers.php');


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/sqllistdata/index.php","START","SERVI");
	}	

	//-- 28.02.2011 - get source type
	$strSrcType = @$_POST["_sourcetype"];
	$strSrcInclude = @$_POST["_sourceinclude"];
	if($strSrcInclude!="")include($strSrcInclude);

	//-- expect dsn, table and filter
	$strDSN = $_POST["dsn"];
	if($strDSN==""){echo "SqlList DSN is not set.";exit;}

	$strTable = $_POST["table"];
	$boolCalltasks = (strpos($strTable,"calltasks")!==false)?true:false;					
	$boolTempCalltasks = ($strTable=="wc_calltasks")?true:false;					
	
	$strRawSql = @$_POST["rawsql"];
	if($strRawSql=="")
	{
		if($strTable==""){echo "SqlList TABLE is not set.";exit;}

		$strFilter = $_POST["filter"];
		//-- replace any && with AND
		$strFilter = str_replace("&&","and",$strFilter);

		$intCheckbox = 	$_POST["checkbox"];

		//-- data ordering info
		$strOrderBy = @$_POST["orderby"];
		$strOrderDir = @$_POST["orderdir"];
		$strApplyOrder = "";
		if($strOrderBy!="")
		{
			if($boolCalltasks || $boolTempCalltasks)
			{
				$strOrderBy .= ", taskid";
			}

			if($strOrderDir == "") $strOrderDir="DESC";
			$strApplyOrder = " order by " . $strOrderBy . " " .$strOrderDir;
		}

		//- -create sql
		$strCols = $_POST["columns"];
		if($_POST["previewcol"]!="") 
		{
			//-- ensure column name is valid
			if(validDBObjectName($_POST["previewcol"]))
			{
				$strCols .= "," . $_POST["previewcol"] . " as swwc_previewcol";
			}
		}


		if($strFilter!="")$strFilter = " where " . $strFilter;

		//-- apply limit if one is passed in
		$bUseLimit = false;
		$intLimit = $_POST["_limit"];
		if($intLimit!="")
		{
			$bUseLimit = true;
			$strSQL = "select !!mssqltop!! ".$strCols." from ".$strTable.$strFilter. " !!orarownum!! ".$strApplyOrder;
			$strSQL = add_db_rowlimit_to_sql($strSQL,$intLimit,$portal->databasetype);
		}
		else
		{
			$strSQL = "select ".$strCols." from ".$strTable.$strFilter.$strApplyOrder;
		}
	}
	else
	{
		//-- if submitting rawsql ensure src type is set to sql
		$strSrcType = "sql";
		$strSQL = $strRawSql;
		$intLimit = $_POST["_limit"];
		$intLimit++;$intLimit--;
		$bUseLimit = true;
	}

	//-- if src is php then let php handle connection

	$bSystemDB = isSystemDB($strDSN);
	if($strDSN=="syscache")$strDSN = "sw_systemdb";
	if($strSrcType!="php")
	{
		//-- connect using normal method
		$oConn = connectdb($strDSN,$bSystemDB); 
	}
	else
	{
		//-- create connection from custom php function
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/form/sqllistdata/index.php","PHPQUERY - [".$strSrcInclude."]","SERVI");
		}	

		$oConn = php_connectdb(); 
	}

	//echo $strDSN . ":" . $bSystemDB;
	$strSqlList = "";
	$strCOLS = "<colgroup>";
	$bCols = false;

	$strConvTable = $strTable;
	if($boolCalltasks || $boolTempCalltasks)$strConvTable = "calltasks";


	//echo $strSQL;
	//-- execute and generate html
	$intTotalRowsAffected=-1;
	if($strSrcType!="php")
	{
		$result_id =@_execute_xmlmc_sqlquery($strSQL,$oConn);
		if(!$result_id)
		{
			close_dbs();
			echo "The SqlList control failed to run the submitted sql. Please contact your Administrator. :-<br><br>".$strSQL;
			exit;
		}

		//-- get row
		$rows =hsl_xmlmc_rowo($result_id);

		//-- row count
		$intTotalRowsAffected = hsl_xmlmc_rowcount($result_id);
	}
	else
	{
		$result_id = php_query($strSQL,$oConn);
		if(!$result_id)
		{
			if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
			{
				_wc_debug("service/form/sqllistdata/index.php","PHPQUERY - The SqlList control failed to run the submitted php query [".$strSrcInclude."]","FAIL ");
			}	
			echo "The SqlList control failed to run the submitted php query [".$strSrcInclude."]. Please contact your Administrator.";
			exit;
		}

		$rows = php_query_getrow($result_id);
	}

	
	$strTDClass = ($_POST["previewcol"]!="")?"datatd-preview-r1":"datatd";
	
	$boolExpander = ($_POST["expandercol"]!="")?true:false;
	$strExpanderCol = $_POST["expandercol"];
	$strLastExpandGroupName = "";
	$iGroupCount=0;
	$iExpandRowCount=0;

	//-- store hidden col names
	$arrHiddenCols = explode(",",$_POST['hiddencolumns']);
	$arrNamedHideCols = Array();
	foreach($arrHiddenCols as $pos => $strHideColName)
	{
		$arrNamedHideCols[strToLower($strHideColName)] = true;
	}
	$arrColWidths = explode(",",$_POST['columnwidths']);
	$boolIsIE = ($_POST['isie']=="true");

	//-- enforce paging if row count is greater than 100
	$iRowsPerPage = $_POST["_fclimit"];
	$intRowStart=-1;
	$intPageCount = 0;
	$intPageNumber=1;
	if($intTotalRowsAffected>$iRowsPerPage)
	{
		$bUseLimit=true;
		$intPageNumber = $_POST['_page'];
		if($intPageNumber=="")$intPageNumber=1;

		//-- where to start processing rows
		$intRowStart = (($intPageNumber-1) * $iRowsPerPage);
		$intLimit = $iRowsPerPage;

		$intPageCount = ceil($intTotalRowsAffected/$iRowsPerPage);

	}


	$bFirstColHidden = false;
	$iRowCount = 0;	
	$iTmp = 0;
	$iTaskIDValue=0;
	while($rows)
	{
		if($intRowStart>0 && $iTmp<$intRowStart)
		{
			if($strSrcType!='php')
			{
				$rows =hsl_xmlmc_rowo($result_id);
			}
			else
			{
				$rows = php_query_getrow($result_id);
			}
			$iTmp++;
			continue;
		}
	

			$iColCount = $_POST['colcount'];
			$iCol = 0;
			$strPreviewRow= "";
			$strExpanderRow = "";
			$strDataRow = "";		
			$strExpanderTitle = ($boolExpander)?$rows->$strExpanderCol:"";
			$colCounter = 0;
			$iTaskIDValue = 0;
			
			
			foreach($rows as $fieldName => $fieldValue)
			{
				if($fieldName == "taskid")
				{
					$iTaskIDValue=$fieldValue;
				}
				
				if($fieldName == "swwc_previewcol")
				{
					$formattedValue = conversion_calldiary($fieldValue,$_POST["previewlines"]);
					$strPreviewRow ="<tr type='prev' onclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowclick(this,event);' ondblclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowdblclick(this,event);'>";
					$strPreviewRow .="<td class='datatd-preview-r2' colspan='".$iColCount."'><div>".nl2br(htmlentities($formattedValue))."</div></td></tr>"; 
				}
				else
				{
					if(!$bCols)
					{
					
						if(@$arrNamedHideCols[$fieldName]===true)
						{
							if($colCounter==0)$bFirstColHidden=true;
							$strCOLS .= "<col style='display:none;'/>";
						}
						else
						{
							$strCOLS .= "<col width='".$arrColWidths[$colCounter]."px' />";
						}
					}

					$strAdjustStyle = "class='tdvalue'";
					if($intCheckbox=="1" && $iCol==0)
					{
						//-- show checkbox
						$strAdjustStyle = "class='sl-checkbox'";
						$iCol = 1;
					}
					
					if($fieldName=="compltbyx" && $boolTempCalltasks)
					{
						$formattedValue = conversion_sec2hhmm($fieldValue);
					}
					else
					{
						$formattedValue = datatable_conversion($fieldValue,$strConvTable.".".$fieldName);
					}			

					if($fieldValue==$formattedValue)$fieldValue = "_s_"; //-- same as text

					//-- needed for firefox and saf etc
					if(@$arrNamedHideCols[$fieldName]===true)
					{
																																					   
						$strDataRow .= "<td class='".$strTDClass."' style='display:none;' noWrap><div ".$strAdjustStyle.">". $formattedValue . "</div><div style='display:none;'>".$fieldValue."</dv></td>";
						//$strDataRow .= "<td dbvalue='".htmlentities($fieldValue)."' class='".$strTDClass."' style='display:none;' noWrap><div ".$strAdjustStyle.">". $formattedValue . "</div></td>";
					}
					else
					{
																																										
						$strDataRow .= "<td dbvalue='".htmlentities($fieldValue)."' class='".$strTDClass."' noWrap><div ".$strAdjustStyle.">". $formattedValue . "</div><div style='display:none;'>".$fieldValue."</div></td>";
						//$strDataRow .= "<td dbvalue='".htmlentities($fieldValue)."' class='".$strTDClass."' noWrap><div ".$strAdjustStyle.">". $formattedValue . "</div></td>";
					}

					
				}//-- preview col

				$colCounter++;
			} //-- eof row column processing
		
			if(!$bCols)$strSqlList .=$strCOLS."</colgroup>";

			//-- running off calltasks or temp call tasks
			$iGroupCount++;	
			$boolShowRow=true;
			if($boolCalltasks || $boolTempCalltasks)
			{
				//-- do not show row if taskid = 0 as it means it is temp table and is worklist header
				if($iTaskIDValue==0 || $iTaskIDValue=="")
				{
					$iGroupCount--;
					$boolShowRow=false;
				}
			}
			
			

			//-- if an expander type table
			if($boolExpander && ($strLastExpandGroupName!=$strExpanderTitle))
			{
				//-- output expander row	
				$strItemText = ($iGroupCount>1)?"items":"item";
				$strSeqTitle = ($rows->flags&8)?"Sequential ":"Open ";
				$strExpanderRow ="<tr type='expander' flags='".$rows->flags."' parentgroup='".$strExpanderTitle."' itemcount='".$strExpanderTitle."_counter' parentgroupsequence='".$rows->parentgroupsequence."' onclick='this.parentNode.parentNode.parentNode.parentNode.swfc._expanderclick(this,event);' ondblclick='this.parentNode.parentNode.parentNode.parentNode.swfc._expanderdblclick(this,event);'>";
				if($bFirstColHidden)
				{
					$strExpanderRow .="<td><div></div></td><td class='datatd-expander' colspan='".($iColCount-1)."'><div><b>".htmlentities($strExpanderTitle)."</b> (".$strExpanderTitle."_counter ".$strSeqTitle."work _itemcount_)</div></td><tr>"; 
				}
				else
				{
					$strExpanderRow .="<td class='datatd-expander' colspan='".$iColCount."'><div><b>".htmlentities($strExpanderTitle)."</b> (".$strExpanderTitle."_counter ".$strSeqTitle."work _itemcount_)</div></td><tr>"; 
				}
				
				$strSqlList = str_replace ($strLastExpandGroupName."_counter"  , $iGroupCount , $strSqlList); 
				$strSqlList = str_replace ("_itemcount_" , $strItemText , $strSqlList); 

				$strLastExpandGroupName = $strExpanderTitle;
				$iGroupCount=0;
				$iExpandRowCount++;
			}

			$strSqlList .= $strExpanderRow;

			
			if($boolShowRow)$strSqlList .= "<tr onclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowclick(this,event);' ondblclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowdblclick(this,event);'>" . $strDataRow . "</tr>";
			$strSqlList .= $strPreviewRow;
			$bCols = true;

		if($strSrcType!='php')
		{
			$rows =($bSystemDB==false)?hsl_xmlmc_rowo($result_id):hsl_xmlmc_rowo($result_id);
		}
		else
		{
			$rows = php_query_getrow($result_id);
		}

		$iRowCount = $iRowCount+1;
		if($bUseLimit)
		{
			if($iRowCount==$intLimit) $rows=false;	
		}

	}

	if($boolExpander)
	{
		if($iTaskIDValue>0 && $iGroupCount==0)
		{
			$iGroupCount++;
		}
		else if(!$boolTempCalltasks)
		{
			$iGroupCount++;
		}
		$strItemText = ($iGroupCount>1 || $iGroupCount==0)?"items":"item";
		//-- replace last counter wih count value
		$strSqlList = str_replace ($strLastExpandGroupName."_counter"  , $iGroupCount , $strSqlList); 
		$strSqlList = str_replace ("_itemcount_" , $strItemText , $strSqlList); 
	}

	$strSqlList .= "</table>";
	$strSqlList = "<table cellspacing='0' cellpadding='0' border='0' rc='".$intTotalRowsAffected."' pc='".$intPageCount."' pn='".$intPageNumber."'>".$strSqlList ;

	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/sqllistdata/index.php","END","SERVI");
	}	

	//-- echo back info
	echo $strSqlList;
?>