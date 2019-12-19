<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('../clsSwSocialMedia.php');
	include('clstwitter.php');
	include('clsbitly.php');
	include_once('../lib_oauth.php');
	include_once('../lib_json.php');

	

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>

<head>
<title>Send Direct Message - Supportworks Social Media</title>
<link rel="stylesheet" href="../css/smstructure.css">
<link href="../css/structure.css" rel="stylesheet" type="text/css" />
<link href="../css/elements.css" rel="stylesheet" type="text/css" />

<script src="../js/portal.control.js"></script>
<script src="../js/xmlhttp.control.js"></script>
<script src="../js/socialmedia.js"></script>

<script>
	var app = top; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "<?php echo docURL();?>";
</script>
</head>
<body>
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
			$arrRes = $oTweet->sendDM($rsUserAccounts->f('sm_acc_name'), $_POST["screenname"], $_POST["userid"], $_POST["msgtxt"]);
			if($arrRes)
				echo "Message Sent";
			echo "<br/><a href='Javascript:window.close();'>Close Window</a>";
		}
		else
		{
			echo "Failed to authenticate account details.";
		}

		?>
					<script>
						//-- Call to reload feed
						//var msgFeedDiv = window.opener.document.getElementById('msgfeed1');
						//app.load_feed(msgFeedDiv);
						//window.close();
					</script>
				<?php 
		//exit;
	}
	else
	{
		echo "No Message Found to send";
	}

	?>
					</div> <!-- id="swtInfoBody"-->				
				<div id="swtPageBottom"><img src="../img/structure/swt_page_bl.gif" /></div>
			</div>
			
		</div>
		</div>
	</div>
	</div>
</body>
</html>