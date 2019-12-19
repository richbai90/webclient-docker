<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)

	//-- loop passed in columns for specific table - check valid sqlobjectnames and create filter
	$parsedFilter = createTableFilterFromParams(swfc_tablename());

	if(isset($_POST['cr']))
	{
		if($parsedFilter=="")
		{
			$parsedFilter .= "callref IN (".$_POST['cr'].")";
		}else
		{
			if($_POST['_and']=="true")
				$parsedFilter .= " AND callref IN (".$_POST['cr'].")";
			else
				$parsedFilter .= " OR callref IN (".$_POST['cr'].")";
		}
	}
	
	$strDateFilter = "";
	if(isset($_POST['lda']))
	{
		$strDateFilter = " logdatex >= ".$_POST['lda'];
	}
	
	if(isset($_POST['ldb']))
	{
		if($strDateFilter!="") $strDateFilter .= " and ";
		$strDateFilter .= " logdatex <= ".$_POST['ldb'];
	}
	
	if($strDateFilter!="") 
	{
		if($parsedFilter=="")
		{
			$parsedFilter .= " (". $strDateFilter .")";
		}
		else
		{
			$parsedFilter = "(".$parsedFilter.") and (". $strDateFilter .")";
		}
	}

	if(isset($_POST['callclass']))
	{
		$strCC = $_POST['callclass'];
		switch($strCC)
		{
			case "INC":
				$strCallclass = "'Incident'";
				break;
			case "PRB":
				$strCallclass = "'Problem'";
				break;
			case "PRBKE":
				$strCallclass = "'Problem','Known Error'";
				break;
			case "KE":
				$strCallclass = "'Known Error'";
				break;
			case "RFC":
				$strCallclass = "'Change Request'";
				break;
			case "REL":
				$strCallclass = "'Release Request'";
				break;
			case "REQ":
				$strCallclass = "'Service Request'";
				break;
			case "CPR":
				$strCallclass = "'Change Proposal'";
				break;
			default:
				$strCallclass = "'Incident','Problem','Known Error','Change Request','Release Request','Service Request','Change Proposal'";
				break;
		}
		if($parsedFilter!="")
			$parsedFilter = "(".$parsedFilter. ") AND ";
		$parsedFilter .= "callclass in (".$strCallclass.")";
	}
	
	if(isset($_POST['bopen']))
	{
		$boolOpen = $_POST['bopen'];
		if($boolOpen=="1")
		{
			if($parsedFilter!="")
				$parsedFilter = "(".$parsedFilter. ") AND ";
			$parsedFilter .= "status not in (16,17,18,6)";
		}
		elseif($boolOpen=="0")
		{
			if($parsedFilter!="")
				$parsedFilter = "(".$parsedFilter. ") AND ";
			$parsedFilter .= "status in (16,17,18,6)";
		}
	}
	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;



	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter . swfc_orderby();
?>