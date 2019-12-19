<?php
$callref = $_POST['callref'];
$fk_stage_id = $_POST['fk_stage_id'];

$sqlCommand = "SELECT count(pk_auth_id) as auth_required FROM bpm_oc_auth WHERE flg_status = 0 AND fk_auth_id = '" . $session->analystId . "' AND fk_callref = " . $callref . " AND fk_stage_id = " . $fk_stage_id;
