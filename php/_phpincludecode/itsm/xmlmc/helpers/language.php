<?php

//-- 2.4 encode web content
function lang_encode_from_utf($strValue)
{
	if(function_exists("iconv"))
		return iconv('UTF-8','Windows-1252',$strValue);
	return $strValue;
}

function lang_decode_to_utf($strValue)
{
	if(function_exists("iconv"))
		return iconv('Windows-1252','UTF-8',$strValue);
	return $strValue;
}

?>