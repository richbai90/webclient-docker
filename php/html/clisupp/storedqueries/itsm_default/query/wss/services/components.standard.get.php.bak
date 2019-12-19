<?php
	//----- SQL Injection & session checks
	$intServiceID = trim($_POST['servid']);
	$boolIsOptional = trim($_POST['optional']);

 	if(	!_validate_url_param($intServiceID,"num") ||
			!_validate_url_param($boolIsOptional,"bool")){
		echo generateCustomErrorString("-303","Failed to retrieve Service Components. Possible SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	$strSql = "	SELECT fk_key, price, total_cost_for_item, pk_auto_id, fk_service, flg_cancustomise,	
						CASE
							WHEN fk_key IS NULL THEN description
							WHEN fk_key = 0 THEN description
						ELSE (SELECT vsb_title FROM sc_folio WHERE fk_cmdb_id = sc_rels.fk_key)
						END AS description
				FROM sc_rels
				WHERE fk_service = " . prepareForSql($intServiceID)."
				AND cost_type='component'
				AND apply_type='Per Request' ";

	if($boolIsOptional == "true") {
		$strSql .= "AND flg_isoptional=0
								AND flg_isoptional is not null";
	} else {
		$strSql .= "AND flg_isoptional=1";
	}


	$sqlDatabase = "swdata";
	$sqlCommand = $strSql;
