<?php

	//-- 15.05.2012
	//-- v1.0.0
	//-- service/form/combo/getdata/remotequery.php

	//-- get data for form listbox control using new remotequeries
	//-- includes
	include('../../../../php/session.php');
	include('../../../../php/db.helpers.php');


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/combo/getdata/storedquery.php","START","SERVI");
	}	

	//-- include remotequery - change pwd
	$_POST['espQueryName'] = "distinctpicklist/" . $_POST['espQueryName'];

	
	//-- get sessioninfo2 - only get once and then store in session
	$xmlmc = new XmlMethodCall();
	if(!$xmlmc->invoke("session","getSessionInfo2"))
	{
		echo $xmlmc->xmlresult;
		exit(0);
	}
	else
	{
		$_POST["sessioninfo2"] = $xmlmc->xmlresult;
	}	
	
	$swfc = 1;
	$swfc_picklist = 1;
	$includepath = '../../../../../clisupp/storedqueries/';
	include('../../../../../clisupp/storedqueries/index.php');

	//-- have xmldom of rows - traverse these and construct html table
	$arrRows = $xmlmc->xmldom->get_elements_by_tagname("rowData");
	if(isset($arrRows[0]))	
	{
		$arrRows = $arrRows[0]->get_elements_by_tagname("row");
	}


	$strMand = $_POST["mandatory"];
	$strData = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
	if($strMand=="0")
	{
		$strData .= "<tr><td width='100%'>&nbsp;</td><td style='display:none;'></td></tr>";
	}

	$iRowCount=0;
	while(isset($arrRows[$iRowCount]))
	{
		$xmlRow = $arrRows[$iRowCount];
		$arrColNodes = swxml_childnodes($xmlRow);
		
		//-- get col 1
		if($arrColNodes[0])
		{
			$keyvalue =($arrColNodes[0]->has_attribute("raw"))?$arrColNodes[0]->get_attribute("raw"):$arrColNodes[0]->get_content();

			if($arrColNodes[1])
			{
				$displayvalue = $arrColNodes[1]->get_content();
			}
			else
			{
				$displayvalue = $arrColNodes[0]->get_content();
			}
			//-- get col 2 (if no col 2 then use col1)
			$strData .= "<tr><td noWrap>".htmlentities($displayvalue)."</td><td style='display:none;'>".htmlentities($keyvalue)."</td></tr>";
		}	
		$iRowCount++;
	}
	$strData.= "</table>";

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/combo/getdata/storedquery.php","END","SERVI");
	}	
	echo $strData;
	exit(0);
?>