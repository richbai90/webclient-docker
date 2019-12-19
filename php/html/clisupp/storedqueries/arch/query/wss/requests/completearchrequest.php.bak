<?php

$archID = PrepareForSql(trim($_POST['archid']));

$strSQL = "SELECT complete FROM cstm_rel_opencall_archgroups WHERE id = $archID";
		$aRS = get_recordset($strSQL, 'swdata');
		if ($aRS->Fetch()) {
      $complete = get_field($aRS, "complete");
      if(isset($complete) && $complete == (int)1) {
        throwProcessErrorWithMsg("This request has already been completed in the context");
      }
    }

$sqlDatabase = "swdata";
$sqlCommand = "UPDATE cstm_rel_opencall_archgroups SET complete = 1, status = 'Completed' WHERE id = $archID";