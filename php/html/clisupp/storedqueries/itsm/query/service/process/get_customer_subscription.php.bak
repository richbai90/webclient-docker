<?php

	//-- get services customer is subscribe too - used in global.js oService.get_customer_subscription

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	
	$res = $service->get_customer_subscription($_POST['ks'],$_POST['sid'], $_POST['rel']);
	if($res==0)
	{
		throwProcessSuccessWithResponseAndMsg('-1','Customer record could not be found.');
		exit;
	}
	throwProcessSuccessWithResponse($res);
	exit;
?>