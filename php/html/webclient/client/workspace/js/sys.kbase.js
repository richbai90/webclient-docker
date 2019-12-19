//-- 12.10.2009
//-- system functions to support the kbase view in AP

//-- flag status constants

//-- handle kbase search row select
var _kbase_current_selected_document = "";
var _kbase_selecting_row = null;
function kbase_select_row(aRow,e)
{
	if(_kbase_selecting_row==aRow) 
	{
		return false;
	}
	_kbase_selecting_row=aRow;

	//-- get event
	if(!e)e = window.event;

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');
	var iExt = 0;

	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("docRef",intKeyValue);
	if(xmlmc.Invoke("knowledgebase","documentGetType"))
	{
		if(xmlmc.GetParam("type")=="External") iExt=1;
	}
	
	//--
	//-- highlight row - keep last selected if CTRL key is selected
	app.datatable_hilight(aRow, e.ctrlKey);

	//-- manage servicedesk toolbar options based on selected call (s) status
	manage_kbase_toolbar(aRow);

	//-- load preview of email - if not already selected
	if(_kbase_current_selected_document!=intKeyValue)
	{
		_kbase_current_selected_document=intKeyValue;
		load_kbase_preview(intKeyValue,iExt);
	}
}

//-- open kbase article
function kbase_open_row(aRow,e)
{
	//alert("Managing knowledgebase articles is not supported by the webclient.");
	//return;

	//-- get event object
	if(!e)e = window.event;

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');

	app.kbase.open_document(intKeyValue);

}

function _kbase_form_closed()
{
	//alert("form closed : refresh?")
}

//-- load preview of kbase article
function load_kbase_preview(intKeyValue,intExt)
{
	var strParams = "docref=" + app.pfu(intKeyValue);

	if(intExt==1)
	{
		var strURL = app._workspacecontrolpath + "_views/knowledgebase/kbasepreview.php?" + strParams;
	}
	else
	{
		var strURL = app.webroot + "/clisupp/details/swkbase.php?"+ strParams;
	}

	var targetDocument = app.getFrameDoc("iform_knowledgebase_" + top._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
	if(targetDocument!=undefined)app.load_iform(strURL, targetDocument);
}

//-- process email toolbar item
function kbase_toolbar_action(strToolBarItemID)
{
	alert(strToolBarItemID)
}

//-- enable / disable the email toolbar
function manage_kbase_toolbar(aRow)
{

	var bRead = false;
	var bNotRead = false;
	var bFlaggedRead = false;
	var bFlaggedNotRead = false;
	//--
	//-- get all selected rows for the email row table - we only want to enable toolbar options based on majority
	var eDataTable = app.get_row_datatable(aRow);
	var strCurrIndexes = app.get_row_datatable_selectedindexes(aRow);
	var arrIndexes = strCurrIndexes.split(",");
	
	for(var x=0;x<arrIndexes.length;x++)
	{
		var intStatusValue = eDataTable.rows[x].getAttribute('emailstatus');
		intStatusValue++;intStatusValue--;
		switch (intStatusValue)
		{
			case _EMAIL_READ:
				bRead=true;
				break;
			case _EMAIL_NOTREAD:
				bNotRead=true;
				break;
			case _EMAIL_FLAGGEDANDREAD:
				bRead=true;
				bFlaggedRead=true;
				break;
			case _EMAIL_FLAGGEDANDNOTREAD:
				bFlaggedRead=true;
				bNotRead=true;
				break;			
		}
	}
	

	//-- enable buttons on toolbar
	var aDoc = app.getEleDoc(aRow);

	//-- can always mark as unread or read based
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasread" , bNotRead, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasunread" , bRead, aDoc);

	//-- can always flag or unflag emails
	app.toolbar_item_dore("emailview_toolbar", "emailflag" , !bFlaggedRead, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailunflag" , bFlaggedRead, aDoc);

	//-- can always delete email (s)
	app.toolbar_item_dore("emailview_toolbar", "emaildelete" , true, aDoc);

	//-- can only reply or forward if one email selected
	app.toolbar_item_dore("emailview_toolbar", "emailview" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreply" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreplyall" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailforward" , (arrIndexes.length==1), aDoc);

}