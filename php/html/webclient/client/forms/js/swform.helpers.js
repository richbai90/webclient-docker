var undefined;
var isIE  = (window.ActiveXObject);


//-- called when a form toolbar action is processed
function _toolbar_action(strID)
{
	//-- call code for form type
	app._CURRENT_JS_WINDOW = window;
	_swdoc_pointer._process_form_toolbar_action(strID);
}


function _qlc_saveas(strID)
{
	switch(strID)
	{
		case "saveqlc":
			//-- open qlc save as form
			app.OpenWebClientForm("_sys_qlc_saveas","","",true,"qlc",window,function(oForm)
			{
				if(oForm.document._saveas!="")
				{
					if(oForm.document._overwrite)
					{
						//-- delete existing qlc
						var xmlmc = new XmlMethodCall();
						xmlmc.SetParam("name",oForm.document._saveas);
						xmlmc.SetParam("mailbox",oForm.document._saveasgroup);
						if(!xmlmc.Invoke("helpdesk","quicklogCallDelete"))
						{
							alert("Failed to replace the existing quick-log record. Please conact your Administrator.\n\n" + xmlmc.GetLastError())
							return false;
						}
					}
					
					//-- save a quicklog call form
					document._save_qlc(oForm.document._saveas,oForm.document._saveasgroup,oForm.document._savewf);
				}
			});
			break;
	}
}

function _workflow_action(strID)
{
	switch(strID)
	{
		case "wfmanage":
			//-- open manage form to add new items to call workflow
			var ipgs = document.getElementById("if_workflow").contentWindow._get_nextnew_pgs();
			var strParams = "_pgs="+ipgs+"&_callref="+document.opencall.callref+"&_tempworkflowtable=" + document._tempworkflowtable;
			app.OpenWebClientForm("_sys_cdf_manage_newworkflow","",strParams,true,"workflow",window,function(res)
			{
				document.getElementById("if_workflow").contentWindow._filter_workflow_list();
			});
			
			break;

		case "wfm_complete":
			document.getElementById("if_workflow").contentWindow._complete_item();
			break;
		case "wfaddtemplate":
			document.getElementById("if_workflow").contentWindow._add_existing_template();
			break;
		case "wfaddlist":
			document.getElementById("if_workflow").contentWindow._add_existing_worklist();
			break;
		case "wfnewitem":
			document.getElementById("if_workflow").contentWindow._create_new_workitem();
			break;
		case "wfnewlist":
			document.getElementById("if_workflow").contentWindow._create_new_worklist();
			break;
		case "wfrename":
			document.getElementById("if_workflow").contentWindow._rename_worklist();
			break;
		case "wfdelete":
			document.getElementById("if_workflow").contentWindow._delete_worklist_or_item();
			break;
		case "wfdelete":
			document.getElementById("if_workflow").contentWindow._delete_worklist_or_item();
			break;
		case "wfup":
			document.getElementById("if_workflow").contentWindow._move_worklist_or_item('up');
			break;
		case "wfdown":
			document.getElementById("if_workflow").contentWindow._move_worklist_or_item('down');
			break;
		case "wftoggle":
			document.getElementById("if_workflow").contentWindow._toggle_worklist_sequence();
			break;

			
	}
}


function _json_to_js(oJson,targetObject,castFunction)
{
	var undefined;
	if(oJson==null || oJson==undefined || targetObject==undefined)return;
	for(strKey in oJson)
	{
		if (typeof(oJson[strKey]) == "string")
		{
			targetObject[strKey] =(castFunction)?castFunction(oJson[strKey]):oJson[strKey];
		}
	}
}

//-- copy xml to js object so can jsut use doc.settings.tables.opencall.name ..
function _xml_to_js(oXML, targetObject, castFunction)
{
	var undefined;

	if(oXML==null || oXML==undefined || targetObject==undefined)return;
	var _array = new Array();
	var xmlChildren = oXML.childNodes; 
	var xmlChildChildren = new Array()
	var iLen = xmlChildren.length
	for(var i=0;i< iLen;i++)
	{
		if(xmlChildren[i].tagName==null) continue;

		xmlChildChildren = xmlChildren[i].childNodes;
		if(xmlChildChildren.length==1)
		{
			var varValue =(castFunction!=undefined)?castFunction(xmlChildChildren[0].nodeValue):xmlChildChildren[0].nodeValue;
			targetObject[xmlChildren[i].tagName] = varValue;
		}
	}
}


function GetWinWidth()
{
	if(app.isIE && !app.isIE10Above) return + $(".sizeHoriz").outerWidth();
	return jqWin.innerWidth();
}
 
function GetWinHeight()
{
	if(app.isIE && !app.isIE10Above) return + $(".sizeVert").outerHeight();
    return jqWin.innerHeight();
}

//-- casting functions
function _cBoolean(varValue)
{
	var bVal = (varValue=="1" || varValue==1 || varValue=="true" || varValue=="TRUE" || varValue ==true)?true:false; 
	return bVal;

}
function _cNum(varValue)
{
	varValue--;varValue++;
	return varValue;

}

//-- 04.06.2004 - NWJ - Created - given node and html insert that html into the node (used for creating elements)
function insertBeforeEnd(node,html)
{
	if(node.insertAdjacentHTML)
	{
		node.insertAdjacentHTML('beforeEnd', html);
		return node.children[node.children.length-1];
	}
	else
	{
		//--
		//-- netscape way of inserting html ()
		var r = node.ownerDocument.createRange();
		r.setStartBefore(node);
		var parsedHTML = r.createContextualFragment(html);
		return node.appendChild(parsedHTML);
	}
}


//--
//-- event handler helper functions

//-- handle mouse key down.
function _mousebtn(e) 
{
	//-- get event button
	var rightclick;
	if (!e) var e = window.event; //-- ie
	if (e.which) rightclick = (e.which == 3); //-- mozilla
	else if (e.button) rightclick = (e.button == 2);

	if (rightclick) 
	{
		return 2;
	} 
	else 
	{
		return 1;
	}
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


//-- helper - open form for listbox, sqllist or resolve picklist
function _open_control_form(strFormName,strMode,strKey, strParams,callback)
{
	var strType = "Form";
	if(strFormName.indexOf(".")>0)
	{
		strType = strFormName.split(".")[0];
		strFormName = strFormName.split(".")[1];
	}
	
	if(strType=="Form")
	{
		strType="stf";
		app._open_application_form(strFormName, strType, strKey, strParams,true, strMode, callback,null,window);
	}
	else if(strType=="SystemForms")
	{
		if(strFormName=="CallDetails")
		{
			app.global.OpenCallDetailsView(strKey);
		}
		else if(strFormName=="NewCall")
		{
			//app.LogNewCall(strKey);	
		}
	}

}


//--
//-- file upload helpers
var __arr_fileupload_callbacks = new Array();
function fileuploadcomplete(iResult,strFileName,strFileSize,strFileDate,strCallBackID,strWebRootPath,strOrigFileName)
{
	if(__arr_fileupload_callbacks[strCallBackID])
	{
		__arr_fileupload_callbacks[strCallBackID].filelist._onfileuploaded(iResult,strFileName,strFileSize,strFileDate,strWebRootPath,strOrigFileName);
	}
	else
	{
		if(iResult!='1')
		{
			alert(iResult);			
		}
	}
}



//-- given image settings for control get the image path - (for menu buttons where they use image lists)
function _get_sw_application_image(swFC)
{
	var strImagePath = "";
	//alert(swFC.eventButtonIcon)
	if(swFC.eventButtonIcon!="")
	{
		if(swFC.eventButtonIcon.indexOf("ImageList=")>-1)
		{
			//-- use image list path
			var arrImg = swFC.eventButtonIcon.split(";");
			var strImageList = arrImg[0].split("=")[1];
			var intIconIndex = arrImg[1].split("=")[1];
			//-- if exists use it
			strImagePath = app._root + "client/images/imagelists/" + strImageList +"/"+intIconIndex+".png";
			//alert(strImagePath)
		}
		else if(!isNaN(swFC.eventButtonIcon))
		{
			strImagePath = app._root + "client/images/imagelists/"+swFC.eventButtonIcon+".png";
		}
		else
		{
			//-- user http
			strImagePath = _parse_context_vars(swFC.eventButtonIcon);
		}
	}

	return strImagePath;
}


//--
//-- formatters

//-- given value create either a db ready value (integer) or display ready value ($##.##)
function _get_sw_dbcurrency_from_value(strValue, bFormatted, bFromData, bFromUserEvent)
{
	//-- 13.09.2012 - 89518 - fixed value and formatting based on if value being set from user value change or swjs change 
	//--					  also added support for currency symbol (1.2.0 onwards)

	//-- set currencySymbol if not set
	if(lsession.currencySymbol==undefined) lsession.currencySymbol=lsession.rightsjson.params.currencySymbol.substring(1);

	strValue = strValue+""
	strValue = strValue.replace(/[^0-9.]/g, ""); //-- remove alhpa chars except .


	if(isNaN(strValue))
	{
		if(!bFromData)alert("The format of the currency field is ####.## or ####");
		return (bFormatted)?lsession.currencySymbol + " 0.00":0;
	}

	if(bFromData)
	{
		//-- db stores 500.50 as 50050
		//-- so have to put . before lat two chars
		var strFirstPart = strValue.substring(0,strValue.length-2);
		var strEndPart = strValue.substring(strValue.length-2);
		if(bFormatted)
		{
			if(strFirstPart=="")strFirstPart ="0";
			if(strEndPart=="")strEndPart="00";
			return lsession.currencySymbol + " " + strFirstPart +"."+strEndPart;
		}
		else
		{
			return strValue;
		}
	}
	else
	{
		
		//-- user typed something in like 500 - so make it 500.00
		if(bFromUserEvent)
		{
			if(strValue.indexOf(".")==-1)
			{
				strValue += ".00";
			}
		}
		else
		{
			//--
			//-- from swjs code i.e. developer has done fld.value = 100; //-- which equals 1.00
			if(strValue.indexOf(".")==-1)
			{
				var strFirstPart = strValue.substring(0,strValue.length-2);
				var strEndPart = strValue.substring(strValue.length-2);
				if(strFirstPart=="")strFirstPart="0";
				strValue = strFirstPart +"."+strEndPart;
			}
		}

		var arrParts = strValue.split(".");
		if(arrParts.length>2)
		{
			if(!bFromData && bFormatted)alert("The format of the currency field is ####.## or ####");
			return (bFormatted)? lsession.currencySymbol + " 0.00":0; //-- invalid format
		}

		var pounds = arrParts[0];
		var cents = arrParts[1];
		if(pounds=="")pounds="0";
		if(cents=="")cents="0";

		if(isNaN(pounds))
		{
			if(!bFromData && bFormatted)alert("The format of the currency field is ####.## or ####");
			return (bFormatted)?lsession.currencySymbol + " 0.00":0; //-- invalid format 45.567
		}

		if(isNaN(cents) || cents>99)
		{
			if(!bFromData && bFormatted)alert("The format of the currency field is ####.## or ####");
			return (bFormatted)?lsession.currencySymbol + " 0.00":0; //-- invalid format 45.567
		}
		cents--;cents++;
		if(cents<10)cents = cents + "0";

		return (bFormatted)? lsession.currencySymbol + " " +pounds +"."+cents:(pounds+""+cents-0);
	}

}

function _getminutes_from_uservalue(strValue)
{
	if(strValue=="" || strValue==0) return 0;
	if(strValue<1) return 0;

	strValue +="";
	if(strValue.indexOf(":")>-1)
	{
		//-- has typed in something like ##:##
		var arrTime = strValue.split(":");
		var minHours = (arrTime[0]*60) -0;
		var minMinutes = arrTime[1] -0;
		strValue = minHours + minMinutes;
	}

	if(isNaN(strValue)) return 0;
	
	return strValue;
}

function _getseconds_from_uservalue(strValue,bFromData)
{

	if(strValue=="" || strValue==0) return 0;
	if(strValue<1) return 0;
	if(bFromData==undefined)bFromData=true;
	strValue +="";
	if(strValue.indexOf(":")>-1)
	{
		//-- has typed in something like ##:##
		var arrTime = strValue.split(":");
		var secHours = (arrTime[0]*3600) -0;
		var secMinutes = (arrTime[1]*60) -0;
		var secSeconds = 0;
		if(arrTime[2]!=undefined)secSeconds = arrTime[2] -0;
		strValue = secHours + secMinutes + secSeconds;
	}
	else
	{
		if(!bFromData)
		{
			//-- we assume user has typed in minutes
			strValue = strValue * 60;
		}
	}
	if(isNaN(strValue)) return 0;

	return strValue;
}

//-- minutes to hh:mm
function _format_minutetime_field(strValue)
{
	if(strValue=="" || strValue==0) return "0:00";
	if(strValue<1) return "0:00";

	strValue +="";
	if(strValue.indexOf(":")>-1)
	{
		//-- has typed in something like ##:##
		var arrTime = strValue.split(":");
		var minHours = (arrTime[0]*3600) -0;
		var minMinutes = (arrTime[1]*60) -0;
		strValue = minHours + minMinutes;
	}
	else
	{
		if(isNaN(strValue)) return "0:00";
	}

	var Hours=Math.floor(strValue/60); 
	var Minutes=strValue-(Hours*60); 

	if(Minutes<10) Minutes = "0" + Minutes;
	return Hours + ":" + Minutes;
}


//-- seconds to hh:mm:ss
function _format_secondtime_field(strValue)
{
	if(strValue=="" || strValue==0) return "0:00";
	if(strValue<1) return "0:00";

	strValue +="";
	if(strValue.indexOf(":")>-1)
	{
		//-- has typed in something like ##:##
		var arrTime = strValue.split(":");
		var secHours = (arrTime[0]*3600) -0;
		var secMinutes = (arrTime[1]*60) -0;
		var secSeconds = 0;
		if(arrTime[2]!=undefined)secSeconds = arrTime[2] -0;
		strValue = secHours + secMinutes + secSeconds;
	}

	var Hours=Math.floor(strValue/3600); 
	var Minutes=Math.floor(strValue/60)-(Hours*60); 
	var Seconds=strValue-(Hours*3600)-(Minutes*60); 

	if(Minutes<10) Minutes = "0" + Minutes;
	if(Hours<10) Hours = "0" + Hours;
	if(Seconds<10) Seconds = "0" + Seconds;
	return Hours + ":" + Minutes + ":" + Seconds;
}


//--
//-- show me item action functions
function _smi_recordproperties(jsonNode,callback)
{
	var strFormName = jsonNode.attrib1;
	var strKeyValue = jsonNode.attrib2;
	strKeyValue = _parse_context_vars(strKeyValue,false,false);
	if(strKeyValue=="")
	{
		alert("No record is selected.")
	}
	else
	{
		_open_control_form(strFormName,"edit",strKeyValue, "",callback);
	}
}

function _smi_openinventory(jsonNode)
{
	var strCompID = _parse_context_vars(jsonNode.attrib2);
	var strURL = _parse_context_vars("http://&[app.server]:&[app.httpport]/aw/html/viewer4");
	app.global.RunHIB(strURL,"compname",strCompID);
}

function _smi_openhib(jsonNode)
{
	var strURL = jsonNode.attrib1;
	var strVars = jsonNode.attrib2;

	var arrMoreInfo = strVars.split("-var");
	var strCompID = "";
	var arrVars = new Array();
	for(var x=1;x<arrMoreInfo.length;x++)
	{
		if(arrMoreInfo[x].indexOf("compname=")>-1)
		{
			var arrTemp = arrMoreInfo[x].split("compname=");
			strCompID = _parse_context_vars(app.trim(arrTemp[1]));
		}
	}

	if(strCompID!="")
	{
		app.global.RunHIB(_parse_context_vars(strURL),"compname",strCompID);
	}
}

function _smi_openurl(jsonNode)
{
	var strURL = jsonNode.attrib1;
	window.open(strURL,"","");
}

function _smi_swjs(jsonNode)
{
	app._CURRENT_JS_WINDOW = window;
	var strJS = jsonNode.attrib1;
	strJS = _prepare_swjscode_forwebclient(strJS);
	eval(strJS);
}

function _prepare_swjscode_forwebclient(strSwJS)
{
	//-- code is prepared by c++/php ddf export so just return code
	return strSwJS;
}

function _smi_treebrowserform(jsonNode,formType)
{
	var strSearchFormName = jsonNode.attrib1;
	app._open_application_form("treebrowserform."+strSearchFormName, "stf", "", "resolvemode=1", true, "add", function(oForm)
	{
		//-- if log call form then resolve 
		if(formType==_LCF || formType==_CDF)
		{
			if(oForm._swdoc._selected_treeformkey!="")
			{
				var strColumn = dd.tables[oForm._swdoc._selected_treeformtable].PrimaryKey;
				if(strColumn!="")
				{
					if(formType==_LCF)
					{
						document.ResolveRecord(oForm._swdoc._selected_treeformtable, strColumn, oForm._swdoc._selected_treeformkey, false);
					}
					else if(formType==_CDF)
					{
						document.ChangeRecord(oForm._swdoc._selected_treeformtable, oForm._swdoc._selected_treeformkey);
					}
					else
					{
						document.LoadRecordData("swdata", oForm._swdoc._selected_treeformtable, oForm._swdoc._selected_treeformkey);
					}
				}
			}
		}
	
	}, null,window);


}

function _smi_recordpicklistform(jsonNode,formType)
{

	var strPicklistFormName = jsonNode.attrib1;	
	var strFilter = jsonNode.attrib2;
	var strParams = "_filter=" + _parse_context_vars(strFilter,false,false);
	app._open_system_form("_wc_picklist", "picklist", strPicklistFormName, strParams, true, function(oForm)
	{
		if(oForm==null) return;
		if(oForm._swdoc._selected_picklistkey!="")
		{
			if(formType==_LCF)
			{
				document.ResolveRecord(oForm._swdoc._selected_table,document._tables[oForm._swdoc._selected_table.toLowerCase()]._keycolumn,oForm._swdoc._selected_picklistkey,false,true);
			}
			else if(formType==_CDF)
			{
				document.ChangeRecord(oForm._swdoc._selected_table, oForm._swdoc._selected_picklistkey);
			}
			else
			{
				document.LoadRecordData("swdata", oForm._swdoc._selected_table, oForm._swdoc._selected_picklistkey);
			}
		}		
	}, null,window);
}