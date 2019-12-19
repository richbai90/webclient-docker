<?php

  $strCustId = strtolower(trim($session->selfServiceCustomerId));
  $strWssCustId = strtolower(trim($_POST['custid']));
  $strInstanceID = $session->analystId;

  if( !_validate_url_param($strWssCustId,"sqlparamstrict")){
    $strCustomError = "Failed to process Call Details query. SQL Injection Detected. Please contact your Administrator.";
    echo generateCustomErrorString("-303",$strCustomError);
    exit(0);
  }

  if($strWssCustId != $strCustId) {
    IncludeApplicationPhpFile("itsm.helpers.php");
    $strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
      exit(0);
    }
  }

  $strFilter = " AND opencall.appcode in (".$_core['_sessioninfo']->datasetFilterList.")";

  $sqlDatabase = "swdata";

  $sqlCommand = " SELECT COUNT(*) AS counter FROM
				  (
					  SELECT DISTINCT fk_callref,fk_stage_id
						
						
					  from opencall, bpm_oc_auth
					  where callref = fk_callref
					  and opencall.status < 15
					  and opencall.bpm_stage_id = bpm_oc_auth.fk_stage_id
					  and bpm_waitingauth=1
					  AND bpm_oc_auth.authortype NOT IN ('Analyst') AND flg_status=0              
					  AND '".PrepareForSql($strWssCustId)."' = fk_auth_id" . $strFilter
				.") AS auths";
				  
				  