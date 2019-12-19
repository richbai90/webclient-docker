//--
//-- C O N F I G U R A T I O N  S P E C I F I C  M E T H O D S
//--

//-- nwj - object to help with kbase forms
//-- kbase object
function oSwKb()
{

}
var oKB = new oSwKb();
//-- open article form


oSwKb.prototype.open_article_form = function(strDoc,funcCallback)
{
	if(!app.session.HaveRight(ANALYST_RIGHT_D_GROUP, ANALYST_RIGHT_D_CANEDITKBDOCUMENTS,true))
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(false);
		}
	}
	else
	{
		//-- open different form depending on the type?
		var intIndexed = 0;

		var ap = {};
		ap.DOCREF = strDoc;
		var oRS = app.g.get_tablerecordset_bycol("swkb_articles",ap,false,"FLG_INDEXED"); 	
		if(oRS.Fetch())
		{
			intIndexed=  app.g.get_field(oRS,"FLG_INDEXED");
		}
		else
		{
			//-- do _swdoc (either upgraded or a default _swdoc) so create record
			intIndexed = this.copy_syskbdoc_to_swdata(strDoc);
			if(intIndexed==-1)
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(false);
				}
			}
		}

		if(intIndexed==1)
		{
			app.OpenFormForEdit("swkb_external", strDoc, "",true, function()
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(true);
				}
			});
		}
		else
		{
			app.OpenFormForEdit("swkb_article", strDoc, "",true, function()
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(true);
				}
			});
		}
	}
}

//-- create relation between master doc and number of child docs
oSwKb.prototype.relate_articles = function(strParentDoc, strChildDocs)
{
	var arrChildDocs = strChildDocs.split(",");

	for(var x=0;x<arrChildDocs.length;x++)
	{
		if(strParentDoc!=arrChildDocs[x])
		{
			var arrParams ={};
			arrParams.docref=strParentDoc;
			arrParams.relateddocref=arrChildDocs[x];
			if(app.g.sqs_rowcountbycol("SWKB_RELATED",arrParams)==0)
			{
				//-- insert into swdb
				//-- nwj - 11.2012 - use sqs instead
				var strParams = "pd=" + pfu(strParentDoc) + "&cd=" + pfu(arrChildDocs[x]);
				app.g.submitsqs("knowledgebase/relate_articles.insert",strParams);
			}
		}
		else
		{
			MessageBox("You have selected to relate this document to itself. This selection will be omitted.");
		}
	}
}

//-- create relation between master doc and number of child docs
oSwKb.prototype.create_articleupdateentry = function(strDocRef, strText)
{
		//-- insert into swdb
		//-- nwj - 11.2012 - use sqs instead
		var strParams = "did=" + pfu(strDocRef) + "&desc=" + pfu(strText);
		app.g.submitsqs("knowledgebase/create_articleupdateentry.insert",strParams);
}


//-- delete relation between master doc and number of child docs
oSwKb.prototype.unrelate_articles = function(strParentDoc, strChildDocs)
{
	//-- nwj - 11.2012 - use sqs - note do mass delete
	var strParams = "did=" + pfu(strParentDoc) +"&cdids=" + pfu(strChildDocs);
	app.g.submitsqs("knowledgebase/unrelate_articles.delete",strParams);
}

//-- return related documents (child and parents)
oSwKb.prototype.get_related_article_refs = function (strDocRef, boolPFS)
{
	if(boolPFS==undefined)boolPFS=false;

	//-- get child arts
	var ap = {};
	ap.DOCREF = strDocRef;
	var oRS = app.g.get_tablerecordset_bycol("SWKB_RELATED",ap,false,"RELATEDDOCREF"); 	

	var strReturnString = (boolPFS)?"-1":"";

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strReturnString !="")strReturnString +=",";
		var strVal = app.g.get_field(oRS,"RELATEDDOCREF");
		strReturnString += strVal;
	}

	//-- get parent arts (where strDocRef is child)

	var ap = {};
	ap.RELATEDDOCREF = strDocRef;
	var oRS = app.g.get_tablerecordset_bycol("SWKB_RELATED",ap,false,"DOCREF"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strReturnString !="")strReturnString +=",";

		var strVal = app.g.get_field(oRS,"DOCREF");
		strReturnString += strVal;
	}

	return strReturnString;
}


//-- copy a sys kb _swdoc over to swkb
oSwKb.prototype.copy_syskbdoc_to_swdata = function (strDocRef)
{
	var intIndexed = 0;

	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("docRef",strDocRef);

	if(xmlmc.Invoke("knowledgebase", "documentGetInfo"))
	{
		//-- get the result
		//var strXML = xmlmc.GetReturnXml();
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
			MessageBox("Failed to load knowledgebase document (" + objRes.message + "). Please contact your Supportworks Supervisor.");
			return -1;
		}       
		else
		{
			//-- create xmldom from returned xml
			var xmlDom = new XmlFile(); 
			bRet = xmlDom.loadFromString(strXML); 

			var arrCols = [];

			var strCols = "";
			var strValues = "";
			var intIndexed = 0;

			//oRec = {};
			for (count = 0; count < xmlDom.methodCallResult.params.length; count ++) 
			{  
				var strColName = xmlDom.methodCallResult.params[count].nodeName;
				var varValue =xmlDom.methodCallResult.params[count].nodeValue;

				//-- manage col name changes
				if(strColName=="docVisibleToCustomers")
				{
					strColName="docflags";
					if(varValue=="true")
						varValue = 1;
					else
						varValue = 0;
				}
				else if(strColName=="catalogId")
				{
					strColName="catalog";

					//-- get catalog name
					var oRec = app.g.get_record("SWKB_CATALOGS", varValue);
					if(oRec)
					{
						arrCols.CATALOGNAME = oRec.catalogname;
					}
				}
				else if(strColName=="docPath")
				{
					strColName="sourcepath";

					//-- set flg_indexed
					if(varValue!="")
					{
						intIndexed =1;
						arrCols.FLG_INDEXED = "1";
					}
				}
				else if(strColName=="docDate" || strColName=="lastmodifieddate" || strColName==="sourceDate" || strColName==="expiryDate")
				{
					//-- we need to set docdatex as well so convert iso string date to epoch
					//-- we need to set the epoch field as well so convert iso string date to epoch
					strColName = strColName+"x";

					varValue = app.g.convert_isodate_epoch(varValue);

				}

				//-- F0098430
				if(varValue=='false')
					varValue = 0;
				
				strColName = strColName.toUpperCase();

			//	if(strValues != "") strValues += ",";
			//	strValues += app.g.encapsulate("swkb_articles",strColName,varValue);
				arrCols[strColName] = varValue;
			}

			if(arrCols.APPCODE == undefined)
			{
				arrCols.APPCODE = itsm_get_session_param("dataset");
			}
			
			if(!app.g.submittableinsert("SWKB_ARTICLES",arrCols))
				return -1;
		}
	}
	else
	{
		return -1;
	}

	return intIndexed;
}


oSwKb.prototype.relate_ci_to_kb = function (fk_ci_id,docref)
{
	//-- nwj - 11.2012 - use sqs instead
	var strParams = "did=" + pfu(docref) + "&cid=" + pfu(fk_ci_id);
	return app.g.submitsqs("knowledgebase/relate_ci_to_kb.insert",strParams);
}

oSwKb.prototype.get_cis_kbs = function (fk_ci_id)
{
	var strKBDocRefs = "";

	var ap = {};
	ap.FK_CI_ID = fk_ci_id;
	var oRS = app.g.get_tablerecordset_bycol("CONFIG_RELKB",ap,false,"KB_DOCREF"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"KB_DOCREF");
		if (strKBDocRefs!="")strKBDocRefs +=",";
		strKBDocRefs += currKey;
	}
	if(strKBDocRefs=="")strKBDocRefs="-1";
	return strKBDocRefs;
}
//-- Get KBS Associated to a Service Potfolio Status
oSwKb.prototype.get_srs_kbs_portfolio = function (fk_ci_id, strFolio)
{
	var strKBDocRefs = "";

	var ap = {};
	ap.sc_folio = strFolio;
	var oRS = app.g.get_tablerecordset_bycol("SWKB_ARTICLES",ap,false,"docref"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"docref");
		if (strKBDocRefs!="")strKBDocRefs +=",";
		strKBDocRefs += currKey;
	}
	if(strKBDocRefs=="")strKBDocRefs="-1";
	return strKBDocRefs;
}

//-- 20.10.2005
//-- NWJ
//-- remove a CI from a call record
oSwKb.prototype.unrelate_ci_from_kb = function (strKBdocref,intCIkeys)
{
	//--
	var strParams = "did=" + pfu(strKBdocref) + "&cis=" + pfu(intCIkeys);
	return app.g.submitsqs("knowledgebase/unrelate_ci_from_kb.delete",strParams);
}

oSwKb.prototype.get_kb_cis = function (kb_docref)
{
	var strCIIds = "";

	var ap = {};
	ap.KB_DOCREF = kb_docref;
	var oRS = app.g.get_tablerecordset_bycol("CONFIG_RELKB",ap,false,"FK_CI_ID"); 


	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CI_ID");
		if (strCIIds!="")strCIIds +=",";
		strCIIds += currKey;
	}
	if(strCIIds=="")strCIIds="-1";
	return strCIIds;
}


oSwKb.prototype.relate_ci_type_to_kb = function (fk_config_type,type_display,fk_docref)
{
	//- -nwj - use sqs - 11.2012
	var strParams = "did=" + pfu(fk_docref) + "&ct=" + pfu(fk_config_type) + "&td=" + pfu(type_display);
	return app.g.submitsqs("knowledgebase/relate_ci_type_to_kb.insert",strParams);

}

//-- 20.10.2005
//-- NWJ
//-- remove a CI from a call record
oSwKb.prototype.unrelate_ci_type_from_kb = function (strKBdocref,strCITypes)
{
	//--
	//--nwj - use sqs - 11.2012
	var strParams = "did=" + pfu(strKBdocref) + "&cts=" + pfu(strCITypes);
	return app.g.submitsqs("knowledgebase/unrelate_ci_type_from_kb.delete",strParams);

}

oSwKb.prototype.get_kb_ci_types = function (kb_docref)
{
	var strCIIds = "";

	var ap = {};
	ap.KB_DOCREF = kb_docref;
	var oRS = app.g.get_tablerecordset_bycol("CI_TYPE_RELKB",ap,false,"FK_CONFIG_TYPE"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CONFIG_TYPE");
		if (strCIIds!="")strCIIds +=",";
		strCIIds += currKey;
	}
	if(strCIIds=="")strCIIds="-1";
	return strCIIds;
}

oSwKb.prototype.get_ci_types_kbs = function (fk_config_type)
{
	var strKBDocRefs = "";

	var ap = {};
	ap.FK_CONFIG_TYPE = fk_config_type;
	var oRS = app.g.get_tablerecordset_bycol("CI_TYPE_RELKB",ap,false,"KB_DOCREF"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"KB_DOCREF");
		if (strKBDocRefs!="")strKBDocRefs +=",";
		strKBDocRefs += currKey;
	}
	if(strKBDocRefs=="")strKBDocRefs="-1";
	return strKBDocRefs;
}

oSwKb.prototype.unrelate_calls_from_kb = function (strKBdocref,strCallrefs)
{
	//-- Handle processing of multiple string doc refs
	//--nwj - use sqs - 11.2012
	var strParams = "dids=" + pfu(strKBdocref) + "&ocids=" + pfu(strCallrefs);
	return app.g.submitsqs("knowledgebase/unrelate_calls_from_kb.delete",strParams);


}


oSwKb.prototype.relate_call_to_kb = function (strKBdocref,intCallRef,strRelCode)
{
	if(strRelCode==undefined)strRelCode = 'Used';
	//- -nwj - use sqs - 11.2012
	var strParams = "did=" + pfu(strKBdocref) + "&cr=" + pfu(intCallRef)+ "&rel=" + pfu(strRelCode);
	return app.g.submitsqs("knowledgebase/relate_call_to_kb.insert",strParams);

}


oSwKb.prototype.get_kb_calls = function (kb_docref, strCode)
{
	var strCalls = "";

	var ap = {};
	ap.fk_kbdoc = kb_docref;
	ap.relcode = strCode;
	var oRS = app.g.get_tablerecordset_bycol("cmn_rel_opencall_kb",ap,false,"fk_callref"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"fk_callref");
		if (strCalls!="")strCalls +=",";
		strCalls += currKey;
	}
	if(strCalls=="")strCalls="-1";
	return strCalls;
}


oSwKb.prototype.get_call_kbs = function (intCallref)
{
	var strDocRefs = "";

	var ap = {};
	ap.fk_callref = intCallref;
	var oRS = app.g.get_tablerecordset_bycol("cmn_rel_opencall_kb",ap,false,"fk_kbdoc"); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"fk_kbdoc");
		if (strDocRefs!="")strDocRefs +=",";
		strDocRefs += currKey;
	}
	if(strDocRefs=="")strDocRefs="-1";
	return strDocRefs;
}


//-- application object
function oConfigMethods()
{
	this.array_openrfcdocs = [];
}
var cfg = new oConfigMethods();

oConfigMethods.prototype.somefunction = cfg_somefunction;
function cfg_somefunction()
{
}


//-- 22.08.2008
//-- NWJ
//-- for a given form load address info
oConfigMethods.prototype.load_address = cfg_load_address;
function cfg_load_address(aForm,int_address_id,oCopyToRec)
{
	var addressRec = app.g.get_form_recorddata("address",int_address_id,aForm,true,"",false);
	if (addressRec)
	{
		if (oCopyToRec==undefined)oCopyToRec=null;
		if(oCopyToRec!=null)
		{
			if(oCopyToRec.fk_address_id != addressRec.pk_address_id) oCopyToRec.fk_address_id  = addressRec.pk_address_id;
			if(oCopyToRec.address_1		  != addressRec.address_1) oCopyToRec.address_1	= addressRec.address_1;
			if(oCopyToRec.address_2		  != addressRec.address_2) oCopyToRec.address_2	= addressRec.address_2;
			if(oCopyToRec.address_3		  != addressRec.address_3) oCopyToRec.address_3	= addressRec.address_3;
			if(oCopyToRec.town			  != addressRec.town )  oCopyToRec.town	= addressRec.town;
			if(oCopyToRec.county		  != addressRec.county) oCopyToRec.county = addressRec.county;
			if(oCopyToRec.postcode		  != addressRec.postcode) oCopyToRec.postcode = addressRec.postcode;
			if(oCopyToRec.country		  != addressRec.country)oCopyToRec.country	= addressRec.country;
		}
	}
	else
	{
		if (oCopyToRec==undefined)oCopyToRec=null;
		if(oCopyToRec!=null)
		{
			//-- if not blank - set it to blank
			if(oCopyToRec.fk_address_id != "") oCopyToRec.fk_address_id = "0";
			if(oCopyToRec.address_1 != "") oCopyToRec.address_1 = "";
			if(oCopyToRec.address_2 != "") oCopyToRec.address_2 = "";
			if(oCopyToRec.address_3 != "") oCopyToRec.address_3 = "";
			if(oCopyToRec.town != "") oCopyToRec.town = "";
			if(oCopyToRec.county != "")	oCopyToRec.county = "";
			if(oCopyToRec.postcode != "")	oCopyToRec.postcode = "";
			if(oCopyToRec.country != "") oCopyToRec.country = "";	
		}
	}
}

//-- clear address
oConfigMethods.prototype.clear_address = cfg_clear_address;
function cfg_clear_address(oCopyToRec)
{
	if (oCopyToRec==undefined)oCopyToRec=null;
	if(oCopyToRec!=null)
	{
		//-- if not blank - set it to blank
		if(oCopyToRec.fk_address_id != "") oCopyToRec.fk_address_id = "0";
		if(oCopyToRec.address_1 != "") oCopyToRec.address_1 = "";
		if(oCopyToRec.address_2 != "") oCopyToRec.address_2 = "";
		if(oCopyToRec.address_3 != "") oCopyToRec.address_3 = "";
		if(oCopyToRec.town != "") oCopyToRec.town = "";
		if(oCopyToRec.county != "")	oCopyToRec.county = "";
		if(oCopyToRec.postcode != "")	oCopyToRec.postcode = "";
		if(oCopyToRec.country != "") oCopyToRec.country = "";	
	}
}




//-- check contract use against a call - logging
oConfigMethods.prototype.process_call_contract_check=cfg_process_call_contract_check
function cfg_process_call_contract_check(strCIIDs, boolLogging,oDoc)
{
	//-- only run if support ext companies
	if(dd.GetGlobalParamAsString("Application Settings/SupportExternalCompanies")!==1) return "";

	//-- get list of contracts for associated CIs
	var strInvalidItems = "";
	var array_slacontracts = [];

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	var strSLAS = oDoc.opencall.priority;
	var strBadCIS = "";

	//-- F0075922 get list of contracts for the organisation
	var strContractIDs = "";

	var ap = {};
	ap.fk_parent_itemtext = oDoc.userdb.fk_company_id;
	ap.fk_parent_type = 'ME->COMPANY';
	ap.fk_child_type = 'ME->SLA';
	var oRS = app.g.get_tablerecordset_bycol("CONFIG_RELI",ap); 

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strContractIDs!="")strContractIDs +=",";
		strContractIDs +=  app.g.get_field(oRS,"FK_CHILD_ID");
	}

	if(strContractIDs=="")strContractIDs="-1";

	var d = new Date();

	var oParams = {};
	oParams.pids = strContractIDs;
	oParams.cids = strCIIDs
	var oRS = app.g.get_sqrecordset("general/process_call_contract_check.select",oParams);
	//-- F0075922 
	var array_badcis = [];
	while(oRS.Fetch())
	{
	
		var strItemText = app.g.get_field(oRS,"FK_CHILD_ITEMTEXT");

		var strExpires = app.g.get_field(oRS,"EXPIRESONX");
		if(strExpires=="")strExpires = 0;
		var strCurrentEpoch = Math.floor(d.getTime()/1000);
		var strValid = "1";
		if(strExpires < strCurrentEpoch && strExpires > 0)
		{
			strValid = "0";
		}
		
		var strAlwaysOn = app.g.get_field(oRS,"FLG_ALWAYSSUPPORT");
		var boolSupport = (strValid=="1");
		
		//-- store sla & contract
		var currSLA = app.g.get_field(oRS,"FK_SSLA");
		array_slacontracts[currSLA] = app.g.get_field(oRS,"PK_SLAD_ID");

		//-- if not support record so we can alert
		if(!boolSupport)
		{
			//-- F0075922 
			array_badcis[app.g.get_field(oRS,"FK_CHILD_ID")] = strItemText + " in SLA '" + app.g.get_field(oRS,"SLAD_ID") + "' managed by "+app.g.get_field(oRS,"FK_AID");

		}
		else
		{
			if(array_badcis[app.g.get_field(oRS,"FK_CHILD_ID")]!=undefined)
			{

				delete(array_badcis[app.g.get_field(oRS,"FK_CHILD_ID")]);
			}
			//-- keep list of SLAS so we can find best one
			//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
			if(strSLAS!="")strSLAS +=",";
			strSLAS += currSLA;
		}
	}	

	//-- F0075922 create alert statement, and list of CI's to not associate
	for(var x in array_badcis)
	{
		if(strInvalidItems)
		{
			strInvalidItems+="\n";
			strBadCIS+=",";
		}

		strInvalidItems += array_badcis[x];
		strBadCIS += x;
	}
	
	//-- alert user to which items do not have valid support
	if(strInvalidItems!="")
	{
		MessageBox("The following items do not have valid support agreements please process as required :\n\n" + strInvalidItems)
	}

	//-- get the shortest sla i.e. least overall time
	var strBestSLA = app.g.get_shortest_sla(strSLAS);
	if((strBestSLA!=oDoc.opencall.priority)&&(strBestSLA!=""))
	{
		if(confirm("This request currently has a longer overall response and fix time than the best contracted Priority. Would you like to change the Priority?"))
		{
			if(boolLogging)
			{
				oDoc.opencall.priority = strBestSLA;
				oDoc.opencall.fk_contract_id = array_slacontracts[strBestSLA];
				oDoc.UpdateFormFromData();
			}
			else
			{
				if(app.g.new_dairyevent(oDoc.opencall.callref,"The Priority on this request was changed from (" + oDoc.opencall.priority + ") to (" + strBestSLA + ") due to configuration item SLA associatation","CI Change","Priority Update (SLA)",strBestSLA))
				{
					oDoc.opencall.fk_contract_id = array_slacontracts[strBestSLA];
					oDoc.Save(0);

				}
			}
		}
	}

	//-- send back failed CIS
	return strBadCIS;
}


//-- NWJ - 01.05.2008 - functions that help manage the refreshing of rfc task list within client
//--					as previously would update task but there parent form was not refreshed.

//-- add call and its _swdoc to array
oConfigMethods.prototype.allocaterfcdoc = cfg_allocaterfcdoc;
function cfg_allocaterfcdoc(nCallref,oDocument)
{
	this.array_openrfcdocs[nCallref] = oDocument;
}

//-- set call in to array to false so will not open (cannot remove as not indexed)
oConfigMethods.prototype.deallocaterfcdoc = cfg_deallocaterfcdoc;
function cfg_deallocaterfcdoc(nCallref)
{
	this.array_openrfcdocs[nCallref] = false;
}


//-- get list of company owned and or used cis
oConfigMethods.prototype.get_company_cikeys = cfg_get_company_cikeys;
function cfg_get_company_cikeys(strCompanyID,boolGetChildren,boolIncludeOwnedCIs)
{
	var oRec = app.g.get_record("COMPANY", strCompanyID);
	if(!oRec)return "";

	var strGetCol = (boolGetChildren)?"FK_CHILD_ID":"FK_PARENT_ID";
	var strTypeCol = (boolGetChildren)?"FK_PARENT_TYPE":"FK_CHILD_TYPE";
	var strIDCol = (boolGetChildren)?"FK_PARENT_ID":"FK_CHILD_ID";

	var strKeyValues = "";
	
	//-- TK Fix to only return CI's not Services.
	
	var strParams = {}; 
	strParams.strGetCol = strGetCol;
	strParams.strTypeCol = strTypeCol;
	strParams.strIDCol = strIDCol;
	strParams.pk = oRec.fk_cmdb_id;
	
	var strKeyValues = "";
	var oRS = app.g.get_sqrecordset("cmdb/get_ci_site.select",strParams );

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";	
		strKeyValues += app.g.get_field(oRS,strGetCol);
	}	
	
	//-- get me cis that are related to
	if(boolIncludeOwnedCIs)
	{
		var ap = {};
		ap.fk_company_id = strCompanyID;
		var oRS = app.g.get_tablerecordset_bycol("CONFIG_ITEMI",ap,false,"PK_AUTO_ID");

		while(oRS.Fetch())
		{
			if(strKeyValues!="")strKeyValues+=",";
			strKeyValues += app.g.get_field(oRS,"PK_AUTO_ID");
		}	
	}

	if((strKeyValues==""))strKeyValues="0";
	return strKeyValues;
}

//-- get list of company owned and or used cis
oConfigMethods.prototype.get_supplier_cikeys = cfg_get_supplier_cikeys;
function cfg_get_supplier_cikeys(strCompanyID,boolGetChildren,boolIncludeOwnedCIs)
{
	var oRec = app.g.get_record("SUPPLIER", strCompanyID);
	if(!oRec)return "";

	var strKeyValues = "";


	//-- get me cis that are related to
	if(boolIncludeOwnedCIs)
	{
		var ap = {};
		ap.fk_supplier = strCompanyID;
		var oRS = app.g.get_tablerecordset_bycol("CONFIG_ITEMI",ap,false,"PK_AUTO_ID");
		while(oRS.Fetch())
		{
			if(strKeyValues!="")strKeyValues+=",";
			strKeyValues += app.g.get_field(oRS,"PK_AUTO_ID");
		}	
	}

	if((strKeyValues==""))strKeyValues="0";
	return strKeyValues;
}

//-- get list of contract supported cis
oConfigMethods.prototype.get_contract_cikeys = cfg_get_contract_cikeys;
function cfg_get_contract_cikeys(strContract,boolGetChildren)
{
	return app.g.get_contract_cikeys(strContract,boolGetChildren);

}

//-- get list of contract supported cis
oConfigMethods.prototype.get_ci_contractkeys = cfg_get_ci_contractkeys;
function cfg_get_ci_contractkeys(inCMDBID, boolPFS)
{
	var strKeyValues = "";
	var oRS = app.g.get_sqrecordset("general/get_ci_contractkeys.select","cids=" +inCMDBID );

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";	
		var strVal = app.g.get_field(oRS,"FK_PARENT_ITEMTEXT");
		strKeyValues += strVal;
	}	

	//F0091573
	if((strKeyValues==""))strKeyValues="-1";
	return strKeyValues;
}

//-- get list of company keysearchs - used to filter contact list
oConfigMethods.prototype.get_company_relatedkeys = cfg_get_company_relatedkeys;
function cfg_get_company_relatedkeys(strCompanyID,strChildType, strChildTable, boolIncludeMECIs,boolEncaps,boolPFS)
{
	var strE = (boolEncaps)?"'":"";
	var strKeyValues = "";
	var oRec = app.g.get_record("COMPANY", strCompanyID);
	if(!oRec)return "";

	var strChildPrimaryKeyCol = UC(app.g.dd_primarykey(strChildTable)); 

	//-- get direct link - assumes child table has column called fk_company_id
	var ap = {};
	ap.fk_company_id = strCompanyID;
	var oRS = app.g.get_tablerecordset_bycol(strChildTable,ap,false,strChildPrimaryKeyCol);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";

		var strValue = app.g.get_field(oRS,strChildPrimaryKeyCol);
		strKeyValues += strValue;
	}	

	//-- get me cis that are related to
	if(boolIncludeMECIs)
	{
		var ap = {};
		ap.FK_PARENT_ID = oRec.fk_cmdb_id;
		ap.FK_CHILD_TYPE = 'ME->' + strChildType;
		var oRS = app.g.get_distincttablerecordset_bycol("CONFIG_RELI",ap,false,"FK_CHILD_ITEMTEXT");

		while(oRS.Fetch())
		{
			if(strKeyValues!="")strKeyValues+=",";

			var strValue = app.g.get_field(oRS,"FK_CHILD_ITEMTEXT");
			strKeyValues += strValue;
		}	
	}

	if(strKeyValues=="")strKeyValues="-1";
	return strKeyValues;
}


//-- get comma delimited lsit of sites
oConfigMethods.prototype.get_customer_sites = cfg_get_customer_sites;
function cfg_get_customer_sites(strCustID, boolPFS, strE, intCMDBID)
{
	if((intCMDBID==undefined)||(intCMDBID<1))
	{
		var oRec = app.g.get_record("USERDB", strCustID);
		if(!oRec)return "";
		intCMDBID = oRec.fk_cmdb_id;
	}

	var	strKeyValues = "";

	var ap = {};
	ap.FK_PARENT_TYPE = 'ME->SITE';
	ap.FK_CHILD_ID = intCMDBID;
	var oRS = app.g.get_distincttablerecordset_bycol("CONFIG_RELI",ap,false,"FK_PARENT_ITEMTEXT");

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";

		var strValue = app.g.get_field(oRS,"FK_PARENT_ITEMTEXT");
		strKeyValues += strValue;
	}	
	if(strKeyValues=="")strKeyValues="-1";
	return strKeyValues;
}

//-- get comma delimited lsit of site customers
oConfigMethods.prototype.get_site_customers = cfg_get_site_customers;
function cfg_get_site_customers(strSiteID, boolPFS, strE, intCMDBID)
{
	if((intCMDBID==undefined)||(intCMDBID<1))
	{
		var oRec = app.g.get_record("SITE", strSiteID);
		if(!oRec)return "";
		intCMDBID = oRec.fk_cmdb_id;
	}

	var	strKeyValues = "";
	var oRS = app.g.get_sqrecordset("general/get_ci_customers.select","cid="+intCMDBID);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";

		var strValue = app.g.get_field(oRS,"KEYSEARCH");
		strKeyValues += strValue;
	}	
	if(strKeyValues=="")strKeyValues="-1";
	return strKeyValues;
}
//-- get comma delimited lsit of dept customers
oConfigMethods.prototype.get_dept_customers = cfg_get_dept_customers;
function cfg_get_dept_customers(strDeptID, boolPFS, strE, intCMDBID)
{
	if((intCMDBID==undefined)||(intCMDBID<1))
	{
		var oRec = app.g.get_record("DEPARTMENT", strDeptID);
		if(!oRec)return "";
		intCMDBID = oRec.fk_cmdb_id;
	}

	var	strKeyValues = "";
	//-- use sqs
	var oRS = app.g.get_sqrecordset("general/get_ci_customers.select","cid="+intCMDBID);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";

		var strValue = app.g.get_field(oRS,"KEYSEARCH");
		strKeyValues += strValue;
	}	
	if(strKeyValues=="")strKeyValues="-1";
	return strKeyValues;
}
//--
//--
//-- D O  N O T  A L T E R  T H E  B E L O W
//--
//--

//-- create object to return xmlmc return values (need core prod fix for 7.3.1 to do this stuff
function XMCResult(strXML)
{
	var ob = {};
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


//--
//-- ITSM object - used to store ITSM template methods
//--

//-- Constants for ITSM permissions
//-- groups
var ADMIN_SETTINGS = 1;
var PG_INC=2;
var PG_PRB=3;
var PG_KE=3;
var PG_RFC=4;
var PG_REL=5;
//-- cmdb is 6
var PG_BPM=7; 
var PG_SC=8; 

//-- ADMIN Group Items
var SLM_VIEW=1;
var SLM_ADD=2;
var SLM_EDIT=3;
var SLM_DELETE=4;
var SLM_ARCHIVE=5;
var ADM_MANAGE=9;

//-- INC group items
var INC_CREATE=1;
var INC_EDIT=2;
var INC_CANCEL=3;
var INC_VIEW=5;
var INC_RESOLVE=12;
var INC_OLA_CREATE=6;
var INC_OLA_VIEW=7;
var INC_OLA_EDIT=8;
var INC_OLA_CANCEL=9;
var INC_OLA_RESOLVE=10;

//-- PRB group items
var PRB_CREATE=1;
var PRB_EDIT=2;
var KE_EDIT=3;
var KE_CREATE=4;
var PRB_CANCEL=5;
var KE_CANCEL=6;
var KE_RESOLVE=7;
var PRB_VIEW=8;
var KE_VIEW=9;
var PRB_RESOLVE=10;

//-- RFC group items
var RFC_CREATE=1;
var RFC_EDIT=2;
var RFC_CANCEL=3;
var RFC_RESOLVE=4;
var RFC_VIEW=5;
var RFC_BUS_AREA_ADD=6;
var RFC_BUS_AREA_REMOVE=7;
var RFC_CDF_ILA_ALTER=9;
var RFC_COORDINATOR=10; // F0105843 New Right
var RFC_MANAGER=11; // F0105843 New Right
var CPR_CREATE=12;
var CPR_EDIT=13;
var CPR_CANCEL=14;
var CPR_RESOLVE=15;
var CPR_VIEW=16;

//-- REL group items
var REL_CREATE=1;
var REL_EDIT=2;
var REL_CANCEL=3;
var REL_RESOLVE=4;
var REL_VIEW=5;
var REL_CDF_ILA_ALTER=6;

//-- BPM group items
var BPM_ADDTASK=1;
var BPM_ADDAUTH=2;
var BPM_CUSTAUTH=3;
var BPM_ANALYSTAUTH=4;
var BPM_SKIPTASK=5;
var BPM_SETSTATUS=6;
var BPM_CANMANAGE=7;

//-- Service Catalog group items
var SC_VIEW=1;
var SC_EDIT=2;
var SC_ADD=3;
var SC_DELETE=4;
var SC_COST_SUBSCRIPTION=5;
var SC_DEMAND=7;
var SC_BASELINES=8;
var SC_PIPELINE=9;
var SC_RETIRED=10;

//-- Service Request Group Items (part of service catalog)
var SC_CREATE=11;
var SC_VIEW_CALL=12;
var SC_EDIT_CALL=13;
var SC_RESOLVE=14;
var SC_CANCEL=15;

function oITSM()
{
	//--
}

var itsm = new oITSM();
app.global.itsm = itsm;

//-- check if need mandatory ci when logging call
oITSM.prototype.bpmstage_ci_check = itsm_bpmstage_ci_check;
function itsm_bpmstage_ci_check(sl_cis)
{
	//-- now check if have cis
	if(sl_cis.rowCount()>0)
	{
		return true;
	}
	else
	{
		return false;
	}
}


//--
//-- load itsm sla from matrix
oITSM.prototype.get_sla_frommatrix = itsm_get_sla_frommatrix;
function itsm_get_sla_frommatrix(strImpact, strUrgency)
{
	var strSLA = "";

	var ap = {};
	ap.fk_impact = strImpact;
	ap.fk_urgency = strUrgency
	var oRS = app.g.get_tablerecordset_bycol("itsm_slamatrix",ap,false,"fk_sla");
	if(oRS.Fetch())
	{
		strSLA = app.g.get_field(oRS,"fk_sla");
	}
	return strSLA;
}


//--
//-- load itsm sla from matrix
oITSM.prototype.get_sla_from_slad_matrix = itsm_get_sla_from_slad_matrix;
function itsm_get_sla_from_slad_matrix(intSLAD, strImpact, strUrgency, intSLA)
{
	var strSLA = "";
	if(intSLA==undefined)intSLA=1;

	var ap = {};
	ap.fk_slad = intSLAD;
	ap.fk_impact = strImpact;
	ap.fk_urgency = strUrgency
	ap.flg_sla = intSLA;
	var oRS = app.g.get_tablerecordset_bycol("itsmsp_slad_matrix",ap,false,"fk_priority");

	if(oRS.Fetch())
	{
		strSLA = app.g.get_field(oRS,"fk_priority");
	}
	return strSLA;
}


//--
//-- pop up itsm search for calls form
oITSM.prototype.search_calls = itsm_search_calls;
function itsm_search_calls(strType, strAppendURL, boolMulti, funcCallback)
{
	if(boolMulti==undefined)boolMulti=true;
	if(strAppendURL==undefined)strAppendURL="";
	if(strType==undefined) strType="";

	var strURL = "type=" + strType;
	var strMulti = (boolMulti)?"1":"0";
	strURL += "&multiselect=" + strMulti + "&" + strAppendURL;
	app.g.popup("search_calls",strURL,function(aForm)
	{
		//-- create object to return selected info
		var tmpObj = {};
		if (aForm)
		{
			if (IsObjectDefined("_bHtmlWebClient"))
			{
				var _swdoc = top;
				tmpObj.selectedkeys = aForm._swdoc.strSelectedKeys;
				tmpObj.selectedtext = aForm._swdoc.strSelectedText;
				tmpObj.selectedother = aForm._swdoc.strSelectedOther;
				tmpObj.selectedclasses = aForm._swdoc.strSelectedOther; //-- backward compatible
			}
			else
			{
				tmpObj.selectedkeys = aForm.document.strSelectedKeys;
				tmpObj.selectedtext = aForm.document.strSelectedText;
				tmpObj.selectedother = aForm.document.strSelectedOther;
				tmpObj.selectedclasses = aForm.document.strSelectedOther; //-- backward compatible
			}
			
		}
		else
		{
			tmpObj.selectedkeys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
	});	
}

oITSM.prototype.can_alter_ila = itsm_can_alter_ila;
function itsm_can_alter_ila()
{
	var boolGranted = false;
	boolGranted = app.session.HaveAppRight(PG_RFC, RFC_CDF_ILA_ALTER, app.session.dataDictionary);
	return boolGranted;
}

//ES - Add function to check if user can alter ILA after Release is logged
oITSM.prototype.release_can_alter_ila = itsm_release_can_alter_ila;
function itsm_release_can_alter_ila()
{
	var boolGranted = false;
	boolGranted = app.session.HaveAppRight(PG_REL, REL_CDF_ILA_ALTER , app.session.dataDictionary);
	return boolGranted;
}

// F0105843 Start
// Check if the Analyst has the Change Management Application Right "Is a Change Coordinator"
oITSM.prototype.is_rfc_coordinator = itsm_is_rfc_coordinator;
function itsm_is_rfc_coordinator()
{
	var boolGranted = false;
	boolGranted = app.session.HaveAppRight(PG_RFC, RFC_COORDINATOR, app.session.dataDictionary);
	return boolGranted;
}

// F0105843 (part of)
// Check if the Analyst has the Change Management Application Right "Is a Change Manager"
oITSM.prototype.is_rfc_manager = itsm_is_rfc_manager;
function itsm_is_rfc_manager()
{
	var boolGranted = false;
	boolGranted = app.session.HaveAppRight(PG_RFC, RFC_MANAGER, app.session.dataDictionary);
	return boolGranted;
}

// F0105843 (part of)
// Does the Analyst have the required edit level rights for the current BPM Stage (Change Requests only)
oITSM.prototype.has_rfc_reqd_edit_level = itsm_rfc_has_reqd_edit_level;
function itsm_rfc_has_reqd_edit_level(intBpmStageEditLevel, strRequestByAnalystId, strActionType, boolMSG)
{
	if(boolMSG == undefined) boolMSG = false;
	
	// Four edit levels	
	var intCanEdit = 0;
	var intRequestedByAnalyst = 1;
	var intCoordinator = 2;
	var intManager = 3;
	
	var boolGranted = false;
	
	// Get Edit Level of Analyst
	var intAnalystEditLevel = -1;
	if (app.itsm.can_edit("Change Request", false))
	{
		intAnalystEditLevel = intCanEdit;
		// if the analyst hasn't got the Can Edit right, then nothing else should be possible
		if (app.session.analystId == strRequestByAnalystId)
			intAnalystEditLevel = intRequestedByAnalyst;
		if (itsm_is_rfc_coordinator())
			intAnalystEditLevel = intCoordinator;
		if (itsm_is_rfc_manager())
			intAnalystEditLevel = intManager;
	}
	
	if (intAnalystEditLevel >= intBpmStageEditLevel)
	{
		boolGranted = true;
	}

	// Generate to the Analyst
	if((!boolGranted) && (boolMSG))
	{	
		MessageBox("You are not authorised to perform this action.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	return boolGranted;
}
// F0105843 End

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
		case "known error":
			boolEdit = app.session.HaveAppRight(PG_PRB, KE_EDIT,app.session.dataDictionary);
			break;
		case "change request":
			boolEdit = app.session.HaveAppRight(PG_RFC, RFC_EDIT,app.session.dataDictionary);
			break;
		case "release request":
			boolEdit = app.session.HaveAppRight(PG_REL, REL_EDIT,app.session.dataDictionary);
			break;
		case "service request":
			boolEdit = app.session.HaveAppRight(PG_SC, SC_EDIT_CALL,app.session.dataDictionary);
			break;
		case "ola task":
			boolEdit = app.session.HaveAppRight(PG_INC, INC_OLA_EDIT,app.session.dataDictionary);
			break;
		case "change proposal":
			boolEdit = app.session.HaveAppRight(PG_RFC, CPR_EDIT,app.session.dataDictionary);
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
		case "known error":
			boolCreate = app.session.HaveAppRight(PG_PRB, KE_CREATE,app.session.dataDictionary);
			break;
		case "change request":
			boolCreate = app.session.HaveAppRight(PG_RFC, RFC_CREATE,app.session.dataDictionary);
			break;
		case "release request":
			boolCreate = app.session.HaveAppRight(PG_REL, REL_CREATE,app.session.dataDictionary);
			break;
		case "service request":
			boolCreate = app.session.HaveAppRight(PG_SC, SC_CREATE,app.session.dataDictionary);
			break;
		case "ola task":
			boolCreate = app.session.HaveAppRight(PG_INC, INC_OLA_CREATE,app.session.dataDictionary);
			break;
		case "change proposal":
			boolCreate = app.session.HaveAppRight(PG_RFC, CPR_CREATE,app.session.dataDictionary);
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
		case "known error":
			boolCancel = app.session.HaveAppRight(PG_PRB, KE_CANCEL,app.session.dataDictionary);
			break;
		case "change request":
			boolCancel = app.session.HaveAppRight(PG_RFC, RFC_CANCEL,app.session.dataDictionary);
			break;
		case "release request":
			boolCancel = app.session.HaveAppRight(PG_REL, REL_CANCEL,app.session.dataDictionary);
			break;
		case "service request":
			boolCancel = app.session.HaveAppRight(PG_SC, SC_CANCEL,app.session.dataDictionary);
			break;
		case "ola task":
			boolCancel = app.session.HaveAppRight(PG_INC, INC_OLA_CANCEL,app.session.dataDictionary);
			break;
		case "change proposal":
			boolCancel = app.session.HaveAppRight(PG_RFC, CPR_CANCEL,app.session.dataDictionary);
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
		case "known error":
			boolResolve = app.session.HaveAppRight(PG_PRB, KE_RESOLVE,app.session.dataDictionary);
			break;
		case "change request":
			boolResolve = app.session.HaveAppRight(PG_RFC, RFC_RESOLVE,app.session.dataDictionary);
			break;
		case "release request":
			boolResolve = app.session.HaveAppRight(PG_REL, REL_RESOLVE,app.session.dataDictionary);
			break;
		case "service request":
			boolResolve = app.session.HaveAppRight(PG_SC, SC_RESOLVE,app.session.dataDictionary);
			break;
		case "ola task":
			boolResolve = app.session.HaveAppRight(PG_INC, INC_OLA_RESOLVE,app.session.dataDictionary);
			break;
		case "change proposal":
			boolResolve = app.session.HaveAppRight(PG_RFC, CPR_RESOLVE,app.session.dataDictionary);
			break;
	}

	if((!boolResolve)&&(boolMSG))
	{
		MessageBox("You are not authorised to resolve " + strCallClass + " records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}

	return boolResolve;
}

//--
//-- can analyst resolve a call of a class (based on permissions loaded at start up)
oITSM.prototype.can_view = itsm_can_view;
function itsm_can_view(strCallClass,boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolView = true;
	var strClass = "";
	switch(strCallClass.toLowerCase())
	{
		case "incident":
			boolView = app.session.HaveAppRight(PG_INC, INC_VIEW,app.session.dataDictionary);
			break;
		case "problem":
			boolView = app.session.HaveAppRight(PG_PRB, PRB_VIEW,app.session.dataDictionary);
			break;
		case "known error":
			boolView = app.session.HaveAppRight(PG_PRB, KE_VIEW,app.session.dataDictionary);
			break;
		case "change request":
			boolView = app.session.HaveAppRight(PG_RFC, RFC_VIEW,app.session.dataDictionary);
			break;
		case "release request":
			boolView = app.session.HaveAppRight(PG_REL, REL_VIEW,app.session.dataDictionary);
			break;
		case "service request":
			boolView = app.session.HaveAppRight(PG_SC, SC_VIEW_CALL,app.session.dataDictionary);
			break;
		case "ola task":
			boolView = app.session.HaveAppRight(PG_INC, INC_OLA_VIEW,app.session.dataDictionary);
			break;
		case "change proposal":
			boolView = app.session.HaveAppRight(PG_RFC, CPR_VIEW,app.session.dataDictionary);
			break;
	}

	if((!boolView)&&(boolMSG))
	{
		MessageBox("You are not authorised to view " + strCallClass + " records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}

	return boolView;
}

//--
//-- get customers impacted by problem
oITSM.prototype.get_problem_impact_customerids = itsm_get_problem_impact_customerids;
function itsm_get_problem_impact_customerids(intCallrefs,boolPFS)
{
	//-- get impacted cis linked to problem
	//-- then get customers that use the impacted cis
	var strLinkedImpactCIs = app.cmdb.get_call_cis(intCallrefs , "PROBLEM-AFFECT", "");
	var strCiImpactedCustomerIDS = app.cmdb.get_ci_customer_ids(strLinkedImpactCIs,boolPFS)
	if(strCiImpactedCustomerIDS=="")strCiImpactedCustomerIDS="-1";

	//-- get incs linked to problem
	//-- then get customers linked to incidents and this problem
	var intIncidentCallrefs = app.g.get_slave_calls(intCallrefs,"PROBLEM-INCIDENT",false);
	if(intIncidentCallrefs!="")intIncidentCallrefs+=",";
	intIncidentCallrefs+=intCallrefs;
	var strImpactedCustomerIDS = app.g.get_customers_on_calls(intIncidentCallrefs);
	if(strImpactedCustomerIDS=="")strImpactedCustomerIDS="-1";

	return strImpactedCustomerIDS + "," + strCiImpactedCustomerIDS;
}

//--
//-- get orgs impacted by problem
oITSM.prototype.get_problem_impact_orgids = itsm_get_problem_impact_orgids;
function itsm_get_problem_impact_orgids(intCallrefs,boolPFS)
{
	//-- get impacted cis linked to problem
	//-- then get orgs that use the impacted cis
	if(intCallrefs==0)return 0;
	
	var strLinkedImpactCIs = app.cmdb.get_call_cis(intCallrefs , "PROBLEM-AFFECT", "");
	var strCiImpactedCustomerIDS = app.cmdb.get_ci_company_ids(strLinkedImpactCIs,boolPFS)
	if(strCiImpactedCustomerIDS=="")strCiImpactedCustomerIDS="-1";

	//-- get incs linked to problem
	//-- then get customers linked to incidents
	var intIncidentCallrefs = app.g.get_slave_calls(intCallrefs,"PROBLEM-INCIDENT",false);
	if(intIncidentCallrefs!="")intIncidentCallrefs+=",";
	intIncidentCallrefs+=intCallrefs;
	var strIncImpactedCustomerIDS = app.g.get_companies_on_calls(intIncidentCallrefs);
	if(strIncImpactedCustomerIDS=="")strIncImpactedCustomerIDS="-1";

	return strIncImpactedCustomerIDS + "," + strCiImpactedCustomerIDS;
}


//--
//-- get customers impacted by rfc
oITSM.prototype.get_rfc_impact_customerids = itsm_get_rfc_impact_customerids;
function itsm_get_rfc_impact_customerids(intCallrefs,boolPFS)
{
	//-- get impacted cis linked to rfc
	//-- then get customers that use the impacted cis
	var strLinkedImpactCIs = app.cmdb.get_call_cis(intCallrefs , "RFC-AFFECT", "");
	var strCiImpactedCustomerIDS = app.cmdb.get_ci_customer_ids(strLinkedImpactCIs,boolPFS)
	if(strCiImpactedCustomerIDS=="")strCiImpactedCustomerIDS="-1";

	//-- get incs linked to rfc
	//-- then get customers linked to incidents and this problem
	var intIncidentCallrefs = app.g.get_slave_calls(intCallrefs,"RFC-INCIDENT",false);
	if(intIncidentCallrefs!="")intIncidentCallrefs+=",";
	intIncidentCallrefs+=intCallrefs;
	var strImpactedCustomerIDS = app.g.get_customers_on_calls(intIncidentCallrefs);
	if(strImpactedCustomerIDS=="")strImpactedCustomerIDS="-1";

	//-- get problems linked to rfc and then problems impacted customers
	var strPrbCustomerIds = '';
	var intProblemCallrefs = app.g.get_slave_calls(intCallrefs,"RFC-ERROR",false);
	if(intProblemCallrefs!="")	
	{
		strPrbCustomerIds = this.get_problem_impact_customerids(intProblemCallrefs,boolPFS);
	}

	return strImpactedCustomerIDS + "," + strCiImpactedCustomerIDS + "," + strPrbCustomerIds;
}

//--
//-- get orgs impacted by problem
oITSM.prototype.get_rfc_impact_orgids = itsm_get_rfc_impact_orgids;
function itsm_get_rfc_impact_orgids(intCallrefs,boolPFS)
{
	//-- get impacted cis linked to rfc
	//-- then get orgs that use the impacted cis
	var strLinkedImpactCIs = app.cmdb.get_call_cis(intCallrefs , "RFC-AFFECT", "");
	var strCiImpactedCustomerIDS = app.cmdb.get_ci_company_ids(strLinkedImpactCIs,boolPFS)
	if(strCiImpactedCustomerIDS=="")strCiImpactedCustomerIDS="-1";

	//-- get incs linked to rfc
	//-- then get customers linked to incidents
	var intIncidentCallrefs = app.g.get_slave_calls(intCallrefs,"RFC-INCIDENT",false);
	if(intIncidentCallrefs!="")intIncidentCallrefs+=",";
	intIncidentCallrefs+=intCallrefs;
	var strIncImpactedCustomerIDS = app.g.get_companies_on_calls(intIncidentCallrefs);
	if(strIncImpactedCustomerIDS=="")strIncImpactedCustomerIDS="-1";

	//-- get problems linked to rfc and then problems impacted orgs
	var strPrbOrgIds = '';
	var intProblemCallrefs = app.g.get_slave_calls(intCallrefs,"RFC-ERROR",false);
	if(intProblemCallrefs!="")	
	{
		strPrbOrgIds = this.get_problem_impact_orgids(intProblemCallrefs,boolPFS);
	}

	return strIncImpactedCustomerIDS + "," + strCiImpactedCustomerIDS + "," + strPrbOrgIds;
}



//--
//-- CMDB Object
//--

//-- stageing default values
var ARRAY_CMDBSTAGING_DEFAULTVALUES = [];
ARRAY_CMDBSTAGING_DEFAULTVALUES.fk_status_level = 'Operational';
ARRAY_CMDBSTAGING_DEFAULTVALUES.cmdb_status = 'Active'
ARRAY_CMDBSTAGING_DEFAULTVALUES.isauthorised = 'Yes';
ARRAY_CMDBSTAGING_DEFAULTVALUES.flg_inherit_reqtypes = '1';
ARRAY_CMDBSTAGING_DEFAULTVALUES.swtoday_title = 'Is runninng without problems';
ARRAY_CMDBSTAGING_DEFAULTVALUES.swtoday_titleimpact = 'Is currently experiencing problems';
ARRAY_CMDBSTAGING_DEFAULTVALUES.swtoday_titlefail = 'Is unavailable due to some unforseen problem';
ARRAY_CMDBSTAGING_DEFAULTVALUES.selfserv_title = 'Is runninng without problems';
ARRAY_CMDBSTAGING_DEFAULTVALUES.selfserv_titleimpact = 'Is currently experiencing problems';
ARRAY_CMDBSTAGING_DEFAULTVALUES.selfserv_titlefail = 'Is unavailable due to some unforseen problem';



//-- analyst CMDB permissions
var PG_CMDB=6;

//-- CMDB group items
var CMDB_VIEW=1;
var CMDB_CREATE=2;
var CMDB_EDIT=3;
var CMDB_DELETE=4;
var CMDB_BLINE=5;
var CMDB_MNGTYPES=6;
var CMDB_MNGSTAGE=7;
var CMDB_SPECIALIST = 8;

function oCMDB()
{
	this.arr_control_atts = [];
	//cmdb array
	this.arr_control_atts[0] = [];
	//sc array
	this.arr_control_atts[1] = [];
}
var cmdb = new oCMDB();
app.global.cmdb = cmdb;

//-- NWJ - 25.11.2012 - CIFORM CLASS
//-- PUT COMMON CI FORM JS HERE SO IF EVER NEED TO CHANGE YOU ONLY NEED TO CHANGE THIS JS INSTEAD OF EVERY CI FORM.
function newCiForm(formDoc)
{
	return  new oCiForm(formDoc);
}

function oCiForm(formDoc)
{
	this.doc = formDoc;
}

//-- ci form pointers
oCiForm.prototype.MF=function()
{
	return this.doc.mainform;
}
oCiForm.prototype.oCI=function()
{
	return this.doc.config_itemi;
}
oCiForm.prototype.oAvail=function()
{
	return this.doc.config_itemi;
}

oCiForm.prototype.oCIType = function()
{
	return this.doc.config_typei;
}
//-- eof pointers

//-- DOCUMENT LEVEL EVENTS
oCiForm.prototype.OnSaveData = function()
{
	//-- check for any regex matching that has been setup for ci values
	if(app.cmdb.process_form_ciattribute_regexcheck(this.doc)==false) return false;

	//-- when inserting check that ck_config_item and ck_config_type is unique
	if(this.doc.boolInsertingCI)
	{
		if (!app.cmdb.can_create(true))return false;
	
		if(app.cmdb.ci_exists(this.oCI().ck_config_item,this.oCI().ck_config_type))
		{
			//-- this ci id and type already exists warn user and cancel save
			MessageBox("The " + this.oCI().ck_config_type + " item " + this.oCI().ck_config_item + " already exists in the CMDB, a duplicate cannot be created");
			return false;
		}
	}
	else
	{
		//-- are they allowed to update
		if(!app.cmdb.can_update(true)) return false;
		
		//-- if not baselining and not current then warn user
		if(!this.doc.boolBaselining)
		{
			if((this.oCI().isactivebaseline!="Yes") && (app.cmdb.can_baseline(true)))
			{
				if(!confirm("This item is currently an inactive baseline, are you sure you want to save your changes?"))
				{
					return false;
				}
			}
			
		}
	}	
	
	this.oCI().companyname = this.MF().lb_company1.display;
	return true;
}

oCiForm.prototype.OnDataSaved = function()
{
	//-- inserting so setup form for update 
	var objCIFormDoc = this;
	if(objCIFormDoc.doc.boolInsertingCI)
	{
		//-- create cmdb relationship
		//-- if customer has a site then relate it as a ci (so can see in vcm company -> site -> customer)
		if(objCIFormDoc.oCI().fk_site != "")    		
		{
			var strRel = dd.GetGlobalParamAsString("Application Settings/CMDB/Types/DefaultSiteCIRelationship");
			var recSite = app.g.get_record("site", objCIFormDoc.oCI().fk_site)
			app.cmdb.generate_meconfigrelation(recSite.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id, strRel);  
		}
		if(objCIFormDoc.oCI().fk_company_id!="")
		{
            var strRel = dd.GetGlobalParamAsString("Application Settings/CMDB/Types/DefaultOrgCIRelationship");
            var recOrg = app.g.get_record("company", objCIFormDoc.oCI().fk_company_id)                               
			app.cmdb.generate_meconfigrelation(recOrg.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id,strRel);  
   		}
	
		if(objCIFormDoc.oCI().fk_sld>0)
		{
        	var strRel = "Uses";
        	var recSLA = app.g.get_record("itsmsp_slad", objCIFormDoc.oCI().fk_sld);    
			app.cmdb.generate_meconfigrelation(recSLA.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id,strRel); 
		}

		objCIFormDoc.oCI().baselineid = objCIFormDoc.oCI().pk_auto_id;
		objCIFormDoc.doc.boolSiteChanged = false;
		objCIFormDoc.setup_form_fields(false);
		
		var ap = {};
		ap.fk_config_type = objCIFormDoc.oCI().ck_config_type;
		var oRS = app.g.get_tablerecordset_bycol("ct_reltypes",ap);

		if(oRS.Fetch())
		{
			strDependancy = app.g.get_field(oRS,"fk_reltype");
			ynOperational = "No";
		}
		else
		{
			MessageBox("Could not create dependency because no relationship types exist");
			objCIFormDoc.doc.Save(0);
			return;
		}
		
		//Build CI-Child Reliationships
		var olist = objCIFormDoc.MF().sl_configitems2;
		//-- loop through selected CI and assign them to this call
		for (var x=0; x < olist.rowCount(); x++)
		{
			var fetchKey = olist.GetItemTextRaw(x,"pk_auto_id");
			var fetchType = olist.GetItemTextRaw(x,"ck_config_type");
			var fetchText = olist.GetItemTextRaw(x,"ck_config_item");
			var fetchDesc = olist.GetItemTextRaw(x,"description");
					
			var sqlResult = false;
			sqlResult = app.cmdb.insert_configrelation(objCIFormDoc.oCI().pk_auto_id, objCIFormDoc.oCI().ck_config_type, objCIFormDoc.oCI().ck_config_item, fetchKey, fetchType, fetchText, strDependancy, ynOperational, objCIFormDoc.oCI().description, fetchDesc);
		}

		//Build CI-Parent Reliationships
		var olist = objCIFormDoc.MF().sl_configitems1;
		//-- loop through selected CI and assign them to this call
		for (var x=0; x < olist.rowCount(); x++)
		{
			var fetchKey = olist.GetItemTextRaw(x,"pk_auto_id");
			var fetchType = olist.GetItemTextRaw(x,"ck_config_type");
			var fetchText = olist.GetItemTextRaw(x,"ck_config_item");
			var fetchDesc = olist.GetItemTextRaw(x,"description");
						
			var sqlResult = false;
			sqlResult = app.cmdb.insert_configrelation(fetchKey, fetchType, fetchText, objCIFormDoc.oCI().pk_auto_id, objCIFormDoc.oCI().ck_config_type, objCIFormDoc.oCI().ck_config_item, strDependancy, ynOperational, fetchDesc, objCIFormDoc.oCI().description);
		}
		
		objCIFormDoc.doc.Save(0);				
		
	}
	else
	{
		// -- If an SLA (config_itemi.fk_sld) is selected against the CI
		var strCurrentSLAID = objCIFormDoc.doc.strCurrentSLA;
		if(objCIFormDoc.oCI().fk_sld>0)
		{
			var strNewSLAID = objCIFormDoc.oCI().fk_sld;			
			// -- If config_itemi.fk_sld was blank prior to selecting an SLA
			if(strCurrentSLAID==0)
			{
				// -- Insert relationship into config_reli
				var recSLA = app.g.get_record("itsmsp_slad", strNewSLAID);
				app.cmdb.generate_meconfigrelation(recSLA.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id,"Uses");
			}
			else
			{
				// -- If old SLA does not equal to new SLA
				if(strCurrentSLAID!=strNewSLAID)
				{		
					// -- Delete config_reli relationship for the old SLA
					var strParams = "ciid="+objCIFormDoc.oCI().pk_auto_id+"&slaid="+strCurrentSLAID;
					app.g.submitsqs("cmdb/sla_ci_relationship.delete",strParams);
			
					// -- Add config_reli relationship for the new SLA
					var recSLA = app.g.get_record("itsmsp_slad", strNewSLAID);
					app.cmdb.generate_meconfigrelation(recSLA.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id,"Uses");
				}
			}
		}
		else
		{
			// -- If config_itemi.fk_sld is being set to blank, then remove the SLA was associated prior to this (if one existed)
			if(strCurrentSLAID>0)
			{
				// -- Delete config_reli relationship for the old SLA
				var strParams = "ciid="+objCIFormDoc.oCI().pk_auto_id+"&slaid="+strCurrentSLAID;
				app.g.submitsqs("cmdb/sla_ci_relationship.delete",strParams);
			}
		}
		
		if((objCIFormDoc.doc.boolSiteChanged)&&(objCIFormDoc.oCI().fk_site!=""))
		{
			//-- 14.07.2008 - create new site association
			var strRel = dd.GetGlobalParamAsString("Application Settings/CMDB/Types/DefaultSiteCIRelationship");
			var recSite = app.g.get_record("site", objCIFormDoc.oCI().fk_site)
			app.cmdb.generate_meconfigrelation(recSite.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id,strRel);  
			objCIFormDoc.doc.boolSiteChanged=false;
		}
		objCIFormDoc.doc.strCurrentSite = objCIFormDoc.oCI().fk_site;
		if(objCIFormDoc.doc.boolForceDiaryUpdate && objCIFormDoc.doc.boolInserted)
		{
			//-- add cmdb log entry by popping up an update form
			var strURL = "config_diary.updatetxt=" + objCIFormDoc.doc.strAutoDiaryText + "&config_diary.analystid=" + app.session.analystId + "&config_diary.fk_ci_id=" + objCIFormDoc.oCI().pk_auto_id;
			app.cmdb.create_diaryentry(objCIFormDoc.oCI().pk_auto_id, strURL,function()
			{
				objCIFormDoc.doc.boolInserted = true;
			});
		}
		else if(objCIFormDoc.doc.boolSilentDiaryUpdate && objCIFormDoc.doc.boolInserted)
		{
			//-- add diary entry
			app.cmdb.insert_diaryentry(objCIFormDoc.oCI().pk_auto_id, "Manual Update", "General Update", app.session.analystId , app.global.GetCurrentEpocTime(), objCIFormDoc.doc.strSilentDiaryText, 0);
			objCIFormDoc.doc.boolInserted = true;
		}
		else
		{
			objCIFormDoc.doc.boolInserted = true;
		}
	}
}

//-- DOCUMENT LEVEL FUNCTIONS
oCiForm.prototype.setup_form_fields=function(boolInserting)
{
	//-- if inserting setup as
	var boolNewDetailsForm = false;

	this.doc.strConfigItem = this.oCI().ck_config_item;
	this.doc.boolInsertingCI = boolInserting;
	this.doc.boolMakeUnavailable=false;

	//-- F0086202 - load form field mgt when opening form.
	app.cmdb.load_control_fields(this.oCI().ck_config_type);
	
	if(boolInserting)
	{
		this.doc.boolInserted = false;
		this.oCI().fk_profilecode = "";
		this.oCI().isactivebaseline="Yes";
		this.oCI().isunavailable = "No";
		this.oCI().isauthorised = "Yes";
		this.oCI().ck_config_type = unescape(this.doc.GetArg("fk_config_type"));
		
		_ete(this.MF().tb_type, unescape(this.doc.GetArg("fk_config_type")));
		
		_ete(this.MF().lb_profilecode, "");
		_een(this.MF().tb_identifier, true);
		_een(this.MF().tb_type, false);
		
		_evi(this.MF().tabAvail,false);
		_evi(this.MF().flg_swt_avail,false);
		_evi(this.MF().tb_swt_avail,false);
		_evi(this.MF().flg_swp_avail,false);
		_evi(this.MF().tb_swp_avail,false);
		_evi(this.MF().flg_swt_impact,false);
		_evi(this.MF().tb_swt_impact,false);
		_evi(this.MF().tb_swt_descimpact,false);
		_evi(this.MF().tb_swp_impact,false);
		_evi(this.MF().tb_swt_unavaildesc,false);
		_evi(this.MF().tb_swp_impactdesc,false);
		_evi(this.MF().tb_swp_unavaildesc,false);
		
		//-- load any fields as passed in from the calling function
		app.g.popuplate_form_fromargs("config_itemi", this.doc, true,true);

		//-- load type record when inserting so we can access type specific data
		this.doc.LoadRecordData("swdata","config_typei",this.oCI().ck_config_type);
		
		//-- Need to determine if using new details
		if(this.oCIType().detail_form)
		{
			boolNewDetailsForm = 1;
		}
		
		//-- set default profile code based on type
		this.oCI().fk_profilecode = this.oCIType().fk_profile_code;		

		//-- set company and/or site
		if((this.oCI().fk_company_id=="")&&(dd.GetGlobalParamAsString("Application Settings/SupportExternalCompanies")!=1))
		{
			this.oCI().fk_company_id = dd.GetGlobalParamAsString("Application Settings/DefaultCompanyID");
		}
		this.doc.UpdateFormFromData();	
	}
	else
	{
		//-- Enable SLA association stuff
		_een(this.MF().sl_defslas, true);
		_een(this.MF().btn_add_class, true);
		_een(this.MF().btn_rem_class, true);
		
		
		//-- load type record so we can access type specific data
		this.doc.LoadRecordData("swdata","config_typei",this.oCI().ck_config_type)

		//-- disable controlled fields if user is not manager or specialist
		app.cmdb.process_form_ciattribute_disablecheck(this.doc);

		//-- else if updating setup as
		this.doc.strOriginalUnavailability = this.oCI().isunavailable;

		_een(this.MF().tb_identifier, false);		
		_een(this.MF().tb_type, true);
		//-- TK If cmdb_details form
		if(this.oCIType().detail_form)
		{
			boolNewDetailsForm = 1;
			_evi(this.MF().btn_details, true);
		}
		//-- 2.4 if this is a clone allow rename, if not check if the analyst is allowed to clone
		if(this.oCI().ck_config_item.indexOf("CLONE__")>-1 || this.oCI().flg_canrename==1)
			_een(this.MF().tb_identifier, true);	
		else if(app.cmdb.is_specialist())
			_evi(this.MF().btn_clone, true);	


		//-- set up form for baseline needs
		this.check_baseline();		
	}
	this.load_ci_sr_types();

	//-- 12.07.2008 
	//-- disable or hide company field if internal support only
	_een(this.MF().lb_company1, ((dd.GetGlobalParamAsString("Application Settings/SupportExternalCompanies")==1)));
	if(!this.MF().lb_company1.enable)
	{
		//-- check if we should hide
		_evi(this.MF().lb_company1, (dd.GetGlobalParamAsString("Application Settings/HideCompanyField")!=1));
	}

	this.MF().tabComAdd.ShowTabItem(1,this.MF().lb_company1.enable); //-- show hide contracts tab item	 
	_evi(this.MF().lbl_company, this.MF().lb_company1.visible);	
	_evi(this.MF().popup_company1, this.MF().lb_company1.visible);
	//-- eof hide / enable	

	//-- store current site
	this.doc.strCurrentSite = this.oCI().fk_site;
	this.doc.strCurrentSupplier = this.oCI().fk_supplier;

	//-- set authorised flag
	_ete(this.MF().flg_authorised, (this.oCI().isauthorised == "No")?0:1);

	//-- set other flags
	//--Only need for old CMDB Details Form
	if(!boolNewDetailsForm)
	{
		// -- PM00127064 - Flags used in old CI forms, not present in cmdb_details form
		// -- Only set element if the object exists
		if(this.MF().flg_prb_cause)
		{
			_ete(this.MF().flg_prb_cause, "1");
		}
		if(this.MF().flg_kes_cause)
		{
			_ete(this.MF().flg_kes_cause, "1");
		}
		if(this.MF().flg_rfc_cause)
		{
			_ete(this.MF().flg_rfc_cause, "1");
		}
	}
	//--
	//-- show hide tab items depending on insert or update
	_een(this.MF().mbtn_view_ci, (!boolInserting));

	//-- common tab
	//Merope - FR6.1.3 remove service request definitions
	//MF().tabCom.ShowTabItem(1,!boolInserting);	
	this.MF().tabCom.ShowTabItem(2,!boolInserting);
	this.MF().tabCom.ShowTabItem(3,!boolInserting);		
	this.MF().tabCom.ShowTabItem(4,!boolInserting);	
	this.MF().tabCom.ShowTabItem(5,boolInserting);		
	this.MF().tabCom.ShowTabItem(6,boolInserting);		
	_etab(this.MF().tabCom, 0);
	this.MF().tabComAdd.ShowTabItem(1,!boolInserting);		
	this.MF().tabComAdd.ShowTabItem(2,!boolInserting);		
	this.MF().tabComAdd.ShowTabItem(3,!boolInserting);		
	_etab(this.MF().tabComAdd, 0);		

	//-- show event management only when not inserting
	this.MF().tabAvail.ShowTabItem(2,!boolInserting);	
	this.MF().tabAvail.ShowTabItem(3,!boolInserting);	
	_etab(this.MF().tabAvail, 0);

	//-- main ci tab
	var boolAvail = (this.oCIType().flg_canmonitor || this.oCI().flg_availmntr) && (!boolInserting);
	this.MF().tabCI.ShowTabItem(2,boolAvail); // - -show availability settings if type allows it, or individual record
	this.MF().tabCI.ShowTabItem(3,!boolInserting);
	this.MF().tabCI.ShowTabItem(4,!boolInserting);		
	this.MF().tabCI.ShowTabItem(5,!boolInserting);		
	this.MF().tabCI.ShowTabItem(6,!boolInserting && this.oCIType().flg_dml==1);		
	this.MF().tabCI.ShowTabItem(7,false);		
	this.MF().tabCI.ShowTabItem(8,!boolInserting);		
	this.MF().tabCI.ShowTabItem(9,!boolInserting);	
	_etab(this.MF().tabCI, 0);

	if(this.oCIType().flg_canmonitor==1)
	{
		this.oCI().flg_availmntr = "1";
		_een(this.MF().fld_avail_mntr1, false);
	}

	//-- set the form title depending on mode and status of ci
	this.set_form_title();

	this.doc.UpdateFormFromData();

	//-- disable form
	app.cmdb.disable_for_blackout(this.MF(),this.doc);

}

//RJC 29.01.09 Load CI Service Request Types
oCiForm.prototype.load_ci_sr_types=function()
{

	//RJC no filter setup, returning all records
	var strFilter = "swc=pk_code&kvs=-1";
	if(this.oCI().flg_inherit_reqtypes=="1")
	{
		var strFilter = "swc=pk_code&kvs=" + app.g.get_ci_service_request_type(this.oCI().ck_config_type,false,",");
	}
	_slf(this.MF().sl_parentprofiles, strFilter);

}

oCiForm.prototype.set_form_title=function()
{
	var strTitle = "";
	if(this.doc.boolDisableMode)
	{
		strTitle = "Baselined Configuration Item (" + this.oCI().ck_config_item + ") Baseline Index " + this.oCI().ck_baselineindex ;
	}
	else if (this.doc.boolInsertingCI)
	{
		strTitle = "Create New Configuration Item"; 
	}
	else
	{
		strTitle = "Update Configuration Item (" + this.oCI().ck_config_item + ") Baseline Index " + this.oCI().ck_baselineindex ;
	}
	if(strTitle!="")this.doc.SetTitle(strTitle)
}


oCiForm.prototype.check_baseline=function()
{
	if(this.oCI().isactivebaseline!="Yes")
	{
		//-- disable buttons and 
		this.doc.boolDisableMode = true;
	}	
	
	this.check_blackout_mode();
}


oCiForm.prototype.check_blackout_mode=function()
{
	if(this.oCI().flg_validsupport=="1")this.doc.boolDisableMode = true;
}

//- -when the user changes the type of a CI we need to open the appropriate CI form
oCiForm.prototype.change_config_type=function(funcCallback)
{
	var objCIFormDoc = this;
	var strOrigType = objCIFormDoc.oCI().ck_config_type;
	app.cmdb.select_configtype("",true,function(strNewType)
	{
		if(strNewType=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback();
			}
		}
		else
		{
			if(strOrigType != strNewType)
			{
				objCIFormDoc.oCI().ck_config_type = strNewType;	
				var strNewFormName = app.cmdb.get_configtype_formname(strNewType);
				if(strNewFormName != objCIFormDoc.oCIType().extended_form)
				{
					//-- get config type form and if different prompt and if ok save and load correct form
					var strConfirm = "The configuration type selected uses a different form than that of the current configuration type. Are you sure you want to change the type?"
					if(confirm(strConfirm))
					{	
						objCIFormDoc.doc.Save();
						objCIFormDoc.doc.CloseForm();
						app.cmdb.popup_configitem(objCIFormDoc.oCI().pk_auto_id,true,"",true,function()
						{
							if ((funcCallback != undefined) && (funcCallback != null))
							{
								funcCallback();
							}
						});
					}
					else
					{
						objCIFormDoc.oCI().ck_config_type = strOrigType;
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback();
						}						
					}
				}
				else
				{
					objCIFormDoc.doc.UpdateFormFromData();
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback();
					}
				}
			}
			else
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback();
				}
			}
		}
	});
}

//--
//-- using sla matrix get the sla from impact, urgency and priority
oCiForm.prototype.set_ci_sla=function()
{
	this.oCI().fk_sla = app.itsm.get_sla_from_slad_matrix(this.oCI().fk_sld, this.oCI().fk_impact_level, this.oCI().fk_urgency_level);
	this.doc.UpdateFormFromData();
}

//--
//-- MAINFORM & MAINFORM CONTROL EVENT FUNCTIONS 
oCiForm.prototype.OnFormLoaded = function ()
{
	if(app.g.remote_support_enabled())
	{
		_evi(this.MF().btn_remote_support, true);	
		_evi(this.MF().btn_remotesupport, true);	
	}

	//-- setup field mode
	this.setup_form_fields((this.oCI().pk_auto_id==0));

	//-- reset modified flag	
	this.doc.ResetModiedFlag("config_itemi");
	this.doc.ResetModiedFlag("config_type");

	if(this.MF().tb_reset_exttablename.text !="") this.doc.ResetModiedFlag(this.MF().tb_reset_exttablename.text);

	//-- Load Media Tab File List
	var CITypeFolder = this.oCIType().pk_config_type.replace(/->/g,'\\');
	var CMDBMediaServerRoot = oSettings.get_setting("CMDBMediaServerRoot");
	var strPath = CMDBMediaServerRoot+"\\"+CITypeFolder;
	_flp(this.MF().MediaFiles, strPath);
	
	// RJC F0104320
	//--app.g.apply_appcode_sla_filter(this.MF().fld_fk_sld1,'SLA-CMDB');

}

oCiForm.prototype.OnFieldValueChanged = function (strName,strValue)
{
	var oEle = this.MF().elements[strName];
	if((oEle) && (oEle.dataRef!=""))
	{
		var passbackvalue = app.cmdb.check_ci_element_attribute(oEle,this.doc,undefined,strValue);
		
		if(passbackvalue=="__notcmdbfield__") return true;
		if(passbackvalue!=strValue)
		{
			this.doc.strChangeBackBinding = oEle.dataRef;
			this.doc.strChangeBackToValue = passbackvalue;
			//-- need to reset value back
			this.MF().SetTimer(1, 10);
		}
	}
}

oCiForm.prototype.OnTimer = function (nTimer)
{
	this.MF().KillTimer(nTimer);
	
	//-- reset field value from onfieldvaluechanged
	if(nTimer==1)
	{
		app.g.set_doc_record_fieldvalue(this.doc, this.doc.strChangeBackBinding, this.doc.strChangeBackToValue);
		
	}
	
	//--F0088785
	if(nTimer==2)
	{
		this.doc.LoadRecordData("swdata", "config_itemi", this.oCI().pk_auto_id);

		//-- re enable form
		app.cmdb.enable_for_blackout(this.MF(),this.doc);
		this.doc.UpdateFormFromData();
	
		//-- process ci attribute check
		app.cmdb.process_form_ciattribute_disablecheck(this.doc);
		//-- disable form if required
		app.cmdb.disable_for_blackout(this.MF(),this.doc);
	}
}

oCiForm.prototype.tabCI_OnTabSelected = function (nTab)
{
	var tAvail = 2;
	var tBaselines = 3;
	var tRequests = 4;
	var tAction = 5;
	var tMedia = 6;
	var tOLA = 7;
	var tKB = 8;
	var tABA = 9;
	
	if(nTab==tRequests)
	{
		//-- fresh current req list
		//tabRequest_OnTabSelected(this.MF().tabRequest.tab);
	}
	else if(nTab==tBaselines)
	{
		_een(this.MF().btn_delete_bln, false);	
		_een(this.MF().btn_reactivate, false);
		var boolEnableChangeControl = app.g.check_change_control(this.oCI().pk_auto_id,this.oCI().ck_config_type);
		if(boolEnableChangeControl && !app.cmdb.is_specialist())
		{
			_een(this.MF().btn_baseline, false);
		}else
		{
			_een(this.MF().btn_baseline, (this.oCI().isactivebaseline=="Yes"));
		}
		_slf(this.MF().sl_baselines , "_swc_baselineid="+this.oCI().baselineid);
		this.MF().sl_baselines.Refresh();
	}
	else if(nTab==tAvail)
	{
		_een(this.MF().btn_create_history, ((this.MF().tb_startedonx.text>0) && (this.MF().tb_resolvedonx.text>0) &&(this.MF().tb_startedonx.text<this.MF().tb_resolvedonx.text)));
		this.MF().tabAvail_OnTabSelected(0);
	}else if(nTab==tOLA)
	{
		var strOLAs = app.g.get_ci_olas(this.oCI().pk_auto_id);	
		app.g.sqllist_filter(this.MF().sl_olas1, "swc=pk_ola_id&kvs=" + strOLAs, null, null);
		this.MF().sl_olas1.Refresh();
		
	}else if(nTab==tKB)
	{
		if(this.MF().sl_kb1.rowCount()<1)
		{
			var strDocs = app.oKB.get_cis_kbs(this.oCI().pk_auto_id);
			if(strDocs=="")strDocs="-1";
			app.g.sqllist_filter(this.MF().sl_kb1, "swc=docref&kvs=" + strDocs, null, null);
		}
		this.MF().sl_kb1.Refresh();
		
		//ES - F0112292
		_ete(this.MF().Text5 , "Knowledgebase Articles associated to Configuration Type: " + this.MF().tb_type.text);
		if(this.MF().sl_kb2.rowCount()<1)
		{
			var strDocsT = app.oKB.get_ci_types_kbs(this.oCIType().pk_config_type);
			if(strDocsT=="")strDocsT="-1";
			app.g.sqllist_filter(this.MF().sl_kb2, "swc=docref&kvs=" + strDocsT, null, null);
		}
		this.MF().sl_kb2.Refresh();
		  
	}else if(nTab==tAction)
	{
		app.g.sqllist_filter(this.MF().sl_diary, "_swc_fk_ci_id="+this.oCI().pk_auto_id, null, null);
		this.MF().sl_diary.Refresh();
		
	}else if(nTab==tMedia)
	{
		this.MF().sl_uri1.Refresh();
		
	}else if(nTab==tABA)
	{
		this.MF().sl_bus_area.Refresh();
	}
} //-- eof tabCI_OnTabSelected

oCiForm.prototype.tabCom_OnTabSelected = function (nTab)
{
	var tRequestTypes=1;
	var tParentRel=2;
	var tChildRel=3;	
	var tMErel=4;

	if(nTab==tRequestTypes)
	{
		_een(this.MF().btn_del_profile, (this.MF().sl_profiles.curSel>-1));
		
		//-- get parent request types types and so on
		var strFilter = "swc=pk_code&kvs=-1";
		if(this.oCI().flg_inherit_reqtypes=="1")
		{
			strFilter = "swc=fk_config_type&kvs=" + this.oCI().ck_config_type + "&sf=requesttype_fcinull"; // and (fk_config_item=0 or fk_config_item is null)
		}
		app.g.sqllist_filter(this.MF().sl_parentprofiles, strFilter, null, null);
		this.MF().sl_parentprofiles.Refresh();
	}
	else if(nTab==tParentRel)
	{	
		var  bActiveParents = (this.MF().flg_active_parents.value == 1)? true:false;
		var  bActiveServices = (this.MF().flg_active_services.value == 1)? true:false;
		var strRels = app.cmdb.get_parent_dependencies(this.oCI().pk_auto_id,bActiveParents,bActiveServices);				
		_slf(this.MF().sl_parentrels , "pids=" + strRels);
		this.MF().sl_parentrels.Refresh();		
		_een(this.MF().btn_del_parent, (this.MF().sl_parentrels.curSel>-1));
	}
	else if(nTab==tChildRel)
	{
		var bActiveChildren = (this.MF().flg_active_children.value == 1)? true:false;
		var strRels = app.cmdb.get_child_dependencies(this.oCI().pk_auto_id,bActiveChildren);	
		_slf(this.MF().sl_childrels , "pids=" + strRels);
		this.MF().sl_childrels.Refresh();		
		_een(this.MF().btn_del_child, (this.MF().sl_childrels.curSel>-1));
	}
	else if(nTab==tMErel)
	{
		_slf(this.MF().sl_merel , "_swc_fk_ci_id="+this.oCI().pk_auto_id);
		this.MF().sl_merel.Refresh();
	}
} //-- eof tabCom_OnTabSelected

oCiForm.prototype.tabComAdd_OnTabSelected = function (nTab)
{
	var tContract=1;
	var tSLA=2;
	var tOLA = 3;
	var tDefSLAs = 5;
	
	if(nTab==tContract)
	{
		_een(this.MF().mbtn_ci_contract_actions1, (this.oCI().pk_auto_id>0));
		var strContracts = app.cfg.get_ci_contractkeys(this.oCI().pk_auto_id,false);
		
		app.g.sqllist_filter(this.MF().sl_contracts1, "swc=pk_contract_id&kvs="+ strContracts+"&sf=type_supplier", null, null);
		this.MF().sl_contracts1.Refresh();
	}else if(nTab==tSLA)
	{
		//-- get current sla list to append
		var strSLAs = app.g.get_ci_slas(this.oCI().pk_auto_id);
		
		// RJC F0104320
		app.g.apply_appcode_sla_filter(this.MF().sl_slad1,'SLA-CMDB',"swc=pk_slad_id&kvs="+strSLAs);
		this.MF().sl_slad1.Refresh();
	}else if(nTab==tOLA)
	{
		var strOLAs = app.g.get_ci_olas(this.oCI().pk_auto_id);

		// RJC F0104320
		app.g.apply_appcode_sla_filter(this.MF().sl_olas1,'OLA',"swc=pk_ola_id&kvs="+strOLAs);	
		this.MF().sl_olas1.Refresh();
	}
	//-- Default SLAs
	else if (nTab==tDefSLAs)
	{
		//-- Filter Default SLAs & Call Classes
		_slf(this.MF().sl_defslas, "reltype=CITM&fk_rel_id="+pfu(this.oCI().pk_auto_id));
		this.MF().sl_defslas.Refresh();
	}
} //-- eof tabComAdd_OnTabSelected

//-- buttons
oCiForm.prototype.btn_remove_slad_OnPressed = function()
{
	var strConfirm = "Are you sure you want to remove the selected service level definition record?";
	if(confirm(strConfirm))
	{
		var fk_sla_id = app.g.sl_getprikeyvalue(this.MF().sl_slad1, this.MF().sl_slad1.curSel);
		var strSLACMDBID = app.g.sl_getcolvalue(this.MF().sl_slad1, -1, "fk_cmdb_id");
		app.cmdb.delete_meconfigrelation(strSLACMDBID,this.oCI().pk_auto_id);
		// RJC F0104320
		var strSLAs = app.g.get_ci_slas(this.oCI().pk_auto_id);
		app.g.apply_appcode_sla_filter(this.MF().sl_slad1,'SLA-CMDB',"swc=pk_slad_id&kvs="+strSLAs);
		this.MF().sl_slad1.Refresh();
	}

}

oCiForm.prototype.btn_add_slad_OnPressed = function()
{

	if(!oSettings.get_setting("boolFilterAppcodeSLALoaded"))app.g.load_appcode_sla();

	var strFilter = "";
	var strAppcodes = oSettings.get_setting("strFilterAppcodeSLACMDB");
	if(strAppcodes!="")	strFilter = "_acin="+strAppcodes;
	
	var objCIFormDoc = this;
	var strURL = "mode=select&filter="+pfu(strFilter);
	app.OpenForm("browse_slas", strURL, true, function(x)
	{
		var strKeys = x.document.strSelectedKey;
		if(strKeys=="")return;

		var appendKeys = "";
		var arrKeys = strKeys.split(",");
		for (var x=0; x< arrKeys.length;x++)
		{
			var fk_key = arrKeys[x];
			if(app.g.sl_findrow_byvalue(objCIFormDoc.MF().sl_slad1,fk_key,"pk_slad_id")==-1)
			{
				var strRel = "Uses";
				var recSLA = app.g.get_record("itsmsp_slad", fk_key);                               
				app.cmdb.generate_meconfigrelation(recSLA.fk_cmdb_id,objCIFormDoc.oCI().pk_auto_id,strRel); 

				if(appendKeys != "")appendKeys += ",";
				appendKeys += fk_key;
			}
		}

		if(appendKeys!="")	
		{
			app.g.sqllist_appendfilter(objCIFormDoc.MF().sl_slad1, appendKeys, "pk_slad_id");		
			objCIFormDoc.MF().sl_slad1.SetRowSelected(0);
		}
		objCIFormDoc.MF().sl_slad1.Refresh();
	});
}

oCiForm.prototype.mbtn_rt_actions_OnMenuItem = function (strName,nItemID)
{
	var iAssignType = 1;
	var iRemoveType = 2;	


	if(nItemID == iAssignType)
	{
		var strURL = "mode=select";
		app.OpenFormForAdd("browse_requesttypes", "", strURL, true, function(oDoc)
		{
			if(oDoc.strSelectedKey!="")
			{
				//-- insert userdb request type
				//-- nwj 25.11.2012 - use sqs
				var arrCols = [];
				arrCols.fk_config_item = this.oCI().pk_auto_id;
				arrCols.fk_config_type = this.oCI().ck_config_type;
				arrCols.fk_typecode = oDoc.strSelectedKey;
				arrCols.type_info = oDoc.strSelectedText;	
				if(app.g.submittableinsert("ct_profiles",arrCols))
				{
					app.g.sl_refresh(this.MF().sl_profiles,null,0); 
				}
			}	
			return;
		});
		
		
    }
	else if(nItemID == iRemoveType)
	{
		var strConfirm = "Are you sure you want to remove this service request association?";
		app.g.sl_deldbrow(this.MF().sl_profiles,this.MF().sl_profiles.curSel,'pk_auto_id',null,strConfirm);		
	}



}

oCiForm.prototype.mbtn_ola_actions_OnMenuItem = function (strName,nItemID)
{
	var iAssignCI = 1;
	var iRemoveCI = 2;	

	if(nItemID == iAssignCI)
	{
		if(!oSettings.get_setting("boolFilterAppcodeSLALoaded"))app.g.load_appcode_sla();
		var strFilter = "";
		var strAppcodes = oSettings.get_setting("strFilterAppcodeOLA");
		//if(strAppcodes!="")strFilter = "_acin="+strAppcodes;
		if(strAppcodes!="")strFilter = "appcode IN(" + addQuotesToStrings(strAppcodes) + ")";
		var strURL = "mode=select&filter="+pfu(strFilter);
		var objFormDoc = this;
		app.OpenFormForAdd("browse_olas", "", strURL, true, function(x)
		{
			var strKeys = x.document.strSelectedKey;
			if(strKeys=="")return;

			var appendKeys = "";
			var arrKeys = strKeys.split(",");
			var strCMDBIDs = x.document.strSelectedCMDBIDs;
			var arrCMDBIDs = strCMDBIDs.split(",");
			for (var x=0; x< arrKeys.length;x++)
			{
				var fk_key = arrKeys[x];
				if(app.g.sl_findrow_byvalue(objFormDoc.MF().sl_olas1,fk_key,"pk_ola_id")==-1)
				{
					var strRel = "Uses";
					app.cmdb.generate_meconfigrelation(arrCMDBIDs[x],objFormDoc.oCI().pk_auto_id,strRel);  

					if(appendKeys != "")appendKeys += ",";
					appendKeys += fk_key;
				}
			}

			if(appendKeys!="")	
			{
				app.g.sqllist_appendfilter(objFormDoc.MF().sl_olas1, appendKeys, "pk_ola_id");		
				objFormDoc.MF().sl_olas1.SetRowSelected(0);
			}
			objFormDoc.MF().sl_olas1.Refresh();
			return;
		});
    }
	else if(nItemID == iRemoveCI)
	{
		var strConfirm = "Are you sure you want to remove the selected operational service level definition record from the Configuration Item?";
		if(confirm(strConfirm))
		{
			var fk_cmdb_id = app.g.sl_getcolvalue(this.MF().sl_olas1, this.MF().sl_olas1.curSel, "fk_cmdb_id");//app.g.sl_getprikeyvalue(sl_olas1, sl_olas1.curSel);
			app.cmdb.delete_meconfigrelation(fk_cmdb_id,this.oCI().pk_auto_id);
			
			// RJC F0104320
			var strOLAs = app.g.get_ci_olas(this.oCI().pk_auto_id);
			app.g.apply_appcode_sla_filter(this.MF().sl_olas1,'OLA',"swc=pk_ola_id&kvs="+strOLAs);
			this.MF().sl_olas1.Refresh();
		}
	}
	
}

oCiForm.prototype.mbtn_ci_contract_actions_OnMenuItem = function (strName,nItemID)
{
	var objCIFormDoc = this;
	
	var funcRefreshList = function(objCIFormDoc)
	{
		//-- refresh list
		var strContracts = app.cfg.get_ci_contractkeys(objCIFormDoc.oCI().pk_auto_id,false);
		objCIFormDoc.MF().sl_contracts1.filter = "swc=pk_contract_id&kvs=" + strContracts;
		objCIFormDoc.MF().sl_contracts1.Refresh();
	}
	
	var iRemoveContract = 2;
	var iSearchContract= 3;
	
	if(nItemID == iRemoveContract)
	{
		var strContract = this.MF().sl_contracts1.GetItemTextRaw(this.MF().sl_contracts1.curSel, "pk_contract_id");
		var strContractCMDBID = this.MF().sl_contracts1.GetItemTextRaw(this.MF().sl_contracts1.curSel, "fk_cmdb_id");		
		if ((strContract=="")||(strContractCMDBID==""))return;
	
		if (!confirm("Are you sure you want to remove the selected contract from this ci ?")) return;
		{
    		//--
			//-- delete ci relationship (always assume that ME is parent)
			app.cmdb.delete_meconfigrelation(strContractCMDBID, this.oCI().pk_auto_id);
			this.MF().sl_contracts1.Refresh();
    	} 		
	}
	else if(nItemID == iSearchContract)
	{
		//-- F0096913
		var boolAlertOwnership = false;
		var boolAlertDupe = false;
		//var strURL = "canreset=0&fk_company_id=" + pfu(oCI().fk_supplier);
		var strURL = "canreset=0&type=supplier";
		
		app.g.search_for("contract",true,strURL,function(oRes)
		{
			if(oRes.selectedkeys=="")return;
		
			//--F0108052
			var oOrgRec =null;
			var arrContractKeys = oRes.selectedkeys.split(",");
			var arrKeys = oRes.selectedcmdbids.split(",");
			var arrCompanyKeys = oRes.selectedcompanyids.split(",");	
			var strCICompanyKeys = app.cmdb.get_ci_company_ids(objCIFormDoc.oCI().pk_auto_id,false);
			//--End
		
			//-- associate contracts
			var strRel = dd.GetGlobalParamAsString("Application Settings/CMDB/Types/DefaultContractCIRelationship");   		
			var strCompanyRel = dd.GetGlobalParamAsString("Application Settings/CMDB/Types/DefaultOrgCIRelationship");		
			var strCisToLink = "";
			var strCiTextToLink = "";
			for(var x=0; x< arrKeys.length;x++)
			{
				//get cis associated with supplier contract
				var strCIS = app.cfg.get_supplier_cikeys(arrCompanyKeys[x],true,true);
				var strCIS = app.cfg.get_contract_cikeys(arrContractKeys[x],true);
				var arrUsedCIS = strCIS.split(",");

				var boolFound = false
				var val = objCIFormDoc.oCI().pk_auto_id;
				for(var i=0,l=arrUsedCIS.length;i<l;i++){
					if(parseInt(arrUsedCIS[i])===val)
					{
						boolAlertDupe = true;
						boolFound = true;
						break;
					}
				}
				if(boolFound)
				{
					continue;
				}
				
				//if supplier not associated - continue
				if(objCIFormDoc.oCI().fk_supplier!=arrCompanyKeys[x])
				{
					boolAlertOwnership = true;
					continue;
				}
			
				app.cmdb.generate_meconfigrelation(arrKeys[x], objCIFormDoc.oCI().pk_auto_id, strRel);		
				
				//-- if contract belongs to a org that does not use this CI then create ci - org relationship			
				if(strCICompanyKeys.indexOf(arrCompanyKeys[x])==-1)
				{
					//-- make company and ci relationship
					//-- get company fk_cmdb_id
					oOrgRec = app.g.get_record("company", arrCompanyKeys[x]);
					if(oOrgRec)
					{
						app.cmdb.generate_meconfigrelation(oOrgRec.fk_cmdb_id, objCIFormDoc.oCI().pk_auto_id, strCompanyRel);
						objCIFormDoc.MF().sl_contracts1.Refresh();
					}
				}
			}
			
			if(boolAlertDupe)
			{
				MessageBox("One or more of the contracts selected is already associated with this configuration item.");
			}
				//-- if not a ci used by org and we havent told user tell them and then dont bother
			if(boolAlertOwnership)
			{
				boolAlerted = true; 
				MessageBox("One or more of the contracts selected are not provided by the supplier of this Configuration Item.\nSuch contracts will not be associated to the configuration item.");
			}
			funcRefreshList(objCIFormDoc);
		});
	}
	else
	{
		funcRefreshList(objCIFormDoc);
	}
}


//-- on media tab item
oCiForm.prototype.btn_pro_up_OnPressed=function()
{
	//-- NWJ : move uri seq up
	//-- get id to up
	var currRow = this.MF().sl_uri1.curSel;
	var intUpID = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel, 'pk_uri_id');
	var intUpSeq = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel, 'nindex');

	//-- get id to move down
	var intDownID = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel-1, 'pk_uri_id');
	var intDownSeq = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel-1, 'nindex');	

	//-- swap positions - using sqs
	var p = {};	p.nindex = intDownSeq;
	if(app.g.submittableupdate("cmdb_uri_link",intUpID,p))
	{
		p.nindex = intUpSeq;
		if(app.g.submittableupdate("cmdb_uri_link",intDownID,p))		
		{
			//-- refresh list
			this.MF().sl_uri1.Refresh();
			this.MF().sl_uri1.SetRowSelected(currRow-1, true, false);
		}
	}
}
//-- on media tab item
oCiForm.prototype.btn_pro_down_OnPressed=function()
{
	//-- get id to move down
	var currRow = this.MF().sl_uri1.curSel;
	var intDownID = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel, 'pk_uri_id');
	var intDownSeq = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel, 'nindex');	
	
	//-- get id to up
	var intUpID = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel+1, 'pk_uri_id');
	var intUpSeq = this.MF().sl_uri1.GetItemTextRaw(this.MF().sl_uri1.curSel+1, 'nindex');
	
	//-- swap positions - using sqs
	var p = {};	p.nindex = intDownSeq;
	if(app.g.submittableupdate("cmdb_uri_link",intUpID,p))
	{
		p.nindex = intUpSeq;
		if(app.g.submittableupdate("cmdb_uri_link",intDownID,p))		
		{
			//-- refresh list
			this.MF().sl_uri1.Refresh();
			this.MF().sl_uri1.SetRowSelected(currRow+1, true, false);
		}
	}
}
//-- on media tab item
oCiForm.prototype.btn_del_pro_OnPressed=function()
{
	//-- ask to delete
	var strConfirm = "Are you sure you want to delete the selected DML / Reference record?";
	if(app.g.sl_deldbrow(this.MF().sl_uri1,this.MF().sl_uri1.curSel,'pk_uri_id',null,strConfirm))
	{
		//-- loop through list and set seq for each to #
		var intID=0;
		var nextSeq=0;
		for(var x=0; x < this.MF().sl_uri1.rowCount();x++)
		{
			nextSeq=x+1;
			intID = this.MF().sl_uri1.GetItemTextRaw(x, "pk_uri_id");
			
			//-- use sqs
			var p = {};	p.nindex = nextSeq;
			app.g.submittableupdate("cmdb_uri_link",intID,p);				
		}
		
		this.MF().sl_uri1.Refresh();
		this.MF().sl_uri1.SetRowSelected(0, true, false);
	}
}

//-- on affected business items tab item
oCiForm.prototype.mbtn_aba_actions_OnMenuItem = function (strName,nItemID)
{
	var iAssignBusArea = 1;
	var iRemoveBusArea = 2;	

	
	if(nItemID == iAssignBusArea)
	{
        var objFormDoc = this;
		app.g.search_for("bus_area", true,"", function(oRes)
		{
			var strKeys = oRes.selectedkeys;

			if(strKeys=="")return;
			var arrKeys = strKeys.split(",");
			for (var x=0; x< arrKeys.length;x++)
			{
				var fk_key = arrKeys[x];
				if(app.g.sl_findrow_byvalue(objFormDoc.MF().sl_bus_area,fk_key,"fk_bus_area_id")==-1)
				{			
					app.cmdb.insert_affected_bus_area(objFormDoc.oCI().ck_config_item, fk_key);
				}
			}
			objFormDoc.MF().sl_bus_area.Refresh();
			objFormDoc.MF().sl_bus_area.SetRowSelected(0);
			return;
		});
		
    }
	else if(nItemID == iRemoveBusArea)
	{
		var strID = this.MF().sl_bus_area.GetItemTextRaw(this.MF().sl_bus_area.curSel, 'fk_bus_area_id');	
		if(strID!="")
		{
			var strConfirm = "Are you sure you want to remove the selected Business Area from the Configuration Item?";
			if(confirm(strConfirm))
			{
				app.cmdb.delete_affected_bus_area(this.oCI().ck_config_item, strID, "");
				this.MF().sl_bus_area.Refresh();
			}
		}
	}
}

//-- on kbase tab item
oCiForm.prototype.mbtn_kb_actions_OnMenuItem = function (strName,nItemID)
{
	var iAssignKB = 1;
	var iRemoveKB = 2;	
	
	if(nItemID == iAssignKB)
	{
        var objFormDoc = this;
		app.g.search_for("swkb", true,"", function(oRes)
		{
			var strKeys = oRes.selectedkeys;
			if(strKeys=="")return;

			var arrKeys = strKeys.split(",");
			for (var x=0; x< arrKeys.length;x++)
			{
				var fk_key = arrKeys[x];
				if(app.g.sl_findrow_byvalue(objFormDoc.MF().sl_kb1,fk_key,"docref")==-1)
				{
					app.oKB.relate_ci_to_kb(objFormDoc.oCI().pk_auto_id,fk_key);
				}
			}
			
			//-- re-fetch list
			var strDocs = app.oKB.get_cis_kbs(objFormDoc.oCI().pk_auto_id);
			if(strDocs=="")	strDocs="-1";
			_slf(objFormDoc.MF().sl_kb1 , "swc=docref&kvs=" + strDocs);
			objFormDoc.MF().sl_kb1.SetRowSelected(0);
			objFormDoc.MF().sl_kb1.Refresh();
		});
    }
	else if(nItemID == iRemoveKB)
	{
		var fk_kb_id = app.g.sl_getprikeyvalue(this.MF().sl_kb1, this.MF().sl_kb1.curSel);
		if(fk_kb_id!="")
		{
			var strConfirm = "Are you sure you want to remove the selected Knowledgebase article from the Configuration Item?";
			if(confirm(strConfirm))
			{
				app.oKB.unrelate_ci_from_kb(fk_kb_id,this.oCI().pk_auto_id);	
			}
			var strDocs = app.oKB.get_cis_kbs(this.oCI().pk_auto_id);
			if(strDocs=="")	strDocs="-1";
			_slf(this.MF().sl_kb1 , "swc=docref&kvs=" + strDocs);
			this.MF().sl_kb1.SetRowSelected(0);
			this.MF().sl_kb1.Refresh();
		}
	}

}

oCiForm.prototype.btn_new_me_OnPressed=function()
{
	var objCIFormDoc = this;
	var strURL = "canreset=1&fk_company_id=" + pfu(this.oCI().fk_company_id);
	app.g.search_for("customers",true,strURL, function(oRes)
	{
		if(oRes.selectedkeys=="")return;
	
		var arrKeys = oRes.selectedkeys.split(",");
		var arrName = oRes.selectedother.split(",");	
		var arrCMDBIDs = oRes.selectedcmdbids.split(",");		
		for (var x=0; x< arrKeys.length;x++)
		{
			var fk_key = arrKeys[x];
			var owner_name = arrName[x];	
			if(app.g.sl_findrow_byvalue(objCIFormDoc.MF().sl_merel,fk_key,"fk_me_key")==-1)
			{
				//-- nwj 25.11.2012 - use sqs
				var arrCols = [];
				arrCols.code = 'CUSTOMER';
				arrCols.fk_ci_id = objCIFormDoc.oCI().pk_auto_id;
				arrCols.fk_me_key = fk_key;
				arrCols.me_table = 'userdb';	
				arrCols.me_description = owner_name;	
				arrCols.ci_description = objCIFormDoc.oCI().description;			
				arrCols.priority = '0 - None';			
				arrCols.ci_type = objCIFormDoc.oCI().ck_config_type;				
				arrCols.ci_status = objCIFormDoc.oCI().fk_status_level;				
				arrCols.ci_cmdbstatus = objCIFormDoc.oCI().cmdb_status;				
				arrCols.ci_config_item = objCIFormDoc.oCI().ck_config_item;							
				arrCols.ci_active = objCIFormDoc.oCI().isactivebaseline;							
				app.g.submittableinsert("config_relme",arrCols);		
			}
			
			//--
			//-- create ci relationship (always assume that customer always uses a CI)
			if(arrCMDBIDs[x]>0)
			{
				//app.cmdb.insert_meconfigrelation(arrCMDBIDs[x], this.oCI().pk_auto_id, this.oCI().ck_config_type, this.oCI().ck_config_item, "uses", 'No');
				app.cmdb.insert_meconfigrelation(arrCMDBIDs[x], objCIFormDoc.oCI().pk_auto_id, objCIFormDoc.oCI().ck_config_type, objCIFormDoc.oCI().ck_config_item, "uses", 'No', objCIFormDoc.oCI().description);

			}
			
		}

		objCIFormDoc.MF().sl_merel.Refresh();
		objCIFormDoc.MF().sl_merel.SetRowSelected(0);
	});
}

//--
//-- EOF - NWJ - 25.11.2012 - CIFORM CLASS

function oService()
{

}
var service = new oService();
app.global.service = service;

//-- itsm 2.4.0 - compare a ci record with another ci record - used to compare baselines but could be used to compare two diff cis
oCMDB.prototype.compare_baseline_data = cmdb_compare_baseline_data;
function cmdb_compare_baseline_data(oRecMasterCI, intOtherCIID, funcCallback)
{
	if(intOtherCIID==undefined)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(false);
		}
	}
	else if(oRecMasterCI==undefined)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(false);
		}
	}
	else
	{
		var oRecOtherCI = app.g.get_record("config_itemi", intOtherCIID);
		if(oRecOtherCI)
		{
			var strSkipCols = "pk_auto_id,isactivebaseline,baselineid,ck_baselineindex,pk_ci_id,fk_cmdb_id";
			if(oRecOtherCI.pk_auto_id!=oRecMasterCI.pk_auto_id)
			{
				var strSessID = app.session.analystid + "_" + app.global.GetCurrentEpocTime();

				//-- create sql inserter object
				var oInsertTmp = new oSqlInsert('ci_bl_compare');
				oInsertTmp.setfield('ck_session_id',strSessID);
				oInsertTmp.setfield('ck_config_item',oRecMasterCI.ck_config_item);

				//-- perform baseline check - store all field values that are different in config_itemi
				for (x=0; x < dd.tables.config_itemi.columns.length;x++)
				{
					var colName = LC(dd.tables.config_itemi.columns[x].Name);
					var colDisp = dd.tables.config_itemi.columns[x].DisplayName;

					//RJC 31.03.2010 if column type is date, fix epoch
					var strMasterValue = oRecMasterCI[colName];
					var strOtherValue = oRecOtherCI[colName];
					if(app.g.dd_fieldtype('config_itemi',colName)==5)
					{
						strMasterValue = app.g.fixepoch(strMasterValue);
						strOtherValue = app.g.fix_epoch(strOtherValue);
					}

					//-- diff value and is afield we want to report on
					if( ((LC(strOtherValue) != LC(strMasterValue))) && (strSkipCols.indexOf(colName)<0) )
					{
						//-- format values i.e. if an epoch with give us date setting 
						var strFormattedMasterValue = app.g.dd_format('config_itemi',colName,oRecMasterCI[colName]);
						var strFormattedOtherValue = app.g.dd_format('config_itemi',colName,oRecOtherCI[colName]);

						oInsertTmp.setfield('coldisplay',colDisp);
						oInsertTmp.setfield('master_value',strFormattedMasterValue);
						oInsertTmp.setfield('baseline_value',strFormattedOtherValue);
						oInsertTmp.execute();
					}

				}

				//-- then check ext table and get different values - if two cis have different extended table attributes then skip
				var strConfigExtTable = "";
				var oRS = app.g.get_sqrecordset("cmdb/common/select.config_type.exttable","ct=" + oRecMasterCI.ck_config_type );
				if(oRS.Fetch())
				{
					strConfigExtTable = LC(app.g.get_field(oRS,"EXTENDED_TABLE"));
					if( (strConfigExtTable!="")&&(dd.tables[strConfigExtTable]) )
					{
						//-- get extended data
						var oRecMasterCIExtData = app.g.get_record(strConfigExtTable, oRecMasterCI.pk_auto_id);
						var oRecOtherCIExtData = app.g.get_record(strConfigExtTable, intOtherCIID);
						var boolSameExtTable = (oRecOtherCIExtData)?true:false;

						//-- store all ext field values that are different in extended table
						for (x=0; x < dd.tables[strConfigExtTable].columns.length;x++)
						{
							var colName = LC(dd.tables[strConfigExtTable].columns[x].Name);
							var colDisp = "[EXT] " + dd.tables[strConfigExtTable].columns[x].DisplayName;

							var boolSet=false;
							var strFormattedMasterValue = app.g.dd_format(strConfigExtTable,colName,oRecMasterCIExtData[colName]);
							if(!boolSameExtTable)
							{
								var strFormattedOtherValue = "[Extended Data Not Available]";
								boolSet=true;
							}
							else
							{
								//-- diff value and is afield we want to report on
								if( (LC(oRecOtherCIExtData[colName]) != LC(oRecMasterCIExtData[colName])) && (strSkipCols.indexOf(colName)<0) )
								{
									//-- format values i.e. if an epoch with give us date setting 
									var strFormattedOtherValue = app.g.dd_format(strConfigExtTable,colName,oRecOtherCIExtData[colName]);
									boolSet=true;
								}
							}
							
							if(boolSet)
							{
								oInsertTmp.setfield('coldisplay',colDisp);
								oInsertTmp.setfield('master_value',strFormattedMasterValue);
								oInsertTmp.setfield('baseline_value',strFormattedOtherValue);
								oInsertTmp.execute();
							}
						}

					}

				}
				
				
				oInsertTmp = null;


				//-- open form to show data - when form is closed the  the temp data is deleted (form.onformclosing event
				var strURL = "ck_config_item=" + pfu(oRecMasterCI.ck_config_item) + "&ck_session_id=" + pfu(strSessID) + "&fk_master_auto_id=" + oRecMasterCI.pk_auto_id + "&fk_other_auto_id=" + oRecOtherCI.pk_auto_id;
				app.OpenFormForAdd("ci_bl_compare", "", strURL, true, function()
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback();
					}
				});
			}
			else
			{
				MessageBox("You cannot compare a configuration item against itself. Please select another configuration item for comparison");
			}
		}
		else
		{
			MessageBox("Failed to load the comparision configuration item. Please contact your Supportworks Administrator.");
		}
	}
}

//-- 22.07.2008 - create type relatiopnship if it does not exist
oCMDB.prototype.ci_relationship_exists = cmdb_ci_relationship_exists;
function cmdb_ci_relationship_exists(strRelType,boolCreate)
{
	if(boolCreate==undefined)boolCreate=true;

	//if(app.g.gxet_rowcount("CONFIG_RELTYPE","PK_RELTYPE = '" + app.g.pfs(strRelType) + "'")<1)
	if(app.g.sqs_rowcount("cmdb/ci_relationship_exists.count","rel=" + pfu(strRelType))<1)
	{
		//-- does not exist - do we create
		if(boolCreate)
		{
			//var strInsert = "ixnsert into CONFIG_RELTYPE (PK_RELTYPE,LINE_STYLE,LINE_COLOUR) VALUES ('" + app.g.pfs(strRelType) + "',2,'#000000')";
			//return app.g.sxubmitsql(strInsert,true);
			//- -nwj - use sqs - 11.2012
			var strParams = "rel=" + pfu(strRelType);
			return app.g.submitsqs("cmdb/ci_relationship_exists.insert",strParams);
		}
		else
		{
			return false;
		}
	}
	return true;
}

//-- F0086202 - load form field mgt for a given CI Type/Catalog Type
//-- get a list of controlled attributes
oCMDB.prototype.load_control_fields = cmdb_load_control_fields;
function cmdb_load_control_fields(strConfigType, boolSC)
{
	if(boolSC==undefined)boolSC=0;
	var strTable = "CONFIG_TYPEI";
	if(boolSC==1)
		strTable = "SC_TYPEI";
	app.cmdb.arr_control_atts[boolSC][strConfigType] = [];

	//-- fetch rows
	var ap = {};
	ap.fk_config_type = strConfigType;
	ap.flg_sc=boolSC;
	var oRS = app.g.get_tablerecordset_bycol("ct_ctrl_fields",ap);
	while(oRS.Fetch())
	{
		var oBj = {};
		oBj.type	= app.g.get_field(oRS,"fk_config_type");
		oBj.databinding	= app.g.get_field(oRS,"databinding");
		oBj.regexcheck	= app.g.get_field(oRS,"regexcheck");
		oBj.regexerrormsg = app.g.get_field(oRS,"regexerrormsg");
		oBj.flg_autodiary	= app.g.get_field(oRS,"flg_autodiary");
		oBj.flg_silent_diary	= app.g.get_field(oRS,"flg_silent_diary");
		oBj.flg_diary	= app.g.get_field(oRS,"flg_diary");
		oBj.flg_ctrl_flag	= app.g.get_field(oRS,"flg_ctrl_flag");

		if(app.cmdb.arr_control_atts[boolSC][oBj.type]==undefined)app.cmdb.arr_control_atts[boolSC][oBj.type] = [];
		app.cmdb.arr_control_atts[boolSC][oBj.type][oBj.databinding] = oBj;
	}

	var currCIType = app.g.get_record(strTable, strConfigType);
	while(currCIType.flg_inherit_autodiary==1 || currCIType.flg_inherit_regex==1 || currCIType.flg_inherit_protected==1)
	{
		var ap = {};
		ap.fk_config_type = currCIType.fk_config_type;
		ap.flg_sc=boolSC;
		var oRS = app.g.get_tablerecordset_bycol("ct_ctrl_fields",ap);

		//-- fetch rows
		var inheritRegex = currCIType.flg_inherit_regex==1;
		var inheritAutoDiary =  currCIType.flg_inherit_autodiary==1;
		var inheritProtected =  currCIType.flg_inherit_protected==1;

		while(oRS.Fetch())
		{
			var oBj = {};
			oBj.type	= strConfigType;//app.g.get_field(oRS,"fk_config_type");
			oBj.databinding	= app.g.get_field(oRS,"databinding");
			oBj.regexcheck	= app.g.get_field(oRS,"regexcheck");
			oBj.regexerrormsg = app.g.get_field(oRS,"regexerrormsg");
			oBj.flg_autodiary	= app.g.get_field(oRS,"flg_autodiary");
			oBj.flg_silent_diary	= app.g.get_field(oRS,"flg_silent_diary");
			oBj.flg_diary	= app.g.get_field(oRS,"flg_diary");
			oBj.flg_ctrl_flag	= app.g.get_field(oRS,"flg_ctrl_flag");
	
			if(app.cmdb.arr_control_atts[boolSC][oBj.type]==undefined)app.cmdb.arr_control_atts[boolSC][oBj.type] = [];


			//if the child is not set for this field
			if(app.cmdb.arr_control_atts[boolSC][strConfigType][oBj.databinding]==undefined){
				//limit to inherit
				if(!inheritRegex)oBj.regexcheck = "";
				if(!inheritAutoDiary)oBj.flg_autodiary = "0";
				if(!inheritAutoDiary)oBj.flg_silent_diary = "0";
				if(!inheritProtected)oBj.flg_ctrl_flag = "0";

				//set entry if attribute is being monitored 
				if(!(oBj.regexcheck == "" && oBj.flg_autodiary == "0" && oBj.flg_silent_diary == "0" && oBj.flg_ctrl_flag == "0"))
				{
					app.cmdb.arr_control_atts[boolSC][strConfigType][oBj.databinding] = oBj;
				}
			}
		}
		//if there is a parent type load, else escape while loop
		if(currCIType.fk_config_type=="")
			break;
		else
		{
			currCIType = app.g.get_record(strTable, currCIType.fk_config_type);
			if(!inheritRegex)
				currCIType.flg_inherit_regex = 0;
			if(!inheritAutoDiary)
				currCIType.flg_inherit_autodiary = 0;
			if(!inheritProtected)
				currCIType.flg_inherit_protected = 0;

			var strText = "Next Type :"+currCIType.fk_config_type+"\n";
			strText += "Inherit prot :"+currCIType.flg_inherit_protected+"\n";
			strText += "Inherit diary :"+currCIType.flg_inherit_autodiary+"\n";
			strText += "Inherit Regex:"+currCIType.flg_inherit_regex+"\n";
			//MessageBox(strText);
		}
	}
}

//-- F0086202 - add boolSC parameter to determine whether item is in cmdb or service catalog, defaults cmdb
//-- given a form control check if it has a data binding that is managed
oCMDB.prototype.check_ci_element_attribute = cmdb_check_ci_element_attribute;
function cmdb_check_ci_element_attribute(oEle,oDoc, strDataRef,strDataValue, boolSC)
{
	//F0086202 - if boolSC is undefined, assume app.cmdb. 
	if(boolSC==undefined)boolSC=0;

	//F0086202 - if service catalog, use catalog type
	var strType = oDoc.config_itemi.ck_config_type;
	if(boolSC==1)
		strType = oDoc.config_itemi.catalog_type;

	//-- expect oDoc to have bound config item table
	if(oDoc.config_itemi)
	{
		var UseDataRef = (strDataRef!=undefined)?strDataRef:oEle.dataRef;
		var UseDataValue = (strDataValue!=undefined)?strDataValue:oEle.value;

		//-- element has a data binding
		if(UseDataRef!="")
		{

			return this.process_ci_attribute_check(UseDataRef,UseDataValue, strType, oDoc, boolSC);
		}
	}
	return "__notcmdbfield__";
}

//-- F0086202 - add boolSC parameter to determine whether item is in cmdb or service catalog, defaults cmdb
//-- given a form control check if it has a data binding that is managed
oCMDB.prototype.process_ci_attribute_check = cmdb_process_ci_attribute_check;
function cmdb_process_ci_attribute_check(strBinding , varValue, strConfigType, oDoc, boolSC)
{
	//F0086202 - if boolSC is undefined, assume app.cmdb. 
	if(boolSC==undefined)boolSC=0;

	//-- check if table and col exist in the control attributes array
	//-- if so check what the restrictions are
	var originalValue = app.g.get_doc_record_fieldvalue(oDoc, strBinding);

	if (this.arr_control_atts[boolSC][strConfigType]) 
	{
		if(this.arr_control_atts[boolSC][strConfigType][strBinding])
		{
			//-- check if there is a reg ex setting
			var strRegEx = this.arr_control_atts[boolSC][strConfigType][strBinding].regexcheck;
			var strErrorMessage = this.arr_control_atts[boolSC][strConfigType][strBinding].regexerrormsg;
			if(strRegEx!="")
			{
				if(!testregex(varValue,strRegEx))
				{
			
					if(strErrorMessage!="")
					{
						MessageBox(strErrorMessage);
					}
					else
					{
						MessageBox("The value entered does not meet the field requirement. Please try again.");
					}
					//-- reset field value to blank
					return originalValue;
				}
			}

			//-- do auto diary check
			if(this.arr_control_atts[boolSC][strConfigType][strBinding].flg_autodiary == "1")
			{
				oDoc.boolForceDiaryUpdate = true;
				oDoc.strAutoDiaryText += "Field [" + app.g.dd_fieldlabel_frombinding(strBinding) + "] was changed from [" + originalValue + "] to [" + varValue+ "]\n";
			}

			//-- do silent diary check
			if(this.arr_control_atts[boolSC][strConfigType][strBinding].flg_silent_diary == "1")
			{
				oDoc.boolSilentDiaryUpdate = true;
				oDoc.strSilentDiaryText += "Field [" + app.g.dd_fieldlabel_frombinding(strBinding) + "] was changed from [" + originalValue + "] to [" + varValue+ "]\n";
			}
		}
	}

	return varValue;
}

function testregex(strTestText,strRegEx)
{
	var testString = String(strTestText);
	var re = new RegExp(strRegEx);
  	if (testString.match(re)) 
  	{
    	return true;
  	}
  	else 
  	{
	   	return false;
  	}
}

//-- F0086202 - add boolSC parameter to determine whether item is in cmdb or service catalog, defaults cmdb
//-- given a form control check if it has a data binding that is managed
oCMDB.prototype.process_form_ciattribute_disablecheck = cmdb_process_form_ciattribute_disablecheck;
function cmdb_process_form_ciattribute_disablecheck(oDoc,boolSC)
{
	//F0086202 - if boolSC is undefined, assume app.cmdb. 
	if(boolSC==undefined)boolSC=0;
	//F0086202 - if service catalog, use catalog type
	var strType = oDoc.config_itemi.ck_config_type;
	if(boolSC==1)
		strType = oDoc.config_itemi.catalog_type;

	if (this.arr_control_atts[boolSC][strType])
	{
		for(var x=0; x < oDoc.mainform.elements.length;x++)
		{
			if (this.arr_control_atts[boolSC][strType][oDoc.mainform.elements[x].dataRef])
			{
				if(this.arr_control_atts[boolSC][strType][oDoc.mainform.elements[x].dataRef].flg_ctrl_flag==1)
				{
					//-- if a specialist then allow edit
					//-- F0088767 only check is_specialist not can manage
					var boolEnable = this.is_specialist();
					_ero(oDoc.mainform.elements[x], (!boolEnable));
					if(oDoc.mainform.elements[x].type==5)
					{
						_een(oDoc.mainform.elements[x],boolEnable);
					}
				}
			}
		}
	}
}

//-- F0086202 - add boolSC parameter to determine whether item is in cmdb or service catalog, defaults cmdb
//-- given a form control check if it has a data binding and values that need regex check
//-- called in the ci form onsavedata method
oCMDB.prototype.process_form_ciattribute_regexcheck = cmdb_process_form_ciattribute_regexcheck;
function cmdb_process_form_ciattribute_regexcheck(oDoc,boolSC)
{
	//F0086202 - if boolSC is undefined, assume app.cmdb. 
	if(boolSC==undefined)boolSC=0;
	//F0086202 - if service catalog, use catalog type
	var strConfigType = oDoc.config_itemi.ck_config_type;
	if(boolSC==1)
		strConfigType = oDoc.config_itemi.catalog_type;

	var varValue = "";
	if (this.arr_control_atts[boolSC][strConfigType])
	{
		for(var x=0; x < oDoc.mainform.elements.length;x++)
		{
			if(oDoc.mainform.elements[x].type!=8)
			{
				var strBinding = oDoc.mainform.elements[x].dataRef;
				if (this.arr_control_atts[boolSC][strConfigType][strBinding])
				{
					var strRegEx = this.arr_control_atts[boolSC][strConfigType][strBinding].regexcheck;
					var strErrorMessage = this.arr_control_atts[boolSC][strConfigType][strBinding].regexerrormsg;
					if(strRegEx!="")
					{
						var varValue =  oDoc.mainform.elements[x].value;
						if(!testregex(varValue,strRegEx))
						{
							if(strErrorMessage!="")
							{
								MessageBox(strErrorMessage);
							}
							else
							{
								MessageBox("The value entered does not meet the field requirement. Please try again.");
							}
							return false;
						}
					}
				}
			}
			varValue = "";

		}
	}
	return true;
}

//-- true false ci exists
oCMDB.prototype.ci_exists = cmdb_ci_exists;
function cmdb_ci_exists(strConfigItem,strConfigType)
{
	if(strConfigType==undefined)strConfigType="";

	var arrParams ={};
	arrParams.ck_config_item=strConfigItem;
	if(strConfigType!="")arrParams.ck_config_type = strConfigType;
	if(app.g.sqs_rowcountbycol("config_itemi",arrParams)>0)return true;

	return false;
}

//-- true false ci type exists
oCMDB.prototype.ci_type_exists = cmdb_ci_type_exists;
function cmdb_ci_type_exists(strConfigType)
{
	if(strConfigType==undefined)strConfigType="";

	var arrParams ={};
	arrParams.pk_config_type=strConfigType;
	if(app.g.sqs_rowcountbycol("config_typei",arrParams)>0)return true;


	return false;
}

//-- true false ci exists
oCMDB.prototype.service_type_exists = cmdb_service_type_exists;
function cmdb_service_type_exists(strServiceType)
{
	if(strServiceType==undefined)strServiceType="";

	var arrParams ={};
	arrParams.pk_config_type=strServiceType;
	if(app.g.sqs_rowcountbycol("sc_typei",arrParams)>0)return true;


	return false;
}


//-- true false ci exists
oCMDB.prototype.form_field_exists = cmdb_form_field_exists;
function cmdb_form_field_exists(strField,strConfigType)
{
	if(strConfigType==undefined)strConfigType="";

	var arrParams ={};
	arrParams.databinding=strField;
	if(strConfigType!="")arrParams.fk_config_type = strConfigType;
	if(app.g.sqs_rowcountbycol("ct_ctrl_fields",arrParams)>0)return true;


	return false;
}

//-- true false ci exists
oCMDB.prototype.default_value_exists = cmdb_default_value_exists;
function cmdb_default_value_exists(strField,strConfigType)
{
	if(strConfigType==undefined)strConfigType="";

	var arrParams ={};
	arrParams.targetbinding=strField;
	if(strConfigType!="")arrParams.fk_config_type = strConfigType;
	if(app.g.sqs_rowcountbycol("CONFIG_TYPE_DEF",arrParams)>0)return true;
	return false;
}


//--
//-- 19.03.2007 - NWJ - for a given ci display inventory (Apps Dev should change this to use installed inventory tool)
oCMDB.prototype.view_inventory = cmdb_view_inventory;
function cmdb_view_inventory(intCI,strInventoryID)
{
	var strUrl = "";
	
	//-- Create base URL
	var strServer = "http://" + app.session.server + ":" + app.session.httpPort;

	//-- DJH : Check if connector is enabled, if not then return message
	if(!bConnectorEnabled)
	{
		MessageBox("The inventory view for your server has not been setup. Please contact your Administrator.")
		return false;
	}

	//-- Check if we are using a lookup field other than the default CK_CONFIG_ITEM
	if(!((strConnectorLookupField=="ck_config_item") && (strInventoryID!=undefined) && (strInventoryID!="")))
	{
		//-- Get inventory id based on custom lookup field
		var ciRec = app.g.get_record("config_itemi", intCI);
		strInventoryID = ciRec[strConnectorLookupField];

		if(strInventoryID=="" || strInventoryID==undefined)
		{
			MessageBox("The external connector identifier for the selected item is not set. Please contact your Administrator.");
			return false;
		}
	}

	/* If connector URL is blank return an error, if a full URL "http..." then assume a web address onto which the key value
	   is appended, e.g. viewer url would be "http://assetserver/viewer/details.php?guid=" and we append the key value to the end.
	   If the URL is referential e.g. "/sw/itg/assetserver/viewer" then assume we are opening the HIB as normal
	*/
	if(strConnectorURL=="")
	{
		MessageBox("The CONNECTOR.URL setting for your server has not been setup. Please contact your Administrator.");
		return false;
	}
	else if(strConnectorURL.substr(0,4).toLowerCase()=="http")
	{
		strUrl = strConnectorURL + strInventoryID;
		app.global.ShellExecute(strUrl);
		return false;
	}
	else
	{
		strUrl = strServer + strConnectorURL;
    }

	app.global.RunHIB(strUrl, "compname", strInventoryID);
	//-- TK Rework URL
	//app.global.RunHIB(strUrl, "strCompID=" + ciRec.inventory_tool_id + " strCompName"+strInventoryID);
}


//--
//-- 19.03.2007 - NWJ - for a given ci/s display a change schedule
oCMDB.prototype.view_schedule = cmdb_view_schedule;
function cmdb_view_schedule(intCIs, strItems, funcCallback)
{
	//-- if item is not passed in say from vcm, then go get it
	if((strItems==undefined)||(strItems==""))
	{
	 	var ciRec = app.g.get_record("config_itemi", intCIs);
		strItems = ciRec.ck_config_item;
	}

	
	var strURL = "ciid=" + intCIs + "&items=" + strItems;
	app.OpenFormForAdd("cmdb_fsc","",strURL,true, function()
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
		}
	});
}

//--
//-- 19.03.2007 - NWJ - for a given ci display the vcm
oCMDB.prototype.view_vcm = cmdb_view_vcm;
function cmdb_view_vcm(intCI,boolParents)
{
	var intMode = (boolParents)?1:0;
	open_vcm(intCI,"vcmconfig.xml",intMode,5,20,100);
}

//--
//-- 07.02.2007 - NWJ - for a given period check if ci/s have a schedule change -returns array of callrefs and start end dates
//--					[ciid][callref] = "startdatex,enddatex"
oCMDB.prototype.check_change_schedule = cmdb_check_change_schedule;
function cmdb_check_change_schedule(intCIs, startDatex, endDatex)
{
	return this.check_schedule(intCIs, startDatex, endDatex,"RFC-CAUSE")
}

//--
//-- 07.02.2007 - NWJ - for a given period check if ci/s have a scheduled release
oCMDB.prototype.check_release_schedule = cmdb_check_release_schedule;
function cmdb_check_release_schedule(intCIs, startDatex, endDatex)
{
	return this.check_schedule(intCIs, startDatex, endDatex,"REL-CAUSE")
}

//-- check schedule for ci/s (can filter of type rfc or rel)
oCMDB.prototype.check_schedule = cmdb_check_schedule;
function cmdb_check_schedule(intCIs, startDatex, endDatex,strType)
{
	if(strType==undefined)strType="";
	var array_ci_schedule = [];
	if(intCIs=="") return array_ci_schedule;

	//-- select calls for passed in ci's where it is a change and the change is scheduled fo those that are scheduled during same time as passed in cis
	var oParams = {};
	oParams.cids = intCIs;
	oParams.sdx = startDatex;
	oParams.edx = endDatex;
	if(strType!="")	oParams.rc = strType;
	
	var oRS = app.g.get_sqrecordset("cmdb/check_schedule.select",oParams);

	//-- fetch rows
	while(oRS.Fetch())
	{
		intCIid		= app.g.get_field(oRS,"fk_ci_auto_id");
		intCallref	= app.g.get_field(oRS,"fk_callref");
		intStartx	= app.g.get_field(oRS,"itsm_schedstartx");
		intEndx		= app.g.get_field(oRS,"itsm_schedendx");

		if(array_ci_schedule[intCIid]==undefined)
		{
			array_ci_schedule[intCIid] = [];
		}
		//-- store schedule
		array_ci_schedule[intCIid][intCallref] = intStartx + "," + intEndx;
	}

	return array_ci_schedule;
}

oCMDB.prototype.check_activity_schedule = cmdb_check_activity_schedule;
function cmdb_check_activity_schedule(intCIs, oActivites, boolChange, requiredBy, callref)
{
	var strAlertMessage = "";
	var secondPartAlertMessage = "";
	if(boolChange==undefined)
		boolChange = true;

	//check if CIs are associated to other changes/requests
	if(intCIs!="")
	{
		var strCallclass = "Change Request";
		var strRelCode = "RFC-CAUSE";
		if(!boolChange)
		{
			strCallclass = "Release Request";
			strRelCode = "RELEASE";
		}
		var strKeys = "";
		//var strSelect = "sxelect fk_ci_auto_id,callref from cmn_rel_opencall_ci join opencall on opencall.callref=cmn_rel_opencall_ci.fk_callref where callclass = '"+strCallclass+"' and relcode='"+strRelCode+"' and status<15 and status!==6 and callref!=="+callref+" and fk_ci_auto_id in ("+intCIs+")";
		//var oRS = app.g.gxet_recordset(strSelect, "swdata");
		var strParams = "cc=" + strCallclass+"&rc="+strRelCode+"&cr="+callref+"&cids="+intCIs;
		var oRS = app.g.get_sqrecordset("cmdb/check_activity_schedule.select",strParams);
		while(oRS.Fetch())
		{
			if(strAlertMessage!="")
			{
				strAlertMessage+="\n";
			}
			var oCI = app.g.get_record("config_itemi", app.g.get_field(oRS,"fk_ci_auto_id"));
			strAlertMessage += "The item "+oCI.ck_config_item+" is also associated to "+strCallclass+" "+ app.g.callref_pad(app.g.get_field(oRS,"callref"))+".";		
		}		
	}

	var strParams = "call_reference=" + callref;
	var oRS = app.g.get_sqrecordset("cmdb/get_activities_ref.select", strParams);
	for(items in oActivites)
	{
		var oActivity = oActivites[items];
		var isFirst=true;

		if(intCIs!="")
		{
			var arrCIs = intCIs.split(",");
			for(x in arrCIs)
			{			
				var intWorkingHours = app.cmdb.get_unavailable_workingtime(arrCIs[x], oActivity.startDatex, oActivity.endDatex);
				if(intWorkingHours>0)
				{
					if(strAlertMessage!="")
					{
						if(isFirst)
						{			
							isFirst=false;
							strAlertMessage+="\n";
						}
						strAlertMessage+="\n";
					}
					var oCI = app.g.get_record("config_itemi", arrCIs[x]);
					strAlertMessage += "The activity '"+oActivity.title+"' is scheduled during the operational hours of item "+oCI.ck_config_item+".";		
				}
			}
						
			var arrCIs = intCIs.split(",");
			for(x in arrCIs)
			{
				var arr_items = app.cmdb.get_bl_dates(oActivity.startDatex,oActivity.endDatex,arrCIs[x]);
				if(arr_items.length>0)
				{
					if(strAlertMessage!="")
						secondPartAlertMessage+="\n\n";
					secondPartAlertMessage += "The time period selected for the activity '"+oActivity.title+"' has the following clashing blackout periods:";
					for(y in arr_items)
					{
						var oBL = arr_items[y];
						if(secondPartAlertMessage!="")
							secondPartAlertMessage+="\n";
						secondPartAlertMessage+=oBL.oCIName+" has blackout '"+oBL.oName+"' from "+app.g.convert_epochddmmyyyy(oBL.oStart)+" to "+app.g.convert_epochddmmyyyy(oBL.oEnd);
						
					}
				}
			}			
			strAlertMessage+=secondPartAlertMessage;
		}

		var intSameDay=0;
		while (oRS.Fetch())
		{
			id_activity = app.g.get_field(oRS,'pk_auto_id');
			activity_end = app.g.fix_epoch(app.g.get_field(oRS,'endx'));
			activity_start= app.g.fix_epoch(app.g.get_field(oRS,'startx'));

			if (id_activity!=oActivity.pk_auto_id)
			{
				if ((oActivity.startDatex<activity_end && oActivity.startDatex>activity_start) || 
				(oActivity.endDatex<activity_end && oActivity.endDatex>activity_start) || 
				(oActivity.startDatex<activity_start && oActivity.endDatex>activity_end))
				{
					intSameDay++;
				}
			}
		}
		if(intSameDay>0)
		{
			if(strAlertMessage!="")
				strAlertMessage+="\n\n";
			if(intSameDay==1)
			{
				strAlertMessage += "There is "+intSameDay+" activity scheduled for the same time as activity '"+oActivity.title+"'.";
			}
			else
			{
				strAlertMessage += "There are "+intSameDay+" activities scheduled for the same time as activity '"+oActivity.title+"'.";
			}
		}
		
		//-- Check for change freeze & scheduled item clashes
		var oItemRS = app.g.get_sqrecordset("form/fsc_item/get_scheduled_items.select","");
		while(oItemRS.Fetch())
		{
			strType = app.g.get_field(oItemRS,"type");
			strTitle = app.g.get_field(oItemRS,"title");
			intItemStart = app.g.fix_epoch(app.g.get_field(oItemRS,"startx"));
			intItemEnd = app.g.fix_epoch(app.g.get_field(oItemRS,"endx"));
			if (app.itsm.check_overlapping_periods(intItemStart,intItemEnd,oActivity.startDatex,oActivity.endDatex))
			{
				boolAlert = true;
				if (strAlertMessage != "")
				{
					strAlertMessage += "\n\n";
				}
				strAlertMessage += strType + ": '" + strTitle + "' is scheduled for the same time as activity '"+oActivity.title+"'.";
			}
		}
		

		requiredBy = app.g.fix_epoch(requiredBy);
		var boolIsRequired = false;
		if(requiredBy>0)
		{
			if(requiredBy<oActivity.endDatex)
			{
				if(strAlertMessage!="")
					strAlertMessage+="\n\n";
				strAlertMessage+= "The activity '"+oActivity.title+"' is scheduled to end ("+app.g.convert_epochddmmyyyy(oActivity.endDatex)+") after the change is required to be completed ("+app.g.convert_epochddmmyyyy(requiredBy)+").";
			}
		}
	}
	
	

	return strAlertMessage;

}

oITSM.prototype.check_overlapping_periods = itsm_check_overlapping_periods;
function itsm_check_overlapping_periods(intStart1,intEnd1,intStart2,intEnd2)
{
	if ((intStart1 >= intStart2 && intStart1 <= intEnd2) || (intEnd1 >= intStart2 && intEnd1 <= intEnd2) || (intStart1 <= intStart2 && intEnd1 >= intEnd2))
	{
		return true;
	}
	return false;
}



//--
//-- 07.02.2007 - NWJ - calc working time elapsed between two dates and a ci avail
//-- F0093308 update function to use midnight (24:00) as end of day instead of 23:59
oCMDB.prototype.get_unavailable_workingtime = cmdb_get_unavailable_workingtime;
function cmdb_get_unavailable_workingtime(intCI, intStartDatex, intEndDatex)
{
	if( isNaN(intEndDatex) || isNaN(intStartDatex) || (intStartDatex > intEndDatex) ) return 0;

	var array_weeksdays = new Array("sun","mon","tue","wed","thu","fri","sat");
	var array_days = [];

	//-- load ci availability record
	var oRS = app.g.get_sqrecordset("cmdb/common/select.config_item","cid="+intCI);
	//-- fetch rows
	if(oRS.Fetch())
	{
		//-- get each day start time and end time and work out total minutes per day
		mons		= app.g.get_field(oRS,"mon_s");
		mone		= app.g.get_field(oRS,"mon_e");
		array_days.mon = new oDay(mons,mone,calc_minutes(mons,mone),"mon");
		
		tues		= app.g.get_field(oRS,"tue_s");
		tuee		= app.g.get_field(oRS,"tue_e");
		array_days.tue = new oDay(tues,tuee,calc_minutes(tues,tuee),"tue");

		weds		= app.g.get_field(oRS,"wed_s");
		wede		= app.g.get_field(oRS,"wed_e");
		array_days.wed = new oDay(weds,wede,calc_minutes(weds,wede),"wed");

		thus		= app.g.get_field(oRS,"thu_s");
		thue		= app.g.get_field(oRS,"thu_e");
		array_days.thu = new oDay(thus,thue,calc_minutes(thus,thue),"thu");

		fris		= app.g.get_field(oRS,"fri_s");
		frie		= app.g.get_field(oRS,"fri_e");
		array_days.fri = new oDay(fris,frie,calc_minutes(fris,frie),"fri");

		sats		= app.g.get_field(oRS,"sat_s");
		sate		= app.g.get_field(oRS,"sat_e");
		array_days.sat = new oDay(sats,sate,calc_minutes(sats,sate),"sat");

		suns		= app.g.get_field(oRS,"sun_s");
		sune		= app.g.get_field(oRS,"sun_e");
		array_days.sun = new oDay(suns,sune,calc_minutes(suns,sune),"sun");
	}
	
	//-- make start and end date round down to nearest minute
	var dateStart = app.g.convert_epochdate(intStartDatex);
		dateStart.setSeconds(0);
	var dateEnd = app.g.convert_epochdate(intEndDatex);
		dateEnd.setSeconds(0);

	var intWorkingMinutes = Number(0);

	//-- invalid date start >= end date
	if(dateStart > dateEnd)
	{
		MessageBox("Cannot calculate availability down time as the start date is greater than the end date.");
		return intWorkingMinutes;
	}

	//-- if start and end are on same date just diff times
	if (issamedate(dateStart, dateEnd))
	{
		//-- get start time and end time as number i.e. 0900 - 1730
		var initStartTime = getdatetime(dateStart,false);
		var initEndTime = getdatetime(dateEnd,false);

		//-- get current day start and end time
		var strCurrDay = array_weeksdays[dateStart.getDay()];
		var tmpDay = array_days[strCurrDay];
		intWorkingMinutes =  get_unavail_workingtime_onday(initStartTime,initEndTime,tmpDay);
	}
	else
	{
		//-- F0093308
		var tmpDateStart = new Date(dateStart);
		var initEndTime = "24:00";
		
		//-- they span different dates
		var boolFirstLoop = true;
		var boolLoop = true;
		while(boolLoop)
		{

			//-- if tmpstartdate = original end date we are at end of cycle
			if (issamedate(tmpDateStart, dateEnd))
			{
				initEndTime = getdatetime(dateEnd,false);
				boolLoop = false;
			}

			//-- get start time and end time as number i.e. 09:00 - 17:30
			var initStartTime = getdatetime(tmpDateStart,false);

			//-- get current day start and end time
			var strCurrDay = array_weeksdays[tmpDateStart.getDay()];
			var tmpDay = array_days[strCurrDay];

			var dayMins = Number(get_unavail_workingtime_onday(initStartTime,initEndTime,tmpDay));
			intWorkingMinutes = intWorkingMinutes + dayMins

			if (boolFirstLoop)
			{
				//-- have to set start day to begining of the day as we will be working with next day from now on 
				//-- i.e. first day started at 14:56 so next day have to start at 0000
				boolFirstLoop = false;
				tmpDateStart.setHours(0);
				tmpDateStart.setMinutes(0);
				tmpDateStart.setSeconds(0);
			}

			//-- increment by one day
			tmpDateStart.setDate(tmpDateStart.getDate() + 1);
		}
		//-- EOF F0093308
	}

	if(isNaN(intWorkingMinutes))intWorkingMinutes=0;
	//-- work out working time elapsed
	return intWorkingMinutes;
}


function get_unavail_workingtime_onday(initStartTime,initEndTime,tmpDayObject)
{

	var intWorkingMinutes = 0;
	var checkStartTime = tmpDayObject.start;
	var checkEndTime = tmpDayObject.end;

	//-- convert to 0900 - 1730
	var slaStartTime = Number(app.g.string_replace(checkStartTime,":","",false));
	var slaEndTime = Number(app.g.string_replace(checkEndTime,":","",false));
	var unvStartTime = Number(app.g.string_replace(initStartTime,":","",false));
	var unvEndTime = Number(app.g.string_replace(initEndTime,":","",false));

	//-- split times into hh and mins	
	var slaStartTimeHH = checkStartTime.split(":")[0];
	var slaStartTimeMM = checkStartTime.split(":")[1];
	var slaEndTimeHH = checkEndTime.split(":")[0];
	var slaEndTimeMM = checkEndTime.split(":")[1];

	//-- actual day times of unvail
	var unvStartTimeHH = initStartTime.split(":")[0];
	var unvStartTimeMM = initStartTime.split(":")[1];
	var unvEndTimeHH = initEndTime.split(":")[0];
	var unvEndTimeMM = initEndTime.split(":")[1];

	if(checkStartTime==checkEndTime) 
	{
		return 0;
	}

	//-- unavail started and ended before sla start time
	if ((unvStartTime < slaStartTime) && (unvEndTime <  slaStartTime))
	{
		//-- nothing

	}
	else if (unvStartTime < slaStartTime)
	{
		//-- started before sla start 
		var workingHoursMins=0;
		if (unvEndTime > slaEndTime)
		{
			//-- end after sla time (so full days sla time)
			intWorkingMinutes = calc_minutesdiff(slaStartTimeHH,slaStartTimeMM, slaEndTimeHH,slaEndTimeMM);
		}
		else
		{
			//-- ended during working hours
			intWorkingMinutes = calc_minutesdiff(slaStartTimeHH,slaStartTimeMM, unvEndTimeHH,unvEndTimeMM);
		}
	}
	else if (unvStartTime >= slaStartTime)
	{
		//-- started during workibng hours
		if (unvEndTime >  slaEndTime)
		{
			//-- ended after working hours
			intWorkingMinutes = calc_minutesdiff(unvStartTimeHH,unvStartTimeMM, slaEndTimeHH,slaEndTimeMM);
		}
		else
		{

			//-- ended during working hours
			intWorkingMinutes = calc_minutesdiff(unvStartTimeHH,unvStartTimeMM, unvEndTimeHH,unvEndTimeMM);
		}
	}

	return intWorkingMinutes;
}

//-- F0093323
oCMDB.prototype.get_unavailable_time = cmdb_get_unavailable_time;
function cmdb_get_unavailable_time(intStartDatex, intEndDatex)
{
	if( isNaN(intEndDatex) || isNaN(intStartDatex) || (intStartDatex > intEndDatex) ) return 0;

	//-- make start and end date round down to nearest minute
	var dateStart = app.g.convert_epochdate(intStartDatex);
		dateStart.setSeconds(0);
	var dateEnd = app.g.convert_epochdate(intEndDatex);
		dateEnd.setSeconds(0);

	var intWorkingMinutes = 0;

	//-- invalid date start >= end date
	if(dateStart > dateEnd)
	{
		MessageBox("Cannot calculate availability down time as the start date is greater than the end date.");
		return intWorkingMinutes;
	}

	//-- if start and end are on same date just diff times
	if (issamedate(dateStart, dateEnd))
	{
		//-- get start time and end time as number i.e. 0900 - 1730
		var initStartTime = getdatetime(dateStart,false);
		var initEndTime = getdatetime(dateEnd,false);

		intWorkingMinutes =  get_unavail_time_onday(initStartTime,initEndTime);
	}
	else
	{
		//-- F0093308
		var tmpDateStart = new Date(dateStart);
		var initEndTime = "24:00";
		
		//-- they span different dates
		var boolFirstLoop = true;
		var boolLoop = true;
		while(boolLoop)
		{

			//-- if tmpstartdate = original end date we are at end of cycle
			if (issamedate(tmpDateStart, dateEnd))
			{
				initEndTime = getdatetime(dateEnd,false);
				boolLoop = false;
			}

			//-- get start time and end time as number i.e. 09:00 - 17:30
			var initStartTime = getdatetime(tmpDateStart,false);

			var dayMins = get_unavail_time_onday(initStartTime,initEndTime);
			intWorkingMinutes = Number(intWorkingMinutes) + Number(dayMins)

			if (boolFirstLoop)
			{
				//-- have to set start day to begining of the day as we will be working with next day from now on 
				//-- i.e. first day started at 14:56 so next day have to start at 0000
				boolFirstLoop = false;
				tmpDateStart.setHours(0);
				tmpDateStart.setMinutes(0);
				tmpDateStart.setSeconds(0);
			}

			//-- increment by one day
			tmpDateStart.setDate(tmpDateStart.getDate() + 1);
		}
		//-- EOF F0093308
	}

	if(isNaN(intWorkingMinutes))intWorkingMinutes=0;
	//-- work out working time elapsed
	return intWorkingMinutes;
}


function get_unavail_time_onday(initStartTime,initEndTime)
{

	var intWorkingMinutes = 0;

	//-- convert to 0900 - 1730
	var unvStartTime = Number(app.g.string_replace(initStartTime,":","",false));
	var unvEndTime = Number(app.g.string_replace(initEndTime,":","",false));

	//-- actual day times of unvail
	var unvStartTimeHH = initStartTime.split(":")[0];
	var unvStartTimeMM = initStartTime.split(":")[1];
	var unvEndTimeHH = initEndTime.split(":")[0];
	var unvEndTimeMM = initEndTime.split(":")[1];

	if(unvStartTime==unvEndTime) 
	{
		return 0;
	}

	if(unvStartTime < unvEndTime) 
	{
		intWorkingMinutes = calc_minutesdiff(unvStartTimeHH,unvStartTimeMM, unvEndTimeHH,unvEndTimeMM);
	}	
	return intWorkingMinutes;
}
//-- EOF F0093323

//--
//-- returns true or false if two dates are on the same date
function issamedate(dateOne, dateTwo)
{
	return ( (dateOne.getDate()==dateTwo.getDate()) && (dateOne.getMonth()==dateTwo.getMonth()) && (dateOne.getFullYear()==dateTwo.getFullYear()) );
}

//-- for a date returns 09:30 etc or if bool true 0930
function getdatetime(someDate,boolNum)
{
	if(boolNum==undefined)boolNum=false;

	//-- make time to check
	var intMinutes = someDate.getMinutes();
	intMinutes = (intMinutes<10)?"0" + intMinutes:intMinutes;
	if(boolNum)
	{
		return Number(someDate.getHours() + "" + intMinutes);	
	}
	else
	{
		return someDate.getHours() + ":" + intMinutes;
	}
}

function oDay(starttime, endtime, workingminutes, strDay)
{
	if(starttime=="")starttime="00:00";
	if(endtime=="")endtime="00:00";
	if(workingminutes=="")workingminutes=0;
	this.day = strDay;
	this.start = starttime;
	this.end = endtime;
	this.minutes = workingminutes;

}

function calc_minutesdiff(startTimeHH,startTimeMM, endTimeHH,endTimeMM)
{
	var startDate = new Date();
	var endDate = new Date(startDate);

	startDate.setHours(startTimeHH);
	startDate.setMinutes(startTimeMM);

	endDate.setHours(endTimeHH);
	endDate.setMinutes(endTimeMM);
	var one_minute=1000*60;
	return Math.ceil((endDate.getTime()-startDate.getTime())/(one_minute))
}

//-- given 08:30 and 18:00 will work out minutes between
function calc_minutes(startTime,endTime)
{
	if(startTime=="")startTime="00:00";
	if(endTime=="")endTime="00:00";
	startTime = app.g.string_replace(startTime,":","",false);
	startTime = app.g.string_replace(startTime,"30","50",false);
	endTime = app.g.string_replace(endTime,":","",false);
	endTime = app.g.string_replace(endTime,"30","50",false);

	totalTime = String(endTime - startTime);

	if(totalTime=="0") return 0;

	//-- add a . before last 2 chars
	if(totalTime.length==2)
	{
		totalTime = 30;
	}
	else
	{
		var boolHalf = false;
		if(totalTime.indexOf("50")!=-1) boolHalf=true;
		totalTime = app.g.string_replace(totalTime,"50","",false);
		totalTime = app.g.string_replace(totalTime,"0","",true);

		//-- got hours so convert to minutes
		if(boolHalf) totalTime = totalTime + ".5";

		totalTime = totalTime * 60;
	}
	
	return totalTime;
}

//--
//-- 07.02.2007 - NWJ - create new diary entry
oCMDB.prototype.create_diaryentry = cmdb_create_diaryentry;
function cmdb_create_diaryentry(intCI, strURL, funcCallback)
{
	app.OpenFormForAdd("cmdb_diary","",strURL,true, function()
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
		}
	});
}

//-- add an entry in diary table
oCMDB.prototype.insert_diaryentry = cmdb_insert_diaryentry;
function cmdb_insert_diaryentry(intCI, strSource, strCode, strAnalystID, intDate, strDesc, fk_callref)
{
  	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("table", "config_diary");		
 
	xmlmc.SetData("fk_ci_id",intCI);
	xmlmc.SetData("udsource",strSource);
	xmlmc.SetData("udcode",strCode);
	xmlmc.SetData("updatetxt",strDesc);
	xmlmc.SetData("analystid",strAnalystID);
	xmlmc.SetData("updatedonx",intDate);
	xmlmc.SetData("fk_callref",fk_callref);
	var boolSuccess = false;
	if(xmlmc.Invoke("data", "addRecord"))
	{
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
	        MessageBox("Failed to process record creation (" + objRes.message + "). Please contact your Supportworks Supervisor.");
	    }	
	    else
	    {
			boolSuccess = true;
	    }
    }
    else
    {
    	MessageBox("Failed to process record creation. " + xmlmc.GetLastError() + ". Please contact your Supportworks Supervisor.");
    }		
	return boolSuccess;
}

//--
//-- view entry 
oCMDB.prototype.view_diaryentry = cmdb_view_diaryentry;
function cmdb_view_diaryentry(intDiaryKey, strURL, funcCallback)
{
	app.OpenFormForEdit("cmdb_diary","",strURL,true,function(obj)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(obj);
		}
	});
}



//--
//-- launch common update form so user can do mass update of cis (common features only i.e. type, status, levels, profile)
oCMDB.prototype.common_ci_update = cmdb_common_ci_update;
function cmdb_common_ci_update(strCIkeys, strURL, funcCallback)
{
	if((strCIkeys==undefined)||(strCIkeys==""))
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
		}
	}
	else
	{
		strURL = "itemkeys=" + strCIkeys + "&" + strURL;
		app.OpenFormForAdd("cmdb_common_item","",strURL,true, function()
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback();
			}
		});
	}
}

//-- popup availability form
oCMDB.prototype.popup_availform = cmdb_popup_availform;
function cmdb_popup_availform(intCI,boolCreate,funcCallback)
{
	var strURL = "fk_ci_id=" + intCI;
	if(boolCreate)
	{
		app.OpenFormForAdd("cmdb_availability","",strURL,true,function(obj)
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(obj);
			}
		});
	}
	else
	{	
		var p = {};
		p.fk_ci_id=intCI;
		var intHistID = app.g.get_tablecolmax_bycol("ci_avail_hist","pk_auto_id",p)
		//--
		//-- get the current availability record for this ci so we can fix it
		if(intHistID>0)
		{
			//-- edit
			app.OpenFormForEdit("cmdb_availability",intHistID,strURL,true,function()
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback();
				}
			});
		}
		else
		{
			//-- no existing record so create
			this.popup_availform(intCI,true,function()
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback();
				}
			});
		}
	}
}

//-- 07.02.2007 - NWJ - check if cmdb status is an unavialability trigger
oCMDB.prototype.get_cmdbstatus = cmdb_get_cmdbstatus;
function cmdb_get_cmdbstatus(strType, strStatus)
{
	//-- select cmdb status
	var strCMDBStatus = "";
	var strTable = UC("ct_statusl");

	var ap = {};
	ap.FK_CONFIG_TYPE = strType;
	ap.STATUS_LEVEL = strStatus;
	var oRS = app.g.get_tablerecordset_bycol(strTable,ap,false,"CMDB_STATUS");

	while(oRS.Fetch())
	{
		strCMDBStatus = app.g.get_field(oRS,"CMDB_STATUS");
	}

	return strCMDBStatus;
}



//-- popup config type selector
oCMDB.prototype.select_configtype = cmdb_select_configtype;
oCMDB.prototype.pick_configtype = cmdb_select_configtype;
function cmdb_select_configtype(strTitle,boolDefinition,funcCallback)
{
	if (boolDefinition==undefined)boolDefinition=true;
	if (strTitle==undefined)strTitle="";
	var strURL = "title=" + strTitle + "&boolDef=" + boolDefinition;
	app.g.popup("cmdb_configtype_picker",strURL, function(aForm)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			if (aForm)
			{
				if (IsObjectDefined("_bHtmlWebClient"))
				{
					var _swdoc = top;
					funcCallback(aForm._swdoc.strConfigType);
				}
				else
				{
					funcCallback(aForm.document.strConfigType);
				}
			}
			else
			{
				funcCallback("");
			}
		}
	});	
	
}

oCMDB.prototype.create_cmdb_item_def = cmdb_create_cmdb_item_def;
function cmdb_create_cmdb_item_def(strTitle,funcCallback)
{
	if (strTitle==undefined)strTitle="";
	var strURL = "title=" + strTitle;
	app.g.popup("cmdb_category_picker",strURL,function(aForm)
	{
		if (aForm)
		{
			if (IsObjectDefined("_bHtmlWebClient"))
			{
				var _swdoc = top;
				var strType = aForm._swdoc.strConfigType;
			}
			else
			{
				var strType = aForm.document.strConfigType;
			}
		
			if (strType!="") 
			{
				var oRec = app.g.get_record("config_typei",strType);
				if(oRec)
				{
					intMonitor = oRec.flg_canmonitor;
					strExtForm = oRec.extended_form;
					strExtTable = oRec.extended_table;
					strProfile = oRec.fk_profile_code;
					strImage = oRec.www_image_path;
				}

				var strURL = "flg_comps=1&flg_item=1&flg_canmonitor=" + intMonitor + "&fk_config_type=" + strType + "&extended_form=" + strExtForm + "&fk_profile_code=" + strProfile + "&www_image_path=" + escape(strImage) + "&extended_table=" + strExtTable;
				app.OpenFormForAdd("cmdb_item_def", "", strURL, true, function()
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback();
					}
				});
			}
			else
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback();
				}
			}
		}
		else
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback();
			}
		}
		
	});	
	
}


//-- 07.02.2007 - NWJ - Search for CIs
oCMDB.prototype.search_ci = cmdb_search_ci;
function cmdb_search_ci(boolMulti, strAppendURL, funcCallback)
{
	if(boolMulti==undefined)boolMulti=true;
	if(strAppendURL==undefined)strAppendURL="";
	var strMulti = (boolMulti)?"1":"0";
	var strURL = "searchmode=1&multiselect=" + strMulti + "&" + strAppendURL;
	app.g.popup("search_ci",strURL,function(aForm)
	{
		var tmpObj = {};
		if (aForm)
		{
			if (IsObjectDefined("_bHtmlWebClient"))
			{
				var _swdoc = top;
				tmpObj.selectedkeys = aForm._swdoc.strSelectedKeys;
				tmpObj.selectedtext = aForm._swdoc.strSelectedText;
				tmpObj.selectedtypes = aForm._swdoc.strSelectedTypes;
				tmpObj.selecteddescs = aForm._swdoc.strSelectedDesc;
			}
			else
			{
				tmpObj.selectedkeys = aForm.document.strSelectedKeys;
				tmpObj.selectedtext = aForm.document.strSelectedText;
				tmpObj.selectedtypes = aForm.document.strSelectedTypes;
				tmpObj.selecteddescs = aForm.document.strSelectedDesc;
			}
		}
		else
		{
			tmpObj.selectedkeys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}	
	});	
}

//-- 07.02.2007 - RJC - Search for a service
oCMDB.prototype.search_for_service = cmdb_search_for_service;
function cmdb_search_for_service(boolMulti, strAppendURL, funcCallback)
{
	if(boolMulti==undefined)boolMulti=true;
	if(strAppendURL==undefined)strAppendURL="";
	var strMulti = (boolMulti)?"1":"0";
	var strURL = "searchmode=1&multiselect=" + strMulti + "&" + strAppendURL;
	app.g.popup("search_for_service",strURL,function(aForm)
	{
		var tmpObj = {};
		if (aForm)
		{
			if (IsObjectDefined("_bHtmlWebClient"))
			{
				var _swdoc = top;
				tmpObj.selectedkeys = aForm._swdoc.strSelectedKeys;
				tmpObj.selectedtext = aForm._swdoc.strSelectedText;
				tmpObj.selectedtypes = aForm._swdoc.strSelectedTypes;
				tmpObj.selecteddescs = aForm._swdoc.strSelectedDesc;
			}
			else
			{
				tmpObj.selectedkeys = aForm.document.strSelectedKeys;
				tmpObj.selectedtext = aForm.document.strSelectedText;
				tmpObj.selectedtypes = aForm.document.strSelectedTypes;
				tmpObj.selecteddescs = aForm.document.strSelectedDesc;
			}
		}
		else
		{
			tmpObj.selectedkeys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
	});	
}

//-- 07.02.2007 - RJC - Search for a service
oCMDB.prototype.search_service = cmdb_search_service;
function cmdb_search_service(boolMulti, strAppendURL, funcCallback)
{
	if(boolMulti==undefined)boolMulti=true;
	if(strAppendURL==undefined)strAppendURL="";
	var strMulti = (boolMulti)?"1":"0";
	var strURL = "searchmode=1&multiselect=" + strMulti + "&" + strAppendURL;
	app.g.popup("search_service",strURL,function(aForm)
	{
		var tmpObj = {};
		if (aForm)
		{
			if (IsObjectDefined("_bHtmlWebClient"))
			{
				var _swdoc = top;
				tmpObj.selectedkeys = aForm._swdoc.strSelectedKeys;
				tmpObj.selectedtext = aForm._swdoc.strSelectedText;
				tmpObj.selectedtypes = aForm._swdoc.strSelectedTypes;
				tmpObj.selecteddescs = aForm._swdoc.strSelectedDesc;
			}
			else
			{
				tmpObj.selectedkeys = aForm.document.strSelectedKeys;
				tmpObj.selectedtext = aForm.document.strSelectedText;
				tmpObj.selectedtypes = aForm.document.strSelectedTypes;
				tmpObj.selecteddescs = aForm.document.strSelectedDesc;
			}
		}
		else
		{
			tmpObj.selectedkeys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
	});	
}

//-- 20.10.2005
//-- NWJ
//-- relate a CI to a call record
oCMDB.prototype.relate_ci_to_call = cmdb_relate_ci_to_call;
function cmdb_relate_ci_to_call(intCallref,intCIkey,strCode)
{
	if(strCode==undefined)strCode = "";
	//- -nwj - use sqs - 11.2012
	var strParams = "cr=" + pfu(intCallref) + "&cid=" + pfu(intCIkey) + "&rel=" + pfu(strCode);
	return app.g.submitsqs("cmdb/relate_ci_to_call.insert",strParams);

}

//-- 20.10.2005
//-- NWJ
//-- remove a CI from a call record
oCMDB.prototype.unrelate_ci_from_call = cmdb_unrelate_ci_from_call;
function cmdb_unrelate_ci_from_call(intCallref,intCIkey,strCode)
{
	//--
	//-- nwj - 11.2012 - use sqs instead
	var strParams = "cr=" + pfu(intCallref) + "&cids=" + pfu(intCIkey);
	if(strCode!= undefined)strParams += "&rel=" + pfu(strCode);
	return app.g.submitsqs("cmdb/unrelate_ci_from_call.delete",strParams);

}

//-- 28.01.2009
//-- RJC
//-- relate a CI to a KB doc
//-- return a ci types parent types selfservice requests
oCMDB.prototype.get_citype_parentssrequests = cmdb_get_citype_parentssrequests;
function cmdb_get_citype_parentssrequests(strStartAtType)
{
	var reqTypeKeys = "";

	var p = {};
	p.pct = strStartAtType;
	var oRS = app.g.get_sqrecordset("cmdb/get_citype_parentssrequests.select",p);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"fk_typecode");
		if (reqTypeKeys!="")reqTypeKeys +=",";
		reqTypeKeys += currKey;
	}
	if(reqTypeKeys=="")reqTypeKeys="-1";
	return reqTypeKeys;
}

//-- 
//-- NWJ
//-- remove relation between passed in me keys and their cis
oCMDB.prototype.remove_me_ci_link = cmdb_remove_me_ci_link;
function cmdb_remove_me_ci_link(strMEKeys)
{
	//-- nwj - 11.2012 - use sqs instead
	var strParams = "mes=" + pfu(strMEKeys);
	app.g.submitsqs("cmdb/remove_me_ci_link.delete",strParams);
}

//-- 
//-- NWJ
//-- remove relation between passed in me keys and their cis
oCMDB.prototype.remove_ci_me_link = cmdb_remove_ci_me_link;
function cmdb_remove_ci_me_link(strCIids, strMeKeys)
{
	if(strMeKeys==undefined) strMeKeys="";
	//-- nwj - 11.2012 - use sqs instead
	var strParams = "mes=" + pfu(strMeKeys) + "&cids=" + pfu(strCIids);
	app.g.submitsqs("cmdb/remove_ci_me_link.delete",strParams);

}


//-- 
//-- NWJ
//-- get list of ci ids related to a managed entity
oCMDB.prototype.get_ci_company_ids= cmdb_get_ci_company_ids;
function cmdb_get_ci_company_ids(intCI,boolPFS)
{
	if(boolPFS==undefined)boolPFS=false;
	return this.get_ci_me_ids(intCI,"ME->COMPANY",boolPFS);

}

oCMDB.prototype.get_ci_customer_ids= cmdb_get_ci_customer_ids;
function cmdb_get_ci_customer_ids(intCI,boolPFS)
{
	if(boolPFS==undefined)boolPFS=false;
	return  this.get_ci_me_ids(intCI,"ME->CUSTOMER",boolPFS);
}

oCMDB.prototype.get_ci_site_ids= cmdb_get_ci_site_ids;
function cmdb_get_ci_site_ids(intCI,boolPFS)
{
	if(boolPFS==undefined)boolPFS=false;
	return  this.get_ci_me_ids(intCI,"ME->SITE",boolPFS);
}

//-- 
//-- NWJ - 
oCMDB.prototype.get_ci_me_ids= cmdb_get_ci_me_ids;
function cmdb_get_ci_me_ids(intCI,strMEType,boolPFS)
{
	//--TK SQL Optimisation Dont run if ID = 0;
	if(intCI==""||intCI==0) return "";
	if(boolPFS==undefined)boolPFS=false;
	var currKey="";
	var strReflist = "";

	var p = {};
	p.pt = strMEType;
	p.cids = intCI;
	var oRS = app.g.get_sqrecordset("cmdb/get_ci_me_ids.select",p);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_PARENT_ITEMTEXT");
		if (strReflist!="")strReflist +=",";
		if(boolPFS)currKey = currKey;
		strReflist += currKey;
	}
	return strReflist;
}


//-- 
//-- NWJ
//-- get list of ci ids related to a managed entity
oCMDB.prototype.get_me_cis = cmdb_get_me_cis;
function cmdb_get_me_cis(strMEKeys , strCode, strAddWhere , boolGetCustOwnedCis)
{

	if((strMEKeys=="") || (strMEKeys=="''")) return "-1";

	if(boolGetCustOwnedCis==undefined)boolGetCustOwnedCis=true;
	if(strAddWhere==undefined)strAddWhere="";
	if(strCode==undefined)strCode="";
	var strCIlist = "";
	var currKey = 0;
	//-- get related
	var p = {};
	p.mids = strMEKeys;
	p.rc = strCode;
	p.sf = strAddWhere;
	var oRS = app.g.get_sqrecordset("cmdb/get_customers_cikeys.select",p);
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CI_ID");
		if (strCIlist!="")strCIlist +=",";
		strCIlist += currKey;
	}

	if((strCode=="CUSTOMER")&&(boolGetCustOwnedCis))
	{
		//-- get owned cis
		var p = {};
		p.mids = strMEKeys;
		p.sf = strAddWhere;
		var oRS = app.g.get_sqrecordset("cmdb/get_customers_cikeys.select",p);
		while(oRS.Fetch())
		{
			currKey = app.g.get_field(oRS,"PK_AUTO_ID");
			if (strCIlist!="")strCIlist +=",";
			strCIlist += currKey;
		}
		//-- get related cis
		var p = {};
		p.mids = strMEKeys;
		p.sf = strAddWhere;
		var oRS = app.g.get_sqrecordset("cmdb/get_customers_cikeys_related.select",p);
		while(oRS.Fetch())
		{
			currKey = app.g.get_field(oRS,"FK_CI_ID");
			if (strCIlist!="")strCIlist +=",";
			strCIlist += currKey;
		}

	}
	if(strCIlist=="")strCIlist="0";
	return strCIlist;
}


//-- get site cis
oCMDB.prototype.get_site_cis = cmdb_get_site_cis;
function cmdb_get_site_cis(strSiteID)
{
	var strCIlist = "";
	var strTable = "CONFIG_ITEMI";

	var ap = {};
	ap.fk_site = strSiteID;
	var oRS = app.g.get_tablerecordset_bycol(strTable,ap,false,"pk_auto_id");

	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"PK_AUTO_ID");
		if (strCIlist!="")strCIlist +=",";
		strCIlist += currKey;
	}

	if(strCIlist=="")strCIlist="0";
	return strCIlist;
}

//-- get list of me ids related to a ci
oCMDB.prototype.get_ci_mes = cmdb_get_ci_mes;
function cmdb_get_ci_mes(strCIKeys , strCode, boolPassbackNumericKeys,boolGetCustOwnedCis)
{
	if(boolGetCustOwnedCis==undefined)boolGetCustOwnedCis=true;
	if(boolPassbackNumericKeys==undefined)boolPassbackNumericKeys=false;

	var strQ = (boolPassbackNumericKeys)?"":"'";
	var strMElist = "";

	var p ={};
	p.cids = strCIKeys;
	p.rc = strCode;
	var oRS = app.g.get_sqrecordset("cmdb/get_ci_mes.select",p);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_ME_KEY");
		if (strMElist!="")strMElist +=",";
		strMElist += currKey;
	}

	if((strCode=="CUSTOMER")&&(boolGetCustOwnedCis))
	{
		//-- get owners
		var p = {};
		p.cids = strCIKeys;
		var oRS = app.g.get_sqrecordset("cmdb/get_ci_userdbkey.select",p);
	
		//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
		while(oRS.Fetch())
		{
			currKey = app.g.get_field(oRS,"FK_USERDB");
			if (strMElist!="")strMElist +=",";
			strMElist += currKey;
		}
	}

	if(strMElist=="")strMElist=(boolPassbackNumericKeys)?"0":"-1";
	return strMElist;
}

//-- NWJ - 23.11.2012
oCMDB.prototype.get_parent_dependencies = cmdb_get_parent_dependencies;
function cmdb_get_parent_dependencies(intCI,bActiveOnly,bExclArchServices)
{
		var strRels = "-1";
		var p = {};
		p.cid = intCI;
		p.abln = (bActiveOnly)?"1":"0";
		p.exas = (bExclArchServices)?"1":"0";
		var oRS = app.g.get_sqrecordset("cmdb/common/get_parent_dependencies",p);
		while(oRS.Fetch())
		{
			strRelKey = app.g.get_field(oRS,"PK_AUTO_ID");
			strRels +=",";
			strRels += strRelKey;
		}

		return strRels;
}

oCMDB.prototype.get_child_dependencies = cmdb_get_child_dependencies;
function cmdb_get_child_dependencies(intCI,bActiveOnly)
{
		var strRels = "-1";
		var p = {};
		p.cid = intCI;
		p.abln = (bActiveOnly)?"1":"0";
		var oRS = app.g.get_sqrecordset("cmdb/common/get_child_dependencies",p);
		while(oRS.Fetch())
		{
			strRelKey = app.g.get_field(oRS,"PK_AUTO_ID");
			strRels +=",";
			strRels += strRelKey;
		}

		return strRels;
}

//-- 20.10.2005
//-- NWJ
//-- get list of ci ids related to a callref or callrefs
oCMDB.prototype.get_call_cis = cmdb_get_call_cis;
function cmdb_get_call_cis(intCallref , strCode, strAdditionalFilter)
{
	var strCIlist = "";
	if(strCode=="")strCode = null; 
	//-- nwj - use sqs - strAdditionalFilter should be a static.sql key value
	var p = {};
	//--TK SQL Optimisation
	if(intCallref==0) return 0;
	p.crs = intCallref;
	if(strCode!=undefined)p.rc = strCode;

	if(strAdditionalFilter!=undefined)p.sf = strAdditionalFilter;

	var oRS = app.g.get_sqrecordset("cmdb/get_call_cis.select",p);
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CI_AUTO_ID");
		if (strCIlist!="")strCIlist +=",";
		strCIlist += currKey;
	}
	if(strCIlist=="")strCIlist="0";
	return strCIlist;
}

//-- returns an object 
oCMDB.prototype.get_call_ci_info = cmdb_get_call_ci_info;
function cmdb_get_call_ci_info(intCallref , strCode,strAdditionalFilter)
{
	var strCIlist = "";
	var strCIlistText = "";
	var strCIlistType = "";

	//-- nwj - use sqs - strAdditionalFilter should be a static.sql key value
	var p = {};
	p.crs = intCallref;
	if(strCode!=undefined)p.rc = strCode;
	if(strAdditionalFilter!=undefined)p.sf = strAdditionalFilter;

	var oRS = app.g.get_sqrecordset("cmdb/get_call_ci_info.select",p);
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CI_AUTO_ID");
		currText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
		currType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
		if (strCIlist!="")
		{
			strCIlist +=",";
			strCIlistText +=",";
			strCIlistType +=",";
		}
		strCIlist += currKey;
		strCIlistText +=currText;
		strCIlistType +=currType;
	}

	var retObj = {};
	retObj.keys = strCIlist;
	_ete(retObj , strCIlistText);
	retObj.type = strCIlistType;
	return retObj;

}

// DTH: 20120504 Added the strFilter parameter so that the function will only get the call cis if this parameter is not set
oCMDB.prototype.sl_load_call_cis = cmdb_sl_load_call_cis;
function cmdb_sl_load_call_cis(oSqlList, intCallref , strCode,strAdditionalFilter, strFilter)
{
	if(strAdditionalFilter == undefined) strAdditionalFilter = "";
	if(strFilter == undefined) strFilter = "";
	
	if (strFilter == "")
	{
		strFilter = this.get_call_cis(intCallref , strCode,"");
	}

	//-- 21.11.2012 - nwj - dev is calling with a static filter - since we are now using sqs this needs to be migrated to server 
	if(strAdditionalFilter.indexOf(" ")>-1)
	{
		MessageBox("SqlTableList (" + oSqlList.name + ") Filter Set By : cmdb_sl_load_call_cis\n\n" + strAdditionalFilter + "\n\nThis passed in filter should be changed to a serverside static sql array key.");
	}

	//-- set to load by auto id - can use common script for this
	var oldSQ = oSqlList.storedQuery;
	oSqlList.storedQuery = "common.load_by_pkautoid";
	_slf(oSqlList , "pids=" + strFilter + "&sf=" + strAdditionalFilter);
	oSqlList.Refresh();
	oSqlList.SetRowSelected(0);
	oSqlList.storedQuery = oldSQ; //-- reset back
}

oCMDB.prototype.get_ci_relations = cmdb_get_ci_relations;
function cmdb_get_ci_relations(intCI , boolLoadParents,strFilter)
{
	if(strFilter==undefined) strFilter = "";
	var strReflist = "";
	var pKey = (boolLoadParents)?"FK_CHILD_ID":"FK_PARENT_ID";

	//-- nwj - use sqs - also removed the use of the strFilter param - could not find instances where it was used - nor this function
	var ap = {};
	ap[pKey] = intCI;
	var oRS = app.g.get_tablerecordset_bycol("CONFIG_RELI",ap,false,"PK_AUTO_ID");

	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"PK_AUTO_ID");
		if (strReflist!="")strReflist +=",";
		strReflist += currKey;
	}
	if(strReflist=="")strReflist="-1";
	return strReflist;
}


//--
//-- get a list avail records started on between two dates
oCMDB.prototype.get_availrecs_started_between = cmdb_get_availrecs_started_between;
function cmdb_get_availrecs_started_between(intCIID, intDateOneX, intDateTwoX)
{
	if(intDateOneX>intDateTwoX)
	{
		var tmpDateX = intDateOneX;
		intDateOneX = intDateTwoX;
		intDateTwoX = tmpDateX;
	}

	var p = {};
	p.cid = intCIID;
	p.d1x = intDateOneX;
	p.d2x = intDateTwoX
	return app.g.get_sqrecordset("cmdb/get_availrecs_started_between.select",p);
}

//-- update avail stats
oCMDB.prototype.update_avail_hist_stats = cmdb_update_avail_hist_stats;
function cmdb_update_avail_hist_stats(intCI)
{
	//-- nwj - 11.2012 - use sqs instead to process all of the sql actions used in this function
	var strParams = "cid=" + pfu(intCI);
	app.g.submitsqp("cmdb/process/update_avail_hist_stats",strParams);

/*

	var iTotal = 0;
	var iOpTotal = 0;
	var strSQL = "sxelect * from CI_AVAIL_HIST where FK_CI_ID = " + intCI;

	var oRS = app.g.gxet_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		iTotal = iTotal + Number(app.g.number_to_time(app.g.get_field(oRS,'downtime')));
		iOpTotal = iOpTotal + Number(app.g.number_to_time(app.g.get_field(oRS,'opdowntime')));
	}

	var iperc = (iOpTotal / iTotal) * 100;
	iperc = Math.round(100 - iperc);
	if(isNaN(iperc))iperc="100";
	
	iTotal = app.g.mins_from_perc(iTotal);
	iOpTotal = app.g.mins_from_perc(iOpTotal);

	var strSQL = "uxpdate config_itemi set totalopdowntime = '"+ iOpTotal+"', totaldowntime='"+ iTotal+"', percavailability = "+iperc+" where pk_auto_id = " + intCI;
	var oRS = app.g.gxet_recordset(strSQL,"swdata");
*/
}

//-- nwj black out cmdb form
oCMDB.prototype.disable_for_blackout = cmdb_disable_for_blackout;
function cmdb_disable_for_blackout(form,doc)
{
	//- -temp field used to indicate if blacked out
	if(doc.config_itemi.flg_validsupport=="1")
	{
		for(var x=0;x < form.elements.length;x++)
		{
			if(form.elements[x].type==9) continue;
			if(form.elements[x].dataRef!="")
			{
				if(form.elements[x].dataRef!="config_itemi.flg_validsupport")
					_een(form.elements[x], false);
			}
		}
	}
}

//-- nwj black out cmdb form
oCMDB.prototype.enable_for_blackout = cmdb_enable_for_blackout;
function cmdb_enable_for_blackout(form,doc)
{
	//- -temp field used to indicate if blacked out
	if(doc.config_itemi.flg_validsupport=="0")
	{
		for(var x=0;x < form.elements.length;x++)
		{
			if(form.elements[x].type==9) continue;
			if(form.elements[x].dataRef!="")
			{
				if(form.elements[x].dataRef!="config_itemi.flg_validsupport")
					_een(form.elements[x], true);
			}
		}
	}
}


oCMDB.prototype.get_ci_related_cis = cmdb_get_ci_related_cis;
function cmdb_get_ci_related_cis(intCI , boolLoadParents,strFilter)
{
	var strReflist = "";
	var pKey = (boolLoadParents)?"FK_CHILD_ID":"FK_PARENT_ID";
	var selKey = (boolLoadParents)?"FK_PARENT_ID":"FK_CHILD_ID";

	//-- nwj - use sqs - removed use of passed in strFilter
	var ap = {};
	ap[pKey] = intCI;
	var oRS = app.g.get_tablerecordset_bycol("CONFIG_RELI",ap,false,selKey);

	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,selKey);
		if (strReflist!="")strReflist +=",";
		strReflist += currKey;
	}
	if(strReflist=="")strReflist="-1";
	return strReflist;
}


oCMDB.prototype.sl_load_ci_relations = cmdb_sl_load_ci_relations;
function cmdb_sl_load_ci_relations(oSqlList, intCI , boolLoadParents,strFilter)
{
	if(strFilter==undefined) strFilter = "";
	var strReflist = "";

	//-- 21.11.2012 - nwj - dev is calling with a static filter - since we are now using sqs this needs to be migrated to server
	if(strFilter.indexOf(" ")>-1)MessageBox("SqlTableList (" + oSqlList.name + ") Filter Set By : cmdb_sl_load_ci_relations\n\n" + strFilter + "\n\nThis passed in filter should be changed to a serverside static sql array key.");
	
	var p = {};
	p.cid = intCI;
	p.blp = boolLoadParents;
	p.sf = strFilter;
	var oRS = app.g.get_sqrecordset("cmdb/sl_load_ci_relations.select",p);
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"PK_AUTO_ID");
		if (strReflist!="")strReflist +=",";
		strReflist += currKey;
	}
	if(strReflist=="")strReflist="-1";

	var oldSQ = oSqlList.storedQuery;
	oSqlList.storedQuery = "common.load_by_pkautoid";
	_slf(oSqlList , "pids=" + strReflist)
	oSqlList.SetRowSelected(0);
	oSqlList.storedQuery = oldSQ;

}


oCMDB.prototype.sl_load_ci_calls = cmdb_sl_load_ci_calls;
function cmdb_sl_load_ci_calls(oSqlList, intCI , strCode, strClass,strAdditionalFilter)
{
	var strAddfilter = "";
	var strRefFilter = this.get_ci_calls(intCI, strClass , strCode);
	if(strAdditionalFilter==undefined)strAdditionalFilter="";

	//-- 21.11.2012 - nwj - dev is calling with a static filter - since we are now using sqs this needs to be migrated to server 
	if(strAdditionalFilter.indexOf(" ")>-1)
	{
		MessageBox("SqlTableList (" + oSqlList.name + ") Filter Set By : cmdb_sl_load_ci_calls\n\n" + strAdditionalFilter + "\n\nThis passed in filter should be changed to a serverside static sql array key.");
	}

	//-- set to load by auto id - can use common script for this
	oSqlList.storedQuery = "common.load_by_callref";
	_slf(oSqlList , "crs=" + strRefFilter + "&sf=" + strAdditionalFilter);
	oSqlList.SetRowSelected(0);
}

//-- 20.10.2005
//-- NWJ
//-- get list of ci ids related to a callref
oCMDB.prototype.get_ci_calls = cmdb_get_ci_calls;
function cmdb_get_ci_calls(intCIid, strCallClass , strCode)
{
	if(strCallClass==undefined) strCallClass="";
	if(strCode==undefined)strCode="";

	var strReflist = "";
	var p = {};
	p.cc = strCallClass;
	p.cid = intCIid;
	p.rc = strCode;

	var oRS = app.g.get_sqrecordset("cmdb/get_ci_calls.select",p);
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CALLREF");
		if (strReflist!="")strReflist +=",";
		strReflist += currKey;
	}
	if(strReflist=="")strReflist="0";
	return strReflist;
}

//-- 03.03.2007
//-- NWJ
//-- create new ci
oCMDB.prototype.delete_configitem = cmdb_delete_configitem;
function cmdb_delete_configitem(strItems,boolDeleteBaselines)
{
	if(!this.can_delete(true)) return false;

	//-- nwj - 11.2012 - use sqs instead to process all of the sql actions used in this function
	var strParams = "bdb=" + pfu(boolDeleteBaselines) + "&cids=" + pfu(strItems);
	return app.g.submitsqs("cmdb/process/delete_configitem",strParams);
	/*

	//-- for each item delete relations from opencall records, delete diary, ci relations and baselines if selected
	var strDeleteCIs = "dxelete from CONFIG_ITEMI where PK_AUTO_ID in(" + strItems + ")";
	var strDeleteOCs = "dxelete from CMN_REL_OPENCALL_CI where FK_CI_AUTO_ID in(" + strItems + ")";
	var strDeleteRels = "dxelete from CONFIG_RELI where FK_CHILD_ID in(" + strItems + ") or FK_PARENT_ID in(" + strItems + ")";
	var strDeleteHistory = "dxelete from CONFIG_DIARY where FK_CI_ID in (" + strItems + ")";
	var strDeleteAvailHistory = "dxelete from CI_AVAIL_HIST where FK_CI_ID in (" + strItems + ")";
	var strDeleteCIServiceYypes = "dxelete from CT_PROFILES where FK_CONFIG_ITEM in (" + strItems + ")";
	var strDeleteEventActions = "dxelete from CI_AVAIL_ACTION where FK_CI_ID in (" + strItems + ")";
	var strDeleteBlackout = "dxelete from CI_BLACKOUT where FK_CI_ID = " + strItems + "";
	var strDeleteDML = "dxelete from CMDB_URI_LINK where FK_CI_ID in (" + strItems + ")";

	app.g.sxubmitsql(strDeleteOCs,true);
	app.g.sxubmitsql(strDeleteRels,true);
	app.g.sxubmitsql(strDeleteHistory,true);
	app.g.sxubmitsql(strDeleteAvailHistory,true);
	app.g.sxubmitsql(strDeleteOCs,true);
	app.g.sxubmitsql(strDeleteCIServiceYypes,true);
	app.g.sxubmitsql(strDeleteEventActions,true);
	app.g.sxubmitsql(strDeleteBlackout,true);
	app.g.sxubmitsql(strDeleteDML,true);

	//-- delete ci baselines so long as they are not active
	if(boolDeleteBaselines)
	{
		//-- for each ci get its baselineid and delete all those CI with the same one (only delete those that are older than one being deleted)
		var strDeleteBaselineKeys = "";
		var strSelectBaselines = "sxelect BASELINEID from CONFIG_ITEMI where PK_AUTO_ID in (" + strItems + ") and ISACTIVEBASELINE!='Yes'";
		var oRS = app.g.gxet_recordset(strSelectBaselines,"swdata");
		while(oRS.Fetch())
		{
			if (strDeleteBaselineKeys!="")strDeleteBaselineKeys +=",";
			strDeleteBaselineKeys = app.g.get_field(oRS,"BASELINEID");
		}
		
		//-- delete baselines
		if(strDeleteBaselineKeys!="")this.delete_configitem(strDeleteBaselineKeys,false);
	}

	var strExtRecords = "";
	var strSelectExtRecords  =  "sxelect distinct(extended_table) as tbl from config_itemi, config_typei where ck_config_type=pk_config_type and extended_table !='' and pk_auto_id in ("+strItems+")";
	var oRS = app.g.gxet_recordset(strSelectExtRecords,"swdata");
	while(oRS.Fetch())
	{
		var strExtRecords = app.g.get_field(oRS,"tbl");
		var strDeleteExtRecords = "dxelete from "+strExtRecords+" where pk_ci_id in ("+strItems+")";
		app.g.sxubmitsql(strDeleteExtRecords,true);
	}

	return app.g.sxubmitsql(strDeleteCIs,true);
	*/
}

//-- 03.03.2007
//-- NWJ
//-- create new ci
oCMDB.prototype.create_configitem = cmdb_create_configitem;
function cmdb_create_configitem(strAppendURL,boolModal,strType,funcCallback)
{
    if (!this.can_create())
    {
		MessageBox ("You are not authorised to create Configuration Items");
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(false);
		}
    }
	else
	{
		//-- handle optional params
		if (boolModal == undefined)boolModal=true;
		if (strAppendURL==undefined)strAppendURL="";
		if (strType==undefined) strType="";

		//-- Child function containing code for final part of parent function
		//-- As a result of modal changes, this code needed to be called twice
		var funcFinalProcessing = function(strType)
		{
			//-- manage url if we have one and set modal option
			var intModal = (boolModal)?1:0;
			var strURL = strAppendURL;
			if(strURL!="") strURL += "&";
			strURL += "FK_CONFIG_TYPE=" + pfu(strType);

			var ap = {};
			ap.fk_config_type = strType;
			var oRS = app.g.get_tablerecordset_bycol("config_type_def",ap);
			while(oRS.Fetch())
			{
				strDefaultField  = app.g.get_field(oRS,"targetbinding");
				strDefaultValue  = app.g.get_field(oRS,"defaultvalue");
				if(strURL!="") strURL += "&";
				strURL += strDefaultField+"=" + pfu(strDefaultValue);
			}
			//-- get type form and open for create
			//-- get configuration type extended form
			var strConfigForm = "cmdb_default_item";
			var oRS = app.g.get_sqrecordset("cmdb/common/select.config_type.extform","ct="+strType);
			while(oRS.Fetch())
			{
				//--TK IF detail from true then use it else use extended form
				var strDetailForm = app.g.get_field(oRS,"DETAIL_FORM");
				if(!strDetailForm)
				{
					strConfigForm = app.g.get_field(oRS,"EXTENDED_FORM");
				}else
				{
					strConfigForm = app.g.get_field(oRS,"DETAIL_FORM");
				}
			}
			app.OpenFormForAdd(strConfigForm,"",strURL,intModal,function()
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{	
					funcCallback();
				}
			});
		}
		
		//-- need to popup config type selector (as we need to know what type to create in order to get the correct form).
		if(strType=="")
		{
			this.select_configtype("Please select the type of item to create",true,function(strType)
			{
				if (strType=="")
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{	
						funcCallback(false);
					}
				}
				else
				{
					funcFinalProcessing(strType);
				}
			});
		}
		else
		{
			funcFinalProcessing(strType);
		}
	}
}


oCMDB.prototype.get_configtype_formname = cmdb_get_configtype_formname;
function cmdb_get_configtype_formname(strType,intCI)
{
	if(intCI==undefined)intCI=0;
	var strConfigForm = "cmdb_default_item";

	var ap = {};
	if(intCI==0)
	{
		ap.ct = strType;
	}
	else
	{
		ap.cid = intCIKey;
	}
	var oRS = app.g.get_sqrecordset("cmdb/common/select.config_type.extform",ap);
	while(oRS.Fetch())
	{
		strConfigForm = app.g.get_field(oRS,"EXTENDED_FORM");
	}

	return strConfigForm;
}


//-- manage ci relationship - popup search and then join selected cis
oCMDB.prototype.edit_configrelation = cmdb_edit_configrelation;
function cmdb_edit_configrelation(inRelKey, funcCallback)
{
	app.OpenFormForEdit("cmdb_editrelationship", inRelKey, "", true, function()
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
		}
	});
}

//-- manage ci relationship - popup search and then join selected cis
oCMDB.prototype.generate_configrelation = cmdb_generate_configrelation;
function cmdb_generate_configrelation(inKey,inType,inText,inBLN,boolinCIisParent, oCiRec, funcCallback)
{
	//-- get items to relate

	var strURL = "";
	//-- check if have company for ci - if so set url to use if
	if((oCiRec) && (oCiRec.fk_company_id!="")) strURL = "canreset=1&fk_company_id=" + oCiRec.fk_company_id;
	this.search_ci(true, strURL, function(oRes)
	{
		if(oRes.selectedkeys=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
		else
		{

			var arrayKeys = oRes.selectedkeys.split(",");
			var arrayText = oRes.selectedtext.split(",");
			var arrayType = oRes.selectedtypes.split(",");


			//-- prompt user to select dependancy type
			var strParentType = "";
			if(!boolinCIisParent)
			{
				//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
				for(var x=0; x < arrayType.length; x++)
				{
					if(strParentType!="")strParentType+=",";
					strParentType += arrayType[x];
				}
			}
			else
			{
				strParentType = inType;
			}
			
			var strArgs = "configitem=" + inKey + "&parenttype=" + strParentType + "&linkitems=" + oRes.selectedkeys;
			app.OpenFormForAdd("cmdb_relationship", "", strArgs, true, function(returnDoc)
			{
				if(!returnDoc.document.boolSaved)
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback(false);
					}
				}
				else
				{
					//-- get options that user selected
					var ynOperational = (returnDoc.document.operational=="1")?"Yes":"No";
					var strDependancy = returnDoc.document.relationtype;

					//-- inti vars
					var fetchKey=0;
					var fetchType = "";
					var fetchText = "";

					//-- select the the ci fetch data rows
					var oRS = app.g.get_sqrecordset("cmdb/common/select.config_items","cids="+arrayKeys.join(","));
					while(oRS.Fetch())
					{
						fetchKey  = app.g.get_field(oRS,"PK_AUTO_ID");
						fetchText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
						fetchType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
						fetchDesc = app.g.get_field(oRS,"DESCRIPTION");

							var sqlResult = false;
							if(boolinCIisParent)
							{
								//-- in ci is parent
								sqlResult = app.cmdb.insert_configrelation(inKey,inType,inText,fetchKey,fetchType,fetchText,strDependancy,ynOperational,oCiRec.description,fetchDesc);
							}
							else
							{
								//-- in ci is child
								sqlResult = app.cmdb.insert_configrelation(fetchKey,fetchType,fetchText,inKey,inType,inText,strDependancy,ynOperational,fetchDesc,oCiRec.description);
							}

							if(!sqlResult)
							{
								MessageBox("Failed to build relationship between [" + inText + "] and [" + fetchText + "]. Please contact your Supportworks Administrator");
							}
					}
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback(true);
					}
				}
				
			});
		}
	});
}

//RJC TODO split this up with the above function
//-- manage ci relationship - popup search and then join selected cis
oCMDB.prototype.generate_servicerelation = cmdb_generate_servicerelation;
function cmdb_generate_servicerelation(inKey,inType,inText,inBLN,boolinCIisParent, oCiRec, boolComponent, funcCallback)
{
	//-- get items to relate
	var strURL = "";
	//-- check if have company for ci - if so set url to use if
	if((oCiRec) && (oCiRec.fk_company_id!="")) strURL = "canreset=1&fk_company_id=" + oCiRec.fk_company_id;

	this.search_service(true, strURL, function(oRes)
	{
		if(oRes.selectedkeys=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
		else
		{
			var arrayKeys = oRes.selectedkeys.split(",");
			var arrayText = oRes.selectedtext.split(",");
			var arrayType = oRes.selectedtypes.split(",");

			var strKeys="";
			for(var x=0; x < arrayKeys.length; x++)
			{
				if(arrayKeys[x]!=inKey)
				{
					if(strKeys!="")strKeys+=",";
					strKeys += arrayKeys[x];
				}

			}

			if(strKeys=="")
			{
				MessageBox('Cannot associate a record to itself.');
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(false);
				}
			}
			else
			{
				//-- prompt user to select dependancy type
				var strParentType = "";
				if(!boolinCIisParent)
				{
					//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
					for(var x=0; x < arrayType.length; x++)
					{
						if(strParentType!="")strParentType+=",";
						strParentType += arrayType[x];
					}
				}
				else
				{
					//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
					strParentType = inType;
				}
				
				var strArgs = "configitem=" + inKey + "&parenttype=" + strParentType + "&linkitems=" + strKeys + "&comp=false";
				app.OpenFormForAdd("service_relationship", "", strArgs, true, function(returnDoc)
				{
					if(!returnDoc.document.boolSaved)
					{
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(false);
						}
					}
					else
					{
						//-- get options that user selected
						var ynOperational = (returnDoc.document.operational=="1")?"Yes":"No";
						var boolOptional = (returnDoc.document.optional=="1")?"1":"0";
						var strDependancy = returnDoc.document.relationtype;

						//-- inti vars
						var fetchKey=0;
						var fetchType = "";
						var fetchText = "";

						//-- select the the ci fetch data rows
						var oRS = app.g.get_sqrecordset("cmdb/common/select.config_items","cids="+strKeys);
						while(oRS.Fetch())
						{
							fetchKey  = app.g.get_field(oRS,"PK_AUTO_ID");
							fetchText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
							fetchType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
							fetchDesc = app.g.get_field(oRS,"DESCRIPTION");

							var sqlResult = false;
							if(boolinCIisParent)
							{
								//-- in ci is parent
								sqlResult = this.insert_configrelation(inKey,inType,inText,fetchKey,fetchType,fetchText,strDependancy,ynOperational,oCiRec.description,fetchDesc,boolOptional);
							}
							else
							{
								//-- in ci is child
								sqlResult = this.insert_configrelation(fetchKey,fetchType,fetchText,inKey,inType,inText,strDependancy,ynOperational,fetchDesc,oCiRec.description,boolOptional);
							}
							if(!sqlResult)
							{
								MessageBox("Failed to build relationship between [" + inText + "] and [" + fetchText + "]. Please contact your Supportworks Administrator");
							}
						}
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(true);
						}
					}
				});
			}
		}
	});
}

//-- create ci to ci rel i.e. hardware etc
oCMDB.prototype.insert_configrelation = cmdb_insert_configrelation;
function cmdb_insert_configrelation(parentKey,parentType,parentText, childKey,childType,childText,strDependancy,ynOperational, strParentDesc, strChildDesc,boolOption)
{
		if(strParentDesc==undefined)strParentDesc = "";
		if(strChildDesc==undefined)strChildDesc = "";
		if(boolOption==undefined)boolOption = "0";

		//-- nwj - 11.2012 - use sqs instead to process all of the sql actions used in this function
		var strParams = "parentKey=" + pfu(parentKey) + "&parentType=" + pfu(parentType) + "&parentText=" + pfu(parentText) + "&childKey=" + pfu(childKey) + "&childType=" + pfu(childType) + "&childText=" + pfu(childText) + "&strDependancy=" + pfu(strDependancy)+ "&ynOperational=" + pfu(ynOperational) + "&strParentDesc=" + pfu(strParentDesc)+ "&strChildDesc=" + pfu(strChildDesc) + "&boolOption=" + pfu(boolOption);
		return app.g.submitsqs("cmdb/process/insert_configrelation",strParams);

}

//-- create me / ci relationship with popup to set relationship type
oCMDB.prototype.generate_meconfigrelation = cmdb_generate_meconfigrelation;
function cmdb_generate_meconfigrelation(inKey, strSelectedCIIDs,strDependancy, ynOperational)
{

	if(strDependancy==undefined)strDependancy="";
	if(ynOperational==undefined)ynOperational="No";

	//-- get ME CI from cmdb
	var oRS = app.g.get_sqrecordset("cmdb/common/select.config_item.basicinfo","cid="+inKey);
	if(oRS.Fetch())
	{
		var inText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
		var inType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
		var inDesc = app.g.get_field(oRS,"DESCRIPTION");
	}
	else
	{
		return false;
	}
	
	//-- we have not selected a dependancy so create default
	if(strDependancy=="")
	{	
		var ap = {};
		ap.fk_config_type = inType;
		var oRS = app.g.get_tablerecordset_bycol("ct_reltypes",ap);

		if(oRS.Fetch())
		{
			strDependancy = app.g.get_field(oRS,"fk_reltype");
			ynOperational = "No";
		}
		else
		{
			MessageBox("Could not create dependency because no relationship types exist");
			return false;
		}
	}
	else
	{
		//-- see if passed in rel type exists - if not create
		this.ci_relationship_exists(strDependancy,true);
	}


	//-- inti vars
	var fetchKey=0;
	var fetchType = "";
	var fetchText = "";

	//-- select the the ci fetch data rows
	strSelectedCIIDs +="";
	var arrayKeys = strSelectedCIIDs.split(",");
	var oRS = app.g.get_sqrecordset("cmdb/common/select.config_items","cids="+strSelectedCIIDs);

	while(oRS.Fetch())
	{
		fetchKey  = app.g.get_field(oRS,"PK_AUTO_ID");
		fetchText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
		fetchType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
		fetchDesc = app.g.get_field(oRS,"DESCRIPTION");

		var sqlResult = false;
		//-- in ci is parent
		sqlResult = this.insert_configrelation(inKey,inType,inText,fetchKey,fetchType,fetchText,strDependancy,ynOperational,inDesc,fetchDesc);

		if(!sqlResult)
		{
			MessageBox("Failed to build relationship between [" + inText + "] and [" + fetchText + "]. Please contact your Supportworks Administrator");
		}
	}

	return true;

}

//--delete me ci to ci i.e. customer uses ci
oCMDB.prototype.delete_meconfigrelation = cmdb_delete_meconfigrelation;
function cmdb_delete_meconfigrelation(intMeCIKey, strChildKeys)
{
	//var strDelete = "dxelete from CONFIG_RELI where FK_PARENT_ID = " + intMeCIKey + " and FK_CHILD_ID in ("+strChildKeys+")";	
	//return app.g.sxubmitsql(strDelete,true); 
	//-- nwj - 11.2012 - replace sql with sqs
	var strParams = "ci=" + pfu(intMeCIKey) + "&cks=" + pfu(strChildKeys);
	app.g.submitsqs("cmdb/delete_meconfigrelation.delete",strParams);


}

//--delete child me ci to parent ci i.e. sites at company
oCMDB.prototype.delete_child_meconfigrelation = cmdb_delete_child_meconfigrelation;
function cmdb_delete_child_meconfigrelation(intMeChildCIKeys, strParentType)
{
	//var strDelete = "dxelete from CONFIG_RELI where FK_CHILD_ID in (" + intMeChildCIKeys + ") and FK_PARENT_TYPE = '" + app.g.pfs(strParentType) + "'";	
	//return app.g.sxubmitsql(strDelete,true);
	//-- nwj - 11.2012 - replace sql with sqs
	var strParams = "parenttype=" + pfu(strParentType) + "&childkeys=" + pfu(intMeChildCIKeys);
	app.g.submitsqs("cmdb/delete_child_meconfigrelation.delete",strParams);

}


//--create me ci to ci i.e. customer uses ci
oCMDB.prototype.insert_meconfigrelation = cmdb_insert_meconfigrelation;
function cmdb_insert_meconfigrelation(intMeCIKey, childKey,childType,childText,strDependancy,ynOperational,strDescription)
{
	if (strDescription == undefined)strDescription="";
	//-- nwj - 11.2012 - replace sql with sqs
	var strParams = "intMeCIKey=" + pfu(intMeCIKey) + "&childKey=" + pfu(childKey) + "&childType=" + pfu(childType) + "&childText=" + pfu(childText) + "&strDependancy=" + pfu(strDependancy) + "&ynOperational=" + pfu(ynOperational) + "&strDescription=" + pfu(strDescription);
	return app.g.submitsqs("cmdb/process/insert_meconfigrelation",strParams); 

	//-- get ME CI from cmdb
	/*
	var strSQL = "sxelect PK_AUTO_ID,CK_CONFIG_ITEM,CK_CONFIG_TYPE from CONFIG_ITEMI where PK_AUTO_ID = " + intMeCIKey;
	var oRS = app.g.gxet_recordset(strSQL,"swdata");
	if(oRS.Fetch())
	{
		var fetchKey  = app.g.get_field(oRS,"PK_AUTO_ID");
		var fetchText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
		var fetchType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
		
		var strInsert = "ixnsert into CONFIG_RELI (FK_PARENT_ID, FK_PARENT_TYPE, FK_PARENT_ITEMTEXT, FK_CHILD_ID, FK_CHILD_TYPE, FK_CHILD_ITEMTEXT, FK_DEPENDENCY_TYPE, FLG_OPERATIONAL) values ";	
		strInsert += " (" + fetchKey + ",'" + app.g.pfs(fetchType) + "','" + app.g.pfs(fetchText) + "'," + childKey + ",'" + app.g.pfs(childType) + "','" + app.g.pfs(childText) + "','" + app.g.pfs(strDependancy) + "','" + ynOperational + "')";	

		return app.g.sxubmitsql(strInsert,true);
	}
	else
	{
		return false;
	}
	*/
}


//-- 03.03.2005
//-- NWJ
//-- Popup CI form
oCMDB.prototype.popup_configitem = cmdb_popup_configitem;
function cmdb_popup_configitem(intCIKey,boolForEdit,strAppendURL,boolModal,funcCallback)
{
	//-- if creating check for perm
	if((!boolForEdit) && (!this.can_create(true)))
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(false);
		}
	}
	else
	{
		//-- handle optional params
		if (boolModal == undefined)boolModal=false;
		if (strAppendURL==undefined)strAppendURL="";
		if(intCIKey>0)boolForEdit=true;

		//-- manage url if we have one
		var strURL = strAppendURL;

		//-- open for edit or add
		if (boolForEdit)
		{
			//-- get configuration type extended form
			var strConfigExtTable = "";
			var strConfigType = "";
			var strConfigForm = "cmdb_default_item";
			var oRS = app.g.get_sqrecordset("cmdb/popup_configitem.select","cid=" + intCIKey);
			if(oRS.Fetch())
			{
				strConfigItem = app.g.get_field(oRS,"CK_CONFIG_ITEM");
				strConfigForm = app.g.get_field(oRS,"EXTENDED_FORM");
				strConfigType = app.g.get_field(oRS,"PK_CONFIG_TYPE");
				strConfigExtTable = app.g.get_field(oRS,"EXTENDED_TABLE");
				//--TK New Details records
				strDetailForm = app.g.get_field(oRS,"DETAIL_FORM");
				if(strConfigExtTable!="")
				{
					//-- check if we have a record in ext table for this ci
					this.setup_extended_record(intCIKey, strConfigType,true);
				}
			}
			//--TK if we have a detail form record then open new single form else behave as normal
			if(strDetailForm)
			{
				//-- if viewing check for perm
				if((boolForEdit) && (!this.can_view(true)))
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback(false);
					}
				}
				else
				{
					app.OpenFormForEdit(strDetailForm,intCIKey,strURL,boolModal,function()
					{
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(true);
						}
					});
				}
				
			}
			else
			{
				//-- F0097872
				//-- if an me load me form
				if(app.g.instr(strConfigType,"ME->"))
				{
					if(app.g.instr(strConfigType,"ME->SERVICE"))
					{
						//-- if viewing check for perm
						if((boolForEdit) && (!app.service.can_view(true)))
						{
							if ((funcCallback != undefined) && (funcCallback != null))
							{
								funcCallback(false);
							}
						}
						else
						{
							app.OpenFormForEdit(strConfigForm,intCIKey,strURL,boolModal,function()
							{
								if ((funcCallback != undefined) && (funcCallback != null))
								{
									funcCallback();
								}
							});
						}
					}
					else
					{
						//-- if viewing check for perm
						if((boolForEdit) && (!this.can_view(true)))
						{
							if ((funcCallback != undefined) && (funcCallback != null))
							{
								funcCallback(false);
							}
						}
						else
						{
							app.OpenFormForEdit(strConfigForm,strConfigItem,strURL,boolModal,function()
							{
								if ((funcCallback != undefined) && (funcCallback != null))
								{
									funcCallback();
								}
							});
						}
					}
				}
				else
				{
					//-- if viewing check for perm
					if((boolForEdit) && (!this.can_view(true)))
					{
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(false);
						}
					}
					else
					{
						app.OpenFormForEdit(strConfigForm,intCIKey,strURL,boolModal,function()
						{
							if ((funcCallback != undefined) && (funcCallback != null))
							{
								funcCallback();
							}
						});
					}
				}
			}
		}
		else
		{
			this.create_configitem(strAppendURL,boolModal,"",function()
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback();
				}
			});
		}
	}
}


oCMDB.prototype.reactivate_baseline = cmdb_reactivate_baseline;
function cmdb_reactivate_baseline(intCIkey, intOldCIkey, funcCallback)
{

	var objCIFormDoc = this;
	//-- nwj - 11.2012 - replace sql with sqs
	var strParams = "intCIkey=" + pfu(intCIkey) + "&intOldCIkey=" + pfu(intOldCIkey);
	var res = app.g.submitsqs("cmdb/process/reactivate_baseline",strParams); 
	if(res)
	{
		//-- prompt them for a diary update
		if(dd.GetGlobalParamAsNumber("Application Settings/CMDB/OnBaselinePromptDiary")==1)
		{
			//-- Check how many diary entries already exist
			var arrParams = {};	
			arrParams.fk_ci_id = intOldCIkey;
			var intCountDiaryEntries = app.g.sqs_rowcountbycol("config_diary",arrParams);

			var strURL = "config_diary.updatetxt=Configuration Item made an inactive baseline due to re-activating previous baseline.&config_diary.analystid=" + app.session.analystId + "&config_diary.fk_ci_id=" + intOldCIkey+"&config_diary.udcode=Re-Activated Baseline";
			objCIFormDoc.create_diaryentry(intCIkey, strURL, function()
			{
				//-- Check if diary form was closed without adding record, if so then add a default record
				var intNewCountDiaryEntries = app.g.sqs_rowcountbycol("config_diary",arrParams);
				if((intCountDiaryEntries*1)==(intNewCountDiaryEntries*1))
				{
					objCIFormDoc.insert_diaryentry(intOldCIkey, "Auto Update", "Re-Activated Baseline", app.session.analystId, app.g.todaysdate_epoch(), "Configuration Item made an inactive baseline due to re-activating previous baseline.", 0)
				}
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(res);
				}
			});
		}
	}
	else
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(res);
		}
	}
	

}


oCMDB.prototype.create_baseline = cmdb_create_baseline;
function cmdb_create_baseline(intCIkey, intBLNid,strCIType, boolUpdateOrig, intDiaryRowCount, boolFromComponent, strComponent, funcCallback)
{
	var objCIFormDoc = this;
	
	var funcFinalProcessing = function()
	{
		//-- Check if diary form was closed without adding record, if so then add a default record
		var intNewCountDiaryEntries = app.g.sqs_rowcountbycol("config_diary",arrParams);
		if((intCountDiaryEntries*1)==(intNewCountDiaryEntries*1))
		{
			objCIFormDoc.insert_diaryentry(intCIkey, "Auto Update", "Baselined", app.session.analystId, app.g.todaysdate_epoch(), "Configuration Item Baselined.", 0)
		}
		objCIFormDoc.copy_diaryentries(intCIkey, newCIkey);
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(newCIkey);
		}
	}
	
	if(boolUpdateOrig==undefined)boolUpdateOrig=true;
	if(intDiaryRowCount==undefined)intDiaryRowCount=0;
	if(boolFromComponent==undefined || strComponent == undefined) boolFromComponent=false;
	
	//-- get baseline count for item	
    //var strSelectBLN = "sxelect max(CK_BASELINEINDEX) from CONFIG_ITEMI where BASELINEID = " + intBLNid;
    //var oRS = app.g.gxet_recordset(strSelectBLN,"swdata");
	//-- nwj - 11.2012 - replace with storedQuery
	var strParams = "intBLNid=" + pfu(intBLNid);
	var oRS = app.g.get_sqrecordset("cmdb/common/select.max_baselineindex",strParams);

    var maxbln = -1;
    while(oRS.Fetch())
    {
        maxbln = oRS.GetValueAsString(0);
    }

	//- -do we have bln
	if(maxbln==-1)
	{
		MessageBox("A problem occured when baselining this item. The baseline index could not be determined. Please contact your Supportworks administrator");
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(-1);
		}
	}
	else
	{
		//-- nwj - 11.2012 - replace with storedQuery
		var strParams = "cid=" + pfu(intCIkey);
		var oRS = app.g.get_sqrecordset("cmdb/common/select.config_item",strParams);
		if(!oRS.Fetch())
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(-1);
			}
		}
		else
		{


			//-- set new fields for copy record
			var strTable = "config_itemi";
			var strParams = "table=config_itemi";

			for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
			{
				var colName = dd.tables[LC(strTable)].columns[x].Name;
				var colValue = app.g.get_field(oRS,colName);

				if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
				{
					//-- check for iscurrentversion and bln
					if (UC(colName) == "CK_BASELINEINDEX") colValue = ++maxbln;
					if (UC(colName) == "ISACTIVEBASELINE") colValue = "Yes";
					
					if(	strParams != "")strParams += "&";
					strParams += "_swc_" + LC(colName) + "="+ pfu(colValue); //-- _swc_ prefix so php sq can id passed in column params
				}
			}

			//-- submit then get new ci id
			//var strInsertSQL = "ixnsert into " + UC(strTable) + " ( " + strCols + ") values (" + strValues + ")";
			//if (app.g.sxubmitsql(strInsertSQL,true))
			//{
			//-- nwj - 11.2012 - replace sql with sqs
			if(app.g.submitsqs("insert.table",strParams))
			{
				//var strSelect = "sxelect max(PK_AUTO_ID) from CONFIG_ITEMI where BASELINEID = " + intBLNid;
				//var oRS = app.g.gxet_recordset(strSelect,"swdata");
				var strParams = "intBLNid=" + pfu(intBLNid);
				var oRS = app.g.get_sqrecordset("cmdb/common/select.max_ciid_from_blnid",strParams);

				var newCIkey = 0;
				while(oRS.Fetch())
				{
					newCIkey = oRS.GetValueAsString(0);
				}

				//-- create/copy extended table record
				this.copy_extended_record(intCIkey, newCIkey, strCIType);

				//-- set original ci isactivebaseline to No
				if(boolUpdateOrig)
				{
					//var strUpdate = "uxpdate " + UC(strTable) + " set ISACTIVEBASELINE = 'No' where PK_AUTO_ID = " + intCIkey;
					//app.g.sxubmitsql(strUpdate,true);
					//-- nwj - 11.2012 - replace sql with sqs
					var strParams = "intCIkey=" + intCIkey;
					app.g.submitsqs("cmdb/common/deactivate.baseline",strParams);

				}

				//-- copy relationships, service types and call diary
				this.copy_relations(intCIkey,newCIkey);
				this.copy_merelations(intCIkey, newCIkey);
				this.copy_servicetypes(intCIkey, newCIkey);
				this.copy_eventactions(intCIkey, newCIkey);
				this.copy_blackout(intCIkey, newCIkey);
				this.copy_dml_uri(intCIkey, newCIkey);
				//this.copy_ola_tasks(intCIkey, newCIkey);
				this.copy_kb_assocs(intCIkey, newCIkey);
				this.copy_targets(intCIkey, newCIkey);

				if(strCIType.toUpperCase()=="ME->SERVICE")
				{
					app.service.baseline_create(intCIkey, newCIkey);
				}

				//-- prompt them for a diary update - this will be in old ci and new ci
				if(dd.GetGlobalParamAsNumber("Application Settings/CMDB/OnBaselinePromptDiary")==1)
				{
					//-- Check how many diary entries already exist
					var arrParams = {};	
					arrParams.fk_ci_id = intCIkey;
					var intCountDiaryEntries = app.g.sqs_rowcountbycol("config_diary",arrParams);

					//-- Open form for analyst to add entry
					var strURL = "config_diary.updatetxt=Configuration Item Baselined.&config_diary.analystid=" + app.session.analystId + "&config_diary.fk_ci_id=" + intCIkey+"&config_diary.udcode=Baselined";
					
					if(!boolFromComponent)
					{
						objCIFormDoc.create_diaryentry(intCIkey, strURL, function()
						{
							funcFinalProcessing();
						});
					}
					else
					{
						objCIFormDoc.insert_diaryentry(intCIkey, "Auto Update", "Baselined", app.session.analystId, app.g.todaysdate_epoch(), "Configuration Item Baselined due to component Configuration Item (" + strComponent + ") being baselined.", 0)
						funcFinalProcessing();
					}
				}
			}
			else
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(-1);
				}
			}
		}
	}
}

oCMDB.prototype.copy_eventactions = cmdb_copy_eventactions;
function cmdb_copy_eventactions(intCopyFromCIKey, intCopyToCIkey)
{	
	//-- nwj - 11.2012 - use stored query
	var strParams = "table=ci_avail_action&fkc=fk_ci_id&fkv=" + pfu(intCopyFromCIKey) + "&ctkv=" + pfu(intCopyToCIkey);
	app.g.submitsqs("copy.record",strParams);
}

oCMDB.prototype.copy_kb_assocs = cmdb_copy_kb_assocs;
function cmdb_copy_kb_assocs(intCopyFromCIKey, intCopyToCIkey)
{	
	//-- nwj - 11.2012 - use stored query
	var strParams = "table=config_relkb&fkc=fk_ci_id&fkv=" + pfu(intCopyFromCIKey) + "&ctkv=" + pfu(intCopyToCIkey);
	app.g.submitsqs("copy.record",strParams);
}

oCMDB.prototype.copy_targets = cmdb_copy_targets;
function cmdb_copy_targets(intCopyFromCIKey, intCopyToCIkey)
{	
	//-- nwj - 11.2012 - use stored query
	var strParams = "table=sc_target&fkc=fk_auto_id&fkv=" + pfu(intCopyFromCIKey) + "&ctkv=" + pfu(intCopyToCIkey);
	app.g.submitsqs("copy.record",strParams);
}

oCMDB.prototype.copy_blackout = cmdb_copy_blackout;
function cmdb_copy_blackout(intCopyFromCIKey, intCopyToCIkey)
{	
	//-- nwj - 11.2012 - use stored query
	var strParams = "table=ci_blackout&fkc=fk_ci_id&fkv=" + pfu(intCopyFromCIKey) + "&ctkv=" + pfu(intCopyToCIkey);
	app.g.submitsqs("copy.record",strParams);
}

oCMDB.prototype.copy_dml_uri = cmdb_copy_dml_uri;
function cmdb_copy_dml_uri(intCopyFromCIKey, intCopyToCIkey)
{
	//-- nwj - 11.2012 - use stored query
	var strParams = "table=cmdb_uri_link&fkc=fk_ci_id&fkv=" + pfu(intCopyFromCIKey) + "&ctkv=" + pfu(intCopyToCIkey);
	app.g.submitsqs("copy.record",strParams);

}

oCMDB.prototype.create_clone = cmdb_create_clone;
function cmdb_create_clone(intCIkey, intBLNid, strCIType, intNumberOfCopies)
{
	var strParams = "cid="+intCIkey+"&bln="+intBLNid+"&cit=" + pfu(strCIType) + "&noc=" + pfu(intNumberOfCopies);
	if(app.g.submitsqp("cmdb/process/create_clone",strParams))return 0;
	return -1;

	//-- copy the CI
	/*
    var strSelectCI = "sxelect * from CONFIG_ITEMI where PK_AUTO_ID = " + intCIkey;
    var oRS = app.g.gxet_recordset(strSelectCI,"swdata");
    while(oRS.Fetch())
   {
		//-- set new fields for copy record
		var strTable = "config_itemi";
		var strCols	 = "";
		var strValues= "";
		var strCK_CONFIG_ITEM = "";
		for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
		{
			var colName = dd.tables[LC(strTable)].columns[x].Name;
			var colValue = app.g.get_field(oRS,colName);

			//-- F0099089, check if column is numeric, and if so correct to positive values
			var aCol = dd.tables[LC(strTable)].columns[x];
			var strEncaps = (aCol.IsNumeric())?"":"'";
			if(strEncaps=="" && colValue<0)
			{
			   colValue = app.g.fix_epoch(colValue);
			}

			if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
			{
				if(	strCols != "")strCols += ",";
				strCols += UC(colName);

				if (UC(colName) == "CK_CONFIG_ITEM") strCK_CONFIG_ITEM = colValue;
				//-- check for iscurrentversion and bln
				if (UC(colName) == "CK_BASELINEINDEX") colValue = 0;
				if (UC(colName) == "ISACTIVEBASELINE") colValue = "Yes";

				if(	strValues != "")strValues += ",";
				strValues +=  app.g.encapsulate(strTable,colName,colValue);
			}
		}
	}

	//Get existing clones
	var strSelect = "sxelect max(PK_AUTO_ID) from CONFIG_ITEMI where ck_config_item LIKE 'CLONE__"+strCK_CONFIG_ITEM+"__%'"
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	var pk_auto_id = 0;

	while(oRS.Fetch())
	{
		pk_auto_id = oRS.GetValueAsString(0);
	}

	//get the ck_config_item of the latest existing clones
	var strSelect = "sxelect ck_config_item from CONFIG_ITEMI where pk_auto_id = "+pk_auto_id;
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	var strId = "";
	while(oRS.Fetch())
	{
		strId = oRS.GetValueAsString(0);
	}

	
	var strTemp = "CLONE__"+strCK_CONFIG_ITEM+"__";
	var offset = strId.substr(strTemp.length);
	if(isNaN(offset) || offset=="")
		offset = 0;
	var until = 1+parseInt(offset)+parseInt(intNumberOfCopies);
	offset = parseInt(offset)+1;

	for(var i = offset;i<until;i++)
	{
		//-- submit then get new ci id
		var strInsertSQL = "ixnsert into " + UC(strTable) + " ( " + strCols + ") values (" + strValues + ")";
		if (app.g.sxubmitsql(strInsertSQL,true))
		{
			var strSelect = "sxelect max(PK_AUTO_ID) from CONFIG_ITEMI where BASELINEID = " + intBLNid;
			var oRS = app.g.gxet_recordset(strSelect,"swdata");
			var newCIkey = 0;
			while(oRS.Fetch())
			{
				newCIkey = oRS.GetValueAsString(0);
			}

			//refresh record to make 'new' reset name, baselineid
			var strUpdate = "uxpdate " + UC(strTable) + " set BASELINEID = "+newCIkey+",ck_config_item = 'CLONE__"+strCK_CONFIG_ITEM+"__"+i+"'  where PK_AUTO_ID = " + newCIkey;
			app.g.sxubmitsql(strUpdate,true);

			//-- create/copy extended table record
			this.copy_extended_record(intCIkey, newCIkey, strCIType);

			//-- copy relationships, service types and call diary
			this.clone_relations(intCIkey,newCIkey,'CLONE__'+strCK_CONFIG_ITEM+"__"+i);
			this.copy_merelations(intCIkey, newCIkey);
			this.copy_eventactions(intCIkey, newCIkey);
			this.copy_blackout(intCIkey, newCIkey);
			this.copy_dml_uri(intCIkey, newCIkey);
			this.copy_kb_assocs(intCIkey, newCIkey);

			//-- copy service types to new CI
			this.copy_full_servicetypes(intCIkey, newCIkey);
		   // return newCIkey;
		}
		else
		{
			return -1;
		}
	}
	return 0;
	*/
}

oCMDB.prototype.create_ci = cmdb_create_ci;
function cmdb_create_ci(strCIType, intNumberOfCopies)
{
	var strParams = "cit=" + pfu(strCIType) + "&noc=" + pfu(intNumberOfCopies);
	if(app.g.submitsqp("cmdb/process/create_ci",strParams))return 0;
	return -1;

	//-- copy the CI
	/*
    var strSelectCI = "sxelect * from CONFIG_TYPEI where flg_item=1 and PK_CONFIG_TYPE = '" + strCIType + "'";
    var oRS = app.g.gxet_recordset(strSelectCI,"swdata");
    if(oRS.Fetch())
   {
		var strExtTable = app.g.get_field(oRS,"extended_table");
		var strExtCols	 = "";
		var strExtValues= "";
		var strTable = "config_itemi";
		var strCols	 = "";
		var strValues= "";
		var strWhere = "";
		var boolDesc = false;

		var strSelectDefaults = "sxelect * from CONFIG_TYPE_DEF where FK_CONFIG_TYPE = '" + strCIType + "'";
		var oDefaults = app.g.gxet_recordset(strSelectDefaults,"swdata");
		while(oDefaults.Fetch())
	   {
			var colTarget = app.g.get_field(oDefaults,"targetbinding");
			var arrTarget = colTarget.split(".");
			var strTargetTable = arrTarget[0];
			var colName = arrTarget[1];
			var colValue = app.g.get_field(oDefaults,"defaultvalue");
			if(strTargetTable==strTable)
		    {
				if(UC(colName) == "DESCRIPTION")
					boolDesc = true;

				if (UC(colName) == "CK_CONFIG_ITEM" || UC(colName) == "CK_CONFIG_TYPE")
				{

				}else if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
				{
					if(	strCols != "")strCols += ",";
					strCols += UC(colName);

					if(	strValues != "")strValues += ",";
					strValues +=  app.g.encapsulate(strTable,colName,colValue);

					if(strWhere !="") strWhere +=" and ";
					strWhere +=  UC(colName)+"="+app.g.encapsulate(strTable,colName,colValue);
				}
		   }else if(strTargetTable==strExtTable)
		   {
				if (colName.toUpperCase() != app.g.dd_primarykey(strExtTable).toUpperCase())
				{
					if(	strExtCols != "")strExtCols += ",";
					strExtCols += UC(colName);

					if(	strExtValues != "")strExtValues += ",";
					strExtValues +=  app.g.encapsulate(strExtTable,colName,colValue);
				}
		   }
	   }
	   if(strCols!="")
	   {
			strCols += ",ck_config_type,flg_canrename";
			strValues += ",'"+strCIType+"',1";
			strWhere +=" and ck_config_type='"+strCIType+"' and flg_canrename=1";
		   if(strCols.indexOf("isactivebaseline")<0)
		   {
				strCols += ",isactivebaseline";
				strValues += ",'Yes'";
				strWhere +=" and isactivebaseline='Yes'";
		   }
		   if(strCols.indexOf("isunavailable")<0)
		   {
				strCols += ",isunavailable";
				strValues += ",'No'";
				strWhere +=" and isunavailable='No'";
		   }
		   if(strCols.indexOf("isauthorised")<0)
		   {
				strCols += ",isauthorised";
				strValues += ",'Yes'";
				strWhere +=" and isauthorised='Yes'";
		   }
		   if(strCols.indexOf("appcode")<0)
		   {
				strCols += ",appcode";
				strValues += ",'"+app.session.dataDictionary+"'";
				strWhere +=" and appcode='"+app.session.dataDictionary+"'";
		   }

	   }else
	   {
			strCols = "isactivebaseline,isunavailable,isauthorised,ck_config_type,flg_canrename,appcode";
			strValues = "'Yes','No','Yes','"+strCIType+"',1,'"+app.session.dataDictionary+"'";
			strWhere = "isactivebaseline='Yes' and isunavailable='No' and isauthorised='Yes' and ck_config_type = '"+strCIType+"' and flg_canrename=1 and appcode='"+app.session.dataDictionary+"'";
	   }
	   if(!boolDesc)
	   {
			var strDesc = app.g.get_field(oRS,"notes");
			strCols += ",DESCRIPTION";
			strValues += ",'"+strDesc+"'";
			strWhere +=" and DESCRIPTION='"+strDesc+"'";
	   }

	}else
	{
		MessageBox("Cannot create Configuration Items of type '"+strCIType+"' as this is not an Item Type.");
		return false;
	}

	//Get existing clones
	var strSelect = "sxelect max(PK_AUTO_ID) from CONFIG_ITEMI where ck_config_item LIKE 'New "+strCIType+" %'"
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	var pk_auto_id = 0;

	while(oRS.Fetch())
	{
		pk_auto_id = oRS.GetValueAsString(0);
	}

	//get the ck_config_item of the latest existing clones
	var strSelect = "sxelect ck_config_item from CONFIG_ITEMI where pk_auto_id = "+pk_auto_id;
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	var strId = "";
	while(oRS.Fetch())
	{
		strId = oRS.GetValueAsString(0);
	}

	
	var strTemp = "New "+strCIType+" ";
	var offset = strId.substr(strTemp.length);
	if(isNaN(offset) || offset=="")
		offset = 0;
	var until = 1+parseInt(offset)+parseInt(intNumberOfCopies);
	offset = parseInt(offset)+1;

	for(var i = offset;i<until;i++)
	{
	   if(strCols.indexOf("ck_config_item")<0)
	   {
			strCols += ",ck_config_item";
			strValues += ",'New "+app.g.pfs(strCIType)+" "+i+"'";
			strWhere +=" and ck_config_item='New "+app.g.pfs(strCIType)+" "+i+"'";
	   }

		//-- submit then get new ci id
		var strInsertSQL = "ixnsert into " + UC(strTable) + " ( " + strCols + ") values (" + strValues + ")";
		if (app.g.sxubmitsql(strInsertSQL,true))
		{
			var strSelect = "sxelect max(PK_AUTO_ID) from CONFIG_ITEMI where " + strWhere;
			var oRS = app.g.gxet_recordset(strSelect,"swdata");
			var newCIkey = 0;
			while(oRS.Fetch())
			{
				newCIkey = oRS.GetValueAsString(0);
			}

			//refresh record to make 'new' reset name, baselineid
			var strUpdate = "uxpdate " + UC(strTable) + " set BASELINEID = "+newCIkey+",ck_config_item = 'New "+strCIType+" "+i+"'  where PK_AUTO_ID = " + newCIkey;
			app.g.sxubmitsql(strUpdate,true);

			if(strExtTable!="")
			{
				var strInsertCols = strExtCols;
				if(strInsertCols!="")strInsertCols+=",";
				strInsertCols +=app.g.dd_primarykey(strExtTable).toUpperCase();

				var strInsertValues = strExtValues;
				if(strInsertValues!="")strInsertValues+=",";
				strInsertValues +=newCIkey;

				var strExtInsertSQL = "ixnsert into " + UC(strExtTable) + " (" + strInsertCols + ") values (" + strInsertValues + ")";
				app.g.sxubmitsql(strExtInsertSQL,true);
			}

			var strSelect = "sxelect * from CI_TYPE_RELKB where fk_config_type='" + app.g.pfs(strCIType) + "'";
			var oKBDocs = app.g.gxet_recordset(strSelect,"swdata");
			while(oKBDocs.Fetch())
			{
				var kb_docref = oKBDocs.GetValueAsString("KB_DOCREF");
				var kb_title = oKBDocs.GetValueAsString("KB_TITLE");
				var strInsert = "ixnsert into config_relkb (FK_CI_ID,FK_CONFIG_TYPE,CI_ITEMTEXT,KB_DOCREF,KB_TITLE) values ";
				strInsert += "("+newCIkey+",'"+app.g.pfs(strCIType)+"','"+app.g.pfs(strCIType)+"','"+app.g.pfs(kb_docref)+"','"+app.g.pfs(kb_title)+"')";
				app.g.sxubmitsql(strInsert,true);
			}

			
		}
		else
		{
			return -1;
		}
	}
	return 0;
	*/
}

oCMDB.prototype.copy_diaryentries = cmdb_copy_diaryentries;
function cmdb_copy_diaryentries(intCopyFromCIKey, intCopyToCIkey)
{
	//-- select diary entries for from ci
	//-- loop and do insert into diary for to ci
	//var strSelect = "sxelect * from CONFIG_DIARY where FK_CI_ID = " + intCopyFromCIKey;
	//var oRS = app.g.gxet_recordset(strSelect,"swdata");
	//-- nwj - 11.2012 - use stroed query
	var strParams = "table=config_diary&_swc_fk_ci_id=" + intCopyFromCIKey;
	var oRS = app.g.get_sqrecordset("select.tablebycol",strParams);
	while(oRS.Fetch())
	{
		//F0102518 - use xmlmc to avoid error when using single apostrophe
		var xmlmc = new XmlMethodCall();
		xmlmc.SetValue("table", "config_diary");		
	 
		xmlmc.SetData("fk_ci_id",intCopyToCIkey);
		xmlmc.SetData("udsource",oRS.GetValueAsString('udsource'));
		xmlmc.SetData("udcode",oRS.GetValueAsString('udcode'));
		xmlmc.SetData("updatetxt",oRS.GetValueAsString('updatetxt'));
		xmlmc.SetData("analystid",oRS.GetValueAsString('analystid'));
		xmlmc.SetData("updatedonx",oRS.GetValueAsString('updatedonx'));
		xmlmc.SetData("fk_callref",oRS.GetValueAsString('fk_callref'));

		if(xmlmc.Invoke("data", "addRecord"))
		{
			var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
			var objRes = XMCResult(strXML);
			if(!objRes.success)
			{
				MessageBox("Failed to process record creation (" + objRes.message + "). Please contact your Supportworks Supervisor.");
			}	
		}
		else
		{
			MessageBox("Failed to process record creation. " + xmlmc.GetLastError() + ". Please contact your Supportworks Supervisor.");
		}		
	}
}


oCMDB.prototype.copy_servicetypes = cmdb_copy_servicetypes;
function cmdb_copy_servicetypes(intCopyFromCIKey, intCopyToCIkey)
{
	//var strUpdate = "uxpdate CT_PROFILES set FK_CONFIG_ITEM = " + intCopyToCIkey + " where FK_CONFIG_ITEM =  " + intCopyFromCIKey;
	//app.g.sxubmitsql(strUpdate,true);
	//-- nwj - 11.2012 - use stored query
	var strParams = "intCopyFromCIKey=" + pfu(intCopyFromCIKey) + "&intCopyToCIkey=" + pfu(intCopyToCIkey);
	app.g.submitsqs("cmdb/copy_servicetypes.update",strParams);

}

//-- 2.4 Copy the service types to the new CI - used in cloning
oCMDB.prototype.copy_full_servicetypes = cmdb_copy_full_servicetypes;
function cmdb_copy_full_servicetypes(intCopyFromCIKey, intCopyToCIkey)
{
	//-- nwj - 11.2012 - use stored query
	var strParams = "table=ct_profiles&fkc=fk_config_item&fkv=" + pfu(intCopyFromCIKey) + "&ctkv=" + pfu(intCopyToCIkey);
	app.g.submitsqs("copy.record",strParams);

}

oCMDB.prototype.copy_merelations = cmdb_copy_merelations;
function cmdb_copy_merelations(intCopyFromCIKey, intCopyToCIkey)
{
	//var strUpdate = "uxpdate CONFIG_RELME set FK_CI_ID = " + intCopyToCIkey + " where FK_CI_ID =  " + intCopyFromCIKey;
	//app.g.sxubmitsql(strUpdate,true);
	//-- nwj - 11.2012 - use stored query
	var strParams = "intCopyFromCIKey=" + pfu(intCopyFromCIKey) + "&intCopyToCIkey=" + pfu(intCopyToCIkey);
	app.g.submitsqs("cmdb/copy_merelations.update",strParams);

}

//-- NWJ
//-- 21.05.2007 - copy ci relations from 0ne ci to another (part of baseline process)
oCMDB.prototype.copy_relations = cmdb_copy_relations;
function cmdb_copy_relations(intCopyFromCIKey, intCopyToCIkey)
{
	//-- nwj - 11.2012 - use stored query
	var strParams = "intCopyFromCIKey=" + pfu(intCopyFromCIKey) + "&intCopyToCIkey=" + pfu(intCopyToCIkey);
	app.g.submitsqs("cmdb/process/copy_relations",strParams);
	
	//-- copy child ones first
	/*
	var strSelect = "sxelect * from CONFIG_RELI where FK_CHILD_ID = " + intCopyFromCIKey + " OR FK_PARENT_ID = " + intCopyFromCIKey;
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	while(oRS.Fetch())
	{
		//-- loop through table structure and make a copy of each relation
		var strColumns = "";
		var strValues = "";
		for(var x=0;x < dd.tables["config_reli"].columns.length;x++)
		{
			var strColName = dd.tables["config_reli"].columns[x].Name;
			var varColValue = oRS.GetValueAsString(strColName);

			var boolParent = (oRS.GetValueAsString("fk_child_id")!=intCopyFromCIKey);

			if(UC(strColName)!="PK_AUTO_ID")
			{
				if(strColumns!="")strColumns+=",";
				if(strValues!="")strValues+=",";

				//-- if setting child value and ci is the child
				if ((UC(strColName)=="FK_CHILD_ID")&&(!boolParent))
				{
					//-- set value
					varColValue = intCopyToCIkey;
				}
				else if ((UC(strColName)=="FK_PARENT_ID")&&(boolParent))
				{
					//-- if setting parent value and ci is the parent
					varColValue = intCopyToCIkey;
				}

				strColumns+= strColName;
				strValues+= app.g.encapsulate("config_reli",strColName,varColValue);
			}
		}
		var strInsert = "ixnsert into CONFIG_RELI (" + strColumns + ") values (" + strValues + ")";
		app.g.sxubmitsql(strInsert,true);
	}
	*/
}

//-- NWJ
//-- 21.05.2007 - copy ci relations from 0ne ci to another (part of baseline process)
oCMDB.prototype.clone_relations = cmdb_clone_relations;
function cmdb_clone_relations(intCopyFromCIKey, intCopyToCIkey, strCK_CONFIG_ITEM)
{
	//-- nwj - 11.2012 - use stored query
	var strParams = "strCK_CONFIG_ITEM="+pfu(strCK_CONFIG_ITEM)+"&intCopyFromCIKey=" + pfu(intCopyFromCIKey) + "&intCopyToCIkey=" + pfu(intCopyToCIkey);
	app.g.submitsqs("cmdb/process/clone_relations",strParams);

	//-- copy child ones first
	/*
	var strSelect = "sxelect * from CONFIG_RELI where FK_CHILD_ID = " + intCopyFromCIKey + " OR FK_PARENT_ID = " + intCopyFromCIKey;
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	while(oRS.Fetch())
	{
		//-- loop through table structure and make a copy of each relation
		var strColumns = "";
		var strValues = "";
		for(var x=0;x < dd.tables["config_reli"].columns.length;x++)
		{
			var strColName = dd.tables["config_reli"].columns[x].Name;
			var varColValue = oRS.GetValueAsString(strColName);

			var boolParent = (oRS.GetValueAsString("fk_child_id")!=intCopyFromCIKey);

			if(UC(strColName)!="PK_AUTO_ID")
			{
				if(strColumns!="")strColumns+=",";
				if(strValues!="")strValues+=",";

				//-- if setting child value and ci is the child
				if ((UC(strColName)=="FK_CHILD_ID")&&(!boolParent))
				{
					//-- set value
					varColValue = intCopyToCIkey;
				}
				else if ((UC(strColName)=="FK_PARENT_ID")&&(boolParent))
				{
					//-- if setting parent value and ci is the parent
					varColValue = intCopyToCIkey;
				}

				//-- if setting child value and ci is the child
				if ((UC(strColName)=="FK_CHILD_ITEMTEXT")&&(!boolParent))
				{
					//-- set value
					varColValue = strCK_CONFIG_ITEM;
				}
				else if ((UC(strColName)=="FK_PARENT_ITEMTEXT")&&(boolParent))
				{
					//-- if setting parent value and ci is the parent
					varColValue = strCK_CONFIG_ITEM;
				}

				strColumns+= strColName;
				strValues+= app.g.encapsulate("config_reli",strColName,varColValue);
			}
		}
		var strInsert = "ixnsert into CONFIG_RELI (" + strColumns + ") values (" + strValues + ")";
		app.g.sxubmitsql(strInsert,true);
	}
	*/
}

//-- 25.01.2006
//-- NWJ
//-- copy extended properties from one ci to another
oCMDB.prototype.copy_extended_record = cmdb_copy_extended_record;
function cmdb_copy_extended_record(intCopyFromCIKey, intCopyToCIkey, strConfigType)
{
	//-- nwj - 11.2012 - use stored query
	var strParams = "intCopyFromCIKey=" + pfu(intCopyFromCIKey) + "&intCopyToCIkey=" + pfu(intCopyToCIkey) + "&strConfigType="+ pfu(strConfigType);
	return app.g.submitsqs("cmdb/process/copy_extended_record",strParams);

	//-- make sure we have extended tables
	/*
	if ( (this.setup_extended_record(intCopyToCIkey, strConfigType, false)) && (this.setup_extended_record(intCopyFromCIKey, strConfigType, false)) )
	{
		//-- get table name
	 	rec = app.g.gxet_record("CONFIG_TYPEI", strConfigType);
        var strTable = rec.extended_table;

		//-- get extended data
		var strWhere = app.g.dd_primarykey(strTable) + " = " + intCopyFromCIKey;
   	    oRec = app.g.gxet_recordwhere(strTable,strWhere);
		if (oRec)
		{
			//-- set new fields for copy record
			var strUpdate= "";
			for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
			{
				var colName = dd.tables[LC(strTable)].columns[x].Name;
				//88830 - lowercase colName before getting value
				var colValue = oRec[LC(colName)];

				if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
				{
					if(	strUpdate != "")strUpdate += ",";
					strUpdate +=  colName + " = " + app.g.encapsulate(strTable,colName,colValue);
				}
	
			}//-- for loop		

			//-- insert copied record
			if (strUpdate != "")
			{
				strUpdateSQL = "uxpdate " + UC(strTable) + " set " + strUpdate + " where " + UC(app.g.dd_primarykey(strTable)) + " = " + intCopyToCIkey;
				return app.g.sxubmitsql(strUpdateSQL,true);
			}

		}//-- if oRec
		else
		{
			MessageBox("Extended data record not found for this configuration item. Please contact your Supportworks Administrator.");
		}
	}//-- if has extended tables
	*/

}

//-- 25.01.2006
//-- NWJ
//-- check for extended properties for CMDB
oCMDB.prototype.setup_extended_record = cmdb_setup_extended_record;
function cmdb_setup_extended_record(intCIKey, strConfigType,boolMessages)
{
 	var rec = app.g.get_record("CONFIG_TYPEI", strConfigType);
    if(rec)
    {
        var configForm = rec.extended_form;
        var configTable = rec.extended_table;

        if ((configTable == "") || (configTable == "N/A"))
        {
            if (boolMessages) MessageBox("There is no extended table specified for this Configuration Type");
            return false;
        }

		if (dd.tables[LC(configTable)]==undefined)
		{
           if (boolMessages) MessageBox("The defined table for this extended form does not exist.");
		   return false;
		}

        //-- make sure we have an extended record for this item - if not create it
		rec = app.g.get_record(configTable, intCIKey);
        if(!rec)
        {
            //var strInsert = "ixnsert into " + UC(configTable) + " (" +  UC(app.g.dd_primarykey(configTable)) + ") values (" + intCIKey + ")";
            //if (SxqlExecute("SWDATA",strInsert) == -1)
			var strParams = "table=" + configTable + "&key=" + intCIKey;
			if(app.g.submitsqs("cmdb/setup_extended_record.insert",strParams)==-1)
			{
                MessageBox("Configuration Item extended properties insert failed : \n" + strInsert);
                return false;
            }
        }
		return configForm;
	}
	else
	{
      if(boolMessages) MessageBox("The configuration type ("+strConfigType+") does not exist in the config_typei table");
	}

	return false;
}


//-- CMDB PERMISSIONS
//-- 10.09.2004
//-- NWJ
oCMDB.prototype.can_view = cmdb_can_view;
function cmdb_can_view(boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCan =  app.session.HaveAppRight(PG_CMDB, CMDB_VIEW,app.session.dataDictionary);
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view configuration items in the CMDB.")
	}
	return boolCan; 
}	

oCMDB.prototype.can_create = cmdb_can_create;
function cmdb_can_create(boolMSG)
{
	//-- user can create
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_CMDB, CMDB_CREATE,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to create configuration items in the CMDB.")
	}
	return boolCan; 
}	

oCMDB.prototype.can_delete = cmdb_can_delete;
function cmdb_can_delete(boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_CMDB, CMDB_DELETE,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to delete configuration items from the CMDB.")
	}

	//-- user can delete
	return boolCan;
}	

oCMDB.prototype.can_update = cmdb_can_update;
function cmdb_can_update(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_CMDB, CMDB_EDIT,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to update configuration items in the CMDB.")
	}
	return boolCan; 
}	

oCMDB.prototype.can_baseline = cmdb_can_baseline;
function cmdb_can_baseline(boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCanBLN = app.session.HaveAppRight(PG_CMDB, CMDB_BLINE,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCanBLN))
	{
		MessageBox("You are not authorised to baseline, or modify baselined, configuration items.");
	}
	return boolCanBLN
}	

oCMDB.prototype.is_specialist = cmdb_is_specialist;
function cmdb_is_specialist(boolMSG)
{
	//-- user can edit special fields types
	if(boolMSG==undefined)boolMSG=false;
	var boolCanMNG = app.session.HaveAppRight(PG_CMDB, CMDB_SPECIALIST,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCanMNG))
	{
		MessageBox("You are not an authorised CMDB specialist.");
	}

	return boolCanMNG;
}	

oCMDB.prototype.can_manage = cmdb_can_manage;
function cmdb_can_manage(boolMSG)
{
	//-- user can manage types
	if(boolMSG==undefined)boolMSG=false;
	var boolCanMNG = app.session.HaveAppRight(PG_CMDB, CMDB_MNGTYPES,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCanMNG))
	{
		MessageBox("You are not authorised to manage configuration types.");
	}

	return boolCanMNG;
}	

oCMDB.prototype.can_managestage = cmdb_can_managestage;
function cmdb_can_managestage(boolMSG)
{
	//-- user can manage types
	if(boolMSG==undefined)boolMSG=false;
	var boolCanImport= app.session.HaveAppRight(PG_CMDB, CMDB_MNGSTAGE,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCanImport))
	{
		MessageBox("You are not authorised to manage staging items.");
	}

	return boolCanImport;
}	


oCMDB.prototype.can_develop = cmdb_can_develop;
function cmdb_can_develop()
{
	//-- Return develop ext forms security level for analyst
	return true;
}		

//--
//-- EOF CMDB Permissions


oCMDB.prototype.get_statusinfo = cmdb_get_statusinfo;
function cmdb_get_statusinfo(strTypeID, strStatus)
{
	var strColour = "#ffffff";
	var strSysStatus = "Active";

	var ap = {};
	ap.FK_CONFIG_TYPE=strTypeID;
	ap.STATUS_LEVEL=strStatus;
	var oRS = app.g.get_tablerecordset_bycol("CT_STATUSL", ap);
	while(oRS.Fetch())
	{
		strSysStatus = app.g.get_field(oRS,"cmdb_status");	
		strColour = app.g.get_field(oRS,"colour_code");		
	}
	
	return strColour  + "|" + strSysStatus;
}



oCMDB.prototype.get_statuscolour = cmdb_get_statuscolour;
function cmdb_get_statuscolour(strTypeID, strStatus)
{
	var strColour = "#ffffff"

	var ap = {};
	ap.FK_CONFIG_TYPE=strTypeID;
	ap.STATUS_LEVEL=strStatus;
	var oRS = app.g.get_tablerecordset_bycol("CT_STATUSL", ap);
	while(oRS.Fetch())
	{
		strColour = app.g.get_field(oRS,"colour_code");		
	}

	return strColour;

}

//-- nwj - copy parents status levels over to type
oCMDB.prototype.copy_parenttype_statuslevels = cmdb_copy_parenttype_statuslevels;
function cmdb_copy_parenttype_statuslevels(strTypeID, strParentTypeID)
{
	/*
	var strSQL = "sxelect STATUS_LEVEL, CMDB_STATUS, COLOUR_CODE from CT_STATUSL where FK_CONFIG_TYPE = '" + app.g.pfs(strParentTypeID)+ "'";
	var oRS = app.g.gxet_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		var strStatus = app.g.get_field(oRS,"STATUS_LEVEL");
		var strCMDBstatus = app.g.get_field(oRS,"CMDB_STATUS");
		var strColour = app.g.get_field(oRS,"COLOUR_CODE");		
		var strInsert = "ixnsert into CT_STATUSL (STATUS_LEVEL, CMDB_STATUS, COLOUR_CODE, FK_CONFIG_TYPE) values ('" + app.g.pfs(strStatus) + "','" + app.g.pfs(strCMDBstatus) + "','" + app.g.pfs(strColour) + "','" + app.g.pfs(strTypeID)+ "')";
		app.g.sxubmitsql(strInsert,true);		
	}
	*/
	var strParams="tid=" + pfu(strTypeID) + "&ptid=" + pfu(strParentTypeID);
	app.g.submitsqp("cmdb/process/copy_parenttype_statuslevels",strParams);		

}

//-- nwj - copy parents status levels over to type
oCMDB.prototype.copy_parenttype_sc_statuslevels = cmdb_copy_parenttype_sc_statuslevels;
function cmdb_copy_parenttype_sc_statuslevels(strTypeID, strParentTypeID)
{
/*	var strSQL = "sxelect STATUS_LEVEL, CMDB_STATUS, COLOUR_CODE from CT_STATUSL where FK_CONFIG_TYPE = '" + app.g.pfs(strParentTypeID)+ "'";
	var oRS = app.g.get_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		var strStatus = app.g.get_field(oRS,"STATUS_LEVEL");
		var strCMDBstatus = app.g.get_field(oRS,"CMDB_STATUS");
		var strColour = app.g.get_field(oRS,"COLOUR_CODE");		
		var strInsert = "ixnsert into CT_STATUSL (STATUS_LEVEL, CMDB_STATUS, COLOUR_CODE, FK_CONFIG_TYPE, FLG_SC) values ('" + app.g.pfs(strStatus) + "','" + app.g.pfs(strCMDBstatus) + "','" + app.g.pfs(strColour) + "','" + app.g.pfs(strTypeID)+ "',1)";
		app.g.sxubmitsql(strInsert,true);		
	}
*/
	var strParams="tid=" + pfu(strTypeID) + "&ptid=" + pfu(strParentTypeID);
	app.g.submitsqp("cmdb/process/copy_parenttype_sc_statuslevels",strParams);		

}

//-- nwj - copy parents relation types over to type
oCMDB.prototype.copy_parenttype_relationtypes = cmdb_copy_parenttype_relationtypes;
function cmdb_copy_parenttype_relationtypes(strTypeID, strParentTypeID)
{
	/*
	var strSQL = "sxelect FK_RELTYPE from CT_RELTYPES where FK_CONFIG_TYPE = '" + app.g.pfs(strParentTypeID)+ "'";
	var oRS = app.g.gxet_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		var strRelType = app.g.get_field(oRS,"FK_RELTYPE");
		var strInsert = "ixnsert into CT_RELTYPES (FK_RELTYPE, FK_CONFIG_TYPE) values ('" + app.g.pfs(strRelType) + "','" + app.g.pfs(strTypeID)+ "')";
		app.g.sxubmitsql(strInsert,true);		
	}*/
	var strParams="tid=" + pfu(strTypeID) + "&ptid=" + pfu(strParentTypeID);
	app.g.submitsqp("cmdb/process/copy_parenttype_relationtypes",strParams);		
}

//-- nwj - copy parents relation types over to type
oCMDB.prototype.copy_parenttype_sc_relationtypes = cmdb_copy_parenttype_sc_relationtypes;
function cmdb_copy_parenttype_sc_relationtypes(strTypeID, strParentTypeID)
{
	/*
	var strSQL = "sxelect FK_RELTYPE from CT_RELTYPES where FK_CONFIG_TYPE = '" + app.g.pfs(strParentTypeID)+ "'";
	var oRS = app.g.gxet_recordset(strSQL,"swdata");
	while(oRS.Fetch())
	{
		var strRelType = app.g.get_field(oRS,"FK_RELTYPE");
		var strInsert = "ixnsert into CT_RELTYPES (FK_RELTYPE, FK_CONFIG_TYPE, FLG_SC) values ('" + app.g.pfs(strRelType) + "','" + app.g.pfs(strTypeID)+ "',1)";
		app.g.sxubmitsql(strInsert,true);		
	}
	*/
	var strParams="tid=" + pfu(strTypeID) + "&ptid=" + pfu(strParentTypeID);
	app.g.submitsqp("cmdb/process/copy_parenttype_sc_relationtypes",strParams);		

}

//-- 28.04.2005
//-- NWJ
//-- link a CI to an opencall record
oCMDB.prototype.relate_to_call= cmdb_relate_to_call;
function cmdb_relate_to_call(intCIid,intCallref,boolDiaryEvent,strCode)
{
	if (boolDiaryEvent==undefined)boolDiaryEvent=false;
	var strParams = "cr=" + intCallref+"&cid="+intCIid+"&rc="+strCode
	if (app.g.submitsqs("cmdb/process/relate_to_call",strParams))
	{
		if (boolDiaryEvent)
		{

		}
		return true;
	}
	else
	{
		return false;
	}
}


//-- 28.04.2005
//-- NWJ
//-- unlink a CI from an opencall record
oCMDB.prototype.unrelate_to_call= cmdb_unrelate_to_call;
function cmdb_unrelate_to_call(intCIid,intCallref,boolDiaryEvent,strCode)
{
	if (boolDiaryEvent==undefined)boolDiaryEvent=false;
	//var strSQL = "dxelete from CMN_REL_OPENCALL_CI where FK_CALLREF= " + intCallref + " and FK_CI_AUTO_ID = " + intCIid;
	//if(strCode!= undefined) strSQL = strSQL + " and RELCODE = '" + strCode + "'";
	//if (app.g.sxubmitsql(strSQL,true))
	var strParams = "cr=" + intCallref+"&cid="+intCIid+"&rc="+strCode;
	if (app.g.submitsqs("cmdb/process/unrelate_from_call",strParams))
	{
		if (boolDiaryEvent)
		{

		}
		return true;
	}
	else
	{
		return false;
	}
}

//-- 28.04.2005
//-- NWJ
//-- return comma list of related calls for a CI
oCMDB.prototype.get_related_calls= cmdb_get_related_calls;
function cmdb_get_related_calls(intCIid,strCode)
{
	var strFilter = "";

	var ap = {};
	ap.fk_ci_auto_id=intCIid;
	if(strCode!= undefined)ap.relcode=strCode;
	var oRs = app.g.get_tablerecordset_bycol("CMN_REL_OPENCALL_CI", ap);

    while(oRs.Fetch())
    {
    	var ciID = oRs.GetValueAsString("fk_callref");
   		if (strFilter != "") strFilter += ",";
        strFilter += ciID;
    }

	return strFilter;
}

//-- 28.04.2005
//-- NWJ
//-- return comma list of related calls for a CI
oCMDB.prototype.get_relatedcall_cis= cmdb_get_relatedcall_cis;
function cmdb_get_relatedcall_cis(intCallref,strCode)
{
	var strFilter = "";

	var ap = {};
	ap.fk_callref=intCallref;
	if(strCode!= undefined)ap.relcode=strCode;
	var oRs = app.g.get_tablerecordset_bycol("cmn_rel_opencall_ci", ap);

    while(oRs.Fetch())
    {
    	var ciID = oRs.GetValueAsString("fk_ci_auto_id");
   		if (strFilter != "") strFilter += ",";
        strFilter += ciID;
    }
	return strFilter;
}


//-- 02.12.2005
//-- DJH
//-- Array containing fields that are to be trapped for changes and entered into the log
var array_log_fields = null;
oCMDB.prototype.init_logfields= cmdb_init_logfields;
function cmdb_init_logfields(adoc)
{
	array_log_fields = [];
	//-- create alog entry object
	array_log_fields.ck_config_type 		= new oLogField("ck_config_type",adoc);	
	array_log_fields.fk_status_level 	= new oLogField("fk_status_level",adoc);
	array_log_fields.fk_priority_level 	= new oLogField("fk_priority_level",adoc);
	array_log_fields.ci_impact_level 	= new oLogField("ci_impact_level",adoc);
	array_log_fields.owner_name 			= new oLogField("owner_name",adoc);
}

//-- 12.10.2009
//-- RJC
//-- this function will return an array of objects which contain the blackout periods between
//-- the two dates given for the CI given.
oCMDB.prototype.get_bl_dates= cmdb_get_bl_dates;
function cmdb_get_bl_dates(startx, endx,ci_id,oCI)
{
	if(startx=="" || endx=="")
	{
		MessageBox('no date');
		return false;
	}
	if(ci_id<1)
	{
		MessageBox('No CI');
		return false;
	}
	if(startx>endx)
	{
		MessageBox('Start Date is greater than end date');
		return false;
	}
	if(oCI==undefined)
	{
		oCI = app.g.get_record("config_itemi", ci_id);
	}

	var arrReturnObjects = [];
	//MessageBox(oCI.mon_s);
	var arrDates = app.cmdb.get_bl_available_dates(oCI);
	if(arrDates.length==0)
	{
		//CI does not have availability
		return true;
	}else
	{
		var arrObjects = app.cmdb.check_bl_bespoke(oCI.pk_auto_id,startx,endx,oCI.ck_config_item);
		if(arrObjects.length>0)
		{
			arrReturnObjects=arrReturnObjects.concat(arrObjects);
		}
		var arrObjects = app.cmdb.check_bl_periodic(oCI.pk_auto_id,startx,endx,arrDates,oCI.ck_config_item);
		if(arrObjects.length>0)
		{
			arrReturnObjects=arrReturnObjects.concat(arrObjects);
		}
		var arrObjects = app.cmdb.check_bl_month(oCI.pk_auto_id,startx,endx,arrDates,oCI.ck_config_item);
		if(arrObjects.length>0)
		{
			arrReturnObjects=arrReturnObjects.concat(arrObjects);
		}
		var arrObjects = app.cmdb.check_bl_weekly(oCI.pk_auto_id,startx,endx,arrDates,oCI.ck_config_item);
		if(arrObjects.length>0)
		{
			arrReturnObjects=arrReturnObjects.concat(arrObjects);
		}
		return arrReturnObjects;
	}
}

oCMDB.prototype.check_bl_weekly= cmdb_check_bl_weekly;
function cmdb_check_bl_weekly(ci_id,startx,endx,arrDates,config_item)
{
	var arrObjects = [];

	var d = new Date();
	d.setTime(startx*1000);
	var thisDate = d.getDate();
	var thisDay = d.getDay();
	var noOfDays = thisDate-thisDay;
	d.setDate(noOfDays);
	var startTime = d.getTime()/1000;
	
	d.setTime(endx*1000);
	var endTime = d.getTime()/1000;
		
	var dHolder = 86400;	
	
	var ap = {};
	ap.fk_ci_id=ci_id;
	ap.type='Weekly';
	ap.is_inactive=0;
	var oRS = app.g.get_tablerecordset_bycol("ci_blackout", ap);
	while (oRS.Fetch())
	{	
		
		//var dOffset	= app.g.get_field(oRS,"day_offset");
		var dNumber	= app.g.get_field(oRS,"no_of_days");
		var start_dayx = app.g.get_field(oRS, "start_day");
		
		//set the years to the years to be checked.
		var checkCurrentTime = startTime;
		var checkEndTime = endTime;
				
		//while the end year is greater than or equal to the current check year.
		while(checkEndTime>=checkCurrentTime){
		
			d.setTime(checkCurrentTime*1000);
			var thisDate = d.getDate();
			var noOfDays = parseInt(start_dayx) + thisDate;
			d.setDate(noOfDays);
			
			d.setHours(0,0,0,0);
			var blStart = d.getTime()/1000;
			
			var thisDate = d.getDate();
			var noOfDays = parseInt(dNumber) + thisDate - 1;
			d.setDate(noOfDays);

			d.setHours(23,59,59,999);
			var blEnd = d.getTime()/1000;
			
			//check whether there is overlap of blackout period and selected period.
			var boolBlackout = app.cmdb.check_bl_date(blStart,blEnd,startx,endx);
			if(boolBlackout)
			{
				var blName = app.g.get_field(oRS,"blackout_name");
				var blobject= {};
				blobject.oName = blName;
				blobject.oStart =blStart;
				blobject.oEnd = blEnd;
				blobject.oCIName = config_item;

				arrObjects.push(blobject);
			}
			
			//set time to the next week
			d.setTime(checkCurrentTime*1000);
			var thisDate = d.getDate();
			var noOfDays = 7 + thisDate;
			d.setDate(noOfDays);
			checkCurrentTime = d.getTime()/1000;
		}
	
	}
	return arrObjects;
}

oCMDB.prototype.check_bl_month= cmdb_check_bl_month;
function cmdb_check_bl_month(ci_id,startx,endx,arrDates,config_item)
{
	var arrObjects = [];
	
	var d = new Date();
	d.setTime(startx*1000);
	d.setDate(1);
	var startTime = d.getTime()/1000;
	d.setTime(endx*1000);
	var endTime = d.getTime()/1000;
		
	var dHolder = 86400;	
	
	var ap = {};
	ap.fk_ci_id=ci_id;
	ap.type='Monthly';
	ap.is_inactive=0;
	var oRS = app.g.get_tablerecordset_bycol("ci_blackout", ap);
	while (oRS.Fetch())
	{	
		
		//var dOffset	= app.g.get_field(oRS,"day_offset");
		var dNumber	= app.g.get_field(oRS,"no_of_days");
		var start_dayx = app.g.get_field(oRS, "start_day");
		var start_week = app.g.get_field(oRS, "start_week");
		
		//set the years to the years to be checked.
		var checkCurrentTime = startTime;
		var checkEndTime = endTime;
				
		//while the end year is greater than or equal to the current check year.
		while(checkEndTime>=checkCurrentTime){
		
			d.setTime(checkCurrentTime*1000);

			//set the date to the starting check year, and month
			//d.setFullYear(checkCurrentYear,pStartMonth-1,pStartDay)
			var thisStartWeek = start_week;
			while(thisStartWeek>1)
			{
				var thisDate = d.getDate();
				var thisDay = d.getDay();
				var noOfDays = (7 - thisDay )+ thisDate;
				d.setDate(noOfDays);
				thisStartWeek--;
			}

			var thisDate = d.getDate();
			var noOfDays = parseInt(start_dayx) + thisDate;
			d.setDate(noOfDays);
			
			d.setHours(0,0,0,0);
			var blStart = d.getTime()/1000;
			
			var thisDate = d.getDate();
			var noOfDays = parseInt(dNumber) + thisDate - 1;
			d.setDate(noOfDays);

			d.setHours(23,59,59,999);
			var blEnd = d.getTime()/1000;
			
			//check whether there is overlap of blackout period and selected period.
			var boolBlackout = app.cmdb.check_bl_date(blStart,blEnd,startx,endx);
			if(boolBlackout)
			{
				var blName = app.g.get_field(oRS,"blackout_name");
				var blobject= {};
				blobject.oName = blName;
				blobject.oStart =blStart;
				blobject.oEnd = blEnd;
				blobject.oCIName = config_item;

				arrObjects.push(blobject);
			}
			
			d.setTime(checkCurrentTime*1000);
			var thisMonth = d.getMonth();
			d.setMonth(thisMonth+1);
			checkCurrentTime = d.getTime()/1000;
		}
	
	}
	return arrObjects;
}

oCMDB.prototype.check_bl_periodic= cmdb_check_bl_periodic;
function cmdb_check_bl_periodic(ci_id,startx,endx,arrDates,config_item)
{
	var arrObjects = [];
	
	var d = new Date();
	d.setTime(startx*1000);
	var startYear = d.getFullYear();
	d.setTime(endx*1000);
	var eYear = d.getFullYear();
		
	var dHolder = 86400;	
	
	var oRS		= app.g.get_sqrecordset("cmdb/check_bl_periodic.select","cid=" + ci_id);
	while (oRS.Fetch())
	{	
		//get period information
		var pStartDay	= app.g.get_field(oRS,"from_dd");
		var pStartMonth	= app.g.get_field(oRS,"from_mm");
		var pStartYear  = app.g.get_field(oRS,"from_yyyy");
		var pEndDay	    = app.g.get_field(oRS,"to_dd");
		var pEndMonth	= app.g.get_field(oRS,"to_mm");
		var pEndYear	= app.g.get_field(oRS,"to_yyyy");
		
		var dOffset	= app.g.get_field(oRS,"day_offset");
		var dNumber	= app.g.get_field(oRS,"no_of_days");
		
		//set the years to the years to be checked.
		var checkCurrentYear = startYear;
		var checkEndYear = eYear;
		
		//if the period start year is greater than the user selected year, use the period start year as year to start checking from
		if(pStartYear>0)
		{
			if(checkCurrentYear<pStartYear)
				checkCurrentYear = pStartYear;
		}
		
		//if the period end year is less than the selected year, use the period end year
		if(pEndYear>0)
		{
			if(checkEndYear>pEndYear)
				checkEndYear = pEndYear;
		}
		
		//while the end year is greater than or equal to the current check year.
		while(checkEndYear>=checkCurrentYear){
		
			//set the date to the starting check year, and month
			d.setFullYear(checkCurrentYear,pStartMonth-1,pStartDay)
			d.setHours(0,0,0,0);
			var intPeriodStart = d.getTime()/1000;
			//calculate the day the blackout starts
			var blStart = intPeriodStart+(dOffset*dHolder);
			d.setTime(blStart*1000);
			var thisDay = d.getDay();
			var thisDate = d.getDate();
			
			//while the blackout number of days is greater than one (one meaning current day is the last blackout day), increase the day 
			var daysNumber = dNumber;
			while(daysNumber>1)
			{
				thisDate = 1+d.getDate();
				d.setDate(thisDate);
				var thisDay = d.getDay();
				
				//if the current day is in the CIs operational days, decrement the number of days blacked out.
				if(in_array(arrDates,thisDay))
					daysNumber--;
			}
			d.setHours(23,59,59,999);
			blEnd = d.getTime()/1000;
			
			//check whether there is overlap of blackout period and selected period.
			var boolBlackout = app.cmdb.check_bl_date(blStart,blEnd,startx,endx);
			if(boolBlackout)
			{
				var blName = app.g.get_field(oRS,"blackout_name");
				var blobject= {};
				blobject.oName = blName;
				blobject.oStart =blStart;
				blobject.oEnd = blEnd;
				blobject.oCIName = config_item;

				arrObjects.push(blobject);
			}
			checkCurrentYear++;
		}
	
	}
	return arrObjects;
}

oCMDB.prototype.check_bl_bespoke= cmdb_check_bl_bespoke;
function cmdb_check_bl_bespoke(ci_id,startx,endx,config_item)
{
	var arrObjects = [];
	var d = new Date();

	var ap = {};
	ap.fk_ci_id=ci_id;
	ap.type='Bespoke Time';
	ap.is_inactive=0;
	var oRS = app.g.get_tablerecordset_bycol("ci_blackout", ap);

	while (oRS.Fetch())
	{	
		var blStart	= app.g.get_field(oRS,"start_dayx");
		var blEnd	= app.g.get_field(oRS,"end_dayx");
		var blName = app.g.get_field(oRS,"blackout_name");

		blStart = blStart -app.session.timeZoneOffset; 		
		d.setTime(blStart*1000);
		d.setHours(0,0,0,0);
		blStart = d.getTime()/1000;

		blEnd = blEnd -app.session.timeZoneOffset;
		d.setTime(blEnd*1000);
		d.setHours(23,59,59,999);
		blEnd = d.getTime()/1000;

		var boolBlackout = app.cmdb.check_bl_date(blStart,blEnd,startx,endx);
		if(boolBlackout)
		{
				var blName = app.g.get_field(oRS,"blackout_name");
				var blobject= {};
				blobject.oName = blName;
				blobject.oStart =blStart;
				blobject.oEnd = blEnd;
				blobject.oCIName = config_item;

				arrObjects.push(blobject);
		}
		
	}
	return arrObjects;

}

oCMDB.prototype.check_bl_date= cmdb_check_bl_date;
function cmdb_check_bl_date(blStart,blEnd,startx,endx)
{
	//MessageBox("BL Start:"+blStart+", BL End:"+blEnd+", startx:"+startx+", End X:"+endx);
	var boolCross = false;
	if(blStart>startx && blStart<endx)
	{
		boolCross = true;
		//start is between start and end
	}

	if(blEnd>startx && blEnd<endx)
	{
		boolCross = true;
		//end is between start and end
	}

	if(blStart<startx && blEnd>endx)
	{
		boolCross = true;
		//blackout is over entire scheduled area
	}
	return boolCross;

}

oCMDB.prototype.get_bl_available_dates= cmdb_get_bl_available_dates;
function cmdb_get_bl_available_dates(oCI)
{
	var arrDates = [];
	if(oCI.mon_s!="")
	{
		arrDates.push(1);
	}

	if(oCI.tue_s!="")
	{
		arrDates.push(2);
	}

	if(oCI.wed_s!="")
	{
		arrDates.push(3);
	}

	if(oCI.thu_s!="")
	{
		arrDates.push(4);
	}

	if(oCI.fri_s!="")
	{
		arrDates.push(5);
	}

	if(oCI.sat_s!="")
	{
		arrDates.push(6);
	}
	if(oCI.sun_s!="")
	{
		arrDates.push(0);
	}
	
	return arrDates;
	
}
//RJC Blackout

oCMDB.prototype.availability_monitored= cmdb_availability_monitored;
function cmdb_availability_monitored(oCI, pk_auto_id)
{
	if(oCI==undefined)
	{
		oCI = app.g.get_record("config_itemi", pk_auto_id);
	}

	if(oCI.flg_availmntr=="1")
		return true;
	if(oCI.ck_config_type!="ME->SERVICE")
	{
		oCIType = app.g.get_record("config_typei",oCI.ck_config_type);
		if(oCIType.flg_canmonitor=="1")
			return true;
	}
	return false

}
//- object to store field info
function oLogField(strColumnName,adoc)
{
	this.displayname    = app.g.dd_fieldlabel("config_itemi",strColumnName);
	this.origvalue 		= adoc.config_itemi[strColumnName];
	this.newvalue  		= adoc.config_itemi[strColumnName];
}

//-- DTH 20111221 Affected Business Area functionality
//-- add an Affected Business Area to a CI
oCMDB.prototype.insert_affected_bus_area = cmdb_insert_affected_bus_area;
function cmdb_insert_affected_bus_area(str_ci_id, str_bus_area_id)
{
	var oBusArea = app.g.get_record("affected_bus_area",str_bus_area_id);

	var arrCols = [];
	arrCols.fk_config_item = str_ci_id;
	arrCols.fk_bus_area_id = str_bus_area_id;
	arrCols.known_as = oBusArea.known_as;
	arrCols.principle_contact = oBusArea.principle_contact;
	arrCols.principle_contact_id = oBusArea.principle_contact_id;
	arrCols.group_email_address = oBusArea.group_email_address;
	return app.g.submittableinsert("config_bus_area",arrCols);
}

//--
//-- view an Affected Business Area - launched from a CI Details form
oCMDB.prototype.view_affected_bus_area = cmdb_view_affected_bus_area;
function cmdb_view_affected_bus_area(str_bus_area, strURL, funcCallback)
{
	app.OpenFormForEdit("EfAffectedBusinessArea", str_bus_area, strURL, true, function()
	{
		// We have launched the form related to the Affected Business Areas table.
		// We now need to Update the contents of the config_bus_area table (this allows multiple CIs to link to one Affected Business Area)
		var oBusArea = app.g.get_record("affected_bus_area",str_bus_area);
		/*
		var strUpdate = "uxpdate config_bus_area set ";
		strUpdate += "known_as = '" + app.g.pfs(oBusArea.known_as) + "'";
		strUpdate += ", principle_contact = '" + app.g.pfs(oBusArea.principle_contact) + "'";
		strUpdate += ", principle_contact_id = '" + app.g.pfs(oBusArea.principle_contact_id) + "'";
		strUpdate += ", group_email_address = '" + app.g.pfs(oBusArea.group_email_address) + "'";
		strUpdate += " where fk_bus_area_id = '" + app.g.pfs(str_bus_area) + "';";
		return app.g.sxubmitsqlxmlmc(strUpdate,false);
		*/
		var strParams = "ka=" + pfu(oBusArea.known_as) + "&pc=" + pfu(oBusArea.principle_contact) +"&pcid=" + pfu(oBusArea.principle_contact_id) +"&gea=" + pfu(oBusArea.group_email_address) + "&fbaid=" + pfu(str_bus_area)
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(app.g.submitsqs("cmdb/view_affected_bus_area.update",strParams));
		}
	});
}


//--
//-- remove the association between the Affected Business Area and the CI
oCMDB.prototype.delete_affected_bus_area = cmdb_delete_affected_bus_area;
function cmdb_delete_affected_bus_area(str_ci_id, str_bus_area, strURL)
{		
	//var strDelete = "dxelete from config_bus_area ";
	//strDelete += " where fk_config_item = '" + app.g.pfs(str_ci_id) + "' and fk_bus_area_id = '" + app.g.pfs(str_bus_area) + "';";
	//return app.g.sxubmitsqlxmlmc(strDelete,false);
	var strParams = "fci=" + str_ci_id + "&fbaid=" + str_bus_area;
	return app.g.submitsqs("cmdb/delete_affected_bus_area.delete",strParams);
}


//--
//-- EOF CMDB OBJECT
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
var FE_LABEL = 8;
var FE_SEARCHFIELD = 20;
//var undefined;
//var UNDEFINED;

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
	this.LOG_FROM_CALL = null;
	this.LOG_CALL_FOR_USER = "";
	this.LOG_CALL_FOR_CI = "";
	this.LOG_CALL_FOR_SERVICE = "";
	this.LOG_CALL_FOR_PK_SERVICE = "";
	this.LOG_FOR_ORGID = "";
	this.LOG_FOR_KBDOC = null;
	this.CALLINFO = [];
	this.array_open_me_documents = [];
	this.boolStandard = false;

	//-- nwj - 29.03.2010 - set to true to hide log call conf when doing log and resolve
	this.bDoNotShowLogCallConfirmation = false;
	this.bPromptToOpenCallDetails = true;

	this.strLogAndResolveContract = "";
	this.strLogAndResolveCompany = "";
}
var g = new fglobal();

//-- so in app you use app.g.funcname

//--JSIS UN Class
var un = new underscore();
function underscore()
{
}

//--
//-- G L O B A L  M E T H O D S  D O  N O T  A L T E R
//--


//-- NWJ
//-- 02.10.2008
//-- HANDLE DIFFERENT LOG CALL MODES (EMAIL/QUICKLOG/SCHEDULED/FROM FORM etc)
var SWCALL_TYPE_NEWCALL		= "0";
var SWCALL_TYPE_EMAIL		= "1";
var SWCALL_TYPE_INCOMING	= "2";
var SWCALL_TYPE_QUICKLOG	= "3";
var SWCALL_TYPE_SCHEDULED	= "4";
var SWCALL_TYPE_WEBLINK		= "5";
var SWCALL_TYPE_COPY		= "6";

//-- check preload tpye and then call handling function in the _swdoc level is one is defined.
//-- this allows you to do specific processing depending on the mode the log call form is being raised.
//-- i.e. if copying a call it means you can do processing to copy related records like ci's or additional data
fglobal.prototype.manage_logcall_mode = pt_manage_logcall_mode;
function pt_manage_logcall_mode(oDoc)
{
	switch (oDoc._form.PreloadType)
	{
		case SWCALL_TYPE_EMAIL:
			if(oDoc.IsObjectDefined("log_new_call_for_email"))oDoc.log_new_call_for_email();
			break;
			
		case SWCALL_TYPE_COPY:
			if(oDoc.IsObjectDefined("log_new_call_for_copy"))oDoc.log_new_call_for_copy();
			break;			

		case SWCALL_TYPE_QUICKLOG:
			if(oDoc.IsObjectDefined("log_new_call_for_quicklog"))oDoc.log_new_call_for_quicklog();
			break;						
			
		case SWCALL_TYPE_SCHEDULED:
			if(oDoc.IsObjectDefined("log_new_call_for_schedule"))oDoc.log_new_call_for_schedule();
			break;				
			
		case SWCALL_TYPE_INCOMING:
			if(oDoc.IsObjectDefined("log_new_call_incoming"))oDoc.log_new_call_incoming();	
			break;
		default:
			//-- do nothing
			break;
	}
}



//-- NWJ - 01.05.2008 - functions that help manage the refreshing of rfc task list within client
//--					as previously would update task but there parent form was not refreshed.

//-- get calls last update text (full0
fglobal.prototype.get_call_last_updatetxt = pt_get_call_last_updatetxt;
function pt_get_call_last_updatetxt(intCallref, boolCache, targetformField)
{
	var p = {};
	p.CALLREF=intCallref;
	var strUDI = app.g.get_tablecolmax_bycol("UPDATEDB","UDINDEX",p,boolCache);
	if(strUDI>0)
	{
		return this.get_call_updatetxt(intCallref, boolCache, strUDI, targetformField);		
	}

	return "<Last update text not found please contact your Administrator>";
}

fglobal.prototype.get_call_first_updatetxt = pt_get_call_first_updatetxt;
function pt_get_call_first_updatetxt(intCallref, boolCache, targetformField)
{
	return this.get_call_updatetxt(intCallref, boolCache, 0, targetformField);
}

fglobal.prototype.get_call_updatetxt = pt_get_call_updatetxt;
function pt_get_call_updatetxt(intCallref, boolCache, intUDINDEX, targetformField)
{
	var strUpdateText =  "<update text not found please contact your Administrator>";

	var ap = {};
	ap.cr=intCallref;
	ap.uid=intUDINDEX;
	ap.cdb=boolCache;
	var oRS = this.get_sqrecordset("helpdesk/get_call_updatetxt", ap);

	if(oRS.Fetch())
	{
		strUpdateText = this.get_field(oRS,"UPDATETXT")
	}
	
	// -- F00114578 - ConvertDateTimeInText (Global function) utilised to format time value 
	if(targetformField!=undefined)_ete(targetformField , app.global.ConvertDateTimeInText(strUpdateText));
	return strUpdateText;
}


//-- add call and its _swdoc to array
fglobal.prototype.add_me_document = pt_add_me_document;
function pt_add_me_document(strMeType,varKeyValue,oDocument)
{
	if(!this.array_open_me_documents[strMeType])this.array_open_me_documents[strMeType] = [];
	this.array_open_me_documents[strMeType][varKeyValue] = oDocument;
}

//-- set call in to array to false so will not open (cannot remove as not indexed)
fglobal.prototype.remove_me_document = pt_remove_me_document;
function pt_remove_me_document(strMeType,varKeyValue)
{
	if(!this.array_open_me_documents[strMeType])this.array_open_me_documents[strMeType] = [];
	this.array_open_me_documents[strMeType][varKeyValue] = false;
}

//-- set call in to array to false so will not open (cannot remove as not indexed)
fglobal.prototype.get_me_document = pt_get_me_document;
function pt_get_me_document(strMeType,varKeyValue)
{
	if(!this.array_open_me_documents[strMeType])this.array_open_me_documents[strMeType] = [];

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
	
	//-- get record count
	var strParams = "table=" + strTable + "&rc=" + pfu(strResolveCol) + "&rv=" + pfu(strResolveValue) + "&bar=" + boolAutoResolve;
	var intCount = app.g.sqs_rowcount("general/resolve_unbound_record.count",strParams);
	if(intCount==0)
	{
		//-- no matches
		if(boolMSG)MessageBox("resolve_unbound_record : No matching record was found in table (" + strTable +")");
	}
	else if(intCount==1)
	{
		//-- resolve
		oRec = app.g.get_sqrecordset("general/resolve_unbound_record.select",strParams);
		if(oRec)
		{
			this.set_unbound_values(aDoc.mainform, oRec, strFieldPrefix,aDoc);
		}
	}
	else if(intCount>1)
	{
		//-- more than one record - popup pickrecord form
		if(boolMSG) MessageBox("resolve_unbound_record : More than one matching record was found. This indicates that there is a data issue in table (" + strTable +")");
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
				_eva(oEle, oRec[strFieldName]);
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
			_eva(oEle, (boolNumeric)?0:"");
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
	var array_slas = [];

	//-- get slas to check
	var oRS = app.g.get_sqrecordset("general/get_sla_frtime","slas=" + strSLAS);
	while(oRS.Fetch())
	{
		strName = app.g.get_field(oRS,"name");
		intFixTime = app.g.get_field(oRS,"fixtime");
		intRespTime = app.g.get_field(oRS,"resptime");
		array_slas[strName] = intFixTime + ":" + intRespTime;
	}

	var arrinfo = [];
	for(strSLA in array_slas)
	{
		arrInfo = array_slas[strSLA].split(":");
		var intTestFixTime = Number(arrInfo[0]);
		var intTestResTime = Number(arrInfo[1]);

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


//-- get quick log call resolution / close details
fglobal.prototype.get_qlog_resclose_details = fglobal_get_qlog_resclose_details;
function fglobal_get_qlog_resclose_details(intCallref,boolMultiCalls)
{

    if(boolMultiCalls)
    {
        //-- Only applicable if there is only one Provided Call ref
        return false;
    }

    // get the ID of the Quick Log details record from opencall
    var strParams = "crf="+pfu(intCallref);
    var SqlRecordSetObj = new SqlQuery;
    SqlRecordSetObj.Reset();
    SqlRecordSetObj.InvokeStoredQuery("form/resolvecloseform/get_qlog_id_for_call",strParams);

    if(SqlRecordSetObj.Fetch())
    {
        //-- get the recordset value for survey name and id
        var qLogDetailsId = SqlRecordSetObj.GetValueAsNumber("custom_i3");
    }
    else
    {
        //-- no quick log call informatin for this call
        return false;
    }
        
    // Only proceed if the ID is >= 1. It does mean it is not a quick log

    if (pfu(qLogDetailsId)>0)
    {
        // Use the ID of the Quick Log details record to get the Quick Log Details
        var strQIdParams = "qid="+pfu(qLogDetailsId);
        

        var SqlRecordSetObjQId  = new SqlQuery;
        SqlRecordSetObjQId.Reset();
        SqlRecordSetObjQId.InvokeStoredQuery("form/resolvecloseform/get_qlog_details",strQIdParams);

        if(!SqlRecordSetObjQId.Fetch()) // will only retrieve one record as using an auto id value
        {
            //-- should not get here
            return false;
        }
        else
        {   
            var files_associate=[];
            var objQLC = new Object();
            objQLC.qLogUdSource = SqlRecordSetObjQId.GetValueAsString("udsource");
            objQLC.qLogUdCode = SqlRecordSetObjQId.GetValueAsString("udcode");
            objQLC.qLogUpdateTxt = SqlRecordSetObjQId.GetValueAsString("updatetxt");
            objQLC.qLogFlgPublic = SqlRecordSetObjQId.GetValueAsNumber("flg_public");
            objQLC.qLogFlgEmail = SqlRecordSetObjQId.GetValueAsNumber("flg_email");
            objQLC.qLogFlgChargeable = SqlRecordSetObjQId.GetValueAsNumber("flg_chargeable");
            objQLC.qLogFlgAddToKb = SqlRecordSetObjQId.GetValueAsNumber("flg_add_to_kb");
            objQLC.qLogTimeSpent = SqlRecordSetObjQId.GetValueAsNumber("timespent");
            objQLC.qLogFlgFirstTimeFix = SqlRecordSetObjQId.GetValueAsNumber("flg_first_time_fix");
            objQLC.qLogFixCode = SqlRecordSetObjQId.GetValueAsString("fixcode");
            objQLC.qLogContract = SqlRecordSetObjQId.GetValueAsString("fk_contract_id");
            objQLC.qLogSuppUnit = SqlRecordSetObjQId.GetValueAsNumber("units_spend_call");
            //We ask for the value of the file associated to our details
            //If the file exits, it means we have files associated to our details
            var isFile = SqlRecordSetObjQId.GetValueAsString("filename");


            if (isFile){
                objQLC.qLogFiles = app.g.get_qlog_resclose_files(qLogDetailsId);
            }
            return objQLC;
        }
        
    }
}

//-- get quick log call resolution / close details
fglobal.prototype.get_qlog_resclose_files = fglobal_get_qlog_resclose_files;
function fglobal_get_qlog_resclose_files(intCallref)
{
    var strParams = "qid="+pfu(intCallref);
    var q = new SqlQuery();
    q.Reset();
    q.InvokeStoredQuery("form/resolvecloseform/get_qlog_files",strParams);
    
    var files_associate = [];

    while (q.Fetch())
          {

           var intCols = q.GetColumnCount();

           //Storage one row of the files in one object
           //One the object is done we storage in an array.
           //More than one file can be associated to one detail
           oRec = {};
           for (x=0; x < intCols;x++){
                var colName = q.GetColumnName(x);
                var colValue = q.GetValueAsString(colName);
                oRec[LC(colName)] = colValue;
                
           }
           
           files_associate.push(oRec);
    }

    return files_associate;
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
	var array_slas = [];

	//-- get slas to check
	var oRS = app.g.get_sqrecordset("general/get_sla_frtime","slas=" + strSLAS);
	while(oRS.Fetch())
	{
		strName = app.g.get_field(oRS,"name");
		intFixTime = app.g.get_field(oRS,"fixtime");
		intRespTime = app.g.get_field(oRS,"resptime");
		array_slas[strName] = intFixTime + ":" + intRespTime;
	}

	var arrinfo = [];
	for(strSLA in array_slas)
	{
		arrInfo = array_slas[strSLA].split(":");
		var intTestFixTime = Number(arrInfo[0]);
		var intTestResTime = Number(arrInfo[1]);

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

//-- nwj - 13.05.2009 - written specifically for samria.e but useful none the less
fglobal.prototype.get_sla_end_date = fglobal_get_sla_end_date;
function fglobal_get_sla_end_date(intStartDatex, strCheckSLA, intNumberOfWorkingDays,boolIdentDays)
{
	//###20120704 - capture of all intermingling actual work days
	if(boolIdentDays==undefined)boolIdentDays=false;
	var actual_days = [];
	var i = 0;

	var array_weeksdays = new Array("sun","mon","tue","wed","thu","fri","sat");
	var array_days = [];	
	var arr_excludes = [];

	//-- get sla to check
	var ap = {};
	ap.name=strCheckSLA;
	var oRS = app.g.get_tablerecordset_bycol("system_sla",ap,true);

	if(oRS.Fetch())
	{
		strName = app.g.get_field(oRS,"name");
		for(var x=0;x<array_weeksdays.length;x++)
		{
			array_days[array_weeksdays[x]] = Number(app.g.get_field(oRS, array_weeksdays[x] + "_end")) - Number(app.g.get_field(oRS,array_weeksdays[x] + "_start"));
		}
	}

	//-- get sla exclusions
	var ap = {};
	ap.slaid=app.g.get_field(oRS,"slaid");
	var oExcRS = app.g.get_tablerecordset_bycol("system_sla_excludes",ap,true);

	while(oExcRS.Fetch())
	{
		var key = app.g.get_field(oExcRS, "day") + ":" + app.g.get_field(oExcRS, "month");
		arr_excludes[key] = Number(app.g.get_field(oExcRS, "year"));
	}

	//-- convert passed in epoch to date
	var aDate = this.convert_epochdate(intStartDatex);
	//-- get day for passed in date
	while (intNumberOfWorkingDays>0)
	{
		//-- get day of date and check if we have working time
		var intMonthDate = aDate.getDate();
		var strDay = array_weeksdays[aDate.getDay()];
		if(array_days[strDay] > 0)
		{
			//-- check if excluded
			var checkkey = intMonthDate + ":" + Number(aDate.getMonth()+1);
			if(arr_excludes[checkkey]==undefined)
			{
				//-- not excluded for this day month
				//-- decrease number of working days
				--intNumberOfWorkingDays;
				
				//###20120704
				actual_days[i] = Number(aDate.getTime()/1000.0)
				i++;
			}
			else
			{
				//-- check year
				var checkyear = Number(arr_excludes[checkkey]);
				if(checkyear==1970 || checkyear==aDate.getFullYear())
				{
					//-- exclude
				}
				else
				{
					//-- decrease number of working days
					--intNumberOfWorkingDays;

					//###20120704
					actual_days[i] = Number(aDate.getTime()/1000.0)
					i++;

				}
			}
		}

		//-- increment date by one
		intMonthDate++;
		aDate.setDate(intMonthDate);
	}
	//-- adjust -1 to compensate for > 0 ... which is needed to do exclusion check
	// -- Month should be adjusted if the date is adjusted from 1st to last day of last month
	if(aDate.getDate()==1)
		aDate.setMonth(aDate.getMonth()-1);
	aDate.setDate(intMonthDate-1);
	
	return (boolIdentDays)?actual_days:Number((aDate.getTime()/1000.0));
}
//###2012075 array all working days
fglobal.prototype.get_workdays_till_date = fglobal_get_workdays_till_date;
function fglobal_get_workdays_till_date(intStartDatex, strCheckSLA, intEndDatex,boolIdentDays)
{
	//###20120704 - capture of all intermingling actual work days
	if(boolIdentDays==undefined)boolIdentDays=false;
	var actual_days = [];
	var i = 0;

	var array_weeksdays = new Array("sun","mon","tue","wed","thu","fri","sat");
	var array_days = [];

	//-- get sla to check

	var ap = {};
	ap.name=strCheckSLA;
	var oRS = app.g.get_tablerecordset_bycol("system_sla",ap,true);

	if(oRS.Fetch())
	{
		strName = app.g.get_field(oRS,"name");
		for(var x=0;x<array_weeksdays.length;x++)
		{
			array_days[array_weeksdays[x]] = Number(app.g.get_field(oRS, array_weeksdays[x] + "_end")) - Number(app.g.get_field(oRS,array_weeksdays[x] + "_start"));
		}
	}

	//-- get sla exclusions
	var arr_excludes = [];

	var ap = {};
	ap.slaid=app.g.get_field(oRS,"slaid");
	var oExcRS = app.g.get_tablerecordset_bycol("system_sla_excludes",ap,true);
	while(oExcRS.Fetch())
	{
		var key = app.g.get_field(oExcRS, "day") + ":" + app.g.get_field(oExcRS, "month");
		arr_excludes[key] = Number(app.g.get_field(oExcRS, "year"));
	}

	//-- convert passed in epoch to date
	var aDate = this.convert_epochdate(intStartDatex);
	var bDate = this.convert_epochdate(intEndDatex);
	//-- get day for passed in date
	while (aDate < bDate)
	{
		//-- get day of date and check if we have working time
		var intMonthDate = aDate.getDate();
		var strDay = array_weeksdays[aDate.getDay()];
		if(array_days[strDay] > 0)
		{
			//-- check if excluded
			var checkkey = intMonthDate + ":" + Number(aDate.getMonth()+1);
			if(arr_excludes[checkkey]==undefined)
			{
				//-- not excluded for this day month
				actual_days[i] = Number(aDate.getTime()/1000.0)
				i++;
			}
			else
			{
				//-- check year
				var checkyear = Number(arr_excludes[checkkey]);
				if(checkyear==1970 || checkyear==aDate.getFullYear())
				{
					//-- exclude
				}
				else
				{
					actual_days[i] = Number(aDate.getTime()/1000.0)
					i++;
				}
			}
			
		}

		//-- increment date by one
		intMonthDate++;
		aDate.setDate(intMonthDate);
		
	}
	actual_days[i] = intEndDatex;
	
	return (boolIdentDays)?actual_days:actual_days.length;
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
function fglobal_search_for(strSearchType, boolMulti,strAppendURL, funcCallback)
{
	if(boolMulti==undefined)boolMulti=true;
	if(strAppendURL==undefined)strAppendURL="";

	var strMulti = (boolMulti)?"1":"0";
	var strURL = "searchmode=1&multiselect=" + strMulti;
	if(strAppendURL!="")
	{
		strURL+="&" + strAppendURL;
	}

	app.g.popup("search_" + strSearchType,strURL,function(aForm)
	{
		var tmpObj = {};
		if (aForm)
		{
			
			if (IsObjectDefined("_bHtmlWebClient"))
			{
				var _swdoc = top;
				tmpObj.selectedkeys = aForm._swdoc.strSelectedKeys;
				tmpObj.selectedpfskeys = app.g.pfs_keys(aForm._swdoc.strSelectedKeys);
				tmpObj.selectedtext = aForm._swdoc.strSelectedText;
				tmpObj.selectedother = aForm._swdoc.strSelectedOther;
				tmpObj.selectedcmdbids = aForm._swdoc.strSelectedCMDBIDs;
				tmpObj.selectedcompanyids = aForm._swdoc.strSelectedCompIDs;
				try
				{
					tmpObj.selectedphone = aForm._swdoc.strSelectedPhone;
				}
				catch(e)
				{
					//-- If strSelectedPhone is not defined (i.e. this is a search for orgs not a search for customers)...
					//-- ...catch the error and do nothing.
					//-- For some reason...
					//--		if(typeof aForm.document.strSelectedPhone != "undefined")
					//-- ...does not work ???
				}
			}
			else
			{
				tmpObj.selectedkeys = aForm.document.strSelectedKeys;
				tmpObj.selectedpfskeys = app.g.pfs_keys(aForm.document.strSelectedKeys);
				tmpObj.selectedtext = aForm.document.strSelectedText;
				tmpObj.selectedother = aForm.document.strSelectedOther;
				tmpObj.selectedcmdbids = aForm.document.strSelectedCMDBIDs;
				tmpObj.selectedcompanyids = aForm.document.strSelectedCompIDs;
				try
				{
					tmpObj.selectedphone = aForm.document.strSelectedPhone;
				}
				catch(e)
				{
					//-- If strSelectedPhone is not defined (i.e. this is a search for orgs not a search for customers)...
					//-- ...catch the error and do nothing.
					//-- For some reason...
					//--		if(typeof aForm.document.strSelectedPhone != "undefined")
					//-- ...does not work ???
				}
			}
		}
		else
		{
			tmpObj.selectedkeys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
	});	
}


//-- 16.02.2007 - NWJ - get pc info from code
fglobal.prototype.get_pcinfo = fglobal_get_pcinfo;
function fglobal_get_pcinfo(strCode)
{
	var ap = {};
	ap.code = strCode;
	var oRS = app.g.get_tablerecordset_bycol("pcdesc",ap,false,"info");

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
	var ap = {};
	ap.keysearch = strMgrKeysearch;
	var oRS = app.g.get_tablerecordset_bycol("userdb",ap,false,"keysearch");
	if(oRS.Fetch())
	{
		return	app.g.get_field(oRS,"fullname");
	}

	return "<has none>";
}

//-- 16.02.2007 - NWJ - Resolve supportworks analyst - expects frmPickAnalyst to exist
fglobal.prototype.resolve_analyst = fglobal_resolve_analyst;
function fglobal_resolve_analyst(strColumn, varValue, funcCallback)
{
	var strAnalystIDs = "";
	var counter=0;
	var p = {};
	p.v = varValue;
	p.c = strColumn;
	var oRS = app.g.get_sqrecordset("analysts/resolve_analyst",p);
	while(oRS.Fetch())
	{
		if(strAnalystIDs!="")
		{
			strAnalystIDs +=",";
		}

		tmpID = app.g.get_field(oRS,"analystid");
		strAnalystIDs += tmpID
		counter++;
	}

	//-- no match
	if (counter==1)
	{
		//-- only one - so get record
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(app.g.get_analyst_detail(strAnalystIDs));
		}
	}
	else if(counter>1)
	{
		//-- more than one match - popup analyst selector
		var strURL = "aid=" + pfu(strAnalystIDs);
		app.g.popup("picklist_analyst",strURL,function(aForm)
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				if (aForm)
				{
					if (IsObjectDefined("_bHtmlWebClient"))
					{
						var _swdoc = top;
						var strAnalystID = aForm._swdoc.selectedkey;
					}
					else
					{
						var strAnalystID = aForm.document.selectedkey;
					}
					
					funcCallback(app.g.get_analyst_detail(strAnalystID));
				}
				else
				{
					funcCallback(false);
				}
			}
		});	
	}
	else
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(false);
		}
	}
	
}

//-- 08.02.2007 - NWJ - Create an update statement based on form fields that are bound to a table
//--					Pass in form object, tablename and the primary key value
fglobal.prototype.form_update_statement = fglobal_form_update_statement;
function fglobal_form_update_statement(aForm, strTable, varKeyValue)
{
	var arrCols = [];
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
				//if (updateString!="")updateString += ","
				//updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
				arrCols[colName] = colValue;
			}
		}
	}
	
	//var primaryCol = this.dd_primarykey(strTable);
	//strSQL = "uxpdate " + strTable + " set " + updateString + " where " + primaryCol + " =  " + this.encapsulate(strTable,primaryCol,varKeyValue);
	//return this.sxubmitsql(strSQL);
	return this.submittableupdate(strTable,varKeyValue,arrCols);
}

//-- 08.02.2007 - NWJ - Create an update statement based on form fields that are bound to a table
//--					Pass in form object, tablename and the where clause to use to update
fglobal.prototype.form_whereupdate_statement = fglobal_form_whereupdate_statement;
function fglobal_form_whereupdate_statement(aForm, strTable, strWhere)
{
	MessageBox("fglobal.prototype.form_whereupdate_statement has been disabled as it uses raw sql. Please contact your Administrator");
	return false;
}

//-- NWJ - 08.02.2007 - given a binding and a form get the element value linked to the binding
fglobal.prototype.get_value_from_binding = fglobal_get_value_from_binding;
function fglobal_get_value_from_binding(aForm, strBinding)
{
	var oRes = {}
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
	//-- Check calls are not the same...
	if(intCallrefM==intCallrefS)
	{
		MessageBox("Cannot relate a call to itself.");
		return false;
	}
	if(strCode==undefined)strCode = "";
	//var strTable = "CMN_REL_OPENCALL_OC";
	//var strSQL = "ixnsert into " + strTable + " (FK_CALLREF_M,FK_CALLREF_S,RELCODE) values (" + intCallrefM + "," + intCallrefS + ",'" + strCode + "')";
	//return app.g.sxubmitsql(strSQL,true);
	var strParams = "fcm="+intCallrefM+"&fcs="+intCallrefS+"&rc="+pfu(strCode);
	return app.g.submitsqs("call/process/relate_calls",strParams);

}

//-- 02.11.2006 - NWJ - for a given master call unrelate 1 or more calls
fglobal.prototype.unrelate_slave_calls = fglobal_unrelate_slave_calls;
function fglobal_unrelate_slave_calls(intCallrefM,intCallrefS,strCode)
{
	//--
	//-- if intCallrefS = "1,2,3,4" will be ok so we can do a mass un-relate
	//var strTable = "CMN_REL_OPENCALL_OC";
	//var strSQL = "dxelete from " + strTable + " where FK_CALLREF_M = " + intCallrefM + " and FK_CALLREF_S in(" + intCallrefS + ")";
	//if(strCode != undefined) strSQL = strSQL + " and RELCODE = '" + strCode + "'";
	//return app.g.sxubmitsql(strSQL,true);
	var strParams = "fcm="+intCallrefM+"&fcs="+intCallrefS+"&rc="+pfu(strCode);
	return app.g.submitsqs("call/process/unrelate_slave_calls",strParams);

}

fglobal.prototype.unrelate_kbdoc = fglobal_unrelate_kbdoc;
function fglobal_unrelate_kbdoc(intCallrefM,strDocs,strCode)
{
	//--
	//-- if intCallrefS = "1,2,3,4" will be ok so we can do a mass un-relate
	//var strTable = "CMN_REL_OPENCALL_KB";
	//var strSQL = "dxelete from " + strTable + " where FK_CALLREF = " + intCallrefM + " and FK_KBDOC in(" + strDocs + ")";
	//if(strCode != undefined) strSQL = strSQL + " and RELCODE = '" + strCode + "'";
	//return app.g.sxubmitsql(strSQL,true);
	var strParams = "fc="+intCallrefM+"&fkbd="+strDocs+"&rc="+pfu(strCode);
	return app.g.submitsqs("call/process/unrelate_kbdoc",strParams);

}

fglobal.prototype.unrelate_master_calls = fglobal_unrelate_master_calls;
function fglobal_unrelate_master_calls(intCallrefM,intCallrefS,strCode)
{
	//--
	//-- if intCallrefS = "1,2,3,4" will be ok so we can do a mass un-relate
	//var strTable = "CMN_REL_OPENCALL_OC";
	//var strSQL = "dxelete from " + strTable + " where FK_CALLREF_M in(" + intCallrefM + ") and FK_CALLREF_S  = " + intCallrefS + "";
	//if((strCode != undefined)&&((strCode != ""))) strSQL = strSQL + " and RELCODE = '" + strCode + "'";
	//return app.g.sxubmitsql(strSQL,true);
	var strParams = "fcm="+intCallrefM+"&fcs="+intCallrefS+"&rc="+pfu(strCode);
	return app.g.submitsqs("call/process/unrelate_master_calls",strParams);
}

//-- get customers for list of calls
fglobal.prototype.get_customers_on_calls = fglobal_get_customers_on_calls;
function fglobal_get_customers_on_calls(intCallrefs)
{
	var strCustomers = "";
	var oRS = app.g.get_sqrecordset("call/get_customers_on_calls.select","crs="+intCallrefs);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"CUST_ID");
		if (strCustomers!="")strCustomers +=",";
		strCustomers += currKey;
	}
	if(strCustomers=="")strCustomers="-1";
	return strCustomers;
}


//-- get orgs for list of calls
fglobal.prototype.get_companies_on_calls = fglobal_get_companies_on_calls;
function fglobal_get_companies_on_calls(intCallrefs)
{
	return this.get_orgs_on_calls(intCallrefs);
}


//-- get customers for list of calls
fglobal.prototype.get_orgs_on_calls = fglobal_get_orgs_on_calls;
function fglobal_get_orgs_on_calls(intCallrefS)
{
	var strCustomers = "";

	var ap={};
	ap.crs = intCallrefS
	var oRS = app.g.get_sqrecordset("call/get_orgs_on_calls.select",ap);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_COMPANY_ID");
		if (strCustomers!="")strCustomers +=",";
		strCustomers += currKey;
	}
	if(strCustomers=="")strCustomers="-1";
	return strCustomers;
}

//-- 02.11.2006 - NWJ - for a master call get its related slave calls
fglobal.prototype.get_slave_calls = fglobal_get_slave_calls;
function fglobal_get_slave_calls(intCallrefM,strCode,boolActive)
{
	
	//-- check if only want to get active calls
	if(boolActive==undefined)boolActive=false;

	var strCallrefList = "";
	//-- TK SQL Optimisation
	if(intCallrefM == 0) return 0;
	var ap={};
	ap.crs = intCallrefM;
	ap.rc=strCode;
	ap.ba = boolActive;
	var oRS = app.g.get_sqrecordset("call/get_slave_calls.select",ap);

	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"FK_CALLREF_S");
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
	var strCallrefList = "";
	
	//-- TK SQL Optimisation
	if(intCallrefS == 0) return 0;
	var ap={};
	ap.crs = intCallrefS
	ap.rc=strCode;
	ap.ba = boolActive;
	var oRS = app.g.get_sqrecordset("call/get_master_calls.select",ap);

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

	//-- set to load by callref - can use common script for this
	oSqlList.storedQuery = "common.load_by_callref";
	_slf(oSqlList , "crs=" + strFilter);
	oSqlList.SetRowSelected(0);
}

//-- 02.11.2006 - NWJ - for a slave call get its related master calls and load passed in sqllist
fglobal.prototype.sl_load_call_masters = fglobal_sl_load_call_masters;
function fglobal_sl_load_call_masters(oSqlList, intCallrefS , strCode)
{
	var strFilter = this.get_master_calls(intCallrefS,strCode);
	//-- set to load by callref - can use common script for this
	oSqlList.storedQuery = "common.load_by_callref";
	_slf(oSqlList , "crs=" + strFilter);
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
	SW_WEBSERVER = this.get_webserver() + "/sw/clisupp/";
    return app.global.HttpGet(SW_WEBSERVER + strURL, boolSWsession);
}

//-- 27.08.2004
//-- NWJ
//-- return the webserver name:port for SW (http://servername:port)
fglobal.prototype.get_webserver = fglobal_get_webserver;
function fglobal_get_webserver()
{
    //-- strUrl should be like /php_scripts/myphp.php
    intHttpPort = app.session.httpPort;
	if (intHttpPort==443)
		strProtocol = "https";
	else
		strProtocol = "http";
	
	return strProtocol + "://" + app.session.server + ":" + intHttpPort;
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


//-- 22.08.2008
//-- NWJ
//-- load SqlRecord and populate form fields that
//-- are bound to strTable
fglobal.prototype.get_form_recorddata = pt_get_form_recorddata;
function pt_get_form_recorddata(strTable,key,oForms,boolClearForm,filterFieldNameIndex,boolNoDataRef)
{
    var oRec = new SqlRecord();   
	boolNoDataRef= (boolNoDataRef == undefined)?false:boolNoDataRef;
    if (oRec.GetRecord(strTable,key))
    {
        //-- populate fields
		this.refresh_data_fields(strTable,oRec,oForms,filterFieldNameIndex,boolNoDataRef)
    }
    else
    {
        //-- get record failed so clear fields
		if(boolClearForm==undefined)boolClearForm=true;
        if (boolClearForm)this.clear_fields(strTable,oForms,boolNoDataRef);
		oRec = false;
    }
	return oRec;
}
//-- eof get_form_recorddata
//--

//-- 18.08.2004
//-- NWJ
//-- load SqlRecord and pass it back
//--
//-- 30.04.2009 - added overriding column
fglobal.prototype.get_record = fglobal_get_record;
function fglobal_get_record(strTable,pkey,strOverrideCol)
{
	if(!strOverrideCol)
		strOverrideCol="";
	var oRec = false;
	var strParams = "table="+strTable+"&kv="+pfu(pkey);
	if(strOverrideCol!=undefined) strParams +="&okc="+pfu(strOverrideCol);

	var aRS = this.get_sqrecordset("select.tablebykey",strParams); 
	if(aRS.Fetch())
	{
		//-- create new object and assign to it the fields from the rs
		oRec = {};
		for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
		{
			var colName = LC(dd.tables[LC(strTable)].columns[x].Name);
			var colValue = app.g.get_field(aRS,colName);
			oRec[LC(colName)] = colValue;
		}
	}
	return oRec;
}

fglobal.prototype.get_sys_record = fglobal_get_sys_record;
function fglobal_get_sys_record(strTable,pkey,strOverrideCol)
{
	var oRec = false;
	var strParams = "cdb=1&table="+strTable+"&kv="+pfu(pkey)
	if(strOverrideCol!=undefined) strParams +="&okc="+pfu(strOverrideCol);

	var oRS = this.get_sqrecordset("select.tablebykey",strParams); 
	if(oRS.Fetch())
	{
		var intCols = oRS.GetColumnCount();

		oRec = {};
		for (x=0; x < intCols;x++)
		{
			var colName = oRS.GetColumnName(x);
			var colValue = app.g.get_field(oRS,x);
			oRec[LC(colName)] = colValue;
		}
	}
	return oRec;
}


fglobal.prototype.get_record_from_syscache = fglobal_get_record_from_syscache;
function fglobal_get_record_from_syscache(strTable, strWhere)
{
	//-- nwj - you should be be using this function anymore. If you need to get a sys record by key then use app.g.get_sys_record(strTable,pkey,strOverrideCol) 
	//-- if you have to use a where clause i.e. "somecol = something OR someothercol=something" then you have to write a specific storedquery
	MessageBox("fglobal.prototype.get_record_from_syscache has been disabled as it uses raw sql. Please contact your Administrator");
	return false;
}

//-- eof get_record
//--
//-- 18.08.2004
//-- NWJ
//-- load SqlRecord and pass it back
fglobal.prototype.get_recordwhere = fglobal_get_recordwhere;
function fglobal_get_recordwhere(strTable,strWhere)
{
	MessageBox("fglobal.prototype.get_recordwhere has been disabled as it uses raw sql. Please contact your Administrator");
	return false;
}
//-- eof get_recordwhere
//--

fglobal.prototype.get_sf_record = fglobal_get_sf_record;
function fglobal_get_sf_record(strTable,strFilter,arrParams)
{
	strStoredQuery = "select.tablebyfilter";
	var strParams = "table=" + LC(strTable) + "&sf=" + pfu(strFilter);
	for(strCol in arrParams)
	{
		strParams += "&" + LC(strCol) +"=" + pfu(arrParams[strCol]);
	}
	
	var oRec = false;
	var aRS = this.get_sqrecordset("select.tablebyfilter",strParams); 
	if(aRS.Fetch())
	{
		//-- create new object and assign to it the fields from the rs
		oRec = {};
		for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
		{
			var colName = LC(dd.tables[LC(strTable)].columns[x].Name);
			var colValue = app.g.get_field(aRS,colName);
			oRec[LC(colName)] = colValue;
		}
	}
	return oRec;
}

//-- NWJ
//-- 30.11.2012
//-- return single record based on passed in cols (will do a col1=colvalue and col2=value)
fglobal.prototype.get_tablerecord_bycol = fglobal_get_tablerecord_bycol;
function fglobal_get_tablerecord_bycol(strTable,arrParams,bCache, strSelectCols)
{
	strStoredQuery = "select.tablebycol";
	strParams = "table=" + LC(strTable);
	for(strCol in arrParams)
	{
		strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrParams[strCol]);
	}

	if(bCache)strParams+="&cdb=1";
	if(strSelectCols!=undefined)strParams += "&_select_=" + strSelectCols;

	var oRec = false;
    var oRS = new SqlQuery();
    oRS.InvokeStoredQuery(strStoredQuery, strParams);
	if(oRS.Fetch())
	{
		var intCols = oRS.GetColumnCount();
		oRec = {};
		for (x=0; x < intCols;x++)
		{
			var colName = oRS.GetColumnName(x);
			var colValue = app.g.get_field(oRS,x);
			oRec[LC(colName)] = colValue;
		}
	}
	return oRec;
}


//-- 22.08.2008
//-- NWJ
//-- Populate fields in _swdoc that
//-- are bound to strTable from oRec
fglobal.prototype.populate_form_fields = pt_populate_form_fields;
function pt_populate_form_fields(strTable,oForm,oRec,filterFieldNameIndex,boolNoDataRef)
{
		filterFieldNameIndex = (filterFieldNameIndex==undefined)?"":filterFieldNameIndex;
		boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;

		//-- for each db field on form loop
		for (var x = 0; x<oForm.elements.length;x++)
	    {
		    var element = oForm.elements[x];

			if ( (boolHasDataLink(element,strTable,boolNoDataRef)) && ((element.type == FE_FIELD)||(element.type == FE_SEARCHFIELD)) )			
			{
				//-- 21.09.2004
				//-- NWJ
				//-- add new filterFieldNameIndex (so check field name for filter = if specified make sure matches)
				//-- MessageBox(filterFieldNameIndex + " : " + element.name);
				if ( (filterFieldNameIndex == "") || (element.name.indexOf(filterFieldNameIndex)!=-1) )
				{
			        //-- get field colName and extract value into db fiel from rec
					var colName = returnColName(element,boolNoDataRef);

					//-- check if colName is a dual search has a "!"
					var dual = colName.split("!");
					if (dual.length > 1)
					{
						var strValue = oRec[dual[0]] + " " + oRec[dual[1]];
						if (element.text != strValue)_ete(element , strValue);
					}
					else
					{
						//-- change if different
						if (this.dd_fieldexists(strTable,colName))
						{
						
							if (element.text != oRec[colName])
							{
								if (colName.indexOf("datex") != -1)
								{
									//-- handle dates fixes
									_ete(element, this.fix_epoch(oRec[colName]));
								}
								else
								{
									_ete(element, oRec[colName]);
								}
							}
						}
						else
						{
							MessageBox("Form Field Warning : The table field [" + strTable + "][" + colName + "] does not exist in the data dictionary");
						}
					}
				}//-- filterFieldNameIndex
	        }
		}
}
//-- eof populate_form_fields
//--


//-- 22.08.2008
//-- NWJ
//-- Reload form data with a given sqlrecord (replace for standard UpdateFormFromData as that clears non dataref fields)
fglobal.prototype.refresh_data_fields = pt_refresh_data_fields;
function pt_refresh_data_fields(strTable,oRec,oForm,filterFieldNameIndex,boolNoDataRef)
{
		//-- populate mainform
		//-- MessageBox("refresh data fields " + oForm);
		if (oForm!=undefined)this.populate_form_fields(strTable,oForm,oRec,filterFieldNameIndex,boolNoDataRef);

}
//-- eof populate_form_fields
//--


//-- 04.08.2004
//-- NWJ
//-- Clear fields in _swdoc that
//-- are bound to strTable
//-- var arrNumericPickListFields - added for 3.1.0 - used to provide means to supply an array of picklist field names
//--								where the distinct column is an integer, this is used as we cannot access the distinct
//--								column property via JS.  In such cases we need to set the element text to 0 rather than "" 
//--								for strings
fglobal.prototype.clear_form_fields = fglobal_clear_form_fields;
function fglobal_clear_form_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef,arrNumericPickListFields)
{
    //-- handle undefined vars
	filterFieldNameIndex = (filterFieldNameIndex==undefined)?"":filterFieldNameIndex;
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;
	if(arrNumericPickListFields==undefined)
		arrNumericPickListFields="";

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
				if(in_array(arrNumericPickListFields,element.name))
				{
					_ete(element, "0");
				}
				else
				{
					 //-- get field colName and extract value into db fiel from rec
					 _ete(element, "");
				}
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
	filterFieldNameIndex = (filterFieldNameIndex==undefined)?"":filterFieldNameIndex;
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;

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
				_een(element, false);
			}
        }
    }
}
//--

//-- 17.08.2004
//-- NWJ
//-- disable fields in _swdoc that
//-- are bound to strTable
fglobal.prototype.enable_form_fields = fglobal_enable_form_fields;
function fglobal_enable_form_fields(strTable,oForm,filterFieldNameIndex,boolNoDataRef)
{
	//-- handle undefined vars
	filterFieldNameIndex = (filterFieldNameIndex==undefined)?"":filterFieldNameIndex;
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;

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
				_een(element, true);
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
        if ((element.type != FE_SEARCHFIELD)&&(element.type !=FE_LABEL))
        {		
			if(boolHasDataLink(element,strTable,(element.dataRef=="")))
			{
				//-- get col info
				var strColName = returnColName(element,(element.dataRef==""));
				_ete(element, aRec[strColName.toLowerCase()]);
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
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;
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
		app.OpenFormForEdit(frmName, varKey, strURL, intModal, function()
		{		
			if (intModal==1)
			{
				app.g.sqllist_refresh(oList,pFunction,oList.curSel);
			}
			// -- callback
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback();
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
	//this.addME(frmName,strURL,intModal,strApplication);
	app.OpenFormForAdd(frmName,"",strURL,intModal,function()
	{
		if (intModal==1)
		{
			app.g.sqllist_refresh(oList,pFunction,oList.curSel);
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
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
	if (strKey=="")
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
		}
	}
	else
	{
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
				funcCallback();
			}
		});
	}
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

	//--
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
	_slraw(oList, strSql);
	//-- perform a sleep because list doesnt refresh properly when applying filter
	oList.Refresh();

    if (selRow == undefined) selRow = 0;
    oList.SetRowSelected(selRow);

	//--
	//-- if a function reference was passed in then execute it
	if (executeFunc != undefined)executeFunc(selRow);
}

//-- ryanc - 13.11.2012
fglobal.prototype.sl_kv_appendfilter = fglobal_sqllist_kv_appendfilter;
fglobal.prototype.sqllist_kv_appendfilter = fglobal_sqllist_kv_appendfilter;
function fglobal_sqllist_kv_appendfilter(oList,strAppendFilter,intKeyCol)
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
	_slf(oList , "_kv=" + strFilter);
	oList.SetRowSelected(0);
	return true;
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

	//-- 21.11.2012 - nwj - if strAppendFilter starts with ' and ends with ' then it has been prepared 
	//-- we need to unprepare it so we can do the prep serverside
	strAppendFilter +=""; //-- cast
	var s = strAppendFilter.charAt(0);
	var e = strAppendFilter.charAt(strAppendFilter.length-1);
	if(s=="'" && e=="'")
	{
		//-- string may be like 'a','b','c' - so remove first and last ' so we get a','b','c
		//-- we can then split by ',' to give us keys
		strAppendFilter = strAppendFilter.substr(1,strAppendFilter.length-2);
		var arrFilter = strAppendFilter.split("','") ;
		strAppendFilter = "";
		for(var x=0;x<arrFilter.length;x++)
		{
			if(strAppendFilter!="")strAppendFilter+=",";
			strAppendFilter +=arrFilter[x];
		}
	}

	//-- 21.11.2012 - nwj - note no encaps or pfs for strFilter as we now want to do this serverside 
	var strColName = (isNaN(intKeyCol))?intKeyCol:oList.GetColumnName(intKeyCol);
	var strFilter = this.sl_get_valuesdel(oList,intKeyCol,",","",false);
	if (strFilter != "") 
	{
		strFilter += "," + strAppendFilter;
	}
	else
	{
		strFilter = strAppendFilter;
	}

	var strSQ = oList.storedQuery;

	if(strSQ=="common.load_by_pkautoid" && strColName=="pk_auto_id")
	{
		_slf(oList , "pids=" + strFilter);
	}
	else
	{
		oList.storedQuery = "common.load_by_colname";
		_slf(oList , "swc=" + strColName + "&kvs=" + strFilter);
		oList.SetRowSelected(0);
	}
	oList.storedQuery = strSQ;
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
	if ((strFilter == null) || (strFilter==undefined))
	{
		MessageBox("Developer Warning : no Filter has been given for function sqllist_filter");
		return false;

	}

	//-- nwj - allow dev to pass strFilrwer as array or object which we convert to string
	if (typeof strFilter !== 'string') 
	{
		var arrParams = strFilter;
		strFilter = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strFilter!="")strFilter+="&";
			strFilter += strKey +"=" + pfu(arrParams[strKey]);
		}
	}
	 

    _slf(oList,strFilter);

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

fglobal.prototype.sqllist_deldbrows = fglobal_sqllist_deldbrows;
fglobal.prototype.sl_deldbrows = fglobal_sqllist_deldbrows;
function fglobal_sqllist_deldbrows(oList,keyCol,pFunction,strConfirm)
{
	if(keyCol=="")keyCol = dd.tables[LC(oList.table)].PrimaryKey;
	
	var strTable = oList.table;

	if ((strConfirm!=undefined) && (strConfirm!= null) && (strConfirm!=""))
	{
		if (!confirm(strConfirm)) return false;
	}

	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			var strKey = oList.GetItemTextRaw(x,keyCol);
			if (this.sqlexecute_delete(strTable,strKey))
			{
				//--
				//-- if a function reference was passed in then execute it
				if ((pFunction != undefined) && (pFunction != null))
				{
					pFunction(0);
				}
			}
		}
	}
	
	oList.Refresh();

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
			if(LC(oList.GetColumnName(i)) ==  dd.tables[LC(oList.table)].PrimaryKey)
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
	var foundRowNum = this.sqllist_findrow_byvalue(oList,strValue,ColPos);
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

	var valueArray = [];
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

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			if (strKeys !="")strKeys +=strDel;
			var strVal = oList.GetItemTextRaw(x,ColPos);
			strKeys  += strVal;
		}
	}
	return strKeys;
}

//-- return a delimieted string of checked keys
fglobal.prototype.sl_getchecked_valuesdel = fglobal_sqllist_getchecked_valuesdel;
fglobal.prototype.sqllist_getchecked_valuesdel = fglobal_sqllist_getchecked_valuesdel;
function fglobal_sqllist_getchecked_valuesdel(oList,ColPos,strDel,strQuote, boolPFS)
{
	//-- nwj - if nCol is not a number then get col pos using name
	if(boolPFS==undefined)boolPFS=false;
	if(strQuote==undefined)strQuote="";
	var strKeys = "";
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowChecked(x))
		{
			if (strKeys !="")strKeys +=strDel;
			var strVal = oList.GetItemTextRaw(x,ColPos);
			strKeys  += strVal;

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
	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	for (var x=0;x<oList.rowCount();x++)
	{
		if (oList.IsRowSelected(x))
		{
			if (strKeys !="")strKeys +=strDel;
			//strKeys  += strQuote + oList.GetItemText(x,ColPos)  + strQuote;
			strKeys  += oList.GetItemText(x,ColPos);
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
	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	for (var x=0;x<oList.rowCount();x++)
	{
		if (strKeys !="")strKeys +=strDel;
		strVal = oList.GetItemTextRaw(x,ColPos);
		//if(boolPFS) strVal= this.pfs(strVal);
		//strKeys  += strQuote + strVal + strQuote;
		strKeys  += strVal;
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
function fglobal_sqllist_gettotalvalue(oList,ColPos, bTime)
{
	if(bTime==undefined)bTime=false;

	var intTotalValue = 0;
	for (var x=0;x<oList.rowCount();x++)
	{
			var colValue = oList.GetItemTextRaw(x,ColPos);
			var iNum = Number(colValue);
			
			if(bTime)
			{
				if(colValue.indexOf(".")!=-1)
				{
					//-- we have something like 1.30
					var arrTime = colValue.split(".");
					var hh = Number(arrTime[0]);
					var mm = Number(arrTime[1]);
					iNum = hh + (mm/60);
					intTotalValue += iNum;
				}
				else
				{
					intTotalValue += iNum;
				}
			}
			else
			{
				intTotalValue += Number(colValue);
			}
	
	}

	if(bTime) intTotalValue = this.convert_to_money(intTotalValue);

	return intTotalValue;
}

fglobal.prototype.number_to_time = fglobal_number_to_time;
function fglobal_number_to_time(intTime)
{
	intTime = intTime + "";

	if(intTime.indexOf(".")!=-1)
	{
		//-- we have something like 1.30
		var arrTime = intTime.split(".");
		var hh = Number(arrTime[0]);
		var mm = Number(arrTime[1]);
		iNum = hh + (mm/60);
		intTime = iNum;
	}
	return app.g.convert_to_money(intTime);
}


//-- 87281/88974
fglobal.prototype.mins_from_perc = fglobal_mins_from_perc;
function fglobal_mins_from_perc(intTime)
{
	intTime = intTime + "";

	if(intTime.indexOf(".")!=-1)
	{
		//-- we have something like 1.30
		var arrTime = intTime.split(".");
		var hh = Number(arrTime[0]);
		var mm = Number(arrTime[1]);
                                
		//--87281 times by ten if below ten (30 percent is 3 here)
		if(mm<10)
		{
			mm = mm*10;
		}

		iNum = ((mm/100)*60);
        //--87281 round the value to the nearest minute (17.9999999999 rounds to 18mins)
		iNum = Math.round(iNum);

		if(iNum < 10) iNum = iNum + "0";
		intTime =  hh +"."+iNum;
	}

	return intTime;
}


//-- 17.05.2007
//-- NWJ
//-- return del list of row col values (getCol) where (checkCol) = (checkValue)
fglobal.prototype.sl_get_valuesdel_andcheckcolvalue = fglobal_sqllist_get_valuesdel_andcheckcolvalue;
function fglobal_sqllist_get_valuesdel_andcheckcolvalue(oList,getCol,checkCol,checkValue, checkAdditionalColVals, strDel,strQuote,boolSelectedOnly)
{

	//-- split out additional cols to check
	var arrAdditionalCols = [];
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
	var strText = String(strText);
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

//-- 14.11.2012 - nwj - submit a sql table update
fglobal.prototype.submittableupdate = fglobal_submittableupdate;
function fglobal_submittableupdate(strTable,keyValue,arrParams,bCache)
{
	var bCols = false;
	var strStoredQuery = "update.table";
	var strParams = "table=" + LC(strTable) + "&kv="+keyValue;
	if (typeof arrParams !== 'string') 
	{
		for(strCol in arrParams)
		{
			bCols = true;
			strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrParams[strCol]);
		}
	}
	else
	{
		bCols = true;
		strParams += "&"+arrParams;
	}
	if(!bCols) return false;
	if(bCache)strParams += "&cdb=1";
	return this.submitsqs(strStoredQuery,strParams);
}
//-- 14.11.2012 - nwj - submit a sql table insert
fglobal.prototype.submittableinsert = fglobal_submittableinsert;
function fglobal_submittableinsert(strTable,arrParams,returnCreatedRecord,bCache)
{
	var bCols = false;
	var strStoredQuery = "insert.table";
	var strParams = "table=" + LC(strTable);
	if (typeof arrParams !== 'string') 
	{
		for(strCol in arrParams)
		{
			bCols = true;
			strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrParams[strCol]);
		}
	}
	else
	{
		strParams += "&"+arrParams;
	}
	
	if(bCache)strParams += "&cdb=1";
	if(!bCols) return false;

	if(returnCreatedRecord)
	{
		//-- return created record
		return this.submitsqs("select.tablebycol",strParams);
	}
	else
	{
		return this.submitsqs(strStoredQuery,strParams);
	}

}

//-- 08.11.2012 - nwj - submit stored query - replace ment for submitsql
fglobal.prototype.delete_tablebycol = fglobal_delete_tablebycol;
function fglobal_delete_tablebycol(strTable,strColName, strValue)
{
	strParams = "table=" + strTable + "&fc="+ strColName + "&fkv=" + pfu(strValue);
	return this.submitsqs("delete.tablebycol",strParams);
}

//-- 27.11.2012 - nwj - submit simple sql command by command key
fglobal.prototype.submitsimplesql = fglobal_submitsimplesql;
function fglobal_submitsimplesql(strCommand,strParams,optboolShowMessage)
{
	if (typeof strParams !== 'string') 
	{
		var arrParams = strParams;
		strParams = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strParams!="")strParams+="&";
			strParams += strKey +"=" + pfu(arrParams[strKey]);
		}
	}

	if(strParams!="")strParams+="&";
	strParams += "_sqlkey=" + pfu(strCommand);

	var result = app.global.StoredQueryExecute("submitsimplesql",strParams);
    if (result==-1)
    {
        //-- an error occured
		if (optboolShowMessage == undefined)optboolShowMessage=false;
		if (optboolShowMessage)MessageBox("StoredQueryExecute for ["+strStoredQuery+"] failed. Please contact your Supportworks Administrator.");
        return false;
    }
	else
	{
        return true;
    }
}

//-- 27.11.2012 - nwj - submit simple sql command by command key in order to return a recordset
fglobal.prototype.simplesql_recordset = fglobal_simplesql_recordset;
function fglobal_simplesql_recordset(strCommand,strParams)
{
	if (typeof strParams !== 'string') 
	{
		var arrParams = strParams;
		strParams = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strParams!="")strParams+="&";
			strParams += strKey +"=" + pfu(arrParams[strKey]);
		}
	}

	if(strParams!="")strParams+="&";
	strParams += "_sqlkey=" + pfu(strCommand);

    var oRS = new SqlQuery();
    oRS.InvokeStoredQuery("submitsimplesql", strParams);
	return oRS;

}


//-- 08.11.2012 - nwj - submit stored query - replace ment for submitsql
fglobal.prototype.submitsqs = fglobal_submitsqs;
function fglobal_submitsqs(strStoredQuery,strParams, optboolShowMessage)
{
	if (typeof strParams !== 'string') 
	{
		var arrParams = strParams;
		strParams = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strParams!="")strParams+="&";
			strParams += strKey +"=" + pfu(arrParams[strKey]);
		}
	}

	var result = app.global.StoredQueryExecute(strStoredQuery,strParams);
    if (result==-1)
    {
        //-- an error occured
		if (optboolShowMessage == undefined)optboolShowMessage=true;
		if (optboolShowMessage)MessageBox("StoredQueryExecute for ["+strStoredQuery+"] failed. Please contact your Supportworks Administrator.");
        return false;
    }
    else if(result==-2)
    {
		//-- script wants us to exit false but no error message
		return false;
	}
	else
	{
        return true;
    }
}

//-- 13.11.2012 - nwj - submit stored query process - when need to call a script that does more that just sql processing
//-- and where you want to alert out response messages
fglobal.prototype.submitsqp = fglobal_submitsqp;
function fglobal_submitsqp(strStoredQuery,strParams)
{
	if(strParams==undefined)strParams="";
	if (typeof strParams !== 'string') 
	{
		var arrParams = strParams;
		strParams = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strParams!="")strParams+="&";
			strParams += strKey +"=" + pfu(arrParams[strKey]);
		}
	}
 

	//-- call url 
	var oRS = new SqlQuery();
    if (!oRS.InvokeStoredQuery(strStoredQuery,strParams))
    {
        return false;
    }

	if(oRS.Fetch())
	{
		var code = oRS.GetValueAsString("code");
		var msg = oRS.GetValueAsString("message");
		var response = oRS.GetValueAsString("response");
		if(code=="-2")
		{
			//-- script wants us to exit false 
			if(msg!="")MessageBox(msg);
			return false;
		}
		else if(code=="-3")
		{
			//-- script wants us to exit true and show a message
			if(msg!="")MessageBox(msg);
			return true;
		}
		else if(code=="-4")
		{
			//-- script wants us to return the message
			if(msg!="")MessageBox(msg);
			return response;
		}
		else
		{
			return true;
		}
	}
	return true;
}


//-- 05.08.2004
//-- NWJ
//-- submit SQL returns true or false
fglobal.prototype.submitsql = fglobal_submitsql;
function fglobal_submitsql(strSQL,boolShowMessage,strStoredQuery)
{
	MessageBox("fglobal.prototype.submitsql has been disabled as it uses raw sql. Please contact your administrator");
}

//-- 16.02.2012
//-- DJH
//-- submit SQL via xmlmc returns true or false
fglobal.prototype.submitsqlxmlmc = fglobal_submitsqlxmlmc;
function fglobal_submitsqlxmlmc(strSQL,boolShowMessage)
{
	MessageBox("fglobal.prototype.submitsqlxmlmc has been disabled as it uses raw sql. Please contact your administrator");
	return false;
}

//-- nwj -11.2012 - wrapper to get row count using params for and clause
fglobal.prototype.sqs_rowcountbycol = fglobal_sqs_rowcountbycol;
function fglobal_sqs_rowcountbycol(strTable,arrParams,bCache)
{
	var bCols = false;
	var strParams = "table=" + LC(strTable);
	for(strCol in arrParams)
	{
		bCols = true;
		strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrParams[strCol]);
	}
	if(!bCols) return false;
	if(bCache)strParams += "&cdb=1";

	var result = app.global.StoredQueryExecute("count.tablebycol",strParams, true);
    if (result==-1)
    {
		MessageBox("sqs_rowcountbycol ["+strStoredQuery+"] failed. Please contact your Supportworks Administrator.");
    }
    return Number(result);     
}

//-- nwj -11.2012 - wrapper to get row count script 
fglobal.prototype.sqs_rowcount = fglobal_sqs_rowcount;
function fglobal_sqs_rowcount(strStoredQuery,strParams)
{
	var result = app.global.StoredQueryExecute(strStoredQuery,strParams, true);
    if (result==-1)
    {
		MessageBox("sqs_rowcount ["+strStoredQuery+"] failed. Please contact your Supportworks Administrator.");
    }
    return Number(result);    
}

//-- nwj 29-11.2012 - wrapper to get row count from table using a static filter (in static.sql.php)
fglobal.prototype.staticfilter_rowcount = fglobal_staticfilter_rowcount;
function fglobal_staticfilter_rowcount(strTable,strFilter, arrParams, bCache)
{
	var strParams = "table=" + LC(strTable) + "&sf=" + pfu(strFilter);
	for(var strCol in arrParams)
	{
		strParams += "&" + strCol +"=" + pfu(arrParams[strCol]);
	}

	if(bCache)strParams += "&cdb=1";
	
	var result = app.global.StoredQueryExecute("count.tablebyfilter",strParams, true);
    if (result==-1)
    {
		MessageBox("staticfilter_rowcount ["+strTable+":"+strFilter+"] failed. Please contact your Supportworks Administrator.");
    }
    return Number(result);    
}


fglobal.prototype.get_rowcount = fglobal_get_rowcount;
function fglobal_get_rowcount(strTable,strWhere)
{
	MessageBox("fglobal.prototype.get_rowcount has been disabled as it uses unsafe sql where clause. Please contact your Administrator.");
	return 0;
}



//-- 07.11.2012 get params for generic search forms that use stored query instead of raw filter
fglobal.prototype.create_search_params = fglobal_create_search_params;
function fglobal_create_search_params(oForm,strTable,strSearchColour,boolAND,boolNoDataRef,boolUseAppcodeFilter)
{
	//-- nwj - 22.04.2010
	//-- see if we should apply appcode filter
	//-- if passed in value from form is undefined - use global value
	if(boolUseAppcodeFilter==undefined)
	{
		var strUseAppCodeFilter = dd.GetGlobalParamAsString("Application Settings/UseAppCodeFilter");
		var boolUseAppcodeFilter = (strUseAppCodeFilter=="1");
	}

	var searchColumns = "_and=" + boolAND;
	boolNoDataRef = (boolNoDataRef == undefined)? false: boolNoDataRef;
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
					var colVal = element.text;
					var colName = returnColName(element,boolNoDataRef); 
					var bNumeric = this.dd_isnumeric(strTable,colName);
					
					// -- PM00127493 - "Is a Manager?" picklist options
					if((colName == "flg_manager" || colName == "flg_allow_support")  && (colVal == "Yes"))
					{
						colVal = 1;
					}
					else if ((colName == "flg_manager" || colName == "flg_allow_support") && (colVal == "No"))
					{
						colVal = 0;
					}
					//-- NWJ - 18.04.2008 - check if field is numeric and if so that value is numeric
					if ((bNumeric)&&(isNaN(colVal)))
					{
						MessageBox("Non-numeric characters where found in a numeric search field (" + this.dd_fieldlabel(strTable,colName) + "). This field will be omitted from the search criteria.");
						continue;
					}

					if(searchColumns!="")searchColumns+="&";
					searchColumns += "_swc_" + LC(colName) + "=" + pfu(colVal);
				}
			}
		}
	}

	//-- nwj apply appcode filter
	if(boolUseAppcodeFilter)
	{
		if(this.dd_fieldexists(strTable,"APPCODE"))
		{
			if(searchColumns!="")searchColumns+="&";
			searchColumns+="_ac=1";
		}
	}
	return searchColumns;
}


//-- 15.01.2005
//-- 22.04.2010 added appending appcode
//-- NWJ
//-- return filter search string based on search fields
//-- add parameter to use booluseappcodefilter
fglobal.prototype.create_search_filter = fglobal_create_search_filter;
function fglobal_create_search_filter(oForm,strTable,strSearchColour,boolAND,boolNoDataRef,boolUseAppcodeFilter)
{
	MessageBox("WARNING: fglobal_create_search_filter contructs raw sql filter. This form should be modified to use fglobal_create_search_params.\n\n Please contact your Administrator.");
	return "";

	//-- nwj - 22.04.2010
	//-- see if we should apply appcode filter
	//-- if passed in value from form is undefined - use global value
	/*
	if(boolUseAppcodeFilter==undefined)
	{
		var strUseAppCodeFilter = dd.GetGlobalParamAsString("Application Settings/UseAppCodeFilter");
		var boolUseAppcodeFilter = (strUseAppCodeFilter=="1");
	}

	
	var strDBType = dd.GetGlobalParamAsString("Application Settings/DatabaseType");
	var boolOracle = (strDBType.toUpperCase()=="ORACLE");

	var searchString = "";
	boolNoDataRef = (boolNoDataRef == undefined)? false: boolNoDataRef;
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
					var colVal = element.text;
					colVal = colVal.replace(/\\/,"\\\\");

					var colName = returnColName(element,boolNoDataRef); 
					var colValue = app.g.encapsulate(strTable,colName,colVal,"%");

					var bNumeric = this.dd_isnumeric(strTable,colName);

					//-- NWJ - 18.04.2008 - check if field is numeric and if so that value is numeric
					if ((bNumeric)&&(isNaN(colValue)))
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
					//-- nwj - 25.03.2010 - handle numerics properly
					if(bNumeric)
					{
						searchString += "(" + colName + " = " + colValue + " OR "+ colName + " is null)";
					}
					else
					{
						searchString += colName + " like " + colValue;
					}
				}
			}
		}
	}

	//-- nwj apply appcode filter
	if(boolUseAppcodeFilter)
	{
		if(this.dd_fieldexists(strTable,"APPCODE"))
		{
			if(searchString=="")
			{
				searchString = "(appcode = '"+ this.pfs(app.session.dataDictionary) +"')";
			}
			else
			{
				searchString = "(appcode = '"+ this.pfs(app.session.dataDictionary) +"') AND " +  "(" + searchString +")";
			}
		}
	}
	return searchString;
	*/
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

//-- 05.09.2012
//-- RJC
//-- delete row by key - rewritten to use xmlmc
fglobal.prototype.xmlmcexecute_delete = fglobal_sqlexecute_delete;
fglobal.prototype.sqlexecute_delete = fglobal_sqlexecute_delete;
function fglobal_sqlexecute_delete(strTable,inKeyValue,boolError)
{
	if(boolError==undefined)boolError = false;
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("table", strTable);
 	xmlmc.SetParam("keyValue", inKeyValue);	
	if(xmlmc.Invoke("data", "deleteRecord"))
	{
		return true;
	}
	else
	{
		if(boolError)
			MessageBox(xmlmc.GetLastError());
		else
			MessageBox("XMLMC Execute Delete failed. Please contact your Supportworks Administrator.");
		return false;
	}
}


//-- 01.11.2004
//-- NWJ
//-- delete row by foriegn key
fglobal.prototype.sqlexecute_delete_by_fkey = fglobal_sqlexecute_delete_by_fkey;
function fglobal_sqlexecute_delete_by_fkey(strTable,strColName,inKeyValue)
{
	MessageBox("fglobal.prototype.sqlexecute_delete_by_fkey has been disabled as it uses unsafe sql where clause. Please contact your Administrator.");
	return false;
    //var strSQL = "dxelete from " + UC(strTable) + " where " + UC(strColName) + " = " + this.encapsulate(strTable,strColName,inKeyValue) + "";
	//return this.sxubmitsql(strSQL);
}



//-- 05.08.2004
//-- NWJ
//-- delete rows by clause
fglobal.prototype.sqlexecute_deletewhere = fglobal_sqlexecute_deletewhere;
function fglobal_sqlexecute_deletewhere(strTable,strWhere)
{
	//-- get datadictionary info for table to get key
	MessageBox("fglobal.prototype.sqlexecute_deletewhere has been disabled as it uses unsafe sql where clause. Please contact your Administrator.");
	return false;
    //var strSQL = "dxelete from " + UC(strTable) + " where " + strWhere;
	//return this.sxubmitsql(strSQL);
}

//-- 05.08.2004
//-- NWJ
//-- perform insert using values from the passed in form object
fglobal.prototype.sqlexecute_forminsert = fglobal_sqlexecute_forminsert;
function fglobal_sqlexecute_forminsert(strTable,oForm,boolNoDataRef)
{
	var arrColnames= [];
	var arrCols = [];
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;
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
							arrCols[colOne] = arrValue[0];
						}

						if (arrColnames[colTwo]){}
						else
						{
							arrCols[colTwo] = lastval;
						}
					}
					else
					{
						if (arrColnames[colOne]){}
						else
						{
							//-- construct col names for insert
							arrCols[colOne] = colValue;
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
						arrCols[colName] = colValue;
					}
				}
		    }
		}
    }

	//-- insert the new form data record and return new record
	return app.g.submittableinsert(strTable,arrCols,true);
}

//-- 05.08.2004
//-- NWJ
//-- perform db update using values from the passed in form object (expects key value)
fglobal.prototype.sqlexecute_formupdate = fglobal_sqlexecute_formupdate;
function fglobal_sqlexecute_formupdate(strTable,oForm,inKeyValue,boolNoDataRef,varSkipValue)
{
	var varSkipValue = (varSkipValue==undefined)?"":varSkipValue;
	var updateString = "";
	var arrCols = []
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;
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
					//if (updateString != "") updateString += ",";
					//updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
					arrCols[colName] = colValue;
				}
			}
        }
    }
	//var primaryCol = this.dd_primarykey(strTable);
	//strSQL = "uxpdate " + strTable + " set " + updateString + " where " + this.dd_primarykey(strTable) + " =  " + this.encapsulate(strTable,primaryCol,inKeyValue);
	//return this.sxubmitsql(strSQL);
	return this.submittableupdate(strTable,inKeyValue,arrCols);
}


//-- 23.01.2006
//-- NWJ
//-- perform db update using values from the passed in record object (expects key value)
fglobal.prototype.sqlexecute_recupdate = fglobal_sqlexecute_recupdate;
function fglobal_sqlexecute_recupdate(strTable,oRec,inKeyValue)
{
	var arrCols = [];
	var updateString = "";
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var colName = dd.tables[LC(strTable)].columns[x].Name;
		var colValue = oRec[colName];
		if (colName.toUpperCase() != this.dd_primarykey(strTable).toUpperCase())
		{
			//if (updateString!="")updateString += ","
			//updateString += colName + " = " + this.encapsulate(strTable,colName,colValue);
			arrCols[colName] = colValue;
		}
	}
	
	//var primaryCol = this.dd_primarykey(strTable);
	//strSQL = "uxpdate " + strTable + " set " + updateString + " where " + primaryCol + " =  " + this.encapsulate(strTable,primaryCol,inKeyValue);
	//return this.xsubmitsql(strSQL);
	return this.submittableupdate(strTable,inKeyValue,arrCols);
}

//-- 24.08.2004
//-- NWJ
//-- loop through form fields for given table and check if mandatory.
//-- if so make sure it is populated else return false and warning message
fglobal.prototype.check_mandatory_fields = fglobal_check_mandatory_fields;
fglobal.prototype.check_mandatoryfields = fglobal_check_mandatory_fields;
function fglobal_check_mandatory_fields(strTable,oForm,boolNoDataRef)
{
	boolNoDataRef = (boolNoDataRef==undefined)?false:boolNoDataRef;
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

//-- return value in '' if col type is string
fglobal.prototype.encapsulate = fglobal_encapsulate;
function fglobal_encapsulate(strTable,strCol,inValue, strAppend , strPrefix)
{
	//-- append and prefixc may be % for when doing searches
	if(strAppend==undefined) strAppend="";
	if(strPrefix==undefined) strPrefix="";

	if (this.dd_isnumeric(strTable,strCol))
	{
		//-- if a number and is null set to zero
		if (inValue == '') inValue=0;
		return inValue;
	}
	else
	{
		//-- a string so encaps
		//-- nwj - we should never have to use this now as we process data serverside
		//return "'" + strPrefix +  this.pfs(inValue) + strAppend + "'";
		return inValue;
	}
}

//--
//-- Prepare a string for SQL - use as app.g.pfs(string) .. just short than using app.global.prepareforsql each time.
fglobal.prototype.pfs = fglobal_pfs;
function fglobal_pfs(inValue, boolQuote)
{
	//-- nwj - we should never have to use this now as we process data serverside
	//if(boolQuote==undefined)boolQuote=false;
	//var strQ = (boolQuote==true)?"'":"";
	//return strQ + app.global.PrepareForSQL(inValue) + strQ;
	return inValue;
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
	inValue = Number(inValue);
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
		inValue = String(inValue);
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
	oForm.Open("colour_picker","","",function(obj)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			if ((typeof obj) == "object")
			{
				funcCallback(obj.document.strColour);
			}
			else
			{
				funcCallback("");
			}
		}
	});
}

//--
//-- for a table and keyvalue and info col name return info value (typically used for pcdesc / pcinfo etc)
fglobal.prototype.get_key_info = fglobal_get_key_info;
function fglobal_get_key_info(strTable,varKeyValue,strInfoCol, strKeyCol)
{
	var strReturnInfo = "";

	var ap = {}
	ap.ic=strInfoCol;
	ap.table = strTable;
	ap.kv = varKeyValue;
	if(strKeyCol!=undefined)ap.kc = strKeyCol;

	var oRS = this.get_sqrecordset("get_key_info.select",ap);
	
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

	var pc = new ChooseProfileCodeDialog();
    pc.Open(false, false, strSelCode, strFilter, function(obj)
	{
		if (typeof obj == "object")
		{
			if(boolInfo)
			{
				//-- we want to return info value as well
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(obj.code + "|" + obj.codeDescription);
				} 
			}
			else
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(obj.code);
				}
			}
		}
		else
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
	});
}

//-- popup resolution picker
fglobal.prototype.pick_resolutionprofile = fglobal_pick_resolutionprofile;
function fglobal_pick_resolutionprofile(strSelCode,strFilter,funcCallback)
{
	if(strSelCode==undefined)strSelCode="";
	if(strFilter==undefined)strFilter="";

	var pc = new ChooseProfileCodeDialog();
    pc.Open(true, false, strSelCode, strFilter, function(obj)
    {
		if (typeof obj == "object")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(obj.code);
			}
		}
		else
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback("");
			}
		}
	});
}


//--
//-- NWJ - 24.11.2005 - copy a sw record based on a master record
fglobal.prototype.copy_sw_record = fglobal_copy_sw_record;
function fglobal_copy_sw_record(strTable,masterRecord, strSkipFields,arrSwapFields)
{
	//-- F0086222 use xmlmethodcall so that sql match back is not required
	if(strSkipFields==undefined)strSkipFields="";
	var strPriKeyName 	= dd.tables[LC(strTable)].PrimaryKey;	
	var varPriKeyValue   	= 0;
		
	if(arrSwapFields[strPriKeyName]!=undefined) varPriKeyValue= arrSwapFields[strPriKeyName];
	
	var strNewId = null;
		
  	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("table", strTable);		

	for (var x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var aCol 	= dd.tables[LC(strTable)].columns[x];
		var strColName  = aCol.Name
		var strEncaps 	= (aCol.IsNumeric())?"":"'";
		var fldValue	= masterRecord[strColName];

		//-- nwj - so we can swap feild values
		if(arrSwapFields[strColName.toLowerCase()]!=undefined) fldValue= arrSwapFields[strColName.toLowerCase()];

		//RJC fix if the field is numeric and negative
		if(strEncaps=="" && fldValue<0){
			fldValue = app.g.fix_epoch(fldValue);
		}
		
		//var varValue 	=  app.global.PrepareForXML(fldValue);
		var varValue 	=  (fldValue);

		//--
		//-- process the primary key
		boolSkip = false;
		if (strColName==strPriKeyName)
		{
			//-- auto id
			if (varPriKeyValue != 0)		
			{
				//--
				//varValue 	= app.global.PrepareForXML(varPriKeyValue);
				varValue 	= (varPriKeyValue);
			}
			else
			{
				boolSkip = true;
			}
		}
		if(fldValue==undefined)
			boolSkip=true;

		if(!boolSkip)boolSkip=(strSkipFields.toLowerCase().indexOf(strColName.toLowerCase())!=-1);
	
		//-- if we do not want to skip				
		if (!boolSkip)
		{
			xmlmc.SetData(strColName,varValue);
		}
	}

	if(xmlmc.Invoke("data", "addRecord"))
	{
		//var strXML = xmlmc.GetReturnXml();
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
	        MessageBox("Failed to process record creation (" + objRes.message + "). Please contact your Supportworks Supervisor.");
	    }	
	    else
	    {
			strNewId = xmlmc.GetReturnValue("lastInsertId");
	    }
    }
    else
    {
    	MessageBox("Failed to process record creation. " + xmlmc.GetLastError() + ". Please contact your Supportworks Supervisor.");
    }		
	return strNewId;
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
	var arrCols = [];
	for (var x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var aCol 	= dd.tables[LC(strTable)].columns[x];
		var strColName  = aCol.Name
		//var strEncaps 	= (aCol.IsNumeric())?"":"'";
		var fldValue	= masterRecord[strColName];
		//var varValue 	= strEncaps + app.g.pfs(fldValue) + strEncaps;
		
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
			//if (strUpdateVals != "")strUpdateVals +=",";
			//strUpdateVals += strColName + " = " +  varValue ;
			arrCols[strColName] = fldValue;
		}
	}

	//-- perform insert
	//var strUpdateSQL = "uxpdate " + strTable + " set " + strUpdateVals + " where " + strPriKeyName + " = " + varPriKeyValue;
	//return this.sxubmitsql(strUpdateSQL,true);
	return this.submittableupdate(strTable,varPriKeyValue,arrCols);


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

//-- F0088791 sort the entries alphabetically
fglobal.prototype.dd_getcolumnlist = fglobal_dd_getcolumnlist;
function fglobal_dd_getcolumnlist(strTable, boolNumeric, arrIncludes, oLB , boolIncludeBinding, boolSortbyDisplayName)
{
	if(boolIncludeBinding==undefined) boolIncludeBinding=false;
	if(boolSortbyDisplayName==undefined) boolSortbyDisplayName=true;
	if(boolNumeric==undefined) boolNumeric=false;
	if(arrIncludes==undefined)arrIncludes=false;
	var strDel = "|";
	var strColumns = "";
	var arrValues = [];
	var arrKeys = [];
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		if(arrIncludes)
		{
			if(arrIncludes[dd.tables[LC(strTable)].columns[x].name])
			{
				var strThisValue = dd.tables[LC(strTable)].columns[x].DisplayName;
				var strThisKey = dd.tables[LC(strTable)].columns[x].DisplayName;

				if(boolIncludeBinding) strThisValue += " (" + LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name + ")";
				//-- F0099608 - non unique keys for sorting causes columns to be missed. Add else so key contains column
				if(!boolSortbyDisplayName)
					strThisKey = LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name;
				else
					strThisKey += " - "+LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name;

				if(boolNumeric)strThisValue += "^" + (x + 1);
				
				arrValues[strThisKey] = strThisValue;
				arrKeys[arrKeys.length] = strThisKey;
			}
		}
		else
		{
			var strThisValue = dd.tables[LC(strTable)].columns[x].DisplayName;
			var strThisKey = dd.tables[LC(strTable)].columns[x].DisplayName;

			if(boolIncludeBinding) strThisValue += " (" + LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name + ")";
			//-- F0099608 - non unique keys for sorting causes columns to be missed. Add else so key contains column
			if(!boolSortbyDisplayName)
				strThisKey = LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name;
			else
				strThisKey += " - "+LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name;

			if(boolNumeric)strThisValue += "^" + (x + 1);
			arrValues[strThisKey] = strThisValue;
			arrKeys[arrKeys.length] = strThisKey;
		}
	}
	arrKeys.sort();
	for (var i = 0; i < arrKeys.length; i++)
	{
		if(strColumns!="")strColumns+=strDel;
		strColumns+=arrValues[arrKeys[i]];
	}

	if(oLB!=undefined) oLB.pickList = strColumns;

	return strColumns;
}

//###20120625 - addition for escalation email
fglobal.prototype.cache_getcolumnlisttblename = fglobal_cache_getcolumnlisttblename;
function fglobal_cache_getcolumnlisttblename(strTable, boolNumeric, oLB , boolIncludeBinding)
{
	if(boolNumeric==undefined) boolNumeric=false;
	if(boolIncludeBinding==undefined) boolIncludeBinding=false;
	if (""==strTable) {
		if(oLB!=undefined) oLB.pickList = "";
		return "";
	}
	var strDel = "|";
	var arrValues = [];


	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("database", "sw_systemdb");		
	xmlmc.SetValue("table", strTable);		
	if(xmlmc.Invoke("data","getColumnInfoList"))
	{
		//-- get the result
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
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
				for (count = 0; count < myXmlFile.methodCallResult.params.length; count ++) 
				{
					var strThisValue = myXmlFile.methodCallResult.params[count].name.nodeValue;
					if(boolIncludeBinding) strThisValue += " (" + LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name + ")";
					if(boolNumeric)strThisValue += "^" + (x + 1);
					arrValues[arrValues.length] = strThisValue;
				}
			} 
		}
	}

	arrValues.sort();
	var strColumns = arrValues.join(strDel);

	if(oLB!=undefined) oLB.pickList = strColumns;
	return strColumns;
}

fglobal.prototype.cache_gettablenames = fglobal_cache_gettablelist;
fglobal.prototype.cache_gettablelist = fglobal_cache_gettablelist;
function fglobal_cache_gettablelist(boolNumeric, oLB)
{

	if(boolNumeric==undefined) boolNumeric=false;
	var strDel = "|";
	var arrValues = [];

	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("database", "sw_systemdb");		
	if(xmlmc.Invoke("data","getTableInfoList"))
	{
		//-- get the result
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
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
				for (count = 0; count < myXmlFile.methodCallResult.params.length; count ++) 
				{
					var strThisValue = LC(myXmlFile.methodCallResult.params[count].name.nodeValue);
					if(boolNumeric)strThisValue += "^" + (x + 1);
					arrValues[arrValues.length] = strThisValue;
				}
			} 
		}
	}

	arrValues.sort();
	var strColumns = arrValues.join(strDel);
	if(oLB!=undefined) oLB.pickList = strColumns;
	return strColumns;
}
//###20120625


//-- F0088791 sort the entries alphabetically
fglobal.prototype.dd_getcolumnnamelist = fglobal_dd_getcolumndbnamelist;
fglobal.prototype.dd_getcolumndbnamelist = fglobal_dd_getcolumndbnamelist;
function fglobal_dd_getcolumndbnamelist(strTable, boolNumeric, arrIncludes, oLB, boolIncludeTable)
{
	if(boolIncludeTable==undefined) boolIncludeTable=false;
	if(boolNumeric==undefined) boolNumeric=false;
	if(arrIncludes==undefined)arrIncludes=false;
	var strDel = "|";
	var strColumns = "";
	var arrValues = [];
	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		if(arrIncludes)
		{
			if(arrIncludes[dd.tables[LC(strTable)].columns[x].name])
			{
				var strThisValue = "";
				if(boolIncludeTable) strThisValue += LC(strTable) + ".";
				strThisValue += dd.tables[LC(strTable)].columns[x].name;
				if(boolNumeric)strThisValue += "^" + (x + 1);
				arrValues[arrValues.length] = strThisValue;
			}
		}
		else
		{
			var strThisValue = "";
			if(boolIncludeTable) strThisValue += LC(strTable) + ".";
			strThisValue += dd.tables[LC(strTable)].columns[x].name;
			if(boolNumeric)strThisValue += "^" + (x + 1);
			arrValues[arrValues.length] = strThisValue;
		}
	}
	arrValues.sort();
	var strColumns = arrValues.join(strDel);

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

fglobal.prototype.blank_doc_record_field = fglobal_blank_doc_record_field;
function fglobal_blank_doc_record_field(oDoc, strBinding, boolUpdateDoc)
{
	if(boolUpdateDoc==undefined)boolUpdateDoc=true;
	var arrInfo = strBinding.split(".");
	var strTable = arrInfo[0];
	var strCol = arrInfo[1];
	oDoc[strTable][strCol] = "";
	if(boolUpdateDoc)oDoc.UpdateFormFromData();
}

fglobal.prototype.set_doc_record_fieldvalue = fglobal_set_doc_record_fieldvalue;
function fglobal_set_doc_record_fieldvalue(oDoc, strBinding, strValue)
{
	var arrInfo = strBinding.split(".");
	var strTable = arrInfo[0];
	var strCol = arrInfo[1];
	oDoc[strTable][strCol] = strValue;
	oDoc.UpdateFormFromData();
}


fglobal.prototype.get_doc_record_fieldvalue = fglobal_get_doc_record_fieldvalue;
function fglobal_get_doc_record_fieldvalue(oDoc, strBinding)
{
	var arrInfo = strBinding.split(".");
	var strTable = arrInfo[0];
	var strCol = arrInfo[1];
	return oDoc[strTable][strCol];
}

//-- 24.08.2004
//-- NWJ
//-- get fields label value from binding
fglobal.prototype.dd_fieldlabel_frombinding = fglobal_dd_fieldlabel_frombinding;
function fglobal_dd_fieldlabel_frombinding(strBinding)
{
	var arrInfo = strBinding.split(".");
	var strTable = arrInfo[0];
	var strCol = arrInfo[1];
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
	// -- Use wrapper function for helpdesk::getCallSummaryInfo to get h_formattedcallref
	var oCallInfo = app.g.getCallSummaryInfo(strValue);
	return oCallInfo.formattedcallref;
}

fglobal.prototype.callref_unpad = fglobal_callref_unpad;
function fglobal_callref_unpad(strValue)
{
	// -- Use GetCallRefValue (Global function) to return numeric value of call reference
	return app.global.GetCallRefValue(strValue);
}

//-- NWJ
//-- 14.11.2012
//-- return sqlrecordset use generic select.tablebycol
fglobal.prototype.get_tablerecordset_bycol = fglobal_get_tablerecordset_bycol;
function fglobal_get_tablerecordset_bycol(strTable,arrParams,bCache, strSelectCols)
{
	strStoredQuery = "select.tablebycol";
	strParams = "table=" + LC(strTable);
	for(strCol in arrParams)
	{
		strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrParams[strCol]);
	}

	if(bCache)strParams+="&cdb=1";
	if(strSelectCols!=undefined)strParams += "&_select_=" + strSelectCols;

    var oRS = new SqlQuery();
    oRS.InvokeStoredQuery(strStoredQuery, strParams);
	return oRS;
}

fglobal.prototype.get_tablerecordset_bykey = fglobal_get_tablerecordset_bykey;
function fglobal_get_tablerecordset_bykey(strTable,strKeys,bCache, strSelectCols)
{
	strStoredQuery = "select.tablebykey";
	strParams = "table=" + LC(strTable);
	strParams += "&kv=" + pfu(strKeys);
	
	if(bCache)strParams+="&cdb=1";
	if(strSelectCols!=undefined)strParams += "&_select_=" + strSelectCols;

    var oRS = new SqlQuery();
    oRS.InvokeStoredQuery(strStoredQuery, strParams);
	return oRS;
}

fglobal.prototype.get_distincttablerecordset_bycol = fglobal_get_distincttablerecordset_bycol;
function fglobal_get_distincttablerecordset_bycol(strTable,arrParams,bCache, strSelectCols)
{
	strStoredQuery = "select.tablebycol";
	strParams = "_distinct_=1&table=" + LC(strTable);
	for(strCol in arrParams)
	{
		strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrParams[strCol]);
	}

	if(bCache)strParams+="&cdb=1";
	if(strSelectCols!=undefined)strParams += "&_select_=" + strSelectCols;

    var oRS = new SqlQuery();
    oRS.InvokeStoredQuery(strStoredQuery, strParams);
	return oRS;
}


//-- nwj - 20.11.2012
fglobal.prototype.get_tablecolmax_bycol = fglobal_get_tablecolmax_bycol;
function fglobal_get_tablecolmax_bycol(strTable,strMaxCol,strParams,boolCache)
{
	if (typeof strParams !== 'string') 
	{
		var arrParams = strParams;
		strParams = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strParams!="")strParams+="&";
			strParams += "_swc_" + LC(strKey) +"=" + pfu(arrParams[strKey]);
		}
	}

	strParams = "table=" + strTable + "&mxc=" + strMaxCol + "&" + strParams;
	if(boolCache)strParams +="&cdb=1";
	return app.g.submitsqp("max.tablebycol",strParams);
}

//-- NWJ
//-- 12.11.2012
//-- return sqlrecordset using stored query
fglobal.prototype.get_sqrecordset = fglobal_get_sqrecordset;
function fglobal_get_sqrecordset(strStoredQuery,strParams)
{
	if (typeof strParams !== 'string') 
	{
		var arrParams = strParams;
		strParams = "";
		//-- assume arr or object of params
		for(var strKey in arrParams)
		{
			if(strParams!="")strParams+="&";
			strParams += strKey +"=" + pfu(arrParams[strKey]);
		}
	}

    var oRS = new SqlQuery();
    oRS.InvokeStoredQuery(strStoredQuery, strParams);
	return oRS;
}




//-- NWJ
//-- 18.08.2004
//-- return sqlrecordset
fglobal.prototype.get_recordset = fglobal_get_recordset;
function fglobal_get_recordset(strSQL,strDB)
{
    var oRS = new SqlQuery();
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

	if(isNaN(fieldname)) colIndex = oRS.GetColumnIndex(colIndex);
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

// -- Get summary information about a specified call using helpdesk::getCallSummaryInfo API
fglobal.prototype.getCallSummaryInfo = fglobal_getCallSummaryInfo;
function fglobal_getCallSummaryInfo(nCallRef)
{
	// -- Validate nCallRefs param
	if(nCallRef == "" || nCallRef == undefined)
		return "";
	
	// -- Create an object for the specified call by invoking helpdesk:getCallSummaryInfo XMLMC API
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref", nCallRef);
	if(xmlmc.Invoke("helpdesk","getCallSummaryInfo"))
	{
		// -- Get XMLMC API result
		var oCallInfo = {};
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var myXmlFile = new XmlFile(); 
		var bRet = myXmlFile.loadFromString(strXML);
		if(bRet)
		{
			oCallInfo.probCode = myXmlFile.methodCallResult.params.probCode.nodeValue; // -- probCode
			oCallInfo.fixCode = myXmlFile.methodCallResult.params.fixCode.nodeValue; // -- fixCode
			oCallInfo.problem = myXmlFile.methodCallResult.params.problem.nodeValue; // -- problem
			oCallInfo.solution = myXmlFile.methodCallResult.params.solution.nodeValue; // -- solution
			oCallInfo.formattedcallref = myXmlFile.methodCallResult.params.formattedcallref.nodeValue; // -- formattedcallref
			return oCallInfo;
		}
		return "";
	}
	else
	{
		// -- Failed to invoke XMLMC API
		MessageBox(xmlmc.GetLastError());
		return "";
	}
}

//-- NWJ
//-- 27.06.2004
//-- enter a diary event
fglobal.prototype.new_diaryevent = fglobal_new_dairyevent;
fglobal.prototype.new_dairyevent = fglobal_new_dairyevent;
function fglobal_new_dairyevent(nCallRef,strText,strActionSource,strCode,strSLA)
{
	if(strSLA==undefined)strSLA="";

	//-- nwj - 11.2012 use sqs
	var strParams = "cr="+nCallRef+"&updtxt="+pfu(strText)+"&src="+pfu(strActionSource)+"&code="+pfu(strCode)+"&sla="+pfu(strSLA);
	if(!app.g.submitsqs("helpdesk/call.diary.update",strParams))
	{
		MessageBox("Failed to perform Diary Update. Please contact your Supportworks Administrator");
	}

}

fglobal.prototype.update_callvalue = fglobal_update_callvalue;
function fglobal_update_callvalue(nCallRef,varValue,varColName,isNumeric)
{
	// -- Build a string for additionalCallValues param
	var strUpdateCallValues = "";
	strUpdateCallValues = "<"+varColName+">"+ app.global.PrepareForXML(varValue)+"</"+varColName+">";
	strUpdateCallValues = "<opencall>"+strUpdateCallValues+"</opencall>";
	
	// -- updateCallValues through XMLMC API
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("callref", nCallRef);
	xmlmc.SetParamAsComplexType("additionalCallValues", strUpdateCallValues);
	if(xmlmc.Invoke("helpdesk","updateCallValues"))
	{
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
			MessageBox("The " + strMethod + " API method was rejected by the server.");
			return false;
	    }
	}
	else
	{
		return false;
	}

}

//-- nwj - 09.07.2009 - new function to update several call values
fglobal.prototype.update_callvalues = fglobal_update_callvalues;
function fglobal_update_callvalues(nCallRef,arrCallValues,optVerb)
{
    // -- Build a string for additionalCallValues param
	var arrUpdateCallValues = [];
	var strUpdateCallValues = "";
	for (strColName in arrCallValues)
	{
		var varValue = arrCallValues[strColName];
		arrUpdateCallValues[strColName] = varValue;
	}
	for (fieldName in arrUpdateCallValues)
	{
		strUpdateCallValues += "<"+fieldName+">"+ app.global.PrepareForXML(arrUpdateCallValues[fieldName])+"</"+fieldName+">";
	}
	strUpdateCallValues = "<opencall>"+strUpdateCallValues+"</opencall>";
	
	// -- updateCallValues through XMLMC API
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("callref", nCallRef);
	xmlmc.SetParamAsComplexType("additionalCallValues", strUpdateCallValues);
	if(xmlmc.Invoke("helpdesk","updateCallValues"))
	{
		var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
		var objRes = XMCResult(strXML);
		if(!objRes.success)
		{
			MessageBox("The " + strMethod + " API method was rejected by the server.");
			return false;
	    }
	}
	else
	{
		return false;
	}
}


//-- EOF HELPDESK OPS



//-- 06.10.2004
//-- NWJ
//-- Load popup form
fglobal.prototype.popup = fglobal_popup;
function fglobal_popup(strFormName,strURL,funcCallback)
{
	var oForm = new PopupForm();
	oForm.Open(strFormName,"",strURL, function(obj)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			if (typeof obj == "object")
			{
				funcCallback(obj);
			}
			else
			{
				funcCallback(false);
			}
		}
	});
}


//-- 08.09.2004
//-- NWJ
//-- systemdb functions
//--

//-- popup to pick analyst and group (returns analyst and or group object)
fglobal.prototype.pick_analystorgroup = fglobal_pick_analystorgroup;
function fglobal_pick_analystorgroup(strTitle, funcCallback)
{
	var strGroup = "";
	var strAnalystID = "";
	var dlg = new PickAnalystDialog();
    dlg.Open(strTitle,function(obj)
    {
		if (typeof obj == "object")
		{
			strGroup = obj.groupid;
			strAnalystID = obj.analystid;
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(app.g.get_analystorgroup(strGroup,strAnalystID));
			}
		}
		else
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
	});
	
}

//-- return object with group object and analyst onject (if just group analyst = false)
fglobal.prototype.get_analystorgroup = fglobal_get_analystorgroup;
function fglobal_get_analystorgroup(strGroup,strAnalystID)
{
	var tmpobject= {};
	tmpobject.oAnalyst =false;
	tmpobject.oGroup =false;

	if(strAnalystID!="")
	{
		tmpobject.oAnalyst =app.g.get_analyst_detail(strAnalystID);
		tmpobject.oGroup =this.get_group_detail(strGroup);
	}
	else if(strGroup!="")
	{
		tmpobject.oAnalyst =this.get_blank_analyst();
		tmpobject.oGroup =this.get_group_detail(strGroup);
	}
	return tmpobject;
}

//-- pick analyst dialg then get details
fglobal.prototype.pick_analyst = fglobal_pick_analyst;
function fglobal_pick_analyst(strTitle, funcCallback)
{

	var strGroup = "";
	var strAnalystID = "";
	var dlg = new PickAnalystDialog();
    dlg.Open(strTitle,function(obj)
	{
		if (typeof obj == "object")
		{
			strGroup = obj.groupid;
			strAnalystID = obj.analystid;
			var oAnalyst = app.g.get_analyst_detail(strAnalystID);
			if(oAnalyst.supportgroup!=strGroup)
				oAnalyst.supportgroup = strGroup;
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(oAnalyst);
			}
		}
		else
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
	});
}

//-- return a blank analyst object
fglobal.prototype.get_blank_analyst= fglobal_get_blank_analyst;
function fglobal_get_blank_analyst()
{
	result 			= {};
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
	var oRS		= this.get_sqrecordset("analysts/get_analyst_detail","aid=" + strAnalystID);

	while (oRS.Fetch())
	{	
		//-- create object to hold analyst details
		result 			= {};
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

	var oRS		= this.get_sqrecordset("analysts/get_group_analystids","gid=" + strGroupID);
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
 
	
	var ap = {};
	ap.id=strGroupID;
	var oRS = app.g.get_tablerecordset_bycol("swgroups",ap,true);

	while (oRS.Fetch())
	{ 
		 //-- create object to hold group details
		  result = {};
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
	var strHours = String(intMinutes / 60);
	var intHours = Number(strHours.split(".")[0]);
	var	intMins  = intMinutes % 60;
	if(intMins<10)intMins = "0" + intMins;

	var strTime = Number(intHours + "." + intMins);

	return this.convert_to_money(strTime);
}
//-- convert todays date to epoch
fglobal.prototype.todaysdate_epoch = fglobal_todaysdate_epoch;
function fglobal_todaysdate_epoch()
{
	var todaysDate = new Date();
    var humDate = new Date(Date.UTC(todaysDate.getFullYear(),todaysDate.getUTCMonth(),todaysDate.getUTCDate(),todaysDate.getUTCHours(),todaysDate.getMinutes(),todaysDate.getSeconds()+1));
	var epochDate = Number((humDate.getTime()/1000.0));
    return epochDate;
}


//-- convert date to epoch
fglobal.prototype.convert_dateepoch = fglobal_convert_dateepoch;
function fglobal_convert_dateepoch(intYear,intMonth,intDay,intHour,intMinutes,intSeconds)
{
    var humDate = new Date(Date.UTC(intYear,intMonth-1,intDay,intHour,intMinutes,intSeconds));
    var epochDate = Number((humDate.getTime()/1000.0));
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

//-- handle sla matrix change for a call _swdoc
oITSM.prototype.handle_sla_matrix_change = itsm_handle_sla_matrix_change;
function itsm_handle_sla_matrix_change(oDoc)
{
	if(oDoc.strMatrixSLA=="") return;
	if(!app.session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCHANGEPRIORITY))	return;
	if(confirm("The recommended priority to be used for this " + oDoc.opencall.callclass + " is " + oDoc.strMatrixSLA + ". Would you like to use the recommended priority?"))
	{           
		//-- call vpme script to alter sla
		var xmlmc = new XmlMethodCall();

		// Set up our input parameters
		xmlmc.SetValue("in_callref", oDoc.opencall.callref);
		xmlmc.SetValue("in_sla", oDoc.strMatrixSLA);

		// Invoke the method
		if(xmlmc.Invoke("VPME", "itsmImpactUrgencyChange"))
		{
			//MessageBox(xmlmc.GetReturnValue("res1"));
			oDoc.strOriginalSLA = oDoc.strMatrixSLA;
			oDoc.UpdateFormFromData();
		}
		else
		{
			MessageBox(xmlmc.GetLastError());
		}                                               
	}
}


fglobal.prototype.get_sld_slas = fglobal_get_sld_slas;
function fglobal_get_sld_slas(strSLDs)
{
	if(strSLDs=="" ||strSLDs==undefined)
		return "";
	var strSLAs = "";
	var oRS  = this.get_sqrecordset("general/get_sld_slas.select","slaid=" + strSLDs);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while (oRS.Fetch())
	{ 
			if(strSLAs!="")strSLAs +=",";
			strSLAs += this.get_field(oRS,"fk_ssla");
	}
	return strSLAs;

}

//-- given a seperated string of values pfs them and put them in '
fglobal.prototype.pfs_keys = fglobal_pfs_keys;
function fglobal_pfs_keys(strKeys,boolAddQuotes,strSep)
{
	if(boolAddQuotes==undefined)boolAddQuotes=true;
	if(strSep==undefined)strSep=",";

	var strQuote = (boolAddQuotes)?"'":"";
	var strPreparedValues = "";
	var arrValues = strKeys.split(strSep);
	for(var x=0;x<arrValues.length;x++)
	{
		if(strPreparedValues!="")strPreparedValues +=strSep;
		//-- nwj - we should never have to use this now as we process data serverside
		//strPreparedValues += strQuote + this.pfs(arrValues[x]) + strQuote;
		strPreparedValues += arrValues[x];
	}

	if(strPreparedValues=="")strPreparedValues='';
	return strPreparedValues;
}


//-- given a CI type, return the service requests for it (including inherited)
fglobal.prototype.get_ci_service_request_type = fglobal_get_ci_service_request_type;
function fglobal_get_ci_service_request_type(strType,boolAddQuotes,strSep)
{
	if(boolAddQuotes==undefined)boolAddQuotes=true;
	if(strSep==undefined)strSep=",";

	var ap = {};
	ap.type = strType;
	ap.baq = false;
	ap.sep = strSep;
	return app.g.submitsqp("service/process/get_ci_service_request_type",ap);
}

//-- given a CI type, return the service requests for it (including inherited)
fglobal.prototype.get_service_costs_inherit = fglobal_get_service_costs_inherit;
function fglobal_get_service_costs_inherit(intServiceID,strSep)
{
	if(strSep==undefined)strSep=",";

	var strChildIDs = "";

	var aP = {};
	aP.fk_parent_id = intServiceID;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);

	while (oRS.Fetch())
	{ 
			if(strChildIDs!="")strChildIDs +=strSep;
			strChildIDs += this.get_field(oRS,"fk_child_id");
	}
	if(strChildIDs=="")	strChildIDs="0";
	return strChildIDs;
}

//-- given a CI type, return the service requests for it (including inherited)
oService.prototype.add_subscription = oService_add_subscription;
function oService_add_subscription(strType, oServiceObj, funcCallback)
{
	var funcFinalProcessing = function(objReturned, funcCallback2)
	{		
		if(objReturned.keys=="")
		{
			if ((funcCallback2 != undefined) && (funcCallback2 != null))
			{
				funcCallback2();
			}
		}
		else
		{
			var strExisting = "";
			var strKeys = "";
			var strSelectedKeys = objReturned.keys;
			var arrSelectedKeys = strSelectedKeys.split(",");
			var numberFound = 0;
			var reqPrice = "";
			var subPrice = "";
			for(var x in arrSelectedKeys)
			{
				//var strSQL = "sxelect * from CONFIG_ITEMI where PK_AUTO_ID ="+arrSelectedKeys[x];
				//var oRS = app.g.gxet_recordset(strSQL,"swdata");
				var strParams = "table=config_itemi&kv="+arrSelectedKeys[x]
				var oRS = app.g.get_sqrecordset("select.tablebykey",strParams);
				while(oRS.Fetch())
				{
					fetchText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
					fetchTable = app.g.get_field(oRS,"ME_TABLE");

					//filter out all those selected that are already subscribed
					//var strSQL = "sxelect * from SC_SUBSCRIPTION where FK_ME_KEY='" + app.g.pfs(fetchText) + "' and FK_ME_TABLE='" + app.g.pfs(fetchTable) + "' and FK_SERVICE = "+oServiceObj.fk_cmdb_id;
					//var oExisting = app.g.gxet_recordset(strSQL,"swdata");
					var arrCols = [];arrCols.FK_ME_KEY = fetchText;arrCols.FK_ME_TABLE = fetchTable;arrCols.FK_SERVICE = oServiceObj.fk_cmdb_id;
					var oExisting = app.g.get_tablerecordset_bycol("SC_SUBSCRIPTION",arrCols);
					if(oExisting.Fetch())
					{
						var relType =  app.g.get_field(oExisting,"REL_TYPE");
						if(relType=="SUBSCRIPTION")
						{
							fetchDesc = app.g.get_field(oRS,"DESCRIPTION");
							if(strExisting!="")strExisting+="\n";
							strExisting+=fetchDesc;
						}
						else
						{
							numberFound++;
							reqPrice = app.g.get_field(oExisting,"REQUEST_PRICE");
							subPrice = app.g.get_field(oExisting,"SUBSCRIPTION_PRICE");
							if(strKeys!="")strKeys+=",";
							strKeys+=arrSelectedKeys[x];
						}
					}
					else
					{
						numberFound++;
						if(strKeys!="")strKeys+=",";
						strKeys+=arrSelectedKeys[x];
					}
				}
			}
			if(!(numberFound==1 && arrSelectedKeys.length==1))
			{
				reqPrice = "0.00";
				subPrice = "0.00";
			}

			//if there was a record selected that was already subscribed, alert
			if(strExisting!="")
				MessageBox("The following records were already subscribed to the service:\n\n"+strExisting);

			//if there are no keys selected that arent already subscribed, exit
			if(strKeys=="")
			{
				if ((funcCallback2 != undefined) && (funcCallback2 != null))
				{
					funcCallback2(true);
				}
			}
			else
			{
				//-- prompt user to enter chargeable information
				var strArgs = "serviceItem=" + oServiceObj.fk_cmdb_id + "&parenttype=&linkitems=" + strKeys+"&reqPrice="+reqPrice+"&subPrice="+subPrice+"&servicePrice="+oServiceObj.cost_request;
				app.OpenFormForAdd("service_charge", "", strArgs, true, function(returnDoc)
				{
					if(!returnDoc.document.boolSaved)
					{
						if ((funcCallback2 != undefined) && (funcCallback2 != null))
						{
							funcCallback2(false);
						}
					}

					var strTotalCharge = (returnDoc.document.total_charge);
					var strUnits = (returnDoc.document.units);
					if(strUnits=="")
						strUnits="0";
					var strUnitCharge = (returnDoc.document.unit_charge);
					var strChargeType = (returnDoc.document.charge_type);
					var intStartDate = (returnDoc.document.start_date);
					var intChargable = (returnDoc.document.chargable);
					var strMarkUp = (returnDoc.document.mark_up);
					var strRequestPrice = (returnDoc.document.request_price);
					var strSubscriptionPrice = (returnDoc.document.subscription_price);
					var strSLAs = (returnDoc.document.strSLAs);
					var arrSLA = strSLAs.split(",");

					//-- get options that user selected
					var ynOperational = "Yes";//(returnDoc.document.operational=="1")?"Yes":"No";
					var strDependancy = "Subscribes to";//returnDoc.document.relationtype;

					//-- inti vars
					var fetchKey=0;
					var fetchType = "";
					var fetchText = "";

					//load CI
					var oCI = app.g.get_record("CONFIG_ITEMI", oServiceObj.fk_cmdb_id);

					//-- select the the ci fetch data rows
					var strExisting = "";
					//var strSQL = "sxelect * from CONFIG_ITEMI where PK_AUTO_ID in (" + strKeys + ")";
					//var oRS = app.g.gxet_recordset(strSQL,"swdata");
					var strParams="cids=" + strKeys;
					var oRS = app.g.get_sqrecordset("cmdb/common/select.config_items",strParams);
					while(oRS.Fetch())
					{
						fetchKey  = app.g.get_field(oRS,"PK_AUTO_ID");
						fetchText = app.g.get_field(oRS,"CK_CONFIG_ITEM");
						fetchType = app.g.get_field(oRS,"CK_CONFIG_TYPE");
						fetchDesc = app.g.get_field(oRS,"DESCRIPTION");
						fetchTable = app.g.get_field(oRS,"ME_TABLE");

						var sqlResult = true;
						//-- if exists - its permission to view, so update to be a subscription
						//var strSQL = "sxelect * from SC_SUBSCRIPTION where FK_ME_KEY='" + app.g.pfs(fetchText) + "' and FK_ME_TABLE='" + app.g.pfs(fetchTable) + "' and FK_SERVICE = "+oServiceObj.fk_cmdb_id;
						//var oExisting = app.g.gxet_recordset(strSQL,"swdata");
						var arrCols = [];arrCols.FK_ME_KEY = fetchText;arrCols.FK_ME_TABLE = fetchTable;arrCols.FK_SERVICE = oServiceObj.fk_cmdb_id;
						var oExisting = app.g.get_tablerecordset_bycol("SC_SUBSCRIPTION",arrCols);
						if(oExisting.Fetch())
						{
							//-- update to be a subscription
							//var strUpdate = "uxpdate sc_subscription set REL_TYPE='SUBSCRIPTION',FLG_CHARGABLE="+intChargable+", UNITS="+strUnits+", UNIT_CHARGE='"+strUnitCharge+"', MARK_UP='"+strMarkUp+"', TOTAL_CHARGE='"+strTotalCharge+"', START_DATEX="+intStartDate+",CHARGE_TYPE='"+strChargeType+"', REQUEST_PRICE='"+strRequestPrice+"',SUBSCRIPTION_PRICE='"+strSubscriptionPrice+"' where pk_id= "+app.g.get_field(oExisting,"pk_id");
							//app.g.sxubmitsql(strUpdate,true);
							var arrCols = [];
							arrCols.REL_TYPE = 'SUBSCRIPTION';arrCols.FLG_CHARGABLE = intChargable;arrCols.UNITS = strUnits;
							arrCols.UNIT_CHARGE = strUnitCharge;arrCols.MARK_UP = strMarkUp;arrCols.TOTAL_CHARGE = strTotalCharge;
							arrCols.START_DATEX = intStartDate;arrCols.CHARGE_TYPE = strChargeType;arrCols.REQUEST_PRICE = strRequestPrice;
							arrCols.SUBSCRIPTION_PRICE = strSubscriptionPrice;
							var strParams = "kv="+app.g.get_field(oExisting,"pk_id");
							for(strCol in arrCols){
								strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrCols[strCol]);
							}

							app.g.submitsqs("service/add_subscription.update",strParams);
						}
						else
						{
							//-- does not exist so insert
							//var strInsert = "ixnsert into SC_SUBSCRIPTION (FK_ME_KEY, FK_ME_TABLE,TYPE,FK_ME_DISPLAY, FK_SERVICE, FLG_CHARGABLE, UNITS, UNIT_CHARGE, MARK_UP, TOTAL_CHARGE, START_DATEX,CHARGE_TYPE, REL_TYPE, REQUEST_PRICE, SUBSCRIPTION_PRICE) values ";	
							//strInsert += " ('" + app.g.pfs(fetchText) + "','" + app.g.pfs(fetchTable) + "','"+objReturned.type+"','"+app.g.pfs(fetchDesc)+"'," + oServiceObj.fk_cmdb_id + ","+intChargable+","+strUnits+",'"+strUnitCharge+"','"+strMarkUp+"','"+strTotalCharge+"',"+intStartDate+",'"+strChargeType+"','SUBSCRIPTION','"+strRequestPrice	+"','"+strSubscriptionPrice+"')";	
							//app.g.sxubmitsql(strInsert,true);
							var arrCols = [];
							arrCols.FK_ME_KEY = fetchText;arrCols.FK_ME_TABLE = fetchTable;arrCols.TYPE = objReturned.type;
							arrCols.FK_ME_DISPLAY = fetchDesc;arrCols.FK_SERVICE = oServiceObj.fk_cmdb_id;arrCols.FLG_CHARGABLE = intChargable;
							arrCols.UNITS = strUnits;arrCols.UNIT_CHARGE = strUnitCharge;arrCols.MARK_UP = strMarkUp;
							arrCols.TOTAL_CHARGE = strTotalCharge;arrCols.START_DATEX = intStartDate;arrCols.CHARGE_TYPE = strChargeType;
							arrCols.REL_TYPE = 'SUBSCRIPTION';arrCols.REQUEST_PRICE = strRequestPrice;arrCols.SUBSCRIPTION_PRICE = strSubscriptionPrice;
							var strParams = "";
							for(strCol in arrCols)
							{
								strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrCols[strCol]);
							}
							app.g.submitsqs("service/add_subscription.insert",strParams);
						}

						//-- now create a cmdb relationship
						var arrCols = [];arrCols.parentKey = fetchKey;arrCols.parentType = fetchType;arrCols.parentText = fetchText;
						arrCols.childKey = oCI.pk_auto_id;arrCols.childType = "ME->SERVICE";arrCols.childText = oCI.ck_config_item;arrCols.strDependancy = strDependancy;
						arrCols.ynOperational = ynOperational;arrCols.strParentDesc = fetchDesc;arrCols.strChildDesc = oCI.description;arrCols.boolOption = false;
						var strParams = "";
						for(strCol in arrCols)
						{
							strParams += "&" + strCol +"=" + pfu(arrCols[strCol]);
						}
						var sqlResult = app.g.submitsqs("service/insert_configrelation",strParams);
						if(!sqlResult)
						{
							MessageBox("Failed to build relationship between [" + oServiceObj.service_name + "] and [" + fetchText + "]. Please contact your Supportworks Administrator");
						}
						else
						{
							//if there are slas chosen, get the inserted record, and insert associated sla entries
							if(arrSLA!="")
							{
								var intSubscription = 0;
								//var strSQL = "sxelect pk_id as intSubscription from SC_SUBSCRIPTION where REL_TYPE='SUBSCRIPTION' and FK_ME_KEY='" + app.g.pfs(fetchText) + "' and FK_ME_TABLE='" + app.g.pfs(fetchTable) + "' and FK_SERVICE = "+oServiceObj.fk_cmdb_id;
								//var oRecS = app.g.gxet_recordset(strSQL,"swdata");
								var strParams = "fmk=" + pfu(fetchText) + "&fmt=" + pfu(fetchTable) +"&fks=" + pfu(oServiceObj.fk_cmdb_id);
								var oRecS = app.g.get_sqrecordset("service/add_subscription.selectsubscriptionid",strParams);
								while(oRecS.Fetch())
								{
									intSubscription =app.g.get_field(oRecS,"intSubscription");
								}

								//get the cost information so that 
								//var strSQL = "sxelect * from sc_sla where fk_service="+oServiceObj.fk_cmdb_id+" and fk_subscription='' and fk_sla in ("+arrSLA.join(",")+")";
								//var oRecS = app.g.gxet_recordset(strSQL,"swdata");
								var strParams = "fkslas=" + pfu(arrSLA.join(",")) + "&fks=" + pfu(oServiceObj.fk_cmdb_id);
								var oRecS = app.g.get_sqrecordset("service/add_subscription.selectsc_sla",strParams);
								while(oRecS.Fetch())
								{
									var intSLA =app.g.get_field(oRecS,"fk_sla");
									var strSLAName = app.g.get_field(oRecS,"fk_sla_name");
									var intCOST =app.g.get_field(oRecS,"cost");
									var intPRICE =app.g.get_field(oRecS,"price");
									//var strInsert = "ixnsert into SC_SLA (FK_SUBSCRIPTION, FK_SLA, FK_SLA_NAME, COST, TOTAL_COST, PRICE) values ("+ intSubscription+",'"+app.g.pfs(intSLA)+"','"+app.g.pfs(strSLAName)+"','"+app.g.pfs(intCOST)+"','"+app.g.pfs(intCOST)+"','"+app.g.pfs(intPRICE)+"')";	
									//app.g.sxubmitsql(strInsert,true);
									var arrCols = [];
									arrCols.FK_SUBSCRIPTION = intSubscription;arrCols.FK_SLA = intSLA;arrCols.FK_SLA_NAME = strSLAName;
									arrCols.COST = intCOST;arrCols.TOTAL_COST = intCOST;arrCols.PRICE = intPRICE;arrCols.APPCODE = itsm_get_session_param("dataset");
									var strParams = "";
									for(strCol in arrCols)
									{
										strParams += "&_swc_" + LC(strCol) +"=" + pfu(arrCols[strCol]);
									}
									app.g.submitsqs("service/add_subscription.add_sla.insert",strParams);
								}
							}
						}
					}
					if ((funcCallback2 != undefined) && (funcCallback2 != null))
					{
						funcCallback2(true);
					}
				});	
			}
		}	
	}
	
	if(strType == 'search_customers')
	{
		this.add_customer_subscription(strType, oServiceObj, function(objReturned)
		{
			funcFinalProcessing(objReturned, function(boolRes)
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(boolRes);
				}
			});
			
		});
	}
	else if(strType == 'search_company')
	{
		this.add_company_subscription(strType, oServiceObj, function(objReturned)
		{
			funcFinalProcessing(objReturned, function(boolRes)
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(boolRes);
				}
			});
		});
	}
	else if (strType == 'search_dept')
	{
		this.add_dept_subscription(strType, oServiceObj, function(objReturned)
		{
			funcFinalProcessing(objReturned, function(boolRes)
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(boolRes);
				}
			});
		});
	}
	else
	{
		var boolRes = funcFinalProcessing(function()
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(boolRes);
			}
		});
	}
}

oService.prototype.add_customer_subscription = oService_add_customer_subscription;
function oService_add_customer_subscription(strType, oService, funcCallback)
{
	var strURL = "type=" + strType;
	strURL += "&multiselect=0&searchmode=1";
	app.g.popup('search_customers',strURL,function(oRes)
	{
		var tmpObj = {};
		if (oRes)
		{
			tmpObj.keys = oRes.document.strSelectedCMDBIDs;
			tmpObj.type = 'Customer';
			tmpObj.table = 'userdb';
			_ete(tmpObj , oRes.document.strSelectedText);
		}
		else
		{
			tmpObj.keys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
			

	});	
}

oService.prototype.add_company_subscription = oService_add_company_subscription;
function oService_add_company_subscription(strType, oService, funcCallback)
{
	var strURL = "type=" + strType;
	strURL += "&multiselect=0&searchmode=1";
	app.g.popup('search_company',strURL,function(oRes)
	{
		var tmpObj = {};
		if (oRes)
		{
			tmpObj.keys = oRes.document.strSelectedCMDBIDs;
			tmpObj.type = 'Organisation';
			tmpObj.table = 'company';
			_ete(tmpObj , oRes.document.strSelectedText);
		}
		else
		{
			tmpObj.keys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
	});	

	
}

oService.prototype.add_dept_subscription = oService_add_dept_subscription;
function oService_add_dept_subscription(strType, oService, funcCallback)
{
	var strURL = "type=" + strType;
	strURL += "&multiselect=0&searchmode=1";
	app.g.popup('search_dept',strURL,function(oRes)
	{
		var tmpObj = {};
		if (oRes)
		{
			tmpObj.keys = oRes.document.strSelectedCMDBIDs;
			tmpObj.type = 'Department';
			tmpObj.table = 'department';
			_ete(tmpObj , oRes.document.strSelectedText);
		}
		else
		{
			tmpObj.keys = "";
		}
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(tmpObj);
		}
	});		
}


oService.prototype.get_customer_services = oService_get_customer_services;
function oService_get_customer_services(strKeysearch,boolServices,boolCustForm,strCallClass)
{
	if(boolServices==undefined)
		boolServices = 0;
	var aP = {};
	aP.ks = strKeysearch;
	aP.bs = boolServices;
	aP.cc = strCallClass;
	if(boolCustForm)
		aP.cf = true;
	return app.g.submitsqp("service/process/get_customer_services",aP);
}


oService.prototype.get_customer_subscription = oService_get_customer_subscription;
function oService_get_customer_subscription(strKeysearch,strServiceID,strRelType)
{
	if(strRelType==undefined)strRelType="";

	var aP = {};
	aP.ks = strKeysearch
	aP.sid = strServiceID;
	aP.rel = strRelType;
	var res = app.g.submitsqp("service/process/get_customer_subscription",aP)
	return res-0; //-- cast

}

oService.prototype.get_direct_customer_services = oService_get_direct_customer_services;
function oService_get_direct_customer_services(strKeysearch,boolServices)
{
	if (boolServices==undefined)boolServices=true;

	var aP = {};
	aP.ks = strKeysearch;
	aP.bs = boolServices;
	return app.g.submitsqp("service/process/get_direct_customer_services",aP);
}

oService.prototype.get_ids_of_costs = oService_get_ids_of_costs;
function oService_get_ids_of_costs(strServiceID)
{
	var strKeys = "";
	var strDB = "swdata";

	var aP = {};
	aP.fk_service = strServiceID;
	var oRS = app.g.get_tablerecordset_bycol("sc_rels",aP);

	while (oRS.Fetch())
	{ 
			if(strKeys!="")strKeys +=",";
			strKeys += app.g.get_field(oRS,"pk_auto_id");
	}

	if(strKeys=="")strKeys="0";
	return strKeys;
}


oService.prototype.get_subscription_slas = oService_get_subscription_slas;
function oService_get_subscription_slas(intSubscription)
{
	var strSLAs = "";

	var aP = {}
	aP.fk_subscription = intSubscription;
	var oRS  = app.g.get_tablerecordset_bycol("sc_sla",aP);

	while (oRS.Fetch())
	{ 
			if(strSLAs!="")strSLAs +=",";
			strSLAs += app.g.get_field(oRS,"fk_sla");
	}
	if(strSLAs=="")strSLAs="-1";

	return strSLAs;
}


oService.prototype.get_organisation_services = oService_get_organisation_services;
function oService_get_organisation_services(strCompanyID,boolServices,boolOrgForm)
{
	if (boolServices==undefined)boolServices=true;

	var aP = {};
	aP.oid = strCompanyID;
	aP.bs = boolServices;
	if(boolOrgForm)
		aP.of = true;
	return app.g.submitsqp("service/process/get_organisation_services",aP);
}

oService.prototype.get_dept_services = oService_get_dept_services;
function oService_get_dept_services(strDeptID,boolServices)
{
	if (boolServices==undefined)boolServices=true;

	var aP = {};
	aP.did = strDeptID;
	aP.bs = boolServices;
	return app.g.submitsqp("service/process/get_dept_services",aP);
}

oService.prototype.get_site_services = oService_get_site_services;
function oService_get_site_services(strSiteID,boolServices)
{
	if (boolServices==undefined)boolServices=true;

	var aP = {};
	aP.sid = strSiteID;
	aP.bs = boolServices;
	return app.g.submitsqp("service/process/get_site_services",aP);
}


oService.prototype.get_service_revenue = oService_get_service_revenue;
function oService_get_service_revenue(strServiceID)
{
	var intServiceRevenue = 0;
	var value = 0;
	
	var aP = {}
	aP.rel_type = 'SUBSCRIPTION';
	aP.flg_chargable = 1;
	aP.fk_service = strServiceID;
	var oRS  = app.g.get_tablerecordset_bycol("sc_subscription",aP);

	while (oRS.Fetch())
	{ 
		value = app.g.get_field(oRS,"subscription_price")
		if(value=="") value = 0;
		value = parseFloat(value);
		intServiceRevenue += value;
	}

	return intServiceRevenue;
}

oService.prototype.count_service_users = oService_count_service_users;
function oService_count_service_users(strServiceID)
{
	var intCount = app.g.sqs_rowcount("service/process/count_service_users","sid="+pfu(strServiceID));
	return intCount;
}

function format_float_to_decimal_str(fltNumber,boolPositive)
{
	if (boolPositive==undefined)
	{
		boolPositive = false;
	}
	fltNumber = String(fltNumber);
	var newNum = "";
	var strIndex = fltNumber.indexOf(".",0);
	if(strIndex > -1){
		var newNum = fltNumber.substr(0, strIndex+3);
		
		if((strIndex+3)-newNum.length)
			newNum += "0";
	}
	else
	{
		if(fltNumber=="")
			fltNumber = "0";
		newNum = fltNumber+".00";
	}
	
	if (boolPositive)
	{
		strIndex = newNum.indexOf("-",0);
		if (strIndex > -1)
		{
			newNum = newNum.substr(1, newNum.length-1);
		}
	}
	return newNum;
}

oService.prototype.calculate_revenue = oService_calculate_revenue;
function oService_calculate_revenue(strServiceID, oServiceRecord)
{
	var fltRev = this.get_service_revenue(strServiceID);
	var strNewRev = format_float_to_decimal_str(fltRev);

	var numberOfUsers = Number(this.count_service_users(strServiceID));

	//var revenuePerUser = format_float_to_decimal_str(parseFloat(strNewRev)/numberOfUsers);

	//-- nwj - 31.03.2009 - if passed in form record object just update that.
	if(oServiceRecord!=undefined)
	{
		//-- set record values 
		oServiceRecord.users_difference = oServiceRecord.users_projected - numberOfUsers;
		oServiceRecord.users_difference  = oServiceRecord.users_difference + "";
		oServiceRecord.total_subscription_revenue = strNewRev;
		oServiceRecord.users_actual = numberOfUsers;
	}
	else
	{
		//-- update db physically as no record passed in
		//strSQL = "Uxpdate sc_folio set users_difference = users_projected - "+numberOfUsers+" ,total_subscription_revenue = '"+strNewRev+"', users_actual = '"+numberOfUsers+"' where fk_cmdb_id = "+strServiceID;
		//app.g.sxubmitsql(strSQL, true);
		var strParams = "numberOfUsers="+ numberOfUsers + "&strNewRev="+strNewRev+"&numberOfUsers=" + numberOfUsers +"&fcid="+strServiceID;
		app.g.submitsqs("service/calculate_revenue.update", strParams);
	}
	this.update_service_costs(strServiceID, oServiceRecord);
	return true;
}


//-- given a CI type, return the service requests for it (including inherited)
oService.prototype.update_service_costs = oService_update_service_costs;
function oService_update_service_costs(oServiceKey, oServiceRecord,childKeys)
{
	if(childKeys==undefined)
		var childKeys = ""+oServiceKey;
	else
		var childKeys = childKeys+","+oServiceKey;

	var arrValues = this.get_service_costs(oServiceKey);

	//-- nwj - 31.03.2009 - if passed in form record object just update that.
	if(oServiceRecord!=undefined)
	{
		//-- set record values 
		oServiceRecord.cost_maintenance = arrValues[1];
		oServiceRecord.cost_subscription = arrValues[0];
		oServiceRecord.cost_request = arrValues[2];
	}
	else
	{
		//strSQL = "Uxpdate sc_folio set cost_maintenance = '"+arrValues[1]+"',cost_subscription = '"+arrValues[0]+"', cost_request = '"+arrValues[2]+"' where fk_cmdb_id = "+oServiceKey;
		//app.g.sxubmitsql(strSQL, true);
		var strParams = "cm="+arrValues[1]+"&cs="+arrValues[0]+"&cr="+arrValues[2]+"&fcid="+pfu(oServiceKey)
		app.g.submitsqs("service/update_service_costs.update", strParams);
	}

	var arrChildren = childKeys.split(",");

	//var strSQL  = "SxELECT * from config_reli where fk_child_id = "+oServiceKey+" and fk_parent_type='ME->SERVICE' ";
	//var strDB = "swdata";
	//var oRS  = app.g.gxet_recordset(strSQL,strDB);
	var strParams = "fcid="+pfu(oServiceKey)
	var oRS = app.g.get_sqrecordset("service/update_service_costs.select", strParams);

	while (oRS.Fetch())
	{ 
		var parentKey = ""+app.g.get_field(oRS,"fk_parent_id");
		if(!in_array(arrChildren,parentKey))this.update_service_costs(parentKey,null,childKeys);
	}

	return true;
}

oService.prototype.get_service_costs = oService_get_service_costs;
function oService_get_service_costs(oServiceKey,intInitialUnitCost,intBaseCost)
{
	var intSubscription = 0;
	var intService = 0;
	var intRequest = 0;
	var weighting = "";

	//var strSQL  = "S/ELECT * from sc_rels where fk_service in ("+oServiceKey+") and flg_include=1 and (flg_isoptional=1 OR flg_isoptional IS NULL  or flg_isoptional='')";//(flg_isoptional=0 OR flg_isoptional IS NULL)";
	//var strDB = "swdata";
	//var oRS  = app.g.g/et_recordset(strSQL,strDB);
	var strParams = "_kv=" + pfu(oServiceKey)
	var oRS  = app.g.get_sqrecordset("service/get_service_costs.select",strParams);
	while (oRS.Fetch())
	{ 
		if(app.g.get_field(oRS,"apply_type")=="Per Request")
		{
			intRequest = intRequest+ Number(app.g.get_field(oRS,"total_cost_for_item"));
		}
		else if(app.g.get_field(oRS,"apply_type")=="Per Subscription")
		{
			intSubscription = intSubscription+ Number(app.g.get_field(oRS,"total_cost_for_item"));
		}
		else
		{
			weighting = app.g.get_field(oRS,"cost_weighting");
			if (weighting=="")
			{
				weighting = "0";
			}
			intService = intService+ (Number(app.g.get_field(oRS,"total_cost_for_item"))*( (Number(weighting)+100)/100));
		}
	}
	
	var intSubscription = format_float_to_decimal_str(parseFloat(intSubscription));
	var intService = format_float_to_decimal_str(parseFloat(intService));
	var intRequest = format_float_to_decimal_str(parseFloat(intRequest));
	return Array(intSubscription,intService,intRequest);
}

oService.prototype.get_service_costing = oService_get_service_costing;
function oService_get_service_costing(oServiceKey,strCostKey,intCost,strCostType)
{
	var intCostValue = 0;
	var weighting = "";

	var ap = {};
	ap.sid = oServiceKey;
	ap.at = strCostType;
	var oRS  = app.g.get_sqrecordset("service/get_service_costing.select",ap);
	
	while (oRS.Fetch())
	{ 
		if(app.g.get_field(oRS,"pk_auto_id")==strCostKey)
		{
			intCostValue = intCostValue + parseFloat(intCost);
		}
		else
		{
			intCostValue = intCostValue+ parseFloat(app.g.get_field(oRS,"total_cost_for_item"));
		}
	}
	if(strCostKey=="0")
	{
			intCostValue = intCostValue + parseFloat(intCost);
	}
	return format_float_to_decimal_str(parseFloat(intCostValue));
}

//-- given a CI type, return the service requests for it (including inherited)
oService.prototype.create_ci_relationship = oService_create_ci_relationship;
function oService_create_ci_relationship(oServiceKey,boolComponent)
{
	if (boolComponent==undefined)
	{
		boolComponent= false;
	}

	var strParams = "_kv="+pfu(oServiceKey) + "&_bc=" + boolComponent;
	app.g.submitsqs("service/process/create_ci_relationship", strParams);
	return true;

	/*
	var strType = "Underpinning Service";
	if (boolComponent)
	{
		var strType = "Component";
	}
	var intPerUser = 0;
	var intService = 0;

	//list of relationships without a cost
	var strSQL  = "sxelect config_reli.* from config_reli left join sc_rels on sc_rels.fk_key =fk_child_id and fk_service=fk_parent_id where fk_parent_id = ("+oServiceKey+")    and sc_rels.pk_auto_id IS NULL";
	var strDB = "swdata";
	var oRS  = app.g.gxet_recordset(strSQL,strDB);
	while (oRS.Fetch())
	{ 
		var type = ((app.g.get_field(oRS,"fk_child_type")).toUpperCase()=="ME->SERVICE");
		if(type)
		{
			var childKey = app.g.get_field(oRS,"fk_child_id");
			var description = app.g.get_field(oRS,"childdesc");
			var childID = app.g.get_field(oRS,"fk_child_itemtext");
			var strSQL  = "sxelect * from sc_folio where fk_cmdb_id = "+childKey;
			var oRec  = app.g.gxet_recordset(strSQL,strDB);
			//get service costs
			while (oRec.Fetch())
			{ 
				 app.g.get_field(oRec,"fk_child_id");
				var strCols = "fk_service,fk_key,service_id,description,flg_include,apply_type,flg_cancustomise,cost_type,units,total_cost,total_unit_cost,total_cost_for_item,price";
				var strVals = oServiceKey+","+childKey+",'"+app.g.pfs(childID)+"','"+app.g.pfs(description)+"',1,'Maintenance','0','"+strType+"','1','"+app.g.get_field(oRec,"total_cost")+"','"+app.g.get_field(oRec,"total_unit_cost")+"','"+app.g.get_field(oRec,"total_cost_for_item")+"','"+app.g.get_field(oRec,"total_cost_for_item")+"'";
			}
		}else
		{
			var parentKey = app.g.get_field(oRS,"fk_parent_id");
			var childKey = app.g.get_field(oRS,"fk_child_id");
			var childID = app.g.get_field(oRS,"fk_child_itemtext");
			var description = app.g.get_field(oRS,"childdesc");
			var strCols = "fk_service,fk_key,service_id,description,flg_include,apply_type,flg_cancustomise,cost_type,";
			var strVals = parentKey+","+childKey+",'"+app.g.pfs(childID)+"','"+app.g.pfs(description)+"',1,'Maintenance','0',";
			//TODO COST
			strCols += "units,total_unit_cost";
			strVals += "'Underpinning CI','1',''";
		}
		var strSQL = "Ixnsert into sc_rels ("+strCols+") values ("+strVals+") ";
		app.g.sxubmitsql(strSQL, true);

	}
	this.update_service_costs(oServiceKey);

	return true;
	*/
}

//-- given a Organisation, return the child organisations
fglobal.prototype.get_child_orgs_ids = fglobal_get_child_orgs_ids;
function fglobal_get_child_orgs_ids(strOrgID,boolDirectOnly)
{
	if(boolDirectOnly==undefined)boolDirectOnly=true;

	var strQuote = "'";
	var strPreparedValues = "";
	var strSep = ",";

	var aP = {}
	aP.fk_child_type = 'ME->COMPANY';
	aP.fk_parent_type = 'ME->COMPANY';
	aP.fk_parent_itemtext = strOrgID;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);

	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOrg = this.get_field(oRS,"fk_child_itemtext")
			strPreparedValues += strQuote +strOrg+strQuote;
			if(boolDirectOnly=="0")
				strPreparedValues += strSep+this.get_child_orgs_ids(this.get_field(oRS,"fk_child_itemtext"),boolDirectOnly);
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

//-- given a Organisation, return the child organisations
fglobal.prototype.get_orgs_slas = fglobal_get_orgs_slas;
function fglobal_get_orgs_slas(strOrgID)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	var aP = {}
	aP.fk_child_type = 'ME->SLA';
	aP.fk_parent_type = 'ME->COMPANY';
	aP.fk_parent_itemtext = strOrgID;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);

	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOrg = this.get_field(oRS,"fk_child_itemtext")
			strPreparedValues += strQuote +strOrg+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
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

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function pfu(strData)
{
	strData = encodeURIComponent(strData);
	//-- To deal with € (Euro sign)
	strData = strData.replace(/%C2%80/g,"%E2%82%AC");
	return strData;
}



//-- nwj - oXmlmcInsert object that allows us to easily prepare for a sql insert
//-- dont have to worry about preparing data as it does it for you
function oXmlmcInsert(strTable)
{
	this.table  = strTable;
	this.fields = [];
}

oXmlmcInsert.prototype.setfield = function (strFieldName,varValue, boolFormatted)
{
	if(boolFormatted==undefined) boolFormatted=false;
	if(app.g.dd_fieldexists(this.table,strFieldName))
	{
		if(boolFormatted) varValue = app.g.dd_format(this.table,strFieldName,varValue);
		this.fields[strFieldName] = varValue;
	}
	else
	{
		MessageBox("XmlcInsert : The Column [" + strFieldName + "] does not exist in the table [" + this.table + "] for insert. The column will not be included as part of the insert");
	}
}

oXmlmcInsert.prototype.execute = function (boolAlertOnError)
{
	if(boolAlertOnError==undefined) boolAlertOnError=true;
	var xmlmc = new XmlMethodCall();

	xmlmc.SetParam("table", this.table);
	for (strColName in this.fields)
	{
		xmlmc.SetData(strColName, this.fields[strColName]);	
	}
	// Invoke the xmlmc
	if(xmlmc.Invoke("data", "addRecord"))
	{
		return true;
	}
	else
	{
		if(boolAlertOnError)
			MessageBox(xmlmc.GetLastError());
		return false;
	}
}

//-- rjc - oXmlmcUpdate object that allows us to easily prepare for a sql insert
//-- dont have to worry about preparing data as it does it for you
function oXmlmcUpdate(strTable)
{
	this.table  = strTable;
	this.fields = [];
}

oXmlmcUpdate.prototype.setfield = function (strFieldName,varValue, boolFormatted)
{
	if(boolFormatted==undefined) boolFormatted=false;
	if(app.g.dd_fieldexists(this.table,strFieldName))
	{
		if(boolFormatted) varValue = app.g.dd_format(this.table,strFieldName,varValue);
		this.fields[strFieldName] = varValue;
	}
	else
	{
		MessageBox("XmlcInsert : The Column [" + strFieldName + "] does not exist in the table [" + this.table + "] for update. The column will not be included as part of the update");
	}
}

oXmlmcUpdate.prototype.execute = function (boolAlertOnError)
{
	if(boolAlertOnError==undefined) boolAlertOnError=true;
	var xmlmc = new XmlMethodCall();

	xmlmc.SetParam("table", this.table);
	for (strColName in this.fields)
	{
		xmlmc.SetData(strColName, this.fields[strColName]);	
	}
	// Invoke the xmlmc
	if(xmlmc.Invoke("data", "updateRecord"))
	{
		return true;
	}
	else
	{
		if(boolAlertOnError)
			MessageBox(xmlmc.GetLastError());
		return false;
	}
}


function oSqlInsert(strTable)
{
	this.table  = strTable;
	this.fields = [];
}


oSqlInsert.prototype.setfield = function (strFieldName,varValue, boolFormatted)
{
	if(boolFormatted==undefined) boolFormatted=false;
	if(app.g.dd_fieldexists(this.table,strFieldName))
	{
		if(boolFormatted) varValue = app.g.dd_format(this.table,strFieldName,varValue);
		this.fields[strFieldName] = varValue;
	}
	else
	{
		MessageBox("SqlInsert : The Column [" + strFieldName + "] does not exist in the table [" + this.table + "] for insert. The column will not be included as part of the insert");
	}
}

oSqlInsert.prototype.execute = function ()
{
	var xmlmc = new XmlMethodCall();

	xmlmc.SetParam("table", this.table);
	for (strColName in this.fields)
	{
		xmlmc.SetData(strColName, this.fields[strColName]);	
	}
	// Invoke the xmlmc
	if(xmlmc.Invoke("data", "addRecord"))
	{
		return true;
	}
	else
	{
		MessageBox(xmlmc.GetLastError());
		return false;
	}
}
//-- eof oSqlInsert

oService.prototype.generate_componentrelation = cmdb_generate_componentrelation;
function cmdb_generate_componentrelation(inKey,boolOptional,funcCallback)
{
	var objServiceDataForm = this;
	//-- get items to relate
	var strURL = "";
	//-- check if have company for ci - if so set url to use if
	 strURL = "canreset=0&flg_canbundle=1";

	app.cmdb.search_service(true, strURL, function(oRes)
	{
		if(oRes.selectedkeys=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
		else
		{
			var strKeys = oRes.selectedkeys;
		
			if(strKeys=="")
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(true);
				}
			}
			else
			{
				objServiceDataForm.add_component(inKey,strKeys,boolOptional);
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(true);
				}
			}
		}
		
	});
}


oService.prototype.generate_cmdb_componentrelation = cmdb_generate_cmdb_componentrelation;
function cmdb_generate_cmdb_componentrelation(inKey,boolOptional,funcCallback)
{
	var objServiceDataForm = this;
	
	//-- get items to relate
	var strURL = "";
	//-- check if have company for ci - if so set url to use if
	 strURL = "canreset=0&flg_canbundle=1";

 	app.OpenForm("browse_cmdb_entities", "mode=select", true, function(oRes)
	{
		//app.cmdb.search_service(true, strURL);
		if(oRes.strSelectedKey=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
		else
		{
			var strKeys = oRes.strSelectedKey;
			
			if(strKeys=="")
			{
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(true);
				}
			}
			else
			{
				objServiceDataForm.add_cmdb_component(inKey,strKeys,boolOptional);

				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(true);
				}
			}
		}
	});
}


oService.prototype.remove_component = oService_remove_component;
function oService_remove_component(strKeys,strConfirm)
{
	if ((strConfirm!=undefined) && (strConfirm!= null) && (strConfirm!=""))
	{
		if (!confirm(strConfirm)) return false;
	}

	var strParams = "_kvs="+pfu(strKeys);
	app.g.submitsqs("service/process/remove_component", strParams);
	return true;

	/*
	var strSQL = "dxelete from sc_rels where fk_service_rels in ("+strKeys+") ";
	app.g.sxubmitsql(strSQL, true);
	var strSQL = "dxelete from sc_rels where pk_auto_id in ("+strKeys+") ";
	app.g.sxubmitsql(strSQL, true);
	return true;
	*/
}


oService.prototype.add_component = oService_add_component;
function oService_add_component(oServiceKey, strComponentKeys, boolOptional)
{
	var strParams = "_skv="+pfu(oServiceKey) +"&_ckvs=" + strComponentKeys + "&opt="+boolOptional;
	app.g.submitsqs("service/process/add_component", strParams);
	return true;

	/*
	if(boolOptional==undefined)boolOptional="0";
	var boolInclude = "1";
	if(boolOptional=="0")
	{
		boolInclude = "0";
	}
	var strSQL  = "sxelect * from sc_folio where fk_cmdb_id in ("+strComponentKeys+")";
	var strDB = "swdata";
	var oRec  = app.g.gxet_recordset(strSQL,strDB);
	while (oRec.Fetch())
	{ 
		var description =  app.g.get_field(oRec,"vsb_title");
		var service_id =  app.g.get_field(oRec,"service_name");
		var strCols = "fk_service,fk_key,service_id,description,flg_include,apply_type,cost_type,flg_cancustomise,units,total_cost,total_unit_cost,flg_isoptional,cost_weighting,total_cost_for_item,price,gl_code";
		var strVals = oServiceKey+","+app.g.get_field(oRec,"fk_cmdb_id")+",'"+app.g.pfs(service_id)+"','"+app.g.pfs(description)+"',"+boolInclude+",'Per Request','Component','0','1','"+app.g.get_field(oRec,"cost_request")+"','"+app.g.get_field(oRec,"cost_request")+"','"+boolOptional+"','0','"+app.g.get_field(oRec,"cost_request")+"','"+app.g.get_field(oRec,"cost_request")+"','"+app.g.get_field(oRec,"fld_kw6")+"'";

		var strSQL = "Ixnsert into sc_rels ("+strCols+") values ("+strVals+") ";
		app.g.sxubmitsql(strSQL, true);
	}
	return true;
	*/
}

oService.prototype.add_cmdb_component = oService_add_cmdb_component;
function oService_add_cmdb_component(oServiceKey, strComponentKey, boolOptional)
{
	var strParams = "_skv="+pfu(oServiceKey) +"&_ckvs=" + strComponentKey + "&opt="+boolOptional;
	app.g.submitsqs("service/process/add_cmdb_component", strParams);
	return true;
	
	/*
	if(boolOptional==undefined)boolOptional="0";
	var boolInclude = "1";
	if(boolOptional=="0")
	{
		boolInclude = "0";
	}
	var strSQL  = "sxelect * from config_typei where pk_config_type in ('"+app.g.pfs(strComponentKey)+"')";
	var strDB = "swdata";
	var oRec  = app.g.gxet_recordset(strSQL,strDB);
	while (oRec.Fetch())
	{ 
		var description =  app.g.get_field(oRec,"type_display");
		var service_id =  app.g.get_field(oRec,"pk_config_type");
		var strCols = "fk_service,service_id,description,flg_include,apply_type,cost_type,flg_cancustomise,units,total_cost,total_unit_cost,flg_isoptional,cost_weighting,total_cost_for_item,price,gl_code";
		var strVals = oServiceKey+",'"+app.g.pfs(service_id)+"','"+app.g.pfs(description)+"',"+boolInclude+",'Per Request','Component','0','1','"+app.g.get_field(oRec,"bus_cost")+"','"+app.g.get_field(oRec,"bus_cost")+"','"+boolOptional+"','0','"+app.g.get_field(oRec,"bus_cost")+"','"+app.g.get_field(oRec,"bus_price")+"','"+app.g.get_field(oRec,"gl_code")+"'";

		var strSQL = "Ixnsert into sc_rels ("+strCols+") values ("+strVals+") ";
		app.g.sxubmitsql(strSQL, true);
	}
	return true;
	*/
}

oService.prototype.add_component_custom = oService_add_component_custom;
function oService_add_component_custom(oComponentKey,strCustomKeys)
{
	var strParams = "_kv="+pfu(oComponentKey) +"&_ckvs=" + strCustomKeys;
	app.g.submitsqs("service/process/add_component_custom", strParams);
	return true;

	/*
	var strSQL  = "sxelect * from sc_rels where pk_auto_id = "+oComponentKey;
	var strDB = "swdata";
	var oRec  = app.g.gxet_recordset(strSQL,strDB);
	while (oRec.Fetch())
	{ 
		var strParentCost =  app.g.get_field(oRec,"total_cost_for_item");
		if(strParentCost=="")
			strParentCost="0";

		var strParentPrice =  app.g.get_field(oRec,"price");
		if(strParentPrice=="")
			strParentPrice="0";
		var strParentApplyType =  app.g.get_field(oRec,"apply_type");
		 //var description =  app.g.get_field(oRec,"service_name");
	}

	var arrKeys = strCustomKeys.split(",");
	for(var i = 0 ; i<arrKeys.length;  i++)
	{
		var strSQL  = "sxelect * from sc_folio where fk_cmdb_id = "+arrKeys[i];
		var oRec  = app.g.gxet_recordset(strSQL,strDB);
		while (oRec.Fetch())
		{ 
			// app.g.get_field(oRec,"fk_child_id");
			var description =  app.g.get_field(oRec,"vsb_title");
			var service_id =  app.g.get_field(oRec,"service_name");

			var strCost = app.g.get_field(oRec,"cost_request");
			if(strCost=="")
				strCost="0";

			var strPrice = app.g.get_field(oRec,"cost_request");
			if(strPrice=="")
				strPrice="0";

			var strDiff = format_float_to_decimal_str(parseFloat(strCost)-parseFloat(strParentCost));
			var strPriceDiff = format_float_to_decimal_str(parseFloat(strPrice)-parseFloat(strParentPrice));

			var strCols = "fk_service_rels,fk_key,service_id,description,flg_include,apply_type,cost_type,flg_cancustomise,units,total_cost,total_unit_cost,customise_diff,cost_weighting,total_cost_for_item,price_diff,price,gl_code";
			var strVals = oComponentKey+","+arrKeys[i]+",'"+app.g.pfs(service_id)+"','"+app.g.pfs(description)+"',1,'"+app.g.pfs(strParentApplyType)+"','Component','0','1','"+app.g.get_field(oRec,"total_cost")+"','"+app.g.get_field(oRec,"cost_request")+"','"+strDiff+"','0','"+app.g.get_field(oRec,"cost_request")+"','"+strPriceDiff+"','"+app.g.get_field(oRec,"cost_request")+"','"+app.g.get_field(oRec,"fld_kw6")+"'";
		}
		var strSQL = "Ixnsert into sc_rels ("+strCols+") values ("+strVals+") ";
		app.g.sxubmitsql(strSQL, true);
	}
	return true;
	*/
}

oService.prototype.add_cmdb_component_custom = oService_add_cmdb_component_custom;
function oService_add_cmdb_component_custom(oComponentKey,strCustomKeys)
{

	var strParams = "_kv="+pfu(oComponentKey) +"&_ckvs=" + strCustomKeys;
	app.g.submitsqs("service/process/add_cmdb_component_custom", strParams);
	return true;

	/*
	var strSQL  = "sxelect * from sc_rels where pk_auto_id = "+oComponentKey;
	var strDB = "swdata";
	var oRec  = app.g.gxet_recordset(strSQL,strDB);
	while (oRec.Fetch())
	{ 
		var strParentCost =  app.g.get_field(oRec,"total_cost_for_item");
		if(strParentCost=="")
			strParentCost="0";

		var strParentPrice =  app.g.get_field(oRec,"price");
		if(strParentPrice=="")
			strParentPrice="0";
		var strParentApplyType =  app.g.get_field(oRec,"apply_type");
		 //var description =  app.g.get_field(oRec,"service_name");
	}

	var arrKeys = strCustomKeys.split(",");
	for(var i = 0 ; i<arrKeys.length;  i++)
	{
		var strSQL  = "sxelect * from config_typei where pk_config_type = '"+app.g.pfs(arrKeys[i])+"'";
		var oRec  = app.g.gxet_recordset(strSQL,strDB);
		while (oRec.Fetch())
		{ 
			// app.g.get_field(oRec,"fk_child_id");
			var description =  app.g.get_field(oRec,"type_display");
			var service_id =  app.g.get_field(oRec,"pk_config_type");

			var strCost = app.g.get_field(oRec,"bus_cost");
			if(strCost=="")
				strCost="0";

			var strPrice = app.g.get_field(oRec,"bus_price");
			if(strPrice=="")
				strPrice="0";

			var strDiff = format_float_to_decimal_str(parseFloat(strCost)-parseFloat(strParentCost));
			var strPriceDiff = format_float_to_decimal_str(parseFloat(strPrice)-parseFloat(strParentPrice));

			var strCols = "fk_service_rels,service_id,description,flg_include,apply_type,cost_type,flg_cancustomise,units,total_cost,total_unit_cost,customise_diff,cost_weighting,total_cost_for_item,price_diff,price,gl_code";
			var strVals = oComponentKey+",'"+app.g.pfs(service_id)+"','"+app.g.pfs(description)+"',1,'"+app.g.pfs(strParentApplyType)+"','Component','0','1','"+app.g.get_field(oRec,"bus_cost")+"','"+app.g.get_field(oRec,"bus_cost")+"','"+strDiff+"','0','"+app.g.get_field(oRec,"bus_cost")+"','"+strPriceDiff+"','"+app.g.get_field(oRec,"bus_price")+"','"+app.g.get_field(oRec,"gl_code")+"'";
		}
		var strSQL = "Ixnsert into sc_rels ("+strCols+") values ("+strVals+") ";
		app.g.sxubmitsql(strSQL, true);
	}
	return true;
	*/
}

oService.prototype.remove_component_custom = oService_remove_component_custom;
function oService_remove_component_custom(strCustomKeys)
{
	//var strSQL = "dxelete from sc_rels where pk_auto_id in ("+strCustomKeys+") ";
	//app.g.sxubmitsql(strSQL, true);
	var strParams = "_kvs="+pfu(strCustomKeys);
	app.g.submitsqs("service/remove_component_custom.delete", strParams);
	return true;
}

oService.prototype.create_dataform = oService_create_dataform;
function oService_create_dataform(strServiceType,strCallclass,funcCallback)
{
	if(strCallclass==undefined)strCallclass="Service Request";
	var strURL = "fk_service_typei=" + strServiceType+"&callclass="+strCallclass;
	app.g.popup("service_dataform",strURL,function(aform)
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			if(aform)
			{
				if (IsObjectDefined("_bHtmlWebClient"))
				{
					var _swdoc = top;
					funcCallback(aform._swdoc.sc_dataform.pk_auto_id);
				}
				else
				{
					funcCallback(aform.document.sc_dataform.pk_auto_id);
				}
			}
			else
			{
				funcCallback("");
			}
		}
	});
}


oService.prototype.add_view_permission = oService_add_view_permission;
function oService_add_view_permission(strType, oServiceObj, funcCallback)
{
	var funcFinalProcessing = function(objReturned)
	{
		//-- nwj use sqp 11.2012 - stored query process 
		if (objReturned.keys=="")
		{
			return false;
		}
		else
		{
			var strParams = "keys=" + pfu(objReturned.keys) +"&type=" + pfu(objReturned.type) +"&sid=" + oServiceObj.fk_cmdb_id;
			app.g.submitsqp("service/process/add_view_permission",strParams);
			return true;
		}
	}
	if (strType == 'search_customers')
	{
		this.add_customer_subscription(strType, oServiceObj, function(objReturned)
		{
			var boolRes = funcFinalProcessing(objReturned);
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(boolRes);
			}
			
		});
	}
	else if (strType == 'search_company')
	{
		this.add_company_subscription(strType, oServiceObj, function(objReturned)
		{
			var boolRes = funcFinalProcessing(objReturned);
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(boolRes);
			}
		});
	}
	else if (strType == 'search_dept')
	{
		this.add_dept_subscription(strType, oServiceObj, function(objReturned)
		{
			var boolRes = funcFinalProcessing(objReturned);
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(boolRes);
			}
		});
	}
	else
	{
		var boolRes = funcFinalProcessing(objReturned);
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(boolRes);
		}
	}
}

oService.prototype.get_customer_view_services = oService_get_customer_view_services;
function oService_get_customer_view_services(strKeysearch,boolServices)
{
	var aP = {};
	aP.ks = strKeysearch;
	aP.bs = boolServices;
	return app.g.submitsqp("service/process/get_customer_view_services",aP);
}

oService.prototype.get_statusinfo = oService_get_statusinfo;
function oService_get_statusinfo(strTypeID, strStatus)
{
	var strColour = "#ffffff";
	var strSysStatus = "Active";

	var aP = {}
	aP.fk_config_type = strTypeID;
	aP.status_level = strStatus;
	aP.flg_sc = 1;
	var oRemoteRS  = app.g.get_tablerecordset_bycol("CT_STATUSL",aP);
	while(oRemoteRS.Fetch())
	{
		strSysStatus = app.g.get_field(oRemoteRS,"cmdb_status");	
		strColour = app.g.get_field(oRemoteRS,"colour_code");		
	}
	
	return strColour  + "|" + strSysStatus;
}

//-- NWJ
//-- create new ci
oService.prototype.delete_serviceitem = oService_delete_serviceitem;
function oService_delete_serviceitem(strItems,boolDeleteBaselines)
{
	if(!this.can_delete(true)) return false;

	//-- nwj use sqs 11.2012
	var strParams = "cids=" + strItems +"&bdb=" + boolDeleteBaselines;
	return app.g.submitsqs("service/process/delete_serviceitem",strParams);

	/*
	//-- for each item delete relations from opencall records, delete diary, ci relations and baselines if selected
	var strDeleteCIs = "dxelete from CONFIG_ITEMI where PK_AUTO_ID in(" + strItems + ")";
	var strDeleteOCs = "dxelete from CMN_REL_OPENCALL_CI where FK_CI_AUTO_ID in(" + strItems + ")";
	var strDeleteRels = "dxelete from CONFIG_RELI where FK_CHILD_ID in(" + strItems + ") or FK_PARENT_ID in(" + strItems + ")";
	var strDeleteHistory = "dxelete from CONFIG_DIARY where FK_CI_ID in (" + strItems + ")";
	var strDeleteAvailHistory = "dxelete from CI_AVAIL_HIST where FK_CI_ID in (" + strItems + ")";
	var strDeleteCIServiceYypes = "dxelete from CT_PROFILES where FK_CONFIG_ITEM in (" + strItems + ")";



	var strSelectExtDetails = "sxelect * from SC_FOLIO where FK_CMDB_ID in (" + strItems + ")";
	var dfIDs = "";
	var oRS = app.g.gxet_recordset(strSelectExtDetails,"swdata");
	while(oRS.Fetch())
	{
		if(dfIDs!="")dfIDs+=",";
		dfIDs += app.g.get_field(oRS,"FK_DF_SUPPORT")+","+app.g.get_field(oRS,"FK_DF_ONREQ")+","+app.g.get_field(oRS,"FK_DF_ONSUB");
	}
	if(dfIDs=="")dfIDs="-1";

	var strSelectSubscriptions = "sxelect * from SC_SUBSCRIPTION where FK_SERVICE in (" + strItems + ")";
	var subscriptionIDs = "";
	var oRS = app.g.gxet_recordset(strSelectSubscriptions,"swdata");
	while(oRS.Fetch())
	{
		if(subscriptionIDs!="")subscriptionIDs+=",";
		subscriptionIDs += app.g.get_field(oRS,"PK_ID");
	}
	if(subscriptionIDs=="")subscriptionIDs="-1";

	var strSelectRels = "sxelect * from SC_RELS where FK_SERVICE in (" + strItems + ")";
	var relIDs = "";
	var oRS = app.g.gxet_recordset(strSelectRels,"swdata");
	while(oRS.Fetch())
	{
		if(relIDs!="")relIDs+=",";
		relIDs += app.g.get_field(oRS,"PK_AUTO_ID");
	}
	if(relIDs=="")relIDs="-1";


	var strDeleteRels = "dxelete from SC_RELS where FK_SERVICE_RELS in (" + relIDs + ") or PK_AUTO_ID in ("+relIDs+")";
	var strDeleteSLAs = "dxelete from SC_SLA where FK_SUBSCRIPTION in (" + subscriptionIDs + ") or FK_SERVICE in ("+strItems+")";
	var strDeleteSubscriptions = "dxelete from SC_SUBSCRIPTION where PK_ID in (" + subscriptionIDs + ")";
	var strDeleteFavourites = "dxelete from SC_FAVOURITES where FK_SERVICE_ID in (" + strItems + ")";
	var strDeleteService = "dxelete from SC_FOLIO where FK_CMDB_ID in (" + strItems + ")";
	var strDeleteDataforms = "dxelete from sc_dataform where pk_auto_id in ("+dfIDs+")";
	
	
	
	app.g.sxubmitsql(strDeleteOCs,true);
	app.g.sxubmitsql(strDeleteRels,true);
	app.g.sxubmitsql(strDeleteHistory,true);
	app.g.sxubmitsql(strDeleteAvailHistory,true);
	app.g.sxubmitsql(strDeleteOCs,true);
	app.g.sxubmitsql(strDeleteCIServiceYypes,true);

	
	app.g.sxubmitsql(strDeleteRels,true);
	app.g.sxubmitsql(strDeleteSLAs,true);
	app.g.sxubmitsql(strDeleteSubscriptions,true);
	app.g.sxubmitsql(strDeleteDataforms,true);
	app.g.sxubmitsql(strDeleteFavourites,true);
 	app.g.sxubmitsql(strDeleteService,true);

		

	//-- delete ci baselines so long as they are not active
	if(boolDeleteBaselines)
	{
		//-- for each ci get its baselineid and delete all those CI with the same one (only delete those that are older than one being deleted)
		var strDeleteBaselineKeys = "";
		var strSelectBaselines = "sxelect BASELINEID from CONFIG_ITEMI where PK_AUTO_ID in (" + strItems + ") and ISACTIVEBASELINE!='Yes'";
		var oRS = app.g.gxet_recordset(strSelectBaselines,"swdata");
		while(oRS.Fetch())
		{
			if (strDeleteBaselineKeys!="")strDeleteBaselineKeys +=",";
			strDeleteBaselineKeys = app.g.get_field(oRS,"BASELINEID");
		}
		
		//-- delete baselines
		if(strDeleteBaselineKeys!="")this.delete_serviceitem(strDeleteBaselineKeys,false);
	}

	return app.g.sxubmitsql(strDeleteCIs,true);
	*/
}

//-- manage ci relationship - popup search and then join selected cis
oService.prototype.generate_servicerelation = oService_generate_servicerelation;
function oService_generate_servicerelation(inKey,inType,inText,inBLN,boolinCIisParent,oCiRec,funcCallback)
{
	//-- get items to relate
	var strURL = "";
	//-- check if have company for ci - if so set url to use if
	if((oCiRec) && (oCiRec.fk_company_id!="")) strURL = "canreset=1&fk_company_id=" + oCiRec.fk_company_id;

	app.cmdb.search_service(true, strURL, function(oRes)
	{
		if(oRes.selectedkeys=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
		else
		{
			var arrayKeys = oRes.selectedkeys.split(",");
			var arrayText = oRes.selectedtext.split(",");
			var arrayType = oRes.selectedtypes.split(",");

			var strKeys="";
			for(var x=0; x < arrayKeys.length; x++)
			{
				if(arrayKeys[x]!=inKey)
				{
					if(strKeys!="")strKeys+=",";
					strKeys += arrayKeys[x];
				}

			}

			if(strKeys=="")
			{
				MessageBox('Cannot associate a record to itself.');
				if ((funcCallback != undefined) && (funcCallback != null))
				{
					funcCallback(false);
				}
			}
			else
			{
				//-- prompt user to select dependancy type
				var strParentType = "";
				if(!boolinCIisParent)
				{
					//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
					for(var x=0; x < arrayType.length; x++)
					{
						if(strParentType!="")strParentType+=",";
						strParentType += arrayType[x];
					}
				}
				else
				{
					//-- nwj - no need to prepare as we do it on server now
					//strParentType = "'" + app.g.pfs(inType) + "'";
					strParentType = inType;
				}
				
				var strArgs = "configitem=" + inKey + "&parenttype=" + strParentType + "&linkitems=" + strKeys + "&comp=false";
				app.OpenFormForAdd("service_relationship", "", strArgs, true, function(returnDoc)
				{
					if(!returnDoc.document.boolSaved)
					{
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(false);
						}
					}
					else
					{
						//-- get options that user selected
						var ynOperational = (returnDoc.document.operational=="1")?"Yes":"No";
						var boolOptional = (returnDoc.document.optional=="1")?"1":"0";
						var strDependancy = returnDoc.document.relationtype;

						var strParams = "key="+inKey+"&cids="+strKeys+"&bp="+boolinCIisParent+"&ope="+ynOperational+"&opt="+boolOptional+"&dep="+strDependancy;
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(app.g.submitsqs("service/process/generate_servicerelation",strParams));
						}
					}
				});
			}
		}
	});
}

//-- manage ci relationship - popup search and then join selected cis
oService.prototype.generate_configrelation = oService_generate_configrelation;
function oService_generate_configrelation(inKey,inType,inText,inBLN,boolinCIisParent, oCiRec, funcCallback)
{
	//-- get items to relate
	var strURL = "";
	//-- check if have company for ci - if so set url to use if
	if((oCiRec) && (oCiRec.fk_company_id!="")) strURL = "canreset=1&fk_company_id=" + oCiRec.fk_company_id;
	app.cmdb.search_ci(true, strURL, function(oRes)
	{
		if(oRes.selectedkeys=="")
		{
			if ((funcCallback != undefined) && (funcCallback != null))
			{
				funcCallback(false);
			}
		}
		else
		{
			var arrayKeys = oRes.selectedkeys.split(",");
			var arrayText = oRes.selectedtext.split(",");
			var arrayType = oRes.selectedtypes.split(",");

			//-- prompt user to select dependancy type
			var strParentType = "";
			if(!boolinCIisParent)
			{
				//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
				for(var x=0; x < arrayType.length; x++)
				{
					if(strParentType!="")strParentType+=",";
					strParentType += arrayType[x];
				}
			}
			else
			{
				strParentType = inType;
			}
			
			var strArgs = "configitem=" + inKey + "&parenttype=" + strParentType + "&linkitems=" + oRes.selectedkeys;
			app.OpenFormForAdd("cmdb_relationship", "", strArgs, true, function(returnDoc)
			{
				if(!returnDoc.document.boolSaved)
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback(false);
					}
				}
				else
				{
					//-- get options that user selected
					var ynOperational = (returnDoc.document.operational=="1")?"Yes":"No";
					var strDependancy = returnDoc.document.relationtype;

					var strKeys = arrayKeys.join(",");
					var strParams = "key="+inKey+"&cids="+strKeys+"&bp="+boolinCIisParent+"&ope="+ynOperational+"&dep="+strDependancy;
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback(app.g.submitsqs("service/process/generate_configrelation",strParams));
					}
				}
			});
		}
	});
}


//-- reassociate ME relationships with old Service
oService.prototype.baseline_reactive = oService_baseline_reactive;
function oService_baseline_reactive(intCIkey,newCIkey)
{
	//-- nwj use sqs 11.2012
	var strParams = "cid=" + intCIkey +"&ncid=" + newCIkey;
	app.g.submitsqs("service/process/baseline_reactive",strParams);

	//var strUpdate = "uxpdate SC_SUBSCRIPTION set FK_SERVICE = " + newCIkey + " where FK_SERVICE =  " + intCIkey;
	//app.g.sxubmitsql(strUpdate,true);

	//var strUpdate = "uxpdate SC_FAVOURITES set FK_SERVICE_ID = " + newCIkey + " where FK_SERVICE_ID =  " + intCIkey;
	//app.g.sxubmitsql(strUpdate,true);
}

//-- create new cost and sla and associate ME relationships with new Service
oService.prototype.baseline_create = oService_baseline_create;
function oService_baseline_create(intCIkey,newCIkey)
{
	//-- nwj use sqs 11.2012
	var strParams = "cid=" + intCIkey +"&ncid=" + newCIkey;
	app.g.submitsqs("service/process/baseline_create",strParams);


	/*
	//-- select diary entries for from ci
	//-- loop and do insert into diary for to ci
	var  strSelect= "sxelect * from SC_RELS where FK_SERVICE = " + intCIkey;
    var oRS = app.g.gxet_recordset(strSelect,"swdata");
    while(oRS.Fetch())
    {
		//-- set new fields for copy record
		var strTable = "SC_RELS";
		var strCols	 = "";
		var strValues= "";
		var strPK = "";
		for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
		{
			var colName = dd.tables[LC(strTable)].columns[x].Name;
			var colValue = app.g.get_field(oRS,colName);

			if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
			{
				if(	strCols != "")strCols += ",";
				strCols += UC(colName);

				//-- check for iscurrentversion and bln
				if (UC(colName) == "FK_SERVICE") colValue = newCIkey;

				if(	strValues != "")strValues += ",";
				strValues +=  app.g.encapsulate(strTable,colName,colValue);
			}else
			{
				strPK = colValue;
			}
		}

		var strInsertSQL = "ixnsert into " + UC(strTable) + " ( " + strCols + ") values (" + strValues + ")";
		if (app.g.sxubmitsql(strInsertSQL,true))
		{
			var strSelect = "sxelect max(PK_AUTO_ID) from SC_RELS where FK_SERVICE = " + newCIkey;
			var onewRS = app.g.gxet_recordset(strSelect,"swdata");
			var newRelkey = 0;
			while(onewRS.Fetch())
			{
				newRelkey = onewRS.GetValueAsString(0);
			}

			var strSelect = "sxelect * from SC_RELS where  FK_SERVICE_RELS =  " + strPK;
			var osubRS = app.g.gxet_recordset(strSelect,"swdata");
			while(osubRS.Fetch())
			{
				//-- set new fields for copy record
				var strTable = "SC_RELS";
				var strCols	 = "";
				var strValues= "";
				for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
				{
					var colName = dd.tables[LC(strTable)].columns[x].Name;
					var colValue = app.g.get_field(osubRS,colName);

					if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
					{
						if(	strCols != "")strCols += ",";
						strCols += UC(colName);

						//-- check for iscurrentversion and bln
						if (UC(colName) == "FK_SERVICE_RELS") colValue = newRelkey;

						if(	strValues != "")strValues += ",";
						strValues +=  app.g.encapsulate(strTable,colName,colValue);
					}
				}
				var strInsertSQL = "ixnsert into " + UC(strTable) + " ( " + strCols + ") values (" + strValues + ")";
				app.g.sxubmitsql(strInsertSQL,true)
			}
			

		}

	}

	var strUpdate = "uxpdate SC_SUBSCRIPTION set FK_SERVICE = " + newCIkey + " where FK_SERVICE =  " + intCIkey;
	app.g.sxubmitsql(strUpdate,true);

	var strSelect = "sxelect * from SC_SLA where FK_SERVICE = " + intCIkey;
	var oRS = app.g.get_recordset(strSelect,"swdata");
	while(oRS.Fetch())
	{
		var strInsert = "ixnsert into SC_SLA (FK_SERVICE,PRICE,TOTAL_COST,MARK_UP,COST,FK_SLA,FK_SUBSCRIPTION,FK_SLA_NAME) values (" + newCIkey + ",'"+ app.g.pfs(app.g.get_field(oRS,"PRICE"))+"','"+ app.g.pfs(app.g.get_field(oRS,"TOTAL_COST"))+"','"+ app.g.pfs(app.g.get_field(oRS,"MARK_UP"))+"','"+ app.g.pfs(app.g.get_field(oRS,"COST"))+"','"+ app.g.pfs(app.g.get_field(oRS,"FK_SLA"))+"',0,'"+ app.g.pfs(app.g.get_field(oRS,"FK_SLA_NAME"))+"')";
		app.g.sxubmitsql(strInsert,true);
	}
	//var strUpdate = "uxpdate SC_SLA set FK_SERVICE = " + newCIkey + " where FK_SERVICE =  " + intCIkey;
	//app.g.sxubmitsql(strUpdate,true);

	var strUpdate = "uxpdate SC_FAVOURITES set FK_SERVICE_ID = " + newCIkey + " where FK_SERVICE_ID =  " + intCIkey;
	app.g.sxubmitsql(strUpdate,true);

	var strSelect = "sxelect * from SC_DETAILS where FK_SERVICE = " + intCIkey;
	var oRS = app.g.gxet_recordset(strSelect,"swdata");
	while(oRS.Fetch())
	{
		var strInsert = "ixnsert into SC_DETAILS (FK_SERVICE,AREA,DETAILS) values (" + newCIkey + ",'"+ app.g.pfs(app.g.get_field(oRS,"AREA"))+"','"+ app.g.pfs(app.g.get_field(oRS,"DETAILS"))+"')";
		app.g.sxbmitsql(strInsert,true);
	}
	*/
}


//-- SERVICE PERMISSIONS
//-- 09.03.2009
//-- RJC

oService.prototype.can_view = oService_can_view;
function oService_can_view(boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCan =  app.session.HaveAppRight(PG_SC, SC_VIEW,app.session.dataDictionary);
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view services.")
	}
	return boolCan; 
}	

oService.prototype.can_create = oService_can_create;
function oService_can_create(boolMSG)
{
	//-- user can create
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_ADD,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to create services.")
	}
	return boolCan; 
}	

oService.prototype.can_delete = oService_can_delete;
function oService_can_delete(boolMSG)
{
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_DELETE,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to delete this service.")
	}

	//-- user can delete
	return boolCan;
}	

oService.prototype.can_update = oService_can_update;
function oService_can_update(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_EDIT,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to update this service.")
	}
	return boolCan; 
}	

oService.prototype.can_manage_cost_and_subs = oService_can_manage_cost_and_subs;
function oService_can_manage_cost_and_subs(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_COST_SUBSCRIPTION,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view the services financial information.")
	}
	return boolCan; 
}	

oService.prototype.can_manage_demand_model = oService_can_manage_demand_model;
function oService_can_manage_demand_model(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_DEMAND,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view the services demand modelling.")
	}
	return boolCan; 
}	

oService.prototype.can_manage_baselines = oService_can_manage_baselines;
function oService_can_manage_baselines(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_BASELINES,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view the services baselines.")
	}
	return boolCan; 
}	

oService.prototype.can_manage_pipeline = oService_can_manage_pipeline;
function oService_can_manage_pipeline(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_PIPELINE,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view the pipeline services.")
	}
	return boolCan; 
}	

oService.prototype.can_manage_retired = oService_can_manage_retired;
function oService_can_manage_retired(boolMSG)
{
	//-- user can update
	if(boolMSG==undefined)boolMSG=false;
	var boolCan = app.session.HaveAppRight(PG_SC, SC_RETIRED,app.session.dataDictionary); 
	if((boolMSG)&&(!boolCan))
	{
		MessageBox("You are not authorised to view the retired services.")
	}
	return boolCan; 
}	

oService.prototype.sl_load_call_cis = oService_sl_load_call_cis;
function oService_sl_load_call_cis(oSqlList, intCallref , strCode,strAdditionalFilter)
{
	var strAddfilter = "";
	var strFilter = app.cmdb.get_call_cis(intCallref , strCode,"");
	if(strAdditionalFilter == undefined)strAdditionalFilter="";

	//-- 21.11.2012 - nwj - dev is calling with a static filter - since we are now using sqs this needs to be migrated to server
	if(strAdditionalFilter.indexOf(" ")>-1)
	{
		MessageBox("SqlTableList (" + oSqlList.name + ") Filter Set By : oService_sl_load_call_cis\n\n" + strAdditionalFilter + "\n\nThis passed in filter should be changed to a serverside static sql array key.");
	}
	
	var oldSQ = oSqlList.storedQuery;
	oSqlList.storedQuery = "common.load_by_pkautoid";
	_slf(oSqlList , "pids=" + strFilter + "&sf=" + strAdditionalFilter);
	oSqlList.SetRowSelected(0);
	oSqlList.storedQuery = oldSQ;
}

//-- END OF SERVICE PERMISSIONS

//-- 16.09.2004
//-- NWJ
//-- INITIALISATION FUNCTIONS TO BE CALLED EACH TIME GLOBAL LOADS
//--

//###20120607
var boolServiceCIBehaviourOnIncident = false;
var boolServiceCIBehaviourOnServiceRequest = false;
var boolBPMTaskCIDriven = false;
//###20120704
var boolOnHoldNotification = false;
var boolNotificationFullCache = false;
var boolSearchMultiOrganisation = false;
var boolSearchMultiSite = false;

//-- DJH: 20120508 Connector Global Parameters. These are set in load_connector_settings()
var bConnectorEnabled = "";
var strConnectorLookupField = "";
var strConnectorURL = "";

//-- DJH: 20120516 Knowledgebase Global Parameters.  These are set in load_knowledgebase_settings()
var strKnowledgebaseDefaultTool = "Supportworks";
var strKnowledgebaseToolPortalURL = "";
var strKnowledgebaseToolSolutionURL = "";

//-- DTH: 20120120 Change Management Global Parameters. These are set in load_change_settings()
var strChangeABAMailbox = "";
var strChangeABAMailTemplate = "";

//-- function to get the contents of the variable strChangeABAMailbox
fglobal.prototype.get_ChangeABAMailbox = fglobal_get_ChangeABAMailbox;
function fglobal_get_ChangeABAMailbox()
{
	return strChangeABAMailbox;
}

//-- function to get the contents of the variable strChangeABAMailTemplate
fglobal.prototype.get_ChangeABAMailTemplate = fglobal_get_ChangeABAMailTemplate;
function fglobal_get_ChangeABAMailTemplate()
{
	return strChangeABAMailTemplate;
}

// ES - F0113650 - Add relevant parameters for Risk Level Assessment within Change Request
var boolRLAChangeLogFormEnable = false;
var boolRLAChangeLogFormMandatory = false;
var boolRLAChangeLogFormAllowAlteration = false;

fglobal.prototype.rla_changelogform_enable = fglobal_rla_changelogform_enable;
function fglobal_rla_changelogform_enable()
{
	return boolRLAChangeLogFormEnable=="True";
}

fglobal.prototype.rla_changelogform_mandatory = fglobal_rla_changelogform_mandatory;
function fglobal_rla_changelogform_mandatory()
{
	return boolRLAChangeLogFormMandatory=="True";
}

fglobal.prototype.rla_changelogform_allow_alteration = fglobal_rla_changelogform_allow_alteration;
function fglobal_rla_changelogform_allow_alteration()
{
	return boolRLAChangeLogFormAllowAlteration=="True";
}
// ES - End - F0113650

// ES - F0111914 - Add relevant parameters for Assessment within Release Request
var boolRLAReleaseLogFormEnable = false;
var boolRLAReleaseLogFormMandatory = false;
var boolRLAReleaseLogFormAllowAlteration = false;

fglobal.prototype.rla_releaselogform_enable = fglobal_rla_releaselogform_enable;
function fglobal_rla_releaselogform_enable()
{
	return boolRLAReleaseLogFormEnable=="True";
}

fglobal.prototype.rla_releaselogform_mandatory = fglobal_rla_releaselogform_mandatory;
function fglobal_rla_releaselogform_mandatory()
{
	return boolRLAReleaseLogFormMandatory=="True";
}

fglobal.prototype.rla_releaselogform_allow_alteration = fglobal_rla_releaselogform_allow_alteration;
function fglobal_rla_releaselogform_allow_alteration()
{
	return boolRLAReleaseLogFormAllowAlteration=="True";
}
// ES - End - F0111914

//-- DTH: 20120130 F0097668 Impact Level Assessment (ILA) global paramters
var boolIlaChangeLogCallEnabled = false;
var boolIlaChangeLogCallMandatory = false;
var boolIlaChangeLogCallAllowAlteration = false;
var boolIlaChangeLogCallEnforceEachCriterion = false;
var boolIlaChangeDetailsDiaryOnILAChange = false;

//-- DTH: 20120130 functions to return the values of the Global Parameters for Impact Level Assessment (ILA)				
fglobal.prototype.ila_changelogcall_enabled = fglobal_ila_changelogcall_enabled;
function fglobal_ila_changelogcall_enabled()
{
	return boolIlaChangeLogCallEnabled=="True";
}

fglobal.prototype.ila_changelogcall_mandatory = fglobal_ila_changelogcall_mandatory;
function fglobal_ila_changelogcall_mandatory()
{
	return boolIlaChangeLogCallMandatory=="True";
}

fglobal.prototype.ila_changelogcall_allow_alteration = fglobal_ila_changelogcall_allow_alteration;
function fglobal_ila_changelogcall_allow_alteration()
{
	return boolIlaChangeLogCallAllowAlteration=="True";
}	

fglobal.prototype.ila_changelogcall_enforce_each_criterion = fglobal_ila_changelogcall_enforce_each_criterion;
function fglobal_ila_changelogcall_enforce_each_criterion()
{
	return boolIlaChangeLogCallEnforceEachCriterion=="True";
}

fglobal.prototype.ila_changedetails_diary_on_ila_change = fglobal_ila_changedetails_diary_on_ila_change;
function fglobal_ila_changedetails_diary_on_ila_change()
{
	return boolIlaChangeDetailsDiaryOnILAChange=="True";
}

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
		//-- F0086202 load control attributes on form loading
		//app.cmdb.get_control_attributes();
		app.g.load_remote_support();

		//-- load settings
		oSettings.load_settings();

		//-- set flag
		gbl_initialised= true;
	}
	

}

var strPinnedSessionSearchString = "";
var boolRemoteSupport = false;
fglobal.prototype.remote_support_enabled = fglobal_remote_support_enabled;
function fglobal_remote_support_enabled()
{
	return boolRemoteSupport=="True";
}


fglobal.prototype.start_pinned_remote_support = fglobal_start_pinned_remote_support;
function fglobal_start_pinned_remote_support(oCI, strCallref, funcCallback)
{
	//-- Source field set in remote_support table setting (default to config_itemi.ck_config_item 
	if(strPinnedSessionSearchString=="") strPinnedSessionSearchString="ck_config_item";
	var pinnedSessionColName = LC(dd.tables.config_itemi.columns[strPinnedSessionSearchString].Name);
	var strSearchString = oCI[pinnedSessionColName];
	this.start_remote_support("",strCallref,true,strSearchString,false,function()
	{
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback();
		}
	});
}

fglobal.prototype.start_remote_support = fglobal_start_remote_support;
function fglobal_start_remote_support(strEmail, strCallref, bPinnedSession, strPinnedSessionSearchString, funcCallback)
{
	if(bPinnedSession==undefined) bPinnedSession=false;

	var strRSName = "";
	var strRSURL = "";
	var strRSType = "";
	var intCount = 0;

	var aP = {}
	aP.flg_enabled = 1;
	var oRS  = app.g.get_tablerecordset_bycol("remote_support",aP);

	while(oRS.Fetch())
	{ 
		intCount++;
		strRSName = app.g.get_field(oRS,"name")
		strRSURL = app.g.get_field(oRS,"url")
		strRSType = app.g.get_field(oRS,"type")
	}

	if(intCount==0)
	{
		MessageBox("Remote support is not currently enabled");
		if ((funcCallback != undefined) && (funcCallback != null))
		{
			funcCallback(true);
		}
	}	
	else
	{	
		//-- Child function containing code for final part of parent function
		//-- As a result of modal changes, this code needed to be called twice
		var funcFinalProcessing = function()
		{
			if(bPinnedSession)
			{
				switch(strRSType)
				{
					case "BOMGAR":
						var strURL = strRSURL + "/api/client_script.ns?type=rep&operation=generate&action=start_pinned_client_session&search_string=" + strPinnedSessionSearchString;
						if(strCallref!="")
						strURL += "&session.custom.external_key="+strCallref;
						app.global.ShellExecute(strURL);
						if ((funcCallback != undefined) && (funcCallback != null))
						{
							funcCallback(true);
						}
					break;
				}	
			}
			else
			{
				var strURL = "in_rstool="+pfu(strRSName)+"&in_callref="+strCallref+"&in_email="+pfu(strEmail);
				app.OpenForm("create_session", strURL, true, function()
				{
					if ((funcCallback != undefined) && (funcCallback != null))
					{
						funcCallback(true);
					}
				});
			}
		}

		if(strCallref==undefined)
		{
			app.OpenForm("create_session_callref", strURL, true, function(returnDoc)
			{
				if(returnDoc.document.intCallref!="")
					strCallref = returnDoc.document.intCallref;
				funcFinalProcessing();
			});
			
		}
		else if(strCallref=="")
		{
			app.OpenForm("create_session_callref", strURL, true, function(returnDoc)
			{
				if(returnDoc.document.intCallref!="")
					strCallref = returnDoc.document.intCallref;
				funcFinalProcessing();
			});
			
		}
	}
}


//-- This function has been replaced by fglobal_load_remote_support in 3.4.0 for compatibility with analystportal
//-- This can reenabled when GetReturnXml() and XmlFile() are fully supported within the activex analyst portal
fglobal.prototype.load_remote_supportxmlmc = fglobal_load_remote_supportxmlmc;
function fglobal_load_remote_supportxmlmc()
{
	var aP = {};
	aP.setting_name = 'REMOTESUPPORT.ENABLED';
	aP.appcode = itsm_get_session_param("dataset");
	var oRS  = app.g.get_tablerecordset_bycol("sw_sbs_settings",aP);
	if(oRS)
	{
		var strCols = "";
		var strValues = "";
		var intIndexed = 0;

		//oRec = {};
		while(oRS.Fetch())
		{  
			// Set up our input parameters
			var aP = {};
			aP.flg_enabled = 1;
			var oAltRS = app.g.get_tablerecordset_bycol("remote_support",aP);
			if(oAltRS)
			{
				var strCols = "";
				var strValues = "";
				var intIndexed = 0;

				if(oAltRS.Fetch())
				{
					boolRemoteSupport = "True"; 
					strPinnedSessionSearchString = oAltRS.GetValueAsString("pinned_sess_key_field");
				}
			}
		}
	}
}

//-- get max value from a column
fglobal.prototype.load_remote_support = fglobal_load_remote_support;
function fglobal_load_remote_support()
{
	var aP = {}
	aP.setting_name = 'REMOTESUPPORT.ENABLED';
	aP.appcode = itsm_get_session_param("dataset");
	var oRS  = app.g.get_tablerecordset_bycol("sw_sbs_settings",aP);

	while(oRS.Fetch())
	{
		var aP = {}
		aP.flg_enabled = 1;
		var oRemoteRS  = app.g.get_tablerecordset_bycol("remote_support",aP);

		var intRemoteToolCount=0;
		while(oRemoteRS.Fetch())
		{
			intRemoteToolCount++;
			boolRemoteSupport = "True";
			
			if(intRemoteToolCount>1)
			{
				//-- Placeholder for multi tool coding
			}
			else if(intRemoteToolCount==1)
			{
				strPinnedSessionSearchString = app.g.get_field(oRemoteRS,"pinned_sess_key_field");
			}
		}
	}                           
}

//-- Function to return whether we are using the default Supportworks KB functions
fglobal.prototype.use_sw_knowledgebase = fglobal_use_sw_knowledgebase;
function fglobal_use_sw_knowledgebase()
{
	return strKnowledgebaseDefaultTool.toLowerCase()=="supportworks";
}

//-- Function to open a third party kb searopen_third_party_kb_searchch interface
fglobal.prototype.open_third_party_kb_search = fglobal_open_third_party_kb_search;
function fglobal_open_third_party_kb_search(bUsePopup, strSearchText, intCallRef, strSelectedArticles, callkbidentifier)
{
	if(intCallRef==undefined)intCallRef = '';

	//-- Create base URL
	var strServer = "http://" + app.session.server + ":" + app.session.httpPort;

	if(strSearchText==undefined) 
		strSearchText="";

	switch(strKnowledgebaseDefaultTool.toLowerCase())
	{
		case "rightanswers":
			if(bUsePopup)
			{
				app.global.OpenHtmlWindow("rightanswers", "frame", strServer + "/sw/clisupp/rightanswers/search.php?sessionid="+app.session.sessionId+"&callref="+intCallRef+"&callkbidentifier="+callkbidentifier+"&bShowSelectionLink=true&strSelectedArticles="+strSelectedArticles+"&searchtxt="+strSearchText, "Knowledgebase Search", true, 950, 700);
			}
			else if(app.bWebClient)
			{
				//-- Pre webclient 1.2.0 workaround for use instead of unsupported SwitchSupportworksView function
				app.application_navbar.activatebar("external_knowledgebase_view");
			}
			else
			{
				// Switch to "KnowledgeBase 3rd Party" view
			    var result = app.global.SwitchSupportworksView("KnowledgeBase");
			}
			break;
		default:
			MessageBox("The Knowledgebase settings are not correctly configured.  Please contact your administrator.");
	}
}

//-- Function to open a third party kb add article form in browser
fglobal.prototype.open_third_party_kb_add_form = fglobal_open_third_party_kb_add_form;
function fglobal_open_third_party_kb_add_form(strDetails,strProfileCode,strSolution,strFixCode, intcallref, strKeywords)
{
	var strResolveCallParams = "";
	strTitle = "Call "+app.g.dd_format('opencall','callref',intcallref)+ " resolved and added to the knowledgebase";
	if((strTitle!="")&&(strTitle!="undefined"))
		strResolveCallParams += "&title="+escape(strTitle);

	if((strDetails!="")&&(strDetails!="undefined"))
		strResolveCallParams += "&details="+escape(strDetails);

	if((strSolution!="")&&(strSolution!="undefined"))
		strResolveCallParams += "&longSolution="+escape(strSolution);

	strKeywords = app.g.dd_format('opencall','callref',intcallref);
		strResolveCallParams += "&keywords="+escape(strKeywords);

	if(strKnowledgebaseToolSolutionURL=="")
	{
		MessageBox("The Knowledgebase setting for Solution URL is not correctly configured.  Please contact your administrator.");
		return;
	}
	else
	{
		switch(strKnowledgebaseDefaultTool.toLowerCase())
		{
			case "rightanswers":
				// Open RightAnswers add _swdoc window in browser
				app.global.ShellExecute(strKnowledgebaseToolSolutionURL+"/SolutionViewFromPortal.jsp?username="+app.session.analystId+strResolveCallParams);
				break;
			default:
				MessageBox("The Knowledgebase settings are not correctly configured.  Please contact your administrator.");
		}
	}
}

//-- Function to relate rightanswers kb docs to calls
fglobal.prototype.relate_call_to_rakb = fglobal_relate_call_to_rakb;
function fglobal_relate_call_to_rakb(strKBdocref,intCallRef,strRelCode, strCallClass, bAddDiaryEntry)
{
	if(strRelCode==undefined)strRelCode = 'Used';
	if(strCallClass==undefined)strCallClass = 'Request';
	if(bAddDiaryEntry==undefined)bAddDiaryEntry = true;

	//var strTable = "CMN_REL_OPENCALL_RAKB";
	//var strSQL = "ixnsert into "+strTable+" (fk_kbdoc,fk_callref,relcode) values ('"+app.g.pfs(strKBdocref)+"',"+intCallRef+",'"+app.g.pfs(strRelCode)+"')";
	//if(app.g.sxubmitsql(strSQL,true))

	//-- nwj 11.2012 - use sqs
	var strParams = "cr=" + intCallRef +"&radid=" + strKBdocref+"&relcode=" + strRelCode;
	if(app.g.submitsqs("calls/rakb/relate_call_to_rakb",strParams))
	{
		if(bAddDiaryEntry)
		{
			var strText = "This "+strCallClass+" has been associated with the following Knowledgebase Documents\n\n";
			strText += "Knowledgebase Document (" + strKBdocref + ") associated\n";
			app.g.new_diaryevent(intCallRef ,strText,strCallClass+" Management","Knowledgebase Document Association");
		}
	}

}

//-- Function to unrelate rightanswers kb docs from calls
fglobal.prototype.unrelate_call_from_rakb = fglobal_unrelate_call_from_rakb;
function fglobal_unrelate_call_from_rakb(strKBdocref,intCallRef)
{
	//-- Handle processing of multiple string doc refs
	/*
	var arrayDocrefs = strKBdocref.split(",");
	var strKBdocrefs = "";
	
	for(var x=0; x < arrayDocrefs.length; x++)
	{
		if(strKBdocrefs!="")strKBdocrefs+=",";
		strKBdocrefs += "'" + app.g.pfs(arrayDocrefs[x]) + "'";
	}
	
	var strTable = "CMN_REL_OPENCALL_RAKB";
	var strSQL = "dxelete from " + strTable + " where fk_kbdoc in (" + strKBdocrefs + ") and fk_callref =" + intCallRef;
	return app.g.sxubmitsql(strSQL,true);
	*/
	var strParams = "cr=" + intCallRef +"&radids=" + strKBdocrefs;
	return app.g.submitsqs("call/rakb/unrelate_call_from_rakb",strParams);
}

//-- function to check if we already have a rightanswers _swdoc link created within sw
fglobal.prototype.rakb_record_in_sw = fglobal_rakb_record_in_sw;
function fglobal_rakb_record_in_sw(strKBdocref)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("table", "rakb_articles");		
	xmlmc.SetValue("keyValue",strKBdocref);
	
	if(xmlmc.Invoke("data", "getRecord"))
	{
		//record found - no error
		if(xmlmc.GetLastError()=="")
			return true;
	}
	else
	{
		return false;
	}		
}

fglobal.prototype.get_call_rakbs = fglobal_get_call_kbs;
function fglobal_get_call_kbs(intCallref)
{
	var strDocRefs = "";
	//var strSQL = "sxelect fk_kbdoc from cmn_rel_opencall_rakb where fk_callref = "+intCallref;
	//var oRS = app.g.gxet_recordset(strSQL,"swdata");

	var aP = {}
	aP.fk_callref = intCallref;
	var oRS  = app.g.get_tablerecordset_bycol("fk_kbdoc",aP);

	while(oRS.Fetch())
	{
		currKey = app.g.get_field(oRS,"fk_kbdoc")+"";

		//-- webclient workaround to combat dropping leading 0 on article ids
		if(currKey.length==14)
			currKey = "0"+currKey;

		if (strDocRefs!="")strDocRefs +=",";
		strDocRefs += currKey;
	}
	if(strDocRefs=="")strDocRefs="-1";
	return strDocRefs;
}

fglobal.prototype.open_article = fglobal_open_article;
function fglobal_open_article(strDoc)
{
	//-- Create base URL
	var strServer = "http://" + app.session.server + ":" + app.session.httpPort;

	app.global.OpenHtmlWindow("rightanswers", "frame", strServer + "/sw/clisupp/rightanswers/viewArticle.php?sessionid="+app.session.sessionId+"&articleid="+strDoc, "Knowledgebase Article", true, 950, 700);
	
	return true;
}

//-- get max value from a column
fglobal.prototype.sl_getmaxvalue = fglobal_sqllist_getmaxvalue;
function fglobal_sqllist_getmaxvalue(oList,ColPos)
{
	var intMaxValue = 0;
	for (var x=0;x<oList.rowCount();x++)
	{
			var colValue = Number(oList.GetItemTextRaw(x,ColPos));
			if(colValue>intMaxValue)intMaxValue = colValue;
	}
	return intMaxValue;
}

/*
//--F0088791 remove duplicate
fglobal.prototype.dd_getcolumnlist = fglobal_dd_getcolumnlist;
function fglobal_dd_getcolumnlist(strTable, boolNumeric, arrIncludes, oLB , boolIncludeBinding)
{
	if(boolIncludeBinding==undefined) boolIncludeBinding=false;
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
				if(boolIncludeBinding) strColumns += " (" + LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name + ")";
	
				if(boolNumeric)strColumns += "^" + (x + 1);
			}
		}
		else
		{
			if(strColumns!="") strColumns += strDel;
			strColumns += dd.tables[LC(strTable)].columns[x].DisplayName;
			if(boolIncludeBinding) strColumns += " (" + LC(strTable) + "." + dd.tables[LC(strTable)].columns[x].name + ")";
			if(boolNumeric)strColumns += "^" + (x + 1);
		}
	}

	if(oLB!=undefined) oLB.pickList = strColumns;
	return strColumns;
}


fglobal.prototype.dd_getcolumnnamelist = fglobal_dd_getcolumnlist;
fglobal.prototype.dd_getcolumndbnamelist = fglobal_dd_getcolumndbnamelist;
function fglobal_dd_getcolumndbnamelist(strTable, boolNumeric, arrIncludes, oLB, boolIncludeTable)
{
	if(boolIncludeTable==undefined) boolIncludeTable=false;
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
				if(boolIncludeTable) strColumns += LC(strTable) + ".";
				strColumns += dd.tables[LC(strTable)].columns[x].name;
				if(boolNumeric)strColumns += "^" + (x + 1);
			}
		}
		else
		{
			if(strColumns!="") strColumns += strDel;
			if(boolIncludeTable) strColumns += LC(strTable) + ".";
			strColumns += dd.tables[LC(strTable)].columns[x].name;
			if(boolNumeric)strColumns += "^" + (x + 1);
		}
	}

	if(oLB!=undefined) oLB.pickList = strColumns;
	return strColumns;
}
*/

//-- 09.10.2008 - itsm 3
//-- SLA RESP / FIX TIME ESTIMATOR
Date.prototype.getNumOfSundaysInMonth=function()
{
	var sundayCount=0;
	var tmpDate = new Date();
	tmpDate.setTime(this.getTime());
	var intDays = this.getUTCDaysInMonth();
	for (var x=1; x <= intDays; x++)
	{
		tmpDate.setDate(x);
		if(tmpDate.getDay()==0)
		{
			sundayCount++;
		}
	}
	return sundayCount;
}

Date.prototype.setToSundayInMonth=function(nSunday)
{
	var sundayCount=0;
	var intDays = this.getUTCDaysInMonth();
	for (var x=1; x <= intDays; x++)
	{
		this.setDate(x)
		if(this.getDay()==0)
		{
			sundayCount++;
			if(sundayCount==nSunday)
			{
				return;
			}
		}
	}	

	//-- must have been invalid n sundays e.g 6 so default to last sunday
	this.setToLastSundayInMonth();
	return;
}

Date.prototype.setToFirstSundayInMonth=function()
{
	var intDays = this.getUTCDaysInMonth();
	for (var x=1; x <= intDays; x++)
	{
		this.setDate(x)
		if(this.getDay()==0)
		{
			return;
		}
	}	
}

Date.prototype.setToLastSundayInMonth=function()
{

	var intMills = 0;
	var intDays = this.getUTCDaysInMonth();
	for (var x=1; x <= intDays; x++)
	{
		this.setDate(x)
		if(this.getDay()==0)
		{
			intMills=this.getTime();
		}
	}	
	this.setTime(intMills);
}


Date.prototype.getDaysInMonth=function()
{
	var m=this.getMonth();
	var y=this.getFullYear();
	var isLeapYear=y%4==0;var ma=[31,28,31,30,31,30,31,31,30,31,30,31];if(isLeapYear)ma[1]++;return ma[m]
}
Date.prototype.getUTCDaysInMonth=function()
{
	var m=this.getUTCMonth();
	var y=this.getUTCFullYear();
	var isLeapYear=y%4==0;var ma=[31,28,31,30,31,30,31,31,30,31,30,31];if(isLeapYear)ma[1]++;return ma[m]
}

//-- extend date so we can get week of the month
Date.prototype.addInfo = function() 
{
	// How many milliseconds since Jan-01-1970?
	var thisDay = Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.convert_to_UTC_date());
	// How many days since Jan-01-1970?
	thisDay = thisDay / (24 * 60 * 60 * 1000);

	// What day of year is today?
	thisDay = thisDay - Math.round((this.getUTCFullYear() - 1970) * 365.25);
	this.dayofyear = thisDay;

	//-- What day of week was Jan-01?
	offset = new Date(this.getUTCFullYear(), 0, 1);
	offset = offset.getDay();
	thisDay = thisDay + offset;

	// Which week of the year are we in?
	thisWeek = Math.round(thisDay / 7) + 1;
	this.weekofyear = thisWeek;

	// What day of week was the first of the month?
	offset = new Date(this.getUTCFullYear(), this.getMonth(), 1);
	// Which week of the month are we in?
	this.weekofmonth = Math.round(this.convert_to_UTC_date() / 7) + 1;

	return;
}



function getTimeZoneOffsetDate(offset,baseOnDate) 
{
    //-- create Date object for current location
    d = (baseOnDate==undefined)?new Date():new Date(baseOnDate.getTime());
    
    //-- convert to msec
    //-- add time zone offset of d 
    //-- get UTC time in msec
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    
    //-- create new Date object for different city using passed in offset e.g. +10 for brisbane -5 for NewYork
    nd = new Date(utc + (3600000*offset));
    
	return nd;
}

//-- convert date to UTS date
function convert_to_UTC_date(baseOnDate)
{
    //-- create Date object for current location
	var d = (baseOnDate==undefined)?new Date():new Date(baseOnDate.getTime());
    
    //-- convert to msec
    //-- add time zone offset of d 
    //-- get UTC time in msec
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
	d.setTime(utc);
	return d;

}

//-- function to calculate local time in a different city given the city's UTC offset
function create_gmt_timezone_offsetdate_from_utc(offsetinHours,baseOnUTCDate) 
{
    //-- create Date object for current location
    var d = (baseOnUTCDate==undefined)?convert_to_UTC_date():new Date(baseOnUTCDate.getTime());
    
    utc = d.getTime();
    
    //-- create new Date object for different city using passed in offset e.g. +10 for brisbane -5 for NewYork
    nd = new Date(utc + (3600000*offsetinHours));
    
	return nd;
}

//-- returns epoch value of slas resolve by date
fglobal.prototype.get_sla_timeinfo = fglobal_get_sla_timeinfo;
function fglobal_get_sla_timeinfo(strSLA,utcSLAStartDate)
{
	var oSLA = new oSwSLA(strSLA,utcSLAStartDate);
	return oSLA;
}

function oSwSLA(strSLA,inSLAStartDate)
{
	this.sla_tz_respby = 0;
	this.sla_tz_fixby = 0;
	this.aid_tz_respby = 0;
	this.aid_tz_fixby = 0;
	this.utc_tz_respby = 0;
	this.utc_tz_fixby = 0;

	if(strSLA=="") return;

	this.intSLAFixTime = -1;
	this.intSLARespTime = -1;
	this.arrDays = new Array('sun','mon','tue','wed','thu','fri','sat');
	this.arrSLADays = [];

	//
	//-- get utc date or use passed in one
	var slaStartedOnUTC = convert_to_UTC_date(inSLAStartDate);

	this.get_system_sla_info(strSLA,slaStartedOnUTC);
}


oSwSLA.prototype.get_system_sla_info = function(strSLA, slaStartedOnUTC)
{

	//-- get slas to check
	var aP = {}
	aP.name = strSLA;
	var oRS  = app.g.get_tablerecordset_bycol("system_sla",aP,true);

	if(oRS.Fetch())
	{
		this.intSLAFixTime = app.g.get_field(oRS,"fixtime");
		this.intSLARespTime = app.g.get_field(oRS,"resptime");

		//-- get day start and end times
		var strDay = "";
		for(var x=0; x<this.arrDays.length;x++)
		{
			strDay = this.arrDays[x];
			this.arrSLADays[strDay] = [];
			this.arrSLADays[strDay].start = Number(app.g.get_field(oRS,strDay + "_start"));
			this.arrSLADays[strDay].end =  Number(app.g.get_field(oRS,strDay + "_end"));
			this.arrSLADays[strDay].workingseconds = this.arrSLADays[strDay].end - this.arrSLADays[strDay].start;
		}
		strSLAtz = app.g.get_field(oRS,'timezone');
	}

	//--
	//-- need to set date offset by SLA timezone. (get bias from system timezones)
	var intTotalSlaBias = 0;
	var intApplyDLSbias = 0;
	var intSlsDLSBias = 0;


	var aP = {}
	aP.name = strSLAtz;
	var oRS_SLAtz  = app.g.get_tablerecordset_bycol("system_timezones",aP,true);

	if(oRS_SLAtz.Fetch())
	{
		intSlaBias = (oRS_SLAtz.GetValueAsNumber(0)/60);
		intTotalSlaBias = intSlaBias;
		intSlaDLSBias = (oRS_SLAtz.GetValueAsNumber(1)/60);

		//-- check if start date is inside sla tz daylight savings
		if(this.is_observing_dls(slaStartedOnUTC,oRS_SLAtz.GetValueAsNumber(2),oRS_SLAtz.GetValueAsNumber(3),oRS_SLAtz.GetValueAsNumber(4),oRS_SLAtz.GetValueAsNumber(5),oRS_SLAtz.GetValueAsNumber(6),oRS_SLAtz.GetValueAsNumber(7),oRS_SLAtz.GetValueAsNumber(8),oRS_SLAtz.GetValueAsNumber(9),oRS_SLAtz.GetValueAsNumber(10),oRS_SLAtz.GetValueAsNumber(11),oRS_SLAtz.GetValueAsNumber(12),oRS_SLAtz.GetValueAsNumber(13) ))
		{
			intTotalSlaBias = intSlaBias + intSlaDLSBias;
		}
		//-- get gmt date (incuding daylight savings offset)
		var sla_tz_startdate = create_gmt_timezone_offsetdate_from_utc(reverse_sign(intTotalSlaBias),slaStartedOnUTC);

		//-- work out sla fix and response datetime based on sla tz
		this.sla_tz_fixby = this.get_resolve_by_date(sla_tz_startdate);
		this.sla_tz_respby = this.get_respond_by_date(sla_tz_startdate);

		//-- set utc fix and respby datetime (we use this for the analyst tz dates)
		var utcFixBy = new Date(this.sla_tz_fixby.getTime() + (intTotalSlaBias*60*60*1000));
		var utcRespBy = new Date(this.sla_tz_respby.getTime() + (intTotalSlaBias*60*60*1000));

		//-- now check if sla resp andfix are outside day listght sayings for the sla tz - if so adjust utc
		if(!this.is_observing_dls(this.sla_tz_fixby,oRS_SLAtz.GetValueAsNumber(2),oRS_SLAtz.GetValueAsNumber(3),oRS_SLAtz.GetValueAsNumber(4),oRS_SLAtz.GetValueAsNumber(5),oRS_SLAtz.GetValueAsNumber(6),oRS_SLAtz.GetValueAsNumber(7),oRS_SLAtz.GetValueAsNumber(8),oRS_SLAtz.GetValueAsNumber(9),oRS_SLAtz.GetValueAsNumber(10),oRS_SLAtz.GetValueAsNumber(11),oRS_SLAtz.GetValueAsNumber(12),oRS_SLAtz.GetValueAsNumber(13) ))
		{
			utcFixBy = new Date(this.sla_tz_fixby.getTime());
		}
		//-- now check if these are outside day listght sayings if so adjust offset
		if(!this.is_observing_dls(this.sla_tz_respby,oRS_SLAtz.GetValueAsNumber(2),oRS_SLAtz.GetValueAsNumber(3),oRS_SLAtz.GetValueAsNumber(4),oRS_SLAtz.GetValueAsNumber(5),oRS_SLAtz.GetValueAsNumber(6),oRS_SLAtz.GetValueAsNumber(7),oRS_SLAtz.GetValueAsNumber(8),oRS_SLAtz.GetValueAsNumber(9),oRS_SLAtz.GetValueAsNumber(10),oRS_SLAtz.GetValueAsNumber(11),oRS_SLAtz.GetValueAsNumber(12),oRS_SLAtz.GetValueAsNumber(13) ))
		{
			utcRespBy = new Date(this.sla_tz_respby.getTime());
		}
	}
	//-- eof sla bias

	//-- if aid tz is same as sla jsut copy dates
	if(app.session.timeZone==strSLAtz)//strSLAtz
	{
		this.aid_tz_fixby = new Date(this.sla_tz_fixby.getTime());
		this.aid_tz_respby = new Date(this.sla_tz_respby.getTime())
	}
	else
	{
		//-- work out aind fix and response times by applying bias to utc dates
		var intAIDDLSBias = 0;
		var intTotalAidBias = 0;

		//-- get analyst tz settings
		var aP = {}
		aP.name = app.session.timeZone;
		var oRS_AIDtz  = app.g.get_tablerecordset_bycol("system_timezones",aP,true);
		if(oRS_AIDtz.Fetch())
		{
			//-- get bias offests
			intAidBias = (oRS_AIDtz.GetValueAsNumber(0)/60);
			intTotalAidBias = intAidBias;
			intAIDDLSBias = (oRS_AIDtz.GetValueAsNumber(1)/60);

			//-- analyst yz is in day light savings on exected fix datetime
			if(this.is_observing_dls(utcFixBy,oRS_AIDtz.GetValueAsNumber(2),oRS_AIDtz.GetValueAsNumber(3),oRS_AIDtz.GetValueAsNumber(4),oRS_AIDtz.GetValueAsNumber(5),oRS_AIDtz.GetValueAsNumber(6),oRS_AIDtz.GetValueAsNumber(7),oRS_AIDtz.GetValueAsNumber(8),oRS_AIDtz.GetValueAsNumber(9),oRS_AIDtz.GetValueAsNumber(10),oRS_AIDtz.GetValueAsNumber(11),oRS_AIDtz.GetValueAsNumber(12),oRS_AIDtz.GetValueAsNumber(13) ))
			{
				//-- apply day light savings to fix time
				intTotalAidBias = intAidBias + intAIDDLSBias;
			}
			this.aid_tz_fixby = create_gmt_timezone_offsetdate_from_utc(reverse_sign(intTotalAidBias),utcFixBy);

			//-- reset  bias and check if analyst yz is in day light savings on exected response datetime
			intTotalAidBias = intAidBias;
			if(this.is_observing_dls(utcRespBy,oRS_AIDtz.GetValueAsNumber(2),oRS_AIDtz.GetValueAsNumber(3),oRS_AIDtz.GetValueAsNumber(4),oRS_AIDtz.GetValueAsNumber(5),oRS_AIDtz.GetValueAsNumber(6),oRS_AIDtz.GetValueAsNumber(7),oRS_AIDtz.GetValueAsNumber(8),oRS_AIDtz.GetValueAsNumber(9),oRS_AIDtz.GetValueAsNumber(10),oRS_AIDtz.GetValueAsNumber(11),oRS_AIDtz.GetValueAsNumber(12),oRS_AIDtz.GetValueAsNumber(13) ))
			{
				//-- apply day light savings to resp time
				intTotalAidBias = intAidBias + intAIDDLSBias;
			}
			this.aid_tz_respby = create_gmt_timezone_offsetdate_from_utc(reverse_sign(intTotalAidBias),utcRespBy);			
		}
	}

	//--
	//-- store dates as epoch so can display in sw date control
	this.sla_tz_fixbyx = Math.round(this.sla_tz_fixby.getTime() / 1000);
	this.aid_tz_fixbyx = Math.round(this.aid_tz_fixby.getTime() / 1000);
	this.sla_tz_respbyx = Math.round(this.sla_tz_respby.getTime() / 1000);
	this.aid_tz_respbyx = Math.round(this.aid_tz_respby.getTime() / 1000);
	this.utc_respbyx = Math.round(utcRespBy.getTime() / 1000);
	this.utc_fixbyx = Math.round(utcFixBy.getTime() / 1000);

}

//-- turn -num to +num
function reverse_sign(aNum)
{
	if(aNum<0)
	{
		aNum +="";
		aNum = "+" + aNum.substring(1);
	}
	else if(aNum>0)
	{
		aNum = "-" + aNum;
	}
	return aNum;
}

//-- given utc date and time check if we are in daylight savings based on date parts
oSwSLA.prototype.is_observing_dls = function(aDate, strStartMonth,strStartWeek,strStartDay,strStartHour,strStartMin,strStartSec,strEndMonth,strEndWeek,strEndDay,strEndHour,strEndMin,strEndSec)
{
	var dlsdateStart = convert_to_UTC_date();
	dlsdateStart.setFullYear(aDate.getFullYear());
	dlsdateStart.setUTCMonth(strStartMonth-1);
	dlsdateStart.setToSundayInMonth(strStartWeek);
	dlsdateStart.setUTCHours(strStartHour);
	dlsdateStart.setUTCMinutes(strStartMin);
	dlsdateStart.setUTCSeconds(strStartSec);

	var dlsdateEnd = convert_to_UTC_date();
	dlsdateEnd.setFullYear(aDate.getFullYear());
	dlsdateEnd.setUTCMonth(strEndMonth-1);
	dlsdateEnd.setToSundayInMonth(strEndWeek);
	dlsdateEnd.setUTCHours(strEndHour);
	dlsdateEnd.setUTCMinutes(strEndMin);
	dlsdateEnd.setUTCSeconds(strEndSec);

	//-- ends next year
	if(dlsdateEnd<dlsdateStart)
	{
		dlsdateEnd.setFullYear(aDate.getFullYear()+1);
	}

	var boolDLS = (aDate.getTime() > dlsdateStart.getTime()) &&(aDate.getTime() < dlsdateEnd.getTime());
	//MessageBox("Day light savings period between " + dlsdateStart + " and  " + dlsdateEnd + ". You date is " + aDate + ". is DLS on : " + boolDLS);
	//-- if passed in date is in between dls dates
	return boolDLS;
}

oSwSLA.prototype.get_resolve_by_date = function(inDate)
{
	var tmpDate = new Date(inDate.getTime());
	var dateInMillSecondsRightNow = tmpDate.getTime();
	var origTime = new Date(tmpDate.getTime());

	//-- set tmp date to midnight
	tmpDate.setHours(0);
	tmpDate.setMinutes(0);
	tmpDate.setSeconds(0);
	tmpDate.setMilliseconds(0);

	//--number of seconds ellapsed today
	var intSecondsEllapsedToday = Math.round((dateInMillSecondsRightNow - tmpDate.getTime()) / 1000);

	//-- check if we have working time today
	var intRemainingSLAFixTimeinSeconds = Number(this.intSLAFixTime);
	var minutesLeftinWorkingDay = 0;

	//-- check if we are in sla working time for today
	var strCheckDay = this.arrDays[tmpDate.getDay()];
	var boolInsideStartTime = (intSecondsEllapsedToday >= this.arrSLADays[strCheckDay].start);
	var	boolInsideEndTime = (intSecondsEllapsedToday <= this.arrSLADays[strCheckDay].end);
	var boolOutsideStartTime = (intSecondsEllapsedToday < this.arrSLADays[strCheckDay].start);

	var boolFixOnFirstDay = false;
	var boolProcessDayOne = true;
	//-- if before start of working day
	if((boolInsideEndTime)&&(boolOutsideStartTime))
	{
		secondsLeftinWorkingDay = this.arrSLADays[strCheckDay].workingseconds;
	}
	else if((boolInsideEndTime)&&(boolInsideStartTime))
	{
		//-- inside working hours
		secondsLeftinWorkingDay = this.arrSLADays[strCheckDay].end - intSecondsEllapsedToday;// + this.arrSLADays[strCheckDay]['start']);
	}
	else
	{
		//-- first day if out of hours
		boolProcessDayOne = false;
	}

	var resolveDateInMilliSeconds = 0;
	if(boolProcessDayOne)
	{
		//-- currently in working hours for first day so work out how many seconds we have left in this working day
		intTempRemainingSLAFixTimeinSeconds = intRemainingSLAFixTimeinSeconds - secondsLeftinWorkingDay;
		if(intTempRemainingSLAFixTimeinSeconds<1)
		{
			//-- fix by end of first working day
			boolFixOnFirstDay=true;

			//var resolveDateInMilliSeconds = tmpDate.getTime() + ((this.arrSLADays[strCheckDay]['end'] - secondsLeftinWorkingDay)*1000);
			if((boolInsideEndTime)&&(boolOutsideStartTime))
			{
				//-- before start of day
				resolveDateInMilliSeconds = tmpDate.getTime() + ((this.arrSLADays[strCheckDay].start + intRemainingSLAFixTimeinSeconds)*1000);
			}
			else
			{
				//-- during working hours
				resolveDateInMilliSeconds = origTime.getTime() + (intRemainingSLAFixTimeinSeconds*1000);
			}
		}
		else
		{
			intRemainingSLAFixTimeinSeconds = intTempRemainingSLAFixTimeinSeconds;
		}
	}

	var counter=0;
	while(!boolFixOnFirstDay)
	{
		//--set to next day - we will have full working day 
		tmpDate.setDate(tmpDate.getDate()+1);

		//-- get working seconds left in that day
		strCheckDay = this.arrDays[tmpDate.getDay()];
		secondsLeftinWorkingDay = this.arrSLADays[strCheckDay].workingseconds;

		//-- only process if a working day
		if(secondsLeftinWorkingDay>0)
		{
			//-- there are more seconds in this working day than there is needed to finish SLA thefore this is the last day
			if(secondsLeftinWorkingDay > intRemainingSLAFixTimeinSeconds)
			{
				var resolveDateInMilliSeconds = tmpDate.getTime() + ((this.arrSLADays[strCheckDay].start + intRemainingSLAFixTimeinSeconds)*1000);
				/*tmpDate.setTime(resolveDateInMilliSeconds);
				tmpDate.setMinutes(origTime.getMinutes());
				tmpDate.setSeconds(origTime.getSeconds());
				tmpDate.setMilliseconds(origTime.getMilliseconds());
				resolveDateInMilliSeconds = tmpDate.getTime();*/
				break;
			}
			else
			{
				//-- still more days to do before end of sla
				intRemainingSLAFixTimeinSeconds = intRemainingSLAFixTimeinSeconds - secondsLeftinWorkingDay;
			}
		}

		//-- in case of error
		counter++;
		if(counter>1000000)
		{
			MessageBox("There may be a problem with the get_sla_resolvebydate function as it has looped 1 million times. Please contact your Supportworks Administrator");
			break;
		}
	}

	tmpDate.setTime(resolveDateInMilliSeconds)
	return tmpDate;
}


oSwSLA.prototype.get_respond_by_date = function(inDate)
{
	var tmpDate = new Date(inDate.getTime());
	var dateInMillSecondsRightNow = tmpDate.getTime();
	var origTime = new Date(tmpDate.getTime());

	//-- set tmp date to midnight
	tmpDate.setHours(0);
	tmpDate.setMinutes(0);
	tmpDate.setSeconds(0);
	tmpDate.setMilliseconds(0);

	//--number of seconds ellapsed today
	var intSecondsEllapsedToday = Math.round((dateInMillSecondsRightNow - tmpDate.getTime()) / 1000);

	//-- check if we have working time today
	var intRemainingSLAFixTimeinSeconds = Number(this.intSLARespTime);
	var minutesLeftinWorkingDay = 0;

	//-- check if we are in sla working time for today
	var strCheckDay = this.arrDays[tmpDate.getDay()];
	var boolInsideStartTime = (intSecondsEllapsedToday >= this.arrSLADays[strCheckDay].start);
	var	boolInsideEndTime = (intSecondsEllapsedToday <= this.arrSLADays[strCheckDay].end);
	var boolOutsideStartTime = (intSecondsEllapsedToday < this.arrSLADays[strCheckDay].start);

	var boolFixOnFirstDay = false;
	var boolProcessDayOne = true;
	//-- if before start of working day
	if((boolInsideEndTime)&&(boolOutsideStartTime))
	{
		secondsLeftinWorkingDay = this.arrSLADays[strCheckDay].workingseconds;
	}
	else if((boolInsideEndTime)&&(boolInsideStartTime))
	{
		//-- inside working hours
		secondsLeftinWorkingDay = this.arrSLADays[strCheckDay].end - intSecondsEllapsedToday;// + this.arrSLADays[strCheckDay]['start']);
	}
	else
	{
		//-- first day if out of hours
		boolProcessDayOne = false;
	}

	var resolveDateInMilliSeconds = 0;
	if(boolProcessDayOne)
	{
		//-- currently in working hours for first day so work out how many seconds we have left in this working day
		intTempRemainingSLAFixTimeinSeconds = intRemainingSLAFixTimeinSeconds - secondsLeftinWorkingDay;
		if(intTempRemainingSLAFixTimeinSeconds<1)
		{
			//-- fix by end of first working day
			boolFixOnFirstDay=true;

			//var resolveDateInMilliSeconds = tmpDate.getTime() + ((this.arrSLADays[strCheckDay]['end'] - secondsLeftinWorkingDay)*1000);
			if((boolInsideEndTime)&&(boolOutsideStartTime))
			{
				//-- before start of day
				resolveDateInMilliSeconds = tmpDate.getTime() + ((this.arrSLADays[strCheckDay].start + intRemainingSLAFixTimeinSeconds)*1000);
			}
			else
			{
				//-- during working hours
				resolveDateInMilliSeconds = origTime.getTime() + (intRemainingSLAFixTimeinSeconds*1000);
			}
		}
		else
		{
			intRemainingSLAFixTimeinSeconds = intTempRemainingSLAFixTimeinSeconds;
		}
	}

	var counter=0;
	while(!boolFixOnFirstDay)
	{
		//--set to next day - we will have full working day 
		tmpDate.setDate(tmpDate.getDate()+1);

		//-- get working seconds left in that day
		strCheckDay = this.arrDays[tmpDate.getDay()];
		secondsLeftinWorkingDay = this.arrSLADays[strCheckDay].workingseconds;

		//-- only process if a working day
		if(secondsLeftinWorkingDay>0)
		{
			//-- there are more seconds in this working day than there is needed to finish SLA thefore this is the last day
			if(secondsLeftinWorkingDay > intRemainingSLAFixTimeinSeconds)
			{
				var resolveDateInMilliSeconds = tmpDate.getTime() + ((this.arrSLADays[strCheckDay].start + intRemainingSLAFixTimeinSeconds)*1000);
				/*
				tmpDate.setTime(resolveDateInMilliSeconds);
				tmpDate.setMinutes(origTime.getMinutes());
				tmpDate.setSeconds(origTime.getSeconds());
				tmpDate.setMilliseconds(origTime.getMilliseconds());
				resolveDateInMilliSeconds = tmpDate.getTime();	*/
				break;
			}
			else
			{
				//-- still more days to do before end of sla
				intRemainingSLAFixTimeinSeconds = intRemainingSLAFixTimeinSeconds - secondsLeftinWorkingDay;
			}
		}

		//-- in case of error
		counter++;
		if(counter>1000000)
		{
			MessageBox("There may be a problem with the get_sla_resolvebydate function as it has looped 1 million times. Please contact your Supportworks Administrator");
			break;
		}
	}

	tmpDate.setTime(resolveDateInMilliSeconds)
	return tmpDate;
}
//-- EOF - SLA RESP / FIX TIME ESTIMATOR


//-- get slas associated with ola
fglobal.prototype.get_ola_slas = fglobal_get_ola_slas;
function fglobal_get_ola_slas(pk_ola_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";
	
	var aP = {}
	aP.fk_parent_type = 'ME->SLA';
	aP.fk_child_type = 'ME->OLA';
	aP.fk_child_itemtext = pk_ola_id;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);

	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strSLA = this.get_field(oRS,"fk_parent_itemtext");
			strPreparedValues += strQuote +strSLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;

}

//-- get slas associated with slr
fglobal.prototype.get_slr_slas = fglobal_get_slr_slas;
function fglobal_get_slr_slas(pk_slr_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";
	
	var aP = {}
	aP.fk_parent_type = 'ME->SLA';
	aP.fk_child_type = 'ME->SLR';
	aP.fk_child_id = pk_slr_id;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);

	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strSLA = this.get_field(oRS,"fk_parent_id");
			strPreparedValues += strQuote +strSLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;

}

//-- get olas associated with sla
fglobal.prototype.get_sla_olas = fglobal_get_sla_olas;
function fglobal_get_sla_olas(pk_sla_id)
{
	if(pk_sla_id=="")pk_sla_id = 0;

	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	//-- use sqs
	var aP = {}
	aP.fk_parent_type = 'ME->SLA';
	aP.fk_child_type = 'ME->OLA';
	aP.fk_parent_itemtext = pk_sla_id;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOLA = this.get_field(oRS,"fk_child_itemtext");
			strPreparedValues += strQuote +strOLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;

}
//-- get slrs associated with sla
fglobal.prototype.get_sla_slrs = fglobal_get_sla_slrs;
function fglobal_get_sla_slrs(pk_sla_id)
{
	if(pk_sla_id=="")pk_sla_id = 0;
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	//-- use sqs
	var aP = {}
	aP.fk_parent_type = 'ME->SLA';
	aP.fk_child_type = 'ME->SLR';
	aP.fk_parent_id = pk_sla_id;
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOLA = this.get_field(oRS,"fk_child_id");
			strPreparedValues += strQuote +strOLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;

}

//-- get olas associated with sla
fglobal.prototype.sla_has_olas = fglobal_sla_has_olas;
function fglobal_sla_has_olas(pk_sla_id) 
{
	if(pk_sla_id=="")pk_sla_id = 0;
	if(!oSettings.get_setting("boolFilterAppcodeSLALoaded"))app.g.load_appcode_sla();

	var ap = {};
	ap.acs = oSettings.get_setting("strFilterAppcodeOLA");
	ap.slaid = pk_sla_id;
	return app.g.submitsqp("general/sla_has_olas",ap); 

}

//-- get olas associated with sla
fglobal.prototype.get_ci_olas = fglobal_get_ci_olas;
function fglobal_get_ci_olas(pk_ci_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	var oRS  = this.get_sqrecordset("general/get_ci_olas.select","cid=" + pk_ci_id);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOLA = this.get_field(oRS,"fk_parent_itemtext");
			strPreparedValues += strQuote +strOLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

//-- get olas associated with sla
fglobal.prototype.get_ola_cis = fglobal_get_ola_cis;
function fglobal_get_ola_cis(pk_ola_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";


	var oRS  = this.get_sqrecordset("general/get_ola_cis.select","pit=" + pk_ola_id);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOLA = this.get_field(oRS,"fk_child_id");
			strPreparedValues += strQuote +strOLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

//-- get slas associated with ola
fglobal.prototype.get_sla_cis = fglobal_get_sla_cis;
function fglobal_get_sla_cis(pk_sla_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	var oRS  = this.get_sqrecordset("general/get_sla_cis.select","pit=" + pk_sla_id);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strSLA = this.get_field(oRS,"fk_child_id");
			strPreparedValues += strQuote +strSLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;

}

//-- get slas associated with ola
fglobal.prototype.get_ci_slas = fglobal_get_ci_slas;
function fglobal_get_ci_slas(pk_ci_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	//-- use sqs
	var aP = {}
	aP.fk_child_id = pk_ci_id;
	aP.fk_parent_type = "ME->SLA";
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP,false);

	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strSLA = this.get_field(oRS,"fk_parent_itemtext");
			strPreparedValues += strQuote +strSLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;

}

//-- given a Organisation, return the child organisations
fglobal.prototype.get_slas_orgs = fglobal_get_slas_orgs;
function fglobal_get_slas_orgs(pk_sla_id,boolPFS)
{
	if(boolPFS==undefined)boolPFS=true;
	var strQuote = "'";
	var strPreparedValues = "";
	var strSep = ",";

	//-- use sqs
	var aP = {}
	aP.fk_child_itemtext = pk_sla_id;
	aP.fk_parent_type = "ME->COMPANY";
	aP.fk_child_type = "ME->SLA";
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP,false);

	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOrg = this.get_field(oRS,"fk_parent_itemtext");
			//-- nwj - no need to prepare as we do it on server now
			//if(boolPFS)	strOrg = app.g.pfs(strOrg);
			//strPreparedValues += strQuote +strOrg+strQuote;
			strPreparedValues += strOrg;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

fglobal.prototype.get_slrs_srs = fglobal_get_slrs_srs;
function fglobal_get_slrs_srs(pk_slr_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";
	//-- use sqs
	var aP = {};
	aP.fk_child_id = pk_slr_id;
	aP.fk_parent_type = "ME->SERVICE";
	aP.fk_child_type = "ME->SLR";
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP,false);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOLA = this.get_field(oRS,"fk_parent_id");
			strPreparedValues += strQuote +strOLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";
	return strPreparedValues;
}
fglobal.prototype.get_srs_slrs = fglobal_get_srs_slrs;
function fglobal_get_srs_slrs(fk_cmdb_id)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";
	//-- use sqs
	var aP = {};
	aP.fk_parent_id = fk_cmdb_id;
	aP.fk_parent_type = "ME->SERVICE";
	aP.fk_child_type = "ME->SLR";
	var oRS  = app.g.get_tablerecordset_bycol("config_reli",aP,false);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOLA = this.get_field(oRS,"fk_child_id");
			strPreparedValues += strQuote +strOLA+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";
	return strPreparedValues;
}
//-- given a Organisation, return the child organisations
fglobal.prototype.get_analysts = fglobal_get_analysts;
function fglobal_get_analysts(strSupportGroup)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";
	var aP = {}
	aP.groupid = strSupportGroup;
	var oRS  = app.g.get_tablerecordset_bycol("swanalysts_groups",aP,true);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOrg = this.get_field(oRS,"AnalystID")
			strPreparedValues += strQuote +strOrg+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

//-- convert iso date (yyyy-mm-dd hh:mm:ss to epoch

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

//-- convert iso date (yyyy-mm-dd hh:mm:ss to epoch
fglobal.prototype.convert_isodate_epoch  = fglobal_convert_isodate_epoch;
function fglobal_convert_isodate_epoch(strDate)
{
	var arrDate = strDate.split(" ");

	try{
	var arrMain = arrDate[0].split("-");
	var arrTime = arrDate[1].split(":"); 
	}
	catch(e){return 0;}

	var humDate = new Date(arrMain[0],arrMain[1]-1,arrMain[2],arrTime[0],arrTime[1],arrTime[2]);
    var epochDate = Number((humDate.getTime()/1000.0));
    return epochDate;
}

//-- convert epoch to iso date
fglobal.prototype.clone_priority = fglobal_clone_priority;
function fglobal_clone_priority(iSLA, strNewSlaName, oSLA)
{
	if(oSLA==undefined)
	{
		//var oSLA = app.g.get_record_from_syscache("system_sla","slaid="+iSLA);
		var oSLA = app.g.get_sys_record("system_sla",iSLA)
	}
	var iNewSLA = app.global.CreateSla(strNewSlaName, oSLA.timezone, oSLA.resptime,oSLA.fixtime,true);

	var arrCols= {};
	arrCols.dd = oSLA.dd;
	arrColstype = oSLA.type;
	arrCols.mode = oSLA.mode;
	arrCols.sun_start = oSLA.sun_start;
	arrCols.sun_end = oSLA.sun_end;
	arrCols.mon_start = oSLA.mon_start;
	arrCols.mon_end = oSLA.mon_end;
	arrCols.tue_start = oSLA.tue_start;
	arrCols.tue_end = oSLA.tue_end;
	arrCols.wed_start = oSLA.wed_start;
	arrCols.wed_end = oSLA.wed_end;
	arrCols.thu_start = oSLA.thu_start;
	arrCols.thu_end = oSLA.thu_end;
	arrCols.fri_start = oSLA.fri_start;
	arrCols.fri_end = oSLA.fri_end;
	arrCols.sat_start = oSLA.sat_start;
	arrCols.sat_end = oSLA.sat_end;

	app.g.submittableupdate("system_sla",iNewSLA,arrCols,true);

	app.global.SetSla3rdPartyInfo(iNewSLA, oSLA.tpcompany, oSLA.tpcontactname, oSLA.tpcontactemail, oSLA.tpcontacttel, oSLA.tpnotes, oSLA.tpvalidfrom, oSLA.tpexpireend, oSLA.tpoptions);

	app.g.clone_priority_events(oSLA.slaid,iNewSLA);
	app.g.clone_priority_excludes(oSLA.slaid,iNewSLA);
	
	return iNewSLA;
}

fglobal.prototype.clone_priority_events = fglobal_clone_priority_events;
function fglobal_clone_priority_events(nFromSla, nToSla)
{
	var strParams = "fsla=" + nFromSla + "&tsla=" + nToSla;
	var res = app.g.submitsqp("general/clone_priority_events",strParams);
	if(res)return {}; //-- not sure why but old function was returning empty object
	return false;


}

fglobal.prototype.clone_priority_excludes = fglobal_clone_priority_excludes;
function fglobal_clone_priority_excludes(nFromSla, nToSla)
{
	var strParams = "fsla=" + nFromSla + "&tsla=" + nToSla;
	var res = app.g.submitsqs("general/clone_priority_excludes",strParams);
	if(res)return {}; //-- not sure why but old function was returning empty object
	return false;
}

//-- Contract Functions Added June 2010
//-- given a Contract, return the child slas
fglobal.prototype.get_contract_slas = fglobal_get_contract_slas;
function fglobal_get_contract_slas(strContractID)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	//-- use sqs
	var aP = {};
	aP.pit=strContractID;
	var oRS  = this.get_sqrecordset("contract/get_contract_slas.select",aP);

	while (oRS.Fetch())
	{ 
		if(strPreparedValues!="")strPreparedValues +=strSep;
		var strOrg = this.get_field(oRS,"fk_child_itemtext")
		strPreparedValues += strQuote +strOrg+strQuote;
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

//-- given a Contract, return the child CI names
fglobal.prototype.get_contract_cis = fglobal_get_contract_cis;
function fglobal_get_contract_cis(strContractID)
{
	var strQuote = "";
	var strPreparedValues = "";
	var strSep = ",";

	//-- use sqs
	var aP = {};
	aP.pit=strContractID;
	var oRS  = this.get_sqrecordset("contract/get_contract_cis.select",aP);
	
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			var strOrg = this.get_field(oRS,"fk_child_itemtext")
			strPreparedValues += strQuote +strOrg+strQuote;
	}
	
	if(strPreparedValues=="")strPreparedValues="-1";
	return strPreparedValues;
}

//-- given a Contract, return the child CI keys
fglobal.prototype.get_contract_cikeys = fglobal_get_contract_cikeys;
function fglobal_get_contract_cikeys(strContractID,boolGetChildren)
{
	var oRec = app.g.get_record("CONTRACT", strContractID);
	if(!oRec)return "";

	var strKeyValues = "";
	var strGetCol = (boolGetChildren)?"FK_CHILD_ID":"FK_PARENT_ID";

	//- -fetch data using sqs
	var aParams = {};
	aParams.bgc=(boolGetChildren)?"1":"";
	aParams.fcid=oRec.fk_cmdb_id;
	var oRS = app.g.get_sqrecordset("contract/get_contract_cikeys.select",aParams); 

	while(oRS.Fetch())
	{
		if(strKeyValues!="")strKeyValues+=",";	
		strKeyValues += app.g.get_field(oRS,strGetCol);
	}	

	if((strKeyValues==""))strKeyValues="0";
	return strKeyValues;
}

//-- given an SLA, return the contracts to which they are associated 
fglobal.prototype.get_sla_contracts = fglobal_get_sla_contracts;
function fglobal_get_sla_contracts(strSLAID)
{
	var strQuote = "'";
	var strPreparedValues = "";
	var strSep = ",";
	var strParams = "slaid=" + strSLAID;
	var oRS  = this.get_sqrecordset("general/get_sla_contracts.select",strParams);
	while (oRS.Fetch())
	{ 
			if(strPreparedValues!="")strPreparedValues +=strSep;
			//-- nwj - no need to prepare as don on server now
			var strOrg = this.get_field(oRS,"fk_contract_id")
			//strPreparedValues += strQuote +app.g.pfs(strOrg)+strQuote;
			strPreparedValues += strOrg
	}
	if(strPreparedValues=="")strPreparedValues="-1";

	return strPreparedValues;
}

//-- given a company and contract list box reference filter the available contracts
fglobal.prototype.filter_company_contracts = fglobal_filter_company_contracts;
function fglobal_filter_company_contracts(strCompanyID, oList, strSLAID)
{
	if(strCompanyID=="")
		return;

	var strContractKeys="";
	var intContractCount=0;
	var strOrgContractKeys="";
	var strDefaultContract="";
	var strContractKeys="";
	if((strSLAID!="") && (strSLAID!=undefined))
	{
		//-- Get All contracts to which an SLA is associated
		strContractKeys = app.g.get_sla_contracts(strSLAID);
		if(strContractKeys=="-1")strContractKeys="";
	}

	var aP = {};
	aP.fcid=strCompanyID;
	aP.pcid = strContractKeys;
	var oRS = app.g.get_sqrecordset("company/filter_company_contracts.select",aP);

	//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
	while(oRS.Fetch())
	{
		intContractCount++;	
		if(intContractCount>1)strOrgContractKeys+=",";
		strOrgContractKeys += app.g.get_field(oRS, "pk_contract_id");
		strDefaultContract = app.g.get_field(oRS, "pk_contract_id");
	}	
	
	//-- Filter the Contract List based on Org
	oList.storedQuery = "requests.filter_company_contracts";
	if((typeof strOrgContractKeys != 'undefined') && strOrgContractKeys!="")
	{
		_slf(oList , "pcid="+strOrgContractKeys);
	} 
	else 
	{
		_slf(oList , "");
	}

	if(intContractCount==1)	return strDefaultContract;
}

//-- given a Contract, return the child slas
fglobal.prototype.get_contract_services = fglobal_get_contract_services;
function fglobal_get_contract_services(strContractID)
{
	var strFilter = "pk_auto_id =-1";
	//Load services from the service catalog
	if(strContractID!="")
	{
		//var serviceKeys = app.service.get_organisation_services(strContractID,true);
		var serviceKeys = app.service.get_contract_services(strContractID,true);

		if(serviceKeys!="")
			strFilter = "pk_auto_id in ("+serviceKeys+")";
	}

	return strFilter;
}

//-- create contract pricing entries
fglobal.prototype.add_contract_pricing = fglobal_add_contract_pricing;
function fglobal_add_contract_pricing(strContractID, intItemID, strItemName, strItemType, strStdPrice)
{
	//if(app.g.get_rxowcount("contract_pricing","fk_contract_id = '" + app.g.pfs(strContractID) + "' and fk_item_id = "+intItemID)<1)
	//{
	//	var strSQL = "ixnsert into contract_pricing (fk_contract_id,fk_item_id,fk_item_name,fk_item_type,stdprice) values ('"+app.g.pfs(strContractID)+"',"+intItemID+",'"+app.g.pfs(strItemName)+"','"+app.g.pfs(strItemType)+"','"+app.g.pfs(strStdPrice)+"')";
	//	app.g.sxubmitsql(strSQL,true);
	//}
	var strParams = "fcid=" + pfu(strContractID) + "&fid=" + pfu(intItemID) + "&fin="+ pfu(strItemName)+ "&fit="+ pfu(strItemType)+ "&sp="+ pfu(strStdPrice);
	app.g.submitsqs("general/add_contract_pricing",strParams)
}

//-- remove contract pricing entry
fglobal.prototype.delete_contract_pricing = fglobal_delete_contract_pricing;
function fglobal_delete_contract_pricing(strContractID, intItemID)
{
	//var strSQL = "dxelete from contract_pricing where fk_contract_id = '" + app.g.pfs(strContractID) + "' and fk_item_id = "+intItemID;
	//app.g.sxubmitsql(strSQL,true);
	strParams = "fcid=" + pfu(strContractID) + "&fid="+intItemID;
	app.g.submitsqs("general/delete_contract_pricing",strParams);
}

//-- maintain contract pricing summary fields
fglobal.prototype.update_contract_pricing_summary = fglobal_update_contract_pricing_summary;
function fglobal_update_contract_pricing_summary(strContractID)
{
	var strPrice = "";
	var strPriceAdustment = "";
	var strServiceTotal = "";
	var strSLATotal = "";
	var strCITotal = "";
	var intServiceCount = 0;
	var intSLACount = 0;
	var intCICount = 0;
	var strServiceAdjustment = "";
	var strSLAAdjustment = "";
	var strCIAdjustment = "";

	//var strSQL  = "s/elect * from contract_pricing where fk_contract_id='"+app.g.pfs(strContractID)+"'";
	//var strDB = "swdata";
	//var oRS  = this.gxet_recordset(strSQL,strDB);
	var oRS  = this.get_sqrecordset("select.tablebycol","table=contract_pricing&_swc_fk_contract_id="+strContractID);
	while (oRS.Fetch())
	{
		//-- Check for adjustment
		if(this.get_field(oRS,"adjustedprice")!="")
		{
			strPriceAdustment = ((this.get_field(oRS,"stdprice")/100) * this.get_field(oRS,"percadjustment"))
			if(this.get_field(oRS,"adjustmentdir")=="-")
			{
				strPrice = this.get_field(oRS,"stdprice") - strPriceAdustment;
			}
			else if(this.get_field(oRS,"adjustmentdir")=="+")
			{
				strPrice = (this.get_field(oRS,"stdprice")*1) + (strPriceAdustment*1);
			}
		}
		else
		{
			strPrice = this.get_field(oRS,"stdprice")
		}
			
			
		if(this.get_field(oRS,"fk_item_type")=="Service")
		{
			intServiceCount++;
			strServiceTotal = (strServiceTotal*1) + (strPrice*1);
			if(this.get_field(oRS,"adjustmentdir")=="+")
			{
				strServiceAdjustment = (strServiceAdjustment*1) + (strPriceAdustment*1);
			}
			else if (this.get_field(oRS,"adjustmentdir")=="-")
			{
				strServiceAdjustment = (strServiceAdjustment*1) - (strPriceAdustment*1);
			}
			
		}
		else if(this.get_field(oRS,"fk_item_type")=="Configuration Item")
		{
			intCICount++;
			strCITotal = (strCITotal*1) + (strPrice*1);
			if(this.get_field(oRS,"adjustmentdir")=="+")
			{
				strCIAdjustment = (strCIAdjustment*1) + (strPriceAdustment*1);
			}
			else if (this.get_field(oRS,"adjustmentdir")=="-")
			{
				strCIAdjustment = (strCIAdjustment*1) - (strPriceAdustment*1);
			}
		}
		else if(this.get_field(oRS,"fk_item_type")=="SLA")
		{
			intSLACount++;
			strSLATotal = (strSLATotal*1) + (strPrice*1);
			if(this.get_field(oRS,"adjustmentdir")=="+")
			{
				strSLAAdjustment = (strSLAAdjustment*1) + (strPriceAdustment*1);
			}
			else if (this.get_field(oRS,"adjustmentdir")=="-")
			{
				strSLAAdjustment = (strSLAAdjustment*1) - (strPriceAdustment*1);
			}
		}
		
	}

	var strParams = "table=contract";
	strParams += "&_swc_cost_amt_servs=" + intServiceCount;
	strParams += "&_swc_cost_amt_ci=" + intCICount;
	strParams += "&_swc_cost_amt_sla=" + intSLACount;
	strParams += "&_swc_cost_total_servs=" + format_float_to_decimal_str(strServiceTotal);
	strParams += "&_swc_cost_total_ci=" + strCITotal;
	strParams += "&_swc_cost_total_sla=" + strSLATotal;
	strParams += "&_swc_cost_discount_servs=" + strServiceAdjustment;
	strParams += "&_swc_cost_discount_ci=" + strCIAdjustment;
	strParams += "&_swc_cost_discount_sla=" + strSLAAdjustment;
	strParams += "&_swc_cost_amt_total=" + (intServiceCount+intCICount+intSLACount);
	strParams += "&_swc_cost_total_total=" + ((strServiceTotal*1)+(strCITotal*1)+(strSLATotal*1));
	strParams += "&_swc_cost_discount_total=" + ((strServiceAdjustment*1)+(strCIAdjustment*1)+(strSLAAdjustment*1));
	strParams += "&_swc_cost_total=" + (((strServiceTotal*1)+(strCITotal*1)+(strSLATotal*1)) + ((strServiceAdjustment*1)+(strCIAdjustment*1)+(strSLAAdjustment*1)));
	strParams += "&kv="+strContractID;
	app.g.submitsqs("update.table",strParams);
	
	var arrTotals = [];
	arrTotals.intServiceCount = intServiceCount;
	arrTotals.intCICount = intCICount;
	arrTotals.intSLACount = intSLACount;
	arrTotals.strServiceTotal = strServiceTotal;
	arrTotals.strCITotal = strCITotal;
	arrTotals.strSLATotal = strSLATotal;
	arrTotals.strServiceAdjustment = strServiceAdjustment;
	arrTotals.strCIAdjustment = strCIAdjustment;
	arrTotals.strSLAAdjustment = strSLAAdjustment;
	arrTotals.intAmtTotal = (intServiceCount+intCICount+intSLACount);
	arrTotals.intTotalTotal = ((strServiceTotal*1)+(strCITotal*1)+(strSLATotal*1));
	arrTotals.strAdjustmentTotal = ((strServiceAdjustment*1)+(strCIAdjustment*1)+(strSLAAdjustment*1));
	arrTotals.strCostTotal = (((strServiceTotal*1)+(strCITotal*1)+(strSLATotal*1)) + ((strServiceAdjustment*1)+(strCIAdjustment*1)+(strSLAAdjustment*1)));

	return arrTotals;
}

//-- DTH: 20120106
//-- F0097653: Affected Business Areas on the Change Details Form
//-- Functions relating to the association between Affected Business Areas and Calls (mainly Change Requests)
//-- Affected Business Areas (ABA) will either come from those associated to CIs which have subsequently been associated with the call
//-- ABAs may also be associated directly with the call by an analyst

//-- Get the Id of the ABA for a given CI
fglobal.prototype.get_affected_bus_area_id_from_ci = fglobal_get_affected_bus_area_id_from_ci;
function fglobal_get_affected_bus_area_id_from_ci(strConfigId)
{
	return "";
}


//-- DTH: 20120112
//-- Get the ABAs which are associated with the call
//-- The resulting table will be based on affected_bus_area so that we can display the details of each ABA
fglobal.prototype.sl_load_call_ABAs = fglobal_sl_load_call_ABAs;
function fglobal_sl_load_call_ABAs(oSqlList, intCallref)
{
	// Check that we have valid input parameters and set defaults
	if (intCallref < 1) return false; // cannot proceed without a call ref

	// get a list of the ABA IDs for the current call
	var strABAList = "";
	var aCol = {};
	aCol.status = 'Active';
	aCol.fk_callref = intCallref;
	var oRS = app.g.get_tablerecordset_bycol("cmn_rel_opencall_aba",aCol); 
	while(oRS.Fetch())
	{
		if (strABAList != "") strABAList += ",";
		strABAList += app.g.get_field(oRS,"FK_BUS_AREA_ID");
	}
	if (strABAList == "")strABAList = "_|_"; //-- so will return nothing

	oSqlList.storedQuery = "common.load_by_colname";
	_slf(oSqlList , "swc=pk_area_id&kvs=" + strABAList);
	oSqlList.SetRowSelected(0);
}

//-- Associated an Affected Business Area with a call. This may either come from a CI or from an analyst
/*
When adding a CI to the call
	for each CI
		for each ABA linked to the CI
			If the ABA is in the call list
				if the ABA status = Removed
					Inform the analyst (a previously Removed ABA is linked to the newly added CI)
					set Status = Active, 
					set Source = CI
				else (the ABA is in the call list and is Active)
					set Source = CI
			else //ABA is not in the call list
				Add ABA to call list 
				set Status = Active, 
				set Source = CI					
When an Analyst adds an ABA
	Add ABA to call list
	set Status = Active 
	set Source = Analyst
*/
fglobal.prototype.add_affected_bus_area_to_call = fglobal_add_affected_bus_area_to_call;
function fglobal_add_affected_bus_area_to_call(intCall, strSource, strConfigId, strABA, boolInform)
{
	// Check that we have valid input parameters and set defaults
	if (intCall < 1) return false; // cannot proceed without a call ref
	if (strSource == undefined) strSource = "CI";
	if (boolInform == undefined) boolInform = false;
	
	// load an array of the ABAs already associated with the call
	var array_callABAs = [];
	var curr_ABA = "";
	//var strGetCallABAs = "sxelect fk_bus_area_id, status from cmn_rel_opencall_aba where fk_callref = " + intCall;
	//var oRS = app.g.gxet_recordset(strGetCallABAs,"swdata");
	//-- nwj - 11.2012 - use sqs
	var strParams = "cr="+intCall;
	var oRS = app.g.get_sqrecordset("call/add_affected_bus_area_to_call.select.cmn_rel_opencall_aba",strParams);
	while(oRS.Fetch())
	{
		curr_ABA = app.g.get_field(oRS,"FK_BUS_AREA_ID");
		array_callABAs.push(curr_ABA);
		array_callABAs[curr_ABA] = app.g.get_field(oRS,"STATUS");
	}
		
	if (strSource == "CI")
	{
		if (strConfigId == "") return false; // cannot proceed without a CI ID
				
		// find all ABAs linked to the CI	
		//-- nwj - 11.2012 - use sqs
		var strParams = "cid="+strConfigId;
		var oRS = app.g.get_sqrecordset("call/add_affected_bus_area_to_call.select.config_bus_area",strParams);
		while(oRS.Fetch())
		{
			curr_ABA = app.g.get_field(oRS,"FK_BUS_AREA_ID");
			if (in_array(array_callABAs, curr_ABA))
			{
				if (array_callABAs[curr_ABA] == "Removed") // if the status = 'Removed'
				{
					// Inform the Analyst if the flag is set
					if (boolInform) MessageBox("An Affected Business Area ("+curr_ABA+") which was previously removed from this Change Request has now been reactivated.");
					
					// Set status and source of the ABA linked to the call
					var strParams = "ss=1&cr="+intCall+"&abaid="+curr_ABA;
				}
				else
				{
					// Set source of the ABA linked to the call
					var strParams = "cr="+intCall+"&abaid="+curr_ABA;
				}
				app.g.submitsqs("call/add_affected_bus_area_to_call.update.cmn_rel_opencall_aba",strParams);
			}
			else
			{
				// link the ABA to the call
				var strParams = "cr="+intCall+"&baid="+pfu(curr_ABA)+"&sts=Active&src=CI";
				app.g.submitsqs("call/insert.cmn_rel_opencall_aba",strParams);
			}
		}
	}
	else // source = analyst
	{
		// If the ABA is against the call but was Removed then make it Active, leave the source as CI (this has higher priority)
		if (in_array(array_callABAs, strABA))
		{
			if (array_callABAs[strABA] == "Removed") // if the status = 'Removed'
			{
				// Set status = Active 
				var strParams = "cr="+intCall+"&abaid="+pfu(strABA);
				app.g.submitsqs("call/activate.cmn_rel_opencall_aba",strParams);

			}
		}
		else
		{	
			// link the ABA to the call
			var strParams = "cr="+intCall+"&baid="+pfu(strABA)+"&sts=Active&src=Analyst";
			app.g.submitsqs("call/insert.cmn_rel_opencall_aba",strParams);
		}
	}

	return true;
}


//-- Remove an Associated an Affected Business Area from a call. The record may either be deleted or its status changed.
/*
When removing an ABA from the call
	If source = Analyst
		Delete the ABA record
	Else (source = CI. CIs are being removed from the call hence we need to remove eligible ABAs)
		If the ABA linked to the CI is not linked to other CIs which are associated with the call 
			Delete the ABA record
		Else (the ABA linked to the CI is also linked to other CIs which are associated to the call)
			Do nothing
*/
fglobal.prototype.remove_affected_bus_area_from_call = fglobal_remove_affected_bus_area_from_call;
function fglobal_remove_affected_bus_area_from_call(intCall, sqlListABAs, strConfigIds, strSource)
{
	var strABA_Ids = ""; // use this to build a list of the ABA IDs to remove
	
	// check input parameters and set defaults
	if (intCall < 1) return false; // Need a call ref
	if (strSource == undefined) strSource = "CI"; // Assume not an Analyst hence CI
		
	if (strSource == "CI")
	{
		// Get a list of all CIs against the call
		strAllCallCIs = app.cmdb.get_call_cis(intCall, "RFC-CAUSE","");

		// Get a list of all ABAs against the call except those against the CIs to be removed and where the ABA was added from a CI
		var array_callABAs = [];				
		//strGetCallABAsSql = "sxelect config_bus_area.fk_bus_area_id as aba_id from config_itemi";
		//strGetCallABAsSql += " right join config_bus_area on config_bus_area.fk_config_item = config_itemi.ck_config_item";
		//strGetCallABAsSql += " where config_itemi.pk_auto_id in ("+strAllCallCIs+") and config_itemi.pk_auto_id not in ("+strConfigIds+")";
		//strGetCallABAsSql += " group by config_bus_area.fk_bus_area_id";
		//var oRS = app.g.gxet_recordset(strGetCallABAsSql,"swdata");
		//-- nwj - 11.2012 - use sqs
		var strParams = "strAllCallCIs="+strAllCallCIs+"&strConfigIds=" + strConfigIds;
		var oRS = app.g.get_sqrecordset("call/remove_affected_bus_area_from_call.select",strParams);
		while(oRS.Fetch())
		{
			curr_ABA = app.g.get_field(oRS,"ABA_ID");
			array_callABAs.push(curr_ABA);
		}
		
		//CIs to be removed. Get a distinct list of ABAs linked to these CIs (AllRemovedCIs_ABAs)
		var array_RemovedCIs_ABAs = [];
		var curr_ABA = "";
		//strGetRemovedCIABAsSql = "sxelect config_bus_area.fk_bus_area_id as aba_id from config_itemi";
		//strGetRemovedCIABAsSql += " right join config_bus_area on config_bus_area.fk_config_item = config_itemi.ck_config_item";
		//strGetRemovedCIABAsSql += " where config_itemi.pk_auto_id in ("+strConfigIds+")";
		//strGetRemovedCIABAsSql += " group by config_bus_area.fk_bus_area_id";
		//var oRS = app.g.gxet_recordset(strGetRemovedCIABAsSql,"swdata");
		//-- nwj - 11.2012 - use sqs
		var strParams = "strConfigIds=" + strConfigIds;
		var oRS = app.g.get_sqrecordset("call/remove_affected_bus_area_from_call.select",strParams);
		while(oRS.Fetch())
		{
			curr_ABA = app.g.get_field(oRS,"ABA_ID");
			array_RemovedCIs_ABAs.push(curr_ABA);			
		}
		
		for (x=0; x<array_RemovedCIs_ABAs.length; x++) // for each ABA against all of the removed CIs
		{
			if (!in_array(array_callABAs, array_RemovedCIs_ABAs[x])) // if the ABA is not in the 
			{
				// delete the ABA record from the table which links calls to ABAs
				if(strABA_Ids!="")strABA_Ids+=",";
				strABA_Ids+=array_RemovedCIs_ABAs[x];
			}
		}		

		//-- nwj - 11.2012 - use submitsqs
		if(strABA_Ids!="")
		{
			var strParams = "cr=" + intCall + "&bads=" + strABA_Ids;
			app.g.submitsqs("call/remove_affected_bus_area_from_call.delete",strParams)
		}
	}
	else // Analyst is removing ABAs
	{
		/*
			For each selected ABA in the supplied SQL List
				if the source = analyst
					delete the record
				else
					set status = Removed
		*/
		strABA_Ids = ""; // use this to build a list of the ABA IDs to remove
		for (x=0; x<sqlListABAs.rowCount(); x++)
		{
			if (sqlListABAs.IsRowSelected(x))
			{
				curr_ABA = sqlListABAs.GetItemTextRaw(x, 0);
				if (strABA_Ids != "") strABA_Ids += ",";
				strABA_Ids += curr_ABA;
			}
		}
		
		// If nothing is selected, then nothing to do
		if (strABA_Ids == "") return true;

		//-- nwj - 11.2012 - use submitsqs
		var strParams = "cr=" + intCall +"&upd=1&bads=" + strABA_Ids;
		app.g.submitsqs("call/remove_affected_bus_area_from_call.delete",strParams)
	}

	return true;
}


//-- DTH: 20121031 F0097668
//-- populate an array with the Criteria and the Criteria Descriptions. 
//-- Used within Impact Level Assessment (ILA) on the ImpactAssessment Form from Log Change Request
fglobal.prototype.get_ILA_criteria_desc = fglobal_get_ILA_criteria_desc;
function fglobal_get_ILA_criteria_desc(appcode, usage_area)
{
	var arrCriteria = [];	
	var strCriterion = "";
	var strDesc = "";

	var aCol = {};
	aCol.appcode = appcode;
	aCol.usage_area = usage_area; 
	var oRS = app.g.get_tablerecordset_bycol("ila_criterion",aCol);
	while(oRS.Fetch())
	{
		strCriterion = app.g.get_field(oRS,"criterion");	
		strDesc = app.g.get_field(oRS,"description");	
		arrCriteria.push(strCriterion);
		arrCriteria[strCriterion] = strDesc;		
		
	}	
	return arrCriteria;
}

//-- DTH: 20120202 F0097668
//-- relate the selected Options for Impact Level Assessment with the call
fglobal.prototype.relate_ila_options_to_call = fglobal_relate_ila_options_to_call;
function fglobal_relate_ila_options_to_call(callref, usage_area, strILAOptions)
{
	if (callref < 1) return false;
	if (strILAOptions == "") return false;
	if (usage_area == "") usage_area = "Change Log Call Form";
	//-- Delete Exisitng ILA Records First
	strParams = "fcid=" + callref + "&fid="+usage_area;
	app.g.submitsqs("general/delete_ila",strParams);
	
	var arrILAOptions = strILAOptions.split(",");
	for (x in arrILAOptions)
	{
		//-- 15.11.2012 - nwj - use new gen function to submit insert request to server (insert is constructed serverside)
		var arrCols = {};
		arrCols.fk_callref = callref;
		arrCols.fk_ila_option_id = arrILAOptions[x];
		arrCols.usage_area = usage_area;
		this.submittableinsert("cmn_rel_opencall_ila",arrCols);
	}
	return true;	
}

//-- DTH: 20120207 F0097668 Lead Time Check
//-- populate an array with the Lead Times for each of the available Impact Levels. 
//-- Used within Lead Time Check on the Log Change Request Form
fglobal.prototype.get_impact_lead_times = fglobal_get_impact_lead_times;
function fglobal_get_impact_lead_times()
{ 
	var arrImpactLeadTimes = [];	
	var oRS = app.g.get_sqrecordset("select.table","table=itsm_impact_lvl");
	while(oRS.Fetch())
	{
		var strImpact = "";
		var strLeadTime = "";
		strImpact = app.g.get_field(oRS,"pk_impact");
		strLeadTime = app.g.get_field(oRS,"lead_time");
		arrImpactLeadTimes.push(strImpact);
		arrImpactLeadTimes[strImpact] = strLeadTime;				
	}
	return arrImpactLeadTimes;
}

//-- DTH: 20120208 F0097669 KB Catalog Rights
//-- populate an array with the Catalog Names for each of the Catalog IDs. 
//-- Used from swkb_catalog_rights form
fglobal.prototype.get_catalog_names = fglobal_get_catalog_names;
function fglobal_get_catalog_names()
{ 
	var arrCatNames = [];	
	var oRec = app.g.get_sqrecordset("knowledgebase/get_catalog_names.select","");
	if(oRec)
	{
		var strCatID = "";
		var strCatName = "";

		while(oRec.Fetch())
		{  
			strCatID = oRec.GetValueAsString("catalogid");
			strCatName = oRec.GetValueAsString("catalogname");

			arrCatNames.push(strCatID);
			arrCatNames[strCatID] = strCatName;				
		}
	}	

	return arrCatNames;
}

//-- AG: 14062012 F0102756 Breach Reason Mandatory
//-- return a string of analyst group id's given an analyst id 
//-- Used from call details forms
fglobal.prototype.get_all_analyst_groups = fglobal_get_all_analyst_groups;
function fglobal_get_all_analyst_groups(analystId)
{ 
	var aCols = {};
	aCols.analystid = analystId;
	var oRS = app.g.get_tablerecordset_bycol("swanalysts_groups", aCols,true);

	var strAnalystsGroup = "";
	var strAnalystsGroups = "";
	while(oRS.Fetch())
	{
		var strAnalystsGroup = app.g.get_field(oRS,"groupid");
		if (strAnalystsGroups==""){
			strAnalystsGroups = strAnalystsGroup;
		}
		else {
			strAnalystsGroups += "," + strAnalystsGroup;
		}
	}
	return strAnalystsGroups;
}


//-- DTH: 20120208 F0097669 KB Catalog Rights
//-- populate an array with the Catalog Names to which the analyst has been given rights. 
//-- Used from KB Article form
fglobal.prototype.get_authorised_catalog_names = fglobal_get_authorised_catalog_names;
function fglobal_get_authorised_catalog_names(strAnalystID)
{ 
	var arrCatNames = [];	

	var aCols = {};
	aCols.analystid = strAnalystID;
	var oRec = app.g.get_tablerecordset_bycol("swkb_catalog_rights", aCols);
	if(oRec)
	{
		var strCatID = "";
		var strCatName = "";
		while(oRec.Fetch())
		{
			strCatID = oRec.GetValueAsString("catalogid");
			strCatName = oRec.GetValueAsString("catalogname");
			arrCatNames.push(strCatID);
			arrCatNames[strCatID] = strCatName;
		}
	}	
	
	return arrCatNames;
}

//-- DTH: 20120208 F0097669 KB Catalog Rights
//-- populate an array with the Catalogs to which an analyst has rights and the details of the rights 
//-- Used from KB Details form
fglobal.prototype.get_anlyst_kbcat_rights = fglobal_get_anlyst_kbcat_rights;
function fglobal_get_anlyst_kbcat_rights(strAnalystid, intCatId)
{ 
	var arrCatRights = [];	
	if (strAnalystid == "") return arrCatRights;
	if (intCatId < 0) return arrCatRights;
	
	var aCols = {};
	aCols.catalogid = intCatId;
	aCols.analystid = strAnalystid;
	var oRec = app.g.get_tablerecordset_bycol("swkb_catalog_rights", aCols);
	if(oRec)
	{
		var strCatID = "";
		var strCatName = "";
		var strCanCompose = "";
		var strCanEditCatalog = "";
		var strStatusToComposed = "";
		var strStatusToWaiting = "";
		var strStatusToApproved = "";
		var strStatusToPublished = "";
		var strStatusToRetired = "";
		var strStatusVisible = "";
		var strAlterChangeSettings = "";
		var strChangeCIs = "";

		while(oRec.Fetch())
		{  
			strCatID = oRec.GetValueAsNumber("catalogid");

			strCanCompose = oRec.GetValueAsNumber("flg_can_compose");
			if(strCanCompose=="")strCanCompose="0"				

			strCanEditCatalog = oRec.GetValueAsNumber("flg_change_catalog");
			if(strCanEditCatalog=="")strCanEditCatalog="0"				

			strStatusToComposed = oRec.GetValueAsNumber("flg_status_to_compose");
			if(strStatusToComposed=="")strStatusToComposed="0"				

			strStatusToWaiting = oRec.GetValueAsNumber("flg_status_to_waiting");
			if(strStatusToWaiting=="")strStatusToWaiting="0"				

			strStatusToApproved = oRec.GetValueAsNumber("flg_status_to_approved");
			if(strStatusToApproved=="")strStatusToApproved="0"				
				
			strStatusToPublished = oRec.GetValueAsNumber("flg_status_to_published");
			if(strStatusToPublished=="")strStatusToPublished="0"				
				
			strStatusToRetired = oRec.GetValueAsNumber("flg_status_to_retired");
			if(strStatusToRetired=="")strStatusToRetired="0"				

			strStatusVisible = oRec.GetValueAsNumber("flg_status_visible");
			if(strStatusVisible=="")strStatusVisible="0"				

			strAlterChangeSettings = oRec.GetValueAsNumber("flg_alter_change_settings");
			if(strAlterChangeSettings=="")strAlterChangeSettings="0"				

			strChangeCIs = oRec.GetValueAsNumber("flg_change_cis");
			if(strChangeCIs=="")strChangeCIs="0"				
				
			arrCatRights.push("compose");
			arrCatRights.compose = strCanCompose;
			arrCatRights.push("editcatalog");
			arrCatRights.editcatalog = strCanEditCatalog;
			arrCatRights.push("composed");
			arrCatRights.composed = strStatusToComposed;
			arrCatRights.push("waiting");
			arrCatRights.waiting = strStatusToWaiting;
			arrCatRights.push("approved");
			arrCatRights.approved = strStatusToApproved;
			arrCatRights.push("published");
			arrCatRights.published = strStatusToPublished;
			arrCatRights.push("retired");
			arrCatRights.retired = strStatusToRetired;
			arrCatRights.push("visible");
			_evi(arrCatRights , strStatusVisible);
			arrCatRights.push("changesettings");
			arrCatRights.changesettings = strAlterChangeSettings;
			arrCatRights.push("changecis");
			arrCatRights.changecis = strChangeCIs;
		}
	}
	
	return arrCatRights;
}

//-- RJC: 20120216 F0097669 KB Catalogs
//-- populate an array with the Catalogs to which an analyst has rights and the details of the rights 
//-- Used from KB Details form
fglobal.prototype.get_anlyst_kbcats_foradd = fglobal_get_anlyst_kbcats_foradd;
function fglobal_get_anlyst_kbcats_foradd(strAnalystid)
{ 
	if (strAnalystid == "") return "";

	var strItems = "";
	var strName = "";

	var aCols = {};
	aCols.flg_can_compose = 1;
	aCols.analystid = strAnalystid;
	var oRec = app.g.get_tablerecordset_bycol("swkb_catalog_rights", aCols);
	while(oRec.Fetch())
	{
		if(strItems!="") strItems+="|";
			
		strName = app.g.get_field(oRec,"catalogname");
		strName = strName.replace(/&apos;/g, "'");
		strItems += strName+"^"+app.g.get_field(oRec,"catalogid");		
	}
	
	return strItems;
}

//-- F0097428 - process form attribute check, this will make field mandatory/non mandatory depending on the currently selected process/stage
//-- given a form control check if it has a data binding that is managed
fglobal.prototype.process_bpm_form_attribute_check = fglobal_process_bpm_form_attribute_check;
function fglobal_process_bpm_form_attribute_check(oDoc, strWorkflow, intStage)
{
	if(strWorkflow==undefined || strWorkflow=='')
		return;
	if(intStage==undefined)
		intStage = 0;

	// Reset fileds to original state
	app.g.reset_bpm_form_attribute_check(oDoc);
	
	//query for the managed fields
	var aCols = {};
	aCols.fk_workflow_id = strWorkflow;
	aCols.fk_stage_id = intStage;
	var oRec = app.g.get_tablerecordset_bycol("bpm_ctrl_fields", aCols);
	while(oRec.Fetch())
	{
		var boolUse = true;
		//check if this managed field is conditional
		var strCondition = app.g.get_field(oRec,"execcondition");
		if(strCondition!="")
		{
			//replace any system variables with values
			var intStart = strCondition.indexOf('&[');
			while(intStart>-1)
			{
				var intEnd = strCondition.indexOf(']', intStart);
				var strField = strCondition.substring(intStart+2, intEnd);
				arrFiels = strField.split(".");
				strCondition = strCondition.substr(0,intStart)+ oDoc[arrFiels[0]][arrFiels[1]]+strCondition.substring(intEnd+1);
				var intStart = strCondition.indexOf('&[');
			}
			
			//call vpme script to evaluate condition
			var xmlmc = new XmlMethodCall();
			xmlmc.SetValue("testcondition", strCondition);		
			if(xmlmc.Invoke("vpme", "evalFunction"))
			{
				var strXML = (app.bWebClient)? xmlmc._lastresult:xmlmc.GetReturnXml();
				var objRes = XMCResult(strXML);
				if(!objRes.success)
				{
					boolUse = false;
				}	
			}
			else
			{
				MessageBox("Failed to evaluate form field management. " + xmlmc.GetLastError() + ". Please contact your Supportworks Supervisor.");
			}		
		}
		
		if(boolUse)
		{
			var strDataBinding = app.g.get_field(oRec,"databinding");
			for(var x=0; x < oDoc.mainform.elements.length;x++)
			{
				if (oDoc.mainform.elements[x].dataRef==strDataBinding && (FE_FIELD == oDoc.mainform.elements[x].type || FE_TEXT == oDoc.mainform.elements[x].type ))
				{
					var arrSettings = oDoc.arrOrigSettings;
					if(arrSettings[strDataBinding]==undefined)
						arrSettings[strDataBinding] = oDoc.mainform.elements[x].mandatory;
					oDoc.arrOrigSettings = arrSettings;
					var boolMandatory = (1 == app.g.get_field(oRec,"flg_mandatory"));
					if (boolMandatory != oDoc.mainform.elements[x].mandatory){
						_ema(oDoc.mainform.elements[x], boolMandatory);
					}
				}
			}
		}
	}
}

//-- F0097428 - process form attribute check, this will make field mandatory/non mandatory depending on the currently selected process/stage
//-- given a form control check if it has a data binding that is managed
fglobal.prototype.reset_bpm_form_attribute_check = fglobal_reset_bpm_form_attribute_check;
function fglobal_reset_bpm_form_attribute_check(oDoc)
{
	var arrSettings = oDoc.arrOrigSettings;
	for(y in arrSettings)
	{
		for(var x=0; x < oDoc.mainform.elements.length;x++)
		{
			if (oDoc.mainform.elements[x].dataRef===y)
			{
				_ema(oDoc.mainform.elements[x], arrSettings[y]);
			}
		}
	}
}

//-- nwj - 25.11.2012 - added strOptionalOverideFilter
fglobal.prototype.apply_appcode_sla_filter = fglobal_apply_appcode_sla_filter;
function fglobal_apply_appcode_sla_filter(oEle, strArea, strOptionalOverideFilter)
{

	if(!oSettings.get_setting("boolFilterAppcodeSLALoaded"))app.g.load_appcode_sla();

	//get setting and apply to Element
	var strSettingName = "";
	if(strArea=="SLA")
		strSettingName = "strFilterAppcodeSLA";
	else if(strArea=="SLA-OLA")
		strSettingName = "strFilterAppcodeSLAOLA";
	else if(strArea=="SLR")
		strSettingName = "strFilterAppcodeSLR";
	else if(strArea=="SLA-CALL")
		strSettingName = "strFilterAppcodeSLACalls";
	else if(strArea=="SLA-ENTITIES")
		strSettingName = "strFilterAppcodeSLAEntities";
	else if(strArea=="SLA-CONTRACT")
		strSettingName = "strFilterAppcodeSLAContract";
	else if(strArea=="OLA")
		strSettingName = "strFilterAppcodeOLA";
	else if(strArea=="SLA-CMDB")
		strSettingName = "strFilterAppcodeSLACMDB";
	else if(strArea=="SLA-SERVICE")
		strSettingName = "strFilterAppcodeSLAService";

	var strFilter = oSettings.get_setting(strSettingName);
	if(strFilter!="" && strFilter!=false)
	{
		strFilter = "_acin="+strFilter;
		var strOrigFilter = (strOptionalOverideFilter==undefined)?oEle.filter:strOptionalOverideFilter;
		if(strOrigFilter!="")strFilter = strOrigFilter+"&"+strFilter;

		_slf(oEle , strFilter);
	}
	else if (strOptionalOverideFilter!=undefined)
	{
		_slf(oEle , strOptionalOverideFilter);
	}
}	

fglobal.prototype.load_appcode_sla = fglobal_load_appcode_sla;
function fglobal_load_appcode_sla()
{
	var strSettingName = "";
	//load settings for appcode filter
	var strParams ="ps=FILTER.APPCODE.BPM,FILTER.APPCODE.OLA,FILTER.APPCODE.SLA";
	var oRS = app.g.get_sqrecordset("general/sw_settings.selectlike",strParams);
	while(oRS.Fetch())
	{
		var strSettingName = "";
		var strSettingValue = "";
		var strPkSetting = "";
		strSettingValue = app.g.get_field(oRS,"setting_value");
		strPkSetting = app.g.get_field(oRS,"setting_name");

		switch (strPkSetting)
		{
			case "FILTER.APPCODE.SLA" :
				strSettingName = "strFilterAppcodeSLA";
				break;
			case "FILTER.APPCODE.SLA-OLA" :
				strSettingName = "strFilterAppcodeSLAOLA";
				break;
			case "FILTER.APPCODE.OLA" :
				strSettingName = "strFilterAppcodeOLA";
				break;
			case "FILTER.APPCODE.SLR" :
				strSettingName = "strFilterAppcodeSLR";
				break;
			case "FILTER.APPCODE.SLA-CALL" :
				strSettingName = "strFilterAppcodeSLACalls";
				break;
			case "FILTER.APPCODE.SLA-ENTITIES" :
				strSettingName = "strFilterAppcodeSLAEntities";
				break;
			case "FILTER.APPCODE.SLA-CONTRACT" :
				strSettingName = "strFilterAppcodeSLAContract";
				break;
			case "FILTER.APPCODE.SLA-CMDB" :
				strSettingName = "strFilterAppcodeSLACMDB";
				break;
			case "FILTER.APPCODE.SLA-SERVICE" :
				strSettingName = "strFilterAppcodeSLAService";
				break;
		//	case "CHANGE.AFFECTEDBUSINESSAREA.EMAILTEMPLATE" :
		//		strChangeABAMailTemplate = strSettingValue;
		//		oSettings.set_setting("strChangeABAMailTemplate", strSettingValue);
		//	break;
		}
		if(strSettingName!="")
		{
			var strSetting = "";
			if(strSettingValue!="")
			{
				arrSettingValue = strSettingValue.split("|");
				for (var x=0;x<arrSettingValue.length;x++)
				{
					var thisValue = arrSettingValue[x];
					if(thisValue=="![CURRENT.DD]!")
					{
						//thisValue = app.session.dataDictionary;
						var strDSFL = app.itsm.get_session_param("datasetFilterList");
						strDSFL = strDSFL.replace(/\'/g,""); //-- remove quotes from datasetFilterList
						thisValue = strDSFL;
					}

					if(strSetting!="")strSetting += ",";
					//-- nwj - no need to prepare as don on server now
					//strSetting += "'"+app.g.pfs(thisValue)+"'";
					strSetting += thisValue;
				}
			}
			// set the value to that in the settings area
			oSettings.set_setting(strSettingName, strSetting);
		}
	}
	oSettings.set_setting("boolFilterAppcodeSLALoaded",true);
}


//-- nwj - 25.11.2012 - added strOptionalOverideFilter
fglobal.prototype.apply_appcode_bpm_filter = fglobal_apply_appcode_bpm_filter;
function fglobal_apply_appcode_bpm_filter(oEle, strArea,strOptionalOverideFilter)
{
	if(!oSettings.get_setting("boolFilterAppcodeBPMLoaded"))
		app.g.load_appcode_bpm();
	//get setting and apply to Element
	var strSettingName = "";
	if(strArea=="BPM")
		strSettingName = "strFilterAppcodeBPM";

	var strFilter = oSettings.get_setting(strSettingName);
	if(strFilter!="" && strFilter!=false)
	{
		strFilter = "_acin="+strFilter;
		var strOrigFilter = (strOptionalOverideFilter==undefined)?oEle.filter:strOptionalOverideFilter;
		if(strOrigFilter!="")strFilter = strOrigFilter+"&"+strFilter;

		_slf(oEle , strFilter);
	}
	else if (strOptionalOverideFilter!=undefined)
	{
		_slf(oEle , strOptionalOverideFilter);
	}
}	

fglobal.prototype.load_appcode_bpm = fglobal_load_appcode_bpm;
function fglobal_load_appcode_bpm()
{
	var strSettingName = "";
	//load settings for appcode filter
	var strParams ="ps=FILTER.APPCODE.BPM";
	var oRS = app.g.get_sqrecordset("general/sw_settings.selectlike",strParams);
	while(oRS.Fetch())
	{
		var strSettingName = "";
		var strSettingValue = "";
		var strPkSetting = "";
		strSettingValue = app.g.get_field(oRS,"setting_value");
		strPkSetting = app.g.get_field(oRS,"setting_name");

		switch (strPkSetting)
		{
			case "FILTER.APPCODE.BPM" :
				strSettingName = "strFilterAppcodeBPM";
				break;
		}

		
		if(strSettingName!="")
		{
			var strSetting = "";
			if(strSettingValue!="")
			{
				arrSettingValue = strSettingValue.split("|");
				for (var x=0;x<arrSettingValue.length;x++)
				{
					var thisValue = arrSettingValue[x];
					if(thisValue=="![CURRENT.DD]!")
					{
						//thisValue = app.session.dataDictionary;
						thisValue = app.itsm.get_session_param("datasetFilterList");
					}
						
					if(strSetting!="")strSetting += ",";
					//-- nwj - no need to prepare as don on server now
					//strSetting += "'"+app.g.pfs(thisValue)+"'";
					strSetting += thisValue;
				}
			}
			// set the value to that in the settings area
			oSettings.set_setting(strSettingName, strSetting);
		}
	}
	oSettings.set_setting("boolFilterAppcodeBPMLoaded",true);
}
//--
//-- wrappers for easy webclient migration - place in app.global.js of application
//-- 
//-- if you use these wrappers then you will not need to alter alot of the js for the webclient when you do customisations in the fullclient
//--
//--
//-- set elements value
//-- usage _eva(tb_custid,'neilwj');
underscore.prototype.eva = _eva;
function old_eva(oEle,varValue)
{
	_eva(oEle , varValue);
}

//-- set elements text
//-- usage _ete(tb_custid,'neilwj');
underscore.prototype.ete = _ete;
function old_ete(oEle,varValue)
{
	_ete(oEle , varValue);
}

//-- enable / disable an ele
//-- usage _een(tb_custid,true); / _een(tb_custid,false); / _een(mainform.tb_custid,true);
underscore.prototype.een = _een;
function old_een(oEle,boolEnable)
{
	_een(oEle , boolEnable);
}

//-- readonly an ele
//-- usage _ero(tb_custid,true); / _ero(tb_custid,false); / _ero(mainform.tb_custid,true);
underscore.prototype.ero = _ero;
function old_ero(oEle,boolRO)
{
	_ero(oEle , boolRO);
}

//-- mand an ele
//-- usage _ema(tb_custid,true); / _ema(tb_custid,false); / _ema(mainform.tb_custid,true);
underscore.prototype.ema = _ema;
function old_ema(oEle,boolMandatory)
{
	_ema(oEle , boolMandatory);
}

//-- visible an ele
//-- usage _evi(tb_custid,true); / _evi(tb_custid,false); / _evi(mainform.tb_custid,true);
underscore.prototype.evi = _evi;
function old_evi(oEle,boolVisible)
{
	_evi(oEle , boolVisible);
}

//-- set image
underscore.prototype.eim = _eim;
function old_eim(oEle, strURI)
{
	_eim(oEle , strURI);
}

//-- set color
underscore.prototype.ecol = _ecol;
function old_ecol(oEle, strCol)
{
	oEle.colour = strCol;
}

//-- set menutext
underscore.prototype.emt = _emt;
function old_emt(oEle, varValue)
{
	_emt(oEle , varValue);
}

//-- set menutext
underscore.prototype.ewi = _ewi;
function old_ewi(oEle, intWidth)
{
	_ewi(oEle , intWidth);
}

//--
//-- sqllist specific properties wrappers

//-- set filter
underscore.prototype.slf = _slf;
function old_slf(oEle, strFilter)
{
	_slf(oEle ,strFilter);
}

//-- set rawsql
underscore.prototype.slraw = _slraw;
function old_slraw(oEle, strSQL)
{
	MessageBox("WARNING _slraw is setting rawSql for SqlListTable ("+oEle.name+"). This should be changed to use a stored query. Please contact your Administrator");
	_slraw(oEle ,strSQL);
}

//-- set path
underscore.prototype.flp = _flp;
function old_flp(oEle, strPath)
{
	_flp(oEle , strPath);
}


//--
//-- tab specific property wrappers
underscore.prototype.etab = _etab;
function old_etab(oEle,nTab)
{
    _etab(oEle , nTab);
}

// -- SG, 02/07/2012, F0103324
// Output CI's/Services and bespoke terms where appropriate	
function bespokeTermsProcessing(strCIs, itemType)
{
	var arrayCiIDs = strCIs.split(",");	
	if(itemType==undefined)
		itemType = "Configuration Item";
	var countBespokeTerms = 0;
	bespokeTermsArray = [];		

	for (var x=0;x<arrayCiIDs.length;x++)
    {
        var pk_ci_id = arrayCiIDs[x];	
        if(pk_ci_id>0)
        {
        	var rec = app.g.get_record("config_itemi", pk_ci_id);
 			if(rec.recordresolvedmsg != '')
			{
    			bespokeTermsArray[countBespokeTerms] = new Array(2);
    			bespokeTermsArray[countBespokeTerms][0] = rec.ck_config_item;
    			bespokeTermsArray[countBespokeTerms][1] = rec.recordresolvedmsg;
    			countBespokeTerms++;
			}
		}
	}	
	
	// -- SG, 02/07/2012, F0103324
	bespokeTermsOutput(bespokeTermsArray, arrayCiIDs.length, itemType);
}
// Output CI's/Services and bespoke terms where appropriate	
function bespokeTermsOutput(bespokeTermsArray, totalCIs, recordType)
{
	if(bespokeTermsArray.length == 1 && totalCIs == 1)
	{
		var msgOutput = "Your selected " + recordType + " has Bespoke Terms associated with it:\n\n" + recordType +": " + bespokeTermsArray[0][0] + "\n\n" + bespokeTermsArray[0][1];
		MessageBox(msgOutput, MB_OK|MB_ICONINFORMATION);
	}
	else if(bespokeTermsArray.length == 1 && totalCIs > 1)
	{
		var msgOutput = "1 of your " + totalCIs + " selected " + recordType +"s has Bespoke Terms associated with it:\n\n" + recordType +": " + bespokeTermsArray[0][0] + "\n\n" + bespokeTermsArray[0][1];
		MessageBox(msgOutput, MB_OK|MB_ICONINFORMATION);
	}
	else if(bespokeTermsArray.length > 1)
	{	
		for (var x=0;x<bespokeTermsArray.length;x++)
		{
			var numCI = x+1;
			
			if(numCI != bespokeTermsArray.length)
			{
				var CIMessage = bespokeTermsArray.length + " of your " + totalCIs + " selected "+ recordType +"s have Bespoke Terms associated with them.";
				CIMessage += "\n\n" + recordType + " " + numCI + " of " + bespokeTermsArray.length + ":\n\n";
				CIMessage += recordType + ": " + bespokeTermsArray[x][0];
				CIMessage += "\n\n" + bespokeTermsArray[x][1];
				CIMessage += "\n\n" + "Do you wish to display the next record?";
				if (MessageBox(CIMessage, MB_YESNO|MB_ICONINFORMATION) == 7)
				{
					x = bespokeTermsArray.length;   
				}
			}
			else
			{
				var CIMessage = bespokeTermsArray.length + " of your " + totalCIs + " selected " + recordType + "s have Bespoke Terms associated with them.";
				CIMessage += "\n\n" + recordType + " " + numCI + " of " + bespokeTermsArray.length + ":\n\n";
				CIMessage += recordType + ": " + bespokeTermsArray[x][0];
				CIMessage += "\n\n" + bespokeTermsArray[x][1];
				MessageBox(CIMessage, MB_OK|MB_ICONINFORMATION);
			}
		}
	}
}
// END OF CI BESPOKE TERMS OUTPUT


//-- create a global constructor
//-- so developer can reference setting functions using
//-- oSettings.functionname;
function fsetting()
{
	//-- This is a global container
	this.boolServiceCIBehaviourOnIncident = false;
	this.boolServiceCIBehaviourOnServiceRequest = false;
	this.boolIncidentSLABehaviourOnCI = false;
	this.boolBPMTaskCIDriven = false;
	//###20120704
	this.boolOnHoldNotification = false;
	this.boolNotificationFullCache = false;
	this.boolSearchMultiOrganisation = false;
	this.boolSearchMultiSite = false;

	//-- DJH: 20120508 Connector Global Parameters. These are set in load_connector_settings()
	this.bConnectorEnabled = "";
	this.strConnectorLookupField = "";
	this.strConnectorURL = "";

	//-- DJH: 20120516 Knowledgebase Global Parameters.  These are set in load_knowledgebase_settings()
	this.strKnowledgebaseDefaultTool = "Supportworks";
	this.strKnowledgebaseToolPortalURL = "";
	this.strKnowledgebaseToolSolutionURL = "";

	//-- DTH: 20120120 Change Management Global Parameters. These are set in load_change_settings()
	this.strChangeABAMailbox = "";
	this.strChangeABAMailTemplate = "";

	//-- DTH: 20120130 F0097668 Impact Level Assessment (ILA) global paramters
	this.boolIlaChangeLogCallEnabled = false;
	this.boolIlaChangeLogCallMandatory = false;
	this.boolIlaChangeLogCallAllowAlteration = false;
	this.boolIlaChangeLogCallEnforceEachCriterion = false;
	this.boolIlaChangeDetailsDiaryOnILAChange = false;

	// default the values to use current data dictionary
	this.boolFilterAppcodeSLALoaded = false;
	//-- nwj - removed pfs as not needed as pfs is performed on the server - 23.11.2012
	
	strCurDS = itsm_get_session_param("dataset");
	
	this.strFilterAppcodeSLA = strCurDS;
	this.strFilterAppcodeSLACalls =strCurDS;
	this.strFilterAppcodeSLAEntities = strCurDS;
	this.strFilterAppcodeSLAContract = strCurDS;
	this.strFilterAppcodeOLA = strCurDS;
	this.strFilterAppcodeSLR = strCurDS;
	this.strFilterAppcodeSLACMDB = strCurDS;
	this.strFilterAppcodeSLAService = strCurDS;
	this.strFilterAppcodeSLAOLA = strCurDS;

	this.boolFilterAppcodeBPMLoaded = false;
	this.strFilterAppcodeBPM = strCurDS;

	this.boolChangeHideFromFSCDefault = false;
	
	//-- 108840: On logging required CIs global parameters
	this.intIncidentOnLoggingRequiredCINo = false;
	this.intProblemOnLoggingRequiredCINo = false;
	this.intChangeOnLoggingRequiredCINo = false;
	this.intReleaseOnLoggingRequiredCINo = false;
	
	//-- 1088464: CI Assessment level global parameters
	this.intIncidentUseCIAssessmentLevels = false;
	this.intProblemUseCIAssessmentLevels = false;
	this.intKnownErrorUseCIAssessmentLevels = false;
	
	//-- TK Paging
	this.sysSqlPaging = false;
	
	//--TK Used if Loading QA Times
	this.qatime = false;
	
	//-- CMDB Media Library
	this.CMDBMediaServerRoot = "";
}
var oSettings = new fsetting();

fsetting.prototype.load_settings = st_load_settings;

function st_load_settings()
{
	//F0109970 - ES - Call generic function to load relevant setting in sw_settings
	this.load_sw_settings();
}

fsetting.prototype.get_setting = st_get_setting;
function st_get_setting(strSettingName)
{
	if(strSettingName==undefined) return false;
	if(this[strSettingName]==undefined) return false;
	return this[strSettingName];
}

fsetting.prototype.set_setting = st_set_setting;
function st_set_setting(strSettingName, strValue)
{
	if(strSettingName==undefined) return "";
	this[strSettingName] = strValue;
	return true;
}

//F0109970 - ES - Added a generic function to load all sw_settings and case each relevant setting
fsetting.prototype.load_sw_settings = fsetting_load_sw_settings;
function fsetting_load_sw_settings()
{
	var oRS = app.g.get_sqrecordset("general/sw_settings");
	while(oRS.Fetch())
	{
		var strSettingValue = "";
		var strPkSetting = "";
		strSettingValue = app.g.get_field(oRS,"setting_value");
		strPkSetting = app.g.get_field(oRS,"setting_name");

		switch (strPkSetting)
		{
			case "RLA.CHANGELOGFORM.ALLOWALTERATION" :
				boolRLAChangeLogFormAllowAlteration = strSettingValue;
				oSettings.set_setting("boolRLAChangeLogFormAllowAlteration", strSettingValue);
			break;
			case "RLA.CHANGELOGFORM.MANDATORY" :
				boolRLAChangeLogFormMandatory = strSettingValue;
				oSettings.set_setting("boolRLAChangeLogFormMandatory", strSettingValue);
			break;
			case "RLA.CHANGELOGFORM.ENABLE" :
				boolRLAChangeLogFormEnable = strSettingValue;
				oSettings.set_setting("boolRLAChangeLogFormEnable", strSettingValue);
			break;	
			case "RLA.RELEASELOGFORM.ALLOWALTERATION" :
				boolRLAReleaseLogFormAllowAlteration = strSettingValue;
				oSettings.set_setting("boolRLAReleaseLogFormAllowAlteration", strSettingValue);
			break;
			case "RLA.RELEASELOGFORM.MANDATORY" :
				boolRLAReleaseLogFormMandatory = strSettingValue;
				oSettings.set_setting("boolRLAReleaseLogFormMandatory", strSettingValue);
			break;
			case "RLA.RELEASELOGFORM.ENABLE" :
				boolRLAReleaseLogFormEnable = strSettingValue;
				oSettings.set_setting("boolRLAReleaseLogFormEnable", strSettingValue);
			break;
			case "CMDB.Media_Library" :
				oSettings.set_setting("CMDBMediaServerRoot", strSettingValue);
			break;
			case "SERVICEDESK.SUMMARY_FROM_EMAIL" :
				oSettings.set_setting("boolUseSubjectasSummary", strSettingValue);
			break;
			case "ORGANISATION.ORGANISATION_SUPPORTEDBY" :
				oSettings.set_setting("strOrgSupportedbyWarningDays", strSettingValue);
			break;
			
			case "SYS.SQL.Paging" :
					oSettings.set_setting("sysSqlPaging", strSettingValue);
			break;
			
			case "QA.DEBUG.TIME" :
					oSettings.set_setting("qatime", strSettingValue);
			break;

			case "SEARCH.CUSTOMERS.MULTI_ORGANISATION" :
				boolSearchMultiOrganisation = ('true' == strSettingValue.toLowerCase());
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolSearchMultiOrganisation", boolValue);
			break;
			
			case "SEARCH.CUSTOMERS.MULTI_SITE" :
				boolSearchMultiSite = ('true' == strSettingValue.toLowerCase());
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolSearchMultiSite", boolValue);
			break;
			
			case "CHANGE.AFFECTEDBUSINESSAREA.MAILBOX" :
				strChangeABAMailbox = strSettingValue;
				oSettings.set_setting("strChangeABAMailbox", strSettingValue);
			break;
			
			case "CHANGE.AFFECTEDBUSINESSAREA.EMAILTEMPLATE" :
				strChangeABAMailTemplate = strSettingValue;
				oSettings.set_setting("strChangeABAMailTemplate", strSettingValue);
			break;

			case "CHANGE.HIDEFROMFSC.DEFAULT" :
				if(strSettingValue=="True")
					oSettings.set_setting("boolChangeHideFromFSCDefault", true);
			break;
			
			case "NOTIFICATION.ON_HOLD" :
				boolOnHoldNotification = ('true' == strSettingValue.toLowerCase());
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolOnHoldNotification", boolValue);
			break;
			
			case "BPM.TASK.CI_DRIVEN" :
				boolBPMTaskCIDriven = ('true' == strSettingValue.toLowerCase());
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolBPMTaskCIDriven", boolValue);
			break;
			
			case "INCIDENT.SLA_BEHAVIOUR.CI_FILTERED" :
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolIncidentSLABehaviourOnCI", boolValue);
			break;
			
			case "SERVICE.CI_BEHAVIOUR.INCIDENT" :
				boolServiceCIBehaviourOnIncident = ('true' == strSettingValue.toLowerCase());
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolServiceCIBehaviourOnIncident", boolValue);
			break;
			
			case "SERVICE.CI_BEHAVIOUR.SERVICEREQUEST" :
				boolServiceCIBehaviourOnServiceRequest = ('true' == strSettingValue.toLowerCase());
				var boolValue =  'true' == strSettingValue.toLowerCase();
				oSettings.set_setting("boolServiceCIBehaviourOnServiceRequest", boolValue);
			break;
			
			case "KNOWLEDGE.DEFAULT_TOOL" :
				strKnowledgebaseDefaultTool = strSettingValue;
				oSettings.set_setting("strKnowledgebaseDefaultTool", strSettingValue);
			break;

			case "KNOWLEDGE.RIGHTANSWERS.PORTAL_URL" :
				strKnowledgebaseToolPortalURL = strSettingValue;
				oSettings.set_setting("strKnowledgebaseToolPortalURL", strSettingValue);
			break;

			case "KNOWLEDGE.RIGHTANSWERS.SOLUTION_URL" :
				strKnowledgebaseToolSolutionURL = strSettingValue;
				oSettings.set_setting("strKnowledgebaseToolSolutionURL", strSettingValue);
			break;
			
			case "CONNECTOR.ENABLED" :
				bConnectorEnabled = strSettingValue=="True";
				oSettings.set_setting("bConnectorEnabled", strSettingValue);
			break;
			
			case "CONNECTOR.LOOKUP_FIELD" :
				strConnectorLookupField = strSettingValue;
				oSettings.set_setting("strConnectorLookupField", strSettingValue);
			break;

			case "CONNECTOR.URL" :
				strConnectorURL = strSettingValue;
				oSettings.set_setting("strConnectorURL", strSettingValue);
			break;
			
			case "ILA.CHANGELOGCALL.ENABLED" :
				boolIlaChangeLogCallEnabled = strSettingValue;
				oSettings.set_setting("boolIlaChangeLogCallEnabled", strSettingValue);
			break;
			
			case "ILA.CHANGELOGCALL.MANDATORY" :
				boolIlaChangeLogCallMandatory = strSettingValue;
				oSettings.set_setting("boolIlaChangeLogCallMandatory", strSettingValue);
			break;
			
			case "ILA.CHANGELOGCALL.ALLOWALTERATION" :
				boolIlaChangeLogCallAllowAlteration = strSettingValue;
				oSettings.set_setting("boolIlaChangeLogCallAllowAlteration", strSettingValue);
			break;
			
			case "ILA.CHANGELOGCALL.ENFORCEEACHCRITERION" :
				boolIlaChangeLogCallEnforceEachCriterion = strSettingValue;
				oSettings.set_setting("boolIlaChangeLogCallEnforceEachCriterion", strSettingValue);
			break;
			
			case "ILA.CHANGECALLDETAILS.DIARYONILACHANGE" :
				boolIlaChangeDetailsDiaryOnILAChange = strSettingValue;
				oSettings.set_setting("boolIlaChangeDetailsDiaryOnILAChange", strSettingValue);
			break;
			
			case "BPM.RELEASE.ENABLE_READY_FOR_RELEASE" :
				var boolValue =  ('true' == strSettingValue.toLowerCase());
				oSettings.set_setting("boolBpmReleaseEnableReadyForRelease", boolValue);
			break;
			
			case "CMDB.BASELINE_PARENT" :
				var boolValue =  ('true' == strSettingValue.toLowerCase());
				oSettings.set_setting("boolCMDBBaselineParent", boolValue);
			break;

			case "BPM.GPDINTEGRATION.ENABLED" :
				var boolValue =  ('true' == strSettingValue.toLowerCase());
				oSettings.set_setting("boolBPMGPDIntegrationEnabled", boolValue);
			break;
			
			case "KNOWLEDGE.PREVIEW.ENABLED" :
				var boolValue =  ('true' == strSettingValue.toLowerCase());
				oSettings.set_setting("boolKnowledgePreviewEnable", boolValue);
			break;
		}
	}
}
//End F0109970

fglobal.prototype.get_audit_exclusions = pt_get_audit_exclusions;
function pt_get_audit_exclusions()
{
	return "opencall.itsm_sladef|opencall.itsm_slaname|opencall.priority|opencall.profile|opencall.status|opencall.fk_company_id|opencall.companyname|opencall.cust_id";
}

//-- F0105434 - refactor code to global js
fglobal.prototype.get_default_process = fglobal_get_default_process;
function fglobal_get_default_process(doc,strCallclass,oDropdown, oLabel)
{
	//-- if there is default process in the dd, load
	//-- 89700 - load default BPM from db table 
	//-- RJC F0105434 - load setting for current data dictionary
	var strParams = "table=sys_sett_defbpm&_swc_pk_callclass=" + pfu(strCallclass)+"&_ac=true";
	var oRS = app.g.get_sqrecordset("select.tablebycol",strParams);
	if(oRS.Fetch())
	{
		var strProcess = oRS.GetValueAsString('fk_def_bpm');
		if(strProcess!="")
		{
			var strParams = "wf="+pfu(strProcess)+"&cls="+pfu(strCallclass);
			var intCount = app.global.StoredQueryExecute("count/active_bpm_processes",strParams,true);
			if(intCount>0)
			{
				var boolLoaded = doc.ResolveRecord("bpm_workflow", "pk_workflow_id", strProcess);
				if(!boolLoaded)
				{
					_evi(oDropdown,true);
					_evi(oLabel,true);
				}
			}
			else
			{
				var strParams = "cls="+pfu(strCallclass);
				var intCount = app.global.StoredQueryExecute("count/active_bpm_processes",strParams,true);
				if(intCount>0)
				{
					_evi(oDropdown,true);
					_evi(oLabel,true);
				}
			}
		}
	}
	else
	{
		var strParams = "cls="+pfu(strCallclass);
		var intCount = app.global.StoredQueryExecute("count/active_bpm_processes",strParams,true);
		if(intCount>0 || oDropdown.mandatory)
		{
			_evi(oDropdown,true);
			_evi(oLabel,true);
		}
	}
}

fglobal.prototype.check_sla_response_flag = fglobal_check_sla_response_flag;
function fglobal_check_sla_response_flag(strCallrefs, eleSLAResponse)
{
	var strCurrentSLARespondedTo = "0";
	//--
	//-- NWJ - 14.02.2006 - by default set to hidden. We will show if it needs responding to.		
	//-- if the logged-in analyst does not have permission to change call status, then they cannot mark this as SLA response
	_een(eleSLAResponse,false);
	if(app.session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS))
	{
		//F0094940 Mark SLA response flag 
		//-- make sure the flag is visible
		_evi(eleSLAResponse,true);
				
		//-- if the calls have not been responded to previously, then give the analyst the option of marking this as the SLA response	
		var strParams = "crs=" + strCallrefs;
		var nCount = this.sqs_rowcount("count/calls.slarespzero",strParams);
		if(nCount>-1)
		{
			if(nCount > 0)
			{
				_een(eleSLAResponse,true);
			}
			else
			{
			    //F0094940 Mark SLA response flag 
			    _eva(eleSLAResponse,1);
				strCurrentSLARespondedTo = "1";
			}
		}
	}
	else
	{
		//-- they do not have permission so hide the field
		_evi(eleSLAResponse,false);
	}
	return 	strCurrentSLARespondedTo;
}

fglobal.prototype.attach_message_to_call = fglobal_attach_message_to_call;
function fglobal_attach_message_to_call(oDocForm, strCallref, strUpdateIndex, strDestFolderSettingName)
{
	// The message source string contains the "mailbox name\message id". We need 
	// to split these out for the following function
	var arrMsgInfo = oDocForm.messagesource.split('\\');
	
	// Check config to see if we need to include the file attachments in the message too
	var bIncludeAttachments = dd.GetGlobalParamAsNumber("Email Audit Trail/IncludeAttachmentsInMessage");
	
	// We need to specify the folder to which the message should be moved to based
	// on the options set in the DD. 
	var strMoveMessageToFolder = "";
	
	// Next, see if we have specified a specific folder to move the message to
	var strDestFolderSettingPath = "Mail Move Folders/" + strDestFolderSettingName;
	strMoveMessageToFolder = dd.GetGlobalParamAsString(strDestFolderSettingPath);
	
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
	if(oDocForm.subject)
	{
		strEmailSubject = app.g.replaceIllegalFileCharacters(oDocForm.subject);
	}//end if there is a subject line
	
	// The following function does a number of things. It tells the server to encode
	// and attach the specified message to the call. It sets the state icon of the 
	// call update to "mail-received" in this instace. If the strMoveMessageToFolder
	// contains a valid folder, it will move the specified mail message to the folder
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("mailbox", arrMsgInfo[0]);		
	xmlmc.SetValue("messageId", arrMsgInfo[1]);		
	xmlmc.SetValue("fileName", "Received-" + strEmailSubject + ".swm");		
	xmlmc.SetValue("callRef", strCallref);	
	xmlmc.SetValue("udIndex", strUpdateIndex);		
	xmlmc.SetValue("attachType", "mail-received");		
	xmlmc.SetValue("includeAttachments", bIncludeAttachments);
	if(strMoveMessageToFolder!="")
	{
		var mailxmlmc = new XmlMethodCall();
		mailxmlmc.SetValue("mailbox", arrMsgInfo[0]);
		mailxmlmc.SetValue("folderPath", strMoveMessageToFolder);
		if(mailxmlmc.Invoke("mail","getFolderFromPath"))
		{
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
					var intFolderId = myXmlFile.methodCallResult.params.folderId.nodeValue;
					xmlmc.SetValue("moveMessageToFolderId", intFolderId);
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
global_init_configuration();

//-- 108840 & 108864: Function added
/**
 * Function : load_system_setting
 * Description : Loads the specified system setting for the specified callclass into global variable
 * Params :
 *	strSetting	- string: system setting to load
 * 	strCallType	- string: callclass the setting is for
 * Returns : boolean: true if setting found
 */
fglobal.prototype.load_system_setting = fglobal_load_system_setting;
function fglobal_load_system_setting(strSetting ,strCallType)
{
	var strParams ="ps=" + strSetting + "." +strCallType;
	var oRS = app.g.get_sqrecordset("general/sw_settings.selectlike",strParams);

	if(oRS.Fetch())
	{
		switch (strSetting)
		{
			case "APP.USE_CI_ASSESSMENT_LEVELS" :
				strSettingName = "UseCIAssessmentLevels";
				break;
			case "APP.ON_LOGGING_REQUIRED_CI_NO" :
				strSettingName = "OnLoggingRequiredCINo";
				break;
		}
		var intUCIAL = app.g.get_field(oRS,"setting_value");
		oSettings.set_setting("int" + strCallType + strSettingName, intUCIAL);
		return true;
	}
	return false;
}

//-- 108840: Modified function to check number of CIs required
oITSM.prototype.mandatory_ci_check = itsm_mandatory_ci_check;
function itsm_mandatory_ci_check(strCallType, intCurCINo)
{
	if(!oSettings.get_setting("int" + strCallType + "OnLoggingRequiredCINo"))
	{
		app.g.load_system_setting("APP.ON_LOGGING_REQUIRED_CI_NO",strCallType);
	}
	var intReqCINo = oSettings.get_setting("int" + strCallType + "OnLoggingRequiredCINo");
	if (intCurCINo < intReqCINo)
	{
		return false;
	}
	return true;
}

//-- 124775: Function added
/**
 * Function : get_subscription_id
 * Description : Returns the subscription ID
 * Params :
 * 	intServiceID - integer: ID of service the subscription is for
 *  strEntityID - string: ID of the entity subscribed to the service
 * Returns : int: Primry key of the subscription record. -1 if not found.
 */
oITSM.prototype.get_subscription_id = itsm_get_subscription_id;
function itsm_get_subscription_id(intServiceID, strEntityID)
{	
	var arrCols = [];
	arrCols.FK_ME_KEY = strEntityID;
	arrCols.FK_SERVICE = intServiceID;
	var oSubscription = app.g.get_tablerecordset_bycol("SC_SUBSCRIPTION",arrCols);
	if (oSubscription.Fetch())
	{
		return app.g.get_field(oSubscription,"PK_ID");
	}
	return -1;
}

//-- 124775: Function added
/**
 * Function : service_has_sla
 * Description : Returns true if passed in service has at lease 1 SLA associated
 * Params :
 * 	intServiceID - integer: ID of service to check
 * Returns : boolean: True if passed in service has SLA, false if not
 */
oITSM.prototype.service_has_sla = itsm_service_has_sla;
function itsm_service_has_sla(intServiceID)
{	
	var arrCols = [];
	arrCols.FK_SERVICE = intServiceID;
	var oSLA = app.g.get_tablerecordset_bycol("SC_SLA",arrCols);
	if (oSLA.Fetch())
	{
		return true;
	}
	return false;
}

//-- 125567: Function added
/**
 * Function : get_session_param
 * Description : gets the value of the passed in session parameter from sessioninfo2
 * Params :
 * 	strParam - string: name of parameter who's value will be returned
 * Returns: value of passed in parameter or empty string if param not found
 */
oITSM.prototype.get_session_param = itsm_get_session_param;
function itsm_get_session_param(strParam)
{	
	var xmlmc = new XmlMethodCall();
	xmlmc.SetValue("sessionId", app.session.sessionId);	
	if(xmlmc.Invoke("session","getSessionInfo2"))
	{
		var strXML = xmlmc.GetReturnXml();
		var myXmlFile = new XmlFile(); 
		bRet = myXmlFile.loadFromString(strXML);
		if(bRet)
		{
			return myXmlFile.methodCallResult.params[strParam].nodeValue;
		}
	}
	return "";
}

//-- 124775: Function added
/**
 * Function : subscribe_entity
 * Description : Creates subscription record for passsed in entity to passed in service
 * Params :
 * 	oService - object: service entity is to be subscribed to.
 *  oEntity - object: entity subscription id for.
 *  strType - string: Type of subscripion.
 */
oITSM.prototype.subscribe_entity = itsm_subscribe_entity;
function itsm_subscribe_entity(oService, oEntity, strType)
{	
	if (strType=="Customer")
	{
		var strKeyValue = oEntity.keysearch;
		var strDisplayValue = oEntity.fullname;
		var strTable = "userdb";
		var strParentType = "ME->CUSTOMER";
	}
	else if (strType=="Organisation")
	{
		var strKeyValue = oEntity.pk_company_id;
		var strDisplayValue = oEntity.companyname;
		var strTable = "company";
		var strParentType = "ME->COMPANY";
	}
	else if (strType=="Department")
	{
		var strKeyValue = oEntity.pk_dept_code;
		var strDisplayValue = oEntity.dept_name;
		var strTable = "department";
		var strParentType = "ME->DEPARTMENT";
	}

	//-- create subscription record
	var arrSSCols = [];
	arrSSCols.FK_ME_KEY = strKeyValue;
	arrSSCols.FK_ME_TABLE = strTable;
	arrSSCols.TYPE = strType;
	arrSSCols.FK_ME_DISPLAY = strDisplayValue;
	arrSSCols.FK_SERVICE = oService.fk_cmdb_id;
	arrSSCols.FLG_CHARGABLE = 1;
	arrSSCols.UNITS = 0;
	arrSSCols.UNIT_CHARGE = "";
	arrSSCols.MARK_UP = 0;
	arrSSCols.TOTAL_CHARGE = "";
	arrSSCols.START_DATEX = 0;
	arrSSCols.CHARGE_TYPE = "";
	arrSSCols.REL_TYPE = "SUBSCRIPTION";
	arrSSCols.REQUEST_PRICE = "0.00";
	arrSSCols.SUBSCRIPTION_PRICE = "0.00";
	var strSubParams = "";
	for(strCol in arrSSCols)
	{
		strSubParams += "&_swc_" + LC(strCol) +"=" + pfu(arrSSCols[strCol]);
	}
	app.g.submitsqs("service/add_subscription.insert",strSubParams);
	
	//-- create cmdb realtionship	
	var arrCRCols = [];
	arrCRCols.parentKey = oEntity.fk_cmdb_id;
	arrCRCols.parentType = strParentType;
	arrCRCols.parentText = strKeyValue;
	arrCRCols.childKey =  oService.fk_cmdb_id;
	arrCRCols.childType = "ME->SERVICE";
	arrCRCols.childText = oService.service_name;
	arrCRCols.strDependancy = "Subscribes To";
	arrCRCols.ynOperational = "Yes";
	arrCRCols.strParentDesc = strDisplayValue;
	arrCRCols.strChildDesc = oService.vsb_title;
	arrCRCols.boolOption = false;
	var strParams = "";
	for(strCol in arrCRCols)
	{
		strParams += "&" + strCol +"=" + pfu(arrCRCols[strCol]);
	}
	app.g.submitsqs("service/insert_configrelation",strParams);	
}

//-- 124775: Function added
/**
 * Function : subscription_actions_OnMenuItem
 * Description : Code for OnMenuItem event of the actions button used for
 * service subscriptions on the org, cust and department forms.
 * Params :
 * 	strName - string: name of action selected
 * 	nItemID - string: number of action selected
 * 	strType - string: type of subscription i.e. the form this is called from
 * 	oList - object: SQL list on from that displays subscriptions
 * 	oEntity - object: Entity that the service subscription relates to
 */
oITSM.prototype.subscription_actions_OnMenuItem = itsm_subscription_actions_OnMenuItem;
function itsm_subscription_actions_OnMenuItem(strName, nItemID, strType, oList, oEntity)
{	
	var strListKeyColumn = "PK_AUTO_ID";
	if (strType=="Customer")
	{
		var strKeyValue = oEntity.keysearch;
		var strDisplayValue = oEntity.fullname;
	}
	else if (strType=="Organisation")
	{
		var strKeyValue = oEntity.pk_company_id;
		var strDisplayValue = oEntity.companyname;
	}
	else if (strType=="Department")
	{
		var strKeyValue = oEntity.pk_dept_code;
		var strDisplayValue = oEntity.dept_name;
		strListKeyColumn = "FK_CMDB_ID";
	}
	
	var iAssociate = 1;
	var iDisassociate = 2;	
	var iViewSubscription = 3;
	
	if (nItemID == iAssociate)
	{
		//-- launch the search for services form
		var strURL = "searchmode=1&multiselect=1";
		var objFormDoc = this;
		app.g.popup("search_service",strURL,function(aForm)
		{
			//-- capture selected service keys
			if (aForm)
			{
				if (IsObjectDefined("_bHtmlWebClient"))
				{
					var _swdoc = top;
					var strSelectedkeys = aForm._swdoc.strSelectedKeys;
					if (aForm._swdoc.strSelectedKeys == "")
					{
						return false;
					}
				}
				else
				{
					var strSelectedkeys = aForm.document.strSelectedKeys;
					if (aForm.document.strSelectedKeys == "")
					{
						return false;
					}
				}
				var arrSelectedkeys = strSelectedkeys.split(",");
				
				//-- get already subscribed keys
				var strSubscribed = "";
				var arrCols = [];
				arrCols.FK_ME_KEY = strKeyValue;
				arrCols.REL_TYPE = "SUBSCRIPTION";
				var oSubscribed = app.g.get_tablerecordset_bycol("SC_SUBSCRIPTION",arrCols);		
				
				var intSubscriptionCounter = 0;
				var arrSubscribedKeys = [];
				while (oSubscribed.Fetch())
				{
					arrSubscribedKeys[intSubscriptionCounter] = app.g.get_field(oSubscribed,"FK_SERVICE");
					intSubscriptionCounter++;
				}
				//-- for each selected app.service... check if already subscribed to service
				var boolAlert = false;
				var boolSubscribed = false;
				var strNoSLAs = "";
				for (var i = 0, len1 = arrSelectedkeys.length; i < len1; i++)
				{
					boolSubscribed = false;
					//-- for each Subscribed app.service...
					for (var j = 0, len2 = arrSubscribedKeys.length; j < len2; j++)
					{
						if (arrSelectedkeys[i] == arrSubscribedKeys[j])
						{
							boolSubscribed = true;
							//-- already subscribed to this service so skip to next service
							break;
						}
							
					}
					if (!boolSubscribed)
					{
						//-- load service record
						var oService = app.g.get_record("SC_FOLIO", arrSelectedkeys[i]);
						
						//-- Check that service has at least one associated SLA. 
						if (!objFormDoc.service_has_sla(arrSelectedkeys[i]))
						{
							if(strNoSLAs!="")strNoSLAs+="\n";
							strNoSLAs+=oService.vsb_title;
							boolAlert = true;
						}
						else //-- Subscribe entity to service
						{
							objFormDoc.subscribe_entity(oService, oEntity, strType);
						}
					}
				}
				if (boolAlert)
				{
					MessageBox("Please associate service levels that the following services can be offered at before creating subscriptions:\n\n" + strNoSLAs);
				}
			}
			else
			{
				return false;
			}
		});
	}
	else if (nItemID == iDisassociate)
	{
		if (oList.curSel < 0)
		{
			MessageBox("No subscription selected.");
			return false;
		}
		//-- get selected keys
		var strSelectedkeys = app.g.sl_getselected_valuesdel(oList,strListKeyColumn,",");
		var arrSelectedkeys = strSelectedkeys.split(",");
		var intArrLen = arrSelectedkeys.length;
		var strPlural = (intArrLen > 1 ? "s" : "");
		var strConfirm = "Are you sure you want to remove the selected subscription" + strPlural + " for this " + LC(strType) + "?";
		if (confirm(strConfirm))
		{
			for (var i = 0, intArrLen; i < intArrLen; i++)
			{
				//-- get subscription ID
				var intSubscriptionId = this.get_subscription_id(arrSelectedkeys[i],strKeyValue);
				//-- delete subscription
				var strParams = "key="+pfu(intSubscriptionId);
				app.g.submitsqs("service/process/delete_subscription", strParams);
			}
		}
	}
	else if (nItemID == iViewSubscription)
	{
		if (oList.curSel < 0)
		{
			MessageBox("No subscription selected.");
			return false;
		}
		//-- get selected service ID
		var intServiceId = app.g.sl_getprikeyvalue(oList, oList.curSel);
		//-- get subscription ID	
		var intSubscriptionId = this.get_subscription_id(intServiceId,strKeyValue);
		//-- open subscription form
		app.OpenFormForEdit('service_subscription',intSubscriptionId,"",true);
	}
}

//-- 108840: Function added
/**
 * Function : get_ci_assessmnet_level_setting
 * Description : Returns the system setting "APP.USE_CI_ASSESSMENT_LEVELS"
 * Params :
 * 	strCallType - string: callclass the setting is for
 * Returns : int: CI assessment levels setting value
 */
 oITSM.prototype.get_ci_assessmnet_level_setting = itsm_get_ci_assessmnet_level_setting;
function itsm_get_ci_assessmnet_level_setting(strCallType)
{
	if(!oSettings.get_setting("int" + strCallType + "UseCIAssessmentLevels"))
	{
		app.g.load_system_setting("APP.USE_CI_ASSESSMENT_LEVELS",strCallType);
	}
	return oSettings.get_setting("int" + strCallType + "UseCIAssessmentLevels");
}
// -- Function to get CurrentSkinColorSchema from Supportworks Client registry
fglobal.prototype.get_CurrentSkinColorSchema = fglobal_get_CurrentSkinColorSchema;
function fglobal_get_CurrentSkinColorSchema()
{
	// -- Check for Web Client
	if(app.bWebClient)
		return 0;
	
	// -- Get the version of Supportworks Server
	var strServerVersion = "";
	var xmlmc = new XmlMethodCall();
	// -- Get productVersion through system::getSystemInfo XMLMC API
	if(xmlmc.Invoke("system","getSystemInfo"))
	{
		strServerVersion = xmlmc.GetReturnValue("productVersion"); // -- Set string to productVersion value
	}
	else
	{
		strServerVersion = "8.0.0"; // -- Default to 8.0.0
	}

	// -- Get registry value for CurrentSkinColorSchema in Supportworks Client (on User's machine, hence why we use RegGetDword())
	var strPath = "HKCU\\SOFTWARE\\Hornbill\\Supportworks Client "+strServerVersion+"\\Settings\\CurrentSkinColorSchema";
	var strValue = RegGetDword(strPath);

	var strReturn = 0;
	switch(strValue)
	{
		//--OFFICE2007_LIGHTBLUE
		case 62001:
			strReturn = 1;
		break;
		//--OFFICE2007_BLUE
		case 62002:
			strReturn = 2;
		break;
		//--OFFICE2007_BLACK
		case 62003:
			strReturn = 3;
		break;
		//--OFFICE2007_SILVER
		case 62004:
			strReturn = 4;
		break;
		//--OFFICE2007_AQUA 
		case 62005:
			strReturn = 5;
		break;
		//--OFFICE2010_BLUE
		case 62006:
			strReturn = 6;
		break;
		//--OFFICE2010_BLACK
		case 62007:
			strReturn = 7;
		break;
		//--OFFICE2010_SILVER
		case 62008:
			strReturn = 8;
		break;
		//--VISTA_BLUE
		case 62010:
			strReturn = 10;
		break;
		//--VISTA_BLACK
		case 62011:
			strReturn = 11;
		break;
		//--VISTA_SILVER
		case 62012:
			strReturn = 12;
		break;
		//--WINXP_ROYALE
		case 62013:
			strReturn = 13;
		break;
		//--WINXP_LUNA_HOMESTEAD
		case 62014:
			strReturn = 14;
		break;
		//--WINXP_LUNA_METALLIC
		case 62015:
			strReturn = 15;
		break;
		//--WINXP_LUNA_BLUE
		case 62016:
			strReturn = 16;
		break;
		//--Deafult to Silver
		default:
		strReturn = 4;
	}
	return strReturn;
}
//-- TK End
//--TK QA Function
fglobal.prototype.qa_log_time = fglobal_qa_log_time;
function fglobal_qa_log_time(strAction, intTime)
{
	//--TK Logs Specific Action and Time Taken In MS
	var arrCols = {};
	arrCols.action = strAction;
	arrCols.time = intTime;
	var qa_date = new Date();
	arrCols.date = qa_date;
	this.submittableinsert("qa_performance",arrCols);
}
//--TK End QA Function


//--F0110887 Function added
fglobal.prototype.checkOrgSupport = fglobal_checkOrgSupport;
function fglobal_checkOrgSupport(strOrgID, intExpiryEpoch, boolAlerts)
{
	var intWarningDays = oSettings.get_setting("strOrgSupportedbyWarningDays");
	var intWarningEpoch = intWarningDays * 86400;
	var intCurrentEpoch = app.global.GetCurrentEpocTime();
	//-- Get Org Name
	var strOrgName = "";
	var strParams = "table=company&_swc_pk_company_id=" + pfu(strOrgID);
	var oRS = app.g.get_sqrecordset("select.tablebycol",strParams);
	if(oRS.Fetch())
	{
		strOrgName = app.g.get_field(oRS,"companyname");
	}
	if (intExpiryEpoch==0)
	{
		// if expiry date not set org is supported
	}
	else if(intCurrentEpoch >= intExpiryEpoch)
	{
		if(boolAlerts) MessageBox("Warning: The '" + strOrgName + "' organisation is no longer supported.");
		return 0;
	}
	else 
	{
		var intWarningThreshold = intExpiryEpoch-intWarningEpoch;
		if(intCurrentEpoch >= intWarningThreshold)
		{
			var intSecondsUntilExpiry = intExpiryEpoch-intCurrentEpoch;
			var intDaysUntilExpiry = Math.ceil(intSecondsUntilExpiry / 86400);
			var strPlural = (intDaysUntilExpiry==1) ? "" : "s";
			if(boolAlerts) MessageBox("Warning: Support for the '" + strOrgName + "' organistation will expire in " + intDaysUntilExpiry + " day" + strPlural +".");
			return 2;
		}
	}
	return 1;
}
//-- Function to check of Change Control is Enabled for any RFC associated against a CI
fglobal.prototype.check_change_control = fglobal_check_change_control;
function fglobal_check_change_control(pk_auto_id, strType)
{
	//--Get Change Controll Flag from CITYPE
	var boolCC = false;
	var aptype = {};
	var BoolChangeTypeFlag = 0;
	aptype.pk_config_type = strType;
	var oRSType = app.g.get_tablerecordset_bycol("config_typei",aptype,false,"flg_changecontrol");
	while(oRSType.Fetch())
	{
		BoolChangeTypeFlag = app.g.get_field(oRSType,"flg_changecontrol");
		if(BoolChangeTypeFlag=="1")
		{
			BoolChangeTypeFlag = true;
		}
	}
	
	if(BoolChangeTypeFlag)
	{
		//-- Get List of RFC's
		var ap = {};
		ap.fk_ci_auto_id = pk_auto_id;
		ap.relcode = "RFC-CAUSE";
		var oRS = app.g.get_tablerecordset_bycol("cmn_rel_opencall_ci",ap,false,"fk_callref"); 
		var strRefs = "";
		var flg_enable_change_control = 0;
		//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
		while(oRS.Fetch())
		{
			currKey = app.g.get_field(oRS,"fk_callref");
			if (strRefs!="")strRefs +=",";
			strRefs += currKey;
		}
		if (strRefs.indexOf(',') > -1) 
		{ 
			var arrCalls=strRefs.split(",");
			var length = arrCalls.length;
			var boolChangeCC = 0;
			for (var i = 0; i < length; i++) {
				var call = arrCalls[i];
				//-- Go get Call details and check for stage
				var ap2 = {};
				ap2.callref = call;
				var oRS2 = app.g.get_tablerecordset_bycol("opencall",ap2,false,"bpm_stage_id"); 
				//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
				while(oRS2.Fetch())
				{
					var bpm_stage_id = app.g.get_field(oRS2,"bpm_stage_id");
				}
				//-- If we have a stage go and get its details
				if(bpm_stage_id)
				{
					var ap3 = {};
					ap3.pk_stage_id = bpm_stage_id;
					var oRS3 = app.g.get_tablerecordset_bycol("bpm_stage",ap3,false,"flg_enable_change_control"); 
					//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
					while(oRS3.Fetch())
					{
						flg_enable_change_control = app.g.get_field(oRS3,"flg_enable_change_control");
					}
				}
				//MessageBox(flg_enable_change_control);
				if(flg_enable_change_control)
				{
					boolChangeCC = true;
				}
			}
			boolCC = true;
			if(boolChangeCC)
			{
				boolCC = false;
			}			
		}else
		{
			var call = strRefs;
			//-- If No Calls then return true
			if(!call)
				return true;
			//-- Go get Call details and check for stage
			var ap2 = {};
			ap2.callref = call;
			var oRS2 = app.g.get_tablerecordset_bycol("opencall",ap2,false,"bpm_stage_id"); 
			//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
			while(oRS2.Fetch())
			{
				var bpm_stage_id = app.g.get_field(oRS2,"bpm_stage_id");
			}
			//-- If we have a stage go and get its details
			if(bpm_stage_id)
			{
				var ap3 = {};
				ap3.pk_stage_id = bpm_stage_id;
				var oRS3 = app.g.get_tablerecordset_bycol("bpm_stage",ap3,false,"flg_enable_change_control"); 
				var strRefs = 0;
				//-- nwj we are returning values for filter so do not pfs or encaps as sqs filter script will take care of that.
				while(oRS3.Fetch())
				{
					flg_enable_change_control = app.g.get_field(oRS3,"flg_enable_change_control");
				}
			}
			//MessageBox(flg_enable_change_control);
			boolCC = true;
			if(flg_enable_change_control==1)
			{
				boolCC = false;
			}
		}
		
		
		
	}
	return boolCC;
}

// -- PM00126791 - Function to return the array size
function assocArraySize(obj) 
{
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
}

// -- ES - Function to add quotes to strings (seperated by comma)
function addQuotesToStrings(strStrings)
{
	if(strStrings != "" || strStrings != undefined)
	{
		var arrStrings = strStrings.split(",");
		var strPreparedStrings = "";
		 // -- Loop through each string and add quotes to start and end
		for(var i=0;i < arrStrings.length;i++)
		{
			if(strPreparedStrings!="") strPreparedStrings += ",";
			strPreparedStrings += "'" + arrStrings[i] + "'";
		}
		
		return strPreparedStrings;
		
	}
	else
		return "";
}


// -- F00105610 - 11.02.2015
fglobal.prototype.resolve_default_priority = fglobal_resolve_default_priority;
function fglobal_resolve_default_priority(strPriority,oDoc,strCallClass){

	var arrDefaultPriorities =	["[Use Customer Priority]","[Use Profile Priority]","[Use Charge Centre Priority]","[Use Process Priority]"];
	if (arrDefaultPriorities.indexOf(strPriority)!=-1){
		switch (strCallClass){
				case "Incident":
								oDoc.boolIncSLASetManually = true;
								break;
				case "Problem":
								oDoc.boolProblemSLASetManually = true;
								break;
				case "Change Request":
								oDoc.boolChangeSLASetManually = true;
								break;
				case "Release Request":
								oDoc.boolReleaseSLASetManually = true;
								break;
				case "Change Proposal":
								oDoc.boolChangeSLASetManually = true;
								break;
		}
		
		oDoc.handle_set_priority(strPriority);

		if (arrDefaultPriorities.indexOf(oDoc.opencall.priority)!=-1){
			return false;
		}

	}
return true;
}

fglobal.prototype.fix_priority = fglobal_fix_priority;
function fglobal_fix_priority(strSLA, strPriority, oDoc){	
	//-- string to identify erroneous priority
	strFind = strSLA + " (";

	//-- function to escape special chars in regex
	RegExp.escape = function(str){
		return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	};

	//-- regex to identify erroneous priority
	var strReg = new RegExp(RegExp.escape(strFind),"g");

	//-- identify erroneous priority
	strMatch = strPriority.match(strReg);

	if (strMatch!=null){
		//-- if priority erroneous, strip beginning...
		strCorrectPriority = strPriority.replace(strReg, "");

		//-- ...and strip end...
		intL = strCorrectPriority.length;
		strCorrectPriority = strCorrectPriority.replace(strCorrectPriority[intL-1], "");

		//-- ...then update priority
		oDoc.opencall.priority = strCorrectPriority;
		oDoc.UpdateFormFromData();
	}
}

oCMDB.prototype.create_baseline_silent = cmdb_create_baseline_silent;
function cmdb_create_baseline_silent(intCIkey, intBLNid,strCIType, boolUpdateOrig, strDiaryEntry)
{
	if(boolUpdateOrig==undefined)boolUpdateOrig=true;
	if(strDiaryEntry==undefined)strDiaryEntry="";
	
	//-- get baseline count for item	
	var strParams = "intBLNid=" + pfu(intBLNid);
	var oRS = app.g.get_sqrecordset("cmdb/common/select.max_baselineindex",strParams);

    var maxbln = -1;
    while(oRS.Fetch())
    {
        maxbln = oRS.GetValueAsString(0);
    }

	//- -do we have bln
	if(maxbln==-1)
	{
		MessageBox("A problem occured when baselining this item. The baseline index could not be determined. Please contact your Supportworks administrator");
		return -1;
	}
	
	var strParams = "cid=" + pfu(intCIkey);
	var oRS = app.g.get_sqrecordset("cmdb/common/select.config_item",strParams);
    if(!oRS.Fetch())
	{
		return -1;
	}
    
	//-- set new fields for copy record
	var strTable = "config_itemi";
	var strParams = "table=config_itemi";

	for (x=0; x < dd.tables[LC(strTable)].columns.length;x++)
	{
		var colName = dd.tables[LC(strTable)].columns[x].Name;
		var colValue = app.g.get_field(oRS,colName);

		if (colName.toUpperCase() != app.g.dd_primarykey(strTable).toUpperCase())
		{
			//-- check for iscurrentversion and bln
			if (UC(colName) == "CK_BASELINEINDEX") colValue = ++maxbln;
			if (UC(colName) == "ISACTIVEBASELINE") colValue = "Yes";
			
			if(	strParams != "")strParams += "&";
			strParams += "_swc_" + LC(colName) + "="+ pfu(colValue); //-- _swc_ prefix so php sq can id passed in column params
		}
	}

	//-- submit then get new ci id
	if(app.g.submitsqs("insert.table",strParams))
	{
		var strParams = "intBLNid=" + pfu(intBLNid);
		var oRS = app.g.get_sqrecordset("cmdb/common/select.max_ciid_from_blnid",strParams);

		var newCIkey = 0;
		while(oRS.Fetch())
		{
			newCIkey = oRS.GetValueAsString(0);
		}

		//-- create/copy extended table record
		this.copy_extended_record(intCIkey, newCIkey, strCIType);

		//-- set original ci isactivebaseline to No
		if(boolUpdateOrig)
		{
			var strParams = "intCIkey=" + intCIkey;
			app.g.submitsqs("cmdb/common/deactivate.baseline",strParams);

		}

		//-- copy relationships, service types and call diary
		this.copy_relations(intCIkey,newCIkey);
		this.copy_merelations(intCIkey, newCIkey);
		this.copy_servicetypes(intCIkey, newCIkey);
		this.copy_eventactions(intCIkey, newCIkey);
		this.copy_blackout(intCIkey, newCIkey);
		this.copy_dml_uri(intCIkey, newCIkey);
		//this.copy_ola_tasks(intCIkey, newCIkey);
		this.copy_kb_assocs(intCIkey, newCIkey);
		this.copy_targets(intCIkey, newCIkey);

		if(strCIType.toUpperCase()=="ME->SERVICE")
		{
			app.service.baseline_create(intCIkey, newCIkey);
		}

		//-- Add diary entry
		if(strDiaryEntry!="")
		{
			this.insert_diaryentry(intCIkey, "Auto Update", "Baselined", app.session.analystId, app.g.todaysdate_epoch(), strDiaryEntry, 0)		
		}
		this.copy_diaryentries(intCIkey, newCIkey);
        return newCIkey;
	}
	else
	{
		return -1;
	}
}

fglobal.prototype.setSLAFromRules = fglobal_setSLAFromRules;
function fglobal_setSLAFromRules(strCallClass, oDoc)
{
	var intUseSLAID = 0;
	var strUseSLAName = "";
	var strUsePriority = "";
   
	try
	{
		var strCIs = app.g.sl_get_valuesdel(oDoc.extform.sl_configitems,"pk_auto_id",",","");
	}
	catch(e)
	{
		//-- MessageBox(e.message);
		var strCIs = app.g.sl_get_valuesdel(oDoc.extform.sl_configitems1,"pk_auto_id",",","");
	}
	
	var	strParams = "callclass="+strCallClass;
		strParams += "&orgid="+ oDoc.opencall.fk_company_id;
		strParams += "&siteid="+ oDoc.opencall.site;
		strParams += "&deptid="+ oDoc.opencall.fk_dept_code;
		strParams += "&chargeid="+ oDoc.opencall.costcenter;
		strParams += "&workflowid="+ oDoc.bpm_workflow.pk_workflow_id;
		strParams += "&profileid="+ oDoc.opencall.probcode;
		strParams += "&ciid="+strCIs;
		if(strCallClass != "Release Request")
		{
			strParams += "&custid=" + oDoc.userdb.keysearch;
		}
		if(strCallClass == "Service Request")
		{
			strParams += "&servid="+oDoc.opencall.itsm_fk_service;
		}
		else
		{
			try
			{
				var strServices = app.g.sl_get_valuesdel(oDoc.extform.sl_services,"pk_auto_id",",","");
			}
			catch(e)
			{
				//-- MessageBox(e.message);
				var strServices = app.g.sl_get_valuesdel(oDoc.extform.sl_services1,"pk_auto_id",",","");
			}
			strParams += "&servid="+strServices;
		}
		//MessageBox(strParams);		
	
	var q = new SqlQuery();
	q.InvokeStoredQuery("call/sla/get_default_sla",strParams);
    while(q.Fetch())
    {
        intUseSLAID = q.GetValueAsString("fk_slad");
        strUseSLAName = q.GetValueAsString("fk_slad_name");
        strUsePriority = q.GetValueAsString("fk_priority");
    }
    if(strUseSLAName != "")
	{
		oDoc.handle_set_sladef(strUseSLAName,false,true);
		//oDoc.opencall.itsm_sladef = intUseSLAID;
		//oDoc.opencall.itsm_slaname = strUseSLAName;
	}
	if(strUsePriority!= "")
	{
		if(strUsePriority == "[Use Impact/Urgency]")
		{
			//Go calculate SLA using Priority Matrix
			var strPriority = app.itsm.get_sla_from_slad_matrix(intUseSLAID, oDoc.opencall.itsm_impact_level, oDoc.opencall.itsm_urgency_level);
			if(strPriority!="") oDoc.opencall.priority = strPriority;
		}
		else if (strUsePriority == "[Use SLA Default Priority]")
		{
			//Go get Default Priority against SLA
		  	var oRecSLD = app.g.get_sqrecordset("general/get_itsm_sla_pk","kv="+intUseSLAID);
			if(oRecSLD.Fetch())
			{
				var strPriority = app.g.get_field(oRecSLD, "fk_ssla");
				if(strPriority!="") oDoc.opencall.priority = strPriority;
			}
		}
		else
		{
			oDoc.opencall.priority = strUsePriority;
		}
	}
	else oDoc.opencall.priority = oDoc.strDefaultPriority;
	oDoc.UpdateFormFromData();
}