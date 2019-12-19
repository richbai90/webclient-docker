<?php
error_reporting(E_ALL);
$strCustId = strtolower(trim($session->selfServiceCustomerId));
$strInstanceID = $session->analystId;
$intCustWebflag = $session->selfServiceWebFlags;
$strWssCustId = strtolower(trim($_POST['custid']));
$aid = strtolower(trim($_POST['aid']));
$strReturn = "";
error_log("hello");

if(!isset($_POST['callref']) ||$_POST['callref']==="") {
  throwSuccess();
}

if(!isset($_POST['data']) ||$_POST['data']==="") {
  throwSuccess();
}

$intCallref = $_POST['callref'];
$data = json_decode($_POST['data']);

if(!isset($data)) {
	throwSuccess();
}

// if(!_validate_url_param($intCallref,"num") || !_validate_url_param($intDataId,"num") || !_validate_url_param($strFilename, "sqlparamstrict")) {
//  echo generateCustomErrorString("-303","Failed to process Call Attachment Request. SQL Injection Detected. Please contact your Administrator.");
//  exit(0);
// }

//Check if customer is allowed to view this request
IncludeApplicationPhpFile("itsm.helpers.php");
$canSeeCall = wssRequestAccess($strInstanceID, $strCustId, $strWssCustId, $intCallref, $intCustWebflag, $aid);
if($canSeeCall != "") {
  echo generateCustomErrorString("-303","Request Verification Error: ".$canSeeCall);
  exit(0);
}

$zipname = time() * rand(1, 1300) .  '-attachments.zip';
error_log($zipname);
$zip = new ZipArchive;
$zip->open($zipname, ZipArchive::CREATE);

foreach($data as $strFilename => $intDataId) {

$path = sw_getcfgstring("Database\\CFAStore")."\\";
$filestore = (sprintf("%08d",$intCallref)).'.'.(sprintf("%03d",$intDataId));
$dirstore = substr(sprintf("%04d",($intCallref/1000)),0,4);
$filestore = 'f'.$filestore;
$path = $path.$dirstore."\\".$filestore;

$url = $strFilename;

$strContentType = "";
//-- if the file is a not html, change the mime type, based on file extension
$fileExtension = substr($url,(strlen($url)-4),4);


$path = preg_replace("/&{1}$/","",$path);
if(file_exists($path)){
  $zip->addFromString(basename($strFilename),  file_get_contents($path));  
}
}

$zip->close();
$strContentType = 'application/x-compressed';

$handle = fopen($zipname, "rb");
$contents = fread($handle, filesize($zipname));

fclose($handle);
unlink($zipname);
$b64Contents = base64_encode($contents);
$strReturn = $strContentType."||".$b64Contents;


throwProcessSuccessWithResponse($strReturn);
