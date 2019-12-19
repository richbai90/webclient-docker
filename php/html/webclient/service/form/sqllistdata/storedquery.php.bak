<?php

	//-- v1.0.0
	//-- service/form/sqllistdata/remotequery.php

	//-- get data for form sqllist control using new remotequeries
	//-- includes
	include('../../../php/session.php');
	include('../../../php/db.helpers.php');


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/sqllistdata/storedquery.php","START","SERVI");
	}	

	//-- include remotequery - change pwd
	$_POST['espQueryName'] = "sqltable/" . $_POST['espQueryName'];
	
	//-- include getsessioninfo2
	//-- get session info using xmlmc - use existing session id
	$xmlmc = new XmlMethodCall();
	if(!$xmlmc->invoke("session","getSessionInfo2"))
	{
		echo $xmlmc->xmlresult;
		exit(0);
	}
	else
	{
		//-- sessioninfo2 is used by storequeries engine
		$_POST['sessioninfo2'] = $xmlmc->xmlresult;
	}
	
	
	$swfc = 1;
	$includepath = '../../../../clisupp/storedqueries/';
	include('../../../../clisupp/storedqueries/index.php');

	//-- have xmldom of rows - traverse these and construct html table
	$arrRows = $xmlmc->xmldom->get_elements_by_tagname("rowData");
	if(isset($arrRows[0]))	$arrRows = $arrRows[0]->get_elements_by_tagname("row");

	
	$strSqlList = "";
	$strCOLS = "<colgroup>";
	$bCols = false;

	$strTDClass = "datatd";
	$boolExpander = false;
	$strExpanderCol = "";
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

	//-- store column names
	$arrSelectCols = explode(",",$_POST['columns']);
	$arrNamedSelectCols = Array();
	foreach($arrSelectCols as $pos => $strColName)
	{
		$arrNamedSelectCols[strToLower($strColName)] = true;
	}

	$arrColWidths = explode(",",$_POST['columnwidths']);
	$boolIsIE = ($_POST['isie']=="true");

	//-- enforce paging if row count is greater than 100
	$intTotalRowsAffected = count($arrRows);
	$iRowsPerPage = $_POST["_fclimit"];
	$intRowStart=0;
	$intPageCount = 0;
	$intPageNumber=1;
	$bUseLimit=false;
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

	$intCheckbox = $_POST["checkbox"];
	$bFirstColHidden = false;
	$iRowCount = $intRowStart;	
	$iTmpCount = 0;
	while(isset($arrRows[$iRowCount]))
	{
		$xmlRow = $arrRows[$iRowCount];

		$iColCount = count($arrMetaData);
		$colCounter = 0;
		$iCol = 0;
		$strDataRow = "";		

		//-- for each field in row
		foreach($arrNamedSelectCols as $fieldName => $z)
		{
			$formattedValue = htmlentities(gxc($xmlRow, $fieldName));
			$rawValue = gxa($xmlRow, $fieldName,"raw");

			if(!$bCols)
			{			
				if($arrNamedHideCols[$fieldName]===true)
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

			$fieldValue = ($rawValue!="")?htmlentities($rawValue):"_s_"; //-- same as text

			//-- needed for firefox and saf etc
			if($arrNamedHideCols[$fieldName]===true)
			{
				$strDataRow .= "<td class='".$strTDClass."' style='display:none;' noWrap><div ".$strAdjustStyle.">". $formattedValue . "</div><div style='display:none;'>".$fieldValue."</div></td>";
			}
			else
			{
				$strDataRow .= "<td class='".$strTDClass."' noWrap><div ".$strAdjustStyle.">". $formattedValue . "</div><div style='display:none;'>".$fieldValue."</div></td>";
			}
		}
	
		if(!$bCols)$strSqlList .=$strCOLS."</colgroup>";

		$strSqlList .= "<tr onclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowclick(this,event);' ondblclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowdblclick(this,event);'>" . $strDataRow . "</tr>";
		$bCols = true;

		//-- exit out as reach limit
		if($bUseLimit)
		{
			$iTmpCount++;
			if($iTmpCount==$intLimit)break;
		}
		//-- ready to move to next row
		$iRowCount++;
	}

	$strSqlList .= "</table>";
	$strSqlList = "<table cellspacing='0' cellpadding='0' border='0' rc='".$intTotalRowsAffected."' pc='".$intPageCount."' pn='".$intPageNumber."'>".$strSqlList;
	echo $strSqlList;
	exit(0);
?>