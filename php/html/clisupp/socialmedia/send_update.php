<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('clsswsocialmedia.php');
	include('./twitter/clsTwitter.php');
	include('./twitter/clsBitLy.php');
	include_once('lib_oauth.php');
	include_once('lib_json.php');

	include_once('itsm_default/xmlmc/helpers/language.php');			//- used for lang_decode_to_utf
	include_once('itsm_default/xmlmc/classactivepagesession.php');		//-- data base access class
	include_once('itsm_default/xmlmc/xmlmc.php');		//-- data base access class
//	error_reporting(E_ALL);
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
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>

<head>
<title>New Update - Supportworks Social Media</title>
<link rel="stylesheet" href="css/smstructure.css">
<link href="css/structure.css" rel="stylesheet" type="text/css" />
<link href="css/elements.css" rel="stylesheet" type="text/css" />

<script src="js/portal.control.js"></script>
<script src="js/xmlhttp.control.js"></script>
<script src="js/socialmedia.js"></script>

<script>
	var app = top; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "<?php echo docURL();?>";
</script>
</head>
<body onload="Javascript:update_msg_character_count(document.getElementById('msgtxt').value, document.getElementById('msgcharcount'));document.getElementById('msgtxt').focus();">
<div id="IE6MinWidth">
	<div id="wrapper">
	
	
		<div id="contentColumn">
			
			<div id="contentWrapper">

<!-- ********** page head **********-->
			
				<div id="swtPageTop" style="height:1px;"></div>
				
<!-- ********** End page head **********-->

<!-- ********** Start page body **********-->		

					<div id="swtInfoBody">
						<!--<br><img src="img/structure/hornbill.jpg" title="SupportWorks Social" / >--><br>
<?php 	

	$SwSocialMedia = new SwSocialMedia();

	if($_POST["msgtxt"]!="")
	{
		//-- Post Message Reply
		$rsUserAccounts = $SwSocialMedia->get_user($_POST['account']);
		if(!$rsUserAccounts->eof)
		{
			$oTweet = new Twitter($rsUserAccounts->f('sm_acc_key'), $rsUserAccounts->f('sm_acc_secret'));
			$oTweet->sendTweet($_POST["msgtxt"]);
			echo "Update Sent";
		}
		else
		{
			echo "Failed to authenticate account details.";
		}

		?>
					<!--<script>
						//-- Call to reload feed
						var msgFeedDiv = window.opener.document.getElementById('msgfeed1');
						app.load_feed(msgFeedDiv);
						window.close();
					</script>-->
				<?php 
		exit;
	}

	//$tweet_id = gv('intTweetId');
	//$msg_id= gv('intSwMsgID');
	//$msg_defaulttxt= gv('strDefaultText');
	
	$rsUserAccounts = $SwSocialMedia->get_user($user_id);
	
?>
					<form name="frmSendMsg" method="POST" action="./twitter/reply_sent.php">
						
						<table border=0>
							
							<tr><th style="text-align:right;">From:</th><td><select name="account">
							<?php while(!$rsUserAccounts->eof)
								{?>
								<option value="<?php echo $rsUserAccounts->f('sm_acc_id')?>"><?php echo $rsUserAccounts->f('sm_acc_name')?></option>
								<?php 								$rsUserAccounts->movenext();
								}
							?>
						</select></td></tr>
						<tr><th style="text-align:right;">URL: </th><td><input type="text" id="urllink" name="urllink" size="60"> <input type="button" onclick="Javascript:add_shortened_link_to_msg(document.getElementById('msgtxt'),document.getElementById('urllink').value,document.getElementById('errorMsg'));update_msg_character_count(document.getElementById('msgtxt').value, document.getElementById('msgcharcount'));" value="Shorten & Add URL"></td></tr>
						<tr><td></td><td><div id="errorMsg" style="color:red;"/></td></tr>
						<tr><td></td><td><textarea id="msgtxt" name="msgtxt" rows="4" cols="70" onkeyup="Javascript:update_msg_character_count(document.getElementById('msgtxt').value, document.getElementById('msgcharcount'));"></textarea></td></tr>
						<tr><td></td><td><div id="msgcharcount">140 Characters Remaining</div></td></tr>
						<tr><td colspan=2 style="text-align:right;"><input type="button" onclick="Javascript:window.close();" value="Cancel">&nbsp;<input type="submit" value="Send Update"></td></tr>
						</table>
						<input id="sessid" name="sessid" type="hidden" value="<?php echo gv('sessid');?>">
					</form>
					</div> <!-- id="swtInfoBody"-->				
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
			</div>
			
		</div>
		</div>
	</div>
	</div>
</body>
</html>