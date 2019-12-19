<?php

	//-- used in global.js function remove_affected_bus_area_from_call
	$intCall =  PrepareForSql($_POST['cr']);
	$strConfigIds = PrepareForSql($_POST['strConfigIds']);
	$strCallCis = "";
	if(isset($_POST['strAllCallCIs']))
	{
		$strCallCis = PrepareForSql($_POST['strAllCallCIs']);
		$strWhere .= " where CONFIG_ITEMI.PK_AUTO_ID in (".$strCallCis.") and CONFIG_ITEMI.PK_AUTO_ID not in (".$strConfigIds.")";
	}
	else
	{
		$strWhere .= " where CONFIG_ITEMI.PK_AUTO_ID in (".$strConfigIds.")";
	}

	$strGetCallABAsSql = "SELECT CONFIG_BUS_AREA.FK_BUS_AREA_ID AS ABA_ID FROM CONFIG_ITEMI ";
	$strGetCallABAsSql .= " RIGHT JOIN CONFIG_BUS_AREA ON CONFIG_BUS_AREA.FK_CONFIG_ITEM = CONFIG_ITEMI.CK_CONFIG_ITEM";
	$strGetCallABAsSql .= $strWhere;
	$strGetCallABAsSql .= " GROUP BY CONFIG_BUS_AREA.FK_BUS_AREA_ID";
	
	$sqlDatabase = "swdata";
	$sqlCommand = $strGetCallABAsSql;
?>