<?php

	//-- deterimine css to use
	$cssFile = "grey.css";
	$colorid = isset($_GET['ColourScheme'])?$_GET['ColourScheme']:$_POST['ColourScheme'];

	switch($colorid)
	{
		case 1:
		case 2:
			$cssFile = "lightblue.css";
			break;
		case 5:
			$cssFile = "aqua.css";
			break;
		//-- the silver/black schemes
		case 3:
		case 4:
		case 7:
		case 8:
			$cssFile = "silver.css";
			break;
		case 10:
		case 11:
		case 12:
			$cssFile = "grey.css";
			break;
		case 13:
		case 16:
			$cssFile = "royaleblue.css";
			break;
		case 14:
			$cssFile = "green.css";
			break;
		case 15:
			$cssFile = "metallic.css";
			break;

	}
	//-- eof scheme check

	$cssFile = "css/skin/".$cssFile ;

?>