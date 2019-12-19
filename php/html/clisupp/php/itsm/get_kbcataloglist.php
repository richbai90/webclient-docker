<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	include_once('stdinclude.php');	
	include_once('itsm_default/xmlmc/xmlmc.php');	
	include_once('itsm_default/xmlmc/helpers/language.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/classknowledgebase.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	
	//error_reporting(E_ALL);

	include_once('itsm_default/xmlmc/common.php');
	//-- Construct a new active page session
	$session = new classActivePageSession(gv('sessid'));

	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		echo "SupportWorks Session Authentication Failure";
		exit;
	}
	$_SESSION['sessid'] = gv('sessid');
	
	
	//-- Get a KB access class and get a list of the catalogs available
	$strCatalogs = "";
	
	$sessionInst = $_GET['sessid'];
	$kb = new CSwKnowldgeBaseAccess;
	$boolAnalyst = true;
	if($kb->ConnectToKbApi("localhost",$sessionInst,$boolAnalyst))
	{
		//-- Iterate the list and fill the list box
		$kb->ListKnowledgeBaseCatalogs($catalogs);
		while( list($id, $name) = each($catalogs) )
		{
			if($strCatalogs!="")
				$strCatalogs .= "|";
			$strCatalogs .= $name;
		}

	$kb->CloseKbApi();
	}

	echo $strCatalogs;
?>