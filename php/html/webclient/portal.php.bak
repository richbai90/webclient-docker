<?php 

	//-- 1. check valid session
	$excludeTokenCheck=true;

	
	include('php/session.php');
	
	
	//-- 2. Check if refreshed page - if temp session file exists then delete it
	$currPath = getcwd();
	$destination_path = $currPath ."/temporaryfiles";
	$destination_path = str_replace("\\","/",$destination_path);
	$filePath = $destination_path ."/".$oAnalyst->sessionid.".txt";
	if(is_file($filePath))
	{
		@unlink($filePath);
	}

	include('php/xml.helpers.php');
	include('client/workspace/_controls/toolbar/toolbarcontrol.php');

	//-- 3. check application path
	$handle = opendir($portal->fs_application_path);
	if(!$handle)
	{
		?>
		<script>
			document.location.href = "index.php?sessionerrormsg=m1";
		</script>
		<?php 
	}
	else
	{
	   closedir($handle);
	}
	
	//-- 4. process layout
	//-- get main and application toolbar xml
	$strFileName = $portal->fs_root_path."client/wcxml/toolbar.xml";
	$fp = @file_get_contents($strFileName);
	if($fp)
	{
		$xmlControl = domxml_open_mem($fp);
		$strToolBarHTML = toolbar_html($xmlControl,"app-toolbar");
	}
	$strFileName = $portal->fs_root_path."client/wcxml/mainbar.xml";
	$fp = @file_get_contents($strFileName);
	if($fp)
	{
		$xmlControl = domxml_open_mem($fp);
		$strMainBarHTML = toolbar_html($xmlControl,"app-mainbar");
	}

	//-- get any app js in app path and load
	$t=_CACHEFILEVERSION;

	
	$strOOBJSPath = $portal->fs_application_path . "js";

	//-- load oob js if any
	$strApplicationScriptBlock = file_get_contents("apps/_global/js/sw.js");
	if (file_exists($strOOBJSPath) && $handle = opendir($strOOBJSPath)) 
	{
		while (false !== ($file = readdir($handle))) 
		{
			if(strpos($file,".bak")!==false)continue;
			if(strpos($file,".js")!==false)
			{
				$strApplicationScriptBlock .= chr(13).file_get_contents($strOOBJSPath ."/" . $file);
			}
	    }
	    closedir($handle);
	}
	
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<title><?php echo $oAnalyst->analystid;?> (<?php echo $_SESSION["_wc_application_context"];?>) - Supportworks ESP Webclient <?php echo _VERSION;?></title>
<link rel="stylesheet" href="client/outlook/outlook-blue.css?t=<?php echo $t;?>" type="text/css" />
<link rel="stylesheet" href="client/workspace/_controls/toolbar/toolbar-blue.css?t=<?php echo $t;?>" type="text/css" />
<link rel="stylesheet" href="client/styles/main.css?t=<?php echo $t;?>" type="text/css" />

<script>
	//-- 18.05.2012 - webclient only var that we can store webclient only vars and functions against
	var _swcore = {};
	
	
</script>
<script src='client/js/jquery-1.11.1.min.js'></script>
<script src='client/loadcorejsfiles.php?t=<?php echo $t;?>'></script>

<script>
	//--
	//-- main js for controlling portal page loaded in portal.php
	var jqDoc = jqueryify(document); //-- so can use jquery

	//-- called when server has something to say
	var _boolProcessingMessage = false;
	function _process_server_message(strType,strMsg)
	{
		if(_boolProcessingMessage) return;
		_boolProcessingMessage = true;
		_boolProcessingMessage = false;
	}

	
	function logout(strMessage)
	{	
		var strParams = "?loggedout=1";
		//-- have to perform log out here
		var strURL = app.get_service_url("session/disconnect/index.php","");
		var res = app.get_http(strURL, "analystid=" + app._analyst_id + "&swsessionid=" + app._swsessionid, true,false, null);
		strParams+= (strMessage!="")?"&sessionerrormsg=" + encodeURIComponent(strMessage) : "";
		document.location.href = _root + strParams;	
	}

	var isIE  = (BrowserDetect.browser=="Internet Explorer")?true:false;
	var isIE9 = (isIE && BrowserDetect.version=="9")?true:false;
	var isIE10 = (isIE && BrowserDetect.version=="10")?true:false;
	var isIE11 = (isIE && BrowserDetect.version=="11")?true:false;
	var isIE8 = (isIE && BrowserDetect.version=="8")?true:false;
	var isIE7 = (isIE && BrowserDetect.version=="7")?true:false;
	var isIE6 = (isIE && BrowserDetect.version=="6")?true:false;
	var isIE10Above = (isIE && ((BrowserDetect.version-0)>9))?true:false;
	var isIE11Above = (isIE && ((BrowserDetect.version-0)>10))?true:false;
	var isIE12Above = (isIE && ((BrowserDetect.version-0)>11))?true:false;
	
	var isSafari  = (BrowserDetect.browser=="Safari")?true:false;
	var isFirefox  = (BrowserDetect.browser=="Firefox")?true:false;	
	var isOpera  = (BrowserDetect.browser=="Opera")?true:false;		
	var isChrome  = (BrowserDetect.browser=="Chrome")?true:false;		

	var isWindows = (BrowserDetect.OS=="Windows")?true:false;

	//-- create app reference
	var undefined;
	var app = this;
	var bWebClient = true; //-- so can skip code in full client if need be i.e. if(app.bWebClient==false) {then doo full client code}else{do webclient code}

	var _bDebugMode=false; //-- when you need to debug in dev mode set to true

	var boolActivex = false; //-- use activex


	//-- do we want to open a passed in callref..
	var _wc_opencallref = "<?php echo @$_REQUEST['opencallref']?>";

	var _wc_version = "<?php echo _VERSION;?>";
	var _wc_apps = "<?php echo $_SESSION['_wc_apps'];?>";
	var _swsessionid = "<?php echo $oAnalyst->sessionid;?>";
	var httpNextToken = "<?php echo $_SESSION['clienttoken'];?>";
	var _trustedlogon = "<?php echo @$_TRUSTEDLOGON;?>";

	var _analyst_id ="<?php echo $oAnalyst->analystid;?>";
	var _analyst_name ="<?php echo $oAnalyst->name;?>";
	var _analyst_supportgroup="<?php echo $oAnalyst->supportgroup;?>";
	var _analyst_in_supportgroups="<?php echo $oAnalyst->str_suppgroups;?>";
	var _analyst_in_pfs_supportgroups="<?php echo $oAnalyst->pfsstr_suppgroups;?>"; //-- prepared for sql


	var _analyst_telephone ="<?php echo $oAnalyst->contacta;?>";
	var _analyst_email ="<?php echo $oAnalyst->contacte;?>";
	var _analyst_dateformat ="<?php echo $oAnalyst->dateformat;?>";
	var _analyst_timeformat ="<?php echo $oAnalyst->timeformat;?>";
	var _analyst_datetimeformat ="<?php echo $oAnalyst->datetimeformat;?>";
	var _analyst_timezone = "<?php echo $oAnalyst->timezone;?>";
	var _analyst_privlevel = <?php echo $oAnalyst->priveligelevel;?>;
	var _analyst_admin = (_analyst_privlevel==3);
	var _analyst_timezoneoffset = <?php echo $oAnalyst->timezoneoffset;?>;
	var _analyst_userdefaults= <?php echo $oAnalyst->userdefaults;?>;
	var _analyst_maxbackdateperiod= <?php echo $oAnalyst->maxbackdateperiod;?>;
	var _analyst_rightsh= <?php echo $oAnalyst->rightsh;?>;

	//-- log call forms that are to be excluded - used in pick log call ype form
	var _exclude_log_forms = "<?php echo $portal->exclude_logcallforms;?>";
	if(_exclude_log_forms=="")_exclude_log_forms="''";

	var _root = "<?php echo $portal->root_path;?>";

	var _proxyurl = "<?php echo @_PROXYURL;?>";
	var _proxyport = "<?php echo @_PROXYPORT;?>";

	var _webserver = "<?php echo $portal->www_swpath;?>";
	var webroot = _webserver.substring(0,_webserver.length-1);
	var siteurl = webroot.replace("/sw","");
	var _serverip = "<?php echo $portal->sw_server_ip;?>";
	var _sw_www_port = "<?php echo $portal->sw_server_httpport;?>";
	var _www_port = "<?php echo $portal->www_port;?>";

	var server = "<?php echo $portal->sw_server_name;?>"; //-- 89837,89839
	var httpport = _www_port;

	var _application = "<?php echo $_SESSION['_wc_application_context'] ;?>";
	var _applicationpath = "apps/" + _application + "/";
	var _customapplicationpath = _applicationpath + "_customisation/";
	var _applicationxmlpath = "apps/" + _application + "/wcxml/";


	var _systempath  = "apps/system/";
	var _outlookcontrolpath = "client/outlook/controls/";
	var _workspacecontrolpath = "client/workspace/";
	var _navbarxmlname = "outlook.xml";
	var _dbtype = "<?php echo $portal->databasetype;?>";
	var _dbcaseinsensitive = "<?php echo $portal->databasecaseinsensive;?>";

	//-- global xml
	var _xmlManagedEntitySearches = null;
	var _xmlGlobalParameters = null;
	var _xmlPickLists = null;
	var _xmlSchema = null;
	var _xmlSystemSchema = null;

	//-- global vqars for use around 
	var _current_mailbox_prefix = "";

	//-- widget dir names
	var _worklist = "helpdesk/";
	var _dbsearch = "mesearch/";
	var _dbtree = "tree/";
	var _email = "email/";
	var _calendar = "calendar/";
	var _tabcontrol = "tabcontrol/";
	var _forms = "forms/";

	var eNavBar = null;
	var eAppToolbar = null;
	var eAppOutlook = null;
	var eAppWorkspace = null;
	var eAppTitleRight = null;
	var eAppOutlookWidgetHolder = null;
	var eAppOutlookBarItems = null;
	var eAppOutlookFloatDiv = null;
	var eAppOutlookResizer = null;
	var eAppOutlookResizerMover = null;
	var eDnDImage= null;

	var browserClassName = "";
	function initialise()
	{

		//-- set document body style
		if(isIE)
		{
			browserClassName = "ISIE ISIE" +BrowserDetect.version;
			if((BrowserDetect.version-0)>9) browserClassName += browserClassName = " ABOVE9";
			addClass(document.body,browserClassName);
		}
		
		//-- 26.04.2012- 88089 - use full proxyurl to work out root
		if(_proxyurl!="" && _proxyurl!="_PROXYURL")
		{
			//-- 02.05.2012 - 88102 - have to define webclient port so can be used in session.httpPort
			if(_proxyport!="" && _proxyport!="_PROXYPORT")
			{
				httpport = _proxyport;
			}
			else if (document.location.port!="")
			{
				//-- use protocol port in url or use sw http server port
				httpport = document.location.port;
			}
			
			webroot = document.location.protocol + "//"+document.location.host + ":"+httpport + "/sw";
			_webserver = webroot + "/";
			siteurl = document.location.protocol + "//"+document.location.host + ":"+httpport + "/";

			//-- root of webclient - 
			_root = _proxyurl;
			if(_root.charAt(_root.length-1)!="/")_root+="/";
		}

		
		eNavBar = document.getElementById("nav-items");
		eAppToolbar = document.getElementById("app-toobar");
		eAppOutlook = document.getElementById("app-outlook");
		eAppOutlookHolder = document.getElementById("outlookbar-holder");
		eAppOutlookWidgetHolder = document.getElementById("widget-holder");
		eAppWorkspaceHolder = document.getElementById("app-workspace-holder");
		eAppWorkspace = document.getElementById("app-workspace");
		eAppTitleRight = document.getElementById("app-title-right");
		eAppTitleRightRight = document.getElementById("app-title-right-right");
		eAppOutlookBarItems = document.getElementById("baritems-holder");
			
		eAppOutlookResizer = document.getElementById("app-layout-hresizer");
		eAppOutlookResizerMover = document.getElementById("app-layout-hmover");

		_initialise_schema_and_global_parameters(function()
		{
			load_application_navbar(document.getElementById("outlookbar-holder"));
			
			document.getElementById("app-layout").style.visibility="visible";
			app.disableSelection(document.getElementById("app-layout"));
			

			//-- check if we have a callref to open
			if(_wc_opencallref!="")
			{
				global.OpenCallDetailsView(_wc_opencallref);
			}
		});
	}


	//--
	//-- override alert function to ensure alerts popup on intended form window
	var bAlert = false;
	function altAlert (msg)
	{
		alert(msg);
		
		//document.getElementById("ifMsg").contentWindow.alert(msg);
	}
	
	function _alert(strMessage, boolUseMainWindowAlert)
	{
		if(boolUseMainWindowAlert)
		{
			//originalAlert(strMessage)
			altAlert(strMessage);
			//document.getElementById("ifMsg").contentWindow.alert(strMessage);
			return;
		}

		try
		{
			if(_CURRENT_JS_WINDOW!=null && _CURRENT_JS_WINDOW.closed!=true)
			{
				_CURRENT_JS_WINDOW.alert(strMessage);				
			}
			else
			{
				altAlert(strMessage);
			}
			}
		catch (e)
		{
			altAlert(strMessage);
	
		}
			
	}
	
	

	function _confirm(strMessage)
	{
		if(app._CURRENT_JS_WINDOW!=null && app._CURRENT_JS_WINDOW.closed!=true)
		{
			try
			{
				return app._CURRENT_JS_WINDOW.confirm(strMessage);				
			}
			catch (e)
			{
				return document.getElementById("ifMsg").contentWindow.confirm(strMessage)
			}

		}
		else
		{
			return document.getElementById("ifMsg").contentWindow.confirm(strMessage)

		}
	}

	function _prompt(strMessage,strAns)
	{
		if(app._CURRENT_JS_WINDOW!=null)
		{
			try
			{
				return app._CURRENT_JS_WINDOW.prompt(strMessage,strAns);				
			}
			catch (e)
			{
				return document.getElementById("ifMsg").contentWindow.prompt(strMessage,strAns)
			}
		}
		else
		{
			return document.getElementById("ifMsg").contentWindow.prompt(strMessage,strAns)

		}
	}
	//-- prompt

	//-- store appwide mouse position
	var _iAppMouseLeft = 0;
	var _iAppMouseTop = 0;
	function _track_appwide_mouse_cursor(bFromFrame,iLeft,iTop, bRightHandFrame)
	{
		var iAdjustLeft = 0;
		var iAdjustTop = 0;
		var strStatus = "";
		if(bFromFrame)
		{
			if(bRightHandFrame)
			{
				//-- get frames top and left position
				var oFrameHolder = eAppWorkspace;
			}
			else
			{
				var oFrameHolder = document.getElementById("widget-holder");
			}

			iAdjustLeft  = app.eleLeft(oFrameHolder);
			iAdjustTop = app.eleTop(oFrameHolder);
		}
		//window.status = (iLeft + iAdjustLeft) +":" + (iTop + iAdjustTop) ;
		
		//-- store drag and drop
		_iAppMouseLeft = (iLeft + iAdjustLeft);
		_iAppMouseTop = (iTop + iAdjustTop);

		if(bDragAndDrop)_drag_current_element();
		if(bResize)
		{
			eAppOutlookResizerMover.style.left = _iAppMouseLeft - 1;
		}

	}

	//-- rack mouse on just this document 
	document.iMouseLeft = 0;
	document.iMouseTop = 0;
	function _track_documentmouse(e) 
	{
		document.iMouseLeft = (window.Event) ? e.pageX : event.clientX;
		document.iMouseTop = (window.Event) ? e.pageY : event.clientY;
		app._track_appwide_mouse_cursor(false,document.iMouseLeft,document.iMouseTop);
		return;
	}

	function _trap_document_mouseup(e)
	{
		if(bResize)end_resize_outlook(e);
		if(bDragAndDrop)_stop_drag_drop(e)
		if(__bCancelDocumentMouseUpHideEvent)
		{
			__bCancelDocumentMouseUpHideEvent=false;
		}
		else
		{
			hide_application_menu_divs();
		}
	}

	//-- start resize of workspace
	var bResize = false;
	function start_resize_outlook(e)
	{
		bResize = true;

		eAppOutlookFloatDiv = document.getElementById("app-layout-float-div");
		eAppOutlookFloatDiv.style.display='block';
		eAppOutlookFloatDiv.style.width="100%";
		eAppOutlookFloatDiv.style.height="100%";

		//oCurrentOutlookControl.style.display="none";

		eAppOutlookResizerMover.style.display = "block";
		eAppOutlookResizerMover.style.height = eAppOutlookResizer.offsetHeight - 2;
		eAppOutlookResizerMover.style.left = eAppOutlookResizer.offsetLeft;
		eAppOutlookResizerMover.style.top = 26;

	}

	function end_resize_outlook(e)
	{
		if(bResize)
		{
			bResize = false;
			oCurrentOutlookControl.style.display="block";
			eAppOutlookFloatDiv.style.display='none';
			eAppOutlookResizerMover.style.display = "none";
			if(_iAppMouseLeft>100)
			{
				eAppOutlook.style.width = _iAppMouseLeft - 1 - document.getElementById("app-mini-nav").offsetWidth;
			}
			else
			{
				//-- user has made it so small may as well hide it
				document.getElementById("nav-inout").click();
				eAppOutlook.style.width = "230px";
			}

			//-- resize window table dimensions
			_resize_browser_layout();

		}
	}
	//-- EOF outlook resizing

	//-- window resizing
	function _resize_browser_layout()
	{
		var eLayoutTable = document.getElementById("app-layout");
		if(!app.isIE)
		{
			app.debugstart(document.body.offsetWidth,"Resizewidth");
			eAppWorkspace.style.display="none";
			var iAd = (eAppOutlook.style.display=="none")?4:2;
			eLayoutTable.style.width = document.body.offsetWidth;

			try
			{
				eAppWorkspace.style.display="hide";
				eAppWorkspace.style.width = eLayoutTable.offsetWidth - eAppOutlook.offsetWidth - document.getElementById("app-mini-nav").offsetWidth - 11 + iAd;
				eAppWorkspace.style.display="block";
			}
			catch(e){}

			app.debugend(document.body.offsetWidth,"Resizewidth");
		}

		//--set fixed height for workspace holder - stopr ie iframe onresize events when highlighting buttons and dropping menus
		try
		{
			var realTopForWorkSpace = getRealPosition(eAppWorkspace);
			var realTopForOutlook = getRealPosition(eAppOutlookHolder);

			document.getElementById("app-mini-nav").style.display="none";
			eAppWorkspace.style.display="none";		
			eAppOutlookHolder.style.display="none";					
			eAppWorkspace.style.height = eLayoutTable.offsetHeight - realTopForWorkSpace.realTop - 2;
			eAppOutlookHolder.style.height = eLayoutTable.offsetHeight - realTopForOutlook.realTop - 4;
			eAppOutlookHolder.style.display="block";		
			eAppWorkspace.style.display="block";			
			document.getElementById("app-mini-nav").style.display="block";	
			
		}	
		catch(e){}
		//-- 05-02-2013 - resize outlook nav bar and intialise scrolling if needed
		check_navbar_scrolling();

		//-- resize active workspace in 100 mill
		if(canAccessWorkspace() && oWorkspaceFrameHolder.resize_workspace)
		{
			oWorkspaceFrameHolder.resize_workspace();
		}

		//-- 15.03.2013 - hide any menus
		hide_application_menu_divs();
	}

	function check_navbar_scrolling()
	{
		if(application_navbar==null) return;

		if(eNavBar)
		{
			//-- set overflow to auto  - get scroll height and test
			eNavBar.style.display="none";
			eNavBar.style.height = eAppWorkspace.offsetHeight-35;
			eNavBar.style.display="block";
			eNavBar.style.overflow = "auto";
			var scrollHeight = eNavBar.scrollHeight;
			eNavBar.style.overflow = "hidden";
			if((scrollHeight) > eNavBar.offsetHeight)
			{
				//-- show
				document.getElementById("ol_scrollup").style.display = "block";
				document.getElementById("ol_scrolldown").style.display = "block";
			}
			else
			{
				//-- hide
				document.getElementById("ol_scrollup").style.display = "none";
				document.getElementById("ol_scrolldown").style.display = "none";
			}
		}
	}
	//-- eof window resizing

	//--
	//-- drag and drop
	var _current_draganddrop_ele = null;
	var bDragAndDrop = false;
	function _start_drag_drop(oEle)
	{
		_current_draganddrop_ele = oEle;
		bDragAndDrop = true;
		eDnDImage = document.getElementById("img_dnd");
	}

	function _drag_current_element()
	{
		//-- position drag image just below cursor
		if(eDnDImage!=null)
		{
			if(eDnDImage.style.display!="block")eDnDImage.style.display="block";
			eDnDImage.style.left=_iAppMouseLeft+15;
			eDnDImage.style.top=_iAppMouseTop+15;		
		}
	}

	function _stop_drag_drop(oEleTrapMovement, oEleMove, iLeft,iTop)
	{
		//-- hide drag icon
		eDnDImage = document.getElementById("img_dnd");
		if(eDnDImage!=null)
		{
			eDnDImage.style.display = "none";
		}

		//-- reset global vars
		var tempEle = _current_draganddrop_ele;
		_current_draganddrop_ele= null;
		bDragAndDrop = false;
		
		//-- get element at mouse position (iframe)
		var dropOnFrame = document.elementFromPoint(_iAppMouseLeft,_iAppMouseTop);
		if(dropOnFrame!=null && dropOnFrame.tagName && dropOnFrame.tagName=="IFRAME")
		{
			//-- get iframe document and ge element 
			var eleTop = _iAppMouseTop - app.eleTop(dropOnFrame);
			var eleLeft = _iAppMouseLeft - app.eleLeft(dropOnFrame);

			//-- check if dropping on a a tag (tree node)
			var dropOnElement = dropOnFrame.contentWindow.document.elementFromPoint(eleLeft,eleTop);
			if(dropOnElement!=null && dropOnElement.tagName)
			{
				if(dropOnElement.tagName=="A" || dropOnElement.parentNode.tagName=="A")
				{
					if(dropOnElement.parentNode.tagName=="A")dropOnElement = dropOnElement.parentNode;

					//-- helpdesk tree or email tree
					var treeID = dropOnElement.getAttribute("treeid");
					if(treeID!=null && treeID!="")
					{
						var aTree = dropOnFrame.contentWindow[treeID];
						var aNode = aTree.getNodeByID(dropOnElement.getAttribute("nodeid"));
						dropOnElement = null;
						dropOnFrame = null;
						if(aNode!=null)
						{
							if(aTree.ondropelement)aTree.ondropelement(aNode,tempEle);
						}
					}
				}
				else
				{
					//-- not dragging watched call onto watched call
					var strFromTableHolder = app.get_parent_owner_by_att(tempEle,"dbtablename");
					if(strFromTableHolder!=null)
					{
						var strTableHolderName = strFromTableHolder.getAttribute("dbtablename");
						if(strTableHolderName.toLowerCase()=="watchcalls") return false;
					}	
					
					//-- check if dropped onto watched calls
					//-- get parentnode tha has att of 
					var oSDTableHolder = app.get_parent_owner_by_att(dropOnElement,"dbtablename");
					if(oSDTableHolder!=null)
					{
						var strTable = oSDTableHolder.getAttribute("dbtablename");
						if(strTable.toLowerCase()=="watchcalls")
						{
							//-- add dragged call to watchcalls list
							var strKeyCol = tempEle.getAttribute('keycolumn');
							if(strKeyCol=="opencall.callref")
							{
								var intKeyValue = tempEle.getAttribute('keyvalue');
								var oHD = new HelpdeskSession();
								if(oHD.WatchCall(intKeyValue, session.analystId))
								{
									_servicedesk_refresh_watched_calls();
								}
							}
						}
						else if(strTable.toLowerCase()=="swissues")
						{
						}

					}
				}
			}
		}
	}
	//-- EOF drag and drop

	function refresh_portal()
	{


	}

	//-- handle closing of portal
	var __logging_out = false;
	var __refreshing = false;
	function close_portal(boolForceLoggingOut)
	{
		//-- we have to close opened windows even if just freshing portal as arrays that winodws are stored in will empty.
		for(strWin in app.__window_pointers)
		{
			try
			{
				app.__window_pointers[strWin].self.close();
			}
			catch(e){}
		}
	
		if(!app.isSafari)
		{
			//-- log off analyst  - but only if not doing a refresh
			var strURL = app.get_service_url("session/disconnect/checkbrowserrefresh.php","");
			app.get_http(strURL, "analystid=" + app._analyst_id + "&swsessionid=" + app._swsessionid, false,false, null,null,0,"",true);
		}
		// F0092285 - Session logout every time the Web Client is refreshed
		//			- Removed call to logout() as will close session when a refresh occurs
		//-- tidy up any temp uploaded files - does not need session to be active
		var strURL = app.get_service_url("session/cleanuptempfiles","");
		app.get_http(strURL, "analystid=" + app._analyst_id + "&swsessionid=" + app._swsessionid, true,false, null,null,0,"",true);
		
		//-- destroy everything
		deleteChildNodes(document.body);
	}

	function deleteChildNodes(node)
	{
		var prev;
		
		for (var child = node.lastChild; child; child = prev) 
		{
			prev = child.previousSibling;

			if (child.nodeType == 1) 
			{
				try
				{
					node.removeChild(child);				
				}
				catch (e)
				{
				}

				continue;
			} 

			deleteChildNodes(child);
		}
	}

	function _handle_portal_keystrokes(oEv)
	{
		if(oEv==undefined)oEv = this;
		var intKC = app.getKeyCode(oEv)

		//-- trap backspace key so do not go back to last page (logon screen)
		if(intKC==8)
		{
			//-- if src element is not an input element then cancel
			var ele = app.getEventSourceElement(oEv);
			if(ele.tagName=="INPUT" || ele.tagName=="TEXTAREA")return true;

			app.stopEvent(oEv);
			return false;
		}
		else if(oEv.ctrlKey && oEv.shiftKey && intKC==68)
		{
			if(!app._bDebugMode)
			{
				app._bDebugMode = true;
				
			}
			if(confirm("Would you like to show the debugger form?"))app.show_debug();
		}
		return true;
	}

	function _handle_scroll()
	{
			window.scrollTo(0,0);
	}


	document.oncontextmenu = rf;

	//-- capture mouse movement
	if (document.Event && !isIE) 
	{
		document.captureEvents(Event.MOUSEMOVE);
		document.captureEvents(Event.MOUSEUP);
	}
	document.onmousemove = _track_documentmouse;
	document.onmouseup = _trap_document_mouseup;

	function rf(){return false;}
</script>

<script src='client/forms/js/min/swjs.classes.js?t=<?php echo $t;?>'></script>


</head>

<body onload="initialise();" onresize="_resize_browser_layout()" onkeydown="return _handle_portal_keystrokes(event,this);" onbeforeunload="close_portal(false);"  oncontextmenu="return false;" onscroll="_handle_scroll();">
<!-- frame for doing popup messages -->
<iframe id='ifMsg' src='client/blank.htm' style='display:none;' sandbox="allow-same-origin allow-forms allow-scripts"></iframe>

<div id='app-layout-float-div'></div>
	<table id='app-layout' ondragstart="return false;" onselectstart="return false;" width="100%" height="99.9%" cellspacing="0" cellpadding="0" border="0">
		<tr>
			<!-- toolbar - loads app/appid/toolbar.xml-->
			<td colspan="4">
				<table width="100%" cellspacing="0" cellpadding="0" border="0">
				<tr>
					<td width="100%">
						<div id='app-mainbar'><?php echo $strMainBarHTML;?></div>
					</td>
					<td noWrap>
						<div id='app-toobar'><?php echo $strToolBarHTML;?></div>
					</td>
				</tr>
				</table>
			</td>
		</tr>
		<tr height="100%">
			<td valign='top' id='app-mini-nav' noWrap >
				<div id="nav-inout" expanded="1">&lt;&lt;</div>
				<div id='ol_scrollup' class='scrollup display-none' onmousedown='navbar_scrollup(event);' onmouseup='stopscrolling(event);'>up</div>
				<div id="nav-items" onclick='click_navbar(this,event);'></div>
				<div id='ol_scrolldown' class='scrolldown display-none' onmousedown='navbar_scrolldown(event);' onmouseup='stopscrolling(event);'>down</div>
			</td>
			<td valign='top'>
				<div id='app-outlook'>
					<div id="outlookbar-holder">
						<table height="100%" width="100%" cellspacing="0" cellpadding="0" border="0">
							<tr>
								<td id='ol-title-holder' valign="middle" noWrap><div id="title-holder">&nbsp;</div></td>
							</tr>
							<tr>
								<td valign="bottom" height="100%"><div id="widget-holder"></div></td>
							</tr>
						</table>
					</div>
				</div>
			</td>
			<td>
				<div id='app-layout-hresizer' onmousedown="start_resize_outlook();" ></div>
			</td>
			<td valign='top' width='100%' style="padding-left:2px;padding-right:2px;">
				<div id='app-workspace-holder'>
					<table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">
						<tr>
							<td id='app-title-right' noWrap>&nbsp;</td><td id='app-title-right-right' noWrap align='right'>&nbsp;</td>
						</tr>
						<tr>
							<td valign="bottom" height="100%"  colspan="2"><div id="app-workspace"></div></td>
						</tr>
					</table>
				</div>
			</td>
		</tr>
	</table>

<!-- hover div for resizing layout -->
<div id='app-layout-hmover'  name='app-layout-hresizer'></div>

<!-- for loading html into visible iframes using post -->
<form id='form_iframeloader' target="" action="" method="POST" style='display:none;' >
<input type="hidden" name="appid"  id="frm_appid">
<input type="hidden" name="viewid" id="frm_viewid">
<input type="hidden" name="xmlfile" id="frm_xmlfile">
<input type="hidden" name="controlid" id="frm_controlid">
<input type="hidden" name="controltype" id="frm_controltype">
<input type="hidden" name="swsessionid" id="frm_swsessionid">
<input type="hidden" name="sessid" id="frm_swsessid">
<input type="hidden" name="analystid" id="frm_analystid">
<input type="hidden" name="ColourScheme" id="frm_schemacolour" value="4"> <!-- silver -->
<input type="hidden" name="_webclient" id="frm_webclient">
<input type="hidden" name="sessiontoken" value='<?php echo $_SESSION['clienttoken'];?>'>
</form>
<!-- for uplaoding files outside of forms - i.e. my library -->
<form id='form_fileuploader' name='form_fileuploader' enctype="multipart/form-data" target="iframe_webclient_fileuploader" action="" method="POST" style='display:none;width:0px;height:0px;'>
<input type="hidden" name="genfieldone" id="frm_genfieldone">
<input type="hidden" name="sessiontoken" value='<?php echo $_SESSION['clienttoken'];?>'>
</form>
<!-- drag deop img -->
<img id='img_dnd' src='client/images/dnd.gif' style='display:none;position:absolute;'/>

</body>

<script>
	<?php echo $strApplicationScriptBlock; ?>;
</script>

</html>

