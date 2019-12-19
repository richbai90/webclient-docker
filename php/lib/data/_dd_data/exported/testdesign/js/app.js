this.array_openkbdocs = [];
this.array_strRAKbDocFilter = [];
this.strRASearchText = "";

function OnAssignCall(strCallRefs, strGroup, strAnalyst)
{
	var p ={};
	p.crs = strCallRefs;
	p.cdb=1;
	var oRS = app.g.get_sqrecordset("helpdesk/get.callinfo.basic",p);
	while(oRS.Fetch())
	{
		strCallclass = app.g.get_field(oRS,"callclass");
		strOrigSupportGroup = app.g.get_field(oRS,"suppgroup");
		strOwner = app.g.get_field(oRS,"owner");
		if(strCallclass==="OLA Task")
		{
			if(strOrigSupportGroup!==strGroup)
			{
				MessageBox('Cannot reassign OLA Task to another Support Group.');
				return false;
			}
		}
	}
	return true;
}

function OnOpenNew3rdPartySupplierForm()
{
	app.OpenFormForAdd("EfSupplier", "", "", true);
	return false;
}

function OnOpenEdit3rdPartySupplierForm(strKeyValue)
{
	app.OpenFormForEdit("EfSupplier", strKeyValue, "", true);
	return false;
}

function OnOpenEditSlaForm(nSlaId, bThirdParty)
{
	if(bThirdParty && !app.g.boolStandard)
	{
		var strParams = "priority="+pfu(nSlaId);
		var oRS = app.g.get_sqrecordset("form/tfcontract/get_contract",strParams);
		if(oRS.Fetch())
		{
			var strPK = app.g.get_field(oRS,"pk_contract_id");
			app.OpenFormForEdit("Tf3PartyContract", strPK, "", true);
			return false;
		}
	}
	return true;
}

function OnOpenNewSlaForm(strSlaName, bThirdParty)
{
	if(bThirdParty)
	{
		app.OpenFormForAdd("Tf3PartyContract", "", "fk_company_id=" + pfu(strSlaName)+"&type=supplier", true);
		return "";
	}
	return;
}

function OnOpenManageSlasForm()
{
	app.OpenForm("manage_slm", "", false);
	return false;
}

function kb_search()
{
	if(!app.g.use_sw_knowledgebase())
	{
		app.g.open_third_party_kb_search();
		return false;
	}else{
		app.g.search_for("swkb", false, "searchmode=0");
		return "";
	}
	return true;
}


function kb_newdoc()
{
	if(!app.g.use_sw_knowledgebase())
	{
		app.g.open_third_party_kb_add_form();
		return false;
	}

	if(!app.session.HaveRight(ANALYST_RIGHT_D_GROUP, ANALYST_RIGHT_D_CANADDKBDOCUMENTS,true)) return false;

	app.OpenFormForAdd("swkb_article", "", "", false);
	return false;
}

function kb_extdoc()
{
	if(!app.g.use_sw_knowledgebase())
	{
		MessageBox("This option is not available with your Knowledgebase.");
		return false;
	}

	if(!app.session.HaveRight(ANALYST_RIGHT_D_GROUP, ANALYST_RIGHT_D_CANADDEXTKBDOCUMENTS,true)) return false;

	app.OpenFormForAdd("swkb_external", "", "", true);
	return false;
}

function kb_managecats()
{
	if(!app.g.use_sw_knowledgebase())
	{
		MessageBox("This option is not available with your Knowledgebase.");
		return false;
	}

	if(!app.session.HaveRight(ANALYST_RIGHT_D_GROUP, ANALYST_RIGHT_D_CANMANAGEKBCATALOGS,true)) return false;


	app.OpenFormForAdd("swkb_managecatalogs", "", "", true);
	return false;
}

function OnOpenKBArticleProperties(strDoc)
{

	if(!app.session.HaveRight(ANALYST_RIGHT_D_GROUP, ANALYST_RIGHT_D_CANEDITKBDOCUMENTS,true)) return false;


	//-- open different form depending on the type?
	var intIndexed = 0;

	var p = {};
	p.docref=strDoc
	var oRS = app.g.get_tablerecordset_bycol("swkb_articles",p,false,"flg_indexed");

	if(oRS.Fetch())
	{
		intIndexed=  app.g.get_field(oRS,"FLG_INDEXED");
	}
	else
	{
		//-- do _swdoc (either upgraded or a default _swdoc) so create record
		intIndexed = app.oKB.copy_syskbdoc_to_swdata(strDoc);
		if(intIndexed===-1) return false;
	}

	if(intIndexed===1)
	{
		app.OpenFormForEdit("swkb_external", strDoc, true);
	}
	else
	{
		app.OpenFormForEdit("swkb_article", strDoc, true);
	}
	return false;
}


function OnDeleteAnalyst(szAnalystID, bIsThirdPartySupplier) 
{
	if(bIsThirdPartySupplier)
	{
		return app.g.sqlexecute_delete("SUPPLIER",szAnalystID);
	}
	return true;
}

function OnDeleteSLA(iSlaId, bIsThirdPartySLA)
{
	if(bIsThirdPartySLA)
	{
		return app.g.delete_tablebycol("CONTRACT","FK_PRIORITY",iSlaId);
	}
	return true;
}

function OnNewCallLogged(nCallRef, strCallClass)
{
	if(strCallClass==="OLA Task")
		return false;

	//-- nwj - 29.03.2010 - hide log call conf when doing log and resolve
	if(app.g.bDoNotShowLogCallConfirmation)
	{
		if(app.g.bPromptToOpenCallDetails)
		{
			if(confirm("Would you like to open the detail record for this " + strCallClass))
			{
				app.global.OpenCallDetailsView(nCallRef);
			}
		}
		app.g.bDoNotShowLogCallConfirmation = false;
		app.g.bPromptToOpenCallDetails = true;
		return false;
	}

	return true;
}

function PCMGetSlaReplacementName()
{
	return "Priority";
}

function PCMGetItsmSlaName()
{
	return "SLA";
}

function PCMGetItsmSlaSqlStatement(strColumn1, strColumn2)
{

	return "select pk_slad_id as '"+strColumn2+"', slad_id as '"+strColumn1+"' from itsmsp_slad";
}

function PCMGetOldSlaSqlStatement(strColumn1, iITSMSlaId)
{
	var strNames="";
	var p = {};
	p.flg_sla=1;
	p.fk_slad=iITSMSlaId;
	var oRS = app.g.get_tablerecordset_bycol("itsmsp_slad_priority",p,false,"fk_priority");
	while(oRS.Fetch())
	{
		strPriority = app.g.get_field(oRS,"fk_priority");
		if(strNames!=="")
			strNames+=",";
		strNames+="'"+app.g.pfs(strPriority)+"'";

	}
	var strWhere = "";
	if(strNames!=="")
		strWhere = "where name in ("+strNames+")";
	else
		strWhere = "where name in ('')";
	return "select name as '"+strColumn1+"' from system_sla "+strWhere;
}

function SSPGetSlaReplacementName() 
{
	return "Priority";
}

function CPGetItsmSlaNameSqlStatement(iITSMSlaId, strColName)
{
	return "select slad_id as '"+strColName+"' from itsmsp_slad where pk_slad_id=" + iITSMSlaId;
}

//-- nwj – 24.03.2010
//-- called from resolveclose form to override default form
function OnNewKBDocument(strAuthorID,strProfileCode,strCallref,strProblem,strSolution,strKeywords,strTitle)
{
	if(!app.session.HaveRight(ANALYST_RIGHT_D_GROUP, ANALYST_RIGHT_D_CANADDKBDOCUMENTS,true)) return false;

	var strParams = "swkb_articles.author=" + pfu(strAuthorID);
		strParams += "&swkb_articles.callprobcode=" + pfu(strProfileCode);
		strParams += "&swkb_articles.callref=" + pfu(strCallref);
		strParams += "&swkb_articles.problem=" + pfu(strProblem);
		strParams += "&swkb_articles.solution=" + pfu(strSolution);
		strParams += "&swkb_articles.keywords=" + pfu(strKeywords);
		strParams += "&swkb_articles.title=" + pfu(strTitle);

	//-- call custom form and pass in params
	app.OpenFormForAdd("swkb_article", "", strParams, true);

	//-- return false to cancel syustem default action
	return false;
}

function WebClientOverride_OpenFormForEdit(strFormName,varRecordKey,strParams,boolModal,openfromWin,fCallback)
{
    if(strFormName==="cmdb_popup_ci")
    {
		//-- override fullclient behaviour and work out with ci form to open here
        if(varRecordKey===0 || varRecordKey==="0")
        {
			//-- open for insert
            return app.cmdb.create_configitem("",true);
        }
        else
		{
	        //-- opened for edit
            return app.cmdb.popup_configitem(varRecordKey,true,"",true);
        }
	}

	//-- tell webclient to do its normal thing
    return false;
}


/* RightAnswers KB Functions */
function allocatekbdoc(callkbidentifier, oDocument)
{
	app.array_openkbdocs[callkbidentifier] = oDocument;
}

function kb_addarticletocall(strParams)
{
	var arrSplitParams = [];
	var arrParams = strParams.split(",");
	for (x in arrParams)
	{
		arrSplitParams[arrParams[x].substring(0,arrParams[x].indexOf('='))] = arrParams[x].substring(arrParams[x].indexOf('=')+1,arrParams[x].length);
	}

	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("table", "rakb_articles");		
	xmlmc.SetData("docref",arrSplitParams.id);
	xmlmc.SetData("title",decodeURIComponent(arrSplitParams.title.replace(/\+/g, ' ')));
	
	if(xmlmc.Invoke("data", "addRecord"))
	{
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
			if(!app.g.rakb_record_in_sw(arrSplitParams.id))
			{
				MessageBox("Failed to process record creation for Knowledgebase Article (" + objRes.message + "). Please contact your Supportworks Supervisor.");
			}
		}	
		else
		{
			strNewId = xmlmc.GetReturnValue("lastInsertId");
			//MessageBox("Article selected");
		}
	}
	else
	{
		if(!app.g.rakb_record_in_sw(arrSplitParams.id))
		{
			MessageBox("Failed to process record creation for Knowledgebase Article. " + xmlmc.GetLastError() + ". Please contact your Supportworks Supervisor.");
		}
	}		
	
	if(arrSplitParams.callref>0)
	{
		app.g.relate_call_to_rakb(arrSplitParams.id,arrSplitParams.callref);
	
		//-- populate existing articles refs against call into array filter
		var strExistingDocs = app.g.sl_get_valuesdel(app.array_openkbdocs[arrSplitParams.callkbidentifier].extform.sl_rakb,0,",","'");
		if((this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]!=="")&&(this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]!==undefined))
			this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier] += ",";
		
		if(this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]!==undefined)
		{
			this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier] += strExistingDocs;
		}
		else
		{
			this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier] = strExistingDocs;
		}
	}
	
	//-- Add newly selected article to filter
	if((this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]!=="")&&(this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]!==undefined))
		this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier] += ",";

	if(this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]!==undefined)
	{
		this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier] += "'"+arrSplitParams.id+"'";
	}
	else
	{	
		this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier] = "'"+arrSplitParams.id+"'";
	}
	_slf(app.array_openkbdocs[arrSplitParams.callkbidentifier].extform.sl_rakb , "docref IN (" +this.array_strRAKbDocFilter[arrSplitParams.callkbidentifier]+ ")");
}


//-- 31.01.2013
//-- NWJ - BPMUI FUCTIONS
function reset_worfklow_ui()
{
	if(app.session.httpPort === "443")
	{
		var strURL = "https://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/index-left.php?sessid="+app.session.sessionId;
		app.global.OpenEmbeddedURL(strURL,true,true);    

		var strURL = "https://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/splash.php";
		app.global.OpenEmbeddedURL(strURL,true,false);    
	}else
	{
		var strURL = "http://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/index-left.php?sessid="+app.session.sessionId;
		app.global.OpenEmbeddedURL(strURL,true,true);    

		var strURL = "http://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/splash.php";
		app.global.OpenEmbeddedURL(strURL,true,false);   
	}

}

function reload_workflow_ui_tree()
{
	if(app.session.httpPort === "443")
	{
		var strURL = "https://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/index-left.php?sessid="+app.session.sessionId;
	}else
	{
		var strURL = "http://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/index-left.php?sessid="+app.session.sessionId;
	}
	app.global.OpenEmbeddedURL(strURL,true,true);    
}

function reload_workflow_ui_graph(wid,strCallClass,strCellID)
{
	var strParams = "wid="+encodeURIComponent(wid)+",classname="+encodeURIComponent(strCallClass)+",selectcell=" + encodeURIComponent(strCellID)+",callclass="+encodeURIComponent(strCallClass);
	load_workflow_ui(strParams);
}

function load_workflow_ui(strParams)
{
	var arrRecParams = [];
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);
	}
	if(app.session.httpPort === "443")
	{
		var strURL = "https://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/index.php?sessid="+app.session.sessionId+"&wid=" + encodeURIComponent(arrRecParams.wid)+"&callclass=" + encodeURIComponent(arrRecParams.callclass)+"&selectcell=" + encodeURIComponent(arrRecParams.selectcell);

	}else
	{
		var strURL = "http://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/_bpmui/"+ app.session.dataDictionary +"/index.php?sessid="+app.session.sessionId+"&wid=" + encodeURIComponent(arrRecParams.wid)+"&callclass=" + encodeURIComponent(arrRecParams.callclass)+"&selectcell=" + encodeURIComponent(arrRecParams.selectcell);
	}
	app.global.OpenEmbeddedURL(strURL,true,false);    
}

function bpmui_add_workflow(strParams)
{
	var arrParams = strParams.split(",");
	var formParams = ""
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}

	app.OpenFormForAdd("bpm_workflows","",formParams,true, function(){
		reload_workflow_ui_tree();
	});	
}

function bpmui_edit_workflow(strParams)
{
	var formParams = ""
	var arrRecParams = [];
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);

		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}

	app.OpenFormForEdit("bpm_workflows",arrRecParams.key,formParams,true, function()
	{
		if(app.g.SavedWorkflowRecord)
		{
			app.g.SavedWorkflowRecord=false;
			reload_workflow_ui_graph(arrRecParams.key,arrRecParams.callclass,arrRecParams.cellid);
		}
	});
}

function bpmui_copy_workflow(strParams)
{
	var formParams = ""
	var arrRecParams = [];
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);

		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}
	var strURL = "src_workflow="+pfu(arrRecParams.key);
	app.OpenForm("bpm_copy", strURL, true, function(oForm)
	{
		if(oForm.document.boolRefresh)
			reload_workflow_ui_tree();
	});
}

function load_workflow_import_export()
{
	var colourSchema = app.g.get_CurrentSkinColorSchema();
	var result = app.OpenHtmlWindow("bpm_util", "frame", "&[app.webroot]/clisupp/_bpmutil/"+ app.session.dataDictionary +"/index.php?sessid="+app.session.sessionId+"&colourscheme="+colourSchema,"BPM Utility",true,1024,768);
}
function bpmui_edit_stage(strParams)
{
	var formParams = ""
	var arrRecParams = [];
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);

		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}

	app.OpenFormForEdit("bpm_stage",arrRecParams.key,formParams,true, function(){
		if(app.g.SavedWorkflowRecord)
		{
			app.g.SavedWorkflowRecord=false;
			reload_workflow_ui_graph(arrRecParams.fk_workflow_id,arrRecParams.callclass,arrRecParams.cellid);
		}
	});
}

function bpmui_add_condition(strParams)
{
	var arrRecParams = []; 
	var arrParams = strParams.split(",");
	var formParams = ""
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);

		var arrPI = arrParams[x].split("=");
		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}

	app.OpenFormForAdd("bpm_condition","",formParams,true, function()
	{
		if(app.g.SavedWorkflowRecord)
		{
			app.g.SavedWorkflowRecord=false;
			reload_workflow_ui_graph(arrRecParams.fk_workflow_id,arrRecParams.callclass,arrRecParams.cellid);
		}
	});
}

function bpmui_edit_condition(strParams)
{
	var formParams = ""
	var arrRecParams = [];
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);

		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}

	app.OpenFormForEdit("bpm_condition",arrRecParams.key,formParams,true, function()
	{
		if(app.g.SavedWorkflowRecord)
		{
			app.g.SavedWorkflowRecord=false;
			reload_workflow_ui_graph(arrRecParams.fk_workflow_id,arrRecParams.callclass,arrRecParams.cellid);
		}
	});
}

//-- CH00125373 Change schedule function
function load_scheduled_item_form(strParams)
{
	var formParams = ""
	var arrRecParams = [];
	var arrRecParams2 = [];
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);

		if(formParams!=="")formParams+="&";
		formParams+=arrPI[0].toLowerCase() +"="+ decodeURIComponent(arrPI[1]);
	}
	var intID = arrRecParams.id;
	if(intID!==undefined)
	{
		var oForm = app.OpenFormForEdit("fsc_item",intID, formParams, true);
	}
	else
	{
		var oForm = app.OpenFormForAdd("fsc_item","",formParams,true);
	}
	//reload_change_schedule();
}

//-- CH00125373 Change schedule function
function reload_change_schedule()
{		
	if(app.session.httpPort === "443")
	{
		var strURL = "https://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/fsc/index.php?sessid="+app.session.sessionId;

	}
	else
	{
		var strURL = "http://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/fsc/index.php?sessid="+app.session.sessionId;
	}
	app.global.OpenEmbeddedURL(strURL,true,false);    
}

