//-- 07.10.2009
//-- functions for managing servicedesk view - i.e. selecting calls, setting context menu and toolbar options etc

var _PENDING = 1;
var _UNASSIGNED = 2;
var _UNACCEPTED = 3;
var _ONHOLD = 4;
var _OFFHOLD = 5;
var _RESOLVED = 6;
var _DEFFERED = 7;
var _INCOMING = 8;
var _ESCO = 9;
var _ESCG = 10;
var _ESCA = 11;
var _LOST = 15;
var _CLOSED = 16;
var _CANCELLED = 17;
var _CLOSEDCHARGE = 18;

//-- will always tore the last biggest helpdesk last update x for the current service desk view
var _LAST_HELPDESKVIEW_LASTACTDATEX = global.GetCurrentEpocTime();

//-- called when service desk tree has loaded - we then poll for workspace document loaded and once done we get call lists
var _servicedesk_tree = null;
function servicedesk_tree_loaded(aTree)
{
	//-- open to logged in analyst
	_servicedesk_tree = aTree;
	setTimeout("on_service_desk_workspace_loaded()",10);
}

function on_service_desk_workspace_loaded()
{
	if(app.oWorkspaceFrameHolder.iamready!=undefined && app.oWorkspaceFrameHolder.iamready)
	{
		_ServiceDeskDocumentElement = app.oWorkspaceFrameHolder.document;
		//-- view as been initialise by call href="hsl:mycalls" or similar
		if(boolHSLACTION)
		{
			boolHSLACTION = false;
			_process_hsl_servicedesk_action();
		}
		else
		{
			//-- open to current context
			var pos = _servicedesk_tree.getNodePositionByID(session.currentAnalystId,"grp_" + session.currentGroupId);
			_servicedesk_tree.openTo(pos,true,true,true);
		}
	}
	else
	{
		setTimeout("on_service_desk_workspace_loaded()",10);
	}
}

//-- load service desk view, select tab item and a filter
var boolHSLACTION = false;
var strHSLACTION_action = "";
var strHSLACTION_tfilter = "";
var strHSLACTION_lfilter = "";
var strHSLACTION_ttabitem = "";
var strHSLACTION_ltabitem = "";
function hslaction_servicedesk_view(strAction, arrInfo)
{
		//-- load or switch to view
	strHSLACTION_action =strAction;
	boolHSLACTION = true;
	strHSLACTION_tfilter = "";
	strHSLACTION_ttabitem = "";
	strHSLACTION_lfilter = "";
	strHSLACTION_ltabitem = "";


	//--
	//-- var arrInfo = strParams.split("&");
	for(var strParam in arrInfo)
	{
		var strValue = arrInfo[strParam];

		if(strParam=="tab")
		{
			strHSLACTION_ttabitem = strValue;
		}
		else if(strParam=="filter")
		{
			strHSLACTION_tfilter = strValue;
		}
		else if(strParam=="lfilter")
		{
			strHSLACTION_lfilter = strValue;
		}
		else if(strParam=="ltab")
		{
			strHSLACTION_ltabitem = strValue;
		}
	}

	//-- active bar
	application_navbar.activatebar("helpdesk_view");

	//-- if already loaded
	if(app.oWorkspaceFrameHolder.iamready!=undefined && app.oWorkspaceFrameHolder.iamready)
	{
		_process_hsl_servicedesk_action();
	}
}

function _process_hsl_servicedesk_action()
{
	//-- ok to switch to tab item and filter
	if(strHSLACTION_ttabitem!="")
	{
		//--
		//-- get top tab control and select tabitem by index and set filter if provided
		var arrTabControls = app.oWorkspaceFrameHolder.get_workspace_controls_by_type("tabcontrol-holder");
		if(arrTabControls.length>0)
		{
			var tabControl = arrTabControls[0];
			var tabItemsHolder = app.get_parent_child_by_id(tabControl,"itemholder");
			if(tabItemsHolder!=null)
			{
				strHSLACTION_ttabitem++;strHSLACTION_ttabitem--;
				var tabItem = tabItemsHolder.childNodes[strHSLACTION_ttabitem];
				if(tabItem)
				{
					tabItem.click();
					if(strHSLACTION_tfilter!="")
					{
						var tabItemSpaceHolder = app.get_parent_child_by_id(tabControl,"tabspace");
						var tabSpace = app.get_parent_child_by_id(tabItemSpaceHolder,"tispace_" + tabItem.id);
						if(tabSpace!=null)
						{
							var selectboxFilter = app.get_parent_child_by_id(tabSpace,"dtable_select_filter");
							if(selectboxFilter!=null)
							{
								if(app.select_selectbox_value(selectboxFilter,strHSLACTION_tfilter))
								{
									app.datatable_interactivefilter(selectboxFilter,null,true);
								}
							}
						}
					}
				}
			}
		}
	}

	//--
	//-- get bottom tab control and select tabitem by index and set filter if provided
	if(strHSLACTION_ltabitem!="")
	{
		var arrTabControls = app.oWorkspaceFrameHolder.get_workspace_controls_by_type("tabcontrol-holder");
		if(arrTabControls.length>0)
		{
			var tabControl = arrTabControls[1];
			var tabItemsHolder = app.get_parent_child_by_id(tabControl,"itemholder");
			if(tabItemsHolder!=null)
			{
				strHSLACTION_ltabitem++;strHSLACTION_ltabitem--;
				var tabItem = tabItemsHolder.childNodes[strHSLACTION_ltabitem];
				if(tabItem)
				{
					tabItem.click();
					if(strHSLACTION_lfilter!="")
					{
						var tabItemSpaceHolder = app.get_parent_child_by_id(tabControl,"tabspace");
						var tabSpace = app.get_parent_child_by_id(tabItemSpaceHolder,"tispace_" + tabItem.id);
						if(tabSpace!=null)
						{
							var selectboxFilter = app.get_parent_child_by_id(tabSpace,"dtable_select_filter");
							if(selectboxFilter!=null)
							{
								if(app.select_selectbox_value(selectboxFilter,strHSLACTION_lfilter))
								{
									app.datatable_interactivefilter(selectboxFilter,null,true);
								}
							}
						}
					}
				}
			}
		}
	}

	//-- set to tree pos which will process refresh
	if(strHSLACTION_action=="mycalls")
	{
		var pos = _servicedesk_tree.getNodePositionByID(app._analyst_id,"grp_"+ app._analyst_supportgroup);
		_servicedesk_tree.openTo(pos,true,true,true);
	}
	else if(strHSLACTION_action=="mygroupcalls")
	{
		var pos = _servicedesk_tree.getNodePositionByID("grp_"+app._analyst_supportgroup);
		_servicedesk_tree.openTo(pos,true,true,true);
	}

}


//-- called when an element is dropped ono service desk
function _servicedesk_drop_assignment(aNode, eleDropped)
{
	app._current_draganddrop_ele = null;
	if(eleDropped!=null && eleDropped.tagName=="TR")
	{
		var tableConrolDivHolder = eleDropped.parentNode.parentNode.parentNode.parentNode;
		if(tableConrolDivHolder!=null && tableConrolDivHolder.tagName=="DIV")
		{
			if(tableConrolDivHolder.getAttribute("dbtablename")=="opencall") // || tableConrolDivHolder.getAttribute("dbtablename")=="calltasks")
			{
				//-- ok to assign
				var strOwnerName = "";
				var strGroupName = "";
				var strOwner = ""; 
				var strSuppgroup = "";
				var str3P="";

				var topNode = null;
				var pNode= aNode.tree.getNodeByID(aNode.pid);
				while(pNode!=null)
				{
					if(pNode.pid==-1)
					{
						topNode = pNode;
						break;
					}
					pNode= aNode.tree.getNodeByID(pNode.pid);
					if(pNode!=null) topNode = pNode;
				}


				var str3P="";
				//-- get owner and suppgroup
				if(aNode.nodeonly)
				{
					var strOwnerName = aNode.title;
					var strGroupName = pNode.title;
					var strOwner = aNode.id; 
					var strSuppgroup = aNode._suppgroup;

					//-- if we are using 3p then will need to set context
					if(topNode.id=="_THIRDPARTY")
					{
						var pNode= aNode.tree.getNodeByID(aNode.pid);
						str3P = aNode.name;
						strOwner = pNode.id;
						strSuppgroup = "_THIRDPARTY";
					}
				}
				else
				{
					var strOwner = ""; 
					var strSuppgroup = aNode._suppgroup;
					var strOwnerName = aNode.title;
					var strGroupName = aNode.title;

					//-- if we are using 3p then will need to set context
					if(aNode.id=="_THIRDPARTY")
					{
						strOwner = "";
						strSuppgroup = "_THIRDPARTY";
					}
					else if(aNode.pid=="_THIRDPARTY")
					{
						strOwner = aNode.id;
						strSuppgroup = "_THIRDPARTY";
					}
				}

				if(strSuppgroup!="")
				{
						//-- assign call(s)
						_assigncall(_CurrentSelectedServiceDeskCallrefs,strOwner,strSuppgroup,str3P,window);
						//-- refresh rows
						var strIndexes = app.get_row_datatable_selectedindexes(eleDropped);
						var arrRowIndexes = strIndexes.split(",");
						for (var x=arrRowIndexes.length;x>=0;x--)
						{
							_refresh_servicedesk_row(_CurrentServiceDeskTable.rows[arrRowIndexes[x]]);
						}
				}
			}
		}
	}
}



//--
//-- function that will refresh service desk view based on selected node or folder from service desk tree
var _last_servicedesk_node = null;
var __sd_OwnerName = "";
var __sd_GroupName = "";
var __sd_OwnerID = "";
var __sd_GroupID = "";

function _servicedesk_tree_selection(aNode, strControlID)
{
	if(__SERVICEDESK_CONTEXT_MENU!=null)
	{
		__SERVICEDESK_CONTEXT_MENU.style.display="none";
		__SERVICEDESK_CONTEXT_MENU.innerHTML = "";
		_disable_servicedesk_toolbar(app.getEleDoc(__SERVICEDESK_CONTEXT_MENU));
	}

	var topNode = null;
	var pNode= aNode.tree.getNodeByID(aNode.pid);
	while(pNode!=null)
	{
		if(pNode.pid==-1)
		{
			topNode = pNode;
			break;
		}
		pNode= aNode.tree.getNodeByID(pNode.pid);
		if(pNode!=null) topNode = pNode;
	}

	var str3P="";
	//-- get owner and suppgroup
	if(aNode.nodeonly)
	{
		var strOwnerName = aNode.name;
		var strGroupName = pNode.title;
		var strOwner = aNode.id; 
		var strSuppgroup = aNode._suppgroup;

		//-- if we are using 3p then will need to set context
		if(topNode.id=="_THIRDPARTY")
		{
			var pNode= aNode.tree.getNodeByID(aNode.pid);
			str3P = aNode.name;
			strOwner = pNode.id;
			strSuppgroup = "_THIRDPARTY";
		}

		//-- switch context
		if(!session.SwitchContext(strOwner,strSuppgroup))
		{
			//-- reset rree
			aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
			return;
		}
	}
	else
	{
		var strOwner = ""; 
		var strSuppgroup = aNode._suppgroup;
		var strOwnerName = aNode.title;
		var strGroupName = aNode.title;


		//-- if we are using 3p then will need to set context
		if(aNode.id=="_THIRDPARTY")
		{
			strOwner = "%";
			strSuppgroup = "_THIRDPARTY";
			if(!session.SwitchContext("",strSuppgroup))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;
			}
		}
		else if(aNode.pid=="_THIRDPARTY")
		{
			strOwner = aNode.id;
			strSuppgroup = "_THIRDPARTY";
			if(!session.SwitchContext(strOwner,strSuppgroup))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;

			}
		}
		else if(aNode.id == "swhd")
		{
			strOwner = "%";
			strSuppgroup = "%";

			//-- switch context
			if(!session.SwitchContext("",""))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;
			}
		}
		else
		{
			//-- switch context
			if(!session.SwitchContext("",strSuppgroup))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;
			}
		}
	}

	//-- store doc wide var
	__sd_OwnerName = strOwnerName;
	__sd_GroupName = strGroupName;
	__sd_OwnerID = strOwner;
	__sd_GroupID = strSuppgroup;



	top.debugstart("Load Servicedesk Data:"+aNode.title,"SERVICEDESK");

	app.set_right_title("Service Desk : " + aNode.title)
	_last_servicedesk_node = aNode;

	var strSQLParams = "&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);

	//-- get data tables in service desk view
	var d = app.oWorkspaceFrameHolder.document;
	var strAttName = (app.isIE && !app.isIE10Above)?"className":"class";
	var arrDataTables =	app.get_children_by_att_value(d.body, strAttName, "dhtml_div_data",false);
	for(var x=0; x < arrDataTables.length;x++)
	{
		if(arrDataTables[x].getAttribute("outlookid").toLowerCase() == strControlID.toLowerCase())
		{
			var oDivTableHolder = d.getElementById(arrDataTables[x].getAttribute("parentholderid"));

			//-- store atts for when we change table interactive filters
			arrDataTables[x].parentNode.process_active_filter = _servicedesk_apply_tablefilter; //- -assign function to tables filter apply

			arrDataTables[x].parentNode.setAttribute("thirdparty",str3P);
			arrDataTables[x].parentNode.setAttribute("analystid",strOwner);
			arrDataTables[x].parentNode.setAttribute("groupid",strSuppgroup);
			var iCurrFilter = arrDataTables[x].parentNode.getAttribute("selectedfilter");
			if(iCurrFilter==null)iCurrFilter="";

			//-- refresh this data control
			var strArgs = "tablepos="+oDivTableHolder.getAttribute("tablepos")+"&outlookid="+strControlID+"&datatableid=" + arrDataTables[x].parentNode.id;
			strArgs += strSQLParams + "&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&tablefiltername=&tablefilterindex=" + iCurrFilter; //- -apply initial filter
	
			var tableParentNode = arrDataTables[x].parentNode;

			datatable_clearforloading(tableParentNode);
			_servicedesk_settable_tablabel(oDivTableHolder, "...");
			var strURL = app.get_service_url("call/getservicedeskcalls","");
			app.get_http(strURL,strArgs, false, false,function(strData,drawToTableContainer,ohttp)
			{
				var arrData = strData.split("[swhdrc]");
				var totalRowCount = arrData[0]-0;
				var pageNumber = arrData[1]-0;
				//-- do we need to show paging toolbar
				app.datatable_paging(drawToTableContainer.parentNode, totalRowCount,100,pageNumber);
				_servicedesk_settable_tablabel(drawToTableContainer, totalRowCount);
				app.datatable_draw_data(drawToTableContainer, arrData[2]);


			},tableParentNode);
		}
	}		

	top.debugend("Load Servicedesk Data:"+aNode.title,"SERVICEDESK");

	return false;
}

function _servicedesk_settable_tablabel(eTableHolder, intRowCount)
{
	var d = app.oWorkspaceFrameHolder.document;

	if(intRowCount==undefined)
	{
			var oDataHolder = app.get_parent_child_by_id(eTableHolder,'div_data');
			if(oDataHolder!=null)
			{
				var tblData = app.get_parent_child_by_tag(oDataHolder,"TABLE");
				intRowCount = tblData.rows.length;
			}
	}
	//-- set tab labels - get table parent
	var strTabItemID = "ti_" + eTableHolder.id;
	var eTab = d.getElementById(strTabItemID);
	if(eTab!=null)
	{		
		//-- build global params path to view
		var strViewPath = "views/helpdesk view/" + eTab.getAttribute("gparam");
		var strTabText= app.dd.GetGlobalParamAsString(strViewPath +"/TabName");
		if(strViewPath.indexOf("My Tasks View")>-1)
		{
			var strMyTab = "TabNameMyTasks";
			var strOtherTab = "TabNameTasks";
		}
		else
		{
			var strMyTab = "TabNameMyCalls";
			var strOtherTab = "TabNameCalls";
		}
		
		//-- check if we need to replace any %1 , %2 etc
		if(__sd_OwnerID!="%" && __sd_OwnerID!="")
		{
			if(__sd_OwnerID==session.analystid)
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/" + strMyTab);
			}
			else
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/"+ strOtherTab);
			}
		}
		else if(__sd_GroupID!="%")
		{
			if(__sd_GroupID==session.groupid)
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/TabNameMyGroup");
			}
			else
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/TabNameGroup");

			}
		}
		if(strTabText=="")strTabText =app.dd.GetGlobalParamAsString(strViewPath +"/TabName");


		//-- replace any %
		strTabText = app.string_replace(strTabText,"%1",__sd_OwnerName,true);
		strTabText = app.string_replace(strTabText,"%2",__sd_GroupName,true);
		strTabText = app.string_replace(strTabText,"%3",__sd_OwnerID,true);
		strTabText = app.string_replace(strTabText,"%4",__sd_GroupID,true);
		strTabText = app.string_replace(strTabText,"%5",intRowCount,true);

		app.setElementText(eTab,strTabText)
	}
}

//-- called when service desk data table is filtered using active filter
function _servicedesk_apply_tablefilter(oDivTableHolder, boolForPaging)
{
	//-- store atts for when we change table interactive filters
	if(oDivTableHolder==undefined)oDivTableHolder=this;
	var oDataTable = app.get_parent_child_by_id(oDivTableHolder,"div_data");
	if(oDataTable!=null)
	{
			var str3P =	oDivTableHolder.getAttribute("thirdparty");
			var strOwner = oDivTableHolder.getAttribute("analystid");
			var strSuppgroup = oDivTableHolder.getAttribute("groupid");

			var strOrderCol = oDivTableHolder.getAttribute("orderby");
			var strOrderDir = oDivTableHolder.getAttribute("orderdir");
			if(strOrderCol==null)strOrderCol="";
			if(strOrderDir==null)strOrderDir="";


			var iCurrFilter =oDivTableHolder.getAttribute("selectedfilter");
			if(iCurrFilter==null)iCurrFilter="";


			var intGetPage = (boolForPaging)?oDivTableHolder.getAttribute("page"):1;
			if(intGetPage==null || intGetPage==undefined) intGetPage=1;

			//-- 12.12.12 - nwj - 90128 - removed use of staticfilter clientside
			var strSQLParams = "&orderby="+strOrderCol+"&orderdir="+strOrderDir+"&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);
			var strArgs = "tablepos="+oDivTableHolder.getAttribute("tablepos")+"&_pagenumber="+ intGetPage +"&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&outlookid="+oDataTable.getAttribute('outlookid')+"&datatableid=" + oDivTableHolder.id + "&tablefiltername=&tablefilterindex=" + iCurrFilter;
			strArgs += strSQLParams;
	
			datatable_clearforloading(oDivTableHolder);
			_servicedesk_settable_tablabel(oDivTableHolder, "...");
			var strURL = app.get_service_url("call/getservicedeskcalls","");
			app.get_http(strURL,strArgs, false, false,function(strData,drawToTableContainer,ohttp)
			{
				var arrData = strData.split("[swhdrc]");
				var totalRowCount = arrData[0]-0;
				var pageNumber = arrData[1]-0;
				//-- do we need to show paging toolbar
				app.datatable_paging(drawToTableContainer.parentNode, totalRowCount,100,pageNumber);
				_servicedesk_settable_tablabel(drawToTableContainer, totalRowCount);
				app.datatable_draw_data(drawToTableContainer, arrData[2]);


			},oDivTableHolder);

	}
}


//-- given list of calls return those calls that are watched
function _servicedesk_setup_call_watched_state(strCallrefs,aDoc)
{
	strCallrefs+=""; //-- cast

	_hd_bCanWatch = true;
	_hd_bCanUnwatch = false;

	
	var watchedRowCount = 0;
	var arrWatchedCalls = new Array();
	var oTableHolder = aDoc.getElementById("tispace_ti_Watched_Calls_View");
	if(oTableHolder)
	{
		var oDataHolder = app.get_parent_child_by_id(oTableHolder,'div_data');
		if(oDataHolder)
		{
			var oTable = app.get_parent_child_by_tag(oDataHolder, "TABLE");
			if(oTable)
			{
				watchedRowCount = oTable.rows.length;
				for(var x=0;x<oTable.rows.length;x++)
				{
					var row = $(oTable.rows[x]);
					arrWatchedCalls["c"+row.attr("keyvalue")] = true;
				}
			}
		}
	}	

	
	var arrSelectedCallrefs = strCallrefs.split(",");
	if(watchedRowCount==0)
	{
		_hd_bCanWatch = true;
		_hd_bCanUnwatch = false;
	}
	else
	{
		//-- 91959 watch menu not behaving correctly.
		//-- if any selected are already in watch list set can watch to false but can unwatch to true
		_hd_bCanWatch = true;
		_hd_bCanUnwatch = false;

		for(var x=0;x<arrSelectedCallrefs.length;x++)
		{
			if(arrWatchedCalls["c" + arrSelectedCallrefs[x]])
			{
				_hd_bCanWatch = false;
				_hd_bCanUnwatch = true;
				break;
			}
		}
	}
}


//-- call to refresh issues
function _servicedesk_refresh_issues()
{
	//-- get data tables in service desk view
	try
	{
		var d = app.oWorkspaceFrameHolder.document;		
	}
	catch (e)
	{
		return;
	}

	var strAttName = (app.isIE && !app.isIE10Above)?"className":"class";
	var arrDataTables =	app.get_children_by_att_value(d.body, strAttName, "dhtml_div_data",false);
	for(var x=0; x < arrDataTables.length;x++)
	{
		var oDivTableHolder = d.getElementById(arrDataTables[x].getAttribute("parentholderid"));
		if(oDivTableHolder!=null && oDivTableHolder.getAttribute("dbtablename")=="swissues")
		{
			//-- store current row issue ref
			_servicedesk_apply_tablefilter(oDivTableHolder)
			//-- re-select current row issue ref
		}
	}
}


//-- call to refresh watched calls after watching or unwaching a call
function _servicedesk_refresh_watched_calls()
{
	//-- get data tables in service desk view
	var d = app.oWorkspaceFrameHolder.document;
	var strAttName = (app.isIE && !app.isIE10Above)?"className":"class";
	var arrDataTables =	app.get_children_by_att_value(d.body, strAttName, "dhtml_div_data",false);
	for(var x=0; x < arrDataTables.length;x++)
	{
		var oDivTableHolder = d.getElementById(arrDataTables[x].getAttribute("parentholderid"));
		if(oDivTableHolder!=null && oDivTableHolder.getAttribute("dbtablename")=="watchcalls")
		{
			_servicedesk_apply_tablefilter(oDivTableHolder)
			_disable_servicedesk_toolbar(d);
		}
	}
}

//-- get record xml string for passed in callrefs for table
function _servicedesk_get_updatedcalldata(oDivTableHolder, strCallrefs)
{
	//-- store atts for when we change table interactive filters

	if(oDivTableHolder==undefined)oDivTableHolder=this;

	var oDataTable = app.get_parent_child_by_id(oDivTableHolder,"div_data");
	if(oDataTable!=null)
	{
			var str3P =	oDivTableHolder.getAttribute("thirdparty");
			var strOwner = oDivTableHolder.getAttribute("analystid");
			var strSuppgroup = oDivTableHolder.getAttribute("groupid");

			var strOrderCol = oDivTableHolder.getAttribute("orderby");
			var strOrderDir = oDivTableHolder.getAttribute("orderdir");
			if(strOrderCol==null)strOrderCol="";
			if(strOrderDir==null)strOrderDir="";


			var iCurrFilter =oDivTableHolder.getAttribute("selectedfilter");
			if(iCurrFilter==null)iCurrFilter="";

		
			var strSQLParams = "&orderby="+strOrderCol+"&orderdir="+strOrderDir+"&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);
			var strArgs = "_callrefs="+strCallrefs+"&tablepos="+oDivTableHolder.getAttribute("tablepos")+"&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&outlookid="+oDataTable.getAttribute('outlookid')+"&datatableid=" + oDivTableHolder.id + "&tablefiltername=&tablefilterindex=" + iCurrFilter;
			strArgs += strSQLParams;
		
			var strURL = app.get_service_url("call/getupdatedcallvalues","");
			try
			{
				//-- sometimes hangs here -- not sure why
				var strData = app.get_http(strURL,strArgs, true, false);				
				return strData;
			}
			catch (e)
			{
			}

	}
	return "";
}

//--
//-- called when a row is selected from one of the service desk views
var _ServiceDeskDocumentElement = null;
var _CurrentServiceDeskTableHolder = null;
var _CurrentServiceDeskTable = null;
var _CurrentServiceDeskRowIndex = -1;
var _CurrentServiceDeskRowKey = -1;
var _CurrentServiceDeskRow = null;

var _CurrentSelectedServiceDeskCallrefs = "";
function _servicedesk_select_row(aRow,e)
{
	if(aRow==null)
	{
		aRow = this;
		var tRow = app.getEventSourceElement(aRow);
		if(tRow!=null)
		{
			e=aRow;
			aRow = tRow;
		}
	}

	//-- get event
	if(!e)e = window.event;
	app.stopEvent(e);

	var intKeyValue = aRow.getAttribute('keyvalue');
	var intKeyCol = aRow.getAttribute('keycolumn');
	var intStatus = aRow.getAttribute('callstatus');

	//--
	//-- highlight row - keep last selected if CTRL key is selected
	var bCTRL = (e!=null)?e.ctrlKey:false;
	if(!bCTRL)bCTRL = (aRow.getAttribute('shiftKey')=="true")?true:false;

	app.datatable_hilight(aRow,bCTRL); //e.ctrlKey - for now only allow single selec
	_CurrentServiceDeskRowIndex = aRow.rowIndex;
	_CurrentServiceDeskRowKey =intKeyValue;
	_CurrentServiceDeskRow = aRow;
	top.__CURRENT_SELECTED_TABLE_ROW = aRow;

	//-- manage servicedesk toolbar options based on selected call (s) status
	_manage_servicedesk_toolbar(aRow);
}

//
//-- called when a row is dbl clicked from one of the service desk views
function _servicedesk_open_row(aRow,e)
{
	if(aRow==null)aRow = this;

	var tRow = app.getEventSourceElement(aRow);
	if(tRow!=null)
	{
		e=aRow;
		aRow = tRow;
	}

	//-- get event object
	if(!e)e = window.event;

	app.stopEvent(e);

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');

	//-- process calltask
	if(strKeyCol=="taskid")
	{
		var intCallref = aRow.getAttribute('callref');
		var intStatus = aRow.getAttribute('taskstatus');
		var strParams = "callref=" + intCallref;

		//-- determine form to open
		var strForm =(intStatus==16)?"_sys_calltask_completed":"_sys_calltask";

		app.OpenWebClientForm(strForm,intKeyValue,strParams,true,"workflow",window,undefined);
	}
	else if(strKeyCol=="opencall.callref")
	{
		//-- process opencall
		global.OpenCallDetailsView(intKeyValue)
	}
	else if(strKeyCol=="issueref")
	{
		//-- process opencall
		//_issueform(intKeyValue,"", true,window);
		servicedesk_toolbar_action("issueupdate");
	}
}

//- -task vars
var _SelectedTaskCallref = 0;
var _SelectedTaskStatus = 0;
var _SelectedTaskID = 0;
var _ShowCompletedTasks = 0;
var _ShowInactiveTasks = 0;

//-- handle application menu bar actions 
function servicedesk_toolbar_action(strToolBarItemID)
{
	if(_CurrentServiceDeskTableHolder==null) return;
	var aDoc = app.getEleDoc(_CurrentServiceDeskTableHolder)

	//-- nwj - 30.03.2011 - allow app dev to trap toolbar event and override default functionality
	//--					this allows them to cancel things like change class and condition
	if(app["_wc_helpdesk_contextmenu_action"])
	{
		var res = app["_wc_helpdesk_contextmenu_action"](strToolBarItemID,_CurrentSelectedServiceDeskCallrefs,_SelectedTaskCallref, _CurrentServiceDeskTableHolder.id);
		if(res==false)return;
	}

	//--
	//-- get list of selected calls so we can pass into form
	var boolTask = false;
	
	var runHandler = true;
	var afterActionHandler = function()
	{
		if(_CurrentServiceDeskTableHolder==null) return;

		if(_bWatchCall)
		{
			_servicedesk_refresh_watched_calls();
		}
		else
		{
			setTimeout("_after_callview_action("+boolTask+","+_bIssue+")",500);
		}
	}
	
	switch(strToolBarItemID)
	{
		case "wf_update":
			boolTask = true;
			var strParams = "callref=" + _SelectedTaskCallref;
			var strForm = (_SelectedTaskStatus==16)?"_sys_calltask_completed":"_sys_calltask";
			app.OpenWebClientForm(strForm,_SelectedTaskID,strParams,true,"workflow",window,function()
			{
				afterActionHandler();
			});
			runHandler=false;
			break;
		case "wf_complete":
			boolTask = true;
			app._completetaskform(_SelectedTaskID, _SelectedTaskCallref,window);
			break;
		case "wf_showcomplete":
			boolTask = true;
			//-- set filter flag for task list to indicate to show completed tasks
			_ShowCompletedTasks =(_ShowCompletedTasks==0)?1:0;
			var strLabel = (_ShowCompletedTasks==1)?"Hide Completed":"Show Completed";
			app.toolbar_item_setlabel(_CurrentOutlookID,"wf_showcomplete",strLabel,aDoc);
			break;
		case "wf_showinactive":
			boolTask = true;
			//-- set filter flag for task list to indicate to show inactive tasks
			_ShowInactiveTasks = (_ShowInactiveTasks==0)?1:0;
			var strLabel = (_ShowInactiveTasks==1)?"Hide Inactive":"Show Inactive";
			app.toolbar_item_setlabel(_CurrentOutlookID,"wf_showinactive",strLabel,aDoc);
			break;
		case "wf_viewcall":		
			boolTask = true;
			var intKeyValue = _CurrentServiceDeskRow.getAttribute('callref');
			if(intKeyValue==null)
			{
				boolTask = false;			
				var intKeyValue = _CurrentServiceDeskRow.getAttribute('keyvalue');
			}
			global.OpenCallDetailsView(intKeyValue);
			runHandler=false;
			break;
		case "callupdate":
			runHandler = false;
			_updatecallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callaccept":
			runHandler = false;
			_acceptcallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callassign":
			runHandler = false;
			_assigncall(_CurrentSelectedServiceDeskCallrefs,"","","",window,afterActionHandler);
			break;
		case "callcancel":
			runHandler = false;
			_cancelcallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callhold":
			runHandler = false;
			_holdcallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callresolve":
		case "callclose":
			runHandler = false;
			_resolveclosecallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;

		case "calloffhold":
			if(_offholdcall(_CurrentSelectedServiceDeskCallrefs))
			{
			}
			break;

		case "callclass":
		
			if(!session.HaveRight(ANALYST_RIGHT_B_GROUP,ANALYST_RIGHT_B_CANCHANGECALLCLASS,true)) return;
			runHandler = false;
			//-- change call class
			var strCallClass = _select_callclass(window,function(strCallClass)
			{
				if(strCallClass!="")
				{
					var hd = new HelpdeskSession();
					if(hd.ChangeCallClass(_CurrentSelectedServiceDeskCallrefs,strCallClass))
					{
						//-- need to refresh view
						_servicedesk_tree_selection(_last_servicedesk_node, _CurrentServiceDeskTableHolder.getAttribute("outlookid"));
						//-- disable toolbar
						_disable_servicedesk_toolbar(_CurrentServiceDeskTableHolder.document);
						return;
					}
				}
			});
			break;

		case "callcondition":
			if(!session.HaveRight(ANALYST_RIGHT_B_GROUP,ANALYST_RIGHT_B_CANCHANGECALLCONDITION,true)) return;

			//-- change call condition
			runHandler = false;
			var strCallCondition = _select_callcondition(window,function(strCallCondition)
			{
				if(strCallCondition!="")
				{	
					var hd = new HelpdeskSession();
					hd.ChangeCallCondition(_CurrentSelectedServiceDeskCallrefs,strCallCondition);
				}
			});
			break;

		case "callprofile":

			if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCHANGECALLPROFILECODE,true)) return;

			runHandler = false;
			//--
			//-- if we have one call class then load cdf form and get the profile filter
			var strFilter = app._get_callclass_form_profilefilter(_CurrentSelectedServiceDeskCallrefs);

			//-- change call probcode
			
			app._cdf_profilechanger(strFilter,"",function(oForm)
			{
				if(oForm.code!="")
				{
					var hd = new HelpdeskSession();
					var res = hd.SetProfileCode(_CurrentSelectedServiceDeskCallrefs,oForm.code);
					if(res==false)
					{
						alert("Failed to update the profile code for this request. Please contact your Administrator.");
					}
					else
					{
						afterActionHandler()
					}
				}

			},null,window);
			break;


		case "callwatch":
			var oHD = new HelpdeskSession();
			if(oHD.WatchCall(_CurrentSelectedServiceDeskCallrefs, session.analystId))
			{
				if(!_bWatchCall)_servicedesk_refresh_watched_calls();
			}

			break;

		case "callunwatch":
			var oHD = new HelpdeskSession();
			if(oHD.UnwatchCall(_CurrentSelectedServiceDeskCallrefs, session.analystId))
			{
				if(!_bWatchCall)_servicedesk_refresh_watched_calls();
			}
			break;
		case "watchoptions":
			//-- open watch call options form
			var strParams = "_callrefs=" + _CurrentSelectedServiceDeskCallrefs;
			app._open_system_form("_wc_watchcall_options","watchoptions", "", strParams, true, null,null);
			return;
			break;
		case "callreact":
			if(_callreactivate(_CurrentSelectedServiceDeskCallrefs))
			{
			}
			break;
		
		case "issueupdate":
			_issueform(_SelectedIssueID,"",false,window);
			break;
		case "issueclose":
			_servicedesk_close_issue(_CurrentServiceDeskRow)
			break;
		case "lognew":
			return;
			break;

		default:
			alert("Service Desk Toolbar Action Not Recognised " + strToolBarItemID)
			break;
	}

	if(runHandler)afterActionHandler();
}

function _after_callview_action(boolTask,_bIssue)
{
	_CurrentServiceDeskTable = _CurrentServiceDeskTableHolder.childNodes[2].childNodes[0];

	if(!boolTask && !_bIssue)
	{
		var strIndexes = app.get_row_datatable_selectedindexes(_CurrentServiceDeskTable.rows[_CurrentServiceDeskRowIndex]);
		var arrRowIndexes = strIndexes.split(",");
		for (var x=arrRowIndexes.length-1;x>=0;x--)
		{
			_refresh_servicedesk_row(_CurrentServiceDeskTable.rows[arrRowIndexes[x]]);
		}
	}
	else
	{
		//-- refresh view
		if(_CurrentServiceDeskTable==undefined)return;

		var tableHolder = _CurrentServiceDeskTable.parentNode.parentNode;
		_servicedesk_apply_tablefilter(tableHolder)

		_CurrentServiceDeskTable = tableHolder.childNodes[2].childNodes[0];

		//-- see if row is still there if so select it
		var aRow = _CurrentServiceDeskTable.rows[_CurrentServiceDeskRowIndex];
		if(aRow!=undefined)
		{
			if(_CurrentServiceDeskRowKey == aRow.getAttribute('keyvalue'))
			{
				_servicedesk_select_row(aRow);
			}
		}
		else
		{
			_CurrentServiceDeskRow = null;
			_CurrentServiceDeskRowIndex = -1;
			//-- manage toolbar - i.e. disable it or something
			_manage_servicedesk_toolbar(null,_CurrentServiceDeskTable);
		}
	}

}

function _servicedesk_close_issue(aRow)
{
	//-- close issue
	var strIssueRef = aRow.getAttribute('keyvalue');

	//-- query the database o see that issue is still valid
	var conCache = new SqlQuery();	
	var strParams = "ir=" + strIssueRef; 
	conCache.WebclientStoredQuery("system/getActiveIssueRecord",strParams);
	
	//Check if "swissues" is still in the cache
	if(!conCache.Fetch())
	{
		//-- This call must be closed - remove row
		aRow.parentNode.deleteRow(aRow.rowIndex); 
		if(_CurrentServiceDeskTable!=null)
		{
			app.fireEvent(_CurrentServiceDeskTable,"mousedown",document);
		}
		return false;
	}

	//-- get any attached calls 
	var strCallrefs = "";
	var boolCalls = false;
	var strParams = "ir=" + strIssueRef; 
	var conCache = new SqlQuery();	
	conCache.WebclientStoredQuery("system/getIssuesCalls",strParams);

	while(conCache.Fetch())	
	{
		var intCallStatus = conCache.GetValueAsNumber('status');
		var intCallRef = conCache.GetValueAsNumber('callref');

		if((intCallStatus == 6) || (intCallStatus > 15 )) continue;
		
		boolCalls = true;
		if(strCallrefs!="")strCallrefs+=",";
		strCallrefs += intCallRef;

		var swHDSession = new HelpdeskSession();
		swHDSession.AcceptCall(intCallRef);
		swHDSession.Close();		
	}		

	if(boolCalls)
	{
		//-- Set the text to be used in the resolve/close form
		var strCloseUpdateText = "Call closed as part of issue " + strIssueRef;
			
		//-- Open the resolve/close form with the text set above (strCloseUpdateText) and the Issue Ref to be closed	
		app.OpenCallResolveCloseForm(strCallrefs, strCloseUpdateText,null, strCloseUpdateText, "", strIssueRef);

	}
	else //-- No calls associated to this Issue so we simply set Issue Status to "Closed" and save change
	{	
		var myHDSession = new HelpdeskSession();
		if (myHDSession.Connect())
		{
			myHDSession.BeginUpdateIssue(strIssueRef);
			myHDSession.SendNumber("status", 16);
			myHDSession.Commit();
		}
	}		

}



//--
//-- get xml recordset of calls updated or created for each service view table - uses current filter settings etc for each table
function _get_servicedesk_newcall_data(strCallrefs)
{
	//-- get data tables in service desk view
	var d = app.oWorkspaceFrameHolder.document;
	var arrDataTableHolders =	app.get_children_by_att_value(d.body, "controltype", "datatable-holder",false);
	for(var x=0; x < arrDataTableHolders.length;x++)
	{
		//-- get params
		var strControlID = arrDataTableHolders[x].getAttribute("outlookid");
		var oDivTableHolder = arrDataTableHolders[x];

		var str3P =	oDivTableHolder.getAttribute("thirdparty");
		var strOwner = oDivTableHolder.getAttribute("analystid");
		var strSuppgroup = oDivTableHolder.getAttribute("groupid");

		var strOrderCol = oDivTableHolder.getAttribute("orderby");
		var strOrderDir = oDivTableHolder.getAttribute("orderdir");
		if(strOrderCol==null)strOrderCol="";
		if(strOrderDir==null)strOrderDir="";

		var iCurrFilter =oDivTableHolder.getAttribute("selectedfilter");
		if(iCurrFilter==null)iCurrFilter="";

		//-- 12.12.12 - nwj - 90128 - removed use of staticfilter clientside
		var strSQLParams = "&_callrefs=" + strCallrefs + "&orderby="+strOrderCol+"&orderdir="+strOrderDir+"&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);
		var strArgs = "tablepos="+oDivTableHolder.getAttribute("tablepos")+"&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&outlookid="+strControlID+"&datatableid=" + oDivTableHolder.id + "&tablefiltername=&tablefilterindex=" + iCurrFilter;
		strArgs += strSQLParams;

		//-- go get data and call function to process once returned
		var strURL = app.get_service_url("call/getupdatedcallslist/newcalls.php","");
		app.get_http(strURL,strArgs, false, false,_create_new_servicedesk_calls);
	}
}


function _servicedesk_get_distinct_columns()
{
	var arrCols = new Array();
	var strCols = "";
	var d = app.oWorkspaceFrameHolder.document;
	var arrDataTableHolders =	app.get_children_by_att_value(d.body, "dbtablename", "opencall",false);
	for(var x=0; x < arrDataTableHolders.length;x++)
	{
		var divHeaderTableRow =arrDataTableHolders[x].childNodes[1].childNodes[0].rows[0];
		for(var y=0;y<divHeaderTableRow.cells.length;y++)
		{
			var strColName = divHeaderTableRow.cells[y].getAttribute("dbname");

			if(arrCols[strColName] || strColName==null)
			{
			}
			else
			{
				arrCols[strColName] = true;
				if(strCols != "")strCols += ","
				strCols += strColName;
			}
		}
	}

	if(strCols == "") strCols = "*";
	return strCols;
}

function _refresh_servicedesk_againstdata(strData)
{
	if(_servicedesk_tree==null) return;

	//-- make RS out of xml
	app.debugstart("_refresh_servicedesk_againstdata","POLLING")

	var oDataXML = app.create_xml_dom(strData)
	if(oDataXML.childNodes[0].childNodes.length==0)
	{
		app.debugend("_refresh_servicedesk_againstdata","POLLING")
		return; //-- no updates
	}



	//-- get table id
	var strCallrefs= "";
	var oRS = new XmlSqlQuery();
	oRS._recordset = oDataXML;
	while(oRS.Fetch())
	{
		//-- if row should not be in the helpdesk due to status remove
		var intCallref = oRS.GetValueAsNumber('callref');
		var intStatus = oRS.GetValueAsNumber('status');
		var bRemoveRow = (intStatus>14)?true:false;
		if(bRemoveRow)
		{
			_service_desk_remove_row_by_callref(intCallref);
		}
		else
		{
			//-- update row by callref
			var intC = _service_desk_update_row_by_callref(intCallref, oRS);
			if(intC>0)
			{
				if(strCallrefs!="")strCallrefs += ",";
				strCallrefs += intC;
			}
		}
	}

	oRS = null;
	oDataXML = null;

	if(_CurrentServiceDeskRow!=null)
	{
		_manage_servicedesk_toolbar(_CurrentServiceDeskRow);
	}

	
	//-- now go get new calls
	if(strCallrefs!="")
	{
		_get_servicedesk_newcall_data(strCallrefs);
	}

	app.debugend("_refresh_servicedesk_againstdata","POLLING")
}

function _service_desk_remove_row_by_callref(intCallref)
{
	var arrRows = _service_desk_get_rows_by_callref(intCallref);
	for(var x=0;x<arrRows.length;x++)
	{
		if(arrRows[x]==_CurrentServiceDeskRow)
		{
			_disable_servicedesk_toolbar(app.getEleDoc(arrRows[x]))
			_CurrentServiceDeskRow=null;
		}

		var oDivData = arrRows[x].parentNode.parentNode.parentNode.parentNode;
		arrRows[x].parentNode.deleteRow(arrRows[x].rowIndex);

		//-- update call count
		_servicedesk_settable_tablabel(oDivData);

	}
}

function _service_desk_update_row_by_callref(intCallref, oRecordSet)
{
	//-- get owner and suppgroup - check if needs to be removed from current view
	var strOwner = oRecordSet.GetValueAsString("owner");
	var strGroup = oRecordSet.GetValueAsString("suppgroup");
	var intStatus = oRecordSet.GetValueAsNumber("status");
	var intLastActDatex = oRecordSet.GetValueAsNumber("swlastactdatex");
	if(intLastActDatex > _LAST_HELPDESKVIEW_LASTACTDATEX)_LAST_HELPDESKVIEW_LASTACTDATEX=intLastActDatex; //-- for next update list

	//-- if not same group and status not escalated all remove
	if(strGroup!=session.currentGroupId && intStatus!=CS_ESCA)
	{
		_service_desk_remove_row_by_callref(intCallref);
	}
	else if (strOwner!="" && strOwner!=session.currentAnalystId && (intStatus!=CS_ESCG && intStatus!=CS_OFFHOLD))
	{
		//-- same group but not the owner and call is not escalated to group and has not jsut come off hold
		_service_desk_remove_row_by_callref(intCallref);
	}
	else
	{
		//-- update row data - or create new 
		var arrRows = _service_desk_get_rows_by_callref(intCallref);
		if(arrRows.length==0)
		{
			//-- need to create a new row - get new call data
			return intCallref;
		}
		else
		{
			for(var z=0;z<arrRows.length;z++)
			{
				var aRow = arrRows[z];
				//-- check last actdatex
				if(aRow.getAttribute("lastactdatex")>=intLastActDatex) continue;
				aRow.setAttribute("lastactdatex",intLastActDatex);
				aRow.setAttribute("callstatus",intStatus);

				var oDivHolder = aRow.parentNode.parentNode.parentNode.parentNode;
				var oHeaderHolder = app.get_parent_child_by_id(oDivHolder,'table_columns');
				var tblHeader = app.get_parent_child_by_tag(oHeaderHolder,"TABLE");
				var rowHeader = app.get_parent_child_by_tag(tblHeader,"TR");
				for(var x=0; x < rowHeader.childNodes.length-1; x++)
				{
					var cellName = rowHeader.childNodes[x].getAttribute("dbname");
					//-- Get current values
					var targetCell = aRow.childNodes[x];
					currDisplayValue = targetCell.childNodes[0].innerHTML;
					var newDisplayValue = oRecordSet.GetValueAsString(cellName,true);
					if(newDisplayValue!=currDisplayValue)
					{
						if(cellName.toLowerCase()=="escalation")
						{
							targetCell.childNodes[0].innerHTML = newDisplayValue;
						}
						else if(cellName.toLowerCase()=="callref")
						{
							//-- do not change callref
						}
						else
						{
							app.setElementText(targetCell.childNodes[0],newDisplayValue);
						}
					}
				} //-- for x

				//-- set row style based on status
				switch(intStatus)
				{
					case 5:
					case 9:
					case 10:
					case 11:
						//-- escalated or off hold
						aRow.style.color="#800000";
						aRow.style.fontStyle="normal";
						break;
					case 4:
						//-- onhold
						aRow.style.color="green";
						aRow.style.fontStyle="italic";
						break;
					case 2:
					case 3:
						//-- unaccepted or unassigned
						aRow.style.color="navy";
						aRow.style.fontStyle="normal";
						break;
					default:
						aRow.style.color="#000000";
						aRow.style.fontStyle="normal";
				}



			}//-- for z
		}//-- no rows
	}
	return 0;
}




//-- function when given new call data will create rows
function _create_new_servicedesk_calls(strData)
{
	if(_servicedesk_tree==null) return;

	//-- make RS out of xml
	var oDataXML = app.create_xml_dom(strData)

	//var arrRows = oDataXML.getElementsByTagName("row");
	//if(arrRows.length==0) return; //-- no updates
	if(oDataXML.childNodes[0].childNodes.length==0) return; //-- no updates

	//-- get table id
	var strTableHolderID = oDataXML.childNodes[0].getAttribute("tableid");
	var oRS = new XmlSqlQuery();
	oRS._recordset = oDataXML;
	while(oRS.Fetch())
	{
		//-- get tableholder for data 
		var oDivHolder = _ServiceDeskDocumentElement.getElementById(strTableHolderID);
		if(oDivHolder!=null)
		{
			var recType = oDivHolder.getAttribute("dbtablename");
			if(recType=="swissues")
			{
				continue;
			}

			var oHeaderHolder = app.get_parent_child_by_id(oDivHolder,'table_columns');
			var oDataHolder = app.get_parent_child_by_id(oDivHolder,'div_data');
			if(oHeaderHolder!=null && oDataHolder!=null)
			{

				var tblHeader = app.get_parent_child_by_tag(oHeaderHolder,"TABLE");
				var tblData = app.get_parent_child_by_tag(oDataHolder,"TABLE");
				var rowHeader = app.get_parent_child_by_tag(tblHeader,"TR");

				var intCallref = oRS.GetValueAsString('tpk');
				var intLastActDatex = oRS.GetValueAsNumber("swlastactdatex");

				//-- create new row and add ats and cells
				var aRow = tblData.insertRow(tblData.rows.length);

				//-- generate row id
				var strKeyID = oRS.GetValueAsString('tpk');
				var strStatusID = oRS.GetValueAsString('tpkstatus');
				var strTaskID = oRS.GetValueAsString('taskid');
				var strTextStyle="";
				if(strTaskID!="")
				{
					aRow.setAttribute("keycolumn","taskid");
					var tStatus = oRS.GetValueAsString('taskstatus');
					if(tStatus==16 || tStatus==1) strTextStyle= "text-strike-" + tStatus;
					var strName = "sdtrow_" + strTaskID;
				}
				else
				{
					aRow.setAttribute("keycolumn","opencall.callref");
					var strName = "sdcrow_" + oRS.GetValueAsString("callref");
					
					//-- set row style based on status
					var intStatus = strStatusID++;
					intStatus--;
					switch(intStatus)
					{
						case 5:
						case 9:
						case 10:
						case 11:
							//-- escalated or off hold
							aRow.style.color="#800000";
							aRow.style.fontStyle="normal";
							break;
						case 4:
							//-- onhold
							aRow.style.color="green";
							aRow.style.fontStyle="italic";
							break;
						case 2:
						case 3:
							//-- unaccepted or unassigned
							aRow.style.color="navy";
							aRow.style.fontStyle="normal";
							break;
						default:
							aRow.style.color="#000000";
							aRow.style.fontStyle="normal";
					}

				}
				aRow.setAttribute("id",strName);
				aRow.setAttribute("name",strName);
				aRow.setAttribute("keyvalue",strKeyID);
				aRow.setAttribute("callstatus",strStatusID);
				aRow.setAttribute("lastactdatex",intLastActDatex);

				//-- create cells
				for(var y=0;y<rowHeader.childNodes.length-1; y++) 
				{
					var cellName = rowHeader.childNodes[y].getAttribute("dbname");

					//-- new cell
					var targetCell = aRow.insertCell(y);
					insertBeforeEnd(targetCell,"<div class='"+strTextStyle+"'></div>");
					

					var newDisplayValue = oRS.GetValueAsString(cellName,true);
					if(newDisplayValue=="undefined")newDisplayValue=newValue;

					if(cellName.toLowerCase()=="escalation" || cellName.toLowerCase()=="h_condition")
					{
						targetCell.childNodes[0].innerHTML = newDisplayValue;
					}
					else if(cellName.toLowerCase()=="callref" || cellName.toLowerCase()=="h_formattedcallref")
					{
						//-- do not change callref
						targetCell.childNodes[0].innerHTML = "<a href='#' onclick='app._open_call_detail("+strKeyID+")'>" + newDisplayValue + "</a>";
					}
					else if(cellName.toLowerCase()=="taskid")
					{
						targetCell.childNodes[0].innerHTML = "<a href='#' onclick='app._open_hdtask_detail("+strKeyID +","+ oRS.GetValueAsString('callref') +","+ tStatus+")'>" + newDisplayValue + "</a>";
					}
					else
					{
						app.setElementText(targetCell.childNodes[0],newDisplayValue);
					}
				}

				//-- add events

				app.addEvent(aRow,"click",function(){_servicedesk_select_row(aRow,this);} );
				app.addEvent(aRow,"dblclick",function(){_servicedesk_open_row(aRow,this);});

			}//-- oHeaderHolder!null

			//-- update call count
			_servicedesk_settable_tablabel(oDivHolder);

		}//-- divholder != null
	}//-- while rs
}

function _service_desk_get_rows_by_callref(intCallref)
{
	var aRows = new Array();
	if(_ServiceDeskDocumentElement!=null)
	{
		aRows = _ServiceDeskDocumentElement.getElementsByName("sdcrow_" + intCallref);
	}
	return aRows;
}


//-- get updated row data from systemdb - apply to row cells and then re-select row - this means we do not have to refresh whole table
function _refresh_servicedesk_row(aRow)
{
	if(aRow!=undefined)
	{
		var bRemoveRow = false;
		var oDivHolder = aRow.parentNode.parentNode.parentNode.parentNode;
		var oDivData = aRow.parentNode.parentNode.parentNode.parentNode;

		var strXML = _servicedesk_get_updatedcalldata(oDivHolder,aRow.getAttribute('keyvalue'));
		var oXML = app.create_xml_dom(strXML);
		strXML = null;


		//-- make RS out of xml
		var oRS = new XmlSqlQuery();
		oRS._recordset = oXML;
		if(oRS.Fetch())
		{
			//-- if row should not be in the helpdesk due to status remove
			var intStatus = oRS.GetValueAsNumber('status');
			aRow.setAttribute('callstatus',intStatus);
			if(intStatus<15)
			{

				//-- if not in root and not currently inside watch call list
				if(session.currentGroupId!="")
				{
					var strG = oRS.GetValueAsString('suppgroup');
					var strO = oRS.GetValueAsString('owner');

					//-- call is no longer in the same group
					if(strG!=session.currentGroupId )
					{
						//-- if not escalated to all remove
						if(intStatus!=_ESCA)
						{
							bRemoveRow = true;
						}
					}
					else
					{
						//-- in same group but not assigned to current analyst
						if(strO!="" && strO != session.currentAnalystId)
						{
							//-- if not escalated to all, group or off hold then remove as analyst show not see it.
							if(intStatus!=_ESCA && intStatus!=_ESCG && intStatus!=_OFFHOLD && intStatus!=_UNASSIGNED)
							{
								bRemoveRow = true;
							}
						}
					}
				}
			}
			else
			{
				bRemoveRow = true;
			}

		}
		else
		{
			//-- row should no be in table anymore as most likely closed
			bRemoveRow = true;
		}

		//-- remove the row from the table
		if(bRemoveRow)
		{
			//-- disable buttons on toolbar
			var aDoc = app.getEleDoc(aRow);
			app.toolbar_item_dore(_CurrentOutlookID, "callupdate" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callassign" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callaccept" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callhold" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "calloffhold" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callresolve" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callcancel" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callreact" , false, aDoc);

			if(aRow.parentNode.deleteRow)
			{
				aRow.parentNode.deleteRow(aRow.rowIndex);
				//-- update call count
				_servicedesk_settable_tablabel(oDivData);

			}
			_CurrentServiceDeskRowKey=0;
			_CurrentServiceDeskRowIndex=0;
		}
		else
		{
			var oHeaderHolder = app.get_parent_child_by_id(oDivHolder,'table_columns');
			var tblHeader = get_parent_child_by_tag(oHeaderHolder,"TABLE");
			var rowHeader = get_parent_child_by_tag(tblHeader,"TR");
			for(var x=0; x < rowHeader.childNodes.length-1; x++)
			{
				var cellName = rowHeader.childNodes[x].getAttribute("dbname");
				//-- Get current values
				var targetCell = aRow.childNodes[x];
				var currValue = targetCell.childNodes[0].innerHTML;
				var newDisplayValue = oRS.GetValueAsString(cellName,true);
				if(newDisplayValue!=currValue)
				{
					if(cellName.toLowerCase()=="escalation" || cellName.toLowerCase()=="h_condition")
					{
						targetCell.childNodes[0].innerHTML = newDisplayValue;
					}
					else if(cellName.toLowerCase()=="callref")
					{
						//-- callref will never change
					}
					else
					{
						app.setElementText(targetCell.childNodes[0],newDisplayValue);
					}
				}
			}

			//-- redo toolbar
			_manage_servicedesk_toolbar(aRow);
		}
		oRS = null;
		oXML = null;
	}

}


//-- user has selected a row in a table - make that table active
function _select_sevicedesk_table(oDataDivHolder)
{
	var eDataTable = oDataDivHolder.childNodes[0];
	if(eDataTable==undefined)return false;
	if(eDataTable.tagName!="TABLE") return false;

	if(_CurrentServiceDeskTable!=null && eDataTable!=_CurrentServiceDeskTable)
	{	
		//datatable_hilight_blurred_rows(_CurrentServiceDeskTable);
		//datatable_hilight_selected_rows(eDataTable);
	}

	//_CurrentServiceDeskTable = eDataTable; //-- store globally
	_CurrentSelectedServiceDeskCallrefs = "";
	_CurrentServiceDeskTableHolder = eDataTable.parentNode.parentNode;

	var strCurrIndexes = eDataTable.getAttribute("curr_row");
	if(strCurrIndexes==null)strCurrIndexes="";

	var aRow=null;
	if(eDataTable.rows.length>0)
	{
		var arrIndexes = strCurrIndexes.split(",");
		aRow = eDataTable.rows[arrIndexes[0]];
		if(aRow==undefined)	
		{
			aRow = eDataTable.rows[0];
			if(aRow!=undefined)
			{
				eDataTable.setAttribute("curr_row","0");
			}
		}
	}
	top.__CURRENT_SELECTED_TABLE_ROW = aRow;
	_manage_servicedesk_toolbar(aRow,eDataTable);
}

//--
//-- enable disable toolbar based on selected calls
var _hd_bCanAccept = false;
var _hd_bCanAssign = false;
var _hd_bCanUpdate = false;
var _hd_bCanHold = false;
var _hd_bCanTakeOffHold = false;
var _hd_bCanResolve = false;
var _hd_bCanClose = false;
var _hd_bCanCancel = false;
var _hd_bCanReactivate = false;
var _hd_bCanChangeClass = true;
var _hd_bCanChangeCondition = true;
var _hd_bCanWatch = false;
var _hd_bCanUnwatch = false;
var _bTasks = false;
var _bIssue = false;
var _bWatchCall = false;
var _SelectedIssueID = "";
var _bCompletedTask=false;
var _bInactiveTask=false;

function _disable_servicedesk_toolbar(aDoc)
{

	_bTasks = false;
	_bIssue = false;
	_bWatchCall = false;

	_hd_bCanAccept = false;
	_hd_bCanAssign = false;
	_hd_bCanUpdate = false;
	_hd_bCanHold = false;
	_hd_bCanTakeOffHold = false;
	_hd_bCanResolve = false;
	_hd_bCanClose = false;
	_hd_bCanCancel = false;
	_hd_bCanReactivate = false;
	_hd_bCanWatch = false;
	_hd_bCanUnwatch = false;
	_hd_bCanChangeClass = false;
	_hd_bCanChangeCondition = false;


	//-- enable buttons on toolbar
	app.toolbar_item_dore(_CurrentOutlookID, "callupdate" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callassign" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callaccept" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callhold" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "calloffhold" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callresolve" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcancel" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callreact" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callclass" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcondition" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callprofile" , false, aDoc);

	//-- tasks buttons
	app.toolbar_item_dore(_CurrentOutlookID, "wf_complete" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_update" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_viewcall" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showcomplete" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showinactive" , false, aDoc);
	//-- issue buttons
	app.toolbar_item_dore(_CurrentOutlookID, "issueupdate" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "issueclose" , false, aDoc);


	//-- disable buttons on context 
	if(__SERVICEDESK_CONTEXT_MENU!=null)
	{
		__SERVICEDESK_CONTEXT_MENU.style.display="none";
	}
}

function _manage_servicedesk_toolbar(aRow,rowDataTable)
{

	_bTasks = false;
	_bIssue = false;
	_bWatchCall = false;

	_hd_bCanAccept = false;
	_hd_bCanAssign = false;
	_hd_bCanUpdate = false;
	_hd_bCanHold = false;
	_hd_bCanTakeOffHold = false;
	_hd_bCanResolve = false;
	_hd_bCanClose = false;
	_hd_bCanCancel = false;
	_hd_bCanReactivate = false;
	_hd_bCanWatch = false;
	_hd_bCanUnwatch = false;
	_hd_bCanChangeClass = false;
	_hd_bCanChangeCondition = false;
	

	var aDoc = (rowDataTable==undefined)?app.getEleDoc(aRow):app.getEleDoc(rowDataTable);
	//--
	//-- get all selected rows for the call row table - we only want to enable options based on majority i.e. mass call update
	var eDataTable = (rowDataTable==undefined)?app.get_row_datatable(aRow):rowDataTable;
	_CurrentServiceDeskTableHolder = eDataTable.parentNode.parentNode;

	if(_CurrentServiceDeskTable!=null && eDataTable!=_CurrentServiceDeskTable)
	{
		datatable_hilight_blurred_rows(_CurrentServiceDeskTable);
	}
	
	if(eDataTable!=_CurrentServiceDeskTable)
	{
		datatable_hilight_selected_rows(eDataTable);
	}

	_CurrentServiceDeskTable = eDataTable; //-- store globally
	_CurrentSelectedServiceDeskCallrefs = "";

	var recType = _CurrentServiceDeskTable.parentNode.parentNode.getAttribute("dbtablename");
	if(recType=="swissues")
	{
		_hd_bCanChangeClass = false;
		_hd_bCanChangeCondition = false;

		if(aRow!=null)
		{
			_SelectedIssueID = aRow.getAttribute('keyvalue');
		}
		else
		{
			_SelectedIssueID = "";
		}
		_bIssue=true;

	}
	else if(recType=="calltasks")
	{
		_hd_bCanChangeClass = false;
		_hd_bCanChangeCondition = false;
		if(aRow!=null)
		{
			_SelectedTaskID = aRow.getAttribute('keyvalue');
			_SelectedTaskStatus= aRow.getAttribute('taskstatus');
			_SelectedTaskCallref = aRow.getAttribute('callref');
			//-- maybe show different options?
			_bCompletedTask = (_SelectedTaskStatus=="16");
			_bInactiveTask= (_SelectedTaskStatus=="1");
		}
		else
		{
			_SelectedTaskID = 0;
			_SelectedTaskStatus= 0;
			_SelectedTaskCallref = 0;
			_bCompletedTask=true;
			_bInactiveTask=true;
		}
		_bTasks=true;

	}
	else if(recType=="opencall" || recType=="watchcalls")
	{
		_bWatchCall = (recType=="watchcalls");
		var strCurrIndexes = app.get_row_datatable_selectedindexes(aRow);
		var arrIndexes = strCurrIndexes.split(",");
		var bHaveRows = (strCurrIndexes!="-1");

		_hd_bCanAccept = bHaveRows;
		_hd_bCanAssign = bHaveRows;
		_hd_bCanUpdate = bHaveRows;
		_hd_bCanHold = bHaveRows;
		_hd_bCanTakeOffHold = bHaveRows;
		_hd_bCanResolve = bHaveRows;
		_hd_bCanClose = bHaveRows;
		_hd_bCanCancel = bHaveRows;
		_hd_bCanReactivate = bHaveRows;
		_hd_bCanChangeClass = bHaveRows;
		_hd_bCanChangeCondition = bHaveRows;

		for(var x=0; (x<arrIndexes.length) && (bHaveRows);x++)
		{
			//-- for each selected row see what we can do with it

			var aRow = eDataTable.rows[arrIndexes[x]];
			if(aRow==undefined)
			{
				_hd_bCanAccept = false;
				_hd_bCanAssign = false;
				_hd_bCanUpdate = false;
				_hd_bCanHold = false;
				_hd_bCanTakeOffHold = false;
				_hd_bCanResolve = false;
				_hd_bCanClose = false;
				_hd_bCanCancel = false;
				_hd_bCanReactivate = false;
				_hd_bCanChangeClass = false;
				_hd_bCanChangeCondition = false;

				break;
			}
			var intStatus = aRow.getAttribute('callstatus');// app.datatable_get_colvalue(aRow, "status", true);
			intStatus++;intStatus--;//-- cast it

			//-- get callref and append to selected callrefs
			if(_CurrentSelectedServiceDeskCallrefs!="")_CurrentSelectedServiceDeskCallrefs+=",";
			_CurrentSelectedServiceDeskCallrefs += aRow.getAttribute('keyvalue');

			switch(intStatus)
			{
				case _INCOMING:
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=false;
					_hd_bCanChangeClass = false;
					_hd_bCanChangeCondition = false;
					break;
				case _RESOLVED:
					_hd_bCanClose = true;
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=true;
					break;
				case _CLOSED:
				case _CLOSEDCHARGE:
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					_hd_bCanUpdate = false;
					_hd_bCanCancel = false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=true;
					_hd_bCanChangeClass = false;
					_hd_bCanChangeCondition = false;

					break;
				case _UNACCEPTED:
					_hd_bCanReactivate=false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanClose = false
					_hd_bCanResolve = false				
					break;
				case _UNASSIGNED:
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanReactivate=false;
					break;
				case _PENDING:
					_hd_bCanTakeOffHold=false
					_hd_bCanAccept= false;
					_hd_bCanReactivate=false;
					break;
				case _ONHOLD:
					_hd_bCanHold = false;
					_hd_bCanReactivate=false;
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					break;
				case _OFFHOLD:
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=false;
					_hd_bCanClose = false
					_hd_bCanResolve = false
					break;
				case _CANCELLED:
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					_hd_bCanUpdate = false;
					_hd_bCanCancel = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanHold = false;
					_hd_bCanReactivate=true;
					break;
				case _ESCO:
				case _ESCG:
				case _ESCA:
					_hd_bCanTakeOffHold=false
					_hd_bCanHold = false;
					_hd_bCanReactivate=false;
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanReactivate=false;
					break;
				default:
					alert("Service Desk Status Not Recognised : "  + intStatus);
					break;
			}
		}
	}

	if(_CurrentSelectedServiceDeskCallrefs!="")
	{
		_servicedesk_setup_call_watched_state(_CurrentSelectedServiceDeskCallrefs,aDoc);
	}

	//-- show hide buttons
	app.toolbar_item_sorh(_CurrentOutlookID, "callupdate" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callassign" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callaccept" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callhold" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "calloffhold" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callresolve" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callcancel" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callreact" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callclass" , false, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callcondition" , false, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callprofile" , false, aDoc);

	//-- tasks buttons
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_complete" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_update" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_showcomplete" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_showinactive" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_viewcall" ,_bTasks, aDoc);

	//-- issue buttons
	app.toolbar_item_sorh(_CurrentOutlookID, "issueupdate" ,_bIssue, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "issueclose" ,_bIssue, aDoc);


	//-- enable buttons on toolbar
	app.toolbar_item_dore(_CurrentOutlookID, "callupdate" , _hd_bCanUpdate, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callassign" , _hd_bCanAssign, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callaccept" , _hd_bCanAccept, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callhold" , _hd_bCanHold, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "calloffhold" , _hd_bCanTakeOffHold, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callresolve" , (_hd_bCanResolve || _hd_bCanClose), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcancel" , _hd_bCanCancel, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callreact" , _hd_bCanReactivate, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callclass" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcondition" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callprofile" , false, aDoc);

	//-- tasks buttons
	app.toolbar_item_dore(_CurrentOutlookID, "wf_complete" , (!_bCompletedTask && !_bInactiveTask), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_update" , !_bCompletedTask, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_viewcall" , (_SelectedTaskCallref>0), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showcomplete" , true, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showinactive" , true, aDoc);

	//-- issue buttons
	app.toolbar_item_dore(_CurrentOutlookID, "issueupdate" , (_SelectedIssueID!=""), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "issueclose" , (_SelectedIssueID!=""), aDoc);

	if(__SERVICEDESK_CONTEXT_MENU!=null)
	{
		__SERVICEDESK_CONTEXT_MENU.style.display="none";
		__SERVICEDESK_CONTEXT_MENU.innerHTML = "";
	}

}

function servicedesk_showhide_contextmenuitem_override(strMenuItemID,boolDefaultShow,oContextMenu,aDoc)
{
	app.contextmenu_item_hors(oContextMenu, strMenuItemID , boolDefaultShow, aDoc);
	return false;
}

//-- context menu draw
var __SERVICEDESK_CONTEXT_MENU = null;
function servicedesk_draw_contextmenu(oContextMenu,ev)
{
	var aDoc = app.getEleDoc(oContextMenu);

	var overRideFunc = servicedesk_showhide_contextmenuitem_override
	if(app["_wc_helpdesk_contextmenuitem_showhide"])overRideFunc = app["_wc_helpdesk_contextmenuitem_showhide"];

	__SERVICEDESK_CONTEXT_MENU = aDoc.getElementById("app-context-menu");

	//-- show hide buttons
	if(overRideFunc("callupdate",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callupdate" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callassign",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callassign" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callaccept",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callaccept" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callhold",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callhold" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("calloffhold",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "calloffhold" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callresolve",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callresolve" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callcancel",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callcancel" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callreact",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callreact" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callclass",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callclass" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callcondition",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callcondition" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callprofile",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callprofile" , (!_bTasks && !_bIssue), aDoc);

	//-- tasks buttons
	if(overRideFunc("wf_complete",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_complete" , _bTasks, aDoc);
	if(overRideFunc("wf_update",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_update" , _bTasks, aDoc);
	if(overRideFunc("wf_showcomplete",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_showcomplete" , _bTasks, aDoc);
	if(overRideFunc("wf_showinactive",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_showinactive" , _bTasks, aDoc);
	if(overRideFunc("wf_viewcall",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_dore(oContextMenu, "wf_viewcall" , true, aDoc);

	//-- enable buttons on context
	app.contextmenu_item_dore(oContextMenu, "callupdate" , _hd_bCanUpdate, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callassign" , _hd_bCanAssign, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callaccept" , _hd_bCanAccept, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callhold" , _hd_bCanHold, aDoc);
	app.contextmenu_item_dore(oContextMenu, "calloffhold" , _hd_bCanTakeOffHold, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callresolve" , (_hd_bCanResolve || _hd_bCanClose), aDoc);
	app.contextmenu_item_dore(oContextMenu, "callcancel" , _hd_bCanCancel, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callreact" , _hd_bCanReactivate, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callclass" , _hd_bCanUpdate && _hd_bCanChangeClass, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callcondition" , _hd_bCanUpdate && _hd_bCanChangeCondition, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callprofile" , _hd_bCanUpdate, aDoc);

	//-- watch
	app.contextmenu_item_dore(oContextMenu, "callwatch" , _hd_bCanWatch && !_bIssue, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callunwatch" , _hd_bCanUnwatch && !_bIssue, aDoc);
	app.contextmenu_item_dore(oContextMenu, "watchoptions" , _hd_bCanUnwatch && !_bIssue, aDoc);


	//-- tasks buttons
	app.contextmenu_item_dore(oContextMenu, "wf_complete" , (!_bCompletedTask && !_bInactiveTask), aDoc);
	app.contextmenu_item_dore(oContextMenu, "wf_update" , !_bCompletedTask, aDoc);
	app.contextmenu_item_dore(oContextMenu, "wf_viewcall" , (_SelectedTaskCallref>0 || _CurrentSelectedServiceDeskCallrefs!="") && !_bIssue, aDoc);


	//-- issues
	if(overRideFunc("issueclose",_bIssue,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "issueclose" , _bIssue, aDoc);
	if(overRideFunc("issueupdate",_bIssue,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "issueupdate" , _bIssue, aDoc);
	app.contextmenu_item_dore(oContextMenu, "issueupdate" ,  (_SelectedIssueID!=""), aDoc);
	app.contextmenu_item_dore(oContextMenu, "issueclose" ,  (_SelectedIssueID!=""), aDoc);

	//-- nwj - 30.03.2011 - allow app dev to trap context menu popup event and they can then hide options if need be
	//if(app["_wc_helpdesk_contextmenu_action"])
	//{
	//	var res = app["_wc_helpdesk_contextmenu_action"](strToolBarItemID,_CurrentSelectedServiceDeskCallrefs,_SelectedTaskCallref);
	//	if(res==false)return;
	//}

	return true;
}

function _helpdesk_page_start(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
	oDivTableHolder.setAttribute("page", 1);

	_servicedesk_apply_tablefilter(oDivTableHolder,true)
	

}
function _helpdesk_page_prev(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var currPage = filterDiv.getAttribute("pagenumber")-0;
	if(currPage>1)
	{
		var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
		oDivTableHolder.setAttribute("page", currPage-1);
		_servicedesk_apply_tablefilter(oDivTableHolder,true)
	}

}
function _helpdesk_page_next(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var currPage = filterDiv.getAttribute("pagenumber")-0;
	var lastPage = filterDiv.getAttribute("lastpagenumber")-0;
	if(currPage<lastPage)
	{
		var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
		oDivTableHolder.setAttribute("page", currPage+1);
		_servicedesk_apply_tablefilter(oDivTableHolder,true)
	}
}

function _helpdesk_page_end(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var lastPage = filterDiv.getAttribute("lastpagenumber")-0;
	var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
	oDivTableHolder.setAttribute("page", lastPage);
	_servicedesk_apply_tablefilter(oDivTableHolder,true)
}