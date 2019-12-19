<?php
	$sqlDatabase = "swdata";
	$sqlCommand = "select fk_slad, fk_slad_name from itsmsp_slad_priority where fk_priority ='".PrepareForSql($_POST['sla'])."'";
?>