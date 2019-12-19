<?php

	//-- v1.0.0
	//-- ddf/formatvalue

	//-- format column value
	//-- includes
	include('../../../php/session.php');

	if($_POST['formatbinding']=="opencall.probcode")
	{
		if($_POST['formatvalue']!="")echo conversion_problem_code($_POST['formatvalue']);
	}
	else if($_POST['formatbinding']=="opencall.fixcode")
	{
		if($_POST['formatvalue']!="")echo conversion_fix_code($_POST['formatvalue']);
	}
	else
	{
		echo swdti_formatvalue($_POST['formatbinding'],$_POST['formatvalue']);
	}
	exit;
?>