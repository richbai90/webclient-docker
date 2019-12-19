<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $ordinal;
include_once("../incl_odbc.php");
//function to turn long numbers of bytes into megs and gigs
function embify($inputstring){
	$inputstring=str_replace(",","",$inputstring);
	$inputstring=$inputstring+0;
	if ($inputstring < 1024){
		return $inputstring." bytes";
	}
	else{
		if ($inputstring<1048576){
			return (sprintf("%.2f",($inputstring/1024))." KB");
		}
		else{
			if($inputstring<1073741824){
				return (sprintf("%.2f",($inputstring/1048576))." MB");
			}
			else{
				return (sprintf("%.2f",($inputstring/1073741824))." GB");
			}
		}
		
	}
}//end embify function
// Create a new connection object

$query = "SELECT * FROM SoftwareUnrecognised LEFT JOIN SoftwarePath ON SoftwareUnrecognised.SoftwarePath=SoftwarePath.SoftwarePath LEFT JOIN SoftwareFile ON SoftwareUnrecognised.SoftwareFile=SoftwareFile.SoftwareFile LEFT JOIN defUsage ON SoftwareUnrecognised.Frequency=defUsage.ID WHERE (SoftwareUnrecognised.Client = '".$compid."')";
if($ordinal=="primary"){
	$query.=" AND SoftwareUnrecognised.KeyBit='1'";
}
else{
	$query.=" AND SoftwareUnrecognised.KeyBit='0'";
}
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
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;File Location&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Size&nbsp;</span></td>
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
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;&nbsp;<?php print $row["Path"].'/'.$row["Filename"];?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="right" nowrap>&nbsp;&nbsp;<?php print embify($row["Size"]);?>&nbsp;</td>
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