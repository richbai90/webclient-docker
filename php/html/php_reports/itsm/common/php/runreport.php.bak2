<?php 	//-- NWJ - load xml file based on input $name
	//-- include common functions
	//-- Include our standard include functions page
	include('itsm_default/xmlmc/classactivepagesession.php');
	include('itsm_default/xmlmc/common.php');
	include("../../../../reports/rpt_incl_config.php");
	include('itsm_default/xmlmc/classknowledgebase.php');
	include('itsm_default/xmlmc/classreport.php');

	$isCSV = ($_GET["CSV"]) ? true : false;


	$test = gvs('sessid');
	//-- Construct a new active page session
	$session = new classActivePageSession($test);

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
		$notFoundTable = true;
		$notFoundCol = true;
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
			
			//In case choosing the CSV option, we ask for the content. If not we have proceed as it was
			if ($isCSV)
				$CSV_Content=$oReport->perform_trend_search($arrReportCriteria,1,$arrReportCriteria['mainreport_orderbycol'],$arrReportCriteria['mainreport_orderdir'], $isCSV);
			else{
				if($arrReportCriteria['trend_value']!="Hourly" && !$oReport->single_trending()){
					//$oReport = new classTrendReport;
					//$oReport->load_report($xmlReportFile);
					$strReportOutputHTML = $oReport->perform_trend_search($arrReportCriteria,1,$arrReportCriteria['mainreport_orderbycol'],$arrReportCriteria['mainreport_orderdir'], $isCSV);
				}
				else{
					$strReportOutputHTML .='<div id=\'testing\' style="clear:left;width: 95%; overflow:hidden;display:inline;float:right; ">';
					$strReportOutputHTML .=	$oReport->perform_trend_search($arrReportCriteria,1,$arrReportCriteria['mainreport_orderbycol'],$arrReportCriteria['mainreport_orderdir'], $isCSV);
					$strReportOutputHTML .='</div>';
				}
			}
		}

		else
		{

			if ($isCSV)
				$CSV_Content=$oReport->perform_search($arrReportCriteria,1,$arrReportCriteria['mainreport_orderbycol'],$arrReportCriteria['mainreport_orderdir'], $isCSV);
			else
				$strReportOutputHTML .= $oReport->perform_search($arrReportCriteria,1,$arrReportCriteria['mainreport_orderbycol'],$arrReportCriteria['mainreport_orderdir'], $isCSV);
		}
		$strReportGraphOutput = $oReport->create_graph();
	}
	else
	{
		$boolError=true;
		$strReportOutputHTML = "ERROR:Failed to load report (".$xmlReportFile."). Please contact your supportworks administrator.";
	}


if (!$isCSV){

?>



<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<script type="text/javascript" src="../common/js/portal.control.js"></script>

<body>
<form id="reportform" method="get" name="reportform" action="../common/php/runReport.php">
	<input type="hidden" id="mainreport_orderdir" value="<?php echo gv('mainreport_orderdir');?>">
	<input type="hidden" id="mainreport_orderbycol" value="<?php echo gv('mainreport_orderbycol');?>">
	<?php 	foreach($arrReportCriteria as $key=>$val){
		echo '<input type="hidden" id="'.str_replace(".","..",$key).'" value="'.$val.'">';
	}
	?>
</form>


<div class="boxFooter"><div class="boxContent_reportresult" ><img src="../common/img/structure/box_header_left.gif" width="6" height="9" alt="" border="0"/><div class="boxMiddle"><div style="margin:0px 20px 0px 20px;"><!-- box content --><h2 style="width:100%;"><?php echo $oReport->get_title();?> - Results</h2>
			<p>
			<?php echo  $strReportGraphOutput;?>
			</p>
			<div><?php echo  $strReportOutputHTML;?><div class="spacer">&nbsp;</div></div>&nbsp;</div></div></div><?php 

	$oReport = null;
?>
<div class="boxFooter"><img src="../common/img/structure/box_footer_left.gif"/></div>
</div>

</body>
</html>

<?php
}

else
	{
		$fileName = $_SERVER['REQUEST_URI'];
		$last_slash = strrpos($fileName, "/");
		
		$fName = substr($fileName,$last_slash+1);
		$ampersand_position = strpos($fName, ".");
		$fName = substr($fName,0,$ampersand_position);		
		$fName.='.csv'; 

		
		$csv_document = explode("\r\n", $CSV_Content);

		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header('Content-Description: File Transfer');
		header("Content-type: text/csv");
		header("Content-Disposition: attachment; filename={$fName}");
		header("Expires: 0");
		header("Pragma: public");


		$fh = fopen( 'php://output', 'w' );
		fwrite($fh,$CSV_Content);
		fclose($fh);

		exit();
		/*$fileName = $_SERVER['REQUEST_URI'];
		$last_slash = strrpos($fileName, "/");
		
		$fName = substr($fileName,$last_slash+1);
		$ampersand_position = strpos($fName, ".");
		$fName = substr($fName,0,$ampersand_position);		
		$fName.='.csv'; 

		$csv_document = explode("\r\n", $CSV_Content);

		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header('Content-Description: File Transfer');
		header("Content-type: text/csv");
		header("Content-Disposition: attachment; filename={$fName}");
		header("Expires: 0");
		header("Pragma: public");

		$fh = fopen( 'php://output', 'w' );

		$headerDisplayed = false;

		foreach($csv_document as $line) {
			$line = explode(",", $line);
			fputcsv($fh, $line);
		}
		fclose($fh);*/
	}
?>