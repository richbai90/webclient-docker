<?php

	//-- get a ci's child dependencies - used in global.js - and calle in ci forms


	$activeBaseline = ($_POST['abln'] == "1")?" ISACTIVEBASELINE='Yes' and " : "";

	$sqlDatabase = "swdata";
	$sqlCommand = "select CONFIG_RELI.PK_AUTO_ID FROM CONFIG_RELI JOIN CONFIG_ITEMI ON CONFIG_ITEMI.PK_AUTO_ID=FK_CHILD_ID WHERE ".$activeBaseline." FK_PARENT_ID=![cid:numeric]";

?>