var menuid;

function OnContextMenu(MenuHandle)
{
	// AR 10.11.04  Modify View Call Details Menu Item
	//ModifyMenu(MenuHandle,0, MF_STRING|MF_BYPOSITION, 1, "View Enquiry Details");
	//	ModifyMenu(MenuHandle,1, MF_STRING|MF_BYPOSITION, 2, "Select Quick-Log Enquiry");

		//-- remove call activity menu items
	//	RemoveMenu(MenuHandle, 4, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 5, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 6, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 7, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 8, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 9, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 10, MF_BYPOSITION);
	//	RemoveMenu(MenuHandle, 11, MF_BYPOSITION);
	//MessageBox("Hello");
}

function OnViewLoaded()
{
	//--
	//-- hide the context menu

	//ShowContextMenu(false);
}

function OnViewLoading()
{
	//--
}

function OnContextMenuClicked(CommandID, Callrefs)
{
	//MessageBox(CommandID);
	return true;
}

function OnUpdateContextMenuItem(MenuHandle, CommandID)
{     
	// AR 10.11.04 Disable right-click options
	if(CommandID === HELPDESK_ACCEPTCALL || CommandID === HELPDESK_TRANSFERCALL || 
		CommandID === HELPDESK_UPDATECALL || CommandID === HELPDESK_HOLDCALL || CommandID === HELPDESK_CLOSECALL || 
		CommandID === HELPDESK_CANCELCALL || CommandID === HELPDESK_CHANGECALLPROFILECODE || CommandID === HELPDESK_CHANGECALLCLASS || 
		CommandID === HELPDESK_CHANGECALLCONDITION || CommandID === HELPDESK_REACTIVATECALL)
	{
		//EnableMenuItem(MenuHandle, CommandID, MF_BYCOMMAND | MF_DISABLED | MF_GRAYED);
	}
	/*
		DeleteMenu(MenuHandle, 4, MF_BYPOSITION);
		DeleteMenu(MenuHandle, 5, MF_BYPOSITION);
		DeleteMenu(MenuHandle, 6, MF_BYPOSITION);	
		DeleteMenu(MenuHandle, 7, MF_BYPOSITION);	
		DeleteMenu(MenuHandle, 8, MF_BYPOSITION);
		DeleteMenu(MenuHandle, 9, MF_BYPOSITION);
		DeleteMenu(MenuHandle, 10, MF_BYPOSITION);
		DeleteMenu(MenuHandle, 11, MF_BYPOSITION);
	*/
}

