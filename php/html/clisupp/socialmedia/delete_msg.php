<?php
	//-- add a service favourite
	include('itsm_default/xmlmc/common.php');
	if($in_msgid!="")
	{
		$swConn = database_connect("swdata");
		$strDelete = "update socmed_comms set status='Disregarded' where pk_comms_id = ".$in_msgid;
		$swConn->query($strDelete);
		$swConn->Close();
	}

	//- -get table html for cat
	//echo create_catalog_favourites();
	
?>