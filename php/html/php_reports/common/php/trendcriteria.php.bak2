<?php 	//-- NWJ - load xml file based on input $name
	//-- include common functions
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/common.php');

	//	error_reporting(E_ERROR | E_PARSE );

	//-- Construct a new active page session
	$session = new classActivePageSession(gv('sessid'));

	//-- Initialise the session
	if(!$session->IsValidSession()){
	}

	include('itsmf/xmlmc/classreport.php');
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
<script type="text/javascript">
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

<?php 	
	echo $outputVars;
?>

	function get_dateinput(e)
	{
		if (!e) var e = window.event; //-- ie
		//-- cancel bubbling
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();

		var oEle = getEventSourceElement(e);

		currDateFocus = oEle;

		show_date(e,paste_date);

	}
	
	function paste_date(aDate)
	{
		hide_date();
		currDateFocus.setAttribute("dbvalue",date_epoch(aDate));
		currDateFocus.value = date_ddmmyyyy(aDate);
	}
</script>

<link href="../common/css/elements.css" rel="stylesheet" type="text/css" />
<link href="../common/css/panels.css" rel="stylesheet" type="text/css" />
<link href="../common/css/structure_ss.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../common/js/portal.control.js"></script>
<script type="text/javascript" src="../common/js/xmlhttp.control.js"></script>
<script type="text/javascript" src="../common/js/date.control.js"></script>
<script type="text/javascript" src="../common/js/report.control.js"></script>


<body>
<div class="boxWrapper" id="contentColumn" ><img src="../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/><div class="boxMiddle">
			<div class="boxContent">
				<h2><?php echo $oReport->get_title();?> - Criteria</h2>
				<form id="reportform" action="../common/php/runReport.php">
					<?php echo  $strReportInputHTML;?>

					<input type="hidden" id="reportname" value="<?php echo $xmlReportFile;?>">
				</form>
				<?php 				if(!$boolError)
				{

				?>

					<table>
						<tr>
							<td align="left">
								<input type="button" id="btn_submit" onclick="if(check_dates())app.submit_form('reportform');"  value="Submit Report" class="buttonNext" style="font-size:125%;" />
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


<iframe id="date-picker-shimer" class="calendar-shimer" style="display:none;""></iframe>
 
<div id="date-picker" class="calendar-holder" style="display:none;">
 <table class="calendar-bar" width="20%">
  <tr>
   <td onClick="prev_year()" title="back a year">
    <img src="../common/img/arr_ll.gif"></img>
   </td>
   <td onClick="prev_month()" title="back a month">
    <img src="../common/img/arr_left.gif"></img>
   </td>
   <td width="100%">
    <span id="cal_date"></span>
   </td>
   <td  onClick="next_month()" title="forward a month">
    <img src="../common/img/arr_right.gif"></img>
   </td>
   <td onClick="next_year()" title="forward a year">
    <img src="../common/img/arr_rr.gif"></img>
   </td>
  </tr>
 </table>
 <div id="date-picker-days">
  <table class="calendar-table" onClick="select_day(event)" onmouseover="hover_in_day(event)" onmouseOut="hover_out_day(event)" border=0 cellspacing=0 cellpadding=0>
  </table>
 </div>
</div>
</body>
</html>

