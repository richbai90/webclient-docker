<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)

	$and = $_POST['_and'];
	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}

	//-- loop passed in columns for specific table - check valid sqlobjectnames and create filter
	$parsedFilter = createTableFilterFromParams(swfc_tablename());

	$subscription_type = $_POST['sub'];
	$subscription_value = $_POST['sub_val'];
	if($subscription_type != '' && $subscription_value !='')
	{
		$strJoinTable = "";
		$strJoinOn = "";
		switch($subscription_type)
		{
			case "Organisation":
			$strJoinTable = "COMPANY";
			break;
			case "Department":
			$strJoinTable = "DEPARTMENT";
			break;
			case "Customer":
			$strJoinTable = "USERDB";
			break;
			default:
			break;
		}
		$strJoin = "LEFT JOIN SC_SUBSCRIPTION ON FK_ME_TABLE = '".$strJoinTable."' WHERE FK_ME_KEY = '".$subscription_value."'AND FK_SERVICE = config_itemi.PK_AUTO_ID" ;
	}
	//-- if we have a filter then and the where
	if($strJoin  =='')
	{
		if($and=="false" )
		{
			if(!isset($_POST["sf"]))
			{
				if($parsedFilter!="") $parsedFilter = " where (" . $parsedFilter . ")";
			}else
			{
				if($parsedFilter!="") $parsedFilter = " where (" . $parsedFilter;
			}
		}else
		{
			if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;
		}
	}else
	{
		if($and=="false" )
		{
			if(!isset($_POST["sf"]))
			{
				if($parsedFilter!="") $parsedFilter = $strJoin ." AND (" . $parsedFilter . ")";
			}else
			{
				if($parsedFilter!="") $parsedFilter = $strJoin ." AND (" . $parsedFilter;
			}
		}else
		{
			if($parsedFilter!="") $parsedFilter = $strJoin ." AND " . $parsedFilter;
		}
	
	}

	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		if($and=="false")
		{
			$parsedFilter .= ($parsedFilter=="")? " WHERE " : ") AND ";
			$parsedFilter .= getStaticSql($_POST["sf"]);

		}else
		{
			$parsedFilter .= ($parsedFilter=="")? " WHERE " : " AND ";
			$parsedFilter .= getStaticSql($_POST["sf"]);

		}
		
	}


	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter . swfc_orderby();

?>