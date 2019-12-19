<?php

	//--
	//-- get count of ci relationship type - used in global.js cmdb.ci_relationship_exists function

	$sqlDatabase = "swdata";
	$sqlCommand =  "select count(*) from CONFIG_RELTYPE where PK_RELTYPE = '![rel]'";
?>