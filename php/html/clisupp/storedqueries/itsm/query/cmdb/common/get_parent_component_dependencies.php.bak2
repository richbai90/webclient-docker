<?php

	//-- get a ci's active parent dependencies where the child is a component of the parent - used in global.js - and calle in ci forms
	$sqlDatabase = "swdata";
	$sqlCommand = "select CONFIG_RELI.PK_AUTO_ID, CONFIG_RELI.FLG_OPERATIONAL, CONFIG_RELI.FK_DEPENDENCY_TYPE, CONFIG_ITEMI.PK_AUTO_ID AS CI_AUTO_ID, CONFIG_ITEMI.BASELINEID, CONFIG_ITEMI.CK_CONFIG_TYPE, CONFIG_ITEMI.CK_CONFIG_ITEM, CONFIG_ITEMI.DESCRIPTION FROM CONFIG_RELI JOIN CONFIG_ITEMI ON CONFIG_ITEMI.PK_AUTO_ID=FK_PARENT_ID where ISACTIVEBASELINE='Yes' and FK_CHILD_ID=![cid:numeric] AND FK_DEPENDENCY_TYPE = 'Is a component of'  AND CONFIG_ITEMI.CK_CONFIG_TYPE NOT LIKE 'ME->%'";

?>