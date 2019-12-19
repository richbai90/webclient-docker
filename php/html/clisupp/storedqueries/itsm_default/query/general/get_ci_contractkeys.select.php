<?php

	//-- globa.js get_ci_contractkeys

	$sqlDatabase = "swdata";
	$sqlCommand = "select distinct FK_PARENT_ITEMTEXT from CONFIG_RELI where FK_PARENT_TYPE = 'ME->CONTRACT' and FK_CHILD_ID in (![cids:array])";

?>