<?php 
/* 
	Created by:	Hornbill
	Updates:

	code	date		author					description
	------------------------------------------------------------------------------------------------
	ind01	23/04/07	Ivan Nicholas Dorosh	Software breakdown not working.
	
*/
//ind01 inputed a variety of parameters
$bool_Primary = $_REQUEST["primary"];
$str_primary = $_REQUEST["primkey"];
$str_name = $_REQUEST["name"];
$strGenericID = $_REQUEST["gentypeid"];

if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;

include_once("../incl_odbc.php");

/*ind01	$query = "SELECT DISTINCT ProductType.Name, ProductType.ProductType FROM SoftwareRecognisedPrimary JOIN ProductType ON SoftwareRecognisedPrimary.ProductType = ProductType.ProductType WHERE SoftwareRecognisedPrimary.Client='".$compid."' ORDER BY ProductType.Name"; */
	$query = <<<PREP_SQL
		SELECT 
			DISTINCT [$str_primary] as primary_name, [$str_name] as display_name,
			[VersionNumber] as Number, [LastUsed], [Frequency] as defFrequency, [SerialNumber] AS FileName
		FROM 
			V_ReportSoftwareRecognisedBoth
		WHERE Client = $compid AND PrimarySoftware = $bool_Primary 
		ORDER BY display_name
PREP_SQL;

//ind01 print $query;
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
	  while ($row = odbc_fetch_array($results))
	  {
		 //ind01 Adjusted this to ensure that is worked for a variety of types.
		 print '<'.$strGenericID.'="'.(trim($row["primary_name"])).'"><displayname="'.(trim($row["display_name"])).'">'."\n";
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