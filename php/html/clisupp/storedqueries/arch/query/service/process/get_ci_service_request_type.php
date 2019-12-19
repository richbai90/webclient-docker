<?php

	//-- get services customer is subscribe too - used in global.js oService.get_ci_service_request_type

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	$res = $service->get_ci_service_request_type($_POST['type'],parseBool($_POST['baq']), $_POST['sep']);
	throwProcessSuccessWithResponse($res);
	exit;
?>