<?php
	echo "<hr>Starting<hr>";

	//-- Includes
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classcreatelocalsession.php');
	// RF - Removed XMLMC DB Access
	//include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/helpers/language.php');
	
	// RF - Include ODBC DB functionality
	include_once('swdatabaseaccess.php');
	include_once('swhelpdeskcall.php');
	
	// -- Initialise the logging
	$boolLogging = true;
	$boolDetailedLogging = true;
	$installpath = sw_getcfgstring("InstallPath");
	$logfile = $installpath . "\\log\\dbmaintenance.log";
	$logfp = fopen($logfile, "a+");
	
	// -- Create a local XMLMC session
	$session = new classCreateLocalSession();
	if(!$session->IsValidSession())
	{
		// -- Unable to create local session
		logwrite("Unable to establish a session. Please note that dbmaintenance script can only be run on the server.", "[ERROR]");
		exit;
	}

	// clear the script timeout as we don't know how many records will be processed
	set_time_limit(0);

	// Set error reporting level for development
	//error_reporting  (E_ERROR | E_WARNING | E_PARSE);

	// generic Log Write functionwhich formats the log file so that the SW Log File Reader can interpret the contents
	function logwrite($msg,$type = "[INFO ]",$thread = "[1234]")
	{
		global $logfp, $boolLogging;

		if (!$boolLogging)
			return;

		$log = "";
		$source = "[SYSTM]";

		$date = date('d/m/Y H:i:s',time());
		$log = $date . " " . $source . ":" . $type . ":" . $thread . $msg . "\r\n";
		echo "<br>" . $log; // caters for running from a browser
		fwrite($logfp,$log);
		return;
	}
	// RF - Added prepare for SQL function
	function pfs($var) 
	{
		return prepareForSql($var);
	}
	
	///////////////////// GETTING DETAILS FROM ODBC DETAILS   ////////////////////

	//Getting the path of the supportworks server
	$swinstallpath = sw_getcfgstring("InstallPath");

	//Getting the path of the odbc's details executable 
	$odbc_details = $swinstallpath."\bin\SwCredSupp.exe";

	//Getting the details from the ODBC connection
	exec($odbc_details,$out);

	//Extractig ODBC details
    $decoded = base64_decode($out[0]);
    $splited = explode("\t",$decoded);

    //Storaring APP Id
    $swdsn = $splited[2];
    //Storaring APP User
    $swuid = $splited[3];
    //Storaring APP Password
    $swpwd = $splited[4];
    ////////////////////////////////////////////////////////////////////////////////


	logwrite("Starting script: dbmaintenance");

	//Connect To Supportworks database
	$conDb  = new CSwDbConnection;
	// if(!$conDb->Connect(swdsn(), swuid(), swpwd()))
	if(!$conDb->Connect($swdsn, $swuid, $swpwd))
	{
		logwrite("Database Connection failed", "[ERROR]");
		exit;
	}

	//Connect To Supportworks database
	$conDb2  = new CSwDbConnection;
	// if(!$conDb2->Connect(swdsn(), swuid(), swpwd()))
	if(!$conDb2->Connect($swdsn, $swuid, $swpwd))
	{
		logwrite("Database Connection failed (2)", "[ERROR]");
		exit;
	}

	//Connect To Supportworks database
	$conDb3  = new CSwDbConnection;
	// if(!$conDb3->Connect(swdsn(), swuid(), swpwd()))
	if(!$conDb3->Connect($swdsn, $swuid, $swpwd))
	{
		logwrite("Database Connection failed (3)", "[ERROR]");
		exit;
	}

	//Connect To Supportworks database
	$conDb4  = new CSwDbConnection;
	// if(!$conDb4->Connect(swdsn(), swuid(), swpwd()))
	if(!$conDb4->Connect($swdsn, $swuid, $swpwd))
	{
		logwrite("Database Connection failed (4)", "[ERROR]");
		exit;
	}

	function create_me_cmdb_record($strConfigItem, $strMeType, $strDesc, $strMeTable, $strKeyCol, $boolKeyColInt = false)
	 {
		logwrite("Create ME CMDB Record: " . ucfirst($strMeTable) . " : " . $strConfigItem);

		global $conDb3, $conDb4;
		global $boolDetailedLogging;

		$boolResult = true;
		// Create the CI record
		$strCreateCiSql = "insert into CONFIG_ITEMI";
		$strCreateCiSql .= " (CK_CONFIG_ITEM,";
		$strCreateCiSql .= " CK_CONFIG_TYPE,";
		$strCreateCiSql .= " DESCRIPTION,";
		$strCreateCiSql .= " CMDB_STATUS,";
		$strCreateCiSql .= " FK_STATUS_LEVEL,";
		$strCreateCiSql .= " ISACTIVEBASELINE,";
		$strCreateCiSql .= " ISACTIVE,";
		$strCreateCiSql .= " CK_BASELINEINDEX,";
		$strCreateCiSql .= " ME_TABLE,";
		$strCreateCiSql .= " ISAUTHORISED ) values (";
		$strCreateCiSql .= " '".pfs($strConfigItem)."',";
		$strCreateCiSql .= " 'ME->".pfs($strMeType)."',";
		$strCreateCiSql .= " '".pfs($strDesc)."',";
		$strCreateCiSql .= " 'Active',";
		$strCreateCiSql .= " 'Active',";
		$strCreateCiSql .= " 'Yes',";
		$strCreateCiSql .= " 'Yes',";
		$strCreateCiSql .= " 0,";
		$strCreateCiSql .= " '".pfs($strMeTable)."',";
		$strCreateCiSql .= " 'Yes' )";

		if ($boolDetailedLogging)
			logwrite("Create ME CMDB Record SQL: " . $strCreateCiSql);

		if ($conDb3->Query($strCreateCiSql))
		{
			// Get auto ID of newly created CI record
			$strGetCiSql = "select PK_AUTO_ID from CONFIG_ITEMI";
			$strGetCiSql .= " where CK_CONFIG_ITEM = '".pfs($strConfigItem)."'";
			$strGetCiSql .=	" and CK_CONFIG_TYPE = 'ME->".pfs($strMeType)."'";
			$strGetCiSql .=	" and CK_BASELINEINDEX=0";
			$strGetCiSql .=	" order by PK_AUTO_ID desc";

			if ($conDb3->Query($strGetCiSql))
			{
				if ($conDb3->Fetch("ci"))
				{
					$strUpdateMeTableSql = "update ".$strMeTable;
					$strUpdateMeTableSql .= " set fk_cmdb_id = ".$conDb3->GetValue("PK_AUTO_ID");
					$strUpdateMeTableSql .= " where ".$strKeyCol." = '".pfs($strConfigItem)."'";
					logwrite("Updating fk_cmdb_id for ".ucfirst($strMeTable)." (ME): " . $strConfigItem . " (" . $conDb3->GetValue("PK_AUTO_ID") . ")");
					if ($boolDetailedLogging)
					{
						logwrite("Updating fk_cmdb_id for ".ucfirst($strMeTable)." (ME) SQL: " . $strUpdateMeTableSql);
					}
					if (!$conDb4->Query($strUpdateMeTableSql)) // set fk_cmdb_id in the ME table based on the auto id from the CI record
					{
						logwrite("Failed to update ".ucfirst($strMeTable)." ME Table: " . $strUpdateMeTableSql, "[ERROR]"); // handle error
						$boolResult = false;
					}

					$strUpdateCiSql = "update CONFIG_ITEMI set baselineid = ".$conDb3->GetValue("PK_AUTO_ID");
					$strUpdateCiSql .= " where PK_AUTO_ID = ".$conDb3->GetValue("PK_AUTO_ID");
					logwrite("Updating CI Baseline for ".ucfirst($strMeTable)." (ME): " . $conDb3->GetValue("PK_AUTO_ID"));
					if ($boolDetailedLogging)
					{
						logwrite("Updating CI Baseline for ".ucfirst($strMeTable)." (ME) SQL: " . $strUpdateCiSql);
					}
					if (!$conDb4->Query($strUpdateCiSql)) // update the baseline ID in the CI record so that baselines display correctly
					{
						logwrite("Failed to update CI Table: " . $strUpdateCiSql, "[ERROR]"); // handle error
						$boolResult = false;
					}
				}
				else
				{
					logwrite("Failed to fetch CI record (ME): " . $strGetCiSql, "[ERROR]"); // handle error
					$boolResult = false;
				}
			}
			else
			{
				logwrite("Failed to query CI Record (ME): " . $strGetCiSql, "[ERROR]"); // handle error
				$boolResult = false;
			}
		}
		else
		{
			logwrite("Failed to create CI Record (ME): " . $strCreateCiSql, "[ERROR]"); // handle error
			$boolResult = false;
		}
		return $boolResult;
	} // function create_me_cmdb_record

	function create_ci_records($strMeTable, $strMeKeyCol, $strMeDescFields, $strMeType)
	{
		global $conDb, $conDb2, $conDb3;
		global $boolDetailedLogging;

		$intProcessedCount = 0;
		$intFailedCount = 0;
		$intUpdatedMeCount = 0;
		$intCreatedMeCount = 0;

		$strBlankIdSql = "update ".strtoupper($strMeTable)." set FK_CMDB_ID = 0";
		logwrite("Creating CI records for " . ucfirst($strMeTable));
		if($conDb->Query($strBlankIdSql))
		{
			logwrite("Set all fk_cmdb_id to 0 for " . ucfirst($strMeTable));
			$strGetSrcSql = "select ".$strMeKeyCol.", ".$strMeDescFields." from ".$strMeTable." where FK_CMDB_ID < 1 or FK_CMDB_ID is null";
			if ($conDb->Query($strGetSrcSql)) // blank all the cmdb ids in the ME table
			{
				while ($conDb->Fetch("src"))
				{
					$boolFailed = false;
					logwrite("Processing ".ucfirst($strMeTable).": " . $conDb->GetValue($strMeKeyCol));
					$strGetCisSql = "select PK_AUTO_ID from CONFIG_ITEMI where CK_CONFIG_ITEM = '". pfs($conDb->GetValue($strMeKeyCol))."' and ME_TABLE = '".$strMeTable."'";
					if ($boolDetailedLogging)
					{
						logwrite("Get CI SQL: " . $strGetCisSql);
					}
					if ($conDb2->Query($strGetCisSql)) // get the auto id from the CI table
					{
						if ($conDb2->Fetch("ci")) // Does a CI record already exist
						{
							$strUpdateTargetSql = "update ".$strMeTable." set FK_CMDB_ID = ".$conDb2->GetValue("PK_AUTO_ID");
							$strUpdateTargetSql .= " where ".$strMeKeyCol." = '".pfs($conDb->GetValue($strMeKeyCol))."'";
							logwrite("Updating fk_cmdb_id for ".ucfirst($strMeTable).": " . $conDb->GetValue($strMeKeyCol) . " (" . $conDb2->GetValue("PK_AUTO_ID") . ")");
							if ($boolDetailedLogging)
							{
								logwrite("Update fk_cmdb_id for ".ucfirst($strMeTable)." SQL: " . $strUpdateTargetSql);
							}
							if ($conDb3->Query($strUpdateTargetSql))
							{
								$intUpdatedMeCount++;
							}
							else
							{
								logwrite("Failed to update ".ucfirst($strMeTable)." Table: " . $strUpdateTargetSql, "[ERROR]"); // handle error
								$boolFailed = true;
							}
						}
						else // there's no CI record for the ME record, so we need to create it and then populate the links (cmdb id etc)
						{
							// Generate the data for the description field - need to cater for this data coming from more than one source field
							$strDescValue = "";
							$arrDescFields = explode(", ", $strMeDescFields);
							$intNumFields = count($arrDescFields);
							for ($i=0; $i<$intNumFields; $i++)
							{
								if ($i > 0)
								{
									$strDescValue .= " "; // space delimited
								}
								$strDescValue .= $conDb->GetValue($arrDescFields[$i]);
							}
							if ($boolDetailedLogging)
							{
								logwrite("Description value : " . $strDescValue);
							}
							if (create_me_cmdb_record($conDb->GetValue($strMeKeyCol), $strMeType, $strDescValue, $strMeTable, $strMeKeyCol))
							{
								$intCreatedMeCount++;
							}
							else
							{
								$boolFailed = true;
							}
						}
					}
					else
					{
						logwrite("Failed to get CI record: " . $strGetCisSql, "[ERROR]"); // handle error
						$boolFailed = true;
					}
					$intProcessedCount++;
					if ($boolFailed)
					{
						$intFailedCount++;
					}
				} // while - for each record

				logwrite("Number of ".ucfirst($strMeTable)." records processed / failed: (" . $intProcessedCount . " / " . $intFailedCount . ")");
				logwrite("Number of ".ucfirst($strMeTable)." ME records created / updated: (" . $intCreatedMeCount . " / " . $intUpdatedMeCount . ")");
			}
			else
			{
				logwrite("Failed to get ".ucfirst($strMeTable)." records: " . $strGetSrcSql, "[ERROR]"); // handle error
			}
		}
		else
		{
			logwrite("Failed to update ".strtoupper($strMeTable)." Record: " . $strBlankIdSql, "[ERROR]"); // handle error
		}
	} // function create_ci_records

// Create Relationship records (config_reli) for use in VCM
// Does not cater for Dept Cust Relationships as this needs to deal with Sub Departments i.e. an extra level
	function create_reli_records($strRelType)
	{
		global $conDb, $conDb2, $conDb3;
		global $boolDetailedLogging;
		$intProcessedParentCount = 0;
		$intFailedParentCount = 0;
		$intProcessedChildCount = 0;
		$intFailedChildCount = 0;
		$intInsertReliCount = 0;
		
		switch($strRelType)
		{	
			case "Company to CI": // Org CI
				$strParentIdCol = "PK_COMPANY_ID";
				$strParentTextCol = "COMPANYNAME";
				$strParentTable = "COMPANY";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "CK_CONFIG_ITEM";
				$strChildTextCol = "CK_CONFIG_TYPE";
				$strChildCiAutoIdCol = "PK_AUTO_ID";
				$strChildTable = "CONFIG_ITEMI";
				$strParentType = "ME->COMPANY";
				$strChildType = "";
				$strRelText = "uses";
			break;
			
			case "Site to CI": // Site CI
				$strParentIdCol = "SITE_NAME";
				$strParentTextCol = "SITE_NAME";
				$strParentTable = "SITE";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "CK_CONFIG_ITEM";
				$strChildTextCol = "CK_CONFIG_TYPE";
				$strChildCiAutoIdCol = "PK_AUTO_ID";
				$strChildTable = "CONFIG_ITEMI";
				$strParentType = "ME->SITE";
				$strChildType = "";
				$strRelText = "uses";
			break;
			
			case "SLA to CI": // SLA CI
				$strParentIdCol = "PK_SLAD_ID";
				$strParentTextCol = "SLAD_ID";
				$strParentTable = "ITSMSP_SLAD";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "CK_CONFIG_ITEM";
				$strChildTextCol = "CK_CONFIG_TYPE";
				$strChildCiAutoIdCol = "PK_AUTO_ID";
				$strChildTable = "CONFIG_ITEMI";
				$strParentType = "ME->SLA";
				$strChildType = "";
				$strRelText = "uses";
			break;
			
			case "Company to Site": // Org Site
				$strParentIdCol = "PK_COMPANY_ID";
				$strParentTextCol = "COMPANYNAME";
				$strParentTable = "COMPANY";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "SITE_NAME";
				$strChildTextCol = "SITE_NAME";
				$strChildCiAutoIdCol = "FK_CMDB_ID";
				$strChildTable = "SITE";
				$strParentType = "ME->COMPANY";
				$strChildType = "ME->SITE";
				$strRelText = "operates at";
			break;
			
			case "Site to Customer": // Site Cust
				$strParentIdCol = "SITE_NAME";
				$strParentTextCol = "SITE_NAME";
				$strParentTable = "SITE";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "KEYSEARCH";
				$strChildTextCol = "KEYSEARCH";
				$strChildCiAutoIdCol = "FK_CMDB_ID";
				$strChildTable = "USERDB";
				$strParentType = "ME->SITE";
				$strChildType = "ME->CUSTOMER";
				$strRelText = "works at";
			break;
			
			case "Company to Department": // Org Dept
				$strParentIdCol = "PK_COMPANY_ID";
				$strParentTextCol = "COMPANYNAME";
				$strParentTable = "COMPANY";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "PK_DEPT_CODE";
				$strChildTextCol = "PK_DEPT_CODE";
				$strChildCiAutoIdCol = "FK_CMDB_ID";
				$strChildTable = "DEPARTMENT";
				$strParentType = "ME->COMPANY";
				$strChildType = "ME->DEPARTMENT";
				$strRelText = "operates at";
			break;
			
			case "Company to Customer": // Org Cust
				$strParentIdCol = "PK_COMPANY_ID";
				$strParentTextCol = "COMPANYNAME";
				$strParentTable = "COMPANY";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "KEYSEARCH";
				$strChildTextCol = "KEYSEARCH";
				$strChildCiAutoIdCol = "FK_CMDB_ID";
				$strChildTable = "USERDB";
				$strParentType = "ME->COMPANY";
				$strChildType = "ME->CUSTOMER";
				$strRelText = "employs";
			break;
			
			case "Supplier to Contract": // Supplier Contract
				$strParentIdCol = "COMPANY_ID";
				$strParentTextCol = "COMPANY_NAME";
				$strParentTable = "SUPPLIER";
				$strParentCiAutoIdCol = "FK_CMDB_ID";
				$strChildIdCol = "PK_CONTRACT_ID";
				$strChildTextCol = "TITLE";
				$strChildCiAutoIdCol = "FK_CMDB_ID";
				$strChildTable = "CONTRACT";
				$strParentType = "ME->SUPPLIER";
				$strChildType = "ME->CONTRACT";
				$strRelText = "has a";
			break;
		}

		logwrite("Creating relationship data for " . ucfirst($strParentTable));
		$strFetchParentData = "select ".$strParentIdCol.", ".$strParentTextCol.", " .$strParentCiAutoIdCol." from ".$strParentTable." where FK_CMDB_ID > 0";
		if ($boolDetailedLogging)
		{
			logwrite("Get Parent data (SQL): ".$strFetchParentData);
		}
		if($conDb->Query($strFetchParentData))
		{
			while ($conDb->Fetch("src")) // fetch Parent data
			{
				$boolFailedParent = false;
				
				switch($strRelType)
				{	
					case "Company to CI": // Org CI
						$strChildWhere = "FK_COMPANY_ID = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and (FK_SITE = '' or FK_SITE IS NULL) and ";
					break;
					
					case "Site to CI": // Site CI
						$strChildWhere = "FK_SITE = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
					
					case "SLA to CI": // SLA CI
						$strChildWhere = "FK_SLD = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
					
					case "Company to Site": // Org Site
						$strChildWhere = "FK_COMPANY_ID = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
					
					case "Site to Customer": // Site Cust
						$strChildWhere = "SITE = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
					
					case "Company to Department": // Org Dept
						$strChildWhere = "FK_COMPANY_ID = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
					
					case "Company to Customer": // Org Cust
						$strChildWhere = "FK_COMPANY_ID = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
					
					case "Supplier to Contract": // Supplier Contract
						$strChildWhere = "FK_COMPANY_ID = '".pfs($conDb->GetValue(strtoupper($strParentIdCol)))."' and ";
					break;
				}

				// Fetch the Child Data
				$strGetChildRecord	= "select ".$strChildIdCol.", ".$strChildTextCol.", ".$strChildCiAutoIdCol." from ".$strChildTable." where ".$strChildWhere.$strChildCiAutoIdCol." > 0";
				if ($boolDetailedLogging)
				{
					logwrite("Get Child data (SQL): ".$strGetChildRecord);
				}
				if($conDb2->Query($strGetChildRecord))
				{
					while ($conDb2->Fetch("child")) // fetch Child data
					{
						$boolFailedChild = false;

						// Set the Child Type as this may be based on data from the Child record
						switch($strRelType)
						{	
							case "Company to CI": // Org CI
								$strChildType = $conDb2->GetValue($strChildTextCol);
							break;
							
							case "Site to CI": // Site CI
								$strChildType = $conDb2->GetValue($strChildTextCol);
							break;
							
							case "SLA to CI": // SLA CI
								$strChildType = $conDb2->GetValue($strChildTextCol);
							break;
							
							case "Company to Site": // Org Site
								$strChildType = "ME->SITE";
							break;
							
							case "Site to Customer": // Site Cust
								$strChildType = "ME->CUSTOMER";
							break;
							
							case "Company to Department": // Org Dept
								$strChildType = "ME->DEPARTMENT";
							break;
							
							case "Company to Customer": // Org Cust
								$strChildType = "ME->CUSTOMER";
							break;
							
							case "Supplier to Contract": // Supplier Contract
								$strChildType = "ME->CONTRACT";
							break;
						}
						
						// check if there is a record in the CI Relationship table (config_reli)
						$strCountReliSql = "select count(*) as CT from CONFIG_RELI where FK_CHILD_ID = ".$conDb2->GetValue($strChildCiAutoIdCol);
						$strCountReliSql .= " and FK_PARENT_ID = ".$conDb->GetValue($strParentCiAutoIdCol);
						if ($boolDetailedLogging)
						{
							logwrite("Get Relationship count (SQL): ".$strCountReliSql);
						}
						if($conDb3->Query($strCountReliSql))
						{
							if ($conDb3->Fetch("reli")) // fetch count Relationship data
							{
								// No Relationshiop record, hence we need to create one (double negatives as GetValue returns a string)
								if (!($conDb3->GetValue("CT") != "0"))
								{
									$strCreateReliSql = "insert into config_reli (";
									$strCreateReliSql .= " fk_parent_id,";
									$strCreateReliSql .= " fk_child_id,";
									$strCreateReliSql .= " fk_parent_type,";
									$strCreateReliSql .= " fk_child_type,";
									$strCreateReliSql .= " fk_parent_itemtext,";
									$strCreateReliSql .= " fk_child_itemtext,";
									$strCreateReliSql .= " flg_operational,";
									$strCreateReliSql .= " fk_dependency_type";
									$strCreateReliSql .= " )";
									$strCreateReliSql .= " values";
									$strCreateReliSql .= " (";
									$strCreateReliSql .= " ".$conDb->GetValue($strParentCiAutoIdCol).","; // from Parent table
									$strCreateReliSql .= " ".$conDb2->GetValue($strChildCiAutoIdCol).","; // from Child table
									$strCreateReliSql .= " '".$strParentType."',";
									$strCreateReliSql .= " '".$strChildType."',"; 
									$strCreateReliSql .= " '".pfs($conDb->GetValue($strParentIdCol))."',";  // Id Col from Parent table
									$strCreateReliSql .= " '".pfs($conDb2->GetValue($strChildIdCol))."',"; // from Child record
									$strCreateReliSql .= " 'No',";
									$strCreateReliSql .= " '".$strRelText."'";
									$strCreateReliSql .= " )";

									if ($boolDetailedLogging)
									{
										logwrite("Create Relationship record (SQL): ".$strCreateReliSql);
									}
									if ($conDb3->Query($strCreateReliSql))
									{
										$intInsertReliCount++;
									}
									else
									{
										logwrite("Failed to create CI Relationship record : ".$strCreateReliSql, "[ERROR]"); // handle error
										$boolFailedChild = true;
									}
								}
								// else - record exists, so no work to do
							}
							else
							{
								logwrite("Failed to fetch CI Relationship record : ".$strCountReliSql, "[ERROR]"); // handle error
								$boolFailedChild = true;
							}
						}
						else
						{
							logwrite("Failed to query CI Relationship record : ".$strCountReliSql, "[ERROR]"); // handle error
							$boolFailedChild = true;
						}
						$intProcessedChildCount++;
						if ($boolFailedChild)
						{
							$intFailedChildCount++;
						}
					} // while fetch CI data
				}
				else
				{
					logwrite("Failed to query Child record : ".$strGetChildRecord, "[ERROR]"); // handle error
					$boolFailedParent = true;
				}

				$intProcessedParentCount++;
				if ($boolFailedParent)
				{
					$intFailedParentCount++;
				}
			} // while fetch Parent data

			logwrite("Number of ".ucfirst($strParentTable)." records (Parent) processed / failed: (".$intProcessedParentCount." / ".$intFailedParentCount.")");
			logwrite("Number of ".ucfirst($strParentTable)." records (Child) processed / failed: (".$intProcessedChildCount." / ".$intFailedChildCount.")");
			logwrite("Number of Relationship records created for ".ucfirst($strParentTable).": (".$intInsertReliCount.")");
		}
		else
		{
			logwrite("Failed to query parent relationship data for : ".ucfirst($strParentTable).": ".$strFetchParentData, "[ERROR]"); // handle error
		}
	} // function create_reli_records

	function create_reli_records_dept_cust() // This is a special case to cater for Sub Departments
	{
	/*		
	Create Relationships between Departments and Customers
	This is different from the above to cater for the possibility of Sub Departments

	Get Departments (Parent Data)
	select pk_dept_code,  fk_cmdb_id from department where fk_cmdb_id > 0
	while fetch
		Get Customers where this is their sub department
		select keysearch, fk_cmdb_id from userdb where subdepartment= '&[dept.pk_dept_code]' and fk_cmdb_id > 0
		while fetch
			if no Reli records (fk_child_id = &[userdb.fk_cmdb_id] and fk_parent_id = &[dept.fk_cmdb_id])
				Create one
					insert into config_reli (
					fk_parent_id, fk_child_id, fk_parent_type, fk_child_type,
					fk_parent_itemtext, fk_child_itemtext, flg_operational, fk_dependency_type
					) values (
					&[dept.fk_cmdb_id], &[userdb.fk_cmdb_id], 'ME->DEPARTMENT', 'ME->CUSTOMER',
					'&[dept.pk_dept_code]', '&[userdb.keysearch]', 'No', 'works at' )
		Get Customers where this is their main department
		select keysearch, fk_cmdb_id from userdb where (subdepartment='' OR subdepartment IS NULL) and department= '&[dept.pk_dept_code]' and fk_cmdb_id > 0
		while fetch
			if no Reli records (fk_child_id = &[userdb.fk_cmdb_id] and fk_parent_id = &[dept.fk_cmdb_id]) SAME AS ABOVE
				Create one SAME AS ABOVE
					insert into config_reli (
					fk_parent_id, fk_child_id, fk_parent_type, fk_child_type,
					fk_parent_itemtext, fk_child_itemtext, flg_operational, fk_dependency_type
					) values (
					&[dept.fk_cmdb_id], &[userdb.fk_cmdb_id], 'ME->DEPARTMENT', 'ME->CUSTOMER',
					'&[dept.pk_dept_code]', '&[userdb.keysearch]', 'No', 'works at' )
	*/
	
		global $conDb, $conDb2, $conDb3;
		global $boolDetailedLogging;
		$intProcessedParentCount = 0;
		$intParentDeptFailCount = 0;
		$intParentSubDeptFailCount = 0;
		$intSubDeptFailCount = 0;
		$intSubDeptProcessedCount = 0;
		$intSubDeptInsertReliCount = 0;
		$intDeptFailCount = 0;
		$intDeptProcessedCount = 0;
		$intDeptInsertReliCount = 0;
		
		logwrite("Creating relationship data for DEPARTMENT");
		
		$strChildIdCol = "KEYSEARCH";
		$strChildTextCol = "KEYSEARCH";
		$strChildCiAutoIdCol = "FK_CMDB_ID";
		$strChildTable = "USERDB";
		$strParentType = "ME->DEPARTMENT";
		$strChildType = "ME->CUSTOMER";
		$strRelText = "works at";
		$strParentIdCol = "PK_DEPT_CODE";
		$strParentTextCol = "PK_DEPT_CODE";
		$strParentCiAutoIdCol = "FK_CMDB_ID";
		$strParentTable = "DEPARTMENT";
		
		$strFetchParentData = "select ".$strParentIdCol.", ".$strParentTextCol.", " .$strParentCiAutoIdCol." from ".$strParentTable." where ".$strParentCiAutoIdCol." > 0";
		if ($boolDetailedLogging)
		{
			logwrite("Get Parent data (SQL): ".$strFetchParentData);
		}
		if($conDb->Query($strFetchParentData))
		{
			while ($conDb->Fetch("src")) // fetch Parent data - all departments
			{
				$boolFailedParent = false;
				// Fetch the Customers where this is the Sub Department
				$strGetChildRecord = "select ".$strChildIdCol.", ".$strChildCiAutoIdCol." from ".$strChildTable." where SUBDEPARTMENT = '".$conDb->GetValue($strParentIdCol)."' and ".$strChildCiAutoIdCol." > 0";
				if ($boolDetailedLogging)
				{
					logwrite("Get Child data (Sub Department) (SQL): ".$strGetChildRecord);
				}
				if($conDb2->Query($strGetChildRecord))
				{
					while ($conDb2->Fetch("child")) // fetch Child data
					{
						$boolSubDeptFailed = false;
						
						// check if there is a record in the CI Relationship table (config_reli)
						$strCountReliSql = "select count(*) as CT from CONFIG_RELI where FK_CHILD_ID = ".$conDb2->GetValue($strChildCiAutoIdCol);
						$strCountReliSql .= " and FK_PARENT_ID = ".$conDb->GetValue($strParentCiAutoIdCol);
						if ($boolDetailedLogging)
						{
							logwrite("Get Relationship count (Sub Department) (SQL): ".$strCountReliSql);
						}
						if($conDb3->Query($strCountReliSql))
						{
							if ($conDb3->Fetch("reli")) // fetch count Relationship data
							{
								// No Relationshiop record, hence we need to create one (double negatives as GetValue returns a string)
								if (!($conDb3->GetValue("CT") != "0"))
								{
									$strCreateReliSql = "insert into config_reli (";
									$strCreateReliSql .= " fk_parent_id,";
									$strCreateReliSql .= " fk_child_id,";
									$strCreateReliSql .= " fk_parent_type,";
									$strCreateReliSql .= " fk_child_type,";
									$strCreateReliSql .= " fk_parent_itemtext,";
									$strCreateReliSql .= " fk_child_itemtext,";
									$strCreateReliSql .= " flg_operational,";
									$strCreateReliSql .= " fk_dependency_type";
									$strCreateReliSql .= " )";
									$strCreateReliSql .= " values";
									$strCreateReliSql .= " (";
									$strCreateReliSql .= " ".$conDb->GetValue($strParentCiAutoIdCol).","; // from Parent table
									$strCreateReliSql .= " ".$conDb2->GetValue($strChildCiAutoIdCol).","; // from Child table
									$strCreateReliSql .= " '".$strParentType."',";
									$strCreateReliSql .= " '".$strChildType."',"; 
									$strCreateReliSql .= " '".pfs($conDb->GetValue($strParentIdCol))."',";  // Id Col from Parent table
									$strCreateReliSql .= " '".pfs($conDb2->GetValue($strChildIdCol))."',"; // from Child record
									$strCreateReliSql .= " 'No',";
									$strCreateReliSql .= " '".$strRelText."'";
									$strCreateReliSql .= " )";

									if ($boolDetailedLogging)
									{
										logwrite("Create Relationship record (Sub Department) (SQL): ".$strCreateReliSql);
									}
									if ($conDb3->Query($strCreateReliSql))
									{
										$intSubDeptInsertReliCount++;
									}
									else
									{
										logwrite("Failed to create CI Relationship record (Sub Department): ".$strCreateReliSql, "[ERROR]"); // handle error
										$boolSubDeptFailed = true;
									}
								}
								// else - record exists, so no work to do
							}
							else
							{
								logwrite("Failed to fetch CI Relationship record (Sub Department): ".$strCountReliSql, "[ERROR]"); // handle error
								$boolSubDeptFailed = true;
							}
						}
						else
						{
							logwrite("Failed to query CI Relationship record (Sub Department): ".$strCountReliSql, "[ERROR]"); // handle error
							$boolSubDeptFailed = true;
						}
						$intSubDeptProcessedCount++;
						if ($boolSubDeptFailed)
						{
							$intSubDeptFailCount++;
						}
					} // while fetch Child data (Sub departments)
				}
				else
				{
					logwrite("Failed to query Child record (Sub Department) : ".$strGetChildRecord, "[ERROR]"); // handle error
					$intParentSubDeptFailCount++;
				}
				
				// Now cater for the Customer where this is the main department and not their sub department
				$strGetChildRecord = "select ".$strChildIdCol.", ".$strChildCiAutoIdCol." from ".$strChildTable." where (SUBDEPARTMENT='' OR SUBDEPARTMENT IS NULL) and DEPARTMENT = '".$conDb->GetValue($strParentIdCol)."' and ".$strChildCiAutoIdCol." > 0";
				if ($boolDetailedLogging)
				{
					logwrite("Get Child data (Department) (SQL): ".$strGetChildRecord);
				}
				if($conDb2->Query($strGetChildRecord))
				{
					while ($conDb2->Fetch("child")) // fetch Child data
					{
						$boolFailedChild = false;
						$boolDeptFailed = false;
						
						// check if there is a record in the CI Relationship table (config_reli)
						$strCountReliSql = "select count(*) as CT from CONFIG_RELI where FK_CHILD_ID = ".$conDb2->GetValue($strChildCiAutoIdCol);
						$strCountReliSql .= " and FK_PARENT_ID = ".$conDb->GetValue($strParentCiAutoIdCol);
						if ($boolDetailedLogging)
						{
							logwrite("Get Relationship count (Department) (SQL): ".$strCountReliSql);
						}
						if($conDb3->Query($strCountReliSql))
						{
							if ($conDb3->Fetch("reli")) // fetch count Relationship data
							{
								// No Relationshiop record, hence we need to create one (double negatives as GetValue returns a string)
								if (!($conDb3->GetValue("CT") != "0"))
								{
									$strCreateReliSql = "insert into config_reli (";
									$strCreateReliSql .= " fk_parent_id,";
									$strCreateReliSql .= " fk_child_id,";
									$strCreateReliSql .= " fk_parent_type,";
									$strCreateReliSql .= " fk_child_type,";
									$strCreateReliSql .= " fk_parent_itemtext,";
									$strCreateReliSql .= " fk_child_itemtext,";
									$strCreateReliSql .= " flg_operational,";
									$strCreateReliSql .= " fk_dependency_type";
									$strCreateReliSql .= " )";
									$strCreateReliSql .= " values";
									$strCreateReliSql .= " (";
									$strCreateReliSql .= " ".$conDb->GetValue($strParentCiAutoIdCol).","; // from Parent table
									$strCreateReliSql .= " ".$conDb2->GetValue($strChildCiAutoIdCol).","; // from Child table
									$strCreateReliSql .= " '".$strParentType."',";
									$strCreateReliSql .= " '".$strChildType."',"; 
									$strCreateReliSql .= " '".pfs($conDb->GetValue($strParentIdCol))."',";  // Id Col from Parent table
									$strCreateReliSql .= " '".pfs($conDb2->GetValue($strChildIdCol))."',"; // from Child record
									$strCreateReliSql .= " 'No',";
									$strCreateReliSql .= " '".$strRelText."'";
									$strCreateReliSql .= " )";

									if ($boolDetailedLogging)
									{
										logwrite("Create Relationship record (Department) (SQL): ".$strCreateReliSql);
									}
									if ($conDb3->Query($strCreateReliSql))
									{
										$intDeptInsertReliCount++;
									}
									else
									{
										logwrite("Failed to create CI Relationship record (Department): ".$strCreateReliSql, "[ERROR]"); // handle error
										$boolDeptFailed = true;
									}
								}
								// else - record exists, so no work to do
							}
							else
							{
								logwrite("Failed to fetch CI Relationship record (Department): ".$strCountReliSql, "[ERROR]"); // handle error
								$boolDeptFailed = true;
							}
						}
						else
						{
							logwrite("Failed to query CI Relationship record (Department): ".$strCountReliSql, "[ERROR]"); // handle error
							$boolDeptFailed = true;
						}
						$intDeptProcessedCount++;
						if ($boolDeptFailed)
						{
							$intDeptFailCount++;
						}
					} // while fetch Child data (Sub departments)
				}
				else
				{
					logwrite("Failed to query Child record (Department) : ".$strGetChildRecord, "[ERROR]"); // handle error
					$intParentDeptFailCount = true;
				}
				$intProcessedParentCount++;
			} // while fetch parent data
			
			logwrite("Number of ".ucfirst($strParentTable)." records (Parent) processed / Sub Dept failed / Dept failed: (".$intProcessedParentCount." / ".$intParentSubDeptFailCount." / ".$intParentDeptFailCount.")");
			logwrite("Number of ".ucfirst($strParentTable)." records Sub Department processed / inserted / failed: (".$intSubDeptProcessedCount." / ".$intSubDeptInsertReliCount." / ".$intSubDeptFailCount.")");
			logwrite("Number of ".ucfirst($strParentTable)." records Department processed / inserted / failed: (".$intDeptProcessedCount." / ".$intDeptInsertReliCount." / ".$intDeptFailCount.")");
		}
		else
		{
			logwrite("Failed to query relationship data for : ".ucfirst($strParentTable).": ".$strFetchParentData, "[ERROR]"); // handle error
		}
	} // function create_reli_records_dept_cust
	
	function create_userdb_site()
	{
		global $conDb, $conDb2, $conDb3;
		$intProcessedSite = 0;
		$intSuccessSite = 0;
		$intFailedSite = 0;		
		logwrite("Creating relationship data for userdb_site");
		$strSQL = "select userdb.keysearch, userdb.site from userdb left join userdb_site on userdb.keysearch=userdb_site.fk_keysearch where userdb_site.fk_keysearch is null";
		if($conDb->Query($strSQL))
		{
			while ($conDb->Fetch("src")) // Fetch Missing UserID's
			{
				$intProcessedSite++;
				if($conDb->GetValue("keysearch"))
				{
					
					$strInsert = "insert into userdb_site (fk_keysearch, fk_site_name) VALUES ('".pfs($conDb->GetValue("keysearch"))."','".pfs($conDb->GetValue("site"))."')";
					if($conDb2->Query($strInsert))
					{
						$intSuccessSite++;
					}else{
						$intFailedSite++;
						logwrite("Unable to create record for ".$conDb->GetValue("keysearch")."");
					}	
				}
			}
		}
		logwrite("Number of userdb_site records processed / inserted / failed: (".$intProcessedSite." / ".$intSuccessSite." / ".$intFailedSite.")");
	}
	function create_userdb_company()
	{
		global $conDb, $conDb2, $conDb3;
		$intProcessedCompany = 0;
		$intSuccessCompany = 0;
		$intFailedCompany = 0;
		logwrite("Creating relationship data for userdb_company");
		$strSQL = "select userdb.keysearch, userdb.fk_company_id from userdb left join userdb_company on userdb.keysearch=userdb_company.fk_user_id where userdb_company.fk_user_id is null";
		if($conDb->Query($strSQL))
		{
			while ($conDb->Fetch("src")) // Fetch Missing UserID's
			{
				$intProcessedCompany++;
				if($conDb->GetValue("keysearch"))
				{
					
					$strInsert = "insert into userdb_company (fk_user_id, fk_org_id) VALUES ('".pfs($conDb->GetValue("keysearch"))."','".pfs($conDb->GetValue("fk_company_id"))."')";
					if($conDb2->Query($strInsert))
					{
						$intSuccessCompany++;
					}else{
						$intFailedCompany++;
						logwrite("Unable to create record for ".$conDb->GetValue("keysearch")."");
					}	
				}
			}
		}
		logwrite("Number of userdb_company records processed / inserted / failed: (".$intProcessedCompany." / ".$intSuccessCompany." / ".$intFailedCompany.")");
	}
	function create_userdb_rating()
	{
		global $conDb, $conDb2, $conDb3;
		$intProcessedRating = 0;
		$intSuccessRating = 0;
		$intFailedRating = 0;
		logwrite("Creating relationship data for userdb_rating");
		$strSQL = "select userdb.keysearch from userdb left join userdb_rating on userdb.keysearch=userdb_rating.fk_keysearch where userdb_rating.fk_keysearch is null";
		if($conDb->Query($strSQL))
		{
			while ($conDb->Fetch("src")) // Fetch Missing UserID's
			{
				
				$intProcessedRating++;
				//-- For Each ID Insert record
				if($conDb->GetValue("keysearch"))
				{
					
					$strInsert = "insert into userdb_rating (fk_keysearch) VALUES ('".pfs($conDb->GetValue("keysearch"))."')";
					if($conDb2->Query($strInsert))
					{
						$intSuccessRating++;
					}else{
						$intFailedRating++;
						logwrite("Unable to create record for ".$conDb->GetValue("keysearch")."");
					}	
				}
			}
		}
		logwrite("Number of userdb_rating records processed / inserted / failed: (".$intProcessedRating." / ".$intSuccessRating." / ".$intFailedRating.")");
	}
	
	
	
	// Call the relevant functions with the required parameters
	// Create the CI records
	create_ci_records("COMPANY", "PK_COMPANY_ID", "COMPANYNAME", "COMPANY"); // company / org
	create_ci_records("DEPARTMENT", "PK_DEPT_CODE", "DEPT_NAME", "DEPARTMENT"); // Department
	create_ci_records("SUPPLIER", "COMPANY_ID", "COMPANY_NAME", "SUPPLIER"); // Supplier
	create_ci_records("ITSMSP_SLAD", "PK_SLAD_ID", "SLAD_ID", "SLA"); // SLA
	create_ci_records("ITSMSP_SLR", "PK_SLR_ID", "TITLE", "SLR"); // SLR
	create_ci_records("ITSMSP_SLAD_OLA", "PK_OLA_ID", "SLAD_OLA", "OLA"); // OLA
	create_ci_records("CONTRACT", "PK_CONTRACT_ID", "TITLE", "CONTRACT"); // Contract
	create_ci_records("SITE", "SITE_NAME", "SITE_NAME", "SITE"); // Site
	create_ci_records("USERDB", "KEYSEARCH", "FIRSTNAME, SURNAME", "CUSTOMER"); // userdb

	// Create the relationship records (config_reli) which are used in the VCM	
	create_reli_records("Company to CI");
	create_reli_records("Site to CI");
	create_reli_records("SLA to CI");
	create_reli_records("Company to Site");
	create_reli_records("Site to Customer");
	create_reli_records("Company to Department");
	create_reli_records("Company to Customer");
	create_reli_records("Supplier to Contract");
	create_reli_records_dept_cust(); // Need a special for this one to cater for Sub Departments as well as Departments
	
	// Create Customer Extended Details Records
	create_userdb_site();
	create_userdb_company();
	create_userdb_rating();
	// Close the database connections
	$conDb->Close();
	$conDb2->Close();
	$conDb3->Close();
	$conDb4->Close();

	logwrite("Completed script: dbmaintenance");
	echo "<hr>Finished<hr>";
?>