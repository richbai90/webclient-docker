<?php 	//-- NWJ - load xml file based on input $name
	//-- include common functions

	//-- Include our standard include functions page
	include('itsmf/xmlmc/classactivepagesession.php');
	include('itsmf/xmlmc/common.php');
	include('itsmf/xmlmc/classreport.php');

	$arrNextTrend = array("Quarter"=>"Monthly","Monthly"=>"Weekly","Weekly"=>"Daily","Daily"=>"Hourly");

	$boolUseFormsInActivePageLinks=1;
	$arrReportCriteria = Array();
	$db = new CSwDbConnection;
	$db->SwDataConnect();
	 
	$arrReportCriteria['db_type'] = $db->get_database_type();
	//-- get passed in form data
	//-- loop through posted vars and id each question

	foreach ($_REQUEST as $key => $val)
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


