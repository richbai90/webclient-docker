<?php
	//ES - F0112388 - This script to get all services from sc_folio and enable users to select a date and service before submitting query. The results is then passed onto runSRReport.php
	function select_service()
	{	
		if($_GET['sessid'])
		{
			session_start();
			$_SESSION['portalmode'] = "FATCLIENT";

			// include our standard include functions page
			include_once('itsm_default/xmlmc/classactivepagesession.php');
			include_once('itsm_default/xmlmc/common.php');
			$session = new classActivePageSession($_GET['sessid']);
			// initialise the session
			if(!$session->IsValidSession())
			{
					return "";
			}else
			{
				$reportODBC = new CSwDbConnection;;
				$strDSN = swdsn();
				$strUID = swuid();    
				$strPWD = swpwd();
				$boolConnected = $reportODBC->Connect($strDSN,$strUID,$strPWD);
				$strSQL = "select vsb_title from sc_folio, config_itemi where appcode = '".pfs($GLOBALS['dd'])."' and sc_folio.fk_cmdb_id = config_itemi.pk_auto_id and isactivebaseline = 'Yes'";
				$recSet = $reportODBC->Query($strSQL,true);
				$returnHTML = "";
				while(!$recSet->eof) 
				{
					$returnHTML .= "<option value='".$recSet->xf('vsb_title')."'";
					$returnHTML .= ">".$recSet->xf('vsb_title')."</option>\n";
					$recSet->movenext();
				}
				return $returnHTML;
			}
		}	
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" >
	<script type="text/javascript"> 
		var strDateFmt = "yy-mm-dd";
		var dbtype = "swsql";
	 
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
<div class="boxWrapper" id="contentColumn" >
	<img src="../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/>
	<div class="boxMiddle">
		<div class="boxContent">
			<h2>Services Reporting</h2>
			<form id="reportform" name="reportform" method="post" action="../common/php/runSRReport.php">
				<p>Select a date between:<br/><input readonly style='width:133px;' class='input-date' maxlength=10 type='text' name='date_from' id='date_from' intype='daterange' op='>='> and <input readonly class='input-date' maxlength=10 style='width:133px;' type='text' name='date_to' id='date_to' intype='daterange' op='<='></p>
				<p>Select a Service Portfolio: <br/><select readonly style='width:133px;' class='input-text' maxlength=10 type='select' name='servicePortfolio' id='servicePortfolio'>
				<?php echo select_service();?></p>
				</select></p>
				<input type="hidden" name="sessid" id="sessid" value="<?php echo $_GET['sessid'];?>">
				<input type="hidden" id="reportname" value="services-reporting">
				
				<input type="submit">
			</form>
			<table>
				<tr>
					<!--<td align="left">
						<input type="button" id="btn_submit" onclick="if(check_dates())app.submit_form('reportform');"  value="Submit Report" class="buttonNext" style="font-size:125%;" />
					</td>-->
				</tr>
			</table>
			<!-- end of box content -->
			<div class="spacer"></div></div>
	</div>
	<div class="boxFooter" style="height:9px;" ><img src="../common/img/structure/box_footer_left.gif" width="6" height="9" border="0"/>
	</div>
</div>
</body>
</html>