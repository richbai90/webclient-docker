<?php
	//-- create filter to get table record - expects 1 or 2 columns


	$fromTable = PrepareForSql($_POST['table']);
	$filter = "";
	if($_POST['columntwo']!="")
	{
		//-- using dual search field
		$columnOne = PrepareForSql($_POST['columnone']);
		$columnOneValue = $_POST['valueone'];
		$columnOneIsNumeric = (swdti_getdatatype($fromTable.".".$columnOne)==18)?true:false;

		$columnTwo = PrepareForSql($_POST['columntwo']);
		$columnTwoValue = $_POST['valuetwo'];
		$columnTwoIsNumeric = (swdti_getdatatype($fromTable.".".$columnTwo)==18)?true:false;

		$bSameValue = ($columnTwoValue == $columnOneValue)?true:false;

		if($columnOneIsNumeric) 
		{
			$filterOne = $columnOne . " = " . PrepareForSql($columnOneValue);
		}
		else
		{
			$columnOneValue = "'".PrepareForSql($columnOneValue)."%'";
			$filterOne = $columnOne . " like " . $columnOneValue;
		}

		if($columnTwoIsNumeric) 
		{
			$filterOne = $columnTwo . " = " . PrepareForSql($columnTwoValue);
		}
		else
		{
			$columnTwoValue = "'".PrepareForSql($columnTwoValue)."%'";
			$filterTwo = $columnTwo . " like " . $columnTwoValue;
		}
	
		$strOP = ($bSameValue)?" OR ":" AND ";	
		$filter = "(" . $filterOne . ")";
		if($filterTwo!="") $filter .= $strOP ." (" . $filterTwo . ")";
	}
	else
	{
		//-- col and value one
		$columnOne = PrepareForSql($_POST['columnone']);
		$columnOneValue = $_POST['valueone'];
		$columnOneIsNumeric = (swdti_getdatatype($fromTable.".".$columnOne)==18)?true:false;

		//-- resolving a single column and value
		if($_POST['exactmatch']=="true" || $columnOneIsNumeric)
		{
			if(!$columnOneIsNumeric) $columnOneValue = "'".PrepareForSql($columnOneValue)."'";
			$filter = $columnOne . " = " . $columnOneValue;
		}
		else
		{
			if(!$columnOneIsNumeric) $columnOneValue = "'".PrepareForSql($columnOneValue)."%'";
			$filter = $columnOne . " like " . $columnOneValue;		
		}
	}

	$sqlDatabase = "swdata";
	$sqlCommand  = "select * from " . $fromTable . " where " . $filter;
?>