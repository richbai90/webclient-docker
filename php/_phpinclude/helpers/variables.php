<?php
	//-- Array of Functions to Ignore
	//$arrIgnore = array("between","concat","where 1=1 group by","where 1=1  group by","where  1=1 group by","where  1=1  group by");
	$arrIgnore = array("between","concat");
	//-- Array of Specific Files to Ignore
	$arrFilesIgnore = array("runReport.php","rpt_tmplt_valcntlst.php","rpt_tmplt_lst.php","rpt_tmplt_valcnt.php","rpt_tmplt_boxgrplst.php","rpt_tmplt_grplst.php","dbmaintenance.php");
	
	//-- Array of Specific Injection Syntax to Look for
	$arrInjection = array("drop table","';");
	
	//-- Array of CallClasses For Variable Check
	$arrCallClass = array("Incident","Change Request","Known Error","Service Request","Release Request","B.P Task","Task","Problem","HR Case","HR Query","HR Confidential Case","HR Task");
	$debug = false; // Enable or Disable Dubug Info
?>