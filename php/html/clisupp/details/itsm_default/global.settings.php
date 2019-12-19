<?php
	//-- true = when href anchor clicked uses c form to open details
	//-- false = load sw.php form 
	$boolUseFormsInActivePageLinks=false;

	//ES 109085 -- determine which css to use
	$cssFile = "structure.css";
	$colorid = isset($_GET['ColourScheme'])?$_GET['ColourScheme']:$_POST['ColourScheme'];
	//Check are we in webclient
	$boolWC = isset($GLOBALS['HTTP_SESSION_VARS']['webclientparamsxml']);
	//If In Webclient Set ColorID to Silver
	if($boolWC)$colorid = 4;
	switch($colorid)
	{
		case 1: //Office 2007 > Light Blue
		case 2: //Office 2007 > Blue
			$cssFile = "blue.css";
			break;
		case 3: //Office 2007 > Black
		case 4: //Office 2007 > Silver
		case 7: //Office 2010 > Black
		Case 8: //Office 2010> Silver
			$cssFile = "silver.css";
			break;
		case 5: //Office 2007 > Aqua
			$cssFile = "aqua.css";
			break;
		case 6: //Office 2010 > Blue
			$cssFile = "2010_blue.css";
			break;	
		case 10: //Vista > Blue
		case 11: //Vista > Black
		Case 12: //Vista > Silver
			$cssFile = "vista_colour.css";
			break;
		case 13: //WinXp > Royale
		case 16: //WinXp > Luna Blue
			$cssFile = "winxp1.css";
			break;
		case 14: //Luna Homestead
			$cssFile = "green.css";
			break;
		case 15: //Luna Metallic
			$cssFile = "winxp2.css";
			break;
			
		default: //default to be Silver
			$cssFile = "silver.css";
	}
	//-- eof scheme check
?>