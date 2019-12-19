<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $auditid;
global $displayname;

include_once("../incl_odbc.php");
switch ($displayname){
	case "Hardware Added":
		break;
	case "Hardware Removed":
		break;
	case "Primary Software (Added) by Manufacturer":
		$query = "SELECT DISTINCT Manufacturer.Name AS TheName, Manufacturer.Manufacturer AS TheID FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer WHERE SoftwareAud.Client='".$compid."' AND SoftwareAud.Discovered='".$auditid."' AND SoftwareAud.Recognised='1' AND SoftwareAud.KeyBit=1 ORDER BY Manufacturer.Name";
		if ($msql = odbc_connect($databasename, $username, $password))
		{
			if ($results = odbc_exec($msql,$query))
			{
				while ($row = odbc_fetch_array($results))
				{
					print '<manudisplayname="'.(trim($row["TheName"])).'"><manuid="'.(trim($row["TheID"])).'">'."\n";
				}
			}
		}
		break;
	case "Unrecognised Primary Software (Added)":
		break;
		
		case "Secondary Software (Added) by Manufacturer":
		$query = "SELECT DISTINCT Manufacturer.Name AS TheName, Manufacturer.Manufacturer AS TheID FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer WHERE SoftwareAud.Client='".$compid."' AND SoftwareAud.Discovered='".$auditid."' AND SoftwareAud.Recognised='1' AND SoftwareAud.KeyBit=0 ORDER BY Manufacturer.Name";
		if ($msql = odbc_connect($databasename, $username, $password))
		{
			if ($results = odbc_exec($msql,$query))
			{
				while ($row = odbc_fetch_array($results))
				{
					print '<manudisplayname="'.(trim($row["TheName"])).'"><manuid="'.(trim($row["TheID"])).'">'."\n";
				}
			}
		}
		break;
	case "Unrecognised Secondary Software (Added)":
		break;
		
		
		
		
	case "Primary Software (Removed) by Manufacturer":
		$query = $query = "SELECT DISTINCT Manufacturer.Name AS TheName, Manufacturer.Manufacturer AS TheID FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer WHERE SoftwareAud.Client='".$compid."' AND SoftwareAud.Removed='".$auditid."' AND SoftwareAud.Recognised='1' AND SoftwareAud.KeyBit=1 ORDER BY Manufacturer.Name";
		if ($msql = odbc_connect($databasename, $username, $password))
		{
			if ($results = odbc_exec($msql,$query))
			{
				while ($row = odbc_fetch_array($results))
				{
					print '<manudisplayname="'.(trim($row["TheName"])).'"><manuid="'.(trim($row["TheID"])).'">'."\n";
				}
			}
		}
		break;
	case "Unrecognised Primary Software (Removed)":
		break;
	case "Secondary Software (Removed) by Manufacturer":
		$query = "SELECT DISTINCT Manufacturer.Name AS TheName, Manufacturer.Manufacturer AS TheID FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer WHERE SoftwareAud.Client='".$compid."' AND SoftwareAud.Removed='".$auditid."' AND SoftwareAud.Recognised='1' AND SoftwareAud.KeyBit=0 ORDER BY Manufacturer.Name";
		if ($msql = odbc_connect($databasename, $username, $password))
		{
			if ($results = odbc_exec($msql,$query))
			{
				while ($row = odbc_fetch_array($results))
				{
					print '<manudisplayname="'.(trim($row["TheName"])).'"><manuid="'.(trim($row["TheID"])).'">'."\n";
				}
			}
		}
		break;
	case "Unrecognised Secondary Software (Removed)":
		break;
		
		
	default:
		break;
}//end switch
?>