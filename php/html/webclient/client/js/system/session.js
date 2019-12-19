var _arr_tablenames_by_pos = new Array();

//-- hold xml dom for mailbox list
var _arr_xml_mailbox_list = new Array();

//-- hold calendars the user has access to
var _arr_xml_calendar_list = new Array();

//-- hold cdf form names
var _arr_cdf_forms = new Array();

//-- hold helpdesk xml
var _helpdesk_view_tree_reload = false;
var _xml_helpdesk_view_tree = null;
var _xml_helpdesk_view_3p_tree = null;
var _xml_helpdesk_assign_tree = null;
var _xml_helpdesk_3p_assign_tree = null;

//-- hold multiclip tree xml
var _xml_multiclip_tree = null;

var _xml_defaultslainfo = null;

var _xml_logcallconfirmation = null;

//-- 26.10.2009 - mimic full client session functions and vars
var session = new Object();

//-- variables
session.AnalystId = "";
session.analystId = "";
session.analystID = "";
session.analystid = "";
session.analystname = "";
session.groupId = "";
session.currentAnalystId = "";
session.currentGroupId = "";
session.contextMode = "";
session.dataDictionary = "";
session.httpPort = 80;
session.isAdmin = false;
session.maxBackdatePeriod = 0;
session.port = 0;
session.role = 0;
session.server = "";
session.serverBuild = "";
session.sessionId = "";
session.timezone = "";
session.timezoneOffset = "";
session.wsIpAddress = "";
session.rightsjson = null;
session.dataset = "";
session.currentddDataset = "";
session.datasetFilterList = "";
session.currentddDatasetFilterList = "";

function _initialise_appdot_variables()
{
	//-- 91819 so usable in customhelpmenu.xml
	app.sessionid = session.sessionId;
	app.sessionId = session.sessionId;
	app.currentdd = session.dataDictionary
	app.instance = "SW";

	//-- use setting from ddf (getsessioninfo2 should also return these)
	app.dataset = app.dd.GetGlobalParamAsString("Application Settings/Dataset");	
	app.datasetfilterlist = app.dd.GetGlobalParamAsString("Application Settings/DatasetFilterList");	
	
	//-- copy to session var ? why do we have some many holding the same thing?
	session.dataset = app.dataset;
	session.currentddDataset = app.dataset
	session.datasetFilterList = app.datasetfilterlist;
	session.currentddDatasetFilterList = app.datasetfilterlist;
}

//-- methods
function _initialise_analyst_session_variables()
{	
	//-- show create issue icon
	var strIssuesVisible = app.dd.GetGlobalParamAsString("Views/helpdesk view/bottom/issues view/visible");	
	var bShowNewIssue = (strIssuesVisible.toLowerCase()=="yes")?true:false;
	app.toolbarmenu_item_sorh("newissue" , bShowNewIssue, document);

	session.AnalystId = _analyst_id;
	session.analystId = _analyst_id;
	session.analystid = _analyst_id;
	session.analystID = _analyst_id;
	session.analystname = _analyst_name;

	session.groupId = _analyst_supportgroup;
	session.groupid = _analyst_supportgroup;
	session.currentAnalystId = _analyst_id;
	session.currentGroupId = _analyst_supportgroup;
	session.userdefaults = _analyst_userdefaults;
	session.contextMode = "";
	session.dataDictionary = _application;
	session.isAdmin = _analyst_admin;
	session.maxBackdatePeriod = _analyst_maxbackdateperiod;
	session.role = _analyst_privlevel;
	session.serverBuild = "";
	session.sessionId = _swsessionid;
	session.timezone = _analyst_timezone;
	session.timeZone = _analyst_timezone;
	session.timezoneOffset = _analyst_timezoneoffset;
	session.timezoneOffset--;session.timezoneOffset++;
	session.timeZoneOffset = session.timezoneOffset;

	//-- 26.04.2012- 88089 - so appdev urls point to correct location
	session.server = document.location.host;
	session.httpPort = httpport;

	session.wsComputerName = "N/A";
	session.wsIpAddress = "N/A";

	session.CloseSession=function(strSessionID)
	{
		var strURL = app.get_service_url("session/disconnect/closesession.php","");
		return app.get_http(strURL, "closesessionid=" + strSessionID, true,false, null);
	}

	_initialise_appdot_variables()

	_load_cdf_formnames();

	_load_session_rights();

	//-- are we connected to mail server? call twice to get over xmlmc problem where first call to mail always fails
	var boolMB = global.IsConnectedToMailServer();

	//-- get mailbox rights (sys.email.js) - will populate global array _current_mailbox_permissions
	_email_getmailbox_permissions()

	//-- then get mailbox info for each one that user has rights to
	_arr_xml_mailbox_list = new Array();
	
	for(strMailBoxName in _current_mailbox_permissions)
	{
		//-- get mailbox associated address
		var arr_addresses = new Array();
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam("mailbox",strMailBoxName); 
		xmlmc.SetParam("getAddresses",true); 
		if(xmlmc.Invoke("mail", "getMailboxList"))
		{
			//-- address for this mailbox
			arr_addresses = xmlmc.xmlDOM.getElementsByTagName("mailbox");
		
			//-- now just get normal mailbox info - this getMailboxList method is kak - should return all is data in one hit
			var arr_mb = new Array();
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam("mailbox",strMailBoxName); 
			if(xmlmc.Invoke("mail", "getMailboxList"))
			{
				arr_mb = xmlmc.xmlDOM.getElementsByTagName("mailbox");
			}

			//-- merge mailbox info
			for(var x=0;x<arr_mb.length;x++)
			{
				_arr_xml_mailbox_list[_arr_xml_mailbox_list.length++] = arr_mb[x];
			}

			for(var x=0;x<arr_addresses.length;x++)
			{
				var checkMailboxName = xmlNodeTextByTag(arr_addresses[x],"name");
				var checkMailboxAddress = xmlNodeTextByTag(arr_addresses[x],"address");

				//-- need to check if this associated address is the default one i.e. check if it is in arr_mb
				var boolSkip = false;
				for(var y=0;y<arr_mb.length;y++)
				{
					var masterMailboxName = xmlNodeTextByTag(arr_mb[y],"name");
					var masterMailboxAddress = xmlNodeTextByTag(arr_mb[y],"address");
					var masterMailboxType = xmlNodeTextByTag(arr_mb[y],"type");
					if(masterMailboxType==1 || (checkMailboxName==masterMailboxName && checkMailboxAddress==masterMailboxAddress))
					{
						//-- already defined in master mailboxes so skip
						boolSkip = true;
						break;
					}
				}

				if(!boolSkip)_arr_xml_mailbox_list[_arr_xml_mailbox_list.length++] = arr_addresses[x];
			}
		}
	} //-- eof for loop permitted mailboxes
	
	if(_arr_xml_mailbox_list.length==0)
	{
		//-- hide main toolbar mail icon - user has no permissions
		global._mailserverrunning=false; 
		boolMB=false;
	}

	//-- doesnt exist anymore - need to hide drop down menu item
	//-- hide compose email icon if no mbs
	//app.toolbar_item_dore("app-toolbar", "new_email" , boolMB, document);
	

	//-- get calendar xml
	var xmlmc = app._new_xmlmethodcall();
	if(xmlmc.Invoke("calendar", "getCalendars"))
	{
		_arr_xml_calendar_list = xmlmc.xmlDOM.getElementsByTagName("calendar");
	}

	
	//-- load helpdesk tree xml
	if(!global.RefreshHelpdeskAnalystsTree())
	{
		app.logout("");
		return;
	}

	//-- get call confirmation settings from xml
	var lcfxmlurl = dd.GetGlobalParamAsString("global call settings/logcallconfirmmsg");
	if(lcfxmlurl!="")
	{
		app.get_http(_swc_parse_variablestring(lcfxmlurl), "", false,true,function(res){_xml_logcallconfirmation=res;});
	}

	//--
	//-- start monitoring call updates so we can refresh helpdesk view and popup notification
	setTimeout("app._on_updatedcalls_notification_received('')",5000);
}

function _get_webclient_cookie(strCookieID)
{
	strCookieID = app.pfu(_application +":"+strCookieID);
	var strURL = app.get_service_url("session/getcookie","");
	return app.get_http(strURL, "analystid=" + session.analystId + "&settingid=" + strCookieID, true,false, null);
}

function _set_webclient_cookie(strCookieID, varValue)
{
	strCookieID = app.pfu(_application +":"+strCookieID);
	var strURL = app.get_service_url("session/setcookie","");
	var res = app.get_http(strURL, "analystid=" + session.analystId + "&cookievalue=" + app.pfu(varValue) + "&settingid=" + strCookieID, true,false, null);
	return (res=="OK");
}

function _load_cdf_formnames()
{
	//-- check the form name for this callclass
	_arr_cdf_forms = new Array();
	var tmpQ = new SqlQuery();
	if(tmpQ.WebclientStoredQuery("system/getCallDetailFormNames",""))
	{
		while(tmpQ.Fetch())
		{
			_arr_cdf_forms[tmpQ.GetValueAsString("formname")] = tmpQ.GetValueAsString("callclass");
		}
	}
}

function _load_session_rights()
{
	if(session.rightsjson!=null)return;
	//-- get rights xml
	var strURL = app.get_service_url("session/getrights","");
	try
	{
		session.rightsjson = eval("(" + app.get_http(strURL, "", true,false, null) +")");		
	}
	catch (e)
	{
		alert("Analyst session rights could not be loaded. Please contact your Administrator");
		sys.logoff();
	}
}


function _on_updatedcalls_notification_received(strRes)
{
	//-- poll for next set of data
	var intPollSec = dd.GetGlobalParamAsNumber("views/helpdesk view/webclient settings/refreshpolling");
	if(isNaN(intPollSec) || intPollSec<1)return; //-- do not do any polling

	var iTimeoutPeriod = (intPollSec*1000);

	//-- if not in helpdesk view (or view not ready) then do not refresh - but still call timeout to check again later
	if(_CurrentOutlookType!="helpdesk" || _servicedesk_tree==null || _refresh_servicedesk_againstdata==undefined || _ServiceDeskDocumentElement==null)
	{
		setTimeout("app._on_updatedcalls_notification_received('')",iTimeoutPeriod);		
		return;
	}

	if(strRes != "")
	{
		//-- service desk is visible so process
		if(_refresh_servicedesk_againstdata!=undefined && _ServiceDeskDocumentElement.body.offsetWidth>0)
		{
			//-- call function to update call row in helpdesk view - set timeout of 100th second
			_refresh_servicedesk_againstdata(strRes);
		}

		setTimeout("app._on_updatedcalls_notification_received('')",iTimeoutPeriod);
		return;
	}

	//-- go get updated service desk view data
	//-- get list of distinct columns to select (so we dont have to do a select * from opencall
	var strSelectColumns =_servicedesk_get_distinct_columns();
	var strURL = app.get_service_url("call/getupdatedcallslist","");
	var strArgs = "_selectcols="+strSelectColumns+"&_last_lastactdatex=" + _LAST_HELPDESKVIEW_LASTACTDATEX;
	//-- will callback this function
	app.get_http(strURL,strArgs, false, false,app._on_updatedcalls_notification_received);
}


//-- switch analyst context
session.SwitchContext = function (strRepID, strGroupID)
{
	//-- if select groupid is not one of analysts groups then exit
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANSWITCHGROUP))
	{
		if(_analyst_in_supportgroups.indexOf(strGroupID)==-1 || strGroupID=="") 
		{
			alert("You do not have rights to change your service desk context to another group.");
			return false;
		}
	}

	//-- if select aid is not analyst and does not have right then exit
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANSWITCHREP))
	{
		if(strRepID!="" && strRepID != this.analystid)
		{
			alert("You do not have rights to change your service desk context to that of another analyst.");
			return false;
		}
	}


	//-- 14.0.9.2010 - use new xmlmc method call
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("groupId",strGroupID); 
	xmlmc.SetParam("analystId",strRepID); //-- send even if blank
	if(xmlmc.Invoke("session", "switchAnalystContext"))
	{
		session.currentAnalystId = strRepID;
		session.currentGroupId = strGroupID;
	}
	else
	{
		alert(xmlmc.GetLastError());
		return false;
	}

	//-- 14.0.9.2010 - replaced with new xmlmc api above
	/*var strURL = app.get_service_url("session/switchcontext","");
	var res = app.get_http(strURL, "analystid=" + app.pfu(strRepID) + "&groupid=" + app.pfu(strGroupID), true,false, null);
	if(res)
	{
		session.currentAnalystId = strRepID;
		session.currentGroupId = strGroupID;
	}
	*/
	return true;
}

//-- t/f can back date call actions
session.CanBackdateCallActions= function ()
{
	return (this.maxBackdatePeriod>0);
}

//-- get analyst status
session.GetAnalystStatus= function (strAnalystID)
{
	var strURL = app.get_service_url("session/getanalyststatus","");
	var strJS = app.get_http(strURL, "analystid=" + strAnalystID + "&swsessionid=" + app._swsessionid, true,false, null);
	if(strJS=="")return false;

	eval(strJS);
	return tmpObject;
}

//-- get # res profile levels required
session.GetCloseProfileLevelRequired= function ()
{
	var div = Math.round(_analyst_rightsh / 65536);
	if(div>0)
	{
		//-- we have problem profiles
		var sub = div * 65536;
		var resNum = _analyst_rightsh - sub;
	}
	else
	{
		var resNum = _analyst_rightsh;
	}
	return resNum;
}


//-- get # prob profile levels required
session.GetProbProfileLevelRequired= function ()
{
	var div = Math.round(_analyst_rightsh / 65536);
	return div;
}


session.IsMemberOfSupportGroup=function(strGroup)
{
	var arrGroup = _analyst_in_supportgroups.split(",");
	for(var x=0; x<arrGroup.length;x++)
	{
		if(arrGroup[x].toLowerCase()==strGroup.toLowerCase())return true;
	}
	return false;
}

//-- get max backdate period
session.GetMaxBackdatePeriodAllowed= function ()
{
	return session.maxBackdatePeriod;
}

//-- t/f has application right
session.HaveAppRight= function (nGroupID, nRightID, strApplication)
{
	if(strApplication==undefined || strApplication=="")strApplication = app._application;

	if(this.rightsjson==null)_load_session_rights();
	if(this.rightsjson==null) 
	{
		return false;
	}
	//-- session expired most likely
	if(this.rightsjson["@status"]==false)
	{
		//-- bail out with error
		app.logout(this.rightsjson.state.error);
		return false;
	}


	var arrAppRights = jA(this.rightsjson.params.appRight);
	var xmlRights = arrAppRights[0];
	if(xmlRights==undefined)
	{
		alert("The application rights data could not be loaded. Please contact your administrator.");
		return false;
	}
	else
	{
		var strMatchApp = strApplication.toLowerCase();
		var arrRightTypes = ["A","B","C","D","E","F","G","H"];
		for(var x=0; x<arrAppRights.length;x++)
		{
			if(arrAppRights[x].appName.toLowerCase()==strMatchApp)
			{
				if(isNaN(nGroupID))
				{
					var jRight = arrAppRights[x]["right" + nGroupID.toUpperCase()];
				}
				else
				{
					var jRight = arrAppRights[x]["right" + arrRightTypes[nGroupID-1]];
				}

				if(jRight==undefined)
				{
					alert("The requested application rights data could not be found. Please contact your administrator.");
					return false;
				}
				else
				{
					//-- need to convert rightid to actual bit value (i.e. rightid 3 = bit value 4)
					var intFlag = jRight-0;
					intFlag++;intFlag--;
					return (this.flags(nRightID) & intFlag);
				}
			}
		}
	}
	return false;
}

session.flags = function(flagPos)
{
	if(this.bitflags!=undefined)return this.bitflags[flagPos];


	this.bitflags = new Array();
	var y=1;
	for(var x=1;x<65;x++)
	{
		this.bitflags[x] = y;
		y=y*2;
	}
	return this.bitflags[flagPos];
}

//--
//-- given a sql statement will tell you if user has table rights
session._checkedtablerights = new Array();
session.CheckTableRight = function (strTable,iCheckRight,boolMessage)
{

	//-- 23.07.2012 - 88896
	//-- if this table and right has been checked already then use array to get result quickly (don't have to traverse xml)
	if(session._checkedtablerights[strTable]==undefined)session._checkedtablerights[strTable]=new Array();
	if(session._checkedtablerights[strTable][iCheckRight]!=undefined)
	{
		if(session._checkedtablerights[strTable][iCheckRight]!="" && boolMessage)
		{		
			alert(session._checkedtablerights[strTable][iCheckRight]);
		}
		return session._checkedtablerights[strTable][iCheckRight];
	}

	var strMessage="";
	if(boolMessage==undefined)boolMessage=true;

	if(this.rightsjson==null)_load_session_rights();
	if(this.rightsjson==null) 
	{
		return false;
	}

	//-- session expired most likely
	if(this.rightsjson["@status"]==false)
	{
		//-- bail out with error
		app.logout(this.rightsjson.state.error);
		return false;
	}

	var arrTableRights = this.rightsjson.params.databaseRight;
	if(arrTableRights==undefined)
	{
		strMessage= "The table rights data could not be loaded. Please contact your administrator.";
	}
	else
	{	
		var jRights = arrTableRights[0];
		if(iCheckRight!=undefined)
		{
			//-- loop db rights and find table name
			var tableRights = jRights.tableRight;
			var matchTable = strTable.toLowerCase();
			for(var x=0;x<tableRights.length;x++)
			{
				//-- do we have matching table
				if(tableRights[x].tableName.toLowerCase() == matchTable)
				{
					var intFlag = tableRights[x].right-0;
					var res = ((iCheckRight & intFlag)>0)?true:false;
					if(res)
					{
						//-- table ok to use
						session._checkedtablerights[strTable][iCheckRight] = "";
						return "";
					}
					break;
				}
			}
			strMessage = "You do not have permission to ["+_get_table_right_desc(iCheckRight) +"] on the database table:-\n\n" + strTable+ ".\n\nThe table permissions are granted by your Administrator.";
		}
	}

	session._checkedtablerights[strTable][iCheckRight] = strMessage;
	if(boolMessage && strMessage!="")alert(strMessage);
	return strMessage;
}

session.HaveRight = function (nGroupID, nRightID, boolMessage)
{
	if(boolMessage==undefined)boolMessage=false;
	var arrClientRights = this.rightsjson.params;
	if(arrClientRights==undefined)
	{
		alert("The client rights data could not be loaded. Please contact your administrator.");
		return false;
	}
	else
	{
		var arrRightTypes = ["a","b","c","d","e","f","g","h"];
		if(isNaN(nGroupID))
		{
			nGroupID= nGroupID.toLowerCase();
			for(var x=0;x<arrRightTypes.length;x++)
			{
				if(nGroupID==arrRightTypes[x])
				{
					nGroupID=x+1;
					break;
				}
			}
		}

		var jRight = arrClientRights["sl" + arrRightTypes[nGroupID-1]];	
		if(jRight==undefined)
		{
			alert("The requested rights data could not be found. Please contact your administrator.");
			return false;
		}
		else
		{
			var intFlag = jRight-0; //-- cast
			var res = ((nRightID & intFlag)!=0)?true:false;
			if(!res && boolMessage)
			{
				try
				{
					var strMessage = _CALL_RIGHTS_MSG[nGroupID][nRightID];
					alert(strMessage)
				}
				catch (e)
				{
				}

			}
			return res;
		}
	}
}

//-- t/f is esp option default
session.IsDefaultOption= function (nOption)
{
	return ((nOption & this.userdefaults)>0)?true:false;
}


//-- refresh a call details form (should it send npa?)
session.RefreshCallDetails= function (nCallRef)
{
}


//-- load application toolbar defs
var __arr_application_toolbar_html = new Array();
function _toolbars_loaded(strRes)
{
	var arrTBS = strRes.split("_sw2split_");
	for(var x=0;x<arrTBS.length;x++)
	{
		var arrTB = arrTBS[x].split("_swsplit_");
		__arr_application_toolbar_html[arrTB[0]]= arrTB[1];
	}
	_swcore.bToolbarsLoaded = true;
}


//-- load application picklists
function _load_application_picklists(strPickListXmlString)
{
	app._xmlPickLists = create_xml_dom(strPickListXmlString);
	if(typeof app._xmlPickLists!="object")
	{
		alert("The application pick list definitions could not be loaded. Please contact your Administrator");
		app._xmlPickLists = null;

		//-- major error so log out
		sys.logoff();
		return false;
	}
	_swcore.bPicklistsLoaded = true;

}


//--
//-- load mes xml defs
function _load_application_dbentityviews(dbevXmlString)
{
	app._xmlManagedEntitySearches = create_xml_dom(dbevXmlString);
	if(typeof app._xmlManagedEntitySearches!="object")
	{
		app._xmlManagedEntitySearches = null;
	}
}

function _load_application_schema(strSchemaJson)
{
	app._jsonSchemaString = strSchemaJson;
	try
	{
		app._jsonSchema = eval("("+_jsonSchemaString+")");
		if(typeof app._jsonSchema!="object")
		{
			alert("The application schema definition could not be loaded. Please contact your Administrsator");
			sys.logoff();
			return false;
		}
	}
	catch (e)
	{
		alert("The application schema definition could not be loaded. Please contact your Administrsator");
		sys.logoff();
		return false;
	}
}


function _load_system_schema(strSysSchemaXml)
{
	app._xmlSystemSchema = create_xml_dom(strSysSchemaXml);
	if(typeof app._xmlSystemSchema!="object")
	{
		alert("The system database schema definition could not be loaded. Please contact your Administrsator");
		sys.logoff();
		return false;
	}
	_swcore.bSchemasLoaded = true;
}

//--
//-- load global parameters
function _load_application_globalparams(globalParamsXmlString)
{
	app._xmlGlobalParameters = create_xml_dom(globalParamsXmlString);
	if(app._xmlGlobalParameters && app._xmlGlobalParameters.childNodes && app._xmlGlobalParameters.childNodes.length>0)
	{
		//-- ok
		_swcore.bGlobalParamsLoaded = true;
	}
	else
	{
		alert("The application global parameters could not be loaded. Please contact your Administrator");
		sys.logoff();
		return false;
	}
}

//-- load application tree browser forms
function _load_application_treebrowserforms(strTreeBrosersXmlString)
{
	app._xmlSearchForms = create_xml_dom(strTreeBrosersXmlString);
	if(typeof app._xmlSearchForms!="object")
	{
		alert("The application tree browser form definitions could not be loaded. Please contact your Administrator");
		app._xmlSearchForms = null;
		//-- major error so log out
		sys.logoff();
		return false;
	}
	_swcore.bTreeBrowsersLoaded = true;

}


function _initialise_schema_and_global_parameters(OnProcessedCallback)
{
	//-- check for when everything has loaded and then do callback processing
	/*
	var checkCoreResourcesLoaded = function()
	{
		if(_swcore.bToolbarsLoaded && _swcore.bPicklistsLoaded && _swcore.bTreeBrowsersLoaded && _swcore.bGlobalParamsLoaded && _swcore.bSchemasLoaded)
		{
		}
		else
		{
			setTimeout(checkCoreResourcesLoaded,200);
		}
	}
	setTimeout(checkCoreResourcesLoaded,200);
	*/
	
	
	//-- get all the resources needed for startup
	var strCustomURL = "service/session/fetchstartupresources/index.php";
	app.get_http(strCustomURL, "", false,false,function(strHttpResult,targetEle,ohttp)
	{
		var resources =  JSON.parse(strHttpResult);
		
		_toolbars_loaded(resources.systemtoolbars);
		_load_application_picklists(resources.picklistforms);
		_load_application_treebrowserforms(resources.treebrowserforms);
		_load_application_globalparams(resources.globalparameters);
		_load_application_dbentityviews(resources.dbentityviews);
		_load_application_schema(resources.swdataschema);
		_load_system_schema(resources.systemschema);

		//-- store so accessible in dot notation i.e. active pages.
		var intStartNode = (app.isIE && !app.isIE11Above)?1:0;
		_store_global_params_as_array(app._xmlGlobalParameters.childNodes[intStartNode]);
		
		//-- set dd object for application schema
		app.dd = new swdd();
		app.dd.tables['updatedb'].PrimaryKey = 'udid'; //-- as not specifically set in db
		app.dd.tables['updatedb'].primarykey = 'udid'

		//-- store labels
		for(var x=0;x<app.dd.tables.length;x++)
		{
			for(var y=0; y < app.dd.tables[x].columns.length;y++)
			{
				_application_labels[app.dd.tables[x].columns[y].binding] = app.dd.tables[x].columns[y].DisplayName;
			}
		}

		//-- inti session vars for logged in analyst (rights etc)
		_initialise_analyst_session_variables(); //--session.js - this takes a while??

		OnProcessedCallback();
	
	});

	return true;
}




//-- wrapper for dd.
function swdd()
{
	if(app._jsonSchema)
	{
		this.Name = session.dataDictionary;
		this.LastModifiedBy = "N/A";
		this.LastModifiedDate = "N/A";
		this.Version = "N/A";
		this.Application = this.Name;

		this.tables = new Array();
		this._init_appxmlschema(app._jsonSchema);
		this._init_xmlschema(app._xmlSystemSchema);
	}
}

//-- open xml and get params i.e. tables etc
swdd.prototype.GetSqlTreeBrowsersFormParameters = function(strSearchFormName)
{
	var xmlForm = null;
	var arrSearchForms = app._xmlSearchForms.getElementsByTagName('sqlTbForm');
	for(var x=0;x < arrSearchForms.length;x++)
	{
		var strName = app.xmlNodeTextByTag(arrSearchForms[x],"name");
		if(strName==strSearchFormName)
		{
			xmlForm = arrSearchForms[x];
			break;
		}
	}
	if(xmlForm==null)
	{
		alert("GetSqlTreeBrowsersFormParameters : The tree browser form [" + strSearchFormName + "] was not found. Please contact your Administrator.");
		return false;
	}
	
	var retArray = new Array();
	retArray[0] = new Object();
	retArray[0].table = app.xmlNodeTextByTag(xmlForm,"table");
	retArray[0].title = app.xmlNodeTextByTag(xmlForm,"title");
	retArray[0].resultColumn = app.xmlNodeTextByTag(xmlForm,"resultColumn");
	retArray[1] = app.xmlNodeTextByTag(xmlForm,"title");
	retArray[2] = app.xmlNodeTextByTag(xmlForm,"resultColumn");
	return retArray;
}


swdd.prototype._init_appxmlschema = function (jsonDbSchema)
{
	var arrTables = jA(jsonDbSchema.espDatabaseSchema.database.tables.table);
	for(var x=0;x<arrTables.length;x++)
	{
		var tPos = this.tables.length;
		var aTable = arrTables[x];
		if(aTable)
		{
			var strName = aTable['@name'].toLowerCase();
			app._arr_tablenames_by_pos[strName] = x;
			this.tables[tPos] = new Object();

			this.tables[tPos].namedcolumns = new Array();
			this.tables[tPos].columns = new Array();
			this.tables[tPos].Name = strName;
			this.tables[tPos].name = strName;
			this.tables[tPos].DisplayName = jVal(aTable['displayName']);
			this.tables[tPos].PrimaryKey = jVal(aTable['@primaryKey']).toLowerCase();
			this.tables[tPos].editform = jVal(aTable['editREcordForm']);
			this.tables[tPos].addform = jVal(aTable['addRecordForm']);
			this.tables[tPos].NewRecordForm = this.tables[tPos].addform;
			this.tables[tPos].RecordPropertiesForm = this.tables[tPos].editform;
			this.tables[tPos].Description = "N/A";
			this.tables[tPos].Dsn = "swdata";
			this.tables[tPos].canRead = session.CheckTableRight(strName,_CAN_BROWSE_TABLEREC,false);
			this.tables[tPos].canAdd = session.CheckTableRight(strName,_CAN_ADDNEW_TABLEREC,false);	
			this.tables[tPos].canUpdate = session.CheckTableRight(strName,_CAN_UPDATE_TABLEREC,false);
			this.tables[tPos].canDelete = session.CheckTableRight(strName,_CAN_DELETE_TABLEREC,false);
			//-- table methods
			this.tables[tPos].IsColumnDefined = function (strColName)
											{
													for (var x=0;x<this.columns.length;x++)
													{
														if(this.columns[x].Name.toLowerCase()==strColName.toLowerCase())
														{
															return true;
														}
													}
													return false;
											}

			//--
			//-- loop columns - 
			var arrColumns = jA(aTable.columns.column);
			var strTextInputType = "";
			this.tables[tPos].ColumnCount = arrColumns.length;
			for(var y=0;y<arrColumns.length;y++)
			{
				//-- set column attributes
				var aCol = arrColumns[y];
				var strColName = aCol['@name'].toLowerCase()
				var strBinding = strName + "." + strColName;
				this.tables[tPos].columns[y] = new Object();
				this.tables[tPos].columns[y].binding = strBinding;
				this.tables[tPos].columns[y].table = strName;
				this.tables[tPos].columns[y].name = strColName;
				this.tables[tPos].columns[y].Name = strColName;
				this.tables[tPos].columns[y].DisplayName = jVal(aCol['displayName']);

				//-- 06.10.2011 - 
				//-- get control type - to help with formatting as textInputFormat does not get exported properly.
				var aControl = aCol.control;
				if(aControl)
				{
					this.tables[tPos].columns[y].controlType = jVal(aControl['@type']).toLowerCase();
					this.tables[tPos].columns[y].inputMask = jVal(aControl['inputMask']);
					this.tables[tPos].columns[y].textInputFormat =  jVal(aControl['textInputFormat']);

					this.tables[tPos].columns[y].pickOptions = jVal(aControl['pickOptions']);
					this.tables[tPos].columns[y].defaultValue = jVal(aControl['defaultValue']);
				}
				else
				{							
					this.tables[tPos].columns[y].pickOptions = jVal(aCol.pickOptions);
					this.tables[tPos].columns[y].defaultValue = jVal(aCol.defaultValue);
				}

				this.tables[tPos].columns[y].type = jVal(aCol['@sqlType']).toLowerCase();
				this.tables[tPos].columns[y].DataType = this.tables[tPos].columns[y].type;
				this.tables[tPos].columns[y].SqlDataType = jVal(aCol['@sqlType']);

				this.tables[tPos].columns[y].unsigned = "no";
				this.tables[tPos].columns[y].size = jVal(aCol['@size']);
				this.tables[tPos].columns[y].MaxDataSize = jVal(aCol['@size']);
				this.tables[tPos].columns[y].primarykey = jVal(aCol['@primaryKey']);
			
				this.tables[tPos].columns[y].autoinc = jVal(aCol['@autoIncrement']);
				if(this.tables[tPos].columns[y].autoinc == null)this.tables[tPos].columns[y].autoinc ="no";

				this.tables[tPos].columns[y]._bIsNumeric = _is_numeric_type(this.tables[tPos].columns[y].type);
				this.tables[tPos].columns[y]._startupvalue = (this.tables[tPos].columns[y]._bIsNumeric)?0:"";
				this.tables[tPos].columns[y].IsNumeric = function()
																{
																	return this._bIsNumeric;
																}

				this.tables[tPos].columns[y].SqlTypeName = function()
																{
																	return this.SqlDataType;
																}

				this.tables[tPos].columns[y].FormatValue = function(strValue)
																{
																	if(this.controlType)
																	{
																		if(this.controlType=="date/time control")
																		{
																			//-- should be epoch value
																			if(this._bIsNumeric && !isNaN(strValue))
																			{
																				if(strValue==0) return "";

																				//-- format date value using input mask
																				if(this.inputMask!="")
																				{
																					return get_displayvalueforfield_fromepochvalue(strValue,this.inputMask,true);
																				}
																				else
																				{
																					//-- format using textInputFormat (currently does not work as textInputFormat does nto export properly for date controls)
																					//-- format using analysts date/time
																					if(this.textInputFormat=="text")
																					{
																						this.textInputFormat ="datetime";
																					}
																					else if(this.textInputFormat.indexOf("/")>-1)
																					{
																						this.textInputFormat = this.textInputFormat.replace("/","");
																					}
																					return get_displayvalueforfield_fromepochvalue(strValue,this.textInputFormat,true);
																				}
																			}
																		}
																		else if(this.controlType=="text edit")
																		{
																			if(this.textInputFormat=="text") return strValue;
																		}
																		else if(this.controlType.indexOf("pick list")==0)
																		{
																			//-- get value from pick list values
																			if(this.pickOptions.indexOf("^")>0)
																			{
																				//-- treat as numeric picklist
																				var arrItem = new Array();
																				var arrOptions = this.pickOptions.split("|");
																				for(var xy=0;xy<arrOptions.length;xy++)
																				{
																					if(arrOptions[xy]==strValue) return strValue;
																					arrItem = arrOptions[xy].split("^");
																					if(arrItem[1]==strValue) return arrItem[0];
																				}
																			}
																			else
																			{
																				//-- text picklist so just return value
																				return strValue;
																			}
																		}
																	}
																		
																	//-- process other fields
																	//-- if we have an input mask utilise it
																	if(this.inputMask!="")
																	{
																		if(this._bIsNumeric)
																		{
																			var origValue = strValue +"";
																			if(this.inputMask.indexOf("#")>-1)
																			{
																				//-- something like F######
																				var intValueLen = origValue.length;
																				var intMaskLen = this.inputMask.length;
																				var iCut = intMaskLen - intValueLen;
																				var newMask = this.inputMask.substring(0,iCut);
																				newMask = app.string_replace(newMask,"#","0",true);
																				return newMask + origValue;
																			}
																			else
																			{
																				return this.inputMask + origValue;
																			}
																		}
																	}
																	else
																	{
																		var strURL = app.get_service_url("ddf/formatvalue","");
																		var strBinding = this.table +"." + this.name;
																		var strParams = "formatbinding=" + strBinding + "&formatvalue=" + strValue;
																		return app.get_http(strURL, strParams, true, false, null);
																	}
																}


				//-- store columns in array by name as well - exclude special any names like length
				if(strColName=="length")
				{
					//--
				}
				else
				{
					this.tables[tPos].columns[strColName] = this.tables[tPos].columns[y];
					this.tables[tPos].namedcolumns[strColName] = this.tables[tPos].columns[y];
				}
			}

			//-- store table in array by position as well
			this.tables[strName] = this.tables[tPos];
		}
	}
}


swdd.prototype._init_xmlschema = function (xmlSchema)
{
	var tPos = this.tables.length;
	var arrTables = xmlSchema.getElementsByTagName("Table");
	for(var x=0;x<arrTables.length;x++)
	{
		var strName = arrTables[x].getAttribute("name").toLowerCase();
		this.tables[tPos] = new Object();
		this.tables[tPos].Name = strName;
		this.tables[tPos].name = strName;
		this.tables[tPos].DisplayName = "";
		this.tables[tPos].PrimaryKey = "";
		this.tables[tPos].editform = "";//_esptable_form(strName,true,false);
		this.tables[tPos].addform = "";//_esptable_form(strName,false,false);
			
		this.tables[tPos].namedcolumns = new Array();
		this.tables[tPos].columns = new Array();
		var arrColumns = arrTables[x].getElementsByTagName("Column");
		this.tables[tPos].ColumnCount = arrColumns.length;

		for(var y=0;y<arrColumns.length;y++)
		{
			//-- set column attributes
			var aCol = arrColumns[y];
			var strBinding = this.tables[tPos].Name + "." + aCol.getAttribute("name").toLowerCase();
			this.tables[tPos].columns[y] = new Object();
			this.tables[tPos].columns[y].binding = strBinding;
			this.tables[tPos].columns[y].table = this.tables[tPos].Name;
			this.tables[tPos].columns[y].name = aCol.getAttribute("name").toLowerCase();
			this.tables[tPos].columns[y].Name = aCol.getAttribute("name").toLowerCase();
			this.tables[tPos].columns[y].DisplayName = _application_labels[strBinding];

			//-- ddf defaults
			this.tables[tPos].columns[y].pickOptions = "";
			this.tables[tPos].columns[y].defaultValue = "";

			
			this.tables[tPos].columns[y].type = aCol.getAttribute("sqltype").toLowerCase();
			this.tables[tPos].columns[y].unsigned = aCol.getAttribute("unsigned");
			this.tables[tPos].columns[y].size = aCol.getAttribute("size");
			this.tables[tPos].columns[y].primarykey = aCol.getAttribute("primarykey");
			this.tables[tPos].columns[y].autoinc = aCol.getAttribute("auto_increment");
			if(this.tables[tPos].columns[y].autoinc ==null)this.tables[tPos].columns[y].autoinc ="no";


			this.tables[tPos].columns[y]._bIsNumeric = _is_numeric_type(this.tables[tPos].columns[y].type);
				this.tables[tPos].columns[y]._startupvalue = (this.tables[tPos].columns[y]._bIsNumeric)?0:"";
			this.tables[tPos].columns[y].IsNumeric = function()
																{
																	return this._bIsNumeric;
																}


			this.tables[tPos].columns[y].FormatValue = function(strValue)
														{
															//return strValue;
															//alert("need more ddf info");
															var strURL = app.get_service_url("ddf/formatvalue","");
															var strBinding = this.table +"." + this.name;
															var strParams = "formatbinding=" + strBinding + "&formatvalue=" + strValue;
															return app.get_http(strURL, strParams, true, false, null);
														}


			//-- if primary key then set table pkname
			if(aCol.getAttribute("primarykey")=="yes")
			{
				this.tables[tPos].PrimaryKey = aCol.getAttribute("name").toLowerCase();
			}

			//-- store columns in array by name as well
			this.tables[tPos].columns[aCol.getAttribute("name").toLowerCase()] = this.tables[tPos].columns[y];
			this.tables[tPos].namedcolumns[aCol.getAttribute("name").toLowerCase()] = this.tables[tPos].columns[y];
		}//-- eof columns

		//-- table methods
		this.tables[tPos].IsColumnDefined = function (strColName)
										{
												for (var x=0;x<this.columns.length;x++)
												{
													if(this.columns[x].Name.toLowerCase()==strColName.toLowerCase())
													{
														return true;
													}
												}
												return false;
										}




		//-- if pk not set then try indexes
		if(this.tables[tPos].PrimaryKey=="")
		{
			var arrIndexes = arrTables[x].getElementsByTagName("Index");
			for(var y=0;y<arrIndexes.length;y++)
			{
				//-- set column attributes
				var aIDX = arrIndexes[y];
				if(aIDX.getAttribute("unique")=="yes")
				{
					this.tables[tPos].PrimaryKey=aIDX.getAttribute("cols");
					//alert(this.tables[x].PrimaryKey + " :" + this.tables[x].Name)
					break;
				}
			}
		}

		//-- store table in array by position as well
		this.tables[strName] = this.tables[tPos];
	}

}

swdd.prototype.GetGlobalParamAsString = function (strPath)
{
	return __get_global_param(strPath,false);
}

swdd.prototype.GetGlobalParam = function (strPath)
{
	return __get_global_param(strPath,false);
}


swdd.prototype.GetGlobalParamAsNumber = function (strPath)
{
	return __get_global_param(strPath,true);
}

function _esptable_form(strTable, boolEdit,bMsg)
{
	if(bMsg==undefined)bMsg=true;
	var oTable = app.dd.tables[strTable];
	if(oTable==undefined)
	{
		if(bMsg)alert("_esptable_form : Table ["+strTable+"] information not defined.\n\nPlease contact your Administrator");
		return "";
	}

	if(boolEdit)
	{
		return oTable.addform;
	}
	else
	{
		return oTable.editform;
	}
}


var __arr_global_params = new Array();
function _store_global_params_as_array(xmlStartNode, arrTarget)
{
	if(xmlStartNode!=null)
	{
		if(arrTarget==undefined)arrTarget = __arr_global_params;
		
		var arrXML = xmlStartNode.childNodes;
		for(var x=0;x<arrXML.length;x++)
		{
			var currNode = arrXML[x];
		
			if(currNode.tagName!="name" && currNode.tagName!="folder" && currNode.tagName!="params") continue;

			//alert(currNode.tagName)
			if (currNode.tagName=="folder")
			{
				var strFolderName = app.xmlText(currNode.getElementsByTagName("name")[0]).toLowerCase();
				strFolderName = app.string_replace(strFolderName," ","_",true);
				arrTarget[strFolderName] = new Array();
				//alert(arrTarget[strFolderName] + ":" + strFolderName)
				//- -store its children folders
				_store_global_params_as_array(currNode, arrTarget[strFolderName]);
		
			
				//-- store params for this folder
				var xmlParams = currNode.getElementsByTagName("param");
				for(var y = 0; y < xmlParams.length;y++)
				{
					var currParam = xmlParams[y];
					var strParamName = app.xmlText(currParam.getElementsByTagName("name")[0]).toLowerCase();
					strParamName = app.string_replace(strParamName," ","_",true);
					var strParamValue = app.xmlText(currParam.getElementsByTagName("value")[0]);
					arrTarget[strFolderName][strParamName] = strParamValue;
				}
			}
		}
	}
}



function __get_global_param(strPath,boolNumeric)
{
	if(app._xmlGlobalParameters!=null)
	{
		var arrParams = __arr_global_params;
		var rValue = "";
		//-- remove any spaces - 
		strPath = app.string_replace(strPath," ","_",true);
		strPath = strPath.toLowerCase();
		var arrPath = strPath.split("/");
		var lastPath = arrPath[arrPath.length-1];
		for(var x=0;x<arrPath.length;x++)
		{
			var strCurrPathPart = arrPath[x];
			if(arrParams[strCurrPathPart]!=undefined)
			{
				rValue = arrParams[strCurrPathPart];
				arrParams = arrParams[strCurrPathPart]
				//-- exists
			}
			else
			{
				//-- does not exist
				//alert("Global parameter not defined. Please contact your Administrator.\n\n" + strPath + ":" + strCurrPathPart)
				return (boolNumeric)?0:"";
				break;
			}
		}

		if(boolNumeric)
		{
			rValue--;
			rValue++;
			if(isNaN(rValue)) return 0;
		}
		return rValue;
	}
	return (boolNumeric)?0:"";
}


//-- return t or f is type is numeric
function _is_numeric_type(strType)
{
	switch(strType)
	{
		case "integer":
		case "double":
		case "tinyint":
		case "bigint":
		case "smallint":
		case "decimal":
		case "float":
			return true;
		default:
			break;
			
	}
	return false;
}