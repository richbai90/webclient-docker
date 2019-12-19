<?php
	//error_reporting(E_ALL);
	//-- Include our standard include functions page
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	
	include_once("../../../../reports/rpt_incl_config.php");
	include_once('itsm_default/xmlmc/classknowledgebase.php');
	include_once('itsm_default/xmlmc/classreport.php');

	$test = $_POST['sessid'];
	//-- Construct a new active page session
	$session = new classActivePageSession($test);
	$categoriesXML = '';
	$DataXML = '';
	$processXML = '';
	$arrSLATarg = '';
	//-- Initialise the session
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


	//-- Post Varibles
	$type = $_POST['type'];
	//echo $_POST['date_from'];
	//echo $_POST['date_to'];
	//-- From Variables
	list($month, $year) = explode('-', $_POST['date_from']);
	$from_month = $month;
	$from_year= $year;
	$from = mktime(0, 0, 0, ltrim($month, "0"), 1, $year);
	
	//-- To Variables
	list($month, $year) = explode('-', $_POST['date_to']);
	$to_month = $month;
	$to_year= $year;
	$to = (mktime(0, 0, 0, ($month+1), $day, $year)) - 1;
	//-- SLA Variables
	$sla = $_POST['sla'];

	//-- Validate Dates
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
							You must enter both a start and end date.<P>
							<input type="button" value="Back" onclick="goBack()">
							
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	if($from > $to)
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
							You must enter start date before an end date.<P>
							<input type="button" value="Back" onclick="goBack()">
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	if(($to - $from) > 31536000)
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
	
	//-- DB Connection
	$reportODBC = new CSwDbConnection;;
	$strDSN = swdsn();
	$strUID = swuid();    
	$strPWD = swpwd();
	$boolConnected = $reportODBC->Connect($strDSN,$strUID,$strPWD);
	
	//-- Work Out How Many Months to Build the Report for
	$Month=0;
	$arrDate = '';
	if(($from_month == $to_month) && ($from_year == $to_year))
	{
		//-- Store Values for Later
		$arrDate[$from_year][$from_month] = '';
		$to_month++;
	}else
	{
		$count_year = $from_year;
		$count_month = $from_month;
		
		if($count_year < $to_year)
		{
			while($count_month <= 12)
			{
				$arrDate[$count_year][$count_month] = '';
				$count_month ++;
			}
			$count_month = 1;
			$count_year ++;
			while($count_month <= $to_month)
			{
				$arrDate[$count_year][$count_month] = '';
				if($count_month < 12)
				{
					$count_month ++;
				}else
				{
					$count_year ++;
					$count_month = 1;
				}
				$Month++;
			}
		}else
		{
			while(($count_month <= $to_month)&&($count_year <= $to_year))
			{

				$arrDate[$count_year][$count_month] = '';
				if($count_month < 12)
				{
					$count_month ++;
				}else
				{
					$count_year ++;
					$count_month = 1;
				}
				$Month++;
			}
		}
	
	}
	build_data();
	
	function build_categories($month, $year)
	{
			global $categoriesXML,$arrHist;
			$month = ltrim($month, "0");
			
			if($arrHist[$year][$month] == 'saved')
			{
				return true;
			}else{
				$arrHist[$year][$month] = 'saved';
				$categoriesXML .= "<category start='1/".$month."/".$year."' end='1/".($month + 1)."/".$year."' name='".$monthName = date("F", mktime(0, 0, 0, $month, 10))."' />";
			}
	}
	
	function build_data()
	{
			global $DataXML, $processXML, $reportODBC, $sla, $arrDate, $SLA_NAME, $run_once, $ran, $arrSLATarg, $arrSLAAgree,$end_month,$end_year,$key,$year;
			//-- Get Services Associated to SLA
			$strSQL = "select * from sc_sla inner join config_itemi ON config_itemi.pk_auto_id = sc_sla.fk_service where sc_sla.fk_sla = '".pfs($sla)."' and ck_config_type = 'ME->SERVICE'";
			$recSet = $reportODBC->Query($strSQL,true); //-- select and return recset
			while(!$recSet->eof) 
			{
				$arrID[$recSet->xf('fk_service')] = $recSet->xf('fk_service');
				$SLA_NAME = $recSet->xf('fk_sla_name');
				$arrSLATarg[$SLA_NAME][$recSet->xf('fk_service')]=$recSet->xf('dt_target');
				$arrSLAAgree[$SLA_NAME][$recSet->xf('fk_service')]=$recSet->xf('dt_agreed');
				$recSet->movenext();
			}
			foreach ($arrID as $ci => $value) {
				//-- Get Main CI Record
				$strSQL = "select * from config_itemi left JOIN sc_folio on config_itemi.pk_auto_id = sc_folio.fk_cmdb_id where pk_auto_id = '".pfs($ci)."'";
				$recSet = $reportODBC->Query($strSQL,true); //-- select and return recset
				while(!$recSet->eof) 
				{
					$arrCI[$recSet->xf('pk_auto_id')] = $recSet->xf('vsb_title');
					$recSet->movenext();
				}
			}
			
			foreach($arrCI as $CI_ID => $CI_NAME)
			{
				$processXML .= "<process Name='".$CI_NAME."' id='".$CI_ID."'  />";
				//-- Build Categories for Each Month
				foreach ($arrDate as $year => $month) 
				{
					foreach ($month as $key => $val) 
					{
						build_categories($key, $year);
		
						$downtime = get_downtime($CI_ID, $key, $year);		
						$sla_target = $arrSLATarg[$SLA_NAME][$CI_ID];
						$sla_agreed = $arrSLAAgree[$SLA_NAME][$CI_ID];
						$covnersion = 0.0166667;
						if(($downtime*0.0166667) <= $sla_target)
						{
							if($key == 12)
							{
								$end_month = 1;
								$end_year = $year +1;
							}else
							{
								$end_month = $key + 1;
								$end_year = $year;
							}
							//-- Build Green Bar for the Month
							$DataXML .= "<task name='Down for ".round(($downtime*$covnersion))." Hours' processId='".$CI_ID."' start='1/".$key."/".$year."' end='1/".$end_month."/".$end_year."' taskId='".$CI_ID."' borderColor='8BBA00' color='8BBA00' height='12'/>";
						}
						if(($downtime*0.0166667) > $sla_target)
						{
							if($key == 12)
							{
								$end_month = 1;
								$end_year = $year +1;
							}else
							{
								$end_month = $key + 1;
								$end_year = $year;
							}
							//-- Build amber Bar for the Month
							$DataXML .= "<task name='Down for ".round(($downtime*$covnersion))." Hours' processId='".$CI_ID."' start='1/".$key."/".$year."' end='1/".$end_month."/".$end_year."' taskId='".$CI_ID."' borderColor='F6BD0F' color='F6BD0F' height='12'/>";
						}
						if(($downtime*0.0166667) > $sla_agreed)
						{
							if($key == 12)
							{
								$end_month = 1;
								$end_year = $year +1;
							}else
							{
								$end_month = $key + 1;
								$end_year = $year;
							}
							//-- Build Red Bar for the Month
							$DataXML .= "<task name='Down for ".round(($downtime*$covnersion))." Hours' processId='".$CI_ID."' start='1/".$key."/".$year."' end='1/".$end_month."/".$end_year."' taskId='".$CI_ID."' borderColor='FF654F' color='FF654Fs' height='12'/>";
						}
					}
				}
			}
	}
	function get_downtime($pk_id, $month, $year)
	{
		global $reportODBC, $arrSLATarg, $arrSLAAgree, $SLA_NAME;
		$var = 0;
		$time_down=0;
		$from = mktime(0, 0, 0, ltrim($month, "0"), 1, $year);
		$to = mktime(0, 0, 0, (ltrim($month, "0")+1), 1, $year);
		$strSQL = "select * from ci_avail_hist where fk_ci_id = '".pfs($pk_id)."' and startedonx >= ".pfs($from)." and endedonx <= ".pfs($to)."";
		$recSet = $reportODBC->Query($strSQL,true); //-- select and return recset
		$sla_target = $arrSLATarg[$SLA_NAME][$pk_id];
		$sla_agreed = $arrSLAAgree[$SLA_NAME][$pk_id];
		while(!$recSet->eof) 
		{
			$time_down = $time_down + $recSet->xf('minutesdown');
			$recSet->movenext();
		}

		if(($time_down*0.0166667) > $sla_target)
		{
			$var = 1;
		}
		if(($time_down*0.0166667) > $sla_agreed)
		{
			$var = 2;
		}
		return $time_down;
	}
	//-- Graph Output
	$strGraphXML = "<graph ganttWidthPercent='80' canvasBgColor='f1f1ff' dateFormat='dd/mm/yyyy' ganttLineColor='0372AB' ganttLineAlpha='8' gridBorderColor='FFFFFF' hoverCapBorderColor='0372AB' hoverCapBgColor='e1f5ff'>";
	$strGraphXML .= "<categories bgColor='0372ab' alpha='' font='' fontColor='ff0000' fontSize=''>";
	$strGraphXML .= "<category start='1/".$from_month."/".$from_year."' end='1/".$end_month."/".$end_year."' align='center' name='Service Level Agreement Monitoring (".$SLA_NAME.") 1-".ltrim($from_month, "0")."-".$from_year." to 1-".$end_month."-".$end_year."'  alpha='' font='Verdana' fontColor='ffffff' isBold='1' fontSize='16' />";
	$strGraphXML .= "</categories>";
	$strGraphXML .= "<categories  alpha='' font='Arial' fontColor='000000' fontSize='14' isBold='1'>";
	$strGraphXML .= $categoriesXML;
	$strGraphXML .= "</categories>";
	$strGraphXML .= "<processes headerText='Service' font='' fontColor='ffffff' fontSize='14' isBold='1' isAnimated='1' bgColor='0372AB' headerbgColor='0372AB' headerFontColor='FFFFFF' headerFontSize='16'>";
	$strGraphXML .= $processXML;
	$strGraphXML .= "</processes>";
	$strGraphXML .= "<dataTable showProcessName='1' nameAlign='left' headerFontColor='ffffff' headerFontSize='16' headerFontIsBold='1'>";
	$strGraphXML .= "</dataTable>";
	$strGraphXML .= "<tasks  color='' alpha='' font='' fontColor='' fontSize='' isAnimated='1'>";
	$strGraphXML .= $DataXML;
	$strGraphXML .= "</tasks>";
	$strGraphXML .= "</graph>";
?>
<link href="../css/elements.css" rel="stylesheet" type="text/css" />
<link href="../css/panels.css" rel="stylesheet" type="text/css" />
<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="../css/redmond/jquery-ui-1.8.22.custom.css" rel="stylesheet" type="text/css"/>
<script type="text/javascript" src="../js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="../js/jquery-ui-1.8.19.custom.min.js"></script>
<script type="text/javascript" src="../js/portal.control.js"></script>
<script type="text/javascript" src="../js/xmlhttp.control.js"></script>
<script type="text/javascript" src="../js/report.control.js"></script>
<script language="JavaScript" src="../../../../clisupp/fce/FusionCharts.js"></script>


<script>
	var fcRequestCount;
	function initialise_charts()
	{
		if(iCurrWidth == document.body.clientWidth) return;
		iCurrWidth = document.body.clientWidth;

		//--- my call status (all call classes)
		var oDivHolder = document.getElementById("SLAM");
		if(oDivHolder)
		{
			if(!fcRequestCount)
			{
				//initialise
				fcRequestCount = new FusionCharts("../../../../clisupp/fwe/Gantt.swf", "SLAM_CHART", oDivHolder.clientWidth, "400");
			}
			else
			{
				//-- Else the object is set to set the new width that will be beign called by resize_charts()
				fcRequestCount.width = oDivHolder.clientWidth;
			}
			fcRequestCount.autoInstallRedirect = false;
			fcRequestCount.setDataXML("<?php echo $strGraphXML;?>");	
			if(!fcRequestCount.render("SLAM"))
			{
				//-- show message in div, no need for link as should default to js
				oDivHolder.innerHTML = "Failed to load chart"; //-- TK oDiv renamed oDivHolder 
			}
		}
	}


	var iCurrWidth = 0;
	function resize_charts()
	{
		setTimeout("initialise_charts()",100);
	}

</script>

<body onload="initialise_charts();" onresize="resize_charts();" style="min-width:240px;">
<div class="boxWrapper" id="contentColumn" >
	<img src="../img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/><div class="boxMiddle"><div class="boxContent">
			<h2>Service Level Agreement Monitoring - Results</h2>
			
		
			<div id="SLAM" align="center" style="width:96%;"></div>
			<div class="spacer"></div></div>
				<div class="spacer">&nbsp;
				</div>
		</div>
		<div class="boxFooter" style="height:9px;" ><img src="../img/structure/box_footer_left.gif" width="6" height="9" border="0"/></div></div>

</body>
</html>

