<?php
	$intCallref = $_POST['cr'];
	if(!_validate_url_param($intCallref,"num"))
	{
		echo generateCustomErrorString("-100","Invalid callref provided. Please contact your Administrator.");
		exit(0);
	}

	$where = " where fk_callref=".$intCallref;

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from request_comp " . $where . swfc_orderby();
?>