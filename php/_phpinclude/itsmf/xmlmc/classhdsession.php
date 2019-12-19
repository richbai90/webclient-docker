<?php
@define("CS_NOCALLSELECTED",		0);
@define("CS_PENDING",			1);
@define("CS_UNASSIGNED",			2);
@define("CS_UNACCEPTED",			3);
@define("CS_ONHOLD",				4);
@define("CS_OFFHOLD",			5);
@define("CS_RESOLVED",			6);
@define("CS_DEFERED",			7);
@define("CS_INCOMMING",			8);
@define("CS_ESCALATEDOWNER",		9);
@define("CS_ESCALATEDGROUP",		10);
@define("CS_ESCALATEDALL",		11);
@define("CS_LOSTCALL",			15);
@define("CS_CLOSED",				16);
@define("CS_CANCELED",			17);
@define("CS_CLOSEDCHARGABLE",	18);
@define("CS_ERROR",				4096);
@define("CS_HDCON_OK",			33);
@define('_SERVER_NAME', '127.0.0.1');


//--
//-- NWJ - 15.04.2004
//-- New Helpdesk Session class that is usable through selfservice, webclient and client-side php scripts
//-- Mimics calls to cw.c php_sw_functions
//--
class CSwHDsession
{
	var $LastError;
	var $isError=false;
	var $resultitemarray;
	var $attachmentlist;
	var $additionalvaluelist;
	var $sessid;
	var $webconnector="";

	var $HDConnection;
	var $xmlMethodCall = null;
	var $xmlMethodAction = null;

	function CSwHDsession($webconnector="",$sessionid="")
	{
		$this->webconnector = $webconnector;
		$this->sessid = $sessionid;
	}


	//-- 15.04.2004
	//-- NWJ
	//-- Open the appropriate type of helpdesk connection depending on the webconnector
	function open_hd_connection($useport = 5005)
	{
		//--
		//-- 25.02.2008 - NWJ :  allow for override of server_name using sessin. means
		//-- consultants dont have to edit this file, just need to set session var
		if(isSet($_SESSION['server_name']) && _SERVER_NAME=="127.0.0.1")
		{
			$server=$_SESSION['server_name'];
		}
		else
		{
			$server=_SERVER_NAME;
		}

		$this->clearerror();
		return $this;
	}

	//-- 15.04.2004
	//-- NWJ
	//-- Open a sessid based help desk connection
	function open_sesshd_connection($in_servername,$in_sessid,$useport = 5005)
	{
		$this->clearerror();
		return true;
	}


	//-- 15.04.2004
	//-- NWJ
	//-- Open a helpdesk session id using servername and webconnector instance
	function open_wchd_connection($in_servername,$in_instance,$useport = 5005)
	{
		$this->clearerror();
		return true;
	}


	//-- CreateCall
	//-- 15.09.2004
	//-- added application type field
	function CreateCall($callclass,$suppgroup,$owner,$cust_id,$updatetxt,$priority,$probcode,$logstatus,$application_type = "")
	{
		$this->clearerror();
		$logAction = "logNewCall";
		if($owner!="")
			$logAction = "logAndAcceptNewCall";
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam('callClass',$callclass);
		$xmlmc->SetParam('slaName',$priority);
		$xmlmc->SetParam('customerId',$cust_id);
		$xmlmc->SetParam('probCode',$probcode);
		$xmlmc->SetParam('updateMessage',$updatetxt);

		if(count($this->attachmentlist))
		{
			reset($this->attachmentlist);
			while(list($key,$val) = each($this->attachmentlist))
			{
				$this->sendfile($key,$val);
			}
		}

		$arrOpencallValues['appcode'] = $application_type;
		$arrUpdatedbValues = array();
		$arrExtendedTables = array();
		// Check for additional items and add to set values
		if(count($this->additionalvaluelist))
		{
			$strAdditionalCallValues = "";
			reset($this->additionalvaluelist);
			$arrAdditionalValues = $this->additionalvaluelist;
			foreach($arrAdditionalValues as $key=>$val)
			{
				if(strpos($key,"opencall_")===0)
				{
					$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrOpencallValues[$colName] = stripslashes($val);
				}
				else if (strpos($key,"updatedb_")===0)
				{
					//-- check opencall priority option
					$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrUpdatedbValues[$colName] = stripslashes($val);
				}
				else if (strpos($key,"extbl_")===0)
				{
					//-- we want to store info into an extended table (in hnlt element has id="extbl_tablname_.colname"
					$arrInfo = explode("extbl_",$key,2);
					$strTableAndColName = $arrInfo[1];

					$arrTblInfo = explode("__",$strTableAndColName,2);

					$strExtTable = $arrTblInfo[0];
					$strExtCol = $arrTblInfo[1];

					//-- echo $strExtTable . " : " . $strExtCol;

					if(!isset($arrExtendedTables[$strExtTable]))$arrExtendedTables[$strExtTable] = Array();
					$arrExtendedTables[$strExtTable][$strExtCol] = stripslashes($val);
				}
				else
				{
					//-- something else
				}
			}
		}
		$strAdditionalCallValues = "";
		$strOCExtra = "";
		foreach($arrOpencallValues as $colName => $field)
		{
			$strOCExtra .="<".$colName.">".pfx($field)."</".$colName.">";
		}
		unset($arrOpencallValues);
		if($strOCExtra!="")
		{
			$strAdditionalCallValues = "<opencall>".$strOCExtra."</opencall>";
		}
		$strUpdExtra = "";
		foreach($arrUpdatedbValues as $colName => $field)
		{
			$strUpdExtra .="<".$colName.">".pfx($field)."</".$colName.">";
		}
		unset($arrUpdatedbValues);
		if($strUpdExtra!="")
		{
			$strAdditionalCallValues .= "<updatedb>".$strUpdExtra."</updatedb>";
		}
		
		foreach($arrExtendedTables as $tableName => $arrTable)
		{
			$boolVal = false;
			foreach($arrTable as $colName => $colValue)
			{
				$strAdditionalCallValues .= "<".$tableName.">";
				$strAdditionalCallValues .="<".$colName.">".pfx($colValue)."</".$colName.">";
				$boolVal = true;
			}
			if($boolVal)
			{
				$strAdditionalCallValues .= "</".$tableName.">";
			}
		}			
		
		if($strAdditionalCallValues!="")
		{
			$xmlmc->SetComplexParam("additionalCallValues",$strAdditionalCallValues);
		}
		
		$this->additionalvaluelist = null;
		$this->attachmentlist = null;
		if($xmlmc->Invoke("helpdesk",$logAction))
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
			$xmlMD = $arrDM[0];
			if($xmlMD)
			{
				$children = $xmlMD->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$this->resultitemarray[$strColName] = $colNode->get_content();
					}
				}
			}
		}
		else
		{
			$this->seterror($xmlmc->GetLastError());
			return false;
		}
		return true;
	}
	//-- EOF CreateCall

	//-- CloseCall
	//-- 15.04.2004
	//--			- $callref - call being closed
	//--			- $description - Description to appear in the call diary
	//--			- $udsource - Diary action source
	//--			- $udsource - Diary action type
	function CloseCall($callref, $description,$udsource="Web",$udcode="Call Closure")
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",1);
		$xmlmc->SetParam("description",$description);
		$xmlmc->SetParam("publicUpdate",true);
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		$xmlmc->SetParam("delayCacheFlush",0);
		if(count($this->attachmentlist))
		{
			reset($this->attachmentlist);
			while(list($key,$val) = each($this->attachmentlist))
			{
				$this->sendfile($key,$val);
			}
		}
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "closeCalls";
		return $this->CommitCallAction();
	}// -- eof function CloseCall

	//-- ResolveCall
	//-- 15.04.2004
	//--			- $callref - call being closed
	//--			- $description - Description to appear in the call diary
	//--			- $udsource - Diary action source
	//--			- $udsource - Diary action type
	function ResolveCall($callref, $description,$udsource="Web",$udcode="Call Resolution")
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",1);
		$xmlmc->SetParam("description",$description);
		$xmlmc->SetParam("publicUpdate",true);
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		if(count($this->attachmentlist))
		{
			reset($this->attachmentlist);
			while(list($key,$val) = each($this->attachmentlist))
			{
				$this->sendfile($key,$val);
			}
		}
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "resolveCalls";
		return $this->CommitCallAction();
	}// -- eof function ResolveCall


	//-- CancelCall
	//-- 15.04.2004
	//--			- $callref - call being closed
	//--			- $description - Description to appear in the call diary
	function CancelCall($callref, $description)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("description",$description);
		$xmlmc->SetParam("publicUpdate",true);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "cancelCalls";
		return $this->CommitCallAction();
	}// -- eof function CancelCall


	//-- TransferCall
	//-- 27.05.2004
	//--			- $callref - call being transfer
	//--			- $owner - call being transfer to
	//--			- $suppgroup - call being transfer to group
	//--			- $description - Description to appear in the call diary
	function TransferCall($callref, $analystid,$suppgroup)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("groupId",$suppgroup);
		if($analystid!="")
			$xmlmc->SetParam("analystId",$analystid);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "assignCalls";
		return $this->CommitCallAction();
	}// -- eof function TransferCall

	//	<FN>
	function ChangeCallClass($callref, $newCallClass)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("class",$newCallClass);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "changeCallClass";
		return $this->CommitCallAction();
	}
	//	</FN>
	
	//-- standard diary update	
	function UpdateCallDiary($callref, $description,$udsource="Web",$udcode="Call Update",$priority="",$accept = 0,$udtype = 1)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",1);
		$xmlmc->SetParam("description",$description);
		
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		if($accept)
			$xmlmc->SetParam("markAsSLAResponse",true);
		if(strlen($priority))
			$xmlmc->SetParam("priority",$priority);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "updateCalls";
		return $this->CommitCallAction();
	}

	function UpdateAndAccept($callref,$description, $udsource = "HSL Portal",$udcode = "General Update",$udtype="1", $timespent =1, $marksla = 0)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",$timespent);
		$xmlmc->SetParam("description",$description);
		
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
	
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		if($marksla==1)
			$xmlmc->SetParam("markAsSLAResponse",true);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "updateAndAcceptCalls";
		return true;
	}
	//-- AcceptCall
	//-- 27.05.2004
	//--			- $callref - call being transfer
	function AcceptCall($callref, $strUpdate = "This call has been accepted")
	{
		$this->clearerror();
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmcAction = $this->xmlMethodAction;
		if($xmlmc->Invoke("helpdesk","acceptCalls"))
		{
			return true;
		}
		$this->seterror("Command ACCEPT CALL failed.");
		return false;
	}// -- eof function TransferCall

	//-- HoldCall
	//-- 09.11.2004
	//--			- $intCallref	- call being put on hold
	function HoldCall($intCallref,$intHoldUntilDate,$strUDsource,$strUDcode,$strUDdesc,$boolPublic=true, $timespent = 5)
	{
		$this->clearerror();
		$strHoldUntil = gmdate("Y-m-d H:i:00",$intHoldUntilDate);
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$intCallref);
		$xmlmc->SetParam("timeSpent",$timespent);
		$xmlmc->SetParam("description",$strUDdesc);
		$xmlmc->SetParam("holdUntil",$strHoldUntil);
		
		if($boolPublic)
			$xmlmc->SetParam("publicUpdate",true);
	
		$xmlmc->SetParam("updateSource",$strUDsource);
		$xmlmc->SetParam("updateCode",$strUDcode);
		$this->xmlMethodAction = "holdCalls";
		$this->xmlMethodCall = $xmlmc;
		return $this->CommitCallAction();
	}

	//-- ReleaseCall
	//-- 09.11.2004
	//--			- $intCallref	- call that is taken off hold
	function ReleaseCall($intCallref)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$intCallref);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "takeCallsOffHold";
		return $this->CommitCallAction();
	}


	function UpdateIssue()
	{

	}

	function CreateIssue($issueType,$summary)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("issueType",$issueType);
		$xmlmc->SetParam("summary",$summary);
		if($xmlmc->Invoke("helpdesk","issueCreate"))
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
			$xmlMD = $arrDM[0];
			if($xmlMD)
			{
				$children = $xmlMD->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$this->resultitemarray[$strColName] = $colNode->get_content();
					}
				}
			}
		}
		else
		{
			$this->seterror($xmlmc->GetLastError());
			return false;
		}		
		return true;
	}

	//-- 15.04.2004
	//-- NWJ
	//-- Close an Issue
	function CloseIssue($in_issuenumber)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("issueRef",$in_issuenumber);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "issueClose";
		return $this->CommitCallAction();
	}


	//--
	//-- NWJ - will update only a calls bpm last action fields (this helps to trigger vpme events)
	function BPM_UpdateLastAction($callref, $actiontype, $actionbytype, $actionresult, $actionbyid,$boolRunVpme)
	{
		$this->clearerror();
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("actionVerb",'BPM');
		$this->additionalvaluelist = array();
		$this->SendCallValue('bpm_laction',$actiontype,true);
		$this->SendCallValue('bpm_lactionbytype', $actionbytype,true);
		$this->SendCallValue('bpm_lactionres',$actionresult,true);
		$this->SendCallValue('bpm_lactionbyid',$actionbyid,true);
		$this->SendCallValue('bpm_execvpme', $boolRunVpme,true);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "updateCallValues";
		return $this->CommitCallAction();
	}


	function UpdateCallValue($callref, $column_name, $column_value)
	{
		$this->clearerror();
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("actionVerb",'BPM');
		$this->additionalvaluelist = array();
		$this->SendCallValue( $column_name, $column_value,true);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "updateCallValues";
		return $this->CommitCallAction();
	}

	//--
	//-- NWJ - update array of values
	function UpdateCallValues($callref, $arrNumericColumnValues, $arrStringColumnValues)
	{
		$this->StartCallValuesUpdate($callref);	

		//-- for each numeric column and value
		foreach($arrNumericColumnValues as $colName => $colValue)
		{
			$this->SendCallValue($colName,$colValue,true);
		}
		//-- for each string value
		foreach($arrStringColumnValues as $colName => $colValue)
		{			
			$this->SendCallValue($colName,$colValue,false);
		}

		//-- commit
		return $this->CommitCallAction();
	}

	//-- 06.06.2005
	//-- NWJ
	//-- begin a Update Call transaction
	function StartCallValuesUpdate($callref)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$this->xmlMethodCall = $xmlmc;
		$this->additionalvaluelist = array();
		$this->xmlMethodAction = "updateCallValues";
		return true;
	}


	//-- assign call
	function AssignCall($callref,$toSuppgroup,$toAid)
	{
		return $this->TransferCall($callref,$toAid,$toSuppgroup);
	}


	//-- re-activate a call
	function StartCallReactivate($callref,$description, $udsource="HSL Portal",$udcode="Re-activate Call",$udtype)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "reactivateCalls";
		if(!$this->CommitCallAction())
		{
			$this->seterror("Helpdesk Command 'REACTIVATE CALL' was not accepted");
			return false;
		}
		return $this->StartCallUpdate($callref,$description, $udsource,$udcode,$udtype);
	}


	//-- call close
	function StartCallClose($callref,$description, $udsource="HSL Portal",$udcode="Close Call",$udtype)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",1);
		$xmlmc->SetParam("description",$description);
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		$xmlmc->SetParam("delayCacheFlush",0);

		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "closeCalls";
		return true;
	}



	//-- resolve call start
	function StartCallResolve($callref,$description, $udsource="HSL Portal",$udcode="Resolve Call",$udtype)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",1);
		$xmlmc->SetParam("description",$description);
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);

		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "resolveCalls";
		return true;
	}

	//-- hold call start
	function StartCallHold($callref,$description, $udsource="HSL Portal",$udcode="General Update",$udtype,$intHoldUntil, $timespent = 5)
	{
		$strHoldUntil = gmdate("Y-m-d H:i:00",$intHoldUntil);
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",$timespent);
		$xmlmc->SetParam("description",$description);
		$xmlmc->SetParam("holdUntil",$strHoldUntil);
		
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
	
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "holdCalls";
		return true;
	}


	//-- standard diary update
	function StartCallUpdate($callref,$description, $udsource = "HSL Portal",$udcode = "General Update",$udtype="1", $timespent =1)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",$timespent);
		$xmlmc->SetParam("description",$description);
		
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
	
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "updateCalls";
		return true;
	}

	//-- standard diary update
	function UpdateAndAssign($callref,$description, $strGroup, $strAnalyst="",$udsource = "HSL Portal",$udcode = "General Update",$udtype="1", $timespent =1)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",$timespent);
		$xmlmc->SetParam("description",$description);
		
		if($udtype=="1")
			$xmlmc->SetParam("publicUpdate",true);
	
		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		$xmlmc->SetParam("assignGroup",$strGroup);
		if($strAnalyst!="")
			$xmlmc->SetParam("assignAnalyst",$strAnalyst);
		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "updateAndAssignCalls";
		return true;
	}

	function vpmeTableUpdate($strTable,$strUpdate)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("table",$strTable);
		foreach($arrInsert as $column => $value)
		{
			$xmlmc->SetValue($column, $value);
		}
		$xmlmc->invoke("data","updateRecord");// = "updateCalls";
		return true;
	}

	function vpmeTableInsert($strTable,$arrInsert)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("table",$strTable);
		foreach($arrInsert as $column => $value)
		{
			$xmlmc->SetValue($column, $value);
		}
		$xmlmc->invoke("data","addRecord");// = "updateCalls";
		return true;
	}



	//-- begin a call log
	function StartCallCreate()
	{
		$this->seterror("Due to the XMLMC API requiring variable in a strict order, please use createcall function.");
		return false;
	}


	//-- send a value
	function SendCallValue($column_name,$column_value,$boolNumber)
	{
		$this->AddAdditionalItem($column_name,$column_value);
		return true;
	}
	
	function sendtextfield($column_name,$column_value)
	{
		$this->clearerror();
		$this->AddAdditionalItem($column_name,$column_value);
		return true;
	}

	function sendnumfield($column_name,$column_value)
	{
		$this->clearerror();
		$this->AddAdditionalItem($column_name,$column_value);
		return true;

	}
	function sendfile($fullpathname,$file_name,$mimeType="")
	{
		$xmlmc = $this->xmlMethodCall;
		$strFile = file_get_contents($fullpathname);
		$strB64File = base64_encode($strFile);

		$strEmbbededFile ="";
		if($file_name!="")
		{
			$strEmbbededFile = "<fileName>".pfx($file_name)."</fileName><fileData>".$strB64File."</fileData>";
			if($mimeType!="")
				$strEmbbededFile .= "<mimeType>".$mimeType."</mimeType>";
		
		}
		if($strEmbbededFile!="")
		{
			$xmlmc->SetComplexParam("fileAttachment",$strEmbbededFile);
			$this->xmlMethodCall = $xmlmc;
			return true;
		}
		return false;
	}


	//-- commit a call update
	function CommitCallAction()
	{
		$xmlmc = $this->xmlMethodCall;
		$arrAddValues = $this->additionalvaluelist;
		if(count($arrAddValues)>0)
		{
			$boolVal = false;
			foreach($arrAddValues as $column => $value)
			{
				$strAdditionalCallValues .="<".$column.">".pfx($value)."</".$column.">";
				$boolVal = true;
			}
			if($boolVal)
			{
				$strAdditionalCallValues = "<opencall>".$strAdditionalCallValues;
				$strAdditionalCallValues .= "</opencall>";
			}
			if($strAdditionalCallValues!="")
			{
				$xmlmc->SetComplexParam("additionalCallValues",$strAdditionalCallValues);
			}	
			$this->additionalvaluelist = null;
		}
		$xmlmcAction = $this->xmlMethodAction;
		if($xmlmc->Invoke("helpdesk",$xmlmcAction, $_SESSION['server_name']))
		{			
			if($xmlmc->GetParam("success")=='false')
			{
				$this->seterror($xmlmc->GetLastError());
				return false;
			}

			$this->xmlMethodCall = null;
			return true;
		}

		$this->seterror($xmlmc->GetLastError());
		return false;

	}

	//-- 20.09.2004
	//-- NWJ
	//-- Add a workflow item to a call
	function AddWorkFlow($intCallref,$task_flags,$task_compltbyx,$task_analystid,$task_groupid,$task_details,$task_priority,$task_type,$task_notifytime,$task_parentgroup,$task_parentgroupsequence)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$intCallref);
		$xmlmc->SetParam("parentGroup",$task_parentgroup);
		$xmlmc->SetParam("description",$task_details);
		$task_compltbyx = 1322708889;
		$xmlmc->SetParam("time",$task_compltbyx);
		$xmlmc->SetParam("assignToGroup",$task_groupid);
		if($task_analystid!="")
			$xmlmc->SetParam("assignToAnalyst",$task_analystid);

		if(($task_flags&2)>0)
			$xmlmc->SetParam("actionBy",2);
		elseif(($task_flags&1)>0)
			$xmlmc->SetParam("actionBy",1);
		else
			$xmlmc->SetParam("actionBy",0);

		$xmlmc->SetParam("priority",$task_priority);
		$xmlmc->SetParam("type",$task_type);
		$task_notifytime = $task_notifytime*60;
		$xmlmc->SetParam("reminder",$task_notifytime);

		if(($task_flags&16)>0)
			$xmlmc->SetParam("remindAssignee",true);
		if(($task_flags&32)>0)
			$xmlmc->SetParam("remindCallOwner",true);
		if(($task_flags&64)>0)
			$xmlmc->SetParam("notifyGroup",true);

		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "addCallWorkItem";
		return true;
	}//-- AddWorkFlow


	function GetReturnValue($name)
	{
		return $this->resultitemarray[$name];
	}

	//--
	//-- function to add attachement details to array
	//--
	function AddAttachment($file,$displayname)
	{
		if(strlen($file) == 0 || strlen($displayname) == 0 )return false;
		$this->attachmentlist[$file] = $displayname;
		return true;
	}

	function AddAdditionalItem($target,$data)
	{
		$this->additionalvaluelist[$target] = $data;
	}


	//
	//-- Error handling functions
	//
	function clearerror()
	{
		$this->LastError = "";
		$this->isError=false;
	}
	function seterror($in_errordesc)
	{
		$this->LastError = $in_errordesc;
		$this->isError=true;
	}
}

?>