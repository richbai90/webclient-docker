<?php
// Formats the file.  This is the main function that calls all functions explained above.
function formatFile($name) 
{    
	$name = strip_ext($name);   
	//$name = removeHyphen($name);    
	$name = capFirstWord($name); 
	
	return $name;
}

// function to strip off the file extension
function strip_ext($name) 
{	
	$ext = strrchr($name, '.');	
	if($ext !== false) 
	{		
		$name = substr($name, 0, -strlen($ext));
	}	
	return $name;
}

// function to remove the hyphen or underscore from filename.
	function removeHyphen($filename) 
	{	
		$target = $filename;	
		$patterns[0] = '/-/';	
		$patterns[1] = '/_/';	
		$replacements[0] = ' ';	
		$replacements[1] = ' ';	
		$filename = preg_replace($patterns, $replacements, $target);	
		return $filename;
	}
	
	// function to capatalize the first character of each word.  Must be called after// the removal of the hyphen or underscore
	function capFirstWord($word) 
	{	
		$cap = $word;	
		$cap = explode(' ', $cap);
		foreach($cap as $key => $value) 
		{			
			$cap[$key] = ucfirst($cap[$key]); 		
		}	
		$word = implode(' ', $cap);	
		return $word;
	}


	function get_table_fields($table,$db_type)
	{

		if ($db_type=='swsql')
			$get_table_columns="DESC ".$table;
		if ($db_type=='mssql')
			$get_table_columns="select name as 'field' from syscolumns where id in (select id from sysobjects where name ='".$table."')";

		return $get_table_columns;
	}


		//-- nwj - return database type swsql, mssql, oracle.
	function get_database_type_bespoke($swdsn, $swuid, $swpwd)
	{
		$strDriver = "";
		$oConn = @odbc_connect($swdsn, $swuid, $swpwd);
		if($oConn)
		{
			$result = odbc_data_source($oConn, SQL_FETCH_FIRST );
			while($result)
			{
				if (strtolower($swdsn) == strtolower($result['server'])) 
				{
					$strDriver = strtolower($result['description']);


					if(strpos($strDriver,"sql server")!==false)
					{
						$databasedriver = "mssql";
					}
					else if(strpos($strDriver,"oracle")!==false)
					{
						$databasedriver = "oracle";
					}
					else
					{
						$databasedriver = "swsql";
					}
					break;
				}
				$result = @odbc_data_source($oConn, SQL_FETCH_NEXT);
			}
		}
		return $databasedriver;
	}
	
	function getAppcodeFilter($strArea)
	{
		// -- Create connection
		$con = new CSwDbConnection;
		$dsn = (isset($_SESSION['dsn'])) ? $_SESSION['dsn']:"";
		$un = (isset($_SESSION['un'])) ? $_SESSION['un']:"";
		$pw = (isset($_SESSION['pw'])) ? $_SESSION['pw']:"";
		if(!$con->Connect($dsn, $un, $pw))
		{
			echo "Failed to connect to database, please check ODBC connection.";
			exit;
		}
		
		// -- GetAppcodeFilter
		$strAppcode = "";
		$strSQL = "select SETTING_VALUE from SW_SBS_SETTINGS where SETTING_NAME = '" . $strArea."' and appcode = '".gv('dataset')."'";
		if($con->Query($strSQL))
		{
			if($con->Fetch())
			{
				$settings_setting_value = $con->getValue("setting_value");
				$arrAppcodes = explode("|",$settings_setting_value);
				foreach($arrAppcodes as $indAppcode)
				{
					if($strAppcode!="")
					{
						$strAppcode .=",";
					}

					if("![CURRENT.DD]!"==$indAppcode)
					{
						$indAppcode = $GLOBALS['datasetfilterlist'];
						$strAppcode .= $indAppcode;
					}
					else
					{
						$strAppcode .="'".$indAppcode."'";
					}
				}
			}
		}
		return $strAppcode;
	}

?>
