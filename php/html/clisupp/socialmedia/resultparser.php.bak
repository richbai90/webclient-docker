<?php

function getResultVar($output, $data, $tagname)
{
	$var="";
	if($output=='xml')
	{
		$xmlDoc = domxml_open_mem($data);
		if($xmlDoc) $root = $xmlDoc->document_element();
		$node = $root->get_elements_by_tagname($tagname);
		if($node) $var = $node[0]->get_content();
		
	}
	return $var;
}

function getTwitterAvatarImageURL($screen_name, $size="normal")
{
	//Request Screen Image URL from API and break up to retrieve URL
	$strImgUrl="";
	$retuser = oauth_request($keys, "https://api.twitter.com/1.1/users/profile_image/".$screen_name.".json");
	if (!strlen($retuser)) dump_last_request();
	$arrImgRedirectHtml = explode('http://',htmlentities($retuser));
	$arrImgRedirectHtml = explode('redirected',$arrImgRedirectHtml[1]);
	$strImgRedirectURL = substr($arrImgRedirectHtml[0],0,strlen($arrImgRedirectHtml[0])-10);
	$strImgRedirectURL = "http://".$strImgRedirectURL;

	//-- If using a default twitter profile image no original exists, so return bigger size image instead
	if((substr(basename($strImgRedirectURL),0,16)=="default_profile_") && ($size=="original"))
		$size = "bigger";
	
	//-- Get Larger (73*73) Size Avatar Image
	if($strImgRedirectURL!="")
	{
		$url = $strImgRedirectURL;
		$ext = strrchr($url, '.');
		switch($size)
		{
			case "mini":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_mini" . $ext;
				break;
			case "normal":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_normal" . $ext;
				break;
			case "bigger":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_bigger" . $ext;
				break;
			case "original":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . $ext;
				break;
			default:
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_normal" . $ext;
				break;
		}
	}

	return $strImgUrl;
}


?>