<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT *, ClientType.ClientType AS TheType, Client.ID AS ClientID, Client.Status AS TheStatus, Organisation.Name AS OrgName, Schedules.Name AS SchedName FROM Client LEFT JOIN ClientType ON Client.Type=ClientType.ID LEFT JOIN Organisation ON Client.Organisation=Organisation.Organisation LEFT JOIN Schedules ON Schedules.Schedules=Client.Schedules WHERE Client='".$compid."'";
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
			<td width="100%">
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
			<table border="0" cellpadding="0" cellspacing="0" width="100%">
				<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Name:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["Description"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Type:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["TheType"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;OU:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["OrgName"])?>" size="40" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Status:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php   
				if ($row["TheStatus"] & 1){
					echo "Registered";
				}
				else{
					echo "Unregistered";
				}
				if ($row["TheStatus"] & 2){
					echo ", Audit Requested";
				}
				if ($row["TheStatus"] & 4){
					echo ", Audit Completed";
				}
				if ($row["TheStatus"] & 8){
					echo ", Remove Pending";
				}
				if ($row["TheStatus"] & 16){
					echo ", Client Remove";
				}
				if ($row["TheStatus"] & 32){
					echo ", Schedule Pending";
				}
				if ($row["TheStatus"] & 64){
					echo ", Audit Scheduled";
				}
				if ($row["TheStatus"] & 128){
					echo ", Name Change Pending";
				}
				if ($row["TheStatus"] & 256){
					echo ", Unlicensed";
				}
				if ($row["TheStatus"] & 512){
					echo ", Switch Has Ports";
				}
				if ($row["TheStatus"] & 1024){
					echo ", Portable Computer";
				}
				if ($row["TheStatus"] & 2048){
					echo ", Invalid";
				}

				?>" size="60" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;ID:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["ClientID"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Last Contact Date:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["LastContact"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Audit Schedule:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["SchedName"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Client Address:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["Address"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Client Version:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["ClientVersion"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Comms. Method:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php 
				switch ($row["CommsMethod"]){
					case 0:
						echo "Invalid";
					case 1:
						echo "Network";
						break;
					case 2:
						echo "Diskette";
						break;
					case 3:
						echo "Email";
						break;
					case 4:
						echo "Internet";
						break;
					default:
						echo "Invalid";
						break;
				}//end switch/case
				?>" size="27" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;MAC Address:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php 
					echo trim($row["MacAddr1"]);
					if ($row["MacAddr2"]){ echo ", ".$row["MacAddr2"];}
					if ($row["MacAddr3"]){ echo ", ".$row["MacAddr3"];}
					?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;IP Address:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php 
					echo trim($row["IPAddr1"]);
					if ($row["IPAddr2"]){ echo ", ".$row["IPAddr2"];}
					if ($row["IPAddr3"]){ echo ", ".$row["IPAddr3"];}
					?>" size="59" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="left" colspan="4"><img src="images/space.gif" height="7" width="1" alt=""></td>
			</tr>
			</table>
		<?php }//end while rows found?>
		
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