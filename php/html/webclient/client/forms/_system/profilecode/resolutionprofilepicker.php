<?php
	//-- problemprofilepicker.php
	//-- 1.0.0
	//-- \apps\system\forms\pickers\profilecode

	//-- given filter will display a tree of problem profiles typically called by lfc

	//-- this is used with call forms and javascipt method to allow analyst to pick a code.
	//-- will callback function and pass in selected code and text


	//-- check session
	$excludeTokenCheck=true;
	include("../../../../php/session.php");

	// Get full profile code list
	$xmlmcf = new swphpXmlMethodCall();
	$xmlmcf->SetParam("filter", $_REQUEST['filter']);
	$xmlmcf->SetParam("returnFulltree", true);
	$xmlmcf->Invoke("helpdesk","getResolutionCodeTree", true);
	$strJSON = $xmlmcf->xmlresult;

?>
<html>
	<title>Choose Profile</title>
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
		 textarea
		 {
			font-size:120%;
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
			font-size:105%;
		}
		.cb
		{
			border-style:none;
			background-color:#dfdfdf;
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

		function process_profile_tree()
		{
			var oJsonProfileCodesInfo = JSON.parse('<?php echo $strJSON;?>');
			var strInitCode = "<?php echo $_REQUEST['initcode'];?>";
			var aDiv = document.getElementById("profile_tree");

			profileTree = app.newtree('profileTree',document);
			profileTree.controlid = aDiv.id;
			profileTree.config.folderLinks = true; //-- folder behave link nodes when clicked
			profileTree.config.useCookies = false;
			profileTree.dc = apply_profile_code;
			profileTree.add("ROOT","-1","Resolution Profiles",select_profile_code,'','','treeimages/g-arrow-right.png','treeimages/g-arrow-right.png',true);

			
			 //-- load profile folders - get folders and then output tree control
			var arrXFolders = oJsonProfileCodesInfo.params.ResolutionChildNode;
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
			select_profile_code();
		}

		//-- load profile code information (sla, script, desc etc)
		function select_profile_code()
		{
			var eDesc = document.getElementById("profile.descx");
			var eCode = document.getElementById("profile.code");
			var eInfo = document.getElementById("profile.info");
			var eSLA = document.getElementById("profile.sla");
			var eScript = document.getElementById("profile.scriptname");
			var eFInfo = document.getElementById("flg.profile.info");
			var eFSLA = document.getElementById("flg.profile.sla");
			var eFScript = document.getElementById("profile.flags");

			if(eDesc!=null)eDesc.value = "";
			if(eCode!=null)eCode.value = "";
			if(eInfo!=null)eInfo.value = "";
			if(eSLA!=null)eSLA.value = "";
			if(eScript!=null)eScript.value = "";
			if(eFInfo!=null)
			{
				eFInfo.checked=false;
				eFInfo.disabled=true;
			}
			if(eFSLA!=null)
			{
				eFSLA.checked=false;
				eFSLA.disabled=true;
			}
			if(eFScript!=null)eFScript.checked = false;

			var strCode = profileTree.getSelectedNode().id;
			
			if(strCode!=""  && strCode!="ROOT")
			{
				//-- get profile code detail
				var strURL = app.get_service_url("profilecode/getresolutionprofile","");
				var strParams = "profilecode=" + strCode;
				app.get_http(strURL, strParams, true, true, profile_detail_loaded);
				
				//-- set description and code fields
				if(eDesc!=null)eDesc.value = profileTree.getNodeTextPath("->")
				if(eCode!=null)eCode.value = strCode;
			}
			else
			{
				if(eCode!=null)eCode.value = "";
			}
		}

		function profile_detail_loaded(oXML)
		{
		
			var rec = oXML.childNodes[0];
			for(var x=0;x<rec.childNodes.length;x++)
			{
				
				var aE = document.getElementById("profile."+rec.childNodes[x].tagName);
				if(aE!=null)
				{
					var strValue = app.xmlText(rec.childNodes[x]);
					//alert(strValue)
					app.setEleValue(aE,strValue);

					//-- check if has label and flag
					var bDis = (strValue!="")?false:true;
					var flagE = document.getElementById("flg." + aE.id);
					var labelE = document.getElementById("lbl." + aE.id);
					if(labelE!=null)
					{
						labelE.setAttribute("disabled",bDis);
					}
					if(flagE!=null)
					{
						//-- check default setting - 24.05.2011
						if(aE.id=="profile.info")
						{

							if(!app.session.IsDefaultOption(app.ANALYST_DEFAULT_AUTOFILLRESOLUTIONTEXT))
							{
								//-- not default option to select and use text so do not flag
								flagE.checked=false;			
							}
							else
							{
								//- -default is to use - but only check if we have data
								flagE.checked=(strValue!="")?true:false;			
							}
						}
						else
						{
							flagE.checked=(strValue!="")?true:false;			
						}
						flagE.setAttribute("disabled",bDis);
					}
				}
			}
			oXML = null;
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
			//-- pass back info
			var bUseInfo = document.getElementById("flg.profile.info").checked;
			var strInfo = (bUseInfo)?document.getElementById("profile.info").value:"";

			var eCode = document.getElementById("profile.code");
			
			// RF - 17-10-2017 - Profile code cannot be blanked out via XMLMC currently
			if(eCode.value != "" && eCode)
			{
				o.selected = true;

				
				o.code = eCode.value;

				o.codeDescription = profileTree.getNodeTextPath("->");
				o.description = strInfo;
				o.sla = "";
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
					<td>Profile :</td>
					<td colspan="3"><input type="text" id='profile.descx'></td>
				</tr>
				<tr>
					<td align="right" >Code :</td>
					<td width="100%"><input type="text" id='profile.code'></td>
				</tr>
			</table>
		</td></tr>
		<tr><td height="100%">
			<table height="100%" width="100%">
				<tr>
					<td>Browse Profiles</td>
					<td>Default Description</td>
				</tr>
				<tr>
					<td height="100%" width="50%" valign="top">
						<div id='profile_tree'></div>
					</td>
					<td height="100%" width="50%" valign="top">
						<table  width="100%" height="100%">
							<tr>
								<td  width="100%" height="99%" colspan="3" valign="top">
									<textarea id='profile.info' style='height:99%' readonly></textarea>
								</td>
							</tr>
							<tr>
								<td width="20px" noWrap>
									<input type='checkbox' class="cb" id='flg.profile.info'>
								</td>
								<td width="100%" colspan="2">
									<label id='lbl.profile.info' for="flg.profile.info" disabled disabled>Transfer this default description to the form</label>
								</td>
							</tr>
							<tr>
								<td colspan="3" align="right">
									<button onclick="apply_profile_code();">OK</button>&nbsp;&nbsp;<button onclick="self.close();">Cancel</button>
								</td>
							</tr>

						</table>
					</td>
				</tr>
			</table>
		</td></tr>
		</table>
	</body>
</html>