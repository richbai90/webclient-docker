<?php

	//-- global.js get_contract_cikeys
	$boolGetChildren = ($_POST["bgc"]=="1")?true:false;

	$strGetCol = ($boolGetChildren)?"FK_CHILD_ID":"FK_PARENT_ID";
	$strTypeCol = ($boolGetChildren)?"FK_PARENT_TYPE":"FK_CHILD_TYPE";
	$strIDCol = ($boolGetChildren)?"FK_PARENT_ID":"FK_CHILD_ID";


	$sqlDatabase = "swdata";
	$sqlCommand= "select distinct " . $strGetCol . " from CONFIG_RELI where " . $strTypeCol . " = 'ME->CONTRACT' and " . $strIDCol . " = ![fcid:numeric]";

?>