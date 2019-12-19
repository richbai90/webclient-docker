<?php 	include_once('stdinclude.php');
	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/classdatabaseaccess.php');
	include_once('itsmf/xmlmc/xmlmc.php');
	include_once('itsmf/xmlmc/helpers/language.php');
	
	// -- Get Vars
	$sessid = gv('sessid');
	$callref = gv('callref');
	$type = gv('type');
	$tm = gv('tm');
?>

<!-- Refresh -->
<meta http-equiv="refresh" content="10;URL=sladiag.php?sessid=<?php echo $sessid; ?>&callref=<?php echo $callref; ?>&tm=<?php echo $tm; ?>&type=<?php echo $type; ?>">

<!doctype html public "-//w3c//dtd html 4.0 transitional//en">

<style type="text/css">
	li { color: #000000; font-family: verdana,Arial,Helvetica; font-size: 11px;}
	ol { color: #000000; font-family: verdana,Arial,Helvetica; font-size: 11px;}
	ul { color: #000000; font-family: verdana,Arial,Helvetica; font-size: 11px;}
	td { color: #000000; font-family: verdana,Arial,Helvetica; font-size: 11px;}
	.home { color: #ffffff; font-family: verdana,Arial,Helvetica; font-size: 11px;}
</style>

<?php 	$session = new classActivePageSession($sessid);
	if(!$session->IsValidSession())
	{
		echo "Session ID specified is not valid.";
		exit;
	}
	if(!intval($callref))
	{
		echo "Callref specified is not valid.";
		exit;
	}

	$conCache = new CSwLocalDbConnection;
	// F0077222 - Not always root
	$conCache->Connect("sw_systemdb", "", "");

	if($type=="thirdparty")
		$conCache->Query("SELECT * FROM opencall_sla WHERE callref=" . $callref . " AND slatype=1");
	else
		$conCache->Query("SELECT * FROM opencall_sla WHERE callref=" . $callref . " AND slatype=0");

	// Fetch the record and auto-build variables
	if(!$conCache->Fetch("sla"))
	{
		echo "No SLA details found";
		exit;
	}

//	$sla_tzo = $sla_tzoffset;
//	$sla_tzo += $sla_dstrtoff;

	$sTimezoneName = "";
	switch($tm)
	{
	case 0:	//	UTC
		//$tdoff = 0;
		$sTimezoneName = "";
		break;
	case 1:	// 	SLA
		//$tdoff = $sla_tzo;
		$sTimezoneName = $sla_timezone;
		break;
	case 2:	//	Analyst
		//$tdoff = $GLOBALS["tz"];
		$sTimezoneName = $GLOBALS["timezone"];
		break;
	}
?>
<html>
<head>
<title> Active SLA Details - <?php  echo $sla_name; ?></title>
<meta name="generator" content="editplus">
<meta name="author" content="">
<meta name="keywords" content="">
<meta name="description" content="">
</head>

<body>

<script language="javascript">



function ChangeTimeMode(item)
{
	switch(item)
	{
	case 0:
		refreshurl = "sladiag.php?sessid=<?php  echo $sessid; ?>&callref=<?php  echo $callref; ?>&tm=0&type=<?php  echo $type; ?>";
		break;
	case 1:
		refreshurl = "sladiag.php?sessid=<?php  echo $sessid; ?>&callref=<?php  echo $callref; ?>&tm=1&type=<?php  echo $type; ?>";
		break;
	case 2:
		refreshurl = "sladiag.php?sessid=<?php  echo $sessid; ?>&callref=<?php  echo $callref; ?>&tm=2&type=<?php  echo $type; ?>";
		break;
	}
	window.location.href = refreshurl;
}

function ChangeType(item)
{
	switch(item)
	{
	case 0:
		refreshurl = "sladiag.php?sessid=<?php  echo $sessid; ?>&callref=<?php  echo $callref; ?>&tm=<?php echo $tm;?>&type=standard";
		break;
	case 1:
		refreshurl = "sladiag.php?sessid=<?php  echo $sessid; ?>&callref=<?php  echo $callref; ?>&tm=<?php echo $tm;?>&type=thirdparty";
		break;
	}
	window.location.href = refreshurl;
}
</script>


<table width="100%">
<tr bgcolor="#C0C0FF">
<td align="center">
	<h5><b>Call Reference: <?php  echo swcallref_str($sla_callref); ?> [<?php  echo $sla_name; ?>]<br>
	<small><?php  echo date("D, M j, Y G:i:s"); ?></small></b></h5>
	<h5> The details displayed are for the
		<select name='type' style='width:250px' class='forminput' onchange="ChangeType(this.selectedIndex)"> 
			<option value='0' <?php  if($type=="standard") echo "selected"; ?>>Standard Call SLA</option> 
			<option value='1' <?php  if($type=="thirdparty") echo "selected"; ?>>Third Party SLA</option> 
		</select><br> Times marked with a * are displayed in
		<select name='tm' style='width:250px' class='forminput' onchange="ChangeTimeMode(this.selectedIndex)"> 
			<option value='0' <?php  if($tm==0) echo "selected"; ?>>Raw GMT Time Zone (UTC)</option> 
			<option value='1' <?php  if($tm==1) echo "selected"; ?>>Configured SLA Time Zone 
			(
			<?php  
				$nSlaTzOffset = SwGetCrtTimezoneOffset($GLOBALS['sla_timezone']);
				if ($nSlaTzOffset > 0)
					echo "+";
				echo $nSlaTzOffset;
			?>
			)
			</option> 
			<option value='2' <?php  if($tm==2) echo "selected"; ?>>Your Analyst Time Zone 
			(
			<?php  
				$nAnalystTzOffset = SwGetCrtTimezoneOffset($GLOBALS['timezone']);
				if ($nAnalystTzOffset > 0)
					echo "+";
				echo $nAnalystTzOffset;
			?>
			)
			</option> 
		</select> 
	<h5>

	SupportWorks Service Level Agreement diagnostics page. Copyright 2014 Hornbill Technologies Limited. All Rights Reserved.
	<br>
</td>
</tr>
</table>

<table align="center">
<tr>
	<td valign="top" bgcolor="#E0E0E0">
		<h5>Current SLA Configuration</h5>
		<table border=1>
		<tr>
			<td>Timezone: </td>
			<td bgcolor="#ffffff"><?php  echo $sla_timezone; ?></td>
		</tr>
		<tr>
			<td>Timezone Offset: </td>
			<td bgcolor="#ffffff"><?php  echo $sla_tzoffset; ?></td>
		</tr>
<?php 
	if($sla_dststartday && $sla_dstendday)
	{
?>
		<tr>
			<td>Daylight Savings Offset: </td>
			<td bgcolor="#ffffff"><?php  echo $sla_dstoffset; ?></td>
		</tr>
		<tr valign="top">
			<td>Daylight Savings Start Raw: </td>
			<td bgcolor="#ffffff">mon=<?php  echo $sla_dststartmon; ?>, dow=<?php  echo $sla_dststartdow - 1; ?>, week=<?php  if($sla_dststartday==1) echo "First"; else if($sla_dststartday==5) echo "Last"; else echo "Unknown"; ?><br>hour=<?php  echo $sla_dststarthour; ?>, min=<?php  echo $sla_dststartmin; ?></td>
		</tr>
		<tr valign="top">
			<td>Daylight Savings End Raw: </td>
			<td bgcolor="#ffffff">mon=<?php  echo $sla_dstendmon; ?>, dow=<?php  echo $sla_dstenddow - 1; ?>, week=<?php  if($sla_dstendday==1) echo "First"; else if($sla_dstendday==5) echo "Last"; else echo "Unknown"; ?><br>hour=<?php  echo $sla_dstendhour; ?>, min=<?php  echo $sla_dstendmin; ?></td>
		</tr>
<?php 
	}
	else
	{
?>
		<tr>
			<td>Daylight Savings Offset: </td>
			<td bgcolor="#ffffff">No Daylight Savings</td>
		</tr>
<?php 
	}
?>
		</table>

		<br>
		<br>

		<h5>Current Time Clocks</h5>
		<table border=1>
			<tr>
				<td>UTC Time Now: </td>	
				<td bgcolor="#ffffff"><?php echo SwFormatTimestampValue(SW_DTMODE_DATETIME, time()); ?></td>
			</tr>
			<tr>
				<td>SLA Local Time Now: </td>
				<td bgcolor="#ffffff">
				<?php 
					// echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, time(), $sla_tzoffset+$sla_dstrtoff); 
					echo SwFormatTimestampValue(SW_DTMODE_DATETIME, time(), $sla_timezone);
				?></td>
			</tr>
			<tr>
				<td>Your Analyst Time Now: </td>
				<td bgcolor="#ffffff">
				<?php  
  				//	<FN dt=16-Oct-2006> $GLOBALS['tz'] is completely irrelevant when displaying timestamps from the past!
				//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, time(), $GLOBALS['tz']);
				//echo SwFormatDateTimeValueEx(SW_DTMODE_DATETIME, time());
				echo SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, time());
				//	</FN>
				?>
				</td>
			</tr>
		</table>


	</td>
	<td>&nbsp;</td>
	<td valign="top" bgcolor="#E0E0E0">
		<h5>Working times defined (SLA local time)</h5>
		<table border=1>	
		<tr>
			<td><b>Week Day</b></td>
			<td><b>Start</b></td>
			<td><b>End<b></td>
		</tr>
		<tr <?php  if($sla_rtweekday == 1) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Sunday</td>
			<td <?php  if($sla_rtweekday == 1) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_sun_start/60)/60, ($sla_sun_start/60)%60); ?> (<?php  echo $sla_sun_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 1) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_sun_end/60)/60, ($sla_sun_end/60)%60); ?> (<?php  echo $sla_sun_end; ?>)</td>
		</tr>
		<tr <?php  if($sla_rtweekday == 2) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Monday</td>
			<td <?php  if($sla_rtweekday == 2) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_mon_start/60)/60, ($sla_mon_start/60)%60); ?> (<?php  echo $sla_mon_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 2) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_mon_end/60)/60, ($sla_mon_end/60)%60); ?> (<?php  echo $sla_mon_end; ?>)</td>
		</tr>
		<tr <?php  if($sla_rtweekday == 3) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Tuesday</td>
			<td <?php  if($sla_rtweekday == 3) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_tue_start/60)/60, ($sla_tue_start/60)%60); ?> (<?php  echo $sla_tue_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 3) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_tue_end/60)/60, ($sla_tue_end/60)%60); ?> (<?php  echo $sla_tue_end; ?>)</td>
		</tr>
		<tr <?php  if($sla_rtweekday == 4) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Wednesday</td>
			<td <?php  if($sla_rtweekday == 4) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_wed_start/60)/60, ($sla_wed_start/60)%60); ?> (<?php  echo $sla_wed_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 4) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_wed_end/60)/60, ($sla_wed_end/60)%60); ?> (<?php  echo $sla_wed_end; ?>)</td>
		</tr>
		<tr <?php  if($sla_rtweekday == 5) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Thursday</td>
			<td <?php  if($sla_rtweekday == 5) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_thu_start/60)/60, ($sla_thu_start/60)%60); ?> (<?php  echo $sla_thu_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 5) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_thu_end/60)/60, ($sla_thu_end/60)%60); ?> (<?php  echo $sla_thu_end; ?>)</td>
		</tr>
		<tr <?php  if($sla_rtweekday == 6) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Friday</td>
			<td <?php  if($sla_rtweekday == 6) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_fri_start/60)/60, ($sla_fri_start/60)%60); ?> (<?php  echo $sla_fri_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 6) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_fri_end/60)/60, ($sla_fri_end/60)%60); ?> (<?php  echo $sla_fri_end; ?>)</td>
		</tr>
		<tr <?php  if($sla_rtweekday == 7) echo "bgcolor=\"#FFBBBB\""; ?>>
			<td>Saturday</td>
			<td <?php  if($sla_rtweekday == 7) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_sat_start/60)/60, ($sla_sat_start/60)%60); ?> (<?php  echo $sla_sat_start; ?>)</td>
			<td <?php  if($sla_rtweekday == 7) echo "bgcolor=\"#FFBBBB\">"; else echo "bgcolor=\"#ffffff\">"; printf("%d:%02d", ($sla_sat_end/60)/60, ($sla_sat_end/60)%60); ?> (<?php  echo $sla_sat_end; ?>)</td>
		</tr>
		</table>
		<h5>Dates excluded from the SLA</h5>
		<table border=1>
		<tr>
			<td>
				<b>Excluded Date&nbsp;</b>
			</td>
			<td>
				<b>Type</b>
			</td>
		</tr>
		<?php 
			$conCache->Query("SELECT * FROM opencall_sla_exc WHERE slaid = " . $sla_id);
	
			// Fetch the record and auto-build variables
			while($conCache->Fetch("exc"))
			{
		?>
		<tr>
			<td bgcolor="#ffffff">
				<?php  echo $exc_excday . "/" . $exc_excmonth; if($exc_excyear != 1970) echo "/" . $exc_excyear; ?>
			</td>
			<td bgcolor="#ffffff">
				<?php  if($exc_excyear == 1970) echo "Every year"; else echo "One year only"; ?>
			</td>
		</tr>
		<?php 
			}
		?>
		</table>
	</td>
	<td>&nbsp;</td>
	<td valign="top" bgcolor="#E0E0E0">
		<h5>Calculated runtime values</h5>
		<table border=1>
		<tr>
			<td>Response Period: </td>
			<td bgcolor="#ffffff"><?php  printf("%d:%02d", ($sla_resperiod/60)/60, ($sla_resperiod/60)%60); ?> (<?php  echo $sla_resperiod; ?> seconds)</td>
		</tr>
		<tr>
			<td>Fix Period: </td>
			<td bgcolor="#ffffff"><?php  printf("%d:%02d", ($sla_fixperiod/60)/60, ($sla_fixperiod/60)%60); ?> (<?php  echo $sla_fixperiod; ?> seconds)</td>
		</tr>
<?php 
	if($sla_dststart && $sla_dstend)
	{
		
?>
		<tr>
			<td>Daylight Savings Start (UTC): </td>
			<td bgcolor="#ffffff">
			<?php  
				if($sla_dststart) 
					//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_dststart, 0); 
					echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_dststart); 
				else 
					echo "No Daylight Savings"; 
			?>
			</td>
		</tr>
		<tr>
			<td>Daylight Savings End (UTC): </td>
			<td bgcolor="#ffffff">
			<?php  
				if($sla_dstend) 
					//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_dstend, 0); 
					echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_dstend);
				else 
					echo "No Daylight Savings"; 
			?>
			</td>
		</tr>
		<tr>
			<td>Daylight Savings Offset Applied: </td>
			<td bgcolor="#ffffff"><?php  echo $sla_dstrtoff; ?></td>
		</tr>
<?php 	
	}
	else
	{
?>
		<tr>
			<td>Daylight Savings Applied: </td>
			<td bgcolor="#ffffff">No Daylight Savings</td>
		</tr>
<?php 	
	}
?>
	
		<tr>
			<td>Elapsed Seconds Today: </td>
			<td bgcolor="#ffffff"><?php  echo $sla_elapsedsecstoday; ?> (<?php  printf("%d:%02d:%02d", ($sla_elapsedsecstoday/60)/60, ($sla_elapsedsecstoday/60)%60, $sla_elapsedsecstoday%60); ?>)</td>
		</tr>
		<tr>
			<td>Current Day of the Week: </td>
			<td bgcolor="#ffffff"><?php  echo $sla_rtweekday; ?>
			<?php 
				switch($sla_rtweekday)
				{
				case 1: echo "- Sunday"; break;
				case 1: echo "- Monday"; break;
				case 1: echo "- Tuesday"; break;
				case 1: echo "- Wednesday"; break;
				case 1: echo "- Thursday"; break;
				case 1: echo "- Friday"; break;
				case 1: echo "- Saturday"; break;
				};
			?>
			</td>
		</tr>
		<tr>
			<td>Run State: </td>
			<td bgcolor="#ffffff"><?php  if($sla_runstate == 1) echo "Running"; else if($sla_runstate == 2) echo "Paused (On Hold)"; else echo "Stopped"; ?></td>
		</tr>
		<tr>
			<td>In Working Time: </td>
			<td bgcolor="#ffffff"><?php  if($sla_inworkingtime) echo "Yes"; else echo "No"; ?></td>
		</tr>
		<tr>
			<td><b>*SLA Started On: </b></td>	
			<td bgcolor="#ffffff"><b>
			<?php 
				//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_startdate, $tdoff); 
				echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_startdate, $sTimezoneName);
			?>
			</b></td>
		</tr>
		<tr>
			<td colspan=2>&nbsp;</td>
		</tr>
		<tr>
			<td><b>*Expected Response Target: </b></td>
			<td bgcolor="#ffffff"><b>
			<?php  
				//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_respondby, $tdoff); 
				echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_respondby, $sTimezoneName);
			?></b></td>
		</tr>
		<tr>
			<td>Response State: </td>
			<td bgcolor="#ffffff">
				<?php  
					if($sla_actualrestime == 0) 
						echo "Waiting"; 
					else if($sla_resp_ctr < 0) 
						echo "Breached"; 
					else echo "Achieved"; 
				?>
			</td>
		</tr>
		<tr>
			<td>Response Time Remaining: </td>
			<td bgcolor="#ffffff"><b>
				<?php  
						$neg = false;
						$val = $sla_resp_ctr;
						if($val < 0)
						{
							$neg = true;
							$val = -$val;
						}
						if($neg)
							echo "<font color=\"#FF0000\">";

						printf("%d:%02d:%02d", ($val/60)/60, ($val/60)%60, $val%60); ?></b> (<?php  echo $sla_resp_ctr; 
						if($neg)
							echo "</font>";
				  ?>)
			</td>
		</tr>
		<tr>
			<td>Response Time Elapsed: </td>
			<td bgcolor="#ffffff"><b><?php  $val = ($sla_resperiod-$sla_resp_ctr); printf("%d:%02d:%02d", ($val/60)/60, ($val/60)%60, $val%60); ?></b> (<?php  echo $val; ?>)</td>
		</tr>
		<tr>
			<td><b>*Actual Response Time: </b></td>
			<td bgcolor="#ffffff"><b>
				<?php  
					if ($sla_actualrestime) 
						//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_actualrestime, $tdoff);
						echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_actualrestime, $sTimezoneName);
					else
						echo "Still Running"; 
				?>
			</b></td>
		</tr>
		<tr>
			<td colspan=2>&nbsp;</td>
		</tr>
		<tr>
			<td><b>*Expected Fix Target: </b></td>
			<td bgcolor="#ffffff"><b>
			<?php  
				//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_fixby, $tdoff); 
				echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_fixby, $sTimezoneName);
			?></b></td>
		</tr>
		<tr>
			<td>Fix State: </td>
			<td bgcolor="#ffffff"><?php  if($sla_actualfixtime == 0) echo "Waiting"; else if($sla_fix_ctr < 0) echo "Breached"; else echo "Achieved"; ?></td>
		</tr>
		<tr>
			<td>Fix Time Remaining: </td>
			<td bgcolor="#ffffff"><b>
				<?php  
						$neg = false;
						$val = $sla_fix_ctr;
						if($val < 0)
						{
							$neg = true;
							$val = -$val;
						}
						if($neg)
							echo "<font color=\"#FF0000\">";

						printf("%d:%02d:%02d", ($val/60)/60, ($val/60)%60, $val%60); ?></b> (<?php  echo $sla_fix_ctr; 
						if($neg)
							echo "</font>";
							
				  ?>)
			</td>
		</tr>
		<tr>
			<td>Fix Time Elapsed: </td>
			<td bgcolor="#ffffff"><b><?php  $val = ($sla_fixperiod-$sla_fix_ctr); printf("%d:%02d:%02d", ($val/60)/60, ($val/60)%60, $val%60); ?></b> (<?php  echo $val; ?>)</td>
		</tr>
		<tr>
			<td><b>*Actual Fix Time: </b></td>
			<td bgcolor="#ffffff"><b>
				<?php  
					if($sla_actualfixtime) 
						//echo SwFormatDateTimeValue(SW_DTMODE_DATETIME, $sla_actualfixtime, $tdoff);
						echo SwFormatTimestampValue(SW_DTMODE_DATETIME, $sla_actualfixtime, $sTimezoneName);
					else 
						echo "Still Running";
				?>
			</b></td>
		</tr>
		</table>
	</td>
</tr>
</table>


<table align="center">
<tr>
	<td bgcolor="#E0E0E0">
		<h5>Response events defined for this SLA</h5>
		<table border=1>
		<tr>
			<td><b>ID</b></td>
			<td><b>Status</b></td>
			<td><b>Type</b></td>
			<td><b>Trigger Mode</b></td>
			<td><b>Event Time</b></td>
		</tr>
		<?php 
			$conCache->Query("SELECT SQL_NO_CACHE * FROM opencall_sla_evts WHERE evttype IN (1,2) AND slaid = " . $sla_id . " ORDER BY evttime DESC");
			// Fetch the record and auto-build variables
			while($conCache->Fetch("evt"))
			{
		?>
		<tr>
			<td bgcolor="#ffffff"><?php  echo $evt_evtid; ?></td>
			<td bgcolor="#ffffff"><b>
				<?php  
					if($evt_status == 18) 
						echo "*Missed: " . SwFormatTimestampValue(SW_DTMODE_DATETIME, $evt_evtfired, $sTimezoneName);
							//SwFormatDateTimeValue(SW_DTMODE_DATETIME, $evt_evtfired, $tdoff);
					else if($evt_status == 17) 
						echo "Canceled"; 
					else if($evt_status == 1) 
						echo "Pending"; 
					else echo "*Fired: ". SwFormatTimestampValue(SW_DTMODE_DATETIME, $evt_evtfired, $sTimezoneName);
							//SwFormatDateTimeValue(SW_DTMODE_DATETIME, $evt_evtfired, $tdoff);
				?>
			</b></td>
			<td bgcolor="#ffffff"><?php  if($evt_evttype == 1) echo "Response Event "; else echo "Missed Response Event "; ?></td>
			<td bgcolor="#ffffff"><?php  if($evt_evtmode == 1) echo "Time Before Met "; else echo "Time After Started "; ?></td>
			<td bgcolor="#ffffff"><?php  printf("%d:%02d", ($evt_evttime/60)/60, ($evt_evttime/60)%60); ?> (<?php  echo $evt_evttime; ?>)</td>
		</tr>
		<?php 
			}
		?>
		</table>
	</td>
	
	<td width="30">
	</td>
	
	<td bgcolor="#E0E0E0">
		<h5>Fix events defined for this SLA</h5>
		<table border=1>
		<tr>
			<td><b>ID</b></td>
			<td><b>Status</b></td>
			<td><b>Type</b></td>
			<td><b>Trigger Mode</b></td>
			<td><b>Event Time</b></td>
		</tr>
		<?php 
			echo "slaid " . $sla_id;

			$conCache->Query("SELECT SQL_NO_CACHE * FROM opencall_sla_evts WHERE evttype IN(3,4) AND slaid = " . $sla_id . " ORDER BY evttime DESC");
			// Fetch the record and auto-build variables
			while($conCache->Fetch("evt"))
			{
		?>
		<tr>
			<td bgcolor="#ffffff"><?php  echo $evt_evtid; ?></td>
			<td bgcolor="#ffffff"><b>
				<?php  
					if($evt_status == 18) 
						echo "*Missed: " . SwFormatTimestampValue(SW_DTMODE_DATETIME, $evt_evtfired, $sTimezoneName);
						//SwFormatDateTimeValue(SW_DTMODE_DATETIME, $evt_evtfired, $tdoff);
					else if($evt_status == 17) 
						echo "Canceled"; 
					else if($evt_status == 1) 
						echo "Pending"; 
					else echo "*Fired: ". SwFormatTimestampValue(SW_DTMODE_DATETIME, $evt_evtfired, $sTimezoneName);
						//SwFormatDateTimeValue(SW_DTMODE_DATETIME, $evt_evtfired, $tdoff);
				?>
			</b></td>
			<td bgcolor="#ffffff"><?php  if($evt_evttype == 3) echo "Fix Event "; else echo "Missed Fix Event "; ?></td>
			<td bgcolor="#ffffff"><?php  if($evt_evtmode == 1) echo "Time Before Met "; else echo "Time After Started "; ?></td>
			<td bgcolor="#ffffff"><?php  printf("%d:%02d", ($evt_evttime/60)/60, ($evt_evttime/60)%60); ?> (<?php  echo $evt_evttime; ?>)</td>
		</tr>
		<?php 
			}
		?>
		</table>
	</td>
</tr>
</table>
</body>
</html>
