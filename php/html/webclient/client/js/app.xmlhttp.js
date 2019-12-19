//-- NWJ
//-- 25.01.2006
//-- control http requests. Allows us to attach functions and process ids to a request so 
//-- when data is returned we can trigger that function and pass in the data
var __SESSIONERROR = "SESSIONERROR";
var app = top;
var isIE = (window.ActiveXObject) ?true:false; 
var boolForceLoggingOut = false;
	
//-- create xml http request object
function create_httprequest()
{
	//-- code for Mozilla, etc.
	var xmlhttp=false;
	try
	{
		// Try the Mozilla way -- also now supported in IE7+
		xmlhttp = new XMLHttpRequest();
	} 
	catch(e)
	{
		//-- If we can not do the above, we need to see if we can get the IE activeX version loaded
		var MSXML_XMLHTTP_PROGIDS = new Array(
				'MSXML2.XMLHTTP.5.0',
				'MSXML2.XMLHTTP.4.0',
				'MSXML2.XMLHTTP.3.0',
				'MSXML2.XMLHTTP',
				'Microsoft.XMLHTTP');

		var success = false;
		for(var i=0;i < MSXML_XMLHTTP_PROGIDS.length && !success; i++) 
		{
			try 
			{
				xmlhttp = new ActiveXObject(MSXML_XMLHTTP_PROGIDS[i]);
				success = true;
			}
			catch(e)
			{
				success = false;
			}

			if(success)
				break;
		}
		if(!success)
		{
			alert('Can\'t create XMLHttpRequest ('+MSXML_XMLHTTP_PROGIDS[i]+') - not supported on your browser');
		}
	}
	return xmlhttp;
}


	//-- create xml dom object given an xml string
	function create_xml_dom(strXML)
	{

		if(strXML.indexOf(__SESSIONERROR)>-1)
		{
			var strMsg = strXML.split(":");
			if(opener && opener.logout)
			{
				opener.logout(strMsg[1]);
				self.close();
			}
			else
			{
				top.logout(strMsg[1]);
				return false;
			}
		}
		 
		if (window.ActiveXObject) 
		{
			var oXML=new ActiveXObject("Microsoft.XMLDOM");
			if(oXML!=null)
			{
				oXML.async="false";
				if(!oXML.loadXML(strXML))
				{	
					debug("create_xml_dom : Error loading XML into DOM");
				}
			}

		}
        else 
		{
			//-- mozilla - need to clean white space due to mozilla treating white space as XML nodes (??? how crap is that)
            oXML = (new DOMParser).parseFromString(strXML, "text/xml");
			cleanWhitespace(oXML.documentElement);
        }

		if (!oXML.documentElement)
		{		
			alert("The returned xml does not have a valid document root.\n\n" + strXML);
		}
		return oXML;
	}


	//-- remove white space from xml
	var notWhitespace = /\S/;
	function cleanWhitespace(node) 
	{
		for (var x = 0; x < node.childNodes.length; x++) 
		{
		    var childNode = node.childNodes[x];
			if ((childNode.nodeType == 3)&&(!notWhitespace.test(childNode.nodeValue))) 
			{
				//-- that is, if it's a whitespace text node
				node.removeChild(node.childNodes[x]);
				x--;
			}
			if (childNode.nodeType == 1) 
			{
				//-- elements can have text child nodes of their own
		       cleanWhitespace(childNode);
			}
		}
	}
	//--
	//--


//-- 2012.05.09 - CallStoredQuery Script
function CallStoredQuery (strQueryName, strScriptParams, bAsJson)
{
	if(bAsJson==undefined)bAsJson=true;

	//--
	//-- get service to form data records as xml
	var strParams = "espQueryName="+strQueryName+"&incmetadata=1&asjson=" + bAsJson+ "&sessid="+session.sessionId;
	if(strScriptParams!="")strParams +="&" + strScriptParams;

	//-- make the call - expecting xml to be returned back
	//var strURL = _webserver + "clisupp/storedqueries/index.php";
	//var res = app.get_http(strURL, strParams, true, !bAsJson);

	//-- make the call - expecting xml to be returned back
	var strURL =  "service/storedquery/clisupp.php";
	var res = app.get_http(strURL, strParams, true, !bAsJson);


	return res;
}

//-- 2012.05.09 - CallWebclientStoredQuery Script
function CallWebclientStoredQuery (strQueryName, strScriptParams, bAsJson)
{
	if(bAsJson==undefined)bAsJson=true;
	//--
	//-- get service to form data records as xml
	var strParams = "espQueryName="+strQueryName+"&asjson=true&sessid="+session.sessionId;
	if(strScriptParams!="")strParams +="&" + strScriptParams;

	//-- make the call - expecting xml to be returned back
	var strURL =  "service/storedquery/index.php";
	var res = app.get_http(strURL, strParams, true, !bAsJson);

	return res;
}

function get_http(strURL, strParams, boolWait, boolXML, callBackFunction, targetEle, intTotalRecall, strControlName, boolDoNotSwed,parseBackData)
{
	var undefined;
	if(intTotalRecall==undefined)intTotalRecall=0;
	if(strControlName==undefined)strControlName="";
	if(boolXML==undefined)boolXML=false;
	if(callBackFunction==undefined)callBackFunction=false;
	if(targetEle==undefined)	targetEle=null;
	if(parseBackData==undefined)parseBackData = null;
	
	var ohttp = create_httprequest();
	ohttp._swwc_data = parseBackData;
	var startHttpRequestDateTime = new Date();

	//-- in memory function to handle http requests
	handle_http_response = function ()
						  {

								if (ohttp.readyState==4)
								{
									//-- page not found
									if(ohttp.status!=200) 
									{
										//-- server connection issues - repeat call
										switch(ohttp.status)
										{
											case 12029:
											case 12030:
											case 12031:
											case 12152:
											case 12159:
												alert("xmlhttp request error " + ohttp.status + " : " + strURL + ".\n The server closed the http connection. Please contact your Administrator.");
												break;
											default:
												alert("xmlhttp request error " + ohttp.status + " : " + strURL + ".\n Please contact your Administrator.");
												break;
										}

										//-- clear loading
										if(_swcore.ohttp_currenturl == strURL)	window.status = "";

										strHttpResult = false;
										return false;
									}
									
									//-- clear loading status
									if(_swcore.ohttp_currenturl == strURL)	window.status = "";

									strHttpResult = app.trim(ohttp.responseText);

									if(strHttpResult.indexOf("_SWWEBCLIENT_PHPTIMER[")!=-1)
									{
										var arrResp = strHttpResult.split("_SWWEBCLIENT_PHPTIMER[");
										strHttpResult = app.trim(arrResp[0]);
										arrResp = arrResp[1].split(".");

										//-- check role has not changed
										if(session.role!=0 && session.role != arrResp[1])
										{
											boolForceLoggingOut = true;
											strHttpResult = "";
											var strMsg = "m5";
											if(opener && opener.logout)
											{
												opener.logout(strMsg);
												self.close();
											}
											else
											{
												top.logout(strMsg);
											}
											return "";
										}

										if(_bRecordPerformanceTimers)
										{
											var newTime = new Number(arrResp[0]);
											if(newTime<0)newTime=50;
											_performancePHPtimer = _performancePHPtimer + newTime;
										}
									}

									if(strHttpResult.indexOf("PARAMERROR:")!=-1)
									{
										var strMsg = strHttpResult.split("PARAMERROR:")[1];
										alert(strMsg);
									}
									else if(strHttpResult.indexOf(__SESSIONERROR)>-1)
									{
										//-- check session error
										if(boolForceLoggingOut!=undefined && !boolForceLoggingOut)
										{
											boolForceLoggingOut = true;
											var strMsg = strHttpResult.split(":")[1];
											if(opener && opener.logout)
											{
												opener.logout(strMsg);
												self.close();
											}
											else
											{
												top.logout(strMsg);
											}
										}
									}
									else
									{
										if(boolXML)
										{
											//-- convert text to XMLDOM
											strHttpResult = create_xml_dom(strHttpResult);
										}

										if(_bRecordPerformanceTimers)	_performanceNetworktimer = _performanceNetworktimer + ((new Date()) - startHttpRequestDateTime);

										 //-- if there is a call back function call it
										 if (callBackFunction)
										 {
											 try
											 {
												callBackFunction(strHttpResult,targetEle,ohttp);
											 }
											catch(e){}
										 }
									}										
								}
						  }




	
	//-- rfc 86526 - if requesting .xml file make sure we request it via service.
	//-- this means user has to have a valid session and we can then switch off http access to xml files in webclient path
	if(strURL.indexOf(".xml")>-1 || strURL.indexOf(".json")>-1)
	{
		var arrURL = new Array();
		var strPathType = "";
		//-- we only control xml resource fetching in the webclient path
		var boolFetchResourceViaPHP=true;
		if(strURL.toLowerCase().indexOf("http")==0)
		{
			if(strURL.indexOf("/clisupp/")>-1)
			{
				arrURL = strURL.split("/clisupp/");
				strPathType = "/clisupp/";
			}
			else if(strURL.indexOf("/webclient/")>-1)
			{
				arrURL = strURL.split("/webclient/");
				strPathType = "";
			}
			else
			{
				//-- fetch using http as resource is out of supportworks client domain
				boolFetchResourceViaPHP=false;
			}
		}
		else
		{
			//-- relative path
			arrURL[0] = strURL;
		}

		if(boolFetchResourceViaPHP)
		{
			var resourcePath = (arrURL[1]==undefined)?arrURL[0]:arrURL[1];

			//-- change url to resourcefetch service url
			if (strParams != "") strParams+="&";
			strParams+="fetchresourcepath=" + resourcePath;
			strParams+="&pathtype=" + strPathType;
			strURL =  "service/session/fetchresource/index.php";
		}
	}


	var strHttpResult = "";
	if (strParams != "") strParams+="&";
	strParams+="isie=" + isIE + "&_appid=" + app._application;


	//--
	//-- add unique val to request so browser does not cache
	var stamp = new Date().getTime() +"";
	var unique = "r=" + stamp + (session.role+"");
	strParams += "&" + unique;

	if(boolDoNotSwed==undefined)
	{
		//-- if url is not in webclient path then do not swed
		boolDoNotSwed=(strURL.indexOf("/webclient/")==-1 && strURL.indexOf("service/")==-1);
	}
	//-- encrypt params
	if(!boolDoNotSwed)
	{
		strParams = _swed(strParams);
	}
	
	//-- if using proxy pass that into server
	if(app._proxypassname && app._proxypassname!="_PROXYPASSNAME")strParams +="&proxyurl"+ app._root;

	var boolAsync = (boolWait==false)?true:false;

	if(boolWait && (isChrome && isSafari))
	{
		//-- do not assign onload function
	}
	else
	{
		if (window.XMLHttpRequest)
		{
			if(!isIE || isIE10Above)
			{
				ohttp.onload = handle_http_response;
			}
			else
			{
				ohttp.onreadystatechange = handle_http_response;
			}
		}
		else
		{
			ohttp.onreadystatechange = handle_http_response;
		}
	}	
	//-- show loading status (for those browsers that support it)
	_swcore.ohttp_currenturl = strURL;
	window.status = "loading webclient data...";

	//-- Send the proper header information along with the POSTrequest
	ohttp.open("POST",strURL,boolAsync);

	//-- 14.05.2012 send valid session token with the request
	ohttp.setRequestHeader("Webclient-token", app.httpNextToken);
	ohttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	if(!isChrome)ohttp.setRequestHeader("Content-length", strParams.length);

	//-- send close conn for ie6 and  non IE browers
	if((!app.isIE && !isChrome) || app.isIE6)ohttp.setRequestHeader("Connection", "close");

	ohttp.send(strParams);

	//-- 11.07.2012 - 88827 - chrome v20+ does not call onload or onreadystatechage event if request is synchronous and coming from modal form
	//-- so only call events if doing async calls
	if(boolWait && (isChrome || isSafari))handle_http_response();

	return strHttpResult;

}

//--
//-- load outlook xml def file for control
function load_control_xmldom(strControlType, strItemID)
{
	//-- check custom path first
	var strURL = _customapplicationpath + "outlook/" + strControlType + "/" + strItemID + ".xml";
	var oXML = app.get_http(strURL, "", true,true,null);				
	if(oXML) return oXML;

	//-- get out of box xml
	var strURL = _applicationpath + "outlook/" +  strControlType + "/" + strItemID + ".xml";
	var oXML = app.get_http(strURL, "", true,true,null);				

	return oXML;
}


//-- call a service
function call_service(strPath, strArgs, boolWait,boolXML, pFunction)
{
	if(pFunction==undefined)pFunction = null;
	if(boolXML==undefined)boolXML = true;
	if(boolWait==undefined)boolWait = true;
	if(strArgs==undefined)strArgs = "";
	var strURL =  "service/" + strPath + "/index.php"
	var oXML = app.get_http(strURL, strArgs, boolWait,boolXML,pFunction);				
	return service_result(oXML);
}

function get_service_url(strService,strArgs)
{
	if(strArgs!="")strArgs = "?" + strArgs;
	if(strService.toLowerCase().indexOf(".php")!=-1)
	{
		return "service/" + strService + "" + strArgs;
	}
	else
	{
		return "service/" + strService + "/index.php" + strArgs;
	}
}

//-- create service result object
function service_result(oServiceXML)
{
	var oReturn = new Object();
	if(typeof(oServiceXML)!="object")
	{
		oReturn.result  = false;
		oReturn.message = "Service xml is invalid. Please contact your Administrator."
		oReturn.data = "";
		oReturn.oxml = null;
	}
	else
	{
		oReturn.result  = (xmlText(oServiceXML.getElementsByTagName("result")[0])=="true");
		oReturn.message = xmlText(oServiceXML.getElementsByTagName("message")[0]);
		oReturn.data = xmlText(oServiceXML.getElementsByTagName("data")[0]);
		oReturn.oxml = oServiceXML;
	}
	return oReturn;
}

//-- debug stuff
var _performanceLog = new Array();
var _performanceLogPositions = new Array();
var _dwin = null;
var _performancePHPtimer = 0;
var _performanceNetworktimer = 0;
var _bRecordPerformanceTimers = false;
function debugclear()
{
	_bRecordPerformanceTimers=false;
	_performancePHPtimer = 0;
	_performanceNetworktimer=0;
	_performanceLog = new Array();
	_performanceLogPositions = new Array();
}

function debugstart(strMsg,strType,strSubType, bForceLog)
{
	if(app.dd && app.dd.GetGlobalParamAsNumber("webclient settings/showformloadtime")!=1) bForceLog = false;

	if(bForceLog==undefined)bForceLog=false;
	if(app._bDebugMode==false && !bForceLog)return false;

	_bRecordPerformanceTimers=true;

	if(strSubType==undefined || strSubType=="")strSubType="performance monitor";

	var strKey = strType+":"+strMsg;
	var oPerf = new Object();
	oPerf.msg = strMsg;
	oPerf.type = strType;
	oPerf.subtype = strSubType;
	oPerf.phptimer = _performancePHPtimer;
	oPerf.networktimer = _performanceNetworktimer;
	oPerf.startdate = new Date();
	try
	{
		_performanceLog[strKey] =oPerf;
		_performanceLogPositions[_performanceLogPositions.length++] = strKey;
		
	}
	catch (e)
	{
		_performanceLog = new Array();
		_performanceLogPositions = new Array();
		_performanceLog[strKey] =oPerf;
		_performanceLogPositions[_performanceLogPositions.length++] = strKey;
	}
}

function debugend(strMsg,strType,strSubType,bForceLog)
{

	if(app.dd && app.dd.GetGlobalParamAsNumber("webclient settings/showformloadtime")!=1) bForceLog = false;

	if(bForceLog==undefined)bForceLog=false;
	if(app._bDebugMode==false && !bForceLog)return false;

	var strKey = strType+":"+strMsg;
	if(_performanceLog[strKey])
	{
		_performanceLog[strKey].enddate = new Date();
		_performanceLog[strKey].time = _performanceLog[strKey].enddate - _performanceLog[strKey].startdate;
		if(_performanceLog[strKey].time==undefined)_performanceLog[strKey].time = "<1";

		//-- store amount of time spent doing php and network traffic
		_performanceLog[strKey].phptimer = _performancePHPtimer - _performanceLog[strKey].phptimer;
		_performanceLog[strKey].networktimer = (_performanceNetworktimer -_performanceLog[strKey].networktimer) - _performanceLog[strKey].phptimer;
		_performanceLog[strKey].browsertimer = _performanceLog[strKey].time - _performanceLog[strKey].networktimer - _performanceLog[strKey].phptimer;


		_performanceLogPositions[_performanceLogPositions.length++] = strKey;

		return _performanceLog[strKey];
	}
}

function debug(strMsg , strType, strSubType, levelone)
{

}

function show_debug()
{
	if(_dwin!=null && _dwin.open)
	{
		_dwin.focus();
	}
	else
	{
		_dwin = window.open("client/debug.htm");
	}
}

function close_debug()
{
	if(_dwin!=null && _dwin.close)
	{
		_dwin.close();
	}
}


//-- used in index.php
function _btn_signin_onclick()
{
	if(bProcessing)return;
	bProcessing= true;

	document.getElementById("td_errormsg").style.color="#000000";
	setElementText(document.getElementById("td_errormsg"),"..processing login request..please wait..");
	

	//-- login using connect service
	var strUserID = document.getElementById("tb_userid").value;
	var strPassword = document.getElementById("tb_password").value;
	var strURL = get_service_url("session/connect","");
	var strReturnState = get_http(strURL, "_p1=" + B64.encode(strUserID) + "&_p2=" + B64.encode(strPassword), false,false, _onloginreturn);
}

function _onloginreturn(strReturnState,n,ohttp)
{
	bProcessing= false;

	//--
	//-- get the return state object (easy js access object)
	if(strReturnState.indexOf("OK:")!=0)
	{
		document.getElementById("td_errormsg").style.color="red";
		setElementText(document.getElementById("td_errormsg"),strReturnState);
	}
	else
	{
		document.getElementById("sessiontoken").value =ohttp.getResponseHeader('webclient-token');
		frm_portal.submit();
	}
}

function _check_signin_enter(tb,e)
{
	var iKey = e.keyCode;
	if(iKey==13)_btn_signin_onclick();
}

//--
//-- base64
var B64 = new _Base64();
function _Base64()
{
    //-- private property
    this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
     this.encode = function (input) 
	 {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = this._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    }

    //-- public method for decoding
    this.decode = function (input){
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = this._utf8_decode(output);

        return output;

    }

    // private method for UTF-8 encoding
    this._utf8_encode = function (string)
	{
		string = string + "";
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;


    }

    //-- private method for UTF-8 decoding
    this._utf8_decode = function (utftext){
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}