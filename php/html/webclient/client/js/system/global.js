//-- 26.10.2009 - mimic full client global functions

var global = new Object();

//-- sla ON form openers - should call app.js functions
function _OnOpenEditSlaForm(strSlaNameOrCompanyID, b3rdParty)
{
	var res = true;
	if(OnOpenEditSlaForm)
	{
		res = OnOpenEditSlaForm(strSlaNameOrCompanyID, b3rdParty);
	}

	if (res)
	{
		//-- open default sla edit form
	}
}

function _OnOpenManageSlasForm()
{
	var res = true;
	if(OnOpenManageSlasForm)
	{
		res = OnOpenManageSlasForm();
	}

	if (res)
	{
		//-- open default sla edit form
	}
}

function _OnOpenNewSlaForm(strSlaNameOrCompanyID, bThirdParty)
{
	var res = true;
	if(OnOpenNewSlaForm)
	{
		res = OnOpenNewSlaForm(strSlaNameOrCompanyID, bThirdParty);
	}

	if (res)
	{
		//-- open default sla new form
	}
}
//-- eof ON sla openers


//-- 28.05.2012 - cr 88448 - switch to a view
global.SwitchSupportworksView = function(strView)
{
	//-- strView is view icontitle or view folder name
	var boolFound = false;
	var arrViews = dd.GetGlobalParam("views");
	for(var strViewName in arrViews)
	{
		if(strViewName==strView)
		{
			boolFound = true;
			break;
		}
		else
		{
			var strIconTitle = arrViews[strViewName].icontitle;
			if(strIconTitle==strView)
			{
				boolFound=true;
				break;
			}
		}
	}

	if(boolFound)
	{
		//-- get element with same view name and trigger click event
		var eTriggerItem = app.get_parent_child_by_id(app.application_navbar.shortcutholder,strViewName);
		if(eTriggerItem && eTriggerItem.className!="sbar-item-hide")
		{
			//-- show and select mini item
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"IMG");
		}
		else
		{
			//-- item is in main outlookbar
			eTriggerItem = app.get_parent_child_by_id(app.application_navbar.baritemholder,strViewName);
			if(eTriggerItem==null) return;
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"TD");
		}
		if(eTriggerItem==null) return;
		app.fireEvent(eTriggerItem,"click");
	}
}

//-- 07.08.2013 - cr 88502 - switch to a view by type - finds view of first type and switches
global.SwitchSupportworksViewByType = function(strViewType)
{
	//-- strView is view icontitle or view folder name
	var boolFound = false;
	var arrViews = dd.GetGlobalParam("views");
	for(var strViewName in arrViews)
	{
		var strType = arrViews[strViewName].type;
		if(strType==strViewType)
		{
			boolFound=true;
			break;
		}

	}

	if(boolFound)
	{
		//-- get element with same view name and trigger click event
		var eTriggerItem = app.get_parent_child_by_id(app.application_navbar.shortcutholder,strViewName);
		if(eTriggerItem && eTriggerItem.className!="sbar-item-hide")
		{
			//-- show and select mini item
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"IMG");
		}
		else
		{
			//-- item is in main outlookbar
			eTriggerItem = app.get_parent_child_by_id(app.application_navbar.baritemholder,strViewName);
			if(eTriggerItem==null) return;
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"TD");
		}
		if(eTriggerItem==null) return;
		app.fireEvent(eTriggerItem,"click");
	}
}

global.isRFC822ValidEmail = function(sEmail) 
{
	var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
	var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
	var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
	var sQuotedPair = '\\x5c[\\x00-\\x7f]';
	var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
	var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
	var sDomain_ref = sAtom;
	var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
	var sWord = '(' + sAtom + '|' + sQuotedString + ')';
	var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
	var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
	var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
	var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
	  
	var reValidEmail = new RegExp(sValidEmail);  
	if (reValidEmail.test(sEmail)) 
	{
		return true;
	}
    return false;
}


global.CreateSla = function (strSlaName, strTimeZone, intRespTime, intFixTime, callback)
{
	if(_xml_defaultslainfo==null)
	{
		var strURL = app.get_service_url("session/getdefaultslasettings","");
		_xml_defaultslainfo = app.get_http(strURL, "", true, true);
	}

	if(_xml_defaultslainfo)
	{
		//-- sunday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Sunday");
		var intSunS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intSunE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- monday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Monday");
		var intMonS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intMonE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- tueday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Tuesday");
		var intTueS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intTueE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- wednesday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Wednesday");
		var intWedS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intWedE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- thu
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Thursday");
		var intThuS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intThuE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- fri
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Friday");
		var intFriS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intFriE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- sat
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Saturday");
		var intSatS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intSatE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		var xmlmc = new XmlMethodCall();


		xmlmc.SetParam("name",strSlaName);
		xmlmc.SetParam("type",1);
		xmlmc.SetParam("resptime",intRespTime);
		xmlmc.SetParam("fixtime",intFixTime);
		xmlmc.SetParam("mode",0);
		xmlmc.SetParam("dd","");
		xmlmc.SetParam("timeZone",strTimeZone);

		xmlmc.SetParam("sunStart",intSunS)
		xmlmc.SetParam("sunEnd",intSunE)
		xmlmc.SetParam("monStart",intMonS)
		xmlmc.SetParam("monEnd",intMonE)
		xmlmc.SetParam("tueStart",intTueS)
		xmlmc.SetParam("tueEnd",intTueE)
		xmlmc.SetParam("wedStart",intWedS)
		xmlmc.SetParam("wedEnd",intWedE)
		xmlmc.SetParam("thuStart",intThuS)
		xmlmc.SetParam("thuEnd",intThuE)
		xmlmc.SetParam("friStart",intFriS)
		xmlmc.SetParam("friEnd",intFriE)
		xmlmc.SetParam("satStart",intSatS)
		xmlmc.SetParam("satEnd",intSatE)

		if(xmlmc.Invoke("sla", "addSystemSLA"))
		{
			if(callback)(callback(xmlmc.GetParam("slaid")))
			return xmlmc.GetParam("slaid");
		}
		else
		{
			alert("Error : sla.addSystemSLA failed.\n\n" + xmlmc.GetLastError())
		}
	}
	else
	{
		alert("The default working hours could not be loaded. Please contact your administrator.");
	}
	
	if(callback)(callback(0))	
	return 0;
}

global.DeleteSla = function (intSlaID)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("slaName",intSlaID)
	return xmlmc.Invoke("sla", "deleteSLA");
}

//-- this creates an analysts
global.Create3rdPartySupplier=function(strCompanyID, strSupplierName, strTel, strEmail, strNotes) 
{
	//-- create swanalyst of type 3 and under group _THIRDPARTY
	var rs = new SqlQuery();
	var strParams = "analystid=" + strCompanyID + "&name="+strSupplierName + "&tel="+strTel+"&email="+strEmail;
	if(rs.WebclientStoredQuery("system/createThirdPartySupplier",strParams))
	{	
		return true;
	}
	else
	{
		return false;
	}
}

global.Delete3rdPartySupplier=function(strCompanyID)
{
	//-- delete contracts from sla table & supplier from swanalysts table
	var rs = new SqlQuery();
	var strParams = "analystid=" + strCompanyID;
	if(rs.WebclientStoredQuery("system/deleteThirdPartySupplier",strParams))
	{	
		return true;
	}
	else
	{
		return false;
	}
}

global.SetSla3rdPartyInfo=function(nSlaID, strCompanyID, strContact, strEmail, strTel, strNotes, nValidFromEpoch, nExpiresEndEpoch, nContractOptions)
{
	var rs = new SqlQuery();
	var strParams = "company=" + strCompanyID;
	    strParams+= "&name=" + strContact;
	    strParams+= "&tel=" + strTel;
	    strParams+= "&email=" + strEmail;
	    strParams+= "&notes=" + strNotes;
	    strParams+= "&validfrom=" + nValidFromEpoch;
	    strParams+= "&validto=" + nExpiresEndEpoch;
	    strParams+= "&options=" + nContractOptions;
	    strParams+= "&slaid=" + nSlaID;

	return  rs.WebclientStoredQuery("system/setSla3rdPartyInfo",strParams);
}

//-- check for opening off default sla form or bespoke form defined in app.js
global.InvokeSlaEditDialog = function (nSlaID, b3rdParty, strAgreementTitle)
{
	alert("InvokeSlaEditDialog : This method is not supported in the webclient.");
	return false;
}

global.InvokeAddNewSlaDialog = function (nSlaID, b3rdParty, strAgreementTitle)
{
	alert("InvokeAddNewSlaDialog : This method is not supported in the webclient.");
	return false;
}

global.GetCallRefValue=function(strCallref)
{
	var val = parseInt(strCallref.match(/[0-9]+/)[0], 10);
	return val;
}


global.RefreshHelpdeskAnalystsTree = function()
{
	//-- 15.09.2010
	//-- helpdesk view tree xml
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("recursive","true");
	if(xmlmc.Invoke("helpdesk", "getAnalystTeamTree"))
	{
		_xml_helpdesk_view_tree = xmlmc.xmlDOM;
	}
	else
	{
		//-- should never happen
		alert(xmlmc.GetLastError());
		return false
	}

	//-- get 3p tree if enabled
	if(dd.GetGlobalParamAsString("third party slas/enable").toLowerCase()=="true")
	{
		var xmlmc = new XmlMethodCall();
		if(xmlmc.Invoke("helpdesk", "getThirdPartyTeamTree"))
		{
			_xml_helpdesk_view_3p_tree = xmlmc.xmlDOM;
		}
		else
		{
			//-- should never happen
			alert(xmlmc.GetLastError());
			return false;
		}
	}

	//--
	//-- assign tree xml
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("recursive",true);
	if(xmlmc.Invoke("helpdesk", "getAnalystAssignmentTree"))
	{
		_xml_helpdesk_assign_tree = xmlmc.xmlDOM;
	}
	else
	{
		//-- should never happen
		alert(xmlmc.GetLastError());
		return false
	}

	var xmlmc = new XmlMethodCall();
	if(xmlmc.Invoke("helpdesk", "getThirdPartyAssignmentTree"))
	{
		_xml_helpdesk_3p_assign_tree = xmlmc.xmlDOM;
	}
	else
	{
		//-- should never happen
		alert(xmlmc.GetLastError());
		return false
	}

	if(app.oCurrentOutlookControl!=null && oCurrentOutlookControl.contentWindow._reload_helpdesk_tree)
	{
		oCurrentOutlookControl.contentWindow._reload_helpdesk_tree();
	}
	else
	{
		_helpdesk_view_tree_reload = true;
	}

	return true;
}
//-- eof sla forms openers



global.TAPIDial = function(strNumber)
{
	alert("TAPIDial : This method is not supported in the webclient.");
	return false;
}

//-- add resultion to kbase
global.AddResolutionToKnowledgeBase= function (strProbText, strProbCode, strSolution, strFixCode, strCallRefList, modalCallbackFunction)
{
	strCallRefList=strCallRefList+"";
	
	var arrCalls = strCallRefList.split(",");
	if(arrCalls.length>1)
	{
		//-- more than one call so add to unpub table and exit
		var xmlmc = new XmlMethodCall();
		for(var x=0;x<arrCalls.length;x++)
		{
			xmlmc.SetParam("callRef",arrCalls[x])
		}
		return xmlmc.Invoke("knowledgebase", "unpublishedCallAdd");
	}
	else
	{
		//-- create title and keywords based on passed in info
		var strTitle = "Call " + app.dd.tables['opencall'].columns['callref'].FormatValue(strCallRefList) + " resolved and added to the KnowledgeBase";

		var strKeywords= "";
		var arrCode = strFixCode.split("-");
		for(var x=0;x<arrCode.length;x++)
		{
			if(strKeywords!= "")strKeywords+= ", ";
			strKeywords+= arrCode[x];
		}

		var oRes = global.GetResolutionProfileDescription(strFixCode);
		if(oRes.strCodeDesc!="")
		{
			var arrCode = oRes.strCodeDesc.split("->");
			for(var x=0;x<arrCode.length;x++)
			{
				if(strKeywords!= "")strKeywords+= ", ";
				strKeywords+= arrCode[x];
			}
		}


		var res = true;
		if(app.OnNewKBDocument!=undefined)
		{
			_CURRENT_JS_WINDOW = window;
			res = app.OnNewKBDocument(app.session.analystId,strProbCode,strCallRefList,strProbText,strSolution,strKeywords,strTitle)
		}
	
		if(res==true)
		{
	

			var strParams = "in_callref=" +strCallRefList;
				strParams += "&in_problem=" +strProbText
				strParams += "&in_solution=" +strSolution
				strParams += "&in_probcode=" +strProbCode
				strParams += "&in_fixcode=" +strFixCode
				strParams += "&in_title=" +strTitle
				strParams += "&in_keywords=" +strKeywords
				strParams += "&in_author=" + app._analyst_name + " [" + session.analystId + "]"

				app.kbase.open_compose(strParams,modalCallbackFunction);
		}
	}
}

//-- used as part of xmlmethod to uplaod files
global.LoadFileInBase64 = function(strFileName)
{
	return "";
}

//-- add info to log file - not currently supported in webclient
global.LogInfo = function(strFormOrEntityName, strFunctionName, strMessage, nLogType)
{
	return "";
}

function OpenSqlTreeBrowserForm(strConfigName, bPage1PickMode, bPage2PickMode, strTreeFilter)
{
	var strParams = "treefilter="+strTreeFilter;
	if(bPage1PickMode || bPage1PickMode==undefined)strParams += "&resolvemode=1";
	if(bPage2PickMode)strParams += "&resolvetreemode=1";

	var useWin = (app._CURRENT_JS_WINDOW && app._CURRENT_JS_WINDOW.open && !app._CURRENT_JS_WINDOW.closed)?app._CURRENT_JS_WINDOW:window;
	var oForm = app._open_application_form("treebrowserform."+strConfigName, "stf", "", strParams, true, "add", null, null,useWin);
	if(oForm)
	{
		try
		{
			return oForm._swdoc._selected_treeformkey;
		}
		catch (e)
		{
			return "";			
		}
	}
	return false;
}
global.OpenSqlTreeBrowserForm = OpenSqlTreeBrowserForm;

//-- open a html window in special sw mode
function OpenHtmlWindow(strName,strType,strURL,strTitle,bResizable,iWidth,iHeight)
{
	//-- 02.12.2011
	//-- parse out url
	strURL = _swc_parse_variablestring(strURL);

	//-- get window we want to pass into modal window
	var useWin = (app._CURRENT_JS_WINDOW && app._CURRENT_JS_WINDOW.open && !app._CURRENT_JS_WINDOW.closed)?app._CURRENT_JS_WINDOW:window;
	var strResize = (bResizable)?"yes":"no";
	var strProperties = 'height='+iHeight+',width='+iWidth+',toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=' + strResize;
	if(strType.toLowerCase=="frame")
	{
		useWin.open(strURL,strName,strProperties);
	}
	else if(strType.toLowerCase=="modal")
	{
		useWin.showModalDialog(strURL,useWin,"resizable:"+strResize+";scroll:no;dialogWidth:"+iWidth+"px;dialogHeight:"+iHeight+"px");
	}
	else
	{
		//-- modal less window i.e. modal but does not wait.
		if(app.isIE)
		{
			useWin.showModelessDialog(strURL, useWin, "resizable:"+strResize+";scroll:no;dialogWidth:"+iWidth+"px;dialogHeight:"+iHeight+"px"); 
		}
		else
		{
			useWin.open(strURL,strName,strProperties + ",modal=yes");
		}
	}
}
global.OpenHtmlWindow = OpenHtmlWindow;

//-- alert
global.alert= function (strMessage, nOptionButtons)
{
	alert(strMessage);
}

function GetAsISO8601TimeString(epValue) 
{
    var d = new Date((epValue*1000));

    function pad(n) {return n<10 ? '0'+n : n}

    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+' '
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds());
}
global.GetAsISO8601TimeString = GetAsISO8601TimeString;


//-- attach email to call
global.AttachMessageToCall= function (strMailboxName, strMessageID, strFileName, strCallReference, strCallUdIndex, strMailActionType, bIncludeAttachments, strMoveMessageToFolder)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("mailbox",strMailboxName)
	xmlmc.SetParam("messageId",strMessageID)
	xmlmc.SetParam("fileName",strFileName)
	xmlmc.SetParam("callRef",strCallReference)
	xmlmc.SetParam("udIndex",strCallUdIndex)
	xmlmc.SetParam("attachType",strMailActionType)
	xmlmc.SetParam("includeAttachments",bIncludeAttachments)
	if(strMoveMessageToFolder!=undefined && strMoveMessageToFolder!="")	
	{
		//-- get folder id
		var xmlmctwo = new XmlMethodCall();
		xmlmctwo.SetParam("mailbox",strMailboxName);
		xmlmctwo.SetParam("folderPath",strMoveMessageToFolder);
		if(xmlmctwo.Invoke("mail", "getFolderFromPath"))
		{
			xmlmc.SetParam("moveMessageToFolderId",xmlmctwo.GetParam("folderId"))
		}
	}
	xmlmc.Invoke("helpdesk", "attachMessageToCall");
	return true;
}

//-- return call status string
global.CallStatusString= function (nStatus)
{
	return app.dd.tables["opencall"].columns["status"].FormatValue(nStatus);
}

//-- t/f can send email = function (server is running)
global.CanSendMail= function ()
{
	_email_getmailbox_permissions();
	return _email_checkright(_EM_CANSEND, "%");

}

//-- close email window
global.CloseMailMessageWindow= function (strMessageID)
{

}

//-- compose update email for pass in calls - 87198 - added 8th param so can filter out email templates
global.ComposeCallUpdateEmail= function (arrCallInfo, intUdIndex, strMessageText, flFileAttachments, nTimeSpent, strTemplateName, nTemplateType, modalCallbackFunction, strWebclientCallclass)
{
	//-- determine param types i.e. arrCallInfo may be a comma string
	var boolCommaSepCallrefs = (typeof arrCallInfo =="string")?true:false;
	var boolFetchMessageTextFromUdIndex = false;
	if(strWebclientCallclass==undefined)strWebclientCallclass="";

	//-- if arrCallInfo is a string then we expect 7 parameters
	intUdIndex +="";
	if (boolCommaSepCallrefs)
	{
		if(nTemplateType==undefined)
		{
			alert("global.ComposeCallUpdateEmail (old) : Expects 7 parameters to be passed in but only 6 are present.\n\n Please contact your administrator.");
			return false;
		}

		//-- passed in update index is not correct - problem with hold call form match
		if(intUdIndex.indexOf("\n"))
		{
			intUdIndex = intUdIndex.split("\n")[0];
		}
	}
	else
	{
		//-- we are expecting 6 parameters
		//if(nTemplateType!=undefined)
		//{
		//	alert("global.ComposeCallUpdateEmail (new) : Expects 6 parameters to be passed in but 7 are present.\n\n Please contact your administrator.");
		//	return false;
		//}

		//-- regig vars
		if($.isFunction(nTemplateType))
		{
			modalCallbackFunction = nTemplateType
		}
		
		nTemplateType = strTemplateName;
		strTemplateName = nTimeSpent;
		nTimeSpent = flFileAttachments;
		flFileAttachments = strMessageText;
		strMessageText = intUdIndex;
		
	}


	//-- should we get message string from udindex?
	if(strMessageText=="" && !isNaN(intUdIndex))boolFetchMessageTextFromUdIndex=true;
	

	//-- 1. get template to use
	var strCallClass = "";
	var xmlTemplateNode = null;

	//-- template name
	if(strTemplateName == "UpdateCallMailTemplate")strTemplateName = "Update Call";
	else if(strTemplateName == "CloseCallMailTemplate")strTemplateName = "Close Call";
	else if(strTemplateName == "HoldCallMailTemplate")strTemplateName = "Hold Call";
	else if(strTemplateName == "LogCallMailTemplate")strTemplateName = "Log Call";

	//-- template number if user has not passed in all 7 params
	if(nTemplateType==undefined)
	{
		//-- need to workout nTemplateType
		nTemplateType = 0;
		if(strTemplateName == "UpdateCallMailTemplate")nTemplateType = TEMPLATE_UPDATECALL;
		else if(strTemplateName == "CloseCallMailTemplate")nTemplateType = TEMPLATE_CLOSECALL;
		else if(strTemplateName == "HoldCallMailTemplate")nTemplateType = TEMPLATE_HOLDCALL;
		else if(strTemplateName == "LogCallMailTemplate")nTemplateType = TEMPLATE_LOGCALL;
	}

	//-- work out first callref
	//-- user passed in callrefs as a string rather than associative array
	var intFirstCallref = 0;	
	var intUpdateIndex = intUdIndex;
	if(boolCommaSepCallrefs)
	{
		var arrCallrefs = arrCallInfo.split(",");
		for(var x=0;x<arrCallrefs.length;x++)
		{
			if(intFirstCallref==0)intFirstCallref = arrCallrefs[x]; 
		}
	}
	else
	{
		//-- arrCallInfo is an array of ["udindex","udindex","udindex"] and each item key is callref
		for(intCallref in arrCallInfo)
		{
			if(intFirstCallref==0)
			{
				intFirstCallref = intCallref;
				if(isNaN(intUdIndex))intUpdateIndex = arrCallInfo[intCallref];
			}
		}
	}

	//-- if we need to get callclass of first call
	if(strWebclientCallclass=="")
	{
		var strParams = "callref=" + intFirstCallref + "&udindex=" + intUpdateIndex;
		var rs = new SqlQuery()
		rs.WebclientStoredQuery("system/getCallClassAndLastUpdateText",strParams);
		if(rs.Fetch())
		{	
			if(boolFetchMessageTextFromUdIndex) strMessageText = rs.GetValueAsString("updatetxt");
			strCallClass = rs.GetValueAsString("callclass");
		}
	}
	else
	{
		strCallClass=strWebclientCallclass;
	}
	
	//-- for each mailbox that user has user template rights to compile list of usable templates
	var _array_selectable_templates = new Array();
	for(strMailboxID in _current_mailbox_permissions)
	{
		if(_email_checkright(_EM_TEMPLATEUSE, strMailboxID))
		{
			var strDisplayName = global.GetSharedMailboxDisplayName(strMailboxID);

			//-- get templates
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam("mailbox",strMailboxID); 
			xmlmc.SetParam("templateType",nTemplateType);
			xmlmc.SetParam("returnMime",false);
			if(xmlmc.Invoke("mail", "getMailTemplateList"))
			{
				//-- store each template that we can use
				var arrTemplates = xmlmc.xmlDOM.getElementsByTagName("mailTemplate");
				for(var x=0;x<arrTemplates.length;x++)
				{
					var oTemplate = new Object();
					oTemplate.name = app.xmlNodeTextByTag(arrTemplates[x],"templateName")
					oTemplate.mailbox = strMailboxID;
					oTemplate.mailboxname = strDisplayName;
					oTemplate.callclass = app.xmlNodeTextByTag(arrTemplates[x],"callClass");

					//-- 87198 - only store templates for the callclass we are interested in
					if(oTemplate.callclass == strCallClass || oTemplate.callclass=="" || oTemplate.callclass=="All Classes")
					{
						_array_selectable_templates[_array_selectable_templates.length++] = oTemplate;
					}
				}
			}
		}
	}

	//-- no templates to use
	var intUseFirstAddress = 0;
	var intUseTemplate = 0;
	var intUseHTMLTemplate = 1;
	if(_array_selectable_templates.length==0)
	{
		alert("There are no templates defined that you can use for sending emails. Please contact your Administrator");
		app.debug("No email templates available for " + strTemplateName,"global.ComposeCallUpdateEmail","Get Templates");
		return false;
	}
	else if (_array_selectable_templates.length>1)
	{
		//-- more than one possible template - so show picklist
		var _specialParams = new Array();
		_specialParams['_emailtemplates'] = _array_selectable_templates;
		_specialParams['_defaultclass'] = strCallClass;
		var aForm = _open_system_form("_sys_email_templatepicker", "mail", "", "", true, null,undefined,undefined,undefined,undefined,_specialParams);
		if(aForm.document.selectedindex==-1)return false; //-- did not select a template

		//-- selected template so get template info
		intUseTemplate = aForm.document.selectedindex;
		strCallClass = aForm.document.selectedcallclass;
		intUseFirstAddress = aForm.document.flg_userfirstaddress;
		intUseHTMLTemplate = aForm.document.flg_userhtmltemplate;
	}

	//-- we should have template to use
	var useTemplate = _array_selectable_templates[intUseTemplate];


	//-- 2. store merged data info and pass to email form (which will call xmlmc to get stuff - this means user can refresh form and won't lose mime atts)
	var xmlmc = new XmlMethodCall('abcdef');
	xmlmc.SetParam("mailbox",useTemplate.mailbox); //-- how do we determine mailbox to use?
	xmlmc.SetParam("templateMailbox",useTemplate.mailbox); //-- how do we determine mailbox to use?
	xmlmc.SetParam("templateName",useTemplate.name);
	xmlmc.SetParam("templateType",nTemplateType);
	xmlmc.SetParam("callClass",strCallClass);

	//-- work out first callref
	//-- user passed in callrefs as a string rather than associative array
	var arrProperCallrefs = new Array();
	if(boolCommaSepCallrefs)
	{
		var arrCallInfo = arrCallInfo.split(",");
		for(var x=0;x<arrCallrefs.length;x++)
		{
			xmlmc.SetParam("callRef",arrCallrefs[x]);
			arrProperCallrefs[arrProperCallrefs.length++]=arrCallrefs[x];
		}
	}
	else
	{
		//-- arrCallInfo is an array of ["udindex","udindex","udindex"] and each item key is callref
		for(intCallref in arrCallInfo)
		{
			xmlmc.SetParam("callRef",intCallref);
			arrProperCallrefs[arrProperCallrefs.length++]=intCallref;
		}
	}

	//-- webclient email form fetches attachment info using 1st callref and intUpdateIndex
	flFileAttachments = intFirstCallref +"."+intUpdateIndex;

	//-- set lastUpdate Param
	xmlmc.SetParam("lastUpdate",strMessageText);
	xmlmc.SetParam("timeSpent",(nTimeSpent)); //-- nTimeSpent in seconds
	xmlmc.SetParam("dataDictionary",session.dataDictionary); //-- nTimeSpent is minutes

	//-- 3. open compose email and show arrows to move between calls - need to copy attachments
	//-- pass thru vars
	var _arrSpecial = new Array();
	_arrSpecial['_arrMailmergeCallrefs'] = arrProperCallrefs;
	_arrSpecial['_mailbox'] = useTemplate.mailbox;
	_arrSpecial['_templatename'] = useTemplate.name;
	_arrSpecial['_templatetype'] = nTemplateType;
	_arrSpecial['_firstadd'] = intUseFirstAddress;
	_arrSpecial['_usehtml'] = intUseHTMLTemplate;
	_arrSpecial['_timespent'] = nTimeSpent;
	_arrSpecial['_lastupdate'] = strMessageText;
	_arrSpecial['_lastupdateCallInfo'] = flFileAttachments; //-- so email for can use xmlmc to copy call file attachments 
	_arrSpecial['_mergeMessageXmlmc'] = xmlmc;	//-- PASS xmlmc object ot form so form can Invoke and still work when form is refreshed.

	var strParams  = "addnew=1&_emailaction=CALLMERGE:&_mailbox=" +useTemplate.mailbox;
	
	//-- in case user has passed back a function
	var systemCallbackFunction = null;
	if(modalCallbackFunction)
	{
		systemCallbackFunction = function()
		{
			modalCallbackFunction({});
		}
	}
	
	app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, systemCallbackFunction,null,window,undefined,undefined,_arrSpecial);
}


global.GetSharedMailboxDisplayName=function(strMailbox)
{
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
		{
			return app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"displayName");
		}
	}
	return "";
}

global.IsSharedMailbox=function(strMailbox)
{
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
		{
			return (app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"type")=="2");
		}
	}
	return "";
}


global.GetMailboxNameByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"name");
}

global.GetMailboxDisplayByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"displayName");
}


global.GetSharedMailboxXmlNode=function(strMailbox)
{
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
		{
			return _arr_xml_mailbox_list[x];
		}
	}
	return null;
}



global.GetMailboxEmailAddressByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	alert(_arr_xml_mailbox_list[nPos].xml)
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"address");
}
global.GetMailboxEmailNameByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"name");
}
global.GetMailboxEmailDisplayNameByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	var strRet = app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"displayName");
	if(strRet=="") strRet = this.GetMailboxEmailNameByPos(nPos);

	return strRet;
}

global.GetEmailForm_DefaultAddressValue = function(strMailbox, intUseFirstAdd)
{
	var arr_unique_mailbox_names = new Array();
	var strLocalMailBox = "";
	if(strMailbox==undefined)strMailbox==""

	var strPickList = "";
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		var y=x;
		var strDisplay = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"displayName");
		var strName = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name");
			
		if(!app._email_checkright(app._EM_CANSEND,strName))continue;


		if(arr_unique_mailbox_names[strName]==undefined)
		{
			arr_unique_mailbox_names[strName] = 1;
			y = x + 1000;
		}

		if(strMailbox!="")
		{
			if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
			{
				if(intUseFirstAdd!=undefined && intUseFirstAdd==1) y = x;
				return y;
			}
		}
		else
		{
			if(intUseFirstAdd!=undefined && intUseFirstAdd==1) y = x;
			return y;
		}
	}

	return 0;

}

global.GetEmailForm_AddressPickList = function(strMailbox)
{
	var arr_unique_mailbox_names = new Array();
	var strLocalMailBox = "";

	var strPickList = "";
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		var strDisplay = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"displayName");
		var strName = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name");
		var strAddress = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"address");

		if(!app._email_checkright(app._EM_CANSEND,strName))continue;

		//-- add (local) mailbox option
		if(arr_unique_mailbox_names[strName]==undefined)
		{
			arr_unique_mailbox_names[strName] = 1;
			if(strLocalMailBox != "" )strLocalMailBox += "|";
			strLocalMailBox += strDisplay + " (local)" + "^" + (x + 1000);
		}

		//-- an associated address
		if(strAddress.indexOf("@")!=-1)
		{
			if(strMailbox!="")
			{
				if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
				{
					if(strPickList != "" )strPickList += "|";
					strPickList += strDisplay + " ("  + app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"address") + ")" + "^" + x;
				}
			}
			else
			{
				if(strPickList != "" )strPickList += "|";
				strPickList += strDisplay + " ("  + app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"address") + ")" + "^" + x;
			}
		}
	}

	if(strPickList!="")
	{
		strPickList = strLocalMailBox + "|" + strPickList;
	}
	else
	{
		strPickList = strLocalMailBox;
	}

	return strPickList;
}

//-- t/f confirm message
global.confirm= function (strMessage)
{
	return confirm(strMessage);
}


//-- print to debugger
global.DebugPrint= function (strMessage)
{

}

//-- epoch time from date string
global.EpocTimeFromString= function (strTime)
{
	var jsDate = _parseDate(strTime);
	if(jsDate)
	{
		var intEpoch = parseInt(Date.UTC(jsDate.getFullYear(),jsDate.getMonth(),jsDate.getDate(),jsDate.getHours(),jsDate.getMinutes(),jsDate.getSeconds()) / 1000);
		return intEpoch;
	}
	else
	{
		return 0;
	}
}

//-- epoch time from gmt date string
global.EpocTimeFromStringGmt= function (strTime)
{
	var jsDate = _parseDate(strTime);
	if(jsDate)
	{
		return _date_to_utc_epoch(jsDate);
	}
	else
	{
		return 0;
	}
}


global.GetCacheRecordCount= function (strTable, strWhere)
{
	var strSQLWhere =(strWhere=="")?"":strWhere;
	var strParams = "dsn=sw_systemdb&table=" + strTable + "&filter=" + strWhere;
	var rs = new SqlQuery()
	rs.RemoteWebclientQuery("system/getCallClassAndLastUpdateText",strParams);
	if(rs.Fetch())
	{	
		return rs.GetValueAsNumber("counter");
	}
	else
	{
		return -1;
	}
}

global.GetCallStatusInfo= function (sCallref, bSwdata)
{
	if(bSwdata==undefined)bSwdata=false;
	
	var o = new Object();
	o.nStatus = 0;
	o.strCallClass = "";
	o.strPriority = "";

	var strDB = (bSwdata)?"swdata":"syscache";
	var rs = new SqlQuery()

	var strParams = "dsn="+strDB+"&callref=" + sCallref; 
	rs.WebclientStoredQuery("system/getCallStatusInfo",strParams);
	if(rs.Fetch())
	{	
		o.nStatus = rs.GetValueAsNumber("status");
		o.strCallClass = rs.GetValueAsString("callclass");
		o.strPriority = rs.GetValueAsString("priority");
	}
	else
	{
		if(!bSwdata)
		{
			//-- was not found in cache so check swdata
			return this.GetCallStatusInfo(sCallref,true);
		}
	}
	return o;
}

//-- this works ok
global.GetCurrentEpocTime= function ()
{
	var t = new Date();
	var intEpoch = app._date_to_epoch(t);
	return intEpoch;
}

global.GetProblemProfileDescription= function (strCode)
{
	var oRes = new Object();
	var oRS = new SqlQuery();
	var strParams = "code=" + strCode; 
	oRS.WebclientStoredQuery("system/getProblemProfileDescription",strParams);
	if(oRS.Fetch())
	{
		oRes.strCodeDesc = oRS.GetValueAsString("codedesc");
		oRes.strDescription = oRS.GetValueAsString("codetext");
	}
	else
	{
		oRes.strCodeDesc = "";
		oRes.strDescription = "";
	}

	return oRes;
}


global.GetResolutionProfileDescription= function (strCode)
{
	var oRes = new Object();
	var oRS = new SqlQuery();
	var strParams = "code=" + strCode; 
	oRS.WebclientStoredQuery("system/getResolutionProfileDescription",strParams);
	if(oRS.Fetch())
	{
		oRes.strCodeDesc = oRS.GetValueAsString("codedesc");
		oRes.strDescription = oRS.GetValueAsString("codetext");
	}
	else
	{
		oRes.strCodeDesc = "";
		oRes.strDescription = "";
	}

	return oRes;
}

global.GuiFlush= function ()
{
	return true;
}

//-- run php
global.HttpGet= function (strGetUrl, bAppendSessionInfo)
{
	//-- 28.10.2011 - HTL fix 86389 
	if(bAppendSessionInfo) 
	{
	    //-- 91968 - if has ? already then append with &
		var strPrefix = (strGetUrl.indexOf("?")>-1)?"&":"?";
		strGetUrl += strPrefix + "sessid=" + app._swsessionid;
	}

	var strParams = "_geturl=" + app.pfu(strGetUrl);
	var strURL = app.get_service_url("swclass/httpget","");
	return app.get_http(strURL, strParams, true, false);
}

global._mailserverrunning = undefined;
global.IsConnectedToMailServer= function ()
{
	//-- 15.05.2012
	//-- already set var so jsut return that
	if(this._mailserverrunning!=undefined) return this._mailserverrunning;

	var strParams = "";
	var strURL = app.get_service_url("email/isservicerunning","");
	var res = app.get_http(strURL, strParams, true, false);
	
	//-- set var so we only need to call once
	this._mailserverrunning = (res=="true");
	return this._mailserverrunning;
}

global.IsCallInKnowledgeBase=function(varCallref)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref",varCallref)
	if(xmlmc.Invoke("knowledgebase", "isCallInKnowledgeBase"))
	{
		return (xmlmc.GetParam("included")=="false")?false:true;
	}
	return false;

}

global.IsObjectDefined= function (strObjectName)
{
	try{
		var tmp = eval(strObjectName);
	}
	catch(e){return false;}
	return true;

}

//-- get survey lic info
global._wc_boolSurveyModuleEnabled = -1;
global.IsSurveyModuleEnabled= function ()
{
	if(this._wc_boolSurveyModuleEnabled==-1)
	{
		this._wc_boolSurveyModuleEnabled = false;
		var strURL = app.get_service_url("session/getlicinfo","");
		var xmlLicInfo = app.get_http(strURL, "", true, true);
		if(xmlLicInfo)
		{
			var arrLic = xmlLicInfo.getElementsByTagName("features");
			if(arrLic[0])
			{
				var strSurvey = xmlNodeTextByTag(arrLic[0],"survey");
				if(strSurvey=="true")this._wc_boolSurveyModuleEnabled=true;
			}
		}
	}
	return this._wc_boolSurveyModuleEnabled;
}



global.LockCalls= function (strCallRefs, strReason, bDisplayMessage)
{
	if(strReason==undefined)strReason = "UPDATE";
	if(bDisplayMessage==undefined)bDisplayMessage = false;
	strCallRefs +="";

	var arrCalls = strCallRefs.split(",");

	var xmlmc = new XmlMethodCall();
	for(var x=0;x<arrCalls.length;x++)
	{
		xmlmc.SetParam("callref",arrCalls[x])
	}

	xmlmc.SetParam("reason",strReason)
	if(xmlmc.Invoke("helpdesk", "lockCalls"))
	{
		var arrMessage = xmlmc.xmlDOM.getElementsByTagName("message");
		if(arrMessage[0])
		{
			//-- if message is locked and the locked by user is session analyst then ignore 
			//-- i.e. i should be able to update locked calls that i have already locked
			var msg = app.xmlText(arrMessage[0]);
			var test = "locked by " + app.session.analystid.toLowerCase();
			if(msg.toLowerCase().indexOf(test)==-1) 
			{
				alert(msg);
				return false;
			}
		}
		return true;
	}
	else
	{
		//-- check if locked by current analyst if so allow them to continue.
		if(bDisplayMessage)	alert(xmlmc.GetLastError())
	}

	return false;
}

global.LogNewCall= function (strFormName,callback,aWin,_specialParams, strPassOnParams)
{
	//if(aWin==undefined)
	//{
	//	aWin = window;
	//}
	if(strPassOnParams==undefined)strPassOnParams="";
	app._open_logcall_form(strFormName,strPassOnParams,aWin,_specialParams,callback);
}

global.MessageBeep= function (nSoundType)
{
}

global.MessageBox= function (strMessage, nOptions, callback, aWin)
{
	return MessageBox(strMessage, nOptions,callback, aWin);
}

global.OpenCallDetailsView= function (nCallRef,callback)
{

	app._open_call_detail(nCallRef,callback);

}

global.ShellExecute = function(strCommand)
{
	ShellExecute(strCommand);
}

global.OpenDatabaseSearchView= function (strSql,nLimit)
{
	var strParams = "query=" + strSql;
	if(nLimit!=undefined && !isNaN(nLimit)) strParams +"&limit=" + nLimit;
	_hslaction("sqlsearch",strParams);
}

global.OpenEmbeddedURL= function (strUrl,loadIntoCurrentView,loadIntoLeftView)
{
	if(loadIntoCurrentView==undefined) loadIntoCurrentView = false;
	if(loadIntoLeftView==undefined) loadIntoLeftView = false;

	if(strUrl.toLowerCase().indexOf("hsl:")>-1)
	{
		var arrInf = strUrl.split("?");
		var arrAction = arrInf[0].split(":");
		_hslaction(arrAction[1],arrInf[1],null);
	}
	else
	{
		//--switch to swtoday view and then load url into left hand view
		if(!loadIntoCurrentView)
		{
			app.application_navbar.activatebar("supportworks_today");
		}

		var targetFrame = (loadIntoLeftView)?app.oCurrentOutlookControl:app.oCurrentOutlookWorkSpace;
		strUrl = _swc_parse_variablestring(strUrl)
		targetFrame.setAttribute("externalUrl",true);
		targetFrame.src = strUrl;
	
	}
}

global.OpenVCM= function (strConfigItemKey, strConfigFile, nShowType, nShowLevel, nObjInGroup, nZoom)
{
	alert("OpenVCM : Is not currently suported by the webclient");
}

global.PrepareForXML =function (strValue)
{
	return pfx(strValue);
} 

function pfx(strValue)
{
	strValue+=""; //-- cast	
	
	//-- prepare already prepared instances (i.e. data value is actually &lt;)
	strValue= strValue.replace(/\&/g,'&amp;');
	//strValue= strValue.replace(/\&gt;/g,'&amp;gt;');
	//strValue= strValue.replace(/\&qout;/g,'&amp;qout;');
	//strValue= strValue.replace(/\&apos;/g,'&amp;apos;');

	//-- replace instances of & with &amp; so long as not already &amp;
/*
	var outp = ""; 
	var ch = "";
	for (i = 0; i <= strValue.length; i++) 
	{ 
		ch = strValue.charAt(i);
		if(ch=="&")
		{
			alert(":"+strValue.substring(i,i+5)+":")
			if(strValue.substring(i,i+5)!="&amp;")
			{
			  outp += "&amp;";
			}
			else
			{
				outp += ch;
			}
		}
		else
		{
			outp += ch; 
		}
	} 
	
	strValue = outp;
*/
	strValue= strValue.replace(/</g,'&lt;');
	strValue= strValue.replace(/>/g,'&gt;');
	strValue= strValue.replace(/\"/g,'&quot;');
	strValue= strValue.replace(/\'/g,'&apos;');
	return strValue;
}

function unpfx(strValue)
{
	strValue+=""; //-- cast
	strValue= strValue.replace(/\&lt;/g,'<');
	strValue= strValue.replace(/\&gt;/g,'>');
	strValue= strValue.replace(/\&quot;/g,'"');
	strValue= strValue.replace(/\&apos;/g,"'");
	strValue= strValue.replace(/\&amp;/g,'&');

	return strValue
}

global.PrepareForSQL = function (strValue)
{
	return pfs(strValue);
}

//-- check for pfs value
function pfs(strValue)
{
	//-- prepare and check for sql injection ?? api call ?? or do exactly what full client does
	strValue+=""; //-- cast
	if(app._dbtype=="swsql")
	{
		strValue = app.string_replace(strValue,"'","''",true);
	}
	else
	{
		strValue = app.string_replace(strValue,"'","''",true);
	}
	return strValue;		
}


global.prompt= function (strMessage, strValue)
{
	return prompt(strMessage,strValue);
}

global.RunHIB= function (strURL, strCompVarName, strCompIDValue)
{
	var strParams = "_url=" + strURL + "&_assetvar=" + strCompVarName + "&_assetid=" + strCompIDValue;
	var aForm = _open_system_form("interface.php", "hib", "", strParams, false,null,null,null,1000,800);
}

global.ScheduleCallback= function (nCallRef)
{
	//-- get analyst to assign call back to
	/*
	var picker = new PickAnalystDialog();
	picker.Open("Assign Callback To:",false);			
	if(picker.analystid=="") return false;
	picker.analystid; 
	*/
	
	//-- we do no have any mehod to create a call back
	
	alert("ScheduleCallback : Is not currently suported by the webclient");

}

global.RunProgram = function ()
{
	return true;
}

global.Sleep= function (nMilliseconds)
{
}

global.StoredQueryExecute=function(queryName,queryParams, optBoolSqlCount)
{
	var tmpQ = new SqlQuery();
	var res = tmpQ.StoredQuery("execute/"+queryName, queryParams);
	if(!res)return -1;

	//-- if the command is a select count 
	if(optBoolSqlCount)
	{
		if(tmpQ.Fetch())
		{
			return tmpQ.GetValueAsNumber(0);
		}
		else
		{
			return -1;
		}
	}
	else
	{
		return tmpQ._recordset.params.rowsEffected;
	}
}

global.SqlExecute= function (strDatabase, strSQL)
{
	var tmpQ = new SqlQuery();
	if(tmpQ.Query(strSQL, strDatabase))
	{
		//-- if doing a count(*) then return count result
		if(strSQL.toLowerCase().indexOf("select count(*) from")==0)
		{
			if(tmpQ.Fetch())
			{
				return tmpQ.GetValueAsNumber(0);
			}
			else
			{
				return -1;
			}
		}
		else if(strSQL.toLowerCase().indexOf("select")==0)
		{
			return tmpQ.GetRowCount();
		}
		else
		{
			//-- is something like an update or a delete - so just return 1 i.e. true
			return 1;
		}
	}
	else
	{
		return -1;
	}
}

global.UnlockCalls= function (strCallRefs)
{

	strCallRefs +="";
	var arrCalls = strCallRefs.split(",");

	var xmlmc = new XmlMethodCall();
	for(var x=0;x<arrCalls.length;x++)
	{
		xmlmc.SetParam("callref",arrCalls[x])
	}
	if(xmlmc.Invoke("helpdesk", "unlockCalls"))
	{
		var arrMessage = xmlmc.xmlDOM.getElementsByTagName("message");
		if(arrMessage[0])
		{
			//alert(app.xmlText(arrMessage[0]))
			return false;
		}
		return true;
	}
	return false;
}

global.ValidateSLAName= function (strSLAName)
{
	var rs = new SqlQuery();
	var strParams = "sla=" + strSLAName; 
	rs.WebclientStoredQuery("system/getProblemProfileDescription",strParams);
	if(rs.GetRowCount()>0) return true;

	return false;
}

global.xpathGetXml = function (xpath)
{
	return "";
}


//-- run ql
global._runQuickLogCall = function(strName,strFolder)
{
	//-- get quicklog call info for xmlmc
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",strName);
	xmlmc.SetParam("mailbox",strFolder);
	if(!xmlmc.Invoke("helpdesk","quicklogCallGet"))
	{
		alert("xmlmc helpdesk:quicklogCallGet Failed:\n\n" + xmlmc.GetLastError());
		return false;
	}
	
	//-- open log call form of the desired type
	var strForm = xmlmc.GetParam("formName");
	var strClass = xmlmc.GetParam("callClass");

	//-- open new log call form
	var arrParams = new Array();
	arrParams["_qlc_data"] = xmlmc.xmlDOM;
	global.LogNewCall(strForm,null,window,arrParams);

	return true;
}

//-- delete ql
global._deleteQuickLogCall=function(strName,strFolder)
{
	//-- get quicklog call info for xmlmc
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",strName);
	xmlmc.SetParam("mailbox",strFolder);
	if(!xmlmc.Invoke("helpdesk","quicklogCallDelete"))
	{
		alert("xmlmc helpdesk:quicklogCallDelete Failed:\n\n" + xmlmc.GetLastError());
		return false;
	}
	return true;
}

//-- nwj - 16.03.2011 - function to upload a generic file to server - using form_iframeloader on portal.php
global._selectFileToUpload=function(strUploadPhpSrc, strGenFieldOneValue, funcCallback)
{
	global._fileUploadPhpSrc = strUploadPhpSrc;
	global._genFieldOneValue = strGenFieldOneValue;

	var oForm = document.getElementById("form_fileuploader");
	if(oForm==null)return;
	//-- have to show popup file selector for mozilla and safari and chrome
	if( (!app.isIE) || (app.isIE8 || app.isIE6 ))
	{
		//-- popup form
		var arrField = new Array();
		arrField['_uniqueformid'] = -1;
		arrField['_callback'] = funcCallback;
		arrField['_genfieldvalue'] = strGenFieldOneValue;
		arrField['_top'] = top;
		var popupForm = app._open_system_form("fileupload.php", "fileupload", "", "", true, null,null,window,400,20,arrField);
			
		//-- no file selected
		if(popupForm._uploadfilenode==null || app.isSafari) return;
		//-- we have a file input node - need to put it into our form

		if(app.isIE6)
		{
			res = oForm.insertAdjacentElement('beforeEnd', popupForm._uploadfilenode);
		}
		else
		{
			var res = oForm.appendChild(popupForm._uploadfilenode);
		}

		global._webclientUploadFile();
		return;
	}

	//-- IE is great as it allows us to trigger click event (whats teh security risj in that...none)
	var eFile = app.getEleDoc(oForm).getElementById("swfileupload");
	if(eFile==null)
	{
		eFile = app.getEleDoc(oForm).createElement("input");
		eFile.setAttribute('type', 'file');
		eFile.setAttribute('name', 'swfileupload');
		eFile.setAttribute('id', 'swfileupload');
		app.addEvent(eFile,"change",global._webclientUploadFile);

		if(app.isIE6)
		{
			oForm.insertAdjacentElement('beforeEnd', eFile);
		}
		else
		{
			oForm.appendChild(eFile);
		}
	}

	if(app.isChrome || app.isIE6)	oForm.style.display='block';

	eFile.click(); //-- trigger file click
}

global._webclientUploadFile=function()
{
	var oForm = document.getElementById("form_fileuploader");
	if(oForm==null)return;

	oForm.setAttribute("action",global._fileUploadPhpSrc);

	//-- set gen 1 field value
	if(global._genFieldOneValue==undefined)	global._genFieldOneValue="";
	var eGenField = app.getEleDoc(oForm).getElementById("frm_genfieldone");

	if(eGenField!=null)
	{
		eGenField.value = global._genFieldOneValue;
	}

	//-- create iframe to take upload if not created yet
	var oIF = app.getEleDoc(oForm).getElementById('iframe_webclient_fileuploader');
	if(oIF==null)
	{
		var strIframeHTML = "<iframe id='iframe_webclient_fileuploader' name='iframe_webclient_fileuploader' style='position:absolute;top:0;left:0;display:none;'></iframe>";
		app.insertBeforeEnd(app.getEleDoc(oForm).body,strIframeHTML);
		oIF = app.getEleDoc(oForm).getElementById('iframe_webclient_fileuploader');
	}

	oForm.submit();

	//-- hide submit form
	if(app.isChrome)setTimeout("global._webclientUploadFileHideForm()",1000);
}

global._webclientUploadFileHideForm=function()
{
	var oForm = document.getElementById("form_fileuploader");
	if(oForm==null)return;

	oForm.style.display='none';
}


global._cached_getTimeZoneOffset = null;
global._getTimeZoneOffset=function(strTimeZone)
{
	if(global._cached_getTimeZoneOffset!=null) return global._cached_getTimeZoneOffset;
	
	var res = 0;
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("timeZone",strTimeZone);
	if(xmlmc.Invoke("system","getTimezoneOffset"))
	{
		res = xmlmc.GetParam("offset");
		res++;res--;
		global._cached_getTimeZoneOffset = res;
	}
	return res;
}

//-- NOV-2014 - replace date strings in text with analysts formatted date/time
global.ConvertDateTimeInText=function(strBlock)
{
	var Iso8601InBracketsUtc = new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\]-UTC","g"); //yyyy-MM-dd HH:mm:ss
	var UkStyleInBracketsUtc = new RegExp("\\[\\d{1,2}\\/\\d{1,2}\\/\\d{4} \\d{1,2}:\\d{1,2}:\\d{1,2}\\]-UTC","g"); //dd/MM/yyyy HH:mm:ss
	var Iso8601Z = new RegExp("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}Z","g"); // yyyy-MM-dd HH:mm:ssZ
	
	var fUtc = function($0,$1,$2,$3,$4,$5,$6)
		{
			var strDate =  $0.replace("[","").replace("]","").replace("-UTC","").replace("Z","");
			var arrParts =  strDate.split(" ");
			var arrDateParts = arrParts[0].split("-");
			var arrTimeParts = arrParts[1].split(":");
			
			return format_dateparts(app._analyst_datetimeformat,app._analyst_timezoneoffset, arrDateParts[0],arrDateParts[1],arrDateParts[2],arrTimeParts[0],arrTimeParts[1],arrTimeParts[2]);
		}

	var fUK = function($0,$1,$2,$3,$4,$5,$6)
		{
			var strDate =  $0.replace("[","").replace("]","").replace("-UTC","").replace("Z","");
			var arrParts =  strDate.split(" ");
			var arrDateParts = arrParts[0].split("/");
			var arrTimeParts = arrParts[1].split(":");

			return format_dateparts(app._analyst_datetimeformat,app._analyst_timezoneoffset, arrDateParts[2],arrDateParts[1],arrDateParts[0],arrTimeParts[0],arrTimeParts[1],arrTimeParts[2]);
		}
		
	return strBlock.replace(Iso8601InBracketsUtc,fUtc).replace(Iso8601Z,fUtc).replace(UkStyleInBracketsUtc,fUK);
	
}