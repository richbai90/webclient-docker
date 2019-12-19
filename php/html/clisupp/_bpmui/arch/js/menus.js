/**
 * $Id: Menus.js,v 1.59 2013-01-16 08:40:17 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */
Menus = function(editorUi)
{
	this.editorUi = editorUi;
	this.menus = new Object();
	this.init();
	
	// Pre-fetches checkmark image
	new Image().src = IMAGE_PATH + '/checkmark.gif';
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.init = function()
{
	var graph = this.editorUi.editor.graph;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.put = function(name, menu)
{
	this.menus[name] = menu;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.get = function(name)
{
	return this.menus[name];
};

/**
 * Adds the given submenu.
 */
Menus.prototype.addSubmenu = function(name, menu, parent)
{
	if(this.get(name))
	{
		var enabled = this.get(name).enabled;
		
		if (menu.showDisabled || enabled)
		{
			var submenu = menu.addItem(mxResources.get(name), null, null, parent, null, enabled);
			this.addMenu(name, menu, submenu);
		}
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.addMenu = function(name, popupMenu, parent)
{
	var menu = this.get(name);
	
	if (menu != null && (popupMenu.showDisabled || menu.enabled))
	{
		this.get(name).execute(popupMenu, parent);
	}
};


/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.pickColor = function(key)
{
	if (this.colorDialog == null)
	{
		this.colorDialog = new ColorDialog(this.editorUi);
	}

	this.colorDialog.currentColorKey = key;
	var graph = this.editorUi.editor.graph;
	var state = graph.getView().getState(graph.getSelectionCell());
	var color = 'none';
	
	if (state != null)
	{
		color = state.style[key] || color;
	}
	
	if (color == 'none')
	{
		color = 'ffffff';
		this.colorDialog.picker.fromString('ffffff');
		this.colorDialog.colorInput.value = 'none';
	}
	else
	{
		this.colorDialog.picker.fromString(color);
	}

	this.editorUi.showDialog(this.colorDialog.container, 220, 400, true, false);
	
	if (!mxClient.IS_TOUCH)
	{
		this.colorDialog.colorInput.focus();
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItem = function(menu, key, parent)
{
	var action = this.editorUi.actions.get(key);

	if (action != null && (menu.showDisabled || action.enabled))
	{
		var item = menu.addItem(action.label, null, action.funct, parent, null, action.enabled);
		
		// Adds checkmark image
		if (action.toggleAction && action.isSelected())
		{
			this.addCheckmark(item);
		}

		this.addShortcut(item, action);
		
		return item;
	}
	
	return null;
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addShortcut = function(item, action)
{
	if (action.shortcut != null)
	{
		var td = item.firstChild.nextSibling.nextSibling;
		var span = document.createElement('span');
		span.style.color = 'gray';
		mxUtils.write(span, action.shortcut);
		td.appendChild(span);
	}
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addCheckmark = function(item)
{
	var td = item.firstChild.nextSibling;
	td.style.backgroundImage = 'url(' + IMAGE_PATH + '/checkmark.gif)';
	td.style.backgroundRepeat = 'no-repeat';
	td.style.backgroundPosition = '2px 50%';
	td.style.width = '20px';
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItems = function(menu, keys, parent)
{
	for (var i = 0; i < keys.length; i++)
	{
		if (keys[i] == '-')
		{
			menu.addSeparator(parent);
		}
		else
		{
			this.addMenuItem(menu, keys[i], parent);
		}
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.createPopupMenu = function(menu, cell, evt)
{

	var graph = this.editorUi.editor.graph;
	menu.smartSeparators = true;
	
	if (graph.isSelectionEmpty())
	{
		//-- no options? maybe switch off grid
	}
	else
	{
		var bAllowDelete = true;
		var aCell = graph.getSelectionCell();
		switch(aCell.htl.type)
		{
			case "start":
				//-- if we already have a start stage then do not show start option
				if(aCell.edges==undefined)
				{
					this.addMenuItems(menu, ['addstage','-']);	
				}
				this.addMenuItems(menu, ['editworkflow','-','copyworkflow','resetworkflowgraph','print']);	
				break;
			case "stage":
				this.addMenuItems(menu, ['editstage','editauth','-','editstagestartcond','addstartcond','-','editstagestatuscond','addstatuscond']);	
				break;
			case "auth":
				this.addMenuItems(menu, ['editauth']);	
				break;
			case "startcond":
				this.addMenuItems(menu, ['addstartcond','editstagestartcond','-','addstage']);	
				break;
			case "statuscond":
				this.addMenuItems(menu, ['addstatuscond','editstagestatuscond','-','addstage']);	
				break;
			case "endnode":
				this.addMenuItems(menu, ['addstatuscond','editstagestatuscond','-','addstage']);
				bAllowDelete = false;				
				break;

			case "link":
				//-- check if a condition link
				if(aCell.htl.condid!="")
				{
					this.addMenuItems(menu, ['editcond']);	
				}
				switch(aCell.source.htl.type)
				{
					case "start":
					case "stage":
					case "auth":
						bAllowDelete = false;
					break;
				}

				break;
		}

		if(bAllowDelete)	this.addMenuItems(menu, ['-','delete']);	
	}
	
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.createMenubar = function(container)
{
	
	var menubar = new Menubar(this.editorUi, container);
	/*
	var menus = ['file', 'options', 'help'];
	
	for (var i = 0; i < menus.length; i++)
	{
		menubar.addMenu(mxResources.get(menus[i]), this.get(menus[i]).funct);
	}
	*/

	return menubar;
};

/**
 * Construcs a new menubar for the given editor.
 */
function Menubar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	
	// Global handler to hide the current menu
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	mxEvent.addListener(document, md, mxUtils.bind(this, function(evt)
	{
		this.hideMenu();
	}));
};

/**
 * Adds the menubar elements.
 */
Menubar.prototype.hideMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
	}
};

/**
 * Adds a submenu to this menubar.
 */
Menubar.prototype.addMenu = function(label, funct)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geItem';
	mxUtils.write(elt, label);

	this.addMenuHandler(elt, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menubar.prototype.addMenuHandler = function(elt, funct)
{
	if (funct != null)
	{
		var show = true;
		
		var clickHandler = mxUtils.bind(this, function(evt)
		{
			if (show && elt.enabled == null || elt.enabled)
			{
				this.editorUi.editor.graph.panningHandler.hideMenu();
				var menu = new mxPopupMenu(funct);
				menu.div.className += ' geMenubarMenu';
				menu.smartSeparators = true;
				menu.showDisabled = true;
				menu.autoExpand = true;
				
				// Disables autoexpand and destroys menu when hidden
				menu.hideMenu = mxUtils.bind(this, function()
				{
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					menu.destroy();
					this.currentMenu = null;
					this.currentElt = null;
				});

				menu.popup(elt.offsetLeft + 4, elt.offsetTop + elt.offsetHeight + 4, null, evt);
				this.currentMenu = menu;
				this.currentElt = elt;
			}
			
			show = true;
			mxEvent.consume(evt);
		});
		
		// Shows menu automatically while in expanded state
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt)
		{
			if (this.currentMenu != null && this.currentElt != elt)
			{
				this.hideMenu();
				clickHandler(evt);
			}
		}));

		// Hides menu if already showing
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function()
		{
			show = this.currentElt != elt;
		}));
		
		mxEvent.addListener(elt, 'click', clickHandler);
	}
};

/**
 * Constructs a new action for the given parameters.
 */
function Menu(funct, enabled)
{
	mxEventSource.call(this);
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
};

// Menu inherits from mxEventSource
mxUtils.extend(Menu, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.setEnabled = function(value)
{
	if (this.enabled != value)
	{
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.execute = function(menu, parent)
{
	this.funct(menu, parent);
};
