<?php

	/* nwj - convert to use inline params - so just one sql statement

	$strDepts = $_POST['depts'];
	$intCallref = $_POST['crf'];
	$arrKeyValues = explode(",",$strDepts);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		$strSQL = "delete from cfh_opencalldept where fk_callref = ".$intCallref."  and fk_deptcode ='". PrepareForSql($keyValue)."'";
		$oRS = new SqlQuery();
		$oRS->Query($strSQL);
	}
	throwSuccess();
	*/

	$sqlDatabase = "swdata";
	$sqlCommand = "delete from CFH_OPENCALLDEPT where FK_CALLREF = ![crf:numeric] and FK_DEPTCODE in (![depts:sarray])";
?>