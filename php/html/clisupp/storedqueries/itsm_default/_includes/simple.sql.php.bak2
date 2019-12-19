<?php

	//--
	//-- store named array of simple sql - client can pass in name key for script to retrieve the required simple sql
	//-- for execution - supports the parsing out of posted params in [] which are automatically prepared for sql

	//-- optional param name has format of :[<postparamtolookfor>:<variablechecktoperform>]
	//-- mandatory param name has a format of ![<postparamtolookfor>:<variablechecktoperform>]

	//--
	//-- SWDATASQL - STATEMENTS TO BE RUN ON SWDATA
	global $_SWDATASQL;
	$_SWDATASQL = Array();

	//-- ci_bl_compare form delete command in oncloseform event
	$_SWDATASQL["ci_bl_compare.oncloseform.delete"] = "delete from CI_BL_COMPARE where CK_CONFIG_ITEM = ':[cci]' and CK_SESSION_ID = ':[csi]'";

	//-- EfDepartment statements
	$_SWDATASQL["efdepartment.cleardepartment"] = "update USERDB set DEPARTMENT = '' where KEYSEARCH = '![ks]' and DEPARTMENT ='![pdc]'";
	$_SWDATASQL["efdepartment.setdepartment"] = "update USERDB set DEPARTMENT = '![pdc]' where KEYSEARCH in (![ks:sarray])";


	//-- manage_general_settings sql
	$_SWDATASQL["manage_general_settings.updatereporttabsetting"] = "update SYS_SETT_SWTODAY set SHOWREPORTTAB![tid:numeric]=![val:numeric] where pk_key=1";
	$_SWDATASQL["manage_general_settings.itsm_slamatrix.insert"] = "insert into ITSM_SLAMATRIX (FK_URGENCY,FK_IMPACT,FK_SLA,PK_MATRIX_KEY) values ('![fku]','![fki]','![fks]','![pkm]');";
	
	$_SWDATASQL["manage_general_settings.itsmsp_slad_matrix.insert"] = "insert into ITSMSP_SLAD_MATRIX (FLG_SLA,FK_IMPACT,FK_URGENCY,FK_PRIORITY,FK_SLAD,PK_KEY) values ('![fsla]','![fki]','![fku]','![fkp]','![fks]','![pkm]');";

	$_SWDATASQL["manage_general_settings.sys_sett_swtoday.insert"] = "insert into SYS_SETT_SWTODAY (PK_KEY) values (1)";

	//-- catalog sql
    $_SWDATASQL["catalog.relationselet.delete"] = "DELETE FROM SC_RELS WHERE FK_KEY =![key:numeric] and FK_SERVICE=![service:numeric]";
    $_SWDATASQL["catalog.subscription.delete"] = "delete from SC_SLA where FK_SUBSCRIPTION =![key:numeric]";

	//-- form itsmsp_slad sql
	$_SWDATASQL["itsmsp_slad.itsmsp_uri.setnindex"] = "UPDATE ITSMSP_URI SET NINDEX=![ni:numeric] WHERE PK_CATURI_ID = ![pci:numeric]";
	$_SWDATASQL["itsmsp_slad.sc_sla.getservice"] = "SELECT FK_SERVICE FROM SC_SLA WHERE FK_SERVICE IS NOT NULL AND FK_SLA=![fs]";
	$_SWDATASQL["itsmsp_slad.onclose.deleteitsmsp_uri"] = "DELETE FROM ITSMSP_URI WHERE FK_SLAD = ':[fs]'";
	$_SWDATASQL["itsmsp_slad.onclose.deleteitsmsp_slad"] = "DELETE FROM ITSMSP_SLAD WHERE FK_PARENT_SLAD = ':[fs]'";
	$_SWDATASQL["itsmsp_slad.ciactions.setfksld"] = "update CONFIG_ITEMI set FK_SLA = '',FK_SLD ='![sld]' where PK_AUTO_ID in (![cis:array])";
	$_SWDATASQL["itsmsp_slad.ciactions.clearfksld"] = "update CONFIG_ITEMI set FK_SLA = '',FK_SLD ='' where PK_AUTO_ID in (![cis:array]) AND FK_SLD='![sld]'";
	$_SWDATASQL["itsmsp_slad.serviceaction.sc_slainsert"] = "insert into SC_SLA (FK_SERVICE,FK_SLA,FK_SLA_NAME,COST,MARK_UP,TOTAL_COST,PRICE) values (![fk_service:numeric],'![fk_sla]','[fk_sla_name]','0.00','0','0.00','0.00')";
	$_SWDATASQL["itsmsp_slad.serviceaction.select"] = "select * from SC_SLA join SC_SUBSCRIPTION on SC_SLA.FK_SUBSCRIPTION = SC_SUBSCRIPTION.PK_ID where SC_SUBSCRIPTION.FK_SERVICE=![fks:numeric] and FK_SLA=![fksla:numeric]";
	$_SWDATASQL["itsmsp_slad.serviceaction.sc_sla.delete"] = "delete from SC_SLA where FK_SLA = ![fksla:numeric] and FK_SERVICE = ![fks:numeric]";
	$_SWDATASQL["itsmsp_slad.custaction.setsld"] ="update USERDB set SLD ='![sld]', SLD_NAME='![sldname]', PRIORITY='' where KEYSEARCH in (![ks:sarray])";
	$_SWDATASQL["itsmsp_slad.custaction.clearsld"] ="update USERDB set SLD ='', SLD_NAME='', PRIORITY='' where KEYSEARCH in (![ks:sarray])";

	//-- form itsm_slad_priority sql
	$_SWDATASQL["itsm_slad_priority.onformloaded.select"] = "select FK_PRIORITY from ITSMSP_SLAD_PRIORITY";

	//-- table itsmsp_slad_diary INSERT
	$_SWDATASQL["itsmsp_slad_diary.insert"] = "insert into ITSMSP_SLAD_DIARY (FK_SLAD_ID,UPDATETXT,UDCODE,ANALYSTID,UPDATEDONX) values ('![fsi]','![ut]','![uc]','![aid]',![ux])";
	//-- table itsmsp_slrd_diary INSERT
	$_SWDATASQL["itsmsp_slrd_diary.insert"] = "insert into ITSMSP_SLRD_DIARY (FK_SLRD_ID,UPDATETXT,UDCODE,ANALYSTID,UPDATEDONX) values ('![fsi]','![ut]','![uc]','![aid]',![ux])";


	$_SWDATASQL["itsm_contract.contract_uri.setnindex"] = "UPDATE CONTRACT_URI SET NINDEX=![ni:numeric] WHERE PK_CONURI_ID = ![pci:numeric]";

	$_SWDATASQL["cmdb_stage.btn_delete.delete_stage"] = "delete from cmdb_stage where ck_config_item in (![cis:sarray])";
	$_SWDATASQL["cmdb_stage.btn_delete.delete_stagefields"] = "delete from cmdb_stagefields where ck_config_item in (![cis:sarray])";
	$_SWDATASQL["cmdb_stage.btn_delete.get_exttables"] = "select distinct(extended_table) as strtable from config_itemi,config_typei where ck_config_type=pk_config_type and ck_config_item in (![cis:sarray]) and extended_table != ''";
	$_SWDATASQL["cmdb_stage.btn_delete.delete_extstage"] = "delete from ![tbl]_stage where ck_config_item in (![cis:sarray])";
	//--
	//-- SWCACHESQL - STATEMENTS TO BE RUN ON SYSTEMDB
	global $_SYSTEMSQL;
	$_SYSTEMSQL = Array();


?>