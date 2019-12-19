<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT *, computer.computer_id AS theid FROM computer LEFT JOIN sessions ON computer.computer_id = sessions.computer_id LEFT JOIN engines ON sessions.engine_id = engines.engine_id WHERE computer.computer_id='".$compid."'";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		?>


<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Overview</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Overview&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
		</tr>
		<tr>
			<td width="100%"><br><br>
		<?php 
		if ($row = odbc_fetch_array($results))
		{?>
			<table border="0" cellpadding="0" cellspacing="0">
				<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Name:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["name"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Logged-on User:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["logged_on_user"])?>" size="40" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Operating System:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["os"])?>" size="60" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;eXpress Server:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $row["hostname"]?>" size="60" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;BootWorks installed:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php if ($row["bw_installed"]=="0") echo "No"; else echo "Yes";?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Windows Agent Version:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["aclient_ver"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;DOS Agent Version:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["bootwork_ver"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;DOS Packet Shim Version:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["pktshim_ver"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Agent Licence Expires:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["expire"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;ID:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $row["theid"]?>" size="27" onfocus="this.blur();"></td>
			</tr>

			<tr>
				<td align="left" colspan="4"><img src="images/space.gif" height="7" width="1" alt=""></td>
			</tr>
			</table>
		<?php }//end if rows found?>
		
			</td>
			<td></td>
		</tr>
	</table>
<br>

</body>
</html>
<?php 
	}
	else
	{
		print "This computer not found in the Centennial Database";
		exit;
	}
}
else
{
	print "No DB Connection";
	exit;
}
?>