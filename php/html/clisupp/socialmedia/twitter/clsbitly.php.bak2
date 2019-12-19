<?php
session_start();
$_SESSION['portalmode'] = "FATCLIENT";
include_once('itsm_default/xmlmc/common.php');
include_once('../lib_json.php');
include_once('stdinclude.php');						//-- standard functions
include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class

class bitly
{
	var $shortURL="";
	var $bitly_api_url=null;
	var $bitly_api_format=null;
	var $bitly_login=null;
	var $bitly_api_key=null;
	function bitly($url)
	{
		$this->loadApiSettings();
		$bitlyURL = $this->bitly_api_url."shorten?format=".$this->bitly_api_format."&login=".$this->bitly_login."&apiKey=".$this->bitly_api_key."&longUrl=".urlencode($url);
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:')); 	// Get around error 417
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		curl_setopt($ch, CURLOPT_URL, $bitlyURL);
				
		$response = curl_exec($ch);
		$headers = curl_getinfo($ch);

		curl_close($ch);

		if ($headers['http_code'] != "200"){
			return $headers;
		}

		$this->shortURL = $response;
	}

	function loadApiSettings()
	{
		//-- Get Bit.ly credentials
		$swconn = new CSwDbConnection();
		$swconn->Connect(swdsn(), swuid(), swpwd());
		$rsBitlySettings = $swconn->Query("select * from socmed_tp_api_keys where api_name='bit.ly'",true);
		if(($rsBitlySettings!=false)&&(!$rsBitlySettings->eof))
		{
			$this->bitly_login=$rsBitlySettings->f('api_login');
			$this->bitly_api_key=$rsBitlySettings->f('api_key');
			$this->bitly_api_url=$rsBitlySettings->f('api_url');
			$this->bitly_api_format=$rsBitlySettings->f('api_format');
		}

	}
}


?>