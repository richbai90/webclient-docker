<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) == 0)
{
	print "<br><br><br><br><center>Sorry, Micrsoft SMS integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
include_once('swdatabaseaccess.php');
include_once("../incl_odbc.php");

//function to escape characters for SQL strings
function squellify($strInput){
	$strInput=str_replace("\\","\\\\",$strInput);
	$strInput=str_replace("'","\'",$strInput);
	$strInput=str_replace('"','\"',$strInput);
	return $strInput;
}//end squellify function

// Establish an SMS Database connection
// if connection isn't successful, print error and abort
if (!$dbSMS = odbc_connect($strDB, $strUser, $strPassword))
{
	?>
	<h1><u>SMS Integration - Import Report</u></h1>
	<blockquote>
	<br>SMS Connection Failed
	<?php 
}
else
{
	// SMS connection was successful
	// Establish SupportWorks Connection
	// if connection fails, print error and abort
	$dbConn = new CSwDbConnection;
	if (!$dbConn->Connect(swdsn(),swuid(),swpwd()))
	{
		?>
		<h1><u>SMS Integration - Import Report</u></h1>
		<blockquote>
		<br>Supportworks Connection Failed
		<?php 
	}
	else
	{
		// Supportworks connection was successful
		// Get all unique PCs from the Supportworks Database
		// This will read all of the Supportworks Database records into an associative array.  Then, a query will 
		// be made to the SMS Database, and as the records are looped through, one of three actions will take place: 
		// 	1.  Add to the SW Database if a record doesn't exist
		//  2.  If a record exists in the SW Database that has been updated more recently than the SMS Scan, leave it
		//      alone.
		//  3.  If the SMS record is more recent, update the Supportworks DB.
		//
		$swQuery = "SELECT lastupdate, equipid FROM equipmnt";
		
		$arrSWRecords = array();
		$arrSWRecords["lastupdate"] = array();
		
		if (!$dbConn->Query($swQuery))
		{
			echo "SW Query Failed";
		}
		else{
			while ($dbConn->Fetch("equipment"))
			{
				$arrSWRecords["lastupdate"][$equipment_equipid] = $equipment_lastupdate;
			}
		}
		
		// Issue a query to the SMS database and loop through records.
		
		$smsQuery = "
		SELECT DISTINCT
						System_DATA.Name0,
						MachineIdGroupXRef.MachineID,
						WorkstationStatus_DATA.LastHWScan, 
						Computer_System_DATA.Manufacturer00,
						Computer_System_DATA.Model0,
						PC_BIOS_DATA.SerialNumber00,
						User_DISC.User_Name0,
						Sites_DATA.SiteCode
						FROM
						MachineIdGroupXRef		LEFT JOIN	System_DATA
												ON			MachineIdGroupXRef.MachineID = System_DATA.MachineID
												LEFT JOIN	Computer_System_DATA
												ON			MachineIdGroupXRef.MachineID = Computer_System_DATA.MachineID
												LEFT JOIN	WorkstationStatus_DATA
												ON			MachineIdGroupXRef.MachineID = WorkstationStatus_DATA.MachineID
												LEFT JOIN	PC_BIOS_DATA
												ON			MachineIdGroupXRef.MachineID = PC_BIOS_DATA.MachineID
												LEFT JOIN	User_DISC
												ON			MachineIdGroupXRef.MachineID = User_DISC.ItemKey
												LEFT JOIN	Sites_DATA
												ON			MachineIdGroupXRef.MachineID = Sites_DATA.MachineID";
		
		if ($recSMS = odbc_exec($dbSMS,$smsQuery))
		{
			// keep tallies of how many records changed, etc.
			$updated=0;
			$imported=0;
			$unchanged=0;
			while ($row = odbc_fetch_array($recSMS))
			{
				$swQuery = "";
				if ($row["Name0"] !== "")
				{
					if (array_key_exists($row["Name0"],$arrSWRecords["lastupdate"]))
					{
						if ($arrSWRecords["lastupdate"][$row["Name0"]] < $row["LastHWScan"])
						{
							$updated++;
							$swQuery = "UPDATE equipmnt SET 
														lastupdate	=	'".squellify($row["LastHWScan"])."',
														manufactur	=	'".squellify($row["Manufacturer00"])."',
														model		=	'".squellify($row["Model0"])."',
														serialno	=	'".squellify($row["SerialNumber00"])."',
														owner		=	'".squellify($row["User_Name0"])."',
														site		=	'".squellify($row["SiteCode"])."',
														asset_no	=	'".squellify($row["MachineID"])."'
														
														WHERE equipid		=	'".squellify($row["Name0"])."'";
						}//end if SMS record is newer
						else
						{
							$unchanged++;
						}
					}// end if record exists
					else
					{
						$imported++;
						$swQuery = "INSERT INTO equipmnt (lastupdate, 
														equipid, 
														manufactur, 
														model, 
														serialno, 
														owner, 
														site, 
														asset_no)
					
																VALUES
													('".squellify($row["LastHWScan"])."',
														'".squellify($row["Name0"])."',
														'".squellify($row["Manufacturer00"])."',
														'".squellify($row["Model0"])."',
														'".squellify($row["SerialNumber00"])."',
														'".squellify($row["User_Name0"])."',
														'".squellify($row["SiteCode"])."',
														'".squellify($row["MachineID"])."'																
													)";
												
					} // end else is a new record, so insert
				} // end if record does not have an equipment id
			// $swQuery will be null if a) there is an existing SW record for the SMS asset, and 
			// b) the SW record is newer than the SMS one.
			// If the query is not null, execute it.
			
				if ($swQuery !== "")
				{
					$dbConn->Query($swQuery);
				}
			}//end while records returned
		}//end if query executed successfully
	}//end else SW connection was successful
}//end else SMS connection was successful

odbc_close($dbSMS);
$dbConn->Close();
?>
<h1><u>SMS Integration - Import Report</u></h1>
<blockquote>
<br>
<table>
<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b><?php echo ($imported + $updated + $unchanged)?></b></td><td>&nbsp;</td><td>Machines found in SMS database</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $imported?></b></td><td>&nbsp;</td><td>Added to SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $updated?></b></td><td>&nbsp;</td><td>Updated in SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $unchanged?></b></td><td>&nbsp;</td><td>Unchanged</td></tr>
</table>
</blockquote>
