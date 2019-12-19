<?php
	//-- Get Post Values
	$boolPaged = $_POST['paged'];
	$intPageNo = $_POST['start'];
	$strFilter = $_POST["strFilter"];
	$fk_cmdb_id = $_POST["fk_cmdb_id"];
	$type = $_POST["cmdb_type"];
	$webclient = $_POST['webclient']; //-- Is Called By Webclient
	
	//--Strip White Space From Filter
	$strFilter = str_replace("'% ","'%",$strFilter);
	$strFilter = str_replace(" %'","%'",$strFilter);
	
	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}

	if(!isset($_POST['paged']) || $_POST['start']=="" || !isset($_POST['fk_cmdb_id']) || !isset($_POST["cmdb_type"]))
	{
		throwSuccess();
	}
	//-- Include Paging Specific Helpers File
	IncludeApplicationPhpFile("paging.helpers.php");
	
	if(!$strFilter)
	{
		$strJoin = "right join " . PrepareForSql('config_reli') . " on " . PrepareForSql('config_itemi') . "." . PrepareForSql('pk_auto_id') . " = " . PrepareForSql('config_reli') . "." . PrepareForSql('fk_child_id');
		$strFilter = " WHERE FK_CHILD_TYPE not like 'ME->%' and FK_PARENT_TYPE = " . $type . " and FK_PARENT_ID = " . PrepareForSql($fk_cmdb_id). " and isactivebaseline = 'YES' ";
	}else
	{
		$strJoin = "right join " . PrepareForSql('config_reli') . " on " . PrepareForSql('config_itemi') . "." . PrepareForSql('pk_auto_id') . " = " . PrepareForSql('config_reli') . "." . PrepareForSql('fk_child_id');
		$strFilter = " WHERE FK_CHILD_TYPE not like 'ME->%' and FK_PARENT_TYPE = " . $type . " and FK_PARENT_ID = " . PrepareForSql($fk_cmdb_id) . $strFilter;
	}

	//-- Pass Filter to Paging Functions
	$strPagedQuery = sql_page_join($strFilter, $intPageNo, swfc_selectcolumns_join(), swfc_fromtable(), swfc_orderby(), $strJoin);
	
	$sqlDatabase = swfc_source();
	$sqlCommand = $strPagedQuery;

?>