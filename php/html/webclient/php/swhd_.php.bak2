<?php

	include_once('telnetclass.php');


	$__private_telnet_connection_array = Array();
	function create_and_connect_telnet($szServer, $nPort)
	{
		$con = new swhdConn($szServer, $nPort);
		if($con->connect())
		{
			global $__private_telnet_connection_array;
			$__private_telnet_connection_array[] = $con;
			return count($__private_telnet_connection_array);
		}
		else
		{
			return 0;
		}
	}
	function get_telnet_connection($nCon)
	{
		global $__private_telnet_connection_array;
		return  $__private_telnet_connection_array[$nCon-1];
	}
	
	
	function swhd_getlasterror($nCon)
	{
		global $__private_telnet_connection_array;
		return  @$__private_telnet_connection_array[$nCon-1]->errorResponse;
	}
	
	 function swhd_open($szServer, $szUser, $szPassword, $nPort = 5005)
	 {
		$nCon = create_and_connect_telnet($szServer, $nPort);
		$con = get_telnet_connection($nCon);
		if($con)
		{
			if(!$con->CheckResponse())
			{
				$con->Close();
				return 0;
			}

			if(!$con->SendCommand("USER " . $szUser))
			{
				$con->Close();
				return 0;
			}

			if(!$con->CheckResponse())
			{
				$con->Close();
				return 0;
			}

			if(!$con->SendCommand("PASS " . $szPassword))
			{
				$con->Close();
				return 0;
			}

			if(!$con->CheckResponse())
			{
				$con->Close();
				return 0;
			}
				
			return $nCon;
		}		
		return 0;
	 }
	
	
	function swhd_wcopen($szServer, $szInstance, $nPort = 5005)
	{
		$nCon = create_and_connect_telnet($szServer, $nPort);
		$con = get_telnet_connection($nCon);
		if($con)
		{
			if(!$con->SendCommand("USER " . $szInstance))
			{
				$con->Close();
				return 50001;
			}

			if(!$con->CheckResponse())
			{
				$con->Close();
				return 50002;
			}

			if(!$con->SendCommand("WEBA " . base64_encode($szPassword)))
			{
				$con->Close();
				return 50004;
			}
			return $nCon;
		}	
		return  50006;
	}
	
	function swhd_opensession($szServer, $szSessionID, $nPort = 5005)
	{
		$nCon = create_and_connect_telnet($szServer, $nPort);
		$con = get_telnet_connection($nCon);
		if($con)
		{
			//-- bind to web connector session
			if(!$con->SendCommand("WUSL " . $szSessionID))
			{
				$con->Close();
				return 0;
			}

			if(!$con->CheckResponse())
			{
				$con->Close();
				return 0;
			}


			return $nCon;
		}

		return 0;
	}

	function swhd_openasession($szServer, $szSessionID, $nPort = 5005)
	{
		$nCon = create_and_connect_telnet($szServer, $nPort);
		$con = get_telnet_connection($nCon);
		if($con)
		{
			//-- user session binding
			if(!$con->SendCommand("SESS " . $szSessionID))
			{
				$con->Close();
				return 0;
			}

			if(!$con->CheckResponse())
			{
				$con->Close();
				return 0;
			}
			return $nCon;
		}

		return 0;
	}
	
	function swhd_close($nCon)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$res = $con->Close();
			$con = null;
			$__private_telnet_connection_array[$nCon-1] = null;
			return $res;
		}
		return 0;
	}
	
	function swhd_sendcommand($nCon,$cmd)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			if(!$con->SendCommand($cmd))return FALSE;

			if(!$con->CheckResponse())return FALSE;
		
			return true;
		}	
		return false;
	}
	
	function swhd_getlastresponse($nCon)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			return $con->getLastResponse();
		}	
		return false;
	}
	
	function swhd_getlastresponsecode($nCon)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$strResponse =  explode(" ",$con->getLastResponse(),2)[0]; //--string should be something like +100 OK 
			$strResponse = str_replace(["+","-"],"",$strResponse);
			return $strResponse;  //-- so return 100 for example
		}	
		return "";
	}
	
	function swhd_getlastdata($nCon)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$strResponse = @explode(" ", $con->getLastResponse(),2)[1]; //- -string should be something like +100 OK 
			return $strResponse;  //-- so return OK
		}	
		return "";
	}	
	
	function _swhd_closesession($szServer, $szSessionID, $nPort = 5005)
	{
		$nCon = create_and_connect_telnet($szServer, $nPort);
		$con = get_telnet_connection($nCon);

		if($con)
		{
			if(!$con->SendCommand("CLOSE SESSION " . $szSessionID))
			{
				$con->Close();
				return 0;
			}

			if(!$con->CheckResponse())
			{
				$con->Close();
				return 0;
			}
			
			
			return $nCon;
		}
		return 0;
	}
	
	
	function swhd_sendstrvalue($nCon, $szItem, $szValue)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$cmd = "set " . $szItem ."; datatype=text; value=". $szValue .";";

			if(!$con->SendCommand($cmd))return FALSE;

			if(!$con->CheckResponse())return FALSE;

			return TRUE;
		}
	
		return false;
	}

	
	function swhd_sendrecipient($nCon, $szName, $szAddress, $szTransport, $szClass)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$cmd = 'SET recip; name="'.$szName.'";';
			$cmd .= ' address="'.$szAddress.'";';
			$cmd .= ' class="'.$szClass.'";';
			$cmd .= ' transport="'.$szTransport.'";';
			
			if(!$con->SendCommand($cmd))
				return FALSE;

			if(!$con->CheckResponse())
				return FALSE;
		}
		return TRUE;
	}	
	
	function swhd_sendtextvalue($nCon, $szItem, $szValue)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$nLen = strlen($szValue);
			$cmd = "set " . $szItem ."; datatype=text; size=". $nLen .";";

			if(!$con->SendCommand($cmd))return FALSE;

			if(!$con->CheckResponse())return FALSE; // Should be +OK switching to binary mode

			if($nLen)
			{
				if(!$con->Write($szValue))
				{
					$con->setLastError("+FAIL Unable to write to socket.");
					return FALSE;
				}
		
				if(!$con->CheckResponse())return FALSE;
			
			}
			
			return TRUE;
		}
		return false;
	}
	
	function swhd_sendnumvalue($nCon, $szItem, $nValue)
	{
		if(!is_numeric($nValue))
		{
			return false;
		}
	
		$con = get_telnet_connection($nCon);
		if($con)
		{
			
			$cmd = "set " . $szItem ."; datatype=number; value=". $nValue .";";

			if(!$con->SendCommand($cmd))return FALSE;

			if(!$con->CheckResponse())return FALSE;

			return TRUE;
		}
	
		return false;
	}

	

	function swhd_sendboolvalue($nCon, $szItem, $bValue)
	{
	
		if(!is_bool($bValue))
		{
			return false;
		}
	
		$con = get_telnet_connection($nCon);
		if($con)
		{
			$sValue = ($bValue)?"true":"false";
			$cmd = "set " . $szItem ."; datatype=boolean; value=". $sValue .";";

			if(!$con->SendCommand($cmd))return FALSE;

			if(!$con->CheckResponse())return FALSE;

			return TRUE;
		}
	
		return false;
	}	
	
	function swhd_sendfilevalue($nCon, $szItem, $szFileName, $szDisplayName)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			return $con->SendFile($szItem, $szDisplayName, $szFileName);
		}
		return false;
	}
	

	function swhd_commit($nCon)
	{
		$con = get_telnet_connection($nCon);
		if($con)
		{
			if(!$con->SendCommand("commit"))return FALSE;

			if(!$con->CheckResponse())return FALSE;
	
			return TRUE;
		}
		return false;
	}
	
	

class swhdConn
{
	private $telnet = null;
	private $responseBuffer = '';
	private $errorResponse = '';
	public function __construct($szServer = '127.0.0.1', $nPort = 5005) 
	{
		$this->telnet = new Telnet($szServer, $nPort,10,"\r");	 	
	}

	public function connect($szServer = '', $nPort = '')
	{
		$res = $this->telnet->connect($szServer, $nPort);
		$this->responseBuffer = $this->telnet->getGlobalBuffer();
		
		return $res;
	}

	public function setLastError($msg)
	{
		$this->errorResponse = $msg;
	}

	
	public function getLastError()
	{
		return $this->errorResponse;
	}
	public function CheckResponse()
	{
		if(strpos($this->responseBuffer,"+")===0)
		{
			return true;
		}
		else
		{
			$this->errorResponse = $this->responseBuffer;
			return false;
		}
	}
	
	public function getLastResponse()
	{
		return $this->responseBuffer;
	}
	
	public function Close()
	{
		return $this->telnet->disconnect();
	}
		
	public function  SendCommand($command)
	{
		$this->responseBuffer = $this->telnet->exec($command);
		return $this->responseBuffer;
	}

	public function  Write($buffer)
	{
		return $this->telnet->writeChunk($buffer);
	}	
 
	public function SendFile($szItem, $szDisplayName, $szSrcFileName, $szMimeType = "application/octetstream")
	{
		//--
		//-- if file is not on server
		if(file_exists ($szSrcFileName))
		{

			$szTimeStamp = date ("d/m/Y H:i", filemtime($szSrcFileName));
		
			$handle = @fopen($szSrcFileName, "r");
			if(!$handle)return false;

			
			while (($buffer = fgets($handle, 4096)) !== false) 
			{
				if(!$this->telnet->writeChunk($buffer))
				{
					fclose($handle);
					return false;
				}
			}
			fclose($handle);
		}
		else
		{
			//-- email attachment or something
			$command = 'set '.$szItem.'; datatype=sfile; path="'.$szSrcFileName.'"; displayname="'.$szDisplayName.'"; mimetype="application/octetstream";';
							
			if(!$this->SendCommand($command))
				return FALSE;

			if(!$this->CheckResponse())
				return FALSE;

			return TRUE;
		}
	}

 
 }
?>
