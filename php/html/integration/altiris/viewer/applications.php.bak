<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT * FROM application WHERE computer_id='".$compid."' AND name NOT LIKE '{%' ORDER BY name";
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
			<td background="images/gradientbg.gif" nowrap colspan="7"><span class="header1">&nbsp;&nbsp;Services&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		
		<tr>
			<td background="images/title.gif" nowrap width="1"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Name&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Description&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Publisher&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Version&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Product ID&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;System Component&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
		<tr bgcolor="#ffffff">
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["name"]);?>&nbsp;</td>
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["description"]);?>&nbsp;</td>
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["publisher"]);?>&nbsp;</td>
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["version"]);?>&nbsp;</td>
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["product_id"]);?>&nbsp;</td>
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php 
				switch ($row["sys_comp"]){
					case 0:
						print "No";
						break;
					case 1:
						print "Yes";
						break;
					default:
						print "No";
						break;
				}//end switch/case
			?>&nbsp;</td>
			<td></td>
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