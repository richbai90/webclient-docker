<?php
$callref = $_POST['callref'];
$status = $_POST['status'];
$flg_status = $_POST['flg_status'];
$fk_stage_id = $_POST['fk_stage_id'];
$comments = $_POST['comments'];

IncludeApplicationPhpFile("itsm.helpers.php");

$query = "SELECT pk_auth_id FROM bpm_oc_auth WHERE flg_status = 0 AND fk_auth_id = '" . $session->analystId . "' AND fk_callref = " . $callref . " AND fk_stage_id = " . $fk_stage_id;
$oRS = new SqlQuery();
$oRS->Query($query);
//-- Check for XMLMC Error
if($oRS->result==false)
{
	error_log($oRS->lastErrorResponse);
	throwSuccess(-1);
}
$i = 0;
while($oRS->Fetch()) {
	$data = array();
	$pk_auth_id = $oRS->GetValueAsString("pk_auth_id");
	$data["pk_auth_id"] = $pk_auth_id;
	$data["status"] = $status;
	$data["flg_status"] = $flg_status;
	$data["comments"] = $comments;
	$data["authortype"] = "Analyst";
	$data["actionby"] = $session->analystId;
	$data["actionbyname"] = $session->analystName;
	$data["actiondatex"] = time();
	$data["fk_auth_id"] = $session->analystId;
	$success = xmlmc_updateRecord("bpm_oc_auth", $data);
	$i++;
	if($success !== true) {
		error_log($success);
		throwSuccess(-1);
	}
}

throwSuccess($i);