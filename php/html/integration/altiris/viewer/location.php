<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT * FROM location WHERE computer_id='".$compid."'";
if ($msql = odbc_connect($databasename, $username, $password))
{

?>

<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Notes</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"><img src="images/space.gif" height="15" width="5" alt=""></td>
			<td background="images/gradientbg.gif" nowrap colspan="3" width="100%"><span class="header1">&nbsp;&nbsp;Location:&nbsp;</span></td>
			<td background="images/gradientbg.gif"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		<?php if ($results = odbc_exec($msql,$query))
		{

			if ($row = odbc_fetch_array($results))
			{?>
		
		<tr bgcolor="#ffffff">
			<td bgcolor="#CFE7FF" align="right" nowrap></td>
			<td bgcolor="#CFE7FF" align="right" nowrap><b>Contact:</b> </td>
			<td></td>
			<td valign="top" nowrap width="100%"><?php print $row["contact"];?>&nbsp;</td>
			<td></td>
		</tr>
		<tr bgcolor="#ffffff">
			<td bgcolor="#CFE7FF" align="right" nowrap></td>
			<td bgcolor="#CFE7FF" align="right" nowrap><b>Phone:</b> </td>
			<td></td>
			<td valign="top" nowrap><?php print $row["phone"];?>&nbsp;</td>
			<td></td>
		</tr>
		<tr bgcolor="#ffffff">
			<td bgcolor="#CFE7FF" align="right" nowrap></td>
			<td bgcolor="#CFE7FF" align="right" nowrap><b>Email:</b> </td>
			<td></td>
			<td valign="top" nowrap><?php print $row["email"];?>&nbsp;</td>
			<td></td>
		</tr>
		<tr bgcolor="#ffffff">
			<td bgcolor="#CFE7FF" align="right" nowrap></td>
			<td bgcolor="#CFE7FF" align="right" nowrap><b>Department:</b> </td>
			<td></td>
			<td valign="top" nowrap><?php print $row["dept"];?>&nbsp;</td>
			<td></td>
		</tr>
		<tr bgcolor="#ffffff">
			<td bgcolor="#CFE7FF" align="right" nowrap></td>
			<td bgcolor="#CFE7FF" align="right" nowrap><b>Mail Stop:</b> </td>
			<td></td>
			<td valign="top" nowrap><?php print $row["mailstop"];?>&nbsp;</td>
			<td></td>
		</tr>
		<tr bgcolor="#ffffff">
			<td bgcolor="#CFE7FF" align="right" nowrap></td>
			<td bgcolor="#CFE7FF" align="right" nowrap><b>Site:</b> </td>
			<td></td>
			<td valign="top" nowrap><?php print $row["site"];?>&nbsp;</td>
			<td></td>
		</tr>
		
		<?php 
			}//end if rows returned
			else
			{
				print '<tr bgcolor="#ffffff"><td align="right" nowrap></td><td bgcolor="#ffffff" align="left" nowrap colspan="4"><br><br><b>No Location information exists for this computer</b><br><br><br></td><td></td><td valign="top" nowrap>&nbsp;</td><td></td>	</tr>';
			}
		}//end if query successful
		?>
	
	</table><br><br>
</body>
</html>
<?php 

}//end if db connection
else
{
	print "No DB Connection";
	exit;
}
?>