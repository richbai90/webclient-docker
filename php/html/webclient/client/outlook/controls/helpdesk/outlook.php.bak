<?php

	//--
	//-- nwj - load helpdesk xml definition file and create outlook control 
	include('../../../../php/session.php');

?>
<html>
<head>
	<link rel="StyleSheet" href="tree.css" type="text/css" />
</head>
<script src='../common.outlook.js'></script>


	<script type="text/javascript">

		var app = (opener)?opener:top;
		var jqDoc = app.jqueryify(document); //-- so can use jquery
		
		function rf()
		{
			return false;
		}

		function _reload_helpdesk_tree()
		{
			d.removeAllNodes();
			jqDoc.find("#dtree").children().remove();
			_draw_helpdesk_tree();
		}


		var d; 
		var strControlID ="<?php echo htmlspecialchars($_REQUEST['controlid']);?>"; 
		//--
		//-- draw tree using store application helpdesk tree
		function _draw_helpdesk_tree()
		{
			d = null;
			d = app.newtree('d',document);
			d.controlid = strControlID;
			d.config.folderLinks = true; //-- folder behave link nodes when clicked
			d.config.useCookies = false;
			d.ondropelement = app._servicedesk_drop_assignment;


			//-- create helpdesk root element
			var strRootTxt = app.dd.GetGlobalParamAsString("views/helpdesk view/team view/name");
			if(strRootTxt == "")strRootTxt = "Supportworks Helpdesk";
			var strRootImage = "treeimages/helpdesk/servicedesk.png";
			var strRootOpenImage = "treeimages/helpdesk/servicedesk.png";
			var aNode = d.add("swhd",-1,"<b>"+strRootTxt+"</b>",app._servicedesk_tree_selection,strRootTxt,"",strRootImage,strRootOpenImage,true);
			aNode._key = "swhd";

			//-- process groups
			var strGroupImage = "treeimages/helpdesk/suppgroup.png";
			var strGroupOpenImage = "treeimages/helpdesk/suppgroup.png";
			var arrGroupData = app._xml_helpdesk_view_tree.getElementsByTagName("group");
			var arrGroupData = arrGroupData[0].getElementsByTagName("group");
			for(var x=0;x<arrGroupData.length;x++)
			{
				var xmlGroup = arrGroupData[x];
				
				//-- determine parent id
				var parentNode = xmlGroup.parentNode;
				if(parentNode.tagName.toLowerCase()!="group")
				{
					//-- top level group
					var strParentID = "swhd";
				}
				else
				{
					//-- we are a child group to get parent id
					var strParentID = app.xmlNodeTextByTag(parentNode,"id");
					if(strParentID=="/")
					{
						strParentID="swhd";
					}
					else
					{
						strParentID = "grp_" + strParentID;
					}
				}

				//-- add the group
				var strGroupKey = app.xmlNodeTextByTag(xmlGroup,"id");
				var strGroupTxt = app.xmlNodeTextByTag(xmlGroup,"name");
				var aNode = d.add("grp_" + strGroupKey,strParentID,"<b>"+strGroupTxt+"</b>",app._servicedesk_tree_selection,strGroupTxt,"",strGroupImage,strGroupOpenImage,false);
				aNode._suppgroup = strGroupKey;
			}

			//-- process analysts
			var strAnalystImage = "treeimages/helpdesk/swanalyst.png";
			var strAnalystOpenImage = "treeimages/helpdesk/swanalyst.png";
			var arrAnalystData = app._xml_helpdesk_view_tree.getElementsByTagName("analyst");
			for(var x=0;x<arrAnalystData.length;x++)
			{
				var xmlAnalyst = arrAnalystData[x];

				//-- determine parent id
				var parentNode = xmlAnalyst.parentNode;
				if(parentNode.tagName.toLowerCase()!="group")
				{
					//-- top level analysts
					var strParentID = "swhd";
					var suppg = "swhd"
				}
				else
				{
					//-- we are a child group to get parent id
					var strParentID = "grp_" + app.xmlNodeTextByTag(parentNode,"id");
					var suppg = app.xmlNodeTextByTag(parentNode,"id");
				}

				//-- add the analyst
				var strAnalystKey = app.xmlNodeTextByTag(xmlAnalyst,"id");
				var strAnalystTxt = app.xmlNodeTextByTag(xmlAnalyst,"name");
				var aNode = d.add(strAnalystKey,strParentID,strAnalystTxt,app._servicedesk_tree_selection,strAnalystTxt,"",strAnalystImage,strAnalystOpenImage,false,true);
				aNode._suppgroup = suppg;
			}

			if(app._xml_helpdesk_view_3p_tree!=null)
			{
				//-- process 3rd party - if enabled
				var strRootTxt = "3rd Party Suppliers";
				var strRootImage = "treeimages/helpdesk/servicedesk.png";
				var strRootOpenImage = "treeimages/helpdesk/servicedesk.png";
				d.add("_THIRDPARTY",-1,"<b>"+strRootTxt+"</b>",app._servicedesk_tree_selection,strRootTxt,"",strRootImage,strRootOpenImage,true);

				//-- process 3p
				var strGroupImage = "";
				var strGroupOpenImage = "";
				var arrGroupData = app._xml_helpdesk_view_3p_tree.getElementsByTagName("contract");
				for(var x=0;x<arrGroupData.length;x++)
				{
					var xmlGroup = arrGroupData[x];

					//-- determine parent id
					var parentNode = xmlGroup.parentNode;
					if(parentNode.tagName.toLowerCase()!="contract")
					{
						//-- top level group
						var strParentID = "_THIRDPARTY";
					}
					else
					{
						//-- we are a child group to get parent id
						var strParentID = app.xmlNodeTextByTag(parentNode,"id");
					}

					//-- add the group
					var strGroupKey = app.xmlNodeTextByTag(xmlGroup,"id");
					var strGroupTxt = app.xmlNodeTextByTag(xmlGroup,"name");
					d.add(strGroupKey,strParentID,"<b>"+strGroupTxt+"</b>",app._servicedesk_tree_selection,strGroupTxt,"",strGroupImage,strGroupOpenImage,false);
				}

				//-- process analysts
				var strAnalystImage = "";
				var strAnalystOpenImage = "";
				var arrAnalystData = app._xml_helpdesk_view_3p_tree.getElementsByTagName("sla");
				for(var x=0;x<arrAnalystData.length;x++)
				{
					var xmlAnalyst = arrAnalystData[x];

					//-- determine parent id
					var parentNode = xmlAnalyst.parentNode;
					if(parentNode.tagName.toLowerCase()!="contract")
					{
						//-- top level analysts
						var strParentID = "_THIRDPARTY";
					}
					else
					{
						//-- we are a child group to get parent id
						var strParentID = app.xmlNodeTextByTag(parentNode,"id");
					}

					//-- add the analyst
					var strAnalystKey = app.xmlNodeTextByTag(xmlAnalyst,"id");
					var strAnalystTxt = app.xmlNodeTextByTag(xmlAnalyst,"name");
				
					var aNode = d.add(strAnalystKey,strParentID,strAnalystTxt,app._servicedesk_tree_selection,strAnalystTxt,"",strAnalystImage,strAnalystOpenImage,false,true);
					aNode._suppgroup = strParentID; 
				}
			}

			//-- output tree control
			document.getElementById("dtree").innerHTML = d;
			
			//-- call ontreeloaded event
			app.servicedesk_tree_loaded(d);
			app._helpdesk_view_tree_reload = false;
		}
	</script>

<body onload='_draw_helpdesk_tree();' oncontextmenu="return app.stopEvent();"  onmousedown="app.hide_application_menu_divs();" onkeydown="return app._handle_portal_keystrokes(event);" >
<div id='dtree' class="dtree">
</div>
</body>
</html>