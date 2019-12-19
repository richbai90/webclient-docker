<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

if(!$auditdate){
	$query = "SELECT COUNT(*) AS montecristo FROM SoftwareAud WHERE Client='".$compid."'";
}
else{
	if (substr_count($displayname,"Added")>0){
		$query = "SELECT COUNT(*) AS montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Discovered=".$auditid;
		$addrem= "Added";
	}
	else{
		$query = "SELECT COUNT(*) AS montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Removed=".$auditid;
		$addrem = "Removed";
	}
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
		<title>Software Overview</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Software Overview&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
		</tr>
		<tr>
			<td width="100%">
		<?php 
		while ($row = odbc_fetch_array($results))
		{
			if(!$auditdate){?>
			<table border="0" cellpadding="0" cellspacing="0" width="100%">
				<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Total Software Instances Detected on this Machine:</b>&nbsp;</td>
				<td align="left" nowrap width=-"100%"><?php echo trim($row["montecristo"])?></td>
			</tr>
			
			<tr>
				<td align="left" colspan="4"><img src="images/space.gif" height="7" width="1" alt=""></td>
			</tr>
			</table>
		<?php 
			}//end if auditdate
			else{?>
			<table border="0" cellpadding="0" cellspacing="0" width="100%">
				<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Total Software Instances <?php echo $addrem?> on <?php echo $auditdate?>:</b>&nbsp;</td>
				<td align="left" nowrap width=-"100%"><?php echo trim($row["montecristo"])?></td>
			</tr>
			
			<tr>
				<td align="left" colspan="4"><img src="images/space.gif" height="7" width="1" alt=""></td>
			</tr>
			</table>
			<?php }
		}//end while rows found?>
		
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