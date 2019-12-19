<?php 
	include('itsm_default/xmlmc/common.php');
	include('lib_oauth.php');
	include('./twitter/config.php');
	include('clsswsocialmedia.php');
	include('clstwitter.php');
	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/classactivepagesession.php');		
	include('./libs/JSON.php');
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

	//-- Get oAuth Credentials for selected account
	$SwSocialMedia = new SwSocialMedia();
	$strUserId = gv('strUserId');
	$rsUserAccounts = $SwSocialMedia->get_user($strUserId);
	if(!$rsUserAccounts->eof)
	{
		$my_req_key = $rsUserAccounts->f('sm_acc_key');
		$my_req_secret = $rsUserAccounts->f('sm_acc_secret');
	}

	//-- Run the Direct Message and return result object
	$keys = array(
	'oauth_key'		=> OAUTH_CONSUMER_KEY,
	'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
	'user_key'		=> $my_req_key,
	'user_secret'	=> $my_req_secret,
	);
	
	# Get passed in user id and user name
	$userid = gv("in_userid");
	$username = gv("in_username");

	#  access the protected resource
	$ret = oauth_request($keys, "https://api.twitter.com/1.1/users/show.json?user_id=".$userid."&screen_name=".$username);

	if (!strlen($ret)) dump_last_request();
	$strErrorMsg = "";
	if ((!strlen($ret)) || (substr($ret,0,6)=="200OK."))
	{	
		$strErrorMsg = handle_request_failure();
		echo $strErrorMsg;
		exit;
	}
	$json = new Services_JSON; 

	//print_r($json->decode($ret));
	$oResults = $json->decode($ret);
	# Get User Info from XML
	$arrResults = array();
	$arrResults["id"] = $oResults->id;
	$arrResults["name"] = $oResults->name;
	$arrResults["screen_name"] = $oResults->screen_name;
	$arrResults["followers_count"] = $oResults->followers_count;
	$arrResults["friends_count"] = $oResults->friends_count;
	$arrResults["statuses_count"] = $oResults->statuses_count;
	$arrResults["location"] = $oResults->location;
	$arrResults["description"] = $oResults->description;
	$arrResults["statuses_count"] = $oResults->statuses_count;
	$arrResults["geo_enabled"] = $oResults->geo_enabled;
	$arrResults["verified"] = $oResults->verified;
	$arrResults["created_at"] = $oResults->created_at;
	$arrResults["url"] = $oResults->url;
	$arrResults["profile_image_url"] = $oResults->profile_image_url;

	//-- Set the Profile image url to the larger size for use in full user view
	//echo getTwitterAvatarImageURL($arrResults["screen_name"], "original");
	$arrResults["profile_image_url"] = getTwitterAvatarImageURL($arrResults["screen_name"], "original",$arrResults["profile_image_url"]);
	
	//-- NOTE: This should be migrated to use the API calls rather than DB in future
	include_once('stdinclude.php');						//-- standard functions
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class

	//-- Check if user is known in supportworks
	$bVerifiedCustomer=false;
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());
	$rsUserDB = $swconn->Query("select keysearch, twitter_id from userdb where twitter_id='".$arrResults["screen_name"]."'",true);
	if(($rsUserDB!=false)&&(!$rsUserDB->eof))
	{
		$bVerifiedCustomer=true;
	}


?>
<div class='infopaneltitlebar'><div class='infopaneltitlebarname'>User Profile</div><div class='infopaneltitlebarclose'><a href="Javascript:loadMsgMenu(document.getElementById('infopanel'),'<?php echo gv('sessid');?>');loadHiddenIframeWA();"><img src="./img/icons/control_cross.png" alt='Close'><!--Close--></a></div></div>
<div><img class='infopanelavatar' src="<?php  echo $arrResults["profile_image_url"];?>"></div>
<div class='infopaneltopsummary'>
	<div class='infopanelname'><?php echo $arrResults["name"]?></div>
	<div class='infopanelscreenname'>@<?php echo $arrResults["screen_name"]?></div>
	<div class='infopanellocation'><?php echo $arrResults["location"]?></div>
	<div class='infopanelurl'><a href='<?php echo $arrResults["url"]?>' target='_blank'><?php echo $arrResults["url"]?></a></div>
	<div class='infopanelisswcustomer'><?php if($bVerifiedCustomer){?><a href="hsl:editrecord?formmode=edit&table=userdb&key=<?php echo $rsUserDB->f("keysearch");?>"><img src="./img/icons/rosette_blue.png" alt='Verified Supportworks Contact'>Verified Supportworks Contact</a><?php }?></div>
</div>
<div class='infopanelbio'><?php echo $arrResults["description"]?></div>
<div class='infopanelstats'>
	<div class='infopanelstatstweets'><b><?php echo $arrResults["statuses_count"]?></b><br/>Tweets</div>
	<div class='infopanelstatsfollowing'><b><?php echo $arrResults["friends_count"]?></b><br/>Following</div>
	<div class='infopanelstatsfollowers'><b><?php echo $arrResults["followers_count"]?></b><br/>Followers</div>
</div>
<div class='infopanelactionbtns'>
	<div class='infopanelstatsfollowbtn'><input id="followbtn" type="button" style="width:70px;" value="Follow" onclick="Javascript:followUser(document.getElementById('infopanelstatsfollowoptions'),'','','<?php echo gv('sessid');?>','<?php echo $arrResults["id"];?>','<?php echo $arrResults["screen_name"];?>');"></div>
		
	<div class='infopanelstatsfollowbtn'><input id="unfollowbtn" type="button" style="width:70px;" value="Unfollow" onclick="Javascript:unfollowUser(document.getElementById('infopanelstatsfollowoptions'),'','','<?php echo gv('sessid');?>','<?php echo $arrResults["id"];?>','<?php echo $arrResults["screen_name"];?>');"></div>
	
	<br/>
</div>
	<div id='infopanelstatsfollowoptions' class='infopanelstatsfollowoptions'></div>


<?php if($bVerifiedCustomer) 
	{	
	//-- Check DB Type for Query
	$odbcCon = new CSwDbConnection;
	$strDB = $odbcCon->get_database_type();
	if($strDB=="mssql")
	{
		$strSQL = "select top 5 callref, logdatex, itsm_title from opencall where cust_id ='".pfs($rsUserDB->f("keysearch"))."' order by logdatex desc";
	}
	else if($strDB=="oracle")
	{
		$strSQL = "select callref, logdatex, itsm_title from opencall where rownum <=5 and cust_id ='".pfs($rsUserDB->f("keysearch"))."' order by logdatex desc";
	}
	else
	{
		$strSQL = "select callref, logdatex, itsm_title from opencall where cust_id ='".pfs($rsUserDB->f("keysearch"))."' order by logdatex desc limit 5";
	}
	
	echo "<div class='infopanelpreviouscallstitle'>Most Recent Requests</div>";
	echo "<div class='infopanelpreviouscalls'>";
	$rsRequests = $swconn->Query($strSQL,true);
	while(($rsRequests!=false)&&(!$rsRequests->eof))
	{
		echo "<div><a href='hsl:calldetails?callref=".$rsRequests->f('callref')."'>".swcallref_str($rsRequests->f('callref'))."</a> ".SwFormatDateTimeColumn("opencall.logdatex",$rsRequests->f('logdatex'))."</div>";
		echo "<div>".$rsRequests->f('itsm_title')."</div>";
		$rsRequests->movenext();
	}
	?>
	</div>
<?php } 
	
	
function getTwitterAvatarImageURL($screen_name, $size="normal", $strImgRedirectURL = "")
{
	global $keys;
	//Request Screen Image URL from API and break up to retrieve URL
	if($strImgRedirectURL=="")
	{
		$strImgRedirectURL = "";
		$strImgUrl="";
		$retuser = oauth_request($keys, "https://api.twitter.com/1.1/users/profile_image/".$screen_name.".json");
		if (!strlen($retuser)) dump_last_request();

		$strImgRedirectURL = substr($retuser,strpos($retuser,'href="')+6,strpos($retuser,'">redirected')-strpos($retuser,'href="')-6);
	}

	//-- If using a default twitter profile image no original exists, so return bigger size image instead
	if((substr(basename($strImgRedirectURL),0,16)=="default_profile_") && ($size=="original"))
		$size = "bigger";
	
	//-- Get Larger (73*73) Size Avatar Image
	if($strImgRedirectURL!="")
	{
		$url = $strImgRedirectURL;
		$ext = strrchr($url, '.');
		switch($size)
		{
			case "mini":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_mini" . $ext;
				break;
			case "normal":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_normal" . $ext;
				break;
			case "bigger":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_bigger" . $ext;
				break;
			case "original":
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . $ext;
				break;
			default:
				$strImgUrl =  substr($url, 0, strrpos($url, "_")) . "_normal" . $ext;
				break;
		}
	}

	return $strImgUrl;
}	
?>


