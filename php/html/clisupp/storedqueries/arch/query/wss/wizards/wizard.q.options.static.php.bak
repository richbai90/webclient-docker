<?php

  if(!isset($_POST['qid']) || $_POST['qid']==="") {
		throwSuccess();
	}

  $intQid = $_POST['qid'];

  if( !_validate_url_param($intQid,"num") ){
    echo generateCustomErrorString("-303","Failed to process Wizard Static Question query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
  }

  $strQuery = "SELECT cvalue AS keycol, ctext AS discol FROM wssm_wiz_qc WHERE fk_qid = ".$intQid." ORDER BY cindex";

  $sqlDatabase = "swdata";
  $sqlCommand =  $strQuery;
