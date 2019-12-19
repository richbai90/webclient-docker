<?php
	//-- loop passed in columns for table and create update statement for given record key
	IncludeApplicationPhpFile("itsm.helpers.php");	
	
	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";
	
	// -- if sqlDatabase is swdata, then use function in itsm.helpers.php
	if ($sqlDatabase == "swdata")
	{
		$returns = createTableUpdateFromParamsXMLMC($_POST['table'],$_POST['kv'],$sqlDatabase);
		if(1==$returns) throwSuccess();
		else throwError(100,$returns);
	}
	// -- if anything either than swdata (sw_systemdb in most cases), then use function in helpers.php
	else $sqlCommand = createTableUpdateFromParams($_POST['table'],$_POST['kv'],$sqlDatabase);

?>