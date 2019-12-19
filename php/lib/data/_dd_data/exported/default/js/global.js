//--
//-- wrappers for easy webclient migration - place in app.global.js of application
//-- 
//-- if you use these wrappers then you will not need to alter alot of the js for the webclient when you do customisations in the fullclient
//--
//--
//-- set elements value
//-- usage _eva(tb_custid,'neilwj');
function old_eva(oEle,varValue)
{
	_eva(oEle , varValue);
}

//-- set elements text
//-- usage _ete(tb_custid,'neilwj');
function old_ete(oEle,varValue)
{
	_ete(oEle , varValue);
}

//-- enable / disable an ele
//-- usage _een(tb_custid,true); / _een(tb_custid,false); / _een(mainform.tb_custid,true);
function old_een(oEle,boolEnable)
{
	_een(oEle , boolEnable);
}

//-- readonly an ele
//-- usage _ero(tb_custid,true); / _ero(tb_custid,false); / _ero(mainform.tb_custid,true);
function old_ero(oEle,boolRO)
{
	_ero(oEle , boolRO);
}

//-- mand an ele
//-- usage _ema(tb_custid,true); / _ema(tb_custid,false); / _ema(mainform.tb_custid,true);
function old_ema(oEle,boolMandatory)
{
	_ema(oEle , boolMandatory);
}

//-- visible an ele
//-- usage _evi(tb_custid,true); / _evi(tb_custid,false); / _evi(mainform.tb_custid,true);
function old_evi(oEle,boolVisible)
{
	_evi(oEle , boolVisible);
}

//--
//-- sqllist specific properties wrappers

//-- set filter
function old_slf(oEle, strFilter)
{
	_slf(oEle ,strFilter);
}

//-- set rawsql
function old_slraw(oEle, strSQL)
{
	_slraw(oEle ,strSQL);
}

//-- set image
function old_eim(oEle,strURI)
{
	_eim(oEle , strURI);
}

//-- set tab
function old_etab(oEle,nTab)
{
	_etab(oEle , nTab);
}

//-- set dataref
function _edataref(oEle,strBinding)
{
	_edataref(oEle , strBinding);
}

//--
//--




//--
//-- C O N F I G U R A T I O N  S P E C I F I C  M E T H O D S
//--

//-- STATUS ARRAY - do not remove as used as part of browse_calls form
var ARR_CALL_STATUS = new Array();
ARR_CALL_STATUS["pending"]=1;
ARR_CALL_STATUS["unassigned"]=2;
ARR_CALL_STATUS["unaccepted"]=3;
ARR_CALL_STATUS["on hold"]=4;
ARR_CALL_STATUS["off hold"]=5;
ARR_CALL_STATUS["resolved"]=6;
ARR_CALL_STATUS["defered"]=7;
ARR_CALL_STATUS["incoming"]=8;
ARR_CALL_STATUS["escalated(o)"]=9;
ARR_CALL_STATUS["escalated(g)"]=10;
ARR_CALL_STATUS["escalated(a)"]=11;
ARR_CALL_STATUS["lost call!!!"]=15;
ARR_CALL_STATUS["closed"]=16;
ARR_CALL_STATUS["cancelled"]=17;
ARR_CALL_STATUS["closed(chg)"]=18;

function get_status_from_text(strValue,boolLike)
{
	var strStatusValues = "0";
	for(strStatus in ARR_CALL_STATUS)
	{
		if(strStatus.indexOf(LC(strValue))!=-1)
		{
			//-- have a match
			strStatusValues+="," + ARR_CALL_STATUS[strStatus];
		}
	}
	return strStatusValues;
}


//-- application object
var RAISE_RFC_FROM_INCIDENT = null;
var RAISE_PRB_FROM_INCIDENT = null;
var RAISE_RFC_FROM_PROBLEM = null;
var RAISE_RFC_FROM_ISSUE = null;
var LOG_CALL_FOR_USER = null;
var LOG_FOR_ORGID = null;
var LOG_CALL_FOR_ASSET = null;

function oConfigMethods()
{
	this.array_openrfcdocs = new Array();
}
var cfg = new oConfigMethods();

oConfigMethods.prototype.somefunction = cfg_somefunction;
function cfg_somefunction()
{
}


//-- check contract use against a call - logging
oConfigMethods.prototype.process_call_contract_check=cfg_process_call_contract_check
function cfg_process_call_contract_check(strAssetID, boolLogging,oDoc)
{
	//-- only run if support ext companies
	if(dd.GetGlobalParamAsString("Application Settings/SupportExternalCompanies")!=1) return "";

	//-- get list of contracts for associated CIs
	var strInvalidItems = "";
	var array_slacontracts = new Array();
	var strSLAS = "'" + app.g.pfs(oDoc.opencall.priority)+ "'";
	var strSelect = "select FK_PRIORITY, FK_MANAGER, PK_CONTRACT_ID, FLG_VALID, FLG_ALWAYSSUPPORT, ASSET_TITLE from CONTRACT, EQUIPMNT where FK_CONTRACT_ID = PK_CONTRACT_ID and EQUIPID = '" + app.g.pfs(strAssetID) + "'";
	
	var oRS = app.g.get_recordset(strSelect,"swdata");
	if(oRS.Fetch())
	{
	
		var strAssetDesc = app.g.get_field(oRS,"ASSET_TITLE");
		var strValid = app.g.get_field(oRS,"FLG_VALID");
		var strAlwaysOn = app.g.get_field(oRS,"FLG_ALWAYSSUPPORT");
		var boolSupport = ((strValid=="1") || (strAlwaysOn=="1"));
		
		//-- store sla & contract
		var currSLA = app.g.get_field(oRS,"FK_PRIORITY");
		array_slacontracts[currSLA] = app.g.get_field(oRS,"PK_CONTRACT_ID");

		//-- if not support record so we can alert
		if(!boolSupport)
		{
			strInvalidItems = strAssetDesc + " ("+strAssetID+")";
		}
		else
		{
			strSLAS += ",'" + app.g.pfs(currSLA) + "'";
		}
	}	
	
	//-- alert user to which items do not have valid support
	if(strInvalidItems!="")
	{
		var oAnalyst = app.g.get_analyst_detail(app.g.get_field(oRS,"FK_MANAGER"));
		var strAnalystMsg = (oAnalyst)? "(" + oAnalyst.id + ") " + oAnalyst.name:app.g.get_field(oRS,"FK_MANAGER")
		MessageBox(strInvalidItems + " does not have a valid support contract (" + app.g.get_field(oRS,"PK_CONTRACT_ID")+ ") please process as required. The contract is managed by "+ strAnalystMsg);
	}

	//-- get the shortest sla i.e. least overall time
	var strBestSLA = app.g.get_shortest_sla(strSLAS);
	if((strBestSLA!=oDoc.opencall.priority)&&(strBestSLA!=""))
	{
		if(confirm("This request currently has a longer overall response and fix time than the best contracted SLA. Would you like to change the SLA?"))
		{
			if(boolLogging)
			{
				oDoc.opencall.priority = strBestSLA;
				oDoc.opencall.fk_contract_id = array_slacontracts[strBestSLA];
				oDoc.UpdateFormFromData();
			}
			else
			{
				if(app.g.new_dairyevent(oDoc.opencall.callref,"The priority on this request was changed due to a contracted asset change.","Asset Change","Priority Update (contract)",strBestSLA))
				{
					oDoc.opencall.fk_contract_id = array_slacontracts[strBestSLA];
					oDoc.Save(0);

				}
			}
		}
	}
}



//--
//-- ITSM object - used to store ITSM template methods
//--

//-- Constants for ITSM permissions
//-- groups
var AP_SETTINGS = 1;
var PG_INC=2;
var PG_PRB=3;
var PG_RFC=4;


//-- INC group items
var INC_CREATE=1;
var INC_EDIT=2;
var INC_CANCEL=3;
var INC_RESOLVE=4;

//-- PRB group items
var PRB_CREATE=1;
var PRB_EDIT=2;
var PRB_CANCEL=3;
var PRB_RESOLVE=4;


//-- RFC group items
var RFC_CREATE=1;
var RFC_EDIT=2;
var RFC_CANCEL=3;
var RFC_RESOLVE=4;
var RFC_AUTHCANCEL=5;

function oITSM()
{
	//--
}

var itsm = new oITSM();
app.global.itsm = itsm;

//-- Global function to handle the xmlmc required for adding atachments to calls.
//-- Used in call action forms.
oITSM.prototype.addAttachmentsToCallXmlmc = itsm_addAttachmentsToCallXmlmc;
function itsm_addAttachmentsToCallXmlmc(fl_attachslist, xmlmc)
{
	// -- File(s) located on the server that will be attached to the Call
	// -- Used to set "fileAttachment" param of UpdateCalls API
	for (var i=0; i<fl_attachslist.rowCount(); i++)
	{
		var fileName = fl_attachslist.GetItemText(i,3);
		var serverFile = fileName.indexOf("MFA:");

		if (serverFile < 0)
		{
			// -- Uploaded File - Set filename and filedata for fileAttachment param
			var strFileName = fl_attachslist.GetItemText(i,0);
			var strData = app.global.LoadFileInBase64(fl_attachslist.GetItemText(i,3));
			var strXML = "<fileName>"+strFileName+ "</fileName>";
			if (!app.bWebClient)
				strXML += "<fileData>"+strData+"</fileData>";
			xmlmc.SetParamAsComplexType("fileAttachment",strXML);
		}
	}
	// -- File(s) such as embedded files that will be attached to the call
	// -- Used to set "serverFileAttachment" param of UpdateCalls API
	for (var i=0; i<fl_attachslist.rowCount(); i++)
	{
		var fileName = fl_attachslist.GetItemText(i,3);
		var serverFile = fileName.indexOf("MFA:");

		if (serverFile >= 0)
		{
			// -- Attached File - Set filename and filesource for serverFileAttachment param
			var strFileName = fl_attachslist.GetItemText(i,0);
			var strData = fl_attachslist.GetItemText(i,3);
			var strXML = "<fileName>"+strFileName+ "</fileName>";

			if (!app.bWebClient)
				strXML += "<fileSource>"+strData+"</fileSource>";

			xmlmc.SetParamAsComplexType("serverFileAttachment",strXML);
		}
	}
}

//-- handle sla matrix change for a call _swdoc
oITSM.prototype.handle_sla_matrix_change = itsm_handle_sla_matrix_change;
function itsm_handle_sla_matrix_change(oDoc)
{
	if(oDoc.strMatrixSLA=="") return;
	if(confirm("The recommended SLA to be used for this " + oDoc.opencall.callclass + " is " + oDoc.strMatrixSLA + ". Would you like to use the recommended SLA?"))
	{	
		//-- call vpme script to alter sla
		var xmlmc = new XmlMethodCall;
		
		// Set up our input parameters
		xmlmc.SetValue("in_callref", oDoc.opencall.callref);
		xmlmc.SetValue("in_sla", oDoc.strMatrixSLA);
		
		// Invoke the method
		if(xmlmc.Invoke("VPME", "itsmfImpactUrgencyChange"))
		{
			//MessageBox(xmlmc.GetReturnValue("res1"));
			oDoc.UpdateFormFromData();
		}
		else
		{
			MessageBox(xmlmc.GetLastError());
		}				
	}
}

//--
//-- load itsm sla from matrix
oITSM.prototype.get_sla_frommatrix = itsm_get_sla_frommatrix;
function itsm_get_sla_frommatrix(strImpact, strUrgency)
{
	var strSLA = "";
	var strSelect = "select fk_sla from itsm_slamatrix where fk_impact = '" + app.g.pfs(strImpact) + "' and fk_urgency = '" + app.g.pfs(strUrgency) + "'";
	var oRS = app.g.get_recordset(strSelect,"swdata");
	if(oRS.Fetch())
	{
		strSLA = app.g.get_field(oRS,"fk_sla");
	}
	return strSLA;
}


//--
//-- can analyst edit a call of a class (based on permissions loaded at start up)
oITSM.prototype.can_modify_authrequest = itsm_can_modify_authrequest;
function itsm_can_modify_authrequest()
{
	return 	app.session.HaveAppRight(PG_RFC, RFC_AUTHCANCEL,app.session.dataDictionary);;
}

//--
//-- can analyst edit a call of a class (based on permissions loaded at start up)
oITSM.prototype.can_edit = itsm_can_edit;
function itsm_can_edit(strCallClass,boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolEdit = true;
	var strClass = "";
	switch(strCallClass.toLowerCase())
	{
		case "incident":
			boolEdit = app.session.HaveAppRight(PG_INC, INC_EDIT,app.session.dataDictionary);
			break;
		case "problem":
			boolEdit = app.session.HaveAppRight(PG_PRB, PRB_EDIT,app.session.dataDictionary);
			break;
		case "change request":
			boolEdit = app.session.HaveAppRight(PG_RFC, RFC_EDIT,app.session.dataDictionary);
			break;
	}

	if((!boolEdit)&&(boolMSG))
	{
		MessageBox("You are not authorised to modify " + strCallClass + " records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}

	return boolEdit;
}

//--
//-- can analyst create a call of a class (based on permissions loaded at start up)
oITSM.prototype.can_create = itsm_can_create;
function itsm_can_create(strCallClass,boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCreate = true;
	var strClass = "";
	switch(strCallClass.toLowerCase())
	{
		case "incident":
			boolCreate = app.session.HaveAppRight(PG_INC, INC_CREATE,app.session.dataDictionary);
			break;
		case "problem":
			boolCreate = app.session.HaveAppRight(PG_PRB, PRB_CREATE,app.session.dataDictionary);
			break;
		case "change request":
			boolCreate = app.session.HaveAppRight(PG_RFC, RFC_CREATE,app.session.dataDictionary);
			break;
	}

	if((!boolCreate)&&(boolMSG))
	{
		MessageBox("You are not authorised to create " + strCallClass + " records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}

	return boolCreate;
}

//--
//-- can analyst cancel a call of a class (based on permissions loaded at start up)
oITSM.prototype.can_cancel = itsm_can_cancel;
function itsm_can_cancel(strCallClass,boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCancel = true;
	var strClass = "";
	switch(strCallClass.toLowerCase())
	{
		case "incident":
			boolCancel = app.session.HaveAppRight(PG_INC, INC_CANCEL,app.session.dataDictionary);
			break;
		case "problem":
			boolCancel = app.session.HaveAppRight(PG_PRB, PRB_CANCEL,app.session.dataDictionary);
			break;
		case "change request":
			boolCancel = app.session.HaveAppRight(PG_RFC, RFC_CANCEL,app.session.dataDictionary);
			break;
	}

	if((!boolCancel)&&(boolMSG))
	{
		MessageBox("You are not authorised to cancel " + strCallClass + " records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}

	return boolCancel;
}


//--
//-- can analyst resolve a call of a class (based on permissions loaded at start up)
oITSM.prototype.can_resolve = itsm_can_resolve;
function itsm_can_resolve(strCallClass,boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolResolve = true;
	var strClass = "";
	switch(strCallClass.toLowerCase())
	{
		case "incident":
			boolResolve = app.session.HaveAppRight(PG_INC, INC_RESOLVE,app.session.dataDictionary);
			break;
		case "problem":
			boolResolve = app.session.HaveAppRight(PG_PRB, PRB_RESOLVE,app.session.dataDictionary);
			break;
		case "change request":
			boolResolve = app.session.HaveAppRight(PG_RFC, RFC_RESOLVE,app.session.dataDictionary);
			break;
	}

	if((!boolResolve)&&(boolMSG))
	{
		MessageBox("You are not authorised to resolve " + strCallClass + " records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}

	return boolResolve;
}


//--
//--
//-- D O  N O T  A L T E R  T H E  B E L O W
//--
//--

//--
//-- C O N T R O L L E D  G L O B A L  F U N C T I O N S
//-- A N D  V A R I A B L E S  F R O M  C . V . S
//-- 

//--
//-- Declare global variables

//-- DebugMode: set to 1 in order to display error messages from the debug() function, otherwise set to 0
var DebugMode  = true;

//-- global constants
var FE_SEARCHFIELD = 20;
var undefined;
var UNDEFINED;

//-- Message Return Contants
var MSG_YES = 6;
var MSG_NO  = 7;
var MSG_CANCEL = 2
var PRIV_ADMIN = 3;

//-- record states
var CALL_RESOLVED = 6;
var CALL_ACCEPTED = 1;
var CALL_CANCELLED = 17;
var CALL_ONHOLD = 4;



//-- create a global constructor
//-- so developer can reference global functoins using
//-- app.g.functionname;
function fglobal()
{
	//-- This is a global container
	this.array_open_me_documents = new Array();
}
var g = new fglobal();

//-- so in app you use app.g.funcname

//--
//-- G L O B A L  M E T H O D S  D O  N O T  A L T E R
//--



//-- get calls last update text (full0
fglobal.prototype.get_call_last_updatetxt = pt_get_call_last_updatetxt;
function pt_get_call_last_updatetxt(intCallref, boolCache, targetformField)
{
	var strDB = (boolCache)?"syscache":"swdata";
	var strSQL = "select MAX(UDINDEX) as UDI from UPDATEDB where CALLREF = " + intCallref;
	var oRS = this.get_recordset(strSQL, strDB);
	if(oRS.Fetch())
	{
		var strUDI = this.get_field(oRS,"UDI")
		return this.get_call_updatetxt(intCallref, boolCache, strUDI, targetformField);		
	}

	return "<Last update text not found please contact your Administrator>";
}

fglobal.prototype.get_call_first_updatetxt = pt_get_call_first_updatetxt;
function pt_get_call_first_updatetxt(intCallref, boolCache, targetformField)
{
	//-- F0092000
	var strReturn = this.get_call_updatetxt(intCallref, boolCache, 0, targetformField);
	if(!boolCache)
	{
		if(strReturn=="<update text not found please contact your Administrator>")
		{
			var strReturn = this.get_call_updatetxt(intCallref, true, 0, targetformField);
		}
	}

	return strReturn;
}

fglobal.prototype.get_call_updatetxt = pt_get_call_updatetxt;
function pt_get_call_updatetxt(intCallref, boolCache, intUDINDEX, targetformField)
{
	var strUpdateText =  "<update text not found please contact your Administrator>";
	var strDB = (boolCache)?"syscache":"swdata";
	var strSql = "select UPDATETXT from UPDATEDB where CALLREF = " + intCallref + " and UDINDEX = " + intUDINDEX;
	var oRS = this.get_recordset(strSql, strDB);
	if(oRS.Fetch())
	{
		strUpdateText = this.get_field(oRS,"UPDATETXT")
	}

	if(targetformField!=undefined)_ete(targetformField, strUpdateText);
	return strUpdateText;
}


//-- NWJ - 01.05.2008 - functions that help manage the refreshing of form sqllists within client
//--					as previously would update task but there parent form was not refreshed.

//-- add call and its _swdoc to array
fglobal.prototype.add_me_document = pt_add_me_document;
function pt_add_me_document(strMeType,varKeyValue,oDocument)
{
	if(!this.array_open_me_documents[strMeType])this.array_open_me_documents[strMeType] = new Array();
	this.array_open_me_documents[strMeType][varKeyValue] = oDocument;
}

//-- set call in to array to false so will not open (cannot remove as not indexed)
fglobal.prototype.remove_me_document = pt_remove_me_document;
function pt_remove_me_document(strMeType,varKeyValue)
{
	if(!this.array_open_me_documents[strMeType])this.array_open_me_documents[strMeType] = new Array();
	this.array_open_me_documents[strMeType][varKeyValue] = false;
}

//-- set call in to array to false so will not open (cannot remove as not indexed)
fglobal.prototype.get_me_document = pt_get_me_document;
function pt_get_me_document(strMeType,varKeyValue)
{
	if(!this.array_open_me_documents[strMeType])this.array_open_me_documents[strMeType] = new Array();

	if(this.array_open_me_documents[strMeType][varKeyValue])return this.array_open_me_documents[strMeType][varKeyValue];
	return false;
}


//-- resolve an unbound record to mainform and extform for a given field prefix
fglobal.prototype.resolve_unbound_record = pt_resolve_unbound_record;
function pt_resolve_unbound_record(strTable,strResolveCol,strResolveValue,strFieldPrefix, aDoc, boolAutoResolve, boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	if(boolAutoResolve==undefined)boolAutoResolve=false;
	var oRec = false;
	var strOp = (boolAutoResolve)?" like ":" = ";
	var strWhere = strResolveCol + strOp + app.g.encapsulate(strTable,strResolveCol,strResolveValue);
	
	//-- get record count
	var intCount = app.g.get_rowcount(strTable,strWhere);
	if(intCount==0)
	{
		//-- no matches
		if(boolMSG)MessageBox("No matching record was found in table (" + strTable +") where (" + strWhere + ")");
	}
	else if(intCount==1)
	{
		//-- resolve
		oRec = app.g.get_recordwhere(strTable, strWhere);
		if(oRec)
		{
			this.set_unbound_values(aDoc.mainform, oRec, strFieldPrefix,aDoc);
		}
	}
	else if(intCount>1)
	{
		//-- more than one record - popup pickrecord form
		if(boolMSG) MessageBox("More than one matching record was found. This indicates that there is a data issue in table (" + strTable +") where (" + strWhere + ")");
		//-- MessageBox("Raise record picker");
	}
	
	return oRec;
}

fglobal.prototype.set_unbound_values = pt_set_unbound_values;
function pt_set_unbound_values(oForm, oRec, strFieldPrefix,oDoc)
{
	//-- get array of fields that match field prefix
	var boolDataBindUpdated = false;
	var strFieldName="";
	var oEle;
	for(var x=0;x<oForm.elements.length;x++)
	{
		oEle = oForm.elements[x];
		if(oEle.name.indexOf(strFieldPrefix)==0)
		{
			var arrFieldInfo = oEle.name.split("__");
			if(arrFieldInfo.length>1)
			{
				strFieldName = arrFieldInfo[2];
				_eva(oEle , oRec[strFieldName]);
				if((oEle.dataRef!="")&&(oDoc!=undefined))
				{
					var arrBindInfo = oEle.dataRef.split(".");
					var strTable = arrBindInfo[0];
					var strTableCol = arrBindInfo[1];
					oDoc[strTable][strTableCol] = oRec[strFieldName];
					boolDataBindUpdated = true;
				}
			}
		}
	}

	if(boolDataBindUpdated)oDoc.UpdateFormFromData();

}

//-- pass in field element - expects name as
//-- ar_<someid>__<dbtable>__<dbcolname>
fglobal.prototype.autoresolve_unbound_field = pt_autoresolve_unbound_field;
function pt_autoresolve_unbound_field(oEle,aDoc)
{
	//-- is this an auto resolve field
	if(oEle.name.indexOf("ar_")!=0) return false;
	
	var arrFieldInfo = oEle.name.split("__");
	if(arrFieldInfo.length > 1)
	{
		var strFieldPrefix = arrFieldInfo[0];
		var strResolveTable = arrFieldInfo[1];
		var strResolveCol = arrFieldInfo[2];
		
		//-- check if a string col
		var boolNumeric = app.g.dd_isnumeric(strResolveTable,strResolveCol);
		var strResolveValue = (!boolNumeric)?oEle.value + "%":oEle.value;
	
		//-- expand field prefix so its near error free
		strFieldPrefix += "__" +  strResolveTable;	 
		
		//-- resolve record
		if(!this.resolve_unbound_record(strResolveTable,strResolveCol,strResolveValue,strFieldPrefix, aDoc, !boolNumeric))
		{
			//-- failed for whatever reason - set field value to blank
			_eva(oEle,(boolNumeric)?0:"");
		}
	}	
}


//-- out of list of sla return that which is shortest
fglobal.prototype.get_shortest_sla = fglobal_get_shortest_sla;
function fglobal_get_shortest_sla(strSLAS)
{
	if(strSLAS=="") return "";
	var currFixTime = -1;
	var currRespTime = -1;
	var useSLA = "";


	var strName = "";
	var intFixTime = "";
	var intRespTime = "";
	var array_slas = new Array();

	//-- get slas to check
	var strSelect = "select name , fixtime , resptime from system_sla where name in (" + strSLAS + ")";
	var oRS = app.g.get_recordset(strSelect,"syscache");
	while(oRS.Fetch())
	{
		strName = app.g.get_field(oRS,"name");
		intFixTime = app.g.get_field(oRS,"fixtime");
		intRespTime = app.g.get_field(oRS,"resptime");
		array_slas[strName] = intFixTime + ":" + intRespTime;
	}

	var arrinfo = new Array();
	for(strSLA in array_slas)
	{
		arrInfo = array_slas[strSLA].split(":");
		var intTestFixTime = new Number(arrInfo[0]);
		var intTestResTime = new Number(arrInfo[1]);

		//-- not in first loop
		if(currFixTime>-1)
		{
			//-- have a possible shorter sla
			if(currFixTime >= intTestFixTime)
			{
				//-- fix time for both slas is the same so check response time
				if (currFixTime == intTestFixTime)
				{
					if (currRespTime > intTestResTime)
					{
						//-- found new shortest sla
						currFixTime = intTestFixTime;
						currRespTime = intTestResTime;
						useSLA = strSLA;

					}
				}
				else
				{
					//-- new shortest sla
					currFixTime = intTestFixTime;
					currRespTime = intTestResTime;
					useSLA = strSLA;
				}
			}
		}
		else
		{
			//-- first loop
			currFixTime = intTestFixTime;
			currRespTime = intTestResTime;
			useSLA = strSLA;
		}
	}

	return useSLA;
}

//-- out of list of sla return that which is longest
fglobal.prototype.get_longest_sla = fglobal_get_longest_sla;
function fglobal_get_longest_sla(strSLAS)
{
	if(strSLAS=="") return "";
	var currFixTime = -1;
	var currRespTime = -1;
	var useSLA = "";


	var strName = "";
	var intFixTime = "";
	var intRespTime = "";
	var array_slas = new Array();

	//-- get slas to check
	var strSelect = "select name , fixtime , resptime from system_sla where name in (" + strSLAS + ")";
	var oRS = app.g.get_recordset(strSelect,"syscache");
	while(oRS.Fetch())
	{
		strName = app.g.get_field(oRS,"name");
		intFixTime = app.g.get_field(oRS,"fixtime");
		intRespTime = app.g.get_field(oRS,"resptime");
		array_slas[strName] = intFixTime + ":" + intRespTime;
	}

	var arrinfo = new Array();
	for(strSLA in array_slas)
	{
		arrInfo = array_slas[strSLA].split(":");
		var intTestFixTime = new Number(arrInfo[0]);
		var intTestResTime = new Number(arrInfo[1]);

		//-- not in first loop
		if(currFixTime>-1)
		{
			//-- have a possible longer sla
			if(currFixTime <= intTestFixTime)
			{
				//-- fix time for both slas is the same so check response time
				if (currFixTime == intTestFixTime)
				{
					if (currRespTime < intTestResTime)
					{
						//-- found new longest sla
						currFixTime = intTestFixTime;
						currRespTime = intTestResTime;
						useSLA = strSLA;
					}
				}
				else
				{
					//-- new longest sla
					currFixTime = intTestFixTime;
					currRespTime = intTestResTime;
					useSLA = strSLA;
				}
			}
		}
		else
		{
			//-- first loop
			currFixTime = intTestFixTime;
			currRespTime = intTestResTime;
			useSLA = strSLA;
		}
	}
	return useSLA;
}

fglobal.prototype.get_element_frombinding = fglobal_get_element_frombinding;
function fglobal_get_element_frombinding(strBinding, oForm)
{
	//-- loop though record fields and see if we have a argument
	for (var y=0; y < oForm.elements.length;y++)
	{
		var oEle = oForm.elements[y];
		if(oEle.dataRef==strBinding) return oEle;
	}
	return null;
}

fglobal.prototype.popuplate_form_fromargs = fglobal_popuplate_form_fromargs;
function fglobal_popuplate_form_fromargs(strTable, formDocument, boolUpdateDoc, boolReset)
{
	//-- loop though record fields and see if we have a argument
	for (var x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var colName = dd.tables[LC(strTable)].columns[x].Name;
		var strArgName = strTable + "." + colName;
		var strValue = formDocument.GetArg(strArgName);
		if(strValue=="")
		{
			//-- try without table and jsut col name
			strValue = formDocument.GetArg(colName);
		}

		//-- MessageBox(strValue + " : " + strArgName)

		//-- have valid value so set
		if(strValue!="")
		{
			formDocument[strTable][colName] = unescape(strValue);
		}
	}//-- for loop	
	
	if(boolUpdateDoc)formDocument.UpdateFormFromData();
	if(boolReset)formDocument.ResetModiedFlag(strTable);
}

fglobal.prototype.search_for = fglobal_search_for;
function fglobal_search_for(strSearchType, boolMulti,strAppendURL)
{
	if(boolMulti==undefined)boolMulti=true;
	if(strAppendURL==undefined)strAppendURL="";

	var strMulti = (boolMulti)?"1":"0";
	var strURL = "searchmode=1&multiselect=" + strMulti;
	if(strAppendURL!="")
	{
		strURL+="&" + strAppendURL;
	}

	var aForm = app.g.popup("search_" + strSearchType,strURL);	
	var tmpObj = new Object()
	tmpObj.selectedkeys = aForm.document.strSelectedKeys;
	tmpObj.selectedtext = aForm.document.strSelectedText;
	tmpObj.selectedother = aForm.document.strSelectedOther;
	tmpObj.selectedcmdbids = aForm.document.strSelectedCMDBIDs;
	tmpObj.selectedcompanyids = aForm.document.strSelectedCompIDs;

	return tmpObj;
}


//-- 16.02.2007 - NWJ - get pc info from code
fglobal.prototype.get_pcinfo = fglobal_get_pcinfo;
function fglobal_get_pcinfo(strCode)
{
	var strSelect = "select info from pcdesc where code = '" + strCode + "'";
	var oRS = app.g.get_recordset(strSelect,"swdata");
	if(oRS.Fetch())
	{
		return	app.g.get_field(oRS,"info");
	}

	return "";
}

//-- 16.02.2007 - NWJ - get users manager name
fglobal.prototype.get_managername = fglobal_get_managername;
function fglobal_get_managername(strMgrKeysearch)
{
	var strSelect = "select fullname from userdb where keysearch = '" + app.g.pfs(strMgrKeysearch) + "'";
	var oRS = app.g.get_recordset(strSelect,"swdata");
	if(oRS.Fetch())
	{
		return	app.g.get_field(oRS,"fullname");
	}

	return "<has none>";
}

//-- 16.02.2007 - NWJ - Resolve supportworks analyst - expects frmPickAnalyst to exist
fglobal.prototype.resolve_analyst = fglobal_resolve_analyst;
function fglobal_resolve_analyst(strColumn, varValue)
{
	var strAnalystIDs = "";
	var strQuotedIDs = "";
	var counter=0;
	var strSelect = "select analystid from swanalysts where " + strColumn + " like '" + varValue + "%' and class != 0 and class != 2";
	var oRS = app.g.get_recordset(strSelect,"syscache");
	while(oRS.Fetch())
	{
		if(strAnalystIDs!="")
		{
			strAnalystIDs +=",";
			strQuotedIDs +=",";
		}

		tmpID = app.g.get_field(oRS,"analystid");
		strAnalystIDs += tmpID
		strQuotedIDs += "'" + tmpID + "'";

		counter++;
	}

	//-- no match
	if (counter==1)
	{
		//-- only one - so get record
		return app.g.get_analyst_detail(strAnalystIDs);
	}
	else if(counter>1)
	{
		//-- more than one match - popup analyst selector
		var strURL = "filter=analystid in (" + strQuotedIDs + ") and class != 0 and class != 2";
		var aForm  = app.g.popup("picklist_analyst",strURL);	
		if (aForm)
		{
			var strAnalystID = aForm.document.selectedkey;
			return app.g.get_analyst_detail(strAnalystID);
		}
	}
	return false;
}

//-- 08.02.2007 - NWJ - Create an update statement based on form fields that are bound to a table
//--					Pass in form object, tablename and the primary key value
fglobal.prototype.form_update_statement = fglobal_form_update_statement;
function fglobal_form_update_statement(aForm, strTable, varKeyValue)
{
	var updateString = "";
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var colName = dd.tables[LC(strTable)].columns[x].Name;
		var fieldBinding = strTable + "." + colName;
		var oRes = this.get_value_from_binding(aForm, fieldBinding);

		//-- binding was found on form
		if(oRes.found)
		{
			colValue = oRes.value;
			if (colName.toUpperCase() != this.dd_primarykey(strTable).toUpperCase())
			{
				if (updateString!="")updateString += ","
				updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
			}
		}
	}
	
	var primaryCol = this.dd_primarykey(strTable);
	strSQL = "update " + strTable + " set " + updateString + " where " + primaryCol + " =  " + this.encapsulate(strTable,primaryCol,varKeyValue);
	return this.submitsql(strSQL);
}

//-- 08.02.2007 - NWJ - Create an update statement based on form fields that are bound to a table
//--					Pass in form object, tablename and the where clause to use to update
fglobal.prototype.form_whereupdate_statement = fglobal_form_whereupdate_statement;
function fglobal_form_whereupdate_statement(aForm, strTable, strWhere)
{
	var updateString = "";
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var colName = dd.tables[LC(strTable)].columns[x].Name;
		var fieldBinding = strTable + "." + colName;
		var oRes = this.get_value_from_binding(aForm, fieldBinding);

		//-- binding was found on form
		if(oRes.found)
		{
			var colValue = oRes.value;
			if (colName.toUpperCase() != this.dd_primarykey(strTable).toUpperCase())
			{
				if (updateString!="")updateString += ","
				updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
			}
		}
	}
	var strSQL = "update " + strTable + " set " + updateString + " where " + strWhere;
	return this.submitsql(strSQL);
}

//-- NWJ - 08.02.2007 - given a binding and a form get the element value linked to the binding
fglobal.prototype.get_value_from_binding = fglobal_get_value_from_binding;
function fglobal_get_value_from_binding(aForm, strBinding)
{
	var oRes = new Object()
	oRes.found=false;
	_eva(oRes,"");

	for (var x = 0; x<aForm.elements.length;x++)
    {
        var element = aForm.elements[x];
		if (element.dataRef.toLowerCase() == strBinding.toLowerCase())
		{
			oRes.found=true;
			_eva(oRes,element.text);
			break;
		}
	}
	return oRes;
}


//-- 02.11.2006 - NWJ - relate two calls together
fglobal.prototype.relate_calls = fglobal_relate_calls;
function fglobal_relate_calls(intCallrefM,intCallrefS,strCode)
{
	if(strCode==undefined)strCode = "";
	var strTable = "CMN_REL_OPENCALL_OC";
	var strSQL = "insert into " + strTable + " (FK_CALLREF_M,FK_CALLREF_S,RELCODE) values (" + intCallrefM + "," + intCallrefS + ",'" + strCode + "')";
	return app.g.submitsql(strSQL,true);
}

//-- 02.11.2006 - NWJ - for a given master call unrelate 1 or more calls
fglobal.prototype.unrelate_slave_calls = fglobal_unrelate_slave_calls;
function fglobal_unrelate_slave_calls(intCallrefM,intCallrefS,strCode)
{
	//--
	//-- if intCallrefS = "1,2,3,4" will be ok so we can do a mass un-relate
	var strTable = "CMN_REL_OPENCALL_OC";
	var strSQL = "delete from " + strTable + " where FK_CALLREF_M = " + intCallrefM + " and FK_CALLREF_S in(" + intCallrefS + ")";
	if(strCode != undefined) strSQL = strSQL + " and RELCODE = '" + strCode + "'";

	return app.g.submitsql(strSQL,true);
}

fglobal.prototype.unrelate_master_calls = fglobal_unrelate_master_calls;
function fglobal_unrelate_master_calls(intCallrefM,intCallrefS,strCode)
{
	//--
	//-- if intCallrefS = "1,2,3,4" will be ok so we can do a mass un-relate
	var strTable = "CMN_REL_OPENCALL_OC";
	var strSQL = "delete from " + strTable + " where FK_CALLREF_M in(" + intCallrefM + ") and FK_CALLREF_S  = " + intCallrefS + "";
	if((strCode != undefined)&&((strCode != ""))) strSQL = strSQL + " and RELCODE = '" + strCode + "'";

	return app.g.submitsql(strSQL,true);
}


//-- 02.11.2006 - NWJ - for a master call get its related slave calls
fglobal.prototype.get_slave_calls = fglobal_get_slave_calls;
function fglobal_get_slave_calls(intCallrefM,strCode,boolActive)
{
	
	//-- check if only want to get active calls
	if(boolActive==undefined)boolActive=false;

	var strCallrefList = "";
	var strTable = (boolActive) ?"CMN_REL_OPENCALL_OC, OPENCALL":"CMN_REL_OPENCALL_OC";
	var strSQL = "select FK_CALLREF_S from " + strTable + " where FK_CALLREF_M in (" + intCallrefM + ") ";
	if((strCode != undefined)&&((strCode != ""))) strSQL = strSQL + " and RELCODE = '" + strCode + "'";
	if(boolActive)	strSQL = strSQL + " and FK_CALLREF_S = OPENCALL.CALLREF and OPENCALL.STATUS < 15";

	var oRS = app.g.get_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"fk_callref_s");
		if (strCallrefList!="")strCallrefList +=",";
		strCallrefList += currKey;
	}
	if(strCallrefList=="")strCallrefList="0";
	return strCallrefList;
}

//-- 02.11.2006 - NWJ - for a slave call get its related master calls
fglobal.prototype.get_master_calls = fglobal_get_master_calls;
function fglobal_get_master_calls(intCallrefS,strCode, boolActive)
{
	
	//-- check if only want to get active calls
	if(boolActive==undefined)boolActive=false;

	var strCallrefList = "";
	var strTable = (boolActive)?"CMN_REL_OPENCALL_OC, OPENCALL":"CMN_REL_OPENCALL_OC";
	var strSQL = "select FK_CALLREF_M from " + strTable + " where FK_CALLREF_S in (" + intCallrefS + ") ";
	if((strCode != undefined)&&((strCode != ""))) strSQL = strSQL + " and RELCODE = '" + strCode + "'";
	if(boolActive)	strSQL = strSQL + " and FK_CALLREF_S = OPENCALL.CALLREF and OPENCALL.STATUS < 15";
		

	var oRS = app.g.get_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"fk_callref_m");
		if (strCallrefList!="")strCallrefList +=",";
		strCallrefList += currKey;
	}
	if(strCallrefList=="")strCallrefList="0";
	return strCallrefList;
}

//-- 02.11.2006 - NWJ - for a master call get its related slave calls and load passed in sqllist
fglobal.prototype.sl_load_call_slaves = fglobal_sl_load_call_slaves;
function fglobal_sl_load_call_slaves(oSqlList, intCallrefM , strCode)
{
	var strFilter = this.get_slave_calls(intCallrefM,strCode);
	_slf(oSqlList , "callref in(" + strFilter + ")");
	//app.global.Sleep(150);
	//oSqlList.Refresh();
	oSqlList.SetRowSelected(0);
}

//-- 02.11.2006 - NWJ - for a slave call get its related master calls and load passed in sqllist
fglobal.prototype.sl_load_call_masters = fglobal_sl_load_call_masters;
function fglobal_sl_load_call_masters(oSqlList, intCallrefS , strCode)
{
	var strFilter = this.get_master_calls(intCallrefS,strCode);
	_slf(oSqlList , "callref in(" + strFilter + ")");
	//app.global.Sleep(150);
	//oSqlList.Refresh();
	oSqlList.SetRowSelected(0);
}


//-- 05.08.2004
//-- NWJ
//-- returns what ever httpget returns
//-- pass in url (with arguememts) and bool if should pass in SW session info
fglobal.prototype.submit_php = fglobal_submit_php;
function fglobal_submit_php(strURL,boolSWsession)
{
    //-- strUrl should be like /php_scripts/myphp.php
	SW_WEBSERVER = app.g.get_webserver()+"/sw/clisupp/";
    return app.global.HttpGet(SW_WEBSERVER + strURL, boolSWsession);
}

//-- 27.08.2004
//-- NWJ
//-- return the webserver name:port for SW (http://servername:port)
fglobal.prototype.get_webserver = fglobal_get_webserver;
function fglobal_get_webserver()
{
    //-- strUrl should be like /php_scripts/myphp.php
	return "&[app.siteurl]";
}

//-- 01.09.2004
//-- NWJ
//-- Given a string check if it has thw word false/FALSE in it
//-- this can be used to check the result of submit_php
fglobal.prototype.hasFalse = fglobal_hasFalse;
function fglobal_hasFalse(strResult)
{
	var strTest = strResult.toUpperCase();
	if (strTest.indexOf("FALSE") !=-1)
	{
		return true;
	}
	else
	{	
		return false
	}
}


//-- 18.08.2004
//-- NWJ
//-- load SqlRecord and pass it back
fglobal.prototype.get_record = fglobal_get_record;
function fglobal_get_record(strTable,pkey)
{
	var strTable = strTable.toLowerCase(); //-- make sure lower case as dd.table[] works in lowercase
	var oRec = false;
	var strPrimaryField = this.dd_primarykey(strTable);
	var strSQL = "select * from " + UC(strTable) + " where " + UC(strPrimaryField) + " = " + this.encapsulate(strTable,strPrimaryField,pkey) + "";
	var aRS = this.get_recordset(strSQL,"swdata");
	if(aRS.Fetch())
	{
		//-- create new object and assign to it the fields from the rs
		oRec = new Object();
		for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
		{
			var colName = dd.tables[LC(strTable)].columns[x].Name;
			var colValue = app.g.get_field(aRS,colName);
			oRec[LC(colName)] = colValue;
		}
	}
	return oRec;
}
//-- eof get_record
//--

//-- 18.08.2004
//-- NWJ
//-- load SqlRecord and pass it back
fglobal.prototype.get_recordwhere = fglobal_get_recordwhere;
function fglobal_get_recordwhere(strTable,strWhere)
{
	var oRec = false;
	var strSQL = "select * from " + UC(strTable) + " where " + strWhere;
	var aRS = this.get_recordset(strSQL,"swdata");
	if(aRS.Fetch())
	{
		//-- create new object and assign to it the fields from the rs
		oRec = new Object();
		for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
		{
			var colName = dd.tables[LC(strTable)].columns[x].Name;
			var colValue = app.g.get_field(aRS,colName);
			oRec[LC(colName)] = colValue;
		}
	}
	return oRec;
}
//-- eof get_recordwhere
//--


//-- 04.08.2004
//-- NWJ
//-- Clear fields in _swdoc that
//-- are bound to strTable
fglobal.prototype.clear_form_fields = fglobal_clear_form_fields;
function fglobal_clear_form_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef)
{
    //-- handle undefined vars
	filterFieldNameIndex = (filterFieldNameIndex==UNDEFINED)?"":filterFieldNameIndex;
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;

	for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
		//if ((element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
		if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
        {
			//-- 21.09.2004
			//-- NWJ
			//-- add new filterFieldNameIndex (so check field name for filter = if specified make sure matches)
			if ( (filterFieldNameIndex == "") || (element.name.indexOf(filterFieldNameIndex)!=-1) )
			{
	            //-- get field colName and extract value into db fiel from rec
		        _ete(element, "");
			}
        }
    }
}
//-- eof clear_form_fields
//--


//-- 08.09.2004
//-- NWJ
//-- Clear all fields in _swdoc that
//-- are bound to strTable
fglobal.prototype.clear_fields = fglobal_clear_fields;
function fglobal_clear_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef)
{
	if (oForm != undefined)this.clear_form_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef);
}
//--


//-- 17.08.2004
//-- NWJ
//-- disable fields in _swdoc that
//-- are bound to strTable
fglobal.prototype.disable_form_fields = fglobal_disable_form_fields;
function fglobal_disable_form_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef)
{
    //-- handle undefined vars
	filterFieldNameIndex = (filterFieldNameIndex==UNDEFINED)?"":filterFieldNameIndex;
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;

    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
	
       // if ( (element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
		if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
        {
			//-- 21.09.2004
			//-- NWJ
			//-- add new filterFieldNameIndex (so check field name for filter = if specified make sure matches)
			if ( (filterFieldNameIndex == "") || (element.name.indexOf(filterFieldNameIndex)!=-1) )
			{
	            //-- set top readonly
		        //element.readOnly = true;
				_een(element , false);
			}
        }
    }
}

//--
//-- convert epoch to iso date
fglobal.prototype.convert_epoch_isodate  = fglobal_convert_epoch_isodate;
function fglobal_convert_epoch_isodate(intEpoch)
{
	var x = this.fixepoch(intEpoch);
	app.global.LogInfo("convert_epoch_isodate", "convert1", x, 3);	
	x = x *1000;
	app.global.LogInfo("convert_epoch_isodate", "convert2", x, 3);	
	var thisDate = new Date(this.fixepoch(intEpoch)*1000);

	var thisYear = thisDate.getFullYear();
	var thisMonth = thisDate.getMonth()+1;
	var thisDay = thisDate.getDate();
	var thisHours = thisDate.getHours();
	var thisMinutes = thisDate.getMinutes();
	var thisSeconds = thisDate.getSeconds();
		
	if(thisDay<10)thisDay = "0"+thisDay;
	if(thisMonth<10)thisMonth = "0"+thisMonth;
	if(thisHours<10)thisHours = "0"+thisHours;
	if(thisMinutes<10)thisMinutes = "0"+thisMinutes;
	if(thisSeconds<10)thisSeconds = "0"+thisSeconds;
		
	var strDate = thisYear+"-"+thisMonth+"-"+thisDay+" "+thisHours+":"+thisMinutes+":"+thisSeconds;
	app.global.LogInfo("convert_epoch_isodate", "convert3", strDate, 3);	
	return strDate;
}

//-- create object to return xmlmc return values (need core prod fix for 7.3.1 to do this stuff
function XMCResult(strXML)
{
	var ob = new Object();
	ob.success=true;
	ob.message="";

	//-- get success
	var intStartPosRes = strXML.indexOf("<result>") + 8;
	var intEndPosRes = strXML.indexOf("</result>");
	var strResult = strXML.substring(intStartPosRes,intEndPosRes);
	ob.success = (strResult!="false");

	//-- get message
	var intStartMsgRes = strXML.indexOf("<message>") + 9;
	var intEndMsgRes = strXML.indexOf("</message>");
	var strMsg = strXML.substring(intStartMsgRes,intEndMsgRes);
	ob.message = strMsg;

	return ob;
}

fglobal.prototype.attach_message_to_call = fglobal_attach_message_to_call;
function fglobal_attach_message_to_call(oDocForm, strCallref, strUpdateIndex)
{
	// The message source string contains the "mailbox name\message id". We need 
	// to split these out for the following function
	var arrMsgInfo = oDocForm["messagesource"].split('\\');
	
	// Check config to see if we need to include the file attachments in the message too
	var bIncludeAttachments = dd.GetGlobalParamAsNumber("Email Audit Trail/IncludeAttachmentsInMessage");
	
	// We need to specify the folder to which the message should be moved to based
	// on the options set in the DD. 
	var strMoveMessageToFolder = "";
	
	// Next, see if we have specified a specific folder to move the message to
	strMoveMessageToFolder = dd.GetGlobalParamAsString("Mail Move Folders/UpdateCallMailFolder");
	
	if (strMoveMessageToFolder.length == 0)
	{
		// First we see if the config tells us to move the message to the deleted items folder
		if(dd.GetGlobalParamAsNumber("Email Audit Trail/MoveToDeletedItems"))
		{
			strMoveMessageToFolder = "Deleted Items";
		}//end if move message to deleted items
	}//end if there is a move to folder
	
	// As we are going to use the Email Subject in the name of the audit trail file we are saving
	// we need to check it for characters that are invalid in a filename and replace them with "-"
	var strEmailSubject = "";
	if(oDocForm["subject"])
	{
		strEmailSubject = app.g.replaceIllegalFileCharacters(oDocForm["subject"]);
	}//end if there is a subject line
	
	// The following function does a number of things. It tells the server to encode
	// and attach the specified message to the call. It sets the state icon of the 
	// call update to "mail-received" in this instace. If the strMoveMessageToFolder
	// contains a valid folder, it will move the specified mail message to the folder
	var xmlmc = new XmlMethodCall;
	xmlmc.SetValue("mailbox", arrMsgInfo[0]);		
	xmlmc.SetValue("messageId", arrMsgInfo[1]);		
	xmlmc.SetValue("fileName", "Received-" + strEmailSubject + ".swm");		
	xmlmc.SetValue("callRef", strCallref);	
	xmlmc.SetValue("udIndex", strUpdateIndex);		
	xmlmc.SetValue("attachType", "mail-received");		
	xmlmc.SetValue("includeAttachments", bIncludeAttachments);
	if(strMoveMessageToFolder!="")
	{
		var mailxmlmc = new XmlMethodCall;
		mailxmlmc.SetValue("mailbox", arrMsgInfo[0]); // PM00141347, need to set the mailbox otherwise rights from Personal Mailbox will be used
		if(mailxmlmc.Invoke("mail","getFolderList"))
		{
			//-- get the result
			var strXML = (app.bWebClient)? mailxmlmc._lastresult:mailxmlmc.GetReturnXml();
			var objRes = XMCResult(strXML);
			if(!objRes.success)
			{
				MessageBox("There was an error loading email folder details.");
			}	
			else
			{
				var myXmlFile = new XmlFile(); 
				bRet = myXmlFile.loadFromString(strXML);
				if(bRet)
				{
					for (count = 0; count < myXmlFile.methodCallResult.data.length; count ++) 
					{
						var strFolderName = myXmlFile.methodCallResult.data[count]['folderName'].nodeValue;
						if(strMoveMessageToFolder==strFolderName)
						{
							var intFolderId = myXmlFile.methodCallResult.data[count]['folderId'].nodeValue;
							xmlmc.SetValue("moveMessageToFolderId", intFolderId);
							break;
						}
					}
				} 
			}
		}
		else
		{
			MessageBox("There was an error loading email folder details.");
		}		
	}		
	if(xmlmc.Invoke("helpdesk", "attachMessageToCall"))
	{
		//-- get the result
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
			MessageBox("There was an error attaching the originating e-mail to this call.");
		}	
		else
		{
			app.global.CloseMailMessageWindow(arrMsgInfo[1]);
		}
	}
	else
	{
		MessageBox("There was an error attaching the originating e-mail to this call.");
	}
}



fglobal.prototype.replaceIllegalFileCharacters = fglobal_replaceIllegalFileCharacters;
function fglobal_replaceIllegalFileCharacters(strText)
{
	//-- This function is used to replace characters in the passed in string that 
	//-- are not suitable for use in filenames and return the modified string 
	
	strOutput = strText;
	strReplacement = "-";
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

//-- 17.08.2004
//-- NWJ
//-- disable fields in _swdoc that
//-- are bound to strTable
fglobal.prototype.enable_form_fields = fglobal_enable_form_fields;
function fglobal_enable_form_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef)
{
	//-- handle undefined vars
	filterFieldNameIndex = (filterFieldNameIndex==UNDEFINED)?"":filterFieldNameIndex;
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;

    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
		//if ((element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
		if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
        {
			//-- 21.09.2004
			//-- NWJ
			//-- add new filterFieldNameIndex (so check field name for filter = if specified make sure matches)
			if ( (filterFieldNameIndex == "") || (element.name.indexOf(filterFieldNameIndex)!=-1) )
			{
	            //-- enable field
			    //element.readOnly = false;
				_een(element,true);
			}
        }
    }
}
//--


//-- 06.01.2005
//-- NWJ
//-- return element on a form by name
fglobal.prototype.getelementbyname = fglobal_getelementbyname;
function fglobal_getelementbyname(strName,oForm)
{
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var oElement = oForm.elements[x];
		if (oElement.name.toUpperCase() == strName.toUpperCase()) return oElement;
	}
	return null;
}

//-- 08.02.2007 - NWJ
//-- load form fields with a record
fglobal.prototype.load_form_fields = fglobal_load_form_fields;
function fglobal_load_form_fields(aRec, oForm, strTable)
{
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
        if ((element.dataRef != "") && (element.type != FE_SEARCHFIELD))
        {
			var arrInfo = element.dataRef.split(".");
			var strTestTable = arrInfo[0];
			if(strTestTable.toLowerCase() == strTable.toLowerCase())
			{
				var strColName = arrInfo[1];
				//MessageBox(aRec[strColName.toLowerCase()])
				_ete(element, aRec[strColName.toLowerCase()]);
				//element.value = aRec[strColName.toLowerCase()];
			}
		}
	}
}

//-- 12.08.2004
//-- NWJ
//-- construct a select where statement
//-- based on fields that are bound on oFrom
fglobal.prototype.sqlwhere_form_fields = fglobal_sqlwhere_form_fields;
function fglobal_sqlwhere_form_fields(strTable,oForm,mathop,andor,filterFieldNameIndex,boolNoDataRef)
{
	var boolTableSpecific = false;
    var strWhere = "";
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;
    if (mathop==undefined)mathop="=";
	if (andor==undefined)andor="and";
	if (strTable!="")boolTableSpecific = true;
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
        if ((element.dataRef != "") && (element.text !=""))
        {
			//-- if we are working with a specific table 
			//if ( (boolTableSpecific)&& (element.dataRef.indexOf(strTable + ".") == -1))
			if ( (boolTableSpecific)&& (!boolHasDataLink(element,strTable,boolNoDataRef) ))
			{
				//-- do nothing as dataref table is not one we want
			}
			else
			{
				//-- get field info
		       // var arrField = element.dataRef.split(".");
	            //var strTable = arrField[0];
		        //var colName  = arrField[1];
				var colName = returnColName(element,boolNoDataRef);
				//-- encaps value with '' if a string
	            var strValue = this.encapsulate(strTable,colName,element.text);

				var operator = (this.dd_isnumeric(strTable,colName))?"=":mathop;
		        if (strWhere!="") strWhere += " " + andor + " ";
			    strWhere += strTable + "." + colName + " " + operator + " " + strValue;

			}
        }
    }
    return strWhere;
}
//-- eof sqlwhere_form_fields
//--
function boolHasDataLink(element,strTable,boolNoDataRef)
{
	if (boolNoDataRef)
	{
		//-- we are check dataref using firld name
		//-- s_table__fieldname
		if(element.name.toLowerCase().indexOf("s_" + strTable.toLowerCase() + "__") == 0) return true;
	}
	else
	{
		//-- using actual dataref
		if (element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) return true;
	}
	return false;
}

function returnColName(element,boolNoDataRef)
{
	if (boolNoDataRef)
	{
		//-- 

		var arrSplit = element.name.split("__");
		//MessageBox(arrSplit[1])
		return arrSplit[1];
	}
	else
	{
		return element.dataRef.split(".")[1];
	}
}




//--
//-- SQLLIST FUNCTION
//-



//-- 16.05.2005
//-- NWJ
//-- open form for edit based on sl and refresh if modal
fglobal.prototype.sl_openformforedit = fglobal_sqllist_openformforedit;
function fglobal_sqllist_openformforedit(oList, keyCol, frmName, strURL, intModal, pFunction, funcCallback)
{
	var varKey = oList.GetItemTextRaw(oList.curSel, keyCol);
	if (varKey != "")
	{
		app.OpenFormForEdit(frmName, varKey, strURL, intModal, function(obj)
		{		
			if (intModal==1)
			{
				app.g.sqllist_refresh(oList,pFunction,oList.curSel);
			}
			// -- callback
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(obj);
			}
		});		
	}
}

//-- 16.05.2005
//-- NWJ
//-- open form for add based on sl and refresh if modal
fglobal.prototype.sl_openformforadd = fglobal_sqllist_openformforadd;
function fglobal_sqllist_openformforadd(oList,frmName, strURL, intModal,pFunction, funcCallback)
{
	//-- open managed entity form for add
	if(pFunction==undefined) pFunction = null;
	app.OpenFormForAdd(frmName,"",strURL,intModal,function(obj)
	{
		if (intModal==1)
		{
			app.g.sqllist_refresh(oList,pFunction,oList.curSel);
			// -- callback
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(obj);
			}
		}
	});	
}

//-- 17.10.2005
//-- NWJ
//-- for a selected row load the properties form
fglobal.prototype.sqllist_edit_currrecord = fglobal_sqllist_edit_currrecord;
fglobal.prototype.sl_edit_currrecord = fglobal_sqllist_edit_currrecord;
function fglobal_sqllist_edit_currrecord(oList,strFormName, intKeyCol,executeFunc, funcCallback)
{
	//-- get keyfield
	var selRow = oList.curSel;
	var strKey = this.sl_field(oList,selRow,intKeyCol);
	if (strKey=="")return;

	//-- open for modal edit
	app.OpenFormForEdit(strFormName,strKey,"",1,function()
	{
		oList.Refresh();
		if ((selRow == undefined) || (selRow == "")) selRow=0;
		if ((selRow != undefined) && (selRow != null))
		{
			oList.SetRowSelected(selRow);
		}
	
		//--
		//-- if a function reference was passed in then execute it
		if ((executeFunc != undefined) && (executeFunc != null))
		{
			executeFunc(selRow);
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(oList);
		}
	});	
}


//-- 14.09.2004
//-- NWJ
//-- Get a list of delimited keys from a sqllist
fglobal.prototype.sqllist_refresh = fglobal_sqllist_refresh;
fglobal.prototype.sl_refresh = fglobal_sqllist_refresh;
function fglobal_sqllist_refresh(oList,executeFunc,selRow)
{
	oList.Refresh();
	//app.global.Sleep(INT_SQLLIST_DELAY); 
	if ((selRow == undefined) || (selRow == "")) selRow=0;
    if ((selRow != undefined) && (selRow != null))
	{
		oList.SetRowSelected(selRow);
	}

	//-- if a function reference was passed in then execute it
	if ((executeFunc != undefined) && (executeFunc != null))
	{
		executeFunc(selRow);
	}	
}


//-- 12.01.2005
//-- NWJ
//-- hilite given row and call given function
fglobal.prototype.sqllist_selectrow = fglobal_sqllist_selectrow;
fglobal.prototype.sl_selectrow = fglobal_sqllist_selectrow;
function fglobal_sqllist_selectrow(oList,nRow,pFunction)
{
	oList.SetRowSelected(nRow);
	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(nRow);
	}
}

//-- 12.01.2005
//-- NWJ
//-- hilite given number of rows from intStart to intEnd
fglobal.prototype.sl_selectrows = fglobal_sl_selectrows;
function fglobal_sl_selectrows(oList,intStartAt,intEndAt, pFunction)
{
	nRow = intStartAt;
	while(nRow < intEndAt)
	{
		oList.SetRowSelected(nRow,true,true);
		nRow++;
	}

	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(nRow);
	}
}


//-- 14.09.2004
//-- NWJ
//-- Get a list of delimited keys from a sqllist
fglobal.prototype.sqllist_keys = fglobal_sqllist_keys;
fglobal.prototype.sl_keys = fglobal_sqllist_keys;
function fglobal_sqllist_keys(oList,numKeycolumn,boolNumeric,strDelimiter)
{
	if (boolNumeric==undefined)boolNumeric=true;
	if (strDelimiter==undefined)strDelimiter=",";

	//-- loop through list and get keys
	var strKey = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (x >0)strKey +=strDelimiter;
		var quote = (boolNumeric)?"":"'";
		strKey += quote + oList.GetItemTextRaw(x,numKeycolumn) + quote;
	}
	return strKey;
}



//-- 14.09.2004
//-- NWJ
//-- Get a list of selected delimited keys from a sqllist
fglobal.prototype.sqllist_selectedkeys = fglobal_sqllist_selectedkeys;
fglobal.prototype.sl_selectedkeys = fglobal_sqllist_selectedkeys;
function fglobal_sqllist_selectedkeys(oList,numKeycolumn,boolNumeric,strDelimiter)
{
	if (boolNumeric==undefined)boolNumeric=true;
	if (strDelimiter==undefined)strDelimiter=",";

	//-- loop through list and get keys
	var strKey = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			if (strKey != "")strKey +=strDelimiter;
			var quote = (boolNumeric)?"":"'";
			strKey += quote + oList.GetItemTextRaw(x,numKeycolumn) + quote;
		}
	}
	return strKey;
}

//-- 05.08.2004
//-- NWJ
//-- populate sqllist with rawsql and auto select
//-- the given row
fglobal.prototype.sqllist_load = fglobal_sqllist_load;
fglobal.prototype.sl_load = fglobal_sqllist_load;
function fglobal_sqllist_load(oList,strSql,executeFunc,selRow)
{
    _slraw(oList , strSql);
	//-- perform a sleep because list doesnt refresh properly when applying filter
	oList.Refresh();

    if (selRow == undefined) selRow = 0;
    oList.SetRowSelected(selRow);

	//--
	//-- if a function reference was passed in then execute it
	if (executeFunc != undefined)executeFunc(selRow);
}

//-- 05.02.2007 - NWJ append to filter
fglobal.prototype.sl_appendfilter = fglobal_sqllist_appendfilter;
fglobal.prototype.sqllist_appendfilter = fglobal_sqllist_appendfilter;
function fglobal_sqllist_appendfilter(oList,strAppendFilter,intKeyCol)
{
	if(strAppendFilter=="")return false;

	if(intKeyCol==undefined)
	{
		intKeyCol=0;
	}

	
	var strColName = (isNaN(intKeyCol))?intKeyCol:oList.GetColumnName(intKeyCol);
	var strFilter = this.sl_get_valuesdel(oList,intKeyCol,",","'",true);
	//MessageBox("appendfilter = [" + strAppendFilter + "] : keycol = [" + intKeyCol + "] : colname : " + strColName + " : filter = [" + strFilter + "]");
	if (strFilter != "") 
	{
		strFilter += "," + strAppendFilter;
	}
	else
	{
		strFilter = strAppendFilter;
	}
	_slf(oList , UC(strColName) + " in (" + strFilter + ")");
	//MessageBox(oList.filter)
	//app.global.Sleep(10);
	oList.SetRowSelected(0);

	return true;
}

//-- 05.08.2004
//-- NWJ
//-- filter sqllist with filter sql and auto select
//-- the given row
fglobal.prototype.sqllist_filter = fglobal_sqllist_filter;
fglobal.prototype.sl_filter = fglobal_sqllist_filter;
function fglobal_sqllist_filter(oList,strFilter,executeFunc,selRow)
{
	//oList.rawSql = "";
	if ((strFilter == null) || (strFilter==UNDEFINED))
	{
		MessageBox("Developer Warning : no Filter has been given for function sqllist_filter");
		return false;

	}
    _slf(oList , strFilter);
	//app.global.Sleep(50);
	//oList.Refresh();

	if ((selRow != undefined) && (selRow != null))
	{
		oList.SetRowSelected(selRow);
	}

	//--
	//-- if a function reference was passed in then execute it
	if ((executeFunc != undefined) && (executeFunc != null))
	{
		executeFunc(selRow);
	}
}

//-- 05.08.2004
//-- NWJ
//-- clear down sqllist
fglobal.prototype.sqllist_clear = fglobal_sqllist_clear;
fglobal.prototype.sl_clear = fglobal_sqllist_clear;
function fglobal_sqllist_clear(oList,pFunction)
{
	for (var x=oList.rowCount();x > -1;x--)
	{
		oList.RemoveRow(x);
	}

	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(0);
	}
}

//-- unselected selected rows
fglobal.prototype.sl_unselect = fglobal_sqllist_unselect;
fglobal.prototype.sqllist_unselect = fglobal_sqllist_unselect;
function fglobal_sqllist_unselect(oList)
{
	for (var x=oList.rowCount();x > -1;x--)
	{
		if (oList.IsRowSelected(x))
		{
			oList.SetRowSelected(x,false,false);
		}
	}
}

//-- 05.08.2004
//-- NWJ
//-- clear down sqllist
fglobal.prototype.sqllist_clearselected = fglobal_sqllist_clearselected;
fglobal.prototype.sl_clearselected = fglobal_sqllist_clearselected;
function fglobal_sqllist_clearselected(oList,pFunction,selRow)
{
	for (var x=oList.rowCount();x > -1;x--)
	{
		if (oList.IsRowSelected(x))
		{
			oList.RemoveRow(x);
		}
	}

	if (selRow == undefined) selRow = 0;
    oList.SetRowSelected(selRow);

	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(selRow);
	}
}

fglobal.prototype.sl_clearrows = fglobal_sqllist_clearrows;
fglobal.prototype.sqllist_clearrows = fglobal_sqllist_clearrows;
function fglobal_sqllist_clearrows(oList,strKeys,intKeyColPos,pFunction,selRow)
{
	var arrKeys = strKeys.split(",");
	for (var x=0;x < arrKeys.length;x++)
	{
		var intRow = this.sl_findrow_byvalue(oList,arrKeys[x],intKeyColPos);
		if(intRow>-1)oList.RemoveRow(intRow);	
	}

	if (selRow == undefined) selRow = 0;
    oList.SetRowSelected(selRow);

	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(0);
	}
}




//-- 09.02.2008
//-- NWJ
//-- delete physical DB rows
fglobal.prototype.sl_delselected_dbrows = fglobal_sl_delselected_dbrows;
function fglobal_sl_delselected_dbrows(oList,keyCol,strConfirm)
{
	if ((strConfirm!=undefined) && (strConfirm!= null) && (strConfirm!=""))
	{
		if (!confirm(strConfirm)) return false;
	}
	
	if(keyCol=="")keyCol = dd.tables[LC(oList.table)].PrimaryKey;
	var strTable = oList.table;

	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			var strKey   = oList.GetItemTextRaw(x,keyCol);
			if (strKey != "") 
			{
				this.sqlexecute_delete(strTable,strKey)
			}
		}
	}
	oList.Refresh();
	oList.SetRowSelected(0);
	return true;
}

//-- 28.04.2005
//-- NWJ
//-- delete physical DB row
fglobal.prototype.sqllist_deldbrow = fglobal_sqllist_deldbrow;
fglobal.prototype.sl_deldbrow = fglobal_sqllist_deldbrow;
function fglobal_sqllist_deldbrow(oList,delRow,keyCol,pFunction,strConfirm)
{
	if(delRow==-1)delRow = oList.curSel;
	if(keyCol=="")keyCol = dd.tables[LC(oList.table)].PrimaryKey;
	
	var strTable = oList.table;
	var strKey   = oList.GetItemTextRaw(delRow,keyCol);
	if (strKey == "") return false;

	if ((strConfirm!=undefined) && (strConfirm!= null) && (strConfirm!=""))
	{
		if (!confirm(strConfirm)) return false;
	}

	if (this.sqlexecute_delete(strTable,strKey))
	{
		oList.RemoveRow(delRow);
		oList.SetRowSelected(0);

		//--
		//-- if a function reference was passed in then execute it
		if ((pFunction != undefined) && (pFunction != null))
		{
			pFunction(0);
		}
	}

	return true;
}



fglobal.prototype.sqllist_delrow = fglobal_sqllist_delrow;
fglobal.prototype.sl_delrow = fglobal_sqllist_delrow;
function fglobal_sqllist_delrow(oList,delRow,pFunction,selRow)
{
	oList.RemoveRow(delRow);
    if ((selRow != undefined) && (selRow != null))
	{
		oList.SetRowSelected(selRow);
	}

	//--
	//-- if a function reference was passed in then execute it
	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(selRow);
	}
}

//--
fglobal.prototype.sl_delrow_byvalue = fglobal_sqllist_delrow_byvalue;
fglobal.prototype.sqllist_delrow_byvalue = fglobal_sqllist_delrow_byvalue;
function fglobal_sqllist_delrow_byvalue(oList,delRowValue,nCol, pFunction,selRow)
{
	var intRow = this.sl_findrow_byvalue(oList,delRowValue,nCol);
	if(intRow==-1)return false;
	oList.RemoveRow(intRow);
    if ((selRow != undefined) && (selRow != null))
	{
		oList.SetRowSelected(selRow);
	}

	//--
	//-- if a function reference was passed in then execute it
	if ((pFunction != undefined) && (pFunction != null))
	{
		pFunction(selRow);
	}

	return true;
}



//-- 24.12.2004
//-- NWJ
//-- Get field value at given position
fglobal.prototype.sqllist_field = fglobal_sqllist_field;
fglobal.prototype.sl_field = fglobal_sqllist_field;
function fglobal_sqllist_field(oList,RowPos,ColPos)
{
	return oList.GetItemTextRaw(RowPos,ColPos);
}

//-- get col value by name
fglobal.prototype.sl_getrawcolvalue = fglobal_sl_getrawcolvalue;
function fglobal_sl_getrawcolvalue(oList,intRowPos,strColName)
{
	if(intRowPos==-1)intRowPos = oList.curSel;

	//-- MessageBox(intRowPos + " : " + i)
	return oList.GetItemTextRaw(intRowPos,strColName);

}

fglobal.prototype.sl_getprikeyvalue = fglobal_sl_getprikeyvalue;
function fglobal_sl_getprikeyvalue(oList,intRowPos)
{
	if(intRowPos==undefined)intRowPos=oList.curSel;

	var strKeyValue="";
	if(intRowPos != -1)
	{
		var nCol = -1;
		for(var i=0; i< oList.colCount; i++)
		{
			if(oList.GetColumnName(i) ==  dd.tables[LC(oList.table)].PrimaryKey)
			{
				nCol = i;
				break;
			}
		}
		strKeyValue = oList.GetItemTextRaw(intRowPos, nCol);
	}
	return strKeyValue;
}


fglobal.prototype.sl_getprikeyname = fglobal_sl_getprikeyname;
function fglobal_sl_getprikeyname(oList)
{
	var strKeyName="";
	var nCol = -1;
	for(var i=0; i< oList.colCount; i++)
	{
		if(oList.GetColumnName(i) ==  dd.tables[LC(oList.table)].PrimaryKey)
		{
			strKeyName = oList.GetColumnName(i);
			break;
		}
	}
	return strKeyName;
}

fglobal.prototype.sl_getcolvalue = fglobal_sl_getcolvalue;
function fglobal_sl_getcolvalue(oList,intRowPos,strColName)
{
	if(intRowPos==-1)intRowPos = oList.curSel;

	var strValue = "";
	for(var i=0; i< oList.colCount; i++)
	{
		if(oList.GetColumnName(i).toLowerCase() ==  strColName.toLowerCase())
		{
			return oList.GetItemText(intRowPos,i);
		}
	}
	return null;
}

fglobal.prototype.sl_getcolvalueraw = fglobal_sl_getcolvalueraw;
function fglobal_sl_getcolvalueraw(oList,intRowPos,strColName)
{
	if(intRowPos==-1)intRowPos = oList.curSel;

	var strValue = "";
	for(var i=0; i< oList.colCount; i++)
	{
		if(oList.GetColumnName(i).toLowerCase() ==  strColName.toLowerCase())
		{
			return oList.GetItemTextRaw(intRowPos,i);
		}
	}
	return null;
}


fglobal.prototype.sqllist_fieldtext = fglobal_sqllist_fieldtext;
fglobal.prototype.sl_fieldtext = fglobal_sqllist_fieldtext;
function fglobal_sqllist_fieldtext(oList,RowPos,ColPos)
{
	return oList.GetItemText(RowPos,ColPos);
}



//-- 05.01.2005
//-- NWJ
//-- highlight the selected row given value to match in a given column
fglobal.prototype.sqllist_hirow_byvalue = fglobal_sqllist_hirow_byvalue;
function fglobal_sqllist_hirow_byvalue(oList,strValue,ColPos)
{
	var foundRowNum = this.sqllist_findrow_byvalue(oList,strValue,ColPos)
	oList.SetRowSelected(foundRowNum);
}

//-- 05.01.2005
//-- NWJ
//-- highlight the selected row given value to match in a given column
fglobal.prototype.sqllist_checkrow_byvalue = fglobal_sqllist_checkrow_byvalue;
function fglobal_sqllist_checkrow_byvalue(oList,strValue,ColPos)
{
	var foundRowNum = this.sqllist_findrow_byvalue(oList,strValue,ColPos)
	oList.SetRowChecked(foundRowNum,true);
}

//-- 15.08.2008
//-- NWJ
//-- highlight rows that match given value in given col
fglobal.prototype.sqllist_hirows_byvalue = fglobal_sqllist_hirows_byvalue;
function fglobal_sqllist_hirows_byvalue(oList,strValue,ColPos)
{
	for (var x = 0;x < oList.rowCount() ;x++ )
	{
		var currVal = oList.GetItemTextRaw(x,ColPos);
		if(currVal==strValue)	oList.SetRowSelected(x);
	}
}


//-- 15.08.2008
//-- NWJ
//-- check rows that match given value in given col
fglobal.prototype.sqllist_checkrows_byvalue = fglobal_sqllist_checkrows_byvalue;
function fglobal_sqllist_checkrows_byvalue(oList,strValue,ColPos)
{
	for (var x = 0;x < oList.rowCount() ;x++ )
	{
		var currVal = oList.GetItemTextRaw(x,ColPos);
		if(currVal==strValue)oList.SetRowChecked(x,true);
	}
}


//-- NWJ - returns true if all rows have same value in given col
fglobal.prototype.sl_common_colvalue = fglobal_sqllist_common_colvalue;
function fglobal_sqllist_common_colvalue(oList,ColPos)
{
	var checkValue = oList.GetItemTextRaw(0,ColPos);
	for (var x=0;x<oList.rowCount();x++)
	{
		varValue = oList.GetItemTextRaw(x,ColPos) 
		if(checkValue!=varValue) return false;
	}

	return checkValue;
}

//-- NWJ - returns true if all rows have same value in given col - selected rows only
fglobal.prototype.sl_common_selcolvalue = fglobal_sqllist_common_selcolvalue;
function fglobal_sqllist_common_selcolvalue(oList,ColPos)
{

	var checkValue = "|-|";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			varValue = oList.GetItemTextRaw(x,ColPos);
			if(checkValue == "|-|")checkValue=varValue;
			if(checkValue!=varValue) return "<Multiple Values>";
		}
	}
	return checkValue;
}



//-- 05.01.2005
//-- NWJ
//-- return rowpos of row with matching value in given col
fglobal.prototype.sqllist_findrow_byvalue = fglobal_sqllist_findrow_byvalue;
fglobal.prototype.sl_findrow_byvalue = fglobal_sqllist_findrow_byvalue;
function fglobal_sqllist_findrow_byvalue(oList,strValue,ColPos)
{
	for (var x=0;x<oList.rowCount();x++)
	{
		var currentValue = oList.GetItemTextRaw(x,ColPos);
		if (currentValue == strValue)return x;
	}
	return -1;
}




//-- 05.01.2005
//-- NWJ
//-- return the value in provided column of the first selected row
fglobal.prototype.sqllist_getselected_value = fglobal_sqllist_getselected_value;
function fglobal_sqllist_getselected_value(oList,ColPos)
{

	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			return oList.GetItemTextRaw(x,ColPos);
		}
	}
	return "";
}

//-- 15.01.2005
//-- NWJ
//-- return array of selected keys
fglobal.prototype.sqllist_getselected_values = fglobal_sqllist_getselected_values;
function fglobal_sqllist_getselected_values(oList,ColPos,keyPos)
{

	var valueArray = new Array();
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			valueArray[oList.GetItemTextRaw(x,keyPos)] = oList.GetItemTextRaw(x,ColPos);
		}
	}
	return valueArray;
}

//-- 07.02.2007 - NWJ - Get selected row count from asqllist
fglobal.prototype.sl_getselected_count = fglobal_sl_getselected_count;
function fglobal_sl_getselected_count(oList)
{
	var intCount=0;
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			intCount++;
		}
	}
	return intCount;
}


//-- 15.01.2005
//-- NWJ
//-- return a delimieted string of selected keys
fglobal.prototype.sl_getselected_valuesdel = fglobal_sqllist_getselected_valuesdel;
fglobal.prototype.sqllist_getselected_valuesdel = fglobal_sqllist_getselected_valuesdel;
function fglobal_sqllist_getselected_valuesdel(oList,ColPos,strDel,strQuote, boolPFS)
{
	//-- nwj - if nCol is not a number then get col pos using name
	if(boolPFS==undefined)boolPFS=false;
	if(strQuote==undefined)strQuote="";
	var strKeys = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			if (strKeys !="")strKeys +=strDel;
			var strVal = oList.GetItemTextRaw(x,ColPos);
			if(boolPFS)strVal = this.pfs(strVal);
			strKeys  += strQuote + strVal + strQuote;

		}
	}
	return strKeys;
}

fglobal.prototype.sl_getselected_textdel = fglobal_sqllist_getselected_textdel;
fglobal.prototype.sqllist_getselected_textdel = fglobal_sqllist_getselected_textdel;
function fglobal_sqllist_getselected_textdel(oList,ColPos,strDel,strQuote)
{

	if(strQuote==undefined)strQuote="";
	var strKeys = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			if (strKeys !="")strKeys +=strDel;
			strKeys  += strQuote + oList.GetItemText(x,ColPos)  + strQuote;
		}
	}
	return strKeys;
}

//-- 15.01.2005
//-- NWJ
//-- return a delimieted string of all rows values from given col
fglobal.prototype.sqllist_get_valuesdel = fglobal_sqllist_get_valuesdel;
fglobal.prototype.sl_get_valuesdel = fglobal_sqllist_get_valuesdel;
function fglobal_sqllist_get_valuesdel(oList,ColPos,strDel,strQuote, boolPFS)
{
	if(boolPFS==undefined)boolPFS=false;
	if(strQuote==undefined)strQuote="";
	var strKeys = "";
	var strVal="";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (strKeys !="")strKeys +=strDel;
		strVal = oList.GetItemTextRaw(x,ColPos);
		if(boolPFS) strVal= this.pfs(strVal);
		strKeys  += strQuote + strVal + strQuote;
	}
	return strKeys;
}

//-- 15.01.2005
//-- NWJ
//-- return a delimieted string of all rows values from given col
fglobal.prototype.sqllist_get_textdel = fglobal_sqllist_get_textdel;
fglobal.prototype.sl_get_textdel = fglobal_sqllist_get_textdel;
function fglobal_sqllist_get_textdel(oList,ColPos,strDel,strQuote)
{
	//-- nwj - if nCol is not a number then get col pos using name
	if(strQuote==undefined)strQuote="";
	var strKeys = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (strKeys !="")strKeys +=strDel;
		strKeys  += strQuote + oList.GetItemTextRaw(x,ColPos)  + strQuote;
	}
	return strKeys;
}

//-- 29.01.2005
//-- NWJ
//-- return total of column added
fglobal.prototype.sqllist_gettotalvalue = fglobal_sqllist_gettotalvalue;
function fglobal_sqllist_gettotalvalue(oList,ColPos)
{

	var intTotalValue = 0;
	for (var x=0;x<oList.rowCount();x++)
	{
			var colValue = oList.GetItemTextRaw(x,ColPos);
			intTotalValue += new Number(colValue);
	
	}
	return intTotalValue;
}

//-- 17.05.2007
//-- NWJ
//-- return del list of row col values (getCol) where (checkCol) = (checkValue)
fglobal.prototype.sl_get_valuesdel_andcheckcolvalue = fglobal_sqllist_get_valuesdel_andcheckcolvalue;
function fglobal_sqllist_get_valuesdel_andcheckcolvalue(oList,getCol,checkCol,checkValue, checkAdditionalColVals, strDel,strQuote,boolSelectedOnly)
{

	//-- split out additional cols to check
	var arrAdditionalCols = new Array();
	if(checkAdditionalColVals!="")
	{
		var arrCheckColInfo = checkAdditionalColVals.split("||");
		for (var y=0;y<arrCheckColInfo.length; y++)
		{
			var arrColInfo = arrCheckColInfo[y].split("=");
			var strCheckCol = arrColInfo[0];
			var arrCheckValues = arrColInfo[1].split("|");
			//-- add to list of additional cols to check
			arrAdditionalCols[strCheckCol] = arrCheckValues;
		}
	}

	if(boolSelectedOnly==undefined)boolSelectedOnly=false;
	if(strQuote==undefined)strQuote="";
	var strKeys = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		var boolSelOk = ((boolSelectedOnly)&&(oList.IsRowSelected(x)));
		if ((boolSelOk) ||  (!boolSelectedOnly))
		{
			var boolColValuesOK=true;

			//-- check main column value
			var checkColValue = oList.GetItemTextRaw(x,checkCol).toLowerCase();
			if(checkColValue!=checkValue.toLowerCase())boolColValuesOK=false;

			if(boolColValuesOK)
			{
				//-- check any additional col values
				for(addColName in arrAdditionalCols)
				{
					//-- may eb checking more than one possible value
					var arrCheckVals = arrAdditionalCols[addColName];
					for(var z=0;z<arrCheckVals.length;z++)
					{
						//-- 
						var strValueToCheck = arrCheckVals[z];
						checkColValue = oList.GetItemTextRaw(x,addColName).toLowerCase();
						if(checkColValue!=strValueToCheck.toLowerCase())
						{
							boolColValuesOK=false;
						}
						else
						{
							boolColValuesOK=true;
							break; //-- goes to next for(addColName in arrAdditionalCols)
						}
					}
				}
			}

			if(boolColValuesOK)
			{
				//-- we want to get this one
				if (strKeys !="")strKeys +=strDel;
				strKeys  += strQuote + oList.GetItemTextRaw(x,getCol) + strQuote;
			}
		}
	}
	return strKeys;
}


//--
//-- EOF SQLLIST FUNCTIONS
//--


fglobal.prototype.string_ltrim = fglobal_string_ltrim;
function fglobal_string_ltrim(strText) 
{
	// this will get rid of leading spaces 
	while (strText.charCodeAt(0) == 160 || strText.charCodeAt(0) == 32)
	strText = strText.substring(1, strText.length)
	return strText;
}

fglobal.prototype.string_rtrim = fglobal_string_rtrim;
function fglobal_string_rtrim(strText)
{
	// this will get rid of trailing spaces 
	while (strText.charCodeAt(strText.length-1) == 160 || strText.charCodeAt(strText.length-1) == 32) 
	strText = strText.substring(0, strText.length-1); 
	return strText;
}

fglobal.prototype.string_trim = fglobal_string_trim;
function fglobal_string_trim(strText)
{
	return this.string_ltrim(this.string_rtrim(strText));
}

fglobal.prototype.replace_newline = fglobal_replace_newline;
function fglobal_replace_newline(strText)
{
	while (strText.charCodeAt(strText.length-1) == 10 || strText.charCodeAt(strText.length-1) == 13) 
	strText = strText.substring(0, strText.length-1); 
	return strText;

}

//-- left pad
function lpad(strValue,strPad,strLen)
{
	strValue +="";
	var intPadBy = strLen - strValue.length;
	for(var x=0;x  < intPadBy; x++)
	{
		strValue = strPad + strValue;
	}
	return strValue;
}

//-- right pad
function rpad(strValue,strPad,strLen)
{
	strValue +="";
	var intPadBy = strLen - strValue.length;
	for(var x=0;x  < intPadBy; x++)
	{
		strValue = strValue + strPad;
	}
	return strValue;
}

//-- replace
fglobal.prototype.string_replace = fglobal_string_replace;
function fglobal_string_replace(strText,strFind,strReplace,boolGlobalreplace)
{
	//-- replace all occs of strFind and ignore case (gi)
	var flags = (boolGlobalreplace)?"gi":"i";
	var rExp = new RegExp(strFind,flags);
	var strText = new String(strText);
	return strText.replace(rExp, strReplace);
}

//-- return array of string split by CR
fglobal.prototype.string_cr_split = fglobal_string_cr_split;
function fglobal_string_cr_split(strValue)
{
	//re = /\r\n/g,
	var rExp = new RegExp("\r\n","gi");
	var re = /\r\n/g;
	return  strValue.replace(re,"~").split("~");
}

function replaceCR(strValue,strWith)
{
	//-- Windows encodes returns as \r\n hex
	var rExp = new RegExp("%0A","gi");
	var escapedValue = escape(strValue)
	escapedValue = escapedValue.replace(rExp,strWith);
	return unescape(escapedValue);

}

//-- 05.08.2004
//-- NWJ
//-- SqlExecute functions (make into an object perhpas ??)
//--

//-- 05.08.2004
//-- NWJ
//-- submit SQL returns true or false
fglobal.prototype.submitsql = fglobal_submitsql;
function fglobal_submitsql(strSQL,boolShowMessage)
{
	var result	= app.global.SqlExecute("swdata",strSQL);
    if (result==-1)
    {
        //-- an error occured
		if (boolShowMessage == undefined)boolShowMessage=true;
		if (boolShowMessage)MessageBox("SqlExecute failed. Please contact your Supportworks Administrator.\n\n" + strSQL);
        return false;
    }
    else
    {
        return true;
    }
}



fglobal.prototype.get_rowcount = fglobal_get_rowcount;
function fglobal_get_rowcount(strTable,strWhere)
{
	var strReturnInfo = "0";
	//-- for testing
	if (strWhere != "")
	{
			strWhere = " where " + strWhere;
	}
	var strSQL = "select count(*) as counter from " + strTable  + strWhere;

	var oRS  = this.get_recordset(strSQL,"swdata");
	if (oRS.Fetch())
	{ 
		strReturnInfo = this.get_field(oRS,"counter");
	}
    return new Number(strReturnInfo);    
}


//-- 15.01.2005
//-- NWJ
//-- return filter search string based on search fields
fglobal.prototype.create_search_filter = fglobal_create_search_filter;
function fglobal_create_search_filter(oForm,strTable,strSearchColour,boolAND,boolNoDataRef)
{
	var strDBType = dd.GetGlobalParamAsString("Application Settings/DatabaseType");
	var boolOracle = (strDBType.toUpperCase()=="ORACLE");

	var searchString = "";
	boolNoDataRef = (boolNoDataRef == UNDEFINED)? false: boolNoDataRef;
	for (var x=0; x < oForm.elements.length;x++)
	{
		var element = oForm.elements[x];
		if (element.text !="")
		{
			if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
			{
				//-- include in the search
				if ((element.bgcolor == strSearchColour) || (strSearchColour==""))
				{
					var colName = returnColName(element,boolNoDataRef);
					var colValue = app.g.encapsulate(strTable,colName,element.text);

					//-- NWJ - 18.04.2008 - check if field is numeric and if so that value is numeric
					if ((this.dd_isnumeric(strTable,colName))&&(isNaN(colValue)))
					{
						MessageBox("Non-numeric characters where found in a numeric search field (" + this.dd_fieldlabel(strTable,colName) + "). This field will be omitted from the search criteria.");
						continue;
					}

					//-- if oracle use upper setting
					if(boolOracle)
					{
						colName = " UPPER(" + colName + ") ";
						colValue = " UPPER(" + colValue + ") ";
					}

					if (searchString != "") searchString += (boolAND==1)?" AND ": " OR ";
					searchString += colName + " like " + colValue;
				}
			}
		}
	}
	return searchString;
}



//-- 19.01.2005
//-- NWJ
//-- return filter search string based on search fields by field name = s_table__fieldname
fglobal.prototype.create_fieldsearch_filter = fglobal_create_fieldsearch_filter;
function fglobal_create_fieldsearch_filter(oForm,strTable,strSearchColour,boolAND,boolLike)
{
	var searchString = "";
	for (var x=0; x < oForm.elements.length;x++)
	{
	 	var element = oForm.elements[x];
	
		if ((element.text !="") &&(element.name.indexOf("s_") == 0)) 
		{
			
			if ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD))
		    {
		    	if ((element.bgcolor == strSearchColour) || (strSearchColour==""))
		    	{
					//-- include in the search
					var arrSplit = element.name.split("__");
					var colName  = arrSplit[1];
					var colValue   	= app.g.encapsulate(strTable,colName,element.text);
					
					if (searchString != "") searchString += (boolAND)?" AND ": " OR ";
		    		searchString += colName + " like " + colValue;
		    	}
		    }
		}
	}
	return searchString;
}

//-- 05.08.2004
//-- NWJ
//-- delete row by key
fglobal.prototype.sqlexecute_delete = fglobal_sqlexecute_delete;
function fglobal_sqlexecute_delete(strTable,inKeyValue)
{
	//-- get datadictionary info for table to get key
    var primary_key     = this.dd_primarykey(strTable); 
    var strSQL          = "delete from " + UC(strTable) + " where " + UC(primary_key) + " = " + this.encapsulate(strTable,primary_key,inKeyValue) + "";
	return this.submitsql(strSQL);
}


//-- 01.11.2004
//-- NWJ
//-- delete row by foriegn key
fglobal.prototype.sqlexecute_delete_by_fkey = fglobal_sqlexecute_delete_by_fkey;
function fglobal_sqlexecute_delete_by_fkey(strTable,strColName,inKeyValue)
{
    var strSQL          = "delete from " + UC(strTable) + " where " + UC(strColName) + " = " + this.encapsulate(strTable,strColName,inKeyValue) + "";
	return this.submitsql(strSQL);
}



//-- 05.08.2004
//-- NWJ
//-- delete rows by clause
fglobal.prototype.sqlexecute_deletewhere = fglobal_sqlexecute_deletewhere;
function fglobal_sqlexecute_deletewhere(strTable,strWhere)
{
	//-- get datadictionary info for table to get key
    var strSQL          = "delete from " + UC(strTable) + " where " + strWhere;
	return this.submitsql(strSQL);
}

//-- 05.08.2004
//-- NWJ
//-- perform insert using values from the passed in form object
fglobal.prototype.sqlexecute_forminsert = fglobal_sqlexecute_forminsert;
function fglobal_sqlexecute_forminsert(strTable,oForm,boolNoDataRef)
{
	var arrColnames= new Array();
	var colString = "";
	var valString = "";
	var strWhere	= "";
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;
	//-- loop through form and create insert statement based on populated fields
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
		if (element.text !="")
		{
			//if ((element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
			if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
		    {
	            //-- get field value and encapsulate it as needed
		        //-- get field colName and extract value into db fiel from rec
			    //var dbfield = element.dataRef.split(".");
	            //var colName = dbfield[1];
				var colName = returnColName(element,boolNoDataRef);
				var colValue   = element.text;

				if (strWhere != "") strWhere += " and ";

				//-- check if colName is a dual search has a "!"
				var dual = colName.split("!");
				if (dual.length > 1)
				{
					colOne = dual[0];
					colTwo = dual[1];
					//-- split value by " "
					var arrValue = colValue.split(" ");
					//-- process colOne
					if (arrValue.length > 1)
					{
						//-- we need to populate both cols
						//-- construct col names for insert
						if (arrColnames[colOne]){}
						else
						{
							if (colString != "") colString += ",";
							colString += colOne;

							//-- construct col values for insert
							if (valString != "") valString += ",";
							var enValue = this.encapsulate(strTable,colOne,arrValue[0]);
							valString += enValue;
							arrColnames[colOne] = true;
							strWhere += colOne + " = " + enValue;
						}

						if (arrColnames[colTwo]){}
						else
						{

							if (colString != "") colString += ",";
							colString += colTwo;

							//-- construct col values for insert
							//-- take rest of value for second part of dual field
							var lastval = colValue.substring(arrValue[0].length+1,colValue.length);
							if (valString != "") valString += ",";
							var enValue = this.encapsulate(strTable,colTwo,lastval);
							valString += enValue;
							arrColnames[colTwo] = true;
							strWhere += colTwo + " = " + enValue;
						}
					}
					else
					{
						if (arrColnames[colOne]){}
						else
						{
							//-- construct col names for insert
							if (colString != "") colString += ",";
							colString += colOne;

							//-- construct col values for insert
							if (valString != "") valString += ",";
							var enValue = this.encapsulate(strTable,colOne,colValue);
							valString += enValue;
							arrColnames[colOne] = true;
							strWhere += colOne + " = " + enValue;
						}
					}
				}
				else
				{
					if (arrColnames[colName])
					{
						//-- do nothing already processed col of this name
					}
					else
					{
						//-- construct col names for insert
						if (colString != "") colString += ",";
						colString += colName;

						//-- construct col values for insert
						if (valString != "") valString += ",";
						var enValue = this.encapsulate(strTable,colName,colValue);
						valString += enValue;
						arrColnames[colName] = true;
						strWhere += colName + " = " + enValue;
					}
				}
		    }
		}
    }

	colString = "(" + colString + ")";
	valString = "(" + valString + ")";

	//-- insert the new form data record
	strSQL = "insert into " + strTable + " " + colString + " values " + valString;
	this.submitsql(strSQL);

	//-- now get the new record from db (order by primary key desc (assuming prikey in auto number))
	strWhere += " order by " + this.dd_primarykey(strTable) + " desc";
	return this.get_recordwhere(strTable,strWhere);
}

//-- 05.08.2004
//-- NWJ
//-- perform db update using values from the passed in form object (expects key value)
fglobal.prototype.sqlexecute_formupdate = fglobal_sqlexecute_formupdate;
function fglobal_sqlexecute_formupdate(strTable,oForm,inKeyValue,boolNoDataRef,varSkipValue)
{
	var varSkipValue = (varSkipValue==undefined)?"":varSkipValue;
	var updateString = "";
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;
	//-- loop through form and create insert statement based on populated fields
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
        //if ((element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) && (element.type == FE_FIELD))
		if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
        {
            //-- get field value and encapsulate it as needed
            //-- get field colName and extract value into db fiel from rec
            //var dbfield		= element.dataRef.split(".");
            //var colName		= dbfield[1];
			var colName = returnColName(element,boolNoDataRef);
			var colValue	= element.text;

			//-- check that colName is not the primary key
			if (colName.toUpperCase() != this.dd_primarykey(strTable).toUpperCase())
			{
				if ((colValue.toLowerCase() != varSkipValue.toLowerCase()) || (varSkipValue==""))
				{
					//-- construct col names for update
					if (updateString != "") updateString += ",";
					updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
				}
			}
        }
    }
	
	var primaryCol = this.dd_primarykey(strTable);
	strSQL = "update " + strTable + " set " + updateString + " where " + this.dd_primarykey(strTable) + " =  " + this.encapsulate(strTable,primaryCol,inKeyValue);
	return this.submitsql(strSQL);
}


//-- 23.01.2006
//-- NWJ
//-- perform db update using values from the passed in record object (expects key value)
fglobal.prototype.sqlexecute_recupdate = fglobal_sqlexecute_recupdate;
function fglobal_sqlexecute_recupdate(strTable,oRec,inKeyValue)
{
	var updateString = "";
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var colName = dd.tables[LC(strTable)].columns[x].Name;
		var colValue = oRec[colName];
		if (colName.toUpperCase() != this.dd_primarykey(strTable).toUpperCase())
		{
			if (updateString!="")updateString += ","
			updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
		}
	}
	
	var primaryCol = this.dd_primarykey(strTable);
	strSQL = "update " + strTable + " set " + updateString + " where " + primaryCol + " =  " + this.encapsulate(strTable,primaryCol,inKeyValue);
	//MessageBox(strSQL)
	return this.submitsql(strSQL);
}

//-- 24.08.2004
//-- NWJ
//-- loop through form fields for given table and check if mandatory.
//-- if so make sure it is populated else return false and warning message
fglobal.prototype.check_mandatory_fields = fglobal_check_mandatory_fields;
fglobal.prototype.check_mandatoryfields = fglobal_check_mandatory_fields;
function fglobal_check_mandatory_fields(strTable,oForm,boolNoDataRef)
{
	boolNoDataRef = (boolNoDataRef==UNDEFINED)?false:boolNoDataRef;
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
		//if ((element.dataRef.toLowerCase().indexOf(strTable.toLowerCase() + ".") == 0) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
		if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )
        {
            if ((element.mandatory) && (element.text ==""))
            {
                //var colName   = element.dataRef.split(".")[1];
				var colName = returnColName(element,boolNoDataRef);
                var fieldname = this.dd_fieldlabel(strTable,colName);
                MessageBox("The field '" + fieldname + "' is a mandatory field and must be completed.")
                return false;
            }
        }
    }
    return true;
}

//-- return form element by name
fglobal.prototype.get_element_by_id = fglobal_get_element_by_id;
function fglobal_get_element_by_id(oForm,strElementId)
{
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
        if (element.name==strElementId) return element;
    }
	return null;

}

//-- return form element by name
fglobal.prototype.is_element_by_id_mandatory = fglobal_is_element_by_id_mandatory;
function fglobal_is_element_by_id_mandatory(oForm,strElementId)
{
    for (var x = 0; x<oForm.elements.length;x++)
    {
        var element = oForm.elements[x];
        if (element.name==strElementId) 
		{

			return element.mandatory;
		}
    }
	return false; //-- not found

}


//-- return value in '' if col type is string
fglobal.prototype.encapsulate = fglobal_encapsulate;
function fglobal_encapsulate(strTable,strCol,inValue)
{
	if (this.dd_isnumeric(strTable,strCol))
	{
		//-- if a number and is null set to zero
		if (inValue == '') inValue=0;
		return inValue;
	}
	else
	{
		//-- a string so encaps
		return "'" + this.pfs(inValue) + "'";
	}
}

//--
//-- Prepare a string for SQL - use as app.g.pfs(string) .. just short than using app.global.prepareforsql each time.
fglobal.prototype.pfs = fglobal_pfs;
function fglobal_pfs(inValue)
{
	return app.global.PrepareForSQL(inValue);
}

fglobal.prototype.pfu = pfu;
function pfu(inValue)
{
	return encodeURIComponent(inValue);
}


//-- 18.01.2005
//-- NWJ
//-- Conversions

//-- round a number
fglobal.prototype.round_by = round_by;
function round_by(inNum,intPlaces)
{
	inNum=Math.round(inNum*100)/100;
	return inNum;
}

//-- converts a value to money #####.##
fglobal.prototype.convert_to_money = fglobal_convert_to_money;
function fglobal_convert_to_money(inValue)
{
	inValue = new Number(inValue);
	if (isNaN(inValue))
	{
		return "0.00";
	}
	else
	{
		//-- make sure a positive number
		if (inValue < 0) return  "0.00";
		if (inValue == 0) return "0.00";

		inValue=Math.round(inValue*100)/100  //returns 2 decimal places
		inValue = new String(inValue);
		var strLen = inValue.length;
		var dotpos = inValue.indexOf(".");
		if (dotpos != -1)
		{
			//-- split by "."
			var tmpArray = inValue.split(".");
			if (tmpArray.length > 2)
			{
				//-- too many dots
				return "0.00";
			}
			else
			{
				//--
				var pounds = tmpArray[0];
				var pence = tmpArray[1];
				if (pence > 99)
				{
					return "0.00";
				}
				
				if ((pence < 10) && (pence.length < 2)) pence += "0"; 
				return pounds + "." + pence;
			}
		}
		else
		{
			//-- there is no "."
			//-- so add ".00"
			return inValue + ".00";
		}
	}
}


//-- pick a colour (requires built in form colour_picker)
fglobal.prototype.pick_colour = fglobal_pick_colour;
function fglobal_pick_colour(funcCallback)
{
	var oForm = new PopupForm();
	oForm.Open("colour_picker","","", function(intID)
	{
		if(intID!=2)
		{
			// -- Only return colour if the form exists in DD
			funcCallback(oForm.document.strColour);
		}
	});
}

//--
//-- for a table and keyvalue and info col name return info value (typically used for pcdesc / pcinfo etc)
fglobal.prototype.get_key_info = fglobal_get_key_info;
function fglobal_get_key_info(strTable,varKeyValue,strInfoCol, strKeyCol)
{
	var strReturnInfo = "";

	//-- get table key column
	if(strKeyCol==undefined) strKeyCol = dd.tables[LC(strTable)].PrimaryKey;

	if(!this.dd_isnumeric(strTable,strKeyCol))
	{
		varKeyValue = "'" + app.g.pfs(varKeyValue) + "'";
	}
	var strSelect = "select " + strInfoCol + " as infotxt from " + strTable + " where " + strKeyCol + " = " + varKeyValue;

	var oRS  = this.get_recordset(strSelect,"swdata");
	if (oRS.Fetch())
	{ 
		strReturnInfo = this.get_field(oRS,"infotxt");
	}

	return strReturnInfo;
}

//-- just show problem picker thats all
fglobal.prototype.pick_problemprofile = fglobal_pick_problemprofile;
function fglobal_pick_problemprofile(strSelCode,strFilter,boolInfo,funcCallback)
{
	if(strSelCode==undefined)strSelCode="";
	if(strFilter==undefined)strFilter="";

	var pc = new ChooseProfileCodeDialog;
	pc.Open(false, false, strSelCode, strFilter, function(obj)
	{		
		if(obj!=false)
		{
			if(obj.code!="")
			{
				// -- Profile code selected
				if(boolInfo)
				{
					// -- Return info value as well
					funcCallback(obj.code + "|" + obj.codeDescription);
				}
				else
					// -- Return pofile code
					funcCallback(obj.code);
			}
			else
				// -- No profile code selected
				funcCallback("");
		}
		else
			// -- If you click on "Cancel", then no object is returned
			funcCallback("");
	});
}

//-- popup resolution picker
fglobal.prototype.pick_resolutionprofile = fglobal_pick_resolutionprofile;
function fglobal_pick_resolutionprofile(strSelCode,strFilter,funcCallback)
{
	if(strSelCode==undefined)strSelCode="";
	if(strFilter==undefined)strFilter="";

	var pc = new ChooseProfileCodeDialog;
	pc.Open(false, false, strSelCode, strFilter, function(obj)
	{		
		if(obj!=false)
		{
			if(obj.code!="")
			{
				// -- Return pofile code
				funcCallback(obj.code);
			}
			else
				// -- No profile code selected
				funcCallback("");
		}
		else
			// -- If you click on "Cancel", then no object is returned
			funcCallback("");
	});
}

//--
//-- NWJ - 24.11.2005 - copy a sw record based on a master record
fglobal.prototype.copy_sw_record = fglobal_copy_sw_record;
function fglobal_copy_sw_record(strTable,masterRecord, strSkipFields)
{
	if(strSkipFields==undefined)strSkipFields="";
	var strPriKeyName 	= dd.tables[LC(strTable)].PrimaryKey;	
	var varPriKeyValue   	= 0;
	var strWhere		= "";	
		
	var strInsertCols	 = "";	
	var strInsertVals	 = "";	
	for (var x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var aCol 	= dd.tables[LC(strTable)].columns[x];
		var strColName  = aCol.Name
		var strEncaps 	= (aCol.IsNumeric())?"":"'";
		var fldValue	= masterRecord[strColName];
		var skipWhere	= (fldValue=='')?true:false;
		var varValue 	= strEncaps + fldValue + strEncaps;
		
		//--
		//-- process the primary key
		boolSkip = false;
		if (strColName==strPriKeyName)
		{
			//-- auto id
			if (varPriKeyValue != 0)		
			{
				//--
				varValue 	= strEncaps + this.pfs(varPriKeyValue) + strEncaps;
			}
			else
			{
				boolSkip = true;
			}
		}

		if(!boolSkip)boolSkip=(strSkipFields.toLowerCase().indexOf(strColName.toLowerCase())!=-1);

		//-- if we do not want to skip				
		if (!boolSkip)
		{
			if (strInsertCols != "")strInsertCols +=",";
			strInsertCols += strColName;
		
			if (strInsertVals != "")strInsertVals +=",";
			strInsertVals += varValue;
	
			if (!skipWhere)
			{
				if (strWhere!="")strWhere += " and ";
				//-- nwj 13.04.2006 - changed = to like to solve ms sql issue
				strWhere += strColName + " like " + varValue;
			}
		}
	}

	//-- perform insert
	strInsertSQL = "insert into " + strTable + " (" + strInsertCols + ") values (" + strInsertVals + ")";
	this.submitsql(strInsertSQL,true);


	strSelectKey = "select " + strPriKeyName + " as pkey from " + strTable + " where " + strWhere;
	var aRS = this.get_recordset(strSelectKey,"swdata");
	var newPriKey = null;
	if (aRS.Fetch())
	{
		newPriKey = this.get_field(aRS,"pkey");
	}
	return newPriKey;
}


//--
//-- NWJ - 25.04.2007 - update a record based on another records field values
fglobal.prototype.copyfields_sw_record = fglobal_copyfields_sw_record;
function fglobal_copyfields_sw_record(strTable,oCopyRec, varPriKeyValue, strSkipFields, boolSkipEmpty)
{
	if(strSkipFields==undefined)strSkipFields="";
	var masterRecord 	= oCopyRec;
	var strPriKeyName 	= dd.tables[LC(strTable)].PrimaryKey;	
	var strUpdateVals	 = "";	

	for (var x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var aCol 	= dd.tables[LC(strTable)].columns[x];
		var strColName  = aCol.Name
		var strEncaps 	= (aCol.IsNumeric())?"":"'";
		var fldValue	= masterRecord[strColName];
		var varValue 	= strEncaps + app.g.pfs(fldValue) + strEncaps;
		
		//--
		//-- process the primary key
		boolSkip = false;
		if (strColName==strPriKeyName)
		{
			boolSkip = true;
		}

		if(!boolSkip)boolSkip=(strSkipFields.toLowerCase().indexOf(strColName.toLowerCase())!=-1);
		if((!boolSkip)&&(boolSkipEmpty) && (fldValue=="" || fldValue=="0"))boolSkip=true;
		//-- if we do not want to skip				
		if (!boolSkip)
		{
			if (strUpdateVals != "")strUpdateVals +=",";
			strUpdateVals += strColName + " = " +  varValue ;
		}
	}

	//-- perform insert
	var strUpdateSQL = "update " + strTable + " set " + strUpdateVals + " where " + strPriKeyName + " = " + varPriKeyValue;
	return this.submitsql(strUpdateSQL,true);

}

//-- 05.08.2004
//-- NWJ
//-- Datadictionary functions

//-- return list of dd table with option to load into a list object
fglobal.prototype.dd_gettablelist = fglobal_dd_gettablelist;
function fglobal_dd_gettablelist(oLB)
{
	var strDel = (oLB==undefined)?",":"|";
	var strTables = "|";
	for (x=0; x < dd.tables.length;x++)
	{
		if(strTables!="") strTables += strDel;
		strTables += dd.tables[x].Name;
	}

	if(oLB!=undefined) oLB.pickList = strTables;

	return strTables;
}

fglobal.prototype.dd_getcolumnlist = fglobal_dd_getcolumnlist;
function fglobal_dd_getcolumnlist(strTable, boolNumeric, arrIncludes, oLB)
{
	if(boolNumeric==undefined) boolNumeric=false;
	if(arrIncludes==undefined)arrIncludes=false;
	var strDel = "|";
	var strColumns = "";
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		if(arrIncludes)
		{
			if(arrIncludes[dd.tables[LC(strTable)].columns[x].name])
			{
				if(strColumns!="") strColumns += strDel;
				strColumns += dd.tables[LC(strTable)].columns[x].DisplayName;
				if(boolNumeric)strColumns += "^" + (x + 1);
			}
		}
		else
		{
			if(strColumns!="") strColumns += strDel;
			strColumns += dd.tables[LC(strTable)].columns[x].DisplayName;
			if(boolNumeric)strColumns += "^" + (x + 1);
		}
	}

	if(oLB!=undefined) oLB.pickList = strColumns;

	return strColumns;
}

//-- get table primary key name
fglobal.prototype.dd_primarykey = fglobal_dd_primarykey;
function fglobal_dd_primarykey(strTable)
{
   return dd.tables[LC(strTable)].PrimaryKey;
}

//-- check if field is numeric
fglobal.prototype.dd_isnumeric = fglobal_dd_isnumeric;
function fglobal_dd_isnumeric(strTable,strCol)
{
	return dd.tables[LC(strTable)].columns[LC(strCol)].IsNumeric(); // v7
}

//-- 24.08.2004
//-- NWJ
//-- get fields label value
fglobal.prototype.dd_fieldlabel = fglobal_dd_fieldlabel;
function fglobal_dd_fieldlabel(strTable,strCol)
{
	return dd.tables[LC(strTable)].columns[LC(strCol)].DisplayName; // v7
}

fglobal.prototype.dd_fieldexists = fglobal_dd_fieldexists;
function fglobal_dd_fieldexists(strTable,strCol)
{
	if (dd.tables[LC(strTable)].columns[strCol.toLowerCase()]) return true; //-- v7
	return false;
}


//-- 14.09.2004
//-- NWJ
//-- format the value according to data dictionary
fglobal.prototype.dd_format = fglobal_dd_format;
function fglobal_dd_format(strTable,strCol,strValue)
{
	return dd.tables[LC(strTable)].columns[strCol.toLowerCase()].FormatValue(strValue); //-- v7


}

//-- 23.08.2007
//-- NWJ
//-- Get field type
fglobal.prototype.dd_fieldtype = fglobal_dd_fieldtype;
function fglobal_dd_fieldtype(strTable,strCol)
{
	return dd.tables[LC(strTable)].columns[LC(strCol)].ControlType; //-- v7
}

//--
//-- EOF DD WRAPPERS
//--

//-- 14.09.2004
//-- NWJ
//-- format out the opencall.callref field
fglobal.prototype.pad_callref = fglobal_callref_pad;
fglobal.prototype.callref_pad = fglobal_callref_pad;
function fglobal_callref_pad(strValue)
{
	var oCall = app.g.get_record("OPENCALL", strValue);
	return oCall.h_formattedcallref;

}

fglobal.prototype.callref_unpad = fglobal_callref_unpad;
function fglobal_callref_unpad(strValue)
{
	//Cater for Callref Mask
	var oCall = app.g.get_recordwhere("OPENCALL","h_formattedcallref = '"+strValue+"'");
	return oCall.callref;
}


//-- NWJ
//-- 18.08.2004
//-- return sqlrecordset
fglobal.prototype.get_recordset = fglobal_get_recordset;
function fglobal_get_recordset(strSQL,strDB)
{
    var oRS = new SqlQuery;
    oRS.Query(strSQL, strDB);
	return oRS;
}

//-- NWJ
//-- 06.09.2004
//-- return sqlrecordset field value
fglobal.prototype.get_field = fglobal_get_field;
function fglobal_get_field(oRS,fieldname)
{
	var colIndex = fieldname;
	fieldname++;fieldname--;
	if(isNaN(fieldname))colIndex = oRS.GetColumnIndex(colIndex);

	if (oRS.IsColNumeric(colIndex))
	{
		return oRS.GetValueAsNumber(colIndex);
	}
	else
	{
		return oRS.GetValueAsString(colIndex);
	}
}

//--
//-- CALL MODIFICATION FUNCTIONS


//-- 06.10.2004
//-- NWJ
//-- Load popup form
fglobal.prototype.popup = fglobal_popup;
function fglobal_popup(strFormName,strURL, funcCallback)
{
	var oForm = new PopupForm();
	oForm.Open(strFormName,"",strURL, function()
	{
		funcCallback(oForm);
	});
}


//-- 08.09.2004
//-- NWJ
//-- systemdb functions
//--

//-- popup to pick analyst and group (returns analyst and or group object)
fglobal.prototype.pick_analystorgroup = fglobal_pick_analystorgroup;
function fglobal_pick_analystorgroup(strTitle,funcCallback)
{
	var dlg = new PickAnalystDialog;	
	if(dlg.Open(strTitle,function()
	{
		var strGroup = "";
		var strAnalystID = "";		
		strGroup = dlg.groupid;
		strAnalystID = dlg.analystid;
		var oResult = app.g.get_analystorgroup(strGroup,strAnalystID);
		funcCallback(oResult);
	}));
}

//-- return object with group object and analyst onject (if just group analyst = false)
fglobal.prototype.get_analystorgroup = fglobal_get_analystorgroup;
function fglobal_get_analystorgroup(strGroup,strAnalystID)
{
	var tmpobject= new Object();
	tmpobject.oAnalyst =false;
	tmpobject.oGroup =false;

	if(strAnalystID!="")
	{
		tmpobject.oAnalyst =app.g.get_analyst_detail(strAnalystID);
		tmpobject.oGroup =app.g.get_group_detail(strGroup);
 	}
	else if(strGroup!="")
	{
		tmpobject.oAnalyst =app.g.get_blank_analyst();
		tmpobject.oGroup =app.g.get_group_detail(strGroup);
	}
	
	return tmpobject;
}

//-- pick analyst dialg then get details
fglobal.prototype.pick_analyst = fglobal_pick_analyst;
function fglobal_pick_analyst(strTitle,funcCallback)
{
	var dlg = new PickAnalystDialog;
	if(dlg.Open(strTitle,function()
	{
		var strGroup = "";
		var strAnalystID = "";		
		strGroup = dlg.groupid;
		strAnalystID = dlg.analystid;
		var oResult = app.g.get_analyst_detail(strAnalystID);
		funcCallback(oResult);
	}));
}

//-- return a blank analyst object
fglobal.prototype.get_blank_analyst= fglobal_get_blank_analyst;
function fglobal_get_blank_analyst()
{
	result 			= new Object();
	result.id		= "";
	result.name		= "";
	result.supportgroup	= "";
	result.telephone	= "";
	result.email		= "";
	result.privelige	= "";
	return result;
}

//-- get analyst detail as an object
fglobal.prototype.get_analyst_detail = fglobal_get_analyst_detail;
function fglobal_get_analyst_detail(strAnalystID)
{
	var result	= false;

	//-- no id passed in (reset)
	if (strAnalystID=="") return result;

	//-- call generic php to get analyst info (we use php because we have no way of connecting to systemdb)
	var result	= false;
	var strSQL  	= "select analystid,name,supportgroup,contactb,contacte,priveligelevel from swanalysts where analystid = '" + app.g.pfs(strAnalystID) + "'";
	var strDB	= "syscache";
	var oRS		= this.get_recordset(strSQL,strDB);
	while (oRS.Fetch())
	{	
		//-- create object to hold analyst details
		result 			= new Object();
		result.id		= this.get_field(oRS,"analystid");
		result.name		= this.get_field(oRS,"name");
		result.supportgroup	= this.get_field(oRS,"supportgroup");
		result.telephone	= this.get_field(oRS,"contactb");
		result.email		= this.get_field(oRS,"contacte");
		result.privelige	= this.get_field(oRS,"priveligelevel");
	}
	
	return result;
}

//-- get analyst ids for a support group
fglobal.prototype.get_group_analystids = fglobal_get_group_analystids;
function fglobal_get_group_analystids(strGroupID)
{
	var result	= "";

	//-- no id passed in (reset)
	if (strGroupID=="") return "";

	//-- call generic php to get analyst info (we use php because we have no way of connecting to systemdb)
	var strSQL  	= "select analystid from swanalysts where class not in (0,2) and supportgroup = '" + app.g.pfs(strGroupID) + "'";
	var strDB	= "syscache";
	var oRS		= this.get_recordset(strSQL,strDB);
	while (oRS.Fetch())
	{	
		if(result!="")result+=",";
		result += this.get_field(oRS,"analystid");
	}

	return result;
}

//-- 04.11.2004
//-- AR
//-- get group detail as an object
fglobal.prototype.get_group_detail = fglobal_get_group_detail;
function fglobal_get_group_detail(strGroupID)
{
	var result = false;
 
	//-- no id passed in (reset)
	if (strGroupID=="") return result;
 
	//-- call generic php to get group info (we use php because we have no way of connecting to systemdb)
	var strSQL  = "select id,name,attrib1,attrib2,attrib3,attrib4,attrib5,attrib6,notes from swgroups where id = '" + app.g.pfs(strGroupID) + "'";
	var strDB = "syscache";
	var oRS  = this.get_recordset(strSQL,strDB);
	while (oRS.Fetch())
	{ 
		 //-- create object to hold group details
		  result = new Object();
		  result.id   = this.get_field(oRS,"id");
		  result.name   = this.get_field(oRS,"name");
		  result.attrib1  = this.get_field(oRS,"attrib1");
		  result.attrib2  = this.get_field(oRS,"attrib2");
		  result.attrib3  = this.get_field(oRS,"attrib3");
		  result.attrib4  = this.get_field(oRS,"attrib4");
		  result.attrib5  = this.get_field(oRS,"attrib5");
		  result.attrib6  = this.get_field(oRS,"attrib6");
		  result.notes  = this.get_field(oRS,"notes");
	 }
 return result;
}



//-- 11.10.2004
//-- NWJ
//-- Date Functions


//-- convert todays date to epoch
fglobal.prototype.hoursminutes_fromminutes = fglobal_hoursminutes_fromminutes;
function fglobal_hoursminutes_fromminutes(intMinutes)
{
	var strHours = new String(intMinutes / 60);
	var intHours = new Number(strHours.split(".")[0]);
	var	intMins  = intMinutes % 60;
	if(intMins<10)intMins = "0" + intMins;

	return intHours + "." + intMins;
}
//-- convert todays date to epoch
fglobal.prototype.todaysdate_epoch = fglobal_todaysdate_epoch;
function fglobal_todaysdate_epoch()
{
	var todaysDate = new Date();
    var humDate = new Date(Date.UTC(todaysDate.getFullYear(),todaysDate.getUTCMonth(),todaysDate.getUTCDate(),todaysDate.getUTCHours(),todaysDate.getMinutes(),todaysDate.getSeconds()+1));
	var epochDate = new Number((humDate.getTime()/1000.0));
    return epochDate;
}


//-- convert date to epoch
fglobal.prototype.convert_dateepoch = fglobal_convert_dateepoch;
function fglobal_convert_dateepoch(intYear,intMonth,intDay,intHour,intMinutes,intSeconds)
{
    var humDate = new Date(Date.UTC(intYear,intMonth-1,intDay,intHour,intMinutes,intSeconds));
    var epochDate = new Number((humDate.getTime()/1000.0));
    return epochDate;
}

//-- convert epoch to date ()
fglobal.prototype.convert_epochdate = fglobal_convert_epochdate;
function fglobal_convert_epochdate(intEpoch)
{
	if (intEpoch <0)
	{
		intEpoch = (1073741824-(intEpoch*-1))+1073741824;
	}
	return new Date(intEpoch * 1000);
}

//-- fix broken epochs
fglobal.prototype.fixepoch = fglobal_fixepoch;
function fglobal_fixepoch(intEpoch)
{
	if (intEpoch <0)
	{
		intEpoch = (1073741824-(intEpoch*-1))+1073741824;
	}
	return intEpoch;
}

//-- 09.12.2004
//-- epoch to dd/mm/yyyy
fglobal.prototype.convert_epochddmmyyyy = fglobal_convert_epochddmmyyyy;
function fglobal_convert_epochddmmyyyy(intEpoch)
{

	aDate = this.convert_epochdate(intEpoch)
    monthstr = String(aDate.getMonth() + 1);
    if (monthstr.length == 1) monthstr = "0" + monthstr;
    datestr = String(aDate.getDate());
    if (datestr.length == 1)datestr = "0" + datestr;
    
    var wholedate = datestr + "/" + monthstr + "/" + String(aDate.getFullYear());
	return wholedate;
}

//-- convert epoch to date ()
fglobal.prototype.fix_epoch = fglobal_fix_epoch;
function fglobal_fix_epoch(intEpoch)
{
	if (intEpoch <0)
	{
		intEpoch = (1073741824-(intEpoch*-1))+1073741824;
	}
	return intEpoch;
}

//-- get days between dates
fglobal.prototype.days_between_dates = fglobal_days_between_dates;
function fglobal_days_between_dates(dFirstDate,dSecondDate)
{
    //-- The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = dFirstDate.getTime()
    var date2_ms = dSecondDate.getTime()

    //-- Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)
    
    //-- Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

//-- 09.12.2004
//-- DTH
//-- Generate a readable date time string for todays date
fglobal.prototype.get_readable_datetime = fglobal_get_readable_datetime;
function fglobal_get_readable_datetime()
{
    Today = new Date();    
    monthstr = String(Today.getMonth() + 1);
    if (monthstr.length == 1) monthstr = "0" + monthstr;
    datestr = String(Today.getDate());
    if (datestr.length == 1)datestr = "0" + datestr;
    hourstr = String(Today.getHours());
    if (hourstr.length == 1)hourstr = "0" + hourstr;
    minstr = String(Today.getMinutes());
    if (minstr.length == 1)minstr = "0" + minstr;
    secstr = String(Today.getSeconds());
    if (secstr.length == 1) secstr = "0" + secstr;
    
    var wholedate = datestr + "/" + monthstr + "/" + String(Today.getFullYear()) + " " + hourstr + ":" + minstr + ":" + secstr;
	return wholedate;
}

//-- return true or false if instring
fglobal.prototype.instr = fglobal_instr;
function fglobal_instr(strValue,strNeedle)
{
	if(isNaN(strValue))
	{
		return (strValue.indexOf(strNeedle)!=-1);
	}

	return false;
}

//-- upper and lower case
function UC(strValue)
{
	strValue = strValue + "";
	return strValue.toUpperCase();
}

function LC(strValue)
{
	strValue = strValue + "";
	return strValue.toLowerCase();
}


function in_array(arr,val){
	for(var i=0,l=arr.length;i<l;i++){
		if(arr[i]===val)
			return true;
	}
	return false;
}

function array_count(arrObject) {
	var c = 0;
	for(var i = 0; i < arrObject.length; i++) {
		if(typeof(arrObject[i]) !== "undefined") {
			if(typeof(arrObject[i]) == "string" && arrObject[i].length == 0) {
			} else { 
				c++;
			}
		}
	}
	return c;
}


//-- 16.09.2004
//-- NWJ
//-- INITIALISATION FUNCTIONS TO BE CALLED EACH TIME GLOBAL LOADS
//--
var gbl_initialised = false;
function global_init_configuration()
{
	//--
	//-- already initialised so get out of here
	if (gbl_initialised) return;

	//-- check if defined yet
	//-- if not already set connect to db and get analyst privileges
	gbl_initialised = (gbl_initialised==undefined)?false:gbl_initialised;
	if (!gbl_initialised)
	{
		//-- initialise any start up vars here
		
		//-- set flag
		gbl_initialised= true;
	}

}
global_init_configuration();



