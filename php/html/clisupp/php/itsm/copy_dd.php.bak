<?php
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classcreatelocalsession.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/helpers/language.php');
	
	//-- Initialise logging
	$strInstallpath = sw_getcfgstring("InstallPath");
	$strLogFilePathName = $strInstallpath . "\\log\\itsm_default_copy.log";
	$logfile = fopen($strLogFilePathName, "w");

	// -- Create a session
	$session = new classCreateLocalSession();
	if(!$session->IsValidSession())
	{
		fwrite($logfile, "Unable to establish a database connection. This script will not continue running.\n");
		exit;
	}
	
	//-- Create 2 connections, 1 for the retrieving the records and 1 for inserting new records
	$conDbSettings = new CSwDbConnection;
	$conDbInsert = new CSwDbConnection;

	//-- Connect
	fwrite($logfile, "Establishing DB Connection...\n");
	if(!$conDbInsert->Connect("","","") || 
	   !$conDbSettings->Connect("","",""))
	{
		fwrite($logfile, "Unable to establish a database connection. This script will not continue running.\n");
		exit(1);
	}
	fwrite($logfile, "Connected to Database.\n");

	//-- Set dd names from passed in parameters
	$arrOldDDName = explode("=",$argv[1]);
	$arrNewDDName = explode("=",$argv[2]);
	$strOldDDName = $arrOldDDName[1];
	$strNewDDName = $arrNewDDName[1];
	fwrite($logfile, "Starting post copy actions ( " . $strOldDDName . " -> " . $strNewDDName . " ) ...\n");
	
	fwrite($logfile, "Starting copy settings...\n");

	//-- load settings to copy
	$strSelectSettings = "SELECT setting_name, setting_value, description, toplevelcategory FROM sw_sbs_settings WHERE appcode='" . $strOldDDName . "'";
	fwrite($logfile, "	" . $strSelectSettings . "\n");
	$conDbSettings->Query($strSelectSettings);
	while ($conDbSettings->Fetch())
	{
			//-- insert new settings
			$strSettingName = pfs($conDbSettings->GetValue("setting_name"));
			$strSettingValue = pfs($conDbSettings->GetValue("setting_value"));
			$strDescription = pfs($conDbSettings->GetValue("description"));
			$strTopLevelCategory = pfs($conDbSettings->GetValue("toplevelcategory"));
			
			$strInsertSettings = "INSERT INTO sw_sbs_settings (setting_name, setting_value, description, toplevelcategory, appcode) " .
								 "VALUES (" . 
								 "'" . $strSettingName . "'," .
								 "'" . $strSettingValue . "'," .
								 "'" . $strDescription . "'," .
								 "'" . $strTopLevelCategory . "'," .
								 "'" . $strNewDDName . "')";
			
			fwrite($logfile, "	" . $strInsertSettings . "\n");
			$conDbInsert->Query($strInsertSettings);
	}
	fwrite($logfile, "Copy settings complete.\n");
	
	fwrite($logfile, "Starting copy call class default SLA data...\n");
	
	$strSelectClassSLADefault = "SELECT callclass, fk_slad, fk_slad_name, fk_priority, flg_use_sla_rules FROM itsm_sla_default WHERE appcode='" . $strOldDDName . "'";
	fwrite($logfile, "	" . $strSelectClassSLADefault . "\n");
	$conDbSettings->Query($strSelectClassSLADefault);
	
	while ($conDbSettings->Fetch())
	{
			//-- insert new settings
			$strCallclass = pfs($conDbSettings->GetValue("callclass"));
			$strSLAID = pfs($conDbSettings->GetValue("fk_slad"));
			$strSLAName = pfs($conDbSettings->GetValue("fk_slad_name"));
			$strPriority = pfs($conDbSettings->GetValue("fk_priority"));
			$strFlgUseSLARules = pfs($conDbSettings->GetValue("flg_use_sla_rules"));
			
			$strInsertClassSLADefault = "INSERT INTO itsm_sla_default (callclass, fk_slad, fk_slad_name, fk_priority, flg_use_sla_rules, appcode) " .
								 "VALUES (" . 
								 "'" . $strCallclass . "'," .
								 "'" . $strSLAID . "'," .
								 "'" . $strSLAName . "'," .
								 "'" . $strPriority . "'," .
								 "'" . $strFlgUseSLARules . "'," .
								 "'" . $strNewDDName . "')";
			
			fwrite($logfile, "	" . $strInsertClassSLADefault . "\n");
			$conDbInsert->Query($strInsertClassSLADefault);
	}
	
	fwrite($logfile, "Copy call class default SLA data complate.\n");

	fwrite($logfile, "Post script actions complete.\n");
	fclose($logfile);
	exit(0);

?>