<?php

	//-- will load sql table control using a passed in _swc_<colname>= and supports optional passed in filter


	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}


	//-- create filter using colname = colvalue
	$bLike = parseBool($_POST['_like'],true);
	if(!isset($_POST['_like']))$bLike =false;
	$parsedFilter = createTableFilterFromParams(swfc_tablename(),swfc_source(),"_swc_",$bLike);

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;


	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$parsedFilter .= ($parsedFilter=="")? " WHERE " : " AND ";
		$parsedFilter .= getStaticSql($_POST["sf"]);
	}

	if($_POST['_filter'])
	{
		if($parsedFilter=="")
		{
			$parsedFilter = " where " . $_POST['_filter'];
		}else
		{
			$parsedFilter .= " AND ".$_POST['_filter'];
		}
	}
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter. swfc_orderby();

?>