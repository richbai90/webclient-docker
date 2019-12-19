<?php

	//-- get services customer can subscribe too - used in global.js oService.get_customer_view_servicese

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	$res = $service->get_customer_view_services($_POST['ks'],($_POST['bs']=="true" || $_POST['bs']=="1"));

	if($res=="")
	{
		throwProcessSuccessWithResponseAndMsg('0','Customer record could not be found.');
		exit;
	}
	throwProcessSuccessWithResponse($res);
	exit;
?>