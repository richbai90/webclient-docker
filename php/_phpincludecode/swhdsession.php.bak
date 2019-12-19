<?php

if (version_compare(PHP_VERSION,'5','>='))
	 require_once('domxml-php4-to-php5.php'); //Load the PHP5 converter

define("CS_NOCALLSELECTED",		0);
define("CS_PENDING",			1);
define("CS_UNASSIGNED",			2);
define("CS_UNACCEPTED",			3);
define("CS_ONHOLD",				4);
define("CS_OFFHOLD",			5);
define("CS_RESOLVED",			6);
define("CS_DEFERED",			7);
define("CS_INCOMMING",			8);
define("CS_ESCALATEDOWNER",		9);
define("CS_ESCALATEDGROUP",		10);
define("CS_ESCALATEDALL",		11);
define("CS_LOSTCALL",			15);
define("CS_CLOSED",				16);
define("CS_CANCELED",			17);
define("CS_CLOSEDCHARGABLE",	18);
define("CS_ERROR",				4096);
define("CS_HDCON_OK",			33);
define('_SERVER_NAME', '127.0.0.1');

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

	//-- 15.04.2004
	//-- NWJ
	//-- Open the appropriate type of helpdesk connection depending on the webconnector
	function open_hd_connection()
	{
		$this->clearerror();
		if ($this->webconnector=="")
		{
			//-- open helpdesk conn based on sessid
			return $this->open_sesshd_connection(_SERVER_NAME,$this->sessid);
		}
		else
		{
			//-- open helpdesk conn based on selfservice web connector
			return $this->open_wchd_connection(_SERVER_NAME,$this->webconnector);
		}
	}

	//-- 15.04.2004
	//-- NWJ
	//-- Open a sessid based help desk connection
	function open_sesshd_connection($in_servername,$in_sessid)
	{
		$this->clearerror();

		$hd_connection = swhd_opensession($in_servername,$in_sessid);
		if($hd_connection < CS_HDCON_OK)
		{
			//-- returned a vaild hd connection
			return $hd_connection;
		}
		else
		{
			//-- invalid hd connection
			$this->seterror("Session based Helpdesk object could not be created");
			return false;
		}
	}


	//-- 15.04.2004
	//-- NWJ
	//-- Open a helpdesk session id using servername and webconnector instance
	function open_wchd_connection($in_servername,$in_instance)
	{
		$this->clearerror();

		$hd_connection = swhd_wcopen($in_servername, $in_instance);
		if($hd_connection < CS_HDCON_OK)
		{
			//-- returned a vaild hd connection
			return $hd_connection;
		}
		else
		{
			//-- invaild hd connection
			$this->seterror("Selfservice based Helpdesk object could not be created");
			return false;
		}
	}


	//-- CreateCall
	//-- 15.09.2004
	//-- added application type field
	function CreateCall($session,$callclass,$suppgroup,$application_type = "")
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{
			if(swhd_sendcommand($con, "LOG CALL"))		// Start the transaction
			{
				//-- Set status to unassigned
				swhd_sendstrvalue($con, "status",CS_UNACCEPTED);
				//-- Set the Group to assign to
				swhd_sendstrvalue($con, "suppgroup", $suppgroup);
				//-- Set callclass
				swhd_sendstrvalue($con, "callclass", $callclass);

				//-- Set application type if we have one
				if ($application_type!="")swhd_sendstrvalue($con, "application_code", $application_type);

				//-- Commit the transaction
				if(swhd_commit($con))
				{
					//-- commit ok
					//-- get return value
					$ret = swhd_getlastresponse($con);
					// Strip off the "+OK ";
					$ret = substr($ret, 4);
					return $ret;

				}
				else
				{
					//-- commit failed
					$ret = swhd_getlasterror($con);	
					$this->LastError = $ret;
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "LOG CALL command rejected";
				swhd_close($con);
				return FALSE;

			}//-- log call
		}//-- connected ok
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
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if(swhd_sendcommand($con, "CLOSE CALL " . $callref))		// Start the transaction
			{
				swhd_sendnumvalue($con, "status",CS_CLOSED);				// Set the Status
				swhd_sendstrvalue($con, "udsource", $udsource);
				swhd_sendstrvalue($con, "udcode", $udcode);
				swhd_sendnumvalue($con, "backdateperiod",0);	
				swhd_sendstrvalue($con, "fixcode", "");
				swhd_sendnumvalue($con, "timespent",0);
				swhd_sendboolvalue($con, "publicupdate",true);
				swhd_sendboolvalue($con, "delaycacheflush",false);
				swhd_sendnumvalue($con, "backdateperiod",0);	

				$description = rtrim($description);						// Trim any trailing newline or spaces 
				// All default values except the update text
				swhd_sendtextvalue($con, "description", $description);	// Set the prob text

				// Section added for adding file attachments
				if(count($this->attachmentlist))
				{
					reset($this->attachmentlist);
					while(list($key,$val) = each($this->attachmentlist))
					{
						if(strlen($key))
							swhd_sendfilevalue($con,"Attach",$key,$val);
					}
				}

				// Commit our update
				if(swhd_commit($con))		// Commit the transaction
				{
					$ret = swhd_getlastresponse($con);	// Get the response
					swhd_close($con);
					return TRUE;
				}
				else
				{
					$this->seterror (swhd_getlasterror($con));		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}// -- eof function CloseCall

	//-- ResolveCall
	//-- 15.04.2004
	//--			- $callref - call being closed
	//--			- $description - Description to appear in the call diary
	//--			- $udsource - Diary action source
	//--			- $udsource - Diary action type
	function ResolveCall($callref, $description,$udsource="Web",$udcode="Call Resolution")
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if(swhd_sendcommand($con, "CLOSE CALL " . $callref))		// Start the transaction
			{
				swhd_sendnumvalue($con, "status",CS_RESOLVED);				// Set the Status
				swhd_sendstrvalue($con, "udsource", $udsource);
				swhd_sendstrvalue($con, "udcode", $udcode);
				swhd_sendnumvalue($con, "backdateperiod",0);	
				swhd_sendstrvalue($con, "fixcode", "");
				swhd_sendnumvalue($con, "timespent",0);
				swhd_sendboolvalue($con, "publicupdate",true);
				swhd_sendboolvalue($con, "delaycacheflush",false);
				swhd_sendnumvalue($con, "backdateperiod",0);	

				$description = rtrim($description);						// Trim any trailing newline or spaces 
				// All default values except the update text
				swhd_sendtextvalue($con, "description", $description);	// Set the prob text

				// Section added for adding file attachments
				if(count($this->attachmentlist))
				{
					reset($this->attachmentlist);
					while(list($key,$val) = each($this->attachmentlist))
					{
						if(strlen($key))
							swhd_sendfilevalue($con,"Attach",$key,$val);
					}
				}

				// Commit our update
				if(swhd_commit($con))		// Commit the transaction
				{
					$ret = swhd_getlastresponse($con);	// Get the response
					swhd_close($con);
					return TRUE;
				}
				else
				{
					$this->seterror (swhd_getlasterror($con));		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}// -- eof function ResolveCall


	//-- CancelCall
	//-- 15.04.2004
	//--			- $callref - call being closed
	//--			- $description - Description to appear in the call diary
	function CancelCall($callref, $description)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if(swhd_sendcommand($con, "CANCEL CALL " . $callref))		// Start the transaction
			{
				swhd_sendnumvalue($con, "status",CS_CANCELED);
				swhd_sendnumvalue($con, "backdateperiod",0);	
				swhd_sendnumvalue($con, "timespent",0);
				swhd_sendboolvalue($con, "publicupdate",true);
				swhd_sendboolvalue($con, "delaycacheflush",false);
				swhd_sendnumvalue($con, "backdateperiod",0);	

				$description = rtrim($description);						// Trim any trailing newline or spaces 
				swhd_sendtextvalue($con, "description", $description);	// Set the prob text

				// Commit our update
				if(swhd_commit($con))		// Commit the transaction
				{
					$ret = swhd_getlastresponse($con);	// Get the response
					swhd_close($con);
					return TRUE;
				}
				else
				{
					$this->seterror (swhd_getlasterror($con));		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}// -- eof function CancelCall


	//-- TransferCall
	//-- 27.05.2004
	//--			- $callref - call being transfer
	//--			- $owner - call being transfer to
	//--			- $suppgroup - call being transfer to group
	//--			- $description - Description to appear in the call diary
	function TransferCall($callref, $analystid,$suppgroup)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if (!swhd_sendcommand($con, "ASSIGN CALL " .$callref. " TO  ".$suppgroup.":".$analystid))
			{
				$this->seterror("Command ASSIGN CALL failed.");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return TRUE;
	}// -- eof function TransferCall


	function UpdateCallDiary($callref, $description,$udsource="Web",$udcode="Call Closure",$priority="",$accept = 0,$udtype = 1)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if(swhd_sendcommand($con, "UPDATE CALL " . $callref))	// Start the transaction
			{
				$description = rtrim($description);					// Trim any trailing newline or spaces 
				// All default values except the update text
				swhd_sendtextvalue($con, "description", $description);// Set the prob text

				if(strlen($priority))
					swhd_sendtextvalue($con, "priority", $priority);  // Set the sla

				swhd_sendstrvalue($con, "udsource", $udsource);
				swhd_sendstrvalue($con, "udcode", $udcode);

				//-- $udtype = 1 (public) 513 = (private)
				swhd_sendstrvalue($con, "udtype", $udtype);


				if($accept)
				{
					swhd_sendstrvalue($con, "markslaresponse",$accept);
				}				

				// Commit our update
				if(swhd_commit($con))		// Commit the transaction
				{
					$ret = swhd_getlastresponse($con);	// Get the response
					swhd_close($con);
					return TRUE;
				}
				else
				{
					$this->seterror(swhd_getlasterror($con));		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration!");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}


	//-- AcceptCall
	//-- 27.05.2004
	//--			- $callref - call being transfer
	function AcceptCall($callref)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if (!swhd_sendcommand($con, "UPDATE CALL VALUES " .$callref))
			{
				$this->SendCallValue("status",1,true);

				$this->seterror("Command ACCEPT CALL failed.");
				swhd_commit($con);
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return TRUE;
	}// -- eof function TransferCall

	//-- HoldCall
	//-- 09.11.2004
	//--			- $intCallref	- call being put on hold
	function HoldCall($intCallref,$intHoldUntilDate,$strUDsource,$strUDcode,$strUDdesc,$boolPublic=true)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{
			//-- Start the transaction
			if(swhd_sendcommand($con, "HOLD CALL " . $intCallref))	
			{
				swhd_sendnumvalue($con,"holduntil",$intHoldUntilDate);
				swhd_sendstrvalue($con,"udsource",$strUDsource);
				swhd_sendstrvalue($con,"udcode",$strUDcode);
				swhd_sendnumvalue($con,"timespent",0);
				swhd_sendnumvalue($con,"timespent",0);
				swhd_sendboolvalue($con,"publicupdate",$boolPublic);
				swhd_sendstrvalue($con,"description",$strUDdesc);

				//-- Commit our update
				if(swhd_commit($con))
				{
					//-- Get the response
					$ret = swhd_getlastresponse($con);	
					swhd_close($con);
					return TRUE;
				}
				else
				{
					//-- Get the last error
					$this->seterror( swhd_getlasterror($con));		
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration!");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
	}

	//-- ReleaseCall
	//-- 09.11.2004
	//--			- $intCallref	- call that is taken off hold
	function ReleaseCall($intCallref)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{
			//-- Start the transaction
			if(!swhd_sendcommand($con, "TAKE CALL OFF HOLD " . $intCallref))	
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration!");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
	}


	function UpdateIssue()
	{

	}

	//-- 15.04.2004
	//-- NWJ
	//-- Close an Issue
	function CloseIssue($in_issuenumber)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < CS_HDCON_OK)
		{

			if(swhd_sendcommand($con, "UPDATE ISSUE " . $in_issuenumber))	// Start the transaction
			{
				swhd_sendnumvalue($con, "status",CS_CLOSED);

				// Commit our update
				if(swhd_commit($con))		// Commit the transaction
				{
					$ret = swhd_getlastresponse($con);	// Get the response
					swhd_close($con);
					return TRUE;
				}
				else
				{
					$this->seterror(swhd_getlasterror($con));		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("UPDATE ISSUE Command not accepted by the helpdesk server. Check your configuration");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}

	function UpdateCallValue($callref, $column_name, $column_value)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < 33)
		{	
			if(swhd_sendcommand($con, "UPDATE CALL VALUES " . $callref))	// Start the transaction
			{
				// All default values except the update text
				swhd_sendtextvalue($con, "_updatemessage", "");	// Set the prob text
				swhd_sendtextvalue($con, "_updateverb", "nothing");		// Set the prob text
				swhd_sendstrvalue($con,$column_name,$column_value);	

				// Commit our update
				if(swhd_commit($con))		// Commit the transaction
				{
					$ret = swhd_getlastresponse($con);	// Get the response
					swhd_close($con);
					return TRUE;
				}
				else
				{
					$this->seterror( swhd_getlasterror($con));		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->seterror("Command NOT sent to the helpdesk server. Check your configuration!");
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}

	//--
	//-- NWJ - update array of values
	function UpdateCallValues($callref, $arrNumericColumnValues, $arrStringColumnValues)
	{
		$this->StartCallUpdate($callref);	

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
		return $this->CommitCallUpdate();
	}

	//-- 06.06.2005
	//-- NWJ
	//-- begin a Update Call transaction
	function StartCallUpdate($callref)
	{
		$this->clearerror();
		$this->HDConnection = $this->open_hd_connection();
		if($this->HDConnection < 33)
		{	
			//-- Start the transaction
			if(swhd_sendcommand($this->HDConnection, "UPDATE CALL VALUES " . $callref)) return true;	
			//-- failed		
			$this->seterror("Helpdesk Command 'UPDATE CALL VALUES' was not accepted");
		}
		else
		{
			$this->seterror("Helpdesk Connection is not connected");
		}
		return false;
	}

	//-- send a value
	function SendCallValue($column_name,$column_value,$boolNumber)
	{
		$this->clearerror();
		if($this->HDConnection< 33)
		{	
			if ($boolNumber)
			{
				swhd_sendnumvalue($this->HDConnection,$column_name,$column_value);		
			}
			else
			{
				swhd_sendtextvalue($this->HDConnection,$column_name,$column_value);		
			}
			return true;
		}
		else
		{
			$this->seterror("Helpdesk Connection is not connected");
		}
		return false;
	}
	
	//-- commit a call update
	function CommitCallUpdate()
	{
		if($this->HDConnection < 33)
		{	
			//-- commit the transaction
			if(swhd_commit($this->HDConnection))		
			{
				//-- get the response
				$ret = swhd_getlastresponse($this->HDConnection);
				swhd_close($this->HDConnection);
				return true;
			}
			else
			{
				//-- get the last error
				$this->seterror( swhd_getlasterror($this->HDConnection));
				swhd_close($this->HDConnection);
			}
		}
		else
		{
			$this->seterror("Helpdesk Connection is not connected");
		}
		return false;
	}

	//-- 20.09.2004
	//-- NWJ
	//-- Add a workflow item to a call
	function AddWorkFlow($intCallref,$task_flags,$task_compltbyx,$task_analystid,$task_groupid,$task_details,$task_priority,$task_type,$task_notifytime,$task_parentgroup,$task_parentgroupsequence)
	{
		//-- clear errors and create a helpdesk connection for the appropriate type of connection
		$this->clearerror();
		$con = $this->open_hd_connection();
		if($con < 33)
		{	
			if(swhd_sendcommand($con, "CREATE TASK"))
			{
				swhd_sendnumvalue($con, "callref",				$intCallref);
				swhd_sendnumvalue($con, "flags",				$task_flags);		
				swhd_sendnumvalue($con, "compltbyx",			$task_compltbyx);
				swhd_sendstrvalue($con, "analystid",			$task_analystid);
				swhd_sendstrvalue($con, "groupid",				$task_groupid);
				swhd_sendstrvalue($con, "details",				$task_details);
				swhd_sendstrvalue($con, "priority",				$task_priority);
				swhd_sendstrvalue($con, "type",					$task_type);
				//-- swhd_sendnumvalue($con, "calludindex",			$task_calludindex);
				swhd_sendnumvalue($con, "notifytime",			$task_notifytime);
				swhd_sendstrvalue($con, "parentgroup",			$task_parentgroup);
				swhd_sendnumvalue($con, "parentgroupsequence",	$task_parentgroupsequence);

				//-- Commit the transaction
				if(swhd_commit($con))
				{
					//-- Get our last response
					$ret = swhd_getlastresponse($con);
					swhd_close($con);
					return true;

				}
				else
				{
					//-- Get the last error
					$this->seterror(swhd_getlasterror($con));
					swhd_close($con);
					return FALSE;

				}

			}//-- if(swhd_sendcommand($con, "CREATE TASK"))
		}//-- $con < 33
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
		if(strlen($file) == 0 || strlen($displayname) == 0 )
			return;
		$this->attachmentlist[$file] = $displayname;
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