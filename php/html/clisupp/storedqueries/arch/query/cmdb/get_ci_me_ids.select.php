<?php


	//-- used in global.js cmdb get_ci_me_ids

	//--TK SQL Optimisation
	if($_POST['cids'] == 0)
	{
		throwSuccess();
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "select FK_PARENT_ITEMTEXT from CONFIG_RELI where FK_PARENT_TYPE='![pt]' AND FK_CHILD_ID in (![cids:array])";



?>