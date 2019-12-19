<?php
IncludeApplicationPhpFile("itsm.helpers.php");
$callValues = json_decode($_POST['callValues']);
$success = "Something very strange happened";

foreach ($callValues as $table => $columns) {

    if ($success !== true && $success !== "Something very strange happened") {
        break;
    }

    if (isset($columns->deleteMatching) && isset($columns->{$columns->deleteMatching})) {
        xmlmc_deleteRecord_where($table, $columns->deleteMatching . " = " . $columns->{$columns->deleteMatching}, "swdata", true);
        unset($columns->deleteMatching);
    }

    if (is_array($columns)) {
        // insert these
        foreach ($columns as $insertValues) {
            if (isset($insertValues->deleteMatching) && isset($insertValues->{$insertValues->deleteMatching})) {
                xmlmc_deleteRecord_where($table, $insertValues->deleteMatching . " = " . $insertValues->{$insertValues->deleteMatching}, "swdata", true);
                unset($insertValues->deleteMatching);
            }
            $success = xmlmc_addRecord($table, $insertValues);
            if ($success !== true) {
                break;
            }
        }

        continue;
    }
	$success = xmlmc_updateRecord($table, $columns);
}

if ($success === true) {
    throwSuccess();
} else {
    throwProcessErrorWithMsg($success);
}
