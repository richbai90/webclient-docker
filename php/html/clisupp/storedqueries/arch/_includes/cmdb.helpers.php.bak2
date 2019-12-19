<?php

//-- cmdb class and instance - put any custom helper functions for cmdb in here
//-- that way will not conflict with php processor functions. Any common functions can define here and at later date can add to php processor
if(!class_exists('cmdbFunctions'))
{
	global $ARRAY_CMDBSTAGING_DEFAULTVALUES;
	$ARRAY_CMDBSTAGING_DEFAULTVALUES = Array();
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['fk_status_level'] = 'Operational';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['cmdb_status'] = 'Active';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['isauthorised'] = 'Yes';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['flg_inherit_reqtypes'] = '1';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['swtoday_title'] = 'Is runninng without problems';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['swtoday_titleimpact'] = 'Is currently experiencing problems';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['swtoday_titlefail'] = 'Is unavailable due to some unforseen problem';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['selfserv_title'] = 'Is runninng without problems';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['selfserv_titleimpact'] = 'Is currently experiencing problems';
	$ARRAY_CMDBSTAGING_DEFAULTVALUES['selfserv_titlefail'] = 'Is unavailable due to some unforseen problem';



	define('CMDB_ERROR','-106');

	//-- CMDB group & items
	define('PG_CMDB','F');
	define('CMDB_VIEW',1);
	define('CMDB_CREATE',2);
	define('CMDB_EDIT',3);
	define('CMDB_DELETE',4);
	define('CMDB_BLINE',5);
	define('CMDB_MNGTYPES',6);
	define('CMDB_MNGSTAGE',7);
	define('CMDB_SPECIALIST', 8);

	class cmdbFunctions
	{

		function throwError($strMessage)
		{
			//-- calls to main method in storedqueries/helpers.php
			throwError(CMDB_ERROR, $strMessage);	
		}

		function can_view($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_CMDB, CMDB_VIEW); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view configuration items in the CMDB.");
			}
			//-- user can 
			return $boolCan;
		}	

		function can_create($boolMSG=false)
		{
			//-- user can create
			$boolCan = HaveAppRight(PG_CMDB, CMDB_CREATE); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to create configuration items in the CMDB.");
			}
			//-- user can 
			return $boolCan;
		}	

		function can_update($boolMSG=false)
		{
			$boolCan = HaveAppRight(PG_CMDB, CMDB_EDIT); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to update configuration items in the CMDB.");
			}
			//-- user can 
			return $boolCan;
		}	


		function can_baseline($boolMSG=false)
		{
			$boolCan = HaveAppRight(PG_CMDB, CMDB_BLINE); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to baseline, or modify baselined, configuration items.");
			}
			//-- user can 
			return $boolCan;
		}	

		function is_specialist($boolMSG=false)
		{
			$boolCan = HaveAppRight(PG_CMDB, CMDB_SPECIALIST); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not an authorised CMDB specialist.");
			}
			//-- user can 
			return $boolCan;
		}	

		function can_manage($boolMSG=false)
		{
			$boolCan = HaveAppRight(PG_CMDB, CMDB_MNGTYPES); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to manage configuration types.");
			}
			//-- user can 
			return $boolCan;
		}	


		function can_managestage($boolMSG = false)
		{
			$boolCan = HaveAppRight(PG_CMDB, CMDB_MNGSTAGE); 
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to manage staging items.");
			}
			//-- user can 
			return $boolCan;
		}	

		function can_develop()
		{
			//-- Return develop ext forms security level for analyst
			return true;
		}		


		function can_delete($boolThrowError = false)
		{
			$boolCan = HaveAppRight(PG_CMDB, CMDB_DELETE); 
			if(($boolThrowError)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to delete configuration items from the CMDB.");
			}
			//-- user can delete
			return $boolCan;
		}
		
		//-- deletes ci record and all rels - return to callee the SqlQuery instance for last delete (which is the config_itemi record(s) being deleted)
		function delete_configitem($configItemKeys, $boolDeleteBaselines)
		{
			$rs = new SqlQuery();
			
			//-- delete related records
			// -- Delete records in CONFIG_RELI
			$strDeleteRels = "FK_CHILD_ID in(" . $configItemKeys . ") or FK_PARENT_ID in(" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CONFIG_RELI",$strDeleteRels,"swdata",true);
			// -- Delete records CONFIG_DIARY
			$strDeleteHistory = "FK_CI_ID in (" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CONFIG_DIARY",$strDeleteHistory,"swdata",true);
			// -- Delete records in CI_AVAIL_HIST
			$strDeleteAvailHistory = "FK_CI_ID in (" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CI_AVAIL_HIST",$strDeleteAvailHistory,"swdata",true);
			// -- Delete records in CT_PROFILES
			$strDeleteCIServiceYypes = "FK_CONFIG_ITEM in (" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CT_PROFILES",$strDeleteCIServiceYypes,"swdata",true);
			// -- Delete records in CI_AVAIL_ACTION
			$strDeleteEventActions = "FK_CI_ID in (" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CI_AVAIL_ACTION",$strDeleteEventActions,"swdata",true);
			// -- Delete records in CI_BLACKOUT
			$strDeleteBlackout = "FK_CI_ID in (" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CI_BLACKOUT",$strDeleteBlackout,"swdata",true);
			// -- Delete records in CMDB_URI_LINK
			$strDeleteDML = "FK_CI_ID in (" . $configItemKeys . ")";
			xmlmc_deleteRecord_where("CMDB_URI_LINK",$strDeleteDML,"swdata",true);
			// -- Delete records in CMN_REL_OPENCALL_CI
			$strDeleteOCs = "DELETE FROM CMN_REL_OPENCALL_CI WHERE FK_CI_AUTO_ID IN(" . $configItemKeys . ")";
			$rs->Query($strDeleteOCs);
			
			//-- delete ci baselines so long as they are not active
			if($boolDeleteBaselines)
			{
				//-- for each ci get its baselineid and delete all those CI with the same one (only delete those that are older than one being deleted)
				$strDeleteBaselineKeys = "";
				$strSelectBaselines = "select BASELINEID from CONFIG_ITEMI where PK_AUTO_ID in (" . $configItemKeys . ") and ISACTIVEBASELINE!='Yes'";
				$rs->Query($strSelectBaselines);
				while($rs->Fetch())
				{
					if ($strDeleteBaselineKeys!="")$strDeleteBaselineKeys .=",";
					$strDeleteBaselineKeys = $rs->row->baselineid;
				}
				//-- delete baselines
				if($strDeleteBaselineKeys!="")$this->delete_configitem($strDeleteBaselineKeys,false);
			}

			//-- delete extended record
			$rsDel = new SqlQuery();
			$strExtRecords = "";
			$strSelectExtRecords  =  "select distinct(EXTENDED_TABLE) as tbl from CONFIG_ITEMI, CONFIG_TYPEI where CK_CONFIG_TYPE=PK_CONFIG_TYPE and EXTENDED_TABLE !='' and PK_AUTO_ID in (". $configItemKeys .")";
			$rs->Query($strSelectExtRecords);
			while($rs->Fetch())
			{
				$strExtRecords = $rs->row->tbl;
				$strDeleteExtRecords = "delete from " . strToUpper($strExtRecords) ." where PK_CI_ID in (". $configItemKeys . ")";
				$rsDel->Query($strDeleteExtRecords);
			}

			//-- lastly delete the actual ci record and return result
			$strDeleteCIs = "delete from CONFIG_ITEMI where PK_AUTO_ID in(". $configItemKeys .")";
			$rs->Query($strDeleteCIs,"swdata");
			return $rs;

		}//-- eof function delete_configitem($configItemKeys, $boolDeleteBaselines)


		function reactivate_baseline($intCIkey, $intOldCIkey)
		{
			// -- Get BASELINEID for the selected record
			$strSelectBLN = "select BASELINEID,CK_CONFIG_TYPE from CONFIG_ITEMI where PK_AUTO_ID = " . PrepareForSql($intCIkey);
			$oRS = new SqlQuery();
			$oRS->Query($strSelectBLN);
			$blnid = -1;
			$strCIType = "";
			while($oRS->Fetch())
			{
				$blnid = $oRS->row->baselineid;
				$strCIType = $oRS->row->ck_config_type;
			}
			// -- Update CONFIG_ITEMI record to set ISACTIVEBASELINE to No
			$strTable = "CONFIG_ITEMI";
			$arrOneData['PK_AUTO_ID'] = $intOldCIkey;
			$arrOneData['ISACTIVEBASELINE'] = 'No';
			$boolUpdateOne = false;
			$arcOne = xmlmc_updateRecord($strTable,$arrOneData);
			if(1==$arcOne) $boolUpdateOne = true;
			if($boolUpdateOne)
			{
				// -- Update CONFIG_ITEMI record (reactivated CI) to set ISACTIVEBASELINE to Yes
				$strTwoTable = "CONFIG_ITEMI";
				$arrTwoData['PK_AUTO_ID'] = $intCIkey;
				$arrTwoData['ISACTIVEBASELINE'] = 'Yes';
				$boolUpdateTwo = false;
				$arcTwo = xmlmc_updateRecord($strTwoTable,$arrTwoData);
				if(1==$arcTwo) $boolUpdateTwo = true;
				if($boolUpdateTwo)
				{
					//-- copy relations over to new baseline
					//$this->copy_relations(intOldCIkey, intCIkey);
					$this->copy_merelations($intOldCIkey, $intCIkey);
					$this->copy_servicetypes($intOldCIkey, $intCIkey);

					if(strToUpper($strCIType)=="ME->SERVICE")
					{
						$service = new serviceFunctions();
						$service->baseline_reactive($intOldCIkey, $intCIkey);
					}
					return true;
				}
			}
			return false;
		}//eof function reactivate_baseline($intCIkey, $intOldCIkey)

		function copy_relations($intCopyFromCIKey, $intCopyToCIkey)
		{
			//-- copy child ones first
			$strSelect = "select * from CONFIG_RELI where FK_CHILD_ID = " . pfs($intCopyFromCIKey) . " OR FK_PARENT_ID = " . pfs($intCopyFromCIKey);
			$oRS = get_recordset($strSelect);
			while($oRS->Fetch())
			{
				//-- loop through table structure and make a copy of each relation
				$strColumns = "";
				$strValues = "";
				while (list($strColName,$varColValue) = each($oRS->row))
				{
					$boolParent = ($oRS->GetValueAsString("fk_child_id")!=$intCopyFromCIKey);

					if(UC($strColName)!="PK_AUTO_ID")
					{
						if($strColumns!="")$strColumns.=",";
						if($strValues!="")$strValues.=",";

						//-- if setting child value and ci is the child
						if ((UC($strColName)=="FK_CHILD_ID")&&(!$boolParent))
						{
							//-- set value
							$varColValue = $intCopyToCIkey;
						}
						else if ((UC($strColName)=="FK_PARENT_ID")&&($boolParent))
						{
							//-- if setting parent value and ci is the parent
							$varColValue = $intCopyToCIkey;
						}

						$strColumns.= $strColName;
						//$strValues.= encapsulate("config_reli",$strColName,$varColValue);
						$strValues.= $varColValue;
					}
				}
				
				$arrSelectedColumns = explode(",",$strColumns);
				$arrSelectedValues = explode(",",$strValues);
				
				// -- Insert into CONFIG_RELI
				for($i=0;$i<count($arrSelectedColumns);$i++)
				{
					$strColumn = $arrSelectedColumns[$i];
					$strValue = $arrSelectedValues[$i];
					$arrData[$strColumn] = $strValue;			
				}
				$strTable = "CONFIG_RELI";
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1!=$arc)
				{
				return false;
				}
			}
			return true;

		}
		function copy_eventactions($intCopyFromCIKey, $intCopyToCIkey)
		{
			return copyRecordXMLMC("ci_avail_action", "fk_ci_id",$intCopyFromCIKey,$intCopyToCIkey);
		}

		function copy_blackout($intCopyFromCIKey, $intCopyToCIkey)
		{
			return copyRecordXMLMC("ci_blackout", "fk_ci_id",$intCopyFromCIKey,$intCopyToCIkey);
		}

		function copy_dml_uri($intCopyFromCIKey, $intCopyToCIkey)
		{
			return copyRecordXMLMC("cmdb_uri_link", "fk_ci_id",$intCopyFromCIKey,$intCopyToCIkey);
		}
		function copy_kb_assocs($intCopyFromCIKey, $intCopyToCIkey)
		{
			return copyRecordXMLMC("config_relkb", "fk_ci_id",$intCopyFromCIKey,$intCopyToCIkey);
		}

		function copy_targets($intCopyFromCIKey, $intCopyToCIkey)
		{
			return copyRecordXMLMC("sc_target", "fk_auto_id",$intCopyFromCIKey,$intCopyToCIkey);
		}

		function copy_full_servicetypes($intCopyFromCIKey, $intCopyToCIkey)
		{
			return copyRecordXMLMC("ct_profiles", "fk_config_item",$intCopyFromCIKey,$intCopyToCIkey);
		}
		function copy_merelations($intCopyFromCIKey, $intCopyToCIkey)
		{
			// -- Get PK_AUTO_ID for the record that needs to be updated
			$strSelect = "SELECT PK_AUTO_ID FROM CONFIG_RELME WHERE FK_CI_ID = ".PrepareForSql($intCopyFromCIKey);
			$oRS = get_recordset($strSelect,"swdata");
			$strID = "";
			while($oRS->Fetch())
			{
				// -- Update CONFIG_RELME record with new FK_CI_ID
				$strID = get_field($oRS,'PK_AUTO_ID');
				$strTable = "CONFIG_RELME";
				$arrData['PK_AUTO_ID'] = PrepareForSql($strID);
				$arrData['FK_CI_ID'] = PrepareForSql($intCopyToCIkey);
				$arc = xmlmc_updateRecord($strTable,$arrData);
			}

		}
		function copy_servicetypes($intCopyFromCIKey, $intCopyToCIkey)
		{
			// -- Get PK_AUTO_ID for the record that needs to be updated
			$strSelect = "SELECT PK_AUTO_ID FROM CT_PROFILES WHERE FK_CONFIG_ITEM = ".PrepareForSql($intCopyFromCIKey);
			$oRS = get_recordset($strSelect,"swdata");
			$strID = "";
			while($oRS->Fetch())
			{
				// -- Update CT_PROFILES record with new FK_CONFIG_ITEM
				$strID = get_field($oRS,'PK_AUTO_ID');
				$strTable = "CT_PROFILES";
				$arrData['PK_AUTO_ID'] = $strID;
				$arrData['FK_CONFIG_ITEM'] = PrepareForSql($intCopyToCIkey);
				$arc = xmlmc_updateRecord($strTable,$arrData);
			}
		}

		function clone_relations($intCopyFromCIKey, $intCopyToCIkey, $strCK_CONFIG_ITEM)
		{
			//-- copy child ones first
			$strSelect = "select * from CONFIG_RELI where FK_CHILD_ID = " . $intCopyFromCIKey . " OR FK_PARENT_ID = " . $intCopyFromCIKey;
			$oRS = get_recordset($strSelect);
			while($oRS->Fetch())
			{
				//-- loop through table structure and make a copy of each relation
				$strColumns = "";
				$strValues = "";
				while (list($strColName,$varColValue) = each($oRS->row))
				{
					$boolParent = ($oRS->GetValueAsString("fk_child_id")!=$intCopyFromCIKey);

					if(UC($strColName)!="PK_AUTO_ID")
					{
						if($strColumns!="")$strColumns.=",";
						if($strValues!="")$strValues.=",";

						//-- if setting child value and ci is the child
						if ((UC($strColName)=="FK_CHILD_ID")&&(!$boolParent))
						{
							//-- set value
							$varColValue = $intCopyToCIkey;
						}
						else if ((UC($strColName)=="FK_PARENT_ID")&&($boolParent))
						{
							//-- if setting parent value and ci is the parent
							$varColValue = $intCopyToCIkey;
						}

						//-- if setting child value and ci is the child
						if ((UC($strColName)=="FK_CHILD_ITEMTEXT")&&(!$boolParent))
						{
							//-- set value
							$varColValue = $strCK_CONFIG_ITEM;
						}
						else if ((UC($strColName)=="FK_PARENT_ITEMTEXT")&&($boolParent))
						{
							//-- if setting parent value and ci is the parent
							$varColValue = $strCK_CONFIG_ITEM;
						}

						$strColumns.= $strColName;
						//$strValues.= encapsulate("config_reli",$strColName,$varColValue);
						$strValues.= $varColValue;
					}
				}

				// -- Build an array for addRecord
				$arrSelectedColumns = explode(",",$strColumns);
				$arrSelectedValues = explode(",",$strValues);
				for($i=0;$i<count($arrSelectedColumns);$i++)
				{
					$strColumn = $arrSelectedColumns[$i];
					$strValue = $arrSelectedValues[$i];
					$arrData[$strColumn] = $strValue;					
				}
				$strTable = "CONFIG_RELI";
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1!=$arc) return false;				
			}
			return true;
		}


		//-- copy ci's extended record
		function copy_extended_record($intCopyFromCIKey, $intCopyToCIkey, $strConfigType)
		{
			//-- make sure we have extended tables
			if ( ($this->setup_extended_record($intCopyToCIkey, $strConfigType, false)) && ($this->setup_extended_record($intCopyFromCIKey, $strConfigType, false)) )
			{
				//-- get table name
				$rec = get_record("CONFIG_TYPEI", $strConfigType);
				$strTable = LC($rec['extended_table']);

				//-- get extended data
				$extTableKeyCol = dd_primarykey($strTable);
				$strWhere = $extTableKeyCol . " = " . $intCopyFromCIKey;
				$oRec = get_recordwhere($strTable,$strWhere);
				if ($oRec)
				{
					//-- set new fields for copy record
					$dd = new dd($strTable); //-- create dd instance - note we tell it what table we want to load
					$strUpdate= "";
					$arrUpRecData = array();
					for ($x=0; $x < count($dd->tables[$strTable]->columns);$x++)
					{
						$colName = $dd->tables[$strTable]->columns[$x]->Name;
						$colValue = $oRec[LC($colName)];

						if(isColNumeric($strTable, $colName) && $colValue=="")
							$colValue=0;

						if (UC($colName) != UC($extTableKeyCol))
						{
							$arrUpRecData[$colName] = $colValue;
						}
						
					}//-- for loop		
					//-- insert copied record
					if (count($arrUpRecData) > 0)
					{
						// -- Break strUpdate to create an array of data for updateRecord
						$strUpRecTable = UC($strTable);
						$arrUpRecData[UC($extTableKeyCol)] = $intCopyToCIkey;
						$arcUpRec = xmlmc_updateRecord($strUpRecTable,$arrUpRecData);
						if(1==$arcUpRec) return true;
					}

				}//-- if oRec
				else
				{
					$this->throwError("Extended data record not found for this configuration item. Please contact your Supportworks Administrator.");
				}
			}//-- if has extended tables
		}

		//-- check for extended properties for CMDB
		function setup_extended_record($intCIKey, $strConfigType,$boolMessages)
		{
			$rec = get_record("CONFIG_TYPEI", $strConfigType);
			if($rec)
			{
				$configForm = $rec['extended_form'];
				$configTable = LC($rec['extended_table']);

				if (($configTable == "") || ($configTable == "N/A"))
				{
					if ($boolMessages) $this->throwError("There is no extended table specified for this Configuration Type");
					return false;
				}
				$dd = new dd($configTable); //-- create dd instance

				if (!isset($dd->tables[$configTable]))
				{
					if ($boolMessages) $this->throwError("The defined table for this extended form does not exist.");
					return false;
				}

				//-- make sure we have an extended record for this item - if not create it
				$rec = get_record($configTable, $intCIKey);
				if(!$rec)
				{
					$strInsert = "insert into " . UC($configTable) . " (" .  UC(dd_primarykey($configTable)) . ") values (" . $intCIKey . ")";
					if (!submitsql($strInsert))
					{
						return false;
					}
				}
				return $configForm;
			}
			else
			{
				if($boolMessages) 
				{
				  $this->throwError("The configuration type (".$strConfigType.") does not exist in the config_typei table");
				}
			}
			return false;
		}

		//-- copy parents relation types over to type
		function copy_parenttype_sc_relationtypes($strTypeID, $strParentTypeID)
		{
			$bProcessOk=true;
			$strSQL = "select FK_RELTYPE from CT_RELTYPES where FK_CONFIG_TYPE = '" . pfs($strParentTypeID). "'";
			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$strRelType = get_field($oRS,"FK_RELTYPE");
				
				// -- Build insert query
				$strTable = "CT_RELTYPES";
				$arrData['FK_RELTYPE'] = pfs($strRelType);
				$arrData['FK_CONFIG_TYPE'] = pfs($strTypeID);
				$arrData['FLG_SC'] = 1;
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1!=$arc) $bProcessOk=false;
			}

			return $bProcessOk;
		}

		function copy_parenttype_relationtypes($strTypeID, $strParentTypeID)
		{
			$bProcessOk=true;
			$strSQL = "select FK_RELTYPE from CT_RELTYPES where FK_CONFIG_TYPE = '" . pfs($strParentTypeID). "'";
			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$strRelType = get_field($oRS,"FK_RELTYPE");
				
				// -- Build insert query
				$strTable = "CT_RELTYPES";
				$arrData['FK_RELTYPE'] = pfs($strRelType);
				$arrData['FK_CONFIG_TYPE'] = pfs($strTypeID);
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1!=$arc) $bProcessOk=false;
			}

			return $bProcessOk;
		}


		function copy_parenttype_sc_statuslevels($strTypeID, $strParentTypeID)
		{
			$bProcessOk=true;

			$strSQL = "select STATUS_LEVEL, CMDB_STATUS, COLOUR_CODE from CT_STATUSL where FK_CONFIG_TYPE = '" .pfs($strParentTypeID). "'";
			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$strStatus = get_field($oRS,"STATUS_LEVEL");
				$strCMDBstatus = get_field($oRS,"CMDB_STATUS");
				$strColour = get_field($oRS,"COLOUR_CODE");

				$strTable = "CT_STATUSL";
				$arrData['STATUS_LEVEL'] = pfs($strStatus);
				$arrData['CMDB_STATUS'] = pfs($strCMDBstatus);
				$arrData['COLOUR_CODE'] = pfs($strColour);
				$arrData['FK_CONFIG_TYPE'] = pfs($strTypeID);
				$arrData['FLG_SC'] = 1;
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1!=$arc) $bProcessOk=false;

			}

			return $bProcessOk;
		}

		function copy_parenttype_statuslevels($strTypeID, $strParentTypeID)
		{
			$bProcessOk=true;

			$strSQL = "select STATUS_LEVEL, CMDB_STATUS, COLOUR_CODE from CT_STATUSL where FK_CONFIG_TYPE = '" .pfs($strParentTypeID). "'";
			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$strStatus = get_field($oRS,"STATUS_LEVEL");
				$strCMDBstatus = get_field($oRS,"CMDB_STATUS");
				$strColour = get_field($oRS,"COLOUR_CODE");

				$strTable = "CT_STATUSL";
				$arrData['STATUS_LEVEL'] = pfs($strStatus);
				$arrData['CMDB_STATUS'] = pfs($strCMDBstatus);
				$arrData['COLOUR_CODE'] = pfs($strColour);
				$arrData['FK_CONFIG_TYPE'] = pfs($strTypeID);
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1!=$arc) $bProcessOk=false;

			}

			return $bProcessOk;
		}


		function create_ci($strCIType, $intNumberOfCopies)
		{
			global $_core;
			
			$strCIType = pfs($strCIType);
			$intNumberOfCopies = pfs($intNumberOfCopies);
			
			//-- copy the CI
		   $strSelectCI = "select * from CONFIG_TYPEI where flg_item=1 and PK_CONFIG_TYPE = '" . $strCIType . "'";
		   $oRS = get_recordset($strSelectCI,"swdata");
		   if($oRS->Fetch())
		   {
				$strExtTable = get_field($oRS,"extended_table");
				$strExtCols	 = "";
				$strExtValues= "";
				$strTable = "config_itemi";
				$strCols	 = "";
				$strValues= "";
				$strWhere = "";
				$boolDesc = false;

				$strSelectDefaults = "select * from CONFIG_TYPE_DEF where FK_CONFIG_TYPE = '" . $strCIType . "'";
				$oDefaults = get_recordset($strSelectDefaults,"swdata");
				while($oDefaults->Fetch())
			   {
					$colTarget = get_field($oDefaults,"targetbinding");
					$arrTarget = explode(".",$colTarget);
					$strTargetTable = $arrTarget[0];
					$colName = $arrTarget[1];
					$colValue = get_field($oDefaults,"defaultvalue");
					if($strTargetTable==$strTable)
					{
						if(UC($colName) == "DESCRIPTION")$boolDesc = true;

						if (UC($colName) == "CK_CONFIG_ITEM" || UC($colName) == "CK_CONFIG_TYPE")
						{

						}
						else if (UC($colName) != UC(dd_primarykey($strTable)))
						{
							if(	$strCols != "")$strCols .= ",";
							$strCols .= UC($colName);

							if(	$strValues != "")$strValues .= ",";
							$strValues .=  encapsulate($strTable,$colName,$colValue);

							if($strWhere !="") $strWhere .=" and ";
							$strWhere .=  UC($colName)."=".encapsulate($strTable,$colName,$colValue);
						}
				   }
				   else if($strTargetTable==$strExtTable)
				   {
						if (UC($colName) != UC(dd_primarykey($strExtTable)))
						{
							if(	$strExtCols != "")$strExtCols .= ",";
							$strExtCols .= UC($colName);

							if(	$strExtValues != "")$strExtValues .= ",";
							$strExtValues .=  encapsulate($strExtTable,$colName,$colValue);
						}
				   }
			   }
			   if($strCols!="")
			   {
					$strCols .= ",ck_config_type,flg_canrename";
					$strValues .= ",'".$strCIType."',1";
					$strWhere .=" and ck_config_type='".$strCIType."' and flg_canrename=1";
				   if(strpos($strCols,"isactivebaseline")===false)
				   {
						$strCols .= ",isactivebaseline";
						$strValues .= ",'Yes'";
						$strWhere .=" and isactivebaseline='Yes'";
				   }
				   if(strpos($strCols,"isunavailable")===false)
				   {
						$strCols .= ",isunavailable";
						$strValues .= ",'No'";
						$strWhere .=" and isunavailable='No'";
				   }
				   if(strpos($strCols,"isauthorised")===false)
				   {
						$strCols .= ",isauthorised";
						$strValues .= ",'Yes'";
						$strWhere .=" and isauthorised='Yes'";
				   }
				   if(strpos($strCols,"appcode")===false)
				   {
						$strCols .= ",appcode";
						$strValues .= ",'".$_core['_sessioninfo']->dataset."'";
						$strWhere .=" and appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
				   }
				   if(strpos($strCols,"ck_baselineindex")===false)
				   {
						$strCols .= ",ck_baselineindex";
						$strValues .= ",0";
						$strWhere .=" and ck_baselineindex=0";
				   }

			   }else
			   {
					$strCols = "isactivebaseline,isunavailable,isauthorised,ck_config_type,flg_canrename,appcode,ck_baselineindex";
					$strValues = "'Yes','No','Yes','".$strCIType."',1,'".$_core['_sessioninfo']->dataset."',0";
					$strWhere = "isactivebaseline='Yes' and isunavailable='No' and isauthorised='Yes' and ck_config_type = '".$strCIType."' and flg_canrename=1 and appcode in (".$_core['_sessioninfo']->datasetFilterList.")  and ck_baselineindex=0";
			   }
			   if(!$boolDesc)
			   {
					$strDesc = pfs(get_field($oRS,"notes"));
					$strCols .= ",DESCRIPTION";
					$strValues .= ",'".$strDesc."'";
					$strWhere .=" and DESCRIPTION='".$strDesc."'";
			   }

			}
			else
			{
				//-- exit script and client will alert error and return false
				throwProcessErrorWithMsg("Cannot create Configuration Items of type '".$strCIType."' as this is not an Item Type."); 
				return false;
			}
			
			//Get existing clones
			$strSelect = "select max(PK_AUTO_ID) from CONFIG_ITEMI where ck_config_item LIKE 'New ".$strCIType."%'";
			$oRS = get_recordset($strSelect,"swdata");
			$pk_auto_id = 0;

			while($oRS->Fetch())
			{
				$pk_auto_id = $oRS->GetValueAsString(0);
			}
			
			$strId = "";	
			//If existing clones exist
			if($pk_auto_id!=0)
			{
				//get the ck_config_item of the latest existing clones
				$strSelect = "select ck_config_item from CONFIG_ITEMI where pk_auto_id = ".$pk_auto_id;
				$oRS = get_recordset($strSelect,"swdata");
				while($oRS->Fetch())
				{
					$strId = $oRS->GetValueAsString(0);
				}	
			}

			
			$strTemp = "New ".$strCIType."";
			$offset = substr($strId,strlen($strTemp));
			if(!is_numeric($offset) || $offset=="")$offset = 0;
			$until = 1+parseInt($offset)+parseInt($intNumberOfCopies);
			$offset = parseInt($offset)+1;

			for($i = $offset;$i<$until;$i++)
			{
			   if(strpos($strCols,"ck_config_item")===false)
			   {
					$strCols .= ",ck_config_item";
					$strValues .= ",'New ".pfs($strCIType)."".$i."'";
					$strWhere .=" and ck_config_item='New ".pfs($strCIType)."".$i."'";
			   }

				//-- submit then get new ci id
				$strInsertSQL = "insert into " . UC($strTable) . "( " . UC($strCols) . ") values (" . $strValues . ")";
				if (submitsql($strInsertSQL))
				{
					$strSelect = "select max(PK_AUTO_ID) from CONFIG_ITEMI where " . $strWhere;
					$oRS = get_recordset($strSelect,"swdata");
					$newCIkey = 0;
					while($oRS->Fetch())
					{
						$newCIkey = $oRS->GetValueAsString(0);
					}

					//refresh record to make 'new' reset name, baselineid
					$strUpdate = "update " . UC($strTable) . " set BASELINEID = ".$newCIkey.",ck_config_item = 'New ".$strCIType."".$i."'  where PK_AUTO_ID = " . $newCIkey;
					submitsql($strUpdate);

					if($strExtTable!="")
					{
						$strInsertCols = $strExtCols;
						if($strInsertCols!="")$strInsertCols.=",";
						$strInsertCols .=UC(dd_primarykey($strExtTable));

						$strInsertValues = $strExtValues;
						if($strInsertValues!="")$strInsertValues.=",";
						$strInsertValues .=$newCIkey;

						$strExtInsertSQL = "insert into " . UC($strExtTable) . "(" . UC($strInsertCols) . ") values (" . $strInsertValues . ")";
						submitsql($strExtInsertSQL);
					}

					$strSelect = "select * from CI_TYPE_RELKB where fk_config_type='" . pfs($strCIType) . "'";
					$oKBDocs = get_recordset($strSelect,"swdata");
					while($oKBDocs->Fetch())
					{
						$kb_docref = $oKBDocs->GetValueAsString("KB_DOCREF");
						$kb_title = $oKBDocs->GetValueAsString("KB_TITLE");
						$strInsert = "insert into config_relkb (FK_CI_ID,FK_CONFIG_TYPE,CI_ITEMTEXT,KB_DOCREF,KB_TITLE) values ";
						$strInsert .= "(".$newCIkey.",'".pfs($strCIType)."','".pfs($strCIType)."','".pfs($kb_docref)."','".pfs($kb_title)."')";
						submitsql($strInsert);
					}		
				}
				else
				{
					return false;
				}
			}//-- eof for($i = $offset;$i<$until;$i++)

			return true;
		}



		function create_clone($intCIkey, $intBLNid, $strCIType, $intNumberOfCopies)
		{
			$dd = new dd("config_itemi");

			//-- copy the CI
			$strSelectCI = "select * from CONFIG_ITEMI where PK_AUTO_ID = " . pfs($intCIkey);
			$oRS = get_recordset($strSelectCI,"swdata");
			if($oRS->Fetch())
			{
				//-- set new fields for copy record
				$strTable = "config_itemi";
				$strCols = "";
				$strValues= "";
				$strCK_CONFIG_ITEM = "";
				for ($x=0; $x < count($dd->tables[LC($strTable)]->columns);$x++)
				{
					$colName = $dd->tables[LC($strTable)]->columns[$x]->Name;
					$colValue = get_field($oRS,$colName);
					//-- F0099089, check if column is numeric, and if so correct to positive values
					$aCol = $dd->tables[LC($strTable)]->columns[$x];
					$strEncaps = ($aCol->IsNumeric())?"":"'";
					if($strEncaps=="" && $colValue<0)
					{
					   $colValue = fix_epoch($colValue);
					}

					if (UC($colName) != UC(dd_primarykey($strTable)))
					{
						if (UC($colName) == "CK_CONFIG_ITEM") $strCK_CONFIG_ITEM = $colValue;
						//-- check for iscurrentversion and bln
						if (UC($colName) == "CK_BASELINEINDEX") $colValue = 0;
						if (UC($colName) == "ISACTIVEBASELINE") $colValue = "Yes";
						if($colValue!="")
						{
							if(	$strCols != "")$strCols .= ",";
							$strCols .= UC($colName);

							if(	$strValues != "") $strValues .= ",";
							//$strValues .=  encapsulate($strTable,$colName,$colValue);
							$strValues .= $colValue;
						}
					}
				}
			}
			else
			{
				//-- no data - exit script
				throwProcessErrorWithMsg("CMDB create_clone failed because the master configuration item was not found. Please contact your Administrator"); //-- so submit will treat as error and alert out.
				return false;
			}

			//Get existing clones
			$strSelect = "select max(PK_AUTO_ID) from CONFIG_ITEMI where ck_config_item LIKE 'CLONE__".$strCK_CONFIG_ITEM."__%'";
			$oRS = get_recordset($strSelect,"swdata");
			$pk_auto_id = 0;

			while($oRS->Fetch())
			{
				$pk_auto_id = $oRS->GetValueAsString(0);
			}

			$strId = "";	
			//If existing clones exist	
			if($pk_auto_id!=0)
			{
				//get the ck_config_item of the latest existing clones
				$strSelect = "select ck_config_item from CONFIG_ITEMI where pk_auto_id = ".$pk_auto_id;
				$oRS = get_recordset($strSelect,"swdata");
				while($oRS->Fetch())
				{
					$strId = $oRS->GetValueAsString(0);
				}
			}
			
			$strTemp = "CLONE__".$strCK_CONFIG_ITEM."__";
			$offset = substr($strId,strlen($strTemp));
			if(!is_numeric($offset) || $offset=="")$offset = 0;
			$until = 1+parseInt($offset)+parseInt($intNumberOfCopies);
			$offset = parseInt($offset)+1;

			for($i = $offset;$i<$until;$i++)
			{
				//-- submit then get new ci id
				$arrSelectedColumns = explode(",",$strCols);
				$arrSelectedValues = explode(",",$strValues);
				for($j=0;$j<count($arrSelectedColumns);$j++)
				{
					$strColumn = $arrSelectedColumns[$j];
					$strValue = $arrSelectedValues[$j];
					$arrData[$strColumn] = $strValue;
				}
				$strTable = UC($strTable);
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1==$arc)
				{
					$strSelect = "select max(PK_AUTO_ID) from CONFIG_ITEMI where BASELINEID = " . $intBLNid;
					$oRS = get_recordset($strSelect,"swdata");
					$newCIkey = 0;
					while($oRS->Fetch())
					{
						$newCIkey = $oRS->GetValueAsString(0);
					}

					//refresh record to make 'new' reset name, baselineid
					$strUpdateTable = UC($strTable);
					$arrUpdateData['PK_AUTO_ID'] = $newCIkey;
					$arrUpdateData['BASELINEID'] = $newCIkey;
					$arrUpdateData['CK_CONFIG_ITEM'] = "CLONE__".$strCK_CONFIG_ITEM."__".$i;
					$arcUpdate = xmlmc_updateRecord($strUpdateTable,$arrUpdateData);

					//-- create/copy extended table record
					$this->copy_extended_record($intCIkey, $newCIkey, $strCIType);

					//-- copy relationships, service types and call diary
					$this->clone_relations($intCIkey,$newCIkey,'CLONE__'.$strCK_CONFIG_ITEM."__".$i);
					$this->copy_merelations($intCIkey, $newCIkey);
					$this->copy_eventactions($intCIkey, $newCIkey);
					$this->copy_blackout($intCIkey, $newCIkey);
					$this->copy_dml_uri($intCIkey, $newCIkey);
					$this->copy_kb_assocs($intCIkey, $newCIkey);

					//-- copy service types to new CI
					$this->copy_full_servicetypes($intCIkey, $newCIkey);
				}
				else
				{
					return false;
				}
			}
			return true;
		}

		function update_avail_hist_stats($intCI)
		{
			$iperc=100;
			$iTotal = 0;
			$iOpTotal = 0;
			$strSQL = "select DOWNTIME,OPDOWNTIME from CI_AVAIL_HIST where FK_CI_ID = " . pfs($intCI);

			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$iTotal = $iTotal + number_to_time(get_field($oRS,'downtime'));
				$iOpTotal = $iOpTotal + number_to_time(get_field($oRS,'opdowntime'));
			}

			if($iTotal>0)
			{
				$iperc = ($iOpTotal / $iTotal) * 100;
				$iperc = round(100 - $iperc);
				if(!is_numeric($iperc))$iperc=100;
			}
			
			$iTotal = mins_from_perc($iTotal);
			$iOpTotal = mins_from_perc($iOpTotal);
			
			// -- Build updateRecord query
			$strTable = "CONFIG_ITEMI";
			$arrData['PK_AUTO_ID'] = pfs($intCI);
			$arrData['TOTALOPDOWNTIME'] = $iOpTotal;
			$arrData['TOTALDOWNTIME'] = $iTotal;
			$arrData['PERCAVAILABILITY'] = $iperc;
			$arc = xmlmc_updateRecord($strTable,$arrData);
			if(1!=$arc)
			{
				return false;
			}
			return true;
		}

		function cmdb_create_baseline($intCIkey, $intBLNid, $strCIType, $boolUpdateOrig = true, $intDiaryRowCount = 0)
		{
			//-- get baseline count for item	
			$strSelectBLN = "select max(CK_BASELINEINDEX) from CONFIG_ITEMI where BASELINEID = " . $intBLNid;
			$oRS = get_recordset($strSelectBLN);

			$maxbln = -1;
			while($oRS->Fetch())
			{
				$maxbln = $oRS->GetValueAsString(0);
			}

			//-- do we have bln
			if($maxbln==-1)
			{
				return -1;
			}
			
			//-- select ci
			$strSelectCI = "select * from config_itemi where pk_auto_id = " . pfs($intCIkey);
			$oRS = get_recordset($strSelectCI);
			if(!$oRS->Fetch())return -1;

			
			//-- set new fields for copy record
			$strTable = "config_itemi";
			$strCiTablePriKey = "pk_auto_id";
			$strParams = "table=config_itemi";
			
			global $session;
			global $dbs;
			$dbs->loadTable($strTable);
			
			$strCols = "";
			$strValues = "";
			for ($x=0; $x < count($dbs->tables[$strTable]->columns);$x++)
			{
				$colName = $dbs->tables[$strTable]->columns[$x]->Name;
				$colValue = get_field($oRS,$colName);

				if (LC($colName) != $strCiTablePriKey)
				{
					//-- check for iscurrentversion and bln
					if (UC($colName) == "CK_BASELINEINDEX") $colValue = ++$maxbln;
					if (UC($colName) == "ISACTIVEBASELINE") $colValue = "Yes";
					
					if(	$strCols != "")$strCols .= ",";
					$strCols .= UC($colName);

					if(	$strValues != "")$strValues .= ",";
					$strValues .= encapsulate($strTable,$colName,$colValue);
				}
			}

			//-- submit then get new ci id
			$strInsertSQL = "insert into " . UC($strTable) . " ( " . $strCols . ") values (" . $strValues . ")";
			if ($strCols!="" && submitsql($strInsertSQL))
			{
				$strSelect = "select max(PK_AUTO_ID) from CONFIG_ITEMI where BASELINEID = " . $intBLNid;
				$oRS = get_recordset($strSelect);

				$newCIkey = 0;
				while($oRS->Fetch())
				{
					$newCIkey = $oRS->GetValueAsString(0);
				}

				//-- create/copy extended table record
				$this->copy_extended_record($intCIkey, $newCIkey, $strCIType);

				//-- set original ci isactivebaseline to No
				if($boolUpdateOrig)
				{
					$strUpdate = "update " . UC(strTable) . " set ISACTIVEBASELINE = 'No' where PK_AUTO_ID = " . pfu($intCIkey);
					submitsql($strUpdate);
				}

				//-- copy relationships, service types and call diary
				$this->copy_relations($intCIkey,$newCIkey);
				$this->copy_merelations($intCIkey, $newCIkey);
				$this->copy_servicetypes($intCIkey, $newCIkey);
				$this->copy_eventactions($intCIkey, $newCIkey);
				$this->copy_blackout($intCIkey, $newCIkey);
				$this->copy_dml_uri($intCIkey, $newCIkey);
				$this->copy_kb_assocs($intCIkey, $newCIkey);
				$this->copy_targets(intCIkey, newCIkey);

				if(UC($strCIType)=="ME->SERVICE")
				{
					$service->baseline_create($intCIkey, $newCIkey);
				}

				//$this->insert_diaryentry($intCIkey, "Auto Update", "Baselined", $session->analystId, time(), "Configuration Item Baselined.", 0);
				//$this->copy_diaryentries($intCIkey, $newCIkey);
				return $newCIkey;
			}
			else
			{
				return -1;
			}
		}

	}

	//-- instance for developers to use in the scripts
	global $cmdb;
	$cmdb = new cmdbFunctions();

}

?>