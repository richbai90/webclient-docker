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
	$xmlmcf->Invoke("helpdesk","getProfileCodeTree", true);
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
			if(eFScript!=null)eFScript.checked=false;


			var strCode = profileTree.getSelectedNode().id;

			if(strCode!="" && strCode!="ROOT")
			{
				//-- get profile code detail
				var strURL = app.get_service_url("profilecode/getproblemprofile");
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
	
					//-- htl 86465 - enable execute script flag if not set to force execute
					if(aE.id=="profile.flags")
					{
						if(strValue=="1")
						{
							aE.setAttribute("disabled",true);
						}
						else
						{
							aE.removeAttribute("disabled");
						}
						aE.checked=true;
					}
					else if(aE.id=="profile.sid")
					{
						//-- htl 86465 - get script name
						if(strValue!="")
						{
							var oRs = app._new_SqlQuery();
							if(oRs.WebclientStoredQuery("system/getProfileCodeScriptName","sid=" + strValue) && oRs.Fetch())
							{
								document.getElementById("profile.scriptname").value = oRs.GetValueAsString("scriptname");
							}
						}
						app.setEleValue(aE,strValue);
					}
					else if(aE.id=="profile.scriptname")
					{
						//-- do nothing as set using sid
					}
					else
					{
						app.setEleValue(aE,strValue);
					}

					//-- check if has label and flag
					var bDis = (strValue!="")?false:true;
					var flagE = document.getElementById("flg." + aE.id);
					var labelE = document.getElementById("lbl." + aE.id);
					if(labelE!=null)
					{
						if(bDis)
						{
							labelE.setAttribute("disabled",bDis);
						}
						else
						{
							labelE.removeAttribute("disabled");
						}
					}
					if(flagE!=null)
					{
						//-- check default setting - 24.05.2011
						if(aE.id=="profile.info")
						{
							if(!app.session.IsDefaultOption(app.ANALYST_DEFAULT_AUTOFILLPROBLEMTEXT))
							{
								//- -not default option to select and use text so do not flag
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

						if(bDis)
						{
							flagE.setAttribute("disabled",bDis);
						}
						else
						{
							flagE.removeAttribute("disabled");
						}
					}
				}
			}

			
			//-- check if we have itsm sla id to retrieve
			o._additional_slaid = "";
			o._additional_slaname = "";

			var eITSMsla = document.getElementById("profile.itsm_sla");
			if(eITSMsla!=null)
			{
				//-- have itsm sla info o get
				if(eITSMsla.value>0 && app.CPGetItsmSlaNameSqlStatement)
				{
					o._additional_slaid = eITSMsla.value;
					if(app.CPGetItsmSlaNameSqlStatement)
					{
						//-- we have function defined to get itsm sla name - so get name
						var strSlaNameSql = app.CPGetItsmSlaNameSqlStatement(eITSMsla.value, "itsm_slaname");
						var oRs = app._new_SqlQuery();
						if(oRs.Query(strSlaNameSql,"swdata") && oRs.Fetch())
						{
							o._additional_slaname = oRs.GetValueAsString("itsm_slaname");
						}
					}
				}
			}
			

			//-- set combinied slaname and priority (if available)
			var ePriority = document.getElementById("profile.sla");
			var eSLANAME = document.getElementById("_slaname");
			if(eSLANAME!=null && ePriority != null)
			{
				var strSlaDisplayName = o._additional_slaname;
				if(strSlaDisplayName!="" && ePriority.value!="")
				{
					strSlaDisplayName += " ("+ ePriority.value +")";
				}
				else
				{
					strSlaDisplayName = ePriority.value;
				}
				
				eSLANAME.value = strSlaDisplayName;
				ePriority.value = strSlaDisplayName;
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
		o.profilesla = "";
		o._additional_slaid = "";
		o._additional_slaname = "";
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

			var bUseSLA = document.getElementById("flg.profile.sla").checked;
			var strSLA = (bUseSLA)?document.getElementById("profile.sla").value:"";

			var bRunOS = document.getElementById("profile.flags").checked;
			var intScriptID = (bRunOS)?document.getElementById("profile.sid").value:0;
			
			var eCode = document.getElementById("profile.code");
			
			// RF - 17-10-2017 - Profile code cannot be blanked out via XMLMC currently
			if(eCode.value != "")
			{
				o.selected = true;
				o.code = eCode.value;

				o.codeDescription = profileTree.getNodeTextPath("->");
				o.description = strInfo;
				o.sla = strSLA;
				o.profilesla = document.getElementById("profile.sla").value; //-- pass back so can use for alt coding
				o.operatorScriptId = intScriptID;
			}			
			app.__open_windows[window.name].returnInfo = o;

			self.close();
		}

		function form_close()
		{
			app.__open_windows[window.name].returnInfo = o;
			
		}


	</script>

	<body onload="process_profile_tree();"  onbeforeunload="form_close();" onunload="app._on_window_closed(window.name)">
		<table width="100%" height="100%">
		<tr><td>
			<table width="100%">
				<tr>
					<td>Profile&nbsp;:</td>
					<td colspan="3"><input type="text" id='profile.descx'></td>
				</tr>
				<tr>
					<td align="right" >Code&nbsp;:</td>
					<td width="60%"><input type="text" id='profile.code'></td>
					<td align="right">SLA&nbsp;:</td>
					<td width="40%"><input type="text" id='_slaname'></td>
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
						<div id='profile_tree'><br><br><center>... loading ...</center></div>
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
									<label id='lbl.profile.info' for="flg.profile.info" disabled>Transfer this default description to the form</label>
								</td>
							</tr>
							<tr>
								<td width="20px" align="left" noWrap>
									<input type='checkbox' class="cb" id="flg.profile.sla">
								</td>
								<td width="100%" colspan="2">
									<label id='lbl.profile.sla' for="flg.profile.sla" disabled>Apply the priority of this profile to the form</label>
								</td>
							</tr>
							<tr>
								<td width="20px" align="left" noWrap>
									<input type='checkbox' class="cb" id="profile.flags" disabled>
								</td>
								<td width="120px" noWrap>
									<label id='lbl.profile.flags' for="profile.flags" disabled>Execute operator script</label>
								</td>
								<td width="100%">
									<input type='text' disabled id="profile.scriptname">
									<input type='hidden' disabled id="profile.sid">
									<input type='hidden' disabled id="profile.itsm_sla">
									<input type="hidden" disabled id='profile.sla'>
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