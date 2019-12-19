var _LISTBOX = "select";
var _DATERANGE = "daterange";
var _DATE = "date";
var _PROFILECODE = "profilecode";
var _TEXTBOX = "input";
var _RADIO = "radio";
var _CHECK = "check";


function create_new_mes(oXML, strID, strMesType,oDoc)
{

	return new oSearch(oXML, strID,strMesType, oDoc);
}

//--
//-- javascript search object
function oSearch(oXML, strID, strMesType, oDoc)
{
	if( (strMesType==undefined) || (strMesType=="")) strMesType="mes";

	this.id = strID;
	this.mestype = strMesType;
	this.xmldom = oXML;
	this.doc = oDoc;
	this.rowcount=-1;

	var nodeTable= this.xmldom.getElementsByTagName("table")[0];
	var strTable = app.xmlText(nodeTable);
	this.table = strTable;

	if(this.table=="")
	{
			alert("Managed entity search : Database table not defined.\n\nPlease contact your Administrator.");
	}
	else
	{

		this.keycolumn = app.dd.tables[this.table].PrimaryKey;
		this.addNewForm = app.dd.tables[this.table].NewRecordForm;
		if(this.addNewForm=="")
		{
			//-- use form defined against mes
			var nodeForm= this.xmldom.getElementsByTagName("formName")[0];
			var strForm = app.xmlText(nodeForm);
			this.addNewForm = strForm;
		}
	}
}

//-- process add new
oSearch.prototype.addNew = function ()
{
	//-- get add new form for this table
	if(this.addNewForm!="")
	{

		app.OpenFormForAdd(this.addNewForm,"","",false);
	}
}

//--
//-- process search
oSearch.prototype.search = function ()
{
	//-- run 
	top.debugstart("Run Data Search For " + this.table,"SEARCH");
	var strArgs = "mesid=" + this.id + "&mestype=" + this.mestype +"&_keycolumn=" + this.keycolumn;
	var addCriteria = this.get_search_criteria();
	if(addCriteria==false)return;

	strArgs += addCriteria;

	var strURL = get_service_url("managedentitysearch","");
	var strData = app.get_http(strURL,strArgs, true, false);

	//-- LOAD RESULTS
	var start = new Date();
	this.load_result_datatable(strData);
	top.debugend("Run Data Search For " + this.table,"SEARCH");
}	

//-- get search criteria parameters to pass in
oSearch.prototype.get_search_criteria = function ()
{
	var intCallrefOnly = -1;
	var strParams = "";
	var oFieldHolder = this.doc.getElementById("search-fields");
	if(oFieldHolder!=null)
	{
		var arrEle = app.get_children_by_att(oFieldHolder, "target");
		for(var x=0;x< arrEle.length;x++)
		{
			strOp = arrEle[x].getAttribute("op");
			strTarget = arrEle[x].getAttribute("target");
			strValue = app.getEleValue(arrEle[x]);
	
			if(strValue!="")
			{
				//-- a number
				if(strOp=="in")
				{
					var strValue = string_replace(strValue, " ","",true);
					strValue = strValue.replace(/[^0-9 ,]+/g,''); //-- remove all chars except ,
					var testVal = string_replace(strValue, ",","",true);

					//-- check input
					if(isNaN(testVal) || testVal=="")
					{
						var strLabel = app.get_label_from_binding(strTarget);
						alert("The [" + strLabel + "] field requires numeric input.\n\nPlease validate your criteria and try again.");
						return false;
					}
				}

				if(strTarget=="opencall.callref")
				{
					intCallrefOnly = 1;
				}
				else
				{
					intCallrefOnly = -1;
				}
				strParams += "&"+ pfu(strTarget) + "=" + pfu(strValue);
				strParams += "&_op_"+ pfu(strTarget) + "=" + pfu(strOp);

			}
		}
	}


	//-- pass in sql operator and limit
	var iRowLimit = this.doc.getElementById('search_limit').value;
	if(isNaN(iRowLimit) || iRowLimit<0)
	{
		iRowLimit=100;
		this.doc.getElementById('search_limit').value = 100;
	}


	strParams += "&_callrefonly="+intCallrefOnly+"&sqloperator=" + this.doc.getElementById('search_operator').value;
	strParams += "&sqlrowlimit=" + pfu(iRowLimit);

	//-- order by info
	var oDivHolder = app.oWorkspaceFrameHolder.getElement(this.id);
	if(oDivHolder!=null)
	{
		strParams += "&orderby=" + oDivHolder.getAttribute("orderby");
		strParams += "&orderdir=" + oDivHolder.getAttribute("orderdir");
	}

	if(this.mestype=="sfc") strParams += this.get_sfc_search_criteria();
	return strParams;
}

//-- get search criteria parameters to pass in for additional search for call options
oSearch.prototype.get_sfc_search_criteria = function ()
{
	var strParams = "";
	var oFieldHolder = this.doc.getElementById("search-calloptions");
	if(oFieldHolder!=null)
	{
		var arrEle = app.get_children_by_att(oFieldHolder, "target");
		for(var x=0;x< arrEle.length;x++)
		{
			strOp = arrEle[x].getAttribute("op");
			strTarget = arrEle[x].getAttribute("target");
			strValue = app.getEleValue(arrEle[x],false);

			if(strValue!="")
			{
				//-- a number
				if(strOp=="in")
				{
					var strValue = string_replace(strValue, " ","",true);
					var testVal = string_replace(strValue, ",","",true);
					//-- check input
					if(isNaN(testVal))
					{
						var strLabel = app.get_label_from_binding(strTarget);
						alert("The [" + strLabel + "] field requires numeric input.\n\nPlease validate your criteria and try again.");
						return false;
					}
				}
				strParams += "&"+ pfu(strTarget) + "=" + pfu(strValue);
				strParams += "&_op_"+ pfu(strTarget) + "=" + pfu(strOp);
			}
		}
	}
	return strParams;
}


//-- out put data to data table
oSearch.prototype.load_result_datatable= function (strData)
{
	var oDivHolder = app.oWorkspaceFrameHolder.getElement(this.id);
	if(oDivHolder==null)
	{
		alert("Managed entity search : The search results data table could not be found.\n\nPlease contact your Administrator");
		return;
	}

	var intRowCount = app.datatable_draw_data(oDivHolder, strData);
	this.rowcount = intRowCount;
	this.set_right_title_count();
	mes_select_firstrow(oDivHolder);
	strData = null;
}

oSearch.prototype.set_right_title_count= function ()
{
	var strLeftTitle = app.get_outlook_left_title();
	var strMatch = (this.rowcount != 1)?"Matches":"Match";
	app.set_right_title(strLeftTitle + " (" + this.rowcount + " " + strMatch + ")");
}


//--
//-- clear form
oSearch.prototype.reset= function ()
{
	var oFieldHolder = this.doc.getElementById("search-fields");
	if(oFieldHolder!=null)
	{
		this.write_html_fields(oFieldHolder);
	}
	var oFieldHolder = this.doc.getElementById("search-calloptions");
	if(oFieldHolder!=null)this.write_sfc_html_fields(oFieldHolder);
	this.setup_search_options();

}

oSearch.prototype.reset_sfc_options=function()
{

}

oSearch.prototype.setup_search_options=function()
{
	//-- pass in sql operator and limit
	var eRowLimit = this.doc.getElementById('search_limit');
	var iRowLimit= app.xmlNodeTextByTag(this.xmldom,"maxSearchResults");
	if(isNaN(iRowLimit))iRowLimit=100;
	eRowLimit.value = iRowLimit;

	//-- search type
	var eSearchType = this.doc.getElementById('search_operator');
	var iSearchOption= app.xmlNodeTextByTag(this.xmldom,"searchOptions");
	if(isNaN(iSearchOption))
	{
		iSearchOption = (iSearchOption=="Any search fields match")?0:1;
	}
	eSearchType.selectedIndex=iSearchOption;

	//-- fedex 21.02.20013 - do we have a new form - if so show add new button
	if(this.addNewForm!="")
	{
		this.doc.getElementById("btn_addnew").style.display="inline";
	}


	this.resize_height();
}

oSearch.prototype.resize_height=function()
{
	var divFields = this.doc.getElementById("search-fields");
	var divOptionsTitle = this.doc.getElementById("search-title-options");
	var divOptions = this.doc.getElementById("search-action");
	var divSearchOptions = this.doc.getElementById("search-calloptions");
	var iSFCH = (divSearchOptions==null)?0:divSearchOptions.offsetHeight;
	var iHeight = this.doc.body.offsetHeight;
	var iAdjust = new Number(divOptionsTitle.offsetHeight) + new Number(divOptions.offsetHeight) + new Number(iSFCH);
	

	var iSearchHeight = iHeight - iAdjust;
	if(iSearchHeight<1)iSearchHeight=1;
	try
	{
		divFields.style.height = iSearchHeight - 5;	
	}
	catch (e)
	{
	}
	
	//alert(iHeight + ":" + iAdjust)
}


oSearch.prototype.write_html_fields = function (oFieldHolder)
{
	top.debugstart("Draw Search Fields For " + this.table,"SEARCH");

	if(this.table=="")
	{
		return "";
	}

	var nodeField= this.xmldom.getElementsByTagName("searchColumns")[0];
	if(nodeField!=undefined)
	{
		var strInsertHTML = "<table border='0' width='100%'>";
		var arrFields = app.xmlText(nodeField).split(",");
		for(var x=0; x < arrFields.length;x++)
		{		
			strInsertHTML += "<tr><td noWrap>";
			
			var strFieldName = app.trim(arrFields[x]);
			var strBinding = this.table + "." + strFieldName;
			if(app.dd.tables[this.table].columns[strFieldName]==undefined) continue;
			var boolNumeric = app.dd.tables[this.table].columns[strFieldName].IsNumeric();

			var oField = this.new_field("","",strBinding,boolNumeric)

			strInsertHTML += create_input_box(oField,this.id);

			strInsertHTML += "</td></tr>";
		}
		strInsertHTML += "</table>";

		if(oFieldHolder!=undefined && oFieldHolder!=null)
		{
			oFieldHolder.innerHTML = strInsertHTML;
		}
		else
		{
			this.doc.write(strInsertHTML);
		}
	}

	top.debugend("Draw Search Fields For " + this.table,"SEARCH");

}

oSearch.prototype.new_field = function (strType,strLabel,strBinding,boolNumeric)
{
	var oField = new Object();
	oField.type = strType;
	oField.targetcol = strBinding;
	oField.operator = (boolNumeric)?"in":"like";
	oField.label = strLabel;
	return oField;
}


//--
//-- draw out the input fields - enhanced for search for calls
oSearch.prototype.write_sfc_html_fields = function (oFieldHolder)
{
	var strInsertHTML = "";
	var arrFields = this.xmlsearchoptions.getElementsByTagName("field");
	if(arrFields)
	{
		var strInsertHTML = "<table border='0' width='100%'>";

		for(var x=0; x < arrFields.length;x++)
		{		
			strInsertHTML += "<tr><td noWrap>";

			var oField = arrFields[x];
			var strType = oField.getAttribute("type");
			switch (strType)
			{
				case _DATERANGE:
					strInsertHTML += create_daterange_box(oField);
					break;

				case _PROFILECODE:
					strInsertHTML += create_profilecode_box(oField);
					break;

				case _LISTBOX:
					strInsertHTML += create_select_box(oField);
					break;
				case _TEXTBOX:
					strInsertHTML += create_input_box(oField);
					break;
				case _RADIO:
					strInsertHTML += create_radio_box(oField);
					break;				
				case _CHECK:
					strInsertHTML += create_check_box(oField);
					break;				
			}		

			strInsertHTML += "</td></tr>";
		}
		strInsertHTML += "</table>";

		if(oFieldHolder!=undefined && oFieldHolder!=null)
		{
			oFieldHolder.innerHTML = strInsertHTML;
		}
		else
		{
			this.doc.write(strInsertHTML);
		}
	}
}


//-- helpers to create fields
//-- select drop down box
function create_select_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}

	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";

	//-- get default value
	var strDefault = "";
	var arrDefaults = oField.getElementsByTagName("default");
	if(arrDefaults)strDefault = app.xmlText(arrDefaults[0]);

	//-- get option items
	var strOptions = "";
	var arrItems = oField.getElementsByTagName("item");
	if(arrItems)
	{
		for(var x=0;x< arrItems.length;x++)
		{
			var strKey = app.xmlText(arrItems[x].childNodes[0]);
			var strText = app.xmlText(arrItems[x].childNodes[1]);
	
			var strSelected = (strDefault==strKey)?" selected ":"";
			strOptions += "<option value='" + strKey + "' " + strSelected + ">" + strText + "</option>";
		}
	}


	var strHTML = strLabel + "<select style='width:100%;' target='" + eleName + "'  op='" + strOp + "' ><option value=''></option>" + strOptions + "</select>";
	return strHTML;
}

//-- input textbox
function create_input_box(oField, strControlID)
{
	var eleName = oField.targetcol;
	var strOp = oField.operator;
	if(strOp==null)strOp="like";

	//alert(eleName + ":" + strOp);
	//-- set the input label
	var strLabel = oField.label;

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";
	
	var strHTML = strLabel + "<input onkeyup='app._check_search_keypress(this,event,\""+strControlID+"\");' type='text' style='width:100%;' op='" + strOp + "' target='" + eleName + "'>";
	return strHTML;
}

function _check_search_keypress(oEle,oEv,strControlID)
{
	if(oEv==undefined)oEv = this;
	var intKC = app.getKeyCode(oEv);
	if(intKC==13)
	{
		//-- search
		app._mes[strControlID].search();
	}

}


//-- check box
function create_check_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}

	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel = "<label for='cb_" + eleName + "'>" + strLabel + "</label>";

	//-- get default value
	var strChecked = "";
	var arrDefaults = oField.getElementsByTagName("default");
	if(arrDefaults)strChecked = (app.xmlText(arrDefaults[0])=="1")?"checked":"";


	//-- check checkbox on and off value
	var strOnValue = "";
	var arrOV = oField.getElementsByTagName("on");
	if(arrOV)strOnValue =  app.xmlText(arrOV[0]);

	var strOffValue = "";
	var arrOV = oField.getElementsByTagName("off");
	if(arrOV)strOffValue =  app.xmlText(arrOV[0]);


	var strHTML = "<input id='cb_" + eleName + "'  op='" + strOp + "' type='checkbox' value='" + strOnValue + "' offvalue='" + strOffValue + "' " + strChecked + " target='" + eleName + "' style='width:25px;'>" + strLabel;
	return strHTML;
}

//-- radio box
function create_radio_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}

	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";




	//-- get default value
	var strDefault = "";
	var arrDefaults = oField.getElementsByTagName("default");
	if(arrDefaults)strDefault = app.xmlText(arrDefaults[0]);

	//-- get radion items
	var strItems = "";
	var arrItems = oField.getElementsByTagName("item");
	if(arrItems)
	{
		for(var x=0;x< arrItems.length;x++)
		{
			var strKey = app.xmlText(arrItems[x].childNodes[0]);
			var strText = app.xmlText(arrItems[x].childNodes[1]);
	
			var strChecked = (strDefault==strKey)?" checked ":"";
			var rdoID = "rdo_" + eleName + "_" + x;
			strText = "<label for='" + rdoID + "'>" + strText + "</label><br/>";

			strItems += "<input op='" + strOp + "' style='width:25px;' id='" + rdoID + "' name='rdo_" + eleName +"' " + strChecked + " type='radio' target='" + eleName + "' value='" + strKey + "'>" + strText;
		}
	}
	var strHTML = strLabel + strItems;
	return strHTML;
}


function create_daterange_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}
	
	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";
	
	var strHTML = strLabel + "<input class='datebox' formattype='date' settime='1' onchange='app.ondatechange_element(this,1);' onclick='return app.trigger_datebox_dropdown(this,event);' type='text' style='width:48%;' op='" + strOp + "' target='" + eleName + "___1'>&nbsp;&nbsp;<input  class='datebox' onchange='app.ondatechange_element(this,2);' onclick='app.trigger_datebox_dropdown(this,event);' formattype='date' settime='2' type='text' style='width:48%;' op='" + strOp + "' target='" + eleName + "___2'>";
	return strHTML;
}

function create_profilecode_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}
	
	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";
	
	var strHTML = strLabel + "<input id='_sfc_pc' class='profilecode' type='text' oncontextmenu='if(app._clicked_ele_trigger(this,event))return app.stopEvent(event);' onmousedown='return app.select_profile_code_for_element(this,true,false,event);' style='width:100%;' op='" + strOp + "' target='" + eleName + "'>";
	return strHTML;

}

//--
//-- called when a mes data row is selected
function mes_datarow_selected(aRow)
{
	var strTable = aRow.getAttribute('keytable');
	var strKeyCol = aRow.getAttribute('keycolumn');
	var varKeyValue = B64.decode(aRow.getAttribute('keyvalue'));

	//-- load data into mes form - so access workspace area
	app.datatable_hilight(aRow);

	if(aRow.getAttribute("type")=="sys")
	{
		
		app.fireEvent(aRow,"click");
		//aRow.click(aRow);
	}
	else
	{
		load_mes_url(strTable,strKeyCol, varKeyValue);
	}
}


//--
//-- called when a mes data row is selected
function mes_datarow_dblclick(aRow)
{
	var strTable = aRow.getAttribute('keytable');
	var strKeyCol = aRow.getAttribute('keycolumn');
	var varKeyValue = B64.decode(aRow.getAttribute('keyvalue'));

	if(strTable.toLowerCase()=="opencall")
	{
		//-- open call detail in modal
		app._open_call_form("cdf",varKeyValue,true,window)
		app.fireEvent(aRow,"click");

	}
	else
	{
		var editform = app.dd.tables[strTable].editform;
		if(editform!="")
		{
			_mes_current_table = "";
			app.OpenFormForEdit(editform,varKeyValue,"",true,function(formReturnInfo)
			{
				load_mes_url(strTable,strKeyCol, varKeyValue); //-- redload acive page in case user changed record
			});
		}
	}
}


//-- select first row after getting data
function mes_select_firstrow(mesResultDiv)
{
	var oDataHolder = app.get_parent_child_by_id(mesResultDiv,'div_data');
	if(oDataHolder!=null)
	{
		var aTable = oDataHolder.childNodes[0];
		if(aTable.rows.length>0)
		{
			mes_datarow_selected(aTable.rows[0]);
		}
		else
		{
			//-- clear data form
			load_mes_url("", "");
		}
	}
}

//-- functions used by forms loaded into the work space
var _mes_current_table = "";
var _mes_current_key = "";
function load_mes_url(strTable, strKeyCol, varKeyValue)
{
	//-- do not load url when already loaded
	if(_mes_current_table!="")
	{
		//if(_mes_current_table==strTable && _mes_current_key==varKeyValue) return;
	}
	_mes_current_table=strTable;
	_mes_current_key=varKeyValue;

	//-- how do we find out which form to load
	var iframeData = app.oWorkspaceFrameHolder.document.getElementsByTagName("IFRAME");
	if(iframeData[0])
	{
		//var fDoc = app.getFrameDoc(iframeData[0].name,document);
		//var strPath = fDoc.location.href.split("?");
		var strBinding = strTable+"."+strKeyCol;
		var strURL = app.trim(app.dd.GetGlobalParam("Active Folder Pages/"+strBinding));
		//alert(strBinding)
		if(strURL!="")
		{	
			strURL = app._swc_parse_variablestring(strURL);

			strURL += "?ColourScheme=4&sessid=" + app.pfu(app._swsessionid) + "&swsessionid=" + app.pfu(app._swsessionid) + "&"+strKeyCol+"=" + app.pfu(varKeyValue);
			iframeData[0].contentWindow.document.location.href = strURL;

			_swc_check_document_hrefs(iframeData[0]);
		}
		else
		{
			if(strKeyCol!="")alert("There is no active folder page definition for this database entity search. Please contact your Administrstor.");
			iframeData[0].contentWindow.document.body.innerHTML = "";
		}
	}


}
