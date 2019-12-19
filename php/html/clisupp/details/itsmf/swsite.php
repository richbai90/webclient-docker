<?php 
	//-- 20.09.2007 - NWJ
	//-- Called by Supportworks after an asset search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";


	//-- Include our standard include functions page
	include_once("global.settings.php");
	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/common.php');

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


	//--
	//-- get alternative site name (when called from related table brwowse in me searches)
	if(gv('site')!="")	$site_sitename = html_entity_decode(gv('site'));
	if($site_sitename=="")$site_sitename= html_entity_decode(gv('site_name'));
	//-- check for captial vars
	if($site_sitename=="")
	{
		if(gv('SITE')!="")	$site_sitename = html_entity_decode(gv('SITE'));
		if($site_sitename=="")$site_sitename= html_entity_decode(gv('SITE_NAME'));
	}

	//-- create our database connects to swdata
	$swconn = new CSwDbConnection();
	if(!$swconn->Connect(swdsn(), swuid(), swpwd()))
	{
		echo "Failed to connect to ".swdsn().". Please contact your Administrator";
		exit;
	}


	$selectme = "select * from site where site_name = '" . pfs($site_sitename) . "'";
	$swconn->Query($selectme);
	$rsME = $swconn->CreateRecordSet();
	if((isset($rsME)==false)||($rsME->eof==true))
	{
		//-- no matching record so alert user??	
	?>
		<html>
			<head>
				<title>Support-Works Session Authentication Failure</title>
			</head>
				<body>
					<br><br>
					<center>
							The site record (<?php echo htmlentities($site_sitename,ENT_QUOTES,'UTF-8');?>) was not found on the database (<?php echo swdsn();?>).<br>
							Please contact your system administrator.
					</center>
				</body>
		</html>
	<?php 		exit;
	}


	//-- get active incident count
	$intIncCount = $swconn->GetRecordCount("opencall","site = '" . pfs($rsME->f("site_name")) . "' and status < 15 and  status != 6 and status != 4");

	//-- get assets linked to this site
	$intAssetCount = $swconn->GetRecordCount("equipmnt","site = '" . pfs($rsME->f("site_name")) . "' ");

	//-- get cust linked to this site
	$intCustCount = $swconn->GetRecordCount("userdb","site = '" . pfs($rsME->f("site_name")) . "' ");

	
	$include_content='generic_site.php';

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" >
<title>Site Details (<?php echo htmlentities($site_sitename,ENT_QUOTES,'UTF-8');?>)</title>
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>