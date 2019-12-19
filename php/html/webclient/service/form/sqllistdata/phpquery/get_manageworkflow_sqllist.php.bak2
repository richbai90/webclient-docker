<?php

	//-- 18.03.2011 - get list of temp workflow items for use in sqllist table on cdf manage workflow form

	//-- return custom connection
	function php_connectdb()
	{
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/form/sqllistdata/index.php","PHPQUERY - Connect [sw_systemdb]","SERVI");
		}	
		
		return "sw_systemdb";
	}

	//-- perform query and return result id - note can use orig query if you want to
	function php_query($strOrigTableSql, $conn)
	{
		//-- create static sql
		$strSQL = "select taskid,compltbyx,details,groupid,analystid,parentgroupsequence,parentgroup,flags from wc_calltasks where sessionid = '" . $_POST['_temptable'] ."' order by parentgroupsequence, taskid ASC";

		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/form/sqllistdata/index.php","PHPQUERY - SQL [".$strSQL."]","SERVI");
		}	
		return _execute_xmlmc_sqlquery($strSQL,$conn);
	}

	function php_query_getrow($resID)
	{
		return hsl_xmlmc_rowo($resID);
	}
?>