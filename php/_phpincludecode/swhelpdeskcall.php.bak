<?php

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

class CSwHelpdeskCall
{
	var $LastError;
	var $resultitemarray;
	var $attachmentlist;
	var $additionalvaluelist;

	function GetReturnValue($name)
	{
		return $this->resultitemarray[$name];
	}

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


	function LogNewCall($session, $custid, $probcode, $sla, $description, $asset_id, $logstatus, $suppgroup = "", $callclass = "", $component_id = "")
	{
		// If the open function returns a number less than 33 (ZERO is a valid connection ID), then you
		// have estableshed a connection to the server and, logged in. If the number is greater than 32
		// then this is an error code

		// open a connection to the helpdesk server
		$con = swhd_wcopen($session->server_name, $session->connector_instance);

		if($con < 33)
		{
			// This sends the appropriate command. In the case of a log call, this begins a 'log call'
			// transaction. To process a transaction you have to take the following steps
			//
			// 1. Issue the command that starts a transaction. (LOG CALL in this case)
			// 2. Set each value that the transaction needs in order to process the request.
			//    There are various types of values that can be set in the transaction state.
			//    see the fowwling example.
			// 3. Commit the transaction. If swhd_commit returns true, the transaction was successfull
			//    and the result string can be obtained by calling swhd_getlastresponse();
			//    If the tranaction failed, call swhd_getlasterror().
			//
			if(swhd_sendcommand($con, "LOG CALL"))		// Start the transaction
			{
				if($logstatus == "Logged")
				{
					if($session->assignanalyst == "")
						$logstatus = CS_UNASSIGNED;
					else
						$logstatus = CS_UNACCEPTED;
					swhd_sendstrvalue($con, "status",		$logstatus);		// Set the status
				}
				else
					swhd_sendstrvalue($con, "status",		CS_INCOMMING);		// Set the status
				$description = rtrim($description);								// Trim any trailing newline or spaces 

				if($suppgroup)
					$assigngroup = $suppgroup;
				else
					$assigngroup = $session->assigngroup;


				if($callclass)
					$call_class = $callclass;
				else
					$call_class = $session->callclass;
	
				swhd_sendstrvalue($con, "owner",				$session->assignanalyst);	// Set the owner
				swhd_sendstrvalue($con, "suppgroup",			$assigngroup);				// Set the Group to assign to
				swhd_sendstrvalue($con, "cust_id",				$session->customerid);		// Set the customer ID
				swhd_sendstrvalue($con, "probcode",				$probcode);					// Set the problem code
				swhd_sendstrvalue($con, "priority",				$sla);						// Set the SLA
				swhd_sendtextvalue($con, "updatedb.updatetxt",	$description);				// Set the prob text
				swhd_sendstrvalue($con, "equipment",			$asset_id);					// Set the equipment item
				swhd_sendstrvalue($con, "callclass",			$call_class);				// Set the Call Class

				if($component_id)
						swhd_sendstrvalue($con, "component_id",	$component_id);				// Set the prob text
				
				// Check for additional items and add to set values
				if(count($this->additionalvaluelist))
				{
					reset($this->additionalvaluelist);
					while(list($key,$val) = each($this->additionalvaluelist))
					{
						if(strlen($key))
							swhd_sendstrvalue($con,$key,$val);	
					}
				}

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
		
				if(swhd_commit($con))		// Commit the transaction
				{
					// Get our last response
					$ret = swhd_getlastresponse($con);	// Get the response
					
					// Strip off the "+OK ";
					$ret = substr($ret, 4);

					// Make an arrat of item=value strings
					$values = explode(";", $ret);

					// Loop through our item=value strings and split them into a named array (map)
					for($x = 0; $x < sizeof($values); $x++)
					{
						$item = $values[$x];
						$pair = explode("=", trim($item));
						$this->resultitemarray[$pair[0]] = trim(strtr($pair[1], "\"", " "));
					}
				}
				else
				{
					$ret = swhd_getlasterror($con);		// Get the last error
					$this->LastError = $ret;
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "Command NOT sent!";
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
			return TRUE;
		}
		return FALSE;
	}

	function UpdateCall($session, $callref, $description, $priority = "", $assignto = "", $accept = 0, $udsource = "", $udcode = "")
	{
		// open a connection to the helpdesk server
		$con = swhd_wcopen($session->server_name, $session->connector_instance);

		// If the open function returns a number less than 33 (ZERO is a valid connection ID), then you
		// have estableshed a connection to the server and, logged in. If the number is greater than 32
		// then this is an error code
		if($con < 33)
		{
			// printf("Connected on %d\n", $con);

			// This sends the appropriate command. In the case of a log call, this begins a 'UPDATE CALL <callref>'
			// transaction. To process a transaction you have to take the following steps
			//
			// 1. Issue the command that starts a transaction. (UPDATE CALL in this case)
			// 2. Set each value that the transaction needs in order to process the request.
			//    There are various types of values that can be set in the transaction state.
			//    see the fowwling example.
			// 3. Commit the transaction. If swhd_commit returns true, the transaction was successfull
			//    and the result string can be obtained by calling swhd_getlastresponse();
			//    If the tranaction failed, call swhd_getlasterror().
			//

			if(swhd_sendcommand($con, "UPDATE CALL " . $callref))	// Start the transaction
			{
				$description = rtrim($description);					// Trim any trailing newline or spaces 
				// All default values except the update text
				swhd_sendtextvalue($con, "description", $description);// Set the prob text
				
				if(strlen($priority))
					swhd_sendtextvalue($con, "priority", $priority);  // Set the prob text
				
				if(strlen($assignto))
					swhd_sendstrvalue($con, "assignto",$assignto); // Set the Group to assign

				//-- NWJ -  set diary udsource and udcode
				if(strlen($udsource))swhd_sendstrvalue($con, "udsource",$udsource); 
				if(strlen($udcode))swhd_sendstrvalue($con, "udcode",$udcode); // 

				if($accept)
				{
					swhd_sendstrvalue($con,"_acceptmode",1);
					swhd_sendstrvalue($con, "markslaresponse",$accept); // Set the Acceptance
				}

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
					$this->LastError = swhd_getlasterror($con);		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "Command NOT sent to the helpdesk server. Check your configuration!";
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}

	function UpdateCallValues($session, $callref, $description, $updateverb)
	{
		// open a connection to the helpdesk server
		$con = swhd_wcopen($session->server_name, $session->connector_instance);

		// If the open function returns a number less than 33 (ZERO is a valid connection ID), then you
		// have estableshed a connection to the server and, logged in. If the number is greater than 32
		// then this is an error code
		if($con < 33)
		{
			// This sends the appropriate command. In the case of a log call, this begins a 'UPDATE CALL <callref>'
			// transaction. To process a transaction you have to take the following steps
			//
			// 1. Issue the command that starts a transaction. (UPDATE CALL in this case)
			// 2. Set each value that the transaction needs in order to process the request.
			//    There are various types of values that can be set in the transaction state.
			//    see the fowwling example.
			// 3. Commit the transaction. If swhd_commit returns true, the transaction was successfull
			//    and the result string can be obtained by calling swhd_getlastresponse();
			//    If the tranaction failed, call swhd_getlasterror().
			if(swhd_sendcommand($con, "UPDATE CALL VALUES " . $callref))	// Start the transaction
			{
				$description = rtrim($description);					// Trim any trailing newline or spaces 
				// All default values except the update text
				swhd_sendtextvalue($con, "_updatemessage", $description);	// Set the prob text
				swhd_sendtextvalue($con, "_updateverb", $updateverb);		// Set the prob text
				
				if(count($this->additionalvaluelist))
				{
					reset($this->additionalvaluelist);
					while(list($key,$val) = each($this->additionalvaluelist))
					{
						if(strlen($key))
							swhd_sendstrvalue($con,$key,$val);	
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
					$this->LastError = swhd_getlasterror($con);		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "Command NOT sent to the helpdesk server. Check your configuration!";
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}


	function CloseCall($session, $callref, $description, $status = 6)
	{
		// open a connection to the helpdesk server
		$con = swhd_wcopen($session->server_name, $session->connector_instance);

		// If the open function returns a number less than 33 (ZERO is a valid connection ID), then you
		// have estableshed a connection to the server and, logged in. If the number is greater than 32
		// then this is an error code
		if($con < 33)
		{
			// printf("Connected on %d\n", $con);

			// This sends the appropriate command. In the case of a log call, this begins a 'UPDATE CALL <callref>'
			// transaction. To process a transaction you have to take the following steps
			//
			// 1. Issue the command that starts a transaction. (UPDATE CALL in this case)
			// 2. Set each value that the transaction needs in order to process the request.
			//    There are various types of values that can be set in the transaction state.
			//    see the fowwling example.
			// 3. Commit the transaction. If swhd_commit returns true, the transaction was successfull
			//    and the result string can be obtained by calling swhd_getlastresponse();
			//    If the tranaction failed, call swhd_getlasterror().
			//

			if(swhd_sendcommand($con, "CLOSE CALL " . $callref))		// Start the transaction
			{

				swhd_sendnumvalue($con, "status",$status);				// Set the Status

				swhd_sendstrvalue($con, "udsource", "Web");

				swhd_sendstrvalue($con, "udcode", "Call Closure");

				swhd_sendnumvalue($con, "backdateperiod",0);	

				swhd_sendstrvalue($con, "fixcode", "");

				swhd_sendnumvalue($con, "timespent",0);

				swhd_sendboolvalue($con, "publicupdate",true);

				swhd_sendboolvalue($con, "delaycacheflush",false);

				swhd_sendnumvalue($con, "backdateperiod",0);	

				$description = rtrim($description);						// Trim any trailing newline or spaces 
				// All default values except the update text
				swhd_sendtextvalue($con, "description", $description);	// Set the prob text

				// Send Backdate Period as 0 or call action is backdated
				//swhd_sendnumvalue("backdateperiod", 0) 		
					
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
					$this->LastError = swhd_getlasterror($con);		// Get the last error
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "Command NOT sent to the helpdesk server. Check your configuration!";
				swhd_close($con);
				return FALSE;
			}
			swhd_close($con);
		}
		return FALSE;
	}


}

?>