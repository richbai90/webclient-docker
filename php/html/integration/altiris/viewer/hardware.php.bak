<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT * FROM hardware JOIN computer ON hardware.computer_id = computer.computer_id WHERE hardware.computer_id='".$compid."'";
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
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Hardware&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
		</tr>
		<tr>
			<td width="100%"><br><br>
		<?php 
		if ($row = odbc_fetch_array($results))
		{?>
			<table border="0" cellpadding="0" cellspacing="0">
				<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Processor:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["proc_desc"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Processor Count:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["proc_count"])?>" size="10" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;RAM:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $row["ram_total"]."MB total (".$row["ram_free"]."MB free)"?>" size="30" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Display:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $row["res_horz"]." x ".$row["res_vert"]." (".$row["res_bitspp"]." bit)"?>" size="30" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Manufacturer:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["manuf"])?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Model:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["model_num"])?>" size="21" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Product Name:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo trim($row["prod_name"])?>" size="40" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap valign="top"><img src="images/space.gif" height="7" width="1" alt=""><br><b>&nbsp;&nbsp;MAC Address:</b>&nbsp;</td>
				<td align="left" nowrap><?php  //want to do another query, so assigning remaining values to variables
				$serial_num = trim($row["serial_num"]);
				$asset_tag = trim($row["asset_tag"]);
				$uuid = $row["uuid"];
				$wol_support = $row["wol_support"];
				$pxe_support = $row["pxe_support"];
				$bios_version = $row["bios_version"];
				$bios_release_date = $row["bios_release_date"];
				$query = "SELECT * FROM nics WHERE computer_id = '".$compid."' ORDER BY mac_addr";
				if ($results = odbc_exec($msql,$query))
				{
					while($row = odbc_fetch_array($results)){
				?>
				<input type="text" class="textboxstyle" value="<?php echo trim($row["mac_addr"])?>" size="50" onfocus="this.blur();"><br>
				<?php 
					}//end while
				}//end if results
				?></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Serial Number:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $serial_num?>" size="40" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Asset Tag:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $asset_tag?>" size="27" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;UUID:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $uuid?>" size="50" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;Wake on LAN:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php 
				if ($wol_support==0){echo "Not Supported";} else {echo "Supported";}
				?>" size="27" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;PXE:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php 
				if ($pxe_support==0){echo "Not Supported";} else {echo "Supported";}
				?>" size="27" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;BIOS Version:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $bios_version?>" size="27" onfocus="this.blur();"></td>
			</tr>
			<tr>
				<td align="right" nowrap><b>&nbsp;&nbsp;BIOS Release Date:</b>&nbsp;</td>
				<td align="left" nowrap><input type="text" class="textboxstyle" value="<?php echo $bios_release_date?>" size="27" onfocus="this.blur();"></td>
			</tr>

			<tr>
				<td align="left" colspan="4"><img src="images/space.gif" height="7" width="1" alt=""></td>
			</tr>
			</table>
		<?php }//end if rows found?>
		
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