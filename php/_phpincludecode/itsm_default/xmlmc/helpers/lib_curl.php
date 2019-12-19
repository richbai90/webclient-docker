<?php




function api_http_request($url, $method="GET", $postdata=null){

		$ch = curl_init();

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:')); 	// Get around error 417
		//curl_setopt(CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded; charset=iso-8859-1','Expect:'));
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_TIMEOUT, $GLOBALS[oauth_http_timeout]);

		if ($method == 'GET'){
			# nothing special for GETs
		}else if ($method == 'POST'){
			curl_setopt($ch, CURLOPT_POST, TRUE);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
		}else{
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		}
		
		$response = curl_exec($ch);
		$headers = curl_getinfo($ch);

		curl_close($ch);

		/*$GLOBALS[oauth_last_request] = array(
			'request'	=> array(
				'url'		=> $url,
				'method'	=> $method,
				'postdata'	=> $postdata,
			),
			'headers'	=> $headers,
			'body'		=> $response,
		);*/

	  
		if (($headers['http_code'] != "200") && ($headers['http_code'] != "302")){
			return '';
		}

		return $response;
}


?>