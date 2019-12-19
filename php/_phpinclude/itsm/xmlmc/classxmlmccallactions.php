<?php
	
	// -- Class XmlmcCallActions - Process "Call Actions" using XMLMC APIs
	// -- Utilised by the Analyst Mobile
	include_once('helpers/resultparser.php');
	
	class XmlmcCallActions
	{
		var $sessid;
		var $LastError;
		
		function __construct($sessionid="")
		{
			$this->sessid = $sessionid;
		}
		
		// -- Validate that a SessionId exists
		function isValidSession()
		{
			if(!isset($this->sessid) || $this->sessid=="")
			{
				return FALSE;
			}
			return TRUE;
		}
		
		// -- Update Call through helpdesk::updateCalls or helpdesk::updateAndAcceptCalls API
		function UpdateCallDiary($callref, $description, $udsource="Web", $udcode="General Update", $priority="", $accept=false, $udtype = 1)
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "updateCalls";
			if($accept)
				$strMethod = "updateAndAcceptCalls";
			
			// -- Public/Private Update
			$boolPublicUpdate = true;
			if($udtype==513)
			{
				$boolPublicUpdate = false;
			}
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("timeSpent", 1); // -- Hardcoded to 1 for Analyst Mobile
			$xmlmc->SetParam("description", rtrim($description));
			$xmlmc->SetParam("publicUpdate", $boolPublicUpdate);
			$xmlmc->SetParam("updateSource", $udsource);
			$xmlmc->SetParam("updateCode", $udcode);
			if(isset($priority))
				$xmlmc->SetParam("priority", $priority);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Resolve Call through helpdesk::resolveCalls API
		function ResolveCall($callref, $description, $udsource="Web", $udcode="Call Resolution")
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "resolveCalls";
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("timeSpent", "1"); // -- Hardcoded to 1 for Analyst Mobile
			$xmlmc->SetParam("description", rtrim($description));
			$xmlmc->SetParam("publicUpdate", true);
			$xmlmc->SetParam("updateSource", $udsource);
			$xmlmc->SetParam("updateCode", $udcode);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Close Call through helpdesk::closeCalls API
		function CloseCall($callref, $description, $udsource="Web", $udcode="Call Resolution")
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "closeCalls";
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("timeSpent", "1"); // -- Hardcoded to 1 for Analyst Mobile
			$xmlmc->SetParam("description", rtrim($description));
			$xmlmc->SetParam("publicUpdate", true);
			$xmlmc->SetParam("updateSource", $udsource);
			$xmlmc->SetParam("updateCode", $udcode);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Assign Call through helpdesk::assignCalls API
		function AssignCall($callref, $toSuppgroup, $toAid)
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "assignCalls";
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("groupId", $toSuppgroup);
			if(isset($toAid))
				$xmlmc->SetParam("analystId", $toAid);
			$xmlmc->SetParam("forceAssignment", true);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}			
		}
		
		// -- Place Call On Hold through helpdesk::holdCalls
		function PlaceCallOnHold($callref,$description, $udsource="HSL Portal",$udcode="General Update",$udtype,$intHoldUntil)
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "holdCalls";
			
			// -- Public/Private Update
			$boolPublicUpdate = true;
			if($udtype==513)
			{
				$boolPublicUpdate = false;
			}
			
			// -- Work out "On Hold Until" value to ISO 8601 format
			$intHoldUntil = date('Y-m-d\TH:i:s\Z', $intHoldUntil);
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("timeSpent", "1"); // -- Hardcoded to 1 for Analyst Mobile
			$xmlmc->SetParam("description", rtrim($description));
			$xmlmc->SetParam("holdUntil", $intHoldUntil);
			$xmlmc->SetParam("publicUpdate", $boolPublicUpdate);
			$xmlmc->SetParam("updateSource", $udsource);
			$xmlmc->SetParam("updateCode", $udcode);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Take Call Off Hold using helpdesk::takeCallsOffHold
		function TakeCallOffHold($callref)
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "takeCallsOffHold";
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Cancel Call using helpdesk::cancelCalls
		function CancelCall($callref, $description)
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "cancelCalls";
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("description", rtrim($description));
			$xmlmc->SetParam("publicUpdate", true);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Update Call Values using helpdesk::updateCallValues in order to set BPM state
		function BPM_UpdateLastAction($callref, $actiontype, $actionbytype, $actionresult, $actionbyid, $boolRunVpme)
		{			
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "updateCallValues";
			
			// -- Set bpm_execvpme
			if($boolRunVpme=="")
			{
				$boolRunVpme = true;
			}
			$intRunVpme = ($boolRunVpme) ? 1:0;
			
			// -- Set additionalCallValues
			$strAdditionalCallValues .= "<bpm_laction>" . $actiontype . "</bpm_laction>";
			$strAdditionalCallValues .= "<bpm_lactionbytype>" . $actionbytype . "</bpm_lactionbytype>";
			$strAdditionalCallValues .= "<bpm_lactionres>" . $actionresult . "</bpm_lactionres>";
			$strAdditionalCallValues .= "<bpm_lactionbyid>" . $actionbyid . "</bpm_lactionbyid>";
			$strAdditionalCallValues .= "<bpm_execvpme>" . $intRunVpme . "</bpm_execvpme>";
			$strOpencall = "<opencall>" . $strAdditionalCallValues . "</opencall>";
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetParam("actionVerb", "BPM");
			$xmlmc->SetComplexParam("additionalCallValues", $strOpencall);
			// ** EO API params ** //
			
			// -- Invoke XMLMC API
			if($xmlmc->Invoke("helpdesk",$strMethod))
			{
				return TRUE;
			}
			else
			{
				$this->LastError = $xmlmc->GetLastError();
				return FALSE;
			}
		}
		
		// -- Update Call Values using helpdesk::updateCallValues
		function UpdateCallValues($callref, $arrAdditionalCallValues, $actionVerb = "", $updateMessage = "", $bEncode = true)
		{
			// -- Establish a XMLMC connection
			$xmlmc = new XmlMethodCall();
			
			// -- API method
			$strMethod = "updateCallValues";
			
			// -- Set additionalCallValues
			$strAdditionalCallValues = "";
			foreach($arrAdditionalCallValues as $strColName => $strField)
			{
				$strAdditionalCallValues .= "<$strColName>" . $strField . "</$strColName>";
			}
			$strOpencall = "<opencall>" . $strAdditionalCallValues . "</opencall>";
			
			//return $callref;
			
			
			// ** API params ** //
			$xmlmc->SetParam("callref", $callref);
			$xmlmc->SetComplexParam("additionalCallValues", $strOpencall);
			// ** EO API params ** //
			
			
			if ($bEncode)
			{
				// -- Invoke XMLMC API
				if($xmlmc->Invoke("helpdesk",$strMethod))
				{
					return TRUE;
				}
				else
				{
					$this->LastError = $xmlmc->GetLastError();
					echo $this->LastError;
					return FALSE;
				}
			}
			else
			{
				// -- Invoke XMLMC API
				if($xmlmc->Invoke("helpdesk",$strMethod,false,$bEncode))
				{
					return TRUE;
				}
				else
				{
					$this->LastError = $xmlmc->GetLastError();
					echo $this->LastError;
					return FALSE;
				}
			}
			
		}
	}
?>