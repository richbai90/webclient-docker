<?php
	//-- v1.0.0
	//-- service/swclass/helpdesksession

	//-- given helpdesk command execute it and return result data

	include("../../../php/session.php");
	include("../../../php/swHelpdeskAPI.php"); //-- for doing call things

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/swclass/helpdesksession/index.php","START","SERVI");
	}

	//-- create helpdesk instance
	$swHelpdeskAPI = new CSwHDsession($_SESSION['swsession'],$portal->sw_server_ip);
	$con = $swHelpdeskAPI->open_hd_connection();

	$exttablekeycols = array();
	$exttablecolvalues = array();

	$boolUpdateCall = (strPos($_POST['command'],"UPDATE CALL")===0);
	$boolInsertCall = (strPos($_POST['command'],"LOG CALL")===0);
	$boolWorkflowAction=(strPos($_POST['command'],"UPDATE TASK")===0);
	$boolIssueAction=(strPos($_POST['command'],"UPDATE ISSUE")===0 || strPos($_POST['command'],"CREATE ISSUE")===0);

	$callFailed=false;
	if($con<33)
	{
		$bUploadFiles = false;

		//-- log activity
		if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
		{
			_wc_debug("swhd_sendcommand",$_POST['command'],"5005 ");
		}

		if(swhd_sendcommand($con, $_POST['command']))
		{

			//-- log activity
			if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
			{
				_wc_debug("swhd_sendcommand","accepted by server","5005 ");
			}


			//-- process any passed in values
			foreach($_POST as $strParamName => $varValue)
			{

				if(strPos($strParamName,"swhdfile__")===0)
				{
					$bUploadFiles=true;
				}
				else if(strPos($strParamName,"swhdbool__")===0)
				{
					$arrParam = explode("swhdbool__",$strParamName,2);

					$arrColname = explode("_",$arrParam[1],2);
					$strColName = $arrColname[0];
					if(strToLower($strColName)=="updatedb" || strToLower($strColName)=="opencall")
					{
							if($boolInsertCall && strToLower($strColName)=="opencall")
							{
								$strColName = $arrColname[1];
							}
							else
							{
								$strColName = $arrColname[0] . "." .$arrColname[1];
							}
					}
					else
					{
						$strColName = $arrParam[1];
					}

					$strColName = str_replace("swissues_","",$strColName);
					swhd_sendnumvalue($con,$strColName,$varValue);		

					//-- log activity
					if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
					{
						_wc_debug("swhd_sendnumvalue",$strColName."=".$varValue,"5005 ");
					}

				}
				elseif(strPos($strParamName,"swhdstr__")===0)
				{
					$arrParam = explode("swhdstr__",$strParamName,2);
					$arrColname = explode("_",$arrParam[1],2);
					$strColName = $arrColname[0];
					if(strToLower($strColName)=="updatedb" || strToLower($strColName)=="opencall")
					{
						if($boolInsertCall && strToLower($strColName)=="opencall")
						{
							$strColName = $arrColname[1];
						}
						else
						{
							$strColName = $arrColname[0] . "." .$arrColname[1];
						}
					}
					else
					{
						$strColName = $arrParam[1];
					}

					$strColName = str_replace("swissues_","",$strColName);
					swhd_sendtextvalue($con,$strColName,$varValue);		

					//-- log activity
					if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
					{
						_wc_debug("swhd_sendtextvalue",$strColName."=".$varValue,"5005 ");
					}
				}
				elseif(strPos($strParamName,"swhdtxt__")===0)
				{
					$arrParam = explode("swhdtxt__",$strParamName,2);
					$arrColname = explode("_",$arrParam[1],2);
					$strColName = $arrColname[0];
					if(strToLower($strColName)=="updatedb" || strToLower($strColName)=="opencall")
					{
						if($boolInsertCall && strToLower($strColName)=="opencall")
						{
							$strColName = $arrColname[1];
						}
						else
						{
							$strColName = $arrColname[0] . "." .$arrColname[1];
						}

					}
					else
					{
						$strColName = $arrParam[1];
					}

					$strColName = str_replace("swissues_","",$strColName);
					swhd_sendtextvalue($con,$strColName,$varValue);	
					//-- log activity
					if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
					{
						_wc_debug("swhd_sendtextvalue",$strColName."=".$varValue,"5005 ");
					}	
				}
				elseif(strPos($strParamName,"swhdnum__")===0)
				{
					$arrParam = explode("swhdnum__",$strParamName,2);
					$arrColname = explode("_",$arrParam[1],2);
					$strColName = $arrColname[0];

					if(strToLower($strColName)=="updatedb" || strToLower($strColName)=="opencall")
					{
							if($boolInsertCall && strToLower($strColName)=="opencall")
							{
								$strColName = $arrColname[1];
							}
							else
							{
								$strColName = $arrColname[0] . "." .$arrColname[1];
							}

					}
					else
					{
						$strColName = $arrParam[1];
					}

					$strColName = str_replace("swissues_","",$strColName);
					swhd_sendnumvalue($con,$strColName,$varValue);	
					//-- log activity
					if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
					{
						_wc_debug("swhd_sendnumvalue",$strColName."=".$varValue,"5005 ");
					}	
				}
				elseif(strPos($strParamName,"swhddate__")===0)
				{
					//-- is there one for dates?
				}
				elseif(strPos($strParamName,"swhd__")===0)
				{
					$arrParam = explode("swhd__",$strParamName,2);
					$arrColname = explode("_",$arrParam[1],2);
					$strColName = $arrColname[0];
					if(strToLower($strColName)=="updatedb" || strToLower($strColName)=="opencall")
					{
							if($boolInsertCall && strToLower($strColName)=="opencall")
							{
								$strColName = $arrColname[1];
								
							}
							else
							{
								$strColName = $arrColname[0] . "." .$arrColname[1];
							}

					}
					else
					{
						$strColName = $arrParam[1];
					}

					$strColName = str_replace("swissues_","",$strColName);
					swhd_sendtextvalue($con,$strColName,$varValue);		
					//-- log activity
					if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
					{
						_wc_debug("swhd_sendtextvalue",$strColName."=".$varValue,"5005 ");
					}	
				}
				else if (strPos($strParamName,"swext__")===0)
				{
					//-- any associacted extended table
					$arrParam = explode("swext__",$strParamName,2);
					$arrColname = explode("_",$arrParam[1],2);

					$strTableName = $arrColname[0];
					$strColName = $arrColname[1];

					if(strToLower($strColName)=="___swkeycolum")
					{
						//-- this is the name of the table key col into which we will insert callref
						$exttablekeycols[$strTable] = $varValue;
					}
					else
					{
						if(isSet($exttablecolvalues[$strTable])==false)	$exttablecolvalues[$strTable] = Array();
						$exttablecolvalues[$strTable][$strColName] = $varValue;
					}
				}
			}


			//-- find files that may have been attached
			if($_POST['_uniqueformid']!="" && $bUploadFiles)
			{
				//-- get temp location
				$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
				$destination_path = str_replace("\\","/",$destination_path);

				$_arr_files = Array();
				if($handle = @opendir($destination_path)) 
				{ 
					$lastFile = "";
					while($file = readdir($handle)) 
					{ 
						$filePath = $destination_path.'/'.$file; 
						if($lastFile==$filePath)continue;
						$lastFile=$filePath;

						if(is_file($filePath)) 
						{
							swhd_sendfilevalue($con,"Attach",$filePath,$file);
							unlink($filePath);

							//-- log activity
							if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
							{
								_wc_debug("swhd_sendfilevalue",$filePath,"5005 ");
							}	
						}
					} 
					closedir($handle); 
				}
			}

			//-- commit;
			//-- log activity
			if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
			{
				_wc_debug("swhd_commit","start commit","5005 ");
			}	
		
			
			if(swhd_commit($con))
			{
				//-- result
				$strRes = swhd_getlastresponse($con);
				$arrResult = _getHdResultAsNamedArray($strRes);

				//-- log activity
				if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
				{
					_wc_debug("swhd_commit","commit ok :" .$strRes,"5005 ");
				}	
			
				if($boolUpdateCall || $boolInsertCall)
				{
					$conn=false;
					//-- process extended tables
					foreach($exttablecolvalues as $strTableName => $arrExtTableFields)
					{
						$conn = connectdb("swdata",false);
						
						//-- get callref value to use in or with ext table/
						$extkeyValue = ($boolUpdateCall )? $_POST['_swcallrefs'] : substr(trim($arrResult['callref']),1) - 0;

						$extkeyColumns = $exttablekeycols[$strTableName];
						$execsql = "";
						//-- if no key col then skip
						if($extkeyColumns=="") continue; 
				
						if($boolInsertCall)
						{
							$insertStartSQL = "insert into "	. $strTableName . " (";
							foreach($arrExtTableFields as $strFieldName => $varValue)
							{
								if($extkeyColumns!="")$extkeyColumns.=",";
								$extkeyColumns .= $strFieldName;
								
								//-- check if need to pfs
								$strBinding = $strTableName .".".$strFieldName;
								$intType = swdti_getdatatype($strBinding);
								$intPFS = ($intType==8||$intType==-1)?"1":"0";
								$varPreparedValue = $varValue;
								if($intPFS=="1") $varPreparedValue = "'" . db_pfs($varValue) . "'";

								if($extkeyValue!="")$extkeyValue .= ",";
								$extkeyValue .= $varPreparedValue;
							}
							$insertEndSQL = $insertColumns .") values (".$insertValues.")";		
							$strExtSQL =  $insertStartSQL.$insertEndSQL;

						}
						else if($boolUpdateCall)
						{
							$updateStartSQL = "update " . $strTableName . " set "; 
							$updateEndSQL = " where  " . $extkeyColumns ." =  ". $extkeyValue;
							$updateValues = "";
					
							foreach($arrExtTableFields as $strFieldName => $varValue)
							{
								//-- check if need to pfs
								$strBinding = $strTableName .".".$strFieldName;
								$intType = swdti_getdatatype($strBinding);
								$intPFS = ($intType==8||$intType==-1)?"1":"0";
								$varPreparedValue = $varValue;
								if($intPFS=="1") $varPreparedValue = "'" . db_pfs($varValue) . "'";

								if($updateValues!="")$updateValues .= ",";
								$updateValues .= $strFieldName . "=". $varPreparedValue;

							}
							$strExtSQL =  $updateStartSQL.$updateValues.$updateEndSQL;
						}

						//-- create full sql string and execute
						$res = @_execute_xmlmc_sqlquery($strExtSQL,$conn);
						//odbc_free_result($res);
					}
					if($conn!=false)close_dbs();
				}
			}
			else
			{
				//-- log activity
				if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
				{
					_wc_debug("swhd_commit","commit failed :" .swhd_getlastresponse($con),"5005 ");
				}	
				$callFailed=true;
			}
		}
		else
		{
			if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
			{
				_wc_debug("swhd_sendcommand","failed : " .swhd_getlastresponse($con) ,"5005 ");
			}
			$callFailed = true;
		}

		if(!$boolInsertCall && !$boolWorkflowAction && !$boolIssueAction && !$callFailed)
		{
			//-- select max udindex from updatedb
			$iLastUdindex = 0;
			$sysdb = connectdb("sw_systemdb",true);
			$strSelectIDX = "select callref, max(udindex) as udindex from updatedb where callref in (".$_POST["_swcallrefs"].") group by callref";
			$res = _execute_xmlmc_sqlquery($strSelectIDX, $sysdb);
			if($res)
			{
				$ret = "";
				$updRow= hsl_xmlmc_rowo($res);
				while($updRow)
				{
					$iLastUdindex = $updRow->udindex;
					$iCallref = $updRow->callref;
					$updRow= hsl_xmlmc_rowo($res);
		
					if($ret != "")$ret .= "\n";
					$ret .= "updateref=".$iCallref.".".$iLastUdindex; //-- need plus ok for client to recognise pass
				}
			}
			if($sysdb!=false)close_dbs();
			$ret = "-OK".$ret; //-- need plus ok for client to recognise pass
		}
		else
		{
			$ret = swhd_getlastresponse($con);		
		}



		//-- log activity
		if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
		{
			_wc_debug("swhd_close","Closing 5005 connection","5005 ");
		}	
		swhd_close($con);
	}
	else
	{
		$ret = swhd_getlastresponse($con);
	}


	//-- log activity
	if(defined("_LOG_WC_5005_ACTIVITY") && _LOG_WC_5005_ACTIVITY)
	{
		_wc_debug("swhd_close","return response :".$ret,"5005 ");
	}	

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/swclass/helpdesksession/index.php","END","SERVI");
	}

	echo $ret;

?>