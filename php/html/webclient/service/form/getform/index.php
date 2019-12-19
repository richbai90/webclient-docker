<?php

	//-- get json form
	include('../../../php/session.php');

	$strFormType = $_POST['formtype'];
	$strFormName = $_POST['formname'];

	//--
	//-- 17.05.2012 - check for form access file - this will set a var $accessGranted to 1
	$webclientexecution = true;
	$includepath = "../../../../clisupp/formsaccess/";
	
	//-- 03.07.2012 - check that formsaccess processor exists
	if(file_exists($includepath.'index.php'))
	{
		$_POST['espFormName'] = $strFormType . "/". $strFormName;
		$_POST['sessid'] = $_SESSION['swsession'];
		include($includepath.'index.php');
	}
	else
	{
		$accessGranted=1;
	}

	if($accessGranted!=1)
	{
		echo "formaccessdenied:".$accessGranted;
	}
	else
	{
		//-- do normal processing
		if(strpos($strFormType,"_system")===0)
		{
			$strFileName = $portal->fs_systemforms_path .$strFormType . "/". $strFormName .".json";
		}
		else
		{
			$strFileName = $portal->fs_application_path . "_xml/prepared/" . $strFormType. "/". $strFormName . ".json";
		}
		$jsonfp = @file_get_contents($strFileName);
		if($jsonfp==false)
		{
			echo "false";
		}
		else
		{
			echo $jsonfp;
		}
	}
	exit(0);
?>