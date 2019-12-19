<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	include_once('classfscdata.php');

	$sessid = $_SESSION['sessid'];
	//-- F0100079 - check session variable
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
		<?php
		exit;
	}	
	
	//$bInWebclient = $GLOBALS['_webclient'];
	$bInWebclient = gv('_webclient');

	//-- Construct a new active page session
	$session = new classActivePageSession($sessid);
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
	$_SESSION['sessid'] = gv('sessid');

	$intEventType = 0;
	if(isset($_POST['eventtype']))
	{
		//only accept value if its a number 1 or 2, else leave default of 0
		if(is_numeric($_POST['eventtype']) && $_POST['eventtype']>0 && $_POST['eventtype']<10)
		{
			$intEventType = $_POST['eventtype'];
		}
	}
	
	//-- CH00125373 Set booleans for include check boxes
	$boolCFInclude = true;
	if(isset($_POST['cfinclude']))
	{
		if ($_POST['cfinclude']=="unchecked")
		{
			$boolCFInclude = false;
		}
	}
	$boolSInclude = true;
	if(isset($_POST['sinclude']))
	{
		if ($_POST['sinclude']=="unchecked")
		{
			$boolSInclude = false;
		}
	}


	$strFilter = "";
	$callref = 0;
	if (isset($_POST['callref']))
	{
		$callref = $_POST['callref'];
		$callref = (int)preg_replace("/[^0-9]/","",$callref);
	}
	if($callref>0)
	{
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
			<?php
			exit;
		}
		else
		{
			//is fine so build
			$strFilter = " AND callref=".$callref." ";
		}
	}

	if(isset($_POST['suppgroup']) && $_POST['suppgroup']!='')
	{
		$strFilter .= " AND suppgroup='".pfs($_POST['suppgroup'])."' ";
	}
	$boolCallSummary = false;
	if(isset($_POST['callsummary']))
	{
		$boolCallSummary = $_POST['callsummary'];
		if($boolCallSummary=="True")
			$boolCallSummary = true;
	}

	$strActivityType = "";
	if(isset($_POST['acttype']))
	{
		$strActivityType = $_POST['acttype'];
	}

	$intCalStart = $_POST['start'];
	$intCalEnd = $_POST['end'];
	$calls = array();

	//-- create a connection to swdata
	$oDBConn = new CSwDbConnection();
	if(!$oDBConn->Connect(swdsn(),swuid(),swpwd()))
	{
		return false;
	}
	
	$oDatarec = new oFSCData($oDBConn);
	$oDatarec->set_filter($strFilter);
	$oDatarec->set_view_type($_POST['view']);
	
	
	//-- CH00125373 load change freezes
	if($boolCFInclude)
	{
		$oDatarec->load_calendar_items($intCalStart,$intCalEnd,"Change Freeze");
	}
	
	//-- CH00125373 load calendar items
	if($boolSInclude)
	{
		$oDatarec->load_calendar_items($intCalStart,$intCalEnd,"Calendar Item");
	}
	
	// Do we want to include the activities?
	if($intEventType==0 || $intEventType==1 || $intEventType==6)
	{
		$oDatarec->load_activites($intCalStart,$intCalEnd,$boolCallSummary,$strActivityType);
	}

	// Do we want to include the change requests?
	if($intEventType==0 || $intEventType==2 || $intEventType==6)
	{
		$oDatarec->load_changes($intCalStart,$intCalEnd,$boolCallSummary);
	}

	// Do we want to include the change proposal activities?
	if($intEventType==3 || $intEventType==5 || $intEventType==6)
	{
		$oDatarec->load_proposal_activites($intCalStart,$intCalEnd,$boolCallSummary,$strActivityType);
	}

	// Do we want to include the change proposals?
	if($intEventType==4 || $intEventType==5 || $intEventType==6)
	{
		$oDatarec->load_proposals($intCalStart,$intCalEnd,$boolCallSummary);
	}

	// Projected Service Outage View
	if($intEventType==7)
	{
		$oDatarec->load_pso($intCalStart,$intCalEnd,$boolCallSummary);
	}
	//-- Release Requests
	if($intEventType==8)
	{
		$oDatarec->load_rel($intCalStart,$intCalEnd,$boolCallSummary);
	}
	//-- Release Requests & Associated Change
	$arrEvents = $oDatarec->get_output();
	if($intEventType==9)
	{
		$oDatarec->load_rel_chg($intCalStart,$intCalEnd,$boolCallSummary);
	}
	//include file to convert Javascript array object to JSON output
	include_once('json.php');
	
	$json = new Services_JSON();
	// convert a complex value to JSON notation
	echo $json->encode($arrEvents);



?>