<?php

  $strCustId = strtolower(trim($session->selfServiceCustomerId));
  $intCustWebflag = $session->selfServiceWebFlags;
  $strWssCustId = strtolower(trim($_POST['custid']));
  $strCustAnalystId = isset($_POST['aid']) ? strtolower(trim($_POST['aid'])) : "";
  $strInstanceID = $session->analystId;

  if(!isset($_POST['callref']) ||$_POST['callref']==="") {
		throwSuccess();
	}

  $intCallref = $_POST['callref'];
  if(!_validate_url_param($intCallref,"num") || !_validate_url_param($strWssCustId,"sqlparamstrict")){
    echo generateCustomErrorString("-303","Failed to process Call Details query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
  }

  //Check if customer is allowed to view this request
  IncludeApplicationPhpFile("itsm.helpers.php");
  $canSeeCall = wssRequestAccess($strInstanceID, $strCustId, $strWssCustId, $intCallref, $intCustWebflag, $strCustAnalystId);
  if($canSeeCall != "") {
    echo generateCustomErrorString("-303","Request Verification Error: ".$canSeeCall);
    exit(0);
  }

  $sqlDatabase = "swdata";
  $sqlCommand = "SELECT oc.*, ag.groupname, udb.attrib1, udb.attrib2, udb.firstname, udb.surname FROM opencall oc left join cstm_rel_opencall_archgroups ag on oc.callref = ag.callref left join userdb udb on oc.cust_id = udb.keysearch WHERE oc.callref = ".$intCallref;
