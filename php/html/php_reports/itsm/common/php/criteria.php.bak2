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
	$_SESSION['sessid'] = gv('sessid');

	include('itsm_default/xmlmc/classreport.php');
	//In the client hard code the report

	$session = new classActivePageSession(gv('sessid'));
	if(!$session->IsValidSession()){
	}
	//-- create new report class
	$boolError=false;
	$oReport = new classReport();
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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
			if(thisEle.getAttribute('intype')=="daterange"){
				if(thisEle.getAttribute('value')!="")
				{
					if(thisEle.getAttribute('dbvalue')==undefined)
					{
						if(arrValues[0]==thisEle.id)
							arrValues[0]=null;
						else
							arrValues.push(thisEle.id);
					}
				}
			}
		}
		if(arrValues[0]==undefined)
			return true;
		alert('Please input a pair of values for the date range.');
		return false;
	}
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
<?php 
	//If there is no criteria, attempt submit report immediately
	if($strReportInputHTML=="")
		$onLoadText = "app.submit_form('reportform');";
	else
		$onLoadText = "";
?>
<script type="text/javascript">
	setup_datepickers();

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

		var form_content="";
		var oForm =document.forms["reportform"];
		var input_id;
		var value_form;
		var condition=0;

		//In case all the obligated fields are populated
		if (check_dates()){
				for (var i=0; i<oForm.length; i++){
					input_id = oForm[i].id;
					value_form = oForm[i].value;

					if (input_id=="CSV")
						continue;

						//Passing the date to epoch value
					if (input_id=="opencall__logdatex" || input_id=="opencall__logdatex__1"){
						help_date = parseISO8601(value_form);
						if (isNaN(help_date)){
							continue;
						}
						else {
							 var strCurrentEpoch = Math.floor(help_date.getTime()/1000);
							 value_form = strCurrentEpoch;
							 }
					}

					form_content += input_id + "="+value_form + "&";
				}
			window.location = "../common/php/runReport.php?reportname="+encodeURI("<?php echo $oReport->xmlFileName;?>")+"&"+form_content+"CSV=true";
		}

	}  
</script>

</head>

<body onload="<?php echo $onLoadText?>">
<div class="boxWrapper" id="contentColumn" >
	<img src="../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/><div class="boxMiddle"><div class="boxContent">
				<h2><?php echo $oReport->get_title();?> - Criteria</h2>
				<form id="reportform" name="reportform" action="../common/php/runReport.php">
					<?php echo  $strReportInputHTML;?>

					<input type="hidden" id="reportname" value="<?php echo $oReport->xmlFileName;?>">
					<input type="hidden" id="CSV">
				</form>
				<?php 				if(!$boolError)
				{

				?>

					<table>
						<tr>
							<td align="left">
								<input type="button" id="btn_submit" onclick="if(check_dates())app.submit_form('reportform');"  value="Submit" class="buttonNext" style="font-size:125%;" />
							</td>

							<td align="right">
								<input type="button" id="btn_excell" onclick="return getOutput();"  value="Export Data" class="buttonNext" style="font-size:125%;" />
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
		</div>
		<div class="boxFooter" style="height:9px;" ><img src="../common/img/structure/box_footer_left.gif" width="6" height="9" border="0"/></div></div>

</body>
</html>
