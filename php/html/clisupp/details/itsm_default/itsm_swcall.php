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
	$sessid = gv('sessid');
	if((!regex_match("/^[a-zA-Z0-9]{14}-[a-zA-Z0-9]{4,5}-[a-zA-Z0-9]{8}$/",$sessid)) && (!regex_match("/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}$/",$sessid)))
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
						The Supportworks record could not be found<br>
						Please contact your system administrator.
					</span>
					</center>
				</body>
		</html>
	<?php 		exit;
	}
	$_SESSION['sessid'] = gv('sessid');

	$sql = "SELECT * FROM swanalysts_groups WHERE analystid = '" .  pfs($GLOBALS['analystid']) . "'";
	if(!isset($_SESSION['wc_groups']))
	{
		$conCache = database_connect("syscache");
		if($conCache)
		{
			$oRS = $conCache->Query($sql,true);
			if($oRS)
			{
				while(!$oRS->eof)
				{
					if(isset($_SESSION['wc_groups']))
						$_SESSION['wc_groups'] = $_SESSION['wc_groups'].",";
					$_SESSION['wc_groups'] .= $oRS->f('groupid');
					$oRS->movenext();
				}
			}
		}
	}

	//-- will return true or false if analyst has application right
	function havesysright($strGroup,$fRight)
	{
		eval("\$intRight = bit".$fRight.";");
		$intRight++;$intRight--;
		$strGroup = strtolower($strGroup);
		return (($intRight & floatval($_SESSION['wc_sl'.$strGroup]))>0);
	}

	$callref = gv('callref');
	if($callref=="")	$callref = gv('CALLREF');
	if(!regex_match("/^[0-9]+$/",$callref))
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

	//-- create our database connects to swdata and systemdb
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());

	$sysconn = new CSwLocalDbConnection();
	$sysconn->SwCacheConnect();
	$sysconn->LoadDataDictionary($dd);

	//-- try get call from cache
	$sysconn->Query("SELECT * FROM opencall where callref = ".pfs($callref));
	$rsCall = $sysconn->CreateRecordSet();
	if((!$rsCall)||($rsCall->eof))
	{
		//-- failed to get call from cache so get it from swdata
		$swconn->Query("SELECT * FROM opencall where callref = ".pfs($callref));
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
		$selcust = "select * from userdb where keysearch = '" . pfs(lang_encode_from_utf($rsCall->f("cust_id"))) . "'";
		$rsCust = $swconn->Query($selcust,true);
		if($rsCust->eof)
		{
			$rsCust = new odbcRecordsetDummy;
		}
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

	//if($custSLAD>0)
	if($rsCust->xf("sld")>0)
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
	$strGroup = "B";
	$appRight = 1;
	switch($callclass)
	{
		case "Incident":
			$cicallcausecode="INCIDENT";
			$include_content='itsmv2_swincident.php';
			$strGroup = "B";
			$appRight = 5;
			break;
		case "Problem":
			$cicallcausecode="PROBLEM-CAUSE";
			$include_content='itsmv2_swproblem.php';
			$strGroup = "C";
			$appRight = 8;
			break;
		case "Known Error":
			$cicallcausecode="PROBLEM-CAUSE";
			$include_content='itsmv2_swknownerror.php'; 
			$strGroup = "C";
			$appRight = 9;
			break;
		case "Change Request":
			$cicallcausecode="RFC-CAUSE";
			$include_content='itsmv2_swrfc.php';
			$strGroup = "D";
			$appRight = 5;
			break;
		case "Release Request":
			$cicallcausecode="REL-CAUSE";
			$include_content='itsmv2_swrfc.php';
			$strGroup = "E";
			$appRight = 5;
			break;
		case "OLA Task":
			$strGroup = "B";
			$appRight = 7;
			break;
		case "Service Request":
			$strGroup = "H";
			$appRight = 12;
			break;
		default:
			break;
	}

	if (haveappright($strGroup,$appRight )==false)
	{
		echo "<center>You are not authorised to view ".$callclass." records. <br>If you require authorisation please contact your Supportworks Administrator.</center>";
		exit;
	}	

	//-- F0097542
	if(strtolower($GLOBALS['analystid'])!=strtolower($rsCall->xf("owner")))
	{
		if($rsCall->xf("owner")!="")
		{
			if(!havesysright("A",6))
			{
				echo 'You do not have permission to view records that are assigned to other analysts.';
				exit;
			}
		}

		$strGroup = strtolower($rsCall->xf("suppgroup"));
		
		//if(!strpos($_SESSION['wc_groups'],$strGroup)) -- F0110048
		$sessGroup = strtolower($_SESSION['wc_groups']);
		if(strpos($sessGroup,$strGroup)===false)
		{
			if(!havesysright("A",7))
			{
				echo 'You do not have permission to view records that are assigned to support groups that you are not a member of.';
				exit;
			}	
		}
		
	}

	//-- get text we will show on causeing items header
	$citextcode=explode("-",$cicallcausecode);
	$citextcode=(isset($citextcode[1]))?$citextcode[1]:$citextcode[0];
	$citextcode=	ucfirst(strtolower($citextcode));
	
	//-- nwj - just use standard call for now unril noko gives us pages
	$include_content='itsmv2_genericcall.php';
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" >
<title>Incident Details </title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>