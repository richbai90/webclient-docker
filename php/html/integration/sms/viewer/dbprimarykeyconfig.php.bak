<?php 
// This page takes the primary key or display value for the computer, and returns both as
// variables that can be used throughout the xml file.
//
// It also checks to make sure that the client has a licence to run the viewer before it will let them 
// access the application.
//
// ************************** LICENCE KEY CHECK *****************************
//
// This checks the license key to make sure they have permissions to run the viewer.  
// 0x00000100, "LANDesk Connector",
// 0x00000200, "ZenWorks Connector",
// 0x00000400, "Microsoft SMS Connector",
// 0x00000800, "Centennial Connector",
// 0x00001000, "Altiris Connector",
print '<variables>'."\n";
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) !== 0)
{
	print '		<variable name="strLicenceKey" value="1"/>'."\n";
}


// ************************ PRIMARY KEY ASSIGNMENT ***************

$strKeyValue		=	 $HTTP_GET_VARS[strCompID];
$strDisplayValue 	=	 $HTTP_GET_VARS[strCompName];


include_once("../incl_odbc.php");

if ($strKeyValue){
	$query = "SELECT System_DATA.Name0, MachineIdGroupXRef.MachineID FROM MachineIdGroupXRef LEFT JOIN System_DATA ON ";
	$query .= "MachineIdGroupXRef.MachineID = System_DATA.MachineID WHERE MachineIdGroupXRef.MachineID = '".$strKeyValue."'";
}
if ($strDisplayValue){
	$query = "SELECT System_DATA.Name0, MachineIdGroupXRef.MachineID FROM MachineIdGroupXRef LEFT JOIN System_DATA ON ";
	$query .= "MachineIdGroupXRef.MachineID = System_DATA.MachineID WHERE System_DATA.Name0 = '".$strDisplayValue."'";
}
if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	if ($results = odbc_exec($msql,$query))
	{
		$row = odbc_fetch_array($results);

		
		print '		<variable name="strCompName" value="'.$row["Name0"].'"/>'."\n";
		print '		<variable name="strCompID" value="'.$row["MachineID"].'"/>'."\n";
	}
	else
	{
		print "No Rows Returned";
	}
}
else
{
	print "No DB Connection";
}
print '</variables>'."\n";
?>
