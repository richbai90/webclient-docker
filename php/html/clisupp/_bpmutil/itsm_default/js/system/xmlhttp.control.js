	var boolSessionTimeout=false;
	//-- NWJ
	//-- control http requests. Allows us to attach functions and process ids to a request so 
	//-- when data is returned we can trigger that function and pass in the data

	//-- create xml http request object
	function create_httprequest()
	{
		//-- code for Mozilla, etc.
		var xmlhttp;
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
				alert('Can\'t create XMLHttpRequest - not supported on your browser');
			}
		}
		return xmlhttp;
	}

	//-- create xml dom object given an xml string
	function create_xml_dom(strXML)
	{
        if (window.ActiveXObject) 
		{

			var MSXML2_DOM_PROGIDS = new Array(
		            "MSXML2.DOMDocument.5.0",
			        "MSXML2.DOMDocument.4.0",
				    "MSXML2.DOMDocument.3.0",
					"MSXML2.DOMDocument",
					"Microsoft.XmlDom");

			for(var x = 0; x < MSXML2_DOM_PROGIDS.length; x++)
			{
				var oXML = null;
				try
				{
					oXML = new ActiveXObject(MSXML2_DOM_PROGIDS[x]);					
				}
				catch (e){}
			
				if(oXML!=null)
				{
					if(!oXML.loadXML(strXML))
					{	
						debug("create_xml_dom (" + MSXML2_DOM_PROGIDS[x] + ") : Error loading XML into DOM");
					}
					else
					{
						break;
					}
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
			debug(strXML);
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


var strPHPresult = "";
function run_php(strURL,boolWait, inUseHttpRequestID)
{

	var origURL = strURL;
	var phphttp = create_httprequest();
	//-- in memory function to handle http requests
	handle_php_response = function ()
						  {
								if (phphttp.readyState==4)
								{		
										 strPHPresult = phphttp.responseText;
								}
						  }

	strPHPresult ="";
	
	//--
	//-- create a request id
	var requestid=(inUseHttpRequestID==undefined)?new Date().getTime():inUseHttpRequestID;
	var unique = "httpreqid=" + requestid;
	if (strURL.indexOf("?") != -1) 
	{
		strURL += "&" + unique;
	}
	else
	{
		strURL += "?" + unique;
	}

	//-- onload type (dpendant on ie or moz
	if (window.XMLHttpRequest)
	{
		if (window.ActiveXObject) 
		{
			//-- IE 7
			phphttp.onreadystatechange = handle_php_response;
		}
		else
		{
			//-- mozilla
			phphttp.onload = handle_php_response;
		}
	}
	else
	{
		//--IE 6
		phphttp.onreadystatechange = handle_php_response;
	}

	
	//--
	//-- data is too big for GET so send it in bits to the server
	if(strURL.length>2082)
	{
		send_data_params_to_server(strURL, requestid);

		//-- send only req id as other params already sent
		var arrURL  = strURL.split("?");
		strURL = arrURL[0];
		strURL += "?" + unique;
	}

	phphttp.open("GET",strURL,!boolWait);
	try
	{
		phphttp.send(null);
	}
	catch(e)
	{
		strPHPresult = "<center style='color:#D40000'>" + e.description + "(" + origURL + ").<BR>Please contact your supportworks administrator.</center>";
	}

	boolSessionTimeout=false;
	//-- check if session failed
	if(strPHPresult.indexOf("SESSION:")==0)
	{
		//-- session error
		boolSessionTimeout=true;
		arrInfo = strPHPresult.split(":");
		document.location.href="index.php?errormsg=" + arrInfo[1];
	}
	else if(strPHPresult.indexOf("ERROR:")==0)
	{
		arrInfo = strPHPresult.split(":");
		strPHPresult = "<center style='color:#D40000'>" + arrInfo[1] + "</center>";
	}

	return strPHPresult;
}

//--
//-- given a url take its params and send to server to be stored in session array var
function send_data_params_to_server(strURL, requestid)
{
	var arrURL  = strURL.split("?");
	strURL = arrURL[0];

	var postParams = arrURL[1];
	var arrParams = postParams.split("&");
	var arrSendParams = new Array();

	var strSendVars = "";
	for(var x=0;x<arrParams.length;x++)
	{
		//-- check if single param is bigger than send limit - if so 
		if((arrParams[x].length + 100)>2082)
		{
			var arrInfo = arrParams[x].split("=");
			var varName = arrInfo[0];
			var dataValue = arrInfo[1];

			//-- need to send this param in chunks
			var z=0;
			var sendValue = dataValue.substring(z,1024);
			while (sendValue!="")
			{
				var strResult = app.run_php("php/xmlhttp/store_get_variables.php?" + varName + "=" + sendValue,true,requestid);
				z=z+1024;
				sendValue = dataValue.substring(z,z+1024);
			}

			//-- as this has been sent need to position array to next param 
			x++;
		}

		if(arrParams[x].indexOf("httpreqid")!=-1)continue;

		//-- append params
		if(strSendVars!="")strSendVars+="&";
		strSendVars += arrParams[x];

		var y = x+1;
		if(y<arrParams.length)
		{
			//-- check if data + next param will break sending limit. if so send what we have and then start getting next set
			var strCheckLength = strSendVars.length + arrParams[x+1].length + 100;
			if(strCheckLength>2082)
			{
				//-- post data
				var strResult = app.run_php("php/xmlhttp/store_get_variables.php?" + strSendVars,true,requestid);
				strSendVars="";
			}
		}
	}

	if(strSendVars!="")
	{
		//-- last set of parameters
		var strResult = app.run_php("php/xmlhttp/store_get_variables.php?" + strSendVars,true,requestid);
		strSendVars="";
	}
}

//-- debugging functions
var strDebugLog = "";
function debug(strDebug)
{
	strDebugLog += strDebug + "\n\n";
}

function open_debug(strText)
{
	var newWin = window.open("");
	newWin.document.write("<html><body><pre>" + strText + "</pre></body></html>");
}