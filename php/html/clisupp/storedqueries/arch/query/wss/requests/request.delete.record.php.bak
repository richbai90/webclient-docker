<?php
IncludeApplicationPhpFile("itsm.helpers.php");
$callValues = json_decode($_POST['callValues'], true);
$success = "Something very strange happened";

foreach($callValues as $table => $columns) {
    if(!isset($columns[$columns['pk']])) {
        $success = "Missing primary key for table $table. Unable to delete record";
        break;
    }
	$success = xmlmc_deleteRecord($table, $columns[$columns['pk']]);
}

if($success === true) {
	throwSuccess();
} else {
	throwProcessErrorWithMsg($success);
}