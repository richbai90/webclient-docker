<?php
$vURL = $_POST['userInput'];
    if(!isset($vURL)) throwProcessErrorWithMsg("invalid user input");
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_URL, "https://".$vURL.".signin.aws.amazon.com/");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);  
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); 
    $data = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	error_log(' '.$httpcode.' '.curl_error($ch));
    curl_close($ch);
	error_log(' '.$httpcode.' '.curl_error($ch));
    ($httpcode==404) ? throwSuccess() : throwProcessErrorWithMsg("This AWS account already exists");
?>
