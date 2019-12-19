//-- prototype that allows us to create popup menus for use with toolbars or context menus
//--

function _new__popupmenu(strUniqueID, eleOwner,actionFunction)
{
	return new _popupmenu(strUniqueID, eleOwner,actionFunction);
}
function _popupmenu(strUniqueID, eleOwner,actionFunction)
{
	this.id = strUniqueID;
	this.popobject = (eleOwner!=undefined)?eleOwner:null; //-- the object which triggered the popup i.e. toolbar button - if left as null assume mouse co-ords


	this.actionfunction = (actionFunction!=undefined)?actionFunction:null; //-- pointer to javascript fiunction to call when menu item is clicked
	this.arr_items = new Array(); //-- items to display (can be action or anoher popup i.e. child menu

	this.highlightcolor = "navy";
	this.highlighttextcolor = "#ffffff";

	this.htmldocument = (eleOwner!=undefined)?app.getEleDoc(eleOwner):null;
	this.htmlholder = null;
	this.created = false;

	this.parentmenu = null;
	this.currentitem = null; //-- pointer to current child menu being shown
}

//-- kill htmlobjects , kill child menu objects etc
_popupmenu.prototype.reset = function()
{
	if(this.htmlholder==null)return;
	var parent = this.htmlholder.parentNode;
	parent.removeChild(this.htmlholder);
	this.htmlholder = null;

	//-- remove items
	for(var x=0;x<this.arr_items.length;x++)
	{
		this.arr_items[x].reset();
	}
	this.arr_items = new Array();
}

//-- draw out
_popupmenu.prototype.show = function(intLeft, intTop, ev)
{
	//-- if not creaed created
	if(this.htmlholder==null)
	{
		if(!this.create())return false;
	}

	if(intLeft==undefined && intTop==undefined)
	{
		//-- top and left not passed in so work out where to popup using parent owner using popobject or ev
		if(ev!=undefined)
		{
			var i = app.findMousePos(ev);
			intTop = i[1];
			intLeft = i[0];
		}
		else
		{
			//-- 
			intTop= this.popobject.offsetTop + this.popobject.offsetHeight - 1;
			intLeft = this.popobject.offsetLeft;
		}
	}
	this.htmlholder.style.position="absolute";
	this.htmlholder.style.top = intTop;
	this.htmlholder.style.left = intLeft;
	this.htmlholder.style.zIndex=99999999;
	this.htmlholder.style.display='block';
}

//-- 
_popupmenu.prototype.hide= function()
{
	if(this.htmlholder!=null)
	{
		this.hide_children();
		this.htmlholder.style.display='none';
		//-- hide any of its children
	}
}

//-- create html div holder and items
_popupmenu.prototype.create= function()
{
	//-- loop through items and create menu html (and any child menus)
	var strHTML = "<div id='" + this.id + "' onclick='this.popupmenu.select(event);' onmouseover='this.popupmenu.highlight(event);' onmouseout='this.popupmenu.lowlight(event);' class='menu-holder'>";
	var strTable = "<table cellspacing='0' cellpadding='0' border='0'>";
	for(var x=0; x<this.arr_items.length;x++)
	{
		strTable += this.arr_items[x]._create_html();
	}
	strTable += "</table>";
	strHTML += strTable + "</div>";

	//-- get div pointer
	app.insertBeforeEnd(this.htmldocument.body,strHTML);
	this.htmlholder = this.htmldocument.getElementById(this.id);
	this.created = true;
	this.htmlholder.popupmenu = this;
	return true;
}

//-- show child menu
_popupmenu.prototype.show_child= function(eventSourceElement)
{
	//-- if item has child menu then show it
	var menuItem = 	this.arr_items[eventSourceElement.rowIndex];
	if(menuItem!=undefined && menuItem.childmenu!=null)
	{
		//-- need to hide current child menu as not the same
		if(this.currentitem!=null && this.currentitem!=menuItem)
		{
			this.currentitem.childmenu.hide();
		}
		menuItem.childmenu.show(this.htmlholder.offsetLeft + this.htmlholder.offsetWidth - 1, this.htmlholder.offsetTop + eventSourceElement.offsetTop + 2);
		this.currentitem = menuItem;
		menuItem.childmenu.parentmenu = this;
	}
}


//-- show child menu
_popupmenu.prototype.hide_children= function(eventSourceElement)
{
	//-- if item has child menu then show it
	for(strPos in this.arr_items)
	{
		var menuItem = 	this.arr_items[strPos];
		if(menuItem!=undefined && menuItem.childmenu!=null)
		{
			//-- need to hide current child menu as not the same
			if(this.currentitem!=null)
			{
				this.currentitem.childmenu.hide();
			}
		}
	}
}


//-- show child menu
_popupmenu.prototype.show_item= function(strID)
{
	for(var x=0; x<this.arr_items.length;x++)
	{
		if(this.arr_items[x].id==strID)
		{
			this.htmlholder.childNodes[0].rows[x].style.display="inline";
			break;
		}
	}
}

//-- hide child menu
_popupmenu.prototype.hide_item= function(strID)
{
	for(var x=0; x<this.arr_items.length;x++)
	{
		if(this.arr_items[x].id==strID)
		{
			//-- get row
			this.htmlholder.childNodes[0].rows[x].style.display="none";
			break;
		}
	}
}


//-- 
_popupmenu.prototype.highlight= function(ev)
{
	//-- get source and get parent row - get rowIndex and this will give us pos in this.arr_items
	var eventSourceElement = ev_source(ev);
	while(eventSourceElement.tagName!="TR")
	{
		eventSourceElement = eventSourceElement.parentNode;
		if(eventSourceElement==null)return false;
	}

	if(eventSourceElement.id=="split") return false;

	eventSourceElement.className="mnu-highlighter";
	this.show_child(eventSourceElement);
}

//-- 
_popupmenu.prototype.lowlight= function(ev)
{

	//-- get source and get parent row - get rowIndex and this will give us pos in this.arr_items
	var eventSourceElement = ev_source(ev);
	while(eventSourceElement.tagName!="TR")
	{
		eventSourceElement = eventSourceElement.parentNode;
		if(eventSourceElement==null)return false;
	}

	eventSourceElement.className="";
}

//-- 
_popupmenu.prototype.select= function(ev)
{
	//-- hide menus
	if(this.popobject!=null)
	{
		var iEnhanced = this.popobject.getAttribute("enhanced");
		if(iEnhanced=="1")
		{
			this.popobject.setAttribute("mnudown","0");
			this.popobject.setAttribute("checked","0");
			this.popobject.className ="toolbar-item";
			toolbar_enhanced_hilo(this.popobject,false);

		}
	}
	this.hide();

	var pMenu =this.parentmenu;
	while (pMenu!=null)
	{
		pMenu.hide();
		pMenu =pMenu.parentmenu;
	}
	
	//-- get source and get parent row - get rowIndex and this will give us pos in this.arr_items
	var eventSourceElement = ev_source(ev);
	while(eventSourceElement.tagName!="TR")
	{
		eventSourceElement = eventSourceElement.parentNode;
		if(eventSourceElement==null)return false;
	}

	var rowIndex = eventSourceElement.rowIndex;
	var selectedItem = this.arr_items[rowIndex];
	if(selectedItem!=undefined)
	{
		//-- call action function
		if(this.actionfunction)this.actionfunction(selectedItem);
	}

}

//-- add child item (not this does not draw it)
_popupmenu.prototype.addmenuitem= function(strID, strLabel, strImage, boolAChildMenu)
{
	this.arr_items[this.arr_items.length++] = new _popupmenuitem(strID, strLabel, strImage, boolAChildMenu, this);
	return this.arr_items[this.arr_items.length-1];
}

function _popupmenuitem(strID, strLabel, strImage, boolAChildMenu, parentMenu)
{
	this.id = strID;
	this.label = strLabel;
	this.img = strImage;
	this.bMenu = boolAChildMenu;
	this.childmenu =  null;

	this.popupmenu = parentMenu; //-- menu on which item is displayed

	this.htmlrow = null;

}

_popupmenuitem.prototype.reset= function()
{
	if(this.bMenu && this.popupmenu!=null)
	{
		this.popupmenu.reset();
	}
	this.popupmenu = null;
	this.htmlrow = null;
}


_popupmenuitem.prototype._create_html= function()
{
	var strImgHtml = "";
	var strLabelHtml = this.label;
	var strChildClass = (this.bMenu)?"mnu-child":"mnu-nochild";

	if(this.id=="split")
	{
		var strHTML = "<tr id='split'><td><div class='mnu-icon'></div></td><td colspan='3' align='middle'><div class='mnu-splitter'></div></td></tr>";
	}
	else
	{
		var strHTML = "<tr><td><div class='mnu-icon'>"+strImgHtml+"</div></td><td valign='middle'><div class='mnu-text'>"+strLabelHtml+"</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='"+strChildClass+"'></div></td></tr>";
	}
	return strHTML;
}