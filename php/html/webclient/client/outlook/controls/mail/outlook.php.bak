<?php
	include('../../../../php/session.php');
?>

<html>
<head>
	<link rel="StyleSheet" href="tree.css" type="text/css" />
	<link rel="StyleSheet" href="email.css" type="text/css" />
	<link rel="StyleSheet" href="../../../workspace/_controls/toolbar/toolbar-blue.css" type="text/css" />
	

	<script src='../common.outlook.js'></script>
	<script>

		var undefined;
		var app = (opener)?opener:top;
		var jqDoc = app.jqueryify(document); //-- so can use jquery
		var mailboxFolderTree;
		var oXmlCurrentMailbox;
		var oXmlMailboxInfo = null; 


		function _setup_mailbox_list()
		{
			var strMailBoxDivs = "";

			//--
			//-- get mailbox(s) that analyst has permission to use
			var xmlmc = app._new_xmlmethodcall();
			xmlmc.SetParam("analystId",top.session.analystid)
			if(xmlmc.Invoke("mail", "getAnalystMailboxRights"))
			{
				oXmlMailboxInfo = xmlmc.xmlDOM.getElementsByTagName("mailbox");
				for(var x=0;x<oXmlMailboxInfo.length;x++)
				{
					var aMailBox = oXmlMailboxInfo[x];
					var strName = app.xmlNodeTextByTag(aMailBox,"name");

					if(!app._email_checkright(app._EM_CANVIEW,strName,false))continue;

					var strDisplay = app.global.GetSharedMailboxDisplayName(strName);
					var bPersonal =(app.global.IsSharedMailbox(strName)=="")?true:false; //-- 89415 fix
					if(bPersonal)strDisplay += "'s";
					var strHtmlClass = (bPersonal)?"div-mailbox-title-user":"div-mailbox-title-shared";
					strMailBoxDivs += "<div id='"+strName+"' class='"+strHtmlClass+"' onclick='load_mailbox_folder(this);'>"+strDisplay+" mail</div>";
				}
			}

			return strMailBoxDivs;
		}

		function _get_mailbox_information(strMailboxName)
		{
			var xmlmc = app._new_xmlmethodcall();
			xmlmc.SetParam("mailbox",strMailboxName)
			if(xmlmc.Invoke("mail", "getMailboxList"))
			{
				var arrXml = xmlmc.xmlDOM.getElementsByTagName("mailbox");
				return arrXml[0];
			}
			alert("_get_mailbox_information : Failed to retrieve mail box information for " + strMailboxName + ". Please contact your administrator.");
			return null;
		}

		function _get_mailbox_folders(strMailboxName,intParentFolderID)
		{
			var xmlmc = app._new_xmlmethodcall();
			xmlmc.SetParam("mailbox",strMailboxName)
			if(intParentFolderID!=undefined)xmlmc.SetParam("parentFolderId",intParentFolderID)
			if(xmlmc.Invoke("mail", "getFolderList"))
			{
				var arrXml = xmlmc.xmlDOM.getElementsByTagName("folder");
				return arrXml;
			}
			alert("_get_mailbox_folders : Failed to retrieve mail box folder information for " + strMailboxName + ". Please contact your administrator.");
			return null;
		}
	


		//-- refresh current mailbox (part of polling)
		var _lastmailboxloaddate = null;
		function _refresh_selected_mailbox(bFromRefresh)
		{
			if(_mailbox_eSelectedDiv!=null)	
			{
				if(bFromRefresh==undefined)bFromRefresh=true;
				//-- check last mailbox load time against this time - if in last (_email_serverpoll_timeout) then do not refresh
				//-- i.e. user jsut clicked folder and 4 seconds later it tries to refresh
				var tDate = new Date();
				var intTimeDiff = tDate - _lastmailboxloaddate;
				var intPollMs = (app._email_serverpoll_timeout * 1000)
				if(intTimeDiff >=intPollMs || !bFromRefresh)
				{
					load_mailbox_folder(_mailbox_eSelectedDiv ,bFromRefresh);
				}
			}
		}

		function _add_childfolder_to_tree(strMbID,strParentFolderID)
		{
			var arrXmlChildFolders = _get_mailbox_folders(strMbID,strParentFolderID)
			if(arrXmlChildFolders==null) return;
			for(var x=0; x < arrXmlChildFolders.length;x++)
			{
				var strFolderID = app.xmlNodeTextByTag(arrXmlChildFolders[x],"folderId");
				var strFolderName = app.xmlNodeTextByTag(arrXmlChildFolders[x],"folderName");
				var intFUC = app.xmlNodeTextByTag(arrXmlChildFolders[x],"folderUnreadCount");
				var bHasChildren = app.xmlNodeTextByTag(arrXmlChildFolders[x],"folderHasChild");

				//-- display style
				var strDisplay = (intFUC>0)?"<b>" + strFolderName + " (" + intFUC + ")</b>":strFolderName;

				//-- add to tree
				mailboxFolderTree.add(strFolderID,strParentFolderID,strDisplay,load_email_folder_datatable,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,bHasChildren);
				if(bHasChildren=="true")
				{
					_add_childfolder_to_tree(strMbID, strFolderID);
				}
			}
		}

		//-- load mail box folder info and change selected style
		var _mailbox_eSelectedDiv = null;
		function load_mailbox_folder(aDiv, bFromRefresh)
		{
			var divHolder = document.getElementById("div_mailbox_folders");
			if(divHolder.popupmenu!=undefined)divHolder.popupmenu.hide();

			
			if(bFromRefresh==undefined)bFromRefresh=false;

			//-- change style
			if(_mailbox_eSelectedDiv!=null)
			{
				 _mailbox_eSelectedDiv.style.backgroundColor='';
				 _mailbox_eSelectedDiv.style.color='#000000';
			}

			//-- can we view
			if(!app._email_checkright(app._EM_CANVIEW,aDiv.id,true))
			{
				//-- load last mailbox that was selected
				if(_mailbox_eSelectedDiv!=null)
				{
					var tDiv = _mailbox_eSelectedDiv;
					_mailbox_eSelectedDiv = null;
					load_mailbox_folder(tDiv);
				}
				return;
			}

   		     aDiv.style.backgroundColor='navy';
			 aDiv.style.color='#ffffff';
			 _mailbox_eSelectedDiv = aDiv;


			//-- get mailbox xml
			var strMailBoxID = aDiv.id;
			oXmlCurrentMailbox = _get_mailbox_information(strMailBoxID);
			if(oXmlCurrentMailbox==null) return false;

			var strMailboxName = app.xmlNodeTextByTag(oXmlCurrentMailbox,"displayName");

			//-- init tree control
			mailboxFolderTree = app.newtree('mailboxFolderTree',document);
			mailboxFolderTree.config.folderLinks = true; //-- folder behave link nodes when clicked
			mailboxFolderTree.config.useCookies = false;
			mailboxFolderTree._allowrightclick = true;
			mailboxFolderTree.ondropelement = app._mailview_dragdrop;
			mailboxFolderTree.controlid = strMailBoxID;
			mailboxFolderTree.add("0","-1",strMailboxName,load_email_folder_datatable,'','','','',true);
			app._current_mailbox_name = strMailboxName;

			//-- reset current email and paging options
			if(!bFromRefresh)
			{
				app._currentSelectedEmailRecord = 0;
			}

			 //-- load mail box folders - get folders and then output tree control
			 _add_childfolder_to_tree(strMailBoxID,0)


			//-- output tree
			document.getElementById("div_mailbox_folders").innerHTML = mailboxFolderTree;

			var selectFolder=(bFromRefresh)?app._current_mailbox_folder:1;
			setTimeout("select_top_folder("+ selectFolder +","+bFromRefresh+")",500);
		}

		function select_top_folder(iSelectFolder,bFromRefresh)
		{
			var node = mailboxFolderTree.getNodeByID(iSelectFolder)
			//-- use open too incase selected folder (after refresh) was a child one
			mailboxFolderTree.openTo(node,true,true);
			//mailboxFolderTree.s(node);
		}

		//-- load email folder
		function load_email_folder_datatable(aNode,bFromRefresh,eleLink,oEv,bContext)
		{
			var divHolder = document.getElementById("div_mailbox_folders");
			if(divHolder.popupmenu!=undefined)divHolder.popupmenu.hide();

			if(app.oWorkspaceFrameHolder.getElement==undefined)
			{
				setTimeout(function()
				{
					load_email_folder_datatable(aNode,bFromRefresh,eleLink,oEv,bContext);
				},500);
				return;
			}
			var targetTable = app.oWorkspaceFrameHolder.getElement(top._CurrentOutlookID);
			if(targetTable == null) return;


			_lastmailboxloaddate = new Date();

			var _current_emailid = app._currentSelectedEmailRecord;
			app._disable_emailview_toolbar(targetTable);

			//-- set folder to open
			var strMailboxType = app.xmlNodeTextByTag(oXmlCurrentMailbox,"type");
			if(strMailboxType=="1")
			{
				var strMailBoxPrefix = mailboxFolderTree.controlid;
			}
			else
			{
				var strMailBoxPrefix = mailboxFolderTree.controlid;
			}

			//-- reset paging
			if(app._current_mailbox != mailboxFolderTree.controlid || app._current_mailbox_folder != aNode.id)
			{
				targetTable.setAttribute("page",1);
			}

			//-- set global var so can be used else where
			app._current_mailbox_foldername = aNode.name;
			app._current_mailbox_folder = aNode.id;
			app._current_mailbox_prefix = strMailBoxPrefix;
			app._current_mailbox = mailboxFolderTree.controlid;


			top.debugstart("Load Email List For " +app._current_mailbox +":"+ app._current_mailbox_foldername,"EMAIL");


			//-- show context menu
			if(bContext)
			{
				app.stopEvent(oEv);
				_email_folders_context_menu(oEv);
			}

			return refresh_data(targetTable);
		
		}


	function refresh_data(oDivTableHolder)
	{
		//-- if from a delete email action then do not bother to refresh table as we have removed row using js
		if(app._currentSelectedEmailRecordDeleted)
		{
			app._currentSelectedEmailRecordDeleted = false;
			//return;
		}


		var targetTable = oDivTableHolder;
		if(targetTable == null) return;
		
		//-- get total number of rows for this mailbox folder that we are loading
		//-- to determine paging control state
		var intTotalRowCount = 0;
		var xmlmc = app._new_xmlmethodcall();
		xmlmc.SetParam("mailbox", app._current_mailbox);
		xmlmc.SetParam("folderId", app._current_mailbox_folder);
		if(xmlmc.Invoke("mail", "getMessageCount"))
		{
		    intTotalRowCount = xmlmc.GetParam("messageCount");
		}

		//-- get page we want to get and the number of rows per page
		var intPage =  targetTable.getAttribute("page");
		var intRPP  =  targetTable.getAttribute("rpp");
		//-- check if have rpp setting in ddf
		var intGpRPP = app.dd.GetGlobalParamAsNumber("views/E-Mail/webclient settings/rowsperpage");
		if(intGpRPP!="" && intGpRPP>0)intRPP = intGpRPP;


		//-- determine max number of pages
		//alert(intTotalRowCount/intRPP)
		var	maxPage = Math.ceil(intTotalRowCount/intRPP);
		if(maxPage < 2)
		{
			//-- hide page moving control
			var eleControlDivHolder = app.get_parent_child_by_class(oDivTableHolder,"dhtml_table_filters");
			if(eleControlDivHolder!=null)
			{
				eleControlDivHolder.childNodes[0].rows[0].cells[0].style.display = 'none';
			}
		}
		else
		{
			//-- set text
			var eleControlDivHolder = app.get_parent_child_by_class(oDivTableHolder,"dhtml_table_filters");
			if(eleControlDivHolder!=null)
			{
				var eleControlText = eleControlDivHolder.childNodes[0].rows[0].cells[0].childNodes[0].rows[0].cells[2];
				if(eleControlText!=undefined)
				{
					app.setElementText(eleControlText," Page " + intPage + " of " + maxPage + "  ");
					eleControlDivHolder.childNodes[0].rows[0].cells[0].style.display = 'block';
				}
			}
			targetTable.setAttribute("totalpages",maxPage);
		}



		var strOrderDir =  targetTable.getAttribute("orderdir");
		var strOrderBy =  targetTable.getAttribute("orderby");
		if(strOrderBy==null)
		{
			strOrderBy="msgdate";
			strOrderDir="DESC";
		}

		var strParams = "limitrowsperpage=" + intRPP + "&_pagenumber="+intPage+"&orderby="+strOrderBy+"&orderdir="+strOrderDir+"&mailboxtable=" + app._current_mailbox_prefix + "&mailboxfolderid=" + app._current_mailbox_folder
		var strURL = app.get_service_url("email/getmaillist","");
		var strData = app.get_http(strURL,strParams, true, false);


		var intRowCount = app.datatable_draw_data(targetTable, strData,false);
		if(intRowCount==0)
		{
			var strURL = app._workspacecontrolpath + "_views/mail/mailpreview.php";
			var targetDocument = app.getFrameDoc("iform_mail_" + app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
			if(targetDocument!=undefined)app.load_iform(strURL, targetDocument);
		}
		else
		{
			//-- select row 0 or current row index
			var oDataHolder = app.get_parent_child_by_id(targetTable,'div_data');
			var intSelectRowPos = 0;

			if(app._currentSelectedEmailRecord>0)
			{
				for(var x=0;x<oDataHolder.childNodes[0].rows.length;x++)
				{
					if(oDataHolder.childNodes[0].rows[x].getAttribute("keyvalue")==app._currentSelectedEmailRecord)
					{    
						oDataHolder.scrollTop = oDataHolder.childNodes[0].rows[x].offsetTop - 32;
						intSelectRowPos = x;
						break;
					}
				}
			}
			//-- select row
			if(oDataHolder.childNodes[0].rows[intSelectRowPos]!=undefined)	
			{
				app.mes_datarow_selected(oDataHolder.childNodes[0].rows[intSelectRowPos]);
			}
		}
		top.debugend("Load Email List For " +app._current_mailbox +":"+ app._current_mailbox_foldername,"EMAIL");

		strData = null;
	}

	function open_attachment(aLink)
	{
		var oF = document.getElementById("frm_viewfile");
		if(oF!=null)
		{
			document.getElementById("mailbox_").value = app._current_mailbox;
			document.getElementById("filesrc").value = aLink.getAttribute("fileid");
			document.getElementById("swsessionid").value = app._swsessionid;
			//var strURL = app._root  + app._workspacecontrolpath + 
			var strURL = "../../../workspace/_views/mail/viewfile.php";
			oF.setAttribute("action",strURL);

			//-- ie6 defect - have to open in new window otherwise kills session cookie (p3p??)
			if(app.isIE6)oF.setAttribute("target","_new");

			//-- submit
			oF.submit();
		
		}
		return false;
	}

	function _onshow()
	{
		var autoSelectMailboxID = app.getWcVar("selectmailboxname");
		app.getWcVar("selectmailboxname",undefined);
		if(autoSelectMailboxID!=undefined)
		{
			var eMBHolder = document.getElementById("div_mailboxes");
			if(eMBHolder!=null)
			{
				for(var x=0;x< eMBHolder.childNodes.length;x++)
				{
					if(app._current_mailbox_permissions[eMBHolder.childNodes[x].id.toLowerCase()]!=undefined)
					{
						if (autoSelectMailboxID.toLowerCase()==eMBHolder.childNodes[x].id.toLowerCase())
						{
							firstMailbox = eMBHolder.childNodes[x];
						}
					}
				}

				if(firstMailbox!=null)
				{
					load_mailbox_folder(firstMailbox);
				}
			}
		}
	}

	function initialise_outlook()
	{
		var eMBHolder = document.getElementById("div_mailboxes");
		if(eMBHolder!=null)
		{
			eMBHolder.innerHTML = _setup_mailbox_list();

			//-- get mail box perms
			app._email_getmailbox_permissions();

			var autoSelectMailboxID = app.getWcVar("selectmailboxname");
			app.getWcVar("selectmailboxname",undefined);
			var firstMailbox = null;
			for(var x=0;x< eMBHolder.childNodes.length;x++)
			{
				if(app._current_mailbox_permissions[eMBHolder.childNodes[x].id.toLowerCase()]!=undefined)
				{
					if(firstMailbox==null)
					{
						if(autoSelectMailboxID==undefined)
						{
							firstMailbox = eMBHolder.childNodes[x];
						}
						else if (autoSelectMailboxID.toLowerCase()==eMBHolder.childNodes[x].id.toLowerCase())
						{
							firstMailbox = eMBHolder.childNodes[x];
						}
					}
				}
				else
				{
					eMBHolder.childNodes[x].style.display = "none";
				}
			}

			if(firstMailbox!=null)
			{
				load_mailbox_folder(firstMailbox);
				app._email_poll_mailboxrefresh();
			}
		}
	}

	//--
	//-- handle context menu
	var _email_context_menu = null;
	function _email_folders_context_menu(eV)
	{
		app.stopEvent(eV);
		app.hide_application_menu_divs();


		var boolItems = false;

		var divHolder = document.getElementById("div_mailbox_folders");
		if(divHolder.popupmenu==undefined)
		{
			divHolder.popupmenu = app._new__popupmenu('_email_contextmenu',divHolder,_email_contextmenu_action);
		}

		//-- clear down existing items
		divHolder.popupmenu.hide();
		divHolder.popupmenu.reset();

		//-- show folder context menu based on selected folder
		if(app._email_checkright(app._EM_FOLDERCREATE,_mailbox_eSelectedDiv.id,false))
		{
			//-- add new folder option
			boolItems = true;
			divHolder.popupmenu.addmenuitem("addnewfolder", "New Folder", "", false);
		}
	
		if(app._current_mailbox_folder<6)
		{
			//-- system folders so allow add new
			if(app._current_mailbox_folder==4)
			{
				//-- deleted items so allow empty folder
				boolItems = true;
				divHolder.popupmenu.addmenuitem("emptydeleteditems", "Empty Deleted Items", "", false);
			}
			if(app._current_mailbox_folder==3)
			{
				//-- sent items so allow empty folder
				boolItems = true;
				divHolder.popupmenu.addmenuitem("emptysentitems", "Empty Sent Items", "", false);
			}

		}
		else
		{
			//-- not a sys folder so allow rename, delete 
			if(app._email_checkright(app._EM_FOLDERRENAME,_mailbox_eSelectedDiv.id,true))
			{
				//-- add "rename" folder option
				boolItems = true;
				divHolder.popupmenu.addmenuitem("renamefolder", "Rename Folder", "", false);
			}

			if(app._email_checkright(app._EM_FOLDERDELETE,_mailbox_eSelectedDiv.id,true))
			{
				//-- add "delete" folder option
				boolItems = true;
				divHolder.popupmenu.addmenuitem("deletefolder", "Delete Folder", "", false);
			}
		}

		//--
		//-- popup menu where mouse is at very top level		
		if(boolItems)
		{
			var arrPos = app.findMousePos(eV);
			divHolder.popupmenu.show(arrPos[0],arrPos[1]);
		}


		return false;
	}

	function _email_contextmenu_action(aNode)
	{
		_email_contextmenu_hide();
		var bFromRefresh=true;
		var strID = aNode.id;
		switch(strID)
		{
			case "addnewfolder":
				var strFolderName = prompt("Please enter a name for the new folder.","New Folder");
				if(strFolderName==undefined || strFolderName=="")return;
				//-- xmlmc to set folder name
				var xmlmc = app._new_xmlmethodcall();
				xmlmc.SetParam("mailbox", app._current_mailbox);
				xmlmc.SetParam("folderName", strFolderName);
				if(app._current_mailbox_folder>0)xmlmc.SetParam("parentFolderId", app._current_mailbox_folder);
				if(!xmlmc.Invoke("mail", "addFolder"))
				{
					alert("xmlmc mail:addFolder failed. Please contact your Administrator.\n\n" + xmlmc.GetLastError());
					return false;
				}

				break;
			case "deletefolder":
				if(!confirm("Are you sure you want to delete this folder and its contents?"))return false

				var xmlmc = app._new_xmlmethodcall();
				xmlmc.SetParam("mailbox", app._current_mailbox);
				xmlmc.SetParam("folderId", app._current_mailbox_folder);
				if(!xmlmc.Invoke("mail", "deleteFolder"))
				{
					alert("xmlmc mail:deleteFolder failed. Please contact your Administrator.\n\n" + xmlmc.GetLastError());
					return false;
				}
				bFromRefresh=false;
				break;
			case "renamefolder":

				var strFolderName = prompt("Please enter a new name for the folder.",app._current_mailbox_foldername);
				if(strFolderName==undefined || strFolderName=="")return;

				//-- xmlmc to set folder name
				var xmlmc = app._new_xmlmethodcall();
				xmlmc.SetParam("mailbox", app._current_mailbox);
				xmlmc.SetParam("folderId", app._current_mailbox_folder);
				xmlmc.SetParam("folderName", strFolderName);
				if(!xmlmc.Invoke("mail", "renameFolder"))
				{
					alert("xmlmc mail:renameFolder failed. Please contact your Administrator.\n\n" + xmlmc.GetLastError());
					return false;
				}
				break;
			case "emptysentitems":
			case "emptydeleteditems":
				if(!confirm("Are you sure you want to delete this folder and its contents?"))return false

				var xmlmc = app._new_xmlmethodcall();
				xmlmc.SetParam("mailbox", app._current_mailbox);
				xmlmc.SetParam("folderId", app._current_mailbox_folder);
				if(!xmlmc.Invoke("mail", "emptyFolder"))
				{
					alert("xmlmc mail:emptyFolder failed. Please contact your Administrator.\n\n" + xmlmc.GetLastError());
					return false;
				}
				bFromRefresh = false;
				break;

		}

	
		//-- refresh mailbox
		_refresh_selected_mailbox(bFromRefresh);
	}

	function _email_contextmenu_hide()
	{
		var divHolder = document.getElementById("div_mailbox_folders");
		if(divHolder.popupmenu!=undefined)divHolder.popupmenu.hide();
	}

	</script>
</head>
<body onload='initialise_outlook();' oncontextmenu="return app.stopEvent();" onclick='_email_contextmenu_hide();' onkeydown='return app._handle_portal_keystrokes(event);'>
<div class='div-title-top'>Available Mailboxes</div>
<div id='div_mailboxes'></div>
<div class='div-title-middle'>Browse <!--| <span id='sp_search'>Search</span>--></div>
<div id='div_mailbox_folders' oncontextmenu="return false;"></div>
<div id='div_mailbox_search'></div>

<iframe id='if_viewfile' name='if_viewfile' src="" style='display:none;width:0px;height:0px;'></iframe>
<form id='frm_viewfile' style="width:0px;height:0px;" method="POST" action="" target="if_viewfile">
<input type="hidden" name="sessiontoken" value='<?php echo $_SESSION['clienttoken'];?>'>
<input type="hidden" id='mailbox_' name="mailbox_"><input type="hidden" id='filesrc' name="filesrc">
<input type="hidden" name="swsessionid" id='swsessionid'></form>
</body>
</html>