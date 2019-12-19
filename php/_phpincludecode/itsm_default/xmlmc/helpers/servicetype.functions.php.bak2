<?php

	//-- get list of default request types to show in navigation menu
	//-- returns recordset or a dummy recset
	function get_default_request_types()
	{
		//-- assumes db class is avail
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');

		$rsTypes=new odbcRecordsetDummy;

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			$strQuery="select * from ssrequesttype where flg_visibletoall=1 and flg_enabled=1 order by ssgroup, sstitle asc";
			$rsTypes = $connDB->query($strQuery,true);
		}
		return $rsTypes;
	}

	//-- get customers request tpyes
	function get_customerrequest_types($customerID)
	{
		//-- assumes db class is avail
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');

		$rsTypes=new odbcRecordsetDummy;

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			$strQuery="select * from ssrequesttype,userdb_reqtype where flg_enabled=1 and fk_typecode = pk_code and fk_keysearch = '" .pfs($customerID)."'  order by ssgroup, sstitle asc";
			$rsTypes = $connDB->query($strQuery,true);
		}
		return $rsTypes;
	}

	function get_default_customerrequest_types($customerID)
	{
		//-- assumes db class is avail
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');

		$rsCustReqTypes=new odbcRecordsetDummy;
		$rsStandardTypes=new odbcRecordsetDummy;

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			$strQuery="select ssgroup, quest_ci, edit_ci, show_ci, default_updatetxt, default_profile, default_ci, filter_citype, filter_profilecode, onsubmitscript, flg_onsubmitcode, flg_runciscript, flg_allowfileupload, backup_sla, default_sla, show_profile, edit_profile, quest_profile, show_updatetxt, edit_updatetxt, quest_updatetxt, ssdesc text, sstitle, ssmenu, pk_code, run_bpmworkflow, flg_canlinkcitype, flg_canlinkci, flg_canlinkcust, assignto_owner, assignto_group, assign_callclass, flg_visibletoall, flg_enabled, default_costcenter, itsm_priority, itsm_urgency, itsm_impact, quest_citype,  filterci,  show_citype, dbtablefieldfor_citype from ssrequesttype, userdb_reqtype where flg_visibletoall!=1 and flg_enabled=1 and fk_typecode = pk_code and fk_keysearch = '" .PrepareForSQL($customerID)."'  order by ssgroup, sstitle asc";
			$rsCustReqTypes = $connDB->query($strQuery,true);

			//-- get generic request types
			$strQuery="select ssgroup, quest_ci, edit_ci, show_ci, default_updatetxt, default_profile, default_ci, filter_citype, filter_profilecode, onsubmitscript, flg_onsubmitcode, flg_runciscript, flg_allowfileupload, backup_sla, default_sla, show_profile, edit_profile, quest_profile, show_updatetxt, edit_updatetxt, quest_updatetxt, ssdesc text, sstitle, ssmenu, pk_code, run_bpmworkflow, flg_canlinkcitype, flg_canlinkci, flg_canlinkcust, assignto_owner, assignto_group, assign_callclass, flg_visibletoall, flg_enabled, default_costcenter, itsm_priority, itsm_urgency, itsm_impact, quest_citype, filterci,  show_citype, dbtablefieldfor_citype from ssrequesttype where flg_visibletoall=1 and flg_enabled=1  order by ssgroup,sstitle asc";
			$rsStandardTypes = $connDB->query($strQuery,true);

			//-- now merge
			$rsCustReqTypes->mergedata($rsStandardTypes);

		}
		unset($rsStandardTypes);
		return $rsCustReqTypes;
	}

?>