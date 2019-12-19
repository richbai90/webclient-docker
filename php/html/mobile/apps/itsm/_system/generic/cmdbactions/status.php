<?php 	if($_SESSION['cmdbActionErrorMsg']!="")
		echo "<span class='errormsg'>"._html_encode($_SESSION['cmdbActionErrorMsg'])."</span>";

	$prefix = 'mpcsts_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	$strCallAction = "";

	$strOrigin = $_POST['pp__definitionfilepath'];
	$strDefin = $_POST['pp__originfilepath'];

	$boolGroup = true;

	$strID = "";
	$strCMDBAction = "Update Status";
	$strSQL = "select ct_statusl.*,config_itemi.cmdb_status as curr_cmdb_status,config_itemi.fk_status_level as curr_status_level from ct_statusl,config_itemi where config_itemi.pk_auto_id=".$_POST['cmdb_holder']." and config_itemi.ck_config_type=ct_statusl.fk_config_type";
	$strHTML = "<table width='100%'><tr  style='cursor:pointer;' id='[:rs.status_level.htmlvalue]' cmdbstatus='[:rs.cmdb_status.htmlvalue]' onclick=\"var oHolder = document.getElementById('_new_status');oHolder.value=this.getAttribute('id');var oHolder = document.getElementById('_new_cmdb_status');oHolder.value=this.getAttribute('cmdbstatus');var oForm = document.getElementById('frmCMDBactionLoader');oForm.submit();\"><td width='50%'>[:rs.status_level.htmlvalue] ([:rs.cmdb_status.htmlvalue])</td><td width='50%'></td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr></table><div class='seperator'><div style='display:none;'></div></div>";


?><form id='frmCMDBactionLoader' target="_self" method='post' action='index.php' >
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Set Status:</span></span></div>
<?php 
	$rsData = new _swm_rs();
	$strSQL = _swm_parse_string($strSQL);
	$rsData->query("swdata",$strSQL,true,null);

	//-- check if there is any data
	if($rsData->eof())
	{
			$strOutputHTML = "There is no data available";
	}
	else
	{
		while(!$rsData->eof())
		{
			$strID.=	$rsData->EmbedDataIntoString("rs",$strHTML);
			$rsData->movenext();
		}
	}
?>
<?php echo $strID;?>
	<input type='hidden' name='_action' id='_action' value='_navig'>
	<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($strDefin);?>'>
	<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($strOrigin);?>'>
	<input type='hidden' name='_frmcmdbaction' id='_frmcmdbaction' value='<?php echo _html_encode($strCMDBAction);?>'>
	<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($strCMDBAction);?>'>
	<input type='hidden' name='_new_status' id='_new_status' value=''>
	<input type='hidden' name='_new_cmdb_status' id='_new_cmdb_status' value=''>
	<input type='hidden' name='<?php echo $prefix;?>key' id='<?php echo $prefix;?>key' value='<?php echo $strKey;?>'>
	<?php echo $strOtherInputs;?>
</form>
