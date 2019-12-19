<?php

class classActivePageSession
{
	var $sessid;
	var $sessionok;
	function classActivePageSession($sessid)
	{
		$this->sessid = $sessid;
		//bind session here

		//use logon
		$sessionok = FALSE;

		if(!isset($_SESSION['swstate']))
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
						if($strColName=='currentdatadictionary')
							$strColName = 'dd';
						$GLOBALS[$strColName] = $colNode->get_content();
						$_SESSION['wc_'.$strColName] = $colNode->get_content();
					}
				}
			}
			$this->sessionok = TRUE;
		}
		$GLOBALS["analystid"] = strtolower($GLOBALS["analystid"]);

		swdti_load($_SESSION['wc_dd']);
	}
}
?>