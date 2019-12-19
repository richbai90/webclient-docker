<?php

	$sqlDatabase = "swdata";

	$sqlDatabase = "swdata";
	$serviceID = $_POST['sid'];
	$controller = $_POST['executable'];

	switch ($controller) {
    	case "business_overview":
    		$sqlCommand = "select service_name, fk_status_level, status_portfolio, service_type, status_lifecycle, catalog_type, vsb_flg_bo_demand, users_actual, owner_it, users_projected, owner_business, users_difference, users_maximum, service_desc, vsb_flg_bo_sla_data, flg_invisible_public, vsb_key_features, vsb_description from sc_folio, config_itemi where pk_auto_id = fk_cmdb_id and fk_cmdb_id =".$serviceID;
        	break;
    	case "general_cost":
        	$sqlCommand = "select service_name,cost_request from sc_folio where fk_cmdb_id = " . $serviceID;
        	break;
    	case "general_cost_week":
        	$offset = 86400;
			$startoflastweek = date('U', swtime("startoflastweek")+$offset);
			$endoflastweek = date('U', swtime("endoflastweek")+$offset);
			$sqlCommand = "select sc_folio.cost_request from sc_folio, config_itemi, cmn_rel_opencall_ci, opencall where pk_auto_id = fk_cmdb_id and pk_auto_id = fk_ci_auto_id and fk_callref = callref and fk_cmdb_id = ".$serviceID. " and (logdatex >= ".$startoflastweek." and logdatex <= ".$endoflastweek.")";
        	break;
    	case "general_cost_month":
        	$startoflastmonth = date('U', swtime("startoflastmonth"));
			$endoflastmonth = date('U', swtime("endoflastmonth"));

			$sqlCommand = "select sc_folio.cost_request from sc_folio, config_itemi, cmn_rel_opencall_ci, opencall where pk_auto_id = fk_cmdb_id and pk_auto_id = fk_ci_auto_id and fk_callref = callref and fk_cmdb_id = ".$serviceID. " and (logdatex >= ".$startoflastmonth." and logdatex <= ".$endoflastmonth.")";
        	break;
        case "general_cost_year":
        	$startofyear = date('U', swtime("startofyear"));
			$yearlyCost = 0;

			$sqlCommand = "select sc_folio.cost_request from sc_folio, config_itemi, cmn_rel_opencall_ci, opencall where pk_auto_id = fk_cmdb_id and pk_auto_id = fk_ci_auto_id and fk_callref = callref and fk_cmdb_id = ".$serviceID . " and (logdatex >= ".$startofyear." and logdatex <= ".date('U').")";
        	break;
        case "parent_dependencies":
        	$sqlCommand = "select fk_parent_itemtext, parentdesc from config_reli where fk_parent_type = 'ME->Service' and fk_child_id = ".$serviceID;
        	break;
        case "child_dependencies":
        	$sqlCommand = "select fk_parent_itemtext, parentdesc from config_reli where fk_parent_type = 'ME->Service' and fk_parent_id = ".$serviceID;
        	break;
        case "options_information":
        	$sqlCommand = "select description, apply_type, units, total_unit_cost, price from sc_rels where fk_service = ".$serviceID;
        	break;
        case "levels_information":
        		$sqlCommand = "select fk_sla_name, cost from sc_sla where fk_service = ".$serviceID;
        	break;
        case "request_breakdown":
        	$sqlCommand = "select description, units, total_unit_cost, flg_include, total_cost_for_item from sc_rels where apply_type = 'per request' and fk_service = ".$serviceID;
        	break;
        case "service_breakdown":
        		$sqlCommand = "select description, units, total_unit_cost, flg_include, total_cost_for_item from sc_rels where fk_service = ".$serviceID;
        	break;
	}

?>