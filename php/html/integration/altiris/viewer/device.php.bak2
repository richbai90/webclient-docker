<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $description;

include_once("../incl_odbc.php");
$query = "SELECT * FROM device WHERE computer_id='".$compid."' AND description='".$description."' ORDER BY name";
// Create a new connection object
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		?>
			
		


<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Devices</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;<?php echo $description?> &nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;<?php print trim($row["name"]);?>&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Manufacturer:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["manuf"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Driver:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["driver"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Class:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["class"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Device ID:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["device_id"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		<?php 
		}//end while
		?>
	</table>
</body>
</html>
<?php 
	}//end if results
	else
	{
		print "No Rows Returned";
		exit;
	}
}//end if db connection
else
{
	print "No DB Connection";
	exit;
}
?>