<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');


$prefix = 'bpmutil_import_';
//-- check if key matches
if(!check_secure_key($prefix.'key'))
{
	//-- set uploading to zero (determines if action is being taken)
	echo "Authentication failure. The action to import was not performed.";
	unset($_SESSION[$prefix.'key']);
	exit;
}	
unset($_SESSION[$prefix.'key']);


$swdsn = $_POST['dsnname'];
$swuid = $_POST['username'];
$swpwd = $_POST['password'];

if($swdsn=="")
{
	$swdsn = swdsn();
	$swuid = swuid();
	$swpwd = swpwd();
}
else
{
	if($swuid=="")
	{
		echo "Please provide a username for the DSN.<br />";
		exit;
	}
	else
	{
		$boolDSN = true;
	}
}

//Create connection
$con = new CSwDbConnection;
if(!$con->Connect($swdsn, $swuid, $swpwd))
{
	echo "Failed to connect to database, please check ODBC connection";
	exit;
}

$arrWorkflow = $_POST['filenames'];
$currAppCode = $_POST['currAppCode'];
if(count($arrWorkflow)<1)
{
	echo "<br /><b>No Process selected </b>";
	exit;
}


for ($w=0;$w<count($arrWorkflow);$w++)
{
	$appcodeMessage = "";
	$strErrorMessage = "";
	$workflow_name = $arrWorkflow[$w];
	$workflow_name = str_replace("%20", " ", $workflow_name);

	$ext_table="";
	$ext_form="";

	//intialise array
	$Fields_Array = array();

	$strFileName = $_SESSION['strDirectory'].$workflow_name.".xml";
	//echo $strFileName;
    $xmlfile = file_get_contents($strFileName);

	//echo $xmlfile;

    $xmlDoc = domxml_open_mem($xmlfile);
    if($xmlDoc)
    {
        $root = $xmlDoc->document_element();
		$arrRecordsetNodes = $root->child_nodes();
		//var_dump($arrRecordsetNodes);
		$i=0;

		foreach ($arrRecordsetNodes  as $aRecordsetNode)
		{		
			$p=0;
			$x=0;
			$arrRecordNodes = $aRecordsetNode->child_nodes();
			foreach ($arrRecordNodes as $aRecordNode)
			{	
				$p=1;
				$j=0; 
				$q=0;
				$arrFieldNodes = $aRecordNode->child_nodes();

				//store table in a separate Array to use later on
				$arTable[$i]= $aRecordsetNode->get_attribute('table');
				//echo "<br />". $aRecordsetNode->get_attribute('table');
				foreach ($arrFieldNodes as $aFieldNode)
				{ 

					if ($aFieldNode->tagname!="")
					{
						$q=1; 

						$Fields_Array[$aRecordsetNode->get_attribute('table')][$x]['field'][$j] = $aFieldNode->tagname;
						$Fields_Array[$aRecordsetNode->get_attribute('table')][$x]['value'][$j] = utf8_decode($aFieldNode->get_content());
						$j++; //increment for each field & value
					}
				}

				if ($q==1)
				{
					$arrRecordFieldCount[$aRecordsetNode->get_attribute('table')][$x] = $j;

					$x+=$q; //increment for each record

					//store count for the number of records to be inserted for each table 
					$arTableRecord[$aRecordsetNode->get_attribute('table')]= $x;
				}

			}
			$i+=$p; //increment recordset/table count
		}
	}
	else
	{
		$strErrorMessage = "The file '".$workflow_name.".xml' is not correctly formatted xml.";
	}

	//this will be used to determine whether the process already exists and should be skipped. 
	$skip_workflow = false;

$arTable = array();
$arTable[] = 'bpm_stage';
$arTable[] = 'bpm_progress';
$arTable[] = 'bpm_workflow';
$arTable[] = 'bpm_stage_sts';
$arTable[] = 'bpm_stage_auth';
$arTable[] = 'bpm_stage_task';
$arTable[] = 'bpm_cond';
$arTable[] = 'bpm_cond_vpme';
$arTable[] = 'bpm_audit_fields';
$arTable[] = 'bpm_ctrl_fields';




//exit;


	for ($x=0;$x<count($arTable);$x++)
	{
		$table = $arTable[$x];
		//echo $table . '<br />';
		
		if (isset($arTableRecord[$table]))
		{
			for($k=0; $k<$arTableRecord[$table];$k++)
			{
				$insert_fields="";
				$insert_values="";
				switch ($table)
				{
					case "bpm_stage":
						//store old stage id
						//do insert
						//get last insert id
						//store both in an array

						for ($i=0;$i<$arrRecordFieldCount[$table][$k];$i++)
						{

							if ($Fields_Array[$table][$k]['field'][$i]!="")
							{
								switch($Fields_Array[$table][$k]['field'][$i])
								{
									case "pk_stage_id":
										$oldstageid = $Fields_Array[$table][$k]['value'][$i];

										//GET OLD STAGE ID
										$arrStageIDCoversion[$oldstageid]['old_stage_id'] = $oldstageid;
										break;

									case "pk_auto_id":
									case "pk_condition_id":
									case "flg_bsm_auth":
									case "change_or_service":
										//skip fields
										break;

									default:								
									
									if($Fields_Array[$table][$k]['field'][$i]!="#text" && $Fields_Array[$table][$k]['field'][$i]!="#comment")
									{
										if ($insert_fields !="") $insert_fields .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										
										if ($insert_values !="") $insert_values .= ",";
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
									}								
								}
							}
						}
						if ($skip_workflow===false)
						{
							$insert = "Insert into ".$table."(".$insert_fields.")values(".$insert_values.")";
							//echo $insert . '  -- 1<br />';
							if($con->Query($insert))
							{
								//GET INSERT ID
								$query = "select max(pk_stage_id) as id from bpm_stage";
								if($con->Query($query))
								{
									while($con->Fetch("stage"))
									{
										$ID = $stage_id;
										$break;
									}
								}
								//GET NEW STAGE ID
								$arrStageIDCoversion[$oldstageid]['new_stage_id']=$ID;
							}
							else
							{
								$strErrorMessage = "Query ".$insert." failed<br /><b>Process: '".$workflowid."' failed.</b> " . $con->_lasterror;
								$skip_workflow=true;
							}
						}
						break;

					case "bpm_workflow":
						$setAppCode = false;
						for ($i=0;$i<$arrRecordFieldCount[$table][$k];$i++)
						{
							if ($Fields_Array[$table][$k]['field'][$i]!="")
							{
								switch($Fields_Array[$table][$k]['field'][$i])
								{
									//-- SG 21/09/2012
									// If the fields array contains appcode, then set $setAppCode to be true
									// This is so we know whether to apply an appcode to the bpm_workflow record later in the script
									case "appcode":
										$setAppCode = true;
										break;
									case "fk_firststage_id":
										$workflowfirststageid = $Fields_Array[$table][$k]['value'][$i];
										break;

									case "pk_workflow_id":
										$workflowid = $Fields_Array[$table][$k]['value'][$i];
										break;
									case "ext_sw_form":
										$ext_form=$Fields_Array[$table][$k]['value'][$i];
										break;
									case "ext_db_table":
										$ext_table=$Fields_Array[$table][$k]['value'][$i];
										break;
									default:
								}
							}
						}

						$query = "select count(pk_workflow_id) as count from bpm_workflow where pk_workflow_id='".$workflowid."'";
						if($con->Query($query))
						{
							while($con->Fetch("process"))
							{
								if ($process_count>0)
									$skip_workflow=true;
								break;
							}
						}
						if($skip_workflow===false)
						{
							for ($i=0;$i<$arrRecordFieldCount[$table][$k];$i++)
							{
								if($Fields_Array[$table][$k]['field'][$i]!="#text" && $Fields_Array[$table][$k]['field'][$i]!="#comment" && $Fields_Array[$table][$k]['field'][$i]!="")
								{
									if ($insert_fields !="") $insert_fields .= ",";
									if ($insert_values !="") $insert_values .= ",";
									if($Fields_Array[$table][$k]['field'][$i] == "description")
									{
										$strValue = str_replace("â", "-",$Fields_Array[$table][$k]['value'][$i]);
										
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($strValue)."'";
									}
									else
									{					
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
									}
								}
							}
							
							$insert = "Insert into ".$table."(".$insert_fields.")values(".$insert_values.")";
							//echo $insert . " -- WORKFLOW<br />";
							if(!$con->Query($insert))
							{
								$strErrorMessage = "Query ".$insert." failed<br /><b>Process: '".$workflowid."' failed.</b>";
								$skip_workflow=true;
							}
						}
						break;

					case "bpm_progress":
						for ($i=0;$i<$arrRecordFieldCount[$table][$k];$i++)
						{
							if ($Fields_Array[$table][$k]['field'][$i]!="")
							{
								switch($Fields_Array[$table][$k]['field'][$i])
								{
									case "pk_progid":
										$oldprogressid = $Fields_Array[$table][$k]['value'][$i];

										//GET OLD STAGE ID
										$arrProgressIDCoversion[$oldprogressid]['old_progress_id'] = $oldprogressid;
										break;

									case "pk_auto_id":
									case "pk_condition_id":
									case "change_or_service":
										//skip fields
										break;

									default:
									if($Fields_Array[$table][$k]['field'][$i]!="#text" && $Fields_Array[$table][$k]['field'][$i]!="#comment")
									{
										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
									}
								}
							}
						}
						
						if ($skip_workflow===false)
						{
							if ($insert_fields!="")
							{
								$insert = "Insert into ".$table."(".$insert_fields.")values(".$insert_values.")";
								//echo $insert . " -- 2<br />";
								if($con->Query($insert))
								{
									//GET INSERT ID
									$query = "select max(pk_progid) as id from bpm_progress";
									if($con->Query($query))
									{
										while($con->Fetch("progress"))
										{
											$ID = $progress_id;
											break;
										}
									}
									//GET NEW Progress ID
								
									$arrProgressIDCoversion[$oldprogressid]['new_progress_id']=$ID;
								}
								else
								{
									$strErrorMessage = "Query ".$insert." failed<br /><b>Process: '".$workflowid."' failed.</b>";
									$skip_workflow=true;
								}
							}
						}
						break;
					
								
					case "bpm_cond":
						for ($i=0;$i<$arrRecordFieldCount[$table][$k];$i++)
						{
							if($Fields_Array[$table][$k]['field'][$i]!="#text" && $Fields_Array[$table][$k]['field'][$i]!="#comment" && $Fields_Array[$table][$k]['field'][$i]!="")if($Fields_Array[$table][$k]['field'][$i]!="#text" && $Fields_Array[$table][$k]['field'][$i]!="#comment" && $Fields_Array[$table][$k]['field'][$i]!="")
							{
								switch($Fields_Array[$table][$k]['field'][$i])
								{
									case "fk_stage_id":
									case "set_stage":
										$fk_stage_id = $Fields_Array[$table][$k]['value'][$i];
										$Fields_Array[$table][$k]['value'][$i] = $arrStageIDCoversion[$fk_stage_id]['new_stage_id']; 
										
										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
										break;
					
									case "set_progress":
										$fk_progress_id = $Fields_Array[$table][$k]['value'][$i];
										
										if(isset($arrProgressIDCoversion[$fk_progress_id]['new_progress_id']))
										{
											$Fields_Array[$table][$k]['value'][$i] = $arrProgressIDCoversion[$fk_progress_id]['new_progress_id']; 

											if ($insert_fields !="") $insert_fields .= ",";
											if ($insert_values !="") $insert_values .= ",";
											$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
											$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
										}
										break;
										
									case "pk_condition_id":
										$oldcondid = $Fields_Array[$table][$k]['value'][$i];
										//GET OLD Cond ID
										$arrConditionIDCoversion[$oldcondid]['old_condition_id'] = $oldcondid;
										break;
										
									default:
										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
								}
							}
						}
					if ($skip_workflow===false)
						{
							if ($insert_fields!="")
							{
								$insert = "Insert into ".$table."(".$insert_fields.")values(".$insert_values.")";
								//echo $insert . " -- 2<br />";
								if($con->Query($insert))
								{
									//GET INSERT ID
									$query = "select max(pk_condition_id) as id from bpm_cond";
									if($con->Query($query))
									{
										while($con->Fetch("condition"))
										{
											$ID = $condition_id;
											$break;
										}
									}
									//GET NEW Progress ID
									$arrConditionIDCoversion[$oldcondid]['new_condition_id']=$ID;
								}
								else
								{
									$strErrorMessage = "Query ".$insert." failed<br /><b>Process: '".$workflowid."' failed.</b>";
									$skip_workflow=true;
								}
							}
						}
						break;
					case "bpm_stage_auth":
					case "bpm_stage_task":
					case "bpm_stage_sts":
					case "bpm_cond_vpme":
					case "bpm_ctrl_fields":
					case "bpm_audit_fields":
						//if one of the above 
						//then swap old and new stage ids
						for ($i=0;$i<$arrRecordFieldCount[$table][$k];$i++)
						{
							if($Fields_Array[$table][$k]['field'][$i]!="#text" && $Fields_Array[$table][$k]['field'][$i]!="#comment" && $Fields_Array[$table][$k]['field'][$i]!="")
							{
								switch($Fields_Array[$table][$k]['field'][$i])
								{

									case "pk_id":
									case "pk_auto_id":
									case "pk_condition_id":
									case "pk_att_id":
									case "hremail_mailbox":
									case "hremail_template":
									case "hr_mail_box":
									case "hr_mail_template":
									case "hr_notification_recipient":
										//skip fields
										break;

									case "fk_stage_id":
									case "set_stage":
										$fk_stage_id = $Fields_Array[$table][$k]['value'][$i];
										$Fields_Array[$table][$k]['value'][$i] = $arrStageIDCoversion[$fk_stage_id]['new_stage_id']; 

										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";

										break;

									case "set_progress":
										$fk_progress_id = $Fields_Array[$table][$k]['value'][$i];
										$Fields_Array[$table][$k]['value'][$i] = $arrProgressIDCoversion[$fk_progress_id]['new_progress_id']; 

										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";

										break;
									case "fk_cond_id":
										//--Set Condition ID to pk_condition_id 
										$fk_cond_id = $Fields_Array[$table][$k]['value'][$i];
										$Fields_Array[$table][$k]['value'][$i] = $arrConditionIDCoversion[$fk_cond_id]['new_condition_id']; 

										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
										
										break;
									default:
										if ($insert_fields !="") $insert_fields .= ",";
										if ($insert_values !="") $insert_values .= ",";
										$insert_fields .= $Fields_Array[$table][$k]['field'][$i];
										$insert_values .= "'".pfs($Fields_Array[$table][$k]['value'][$i])."'";
								}
							}
						}

						if ($skip_workflow===false)
						{
							if ($insert_fields!="")
							{
								$insert = "Insert into ".$table."(".$insert_fields.")values(".$insert_values.")";
								//echo "<br />" .$insert." -- 4<br />";
								if(!$con->Query($insert))
								{
									$strErrorMessage = "Query ".$insert." failed<br /><b>Process: '".$workflowid."' failed.</b>";
									$skip_workflow=true;
								}
							}
						}
				} 
			}
		}
		
	}

	if($strErrorMessage!="")
	{
		//there has been an error, so roll out any records created
		$strTables = "bpm_stage_auth,bpm_stage_task,bpm_stage_sts,bpm_cond,bpm_cond_vpme,bpm_ctrl_fields,bpm_progress,bpm_stage";
		$arrTables = explode(",",$strTables);
		for($i=0; $i<count($arrTables); $i++)
		{
			$strDelete = "delete from ".$arrTables[$i]." where fk_workflow_id='".pfs($workflowid)."'";
			if(!$con->Query($strDelete))
			{
				$strErrorMessage = $strErrorMessage."<br />Failed to remove entries for table :".$arrTables[$i];
			}
		}
		$strDelete = "delete from bpm_workflow where pk_workflow_id='".pfs($workflowid)."'";
		if(!$con->Query($strDelete))
		{
			$strErrorMessage = $strErrorMessage."<br />Failed to remove entries for table :bpm_workflow";
		}
		echo "<br />".$strErrorMessage."";
	}
	elseif ($skip_workflow===true)
	{
		echo "<br /><b>Process: '".$workflowid."' already exists and so import has been skipped. </b>";
	}
	else
	{
		$updatedid = $arrStageIDCoversion[$workflowfirststageid]['new_stage_id']; 
		
		//-- SG 21/09/2012 
		// If the process being imported doesn't include an appcode, write the current session appcode
		// to the workflow record, for 3.4.10+ filtering
		if($setAppCode == true)
		{
			$update = "Update bpm_workflow set fk_firststage_id = ". $updatedid  ." where pk_workflow_id = '".$workflowid ."'";
		}
		else{
			$update = "Update bpm_workflow set fk_firststage_id = ". $updatedid  .", appcode = '". $currAppCode . "' where pk_workflow_id = '".$workflowid ."'";
			$appcodeMessage = "Note: This imported process previously had no data dictionary affiliation, but is now associated with the current application (<b>".$currAppCode."</b>).";
		}
		$con->Query($update);

		echo "<br /><b>Process: '".$workflowid."' imported successfully. </b>".$appcodeMessage;

		if ($ext_table!="" || $ext_form!="")
		{
			echo "<p>Remember to take a copy of the following:"; 
			if ($ext_table!="") echo "<br /> Extended table : ".$ext_table;
			if ($ext_form!="") echo "<br /> Extended form : ".$ext_form;
			echo "</p>";
		}
	}
}

echo "<p>Import Complete</p>";
?>