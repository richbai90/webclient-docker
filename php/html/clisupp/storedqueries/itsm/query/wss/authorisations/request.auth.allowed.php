<?php

  $strCustId = strtolower(trim($session->selfServiceCustomerId));
  $strWssCustId = strtolower(trim($_POST['custid']));
  $intCallref = $_POST['callref'];
  $strInstanceID = $session->analystId;

  if( !_validate_url_param($strWssCustId,"sqlparamstrict") ||
      !_validate_url_param($strInstanceID,"sqlparamstrict") ||
      !_validate_url_param($intCallref,"num")){
    $strCustomError = "Failed to process Call Details query. SQL Injection Detected. Please contact your Administrator.";
    echo generateCustomErrorString("-303",$strCustomError);
    exit(0);
  }

  IncludeApplicationPhpFile("itsm.helpers.php");

  if($strWssCustId != $strCustId) {
    $strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
      exit(0);
    }
  }

  //Get Manager ID
  $strManagerId = wssGetManagerid($strWssCustId);

  $sqlDatabase = "swdata";
  
  $sqlCommand = " SELECT '".PrepareForSQL($strManagerId)."' AS managerid,
                  bpm_stage.title,
                  bpm_stage.description,
                  opencall.request_comp_price,
                  opencall.request_sla_price,
                  opencall.request_price
                  FROM opencall, bpm_oc_auth, bpm_stage
                  WHERE callref = fk_callref
                  AND bpm_stage.pk_stage_id = opencall.bpm_stage_id
                  AND opencall.status < 15
                  AND opencall.bpm_stage_id = bpm_oc_auth.fk_stage_id
                  AND bpm_waitingauth = 1
                  AND callref = ".PrepareForSql($intCallref)."
                  AND bpm_oc_auth.status = 'Pending authorisation'
                  AND fk_auth_id = '".PrepareForSql($strWssCustId)."'";
