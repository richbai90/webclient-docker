<?php

@define("DISPLAYNAME_NONE",			0);
@define("DISPLAYNAME_ALLUPPERCASE",	1);
@define("DISPLAYNAME_ALLLOWERCASE",	2);
@define("DISPLAYNAME_MIXEDCASE",		3);

include_once("helpers/sqlquery.complexconversions.php");
@include_once('helpers/language.php');
include_once('swsqlparser.php');
class CSwLocalDbConnection
{
	var $_lasterror = "";
	var $_xmlDom = null;
	var $_rowposition = -1;
	var $_rowcount = 0;
	var $_columns = Array();
	var $_sql = "";
	var $_server = "";
	var $_formattedrs = null;

	var $db;
	var $result;
	function get_database_type()
	{
		$strSqlType = "swsql";
		if(gv('mssqlinuse') == 1)
			$strSqlType = "mssql";
		if(gv('oracleinuse') == 1)
			$strSqlType = "oracle";
		
		return $strSqlType;
	}
	function Connect($dsn, $uid="", $pwd="")
	{
		$this->db = 'syscache';
		if($this->db=='Supportworks Data')
			$this->db = 'swdata';
		$server=$_SESSION['server_name'];
		$this->_server = $server;
		return true;
	}
	function SwDataConnect()
	{
		$server=$_SESSION['server_name'];
		$this->_server = $server;
		$this->db = 'swdata';
		return true;
	}

	//xmlmc api has locked connection these databases for security purposes
	function SwKbCacheConnect($server = "localhost")
	{
		return false;
	}

	//xmlmc api has locked connection these databases for security purposes
	function SwMailCacheConnect($server = "localhost")
	{
		return false;
	}

	function SwCacheConnect($server = "localhost")
	{
		if(isset($_SESSION['server_name']) && $server=="localhost")
			$server=$_SESSION['server_name'];
		$this->_server = $server;
		return $this->Connect("sw_systemdb");
	}

	function Query($strSQL,$boolMakeRS=false,$strFormat=false,$xmlComplexConversions=null,$intRowLimit="",$intRowOffset="",$intRowCount="",$strServer="localhost")
	{
		//--TK
		//--Parse Query
		//parse_sql_query($strSQL);
		
		// If we already have a result set, free it first
		if($this->result)
			$this->result = null;
		$strServer = $this->_server;
		$this->_sql = $strSQL;
		// Issue our query
		$this->_columns = Array();
		$this->_xmlDom = null;
		$this->_rowcount = 0;
		$this->_rowposition = -1;
		$this->_lasterror = "";
		$this->_lasterrorcode = 0;
		$this->_failed = false;

		$strDB = $this->db;
		if($strDB=="syscache")$strDB="sw_systemdb";

		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("database",$strDB);
		$xmlmc->SetParam("query",utf8_encode($strSQL));
		if($intRowOffset!="")$xmlmc->SetParam("rowOffset",$intRowOffset);
		if($intRowCount!="")$xmlmc->SetParam("rowCount",$intRowCount);
		$xmlmc->SetParam("formatValues",true);		
		$xmlmc->SetParam("returnMeta","true");
		if($intRowLimit!="")$xmlmc->SetParam("maxResults",$intRowLimit);
		$xmlmc->SetParam("returnRawValues",true);
			
		if($xmlmc->Invoke("data","sqlQuery",$strServer))
		{			
			$this->result = $xmlmc->xmlDom;
			$this->_xmlDom = $xmlmc->xmlDom;

			//-- move to first row
			$this->_process_metadata($xmlComplexConversions); //-- store col info
			$this->_failed = false;
		}
		else
		{
			$this->_lasterrorcode = $xmlmc->GetLastErrorCode();
			$this->_lasterror = $xmlmc->GetLastError();
			$this->_failed = true;
		}

		if(!$this->result)
			return FALSE;

		$this->colcount = $this->GetColumnCount();
		if($boolMakeRS)
		{
			$rs = $this->CreateRecordSet();
			return $rs;
		}
		return TRUE;
	}

	//-- store column names
	function _process_metadata($xmlComplexConversions = null)
	{
		//-- get any complexconversion info
		$this->_columns = Array();
		$arrDM = $this->result->get_elements_by_tagname("metaData");
		$xmlMD = $arrDM[0];
		if($xmlMD)
		{
			$children = $xmlMD->child_nodes();
			$dTotal = count($children);
			for ($i=0;$i<$dTotal;$i++)
			{
				$colNode = $children[$i];
				if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
				{
					$strColName = $colNode->tagname();
					$this->$strColName = new _swm_Column("","");
					$this->_columns[$strColName] = $this->$strColName;

					$colDM = $colNode->get_elements_by_tagname("dataType");
					
					$this->_columns[$strColName]->type = $colDM[0]->get_content();
					//-- now get the complex defs for this column	
					if($xmlComplexConversions)
					{
						$complexChild = $xmlComplexConversions->get_elements_by_tagname($strColName);
						if($complexChild[0])
						{
							$this->_columns[$strColName]->_complexfunctions = Array();
							$complexChildren = $complexChild[0]->child_nodes();
							$xTotal = count($complexChildren);
							for ($x=0;$x<$xTotal;$x++)
							{
								$complexNode = $complexChildren[$x];
								if($complexNode->node_name()!="#text" && $complexNode->node_name()!="#comment")
								{
									$strConversionFunctionName = $complexNode->get_content();
									$this->_columns[$strColName]->_complexfunctions[$complexNode->node_name()] = $strConversionFunctionName;
								}
							}
						}
					}
				}
			}
		}
	}
		
		
	function GetColumnCount()
	{
		if(isset($this->result->_columns))	return count($this->result->_columns); 
		else return 0;
	}

	function GetRecordCount($strTable, $strWhere = "")
	{
		$sql = "SELECT count(*) as ct FROM ";
		$sql .= $strTable;
		if(strlen($strWhere))
		{
			$sql .= " WHERE ";
			$sql .= $strWhere;
		}

		// Issue our query
		$this->Query($sql);

		if(!$this->result)
			return 0;

		if($this->Fetch())
			return $this->GetValue("ct");
	}

	function CreateRecordSet()
	{
		//-- dont have a valid result
		if(!$this->result)	return FALSE;

		//-- fetch results
		$newRS = new xmlmcRecordset;
	    $thisData = "";

		$ColumnCount = $this->colcount;
		$rowcount = 0;
		$i=0;

		//-- fetch data
		while($tmpObj= $this->Fetch("rs",DISPLAYNAME_NONE,true))
		{
			$thisData[$i] = $tmpObj;
			$i++;
		    $rowcount++;
		}

		//-- clear result
		$this->result=false;
		//-- populate the recordset and return it
		//$newRS->SetData($thisData, $rowcount, $query);
		$newRS->SetData($thisData, $rowcount, $this->_sql);
		return $newRS;
	}

	function Fetch($valnameprefix = "", $displaynameopt = DISPLAYNAME_NONE,$boolRecordsetStub = false)
	{
		if(!$this->result)
			return FALSE;

		//get the next row
		$this->_rowposition++;
		$arrRows = $this->result->get_elements_by_tagname("row");
		if(isset($arrRows[$this->_rowposition]))
		{
			//return $this->fetch();
		}
		else
		{
			$this->_rowposition=-1;
			return false;
		}

		//-- load current row columns into column class that has .value and .formattedvalue
		$arrRows = $this->result->get_elements_by_tagname("row");
		if($arrRows[$this->_rowposition])
		{
			//-- set data values for returned columns
			foreach($this->_columns as $strColName => $aCol)
			{
				$xmlCol = $arrRows[$this->_rowposition]->get_elements_by_tagname($strColName);
				if(isset($xmlCol[0]))
				{
					$strFormattedValue = $xmlCol[0]->get_content();
					if(method_exists($xmlCol[0],"has_attribute") && $xmlCol[0]->has_attribute("raw"))
					{
						$strRawValue = $xmlCol[0]->get_attribute("raw");
					}
					else
					{
						$strRawValue = &$strFormattedValue;
					}
					
					//-- set values
					$this->_columns[$strColName]->value = $strRawValue;
					$this->_columns[$strColName]->_formattedvalue = $strFormattedValue;
				}
				else
				{
					$this->_columns[$strColName]->value = "";
					$this->_columns[$strColName]->_formattedvalue = "";
				}

			}//-- eof for each column
			//-- get complex values
			foreach($this->_columns as $strColName => $aCol)
			{
				if($valnameprefix)
					$fieldName = $valnameprefix . "_" . $strColName; 
				else
					$fieldName = $strColName; 
				$fieldName = strtolower($fieldName);

				foreach($aCol->_complexfunctions as $strComplexName => $strFunctionName)
				{
					if(function_exists($strFunctionName))
					{
						$this->_columns[$strColName]->$strComplexName = $strFunctionName($aCol->value,$aCol->_formattedvalue,$this->_columns);
					}
					else
					{
						$aCol->$strComplexName = "";
					}
				}

				$GLOBALS[$fieldName] = $aCol->value;
				switch($displaynameopt)
				{
				case DISPLAYNAME_NONE:
					break;

				case DISPLAYNAME_ALLUPPERCASE:
					$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix . "." . $strColName));
					break;

				case DISPLAYNAME_ALLLOWERCASE:
					$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtolower($valnameprefix . "." . $strColName));
					break;
					
				case DISPLAYNAME_MIXEDCASE:
					$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix) . "." . strtolower($strColName));
					break;
				}
				if($boolRecordsetStub)
				{
					$colName = strtolower($strColName);
					
					$ar[$colName] = new stdClass;
					$ar[$colName]->value = $aCol->value;
					$ar[$colName]->formattedvalue = $aCol->_formattedvalue;
					$ar[$colName]->type = $aCol->type;
				}	
			}
			if($boolRecordsetStub)
				return $ar;
		}
		return true;
	}

	function FetchLocal($displaynameopt = DISPLAYNAME_NONE)
	{
		$this->Fetch("",$displaynameopt);
	}

	function LoadDataDictionary($dd/*, $tz = 0*/)
	{
		if(!swdti_load($dd/*, $tz*/))
			swdebug_print("Unable to load Data Dictionary '" . $dd . "'");
	}

	function GetValue($colname)
	{
		if(!$this->result)
			return "";

		$colname = strtolower($colname);
		$arrRows = $this->result->get_elements_by_tagname("row");
		$xmlCol = $arrRows[$this->_rowposition]->get_elements_by_tagname($colname);
		if($xmlCol[0])
		{
			if(method_exists($xmlCol[0],"has_attribute") && $xmlCol[0]->has_attribute("raw"))
			{
				return $xmlCol[0]->get_attribute("raw");
			}
			else return $xmlCol[0]->get_content();

		}
		return "";
	}

	function GetResultAsOptions($query, $colname, $defselection, $dispcolumn = "")
	{
		if($dispcolumn=="")
		{
			$dispcolumn = $colname;
		}
		if($this->Query($query))
		{
			while($this->Fetch())
			{
				$name = $this->GetValue($colname);
				echo "        <option ";
				if($name == $defselection)echo "selected ";
				echo "value=\"";
				echo $name;
				echo "\">";
				echo $this->GetValue($dispcolumn);
				echo "</option>\n";
			}
		}
	}

	
	function close()
	{
		return true;
	}

}

class CSwDbConnection
{
	var $_lasterror = "";
	var $_xmlDom = null;
	var $_rowposition = -1;
	var $_rowcount = 0;
	var $_columns = Array();
	var $_sql = "";
	var $_server = "";
	var $_formattedrs = null;
	var $_effectedrowcount = -1;

	var $db;
	var $result;
	var $arrRows;
	function SwDataConnect()
	{
		$this->db = swdsn();
		if($this->db=='Supportworks Data')
			$this->db = 'swdata';
		$server=$_SESSION['server_name'];
		$this->_server = $server;
		return true;
	}
	function SwCacheConnect($server = "localhost")
	{
		if(isset($_SESSION['server_name']) && $server=="localhost")
			$server=$_SESSION['server_name'];
		$this->_server = $server;
		$this->db = 'sw_systemdb';
		return true;
	}

	//xmlmc api has locked connection these databases for security purposes
	function SwMailCacheConnect()
	{
		return false;
	}

	//xmlmc api has locked connection these databases for security purposes
	function SwKbCacheConnect()
	{
		return false;
	}

	function Connect($dsn, $uid="", $pwd="")
	{
		$this->db = $dsn;
		if($this->db=='Supportworks Data')
			$this->db = 'swdata';
		$server=$_SESSION['server_name'];
		$this->_server = $server;
		return true;
	}

	function CacheConnect($uid, $pwd)
	{
		$this->db = 'sw_systemdb';
		$server=$_SESSION['server_name'];
		$this->_server = $server;
		return true;
	}

	function is_swdata($dBtype)
	{
		return true;
	}

	function get_database_type()
	{
		//return @$_SESSION['databasedriver'];
		$strSqlType = "swsql";
		if(gv('mssqlinuse') == 1)
			$strSqlType = "mssql";
		if(gv('oracleinuse') == 1)
			$strSqlType = "oracle";
		
		return $strSqlType;
	}
	function LoadDataDictionary($dd/*, $tz = 0*/)
	{
		if(!swdti_load($dd/*, $tz*/))
			swdebug_print("Unable to load Data Dictionary '" . $dd . "'");
	}

	function Close()
	{
		return true;
	}

	function Query($strSQL,$boolMakeRS=false,$strFormat=false,$xmlComplexConversions=null,$intRowLimit="",$intRowOffset="",$intRowCount="",$strServer="localhost")
	{
		// If we already have a result set, free it first
		if($this->result)
			$this->result = null;
		$strServer = $this->_server;
		// Issue our query
		$this->_sql = $strSQL;
		$this->_columns = Array();
		$this->_xmlDom = null;
		$this->_rowcount = 0;
		$this->_rowposition = -1;
		$this->_lasterror = "";
		$this->_lasterrorcode = 0;
		$this->_failed = false;
		$this->_effectedrowcount = -1;

		$strDB = $this->db;
		if($strDB=="syscache")$strDB="sw_systemdb";
		
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("database",$strDB);
		$xmlmc->SetParam("query",utf8_encode($strSQL));
		if($intRowOffset!="")$xmlmc->SetParam("rowOffset",$intRowOffset);
		if($intRowCount!="")$xmlmc->SetParam("rowCount",$intRowCount);
		$xmlmc->SetParam("formatValues",true);		
		$xmlmc->SetParam("returnMeta","true");
		if($intRowLimit!="")$xmlmc->SetParam("maxResults",$intRowLimit);
		$xmlmc->SetParam("returnRawValues",true);

		if($xmlmc->Invoke("data","sqlQuery",$strServer))
		{			
			$this->result = $xmlmc->xmlDom;
			$this->_effectedrowcount = $xmlmc->GetParam('rowsEffected');

			//-- move to first row
			$this->_process_metadata($xmlComplexConversions); //-- store col info
			$this->_failed = false;
		}
		else
		{
			$this->_lasterrorcode = $xmlmc->GetLastErrorCode();
			$this->_lasterror = $xmlmc->GetLastError();
			$this->_failed = true;
		}

		if(!$this->result)
			return FALSE;

		$this->colcount = $this->GetColumnCount();
		if($boolMakeRS)
		{
			$rs = $this->CreateRecordSet();
			return $rs;
		}
		return TRUE;
	}

	//-- store column names
	function _process_metadata($xmlComplexConversions = null)
	{
		//-- get any complexconversion info
		$this->_columns = Array();
		$arrDM = $this->result->get_elements_by_tagname("metaData");

		if(isset($arrDM[0]))
		{
			$xmlMD = $arrDM[0];
			$children = $xmlMD->child_nodes();
			$dTotal = count($children);
			for ($i=0;$i<$dTotal;$i++)
			{
				$colNode = $children[$i];
				if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
				{
					$strColName = $colNode->tagname();
					$this->$strColName = new _swm_Column("","");
					$this->_columns[$strColName] = $this->$strColName;

					$colDM = $colNode->get_elements_by_tagname("dataType");
					
					$this->_columns[$strColName]->type = $colDM[0]->get_content();
					//-- now get the complex defs for this column	
					if($xmlComplexConversions)
					{
						$complexChild = $xmlComplexConversions->get_elements_by_tagname($strColName);
						if($complexChild[0])
						{
							$this->_columns[$strColName]->_complexfunctions = Array();
							$complexChildren = $complexChild[0]->child_nodes();
							$xTotal = count($complexChildren);
							for ($x=0;$x<$xTotal;$x++)
							{
								$complexNode = $complexChildren[$x];
								if($complexNode->node_name()!="#text" && $complexNode->node_name()!="#comment")
								{
									$strConversionFunctionName = $complexNode->get_content();
									$this->_columns[$strColName]->_complexfunctions[$complexNode->node_name()] = $strConversionFunctionName;
								}
							}
						}
					}
				}
			}
		}
	}
		
	function FetchLocal($displaynameopt = DISPLAYNAME_NONE)
	{
		$this->Fetch("",$displaynameopt);
	}

	function GetValue($colname)
	{
		
		if(!$this->result)
			return "";
		
		$colname = strtolower($colname);
		$arrRows = $this->result->get_elements_by_tagname("row");
		$xmlCol = $arrRows[$this->_rowposition]->get_elements_by_tagname($colname);
		if($xmlCol[0])
		{
			if(method_exists($xmlCol[0],"has_attribute") && $xmlCol[0]->has_attribute("raw"))
			{
				return $xmlCol[0]->get_attribute("raw");
			}
			else return $xmlCol[0]->get_content();
		}
		return "";
	}

	function GetResultAsOptions($query, $colname, $defselection, $dispcolumn = "")
	{
		if($dispcolumn=="")
		{
			$dispcolumn = $colname;
		}
		if($this->Query($query))
		{
			while($this->Fetch())
			{
				$name = $this->GetValue($colname);
				echo "        <option ";
				if($name == $defselection)echo "selected ";
				echo "value=\"";
				echo $name;
				echo "\">";
				echo $this->GetValue($dispcolumn);
				echo "</option>\n";
			}
		}
	}
	
	
	function GetRecordCount($strTable, $strWhere = "")
	{
		$sql = "SELECT count(*) as ct FROM ";
		$sql .= $strTable;
		if(strlen($strWhere))
		{
			$sql .= " WHERE ";
			$sql .= $strWhere;
		}

		// Issue our query
		$this->Query($sql);

		if(!$this->result)
			return 0;

		if($this->Fetch())
			return $this->GetValue("ct");
	}

	function GetColumnCount()
	{
		if(@$this->result->_columns)	return count($this->result->_columns); 
		else return 0;
	}

	function affectedRowCount()
	{
		return $this->_effectedrowcount;
	}

	function CreateRecordSet()
	{
		//-- dont have a valid result
		if(!$this->result)	return FALSE;

		//-- fetch results
		$newRS = new xmlmcRecordset;
	    $thisData = "";

		$ColumnCount = $this->colcount;
		$rowcount = 0;
		$i=0;

		//-- fetch data
		
		//-- load current row columns into column class that has .value and .formattedvalue
		$this->arrRows = $this->result->get_elements_by_tagname("row");
		while($tmpObj= $this->Fetch("rs",DISPLAYNAME_NONE,true,true))
		{
			$thisData[$i] = $tmpObj;
			$i++;
		    $rowcount++;
		}

		//-- clear result
		$this->result=false;

		//-- populate the recordset and return it
		//$newRS->SetData($thisData, $rowcount, $query);
		$newRS->SetData($thisData, $rowcount, $this->_sql);
		return $newRS;
	}

	function Fetch($valnameprefix = "", $displaynameopt = DISPLAYNAME_NONE,$boolRecordsetStub = false,$boolFromCRS = false)
	{
		if(!$this->result)
			return FALSE;

		//get the next row
		$this->_rowposition++;

		if(!$boolFromCRS)
		{
			//-- AG 1/2015 : Moved this to CreateRecordSet to improve performance
			//-- load current row columns into column class that has .value and .formattedvalue
			$this->arrRows = $this->result->get_elements_by_tagname("row"); 
		}
		if(isset($this->arrRows[$this->_rowposition]))
		{
			$boolFoundAColumn = false;
			//-- set data values for returned columns
			foreach($this->_columns as $strColName => $aCol)
			{
				$xmlCol = $this->arrRows[$this->_rowposition]->get_elements_by_tagname($strColName);
				if(@$xmlCol[0])
				{
					$boolFoundAColumn = true;

					$strFormattedValue = $xmlCol[0]->get_content();
					if(method_exists($xmlCol[0],"has_attribute") && $xmlCol[0]->has_attribute("raw"))
					{
						$strRawValue = $xmlCol[0]->get_attribute("raw");
					}
					else
					{
						$strRawValue = &$strFormattedValue;
					}
					
					//-- set values
					$this->_columns[$strColName]->value = $strRawValue;
					$this->_columns[$strColName]->_formattedvalue = $strFormattedValue;
				}
				else
				{
					$this->_columns[$strColName]->value = "";
					$this->_columns[$strColName]->_formattedvalue = "";
				}

			}//-- eof for each column
			if(!$boolFoundAColumn)
			{
				//no columns found, as no data returned
				return false;
			}
			//-- get complex values
			foreach($this->_columns as $strColName => $aCol)
			{
				if($valnameprefix)
					$fieldName = $valnameprefix . "_" . $strColName; 
				else
					$fieldName = $strColName; 
				$fieldName = strtolower($fieldName);

				foreach($aCol->_complexfunctions as $strComplexName => $strFunctionName)
				{
					if(function_exists($strFunctionName))
					{
						$this->_columns[$strColName]->$strComplexName = $strFunctionName($aCol->value,$aCol->_formattedvalue,$this->_columns);
					}
					else
					{
						$aCol->$strComplexName = "";
					}
				}

				$GLOBALS[$fieldName] = $aCol->value;
				switch($displaynameopt)
				{
				case DISPLAYNAME_NONE:
					break;

				case DISPLAYNAME_ALLUPPERCASE:
					$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix . "." . $strColName));
					break;

				case DISPLAYNAME_ALLLOWERCASE:
					$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtolower($valnameprefix . "." . $strColName));
					break;
					
				case DISPLAYNAME_MIXEDCASE:
					$GLOBALS["DN_" . $fieldName] = swdti_getcoldispname(strtoupper($valnameprefix) . "." . strtolower($strColName));
					break;
				}
				if($boolRecordsetStub)
				{
					$colName = strtolower($strColName);
					
					$ar[$colName] = new stdClass;
					$ar[$colName]->value = $aCol->value;
					$ar[$colName]->formattedvalue = $aCol->_formattedvalue;
					$ar[$colName]->type = $aCol->type;
				}	
			}
			if($boolRecordsetStub)
			{
				return $ar;
			}
		}
		else
		{
			$this->_rowposition=-1;
			return false;
		}
		return true;
	}

	function getdbcolumns($strTable , $strDBname = "swdata")
	{

	}

	function getcoltype($result,$strColName)
	{

	}

	function getcolumntype($strTable, $strColName)
	{

	}

	function getprimarykeys($strTable)
	{
	
	}
	function getprimarykeytype($rsCols,$keyName)
	{
	
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

//-- create in memory record set
class odbcRecordset 
{
   var $recordcount=0;
   var $currentrow;
   var $currRow=null;
   var $eof;
   var $colcount=0;

   var $recorddata;
   var $query;

   function odbcConnection()
   {
     $this->recordcount = 0;
     $this->recorddata = 0;
	 $this->colcount=0;
   }

   function SetData( $newdata, $num_records, $query) 
   {
     $this->recorddata = $newdata;
     $this->recordcount = $num_records;

     $this->query = $query;
     $this->currentrow = 0;
     $this->set_eof();

	 if(!$this->eof) $this->colcount = sizeof($this->recorddata[$this->currentrow]);
   }

	//-- take data from other record set and merge with this one (assumes same query)
   function mergedata($mergeRS)
   {
		//-- now merge data
		while(!$mergeRS->eof)
		{
			$this->recorddata[$this->recordcount++] = $mergeRS->recorddata[$mergeRS->currentrow];
			$mergeRS->movenext();
		}
		$this->movefirst();
   }

   function set_eof() 
   {
     $this->eof = $this->currentrow >= $this->recordcount;
   }

   function movenext()  { if ($this->currentrow < $this->recordcount) { $this->currentrow++; $this->set_eof(); } }
   function moveprev()  { if ($this->currentrow > 0)                  { $this->currentrow--; $this->set_eof(); } }
   function movefirst() { $this->currentrow = 0; $this->set_eof();                                              }
   function movelast()  { $this->currentrow = $this->recordcount - 1;  set_eof();                        }

   function row()
   {
		return $this->recorddata[$this->currentrow];
   }

	//-- return if feild value is null
	function is_field_null($field_name)
	{
		if (isset($this->recorddata[$this->currentrow][$field_name])) 
		{
			$thisVal = $this->recorddata[$this->currentrow][$field_name]->value;
		} 
		else if ($this->eof) 
		{
			die("<B>Error!</B>eof of recordset was reached");
		} 
		else 
		{
			die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
		}

		if ($thisVal === NULL)return true;
		return false;
	}


   //-- function that returns field value using htmlentities - used for xss
   function xf($field_name) 
   {
     if (isset($this->recorddata[$this->currentrow][$field_name])) 
	 {
		 //-- 2.4 LANG added decode, and parameters for htmlentities
        $thisVal = htmlentities(lang_decode_to_utf($this->recorddata[$this->currentrow][$field_name]->value),ENT_QUOTES,"UTF-8");
    } 
	 else if ($this->eof) 
	 {
         die("<B>Error!</B>2eof of recordset was reached");
     } 
	 else 
	 {
         die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
     }

	  if ($thisVal == "")$thisVal="";
      return $thisVal;
   } 


   function f($field_name,$boolPFS = false) 
   {
     if (isset($this->recorddata[$this->currentrow][$field_name])) 
	 {
 		 //2.4 LANG
         $thisVal = lang_decode_to_utf($this->recorddata[$this->currentrow][$field_name]->value);
     } 
	 else if ($this->eof) 
	 {
         die("<B>Error!</B>3eof of recordset was reached");
     } 
	 else 
	 {
         die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
     }

	  if ($thisVal == "")$thisVal="";
	  if($boolPFS)$thisVal=pfs($thisVal);
      return $thisVal;
   } 

   function ftype($field_name) 
   {
     if (isset($this->recorddata[$this->currentrow][$field_name])) 
	 {
         $thisVal = $this->recorddata[$this->currentrow][$field_name]->type;
     } 
	 else if ($this->eof) 
	 {
         die("<B>Error!</B>eof of recordset was reached");
     } 
	 else 
	 {
         die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
     }

	  if ($thisVal == "")$thisVal="";
      return $thisVal;
   } 

   function output_tablerows()
   {
		$strHTML = "";
		while (!$this->eof) 
		{
			$strHTML .= "<tr>";
			//--
			//-- for rach field in the record
			foreach ($this->recorddata[$this->currentrow] as $fieldName => $aField ) 
			{
				if($fieldName!="")
				{
					$fieldValue = $aField->value;
					if ($fieldValue == "")$fieldValue="";
					$strHTML .= "<td dbvalue='".$fieldValue."' dbname='".$fieldName."'>".$fieldValue;
					$strHTML .= "</td>";
				}
			}
			$strHTML .= "</tr>";
			$this->movenext();
		}
		return $strHTML;
   }
}


//-- create in memory record set
class xmlmcRecordset 
{
   var $recordcount=0;
   var $currentrow;
   var $currRow=null;
   var $eof;
   var $colcount=0;

   var $recorddata;
   var $query;

   function xmlmcConnection()
   {
     $this->recordcount = 0;
     $this->recorddata = 0;
	 $this->colcount=0;
   }

   function SetData( $newdata, $num_records, $query) 
   {
     $this->recorddata = $newdata;
     $this->recordcount = $num_records;

     $this->query = $query;
     $this->currentrow = 0;
     $this->set_eof();

	 if(!$this->eof) $this->colcount = sizeof($this->recorddata[$this->currentrow]);
   }

	//-- take data from other record set and merge with this one (assumes same query)
   function mergedata($mergeRS)
   {
		//-- now merge data
		while(!$mergeRS->eof)
		{
			$this->recorddata[$this->recordcount++] = $mergeRS->recorddata[$mergeRS->currentrow];
			$mergeRS->movenext();
		}
		$this->movefirst();
   }

   function set_eof() 
   {
     $this->eof = $this->currentrow >= $this->recordcount;
   }

   function movenext()  { if ($this->currentrow < $this->recordcount) { $this->currentrow++; $this->set_eof(); } }
   function moveprev()  { if ($this->currentrow > 0)                  { $this->currentrow--; $this->set_eof(); } }
   function movefirst() { $this->currentrow = 0; $this->set_eof();                                              }
   function movelast()  { $this->currentrow = $this->recordcount - 1;  set_eof();                        }

   function row()
   {
		return $this->recorddata[$this->currentrow];
   }

	//-- return if feild value is null
	function is_field_null($field_name)
	{
		if (isset($this->recorddata[$this->currentrow][$field_name])) 
		{
			$thisVal = $this->recorddata[$this->currentrow][$field_name]->value;
		} 
		else if ($this->eof) 
		{
			die("<B>Error!</B>1eof of recordset was reached");
		} 
		else 
		{
			die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
		}

		if ($thisVal === NULL)return true;
		return false;
	}


	//-- function that returns field value using htmlentities - used for xss
	function xf($field_name,$boolFormatted=false)
	{
		if (isset($this->recorddata[$this->currentrow][$field_name])) 
		{
			//-- 2.4 LANG added decode, and parameters for htmlentities
			if(!$boolFormatted)
				$thisVal = htmlentities(lang_decode_to_utf($this->recorddata[$this->currentrow][$field_name]->value),ENT_QUOTES,"UTF-8");
			else
				$thisVal = htmlentities(lang_decode_to_utf($this->recorddata[$this->currentrow][$field_name]->formattedvalue),ENT_QUOTES,"UTF-8");
		} 
		else if ($this->eof) 
		{
			die("<B>Error!</B> eof of recordset was reached");
		} 
		else 
		{
			die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
		}

		if ($thisVal == "")$thisVal="";
		return $thisVal;
	} 


	function f($field_name,$boolPFS = false, $boolFormatted=false) 
	{
		if (isset($this->recorddata[$this->currentrow][$field_name])) 
		{
			//2.4 LANG
			if(!$boolFormatted)
				$thisVal = lang_decode_to_utf($this->recorddata[$this->currentrow][$field_name]->value);
			else
				$thisVal = lang_decode_to_utf($this->recorddata[$this->currentrow][$field_name]->formattedvalue);
		} 
		else if ($this->eof) 
		{
			die("<B>Error!</B>eof of recordset was reached");
		} 
		else 
		{
			die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
		}

		if ($thisVal == "")$thisVal="";
		if($boolPFS)$thisVal=pfs($thisVal);
		return $thisVal;
	} 

	function ftype($field_name) 
	{
		if (isset($this->recorddata[$this->currentrow][$field_name])) 
		{
			$thisVal = $this->recorddata[$this->currentrow][$field_name]->type;
		} 
		else if ($this->eof) 
		{
			die("<B>Error!</B>eof of recordset was reached");
		} 
		else 
		{
			die("<B>Error!</B> Field <B>" . $field_name . "</B> was not found in the current recordset from query:<br><br>$this->query");
		}

		if ($thisVal == "")$thisVal="";
		return $thisVal;
	} 

   function output_tablerows()
   {
		$strHTML = "";
		while (!$this->eof) 
		{
			$strHTML .= "<tr>";
			//--
			//-- for rach field in the record
			foreach ($this->recorddata[$this->currentrow] as $fieldName => $aField ) 
			{
				if($fieldName!="")
				{
					$fieldValue = $aField->value;
					if ($fieldValue == "")$fieldValue="";
					$strHTML .= "<td dbvalue='".$fieldValue."' dbname='".$fieldName."'>".$fieldValue;
					$strHTML .= "</td>";
				}
			}
			$strHTML .= "</tr>";
			$this->movenext();
		}
		return $strHTML;
   }
}
//-- create dummy recset object that does nothing
class odbcRecordsetDummy
{
   var $recordcount=0;
   var $currentrow=0;
   var $eof=true;

   var $recorddata;
   var $query;

   function odbcConnection()
   {
     $this->recordcount = 0;
     $this->recorddata = 0;
   }

   function mergedata($mergeRS)
   {
   }


   function SetData($newdata, $num_records, $query) 
   {
   }

   function set_eof() 
   {
     $this->eof = $this->currentrow >= $this->recordcount;
   }

   function movenext()  { if ($this->currentrow < $this->recordcount) { $this->currentrow++; $this->set_eof(); } }
   function moveprev()  { if ($this->currentrow > 0)                  { $this->currentrow--; $this->set_eof(); } }
   function movefirst() { $this->currentrow = 0; $this->set_eof();                                              }
   function movelast()  { $this->currentrow = $this->recordcount - 1;  set_eof();                        }

   function f($field_name) 
   {
	   return "";
   } 

   function xf($field_name) 
   {
	   return "";
   } 

   function __get($field_name) 
	  {
     return $this->f($field_name);
   } 


   function output_tablerows()
   {
		$strHTML = "";
		return $strHTML;
   }
}


//-- HELPERS
//-- prepare for sql
function pfs($var)
{
	$var = str_replace("'","''",$var);
	return $var;
}

//--
//-- use xmlmc to upate or insert a record - will trigger any vpme related table scripts
function _pfx($strValue)
{
    $xmlchars = array("&", "<", ">",'"',"'");
    $escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
    return str_replace($xmlchars, $escapechars, $strValue);
}

function _xmlmc_updaterecord($strTable, $arrValues,$sessid,$server = "localhost")
{
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("table",$strTable);
	foreach($arrValues as $column => $value)
	{
		$xmlmc->SetValue($column, $value);
	}
	$xmlmc->invoke("data","updateRecord");
	$strRes = $xmlmc->xmlDom->get_attribute("status");

	if(strToLower($strRes)=="ok")
		return true;
	return false;
}

function _xmlmc_insertrecord($strTable, $arrValues,$sessid,$server = "localhost")
{
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("table",$strTable);
	foreach($arrValues as $column => $value)
	{
		$xmlmc->SetValue($column, $value);
	}
	$xmlmc->invoke("data","addRecord");
	$strRes = $xmlmc->xmlDom->get_attribute("status");

	if(strToLower($strRes)=="ok")
		return true;
	return false;
}

//-- invoke an xmlmc 
function _xmlmc_invoke($xml,$sessid,$server = "localhost")
{
	if(isSet($_SESSION['server_name']) && $server=="localhost")$server=$_SESSION['server_name'];
	
	if(strToLower($server)=="localhost")$server="127.0.0.1";
	
	if($strService=="mail" || $strService=="addressBook")
	{
		$port = 5014;
	}
	else if($strService=="calendar")
	{
		$port = 5013;
	}
	else
	{
		$port = 5015;
	}

	$xmlmc = new XmlMethodCall();
	$res = $xmlmc->_submit($server, $port, $xml);
	if($res)
	{
		//-- check xml is valid and checl status att of methodCallResult
		$xmlDom = domxml_open_mem(utf8_encode($this->content));
		if($xmlDom)
		{
			return $xmlDom->document_element();
		}
	}
	return "false";
}

function _iso_to_epoch($strIso)
{
	return strtotime($strIso);
}

//-- column class
class _swm_Column
{
	var $value = "";
	var $_formattedvalue = "";
	var $_complexfunctions = Array();
	function _swm_Column($strRawValue,$strFormattedValue = "")
	{
		$this->value = $strRawValue;
		$this->_formattedvalue = $strFormattedValue;
	}

	//--
	//-- functions to return different type of formatting of values
	//-- called in outputprocessor as [:rs.colname.functionaname] i.e. [:row.status.formattedvalue]
	
	function formattedvalue()
	{
		if($this->_formattedvalue=="")return $this->value;
		return $this->_formattedvalue;
	}

	//-- return html ready value
	function htmlvalue()
	{
		return nl2br(_html_encode($this->value));
	}
	//- -return the formatted value as html ready
	function htmlformattedvalue()
	{
		//-- no formatted value so try raw
		if($this->_formattedvalue=="")return  $this->htmlvalue();
		return nl2br(_html_encode($this->formattedvalue()));
	}
	//-- return N/A is value is blank
	function navalue()
	{
		if($this->value=="")return "N/A";
		return $this->value;
	}
	//-- return N/A if formatted value and value is blank
	function naformattedvalue()
	{
		if($this->_formattedvalue=="")return  $this->navalue();
		return $this->formattedvalue();
	}

	//-- return N/A is htmlvalue is blank
	function nahtmlvalue()
	{
		if($this->value=="")return "N/A";
		return $this->htmlvalue();
	}

	//-- return N/A if html formatted value and html value is blank
	function nahtmlformattedvalue()
	{
		if($this->_formattedvalue=="")return  $this->nahtmlvalue();
		return $this->htmlformattedvalue();
	}

	//-- return epoch formatted according to aid settings for datetime
	function datetime()
	{
		return _get_analyst_formatted_datetime($this->value);
	}

	//-- return epoch value formatted according to aid settings for date
	function date()
	{
		return _get_analyst_formatted_date($this->value);
	}

	//-- return epoch converted date if already set by api otherwise convert ourselves
	function epochformatted()
	{
		$val = $this->formattedvalue();
		if(is_numeric($val)) return "";
		return $val;
	}
	
	//-- return epoch converted date or N/A not formatted 0
	function epochnaformatted()
	{
		$val = $this->formattedvalue();
		if(is_numeric($val)) 
		{
			return "N/A";
		}
		return $val;
	}

	//-- return raw value with any Z/-UTC dates in it formatted
	function valuedates()
	{
		return _get_text_formatted_date($this->value);
	}

	//-- return formatted value with any Z/-UTC dates in it formatted
	function formatteddates()
	{
		return _get_text_formatted_date($this->formattedvalue());
	}
	//-- return html formatted value with any Z/-UTC dates in it formatted
	//-- return raw value with any Z/-UTC dates in it formatted
	function htmlvaluedates()
	{
		return _get_text_formatted_date($this->htmlvalue());
	}

	//-- return formatted value with any Z/-UTC dates in it formatted
	function htmlformatteddates()
	{
		return _get_text_formatted_date($this->htmlformattedvalue());
	}

}

?>
