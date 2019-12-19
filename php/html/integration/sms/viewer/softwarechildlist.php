<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) == 0)
{
	print "<br><br><br><br><center>Sorry, Micrsoft SMS integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}

global $strCompID;

include_once("../incl_odbc.php");
if (!$query) $query = "SELECT DISTINCT SoftwareProduct.CompanyName, SoftwareInventory.ClientId FROM SoftwareInventory JOIN SoftwareProduct ON SoftwareInventory.ProductID = SoftwareProduct.ProductID WHERE SoftwareInventory.ClientID=".$strCompID." ORDER BY CompanyName";
if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<strCompanyName="'.(trim($row["CompanyName"])).'">'."\n";
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