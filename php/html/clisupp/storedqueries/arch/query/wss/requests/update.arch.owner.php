<?php

$owner = $_POST["owner"];
$archId = $_POST["id"];

IncludeApplicationPhpFile("itsm.helpers.php");


$query = "select name from  swanalysts where analystid = '$owner'";
$oRS = new SqlQuery();
$oRS->Query($query, "sw_systemdb");
//-- Check for XMLMC Error
if($oRS->result==false)
{
	throwError(-200, $oRS->lastErrorResponse);
}
if(!$oRS->Fetch()) {
	throwError(-200, "No analysts exist with the given ID");
}

$name = $oRS->GetValueAsString("name");
if(!isset($name) || !$name || $name === "") {
	throwError(-200, "Name could not be retrieved for analyst with the given ID");
}
$data = array("id" => $archId, "accepted_by" => $owner, "accepted_by_name" => $name);
$success = xmlmc_updateRecord("cstm_rel_opencall_archgroups", $data);

if($success !== true) {
	throwError(-200, $success);
}

throwSuccess(1);