	var undefined;
	var app = (opener)?opener:top;
	var jqDoc = $(document); //-- so can use jquery
	
	var sys = app.sys;
	var eAppWorkspaceTopToResize = null;
	var iamready = false;

	var eAppWorkspaceResizerMover = null;
	var eAppWorkspaceFloatDiv = null;
	var intWorkspaceTopToResizeOrginHeight = 0;
	var bWorkspaceResize = false;

	var _arrAreaHeights = new Array();

	function viewport()
	{
		var e = window, a = 'inner';
		if ( !( 'innerWidth' in window ) )
		{
			a = 'client';
			e = (!app.isIE)?document.documentElement : document.body;
		}
		return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
	}

	//-- initialise workspace
	function initialise()
	{
		//-- add browser class to body
		if(app.browserClassName!="")
		{
			jqDoc.find("body").addClass(app.browserClassName);
		}

		resize_workspace();
		iamready=true;
		top.debugend(strControl,"LOAD WORKSPACE")

	}

	//-- resize area (called by portal.php when resizing outlook)
	function resize_workspace()
	{
		if(app._swcore.bHidingMenus) return;
		sizeup_workspace_areas();
	}

	//-- size up the workspace div area - namely the bottom one which is auto fit
	function sizeup_workspace_areas(intDivNewHeight, eAdjustedDiv)
	{
		var intTotalHeight = 0;
		var intWorkspaceResizerHeight = 0;
		var counter = 0;

		var vp = viewport()
		var viewableWidth = (app.isIE)?vp.width:vp.width+4;
		var viewableHeight = vp.height; 

		var lastDiv = null;
		var divArea = document.getElementById("td_workspace_" + counter);
		while(divArea!=null)
		{
			intDivHeight = (eAdjustedDiv==divArea)?intDivNewHeight:divArea.offsetHeight;
			//-- store div height for this area pos if not already stored
			if(_arrAreaHeights[counter]==undefined)_arrAreaHeights[counter] = intDivHeight;
			//-- adjust height if we want to - user has manuall adjusted
			if(eAdjustedDiv==divArea)
			{
				_arrAreaHeights[counter] = intDivNewHeight; //-- sote new hieght for div area
			}

			//-- resize container after inner control is resized
			intDivHeight = _arrAreaHeights[counter];

			divArea.style.height = intDivHeight;
			divArea.style.width = viewableWidth;
				
			//-- resize inner control height and width
			resize_controls(divArea, intDivHeight-2,viewableWidth);


			lastDiv = divArea;

			counter++;
			divArea = document.getElementById("td_workspace_" + counter);
			if(divArea!=null)
			{
				intWorkspaceResizerHeight += 4;
				intTotalHeight += intDivHeight;
			}
		}

		if(lastDiv!=null)
		{
			var intLastDivHeight = viewableHeight - lastDiv.offsetTop;
			if(intLastDivHeight<40)intLastDivHeight=40;

			if(!app.isIE)
			{
				lastDiv.style.height = intLastDivHeight;
				if(lastDiv.firstChild.tagName=="IFRAME")
				{
					lastDiv.firstChild.style.width=viewableWidth-6;
					if(app.isFirefox)
					{
						lastDiv.firstChild.style.height=intLastDivHeight-3;
					}
					else
					{
						lastDiv.firstChild.style.height=intLastDivHeight-2;
					}
					

				}
			}
			else
			{
				lastDiv.style.height = intLastDivHeight;
			}
			
			lastDiv.style.width = viewableWidth;

			resize_controls(lastDiv, intLastDivHeight-1,viewableWidth);			


			//-- check if has child with fitparent att
			var oChild = lastDiv.firstChild;
			if(oChild!=null)
			{
				if(oChild.getAttribute)
				{
					var fit = oChild.getAttribute("fitparent");
					if(fit=="1")
					{
						oChild.style.height=intLastDivHeight-2;//-35;
					}
				}
			}

		}
	}
	
	document.iMouseLeft = 0;
	document.iMouseTop = 0;
	function _track_documentmouse(e) 
	{
		document.iMouseLeft = (window.Event) ? e.pageX : event.clientX;
		document.iMouseTop = (window.Event) ? e.pageY : event.clientY;
		if(bWorkspaceResize)
		{
			eAppWorkspaceResizerMover.style.top = document.iMouseTop - 1;
		}
		else if(app.boolDataTableColResize)
		{
			//-- resizing a table
			app.datatable_track_cursor();
		}

		//-- pass mouse info to top level
		app._track_appwide_mouse_cursor(true,document.iMouseLeft,document.iMouseTop,true);

		return true;
	}

	function _trap_document_mouseup(e)
	{
		app._trap_document_mouseup(e);
	}


	function start_resize_workspace(oBar, intTopDivNumber,intBottomDivNumber)
	{
		eAppWorkspaceFloatDiv = document.getElementById("app-layout-float-div");
		eAppWorkspaceFloatDiv.style.display='block';

		eAppWorkspaceResizerMover = document.getElementById("app-layout-vmover");
		eAppWorkspaceResizerMover.style.display = "block";

		//-- get elements we will need to adjust the height for
		eAppWorkspaceTopToResize = document.getElementById("td_workspace_" + intTopDivNumber);

		intWorkspaceTopToResizeOrginHeight = app.eleTop(eAppWorkspaceTopToResize) + eAppWorkspaceTopToResize.offsetHeight;

		eAppWorkspaceResizerMover.style.left = 2;
		if(app.isIE)eAppWorkspaceResizerMover.style.width = eAppWorkspaceResizerMover.offsetWidth-4;
		bWorkspaceResize = true;
	}

	function end_resize_workspace(e)
	{
		if(bWorkspaceResize)
		{
			bWorkspaceResize = false;
			eAppWorkspaceResizerMover.style.display = "none";
			eAppWorkspaceFloatDiv.style.display='none';
			
			var intNewHeight = document.iMouseTop-1;
			if(intNewHeight<10)intNewHeight = 10;

			//-- resize workspaces area that we are interested in
			if(intNewHeight>intWorkspaceTopToResizeOrginHeight)
			{
				var iDiff =  (intNewHeight - intWorkspaceTopToResizeOrginHeight);
				intNewHeight = eAppWorkspaceTopToResize.offsetHeight + iDiff;
			}
			else
			{
				var iDiff =  (intWorkspaceTopToResizeOrginHeight - intNewHeight);
				intNewHeight = eAppWorkspaceTopToResize.offsetHeight - iDiff;
			}

			if(intNewHeight>100)	sizeup_workspace_areas(intNewHeight,eAppWorkspaceTopToResize);


		}
		else if(app.boolDataTableColResize)
		{
			app.datatable_finish_resize_header();
		}
	}

	//-- element access
	function getElement(strID)
	{
		return document.getElementById(strID);
	}

	//-- loop through elements - and those that support resizing resize
	function resize_controls(eParentholder, intNewHeight,iResizeToWidth)
	{
		iResizeToWidth=(app.isIE)?iResizeToWidth-4:iResizeToWidth-2

		var array_resize_eles = app.get_children_by_att_value(eParentholder, "resizeme", "1",true);
		for(var x=0;x<array_resize_eles.length;x++)
		{
			var resizeElement = array_resize_eles[x];
			if(resizeElement.style.display=="none")continue; //-- only resize visible elements
			switch(resizeElement.getAttribute("controltype"))
			{
				case "datatable-holder":
					resize_datatable_holder(resizeElement,eParentholder,intNewHeight,iResizeToWidth);
					break;
				case "tabcontrol-holder":
					resize_tabcontrol_holder(resizeElement,eParentholder,intNewHeight,iResizeToWidth);
					break;			
				default:
					break;
			}

		}
	}

	function get_workspace_controls_by_type(strType)
	{
		var return_eles = new Array();
		var array_resize_eles = document.getElementsByTagName("*")
		for(var x=0;x<array_resize_eles.length;x++)
		{
			var resizeElement = array_resize_eles[x];
			switch(resizeElement.getAttribute("controltype"))
			{
				case strType:
					return_eles[return_eles.length++] = resizeElement;
					break;
				default:
					break;
			}
		}
		return return_eles;
	}

	//-- resize data table control
	function resize_datatable_holder(oEle,eParentholder, iResizeToHeight, iResizeToWidth)
	{
		if(iResizeToHeight<=0)return;
		//-- get header and data holder div
		var oHeaderHolder = app.get_parent_child_by_id(oEle,'table_columns');
		var oDataTable = app.get_parent_child_by_id(oEle,'div_data');
		var oFiltersHolder = app.get_parent_child_by_id(oEle,'table_filters');
		var iFilterHeight = (oFiltersHolder!=null)?oFiltersHolder.offsetHeight:0;

		//-- if in a tab control then override so use tab control area to determine size
		var bTab = false;
		if(eParentholder.className=="tab-item-workspace-selected")
		{
			//-- in a tab control (most likely helpdesk view) adjust for tab items
			bTab = true;
			if(iResizeToHeight==undefined)iResizeToHeight = eParentholder.offsetHeight;

			var altWidth = (app.isIE && !app.isIE10Above)?iResizeToWidth:iResizeToWidth-9;

			oHeaderHolder.style.width = altWidth;
			oDataTable.style.width = altWidth; 
			if(app.isIE)oFiltersHolder.style.width=altWidth; 

			try
			{
				oDataTable.style.height = iResizeToHeight - oHeaderHolder.offsetHeight - 20 - iFilterHeight;				
			}
			catch (e)
			{
		
			}

			//-- resize table columns
			//app.datatable_resize_datacolumns(oHeaderHolder.childNodes[0].childNodes[0]);

		}
		else
		{

			//-- not held in tab control
			var iNewHeight = (iResizeToHeight==undefined)?eParentholder.offsetHeight:iResizeToHeight;
			var iWidthAdjust = (app.isIE)?4:-4;
			var iHeightAdjust = (app.isIE)?0:5;
			oHeaderHolder.style.width =iResizeToWidth+iWidthAdjust;
			oDataTable.style.width = iResizeToWidth+iWidthAdjust;

			try{
				oDataTable.style.height = iNewHeight - oHeaderHolder.offsetHeight - iHeightAdjust - iFilterHeight;
			}catch(e){}

			

		}
	}

	//-- resize data table control
	function resize_tabcontrol_holder(oEle, eParentholder, iResizeToHeight,iResizeToWidth)
	{
		if(iResizeToHeight<=0)return;
		if(iResizeToWidth<=0)return;

		//var tiHolder = app.get_parent_child_by_class(oEle,"tabspaceholder");
		var tiArea = app.get_parent_child_by_class(oEle,"tabitemsholder");
		var tiWorkArea = app.get_parent_child_by_class(oEle,"tab-item-workspace-selected");

		//-- resize tab item workspace controls selected
		var intNewHeight = iResizeToHeight - tiArea.offsetHeight;
		if(app.isSafari)
		{
			//iResizeToHeight = iResizeToHeight-20;
			//iResizeToWidth = iResizeToWidth+13;
			//-- adjust tab items so that they have a top setting 
			//tiHolder.style.top = "3px";
		}
		else
		{
			//--mozilla sizing
			try
			{
				tiWorkArea.style.height = iResizeToHeight - tiArea.offsetHeight - 21;				
			}
			catch (e)
			{
			}

			//iResizeToHeight = iResizeToHeight-10;	
		}

		if(app.isIE)tiWorkArea.style.width = iResizeToWidth-7;
		oEle.style.height = iResizeToHeight;	
		oEle.style.width = iResizeToWidth;

		resize_controls(tiWorkArea, intNewHeight,iResizeToWidth-4);
	}



	function _handlekeyup(oEv)
	{
			if(app.isFirefox)
			{
				if(top.__CURRENT_SELECTED_TABLE_ROW)
				{
					try
					{
						app.datatable_keyup(top.__CURRENT_SELECTED_TABLE_ROW.parentNode.parentNode.parentNode,oEv);	
					}
					catch (e)
					{
					}
					
				}
			}

	}
	function _handlekeydown(oEv)
	{
		if(app._handle_portal_keystrokes(oEv))
		{
			//-- firefox event propegation in iframe does not work - so have to use workaround.
			if(app.isFirefox)
			{
				if(top.__CURRENT_SELECTED_TABLE_ROW)
				{
					try
					{
						app.datatable_keydown(top.__CURRENT_SELECTED_TABLE_ROW.parentNode.parentNode.parentNode,oEv);	
					}
					catch (e)
					{
					}
				}
			}
		}
		
	}



	//-- get last key pressed - pass to active control and let it deail with it
	var EV_LASTKEY_PRESSED = "";
	var EV_BOOL_CTRL_PRESSED =  "";
	var EV_BOOL_SHIFT_PRESSED =  "";
	var EV_BOOL_ALT_PRESSED =  "";

	function getKeyPressed(e) 
	{
		if(!e) e = (window.Event)?window.Event:window.event;

		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;

		EV_LASTKEY_PRESSED = code;
		EV_BOOL_CTRL_PRESSED = e.shiftKey;
		EV_BOOL_CTRL_PRESSED = e.ctrlKey;
		EV_BOOL_SHIFT_PRESSED = e.shiftKey;
		EV_BOOL_ALT_PRESSED = e.altKey;
	}

	function docKeyReleased(e) 
	{
		if(!e) e = (window.Event)?window.Event:window.event;

		EV_LASTKEY_PRESSED = "";
		EV_BOOL_CTRL_PRESSED = e.shiftKey;
		EV_BOOL_CTRL_PRESSED = e.ctrlKey;
		EV_BOOL_SHIFT_PRESSED = e.shiftKey;
		EV_BOOL_ALT_PRESSED = e.altKey;
	}

	//-- IE work around - document resize event fires everytime you change height or width of an element
	//-- so only fire actual resize code if document size has changed
	var lastDocW = 0;
	var lastDocH = 0;
	function document_resize()
	{
		var info = app.getPageSize()
		if(lastDocW==0)
		{
			lastDocW = info.width;
			lastDocH = info.height;
		}
	
		if((lastDocH!=info.height)||(lastDocW != info.width))
		{
			//-- need to resize
			resize_workspace();
			lastDocW = info.width;
			lastDocH = info.height;
		}
	}

	//-- cancel and contaxt menus
	function cancel_context_menus()
	{
		//-- hide current if there is one
		if(app._current_table_contextmenu_item!=null)
		{
			app._current_table_contextmenu_item.style.display="none";
			app._current_table_contextmenu_item = null;
		}

	}

	//-- capture mouse movement and key press
	//-- capture mouse movement
	if (window.Event && !app.isIE) 
	{
		document.captureEvents(Event.MOUSEMOVE);
		document.captureEvents(Event.MOUSEUP);
	}
	document.onmousemove = _track_documentmouse;
	document.onmouseup = _trap_document_mouseup;
