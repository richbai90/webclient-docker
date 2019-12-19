<?php
	//--
	//-- return call class and last update text (used in global.ComposeCallUpdateEmail)
	$sqlDatabase = "sw_systemdb";
	$sqlCommand  = "select opencall.callclass as callclass, updatedb.updatetxt as updatetxt from opencall, updatedb where opencall.callref = " .prepareForSql($_POST['callref']). " and updatedb.callref=opencall.callref and updatedb.udindex = " . prepareForSql($_POST['udindex']);
?>