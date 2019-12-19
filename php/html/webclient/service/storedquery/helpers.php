<?php

	if(!defined("RUNNING_INWC"))
	{
		echo "ERROR:File called out of context.";
		exit(0);
	}

	//-- class to mimic basic js sqlquery class - so can run query and loop result set 
	class SqlQuery
	{
		var $result = false;
		var $currentrow = -1;
		var $rowsAffected;
		var $row = array();
		var $xmlmc = null;
		function Query($strSQL,$strDB = "swdata")
		{
			$this->Reset();

			$this->xmlmc = new XmlMethodCall();
			$this->xmlmc->SetParam("database",$strDB);
			$this->xmlmc->SetParam("query",$strSQL);
			$this->xmlmc->SetParam("formatValues","false");
			$this->xmlmc->SetParam("returnRawValues","true");
			$this->result = $this->xmlmc->invoke("data","sqlQuery");	
			if($this->result)
			{
				$this->rowsAffected = gxc($this->xmlmc->xmldom,"rowsAffected");
			}

			return $this->result;
		}

		function Fetch()
		{
			if(!$this->result) return false;

			//-- move to next row
			$arrData = $this->xmlmc->xmldom->get_elements_by_tagname("rowData");
			if($arrData[0])
			{
				$rowData = $arrData[0]->get_elements_by_tagname("row");
				if($rowData[$this->currentrow+1])
				{
					$this->currentrow++;

					//-- have a row so store col values in row array
					$this->row = array();
					$childnodes = $rowData[$this->currentrow]->child_nodes();
					foreach ($childnodes as $aColumn)
					{
						if($aColumn->tagname!="")
						{
							//-- get any nodes so long as they have a tagname
							$this->row[strToLower($aColumn->tagname)] = $aColumn->get_content();
						}
					}
					return true;
				}
			}
			return false;
		} //-- eof function FETCH

		function Reset()
		{
			$this->row = array();
			$this->rowsAffected=-1;
			$this->currentrow = -1;
			$this->xmlmc=null;
			$this->result=false;
		}
	}

	//-- wrapper for php time
	function GetCurrentEpocTime()
	{
		return time();
	}

	function getTablePrimaryKeyName($inTableName,$database = "swdata")
	{
		global $session;
		global $_core;
		
		$dbInfo = null;
		$storedKey = "dbinfo_".$database;
		//-- see if we already have table info
		if(isset($_core[$storedKey]))
		{
			$dbInfo=$_core[$storedKey];
		}
		else
		{
			//-- get table info
			$xmlmc = new XmlMethodCall();
			$xmlmc->SetParam("database",$database);
			if($xmlmc->invoke("data","getTableInfoList"))
			{
				//-- store
				$_core[$storedKey] = $xmlmc->xmldom;
				$dbInfo=$_core[$storedKey];
			}
			else
			{
				echo generateCustomErrorString("-666","Failed to get table primary key column name. Please contact your Administrator.");
				exit(0);
			}
		}

		//-- find table in xmldom
		$arrTables = $dbInfo->get_elements_by_tagname("tableInfo");
		while (list($pos,$tableNode) = each($arrTables))
		{
			$tableName = gxc($tableNode,"name");
			if(strToLower($tableName)==strToLower($inTableName))
			{
				return gxc($tableNode,"primaryKey");
			}
		}

		//-- if we get here table does not have a pk
		return "";
	}


	function createTableFilterFromParams($tableName, $sPrefix = "_swc_")
	{
		global $session;

		$boolAND		= ($_POST["_and"]=="true");
		$boolUseAppCode = ($_POST["_ac"]=="true");

		$parsedFilter = "";
		while (list($colName,$colValue) = each($_POST))
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				//-- remove prefix
				$colName = str_replace($sPrefix,"",$colName);

				//-- check if $colName exists in schema
				$schemaColName =$tableName.".".$colName;
				if(swdti_getcoldispname($schemaColName)!=$schemaColName)
				{
					//-- prepare and encaps
					$colValue = PrepareForSql($colValue);
					if(!isColNumeric($tableName, $colName))$colValue = "'".$colValue."%'";

					//-- if oracle use upper setting
					if($session->oracleInUse)
					{
						$colName = " UPPER(" . $colName + ") ";
						$colValue = " UPPER(" . $colValue . ") ";
					}

					if ($parsedFilter != "") $parsedFilter .= ($boolAND)?" AND ": " OR ";
					if(isColNumeric($tableName, $colName))
					{
						$parsedFilter .= "(" . $colName . " = " . $colValue . " OR ". $colName . " is null)";
					}
					else
					{
						$parsedFilter .= $colName . " like " . $colValue;
					}
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		if($boolUseAppCode)
		{
				$colName = "appcode";
				$colValue = "'" . PrepareForSql($session->currentDataDictionary) . "'";

				//-- oracle mods
				if($session->oracleInUse)
				{
					$colName = " UPPER(" . $colName + ") ";
					$colValue = " UPPER(" . $colValue . ") ";

				}

				if($parsedFilter =="")
				{
					$parsedFilter  = $colName . " = ". $colValue;
				}
				else
				{
					$parsedFilter = "(".$colName . " = ". $colValue.") AND (" . $parsedFilter . ")";
				}
		}

		return $parsedFilter;
	}

	function isColNumeric($strTable, $strColumn)
	{
	    $intType = swdti_getdatatype($strTable.".".$strColumn);
		$bNumeric = ($intType==8||$intType==-1)?false:true;
		return $bNumeric;
	}


	function swfc_source()
	{
		$dsn = @$_POST["dsn"];
		if($dsn=="")$dsn="swdata";
		if($dsn=="syscache")$dsn="sw_systemdb";
		if($dsn=="sw_systemdb" || $dsn=="swdata")
		{
			return $dsn;
		}
		else
		{
			echo generateCustomErrorString("-401","Invalid dsn source specified. Please contact your Administrator.");
			exit(0);
		}
	}


	function swfc_tablename()
	{
		$table = $_POST['table'];
		if(_validate_url_param($table,"sqlobjectname"))
		{
			return prepareForSql($table);
		}
		else
		{
			echo generateCustomErrorString("-402","Invalid form control table name specified. Please contact your Administrator.");
			exit(0);
		}

	}

	function swfc_fromtable()
	{
		$table = $_POST['table'];
		if(_validate_url_param($table,"sqlobjectname"))
		{
			return " from " . prepareForSql($table) . " ";
		}
		else
		{
			echo generateCustomErrorString("-402","Invalid form control table name specified. Please contact your Administrator.");
			exit(0);
		}
	}
	function swfc_selectcolumns()
	{
		global $swfc_picklist;
		$columns = $_POST['columns'];
		if(_validate_url_param($columns,"sqlselectcolumns"))
		{
			if($swfc_picklist==1)
			{
				return "select distinct " . prepareForSql($columns) . " ";
			}
			else
			{
				return "select " . prepareForSql($columns) . " ";
			}
		}
		else
		{
			echo generateCustomErrorString("-403","Invalid form control columns specified. Please contact your Administrator.");
			exit(0);
		}
	}
	function swfc_orderby()
	{
		$orderby = "";
		if(($_POST['orderby'])!="")
		{
			$orderby = " order by " . $_POST['orderby'];
			if($_POST['orderdir']!="")
			{
				$orderby .= " " . $_POST['orderdir'];
			}
			return $orderby;
		}
		return "";
	}
	function prepareForXml($strValue)
	{
		$xmlchars = array("&", "<", ">",'"',"'");
		$escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
		return utf8_encode(str_replace($xmlchars, $escapechars, $strValue));
	}
	function prepareForSql($var)
	{
		$var = str_replace("'","''",$var);
		return $var;
	}
	function gxc($dom,$tag)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if(count($a) && $a[0])return $a[0]->get_content();
		return "";
	}
	function gxa($dom,$tag,$attName)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if($a[0])return $a[0]->get_attribute($attName);
		return "";
	}


	function _validate_url_param($varValue, $validationType)
	{
		if($varValue=="")return true;

		$aValidSpecialChars = array('-', '_','.',' ',','); 
		switch($validationType)
		{
			case "":
				return true;
			case "boolean":
			case "bool":
				return (strtolower($varValue)=="true" || strtolower($varValue)=="false" || $varValue=="0" || $varValue=="1");
			case "numeric":
			case "num":
				return is_numeric($varValue);
			case "alpha":
				return ctype_alpha(str_replace($aValidSpecialChars, '', $varValue));
			case "alphanum":
			case "alphanumeric":
				return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
			case "nodirtraverse":
				return (strpos($varValue,"..")===false);
			case "sessionanalyst":
				return (strtolower($varValue)==strtolower($_SESSION["sw_analystid"]));
			case "sqlparamstrict": //-- do not allow ; -- # /* or ''
				return (strpos($varValue,"''")===false && strpos($varValue,";")===false && strpos($varValue,"--")===false && strpos($varValue,"/*")===false && strpos($varValue,"#")===false);
			case "sqlobjectname": //-- text num and _ allowed
				$aValidSpecialChars = array('_');
				return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
			case "sqlselectcolumns": //-- text num and _ ,allowed
				$aValidSpecialChars = array('_',',',' ');
				return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));

			case "filetypexml": 
				return (get_file_extension($varValue)=="xml");
			case "filetypejson": 
				return (get_file_extension($varValue)=="json");
			case "xmltag": 
				return ctype_alnum(str_replace('_' , '', $varValue));
		}
		return false;
	}
	function generatesessionobject($xmldom)
	{
		$c =  new StdClass();
		$c->xmldom = $xmldom;

		$c->sessionId = gxc($xmldom,"sessionId");
		$c->connectionId = gxc($xmldom,"connectionId");
		$c->sessionType = gxc($xmldom,"sessionType");
		$c->sessionState = gxc($xmldom,"sessionState");
		$c->lastActivity = gxc($xmldom,"lastActivity");
		$c->connectedSince = gxc($xmldom,"connectedSince");
		$c->analystName = gxc($xmldom,"analystName");
		$c->analystId = gxc($xmldom,"analystId");
		$c->contextAnalystId = gxc($xmldom,"contextAnalystId");
		$c->contextGroupId = gxc($xmldom,"contextGroupId");
		$c->group = gxc($xmldom,"group");
		$c->notifyPort = gxc($xmldom,"notifyPort");
		$c->maxUdpSize = gxc($xmldom,"maxUdpSize");
		$c->currentDataDictionary = gxc($xmldom,"currentDataDictionary");
		$c->dateTimeFormat = gxc($xmldom,"dateTimeFormat");
		$c->dateFormat = gxc($xmldom,"dateFormat");
		$c->timeFormat = gxc($xmldom,"timeFormat");
		$c->currencySymbol = gxc($xmldom,"currencySymbol");
		$c->timeZone = gxc($xmldom,"timeZone");
		$c->timeZoneOffset = gxc($xmldom,"timeZoneOffset");
		$c->privLevel = gxc($xmldom,"privLevel");
		$c->oracleInUse = gxc($xmldom,"oracleInUse");
		$c->npaProtocol = gxc($xmldom,"npaProtocol");
		$c->sla = gxc($xmldom,"sla");
		$c->slb = gxc($xmldom,"slb");
		$c->slc = gxc($xmldom,"slc");
		$c->sld = gxc($xmldom,"sld");
		$c->sle = gxc($xmldom,"sle");
		$c->slf = gxc($xmldom,"slf");
		$c->slg = gxc($xmldom,"slg");
		$c->slh = gxc($xmldom,"slh");
		$c->msSqlInUse = gxc($xmldom,"msSqlInUse");
		$c->validateOutput = gxc($xmldom,"validateOutput");

		//-- analyst properties
		$analystDom = $xmldom->get_elements_by_tagname("analystInfo");
		$analystDom = $analystDom[0];
		$c->analyst =  new StdClass();

		$c->analyst->AnalystID = gxc($analystDom,"AnalystID");
		$c->analyst->Name = gxc($analystDom,"Name");
		$c->analyst->Class = gxc($analystDom,"Class");
		$c->analyst->Role = $c->analyst->Class;
		$c->analyst->SupportGroup = gxc($analystDom,"SupportGroup");
		$c->analyst->privilegeLevel = gxc($analystDom,"privilegeLevel");
		$c->analyst->RightsA = gxc($analystDom,"RightsA");
		$c->analyst->RightsB = gxc($analystDom,"RightsB");
		$c->analyst->RightsC = gxc($analystDom,"RightsC");
		$c->analyst->RightsD = gxc($analystDom,"RightsD");
		$c->analyst->RightsE = gxc($analystDom,"RightsE");
		$c->analyst->RightsF = gxc($analystDom,"RightsF");
		$c->analyst->RightsG = gxc($analystDom,"RightsG");
		$c->analyst->RightsH = gxc($analystDom,"RightsH");
		$c->analyst->UserDefaults = gxc($analystDom,"UserDefaults");
		$c->analyst->MaxBackdatePeriod = gxc($analystDom,"MaxBackdatePeriod");
		$c->analyst->TimeZone = gxc($analystDom,"TimeZone");
		$c->analyst->DataDictionary = gxc($analystDom,"DataDictionary");
		$c->analyst->AvailableStatus = gxc($analystDom,"AvailableStatus");
		$c->analyst->AvailableStatusMessage = gxc($analystDom,"AvailableStatusMessage");
		$c->analyst->Country = gxc($analystDom,"Country");
		$c->analyst->Language = gxc($analystDom,"Language");
		$c->analyst->DateTimeFormat = gxc($analystDom,"DateTimeFormat");
		$c->analyst->DateFormat = gxc($analystDom,"DateFormat");
		$c->analyst->TimeFormat = gxc($analystDom,"TimeFormat");
		$c->analyst->CurrencySymbol = gxc($analystDom,"CurrencySymbol");
		$c->analyst->MaxAssignedCalls = gxc($analystDom,"MaxAssignedCalls");
		$c->analyst->LastLogOnTime = gxc($analystDom,"LastLogOnTime");
		$c->analyst->CloseLevel = gxc($analystDom,"CloseLevel");
		$c->analyst->LogLevel = gxc($analystDom,"LogLevel");

		//-- apprights
		$c->apprights = $xmldom->get_elements_by_tagname("appRight");

		return $c;
	}

	function HaveRight($strGroup,$intRight)
	{
		global $session;
		$$rightGroup = "Rights".$strGroup;
		$session->analyst->$$rightGroup--;$session->analyst->$$rightGroup++;

		return ($session->analyst->$$rightGroup & $intRight) ? 1 : 0;
	}

	function HaveAppRight($strGroup,$intRight,$strApp = "")
	{
		global $session;
		if($strApp=="")$strApp=$session->currentDataDictionary;
		$rightGroup = "right".strToUpper($strGroup);
		foreach ($session->apprights as $index => $xmlNode)
		{
			//-- if we have app rights we want to work with
			if(gxc($xmlNode,"appName")==$strApp)
			{
				$intRightSetting = gxc($xmlNode,$rightGroup);

				eval("\$intRight = bit".$intRight.";");
				$intRight++;$intRight--;
				
				

				$intRightSetting++;$intRightSetting--;
				return ($intRight & $intRightSetting)?1:0;
			}
		}
		return 0;
	}

	function IsDefaultOption($intOption)
	{
		global $session;
		$session->analyst->UserDefaults--;
		$session->analyst->UserDefaults++;

		return ($session->analyst->UserDefaults & $intOption) ? 1 : 0;
	}

	function IncludePhpFile($filePath)
	{
		global $includepath;
		if(!file_exists($includepath.$filePath))
		{
			echo generateCustomErrorString("-601","The specified include file [". $filePath ."] could not be found. Please contact your Administrator");
			exit(0);
		}

		include($includepath.$filePath);
	}

	//-- xmlmc api functions
	//--
	function _fwrite_stream($fp, $string)
	{
		for($written = 0; $written < strlen($string); $written += $fwrite)
		{
			$fwrite = fwrite($fp, substr($string, $written));
			if(!$fwrite)
			{
				return $fwrite;
			}
		}
		return $written;
	}

	function _xmlmc($xmlmc,$port, $host,$boolAsJson=false)
	{
		global $_core;
		$errNo  = NULL;
		$errStr = NULL;
		if(($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE)
		{
			return FALSE;
		}    

		$acceptType = ($boolAsJson)?"text/json":"text/xmlmc";
		$request = array(
					'POST /xmlmc HTTP/1.1',
					'Host: '.$host,
					'User-Agent: Hornbill PHP',
					'Connection: close',
					'Cache-Control: no-cache',
					'Accept: '.$acceptType,
					'Accept-Charset: utf-8',
					'Accept-Language: en-GB',
					'Cookie: ESPSessionState='.$_core['_nexttoken'],
					'Content-Type: text/xmlmc; charset=utf-8',
					'Content-Length: '.strlen($xmlmc),
				   );

		$request = implode("\r\n", $request)
				 . "\r\n\r\n"
				 . $xmlmc;
				 
		_fwrite_stream($fp, $request);
		$resCode   = NULL;
		$headers   = NULL;
		$content   = NULL;
		$newToken  = $espToken;
		$inContent = FALSE;
		while(!feof($fp))
		{
			if($inContent)
			{
				$content .= fread($fp, 8192);
			}
			else
			{
				$headers .= fread($fp, 8192);
				if($resCode === NULL && strlen($headers) >= 13)
				{
					if(!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13)))
					{
						fclose($fp);
						// Invalid http response
						return FALSE;
					}
					$resCode = (integer) substr($headers, 9, 3);
				}
				if(($eoh = strpos($headers, "\r\n\r\n")) !== FALSE)
				{
					$content = (string) substr($headers, $eoh + 4);
					$headers = substr($headers, 0, $eoh);
					if(preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts))
					{
						$newToken = $parts[1];
					}
					$headers   = explode("\r\n", $headers);
					$inContent = TRUE;
					array_shift($headers);
				}
			}
		}
		fclose($fp);

		if($newToken!="")$_core['_nexttoken'] = $newToken;
		
		$o = new StdClass();
		$o->status  = $resCode;
		$o->headers = $headers;
		$o->content = utf8_encode($content);
		$o->xmldom = null;
		$o->asjson = $boolAsJson;
		if(!$boolAsJson)$o->xmldom = domxml_open_mem(utf8_encode($content));
		return $o;
	}  

	//--
	//-- xmlmc processor - have to use swphp.dll as xmlmc api does not have a method to use existing session
	if (!function_exists('generateCustomErrorString')) 
	{
		function generateCustomErrorString($code,$msg)
		{
			if($_POST['asjson'])
			{
				$xmls = '{"@status":"fail","state":{"code":"'.$code.'","error":"'.$msg.'"}}';
			}
			else
			{
				$xmls = "<?xml version='1.0' encoding='utf-8'?>";
				$xmls .= '<methodCallResult status="fail">';
				$xmls .= '<state>';
				$xmls .= '<code>'.$code .'</code>';
				$xmls .= '<error>'.prepareForXml($msg).'</error>';
				$xmls .= '</state>';
				$xmls .= '</methodCallResult>';
			}
			return $xmls;
		}

		function generateSuccessString($rowsAffected=0)
		{
			if($_POST['asjson'])
			{
				$xmls = '{"@status":"true","params":{"rowsEffected":"'.$rowsAffected.'"},"data":{}}';
			}
			else
			{
				$xmls = "<?xml version='1.0' encoding='utf-8'?>";
				$xmls .= '<methodCallResult status="ok">';
				$xmls .= '<params>';
				$xmls .= '<rowsEffected>'.$rowsAffected.'</rowsEffected>';
				$xmls .= '</params>';
				$xmls .= '<data>';
				$xmls .= '<rowData>';
				$xmls .= '</rowData>';
				$xmls .= '</data>';
				$xmls .= '</methodCallResult>';
			}
			return $xmls;
		}

		
		class XmlMethodCall
		{
			var $swserver = "";
			var $params = Array();
			var $data = Array();
			var $xmlresult = "";
			var $xmldom = null;

			function XmlMethodCall($server="localhost")
			{
				$this->swserver = $server;
			}

			function reset()
			{
				$this->params = Array();
			}

			function SetComplexValue($parentParamName, $paramName,$paramValue)
			{
				if(!isset($this->params[$parentParamName]))$this->params[$parentParamName] = Array();
				$this->params[$parentParamName][$paramName] = $paramValue;
			}
			function SetParam($paramName,$paramValue)
			{
				$this->params[$paramName] = $paramValue;
			}
			function SetDataComplexValue($parentParamName, $paramName,$paramValue)
			{
				if(!isset($this->data[$parentParamName]))$this->data[$parentParamName] = Array();
				$this->data[$parentParamName][$paramName] = $paramValue;
			}
			function SetData($paramName,$paramValue)
			{
				$this->data[$paramName] = $paramValue;
			}

			//-- return xml string
			function generatexmlcall($service,$method)
			{
				$xml = '<?xml version="1.0" encoding="UTF-8"?>';
				$xml .= "<methodCall service='".$service."' method='".$method."'>";
				//-- params
				$bParams = false;
				foreach ($this->params as $paramName => $paramValue)
				{
					if($bParams==false)
					{
						$xml .= "<params>";
						$bParams=true;
					}
					$xml .= "<".$paramName.">".prepareForXml(utf8_encode($paramValue))."</".$paramName.">";
				}
				if($bParams)$xml .= "</params>";

				$bData = false;
				foreach ($this->data as $paramName => $paramValue)
				{
					if($bData==false)
					{
						$xml .= "<data>";
						$bData=true;
					}
					$xml .= "<".$paramName.">".prepareForXml(utf8_encode($paramValue))."</".$paramName.">";
				}
				if($bData)$xml .= "</data>";

				$xml .= "</methodCall>";
				return $xml;
			}

			function invoke($service,$method,$bAsJson=false)
			{
				$port=5015;
				if($service=="mail"||$service=="addressbook")$port=5014;
				else if($service=="calendar")$port=5013;

				$result   = _xmlmc($this->generatexmlcall($service,$method), $port, $this->swserver,$bAsJson);
				return $this->_processresultstring($result);
			}

			function _processresultstring($xmlmcResult)
			{
				if($xmlmcResult==false)
				{
					$this->xmlresult=generateCustomErrorString("-300","Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.");
					return false;
				}

				if($xmlmcResult->status!=200)
				{
					//-- some http error has occured
					$this->xmlresult=generateCustomErrorString($xmlmcResult->status,"An http error has occurred. Please contact your Administrator.");
					return false;
				}
				else
				{
					//-- get result - convert string to xmldom
					$this->xmlresult = $xmlmcResult->content;
					if($xmlmcResult->xmldom!=null)
					{
						$this->xmldom = $xmlmcResult->xmldom->document_element();
						$status = $this->xmldom->get_attribute('status'); 
						return ($status=="fail")?false:true;
					}
					return true;
				}
			}
		}
	}

//-- static definitions

//-- analyst right groups
define('ANALYST_RIGHT_A_GROUP', "A");
define('ANALYST_RIGHT_B_GROUP', "B");
define('ANALYST_RIGHT_C_GROUP', "C");
define('ANALYST_RIGHT_D_GROUP', "D");
define('ANALYST_RIGHT_E_GROUP', "E");
define('ANALYST_RIGHT_F_GROUP', "F");

//-- analyst groups speciic rights
define('ANALYST_RIGHT_A_CANASSIGNCALLS', 1 );
define('ANALYST_RIGHT_A_CANCLOSECALLS', 2 );
define('ANALYST_RIGHT_A_CANLOGCALLS', 4 );
define('ANALYST_RIGHT_A_CANUPDATECALLS', 8); 
define('ANALYST_RIGHT_A_CANMODIFYCALLS', 16 );
define('ANALYST_RIGHT_A_CANSWITCHREP', 32 );
define('ANALYST_RIGHT_A_CANSWITCHGROUP', 64 );
define('ANALYST_RIGHT_A_CANCANCELCALLS', 128 );
define('ANALYST_RIGHT_A_CANDELETEWORKITEMS', 256 );
define('ANALYST_RIGHT_A_CANPLACECALLONHOL', 512 );
define('ANALYST_RIGHT_A_CANTAKECALLOFFHOLD', 1024 );
define('ANALYST_RIGHT_A_CANCHANGEPRIORITY', 2048 );
define('ANALYST_RIGHT_A_CANATTACHFILESTOCALLS', 4096 );
define('ANALYST_RIGHT_A_CANREADFILESONCALLS', 8192 );
define('ANALYST_RIGHT_A_CANCREATESCHEDCALLS', 262144 );
define('ANALYST_RIGHT_A_CANEDITSCHEDCALLS',524288);
define('ANALYST_RIGHT_A_CANDELETESCHEDCALLS',1048576);
define('ANALYST_RIGHT_A_CANCREATENEWTASKS',2097152);
define('ANALYST_RIGHT_A_CANCHANGETASKOWNERSHIPGRP',4194304);
define('ANALYST_RIGHT_A_CANCHANGETASKOWNERSHIP',8388608);
define('ANALYST_RIGHT_A_MODIFYTASKGRP',16777216);
define('ANALYST_RIGHT_A_MODIFYTASK',33554432);
define('ANALYST_RIGHT_A_CANUPDATENONOWNEDCALLS',67108864);
define('ANALYST_RIGHT_A_CANRESOLVECALLS',134217728);
define('ANALYST_RIGHT_A_CANCHANGECALLPROFILECODE',268435456);
define('ANALYST_RIGHT_A_CANREACTIVATECALLS',536870912);
define('ANALYST_RIGHT_A_CANUPDATECALLDIARYITEMS',1073741824);
define('ANALYST_RIGHT_A_CANDELETEATTACHEDFILES',2147483648);
define('ANALYST_RIGHT_B_CANCHANGECALLCLASS',1);
define('ANALYST_RIGHT_B_CANCHANGECALLCONDITION',2);
define('ANALYST_RIGHT_B_CANCREATEISSUES',4);
define('ANALYST_RIGHT_B_CANMODIFYISSUES',8);
define('ANALYST_RIGHT_B_CANCLOSEISSUES',16);
define('ANALYST_RIGHT_B_CANBACKDATENEWCALLLOGS',32);
define('ANALYST_RIGHT_C_CANMANAGECALLPROFILES',1);
define('ANALYST_RIGHT_C_CANMANAGESLAS',2);
define('ANALYST_RIGHT_C_CANMANAGEWORKFLOWTEMPLATES',4);
define('ANALYST_RIGHT_C_CANMANAGESKILLS',8);
define('ANALYST_RIGHT_C_CANMANAGECALLCLASSES',16);
define('ANALYST_RIGHT_C_CANMANAGECUSTOMERWEBACCESS',32);
define('ANALYST_RIGHT_C_CANADDSLA',64);
define('ANALYST_RIGHT_C_CANADDGENERICCODES',128);
define('ANALYST_RIGHT_C_CANADDCODES',256);
define('ANALYST_RIGHT_C_CANMANAGEANALYSTWEBACCESS',512);
define('ANALYST_RIGHT_C_CANMANAGECALLSCRIPTS',1024);
define('ANALYST_RIGHT_C_CANMANAGEDATAMERGES',2048);
define('ANALYST_RIGHT_C_CANMODIFYSLA',32768);
define('ANALYST_RIGHT_C_CANMODIFYGENERICCODES',65536);
define('ANALYST_RIGHT_C_CANMODIFYCODES',131072);
define('ANALYST_RIGHT_C_CANADDTOGAL',262144);
define('ANALYST_RIGHT_C_CANEDITGAL',524288);
define('ANALYST_RIGHT_C_CANDELETEFROMGAL',1048576);
define('ANALYST_RIGHT_C_CANDELETESLA',16777216);
define('ANALYST_RIGHT_C_CANDELETEGENERICCODES',33554432);
define('ANALYST_RIGHT_C_CANDELETECODES',67108864);
define('ANALYST_RIGHT_C_CANADDTOKNOWLEDGEBASE',134217728);
define('ANALYST_RIGHT_D_CANVIEWREPORTS',1);
define('ANALYST_RIGHT_D_CANEDITFOLDERS',2);
define('ANALYST_RIGHT_D_CANCREATEEDITREPORTS',4);
define('ANALYST_RIGHT_D_CANDELETEREPORTS',8);
define('ANALYST_RIGHT_D_IMPORTEMPORTREPORTS',16);
define('ANALYST_RIGHT_D_CANSCHEDULEREPORTS',32);
define('ANALYST_RIGHT_D_CANCREATECUSTOMSEARCHES',512);
define('ANALYST_RIGHT_D_CANRUNCUSTOMSEARCHES',1048);
define('ANALYST_RIGHT_D_CANDELETECUSTOMSEARCHES',2048);
define('ANALYST_RIGHT_D_CANCHANGEPERSONELSTATUS',8192);
define('ANALYST_RIGHT_D_CANSENDPOPUPMESSAGES',16384);
define('ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE',32768);
define('ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE',65536);
define('ANALYST_RIGHT_D_CANEDITPERSONALMULTIPASTE',131072);
define('ANALYST_RIGHT_D_CANEDITGROUPMULTIPASTE',262144);
define('ANALYST_RIGHT_D_CANEDITKEYBOARDSHORTCUTS',524288);
define('ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS',148576);
define('ANALYST_RIGHT_D_CANADDKBDOCUMENTS',4194304);
define('ANALYST_RIGHT_D_CANADDEXTKBDOCUMENTS',8388608);
define('ANALYST_RIGHT_D_CANEDITKBDOCUMENTS',16777216);
define('ANALYST_RIGHT_D_CANDELKBDOCUMENTS',33554432);
define('ANALYST_RIGHT_D_CANMANAGEKBCATALOGS',67108864);
define('ANALYST_RIGHT_D_CANMANAGECUSTOMTOOLS',134217728);
define('ANALYST_RIGHT_E_CANRUNSQLSELECT',1);
define('ANALYST_RIGHT_E_CANRUNSQLINSERT',2);
define('ANALYST_RIGHT_E_CANRUNSQLUPDATE',4);
define('ANALYST_RIGHT_E_CANRUNSQLDELETE',8);
define('ANALYST_RIGHT_E_CANRUNSQLDROPINDEX',16);
define('ANALYST_RIGHT_E_CANRUNSQLDROPTABLE',32);
define('ANALYST_RIGHT_E_CANRUNSQLALTER',64);
define('ANALYST_RIGHT_E_CANRUNSQLTRUNCATE',128);
define('ANALYST_RIGHT_E_CANRUNSQLDESCRIBE',512);
define('ANALYST_RIGHT_E_CANRUNSQLTRANSACT',1024);
define('ANALYST_RIGHT_E_CANRUNSQLGRANTREVOKE',2048);
define('ANALYST_RIGHT_E_CANRUNSQLCREATEINDEX',4096);
define('ANALYST_RIGHT_E_CANRUNSQLCREATETABLE',8192);
define('ANALYST_RIGHT_F_CANCREATEDATADICTIONARIES',1);
define('ANALYST_RIGHT_F_CANEDITDATADICTIONARY',2);
define('ANALYST_RIGHT_F_CANSWITCHDATADICTIONARIES',4);
define('ANALYST_RIGHT_F_CANDELETEDATADICTIONARIES',8);

//-- default options
define('ANALYST_DEFAULT_UPDATEPRIVATE', 1);
define('ANALYST_DEFAULT_UPDATESENDEMAIL', 2);
define('ANALYST_DEFAULT_HOLDPRIVATE', 4);
define('ANALYST_DEFAULT_HOLDSENDEMAIL', 8);
define('ANALYST_DEFAULT_CLOSEPRIVATE', 16);
define('ANALYST_DEFAULT_CLOSESENDEMAIL', 32);
define('ANALYST_DEFAULT_CLOSEKNOWLEDGEBASE', 64);
define('ANALYST_DEFAULT_CLOSECHARGABLE', 128);
define('ANALYST_DEFAULT_FORCEUPDATEWHENACCEPCALL', 1024);
define('ANALYST_DEFAULT_AUTOFILLPROBLEMTEXT', 2048);
define('ANALYST_DEFAULT_AUTOFILLRESOLUTIONTEXT', 4096);
define('ANALYST_DEFAULT_RESOLVEBYDEFAULT', 8192);
define('ANALYST_DEFAULT_LOGSENDEMAIL', 16384);
define('ANALYST_DEFAULT_INCLUDESUBJECT', 32768);
define('ANALYST_DEFAULT_DISABLESENDSURVEY', 65536); 
define('ANALYST_DEFAULT_SETSENDSURVEY', 131072);


//-- bit flags
define("bit1",1);
define("bit2", 2);
define("bit3", 4);
define("bit4", 8);
define("bit5", 16);
define("bit6", 32);
define("bit7", 64);
define("bit8", 128);
define("bit9", 256);
define("bit10", 512);
define("bit11", 1024);
define("bit12", 2048);
define("bit13", 4096);
define("bit14", 8192);
define("bit15", 16384);
define("bit16", 32768);
define("bit17", 65536);
define("bit18", 131072);
define("bit19", 262144);
define("bit20", 524288);
define("bit21", 1048576);
define("bit22", 2097152);
define("bit23", 4194304);
define("bit24", 8388608);
define("bit25", 16777216);
define("bit26", 33554432);
define("bit27", 67108864);
define("bit28", 134217728);
define("bit29", 268435456);
define("bit30", 536870912);
define("bit31", 1073741824);

RedefineForDocker::standardizeXmlmc();
