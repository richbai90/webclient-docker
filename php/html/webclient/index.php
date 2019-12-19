<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>


<?php

//-- for php4 xmldom to php5 and swPhpDll.php
include('php5requirements.php');

//-- check that core files exist (clissupp dependencies)
//include('php/core/checkfiles.php'); //-- 25.11.2013 - apps dev now look after the clisupp dependencies

//-- check for trusted key and username in php vars
include('php/_wcconfig.php');

if( (!defined("_QAMODE")) || (_QAMODE==false))
{
?>
<script>

	 //-- check if showModalDialog is supported
	 if(window.showModalDialog==undefined)	
	 {
		//document.location.href = "showmodalnotsupported.htm";
	 }
</script>
<?php
}



//-- error messages by number
$ARR_LOGOUT_MESSAGES = Array();
$ARR_LOGOUT_MESSAGES["m1"] = "The data dictionary meta data is not available. Please contact your Administrator.";
$ARR_LOGOUT_MESSAGES["m2"] = "(000) The page requested is being run outside of its intended context.";
$ARR_LOGOUT_MESSAGES["m3"] = "(001) Your supportworks session is invalid or has expired. Please login again.";
$ARR_LOGOUT_MESSAGES["m4"] = "(002) Your supportworks session failed a security check and you have been logged out.";
$ARR_LOGOUT_MESSAGES["m5"] = "(003) Your supportworks session failed a privilege check and you have been logged out.";
$ARR_LOGOUT_MESSAGES["m6"] = "(004) The supportworks parameter checking file is corrupt. Please contact your Administrator";

$errorMessage = "";
if(@$_GET['sessionerrormsg']!="" && isset($ARR_LOGOUT_MESSAGES[$_GET['sessionerrormsg']]))
{
	$errorMessage = $ARR_LOGOUT_MESSAGES[$_GET['sessionerrormsg']];
}
//-- eof error message

if( (defined("_WC_TRUSTEDLOGON")) && (_WC_TRUSTEDLOGON))
{
	$trustedlogonmessage ="";
	if($_GET['loggedout']=="1" || $errorMessage!="")
	{
		//-- user has logged out
		$bLoggedOut = true;
		if($errorMessage!="") $trustedlogonmessage = "<font color='red'>".$errorMessage . "</font><br><br>";
		$trustedlogonmessage .= "Trusted authentication logout Successful.<br><a href='".$PHP_SELF."'>Click here to log back into the Webclient.<a>";
		include('sspi/splash.php');
		exit;
	}
	else
	{
		//-- run trusted login - SSPI should be setup to point to this location
		$strCallrefPassthru = "";
		if(@$_REQUEST['callref']!="") $strCallrefPassthru = "?callref=".$_REQUEST['callref'];
		header('Location:sspi/index.php' . $strCallrefPassthru) ;
		exit;
	}
}

?>
<title>Supportworks Webclient <?php echo _VERSION;?></title>
<style>
	*
	{
		font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
	}



	body
	{
		overflow:hidden;
		height: 100%;
		margin: 0;
		padding: 0;
		background-color:#f5f5f5;
	}

	img#bg 
	{
		position:absolute;
		top:0;
		left:0;
		width:100%;
		height:100%;
		z-index:-1;
	}

	td
	{
		font-size:82%;
	}

	a
	{
		text-decoration:none;
		color:#08D;
	}

	a:hover
	{
		text-decoration:underline;
		color:#08D;
	}

	.tb-long
	{
		width:200px;
		height:24px;
		font-size:14px;
	}

	.cb
	{
		margin-left:-4px;
	}
	
	.cb-label
	{
		position:relative;
		top:-2px;
	}

	.btn-small
	{
		background-color:#D6E7FB;
		border-color:#4A95C9;
		border-width:1px;
		border-style:solid;
	}

	.error-message
	{
		color:red;
	}

	.securityNotice
	{
		margin-left:10px;
		padding-top:5px;
		background-color:#ffffff;
		border-style:solid;
		border-width:1px;
		border-color:#000000;
	}

	#div_rememberme
	{
		border-style:solid;
		border-width:0px 0px 0px 1px;
		border-color:#B4B4B4;
		width:100%;
		height:100%;
	}

</style>

<!--[if gte IE 5.5]>
<![if lt IE 7]>
	<style type="text/css">
		#sp_logo img { filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0); }
		#sp_logo { display: inline-block; }
		#sp_logo { filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='client/images/supportworks_esp_long.png'); }

	</style>
<![endif]>
<![endif]-->

<script src="client/js/min/app.browser.js"></script>
<script src="client/js/min/app.dhtml.js"></script>
<script src="client/js/min/app.xmlhttp.js"></script>
<script>
	var _swcore={};
	var isIE  = (BrowserDetect.browser=="Internet Explorer")?true:false;
	var isIE9 = (isIE && BrowserDetect.version=="9")?true:false;
	var isIE8 = (isIE && BrowserDetect.version=="8")?true:false;
	var isIE7 = (isIE && BrowserDetect.version=="7")?true:false;
	var isIE6 = (isIE && BrowserDetect.version=="6")?true:false;
	var isSafari  = (BrowserDetect.browser=="Safari")?true:false;
	var isFirefox  = (BrowserDetect.browser=="Firefox")?true:false;	
	var isOpera  = (BrowserDetect.browser=="Opera")?true:false;		
	var isChrome  = (BrowserDetect.browser=="Chrome")?true:false;
	var isIE10 = (isIE && BrowserDetect.version=="10")?true:false;	
	var isIE11 = (isIE && BrowserDetect.version=="11")?true:false;	
	var isIE10Above = (isIE && ((BrowserDetect.version-0)>9))?true:false;	
	var isIE11Above = (isIE && ((BrowserDetect.version-0)>10))?true:false;
	var isIE12Above = (isIE && ((BrowserDetect.version-0)>11))?true:false;

	var httpNextToken = "login";

	var session={role:0};
	var _swsessionid="";
	var bProcessing=false;

	function _swed(s){return s;};
	function _focus_login()
	{
		var e = document.getElementById("tb_userid");
		if(e!=null)e.focus();
	}
</script>
<body onload="_focus_login()">

<span id='sp_logo' style='position:absolute;top:30px;left:20px;'><img id='ing_logo' src='client/images/supportworks_esp_long.png' /></span>
<center>
<table width="100%" height="100%" border="0" cellpadding="2" cellspacing="2">	
	<tr>
		<td height="100%" width="100%">
			<div id="div_newlogin">
				<center>
				<table border="0" align="center">
					<tr>
						<td>
								<table cellspacing="4" cellpadding="2" border="0" align="center" style='font-size:14px;border:1px solid #dfdfdf;background-color:#ffffff;'>
									<tr>
										<td>&nbsp;</td>
									</tr>

									<tr>
										<td align='right' noWrap>Analyst ID :</td><td align=middle><input onkeypress="_check_signin_enter(this,event);" tabindex=1 id="tb_userid" type="text" class='tb-long' ></td>
									</tr>
									<tr>
										<td  align='right' noWRap>Password :</td><td align=middle><input id="tb_password" type="password" onkeypress="_check_signin_enter(this,event);" class='tb-long'></td>
										<td><img id='btn_signin' src='client/images/login_med.png' onclick="_btn_signin_onclick();"></td>		
									</tr>
									<tr>
										<td>&nbsp;</td>
									</tr>
								</table>

						</td>
						<?php
							//-- show security notes if set
							if(defined("_WC_SHOWSECURITYNOTES") && (_WC_SHOWSECURITYNOTES))
							{
						?>

								<td>
									<div class='securityNotice'><img src='client/images/securitynotice.png'></div>
								</td>

						<?php
							}
						?>
					</tr>
					<tr>
						<td>
							<table cellspacing="1" cellpadding="1" border="0" align="center">
								<tr>
									<td colspan="2" id="td_errormsg" class="error-message"><?php echo htmlentities($errorMessage);?></td>
								</tr>
							</table>
						</td>
					</tr>
					<?php
						//-- show disclaimer if set
						if(defined("_WC_SHOWDISCLAIMER") && (_WC_SHOWDISCLAIMER))
						{
					?>
						<tr>
							<td>
								<br>
								<table cellspacing="1" cellpadding="1" border="0" align="center">
									<tr>
										<td colspan=2 ><img src='client/images/disclaimer.png'></td>
									</tr>
								</table>
							</td>
						</tr>
					<?php
						}
					?>
				</table>
				</center>
			</div>
		</td>
	</tr>
</table>
<?php
	echo "<form name='frm_portal' action='portal.php' method='POST'><input type='hidden' id='sessiontoken' name='sessiontoken' value=''><input type='hidden' name='opencallref' value='".@$_REQUEST['callref']."'></form>";
?>
</body>
</html>