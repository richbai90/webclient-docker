<?php
	$strDocRef = PrepareForSQL($_POST['docRef']);
	$strSelect = "SELECT docref, title FROM swkb_articles ";
	$strWhere  = "WHERE docref IN (SELECT relateddocref FROM swkb_related where docref = '" . $strDocRef . "' UNION  SELECT docref FROM swkb_related where relateddocref = '" . $strDocRef . "')";
	$sqlDatabase = "swdata";
	$sqlCommand = $strSelect.$strWhere;
?>