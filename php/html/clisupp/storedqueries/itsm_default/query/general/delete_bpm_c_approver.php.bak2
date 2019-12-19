<?php
if (isset($_POST['kv']) && "" != $_POST['kv'] ){
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "DELETE FROM licensed_approvers WHERE id = '" . str_replace("'","''",$_POST['kv']) . "'";
} else throwSuccess(0);
