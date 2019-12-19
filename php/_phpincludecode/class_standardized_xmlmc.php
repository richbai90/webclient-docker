<?php

/**
 * An XmlMethodCall class that is compatible with all the various implementations found throughout
 * The Supportworks code. Runkit is used to map all the calls to any XmlMethodCall implementation
 * To this implementation. This gives us one place to change all the code.
 */
class XmlMethodCall
{
    public $swserver = "";
    public $params = array();
    public $data = array();
    public $xmlresult = "";
    public $xmldom = null;
    public $_lasterror = "";
    public $_lasterrorcode = "";
    private $_parseAsJson = false;
    private $espToken = null;

    public function XmlMethodCall($server = "127.0.0.1")
    {
        if ($server === "127.0.0.1" && (isset($_SESSION['server_name']) || defined('_SERVER_NAME'))) {
            if (isset($_SESSION['server_name'])) {
                if (defined('_SERVER_NAME') && _SERVER_NAME !== $_SESSION['server_name']) {
                    $_SESSION['server_name'] = _SERVER_NAME;
                }
            } else {
                if (defined('_SERVER_NAME')) {
                    $_SESSION['server_name'] = _SERVER_NAME;
                } else {
                    $_SESSION['server_name'] = $server;
                }
            }
        }
        $this->swserver = isset($_SESSION['server_name']) ? $_SESSION['server_name'] : $server;
    }

    public function reset()
    {
        $this->params = array();
        $this->data = array();
        $this->xmlresult = "";
        $this->swserver = "";
        $this->xmldom = null;
        $this->_lasterror = "";
        $this->_lasterrorcode = "";
        $this->$_parseAsJson = false;

    }

    public function SetComplexParam($parentParamName, $paramName, $paramValue = "")
    {
        // base case: We are using the alternative syntax. Correct it.
        if ($paramValue === "") {
            $lastParam = "";
            $matches = [];
            preg_match("/((?<=<)\w+).((?<=>)\w+)/gm", $paramName, $matches);
            foreach ($matches as $i => $val) {
                if ($i === 0) {
                    continue;
                }

                // odd match indicates key
                if ($i % 2) {
                    $lastParam = $val;
                } else {
                    // should always be true, but just in case
                    if ($lastParam !== "") {
                        $this->SetComplexParam($parentParamName, $lastParam, $val);
                        $lastParam = "";
                    }
                }
            }
        }
        if (!isset($this->params[$parentParamName])) {
            $this->params[$parentParamName] = array();
        }

        $this->params[$parentParamName][$paramName] = $paramValue;
    }
    public function SetParam($paramName, $paramValue)
    {
        $this->params[$paramName] = $paramValue;
    }
    public function SetDataComplexValue($parentParamName, $paramName, $paramValue)
    {
        if (!isset($this->data[$parentParamName])) {
            $this->data[$parentParamName] = array();
        }

        $this->data[$parentParamName][$paramName] = $paramValue;
    }
    public function SetData($paramName, $paramValue)
    {
        $this->data[$paramName] = $paramValue;
    }

    public function SetValue($paramName, $paramValue)
    {
        return $this->SetData($paramName, $paramValue);
    }

    public function SetComplexValue($parentParamName, $paramName, $paramValue = "")
    {
        return $this->SetComplexParam($parentParamName, $paramName, $paramValue);
    }

    //-- return xml string
    public function generatexmlcall($service, $method)
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= "<methodCall service='" . $service . "' method='" . $method . "'>";
        //-- params
        $bParams = false;
        foreach ($this->params as $paramName => $paramValue) {
            if ($bParams == false) {
                $xml .= "<params>";
                $bParams = true;
            }
            $xml .= "<" . $paramName . ">" . prepareForXml(utf8_encode($paramValue)) . "</" . $paramName . ">";
        }
        if ($bParams) {
            $xml .= "</params>";
        }

        $xml .= "</methodCall>";
        return $xml;
    }

    public function invoke($service, $method, $bAsJson = false)
    {
        $this->_parseAsJson = $bAsJson;
        $port = 5015;
        if ($service == "mail" || $service == "addressbook") {
            $port = 5014;
        } else if ($service == "calendar") {
            $port = 5013;
        }

        $result = $this->_xmlmc($this->generatexmlcall($service, $method), $port, $this->swserver, $bAsJson);
        return $this->_processresultstring($result);
    }

    public function _processresultstring($xmlmcResult)
    {
        if ($xmlmcResult == false) {
            $this->xmlresult = generateCustomErrorString("-300", "Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.");
            return false;
        }

        if ($xmlmcResult->status != 200) {
            //-- some http error has occured
            $this->xmlresult = generateCustomErrorString($xmlmcResult->status, "An http error has occurred. Please contact your Administrator.");
            return false;
        } else {
            //-- get result - convert string to xmldom
            $this->xmlresult = $xmlmcResult->content;
            if ($xmlmcResult->xmldom != null) {
                $this->xmldom = $xmlmcResult->xmldom->document_element();
                $error = $this->xmldom->get_elements_by_tagname('error');
                $code = $this->xmldom->get_elements_by_tagname('code');
                if (isset($error[0]) && $error[0]->content) {
                    $this->_lasterror = $error[0]->content;
                    $this->_lasterrorcode = $code[0]->content;
                }
                $status = $this->xmldom->get_attribute('status');
                return ($status == "fail") ? false : true;
            } else {
                $this->xmldom = json_decode($this->xmlresult);
                if ($this->xmldom->state) {
                    $this->_lasterror = $this->xmldom->state->error;
                    $this->_lasterrorcode = $this->xmldom->state->code;
                }
            }
            return true;
        }
    }

    public function GetLastError()
    {
        return $this->_lasterror;
    }

    public function GetLastErrorCode()
    {
        return $this->_lasterrorcode;
    }

    public function GetParam($strName)
    {
        if ($this->$_parseAsJson) {
            return _getJsonParam($strName);
        }

        return _getXmlParam($strName);

    }

    private function _getJsonParam($strName)
    {
        if (isset($this->xmlDom->params) && isset($this->xmlDom->params->{$strName})) {
            return $this->xmlDom->params->{$strName};
        }

        return "";
    }

    private function _getXmlParam($strName)
    {
        $arrParams = $this->xmlDom->get_elements_by_tagname("params");
        if ($arrParams[0]) {
            $arrParams = $arrParams[0]->get_elements_by_tagname($strName);
            if ($arrParams[0]) {
                return $arrParams[0]->get_content();
            }
        }
        return "";
    }

    private function _fwrite_stream($fp, $string)
    {
        for ($written = 0; $written < strlen($string); $written += $fwrite) {
            $fwrite = fwrite($fp, substr($string, $written));
            if (!$fwrite) {
                return $fwrite;
            }
        }
        return $written;
    }

    protected function _xmlmc($xmlmc, $port, $host, $boolAsJson = false)
    {
        $errNo = null;
        $errStr = null;
        global $_core;
        // some xmlmc methods store the token in various gloabl variables. If the token doesn't exist use those
        if (!$this->espToken) {
            if (isset($_SESSION['swstate'])) {
                $this->espToken = $_SESSION['swstate'];
            } else if (isset($_core) && isset($_core['_nexttoken'])) {
                $this->espToken = $_core['_nexttoken'];
            }
        }
        if (($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === false) {
            return false;
        }

        $acceptType = ($boolAsJson) ? "text/json" : "text/xmlmc";
        $request = array(
            'POST /xmlmc HTTP/1.1',
            'Host: ' . $host,
            'User-Agent: Hornbill PHP',
            'Connection: close',
            'Cache-Control: no-cache',
            'Accept: ' . $acceptType,
            'Accept-Charset: utf-8',
            'Accept-Language: en-GB',
            // 'Cookie: ESPSessionState=' . $_core['_nexttoken'],
            'Content-Type: text/xmlmc; charset=utf-8',
            'Content-Length: ' . strlen($xmlmc),
        );

        if ($this->espToken) {
            $request[] = 'Cookie: ESPSessionState=' . $this->espToken;
        }

        $request = implode("\r\n", $request)
            . "\r\n\r\n"
            . $xmlmc;

        $this->_fwrite_stream($fp, $request);
        $resCode = null;
        $headers = null;
        $content = null;
        $newToken = $espToken;
        $inContent = false;
        while (!feof($fp)) {
            if ($inContent) {
                $content .= fread($fp, 8192);
            } else {
                $headers .= fread($fp, 8192);
                if ($resCode === null && strlen($headers) >= 13) {
                    if (!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13))) {
                        fclose($fp);
                        // Invalid http response
                        return false;
                    }
                    $resCode = (integer) substr($headers, 9, 3);
                }
                if (($eoh = strpos($headers, "\r\n\r\n")) !== false) {
                    $content = (string) substr($headers, $eoh + 4);
                    $headers = substr($headers, 0, $eoh);
                    if (preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts)) {
                        $newToken = $parts[1];
                    }
                    $headers = explode("\r\n", $headers);
                    $inContent = true;
                    array_shift($headers);
                }
            }
        }
        fclose($fp);

        if ($newToken != "") {
            $this->espToken = $newToken;
            //-- set webclient espsessionstate
            if (isset($_SESSION['swstate'])) {
                $_SESSION['swstate'] = $newToken;
            }

            //else if(isset($_COOKIE['ESPSessionState'])) setcookie('ESPSessionState',$newToken,0,"/sw");
        }

        $o = new StdClass();
        $o->status = $resCode;
        $o->headers = $headers;
        $o->content = $content;
        $o->xmldom = null;
        $o->asjson = $boolAsJson;
        if (!$boolAsJson) {
            $o->xmldom = domxml_open_mem($content);
        }

        return $o;
    }

}
