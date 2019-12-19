<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $audit;
global $displayname;
global $auditdate;
include_once("../incl_odbc.php");
// Create a new connection object

if ($displayname == "Hardware Added" || $displayname == "Hardware Removed"){
	include('hardwaresummary.php');
}
else{
	if (substr_count($displayname,"Unrecognised")>0){ 
		include('audsoftwarepage.php');
	}
	else{
		include('software.php');
	}
}
?>