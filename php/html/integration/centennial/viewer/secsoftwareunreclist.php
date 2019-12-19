<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;

include_once("../incl_odbc.php");
if (!$query) $query = "SELECT DISTINCT defShortcutLocation.ID, defShortcutLocation.Description FROM SoftwareRecognisedSecondary JOIN defShortcutLocation ON SoftwareRecognisedSecondary.ShortcutLocation = defShortcutLocation.ID WHERE SoftwareRecognisedSecondary.Client='".$compid."' ORDER BY defShortcutLocation.Description";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<name="'.(trim($row["ID"])).'"><unit="'.(trim($row["Description"])).'">'."\n";
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