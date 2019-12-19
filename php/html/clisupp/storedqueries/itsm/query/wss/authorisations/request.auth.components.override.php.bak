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
  $sqlCommand = " SELECT  a.description as override,
                          a.units as overqty,
                          b.*,
                          request_comp.qty,
                          request_comp.comp_price
                  FROM    sc_rels a,
                          sc_rels b,
                          request_comp
                  WHERE   a.fk_service=".PrepareForSql($intServiceID)."
                  AND     a.pk_auto_id=b.fk_service_rels
                  AND     b.description=request_comp.description
                  AND     fk_callref=".PrepareForSql($intCallref);
