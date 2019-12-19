<?php

// Call SWVpmeInvoke and pass in Bomgar Instance Name and LSID
$strPattern = "/^[a-zA-Z0-9]+$/";
$strLSID = $_REQUEST['lsid'];
$boolMatch = preg_match($strPattern,$strLSID);
if(!$boolMatch)
{
	exit;
}
if(strlen($strLSID)!=32)
	exit;

$strTool = $_REQUEST['tool'];
$boolMatch = preg_match($strPattern,$strTool);
if(!$boolMatch){
	exit;
}

if(strlen($strTool)>254)
	exit;

$out = array();
$vars = "lsid=".$strLSID."&tool=".$strTool;
$str = "\"\"".sw_getcfgstring("InstallPath")."\\bin\\swvpmeinvoke.exe\" -dd itsm -s \"recordRemoteSupportSession\" -args \"".$vars."\""; 
exec($str, $out);
print_r($out);

?>