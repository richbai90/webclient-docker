<?php

	//-- get list of default request types to show in navigation menu
	//-- returns recordset or a dummy recset
	function get_default_request_types()
	{
		//-- assumes db class is avail
		include_once('itsmf/xmlmc/classdatabaseaccess.php');

		$rsTypes=new odbcRecordsetDummy;

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			$strQuery="select * from ssrequesttype where flg_visibletoall=1 and flg_enabled=1";
			$rsTypes = $connDB->query($strQuery,true);
		}
		return $rsTypes;
	}

	//-- get customers request tpyes
	function get_customerrequest_types($customerID)
	{
		//-- assumes db class is avail
		include_once('itsmf/xmlmc/classdatabaseaccess.php');

		$rsTypes=new odbcRecordsetDummy;

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			$strQuery="select * from ssrequesttype,userdb_reqtype where flg_enabled=1 and fk_typecode = pk_code and fk_keysearch = '" .pfs($customerID)."'";
			$rsTypes = $connDB->query($strQuery,true);
		}
		return $rsTypes;
	}

	function get_default_customerrequest_types($customerID)
	{
		//-- assumes db class is avail
		include_once('itsmf/xmlmc/classdatabaseaccess.php');

		$rsCustReqTypes=new odbcRecordsetDummy;
		$rsStandardTypes=new odbcRecordsetDummy;

		//-- connect to swdata and get default types
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			//-- get customers specific request types
			$strQuery="select * from ssrequesttype, userdb_reqtype where flg_visibletoall!=1 and flg_enabled=1 and fk_typecode = pk_code and fk_keysearch = '" .pfs($customerID)."'";
			$rsCustReqTypes = $connDB->query($strQuery,true);

			//-- get generic request types
			$strQuery="select  * from ssrequesttype where flg_visibletoall=1 and flg_enabled=1";
			$rsStandardTypes = $connDB->query($strQuery,true);

			//-- now merge
			$rsCustReqTypes->mergedata($rsStandardTypes);

		}
		unset($rsStandardTypes);
		return $rsCustReqTypes;
	}

?>