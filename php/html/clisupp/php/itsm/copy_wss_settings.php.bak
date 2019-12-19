<?php
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classcreatelocalsession.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/helpers/language.php');
	
	//-- Initialise logging
	$strInstallpath = sw_getcfgstring("InstallPath");
	$strLogFilePathName = $strInstallpath . "\\log\\wss_settings_copy.log";
	$logfile = fopen($strLogFilePathName, "a+");
	
	$boolVerboseLogging = false;

	function logwrite($message, $type = "INFO ")
	{
		global $logfile;
		fwrite($logfile, date("Y-m-d H:i:s") . "[CPWSS]:[".$type."]:[1234]: " . $message. "\r\n");
	}
	
	// -- Create a session
	$session = new classCreateLocalSession();
	if(!$session->IsValidSession())
	{
		logwrite("Unable to establish a database connection. This script will not continue running.", "ERROR");
		exit;
	}
	
	//-- Create 2 connections, 1 for the retrieving the records and 1 for inserting new records
	$conDbSettings = new CSwDbConnection;
	$conDbInsert = new CSwDbConnection;

	//-- Connect
	logwrite("Establishing DB Connection...");
	if(!$conDbInsert->Connect("","","") || 
	   !$conDbSettings->Connect("","",""))
	{
		logwrite("Unable to establish a database connection. This script will not continue running.", "ERROR");
		exit(1);
	}
	if ($boolVerboseLogging)
		logwrite("Connected to Database.");

	//-- Set WSS Instance names from passed in parameters (newest first then the source)
	$arrNewWssInstance = explode("=",$argv[1]);
	$arrOldWssInstance = explode("=",$argv[2]);
	$strNewWssInstance = $arrNewWssInstance[1];
	$strOldWssInstance = $arrOldWssInstance[1];
	
	logwrite("Starting post copy actions. ( Supplied details: " . $strOldWssInstance . " -> " . $strNewWssInstance . " ) ...");
	
	// Cater for creating a new instance based on a blank instance
	if ($strOldWssInstance == "_template") // This value is hard coded in the platform when a new instance is based on a blank one
		$strOldWssInstance = "__default__"; // The instance ID which identifies the default data which is shipped with the ITSM_Default application

	// If the source instance is NOT blank
	if ($strOldWssInstance != "__default__")
	{		
		// Check that there is data in the wssm_admin table for the supplied Source Instance.
		$strCountSourceSettings = "SELECT COUNT(wss_instance_id) AS ct FROM wssm_admin WHERE wss_instance_id='" . $strOldWssInstance . "'";
		if ($boolVerboseLogging)
			logwrite("SQL Count Source Settings: " . $strCountSourceSettings);
		
		$conDbSettings->Query($strCountSourceSettings);
		while ($conDbSettings->Fetch())
		{
			//-- insert new settings			
			$strCountSettings = pfs($conDbSettings->GetValue("ct"));
		}
		if ($strCountSettings < 1) // if no data, use the default settings
		{
			logwrite("There are no settings for the Source Instance, hence using the default settings");
			$strOldWssInstance == "__default__"; // There are no settings for the Source Instance so we need to pull the data from the default
		}
	}
	
	// Remove any settings for the new instance
	$strDeleteSettings = "DELETE FROM wssm_admin WHERE wss_instance_id='" . $strNewWssInstance . "'";
	if ($boolVerboseLogging)
		logwrite("SQL Delete settings for new instance: " . $strDeleteSettings);
	$conDbSettings->Query($strDeleteSettings);
	logwrite("Deleted any settings which existed for the new Instance so that a new set of defaults can be applied");
	
	logwrite("Starting copy SelfService Instance Settings. ( Working details " . $strOldWssInstance . " -> " . $strNewWssInstance . " ) ...");
	
	//-- load settings to copy
	$strSelectSettings = "SELECT wss_instance_id, wss_config_id, wss_config FROM wssm_admin WHERE wss_instance_id='" . $strOldWssInstance . "'";
	if ($boolVerboseLogging)
		logwrite("SQL Select source settings: " . $strSelectSettings);
	
	$conDbSettings->Query($strSelectSettings);
	while ($conDbSettings->Fetch())
	{
		//-- insert new settings			
		$strInstanceId = pfs($conDbSettings->GetValue("wss_instance_id"));
		$strConfigId = pfs($conDbSettings->GetValue("wss_config_id"));
		$strConfigValue = pfs($conDbSettings->GetValue("wss_config"));
		
		$strInsertSettings = "INSERT INTO wssm_admin (wss_instance_id, wss_config_id, wss_config) " .
							 "VALUES (" . 
							 "'" . $strNewWssInstance . "'," .
							 "'" . $strConfigId . "'," .
							 "'" . $strConfigValue . "')";
		
		if ($boolVerboseLogging)
			logwrite("SQL Insert new settings: " . $strInsertSettings);
		$conDbInsert->Query($strInsertSettings);
	}
	logwrite("Copy WSS settings complete.");
	
	fclose($logfile);
	exit(0);

?>