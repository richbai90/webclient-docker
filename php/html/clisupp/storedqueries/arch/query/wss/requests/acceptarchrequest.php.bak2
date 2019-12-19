<?php
$aid = PrepareForSql(trim($_POST['aid']));
$aName = PrepareForSql(trim($_POST['aname']));
$archID = PrepareForSql(trim($_POST['archid']));

$strSQL = "SELECT accepted_by_name FROM cstm_rel_opencall_archgroups WHERE id = $archID";
		$aRS = get_recordset($strSQL, 'swdata');
		if ($aRS->Fetch()) {
      $acceptedBy = get_field($aRS, "accepted_by_name");
      if(isset($acceptedBy) && $acceptedBy != '') {
        throwProcessErrorWithMsg("This request has already been accepted in the context by $acceptedBy");
      }
    }

$sqlDatabase = "swdata";
$sqlCommand = "UPDATE cstm_rel_opencall_archgroups SET accepted_by = '$aid', accepted_by_name = '$aName', status = 'In Progress' WHERE id = $archID";