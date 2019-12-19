<?php

	//-- get ma count for given given col on given table with where clause


	checkMandatoryParams("mxc"); //-- will erro if not set

	$tableName = swfc_tablename();
	$maxCol = pfs($_POST['mxc']);

	//--
	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";
	$sqlCommand =  "select max(".$maxCol.") as maxcount from " .swfc_tablename(). " where " . createTableFilterFromParams($tableName,$sqlDatabase);

	$oRS = get_recordset($sqlCommand,$sqlDatabase);
	if($oRS)
	{
		if($oRS->Fetch())
		{
			$max = $oRS->GetValueAsString("maxcount");
			if($max=="")$max=0;
			throwProcessSuccessWithResponse($max);
		}
	}

	setContentType();
	echo $oRS->GetLastError();
	exit;
?>