
var __cached_forms = new Array();
var __windowcount = 1;
var __open_windows = new Array();
var __modal_windows = new Array();
var __window_pointers = new Array();


function _save_cache(aObject, strName)
{
	__cached_forms[strName] = new Array()
	
	//__cached_forms[strName]["formxml"] = aObject.formxml; - 01.09.2011 - now using json forms
	__cached_forms[strName]["formjsonstring"] = aObject.formjsonstring;

	//-- doc level js
	__cached_forms[strName]["arr_document_vars"] = new Array();
	for(var x=0; x<aObject.arr_document_vars.length;x++)
	{
		//-- if exists in top then add document pointer
		__cached_forms[strName]["arr_document_vars"][__cached_forms[strName]["arr_document_vars"].length++]=aObject.arr_document_vars[x];
	}

	//-- mainform js
	__cached_forms[strName]["mainform_func_names"] = new Array();
	for(strID in aObject.mainform_func_names)
	{
		//-- if exists in top then add document pointer
		__cached_forms[strName]["mainform_func_names"][strID]=strID;
	}

	//--extform js
	__cached_forms[strName]["extform_func_names"] = new Array();
	for(strID in aObject.extform_func_names)
	{
		//-- if exists in top then add document pointer
		__cached_forms[strName]["extform_func_names"][strID]=strID;
	}

	__cached_forms[strName]["mainformjs"] = aObject.mainformjs;
	__cached_forms[strName]["extformjs"] = aObject.extformjs;
	__cached_forms[strName]["documentjs"]= aObject.documentjs;

	__cached_forms[strName]["mainformhtml"]= aObject.mainformhtml;
	__cached_forms[strName]["extformhtml"]= aObject.extformhtml;

	//-- store size
	__cached_forms[strName]["width"]= 0;
	__cached_forms[strName]["height"]= 0;
}


function _open_application_form(strFormName, strType, varRecordKey, strParams,boolModal, strMode, fCallback,srcEle,openedFromWin,arrSpecialVars)
{
	//-- check if special form i.e. treebrowser
	if(strFormName.indexOf(".")>0)
	{
		var arrFormName = strFormName.split(".");
		if(arrFormName[0].toLowerCase()=="treebrowserform")
		{
			strFormName = "_wc_treebrowserform";
			varRecordKey = arrFormName[1];
			strMode ="add";
			boolModal = true;

			return _open_system_form(strFormName, "treebrowserform", varRecordKey, strParams, boolModal, fCallback,srcEle,openedFromWin,undefined,undefined,arrSpecialVars);
		}
		else if(arrFormName[0].toLowerCase()=="form")
		{
			strFormName = arrFormName[1];
		}
	}

	//-- check for overrides - this way apps dev can handle things like the cmdb popup ci form
	if(strType.toLowerCase()=="stf")
	{
		var strFunctionName = "WebClientOverride_OpenForm";
		if(strMode.toLowerCase()=="edit")
		{
			strFunctionName +="ForEdit";
		}
		else if(strMode.toLowerCase()=="add")
		{
			strFunctionName +="ForAdd";
		}

		//-- allow app dev to override in clisupp/js/dd/app.js
		var overridefunc = app[strFunctionName]; 
		if(overridefunc != undefined)
		{
			var res = overridefunc(strFormName,varRecordKey,strParams,boolModal,openedFromWin,fCallback);
			if(res!=false)return res;
		}
	}

	var info = new Object();
	info.__app = top;
	info.__formname = strFormName;
	info.__formmode = strMode; //-- edit , add , browse
	info.__formtype = strType; //-- stf , cdf , lcf
	info.__recordkey = varRecordKey;

	info.__params = strParams;
	info.__openedfromwin = openedFromWin;
	info.__modal = boolModal;
	info.__callback = fCallback;
	info.__targetele =	srcEle;
	info.__openedfromwin = openedFromWin;
	info.__callclass = strFormName;

	if(arrSpecialVars!=undefined)
	{
		info.__form = new Array();
		for(strItem in arrSpecialVars)
		{
			info.__form[strItem] = arrSpecialVars[strItem];
		}
	}


	var strWindowName = strFormName +"_"+ (__windowcount++);
	strWindowName = app.string_replace(strWindowName, " ","_",true);
	strWindowName = app.string_replace(strWindowName, ".","_",true);
	__open_windows[strWindowName] = info;

	//-- get form processing path
	var strURL = _root + "client/forms/xmlForm.php";

	return _open_window(strURL, strWindowName, boolModal, 400, 400,info,openedFromWin,strFormName);
}


function _open_system_form(strFormName, strType, varRecordKey, strParams, boolModal, fCallback,srcEle,openedFromWin,iWidth,iHeight,arrSpecialVars)
{

	var info = new Object();
	info.__app = top;
	info.__formname = strFormName;
	info.__formmode = (varRecordKey!="")?"edit":"add";
	info.__formtype = "_system/" + strType; //-- calendar, knowledgebase,mail,picklist,profile etc
	info.__recordkey = varRecordKey;
	info.__params = strParams;
	info.__openedfromwin = openedFromWin;
	info.__modal = boolModal;
	info.__callback = fCallback;
	info.__targetele =	srcEle;
	info.__openedfromwin = openedFromWin;
	info.__callclass = strFormName;

	if(arrSpecialVars!=undefined)
	{
		info.__form = new Array();
		for(strItem in arrSpecialVars)
		{
			info.__form[strItem] = arrSpecialVars[strItem];
		}
	}

	var strWindowName = strFormName +"_"+ (__windowcount++);
	strWindowName = app.string_replace(strWindowName, " ","_",true);
	strWindowName =  app.string_replace(strWindowName, ".","_",true);
	
	
	__open_windows[strWindowName] = info;

	//-- get form processing path
	if(strFormName.indexOf(".php")!=-1)
	{
		var strURL = _root + "client/forms/_system/" + strType +"/" + strFormName;
		if(strParams!="")strURL += "?" + strParams;
		strWindowName = app.string_replace(strWindowName, ".php","_php",true);
	}
	else
	{
		var strURL = _root + "client/forms/xmlForm.php";//?swsessionid=" + _swsessionid + "&sessid="+ _swsessionid;
	}

	if(iWidth==undefined)iWidth=400;
	if(iHeight==undefined)iHeight=400;		
	return _open_window(strURL, strWindowName, boolModal, iWidth, iHeight,info,openedFromWin, strFormName);
}


//--
//-- supportwors uses modal windows to need way to mimic this. ie is ok as it has a modal window, mozilla and opera do not
function _open_window(strURL, strName, boolModal, iWidth, iHeight,info,openedFromWin,strSwFormName) 
{

	//-- 14.09.2010
	//-- check session is valid before opening any windows
	var xmlmc = new XmlMethodCall();
	if(!xmlmc.Invoke("session", "isSessionValid"))
	{
		//-- log out
		app.logout("m3");
		return false;
	}
	
	//-- hide any menu divs
	app.hide_application_menu_divs();
	
	//-- use window where this would have been triggered from
	if(_CURRENT_JS_WINDOW!=null)
	{
		if(_CURRENT_JS_WINDOW.closed)
		{
			_CURRENT_JS_WINDOW = null;
			openedFromWin=(openedFromWin)?openedFromWin:window;
		}
		else
		{
			openedFromWin=_CURRENT_JS_WINDOW;
		}
	}
	else
	{
		openedFromWin=(openedFromWin)?openedFromWin:window;
	}

	
	info.__parentwindow = openedFromWin;
	var _systemform =false;

	//-- check if we have cache info
	var strCacheFormName = info.__formtype +"_"+ strSwFormName;
	if(__cached_forms[strCacheFormName]!=undefined)
	{
		info.__cachedata = __cached_forms[strCacheFormName];
		iWidth = __cached_forms[strCacheFormName].width;
		iHeight = __cached_forms[strCacheFormName].height;
	}
	else if(strSwFormName.indexOf(".php")==-1)
	{
		//-- get xml form back as json - this will also check access permission
		var strPassUpParams = (info.__params!=undefined && info.__params!="")?"&"+info.__params:"";
		var strParams = "formtype=" + info.__formtype  + "&formname=" + info.__formname + "&formmode=" + info.__formmode + "&formkey=" + info.__recordkey + strPassUpParams;
		var strFormJSONURL = app._root  + "service/form/getform/index.php";
		var __formjson =  app.get_http(strFormJSONURL, strParams, true,false, null);
		if(__formjson!="")
		{
			if(__formjson.indexOf("formaccessdenied:")==0)
			{
				openedFromWin.alert(__formjson.replace("formaccessdenied:",""));
				return null;						
			}
			else if(__formjson.indexOf("invalid session")>-1)
			{
				app.logout("m3");
				return null;						
			}

			try
			{
				var jsonformdata = eval("(" + __formjson + ");");	
				
			}
			catch (e)
			{
				openedFromWin.alert("The form json structure for " + info.__formname + " is corrupt . Please contact your Administrator.");
				return null;
			}
		}

		//-- check json structure
		try
		{
			if(jsonformdata.espForm==undefined)
			{
				openedFromWin.alert("The form meta data for " + info.__formname + " is corrupt . Please contact your Administrator.");
				return null;
			}		
		}
		catch (e)
		{
			openedFromWin.alert("The form meta data for " + info.__formname + " is corrupt . Please contact your Administrator.");
			return null;
		}

		info.__formjsonstring = __formjson;
		__formjson = "";

		//-- get form default height and width from main form
		if(jsonformdata.espForm.layout==undefined)
		{
			//-- for lcf and cdf
			var iWidth = jsonformdata.espForm.layouts.layout[0].appearance.width;
			var iHeight = jsonformdata.espForm.layouts.layout[0].appearance.height;
		}
		else
		{
			//-- for stf form
			var iWidth = jsonformdata.espForm.layout.appearance.width;
			var iHeight = jsonformdata.espForm.layout.appearance.height;
		}

		iWidth--;
		iWidth = iWidth + 5;
		iHeight--;
		iHeight = iHeight + 32;
		if(info.__formtype=="cdf" || info.__formtype=="lcf") iHeight = iHeight + 48; //-- tab items
	}

	strName = strName + global.GetCurrentEpocTime(); //-- make unique so can open many
	__open_windows[strName] = info;

	//-- open and store pointer to the window
	var strModal = (boolModal)?"yes":"no";
	var aWin = window.open(strURL,strName,'toolbar=no,directories=no,status=yes,menubar=no,scrollbars=no,resizable=yes,height='+iHeight+',width='+iWidth+',modal='+strModal);
	if(aWin)
	{
		$(info.__parentwindow.document).find("*").off("focus.modals")
		//-- put a shimer over open from window
		if(boolModal)
		{
			var shimmer = info.__parentwindow.document.getElementById("windowModalDiv");
			if(shimmer==null)
			{
				var strHTML = "<div id='windowModalDiv' style='z-index:9999999;width:100%;height:100%;position:absolute;top:0px;left:0px;display:block;'></div>";
				app.insertBeforeEnd(info.__parentwindow.document.body,strHTML);
			}
			else
			{
				//-- already exists so just show shimmer
				shimmer.style.display="block";
			}
			$(info.__parentwindow).on("focus.modals",function(e)
			{
				aWin.focus();
				e.preventDefault();
				
				$(info.__parentwindow.document).find("*").off("focus.modals").on("focus.modals",function(e)
				{
					aWin.focus();
					e.preventDefault();
				});
			
			})
		}
		
		aWin.__app = top.app;
		__window_pointers[strName] = aWin;
		setTimeout("_focus_new_window('"+strName+"')",500);
		return aWin;
	}
	else
	{
		openedFromWin.alert("There was a problem opening the requested window. Please check for any popup blocker messages.");
		return null;
	}


	return null;
} 

function _on_window_closed(strName)
{
	var f = function()
	{
		if(__open_windows[strName])
		{
			try{
				var shimmer = __open_windows[strName].__parentwindow.document.getElementById("windowModalDiv");
				if(shimmer)shimmer.style.display="none";
			}catch(e){}
						
			if(__open_windows[strName].__callback && __open_windows[strName].returnInfo!=undefined)
			{
				//-- can cause issues in ie11??
				try{
					if(__open_windows[strName].__parentwindow) {_CURRENT_JS_WINDOW = __open_windows[strName].__parentwindow;}
				}catch(e){}
				
				__open_windows[strName].__callback(__open_windows[strName].returnInfo);
				
			}
		}
		__open_windows[strName] = null;
	};
	
	//-- used to have a timeout calling f() but removed for IE11 fix 92201	
	f();
}

function _focus_new_window(strName)
{
	try
	{
		__window_pointers[strName].focus();		
	}
	catch (e)
	{
	}

}

function _regexreplace(strValue,strFind,strReplace)
{
	  var re = new RegExp(strFind, "g");
	  strValue = strValue.replace(re, strReplace);
	  return strValue;
}
