<?php 
	//-- 11.08.2010 - DavidJH
	//-- Called by Supportworks after an organisation search

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
	$company_pk_company_id = gv('pk_company_id');
	if($company_pk_company_id =="") $company_pk_company_id = gv('PK_COMPANY_ID');

	//-- create our database connects to swdata
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());
		
	$selectme = "select * from company where pk_company_id = '" . pfs($company_pk_company_id) . "'";
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
							The organisation record (<?php echo htmlentities($company_pk_company_id,ENT_QUOTES,"UTF-8");?>) was not found on the database (<?php echo swdsn();?>).<br>
							Please contact your system administrator.
					</center>
				</body>
		</html>
	<?php 		exit;
	}

	//-- get active incident count
	$intIncCount = $swconn->GetRecordCount("opencall","fk_company_id = '" . pfs($rsME->f("pk_company_id")) . "' and status < 15 and  status != 6");

	$include_content='generic_org.php';

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Organisation Details (<?php echo htmlentities($company_pk_company_id,ENT_QUOTES,"UTF-8");?>)</title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>