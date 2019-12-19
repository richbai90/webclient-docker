<?php

@include_once('session.php');

if (!function_exists("swsys_connectdb"))
{

	$array_conns;
	$array_conns_type;

	//--
	//-- connect to odbc dsn (see if have connection already to use
	function connectdb($strdb="swdata",$boolSys = false)
	{
		if($strdb=="syscache") $strdb="sw_systemdb";
		if($strdb=="swcache") $strdb="sw_systemdb";
		if($strdb=="Supportworks Data") $strdb="swdata";
		if($strdb=="Supportworks Cache") $strdb="sw_systemdb";
		
		return $strdb;
	}

	//-- create hsl swsql connection (for things like messagestore)
	function swsys_connectdb($strdb = "sw_systemdb", $server = "localhost")
	{
		return connectdb($strdb);
	}

	//-- close all active db conns
	function close_dbs()
	{
		$_sqlquery_results = Array();
	}


	//--
	//-- return array of field names with field value
	function validDBObjectName($string)
	{
		if (preg_match('/[\' $%&*()}{@#~?><>,|=+-]/', $string)) 
		{ 
			// one or more of the 'special characters' found in $string 
			return false;
		}
		return true;
	}

	function db_pfs($strValue,$dbtype = "")
	{
		return str_replace("'", "''",$strValue);	
	}

	function isSystemDB($strDB)
	{
		if($strDB=="sw_systemdb" || $strDB=="swcache" || $strDB=="syscache") return true;
		return false;
	}

	function mysql_get_count($strTable,$strWhere,$conn,$boolTempDB=false)
	{
		$strSQL = "select count(*) as counter from ".$strTable;
		if($strWhere!="")$strSQL .= " where " .$strWhere;

		$result_id = _execute_xmlmc_sqlquery($strSQL, $conn);
		$counter=0;
		if($row = hsl_xmlmc_rowo($result_id))
		{
			$counter=$row->counter;
		}
		return $counter;
	}

	function odbc_get_count($strTable,$strWhere,$conn)
	{
		$strSql = "select count(*) as counter from ".$strTable;
		if($strWhere!="")$strSql .= " where " .$strWhere;
		$result_id = _execute_xmlmc_sqlquery($strSql,$con);
		$counter=0;
		if($row = hsl_xmlmc_rowo($result_id))
		{
			$counter=$row->counter;
		}
		return $counter;
	}

	function _xmlmc_query_record($strSQL,$conn,$boolTempDB=false)
	{
		$result_id = _execute_xmlmc_sqlquery($strSQL, $conn);
		$oRow = hsl_xmlmc_rowo($result_id);
		return $oRow;
	}

	//-- return query result as xml
	function db_record_as_xml(&$aRow,$recordName,$strKeyCol,$dbTable,$intPFS = 0,$boolIncludeDisplayValue = false)
	{
		if(!$aRow)return"";
		$strDataOut = "";
		$strXMLRow = "";
		$counter = 1;
		foreach($aRow  as $fieldName => $fieldValue)
		{
			//-- column seperator
			//$strLabel = swlbl($dbTable."."$fieldName);
			if($boolIncludeDisplayValue)
			{
				$varUseDisplay = "";
				$strBinding = $dbTable.".".$fieldName;
				$varDisplay = datatable_conversion($fieldValue,$strBinding);
				if($varDisplay!=$fieldValue)$varUseDisplay = "<display><![CDATA[".$varDisplay."]]></display>"; //-- only include display if it is different

				$strXMLRow .= "<".$fieldName."><value><![CDATA[" . $fieldValue . "]]></value>".$varUseDisplay."</".$fieldName.">";
			}
			else
			{
				if(strpos($fieldName,"count(")!==false)
				{
					$fieldName = "countvalue" . $counter;
					$counter++;
				}
				$strXMLRow .= "<".$fieldName."><![CDATA[" . $fieldValue . "]]></".$fieldName.">";
			}
		}
		//-- row seperator / new line
		$strDataOut .= "<".$recordName." dbtable='".$dbTable."' keycolumn='".$strKeyCol."' pfs='".$intPFS."' >" . $strXMLRow . "</".$recordName.">";
		return $strDataOut;
	}


	function db_record_as_xmlmc(&$aRow,$recordName,$strKeyCol,$dbTable,$intPFS = 0,$boolIncludeDisplayValue = false)
	{
		if(!$aRow)return"";
		$strDataOut = "";
		$strXMLRow = "";
		$counter = 1;
		foreach($aRow  as $fieldName => $fieldValue)
		{
			//-- column seperator
			//$strLabel = swlbl($dbTable."."$fieldName);
			if($boolIncludeDisplayValue)
			{
				$varUseDisplay = "";
				$strBinding = $dbTable.".".$fieldName;
				$varDisplay = datatable_conversion($fieldValue,$strBinding);
				$raw="";
				if($varDisplay!=$fieldValue)
				{
					$raw = " raw='"._pfx($fieldValue)."'"; //-- only include display if it is different
				}
				$strXMLRow .= "<".$fieldName."".$raw."><![CDATA[" . $varDisplay . "]]></".$fieldName.">";
			}
			else
			{
				if(strpos($fieldName,"count(")!==false)
				{
					$fieldName = "countvalue" . $counter;
					$counter++;
				}
				$strXMLRow .= "<".$fieldName."><![CDATA[" . $fieldValue . "]]></".$fieldName.">";
			}
		}
		//-- row seperator / new line
		$strDataOut .= "<".$recordName." dbtable='".$dbTable."' keycolumn='".$strKeyCol."' pfs='".$intPFS."' >" . $strXMLRow . "</".$recordName.">";
		return $strDataOut;
	}


	function recordset_conversion($strValue,$strBinding)
	{
		//return datatable_conversion($strValue, $strBinding);
		return swdti_formatvalue($strBinding, $strValue);
	}

	function add_db_rowlimit_to_sql($strSQL,$intRowLimit,$dbtype)
	{	

		if($dbtype=="swsql")
		{
			$strSQL .= " limit " . $intRowLimit;
			$strSQL = str_replace('!!mssqltop!!', "", $strSQL);
			$strSQL = str_replace('!!orarownum!!', "", $strSQL);
		}
		elseif($dbtype=="mssql")
		{
			$strSQL = str_replace('!!mssqltop!!', " top " . $intRowLimit, $strSQL);
			$strSQL = str_replace('!!orarownum!!', "", $strSQL);			
		}
		elseif($dbtype=="oracle")
		{
			$boolHaveWhereClause = (strpos(strtolower($strSQL)," where ")!==false)?true:false;
			$strAnd = ($boolHaveWhereClause)?" and ":" where ";
			$strSQL = str_replace('!!orarownum!!', $strAnd . " rownum <= " . $intRowLimit  , $strSQL);
			$strSQL = str_replace('!!mssqltop!!', "", $strSQL);

		}
		return $strSQL;
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
		$xml = "<?xml version='1.0' encoding='utf-8'?><methodCall service='data' method='updateRecord'><params><table>".$strTable."</table><returnModifiedData>true</returnModifiedData></params><data>";
		foreach ($arrValues as $fieldName => $fieldValue)
		{
			$xml .= "<".$fieldName.">"._pfx(utf8_encode($fieldValue))."</".$fieldName.">";
		}
		$xml .= "</data></methodCall>";
		$strXML = _xmlmc_invoke($xml,$sessid,$server);
		return $strXML;
	}

	function _xmlmc_insertrecord($strTable, $arrValues,$sessid,$server = "localhost")
	{
		$xml = "<?xml version='1.0' encoding='utf-8'?><methodCall service='data' method='addRecord'><params><table>".$strTable."</table><returnModifiedData>true</returnModifiedData></params><data>";
		foreach ($arrValues as $fieldName => $fieldValue)
		{
			$xml .= "<".$fieldName.">"._pfx(utf8_encode($fieldValue))."</".$fieldName.">";
		}
		$xml .= "</data></methodCall>";
		$strXML = _xmlmc_invoke($xml,$sessid,$server);
		return $strXML;
	}

	//-- invoke an xmlmc 
	function _xmlmc_invoke($xml,$sessid,$server = "localhost")
	{
		if(isset($_SESSION['server_name']) && $server=="localhost")$server=$_SESSION['server_name'];

		//-- use proper xmlmc and not 5005 xmlmc call
		$oResult = xmlmc($server, "5015", $_SESSION['swstate'], $xml);
		$_SESSION['swstate'] = $oResult->token;
		return utf8_for_xml($oResult->content);
	}


	function get_database_type()
	{
		return $_SESSION['databasedriver'];
	}

	//-- remove invalid chars	
	function utf8_for_xml($string)
	{
		return preg_replace ('/[^\x{0009}\x{000a}\x{000d}\x{0020}-\x{D7FF}\x{E000}-\x{FFFD}]+/u', ' ', $string);
	}

	//-- XMLMC SQLQUERY

	//-- nwj - 07.09.2010
	//-- use xmlmc to run sql query - store result in global array identified by resultid which we return
	//-- this means can process like normal php record pointer
	$_sqlquery_results = Array();
	$_sqlquery_results_id_counter = 0;
	$_sqlquery_lasterror = "";
	function _execute_xmlmc_sqlquery($strSQL, $strDatabase,$redunantTempDbFlag=false)
	{
		//-- log activity
		if(defined("_LOG_WC_SQL_ACTIVITY") && _LOG_WC_SQL_ACTIVITY)
		{
			//-- output to webclient log file
			_wc_debug("_execute_xmlmc_sqlquery",$strDatabase,"DATAB","CONN ");
			_wc_debug("_execute_xmlmc_sqlquery",$strSQL,"DATAB","QUERY");
		}

		//global $oAnalyst;
		global $_sqlquery_results_id_counter;
		global $_sqlquery_results;
		global $_sqlquery_lasterror;

		$_sqlquery_lasterror = "";
		$_intNextResultID = $_sqlquery_results_id_counter+1;
		$_sqlquery_results_id_counter = $_intNextResultID ;

		

		
		if(strToLower($strDatabase)=="syscache")$strDatabase="sw_systemdb";

		$xml = "<?xml version='1.0' encoding='utf-8'?><methodCall service='data' method='sqlQuery'><params><database>".$strDatabase."</database><query>"._pfx($strSQL)."</query><returnMeta>true</returnMeta></params></methodCall>";
		$strXML = _xmlmc_invoke($xml,$_SESSION['swsession']); //$oAnalyst->sessionid
		$xmlDoc = @domxml_open_mem($strXML,DOMXML_LOAD_PARSING,$err);
		if(!$xmlDoc) 
		{
			$_sqlquery_lasterror = "data:sqlQuery : domxml was unable to parse returned xml structure:= \n\n" . $strXML;
			if(defined("_LOG_WC_SQL_ACTIVITY") && _LOG_WC_SQL_ACTIVITY)
			{
				//-- output to webclient log file
				_wc_debug("_execute_xmlmc_sqlquery",$_sqlquery_lasterror,"ERROR","QUERY");
			}
			return false;
		}
	
		//-- check result
		$root = $xmlDoc->document_element();
		if(!$root) 
		{
			$_sqlquery_lasterror = "data:sqQuery : domxml xml structure is invalid";
			if(defined("_LOG_WC_SQL_ACTIVITY") && _LOG_WC_SQL_ACTIVITY)
			{
				//-- output to webclient log file
				_wc_debug("_execute_xmlmc_sqlquery",$_sqlquery_lasterror,"ERROR","QUERY");
			}

			return false;
		}

		//-- did sql fail
		if($root->get_attribute("status")!="ok")
		{
			//-- get error
			$arrError = $root->get_elements_by_tagname("error");
			$nodeError = $arrError[0];
			if($nodeError)
			{
				$_sqlquery_lasterror = "data:sqlQuery status returned as failed -> " . $nodeError->get_content();
			}
			if(defined("_LOG_WC_SQL_ACTIVITY") && _LOG_WC_SQL_ACTIVITY)
			{
				//-- output to webclient log file
				_wc_debug("_execute_xmlmc_sqlquery",$_sqlquery_lasterror,"ERROR","QUERY");
			}
			return false;
		}
		else
		{

			//-- do we want to log all responses?
			if(defined("_LOG_WC_XMLMC_RESPONSE") && _LOG_WC_XMLMC_RESPONSE)
			{
				_wc_debug("Xmlc Response : ","\n\n".$strXML."\n\n","XMLMC","RESPONSE");
			}

			//-- we got a result.
			$_sqlquery_results[$_intNextResultID] = Array();

			//-- get rows affected and row data returned
			$arrCols = Array();
			$arrRA = $root->get_elements_by_tagname("rowsEffected");
			if($arrRA[0])
			{
				$iRA = $arrRA[0]->get_content();	
				$arrRows = $root->get_elements_by_tagname("rowData");
				if(count($arrRows)>0)
				{
					$arrRows = $arrRows[0]->get_elements_by_tagname("row");
				}
			}
			else
			{
				$iRA = 'N/A';
				$arrRows = Array();
			}
			
			//-- get meta data info
			$colNodes = Array();			
			$arrCols = $root->get_elements_by_tagname("metaData");
			if(@$arrCols[0])	
			{
				//-- only interested in nodes;
				$nodes = $arrCols[0]->child_nodes();
				foreach($nodes as $pos => $aNode)
				{
					if($aNode->node_type()==1)
					{
						$colNodes[] = $aNode;
					}
				}
			}

			$_sqlquery_results[$_intNextResultID]['rowsaffected'] = $iRA;
			$_sqlquery_results[$_intNextResultID]['rows'] = $arrRows;
			$_sqlquery_results[$_intNextResultID]['currentrowpos'] = 0;
			$_sqlquery_results[$_intNextResultID]['cols'] = $colNodes;

			if(defined("_LOG_WC_SQL_ACTIVITY") && _LOG_WC_SQL_ACTIVITY)
			{
				//-- output to webclient log file
				_wc_debug("_execute_xmlmc_sqlquery","rows effected [".$iRA."]","DATAB","ROWSAFFECTED");
			}
		}
		
		return $_intNextResultID;
	}

	function hsl_xmlmc_rowcount($res)
	{
		global $_sqlquery_results;
		if(isset($_sqlquery_results[$res]))
		{
			return $_sqlquery_results[$res]['rowsaffected'];
		}
		return -1;
	}

	
	function hsl_odbc_connect($DatabaseName,$uid="",$pwd="")
	{
		return connectdb($DatabaseName);
	}
	
	function hsl_odbc_exec($con,$strSql)
	{
		return _execute_xmlmc_sqlquery($strSql,$con);
	}
	
	function hsl_odbc_fetch_row($con)
	{
		return hsl_xmlmc_rowo($con);
	}
	
	function hsl_odbc_num_fields($res)
	{
		global $_sqlquery_results;
		if(isset($_sqlquery_results[$res]))
		{
			return count($_sqlquery_results[$res]['cols']);
		}
		return 0;
	}
	
	function hsl_odbc_field_name($res,$colPos)
	{
		global $_sqlquery_results;
		if(isset($_sqlquery_results[$res]))
		{
			$xmlCols = $_sqlquery_results[$res]['cols'];
			//-- odbc col pos starts at 1 - but our array starts at 0 so
			$xmlField = $xmlCols[$colPos-1];
			if($xmlField)
			{
				if($xmlField->tagname!="")
				{
					return $xmlField->tagname;
				}			
			}
			
		}
		return "";
	}
	
	function hsl_odbc_result($res,$colPos)
	{
		global $_sqlquery_results;
		if(isset($_sqlquery_results[$res]))
		{
			$rowData = $_sqlquery_results[$res]['currentrowdata'];
			$xmlCols = $_sqlquery_results[$res]['cols'];
			$xmlField = $xmlCols[$colPos-1];
			if($rowData && $xmlField)
			{
				if($xmlField->tagname!="")
				{
					$fname = strToLower($xmlField->tagname);
					return @$rowData->{$fname};
				}			
			}
		}
		return "";
	}
	
	function hsl_odbc_free_result($res)
	{
		if(isset($_sqlquery_results[$res])) unset($_sqlquery_results[$res]);
	}
	
	//--
	//-- return array of field names with field value using xmlmc result id for current row pos
	function hsl_xmlmc_rowo($res)
	{
		global $_sqlquery_results_id_counter;
		global $_sqlquery_results;
		global $_sqlquery_lasterror;

		if(isset($_sqlquery_results[$res]))
		{
			$intTotalRows =$_sqlquery_results[$res]['rowsaffected'];
			$intCurrentPos =$_sqlquery_results[$res]['currentrowpos'];
			$_sqlquery_results[$res]['currentrowdata'] = null;
			$xmlRow = @$_sqlquery_results[$res]['rows'][$intCurrentPos];		
			if($xmlRow)
			{
				$xmlCols = $_sqlquery_results[$res]['cols'];
				$_sqlquery_results[$res]['currentrowpos'] = $intCurrentPos + 1;

			
				//-- loop fields and values
				$rs_obj = false;
				$bUsedCols = false;
				foreach($xmlCols as $pos => $xmlField)
				{
					$bUsedCols = true;
					if($xmlField->tagname!="")
					{
						$fkey = strToLower($xmlField->tagname);
						$arrField = $xmlRow->get_elements_by_tagname($xmlField->tagname);
						if(@$arrField[0])
						{
							@$rs_obj->$fkey = trim($arrField[0]->get_content());
						}
						else
						{
							//-- workaround for xmlmc mixed case (should be fixed in xmlmc)
							$arrField = $xmlRow->get_elements_by_tagname($fkey);
							if(@$arrField[0])
							{
								@$rs_obj->$fkey = trim($arrField[0]->get_content());
							}
							else
							{
								@$rs_obj->$fkey = "";
							}
						}
					}
				}
			
				//-- if we havent been able to use meta col data just process row data
				if(!$bUsedCols)
				{
					$arrChildCols = $xmlRow->child_nodes();
					foreach($arrChildCols as $pos => $xmlField)
					{
						if($xmlField->tagname!="")
						{
							$fkey = strToLower($xmlField->tagname);
							$rs_obj->$fkey = trim($xmlField->get_content());
						}
					}
				}
				
				$_sqlquery_results[$res]['currentrowdata'] = $rs_obj;
				return $rs_obj;
			}
			else
			{
				return false;
			}
		}
		else
		{
			return false;
		}
	}



	//--
	//-- return json object holding a row
	function db_record_as_json(&$aRow,$recordName,$strKeyCol,$dbTable,$intPFS = 0,$boolIncludeDisplayValue = false)
	{
		if(!$aRow)return"";

		$jsonDisplayFields = "";
		$jsonFields = "";
		$strXMLRow = "";
		$counter = 1;
		foreach($aRow  as $fieldName => $fieldValue)
		{
			$varDisplay = $fieldValue;
			if($boolIncludeDisplayValue)
			{
				$strBinding = $dbTable.".".$fieldName;
				$varDisplay = datatable_conversion($fieldValue,$strBinding);
			}
			
			if(strpos($fieldName,"count(")!==false)
			{
				$fieldName = "countvalue" . $counter;
				$counter++;
			}
			
			//-- escape newlines and \		
			$jsonField = '"'.$fieldName.'"' . ':"' .str_replace('"','\"',str_replace('\\','\\\\',$fieldValue)) . '"';
			$jsonDisplayField = '"'.$fieldName.'"' . ':"' .str_replace('"','\"',str_replace('\\','\\\\',$varDisplay)) . '"';


			if($jsonFields!="")$jsonFields.=",";
			$jsonFields .= $jsonField;

			if($jsonDisplayFields!="")$jsonDisplayFields.=",";
			$jsonDisplayFields .= $jsonDisplayField;

		}
		$jsonString = '"'.$recordName.'":{"dbtable":"'.$dbTable.'","keycolumn":"'.$strKeyCol.'","pfs":'.$intPFS.',"rawValues":{'.$jsonFields.'},"displayValues":{'.$jsonDisplayFields.'}}';
		return $jsonString;
	}

}
?>