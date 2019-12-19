<?php
	$inCallref = $_POST["callref"];
	$inCustomer = $_POST["cust_id"];

	$parsedFilter = "";
	if($inCallref>0)
		$parsedFilter .=" callref != ".$inCallref;
	if($parsedFilter !="")
		$parsedFilter .=" and ";
	$parsedFilter .=" callclass='Incident' and status<15 ";
	if(isset($_POST['fk_company_id']))
	{
		if($_POST['fk_company_id']!="")
			$parsedFilter .=" and fk_company_id='".PrepareForSql($_POST['fk_company_id'])."' and cust_id!='".PrepareForSql($inCustomer)."'";
		else
			$parsedFilter .=" and callref=-1 and cust_id!='".PrepareForSql($inCustomer)."'";
	}
	else if(isset($_POST['site']))
	{
		if($_POST['site']!="")
			$parsedFilter .=" and site='".PrepareForSql($_POST['site'])."' and cust_id!='".PrepareForSql($inCustomer)."'";
		else
			$parsedFilter .=" and callref=-1 and cust_id!='".PrepareForSql($inCustomer)."'";
	}
	else if(isset($_POST['cust_id']))
	{
		$parsedFilter .=" and cust_id!='' and cust_id='".PrepareForSql($inCustomer)."'";
	}
	else
	{
		throwError(-200,"Failed to run related record query. Please contact your administrator."); //-- fail and exit
	}

	$parsedFilter = "where ".$parsedFilter;
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter . swfc_orderby();
?>