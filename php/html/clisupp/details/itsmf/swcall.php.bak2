<?php 	//-- 20.09.2007 - NWJ
	//-- Called by Supportworks after a call search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	include_once("global.settings.php");
	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/common.php');

	//	error_reporting(E_ERROR | E_PARSE );

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
	//-- get callref
	$callref = gv('callref');
	if($callref =="") $callref = gv('CALLREF');

	//-- create our database connects to swdata and systemdb
	$swconn = new CSwDbConnection();
	if(!$swconn->Connect(swdsn(), swuid(), swpwd()))
	{
		echo "Failed to connect to ".swdsn().". Please contact your Administrator";
		exit;
	}

	$sysconn = new CSwLocalDbConnection();
	$sysconn->SwCacheConnect();
	$sysconn->LoadDataDictionary($dd);

	if(!regex_match("/^[0-9]*$/",$callref))
	{
		//-- call not found ?? in theory should never happen
		?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Call Search Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br></br>
					<center>
					<span class="error">
						A submitted variable was identified as a possible security threat.<br> 
						Please contact your system Administrator.
					</span>
					</center>
				</body>
		</html>
		<?php 		exit;
	}

	//-- try get call from cache
	$sysconn->Query("SELECT * FROM opencall where callref = ".PrepareForSql($callref));
	$rsCall = $sysconn->CreateRecordSet();
	if((!$rsCall)||($rsCall->eof))
	{
		//-- failed to get call from cache so get it from swdata
		$swconn->Query("SELECT * FROM opencall where callref = ".PrepareForSql($callref));
		$rsCall = $swconn->CreateRecordSet();
		if((!$rsCall)||($rsCall->eof))
		{
			//-- call not found ?? in theory should never happen
			?>
			<html>
				<head>
					<meta http-equiv="Pragma" content="no-cache">
					<meta http-equiv="Expires" content="-1">
					<title>Support-Works Call Search Failure</title>
						<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
				</head>
					<body>
						<br><br>
						<center>
						<span class="error">
							The Supportworks record could not be found<br>
							Please contact your system administrator.
						</span>
						</center>
					</body>
			</html>
			<?php 			exit;
		}
	}

	//-- if cust_id is not empty load userdb record
	if($rsCall->f("cust_id")!="")
	{
		$selcust = "select * from userdb where keysearch = '" . pfs($rsCall->f("cust_id")) . "'";
		$swconn->Query($selcust);
		$rsCust = $swconn->CreateRecordSet();
	}
	if(isset($rsCust)==false)$rsCust = new odbcRecordsetDummy;
	
	
	//-- if have an asset
	if($rsCall->f("equipment")!="")
	{
		$seleq = "select * from equipmnt where equipid = '" . pfs($rsCall->f("equipment")) . "'";
		$swconn->Query($seleq);
		$rsEquip = $swconn->CreateRecordSet();
	}
	if(isset($rsEquip)==false)$rsEquip = new odbcRecordsetDummy;


	//-- set up some vars that we will use
	$callclass=$rsCall->f('callclass');
	$callstatus=$rsCall->f('status');
	$cicallcausecode="";

	//--
	//-- depending on callclass include content page (if you add call classes that need specific pages add then in switch)
	$include_content='generic_call.php';
	switch($callclass)
	{
		case "Helpdesk":
			break;
		case "Software":
			break;
		default:
			$include_content='generic_call.php';
			break;
	}


?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" >
<title><?php echo $callclass;?> Details</title>
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>