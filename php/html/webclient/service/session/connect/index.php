<?php

	//-- 23.10.2009 - connect analyst session
	//-- expects :-
	//--			analystid:
	//--			password :


	//-- includes
	include_once("../../../php/_wcconfig.php");
	include('php5requirements.php');
	


	//-- xmlmc api functions
	//--
	if(!function_exists("xmlmc"))
	{
		function fwrite_stream($fp, $string)
		{
			for($written = 0; $written < strlen($string); $written += $fwrite)
			{
				$fwrite = fwrite($fp, substr($string, $written));
				if(!$fwrite)
				{
					return $fwrite;
				}
			}
			return $written;
		}

		function xmlmc($host, $port, $espToken, $xmlmc)
		{

			$errNo  = NULL;
			$errStr = NULL;
			if(($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE)
			{
				return FALSE;
			}    

			$httpPort = 

			$request = array(
						'POST /xmlmc HTTP/1.1',
						'Host: '.$host,
						'User-Agent: Hornbill PHP',
						'Connection: close',
						'Cache-Control: no-cache',
						'Accept: text/xmlmc',
						'Accept-Charset: utf-8',
						'Accept-Language: en-GB',
						'Cookie: ESPSessionState='.$espToken,
						'Content-Type: text/xmlmc; charset=utf-8',
						'Content-Length: '.strlen($xmlmc),
					   );

			$request = implode("\r\n", $request)
					 . "\r\n\r\n"
					 . $xmlmc;
					 
			fwrite_stream($fp, $request);
			$resCode   = NULL;
			$headers   = NULL;
			$content   = NULL;
			$newToken  = $espToken;
			$inContent = FALSE;
			while(!feof($fp))
			{
				if($inContent)
				{
					$content .= fread($fp, 8192);
				}
				else
				{
					$headers .= fread($fp, 8192);
					if($resCode === NULL && strlen($headers) >= 13)
					{
						if(!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13)))
						{
							fclose($fp);
							// Invalid http response
							return FALSE;
						}
						$resCode = (integer) substr($headers, 9, 3);
					}
					if(($eoh = strpos($headers, "\r\n\r\n")) !== FALSE)
					{
						$content = (string) substr($headers, $eoh + 4);
						$headers = substr($headers, 0, $eoh);
						if(preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts))
						{
							$newToken = $parts[1];
						}
						$headers   = explode("\r\n", $headers);
						$inContent = TRUE;
						array_shift($headers);
					}
				}
			}
			fclose($fp);
			$o          = new StdClass();
			#$o->request = $request;
			$o->token   = $newToken;
			$o->status  = $resCode;
			$o->headers = $headers;
			$o->content = $content;
			$o->xmldom = domxml_open_mem($content);
			return $o;
		}  
	}

	//-- call xmlmc to login
	$xLogin        = '<?xml version="1.0" encoding="utf-8"?><methodCall service="session" method="analystLogon"><params><userId>'.utf8_encode(base64_decode($_POST['_p1'])).'</userId><password>'.$_POST['_p2'].'</password></params></methodCall>';
	$loginResult   = xmlmc(_SERVER_NAME, 5015, NULL, $xLogin);
	if($loginResult==FALSE)
	{
		echo "Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.";
		exit;
	}


	if($loginResult->status!=200)
	{
		//-- some http error has occured
		echo $loginResult->status;
		exit;
	}
	
	//-- get result - convert string to xmldom
	$root = $loginResult->xmldom->document_element();
	$echoResult = $root->get_attribute('status'); 


	if(strToLower($echoResult) == "ok")
	{		
		//-- get analysts session id and store esp state
		$tag = $root->get_elements_by_tagname("SessionID");
		session_start();
		session_unset(); //-- remove any session vars
		session_regenerate_id();
		setcookie(session_name(), session_id(), 0, '/',"; HttpOnly",(@$_SERVER["HTTPS"]=="on"));		

		//-- 14.05.2012 - 88292
		//-- set session token that client must submit as part of any request to prevent CSRF
		$sessiontoken =  sha1(uniqid(mt_rand(), true));
		$_SESSION['clienttoken']=$sessiontoken;
		header('Webclient-token:'.$sessiontoken,true);
		//-- eof 88292

		//-- 18.05.2012 - 88291 - to help prevent session fixation - store some info about where login came from
		$_SESSION['PREV_USERAGENT'] = $_SERVER['HTTP_USER_AGENT'];
		$_SESSION['PREV_REMOTEADDR'] = $_SERVER['REMOTE_ADDR'];
		$_SESSION['SERVER_GENERATEDSID'] = true;


		$_SESSION['swstate'] = $loginResult->token;
		$_SESSION['swsession'] = $tag[0]->get_content();
		echo "OK:";
	}
	else
	{
		$tag= $root->get_elements_by_tagname("error");
		echo $tag[0]->get_content();
	}
	exit(0);
?>
