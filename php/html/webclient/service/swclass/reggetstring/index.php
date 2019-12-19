<?php
	//-- v1.0.0
	//-- service/swclass/getregstring
	include('../../../php/swDecoder.php');
	//-- given regstring get it off server and exit
	echo sw_getregstring($_POST['_regstring']);
	exit;
?>