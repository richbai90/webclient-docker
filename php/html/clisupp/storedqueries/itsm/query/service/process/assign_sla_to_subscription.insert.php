<?php
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		$intPK= PrepareForSql($_POST['sid']);
		$strSLA= PrepareForSql($_POST['sla']);
		$strSLAName= PrepareForSql($_POST['slaname']);
		$strCost= PrepareForSql($_POST['cost']);
		$strPrice= PrepareForSql($_POST['price']);

		$strAppcode = $_core['_sessioninfo']->dataset;
		
		//-- does not exist so insert

		$strTable = "SC_SLA";
		$arrData['FK_SUBSCRIPTION'] = pfs($intPK);
		$arrData['FK_SLA'] = pfs($strSLA);
		$arrData['FK_SLA_NAME'] = pfs($strSLAName);
		$arrData['COST'] = pfs($strCost);
		$arrData['MARK_UP'] = "0";
		$arrData['TOTAL_COST'] = pfs($strCost);
		$arrData['PRICE'] = pfs($strPrice);
		$arrData['APPCODE'] = pfs($strAppcode);
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
		
		
		
	}
?>