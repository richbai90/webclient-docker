<?php
	@include_once("domxml-php4-to-php5.php");
	function pfx($strValue)
	{
		$xmlchars = array("&", "<", ">",'"',"'");
		$escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
		return (str_replace($xmlchars, $escapechars, $strValue));
	}

	//-- xmlmc api functions
	//--
	function fwrite_stream($fp, $string)
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


	//-- xmlmc processor
	class XmlMethodCall
	{
		var $paramsxml = "";
		var $dataxml = "";

		var $debugparamsxml = "";
		var $debugdataxml = "";

		var	$token   = "";
		var	$status  = "";
		var	$headers = "";
		var	$content = "";
		var $xmlDom = null;
		var $xmlmc = "";

		var $_lasterrorcode = 0;
		var $_lasterror = "";
		var $boolGlobalDebug = false;

		function Invoke($strService, $strMethod, $host="localhost", $boolDebug = false)
		{
			//-- DMZ
			if ($host=="localhost" && isset($_SESSION['server_name']))
			{
				$host=$_SESSION['server_name'];
			}
			//-- DMZ end
			
			$boolDebugThisRequest = $this->boolGlobalDebug || $boolDebug;

			//-- create xmlmc string
			$xmlmc = "<methodCall service='".$strService."' method='".$strMethod."'>";
			$xmlmcDisplay = "<methodCall service='".$strService."' method='".$strMethod."'>\r\n";
			if($this->paramsxml!="")
			{
				$xmlmc .= "<params>".$this->paramsxml."</params>";
				$xmlmcDisplay .= "   <params>\r\n".$this->debugparamsxml."   </params>\r\n";
			}
			if($this->dataxml!="")
			{
				$xmlmc .= "<data>".$this->dataxml."</data>";
				$xmlmcDisplay .= "   <data>".$this->debugdataxml."   </data>\r\n";
			}
			$xmlmc .= "</methodCall>";
			$xmlmcDisplay .= "</methodCall>\r\n";
			if(!$host)
				$host = "localhost";
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

			$this->_lasterrorcode = 0;
			$this->_lasterror = "";
			$this->xmlDom = null;
			$this->xmlmc = $xmlmcDisplay;
			//-- TK Dugging
			/*echo '<br />';
			echo $host;
			echo '<br />';
			echo $port;
			echo '<br />';
			echo $xmlmc;
			echo '<br />';
			echo $boolDebugThisRequest;
			echo '<br />';*/
			$res = $this->_submit($host, $port,$xmlmc,$boolDebugThisRequest);
			if($res)
			{
				//-- check xml is valid and checl status att of methodCallResult
				$xmlDom = domxml_open_mem(utf8_encode($this->content));
				if(!$xmlDom)
				{
					$this->content = str_replace("<metaData>","<metaData/>",$this->content);				
					$xmlDom = domxml_open_mem(utf8_encode($this->content));
				}
				if($xmlDom)
				{
					$this->xmlDom = $xmlDom->document_element();
					$strRes = $this->xmlDom->get_attribute("status");
					if(strToLower($strRes)=="ok")
					{
						$arrParams = $this->xmlDom->get_elements_by_tagname("callActionStatus");
						if(isset($arrParams[0]))
						{
							$arrSuccess = $arrParams[0]->get_elements_by_tagname("success");
							if($arrSuccess[0])
							{
								if($arrSuccess[0]->get_content()=="false")
								{
									$res = false;
								}
							}
						}
						else
						{
							$arrParams = $this->xmlDom->get_elements_by_tagname("watchCallStatus");
							if(isset($arrParams[0]))
							{
								$arrSuccess = $arrParams[0]->get_elements_by_tagname("success");
								if($arrSuccess[0])
								{
									if($arrSuccess[0]->get_content()=="false")
									{
										$res = false;
									}
								}
							}
						}
						if(!$res)
						{
							$arrMessage = $arrParams[0]->get_elements_by_tagname("message");
							if($arrMessage[0])
							{
								$this->_lasterror =$arrMessage[0]->get_content();
							}
							$this->_lasterrorcode="";
						}
						else
							$res = true;
					}
					else
					{
						$arrCode = $this->xmlDom->get_elements_by_tagname("code");
						$arrError = $this->xmlDom->get_elements_by_tagname("error");
						$res = false;
						$this->_lasterrorcode= $arrCode[0]->get_content();
						$this->_lasterror = "[" . $arrCode[0]->get_content() . "] " . $arrError[0]->get_content();
					}
				}
				else
				{
					$res = false;
					$this->_lasterror = "Failed to process xmlmc return content. Please contact your Administrator";
				}
			}
			else
			{
				$this->_lasterror = "Failed to process xmlmc request. Please contact your Administrator 2 ";
			}
			return $res;
		}

		function _submit($host, $port, $xmlmc, $boolDebug = false)
		{
			if(strtolower($host)=="localhost")$host="127.0.0.1";
			
			$errNo  = NULL;
			$errStr = NULL;
			if(($fp = fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE)
			{
				//-- log activity
				if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
				{
					_wc_debug($host.":".$port ."[failed to open socket]",$xmlmc,"XMLMC");
				}			
				return FALSE;
			}    

			//-- get current swstate
			$espToken = "";
			if(isset($_SESSION['swstate']))
				$espToken = $_SESSION['swstate'];

			$request = array(
						'POST /xmlmc HTTP/1.1',
						'Host: '.$host,
						'User-Agent: Hornbill PHP',
						'Connection: close',
						'Cache-Control: no-cache',
						'Accept: text/xmlmc',
						'Accept-Charset=UTF-8',
						'Accept-Language: en-GB',
						'Cookie: ESPSessionState='.$espToken,
						'Content-Type: text/xmlmc; charset=UTF-8',
						'Content-Length: '.strlen($xmlmc),
					   );

			$request = implode("\r\n", $request)
					 . "\r\n\r\n"
					 . $xmlmc;

			//-- log activity
			if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
			{
				_wc_debug($host.":".$port,$xmlmc,"XMLMC");
			}

			fwrite_stream($fp, $request);
			$resCode   = NULL;
			$headers   = NULL;
			$content   = NULL;
			$newToken  = $espToken;
			$inContent = FALSE;
			$exitme = false;

			while(!feof($fp) && (!$exitme))
			{
				if($inContent)
				{
					$addcontent= fread($fp, 8192);
					$dupPos = strpos($addcontent,"</methodCallResult>");
					if($dupPos!==false)
					{
						//-- substr addcontent
						$addcontent = substr($addcontent,0,$dupPos) . "</methodCallResult>";
						$exitme=true;
					}
					$content .= $addcontent;
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

			//-- set new swstate cookie

			$this->token   = $newToken;
			$this->status  = $resCode;
			$this->headers = $headers;
			$this->content = trim($content);
			if($boolDebug)
			{
				$this->debug("\r\n======XMLMC START======");
				$this->debug("XMLMC DEBUG");
				$this->debug("Date    : ".gmdate("H:i:s d/m/y"));
				$this->debug("Session : ".$_SESSION['sessionid']);
				$this->debug("ESPToken: ".$_SESSION['swstate']);
				$this->debug("======REQUEST======\r\n");
				$this->debug($this->xmlmc);
				$this->debug("======RESPONSE======\r\n");
				$this->debug($this->content);
				$this->debug("\r\n======XMLMC END======\r\n");
			}
			$_SESSION['swstate'] = $newToken;
			return true;	
		}

		function SetParam($strName,$varValue)
		{
			$this->paramsxml .="<".$strName.">".pfx($varValue)."</".$strName.">";
			$this->debugparamsxml .="      <".$strName.">".pfx($varValue)."</".$strName.">\r\n";
		}

		function SetComplexParam($strName,$varValue)
		{
			$this->paramsxml .="<".$strName.">".($varValue)."</".$strName.">";
			$this->debugparamsxml .="      <".$strName.">".($varValue)."</".$strName.">\r\n";
		}

		function SetValue($strName,$varValue)
		{
			$this->dataxml .="<".$strName.">".pfx($varValue)."</".$strName.">";
			$this->debugdataxml .="      <".$strName.">".pfx($varValue)."</".$strName.">\r\n";
		}

		function GetParam($strName)
		{
			$arrParams = $this->xmlDom->get_elements_by_tagname("params");
			if($arrParams[0])
			{
				$arrParams = $arrParams[0]->get_elements_by_tagname($strName);
				if($arrParams[0])
				{
					return $arrParams[0]->get_content();
				}
			}
			return "";
		}

		function GetLastError()
		{
			return $this->_lasterror;
		}

		function GetLastErrorCode()
		{
			return $this->_lasterrorcode;
		}

		function debug($strContent)
		{
			if(!isset($GLOBALS['swInstallPath']))
			{
				 $GLOBALS['swInstallPath'] = sw_getcfgstring("InstallPath");
			}
			$strFileName = $GLOBALS['swInstallPath']."\log\xmlmc_from_php.log";
			$file_pointer = fopen($strFileName, 'a');
			$intCount = 0;
			while(!(fwrite($file_pointer,$strContent."\r\n")))
			{
				$intCount++;
				if($intCount>10)
					continue;
				sleep(1);
			}
			fclose($file_pointer);
			return true;
		}

		function reset()
		{
		// -- Reset params
            $this->paramsxml = "";
            $this->debugparamsxml = "";
            $this->dataxml = "";
            $this->debugdataxml = "";
		}

	}


RedefineForDocker::standardizeXmlmc();
