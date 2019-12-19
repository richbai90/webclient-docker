<?php
// -- Hornbill - CMDB Determine Import Actions
// -- 28/01/2013 Trevor Killick
include('php5requirements.php');
include('swdatabaseaccess.php');
include_once('itsm_default/xmlmc/xmlmc.php');

define('_DISPLAY_ERROR', true);

//--No Timelimit
 set_time_limit(0);

//--TK Debug Times
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$start = $time;

//--DEPENDENCIES
//-- Set Memory Limit

ini_set('memory_limit', '32M');

//--Variables
$strVerbose = 1; //-- Enable Extra Logging // set to 1 for extra debugging
$processCount = 0;
$strProcessID = 0;//--Used To Determin the Process ID of the cmdb_stage_audit record to process

//-- Prepare for SQL and escape slashes
function pfs_escape_slashes($var)
{
	$var = str_replace("'","''",$var);
	$var = str_replace("\\","\\\\",$var);
	return $var;
}

//--Log Action Function
function log_actions($message)
{
	//global $swinstallpath;
	$swinstallpath = sw_getcfgstring("InstallPath");
	$log = fopen($swinstallpath.'\log\cmdb_dia.log', "a+");
	fwrite($log, "\r\n". date("d.m.y H:i:s") . " - " . $message);
	fclose($log);
}

//-- connection to swdata
$conn3 = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 

//--ODBC SubmitSQL
function submitsqlODBC($strSQL)
{
	global $strVerbose, $conn3;
	
	//-- fetch result pointer
	$result = odbc_exec($conn3, $strSQL);
	if($result)
	{
		if($strVerbose)log_actions("SQL: ".$strSQL);
		return true;
	}else
	{
		if($strVerbose)log_actions("SQL [ERROR]: ".$strSQL);
		return false;
	}
}
//--Get Server Root
$swinstallpath = sw_getcfgstring("InstallPath");

log_actions("SW Install Path = $swinstallpath");
if(strlen($swinstallpath) < 5)
{
	log_actions("Could Not Get Install Path for Supportworks");
	die;
}

//Get Core Services Root
$csinstallpath = sw_getcfgstring("CS\\InstallPath");

log_actions("CS Install Path = $csinstallpath");
if(strlen($csinstallpath) < 5)
{
	log_actions("Could Not Get Install Path for Core Services");
	die;
}

//--Includes
include_once("_includes/cmdb.helpers.php");//--CMDB Helpers from Stored Query

//CHECK IF THERE IS A PROCESS TO BE PROCESSED BY CMDB_DIA
$strSQL = "select * from cmdb_stage_audit where status='Awaiting schedule'";
$result = odbc_exec($conn3, $strSQL);

//-- fetch 1 row at a time as an object from the db
while ($row = odbc_fetch_object($result)) 
{
  //-- note &$row - this pass in pointer to $row 
   $id_row = grv($row,"pk_id");
   $status_row = grv($row,"status");
}

if (empty($id_row)){
	log_actions("There are no process with a status of Awaiting schedule");
	exit();
}

$strProcessID=$id_row;

//-- get row value (to support oracle)
function grv($aRow,$strColName)
{
   if(isset($aRow->$strColName))
   {
		  return $aRow->$strColName;
   }
   else
   {
	  $uColName = strToUpper($strColName);
	  if(isset($aRow->$uColName))
	  {
		  return $aRow->$uColName;
	  }
	  else
	  {
		  return null;
	  }
   }
}

//--Function to Update Audit Table when Starting
function start_process($strProcessID)
{
	//--Update Audit Table
	$strSQL = "update CMDB_STAGE_AUDIT set EXE_STARTX = '".time()."' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Starting");
	}else
	{
		//-- When starting as the client needs to know the process has started exit if unable to update table
		log_actions("Unable to Update Audit Table");
		exit();
	}
	//--Update Audit Table Status
	$strSQL = "update CMDB_STAGE_AUDIT set STATUS = 'Processing' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Starting");
	}else
	{
		//-- When starting as the client needs to know the process has started exit if unable to update table
		log_actions("Unable to Update Audit Table");
		exit();
	}
}

//--Function to Update Audit Table when Finnishing
function end_process($strProcessID,$processCount, $boolErrorInData)
{
	$time = time();
	//--Update Audit Table
	$strSQL = "update CMDB_STAGE_AUDIT set EXE_ENDX = '".$time."' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Ending");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}
	
	//-- Update Process Count
	$strSQL = "update CMDB_STAGE_AUDIT set RECORD_PROC = '".$processCount."' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Ending");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}
	
	//-- Set Status to Complete
	$strSQL = "update CMDB_STAGE_AUDIT set STATUS = 'Complete' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Status");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}

	if ($boolErrorInData)
		$result='Error in data';
	else
		$result='Success';

	//-- Set Result to Sucess
	$strSQL = "update CMDB_STAGE_AUDIT set RESULT = '".$result."' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Status");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}
	
	//-- Update Percentage
	$strSQL = "update CMDB_STAGE_AUDIT set PER_COMPLETE = '100' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Percentage");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}
}


//-- Update Process FAILED
//-- Used if script needs to exit then attempt to update Audit table first then exit script
function fail_process($strProcessID,$strError)
{	
	$time = time();
	//--Update Audit Table Time
	$strSQL = "update CMDB_STAGE_AUDIT set EXE_ENDX = '".$time."' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Ending");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}
	$strSQL = "update CMDB_STAGE_AUDIT set STATUS = 'Error' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Status");
	}else
	{
		log_actions("Unable to Update Audit Table");
	}
	//-- Update Result
	$strSQL = "update CMDB_STAGE_AUDIT set RESULT = '".pfs_escape_slashes($strError)."' where pk_id = '".$strProcessID."'";
	if(submitsqlODBC($strSQL))
	{
		log_actions("Updated Audit Table - Result");
		exit();
	}else
	{
		log_actions("Unable to Update Audit Table - [Error]".$strError);
		exit();
	}

}
//--End Functions

//-- Starting
log_actions("Starting Determin Import Actions");

// -- Create a session
include_once('itsm_default/xmlmc/classcreatelocalsession.php');
$session = new classCreateLocalSession();
if(!$session->IsValidSession())
{
	log_actions("Unable to establish a session. This script will not continue running.\n");
	exit;
}
	
include_once('_includes/helpers.php');
include_once("_includes/index.helpers.php");//--Index from Stored Query

//--Loaded Extensions
if($strVerbose)log_actions("Loading PHP Extensions ");
foreach (get_loaded_extensions() as $exten)
{
	if($strVerbose)log_actions("Loaded Extension: ".$exten);
	
}

//--Call Start Function to Updated Audit Table
if(isset($strProcessID))
{
	log_actions("Processing record: " . $strProcessID);
	start_process($strProcessID);
}
else
{
	log_actions("No ProcessID So End");
	exit();
}

if($strVerbose)log_actions("Running in Verbose");

//--CMDB Class
$cmdb = new cmdbFunctions();

//--System Feild Check Function
function isSystemField($colName)
{
	switch($colName)
	{
		case "baselineid":
		case "cmdb_status":
		case "flg_inherit_reqtypes":
		case "import_action":
		case "import_analystid":
		case "import_datex":
		case "import_newtype":
		case "import_status":	
		case "ck_config_item":
		case "fk_status_level":		
			return true;
	}
	return false;
}


//-- load dd schem info info

$dd = new dd('cmdb_stage,config_itemi');

$collectionTables = Array(); // storing the list of database tables which have already been processed so that we don't try to get their info a second time
array_push($collectionTables, "cmdb_stage", "config_itemi");



$arrActions = Array();
$arrCITypes = Array();
$arrKey = Array();
$arrValues = Array();
$arrConfigItem = Array();
$arrTrimCI = Array();
$arrTest = Array();

//-- delete current stage fields
$strDeleteStageField = "delete from CMDB_STAGEFIELDS";
submitsqlODBC($strDeleteStageField);
if($strVerbose)log_actions($strDeleteStageField);
$strImportStatus = "";

//-- connection to swdata
$conn = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 
$conn2 = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 
$conn5 = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 
$conn6 = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 
$conn8 = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 
$conn11 = odbc_connect(swdsn(), swuid(), swpwd()) or die(odbc_error_msg()); 

//--Create Array Of Config ID's
$strSelect = "select CK_CONFIG_ITEM from cmdb_stage";
if($strVerbose)log_actions("select CK_CONFIG_ITEM from cmdb_stage");

//-- fetch result pointer
$result = odbc_exec($conn, $strSelect);
$i=0;
//-- fetch 1 row at a time as an object from the db
while ($row = odbc_fetch_object($result)) 
{
	//-- note &$row - this pass in pointer to $row 
	$arrConfigItem[$i] = grv($row,"CK_CONFIG_ITEM");
	//-- do your row processing here
	//-- Remove leading and trailing spaces in CI IDs
	$strToTrim = $arrConfigItem[$i];
	$arrTrimCI[$i] = pfs_escape_slashes(trim($strToTrim));
	if ($arrTrimCI[$i]!= $arrConfigItem[$i])
	{
	  $strUpdate = "UPDATE CMDB_STAGE SET CK_CONFIG_ITEM='". $arrTrimCI[$i]."' WHERE CK_CONFIG_ITEM ='".$arrConfigItem[$i]."'";
	  odbc_exec($conn2, $strUpdate); // DTH changed to use $conn2
	  log_actions($strUpdate);
	}

   $i++;
}

$strNumRecords = count($arrTrimCI);
log_actions("Processing Array of IDs: ".$strNumRecords." Records");

$processCount = 0;
$processStartNumber = 0;
$whilecount = 0;
$loop  = 0;

// $strSelect = "select * from CMDB_STAGE where CK_CONFIG_ITEM in (select CK_CONFIG_ITEM from cmdb_stage)";
$strSelect = "select * from CMDB_STAGE";
if($strVerbose)
	log_actions("select * from CMDB_STAGE");

$boolErrorInData = false;
	
//-- fetch result pointer
$result = odbc_exec($conn, $strSelect);
//-- fetch 1 row at a time as an object from the db
while ($row = odbc_fetch_object($result)) 
{
	
	if($boolErrorInData)
	{
		break; // There is an error in the data so we are stopping any further processing
	}
	
	$processCount++;
	
	//-- Log Item Number Being Processed
	log_actions("Processing Item ".$processCount." of ".$strNumRecords."");
	$ynInvalidType = "No";
	$strImportAction = "No Changes";		
	$boolMainRecordUpdate = false;
	$boolExtRecordUpdate = false;
	$boolCreateRecord = false;
	$boolCreateExt = false;
	$boolErrorInData = false;

	$strInsertStageFields = "";
	$first_insert=1;

	$strCK_CONFIG_ITEM = grv($row,"ck_config_item");
	if($strVerbose)log_actions("Processing : ".$strCK_CONFIG_ITEM);
	
	//-- get matching config_item record if there is one
	//-- PM00127110: AlexT: added '->' to like statement in where clause
	$strSelect2 = "select * from CONFIG_ITEMI where CK_CONFIG_ITEM = '" .  pfs_escape_slashes($strCK_CONFIG_ITEM) . "' and ISACTIVEBASELINE = 'Yes' and CK_CONFIG_TYPE not like 'ME->%'";
	if($strVerbose)log_actions($strSelect2); 

	//-- fetch result pointer
	$result2 = odbc_exec($conn2, $strSelect2);
	//-- fetch 1 row at a time as an object from the db
	$oLiveConfigItemRec = NULL;
	while ($row2 = odbc_fetch_object($result2)) 
	{
		$oLiveConfigItemRec	= grv($row2,"ck_config_item");
		$oLiveConfigItemPK	= grv($row2,"pk_auto_id");
		$oLiveConfigItemType = grv($row2,"ck_config_type");
		for ($x=0; $x < count($dd->tables['cmdb_stage']->columns);$x++)
		{
			$colName = $dd->tables['cmdb_stage']->columns[$x]->Name;
			$arrTest[$colName] = grv($row2,$colName);
		}
	}
	//--Does Item Exist in CMDB
	if(isset($oLiveConfigItemRec))
	{
		$boolInCMDB = true;
		if($strVerbose)log_actions("Processing : '".$strCK_CONFIG_ITEM."', Item exists in CMDB");	
	}
	else
	{
		$boolInCMDB = false;
		if($strVerbose)log_actions("Processing : '".$strCK_CONFIG_ITEM."', Item Does Not exist in CMDB");	
		//RJC add an array of inserted fields
		$arrayInsertedFields = Array();		
	}
	
	//-- exists - so check which fields have changed and add to cmdbstagefields
	//-- for each stage field check if diff from config_itemi

	for ($x=0; $x < count($dd->tables['cmdb_stage']->columns);$x++)
	{
		$colName = $dd->tables['cmdb_stage']->columns[$x]->Name;			
		$CMDB_STAGE_VALUE = grv($row,$colName);

		if((dd_isnumeric('cmdb_stage',$colName))&&($CMDB_STAGE_VALUE==0))continue;	

		//-- fields that we do not want to check (system ones)
		if(isSystemField($colName))continue;

		//-- check if field exists in ci table			
		if (!$dd->tables['config_itemi']->namedcolumns[$colName])continue;

		if(dd_isnumeric('cmdb_stage',$colName))	$CMDB_STAGE_VALUE = fix_epoch($CMDB_STAGE_VALUE);
		$strDisplayColTxt = pfs_escape_slashes("Main [" .  dd_fieldlabel('config_itemi',$colName). "]");

		//-- if this is an new record
		if (!$boolInCMDB)
		{			
			if($CMDB_STAGE_VALUE!="")
			{
				if ($x!=0 && !$first_insert)
					$strInsertStageFields .=",";	

				$first_insert=0;

				$strInsertStageFields .= "('".pfs_escape_slashes($strCK_CONFIG_ITEM) . "','" . $strDisplayColTxt . "','" .  $colName . "','config_itemi','','" .  pfs_escape_slashes($CMDB_STAGE_VALUE) . "')";
				//RJC Add every insert into the array
				array_push($arrayInsertedFields,$colName);	
				$boolCreateRecord = true;	
			}			
		}
		else //-- this is an update
		{
			$oTemp = $arrTest[$colName];
			if(isset($oTemp))
			{
				//-- if values differ and stage value is not empty put into a field table (so we only update the changed fields and can show analyst which ones)
				if(($oTemp!=$CMDB_STAGE_VALUE)&&($CMDB_STAGE_VALUE!=""))
				{
					if ($x!=0 && !$first_insert)
						$strInsertStageFields .=",";	
					
					$first_insert=0;
					$strInsertStageFields .= "('".pfs_escape_slashes($strCK_CONFIG_ITEM) . "','" . $strDisplayColTxt . "','" .  $colName . "','config_itemi','" .  pfs_escape_slashes($arrTest[$colName]) . "','" .  pfs_escape_slashes($CMDB_STAGE_VALUE) . "')";	
					$boolMainRecordUpdate = true;
				}
			}
		}	
	}
	
	//-- extended tables
	////////////////////////////////////////////////////
	
	//--if this is a create
	if (!$boolInCMDB)
	{
		//--
		//-- 28.05.2008 - nwj - add any default fields to main record where we are inserting
		foreach($ARRAY_CMDBSTAGING_DEFAULTVALUES as $strFieldName => $CMDB_STAGE_VALUE) 
		{
			if($CMDB_STAGE_VALUE!="")
			{
				//RJC if there is no value set already, add the default
				if(!isset($arrayInsertedFields[$strFieldName]))
				{									
					$strDisplayColTxt = pfs_escape_slashes("Main [" .  dd_fieldlabel('config_itemi',$strFieldName). "]");

					if(!$first_insert)
						$strInsertStageFields.=",";

					$strInsertStageFields.="('" .  pfs_escape_slashes($strCK_CONFIG_ITEM) . "','" . $strDisplayColTxt . "','" .  $strFieldName . "','config_itemi','','" .  pfs_escape_slashes($CMDB_STAGE_VALUE) . "')";
					$first_insert=0;
				}
			}												
		}

		$strCIType = grv($row,"ck_config_type");
		$rec = false;
		if(isset($arrCITypes[$strCIType]))
		{
			$rec = $arrCITypes[$strCIType];
		}
		else
		{
			$sql5 = "SELECT * from CONFIG_TYPEI where PK_CONFIG_TYPE = '".$strCIType."'"; 
			if($strVerbose) log_actions("Retrieving Configuration Type information: ".$sql5);
			//-- fetch result pointer
			$result5 = odbc_exec($conn5, $sql5);
			//-- fetch 1 row at a time as an object from the db
			$rec = odbc_fetch_object($result5);
		}

		if($rec)
		{
			//-- if there is a staging table for the extended table
			$ExtConfigTable = $rec->extended_table;
			if($strVerbose) log_actions("Processing information for extended table: ".$ExtConfigTable);	

			if (strcmp($ExtConfigTable,"")!=0)
			{
				$StageExtConfigTable = $ExtConfigTable . "_stage";
				//-- load table schema info
				//check if the table is not load in the datadictionary
				if (!in_array($StageExtConfigTable, $collectionTables))
				{
					if($strVerbose) log_actions("Loading Table Information from extended table (1): " . $StageExtConfigTable);
					//-- get live extended record - then check which fields have changed
					if($dd->loadTable($StageExtConfigTable,"swdata",true)!==false)
					{
						array_push($collectionTables, $StageExtConfigTable);
						if($strVerbose)
							log_actions("Successfully loaded Table Information from extended table (1): " . $StageExtConfigTable);
					}
					else
					{
						log_actions("Error loading CI Extended table (1) for ".$strCK_CONFIG_ITEM. ". Table: " . $StageExtConfigTable);
						$boolErrorInData = true;
						continue;
					}
				}

				//-- get stage extended record (stage table should have pk of ck_config_item
				//--Get Priamry key
				$strPrimaryKey = getTablePrimaryKeyName($ExtConfigTable);
				$sql6 = "SELECT * from ".UC($StageExtConfigTable)." where CK_CONFIG_ITEM = '".pfs_escape_slashes($strCK_CONFIG_ITEM)."'"; 
				//-- fetch result pointer
				$result6 = odbc_exec($conn6, $sql6);
				$recStageExt = odbc_fetch_object($result6);
				if($recStageExt)
				{
					//check if the table is not loaded in the datadictionary
					if (!in_array($ExtConfigTable, $collectionTables)) 
					{
						if($strVerbose) log_actions("Loading Table Information from extended table (2): " . $ExtConfigTable);
						//-- get live extended record - then check which fields have changed

						if($dd->loadTable($ExtConfigTable,"swdata",true)!==false)
						{
							array_push($collectionTables, $ExtConfigTable); 
							if($strVerbose)
								log_actions("Successfully loaded Table Information from extended table (2): " . $ExtConfigTable);
						}
						else
						{
							log_actions("Error loading CI Extended table (2) for ".$strCK_CONFIG_ITEM. ". Table: " . $ExtConfigTable);
							$boolErrorInData = true;
							continue;
						}
					}

	
					for ($x=0; $x < count($dd->tables[$StageExtConfigTable]->columns);$x++)
					{
						//-- fields that we do not want to check (system ones)
						//-- if field exists in live table
						$colName = $dd->tables[$StageExtConfigTable]->columns[$x]->Name;
						if(isSystemField($colName))
							continue;
						if (!isset($dd->tables[$ExtConfigTable]->namedcolumns[$colName]))
							continue;
						
						$CMDB_STAGE_VALUE = $recStageExt->$colName;
						if(dd_isnumeric($StageExtConfigTable,$colName)&&($CMDB_STAGE_VALUE==0))continue;
						//-- if the stage value is not empty put into a field table (so can show analyst which ones)
						if($CMDB_STAGE_VALUE!="")
						{
							$strDisplayColTxt = pfs_escape_slashes("Extended [" .  dd_fieldlabel($ExtConfigTable,$colName). "]");
							
							if (!$first_insert)
								$strInsertStageFields.=",";

							$strInsertStageFields.= "('" .  pfs_escape_slashes($strCK_CONFIG_ITEM) . "','" .  $strDisplayColTxt . "','" .  $colName . "','" .  $ExtConfigTable . "','','" .  pfs_escape_slashes($CMDB_STAGE_VALUE) . "')";
							$first_insert=0;
							$boolCreateExt = true;
						}//-- for each field in stage record
					}//-- get stage ext record
				}//-- ext stage table exists
			} // If we have an extended table
			else
			{
				log_actions("[ERROR]  There is no extended table defined for " . $strCIType . " and CK_CONFIG_ITEM " .$strCK_CONFIG_ITEM);
				$boolErrorInData=true;
				break;
			}
		}
		else //-- type
		{
			$ynInvalidType = "Yes";
		}		
	}  // if not in CMDB
	else //-- if this is an update
	{	
		//-- check if has an extended table - if so check ext stage record values against main extended
		$strExtTableName = $cmdb->get_extended_table($oLiveConfigItemType);
		if($strExtTableName!=false)
		{
			$StageExtConfigTable = $strExtTableName . "_stage";

			//check if the table is not load in the datadictionary
			if (!in_array($StageExtConfigTable, $collectionTables))
			{
				if($strVerbose) log_actions("Loading Table Information from extended table (3): " . $StageExtConfigTable);
				//-- get live extended record - then check which fields have changed
				if($dd->loadTable($StageExtConfigTable,"swdata",true)!==false)
				{
					array_push($collectionTables, $StageExtConfigTable);
					if($strVerbose)
						log_actions("Successfully loaded Table Information from extended table (3): " . $StageExtConfigTable);
				}
				else
				{
					log_actions("Error loading CI Extended table (3) for table: " . $StageExtConfigTable);
					$boolErrorInData = true;
					continue;
				}
			}
		
			//-- get stage extended record (stage table should have pk of ck_config_item
			$sql8 = "SELECT * from ".UC($StageExtConfigTable)." where CK_CONFIG_ITEM = '".pfs_escape_slashes($strCK_CONFIG_ITEM)."'"; 
			if($strVerbose) log_actions($sql8);
			//-- fetch result pointer
			$result8 = odbc_exec($conn8, $sql8);
			$recStageExt = odbc_fetch_object($result8);
			if($recStageExt)
			{
				//check if the table is not load in the datadictionary
				if (!in_array($strExtTableName, $collectionTables)) 
				{
					if($strVerbose) log_actions("Loading Table Information from extended table (4): " . $strExtTableName);
					//-- get live extended record - then check which fields have changed

					if($dd->loadTable($strExtTableName,"swdata",true)!==false)
					{
						array_push($collectionTables, $strExtTableName);
						if($strVerbose)
							log_actions("Successfully loaded Table Information from extended table (4): " . $strExtTableName);
					}
					else
					{
						log_actions("Error loading CI Extended table (4) for ".$strCK_CONFIG_ITEM. ". Table: " . $strExtTableName);
						$boolErrorInData = true;
						continue;
					}
				}

				//-- construct sql
				$sql11 = "SELECT * from ".UC($strExtTableName)." where PK_CI_ID = '".$oLiveConfigItemPK."'"; 
				log_actions($sql11);
				//-- fetch result pointer
				$result11 = odbc_exec($conn11, $sql11);
				$recLiveExt = odbc_fetch_object($result11);				

				for ($x=0; $x < count($dd->tables[$StageExtConfigTable]->columns);$x++)
				{
					//-- if field exists in live table
					$colName = $dd->tables[$StageExtConfigTable]->columns[$x]->Name;
					// if($strVerbose) 
						// log_actions("Extended Table Column: ".$colName);
					//-- fields that we do not want to check (system ones)
					if(isSystemField($colName))
						continue;
					$colName = $dd->tables[$StageExtConfigTable]->columns[$x]->Name;
					if((isset($dd->tables[$StageExtConfigTable]->namedcolumns[$colName])) && ($colName != "ck_config_item"))
					{
						//-- if values differ and stage value is not empty put into a field table (so we only update the changed fields and can show analyst which ones)
						$CMDB_STAGE_VALUE = $recStageExt->$colName;
						if(dd_isnumeric($StageExtConfigTable,$colName)&&($CMDB_STAGE_VALUE==0))
							continue;
						if(($recLiveExt->$colName!=$CMDB_STAGE_VALUE)&&($CMDB_STAGE_VALUE!=""))
						{
							$strDisplayColTxt = pfs_escape_slashes("Extended [" .  dd_fieldlabel($StageExtConfigTable,$colName). "]");

							if (!$first_insert)
								$strInsertStageFields.=",";

							$strInsertStageFields.="('".pfs_escape_slashes($strCK_CONFIG_ITEM)."','".$strDisplayColTxt."','".$colName."','".$strExtTableName."','".$recLiveExt->$colName."','".pfs_escape_slashes($CMDB_STAGE_VALUE)."')";	
							$first_insert=0;	
							
							$boolExtRecordUpdate = true;
						}
					}
					else
					{
						if($strVerbose) 
							log_actions("No named stage column found");
					}
				}
			}
		} // if no extended table name
	} //  else if not in CMDB
	
	//If there is not any error, updating data
	if (!$boolErrorInData)
	{
		if ($strInsertStageFields != "")
		{
			$strInsertStageFields = "insert into CMDB_STAGEFIELDS (CK_CONFIG_ITEM,COLDISPLAY,TARGETCOL,TARGETTABLE,LIVEVALUE,NEWVALUE) values " . $strInsertStageFields;
			submitsqlODBC($strInsertStageFields);
		}
		if($strVerbose) log_actions("Creating Stage Fields: ".$strInsertStageFields);
		
		if(($boolExtRecordUpdate)||($boolMainRecordUpdate))
		{
			$strImportAction = "Update";
		}		
		else if($boolCreateRecord)
		{
			//-- does not exist - so set to be created.
			$strImportAction = "Create";
		}
		
		if ($strImportAction != "No Changes")
		{
			$strImportStatus = "Awaiting";	
		}
		else
		{
			$strImportStatus = "";
		}
		
		$strUpdate = "update CMDB_STAGE SET IMPORT_NEWTYPE= '" .  $ynInvalidType . "', IMPORT_ACTION = '" . $strImportAction . "' , IMPORT_STATUS = '" .  $strImportStatus  . "' where CK_CONFIG_ITEM = '" . $strCK_CONFIG_ITEM . "'";
		submitsqlODBC($strUpdate);


	}

} // while fetch contents of CMDB_STAGE

//--TK Unsets
$arrActions = NULL;
$arrValues = NULL;
$arrKey = NULL;
$arrCITypes = NULL;
$xmlmc = NULL;
$contentXMLMC = NULL;
$rec = NULL;
//-- Close DB Connections
odbc_close($conn);
odbc_close($conn2);
odbc_close($conn3);
odbc_close($conn5);
odbc_close($conn6);
odbc_close($conn8);
odbc_close($conn11);
	
log_actions("Staged Items Import Actions Completed. ".$processCount." records were processed");
//--TK Debug Times
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$finish = $time;
$total_time = round(($finish - $start), 4);
//-- 
//-- Update End Process
end_process($strProcessID,$processCount,$boolErrorInData);
log_actions("Complete. Time Taken: ".$total_time." seconds.");
//--
?>