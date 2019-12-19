<?php
	//--
	//-- delete 3rd party supplier (used by global.Delete3rdPartySupplier)
	$analystid = prepareForSql($_POST['analystid']);
	$sqlDatabase = "sw_systemdb";

	//-- run first delete
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("database",$sqlDatabase);
	$xmlmc->SetParam("query","delete from system_sla where tpcompany='".$analystid."'");
	$xmlmc->SetParam("formatValues","false");
	$xmlmc->SetParam("returnMeta","false");
	$xmlmc->SetParam("returnRawValues","false");
	if($xmlmc->invoke("data","sqlQuery"))
	{
		//-- run final delete
		$sqlCommand  = "delete from swanalysts where analystid='".$analystid."'";
	}
	else
	{
		//-- failed to delete
		echo $xmlmc->xmlresult;
	}
?>