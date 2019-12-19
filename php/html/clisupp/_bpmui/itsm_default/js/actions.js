/**
 * $Id: Actions.js,v 1.39 2013-01-16 08:40:17 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi)
{
	this.editorUi = editorUi;
	this.actions = new Object();
	this.init();
};

/**
 * Adds the default actions.
 */
Actions.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;

	this.addAction('print', function() 
	{ 
		var pageCount = mxUtils.prompt('How many pages would you like to scale the process to?', '1');

		if (pageCount != null)
		{
		  var scale = mxUtils.getScaleForPageCount(pageCount, graph);
		  var preview = new mxPrintPreview(graph, scale);
		  preview.open();
		}
	}, null, null, '');
	//-- sw bmp ui actions
	this.addAction('editworkflow', function() 
		{ 
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_edit_workflow&callclass="+encodeURIComponent(ESP.callclass)+"&bpmui=1&hidetabs="+encodeURIComponent(ESP.workflowform_edit_hidetabitems)+"&key=" + encodeURIComponent(ESP.workflowid)  + "&cellid="+strID);
			alink.click();
		}, null, null, '');

	this.addAction('copyworkflow', function() 
		{ 
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_copy_workflow&callclass="+encodeURIComponent(ESP.callclass)+"&bpmui=1&hidetabs="+encodeURIComponent(ESP.workflowform_edit_hidetabitems)+"&key=" + encodeURIComponent(ESP.workflowid)  + "&cellid="+strID);
			alink.click();
		}, null, null, '');
	this.addAction('resetworkflowgraph', function() 
		{ 
			//-- check type and determin delete actions - always confirm
			var strConfirm = "";
			var strAction = "";
			var aCell = graph.getSelectionCell();
			strConfirm = "Are you sure you want to reset this layout?";
			strAction="workflow/deleteworkflowgraph.php";
			var keyvalue = aCell.htl.stagekey;						
			if(strConfirm=="") return false;

			if(confirm(strConfirm))
			{
				//-- call php service to delete record
				var time =  (new Date).getTime();
				var req = mxUtils.load("service/"+strAction+"?wid="+encodeURIComponent(ESP.workflowid)+"&sessid=" + encodeURIComponent(ESP.sessionid) +"&key=" +  keyvalue + "&t=" + time);
				var strRes = req.getText();

				if(strRes.indexOf("OK")==0)
				{
					//-- Reset
					var alink = document.getElementById('hslaction');
					alink.setAttribute("href","hsl:swjscallback?function=load_workflow_ui&callclass="+ESP.callclass+"&wid="+ESP.workflowid+"");
					alink.click();

				}
				else
				{
					alert(strRes);
				}
			}
		}, null, null, '');

	this.addAction('addstage', function() 
		{ 
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			var time =  (new Date).getTime();
			if(aCell.htl.type=="start")
			{
				var req = mxUtils.load("service/nodes/addfirststage.php?wid="+encodeURIComponent(ESP.workflowid)+"&sessid=" + encodeURIComponent(ESP.sessionid) + "&t="+time);
			}
			else
			{
				var req = mxUtils.load("service/nodes/addstage.php?wid="+encodeURIComponent(ESP.workflowid)+"&sessid=" + encodeURIComponent(ESP.sessionid) +"&ntype="+aCell.htl.type+"&sid=" +  aCell.htl.stagekey + "&t="+time);
			}

			var strRes = req.getText();
			if(strRes.indexOf("stage_")==0)
			{
				//-- add node to the workflow graph
				loadBpmWorkflow(strRes);
			}
			else
			{
				alert(strRes);
			}


		}, null, null, '');

	this.addAction('editstage', function() 
		{ 
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_edit_stage&callclass="+encodeURIComponent(ESP.callclass)+"&bpmui=1&showtabs="+encodeURIComponent(ESP.stageform_edit_showtabitems)+"&key=" +  aCell.htl.stagekey+ "&fk_workflow_id="+ESP.workflowid + "&cellid="+strID);
			alink.click();


		}, null, null, '');

	this.addAction('editauth', function()
		{ 
			//-- get selected cell
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_edit_stage&callclass="+encodeURIComponent(ESP.callclass)+"&bpmui=1&showtabs="+encodeURIComponent(ESP.stageform_editauth_showtabitems)+"&key=" +  aCell.htl.stagekey+ "&fk_workflow_id="+ESP.workflowid + "&cellid="+strID);
			alink.click();

	
		}, null, null, '');

	this.addAction('editstagestartcond', function() 
	{ 
			//-- get selected cell
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_edit_stage&callclass="+encodeURIComponent(ESP.callclass)+"&bpmui=1&showtabs="+encodeURIComponent(ESP.stageform_editstartcond_showtabitems)+"&key=" +  aCell.htl.stagekey+ "&fk_workflow_id="+ESP.workflowid + "&cellid="+strID);
			alink.click();

	
	}, null, null, '');

	this.addAction('editstagestatuscond', function() 
		{ 
			//-- get selected cell
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_edit_stage&callclass="+encodeURIComponent(ESP.callclass)+"&bpmui=1&showtabs="+encodeURIComponent(ESP.stageform_editstatuscond_showtabitems)+"&key=" +  aCell.htl.stagekey + "&fk_workflow_id="+ESP.workflowid + "&cellid="+strID);
			alink.click();

	
		}, null, null, '');

	this.addAction('editcond', function() 
		{ 
			//-- get selected cell
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_edit_condition&bpmui=1&key=" +  aCell.htl.condid + "&callclass="+encodeURIComponent(ESP.callclass)+"&fk_workflow_id="+ESP.workflowid + "&cellid="+strID);
			alink.click();


		}, null, null, '');


	this.addAction('addstatuscond', function() 
		{ 
			//-- get selected cell
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_add_condition&flg_onstart=0&bpmui=1&callclass="+encodeURIComponent(ESP.callclass)+"&fk_workflow_id="+ESP.workflowid+"&fk_stage_id=" +  aCell.htl.stagekey + "&cellid="+strID);
			alink.click();


		}, null, null, '');

	this.addAction('addstartcond', function() 
		{ 
			//-- get selected cell
			var aCell = graph.getSelectionCell();
			var strID = aCell.getId();

			//-- call edit cell link
			var alink = document.getElementById('hslaction');
			alink.setAttribute("href","hsl:swjscallback?function=bpmui_add_condition&flg_onstart=1&bpmui=1&callclass="+encodeURIComponent(ESP.callclass)+"&fk_workflow_id="+ESP.workflowid+"&fk_stage_id=" +  aCell.htl.stagekey + "&cellid="+strID);
			alink.click();

	
		}, null, null, '');



	this.addAction('delete', function() {
											//-- check type and determin delete actions - always confirm
											var strConfirm = "";
											var strAction = "";
											var aCell = graph.getSelectionCell();
											var keyvalue = aCell.htl.stagekey;
											switch(aCell.htl.type)
											{
												case "start":
													strConfirm = "Are you sure you want to delete this workflow? All data relating to this workflow will be deleted.";
													strAction="workflow/deleteworkflow.php";
													break;
												case "startorphans":
													strConfirm = "Are you sure you want to delete all the orphaned nodes? All related data will be deleted.";
													strAction="nodes/deleteorphans.php";
													break;

												case "stage":
													strConfirm = "Are you sure you want to delete this stage? All data relating to this stage will be deleted.";
													strAction="nodes/deletestage.php";
													break;
												case "auth":
													strConfirm = "Are you sure you want to delete the authorisation settings for this stage? All data relating to the authorisation settings will be deleted.";
													strAction="nodes/deletestageauthorisations.php";
													break;
												case "statuscond":
													strConfirm = "Are you sure you want to delete the on status change condition settings for this stage? All data relating to the condition settings will be deleted.";
													strAction="nodes/deletestageconditions.php";
													break;
												case "startcond":
													strConfirm = "Are you sure you want to delete the on start condition settings for this stage? All data relating to the condition settings will be deleted.";
													strAction="nodes/deletestagestartconditions.php";
													break;
												case "link":
													//-- check if a condition link
													if(aCell.htl.condid!="")
													{
														strConfirm = "Are you sure you want to delete this condition? All data relating to the condition will be deleted.";
														strAction="nodes/deletesinglecondition.php";
														keyvalue = aCell.htl.condid;
													}
													break;
											}
											
											if(strConfirm=="") return false;

											if(confirm(strConfirm))
											{
												//-- call php service to delete record
												var time =  (new Date).getTime();
												var req = mxUtils.load("service/"+strAction+"?wid="+encodeURIComponent(ESP.workflowid)+"&sessid=" + encodeURIComponent(ESP.sessionid) +"&key=" +  keyvalue + "&t=" + time);
												var strRes = req.getText();

												if(strRes.indexOf("OK")==0)
												{
													//-- if deleted workflow then load splash and reload tree
													if(aCell.htl.type=="start")
													{
														var alink = document.getElementById('hslaction');
														alink.setAttribute("href","hsl:swjscallback?function=reset_worfklow_ui");
														alink.click();
													}
													else
													{
														setTimeout("loadBpmWorkflow()",100);
													}
												}
												else
												{
													alert(strRes);
												}
											}
											

										}, null, null, 'Delete');
	
	// View actions
	this.addAction('actualSize', function()
	{
		graph.zoomTo(1);
	});
	this.addAction('zoomIn', function() { graph.zoomIn(); }, null, null, 'Add');
	this.addAction('zoomOut', function() { graph.zoomOut(); }, null, null, 'Subtract');
	this.addAction('fitWindow', function() { graph.fit(); }, null, null, 'F2');

	
	// Option actions
	var action = null;
	action = this.addAction('grid', function()
	{
		graph.setGridEnabled(!graph.isGridEnabled());
		editor.updateGraphComponents();
	}, null, null, 'Ctrl+Shift+G');
	action.setToggleAction(true);
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut)
{

	return this.put(key, new Action(mxResources.get(key), funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function(name, action)
{
	this.actions[name] = action;
	
	return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function(name)
{
	return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut)
{
	mxEventSource.call(this);
	this.label = label;
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
	this.iconCls = iconCls;
	this.shortcut = shortcut;
};

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function(value)
{
	if (this.enabled != value)
	{
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function(value)
{
	this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function(funct)
{
	this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function()
{
	return this.selectedCallback();
};
