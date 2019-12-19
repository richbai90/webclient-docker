<?php

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	include("helpers/activepage.helpers.php"); //-- general helpers - apply to all apps
	include_once('itsm_default/xmlmc/installpath.php');

	//--F0091050
	//-- create a new active page session
	$session = new ClassActivePageSession(gv('sessid'));
	$boolValidSession=true;
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		$boolValidSession=false;
		exit;
	}//end if session is not valid
	//--EOF F0091050


	//-- load xml file - and process each type of gadget in order - at the moment page layout is fixed - but we could add layout to the xml
	$strPageXML = gv('pageXML');
	$strFileName = $GLOBALS['instance_path']."xml\\reports\\".$strPageXML.".xml";
	//echo $strFileName;

    $xmlfile = load_file($strFileName);
    $xmlDoc = domxml_open_mem($xmlfile);
    if($xmlDoc)
    {
        $root = $xmlDoc->document_element();
		if($root)
		{
			//-- process top center
			$arrPlaceHolders = $root->get_elements_by_tagname("placeholder");
			foreach ($arrPlaceHolders as $nodePos => $aPlaceHolder)
			{
				$strHTML .= process_gadget_html($aPlaceHolder,$strPageXML);
			}

			echo $strHTML;

			//-- close shared db connections
			foreach($GLOBALS['activepageconnections'] as $strDSN => $aConn)
			{
				$aConn->Close();
			}
		}
		else
		{
				//-- no root xml
		}
	}
	else
	{
		//-- bad or no xml
	}
?>
