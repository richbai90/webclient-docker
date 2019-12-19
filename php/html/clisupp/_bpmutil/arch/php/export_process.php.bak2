<?php 

include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');

$prefix = 'bpmutil_export_';
//-- check if key matches
if(!check_secure_key($prefix.'key'))
{
	//-- set uploading to zero (determines if action is being taken)
	echo "Authentication failure. The action to export was not performed.";
	unset($_SESSION[$prefix.'key']);
	exit;
}	

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$swdsn =$_SESSION['dsn'];
$swuid =$_SESSION['un'];
$swpwd =$_SESSION['pw'];
unset($_SESSION['dsn']);
unset($_SESSION['un']);
unset($_SESSION['pw']);
//Create connection
$con = new CSwDbConnection;
if(!$con->Connect($swdsn,$swuid,$swpwd))
{
	echo "Failed to connect to database, please check ODBC connection";
	exit;
}

$db_type = get_database_type_bespoke($swdsn, $swuid, $swpwd);

if (count($_POST['process'])>0)
{
	$tablefields = new CSwDbConnection;
	if(!$tablefields->Connect($swdsn,$swuid,$swpwd))
	{
		echo "Failed to connect to database, please check ODBC connection";
		exit;
	}

	$subQuery = new CSwDbConnection;
	if(!$subQuery->Connect($swdsn,$swuid,$swpwd))
	{
		echo "Failed to connect to database, please check ODBC connection";
		exit;
	}

	$stageQuery = new CSwDbConnection;
	if(!$stageQuery->Connect($swdsn,$swuid,$swpwd))
	{
		echo "Failed to connect to database, please check ODBC connection";
		exit;
	}

    $arrWorkflow = $_POST['process'];

	for ($w=0;$w<count($arrWorkflow);$w++)
	{
		//$strCurrentAppcode = $GLOBALS['dd'];
		$strCurrentAppcode = $GLOBALS['dataset'];
		$workflow_name =  $arrWorkflow[$w];
		$workflow_name = str_replace("%20", " ", $workflow_name);

		// create a new XML document
		$doc = domxml_new_doc('1.0');

		//BPM workflows
		$BPMworkflows = "SELECT * FROM bpm_workflow where pk_workflow_id = '".$workflow_name."'";
		
		// create root node
		$root = $doc->create_element('workflow');
		$root = $doc->append_child($root);

		if($con->Query($BPMworkflows))
		{
			while($con->Fetch("workflows"))	
			{
				//Current workflow
				$currentworkflow =  $workflows_pk_workflow_id;
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_workflow');

				//Workflow fields
				//$bpm_workflows_fields = "DESC bpm_workflow";
				$bpm_workflows_fields = get_table_fields("bpm_workflow",$db_type);
				if($tablefields->Query($bpm_workflows_fields))
				{
					$i=0;
					while($tablefields->Fetch("workflowfields"))	
					{
						$arrWorkflows[$i]['fields'] =   pfx($workflowfields_field);
						$arrWorkflows[$i]['value'] =   ${'workflows_'. pfx($workflowfields_field)};
						if($arrWorkflows[$i]['fields']=="appcode")
							$strCurrentAppcode = $arrWorkflows[$i]['value'];
						$i++;
					}
				}
						
				//workflow field values
				$workflowID = $doc->create_element('Record');
				$workflowID = $workflow->append_child($workflowID);
				
				for ($x=0;$x<count($arrWorkflows);$x++)
				{
					$workflowfield = $doc->create_element($arrWorkflows[$x]['fields']);
					$workflowfield = $workflowID->append_child($workflowfield);
					$workflowfield = $workflowfield->append_child($doc->create_text_node(utf8_decode($arrWorkflows[$x]['value'])));
				}

				//Current workflow progress values
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_progress');

				$bpm_progress = "SELECT * FROM bpm_progress WHERE fk_workflow_id = '".$currentworkflow."' ORDER BY pindex";		
				if($subQuery->Query($bpm_progress))
				{
					while($subQuery->Fetch("progress"))
					{
						$progressID = $doc->create_element('Record');
						$progressID = $workflow->append_child($progressID);
				
						//Progress fields
						//$bpm_progress_fields = "DESC bpm_progress";
						//$bpm_progress_fields = "select name from syscolumns where id in (select id from sysobjects where name ='bpm_progress')";
						$bpm_progress_fields = get_table_fields("bpm_progress",$db_type);
						if($tablefields->Query($bpm_progress_fields))
						{
							$i=0;
							while($tablefields->Fetch("progressfields"))	
							{
								$arrProgress[$i]['fields'] =   pfx($progressfields_field);
								$arrProgress[$i]['value'] = ${'progress_'. pfx($progressfields_field)};
								$i++;
							}
						}
						
						for ($x=0;$x<count($arrProgress);$x++)
						{
								$progressField = $doc->create_element($arrProgress[$x]['fields']);
								$progressField = $progressID->append_child($progressField);
								$progressField = $progressField->append_child($doc->create_text_node(utf8_decode($arrProgress[$x]['value'])));
						}
					}

				}
				
				//Current workflow stages
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_stage');

				$bpm_stage = "SELECT * FROM bpm_stage WHERE fk_workflow_id = '".$currentworkflow."' ORDER BY seq";		
				if($subQuery->Query($bpm_stage))
				{
					$p=0;
					while($subQuery->Fetch("stage"))
					{
						//Current Stage
						$currentstage = $stage_pk_stage_id;
						
						$arrStageIDs[$p]=$currentstage;

						$stageID = $doc->create_element('Record');
						$stageID = $workflow->append_child($stageID);
				
						//Stage fields
						//$bpm_stage_fields = "DESC bpm_stage";
						//$bpm_stage_fields = "select name from syscolumns where id in (select id from sysobjects where name ='bpm_stage')";
						$bpm_stage_fields  = get_table_fields("bpm_stage",$db_type);
						if($tablefields->Query($bpm_stage_fields))
						{
							$i=0;
							while($tablefields->Fetch("stagefields"))	
							{
								$arrStage[$i]['fields'] = pfx($stagefields_field);
								$arrStage[$i]['value'] =  ${'stage_'.pfx($stagefields_field)};
								$i++;
							}
						}
						
						for ($x=0;$x<count($arrStage);$x++)
						{
							$StageField = $doc->create_element($arrStage[$x]['fields']);
							$StageField = $stageID->append_child($StageField);
							$StageField = $StageField->append_child($doc->create_text_node(utf8_decode($arrStage[$x]['value'])));
						}
						
						$p++;
					}
				}

				//Current workflow ctrl fields
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_ctrl_fields');

				$bpm_ctrl_fields = "SELECT * FROM bpm_ctrl_fields WHERE fk_workflow_id = '".$currentworkflow."'";
				if($stageQuery->Query($bpm_ctrl_fields))
				{
					while($stageQuery->Fetch("ctrl"))
					{
						$stageCtrlID = $doc->create_element('Record');
						$stageCtrlID = $workflow->append_child($stageCtrlID);

						//Control Fields
						$bpm_ctrl_fields = get_table_fields("bpm_ctrl_fields",$db_type);
						if($tablefields->Query($bpm_ctrl_fields))
						{
							$i=0;
							while($tablefields->Fetch("ctrlfields"))	
							{
								$arrCtrl[$i]['fields'] =  pfx($ctrlfields_field);
								$arrCtrl[$i]['value'] = ${'ctrl_'.pfx($ctrlfields_field)};
								$i++;
							}
						}
						for ($x=0;$x<count($arrCtrl);$x++)
						{
								$CtrlField = $doc->create_element($arrCtrl[$x]['fields']);
								$CtrlField = $stageCtrlID->append_child($CtrlField);
								$CtrlField = $CtrlField->append_child($doc->create_text_node(utf8_decode($arrCtrl[$x]['value'])));
						}
					}
				}					
				
				//-- F0105031
				//Current workflow audit fields
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_audit_fields');

				$bpm_audit_fields = "SELECT * FROM bpm_audit_fields WHERE fk_workflow_id = '".$currentworkflow."'";
				if($stageQuery->Query($bpm_audit_fields))
				{
					while($stageQuery->Fetch("audit"))
					{
						$stageAuditID = $doc->create_element('Record');
						$stageAuditID = $workflow->append_child($stageAuditID);

						//Control Fields
						$bpm_audit_fields = get_table_fields("bpm_audit_fields",$db_type);
						if($tablefields->Query($bpm_audit_fields))
						{
							$i=0;
							while($tablefields->Fetch("auditfields"))	
							{
								$arrAudit[$i]['fields'] =  pfx($auditfields_field);
								$arrAudit[$i]['value'] = ${'audit_'.pfx($auditfields_field)};
								$i++;
							}
						}
						for ($x=0;$x<count($arrAudit);$x++)
						{
								$AuditField = $doc->create_element($arrAudit[$x]['fields']);
								$AuditField = $stageAuditID->append_child($AuditField);
								$AuditField = $AuditField->append_child($doc->create_text_node(utf8_decode($arrAudit[$x]['value'])));
						}
					}
				}					
				//-- EOF F0105031

				//Current Stage Authentication - bpm_stage_auth
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_stage_auth');

				for($p=0;$p<count($arrStageIDs);$p++)
				{
					$bpm_stage_auth = "SELECT * FROM bpm_stage_auth WHERE fk_workflow_id = '".$currentworkflow."' AND fk_stage_id = '".$arrStageIDs[$p]."'";
					if($stageQuery->Query($bpm_stage_auth))
					{
						while($stageQuery->Fetch("stageauth"))
						{
							$stageAuthID = $doc->create_element('Record');
							$stageAuthID = $workflow->append_child($stageAuthID);

							//Stage Auth Fields
							//$bpm_stageauth_fields = "DESC bpm_stage_auth";
							//$bpm_stageauth_fields = "select name from syscolumns where id in (select id from sysobjects where name ='bpm_stage_auth')";
							$bpm_stageauth_fields = get_table_fields("bpm_stage_auth",$db_type);
							if($tablefields->Query($bpm_stageauth_fields))
							{
								$i=0;
								while($tablefields->Fetch("stageauthfields"))	
								{
									$arrStageAuth[$i]['fields'] =  pfx($stageauthfields_field);
									$arrStageAuth[$i]['value'] =  ${'stageauth_'.utf8_decode(pfx($stageauthfields_field))};
									$i++;
								}
							}
							
							for ($x=0;$x<count($arrStageAuth);$x++)
							{
								$StageAuthField = $doc->create_element($arrStageAuth[$x]['fields']);
								$StageAuthField = $stageAuthID->append_child($StageAuthField);
								$StageAuthField = $StageAuthField->append_child($doc->create_text_node(utf8_decode($arrStageAuth[$x]['value'])));
							}
						}
					}
				}
						
				//Current Stage Task - bpm_stage_task
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_stage_task');

				for ($p=0;$p<count($arrStageIDs);$p++)
				{
					$bpm_stage_task = "SELECT * FROM bpm_stage_task WHERE fk_workflow_id = '".$currentworkflow."' AND fk_stage_id = '".$arrStageIDs[$p]."' ORDER BY seq";
					if($stageQuery->Query($bpm_stage_task))
					{
						while($stageQuery->Fetch("stagetask"))
						{
							$stageTaskID = $doc->create_element('Record');
							$stageTaskID = $workflow->append_child($stageTaskID);

							//Stage Task Fields
							//$bpm_stagetask_fields = "DESC bpm_stage_task";
							//$bpm_stagetask_fields = "select name from syscolumns where id in (select id from sysobjects where name ='bpm_stage_task')";
							$bpm_stagetask_fields = get_table_fields("bpm_stage_task",$db_type);
							if($tablefields->Query($bpm_stagetask_fields))
							{
								$i=0;
								while($tablefields->Fetch("stagetaskfields"))	
								{
									$arrStageTask[$i]['fields'] =  pfx($stagetaskfields_field);
									$arrStageTask[$i]['value'] =  ${'stagetask_'.pfx($stagetaskfields_field)};
									$i++;
								}
							}
							
							for ($x=0;$x<count($arrStageTask);$x++)
							{
								$StageTaskField = $doc->create_element($arrStageTask[$x]['fields']);
								$StageTaskField = $stageTaskID->append_child($StageTaskField);
								$StageTaskField = $StageTaskField->append_child($doc->create_text_node(utf8_decode($arrStageTask[$x]['value'])));
							}
						}
					}
				}

				//Current Stage Status - bpm_stage_sts
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute("table", 'bpm_stage_sts');
				
				for ($p=0;$p<count($arrStageIDs);$p++)
				{
					$bpm_stage_sts = "SELECT * FROM bpm_stage_sts WHERE fk_workflow_id = '".$currentworkflow."' AND fk_stage_id = '".$arrStageIDs[$p]."'";
					if($stageQuery->Query($bpm_stage_sts))
					{
						while($stageQuery->Fetch("stagests"))
						{
							$stageStsID = $doc->create_element('Record');
							$stageStsID = $workflow->append_child($stageStsID);

							//Stage Task Fields
							//$bpm_stagests_fields = "DESC bpm_stage_sts";
							//$bpm_stagests_fields = "select name from syscolumns where id in (select id from sysobjects where name ='bpm_stage_sts')";
							$bpm_stagests_fields = get_table_fields("bpm_stage_sts",$db_type);
							if($tablefields->Query($bpm_stagests_fields))
							{
								$i=0;
								while($tablefields->Fetch("stagestsfields"))	
								{
									$arrStageSts[$i]['fields'] =  pfx($stagestsfields_field);
									$arrStageSts[$i]['value'] = ${'stagests_'.pfx($stagestsfields_field)};
									$i++;
								}
							}
							
							for ($x=0;$x<count($arrStageSts);$x++)
							{
									$StageStsField = $doc->create_element($arrStageSts[$x]['fields']);
									$StageStsField = $stageStsID->append_child($StageStsField);
									$StageStsField = $StageStsField->append_child($doc->create_text_node(utf8_decode($arrStageSts[$x]['value'])));
							}
						}
					}
				}	
						
				//Current Stage Conditions - bpm_cond
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute('table','bpm_cond');

				for ($p=0;$p<count($arrStageIDs);$p++)
				{
					$bpm_cond = "SELECT * FROM bpm_cond WHERE fk_workflow_id = '".$currentworkflow."' AND fk_stage_id = '".$arrStageIDs[$p]."'";
					if($stageQuery->Query($bpm_cond))
					{
						while($stageQuery->Fetch("stagecond"))
						{
							$stageCondID = $doc->create_element('Record');
							$stageCondID = $workflow->append_child($stageCondID);

							//Stage Task Fields
							//$bpm_cond_fields = "DESC bpm_cond";
							//$bpm_cond_fields = "select name from syscolumns where id in (select id from sysobjects where name ='bpm_cond')";
							$bpm_cond_fields = get_table_fields("bpm_cond",$db_type);
							if($tablefields->Query($bpm_cond_fields))
							{
								$i=0;
								while($tablefields->Fetch("stagecondfields"))	
								{
									$arrStageCond[$i]['fields'] =  pfx($stagecondfields_field);
									$arrStageCond[$i]['value'] =  ${'stagecond_'.pfx($stagecondfields_field)};
									$i++;
								}
							}
							
							for ($x=0;$x<count($arrStageCond);$x++)
							{
								$StageCondField = $doc->create_element($arrStageCond[$x]['fields']);
								$StageCondField = $stageCondID->append_child($StageCondField);
								$StageCondField = $StageCondField->append_child($doc->create_text_node(utf8_decode($arrStageCond[$x]['value'])));
									
							}
						}
					}
				}
				
				//Current Stage Condition VPME - bpm_cond_vpme
				$workflow = $doc->create_element('Recordset');
				$workflow = $root->append_child($workflow);
				$workflow->set_attribute('table','bpm_cond_vpme');
				
				for ($p=0;$p<count($arrStageIDs);$p++)
				{
					$bpm_cond_vpme = "SELECT * FROM bpm_cond_vpme WHERE fk_workflow_id = '".$currentworkflow."' AND fk_stage_id = '".$arrStageIDs[$p]."'";
					
					if($stageQuery->Query($bpm_cond_vpme))
					{
						while($stageQuery->Fetch("stagecondvpme"))
						{
							$stageCondVPMEID = $doc->create_element('Record');
							$stageCondVPMEID = $workflow->append_child($stageCondVPMEID);

							$bpm_cond_vpme_fields = get_table_fields("bpm_cond_vpme",$db_type);
							if($tablefields->Query($bpm_cond_vpme_fields))
							{
								$i=0;
								while($tablefields->Fetch("stagecondvpmefields"))	
								{
									$arrStageCondVPME[$i]['fields'] =  pfx($stagecondvpmefields_field);
									$arrStageCondVPME[$i]['value'] =  ${'stagecondvpme_'.pfx($stagecondvpmefields_field)};
									$i++;
								}
							}
							
							for ($x=0;$x<count($arrStageCondVPME);$x++)
							{
									$StageCondVPMEField = $doc->create_element($arrStageCondVPME[$x]['fields']);
									$StageCondVPMEField = $stageCondVPMEID->append_child($StageCondVPMEField);
									$StageCondVPMEField = $StageCondVPMEField->append_child($doc->create_text_node(utf8_decode($arrStageCondVPME[$x]['value'])));
							}
						}
					}
				}
			}
		}

		$xml_string = $doc->dump_mem(true);


		$arrChars = array('/','\\','?','%','*',':','|','"','<','>','.');
		$FileName = str_replace($arrChars, "_", $workflow_name).".xml";
		$strCurrentAppcode = str_replace($arrChars, "_", $strCurrentAppcode);
		//--Get Workign directory from session varaibles
		$workingdir = $_SESSION['strDirectory'];
		if (!is_dir($workingdir.$strCurrentAppcode)) {
			mkdir($workingdir.$strCurrentAppcode);
		}
		//echo $workingdir.$strCurrentAppcode.'/'.$FileName;
		$fh = fopen($workingdir.$strCurrentAppcode.'/'.$FileName, 'w') or die("can't open file");
		fwrite($fh, $xml_string);
		fclose($fh);
	} 
?>

	<html>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
	<link href="../css/elements.css" rel="stylesheet" type="text/css" />
	<body style="background-color:#ffffff;overflow:hidden;">
<?php
	echo "<p> Export Complete. The following file(s) have been created:";
	for ($w=0;$w<count($arrWorkflow);$w++)
	{
		$workflow_name = $arrWorkflow[$w];
		$workflow_name = str_replace("%20", " ", $workflow_name);
		$arrChars = array('/','\\','?','%','*',':','|','"','<','>','.');
		$FileName = str_replace($arrChars, "_", $workflow_name).".xml";
		echo '<br>'.$FileName;
	}
	echo "<p>The file(s) are located in ".$workingdir.$strCurrentAppcode."'.";
}
else
{
	echo "<p> No process has been selected.";
}
?>