//-- for information on how this js works see http://wikisvr1/userwiki/index.php5/ESP:JS_MyCallsListView#MyCallsListView
var menuid;

function OnContextMenu(MenuHandle)
{
	var strMenuText = "";
	var count = GetMenuItemCount(MenuHandle);
	for (var x=0;x<count ;x++)
	{
		strMenuText = GetMenuString(MenuHandle, x, MF_BYPOSITION);
		if((strMenuText.indexOf("Issue")!=-1)||(strMenuText.indexOf("Change Call Class")!=-1))
		{
			//-- something to do with issues so disable - could change label and do someting like add to rfcs etc
			EnableMenuItem(MenuHandle, x, MF_BYPOSITION | MF_DISABLED | MF_GRAYED);
		}
	}
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
	return true;
}

function OnUpdateContextMenuItem(MenuHandle, CommandID)
{     

}

