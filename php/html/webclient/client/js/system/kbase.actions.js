//-- 22.10.2009
//-- common kbase functions that are used across applications - These should not be customised
var kbase = new Object();
kbase._searchstring = "";

//--
//-- run an action of some type from a menu click (typically application menu items like file->manage customer->add new or logcall->incident)
//-- defined actions
var __KB_SEARCH = "search"; //-- search kbase
var __KB_COMPOSE = "compose"; //-- compose new kbase document
var __KB_SUBMIT = "submit"; //-- submit ext document
var __KB_MANAGE = "manage"; //-- manage catalogs
//-- function
kbase.run_action = function (strAction)
{
	switch(strAction)
	{
		case "search":
			kbase.open_search();
			break;
		case "compose":
			kbase.open_compose();
			break;
		case "submit":
			kbase.open_external();
			break;
		case "manage":
			kbase.open_catalogs();
			break;

	}
}

kbase.get_catalog_list_for_lb = function(oListbox)
{
	var strList= "";
	var xmlmc = new XmlMethodCall();
	if(xmlmc.Invoke("knowledgebase", "catalogList"))
	{
		var arrListXml = xmlmc.xmlDOM.getElementsByTagName("folder");
		for(var x=0;x<arrListXml.length;x++)
		{
			var strID  = app.xmlNodeTextByTag(arrListXml[x],"catalogId");
			var strName = app.xmlNodeTextByTag(arrListXml[x],"name");

			if(strList!="")strList+="|";
			strList += strName +"^" + strID;
		}
	}
	oListbox.pickList = strList;
}


//-- search
kbase.open_search = function (strSearchString)
{
	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS,true))return false;
	
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/search/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		if(strSearchString==undefined)strSearchString="";
		this._searchstring = strSearchString;

		//--switch to kbase search view
		app.application_navbar.activatebar("knowledgebase_view");
	}
}

//-- compose document
kbase.open_compose = function (strParams,modal, modalCallbackFunction)
{

	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANADDKBDOCUMENTS,true))return false;
				
	//-- check if we have overiding sw-app function
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/new kb doc/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		if(strParams==undefined)strParams="";
		var strFormName = "_sys_kb_article";
		_open_system_form(strFormName, "knowledgebase", "", strParams, true, function(returnFormInfo)
		{
			if(modalCallbackFunction)
			{
				var result = (returnFormInfo && returnFormInfo._swdoc && returnFormInfo._swdoc.boolSavedOk!=undefined) ?returnFormInfo._swdoc.boolSavedOk:false;
				modalCallbackFunction(result);
			}
		},null,window);
	}
}

//-- compose ext document
kbase.open_external = function (modalCallbackFunction)
{
	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANADDEXTKBDOCUMENTS,true))return false;

	//-- check if we have overiding sw-app function
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/submit ext doc/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		var strFormName = "_sys_kb_external";
		_open_system_form(strFormName, "knowledgebase", "", "", false, null,null,window)
	}
}

//-- manage catalogs
kbase.open_catalogs = function ()
{
	//-- check if we have overiding sw-app function
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/manage catalogues/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		var strFormName = "_sw_kb_manage";
		_open_system_form(strFormName, "knowledgebase", "", "", false, null,null,window)
	}
}

kbase.open_document = function (strDoc)
{
	
	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANEDITKBDOCUMENTS,true))return false;

	var res = true;
	if(app.OnOpenKBArticleProperties!=undefined)
	{
		res = app.OnOpenKBArticleProperties(strDoc);
	}

	if(res)
	{
		//-- open kbase record - open different form based on type
		var xmlmc = new XmlMethodCall();
		xmlmc.SetValue("docRef",strDoc);
		if(xmlmc.Invoke("knowledgebase","documentGetType"))
		{
			//alert(xmlmc.GetParamValue("type").toLowerCase())
			if(xmlmc.GetParamValue("type").toLowerCase()=="internal")
			{
				var strFormName = "_sys_kb_article";
			}
			else
			{
				var strFormName = "_sys_kb_external";
			}

			_open_system_form(strFormName, "knowledgebase", strDoc, "", false, null,null,window);		
		}
		else
		{
			alert("Failed to fetch article type. Please contact your Administrator");
		}
	}
}

//-- call service to perform search and return table rows
kbase.get_search_results = function(strSearchText,strSearchMethod, bitSearchFlag, strSearchInCatalog,intRows,intSortCol, boolSortAsc, targetTableHolder)
{

	if(intSortCol==undefined)intSortCol=0;
	if(boolSortAsc==undefined)boolSortAsc="true";

	//-- use xml api to get matched document
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("queryString",strSearchText)

	//-- set catalog id
	if(strSearchInCatalog=="")strSearchInCatalog=0;
	xmlmc.SetParam("catalogId",strSearchInCatalog)

	var strAction = "queryNatural"
	if(strSearchMethod!="1")
	{
		//-- doing a word search
		strAction = "queryKeyword"
		var strType = (strSearchMethod=="2")?"all":"any";
		xmlmc.SetParam("queryType",strType)

		//-- search on
		if(bitSearchFlag & 2) 		xmlmc.SetParam("searchTitle","true");
		if(bitSearchFlag & 1) 		xmlmc.SetParam("searchKeywords","true");
		if(bitSearchFlag & 4) 		xmlmc.SetParam("searchProblem","true");
		if(bitSearchFlag & 8) 		xmlmc.SetParam("searchSolution","true");
		//	searchCallProbCode xs:boolean optional Set to 'true' to search the call problem code profile 
	}

	xmlmc.SetParam("maxResults",intRows); //-- max rows to return
	xmlmc.SetParam("sortResultsBy",intSortCol);
	xmlmc.SetParam("sortResultsAsc",boolSortAsc); 

	if(xmlmc.Invoke("knowledgebase",strAction))
	{
		//-- create table html
		var max_score = 0;		
		var strRows = "";
		var arrDocs = xmlmc.xmlDOM.getElementsByTagName("document");

		//-- need to find max relevance
		for (var x=0;x<arrDocs.length;x++)
		{
			//-- get values
			var relevance = xmlNodeTextByTag(arrDocs[x],"relevance");
			if(relevance=="")break;
			relevance++;relevance--;
			if(relevance  > max_score)max_score = relevance ;
		}

		for (var x=0;x<arrDocs.length;x++)
		{
			//-- get values
			var relevance = xmlNodeTextByTag(arrDocs[x],"relevance");
			var docref = xmlNodeTextByTag(arrDocs[x],"docref");
			var docdate = xmlNodeTextByTag(arrDocs[x],"date");
			var title = xmlNodeTextByTag(arrDocs[x],"title");

			//-- determine relevance % if we have some
			if(relevance!="")
			{
				var perc = app.number_format((relevance/max_score)*100,0);			
				relevance = "<div style='width:"+perc+"%;background-color:#6EB4C8;color:#000000;'>"+perc+"%</div>";
			}
			else
			{
				relevance = "N/A";
			}

			//-- create row html
			var strDataRow = "";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + relevance + "</div></td>";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + docref + "</div></td>";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + docdate + "</div></td>";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + title + "</div></td>";
			strRows += "<tr type='sys' keycolumn='docref' keyvalue='"+ docref + "' onclick='app.kbase_select_row(this,event);' ondblclick='app.kbase_open_row(this,event);'>" + strDataRow + "</tr>";
		}

		if(targetTableHolder!=undefined)
		{
			var intRowCount = app.datatable_draw_data(targetTableHolder, strRows,true);
			return intRowCount;
		}
		else
		{
			return strData;
		}
	}	
	else
	{
		alert(xmlmc.GetLastError())
	}
	return false; 
	/*
	//-- 
	//-- xmlmc failed so use php
	var strParams = "searchtext=" + app.pfu(strSearchText) + "&searchmethod=" + app.pfu(strSearchMethod) + "&searchflag=" + bitSearchFlag + "&searchcatalog=" + app.pfu(strSearchInCatalog) + "&sqlrowlimit=" + intRows;
	var strURL = app.get_service_url("kbase/search","");
	var strData = app.get_http(strURL,strParams, true, false);
	if(targetTableHolder!=undefined)
	{
		var intRowCount = app.datatable_draw_data(targetTableHolder, strData,true);
		return intRowCount;
	}
	else
	{
		return strData;
	}
	*/
}
