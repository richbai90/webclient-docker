<?php
	$strModes = $_POST['sites'];
	$intCallref = $_POST['crf'];
	$arrKeyValues = explode(",",$strModes);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		$strSQL = "insert into cfh_opencallsites (fk_site,fk_callref) values ('". PrepareForSql($keyValue)."',".$intCallref.")";
		$oRS = new SqlQuery();
		$oRS->Query($strSQL);
		//-- Include App Specific Helpers File
		IncludeApplicationPhpFile("app.helpers.php");
		//-- Check for XMLMC Error
		if($oRS->result==false)
		{
			//-- Function from app.helpers.php to process error message.
			handle_app_error($oRS->lastErrorResponse);
			exit(0);
		}
		//-- END
	}
	throwSuccess();
?>