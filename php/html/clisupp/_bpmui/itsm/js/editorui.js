/**
 * $Id: EditorUi.js 45556 2014-06-17 08:18:58Z INTERNAL\production $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */


EditorUi = function(editor, container)
{
	this.editor = editor || new Editor();
	this.container = container || document.body;
	var graph = editor.graph;


	// Disables scrollbars
	this.container.style.overflow = 'hidden';

	// Pre-fetches submenu image
	new Image().src = mxPopupMenu.prototype.submenuImage;

	// Pre-fetches connect image
	if (mxConnectionHandler.prototype.connectImage != null)
	{
		new Image().src = mxConnectionHandler.prototype.connectImage.src;
	}
	
    // Creates the user interface
	this.actions = new Actions(this);
	this.menus = new Menus(this);
	this.createDivs();
	this.refresh();
	this.createUi();

	// Disables HTML and text selection
	var textEditing =  mxUtils.bind(this, function(evt)
	{
		if (evt == null)
		{
			evt = window.event;
		}
		
		if (this.isSelectionAllowed(evt))
		{
			return true;
		}
		
		return graph.isEditing() || this.dialog != null;
	});

	// Disables text selection while not editing and no dialog visible
	if (this.container == document.body)
	{
		document.onselectstart = textEditing;
		document.onmousedown = textEditing;
	}
	
	// And uses built-in context menu while editing
	if (mxClient.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
	{
		mxEvent.addListener(this.diagramContainer, 'contextmenu', textEditing);
	}
	else
	{
		// Allows browser context menu outside of diagram and sidebar
		this.diagramContainer.oncontextmenu = textEditing;
	}

	// Contains the main graph instance inside the given panel
	graph.init(this.diagramContainer);
	graph.refresh();
    
    // Enables scrollbars and sets cursor style for the container
	graph.container.setAttribute('tabindex', '0');
   	graph.container.style.overflow = (touchStyle) ? 'hidden' : 'auto';
   	graph.container.style.cursor = 'default';
    graph.container.style.backgroundImage = 'url(' + IMAGE_PATH + '/grid.gif)';
   	graph.container.focus();
   	
   	// Keeps graph container focused on mouse down
   	var graphFireMouseEvent = graph.fireMouseEvent;
   	graph.fireMouseEvent = function(evtName, me, sender)
   	{
   		if (evtName == mxEvent.MOUSE_DOWN)
   		{
   			this.container.focus();
   		}
   		
   		graphFireMouseEvent.apply(this, arguments);
   	};

   	// Configures automatic expand on mouseover
	graph.panningHandler.autoExpand = true;

    // Installs context menu
	graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function(menu, cell, evt)
	{
		this.menus.createPopupMenu(menu, cell, evt);
	});
	
	// Hides context menu
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		graph.popupMenuHandler.hideMenu();
	}));



    // Create handler for key events
	var keyHandler = this.createKeyHandler(editor);
    
	// Getter for key handler
	this.getKeyHandler = function()
	{
		return keyHandler;
	};

	// Shows dialog if changes are lost
	window.onbeforeunload = function()
	{
		if (editor.modified)
		{
			//return mxResources.get('allChangesLost');
		}
	};

	// Updates the editor UI after the window has been resized
   	mxEvent.addListener(window, 'resize', mxUtils.bind(this, function()
   	{
   		this.refresh();
   		graph.sizeDidChange();
   	}));

	// Updates action and menu states
   	this.init();

};


/**
 * Specifies the size of the split bar.
 */
EditorUi.prototype.splitSize = (mxClient.IS_TOUCH) ? 16 : 8;

/**
 * Specifies the height of the menubar. Default is 34.
 */
EditorUi.prototype.menubarHeight = 33;

/**
 * Specifies the height of the toolbar. Default is 36.
 */
EditorUi.prototype.toolbarHeight = 36;

/**
 * Specifies the height of the footer. Default is 28.
 */
EditorUi.prototype.footerHeight = 28;

/**
 * Specifies the position of the horizontal split bar. Default is 190.
 */
EditorUi.prototype.hsplitPosition = 190;

/**
 * Specifies the position of the vertical split bar. Default is 190.
 */
EditorUi.prototype.vsplitPosition = 190;

/**
 * Installs the listeners to update the action states.
 */
EditorUi.prototype.init = function()
{
	// Updates action states
	this.addUndoListener();
	this.addSelectionListener();

	// Overrides clipboard to update paste action state
	var paste = this.actions.get('paste');
	
	var updatePaste = function()
	{
		paste.setEnabled(!mxClipboard.isEmpty());
	};
	
	var mxClipboardCut = mxClipboard.cut;
	mxClipboard.cut = function()
	{
		mxClipboardCut.apply(this, arguments);
		updatePaste();
	};
	
	var mxClipboardCopy = mxClipboard.copy;
	mxClipboard.copy = function()
	{
		mxClipboardCopy.apply(this, arguments);
		updatePaste();
	};
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.isSelectionAllowed = function(evt)
{
	return false;
};


/**
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addUndoListener = function()
{
	return;

	var undo = this.actions.get('undo');
	var redo = this.actions.get('redo');
	
	var undoMgr = this.editor.undoManager;
	
    var undoListener = function()
    {
    	undo.setEnabled(undoMgr.canUndo());
    	redo.setEnabled(undoMgr.canRedo());
    };

    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);
	
	// Updates the button states once
    undoListener();
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
EditorUi.prototype.addSelectionListener = function()
{
	var selectionListener = mxUtils.bind(this, function()
    {
		var graph = this.editor.graph;
		var selected = !graph.isSelectionEmpty();
		var vertexSelected = false;
		var edgeSelected = false;

		var cells = graph.getSelectionCells();
		
		if (cells != null)
		{
	    	for (var i = 0; i < cells.length; i++)
	    	{
	    		var cell = cells[i];
	    		
	    		if (graph.getModel().isEdge(cell))
	    		{
	    			edgeSelected = true;
	    		}
	    		
	    		if (graph.getModel().isVertex(cell))
	    		{
	    			vertexSelected = true;
	    		}
	    		
	    		if (edgeSelected && vertexSelected)
				{
					break;
				}
	    	}
		}
		
		// Updates action states

		var actions = ['delete'];
    	
    	for (var i = 0; i < actions.length; i++)
    	{
    		this.actions.get(actions[i]).setEnabled(selected);
    	}
    	
		/*
    	// Updates menu states
    	var menus = ['fontFamily', 'fontSize', 'alignment', 'position', 'text', 'format',
    	    'arrange', 'linewidth', 'spacing', 'gradient'];

    	for (var i = 0; i < menus.length; i++)
    	{
			var menu = this.menus.get(menus[i]);
			if(menu)this.menus.get(menus[i]).setEnabled(selected);
    	}
		*/
    	
    });
	    
    this.editor.graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);
    selectionListener();
};

/**
 * Refreshes the viewport.
 */
EditorUi.prototype.refresh = function()
{
	var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode == 5);
	var w = this.container.clientWidth;
	var h = this.container.clientHeight;

	if (this.container == document.body)
	{
		w = document.body.clientWidth || document.documentElement.clientWidth;
		h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
	}
	
	var tmp = 0;//this.menubarHeight + this.toolbarHeight;
	
	if (!mxClient.IS_QUIRKS)
	{
		tmp += 1;
	}
	
	this.diagramContainer.style.left = '0px';
	this.diagramContainer.style.top = tmp + "px";
	this.footerContainer.style.height = this.footerHeight + 'px';
	this.footerContainer.style.left = '0px';

	var diagramHeight = (h - this.footerHeight);
	this.diagramContainer.style.height = diagramHeight + 'px';
	this.diagramContainer.style.width =  w;
	this.footerContainer.style.width = w;
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createDivs = function()
{
	this.diagramContainer = this.createDiv('geDiagramContainer');
	this.footerContainer = this.createDiv('geFooterContainer');

	this.diagramContainer.style.right = '0px';
	this.footerContainer.style.left = '0px';
	this.footerContainer.style.right = '0px';
	this.footerContainer.style.bottom = '0px';
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createUi = function()
{
	this.footerContainer.appendChild(this.createFooter());
	this.container.appendChild(this.diagramContainer);
	this.container.appendChild(this.footerContainer);
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.createStatusContainer = function()
{
	var container = document.createElement('a');
	container.className = 'geItem geStatus';
	
	return container;
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.setStatusText = function(value)
{
	this.footerContainer.firstChild.style.color="#4B4B4B";	
	this.footerContainer.firstChild.style.padding="5px";
	this.footerContainer.firstChild.innerHTML = value;
	//this.statusContainer.innerHTML = value;
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.createToolbar = function(container)
{
	return new Toolbar(this, container);
};


/**
 * Creates and returns a new footer.
 */
EditorUi.prototype.createFooter = function()
{
	return this.createDiv('geFooter');
};

/**
 * Creates the actual toolbar for the toolbar container.
 */
EditorUi.prototype.createDiv = function(classname)
{
	var elt = document.createElement('div');
	elt.className = classname;
	
	return elt;
};


/**
 * Displays a print dialog.
 */
EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose)
{
	this.hideDialog();
	this.dialog = new Dialog(this, elt, w, (mxClient.IS_VML) ? h - 12 : h, modal, closable, onClose);
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.hideDialog = function()
{
	if (this.dialog != null)
	{
		this.dialog.close();
		this.dialog = null;
		this.editor.graph.container.focus();
	}
};


/**
 * Executes the given layout.
 */
EditorUi.prototype.executeLayout = function(layout, animate, ignoreChildCount)
{
	var graph = this.editor.graph;
	var cell = graph.getSelectionCell();

	graph.getModel().beginUpdate();
	try
	{
		layout.execute(graph.getDefaultParent(), cell);
	}
	catch (e)
	{
		throw e;
	}
	finally
	{
		// Animates the changes in the graph model except
		// for Camino, where animation is too slow
		if (animate && navigator.userAgent.indexOf('Camino') < 0)
		{
			// New API for animating graph layout results asynchronously
			var morph = new mxMorphing(graph);
			morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
			{
				graph.getModel().endUpdate();
			}));
			
			morph.startAnimation();
		}
		else
		{
			graph.getModel().endUpdate();
		}
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.createKeyHandler = function(editor)
{
	var graph = this.editor.graph;
    var keyHandler = new mxKeyHandler(graph);
    
    // Routes command-key to control-key on Mac
    keyHandler.isControlDown = function(evt)
    {
    	return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
    };
	
	// Helper function to move cells with the cursor keys
    function nudge(ev)
    {

    	if (!graph.isSelectionEmpty())
		{
    		var dx = 0;
    		var dy = 0;
    		
    		if (ev.keyCode == 37)
			{
    			dx = -1;
			}
    		else if (ev.keyCode == 38)
    		{
    			dy = -1;
    		}
    		else if (ev.keyCode == 39)
    		{
    			dx = 1;
    		}
    		else if (ev.keyCode == 40)
    		{
    			dy = 1;
    		}
    		
    		graph.moveCells(graph.getSelectionCells(), dx, dy);
    		//graph.scrollCellVisible(graph.getSelectionCell());
		}
    };

    // Binds keystrokes to actions
    var bindAction = mxUtils.bind(this, function(code, control, key, shift)
    {
		var action = this.actions.get(key);
    	if (action != null)
    	{
    		var f = function()
    		{
				if (action.enabled)
				{
					action.funct();
				}
    		};
    		
    		if (control)
    		{
    			if (shift)
    			{
    				keyHandler.bindControlShiftKey(code, f);
    			}
    			else
    			{
    				keyHandler.bindControlKey(code, f);
    			}
    		}
    		else
    		{
    			if (shift)
    			{
    				keyHandler.bindShiftKey(code, f);
    			}
    			else
    			{
    				keyHandler.bindKey(code, f);
    			}
    		}
    	}
    });
    
    var ui = this;
    var keyHandleEscape = keyHandler.escape;
    keyHandler.escape = function(evt)
    {
    	ui.hideDialog();
    	keyHandleEscape.apply(this, arguments);
    };
    
    // Ignores enter keystroke. Remove this line if you want the
    // enter keystroke to stop editing.
    keyHandler.enter = function() {};
	bindAction(46, false, 'delete'); // Delete
    bindAction(107, false, 'zoomIn'); // Add
    bindAction(109, false, 'zoomOut'); // Subtract
    bindAction(119, false, 'actualSize'); // F8
    bindAction(113, false, 'fitWindow'); // F2
    bindAction(71, true, 'grid', true); // Ctrl+Shift+G

	//-- move items with arrows
	keyHandler.bindKey(37, nudge);
	keyHandler.bindKey(38, nudge);
	keyHandler.bindKey(39, nudge);
	keyHandler.bindKey(40, nudge);



		
    return keyHandler;
};
