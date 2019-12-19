<?php

include('php5requirements.php');
//--Get Server Root
$swinstallpath = sw_getcfgstring("InstallPath");
if(strlen($swinstallpath) < 5)
{
	die;
}
//Get Core Services Root
$csinstallpath = sw_getcfgstring("CS\\InstallPath");
if(strlen($csinstallpath) < 5)
{
	die;
}

/////////////////////////////////////////////////////
//--Hornbill Launch CMDB Determin Import Actions--//
////////////////////////////////////////////////////
$strPath = $swinstallpath.'\scripts\cmdb_dia\cmdb_dia.exe';
header("Content-Type: text/xml");
echo "<params>";
echo "<Path>".$strPath."</Path>";
echo "</params>";
?>