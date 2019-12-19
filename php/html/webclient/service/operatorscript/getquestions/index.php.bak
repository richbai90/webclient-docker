<?php


	//-- given a scriptid will load operator script questions
	//-- check session
	include("../../../php/session.php");

	//--
	//-- connect to systemdb - get profile codes
	$swcache = connectdb("syscache");

	//-- get questions
	$strXML = "<callscript><qs>";
	$strSelect = "select * from callscript_q where sid=" . $_POST['scriptid'] ." order by qid asc";
	$res = _execute_xmlmc_sqlquery($strSelect,$swcache);
	while($row = hsl_xmlmc_rowo($res))
	{
		$strXML .= db_record_as_xml($row,"q","","",1);
	}

	//-- get choices
	$strXML .= "</qs><qcs>";
	$strSelect = "select * from callscript_qc where sid=" . $_POST['scriptid'] ." order by qid , cid asc";
	$qcres = _execute_xmlmc_sqlquery($strSelect,$swcache);
	while($qcrow = hsl_xmlmc_rowo($qcres))
	{
		$strXML .= db_record_as_xml($qcrow,"qc","","",1);
	}
	$strXML .= "</qcs></callscript>";
	close_dbs();


	echo $strXML;

?>