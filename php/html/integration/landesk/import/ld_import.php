<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000100) == 0)
{
	print "<br><br><br><br><center>Sorry, LANDesk integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
include_once('swdatabaseaccess.php');
include_once("../ld_incl_odbc.php");

$type_array["2000 Workstation"] = "2000WS";
$type_array["XP Workstation"] = "XPWS";
$type_array["NT Workstation"] = "NTWS";
$type_array["NT Server"] = "NTSV";
$type_array["2000 Server"] = "2000SV";
$type_array["Server 2003"] = "2003SV";
$type_array["AmigaOS 3.5"] = "AMIGA";

function typeconverter($str)
{
	if ($GLOBALS[type_array][$str]) return $GLOBALS[type_array][$str];
	return $str;
}

// Establish a LANDesk Database connection
if ($ldsql = odbc_connect($odbc_dsn, $odbc_usr, $odbc_pwd))
{
	// Establish SupportWorks Connection
	$GlenConn = new CSwDbConnection;
	if (!$GlenConn->Connect(swdsn(),swuid(),swpwd()))
	{
#		print "SupportWorks Connection Failed";
		odbc_close($ldsql);
		exit;
	}

	// Get all unique PC
	if ($lditems = odbc_exec($ldsql,"SELECT DISTINCT devicename FROM computer"))
	{
		$imported = 0;
		$updated = 0;
		$unchanged = 0;
		while ($row = odbc_fetch_array($lditems))
		{
			$swid = $row[devicename];
			// Find the last update (in unixtime) from the SupportWorks equipment table. This will also tell us if we are updating or importing
			$query = "SELECT lastupdate FROM equipmnt WHERE equipid='".$swid."'";
			if($GlenConn->Query($query))
			{
				if ($GlenConn->FetchLocal())
				{
					$lastupdate = $GlenConn->row[0];
					$import = false;
				}
				else
				{
					$lastupdate = 0;
					$import = true;
				}
			}
		
			// Find the last audit date string from the LANDesk coputer table and convert it to unixtime
			if ($results = odbc_exec($ldsql,"SELECT computer_idn,lastupdinvsvr FROM computer WHERE devicename='".$swid."'"))
			{
				$row = odbc_fetch_array($results);
				$id = $row[computer_idn];
				$lastaudit = $row[lastupdinvsvr];
				$lastaudit = mktime(substr($lastaudit,11,2), substr($lastaudit,14,2), substr($lastaudit,17,2), substr($lastaudit,5,2), substr($lastaudit,8,2), substr($lastaudit,0,4));
			}
		
			// Check to see if LANDesk has newer data than SupportWorks. If it does, import the new data & write to SupportWorks
			if ($lastupdate < $lastaudit)
			{
				if ($results = odbc_exec($ldsql,"SELECT type,fullname FROM computer WHERE computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$generic = typeconverter(trim($row[type]));
					$owner = $row[fullname];
				}
				if ($results = odbc_exec($ldsql,"SELECT manufacturer,model,serialnum FROM compsystem WHERE computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$manufacturer = $row[manufacturer];
					$model = $row[model];
					$serialno = $row[serialnum];
				}
			
				if ($results = odbc_exec($ldsql,"SELECT unmodeleddata.datastring FROM unmodeleddata,metaattributes,metaobjattrrelations WHERE unmodeleddata.metaobjattrrelations_idn=metaobjattrrelations.metaobjattrrelations_idn AND metaobjattrrelations.metaattributes_idn=metaattributes.metaattributes_idn AND metaattributes.def='sw_costcentre' AND unmodeleddata.computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$costcenter = $row[datastring] ? $row[datastring] : "Unknown";
				}
				else $costcenter = "Unknown";
			
				if ($results = odbc_exec($ldsql,"SELECT unmodeleddata.datastring FROM unmodeleddata,metaattributes,metaobjattrrelations WHERE unmodeleddata.metaobjattrrelations_idn=metaobjattrrelations.metaobjattrrelations_idn AND metaobjattrrelations.metaattributes_idn=metaattributes.metaattributes_idn AND metaattributes.def='sw_location' AND unmodeleddata.computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$location = $row[datastring] ? $row[datastring] : "Unknown";
				}
				else $location = "Unknown";
			
				if ($results = odbc_exec($ldsql,"SELECT unmodeleddata.datastring FROM unmodeleddata,metaattributes,metaobjattrrelations WHERE unmodeleddata.metaobjattrrelations_idn=metaobjattrrelations.metaobjattrrelations_idn AND metaobjattrrelations.metaattributes_idn=metaattributes.metaattributes_idn AND metaattributes.def='sw_site' AND unmodeleddata.computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$site = $row[datastring] ? $row[datastring] : "Unknown";
				}
				else $site = "Unknown";
			
				if ($results = odbc_exec($ldsql,"SELECT unmodeleddata.datastring FROM unmodeleddata,metaattributes,metaobjattrrelations WHERE unmodeleddata.metaobjattrrelations_idn=metaobjattrrelations.metaobjattrrelations_idn AND metaobjattrrelations.metaattributes_idn=metaattributes.metaattributes_idn AND metaattributes.def='sw_notes' AND unmodeleddata.computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$notes = $row[datastring] ? $row[datastring] : "Unknown";
				}
				else $notes = "Unknown";
			
				if ($results = odbc_exec($ldsql,"SELECT unmodeleddata.datastring FROM unmodeleddata,metaattributes,metaobjattrrelations WHERE unmodeleddata.metaobjattrrelations_idn=metaobjattrrelations.metaobjattrrelations_idn AND metaobjattrrelations.metaattributes_idn=metaattributes.metaattributes_idn AND metaattributes.def='sw_asset' AND unmodeleddata.computer_idn=".$id))
				{
					$row = odbc_fetch_array($results);
					$asset = $row[datastring] ? $row[datastring] : "Unknown";
				}
				else $asset = "Unknown";

				if ($import)
				{
					$query = "INSERT INTO equipmnt (equipid, manufactur, model, serialno, generic, owner, costcenter, location, site, notes, asset_no, lastupdate) VALUES ('".$swid."','".(trim($manufacturer))."', '".(trim($model))."', '".(trim($serialno))."', '".(trim($generic))."', '".(trim($owner))."', '".(trim($costcenter))."', '".(trim($location))."', '".(trim($site))."', '".(trim($notes))."', '".(trim($asset))."', ".$lastaudit.")";
					$imported++;
				}
				else
				{
					$query = "UPDATE equipmnt SET manufactur='".(trim($manufacturer))."', model='".(trim($model))."', serialno='".(trim($serialno))."', generic='".(trim($generic))."', owner='".(trim($owner))."', costcenter='".(trim($costcenter))."', location='".(trim($location))."', site='".(trim($site))."', notes='".(trim($notes))."', asset_no='".(trim($asset))."', lastupdate='".$lastaudit."' WHERE equipid='".$swid."'";
					$updated++;
				}
				$GlenConn->Query($query);
#				print $query.'<br><br>';
			}
			else $unchanged++;
		}
	}
}
else
{
	?>
	<h1><u>LANDesk Integration - Import Report</u></h1>
	<blockquote>
	<br>LANDesk Connection Failed
	<?php 
	exit;
}
odbc_close($ldsql);
$GlenConn->Close();
?>
<h1><u>LANDesk Integration - Import Report</u></h1>
<blockquote>
<br>
<table>
<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b><?php echo ($imported + $updated + $unchanged)?></b></td><td>&nbsp;</td><td>Machines found in LANDesk database</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $imported?></b></td><td>&nbsp;</td><td>Added to SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $updated?></b></td><td>&nbsp;</td><td>Updated in SupportWorks</td></tr>
<tr><td>&nbsp;</td><td><b><?php echo $unchanged?></b></td><td>&nbsp;</td><td>Unchanged</td></tr>
</table>
</blockquote>
