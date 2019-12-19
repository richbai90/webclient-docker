<?php

	$callref = $_POST['callref'];
	$values = $_POST['groups'];
	$values = preg_replace('/,/', '),(', $values);
	$values = preg_replace('/([\w\s\/]+)::([\w\s\/]+)/', "'$1','$2',$callref", $values);
	$values = '('.$values.')';

	$sqlDatabase = "swdata";
	$sqlCommand = "INSERT INTO cstm_rel_opencall_archgroups (groupid,groupname,callref) values $values";
	error_log($sqlCommand);
