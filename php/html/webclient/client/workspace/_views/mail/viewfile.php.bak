<?php
include("../../../../php/session.php");
error_reporting(E_ERROR);

$fileid = $_POST['filesrc'];
$mailbox = $_POST['mailbox_'];

//-- call xmlmc and store new esp token
$strxml = "<?xml version='1.0' encoding='utf-8'?><methodCall service='mail' method='getMailFileAttachment'><params><mailbox>".$mailbox."</mailbox><fileSource>".$fileid."</fileSource></params></methodCall>";
$oResult = xmlmc($portal->sw_server_ip, 5014, $_SESSION['swstate'], $strxml);
$SESSION['swstate'] = $oResult->token;

if($oResult->status!=200)
{
	echo "<script> alert('Unable to load file attachment. Please contact your administrator.<br><br>" . $oResult->status . $oResult->content ."');</script>";
	exit;
}
else
{
	if (!$dom = domxml_open_mem($oResult->content)) 
	{
	  echo "<script>alert('Unable to parse xmlmc getMailFileAttachment return content.Please Contact your administrator.');</script>";
	  exit;
	}

	$root = $dom->document_element();
	$xData = $root->get_elements_by_tagname("fileData");
	$buff = base64_decode($xData[0]->get_content());
	$xName = $root->get_elements_by_tagname("fileName");
	$filename = $xName[0]->get_content();
}


@ini_set("zlib.output_compression","Off"); # Disable PHP's output compression
ob_end_clean(); # We need to clean all possible output data before reading the file

// Set the correct headers
//header ("200 HTTP/1.0 OK"); # Force the answer to be HTTP/1.0 compatible
header("Pragma: public");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Content-Type: " . returnMIMEType($filename));
header('Content-Disposition: attachment; filename="'.$filename.'"');
echo $buff; 
exit(0);
?>