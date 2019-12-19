document.tables = new Array();

var isIE  = (window.ActiveXObject);
var arr_button_menus = new Array();

var formWidth = 0;
var formHeight = 0;

var arrElements = new Array();	//-- hold pointers to all elements
var arrMainTabControlElements = new Array(); //-- hold pointer to elements based on main tab item they are on (mainform , extform etc)
var arrFormTabControls = new Array(); //-- holds pointers to elements that are tabcontrols


//--
//-- called when an element gets focus
//-- we can use this to check if the element has a special binding (opencall.probcode etc)
function __form_field_focus(e)
{
	if (!e) var e = window.event;
	var oEle = (window.event) ? e.srcElement : e.target;

	if(oEle==null)
	{	
		alert("__form_field_focus : no element")
		return false;
	}

	//-- store elements value in attribute
	var strEleValue = __get_form_element_value(oEle);
	oEle.setAttribute("oldvalue",strEleValue);
	
	//--
	//-- call _OnClicked event for this element if there is one
	var strElementClickFunction = oEle.id + "_OnClicked";
	if(__exists(strElementClickFunction))
	{
		var strFunctionCall = strElementClickFunction + "(oEle)";
		eval(strFunctionCall);
	}

	//-- check if we have a picker if so load it and then lose focus
	var strPicker = oEle.getAttribute("pickaction");
	if((strPicker!=null)&&(strPicker!=""))
	{
		__process_pickaction(oEle, strPicker,e)
	}
}

//--
//-- launch a pick action, something like profile codes
function __process_pickaction(oEle, strAction,e)
{
	switch(strAction)
	{
		case "problemprofile":
			alert("show problem profile picker");
			break;
		case "resolutionprofile":
			alert("show resolution profile picker");
			break;
		case "date":
			__select_date(oEle,e);
			break;
		case "datetime":
			break;
	}
}

//--
//-- called when input element or select value changes
//-- we can then use this to trigger data binding and calling of form specific functions and actions
function __form_field_changed(e, oEle)
{

	if(oEle==undefined)
	{	
		if (!e) var e = window.event;
		var oEle = (window.event) ? e.srcElement : e.target;

		if(oEle==null)
		{
			alert("__form_field_changed : no element")
			return false;
		}
	}
	
	var strTable = "";
	var strColumn = "";
	var strOldDBValue = oEle.getAttribute("oldvalue");
	var strNewDBValue = __get_form_element_value(oEle);
	var strBinding = oEle.getAttribute("binding");
	if(strBinding!=null)
	{
		//-- we have a binding then set it using document.tables[]
		var arrBindInfo = strBinding.split(".");
		if((document.tables[arrBindInfo[0]]!= undefined))
		{
			var strTable = arrBindInfo[0];
			var strColumn = arrBindInfo[1];
			var strOldDBValue = document.tables[arrBindInfo[0]][arrBindInfo[1]];
			if(strOldDBValue==undefined)strOldDBValue = "";

			//-- check if this table has an auto resolve
			if(document.tables[arrBindInfo[0]].__autoresolve!=undefined)
			{
				if(document.tables[arrBindInfo[0]].__autoresolve==1)
				{
					//-- auto resolve this record
					__resolve_record(strTable,strColumn,strNewDBValue,1);

					//-- then get out of here
					return true;
				}
			}

			//-- set the binding
			document.tables[arrBindInfo[0]][arrBindInfo[1]] = strNewDBValue;
			document.tables[arrBindInfo[0]].__origvalues[arrBindInfo[1]] = strOldDBValue;

			//-- see if this data binding is being used in any filters or listboxes
			__check_form_element_filters(arrBindInfo[0]);

		}
	}

	__check_element_hint(oEle,strNewDBValue);

	//-- call the standard OnRecordValueChanged event
	if(__exists("OnRecordValueChanged"))
	{
		OnRecordValueChanged(strTable,strColumn, strNewDBValue , strOldDBValue);
	}


	//--
	//-- call onValueChanged event for this element if there is one
	var strElementChangeFunction = oEle.id + "_OnValueChanged";
	if(__exists(strElementChangeFunction))
	{
		var strFunctionCall = strElementChangeFunction + "(strTable,strColumn, strNewDBValue , strOldDBValue)";
		eval(strFunctionCall);
	}

}

//--
//-- for a form element get its value depending on type
//-- also if value is empty check for defaults and any hint text
function __get_form_element_value(oEle)
{
	var strUseValue = app.getEleValue(oEle);//.value;

	//-- check if this element has a hint value
	//-- if so and its value = ele value return "";
	var strHint = oEle.getAttribute("hint");
	if((strHint==strUseValue)&&(strHint!=""))return "";


	//-- check if the form element value has a @@
	if(isNaN(strUseValue))
	{
		if(strUseValue.indexOf("@@")==0)
		{
			strUseValue = parse_javascript_string(strUseValue);
		}
	}
	return strUseValue;
}

//--
//-- for a form element set its value to that of its binding depending on type
//-- also if value is empty check for defaults and any hint text
function __update_form_element_value(oEle, strGetValueFromBinding)
{
	var strBinding = strGetValueFromBinding;
	if((strGetValueFromBinding== undefined)||(strGetValueFromBinding==""))
	{
		strBinding = oEle.getAttribute("binding");
	}

	if(strBinding!=null)
	{
		//-- we have a binding then set it using document.tables[]
		var arrBindInfo = strBinding.split(".");
		if((document.tables[arrBindInfo[0]]!= undefined))
		{
			var strTable = arrBindInfo[0];
			var strColumn = arrBindInfo[1];
			var strNewElementValue = document.tables[arrBindInfo[0]][arrBindInfo[1]];

			//-- see if this data binding is being used in any filters or listboxes
			__check_form_element_filters(arrBindInfo[0]);

			__check_element_hint(oEle,strNewElementValue);
		}
	}
}

function __check_element_hint(oEle,strValue)
{
		//-- if this element has a hint and the value being linked is "" show the hint
		//-- also change the color of the text
		var strHint = oEle.getAttribute("hint");
		if((strValue=="")&&(strHint!=null)&&(strHint!=""))
		{
			oEle.style.color = "#c0c0c0";;
			app.setEleValue(oEle,strHint);
		}
		else
		{
			oEle.style.color = "#000000";
			app.setEleValue(oEle,strValue)
		}
}
//--
//-- for a form element set its value 
//-- if has a binding set that also
function __set_form_element_binding_value(oEle, strValue)
{
	strBinding = oEle.getAttribute("binding");
	if(strBinding!=null)
	{
		//-- we have a binding then set it using document.tables[]
		var arrBindInfo = strBinding.split(".");
		if((document.tables[arrBindInfo[0]]!= undefined))
		{
			var strTable = arrBindInfo[0];
			var strColumn = arrBindInfo[1];
			document.tables[arrBindInfo[0]][arrBindInfo[1]]= strValue;
			__check_element_hint(oEle,strValue);
		}
	}
}


//-- true or fals eif object exists
function __exists(strObjectName)
{
    return (typeof(this[strObjectName])!='undefined')?true:false;
}

//-- resolve a record on the form
function __resolve_record(strTable,strCol,strValue,intLike,strDSN)
{
	if(document.tables[strTable]==undefined)
	{
		alert("The resolve table (" + strTable + ") is not bound to this form. Please contact your Supportworks Administrator");
		return null;
	}
	
	if(intLike==undefined)intLike=0;

	//-- if we have a OnResolveRecord function for this form
	if(__exists("OnResolveRecord"))
	{
		//-- if returns false it means we want to cancel the resolve process
		if(OnResolveRecord(strTable,strCol,strValue)==false) return false;
	}	

	//--
	//-- if not doing a like then resolve record straight off
	var oRec=app.get_record(strTable, strCol, strValue,document.tables[strTable], intLike, strDSN);
	if(oRec=="NORECORD")
	{
		//-- create new record
		if(confirm("There are no records in the database that match your criteria. Would you like to create a new one?"))
		{
			alert("Add new record " + document.tables[strTable].__addform);
		}
	}
	else if(oRec=="MORETHANONERECORD")
	{
		//-- more than one record so show picklist
		if(document.tables[strTable].__picklist!="")
		{
			app.pick_record(document.tables[strTable].__picklist, __picklist_record_resolved);
		}
		else
		{
			alert("The picklist setting for the resolve record ("+strTable+") is missing. Please contact your Supportworks Administrator.");
		}
	}
	else
	{
		//-- have record so set against document bound record and then fill in form fields
		document.tables[strTable] = oRec;
		eval(strTable + " = oRec");
		__record_resolved(strTable);
	}
	return true;
}

//--
//-- called once a pick_record is performed
function __picklist_record_resolved(strTable, strColumn, strKeyValue)
{
	__resolve_record(strTable,strColumn,strKeyValue,0,"swdata");
}


//--
//-- called once a pick_record is performed
function __record_resolved(strTable)
{
	__check_form_element_filters(strTable);
	__load_record_into_form(strTable);

	if(__exists("OnRecordResolved"))
	{
		OnRecordResolved(strTable);
	}	
}


//-- find any elements that might have a filter based on this table or that have a USE value (like select boxes) 
function __check_form_element_filters(strTable)
{

	var strCurrentFilter = "";
	var strFilter   = "";
	var strUseValue = "";
	var strCurrentValue = "";
	var strMatch = "@@" + strTable + ".";

	for (var x=0; x < arrElements.length ; x++)
	{
		//if(arrElements[x].id=="")continue;

		strFilter = arrElements[x].getAttribute("filter");
		if((strFilter!=null)&&(strFilter.indexOf(strMatch)!=-1))
		{
			//-- this element has filter that uses this table
			//-- parse it out and reload element data based on the new filter
			strFilter = parse_javascript_string(strFilter);
			strCurrentFilter = arrElements[x].getAttribute("applyfilter");
			if(strCurrentFilter != strFilter)
			{
				//-- filter has changed so set it and then re-filter the elemeet
				arrElements[x].setAttribute("applyfilter",strFilter);
				__apply_element_filter(arrElements[x]);
			}
		}

		strUseValue = arrElements[x].value;
		if((strUseValue!=null)&&(strUseValue.indexOf(strMatch)!=-1))
		{
			//-- this element has a value that uses this table for some binding
			//-- typically will be a select box but could also be a label or textarea)
			strUseValue = parse_javascript_string(strUseValue);

			//-- value is diffferent so set
			//alert(arrElements[x].id + " : " + strUseValue)
			__set_form_element_binding_value(arrElements[x], strUseValue);
		}

	}

}

//-- given a table name load form field values based on table record
function __load_record_into_form(strTable)
{
	if(document.tables[strTable]==undefined)
	{
		alert("The table (" + strTable + ") is not bound to this form. Please contact your Supportworks Administrator");
		return null;
	}

	var strBinding="";
	for (var x=0; x < arrElements.length ; x++)
	{
		strBinding = arrElements[x].getAttribute("binding");
		if((strBinding!=null)&&(strBinding.indexOf(strTable)==0))
		{
			//-- this element is bound to this table so update value
			__update_form_element_value(arrElements[x]);
		}
	}
}

//-- given an element get its applyfilter setting and refresh its contents
//-- need to handle picklists and 
function __apply_element_filter(anElement)
{
	if(anElement==undefined)anElement=this;

	//-- get type of element
	var strClass= anElement.className;
	switch(strClass)
	{
		case "sqllist":
			__filter_sqllist(anElement)
			break;
		case "dbpicklist":
			__filter_picklist(anElement)
			break;
	}
}

//--
//-- used to set elements filter
function __set_element_filter(strFilter, anElement)
{
	if(anElement==undefined)anElement=this;
	anElement.setAttribute("filter",strFilter);

	//-- set apply filter
	strFilter = parse_javascript_string(strFilter);
	anElement.setAttribute("applyfilter",strFilter);

	anElement.Refresh();
	
}

//-- order a sqllist - sets atts then refresh
function __order_sqllist_column(aColHeader)
{
	var oList = app.get_parent_owner_by_tag(aColHeader, "DIV");
	var strOrderDir= oList.getAttribute("orderdir");

	var strNewOrderDir = (strOrderDir.toLowerCase()=="asc")?"DESC":"ASC";
	oList.setAttribute("orderby",aColHeader.colid);
	oList.setAttribute("orderdir", strNewOrderDir);

	//-- now reload
	oList.Refresh();
}

//-- filter a sqllist
function __filter_sqllist(anElement)
{
	//-- get sqllist properties
	var strID = anElement.id;
	var strFilter = anElement.getAttribute("applyfilter");
	if(strFilter==null)
	{
		//-- create apply filter
		var strOrigFilter =	anElement.getAttribute("filter");
		strFilter = parse_javascript_string(strOrigFilter);
		anElement.setAttribute("applyfilter",strFilter);
	}

	var strOrderBy= anElement.getAttribute("orderby");
	var strOrderDir= anElement.getAttribute("orderdir");

	var strURL  = app.portalroot + "php/xmlhttp/filter_sqllist.php?in_sqllist=" + strID + "&in_formname=" + _FORMNAME + "&in_formtype=" + _FORMTYPE + "&in_filter=" + strFilter + "&in_orderby=" + strOrderBy + "&in_orderdir=" + strOrderDir;
	var strResult = app.run_php(strURL, true);

	anElement.innerHTML = strResult;

	var oTable = app.get_parent_child_by_tag(anElement,"TABLE");
	anElement.setAttribute("rowCount",oTable.rows.length-1);

	//--
	//-- check and call sqllist OnLoaded
	var strListLoadedFunction = anElement.id + "_OnDataLoaded";
	if(__exists(strListLoadedFunction))
	{
		var strFunctionCall = strListLoadedFunction + "(anElement)";
		eval(strFunctionCall);
	}
}

//--
//-- filter a db picklsit
function __filter_picklist(oEle)
{
	var strDSN = oEle.getAttribute("dsn");
	var strTable = oEle.getAttribute("table");
	var strFilter = oEle.getAttribute("applyfilter");
	var strKeyCol = oEle.getAttribute("keycol");
	var strTextCol = oEle.getAttribute("txtcol");
	if((strTextCol==null) || (strTextCol=="")) strTextCol = strKeyCol;

	var strURL  = app.portalroot + "php/xmlhttp/filter_listbox.php?&in_dsn=" + strDSN+ "&in_table=" + strTable + "&in_keycol=" + strKeyCol +"&in_txtcol="+ strTextCol + "&in_filter=" + strFilter;
	var strResult = app.run_php(strURL, true);
	var oXML = app.create_xml_dom(strResult);
	if(oXML)
	{
		var arrOptions = oXML.documentElement.childNodes;
		for(var x=0;x<arrOptions.length;x++)
		{
			oEle.options[oEle.options.length++] = new Option(app.getElementText(arrOptions[x]) , arrOptions[x].getAttribute("value"));;
		}
	}
}


//--
//-- ELEMENT PRIVATE EVENT HANDLERS

//-- handle sqllist events
function __select_sqllist_row(aRow)
{
	//-- get row div holder - fron there can get element id
	var oSqlListDiv = app.get_parent_owner_by_tag(aRow, "DIV");
	var oTable = app.get_parent_owner_by_tag(aRow, "TABLE");

	//-- change style
	var oCurrRow = oTable.getAttribute("currow");
	if(oCurrRow!=null)
	{
		oCurrRow.style.backgroundColor="";
		oCurrRow.style.color="#000000";
	}
	aRow.style.backgroundColor="#000080";
	aRow.style.color="#ffffff";

	//-- set attributes
	oSqlListDiv.setAttribute("curSel",aRow.rowIndex-1);
	oTable.setAttribute("currow",aRow);



	var strSqlID = oSqlListDiv.id;
	var strSelectRowFunction = strSqlID + "_OnRowSelected";
	if(__exists(strSelectRowFunction))
	{
		var strFunctionCall = strSelectRowFunction + "(aRow.rowIndex-1)";
		eval(strFunctionCall);
	}
}

function __check_sqllist_row(aCheckbox)
{
	//-- get row div holder - fron there can get element id
	var oSqlListDiv = app.get_parent_owner_by_tag(aCheckbox, "DIV");
	var strSqlID = oSqlListDiv.id;
	var aRow = app.get_parent_owner_by_tag(aCheckbox, "TR");

	var strSelectRowFunction = strSqlID + "_OnRowChecked";
	if(__exists(strSelectRowFunction))
	{
		//--get checkbox row

		var strFunctionCall = strSelectRowFunction + "(aRow.rowIndex-1,aCheckbox.checked)";
		eval(strFunctionCall);
	}

	var intSelectRowOnCheck = oSqlListDiv.getAttribute("selectoncheck");
	if(intSelectRowOnCheck==1)
	{
		//-- if checking allow select row function to propogate
		if(!aCheckbox.checked)
		{
			//-- unchecking so clear row selection
			aRow.style.backgroundColor="";
			aRow.style.color="#000000";

			//-- reset selected row att if required
			var oTable = app.get_parent_owner_by_tag(aRow, "TABLE");
			var oCurrRow = oTable.getAttribute("currow");
			if(oCurrRow==aRow)oTable.setAttribute("currow",null);

			//-- cancel select
			event.cancelBubble=true;
		}
	}
	else
	{
		//-- cancel bubble so the row onclick event isnt fired as check box is child)
		event.cancelBubble=true;
	}
}


//-- handle button press
function __button_pressed(aButton)
{

	if(aButton.className=="button")
	{
		//-- check to see if we have a onpressed function for this button 
		var strButtonPressedFunction = aButton.id + "_OnPressed";
		if(__exists(strButtonPressedFunction))
		{
			var strFunctionCall = strButtonPressedFunction + "(aButton)";
			eval(strFunctionCall);
		}
	}
	else if(aButton.className=="menubutton")
	{
		//-- popup or dropdown button menu items
		var intExpanded = aButton.getAttribute("expanded");
		if((intExpanded==null)||(intExpanded==0))
		{
			__document_clicked(); //-- hide any other open menus

			//-- show menu items
			__show_btn_menu(aButton);
		}
		else
		{
			//-- hide menu items
			__hide_btn_menu(aButton);
		}

		//-- so __document_clicked not excited
		event.cancelBubble=true;
	}
}

//-- date picker
var currDateFocus = null;
function __select_date(oEle,e)
{
	if (!e) var e = window.event; //-- ie
	//-- cancel bubbling
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

	currDateFocus = oEle;
	show_date(e,__paste_date);

}
function __paste_date(aDate)
{
	hide_date();
	currDateFocus.setAttribute("dbvalue",date_epoch(aDate));
	__form_field_changed(null, currDateFocus);

	//currDateFocus.value = app.date_ddmmyyyy(aDate);
}


//-- MENU BUTTON
//-- helpers for menu button
function __create_btn_menu(aBtn)
{
	var strMenuList = "";
	var strMenuItems = aBtn.getAttribute("menuitems");
	if(strMenuItems!=null)
	{
		strMenuList = "<table cellspacing=0 cellpadding=0 border=0>";

		var arrItems = strMenuItems.split("|");
		for(var x=0;x< arrItems.length;x++)
		{
			var arrMenuItem = arrItems[x].split("^");
			var strID = arrMenuItem[0];
			var strText = arrMenuItem[1];
			strMenuList += "<tr menuid='" + strID + "' btnid='" + aBtn.id + "' onclick='__select_btnmenu(this)' onmouseover='__hilite_btnmenu(this)' onmouseout='__lolite_btnmenu(this)'><td class='btnmenu_tdone'></td><td>" + strText + "</td><td class='btnmenu_tdthree'></td></tr>";
		}

		strMenuList += "</table>";
	}

	var strDIV = "<div class='mnubtn_div'>"+ strMenuList + "</div>";
	//-- 04.06.2004 - NWJ - Created - given node and html insert that html into the node (used for creating elements)
	var oDiv = insertBeforeEnd(document.body,strDIV);
	aBtn.setAttribute("menu",oDiv);
	return oDiv;
}

function __show_btn_menu(aBtn)
{
	//-- get button menu, if null create it
	var divMenu = aBtn.getAttribute('menu');
	if(divMenu==null)divMenu = __create_btn_menu(aBtn);

	//-- position the div
	divMenu.style.display="inline";
	divMenu.style.top = aBtn.offsetTop + aBtn.offsetHeight;
	divMenu.style.left = aBtn.offsetLeft - (divMenu.offsetWidth - aBtn.offsetWidth);
	aBtn.setAttribute("expanded",1);
	arr_button_menus[aBtn.id] = aBtn;
}

function __hide_btn_menu(aBtn)
{
	var divMenu = aBtn.getAttribute('menu');
	if(divMenu==null) return;

	divMenu.style.display="none";
	aBtn.setAttribute("expanded",0);
}

function __lolite_btnmenu(aRow)
{
	aRow.children[0].style.backgroundColor="#808080";
	aRow.style.backgroundColor="";
	aRow.style.backgroundTransparency="";
	aRow.style.color="";
}

function __hilite_btnmenu(aRow)
{
	aRow.children[0].style.backgroundColor="#000080";
	aRow.style.backgroundColor="#000080";
	aRow.style.color="#ffffff";
}

function __select_btnmenu(aRow)
{
	var strButtonID = aRow.getAttribute("btnid");

	//-- hide menu
	var oBTN = e(strButtonID);
	if(oBTN!=null)__hide_btn_menu(oBTN);


	var strMenuID = aRow.getAttribute("menuid");
	var strText = aRow.children[1].innerHTML;

	//-- check to see if we have a onpressed function for this button 
	var strButtonPressedFunction = strButtonID + "_OnMenuItem";
	if(__exists(strButtonPressedFunction))
	{
		var strFunctionCall = strButtonPressedFunction + "(strText,strMenuID)";
		eval(strFunctionCall);
	}
}
//-- EOF MENU BUTTON

//-- COMMON FORM CONTROL METHODS

function __set_element_visible(boolVisible, oEle)
{
	if(oEle==undefined)oEle = this;
	oEle.style.visibility=(boolVisible)?"visible":"hidden";
}

function __set_element_enable(boolEnable, oEle)
{
	if(oEle==undefined)oEle = this;
	oEle.disabled=(!boolEnable);
}

function __set_element_readonly(boolReadOnly, oEle)
{
	if(oEle==undefined)oEle = this;
	oEle.readonly=boolReadOnly;
}


//-- EOF COMMO N FORM CONTROL METHODS

//-- given a string parse out any js variables
var VAR_START = "@@";
var VAR_END = "@@";
function parse_javascript_string(strParse)
{
	var startPos = strParse.indexOf(VAR_START);
	while (startPos != -1)
	{
		cutString = strParse.substring(startPos,strParse.length);
		endPos = cutString.indexOf(VAR_END,2);
	
		strFullVariable = cutString.substring(0,endPos+2);
		strValVariable = cutString.substring(2,endPos);
		strActualValue = eval(strValVariable);
		strParse = app.string_replace(strParse, strFullVariable,strActualValue,true);
		
		startPos = strParse.indexOf(VAR_START);
	}
	return strParse;
}






//--
//-- OTHER PRIVATE FORM HELPERS

//--
//--
function store_form_elements()
{

	//-- get main tab control current tab
	//var oTabControl = document.getElementById("tabForm");
	//var strCurrentTabID = oTabControl.getAttribute("current_tabid");


	arrElements = document.getElementsByTagName("*");//app.get_all_elements(aTabItem);
	for(var x=0; x<arrElements.length; x++)
	{

		if(arrElements[x].getAttribute("binding")!=null)
		{
		//var strElementForm = arrElements[x].getAttribute("formname");
		//if((strElementForm!=null)&&(strElementForm!=""))
		//{

			//if(arrMainTabControlElements[strElementForm]==undefined)arrMainTabControlElements[strElementForm] = new Array();
			//arrMainTabControlElements[strElementForm][arrElements[x].id] = arrElements[x];

			//-- hide those that are not part of the first tab item of main tabcontrol
			//if(strElementForm!=strCurrentTabID)arrElements[x].style.display = "none";//arrElements[x].style.visibility = "hidden";

			//-- if has a filter add filter method to function
			if(arrElements[x].getAttribute("filter")!=null)
			{
				arrElements[x].Refresh = __apply_element_filter;
				arrElements[x].set_filter = __set_element_filter;
			}

			//-- common methods per control
			arrElements[x].SetVisible = __set_element_visible;
			arrElements[x].SetEnable = __set_element_enable;
			arrElements[x].SetReadonly = __set_element_readonly;
			//-- events
			arrElements[x].onfocus = __form_field_focus;
			arrElements[x].onchange = __form_field_changed;
			

			//-- store in tab control array if a tab control
			//if(arrElements[x].className=="tabcontrol")arrFormTabControls[arrElements[x].id] = arrElements[x];
		//}
		}
	}

	//-- loop through tab controls and then get the elements that are linked to it
	/*
	for(strTabControlID in arrFormTabControls)
	{
		//-- init tabcontrol array items
		var arrTabControlElements = arrFormTabControls[strTabControlID].getAttribute("linkeditems");
		if(arrTabControlElements==null)arrTabControlElements = new Array();
		
		//-- get form that it is on and get elements based on that form
		var checkElement = null;
		var strElementForm = arrFormTabControls[strTabControlID].getAttribute("formname");
		var arrCheckElements = arrMainTabControlElements[strElementForm];//(strElementForm=="mainform")?mainformElements:extformElements;
		for(strElementID in arrCheckElements)
		{
			//-- if bound to curr tabcontrol that we are testing
			checkElement = arrCheckElements[strElementID];
			//alert(checkElement)
			strTabControlBind = checkElement.getAttribute("tabcontrol");
			if((strTabControlBind!=null)&&(strTabControlBind.indexOf(strTabControlID+":")==0))
			{
				//-- store multid array against tab control [tabitemid][elementid] = oElement 
				var arrTabItemInfo = strTabControlBind.split(":");
				//-- create md array if not defined
				if(arrTabControlElements[arrTabItemInfo[1]]==undefined)arrTabControlElements[arrTabItemInfo[1]] = new Array();
				arrTabControlElements[arrTabItemInfo[1]][strElementID] = checkElement;
			}
		}
		arrFormTabControls[strTabControlID].setAttribute("linkeditems",arrTabControlElements);
	}
	*/
}

//--
//-- handle a form element tab control item being selected
function select_tabcontrol_item(aTabItem)
{
	//-- check if this is a form tab control if so handle differently
	var oTabControl = aTabItem.parentNode.parentNode;

	//-- get current tab item info
	var current_tabid = oTabControl.getAttribute("current_tabid");
	var curr_tabindex = oTabControl.getAttribute("current_tabindex");
	if((curr_tabindex==strTabIndex)&&(curr_tabindex!=null)) return;

	//-- reset old tab style
	var curr_tab = oTabControl.childNodes[0].childNodes[curr_tabindex];
	curr_tab.className = "tabitem";
	hide_tabitem_elements(oTabControl, current_tabid);

	//-- get new tab item info - and show its elements
	var strTabControlID = aTabItem.getAttribute("tabcontrol");
	var strTabIndex = aTabItem.getAttribute("tabindex");
	var strTabID = aTabItem.getAttribute("tabid");
	//-- set new tab item style and show elements
	var new_tab = oTabControl.childNodes[0].childNodes[strTabIndex];
	new_tab.className = "tabitem-selected";
	show_tabitem_elements(oTabControl, strTabID);

	//-- reset tabcontrol atts
	oTabControl.setAttribute("current_tabid", strTabID);
	oTabControl.setAttribute("current_tabindex", strTabIndex);

	aTabItem.blur();
}

//-- hide tab item elements for a tab control and tabid
function hide_tabitem_elements(oTabControl, strTabID)
{
	for(strElementID in oTabControl.linkeditems[strTabID])
	{
		//oTabControl.linkeditems[strTabID][strElementID].style.visibility="hidden";
		oTabControl.linkeditems[strTabID][strElementID].style.display="none";
		if(oTabControl.linkeditems[strTabID][strElementID].className=="tabcontrol")
		{
			//-- there is tab control on this tab item - so hide its active tab elements
			var childTabIdtemIndex = oTabControl.linkeditems[strTabID][strElementID].getAttribute("current_tabid");
			hide_tabitem_elements(oTabControl.linkeditems[strTabID][strElementID], childTabIdtemIndex);
		}
	}
}

//-- show tab item elements for a tab control and tabid
function show_tabitem_elements(oTabControl, strTabID)
{
	for(strElementID in oTabControl.linkeditems[strTabID])
	{
		//oTabControl.linkeditems[strTabID][strElementID].style.visibility="visible";
		oTabControl.linkeditems[strTabID][strElementID].style.display="inline";
		if(oTabControl.linkeditems[strTabID][strElementID].className=="tabcontrol")
		{
			//-- there is tab control on this tab item - so hide its active tab elements
			var childTabIdtemIndex = oTabControl.linkeditems[strTabID][strElementID].getAttribute("current_tabid");
			show_tabitem_elements(oTabControl.linkeditems[strTabID][strElementID], childTabIdtemIndex);
		}
	}
}


//--
//-- Handle one of the window tab items being clicked (mainform, extform, diary)
function select_formtabcontrol_item(aTabItem)
{
	//-- check if this is a form tab control if so handle differently
	var oTabControl = aTabItem.parentNode.parentNode;
	var strTabControlID = aTabItem.getAttribute("tabcontrol");

	var strTabIndex = aTabItem.getAttribute("tabindex");
	var strTabID = aTabItem.getAttribute("tabid");

	//-- if clicking on the current active item get out of function
	var curr_tabindex = oTabControl.getAttribute("current_tabindex");
	if((curr_tabindex!=null)&&(curr_tabindex==strTabIndex)) return;


	//-- reset old tab style
	var curr_tab = oTabControl.childNodes[0].childNodes[curr_tabindex];
	curr_tab.className = "tabitem";
	
	//--
	//-- hide show form elements
	var arrInfo = new Array();
	for(var x=0; x<arrElements.length; x++)
	{
		var strElementForm = arrElements[x].getAttribute("formname");
		if((strElementForm!=null)&&(strElementForm!=""))
		{	
			//-- we can use this
			if (strElementForm==strTabID)
			{
				//-- if this element tab is active show it
				if(element_tabcontrol_visible(arrElements[x]))
				{
					//arrElements[x].style.visibility = "visible";
					arrElements[x].style.display = "inline";
				}
				else
				{
					//arrElements[x].style.visibility = "hidden";
					arrElements[x].style.display = "none";
				}
			}
			else
			{
				//arrElements[x].style.visibility = "hidden";
				arrElements[x].style.display = "none";
			}
		}
	}

	//-- store new attributes
	oTabControl.setAttribute("current_tabid",strTabID);
	oTabControl.setAttribute("current_tabindex",strTabIndex);
	aTabItem.className = "tabitem-selected";
	aTabItem.blur();

	//-- call tabid_OnFormDrawn(boolFirstTime)
	var strFormDrawnFunction = strTabControlID + "_OnTabItemSelected";
	if(__exists(strFormDrawnFunction))
	{
		var strFunctionCall = strFormDrawnFunction + "(strTabID)";
		eval(strFunctionCall);
	}
}

//--
//-- return true or false if an element, bound to a tab control, should be visible
//-- we use this when tabbing from form tab to form tab (mainform to extform)
function element_tabcontrol_visible(oEle)
{
	var strTabControlSetting = oEle.getAttribute("tabcontrol");
	if((strTabControlSetting!=null)&&(strTabControlSetting!=""))
	{
		//-- we can use this
		var arrInfo = strTabControlSetting.split(":");
		var strTabControlID = arrInfo[0];
		var strTabID = arrInfo[1];

		//-- get tabcontrol element and see if its active tab = strTabID
		var eleTabControl = document.getElementById(strTabControlID);
		if(eleTabControl!=null)
		{
			if(eleTabControl.style.visibility=="hidden") return false;
			var strActiveTabID = eleTabControl.getAttribute("current_tabid")
			if(strActiveTabID!=null)
			{
				return (strTabID==strActiveTabID);
			}
		}
	}
	return true;
}

//--
//-- function to help resize form controls
function resize_form_controls()
{
	//-- resize visible form elements first (looks faster to the user)
	var oTabControl = document.getElementById("tabForm");
	var strTabID = oTabControl.getAttribute("current_tabid");

	if(oTabControl!=null)
	{
		oTabControl.style.width=document.body.clientWidth-1;
		oTabControl.style.height=document.body.clientHeight-55;
	}

	//-- resize active elements first (visible) (so looks fast to user)
	resize_array_elementcontrols(arrMainTabControlElements[strTabID]);

	//-- no resize the others
	for(strMainTabID in arrMainTabControlElements)
	{
		if(strMainTabID!=strTabID)	resize_array_elementcontrols(arrMainTabControlElements[strMainTabID]);
	}

/*	if(strTabID=="mainform")
	{
		resize_array_elementcontrols(mainformElements);
		resize_array_elementcontrols(extformElements);
	}
	else
	{

		resize_array_elementcontrols(extformElements);
		resize_array_elementcontrols(mainformElements);
	}
*/
}

function resize_array_elementcontrols(arrayElements)
{
	var oEle=null;
	var strResize = "";
	var arrSizeInfo = new Array();
	var percWidth=percHeight=percTop=percLeft=0;
	for(strID in arrayElements)
	{
		oEle = arrayElements[strID];
		strResize = oEle.getAttribute("resize");
		if(strResize!="")
		{
			arrSizeInfo=strResize.split(";");

			percWidth = arrSizeInfo[0].split(":")[1];//--width
			percHeight = arrSizeInfo[1].split(":")[1];//--height
			percTop =	arrSizeInfo[2].split(":")[1];//--top
			percLeft =	arrSizeInfo[3].split(":")[1];//--left
			
			//-- if we have resize att the run
			if((percWidth!="")||(percHeight!="")||(percTop!="")||(percLeft!=""))resize_element(oEle,percWidth,percHeight,percTop,percLeft);
		}
	}
}

//-- resize a form element
function resize_element(oEle,percWidth,percHeight,percTop,percLeft)
{

	var intWDiff=intHDiff=0;
	var origTop = oEle.getAttribute("otop");
	var origLeft = oEle.getAttribute("oleft");
	var origWidth = oEle.getAttribute("owidth");
	var origHeight = oEle.getAttribute("oheight");

	//-- not set so set now
	if(origTop==null)
	{
		origTop = oEle.offsetTop
		origLeft = oEle.offsetLeft
		origWidth = oEle.offsetWidth
		origHeight = oEle.offsetHeight

		//-- not sure where the tab control gets addition 22px but need to remove it
		if(oEle.className=="tabcontrol")
		{
			origHeight=origHeight-22;
		}

		oEle.setAttribute("otop",origTop);
		oEle.setAttribute("oleft",origLeft);
		oEle.setAttribute("owidth",origWidth);
		oEle.setAttribute("oheight",origHeight);
	}


	if(document.body.clientWidth>formWidth)
	{
		intWDiff = ((document.body.clientWidth-formWidth) / 100);
		if((percWidth>0)&&(percWidth!=""))
		{		
			//alert(intWDiff + " : " + percWidth + ":" + intWDiff * percWidth)
			oEle.style.width=(intWDiff * percWidth) + origWidth;
		}
		if((percLeft>0)&&(percLeft!=""))
		{
			oEle.style.left=(intWDiff * percLeft) + origLeft;
		}
	}
	else
	{
		oEle.style.width= origWidth;
		oEle.style.left= origLeft;
	}
	if(document.body.clientHeight>formHeight)
	{

		intHDiff = ((document.body.clientHeight-formHeight)/100);
		if((percHeight>0)&&(percHeight!=""))
		{

			oEle.style.height=(intHDiff * percHeight) + origHeight;
		}
		if((percTop>0)&&(percTop!=""))
		{
			oEle.style.top=(intHDiff * percTop) + origTop;
		}
	}
	else
	{
		//alert(origTop + " :" + origHeight + " : " + oEle.id)
		
		oEle.style.top= origTop;
		oEle.style.height= origHeight;
	}
}


//-- return element by id
function e(strID)
{
	return document.getElementById(strID);
}

//-- 04.06.2004 - NWJ - Created - given node and html insert that html into the node (used for creating elements)
function insertBeforeEnd(node,html)
{
	try
	{
		node.insertAdjacentHTML('beforeEnd', html);
		
	}
	catch(e)
	{
		//--
		//-- netscape way of inserting html ()
		var r = node.ownerDocument.createRange();
		r.setStartBefore(node);
		var parsedHTML = r.createContextualFragment(html);
		node.appendChild(parsedHTML);
	}

	return node.lastChild;
}


//-- HANDLE tabForm item selected
function tabForm_OnTabItemSelected(strTabID)
{
	if(strTabID=="diary")
	{
		//-- assume has sl_diary - refresh
		sl_diary.Refresh();
		alert("diary - refresh view")
	}
}

//-- FORM SAVE / LOAD EVENTS
//-- saves data - do not change __ functions
function __save_data()
{
	var boolOk = true;
	for(strTable in document.tables)
	{
		if(!document.tables[strTable].update()) 
		{
			alert("An error occured while updating the table [" + strTable + "]. please contact your Supportworks Administrator");
			boolOk=false;
		}
	}

	if((boolOk)&&(on_data_saved))on_data_saved();
}

function __loadform()
{
	store_form_elements();
	__resolve_record("bpm_oc_auth","pk_auth_id",strMasterKey);

	//-- call onload event for customised stuff
	if(on_form_loaded)on_form_loaded();
}


//-- document events
function __document_clicked()
{
	//-- hide any open button menus
	for(strID in arr_button_menus)
	{
		__hide_btn_menu(arr_button_menus[strID]);
	}
}

document.onclick=__document_clicked;