<?php 	//-- NWJ - load xml file based on input $name
	//-- include common functions
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');

	//	error_reporting(E_ERROR | E_PARSE );

	//-- Construct a new active page session
	$session = new classActivePageSession(gv('sessid'));

	//-- Initialise the session
	if(!$session->IsValidSession()){
	}

	include('itsm_default/xmlmc/classreport.php');
	//In the client hard code the report

	$session = new classActivePageSession(gv('sessid'));
	if(!$session->IsValidSession()){
	}
	$_SESSION['sessid'] = gv('sessid');

	//-- create new report class
	$boolError=false;
	$oReport = new classTrendReport();
	if($oReport->load_report($xmlReportFile))
	{
		//-- report xml loaded ok
		$strReportInputHTML = $oReport->output_input();
	}
	else
	{
		$boolError=true;
		$strReportInputHTML = "ERROR:Failed to load report (".$xmlReportFile."). Please contact your supportworks administrator.";
	}	
	$oClass = new CSwDbConnection;
	$databasetype = $oClass->get_database_type();

?>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" >
<script type="text/javascript">
	var strDateFmt = "<?php echo ComCtrl32Format_To_JsFormat($GLOBALS['datefmt']);?>";
	var dbtype = "<?php echo $databasetype;?>";

	function check_dates(){
		var msg ="";
		var arrEle = document.getElementsByTagName("input")
		var arrValues = new Array();
		for(var i=0;i<arrEle.length;i++)
		{
			var thisEle = arrEle[i];
			if(thisEle.intype=="daterange"){
				arrValues.push(thisEle.dbvalue);
			}
		}
		var elemen = document.getElementById('trend_value');

		if(elemen.value=="Hourly"&&(arrValues[1]-arrValues[0])>86400)
			msg='You have selected greater than a day for this hourly report. Continue?';
		if(elemen.value=="Daily"&&(arrValues[1]-arrValues[0])>604800)
			msg='You have selected greater than a week for this daily report. Continue?';
		if(elemen.value=="Weekly"&&(arrValues[1]-arrValues[0])>2678400)
			msg='You have selected greater than a month for this weekly report. Continue?';
		if(elemen.value=="Monthly"&&(arrValues[1]-arrValues[0])>8035200)
			msg='You have selected greater than a quarter for this monthly report. Continue?';
		if(elemen.value=="Quarter"&&(arrValues[1]-arrValues[0])>31556926)
			msg='You have selected greater than a year for this quarterly report. Continue?';
		if(msg=="")
			return true;
		return confirm(msg);
	}

	 function parseISO8601(dateStringInRange) {
	    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
	        date = new Date(NaN), month,
	        parts = isoExp.exec(dateStringInRange);

	    if(parts) {
	      month = +parts[2];
	      date.setFullYear(parts[1], month - 1, parts[3]);
	      if(month != date.getMonth() + 1) {
	        date.setTime(NaN);
	      }
	    }
	    return date;
	  }

	function getOutput() {

		var pre_content="";
		var form_content="";
		var oForm =document.forms["reportform"];
		var input_id;
		var value_form;

		/*for (var i=0; i<oForm.length; i++){
			if (oForm[i].id=="CSV")
				oForm[i].value=true;
		}

		app.submit_form('reportform');*/
		var form_content="";
		var oForm =document.forms["reportform"];
		var input_id;
		var value_form;
		var condition=0;

		//In case all the obligated fields are populated
		if (get_form_url_data(oForm) && check_dates()){
				for (var i=0; i<oForm.length; i++){
					input_id = oForm[i].id;
					value_form = oForm[i].value;

					if (input_id=="CSV")
						continue;

						//Passing the date to epoch value
					if (input_id=="opencall__logdatex" || input_id=="opencall__logdatex__1"){
						help_date = parseISO8601(value_form);
						var strCurrentEpoch = Math.floor(help_date.getTime()/1000);
						value_form = strCurrentEpoch;
					}

					form_content += input_id + "="+value_form + "&";
				}
			window.location = "../common/php/runReport.php?reportname="+encodeURI("<?php echo $oReport->xmlFileName;?>")+"&"+form_content+"CSV=true";
		}

	}

<?php 	
	echo $outputVars;
?>
</script>

<link href="../common/css/elements.css" rel="stylesheet" type="text/css" />
<link href="../common/css/panels.css" rel="stylesheet" type="text/css" />
<link href="../common/css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="../common/css/redmond/jquery-ui-1.8.22.custom.css" rel="stylesheet" type="text/css"/>
<script type="text/javascript" src="../common/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="../common/js/jquery-ui-1.8.19.custom.min.js"></script>
<script type="text/javascript" src="../common/js/portal.control.js"></script>
<script type="text/javascript" src="../common/js/xmlhttp.control.js"></script>
<script type="text/javascript" src="../common/js/report.control.js"></script>
<script type="text/javascript">
	setup_datepickers();
</script>

</head>

<body>
<div class="boxWrapper" id="contentColumn" ><img src="../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/><div class="boxMiddle">
			<div class="boxContent">
				<h2><?php echo $oReport->get_title();?> - Criteria</h2>
				<form id="reportform" action="../common/php/runReport.php">
					<?php echo  $strReportInputHTML;?>

					<input type="hidden" id="reportname" value="<?php echo $oReport->xmlFileName;?>">
					<input type="hidden" id="CSV">
				</form>
				<?php 				
				if(!$boolError){
				?>

					<table>
						<tr>
							<td align="left">
								<input type="button" id="btn_submit" onclick="if(check_dates())app.submit_form('reportform');"  value="Submit Report" class="buttonNext" style="font-size:125%;" />
							</td>
							<td align="right">
								<input type="button" id="btn_submit" onclick="getOutput();"  value="Export Data" class="buttonNext" style="font-size:125%;" />
							</td>
						</tr>
					</table>
				<?php 				}

				$oReport = null;


				?>

				<!-- end of box content -->
				<div class="spacer">&nbsp;
				</div>
			</div>
		</div><div class="boxFooter" style="height:8px;" ><img src="../common/img/structure/box_footer_left.gif" width="6" height="9" border="0"/></div></div>

</body>
</html>

