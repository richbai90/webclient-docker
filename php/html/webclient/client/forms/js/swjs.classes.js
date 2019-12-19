var _bHtmlWebClient = true;
var _uniqueformid ="";

//-- used to check is something is defined
function IsObjectDefined(strObjectName)
{
	try
	{
		eval("var tmp = "+strObjectName+";");		
		if(tmp!=undefined) return true;
	}
	catch (e)
	{
		return false;
	}
	return false;
}

//--
//-- wrappers for easy webclient migration - place in global.js of application
//-- 
//-- if you use these wrappers then you will not need to alter alot of the js for the webclient when you do customisations in the fullclient
//--
//--
//-- set elements value
//-- usage _eva(tb_custid,'neilwj');
function _eva(oEle,varValue)
{
	if(oEle._value)
	{
		oEle._value(varValue);
	}
	else
	{
		oEle.value = varValue;
	}
}

//-- set elements text
//-- usage _ete(tb_custid,'neilwj');
function _ete(oEle,varValue)
{
	if(oEle._text)
	{
		oEle._text(varValue);
	}
	else
	{
		oEle.text = varValue;
	}
}

//-- enable / disable an ele
//-- usage _een(tb_custid,true); / _een(tb_custid,false); / _een(mainform.tb_custid,true);
function _een(oEle,boolEnable)
{
	if(oEle._enable)
	{
		oEle._enable(boolEnable);
	}
	else
	{
		oEle.enable = boolEnable;
	}
}

//-- readonly an ele
//-- usage _ero(tb_custid,true); / _ero(tb_custid,false); / _ero(mainform.tb_custid,true);
function _ero(oEle,boolRO)
{
	if(oEle._readOnly)
	{
		oEle._readOnly(boolRO);
	}
	else
	{
		oEle.readOnly = boolRO;
	}
}

//-- mand an ele
//-- usage _ema(tb_custid,true); / _ema(tb_custid,false); / _ema(mainform.tb_custid,true);
function _ema(oEle,boolMandatory)
{
	oEle._mandatory(boolMandatory);
}

//-- visible an ele
//-- usage _evi(tb_custid,true); / _evi(tb_custid,false); / _evi(mainform.tb_custid,true);
function _evi(oEle,boolVisible)
{
	oEle._visible(boolVisible);
}

//--
//-- sqllist specific properties wrappers

//-- set filter
function _slf(oEle, strFilter)
{
	oEle._filter(strFilter);
}

//-- set rawsql
function _slraw(oEle, strSQL)
{
	oEle._rawSql(strSQL);
}

//-- filelist path
function _flp(oEle, strPath)
{
	oEle.path = strPath;
	oEle.Refresh();
}



//-- set image
function _eim(oEle,strURI)
{
	oEle._image(strURI);
}

//-- set tab
function _etab(oEle,nTab)
{
	oEle._tab(nTab);
}

//-- set dataref
function _edataref(oEle,strBinding)
{
	oEle._dataRef(strBinding);
}


function _ecol(oEle, strCol)
{
	oEle.element.style.color = strCol;
}

function _emt(oEle, varValue)
{
	var oTD = oEle.htmldocument.getElementById(oEle.name+"_menutext");
	if(oTD!=null)
	{
		varValue = varValue+"";
		if(varValue.indexOf("&")==0)varValue = varValue.substring(1);
		oTD.innerHTML = varValue;
	}
}

function _ewi(oEle, intWidth)
{
	oEle.width = intWidth;
	oEle.element.style.width = intWidth;
}



//--
//--

//-- The name of the view that will be switched to. This value should match the 'IconTitile' specified in the Data Dictionary for the specific view. 
//-- If the 'IconTitle' is not specified in Data Dictionary it should match the 'ViewTitle' instead. This takes a string object. The view name specified 
//-- here is case sensitive; 
function SwitchSupportworksView(strView)
{
	strView = app.string_replace(strView," ","_");
	if(strView!="")app.application_navbar.activatebar(strView.toLowerCase());
}


//-- XmlFile class
function XmlFile()
{
	this.xpath = null;
	this.xmldom = null;
}

//-- given xml string create object so use can access dom using dot notation such as:-
//--
//--	xmlDom.methodCallResult.params[x].nodeName / nodeValue
XmlFile.prototype.loadFromString = function(strXML)
{
	this.xmldom = app.create_xml_dom(app.trim(strXML));
	if(!this.xmldom)return false;

	//-- 03.03.2012 defect fix for htl q87455 / d87579
	this[this.xmldom.documentElement.nodeName] = this._processNodes(this.xmldom.documentElement).odata;
	this._processedNodes = [];
	this._arrayifyNodes(this[this.xmldom.documentElement.nodeName]);
	return true;
}

//-- new method added by c++
XmlFile.prototype.loadFromHttp = function(strUrl,strParams)
{
	if(strParams==undefined || strParams=="")
	{
		strParams="sessid=" + app.session.sessionId;
	}
	else
	{
		strParams+="&sessid=" + app.session.sessionId;
	}
	var strXML = app.get_http(strUrl, strParams, true, false);
	return this.loadFromString(strXML);
}

//-- 03.03.2012 defect fix for htl q87455 / d87579
XmlFile.prototype._arrayifyNodes = function(obj)
{
		
	if(obj.length==undefined) obj.length=0;
	if(obj.nodeValue==undefined) obj.nodeValue="";
	
	for(var strChildName in obj)
	{
		if(strChildName.charAt(0)=="@" || strChildName=="length" || strChildName=="nodeValue" || strChildName=="nodeName" || strChildName=="indexOf") continue;
		
		if(obj[strChildName]==null && !isNaN(strChildName))
		{
			//-- remove
			obj.splice(strChildName,1);
		}
		else
		{
			if($.type(obj[strChildName])!=="string")
			{
				this._arrayifyNodes(obj[strChildName]);
			}
			
			if(isNaN(strChildName))
			{
				obj[obj.length++] = obj[strChildName];
			}
		}
	}
}

XmlFile.prototype._processNodes = function(xml)
{
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) 
  { // element
    // do attributes
    if (xml.attributes.length > 0) 
	{
		obj["@attributes"] = {};
		for (var j = 0; j < xml.attributes.length; j++) 
		{
			var attribute = xml.attributes.item(j);
			obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
		}
    }
  } 
  else if (xml.nodeType == 3) 
  { // text
    obj = xml.nodeValue;
  }

  // do children
  var bArray=false;
  if (xml.hasChildNodes()) 
  {
    for(var i = 0; i < xml.childNodes.length; i++) 
	{
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
	  
	  if(nodeName=="#text")nodeName = "nodeValue";
      if (typeof(obj[nodeName]) == "undefined") 
	  {
		var res = this._processNodes(item);
		if (res.isArray)
		{
			var setChildArray = new Array();
			//-- check each item in res data - and add to array (an object canbe accessed using array index and item name
			for(var cItemName in  res.odata)
			{
				//-- so set string key and value pair in array
				var childObject = res.odata[cItemName];
				setChildArray[cItemName] = childObject;

				//-- if child object is an array then add each instance as indexed iten in array (i.e. 2 or more CallFileAttachments
				if (childObject instanceof Array)
				{
					for(var cidx in childObject)
					{
						setChildArray.push(childObject[cidx]);
					}
				}
			}
			obj[nodeName] = setChildArray;
		}
		else
		{
			obj[nodeName] = res.odata;
		}
		obj[nodeName].nodeName = nodeName;
      } 
	  else
	  {
        if (typeof(obj[nodeName].length) == "undefined") 
		{
          var old = obj[nodeName];
          obj[nodeName] = new Array();
          obj[nodeName].push(old);
		  obj.nodeName = null;
		  bArray=true;
        }

		var res = this._processNodes(item);
		if(res.isArray)
		{
			obj[nodeName].push(res.odata[res.cname]);	
		}
		else
		{
			res.odata.nodeName = nodeName;
			obj[nodeName].push(res.odata);
		}

      }
    }
  }
	
  return {"odata":obj,"cname":nodeName,"isArray":bArray};

}

XmlFile.prototype.load = function(strPath)
{
	alert("XmlFile.load : is not supported by the webclient");
	return false;
}

XmlFile.prototype.save = function(strPath)
{
	alert("XmlFile.save : is not supported by the webclient");
	return false;
}

XmlFile.prototype.xpathFindElement = function(strPath)
{
	if (window.ActiveXObject)
	{
		var xpath = this.xmldom.selectNodes(strPath);
	}
	else if (document.implementation && document.implementation.createDocument)
	{
		var xpath =xml.evaluate(strPath, this.xmldom, null, XPathResult.ANY_TYPE,null);
	}

	return xpath;
}

XmlFile.prototype.getXpathValue = function(strPath)
{
	if (window.ActiveXObject)
	{
		var xpath = this.xmldom.selectNodes(strPath);
	}
	else if (document.implementation && document.implementation.createDocument)
	{
		var xpath =xml.evaluate(strPath, this.xmldom, null, XPathResult.ANY_TYPE,null);
	}

	return xpath;

}

XmlFile.prototype.setXpathValue = function(strPath)
{
	alert("XmlFile.setXpathValue : is not supported by the webclient");
	return false;

}

XmlFile.prototype.setModified = function(strPath)
{
	alert("XmlFile.setModified : is not supported by the webclient");
	return false;
}

XmlFile.prototype.isModified = function(strPath)
{
	alert("XmlFile.isModified : is not supported by the webclient");
	return false;
}

XmlFile.prototype.xpathGetXml = function(strPath)
{
	alert("XmlFile.xpathGetXml : is not supported by the webclient");
	return false;
}

XmlFile.prototype.xpathSetXml = function(strPath)
{
	alert("XmlFile.xpathSetXml : is not supported by the webclient");
	return false;
}


//--
//-- objects that mimic SW js exposed object like pickers, recordset etc

function _new_xmlmethodcall()
{
	return new XmlMethodCall();
}

function XmlMethodCall()
{
	this._params = new Array();
	this._wcparams = new Array()
	this._complexparams = new Array();
	this._strcomplexparams = new Array();
	this._params_counter = new Array();
	this._data = new Array();
	this._complexdataparams = new Array();
	this._strcomplexdataparams = new Array();

	this._lastresult = "";
	this._lasterror = "";
	this.xmlDOM = null;

	//app.debug("XmlMethodCall instance created","XmlMethodCall", "Created");
}

XmlMethodCall.prototype.SetValue = function(strParam,varValue)
{
	if(this._params[strParam]!=undefined)
	{	
		//- if being sent as part of a group
		var intcounter = this._params_counter[strParam];
		if(intcounter==undefined)intcounter=1;
		this._params[strParam + "__grpcounter__" +intcounter] = app.pfx(varValue);
		this._params_counter[strParam] = ++intcounter;
	}
	else
	{
		this._params[strParam] = app.pfx(varValue);
	}
}


XmlMethodCall.prototype.SetWebclientParam = function(strParam,varValue)
{
	this._wcparams[strParam] = varValue;
}


XmlMethodCall.prototype.SetParam = function(strParam,varValue)
{
	this.SetValue(strParam,varValue);
}


XmlMethodCall.prototype.SetParamAsComplexType = function(strParentParam, varXmlString)
{
	//--
	//-- DO NOT PREPARE FOR XML
	var strParentParam = strParentParam + "_complexstr";
	if(this._params[strParentParam]!=undefined)
	{	
		//- if being sent as part of a group
		var intcounter = this._params_counter[strParentParam];
		if(intcounter==undefined)intcounter=1;
		this._params[strParentParam + "__grpcounter__" +intcounter] = varXmlString;
		this._params_counter[strParentParam] = ++intcounter;
	}
	else
	{
		this._params[strParentParam] = varXmlString;
	}

}

XmlMethodCall.prototype.SetComplexValue = function(strParentParam, strParam,varValue)
{
	if(this._params[strParentParam]==undefined)
	{
		this.SetParam(strParentParam,"_sw_complextype");
	}
	this._complexparams[strParam] = strParentParam +"__swcp__" + app.pfx(varValue);
	//app.debug(strParentParam + ":" + strParam + "=" + varValue,"XmlMethodCall", "SetComplexValue");
}

XmlMethodCall.prototype.SetData= function(strParam,varValue)
{

	if(this._data[strParam]!=undefined)
	{
		var intcounter = this._params_counter[strParam];
		if(intcounter==undefined)intcounter=1;
		this._data[strParam + "__grpcounter__" +intcounter] = varValue;
		this._params_counter[strParam] = ++intcounter;
	}
	else
	{
		this._data[strParam] = varValue;
	}
	//app.debug(strParam + "=" + varValue,"XmlMethodCall", "SetData");
}

XmlMethodCall.prototype.SetDataAsComplexType = function(strParentParam, varXmlString)
{
	this.SetData(strParentParam +"_complexstr",varXmlString);
}


XmlMethodCall.prototype.Invoke= function(strType,strName, intShowEmptyDataParamTags,strFormID)
{
	//app.debug(strType + ":" + strName,"XmlMethodCall", "Invoke");

	if(strType.toLowerCase()=="mail" && !app.global.IsConnectedToMailServer())
	{
		//-- trying to call mail api which will fail as it is not running
		this._lasterror = "The mail server is not running";			
		return false;
	}


	if(intShowEmptyDataParamTags==undefined)intShowEmptyDataParamTags=0;

	if(strFormID==undefined)strFormID = top._uniqueformid;

	this.xmlDOM = null;
	var strParams = "&_uniqueformid="+ strFormID + "&_xmlmcservice=" +strType+ "&_xmlmcmethod="+strName + "&_xmlcemptydatatags=" + intShowEmptyDataParamTags;

	//-- add any special wcparams that php can use for additional processing
	for(strParam in this._wcparams)
	{
		strParams += "&" + strParam + "=" + app.pfu(this._wcparams[strParam]);
	}

	//-- params
	for(strParam in this._params)
	{
		strParams += "&_xmlmcparam_" + strParam + "=" + app.pfu(this._params[strParam]);
	}

	//-- complex params
	for(strParam in this._complexparams)
	{
		strParams += "&_xmlmccomplexparam_" + strParam + "=" + app.pfu(this._complexparams[strParam]);
	}


	//-- data
	for(strParam in this._data)
	{
		strParams += "&_xmlmcdata_" + strParam + "=" + app.pfu(this._data[strParam]);
	}

	app.debugstart(strType +":"+strName,"XmlMethodCall.Invoke");
	var strURL = app.get_service_url("swclass/xmlmethodcall","");
	var strXML = app.get_http(strURL, strParams, true, false);
	app.debugend(strType +":"+strName,"XmlMethodCall.Invoke");
	this._lastresult = strXML;
	if(strXML==false || strXML.indexOf("ERROR:")==0)
	{
		if(strXML==false) strXML = "The xmlmc url could not be loaded. The webserver may be down.";
		return false;
	}
	else
	{
		this.xmlDOM = app.create_xml_dom(strXML);			
		try
		{
			var intChildPos = (this.xmlDOM.childNodes.length==1)?0:1; //-- ie / ff			
		}
		catch (e)
		{
			this.xmlDOM = null;
			var strCode = "-666";
			var strMsg = "The response xml from XmlMethodCall is invalid. Please contact your Administrator.";
			this._lasterror = strMsg;			
			return false;
		}

		var strFail = this.xmlDOM.childNodes[intChildPos].getAttribute("status");
		var bStatus = (strFail=="fail")?false:true;
		if(!bStatus)
		{		
			var strCode = app.xmlNodeTextByTag(this.xmlDOM.childNodes[intChildPos].childNodes[0],"code");
			var strMsg = app.xmlNodeTextByTag(this.xmlDOM.childNodes[intChildPos].childNodes[0],"error");
			this._lasterror = strMsg;			
		}
		else
		{
			//-- check if xmlmc caqll was for a call action - which may have vpme script that returns false and a message
			if(!this.CheckCallActionStatus())return false;
		}
		return bStatus;
	}
}

XmlMethodCall.prototype.CheckCallActionStatus= function()
{
	var intChildPos = (this.xmlDOM.childNodes.length==1)?0:1; //-- ie / ff			

	var casNode = app.xmlNodeByTag(this.xmlDOM.childNodes[intChildPos].childNodes[0],"callActionStatus");
	if(casNode)
	{
		var strResult = app.xmlNodeTextByTag(casNode,"success");
		if(strResult=="false")
		{
			this._lasterror = app.xmlNodeTextByTag(casNode,"message");
			return false;
		}
	}

	return true;
}

XmlMethodCall.prototype.Reset= function()
{
	this._params = new Array();
	this._wcparams = new Array();
	this._complexparams = new Array();
	this._lastresult = "";
	this._lasterror = "";
	this.xmlDOM = null;

}

XmlMethodCall.prototype.GetLastError= function()
{
	return this._lasterror;
}

XmlMethodCall.prototype.GetReturnXml= function()
{
	return this._lastresult;
}

XmlMethodCall.prototype.GetReturnValue= function(strName)
{
	var arrParams = this.xmlDOM.getElementsByTagName("params");
	if(arrParams.length)
	{
		var aParam = arrParams[0].getElementsByTagName(strName);
		if(aParam.length==0)
		{
			//-- check data tag
			arrParams = this.xmlDOM.getElementsByTagName("data");
			if(arrParams.length)
			{
				aParam = arrParams[0].getElementsByTagName(strName);
			}
		}
		return (aParam.length)?app.xmlText(aParam[0]):"";
	}
	else  
	{
		return "";
	}
}


XmlMethodCall.prototype.GetParamValue= function(strName)
{
	if(this.xmlDOM)
	{
		return this.GetReturnValue(strName);
	}

	return "";
}

XmlMethodCall.prototype.GetParam= function(strName)
{
	if(this.xmlDOM)
	{
		return this.GetReturnValue(strName);
	}

	return "";
}





//--
//-- wrapper for profile code selector - to mimic full client
function ChooseProfileCodeDialog(strTargetBinding)
{
	this.code=""; //-- a-b-c
	this.codeDescription=""; //-- alpha->beta->cappa
	this.description=""; //-- this is the info text
	this.sla=""; //-- prob profile use sla
	this.filter="";

	this.useoptions=true;
	this.execOperatorScript=false; //-- true / false run op script
	this.operatorScriptId = 0; //-- opscriot id to run
	this.useDescriptionText=true; //-- by default use description text to overwrite updatedb

	this.targetbinding = strTargetBinding; //-- web client only - record binding to put description into
	if(this.targetbinding==undefined)this.targetbinding = "updatedb.updatetxt";

	this.callbackdevfunction = null; //-- function specified by developer to call back to once code is selected
}
ChooseProfileCodeDialog.prototype.Open = function(bShowFixCodes, bEnableOptions, strInitialSelCode, strCodeFilter, fCallback , targetEle,fWin)
{
	//-- bShowFixCodes		Boolean Optional  Set to true to choose Resolution Profile code, false to choose Problem Profile code. 
 	//-- bEnableOptions		Boolean Optional  Set to true to enable the “Apply the SLA of this profile to the Log Call form” and “Transfer this default problem description to the Log Call form” checkboxes. 
	//-- strInitialSelCode	String	Optional  The initial code to set as the default-selected item when the dialog is opened. 
	//-- strCodeFilter		String  Optional  Any top level code filter by which to filter 
	var me = this;
	me.useoptions=bEnableOptions;

	if(fWin==undefined)
	{
		if(app._CURRENT_JS_WINDOW!=null)
		{
			fWin = app._CURRENT_JS_WINDOW;
			app._CURRENT_JS_WINDOW=null;
		}
		else
		{
			fWin = window;
		}	

	}

	var handleResultFunction  = null;
	if(fCallback)
	{
		handleResultFunction = function(oForm)
		{
			me.code = oForm.code;
			me.codeDescription = oForm.codeDescription;
			me.description = oForm.description;
			me.sla = oForm.sla;
			me.operatorScriptId = oForm.operatorScriptId;

			fCallback(oForm);
		};
	}
	
	var oForm = null;
	if(fCallback==undefined)fCallback=null;
	this.callbackdevfunction = fCallback
	if(bShowFixCodes)
	{
		app._profilecodeselector("fix",strCodeFilter, strInitialSelCode, handleResultFunction,targetEle,fWin);
	}
	else
	{
		if(bEnableOptions==false)
		{
			app._profilecodeselector("cdf",strCodeFilter, strInitialSelCode, handleResultFunction,targetEle,fWin);
		}
		else
		{
			app._profilecodeselector("lcf",strCodeFilter, strInitialSelCode, handleResultFunction,targetEle,fWin);
		}
	}

}

//-- eof profile code picker wrapper


//--
//--
//-- wrapper for analyst selector - to mimic full client
function AssignCallPropertySheet()
{
	return new PickAnalystDialog();
}

function PickAnalystDialog()
{
	this.groupid=""; 
	this.analystid=""; 
	this.tpcontract = "";
	this.repid="";
	this.analystname = "";
	this.groupname = "";

	this.callbackdevfunction = null; //-- function specified by developer to call back to once code is selected
}
PickAnalystDialog.prototype.Open = function(strTitle, bThirdParty, callback, openFromWindow)
{
	if(strTitle==undefined)strTitle = "Assign";
	
	//-- apps can call as Open(title,callback)
	if($.isFunction(bThirdParty))
	{
		callback = bThirdParty;
		bThirdParty=false;
	}
	else if(bThirdParty==undefined)bThirdParty=true;

	if(openFromWindow==undefined)
	{
		if(app._CURRENT_JS_WINDOW!=null)
		{
			openFromWindow = app._CURRENT_JS_WINDOW;
			app._CURRENT_JS_WINDOW=null;
		}
		else
		{
			openFromWindow = window;
		}
	}

	var me= this;
	app._analystpicker(strTitle, bThirdParty,function(retObject)
	{
		if(retObject==undefined)
		{
			if(callback)callback(me);
		}
		else
		{
			me.analystid = retObject.analystid;
			me.repid = retObject.analystid;
			me.tpcontract = retObject.thirdparty;
			me.groupid = retObject.groupid;
			me.analystname = retObject.analystname;
			me.groupname = retObject.groupname;
			if(callback)callback(retObject);
		}
			
	}, openFromWindow);
}

//-- in fullclient this uses local odbc conn - do we need to mimic - no one uses this do they??
function DatabaseConnection()
{
	this.sq = new SqlQuery();
	this.strDB = "swdata";
	alert("DatabaseConnection : The webclient does not support this method");
	return false;
}
DatabaseConnection.prototype.Connect = function(dbtype,strDB,strUser,strPass,strServer)
{
	this.strDB = strDB;
}
DatabaseConnection.prototype.Query = function(strSQL)
{
	return this.sq.Query(strSQL,this.strDB);
}
DatabaseConnection.prototype.Fetch = function ()
{
	return this.sq.Fetch();
}
DatabaseConnection.prototype.GetValueAsString = function (nCol)
{
	return this.sq.GetValueAsString(nCol);
}
DatabaseConnection.prototype.GetValueAsNumber = function (nCol)
{
	return this.sq.GetValueAsNumber(nCol);
}
DatabaseConnection.prototype.GetValueAsInteger = function (nCol)
{
	return this.sq.GetValueAsNumber(nCol);
}
//--

//-- wrapper for sqlquery class (http://wikisvr1/userwiki/index.php/ESP:JS_SqlQuery)
function _new_SqlQuery()
{
	return new SqlQuery();
}

function SqlQuery()
{
	this._lasterror = "";
	this._currentrow = -1;
	this._recordset = null;
	this._currentrecord = null
	this._rowcount=0;
	this._oI = null;
}

//-- given an xmlmc object take its return data and add to sqlquery
SqlQuery.prototype.injectXmlmcRsData = function(xmlmcObject)
{
	this._recordset = xmlmcObject.xmlDOM;
	if(typeof this._recordset=="object")
	{
		return true;
	}
	return false;

}

SqlQuery.prototype.HasRight = function(strSQL)
{
	//-- find table name and action
	strSQL = app.trim(strSQL.toLowerCase());
	var arrSQL = strSQL.split(" ");

	//-- determine action
	var strAction = arrSQL[0];

	var iCheckRight = 0;
	switch(strAction)
	{
		case "select":
			iCheckRight = _CAN_BROWSE_TABLEREC;
			break;
		case "update":
			iCheckRight = _CAN_UPDATE_TABLEREC;
			break;
		case "insert":
			iCheckRight = _CAN_ADDNEW_TABLEREC;
			break;
		case "delete":
			iCheckRight = _CAN_DELETE_TABLEREC;
			break;
	}

	var strTable = "";

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

	if(strTable == "")
	{
		alert("SqlQuery.prototype.HasRight: Could not find table name in the sql :-\n\n" + strSQL);
		return false;
	}

	//-- do have permision to view or browse record
	var arrTables = strTable.split(",");
	for(var x=0;x<arrTables.length;x++)
	{
		var res = app.session.CheckTableRight(arrTables[x],iCheckRight,true);
		if(res!="") 
		{
			alert(res);
			return false;
		
		}
	}

	return true;
}

//-- return sql object info
SqlQuery.prototype._getsqlinfo = function (strSQL)
{
	var sqlInfo = new Object();

	//-- find table name and action
	strSQL = app.trim(strSQL.toLowerCase());
	var arrSQL = strSQL.split(" ");

	//-- determine action
	var strAction = arrSQL[0];

	var strTable = "";
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

	sqlInfo.action = app.trim(strAction);
	sqlInfo.tables = app.trim(strTable);
	var iF = strSQL.indexOf("from");
	sqlInfo.columns = app.trim(strSQL.substring(0,iF));
	sqlInfo.columns = app.trim(app.string_replace(sqlInfo.columns,strAction,"",true));
	return sqlInfo;
}

//-- 2012.05.09 - new StoredQuery
SqlQuery.prototype.invokeStoredQuery = function (strQueryName, strParams, optBoolNoMessage)
{
	return this.StoredQuery(strQueryName, strParams)
}
SqlQuery.prototype.InvokeStoredQuery = function (strQueryName, strParams, optBoolNoMessage)
{
	return this.StoredQuery(strQueryName, strParams);
}
SqlQuery.prototype.StoredQuery = function (strQueryName, strParams, optBoolNoMessage)
{
	if(optBoolNoMessage==undefined)optBoolNoMessage=false;

	app.debugstart(strQueryName,"swjs.SqlQuery.CallStoredQuery");
	var res = false;

	//-- execute has been prefixed by function that called this one
	if(strQueryName.indexOf("execute/")!=0)strQueryName ="query/"+strQueryName;

	var strJson = app.CallStoredQuery(strQueryName,strParams,true);
	try
	{
		this._recordset = eval("("+strJson+")");
		res = this._recordset['@status'];

		this._rowcount=0;
		if(this._recordset.data && this._recordset.data.rowData && this._recordset.data.rowData.row)
		{
			var isArray = (this._recordset.data.rowData.row instanceof Array);
			if(!isArray)
			{
				//-- only one record so convert
				this._recordset.data.rowData.row = new Array(this._recordset.data.rowData.row);
			}
			this._rowcount=this._recordset.data.rowData.row.length;
		}

		if(res=="fail")res=false;
		if(!res && this._recordset!=null)
		{
			var strCode = this._recordset.state.code;
			var strMsg = this._recordset.state.error;
			this._lasterror = "(" +strCode +") "+strMsg;
			if(!optBoolNoMessage)alert(this._lasterror);
		}
	}
	catch (e)
	{
		this._recordset = null;
		this._lasterror = "(000) Failed to parse SqlQuery resultset. Please contact your Administrator.";
		alert(this._lasterror);
	}

	app.debugend(strQueryName,"swjs.SqlQuery.CallStoredQuery");
	return res;
}

//-- 2012.05.15 - call webclient specific script
SqlQuery.prototype.WebclientStoredQuery = function (strQueryName, strParams)
{
	app.debugstart(strQueryName,"swjs.SqlQuery.WebclientStoredQuery");
	var res = false;
	var strJson = app.CallWebclientStoredQuery(strQueryName,strParams,true);
	var res = false;
	try
	{
		this._recordset = eval("("+strJson+")");
		res = this._recordset['@status'];

		this._rowcount=0;
		if(this._recordset.data && this._recordset.data.rowData && this._recordset.data.rowData.row)
		{
			var isArray = (this._recordset.data.rowData.row instanceof Array);
			if(!isArray)
			{
				//-- only one record so convert
				this._recordset.data.rowData.row = new Array(this._recordset.data.rowData.row);
			}
			this._rowcount=this._recordset.data.rowData.row.length;
		}

		if(res=="fail")res=false;
		if(!res && this._recordset!=null)
		{
			var strCode = this._recordset.state.code;
			var strMsg = this._recordset.state.error;
			this._lasterror = "(" +strCode +") "+strMsg;
			alert(this._lasterror);
		}
	}
	catch (e)
	{
		this._recordset = null;
		this._lasterror = "(000) Failed to parse SqlQuery resultset. Please contact your Administrator.";
		alert(this._lasterror);
	}
	app.debugend(strQueryName,"swjs.SqlQuery.WebclientStoredQuery");
	return res;
}

//-- strDB = swdata or syscache
SqlQuery.prototype.Query = function (strSQL, strDB)
{
	if(strDB==undefined)strDB="swdata";
	if(strSQL==undefined || strSQL=="")
	{
		alert("SqlQuery.Query expects a strSQL parameter");
	}

	this._oI = this._getsqlinfo(strSQL);
	var strDelete = "";
	if(strSQL.toLowerCase().indexOf("delete") == 0) strDelete ="yes";

	//--
	//-- get service to form data records as xml
	app.debugstart(strSQL,"swjs.SqlQuery.Query");
	var strParams = "delete="+strDelete+"&execsql=" + app.pfu(strSQL)+ "&db="+strDB;
	var strURL = app.get_service_url("swclass/sqlquery","");
	var res = false;
	var strJson = app.get_http(strURL, strParams, true, false);
	try
	{
		this._recordset = eval("("+strJson+")");
		res = this._recordset['@status'];

		this._rowcount=0;
		if(this._recordset.data && this._recordset.data.rowData && this._recordset.data.rowData.row)
		{
			var isArray = (this._recordset.data.rowData.row instanceof Array);
			if(!isArray)
			{
				//-- only one record so convert
				this._recordset.data.rowData.row = new Array(this._recordset.data.rowData.row);
			}
			this._rowcount=this._recordset.data.rowData.row.length;
		}

		if(!res && this._recordset!=null)
		{
			var strCode = this._recordset.state.code;
			var strMsg = this._recordset.state.error;
			this._lasterror = "(" +strCode +") "+strMsg;
			alert(this._lasterror);
		}
	}
	catch (e)
	{
		this._recordset = null;
		this._lasterror = "(000) Failed to parse SqlQuery resultset. Please contact your Administrator.";
		alert(this._lasterror);
	}
	app.debugend(strSQL,"swjs.SqlQuery.Query");
	return res;
}
SqlQuery.prototype.query = SqlQuery.prototype.Query;

//-- move to next row of data
SqlQuery.prototype.fetch = function ()
{
	return this.Fetch();
}
SqlQuery.prototype.Fetch = function ()
{
	if(this._recordset==null)return false;
	if(this._rowcount==0)return false;
	if(this._recordset.params && this._recordset.params.rowsEffected==0) return false;

	//- -do we have row/s
	if(this._recordset.data && this._recordset.data.rowData && this._recordset.data.rowData.row)
	{
		this._currentrow++;	
		this._currentrecord = this._recordset.data.rowData.row[this._currentrow];
		if(this._currentrecord==undefined)
		{
			this._currentrecord=null;
			return false;
		}
		else
		{
			return true;
		}
	}
	else
	{
		this._currentrecord=null;
		return false;
	}
}

//-- get given col as a number
SqlQuery.prototype.GetValueAsNumber = function (intColIndex, boolDisplay)
{
	if(this._currentrecord==null) return false;
	if(boolDisplay==undefined)boolDisplay=false;

	//-- so user can specify col name instead of position
	var strColName = "";
	var colObject = undefined;
	var testNum= new Number(intColIndex);
	if(isNaN(testNum))
	{
		//-- get column by name
		strColName = intColIndex.toLowerCase();
		colObject = this._recordset.data.metaData[strColName];
	}
	else
	{
		//-- get by position so have work out name
		var pos=0;
		for(var strColName in this._recordset.data.metaData)
		{
			colObject = this._recordset.data.metaData[strColName];
			if(pos==intColIndex)break;
			pos++;
		}
	}

	if(colObject==undefined)return false;
	var dataColumn = this._currentrecord[strColName];
	if(dataColumn)
	{
		var strValue = (dataColumn['@raw']!=undefined)?dataColumn['@raw']:dataColumn;
		var strDisplay = (dataColumn['#text']!=undefined)?dataColumn['#text']:dataColumn;
		var val = (boolDisplay)?strDisplay:strValue;

		//-- 03.03.2012 - 87578 - if empty return "" instead of 0
		if(val=="")return "";
		var num = new Number(val);
		num++;num--;	
		return num;
	}
	return "";
}

//-- get given col as text
SqlQuery.prototype.GetValueAsString = function (intColIndex, boolDisplay)
{
	if(this._currentrecord==null) return false;
	if(boolDisplay==undefined)boolDisplay=false;

	//-- so user can specify col name instead of position
	var strColName = "";
	var colObject = undefined;
	var testNum= new Number(intColIndex);
	if(isNaN(testNum))
	{
		//-- get column by name
		strColName = intColIndex.toLowerCase();
		colObject = this._recordset.data.metaData[strColName];
	}
	else
	{
		//-- get by position so have work out name
		var pos=0;
		for(var strColName in this._recordset.data.metaData)
		{
			colObject = this._recordset.data.metaData[strColName];
			if(pos==intColIndex)break;
			pos++;
		}
	}

	if(colObject==undefined)return false;
	var dataColumn = this._currentrecord[strColName];
	if(dataColumn)
	{
		var strValue = (dataColumn['@raw']!=undefined)?dataColumn['@raw']:dataColumn;
		var strDisplay = (dataColumn['#text']!=undefined)?dataColumn['#text']:dataColumn;
		return (boolDisplay)?strDisplay:strValue;
	}
	return "";
}

//--return col index for given name
SqlQuery.prototype.GetColumnIndex = function(strColName)
{
	if(this._recordset.data==undefined || this._recordset.data.metaData==undefined) return -1;

	var colObject = undefined;
	var pos=-1;
	for(var strCurrentColName in this._recordset.data.metaData)
	{
		pos++;
		if(strCurrentColName.toLowerCase()==strColName.toLowerCase())break;
	}
	return pos;
}

//--return col name at given position
SqlQuery.prototype.GetColumnName = function(intColIndex)
{
	if(this._recordset.data==undefined || this._recordset.data.metaData==undefined) return "";

	var colObject = undefined;
	var pos=0;
	for(var strCurrentColName in this._recordset.data.metaData)
	{
		if(pos==intColIndex)return strCurrentColName;
		pos++;
	}
	return "";
}

//--return # of cols
SqlQuery.prototype.GetColumnCount = function()
{
	if(this._recordset.data==undefined || this._recordset.data.metaData==undefined) return 0;
	var pos=0;
	for(var strCurrentColName in this._recordset.data.metaData)
	{
		pos++;
	}
	return pos;
}

//--return # of rows
SqlQuery.prototype.GetRowCount = function()
{
	return this._rowcount;
}


//--return t/f is given col is numeric or not
SqlQuery.prototype.IsColNumeric = function(intColIndex)
{
	if(this._recordset.data==undefined || this._recordset.data.metaData==undefined) return false;

	var strColName = this.GetColumnName(intColIndex);
	if(this._recordset.data.metaData[strColName])
	{
		var dataType = this._recordset.data.metaData[strColName].dataType;
		return (dataType!="string" && dataType!="varchar" && dataType!="text" && dataType!="char" && dataType!="longvarchar");
	}

	return false;
}

//--clear result set
SqlQuery.prototype.Reset = function()
{
	this._lasterror = "";
	this._currentrow = -1;
	this._recordset = null;
	this._currentrecord = null
	this._rowcount=0;
	this._oI = null;
	return true;
}

SqlQuery.prototype.GetLastError = function()
{
	return this._lasterror;
}

//-- wrapper for SqlRecord class (http://wikisvr1/userwiki/index.php/ESP:JS_SqlRecord)
function _new_SqlRecord()
{
	return new SqlRecord();
}
function SqlRecord()
{
	this._sqlquery = null;
	this._origvalues = new Array();
	this._modifiedfields = new Array();
	this._rowcount=0;
}

SqlRecord.prototype.GetCount = function ()
{
	return this._rowcount;
}

//-- 2012.05.10 - new StoredQuery Method
SqlRecord.prototype.invokeStoredQuery = function (strQueryName, strParams)
{
	return this.StoredQuery(strQueryName, strParams);
}
SqlRecord.prototype.StoredQuery = function (strQueryName, strParams)
{
	this._sqlquery = new SqlQuery();
	if(!this._sqlquery.StoredQuery("record/" + strQueryName,strParams)) return 0;

	if(!this._sqlquery.Fetch()) return 0;

	//-- set values
	for(var strColName in this._sqlquery._currentrecord)
	{
		var strColValue = this._sqlquery.GetValueAsString(strColName);
		var isNum = dd.tables[strTable.toLowerCase()].columns[strColName].IsNumeric();
		if(isNum){strColValue--;strColValue++;}

		this[strColName] = strColValue;
		this._origvalues[strColName] = strColValue;
	}
	this._rowcount = this._sqlquery.GetRowCount();
	return 1;
}


//-- GetRecord(String strTable, String strPrimaryKeyValue) Number
SqlRecord.prototype.GetRecord = function (strTable, strPrimaryKeyValue)
{
	this._rowcount = 0;

	//-- make sure table exists
	if(dd.tables[strTable.toLowerCase()]==undefined)
	{
		alert("The specified table ["+strTable+"] was not found in the dd tables. Please contact your administrator");
		return -1;
	}

	//-- get table pk
	var strPrimaryCol = dd.tables[strTable.toLowerCase()].PrimaryKey;
	if(strPrimaryCol==undefined)
	{
		alert("The specified table does not have a primary key. Please contact your administrator");
		return -1;
	}

	var strParams = "dsn=swdata&table=" + strTable + "&keycol=" + strPrimaryCol + "&keyvalue=" + strPrimaryKeyValue; 
	this._sqlquery = new SqlQuery();
	if(!this._sqlquery.WebclientStoredQuery("data/getRecord",strParams)) return 0;

	if(!this._sqlquery.Fetch()) return 0;

	//-- set values
	for(var strColName in this._sqlquery._currentrecord)
	{
		var strColValue = this._sqlquery.GetValueAsString(strColName);
		var isNum = dd.tables[strTable.toLowerCase()].columns[strColName].IsNumeric();
		if(isNum){strColValue--;strColValue++;}

		this[strColName] = strColValue;
		this._origvalues[strColName] = strColValue;
	}
	this._rowcount = 1;
	return 1;
}



SqlRecord.prototype.GetRecordWhere = function (strTable, strWhere)
{
	this._rowcount = 0;
	//-- make sure table exists
	if(dd.tables[strTable.toLowerCase()]==undefined)
	{
		alert("The specified table ["+strTable+"] was not found in the dd tables. Please contact your administrator");
		return -1;
	}

	var strParams = "dan=swdata&table=" + strTable + "&filter=" + strWhere; 
	this._sqlquery = new SqlQuery();
	if(!this._sqlquery.WebclientStoredQuery("data/getRecordWhere",strParams)) return 0;

	if(!this._sqlquery.Fetch()) return 0;

	//-- set values
	for(var strColName in this._sqlquery._currentrecord)
	{
		var strColValue = this._sqlquery.GetValueAsString(strColName);
		var isNum = dd.tables[strTable.toLowerCase()].columns[strColName].IsNumeric();
		if(isNum){strColValue--;strColValue++;}

		this[strColName] = strColValue;
		this._origvalues[strColName] = strColValue;
	}
	this._rowcount = this._sqlquery.GetRowCount();
	return 1;
}


//-- GetCacheRecord(String strTable, String strPrimaryKeyValue) Number
SqlRecord.prototype.GetCacheRecord = function (strTable, strPrimaryKeyValue)
{
	//-- get table pk
	var strPrimaryCol = dd.tables[strTable.toLowerCase()].PrimaryKey;
	if(strPrimaryCol==undefined)
	{
		alert("The specified table does not have a primary key. Please contact your administrator");
		return -1;
	}

	var strParams = "dsn=syscache&table=" + strTable + "&keycol=" + strPrimaryCol + "&keyvalue=" + strPrimaryKeyValue; 
	this._sqlquery = new SqlQuery();
	if(!this._sqlquery.WebclientStoredQuery("data/getRecord",strParams)) return 0;

	if(!this._sqlquery.Fetch()) return 0;

	//-- set values
	for(var strColName in this._sqlquery._currentrecord)
	{
		var strColValue = this._sqlquery.GetValueAsString(strColName);
		var isNum = dd.tables[strTable.toLowerCase()].columns[strColName].IsNumeric();
		if(isNum){strColValue--;strColValue++;}

		this[strColName] = strColValue;
		this._origvalues[strColName] = strColValue;
	}

	return 1;
}


SqlRecord.prototype.GetCacheRecordWhere = function (strTable, strWhere)
{

	var strParams = "dan=syscache&table=" + strTable + "&filter=" + strWhere; 
	this._sqlquery = new SqlQuery();
	if(!this._sqlquery.WebclientStoredQuery("data/getRecordWhere",strParams)) return 0;

	if(!this._sqlquery.Fetch()) return 0;

	//-- set values
	for(var strColName in this._sqlquery._currentrecord)
	{
		var strColValue = this._sqlquery.GetValueAsString(strColName);
		var isNum = dd.tables[strTable.toLowerCase()].columns[strColName].IsNumeric();
		if(isNum){strColValue--;strColValue++;}

		this[strColName] = strColValue;
		this._origvalues[strColName] = strColValue;
	}
	return 1;
}

SqlRecord.prototype.GetColumnCount = function ()
{
	return this._sqlquery.GetColumnCount();
}

SqlRecord.prototype.GetValue = function (nColIndex)
{
	return this._sqlquery.GetValueAsString(nColIndex);
}

SqlRecord.prototype.GetColumnName = function (nColIndex)
{
	return this._sqlquery.GetColumnName(nColIndex);
}

SqlRecord.prototype.IsModified = function (nColIndex)
{
	var strColName = this.GetColumnName(nColIndex);
	if(strColName.indexOf(".")!=-1)strColName = strColName.split(".")[1];

	if(this[strColName] != this._origvalues[strColName]) return true;

	//-- check if user manually set modified flag
	if(this._modifiedfields[strColName]!=undefined)	return this._modifiedfields[strColName];

	return false;
}

SqlRecord.prototype.SetFieldModifiedFlag = function (nColIndex, bModified)
{
	if(bModified==undefined)bModified=true;

	var strColName = this.GetColumnName(nColIndex);
	if(strColName.indexOf(".")!=-1)strColName = strColName.split(".")[1];

	this._modifiedfields[strColName] = bModified;
}


//-- popupform
function PopupForm()
{
	this.document = null;
	this._swdoc = null;
}
PopupForm.prototype.Open = function(strFormName,varRecordKey,strParams,fCallBack,fWin)
{
	var strMode=(varRecordKey!="")?"edit":"add";
	var me = this;
	var useWin = (app._CURRENT_JS_WINDOW!=null)?app._CURRENT_JS_WINDOW:window;
	app._open_application_form(strFormName, "stf", varRecordKey, strParams,true, strMode, function(res)
	{
		//-- if it is null mean most likely been blocked by popup 
		var ret = {document:null,_swdoc:null};
		if(res!=null)
		{
			ret.document = res._swdoc;
			ret._swdoc = res._swdoc;
		}
		
		if(fCallBack)
		{
			fCallBack(ret);
		}
	},null,useWin);
}



//-- 04.01.2010
//-- Helpdesk wrapper
function HelpdeskSession(strUniqueID)
{
	if(strUniqueID==undefined)strUniqueID=top._uniqueformid;

	this._uniqueformid = strUniqueID;
	
	//-- comma sep callrefs, issueref to do action against
	this.strCallrefs = "";
	this.strIssuerefs = "";

	//-- the command to execute
	this.command = "";

	//-- return state vars
	this.resultstring = "";
	this.lasterrorstring = "";
	this.boolresult = true;

	//-- store all values in xmlmc array as well as type specific ones - so we can use xmlmc to do work instead of 5005 api
	this._bUseXmlmc = false;
	this._xmlmcMethod = "";
	this._xmlmcMethodReturnType = "callaction"; //--callaction, calllog, issueaction, taskaction - determines how we build ret string for 5005 class from xmlmc return object
	this._xmlmc_values = new Array();
	this._xmlmc_param_mappings = new Array();

	this._actionverb = "";

	//-- store value types to send
	this.array_boolvalues = new Array();
	this.array_strvalues = new Array();
	this.array_numvalues = new Array();
	this.array_txtvalues = new Array();
	this.array_values = new Array();
	this.array_datevalues = new Array();
	this.resultarray = new Array();
	this.array_ext_values = new Array();
	this.array_files = new Array();
}

HelpdeskSession.prototype.AcceptCall = function(nCallRef, nBackdatePeriod, bRespond)
{
	nCallRef+=""; // cast

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	if(nBackdatePeriod>1)
	{
		var intCurrentTime = app.global.GetCurrentEpocTime(); //-- get os epoch time
		var backDateEpoch = intCurrentTime - nBackdatePeriod;
		var strDateTime = _epoch_to_timestamp(backDateEpoch,true); //-- convert to utc timestamp
		xmlmc.SetValue("timeOfAction",strDateTime);
	}
	xmlmc.SetValue("markAsSLAResponse",bRespond);
	return xmlmc.Invoke("helpdesk","acceptCalls");

}

HelpdeskSession.prototype.AddCallToIssue = function (nIssueRef,nCallRef)
{
	nCallRef+=""; // cast
	nIssueRef+="";

	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("issueRef",nIssueRef);
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	return xmlmc.Invoke("helpdesk","addCallsToIssue");
}

HelpdeskSession.prototype.AssignCall = function (nCallRef, strGroup, strAnalyst, strTPContract)
{
	nCallRef+=""; // cast

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	xmlmc.SetValue("groupId",strGroup);
	if(strAnalyst!=undefined)xmlmc.SetValue("analystId",strAnalyst);
	if(strTPContract!=undefined)xmlmc.SetValue("tpmContract",strTPContract);
	return xmlmc.Invoke("helpdesk","assignCalls");

}

HelpdeskSession.prototype.AssignToCall = function (nCallRef, strAssign)
{
	//-- strAssign can be #groupid:analystid:tpcontract	
	strAssign = app.string_replace(strAssign, "#","",false); 
	var arrAssign = strAssign.split(":");
	return this.AssignCall(nCallRef,arrAssign[0],arrAssign[1],arrAssign[2]);
}


//-- ?? what do we do with this
HelpdeskSession.prototype.BeginAttachMessageToCall = function ()
{
	alert("HelpdeskSession.BeginAttachMessageToCall is not supported");
	return false;

	this.command = "ATTACH MESSAGE TO CALL";
	return true;
}

HelpdeskSession.prototype.BeginCallValueUpdates = function (nCallRef, strUpdateVerb)
{
	this._bUseXmlmc = true; //-- we can handle this in xmlmc
	this._xmlmcMethod = "updateCallValues";
	
	//-- put in order the xmlmc params and the helpdesksession equivelant
	this._xmlmc_param_mappings = new Array();
	this._xmlmc_param_mappings["callref"] = nCallRef;
	this._xmlmc_param_mappings["actionVerb"] = strUpdateVerb;
	this._xmlmc_param_mappings["updateMessage"] = "updatedb.updatetxt";
	this._xmlmc_param_mappings["additionalCallValues"] = this._generate_xmlmc_additionalcallvalues;
	
	this.strCallrefs = nCallRef;
	this.command = "UPDATE CALL VALUES " + nCallRef;
	return true;
}

HelpdeskSession.prototype.BeginCancelCall = function (nCallRef)
{
	//--
	//-- WE WILL USE XMLMC TO DO THIS 5005 api action
	this._bUseXmlmc = true; //-- we can handle this in xmlmc
	this._xmlmcMethod = "cancelCalls";

	//-- put in order the xmlmc params and the helpdesksession equivelant
	this._xmlmc_param_mappings = new Array();
	this._xmlmc_param_mappings["callRef"] = nCallRef;
	this._xmlmc_param_mappings["description"] = "updatedb.updatetxt";
	this._xmlmc_param_mappings["publicUpdate"] = "publicupdate";
	//-- EOF INIT XMLMC MAPPINGS

	this.strCallrefs = nCallRef;
	this.command = "CANCEL CALL " + nCallRef;
	return true;
}

HelpdeskSession.prototype.BeginCloseCall = function (nCallRef)
{
	this._bUseXmlmc = true; //-- we can handle this in xmlmc
	this._xmlmcMethod = "closeCalls";
	
	//-- put in order the xmlmc params and the helpdesksession equivelant
	this._xmlmc_param_mappings = new Array();
	this._xmlmc_param_mappings["callref"] = nCallRef;
	this._xmlmc_param_mappings["timeSpent"] = "timespent";
	this._xmlmc_param_mappings["description"] = "updatedb.updatetxt";

	this._xmlmc_param_mappings["fixCode"] = "fixcode";
	this._xmlmc_param_mappings["isChargeable:checkclosecallstatus"] = "status"; //-- if status is 6 will need to change method to resolveCalls if 16 set to false if 18 set to true

	this._xmlmc_param_mappings["timeOfAction:backdatetodatetime"] = "backdateperiod"; //-- backdateperiod is epoch so for xmlmc need to convert
	this._xmlmc_param_mappings["publicUpdate"] = "publicupdate";
	this._xmlmc_param_mappings["updateSource"] = "updatedb.udsource";
	this._xmlmc_param_mappings["updateCode"] = "updatedb.udcode";
	this._xmlmc_param_mappings["delayCacheFlush"] = "delaycacheflush";

	this._xmlmc_param_mappings["fileAttachment"] = "_generate_xmlmc_fileattachment";
	this._xmlmc_param_mappings["extraUpdateDbValues"] = "_generate_xmlmc_updatedbvalues";
	

	this.strCallrefs = nCallRef;
	this.command = "CLOSE CALL " + nCallRef;
	
	return false;
}

HelpdeskSession.prototype.BeginCloseIssue = function (strIssueRef)
{
	alert("HelpdeskSession.BeginCloseIssue is not supported");
	return false;


	this.command = "CLOSE ISSUE " + strIssueRef;
	return true;
}

HelpdeskSession.prototype.BeginCompleteTask = function ()
{
	alert("HelpdeskSession.BeginCompleteTask is not supported");
	return false;

	
	this.command = "COMPLETE TASK";
	return true;
}

HelpdeskSession.prototype.UpdateTask = function ()
{
	alert("HelpdeskSession.UpdateTask is not supported");
	return false;

	this.command = "UPDATE TASK";
	return true;
}

HelpdeskSession.prototype.DeleteTask = function (nCallRef, nTaskID)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("callref",nCallRef);
	xmlmc.SetValue("workItemId",nTaskID);
	return xmlmc.Invoke("helpdesk","deleteCallWorkItems");
}


HelpdeskSession.prototype.BeginCreateIssue = function ()
{
	alert("HelpdeskSession.BeginCreateIssue is not supported");
	return false;

	this.command = "CREATE ISSUE";
	return true;
}

HelpdeskSession.prototype.BeginHoldCall = function (nCallRef)
{
	this._bUseXmlmc = true; //-- we can handle this in xmlmc
	this._xmlmcMethod = "holdCalls";
	
	//-- put in order the xmlmc params and the helpdesksession equivelant
	this._xmlmc_param_mappings = new Array();
	this._xmlmc_param_mappings["callref"] = nCallRef;
	this._xmlmc_param_mappings["timeSpent"] = "timespent";
	this._xmlmc_param_mappings["description"] = "updatedb.updatetxt";
	this._xmlmc_param_mappings["holdUntil:epochtodatetime"] = "holduntil"; 
	this._xmlmc_param_mappings["publicUpdate"] = "publicupdate";
	this._xmlmc_param_mappings["updateSource"] = "updatedb.udsource";
	this._xmlmc_param_mappings["updateCode"] = "updatedb.udcode";
	this._xmlmc_param_mappings["fileAttachment"] = "_generate_xmlmc_fileattachment";
	this._xmlmc_param_mappings["extraUpdateDbValues"] = "_generate_xmlmc_updatedbvalues";
	
	
	this.strCallrefs = nCallRef;
	this.command = "HOLD CALL " + nCallRef;
	return true;
}


HelpdeskSession.prototype.BeginLogCall = function ()
{
	alert("HelpdeskSession.BeginLogCall is not supported");
	return false;

	this.command = "LOG CALL";
	return true;
}

HelpdeskSession.prototype.BeginUpdateCall = function (nCallRef)
{
	this.ResetValues();
	
	this._bUseXmlmc = true; //-- we can handle this in xmlmc
	this._xmlmcMethod = "updateCalls";
	
	//-- put in order the xmlmc params and the helpdesksession equivelant
	this._xmlmc_param_mappings = new Array();
	this._xmlmc_param_mappings["callref"] = nCallRef;
	this._xmlmc_param_mappings["timeSpent"] = "timespent";
	this._xmlmc_param_mappings["description"] = "updatedb.updatetxt";
	this._xmlmc_param_mappings["publicUpdate"] = "publicupdate";
	this._xmlmc_param_mappings["timeOfAction:backdatetodatetime"] = "backdateperiod"; //-- backdateperiod is epoch so for xmlmc need to convert
	this._xmlmc_param_mappings["updateSource"] = "updatedb.udsource";
	this._xmlmc_param_mappings["updateCode"] = "updatedb.udcode";
	this._xmlmc_param_mappings["markAsSLAResponse"] = "markslaresponse";
	this._xmlmc_param_mappings["priority"] = "priority";
	this._xmlmc_param_mappings["targetFixTime:epochtodatetime"] = "_targetfixtime"; //-- _targetfixtime is epoch so for xmlmc need to convert
	this._xmlmc_param_mappings["fileAttachment"] = "_generate_xmlmc_fileattachment";
	this._xmlmc_param_mappings["extraUpdateDbValues"] = "_generate_xmlmc_updatedbvalues";
	
	
	this.strCallrefs = nCallRef;
	this.command = "UPDATE CALL " + nCallRef;
	return true;
}

HelpdeskSession.prototype.BeginUpdateIssue = function (nIssueRef)
{
	this.ResetValues();

	alert("HelpdeskSession.BeginUpdateIssue is not supported");
	return false;

	this.command = "UPDATE ISSUE " + nIssueRef;
	return true;
}

HelpdeskSession.prototype.SetProfileCode = function (nCallRef,strCode)
{

	nCallRef+=""; // cast

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	xmlmc.SetValue("code",strCode);
	var res = xmlmc.Invoke("helpdesk","changeCallProblemProfile");
	if(res==false)
	{
		alert(xmlmc.GetLastError());
	}
	return res;
}


HelpdeskSession.prototype.CancelCall = function (nCallRef, strReason, bPublicUpdate)
{
	nCallRef+=""; // cast

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	xmlmc.SetValue("description",strReason);
	xmlmc.SetValue("publicUpdate",bPublicUpdate);
	return xmlmc.Invoke("helpdesk","cancelCalls");

}


HelpdeskSession.prototype.ReactivateCall = function (nCallRef , bRestoreWorkflow)
{
	nCallRef +="";
	if(bRestoreWorkflow==undefined)bRestoreWorkflow=true;

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	xmlmc.SetValue("restoreWorkflow",bRestoreWorkflow);
	return xmlmc.Invoke("helpdesk","reactivateCalls");

}


HelpdeskSession.prototype.ChangeCallClass = function (nCallRef, strClass)
{
	nCallRef+=""; // cast

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	xmlmc.SetValue("class",strClass);
	var res = xmlmc.Invoke("helpdesk","changeCallClass");
	if(res==false)
	{
		alert(xmlmc.GetLastError());
	}
	return res;
}

HelpdeskSession.prototype.ChangeCallCondition = function (nCallRef, intCallCondition)
{
	nCallRef+=""; // cast

	var xmlmc = new XmlMethodCall();
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	xmlmc.SetValue("condition",intCallCondition);
	return xmlmc.Invoke("helpdesk","changeCallCondition");

}

HelpdeskSession.prototype.AddCustomerToIssue = function (nIssueRef,strTable,strCustID)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("issueRef",nIssueRef);
	xmlmc.SetValue("keyValue",strCustID);
	return xmlmc.Invoke("helpdesk","addCustomerToIssue");
}

HelpdeskSession.prototype.RemoveCallFromIssue = function (nIssueRef,nCallRef)
{

	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("issueRef",nIssueRef);

	nCallRef +=""; //- cast
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	return xmlmc.Invoke("helpdesk","removeCallsFromIssue");
}

HelpdeskSession.prototype.SendCustomerSurvey = function (nSurveyID, sCallRefs)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("surveyId",nSurveyID);

	sCallRefs+="";//--cast
	var arrCallrefs = sCallRefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetValue("callref",arrCallrefs[x]);
	}
	return xmlmc.Invoke("survey","sendCustomerCallSurvey");
}

HelpdeskSession.prototype.RemoveCallFromIssueStr = function (strIssueRef, sCallRefs)
{
	return this.RemoveCallFromIssue(sCallRefs, strIssueRef)
}

HelpdeskSession.prototype.TakeCallOffHold = function (nCallRef)
{
	//-- use new api - 14.09.2010
	var xmlmc = new XmlMethodCall();
	nCallRef +="";
	var arrCallrefs = nCallRef.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetParam('callref',arrCallrefs[x]);
	}

	if(!xmlmc.Invoke("helpdesk", "takeCallsOffHold"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}

HelpdeskSession.prototype.DeleteCallAttachment = function (nCallRef, nAttachID)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref",nCallRef);
	xmlmc.SetParam("attachId",nAttachID);
	if(!xmlmc.Invoke("helpdesk", "deleteAttachmentFromCall"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}

HelpdeskSession.prototype.UnwatchCall = function (strCallRefs, strAnalystId)
{
	//-- use new api - 14.0.9.2010
	strCallRefs +=""; //-- cast callref
	var xmlmc = new XmlMethodCall();
	var arrCallrefs = strCallRefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetParam('callref',arrCallrefs[x]);
	}

	if(!xmlmc.Invoke("helpdesk", "unwatchCalls"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}

HelpdeskSession.prototype.WatchCall = function(strCallRefs, strAnalystId)
{
	//-- use new api - 14.0.9.2010
	strCallRefs +=""; //-- cast callref
	var xmlmc = new XmlMethodCall();
	var arrCallrefs = strCallRefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetParam('callref',arrCallrefs[x]);
	}

	if(!xmlmc.Invoke("helpdesk", "watchCalls"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}

//--
//-- wc specific helpdesk functions
HelpdeskSession.prototype.markWatchedCallsUnread = function (strCallRefs, strAnalystId)
{
	//-- use new api - 14.0.9.2010
	strCallRefs +=""; //-- cast callref
	var xmlmc = new XmlMethodCall();
	var arrCallrefs = strCallRefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetParam('callref',arrCallrefs[x]);
	}

	if(!xmlmc.Invoke("helpdesk", "markWatchedCallsUnread"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}

HelpdeskSession.prototype.setWatchOptions = function (strCallRefs, intOptions,strAnalystId)
{
	//-- use new api - 14.0.9.2010
	strCallRefs +=""; //-- cast callref
	var xmlmc = new XmlMethodCall();
	var arrCallrefs = strCallRefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetParam('callref',arrCallrefs[x]);
	}
	xmlmc.SetParam('options',intOptions); //1=messenger ; 2=unwatch when closed and 3 = both
	if(!xmlmc.Invoke("helpdesk", "setWatchOptions"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}

HelpdeskSession.prototype.removeWatchOptions = function (strCallRefs, intOptions,strAnalystId)
{
	//-- use new api - 14.0.9.2010
	strCallRefs +=""; //-- cast callref
	var xmlmc = new XmlMethodCall();
	var arrCallrefs = strCallRefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		xmlmc.SetParam('callref',arrCallrefs[x]);
	}
	xmlmc.SetParam('options',intOptions); //1=messenger ; 2=unwatch when closed and 3 = both
	if(!xmlmc.Invoke("helpdesk", "removeWatchOptions"))
	{
		alert(xmlmc.GetLastError());
		return false;
	}
	return true;
}



//--
//-- clear down object data
HelpdeskSession.prototype.Close = function ()
{
	this.strCallrefs = "";
	this.strIssuerefs = "";

	//-- the command to execute
	this.command = "";

	//-- return state vars
	this.resultstring = "";
	this.lasterrorstring = "";
	this.boolresult = true;

	this._xmlmc_values = new Array();
	this._xmlmcMethod = "";
	this._bUseXmlmc = false;

	//-- store value types to send
	this.resultarray = new Array();
	this.array_strvalues = new Array();
	this.array_numvalues = new Array();
	this.array_txtvalues = new Array();
	this.array_values = new Array();
	this.array_ext_values = new Array();
	this.array_datevalues = new Array();
	this.array_files = new Array();
	this.array_xmlmc_files = new Array();

	
	this._actionverb = "";

	
	return true;
}


HelpdeskSession.prototype._generate_xmlmc_fileattachment=function(strParam,xmlmc)
{
	for(strFileName in this.array_xmlmc_files)
	{
		var strFileAtts = "<embeddedFileAttachment><fileName>" + app.pfx(strFileName) + "</fileName></embeddedFileAttachment>";
		xmlmc.SetParamAsComplexType("fileAttachment", strFileAtts);
	}
}

HelpdeskSession.prototype._generate_xmlmc_issueadditionalvalues=function(strParam,xmlmc)
{
	var strUpdateIssueValues = "";
	for(strParam in this._xmlmc_values)
	{
		if(strParam.indexOf("swissues.")==0)
		{
			var arrParam = strParam.split(".");
			strUpdateIssueValues += "<"+arrParam[1]+">"+app.pfx(this._xmlmc_values[strParam])+"</"+arrParam[1]+">"
		}
	}
	if(strUpdateIssueValues!="")
	{
		xmlmc.SetParamAsComplexType("additionalValues",strUpdateIssueValues);
	}
}


HelpdeskSession.prototype._generate_xmlmc_updatedbvalues=function(strParam,xmlmc)
{
	var strUpdateDbValues = "";
	for(strParam in this._xmlmc_values)
	{
		if(strParam.indexOf("updatedb.")==0)
		{
			var arrParam = strParam.split(".");
			strUpdateDbValues += "<"+arrParam[1]+">"+app.pfx(this._xmlmc_values[strParam])+"</"+arrParam[1]+">"
		}
	}
	if(strUpdateDbValues!="")
	{
		xmlmc.SetParamAsComplexType("extraUpdateDbValues",strUpdateDbValues);
	}
}

HelpdeskSession.prototype._generate_xmlmc_additionalcallvalues=function(strParam,xmlmc)
{
	var strOpencallValues = "";
	for(strParam in this._xmlmc_values)
	{
		if(strParam.indexOf("opencall.")==0)
		{
			var arrParam = strParam.split(".");
			strOpencallValues += "<"+arrParam[1]+">"+app.pfx(this._xmlmc_values[strParam])+"</"+arrParam[1]+">"
		}
	}
	if(strOpencallValues!="")
	{
		xmlmc.SetParamAsComplexType("additionalCallValues",strOpencallValues);
	}

}


//--
//-- use xmlmc to perform helpdesk action rather than 5005
HelpdeskSession.prototype._CommitToXmlmc = function (strActionVerb)
{
	if(strActionVerb==undefined || strActionVerb=="" ) strActionVerb = this._actionverb;
	if(!this._bUseXmlmc) return this.Commit(strActionVerb);

	//--
	//-- get values for xmlmc params
	var xmlmc = new XmlMethodCall();

	//-- process any specific params in order
	for(strParam in this._xmlmc_param_mappings)
	{
		var strHelpdeskSessionParamName = this._xmlmc_param_mappings[strParam];

		//-- check if has a formatter
		
		if(strParam.indexOf(":")>-1 && this._xmlmc_values[strHelpdeskSessionParamName] != undefined)
		{
			var formatterInfo = strParam.split(":");
			var formatter = formatterInfo[1];
			strParam = formatterInfo[0];
			switch(formatter)
			{
				case "epochtodatetime":
					if(this._xmlmc_values[strHelpdeskSessionParamName]>0)
					{
						var UTCDATE = app._date_from_epoch(this._xmlmc_values[strHelpdeskSessionParamName]);
						var strDateTime = app._formatDate(UTCDATE,"yyyy-MM-dd HH:mm:ss");
						this._xmlmc_values[strHelpdeskSessionParamName] = strDateTime;
					}
					break;
				case "backdatetodatetime":
					if(this._xmlmc_values[strHelpdeskSessionParamName]>60)
					{
						var intCurrentTime = app.global.GetCurrentEpocTime(); //-- get os epoch time
						var backDateEpoch = intCurrentTime - this._xmlmc_values[strHelpdeskSessionParamName];
						var strDateTime = _epoch_to_timestamp(backDateEpoch,true); //-- convert to utc timestamp
						this._xmlmc_values[strHelpdeskSessionParamName] = strDateTime;
					}
					else
					{
						//-- if its not more than a minute we dont care
						this._xmlmc_values[strHelpdeskSessionParamName] = undefined;
					}
					break;
				case "checkclosecallstatus":
					var val = this._xmlmc_values[strHelpdeskSessionParamName];
					if(val==6)
					{
						//-- resolving so actually need to change call method
						this._xmlmcMethod = "resolveCalls";
						this._xmlmc_values["status"] = undefined;
						this._xmlmc_values["delaycacheflush"] = undefined;
					}
					else 
					{
						this._xmlmc_values["status"] = (this._xmlmc_values["status"]==18)?"true":"false";
					}
					break;
			}
		}
		
		if(strParam.toLowerCase() == "callref")
		{
			//-- split in case it accepts multiple
			var strCallrefs = this._xmlmc_param_mappings[strParam] + "";
			var arrCallrefs = strCallrefs.split(",");
			for(var x=0;x<arrCallrefs.length;x++)
			{
				xmlmc.SetParam(strParam,arrCallrefs[x]);
			}
		}
		else
		{
			if($.isFunction(this[strHelpdeskSessionParamName]))
			{
				this[strHelpdeskSessionParamName](strParam, xmlmc);
			}
			else if(this._xmlmc_values[strHelpdeskSessionParamName]!=undefined)
			{		
				xmlmc.SetParam(strParam,this._xmlmc_values[strHelpdeskSessionParamName]);
			}
		}
	}
	
	if(xmlmc.Invoke("helpdesk",this._xmlmcMethod))
	{
		this.lasterrorstring = "";
		this.boolresult = true;
		
		//--
		//-- turn resulting xml complex return param (callActionStatusType) into the same return string that helpdesksession returns
		//-- which is when doing call actions	:- "updateref=<callref>.<udindex>\nupdateref=<callref>.<udindex>";
		//-- which is when logging call			:- 
		//-- which is when working with issues	:- 
		//-- which is when working with tasks	:- 
		var strReturnString = "";
		if(this._xmlmcMethodReturnType=="callaction")
		{
			var arrCallActions = xmlmc.xmlDOM.getElementsByTagName("callActionStatus");
			for(var x=0;x<arrCallActions.length;x++)
			{
				var strCallref = app.xmlNodeTextByTag(arrCallActions[x],"callref");
				var strStatus = app.xmlNodeTextByTag(arrCallActions[x],"success");
				if(strStatus!="fail")
				{
					var strUDIndex = app.xmlNodeTextByTag(arrCallActions[x],"udIndex");
					
					//-- add to return string
					if(strReturnString!="")strReturnString+="\n";
					strReturnString += "updateref=" + strCallref + "." + strUDIndex;
				}
				else
				{
					//-- failed on one of the calls
					var strMessage = app.xmlNodeTextByTag(arrCallActions[x],"message");
					this.boolresult = false;
					this.lasterrorstring = strMessage;
				}
			}
		}
		this.resultstring = strReturnString;
		this.SetReturnValues();
	}
	else
	{
		this.boolresult = false;
		this.lasterrorstring = xmlmc._lasterror;
	}
	this.ResetValues()
	return this.boolresult;
}

HelpdeskSession.prototype.Commit = function (strActionVerb)
{
	//--
	//-- we want to use xmlmc to process this set of work instead of 5005 api
	if(this._bUseXmlmc)
	{
		return this._CommitToXmlmc(strActionVerb);
	}

	
	alert("HelpdeskSession.Commit is not supported");
	return false;
	
	
	//-- call http request to process action. Wait for return, set state vars and then return true or false
	if(strActionVerb==undefined)strActionVerb="";
	var strParams = "_wcactionverb="+strActionVerb+"&_uniqueformid=" + 	this._uniqueformid + "&command=" + this.command+"&_swcallrefs=" + this.strCallrefs;

	//-- 87206 - record file that we are sending
	var strStrParams = app._params_from_array(this.array_files, "swhdfile__");
	if(strStrParams!="")strParams+="&"+strStrParams;

	var strStrParams = app._params_from_array(this.array_strvalues, "swhdstr__");
	if(strStrParams!="")strParams+="&"+strStrParams;

	var strNumParams = app._params_from_array(this.array_numvalues, "swhdnum__");
	if(strNumParams!="")strParams+="&"+strNumParams;

	var strTxtParams = app._params_from_array(this.array_txtvalues, "swhdtxt__");
	if(strTxtParams!="")strParams+="&"+strTxtParams;

	var strDateParams = app._params_from_array(this.array_datevalues, "swhddate__");
	if(strDateParams!="")strParams+="&"+strDateParams;

	var strVarParams = app._params_from_array(this.array_values, "swhd__");
	if(strVarParams!="")strParams+="&"+strVarParams;

	var strVarParams = app._params_from_array(this.array_ext_values, "swext__");
	if(strVarParams!="")strParams+="&"+strVarParams;

	
	this.resultarray = new Array();

	var d = new Date();
	app.debugstart(d,"helpdesksession.Commit");
	var strURL = app.get_service_url("swclass/helpdesksession","");
	this.resultstring = app.get_http(strURL, strParams, true, false);
	app.debugend(d,"helpdesksession.Commit");
	var boolRes = (this.resultstring.indexOf("OK")>-1);

	//-- replace + or -OK with "" 
	this.resultstring = app.string_replace(this.resultstring, "+OK","",false);
	this.resultstring = app.string_replace(this.resultstring, "-OK","",false);

	if(!boolRes)
	{	
		this.lasterrorstring = this.resultstring;
	}
	else
	{
		this.SetReturnValues();
	}

	this.boolresult = boolRes;
	this.ResetValues()
	return boolRes;

}

HelpdeskSession.prototype.ResetValues = function ()
{
	this._xmlmc_values = new Array();
	this._xmlmcMethod = "";
	this._bUseXmlmc = false;

	//-- store value types to send
	this.array_strvalues = new Array();
	this.array_numvalues = new Array();
	this.array_txtvalues = new Array();
	this.array_values = new Array();
	this.array_ext_values = new Array();
	this.array_datevalues = new Array();
	this.array_files = new Array();
	this.array_xmlmc_files = new Array();
	
	this._actionverb = "";
	
}

HelpdeskSession.prototype.Connect = function ()
{
	return true;
}

HelpdeskSession.prototype.GetCallTotalTimeSpent = function (nCallRef)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("callref",nCallRef);

	if(xmlmc.Invoke("helpdesk","getCallTotalTimeSpent"))
	{
		return xmlmc.GetParam("timeSpent");
	}
	return 0;
}

HelpdeskSession.prototype.GetCallUpdateResultData = function ()	
{
	var retArray = new Array();
	var arrInfo = this.resultstring.split("updateref=");
	for(var x=0;x<arrInfo.length;x++)
	{
		var tmp = arrInfo[x].split(".");
		if(tmp[0]!=undefined && tmp[0]!="")
		{
			retArray[tmp[0]] = tmp[1];
		}

	}
	return retArray;
}

HelpdeskSession.prototype.GetLastErrorStr = function ()
{
	return this.lasterrorstring;
}

HelpdeskSession.prototype.GetResult = function ()
{
	return this.boolresult;
}

HelpdeskSession.prototype.GetResultInfo = function ()
{
	var tArr = new Array();
	var tO = new Object();
	for(strItem in this.resultarray)
	{
		tO[strItem] = this.resultarray[strItem];
	}
	tArr[0]=tO;
	return tArr;

	return this.resultstring;
}

HelpdeskSession.prototype.SetReturnValues = function ()
{
	var strResult = this.resultstring.substring(4);
	this.resultarray = new Array();

	//-- Loop through our item=value strings and split them into a named array (map)
	var arrValues = strResult.split(";");//explode(";", $ret);
	for(var x = 0; x < arrValues.length; x++)
	{
		var item = arrValues[x];
		var pair = item.split("=");

		var field = app.trim(pair[0]);
		var value = app.string_replace(pair[1], '"'," ",true);

		this.resultarray[field] = value;

		if(field=="callref")
		{
			this.resultarray["strcallref"] = value;
			if(isNaN(value))
			{
				value = value.substring(1);
				value++;value--;
			}
		}
		this.resultarray[field] = value;
	}
}

HelpdeskSession.prototype.GetReturnValue = function (strName)
{
	return this.resultarray[strName];
}

HelpdeskSession.prototype.GetReturnValueArray = function ()
{
	return this.resultarray;
}

HelpdeskSession.prototype.GetReturnDataStr = function ()
{
	return this.resultstring;
}

HelpdeskSession.prototype.GetSessionFileInfo = function ()
{
	//-- what is this meant to return?
	//-- for now return object containing last updateid for first callref
	var arrInfo = this.resultstring.split("updateref=");
	if(arrInfo[1]!=undefined)
	{
		return arrInfo[1];
	}
	return null;
}


HelpdeskSession.prototype.SendBoolean = function (strParamName, bValue)
{
	if(!isNaN(bValue))bValue=bValue-0;
	this._xmlmc_values[strParamName] = (bValue)?"true":"false";
	this.array_numvalues[strParamName] = (bValue)?"1":"0";

	return true;
}


HelpdeskSession.prototype.SendDate = function (strParamName, strValue)
{
	this._xmlmc_values[strParamName] = strValue;
	this.array_datevalues[strParamName] = strValue;
	return true;
}

HelpdeskSession.prototype.SendFile = function (strParamName,strFileName)
{
	if(strFileName===undefined)
	{
		this.array_xmlmc_files[strParamName] = true;
	}
	else
	{
		this.array_files[strParamName] = strFileName;
	}
	return true;
}

HelpdeskSession.prototype.SendString = function (strParamName, strValue)
{
	this._xmlmc_values[strParamName] = strValue;
	this.array_strvalues[strParamName] = strValue;
	return true;
}

HelpdeskSession.prototype.SendText = function (strParamName, strValue)
{
	this._xmlmc_values[strParamName] = strValue;
	this.array_txtvalues[strParamName] = strValue;
	return true;
}

HelpdeskSession.prototype.SendNumber = function (strParamName, strValue)
{
	if(strParamName.indexOf(".")>-1)
	{
		var arrParam = strParamName.split(".");
		if(dd.tables[arrParam[0]]!=undefined && dd.tables[arrParam[0]].columns[arrParam[1]]!=undefined)
		{
			if(dd.tables[arrParam[0]].columns[arrParam[1]].IsNumeric() && strValue=="") 
			{
				strValue="0";
			}
		}
	}

	this._xmlmc_values[strParamName] = strValue;
	this.array_numvalues[strParamName] = strValue;
	return true;
}

HelpdeskSession.prototype.SendValue = function (strParamName, strValue)
{
	if(strParamName.indexOf(".")>-1)
	{
		var arrParam = strParamName.split(".");
		if(dd.tables[arrParam[0]]!=undefined && dd.tables[arrParam[0]].columns[arrParam[1]]!=undefined)
		{
			if(dd.tables[arrParam[0]].columns[arrParam[1]].IsNumeric()) 
			{
				if(strValue=="")strValue="0";
				this._xmlmc_values[strParamName] = strValue;
				this.array_numvalues[strParamName] = strValue;
				return true;
			}
		}
	}

	this._xmlmc_values[strParamName] = strValue;
	this.array_values[strParamName] = strValue;

	return true;
}

HelpdeskSession.prototype.SendExtendedValue = function (strParamName, strValue)
{
	this._xmlmc_values[strParamName] = strValue;
	this.array_ext_values[strParamName] = strValue;
	return true;
}
//-- eof wc specific helpdesk functions


//-- function used to call info
function GetCallStatusInfo(strCallref)
{
	var ret = new Object();
	ret.nStatus = 0;
	ret.strCallClass = "";
	ret.strPriority = "";

	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam('callref',strCallref);
	if(xmlmc.Invoke("helpdesk", "getCallStatusInfo"))
	{
		ret.nStatus = xmlmc.GetParam("status");
		ret.strCallClass = xmlmc.GetParam("callClass");
		ret.strPriority = xmlmc.GetParam("priority");
	}
	return ret;
}
document.GetCallStatusInfo = GetCallStatusInfo;


//-- wrapper to simulate sw message box
function MessageBox(strMessage, nOptions, callback, aWin)
{
	//-- open modal window 
	var undefined;
	if(nOptions==undefined)nOptions=0;

	
	if(aWin==undefined)
	{
		//-- check if in a sw form
		try
		{
			if(_swdoc)
			{
				app._CURRENT_JS_WINDOW = window;
				aWin=window;
			}
		}
		catch(e)
		{
			if(app._CURRENT_JS_WINDOW!=null)
			{
				aWin = app._CURRENT_JS_WINDOW;
				//app._CURRENT_JS_WINDOW=null;
			}
			else
			{
				aWin = window;
			}
		}
	}
	
	if(nOptions==0)
	{
		alert(strMessage);
		if(callback)
		{
			callback(0);
		}
		return 0;
	}
	/*
	else if (nOptions==36) //-- normal confirm
	{
		res = aWin.confirm(strMessage);
		if(callback)
		{
			callback(res);
		}
		return res;
	}*/
	
	var info = {};
	info.__app = app;
	info.__modal = true;
	info.__parentwindow = aWin;
	info.message = strMessage;
	info.noptions = nOptions;
	info.__callback = function(msgResult)
	{
		if(callback)
		{
			callback(msgResult);
		}
	};

	return app._open_window(app._root + "client/forms/_system/messagebox/messagebox.php", "messagboxpopper", true, 400, 120,info,aWin,"messagebox.php");
}


//-- nwj - need to alter standard alert so that if there is a current js window set we output the alert from there
var bAlert = false;
function _override_alert(strMessage)
{

	var win =(app._CURRENT_JS_WINDOW!=null)?app._CURRENT_JS_WINDOW:window;
	win.alert(strMessage)

}

//
// -- UNSUPPORTED CLASSES

//-- pick files (could do this but would have to upload file to server first ??) - maybe use flash or java applet?
function PickFileDialog()
{
	this.path = "";
	this.filename = "";
	this.filepath = "";
	this.size = 0;
	this.lastmodified = "";
	alert("PickFileDialog : Is not supported in the Webclient");
	return false;
}
PickFileDialog.prototype.Open = function()
{
	alert("PickFileDialog.Open : Is not supported in the Webclient");
	return false;
}

PickFileDialog.prototype.NextFile = function()
{
	alert("PickFileDialog.NextFile : Is not supported in the Webclient");
	return false;
}

//-- used to creae a new word doc based on a template - again could do this but would have to do it on the server and no client
function WordDocument()
{
	this.variables = new Array();
	return true;
}
WordDocument.prototype.SetVariable = function(strVar, varValue)
{
	this.variables[strVar] = varValue;
	return true;
}
WordDocument.prototype.CreateDocument = function(strTemplatePath, strSavePath)
{
	//-- c++ creates doc on c drive and looks for template on c drive too
	//-- maybe prompt user to use activex? (??)
	alert("WordDocument.CreateDocument : Is not supported in the Webclient");
	return false;
}
WordDocument.prototype.ResetVariables = function()
{
	this.variables = new Array();
	return true;
}



//-- used to create issues
function Issue()
{
	this.what = "what is this calls about?";

	this.issueref = "";
	this.type = 1;
	this.flags = 0;
	this.status = 1;
	this.mastercallref = 0;
	this.timestart = app.global.GetCurrentEpocTime();
	this.timeresolveby = this.timestart + 3600; //-- one hour
	this.timeresolved = 0;
	this.affecteduserscount = 0;
	this.description = "";
	this.bcreated = true;
	this.bcallslocked = false;

	this._arrcallrefs = new Array();
	this._arrcustomers = new Array();


	this.Unapp = app;
}

Issue.prototype.SetDefaults = function(nCallref)
{
	this.type = 1;
	this.status = 1;
	this.timestart = app.global.GetCurrentEpocTime();
	this.timeresolveby = this.timestart + 3600; //-- one hour
	return true;
}

Issue.prototype.UnLockCalls = function(strCallrefs)
{
	return true;
}

Issue.prototype.SetIssueRef = function(strIssueRef,strPointer)
{
	this.issueref = strIssueRef;
	return true;
}

Issue.prototype.Close = function(nCallref)
{
	this.status = 16;
	return true;
}

Issue.prototype.Update = function (strPointer,strTable)
{

	return true;
}

Issue.prototype.PopulateFromCall = function(nCallref)
{

	return true;
}

Issue.prototype.AddCalls = function(strCallrefs)
{
	strCallrefs +=""; //-- cast callref
	var arrCalls = strCallrefs.split(",");
	for(var x=0;x< arrCalls.length;x++)
	{
		this._arrcallrefs[arrCalls[x]] = true;
	}
	return true;
}

Issue.prototype.RemoveCalls = function (strCallrefs)
{
	strCallrefs +=""; //-- cast callref
	var arrCalls = strCallrefs.split(",");
	for(var x=0;x< arrCalls.length;x++)
	{
		this._arrcallrefs[arrCalls[x]] = false;
	}
	return true;
}

//-- check if there is a call linked to issue with cust id?
Issue.prototype.IsCustomerConnected = function(strCustID)
{
	if(	this._arrcustomers[strCustID]!=undefined)return	this._arrcustomers[strCustID];
	return false;
}

//-- popup customer picker?
Issue.prototype.AddCustomer = function(strCustID)
{
	this._arrcustomers[strCustID] = true;
	return true;
}

//-- get calls that are linked to issue?
Issue.prototype.GetCommaSepCallRefList = function(strCustID)
{
	var strCallref = "";
	for(iCallref in this._arrcallrefs)
	{
		if(this._arrcallrefs[iCallref])
		{
			if(strCallref != "")strCallref += ",";
			strCallref += iCallref;
		}
	}
	return strCallref;
}

Issue.prototype.GetStatus = function()
{
	return this.status;
}

Issue.prototype.GetTypeString = function()
{
	var strType = (this.type==1)?"Hot":"Known";
	return strType;
}

Issue.prototype.GetDirty = function()
{
	return 8;
}

Issue.prototype.IsDirty = function()
{
	return false;
}

Issue.prototype.IsCreated = function()
{
	return false;
}


//--
//-- object to handle popup window to associate calls to issue
function AddCallsToIssueDialog()
{
	this.selCount = 0;
	this.arrSelectedCallrefs = new Array();
	return false;
}

//-- open window
AddCallsToIssueDialog.prototype.Open = function(callback)
{
	var me = this;
	var oForm = app._open_system_form("_wc_addcallstoissue", "swissues", "", "", true,function(formReturnInfo)
	{
		if(formReturnInfo && formReturnInfo._swdoc._selectedcallrefs!="")
		{
			var refs = oForm._swdoc._selectedcallrefs + "";
			
			me.arrSelectedCallrefs = refs.split(",");
			me.selCount =this.arrSelectedCallrefs.length;
			
			var retObject = {};
			retObject.selCount = me.selCount;
			retObject.arrSelectedCallrefs =  me.arrSelectedCallrefs;
			
			callback(retObject)
		}
		else callback(0)
	});
}

function OpenSqlTreeBrowserForm(strSearchFormName, boolArg1, boolArg2)
{
	var oForm = app._open_application_form("treebrowserform."+strSearchFormName, "stf", "", "resolvemode=1", true, "add",null,null,window);
	if(oForm && oForm._swdoc._selected_treeformkey!="")
	{
		return oForm._swdoc._selected_treeformkey;
	}
	return "";
}

//-- get server registry string
function RegGetString(strReg)
{
	var strParams = "_regstring=" + app.pfu(strReg);
	var strURL = app.get_service_url("swclass/reggetstring","");
	return app.get_http(strURL, strParams, true, false);
}


//-- run os program
function RunProgram()
{
	alert("RunProgram : Webclient does not support this method.");
}

function PCA_ShowDetails(strCompuerName)
{
	alert("PCA_ShowDetails : Webclient does not support this method.");
	return false;
}

function TAPIDial(strNumber)
{
	alert("TAPIDial : Webclient does not support this method.");
	return false;
}

function ShellExecute(strCommand)
{
	if( (strCommand.indexOf("http:")==0) || (strCommand.indexOf("www.")==0) )
	{
		if(strCommand.indexOf("http:")==-1)strCommand = "http://"+strCommand;
		window.open(strCommand,"");
	}
	else if(strCommand.indexOf("hslib.exe"))
	{
		//-- call webclient hib interface
		//"c:\\Program Files\\Hornbill\\Supportworks Client\\hslib.exe", "-url " + strUrl + " -var compname=\"" + strInventoryID + "\"", "open"
		var arrInfo = strCommand.split(",");
		var strUrlAssetInfo = app.trim(strCommand[1]);
		var arrMoreInfo = strUrlAssetInfo.split("-var");

		var strURL = arrMoreInfo[0]; //-- [-url someurlstring]
		var strCompID = "";
		var arrVars = new Array();
		for(var x=1;x<arrMoreInfo.length;x++)
		{
			if(arrMoreInfo[x].indexOf("compname=")>-1)
			{
				var arrTemp = arrMoreInfo[x].split("compname=");
				strCompID = app.trim(arrTemp[1]);
			}
		}

		if(strCompID!="")
		{
			//alert(strURL)
			app.global.RunHIB(strURL,"compname",strCompID);
		}
		else
		{
			alert("Expected [compname] was not specified for HIB. Please contact your Administrator.");
		}
	}
	else
	{
		alert(" ShellExecute : Webclient does not support this method.");
	}
}





//--
//-- SPECIAL SYSTEM DB FIELD SWAPOUT VALUES
//--

//-- i.e appointments showtimeas has fixed values -that the full client much turn into numbers
var arrSwapEnumBindingValues = new Array();
arrSwapEnumBindingValues["appointments.show_time_as"] = new Array();
arrSwapEnumBindingValues["appointments.show_time_as"]["free"] = 1;
arrSwapEnumBindingValues["appointments.show_time_as"]["busy"] = 2;
arrSwapEnumBindingValues["appointments.show_time_as"]["tentative"] = 3;
arrSwapEnumBindingValues["appointments.show_time_as"]["out_of_office"] = 4;


//--
//-- 29.05.2012 - old sqlquery class that uses xml - renamed to XmlSqlQuery so can be used in certain cases
function XmlSqlQuery()
{
	this._lasterror = "";

	this._currentrow = -1;
	this._recordset = null;
	this._currentrecord = null

	this._oI = null;
}

//-- given an xmlmc object take its return data and add to sqlquery
XmlSqlQuery.prototype.injectXmlmcRsData = function(xmlmcObject)
{
	this._recordset = xmlmcObject.xmlDOM;
	if(typeof this._recordset=="object")
	{
		return true;
	}
	return false;

}

XmlSqlQuery.prototype.HasRight = function(strSQL)
{
	//-- find table name and action
	strSQL = app.trim(strSQL.toLowerCase());
	var arrSQL = strSQL.split(" ");

	//-- determine action
	var strAction = arrSQL[0];

	var iCheckRight = 0;
	switch(strAction)
	{
		case "select":
			iCheckRight = _CAN_BROWSE_TABLEREC;
			break;
		case "update":
			iCheckRight = _CAN_UPDATE_TABLEREC;
			break;
		case "insert":
			iCheckRight = _CAN_ADDNEW_TABLEREC;
			break;
		case "delete":
			iCheckRight = _CAN_DELETE_TABLEREC;
			break;
	}

	var strTable = "";

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

	if(strTable == "")
	{
		alert("XmlSqlQuery.prototype.HasRight: Could not find table name in the sql :-\n\n" + strSQL);
		return false;
	}

	//-- do have permision to view or browse record
	var arrTables = strTable.split(",");
	for(var x=0;x<arrTables.length;x++)
	{
		var res = app.session.CheckTableRight(arrTables[x],iCheckRight,true);
		if(res!="") 
		{
			alert(res);
			return false;
		
		}
	}

	return true;
}

//-- return sql object info
XmlSqlQuery.prototype._getsqlinfo = function (strSQL)
{
	var sqlInfo = new Object();

	//-- find table name and action
	strSQL = app.trim(strSQL.toLowerCase());
	var arrSQL = strSQL.split(" ");

	//-- determine action
	var strAction = arrSQL[0];

	var strTable = "";
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

	sqlInfo.action = app.trim(strAction);
	sqlInfo.tables = app.trim(strTable);
	var iF = strSQL.indexOf("from");
	sqlInfo.columns = app.trim(strSQL.substring(0,iF));
	sqlInfo.columns = app.trim(app.string_replace(sqlInfo.columns,strAction,"",true));
	return sqlInfo;
}

//-- strDB = swdata or syscache
XmlSqlQuery.prototype.Query = function (strSQL, strDB)
{
	if(strDB==undefined)strDB="swdata";
	if(strSQL==undefined || strSQL=="")
	{
		alert("XmlSqlQuery.Query expects a strSQL parameter");
	}

	this._oI = this._getsqlinfo(strSQL);

	var strDelete = "";
	if(strSQL.toLowerCase().indexOf("delete") == 0) strDelete ="yes";

	//--
	//-- get service to form data records as xml
	var strParams = "delete="+strDelete+"&execsql=" + app.pfu(strSQL)+ "&db="+strDB;
	var strURL = app.get_service_url("swclass/sqlquery","");

	app.debugstart(strSQL,"swjs.XmlSqlQuery");
	this._recordset = app.get_http(strURL, strParams, true, true);
	app.debugend(strSQL,"swjs.XmlSqlQuery");
	if(typeof this._recordset=="object")
	{
		return true;
	}
	return false;
}
XmlSqlQuery.prototype.query = XmlSqlQuery.prototype.Query;

//-- move to next row of data
XmlSqlQuery.prototype.fetch = function ()
{
	return this.Fetch();
}
XmlSqlQuery.prototype.Fetch = function ()
{
	if(this._recordset.childNodes.length==0) return false;

	this._currentrow++;
	var arrNodes = this._recordset.childNodes[0].getElementsByTagName("row");
	if(arrNodes[this._currentrow]==undefined) 
	{
		this._currentrecord = null;
		return false;
	}

	this._currentrecord = arrNodes[this._currentrow];
	return true;
}

//-- get given col as a number
XmlSqlQuery.prototype.GetValueAsNumber = function (intColIndex, boolDisplay)
{
	if(this._recordset.childNodes.length==0) return false;
	if(this._currentrecord==null) return false;

	if(boolDisplay==undefined)boolDisplay=false;


	//-- so user can specify col name instead of position
	var testNum= new Number(intColIndex);
	if(isNaN(testNum))
	{
		intColIndex=this.GetColumnIndex(intColIndex);
	}


	if(this._currentrecord.childNodes[intColIndex]!=undefined)
	{
		if(boolDisplay)
		{
			var cNode = (this._currentrecord.childNodes[intColIndex].childNodes.length==2)?this._currentrecord.childNodes[intColIndex].childNodes[1]:this._currentrecord.childNodes[intColIndex].childNodes[0];
		}
		else
		{
			var cNode = (this._currentrecord.childNodes[intColIndex].childNodes.length==2)?this._currentrecord.childNodes[intColIndex].childNodes[0]:this._currentrecord.childNodes[intColIndex].childNodes[0];
		}

		var num = new Number(app.xmlText(cNode));
		num++;num--;
		
		return num;
	}
}

//-- get given col as text
XmlSqlQuery.prototype.GetValueAsString = function (intColIndex, boolDisplay)
{
	try
	{	
		if(this._recordset.childNodes.length==0) return "";
		if(this._currentrecord==null) return "";

		if(boolDisplay==undefined)boolDisplay=false;

		//-- so user can specify col name instead of position

		var testNum= new Number(intColIndex);
		if(isNaN(testNum))
		{
			intColIndex=this.GetColumnIndex(intColIndex);
		}

		if(this._currentrecord.childNodes[intColIndex]!=undefined)
		{
			if(boolDisplay)
			{
				var cNode = (this._currentrecord.childNodes[intColIndex].childNodes.length==2)?this._currentrecord.childNodes[intColIndex].childNodes[1]:this._currentrecord.childNodes[intColIndex].childNodes[0];
			}
			else
			{
				var cNode = (this._currentrecord.childNodes[intColIndex].childNodes.length==2)?this._currentrecord.childNodes[intColIndex].childNodes[0]:this._currentrecord.childNodes[intColIndex].childNodes[0];
			}
			return app.xmlText(cNode);
		}
		return "";

	}
	catch (e)
	{
		return "";
	}

}

//--return col index for given name
XmlSqlQuery.prototype.GetColumnIndex = function(strColName)
{
	if(this._recordset.childNodes.length==0) return -1;

	this.GetColumnCount();
	if(this._currentrecord==null) return -1;
	var nodes = this._currentrecord.childNodes;
	var yLen = nodes.length;
	for(var x=0; x<yLen;x++)
	{
		if(nodes[x].tagName.toLowerCase() == app.trim(strColName.toLowerCase())) 
		{
			return x;
		}
	}
	return -1;

}

//--return col name at given position
XmlSqlQuery.prototype.GetColumnName = function(intColIndex)
{
	if(this._recordset.childNodes.length==0) return "";
	this.GetColumnCount();
	if(this._currentrecord==null) return "";

	if(this._currentrecord.childNodes[intColIndex]!=undefined)
	{
		var strTableAppend = "";
		if(this._oI!=null)
		{
			if(this._currentrecord.childNodes[intColIndex].tagName.indexOf(".")==-1 && this._oI.action=="select" && this._oI.tables.indexOf(",")==-1 && this._oI.columns=="*")
			{
				strTableAppend=this._oI.tables + ".";
			}
		}
		return strTableAppend + this._currentrecord.childNodes[intColIndex].tagName;
	}
	return "";

}

//--return # of cols
XmlSqlQuery.prototype.GetColumnCount = function()
{
	if(this.currentrow == -1)
	{
		this.Fetch();
		this._currentrow = -1;
	}

	if(this._currentrecord==null) return 0;
	return this._currentrecord.childNodes.length;
}

//--return # of rows
XmlSqlQuery.prototype.GetRowCount = function()
{
	if(this._recordset.childNodes==undefined)return 0;
	if(this._recordset.childNodes[0]==undefined)return 0;

	var arrNodes = this._recordset.childNodes[0].getElementsByTagName("row");
	return arrNodes.length;
}


//--return t/f is given col is numeric or not
XmlSqlQuery.prototype.IsColNumeric = function(intColIndex)
{
	if(this._recordset.childNodes.length==0) return false;
	var value = this.GetValueAsNumber(intColIndex);
	if(isNaN(value))
	{
		return false;
	}
	 return true;
}

//--clear result set
XmlSqlQuery.prototype.Reset = function()
{
	this._currentrow = -1;
	this._recordset = null;
	this._currentrecord = null;
	this._lasterror="";
	return true;
}

XmlSqlQuery.prototype.GetLastError = function()
{
	return this._lasterror;
}


function _cBoolean(varToTest)
{
	if(varToTest==="true" || varToTest==="TRUE" || varToTest==="True"  || varToTest===true || varToTest===1) return true;
	return false;
}

//-- because ddf export doesnt seem to be working
function GetAsISO8601TimeString (intEpochDateTime)
{
	return app.global.GetAsISO8601TimeString (intEpochDateTime);
}