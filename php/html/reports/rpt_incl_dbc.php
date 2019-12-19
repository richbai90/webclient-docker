<?php
/*#####################################################################################################################
Multi Database Connection Class - written by G Lambert, 14/07/2004 - Last Update 03/07/2005 (Glen)

The aim of this class is to connect and access any database using the same methods/functions. This is to smooth all
the subtle differences between database systems so that any script making use of this class can make use of native calls
without being geared towards a particular database. I decided I needed this because of the giant headache I had during
the conversion of the report templates, which for efficiecny used native MySQL calls, to AssetWorks where the only
available database connection was ODBC. With this class in place, future, similar changes would only require changes
to the innitial connection string, the rest of the code should not need to be touched.

The constructor accepts upto 6 parameters (at least 4, $select and $port are not needed by some databases)
	$type			A string indicating database type (mysql, mssql, pgsql, odbc) default is ODBC if $type is invalid
	$username		Username required to login to the database
	$password		Password for the above username
	$database		Database server URL or DSN
	$select			Default database to connect to, optional and relevent only for MySQL connections
	$port			When supplying a port number to PostGreSQL, it must be done so using this argument NOT server:PORT
	$underlying		If the DB type is ODBC, this parameter is used to set the underlying database, eg, mssql

Methods available
	Query			(STR <QUERY>)			Execute a query
	FetchRow		()						Assigns $this->row a numerically indexed array of results from the row
	FetchHash		()						Assigns $this->row an associative array of results from the row
	LastInsertID	(STR <tbl> STR <col>)	Returns the ID value of the row inserted by the previous INSERT query. The
											-> table and column parameters are only required for PostGreSQL
	NumRows			()						Returns	the number of rows in the result set
	AffectedRows	()						Returns the number of rows modified by the last INSERT/UPDATE/DELETE query
	Close			()						Closes the current database connection
	SelectDB		(STR <database name>)	For selecting a database in MySQL

Properties Available
	conn			The database connection resource
	results			The result set
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	type			String representing the database type
	$underlying		Underlying DB type in case of ODBC type. This is used to tailor methods like LastInsertID()
	row				Numeric or Associative array (depending on which fetch method was used) containing one row
	error			Contains the last error message or warning generated by the object
#####################################################################################################################*/
class RptMK2DBConn
{
	var $underlying;
	var $conn;
	var $results = array();
	var $row;
	var $error;

	function RptMK2DBConn($database, $username, $password, $underlying="")
	{
		$this->underlying = $underlying;
		if ($this->conn = odbc_connect($database, $username, $password))
		{
			return true;
		}
		else
		{
			$this->error = "<b>".$this->type."</b> - Could not connect to ".$this->database.": ".odbc_errormsg();
			print $this->error;
			exit;
		}
	}

	function Query($query, $qryname = "Default")
	{
		if ($this->results[$qryname] = odbc_exec($this->conn,$query)) return true;
		else
		{
			$this->error = "<b>".$this->database."</b> - Query \"".$query."\" returned no results: ".odbc_errormsg();
			return false;
		}
	}

	function FetchRow($qryname = "Default")
	{
		if (odbc_fetch_into($this->results[$qryname],$this->row)) return true;
		else
		{
			$this->error = "<b>".$this->type."</b> - No rows to fetch: ".odbc_errormsg();
			return false;
		}
	}

	function LastInsertID($table="", $field="")
	{
		if (!$this->underlying)
		{
			if ($insertid = odbc_exec($this->conn,"SELECT LAST_INSERT_ID()"))
			{
				if (odbc_fetch_into($insertid,$row)) return $row[0];
				else return false;
			}
			else return false;
		}
		else if ($this->underlying == "mssql")
		{
			if ($insertid = odbc_exec($this->conn,"LAST_INSERT_ID=@@IDENTITY"))
			{
				if (odbc_fetch_into($insertid,$row)) return $row[0];
				else return false;
			}
			else return false;
		}
	}

	function NumRows($qryname = "Default")
	{
		return odbc_num_rows($this->results[$qryname]);
	}

	function AffectedRows($qryname = "Default")
	{
		return odbc_num_rows($this->results[$qryname]);
	}

	function Close()
	{
		odbc_close($this->conn);
	}
}


?>