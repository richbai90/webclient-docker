<?php

	//-- globals cmdb get_ci_calls



	$strCode = pfs($_POST['rc']);

	if ($strCallClass=="")
	{
		$sqlCommand = "select FK_CALLREF from CMN_REL_OPENCALL_CI where FK_CI_AUTO_ID = ![cid:numeric]";	
	}
	else
	{
		$sqlCommand = "select FK_CALLREF from CMN_REL_OPENCALL_CI, OPENCALL where CALLREF = FK_CALLREF and CALLCLASS = '!:[cc]' and FK_CI_AUTO_ID = ![cid:numeric]";
	}

	if($strCode != "") $sqlCommand .= " and RELCODE = '" . $strCode . "'";


?>