<?php

	//--
	//-- return xml of the default sla settings as defined in the swserverconfig.xml file
	//-- this is then used by swjs methods when creating sla and 3p sla
	include("../../../php/session.php");

	//-- get xml config file
	$strFile =  $portal->fs_server_installpath ."/conf/swserverservice.xml";
    $xmlfp = file_get_contents($strFile);
	$xmlDoc = domxml_open_mem(utf8_encode($xmlfp));
	if($xmlDoc)
	{
		$root = $xmlDoc->document_element();
		$arrWT = $root->get_elements_by_tagname("DefaultWorkingTime");
		if($arrWT[0])
		{
			$ownerDoc = $arrWT[0]->owner_document();
			echo $ownerDoc->dump_node($arrWT[0]);
		}
	}
	exit;
?>