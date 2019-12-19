<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	$inCIIDs = $_POST["pk_auto_id"];
	//-- If looking at currently effected Items
	$current = $_POST["current"];
	//-- If Empty Just Exit
	if($_POST["empty"] == 1)
	{
		throwSuccess();
	}
	if($inCIIDs!="")
	{
		//-- check we have listid to filter by and check it for invalid chars (sql injection attempts)
		if(_validate_url_param($inCIIDs,"csnum"))
		{
			$where = "where (service_archived IS NULL OR service_archived != 1) AND pk_auto_id in (".$inCIIDs.") ";
			//--
			$inType = $_POST["type"];

			if($current)
			{
				$strAdditServiceFilter = "(CK_CONFIG_TYPE LIKE 'ME->SERVICE' OR CK_CONFIG_TYPE LIKE 'Service%')";
				$strAdditItemFilter = "(CK_CONFIG_TYPE NOT LIKE 'ME->%' AND CK_CONFIG_TYPE NOT LIKE 'Service%')";
			}else
			{
				$strAdditServiceFilter = "(CK_CONFIG_TYPE LIKE 'ME->SERVICE' OR CK_CONFIG_TYPE LIKE 'Service%' and isactivebaseline = 'Yes')";
				$strAdditItemFilter = "(CK_CONFIG_TYPE NOT LIKE 'ME->%' AND CK_CONFIG_TYPE NOT LIKE 'Service%' and isactivebaseline = 'Yes')";
			}
			$strAdditServiceItemFilter = "(" . $strAdditServiceFilter . " OR " . $strAdditItemFilter . ")";

			//BOTH = 1
			//SERVICE = 2
			//CI = 3
			$strExtraWhere = "";
			if($inType==1)
				$where .= "and (".$strAdditServiceItemFilter.")";
			elseif($inType==2)
				$where .= "and (".$strAdditServiceFilter.")";
			elseif($inType==3)
				$where .= "and (".$strAdditItemFilter.")";
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