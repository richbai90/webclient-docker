<?php
	//error_reporting(E_ALL);
	//-- Custom Report to Generate SLAM for Services
	function select_sla()
	{
		if($_GET['sessid'])
		{
			session_start();
			$_SESSION['portalmode'] = "FATCLIENT";

			//-- Include our standard include functions page
			include_once('itsm_default/xmlmc/classactivepagesession.php');
			include_once('itsm_default/xmlmc/common.php');
			$session = new classActivePageSession($_GET['sessid']);
			//-- Initialise the session
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
				//-- Get SLA's
				$strSQL = "select * from itsmsp_slad where appcode = '".pfs($GLOBALS['dd'])."' and (archive = 0 OR archive is null)";
				$recSet = $reportODBC->Query($strSQL,true); //-- select and return recset
				$returnHTML = "";
				while(!$recSet->eof) 
				{
					$returnHTML .= "<option value='".$recSet->xf('pk_slad_id')."'";
					$returnHTML .= ">".$recSet->xf('slad_id')."</option>\n";
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
	var strDateFmt = "mm-yy";
	var dbtype = "swsql";
	
	setup_datepickers_month_only();
</script>
<style>
    .ui-datepicker-calendar {
        display: none;
        }
    </style>
<html>
<body onload="">
<div class="boxWrapper" id="contentColumn" >
	<img src="../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/><div class="boxMiddle"><div class="boxContent">
				<h2>Service Level Agreement Monitoring</h2>
				<form id="reportform" name="reportform" method="post" action="../common/php/runSLAMReport.php">
					<p>Please Specify a Date Range<br/><input readonly style='width:133px;' class='input-date' maxlength=10 type='text' name='date_from' id='date_from' intype='daterange' op='>='> and <input readonly class='input-date' maxlength=10 style='width:133px;' type='text' name='date_to' id='date_to' intype='daterange' op='<='></p>
					<p>Please Select an SLA<br/><select readonly style='width:133px;' class='input-text' maxlength=10 type='select' name='sla' id='sla'>
					<?php echo select_sla();?></p>
					</select></p>
					<input type="hidden" name="sessid" id="sessid" value="<?php echo $_GET['sessid'];?>">
					<input type="hidden" id="reportname" value="service-level-agreement-monitoring">
					
					<input type="submit">
				</form>
				
					<table>
						<tr>
							<td align="left">
								
							</td>
						</tr>
					</table>
				
				<!-- end of box content -->
				<div class="spacer">&nbsp;
				</div>
			</div>
		</div>
		<div class="boxFooter" style="height:9px;" ><img src="../common/img/structure/box_footer_left.gif" width="6" height="9" border="0"/></div></div>

</body>
</html>