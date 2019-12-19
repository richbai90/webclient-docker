<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
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

// Establish a Centennial Database connection
if ($censql = odbc_connect($databasename, $username, $password))
{
	// Establish SupportWorks Connection
	$connCache = new CSwDbConnection;
	if (!$connCache->Connect(swdsn(),swuid(),swpwd()))
	{
#		print "SupportWorks Connection Failed";
		odbc_close($censql);
	}

	// Get all unique PC
	if ($cenPCs = odbc_exec($censql,"SELECT *, Organisation.Name AS theOrganisation, Location.Name AS theLocation, Manufacturer.Name AS theManufacturer FROM Client LEFT JOIN Organisation ON Client.Organisation=Organisation.Organisation LEFT JOIN Location ON Client.Location=Location.Location LEFT JOIN Hardware ON Hardware.Client=Client.Client LEFT JOIN Manufacturer ON Manufacturer.Manufacturer=Hardware.Manufacturer WHERE HardwareType=1"))
	{
		$updated=0;
		$imported=0;
		$unchanged=0;
		while ($row = odbc_fetch_array($cenPCs))
		{
			// Find the last update (in unixtime) from the SupportWorks equipment table. This will also tell us if we are updating or importing
			$query = "SELECT lastupdate FROM equipmnt WHERE equipid='".squellify($row["sysMachine"])."'";
			if($connCache->Query($query))
			{
				if ($connCache->Fetch("equipment"))
				{
					$lastupdate = $equipment_lastupdate;
					$query = "UPDATE equipmnt SET asset_no='".squellify($row["sysMachine"])."', notes='".squellify($row["Memos"])."', site='".squellify($row["theOrganisation"])."', location='".squellify($row["theLocation"])."', owner='".squellify($row["Description"])."', serialno='".squellify($row["sysSerialNo"])."', model='".squellify($row["Model"])."', manufactur='".squellify($row["theManufacturer"])."', lastupdate='".squellify($row["lastScanned"])."' WHERE equipid='".squellify($row["sysMachine"])."'";
					if ($equipment_lastupdate<$row["lastScanned"]){
						$connCache->Query($query);
						$updated++;
					}//end if item is more recent in centennial database, and is being updated
					else{
						$unchanged++;
					}//end item is more recent in sw database
				}//end if item is found in sw database
				else
				{
					$query = "INSERT INTO equipmnt (asset_no, notes, site, location, owner, serialno, model, manufactur, lastupdate, equipid) VALUES ('".squellify($row["sysMachine"])."', '".squellify($row["Memos"])."', '".squellify($row["theOrganisation"])."', '".squellify($row["theLocation"])."', '".squellify($row["Description"])."', '".squellify($row["sysSerialNo"])."', '".squellify($row["Model"])."', '".squellify($row["theManufacturer"])."', '".squellify($row["lastScanned"])."', '".squellify($row["sysMachine"])."')";
					$connCache->Query($query);
					$imported++;
				}//end else we are inserting this item
			}//end query has been successful
		}//end while rows are being obtained in centennial query
	}//end centennial pcs found
}//end centennial connection ok		
else
{
	?>
	<h1><u>Centennial Integration - Import Report</u></h1>
	<blockquote>
	<br>Centennial Connection Failed
	<?php 
}
odbc_close($censql);
$connCache->Close();
?>
<h1><u>Centennial Integration - Import Report</u></h1>
<blockquote>
<br>
<table>
<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b><?php echo ($imported + $updated + $unchanged)?></b></td><td>&nbsp;</td><td>Machines found in Centennial database</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $imported?></b></td><td>&nbsp;</td><td>Added to SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $updated?></b></td><td>&nbsp;</td><td>Updated in SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $unchanged?></b></td><td>&nbsp;</td><td>Unchanged</td></tr>
</table>
</blockquote>
