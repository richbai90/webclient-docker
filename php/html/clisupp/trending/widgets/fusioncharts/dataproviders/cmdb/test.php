<?php
error_reporting(E_ALL);
$rs = new SqlQuery();
$rs->Query("select * from opencall limit 5");