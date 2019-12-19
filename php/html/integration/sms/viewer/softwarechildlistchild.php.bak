<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) == 0)
{
	print "<br><br><br><br><center>Sorry, Micrsoft SMS integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}

global $strCompID;
global $strCompanyName;

include_once("../incl_odbc.php");

if (!$query) $query = "SELECT DISTINCT SoftwareProduct.ProductName FROM SoftwareInventory JOIN SoftwareProduct ON SoftwareInventory.ProductID = SoftwareProduct.ProductID WHERE SoftwareInventory.ClientID=".$strCompID." AND SoftwareProduct.CompanyName = '".$strCompanyName."' ORDER BY SoftwareProduct.ProductName";
if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<strProductName="'.(trim($row["ProductName"])).'">'."\n";
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