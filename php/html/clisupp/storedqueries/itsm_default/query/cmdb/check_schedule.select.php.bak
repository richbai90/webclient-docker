<?php

	//-- global.js cmdb.check_schedule
	checkMandatoryParams("cids,sdx,edx"); //-- will erro if not set

	$intCids = pfs($_POST['cids']);
	$startDatex = pfs($_POST['sdx']);
	$endDatex = pfs($_POST['edx']);


	$sqlDatabase = "swdata";

	$sqlCommand = "SELECT FK_CI_AUTO_ID, FK_CALLREF, ITSM_SCHEDSTARTX, ITSM_SCHEDENDX FROM CMN_REL_OPENCALL_CI, OPENCALL WHERE STATUS < 15 AND FK_CALLREF = CALLREF AND FK_CI_AUTO_ID IN (" . $intCids . ") ";
	if(isset($_POST['rc']))$sqlCommand .= " and RELCODE='" . pfs($_POST['rc']) . "'";
	$sqlCommand .= " and ( (" . $startDatex . " >= ITSM_SCHEDSTARTX and " . $startDatex . " <= ITSM_SCHEDENDX) or (" . $endDatex . " >= ITSM_SCHEDSTARTX and " . $endDatex . " <= ITSM_SCHEDENDX) or (" . $startDatex . " < ITSM_SCHEDSTARTX and " . $endDatex . " > ITSM_SCHEDENDX) )"


?>