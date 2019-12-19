<?php
	//-- check session
	$excludeTokenCheck=true;
	include("../../../../php/session.php");


?>
<html>
	<title>Select MultiClip</title>
	<link rel="StyleSheet" href="tree.css" type="text/css" />

	<style>
		*
		{
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
		}

		body
		{
			background-color:#dfdfdf;
		}

		#multiclip_tree
		{
			width:100%;
			height:100%;
			background-color:#ffffff;
			border-style:solid;
			border-width:1;
			border-color:#808080;
			overflow:auto;
			position:relative;
		}

	</style>

	<script>
		var undefined;
		if(window.dialogArguments!=undefined)
		{
			var info = window.dialogArguments;
		}
		else
		{
			var info = opener.__open_windows[window.name];
		}	
		var app = info.__app;
		var jqDoc = app.jqueryify(document); //-- so can use jquery
		//-- create tree object
		var multiclipTree;

		function rf()
		{
		}

		function process_mc_grouping(oGroupXML,strParentID)
		{
				var arrChildNodes = oGroupXML.childNodes;
				for(var x=0;x<arrChildNodes.length;x++)
				{
					var xmlChild = arrChildNodes[x];

					if(xmlChild.tagName=='multiClipItem')
					{
						var strID = app.xmlNodeTextByTag(xmlChild,"id");
						var strName = app.xmlNodeTextByTag(xmlChild,"name")
						multiclipTree.add(strID,strParentID,strName,rf,'','','treeimages/document1.gif','treeimages/document1.gif',false,true);
					}
					else if(xmlChild.tagName=='multiClipGroup')
					{
						var strGroupName = app.xmlNodeTextByTag(xmlChild,"name");
						var strUniqueGroupName = strGroupName+"_"+strParentID; //-- 91618 
						multiclipTree.add(strUniqueGroupName,strParentID,strGroupName,rf,'','','treeimages/folder.gif','treeimages/folderopen.gif',false);
						process_mc_grouping(xmlChild,strUniqueGroupName);
					}
				}

		}

		function process_multiclip_tree()
		{

			var bGroupMc = app.session.HaveRight(app.ANALYST_RIGHT_D_GROUP,app.ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE);
			var bPersonalMc = app.session.HaveRight(app.ANALYST_RIGHT_D_GROUP,app.ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE);

			//-- check permissions
			if(!bGroupMc && !bPersonalMc)
			{
				//-- cannot use mc at all
				document.Close();
				return false;
			}

			//-- get multiclip tree info
			var xmlmc = app._new_xmlmethodcall();
			if(xmlmc.Invoke("system", "multiClipGetTree"))
			{
				app._xml_multiclip_tree = xmlmc.xmlDOM;
			}

			var aDiv = document.getElementById("multiclip_tree");
			multiclipTree = app.newtree('multiclipTree',document);
			multiclipTree.controlid = aDiv.id;
			multiclipTree.dc = apply_multiclip;
			multiclipTree.add("ROOT","-1","MultiClip Selector",rf,'','','treeimages/folder.gif','treeimages/folderopen.gif',true);

			//-- get xmldom for group and personal mcs
			//-- process group mcs then personal
			if(bGroupMc)
			{
				multiclipTree.add("_MYG","ROOT","My Group",rf,'','','treeimages/folder.gif','treeimages/folderopen.gif',true);
				var arrGroupNodes = app._xml_multiclip_tree.getElementsByTagName("myGroupMultiClip");
				var xmlGroupNode = arrGroupNodes[0];
				process_mc_grouping(xmlGroupNode,"_MYG");
			}

			if(bPersonalMc)
			{
				multiclipTree.add("_MYP","ROOT","My Personal",rf,'','','treeimages/folder.gif','treeimages/folderopen.gif',true);
				var arrPersonalNodes = app._xml_multiclip_tree.getElementsByTagName("personalMultiClip");
				var xmlPersonalNode = arrPersonalNodes[0];
				process_mc_grouping(xmlPersonalNode,"_MYP");
			}
			
			//-- output tree
			aDiv.innerHTML = multiclipTree;
		}


		//-- callback function to log call form
		var o = new Object();
		o.selected = false;
		o.multiclipid = "";
		function apply_multiclip()
		{
			var oNode = multiclipTree.getSelectedNode();
			if(oNode!=undefined)
			{
				if(oNode.nodeonly)
				{
					//-- pass back info to calling function
					o.selected = true;
					o.multiclipid = oNode.id;

					app.__open_windows[window.name].returnInfo = o;
					self.close();
				}
			}
		}

		function form_close()
		{
			app.__open_windows[window.name].returnInfo = o;		
		}


	</script>

	<body onload="process_multiclip_tree();" onbeforeunload="form_close();"  onunload="app._on_window_closed(window.name)">
						<div id='multiclip_tree'></div>

	</body>
</html>