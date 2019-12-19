<?php

include_once('helpers/resultparser.php');
class classActivePageSession
{
	var $sessid;
	var $sessionok;
	var $error;
	function classActivePageSession($sessid)
	{
		$this->sessid = $sessid;
		//bind session here

		//use logon
		$this->sessionok = FALSE;
		if(!isset($_SESSION['swstate']) || $_SESSION['swstate']=='' )
		{
			$xmlmc = new XmlMethodCall();
			$xmlmc->SetParam("sessionId",PrepareForSql($sessid));
			if($xmlmc->Invoke("session","bindSession"))
			{
				$strRes = $xmlmc->xmlDom->get_attribute("status");
				//xmlmc call worked, but has returned that session is false;
				if(strToLower($strRes)!="ok")
					return FALSE;
			}
			else
			{
				$this->error = $xmlmc->GetLastError();
				return FALSE;
			}
		}

		//-- Load our session configuration
		$this->LoadSessionConfig();
		//-- NWJ
		//-- setup any session variables that will be useful
		//--  set portal mode so can use in other pages to id what we are doing
		$_SESSION['portalmode']="FATCLIENT";
		$_SESSION['server_name']="localhost";
		return TRUE;
	}
	function IsValidSession()
	{
		//  if($this->sessionok)
		//	return TRUE;
		//return FALSE;
		return $this->sessionok;
	}
	
	function LoadSessionConfig()
	{
		$host = "localhost";
		if(isset($_SESSION['server_name']))
			$host = $_SESSION['server_name'];
			$xmlmc = new XmlMethodCall();
			$xmlmc->Invoke("session","getSessionInfo2");
			$strLastError = $xmlmc->GetLastError();
		if($strLastError=="")
		{
			$sessionok = true;
			$arrRows = $xmlmc->xmlDom->get_elements_by_tagname("params");
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
						$strColName = strtolower($strColName);
						//-- TK Fix for apprights so that only the current DD's apprights are stored
						//-- First Store CurrentDD Variable
						if($strColName=='currentdatadictionary')
						{
							//-- Store Current DD 
							$_SESSION['current_dd'] = $colNode->get_content();
							$strColName = 'dd';
						}
						
						if($strColName=="analystInfo"){
							$_SESSION['wc_userdefaults'] =  _getxml_childnode_content($colNode,"UserDefaults");
							continue;
						}
						
						
						if($strColName=="appright")
						{
							//-- TK Only Store Apprights for the DD that fits CurrentDD
							$DD = _getxml_childnode_content($colNode,"appName");
							if(strtolower($DD) == strtolower($_SESSION['current_dd']))
							{
								$_SESSION['wc_apprights']["A"] = _getxml_childnode_content($colNode,"rightA");
								$_SESSION['wc_apprights']["B"] = _getxml_childnode_content($colNode,"rightB");
								$_SESSION['wc_apprights']["C"] = _getxml_childnode_content($colNode,"rightC");
								$_SESSION['wc_apprights']["D"] = _getxml_childnode_content($colNode,"rightD");
								$_SESSION['wc_apprights']["E"] = _getxml_childnode_content($colNode,"rightE");
								$_SESSION['wc_apprights']["F"] = _getxml_childnode_content($colNode,"rightF");
								$_SESSION['wc_apprights']["G"] = _getxml_childnode_content($colNode,"rightG");
								$_SESSION['wc_apprights']["H"] = _getxml_childnode_content($colNode,"rightH");
							}
							//--TK End Fix
							continue;
						}
						// -- Encode single quotes in DatasetFilterList (used in charts) 
						if($strColName == 'datasetfilterlist')
							$GLOBALS['encoded_datasetfilterlist'] = str_replace("'","&apos;",$colNode->get_content());
						
						$GLOBALS[$strColName] = $colNode->get_content();
						$_SESSION['wc_'.$strColName] = $colNode->get_content();
						if($strColName=="dateformat")
						{
							$strColName="datefmt";
							$GLOBALS[$strColName] = $colNode->get_content();
							$_SESSION['wc_'.$strColName] = $colNode->get_content();
						}
						if($strColName=="datetimeformat")
						{
							$strColName="datetimefmt";
							$GLOBALS[$strColName] = $colNode->get_content();
							$_SESSION['wc_'.$strColName] = $colNode->get_content();
						}
					}
				}
			}
			$this->sessionok = TRUE;
		}
		$GLOBALS["analystid"] = strtolower($GLOBALS["analystid"]);

		//swdti_load($_SESSION['wc_dd']);
	}
}
?>