<?php

	/* nwj - convert to use nline params - so just one sql statement
	$strSites = $_POST['sites'];
	$intCallref = $_POST['crf'];
	$arrKeyValues = explode(",",$strSites);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		$strSQL = "delete from cfh_opencallsites where fk_callref = ".$intCallref."  and fk_site ='". PrepareForSql($keyValue)."'";
		$oRS = new SqlQuery();
		$oRS->Query($strSQL);
	}
	throwSuccess();
	*/

	$sqlDatabase = "swdata";
	$sqlCommand = "delete from CFH_OPENCALLSITES where FK_CALLREF = ![crf:numeric] and FK_SITE in (![sites:sarray])";
?>