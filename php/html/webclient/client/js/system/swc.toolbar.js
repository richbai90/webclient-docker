//-- functions to help handle special webclient toolbar actions i.e. getting quicklog call list, email signatures etc
//--


//--
//-- get quicklog call list and draw menu options out below target button
function _apptoolbar__get_quicklog_list(eToolBaritem,left,top,e)
{

	if(eToolBaritem.popupmenu==undefined)
	{
		eToolBaritem.popupmenu = new _popupmenu('_ql_menu',eToolBaritem,app._apptoolbar__open_quicklog_item);
	}

	//-- clear down existing items
	eToolBaritem.popupmenu.reset();


	//-- call xmlmc to get folder list of quick log calls for users session
	var boolChildren = false;
	var boolNoRight = false;


	//-- get qlc for users shared mailboxes - have to loop each one
	var arrProcessedNames = new Array();
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		var xmlMb =_arr_xml_mailbox_list[x];

		var strMailboxName = xmlNodeTextByTag(xmlMb,"name")

		if(arrProcessedNames[strMailboxName])continue;
		arrProcessedNames[strMailboxName] = true;


		var strMailboxDisplay = xmlNodeTextByTag(xmlMb,"displayName")
		var intType = xmlNodeTextByTag(xmlMb,"type")
		if(intType==1)strMailboxDisplay="My Quick-Log Calls";
		
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam('mailbox',strMailboxName);
		if(xmlmc.Invoke("helpdesk","quicklogCallGetList"))
		{
			var arrQLI = xmlmc.xmlDOM.getElementsByTagName("quicklogCall");
			if(arrQLI.length>0)
			{
				boolChildren = true;
				//-- parent
				var menuItem = eToolBaritem.popupmenu.addmenuitem(strMailboxName,strMailboxDisplay, "", true);

				//-- create child menu and then add child items to it
				menuItem.childmenu = new _popupmenu(menuItem.id +"_" + menuItem.popupmenu.id, eToolBaritem, app._apptoolbar__open_quicklog_item);
				for (var y=0;y<arrQLI.length;y++)
				{
					menuItem.childmenu.addmenuitem(xmlNodeTextByTag(arrQLI[y],"quicklogCallName"), xmlNodeTextByTag(arrQLI[y],"quicklogCallName"), "", false);
				}
			}
		}
	}

	if(!boolChildren)
	{
		eToolBaritem.popupmenu.addmenuitem("na","There are no quicklog calls defined", "", false);
	}
	eToolBaritem.popupmenu.show(left,top);
	if(e)app.stopEvent(e);
	return false;
}


function _apptoolbar__open_quicklog_item(aMenuItem)
{
	if(aMenuItem.popupmenu.id=="_ql_menu") return false;

	//-- get quicklog call info for xmlmc
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",aMenuItem.label);
	xmlmc.SetParam("mailbox",aMenuItem.popupmenu.parentmenu.currentitem.id);
	if(!xmlmc.Invoke("helpdesk","quicklogCallGet"))
	{
		alert("xmlmc helpdesk:quicklogCallGet Failed:\n\n" + xmlmc.GetLastError());
		return false;
	}

	//-- open log call form of the desired type
	var strForm = xmlmc.GetParam("formName");
	var strClass = xmlmc.GetParam("callClass");

	//- if we are calling from a lfc document then process qlc within in that document
	var _qlc_xmldocument = aMenuItem.popupmenu.htmldocument;
	if(_qlc_xmldocument!=null && _qlc_xmldocument.opencall!=undefined && _qlc_xmldocument._callclass==strClass)
	{
		//-- load data into existing document
		_qlc_xmldocument._process_qlc_data(xmlmc.xmlDOM);
	}
	else
	{
		//-- open new log call form
		var arrParams = new Array();
		arrParams["_qlc_data"] = xmlmc.xmlDOM;
		global.LogNewCall(strForm,null,window,arrParams);
	}
}