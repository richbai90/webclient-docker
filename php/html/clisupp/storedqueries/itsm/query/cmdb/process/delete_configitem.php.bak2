<?php
	//-- given cis will delete it and also delete optionally any baselines
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	//-- inlcude our cmdb helpers & constants
	$cmdb = new cmdbFunctions();

	//-- make sure has app rights
	$cmdb->can_delete(true); //-- true param means will exit if current aid does not have right

	$configItemKeys = $_POST['cids'];
	$boolDeleteBaselines = ($_POST['bdb']=="true");

	//-- process ci delete and return final delete result to client
	$rs = $cmdb->delete_configitem($configItemKeys, $boolDeleteBaselines);
	echo $rs->xmlmc->xmlresult;
	exit(0);
?>