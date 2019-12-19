<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;

include_once("../incl_odbc.php");
if (!$query) $query = "SELECT DISTINCT HardwareDisplay.DisplayName FROM HardwareDisplay JOIN Hardware ON HardwareDisplay.ID = Hardware.HardwareType WHERE Hardware.Client='".$compid."' AND Hardware.Removed IS NULL ORDER BY HardwareDisplay.DisplayName";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<name="'.(trim($row["DisplayName"])).'"><displayname="'.(trim($row["DisplayName"])).'">'."\n";
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