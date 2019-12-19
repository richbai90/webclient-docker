<?php

	//-- check session
	$excludeTokenCheck=true;
	include("../../../../php/session.php");
?>

<html>
	<link rel="StyleSheet" href="tree.css" type="text/css" />
	<style>
		.hibNavigationIL
		{
			width: 16px; height: 16px;
			background: url(hibimages/pcinventory.bmp);
			background-position: 0 0; 
		}
	</style>
<script>
		var app = top.app;
		var jqDoc = app.jqueryify(document); //-- so can use jquery

		//-- create hib tree
		var _hibTree = null;		
		function _create_hib_tree(oTargetBody)
		{
			_hibTree = app.newtree(oTargetBody.id,app.getEleDoc(oTargetBody));
			_hibTree.controlid = oTargetBody.id;
			_hibTree.config.folderLinks = true; //-- folder behave link nodes when clicked
			_hibTree.config.useCookies = false;
			_hibTree.IconImageList = "hibNavigationIL";

			var xmlTreeItems = top.oHibXML.getElementsByTagName("TreeItem");
			for(var x=0;x<xmlTreeItems.length;x++)
			{
				//-- get display and parse out %something% is one of the possible passed in params
				var strDisplay = top.replace_aw_vars(xmlTreeItems[x].getAttribute("display"));
				xmlTreeItems[x].setAttribute("treeid",x);

				//-- get image pos
				var imagePos = xmlTreeItems[x].getAttribute("image");
				if(imagePos=="1")imagePos="0";

				//-- set parent id
				var parentID = xmlTreeItems[x].parentNode.getAttribute("treeid");
				if(parentID==null)parentID=-1;

				_hibTree.add(x,parentID,strDisplay,_select_hib_tree_item,'','',imagePos,imagePos,false,(parentID!=-1));
			}
			
			//-- output tree
			oTargetBody.innerHTML = _hibTree;

			_hibTree.s(0,true);
		}

		function _select_hib_tree_item(oNode)
		{
			var xmlTreeItems = top.oHibXML.getElementsByTagName("TreeItem");
			var xmlTreeItem = xmlTreeItems[oNode.id];
			if(xmlTreeItem)
			{
				top._set_hib_view_title(_hibTree.getNodeTextPath("\\"));

				for(var x=0;x<xmlTreeItem.childNodes.length;x++)
				{
					if(xmlTreeItem.childNodes[x].tagName && xmlTreeItem.childNodes[x].tagName=="Url")
					{
						var strURL = top.app.xmlText(xmlTreeItem.childNodes[x]);
						strURL = top.replace_aw_vars(strURL);
						top.document.frames['_content'].location.href = strURL;
					}
				}
			}
		}
</script>
	<body onload='_create_hib_tree(document.getElementById("_hibTree"));'><div id='_hibTree'></div></body>
</html>