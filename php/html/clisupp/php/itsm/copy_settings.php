<?php
	echo "<hr>Starting<hr>";
	
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classcreatelocalsession.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/helpers/language.php');
	
	//-- Initialise logging
	$installpath = sw_getcfgstring("InstallPath");
	$logfile = $installpath . "\\log\\sbs_copy_settings.log";
	$logfp = fopen($logfile, "w");
	$intErrorCount = 0;
	
	function logwrite($msg,$type = "[INFO]")
	{
		global $logfp;
		$log = "";
		$date = date('d/m/Y H:i:s',time());
		$log = $date . "	" . $type . "	" . $msg . "\r\n";
		echo "<br>" . $log; // caters for running from a browser
		fwrite($logfp,$log);
		return;
	}
	
	// -- Create a session
	$session = new classCreateLocalSession();
	if(!$session->IsValidSession())
	{
		logwrite("Unable to establish a session.","[ERROR]");
		logwrite("This script will not continue running.");
		fclose($logfp);
		exit;
	}
	
	//-- Create 3 connections
	$conDbSettings = new CSwDbConnection;
	$conDbInsert = new CSwDbConnection;
	$conDbSWTSettings = new CSwDbConnection;

	//-- Connect
	if(!$conDbInsert->Connect("","","") || 
	   !$conDbSettings->Connect("","","") ||
	   !$conDbSWTSettings->Connect("","",""))
	{
		logwrite("Unable to establish a database connection.", "[ERROR]");
		logwrite("Script will not continue.");
		fclose($logfp);
		exit;
	}
	logwrite("Connected to Database.");

	logwrite("Checking for existing system settings...");

	$strSelectSettings = "SELECT pk_setting, setting_value, description, toplevelcategory FROM sw_settings";
	logwrite($strSelectSettings,"[SQL]" );
	if(!$conDbSettings->Query($strSelectSettings))
	{
		logwrite("Query Failed: " . $conDbSettings->_lasterror,"[ERROR]");
	}
	else
	{
		logwrite("Query OK");
		logwrite($conDbSettings->_effectedrowcount . " existing system settings found.");
		$intInserts = 0;
		
		while ($conDbSettings->Fetch())
		{
			//-- Get new setting values
			$strSettingName = pfs($conDbSettings->GetValue("pk_setting"));
			$strSettingValue = pfs($conDbSettings->GetValue("setting_value"));
			$strDescription = pfs($conDbSettings->GetValue("description"));
			$strTopLevelCategory = pfs($conDbSettings->GetValue("toplevelcategory"));
			
			//-- insert new settings
			$strInsertSettings = "INSERT INTO sw_sbs_settings (setting_name, setting_value, description, toplevelcategory, appcode) " .
								 "VALUES (" . 
								 "'" . $strSettingName . "'," .
								 "'" . $strSettingValue . "'," .
								 "'" . $strDescription . "'," .
								 "'" . $strTopLevelCategory . "'," .
								 "'itsm')";
			
			logwrite($strInsertSettings,"[SQL]");
			if($conDbInsert->Query($strInsertSettings))
			{
				logwrite("Query OK");
				$intInserts++;
			}
			else
			{
				//-- insert failed
				$intErrorCount++;
				logwrite("Query Failed: " . $conDbInsert->_lasterror,"[ERROR]");
			}
		}
		logwrite($intInserts . " new system settings inserted.");
	}
	
	// -- CH00128238 - Copy Supportworks Today settings (sys_sett_swtoday) into System Settings (sw_sbs_settings) if an upgrade
	// -- Return True/False based on the setting value
	function returnSettingValue($intValue)
	{
		$strSettingValue = ($intValue==1) ? "True" : "False";
		return $strSettingValue;
	}
	
	logwrite("Checking for existing SW Today settings...");
	$strSelectSWTSettings = "SELECT * FROM sys_sett_swtoday WHERE pk_key = 1";
	logwrite($strSelectSWTSettings,"[SQL]");
	if(!$conDbSWTSettings->Query($strSelectSWTSettings))
	{
		$intErrorCount++;
		logwrite("Query Failed: " . $conDbSWTSettings->_lasterror,"[ERROR]");
	}
	else
	{
		logwrite("Query OK");
		// -- Store Supportworks Today settings in an array
		if(!$conDbSWTSettings->Fetch())
		{
			logwrite("No existing SW Today settings found.");
		}
		else
		{
			logwrite("Existing SW Today settings found.");
			$arrSettings['SWTODAY.REPORTTAB1.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showreporttab1"));
			$arrDescription[0] = "Show report tab 1 on Supportworks Today page";
			$arrSettings['SWTODAY.REPORTTAB2.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showreporttab2"));
			$arrDescription[1] = "Show report tab 2 on Supportworks Today page";
			$arrSettings['SWTODAY.REPORTTAB3.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showreporttab3"));
			$arrDescription[2] = "Show report tab 3 on Supportworks Today page";
			$arrSettings['SWTODAY.NOTIFICATION.SA.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showServiceAvailability"));
			$arrDescription[3] = "Show service availability on Supportworks Today page";
			$arrSettings['SWTODAY.NOTIFICATION.PROBLEMS.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showProblems"));
			$arrDescription[4] = "Show problem notifications on Supportworks Today page";
			$arrSettings['SWTODAY.NOTIFICATION.KE.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showKnownErrors"));
			$arrDescription[5] = "Show known error notifications on Supportworks Today page";
			$arrSettings['SWTODAY.NOTIFICATION.CS.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showChangeSchedule"));
			$arrDescription[6] = "Show change schedule notifications on Supportworks Today page";
			$arrSettings['SWTODAY.NOTIFICATION.AUTH.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showAuth"));
			$arrDescription[7] = "Show pending authorisations on Supportworks Today page";
			$arrSettings['SWTODAY.NOTIFICATION.MI.SHOW'] = returnSettingValue($conDbSWTSettings->GetValue("showMI"));
			$arrDescription[8] = "Show major incident notifications on Supportworks Today page";
		}
		// -- Insert each Supportworks Today setting into sw_sbs_settings (System Settings) table
		$intCounter = 0;
		foreach($arrSettings as $strSettingName => $strSettingValue)
		{
			$strInsertSWTSettings = "INSERT INTO sw_sbs_settings (setting_name, setting_value, description, toplevelcategory, appcode) " .
			 "VALUES (" . 
			 "'" . $strSettingName . "'," .
			 "'" . $strSettingValue . "'," .
			 "'" . $arrDescription[$intCounter] . "'," .
			 "'SWTODAY'," .
			 "'itsm')";
			logwrite($strInsertSWTSettings,"[SQL]"); 
			if($conDbInsert->Query($strInsertSWTSettings))
			{
				logwrite("Query OK");
				$intCounter ++;
			}
			else
			{
				$intErrorCount++;
				logwrite("Query Failed: " . $conDbInsert->_lasterror,"[ERROR]");
			}
		}
		logwrite($intCounter . " SW Today settings inserted into system settings.");
	}
	// -- END - CH00128238
	
	logwrite("Script completed with " . $intErrorCount . " errors.");
	fclose($logfp);
	echo "<hr>Finished<hr>";
?>