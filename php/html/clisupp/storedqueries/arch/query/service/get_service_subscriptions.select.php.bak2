<?php

	$strRelType = "SUBSCRIPTION";
	if($_POST['type']=="VIEW")
	{
		$strRelType = "VIEW";
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SC_SUBSCRIPTION WHERE FK_SERVICE =".pfs($_POST['sid'])." and REL_TYPE='".$strRelType."'";
?>