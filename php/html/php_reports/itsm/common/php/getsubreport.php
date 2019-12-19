<?php 	//-- NWJ - load xml file based on input $name
	//-- include common functions

	//-- Include our standard include functions page
	include('itsm_default/xmlmc/classactivepagesession.php');
	include('itsm_default/xmlmc/common.php');
	include('itsm_default/xmlmc/classreport.php');
	include('itsm_default/xmlmc/classknowledgebase.php');

	$arrNextTrend = array("Quarter"=>"Monthly","Monthly"=>"Weekly","Weekly"=>"Daily","Daily"=>"Hourly");

	$sessid = gvs('sessid');
	//-- Construct a new active page session
	$session = new classActivePageSession($sessid);

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
	<?php 		exit;
	}

	$boolUseFormsInActivePageLinks=1;
	$arrReportCriteria = Array();
	$db = new CSwDbConnection;
	$db->SwDataConnect();
	 
	$arrReportCriteria['db_type'] = $db->get_database_type();
	//-- get passed in form data
	//-- loop through posted vars and id each question
	foreach ($_GET as $key => $val)
	{
		//echo 'Key = '.$key.', Value = '.$val."<br>";
		//-- check if we need to split data
		if(strpos($val,ANSWER_SPLIT)!==false)$val = str_replace(ANSWER_SPLIT," and ",$val);

		if(strpos($key,"__")!==false){
			$key = substr_replace($key,".",strpos($key,"__"),2);
			$arrReportCriteria[$key] = stripslashes($val);
		}else
			$arrReportCriteria[$key] = stripslashes($val);
	}

	$xmlReportFile = gvs("reportname");

	//-- create new report class
	$boolError=false;
	$oReport = new classReport;

	if($oReport->load_report($xmlReportFile))
	{

		//-- report xml loaded ok - construct select statement and out put results
		if($oReport->isTrendingReport()){
			if($arrReportCriteria['level']==0 && !$oReport->single_trending())
			{
				$arrReportCriteria['trend_value']=$arrNextTrend[$arrReportCriteria['trend_value']];
				$arrReportCriteria['table_pass'] = $arrReportCriteria['table_pass']."_2_";
				$strReportOutputHTML = $oReport->perform_trend_search($arrReportCriteria,$arrReportCriteria['level']+1,$mainreport_orderbycol,$mainreport_orderdir);
			}else{
				$strReportOutputHTML = $oReport->perform_search($arrReportCriteria,$arrReportCriteria['level']+1,$orderbycol,$orderbydir);
			}
		}else
		{
			$strReportOutputHTML = $oReport->perform_search($arrReportCriteria,$arrReportCriteria['level']+1,$orderbycol,$orderbydir);
		}
	}
	else
	{
		$boolError=true;
		$strReportOutputHTML = "ERROR:Failed to load reports sub data. Please contact your supportworks administrator.";
	}
?>

<?php echo  $strReportOutputHTML;?>


