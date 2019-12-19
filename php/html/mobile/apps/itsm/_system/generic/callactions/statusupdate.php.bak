<?php 	$prefix = 'mpuptk_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	if($_SESSION['callActionErrorMsg']!="")
		echo "<span class='errormsg'>"._html_encode($_SESSION['callActionErrorMsg'])."</span>";
	//-- Get current call bpm status value
	$strSQL = "select bpm_status_id,bpm_stage_id from opencall where callref=".$_POST['_callref'];
	$rsData = new _swm_rs();
	$strSQL = _swm_parse_string($strSQL);
	$rsData->query($strDB,$strSQL,true,null);

	//-- check if there is any data
	if($rsData->eof())
	{
			$strOutputHTML = "There is no data available";
	}
	else
	{
		if(!$rsData->eof())
		{
			$strCurrentValue =	$rsData->EmbedDataIntoString("rs","[:rs.bpm_status_id.value]");
			$strStageId =	$rsData->EmbedDataIntoString("rs","[:rs.bpm_stage_id.value]");
		}
	}

	$strHTML = "<form id='frmCallactionLoader' target='_self' method='post' action='index.php' >";
	$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Status Value</span></span></div>";
	$strHTML .="<table width='100%'>";	

	
	//-- Get current call bpm status value
	$strSQL = "select status from bpm_stage_sts where fk_stage_id=".$strStageId;
	$rsData = new _swm_rs();
	$strSQL = _swm_parse_string($strSQL);
	$rsData->query($strDB,$strSQL,true,null);

	//-- check if there is any data
	if($rsData->eof())
	{
			$strOutputHTML = "There is no data available";
	}
	else
	{
		while(!$rsData->eof())
		{
			$strStatus =	$rsData->EmbedDataIntoString("rs","[:rs.status.value]");
			$strSelected = "";
			if($strCurrentValue == $strStatus)
				$strSelected = "(Current Value)";

			$strHTML .= "<tr  style='cursor:pointer;' status='"._html_encode($strStatus)."' onclick=\"_set_bpm_status(this);\"><td width='50%'>"._html_encode($strStatus)."</td><td width='50%'>"._html_encode($strSelected)."</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			
			$rsData->movenext();
		}
	}
//	$arrStatusValues = array("Task Not Started","25% Complete","50% Complete","75% Complete","Task Successfully Completed","Failed To Complete Task");

	$strHTML .= "</table>";
	echo $strHTML;
?>
	<input type='hidden' name='_action' id='_action' value='_navig'>
	<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__originfilepath']);?>'>
	<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
	<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
	<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
	<input type='hidden' name='opencall_bpm_status_id' id='opencall_bpm_status_id'>
	<input type='hidden' name='_frmaction' id='_frmaction' value='Task Update'>
	<input type='hidden' name='opencall_bpm_waitingtasks' id='opencall_bpm_waitingtasks' value='1'>
	<input type='hidden' name='<?php echo $prefix;?>key' id='<?php echo $prefix;?>key' value='<?php echo $strKey;?>'>
	<?php echo $strOtherInputs;?>
</form>
