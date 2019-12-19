<?php
	//-- 2012.11.07
	//-- return selected rows from search results for  a given search table (as used in foms like search_company, search_address)
	//-- uses primary key with in statement

	if($_POST['aid']==1)
	{
		//var_dump($session);
		$boolRights = HaveAppRight("D", 6, $session->currentDataDictionary);
		if(!$boolRights)
		{
			$strErrorMessage=$session->currentDataDictionary.$boolRights."You are not authorised to associate Affected Business Areas with Change Requests.\nIf you require authorisation please contact your Supportworks Administrator.";
			echo generateCustomErrorString("-100",$strErrorMessage);
			exit(0);
		}
	}
	elseif($_POST['aid']==2)
	{
		if(!HaveAppRight("D", 7, $session->currentDataDictionary))
		{
			$strErrorMessage="You are not authorised to remove Affected Business Areas from Change Requests.\nIf you require authorisation please contact your Supportworks Administrator.";
			echo generateCustomErrorString("-100",$strErrorMessage);
			exit(0);
		}
	}
	else
	{
		//echo generateCustomErrorString("-100","No action provided. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	//-- if no value then we are clearing list
	$keyValues = $_POST['_kv'];
	if($keyValues=="")$keyValues="-1";

	//-- get the table primary key name and type
	$tableName = swfc_tablename();
	$primaryKeyColumn = getTablePrimaryKeyName($tableName);
	$bNumeric = isColNumeric($tableName,$primaryKeyColumn);
	$strQuote = ($bNumeric)?"":"'";

	$parsedKeyValues = "";
	$arrKeyValues = explode(",",$keyValues);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		if($parsedKeyValues!="")$parsedKeyValues .= ",";
		$parsedKeyValues .= $strQuote.PrepareForSql($keyValue).$strQuote;
	}

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() ." where ". $primaryKeyColumn ." in (" . $parsedKeyValues .")". swfc_orderby();
?>