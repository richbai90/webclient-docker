<?php
	//-- used in global.js new_diaryevent
	//-- create a call diary update - will use xmlmc helpdesk api if call if active else will use sql on swdata
	IncludeApplicationPhpFile("itsm.helpers.php");	
	
	$nCallref = $_POST['cr'];
	$nCallref = PrepareForSql($nCallref);

	//-- is the call in sys db
	$nCount = get_rowcount("OPENCALL","STATUS<14 and CALLREF=". $nCallref,"sw_systemdb");
	if($nCount>0)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$nCallref);
		$xmlmc->SetParam("timeSpent",1);
		$xmlmc->SetParam("description",$_POST['updtxt']);
		$xmlmc->SetParam("updateSource",$_POST['src']);
		$xmlmc->SetParam("updateCode",$_POST['code']);
		if($_POST['sla']!="")$xmlmc->SetParam("priority",$_POST['sla']);
		if(!$xmlmc->invoke("helpdesk","updateCalls"))
		{
			throwSuccess("-2"); //-- silent error
		}
	}
	else
	{
		$strSQL = "select MAX(udindex) as maxindex from UPDATEDB where CALLREF=".$nCallRef;
		$aRS = get_recordset($strSQL);
		$nUdindex = 0;
		if ($aRS->Fetch())
		{
			$nUdindex = get_field($aRS,"maxindex");
			$nUdindex++;
		}
				
		$nUpdatetimex = time();
		$strUpdatetime = get_readable_datetime($nUpdatetimex);
		$strAaid = $session->analystId;
		$strAid = $session->contextAnalystId;
		$strGroupid = $session->contextGroupId;
		$strRepid = $strAaid;
		if($strAid!=$strAaid)
		{
			$strRepid .=" as "+$strAid;
		}
		
		$strTable = "UPDATEDB";
		$arrData['CALLREF'] = $nCallRef;
		$arrData['UPDATETIME'] = $strUpdatetime;
		$arrData['UPDATETIMEX'] = $nUpdatetimex;
		$arrData['TIMESPENT'] = 0;
		$arrData['REPID'] = pfs($strRepid);
		$arrData['AAID'] = pfs($strAaid);
		$arrData['AID'] = pfs($strAid);
		$arrData['GROUPID'] = pfs($strGroupid);
		$arrData['UDSOURCE'] = pfs($strActionSource);
		$arrData['UDCODE'] = pfs($strCode);
		$arrData['UDTYPE'] = 1;
		$arrData['UDINDEX'] = $nUdindex;
		$arrData['UPDATETXT'] = pfs($strText);
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1!=$arc) throwSuccess("-2");
	}
	throwSuccess(1);
	exit;
?>