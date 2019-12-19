<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	if(!isset($_POST['pk_auto_id']))
		$inCIIDs = "-1";
	else
		$inCIIDs = $_POST["pk_auto_id"];

	$aValidSpecialChars = array('-',','); 
	$inCIIDsSanitized = str_replace($aValidSpecialChars, '', $inCIIDs);

	if($inCIIDsSanitized!="")
	{
		//-- check we have listid to filter by and check it for invalid chars (sql injection attempts)
		if(_validate_url_param($inCIIDsSanitized,"num"))
		{
			$where = "where pk_auto_id in (".$inCIIDs.") ";
			//--
			$inType = $_POST["type"];

			$strAdditServiceFilter = "(CK_CONFIG_TYPE LIKE 'ME->SERVICE' OR CK_CONFIG_TYPE LIKE 'Service%' and isactivebaseline = 'Yes')";
			$strAdditItemFilter = "(CK_CONFIG_TYPE NOT LIKE 'ME->%' AND CK_CONFIG_TYPE NOT LIKE 'Service%' and isactivebaseline = 'Yes')";

			//TYPE1 = CIs
			//TYPE2 = Services
			$strExtraWhere = "";
			if($inType==1)
				$where .= "and (".$strAdditItemFilter.")";
			elseif($inType==2)
				$where .= "and (".$strAdditServiceFilter.")";
		}
		else
		{
			echo generateCustomErrorString("-100","An invalid CI Key Value was specified. Please contact your Administrator.");
			exit(0);
		}

	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from config_itemi " . $where . swfc_orderby();
?>