<?php

	//-- store named array of static sql - client can pass in name key for script to retrieve the required static sql
	function getStaticSql($key)
	{	
		global $_STATICSQL;
		$sql = "";

		//-- can bind filters using , (filter AND anotherFilter)
		$arrFilters = explode(",",$key);
		while (list($pos,$filterKey) = each($arrFilters))
		{
			
			if(!isset($_STATICSQL[$filterKey]))
			{
				throwError("-100","Static Sql not found for (".$filterKey."). Please contact your Administrator.");
			}
			if($sql!="")$sql .= " AND ";
			$sql .= $_STATICSQL[$filterKey];
		}

		//-- swap out any [name] with pfs($_POST[name]) and return
		return parseEmbeddedParameters($sql);
	}


	global $_STATICSQL;
	$_STATICSQL = Array();

	//-- ryans filters
	$_STATICSQL["wiz_existing_question"]= "FK_QID > 0";
	$_STATICSQL["has_company"]= "(FK_COMPANY_ID !='' or FK_COMPANY_ID is not NULL)";
	$_STATICSQL["organisation_type"]= "TYPE='organisation'";
	$_STATICSQL["valid_requests"]= "STATUS not in(17,15,7)";
	$_STATICSQL["incidents"]= "CALLCLASS='Incident'";
	$_STATICSQL["problem_or_kes"]= "(CALLCLASS = 'Problem' or CALLCLASS = 'Known Error')";
	$_STATICSQL["changes"]= "CALLCLASS='Change Request'";
	$_STATICSQL["service_requests"]= "CALLCLASS='Service Request'";
	$_STATICSQL["review_contract"] = "flg_sla=2";
    $_STATICSQL["open_requests"] = "STATUS not in(6,7,15,16,17,18,19)";
	$_STATICSQL["parent_services"] = "fk_parent_type = 'ME->Service'";
    $_STATICSQL["optional_component"] = "cost_type = 'component' and (flg_isoptional=0 or flg_isoptional IS NULL)";
    $_STATICSQL["standard_component"] = "cost_type = 'component' and flg_isoptional=1";
    $_STATICSQL["remote_support.by_url"] = "url='![url]'";                

	//-- callclass All, someclass
	$_STATICSQL["browse_bpm.table"]= "CALLCLASS in ('All','![cc]')";

	//-- single column filters
	$_STATICSQL["fk_config_type"] = "fk_config_type = '![fct]'";

	//-- static filter to get all cis but services 
	$_STATICSQL["cis_excludeservice"] = "(CK_CONFIG_TYPE NOT LIKE 'ME->SERVICE' AND CK_CONFIG_TYPE NOT LIKE 'SERVICE%')";
	//-- static filter to get only service cis
	$_STATICSQL["cis_servicesonly"] = "(CK_CONFIG_TYPE = 'ME->SERVICE' OR CK_CONFIG_TYPE LIKE 'SERVICE%')";
	//-- search_service - static filter
	$_STATICSQL["cis_meservicesonly"] = "(CK_CONFIG_TYPE = 'ME->SERVICE')";
	$_STATICSQL["cis_meservicesonlyactive"] = "(CK_CONFIG_TYPE = 'ME->SERVICE' and ISACTIVEBASELINE = 'Yes')";
	$_STATICSQL["cis_notlikemeandactive"] = "(CK_CONFIG_TYPE NOT LIKE 'ME->%' and ISACTIVEBASELINE = 'Yes')";


	//-- call form common ci list filters
	$_STATICSQL["cilist_active_service"] = "((CK_CONFIG_TYPE LIKE 'ME->SERVICE' OR CK_CONFIG_TYPE LIKE 'Service%') and ISACTIVEBASELINE = 'Yes')";
	$_STATICSQL["cilist_active_cisonly"] = "(CK_CONFIG_TYPE NOT LIKE 'ME->%' AND CK_CONFIG_TYPE NOT LIKE 'Service%' and ISACTIVEBASELINE = 'Yes')";
	$_STATICSQL["cilist_active_serviceorcis"] = "(".$_STATICSQL["cilist_active_service"] . " OR " . $_STATICSQL["cilist_active_cisonly"].")";
	$_STATICSQL["fk_config_item_isnull"] = "(FK_CONFIG_ITEM IS NULL OR FK_CONFIG_ITEM =0)";
	$_STATICSQL["cilist_activebln"] = "ISACTIVEBASELINE='Yes'";
	$_STATICSQL["cilist_monitored"] = "FLG_SHOWINMONITORLIST=1";
	$_STATICSQL["cilist_monitored_filtered"] = "FLG_SHOWINMONITORLIST=1 AND MONITORGROUP LIKE '![mg]'";

	$_STATICSQL["cilist_validsupport"] = "FLG_VALIDSUPPORT=1";
	$_STATICSQL["cilist_invalidsupport"] = "(FLG_VALIDSUPPORT IS NULL OR FLG_VALIDSUPPORT=0)";
	$_STATICSQL["cilist_exludemes"] = "CK_CONFIG_TYPE not like 'ME->%'";

	//-- used on ci form
	$_STATICSQL["requesttype_fcinull"] = "(FK_CONFIG_ITEM=0 OR FK_CONFIG_ITEM IS NULL)";
	$_STATICSQL["type_supplier"] = "TYPE='supplier'";

	//-- bpm filters
    $_STATICSQL["task_complete"] = "(bpm_status_id='Task Successfully Completed' OR bpm_status_id='Skip Task (Not Required)')";

	//-- cmdb config types
	$_STATICSQL["citypes_root"] = "(FK_CONFIG_TYPE = '' or FK_CONFIG_TYPE is null) and PK_CONFIG_TYPE != 'ME'";
	$_STATICSQL["citypes_flg_src"] = "(FLG_SC=0 or FLG_SC is null)";
	$_STATICSQL["citypes_flg_src1"] = "FLG_SC=1";
	$_STATICSQL["citypes_flg_item_on"] = "FLG_ITEM=1";
	$_STATICSQL["citypes_flg_item_off"] = "(FLG_ITEM=0 OR FLG_ITEM IS NULL)";
	
	$_STATICSQL["analyst_class"] = "class != 0 and class != 2";
	
	//-- bpm filters
	$_STATICSQL["no_stage"] = "fk_stage_id=0";
	$_STATICSQL["bpm_runatstart"] = "flg_runatstart=1";
	$_STATICSQL["bpm_notrunatstart"] = "flg_runatstart!=1";

	//-- swgroup / analyst filters
	$_STATICSQL["swgroups"] = "id != '_SYSTEM'";
	$_STATICSQL["swanalysts"] = "class !=0 and class!=2";
	
	//-- ci_bl_compare form filters
	$_STATICSQL["ci_bl_compare.maintable"] = "ck_config_item='![cci]' and ck_session_id = '![csi]'";
	$_STATICSQL["ci_bl_compare.sl_masterrels"] = "fk_parent_id=![fmaid] or fk_child_id = ![fmaid]";	
	$_STATICSQL["ci_bl_compare.sl_otherrels"] = "fk_parent_id=![foaid] or fk_child_id = ![foaid]";	


	//-- EfILACallHistory filters
	$_STATICSQL["EfILACallHistory.sl_ila_oc_hist.filter"] = "fk_callref = ![fc:numeric] and usage_area = '![ua]'";

	//-- efOnHoldPeriods filter on fld_period_days change
	$_STATICSQL["efOnHoldPeriods.onhold_notifiers.filter"] = "onhold_period = '![op]' and days_from > ![df:numeric]";

	//-- catalog filters
	$_STATICSQL["catalog_subscription"] = "REL_TYPE='SUBSCRIPTION'";     
	$_STATICSQL["catalog_view"] = "REL_TYPE='VIEW'";       
	$_STATICSQL["catalog_contracts"] = "fk_parent_type = 'ME->CONTRACT'";          
	$_STATICSQL["catalog_details"] = "area='details' and fk_service=![sid]";

	
	//-- itsmsp_slad form
 	$_STATICSQL["itsmsp_slad.tpclist"] = "fk_parent_type='ME->SLA' and fk_child_type='ME->THIRDPARTYCONTRACT'";
	$_STATICSQL["itsmsp_slad.opencallsladeftasks"] = "itsm_sladef=![slad] and status not in (6,15,16,17,18,19) and callclass='OLA Task'";
	$_STATICSQL["itsmsp_slad.opencallsladeftasksbreached"] = "itsm_sladef=![slad] and status not in (6,15,16,17,18,19) and callclass='OLA Task' AND ((fixbyx<![fby]) and ((slafix<=0) or (slafix>0 and withinfix=0)))";
	$_STATICSQL["itsmsp_slad.opencallslatasks"] = "itsm_sladef=![slad] and status not in (6,15,16,17,18,19) and callclass!='OLA Task'";
	$_STATICSQL["itsmsp_slad.opencallslatasksbreached"] = "itsm_sladef=![slad] and status not in (6,15,16,17,18,19) and callclass!='OLA Task' AND ((fixbyx<![fby]) and ((slafix<=0) or (slafix>0 and withinfix=0)))";


	//-- filter by  fk_slad and relcode 
 	$_STATICSQL["fk_slad_and_relcode"] = "fk_slad=![fslad] and relcode='![rc]'";

	$_STATICSQL["itsmsp_slad_ola.opencallsladeftasks"] = "itsm_sladef=![slad] and status not in (6,15,16,17,18,19) and callclass='OLA Task'";
	$_STATICSQL["itsmsp_slad_ola.opencallsladeftasksbreached"] = "itsm_sladef=![slad] and status not in (6,15,16,17,18,19) and callclass='OLA Task' AND ((fixbyx<![fby]) and ((slafix<=0) or (slafix>0 and withinfix=0)))";

	//-- itsm_slad_priority form
	$_STATICSQL["itsm_slad_priority.fld_fk_priority"] = "priority not in (![kvs:sarray])";
	
	$_STATICSQL["bpm_stage_status.fld_status"] = "fk_stage_id=![sid:numeric] and status='![sts]' and pk_auto_id!=![pid:numeric]";

	$_STATICSQL["itsm_contract.get_relationship"] = "fk_parent_id = ![pid:numeric] AND fk_child_id = ![cid:numeric] AND fk_parent_type = 'ME->CONTRACT' AND fk_child_type = 'ME->Service'";

	$_STATICSQL["itsm_contract.get_service_subscription"] = "type='Organisation' AND fk_me_key='![key]' and fk_service='![sid:numeric]'";
	$_STATICSQL["itsmsp_slad.get_sla"] = "slad_id='![sla]'";
	
	//-- Selfservice Links
	$_STATICSQL["load_selfservice_links"] = "1=1 order by view_order ASC";
	
	//-- Selfservice Notifications
	$_STATICSQL["load_selfservice_notifs"] = "1=1 order by sequence ASC";
?>