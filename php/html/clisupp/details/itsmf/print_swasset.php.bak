<?php 
	//-- 20.09.2007 - NWJ
	//-- Called by Supportworks after an asset search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	$GLOBALS['phpprintmode'] = "1";

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

	$asset_equipid = gv('equipid');
	if($asset_equipid =="")$asset_equipid = gv('equipid');


	//-- create our database connects to swdata
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());
		
	$seleq = "select * from equipmnt where equipid = '" . pfs($asset_equipid) . "'";
	$swconn->Query($seleq);
	$rsEquip = $swconn->CreateRecordSet();
	if(isset($rsEquip)==false)$rsEquip = new odbcRecordsetDummy;



	//-- if owner is not empty load userdb record
	$equipment_owner = $rsEquip->f("owner");
	if($equipment_owner!="")
	{
		$selcust = "select * from userdb where keysearch = '" . pfs($equipment_owner) . "'";
		$swconn->Query($selcust);
		$rsCust = $swconn->CreateRecordSet();
	}
	if(isset($rsCust)==false)$rsCust = new odbcRecordsetDummy;


	//-- get active incident count
	$intIncCount = $swconn->GetRecordCount("opencall","equipment = '" . pfs($rsEquip->f("equipid")) . "' and status < 15 and  status != 6 and status != 4");


	//-- set up some vars that we will use
	$gencode=$rsEquip->f('generic');

	//--
	//-- depending on generic code include content page (if you add gencodes that need specific pages add them in switch)
	$include_content='generic_asset.php';
	switch($gencode)
	{
		case "hdw":
			break;
		case "sftw":
			break;
		default:
			$include_content='generic_asset.php';
			break;
	}


?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Assets Details (<?php echo $asset_equipid;?>)</title>
<link href="css/structure.css" rel="stylesheet" type="text/css" />
<link href="css/print_override.css" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>