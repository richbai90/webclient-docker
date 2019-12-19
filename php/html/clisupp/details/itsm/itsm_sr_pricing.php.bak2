<?php 	//-- 20.05.2004 - NWJ
	//-- Called by Supportworks after a call search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	include_once("global.settings.php");
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');

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

	$callref = gv('callref');
	if($callref=="")	$callref = gv('CALLREF');

	//-- create our database connects to swdata and systemdb
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());

	$sysconn = new CSwLocalDbConnection();
	$sysconn->SwCacheConnect();
	$sysconn->LoadDataDictionary($dd);

	//-- try get call from cache
	$sysconn->Query("SELECT * FROM opencall where callref =" . pfs($callref));
	$rsCall = $sysconn->CreateRecordSet();
	if((!$rsCall)||($rsCall->eof))
	{
		//-- failed to get call from cache so get it from swdata
		$swconn->Query("SELECT * FROM opencall where callref =" . pfs($callref));
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
	if($rsCall->xf("cust_id")!="")
	{
		$selcust = "select * from userdb where keysearch = '" . pfs($rsCall->xf("cust_id")) . "'";
		$rsCust =$swconn->Query($selcust,true);
		//$rsCust = $swconn->CreateRecordSet();
	}
	if(isset($rsCust)==false)$rsCust = new odbcRecordsetDummy;
	
	//-- if sla is not empty load SLA record
	if($rsCall->xf("itsm_sladef")!="")
	{
		$selcust = "select * from itsmsp_slad where pk_slad_id = " . pfs($rsCall->xf("itsm_sladef"));
		$rsSLA =$swconn->Query($selcust,true);
		//$rsCust = $swconn->CreateRecordSet();
	}
	if(isset($rsSLA)==false)$rsSLA = new odbcRecordsetDummy;
	
	//-- if cust sla is not empty load SLA record
	if($rsCust->xf("sld")!="")
	{
		$selcust = "select * from itsmsp_slad where pk_slad_id = " . pfs($rsCust->xf("sld"));
		$rsCustSLA =$swconn->Query($selcust,true);
		//$rsCust = $swconn->CreateRecordSet();
	}
	if(isset($rsCustSLA)==false)$rsCustSLA = new odbcRecordsetDummy;

	//-- set up some vars that we will use
	$callclass=$rsCall->xf('callclass');
	$callstatus=$rsCall->xf('status');
	$cicallcausecode="";
	//--
	//-- depending on callclass include content page
	$include_content='itsmv2_genericcall.php';
	switch($callclass)
	{
		case "Incident":
			$cicallcausecode="INCIDENT";
			$include_content='itsmv2_swincident.php';
			break;
		case "Problem":
			$cicallcausecode="PROBLEM-CAUSE";
			$include_content='itsmv2_swproblem.php';
			break;
		case "Known Error":
			$cicallcausecode="PROBLEM-CAUSE";
			$include_content='itsmv2_swknownerror.php'; 
			break;
		case "Change Request":
			$cicallcausecode="RFC-CAUSE";
			$include_content='itsmv2_swrfc.php';

			break;
		case "Release Request":
			$cicallcausecode="REL-CAUSE";
			$include_content='itsmv2_swrfc.php';
			break;
		default:
			break;
	}

	//-- get text we will show on causeing items header
	$citextcode=explode("-",$cicallcausecode);
	$citextcode=(isset($citextcode[1]))?$citextcode[1]:$citextcode[0];
	$citextcode=	ucfirst(strtolower($citextcode));
	
	//-- nwj - just use standard call for now unril noko gives us pages
	$include_content='itsmv2_genericcall.php';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Incident Details </title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include('service_request_pricing.php');?>
</body>
</html>