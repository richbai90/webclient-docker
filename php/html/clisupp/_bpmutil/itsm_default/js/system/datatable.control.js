//-- functions to support the datatables in portal


//-- nwj - 30.07.2008
function dtable_changerpp(eTB)
{
	var intValue = eTB.value;
	intValue++;intValue--;

	//-- if not a number default value
	if(isNaN(intValue))
	{
		intValue=20;
		eTb.value = intValue;
	}

	var eDiv = app.get_parent_owner_by_tag(eTB,"DIV");
	var tabHolder = app.get_parent_owner_by_id(eDiv, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;
	if(tabItem!=null)
	{
		tabItem.setAttribute("showrowcount",intValue);
		app.selecttab(tabItem);
	}


}

//-- nwj - 30.07.2008 - page table
function dtable_goto(intNewStartRowPos,oSpan)
{
	var eDiv = app.get_parent_owner_by_tag(oSpan,"DIV");
	var intCurrStart = eDiv.getAttribute('startrow');
	var intTotalRows = eDiv.getAttribute('totalrows');

	if((intTotalRows != null) && (intCurrStart!=null))
	{
		var intStartFromRow = intNewStartRowPos;
		var eRPP = eDiv.document.getElementById('tbl_rpp');
		var intRowsPerPage = (eRPP!=null)?eRPP.value:20;

		//-- cast to numbers
		intTotalRows++;intTotalRows--;
		intCurrStart++;intCurrStart--;

		if((intNewStartRowPos < 1) && (intNewStartRowPos!=-9999))
		{
			//-- move to start as going past length
			intStartFromRow=1;
		}
		else if (intNewStartRowPos==-9999)
		{
			//-- goto last page
			intStartFromRow = intTotalRows - intRowsPerPage + 1;
			
		}
		else if(intStartFromRow >= intTotalRows)
		{

			//-- trying to go past last page to stop
			intStartFromRow = intTotalRows - intRowsPerPage + 1;
		}


		if(intStartFromRow<1)intStartFromRow=1;

		var tabHolder = app.get_parent_owner_by_id(eDiv, "tab_holder");
		var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
		var tabItem = tabItemsHolder.lastTab;
		if(tabItem!=null)
		{
			tabItem.setAttribute("startfromrow",intStartFromRow);
			tabItem.setAttribute("showrowcount",intRowsPerPage);
			app.selecttab(tabItem);
		}
	}
}


//-- select a dtable row (mark it has highlighted)
//-- when set last highlighted row is unset
//-- used in function process_action
function dtable_select_row(aRow,arrActionInfo)
{
	//-- check if we have a current selected row
	//-- if so unselect it

	var eTable = app.get_parent_owner_by_tag(aRow,"TABLE");
	var currRow = eTable.getAttribute("currentrow");
	if(currRow!=null)
	{
		currRow = eTable.rows[currRow];
		currRow.getAttribute("selected");
		currRow.setAttribute("selected","0");
		//-- check if there is a preview row below if so unselect
		if(currRow.nextSibling)
		{
			if(currRow.nextSibling.className == "row-preview")
			{
				currRow.nextSibling.setAttribute("selected","0");
			}
		}
		dtable_row_lowlight(currRow);
	}
	
	//--
	//-- now select current row and preview row
	aRow.style.backgroundColor="#FFC663";//"#DFEBFB";

	if(aRow.nextSibling)
	{
		if(aRow.nextSibling.className == "row-preview")
		{
			aRow.nextSibling.style.backgroundColor="#FFC663";//"#DFEBFB";
			aRow.nextSibling.setAttribute("selected","1");
		}
	}
	//-- mark as selected and set tbody current row index
	aRow.setAttribute("selected","1");
	eTable.setAttribute("currentrow",aRow.rowIndex);
}

//-- highlight a row
function dtable_row_highlight(aRow)
{
	//-- row is set to selected
	if(aRow.getAttribute("selected")=="1") return;

	aRow.style.backgroundColor="#DFEBFB";

	//-- nwj check if there is a preview row below if so hightlight
	//-- check if rowcount is on if so need ot compensate
	if(aRow.nextSibling)
	{
		if(aRow.nextSibling.className == "row-preview")
		{
			aRow.nextSibling.style.backgroundColor="#DFEBFB";
		}
	}
}

//-- hi preview row
function dtable_previewrow_highlight(aRow)
{
	//-- row is set to selected
	if(aRow.getAttribute("selected")=="1") return;
	aRow.style.backgroundColor="#DFEBFB";

	//-- nwj check if there is a preview row below if so hightlight
	if(aRow.previousSibling)
	{
		if(aRow.previousSibling.className == "row-data-withpreview")
		{
			aRow.previousSibling.style.backgroundColor="#DFEBFB";
		}
	}
}

//-- low light a row
function dtable_row_lowlight(aRow)
{
	//-- row is set to selected
	if(aRow.getAttribute("selected")=="1") return;
	aRow.style.backgroundColor="";
	if(aRow.nextSibling)
	{
		if(aRow.nextSibling.className == "row-preview")
		{
			aRow.nextSibling.style.backgroundColor="";
		}
	}
}

//-- low light a preview row
function dtable_previewrow_lowlight(aRow)
{
	//-- row is set to selected
	if(aRow.getAttribute("selected")=="1") return;
	
	aRow.style.backgroundColor="";

	if(aRow.previousSibling)
	{
		if(aRow.previousSibling.className == "row-data-withpreview")
		{
			aRow.previousSibling.style.backgroundColor="";
		}
	}
}

//-- click on a row
function dtable_row_clicked(aRow)
{
	//-- user clicked preview row - so get prev row
	if(aRow.className == "row-preview")
	{
		if(aRow.previousSibling)
		{
			aRow = aRow.previousSibling;
		}
	}

	var strAction = aRow.getAttribute("action");
	if(strAction!="")process_action(strAction,aRow);
}

//-- double clicked
function dtable_row_dblclicked(aRow)
{
	//-- user clicked preview row - so get prev row
	if(aRow.className == "row-preview")
	{
		if(aRow.previousSibling)
		{
			aRow = aRow.previousSibling;
		}
	}

	var strAction = aRow.getAttribute("dblaction");
	if(strAction!="")process_action(strAction,aRow);
}

//-- sort table (passed in th)
function dtable_sort(aTH)
{
	var tableData = app.get_parent_owner_by_tag(aTH, "TABLE");	
	if(tableData.rows.length<3)return;

	var strColName = aTH.getAttribute("dbname");

	//-- get panel holding data
	var tabHolder = app.get_parent_owner_by_id(aTH, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;
	
	if(tabItem!=null)
	{
		//-- re trigger on click event but set order by

		var colIndex = aTH.cellIndex;
		var strDirection = tabItem.getAttribute("sortdir");
		if(strDirection==null)
		{
			strDirection="DESC";
		}
		else
		{
			strDirection=(strDirection=="DESC")?"ASC":"DESC";
		}

		tabItem.setAttribute("sortdir",strDirection);
		tabItem.setAttribute("orderby",strColName);
		app.selecttab(tabItem);
	}
}

function getElementControlArrayPos(inEle, arrEles)
{
	for(var x = 0; x < arrEles.length;x++)
	{
			if(arrEles[x]==inEle)return x;
	}
	return 0;
}

//-- filter table (passed in the listbox object)
//-- nwj - 21.07.2008 - modified to support multiple drop downs
function dtable_userfilter(aLB)
{
	//-- get tab holder and current tab item so we can get the sort order info
	var tabHolder = app.get_parent_owner_by_id(aLB, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;

	if(tabItem!=null)
	{
		//var intPos = new Number(aLB.getAttribute('lbpos'));
		var arrLBs = document.getElementsByName(aLB.name)
		var intPos = getElementControlArrayPos(aLB,arrLBs);

		var strFilterItems = tabItem.getAttribute('filteroption');
		if(strFilterItems==null) strFilterItems="0";
		var arrFilterItems = strFilterItems.split(",");

		//alert(intPos + " : " + strFilterItems + " : " + arrFilterItems)
		arrFilterItems[intPos] = aLB.selectedIndex;

		tabItem.setAttribute("startfromrow",1); // --reset paging
		tabItem.setAttribute("filteroption",new String(arrFilterItems))
		app.selecttab(tabItem);
	}
}

function refresh_table(aTableElement)
{
	var tabHolder = app.get_parent_owner_by_id(aTableElement, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");

	var tabItem = tabItemsHolder.lastTab;
	if(tabItem!=null)
	{
		app.selecttab(tabItem);	
	}
}

//--
//-- row actions
function process_action(strAction,aRow)
{
	var arrActionInfo = strAction.split(":");
	strAction = arrActionInfo[0];
	switch(strAction)
	{
		case "select":
			dtable_select_row(aRow,arrActionInfo);
			break;

		case "popup":
			row_popup(aRow,arrActionInfo)
			break;
		case "loadconent":
			row_loadcontent(aRow,arrActionInfo)
			break;

		default:
			alert("Unknown row event action");
	}
}

function row_popup(aRow, arrActionInfo)
{

	//-- get window size
	var strWinSize = arrActionInfo[1];
	if(strWinSize==undefined)strWinSize="height=600,width=800";

	strURL = aRow.getAttribute("url");
	if(strURL=="")return;

	//-- construct keyvalue to pass into url
	varKey= aRow.getAttribute("keyvalue");
	strKeyName = aRow.getAttribute("keyvar");

	//-- construct other values to pass in
	var strPassThru = "";
	var strPassThruCols= aRow.getAttribute("urlvars");
	var arrVars = strPassThruCols.split(",");

	for(var x=0; x<arrVars.length;x++)
	{
		if(strPassThru != "")strPassThru += "&";	
		strPassThru += "in_" + arrVars[x] + "=" + get_col_value(aRow,arrVars[x]);
	}
	
	strURL += "?"+strKeyName+"=" + varKey 
	if(strPassThruCols!="")strURL += "&" + strPassThru;

	pWin = openWin(strURL,"","scrollbars=yes,resizable=no,menubar=no,toolbar=no," + strWinSize);
	try
	{
		pWin.__opened_from_row = aRow; //-- store in opened window which row opened it	
	}
	catch (e)
	{
	}
}


//-- for a given row get col db value 
function get_col_value(aRow,strColName)
{
	for(var x=0;x<aRow.cells.length;x++)
	{
		var dbColName = aRow.cells[x].getAttribute("dbname");
		if((dbColName!=null)||(dbColName!=""))
		{
			if(dbColName.toLowerCase()==strColName.toLowerCase())
			{
				return aRow.cells[x].getAttribute("dbvalue");
			}
		}
	}
}

//-- for a given row get col display value 
function get_col_txtvalue(aRow,strColName)
{
	for(var x=0;x<aRow.cells.length;x++)
	{
		var dbColName = aRow.cells[x].getAttribute("dbname");
		if((dbColName!=null)||(dbColName!=""))
		{
			if(dbColName.toLowerCase()==strColName.toLowerCase())
			{
				return aRow.cells[x].innerText;
			}
		}
	}
}

//-- for a given row get col and set its display and dbvalue
function set_col_value(aRow,strColName, strTextValue, strDBValue)
{
	if(strDBValue==undefined)strDBValue = strTextValue;

	for(var x=0;x<aRow.cells.length;x++)
	{
		var dbColName = aRow.cells[x].getAttribute("dbname");
		if((dbColName!=null)||(dbColName!=""))
		{
			if(dbColName.toLowerCase()==strColName.toLowerCase())
			{
				 aRow.cells[x].setAttribute("dbvalue",strColValue);
				 setElementText(aRow.cells[x], strTextValue);
			}
		}
	}
}

//-- sort a table
function sort_data_table(aTable, colIndex, boolSortText)
{

}