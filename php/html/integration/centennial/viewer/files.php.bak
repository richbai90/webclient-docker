<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $unit;
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
$query = "SELECT SUM(Occurrences) AS TotFiles, SUM(TotalSizeKb) AS TotSpace FROM ExtensionDetails WHERE Client='".$compid."'";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
		$totalfiles = $row["TotFiles"];
		$totalspace = $row["TotSpace"];
		}
	}
}

$query = "SELECT * FROM ExtensionDetails WHERE Client='".$compid."' ORDER BY Ext";
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
			<td background="images/gradientbg.gif" nowrap colspan="11"><span class="header1">&nbsp;&nbsp;Disk Space Usage by File Type&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		
		<tr>
			<td background="images/title.gif" nowrap width="1"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;File Type&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Description&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Space&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;% Used Space&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;No. Files&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;%Total Files&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<?php 
		$color="#ffffff";
		while ($row = odbc_fetch_array($results))
		{?>
		<tr bgcolor="<?php echo $color?>">
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["Ext"]);?>&nbsp;</td>
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;<?php print trim($row["Description"]);?>&nbsp;</td>
			<td></td>
			<td align="right">&nbsp;&nbsp;<?php print embify($row["TotalSizeKb"]);?>&nbsp;</td>
			<td></td>
			<td align="right"><?php 
			if ($totalspace>0){
				printf ("%.2f",(($row["TotalSizeKb"]/$totalspace)*100)); echo "%";
			}
			?></td>
			<td></td>
			<td align="right">&nbsp;&nbsp;<?php print trim($row["Occurrences"]);?>&nbsp;</td>
			<td></td>
			<td align="right"><?php 
			if ($totalfiles>0){
				printf ("%.2f",(($row["Occurrences"]/$totalfiles)*100)); echo "%";
			}
			?></td>
			<td></td>
		</tr>
		
		
		<?php 
			if ($color=="#ffffff"){$color="#cfe7ff";} else{$color="#ffffff";}
		}//end while results
		?>
	</table><br>
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