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
//ind01 provide ability to choose whether primary or secondary software.
$boolPrimary = $_REQUEST['primType']; //1 or 0
if($boolPrimary==1) {
	$str_Operator = "= 1";
} 
else {
	$str_Operator = "= 0";
}

include_once("../incl_odbc.php");

if (!$query) {
	
	/* ind01 updated query below to get information
	$query = "SELECT DISTINCT Manufacturer.Name, Manufacturer.Manufacturer FROM SoftwareRecognisedSecondary JOIN Manufacturer ON SoftwareRecognisedSecondary.Manufacturer = Manufacturer.Manufacturer WHERE SoftwareRecognisedSecondary.Client='".$compid."' ORDER BY Manufacturer.Name";

	*/

	$query = <<<PREP_SQL
		SELECT 
			DISTINCT [ManufacturerName] as Manufacturer, [ManufacturerName] as Name
		FROM 
			V_ReportSoftwareRecognisedBoth
		WHERE Client = $compid AND PrimarySoftware $str_Operator
		ORDER BY Manufacturer

PREP_SQL;
}


if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			
			print '<manuid="'.(trim($row["Manufacturer"])).'"><displayname="'.(trim($row["Name"])).'">'."\n";
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