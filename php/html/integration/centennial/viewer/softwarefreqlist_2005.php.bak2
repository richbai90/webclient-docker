<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
$boolPrimary = $_REQUEST['primType']; //1 or 0
if($boolPrimary==1) {
	$str_Operator = "= 1";
} 
else {
	$str_Operator = "= 0";
}

include_once("../incl_odbc.php");
/*if (!$query) $query = "SELECT DISTINCT defUsage.defFrequency, defUsage.ID FROM SoftwareRecognisedSecondary JOIN defUsage ON SoftwareRecognisedSecondary.Frequency = defUsage.ID WHERE SoftwareRecognisedSecondary.Client='".$compid."' ORDER BY defUsage.defFrequency";*/

	$query = <<<PREP_SQL
		SELECT DISTINCT
			 [ManufacturerName] AS ManuName, [Product] AS ProdName,
			 [VersionNumber] as Number, [LastUsed], [Frequency] as defFrequency, [SerialNumber] AS FileName
		FROM 
			V_ReportSoftwareRecognisedBoth
		WHERE Client = $compid AND PrimarySoftware $str_Operator
		ORDER BY defFrequency desc

PREP_SQL;
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			//print trim($row["ProdName"]).(trim($row["ProdName"])).' ('.(trim($row["defFrequency"]));
			print '<freqid="'.(trim($row["ProdName"])).'"><displayname="'.(trim($row["ProdName"])).' ('.(trim($row["defFrequency"])).')">'."\n";
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