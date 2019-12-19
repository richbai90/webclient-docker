<?php
	//--
	//-- relate a ci to a callrecord - used in global.js cmdb.relate_ci_to_call function
	$intCallref = $_POST['cr'];
	if(!_validate_url_param($intCallref,"num")) {
		throwProcessErrorWithMsg("Invalid callref. Please contact your Administrator.");
	}

	$strSQL = "select callclass from opencall where CALLREF=".$intCallref;
	$aRS = get_recordset($strSQL, 'sw_systemdb');
	$strCallclass = "";
	if ($aRS->Fetch())
	{
		$strCallclass = get_field($aRS,"callclass");
		if($strCallclass=='Change Request'){
			if(!HaveAppRight("D", 6)){
				$call->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
				exit;
			}
		}
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "INSERT INTO CMN_REL_OPENCALL_ABA (FK_CALLREF, FK_BUS_AREA_ID, STATUS, SOURCE) ";
	$sqlCommand .= " VALUES (![cr:numeric], '![baid]', ':[sts]', ':[src]')";				
?>