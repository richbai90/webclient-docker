<?php
	//IncludeApplicationPhpFile("itsm.helpers.php");
	//Get Session UserID
	$strCustId = trim($session->selfServiceCustomerId);
	$strWSSInstance = $session->analystId;

	$logFile = 'wss_log.log';
	$path = sw_getcfgstring("InstallPath")."\\log\\";
	$strLog = $path.$logFile;

	$strDate = date("Y-m-d H:i:s");
	$strLogClass = $_POST['logclass'];
	$strLogType = $_POST['logtype'];
	$strLogID = '0';
	$strLogDesc = $_POST['logdesc'];
	$strLogSource = $_POST['logsource'];

	$strLogDesc = "[".$strWSSInstance."] [".$strCustId."] [".$strLogSource."] ".$strLogDesc;

	$strLogEntry = $strDate." [".str_pad($strLogClass, 5)."]";
	$strLogEntry .= ":[".str_pad($strLogType, 5)."]";
	$strLogEntry .= ":[".$strLogID."] ";
	$strLogEntry .= $strLogDesc."\r\n";

	$handle = fopen($strLog, "a");
	fwrite($handle, $strLogEntry);
	fclose($handle);
	throwSuccess();
