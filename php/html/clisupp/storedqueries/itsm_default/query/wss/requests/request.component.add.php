<?php
	IncludeApplicationPhpFile("itsm.helpers.php");

	$strInstanceID = $session->analystId;
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$intCustWebflag = $session->selfServiceWebFlags;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$intCallref = trim($_POST['callref']);
	$intComponentID = trim($_POST['compid']);

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to update requests
	if((OPTION_CAN_LOG_CALLS & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have access to log requests!");
		exit(0);
	}

	if(	!_validate_url_param($intCallref,"num") ||
			!_validate_url_param($intComponentID,"num")){
	  echo generateCustomErrorString("-303","Failed to process Call Diary query. SQL Injection Detected. Please contact your Administrator.");
	  exit(0);
	}


	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId) {
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer in database. Please contact your Administrator.");
      exit(0);
    }
	}
	//Get Service Details
	$strSQL = "	SELECT service_id, description, apply_type, units, price, total_cost_for_item, fk_key, gl_code
							FROM SC_RELS
							WHERE pk_auto_id = ".$intComponentID;
	$compRS = get_recordset($strSQL, 'swdata');
	if ($compRS->Fetch()) {
		$compName = get_field($compRS,'service_id');
		$compDescription = get_field($compRS,'description');
		$compType = get_field($compRS,'apply_type');
		$compQty = get_field($compRS,'units');
		$compPrice = get_field($compRS,'price');
		$compCost = get_field($compRS,'total_cost_for_item');
		$compGLCode = get_field($compRS,'gl_code');
	} else {
		throwSuccess();
	}

	//Insert record into request_comp
	$strBaseInsert = "INSERT INTO request_comp (fk_callref,fk_comp_id,name,type,description,qty,comp_price,comp_cost,gl_code) VALUES (";
	$strInsert = $strBaseInsert .$intCallref.",".$intComponentID.",'".prepareForSql($compName)."','".prepareForSql($compType)."','".PrepareForSql($compDescription)."','".$compQty."','".$compPrice."','".$compCost."','".PrepareForSql($compGLCode)."')";
	$oRS = new SqlQuery();
  $oRS->Query($strInsert);
  //-- Check for query Error
  if($oRS->result==false)
  {
   echo generateCustomErrorString("-303","Failed to insert Request Component record.");
   exit(0);
  }
/*
	$strUpdateMessage = "Associated Component [".$compName."] during the raising of this request.";
	//Update request diary to show who/when record was added
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("callref",$intCallref);
	$xmlmc->SetParam("timeSpent","1");
	$xmlmc->SetParam("description",$strUpdateMessage);
	$xmlmc->SetParam("updateSource","Customer (".$strWssCustId.")");
	$xmlmc->SetParam("updateCode","Request Component");
	if(!$xmlmc->invoke("selfservice","customerUpdateCall"))
	{
		throwSuccess();
	}*/
	throwSuccess();
