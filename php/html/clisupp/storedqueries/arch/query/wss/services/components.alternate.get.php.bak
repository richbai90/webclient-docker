<?php
	//----- SQL Injection & session checks
	$intServiceID = trim($_POST['servid']);
 	if(!_validate_url_param($intServiceID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve Service Components. Possible SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$strSql = "	SELECT fk_key, price, total_cost_for_item, pk_auto_id, fk_service, price_diff,
							CASE 
								WHEN fk_key = 0 THEN description
								WHEN fk_key IS NULL THEN description
								ELSE (SELECT vsb_title FROM sc_folio WHERE fk_cmdb_id = sc_rels.fk_key)
							END AS description
	 						FROM sc_rels
							WHERE fk_service_rels = " . prepareForSql($intServiceID);
	$sqlDatabase = "swdata";
	$sqlCommand = $strSql;
