<?php

	//-- get a ci's parent dependencies - used in global.js - and calle in ci forms

	$activeBaseline = ($_POST['abln'] == "1")?" ISACTIVEBASELINE='Yes' and " : "";
	$exclArchServices = ($_POST['exas'] == "1")?" (service_archived IS NULL OR service_archived != 1) and " : "";
	
	$sqlDatabase = "swdata";
	$sqlCommand = "select CONFIG_RELI.PK_AUTO_ID FROM CONFIG_RELI JOIN CONFIG_ITEMI ON CONFIG_ITEMI.PK_AUTO_ID=FK_PARENT_ID where ".$activeBaseline.$exclArchServices." FK_CHILD_ID=![cid:numeric]";


?>