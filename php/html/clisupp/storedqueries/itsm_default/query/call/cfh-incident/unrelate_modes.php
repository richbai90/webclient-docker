<?php

	/* nwj - convert to use nline params - so just one sql statement

	$strModes = $_POST['modes'];
	$intCallref = $_POST['crf'];
	$arrKeyValues = explode(",",$strModes);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		$strSQL = "delete from cfh_opencallmodality where fk_callref = ".$intCallref."  and fk_modcode ='". PrepareForSql($keyValue)."'";
		$oRS = new SqlQuery();
		$oRS->Query($strSQL);
	}
	throwSuccess();

	*/
	$sqlDatabase = "swdata";
	$sqlCommand = "delete from CFH_OPENCALLMODALITY where FK_CALLREF = ![crf:numeric]  and FK_MODCODE in (![modes:sarray])";

?>