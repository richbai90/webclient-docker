<?php

@define("KB_QUERYTYPE_NATURAL_LANGUAGE",			1);			// Natural Language Query 
@define("KB_QUERYTYPE_KEYWORD_ANY",				2);			// Keyword search, any words match
@define("KB_QUERYTYPE_KEYWORD_ALL",				3);			// Keyword search, all words must match

@define("KB_QUERYTYPE_FLAG_TITLE",				0x00010000);
@define("KB_QUERYTYPE_FLAG_KEYWORDS",			0x00020000);
@define("KB_QUERYTYPE_FLAG_PROBLEM",				0x00040000);
@define("KB_QUERYTYPE_FLAG_SOLUTION",			0x00080000);

@define("KBDOC_FLAG_CUSTOMERVISIBLE",			1);			// The customer can access the document

@define("KBDOC_STATUS_COMPOSE",					0);			// Composing a new message
@define("KBDOC_STATUS_AWAITINGVALIDATION", 		1);			// Awaiting publication approval
@define("KBDOC_STATUS_VALIDATED",				2);			// Validated for publishing, now published
@define("KBDOC_STATUS_WAITINGINDEX",				3);			// Waiting for the document to be indexed

@define("KBDOC_CATALOG_CLOSEDCALLS",				1);			// All Kb documents created from a helpdesk call
@define("KBDOC_CATALOG_FAQ",						2);			// All Kb Documents created as am FAQ
@define("KBDOC_CATALOG_ONLINEDOCUMENTS",			3);			// All Kb Support-Works related documents
@define("KBDOC_CATALOG_USERDOCUMENTS1",			4);			// All external Kb documents added by the user
@define("KBDOC_CATALOG_USERDOCUMENTS2",			5);			// All external Kb documents added by the user
@define("KBDOC_CATALOG_USERDOCUMENTS3",			6);			// All external Kb documents added by the user
@define("KBDOC_CATALOG_USERDOCUMENTS4",			7);			// All external Kb documents added by the user
@define("KBDOC_CATALOG_USERDOCUMENTS5",			8);			// All external Kb documents added by the user

@define("KBDOC_CATALOG_DELETEDDOCUMENTS",		100000);	// All external Kb documents added by the user
@define("KBDOC_CATALOG_CALLSWAITINGPUBLICATION",	100002);	// All calls marked waiting. (kbunpubcalls table)

class CSwKnowldgeBaseAccess extends CSwLocalDbConnection
{
	var $HasRelevence;
	var $con;

	var $lasterror;
	var $servername;
	var $serverinstance;

	//-- 
	//-- YOU MUST CONNECT BEFORE USING ANY OTHER METHODS
	//-- connec to to the helpdesk (customer or analyst connection)
	function ConnectToKbApi($server_name,$sessioninst,$boolAnalyst = false)
	{
		if($this->_server=="")
			$this->_server=$server_name;

		$this->servername = $server_name;
		$this->serverinstance =$sessioninst;
		return true;
	}

	function CloseKbApi()
	{
		return true;
	}

	// 12/11/04 Glen: Modified this method to accept additional true/false valueto cater for Analyst Sessions from the Analyst Portal
	function KbQuery($Query, $QueryType, $Catalog = 0, $MaxResults = 100, $KeywordFlags = 0xFFFF0000, $analyst = false, $boolRecordset)
	{
		$arrCols = array("docref","date","title");
		if(!isset($boolRecordset))$boolRecordset=false;
		$Columns = "*";
		$strOperation = "";
		$strQueryType = "";
		// No relevance by default
		$this->HasRelevence = FALSE;

		switch($QueryType)
		{
		case KB_QUERYTYPE_NATURAL_LANGUAGE:
			$strOperation = "queryNatural";
			$this->HasRelevence = TRUE;
			break;

		case KB_QUERYTYPE_KEYWORD_ANY:
			$strQueryType = "any";
			$strOperation = "queryKeyword";
			$this->HasRelevence = FALSE;
			break;

		case KB_QUERYTYPE_KEYWORD_ALL:
			$strOperation = "queryKeyword";
			$strQueryType = "all";
			$this->HasRelevence = FALSE;
			break;
		}

		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("queryString",$Query);
		if($Catalog)
			$xmlmc->SetParam("catalogId",$Catalog);


		//if is keyword search
		if($strOperation == "queryKeyword")
		{
			$xmlmc->SetParam("queryType",$strQueryType);
			if($KeywordFlags&KB_QUERYTYPE_FLAG_TITLE)
				$xmlmc->SetParam("searchTitle",true);

			if($KeywordFlags&KB_QUERYTYPE_FLAG_KEYWORDS)
				$xmlmc->SetParam("searchKeywords",true);

			if($KeywordFlags&KB_QUERYTYPE_FLAG_PROBLEM)
				$xmlmc->SetParam("searchProblem",true);

			if($KeywordFlags&KB_QUERYTYPE_FLAG_SOLUTION)
				$xmlmc->SetParam("searchSolution",true);

			//$xmlmc->SetParam("searchCallProbCode",false);
		}
		else
		{
			array_push($arrCols,"relevance");
		}

		//$xmlmc->SetParam("includeRetiredDocuments",false);
			
		$xmlmc->SetParam("maxResults",$MaxResults);
		$xmlmc->SetParam("sortResultsBy",0);
		$xmlmc->SetParam("sortResultsAsc",true);
		//$strServer = $this->_server;
		//TK Change as servername not picked up 12/12/12
		$strServer = _SERVER_NAME;

		if($xmlmc->Invoke("knowledgebase",$strOperation,$strServer))
		{
			$this->result = $xmlmc->xmlDom;
			//-- move to first row
			foreach($arrCols as $strColName)
			{
				$this->$strColName = new _swm_Column("","");
				$this->_columns[$strColName] = $this->$strColName;
			}
			//$this->movefirst();
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
		//-- Issue the SQL Query
		return true;//$this->Query($sql,$boolRecordset);
	}

	function Fetch($valnameprefix = "", $displaynameopt = DISPLAYNAME_NONE,$boolRecordsetStub = false)
	{
		if(!$this->result)
			return FALSE;

		//get the next row
		$this->_rowposition++;
		$arrRows = $this->result->get_elements_by_tagname("document");
		if($arrRows[$this->_rowposition])
		{
			//return $this->fetch();
		}
		else
		{
			$this->_rowposition=-1;
			return false;
		}

		//-- load current row columns into column class that has .value and .formattedvalue
		$arrRows = $this->result->get_elements_by_tagname("document");
		if($arrRows[$this->_rowposition])
		{
			//-- set data values for returned columns
			foreach($this->_columns as $strColName => $aCol)
			{
				$xmlCol = $arrRows[$this->_rowposition]->get_elements_by_tagname($strColName);
				if($xmlCol[0])
				{
					$strRawValue = $xmlCol[0]->get_content();
					$strFormattedValue = "";
					//-- set formatted value if we have one
					if($this->_xmlDomFormatted!=null)
					{
						$arrFormattedRows = $this->_xmlDomFormatted->get_elements_by_tagname("row");
						$formattedchildren = $arrFormattedRows[$this->_rowposition]->get_elements_by_tagname($strColName);
						if($formattedchildren[0])
						{
							$formattedColNode = $formattedchildren[0];
							$strFormattedValue = $formattedColNode->get_content();
						}
						else
						{
							$strFormattedValue = ""; //-- something like date epoch that is 0 so returns nothing
						}

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
						$aCol>$strComplexName = "";
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
	
	//--
	//-- generate list of catalogs
	function ListKnowledgeBaseCatalogs(&$catalogs)
	{
		$xmlmc = new XmlMethodCall();
		$strServer = $this->_server;

		if($xmlmc->Invoke("knowledgebase","catalogList",$strServer))
		{
			$rowPos = 0;
			$arrRows = $xmlmc->xmlDom->get_elements_by_tagname("folder");
			foreach($arrRows as $cats)
			{
				$children = $cats->child_nodes();
				$dTotal = count($children);
				$catItem = array();
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$catItem[$strColName] = $colNode->get_content();
					}
				}
				$catalogs[$catItem['catalogId']] = $catItem['name'];
			}
		}
		else
		{
			echo $xmlmc->GetLastError();
		}
	}

	//--
	//-- get url to open document
	function GetDocumentURL($docref, &$docurl)
	{
		$xmlmc = new XmlMethodCall();
		$strServer = $this->_server;
		$xmlmc->SetParam("docRef",$docref);
		if($xmlmc->Invoke("knowledgebase","documentGetUrl",$strServer))
		{
			$docurl = $xmlmc->GetParam("url");
			//-- nwj 20.03.2009 - ensure we use sw server path if it is an external kb document
			$strUseIP = $this->servername;
			if(strpos($docurl,"&[app.webroot]")!==false || strpos($docurl,"&[app.server]")!==false)
			{
				if(strtolower($this->servername)=="localhost" || strtolower($this->servername)=="127.0.0.1")
				{
					//-- using localhost as sw server so need to get actual ip address
					$strUseIP = $_SERVER['SERVER_ADDR']; 
				}
			}

			//-- We currently hard-code the instance ID at the moment '/sw'
			//-- nwj 15.05.2008 bug 68781 - ensure we use port setting of the server
			$docurl = str_replace("&[app.webroot]", "http://" . $strUseIP . ":" . $_SERVER['SERVER_PORT'] ."/sw", $docurl);

			//-- CB 2010.05.20 - new documentation typically has this url: http://&[app.server]/documentation/ ...
			//   so we want to expand this variable as well.
			$docurl = str_replace("&[app.server]", $strUseIP . ":" . $_SERVER['SERVER_PORT'], $docurl);
		
			// sandra 10/08/2007 Bug 39972 - check if browser in ssl mode
			if ($_SERVER['HTTPS'] =="on") $docurl=str_replace("http://","https://", $docurl);
			//end sandra

			// Get rid of the sessionid, it is not needed in the web connector
			if(strpos($docurl, "sessid="))
			{
				$docurl = substr($docurl, 0, strpos($docurl, "sessid="));
			}
		}
		else
		{
			echo $xmlmc->GetLastError();
			return false;
		}
	}





	//--
	//-- backward compatibility for itsm 2.0.0
	function ConnectApi($session)
	{
		return true;
	}

	function CloseApi()
	{
		return true;
	}

	function LookupDocumentURL($session, $docref, &$docurl)
	{
		return $this->GetDocumentURL($docref, $docurl);
	}

	function getDocInfo($docref,$prefix = "")
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("docRef",$docref);
		$strServer = $_SESSION['server_name'];
		if($xmlmc->Invoke("knowledgebase","documentGetInfo",$strServer))
		{
			$arrParams = $xmlmc->xmlDom->get_elements_by_tagname("params");
			if($arrParams[0])
			{
				foreach($arrParams as $cats)
				{
					$children = $cats->child_nodes();
					$dTotal = count($children);
					$catItem = array();
					for ($i=0;$i<$dTotal;$i++)
					{
						$colNode = $children[$i];
						if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
						{
							$strColName = $colNode->tagname();
							if($prefix)
								$fieldName = $prefix . "_" . $strColName; 
							else
								$fieldName = $strColName; 
							$fieldName = strtolower($fieldName);
							$GLOBALS[$fieldName] = $colNode->get_content();
						}
					}
				}
			}
			return true;
		}
		else
		{
			return false;
		}
	}

	function queryRelated($docRef)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("docRef",$docRef);
		$strServer = $this->_server;

		if($xmlmc->Invoke("knowledgebase","documentGetRelated",$strServer))
		{
			$this->result = $xmlmc->xmlDom;
			//-- move to first row
			foreach($arrCols as $strColName)
			{
				$this->$strColName = new _swm_Column("","");
				$this->_columns[$strColName] = $this->$strColName;
			}
			//$this->movefirst();
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
		//-- Issue the SQL Query
		return true;//$this->Query($sql,$boolRecordset);	
	}
}
function embedYoutube($strContent) 
{
	//-- Replace YouTube Links
	$search = '%(?:https?://)?(?:www\.)?(?:youtu\.be/| youtube\.com(?:/embed/| /v/| /watch\?v=))([\w\-]{10,12})\b%x';
	$iframeReplace = '<center><iframe width="420" height="345" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen> </iframe></center>';
	$strContent = preg_replace($search, $iframeReplace, $strContent);

	//-- Replace Vimeo Links
	$search = '%(?:https?://)?(?:www\.)?(?:vimeo\.com/([0-9]+)[^\s]*)\b%x';
	$iframeReplace = '<center><iframe width="420" height="345" src="http://player.vimeo.com/video/$1" frameborder="0" allowfullscreen> </iframe></center>';
	$strContent = preg_replace($search, $iframeReplace, $strContent);
	
	return $strContent;
}
?>
