<?php
	IncludeApplicationPhpFile("itsm.helpers.php");

	$strTable = "BPM_COND_VPME";
	$arrData['FK_COND_ID'] = '![cid:num]';
	$arrData['VPMESCRIPT'] = '![script]';
	$arrData['EXECORDER'] = '![nid:num]';
	$arrData['FK_STAGE_ID'] = '![sid:num]';
	$arrData['FK_WORKFLOW_ID'] = '![wf]';
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
?>