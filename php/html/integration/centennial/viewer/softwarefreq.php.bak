<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $freqid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT *, SRDProduct.Name AS FileName, Manufacturer.Name AS ManuName, ProductType.Name AS ProdName FROM SoftwareRecognisedPrimary LEFT JOIN SRDProduct ON SoftwareRecognisedPrimary.SRDProduct=SRDProduct.SRDProduct LEFT JOIN Manufacturer ON SoftwareRecognisedPrimary.Manufacturer=Manufacturer.Manufacturer LEFT JOIN ProductType ON SoftwareRecognisedPrimary.ProductType=ProductType.ProductType LEFT JOIN SRDVersion ON SoftwareRecognisedPrimary.SRDVersion=SRDVersion.SRDVersion LEFT JOIN defUsage ON SoftwareRecognisedPrimary.Frequency=defUsage.ID WHERE SoftwareRecognisedPrimary.Client='".$compid."' AND SoftwareRecognisedPrimary.Frequency='".$freqid."' ORDER BY Manufacturer.Name";
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
			<td background="images/gradientbg.gif" nowrap colspan="11"><span class="header1">&nbsp;&nbsp;Software Information&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<tr>
			<td background="images/title.gif" nowrap width="1"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Manufacturer&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Software Name&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;Product Type&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap ><span class="header1">&nbsp;Version&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap ><span class="header1">&nbsp;Frequency&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;LastUsed&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
		
		<tr>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;&nbsp;<?php print trim($row["ManuName"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;&nbsp;<?php print trim($row["FileName"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;<?php print trim($row["ProdName"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;<?php print trim($row["Number"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;<?php print trim($row["defFrequency"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap width="100%">&nbsp;<?php print trim($row["LastUsed"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
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