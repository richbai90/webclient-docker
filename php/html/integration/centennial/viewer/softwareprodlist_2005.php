<?php 
/* 
	Created by:	Hornbill
	Updates:

	code	date		author					description
	------------------------------------------------------------------------------------------------
	ind01	23/04/07	Ivan Nicholas Dorosh	Software breakdown not working.
	
*/



if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;

include_once("../incl_odbc.php");
if (!$query) {
/*ind01	updated main query
$query = "SELECT DISTINCT ProductType.Name, ProductType.ProductType FROM SoftwareRecognisedPrimary JOIN ProductType ON SoftwareRecognisedPrimary.ProductType = ProductType.ProductType WHERE SoftwareRecognisedPrimary.Client='".$compid."' ORDER BY ProductType.Name"; */
	$query = <<<PREP_SQL
		SELECT 
			DISTINCT [ManufacturerName] as Manufacturer, [Product] as ProductType
		FROM 
			V_ReportSoftwareRecognisedBoth
		WHERE Client = $compid AND PrimarySoftware = 1
		ORDER BY ProductType
PREP_SQL;
}

if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
	  while ($row = odbc_fetch_array($results))
	  {
		 print '<prodtypeid="'.(trim($row["ProductType"])).'"><displayname="'.(trim($row["ProductType"])).'">'."\n";
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