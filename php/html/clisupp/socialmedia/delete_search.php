<?php
	//-- add a service favourite
	include('itsm_default/xmlmc/common.php');
	if($in_searchid!="")
	{
		$swConn = database_connect("swdata");
		$strDelete = "delete from socmed_monitors where pk_id = ".$in_searchid;
		$swConn->query($strDelete);
		$swConn->Close();
	}


?>