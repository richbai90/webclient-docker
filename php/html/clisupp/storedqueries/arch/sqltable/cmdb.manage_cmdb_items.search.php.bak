<?php

	//--
	//-- perform ci search - used by manage_cmdb_items form

	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}


	$strFilter = createTableFilterFromParams(swfc_tablename());

	//-- check if we have an extended details to search
	$extFilter = "";
	if($_POST["exttable"]!="")
	{
		$extFilter = createTableFilterFromParams($_POST['exttable'], "swdata", "_swcext_");
		if($extFilter!="")
		{
			//-- select pk_auto_id
			$extKeyColumn = getTablePrimaryKeyName($_POST["exttable"]);
			$strCiIDS ="";
			$strExtSearch = "select " . UC($extKeyColumn) . " from " .UC($_POST["exttable"]). " where " . $extFilter;
			$oRS = get_recordset($strExtSearch);
			//-- Include App Specific Helpers File
			IncludeApplicationPhpFile("app.helpers.php");
			//-- Check for XMLMC Error
			if($oRS->result==false)
			{
				//-- Function from app.helpers.php to process error message.
				handle_app_error($oRS->lastErrorResponse);
				exit(0);
			}
			//-- END
			while($oRS->Fetch())
			{

				if($strCiIDS!="")$strCiIDS.=",";
				$strCiIDS = get_field($oRS,$extKeyColumn);

			}

			if($strCiIDS!="")
			{
				if($strFilter!="") $strFilter .= parseBool($_POST["_and"])?" AND ": " OR ";
				$strFilter .= " pk_auto_id in (" . $strCiIDS . ")";
			}
		}//-- have ext filter

	}//-- have ext table to search
	

	//-- add any static filters
	if($_POST['sf']!="")
	{
		IncludeApplicationPhpFile("static.sql.php");
		if($strFilter!="")
		{
			$strFilter = "(".$strFilter.") and (".getStaticSql($_POST["sf"]).")";
		}
		else
		{
			$strFilter = getStaticSql($_POST["sf"]);
		}
	}

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . " where " . $strFilter . swfc_orderby();

?>