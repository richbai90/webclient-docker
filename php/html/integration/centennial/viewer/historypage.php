<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $auditid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT * FROM Audit WHERE Client='".$compid."' AND Audit='".$auditid."'";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		?>
			
		


<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Hardware</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Audit Information&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;<?php print trim($row["Requested"]);?>&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Audit Information Requested:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Requested"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Audit Information Received:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Received"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;File Types Included in Audit:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["IncludeFiles"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap valign="top">&nbsp;&nbsp;Audit Parameters:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff"><?php 
			$parameters = trim($row["Options"]);
			$query = "SELECT * FROM defAudit ORDER BY ID";
			if ($results = odbc_exec($msql,$query))
			{
				while($row = odbc_fetch_array($results)){
					if ($parameters & $row["ID"]){
						echo "&nbsp;".$row["Description"]."<BR>";
					}
				}//end while
			}//end if results
			
			
			?>&nbsp;</td>
		</tr>
		
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		<?php 
		}
		?>
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
?>