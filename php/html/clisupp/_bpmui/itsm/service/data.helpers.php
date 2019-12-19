<?php

	include_once("domxml-php4-to-php5.php");
	$_core = Array();

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
		function Query($strSQL,$strDB = "swdata")
		{
			//-- replace any instances of ![] :[] with posted vars and run any defined checks
			//$strSQL = parseEmbeddedParameters($strSQL);

			$this->Reset();

			if($strDB=="syscache")$strDB="sw_systemdb";

			$this->xmlmc = new XmlMethodCall();
			$this->xmlmc->SetParam("database",$strDB);
			$this->xmlmc->SetParam("query",$strSQL);
			$this->xmlmc->SetParam("formatValues","false");
			$this->xmlmc->SetParam("returnMeta","true");
			$this->xmlmc->SetParam("returnRawValues","true");
			$this->result = $this->xmlmc->invoke("data","sqlQuery");	
			if($this->result)
			{
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
					$this->row = new stdClass();
					$this->colnames = array();
					$this->nrow = array();
					$childnodes = $rowData[$this->currentrow]->child_nodes();
					foreach ($childnodes as $aColumn)
					{
						if($aColumn->tagname!="")
						{
							//-- get any nodes so long as they have a tagname
							array_push($this->colnames,strToLower($aColumn->tagname));
							array_push($this->nrow,$aColumn->get_content());
							$this->row->{strToLower($aColumn->tagname)} = $aColumn->get_content();
						}
					}
					return true;
				}
			}
			return false;
		} //-- eof function FETCH

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
				return $this->nrow[$strCol];
			}
			else
			{
				return $this->row->{strToLower($strCol)};
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
		$newToken  = "";
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
		$o->asjson = $boolAsJson;
		if(!$boolAsJson)$o->xmldom = domxml_open_mem(utf8_encode($content));
		return $o;
	}  

	function generateCustomErrorString($code,$msg)
	{
		$msg = $_POST['espQueryName'] . " : " . $msg;
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

	function gv($varName)
	{
		if($GLOBALS[$varName]) return $GLOBALS[$varName];
		else if($_POST[$varName]) return $_POST[$varName];
		else if($_GET[$varName]) return $_GET[$varName];
		else if($_SESSION[$varName]) return $_SESSION[$varName];

		return null;
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
	function gxc($dom,$tag)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if($a[0])return $a[0]->get_content();
		return "";
	}
	function xcc($xmlNode,$tagName)
	{
		$arrData = $xmlNode->get_elements_by_tagname($tagName);
		if($arrData[0])
		{
			return xc($arrData[0]);
		}
		return "";
	}
	function xa($xmlNode,$strAtt)
	{
		return $xmlNode->get_attribute($strAtt);
	}
	function pfx($strValue)
	{
		return prepareForXml($strValue);
	}
	function prepareForXml($strValue)
	{
		$xmlchars = array("&", "<", ">",'"',"'");
		$escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
		return utf8_encode(str_replace($xmlchars, $escapechars, $strValue));
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

RedefineForDocker::standardizeXmlmc();
