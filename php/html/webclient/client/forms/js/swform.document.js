//-- START OF SWFORM.DOCUMENT.JS

var _LCF = "lcf";
var _CDF = "cdf";
var _STF = "stf";


//--
//-- supportworks document
function _swdocument()
{
	var oDoc = document;
	var lapp = app;
	app._CURRENT_JS_WINDOW = window;

	this.name = "";
	this.type = _formtype; //-- (lcf/std/cdf)
	this._doc = oDoc; //- -pointers to html document
	this.document = oDoc;

	this._form = new Array(); //-- special object that holds diff info i.e callrefs, updatetxt, preloadtype, attachments info etc

	//-- 20.10.2011 - store binding and element for listboxs that have extra items that are bound to other bindings i.e. [user customer sla]^&[userdb.priority]
	//-- when logging a call or saving a form loop these and ensure table binding is set correctly
	this._listbox_extraoptions_bindings = new Array();


	this._profilefilter = ""; //for lfc, cdf 
	this._callclass = ""; //-- for lcf anf cdf
	
	this.mainform = null;
	this.extform = null;
	this._load_extform = false;

	this._isloading = true;
	this._activeform = this.mainform; //-- pointer to the active form

	//-- name of temp workflow table (cdf and lcf only)
	this._tempworkflowtable = "";

	//-- special xmlmc container for holding returned form based xmlmc params for methods
	this._bXmlForm = false;
	this._wcmc = new Array();
	this._XmlFormService = "";
	this._XmlFormUpdateMethod = "";
	this._XmlFormAddMethod = "";
	this._XmlFormGetMethod = "";
	this._XmlFormKeyParam = "";


	//-- show me items
	this.showmeitems = new Array();

	//-- infobar
	this.infobar = new _sw_infobar();

	//-- private properties
	this._title = "";
	this._printtemplate = "";
	this._overide_master_save_table = "";
	this._overide_dsn = "";
	this._mastertable = null;
	this._exttable = null;
	this._tables = new Array(); //-- to hold data table records

	this._bSaveEnabled = false;
	this._useEmailDateToLogCall = false;

	this._params = new Array();

	if(info.__params==undefined)info.__params="";
	info.__params = info.__params + "";
	var arrParams = info.__params.split("&");
	var plen = arrParams.length;
	for(var x=0;x<plen;x++)
	{
		//-- store param and decode value as may have url encoded (esp if it has &amp)
		var iPos = arrParams[x].indexOf("=");
		var paramName = app.trim(arrParams[x].substring(0,iPos));
		var paramValue = arrParams[x].substring(iPos+1);

		try
		{
			this._params[paramName.toLowerCase()] = decodeURIComponent(paramValue); 
		}
		catch(e)
		{
			this._params[paramName.toLowerCase()] = paramValue; 
		}
	}

	//-- init type specific methods and atts
	switch(this.type)
	{
		case _LCF:
			_uniqueformid = "LCF" + _uniqueformid;
			app.debugstart("_swdocument:_swdoc_lcf","xmlform.php");	
			_swdoc_lcf(this);
			app.debugend("_swdocument:_swdoc_lcf","xmlform.php");	
			break;
		case _CDF:
			_uniqueformid = "CDF" + _uniqueformid;
			app.debugstart("_swdocument:_swdoc_cdf","xmlform.php");	
			_swdoc_cdf(this);
			app.debugend("_swdocument:_swdoc_cdf","xmlform.php");	
			break;
		default:
			_uniqueformid = "STF" + _uniqueformid;
			app.debugstart("_swdocument:_swdoc_stf","xmlform.php");	
			_swdoc_stf(this);
			app.debugend("_swdocument:_swdoc_stf","xmlform.php");	
			break;
	}

	//-- init data tables and settings
	//var start = new Date();
	this._initok = true;
	app.debugstart("_swdocument:_initialise_tables","xmlform.php");	
	if(!this._initialise_tables()) 
	{
		this._initok=false;
		return false;
	}
	app.debugend("_swdocument:_initialise_tables","xmlform.php");	

	app.debugstart("_swdocument:_initialise_settings","xmlform.php");	
	this._initialise_settings();
	app.debugend("_swdocument:_initialise_settings","xmlform.php");	

	//-- do mainform etc
	app.debugstart("_swdocument:_initialise_layout","xmlform.php");	
	this._initialise_layout();
	app.debugend("_swdocument:_initialise_layout","xmlform.php");	

	//-- put all this methods and properties into html document
	app.debugstart("_swdocument:copy pointer","xmlform.php");	
	for(varThing in this)
	{
		this._doc[varThing] = this[varThing];
	}
	app.debugend("_swdocument:copy pointer","xmlform.php");	
	return true;
}

//--
//-- private methods

//--
//-- show me items processing
//-- show me item constants
var SW_SHOWME_ACTION_SEPARATOR = 0;
var SW_SHOWME_ACTION_SQLQUER = 1;
var SW_SHOWME_ACTION_PROPERTIES = 2;
var SW_SHOWME_ACTION_SCRIPT = 3;
var SW_SHOWME_ACTION_BROWSER = 4;
var SW_SHOWME_ACTION_EXECPROGRAM = 5;
var SW_SHOWME_ACTION_SENDEMAIL = 6;
var SW_SHOWME_ACTION_SENDDOCUMENT = 7;
var SW_SHOWME_ACTION_INVENTORYDETAILS = 8;
var SW_SHOWME_ACTION_TREEBROWSERFORM = 9;        
var SW_SHOWME_ACTION_OPENURL = 10;
var SW_SHOWME_ACTION_RECORDRESET = 11;
var SW_SHOWME_ACTION_RUNHIB = 12;


_swdocument.prototype.IsLoading = function()
{
	return this._isloading;
}
_swdocument.prototype._initialise_showmeitems = function(oShowMeJson)
{
	if(oShowMeJson==null || oShowMeJson==undefined) return;
	this.showmeitems = oShowMeJson.action;
	if(this.showmeitems==undefined)this.showmeitems = new Array();
}

//-- if show me item exist ret /f - option to also execute
_swdocument.prototype._showmeitem_exists= function(strName,boolExec)
{
	var aLen = this.showmeitems.length;
	for(var x=0;x<aLen;x++)
	{
		var aNode = this.showmeitems[x];
		var strActionName = aNode.name;
		if(strActionName==strName)
		{
			if(boolExec)this._execute_showmeaction(aNode);
			return true;
		}
	}
	return false;
}


//-- save qlc info
_swdocument.prototype._save_qlc = function(strName,strGroup,intSaveWorkflow)
{
	//alert("create workflow " + strName +":"+ strGroup +":"+ intSaveWorkflow)

	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",strName);
	xmlmc.SetParam("formName",document._callclass);
	xmlmc.SetParam("callClass",document._callclass);
	xmlmc.SetParam("mailbox",strGroup);
	//-- loop opencall field values and set data for each one
	for(strColID in this._mastertable._columns)
	{
		var strFieldValue = document.opencall[strColID];
		if(strFieldValue!=undefined && strFieldValue != this._mastertable._columns[strColID].originalvalue)
		{
			//-- check if a binding and if value is "" then skip - i.e. it is a listbox like Site with other values like [Use Customer Site]^&[userdb.site]
			strFieldValue+=""; //-- cast
			if(strFieldValue.indexOf("&[")==0 && strFieldValue.charAt(strFieldValue.length-1)=="]")
			{
				var testValue = _parse_context_vars(strFieldValue);
				if(testValue=="" || testValue!=strFieldValue)
				{
					//-- do not save
					continue;
				}
			}

			var strFieldName = this._mastertable._name +"." + strColID;
			var strFieldXml = "<keyName>"+app.pfx(strFieldName)+"</keyName><keyValue>"+app.pfx(strFieldValue)+"</keyValue>";
			xmlmc.SetParamAsComplexType("quickLogKeyValues",strFieldXml);
		}
	}

	//-- loop through ext table
	if(this._exttable!=undefined && this._exttable!=null)
	{
		for(strColID in this._exttable._columns)
		{
			var strFieldValue = document[this._exttable._name][strColID];
			if(strFieldValue!=undefined && strFieldValue != this._exttable._columns[strColID].originalvalue)
			{
				var strFieldName = this._exttable._name +"." + strColID;
				var strFieldXml = "<keyName>"+app.pfx(strFieldName)+"</keyName><keyValue>"+app.pfx(strFieldValue)+"</keyValue>";
				xmlmc.SetParamAsComplexType("quickLogKeyValues",strFieldXml);
			}
		}
	}

	//-- loop update db table
	if (document.updatedb !=undefined && document.updatedb!=null)
	{
		for(strColID in document.updatedb._columns)
		{
			var strFieldValue = document.updatedb[strColID];
			if(strFieldValue!=undefined && strFieldValue != document.updatedb._columns[strColID].originalvalue)
			{
				var strFieldName = "updatedb." + strColID;
				var strFieldXml = "<keyName>"+app.pfx(strFieldName)+"</keyName><keyValue>"+app.pfx(strFieldValue)+"</keyValue>";
				xmlmc.SetParamAsComplexType("quickLogKeyValues",strFieldXml);
			}
		}
	}

	
	if(intSaveWorkflow==1)
	{
		var xmlmcTemp = new XmlMethodCall();
		xmlmcTemp.SetParam('_tablename',this._tempworkflowtable);
		if(!xmlmcTemp.Invoke("webclient","getTemporaryWorkflowRecords"))
		{
			
			alert("Failed to get temporary task records . Please contact your Administrator.");
		}
		else
		{
			//-- create recordset from xmlmc return data
			var oRS = new XmlSqlQuery();
			oRS.injectXmlmcRsData(xmlmcTemp);

			//-- loop task and set data for each one
			var strCurrentParentGroup = "";

			var strItemParentGroup = "";
			var intParentGroupID = 0;
			var strParentGroupType = "open";
			var strWorkItemListInstance = "";
			while(oRS.Fetch())
			{
				var intTaskID = app.pfx(oRS.GetValueAsNumber("taskid"));
				if(intTaskID==0)
				{
					//-- the start of a worklist group
					var useTaskID = 0;
					var pFlag = app.pfx(oRS.GetValueAsNumber("flags"));

					strItemParentGroup = app.pfx(oRS.GetValueAsString("parentgroup"));
					intParentGroupID = app.pfx(oRS.GetValueAsNumber("parentgroupsequence"));
					strParentGroupType = (pFlag==4104)?"sequential":"open";
			
					//-- start of new workItemList
					if (strCurrentParentGroup!=strItemParentGroup)
					{
						if(strCurrentParentGroup!="")	xmlmc.SetParamAsComplexType("workItemList",strWorkItemListInstance);

						strCurrentParentGroup=strItemParentGroup;
						//--
						var strWorkItemListInstance = "";
						strWorkItemListInstance += "<id>" + intParentGroupID + "</id>";
						strWorkItemListInstance += "<type>" + strParentGroupType + "</type>";
						strWorkItemListInstance += "<name>" + strItemParentGroup + "</name>";
					}
					continue;
				}

				//-- determine task id	
				useTaskID=(strParentGroupType=="open")?0:useTaskID+1;
				useTaskID = intTaskID;

				//-- add work item info
				var strWorkflowTaskXml = "<workItemInfo>";

					strWorkflowTaskXml += "<id>" +	useTaskID + "</id>";
					strWorkflowTaskXml += "<parentGroup>" + strItemParentGroup + "</parentGroup>";
					strWorkflowTaskXml += "<description>" + app.pfx(oRS.GetValueAsString("details")) + "</description>";
					strWorkflowTaskXml += "<time>" + app.pfx(oRS.GetValueAsString("compltbyx")) + "</time>";			
					strWorkflowTaskXml += "<assignToGroup>" + app.pfx(oRS.GetValueAsString("groupid")) + "</assignToGroup>";
					strWorkflowTaskXml += "<assignToAnalyst>" + app.pfx(oRS.GetValueAsString("analystid")) + "</assignToAnalyst>";

					//-- work out action by value
					var intActionBy = 0;
					var intFlags = oRS.GetValueAsString("flags");
					if(intFlags & 1)
					{
						intActionBy = 1;
					}
					else if(intFlags & 2)
					{
						intActionBy = 2;
					}
					strWorkflowTaskXml += "<actionBy>" + intActionBy + "</actionBy>";
					strWorkflowTaskXml += "<priority>" + app.pfx(oRS.GetValueAsString("priority")) + "</priority>";
					strWorkflowTaskXml += "<type>" + app.pfx(oRS.GetValueAsString("type")) + "</type>";	
					strWorkflowTaskXml += "<reminder>" + app.pfx(oRS.GetValueAsString("notifytime")) + "</reminder>";

					//-- set other flags
					var bRemindAssignee = (intFlags & 16)?1:0;
					var bRemindCallOwner = (intFlags & 32)?1:0;
					var bNotifyGroup  = (intFlags & 64)?1:0;
					strWorkflowTaskXml += "<remindAssignee>" + bRemindAssignee + "</remindAssignee>";
					strWorkflowTaskXml += "<remindCallOwner>" + bRemindCallOwner + "</remindCallOwner>";
					strWorkflowTaskXml += "<notifyGroup>" + bNotifyGroup + "</notifyGroup>";
			
				
				strWorkflowTaskXml +="</workItemInfo>";
				strWorkItemListInstance+= strWorkflowTaskXml;
			}

			//-- end if work item group so close tags
			if(strCurrentParentGroup!="")
			{
				xmlmc.SetParamAsComplexType("workItemList",strWorkItemListInstance);
			}
			

		}
	}


	if(!xmlmc.Invoke("helpdesk","quicklogCallAdd"))
	{
		alert("Failed to create quick-log record. Please conact your Administrator.\n\n" + xmlmc.GetLastError())
		return false;
	}
	else
	{
		alert("Quicklog ["+ strName + "] saved.");
	}
}

//-- load qlc xml data into form - there is no support for file attachments as html does not allow us to generate ref to local file
_swdocument.prototype._process_qlc_data = function(oQLCXML)
{
	//-- process field and data bindings
	var arrFields = oQLCXML.getElementsByTagName("quickLogKeyValues");
	var aLen = arrFields.length;
	for(var x = 0;x< aLen;x++)
	{
		var strBinding  = app.xmlNodeTextByTag(arrFields[x],"keyName");
		var strValue = app.xmlNodeTextByTag(arrFields[x],"keyValue");
		if(strValue=="undefined") continue;

		//-- if data binding
		if(strBinding.indexOf(".")!=-1)
		{
			//-- set document data value i.e. opencall.priority = ""
			document._set_data_value(strValue,strBinding,true,strValue,true);

			//-- set form element values
			if(document.mainform.elementsbybinding[strBinding.toLowerCase()]!=undefined)
			{
				for(strControlID in document.mainform.elementsbybinding[strBinding.toLowerCase()])
				{
					document.mainform.elementsbybinding[strBinding.toLowerCase()][strControlID]._value(strValue,"",false,false);
				}
			}
			//-- set any ext form values			
			if(document.extform.elementsbybinding[strBinding.toLowerCase()]!=undefined)
			{
				for(strControlID in document.extform.elementsbybinding[strBinding.toLowerCase()])
				{
					document.extform.elementsbybinding[strBinding.toLowerCase()][strControlID]._value(strValue,"",false,false);
				}
			}
	
	
			//-- reverse check related data i.e. opencall.cust_id -> userdb.keysearch			
			//document._reverse_resolve_relateddata(strBinding,strValue)
		}
	}

	//-- process workflow records
	if(this._tempworkflowtable !="")
	{
		var arrParentGroups = new Array();
		var arrTasks = oQLCXML.getElementsByTagName("workItemInfo");

		var intUsePGS = -1;
		var intAltTaskID = 0;
		var lastParentGroup = "";
		var atLen = arrTasks.length;
		for(var x = 0;x< atLen;x++)
		{
			var intUseTaskID = app.xmlNodeTextByTag(arrTasks[x],"id");
			var strParentGroup = app.xmlNodeTextByTag(arrTasks[x],"parentGroup");
			if(lastParentGroup!=strParentGroup)
			{
				intAltTaskID = 0;
				intUsePGS++;
				lastParentGroup=strParentGroup;
			}
			var intSequential = (app.xmlNodeTextByTag(arrTasks[x].parentNode,"type")=="open")?4096:4104
			if(intUseTaskID==0)
			{
				intAltTaskID++;
				intUseTaskID=intAltTaskID;
			}
			
			//-- flags are no longer used so i have to get boolean values and create flags
			var bNotifyGroupOnComplete = app.xmlNodeTextByTag(arrTasks[x],"notifyGroup");
			var bRemindCallOwner = app.xmlNodeTextByTag(arrTasks[x],"remindCallOwner");
			var bRemindAssignee = app.xmlNodeTextByTag(arrTasks[x],"remindAssignee");
			var bSequential = false
			var iFlags = 0;

			if(bRemindAssignee=="true") iFlags = iFlags + 16
			if(bRemindCallOwner=="true") iFlags = iFlags + 32
			if(bNotifyGroupOnComplete=="true")iFlags = iFlags + 64


			var strAnalystid = app.xmlNodeTextByTag(arrTasks[x],"assignToAnalyst");
			var strGroupid = app.xmlNodeTextByTag(arrTasks[x],"assignToGroup");
			var strDetails = app.xmlNodeTextByTag(arrTasks[x],"description");
			var iNotifytime = app.xmlNodeTextByTag(arrTasks[x],"reminder");
			var iCompltbyx = app.xmlNodeTextByTag(arrTasks[x],"time");
			if(iCompltbyx==0)iCompltbyx=3600;
			var strPriority = app.xmlNodeTextByTag(arrTasks[x],"priority");
			var strType = app.xmlNodeTextByTag(arrTasks[x],"type");


			//-- if parent group has not been processed then create
			if(arrParentGroups[strParentGroup]==undefined)
			{
				var strParams = "_type=list&_sequential="+intSequential+"&_table=" + top.document._tempworkflowtable + "&_worklistname=" + strParentGroup + "&_pgs=" + intUsePGS;
				var strURL = app.webroot + "/webclient/service/workflow/create_temp_workitem.php";
				var res = app.get_http(strURL, "swsessionid=" + app._swsessionid + "&"+ strParams, true, false,  null, null);
				if(res=="ok")arrParentGroups[strParentGroup] = true;
			}

			//-- 28.02.2011
			//-- use custom xmlmc service to insert info tempTasks:insertTemporaryWorkflow
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam('_tablename',this._tempworkflowtable);
			xmlmc.SetParam('taskid',intUseTaskID);
			xmlmc.SetParam('parentgroup',strParentGroup);
			xmlmc.SetParam('parentgroupsequence',intUsePGS);
			xmlmc.SetParam('flags',iFlags);
			xmlmc.SetParam('analystid',strAnalystid);
			xmlmc.SetParam('groupid',strGroupid);
			xmlmc.SetParam('details',strDetails);
			xmlmc.SetParam('notifytime',iNotifytime);
			xmlmc.SetParam('compltbyx',iCompltbyx);
			xmlmc.SetParam('priority',strPriority);
			xmlmc.SetParam('type',strType);
			if(!xmlmc.Invoke("webclient","insertTemporaryWorkflowItem"))
			{
				alert("Failed to add quicklog call task. Please contact your Administrator.");
			}

		} //-- for tasks	
	}//-- have wf table

}

//-- given opencall binding check if we have a related data table link - if so resolve
_swdocument.prototype._reverse_resolve_relateddata = function(strMasterBinding,strMasterValue)
{
	for(strTable in this._tables)
	{
		if(this._tables[strTable.toLowerCase()]._type==_RELATED)
		{
			var strMainTableCol = this._mastertable._name +"."+this._tables[strTable.toLowerCase()]._maindetailscolumn;
			if(strMainTableCol.toLowerCase()==strMasterBinding.toLowerCase())
			{
				var relKeyColumn = this._tables[strTable.toLowerCase()]._keycolumn;
				var strRelBinding = this._tables[strTable.toLowerCase()]._name +"."+relKeyColumn;
				var currentRelValue = document[strTable.toLowerCase()][relKeyColumn];			
				if(currentRelValue!=strMasterValue)
				{
					if(this.LoadRecordData)	
					{
						this.LoadRecordData("swdata",strTable,strMasterValue);
					}
					else
					{
						document._set_data_value(strMasterValue,strRelBinding,false);
					}
				}
			}
		}
	}
}

_swdocument.prototype._execute_showmeitem = function(strIndex, strName)
{
	if(this.showmeitems.length==0)return;

	if(strIndex>-1)
	{
		strIndex--;strIndex++;
		if(this.showmeitems[strIndex]!=undefined)
		{
			this._execute_showmeaction(this.showmeitems[strIndex]);
		}
	}
	else
	{
		//-- use name
		var aSiLen = this.showmeitems.length;
		for(var x=0;x<aSiLen;x++)
		{
			var aNode = this.showmeitems[x];
			var strActionName = aNode.name;
			if(strActionName==strName)
			{
				this._execute_showmeaction(aNode);
			}
		}
	}
}

_swdocument.prototype._execute_showmeaction = function(jsonActionNode)
{
	var strActionName =jsonActionNode.name;
	var actionType = jsonActionNode.id;
	actionType--;actionType++;
	switch(actionType)
	{
		case SW_SHOWME_ACTION_PROPERTIES:
			_smi_recordproperties(jsonActionNode,function(oForm)
			{
				if(oForm && oForm.recordsaved)
				{
					//-- check if keyvalue binding is part of this form
					var iStart = jsonActionNode.attrib2.indexOf("&[");
					if(iStart>-1)
					{
						var binding = jsonActionNode.attrib2.replace("&[","").replace("]","").split(".");
						var keyValue = _parse_context_vars(jsonActionNode.attrib2,false,false);
						document.ResolveRecord(binding[0], binding[1], keyValue, true,true);
					}
				}
			});
			break;
		case SW_SHOWME_ACTION_SCRIPT:
			_smi_swjs(jsonActionNode,this.type);
			break;
		case SW_SHOWME_ACTION_TREEBROWSERFORM:
			_smi_treebrowserform(jsonActionNode,this.type);
			break;
		case SW_SHOWME_ACTION_OPENURL:
			_smi_openurl(jsonActionNode,this.type);
			break;
		case SW_SHOWME_ACTION_RUNHIB:
			_smi_openhib(jsonActionNode,this.type);
			break;
		case SW_SHOWME_ACTION_INVENTORYDETAILS:
			_smi_openinventory(jsonActionNode,this.type);
			
			break;
		case SW_SHOWME_ACTION_BROWSER:
			//-- display a record browser form and allow user to select a record
			_smi_recordpicklistform(jsonActionNode,this.type);
			break;
		case SW_SHOWME_ACTION_RECORDRESET:
		case SW_SHOWME_ACTION_EXECPROGRAM:
		case SW_SHOWME_ACTION_SENDEMAIL:
		case SW_SHOWME_ACTION_SENDDOCUMENT:
		case SW_SHOWME_ACTION_SEPARATOR:
		case SW_SHOWME_ACTION_SQLQUER:
		default:
			alert("The show me action " + strActionName + " is not currently supported by the webclient.");
			break;
	}

}
//-- eof showmeitems processing

//--
//-- form xmlmc integration

//-- start of document loading xmldom record into forms 
_swdocument.prototype._load_fielddata_from_xmlmc = function (xmlRecord,strXmlBindingID)
{
	//-- given flat xml domnode and binding look for fields with binding of
	//-- x.<strXmlBindingID>.colname where colname if a known childnode tag in xmlRecord

	//-- would be good in system forms  like calendar appointment.
}
//-- eof document loading xmldom record into forms 

_swdocument.prototype._initialise_xmlmc_form = function (strService,strGetMethod,strAddMethod,strUpdateMethod,strKeyParam)
{
	document._bXmlForm = true;
	document._XmlFormService = strService;
	document._XmlFormUpdateMethod = strUpdateMethod;
	document._XmlFormAddMethod = strAddMethod;
	document._XmlFormGetMethod = strGetMethod;
	document._XmlFormKeyParam = strKeyParam;
	if(document._wcmc[strService]==undefined)
	{
		document._wcmc[strService] = new Array();
		//-- load schema and set field values
		var strURL = app._root +"client/wcxml/xmlmc.schema.xml";
		var oSchemaXML = app.get_http(strURL, "", true, true);

		//-- get service info
		var arrServiceXML = oSchemaXML.getElementsByTagName(strService);
		if(arrServiceXML.length==0)
		{
			alert("_initialise_xmlmc_form : There is no xmlmc service definition for ["+strService+"]. Please contact your administrator.");
			return false;
		}
		
		//--get method info
		var arrMethod = arrServiceXML[0].getElementsByTagName(strAddMethod);
		if(arrMethod.length==0)
		{
			alert("_initialise_xmlmc_form : There is no xmlmc service definition for ["+strService+":" + strAddMethod +"]. Please contact your administrator.");
			return false;
		}

		//-- setup fields
		var arrInputParams = arrMethod[0].getElementsByTagName("input");
		if(arrInputParams.length>0)
		{
			var aIpLen = arrInputParams[0].childNodes.length;
			for(var x=0;x<aIpLen;x++)
			{
				var xmlParam = arrInputParams[0].childNodes[x];
				var strParamName = xmlParam.tagName;
				if(strParamName!=undefined && strParamName!="")
				{
					var bComplex = false;
					var pType = xmlParam.getAttribute("type");
					var defValue = xmlParam.getAttribute("default");
					var strConv = xmlParam.getAttribute("conversion");
					var initValue = "";
					if(defValue!=null || defValue!=undefined)
					{
						initValue=defValue;
					}
					else
					{
						switch(pType.toLowerCase())
						{
							case "int":
								initValue=0;
								break;
							case "bool":
								initValue=0;
								break;
							case "complex":
								//-- if node has child elements we need to  turn field into an object i.e. _wcmc.<rec>.<field>.<childfield>
								var complexObject = new Object();
								complexObject._complicated = true;

								var xmlComplexParams = xmlParam.childNodes;
								for(var y=0;y<xmlComplexParams.length;y++)
								{
									bComplex=true;
									var xmlComplexParam = xmlComplexParams[y];
									var strComplexParamName = xmlComplexParam.tagName;
									var strComplexConv = xmlComplexParam.getAttribute("conversion");
									if(strComplexParamName!=undefined && strComplexParamName!="")
									{
										var pComplexType = xmlComplexParam.getAttribute("type");
										var defComplexValue = xmlComplexParam.getAttribute("default");
										var initComplexValue = "";
										if(defComplexValue!=null || defComplexValue!=undefined)
										{
											initComplexValue=defComplexValue;
										}
										else
										{
											switch(pComplexType.toLowerCase())
											{
												case "int":
												case "bool":
													initComplexValue=0;
													break;
											}
										}
									
										//-- just add to root level
										if(strComplexConv!="" && strComplexConv!=null)
										{
											initComplexValue = this._FormXmlmcValueConversion(strComplexConv,initComplexValue)
										}
										document._wcmc[strService][strComplexParamName.toLowerCase()] = initComplexValue
									}
								}
								break;
						}
					}					
					//-- set rec value
					if(!bComplex)
					{
						if(strConv!="" && strConv!=null) initValue = this._FormXmlmcValueConversion(strConv,initValue)
						document._wcmc[strService][strParamName.toLowerCase()] = initValue;
					}
				}
			}
		}
	}


	return true;
}

_swdocument.prototype._FormXmlmcValueConversion = function(strConversion, varValue)
{
	if(strConversion==null)return varValue;

	var arrInfo = strConversion.split(":");
	var strType = arrInfo[0];
	if(strType=="replace")
	{
		return app.string_replace(varValue,arrInfo[1],arrInfo[2],true);
	}
}

_swdocument.prototype._FormXmlmcLoadData = function(strKey)
{
	var arrInputParams = new Array();
	if(document._XmlFormKeyParam.indexOf("::")!=-1)
	{
		var arrP = document._XmlFormKeyParam.split("::");
		var arrK = strKey.split("::");
		for(var x=0;x<arrP.length;x++)
		{
			if(arrK[x]=="")
			{
				//-- missing part of pk so assuming inserting - exit
				return;
			}
			arrInputParams[arrP[x]] = arrK[x];
		}
	}
	else
	{
		arrInputParams[document._XmlFormKeyParam] = strKey;
	}
	document._FormXmlmc(document._XmlFormService,document._XmlFormGetMethod, arrInputParams);
}

_swdocument.prototype._FormXmlmcSaveData = function(arrParams)
{
	var strMethod = (_formmode=="add")?document._XmlFormAddMethod:document._XmlFormUpdateMethod;
	if(document._FormXmlmc(document._XmlFormService,strMethod, arrParams))
	{
		//-- save ok so reload data and refresh form fields and call user defined event
		_formmode="edit";
		if(document._XmlFormKeyParam.indexOf("::")!=-1)
		{
			//-- dual key
			var keyvalue = "";
			var arrKey = document._XmlFormKeyParam.split("::");
			for(var x=0;x<arrKey.length;x++)
			{
				if(x>0)keyvalue+="::";
				keyvalue+=document._wcmc[document._XmlFormService][arrKey[x].toLowerCase()];
			}
		}
		else
		{
			var keyvalue = document._wcmc[document._XmlFormService][document._XmlFormKeyParam.toLowerCase()];
		}

		this._FormXmlmcLoadData(keyvalue);
		this._RefreshXmlmcFormValues();
		this._EnableSave(false);
		this._OnDataSaved();
	}
	else
	{
		return false;
	}
}

_swdocument.prototype._FormXmlmc = function (strService,strMethod, arrParams)
{
	if(arrParams==undefined) arrParams = new Array();

	var strURL = app._root +"client/wcxml/xmlmc.schema.xml";
	var oSchemaXML = app.get_http(strURL, "", true, true);

	//-- get service info
	var arrServiceXML = oSchemaXML.getElementsByTagName(strService);
	if(arrServiceXML.length==0)
	{
		alert("_GetXmlmc : There is no xmlmc service definition for ["+strService+"]. Please contact your administrator.");
		return false;
	}
	
	//--get method info
	var arrMethod = arrServiceXML[0].getElementsByTagName(strMethod);
	if(arrMethod.length==0)
	{
		alert("_GetXmlmc : There is no xmlmc service definition for ["+strXmlmcCall+"]. Please contact your administrator.");
		return false;
	}

	//-- new xmlmc
	var xmlmc = new XmlMethodCall();

	//-- get and check input values
	var intIncludeDataTags = arrMethod[0].getAttribute("includedatatags");
	if(intIncludeDataTags==null || intIncludeDataTags=="")intIncludeDataTags=0;

	var arrInputParams = arrMethod[0].getElementsByTagName("input");
	if(arrInputParams.length>0)
	{
		for(var x=0;x<arrInputParams[0].childNodes.length;x++)
		{
			var xmlParam = arrInputParams[0].childNodes[x];
			var strParamName = xmlParam.tagName;
			var strConv = xmlParam.getAttribute("conversion");
			if(strParamName!=undefined && strParamName!="")
			{
				var boolComplex=false;
				//-- use passed in value or get value from form
				if(arrParams[strParamName]!=undefined)
				{
					var strValue = arrParams[strParamName];
					document._wcmc[strService][strParamName.toLowerCase()] = strValue;				
				}
				else
				{
					//-- get values from x.
					var intReq = xmlParam.getAttribute("required");
					var type = xmlParam.getAttribute("type");
					var strValue = document._wcmc[strService][strParamName.toLowerCase()];

					//-- if it is a required number and value is not set then set it
					if((type=="bool" || type=="int") && intReq=="1")
					{	
						if(strValue==null || strValue=="")strValue=0;
					}
					else if(type=="complex")
					{
						boolComplex=true;
						var complexType = type = xmlParam.getAttribute("complextype");
					}
					else
					{
						if(strValue==null || strValue=="")
						{
							//-- check if param is required
							if(intReq=="1")
							{
								alert("_GetXmlmc : The parameter [" + strParamName + "] is a mandatory parameter. Please contact your administrator.");
								return false
							}

							//-- do not set param continue loop
							continue;
						}
					}
				}

				//-- param was a complex type so get its other information
				if(boolComplex)
				{
					if(complexType=="embeddedFileAttachment")
					{
						xmlmc.SetComplexValue(strParamName,"fileData", strValue);
					}
					else
					{
						//-- set complex values for complex type - get children and set values
						for(var y=0;y<xmlParam.childNodes.length;y++)
						{
							var strChildParamName = xmlParam.childNodes[y].tagName;
							if(strChildParamName!=undefined && strChildParamName!="")
							{
								//-- get values from x.
								var strConv = xmlParam.childNodes[y].getAttribute("conversion");
								var intReq = xmlParam.childNodes[y].getAttribute("required");
								var type = xmlParam.childNodes[y].getAttribute("type");
								var strComplexValue = document._wcmc[strService][strChildParamName.toLowerCase()];

								//-- if it is a required number and value is not set then set it
								if((type=="bool" || type=="int") && intReq=="1")
								{	
									if(strComplexValue==null || strComplexValue=="")strComplexValue=0;
								}
								else
								{
									if(strComplexValue==null || strComplexValue=="")
									{
										//-- check if param is required
										if(intReq=="1")
										{
											alert("_GetXmlmc : The parameter [" + strParamName + ":"+strChildParamName+"] is a mandatory parameter. Please contact your administrator.");
											return false
										}

										//-- do not set param continue loop
										continue;
									}
								}

								//-- set param
								if(strConv!="" && strConv!=null) 
								{
									strComplexValue = this._FormXmlmcValueConversion(strConv,strComplexValue)
								}
								xmlmc.SetComplexValue(strParamName,strChildParamName,strComplexValue);

							}//-- if have param name
						}//-- eof for loop
					}//-- complex type
				}
				else
				{
					//-- set param
					if(strConv!="" && strConv!=null) 
					{
						strValue = this._FormXmlmcValueConversion(strConv,strValue);
					}
					xmlmc.SetParam(strParamName, strValue);
				}

			}
		}
	}
	
	if(xmlmc.Invoke(strService,strMethod,intIncludeDataTags))
	{
		//-- now get return params and populate any bindings
		var arrOutParams = arrMethod[0].getElementsByTagName("output");
		if(arrOutParams.length>0)
		{
			for(var x=0;x<arrOutParams[0].childNodes.length;x++)
			{
				//-- mem contain so can access in forms like document._wcmc.knowledgebase.tile
				if(document._wcmc[strService]==undefined)document._wcmc[strService] = new Array();

				var xmlParam = arrOutParams[0].childNodes[x];
				var strParamName = xmlParam.tagName;
				var strConv = xmlParam.getAttribute("conversion");
				if(strParamName!=undefined && strParamName!="")
				{
					//-- check if param is complex and has children
					var bComplex = false;
					if(xmlParam.getAttribute("type")=="complex")
					{
						var arrChildParams = xmlmc.xmlDOM.getElementsByTagName(strParamName);
						arrChildParams = arrChildParams[0].childNodes;
						for(var y=0;y<arrChildParams.length;y++)
						{
							//-- for each complex child add to root of parent - we assume any xmpmc method used to populate form bindings only ever has one instance of complex type
							var strComplexParamName = arrChildParams[y].tagName;
							var strComplexConv = xmlParam.childNodes[y].getAttribute("conversion");
							if(strComplexParamName!=undefined && strComplexParamName!="")
							{
								bComplex=true;
								var varComplexValue = app.xmlText(arrChildParams[y]);

								if(strComplexConv!="" && strComplexConv!=null)
								{
									varComplexValue = this._FormXmlmcValueConversion(strComplexConv,varComplexValue);
								}

								document._wcmc[strService][strComplexParamName.toLowerCase()] = varComplexValue;				
							}
						}
					}

					//-- set doc level pointer for non complex params
					if(!bComplex)
					{
						var varValue = xmlmc.GetParam(strParamName);
						if (xmlParam.getAttribute("type")=="bool")
						{
							varValue = (varValue=="true")?1:0;
						}
			
						if(strConv!="" && strConv!=null)varValue = this._FormXmlmcValueConversion(strConv,varValue);
						document._wcmc[strService][strParamName.toLowerCase()] = varValue;				
					}
				}
			}
		}
		return true;
	}
	else
	{
		alert(xmlmc.GetLastError());
		return false;
	}
}

_swdocument.prototype._RefreshXmlmcFormValues = function (bInternal)
{
	var strMatch = "x." + document._XmlFormService;
	for(strControlID in document.mainform.boundelements)
	{
		if(document.mainform.boundelements[strControlID].binding.indexOf(strMatch.toLowerCase())==0)
		{
			var arrI = document.mainform.boundelements[strControlID].binding.toLowerCase().split(".");
			this.mainform.boundelements[strControlID]._value(document._wcmc[document._XmlFormService][arrI[2]]);

			//-- if formode is edit and element is bound to keycol then disabled
			if(_formmode=="edit" && arrI[2].toLowerCase()==document._XmlFormKeyParam.toLowerCase())
			{
				this.mainform.boundelements[strControlID]._enable(false);
			}
		}
	}
}

_swdocument.prototype._SetXmlmcFormValue = function (strBinding,strValue)
{
	for(strControlID in document.mainform.boundelements)
	{		
		if(document.mainform.boundelements[strControlID].binding.indexOf(strBinding.toLowerCase())==0)
		{
			document.mainform.boundelements[strControlID]._value(strValue);
		}
	}
}

_swdocument.prototype._GetXmlmcFormValue = function (strBinding)
{
	for(strControlID in document.mainform.boundelements)
	{
		if(document.mainform.boundelements[strControlID].binding.indexOf(strBinding.toLowerCase())==0)
		{
			return document.mainform.boundelements[strControlID].value;
		}
	}
	return null;
}
//-- eof xmlmc integration


_swdocument.prototype._initialise_settings = function()
{
	var jsonSettings = _swDocumentJson.espForm.configuration.settings;
	var jsonOptions = _swDocumentJson.espForm.configuration.settings.options;

	//-- set title here - as may have something like &[opencall in it]
	this._title = jsonSettings.title;

	//-- print template
	this._printtemplate = (jsonSettings.printTemplates)?jsonSettings.printTemplates.printTemplate:"";

	//-- process showmeitems
	this._initialise_showmeitems(_swDocumentJson.espForm.configuration.showMeItems)
	
	if(_formtype==_CDF || _formtype==_LCF)
	{
		var bHideToolBar =(jsonOptions.hideToolbar=="true")?true:false;
		var bHideMenuBar =(jsonOptions.hideMenubar=="true")?true:false;
		
		this._useEmailDateToLogCall = (jsonOptions.useEmailDateToLogCall=="true")?true:false;

		this._callclass = jsonSettings.callClass;

		this._profilefilter = jsonSettings.profileFilter;
		if(this._profilefilter==undefined)this._profilefilter="";
	}
	else
	{
		var bHideToolBar =(jsonOptions.showToolbar!="true")?true:false;
		var bHideMenuBar =(jsonOptions.showMenubar!="true")?true:false;
	}

	if(bHideMenuBar)
	{
		//-- hide menu bar - not implemented yet
	}

	//-- !!! webclent xml has this wrong way round showToolbar referes to status bar and vice versa - defect !!!
	if(bHideToolBar)
	{
		//-- hide toolbar bar
		document.getElementById("_tr_toolbar").style.display="none";
		_form_toolbar_holder.style.display="none";
	}
	else
	{
		var strToolBarType = _formtype;
		if(_formtype.indexOf("_system")!=-1)
		{
			strToolBarType = "stf";
		}

		if(app.__arr_application_toolbar_html[strToolBarType]!=undefined)_form_toolbar_holder.innerHTML = app.__arr_application_toolbar_html[strToolBarType];
		document.getElementById("_tr_toolbar").style.display="";
		_form_toolbar_holder.style.display="block";

		if(this._setup_toolbar_buttons)
		{
			this._setup_toolbar_buttons(jsonOptions);
		}
	}

	if(jsonOptions.showMassageBar=="true")
	{
		//-- currenty we do not support message bar
	}

	if(_formtype!=_CDF && _formtype!=_LCF) 
	{
		document.getElementById("_tr_tabbar").style.display="none";
		document.getElementById('_form_tabcontrol').style.display='none';
		return;
	}
	else
	{
		document.getElementById("_tr_tabbar").style.display="block";
		document.getElementById('_form_tabcontrol').style.display='block';
		if(!app.isIE)
		{
			//-- expand tab control ab holder so border goes all the way across
			document.getElementById("_tr_tabbar_td").style.width=document.getElementById("if_mainform").offsetWidth;
		}
	}

	//-- allow ext details
	this._load_extform = false;
	if(jsonOptions.showExtendedDetails=="true") 
	{
		var extOpts = jsonOptions.extendedDetailsTable;
		var strTabName = _parse_context_vars(extOpts.title);
		document.getElementById('_tc_extform').innerHTML = strTabName;
		document.getElementById('_tc_extform').style.display='inline';
		this._load_extform = true;
	}

	//-- allow workflow 
	if(jsonOptions.showWorkflow=="true" || jsonOptions.showTasks=="true") 
	{
		//-- disable for preview one
		document.getElementById('_tc_workflow').style.display='block';
	}

	//-- allow file attachments
	if(jsonOptions.showFileAttachments=="true" || jsonOptions.showFileAttactments=="true") 
	{
		document.getElementById('_tc_files').style.display='block';
	}

	//-- show call diary
	if(jsonOptions.showActions=="true") 
	{
		document.getElementById('_tc_diary').style.display='block';
	}

	//-- allow custom html
	if(jsonOptions.showCustomHtmlTab=="true") 
	{
		var htmlOpts = jsonOptions.customHtmlTab;
		if(htmlOpts)
		{
			document.customHtmlTab = htmlOpts;
			document.getElementById('_tc_www').innerHTML = _parse_context_vars(htmlOpts.name);
			document.getElementById('_tc_www').style.display='inline';
		}
	}

	//-- show close call form - for lfc - not currently supported
	if(jsonOptions.howCloseDetails=="true") 
	{
		
	}

}

_swdocument.prototype._initialise_tables = function()
{
	var strName = "";


	//-- no table associated to form
	if(_swDocumentJson.espForm.configuration.tables==undefined)
	{
		return true;
	}

	var arrTables = _swDocumentJson.espForm.configuration.tables.table;
	if(arrTables==undefined)
	{
		return true; //-- no tables
	}

	//-- for forms with just one table
	if(arrTables.length==undefined)arrTables = new Array(arrTables);


	var jsonSchema = eval("("+ app._jsonSchemaString +")");
	for(var x=0;x<arrTables.length;x++)
	{
		strName = arrTables[x].name;
		if(strName=="" || strName==undefined) continue;

		app.debugstart("_swdocument:_initialise_tables." + x,"xmlform.php");	
		aTable = new _swfTable(arrTables[x],this,jsonSchema.espDatabaseSchema.database.tables.table[app._arr_tablenames_by_pos[strName]].columns.column);
		app.debugend("_swdocument:_initialise_tables." + x,"xmlform.php");	

		if(aTable._initresult==false)
		{
			this.CloseForm();
			return false;
		}
		this._tables[strName] = aTable;
		this[strName] = this._tables[strName];
	}

	if(!this._check_data_permission())
	{
		this.CloseForm();
		return false;
	}
	return true;

}

_swdocument.prototype._get_data_value = function (strBinding, boolFormatted)
{
	var arrBinding = strBinding.split(".");
	var strTable   = arrBinding[0];
	var strColumn  = arrBinding[1];

	if(this._tables[strTable.toLowerCase()] && this._tables[strTable.toLowerCase()][strColumn.toLowerCase()])
	{
		return this._tables[strTable.toLowerCase()].columns[strColumn.toLowerCase()];
	}
	else
	{
		alert("_get_data_value : ["+strBinding+"]\n\nThe data binding does not exist. Please contact your Administrator")
	}
}


_swdocument.prototype._load_alt_sysform = function(strXmlFormName,strType,strPointerName)
{

	var strAltFormXMLURL = app._root  + "client/forms/_system/" + strType +"/" + strXmlFormName + ".json";
	var strRes = app.get_http(strAltFormXMLURL, "", true, false,  null, null);
	try
	{
		var jsonformdata = eval("(" + strRes + ");");	
	}
	catch (e)
	{
		return false;
	}

	//-- get xml for form document
	var jsonAltF = jsonformdata.espForm.layouts.layout[0];
	if(jsonAltF==null || jsonAltF==undefined)
	{
		return false;
	}

	this[strPointerName] = new _swform(strPointerName,jsonAltF, this,true,strRes);
	if(this[strPointerName]==null || this[strPointerName]==undefined)
	{
		return false;
	}
	else
	{
		//-- set mainform background colour
		var altformBG = jsonAltF.appearance.backgroundColor;
		try
		{
			this[strPointerName]._targetdocument.body.style.backgroundColor = altformBG;			
		}
		catch (e)
		{
		}
	}
	this[strPointerName]._jsonaltformdom = jsonAltF;
	return this[strPointerName];

/*
	this[strPointerName]._xmlaltformdom = xmlAltF;
*/
}


_swdocument.prototype._load_alt_form = function(strXmlFormName,strType,strPointerName)
{

	var strAltFormXMLURL = app._root  + app._applicationpath + "/_xml/prepared/" + strType +"/" + strXmlFormName + ".json";
	var strRes = app.get_http(strAltFormXMLURL, "", true, false,  null, null);
	try
	{
		var jsonformdata = eval("(" + strRes + ");");	
	}
	catch (e)
	{
		return false;
	}

	//-- get xml for form document
	var jsonAltF = jsonformdata.espForm.layouts.layout[0];
	if(jsonAltF==null || jsonAltF==undefined)
	{
		return false;
	}

	this[strPointerName] = new _swform(strPointerName,jsonAltF, this,true,strRes);
	if(this[strPointerName]==null || this[strPointerName]==undefined)
	{
		return false;
	}
	else
	{
		//-- set mainform background colour
		var altformBG = jsonAltF.appearance.backgroundColor;
		try
		{
			this[strPointerName]._targetdocument.body.style.backgroundColor = altformBG;			
		}
		catch (e)
		{
		}
	}
	this[strPointerName]._jsonaltformdom = jsonAltF;
	return this[strPointerName];

}

//-- private methods
_swdocument.prototype._initialise_layout = function ()
{
	var lapp = app;

	//-- init mainform
	var jsonMF = (_swDocumentJson.espForm.layout==undefined)?_swDocumentJson.espForm.layouts.layout[0]:_swDocumentJson.espForm.layout;
	if(jsonMF==null || jsonMF==undefined)
	{
		window.close();
		return;
	}

	app.debugstart("_swdocument:_initialise_layout._resizewindow","xmlform.php");	
	this._resizewindow(jsonMF);
	app.debugend("_swdocument:_initialise_layout._resizewindow","xmlform.php");	

	app.debugstart("_swdocument:_initialise_layout.new _swform('mainform')","xmlform.php");	
	this.mainform = new _swform("mainform",jsonMF, this);
	app.debugend("_swdocument:_initialise_layout.new _swform('mainform')","xmlform.php");	
	if(this.mainform==null || this.mainform==undefined)
	{
		window.close();
		return;
	}
	else
	{
		//-- set mainform background colour
		var mainformBG = jsonMF.appearance.backgroundColor;
		this.mainform._targetdocument.body.style.backgroundColor = mainformBG;
		this._activeform = this.mainform;
	}

	//-- init ext form if there is one
	var jsonEF = _swDocumentJson.espForm.extendedLayout;
	if(jsonEF==undefined)
	{
		this.extform = undefined;
	}
	else
	{
		app.debugstart("_swdocument:_initialise_layout.new _swform('extform')","xmlform.php");	
		this.extform = new _swform("extform",jsonEF,this);
		app.debugend("_swdocument:_initialise_layout.new _swform('extform')","xmlform.php");	
		var extformBG = jsonEF.appearance.backgroundColor;
		if(this.extform._targetdocument.body)
		{
			this.extform._targetdocument.body.style.backgroundColor = extformBG;
		}
		else
		{
			setTimeout("_setExtFormBG('"+extformBG+"')",2000);
		}
	}
}
//-- work around for when extform is not ready
function _setExtFormBG(strColor)
{
	try
	{
		extform._targetdocument.body.style.backgroundColor = strColor;		
	}
	catch (e)
	{
	}
}

//-- resize window to size of mainform + 100 + 50
_swdocument.prototype._resizewindow = function(oJsonForm)
{
	app.__cached_forms[_cacheformname].width = GetWinWidth();
	app.__cached_forms[_cacheformname].height = GetWinHeight();
	return;
}

//-- given an sqlquery that has been fetch - load record data into document as an alias - i.e. for system tables 
_swdocument.prototype._load_bespoke_record = function (rs, strTableAlias)
{
	//app.debug("Begin processing","swdocument","_load_bespoke_record");
	if(!this._tableExists(strTableAlias))
	{
		//app.debug("End processing : Failed.","swdocument","_load_bespoke_record");
		alert("_load_bespoke_record : the bespoke record [" + strTableAlias + "] has not been defined agaisnt this form. Please contact your Administrator");
		return false;
	}
	
	strTableAlias = strTableAlias.toLowerCase();

	if(rs._currentrow==-1)rs.Fetch();

	var y= rs.GetColumnCount();
	for(var x=0; x<y; x++ )
	{
		var strValue =  rs.GetValueAsString(x);
		var strColName = rs.GetColumnName(x);
		if(strColName.indexOf(".")>-1)
		{
			var arrColName = strColName.split(".");
			strColName = arrColName[1];
		}
		this._tables[strTableAlias]._columns[strColName] = new _swdcolumn(strColName, strValue, strValue,this._tables[strTableAlias]);
	}

	//app.debug("End processing : Success","swdocument","_load_bespoke_record");
	return true;
}

//-- get data records
_swdocument.prototype._loaddata = function (varKeyValue)
{
	//-- load master table - then when that is loaded, load related tables
	if(this._mastertable!=null)
	{
		if(varKeyValue!=undefined)this._keyvalue = varKeyValue;

		//-- likely we are in insert or browse mode.
		if(this._keyvalue=="") return;

		//-- handle loading of special tables (calltasks)
		var strUseTable = this._mastertable._name;
		var strUseDSN = this._mastertable._dsn;
		if(this._mastertable._name=="calltasks")
		{
			var strPFS = "1";
			if(this.GetArg('callref')!="")
			{
				//-- called from call detail
				var varKeyColName = "taskid:callref"; //-- record id'd by combination
				this._keyvalue = varKeyValue +":"+ this.GetArg('callref');
			}
			else
			{
				//-- called from log call 
				var varKeyColName = "sessionid:taskid:parentgroup"; //-- record id'd by combination
				this._keyvalue = this.GetArg('_table') +":"+ varKeyValue +":"+ this.GetArg('parentgroup');
				strUseDSN = "sw_systemdb";
				strUseTable = "wc_calltasks";
			}	
		}
		else
		{
			var varKeyColName = this._tables[this._mastertable._name]._keycolumn;
			var strPFS = (app.dd.tables[this._mastertable._name].columns[varKeyColName].IsNumeric())?"0":"1";
		}

		var strParams = "_mastertable=" + app.pfu(strUseTable);
		strParams += "&_masterdsn=" + app.pfu(strUseDSN);
		strParams += "&_mastervalue="+ app.pfu(app.trim(this._keyvalue));
		strParams += "&_masterkeycol=" + app.pfu(varKeyColName);
		strParams += "&_masterpfs=" + strPFS;

		//alert(strParams)
		var counter=1;
		for(strTable in this._tables)
		{
			if(this._tables[strTable.toLowerCase()]._type==_RELATED)
			{
				var varKeyColName = this._tables[strTable.toLowerCase()]._keycolumn;

				strParams += "&_relatedtable_"+counter+"=" + this._tables[strTable.toLowerCase()]._name;
				strParams += "&_relatedkeycol_"+counter+"="+ varKeyColName;
				strParams += "&_relatedforeigncol_"+counter+"=" + this._tables[strTable.toLowerCase()]._maindetailscolumn;
				//alert(this._tables[strTable.toLowerCase()]._maindetailscolumn)

				var intPFS = (app.dd.tables[strTable.toLowerCase()].columns[varKeyColName].IsNumeric())?"0":"1";
				strParams += "&_relatedpfs_"+counter+"=" + intPFS
				//alert(strParams)
				counter++;
			}
			else if(this._tables[strTable.toLowerCase()]._type==_EXTENDED)
			{
				strParams += "&_extendedtable="+ this._tables[strTable.toLowerCase()]._name;
				strParams += "&_extendedkeycol="  +this._tables[strTable.toLowerCase()]._keycolumn;
			}
		}
		//-- get json data	
		var strURL = app.webroot + "/webclient/service/form/getdata/json_index.php";
		app.debugstart("load form data get_http","xmlform.php");	
		var res = app.get_http(strURL, "swsessionid=" + app._swsessionid + "&"+ strParams, true, false);
		app.debugend("load form data get_http","xmlform.php");	
		this._ondatafetched(res);
	
	}
	else
	{
		this._ondatafetched("");
	}
}

//-- called when data is loaded
_swdocument.prototype._ondatafetched = function (strRes)
{
	if(strRes!="")
	{
		//-- form data returned - init table objects 
		app.debugstart("load form data ondatafetched","xmlform.php");	
		app.debugstart("load form data ondatafetched - create json","xmlform.php");	

		//-- escape new lines
		strRes = _regexreplace(strRes,"\n","\\n");
		try{
		var formdata = eval("(" + strRes + ");");
		}
		catch(e)
		{
			app.debugstart("load form data ondatafetched - formadata invalid");	
			alert("The returned form data could not be processed. Please contact your Administrator");
			document.CloseForm();
			return;
		}

		app.debugend("load form data ondatafetched - create json","xmlform.php");			

		for(var strTableName in formdata.tables)
		{
		
			app.debugstart("load form data ondatafetched - init table data for " + strTableName,"xmlform.php");	
			if(document._tables[strTableName.toLowerCase()]._initialise_jsondata(formdata.tables[strTableName])==false)
			{
				document.CloseForm();
			}
			app.debugend("load form data ondatafetched - init table data for " + strTableName,"xmlform.php");	
		}
		app.debugend("load form data ondatafetched","xmlform.php");	
	}
	//-- title may have binding in it
	document._init_title();
}

_swdocument.prototype._init_title = function ()
{
	//-- modify title
	var strTitle = this._title;

	if(this._mastertable != null)
	{
		if((_formmode=="add") && (this.type==_STF))
		{
			strTitle = "Add New " + strTitle;
		}
		else if(_formmode=="edit" && (this.type==_STF))
		{
			strTitle = "Update " + strTitle;
		}
	}
	else
	{
		strTitle = "" + strTitle;
	}
	document.SetTitle(_parse_context_vars(strTitle, false,true));
}

//-- check form master table perm
_swdocument.prototype._check_data_permission = function()
{
	var s = app.session;
	if(this._mastertable == null) return true
	if(_systemform)return true;

	if(this.type==_STF)
	{
		var iCheckAction = -1; _CAN_ADDNEW_TABLEREC:_CAN_UPDATE_TABLEREC;
		if (_formmode=="add")
		{	
			iCheckAction=_CAN_ADDNEW_TABLEREC;
		}
		else if(_formmode=="edit")
		{
			iCheckAction=_CAN_UPDATE_TABLEREC;
		}
		if(iCheckAction>-1)
		{
			if(s.CheckTableRight(this._mastertable._name,iCheckAction,true)!="") return false;
		}
	}
	return true;
}

//-- save data
_swdocument.prototype._save_data = function (intCloseForm)
{
	if(this._OnSaveData()==false) return false;

	//-- 03.03.2012 - defect 87565 - call prevalidate functions after the onsavedata
	if(!this._OnPreValidate())return false;

	if(this.type==_STF || this.type.indexOf("_system")==0)
	{
		//-- save standard data for normal form
		if(this._mastertable._savedata(true))
		{
			if(this._exttable!=null && this._exttable!=undefined)
			{
				//-- ensure ext table key col is set
				this._exttable._columns[this._exttable._keycolumn].originalvalue = "";
				this._exttable._columns[this._exttable._keycolumn].value = this._mastertable._columns[this._mastertable._keycolumn].value;
				_swdoc[this._exttable._name][this._exttable._keycolumn] = this._mastertable._columns[this._mastertable._keycolumn].value;

				this._exttable._savedata();
			}
		}
		else
		{
			return false;
		}
		//-- store primary key
		try
		{
			document[this._mastertable._name][this._mastertable._keycolumn] = this._mastertable._columns[this._mastertable._keycolumn].value;	
		}
		catch (e)
		{
		}
		
		this._on_data_saved();
	}
	else if(this.type==_CDF)
	{
		//-- call saved for call detail
		this._OnSaveCall();
	}
	else if(this.type==_LCF)
	{
		//-- call logged ok
	}

	return true;
}

//-- should be used for system forms only
_swdocument.prototype._delete_master_record = function ()
{
	var strTableName = (this._overide_master_save_table!="")?this._overide_master_save_table:this._mastertable._name;
	var strParams = "table=" + strTableName + "&dsn="+this._mastertable._dsn+"&keycol="+ this._mastertable._keycolumn + "&keyvalue=" + this._mastertable._keyvalue;
	var oQ = new SqlQuery();
	if(!oQ.WebclientStoredQuery("data/deleteRecord",strParams))
	{
		alert("_delete_master_record : failed to delete database record. Please contact your administrator.");
		return false;
	}
	window.close();
	return true;
}

_swdocument.prototype._on_data_saved = function ()
{
	_formmode = "edit";
	_recordsaved = true;
	if(this.type==_STF)
	{
		//-- re-load data	
		//alert("reload data for table ["+this._mastertable._name+"] keycol [" + this._mastertable._keycolumn + "] = " + document[this._mastertable._name][this._mastertable._keycolumn])
		_primary_key = document[this._mastertable._name][this._mastertable._keycolumn];
		this._loaddata(document[this._mastertable._name][this._mastertable._keycolumn]);
		this.UpdateFormFromData(undefined,true); //-- reload form data (as vpme scripts may have modded data)

		//this.ResetModiedFlag(this._mastertable._name)

		this._OnDataSaved();

	}
	else if(this.type==_CDF)
	{
		this.ResetModiedFlag("opencall");
		this._OnDataSaved();
	}
	else if(this.type==_LCF)
	{
		this.OnCallLoggedOK(nCallRef, dateRespondBy, dateFixBy, strCustName, strSla);
	}
	
}


//-- handle setting dual search field i.e userdb.firstname!surname - should only be used on log call forms (??)
_swdocument.prototype._set_dualdata_value = function (strValue,strBinding,bFromData)
{
	if(bFromData==undefined)bFromData=false;

	var arrBinding = strBinding.split(".");
	var strTable   = arrBinding[0];
	var strColumn  = arrBinding[1];
	var arrBind = strColumn.split("!")		

	if(this._tables[strTable.toLowerCase()]!=undefined)
	{
		var strColumnOne  = arrBind[0];
		var strColumnTwo  = arrBind[1];

		if(this._tables[strTable.toLowerCase()][strColumnOne]!=undefined && this._tables[strTable.toLowerCase()][strColumnTwo]!=undefined)
		{
			//-- a log call - so if table is a related table then resolve with pick list
			if(this.type == _LCF && this._tables[strTable.toLowerCase()]._type == _RELATED && !bFromData)
			{
				//-- call onresoverecord
				strValue = this._OnResolveRecord(strTable,strColumn,strValue,true);
				if(strValue == "")return false;
				this._resolve_record_from_dualdata_value(strTable,strColumnOne,strColumnTwo,strValue);
			}
		}
	}
}

//-- resolve record from dual fields
_swdocument.prototype._resolve_record_from_dualdata_value = function (strTable,strColumnOne,strColumnTwo,strValue)
{
	//-- 
	if(_bClosingForm)return;

	//-- do not resolve empty values
	if(strValue=="")return;

	if(!this._tableExists(strTable,true)) return;

	//-- split out value
	var arrValues = strValue.split(" ",2);
	var strValueOne = arrValues[0];
	var strValueTwo = arrValues[1];
	if (strValueTwo==undefined)strValueTwo=strValueOne;
	if(strValueOne=="")strValueOne = strValueTwo;
	
	//-- get filter one 
	if(app.dd.tables[strTable.toLowerCase()].columns[strColumnOne].IsNumeric())
	{
		if(isNaN(strValueOne))
		{
			alert('The column you are resolving against is numeric. Please enter a numeric value');
			return;
		}
		
		var strFilterOne = strColumnOne + '=' + strValueOne;
	}
	else
	{
		var strFilterOne = strColumnOne + " like '" + app.pfs(strValueOne) + "%'";
	}

	//-- create filter two of one and two values
	var strFilterTwo = "";
	if(strValueTwo==strValueOne)
	{
		if(app.dd.tables[strTable.toLowerCase()].columns[strColumnTwo].IsNumeric())
		{
			if(isNaN(strValueOne))
			{
				alert('The column you are resolving against is numeric. Please enter a numeric value');
				return;
			}
			
			strFilterTwo = strColumnTwo + '=' + strValueOne;
		}
		else
		{
			strFilterTwo = strColumnTwo + " like '" + app.pfs(strValueOne) + "%'";
		}
	}
	else
	{
		//-- col two has its own value
		if(app.dd.tables[strTable.toLowerCase()].columns[strColumnTwo].IsNumeric())
		{
			if(isNaN(strValueTwo))
			{
				alert('The column you are resolving against is numeric. Please enter a numeric value');
				return;
			}
			
			strFilterTwo += strColumnTwo + '=' + strValueTwo;
		}
		else
		{
			strFilterTwo += strColumnTwo + " like '" + app.pfs(strValueTwo) + "%'";
		}
	}

	var strOP = (strValueTwo==strValueOne)?" OR ":" AND ";
	var strFilter = "(" + strFilterOne + ")";
	if(strFilterTwo!="") strFilter += strOP +" (" + strFilterTwo + ")";

	//-- Execute SQL
	var rs = new SqlQuery();
	rs.WebclientStoredQuery("form/resolveRelatedTableRecord","table="+strTable+"&columnone="+strColumnOne+"&valueone="+strValueOne+"&columntwo="+strColumnTwo+"&valuetwo="+strValueTwo,true);
	if(rs.GetRowCount()==1)
	{
		//-- load record into form
		document._load_bespoke_record(rs,strTable);
		document.UpdateFormFromData(strTable,false);
		document._assign_mastertable_values(strTable);
		if(this._OnRecordResolved)this._OnRecordResolved(strTable);

		rs = null;
		return true;
	}
	else if (rs.GetRowCount()==0)
	{
		rs = null;
		MessageBox("There is no match found for the item you entered. Please click No to try again or Yes to create a new record",app.MB_YESNO,function(confirmed)
		{
			if(confirmed)
			{
				//-- popup new modal form for pick list
				var strParams = "fromlfcresolve=1&displaycolumn=_dual&interimvalue=" + strValue;

				_open_control_form(this._tables[strTable.toLowerCase()]._addrecordform,"add",strValue,strParams,function(res)
				{
					if(res.recordsaved)
					{
						//-- set value and display
						//alert("LFC Resove Record Created : " + res.newrecordkey);
						document.ResolveRecord(strTable, strColumn, res.newrecordkey, false,true);
					}
					else
					{
						document.UpdateFormFromData(strTable,false);
						return false;
					}
				
				});	
			}
			else
			{
				document.UpdateFormFromData(strTable,false);
				return false;
			}
		});
	}
	else
	{
		//-- more than one
		rs= null;

		//-- more than 1 record so show picklist
		if(this._tables[strTable.toLowerCase()]._picklist!="")
		{
			var strParams = "_filter=" + strFilter+ "&_resolvecolumn=" + strColumnOne + "&_resolvevalue=" + strValue;
			var oForm = app._open_system_form("_wc_picklist", "picklist", this._tables[strTable.toLowerCase()]._picklist, strParams, true, function(oForm)
			{
				if(oForm==null) return;
				//alert(oFor._swdoc._selected_picklistkey)

				if(oForm._swdoc._selected_picklistkey!="")
				{
					//-- selected record so resolve
					document.ResolveRecord(strTable,this._tables[strTable.toLowerCase()]._keycolumn,oForm._swdoc._selected_picklistkey,true,true);
				}
				else
				{
					document[strTable.toLowerCase()][strColumnOne] = "";
					document[strTable.toLowerCase()][strColumnTwo] = "";
					document.UpdateFormFromData(strTable,true);
					return false;
				}

			
			}, null,window);
		}
		else
		{
			alert("ResolveRecord : ["+strTable+"]\n\nThe data table does not have a valid picklist form. Please contact your Administrator");
		}
	}

}

//-- end of handling dual field
//--

_swdocument.prototype._is_binding_onrelatedtable = function(strBinding)
{
	var arrBinding = strBinding.split(".");
	var strTable   = arrBinding[0];
	
	return (this._tables[strTable.toLowerCase()]!=undefined && this._tables[strTable.toLowerCase()]._type == _RELATED);
}

//-- set and get data table values
_swdocument.prototype._set_data_value = function (strValue,strBinding,bFromData, strFormattedValue, boolQLC)
{
	
	if(_bClosingForm)return;
	if(bFromData==undefined)bFromData=false;
	if(boolQLC==undefined)boolQLC=false;

	//-- F0091871 - do not resolve fields while loading
	if(top.bDrawing && strValue!="" && this._is_binding_onrelatedtable(strBinding))
	{
		//-- store field and set after drawing finished - if a related table 
		top.arrResolveRelatedRecordDataAfterDraw[strBinding] = strValue;
		return false;
	}
		
	var arrBinding = strBinding.split(".");
	var strTable   = arrBinding[0];
	var strColumn  = arrBinding[1];

	//-- we are setting an xmlmc value
	if(strTable=="x")
	{
		var strService = strColumn;
		strColumn  = arrBinding[2];

		//-- mem contain so can access in forms like document._wcmc.knowledgebase.tile
		if(document._wcmc[strService]==undefined)
		{
			document._wcmc[strService] = new Array();
		}
		else if(document._wcmc[strService][strColumn.toLowerCase()]!=undefined && document._wcmc[strService][strColumn.toLowerCase()]==strValue)
		{
			//-- nothing has changed
			return;			
		}

		document._wcmc[strService][strColumn.toLowerCase()] = strValue;
		if(!bFromData)
		{
			//-- set form filters that may depend on this binding
			document._UpdateFormFiltersFromData(strBinding);
		}

		//-- enable save
		this._EnableSave(true);

		return;
	}

	//-- check for dual search
	if(strColumn.indexOf("!")!=-1)
	{
		this._set_dualdata_value(strValue,strBinding,bFromData)
		return;
	}

	var boolValidBinding = true;
	try
	{
		eval("var tmp = "+strBinding+";");		
	}
	catch (e)
	{
		//-- not a valid binding
		boolValidBinding = false;
	}

	//alert(strBinding +":"+boolValidBinding)

	if(boolValidBinding)
	{
		var strOldValue =tmp;
		
		if(strOldValue==strValue) return; //-- no change


		//-- a log call - so if table is a related table then resolve with pick list
		if(this.type == _LCF && this._tables[strTable.toLowerCase()]._type == _RELATED && !bFromData)
		{
			
			//-- call onresoverecord
			this._tables[strTable.toLowerCase()]._bRecordDataChanged = true;
			strValue = this._OnResolveRecord(strTable,strColumn,strValue,true);
			if(strValue == "")
			{
				document.ResetRecord(strTable);
			}
			else
			{
				this.ResolveRecord(strTable,strColumn,strValue, true);
			}
		}
		else
		{
			
			//-- if for some reason the value has not been set then set it
			if(this._tables[strTable.toLowerCase()]._columns[strColumn.toLowerCase()]==undefined)
			{
				this._tables[strTable.toLowerCase()]._columns[strColumn.toLowerCase()] = new _swdcolumn(strColumn.toLowerCase(), strValue, strFormattedValue,this._tables[strTable.toLowerCase()]);
			}
			else
			{
				//-- set value in our table object
				this._tables[strTable.toLowerCase()]._columns[strColumn.toLowerCase()]._set_value(strValue,strFormattedValue);
			}

			//-- call onrecordvaluechanged
			if(!bFromData)
			{
				//-- set form filters that may depend on this
				document._UpdateFormFiltersFromData(strBinding);

				//--
				this._OnRecordValueChanged(strTable, strColumn, strValue, strOldValue);
			}

			//-- check if binding relates to related record if so load that related record
			if(this.type != _LCF || boolQLC)document._reverse_resolve_relateddata(strBinding,strValue);
		}
	}
	else
	{
		//alert("_set_data_value : ["+strBinding+"]\n\nThe data binding does not exist. Please contact your Administrator")
	}
}

_swdocument.prototype._tableExists = function(strTable,bMessage)
{
	if(this._tables[strTable.toLowerCase()])
	{
		return true;
	}
	else
	{
		//app.debug("The referenced table ["+ strTable + "] does not exist.","swdocument","_tableExists");
		if(bMessage)alert("_tableExists : ["+strTable+"]\n\nThe data table does not exist. Please contact your Administrator")
		return false;
	}
}

_swdocument.prototype._ismastertable = function(strTable,bMessage)
{
	if(this._tables[strTable.toLowerCase()])
	{
		return (this._tables[strTable.toLowerCase()]._type == _MASTER);

	}
	else
	{
		if(bMessage)alert("_ismastertable : ["+strTable+"]\n\nThe data table does not exist. Please contact your Administrator")
		return false;
	}

}


//-- update document filtered elements
_swdocument.prototype._UpdateFormFiltersFromData = function(strBinding)
{
	if(strBinding==undefined)strBinding="";
	this.mainform._initialise_filters(strBinding,true);
	if(this.extform!=null && this.extform!=undefined) this.extform._initialise_filters(strBinding,true);
}


//--
//-- public event methods as in Supportworks
_swdocument.prototype._OnFormLoading = function()
{
	app._CURRENT_JS_WINDOW = window;
	//-- call app developer define function
	var res = true;

	var strFunc ="OnFormLoading";
	if(window[strFunc])
	{
		//-- in case user closes window before function has finished
		res = window[strFunc](info.__formname, info.__callclass);			
	}

	if(res==false) this.CloseForm(); //-- may have done stuff that needs sorting out
	return true;
}

_swdocument.prototype._OnFormLoaded = function()
{
	app._CURRENT_JS_WINDOW = window;

	//-- call app developer define function
	var strFunc ="OnFormLoaded";
	if(window[strFunc])
	{
		try
		{
			//-- in case user closes window before function has finished
			res = window[strFunc](info.__formname, info.__callclass);			
			this._CheckFormCodeDataChange();
		}
		catch (e)
		{
		}
	}

}

_swdocument.prototype._OnFormClosing = function()
{

	//-- if maintable is swissues then refresh swissues list
	if(this._mastertable && this._mastertable._name=="swissues")app._servicedesk_refresh_issues();

	app._CURRENT_JS_WINDOW = window;


	//-- call app developer define function
	var strFunc ="OnFormClosing";

	if(window[strFunc])
	{

		res = window[strFunc]();
		this._CheckFormCodeDataChange();
		return res;
	}

	return true;
}

//--
//-- check that lbs with extra options have valid settings
_swdocument.prototype._check_mandatory_lb_with_extraoptions = function(bAlertMessage)
{
	if(bAlertMessage==undefined)bAlertMessage=true;

	for(var strBinding in document._listbox_extraoptions_bindings)
	{
		var lbInfo = document._listbox_extraoptions_bindings[strBinding];
		if(lbInfo.element.mandatory)
		{
			var arrInfo = lbInfo.info;
			if(lbInfo.element.value == arrInfo[0])
			{
				var realValue = _parse_context_vars(arrInfo[1]);
				if(realValue=="")
				{
					var strControlID = lbInfo.element.name;
					var arrBind = strBinding.split(".");
					try
					{
						var strControlName = app.dd.tables[arrBind[0]].columns[arrBind[1]].DisplayName;
						if(strControlName!=arrBind[1] && strControlName!=undefined)
						{
							if(bAlertMessage)alert("The form field ["+strControlName+"] is a mandatory listbox and the option selected contains a blank value.\n\nPlease provide a value before continuing.");
							return false;
						}
					}
					catch(e)
					{

					}		
				
					if(bAlertMessage)alert("A form field [" + strControlID + "] is a mandatory listbox and the option selected contains a blank value.\n\nPlease provide a value before continuing.");
					return false;
				}
			}
		}
	}
	return true;
}


_swdocument.prototype._OnValidate = function(bAlertMessage)
{
	if(bAlertMessage==undefined)bAlertMessage=true;
	//-- check mandatory fields
	if(!this._check_mandatory_lb_with_extraoptions(bAlertMessage))return false;
	if(!this.mainform._check_mandatory_fields(bAlertMessage)) return false;
	if(this.extform!=null && this.extform!=undefined && !this.extform._check_mandatory_fields(bAlertMessage)) return false;

	app._CURRENT_JS_WINDOW = window;

	//-- call app developer define function
	var strFunc ="OnValidate";
	if(window[strFunc])
	{
		res = window[strFunc]();
		this._CheckFormCodeDataChange();
		return res;
	}

	return true;
}

_swdocument.prototype._OnPreValidate = function()
{
	app._CURRENT_JS_WINDOW = window;

	//-- call app developer define function
	var res = 2;
	var strFunc ="OnPreValidate";
	if(window[strFunc])
	{
		res = window[strFunc]();
	}

	//-- we want to validate form
	if(res==2)
	{
		if(!this._OnValidate())return false;
	}
	else if (res==0) return false;

	return true;
}

_swdocument.prototype._OnSaveData = function()
{
	app._CURRENT_JS_WINDOW = window;

	//-- call app developer define function
	var strFunc ="OnSaveData";
	if(window[strFunc])
	{
		res = window[strFunc]();
		this._CheckFormCodeDataChange();
		return res;
	}

	return true;
}

_swdocument.prototype._OnDataSaved = function()
{
	this.UpdateFormFromData(undefined,true);
	this._EnableSave(false);

	app._CURRENT_JS_WINDOW = window;

	//-- call app developer define function
	var strFunc ="OnDataSaved";
	if(window[strFunc])
	{
		res = window[strFunc]();
		this._CheckFormCodeDataChange();
		return res;
	}

	return true;
}



//-- called when ever user or sysem changes a record value 
_swdocument.prototype._OnRecordValueChanged = function(strTable, strColumn, strValue, strOldValue)
{
	if(this._tables[strTable.toLowerCase()] == this._mastertable || this._tables[strTable.toLowerCase()] == this._exttable)
	{
		this._EnableSave(true);
	}

	app._CURRENT_JS_WINDOW = window;

	//-- call app developer define function
	var strFunc ="OnRecordValueChanged"; 
	if(window[strFunc])
	{
		window[strFunc](strTable, strColumn, strValue, strOldValue);
		this._CheckFormCodeDataChange();
	}
}


//--
//-- public methods

_swdocument.prototype.GetArg = function(strArg)
{
	if(strArg==undefined)return "";
	if(this._params[strArg.toLowerCase()]==undefined)return "";
	return this._params[strArg.toLowerCase()];
}

_swdocument.prototype.SetArg = function(strArg,varValue)
{
	this._params[strArg] = varValue;
}

_swdocument.prototype.Save = function(intCloseForm)
{
	if(document._bXmlForm)
	{
		//-- 03.03.2012 
		if(!this._OnPreValidate())return false;

		return this._FormXmlmcSaveData();
	}

	if(this._type==_LCF) 
	{
		alert("document.Save() is not supported in the log call form");
		return false;
	}

	return this._save_data(intCloseForm);
}


_swdocument.prototype.CloseForm = function()
{
	if(_bClosingForm) return;

	_bClosingForm = true;
	setTimeout("window.close()",20);
}


_swdocument.prototype.ResolveRecord = function(strTable, strColumn, strValue, bInternal,bExactMatch)
{
	if(_bClosingForm)return;
	if(bInternal==undefined)bInternal=true;
	if(bExactMatch==undefined)bExactMatch=true;

	//- -do not resolve empty values
	if(strValue=="")return;

	//-- get picklist
	if(!this._tableExists(strTable,true)) return;
	
	//-- get filter and check if we have 0 or 1 records
	if(app.dd.tables[strTable.toLowerCase()].columns[strColumn.toLowerCase()].IsNumeric())
	{
		if(isNaN(strValue))
		{
			alert('The column you are resolving against is numeric. Please enter a numeric value');
			return;
		}
	}
	else
	{
		if(bExactMatch)
		{
			//-- case sensitive ??
			if(app._dbcaseinsensitive)
			{
				var strFilter = "UPPER("+strColumn+")" + " = '" + app.pfs(strValue.toUpperCase()) + "'";
			}
			else
			{
				var strFilter = strColumn + " = '" + app.pfs(strValue) + "'";
			}
		}
		else
		{
			if(app._dbcaseinsensitive)
			{
				var strFilter = "UPPER("+strColumn+")" + " like '" + app.pfs(strValue.toUpperCase()) + "%'";
			}
			else
			{
				var strFilter = strColumn + " like '" + app.pfs(strValue) + "%'";
			}
		}
	}

	//-- Execute SQL
	var rs = new SqlQuery();
	rs.WebclientStoredQuery("form/resolveRelatedTableRecord","table="+strTable+"&columnone="+strColumn+"&valueone="+strValue+"&exactmatch=" + bExactMatch,true);
	if(rs.GetRowCount()==1)
	{

		//-- load record into form
		document._load_bespoke_record(rs,strTable.toLowerCase());
		document.UpdateFormFromData(strTable,false);	
		document._assign_mastertable_values(strTable.toLowerCase());
		if(this._OnRecordResolved)this._OnRecordResolved(strTable.toLowerCase());
		
		rs= null;
		return true;
	}
	else if (rs.GetRowCount()==0)
	{
		rs = null;
		if(bExactMatch)
		{
			//-- we were doing an exact match so try a like match
			return document.ResolveRecord(strTable.toLowerCase(), strColumn.toLowerCase(), strValue, true,false);
		}

		MessageBox("There is no match found for the item you entered. Please click No to try again or Yes to create a new record",app.MB_YESNO,function(confirmed)
		{
			if(confirmed)
			{
				//-- popup new modal form for pick list
				var strParams = "fromlfcresolve=1&displaycolumn="+strColumn+"&interimvalue=" + strValue;

				//alert(this._tables[strTable.toLowerCase()]._addrecordform)
				_open_control_form(this._tables[strTable.toLowerCase()]._addrecordform,"add",strValue,strParams,function(res)
				{
					if(res.recordsaved)
					{
						//-- set value and display
						//alert("LFC Resolve Record Created : " + res.newrecordkey);
						document.ResolveRecord(strTable.toLowerCase(), strColumn, res.newrecordkey, true,true);
					}
					else
					{
						document[strTable.toLowerCase()][strColumn.toLowerCase()] = "";
						document.UpdateFormFromData(strTable.toLowerCase(),true);
						return false;
					}
				});	
			}
			else
			{
				document[strTable.toLowerCase()][strColumn.toLowerCase()] = "";
				document.UpdateFormFromData(strTable.toLowerCase(),true);
				return false;
			}
		});
	}
	else
	{
		rs= null;
		//-- more than 1 record so show picklist
		if(this._tables[strTable.toLowerCase()]._picklist!="")
		{
			var strParams = "_resolvecolumn=" + strColumn + "&_resolvevalue=" + strValue;
			app._open_system_form("_wc_picklist", "picklist", this._tables[strTable.toLowerCase()]._picklist, strParams, true, function(oForm)
			{
				if(oForm==null)return;
				if(oForm._swdoc._selected_picklistkey!="")
				{
					//-- selected record so resolve
					document.ResolveRecord(strTable.toLowerCase(),this._tables[strTable.toLowerCase()]._keycolumn,oForm._swdoc._selected_picklistkey,true,true);
				}
				else
				{
					document[strTable.toLowerCase()][strColumn.toLowerCase()] = "";
					document.UpdateFormFromData(strTable.toLowerCase(),true);
					return false;
				}

			}, null,window);
		}
		else
		{
			alert("ResolveRecord : ["+strTable+"]\n\nThe data table does not have a vlid picklist form. Please contact your Administrator");
		}
	}
}



//-- document methods
_swdocument.prototype.AddFileAttachments = function()
{
	//-- check permission
	if(!app.session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANATTACHFILESTOCALLS,true)) return;
	
	//-- if files iframe is visible then add attachments
	try
	{
		files.fl_files.AddFiles(_formtype);
	}
	catch(e){}
}

_swdocument.prototype.RunQuickAction = function(strActionID)
{
	this._execute_showmeitem(-1, strActionID);
}
_swdocument.prototype.IsRecordResolved = function(strTable)
{
	return this._tables[strTable.toLowerCase()]._isloaded;
}

_swdocument.prototype.GetVar = function(strID)
{
	return this.GetArg(strID);
}
_swdocument.prototype.GetVariable = function(strID)
{
	return this.GetVar(strID)
}

_swdocument.prototype.SetVariable = function(strID,varValue)
{
	this._params[strID]=varValue;
	document[strID] = varValue;
}

//-- set title
_swdocument.prototype.SetTitle = function(strTitle)
{
	document.title = strTitle;
}

//- -reset modified flag for a form
_swdocument.prototype.ResetModiedFlag = function(strTable)
{
	if(this._tableExists(strTable.toLowerCase()))
	{
		this._tables[strTable.toLowerCase()].ResetModified();

		//-- set save button to disabled if the only table
		if(this._ismastertable(strTable.toLowerCase()))
		{
			if(this.type!=_LCF)
			{
				//-- reset child tables - 91851
				for(var strFormTableName in	this._tables)
				{
					this._tables[strFormTableName].ResetModified();
				}

				//-- disable save button
				this._EnableSave(false);
			}
		}
	}
}


//-- check data tables to see if data has changed
_swdocument.prototype._CheckFormCodeDataChange = function()
{
	if(_bClosingForm)return; //-- if form is closing do not process otherwise hangs
	if(this.type==_LCF)return;
	if(document._bSaveEnabled)
	{
		this.UpdateFormFromData();
		return;
	}

	//-- main table columns and check which ones have changed
	if(this._mastertable!=null && this._mastertable._check_data_changed())
	{
		this._EnableSave(true);
		this.UpdateFormFromData();
		return;
	}

	for(strTable in this._tables)
	{
		if(strTable!=this._mastertable._name && this._tables[strTable.toLowerCase()]._check_data_changed())
		{
			this._EnableSave(true);
			this.UpdateFormFromData();
			return;
		}
	}
}


//-- enable / disable form save buton
_swdocument.prototype._EnableSave = function(bEnable)
{
	if(_bClosingForm)return;
	if(this.type==_LCF)return;
	if(bEnable==undefined)bEnable=true;


	var bSaveVisible = 	app.toolbar_item_isvisible(this.type, "save" , document);
	if(bSaveVisible)
	{
		document._bSaveEnabled = bEnable;
		app.toolbar_item_dore(this.type, "save" , bEnable, document);
	}
	else
	{
		document._bSaveEnabled = false;
		app.toolbar_item_dore(this.type, "save" , false, document);
	}
}


//-- check if thing is defined
_swdocument.prototype.IsObjectDefined = function(strObjectName)
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


_swdocument.prototype.ResetRecord = function(strTable)
{
	if(this._tables[strTable.toLowerCase()]!=undefined)
	{
		document._tables[strTable.toLowerCase()]._reset();
		document.UpdateFormFromData(strTable.toLowerCase(),true);
	}
}


_swdocument.prototype.GetRecord = function(strTable)
{
	return this._tables[strTable.toLowerCase()];
}

_swdocument.prototype.ResetData = function()
{
	return true;
}

//-- update document elements with data
_swdocument.prototype.UpdateFormFromData = function(strUseTable, bInternal)
{
	
	if(bInternal==undefined)bInternal=false;
	if(document._bXmlForm)
	{
		this._RefreshXmlmcFormValues(bInternal);
		return true;
	}

	app.debugstart("UpdateFormFromData:mainform","xmlform.php");
	var eles = this.mainform.boundelements;
	var strID = "";
	var strBinding = "";
	var arrBinding = new Array();
	for (strID in eles)
	{
		strBinding = eles[strID].binding;
		if(strBinding=="")continue;

		if(strBinding.indexOf("&[")>-1)
		{
			//-- some dual or formual field i.e fullname field made up of &[userdb.firstname] &[userdb.lastname]
			var oEle = eles[strID];
			var eleValue = _parse_context_vars(strBinding,false,true);
			if(oEle.value==eleValue && !bInternal) 
			{
				continue;
			}
			oEle._value(eleValue,eleValue,true);
			continue;
		}

		if(strUseTable!=undefined && strUseTable!="")
		{
			if(strBinding.indexOf(strUseTable + ".")>-1)
			{
				this._tables[strUseTable]._update_form_field(eles[strID],eles[strID].binding,bInternal);
			}
		}
		else
		{
			arrBinding = strBinding.split(".");
			if(this._tables[arrBinding[0]]!=undefined)
			{
				this._tables[arrBinding[0]]._update_form_field(eles[strID],eles[strID].binding,bInternal);
			}
		}
	}
	app.debugend("UpdateFormFromData:mainform","xmlform.php");	

	//-- process ext form if exists
	if(this.extform!=null && this.extform!=undefined)
	{
		app.debugstart("UpdateFormFromData:extform","xmlform.php");
		eles = this.extform.boundelements;
		strID = "";
		strBinding = "";
		arrBinding = new Array();
		for (strID in eles)
		{
			strBinding = eles[strID].binding;
			if(strBinding=="")continue;
			if(strBinding.indexOf("&[")>-1)
			{
				//-- some dual or formual field i.e fullname field made up of &[userdb.firstname] &[userdb.lastname]
				var oEle = eles[strID];
				var eleValue = _parse_context_vars(strBinding,false,true);
				if(oEle.value==eleValue && !bInternal) 
				{
					continue;
				}
				oEle._value(eleValue,eleValue,true);
				continue;
			}

			if(strUseTable!=undefined && strUseTable!="")
			{
				if(strBinding.indexOf(strUseTable + ".")>-1)
				{
					this._tables[strUseTable]._update_form_field(eles[strID],eles[strID].binding,bInternal);
				}
			}
			else
			{
				arrBinding = strBinding.split(".");
				if(this._tables[arrBinding[0]]!=undefined)
				{
					this._tables[arrBinding[0]]._update_form_field(eles[strID],eles[strID].binding,bInternal);
				}
			}
		}
		app.debugend("UpdateFormFromData:extform","xmlform.php");	
	}

	app.debugstart("UpdateFormFromData._UpdateFormFiltersFromData","xmlform.php");	
	this._UpdateFormFiltersFromData(strUseTable);
	app.debugend("UpdateFormFromData._UpdateFormFiltersFromData","xmlform.php");	

	//-- 02.05.2012 - 88115 / 88121 - ensure tables marked as not modified
	if(bInternal)
	{
		//-- set <table>._bUserDataChanged to false
		for(var strTableName in this._tables)
		{
			this._tables[strTableName]._bUserDataChanged = false;
		}
	}

	return true;
}

_swdocument.prototype.RunQuickAction = function(strAction)
{
	alert("webclient : RunQuickAction\n\nThis functionality is not supported in the webclient.");
}


//-- for a given table assign any data assignment to master table (called after related record is resolved
_swdocument.prototype._assign_mastertable_values = function(strTable)
{

	//-- set any master assignments i.e. userdb.keysearch to opencall.cust_id
	for(strToBinding in this._tables[strTable.toLowerCase()]._maindetailassignments)
	{
		var strFromExpression = this._tables[strTable.toLowerCase()]._maindetailassignments[strToBinding];
		var arrTo = strToBinding.split(".");
		var arrFrom = strFromExpression.split(" ");
		
		document[arrTo[0]][arrTo[1]] = "";
		var aFLen = arrFrom.length;
		for(var x=0;x<aFLen;x++)
		{
			if(document[strTable.toLowerCase()][arrFrom[x]]!=undefined)
			{
				var strValue = document[strTable.toLowerCase()][arrFrom[x]];
				if(document[arrTo[0]][arrTo[1]]!="") document[arrTo[0]][arrTo[1]] += " ";
				document[arrTo[0]][arrTo[1]] += strValue;
			}
		}
	}
}

_swdocument.prototype._OnDataChanged = function(bRefreshFields)
{
	if(bRefreshFields==undefined)bRefreshFields=false;

	//-- reload data
	this._loaddata(document.opencall.callref);
	
	if(bRefreshFields)
	{
		document.UpdateFormFromData(undefined,true);
	}

	if(this._SetupToolbarState!=undefined)this._SetupToolbarState();

	if(this.type==_CDF)
	{
		//-- check if need to update helpdesk view if the current selected row is same call
		if(app._CurrentServiceDeskRowKey==document.opencall.callref && app._CurrentServiceDeskTable!=null)
		{
			var aRow = app._CurrentServiceDeskTable.rows[app._CurrentServiceDeskRowIndex];
			if(aRow!=undefined)
			{
				app._refresh_servicedesk_row(aRow);
			}
		}
	}

	//-- call on data changed event
	var strFunc ="OnDataChanged";
	if(window[strFunc])
	{
		window[strFunc]();
		this._CheckFormCodeDataChange();
	}
}

//-- create temp workflow table
_swdocument.prototype._CreateTempWorkflowTable = function()
{
	if(this.type!="lcf" && this.type!="cdf") return;

	this._tempworkflowtable = _uniqueformid;
	
	/* April 2015 - no longer use temp table
	var strParams = "_uniqueid=" + _uniqueformid;
	var strURL = app.webroot + "/webclient/service/workflow/create_temp_workflowtable.php";
	this._tempworkflowtable = app.get_http(strURL, "swsessionid=" + app._swsessionid + "&"+ strParams, true, false,  null, null);
	if(this._tempworkflowtable=="")
	{
		alert("The workflow processor is not operating. Please contact your Administrator.");
		document.getElementById('_tc_workflow').style.display='none';
	}*/
}

//-- drop temp workflow table
_swdocument.prototype._DropTempWorkflowTable = function()
{
	if(this.type!="lcf" && this.type!="cdf") return;

	var strParams = "_uniqueid=" + this._tempworkflowtable;
	var strURL = app.webroot + "/webclient/service/workflow/drop_temp_workflowtable.php";
	app.get_http(strURL, "swsessionid=" + app._swsessionid + "&"+ strParams, false, false, null, null);
}

//-- add temp workflow list
_swdocument.prototype._AddTempWorkflowList = function()
{
	if(this.type!="lcf" && this.type!="cdf") return;
}

//-- remove temp workflow list
_swdocument.prototype._RemoveTempWorkflowList = function()
{
	if(this.type!="lcf" && this.type!="cdf") return;
}


//-- add temp workflow item
_swdocument.prototype._AddTempWorkflowItem = function()
{
	if(this.type!="lcf" && this.type!="cdf") return;
}

//-- edit temp workflow item
_swdocument.prototype._EditTempWorkflowItem = function()
{
	if(this.type!="lcf" && this.type!="cdf") return;
}

//-- remove temp workflow item
_swdocument.prototype._RemoveTempWorkflowItem = function()
{
		if(this.type!="lcf" && this.type!="cdf") return;
}

_swdocument.prototype._enableprint = function()
{
	//alert(this._printtemplate +":"+this.type)
	app.toolbar_item_dore(this.type, "swprint" , (this._printtemplate!=""), document);
}

_swdocument.prototype.Print = function()
{
	this._print();
}
_swdocument.prototype._print = function()
{
	if(this._printtemplate!="")
	{
		//-- do we have print template?
		var strURL = _parse_context_vars(this._printtemplate);
		if(strURL.indexOf("?")>0)
		{
			strURL +="&emailmode=1&sessid=" + app._swsessionid;
		}
		else
		{
			strURL +="?emailmode=1&sessid=" + app._swsessionid;
		}
		app._print_url(strURL);
	}
}


//-- formtype specific methods and properties
function _swdoc_stf(oDocument)
{
	oDocument._process_form_toolbar_action  = _swdoc_stf_process_form_toolbar_action;
	oDocument._SetupToolbarState=_swdoc_stf_SetupToolbarState;

	oDocument._onLoadRecord=_swdoc_stf_OnLoadRecord;
	oDocument.LoadRecordData = _swdoc_stf_LoadRecordData;
}

//-- called when a reocrd is going to be loaded
_swdoc_stf_OnLoadRecord = function(strTable, strKeyValue)
{
	//--
	//-- do no use for now as it means we have to load each record individually
	return true;

	//-- call app developer define function
	var ret = true;
	var strFunc ="OnLoadRecord";
	if(window[strFunc])
	{
		ret = window[strFunc](strTable,strKeyValue);
		this._CheckFormCodeDataChange();
	}
	if(ret == undefined)ret = true;
	return ret;
}

//-- load a record into memory (in place of standard record load
_swdoc_stf_LoadRecordData = function(strDSN, strTable, strKeyValue)
{
	if(strKeyValue==undefined) return false;
	if(strDSN==undefined) return false;
	if(app.dd.tables[strTable.toLowerCase()]==undefined) return false;

	//-- get primary key
	var strKeyCol = app.dd.tables[strTable.toLowerCase()].PrimaryKey;
	if(strKeyCol==undefined || strKeyCol=="") return false;

	//-- prepare key value
	var strPreparedKeyValue = (app.dd.tables[strTable.toLowerCase()].columns[strKeyCol].IsNumeric())?strKeyValue: "'" + app.pfs(strKeyValue) +"'";

	var rs = new SqlQuery();
	var strParams = "dsn="+strDSN+"&table=" + strTable + "&keycol=" + strKeyCol + "&keyvalue=" + strKeyValue; 
	if(rs.WebclientStoredQuery("data/getRecord",strParams) && rs.Fetch())
	{
		if(this._load_bespoke_record(rs,strTable))
		{
			document.UpdateFormFromData(strTable,true);
			return true;
		}
	}

	return false;
}



//-- enable disable toolbar items based on call status
function _swdoc_stf_SetupToolbarState(bInternal)
{
	this._enableprint();
	if(bInternal==undefined)bInternal = false;

	if(bInternal)
	{
		app.toolbar_item_dore("stf", "save" , false, document);
	}

}
function _swdoc_stf_process_form_toolbar_action(strID)
{
	switch(strID)
	{
		case "save":
			this.Save();
			break;
		case "swprint":
			this._print();
			break;

		default:
			alert("standard form toolbar action not supported : " + strID)

	}
}

//--
//-- call detail specific
function _swdoc_cdf(oDocument)
{
	oDocument._process_form_toolbar_action  = _swdoc_cdf_process_form_toolbar_action;
	oDocument._disable_special_bindings = _swdoc_cdf_disable_special_bindings;
	oDocument._OnChangeCallProfile = _swdoc_cdf_OnChangeCallProfile;
	oDocument._SetupToolbarState =_swdoc_cdf_SetupToolbarState;

	oDocument._OnAcceptCall = _swdoc_cdf_OnAcceptCall;
	oDocument._OnHoldCall = _swdoc_cdf_OnHoldCall;
	oDocument._OnOffHoldCall = _swdoc_cdf_OnOffHoldCall;
	oDocument._OnAssignCall = _swdoc_cdf_OnAssignCall;
	oDocument._OnResolveCall = _swdoc_cdf_OnResolveCall;
	oDocument._OnUpdateCall = _swdoc_cdf_OnUpdateCall;
	oDocument._OnSaveCall = _swdoc_cdf_OnSaveCall;
	oDocument._OnCancelCall = _swdoc_cdf_OnCancelCall;


	oDocument._CheckLastUpdateDate = _swdoc_cdf_CheckLastUpdateDate;
	oDocument._CheckLastUpdateDateInspect = _swdoc_cdf_CheckLastUpdateDateInspect;


	oDocument.ChangeCallClass = _swdoc_cdf_ChangeCallClass;
	oDocument.ChangeCallCondition = _swdoc_cdf_ChangeCallCondition;
	oDocument.ChangeRecord = _swdoc_cdf_ChangeRecord;
	oDocument.AcceptCall = _swdoc_cdf_AcceptCall;
	oDocument.AddCallToIssue = _swdoc_cdf_AddCallToIssue;
	oDocument.CancelCall = _swdoc_cdf_CancelCall;
	oDocument.CreateIssue = _swdoc_cdf_CreateIssue;
	oDocument.CloseCall = _swdoc_cdf_CloseCall;
	oDocument.HoldCall = _swdoc_cdf_HoldCall;
	oDocument.ReactivateCall = _swdoc_cdf_ReactivateCall;
	oDocument.TransferCall = _swdoc_cdf_TransferCall;
	oDocument.UpdateCall = _swdoc_cdf_UpdateCall;

	oDocument.LoadRelatedRecord = _swdoc_stf_LoadRecordData;

}

//-- call actions - 
function _swdoc_cdf_ChangeCallClass()
{
	//-- popup callclass picker
	var strParams = "_selectcallclass=yes";
	var oForm = app._open_system_form("_wc_lognewcallclass", "lcfpicker", "", strParams, true, function(oForm)
	{
		if(oForm && oForm.document._selected_callclass!=undefined)
		{
			if(oForm.document._selected_callclass!="")
			{
				var swHD = new HelpdeskSession();
				return swHD.ChangeCallClass(document.opencall.callref, oForm.document._selected_callclass);
			}
		}
	},undefined,window);

}
function _swdoc_cdf_ChangeCallCondition()
{
	//- -show call condition picker
}
function _swdoc_cdf_ChangeRecord(strTable,strKey)
{
	//-- change related record
	if(this._tables[strTable.toLowerCase()])
	{
		if(this._tables[strTable.toLowerCase()]._type==_RELATED)
		{
			var origTable = strTable;
			var currentRelatedKeyValue = this._tables[strTable.toLowerCase()]._keyvalue;
			var opencallFK = this._tables[strTable.toLowerCase()]._maindetailscolumn;

			//-- change table name for description
			if(strTable=="equipmnt")strTable="Asset Details";
			else if(strTable=="userdb")strTable="Customer Details";
			else if(strTable=="site")strTable="Site Details";
			else if(strTable=="company")strTable="Organisation Details";

			var strDesc = 'The related record [' + strTable + '] was changed for this call. Old value : "' + app.pfx(currentRelatedKeyValue) + '" , New Value : "' + app.pfx(strKey) + '"';

			//-- perform call update
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam("callref", document.opencall.callref);
			xmlmc.SetParam("updateMessage", strDesc);
			xmlmc.SetParamAsComplexType("additionalCallValues","<opencall><"+opencallFK+">" + app.pfx(strKey) + "</"+opencallFK+"></opencall>");
			if(xmlmc.Invoke("helpdesk","updateCallValues"))
			{
				//-- load record into form
				this.LoadRelatedRecord("swdata", origTable, strKey);

				//-- 97037 - save any additional binding values and then load record
				this._assign_mastertable_values(origTable);
				document.Save();
				document.UpdateFormFromData(undefined,true);
				
				app._CURRENT_JS_WINDOW = window;

				//-- call app developer define function
				var strFunc ="OnRecordChanged"; 
				if(window[strFunc])
				{
					window[strFunc](origTable);
				}
			}
			else
			{
				alert("Failed to change the related record. Please contact your Administrator.");
			}
		}
		else 
		{
			//-- load record into form
			this.LoadRelatedRecord("swdata", origTable, strKey);
		}

	}
}
function _swdoc_cdf_AddCallToIssue()
{
	//-- show issue picker
}
function _swdoc_cdf_CreateIssue()
{
	app._issueform("",document.opencall.callref,false, window);
}
function _swdoc_cdf_CancelCall()
{
	app._cancelcallform(document.opencall.callref,window);
}

function _swdoc_cdf_AcceptCall()
{
	this._OnAcceptCall();
}
function _swdoc_cdf_CloseCall()
{
	this._OnResolveCall();
}
function _swdoc_cdf_HoldCall()
{
	this._OnHoldCall();
}
function _swdoc_cdf_ReactivateCall()
{
	var swHD = new HelpdeskSession();
	return swHD.ReactivateCall(document.opencall.callref);
}
function _swdoc_cdf_TransferCall()
{
	this._OnAssignCall();
}
function _swdoc_cdf_UpdateCall()
{
	this._OnUpdateCall();
}


//-- query database to get call last update datex and then compare to current...if different then call OnDataChangedEvent
function _swdoc_cdf_CheckLastUpdateDate()
{
	if(_bClosingForm)return;

	var strParams = "_lastdatex="+document.opencall.lastactdatex+"&_callref="+document.opencall.callref+"&_uniqueformid=" + _uniqueformid;
	var strURL = app.get_service_url("call/getlastupdatedate","");
	app.get_http(strURL, strParams, false, false, document._CheckLastUpdateDateInspect, null);
}

function _swdoc_cdf_CheckLastUpdateDateInspect(strResult)
{
	if(_bClosingForm)return;

	//-- call has changed since loaded (via vpme or something
	if(strResult > document.opencall.lastactdatex)
	{
		this._OnDataChanged(true);
	}
	//-- check in n seconds to see if call has since been updated
	setTimeout("document._CheckLastUpdateDate()",_cdf_refresh_polling);
}

function _swdoc_cdf_OnChangeCallProfile()
{
	var res = true;
	var strFunc ="OnChangeCallProfile";
	if(window[strFunc]) 
	{
		res =  window[strFunc]();
		this._CheckFormCodeDataChange();
	}
	return res;
}

//-- disable special fields
function _swdoc_cdf_disable_special_bindings(strID)
{
	//--
	//-- fields we need to set to readonly
	var array_special_bindings = new Array();
	array_special_bindings["opencall.priority"]=1;
	array_special_bindings["opencall.status"]=1;
	array_special_bindings["opencall.suppgroup"]=1;
	array_special_bindings["opencall.loggedby"]=1;
	array_special_bindings["opencall.owner"]=1;
	array_special_bindings["opencall.logdatex"]=1;
	array_special_bindings["opencall.assigndatx"]=1;
	array_special_bindings["opencall.respondbyx"]=1;
	array_special_bindings["opencall.fixbyx"]=1;
	array_special_bindings["opencall.resp_time"]=1;
	array_special_bindings["opencall.fix_time"]=1;
	array_special_bindings["opencall.probtext"]=1;
	array_special_bindings["opencall.lasttext"]=1;

	//-- check mainform fields	
	for (strID in this.mainform.namedelements)
	{
		var strBinding = this.mainform.namedelements[strID].binding;
		if(array_special_bindings[strBinding]==1 && this.mainform.namedelements[strID]._is_an_input_field())
		{
			this.mainform.namedelements[strID]._enable(false);
		}
	}
	//-- check extform fields	
	if(this.extform!=null || this.extform!=undefined)
	{
		for (strID in this.extform.namedelements)
		{
			var strBinding = this.extform.namedelements[strID].binding;
			if(array_special_bindings[strBinding]==1 && this.extform.namedelements[strID]._is_an_input_field())
			{
				this.extform.namedelements[strID]._enable(false);
			}
		}
	}
}

//-- toolbar actions
function _swdoc_cdf_process_form_toolbar_action(strID)
{
	switch(strID)
	{
		case "swtasks":
			break;
		case "attach":
			if(!app.session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANATTACHFILESTOCALLS,true)) return;
			files.fl_files.AddFiles('cdf');
			break;
		case "unattach":
			files.fl_files._deletecallattachment();
			app.toolbar_item_dore("cdf", "unattach" , false, document);
			break;			
		case "callaccept":
			this._OnAcceptCall();
			break;
		case "callhold":
			this._OnHoldCall();
			break;
		case "calloffhold":
			this._OnOffHoldCall();
			break;
		case "callassign":
			this._OnAssignCall();
			break;
		case "callresolve":
			this._OnResolveCall();
			break;
		case "callupdate":
			this._OnUpdateCall();
			break;
		case "save":
			this._OnSaveCall();
			break;
		case "swprint":
			this._print();
			break;
		case "callwatch":
			var oHD = new HelpdeskSession();
			if(oHD.WatchCall(document.opencall.callref, app.session.analystId))
			{
				app.toolbar_item_dore("cdf", "callwatch" , false, document);
				app.toolbar_item_dore("cdf", "callunwatch" , true, document);

				//-- if in service desk refresh watched calls
				if(app._ServiceDeskDocumentElement!= null && app._ServiceDeskDocumentElement.body.offsetWidth>0)app._servicedesk_refresh_watched_calls();
			}
			break;
		case "callunwatch":
			var oHD = new HelpdeskSession();
			if(oHD.UnwatchCall(document.opencall.callref, app.session.analystId))
			{
				app.toolbar_item_dore("cdf", "callwatch" , true, document);
				app.toolbar_item_dore("cdf", "callunwatch" , false, document);

				//-- if in service desk - refresh watched calls
				if(app._ServiceDeskDocumentElement!= null && app._ServiceDeskDocumentElement.body.offsetWidth>0)app._servicedesk_refresh_watched_calls();
			}
			break;
		case "callcancel":
			this._OnCancelCall();
			break;

		default:
			alert("Call Detail toolbar action not supported : " + strID)
	}	
}


//-- enable disable toolbar items based on call status
function _swdoc_cdf_SetupToolbarState(bInternal)
{
	this._enableprint();
	if(bInternal==undefined)bInternal = false;

	if(bInternal)
	{
		app.toolbar_item_dore("cdf", "save" , false, document);
	}

	var bIsWatched = app._swchd_iscallwatched(document.opencall.callref, app.session.analystid);
	var _hd_bCanAccept = true;
	var _hd_bCanAssign = true;
	var _hd_bCanUpdate = true;
	var _hd_bCanHold = true;
	var _hd_bCanTakeOffHold = true;
	var _hd_bCanResolve = true;
	var _hd_bCanClose = true;
	var _hd_bCanCancel = true;
	var _hd_bCanReactivate = true;
	var _hd_bCanAttach = true;

	var nStatus = document.opencall.status;
	nStatus--;nStatus++;
	switch (nStatus)
	{
		case _INCOMING:
			_hd_bCanClose = false
			_hd_bCanResolve = false
			_hd_bCanAccept = false;
			_hd_bCanAssign = false;
			_hd_bCanUpdate = false;
			_hd_bCanCancel = false;
			_hd_bCanHold = false;
			_hd_bCanTakeOffHold=false
		case _RESOLVED:
			_hd_bCanClose = true;
			_hd_bCanResolve = false
			_hd_bCanAccept = false;
			_hd_bCanHold = false;
			_hd_bCanTakeOffHold=false
			break;
		case _CLOSED:
		case _CLOSEDCHARGE:
			_hd_bCanClose = false
			_hd_bCanResolve = false
			_hd_bCanAccept = false;
			_hd_bCanAssign = false;
			_hd_bCanUpdate = false;
			_hd_bCanCancel = false;
			_hd_bCanHold = false;
			_hd_bCanTakeOffHold=false
			_hd_bCanAttach = false;
			break;
		case _UNACCEPTED:
			_hd_bCanReactivate=false;
			_hd_bCanHold = false;
			_hd_bCanTakeOffHold=false
			_hd_bCanClose = false
			_hd_bCanResolve = false
			_hd_bCanReactivate=false;
			break;
		case _UNASSIGNED:
			_hd_bCanHold = false;
			_hd_bCanTakeOffHold=false
			_hd_bCanClose = false
			_hd_bCanResolve = false
			_hd_bCanReactivate=false;
			break;
		case _PENDING:
			_hd_bCanTakeOffHold=false
			_hd_bCanAccept= false;
			_hd_bCanReactivate=false;
			break;
		case _ONHOLD:
			_hd_bCanHold = false;
			_hd_bCanReactivate=false;
			_hd_bCanClose = false
			_hd_bCanResolve = false
			_hd_bCanAccept = false;
			_hd_bCanAssign = false;
			break;
		case _OFFHOLD:
			_hd_bCanTakeOffHold=false
			_hd_bCanReactivate=false;
			_hd_bCanClose = false
			_hd_bCanResolve = false
			break;
		case _INCOMING:
			_hd_bCanReactivate=false;
			break;
		case _CANCELLED:
			_hd_bCanClose = false
			_hd_bCanResolve = false
			_hd_bCanAccept = false;
			_hd_bCanAssign = false;
			_hd_bCanUpdate = false;
			_hd_bCanCancel = false;
			_hd_bCanTakeOffHold=false
			_hd_bCanHold = false;
			_hd_bCanAttach = false;
			break;
		case _ESCO:
		case _ESCG:
		case _ESCA:
			_hd_bCanTakeOffHold=false
			_hd_bCanHold = false;
			_hd_bCanReactivate=false;
			_hd_bCanClose = false
			_hd_bCanResolve = false
			break;
		default:
			alert("Service Desk Status Not Recognised : "  + nStatus);
			break;
	}

	app.toolbar_item_dore("cdf", "callupdate" , _hd_bCanUpdate, document);
	app.toolbar_item_dore("cdf", "callassign" , _hd_bCanAssign, document);
	app.toolbar_item_dore("cdf", "callaccept" , _hd_bCanAccept, document);
	app.toolbar_item_dore("cdf", "callhold" , _hd_bCanHold, document);
	app.toolbar_item_dore("cdf", "calloffhold" , _hd_bCanTakeOffHold, document);
	app.toolbar_item_dore("cdf", "callresolve" , (_hd_bCanResolve || _hd_bCanClose), document);
	app.toolbar_item_dore("cdf", "callcancel" , _hd_bCanCancel, document);

	app.toolbar_item_dore("cdf", "callwatch" , !bIsWatched, document);
	app.toolbar_item_dore("cdf", "callunwatch" , bIsWatched, document);

	app.toolbar_item_dore("cdf", "attach" , _hd_bCanAttach, document);
	app.toolbar_item_dore("cdf", "unattach" , false, document);

}

function _swdoc_cdf_OnAcceptCall()
{

	//-- allow customers to disable this validation (not recommended as it means data can be in any state)
	if(app.dd.GetGlobalParamAsNumber("webclient settings/call details/disabledataqualitycheckoncallaction")!=1) 
	{
		if(!this._OnPreValidate())return false;
	}
	
	app._acceptcallform(document.opencall.callref,window,[],function()
	{
		this._OnDataChanged(true);
	});

}

function _swdoc_cdf_OnCancelCall()
{
	if(app._cancelcallform(document.opencall.callref,window))
	{
		this._OnDataChanged(true);
	}
}

function _swdoc_cdf_OnHoldCall()
{

	//-- allow customers to disable this validation (not recommended as it means data can be in any state)
	if(app.dd.GetGlobalParamAsNumber("webclient settings/call details/disabledataqualitycheckoncallaction")!=1) 
	{
		if(!this._OnPreValidate())return false;
	}

	
	if(app._holdcallform(document.opencall.callref,window))
	{
		this._OnDataChanged(true);
	}

}

function _swdoc_cdf_OnOffHoldCall()
{

	//-- allow customers to disable this validation (not recommended as it means data can be in any state)
	if(app.dd.GetGlobalParamAsNumber("webclient settings/call details/disabledataqualitycheckoncallaction")!=1) 
	{
		if(!this._OnPreValidate())return false;
	}

	
	if(app._swchd_offhold_call(document.opencall.callref))
	{
		this._OnDataChanged(true);
	}
}

function _swdoc_cdf_OnAssignCall()
{
	//-- allow customers to disable this validation (not recommended as it means data can be in any state)
	if(app.dd.GetGlobalParamAsNumber("webclient settings/call details/disabledataqualitycheckoncallaction")!=1) 
	{
		if(!this._OnPreValidate())return false;
	}

	
	//-- if we have info then call helpdesk session to assign
	if(app._swchd_assign_call(document.opencall.callref,"","","",window))
	{
		this._OnDataChanged(true);
	}
}

function _swdoc_cdf_OnResolveCall()
{

	//-- allow customers to disable this validation (not recommended as it means data can be in any state)
	if(app.dd.GetGlobalParamAsNumber("webclient settings/call details/disabledataqualitycheckoncallaction")!=1) 
	{
		if(!this._OnPreValidate())return false;
	}

	
	if(app._resolveclosecallform(document.opencall.callref,window))
	{
		this._OnDataChanged(true);
	}
}

function _swdoc_cdf_OnUpdateCall()
{
	//-- allow customers to disable this validation (not recommended as it means data can be in any state)
	if(app.dd.GetGlobalParamAsNumber("webclient settings/call details/disabledataqualitycheckoncallaction")!=1) 
	{
		if(!this._OnPreValidate())return false;
	}

	
	app._updatecallform(document.opencall.callref,window,[],function()
	{
		this._OnDataChanged(true);
	});
}


//-- save call details
function _swdoc_cdf_OnSaveCall()
{
	if(!this._OnSaveData())return false;

	if(!this._OnPreValidate())return false;
	
	//-- loop modified fields and send via helpdesk object
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref",document.opencall.callref);

	var strAdditionalCallValues = "";
	var strAdditionalOpencallValues = "";
	var strCallDetailExtendedValues = "";
	var lapp = app;
	var ldd = app.dd;

	//-- xmlmc updatecallvalues does not work with ext table so use normal updateRecord
	//-- process extended details table first using standard update
	if(this._exttable!=null)
	{
		//-- ensure ext table key col is set
		this._exttable._columns[this._exttable._keycolumn].originalvalue = "";
		this._exttable._columns[this._exttable._keycolumn].value = this._mastertable._columns[this._mastertable._keycolumn].value;
		_swdoc[this._exttable._name][this._exttable._keycolumn] = this._mastertable._columns[this._mastertable._keycolumn].value;
		this._exttable._savedata();
	}

	//-- set and opencall data params
	var rec = document.GetRecord("opencall");			
	if(rec)
	{
		var nColCount = rec.GetCount();
		for(var x=0; x<nColCount; x++)
		{
			//-- store value
			if(!this._mastertable.IsModified(x))continue;
			var strFieldName = rec.GetColumnName(x);

			var varSendValue = rec.GetValue(x);
			if(varSendValue.indexOf("&[")==0)
			{
				varSendValue = _parse_context_vars(varSendValue);
				rec[strFieldName] = varSendValue;
			}
			else if(document._listbox_extraoptions_bindings["opencall." + strFieldName]!=undefined)
			{
				//-- this value is meant to be set as an extra option
				var arrInfo = document._listbox_extraoptions_bindings["opencall." + strFieldName].info;
				if(varSendValue==arrInfo[0])
				{
					//-- need to parse out
					varSendValue = _parse_context_vars(arrInfo[1]);
					rec[strFieldName] = varSendValue;
				}
			}
			//-- if numeric and empty undefined then default to 0
			//-- if string an d "" then do not send
			if(ldd.tables["opencall"].columns[strFieldName].IsNumeric())
			{
				if(varSendValue=="" || varSendValue==undefined || varSendValue=="undefined") varSendValue=0;
			}
			else
			{
				if(varSendValue==undefined || varSendValue=="undefined") continue;
			}

			if(strAdditionalOpencallValues=="")strAdditionalOpencallValues="<opencall>";
			strAdditionalOpencallValues+="<"+strFieldName+">" + lapp.pfx(varSendValue) + "</"+strFieldName+">";
		}
		if(strAdditionalOpencallValues!="")strAdditionalOpencallValues+="</opencall>";
	}


	//-- if we have additional call values send them
	strAdditionalCallValues = strAdditionalOpencallValues;
	if(strAdditionalCallValues=="")
	{
		//-- manually set opencall.callref - so we force vmpe to fire
		strAdditionalCallValues="<opencall><callref>" + document.opencall.callref + "</callref></opencall>";
	}

	/* 26.05.2011 - xmlmc now saves ext data */
	/*
	//-- process extended details table
	if(this._exttable!=null)
	{
		var nColCount = this._exttable.GetCount();
		for(var x=0; x<nColCount; x++)
		{
			if(!this._exttable.IsModified(x))continue;
			//-- store value
			var strFieldName = this._exttable.GetColumnName(x);

			var varSendValue = this._exttable.GetValue(x);
			if(varSendValue.indexOf("&[")==0)
			{
				varSendValue = _parse_context_vars(varSendValue);
				this._exttable[strFieldName] = varSendValue;
			}

			if(strCallDetailExtendedValues=="")strCallDetailExtendedValues="<"+this._exttable._name+">";
			strCallDetailExtendedValues+="<"+strFieldName+">" + app.pfx(varSendValue) + "</"+strFieldName+">";
		}
		if(strCallDetailExtendedValues!="")strCallDetailExtendedValues+="</"+this._exttable._name+">";
	}
	*/

	xmlmc.SetParamAsComplexType("additionalCallValues",strAdditionalCallValues + strCallDetailExtendedValues);

	if(xmlmc.Invoke("helpdesk","updateCallValues"))
	{
		//-- call OnDataChanged
		//this._OnDataChanged();
		
		//-- check if need to update helpdesk view if the current selected row is same call
		if(app._CurrentServiceDeskRowKey==document.opencall.callref && app._CurrentServiceDeskTable!=null)
		{
			var aRow = app._CurrentServiceDeskTable.rows[app._CurrentServiceDeskRowIndex];
			if(aRow!=undefined)
			{
				app._refresh_servicedesk_row(aRow);
			}
		}
		
		//-- then OnDataSaved
		this._OnDataSaved();

		return true;
	}
	else
	{
		alert("The system failed to save the changes. Please report the following error to your Administrator.\n\nError : " + xmlmc.GetLastError());
		return false;
	}

}



//--
//-- EOF call detail specific

//--
//-- log call form specific
function _swdoc_lcf(oDocument)
{
	oDocument._OnAcceptCall=_swdoc_lcf_OnAcceptCall;
	oDocument._OnLogAndAssignCall=_swdoc_lcf_OnLogAndAssignCall;
	oDocument._OnLogAndResolveCall=_swdoc_lcf_OnLogAndResolveCall;
	oDocument._OnLogCall=_swdoc_lcf_OnLogCall;
	oDocument._OnTakeCall=_swdoc_lcf_OnTakeCall;

	oDocument._OnCallLoggedOK =_swdoc_lcf_OnCallLoggedOK;
	oDocument._OnSetProfileCodeFilter =_swdoc_lcf_OnSetProfileCodeFilter;
	oDocument._OnRecordReset = _swdoc_lcf_OnRecordReset;
	oDocument._OnRecordResolved = _swdoc_lcf_OnRecordResolved;
	oDocument._CheckSpecialFields = _swdoc_lcf_CheckSpecialFields;
	oDocument._OnResolveRecord = _swdoc_lcf_OnResolveRecord;

	oDocument._setup_toolbar_buttons = _swdoc_lcf_setup_toolbar_buttons;
	oDocument._process_form_toolbar_action  = _swdoc_lcf_process_form_toolbar_action;

	oDocument._send_session_data = _swdoc_lcf_onSendSessionData;

	oDocument._complete_log_call = _swdoc_lcf_complete_log_call;
	oDocument._AttachMailMessageToCall =	_swdoc_lcf_AttachMailMessageToCall;

	
	//-- 06.05.2013 - 90754 - support lcf document level methods
	oDocument.AcceptCall = _swdoc_lcf_OnAcceptCall;
	oDocument.LogAndAssignCall = _swdoc_lcf_OnLogAndAssignCall;
	oDocument.LogAndResolveCall = _swdoc_lcf_OnLogAndResolveCall;
	oDocument.TakeCall = _swdoc_lcf_OnTakeCall;
	oDocument.LogCall = _swdoc_lcf_OnLogCall;


}

function _swdoc_lcf_process_form_toolbar_action(strID)
{
	switch(strID)
	{
		case "qlc":
			//-- loading qlcall options
			break;
		case "swtasks":
			break;
		case "attach":
			if(!app.session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANATTACHFILESTOCALLS,true)) return;
			files.fl_files.AddFiles('lcf');
			break;
		case "unattach":
			files.fl_files.RemoveFile(files.fl_files.curSel);
			app.toolbar_item_dore("lcf", "unattach" , false, document);
			break;			
		case "callaccept":
			this._OnAcceptCall();
			break;
		case "calllog":
			this._OnLogCall();
			break;
		case "calltake":
			this._OnTakeCall();
			break;
		case "callassign":
			this._OnLogAndAssignCall();
			break;
		case "callresolve":
			this._OnLogAndResolveCall();
			break;
		default:
			alert("log call toolbar action not supported : " + strID)
	}	
}


//-- nwj - 31.08.2012 - 89378
//-- wrapper for fullclient event - called before logging call so user can change values
function _swdoc_lcf_onSendSessionData()
{
	var con = {};
	con.SendValue = function(strParamName,strValue)
	{
		var strParamName = strParamName.toLowerCase();
		if(strParamName.indexOf(".")>-1)
		{
			var arrParam = strParamName.split(".");
			if(dd.tables[arrParam[0]]!=undefined && dd.tables[arrParam[0]].columns[arrParam[1]]!=undefined)
			{
				document[arrParam[0]][arrParam[1]] = strValue;
			}
		}
		else
		{
			document.opencall[strParamName] = strValue;
		}
	}
	con.SendNumber = function(strField,varValue)
	{
		this.SendValue(strField,varValue)
	}
	con.SendText = function(strField,varValue)
	{
		this.SendValue(strField,varValue)
	}
	con.SendBoolean = function(strField,varValue)
	{
		this.SendValue(strField,varValue)
	}
	con.SendString = function(strField,varValue)
	{
		this.SendValue(strField,intValue)
	}
	con.SendDate = function(strField,varValue)
	{
		this.SendValue(strField,varValue)
	}

	//-- call form document.onSendSessionData
	var strFunc ="OnSendSessionData";
	if(window[strFunc])
	{
		window[strFunc](con);
	}
}


//-- called from lcf or stf when loading related record
function _swdoc_lcf_OnResolveRecord(strTable, strColumn, strValue)
{
	app._CURRENT_JS_WINDOW = window;
	//-- 88784 - call app developer define function if not processing an incoming resolve
	if(document._ResolvingIncomingRecords) return strValue;
	var strFunc ="OnResolveRecord";
	if(window[strFunc])
	{
		strValue =  window[strFunc](strTable, strColumn, strValue);
		this._CheckFormCodeDataChange();
	}

	return strValue;
}

//-- 
//-- checks table for special fields and alerts out or sets status bar
function _swdoc_lcf_CheckSpecialFields(strTable)
{
	if(this._tables[strTable.toLowerCase()]._type == _RELATED)
	{
		for(strColID in document[strTable.toLowerCase()])
		{
			if(strColID.indexOf("_")==0) continue; //-- a object param so skip

			var strValue = document[strTable.toLowerCase()][strColID];
			if(strValue!=undefined)
			{
				strValue +=""; //-- cast
				if(strValue.indexOf("!P")==0 || strValue.indexOf("!T")==0)
				{
					//-- we have a special field
					if(strValue.indexOf("!P")==0)
					{
						//-- a popup
						var strMessage = strValue.substring(4);
						if(strMessage!="")alert(strMessage);
					}
					else
					{
						//-- status bar
						//-- a popup
						var strMessage = strValue.substring(5);
						if(strMessage!="")
						{
							document.infobar.AddItem(strMessage,"","","_lfc_specialfields");
						}
					}
				}
			}
		}
	}
}

//-- called after record is loaded into form
function _swdoc_lcf_OnRecordResolved(strTable)
{
	app._CURRENT_JS_WINDOW = window;
	this._tables[strTable.toLowerCase()]._isloaded = true;

	//-- check if related and then check for any special fields that alert a message or set message bar
	if(this._tables[strTable.toLowerCase()]._type == _RELATED)
	{
		this._CheckSpecialFields(strTable);
	}

	//-- 88784 -call app developer define function if we are not processing incoming records
	if(!document._ResolvingIncomingRecords)
	{
		var strFunc ="OnRecordResolved";
		if(window[strFunc])
		{
			window[strFunc](strTable);
			this._CheckFormCodeDataChange();
		}
	}
}

//-- called after no record is reslved or user calls it to be reset
function _swdoc_lcf_OnRecordReset(strTable)
{
	this._tables[strTable.toLowerCase()]._isloaded = false;

	//-- call app developer define function
	var strFunc ="OnRecordReset";
	if(window[strFunc])
	{
		window[strFunc](strTable);
		this._CheckFormCodeDataChange();
	}
}

function _swdoc_lcf_OnSetProfileCodeFilter(strFilter)
{
	//-- call app developer define function
	var strFunc ="OnSetProfileCodeFilter";
	if(window[strFunc]) 
	{
		strFilter = window[strFunc](strFilter);
		this._CheckFormCodeDataChange();
	}

	return strFilter;
}

function _swdoc_lcf_AttachMailMessageToCall(intCallref)
{
	//-- do we have an email to attach
	if(_swdoc_pointer._form["mailbox"]==undefined || _swdoc_pointer._form["mailbox"]=="" || _swdoc_pointer._form["emailid"]<0) return;
	if (!app.dd.GetGlobalParamAsNumber("Email Audit Trail/StoreEmailAuditTrail")) return;


	//-- Check config to see if we need to include the file attachments in the message too
	var bIncludeAttachments = dd.GetGlobalParamAsNumber("Email Audit Trail/IncludeAttachmentsInMessage");
						
	//-- We need to specify the folder to which the message should be moved to based on the options set in the DD. 
	var strMoveMessageToFolder = dd.GetGlobalParamAsString("Mail Move Folders/LogCallMailFolder");

	//-- no move to folder
	if (strMoveMessageToFolder=="")
	{
		//-- so does it tell us to move to deleted items
		if(dd.GetGlobalParamAsNumber("Email Audit Trail/MoveToDeletedItems")==1)
		{								
			strMoveMessageToFolder = "Deleted Items";
		}
	}
						
	//-- As we are going to use the Email Subject in the name of the audit trail file we are saving
	//-- we need to check it for characters that are invalid in a filename and replace them with "-"
	var strEmailSubject = "";
	if(_swdoc_pointer._form["emailsubject"]!="")
	{
		strEmailSubject = app._replaceIllegalFileCharacters(_swdoc_pointer._form["subject"]);
	}
						
	// The following function does a number of things. It tells the server to encode
	// and attach the specified message to the call. It sets the state icon of the 
	// call update to "mail-received" in this instace. If the strMoveMessageToFolder
	// contains a valid folder, it will move the specified mail message to the folder
	var res = app.global.AttachMessageToCall(_swdoc_pointer._form["mailbox"],_swdoc_pointer._form["emailid"],"Received-" + strEmailSubject + ".swm", intCallref,0,"mail-received",bIncludeAttachments,strMoveMessageToFolder);
	if(!res)
	{
		alert("There was an error attaching the originating e-mail to this request. Please contact your Administrator");
	}//end if attaching originating email was not successful
}

function _swdoc_lcf_OnCallLoggedOK(nCallRef, dateRespondBy, dateFixBy, strCustName, strSla, intCallref)
{
	//-- set any properties
	this._AttachMailMessageToCall(intCallref);
	
	//-- check if we have a workflow to add to this call
	var strParams = "_table=" + top.document._tempworkflowtable + "&_callref=" + intCallref
	var strURL = app.webroot + "/webclient/service/workflow/attach_call_workflow.php";
	var res = app.get_http(strURL, "swsessionid=" + app._swsessionid + "&"+ strParams, true, false,  null, null);
	if(res!="ok")
	{
		alert("The system failed to attach the associated workflow due to the foll0wing reason:-\n\n"+res+"\n\nPlease contact your Administrator.");
	}

	//-- so we show auto resolved values in listboxes
	document.UpdateFormFromData(undefined,true);

	//-- call app developer define function
	var strFunc ="OnCallLoggedOK";
	if(window[strFunc]) 
	{
		window[strFunc](nCallRef, dateRespondBy, dateFixBy, strCustName, strSla);
		this._CheckFormCodeDataChange();
	}

}

//-- enable disable log form buttons based on form settings
function _swdoc_lcf_setup_toolbar_buttons(oJsonFormOptions)
{
	var bAllowLog =(oJsonFormOptions.allowLog!="true")?false:true;
	var bAllowLogAssign =(oJsonFormOptions.allowLogAssign!="true")?false:true;
	var bAllowLogAccept =(oJsonFormOptions.allowLogAccept!="true")?false:true;
	var bAllowLogClose =(oJsonFormOptions.allowLogClose!="true")?false:true;
	var bAllowLogAcceptTake =(oJsonFormOptions.allowLogAcceptTake!="true")?false:true;
	var bAllowAttachments =(oJsonFormOptions.showFileAttachments!="true")?false:true;

	app.toolbar_item_dore("lcf", "calllog" , bAllowLog, document);
	app.toolbar_item_dore("lcf", "callassign" , bAllowLogAssign, document);
	app.toolbar_item_dore("lcf", "callaccept" ,bAllowLogAcceptTake , document);
	app.toolbar_item_dore("lcf", "calltake" , bAllowLogAccept, document);
	app.toolbar_item_dore("lcf", "callresolve" , bAllowLogClose, document);

	//-- file attach
	app.toolbar_item_sorh("lcf", "attach" , bAllowAttachments, document);
	app.toolbar_item_sorh("lcf", "unattach" , bAllowAttachments, document);
	
}

function _swdoc_lcf_OnAcceptCall()
{

	if(!this._OnPreValidate())return false;
	
	//-- set any properties
	//--

	//-- clear reserved opencall fields just in case
	document.opencall.fixbyx = "";
	document.opencall.respondbyx = "";

	if(app.session.currentAnalystId=="")
	{
		document.opencall.owner = app.session.analystid;
		document.opencall.suppgroup = app.session.groupId;
	}
	else
	{
		document.opencall.owner = app.session.currentAnalystId;
		document.opencall.suppgroup = app.session.currentGroupId;
	}

	//-- call app developer define function
	var res = true;
	var strFunc ="OnAcceptCall";
	if(window[strFunc]) 
	{
		res = window[strFunc]();
		this._CheckFormCodeDataChange();
	}

	if(res!=false)
	{
		this._complete_log_call("logaccept");
	}


	return true;
}

function _swdoc_lcf_OnLogAndAssignCall(strGroupID,strAnalystID)
{
	if(!this._OnPreValidate())return false;
	

	//-- popup assignment tree
	var picker = new PickAnalystDialog();
	picker.Open("Assign Request To:",false,function()
	{
		document.opencall.owner = picker.analystid;
		document.opencall.suppgroup = picker.groupid;

		//-- did not select anything
		if(document.opencall.owner=="" && document.opencall.suppgroup=="") return false;

		document.opencall.fixbyx = "";
		document.opencall.respondbyx = "";


		//-- call app developer define function
		var res = true;
		var strFunc ="OnLogAndAssignCall";
		if(window[strFunc]) 
		{
			res = window[strFunc](document.opencall.suppgroup,document.opencall.owner);
			this._CheckFormCodeDataChange();
		}
		
		if(res!=false)
		{
			this._complete_log_call("logassign");
		}

		return res;
	});


}

function _swdoc_lcf_OnLogAndResolveCall()
{
	if(!this._OnPreValidate())return false;
	
	//-- clear reserved opencall fields just in case
	document.opencall.fixbyx = "";
	document.opencall.respondbyx = "";

	if(app.session.currentAnalystId=="")
	{
		document.opencall.owner = app.session.analystid;
		document.opencall.suppgroup = app.session.groupId;
	}
	else
	{
		document.opencall.owner = app.session.currentAnalystId;
		document.opencall.suppgroup = app.session.currentGroupId;
	}


	//-- call app developer define function
	var res = true;
	var strFunc ="OnLogAndResolveCall";
	if(window[strFunc])
	{
		res= window[strFunc]();
		this._CheckFormCodeDataChange();
	}

	if(res!=false)
	{
		this._complete_log_call("logresolve");
	}


	return res;
}

function _swdoc_lcf_OnLogCall()
{
	if(!this._OnPreValidate())return false;
	
	//-- set any properties
	document.opencall.fixbyx = "";
	document.opencall.respondbyx = "";

	document.opencall.owner = "";
	document.opencall.suppgroup = app.session.currentGroupId
	if(document.opencall.suppgroup=="")	document.opencall.suppgroup = app.session.groupId

	//-- call app developer define function
	var res = true;
	var strFunc ="OnLogCall";
	if(window[strFunc])
	{
		res = window[strFunc]();
		this._CheckFormCodeDataChange();
	}

	if(res!=false)
	{
		document.opencall.status = 2; //-- unassigned
		this._complete_log_call("logcall");
	}


	return res;;
}


function _swdoc_lcf_OnTakeCall()
{
	if(!this._OnPreValidate())return false;
	
	//-- set owner to logged in analyst
	document.opencall.fixbyx = "";
	document.opencall.respondbyx = "";

	document.opencall.owner = app.session.analystid;
	document.opencall.suppgroup = app.session.groupId;

	
	//-- call app developer define function
	var res = true;
	var strFunc ="OnTakeCall";
	if(window[strFunc])
	{
		res = window[strFunc]();
		this._CheckFormCodeDataChange();
	}

	if(res!=false)
	{
		document.opencall.status = 3; //-- unaccepted
		this._complete_log_call("logtake");
	}

	return res;
}

//--
//-- use Xmlmc to log the call
function _swdoc_lcf_complete_log_call (strType)
{
	//-- set callclass
	document.opencall.callclass = this._callclass;
	
	//-- will handle fullclient onSendSessionData event 
	this._send_session_data();

	var xmlmcMethod = "logNewCall";
	var xmlmc = new XmlMethodCall();

	//-- set action as incoming
	if(_SWF_INCOMING_CALL)
	{
		xmlmc.SetParam("incomingCallref",document.GetArg("incoming.callref"));
	}

	//-- set callclass
	xmlmc.SetParam("callClass",document.opencall.callclass);

	//-- set probcode / condition / sla
	if(document.opencall.priority!="")
	{
		//-- check if a listbox option binding
		if(document._listbox_extraoptions_bindings["opencall.priority"]!=undefined)
		{
			//-- this value is meant to be set as an extra option
			var arrInfo = document._listbox_extraoptions_bindings["opencall.priority"].info;
			if(document.opencall.priority==arrInfo[0])
			{
				//-- need to parse out
				document.opencall.priority = _parse_context_vars(arrInfo[1]);
			}
		}
		if(document.opencall.priority!="")xmlmc.SetParam("slaName",document.opencall.priority);
	}

	if(document.opencall.probcode)xmlmc.SetParam("probCode",document.opencall.probcode);
	xmlmc.SetParam("condition",document.opencall.h_condition);

	//-- log date (? if from email) - have to convert
	if(document.opencall.logdatex>0)
	{
		var UTCDATE = app._date_from_epoch(document.opencall.logdatex);
		var strDateTime = app._formatDate(UTCDATE,"yyyy-MM-dd HH:mm:ss");
		xmlmc.SetParam("logDate",strDateTime);
	}

	//-- determine xmlmc method i.e. log call type
	var boolAssign = false;
	switch(strType)
	{
		case "logassign":
			boolAssign=true;
			//-- assigning call
			xmlmcMethod = "logAndAssignNewCall";
			xmlmc.SetParam("groupId",document.opencall.suppgroup);
			if(document.opencall.owner!="") xmlmc.SetParam("analystId",document.opencall.owner);
			break;
		case "logtake":
			//-- taking call
			xmlmcMethod = "logAndTakeNewCall";
			break;
		case "logaccept":
		case "logresolve":
			//-- accepting call or logging and resolving
			xmlmcMethod = "logAndAcceptNewCall";
			break;
	}

	// RF - 19/07/2017 - F0092259 - Fix to enable updatedb.timespent value to be stored on the call record.
	if(document.updatedb.timespent!=0)xmlmc.SetParam("timeSpent", document.updatedb.timespent);
	//-- update message
	if(document.updatedb.updatetxt!="")xmlmc.SetParam("updateMessage",document.updatedb.updatetxt);
	xmlmc.SetParam("updateCode","Logging");
	var strSource = (_swdoc_pointer._form["emailid"]>0)?"E-Mail":"Telephone";
	xmlmc.SetParam("updateSource",strSource);

	if(boolAssign)
	{
		xmlmc.SetParam("forceAssignment",true);
	}

	var strAdditionalLogCallValues = "";
	var strAdditionalLogOpencallValues = "";
	var strAdditionalLogUpdatedbValues = "";
	var strLogCallExtendedValues = "";
	//-- set and opencall data params
	var rec = document.GetRecord("opencall");			
	if(rec)
	{
		var nColCount = rec.GetCount();
		for(var x=0; x<nColCount; x++)
		{
			//-- store value
			var strFieldName = rec.GetColumnName(x);
			var varSendValue = rec.GetValue(x);

			//-- set by a listbox extra value??
			if(varSendValue.indexOf("&[")==0)
			{
				varSendValue = _parse_context_vars(varSendValue);
				rec[strFieldName] = varSendValue;
			}
			else if(document._listbox_extraoptions_bindings["opencall." + strFieldName]!=undefined)
			{
				//-- this value is meant to be set as an extra option
				var arrInfo = document._listbox_extraoptions_bindings["opencall." + strFieldName].info;
				if(varSendValue==arrInfo[0])
				{
					//-- need to parse out
					varSendValue = _parse_context_vars(arrInfo[1]);
					rec[strFieldName] = varSendValue;

				}
			}

			//-- if numeric and empty or 0 then do not send
			//-- if string an d "" then do not send
			if(app.dd.tables["opencall"].columns[strFieldName]==undefined) continue;

			if(app.dd.tables["opencall"].columns[strFieldName].IsNumeric())
			{
				if(varSendValue==0 || varSendValue=="" || varSendValue==undefined || varSendValue=="undefined") continue;
			}
			else
			{
				if(varSendValue=="" || varSendValue==undefined || varSendValue=="undefined") continue;
			}

			if(strAdditionalLogOpencallValues=="")strAdditionalLogOpencallValues="<opencall>";
			strAdditionalLogOpencallValues+="<"+strFieldName+">" + app.pfx(varSendValue) + "</"+strFieldName+">";
		}
		if(strAdditionalLogOpencallValues!="")strAdditionalLogOpencallValues+="</opencall>";
	}

	//-- process updatedb
	var rec = document.GetRecord("updatedb");			
	if(rec)
	{
		var nColCount = rec.GetCount();
		for(var x=0; x<nColCount; x++)
		{
			//-- store value
			if(!rec.IsModified(x))continue;
			var strFieldName = rec.GetColumnName(x);

			var varSendValue = rec.GetValue(x);
			if(varSendValue.indexOf("&[")==0)
			{
				varSendValue = _parse_context_vars(varSendValue);
				rec[strFieldName] = varSendValue;
			}
			else if(document._listbox_extraoptions_bindings["updatedb." + strFieldName]!=undefined)
			{
				//-- this value is meant to be set as an extra option
				var arrInfo = document._listbox_extraoptions_bindings["updatedb." + strFieldName].info;
				if(varSendValue==arrInfo[0])
				{
					//-- need to parse out
					varSendValue = _parse_context_vars(arrInfo[1]);
					rec[strFieldName] = varSendValue;
				}
			}
			if(strAdditionalLogUpdatedbValues=="")strAdditionalLogUpdatedbValues="<updatedb>";
			strAdditionalLogUpdatedbValues+="<"+strFieldName+">" + app.pfx(varSendValue) + "</"+strFieldName+">";
		}
		if(strAdditionalLogUpdatedbValues!="")strAdditionalLogUpdatedbValues+="</updatedb>";
	}

	/* 26.05.2011 - xmlmc now saves ext data */
	//-- process extended details table
	/*
	if(this._exttable!=null)
	{
		var nColCount = this._exttable.GetCount();
		for(var x=0; x<nColCount; x++)
		{
			if(!this._exttable.IsModified(x))continue;
			//-- store value
			var strFieldName = this._exttable.GetColumnName(x);

			var varSendValue = this._exttable.GetValue(x);
			if(varSendValue.indexOf("&[")==0)
			{
				varSendValue = _parse_context_vars(varSendValue);
				this._exttable[strFieldName] = varSendValue;
			}

			if(strLogCallExtendedValues=="")strLogCallExtendedValues="<"+this._exttable._name+">";
			strLogCallExtendedValues+="<"+strFieldName+">" + app.pfx(varSendValue) + "</"+strFieldName+">";
		}
		if(strLogCallExtendedValues!="")strLogCallExtendedValues+="</"+this._exttable._name+">";
	}
	*/


	//-- set any info about file attachments
	try
	{
		var affLen = files.fl_files.rowCount();
		for(var x=0;x<affLen;x++)
		{
			var strFileName = files.fl_files.GetItemText(x,0);
			var strFileAtts = "<embeddedFileAttachment><fileName>" + app.pfx(strFileName) + "</fileName></embeddedFileAttachment>";
			xmlmc.SetParamAsComplexType("fileAttachment", strFileAtts);
		}	
	}
	catch (e)
	{
	}
	//-- if we have additional call values send them
	strAdditionalLogCallValues = strAdditionalLogOpencallValues + strAdditionalLogUpdatedbValues + strLogCallExtendedValues;
	if(strAdditionalLogCallValues!="") xmlmc.SetParamAsComplexType("additionalCallValues",strAdditionalLogCallValues);


	//-- set any updatedb data params
	if(xmlmc.Invoke("helpdesk",xmlmcMethod))
	{
		var intCallref = xmlmc.GetReturnValue("callref");

		//-- create ext table - temp work around while xmlmc does not work
		// 26.05.2011 - xmlmc defect fixed no longer needed as ext details saved as part of xmlmc call 
		//-- 28.06.2011 - actually xmlmc defect is not fixed
		if(this._exttable!=null)
		{
			//-- ensure ext table key col is set
			this._exttable._keyvalue = "";
			this._exttable._columns[this._exttable._keycolumn].originalvalue = "";
			this._exttable._columns[this._exttable._keycolumn].value = intCallref;
			_swdoc[this._exttable._name][this._exttable._keycolumn] = intCallref;
			this._exttable._savedata();
		}
		


		var respEpoch = 0;
		var fixEpoch = 0;

		//-- get respond by / fix by dates
		var strRespondBy = app.string_replace(xmlmc.GetReturnValue("respondBy"),"Z","");
		var strFixBy = app.string_replace(xmlmc.GetReturnValue("fixBy"),"Z","");
		if(strRespondBy!="")
		{
			var respDate = app._parseDate(strRespondBy,"yyyy-MM-dd HH:mm:ss");
			var fixDate = app._parseDate(strFixBy,"yyyy-MM-dd HH:mm:ss");

			//-- now convert to epoch
			var respEpoch = app._date_to_epoch(respDate);
			var fixEpoch = app._date_to_epoch(fixDate);
		}

		//-- use new formatted callrtef if available
		var strCallref = xmlmc.GetReturnValue("formattedcallref");
		if(strCallref=="")strCallref=app.dd.tables['opencall'].columns['callref'].FormatValue(intCallref);

		var supportGroup = xmlmc.GetReturnValue("supportGroup");
		var supportOwner = xmlmc.GetReturnValue("owner");
		var strCustomerName = xmlmc.GetReturnValue("customerName");
		var slaName = xmlmc.GetReturnValue("sla");		
		var intSLAtz = xmlmc.GetReturnValue("slaTimeZoneOffset");
		var strSlaTzName = xmlmc.GetReturnValue("slaTimeZoneName");

		var msgArray = new Array();
		msgArray[0] = strCallref;
		msgArray[1] = strCustomerName;
		if(slaName!="")
		{
			msgArray[2] = strSlaTzName;
			msgArray[3] = app.format_analyst_datetime(app._date_from_epoch(respEpoch,intSLAtz));
			msgArray[4] =  app.format_analyst_datetime(app._date_from_epoch(fixEpoch,intSLAtz));
			msgArray[5] = app._analyst_timezone;
			msgArray[6] = app.format_analyst_datetime(app._date_from_epoch(respEpoch,app._analyst_timezoneoffset));
			msgArray[7] =  app.format_analyst_datetime(app._date_from_epoch(fixEpoch,app._analyst_timezoneoffset));
		}

		document.opencall.callref = intCallref;
		document.opencall.fixbyx = fixEpoch;
		document.opencall.respondbyx = respEpoch;
		document.opencall.owner = supportOwner;
		document.opencall.suppgroup = supportGroup;

		//-- any on call logged ok events
		this._OnCallLoggedOK(strCallref,respEpoch,fixEpoch,strCustomerName,slaName,intCallref);

		//--
		//-- check if we have app.js function to handle alerting of call info
		var bAlert = true;
		if(app.OnNewCallLogged!=undefined)
		{
			bAlert = app.OnNewCallLogged(intCallref, document.opencall.callclass);
			
		}
		if(bAlert)
		{
		
			var lcfConfirmationCallback = function(oForm){
				if(oForm!=null) 
				{
					if(oForm.opendetail) app._open_call_form("",intCallref,false,window);
					if(oForm.emailcustomer)
					{
						//-- open log call email
						var strUpdateText = "";
						if(document.updatedb.updatetxt!="")strUpdateText = document.updatedb.updatetxt;
						 //-- added 8th param for wc only - 87198
						app.global.ComposeCallUpdateEmail(intCallref+"", 0, strUpdateText, intCallref+".0", 360, "LogCallMailTemplate", 1, null,document.opencall.callclass);
					}
				}
				
				if(strType=="logresolve")
				{
					//-- popup the resolve form
					app._resolveclosecallform(intCallref);
				}


				//-- fetch new call data so it is immediately shown
				if(app._CurrentOutlookType=="helpdesk") 
				{
					app._get_servicedesk_newcall_data(document.opencall.callref);
				}

				//-- tidy up tep files etc	
				document.CloseForm();
			}
				
			//-- 18.10.2011 - popup message
			var strParams = "_messagearray=" + msgArray;
			app._open_system_form("lcfconfirmation.php","logcallconfirm","",strParams,true,lcfConfirmationCallback,null,window,350,270);

		}
		else
		{
			if(strType=="logresolve")
			{
				//-- popup the resolve form
				app._resolveclosecallform(intCallref);
			}


			//-- fetch new call data so it is immediately shown
			if(app._CurrentOutlookType=="helpdesk") 
			{
				app._get_servicedesk_newcall_data(document.opencall.callref);
			}

			//-- tidy up tep files etc	
			document.CloseForm();
		}
	}
	else
	{
		alert(xmlmc._lasterror);
	}
}



//-- quicklog functions
function _swdoc_lcf_run_quicklog(intQuicklogID)
{
	//-- clear current data

	//-- given ql id get xml and then process
	//-- call php to dump any files into forms temp location and update file attachments
}

//-- save as quicklog
function _swdoc_lcf_save_quicklog()
{
}


//--
//--
//-- info bar object
var _sw_arr_infobar_timers = new Array();
function _sw_inforbar_timer(nBar)
{
	if(_sw_arr_infobar_timers[nBar]!= undefined)
	{
		_sw_arr_infobar_timers[nBar].ShowNextItem();
	}
}

function _sw_infobar()
{
	this._intervalid = -1;
	this._currgroupid = "";
	this._currgrouppos = -1;
	this._groups = new Array();
	this.cycling=false;
	this._timerarrpos = _sw_arr_infobar_timers.length;
	_sw_arr_infobar_timers[_sw_arr_infobar_timers.length++] = this;
}
_sw_infobar.prototype.StartAutoCycle = function(intMillSeconds)
{
	//-- F0091913 - default to 1 sec
	if(intMillSeconds==undefined)intMillSeconds=1000;
	this.cycling=true;
	this._intervalid = setInterval('_sw_inforbar_timer('+this._timerarrpos+')',intMillSeconds);
	return true;
}
_sw_infobar.prototype.RemoveItemsByGroup = function(strGroup)
{
	this._groups[strGroup] = new Array();
	return true;
}
_sw_infobar.prototype.RemoveAllItems = function()
{
	clearInterval(this._intervalid);
	this._intervalid=-1;
	this.cycling=false;
	this._groups = new Array();
	window.status = "";
	return true;
}
_sw_infobar.prototype.ShowPrevItem = function()
{
	return true;
}
_sw_infobar.prototype.ShowNextItem = function()
{
	var strFirstGroup = ""
	var strPrevGroup = ""
	var strNextGroup = "";
	var strLastGroup = "";
	for(strGroup in this._groups)
	{
		if(this._groups[strGroup].length==0)continue;

		if (strFirstGroup=="")
		{
			strFirstGroup = strGroup;
		}

		if(this._currgroupid==strPrevGroup)strNextGroup = strGroup;

		strPrevGroup = strGroup;
	}
	if(strNextGroup=="")strNextGroup = strFirstGroup;
	strLastGroup = strGroup;

	if(this._currgroupid=="")
	{
		this._currgroupid = strFirstGroup;
		this._currgrouppos = 0;
	}

	var arr = this._groups[this._currgroupid];
	var strStatus = arr[this._currgrouppos++];
	if(strStatus==undefined)
	{
		this._currgrouppos = 0;
		if(this._currgroupid == strLastGroup)
		{
			this._currgroupid = strFirstGroup;
		}
		else
		{
			this._currgroupid = strNextGroup;
		}
		var arr = this._groups[this._currgroupid];
		var strStatus = arr[this._currgrouppos++];
	}
	window.status = strStatus;
	return true;
}

_sw_infobar.prototype.GetItemCount = function()
{
	var intc = 0;

	for(strGroup in this._groups)
	{
		intc = intc + this._groups[strGroup].length;
	}
	return intc;
}

_sw_infobar.prototype.GetGroupItemCount = function(strGroup)
{
	if(this._groups[strGroup]==undefined) return 0;
	return this._groups[strGroup].length;
}


_sw_infobar.prototype.AddItem = function (strMessage,strColor,strIcon,strGroup)
{
	if(strGroup==undefined)	strGroup = "_";
	if(this._groups[strGroup]==undefined)this._groups[strGroup] = new Array();
	this._groups[strGroup][this._groups[strGroup].length++] = strMessage;

	//-- F0091913 - if not cycling then just show next item
	if(this._intervalid==-1)this.ShowNextItem();

	return true;
}
//-- end of infobar
