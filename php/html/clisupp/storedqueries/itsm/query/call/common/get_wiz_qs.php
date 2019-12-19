<?php

  $intCallref = $_POST['callref'];
  if(!_validate_url_param($intCallref,"num")){
    echo generateCustomErrorString("-303","Failed to process query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
  }

  $sqlDatabase = "swdata";
  $sqlCommand = "select * from ITSM_OC_WIZ where FK_CALLREF =".$intCallref." ORDER BY seq ASC";
?>
