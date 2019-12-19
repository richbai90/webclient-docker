<?php

$groupids = explode(",",$_POST['groupids']);
$where = "id in(";
foreach($groupids as $groupid) {
	$where .= "'".pfs($groupid)."',";
}

$where = rtrim($where, ",") . ")";

$sqlDatabase = "sw_systemdb";
$sqlCommand = "SELECT name FROM swgroups WHERE $where";