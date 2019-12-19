<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
include_once('swdatabaseaccess.php');
include_once("../incl_odbc.php");

//function to escape characters for SQL strings
function squellify($inputstring){
	$inputstring=str_replace("\\","\\\\",$inputstring);
	$inputstring=str_replace("'","\'",$inputstring);
	$inputstring=str_replace('"','\"',$inputstring);
	return $inputstring;
}//end squellify function

// Establish an Altiris Database connection
if ($altsql = odbc_connect($databasename, $username, $password))
{
	// Establish SupportWorks Connection
	$connCache = new CSwDbConnection;
	if (!$connCache->Connect(swdsn(),swuid(),swpwd()))
	{
#		print "SupportWorks Connection Failed";
		odbc_close($altsql);
	}

	// Get all unique PCs
	if ($altPCs = odbc_exec($altsql,"SELECT *, computer.computer_id AS theid FROM computer LEFT JOIN location ON computer.computer_id = location.computer_id"))
	{
		$updated=0;
		$imported=0;
		$unchanged=0;
		while ($row = odbc_fetch_array($altPCs))
		{
			// Find the last update (in unixtime) from the SupportWorks equipment table. This will also tell us if we are updating or importing
			$query = "SELECT lastupdate FROM equipmnt WHERE equipid='".$row["computer_name"]."'";
			if($connCache->Query($query))
			{
				if ($connCache->Fetch("equipment"))
				{
					$lastupdate = $equipment_lastupdate;
					$query = "UPDATE equipmnt SET asset_no='".$row["theid"]."', location='".squellify($row["site"])."', owner='".squellify($row["lic_os_user"])."', serialno='".squellify($row["serial_num"])."', model='".squellify($row["prod_name"])."', manufactur='".squellify($row["manuf"])."', lastupdate='".squellify($row["last_inventory"])."' WHERE equipid='".squellify($row["computer_name"])."'";
					if ($equipment_lastupdate<$row["last_inventory"]){
						$connCache->Query($query);
						$updated++;
					}//end if item is more recent in altiris database, and is being updated
					else{
						$unchanged++;
					}//end item is more recent in sw database
				}//end if item is found in sw database
				else
				{
					$query = "INSERT INTO equipmnt (asset_no, location, owner, serialno, model, manufactur, lastupdate, equipid) VALUES ('".squellify($row["theid"])."', '".squellify($row["site"])."', '".squellify($row["lic_os_user"])."', '".squellify($row["serial_num"])."', '".squellify($row["prod_name"])."', '".squellify($row["manuf"])."', '".squellify($row["last_inventory"])."', '".squellify($row["computer_name"])."')";
					$connCache->Query($query);
					$imported++;
				}//end else we are inserting this item
			}//end query has been successful
		}//end while rows are being obtained in altiris query
	}//end altiris pcs found
}//end altiris connection ok		
else
{
	?>
	<h1><u>Altiris Integration - Import Report</u></h1>
	<blockquote>
	<br>Altiris Connection Failed
	<?php 
}
odbc_close($altsql);
$connCache->Close();
?>
<h1><u>Altiris Integration - Import Report</u></h1>
<blockquote>
<br>
<table>
<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b><?php echo ($imported + $updated + $unchanged)?></b></td><td>&nbsp;</td><td>Machines found in Altiris database</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $imported?></b></td><td>&nbsp;</td><td>Added to SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $updated?></b></td><td>&nbsp;</td><td>Updated in SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $unchanged?></b></td><td>&nbsp;</td><td>Unchanged</td></tr>
</table>
</blockquote>
