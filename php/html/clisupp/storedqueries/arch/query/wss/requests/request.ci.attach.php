<?php
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to update requests
	if((OPTION_CAN_UPDATE_CALLS & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have access to update requests!");
		exit(0);
	}

	$intCallRef = $_POST['callref'];
	$strCallClass = $_POST['callclass'];
	$strCIs = $_POST['ciids'];

	if(	!_validate_url_param($intCallRef,"num") ||
			!_validate_url_param($strCallClass,"sqlparamstrict") ||
			!_validate_url_param($strCIs,"sqlparamstrict")){
	  echo generateCustomErrorString("-303","Failed to process Request CI Association. SQL Injection Detected. Please contact your Administrator.");
	  exit(0);
	}

	$strCode = "";
	switch(strtoupper($strCallClass))
	{
		case strtoupper("Incoming"):
			$strCode="INCOMING";
			break;
		case strtoupper("Incident"):
			$strCode="INCIDENT";
			break;
		case strtoupper("Service Request"):
			$strCode="REQUEST";
			break;
		case strtoupper("Change Request"):
			$strCode="RFC-CAUSE";
			break;
		case strtoupper("Problem"):
			$strCode="PROBLEM-CAUSE";
			break;
		case strtoupper("Known Error"):
			$strCode="PROBLEM-CAUSE";
			break;
		case strtoupper("Release Request"):
			$strCode="REL-CAUSE";
			break;
		default:
			$strCode=$strCallClass;
			break;
	}

	//-- Insert CI Records
	$oSwdata = new SqlQuery();
	$arrCIKeys = explode(",",$strCIs);
	foreach ($arrCIKeys as $pos => $ciKey)
	{
		$strInsert = "INSERT INTO cmn_rel_opencall_ci (fk_callref,fk_ci_auto_id,relcode) VALUES (" . $intCallRef . "," .$ciKey. ",'" . PrepareForSQL($strCode) . "')";
		$oSwdata->Query($strInsert);
	}
	throwSuccess();
