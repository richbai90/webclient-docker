<?php
$aid = PrepareForSql(trim($_POST['aid']));

$sqlDatabase = "sw_systemdb";
$sqlCommand = "select groupid from swanalysts_groups where analystID = '$aid'";