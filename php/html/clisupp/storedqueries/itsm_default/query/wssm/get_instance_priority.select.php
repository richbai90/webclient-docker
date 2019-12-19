<?php
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT value as priority FROM websession_config WHERE instanceid='".PrepareForSql($_POST['inst'])."' and name='sla'";
?>