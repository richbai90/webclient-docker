<?php
	$strInstanceID = $session->analystId;
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = " SELECT * from websession_config where InstanceID =  '".PrepareForSql($strInstanceID)."'
									AND name NOT IN ('passwordPolicy','target_mailbox','ac_password','ac_table','ac_flags','ac_firstname','ac_lastname','ac_email','flags','baseurl','templatename','attemptperiod','maxattemptcount','linkexpirytime')";
