<?php

	include_once('php5requirements.php');

	@define("DT_STRING",1);
	@define("DT_NUMERIC",0);

	$_core = Array();

	
	function logError($functionalArea,$message)
	{
	}

	function sqlAsJson($strSQL,$strDB = "swdata")
	{
			if($strDB=="syscache")$strDB="sw_systemdb";

			$xmlmc = new XmlMethodCall();
			$xmlmc->SetParam("database",$strDB);
			$xmlmc->SetParam("query",$strSQL);
			$xmlmc->SetParam("formatValues","false");
			$xmlmc->SetParam("returnMeta","false");			$xmlmc->SetParam("returnRawValues","true");
			if($xmlmc->invoke("data","sqlQuery",true))
			{
				return $xmlmc->xmlresult;
			}
			else
			{
				return "";
			}
			
	}

	//-- class to mimic basic js sqlquery class - so can run query and loop result set 
	class SqlQuery
	{
		var $result = false;
		var $currentrow = -1;
		var $rowsAffected=-1;
		var $row = 	null;
		var $nrow = null;
		var $colnames = null;
		var $xmlmc = null;
		var $lastErrorResponse = "";
		function Query($strSQL,$strDB = "swdata", $bformatValues = false)
		{
			$this->Reset();

			if($strDB=="syscache")$strDB="sw_systemdb";

			$this->xmlmc = new XmlMethodCall();
			$this->xmlmc->SetParam("database",$strDB);
			$this->xmlmc->SetParam("query",$strSQL);
			$this->xmlmc->SetParam("formatValues",($bformatValues)?"true":"false");
			$this->xmlmc->SetParam("returnMeta","true");
			$this->xmlmc->SetParam("returnRawValues","true");
			$this->result = $this->xmlmc->invoke("data","sqlQuery");	
			if($this->result)
			{
				 $this->xmlmc->xmlresult = ""; //-- clear down as all ok and we are now using the xmldom
				$this->rowsAffected = xcc($this->xmlmc->xmldom,"rowsEffected");
			}
			else
			{
				$this->lastErrorResponse = $this->xmlmc->xmlresult;
			}

			return $this->result;
		}

		

		function HasError()
		{
			return ($this->result)?false:true;
		}
		function GetLastError()
		{
			return $this->lastErrorResponse;
		}
		function GetLastErrorMessage()
		{
			return 	xcc($this->xmlmc->xmldom,"error");
		}
		function Fetch()
		{
			if(!$this->result) return false;

			//-- move to next row
			$arrData = $this->xmlmc->xmldom->get_elements_by_tagname("rowData");
			if($arrData[0])
			{
				$rowData = $arrData[0]->get_elements_by_tagname("row");
				if(@$rowData[$this->currentrow+1])
				{
					$this->currentrow++;

					//-- have a row so store col values in row array
					$this->row = new stdClass();
					$this->colnames = array();
					$this->nrow = array();
					$childnodes = $rowData[$this->currentrow]->child_nodes();
					foreach ($childnodes as $aColumn)
					{
						if(@$aColumn->tagname!="")
						{
							//-- get any nodes so long as they have a tagname
							array_push($this->colnames,strToLower($aColumn->tagname));
							array_push($this->nrow,$aColumn->get_content());
							$this->row->{strToLower($aColumn->tagname)} = $aColumn->get_content();
						}
					}
					return $this->row;
				}
			}
			return false;
		} //-- eof function FETCH


		function GenerateFusionData($labelColumn,$countColumn,$table,$strFilter="",$strCountOrderdir="desc", $strDB="swdata",$intLimit=0,$noLabel="N/A")
		{
			$boolMSSQL = (get_database_type()=="mssql")?true:false;

			if($strFilter!="")
			{
				$strFilter = " where " . $strFilter;
			}

			$strOrderby = " order by cnt " . $strCountOrderdir;
			if($intLimit>0 && !$boolMSSQL)
			{
				$strOrderby .= " limit 0," . $intLimit;
			}


			if($intLimit>0 && $boolMSSQL) $strSql = "select top ".$intLimit." ".$labelColumn.", count(".$countColumn.") as cnt from ".$table.$strFilter. " group by ". $labelColumn . $strOrderby;
			else $strSql = "select ".$labelColumn.", count(".$countColumn.") as cnt from ".$table.$strFilter. " group by ". $labelColumn . $strOrderby;
			$this->Query($strSql,$strDB,true);

			$returnData = "";
			while ($this->Fetch())
			{
				$lbl = $this->GetValueAsString($labelColumn);
				if($lbl=="")$lbl=$noLabel;


				$val = $this->GetValueAsNumber("cnt");
				$returnData .= '<set label="'.$lbl.'" value="'.$val.'" />';
			}
			return $returnData;
		}

		function GenerateDrillDownData($labelColumn,$selectColumns,$table,$strFilter="",$strDB="swdata",$intLimit=0,$thClass="ui-widget-header",$trOddClass="",$trEvenClass="")
		{
			$boolMSSQL = (get_database_type()=="mssql")?true:false;
						
			if($strFilter!="")
			{
				$strFilter = " where " . $strFilter;
			}

			if($intLimit>0 && !$boolMSSQL)
			{
				$labelColumn .= " limit 0," . $intLimit;
			}

			if($intLimit>0 && $boolMSSQL) $strSql = "select top ".$intLimit." ".$selectColumns." from ".$table.$strFilter. " order by ". $labelColumn;
			else $strSql = "select ".$selectColumns." from ".$table.$strFilter. " order by ". $labelColumn;
			$this->Query($strSql,$strDB,true);
			return  $this->GetHtmlTable($thClass,$trOddClass,$trEvenClass,$table);
		}

		function GenerateCsvData($labelColumn,$selectColumns,$table,$strFilter="",$strDB="swdata",$intLimit=0)
		{
			$boolMSSQL = (get_database_type()=="mssql")?true:false;
			
			if($strFilter!="")
			{
				$strFilter = " where " . $strFilter;
			}

			if($intLimit>0 && !$boolMSSQL)
			{
				$labelColumn .= " limit 0," . $intLimit;
			}

			if($intLimit>0 && $boolMSSQL) $strSql = "select top ".$intLimit." ".$selectColumns." from ".$table.$strFilter. " order by ". $labelColumn;
			else $strSql = "select ".$selectColumns." from ".$table.$strFilter. " order by ". $labelColumn;
			$this->Query($strSql,$strDB,true);
			return  $this->GetCsvData($table);
		}


		function GetHtmlTableRow($arrSelectCols,$convertUsingTable ="")
		{
			$row = "<tr>";
			for($x=0;$x<count($this->colnames);$x++)
			{
				$colName = $this->colnames[$x];
				if(isset($arrSelectCols[$colName]))
				{
					if($convertUsingTable!="")
					{
						$tableCol = $convertUsingTable.".".$arrSelectCols[$colName];
						$value = HSLlinkify(strToLower($tableCol),$this->row->{$colName});
					}
					else
					{
						$value = $this->row->{$colName};
					}

					$row .= "<td>".$value."</td>";
				}
			}
			$row .= "<tr>";
			return $row;
		}

		function GetHtmlTable($thClass="",$trOddClass="",$trEvenClass="",$convertUsingTable ="")
		{
			$strTable = "<table border='0' cellspacing='4' cellpadding='4'>";
			$arrData = $this->xmlmc->xmldom->get_elements_by_tagname("rowData");
			if($arrData[0])
			{
				$arrMetaData = $this->xmlmc->xmldom->get_elements_by_tagname("metaData");
				if($arrMetaData[0])
				{
					$arrColNames = Array();
					$strTable .="<tr>";
					$arrColInfo = $arrMetaData[0]->child_nodes();
					foreach ($arrColInfo as $colNode)
					{
						
						if(@$colNode->tagname!="" && isXmlNode($colNode))
						{
							$arrColNames[]=xcc($colNode,"columnName");
							
							$colName = xcc($colNode,"displayName");				
							$strTable .= "<td class='".$thClass."'>".$colName."</td>";
						}
					}
					$strTable .="</tr>";
				}
				else
				{
					return "Invalid meta data - please ensure you are calling SqlQuery->Query method with bReturnMeta set to true";
				}

				$rowData = $arrData[0]->get_elements_by_tagname("row");
				$rowCount = count($rowData);
				for($x=0;$x<$rowCount;$x++)
				{
					$useClass = ($x % 2 == 0)?$trEvenClass:$trOddClass;
					$strTable .= "<tr class='".$useClass."'>";
					//-- have a row so store col values in row array
					$this->row = new stdClass();
					foreach ($arrColNames as $colName)
					{
						$colValue = xcc($rowData[$x],$colName);
						
						if($convertUsingTable!="")
						{
							$colValue = HSLlinkify(strToLower($convertUsingTable.".".$colName),$colValue,$colValue);
						}
						else
						{
							$colValue = htmlentities($colValue);
						}
						$strTable .= "<td>".$colValue."</td>";
					}

					$strTable .= "</tr>";
				}
			}
			return $strTable."</table>";
		}


		function GetCsvData($convertUsingTable ="")
		{
			$arrData = $this->xmlmc->xmldom->get_elements_by_tagname("rowData");
			if($arrData[0])
			{
				$strCsvData = "";

				$arrCsvRow = Array();
				$arrMetaData = $this->xmlmc->xmldom->get_elements_by_tagname("metaData");
				if($arrMetaData[0])
				{
					$arrColNames = Array();
					$arrColInfo = $arrMetaData[0]->child_nodes();
					foreach ($arrColInfo as $colNode)
					{
						if(@$colNode->tagname!="")
						{

							$arrColNames[]=xcc($colNode,"columnName");
							$colName = xcc($colNode,"displayName");				
							$arrCsvRow[]= $colName;
						}
					}
				}
				else
				{
					return "Invalid meta data - please ensure you are calling SqlQuery->Query method with bReturnMeta set to true";
				}

				//-- output csv header
				$strCsvData = arraytocsvline($arrCsvRow);

				$rowData = $arrData[0]->get_elements_by_tagname("row");
				$rowCount = count($rowData);
				for($x=0;$x<$rowCount;$x++)
				{
					//-- have a row so store col values in row array
					$arrCsvRow = Array();
					$this->row = new stdClass();
					foreach ($arrColNames as $colName)
					{
						$colValue = xcc($rowData[$x],$colName);
						$arrCsvRow[]= $colValue;
					}
					$strCsvData .= arraytocsvline($arrCsvRow);
				}
			}
			return $strCsvData;
		}

		function GetCsvTableRow($arrSelectCols,$convertUsingTable ="")
		{
			$row = Array();
			for($x=0;$x<count($this->colnames);$x++)
			{
				$colName = $this->colnames[$x];
				if(isset($arrSelectCols[$colName]))
				{
					if($convertUsingTable!="")
					{
						$tableCol = $convertUsingTable.".".$arrSelectCols[$colName];
						$value =swdti_formatvalue(strToLower($tableCol),$this->row->{$colName});
					}
					else
					{
						$value = $this->row->{$colName};
					}

					$row[]= $value;
				}
			}

			return arraytocsvline($row);
		}


		function InsertTableRecord($table,$arrData,$db="swdata")
		{
			$strCols = "";
			$strValues = implode(",",$arrData);
			foreach($arrData as $col => $value)
			{
				if($strCols != "")$strCols .= ",";
				$strCols .= $col;
			}
			$strSql = "insert into $table ($strCols) values ($strValues)";
			if(!$this->Query($strSql,$db))
			{
				return false;
			}
			else
			{
				return true;
			}
		}

		function UpdateTableRecord($tableandkey,$arrData,$db="swdata")
		{
			$arrInfo = explode(".",$tableandkey);
			$table = $arrInfo[0];
			$keycol = $arrInfo[1];
			$keyval = 0;

			$strCols = "";
			foreach($arrData as $col => $value)
			{
				if($col==$keycol)
				{
					$keyval = $value;
					continue;
				}
				if($strCols != "")$strCols .= ",";
				$strCols .= $col ."=" .$value;
			}

			$strSql = "update $table set $strCols where $keycol=$keyval";
			return $this->Query($strSql,$db);
		}

		function RowCount()
		{
			return $this->rowsAffected;
		}

		function GetColumnCount()
		{
			return sizeof($this->colnames);
		}

		function GetColumnName($intPos)
		{
			if(is_numeric($intPos))
			{
				$intPos = $this->colnames[$intPos];
			}
			return $intPos;
		}

		function IsColNumeric($strCol)
		{
			if(is_numeric($strCol))
			{
				$strCol = $this->colnames[$strCol];
			}

			$arrData = $this->xmlmc->xmldom->get_elements_by_tagname("metaData");
			if($arrData[0])
			{
				$colData = $arrData[0]->get_elements_by_tagname(LC($strCol));
				if($colData[0])
				{
						$strType = xcc($colData[0],"dataType");
						if($strType!="string" && $strType!="varchar" && $strType!="text")return true;
				}
			}
			return false;
		}

		function GetValueAsString($strCol)
		{
			if(is_numeric($strCol))
			{
				return @$this->nrow[$strCol];
			}
			else
			{
				return @$this->row->{strToLower($strCol)};
			}
		}

		function GetColumnValue($strCol)
		{
			if(is_numeric($strCol))
			{
				return $this->nrow[$strCol];
			}
			return $this->row->{strToLower($strCol)};
		}


		function GetValueAsNumber($strCol)
		{
			if(is_numeric($strCol))
			{
				return $this->nrow[$strCol]-0;
			}
			else
			{
				return $this->row->{strToLower($strCol)}-0;
			}
		}

		function Reset()
		{
			$this->row = new StdClass();
			$this->nrow = array();
			$this->colnames = array();
			$this->rowsAffected=-1;
			$this->currentrow = -1;
			$this->xmlmc=null;
			$this->lastErrorResponse="";
			$this->result=false;
		}
	}


	class XmlMethodCall
	{
		var $swserver = "";
		var $espsessionstate = "";
		var $params = Array();
		var $data = Array();
		var $xmlresult = "";
		var $xmldom = null;

		function XmlMethodCall($server="127.0.0.1")
		{
			$this->swserver = $server;
		}

		function reset()
		{
			$this->params = Array();
			$this->data = Array();
			$this->espsessionstate = "";
			$this->xmlresult = "";
			$this->xmldom = null;
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
		function GetResultParam($paramName)
		{
			$paramNode = $this->xmldom->get_elements_by_tagname('params'); 
			if($paramNode[0])
			{
				$node = $paramNode[0]->get_elements_by_tagname($paramName);
				if($node[0])
				{
					return $node[0]->get_content();
				}
			}
			return null;
		}

		//-- return xml string
		function generatexmlcall($service,$method)
		{
			$xml = '<?phpxml version="1.0" encoding="UTF-8"?>';
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
			$xml .= "</methodCall>";
			return $xml;
		}

		function invoke($service,$method,$bAsJson=false)
		{
			$port=5015;
			if($service=="mail"||$service=="addressbook")$port=5014;
			else if($service=="calendar")$port=5013;

			$result   = _xmlmc($this->generatexmlcall($service,$method), $port, $this->swserver,$bAsJson);

			$this->espsessionstate = $result->espsessionstate;
			return $this->_processresultstring($result);
		}

		function getLastError()
		{
			$errNodes = $this->xmldom->get_elements_by_tagname('error'); 
			return $errNodes[0]->get_content();
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
					'Cookie: ESPSessionState='.@$_core['_nexttoken'],
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
		$newToken  = NULL;
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

		if($newToken!="")
		{
			$_core['_nexttoken'] = $newToken;
			//-- set webclient espsessionstate
			if(isset($_SESSION['swstate']))$_SESSION['swstate'] = $newToken;
		}
		
		$o = new StdClass();
		$o->status  = $resCode;
		$o->headers = $headers;
		$o->content = utf8_encode($content);
		$o->xmldom = null;
		$o->espsessionstate = $newToken;
		$o->asjson = $boolAsJson;
		if(!$boolAsJson)$o->xmldom = domxml_open_mem(utf8_encode($content));
		return $o;
	}  

	function generateCustomErrorString($code,$msg, $booljson="")
	{
		if($booljson=="")$booljson = @$_POST['asjson'];

		if(@$_POST['espQueryName'])$msg = $_POST['espQueryName'] . " : " . $msg;
		if($booljson)
		{
			$xmls = '{"@status":"fail","state":{"code":"'.$code.'","error":"'.$msg.'"}}';
		}
		else
		{
			$xmls = "<?phpxml version='1.0' encoding='utf-8'?>";
			$xmls .= '<methodCallResult status="fail">';
			$xmls .= '<state>';
			$xmls .= '<code>'.$code .'</code>';
			$xmls .= '<error>'.prepareForXml($msg).'</error>';
			$xmls .= '</state>';
			$xmls .= '</methodCallResult>';
		}
		return $xmls;
	}


	function isXmlNode($xmlNode)
	{
		return method_exists($xmlNode,"get_elements_by_tagname");
	}
	
	function xc($xmlNode)
	{
		return $xmlNode->get_content();
	}
	function xcn($xmlNode,$strChildTagName)
	{
		$arrData = $xmlNode->get_elements_by_tagname($strChildTagName);
		if($arrData[0])return $arrData[0];
		return false;

	}
	function xcc($xmlNode,$tagName)
	{
		$arrData = @$xmlNode->get_elements_by_tagname($tagName);
		if(@$arrData[0])
		{
			return xc($arrData[0]);
		}
		return "";
	}
	function xa($xmlNode,$strAtt)
	{
		return $xmlNode->get_attribute($strAtt);
	}



	function prepareForXml($strValue)
	{
		$xmlchars = array("&", "<", ">",'"',"'");
		$escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
		return utf8_encode(str_replace($xmlchars, $escapechars, $strValue));
	}

	function LC($val)
	{
		return strtolower($val);
	}
	function UC($val)
	{
		return strtoupper($val);
	}
	function pfs($var) 
	{
		return prepareForSql($var);
	}
	function prepareForSql($var)
	{
		$var = str_replace("'","''",$var);
		return $var;
	}
	function sqlprep($var,$intType)
	{
		if($intType==DT_STRING)
		{
			return "'" . prepareForSql($var) ."'";
		}
		else
		{
			return prepareForSql($var);
		}
	}

	function sw_file_put_contents($strFilepath,$strContent,$boolAppend=false)
	{
		$m = ($boolAppend)?"a":"w";
		$fp = fopen($strFilepath, $m);
		fwrite($fp,$strContent);
		fclose($fp);
	}


	//-- 
	function get_session_info()
	{
		//-- get session info
		$xmlmc = new XmlMethodCall();
		if(!$xmlmc->invoke("session","getSessionInfo2"))
		{
			echo $xmlmc->xmlresult;
			exit;
		}
		return $xmlmc->xmldom;
	}

	function gxc($dom,$tag)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if(@$a[0])return $a[0]->get_content();
		return "";
	}
	function gxa($dom,$tag,$attName)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if($a[0])return $a[0]->get_attribute($attName);
		return "";
	}

	function generatesessionobject()
	{
		@session_start();
		$c = gv("sessionInfo");
		@session_write_close();

		if(is_null($c))
		{
			$xmldom  = get_session_info();
			
			$c =  new StdClass();
			$c->xmldom = $xmldom;

			$basic = $xmldom->get_elements_by_tagname("params");
			$basic = $basic[0];
			
			$c->sessionId = gxc($basic,"sessionId");
			$c->connectionId = gxc($basic,"connectionId");
			$c->sessionType = gxc($basic,"sessionType");
			$c->sessionState = gxc($basic,"sessionState");
			$c->lastActivity = gxc($basic,"lastActivity");
			$c->connectedSince = gxc($basic,"connectedSince");
			$c->analystName = gxc($basic,"analystName");
			$c->analystId = gxc($basic,"analystId");
			$c->contextAnalystId = gxc($basic,"contextAnalystId");
			$c->contextGroupId = gxc($basic,"contextGroupId");
			$c->group = gxc($basic,"group");
			$c->notifyPort = gxc($basic,"notifyPort");
			$c->maxUdpSize = gxc($basic,"maxUdpSize");
			$c->currentDataDictionary = gxc($basic,"currentDataDictionary");
			$c->dataDictionary = $c->currentDataDictionary; 
			$c->dateTimeFormat = gxc($basic,"dateTimeFormat");
			$c->dateFormat = gxc($basic,"dateFormat");
			$c->timeFormat = gxc($basic,"timeFormat");
			$c->currencySymbol = gxc($basic,"currencySymbol");
			$c->timeZone = gxc($basic,"timeZone");
			$c->timeZoneOffset = gxc($basic,"timeZoneOffset");
			$c->privLevel = gxc($basic,"privLevel");
			$c->oracleInUse = gxc($basic,"oracleInUse");
			$c->npaProtocol = gxc($basic,"npaProtocol");
			$c->sla = gxc($basic,"sla");
			$c->slb = gxc($basic,"slb");
			$c->slc = gxc($basic,"slc");
			$c->sld = gxc($basic,"sld");
			$c->sle = gxc($basic,"sle");
			$c->slf = gxc($basic,"slf");
			$c->slg = gxc($basic,"slg");
			$c->slh = gxc($basic,"slh");
			$c->msSqlInUse = gxc($basic,"msSqlInUse");
			$c->validateOutput = gxc($basic,"validateOutput");

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

			@session_start();
			$_SESSION["sessionInfo"] = $c;
			@session_write_close();
		}
		return $c;
	}


	function HaveRight($strGroup,$intRight)
	{
		$session = generatesessionobject();
		$rightGroup = "Rights".$strGroup;
		$session->analyst->{$rightGroup}--;
		$session->analyst->{$rightGroup}++;

		return ($session->analyst->{$rightGroup} & $intRight) ? 1 : 0;
	}

	function HaveAppRight($strGroup,$intRight,$strApp = "")
	{
		$session = generatesessionobject();

		if($strApp=="")$strApp=$session->currentDataDictionary;
		$rightGroup = "right".strToUpper($strGroup);
		foreach ($session->apprights as $index => $xmlNode)
		{
			//-- if we have app rights we want to work with
			if(LC(gxc($xmlNode,"appName"))==LC($strApp))
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


	//-- 
	function exit_ifnot_administrator()
	{
		//-- get session info
		$xmlmc = new XmlMethodCall();
		if(!$xmlmc->invoke("session","getSessionInfo2"))
		{
			echo $xmlmc->xmlresult;
			exit;
		}

		$iRole = xcc($xmlmc->xmldom,"privLevel");
		if($iRole!=3)
		{
			echo "You do nothave toe correct privilege level";
			exit;
		}
	}


	//-- return the database type in use
	function get_database_type()
	{
		//-- get session info
		$xmlmc = new XmlMethodCall();
		if(!$xmlmc->invoke("session","getSessionInfo2"))
		{
			echo $xmlmc->xmlresult;
			exit;
		}

		$ora = xcc($xmlmc->xmldom,"oracleInUse");
		$ms = xcc($xmlmc->xmldom,"msSqlInUse");
		if($ora==1) return "oracle";
		if($ms==1) return "mssql";
		return "mysql";
	}

	function HSLlinkify($strTableCol,$varValue,$display="")
	{
		if($display=="")$display = swdti_formatvalue($strTableCol,$varValue);
		switch($strTableCol)
		{
			case "opencall.callref":
				return hslanchor("calldetails", $varValue,$display);
				break;
			case "opencall.site":
				return hslanchor("editrecord", $value,$display,"site");
				break;
			case "opencall.cust_id":
				return hslanchor("editrecord", $value,$display,"userdb");
				break;
			case "opencall.fk_company_id":
				return hslanchor("editrecord", $value,$display,"company");
				break;
		}
		return $display;
	}

	function hslanchor($type, $value,$display,$table="")
	{
		return "<a href='#' onclick='run_hsl_anchor(this)' atype='".$type."' table='".$table."' key='".htmlentities($value)."'>".htmlentities($display)."</a>";
	}

	function download_send_headers($filename) 
	{
		// disable caching
		$now = gmdate("D, d M Y H:i:s");
		header("Expires: Tue, 03 Jul 2001 06:00:00 GMT");
		header("Cache-Control: max-age=0, no-cache, must-revalidate, proxy-revalidate");
		header("Last-Modified: {$now} GMT");

		// force download  
		header("Content-Type: application/force-download");
		header("Content-Type: application/octet-stream");
		header("Content-Type: application/download");

		// disposition / encoding on response body
		header("Content-Disposition: attachment;filename={$filename}");
		header("Content-Transfer-Encoding: binary");
	}


	//-- arraytocsvline for php 4
	function arraytocsvline($fields = array(), $delimiter = ',', $enclosure = '"') 
	{

		if ($delimiter!=NULL) {
			 if( strlen($delimiter) < 1 ) {
				 trigger_error('delimiter must be a character', E_USER_WARNING);
				 return false;
			 }elseif( strlen($delimiter) > 1 ) {
				 trigger_error('delimiter must be a single character', E_USER_NOTICE);
			 }

			/* use first character from string */
			 $delimiter = $delimiter[0];
		 }

		if( $enclosure!=NULL ) {
			  if( strlen($enclosure) < 1 ) {
				 trigger_error('enclosure must be a character', E_USER_WARNING);
				 return false;
			 }elseif( strlen($enclosure) > 1 ) {
				 trigger_error('enclosure must be a single character', E_USER_NOTICE);
			 }

			/* use first character from string */
			 $enclosure = $enclosure[0];
		}

		$i = 0;
		 $csvline = '';
		 $escape_char = '\\';
		 $field_cnt = count($fields);
		 $enc_is_quote = in_array($enclosure, array('"',"'"));
		 reset($fields);

		foreach( $fields AS $field ) {

			/* enclose a field that contains a delimiter, an enclosure character, or a newline */
			 if( is_string($field) && ( 
				strpos($field, $delimiter)!==false ||
				 strpos($field, $enclosure)!==false ||
				 strpos($field, $escape_char)!==false ||
				 strpos($field, "\n")!==false ||
				 strpos($field, "\r")!==false ||
				 strpos($field, "\t")!==false ||
				 strpos($field, ' ')!==false ) ) {

				$field_len = strlen($field);
				 $escaped = 0;

				$csvline .= $enclosure;
				 for( $ch = 0; $ch < $field_len; $ch++ )    {
					 if( $field[$ch] == $escape_char && $field[$ch+1] == $enclosure && $enc_is_quote ) {
						 continue;
					 }elseif( $field[$ch] == $escape_char ) {
						 $escaped = 1;
					 }elseif( !$escaped && $field[$ch] == $enclosure ) {
						 $csvline .= $enclosure;
					 }else{
						 $escaped = 0;
					 }
					 $csvline .= $field[$ch];
				 }
				 $csvline .= $enclosure;
			 } else {
				 $csvline .= $field;
			 }

			if( $i++ != $field_cnt ) {
				 $csvline .= $delimiter;
			 }
		 }

		$csvline .= "\n";

		return $csvline;
	}

	 

RedefineForDocker::standardizeXmlmc();
