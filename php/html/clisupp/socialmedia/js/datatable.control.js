//-- functions to support the datatables in portal
//-- nwj 14.01.2009 - if loo kfor value is set to "" then clear the look for filter
function datatable_checklookfor_value(eLookForTB)
{
	if(eLookForTB.value!="")return "";

	var eDiv = app.get_parent_owner_by_tag(eLookForTB,"DIV");
	var tabHolder = app.get_parent_owner_by_id(eDiv, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;
	if(tabItem!=null)
	{
		var lookforTable = app.get_parent_owner_by_tag(eLookForTB,"TABLE");
		if(lookforTable!=null)
		{
			var tb_LookFor = app.get_parent_child_by_id(lookforTable, "dtable_lookfor");
			var lb_LookIn = app.get_parent_child_by_id(lookforTable, "dtable_lookin");

			if( (tb_LookFor!=null) && (lb_LookIn!=null) )
			{
				var eRPP = app.get_parent_child_by_id(eDiv,'tbl_rpp');
				var intRowsPerPage = (eRPP!=null)?eRPP.value:20;

				//tabItem.setAttribute("startfromrow",1);
				tabItem.setAttribute("lookfor",tb_LookFor.value);
				tabItem.setAttribute("lookin",lb_LookIn.value);
				app.selecttab(tabItem);
			}
		}
	}
}

//-- nwj - 13.01.2009 - perform a look for
function dtable_lookfor(eLookForSpan)
{
	var eDiv = app.get_parent_owner_by_tag(eLookForSpan,"DIV");
	var tabHolder = app.get_parent_owner_by_id(eDiv, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;
	if(tabItem!=null)
	{
		var lookforTable = app.get_parent_owner_by_tag(eLookForSpan,"TABLE");
		if(lookforTable!=null)
		{
			var tb_LookFor = app.get_parent_child_by_id(lookforTable, "dtable_lookfor");
			var lb_LookIn = app.get_parent_child_by_id(lookforTable, "dtable_lookin");

			if( (tb_LookFor!=null) && (lb_LookIn!=null) )
			{
				var eRPP = app.get_parent_child_by_id(eDiv,'tbl_rpp');
				var intRowsPerPage = (eRPP!=null)?eRPP.value:20;

				//tabItem.setAttribute("startfromrow",1);
				tabItem.setAttribute("lookfor",tb_LookFor.value);
				tabItem.setAttribute("lookin",lb_LookIn.value);
				app.selecttab(tabItem);
			}
		}
	}
}


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
		var eRPP = app.get_parent_child_by_id(eDiv, "tbl_rpp");
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

		//-- nwj - 21.07.2009 - if trying to page a table that is not held in a tab control
		if(tabHolder==false)
		{
			page_independent_table(eDiv,intStartFromRow,intRowsPerPage);
			return;
		}

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
	var strTblName = aTH.getAttribute("tablename");
	if(strTblName!="") strColName = strTblName + "." + strColName;

	//-- get panel holding data
	var tabHolder = app.get_parent_owner_by_id(aTH, "tab_holder");

	//-- nwj - 21.07.2009 - if trying to sort a table that is not held in a tab control
	if(tabHolder==false)
	{
		sort_independent_table(tableData,aTH);
		return;
	}


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

	//-- nwj - 21.07.2009 if trying to filter a table that is not held in a tab control
	if(tabHolder==false)
	{
		var tableHolder = app.get_parent_owner_by_tag(aLB, "DIV",true);
		filter_independent_table(tableHolder,aLB);
		return;
	}
	
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;

	if(tabItem!=null)
	{
		//var intPos = new Number(aLB.getAttribute('lbpos'));
		var arrLBs  = app.get_parent_children_by_name(tabHolder, aLB.name);
		//var arrLBs = document.getElementsByName(aLB.name)
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
        case "loadcontent":
            row_loadcontent(aRow,arrActionInfo)
            break;
        case "jscript":
            eval(arrActionInfo[1] + "(aRow);");
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



//-- for a given table get col by dbname and total values  
function get_col_total(aTable,strColName)
{
	var intTotal = 0;
	for(var y=1;y<aTable.rows.length;y++)
	{
		var aRow=aTable.rows[y];
		//-- 
		intTotal = intTotal + new Number(get_col_value(aRow,strColName));
	}
	return  intTotal;
}

//-- for a given table get col by dbname and get seperated values
function get_col_sepvalues(aTable,strColName,strSep)
{
	if(strSep==undefined)strSep=",";

	var strValues = "";
	var intTotal = 0;
	for(var y=1;y<aTable.rows.length;y++)
	{
		var aRow=aTable.rows[y];
		//-- 
		if(strValues!="")strValues += strSep
		strValues += get_col_value(aRow,strColName);
	}
	return  strValues;
}

//-- for a given table get col by dbname and get seperated values
function get_checkedcol_sepvalues(aTable,strCheckedCol, strColName,strSep,boolChecked)
{
	if(strSep==undefined)strSep=",";
	if(boolChecked==undefined)boolChecked=true;

	var strValues = "";
	var intTotal = 0;
	for(var y=1;y<aTable.rows.length;y++)
	{
		var aRow=aTable.rows[y];

		var res = is_row_checked(aRow,strCheckedCol);
		if(boolChecked==res)
		{
			//-- 
			if(strValues!="")strValues += strSep
			strValues += get_col_value(aRow,strColName);
		}
	}
	return  strValues;
}



//-- return t or f is row col is checked
function is_row_checked(aRow,strColName)
{
	var oTD = get_row_tdcol(aRow, strColName);
	if(oTD==null)return false;
	var oEle = app.get_child_by_tag(oTD, "INPUT");	
	if(oEle==null)return false;
	if(oEle.getAttribute("type").toLowerCase()!="checkbox")return false;
	return oEle.checked;
}

function get_row_tdcol(aRow, strColName)
{
	for(var x=0;x<aRow.cells.length;x++)
	{
		var dbColName = aRow.cells[x].getAttribute("dbname");
		if((dbColName!=null)||(dbColName!=""))
		{
			if(dbColName.toLowerCase()==strColName.toLowerCase())
			{
				return aRow.cells[x];
			}
		}
	}
	return null;
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

//-- load php into an iframe
function row_loadcontent(aRow, arrActionInfo)
{

    var strURL = aRow.getAttribute("url");
    if(strURL=="")return;

    //-- construct keyvalue to pass into url
    var varKey= aRow.getAttribute("keyvalue");
    var strKeyName = aRow.getAttribute("keyvar");

    //-- construct other values to pass in
    var strPassThru = "";
    var strPassThruCols= aRow.getAttribute("urlvars");
    var arrVars = strPassThruCols.split(",");

    for(var x=0; x<arrVars.length;x++)
    {
        if(strPassThru != "")strPassThru += "&";    
        strPassThru += "in_" + arrVars[x] + "=" + get_col_value(aRow,arrVars[x]);
    }
    
    var strDataUrl = strKeyName + "=" + varKey 
    if(strPassThruCols!="")strDataUrl += "&" + strPassThru;
    strURL +=  "?" + strDataUrl;

    //-- set inlineframe url
    //-- then display
    show_inlineframe(strURL);

}

//--
//-- nwj - 29.07.2009 - handle independent table options

//-- page table data
function page_independent_table(tableHolder,intStartFromRow,intRowsPerPage)
{
	//-- get tables div holder (all independent tables should have a div place holder in which we can reload the table)
	var tablePlaceHolder = app.get_parent_owner_by_tag(tableHolder, "DIV",true);
	if((tablePlaceHolder==null)||(tablePlaceHolder==false)) return false;

	//-- get xmldef file
	var strTableFileID = tableHolder.getAttribute("xmlfile");

	tablePlaceHolder.setAttribute("startfromrow",intStartFromRow);
	tablePlaceHolder.setAttribute("showrowcount",intRowsPerPage);

	load_independent_datatable(strTableFileID, tablePlaceHolder);
}

//-- filter table
function filter_independent_table(tableHolder,aLB)
{
	var strTableFileID = tableHolder.getAttribute('xmlfile');
	
	//-- get tables div holder (all independent tables should have a div place holder in which we can reload the table)
	var tablePlaceHolder = app.get_parent_owner_by_tag(tableHolder, "DIV",true);
	if((tablePlaceHolder==null)||(tablePlaceHolder==false)) return false;

	//- -work out filter
	//var arrLBs = document.getElementsByName(aLB.name)
	var arrLBs  = app.get_parent_children_by_name(tabHolder, aLB.name);
	var intPos = getElementControlArrayPos(aLB,arrLBs);

	var strFilterItems = tablePlaceHolder.getAttribute('filteroption');
	if(strFilterItems==null) strFilterItems="0";
	var arrFilterItems = strFilterItems.split(",");

	arrFilterItems[intPos] = aLB.selectedIndex;

	//-- set attributes
	tablePlaceHolder.setAttribute("startfromrow",1); // --reset paging
	tablePlaceHolder.setAttribute("filteroption",new String(arrFilterItems))

	//-- load table into place holder
	load_independent_datatable(strTableFileID, tablePlaceHolder);
}

//-- nwj - 21.07.2009 - sort table that is not in a tab item
function sort_independent_table(aTable, aTH)
{
	//-- get table normal holder
	var tableHolder = app.get_parent_owner_by_tag(aTable, "DIV");
	if((tableHolder==null)||(tableHolder==false)) return false;

	//-- get tables div holder (all independent tables should have a div place holder in which we can reload the table)
	var tablePlaceHolder = app.get_parent_owner_by_tag(tableHolder, "DIV",true);
	if((tablePlaceHolder==null)||(tablePlaceHolder==false)) return false;

	//-- get xmldef file
	var strTableFileID = tableHolder.getAttribute("xmlfile");

	//-- get colname and position
	var strColName = aTH.getAttribute("dbname");
	var colIndex = aTH.cellIndex;

	//-- sort dir
	var strDirection = tablePlaceHolder.getAttribute("sortdir");
	if(strDirection==null)
	{
		strDirection="DESC";
	}
	else
	{
		strDirection=(strDirection=="DESC")?"ASC":"DESC";
	}

	tablePlaceHolder.setAttribute("sortdir",strDirection);
	tablePlaceHolder.setAttribute("orderby",strColName);
	
	//-- call php to load table
	load_independent_datatable(strTableFileID, tablePlaceHolder);
}

//-- load table data
function load_independent_datatable(strTableFileID, tablePlaceHolder,strAddFilter)
{

	var strOrderCol = tablePlaceHolder.getAttribute("orderby");
	var strOrderDesc = tablePlaceHolder.getAttribute("sortdir");
	var intFilterOption = tablePlaceHolder.getAttribute("filteroption");
	var intStartRow = tablePlaceHolder.getAttribute("startfromrow");
	var intShowRowCount = tablePlaceHolder.getAttribute("showrowcount");

	//-- inti vars if need to
	if((strOrderCol==undefined)||(strOrderCol==null))strOrderCol = "";
	if((strOrderDesc==undefined)||(strOrderDesc==null))strOrderDesc = "DESC";
	if((intFilterOption==undefined)||(intFilterOption==null))intFilterOption=0;
	if((intStartRow==undefined)||(intStartRow==null))intStartRow=1;
	if((intShowRowCount==undefined)||(intShowRowCount==null))intShowRowCount=-1;
	if((strAddFilter==undefined)||(strAddFilter==null))strAddFilter="";

	//-- create url and load
	var	strAppendURL ="&orderby=" + strOrderCol + "&sortdir=" + strOrderDesc + "&filterbyoption=" + intFilterOption +"&startatrow=" + intStartRow + "&showrowcount=" + intShowRowCount ;
	//-- add additional filter
	if(strAddFilter!="")strAppendURL += "&additionalfilter=" + strAddFilter;
	var strURL = app.portalroot + "php/xmlhttp/get_datatable.php?tablecontrol=" + strTableFileID  + strAppendURL;
	var strResult = app.run_php(strURL,true);
	//-- draw it out
	tablePlaceHolder.innerHTML = strResult;
}
//-- end of independent table functions
//--

//-- djh - 03.12.2009 - toggle preview row on/off
function dtable_togglepreview(eTB)
{
	var bChecked = eTB.checked;
	
	//-- if checked then show preview else hide
	if(bChecked)
	{
		intChecked = 1;
	}
	else
	{
		intChecked = 0;
	}
	
	var eDiv = app.get_parent_owner_by_tag(eTB,"DIV");
	var tabHolder = app.get_parent_owner_by_id(eDiv, "tab_holder");
	var tabItemsHolder = app.get_parent_child_by_id(tabHolder, "tabdata_tabs");
	var tabItem = tabItemsHolder.lastTab;

	//-- Set preview choice in a cookie
	var strURL = "php/xmlhttp/cookie_add.php?cookie=swssshowpreview&value="+intChecked;
	var strResult = run_php(strURL,true);
	
	if(tabItem!=null)
	{
		tabItem.setAttribute("showpreview",intChecked);
		app.selecttab(tabItem);
	}

}
