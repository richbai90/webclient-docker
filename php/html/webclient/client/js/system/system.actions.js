//-- 22.10.2009
//-- common functions that are used across applications - These should not be customised
var sys = new Object();



//--
//-- run an action of some type from a menu click (typically application menu items like file->manage customer->add new or logcall->incident)

//-- defined actions
var __LCF = "lcf"; //-- open log new call
var __FRMADD = "frmadd"; //-- open form for add
var __FRMEDIT = "frmedit"; //-- open form for edit
var __FRMBROWSE = "frmbrowse"; //-- open form for browse
var __KBASE = "kbase"; //-- kbase action
var __SETTING = "settings"; //-- setting action
var __HELP = "hlp"; //-- setting action
var __TOOLS = "tools"; //-- setting action

//-- function
sys.mnu_run_action = function (strMenuItem)
{

	var arrInfo = strMenuItem.split("--");
	var strAction = arrInfo[0];
	var strParams = arrInfo[1];

	//-- run action based on type
	switch(strAction)
	{
		case __TOOLS:
			sys.run_tool(strParams);
			break;

		case __HELP:
			sys.run_help(strParams);
			break;

		case __TESTING:
			sys.run_test(strParams);
			break;
		case __SETTING:
			sys.process_setting(strParams);
			break;
		case __LCF:
			sys.lcf(strParams)
			break;
			break;
		case __FRMADD:
			app.OpenFormForAdd(strParams,"",false);
			break;
		case __FRMBROWSE:
			app.OpenForm(strParams,"",false);
			break;
		case __KBASE:
			kbase.run_action(strParams);
			break;
		default:
			alert("System Menu Action : The defined action is not supported. Please contact your Administrator.",true);
			break;
	}
}


//-- tools menu
sys.run_tool = function(strParams)
{
	if(strParams=="lockcalls")
	{
		//-- popup system lock calls form
		_open_system_form("_wc_manage_lockedcalls", "managelockcalls", "", "", false, null);
	}
	else if(strParams=="changepassword")
	{
		_open_system_form("_wc_resetpassword", "password", "", "", false, null);
	}
	else if(strParams=="sessions")
	{
		//-- popup system sessions form if an admin
		if(session.role==3)
		{
			_open_system_form("_wc_manage_sessions", "managesessions", "", "", false, null);
		}
		else
		{
			alert("This option is only accessible to Administrators.",true);
		}
	}
	else if(strParams=="multiclip")
	{
		app._open_system_form("_wc_multiclip_editor", "multiclip", "", "", false, null, null,window);
	}
	else if(strParams=="qlc")
	{
		app._open_system_form("_sys_qlc_manage", "qlc", "", "", false, null, null,window);
	}
	else if(strParams=="switch")
	{
		if(session.HaveRight(ANALYST_RIGHT_F_GROUP,ANALYST_RIGHT_F_CANSWITCHDATADICTIONARIES,true))
		{
			app._open_system_form("_wc_switchddf", "switchddf", "", "", true,function(popupForm)
			{
				if(popupForm._swdoc._selected_app!="")
				{
					var strURL = app.get_service_url("session/switchddf","");
					var strRes = app.get_http(strURL, "_switchddf=" + popupForm._swdoc._selected_app + "&swsessionid=" + app._swsessionid, true,false, null);
					if(strRes=="ok")
					{
						__refreshing = true;
						window.location.reload(true);
					}
					else
					{
						alert("Failed to switch application. Please contact your Administrator",true);
					}
				}
			
			});	
		}
	}

}

//-- help menu item
sys.run_help = function(strParams)
{
	if(strParams=="about")
	{
		app._open_system_form("about.php","help","","",true,null,null,window,400,200);
	}
	if(strParams=="feedback")
	{
		var xmlmc = new XmlMethodCall()
		if(xmlmc.Invoke("system","getSystemInfo"))
		{		
			if(xmlmc.GetReturnValue("disableFeedback")=="1")
			{
				alert("Please contact your Supportworks administrator to provide feedback");

			}
			else
			{
				app._open_system_form("feedback.php","feedback","","",true,null,null,window,600,385);
				
			}
			return;
		}
		else
		{
			alert(xmlmc.GetLastError())
		}
	}
	else if(strParams=="debugon")
	{
		app._bDebugMode = true;
	}
	else if(strParams=="debugoff")
	{
		app._bDebugMode = false;
		app._arrLog = new Array();
	}
	else if(strParams=="debugshow")
	{
		show_debug();
	}
	else if(strParams.indexOf("url::")==0)
	{
		//-- open url - parse it
		var strUrlInfo = strParams.split("::");
		var strURL = app._swc_parse_variablestring(strUrlInfo[1],document);
		window.open(strURL);
	}
}

sys.run_test = function(strParams)
{
	var arrParam = strParams.split("-");
	if(arrParam[0]=="hd")
	{
		run_helpdesk_test(arrParam[1])
	}
}



//-- log off analyst - call http to kill session then goto login page.
sys.logoff = function()
{
	app.close_portal();
	document.location.href = app._root;
}

//-- re-load client with new application.
sys.switchapplication= function(strApplication)
{

}

//-- open log new call
sys.lcf = function(strCallClass)
{
	global.LogNewCall(strCallClass)
}




//-- process an client setting (like switching activex on and off)
sys.process_setting = function (strParams)
{
	var arrParam = strParams.split("-");
	if(arrParam[0]=="activex")
	{
		app.boolActivex = (arrParam[1]=="true");
	}
	else if(arrParam[0]=="debug")
	{
		show_debug();
	}
	else if(arrParam[0]=="profile")
	{
		_profilecodeselector(arrParam[1],"","", app._profilecodeselected);
	}
	else if(arrParam[0]=="analyst")
	{
		_analystpicker("Assign/Transfer Request","", "", app._analystselected);
	}

}



var __NEWISSUE = "newissue"; //-- setting action
var __LOGOUT = "logout"; //-- setting action
var __REFRESH = "refresh"; //-- setting action
var __TESTING = "testing"; //-- setting action
var __EMAIL = "new_email"; //-- setting action
function application_toolbar_action(strParams)
{
	var arrInfo = strParams.split("--");
	var strAction = arrInfo[0];
	var strParams = arrInfo[1];

	//-- run action based on type
	switch(strAction)
	{
		case __EMAIL:
			app._newEmail();
			break;

		case __NEWISSUE:
			app._issueform("","",false, window);
			//_servicedesk_refresh_issues(); //-- refresh issues list if it is available
			break;

		case __LOGOUT:
			app.logout("");
			break;
		case __REFRESH:
			__refreshing = true;
			window.location.reload(true);
			break;
		case __SETTING:
			sys.process_setting(strParams);
			break;
	}
}
