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


	function gxc($dom,$tag)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if(isset($a[0]))return $a[0]->get_content();
		return "";
	}

	function get_table_fields($table)
	{
		$strDB = swdsn();
		if($strDB == "Supportworks Data")
		{
			$strDB = "swdata";
		}
		$xmlmc = new XmlMethodCall ();
		$xmlmc->SetParam("database",$strDB);
		$xmlmc->SetParam("table",$table);
		if($xmlmc->invoke("data","getColumnInfoList"))
		{		
			$table_fields = array();
			$table_fields_query = $xmlmc->xmlDom;
			
			$arrColumnsDom = $table_fields_query->get_elements_by_tagname("columnInfo");
			
			while (list($pos,$columnNode) = each($arrColumnsDom))
			{
				$colName = gxc($columnNode,"name");
				array_push($table_fields,$colName);
			}
			return $table_fields;
		}
		//-- debug: else print_r($xmlmc->_lasterror); exit;
		return "";
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
		if(!$con->Connect(swdsn(), swuid(), swpwd()))
		{
			echo "Failed to connect to database, please check ODBC connection.";
			exit;
		}
		
		// -- GetAppcodeFilter
		$strAppcode = "";
		$strSQL = "select SETTING_VALUE from SW_SBS_SETTINGS where SETTING_NAME = '" . $strArea."' and appcode = '" . gv('dataset') . "'";
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
