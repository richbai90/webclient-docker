<?php
	// -- Get Tasks against a Request
	if(!isset($_POST['cr'])) throwSuccess();
	
	$where = "";
	if($_POST['cr']!="") $where = "WHERE BPM_PARENTCALLREF = ".$_POST['cr'];
	
	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>