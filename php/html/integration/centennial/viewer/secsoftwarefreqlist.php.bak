<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;

include_once("../incl_odbc.php");
if (!$query) $query = "SELECT DISTINCT defUsage.defFrequency, defUsage.ID FROM SoftwareRecognisedSecondary JOIN defUsage ON SoftwareRecognisedSecondary.Frequency = defUsage.ID WHERE SoftwareRecognisedSecondary.Client='".$compid."' ORDER BY defUsage.defFrequency";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<freqid="'.(trim($row["ID"])).'"><displayname="'.(trim($row["defFrequency"])).'">'."\n";
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