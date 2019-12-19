<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000100) == 0)
{
	print "<br><br><br><br><center>Sorry, LANDesk integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}

include_once("../ld_incl_odbc.php");
if (!$query) $query = "SELECT ".$field1.",".$field2." FROM ".$table." WHERE ".$key_pri."=".$val_pri;
if ($msql = odbc_connect($odbc_dsn, $odbc_usr, $odbc_pwd))
{
	if ($results = odbc_exec($msql,$query))
	{
		?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head><title>Details</title></head>
<body leftmargin="0" topmargin="0" marginheight="0" marginwidth="0" bgcolor="#ffffff">
<table border="0" cellspacing="0" cellpadding="0" width="100%">
<tr>
	<td valign="top">
		<?php 
		print '<table border="0" cellspacing="0" cellpadding="0"><tr><td background="images/gradientbg.gif" style="font-family: Verdana, Arial; font-size: 12px; color:#000000;">&nbsp;&nbsp;<b>Name</b></td><td background="images/gradientbg.gif" align="center"><img src="images/gradientbg.gif" height="16" width="1" alt=""></td><td background="images/gradientbg.gif" style="font-family: Verdana, Arial; font-size: 12px; color:#000000;"><b>Data</b></td></tr><tr><td bgcolor="#F5F5F5"><img src="images/blank.gif" height="5" width="1" alt=""></td><td colspan="2"><img src="images/blank.gif" height="1" width="1" alt=""></td></tr>';
		while ($row = odbc_fetch_array($results))
		{
			print '<tr><td bgcolor="#F5F5F5" style="font-family: Verdana, Arial; font-size: 12px; color:#333333;" valign="top" nowrap>&nbsp;&nbsp;'.$row[$field1].'&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td style="font-family: Verdana, Arial; font-size: 12px; color:#000000;" valign="top" nowrap>'.(str_replace("\n","<br>",$row[$field2])).'</td></tr>';
		}
		print '</table>';
		?>
	</td>
	<td valign="top" width="100%"><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td background="images/gradientbg.gif"><img src="images/blank.gif" height="16" width="1" alt=""></td></tr></table></td>
</tr>
</table>
</body>
</html>
		<?php 
	}
	else
	{
		print "No Rows Returned";
		exit;
	}
}
else
{
	print "No DB Connection";
	exit;
}
odbc_close($msql);
?>
