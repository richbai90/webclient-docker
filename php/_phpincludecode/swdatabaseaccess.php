<?php
define("DISPLAYNAME_NONE",			0);
define("DISPLAYNAME_ALLUPPERCASE",	1);
define("DISPLAYNAME_ALLLOWERCASE",	2);
define("DISPLAYNAME_MIXEDCASE",		3);

include_once('swsqlparser.php');
class CSwLocalDbConnection
{
	// 27/10/2001 - Hornbill Systems Limited - by Gerry Sweeney
	// This class encapsulates and ODBC database connection and contains common
	// methods that are needed whne building HTML pages that need access to data
	// withion and ODBC SQL dabase

	var $con;
	var $result;
	var $row;
	
	// Connects to the specified database
	function Connect($db, $uid, $pwd, $server = "localhost")
	{
		$this->con = mysql_connect($server . ':5002', $uid, $pwd,1) or die("Could not connect : " . mysql_error());
		mysql_select_db($db,$this->con) or die("Could not select database");
		if(!$this->con)
			return FALSE;

		return TRUE;
	}

  	//	<FN dt=18-Oct-2006> $tz is completely irrelevant when displaying timestamps from the past!
	function LoadDataDictionary($dd/*, $tz = 0*/)
	{
		if(!swdti_load($dd/*, $tz*/))
			swdebug_print("Unable to load Data Dictionary '" . $dd . "'");
	}

	function Close()
	{
		if($this->result)
			mysql_free_result($this->result);
		$this->result = 0;
		if($this->con)
			mysql_close($this->con);
		$this->con = 0;
		return TRUE;
	}

	function GetRecordCount($table, $where = "")
	{
		// If we already have a result set, free it first
		if($this->result)
			mysql_free_result($this->result);
		
		$sql = "SELECT count(*) as ct FROM ";
		$sql .= $table;
		if(strlen($where))
		{
			$sql .= " WHERE ";
			$sql .= $where;
		}

		// Issue our query
		$this->result = mysql_query($sql,$this->con);

		if(!$this->result)
			return 0;

		if($this->Fetch())
			return $this->GetValue("ct");

		return 0;
	}


	// Issues a new query 
	function Query($sql)
	{
		//--TK
		//--Parse Query
		parse_sql_query($sql);
		
		// If we already have a result set, free it first
		if($this->result)
			mysql_free_result($this->result);

		// Issue our query
		$this->result = mysql_query($sql,$this->con);

		if($this->result)
			return TRUE;

		return FALSE;
	}

	// Gets the next row of the current result set. Returns FALSE on no more rows. Because we do not 
	// know the name of the table (this could be a multi-table query), if we want to auto-assign the
	// values to variables in the global scope, we pass in a varibale prefix. 
	function Fetch($valnameprefix = "", $displaynameopt = DISPLAYNAME_NONE)
	{
		if(!$this->result)
			return FALSE;

		if (!$this->row = mysql_fetch_row($this->result))
			return FALSE;

		// We have been asked to extract the data for this row into variables. The variables will
		// be named $<valnameprefix>_<variablename>
		
		// Get the number of columns in our result set
		$ColumnCount = $this->GetColumnCount(); 

		// Iterate the columns and create the PHP variables with the name <tablename>_<column name>
		// There is one cavet here. This function is operating in local scope and the $$ technique
		// used before does not work for a class. Instead, what we do is use the $GLOBALS[] array
		// to set up our results. This is then made available to all areas of the PHP page as the
		// previous version did but, we are still encapsulated in the class. This keeps things
		// nice and tidy
		$i = 0;
		while($i < $ColumnCount) 
		{ 
			$colname = mysql_field_name($this->result, $i);

			if($valnameprefix)
				$fieldName = $valnameprefix . "_" . $colname; 
			else
				$fieldName = $colname; 

			// Make all variable names lower case
			$fieldName = strtolower($fieldName);

			// Now set our variable with the value from the result set
			$GLOBALS[$fieldName] = $this->row[$i]; 

			switch($displaynameopt)
			{
			case DISPLAYNAME_NONE:
				break;

			case DISPLAYNAME_ALLUPPERCASE:
				$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix . "." . $colname));
				break;

			case DISPLAYNAME_ALLLOWERCASE:
				$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtolower($valnameprefix . "." . $colname));
				break;
				
			case DISPLAYNAME_MIXEDCASE:
				$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix) . "." . strtolower($colname));
				break;
			}
			$i++; 
		} 
		return TRUE;
	}

	// Gets the next row of the current result set. Returns FALSE on no more rows. Because we do not 
	// know the name of the table (this could be a multi-table query), if we want to auto-assign the
	// values to variables in the global scope, we pass in a varibale prefix. 
	function FetchLocal($displaynameopt = DISPLAYNAME_NONE)
	{
		if(!$this->result)
			return FALSE;

		if (!$this->row = mysql_fetch_row($this->result))
			return FALSE;

		// We have been asked to extract the data for this row into variables. The variables will
		// be named $<valnameprefix>_<variablename>
		
		// Get the number of columns in our result set
		$ColumnCount = $this->GetColumnCount(); 

		// Iterate the columns and create the PHP variables with the name <tablename>_<column name>
		// There is one cavet here. This function is operating in local scope and the $$ technique
		// used before does not work for a class. Instead, what we do is use the $GLOBALS[] array
		// to set up our results. This is then made available to all areas of the PHP page as the
		// previous version did but, we are still encapsulated in the class. This keeps things
		// nice and tidy
		$i = 0;
		while($i < $ColumnCount) 
		{
		    $colname = mysql_field_name($this->result, $i);

			$fieldname = $colname;
			
			// Make all variable names lower case
			$fieldName = strtolower($fieldName);

			switch($displaynameopt)
			{
			case DISPLAYNAME_NONE:
				$this->colnames[$i] = $fieldName;
				break;

			case DISPLAYNAME_ALLUPPERCASE:
				$this->colnames[$i] = swdti_getcoldispname(strtoupper($valnameprefix . "." . $colname));
				break;

			case DISPLAYNAME_ALLLOWERCASE:
				$this->colnames[$i] = swdti_getcoldispname(strtolower($valnameprefix . "." . $colname));
				break;
				
			case DISPLAYNAME_MIXEDCASE:
				$this->colnames[$i] = swdti_getcoldispname(strtoupper($valnameprefix) . "." . strtolower($colname));
				break;
			}
			$i++;
		} 
		return TRUE;
	}

	function GetColumnCount()
	{
		return sizeof($this->row);
	}

	// Returns a column value in the current row of the current result set
	function GetValue($colname)
	{
		if(!$this->result)
			return "";
		return mysql_result($this->result, $colname);
	}

	// This is a member of the CSwDbConnection class. This will expand the result
	// of the query into a list of HTML 'option' tags and select the default value
	// specified
	function GetResultAsOptions($query, $colname, $defselection)
	{
		if($this->Query($query))
		{
			while($this->Fetch())
			{
				$name = $this->GetValue($colname);
				echo "        <option ";
				if($name == $defselection)
					echo "selected ";
				echo "value=\"";
				echo $name;
				echo "\">";
				echo $name;
				echo "</option>\n";
			}
		}
	}
}

class CSwDbConnection
{
	// 27/10/2001 - Hornbill Systems Limited - by Gerry Sweeney
	// This class encapsulates and ODBC database connection and contains common
	// methods that are needed whne building HTML pages that need access to data
	// withion and ODBC SQL dabase

	var $con;
	var $result;
	var $row;
	
	// Connects to the specified database
	function Connect($dsn, $uid, $pwd)
	{
		$this->con = odbc_connect($dsn, $uid, $pwd);
		if(!$this->con)
			return FALSE;

		return TRUE;
	}

	// Connects to the specified database
	function CacheConnect($uid, $pwd)
	{
		// GERRY: Since the change in the way we use the MySQL based privs system it is no longer possible to
		// obtain a database connection to the cache db using the analysts credentials. Instead we should use the
		// ones provided in the swcuid()/swcpwd() for connecting.  all new PHP code does this already but legacy 
		// code passes the analyst ID/Password in here.  The two input parameters are now ignored and the correct
		// credentials are used directly
		if(function_exists('swcuid'))
		{
			$this->con = odbc_connect("Supportworks Cache", swcuid(), swcpwd());
		}else
		{
			$this->con = odbc_connect("Supportworks Cache", $uid, $pwd);
		}
		if(!$this->con)
			return FALSE;

		return TRUE;
	}

  	//	<FN dt=18-Oct-2006> $tz is completely irrelevant when displaying timestamps from the past!
	function LoadDataDictionary($dd, $tz = 0)
	{
		if(!swdti_load($dd/*, $tz*/))
			swdebug_print("Unable to load Data Dictionary '" . $dd . "'");
	}

	function Close()
	{
		if($this->result)
			odbc_free_result($this->result);
		$this->result = 0;
		if($this->con)
			odbc_close($this->con);
		$this->con = 0;
		return TRUE;
	}

	function GetRecordCount($table, $where = "")
	{
		// If we already have a result set, free it first
		if($this->result)
			odbc_free_result($this->result);
		
		$sql = "SELECT count(*) as ct FROM ";
		$sql .= $table;
		if(strlen($where))
		{
			$sql .= " WHERE ";
			$sql .= $where;
		}

		// Issue our query
		$this->result = odbc_exec($this->con, $sql);

		if(!$this->result)
			return 0;

		if($this->Fetch())
			return $this->GetValue("ct");

		return 0;
	}


	// Issues a new query 
	function Query($sql)
	{
		//--TK
		//--Parse Query
		parse_sql_query($sql);
		
		// If we already have a result set, free it first
		if($this->result)
			odbc_free_result($this->result);

		// Issue our query
		$this->result = odbc_exec($this->con, $sql);

		if(!$this->result)
			return FALSE;

		return TRUE;
	}

	// Gets the next row of the current result set. Returns FALSE on no more rows. Because we do not 
	// know the name of the table (this could be a multi-table query), if we want to auto-assign the
	// values to variables in the global scope, we pass in a varibale prefix. 
	function Fetch($valnameprefix = "", $displaynameopt = DISPLAYNAME_NONE)
	{
		if(!$this->result)
			return FALSE;

		if(!odbc_fetch_row($this->result))
			return FALSE;

		// We have been asked to extract the data for this row into variables. The variables will
		// be named $<valnameprefix>_<variablename>
		
		// Get the number of columns in our result set
		$ColumnCount = odbc_num_fields($this->result); 

		// Iterate the columns and create the PHP variables with the name <tablename>_<column name>
		// There is one cavet here. This function is operating in local scope and the $$ technique
		// used before does not work for a class. Instead, what we do is use the $GLOBALS[] array
		// to set up our results. This is then made available to all areas of the PHP page as the
		// previous version did but, we are still encapsulated in the class. This keeps things
		// nice and tidy
		$i = 0;
		while($i < $ColumnCount) 
		{ 
		    $i++; 
			$colname = odbc_field_name($this->result, $i);
			if($valnameprefix)
				$fieldName = $valnameprefix . "_" . $colname; 
			else
				$fieldName = $colname; 

			// Make all variable names lower case
			$fieldName = strtolower($fieldName);

			// Now set our variable with the value from the result set
			$GLOBALS[$fieldName] = odbc_result($this->result, $i); 

			switch($displaynameopt)
			{
			case DISPLAYNAME_NONE:
				break;

			case DISPLAYNAME_ALLUPPERCASE:
				$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix . "." . $colname));
				break;

			case DISPLAYNAME_ALLLOWERCASE:
				$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtolower($valnameprefix . "." . $colname));
				break;
				
			case DISPLAYNAME_MIXEDCASE:
				$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix) . "." . strtolower($colname));
				break;
			}
		} 
		return TRUE;
	}

	// Gets the next row of the current result set. Returns FALSE on no more rows. Because we do not 
	// know the name of the table (this could be a multi-table query), if we want to auto-assign the
	// values to variables in the global scope, we pass in a varibale prefix. 
	function FetchLocal($displaynameopt = DISPLAYNAME_NONE)
	{
		if(!$this->result)
			return FALSE;

		if(!odbc_fetch_row($this->result))
			return FALSE;

		// We have been asked to extract the data for this row into variables. The variables will
		// be named $<valnameprefix>_<variablename>
		
		// Get the number of columns in our result set
		$ColumnCount = odbc_num_fields($this->result); 

		// Iterate the columns and create the PHP variables with the name <tablename>_<column name>
		// There is one cavet here. This function is operating in local scope and the $$ technique
		// used before does not work for a class. Instead, what we do is use the $GLOBALS[] array
		// to set up our results. This is then made available to all areas of the PHP page as the
		// previous version did but, we are still encapsulated in the class. This keeps things
		// nice and tidy
		$i = 0;
		while($i < $ColumnCount) 
		{
		    $colname = odbc_field_name($this->result, $i+1);

			$fieldname = $colname;
			
			// Make all variable names lower case
			$fieldName = strtolower($fieldName);

			// Now set our variable with the value from the result set
			$this->row[$i] = odbc_result($this->result, $i+1); 

			switch($displaynameopt)
			{
			case DISPLAYNAME_NONE:
				$this->colnames[$i] = $fieldName;
				break;

			case DISPLAYNAME_ALLUPPERCASE:
				$this->colnames[$i] = swdti_getcoldispname(strtoupper($valnameprefix . "." . $colname));
				break;

			case DISPLAYNAME_ALLLOWERCASE:
				$this->colnames[$i] = swdti_getcoldispname(strtolower($valnameprefix . "." . $colname));
				break;
				
			case DISPLAYNAME_MIXEDCASE:
				$this->colnames[$i] = swdti_getcoldispname(strtoupper($valnameprefix) . "." . strtolower($colname));
				break;
			}
			$i++;
		} 
		return TRUE;
	}

	function GetColumnCount()
	{
		return sizeof($this->row);
	}

	// Returns a column value in the current row of the current result set
	function GetValue($colname)
	{
		if(!$this->result)
			return "";
		return odbc_result($this->result, $colname);
	}

	// This is a member of the CSwDbConnection class. This will expand the result
	// of the query into a list of HTML 'option' tags and select the default value
	// specified
	function GetResultAsOptions($query, $colname, $defselection)
	{
		if($this->Query($query))
		{
			while($this->Fetch())
			{
				$name = $this->GetValue($colname);
				echo "        <option ";
				if($name == $defselection)
					echo "selected ";
				echo "value=\"";
				echo $name;
				echo "\">";
				echo $name;
				echo "</option>\n";
			}
		}
	}
}

class CSwDbRecordInserter
{
	// Represents an array of values
	var $valarray;
	var $sql;

	function Reset()
	{
		$this->valarray = "";
	}

	function SetValue($name, $value)
	{
		if(strlen($value) == 0)
			return;

		$var = $value;

		// Prepare this string for SQL use
		$var = str_replace("'", "\'", $var);

		$this->valarray[$name] = $var;
	}

	function InsertRecord($db, $tablename)
	{
		$cols = "";
		$vals = "";

		reset($this->valarray);
		while(list($key,$val) = each($this->valarray))
		{
			if(strlen($vals))
				$vals .= ", ";
			$vals .= "'";
			$vals .= $val;
			$vals .= "'";

			if(strlen($cols))
				$cols .= ", ";
			$cols .= $key;

		}

		$this->sql = "INSERT INTO ";
		$this->sql .= $tablename;
		$this->sql .= "(";
		$this->sql .= $cols;
		$this->sql .= ") VALUES (";
		$this->sql .= $vals;
		$this->sql .= ")";

		return $db->Query($this->sql);
	}
}



class CSwDbRecordUpdater
{
	// Represents an array of values
	var $valarray;
	var $sql;

	function Reset()
	{
		$this->valarray = "";
	}

	function SetValue($name, $value)
	{
		if(strlen($value) == 0)
			return;

		$var = $value;

		// Prepare this string for SQL use
		$var = str_replace("'", "\'", $var);

		$this->valarray[$name] = $var;
	}

	function UpdateRecord($db,$tablename,$keyname,$keyval)
	{
		$vals = "";

		reset($this->valarray);
		while(list($key,$val) = each($this->valarray))
		{
			if(strlen($vals))
				$vals .= ", ";

			$vals .= $key;
			$vals .= " = ";

			$vals .= "'";

			$vals .= $val;
			
			$vals .= "'";

		}

		$this->sql = "UPDATE ";
		$this->sql .= $tablename;
		$this->sql .= " SET ";
		$this->sql .= $vals;
		$this->sql .= " WHERE ";
		$this->sql .= $keyname;
		$this->sql .= " = '";
		$this->sql .= $keyval;
		$this->sql .= "'";

		return $db->Query($this->sql);
	}
}


?>
