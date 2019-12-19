<?php
// This entire script is nasty, rushed, and needs re-writing when time to do it properly, in a way that permits maintenance and expansion, is available.
$type = stripslashes($_GET['type']);
$element = stripslashes($_GET['element']);
$currentvalue = stripslashes($_GET['value']);
$selval = stripslashes($_GET['selval']);

$hh = $mm = $ss = "00";

if ($type == "date")
{
	if (preg_match("/^\d{2}\/\d{2}\/\d{4}$/", $selval)) $seltime = mktime(0, 0, 0, substr($selval, 3, 2), substr($selval, 0, 2), substr($selval, 6, 4));
}
else if ($type == "time")
{
	if (preg_match("/^\d+:\d+:\d+$/", $selval))
	{
		$temp2 = explode(":", $selval);
		$hh = $temp2[0];
		$mm = $temp2[1];
		$ss = $temp2[2];
	}
	else
	{
		$hh = $mm = $ss = 0;
		$selval = "0:0:0";
	}
}
else if ($type == "datetime")
{
	if (preg_match("/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/", $selval))
	{
		$seltime = mktime(substr($selval, 11, 2), substr($selval, 14, 2), substr($selval, 17, 2), substr($selval, 3, 2), substr($selval, 0, 2), substr($selval, 6, 4));
		$hh = substr($selval, 11, 2);
		$mm = substr($selval, 14, 2);
		$ss = substr($selval, 17, 2);
	}
}
if ((!$seltime) && ($type != "time")) $selval = "";

if (!$currentvalue)
{
	if (!$seltime) $currentvalue = time();
	else $currentvalue = $seltime;
}

$temp = getdate($currentvalue);
$date_array = getdate(mktime(0, 0, 0, $temp['mon'], 1, $temp['year']));



$lastmonth = $date_array['mon']-1;
$lastmonthyear = $date_array['year'];
if (!$lastmonth)
{
	$lastmonth = 12;
	$lastmonthyear = $date_array['year']-1;
}
$nextmonth = $date_array['mon']+1;
$nextmonthyear = $date_array['year'];
if ($nextmonth > 12)
{
	$nextmonth = 1;
	$nextmonthyear = $date_array['year']+1;
}

$days = array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

if ($date_array['mon']==1 || $date_array['mon']==3 || $date_array['mon']==5 || $date_array['mon']==7 || $date_array['mon']==8 || $date_array['mon']==10 || $date_array['mon']==12) $days_in_month = 31;
else if ($date_array['mon'] != 2) $days_in_month = 30;
else $days_in_month = ($date_array['year'] % 4) ? 28 : 29;
$month_start_day = $date_array['wday'];


?>
<html>
<head>
<title>HTML Reports - Time Date Picker</title>
<LINK REL=StyleSheet HREF="styles/mainstyles.php" RTYPE="text/css">
<script language="javascript">
<!--
<?php
if ($type == "datetime") print 'var targetlength = 19;';
else if ($type == "date") print 'var targetlength = 10;';
else print 'var targetlength = 5;';
?>

var selecteddate = "<?php echo (substr($selval, 0, 10))?>";
var selectedtime = "<?php if ($type == "datetime") print $hh.':'.$mm.':'.$ss; ?>";
var selectedvalue = "<?php echo $selval?>";
var selectedperiod = "<?php if ($type == "time") print $hh.':'.$mm.':'.$ss; ?>";
function pickdate(dd,mm,yyyy)
{
	if (dd < 10) dd = "0" + dd;
	if (mm < 10) mm = "0" + mm;
	selecteddate = dd + "/" + mm + "/" + yyyy;
	selectedvalue = selecteddate <?php echo (($type == "datetime") ? '+ " " +' : '+') ?> selectedtime;
	document.getElementById("selval").innerHTML = "<b>" + selectedvalue + "</b>";
}
function picktime()
{
	selectedtime = document.time.hh.value + ":" + document.time.mm.value + ":" + document.time.ss.value;
	selectedvalue = selecteddate <?php echo (($type == "datetime") ? '+ " " +' : '+') ?> selectedtime;
	document.getElementById("selval").innerHTML = "<b>" + selectedvalue + "</b>";
}
function pickperiod()
{
	var hh = document.period.hh.value.replace(/\D+/, "");
	var mm = document.period.mm.value.replace(/\D+/, "");
	var ss = document.period.ss.value.replace(/\D+/, "");
	hh = hh.replace(/^0+/, "");
	mm = mm.replace(/^0+/, "");
	ss = ss.replace(/^0+/, "");
	if (!hh.length) hh = "0";
	if (!mm.length) mm = "0";
	if (!ss.length) ss = "0";
	selectedperiod = hh + ":" + mm + ":" + ss;
	selectedvalue = selectedperiod;
	document.getElementById("selval").innerHTML = "<b>" + selectedvalue + "</b>";
}
function sendback()
{
	if (!selectedvalue)
	{
		alert("No date/time specified");
		return;
	}
	if (selectedvalue.length < targetlength)
	{
		alert("Date/time specified is incomplete");
		return;
	}
	opener.document.args.<?php echo $element?>.value = selectedvalue;
	window.close();
}
//-->
</script>
</head>
<body background="images/gradient.gif" topmargin="0" leftmargin="0" rightmargin="0" bottommargin="0" marginheight="0" marginwidth="0">

<table border="0" cellspacing="0" cellpadding="0" align="left">
<tr>
	<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
	<td>
		<br />

<?php if ($type == "datetime" || $type == "date") { ?>
<table>
<tr>
	<td colspan="2" class="company">Pick a Date <?php if ($type == "datetime") print '& time'; ?></td>
</tr>
<tr>
	<td>
<?php
print '<table border="0" cellspacing="0" cellpadding="5"><tr><td colspan="7"><b><u>'.$date_array['month'].', '.$date_array['year'].'</u></b></td></tr>';
print '<tr><td colspan="3" align="left" class="data"><b>&lt;&lt;&nbsp;<a href="rpt_popup_getargs.php?element='.$element.'&type='.$type.'&value='.(mktime(0, 0, 0, $lastmonth, 1, $lastmonthyear)).'&selval='.$selval.'">Prev</a></b></td><td class="data">&nbsp;</td><td colspan="3" align="right" class="data"><b><a href="rpt_popup_getargs.php?element='.$element.'&type='.$type.'&value='.(mktime(0, 0, 0, $nextmonth, 1, $nextmonthyear)).'&selval='.$selval.'">Next</a>&nbsp;&gt;&gt;</b></td></tr>';
print '<tr>';
for ($x = 0 ; $x < 7 ; $x++)
{
	print '<td><b>'.(substr($days[$x], 0, 3)).'</b></td>';
}
print '</tr>';

print '<tr>';
for ($x = 0 ; $x < $month_start_day ; $x++)
{
	print '<td>&nbsp;</td>';
}
$daycounter = $month_start_day;
for ($x = 0 ; $x < $days_in_month ; $x++)
{
	if ($daycounter==7)
	{
		print '</tr><tr>';
		$daycounter = 1;
	}
	else $daycounter++;

	if (0) print '<td align="center"><a href="javascript:pickdate('.($x+1).', '.$date_array['mon'].', '.$date_array['year'].');"><b>'.($x+1).'</b></a></td>';
	else print '<td align="center"><a href="javascript:pickdate('.($x+1).', '.$date_array['mon'].', '.$date_array['year'].');">'.($x+1).'</a></td>';
}

while ($daycounter % 7)
{
	print '<td>&nbsp;</td>';
	$daycounter++;
}
print '</tr>';
print '<tr><td colspan="3" align="left" class="data"><b>&lt;&lt;&nbsp;<a href="rpt_popup_getargs.php?element='.$element.'&type='.$type.'&value='.(mktime(0, 0, 0, $lastmonth, 1, $lastmonthyear)).'&selval='.$selval.'">Prev</a></b></td><td class="data">&nbsp;</td><td colspan="3" align="right" class="data"><b><a href="rpt_popup_getargs.php?element='.$element.'&type='.$type.'&value='.(mktime(0, 0, 0, $nextmonth, 1, $nextmonthyear)).'&selval='.$selval.'">Next</a>&nbsp;&gt;&gt;</b></td></tr>';
print '</table>';
?>
	</td>
</tr>
</table>
<?php } ?>


<?php if ($type == "datetime") { ?>
<table>
<form name="time">
<tr>
	<td>Time: </td>
	<td>
<?php
print '<select name="hh" onchange="javascript:picktime();">';
for ($x = 0 ; $x < 24 ; $x++)
{
	if (sprintf("%02d", $x) == $hh) print '<option value="'.(sprintf("%02d", $x)).'" selected>'.(sprintf("%02d", $x)).'</option>';
	else print '<option value="'.(sprintf("%02d", $x)).'">'.(sprintf("%02d", $x)).'</option>';
}
print '</select>';

?>
	</td>
	<td>:</td>
	<td>
<?php
print '<select name="mm" onchange="javascript:picktime();">';
for ($x = 0 ; $x < 60 ; $x++)
{
	if (sprintf("%02d", $x) == $mm) print '<option value="'.(sprintf("%02d", $x)).'" selected>'.(sprintf("%02d", $x)).'</option>';
	else print '<option value="'.(sprintf("%02d", $x)).'">'.(sprintf("%02d", $x)).'</option>';
}
print '</select>';

?>
	</td>
	<td>:</td>
	<td>
<?php
print '<select name="ss" onchange="javascript:picktime();">';
for ($x = 0 ; $x < 60 ; $x++)
{
	if (sprintf("%02d", $x) == $ss) print '<option value="'.(sprintf("%02d", $x)).'" selected>'.(sprintf("%02d", $x)).'</option>';
	else print '<option value="'.(sprintf("%02d", $x)).'">'.(sprintf("%02d", $x)).'</option>';
}
print '</select>';

?>
	</td>
</tr>
</form>
</table>
<?php } ?>


<?php if ($type == "time") { ?>
<table>
<form name="period">
<tr>
	<td colspan="8" class="company">Pick a time period</td>
</tr>
<tr>
	<td><input type="text" name="hh" size="3" onchange="javascript:pickperiod();" value="<?php echo $hh?>"></td>
	<td> hours, </td>
	<td><input type="text" name="mm" size="3" onChange="javascript:pickperiod();" value="<?php echo $mm?>"></td>
	<td> minutes & </td>
	<td><input type="text" name="ss" size="3" onchange="javascript:pickperiod();" value="<?php echo $ss?>"></td>
	<td> seconds.</td>
	<td>&nbsp;&nbsp;</td>
	<td><input type="button" value="Update Time" onclick="javascript:pickperiod();"></td>
</tr>
</form>
</table>

<?php } ?>

<table><tr><td colspan="3"><hr></td></tr><tr><td>Selected Date Value: </td><td><div id="selval"><b><?php echo $selval?></b></div></td><td><input type="button" value="Use This Date/Time" onclick="javascript:sendback();"></td></tr></table>

	</td>
</tr>
</table>
</body>
</html>
