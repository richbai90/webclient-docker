<?php

	//-- browse swlists table with optional filter of list_id

	$inListID = $_POST["lid"];

	$where = "";
	if($inListID!="")
	{
		//-- check we have listid to filter by and check it for invalid chars (sql injection attempts)
		if(_validate_url_param($inListID,"sqlparamstrict"))
		{
			//--
			$where = " where list_id = '".PrepareForSql($inListID)."'";
		}
		else
		{
			echo generateCustomErrorString("-100","An invalid list type was specified. Please contact your Administrator.");
			exit(0);
		}

	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from swlists" . $where . swfc_orderby();

?>