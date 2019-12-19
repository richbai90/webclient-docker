<?php
if (isset($_POST['kv']) && "" != $_POST['kv'] ){
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "INSERT INTO licensed_approvers ( id, firstname, surname ) VALUES ( '" . str_replace("'","''",$_POST['kv']) . "','" . str_replace("'","''",$_POST['firstname']) . "','" . str_replace("'","''",$_POST['surname']) . "' ) ";
} else throwSuccess(0);
