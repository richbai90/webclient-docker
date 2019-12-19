<?php
	$strProfCode = PrepareForSQL($_POST['pCode']);
	$strSelect = "SELECT info FROM pcdesc ";
	$strWhere  = "WHERE code ='" . $strProfCode . "'";
	$sqlDatabase = "swdata";
	$sqlCommand = $strSelect.$strWhere;
?>