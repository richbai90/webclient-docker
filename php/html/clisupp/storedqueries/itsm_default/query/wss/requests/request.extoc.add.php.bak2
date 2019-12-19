<?php
	IncludeApplicationPhpFile("itsm.helpers.php");

	$strInstanceID = $session->analystId;
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$intCustWebflag = $session->selfServiceWebFlags;
	$strExtocTable = strtolower(trim($_POST['table']));
	$intCallref = trim($_POST['callref']);

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to update requests
	if((OPTION_CAN_LOG_CALLS & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have access to log requests!");
		exit(0);
	}

	if(	!_validate_url_param($intCallref,"num") ){
	  echo generateCustomErrorString("-303","Failed to process Call Diary query. SQL Injection Detected. Please contact your Administrator.");
	  exit(0);
	}


	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer in database. Please contact your Administrator.");
      exit(0);
    }
	
	//Get Service Details
	$strSQL = "	INSERT INTO ".$strExtocTable." (opencall) VALUES (".$intCallref.") ";
	$compRS = SqlExecute('swdata',$strSQL);

	$strCommand = "UPDATE " . $strExtocTable . " SET ";
	$i = 0;
	foreach ($_POST as $key => $value){
		if (substr($key,0,5) == '_swc_' && trim($value) != '' && substr($key,5) != ''){
			
			$strCommand .= (($i==0)?'':', ') . substr($key,5) . " = '" . prepareForSql($value) . "'";
			$i++;
			
		}
	}
	$strCommand .= " WHERE opencall = " . $intCallref;
	
	if (0 == $i)
	{
	   echo generateCustomErrorString("-303","No ExtOC values to Insert.");
	   exit(0);
	}
	$compRS = SqlExecute('swdata',$strCommand);
	throwSuccess($compRS);