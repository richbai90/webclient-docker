<?php

	$sqlDatabase = "swdata";

	//-- get ext form using ci key
	if(isset($_POST['cid']))
	{
		$sqlCommand = "select EXTENDED_TABLE from CONFIG_TYPEI,CONFIG_ITEMI where PK_AUTO_ID = ![cid:numeric] and CK_CONFIG_TYPE = PK_CONFIG_TYPE";
	}
	else
	{
		//-- get ext form using config type
		$sqlCommand = "select EXTENDED_TABLE from CONFIG_TYPEI where PK_CONFIG_TYPE = '![ct]'";
	}

?>