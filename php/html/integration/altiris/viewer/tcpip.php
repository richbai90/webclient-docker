<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT *, nics.nic_id AS theid FROM nics LEFT JOIN nic_interface ON nics.nic_id = nic_interface.nic_id AND nics.computer_id = nic_interface.id LEFT JOIN computer ON nics.computer_id = computer.computer_id WHERE nics.computer_id='".$compid."' ORDER BY nics.nic_id";
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
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;TCP/IP &nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;Network Adapter <?php print trim($row["nic_id"]);?>) <?php echo trim($row["nic_desc"])?>&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;MAC Address:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["mac_addr"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;IP Address:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["ip_use_dhcp"]);?> (through DHCP)&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Net Mask:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["mask"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Gateway:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["gateway"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;DNS Connection Suffix:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["ip_domain"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;DNS:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["ip_dns"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;WINS:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["ip_wins"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;PCI bus/device/function:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["nic_pci_bus"])."/".trim($row["nic_pci_device"])."/".trim($row["nic_pci_function"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Device ID:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["nic_device_id"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Vendor ID:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["nic_vendor_id"]);?>&nbsp;</td>
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