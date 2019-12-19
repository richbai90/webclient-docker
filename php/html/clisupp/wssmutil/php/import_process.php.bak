<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');

include('helpers/helpers.php');

//-- check if key matches
if(!check_secure_key('wssmutil_import_key'))
{
	//-- set uploading to zero (determines if action is being taken)
	echo "Authentication failure. The action to import was not performed.";
	unset($_SESSION['wssmutil_import_key']);
	exit;
}
unset($_SESSION['wssmutil_import_key']);


	$con = new CSwDbConnection;
	if(!$con->Connect(swdsn(),swuid(),swpwd()))
	{
		echo "Failed to connect to database, please check ODBC connection";
		exit;
	}
	
$arrWorkflow = gv('filenames');
$currAppCode = strtoupper(gv('dataset'));
if(count($arrWorkflow)<1)
{
	echo "<br /><b>No Process selected </b>";
	exit;
}


function collect_IDs($table, $xml_tag, $skip_fields, &$arrIDs)
{
	//$skip_fields[0] should contain the ID to monitor!
	global $xmlDoc, $con;
	
	$stages = $xmlDoc->get_elements_by_tagname($xml_tag);
	foreach ($stages as $stage){
		$insert_fields = array();
		$insert_values = array();
		$this_ID = 0;
		foreach ($stage->child_nodes() as $child){
			$field_name = $child->tagname;
			if ($field_name=="#text")
			{
				
			}
			else
			{
				if (in_array($field_name, $skip_fields)){
					if ($field_name == $skip_fields[0]){
						$this_ID = $child->get_content();
					}
				} elseif (''!=$field_name) {
					$insert_fields[] = $field_name;
					$insert_values[] = str_replace("'", "''", $child->get_content());
				}
			}
		}
		
		if (count($insert_fields) > 0){
			$insert = "insert into $table (".implode(',',$insert_fields).") values ('".implode("','", $insert_values)."')";
			//echo $insert . " -- <br />";
			//exit;
			if($con->Query($insert))
			{
				//GET INSERT ID
				$query = "select max(".$skip_fields[0].") as id from ". $table;
				//echo $query . " -- <br />";
				if($con->Query($query))
				{
					if($con->Fetch("progress"))
					{
						$arrIDs[$this_ID] = $GLOBALS['progress_id'];
					}
				}
			}
		}
	}
	
}


function insert_leaves($table, $xml_tag, $skip_fields, $stage_fields, $question_fields)
{
	global $xmlDoc, $con, $stageIDs, $questionIDs;
	
	$stages = $xmlDoc->get_elements_by_tagname($xml_tag);
	
	foreach ($stages as $stage)
	{
		$insert_fields = array();
		$insert_values = array();
		foreach ($stage->child_nodes() as $child)
		{
			$field_name = $child->tagname;
			if ($field_name == "#text")
			{
				
			}
			else
			{
				if (in_array($field_name, $skip_fields))
				{
				}
				elseif (in_array($field_name, $stage_fields))
				{
					$insert_fields[] = $field_name;
					$val = $child->get_content();
					if (isset($stageIDs[$val]))
					{
						$insert_values[] = $stageIDs[$val];
					} else
					{
						$insert_values[] = $val;
					}
				}
				elseif (in_array($field_name, $question_fields))
				{
					$insert_fields[] = $field_name;
					$val = $child->get_content();
					if (isset($questionIDs[$val]))
					{
						$insert_values[] = $questionIDs[$val];
					}
					else
					{
						$insert_values[] = $val;
					}
				}
				elseif (''!=$field_name)
				{
					$insert_fields[] = $field_name;
					$insert_values[] = str_replace("'", "''", $child->get_content());
				}
			}
		}
		
		if (count($insert_fields) > 0)
		{
			$insert = "insert into $table (".implode(',',$insert_fields).") values ('".implode("','", $insert_values)."')";
			//echo "<br>" . $insert . " -- <br />";
			if($con->Query($insert))
			{
			}
		}
	}
	
}


function fix_leaves($table, $xml_tag, $skip_fields, $stage_fields, $question_fields, &$newIDs, $set_vals = array())
{
	global $xmlDoc, $con, $stageIDs, $questionIDs;
	
	$stages = $xmlDoc->get_elements_by_tagname($xml_tag);
		
	foreach ($stages as $stage)
	{
		$updateSQL = array();
		$oldID = 0;
		foreach ($stage->child_nodes() as $child)
		{
			$field_name = $child->tagname;
			if (in_array($field_name, $skip_fields))
			{
				if ($field_name == $skip_fields[0])
				{
					$oldID = $child->get_content();
				}
			}
			elseif (in_array($field_name, $stage_fields))
			{
				$val = $child->get_content();
				if (isset($stageIDs[$val]))
				{
					$updateSQL[] = $field_name . ' = ' . $stageIDs[$val];
				}
			}
			elseif (in_array($field_name, $question_fields))
			{
				$val = $child->get_content();
				if (isset($questionIDs[$val]))
				{
					$updateSQL[] = $field_name . ' = ' . $questionIDs[$val];
				}
			}
		}
		
		foreach ($set_vals as $field => $value)
		{
			$updateSQL[] = $field. " = '" . str_replace("'", "''", $value) . "'";
		}
		if (count($updateSQL) > 0 && $oldID !== 0 && $oldID != '' && isset($newIDs[$oldID]) && isset($skip_fields[0]) && '' != $skip_fields[0])
		{
			$update = "update $table set ".implode(',',$updateSQL)." WHERE " . $skip_fields[0] . " = '" . $newIDs[$oldID] . "'";
			//echo $update . " -- <br />";
			//exit;
			if($con->Query($update))
			{
			}
		}
	}
	
}

$processed_workflows = array();

for ($w=0;$w<count($arrWorkflow);$w++)
{
	$appcodeMessage = "";
	$strErrorMessage = "";
	$workflow_name = $arrWorkflow[$w];
	$workflow_name = str_replace("%20", " ", $workflow_name);  //still : don't ask

	//intialise array
	$Fields_Array = array();

	$strFileName = $_SESSION['strDirectory'].$workflow_name.".xml";
	//echo $strFileName;
	//exit;
	$xmlfile = file_get_contents($strFileName);

	$stopProcessing = false;

	$xmlDoc = domxml_open_mem($xmlfile);
	if($xmlDoc)
	{
		// check for existing wizards
		$individualWizards = $xmlDoc->get_elements_by_tagname('wizard');
		foreach ($individualWizards as $wiz)
		{
			$names = $wiz->get_elements_by_tagname('pk_name');
			foreach ($names as $name)
			{
				$x = $name->get_content();
				$check = "select count(*) as cnt from wssm_wiz where pk_name = '" . str_replace("'", "''", $x) . "'";
				if($con->Query($check))
				{
					if($con->Fetch('chk'))
					{
						if ($GLOBALS['chk_cnt'] > 0)
						{
							$strErrorMessage .= "<br /><b>Process: '" . $x . "' already exists and so import has been skipped. </b>";
							$stopProcessing = true;
						}
						else
						{
							$processed_workflows[$x] = str_replace("'", "''",$x); //might as well do it now
						}
					}
					else
					{
						$strErrorMessage .= "Unable to fetch info";
						$stopProcessing = true;
					}
				}
				else
				{
					$strErrorMessage .= "Unable to check existence";
					$stopProcessing = true;
				}

			}
		}
	
		if (!$stopProcessing)
		{

			$stageIDs = array();
			$questionIDs = array();
			//GET relevant IDs
			//Stage IDs
			$skip_fields = array('pk_auto_id','questions');
			collect_IDs("wssm_wiz_stage", "stage", $skip_fields, $stageIDs);
			//Question IDs
			$skip_fields = array('pk_qid','fk_nextq','fk_nextstage','choices','jumps');
			collect_IDs("wssm_wiz_q", "question", $skip_fields, $questionIDs);
			//print_r($stageIDs);
			//print_r($questionIDs);
			
			insert_leaves('wssm_wiz_qc', 'choice', array('pk_qcid'), array('fk_nextstage'), array('fk_nextq','fk_qid'));
			insert_leaves('wssm_wiz_qac', 'jump', array('pk_auto_id'), array('fk_nextstage'), array('fk_nextq','fk_qid'));
			insert_leaves('wssm_wiz', 'wizard', array('stages'), array(), array());
			fix_leaves("wssm_wiz_q", "question", array('pk_qid'), array('fk_nextstage','fk_wiz_stage'), array('fk_nextq'), $questionIDs);

			$appcodeMessage = '';
			if($_SESSION['bAppcodeSeparatedSystem'])
			{
				fix_leaves("wssm_wiz", "wizard", array('pk_name'), array(), array(), $processed_workflows, array('appcode' => $currAppCode));
				$appcodeMessage = "<br />Note: This imported process previously had no data dictionary affiliation, but is now associated with the current application (<b>".$currAppCode."</b>).";
			}
			echo "<br /><b>Wizard".(count($processed_workflows) > 1?'s':'').": <em>".implode(',', $processed_workflows)."</em> imported successfully. </b>".$appcodeMessage;
		}
		else
		{
			break;
		}
	}
	else
	{
		$strErrorMessage = "The file '".$workflow_name.".xml' is not correctly formatted xml.";
	}

}
if ('' != $strErrorMessage)
{
	echo $strErrorMessage;
}
else
{
	echo "<p>Import Complete</p>";
}
