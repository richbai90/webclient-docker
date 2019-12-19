<?php

  $intCallref = $_POST['callref'];
  $intServiceID = $_POST['sid'];

  if( !_validate_url_param($intCallref,"num") ||
      !_validate_url_param($intServiceID,"num") ){
    $strCustomError = "Failed to process Request Authorisation Components query. SQL Injection Detected. Please contact your Administrator.";
    echo generateCustomErrorString("-303",$strCustomError);
    exit(0);
  }

  $sqlDatabase = "swdata";
  $sqlCommand = " SELECT  request_comp.description,
                          qty,
                          comp_price,
                          flg_isoptional
                  FROM    sc_rels,
                          request_comp
                  WHERE   request_comp.fk_callref = ".PrepareForSql($intCallref)."
                  AND     sc_rels.service_id = request_comp.name
                  AND     fk_service = ".PrepareForSql($intServiceID)."
                  ORDER BY flg_isoptional DESC, description ASC";
