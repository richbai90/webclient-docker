<?php
	//ES - F0112388 - This script to all the necessary information for a Service Portfolio item and display results
	//error_reporting(E_ALL);
	//include our standard include functions page
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//include our standard include functions page
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	
	include_once("../../../../reports/rpt_incl_config.php");
	include_once('itsm_default/xmlmc/classknowledgebase.php');
	include_once('itsm_default/xmlmc/classreport.php');

	$test = $_POST['sessid'];
	//construct a new active page session
	$session = new classActivePageSession($test);
	$categoriesXML = '';
	$DataXML = '';
	$processXML = '';
	$arrSLATarg = '';
	//initialise the session
	if(!$session->IsValidSession())
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Session Authentication Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							There has been a session authentication error<br>
							Please contact your system administrator.
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	//store variables
	list($fYear, $fMonth, $fDay) = explode('-',$_POST['date_from']);
	$from_day = $fDay; $from_month = $fMonth; $from_year = $fYear;
	$date_from = mktime(0, 0, 0,ltrim($fMonth,"0"),$fDay,$fYear);
	
	list($tYear, $tMonth, $tDay) = explode('-', $_POST['date_to']);
	$to_day = $tDay; $to_month = $tMonth; $to_year = $tYear;
	$date_to = mktime(0, 0, 0,ltrim($tMonth,"0"),$tDay,$tYear);
	
	//validate dates
	if(!$_POST['date_from'] || !$_POST['date_to'])
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
					<script>
					function goBack()
					  {
					  window.history.back()
					  }
					</script>
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							Please enter a start and end date.<P>
							<input type="button" value="Back" onclick="goBack()">
							
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	if($date_from>$date_to)
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
					<script>
					function goBack()
					  {
					  window.history.back()
					  }
					</script>
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							Please enter start date from an end date.<P>
							<input type="button" value="Back" onclick="goBack()">
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	if(($date_to - $date_from) > 31536000)
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
					<script>
					function goBack()
					  {
					  window.history.back()
					  }
					</script>
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							The date range must not be greater than one year.<P>
							<input type="button" value="Back" onclick="goBack()">
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	
	//db connection
	$reportODBC = new CSwDbConnection;;
	$strDSN = swdsn();
	$strUID = swuid();    
	$strPWD = swpwd();
	$boolConnected = $reportODBC->Connect($strDSN,$strUID,$strPWD);
	
	//function to get pk_auto_id from config_itemi for selected Service Portfolio
	function getConfigurationID()
	{
		global $reportODBC;
		//get pk_auto_id from config_itemi for the selected service
		$serviceName = $_POST['servicePortfolio'];
		//$strSQL = "SELECT pk_auto_id from config_itemi INNER JOIN sc_folio ON config_itemi.pk_auto_id = sc_folio.fk_cmdb_id WHERE appcode = '".pfs($GLOBALS['dd'])."' AND isactivebaseline = 'Yes' AND sc_folio.service_name = '".$serviceName."'";
		$strSQL = "SELECT pk_auto_id from config_itemi WHERE appcode = '".pfs($GLOBALS['dd'])."' AND isactivebaseline = 'Yes' AND description = '".$serviceName."'";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$CI_ID = $recSet->xf('pk_auto_id');
			$recSet->movenext();
		}
		return $CI_ID;
	}
	$CI_ID = getConfigurationID();

	function getOverviewAvailabilityInfo($CI_ID_IN, $date_from, $date_to)
	{
		global $reportODBC, $strHTML;
		$strSQL = "select pk_auto_id, startedonx, endedonx, opdowntime, downtime from ci_avail_hist where FK_CI_ID = ".$CI_ID_IN." and startedonx > ".$date_from." and endedonx < ".$date_to." order by startedonx ASC";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrID[] = $recSet->xf('pk_auto_id');
			$arrOpdowntime[] = $recSet->xf('opdowntime');
			$arrDowntime[] = $recSet->xf('downtime');
			$recSet->movenext();
		}
		$intTotal_opDowntime = 0;
		$intTotal_Downtime = 0;
		foreach ($arrOpdowntime as $value)
		{
			$intTotal_opDowntime = $intTotal_opDowntime + $value;
		}
		foreach ($arrDowntime as $value)
		{
			$intTotal_Downtime = $intTotal_Downtime + $value;
		}
		
		$length = count($arrID);
		if ($length<1)
		{
			$strHTML .= "<p><b>There is no availability information available for this service.</p>";
		}
		else
		{
			$strHTML .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
			$strHTML .= "<p><b>Overview of Total Down Time</b></p>";
			$strHTML .= "<p>Total Down Time (Hrs): ".$intTotal_Downtime."</p>";
			$strHTML .= "<p>Total Operational Down Time (Hrs): ".$intTotal_opDowntime."</p>";
			$strHTML .= "</div>";
		}
	return $strHTML;	
	}
	
	//get list of downtime records from ci_avail_hist for selcted Service Portfolio and display in a table
	function getListAvailabilityInfo($CI_ID_IN, $date_from, $date_to)
	{
		global $reportODBC, $strHTML_1;
		$strSQL = "select pk_auto_id, startedonx, endedonx, opdowntime, downtime, fk_ci_item, fk_callref from ci_avail_hist where FK_CI_ID = ".$CI_ID_IN." and startedonx > ".$date_from." and endedonx < ".$date_to." order by startedonx ASC";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrID[] = $recSet->xf('pk_auto_id');
			$arrStartedOn[] = $recSet->xf('startedonx');
			$arrResolvedOn[] = $recSet->xf('endedonx');
			$arrOpdowntime[] = $recSet->xf('opdowntime');
			$arrDowntime[] = $recSet->xf('downtime');
			$arrCausedBy[] = $recSet->xf('fk_ci_item');
			$arrCallref[] = $recSet->xf('fk_callref');
			$recSet->movenext();
		}
		$length = count($arrID);
		
		if ($length<1)
		{
			$strHTML_1 .= "<p><b>There is no availability information available for this service.</p>";
		}
		else
		{		
				$strHTML_1 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_1 .= "<p><b>List of Down Time Records</b></p>";
					$strHTML_1 .= "<table border='2'>";
						$strHTML_1 .= "<tr>";
							$strHTML_1 .= "<th>Started On</th>";
							$strHTML_1 .= "<th>Resolved On</th>";
							$strHTML_1 .= "<th>Operational Down Time (Hrs)</th>";
							$strHTML_1 .= "<th>Total Down Time (Hrs)</th>";
							$strHTML_1 .= "<th>Caused By</th>";
							$strHTML_1 .= "<th>Request Reference</th>";			
						$strHTML_1 .= "</tr>";
						for ($i=0; $i<$length; $i++)
						{
						$strHTML_1 .= "<tr>";
							$strHTML_1 .= "<td>".gmdate("Y-m-d", $arrStartedOn[$i])."</td>";
							$strHTML_1 .= "<td>".gmdate("Y-m-d", $arrResolvedOn[$i])."</td>";
							$strHTML_1 .= "<td>".$arrOpdowntime[$i]."</td>";
							$strHTML_1 .= "<td>".$arrDowntime[$i]."</td>";
							$strHTML_1 .= "<td>".$arrCausedBy[$i]."</td>";
							$strHTML_1 .= "<td>".$arrCallref[$i]."</td>";
						$strHTML_1 .= "</tr>";
						}
					$strHTML_1 .= "</table>";
				$strHTML_1 .= "</div>";	
			return $strHTML_1;
		}
	}
	
	function getIncidentsAgainstService($CI_ID, $date_from, $date_to)
	{
		global $reportODBC, $strHTML_2;
		$strSQL = "select fk_callref from cmn_rel_opencall_ci where fk_ci_auto_id = ".$CI_ID." and relcode = 'INCIDENT'";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrCallref[] = $recSet->xf('fk_callref');
			$recSet->movenext();
		}
		foreach ($arrCallref as $value)
		{
			$strSQL1 = "select callref, itsm_title, probcodedesc, withinfix, logdatex from opencall where appcode = '".pfs($GLOBALS['dd'])."' and callref = ".$value." and logdatex between ".$date_from." and ".$date_to." and status IN (16,6,18)";
			$recSet1 = $reportODBC->Query($strSQL1,true);
			while (!$recSet1->eof)
			{
				$arrTCallref[] = $recSet1->xf('callref');
				$arrSummary[] = $recSet1->xf('itsm_title');
				$arrProfile[] = $recSet1->xf('probcodedesc');
				$arrWithinfix[] = $recSet1->xf('withinfix');
				$arrLogdatex[] = $recSet1->xf('logdatex');
				$recSet1->movenext();
			}
		}
		$length = count($arrTCallref);
		$intTotalWithin = 0;
		foreach ($arrWithinfix as $value)
		{
			if ($value==1)
			{
				$arrNewWithinfix[] = "Yes";
				$intTotalWithin++;
			}
		}		
		if ($length<1)
		{
			$strHTML_2 .= "<p><b>There are no incidents raised against this service.</p>";
		}
		else
		{
			$strHTML_2 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_2 .= "<p><b>List of Incidents Raised</b></p>";
					$strHTML_2 .= "<table border='2'";
						$strHTML_2 .= "<tr>";
							$strHTML_2 .= "<th>Incident Reference</th>";
							$strHTML_2 .= "<th>Summary</th>";
							$strHTML_2 .= "<th>Profile</th>";
							$strHTML_2 .= "<th>Within Fix</th>";
							$strHTML_2 .= "<th>Logged On</th>";
						$strHTML_2 .= "</tr>";
						for ($i=0; $i<$length; $i++)
						{
						$strHTML_2 .= "<tr>";
							$strHTML_2 .= "<td>".swcallref_str($arrTCallref[$i])."</td>";
							$strHTML_2 .= "<td>".$arrSummary[$i]."</td>";
							$strHTML_2 .= "<td>".$arrProfile[$i]."</td>";
							$strHTML_2 .= "<td>".$arrNewWithinfix[$i]."</td>";
							$strHTML_2 .= "<td>".gmdate("Y-m-d", $arrLogdatex[$i])."</td>";
						$strHTML_2 .= "</tr>";
						}
					$strHTML_2 .= "</table>";
				$strHTML_2 .= "</div>";	
			$strHTML_2 .= "<br>";	
			$strHTML_2 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_2 .= "<p><b>Overview of Incidents</b></p>";
				$strHTML_2 .= "<p>Total number of Incidents: ".$length."</p>";
				$strHTML_2 .= "<p>Total number of Incidents within fix: ".$intTotalWithin."</p>";
			$strHTML_2 .= "</div>";
		}		
		return $strHTML_2;
	}
	
	function getChangesAgainstService($CI_ID, $date_from, $date_to)
	{
		global $reportODBC, $strHTML_3;
		$strSQL = "select fk_callref from cmn_rel_opencall_ci where fk_ci_auto_id = ".$CI_ID." and relcode = 'RFC-CAUSE'";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrCallref[] = $recSet->xf('fk_callref');
			$recSet->movenext();
		}
		foreach ($arrCallref as $value)
		{
			$strSQL1 = "select callref, itsm_title, probcodedesc, withinfix, logdatex, bpm_status_id from opencall where appcode = '".pfs($GLOBALS['dd'])."' and callref = ".$value." and logdatex between ".$date_from." and ".$date_to." and status IN (16,6,18)";
			$recSet1 = $reportODBC->Query($strSQL1,true);
			while (!$recSet1->eof)
			{
				$arrTCallref[] = $recSet1->xf('callref');
				$arrSummary[] = $recSet1->xf('itsm_title');
				$arrProfile[] = $recSet1->xf('probcodedesc');
				$arrWithinfix[] = $recSet1->xf('withinfix');
				$arrLogdatex[] = $recSet1->xf('logdatex');
				$arrBpmstatus[] = $recSet1->xf('bpm_status_id');
				$recSet1->movenext();
			}
		}
		$length = count($arrTCallref);
		$intTotalWithin = 0;
		foreach ($arrWithinfix as $value)
		{
			if ($value==1)
			{
				$arrNewWithinfix[] = "Yes";
				$intTotalWithin++;
			}			
		}
		if ($length<1)
		{
			$strHTML_3 .= "<p><b>There are no change requests raised against this service.</p>";
		}
		else
		{
			$strHTML_3 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_3 .= "<p><b>List of Changes Raised</b></p>";
					$strHTML_3 .= "<table border='2'";
						$strHTML_3 .= "<tr>";
							$strHTML_3 .= "<th>Change Reference</th>";
							$strHTML_3 .= "<th>Summary</th>";
							$strHTML_3 .= "<th>Profile</th>";
							$strHTML_3 .= "<th>Within Fix</th>";
							$strHTML_3 .= "<th>BPM Status</th>";
							$strHTML_3 .= "<th>Logged On</th>";
						$strHTML_3 .= "</tr>";
						for ($i=0; $i<$length; $i++)
						{
						$strHTML_3 .= "<tr>";
							$strHTML_3 .= "<td>".swcallref_str($arrTCallref[$i])."</td>";
							$strHTML_3 .= "<td>".$arrSummary[$i]."</td>";
							$strHTML_3 .= "<td>".$arrProfile[$i]."</td>";
							$strHTML_3 .= "<td>".$arrNewWithinfix[$i]."</td>";
							$strHTML_3 .= "<td>".$arrBpmstatus[$i]."</td>";
							$strHTML_3 .= "<td>".gmdate("Y-m-d", $arrLogdatex[$i])."</td>";
						$strHTML_3 .= "</tr>";
						}
					$strHTML_3 .= "</table>";
				$strHTML_3 .= "</div>";	
			$strHTML_3 .= "<br>";	
			$strHTML_3 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_3 .= "<p><b>Overview of Changes</b></p>";
				$strHTML_3 .= "<p>Total number of Changes: ".$length."</p>";
				$strHTML_3 .= "<p>Total number of Changes within fix: ".$intTotalWithin."</p>";
			$strHTML_3 .= "</div>";
		}
		return $strHTML_3;
	}
	
	function getServiceRequestsAgainstService($CI_ID, $date_from, $date_to)
	{
		global $reportODBC, $strHTML_4;
		$strSQL = "select callref, itsm_title, probcodedesc, withinfix, logdatex from opencall where appcode = '".pfs($GLOBALS['dd'])."' and itsm_fk_service = ".$CI_ID." and logdatex between ".$date_from." and ".$date_to." and status IN (16,6,18)";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrTCallref[] = $recSet->xf('callref');
			$arrSummary[] = $recSet->xf('itsm_title');
			$arrProfile[] = $recSet->xf('probcodedesc');
			$arrWithinfix[] = $recSet->xf('withinfix');
			$arrLogdatex[] = $recSet->xf('logdatex');
			$recSet->movenext();
		}		
		$length = count($arrTCallref);
		$intTotalWithin = 0;
		foreach ($arrWithinfix as $value)
		{
			if ($value==1)
			{
				$arrNewWithinfix[] = "Yes";
				$intTotalWithin++;
			}			
		}
		if ($length<1)
		{
			$strHTML_4 .= "<p><b>There are no service requests raised against this service.</p>";
		}
		else
		{
			$strHTML_4 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_4 .= "<p><b>List of Services Raised</b></p>";
					$strHTML_4 .= "<table border='2'";
						$strHTML_4 .= "<tr>";
							$strHTML_4 .= "<th>Service Request Reference</th>";
							$strHTML_4 .= "<th>Summary</th>";
							$strHTML_4 .= "<th>Profile</th>";
							$strHTML_4 .= "<th>Within Fix</th>";
							$strHTML_4 .= "<th>Logged On</th>";
						$strHTML_4 .= "</tr>";
						for ($i=0; $i<$length; $i++)
						{
						$strHTML_4 .= "<tr>";
							$strHTML_4 .= "<td>".swcallref_str($arrTCallref[$i])."</td>";
							$strHTML_4 .= "<td>".$arrSummary[$i]."</td>";
							$strHTML_4 .= "<td>".$arrProfile[$i]."</td>";
							$strHTML_4 .= "<td>".$arrNewWithinfix[$i]."</td>";
							$strHTML_4 .= "<td>".gmdate("Y-m-d", $arrLogdatex[$i])."</td>";
						$strHTML_4 .= "</tr>";
						}
					$strHTML_4 .= "</table>";
				$strHTML_4 .= "</div>";	
			$strHTML_4 .= "<br>";	
			$strHTML_4 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_4 .= "<p><b>Overview of Service Requests</b></p>";
				$strHTML_4 .= "<p>Total number of Service Requests: ".$length."</p>";
				$strHTML_4 .= "<p>Total number of Service Requests within fix: ".$intTotalWithin."</p>";
			$strHTML_4 .= "</div>";
		}	
		return $strHTML_4;
	}
	
	function getAvailabilityTimes($CI_ID)
	{
		global $reportODBC, $strHTML_5;
		$strSQL = "select mon_s, mon_e, tue_s, tue_e, wed_s, wed_e, thu_s, thu_e, fri_s, fri_e, sat_s, sat_e, sun_s, sun_e from config_itemi where pk_auto_id = ".$CI_ID." ";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrMons = $recSet->xf('mon_s');
			$arrMone = $recSet->xf('mon_e');
			$arrTues = $recSet->xf('tue_s');
			$arrTuee = $recSet->xf('tue_e');
			$arrWeds = $recSet->xf('wed_s');
			$arrWede = $recSet->xf('wed_e');
			$arrThus = $recSet->xf('thu_s');
			$arrThue = $recSet->xf('thu_e');
			$arrFris = $recSet->xf('fri_s');
			$arrFrie = $recSet->xf('fri_e');
			$arrSats = $recSet->xf('sat_s');
			$arrSate = $recSet->xf('sat_e');
			$arrSuns = $recSet->xf('sun_s');
			$arrSune = $recSet->xf('sun_e');
			$recSet->movenext();
		}
		$strHTML_5 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
			$strHTML_5 .= "<p><b>Operational Hours</b></p>";
			$strHTML_5 .= "<table border='2'>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<th>Day</th>";
					$strHTML_5 .= "<th>From</th>";
					$strHTML_5 .= "<th>To</th>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Monday</td>";
					$strHTML_5 .= "<td>".$arrMons."</td>";
					$strHTML_5 .= "<td>".$arrMone."</td>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Tuesday</td>";
					$strHTML_5 .= "<td>".$arrTues."</td>";
					$strHTML_5 .= "<td>".$arrTuee."</td>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Wednesday</td>";
					$strHTML_5 .= "<td>".$arrWeds."</td>";
					$strHTML_5 .= "<td>".$arrWede."</td>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Thursday</td>";
					$strHTML_5 .= "<td>".$arrThus."</td>";
					$strHTML_5 .= "<td>".$arrThue."</td>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Friday</td>";
					$strHTML_5 .= "<td>".$arrFris."</td>";
					$strHTML_5 .= "<td>".$arrFrie."</td>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Saturday</td>";
					$strHTML_5 .= "<td>".$arrSats."</td>";
					$strHTML_5 .= "<td>".$arrSate."</td>";
				$strHTML_5 .= "</tr>";
				$strHTML_5 .= "<tr>";
					$strHTML_5 .= "<td>Sunday</td>";
					$strHTML_5 .= "<td>".$arrSuns."</td>";
					$strHTML_5 .= "<td>".$arrSune."</td>";
				$strHTML_5 .= "</tr>";
			$strHTML_5 .= "</table>";
		$strHTML_5 .= "</div>";		
	return $strHTML_5;
	}
	
	function getBlackoutPeriods($CI_ID, $date_from, $date_to)
	{
		global $reportODBC, $strHTML_6;
		//Bespoke Time
		$strSQL = "select blackout_name,start_dayx,end_dayx from ci_blackout where fk_ci_id = ".$CI_ID." and type = 'Bespoke Time' and start_dayx > ".$date_from." and end_dayx < ".$date_to." ";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrBlackoutnameB[] = $recSet->xf('blackout_name');
			$arrStartdayx[] = $recSet->xf('start_dayx');
			$arrEnddayx[] = $recSet->xf('end_dayx');
			$recSet->movenext();
		}
		$BT = count($arrBlackoutnameB);
		if ($BT<1)
		{
			$strHTML_6 .= "<p><b>There are no bespoke time Blackout Periods for this service.</p>";
		}
		else
		{
			$strHTML_6 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
					$strHTML_6 .= "<p><b>Bespoke Periods</p>";
			$strHTML_6 .= "<table border='2'>";
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<th>Blackout Name</th>";
					$strHTML_6 .= "<th>Start Day</th>";
					$strHTML_6 .= "<th>End Day</th>";
				$strHTML .= "</tr>";
				for ($i=0; $i<$BT; $i++)
				{
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<td>".$arrBlackoutnameB[$i]."</td>";
					$strHTML_6 .= "<td>".gmdate("Y-m-d",$arrStartdayx[$i])."</td>";
					$strHTML_6 .= "<td>".gmdate("Y-m-d",$arrEnddayx[$i])."</td>";
				$strHTML .= "</tr>";
				}
			$strHTML_6 .= "</table>";
		$strHTML_6 .= "</div><br>";
		}
		//Periodical Time
		$strSQL_1 = "select tm_periods.name, ci_blackout.blackout_name, ci_blackout.day_offset, ci_blackout.no_of_days from ci_blackout, tm_periods where fk_ci_id = ".$CI_ID." and type = 'Periodical Time'  and tm_periods.pk_auto_id = ci_blackout.fk_period";
		$recSet_1 = $reportODBC->Query($strSQL_1,true);
		while(!$recSet_1->eof) 
		{
			$arrBlackoutnameP[] = $recSet_1->xf('blackout_name');
			$arrFkperiod[] = $recSet_1->xf('name');
			$arrDayoffset[] = $recSet_1->xf('day_offset');
			$arrNoOfdays[] = $recSet_1->xf('no_of_days');
			$recSet_1->movenext();
		}
		$PT = count($arrBlackoutnameP);
		if ($PT<1)
		{
			$strHTML_6 .= "<p><b>There are no periodical time Blackout Periods for this service.</p>";
		}
		else
		{
		$strHTML_6 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
			$strHTML_6 .= "<p><b>Periodical Time Periods</p>";
			$strHTML_6 .= "<table border='2'>";
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<th>Blackout Name</th>";
					$strHTML_6 .= "<th>Time Period</th>";
					$strHTML_6 .= "<th>Start Day</th>";
					$strHTML_6 .= "<th>Operational Days</th>";
				$strHTML .= "</tr>";
				for ($j=0; $j<$PT; $j++)
				{
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<td>".$arrBlackoutnameP[$j]."</td>";
					$strHTML_6 .= "<td>".$arrFkperiod[$j]."</td>";
					$strHTML_6 .= "<td>".$arrDayoffset[$j]."</td>";
					$strHTML_6 .= "<td>".$arrNoOfdays[$j]."</td>";
				$strHTML .= "</tr>";
				}
			$strHTML_6 .= "</table>";
		$strHTML_6 .= "</div><br>";
		}
		//Monthly
		$strSQL_2 = "select blackout_name,start_week, start_day, no_of_days from ci_blackout where fk_ci_id = ".$CI_ID." and type = 'Monthly' ";
		$recSet_2 = $reportODBC->Query($strSQL_2,true);
		while(!$recSet_2->eof) 
		{
			$arrBlackoutnameM[] = $recSet_2->xf('blackout_name');
			$arrStartweek[] = $recSet_2->xf('start_week');
			$arrStartday[] = $recSet_2->xf('start_day');
			$arrNoOfdaysMon[] = $recSet_2->xf('no_of_days');
			$recSet_2->movenext();
		}
		$MO = count($arrBlackoutnameM);
		if ($MO<1)
		{
			$strHTML_6 .= "<p><b>There are no monthly Blackout Periods this service.</p>";
		}
		else
		{
		$strHTML_6 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
			$strHTML_6 .= "<p><b>Monthly Periods</p>";
			$strHTML_6 .= "<table border='2'>";
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<th>Blackout Name</th>";
					$strHTML_6 .= "<th>Start Week</th>";
					$strHTML_6 .= "<th>Start Day</th>";
					$strHTML_6 .= "<th>Operational Days</th>";
				$strHTML .= "</tr>";
				for ($h=0; $h<$PT; $h++)
				{
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<td>".$arrBlackoutnameM[$h]."</td>";
					$strHTML_6 .= "<td>".$arrStartweek[$h]."</td>";
					$strHTML_6 .= "<td>".$arrStartday[$h]."</td>";
					$strHTML_6 .= "<td>".$arrNoOfdaysMon[$h]."</td>";
				$strHTML .= "</tr>";
				}
			$strHTML_6 .= "</table>";
		$strHTML_6 .= "</div><br>";
		}
		//Weekly
		$strSQL_3 = "select blackout_name, start_day, no_of_days from ci_blackout where fk_ci_id = ".$CI_ID." and type = 'Weekly' ";
		$recSet_3 = $reportODBC->Query($strSQL_3,true);
		while(!$recSet_3->eof) 
		{
			$arrBlackoutnameW[] = $recSet_3->xf('blackout_name');
			$arrStartdayW[] = $recSet_3->xf('start_day');
			$arrNoOfdaysW[] = $recSet_3->xf('no_of_days');
			$recSet_3->movenext();
		}
		$WE = count($arrBlackoutnameW);
		if ($WE<1)
		{
			$strHTML_6 .= "<p><b>There are no weekly Blackout Periods this service.</p>";
		}
		else
		{
		$strHTML_6 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
			$strHTML_6 .= "<p><b>Weekly Periods</p>";
			$strHTML_6 .= "<table border='2'>";
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<th>Blackout Name</th>";
					$strHTML_6 .= "<th>Start Day</th>";
					$strHTML_6 .= "<th>Operational Days</th>";
				$strHTML .= "</tr>";
				for ($m=0; $m<$PT; $m++)
				{
				$strHTML_6 .= "<tr>";
					$strHTML_6 .= "<td>".$arrBlackoutnameW[$m]."</td>";
					$strHTML_6 .= "<td>".$arrStartdayW[$m]."</td>";
					$strHTML_6 .= "<td>".$arrNoOfdaysW[$m]."</td>";
				$strHTML .= "</tr>";
				}
			$strHTML_6 .= "</table>";
		$strHTML_6 .= "</div>";
		}		
	return $strHTML_6;
	}
		
	function getIncidentsResultingChangesAgainstService($CI_ID, $date_from, $date_to)
	{
		global $reportODBC, $strHTML_7;
		$strSQL = "select fk_callref from cmn_rel_opencall_ci where fk_ci_auto_id = ".$CI_ID." and relcode = 'RFC-CAUSE'";
		$recSet = $reportODBC->Query($strSQL,true);
		while(!$recSet->eof) 
		{
			$arrChangeCallref[] = $recSet->xf('fk_callref');
			$recSet->movenext();
		}
		foreach ($arrChangeCallref as $value)
		{
			$strSQL_1 = "select fk_callref_s from cmn_rel_opencall_oc where fk_callref_m = ".$value." and relcode = 'RFC-INCIDENT'";
			$recSet_1 = $reportODBC->Query($strSQL_1,true);
			while(!$recSet_1->eof) 
			{
				$arrIncidentCallref[] = $recSet_1->xf('fk_callref_s');
				$recSet_1->movenext();
			}
		}
		foreach ($arrIncidentCallref as $value)
		{
			$strSQL_2 = "select callref, itsm_title, probcodedesc, withinfix, logdatex from opencall where appcode = '".pfs($GLOBALS['dd'])."' and callref = ".$value." and logdatex between ".$date_from." and ".$date_to." and status IN (16,6,18)";
			$recSet_2 = $reportODBC->Query($strSQL_2,true);
			while(!$recSet_2->eof)
			{
				$arrCallref[] = $recSet_2->xf('callref');
				$arrTitle[] = $recSet_2->xf('itsm_title');
				$arrProbcode[] = $recSet_2->xf('probcodedesc');
				$arrWithinfix[] = $recSet_2->xf('withinfix');
				$arrLogdatex[] = $recSet_2->xf('logdatex');
				$recSet_2->movenext();
			}
		}
		$length = count($arrCallref);
		$intTotalWithin = 0;
		foreach ($arrWithinfix as $value)
		{
			if ($value==1)
			{
				$arrNewWithinfix[] = "Yes";
				$intTotalWithin++;
			}
			else if ($value==0)
			{
				$arrNewWithinfix[] = "No";
			}
		}
		if($length<1)
		{
			$strHTML_7 .= "<p><b>There are no incidents resulting from change requests to this service.</p>";
		}
		else
		{
				$strHTML_7 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_7 .= "<p><b>List of Incident records</b></p>";
					$strHTML_7 .= "<table border='2'";
						$strHTML_7 .= "<tr>";
							$strHTML_7 .= "<th>Incident Reference</th>";
							$strHTML_7 .= "<th>Summary</th>";
							$strHTML_7 .= "<th>Profile</th>";
							$strHTML_7 .= "<th>Within Fix</th>";
							$strHTML_7 .= "<th>Logged On</th>";
						$strHTML_7 .= "</tr>";
						for ($i=0; $i<$length; $i++)
						{
						$strHTML_7 .= "<tr>";
							$strHTML_7 .= "<td>".swcallref_str($arrCallref[$i])."</td>";
							$strHTML_7 .= "<td>".$arrTitle[$i]."</td>";
							$strHTML_7 .= "<td>".$arrProbcode[$i]."</td>";
							$strHTML_7 .= "<td>".$arrNewWithinfix[$i]."</td>";
							$strHTML_7 .= "<td>".gmdate("Y-m-d", $arrLogdatex[$i])."</td>";
						$strHTML_7 .= "</tr>";
						}
					$strHTML_7 .= "</table>";
				$strHTML_7 .= "</div>";	
			$strHTML_7 .= "<br>";	
			$strHTML_7 .= "<div style='border: solid 1px #123456; padding: 10px; margin: 10px'>";
				$strHTML_7 .= "<p><b>Overview of Incidents</b></p>";
				$strHTML_7 .= "<p>Total number of Incidents: ".$length."</p>";
				$strHTML_7 .= "<p>Total number of Incidents within fix: ".$intTotalWithin."</p>";
			$strHTML_7 .= "</div>";
		}
		return $strHTML_7;
	}
	
	
?>
<link href="../../common/css/elements.css" rel="stylesheet" type="text/css" />
<link href="../../common/css/panels.css" rel="stylesheet" type="text/css" />
<link href="../../common/css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="../../common/css/redmond/jquery-ui-1.8.22.custom.css" rel="stylesheet" type="text/css"/>
<script type="text/javascript" src="../../common/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="../../common/js/jquery-ui-1.8.19.custom.min.js"></script>
<script type="text/javascript" src="../../common/js/portal.control.js"></script>
<script type="text/javascript" src="../../common/js/xmlhttp.control.js"></script>
<script type="text/javascript" src="../../common/js/report.control.js"></script>
<script language="JavaScript" src="../../../../clisupp/fce/FusionCharts.js"></script>

</head>
<body style="min-width:240px;">
<style>
table
{
	border-collapse:collapse;
}
table,th, td
{
border: 1px solid black;
}

</style>
<div class="boxWrapper" id="contentColumn" >
	<img src="../../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/>
	<div class="boxMiddle">
		<div class="boxContent">
			<h2>Services Reporting</h2>
			<p>This report provides various sets of information from the selected Service Portfolio.<p>
				<br>
				<h3>Availability Times</h3>
				<?php echo getAvailabilityTimes($CI_ID);?>
				<br>
				<h3>Availability Information</h3>
				<?php echo getOverviewAvailabilityInfo($CI_ID, $date_from, $date_to);?>				
				<br>
				<?php echo getListAvailabilityInfo($CI_ID, $date_from, $date_to);?>
				<br>
				<h3>Raised Incidents</h3>
				<?php echo getIncidentsAgainstService($CI_ID, $date_from, $date_to);?>
				<br>
				<h3>Raised Change Requests</h3>
				<?php echo getChangesAgainstService($CI_ID, $date_from, $date_to);?>
				<br>
				<h3>Raised Service Requests</h3>
				<?php echo getServiceRequestsAgainstService($CI_ID, $date_from, $date_to);?>
				<br>
				<h3>Incidents resulting from Change Requests to the Service</h3>
				<?php echo getIncidentsResultingChangesAgainstService($CI_ID, $date_from, $date_to);?>
				<br>
				<h3>Blackout Periods</h3>
				<?php echo getBlackoutPeriods($CI_ID, $date_from, $date_to);?>

			<!-- end of box content -->
			<div id="SR" align="center" style="width:96%;"></div>
			<div class="spacer"></div></div>
	</div>
	<div class="boxFooter" style="height:9px;" ><img src="../../common/img/structure/box_footer_left.gif" width="6" height="9" border="0"/>
	</div>
</div>
</body>
</html>