//-- 19.10.2009
//-- functions for managing calendar view - i.e. 


//-- handle menu bar actions 
var _current_calendar_view = 1;
function calendar_toolbar_action(strToolBarItemID)
{
	switch(strToolBarItemID)
	{
		case "appnew":
			_add_new_appointment();
			break;
		case "cal1":
		case "cal5":
		case "cal7":
		case "cal31":
			//-- change calendar view
			var targetDocument = app.getFrame("iform_calendar_" + app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
			if(targetDocument==undefined)
			{
				alert("calendar_toolbar_action : The calendar workspace iframe was not found.\n\nPlease contact your Administrator.")
				return false;
			}
			targetDocument.change_view(strToolBarItemID);
			break;
		default:
			alert(strToolBarItemID);
	}
}

//--
//-- enable disable toolbar based on selected appointment
function manage_calendar_toolbar(aDiv)
{
	//-- enable buttons on toolbar
	var aDoc = app.getEleDoc(aDiv);
	app.toolbar_item_dore("calendar_toolbar", "appnew" , true, aDoc);
	app.toolbar_item_dore("calendar_toolbar", "appview" , true, aDoc);
	app.toolbar_item_dore("calendar_toolbar", "appdelete" , true, aDoc);
}


function _add_new_appointment(intCalID)
{
	if(intCalID==undefined)intCalID = app.oControlFrameHolder.intDefaultCalendarID;


	var arrCals = app.oControlFrameHolder._strSelectedCalendars.split("|");
	if(arrCals.length==0) 
	{
		alert("Please select a calendar and then create a new appointment.");
		return;
	}
	else if(arrCals.length>1) 
	{
		alert("You can only create a calendar ")
		return;
	}
	else
	{
		intCalID = arrCals[0].split("^")[0];
		strCalName = arrCals[0].split("^")[1];
	}


	//-- open appointment record
	var jsDate= new Date();
	var startTime = app._formatDate(jsDate,"yyyy-MM-dd HH:mm:ss");
	jsDate.setHours(jsDate.getHours()+1);
	var endTime = app._formatDate(jsDate,"yyyy-MM-dd HH:mm:ss");

	var strParams  = "addnew=1&startdate="+startTime+"&enddate="+endTime+"&calname="+strCalName+"&calid="+intCalID;
	app._open_system_form("_sys_calendar_appointment", "calendar", "", strParams, true, function()
	{
		//-- refresh calendar
		_refresh_calendar_view();
	},null,window);

}


function _edit_appointment(intCalID,intAppID)
{
	//-- open appointment record
	var strParams  = "addnew=0&calid="+intCalID+"&appid=" + intAppID;
	var strKey = intCalID +"::"+intAppID;
	app._open_system_form("_sys_calendar_appointment", "calendar", strKey, strParams, true, function()
	{
		//-- refresh calendar
		setTimeout("_refresh_calendar_view()",100);
	},null,window);

}

//--
//-- open appointment
function open_appointment(aDiv)
{
	var aDoc = app.getEleDoc(aDiv);
	var intAppID = aDiv.getAttribute("appid");
	var intCalID = aDiv.getAttribute("calid");
	return _edit_appointment(intCalID,intAppID);
}

function _refresh_calendar_view()
{
	//-- reload current view
	app.oControlFrameHolder.load_calendars();
}


function switch_calendar_view_btn(strView)
{
	switch(strView)
	{
		case 1:
			strBtnID= "cal1";
			break;
		case 7:
			strBtnID= "cal7";
			break;
		case 3:
			strBtnID= "cal31";
			break;
	}

	//-- store
	_current_calendar_view= strView;

	//var targetDocument = app.getFrame("iform_calendar_calendar", app.oWorkspaceFrameHolder.document);
	app.toolbar_item_check("calendar_toolbar",strBtnID,app.oWorkspaceFrameHolder.document)
}
