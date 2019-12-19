<?php
IncludeApplicationPhpFile("itsm.helpers.php");
$callValues = json_decode($_POST['callValues']);
$success = "Something very strange happened";

foreach($callValues as $table => $columns) {
	$success = xmlmc_addRecord($table, $columns);
}

if($success === true) {
	throwSuccess();
} else {
	throwProcessErrorWithMsg($success);
}