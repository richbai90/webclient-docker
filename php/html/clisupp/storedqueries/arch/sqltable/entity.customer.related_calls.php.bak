<?php
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$inCode = $_POST["code"];
	if($inCode=="")
	{
		//echo generateCustomErrorString("-100","An invalid call list was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$parsedFilter = " cust_id='".PrepareForSql($strKeysearch)."'";

	if($inCode=="INC")
	{
		$parsedFilter .= " and callclass='Incident'";
	}
	elseif($inCode=="PRB")
	{
		$parsedFilter .= " and (callclass='Problem' or callclass='Known Error')";
	}
	elseif($inCode=="RFC")
	{
		$parsedFilter .= " and callclass='Change Request'";
	}
	elseif($inCode=="REQ")
	{
		$parsedFilter .= " and callclass='Service Request'";
	}

	$parsedFilter .= " and status not in (7,15,17)";

	$parsedFilter = "where ".$parsedFilter;
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter . swfc_orderby();
?>