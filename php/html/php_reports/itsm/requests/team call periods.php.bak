<?php 	
	include('itsm_default/xmlmc/classactivepagesession.php');
	include('itsm_default/xmlmc/common.php');
	include('itsm_default/xmlmc/classknowledgebase.php');
	include('itsm_default/xmlmc/classreport.php');
	
	$test = gvs('sessid');

	$callStatusName = array(1=>'Pending', 2=>'Unassigned', 3=>'Unaccepted',4=> 'On Hold',5=> 'Off Hold', 6=>'Resolved', 7=>'Deferred', 8=>'Incoming', 9=>'Escalated(O)', 10=>'Escalated(G)',11=> 'Escalated(A)', 15=>'Lost Call!!!', 16=>'Closed', 17=>'Cancelled',18=> 'Closed(Chg)');

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

	$db = new CSwDbConnection;
	$db->SwDataConnect();

	$dbchache = new CSwDbConnection;
	$dbchache->SwCacheConnect();

	$content="";


	// returns latest sla time from from the opencall_sla table
	function get_latest_sla($dbchache,$callref) {
		$query = 'SELECT ( fixperiod - fix_ctr ) AS latest_sla_time
				  FROM opencall_sla
				  WHERE callref = ' . $callref;
		$recSet = $dbchache->Query($query ,true);
		if(!$recSet || $recSet->eof){}
		else {	
			return $recSet->f('latest_sla_time');
		}
	}
	
	function print_group_totals($group_totals,$strCallsCurrentGroup)
	{
		foreach ($group_totals as $id => $time)
		{
			$open = "";
			if ($id==$strCallsCurrentGroup)
			{
				$open = "(*)";
			}
			echo $id . " " . common_convert_field_value('hhmmss', $time, 'cur_sla_time') . " " . $open . "<br>";
		}
	}

	function print_group_entry($groupid, $time, $open){
		echo $groupid . " " . common_convert_field_value('hhmmss', $time, 'cur_sla_time') . $open . "<br>";
	}

	//-- START Report code
	$sum_mode = $_REQUEST['sumCheckBox'];
	if ($sum_mode=='ticked')
	{
		$title='Team summary';
	}
	else
	{
		$title='Chronological';
	}
	
	//-- Report results START
	if ('team-call-periods'==$_REQUEST['reportname'])
	{
		//echo (int)$_REQUEST['call_activity__timex__1']+12 . "........<BR>";
		//echo (int)$_REQUEST['call_activity__timex__1'] . "........<BR>";
		// set query filter based on user input
		if (''!=$_REQUEST['call_activity__timex']) $strFilter .= ' AND timex > ' . (int)$_REQUEST['call_activity__timex'];
		if (''!=$_REQUEST['call_activity__timex__1']) $strFilter .= ' AND timex < ' . (int)$_REQUEST['call_activity__timex__1'];
		if (''!=$_REQUEST['opencall__companyname']) $strFilter .= " AND companyname = '" . $_REQUEST['opencall__companyname'] . "' ";
		if (''!=$_REQUEST['opencall__probcode']) $strFilter .= " AND probcode = '" . $_REQUEST['opencall__probcode'] . "' ";
		if (''!=$_REQUEST['callStatusSelect']) $strFilter .= " AND status = '" . $_REQUEST['callStatusSelect'] . "' ";
		
		//###20120511 addition of sla_time != -1 filter
		$query = 'SELECT s.type, o.closedatex, s.cur_group, o.callref, o.h_formattedcallref, o.status, s.groupid, s.timex, o.logdatex, o.probcode, s.sla_time, o.itsm_title, o.callclass, o.owner, o.probcodedesc
				  FROM opencall o, call_activity s
				  WHERE s.sla_time != -1 and o.callref=s.callref' . $strFilter . '
				  ORDER BY o.callref, s.timex';
				  
		//echo $query. '<br>';
		$recSet = $db->Query($query ,true);
		if($recSet->eof)
		{
			exit('<center>There are no records that match your criteria<br /></center>');
		}
		else
		{		
			$tot_time = 0;
			$cur_suppgroup = '';
			$cur_call = '';
			$start_sla_time = 0;
			$reactivated=0;
			
			//keep track of total time of call in group
			$group_totals = array();

			$isCSV = $_GET['CSV'];

			if ($isCSV=="true"){
				//cho "Downloading Excel file ";
				while (!$recSet->eof){
					  $content .= $recSet->f('callclass') . ", " . $recSet->f('h_formattedcallref') . ", ";
					  $content .= "[".common_convert_field_value('customerdate',$recSet->f('logdatex'), 'logdate')." - ".common_convert_field_value('customerdate', $recSet->f('closedatex'), 'timex') . "], ";
					  $content .= $callStatusName[$recSet->f('status')] . "' ";
					
						if ($recSet->f('owner') != "")
							$content .= ", " . $recSet->f('owner') . ", ";

					  $content.="\r\n";	
					  $recSet->movenext();
				}


				$fileName = $_SERVER['REQUEST_URI'];

				$last_slash = strrpos($fileName, "/");
				$fName = substr($fileName,$last_slash+1);
				$ampersand_position = strpos($fName, ".");
				$fName = substr($fName,0,$ampersand_position);		
				$fName.='.csv'; 

				
				header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
				header('Content-Description: File Transfer');
				header("Content-type: text/csv");
				header("Content-Disposition: attachment; filename={$fName}");
				header("Expires: 0");
				header("Pragma: public");


				$fh = fopen( 'php://output', 'w' );
				fwrite($fh,$content);
				fclose($fh);

				exit();

			}

			else{
	?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<script type="text/javascript" src="../common/js/portal.control.js"></script>
	<link href="../common/css/elements.css" rel="stylesheet" type="text/css" />
	<link href="../common/css/panels.css" rel="stylesheet" type="text/css" />
	<link href="../common/css/structure_ss.css" rel="stylesheet" type="text/css" />
	</head>
<body>
	<div class="boxFooter">
	<div class="boxContent_reportresult" ><img src="../common/img/structure/box_header_left.gif" width="6" height="9" alt="" border="0"/>
	<div class="boxMiddle">
	<div style="margin:0px 20px 0px 20px;font-size:15px;">
		<!-- box content -->

		<h2 style="width:100%;">Team Call Periods - Results (<?php echo $title; ?>)</h2>
		<div>
		<?php 			// loop through activity records from call_activity table
			while (!$recSet->eof)
			{
				
				$strCallsCurrentGroup="";
				// if call has been reactivated, reset start_sla_time and store running total for use later
				if ($recSet->f('type') == 'reactivated')
				{
					$start_sla_time = 0;
					$reactivated=$tot_time;
				}
				// when you get to a new call... 
				if ($cur_call!=$recSet->f('callref'))
				{
					//-- if first entry is not logged...
					if ($recSet->f('type')!="logged")
					{
						//-- ... then all call data not available so skip this call (i.e. exclude calls logged before call_activity table implemented)
						$recSet->movenext();
						continue;
					}
					// New call that is not the first call, need to deal with the last support group entry for the pervious call
					if ($cur_suppgroup != '')
					{
						$sla_add_time = 0; //sla time since last update
						$open = '';
						// if the previous call is open..
						if (6 != $cur_status && $cur_status < 16)
						{
							// get the latest sla time for the previous call from from the opencall_sla table
							$latest_sla_time = get_latest_sla($dbchache,$cur_call);
							
							// calculate the sla time that has passed since last entry to previous call 
							$sla_add_time=($latest_sla_time-$cur_sla_time);
							if (6 != $cur_status)
							{
								$open = '(*)'; // print a star if call still open
								$strCallsCurrentGroup=$cur_suppgroup;
							}
						}
						// print the last support group entry from previous call
						// (add on any time that elapsed before any reactivation of the call using $reactivated from earlier)
						if ($sum_mode!='ticked')
						{
							//echo $sla_add_time . " : " . $latest_sla_time . " : " . $cur_sla_time;
							print_group_entry($cur_suppgroup, ($tot_time + $reactivated + $sla_add_time), $open);
						}
					
						$group_totals[$cur_suppgroup]+= ($tot_time + $reactivated + $sla_add_time);
						$reactivated = 0;
						$cur_suppgroup = '';
					}
					if ($sum_mode=='ticked')
					{
						// check not first record
						if ($cur_call!='')
						{
							//print group_totals (doesn't include last call...)
							print_group_totals($group_totals,$strCallsCurrentGroup);
						}
					}
					// print call details
					$strHTML =  "<hr>";
					$strHTML .=  "<p>";
					$strHTML .=  $recSet->f('callclass') . " <strong>" . $recSet->f('h_formattedcallref') . "</strong>" . " ";
					$strHTML .=  "[" . common_convert_field_value('customerdate', $recSet->f('logdatex'), 'logdate') . " - ";
					$strHTML .=  common_convert_field_value('customerdate', $recSet->f('closedatex'), 'timex') . "] ";
					$strHTML .=  $callStatusName[$recSet->f('status')] . "";
					
					$content .= $callStatusName[$recSet->f('status')] . "' ";
					
					if ($recSet->f('owner') != "")
					{
						$strHTML .=  " (" . $recSet->f('owner') . ")";
					}
					$strSeparator = "";
					if ($recSet->f('probcodedesc') != "")
					{
						$strSeparator = " | ";
					}
					
					$strHTML .=  "<br>" . $recSet->f('itsm_title') . $strSeparator . $recSet->f('probcodedesc') . "<br>";
					$strHTML .=  "</p>";
					echo $strHTML;
						 
						 
						 
					$cur_call = $recSet->f('callref');
					$start_sla_time = 0;
					//###reset of group_totals
					unset($group_totals);
					$group_totals = array();
				}
				// when you get to a new support group entry...
				if ($cur_suppgroup!=$recSet->f('cur_group'))
				{
					
					// ... that is not the first of this call...
					if ($cur_suppgroup != '')
					{
							// print the support group entry
							if ($sum_mode!='ticked')
							{
								print_group_entry($cur_suppgroup, (($recSet->f('sla_time') - $start_sla_time) + $reactivated), '');
							}
							//add to group total
							$group_totals[$cur_suppgroup]+=(($recSet->f('sla_time') - $start_sla_time) + $reactivated);
							$reactivated = 0;
					}
					$start_sla_time=$recSet->f('sla_time');
					$cur_suppgroup=$recSet->f('cur_group');
				}
				$tot_time = ($recSet->f('sla_time') - $start_sla_time); // running total of sla_tim for current group
				$cur_status = $recSet->f('status');
				$cur_sla_time = $recSet->f('sla_time');
				$recSet->movenext();
			} // END WHILE
			
			// Print last support group entry from the last call...
			$sla_add_time=0;
			$open='';
			if (6 != $cur_status && $cur_status < 16)
			{
				$latest_sla_time = get_latest_sla($dbchache,$cur_call);
				$sla_add_time=($latest_sla_time-$cur_sla_time); //sla time since last update
				if (6 != $cur_status)
				{
					$open='(*)';
					$strCallsCurrentGroup=$cur_suppgroup;
				}
			}
			if ($sum_mode!='ticked')
			{
				print_group_entry($cur_suppgroup, ($tot_time + $reactivated + $sla_add_time), $open);
			}
			$group_totals[$cur_suppgroup]+=($tot_time + $reactivated + $sla_add_time);
			$reactivated = 0;
			if ($sum_mode=='ticked')
			{
				//print group_totals (last call)
				print_group_totals($group_totals,$strCallsCurrentGroup);
				echo '<hr />';
			}
		}

		if ($isCSV==false){
			echo '<center>(*) timer still running</center><br />';
			unset($recSet);
		?>
			<div class="spacer">&nbsp;</div>
					</div>&nbsp;
				</div>
				</div>
				</div>
				<div class="boxFooter"><img src="../common/img/structure/box_footer_left.gif"/></div>
				</div>
			</body>
			</html>
		<?php
		}
		exit;
		}
	} 
	else
	//-- Report criteria START
	?>
	<script type="text/javascript">
		var strDateFmt = "<?php echo ComCtrl32Format_To_JsFormat($GLOBALS['datefmt']);?>";
		var dbtype = "<?php echo $databasetype;?>";

		function check_dates()
		{
			var arrEle = document.getElementsByTagName("input")
			var arrValues = new Array();
			for(var i=0;i<arrEle.length;i++)
			{
				var thisEle = arrEle[i];
				if(thisEle.getAttribute('intype')=="daterange")
				{
					if(thisEle.getAttribute('value')=="" || thisEle.value=="")
					{
						alert('Please input a pair of values for the date range.');
						return false;
					}
				}
			}
			return true;
		}

		function submit_form1(strFormID)
		{
			
			var oForm = document.getElementById(strFormID);
			if(oForm!=null)
			{
				var strURL = get_form_url(oForm);
				if(strURL!=false)
				{
					load_content(strURL);
				}
			}
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

		function downloadCSV() {

			var form_content="";
			var oForm =document.forms["reportform"];
			var input_id;
			var value_form;
			var condition=0;


			if (check_dates()){
				//Processing the value of the param
				for (var i=0; i<oForm.length; i++){
					input_id = oForm[i].id;
					value_form = oForm[i].value;

					if (input_id=="CSV")
						continue;

					//Passing the date to epoch value
					if (input_id=="call_activity__timex" || input_id=="call_activity__timex__1"){
						help_date = parseISO8601(value_form);
						var strCurrentEpoch = Math.floor(help_date.getTime()/1000);
						value_form = strCurrentEpoch;
					}

					form_content += input_id + "="+value_form + "&";
				}

				var to_print=form_content+"CSV=true"; 
				location = window.location.href;

				//Redirect to the new location with the new parameters
				window.location = location+to_print;
			}
		}  
</script>

<html>
	<link href="../common/css/elements.css" rel="stylesheet" type="text/css" />
	<link href="../common/css/panels.css" rel="stylesheet" type="text/css" />
	<link href="../common/css/structure_ss.css" rel="stylesheet" type="text/css" />
	<script type="text/javascript" src="../common/js/portal.control.js"></script>
	<script type="text/javascript" src="../common/js/xmlhttp.control.js"></script>
	<script type="text/javascript" src="../../common/js/date.control.js"></script>
	<script type="text/javascript" src="../common/js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="../common/js/jquery-ui-1.8.19.custom.min.js"></script>
	<script type="text/javascript" src="../common/js/report.control.js"></script>
	<link href="../common/css/redmond/jquery-ui-1.8.22.custom.css" rel="stylesheet" type="text/css"/>
	<body onload="">
		<div class="boxWrapper" id="contentColumn" >
			<img src="../common/img/structure/box_header_left.gif" width="6" height="11" alt="" border="0"/><div class="boxMiddle">
			<div class="boxContent">
				<h2>Team Call Periods - Criteria</h2>
				<form id="reportform" name="reportform" action="<?php echo $PHP_SELF;?>">
					<script type="text/javascript">
					var strDateFmt = "<?php echo ComCtrl32Format_To_JsFormat($GLOBALS['datefmt']);?>";
					var dbtype = "<?php echo $databasetype;?>";
					setup_datepickers();
					</script>
					<?php 					echo create_report_daterange("call_activity..timex","=","Requests logged on and between");
					?>
					<p>Company<br/>
						<select id='opencall..companyname'   style='width:300px;' intype='dbpicklist' op='=' onchange='check_dependancies(this);' dsn='Supportworks Data'      table='opencall' keycol='companyname' txtcol='companyname' applyfilter=''>
							<option selected="selected" value=""></option>
							<?php 								$db = new CSwDbConnection;
								$db->SwDataConnect();

								$recSet = $db->Query("SELECT pk_company_id, companyname FROM company ORDER BY companyname",true); //-- select and return recset

								if(!$recSet){
								}
								else {
									while (!$recSet->eof){
										echo '<option value="' . $recSet->f('companyname') . '">' . $recSet->f('companyname') . '</option>';
										$recSet->movenext();	
									}
								}
								unset($recSet);
							?>
						</select>
					</p>
					<p>Profile Code<br/>
						<select id='opencall..probcode' style='width:300px;' intype='dbpicklist' op='=' onchange='check_dependancies(this);' dsn='Supportworks Data' table='pcdesc' keycol='code' txtcol='info' applyfilter=''>
							<option selected="selected" value=""></option>
							<?php 								$recSet = $db->Query("SELECT code, info FROM pcdesc ORDER BY info",true); //-- select and return recset

								if(!$recSet){
								}
								else {
									while (!$recSet->eof){
										echo '<option value="' . $recSet->f('code') . '">' . $recSet->f('info') . '</option>';
										$recSet->movenext();	
									}
								}
								unset($recSet);
							?>
						</select>
					</p>
					<p>Call Status<br/>
						<select id='callStatusSelect' style='width:300px;'>
							<option selected="selected" value=""></option>
							<?php 								foreach ($callStatusName as $callstatusNo=>$statusName) {
										echo '<option value="' . $callstatusNo. '">' . $statusName . '</option>';
								}
							?>
						</select>
					</p>
					<p>
						<input id='sumCheckBox' type="checkbox" name="type" checked value="ticked" />Team Summary<br />
					</p>
					<input type="hidden" id="reportname" value="team-call-periods">
					<input type="hidden" name="CSV" id="CSV" value="false">
					<false type="hidden" id="sessid" value="<?php echo $_REQUEST['sessid'];?>">
				</form>
					<table>
						<tr>
							<td align="left">
								<input type="button" id="btn_submit" onclick="if(check_dates())submit_form1('reportform');"  value="Submit Report" class="buttonNext" style="font-size:125%;" />
							</td>
							<td align="right">
								<input type="button" id="btn_excell" onclick="return downloadCSV();"  value="Export Data" class="buttonNext" style="font-size:125%;" />
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

