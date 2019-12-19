<?php

	//-- expects posted vars sid (numeric) and sla (string no special chars)
	$sqlDatabase = "swdata";
	$sqlCommand = "select count(*) as cnt from sc_sla join sc_subscription on sc_sla.fk_subscription = sc_subscription.pk_id where sc_subscription.fk_service=![sid:numeric] and fk_sla='![sla:sqlparamstrict]'";
?>