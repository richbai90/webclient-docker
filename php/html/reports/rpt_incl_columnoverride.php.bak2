<?php
//Daniel Edwards 09/02/2006
//If you want to override the format of any of the columns being displayed in the system reports
//simply add another if statement to check the column being passed in. this is always [TABLENAME].[COLUMNNAME]
// e.g opencall.site or userdb.telex

include_once('swformattimeintext.php');

function ColumnFormatOverride(&$column,&$value)
{
	//Check to see if we are reporting on the standard rate column
	//Adding functionality so that we convert into pounds any column that has a name that ends with _pence, then add the £ symbol
	if ($column == "costcent.rate" || substr($column, (strlen($column)-6), 6) == "_pence")
	{
		$myval = $value/100;
		$myval = "£".+$myval;
		return $myval; 
	}

	//DTE:- Should now correctly format the prob_text column
	else if ($column == "opencall.prob_text")
		return str_replace(chr(13),"<br> &nbsp; ",$value);

	else if ($column == "updatedb.updatetxt" )	
		return SwConvertDateTimeInText($value);

	return NULL;
}
?>