<?php 
	//-- 20.09.2007 - NWJ
	//-- Called by Supportworks after an asset search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	$GLOBALS['phpprintmode'] = "1";

	//-- Include our standard include functions page
	include_once("global.settings.php");
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');

	//--error_reporting(E_ERROR | E_PARSE );

	//-- Construct a new active page session
	$session = new classActivePageSession(gv('sessid'));

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
	<?php 		exit;
	}
	$_SESSION['sessid'] = gv('sessid');

	$userdb_keysearch = gv('keysearch');

	//-- create our database connects to swdata
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());
		
	$selectme = "select * from userdb where keysearch = '" . pfs($userdb_keysearch) . "'";
	$swconn->Query($selectme);
	$rsME = $swconn->CreateRecordSet();
	if(isset($rsME)==false)$rsME = new odbcRecordsetDummy;

	//-- get active incident count
	$intIncCount = $swconn->GetRecordCount("opencall","cust_id = '" . pfs($rsME->f("keysearch")) . "' and status < 15 and  status != 6 and status != 4");

	//-- get assets linked to this customer
	$intAssetCount = $swconn->GetRecordCount("equipmnt","owner = '" . pfs($rsME->f("keysearch")) . "' ");

	
	$include_content='generic_cust.php';

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Customer Details (<?php echo $userdb_keysearch;?>)</title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
<link href="css/print_override.css" rel="stylesheet" type="text/css" />
<script src="jscript/index.js"></script>


</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>