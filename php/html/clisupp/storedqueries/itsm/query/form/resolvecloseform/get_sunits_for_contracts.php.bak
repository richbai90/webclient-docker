<?php
	$strContract = $_POST["contract"];
	if(!_validate_url_param($strContract,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT support_units,pk_auto_id,childdesc FROM config_reli, cmn_rel_opencall_ci WHERE fk_parent_id = '" .PrepareForSql($strContract). "' AND fk_child_id = cmn_rel_opencall_ci.fk_ci_auto_id AND cmn_rel_opencall_ci.fk_callref IN (".$inCallrefs.") ORDER BY support_units";
?>