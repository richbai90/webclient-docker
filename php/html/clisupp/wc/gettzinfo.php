<?php 

include('_wcconfig.php');

//	returns a string like: +OK bias=0&stdbias=0&dstbias=-60&dststartmonth=0 ...
//	containing all numerical columns from [system_timezones] table

function SwGetTzInfo($timezone)
{
	$con = odbc_connect("Supportworks Cache", swcuid(), swcpwd());
	if(!$con)
		return "-ERR Connection failed";
	
	$result = odbc_exec($con, "SELECT * from system_timezones where name='".$timezone."'");
	if(!$result)
		return "-ERR Select statement failed";
		
	//	we should get back here only one row, as the column [name] is primary key!
	$strRet = "+OK ";
	if (odbc_fetch_row($result))
	{
		// Get the number of columns in our result set
		$ColumnCount = odbc_num_fields($result);
		$i = 0;
		while($i < $ColumnCount)
		{
		    $i++;
			$fieldName = strtolower(odbc_field_name($result, $i));
			$strRet .= $fieldName . "=" . odbc_result($result, $i);
			if ($i < $ColumnCount)	// do not append & after the last token!
				$strRet .= '&';
		}
	}
	if ($strRet == "+OK ")
		return "-ERR No time zone details found for timezone='".$timezone."'";
	else
		return $strRet;
}

//	The script is called with the next GET parameters:
//	 	- timezone : timezone name as in the column [system_timezones.name]
echo SwGetTzInfo($_GET['timezone']);

?>
