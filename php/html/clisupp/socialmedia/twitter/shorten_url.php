<?php
	
	include('itsm_default/xmlmc/common.php');
	include_once('../lib_json.php');
	include('clstwitter.php');
	include('clsbitly.php');
	
	function get_short_url($url)
	{
		$shorturlreq = new bitly($url);

		//if (!strlen($shorturlreq->shortURL)) dump_last_request();
		$oShortUrl = json_decode($shorturlreq->shortURL);
		if($oShortUrl->status_code != "200")
		{
			switch($oShortUrl->status_txt)
			{
				case "INVALID_LOGIN":
					$strErrorMsg="Your Bit.ly login is not valid.  Please check your Supportworks Bit.ly settings on the 'Settings->External APIs' tab.";
					break;
				case "MISSING_ARG_LOGIN":
					$strErrorMsg="Your Bit.ly Login has not been set.  Please check your Supportworks Bit.ly settings on the 'Settings->External APIs' tab.";
					break;
				case "INVALID_APIKEY":
					$strErrorMsg="Your Bit.ly Key is not valid.  Please check your Supportworks Bit.ly settings on the 'Settings->External APIs' tab.";
					break;
				case "MISSING_ARG_APIKEY":
					$strErrorMsg="Your Bit.ly Key has not been set.  Please check your Supportworks Bit.ly settings on the 'Settings->External APIs' tab.";
					break;
				case "INVALID_URI":
					$strErrorMsg="The value entered is not a valid URL. Please ensure your URL is fully formatted e.g. 'http://' ";
					break;
				default:
					$strErrorMsg="An unknown error [".$oShortUrl->status_txt."] occured when shortening the URL.  Please check your Supportworks Bit.ly settings on the 'Settings->External APIs' tab and then try again.";
					break;
			}
			
			return "SWERROR::".$strErrorMsg;
		}
		return $oShortUrl->data->url;
	}


	if(gv('longurl')!="")
	{ 
		echo get_short_url(gv('longurl'));
	}
	
	echo "";

?>