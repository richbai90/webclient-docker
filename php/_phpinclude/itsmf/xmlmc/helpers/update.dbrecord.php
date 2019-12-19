<?php
	include_once('itsmf/xmlmc/common.php');

	//-- make sure user has passed in what we expect
	$dbtable = gv('dbtable');
	if($dbtable=="")
	{
		echo "<font style='color:red'>The update table was not specified. Please contact your Supportworks administrator.</font>";
		exit;
	}

	$dbkeycol = gv('dbkeycol');
	if($dbkeycol=="")
	{
		echo "<font style='color:red'>The table key column was not specified. Please contact your Supportworks administrator.</font>";
		exit;
	}

	$dbkeyvalue = gv('dbkeyvalue');
	if($dbkeyvalue=="")
	{
		echo "<font style='color:red'>The table key value was not specified. Please contact your Supportworks administrator.</font>";
		exit;
	}


	$dbdsn = gv('dbdsn');
	if(strtolower($dbdsn)=="swdata")
	{
		$dbuid = swuid();
		$dbpwd = swpwd();
	}
	elseif(strtolower($dbdsn)=="syscache")
	{
		$dbuid = swcuid();
		$dbpwd = swcpwd();
	}
	else
	{
		$dbuid = gv('dbuid');
		$dbpwd = gv('dbpwd');
	}


	//-- create connection to dbCONN if we dont have one
	$dbCONN = new CSwDbConnection;
	if(!$dbCONN->Connect($dbdsn,$dbuid,$dbpwd))
	{
		echo "<font style='color:red'>Failed to create database connection to (".htmlentities($dbdsn,ENT_QUOTES,'UTF-8')."). Please contact your Supportworks administrator.</font>";
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
		echo "<font style='color:red'>The update table (".htmlentities($dbtable,ENT_QUOTES,'UTF-8').") column info was not found. Please contact your Supportworks administrator.</font>";
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
			if(isset($HTTP_GET_VARS[$check_var]))
			{
			    $intType = swdti_getdatatype($dbtable.".".$colname);
			    $strEncaps = ($intType==8||$intType==-1)?"'":"";

				//-- append update str
				if($strUpdateCols!="")$strUpdateCols.=", ";
				$strUpdateCols.= $colname ."=" . $strEncaps . lang_encode_from_utf(pfs($HTTP_GET_VARS[$check_var])) . $strEncaps;
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

	$evalphp=gv('evalphp');
	if($evalphp!="")
	{
		eval($evalphp.";");
	}
?>
