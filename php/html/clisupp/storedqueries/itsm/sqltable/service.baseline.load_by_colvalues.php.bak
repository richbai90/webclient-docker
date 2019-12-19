<?php
	//-- will load sql table control using a passed in _swc_<colname>= and supports optional passed in filter
	if($_POST['empty']=="1") {
		//-- return empty recordset
		throwSuccess(0);
	}
	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();

	if($service->can_manage_baselines()){

		//-- create filter using colname = colvalue
		$bLike = parseBool($_POST['_like'],true);
		$parsedFilter = createTableFilterFromParams(swfc_tablename(),swfc_source(),"_swc_",$bLike);

		//-- if we have a filter then and the where
		if($parsedFilter!="") {
			$parsedFilter = " where " . $parsedFilter;
		}

		//-- add static filter
		//-- do we have a static filter to apply
		if($_POST["sf"]!="") {
			IncludeApplicationPhpFile("static.sql.php");
			$parsedFilter .= ($parsedFilter=="")? " WHERE " : " AND ";
			$parsedFilter .= getStaticSql($_POST["sf"]);
		}

		$sqlDatabase = swfc_source();
		$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter. swfc_orderby();
	} else {
		throwError(-200,"You are not authorised to manage Service baselines.\nIf you require authorisation please contact your Supportworks Administrator."); //-- fail and exit	
	}
?>