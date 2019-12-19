<?php

$strCustId = strtolower(trim($session->selfServiceCustomerId));
$strInstanceID = $session->analystId;
$intCustWebflag = $session->selfServiceWebFlags;
$strWssCustId = strtolower(trim($_POST['custid']));

if(!isset($_POST['callref']) ||$_POST['callref']==="") {
  throwSuccess();
}

if(!isset($_POST['dataid']) ||$_POST['dataid']==="") {
  throwSuccess();
}

$intCallref = $_POST['callref'];
$intDataId = $_POST['dataid'];
$strFilename = $_POST['filename'];
if(!_validate_url_param($intCallref,"num") || !_validate_url_param($intDataId,"num") || !_validate_url_param($strFilename, "sqlparamstrict")) {
  echo generateCustomErrorString("-303","Failed to process Call Attachment Request. SQL Injection Detected. Please contact your Administrator.");
  exit(0);
}

//Check if customer is allowed to view this request
IncludeApplicationPhpFile("itsm.helpers.php");
$canSeeCall = wssRequestAccess($strInstanceID, $strCustId, $strWssCustId, $intCallref, $intCustWebflag);
if($canSeeCall != "") {
  echo generateCustomErrorString("-303","Request Verification Error: ".$canSeeCall);
  exit(0);
}

$path = sw_getcfgstring("Database\\CFAStore")."\\";
$filestore = (sprintf("%08d",$intCallref)).'.'.(sprintf("%03d",$intDataId));
$dirstore = substr(sprintf("%04d",($intCallref/1000)),0,4);
$filestore = 'f'.$filestore;
$path = $path.$dirstore."\\".$filestore;

$url = $strFilename;

$strContentType = "";
//-- if the file is a not html, change the mime type, based on file extension
$fileExtension = substr($url,(strlen($url)-4),4);
switch ($fileExtension)
{
	case ".doc":
		$strContentType = 'application/msword';
	break;

	case "docx":
		$strContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
	break;

	case "acgi":
		$strContentType = 'text/html';
	break;

	case ".afl":
		$strContentType = 'video/animaflex';
	break;

	case ".aif":
		$strContentType = 'audio/aiff';
	break;

	case "aifc":
		$strContentType = 'audio/aiff';
	break;

	case "aiff":
		$strContentType = 'audio/aiff';
	break;

	case ".aim":
		$strContentType = 'application/x-aim';
	break;

	case ".aps":
		$strContentType = 'application/mime';
	break;

	case ".arc":
		$strContentType = 'application/octet-stream';
	break;

	case ".art":
		$strContentType = 'image/x-jg';
	break;

	case ".asf":
		$strContentType = 'video/x-ms-asf';
	break;

	case ".asm":
		$strContentType = 'text/x-asm';
	break;

	case ".asp":
		$strContentType = 'text/asp';
	break;

	case ".asx":
		$strContentType = 'video/x-ms-asf-plugin';
	break;

	case ".avi":
		$strContentType = 'video/avi';
	break;

	case ".avs":
		$strContentType = 'video/avs-video';
	break;

	case ".bin":
		$strContentType = 'application/mac-binary';
	break;

	case ".bmp":
		$strContentType = 'image/bmp';
	break;

	case ".boo":
		$strContentType = 'application/book';
	break;

	case "book":
		$strContentType = 'application/book';
	break;

	case ".boz":
		$strContentType = 'application/x-bzip2';
	break;

	case ".bsh":
		$strContentType = 'application/x-bsh';
	break;

	case ".bz2":
		$strContentType = 'application/x-bzip2';
	break;

	case ".c++":
		$strContentType = 'text/plain';
	break;

	case ".cha":
		$strContentType = 'application/x-chat';
	break;

	case "chat":
		$strContentType = 'application/x-chat';
	break;

	case "lass":
		$strContentType = 'application/java';
	break;

	case ".com":
		$strContentType = 'text/plain';
	break;

	case "conf":
		$strContentType = 'text/plain';
	break;

	case ".cpp":
		$strContentType = 'text/x-c';
	break;

	case ".cpt":
		$strContentType = 'application/x-compactpro';
	break;

	case ".csh":
		$strContentType = 'application/x-csh';
	break;

	case ".css":
		$strContentType = 'text/css';
	break;

	case ".dir":
		$strContentType = 'application/x-director';
	break;

	case ".dot":
		$strContentType = 'application/msword';
	break;

	case ".drw":
		$strContentType = 'application/drafting';
	break;

	case "dump":
		$strContentType = 'application/octet-stream';
	break;

	case ".dvi":
		$strContentType = 'application/x-dvi';
	break;

	case ".dwf":
		$strContentType = 'model/vnd.dwf';
	break;

	case ".dwg":
		$strContentType = 'application/acad';
	break;

	case ".dxr":
		$strContentType = 'application/x-director';
	break;

	case ".eps":
		$strContentType = 'application/postscript';
	break;

	case ".exe":
		$strContentType = 'application/octet-stream';
	break;

	case ".fif":
		$strContentType = 'application/fractals';
	break;

	case ".fli":
		$strContentType = 'video/fli';
	break;

	case ".for":
		$strContentType = 'text/plain';
	break;

	case ".fpx":
		$strContentType = 'image/vnd.fpx';
	break;

	case "funk":
		$strContentType = 'audio/make';
	break;

	case ".gif":
		$strContentType = 'image/gif';
	break;

	case ".gsd":
		$strContentType = 'audio/x-gsm';
	break;

	case ".gsm":
		$strContentType = 'audio/x-gsm';
	break;

	case "help":
		$strContentType = 'application/x-helpfile';
	break;

	case ".hlp":
		$strContentType = 'application/x-helpfile';
	break;

	case ".hqx":
		$strContentType = 'application/binhex';
	break;

	case ".htm":
		$strContentType = 'text/html';
	break;

	case "html":
		$strContentType = 'text/html';
	break;

	case ".htt":
		$strContentType = 'text/webviewhtml';
	break;

	case ".htx":
		$strContentType = 'text/html';
	break;

	case ".ico":
		$strContentType = 'image/x-icon';
	break;

	case ".idc":
		$strContentType = 'text/plain';
	break;

	case ".ief":
		$strContentType = 'image/ief';
	break;

	case "iefs":
		$strContentType = 'image/ief';
	break;

	case "imap":
		$strContentType = 'x-httpd-imap';
	break;

	case ".isu":
		$strContentType = 'video/x-isvideo';
	break;

	case ".jam":
		$strContentType = 'audio/x-jam';
	break;

	case ".jav":
		$strContentType = 'text/plain';
	break;

	case "java":
		$strContentType = 'text/x-java-source';
	break;

	case ".jcm":
		$strContentType = 'application/x-java-commerce';
	break;

	case "jfif":
		$strContentType = 'image/jpeg';
	break;

	case ".jpe":
		$strContentType = 'image/jpeg';
	break;

	case "jpeg":
		$strContentType = 'image/jpeg';
	break;

	case ".jpg":
		$strContentType = 'image/jpeg';
	break;

	case ".jps":
		$strContentType = 'image/x-jps';
	break;

	case ".kar":
		$strContentType = 'audio/midi';
	break;

	case ".lam":
		$strContentType = 'audio/x-liveaudio';
	break;

	case "list":
		$strContentType = 'text/plain';
	break;

	case ".lma":
		$strContentType = 'audio/nspaudio';
	break;

	case ".log":
		$strContentType = 'text/plain';
	break;

	case ".m1v":
		$strContentType = 'video/mpeg';
	break;

	case ".m2a":
		$strContentType = 'video/mpeg';
	break;

	case ".m2v":
		$strContentType = 'video/mpeg';
	break;

	case ".m3u":
		$strContentType = 'audio/x-mpequrl';
	break;

	case ".map":
		$strContentType = 'application/x-navimap';
	break;

	case ".mcd":
		$strContentType = 'application/mcad';
	break;

	case ".mcf":
		$strContentType = 'image/vasa';
	break;

	case ".mid":
		$strContentType = 'audio/midi';
	break;

	case "midi":
		$strContentType = 'audio/midi';
	break;

	case "mime":
		$strContentType = 'www/mime';
	break;

	case "mjpg":
		$strContentType = 'video/x-motion-jpeg';
	break;

	case ".mod":
		$strContentType = 'audio/mod';
	break;

	case "moov":
		$strContentType = 'video/quicktime';
	break;

	case ".mov":
		$strContentType = 'video/quicktime';
	break;

	case ".mp2":
		$strContentType = 'audio/mpeg';
	break;

	case ".mp3":
		$strContentType = 'audio/mpeg3';
	break;

	case ".mpa":
		$strContentType = 'audio/mpeg';
	break;

	case ".mpe":
		$strContentType = 'video/mpeg';
	break;

	case "mpeg":
		$strContentType = 'video/mpeg';
	break;

	case ".mpg":
		$strContentType = 'audio/mpeg';
	break;

	case "mpga":
		$strContentType = 'audio/mpeg';
	break;

	case ".mpp":
		$strContentType = 'application/vnd.ms-project';
	break;

	case ".nif":
		$strContentType = 'image/x-niff';
	break;

	case "niff":
		$strContentType = 'image/x-niff';
	break;

	case ".oda":
		$strContentType = 'application/oda';
	break;

	case ".pas":
		$strContentType = 'text/pascal';
	break;

	case ".pbm":
		$strContentType = 'image/x-portable-bitmap';
	break;

	case ".pct":
		$strContentType = 'image/x-pict';
	break;

	case ".pcx":
		$strContentType = 'image/x-pcx';
	break;

	case ".pdf":
		$strContentType = 'application/pdf';
	break;

	case ".pgm":
		$strContentType = 'image/x-portable-graymap';
	break;

	case ".pic":
		$strContentType = 'image/pict';
	break;

	case "pict":
		$strContentType = 'image/pict';
	break;

	case ".png":
		$strContentType = 'image/png';
	break;

	case ".pot":
		$strContentType = 'application/mspowerpoint';
	break;

	case ".ppa":
		$strContentType = 'application/vnd.ms-powerpoint';
	break;

	case ".ppm":
		$strContentType = 'image/x-portable-pixmap';
	break;

	case ".pps":
		$strContentType = 'application/mspowerpoint';
	break;

	case ".ppt":
		$strContentType = 'application/mspowerpoint';
	break;

	case ".psd":
		$strContentType = 'application/octet-stream';
	break;

	case ".qif":
		$strContentType = 'image/x-quicktime';
	break;

	case ".qtc":
		$strContentType = 'video/x-qtc';
	break;

	case ".qti":
		$strContentType = 'image/x-quicktime';
	break;

	case "qtif":
		$strContentType = 'image/x-quicktime';
	break;

	case ".ram":
		$strContentType = 'audio/x-pn-realaudio';
	break;

	case ".rgb":
		$strContentType = 'image/x-rgb';
	break;

	case ".rmi":
		$strContentType = 'audio/mid';
	break;

	case ".rmm":
		$strContentType = 'audio/x-pn-realaudio';
	break;

	case ".rmp":
		$strContentType = 'audio/x-pn-realaudio';
	break;

	case ".rnx":
		$strContentType = 'application/vnd.rn-realplayer';
	break;

	case ".rpm":
		$strContentType = 'audio/x-pn-realaudio-plugin';
	break;

	case ".rtf":
		$strContentType = 'application/msword';
	break;

	case ".rtx":
		$strContentType = 'application/msword';
	break;

	case ".s3m":
		$strContentType = 'audio/s3m';
	break;

	case ".sea":
		$strContentType = 'application/sea';
	break;

	case "sgml":
		$strContentType = 'text/sgml';
	break;

	case ".sit":
		$strContentType = 'application/x-stuffit';
	break;

	case ".smi":
		$strContentType = 'application/smil';
	break;

	case "smil":
		$strContentType = 'application/smil';
	break;

	case ".snd":
		$strContentType = 'audio/basic';
	break;

	case ".src":
		$strContentType = 'application/x-wais-source';
	break;

	case ".ssi":
		$strContentType = 'text/x-server-parsed-html';
	break;

	case ".ssm":
		$strContentType = 'application/streamingmedia';
	break;

	case ".svf":
		$strContentType = 'image/x-dwg';
	break;

	case ".swf":
		$strContentType = 'application/x-shockwave-flash';
	break;

	case "talk":
		$strContentType = 'text/x-speech';
	break;

	case ".tar":
		$strContentType = 'application/x-tar';
	break;

	case "text":
		$strContentType = 'text/plain';
	break;

	case ".tif":
		$strContentType = 'image/tiff';
	break;

	case "tiff":
		$strContentType = 'image/tiff';
	break;

	case ".tsi":
		$strContentType = 'audio/tsp-audio';
	break;

	case ".tsp":
		$strContentType = 'audio/tsplayer';
	break;

	case ".tsv":
		$strContentType = 'text/tab-saparated-values';
	break;

	case ".txt":
		$strContentType = 'text/plain';
	break;

	case ".uue":
		$strContentType = 'text-uuencode';
	break;

	case ".vdo":
		$strContentType = 'video/vdo';
	break;

	case ".viv":
		$strContentType = 'video/vivo';
	break;

	case "vivo":
		$strContentType = 'video/vivo';
	break;

	case ".voc":
		$strContentType = 'audio/x-voc';
	break;

	case ".vos":
		$strContentType = 'video/vosaic';
	break;

	case ".vox":
		$strContentType = 'audio/voxware';
	break;

	case "vrml":
		$strContentType = 'application/x-vrml';
	break;

	case ".w60":
		$strContentType = 'application/wordperfect6.0';
	break;

	case ".w61":
		$strContentType = 'application/wordperfect6.1';
	break;

	case "w6w":
		$strContentType = 'application/msword';
	break;

	case ".wav":
		$strContentType = 'audio/wav';
	break;

	case ".wiz":
		$strContentType = 'application/msword';
	break;

	case ".wmf":
		$strContentType = 'windows/metafile';
	break;

	case "word":
		$strContentType = 'application/msword';
	break;

	case ".wp5":
		$strContentType = 'application/wordperfect';
	break;

	case ".wp6":
		$strContentType = 'application/wordperfect';
	break;

	case ".wpd":
		$strContentType = 'application/wordperfect';
	break;

	case ".wri":
		$strContentType = 'application/mswrite';
	break;

	case ".xbm":
		$strContentType = 'image/x-xbitmap';
	break;

	case ".xif":
		$strContentType = 'image/vnd.xiff';
	break;

	case ".xla":
		$strContentType = 'application/excel';
	break;

	case ".xlb":
		$strContentType = 'application/excel';
	break;

	case ".xlc":
		$strContentType = 'application/excel';
	break;

	case ".xld":
		$strContentType = 'application/excel';
	break;

	case ".xlk":
		$strContentType = 'application/excel';
	break;

	case ".xll":
		$strContentType = 'application/excel';
	break;

	case ".xlm":
		$strContentType = 'application/excel';
	break;

	case ".xls":
		$strContentType = 'application/vnd.ms-excel';
	break;

	case ".xlt":
		$strContentType = 'application/excel';
	break;

	case ".xlv":
		$strContentType = 'application/excel';
	break;

	case ".xlw":
		$strContentType = 'application/excel';
	break;

	case ".xml":
		$strContentType = 'application/xml';
	break;

	case ".xmz":
		$strContentType = 'xgl/movie';
	break;

	case ".xpm":
		$strContentType = 'image/xpm';
	break;

	case "-png":
		$strContentType = 'image/png';
	break;

	case ".zip":
		$strContentType = 'application/x-compressed';
	break;

	case "doc":
		$strContentType = 'application/msword';
	break;

	case "doc":
		$strContentType = 'application/msword';
	break;
}

//check the few two-letter extensions
$fileExtension = substr($url,(strlen($url)-3),3);
switch ($fileExtension) {
	case ".ai":
		$strContentType = 'application/postscript';
 		break;

	case ".au":
		$strContentType = 'audio/basic';
 		break;

	case ".bm":
		$strContentType = 'image/bmp';
 		break;

	case ".bz":
		$strContentType = 'application/b-zip';
 		break;

	case ".cc":
		$strContentType = 'text/plain';
 		break;

	case ".dl":
		$strContentType = 'video/dl';
 		break;

	case ".dv":
		$strContentType = 'video/x-dv';
 		break;

	case ".gl":
		$strContentType = 'video/gl';
 		break;

	case ".it":
		$strContentType = 'audio/it';
 		break;

	case ".js":
		$strContentType = 'application/x-javascript';
 		break;

	case ".rt":
		$strContentType = 'text/richtext';
 		break;

	case ".rv":
		$strContentType = 'video/vnd.rn-realvideo';
 		break;

	case ".ps":
		$strContentType = 'application/postscript';
 		break;

	case ".qt":
		$strContentType = 'video/quicktime';
 		break;

	case ".ra":
		$strContentType = 'audio/x-pn-realaudio';
 		break;

	case ".rf":
		$strContentType = 'image/vnd.rn-realflash';
 		break;

	case ".rm":
		$strContentType = 'application/vnd.rn-realmedia';
 		break;

	case ".wp":
		$strContentType = 'application/wordperfect';
 		break;

	case ".uu":
		$strContentType = 'application/octet-stream';
 		break;

	case ".xm":
		$strContentType = 'audio/xm';
 		break;

	case ".xl":
		$strContentType = 'application/excel';
 		break;
}
//-- if no content type set it to binary
if($strContentType=="")$strContentType = 'application/octet-stream';


$path = preg_replace("/&{1}$/","",$path);
$handle = fopen($path, "rb");
$contents = fread($handle, filesize($path));
fclose($handle);
$b64Contents = base64_encode($contents);
$strReturn = $strContentType."||".$b64Contents;
throwProcessSuccessWithResponse($strReturn);
