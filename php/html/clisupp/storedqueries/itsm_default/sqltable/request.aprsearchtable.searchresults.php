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

	$strKeySearch = "";
	for ($x=1;$x<=6;$x++)
	{
		$strKeySearchValue = $_POST['kw'.$x];
		if($strKeySearchValue!="")
		{
			if($strKeySearch !="") $strKeySearch .=" OR ";
			$strKeySearch .= " itsm_opencall_problem.prb_id1 like '". PrepareForSql($strKeySearchValue) ."' OR";
			$strKeySearch .= " itsm_opencall_problem.prb_id2 like '". PrepareForSql($strKeySearchValue) ."' OR";
			$strKeySearch .= " itsm_opencall_problem.prb_id3 like '". PrepareForSql($strKeySearchValue) ."' OR";
			$strKeySearch .= " itsm_opencall_problem.prb_id4 like '". PrepareForSql($strKeySearchValue) ."' OR";
			$strKeySearch .= " itsm_opencall_problem.prb_id5 like '". PrepareForSql($strKeySearchValue) ."' OR";
			$strKeySearch .= " itsm_opencall_problem.prb_id6 like '". PrepareForSql($strKeySearchValue) ."'";	
		}
	}
	if($strKeySearch!="")
	{
		if ($parsedFilter!="")
		{
			$strANDOR =  " OR ";
			if($_POST['_and']=="true")
				$strANDOR = " AND ";
			if($strKeySearch!="")$parsedFilter .= $strANDOR ." (". $strKeySearch .") ";
		}
		else
		{
			$parsedFilter = $strKeySearch;
		}
	}

	
	if(isset($_POST['bres']))
	{
		$boolOpen = $_POST['bres'];
		if($boolOpen=="1")
		{
			if($parsedFilter!="")
				$parsedFilter = "(".$parsedFilter. ") AND ";
			$parsedFilter .= "(flg_resolved = 0)";
		}
		elseif($boolOpen=="0")
		{
			if($parsedFilter!="")
				$parsedFilter = "(".$parsedFilter. ") AND ";
			$parsedFilter .= "(flg_resolved in (0,1))";
		}
	}
	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;



	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter . swfc_orderby();
?>