<?php

	# Need to use external JSON encode/decode library for our pre PHP 5.2 platform
	# see http://pear.php.net/pepr/pepr-proposal-show.php?id=198

	if (!function_exists('json_decode')) { 
		function json_decode($content, $assoc=false) 
		{ 
			require_once '../libs/JSON.php'; 
			if ($assoc) 
			{ 
				$json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);
			} 
			else 
			{ 
				$json = new Services_JSON; 
			} 
			return $json->decode($content); 
		} 
	} 
	
	if (!function_exists('json_encode')) 
	{ 
		function json_encode($content) 
		{ 
			require_once '../libs/JSON.php'; 
			$json = new Services_JSON; 
			return $json->encode($content); 
		} 
	}

?>