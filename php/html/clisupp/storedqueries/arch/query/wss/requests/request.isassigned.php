<?php

$callref = $_POST['callref'];
$analystID = $_POST['aid'];

$strSQL = "SELECT groupid FROM cstm_rel_opencall_archgroups WHERE callref =".PrepareForSQL($callref);
$aRS = get_recordset($strSQL, 'swdata');
$strGroups = "";
while($aRS->Fetch()) {
  $groupID = get_field($aRS, "groupid");
  if(isset($groupID) && $groupID != '') {
    $strGroups .= "'".PrepareForSQL($groupID)."',";
  }
}
$strGroups = rtrim($strGroups, ',');

$sqlDatabase = "sw_systemdb";
$sqlCommand = "SELECT COUNT(*) AS ct FROM swanalysts_groups WHERE analystid = '". PrepareForSQL($analystID) ."' AND groupid IN($strGroups)";
