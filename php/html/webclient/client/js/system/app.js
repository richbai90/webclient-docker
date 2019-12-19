//-- 22.10.2009
//-- mimic full client app. functions
//-- as we have app. already just define functions

//-- set and get vars for webclient
var __protected= new Array();
function setWcVar(strName,varValue)
{
	app.__protected[strName] = varValue;
}
function getWcVar(strName)
{
	return app.__protected[strName];
}


var _CURRENT_JS_WINDOW = null;
var _UseHtmlEmailFormat = "1"; //-- by default use html format
function _newEmail(_arrSpecial)
{
	if(global.CanSendMail())
	{
		if(_arrSpecial==undefined)_arrSpecial=new Array();
		var strParams  = "_emailaction=NEW:&addnew=1";
		app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
	}
	else
	{
		alert(_EM_RIGHTS_MSG[4]);
	}
}

//-- for itsm 3.0.1
function hide_popups()
{
}

function in_array(arr,val){
	for(var i=0,l=arr.length;i<l;i++){
		if(arr[i]===val)
			return true;
	}
	return false;
}


function open_vcm()
{
	alert("open_vcm : This method is not supported in the webclient.");
	return false;
}

function OpenWebClientForm(strFormName,varRecordKey,strParams,boolModal,strFormType,openfromWin,fCallback,_specialParams)
{
	_open_system_form(strFormName, strFormType, varRecordKey, strParams, boolModal, fCallback,undefined,openfromWin,undefined,undefined,_specialParams);
}

//-- open a form for edit
function OpenFormForEdit(strFormName,varRecordKey,strParams,boolModal,fCallback,openfromWin)
{
	//-- open default sla edit form
	 _open_application_form(strFormName, "stf", varRecordKey, strParams, boolModal, "edit" ,fCallback,undefined,openfromWin);		
}

//-- open a form for add
function OpenFormForAdd(strFormName,varInitialRecordKey,strParams,boolModal,fCallback,openfromWin)
{
	 _open_application_form(strFormName, "stf", varInitialRecordKey, strParams, boolModal, "add", fCallback,undefined,openfromWin);
}

//-- open a form
function OpenForm(strFormName,strParams,boolModal,fCallback,openfromWin)
{
	  _open_application_form(strFormName, "stf", "", strParams, boolModal, "add", fCallback,undefined,openfromWin);
}

function OpenUpdateCallForm(strCallrefs,strUpdateText,callback)
{
	var arrSpecial = [];
	if(strUpdateText)arrSpecial["updatetext"]=strUpdateText;
	_updatecallform(strCallrefs,null,arrSpecial,function(form)
	{
		if(callback)callback((form)?true:false);
	});

}

function OpenAcceptCallForm(strCallrefs,strUpdateText,callback)
{
	var arrSpecial = [];
	if(strUpdateText)arrSpecial["updatetext"]=strUpdateText;
	_acceptcallform(strCallrefs,null,arrSpecial,function(form)
	{
		if(callback)callback((form)?true:false);
	});
} 

function OpenCallHoldForm(strCallrefs,strUpdateText,callback)
{
	var arrSpecial = [];
	if(strUpdateText)arrSpecial["updatetext"]=strUpdateText;
	_holdcallform(strCallrefs,null,arrSpecial,function(form)
	{
		if(callback)callback((form)?true:false);
	});
} 

function OpenCallResolveCloseForm(strCallrefs, strResolveText,callback, strCloseUpdateText, strFixCode, strIssueRef)
{
	var arrSpecial = new Array();
	arrSpecial['issueref'] = strIssueRef;
	arrSpecial['updatetxt'] = strResolveText;

	_resolveclosecallform(strCallrefs,undefined,arrSpecial,callback);
}

//-- open log cal form
function _open_logcall_form(strCallClass, strParams, openedFromWin, _specialParams,callback)
{
	//-- check right
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANLOGCALLS,true))return;

	//-- check if we have more than one form per callclass - if so make use choose which one to use
	if(strCallClass==undefined || strCallClass=="")
	{
		//-- popup callclass selector
		_open_system_form("_wc_lognewcallclass", "lcfpicker", "", strParams, true, callback,undefined,openedFromWin,_specialParams);
		return;
	}

	var strCallClassForm = strCallClass;
	_open_application_form(strCallClassForm, "lcf", "", strParams, false, "add", callback,undefined,openedFromWin,_specialParams);	
}

function _select_callcondition(openedFromWin,callback)
{
	var strParams = ""; 
	_open_system_form("_wc_callcondition", "conditionpicker", "", strParams, true, function(oForm)
	{
		if(callback)callback(oForm._swdoc._selected_condition);
		
	},undefined,openedFromWin);
	

}

function _select_callclass(openedFromWin,callback)
{
	var strParams = "_selectcallclass=yes"; 
	var oform = _open_system_form("_wc_lognewcallclass", "lcfpicker", "", strParams, true, function(oForm)
	{
		if(oForm && callback) callback(oForm._swdoc._selected_callclass);
	},undefined,openedFromWin);
	
	
}

//--
//-- open call detail form for given callref
function _open_call_detail(nCallref,callback)
{
	//-- get call class
	_open_call_form("cdf",nCallref,false,window,callback);
}

//--
//-- open call form , check permissions
function _open_call_form(strType,intCallref,boolModal,openfromWin,callback)
{

	if(isNaN(intCallref))
	{
		//-- may have been passed an F
		intCallref = intCallref.replace(/[^\d]/g,"");
		intCallref++;intCallref--;
	}

	//-- get call record from sysdb first
	var boolGoodCall = true;
	var oRec = new SqlRecord();
	if(oRec.GetCacheRecord("opencall",intCallref)==0)
	{
		if(oRec.GetRecord("opencall",intCallref)==0)
		{
			boolGoodCall = false;
		}
	}
	
	if(!boolGoodCall)
	{
		alert("The record " + dd.tables["opencall"].columns["callref"].FormatValue(intCallref) + " was not found on the system. Please contact your Administrator");
		return false;
	}

	//-- check that user has right to opencall 
	var boolCanViewOtherRepCalls = session.HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANSWITCHREP);
	if((boolCanViewOtherRepCalls==false) && (oRec.owner!=session.analystid) && (oRec.owner!=""))
	{
		alert("You do not have permission to view records that are assigned to other analysts.");
		oRec=null;
		return false;
	}	

	//-- if can view groups then
	var boolCanViewOtherGroupCalls = session.HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANSWITCHGROUP);
	if((boolCanViewOtherGroupCalls==false) && (session.IsMemberOfSupportGroup(oRec.suppgroup)==false))
	{
		alert("You do not have permission to view records that are assigned to support groups that you are not a member of.");
		oRec=null;
		return false;
	}

	var strCallClass = oRec.callclass;
	var intCallref = oRec.callref;
	var intStatus = oRec.status;
	
	//-- incomming so log new call
	if(intStatus==8)
	{
		var strParams = "";
		for(strID in oRec)
		{
			if(strParams != "")strParams += "&";
			strParams += "incoming." + strID + "="+ app.pfu(oRec[strID]);
		}
		oRec=null;
		global.LogNewCall("",callback,window,null,strParams);
		return;
	}
	else
	{
		var strUseFormName = "";
		oRec=null;
		

		

		//-- check what form to load for callclass
		for(strFormName in app._arr_cdf_forms)
		{
			if(app._arr_cdf_forms[strFormName]==strCallClass)
			{	
				if(strUseFormName!="")strUseFormName+=",";
				strUseFormName += strFormName;
			}
		}

		//-- more than one form to use - so let user select a cdf form
		if(strUseFormName.indexOf(",")!=-1)
		{
			var strParams = "_incallclass="+strCallClass;
			_open_system_form("_wc_selectcdf", "cdf", "", strParams, true, function(oForm)
			{
				if(oForm._swdoc._selected_cdf=="") return;
				
				strUseFormName = oForm._swdoc._selected_cdf
				_open_application_form(strUseFormName, "cdf", intCallref, "", boolModal, "edit", callback,undefined,openfromWin);								
				
			}, null, openfromWin);
		}
		else
		{
			_open_application_form(strUseFormName, "cdf", intCallref, "", boolModal, "edit", callback,undefined,openfromWin);	
		}
	}//-- eof incoming
}

function _explodeparams(strParams)
{
	var targetArray=new Array();
	if(strParams==undefined)strParams="";
	strParams = strParams + "";
	var arrParams = strParams.split("&");
	for(var x=0;x<arrParams.length;x++)
	{
		//-- store param and decode value as may have url encoded (esp if it has &amp)
		var iPos = arrParams[x].indexOf("=");
		var paramName = app.trim(arrParams[x].substring(0,iPos));
		var paramValue = arrParams[x].substring(iPos+1);

		try
		{
			targetArray[paramName.toLowerCase()] = decodeURIComponent(paramValue); 
		}
		catch(e)
		{
			targetArray[paramName.toLowerCase()] = paramValue; 
		}
	}
	return targetArray;
}

//-- popup operatorscript
function _operatorscript(intScriptID, fromWin,callback)
{
	var strParams = "scriptid="+intScriptID;
	_open_system_form("operatorscript.php", "opscript", "", strParams, true, callback, null, fromWin,600,300);
}

//-- popup analyst tree
function _analystpicker(strTitle, bShowThirdParty, callback, fromWin)
{
	if(strTitle==undefined)strTitle = "Assign";
	if(bShowThirdParty==undefined)bShowThirdParty = true;
	var strParams = "showthirdparty="+bShowThirdParty+"&formtitle="+app.pfu(strTitle);
	return _open_system_form("analystpicker.php", "assigntree", "", strParams, true, callback, null, fromWin);
}
function _analystselected(strGroupID, strAnalystID, strGroupName, strAnalystName, srcEle)
{
	alert(strGroupID + ":"+ strAnalystID)
}

//-- popup profile code selector
function _profilecodeselector(strType,strFilter, strInitialCode, fCallback, srcEle, fromWin)
{
	if(strType=="lcf")
	{
		 _lfc_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin);
	}
	else if(strType=="cdf")
	{
		 _cdf_profilechanger(strFilter,strInitialCode,fCallback,srcEle,fromWin);
	}
	else if(strType=="fix")
	{
		 _res_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin);
	}
}

function _lfc_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin)
{
	var strParams = "filter=" + app.pfu(strFilter) + "&initcode=" + strInitialCode;
	_open_system_form("problemprofilepicker.php", "profilecode", strInitialCode, strParams, true, fCallback, srcEle, fromWin,600,500);
}

function _cdf_profilechanger(strFilter,strInitialCode,fCallback,srcEle,fromWin)
{
	var strParams = "filter=" + app.pfu(strFilter) + "&initcode=" + strInitialCode;
	_open_system_form("problemprofilechanger.php", "profilecode", strInitialCode, strParams, true,  fCallback, srcEle, fromWin,400,500);
}

function _res_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin)
{
	var strParams = "filter=" + app.pfu(strFilter) + "&initcode=" + strInitialCode;
	_open_system_form("resolutionprofilepicker.php", "profilecode", strInitialCode, strParams, true, fCallback, srcEle, fromWin,600,500);
}


function select_profile_code_for_element (srcEle, bRightHandAreaClick,bShowDesc, oE, fromWin)
{
	if(fromWin==undefined)fromWin=window;

	//-- check if clicked righthand selector box
	if( (bRightHandAreaClick) && (!app._clicked_ele_trigger(srcEle,oE)) )
	{
		//-- do nto show
		return true;
	}

	if(app.boolMouseRightClick(oE))
	{
		app.setEleValue(srcEle,"",null,"");
		app.stopEvent(oE);
		app.fireEvent(srcEle,"blur");
		return false;

	}
	else
	{
		var strInitialCode = (srcEle.getAttribute("dbvalue")!=null)?srcEle.getAttribute("dbvalue"):"";
		app._profilecodeselector("cdf","", strInitialCode, function(returnFormObject)
		{
			if(returnFormObject.selected)
			{
				//-- set value
				var desc = (bShowDesc==true)?returnFormObject.codeDescription:returnFormObject.code;
				app.setEleValue(srcEle,returnFormObject.code,null,desc);
				app.stopEvent(oE);
				app.fireEvent(srcEle,"blur");
				return false;
			}	
		}, null, window);
	}	
}



//--
//-- OPEN CALL ACTION FORMS
//--


function _open_hdtask_detail(intKeyValue, intCallref, intStatus)
{
	var strParams = "callref=" + intCallref;

	//-- determine form to open
	var strForm =(intStatus==16)?"_sys_calltask_completed":"_sys_calltask";

	app.OpenWebClientForm(strForm,intKeyValue,strParams,true,"workflow",window,undefined);
}

function _completetaskform(strTaskID, strCallref,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANUPDATECALLS,true))return false;

	//-- make sure task can be completed by this analysts.
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref",strCallref); 
	xmlmc.SetParam("workItemId",strTaskID); 
	if(xmlmc.Invoke("helpdesk", "getCallWorkItem"))
	{
		//-- address for this mailbox
		var intActionBy = new Number(xmlNodeTextByTag(xmlmc.xmlDOM,"actionBy"));
		if(intActionBy<2)
		{
			if(intActionBy==0)
			{
				var strAID = xmlNodeTextByTag(xmlmc.xmlDOM,"assignToAnalyst");
				if(strAID!=session.currentAnalystId && strAID!=session.analystid)
				{
					alert("The selected work item can only be completed by " + strAID);
					return false;
				}
			}
			else
			{
				//-- to be completed by group
				var strGroup = xmlNodeTextByTag(xmlmc.xmlDOM,"assignToGroup");
				if(strGroup!=session.currentGroupId && strGroup!=session.groupId)
				{
					alert("The selected work item can only be completed by someone in the " + strAID + " group");
					return false;
				}
			}
		}

		var strFormName = app.dd.GetGlobalParam("Call Action Forms/CompleteWorkItemForm");
		if(strFormName=="")strFormName = "EfCompleteWorkItemForm"; 
		_process_call_actionform(strFormName,strCallref,openfromWin,strTaskID,arrSpecial,callback);
	}

}

function _updatecallform(strCallrefs,openfromWin,arrSpecial,callback)
{

	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANUPDATECALLS,true))return false;

	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/UpdateCallForm");
	if(strFormName=="")strFormName = "efUpdateCallForm"; 
	_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);
}

function _holdcallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANPLACECALLONHOLD,true))return false;


	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/HoldCallForm");
	if(strFormName=="")strFormName = "EfUpdateCallForm"; 
	_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);

}

function _acceptcallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS,true))
	{
		return false;
	}

	//-- use form or basic popup?
	if(session.IsDefaultOption(ANALYST_DEFAULT_FORCEUPDATEWHENACCEPTCALL)==false)
	{
		//-- basic popup
		var strParams = "_callrefs=" + strCallrefs;
		app._open_system_form("_wc_acceptcall", "acceptcall", "", strParams, true,callback,null);
	}
	else
	{
		//-- check global params for form name
		var strFormName = app.dd.GetGlobalParam("Call Action Forms/AcceptCallForm");
		if(strFormName=="")strFormName = "EfAcceptCallForm"; 

		//-- set call accepted by default text
		if(arrSpecial==undefined)arrSpecial = new Array();
		arrSpecial["updatetext"] = "Call accepted by ";
		arrSpecial["updatetext"] +=(session.currentAnalystId!="")?session.currentAnalystId:session.analystid;

		_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);
	}
}

function _resolveclosecallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	//-- get call status's so we can check permissions
	var bHaveResolvedCalls = false;
	var bOtherCallStatus = false;
	var SqlRecordSetObj = new SqlQuery();

	var strParams = "dsn=sw_systemdb&callrefs=" + strCallrefs; 
	SqlRecordSetObj.WebclientStoredQuery("system/getCallListStatus",strParams);
	while(SqlRecordSetObj.Fetch())
	{
		if(SqlRecordSetObj.GetValueAsNumber(0)==6)
		{
			bHaveResolvedCalls=true;
		}
		else
		{
			bOtherCallStatus=true;
			if(bHaveResolvedCalls)break;
		}
	}

	//-- check permissions
	if(bOtherCallStatus && !session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANRESOLVECALLS,true))return false;
	if(bHaveResolvedCalls && !session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCLOSECALLS,true))return false;
	
	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/ResolveCloseCallForm");
	if(strFormName=="")strFormName = "EfResolveCloseCallForm"; 
	_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);

}

function _logresolveclosecallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/LogResolveCloseCallForm");
	if(strFormName=="")strFormName = "EfLogResolveCloseCallForm"; 
	 _process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial);
}


function _cancelcallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCANCELCALLS,true))return false;

	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/CancelCallForm");
	if(strFormName=="")strFormName = "EfCancelCallForm"; 
	 _process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);

}


function _issueform(strIssueRef,strCallrefs,bModal, openfromWin,arrSpecial,callback)
{
	if(bModal==undefined)bModal=false;
	if(strCallrefs==undefined)strCallrefs="";
	//-- check global params for form name

	if(arrSpecial==undefined)arrSpecial= new Array();
	arrSpecial['callrefs'] = strCallrefs;

	var strFormName = app.dd.GetGlobalParam("Call Action Forms/IssueForm");
	if(strFormName=="")strFormName = "EfNewIssueForm"; 

	var strMode = (strIssueRef=="")?"add":"edit";

	return _open_application_form(strFormName, "stf", strIssueRef, "", bModal, strMode, callback,undefined,openfromWin,arrSpecial);	


	//return _process_call_actionform(strFormName,strIssueRef,openfromWin,"",arrSpecial);

}

function _process_call_actionform(strFormName,strCallref,openfromWin,strTaskIDs,arrSpecial,callback)
{
	var strParams = "";
	if(arrSpecial==undefined)arrSpecial = new Array();
	arrSpecial['callrefs'] = strCallref +"";;
	if(strTaskIDs!=undefined)arrSpecial['taskid'] = strTaskIDs +"";
	arrSpecial['callactionform'] = true;

	_open_application_form(strFormName, "stf", strCallref+"", strParams, true, "add", callback,undefined,openfromWin,arrSpecial);	
}


//-- take a call off hold
function _offholdcall(strCallrefs)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANTAKECALLOFFHOLD,true))return false;

	return _swchd_offhold_call(strCallrefs);
}

//-- reactivate
function _callreactivate(strCallrefs)
{
	
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANREACTIVATECALLS,true))return false;
	app._swchd_reactivate_call(strCallrefs);
}


function _assigncall(strCallrefs,strAnalystID,strGroupID,thirdPartyContract, openfromWin,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANASSIGNCALLS,true))return false;

	return app._swchd_assign_call(strCallrefs, strGroupID, strAnalystID, thirdPartyContract, openfromWin,callback);
}

//-- given callrefs get profile code filter from the callclass form
//-- uses info from the biggest callref
function _get_callclass_form_profilefilter(_CurrentSelectedServiceDeskCallrefs)
{
	if(global._array_cdf_profile_filters==undefined)global._array_cdf_profile_filters = new Array();

	//-- get largest callref
	var intCallref = 0;
	var arrCallrefs = _CurrentSelectedServiceDeskCallrefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		var testnum = arrCallrefs[x] - 0;
		if(testnum>intCallref)intCallref=testnum;
	}

	//-- get call records
	var oRec = new SqlRecord();
	if(oRec.GetCacheRecord("opencall",intCallref)==0)
	{
		if(oRec.GetRecord("opencall",intCallref)==0)
		{
			//-- call not found
			return "";
		}
	}

	//-- get form for the callclass
	var strUseForm = "";
	for(var strFormName in app._arr_cdf_forms)
	{
		if(app._arr_cdf_forms[strFormName]==oRec.callclass)
		{
			strUseForm = strFormName;
			break;
		}
	}

	if(strUseForm=="") return "";

	//-- if cached use it
	if(global._array_cdf_profile_filters[strUseForm]!=undefined) return global._array_cdf_profile_filters[strUseForm];


	var strFilter = "";
	var jsForm = _get_form_json(strUseForm, "cdf");	
	if(jsForm)
	{
		//-- get profile code
		try
		{
			var strFilter = jsForm.espForm.configuration.settings.profileFilter;	
			if(strFilter==undefined)strFilter="";
		}
		catch (e)
		{
			strFilter="";
		}
	}
	//-- cache filter
	global._array_cdf_profile_filters[strUseForm] = strFilter;
	return strFilter;
}

//-- return a form definition - uses php to get form content (secure)
function _get_form_json(strFormName, strFormType)
{
	//-- go fetch json form content
	var strParams = "formtype=" + strFormType + "&formname="+ strFormName;
	var strURL = app.get_service_url("form/getform","");
	var __formjson =  app.get_http(strURL, strParams, true,false, null);
	if(__formjson!="")
	{
		try
		{
			var jsonformdata = eval("(" + __formjson + ");");			
		}
		catch (e)
		{
			alert("The form json structure for " + info.__formname + " is corrupt . Please contact your Administrator.");
			return null;
		}
	}

	//-- check json structure
	if(jsonformdata.espForm==undefined)
	{
		alert("The form meta data for " + info.__formname + " is corrupt . Please contact your Administrator.");
		return null;
	}

	return jsonformdata;
	
}

function pfs(strValue)
{
	return app.PrepareForSql(strValue);
}


//-- function returns array of sql parts
//-- select, tables, where
function _split_sqlquery(strSQL)
{
	//-- find table name and action
	strSQL = app.trim(strSQL.toLowerCase());
	var arrSQL = strSQL.split(" ");

	//-- determine action
	var strAction = arrSQL[0];
	var strTable = "";
	var strCols = "";
	var ifrompos = -1;
	var iwherepos = -1;
	var igrouppos = -1;
	var iorderpos = -1;
	var bPastInTo = false;
	for(var x=1;x<arrSQL.length;x++)
	{
		if(strAction=="update" && strTable=="")
		{
			if(arrSQL[x]!="")
			{
				strTable=arrSQL[x];
				break;
			}
		}
		else if(strAction=="insert" && strTable=="")
		{
			if(bPastInTo && arrSQL[x]!="")
			{
				strTable=arrSQL[x];
				break;
			}
			if(arrSQL[x]=="into")bPastInTo = true;
		}
		else 
		{
			if(arrSQL[x]=="from" && ifrompos==-1) ifrompos = x;
			if(arrSQL[x]=="where" && iwherepos==-1) iwherepos = x;
			if(arrSQL[x]=="order" && iorderpos==-1) iorderpos = x;
			if(arrSQL[x]=="group" && igrouppos==-1) igrouppos = x;
		}
	}

	//-- get select cols
	var arrCol = strSQL.split("from");
	var iSpacePos = arrCol[0].indexOf(" "); 
	var strCols = arrCol[0].substring(iSpacePos);

	if(strAction=="delete" || strAction=="select")
	{
		var ilastPos = arrSQL.length;
		if(iwherepos!=-1)
		{
			ilastPos =iwherepos;
		}
		else if (igrouppos!=-1)
		{
			ilastPos =igrouppos;
		}
		else if (iorderpos!=-1)
		{
			ilastPos =iorderpos;
		}
		
		var strAllTables = ""
		for(var x=ifrompos+1;x<ilastPos;x++)
		{
			strAllTables += arrSQL[x]
		}
		strTable = strAllTables;
	}
	
	var arrSQL = new Array();
	arrSQL["action"] = strAction;
	arrSQL["table"] = strTable;
	arrSQL["columns"] = strCols;
	return arrSQL;

}


function _replaceIllegalFileCharacters(strFileName)
{
//-- This function is used to replace characters in the passed in string that 
	//-- are not suitable for use in filenames and return the modified string 
	if(strFileName==undefined)return "";
	strOutput = strFileName;
	strReplacement = "_";
	var i = 0;
	
	while(i < strOutput.length)
	{
		strOutput = strOutput.replace('/', strReplacement);
		strOutput = strOutput.replace(':', strReplacement);
		strOutput = strOutput.replace('*', strReplacement);
		strOutput = strOutput.replace('?', strReplacement);
		strOutput = strOutput.replace('"', strReplacement);
		strOutput = strOutput.replace('\'', strReplacement);
		strOutput = strOutput.replace('<', strReplacement);
		strOutput = strOutput.replace('>', strReplacement);
		
		i++;
	}
	
	return strOutput;
}