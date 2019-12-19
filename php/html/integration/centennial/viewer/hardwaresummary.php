<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $audit;
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
//this page is both the general hardware summary page, and the listing of all hardware added during a particular audit.  If an audit value is passed to the page, then the page will display all hardware added during that audit.  Otherwise, it will display all hardware associated with a particular computer.
// Create a new connection object
if (!$audit){
	$query = "SELECT * FROM Hardware LEFT JOIN HardwareDisplay ON Hardware.HardwareType=HardwareDisplay.ID LEFT JOIN Manufacturer ON Hardware.Manufacturer=Manufacturer.Manufacturer LEFT JOIN HardwareType ON Hardware.HardwareType=HardwareType.Type AND Hardware.SubType=HardwareType.SubType WHERE Client='".$compid."' AND Hardware.Removed IS NULL ORDER BY HardwareDisplay.DisplayName";
}
else{
	if ($displayname=="Hardware Added"){
		$query = "SELECT * FROM Hardware LEFT JOIN HardwareDisplay ON Hardware.HardwareType=HardwareDisplay.ID LEFT JOIN Manufacturer ON Hardware.Manufacturer=Manufacturer.Manufacturer LEFT JOIN HardwareType ON Hardware.HardwareType=HardwareType.Type AND Hardware.SubType=HardwareType.SubType WHERE Client='".$compid."' AND Hardware.Removed IS NULL AND Discovered='".$audit."'ORDER BY HardwareDisplay.DisplayName";
	}//end if Hardware added
	else{
		$query = "SELECT * FROM Hardware LEFT JOIN HardwareDisplay ON Hardware.HardwareType=HardwareDisplay.ID LEFT JOIN Manufacturer ON Hardware.Manufacturer=Manufacturer.Manufacturer LEFT JOIN HardwareType ON Hardware.HardwareType=HardwareType.Type AND Hardware.SubType=HardwareType.SubType WHERE Client='".$compid."' AND Removed='".$audit."'ORDER BY HardwareDisplay.DisplayName";
	
	}//end else, Hardware removed
}//end else, there is an audit
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
		
		<?php if(!$displayname){?>
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;All Hardware Information&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<?php 
		}//end if displayname
		else{
			if ($displayname=="Hardware Added"){?>
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Hardware Added in <?php echo $auditdate?>  Audit&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
			<?php }//end if Hardware Added
			else{?>
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Hardware Removed in <?php echo $auditdate?>  Audit&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
			<?php }//end else Hardware Removed
		}
		while ($row = odbc_fetch_array($results))
		{?>
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;<?php print $row["DisplayName"]." ".trim($row["Model"]);?>&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		
		<?php if($row["Class"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Hardware Type:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Class"]);?>&nbsp;</td>
		</tr>
		<?php }
		else {
			if($row["HardwareType"]){
		?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Hardware Type:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["DisplayName"]);?>&nbsp;</td>
		</tr>
		<?php 
			}//end if
		}//end else
		if($row["SubType"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;SubType:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["SubClass"]);?>&nbsp;</td>
		</tr>
		<?php }if($row["Name"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Manufacturer:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Name"]);?>&nbsp;</td>
		</tr>
		<?php }if($row["Size"]){
			if($row["DisplayName"]=="Processor"){
		?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Size:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Size"]);?> MHz&nbsp;</td>
		</tr>
		<?php 
			}//end if processor
			else{?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Size:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print embify($row["Size"]);?>&nbsp;</td>
		</tr>
			<?php }//end else not processor
		
		}//end if Size
		if($row["HrdwBuildNumber"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Build Number:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["HrdwBuildNumber"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["HrdwServicePackNumber"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Service Pack Number:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["HrdwServicePackNumber"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["Driver"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Driver:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Driver"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["MacAddr"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;MAC Address:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["MacAddr"]);?>&nbsp;</td>
		</tr>
		<?php }
		for ($index=1;$index<9;$index++){
			if($row["IPAddr".$index]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;IP Address:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["IPAddr".$index]);?>&nbsp;</td>
		</tr>
		<?php   }//end if
		}//end for?>
		<?php if($row["DriveNum"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Drive Number:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["DriveNum"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["DriveLetter"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Drive Letter:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["DriveLetter"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["DiskLowSpace"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Disk Low Space:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print embify($row["DiskLowSpace"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["Parent"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Parent:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["Parent"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["BIOSDate"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;BIOS Date:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["BIOSDate"]);?>&nbsp;</td>
		</tr>
		<?php }
		if($row["ClientMfg"]){?>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Additional Info:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["ClientMfg"]);?>&nbsp;</td>
		</tr>
		<?php }?>
		
		
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