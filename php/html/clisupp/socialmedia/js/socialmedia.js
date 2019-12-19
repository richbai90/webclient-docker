function deleteTweet(intSwMsgID)
{
	remove_tweet(intSwMsgID);
	var msgDiv = document.getElementById('messagewrap'+intSwMsgID);
	msgDiv.style.display="none";
}

//-- remove a tweet
function remove_tweet(intSwMsgID)
{
	var strPHP = "delete_msg.php";
	var strURL = app.portalroot + strPHP + "?in_msgid=" + intSwMsgID;
	var strHTML = app.run_php(strURL,true);
	loadHiddenIframeWA();
}

//-- send a retweet
function send_retweet(intSwMsgID, strSwMsgID, strUserId, sessid)
{
	var strPHP = "twitter/retweet.php";
	var strURL = app.portalroot + strPHP + "?sessid="+sessid+"&strUserId="+strUserId+"&in_msgid=" + intSwMsgID+"&in_msgidstr=" + strSwMsgID;
	var strHTML = app.run_php(strURL,true);
	var oRTDiv = document.getElementById('rt'+strSwMsgID);
	var oRTCDiv = document.getElementById('rtc'+strSwMsgID);
	if(oRTDiv!=null)
		oRTDiv.style.display="none";
	if(oRTCDiv!=null)
		oRTCDiv.style.display="none";
	loadHiddenIframeWA();
}

function showConversation(intSwMsgID, sessid, strUserName)
{
	var strPHP = "load_conversation.php?sessid="+sessid;
	var strURL = app.portalroot + strPHP + "&in_msgid=" + intSwMsgID + "&in_username=" + strUserName;
	var strHTML = app.run_php(strURL,true);
	var msgConvDiv = document.getElementById('messageconv'+intSwMsgID);
	msgConvDiv.innerHTML = strHTML;
	if((msgConvDiv.style.display=="none") || (msgConvDiv.style.display==""))
	{
		msgConvDiv.style.display="inline";
	}
	else if(msgConvDiv.style.display=="inline")
	{
		msgConvDiv.style.display="none";
	}
	loadHiddenIframeWA();
}

function send_dm(strUserId, strUserName, sessid)
{
	app.openWin("send_dm.php?sessid="+sessid+"&strUserName="+strUserName+"&strUserId="+strUserId, "theName",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=300,width=650");
}

function send_reply(intSwMsgID, strAccountName, intTweetId, strAppType, strAPICall, sessid)
{
	//-- If message is from a live feed and not in socmed_comms table, add it for reference
	if(intSwMsgID=="")
	{
		var strPHP = "twitter/add_communication.php?strAppType="+strAppType+"&strAPICall="+strAPICall+"&intTweetId="+intTweetId;
		var strURL = app.portalroot + strPHP;
		var intSwMsgID = app.run_php(strURL,true);
		if(intSwMsgID=="0")
		{
			alert("Failed to create new communication record in Supportworks.  Please contact your Supportworks Administrator.");
			return;
		}
	}
	if(intSwMsgID!="")
		app.openWin("send_reply.php?strDefaultText="+strAccountName+"&sessid="+sessid+"&intTweetId="+intTweetId+"&intSwMsgID="+intSwMsgID, "theName",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=300,width=650");

	loadHiddenIframeWA();
}

function send_update(sessid)
{
	app.openWin("send_update.php?sessid="+sessid, "msgUpdate",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=300,width=650");
}

function load_feed(oDiv, sessid, strFeedType, strFeedId, intStartFromCommsId, bShowHeader, strFeedName)
{
	/*
		@strFeedType - Mention, DM, Search
	*/
	var strPHP = "load_feed.php?sessid="+sessid+"&feedtype="+strFeedType+"&feedid="+strFeedId+"&startFromCommsId="+intStartFromCommsId+"&bShowHeader="+bShowHeader+"&strFeedName="+strFeedName;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	var oFeedDiv = document.getElementById(oDiv);

	//-- Hide previous "Show More" link div
	var morediv=document.getElementById('messageloadmore'+intStartFromCommsId);
	if(morediv)
		morediv.style.display='none';

	//-- If paging then append records, else just display them
	if(intStartFromCommsId>0)
	{
		oFeedDiv.innerHTML += strHTML;
	}
	else
	{
		oFeedDiv.innerHTML = strHTML;
	}
	loadHiddenIframeWA();
}

function loadDMs(strDiv, sessid, intPageId, strUserId)
{
	var strPHP = "/twitter/load_dm.php?sessid="+sessid+"&strUserId="+strUserId+"&intPageId="+intPageId;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv = document.getElementById(strDiv);

	//-- Hide previous "Show More" link div
	var morediv=document.getElementById('messageloadmore'+intPageId);

	if(morediv)
		morediv.style.display='none';

	//-- If paging then append records, else just display them
	if(intPageId>1)
	{
		oDiv.innerHTML += strHTML;
	}
	else
	{
		oDiv.innerHTML = strHTML;
	}
	loadHiddenIframeWA();
}

function loadSentDMs(strDiv, sessid, intPageId, strUserId)
{
	var strPHP = "/twitter/load_dm_sent.php?sessid="+sessid+"&strUserId="+strUserId+"&intPageId="+intPageId;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv = document.getElementById(strDiv);

	//-- Hide previous "Show More" link div
	var morediv=document.getElementById('messageloadmore'+intPageId);

	if(morediv)
		morediv.style.display='none';

	//-- If paging then append records, else just display them
	if(intPageId>1)
	{
		oDiv.innerHTML += strHTML;
	}
	else
	{
		oDiv.innerHTML = strHTML;
	}
	loadHiddenIframeWA();
}

function loadTimeline(strDiv, sessid, intPageId, strUserId)
{
	var strPHP = "/twitter/load_timeline.php?sessid="+sessid+"&strUserId="+strUserId+"&intPageId="+intPageId;
	//alert(strPHP);
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv = document.getElementById(strDiv);

	//-- Hide previous "Show More" link div
	var morediv=document.getElementById('messageloadmore'+intPageId);

	if(morediv)
		morediv.style.display='none';

	//-- If paging then append records, else just display them
	if(intPageId>1)
	{
		oDiv.innerHTML += strHTML;
	}
	else
	{
		oDiv.innerHTML = strHTML;
	}
	loadHiddenIframeWA();
}

function showUser(oDiv, strUserId, strUserName, sessid)
{
	var strPHP = "load_user.php?sessid="+sessid+"&in_userid=" + strUserId + "&in_username=" + strUserName;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	var oInfoDiv = document.getElementById(oDiv);
	oInfoDiv.innerHTML = strHTML;
	loadHiddenIframeWA();
}

function followUser(oDiv, strUserId, strUserName, sessid, strFollowUserId, strFollowUserName)
{
	//if((strUserId=="" || strUserId==undefined) && (getProfileCount()>1))
	if((strUserId=="" || strUserId==undefined))
	{
		showProfileSelection(oDiv, strFollowUserId, strFollowUserName, sessid, "follow");
		return;
	}

	var strPHP = "twitter/set_follow_user.php?sessid="+sessid+"&strUserId=" + strUserId + "&strUserName=" + strUserName + "&strFollowUserId=" + strFollowUserId+"&strFollowUserName="+strFollowUserName;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	var oDiv = document.getElementById(oDiv);
	oDiv.innerHTML = strHTML;
	oDiv.style.display="inline";
	loadHiddenIframeWA();
}

function unfollowUser(oDiv, strUserId, strUserName, sessid, strFollowUserId, strFollowUserName)
{
	//if((strUserId=="" || strUserId==undefined) && (getProfileCount()>1))
	if((strUserId=="" || strUserId==undefined))
	{
		showProfileSelection(oDiv, strFollowUserId, strFollowUserName, sessid, "unfollow");
		return;
	}

	var strPHP = "twitter/set_unfollow_user.php?sessid="+sessid+"&strUserId=" + strUserId + "&strUserName=" + strUserName + "&strFollowUserId=" + strFollowUserId+"&strFollowUserName="+strFollowUserName;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	var oDiv = document.getElementById(oDiv);
	oDiv.innerHTML = strHTML;
	oDiv.style.display="inline";
	loadHiddenIframeWA();
}

function showProfileSelection(oDiv, strFollowUserId, strFollowUserName, sessid, strFollowAction)
{
	var strPHP = "twitter/showprofileicons.php?sessid="+sessid+"&strFollowUserId=" + strFollowUserId+"&strFollowUserName="+strFollowUserName+"&strFollowAction="+strFollowAction;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = "Select the Profile to "+strFollowAction+" this user<br/>" + strHTML;
	oDiv.style.display="inline";
	loadHiddenIframeWA();
}

function showRetweetProfileSelection(oDiv, msgid, sessid)
{
	var strPHP = "twitter/showprofileicons.php?sessid="+sessid+"&strAction=retweet&msg_id="+msgid;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	var oDiv = document.getElementById(oDiv);
	oDiv.innerHTML = "Select the Profile from which to retweet<br/>" + strHTML;
	oDiv.style.display="inline";
	loadHiddenIframeWA();
}

function getProfileCount()
{
	//-- Check no of profiles, if only 1 then use it, otherwise show dialog for choosing profile
	var strPHP = "twitter/countprofiles.php";
	var strURL = app.portalroot + strPHP;
	var strCount = app.run_php(strURL,true);
	return strCount;
}

function add_search(sessid,strSearchText)
{
	//app.openWin("add_search.php?sessid="+sessid, "addSearch",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=550,width=800");
	app.openWin("add_search.php?sessid="+sessid+"&searchqry="+strSearchText, "addSearch",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=350,width=600");
}

function edit_search(intSearchId, sessid, strSearchText)
{
	app.openWin("add_search.php?sessid="+sessid+"&searchid="+intSearchId+"&searchqry="+strSearchText, "addSearch",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=350,width=600");
}

function runSearch(strSearchText, oDiv, sessid, intPageId)
{
	var strPHP = "/twitter/run_search.php?sessid="+sessid+"&searchqry="+strSearchText+"&intPageId="+intPageId;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);

	//-- Hide previous "Show More" link div
	var morediv=document.getElementById('messageloadmore'+intPageId);

	if(morediv)
		morediv.style.display='none';

	//-- If paging then append records, else just display them
	if(intPageId>1)
	{
		oDiv.innerHTML += strHTML;
	}
	else
	{
		oDiv.innerHTML = strHTML;
	}
	loadHiddenIframeWA();
}
function load_older(strSearchText, oDiv, sessid, intPageId)
{
	var strPHP = "/twitter/run_search.php?sessid="+sessid+"&searchqry="+strSearchText+"&scince_id="+intPageId;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = strHTML;
}
function load_younger(strSearchText, oDiv, sessid, intPageId)
{
	var strPHP = "/twitter/run_search.php?sessid="+sessid+"&searchqry="+strSearchText+"&max_id="+intPageId;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = strHTML;
}
function delete_search(intSearchId, sessid, oDiv)
{
	var strPHP = "delete_search.php?in_searchid=" + intSearchId;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	var oDiv = document.getElementById(oDiv);
	loadMsgMenu(oDiv,sessid);
}

function loadMsgMenu(oDiv,sessid)
{
	var strPHP = "load_msg_menu.php?sessid="+sessid;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = strHTML;
	loadHiddenIframeWA();
}

function add_shortened_link_to_msg(oEle, strLongUrl, oEleError)
{
	oEleError.innerHTML = "";
	var strShortUrl = get_shortened_url(strLongUrl);
	if(strShortUrl.substring(0,9) == "SWERROR::")
	{
		oEleError.innerHTML = strShortUrl.substring(9,strShortUrl.length);
	}
	else
	{
		oEle.value += " "+strShortUrl;
	}
}

function get_shortened_url(strLongUrl)
{
	var strPHP = "/twitter/shorten_url.php?longurl="+strLongUrl;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	return strHTML;
}

function update_msg_character_count(oEle, oDiv)
{
	var intMaxChars = 140;
	var intRemainingChars = intMaxChars - oEle.length;
	oDiv.innerHTML = intRemainingChars+" Characters Remaining";
}

function assignAnalystToProfile(strProfileID)
{
	app.openWin("add_analyst.php?strProfileID="+strProfileID, "addAnalyst",  "status=yes,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,height=550,width=600");
}

function showAnalystRights(strProfileID, sessid, strProfileName)
{
	var strURL =  "analyst_permissions.php?sessid="+sessid+"&strProfileID="+strProfileID+"&strProfileName="+strProfileName;
	pWin = openWin(strURL,"","scrollbars=yes,resizable=no,menubar=no,toolbar=no,height=600,width=800");
}

function showProfileAnalysts(strDiv, strProfileID, sessid, strGroupID)
{
	oDiv = document.getElementById(strDiv);

	var strPHP = "social_profile_analysts.php?sessid="+sessid+"&strProfileID="+strProfileID+"&strGroupID="+strGroupID;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = strHTML;

	if(oDiv.style.display=="none")
	{
		oDiv.style.display="inline";
	}
	else if(oDiv.style.display=="inline")
	{
		oDiv.style.display="none";
	}
}

function deleteProfile(strProfileID, strProfileName)
{
	oDiv = document.getElementById('page_holder');
	var strPHP = "update.socialprofiles.php?sm_acc_idp="+strProfileID+"&sm_acc_namep="+strProfileName;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = strHTML;
}

function submit_analystrights(strForm, strFieldID)
{
	var oForm = document.getElementById(strForm);
	var oUpdField = document.getElementById(strFieldID);
	
	for(i=0;i<oForm.elements.length;i++)
	{
		var field=oForm.elements[i];

		if (field.type=='checkbox')
		{
			if(field.checked)
			{
				if(oUpdField.value!="")
					oUpdField.value += ",";
				oUpdField.value += field.id;
			}
		}
	}

	oForm.submit();

}

function showGroupSettings(sessid)
{
	var strURL =  "group_settings.php?sessid="+sessid;
	pWin = openWin(strURL,"","scrollbars=yes,resizable=no,menubar=no,toolbar=no,height=650,width=800");
}

function showGroupProfiles(strDiv, strProfileID, sessid, strGroupID)
{
	oDiv = document.getElementById(strDiv);

	//var strPHP = "social_profile_analysts.php?sessid="+sessid+"&strProfileID="+strProfileID+"&strGroupID="+strGroupID;
	var strPHP = "groups_social_profile.php?sessid="+sessid+"&strProfileID="+strProfileID+"&strGroupID="+strGroupID;
	var strURL = app.portalroot + strPHP;
	var strHTML = app.run_php(strURL,true);
	oDiv.innerHTML = strHTML;

	if(oDiv.style.display=="none")
	{
		oDiv.style.display="inline";
	}
	else if(oDiv.style.display=="inline")
	{
		oDiv.style.display="none";
	}
}


function loadHiddenIframeWA()
{
	//-- this is a workaround to submit a hidden blank Iframe, this enables hsl: links to
	//-- continue to work after an ajax content fill of a div
	if(document.getElementById('iframewa'))
	{
		var strMessageHolder = "iframewa";
		var strURL = "http://localhost";
		run_hidden_form(strURL,strMessageHolder,document);
	}
}
