<?php
//-- Get URL Params
$serverIP = $GLOBALS['srvip'];
$swsessionid = $GLOBALS['sessid'];
$docref = $GLOBALS['docref'];

session_start();
$_SESSION['portalmode'] = "FATCLIENT";

include('stdinclude.php');
include('itsm_default/xmlmc/common.php');

include_once('itsm_default/xmlmc/classactivepagesession.php');
$session = new classActivePageSession($swsessionid);
//-- Initialise the session
if(!$session->IsValidSession())
{
?>
	<html>
		<head>
			<meta http-equiv="Pragma" content="no-cache">
			<meta http-equiv="Expires" content="-1">
			<title>Support-Works Session Authentication Failure</title>
				<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
		</head>
			<body>
				<br><br>
				<center>
					<span class="error">
						There has been a session authentication error<br>
						Please contact your system administrator.
					</span>
				</center>
			</body>
	</html>
<?php
	exit;
}
//-- KB Class
include('itsm_default/xmlmc/classknowledgebase.php');
//-- Create a new KnowledgeBase access class
$kb = new CSwKnowldgeBaseAccess;
$boolAnalyst = true;
if($kb->ConnectToKbApi($_SERVER['SERVER_ADDR'],$swsessionid,$boolAnalyst))
{
	//-- Got Connection to API
	$kb->GetDocumentURL($docref, $docurl, $serverIP);
	//-- nwj 20.03.2009 - ensure we use sw server path if it is an external kb document
	$strUseIP = $serverIP;
	if(strpos($docurl,"&[app.webroot]")!==false || strpos($docurl,"&[app.server]")!==false) // CB 2010.05.21
	{
		if(strtolower($this->servername)=="localhost" || strtolower($this->servername)=="127.0.0.1")
		{
			//-- using localhost as sw server so need to get actual ip address
			$strUseIP = $_SERVER['SERVER_ADDR']; 
		}
	}

	//-- We currently hard-code the instance ID at the moment '/sw'
	//-- nwj 15.05.2008 bug 68781 - ensure we use port setting of the server
	$docurl = str_replace("&[app.webroot]", "http://" . $strUseIP . ":" . $_SERVER['SERVER_PORT'] ."/sw", $docurl);

	//-- CB 2010.05.20 - new documentation typically has this url: http://&[app.server]/documentation/ ...
	//   so we want to expand this variable as well.
	$docurl = str_replace("&[app.server]", $strUseIP . ":" . $_SERVER['SERVER_PORT'], $docurl);
					
	// sandra 10/08/2007 Bug 39972 - check if browser in ssl mode
	if ($_SERVER['HTTPS'] =="on") $docurl=str_replace("http://","https://", $docurl);
	//end sandra

	// Get rid of the sessionid, it is not needed in the web connector
	//if(strpos($docurl, "sessid="))
	//{
//		$docurl = substr($docurl, 0, strpos($docurl, "sessid=")-1);
	//}

	//-- swap out \ with / (firefox fix 78242)
	$strLoc = str_replace("\\", "/",$docurl);
	//-- 03.08.2009 - use iframe to load url
	echo '<html><body style="padding:0; margin:0;overflow:hidden;"><iframe src="'.$strLoc.'" frameborder="0" style="width:100%;height:100%;"></iframe></body></html>';
	exit(0);

$kb->CloseKbApi();
}

?>