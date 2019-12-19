<?php
	include_once('itsm_default/xmlmc/common.php');

	$dbtable = htmlentities ($_SESSION['config_ac_table']);
	$dbkeycol = htmlentities ($_SESSION['customerpkcolumn']);
	$dbkeyvalue = htmlentities ($_SESSION['customerpkvalue']);
	
	//-- TK F0108281
	foreach ($_REQUEST as $key => $value)
		$_REQUEST[$key] = htmlentities ($value);
		
	$dbdsn = swdsn();
	$dbuid = swuid();
	$dbpwd = swpwd();

	//-- make sure user has passed in what we expect
	if($dbtable=="")
	{
		echo "<font style='color:red'>The update table was not specified. Please contact your Supportworks administrator.</font>";
		exit;
	}

	if($dbkeycol=="")
	{
		echo "<font style='color:red'>The table key column was not specified. Please contact your Supportworks administrator.</font>";
		exit;
	}

	if($dbkeyvalue=="")
	{
		echo "<font style='color:red'>The table key value was not specified. Please contact your Supportworks administrator.</font>";
		exit;
	}


	//-- create connection to dbCONN if we dont have one
	$dbCONN = new CSwDbConnection;
	if(!$dbCONN->Connect($dbdsn,$dbuid,$dbpwd))
	{
		echo "<font style='color:red'>Failed to create database connection to (".$dbdsn."). Please contact your Supportworks administrator.</font>";
		exit;
	}

	//-- do we need prikey to be encaps
    $intType = swdti_getdatatype($dbtable.".".$dbkeycol);
    $strEncaps = ($intType==8||$intType==-1)?"'":"";
	$dbkeyvalue = $strEncaps.pfs($dbkeyvalue).$strEncaps;


	//-- get column info for table - so we can check update type (numeric or string) - for this we need to select the record first
	$rsRecord = $dbCONN->Query("select * from ".$dbtable." where ".$dbkeycol." = ". $dbkeyvalue,true);
	if($rsRecord==false)
	{
		echo "<font style='color:red'>The update table (".$dbtable.") column info was not found. Please contact your Supportworks administrator.</font>";
		exit;
	}

	$strUpdateCols="";
	if(!$rsRecord->eof)
	{
		//-- loop through each row column
		foreach ($rsRecord->recorddata[$rsRecord->currentrow] as $colname => $aCol) 
		{
			//-- for each column in table check if we want to update it
			$check_var = $dbtable. "_" . $colname;
			if(isset($_REQUEST[$check_var]))
			{
			    $intType = swdti_getdatatype($dbtable.".".$colname);
			    $strEncaps = ($intType==8||$intType==-1)?"'":"";

				//-- append update str
				if($strUpdateCols!="")$strUpdateCols.=", ";
				$strUpdateCols.= $colname ."=" . $strEncaps . lang_encode_from_utf(pfs($_REQUEST[$check_var])) . $strEncaps;
			}
		}
		$rsRecord->movenext();
	}

	//-- do we have anything to update
	if($strUpdateCols!="")
	{
		$strUpdateCols = "update ". $dbtable . " set " . $strUpdateCols . " where ". $dbkeycol ."=". $dbkeyvalue;
	}

	if(!$dbCONN->Query($strUpdateCols))
	{
		echo "<font style='color:red'>Failed to process the table update. Please contact your Supportworks administrator.</font>";
		exit;
	}
	$dbCONN->Close();
	return;
?>
