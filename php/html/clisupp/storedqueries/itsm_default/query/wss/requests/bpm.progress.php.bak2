<?php

  if(!isset($_POST['workflow']) ||$_POST['workflow']==="") {
		throwSuccess();
	}

  $strWorkflow = $_POST['workflow'];
  if(!_validate_url_param($strWorkflow,"sqlparamstrict")){
    echo generateCustomErrorString("-303","Failed to process BPM Progression query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
  }

  $sqlDatabase = "swdata";
  $sqlCommand = "SELECT * FROM bpm_progress WHERE fk_workflow_id = '".PrepareForSql($strWorkflow)."' ORDER BY pindex ASC";
