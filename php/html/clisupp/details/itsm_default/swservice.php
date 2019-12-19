<?php 
	//-- 20.09.2007 - NWJ
	//-- Called by Supportworks after an asset search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";


	//-- Include our standard include functions page
	if($passthru!=1)
	{
		@include_once("global.settings.php");
		@include_once('itsm_default/xmlmc/classactivepagesession.php');
		@include_once('itsm_default/xmlmc/common.php');

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
		<?php 			exit;
		}
	} //-- passthru
	$_SESSION['sessid'] = gv('sessid');

	//- -get pkey
	$pk_auto_id = gv('fk_cmdb_id');
	if($pk_auto_id =="") $pk_auto_id = gv('FK_CMDB_ID');

	//-- create our database connects to swdata
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());
		
	$selectme = "select * from sc_folio,config_itemi where pk_auto_id=fk_cmdb_id and fk_cmdb_id = '" . pfs($pk_auto_id) . "'";
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
							The service record (<?php echo htmlentities($pk_auto_id,ENT_QUOTES,"UTF-8");?>) was not found on the database (<?php echo swdsn();?>).<br>
							Please contact your system administrator.
					</center>
				</body>
		</html>
	<?php 		exit;
	}

	//-- get active service request count
	$intSRCount = $swconn->GetRecordCount("opencall","itsm_fk_service = '" . pfs($rsME->f("pk_auto_id")) . "' and status < 15 and  status != 6 and status != 4");
	
	$include_content='generic_service.php';

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Service Details (<?php echo $rsME->xf("ck_config_item");?>)</title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>