<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) == 0)
{
	print "<br><br><br><br><center>Sorry, Micrsoft SMS integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $strCompID;
global $strTableName;

include_once("../incl_odbc.php");
if (!$query) $query = "SELECT DISTINCT TimeKey FROM ".$strTableName." WHERE MachineID=".$strCompID." ORDER BY TimeKey";
if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<strAuditDate="'.(trim($row["TimeKey"])).'">'."\n";
		}
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