<?php

//-- reports view
include('../../../../php/session.php');
?>

<html>
<head>
<link rel="StyleSheet" href="tree.css" type="text/css" />
<link rel="StyleSheet" href="mylibrary.css" type="text/css" />
<script>

	var undefined;
	var app = (opener)?opener:top;
	var jqDoc = app.jqueryify(document); //-- so can use jquery	
	
	var libTree;

	//-- get folders for given path and add to the tree
	function _load_folder_xml(strPath,strTreeParentId)
	{
		var bRoot = (strPath =="/");
		var xmlmc = new app._new_xmlmethodcall();
		if(strPath!=undefined) xmlmc.SetParam('path',strPath);
		xmlmc.SetParam('includeFiles',false);
		if(xmlmc.Invoke("mylibrary","getFolder"))
		{
			var arrFolder = xmlmc.xmlDOM.getElementsByTagName("folder");
			for(var x=0;x<arrFolder.length;x++)
			{
				var strDisplay = app.xmlNodeTextByTag(arrFolder[x],"name");
				var bHasChildren = (app.xmlNodeTextByTag(arrFolder[x],"hasChildFolders")=="true");
				var strFolderID = strTreeParentId + "_" + app.string_replace(strDisplay,"-","");
				
				//-- if already exists do not add (i.e. refreshing folder after adding new one)
				if(libTree.getNodeByID(strFolderID)==null)
				{
					var anode = libTree.add(strFolderID,strTreeParentId,strDisplay,load_library_info,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,!bHasChildren);
					anode._hc=bHasChildren;
					anode._url = null;
					anode.openedclosed = folder_expanded_or_collapsed;
					anode._virtualpath = strPath + "/" + strDisplay;
					anode._bVirtualPath = (app.xmlNodeTextByTag(arrFolder[x],"virtualFolder")=="true");
				}
			}
		}

		document.getElementById("div_folders").innerHTML = libTree.toString();
		app.SwMyLibrary.treeControl = libTree;
	}

	function _load_resources_list()
	{
		var strTreeParentId = "_mr";
		var xmlmc = new app._new_xmlmethodcall();
		if(xmlmc.Invoke("mylibrary","getUserLibraryResources"))
		{
			var arrRes = xmlmc.xmlDOM.getElementsByTagName("resource");
			for(var x=0;x<arrRes.length;x++)
			{
				var strDisplay = app.xmlNodeTextByTag(arrRes[x],"name");
				var strUrl = app.xmlNodeTextByTag(arrRes[x],"url");
				var strFolderID = strTreeParentId + "_" + app.string_replace(strDisplay,"-","");
				
				//-- if already exists do not add (i.e. refreshing folder after adding new one)
				if(libTree.getNodeByID(strFolderID,"_mr")==null)
				{
					var anode = libTree.add(strFolderID,strTreeParentId,app.pfx(strDisplay),load_webpage,'','','treeimages/globe.gif','treeimages/globe.gif',false,false);
					anode._url = strUrl;
				}
			}
		}

		document.getElementById("div_folders").innerHTML = libTree.toString();
		app.SwMyLibrary.treeControl = libTree;
	}

	//-- return xmldom of files and folder for given path
	function _get_folder_tablexml(strPath)
	{
		var bRoot = (strPath =="/");
		var xmlmc = new app._new_xmlmethodcall();
		xmlmc.SetParam('path',strPath);
		xmlmc.SetParam('includeFiles',true);
		if(xmlmc.Invoke("mylibrary","getFolder"))
		{
			return xmlmc.xmlDOM;
		}
		return null;
	}

	//-- inti the lib tree
	function init_library_tree()
	{
		//-- init tree control
		libTree = null;
		var oE = document.getElementById("div_folders");
		if(oE!=null)oE.innerHTML = "";
	
		libTree = app.newtree('libTree',document);
		libTree.config.inOrder = false;
		libTree.controlid = "div_folders";
		libTree.config.folderLinks = true; //-- folder behave link nodes when clicked
		libTree.config.useCookies = false;

		//
		//-- load root items - 89839 - use server name
		libTree.add("0","-1","<b>"+app.server+"</b>",load_library_info,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,false);
		libTree.add("_mr","-1","<b>My Resources</b>",load_resource_table,'','treeimages/folder.gif','treeimages/folderopen.gif',false,false);

		_load_folder_xml("/","0");
		_load_resources_list();
	}

	function rf(){}

	//-- folder has been collapsed or expanded
	function folder_expanded_or_collapsed(aNode,strControlID)
	{
		app.SwMyLibrary.hideContextMenu();

		var selectedPath = libTree.getNodePath("-",libTree.getSelectedNode());
		var currExpandCollapsePath = libTree.getNodePath("-",aNode);
		
		//-- expand folder and see if they have any children
		if(aNode._io)
		{	
			_load_folder_xml(aNode._virtualpath,aNode.id)
			var currSelNode = libTree.getNodeByPath(selectedPath);
			var expNode = libTree.getNodeByPath(currExpandCollapsePath);
			if(expNode!=null)
			{
				libTree.OpenNode(expNode,true);
				if(currSelNode)libTree.hilite(currSelNode,true);
			}
		}
		else
		{
			//-- collapse - check if need to select parent as collapsing parent of selected node
			if(selectedPath.indexOf(currExpandCollapsePath)==0)
			{
				libTree.s(aNode,true, undefined,true);
			}
		}
	}

	//-- called when a library folder is clicked
	function load_library_info(aNode)
	{
		app.SwMyLibrary.hideContextMenu();
		app.SwMyLibrary.rowSelected = null;
		app.SwMyLibrary.virtualPath = aNode._virtualpath;
		app.SwMyLibrary.boolVirtualPath = aNode._bVirtualPath;
		app.SwMyLibrary.selectedTreeNode = aNode;

		var targetTable = app.oWorkspaceFrameHolder.getElement(top._CurrentOutlookID);
		if(targetTable == null) return;

		//-- get file and folder list
		var strData = "";
		var tableXML = _get_folder_tablexml(aNode._virtualpath);
		if(tableXML!=null)
		{
				var arrFolder = tableXML.getElementsByTagName('folder');
				var arrFiles = tableXML.getElementsByTagName('file');

				//-- process folders
				for(var x=0;x<arrFolder.length;x++)
				{
					var strDisplay = app.xmlNodeTextByTag(arrFolder[x],"name");
					var strPath = aNode._virtualpath +"/" + strDisplay;
					var strDate = app.xmlNodeTextByTag(arrFolder[x],"modified");

					var strDataRow = "<td noWrap ><div>" + strDisplay + "</div></td>";
					strDataRow += "<td noWrap ><div></div></td>";
					strDataRow += "<td noWrap ><div>File Folder</div></td>";
					strDataRow += "<td noWrap ><div>"+strDate+"</div></td>";

					strData += "<tr type='sys' path='"+ strPath + "' filename='" +strDisplay + "' filetype='dir' onclick='app.SwMyLibrary.filelistSelected(this,event);' ondblclick='app.SwMyLibrary.openResource(this,event);'>" + strDataRow + "</tr>";
				}

				//-- process files
				for(var x=0;x<arrFiles.length;x++)
				{
					var strDisplay = app.xmlNodeTextByTag(arrFiles[x],"name");
					var arrDisplay = strDisplay.split(".");

					var strPath = aNode._virtualpath +"/" + strDisplay;
					var strDate = app.xmlNodeTextByTag(arrFiles[x],"modified");
					var strSize = app.xmlNodeTextByTag(arrFiles[x],"size");

					var strDataRow = "<td noWrap ><div>" + app.unpfx(strDisplay) + "</div></td>";
					strDataRow += "<td noWrap ><div>"+ app.getByteSize(strSize)+"</div></td>";
					strDataRow += "<td noWrap ><div>" + arrDisplay[arrDisplay.length-1].toUpperCase() + "</div></td>";
					strDataRow += "<td noWrap ><div>"+strDate+"</div></td>";

					strData += "<tr type='sys' path='"+ strPath + "' filename='" +strDisplay + "' filetype='file' onclick='app.SwMyLibrary.filelistSelected(this,event);' ondblclick='app.SwMyLibrary.openResource(this,event);'>" + strDataRow + "</tr>";
				}

				//-- load child items ready for any further user action
				if(!aNode._io)
				{
					//-- store current path
					var currExpandPath = libTree.getNodePath("-",aNode);

					_load_folder_xml(aNode._virtualpath,aNode.id)

					var expNode = libTree.getNodeByPath(currExpandPath);
					if(expNode!=null)
					{
						//expNode.tree.OpenNode(expNode,true);
						expNode.tree.hilite(expNode,true);
					}				
				}

		}
		//-- output values
		targetTable.style.display = "block";
		app.datatable_draw_data(targetTable, strData,false);
		app.set_right_title(app.server+"\\" + app.unpfx(libTree.getNodeTextPath("\\")));
	}

	//--
	//-- called when a my resource is clicked
	function load_webpage(aNode)
	{
		app.SwMyLibrary.hideContextMenu();

		var targetTable = app.oWorkspaceFrameHolder.getElement(top._CurrentOutlookID);
		if(targetTable == null) return;

		targetTable.style.display = "none";

		try
		{

			window.open(aNode._url,app.global.GetCurrentEpocTime(),"toolbar=no,directories=no,status=yes,menubar=no");				
			app.set_right_title("My Resources\\" + app.unpfx(libTree.getNodeTextPath("\\")));
		}
		catch (e)
		{
			alert("The web resource appears to be invalid. Please contact your Administrator.");
		}
	}
	
	//--
	//-- display items in table
	function load_resource_table(aNode)
	{
		app.SwMyLibrary.hideContextMenu();
		app.SwMyLibrary.rowSelected = null;
		app.SwMyLibrary.virtualPath = "";
		app.SwMyLibrary.boolVirtualPath = false;
		app.SwMyLibrary.selectedTreeNode = aNode;

		var targetTable = app.oWorkspaceFrameHolder.getElement(top._CurrentOutlookID);
		if(targetTable == null) return;

		var strData = "";
		var fileType = "URL";

		//-- for each child node create row 
		var arrChildren = libTree._getChildrenArray(aNode);
		for(nodeId in arrChildren)
		{
			var strChildNodeName = arrChildren[nodeId].name;

			var strDataRow = "<td noWrap ><div><pre>" + strChildNodeName + "</pre></div></td>";
			strDataRow += "<td noWrap ><div></div></td>";
			strDataRow += "<td noWrap ><div>"+fileType+"</div></td>";
			strDataRow += "<td noWrap ><div>01/01/1970 00:00</div></td>";

			strData += "<tr type='sys' path='"+ strChildNodeName + "' filename='" + strChildNodeName + "' filetype='url' onclick='app.SwMyLibrary.filelistSelected(this,event);' ondblclick='app.SwMyLibrary.openwww(this,event);'>" + strDataRow + "</tr>";
		}

		targetTable.style.display = "block";
		app.datatable_draw_data(targetTable, strData,false);
		app.set_right_title("My Resources");
	}


	function _getDoc()
	{
		return document;
	}

	function _getFileForm()
	{
		return document.getElementById("frm_viewfile");
	}


	function initialise_outlook()
	{
		init_library_tree();
		_resize_div_folders(15)
	}

	function _resize_div_folders(iWidthAdj)
	{
		
		var oE = document.getElementById("div_folders");
		if(oE!=null)
		{
			oE.style.width = document.body.clientWidth;
			if(app.isIE)
			{
				oE.style.height = document.body.clientHeight;
			}
			else
			{
				oE.style.height = document.body.clientHeight-20;
			}
		}
	}

</script>
</head>
<body onload='initialise_outlook();' onmousedown="app.hide_application_menu_divs();" oncontextmenu="return app.stopEvent();" onresize="_resize_div_folders(0)" onkeydown="return app._handle_portal_keystrokes(event);">
<div id='div_folders'><br><center>...Loading...</center></div>
<iframe id='if_viewfile' name='if_viewfile' src="" style='position:absolute;display:none;width:200px;height:100px;'></iframe>
<form id='frm_viewfile' style="width:0px;height:0px;" method="POST" action="" target="if_viewfile">
<input type="hidden" name="sessiontoken" value='<?php echo $_SESSION['clienttoken'];?>'>
<input type="hidden" id='filepath' name="filepath"><input type="hidden" name="filename" id='filename'>
</form>
</body>
</html>
