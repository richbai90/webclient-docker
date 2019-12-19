<?php
	$inCallref = $_POST["callref"];
	$inCustomer = $_POST["cust_id"];


	if($inCallref>0)
		$parsedFilter .=" callref != ".$inCallref;
	if($parsedFilter !="")
		$parsedFilter .=" and ";
	$parsedFilter .=" status<15 ";
	if(isset($_POST['probcode']))
	{
		$parsedFilter .=" and probcode='".PrepareForSql($_POST['probcode'])."' and probcode!=''";
	}
	else
	{
		throwError(-200,"Failed to run related record query. Please contact your administrator."); //-- fail and exit
	}

	if($parsedFilter!="")
		$parsedFilter = " where ".$parsedFilter;
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter . swfc_orderby();
?>