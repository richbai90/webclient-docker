<?php

	
		//-- nwj - 22.11.2012 - get matching records and then determine which fields have been changed
		//--					need to check if ci has an extended table if so check for extended stage data and process as well
		//--					converted from old clientside swjs to php stored query


		IncludeApplicationPhpFile("cmdb.helpers.php");
		$cmdb = new cmdbFunctions();

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
					return true;
			}
			return false;
		}

		//-- load dd schem info info
		$dd = new dd('cmdb_stage,config_itemi');


		$arrActions = Array();
		$arrCITypes = Array();

		//-- delete current stage fields
		$strDeleteStageField = "delete from CMDB_STAGEFIELDS";
		submitsql($strDeleteStageField);

		$strImportStatus = "";
		$strSelect = "select * from cmdb_stage";
		$processCount = 0;
		$oRS = get_recordset($strSelect);
		//-- Include App Specific Helpers File
		IncludeApplicationPhpFile("app.helpers.php");
		//-- Check for XMLMC Error
		if($oRS->result==false)
		{
			//-- Function from app.helpers.php to process error message.
			handle_app_error($oRS->lastErrorResponse);
			exit(0);
		}
		//-- END
		while($oRS->Fetch())
		{
			$processCount++;
			$ynInvalidType = "No";
			$strImportAction = "No Changes";		
			$boolMainRecordUpdate = false;
			$boolExtRecordUpdate = false;
			$boolCreateRecord = false;
			$boolCreateExt = false;
		
			$strCK_CONFIG_ITEM = get_field($oRS,"ck_config_item");
				
			//-- get matching config_item record if there is one
			$strSelectItem = "ck_config_item = '" .  pfs($strCK_CONFIG_ITEM) . "' and isactivebaseline = 'Yes'";
			$oLiveConfigItemRec = get_recordwhere("CONFIG_ITEMI",$strSelectItem);
			if ($oLiveConfigItemRec)
			{
				$boolInCMDB = true;
			}
			else
			{
				$boolInCMDB = false;
				//RJC add an array of inserted fields
				$arrayInsertedFields = Array();
				
			}
				
			//-- exists - so check which fields have changed and add to cmdbstagefields
			//-- for each stage field check if diff from config_itemi
			for ($x=0; $x < count($dd->tables['cmdb_stage']->columns);$x++)
			{
				$colName = $dd->tables['cmdb_stage']->columns[$x]->Name;			

				//-- fields that we do not want to check (system ones)
				if(isSystemField($colName))continue;

				//-- check if field exists in ci table			
				if (!$dd->tables['config_itemi']->namedcolumns[$colName])continue;

				//-- if this is an new record
				if (!$boolInCMDB)
				{
					$CMDB_STAGE_VALUE = get_field($oRS,$colName);
					
					if((dd_isnumeric('cmdb_stage',$colName))&&($CMDB_STAGE_VALUE==0))continue;	
					//alert($colName)
					if(dd_isnumeric('cmdb_stage',$colName))	$CMDB_STAGE_VALUE = fix_epoch($CMDB_STAGE_VALUE);

					if($CMDB_STAGE_VALUE!="")
					{
						$strDisplayColTxt = pfs("Main [" .  dd_fieldlabel('config_itemi',$colName). "]");
						$strInsertStageField = "insert into CMDB_STAGEFIELDS (CK_CONFIG_ITEM,COLDISPLAY,TARGETCOL,TARGETTABLE,LIVEVALUE,NEWVALUE) values ('" .  pfs($strCK_CONFIG_ITEM) . "','" . $strDisplayColTxt . "','" .  $colName . "','config_itemi','','" .  pfs($CMDB_STAGE_VALUE) . "')";

						//RJC Add every insert into the array
						array_push($arrayInsertedFields,$colName);
						
						if(submitsql($strInsertStageField))
						{
							$boolCreateRecord = true;
						}
					}								
				}
				else //-- this is an update
				{
					if(isset($oLiveConfigItemRec[$colName]))
					{
						//-- if values differ and stage value is not empty put into a field table (so we only update the changed fields and can show analyst which ones)
						//-- if numeric value and = 0 then ignore
						$CMDB_STAGE_VALUE = get_field($oRS,$colName);
											
						if((dd_isnumeric('cmdb_stage',$colName))&&($CMDB_STAGE_VALUE==0))continue;	

						if(dd_isnumeric('cmdb_stage',$colName))	$CMDB_STAGE_VALUE = fix_epoch($CMDB_STAGE_VALUE);
						
						if(($oLiveConfigItemRec[$colName]!=$CMDB_STAGE_VALUE)&&($CMDB_STAGE_VALUE!=""))
						{
							$strDisplayColTxt = pfs("Main [" .  dd_fieldlabel('config_itemi',$colName). "]");
							$strInsertStageField = "insert into CMDB_STAGEFIELDS (CK_CONFIG_ITEM,COLDISPLAY,TARGETCOL,TARGETTABLE,LIVEVALUE,NEWVALUE) values ('" .  pfs($strCK_CONFIG_ITEM) . "','" . $strDisplayColTxt . "','" .  $colName . "','config_itemi','" .  pfs($oLiveConfigItemRec[$colName]) . "','" .  pfs($CMDB_STAGE_VALUE) . "')";					
							if(submitsql($strInsertStageField))
							{
								$boolMainRecordUpdate = true;
							}
						}
					}
				}	
			}
			//-- extended tables

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
							$strDisplayColTxt = pfs("Main [" .  dd_fieldlabel('config_itemi',$strFieldName). "]");
							$strInsertStageField = "insert into CMDB_STAGEFIELDS (CK_CONFIG_ITEM,COLDISPLAY,TARGETCOL,TARGETTABLE,LIVEVALUE,NEWVALUE) values ('" .  pfs($strCK_CONFIG_ITEM) . "','" . $strDisplayColTxt . "','" .  $strFieldName . "','config_itemi','','" .  pfs($CMDB_STAGE_VALUE) . "')";
							submitsql($strInsertStageField);
						}
					}												
				}
				
				$strCIType = get_field($oRS,"ck_config_type");
				$rec = false;
				if(isset($arrCITypes[$strCIType]))
				{
					$rec = $arrCITypes[$strCIType];
				}
				else
				{
					
					$rec = get_record("CONFIG_TYPEI", $strCIType);
					$arrCITypes[$strCIType] = $rec;
				}

    			if($rec)
    			{
    				//-- if there is a staging table for the extended table
        			$ExtConfigTable = $rec->extended_table;
        			$StageExtConfigTable = $ExtConfigTable . "_stage";
	
					//-- load table schema info
					if($dd->loadTable($StageExtConfigTable,"swdata",true)!==false)
					{		
						//-- get stage extended record (stage table should have pk of ck_config_item
						$recStageExt = get_record(UC($StageExtConfigTable), pfs($strCK_CONFIG_ITEM), 'swdata', 'ck_config_item');
						if($recStageExt)
						{
							$dd->loadTable($ExtConfigTable);

							for ($x=0; $x < count($dd->tables[$StageExtConfigTable]->columns);$x++)
							{
								//-- fields that we do not want to check (system ones)
								if(isSystemField($colName))continue;
								//-- if field exists in live table
								$colName = $dd->tables[$StageExtConfigTable]->columns[$x]->Name;
								if (!isset($dd->tables[$ExtConfigTable]->namedcolumns[$colName]))continue;
								
								$CMDB_STAGE_VALUE = $recStageExt[$colName];
								
								if(dd_isnumeric($StageExtConfigTable,$colName)&&($CMDB_STAGE_VALUE==0))continue;
								//-- if the stage value is not empty put into a field table (so can show analyst which ones)
								if($CMDB_STAGE_VALUE!="")
								{
									$strDisplayColTxt = pfs("Extended [" .  dd_fieldlabel($ExtConfigTable,$colName). "]");
									$strInsertStageField = "insert into CMDB_STAGEFIELDS (CK_CONFIG_ITEM,COLDISPLAY,TARGETCOL,TARGETTABLE,LIVEVALUE,NEWVALUE) values ('" .  pfs($strCK_CONFIG_ITEM) . "','" .  $strDisplayColTxt . "','" .  $colName . "','" .  $ExtConfigTable . "','','" .  pfs($CMDB_STAGE_VALUE) . "')";
									if(submitsql($strInsertStageField))
									{
										$boolCreateExt = true;
									}
									
								}//-- for each field in stage record
								
							}//-- get stage ext record
						}//-- ext stage table exists
					}//-- if there is a type for this CI
   				}
    			else //-- type
    			{
					$ynInvalidType = "Yes";
   		 		}
				
			}
			else //-- if this is an update
			{				
				//-- check if has an extended table - if so check ext stage record values against main extended
				$strExtFormName = $cmdb->setup_extended_record($oLiveConfigItemRec['pk_auto_id'], $oLiveConfigItemRec['ck_config_type'],false);
				if(strExtFormName!=false)
				{
 					$strCIType = $oLiveConfigItemRec['ck_config_type'];
					$rec = false;
					if(isset($arrCITypes[$strCIType]))
					{
						$rec = $arrCITypes[$strCIType];
					}
					else
					{
						$rec = get_record("CONFIG_TYPEI", $strCIType);
						$arrCITypes[$strCIType] = $rec;
					}
	
   					if($rec)
    				{
    									
    					//-- if there is a staging table for the extended table
        				$ExtConfigTable = $rec->extended_table;
        				$StageExtConfigTable = $ExtConfigTable . "_stage";

						//-- load table schema info
						if($dd->loadTable($StageExtConfigTable,"swdata",true)!==false)
						{					
							//-- get stage extended record (stage table should have pk of ck_config_item
							$recStageExt = get_record(UC($StageExtConfigTable), $oLiveConfigItemRec['ck_config_item'],"",'ck_config_item');
							if($recStageExt)
							{
								//-- get live extended record - then check which fields have changed
								$dd->loadTable($ExtConfigTable);
								$recLiveExt = get_record(UC($ExtConfigTable), $oLiveConfigItemRec['pk_auto_id']);
		
								for ($x=0; $x < count($dd->tables[$StageExtConfigTable]->columns);$x++)
								{
									//-- if field exists in live table
									$colName = $dd->tables[$StageExtConfigTable]->columns[$x]->Name;
									if(isset($dd->tables[$StageExtConfigTable]->namescolumns[$colName]))
									{
										//-- if values differ and stage value is not empty put into a field table (so we only update the changed fields and can show analyst which ones)
										$CMDB_STAGE_VALUE = $recStageExt[$colName];
										if(dd_isnumeric($StageExtConfigTable,$colName)&&($CMDB_STAGE_VALUE==0))continue;

										if(($recLiveExt[$colName]!=$CMDB_STAGE_VALUE)&&($CMDB_STAGE_VALUE!=""))
										{
											$strDisplayColTxt = pfs("Extended [" .  dd_fieldlabel($ExtConfigTable,$colName). "]");
											$strInsertStageField = "insert into CMDB_STAGEFIELDS (CK_CONFIG_ITEM,COLDISPLAY,TARGETCOL,TARGETTABLE,LIVEVALUE,NEWVALUE) values ('" .  pfs($strCK_CONFIG_ITEM) . "','" .  $strDisplayColTxt . "','" .  $colName . "','" .  $ExtConfigTable . "','" .  pfs($recLiveExt[$colName]) . "','" .  pfs($CMDB_STAGE_VALUE) . "')";
											if(submitsql($strInsertStageField))
											{
												$boolExtRecordUpdate = true;
											}
										}
									}
								}//-- for each field in stage record
							}//-- get stage ext record
						}//-- ext stage table exists
					}//-- get config_typei rec
				}//-- if has ext table
			}
			
			if(($boolExtRecordUpdate)||($boolMainRecordUpdate))
			{
				$strImportAction = "Update";
			}		
			else if(boolCreateRecord)
			{
				//-- does not exist - so set to be created.
				$strImportAction = "Create";
			}

			
			if ($strImportAction != "No Changes")
			{
				$strImportStatus = "Awaiting";	
			}
			
			
			$strKey = $ynInvalidType . ":" . $strImportAction . ":" .  $strImportStatus;
			if(isset($arrActions[$strKey]))
			{
				$arrActions[$strKey] = $arrActions[$strKey] . ",'" .  pfs($strCK_CONFIG_ITEM) . "'";
			}
			else
			{
				$arrActions[$strKey] = "'" .  pfs($strCK_CONFIG_ITEM) . "'";
			}
		
		}
		
		$i=0;
		foreach($arrActions as $key => $actionValue) 
		{
			$i++;
			$vals = explode(":",$key);
			$strUpdate = "update CMDB_STAGE SET IMPORT_NEWTYPE= '" .  $vals[0] . "', IMPORT_ACTION = '" . $vals[1] . "' , IMPORT_STATUS = '" .  $vals[2]  . "' where CK_CONFIG_ITEM in (" .  $actionValue . ")";
			submitsql($strUpdate);
		}

		throwProcessSuccessWithResponseAndMsg($i,"Staged Items Import Actions Completed. ".$processCount." records were processed");

?>