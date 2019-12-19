
//--
//-- tab control helpers
function hilite_tabitem(oItem, oEv)
{
	if(oItem.className!="tabitem-selected")	oItem.className = "tabitem-hover";
}

function lolite_tabitem(oItem, oEv)
{
	if(oItem.className!="tabitem-selected")	oItem.className = "tabitem";
}

function _ti_get_tabspace(oItem)
{
	var oSpace =null;
	var spaceid = "tispace_" + oItem.id;
	var oTable = app.get_parent_owner_by_tag(oItem, "TABLE");
	if(oTable!=null)
	{
		oSpace = app.get_parent_child_by_id(oTable,spaceid);
	}
	return oSpace;
}

function _ti_hide_space(oItem)
{
	var space = _ti_get_tabspace(oItem);
	if(space!=null)
	{
		space.className="tab-item-workspace";
	}
}

function _ti_show_space(oItem)
{
	var space = _ti_get_tabspace(oItem);
	if(space!=null)
	{
		var oTable = app.get_parent_owner_by_tag(oItem, "TABLE");
		var intNewHeight = oTable.offsetHeight;
		space.className="tab-item-workspace-selected";
		if(oTable)
		{
			app.oWorkspaceFrameHolder.sizeup_workspace_areas();//
		}
	}
}

function select_tabitem(oItem, oEv)
{
	var tiHolder = app.get_parent_owner_by_id(oItem,"itemholder");
	var selectedItem = 	app.get_parent_child_by_class(tiHolder,"tabitem-selected");	
	if(selectedItem!=null)
	{
		_ti_hide_space(selectedItem)
		selectedItem.className = "tabitem";
	}

	//--
	//-- hide any context menu items
	if(app.oWorkspaceFrameHolder!=null && app.oWorkspaceFrameHolder.cancel_context_menus) app.oWorkspaceFrameHolder.cancel_context_menus();


	oItem.className = "tabitem-selected";
	_ti_show_space(oItem);

	//-- get control info
	var arrControlInfo = oItem.getAttribute("control").split(":");
	var strType = arrControlInfo[0];
	var strID = arrControlInfo[1];

	//-- check if control has been loaded
	var boolLoaded = oItem.getAttribute("controlloaded");
	if((boolLoaded==null)||(boolLoaded==false))
	{
		//-- refresh the control data source if it has any
		oItem.setAttribute("controlloaded",true);
	}
	else
	{
		//-- should we fresh content?
	}

	//-- activate datatable
	if(strType=="datatable")
	{
		var eDataTableHolder = app.oWorkspaceFrameHolder.document.getElementById(strID);
		//-- resize for all browsers swref 91963
		//if(!app.isIE || app.isIE10Above)
		//{
			if(eDataTableHolder.getAttribute("initialResize")!="loaded")
			{
				eDataTableHolder.setAttribute("initialResize","loaded");
				var oHeaderHolder = app.get_parent_child_by_id(eDataTableHolder,'table_columns');
				datatable_resize_datacolumns(null,oHeaderHolder)
			}
		//}
		app._select_sevicedesk_table(eDataTableHolder.childNodes[2]);
	}
}

function hide_tab_item(oItem, oEv)
{

}

function show_tab_item(oItem, oEv)
{

}