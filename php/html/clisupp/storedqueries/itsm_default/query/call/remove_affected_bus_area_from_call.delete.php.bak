<?php

	//-- used in global.js function remove_affected_bus_area_from_call

	$intCall =  PrepareForSql($_POST['cr']);

	if(!_validate_url_param($intCall,"num")) {
		throwProcessErrorWithMsg("Invalid callref. Please contact your Administrator.");
	}

	$strSQL = "select callclass from opencall where CALLREF=".$intCall;
	$aRS = get_recordset($strSQL, 'sw_systemdb');
	$strCallclass = "";
	if ($aRS->Fetch())
	{
		$strCallclass = get_field($aRS,"callclass");
		if($strCallclass=='Change Request'){
			if(!HaveAppRight("D", 7)){
				$call->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
				exit;
			}
		}
	}
	
	$arrABAIds = explode(",",$_POST['bads']);
	$strABAIds ="";
	while (list($pos,$AbaID) = each($arrABAIds))
	{
		if($strABAIds!="")$strABAIds.=",";
		$strABAIds .= "'" . PrepareForSql($AbaID) ."'";
	}
	
	//-- Set status = Removed for ABAs which were linked to the call from CIs
	if($_POST['upd']=="1")
	{
		$strUpdateABAsFromCIs = "UPDATE CMN_REL_OPENCALL_ABA set status = 'Removed'";
		$strUpdateABAsFromCIs .= " where SOURCE = 'CI' and FK_CALLREF = " . $intCall ." and FK_BUS_AREA_ID in (". $strABAIds .")";
		submitsql($strUpdateABAsFromCIs);

		//-- Delete ABAs which were linked to the call by an Analyst		
		$strDeleteABAsFromAnalyst = "DELETE FROM CMN_REL_OPENCALL_ABA ";
		$strDeleteABAsFromAnalyst .= " where SOURCE = 'Analyst' and FK_CALLREF = " . PrepareForSql($_POST['cr']) . " and fk_bus_area_id in (" .$strABAIds.")";
	}
	else
	{
		//-- Delete ABAs which were linked to the call by an Analyst		
		$strDeleteABAsFromAnalyst = "DELETE FROM CMN_REL_OPENCALL_ABA ";
		$strDeleteABAsFromAnalyst .= " where FK_CALLREF = " . PrepareForSql($_POST['cr']) . " and fk_bus_area_id in (" .$strABAIds.")";

	}

	//-- execute the delete
	$sqlDatabase = "swdata";
	$sqlCommand = $strDeleteABAsFromAnalyst;

?>