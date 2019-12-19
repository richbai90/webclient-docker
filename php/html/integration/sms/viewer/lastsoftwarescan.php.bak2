<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) == 0)
{
	print "<br><br><br><br><center>Sorry, Micrsoft SMS integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
// This file will return a table of all records in the named database table 
// for the named computer

include_once("../incl_odbc.php");
global $strCompID;
global $strTableName;
?>
<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title><?php echo $strPageTitle?></title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">

<table border="0" cellpadding ="0" cellspacing="0" width="100%">
<tr>
	<td><table border="0" cellpadding ="0" cellspacing="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;<?php echo $strPageTitle?>&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
	</table></td>
</tr>
<tr>
	<td><table border="0" cellpadding = "0" cellspacing="0" width="100%">
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">Last Software Inventory Collection</td><td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">Last File Collection</td><td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
		</tr>

<?php 

$query = "SELECT * FROM SoftwareInventoryStatus WHERE SoftwareInventoryStatus.ClientId = ".$strCompID;
if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	$nResults = 0;
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			$nResults++;
			echo "<tr><td>";
				// if an image has been specified in the URL, print it here.
				if ($strImage)
				{
					echo '<img src="images/'.$strImage.'" valign="middle" vspace="1">';
				}//end if
			echo "</td>";
			echo "<td nowrap>";
			echo $row["LastUpdateDate"]."</td><td></td>";
			echo $row["LastCollFileUpdateDate"]."</td><td></td>";
			echo "</tr>";
		}//end while records returned
	}//end if query is successful
} //end if connection is successful
?>
		</table>
		<?php if ($nResults == 0)
		{
			echo "<center>There are no items to show in this view</center>";
		}?>
	</td>
</tr>
</table>	

</body>
</html>