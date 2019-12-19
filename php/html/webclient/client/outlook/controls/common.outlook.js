
	document.iMouseLeft = 0;
	document.iMouseTop = 0;
	function _track_documentmouse(e) 
	{
		document.iMouseLeft = (window.Event) ? e.pageX : event.clientX;
		document.iMouseTop = (window.Event) ? e.pageY : event.clientY;

		//-- pass mouse info to top level
		app._track_appwide_mouse_cursor(true,document.iMouseLeft,document.iMouseTop,document.contentWindow);
		return true;
	}

	function _trap_document_mouseup(e)
	{
		app._trap_document_mouseup(e);
	}


	//-- capture mouse movement and key press
	//-- capture mouse movement
	var app = top;
	if (window.Event && !app.isIE) 
	{
		document.captureEvents(Event.MOUSEMOVE);
		document.captureEvents(Event.MOUSEUP);
	}
	document.onmousemove = _track_documentmouse;
	document.onmouseup = _trap_document_mouseup;
