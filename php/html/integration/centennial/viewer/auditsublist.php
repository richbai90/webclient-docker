<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $auditid;

include_once("../incl_odbc.php");

//if there is Hardware, print some hardware
if (!$query) $query = "SELECT COUNT(*) AS montecristo FROM Hardware WHERE Client='".$compid."' AND Discovered='".$auditid."'";
if ($msql = odbc_connect($databasename, $username, $password))
{
	//begin if/else for hardware added
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Hardware Added">'."\n";
			}
		}
	}//end if hardware added
	
	//begin if/else for primary software added
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Discovered='".$auditid."' AND Recognised='1' AND KeyBit=1";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Primary Software (Added) by Manufacturer">'."\n";
			}
		}
	}
	//end if/else for primary software added
	//begin if/else for unknown primary software added
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Discovered='".$auditid."' AND Recognised='0' AND KeyBit=1";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Unrecognised Primary Software (Added)">'."\n";
			}
		}
	}
	//end if/else for unknown primary software added
	//begin if/else for secondary software added
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Discovered='".$auditid."' AND Recognised='1' AND KeyBit=0";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Secondary Software (Added) by Manufacturer">'."\n";
			}
		}
	}
	//end if/else for secondary software added
	//begin if/else for unknown secondary software added
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Discovered='".$auditid."' AND Recognised='0' AND KeyBit=0";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Unrecognised Secondary Software (Added)">'."\n";
			}
		}
	}
	//end if/else for unknown secondary software added
	//begin if/else for hardware removed
	$query = "SELECT COUNT(*) AS montecristo FROM Hardware WHERE Client='".$compid."' AND Removed='".$auditid."' AND KeyBit=1";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Hardware Removed">'."\n";
			}
		}
	}
	//end if/else for hardware removed
	//begin if/else for primary software removed
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Removed='".$auditid."' AND Recognised='1' AND KeyBit=1";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Primary Software (Removed) by Manufacturer">'."\n";
			}
		}
	}
	//end if/else for primary software removed
	//begin if/else for unknown primary software removed
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Removed='".$auditid."' AND Recognised='0' AND KeyBit=1";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Unrecognised Primary Software (Removed)">'."\n";
			}
		}
	}
	//end if/else for unknown primary software removed
	//begin if/else for secondary software removed
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Removed='".$auditid."' AND Recognised='1' AND KeyBit=0";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Secondary Software (Removed) by Manufacturer">'."\n";
			}
		}
	}
	//end if/else for secondary software removed
	//begin if/else for unknown secondary software removed
	$query = "SELECT COUNT(*) as montecristo FROM SoftwareAud WHERE Client='".$compid."' AND Removed='".$auditid."' AND Recognised='0' AND KeyBit=0";
	if ($results = odbc_exec($msql,$query))
	{
		if ($row = odbc_fetch_array($results))
		{
			if($row["montecristo"]>0){
				print '<displayname="Unrecognised Secondary Software (Removed)">'."\n";
			}
		}
	}
	//end if/else for unknown secondary software added
	
	
}//end if connection happened
else
{
	print "No DB Connection";
	exit;
}
?>