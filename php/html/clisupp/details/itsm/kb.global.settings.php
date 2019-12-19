<?php
	//-- true = when href anchor clicked uses c form to open details
	//-- false = load sw.php form 
	$boolUseFormsInActivePageLinks=false;

	//-- determine css to use
	$KBcssFile = "kb_main.css";
	$colorid = isset($_GET['ColourScheme'])?$_GET['ColourScheme']:$_POST['ColourScheme'];
    //Check are we in webclient
	$boolWC = isset($GLOBALS['HTTP_SESSION_VARS']['webclientparamsxml']);
	//If In Webclient Set ColorID to Silver
	if($boolWC)$colorid = 4;    
	switch($colorid)
	{
		//ES -- kb - point each colour scheme to corresponding css
		case 1: //Office 2007 > Light Blue
		case 2: //Office 2007 > Blue
			$KBcssFile = "kb_blue.css";
			break;
		case 3: //Office 2007 > Black
		case 4: //Office 2007 > Silver
		case 7: //Office 2010 > Black
		Case 8: //Office 2010> Silver
			$KBcssFile = "kb_silver.css";
			break;
		case 5: //Office 2007 > Aqua
			$KBcssFile = "kb_aqua.css";
			break;
		case 6: //Office 2010 > Blue
			$KBcssFile = "kb_2010_blue.css";
			break;	
		case 10: //Vista > Blue
		case 11: //Vista > Black
		Case 12: //Vista > Silver
			$KBcssFile = "kb_vista_colour.css";
			break;
		case 13: //WinXp > Royale
		case 16: //WinXp > Luna Blue
			$KBcssFile = "kb_winxp1.css";
			break;
		case 14: //Luna Homestead
			$KBcssFile = "kb_green.css";
			break;
		case 15: //Luna Metallic
			$KBcssFile = "kb_winxp2.css";
			break;
			
		default: //default to be Silver
			$KBcssFile = "kb_silver.css";
	}
	//-- eof scheme check
?>