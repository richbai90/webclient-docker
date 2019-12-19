<?php
	//-- problemprofilechanger.php
	//-- 1.0.0
	//-- \apps\system\forms\pickers\profilecode

	//-- given currentcode and filter will display a tree of problem profiles typically called by call detail form in order to change profile code

	//-- check session
	$excludeTokenCheck=true;
	include("../../../../php/session.php");

	// Get full profile code list
	$xmlmcf = new swphpXmlMethodCall();
	$xmlmcf->SetParam("filter", $_REQUEST['filter']);
	$xmlmcf->SetParam("returnFulltree", true);
	$xmlmcf->Invoke("helpdesk","getProfileCodeTree", true);
	$strJSON = $xmlmcf->xmlresult;

?>
<html>
	<title>Change Profile</title>
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

		#profile_tree
		{
			width:100%;
			height:100%;
			background-color:#ffffff;
			border-style:solid;
			border-width:1;
			border-color:#808080;
			overflow:auto;
			position:relative;
			top:4;
		}

		input
		{
			width:100%;
			height:18px;
			border-style:solid;
			border-width:1;
			border-color:#808080;
			background-color:#dfdfdf;
		}
		button
		{
			width:60px;
		}
		td
		{
			font-size:85%;
		}
		label
		{
			font-size:90%;
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
		var profileTree;

		var process_profile_tree = function()
		{
			var oJsonProfileCodesInfo = JSON.parse('<?php echo $strJSON;?>');
			var strInitCode = "<?php echo $_REQUEST['initcode'];?>";
			
			var aDiv = document.getElementById("profile_tree");

			profileTree = app.newtree('profileTree',document);
			profileTree.controlid = aDiv.id;
			profileTree.config.folderLinks = true; //-- folder behave link nodes when clicked
			profileTree.config.useCookies = false;
			profileTree.dc = apply_profile_code;
			profileTree.add("ROOT","-1","Problem Profiles",select_profile_code,'','','treeimages/g-arrow-right.png','treeimages/g-arrow-right.png',true);

			
			 //-- load profile folders - get folders and then output tree control
			var arrXFolders = oJsonProfileCodesInfo.params.ProfileChildNode;
			arrXFolders.sort(function (a, b) {
				return a.name.localeCompare(b.name);
			});
			
			for(var x=0; x < arrXFolders.length;x++)
				addNode(arrXFolders[x].code, arrXFolders[x].name);
			
			function addNode(nodeID, nodeName, notActive)
			{
				notActive = (typeof notActive !== 'undefined') ? notActive : false
				// Get the display name for branch 
				var arrText = nodeName.split("->");				
				var strText = arrText.pop();
				
				// Get the parent node ID
				var arrInfo = nodeID.split("-");
				arrInfo.pop();
				var parentNodeID = arrInfo.join("-");				
				if(parentNodeID=="")parentNodeID = "ROOT";
				
				// If parent does not exist we need to add it
				if(!profileTree.getNodeByID(parentNodeID)) {
					var _arrInfo = parentNodeID.split("-");
					var _nodeID = parentNodeID;
					_arrInfo.pop();
					var _nodeName = arrText.join("->");
					addNode(_nodeID, _nodeName, true);
				} 		

				profileTree.add(nodeID,parentNodeID,strText,(notActive) ? null : select_profile_code,'','',(notActive) ? 'treeimages/small-no-entry.png' : 'treeimages/g-arrow-right.png',
						(notActive) ? 'treeimages/small-no-entry.png' : 'treeimages/g-arrow-right.png',false,true);
			}
			
			//-- output tree
			aDiv.innerHTML = profileTree;
			oJsonProfileCodesInfo = null;

			//-- highlight current code

			var currCodePos = profileTree.getNodePositionByID(info.__recordkey);
			if(currCodePos!=-1)	profileTree.openTo(currCodePos,true,true,false);
		}

		//-- load profile code information
		function select_profile_code()
		{
			var eCode = document.getElementById("profile.code");
			var strCode = profileTree.getSelectedNode().id;
			
			if(strCode!="" && strCode!="ROOT")
			{
				//-- set description and code fields
				eCode.value = strCode;
			}
			else
			{
				eCode.value="";
			}
		}

		//-- callback function to log call form
		var o = new Object();
		o.selected = false;
		o.code = "";
		o.codeDescription = "";
		o.description = "";
		o.sla = "";
		o.operatorScriptId = 0;
		function apply_profile_code()
		{
			// If a deactivated code is selected return back to dialog
			if(profileTree.getSelectedNode().icon == "treeimages/small-no-entry.png") {
				alert( "You cannot use this code");
				return;
			}

			//-- pass back info to calling function
			var eCode = document.getElementById("profile.code");

			// RF - 17-10-2017 - Profile code cannot be blanked out via XMLMC currently
			if(o.code = eCode.value != "")
			{
				o.selected = true;
				o.code = eCode.value;
				o.codeDescription = profileTree.getNodeTextPath("->");
				o.description = "";
				o.sla = "";
				o._additional_slaid = "";
				o._additional_slaname = "";
				o.operatorScriptId = 0;
			}
			app.__open_windows[window.name].returnInfo = o;
	
			self.close();
		}

		function form_close()
		{
		
			app.__open_windows[window.name].returnInfo = o;
		}


	</script>

	<body onload="process_profile_tree();" onbeforeunload="form_close();"  onunload="app._on_window_closed(window.name)">
		<table width="100%" height="100%">
		<tr><td>
			<table width="100%">
				<tr>
					<td width="50%"><label>Current Code :</label><br>
					<input type="text" value="<?php echo $_REQUEST['initcode'];?>"></td>
					<td  width="50%"><label>Change To :</label><br>
					<input type="text" id='profile.code'></td>
				</tr>
			</table>
		</td></tr>
		<tr><td height="100%">
			<table height="100%" width="100%">
				<tr>
					<td><label>Select a profile from the tree below</label></td>
				</tr>
				<tr>
					<td height="100%" width="100%" valign="top">
						<div id='profile_tree'><br><br><center>... loading ...</center></div>
					</td>
				</tr>
				<td align="right"><br><button onclick="apply_profile_code();">OK</button>&nbsp;&nbsp;<button onclick="self.close();">Cancel</button></td>
				</tr>
			</table>
		</td></tr>
		</table>
	</body>
</html>