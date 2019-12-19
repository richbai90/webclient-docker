<?php
	//Get Values
	$boolPaged = $_POST['paged'];
	$intPageNo = $_POST['start'];
	$webclient = $_POST['webclient']; //-- Is Called By Webclient
	
	//--Optional
	$strFilter = $_POST["strFilter"];
	$ks = $_POST["cust_id"]; //-- Used on Customer Form
	$org = $_POST["org_id"]; //-- Used on Org Form
	$ci = $_POST["ci_id"]; //-- Used on Org Form
	
	//--Strip White Space From Filter
	$strFilter = str_replace("% ","%",$strFilter);
	$strFilter = str_replace(" %","%",$strFilter);
	$strFilter .= " and appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
	
	if(!isset($_POST['paged']) ||$_POST['start']=="")
	{
		throwSuccess();
	}
	
	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}
	//-- Include Paging Specific Helpers File
	IncludeApplicationPhpFile("paging.helpers.php");	

	//--Set Where
	if($_POST["cust_id"])
	{
		$where = "cust_id = '".PrepareForSql($ks)."'".$strFilter;
		$strPagedQuery = sql_page($where, $intPageNo, swfc_selectcolumns(), swfc_fromtable(), swfc_orderby());
	}else if($_POST["org_id"])
	{
		$where = "fk_company_id = '".PrepareForSql($org)."'".$strFilter;
		$strPagedQuery = sql_page($where, $intPageNo, swfc_selectcolumns(), swfc_fromtable(), swfc_orderby());
	}else if($_POST["ci_id"])
	{
		$strServiceCalls = get_service_requests($ci);
		$strCalls = get_requests($ci);
		if($strServiceCalls !='' && $strCalls != '')
		{
			$arrCalls = explode(",", $strCalls);
			$arrCalls2 = explode(",", $strServiceCalls);
			$result = array_merge($arrCalls, $arrCalls2);
			sort($result, SORT_NUMERIC);
			$comma_separated_calls = implode(",", $result);
			$where = " callref in (".$comma_separated_calls.") ".$strFilter;
		}else if($strCalls !='')
		{
			$where = "callref in (".$strCalls.") ".$strFilter;
		}else if($strServiceCalls !='')
		{
			$where = "callref in (".$strServiceCalls.") ".$strFilter;
		}else
		{
			throwSuccess();
		}
		$strPagedQuery = sql_page($where, $intPageNo, swfc_selectcolumns(), swfc_fromtable(), swfc_orderby());
	}

	$sqlDatabase = swfc_source();
	//-- Pass Filter to Paging Functions
	
	$sqlCommand = $strPagedQuery;
?>