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
	$pk_slad_id = gv('pk_slad_id');
	if($pk_slad_id =="") $pk_slad_id = gv('PK_SLAD_ID');

	//-- create our database connects to swdata
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());
		
	$swcache = new CSwDbConnection();
	$swcache->SwCacheConnect();

	$selectme = "select * from itsmsp_slad where pk_slad_id = '" . pfs($pk_slad_id) . "'";
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
							The SLA Definition record (<?php echo htmlentities($pk_slad_id,ENT_QUOTES,"UTF-8");?>) was not found on the database (<?php echo swdsn();?>).<br>
							Please contact your system administrator.
					</center>
				</body>
		</html>
	<?php 		exit;
	}

	$selectPriorities = "select * from itsmsp_slad_priority where flg_sla = 1 and fk_slad = '" . pfs($pk_slad_id) . "'";
	$rsPriorities = $swconn->Query($selectPriorities,true);
	if(isset($rsPriorities)==false)$rsPriorities = new odbcRecordsetDummy;

	//-- get active incident count
	$intIncCount = $swconn->GetRecordCount("opencall","itsm_sladef = '" . pfs($rsME->f("pk_slad_id")) . "' and status < 15 and  status != 6 and status != 4");
	
	$include_content='generic_slad.php';

	function get_time($start,$end)
	{
		if($start==0 && $end==0)
			return "No Support";
		$strTime = common_convert_field_value("hh_mm",$start,"")."-".common_convert_field_value("hh_mm",$end,"");
		return $strTime;
	}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>SLA Definition Details (<?php echo htmlentities($pk_slad_id,ENT_QUOTES,"UTF-8");?>)</title>
<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>