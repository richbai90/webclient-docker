//--
//-- ms office outlook styled navigation bar
var application_navbar = null;

//-- 18.01.2013 - nwj - check view permissions
function has_view_permissions(strPermission)
{

	var arrPermissions = strPermission.replace(" ","").split(",");
	for(var x=0;x<arrPermissions.length;x++)
	{
		var arrP = arrPermissions[x].split(".");
		if(arrP[0]=="app")
		{
			if(!session.HaveAppRight(arrP[1],arrP[2]))return false;
		}
		else if(arrP[0]=="sys")
		{
			if(!session.HaveRight(arrP[1],arrP[2]))return false;
		}
	}
	return true;
}


//--
//-- load application nav bar
function load_application_navbar(tEle)
{
	//-- use global params to get view info

	var strXML = "";
	var strMenuItems = ""

	var altStartView = "";
	var strStartView = dd.GetGlobalParam("views/startupview");

	//-- get outlook bar state cookie
	var expandedItems = _get_webclient_cookie("_wc_outlookbar_items");
	var arrItems = expandedItems.split(",");
	var intExpandItemLength = arrItems.length;
	if(expandedItems=="")intExpandItemLength=0;
	
	//-- store by name
	var arrExpandedItems = new Array();
	for(var x=0;x<arrItems.length;x++)
	{
		if(arrItems[x]=="")continue;
		arrExpandedItems[arrItems[x]] = true;
	}


	var iMin=0;
	var iCounter=0;
	var arrViews = dd.GetGlobalParam("views");
	for(strViewName in arrViews)
	{
		if(arrViews[strViewName].type!=undefined)
		{
			//-- 18.01.2013 - nwj - check view permissions
			var vr = arrViews[strViewName].visibilityrights;
			if(vr!=undefined && vr!="")
			{
				//-- check if user has right to view
				if (!has_view_permissions(vr.toLowerCase()))continue;
			}


			//-- we do not support lib, dbsearch or reports
			switch(arrViews[strViewName].type)
			{
				case "calendar": //-- check if has any calendars
					if(_arr_xml_calendar_list.length<1)continue;
					break;

				case "mail": //-- check service
					if(!global.IsConnectedToMailServer())continue;
					break;
				//case "library":
				case "dbsearch":
					continue;
					break;
				case "reports":
					if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANVIEWREPORTS))continue;
					break;
				case "knowledgebase":
					if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS))continue;
					break;
			}

			//-- goto next if not visible
			if(arrViews[strViewName].visible.toLowerCase()!="yes") continue;

			if(arrViews[strViewName].type=="autodbev")
			{
				//-- create searches of mes - which arent stored - so get them from config
				if(app._xmlManagedEntitySearches==null)
				{
					alert("Managed entity search functionality is switched on, however there are no definitions setup. Please contact your Administrator.");
				}
				else
				{
					//-- get outlook xml as string
					var xmlOutlook = app._xmlManagedEntitySearches.getElementsByTagName("dbev");// childNodes[0].childNodes; //;getElementsByTagName("outlook")[0];
					
					for(var x=0;x< xmlOutlook.length;x++)
					{
						var xmlMES = xmlOutlook[x];
						var strName = app.xmlNodeTextByTag(xmlMES,"name");
						if(strName!="")
						{
							if(iCounter==0)altStartView = strViewName;
							if(iCounter==4)iMin=1;
							iCounter++;

							//-- outlook top left title
							var strLeftTitle= app.xmlNodeTextByTag(xmlMES,"searchTitle");
							if(strLeftTitle=="")strLeftTitle = strName;
							var strIcon = app.xmlNodeTextByTag(xmlMES,"icon");
							if(strIcon=="")strIcon=0;
							
							//-- is this an expanded item
							if(arrExpandedItems[strName])
							{
								iMin = 0;
							}
							else if(intExpandItemLength>0)
							{
								iMin = 1;
							}

							var cImage = app.xmlNodeTextByTag(xmlMES,"customicon");
							if(cImage!="")cImage=_swc_parse_variablestring(cImage);


							strMenuItems+='<link type="mes"	min="'+ iMin +'" lefttitle="' + strLeftTitle + '" oid="'+strName+'" customimg="'+cImage+'" imgid="'+strIcon+'">'+ strName +'</link>';
						}
					}
				}
			}
			else
			{
				
				if(iCounter==0)altStartView = strViewName;
				if(iCounter==4)iMin=1;
				iCounter++;

				//-- is this an expanded item
				if(arrExpandedItems[strViewName])
				{
					iMin = 0;
				}
				else if(intExpandItemLength>0)
				{
					iMin = 1;
				}
				
				//-- nwj - 14.01.2013 - add support for a customimage
				var cImage = "";
				if(arrViews[strViewName].customicon && arrViews[strViewName].customicon!="")cImage=_swc_parse_variablestring(arrViews[strViewName].customicon);

				//-- outlook top left title
				var strLeftTitle=(arrViews[strViewName].viewtitle==undefined)?arrViews[strViewName].icontitle:arrViews[strViewName].viewtitle;
				strMenuItems+='<link type="'+arrViews[strViewName].type+'"	lefttitle="' + strLeftTitle + '" min="'+ iMin +'" oid="'+strViewName+'" customimg="'+cImage+'" imgid="'+arrViews[strViewName].icon+'">'+arrViews[strViewName].icontitle+'</link>';
			}
		}
	}

	//-- xml for navbar
	strXML = "<navbar>";
	strXML += strMenuItems;
	strXML += "</navbar>";
	

	var oXML = create_xml_dom(strXML);
	if(!oXML)
	{
		alert("outlooks.js : load_application_navbar\n\nCould not load outlook xml string. Please contact your Administrator");
		return false;
	}

	//-- add event to show / hide navbar
	app.addEvent(document.getElementById("nav-inout"),"click",showhide_navbar);			

	application_navbar = new_navbar(oXML);
	application_navbar.draw(tEle);

	//-- init bar
	var strStartBar = (strStartView=="")?altStartView:strStartView;
	strStartBar = top.string_replace(strStartBar," ","_");
	if(strStartBar!="")application_navbar.activatebar(strStartBar.toLowerCase());

	//-- check if scrolling is needed
	setTimeout("check_navbar_scrolling()",100);
}


function forcehide_navbar()
{
	app.eAppOutlook.style.display = "none";
	var ele = document.getElementById("nav-inout");
	setElementText(document.getElementById("nav-inout")," ");

	_current_bar_item.setAttribute("leftpanesetting","hide");
	app._resize_browser_layout();  
}

//-- show or hide the nav bar - when hidden nav bar will 
function showhide_navbar(e,bByCode)
{
	var ele = document.getElementById("nav-inout");

	//-- if user had clicked to open view and that left pane is set to hide then exit
	if(bByCode==undefined && _current_bar_item.getAttribute("leftpanesetting") == "hide") return false;

	var exp = ele.getAttribute("expanded");
	var strDisplay = "none";
	var strText = ">>";
	if(exp=="1")
	{
		//-- collapse
		exp="0";
	}
	else
	{
		//-- expand
		exp="1";
		strDisplay = "block";
		strText = "<<";
	}

	//-- resize window table dimensions
	app.eAppOutlook.style.display = strDisplay;
	setElementText(ele,strText);

	ele.setAttribute("expanded",exp);
	_current_bar_item.setAttribute("leftpanesetting",exp);

	app._resize_browser_layout();
}

function get_navbar_xml()
{
	//-- get navbar xml - check for custom
	var strURL = app._customapplicationpath + app._navbarxmlname;
	var oXML = app.get_http(strURL, "", true,true,null);				
	if(oXML) return oXML;

	//-- load default applciation outllook
	var strURL = app._applicationpath + app._navbarxmlname;
	var oXML = app.get_http(strURL, "", true, true, null);				
	if(oXML) return oXML;

	return false;
}

//--
//-- given xml object defining a navbar - create it in the given workspace object (a div)
function new_navbar(oXml)
{
	var aLink;
	var tmpBar = new oNavbar();

	var arrLinks = oXml.getElementsByTagName("link");
	for(var x=0;x < arrLinks.length;x++)
	{
		aLink = arrLinks[x];
		tmpBar.add_bar(aLink.getAttribute("oid"), aLink.getAttribute("type"),aLink.getAttribute("min") ,app.xmlText(aLink),aLink.getAttribute("imgid"),aLink.getAttribute("lefttitle"),aLink.getAttribute("customimg"))
	}
	
	return tmpBar;
}

function oNavbar()
{
	this.holder = null;
	this.array_bars = new Array();
	this.navitemshtml = new Array();
	this.activewidget = null;
}

//--
//-- add a bar to the nav bar
oNavbar.prototype.add_bar = function (strID, strType ,intMin, strText,intIcon,strLeftTitle,strCustomImage)
{
	if(intMin==null || intMin=="")intMin=1;
	if(strCustomImage==null || strCustomImage==undefined)strCustomImage="";
	this.array_bars[strID] = new Object();
	this.array_bars[strID].id = strID;
	this.array_bars[strID].type = strType;
	this.array_bars[strID].min = intMin;
	this.array_bars[strID].text = strText;
	this.array_bars[strID].imgid = intIcon;
	this.array_bars[strID].lefttitle = strLeftTitle;
	this.array_bars[strID].customimg = strCustomImage;
}

//-- activate a navbar item by id
oNavbar.prototype.activatebar = function (strID)
{
	var eBar = app.get_parent_child_by_id(this.baritemholder,strID);
	if(eBar==null) return;
	if(eBar.style.display=="none")
	{
		//-- is hidden so use min bar
		var eBar = app.get_parent_child_by_id(this.shortcutholder,strID);
		if(eBar==null) return;
	}

	var eleSrc= app.get_parent_child_by_tag(eBar,"TR");
	activate_navbar(this.baritemholder,eleSrc)
	
}

//-- draw navigation bar
oNavbar.prototype.draw = function (eleTarget)
{
	if(eleTarget)
	{
		//-- assign pointer and clear html
		this.holder = eleTarget;

		this.widgetholder = app.get_parent_child_by_id(this.holder, "widget-holder");
		this.baritemholder = document.getElementById("nav-items"); //app.get_parent_child_by_id(this.holder, "baritems-holder");

		//--loop through bars and draw
		var oBar;
		for(strID in this.array_bars)
		{
			this.draw_bar(strID)
		}

		this.baritemholder.innerHTML = this.navitemshtml.join("");
		this.holder.navbar = this;
		this.widgetholder.navbar = this;
		this.baritemholder.navbar = this;
	}
}

//-- draw a bar item
oNavbar.prototype.draw_bar = function (strID)
{
	var oBar = this.array_bars[strID];
	var strMainDisplay = "bar-item";
	var strMinDisplay = "sbar-item-hide";
	if(oBar.min==1)
	{
		strMinDisplay="sbar-item";
		strMainDisplay = "bar-item-hide";
	}

	var stdImage = "client/outlook/images/bar/"+ oBar.imgid+".png";
	var useImage = (oBar.customimg!="")?oBar.customimg:stdImage;
	this.navitemshtml.push("<div id='" + oBar.id + "' btype='" + oBar.type + "' class='sbar-item' leftitle='"+oBar.lefttitle+"' title='"+oBar.text+"'><table cellspacing='0' cellpadding='0' border='0' width='100%' height='100%'><tr><td valign='middle' align='middle'><img src='"+useImage+"'></img></td></tr></table></div>");
}


//-- show bar item
oNavbar.prototype.show_bar = function (strID)
{
}

//-- hide bar item - like email if email service goes down
oNavbar.prototype.hide_bar = function (strID)
{

}



//--
//-- nav bar event helpers


//-- hi-lo lite bar items
function hilite_navbar(oItemHolder, oE)
{
	//-- get srcElement for the event
	var eleSrc = app.getEventSourceElement(oE);
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
	
	//alert(eleSrc.id)
	var strUseClass = (oItemHolder.currentbaritem == eleSrc)? "bar-item-selected-hilite":"bar-item-hilite";
	eleSrc.className = strUseClass;
}

function lolite_navbar(oItemHolder,oE)
{
	var eleSrc = app.getEventSourceElement(oE);
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
	var strUseClass = (oItemHolder.currentbaritem == eleSrc)? "bar-item-selected":"bar-item";
	eleSrc.className = strUseClass;
}


function minimise_bar_item(oDiv,oE)
{

	app.hide_application_menu_divs();

	var rightclick = false;
	if (oE.which) rightclick = (oE.which == 3);
	else if (oE.button) rightclick = (oE.button == 2);

	if(rightclick)
	{
		app.stopEvent(oE);

		var eleSrc = app.getEventSourceElement(oE);
		eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
		var pDiv = app.get_parent_owner_by_tag(eleSrc, "DIV");

		//-- get minbar icon
		var minBarItem = app.get_parent_child_by_id(application_navbar.shortcutholder,pDiv.id);
		if(minBarItem!=null)
		{
			//-- minimise selected bar
			if(eleSrc.className=='bar-item-selected')
			{
				minBarItem.className='sbar-item-selected';
				application_navbar.shortcutholder.currentbaritem = minBarItem;
				_current_minbar_item = minBarItem;
			}
			else
			{
				minBarItem.className='sbar-item';
			}
			

			application_navbar.array_bars[minBarItem.id].min = 1;
		}

		pDiv.style.display="none";

		//-- save state of outllokbar to cookie
		outlookbar_save_state();

		return false;
	}
}

function outlookbar_save_state()
{
	var strExpandedItems = "";
	for(strID in application_navbar.array_bars)
	{
		if(application_navbar.array_bars[strID].min==0)
		{
			if(strExpandedItems!="")strExpandedItems+=",";
			strExpandedItems += strID;
		}
	}
	_set_webclient_cookie("_wc_outlookbar_items",strExpandedItems);
}

function maximise_bar_item(oDiv,oE)
{
	app.hide_application_menu_divs();

	var rightclick = false;
	if (oE.which) rightclick = (oE.which == 3);
	else if (oE.button) rightclick = (oE.button == 2);

	if(rightclick)
	{
		app.stopEvent(oE);

		var eleSrc = app.getEventSourceElement(oE);
		if(eleSrc.id=="shortcuts-holder")return false;
		eleSrc = app.get_parent_owner_by_tag(eleSrc, "DIV");
		if(eleSrc.id=="shortcuts-holder")return false;

		//-- get fullbar and show
		var mainBarItem = app.get_parent_child_by_id(application_navbar.baritemholder,eleSrc.id);
		if(mainBarItem!=null)
		{
			var mRow = app.get_parent_child_by_tag(mainBarItem, "TR");

			//-- maximise the current selected item
			if(eleSrc.className=='sbar-item-selected')
			{
				mRow.className='bar-item-selected';
				application_navbar.baritemholder.currentbaritem = mRow;
				_current_bar_item = mRow;
				mainBarItem.style.display="block";
			}
			else
			{
				mRow.className='bar-item';
				mainBarItem.style.display="block";
			}

			application_navbar.array_bars[mainBarItem.id].min = 0;
		}
		eleSrc.className='sbar-item-hide';

		//-- save state of outlookbar to cookie
		outlookbar_save_state();

		return false;
	}
}

//-- min nav bar item clicked
var _current_minbar_item = null;
var _current_bar_item = null;
function click_minnavbar(oItemHolderTD,oE)
{
	app.hide_application_menu_divs();

	var eleSrc = app.getEventSourceElement(oE);
	if(eleSrc.id=="shortcuts-holder")return false;
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "DIV");
	if(eleSrc.id=="shortcuts-holder")return false;

	//-- set selected style
	if((oItemHolderTD.currentbaritem) && (oItemHolderTD.currentbaritem.className != "sbar-item-hide"))oItemHolderTD.currentbaritem.className = "sbar-item";
	oItemHolderTD.currentbaritem = eleSrc;
	eleSrc.className = "sbar-item-selected";
	_current_minbar_item = eleSrc;

	//-- deselect mainbar
	if((_current_bar_item!=null) && (_current_bar_item.className != "bar-item-hide"))_current_bar_item.className = "bar-item";

	//-- set title
	var strText = eleSrc.getAttribute("title");
	set_outlook_title(strText);
	set_right_title(strText);

	//-- set right right title detault to date
	var strDate = app._formatDate(new Date(),"EE dd, MMM yyyy");
	app.set_right_right_title(strDate);


	//-- get parent div	and load control space
	load_outlook_control(eleSrc.getAttribute('btype'), eleSrc.getAttribute('id'), "");

	//-- initialise anything for the outlookcontrol
	if(oControlFrameHolder.initialise)oControlFrameHolder.initialise();
}



//-- nav bar item clicked
function click_navbar(oItemHolder,oE)
{
	var eleSrc = app.getEventSourceElement(oE);
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
	activate_navbar(oItemHolder,eleSrc);

}

function canAccessWorkspace()
{
	try{
	return (oWorkspaceFrameHolder!=null && oWorkspaceFrameHolder.getAttribute && oWorkspaceFrameHolder.getAttribute("externalUrl")!=true);
	}catch(e)
	{
		return false;
	}
}

function canAccessoutlookSpace()
{
	try{
	return (oControlFrameHolder!=null && oControlFrameHolder.getAttribute && oControlFrameHolder.getAttribute("externalUrl")!=true);
	}catch(e)
	{
		return false;
	}	
}


function activate_navbar(oItemHolder, eleSrc)
{
	app.hide_application_menu_divs();

	//-- 14.0.9.2010
	//-- check session is still valid - if not then exit
	//var xmlmc = new XmlMethodCall();
	//if(!xmlmc.Invoke("session", "isSessionValid"))
	//{
		//-- in process of logging out
	//	if(app.boolForceLoggingOut)return false;

		//-- log out
	//	app.logout("m3");
	//	return false;
	//}
	

	//-- hide current workspace context menu items
	if(canAccessWorkspace() &&  oWorkspaceFrameHolder.cancel_context_menus)oWorkspaceFrameHolder.cancel_context_menus();

	var eDiv = app.get_parent_owner_by_tag(eleSrc, "DIV");
	if(eDiv==null || eDiv.getAttribute('btype')==null)
	{
		//-- user has clicked on the edge of bar items
		return false;
	}

	//-- set selected style
	if((oItemHolder.currentbaritem) &&(oItemHolder.currentbaritem.className != "bar-item-hide"))oItemHolder.currentbaritem.className = "sbar-item";
	
	eDiv.className = "sbar-item-selected";
	oItemHolder.currentbaritem = eDiv;
	_current_bar_item=eleSrc;

	//-- deselect minbar
	//if((_current_minbar_item!=null) && (_current_minbar_item.className != "sbar-item-hide"))_current_minbar_item.className = "sbar-item";

	//-- set title
	//var oTD = get_parent_child_by_id(eleSrc,"bar-text");
	//var strText = getElementText(oTD);
	strText = eDiv.getAttribute("title");
	set_outlook_title(strText);
	set_right_title(strText);

	//-- set right right title detault to date
	var strDate = app._formatDate(new Date(),"EE dd, MMM yyyy");
	app.set_right_right_title(strDate);

	load_outlook_control(eDiv.getAttribute('btype'), eDiv.getAttribute('id'), "")

	var ele = document.getElementById("nav-inout");
	var lpsetting = _current_bar_item.getAttribute("leftpanesetting");
	if(lpsetting=="1")
	{
		//-- left pane should be expanded
		ele.setAttribute("expanded","0");
		showhide_navbar(null,true);
	}
	else if (lpsetting=="0")
	{
		//-- left pane should be collapsed
		ele.setAttribute("expanded","1");
		showhide_navbar(null,true);
	}
	else if (lpsetting=="hide")
	{
		//-- left pane should be invisible and not accessible
		ele.setAttribute("expanded","2");
		forcehide_navbar();
	}
	else
	{
		//-- loading for first time so always show
		ele.setAttribute("expanded","0");
		showhide_navbar(null,true);
	}


	//-- initialise anything for the outlookcontrol
	if(oControlFrameHolder.initialise)oControlFrameHolder.initialise();

}

//-- set the title of the xp outlook bar
function set_outlook_title(strTitle)
{
	var oTitleDiv = document.getElementById("title-holder");
	app.setElementText(oTitleDiv, strTitle);
}

function get_outlook_left_title()
{
	var oTitleDiv = document.getElementById("title-holder");
	return getElementText(oTitleDiv);
}

//-- set the title of the workspace
function set_right_title(strText)
{
	if(eAppTitleRight!=null)
	{
		app.setElementText(eAppTitleRight, strText);	
	}
}
//- -set the right title of workspace
function set_right_right_title(strText)
{
	if(eAppTitleRightRight!=null)
	{
		app.setElementText(eAppTitleRightRight, strText + "   ");	
	}
}

//-- hold current active outlook control
var oCurrentOutlookControl = null;
var oCurrentOutlookWorkSpace = null;
var oWorkspaceFrameHolder = null;
var oControlFrameHolder = null;
var _CurrentOutlookID = "";
var _CurrentOutlookType = "";
//-- load into the outlook navigation bar a control such as worklist, dbsearch, email, calendar
function load_outlook_control(strControlType, strControlID, strControlParams)
{
	//-- parse any js vars
	strControlType = app.parsejsstr(strControlType);
	strControlID = app.parsejsstr(strControlID);
	strControlParams = app.parsejsstr(strControlParams);

	_CurrentOutlookID = strControlID;
	_CurrentOutlookType = strControlType;

	//--
	//-- check if already created iframe to store control interface
	//-- get frame and space area
	var oControlArea = document.getElementById("widget-holder");
	var oWorkspaceArea = app.eAppWorkspace;

	var strControlFrameID = "ol_" + strControlType + "_" + strControlID;
	var strWorkSpaceFrameID = "ws_" + strControlType + "_" + strControlID;
	//-- get element to work with
	var oControlFrame = document.getElementById(strControlFrameID);
	var oWorkspaceFrame = document.getElementById(strWorkSpaceFrameID);

	if(strControlType.toLowerCase()=="system")
	{
		//-- a system view like email, calender, kbase
		var strControlDefinitionPath = _systempath + strControlType + "/" + strControlID + ".xml";
		var strOutlookProcessingPath = _outlookcontrolpath + strControlType + "/" + strControlID + "/";
		var strWorkspaceProcessingPath = _workspacecontrolpath;

	}
	else
	{
		//-- an application view
		var strControlDefinitionPath = _applicationpath + "outlook/" + strControlType + "/" + strControlID + ".xml";
		var strOutlookProcessingPath = _outlookcontrolpath + strControlType + "/";
		var strWorkspaceProcessingPath = _workspacecontrolpath;
	}


	//-- see if div exists - if show just show it and re-init the control in it
	if(oControlFrame!=null)
	{
		//-- if not current frame hide and show
		if(oControlFrame!=oCurrentOutlookControl)
		{
			//-- do we need to reload helpdesk view (i.e. someone called the global.RefreshHelpdeskAnalystsTree() method
			if(strControlType=="helpdesk" && app._helpdesk_view_tree_reload)
			{
				oControlFrame.contentWindow._reload_helpdesk_tree();
			}

			//-- hide current div areas
			oCurrentOutlookControl.style.display = "none";
			oCurrentOutlookWorkSpace.style.display = "none";	
		
			//-- show new ones
			oControlFrame.style.display = "";
			oWorkspaceFrame.style.display = "";


			var tmpWorkspaceFrameHolder = app.getFrame(strWorkSpaceFrameID,document);
			var tmpOutlookFrameHolder = app.getFrame(strControlFrameID,document);

			//-- resize - as may have adjusted while hidden
			if(canAccessWorkspace() && tmpWorkspaceFrameHolder.sizeup_workspace_areas)tmpWorkspaceFrameHolder.sizeup_workspace_areas();
			if(canAccessoutlookSpace() && tmpOutlookFrameHolder.sizeup_outlook_area)tmpOutlookFrameHolder.sizeup_outlook_area();

			//-- call onshowevent for frames if they exists
			if(canAccessWorkspace() && tmpWorkspaceFrameHolder._onshow)tmpWorkspaceFrameHolder._onshow();
			if(canAccessoutlookSpace() && tmpOutlookFrameHolder._onshow)tmpOutlookFrameHolder._onshow();
		}
	}
	else
	{
		//-- create new one
		//-- hide current top frame
		if(oCurrentOutlookControl!=null)
		{
			oCurrentOutlookControl.style.display="none";
			oCurrentOutlookWorkSpace.style.display="none";
		}
	
		//-- create divs for outlook area and workspace area
		var strFrameHTML = '<iframe id="' + strControlFrameID + '" onload="try{top._swc_check_document_hrefs(this);}catch(e){}" onreadstatechange="try{top._swc_check_document_hrefs(this);}catch(e){}" name="'+ strControlFrameID +'"  style="height:100%;width:100%;" frameborder="0"></iframe>';
		var strWorkSpaceHTML = '<iframe id="' + strWorkSpaceFrameID + '" name="'+ strWorkSpaceFrameID +'" onload="try{top._swc_check_document_hrefs(this);}catch(e){}" onreadstatechange="try{top._swc_check_document_hrefs(this);}catch(e){}" style="height:100%;width:100%;" frameborder="0"></iframe>';

		//-- append html
		app.insertBeforeEnd(oControlArea,strFrameHTML)
		app.insertBeforeEnd(oWorkspaceArea,strWorkSpaceHTML)

		//-- get new elements
		oControlFrame = document.getElementById(strControlFrameID);
		oWorkspaceFrame = document.getElementById(strWorkSpaceFrameID);


		oControlFrame.setAttribute("swcontroltype",strControlType);
		oWorkspaceFrame.setAttribute("swcontroltype",strControlType);

		//-- a webpage so jsut load url and pass in sessid
		if(strControlType=="webpage")
		{
			//oControlFrame.style.border = "1px solid #000000";
			oWorkspaceFrame.style.border = "1px solid #D5D4DF";
			oWorkspaceFrame.style.borderTop = "0px solid #D5D4DF";
		

			var strWebpageUrl = _swc_parse_variablestring(app.dd.GetGlobalParam("views/" + strControlID + "/url"));
			var strWebpageLeftUrl = _swc_parse_variablestring(app.dd.GetGlobalParam("views/" + strControlID + "/lefturl"));

			//--
			//-- load frame documents using post - so hidden from history
			var frm  = document.getElementById("form_iframeloader");
			frm.setAttribute("target",strControlFrameID);
			frm.setAttribute("action",strWebpageLeftUrl);

			document.getElementById("frm_swsessionid").value =_swsessionid;
			document.getElementById("frm_swsessid").value =_swsessionid;
			document.getElementById("frm_analystid").value = top.session.analystid.toUpperCase();
			document.getElementById("frm_webclient").value ="1";
			document.getElementById("frm_appid").value ="";
			document.getElementById("frm_controlid").value = "";
			document.getElementById("frm_xmlfile").value = "";
			document.getElementById("frm_viewid").value = "";
			document.getElementById("frm_controltype").value = "";
			if(strWebpageLeftUrl!="")
			{
				try{
				frm.submit();
				}catch(e)
				{
					alert("Failed to open Active Page. Please check your browser for any https warnings. The active page url may be running as http when the webclient is running as https.");
				}
			}
			else
			{
				//-- hide the pane
				forcehide_navbar();
			}
			
			//-- load worspace frame - using js
			frm.setAttribute("target",strWorkSpaceFrameID);
			frm.setAttribute("action",strWebpageUrl);
			document.getElementById("frm_swsessionid").value =_swsessionid;
			document.getElementById("frm_swsessid").value =_swsessionid;
			document.getElementById("frm_webclient").value ="1";
			document.getElementById("frm_appid").value ="";
			document.getElementById("frm_controlid").value = "";
			document.getElementById("frm_xmlfile").value = "";
			document.getElementById("frm_viewid").value = "";
			document.getElementById("frm_controltype").value = "";
			if(strWebpageUrl!="")
			{
				try{
				frm.submit();
				}catch(e)
				{
					alert("Failed to open Active Page. Please check your browser for any https warnings. The active page url may be running as http when the webclient is running as https.");
				}
			}
		}
		else
		{
			//--
			//-- load frame documents using post - so hidden from history
			var frm  = document.getElementById("form_iframeloader");
			frm.setAttribute("target",strControlFrameID);
			frm.setAttribute("action",strOutlookProcessingPath + 'outlook.php');

			document.getElementById("frm_swsessionid").value =_swsessionid;
			document.getElementById("frm_webclient").value ="1";
			document.getElementById("frm_appid").value =_application;
			document.getElementById("frm_controlid").value = strControlID;
			document.getElementById("frm_xmlfile").value = strControlDefinitionPath;
			document.getElementById("frm_viewid").value = strControlID;
			document.getElementById("frm_controltype").value = strControlType;
			frm.submit();
			
			//-- load worspace frame - using js
			frm.setAttribute("target",strWorkSpaceFrameID);
			frm.setAttribute("action",strWorkspaceProcessingPath + 'workspace.php');
			frm.submit();
		}
	}

	//-- store current displayed outlook and workspace areas
	oCurrentOutlookControl = oControlFrame;
	oCurrentOutlookWorkSpace = oWorkspaceFrame;

	oControlFrameHolder = app.getFrame(strControlFrameID,document);
	oWorkspaceFrameHolder = app.getFrame(strWorkSpaceFrameID,document);

}


//-- checks loaded documents for a hrefs and specifically for link to hsl:
//-- if has hsl: added onmousedown event to trap, handle and cancel bubble
function _swc_check_document_hrefs(aFrame,bIsDoc)
{
	if(bIsDoc==undefined)bIsDoc=false;
	if(!bIsDoc)
	{
		if(aFrame!=undefined)
		{
			try
			{
				var aDoc = aFrame.contentWindow.document;
			}
			catch (e)
			{
				return;
			}
		}
	}
	else
	{
		var aDoc = aFrame; //-- developer passed in document element
	}

	if(aDoc.readyState=="complete")
	{
		//-- set var app = this; in frame document (fixes issue with wssm tab controls / tables used in active pages i.e. ITSM 3)
		//-- only apply to fullclient webpages
		if(!bIsDoc)
		{
			if(aFrame.getAttribute("swcontroltype")=="webpage" || aFrame.contentWindow.document.location.href.indexOf("php_reports")>0)
			{
				eval("aFrame.contentWindow.app = aFrame.contentWindow;");


				//-- add event to iframe document that if mousedown then hide any toplevel divs
				try
				{
					aDoc.body.onmousedown = function(){}; //-- create any mouse down events that active page may have - should not have any
					app.addEvent(aDoc,"mousedown",app.hide_application_menu_divs);			
				}
				catch (e)
				{

				}
			}
			else
			{
				//-- do not allow default context menu of wc system pages
				app.addEvent(aDoc,"contextmenu",app.stopEvent);			
			}
		}

		_scan_hsl_anchors(aDoc,aFrame.contentWindow);
	}
}

function _scan_hsl_anchors(aDoc, contentWindow)
{
	var array_hrefs = aDoc.getElementsByTagName("A");
	for(var x=0;x<array_hrefs.length;x++)
	{
		_prepare_hsl_anchor(array_hrefs[x],contentWindow)
	}
}

function _prepare_hsl_anchor(anAnchor,contentWindow)
{
	var strHREF = anAnchor.href;
	if(strHREF==null || strHREF==undefined) return;
	if(strHREF.indexOf("hsl:")==0)	
	{
		if(contentWindow!=undefined)anAnchor.frameholder = contentWindow;

		anAnchor.setAttribute("hslaction",strHREF);
		anAnchor.href = "#";
		app.removeEvent(anAnchor,"click",_trap_hsl_href);
		app.addEvent(anAnchor,"click",_trap_hsl_href);
	}
}



function _trap_hsl_href(e,b,c)
{
	var hrefAction = this.getAttribute("href");
	if(hrefAction.indexOf("hsl:")==0)
	{
		var arrInfo = hrefAction.split("hsl:");
		var arrInfo = arrInfo[1].split("?");

		//-- convert to hsl link
		_prepare_hsl_anchor(this)

	}
	else
	{
		var hslAction = this.getAttribute("hslaction");
		var arrInfo = hslAction.split("hsl:");
		var arrInfo = arrInfo[1].split("?");
	}

	var strAction = arrInfo[0];
	var strParams = arrInfo[1];
	_hslaction(strAction,strParams,this)

	return false;
}


function navbar_scrollup(e)
{
	stopEvent(e);
	eNavBar.scrollTop = eNavBar.scrollTop-5;
	eNavBar.setAttribute("scroll","1");
	navbar_scroll(false);
}

function navbar_scrolldown(e)
{
	stopEvent(e);
	eNavBar.setAttribute("scroll","2");
	navbar_scroll(true);
}

function navbar_scroll()
{
	if(eNavBar.getAttribute("scroll")=="0") return;

	var dir = eNavBar.getAttribute("scroll");

	if(dir=="2")
	{
		eNavBar.scrollTop = eNavBar.scrollTop+1;
	}
	else if(eNavBar.scrollTop>0)
	{
		eNavBar.scrollTop = eNavBar.scrollTop-1;
	}

	setTimeout("navbar_scroll()",2);

}

function stopscrolling(e)
{
	eNavBar.setAttribute("scroll","0");
}