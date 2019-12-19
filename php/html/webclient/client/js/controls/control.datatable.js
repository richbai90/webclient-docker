	//-- functions to support data table
	var ROW_HILITE_COLOR = '#FFC663'; //-- orange (bluegray is '#E7EBEF')
	var ROW_HILITEBLUR_COLOR = '#E7EBEF'; //-- orange (bluegray is '#E7EBEF')

	var boolDataTableColResize = false;
	var strResizeColBarId = "datatable-colresizer";
	var oVbar = null;
	var currTableDoc = null;
	var currTableResizeTD = null;
	var _current_table_contextmenu_item = null;

	var KeyUP = 38;
	var KeyDOWN = 40;
	



	function datatable_keyup(dataDiv,e)
	{
		var e = app.getEvent(e);
		//-- if down key then stop scroll event
		var tableData = app.get_parent_child_by_tag(dataDiv,"TABLE");
		if(tableData && tableData.rows.length>0)
		{
			var curr_row_indexes = tableData.getAttribute("curr_row");
			if(curr_row_indexes==null)return;
			var arr_indexes = curr_row_indexes.split(",");
			if(arr_indexes.length==1)
			{
				var row_index = arr_indexes[arr_indexes.length-1];
				var currRow = tableData.rows[row_index];
				dataDiv.scrollTop = currRow.offsetTop;
			}
		}
	}

	function datatable_keydown(dataDiv,e)
	{
		var e = app.getEvent(e);
		//-- if down key then stop scroll event
		var tableData = app.get_parent_child_by_tag(dataDiv,"TABLE");
		if(tableData && tableData.rows.length>0)
		{
			var curr_row_indexes = tableData.getAttribute("curr_row");
			if(curr_row_indexes==null)return;
			var arr_indexes = curr_row_indexes.split(",");
			var row_index = arr_indexes[arr_indexes.length-1];
			var currRow = tableData.rows[row_index];
			
			if(e.keyCode==KeyUP)
			{
				//-- move up a row
				row_index--;
			
			}
			else if(e.keyCode==KeyDOWN)
			{
				//-- move down a row
				row_index++;
			}
			else
			{
				return;
			}

			//-- get row to select
			var newRow = tableData.rows[row_index];
			if(newRow==undefined)newRow = currRow;
			if(newRow==currRow)return;

			if(newRow.onclick)
			{
				newRow.setAttribute('shiftKey',e.shiftKey)
				app.fireEvent(newRow,"click");
				newRow.setAttribute('shiftKey',null)
			}
			else
			{
				app.mes_datarow_selected(newRow,e.shiftKey);
			}

		}
	}


	var _datatable_lastmousedown = 0;
	var _datatable_doubleclick = false;

	function datatable_contextmenu(dataDiv,e)
	{
		var e = app.getEvent(e);
		var bCTRL = (e!=null)?e.ctrlKey:false;

		var divHolder = app.get_parent_owner_by_tag(dataDiv,"DIV");
		var oDoc = app.getEleDoc(divHolder);
		var divContext = null;

		app.hide_application_menu_divs();

		//-- left click
		if(!app.boolMouseRightClick(e))
		{
			var ifShimmer = oDoc.getElementById("app-context-menu");
			if(ifShimmer!=null)
			{
				ifShimmer.innerHTML = "";
				ifShimmer.style.display="none";
			}

			if(bCTRL) 
			{
				return true;
			}

			//-- check if table holder in which case select table
			if( (divHolder.className == "dhtml_table_holder") || (divHolder.getAttribute("draganddrop")=="1") )
			{
				//-- start drag and drop (??)
				var targetEle = oDoc.elementFromPoint(oDoc.iMouseLeft,oDoc.iMouseTop);
				if(targetEle!=null)
				{
					if(targetEle.tagName=="DIV" && targetEle.parentNode!=null && targetEle.parentNode.tagName=="TD")targetEle = targetEle.parentNode;
					if(targetEle.tagName=="B" && targetEle.parentNode!=null && targetEle.parentNode.parentNode.tagName=="TD")targetEle = targetEle.parentNode.parentNode;

					if(targetEle.tagName=="TD" && targetEle.parentNode.tagName=="TR")
					{
						top.__CURRENT_SELECTED_TABLE_ROW = targetEle.parentNode;
						_start_drag_drop(targetEle.parentNode);
						return false;
					}
				}
				if(divHolder.className == "dhtml_table_holder")app._select_sevicedesk_table(divHolder.childNodes[2])
				return false;
			}
			return false;
		}

		//-- check if have a toolbar in same view as this table
		var divToolbarArea = oDoc.getElementById("td_workspace_0");
		if(divToolbarArea!=null)
		{
			var firstControl = divToolbarArea.childNodes[0];
			if(firstControl!=null)
			{
				//-- check if toolbar
				if(firstControl.className == "toolbar")
				{
					//-- check if have associated context menu
					divContext = oDoc.getElementById("contextmnu_" + firstControl.getAttribute("controlid"));
				}
			}
		}

		if(divContext==null)return false;
		
		//-- a service desk
		if(divHolder.className == "dhtml_table_holder")	
		{
			//-- as per full client if user right clicks on a row select it
			var bSelectTable = true;
			var targetEle = oDoc.elementFromPoint(oDoc.iMouseLeft,oDoc.iMouseTop);
			if(targetEle!=null)
			{
				if(targetEle.tagName=="DIV" && targetEle.parentNode!=null && targetEle.parentNode.tagName=="TD")targetEle = targetEle.parentNode;
				if(targetEle.tagName=="TD" && targetEle.parentNode.tagName=="TR")
				{
					//-- if not already selected then select
					if(targetEle.parentNode.style.backgroundColor.toLowerCase()!=ROW_HILITE_COLOR.toLowerCase())
					{
						bSelectTable=false;
						targetEle.parentNode.setAttribute('shiftKey',bCTRL);
						top.__CURRENT_SELECTED_TABLE_ROW = targetEle.parentNode;
						app.fireEvent(targetEle.parentNode,"click");
					}
				}
			}
		}

		//-- if we have context menu check mouse right click and show mouse position
		if(divContext!=null)
		{
			var fDraw = divContext.getAttribute("ondraw");
			if(fDraw!=null && fDraw!="")
			{
				fDraw = eval(fDraw);
				if(fDraw(divContext)==false)
				{
					return false;
				}
			}

			var iAdjustTop = app.eleTop(divHolder);
			var iAdjustLeft = app.eleLeft(divHolder);

			var ifShimmer = oDoc.getElementById("app-context-menu");
			if(ifShimmer!=null)
			{
				ifShimmer.innerHTML = divContext.innerHTML;
				ifShimmer.style.display="block";
				
				//-- if top + height exceeds page then adjust
				var iBottom = (oDoc.iMouseTop -1) + (ifShimmer.offsetHeight -1) + 2; //-- cast
				if(iBottom > oDoc.body.offsetHeight)
				{
					ifShimmer.style.top = oDoc.iMouseTop - (iBottom - oDoc.body.offsetHeight);
				}
				else
				{
					ifShimmer.style.top = oDoc.iMouseTop;// - iAdjustTop;
				}

				//-- if left exceeds page then adjust
				var iRight = (oDoc.iMouseLeft-1) + (ifShimmer.offsetWidth -1) + 2;
				if(iRight > oDoc.body.offsetWidth)
				{
					ifShimmer.style.left = oDoc.iMouseLeft - (iRight - oDoc.body.offsetWidth);
				}
				else
				{
					ifShimmer.style.left = oDoc.iMouseLeft;
				}
			}
			_current_table_contextmenu_item = ifShimmer;
			return false;
		}
	}


	//-- data table scroll
	function datatable_scroll(dataDiv)
	{
		var currScrollLeft = dataDiv.getAttribute("currScrollLeft");
		if(dataDiv.scrollLeft==currScrollLeft) return;

		//-- get parent then get header div
		var divHolder = app.get_parent_owner_by_tag(dataDiv,"DIV");
		var divHeader = app.get_parent_child_by_id(divHolder, "table_columns");
		if(divHeader!=null)
		{
			divHeader.scrollLeft = dataDiv.scrollLeft;
			dataDiv.setAttribute("currScrollLeft", dataDiv.scrollLeft);
		}
	}

	//-- if mouse if is over data table and within cell end show resize
	function datatable_set_cusor(e, aDoc)
	{
		if(!boolDataTableColResize)
		{
			currTableResizeTD = app.ev_source(e);
			var oDataHolder = app.get_parent_owner_by_tag(currTableResizeTD,'DIV');
			var iAdjust =oDataHolder.scrollLeft;
			//alert(currTableResizeTD.tagName)
			if( (currTableResizeTD.tagName=="TD") && ((currTableResizeTD.offsetLeft + - iAdjust + currTableResizeTD.offsetWidth - 3) < aDoc.iMouseLeft) )
			{
				aDoc.body.style.cursor="e-resize";
			}
			else
			{
				aDoc.body.style.cursor="default";
			}
		}
	}

	//-- data table track cursor
	function datatable_track_cursor()
	{
		if(boolDataTableColResize)
		{
			if(oVbar!=null) 
			{
				oVbar.style.left = currTableDoc.iMouseLeft;
			}
		}
	}


	//-- called when mouse is down after starting header resize
	function datatable_start_resize_header(e,aDoc)
	{

		//-- position the td resizer
		var ResizeTD = app.ev_source(e);
		if(ResizeTD.tagName=="TD")
		{
			//-- check that event took place to the right of td - within 3px
			var iLeft = new Number(app.eleLeft(ResizeTD));
			var iWidth = new Number(ResizeTD.offsetWidth);
			var oDataHolder = app.get_parent_owner_by_tag(ResizeTD,'DIV');
			var iAdjust =oDataHolder.scrollLeft;

			var iRight = iLeft + iWidth - iAdjust;
			if(aDoc.iMouseLeft > iRight-5)
			{
				currTableResizeTD = ResizeTD;
				boolDataTableColResize = true;
				oVbar = aDoc.getElementById(strResizeColBarId);
				if(oVbar!=null)
				{
					currTableDoc = aDoc;
					oVbar.style.display="block";
					//-- 			
					var iAdjust = (ResizeTD.getAttribute('type')=="mes")?16:13;
					oVbar.style.top = app.eleTop(ResizeTD) + ResizeTD.offsetHeight - iAdjust;
					oVbar.style.height="15px";
					oVbar.style.left = aDoc.iMouseLeft;
				}
			}
		}
	}

	//-- order column
	function datatable_mouseup_header(e,aDoc)
	{

		var orderTD = app.ev_source(e);
		if(orderTD.tagName=="DIV")
		{
			orderTD = orderTD.parentNode;
		}

		if(orderTD.tagName=="TD")
		{
			var oDivHeader = app.get_parent_owner_by_tag(orderTD,"DIV");
			var oDivHolder = app.get_parent_owner_by_tag(oDivHeader,"DIV");
			if(oDivHolder!=null)
			{
				var strCol = orderTD.getAttribute("dbname");
				var strDir = oDivHolder.getAttribute("orderdir");
				if(strDir==null || strDir=="")
				{
					strDir="DESC";
				}
				else
				{
					strDir=(strDir=="DESC")?"ASC":"DESC";
				}

				oDivHolder.setAttribute("orderby", strCol);
				oDivHolder.setAttribute("orderdir", strDir);

				//-- call function to filter
				if(oDivHolder.className=="dhtml_mes_table_holder")
				{
					if(app.oControlFrameHolder.refresh_data)app.oControlFrameHolder.refresh_data(oDivHolder);
				}
				else
				{
					oDivHolder.process_active_filter(oDivHolder);
				}

				//-- show arrow
				if(oDivHolder.orderTD)oDivHolder.orderTD.className="";
				oDivHolder.orderTD = orderTD;
				orderTD.className = "headertd-" + strDir;
			}
		}
	}

	//-- called when mouse is up after starting header resize
	function datatable_finish_resize_header()
	{
		//-- hide resizer
		currTableDoc.body.style.cursor="default";
		if(oVbar!=null)oVbar.style.display="none";

		//-- set new cell size
		var oDataHolder = app.get_parent_owner_by_tag(currTableResizeTD,'DIV');
		var iAdjust = oDataHolder.scrollLeft;

		var intNewTDWidth = currTableDoc.iMouseLeft - currTableResizeTD.offsetLeft + iAdjust;
		if(intNewTDWidth>5)
		{

			//alert(intNewTDWidth + " : " + currTableResizeTD.offsetWidth)
			if(app.isIE)
			{
				currTableResizeTD.style.width = intNewTDWidth;
			}
			else
			{
				currTableResizeTD.style.width = intNewTDWidth -15;
			}
			//alert(currTableResizeTD.style.width + " : " + currTableResizeTD.offsetWidth)
		
			//-- resize data
			datatable_resize_datacolumns(currTableResizeTD);
		}		

		//-- kill vars
		boolDataTableColResize = false;
		currTableResizeTD = null;
		currTableDoc=null;
	}

	//-- resize data cols to match headers
	function datatable_resize_datacolumns(oResizeTD,oHeaderHolder)
	{
		//-- get header div and table holder
		if(!oHeaderHolder) oHeaderHolder = app.get_parent_owner_by_id(oResizeTD,'table_columns');
		var oTableHolder = app.get_parent_owner_by_tag(oHeaderHolder,'DIV');

		var headerTable = app.get_parent_child_by_tag(oHeaderHolder, "TABLE");
		var aRow = headerTable.rows[0];
		var lastCell = aRow.cells[aRow.cells.length-1];
		lastCell.style.display='none';

		//-- get data table actual table holder ad col group
		var eDataTable = app.get_parent_child_by_id(oTableHolder,'datatable_datatable');
		if(eDataTable==null) return;

		var oDataHolder = app.get_parent_owner_by_tag(eDataTable,'DIV');

		var colGroup = app.get_parent_child_by_tag(eDataTable, "COLGROUP");
		if(colGroup==null) return;
	
		//-- get header col widths and then set data col widths
		var tblHeader = app.get_parent_child_by_tag(oHeaderHolder,"TABLE");
		eDataTable.style.width = tblHeader.offsetWidth;
		var rowHeader = app.get_parent_child_by_tag(tblHeader,"TR");
		var intcount = 0;
		
		for(var x=0; x < colGroup.childNodes.length; x++)
		{
			if(colGroup.childNodes[x].getAttribute("width")!=null)
			{
				var cellWidth = rowHeader.childNodes[x].offsetWidth;
				//if(colGroup.childNodes[x].getAttribute("width") != cellWidth)	
				//{
					//alert(cellWidth + " : " + colGroup.childNodes[x].getAttribute("width") + " : " + dataRowOne.childNodes[x].offsetWidth)
					colGroup.childNodes[x].setAttribute("width",cellWidth);				
				//}
			}
		}

		//-- if we have scrollbars make last header col bigger (to compensate for scrollbar 
		if(oDataHolder.clientWidth < oHeaderHolder.clientWidth)
		{
			//alert(oDataHolder.clientWidth +":"+ oTableHolder.offsetWidth)
			//alert(oHeaderHolder.clientWidth - oDataHolder.clientWidth)
			lastCell.style.display='';
			lastCell.style.width= oHeaderHolder.clientWidth - oDataHolder.clientWidth;
		}
	}

	//-- interactive filter has been selected
	function datatable_interactivefilter(eSelect,oE,boolProcess)
	{
		if(boolProcess==undefined)boolProcess=true;
		var oFiltersHolder = app.get_parent_owner_by_tag(eSelect,'DIV');		
		var oDivHolder = app.get_parent_owner_by_tag(oFiltersHolder,'DIV');
		
		oDivHolder.setAttribute("selectedfilter",eSelect.selectedIndex);
		oDivHolder.setAttribute("selectedsqlfilter",eSelect.options[eSelect.selectedIndex].value);

		//-- refresh data table
		if(oDivHolder.process_active_filter && boolProcess)
		{
			oDivHolder.process_active_filter(oDivHolder);
		}
	}

	function datatable_clearforloading(oTableHolder)
	{
		var oDataHolder = app.get_parent_child_by_id(oTableHolder,'div_data');
		oDataHolder.innerHTML = "<br><center>...loading data...please wait...</center>";
	}

	function datatable_paging(oDivContainer,totalRows,rowsPerPage,currentPage)
	{
		var filterDiv = app.get_parent_child_by_id(oDivContainer,'table_filters');
		if(filterDiv)
		{
			var filterTable = app.get_parent_child_by_tag(filterDiv, "TABLE");
			if(filterTable && filterTable.rows[0] && filterTable.rows[0].cells[1])
			{
				var strDisplay = (totalRows>rowsPerPage)?"block":"none";
				filterTable.rows[0].cells[0].style.display = strDisplay;

				var intPageCount = Math.ceil(totalRows / rowsPerPage);
				var textNode = app.get_parent_child_by_class(filterTable.rows[0],"paging_text");
				if(textNode)
				{
					textNode.innerText = "Page " + currentPage + " of " + intPageCount;
					filterDiv.setAttribute("pagenumber",currentPage);
					filterDiv.setAttribute("lastpagenumber",intPageCount);
				}
			}
		}
	}

	//-- output data table rows and align
	function datatable_draw_data(oTableHolder, strData , boolSelect)
	{

		top.debugstart("DATATABLE:datatable_draw_data","WORKSPACECONTROL");

		if(boolSelect==undefined)boolSelect=false;
		//-- get header div
		var oHeaderHolder = app.get_parent_child_by_id(oTableHolder,'table_columns');
		//-- disable user selection of column headers
		app.disableSelection(oHeaderHolder );

		var headerTable = app.get_parent_child_by_tag(oHeaderHolder, "TABLE");
		var aRow = headerTable.rows[0];
		var lastCell = aRow.cells[aRow.cells.length-1];
		lastCell.style.display='none';

		//-- get data holders
		var oDataHolder = app.get_parent_child_by_id(oTableHolder,'div_data');

		//-- disable user selection of column headers
		app.disableSelection(oDataHolder);

		//-- clear data
		$(oDataHolder).children().remove();

		//-- get colgroup widths
		var intTotalColWidth = 0;
		var strColGrouping = "<colgroup>";
		var tblHeader = get_parent_child_by_tag(oHeaderHolder,"TABLE");
		var rowHeader = get_parent_child_by_tag(tblHeader,"TR");
		for(var x=0; x < rowHeader.childNodes.length-1; x++)
		{
			var cellWidth = new Number(rowHeader.childNodes[x].offsetWidth);
			var cellAlign = rowHeader.childNodes[x].getAttribute("align");
			var cellName = rowHeader.childNodes[x].getAttribute("dbname");

			intTotalColWidth +=cellWidth;
			strColGrouping +='<col width="'+cellWidth+'" align="'+cellAlign+'" dbname="' + cellName + '"/>';
		}
		strColGrouping +='</colgroup>';

		//-- output data

		var intFilters = oTableHolder.getAttribute("hasfilters");
		var oFiltersHolder = app.get_parent_child_by_id(oTableHolder,'table_filters');
		var iFilterHeight = (oFiltersHolder!=null)?oFiltersHolder.offsetHeight:0;

		if(oTableHolder.offsetHeight>0)		
		{
			oDataHolder.style.height = oTableHolder.offsetHeight - oHeaderHolder.offsetHeight - iFilterHeight;
		}

		

		var mozWidthFix = (!app.isIE || app.isIE10Above)?"width:"+tblHeader.offsetWidth+";":"";
		oDataHolder.innerHTML = "<table border='0' id='datatable_datatable' class='dhtml_table_data' style='"+mozWidthFix+"' cellspacing='0'>" + strColGrouping + strData +"</table>";
		strData = null;

		//-- if we have scrollbars make last header col bigger (to compensate for scrollbar 
		if(oDataHolder.clientWidth < oHeaderHolder.clientWidth)
		{
			//alert(oDataHolder.clientWidth +":"+ oTableHolder.offsetWidth)
			//alert(oHeaderHolder.clientWidth - oDataHolder.clientWidth)
			lastCell.style.display='';
			lastCell.style.width= oHeaderHolder.clientWidth - oDataHolder.clientWidth;
		}
		//-- scroll back to where we were horiz
		oDataHolder.scrollLeft = oHeaderHolder.scrollLeft;

		//-- perform any afterdataloaded function
		var strFuncOnDataLoaded = oTableHolder.getAttribute("ondataloaded");
		if(strFuncOnDataLoaded!="")
		{
			eval(strFuncOnDataLoaded + "(oTableHolder,oDataHolder.childNodes[0].rows.length);");
		}

		//-- select 1st row
		if(boolSelect)
		{
			if(oDataHolder.childNodes[0].rows.length>0)	
			{
				app.mes_datarow_selected(oDataHolder.childNodes[0].rows[0]);
				oDataHolder.focus();
			}

		}

		top.debugend("DATATABLE:datatable_draw_data","WORKSPACECONTROL");

		return oDataHolder.childNodes[0].rows.length;
	}


	//--
	//-- highlight a datatable row
	function datatable_hilight(aRow, boolKeepSelection)
	{
		if(boolKeepSelection==undefined)boolKeepSelection=false;
		var oRowTable = get_row_datatable(aRow);//app.get_parent_owner_by_tag(aRow,'TABLE');		
		var currRowIndex = oRowTable.getAttribute("curr_row");
		if(currRowIndex!=null)
		{
			var arrIndexes = currRowIndex.split(",");
			//-- unselect previous selected row
			if(!boolKeepSelection)	
			{
					if(arrIndexes.length>0)
				{
					for(var x=0;x<arrIndexes.length;x++)
					{
						try
						{
							oRowTable.rows[arrIndexes[x]].style.backgroundColor = '#FFFFFF';							
						}
						catch (e)
						{
							oRowTable.rows[0].style.backgroundColor = '#FFFFFF';							
						}
					}
				}
				currRowIndex = "";
			}
		}
		else
		{
			currRowIndex = "";
		}

		if(aRow.style.background.toLowerCase() == app.ROW_HILITE_COLOR.toLowerCase())
		{
				aRow.style.background = '#FFFFFF';
				//-- remove index for selected group
				var strSaveIndex = "";
				var arrIndexes = currRowIndex.split(",");
				for(var x=0;x<arrIndexes.length;x++)
				{
					if(arrIndexes[x]!=aRow.rowIndex)
					{
						if(strSaveIndex!="")strSaveIndex+=",";
						strSaveIndex += oRowTable.rows[arrIndexes[x]].rowIndex+"";
					}
				}
		}
		else
		{

			aRow.style.background = app.ROW_HILITE_COLOR;
	
			//-- new index
			var strSaveIndex = currRowIndex;
			var arrIndexes = currRowIndex.split(",");
			var bSet = true;
			for(var x=0;x<arrIndexes.length;x++)
			{
				if(arrIndexes[x]!=false && arrIndexes[x]==aRow.rowIndex)
				{
					bSet=false;
					break;
				}
			}

			if(bSet)
			{
				if(strSaveIndex!="")strSaveIndex+=",";
				strSaveIndex += aRow.rowIndex+"";
			}

		}
		oRowTable.setAttribute("curr_row",strSaveIndex);
	}

	//--
	//-- highlight a datatable row
	function datatable_hilight_blurred_rows(aTable)
	{
		var currRowIndex = aTable.getAttribute("curr_row");
		if(currRowIndex!=null)
		{
			var arrIndexes = currRowIndex.split(",");
			if(arrIndexes.length>0)
			{
				for(var x=0;x<arrIndexes.length;x++)
				{
					try
					{
						//- -table may have been destroyed
						aTable.rows[arrIndexes[x]].style.background = ROW_HILITEBLUR_COLOR;
					}
					catch(e)
					{
					}
				}
			}

		}
	}


	//--
	//-- highlight a datatable row
	function datatable_hilight_selected_rows(aTable)
	{
		var currRowIndex = aTable.getAttribute("curr_row");
		if(currRowIndex!=null && currRowIndex!="")
		{
			var arrIndexes = currRowIndex.split(",");
			if(arrIndexes.length>0)
			{
				for(var x=0;x<arrIndexes.length;x++)
				{
					aTable.rows[arrIndexes[x]].style.background = ROW_HILITE_COLOR;
				}
			}

		}
	}


	//--
	//-- find tab item holder for data table and set a counter in it
	function datatable_set_tabholder_counter(eTableHolder, intRowCount)
	{
		var tabSpace = app.get_parent_owner_by_tag(eTableHolder,"DIV");
		if(tabSpace!=null)
		{
			//-- get parent owner
			var eTabControl = app.get_parent_owner_by_class(eTableHolder,"tabcontrol");
			if(eTabControl!=null)
			{
				var tiHolder = app.get_parent_child_by_id(eTabControl,tabSpace.getAttribute("tiname"));
				var strLabel = tiHolder.getAttribute("label");
				if(strLabel==null)
				{	
					strLabel = getElementText(tiHolder);
					tiHolder.setAttribute("label", strLabel);
				}

				setElementText(tiHolder, strLabel + " (" + intRowCount + ")");
			}
		}
	}

	//-- get column value for a given row
	function datatable_get_colvalue(aRow, strColName, boolFormatted)
	{
		if(boolFormatted==undefined) boolFormatted=false;

		//-- get data table holder ad col group
		var oDataHolder = app.get_parent_owner_by_id(aRow,'div_data');
		if(oDataHolder==null) return undefined;
		var colGroup = app.get_parent_child_by_tag(oDataHolder, "COLGROUP");
		if(colGroup==null) return undefined;

		//-- get col position for the one we want
		var intcount = -1;
		for(var x=0; x < colGroup.childNodes.length; x++)
		{
			if(colGroup.childNodes[x].getAttribute("dbname") != null)
			{
				intcount++;
				if(colGroup.childNodes[x].getAttribute("dbname") == strColName)	
				{
					if(boolFormatted)
					{
						var strValue = aRow.childNodes[intcount].getAttribute("dbvalue");
						if(strValue=="sat")strValue = app.getElementText(aRow.childNodes[intcount]);
					}
					else
					{
						var strValue = app.getElementText(aRow.childNodes[intcount]);
					}
					return strValue;
				}
			}
		}
		return undefined;
	}


	function get_row_datatable(aRow)
	{
		if(aRow)
		{
			while(aRow.parentNode.tagName!="TABLE")
			{
				aRow = aRow.parentNode;
			}
			return aRow.parentNode
		}
		return null;
	}

	function get_row_headertable(aRow)
	{
		var dataTable = app.get_row_datatable(aRow);
		if(dataTable!=null)
		{
			var oTableHolder = app.get_parent_owner_by_tag(dataTable,'DIV');
			if(oTableHolder!=null)return app.get_parent_child_by_id(oTableHolder,'table_columns');	
		}
		return null;
	}

	function get_row_tableholder(aRow)
	{
		while(aRow.parentNode.tagName!="DIV")
		{
			aRow = aRow.parentNode;
		}
		return aRow.parentNode


		//var dataTable = app.get_row_datatable(aRow);
		//if(dataTable!=null)
		//{
		//	return app.get_parent_owner_by_tag(dataTable,'DIV');
		//}
		//return null;
	}

	function get_row_datatable_selectedindexes(aRow)
	{
		if(aRow==undefined || aRow==null) return "-1";
		var dataTable = app.get_row_datatable(aRow);
		if(dataTable!=null)
		{
			//alert(dataTable.getAttribute("curr_row"))
			var strIndx = dataTable.getAttribute("curr_row");
			if(strIndx==null)strIndx="-1";
			return strIndx;
		}
		return "-1";
	}

		