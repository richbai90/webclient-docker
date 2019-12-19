<?php


define("CS_HDCON_OK",			33);
define('_SERVER_NAME', '127.0.0.1');

class CSwHelpdeskMail
{
	var $LastError;
	var $resultitemarray;
	var $attachmentlist;
	var $recipientlist;

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

	// class = "to", "from", "cc", "bcc"
	// transport = "inet", "local", "exchange", "notes"
	function AddRecipient($name, $address, $class = "to", $transport = "inet")
	{
		$tmp = $class . ":" . $address;
		$tmp2 = $transport . ":" . $name;
		
		$this->recipientlist[$tmp] = $tmp2;
	}


	//-- 15.04.2004
	//-- NWJ
	//-- Open the appropriate type of helpdesk connection depending on the webconnector
	function open_hd_connection($session)
	{	
		if ($session->connector_instance=="")
		{
			//-- open helpdesk conn based on sessid
			return $this->open_sesshd_connection(_SERVER_NAME,$session->sessid);
		}
		else
		{
			//-- open helpdesk conn based on selfservice web connector
			return $this->open_wchd_connection($session->server_name,$session->connector_instance);
		}
	}

	//-- 15.04.2004
	//-- NWJ
	//-- Open a sessid based help desk connection
	function open_sesshd_connection($in_servername,$in_sessid)
	{
		$hd_connection = swhd_opensession($in_servername,$in_sessid,5004);
		if($hd_connection < CS_HDCON_OK)
		{
			//-- returned a vaild hd connection
			return $hd_connection;
		}
		else
		{
			//-- invalid hd connection
			echo "Session based Helpdesk object could not be created";
			return false;
		}
	}

	//-- 15.04.2004
	//-- NWJ
	//-- Open a helpdesk session id using servername and webconnector instance
	function open_wchd_connection($in_servername,$in_instance)
	{
		$hd_connection = swhd_wcopen($in_servername, $in_instance,5004);
		if($hd_connection < CS_HDCON_OK)
		{
			//-- returned a vaild hd connection
			return $hd_connection;
		}
		else
		{
			//-- invaild hd connection
			echo "Selfservice based Helpdesk object could not be created";
			return false;
		}
	}


	function new_SendMail($session, $subject, $body, $mailbox)
	{
		if(count($this->recipientlist) == 0)
		{
			$this->LastError = "No recipients have been set for this message.";
			return FALSE;
		}

		// If the open function returns a number less than 33 (ZERO is a valid connection ID), then you
		// have estableshed a connection to the server and, logged in. If the number is greater than 32
		// then this is an error code

		// open a connection to the helpdesk server
		$con = $this->open_hd_connection($session);
		if($con < 33)
		{
			// This sends the appropriate command. In the case of a log call, this begins a 'log call'
			// transaction. To process a transaction you have to take the following steps
			//
			// 1. Issue the command that starts a transaction. (SEND in this case)
			// 2. Set each value that the transaction needs in order to process the request.
			//    There are various types of values that can be set in the transaction state.
			//    see the fowwling example.
			// 3. Commit the transaction. If swhd_commit returns true, the transaction was successfull
			//    and the result string can be obtained by calling swhd_getlastresponse();
			//    If the tranaction failed, call swhd_getlasterror().
			//
			if(swhd_sendcommand($con, "CONTEXT " . $mailbox) &&
				swhd_sendcommand($con, "SEND") &&
				swhd_sendtextvalue($con, "subject", $subject) &&
				swhd_sendtextvalue($con, "body", $body))
			{
				// Send our recipient data.
				if(count($this->recipientlist))
				{
					reset($this->recipientlist);
					while(list($key, $val) = each($this->recipientlist))
					{
						if(strlen($key))
						{
							$x = strpos($key, ":");

							$class = substr($key, 0, $x);
							$address = substr($key, $x+1);

							$x = strpos($val, ":");

							$transport = substr($val, 0, $x);
							$name = substr($val, $x+1);

							swhd_sendrecipient($con, $name, $address, $transport, $class);
						}
					}
				}

				// Send our attachment data.
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

					//-- 19.11.2004
					//-- Fix - This was not here before so after 30 connection it would fall over
					swhd_close($con);
				}
				else
				{
					// Get our last response
					$ret = swhd_getlastresponse($con);	// Get the response
					
					// Strip off the "+OK ";
					$ret = substr($ret, 4);
					$this->LastError = $ret;
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "Failed to send data to the server.";
				swhd_close($con);
				return FALSE;
			}
		}
		else
		{
			$this->LastError = "Connect failed.";
			return FALSE;
		}

		return TRUE;
	}

	function SendMail($session, $subject, $body, $mailbox)
	{
		if(count($this->recipientlist) == 0)
		{
			$this->LastError = "No recipients have been set for this message.";
			return FALSE;
		}

		// If the open function returns a number less than 33 (ZERO is a valid connection ID), then you
		// have estableshed a connection to the server and, logged in. If the number is greater than 32
		// then this is an error code

		// open a connection to the helpdesk server
		$con = swhd_wcopen($session->server_name, $session->connector_instance, 5004);

		if($con < 33)
		{
			// This sends the appropriate command. In the case of a log call, this begins a 'log call'
			// transaction. To process a transaction you have to take the following steps
			//
			// 1. Issue the command that starts a transaction. (SEND in this case)
			// 2. Set each value that the transaction needs in order to process the request.
			//    There are various types of values that can be set in the transaction state.
			//    see the fowwling example.
			// 3. Commit the transaction. If swhd_commit returns true, the transaction was successfull
			//    and the result string can be obtained by calling swhd_getlastresponse();
			//    If the tranaction failed, call swhd_getlasterror().
			//
			
			if(swhd_sendcommand($con, "CONTEXT " . $mailbox) &&
				swhd_sendcommand($con, "SEND") &&
				swhd_sendtextvalue($con, "subject", $subject) &&
				swhd_sendtextvalue($con, "body", $body))
			{
				// Send our recipient data.
				if(count($this->recipientlist))
				{
					reset($this->recipientlist);
					while(list($key, $val) = each($this->recipientlist))
					{
						if(strlen($key))
						{
							$x = strpos($key, ":");

							$class = substr($key, 0, $x);
							$address = substr($key, $x+1);

							$x = strpos($val, ":");

							$transport = substr($val, 0, $x);
							$name = substr($val, $x+1);

							swhd_sendrecipient($con, $name, $address, $transport, $class);
						}
					}
				}

				// Send our attachment data.
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

					//-- 19.11.2004
					//-- Fix - This was not here before so after 30 connection it would fall over
					swhd_close($con);
				}
				else
				{
					// Get our last response
					$ret = swhd_getlastresponse($con);	// Get the response
					
					// Strip off the "+OK ";
					$ret = substr($ret, 4);
					$this->LastError = $ret;
					swhd_close($con);
					return FALSE;
				}
			}
			else
			{
				$this->LastError = "Failed to send data to the server.";
				swhd_close($con);
				return FALSE;
			}
		}
		else
		{
			$this->LastError = "Connect failed.";
			return FALSE;
		}

		return TRUE;
	}
}
?>