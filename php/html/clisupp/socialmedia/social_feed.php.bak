<?php 
	include('lib_oauth.php');
	include('lib_json.php');
	include('clsswsocialmedia.php');
	include_once('stdinclude.php');	

	include_once('social_index_helpers.php');

	//-- for DB Access until API Calls implemented


	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class
	include_once('itsm_default/xmlmc/helpers/language.php');			//- used for lang_decode_to_utf
	include_once('itsm_default/xmlmc/xmlmc.php');		//-- data base access class
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
<!--<script type="text/javascript" src="js/jquery-1.4.4.min.js"></script>
<script src="js/jquery.DOMWindow.js"></script>
<p><a href="http://www.google.com" class="absoluteIframeDOMWindow">Add Search</a></p>
<script type="text/javascript"> 
$('.absoluteIframeDOMWindow').app.openDOMWindow({
height:400,
width:700,
positionType:'absolute',
positionTop:50,
eventType:'click',
positionLeft:50,
windowSource:'iframe',
windowPadding:0,
loader:1,
loaderImagePath:'animationProcessing.gif',
loaderHeight:16,
loaderWidth:17
});
</script>-->

<!--<div id="navColumn" class="msgmenu">
	<?php 

		$SwSocialMedia = new SwSocialMedia();
		$SwSocialMedia->showMainMenu();
				
	?>

</div>-->



<div class="msgfeeds">
	<div class="msgfeed" id="msgfeed">
		<div class='messagelisttitlebar'><div class='messagelisttitlebarname'>All Messages</div><div class='messagelisttitlebaractions'><a href="Javascript:load_feed('messagelist','<?php echo gv('sessid');?>','','',0,false);loadHiddenIframeWA();"><img src="img/icons/reload.png" alt="Refresh Messages"/><!--Refresh--></a></div></div>
		<div class='messagelist' id='messagelist'>
		<?php 			//echo "Last Refreshed: ".SwFormatDateTimeColumn("socmed_comms.msg_datex",time());
			$SwSocialMedia->showMessageList('messagelist');
			
		?>
		</div>
	</div>

	<!--<div class="msgfeed2" id="msgfeed2" style="background-color:green">
	<?php 
			echo "Last Refreshed: ".date('D d M, Y H:i:s',time());
			$SwSocialMedia = new SwSocialMedia();
			$SwSocialMedia->showMessageList();
	?>
	</div>-->
</div>

<div id="infopanel" class="infopanel">
	<!--Details appear here of selected user or hash tag click-->

	<div id="navColum" class="msgmenucompact">
	<?php 		$SwSocialMedia = new SwSocialMedia();
		$SwSocialMedia->showMainMenu();
				
	?>

	</div>
</div>
