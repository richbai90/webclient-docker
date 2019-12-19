<?php

	//-- make sure running in context
	if(!isset($_core))
	{
		echo "This page is running outside of it's intended context. Please contact your Administrator";
		exit(0);
	}

	$groupOptions = "";
	$rsGroups = get_dashboard_groups();
	while($rsGroups->Fetch())
	{
		$groupOptions .= '<option value="'.$rsGroups->GetValueAsNumber("h_gid").'">'.$rsGroups->GetValueAsString("h_title").'</option>';
	}

	include("../_css_switcher.php");
?>
<!DOCTYPE html>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<html>

	<link rel="stylesheet" href="../css/smoothness/jquery-ui-1.10.2.custom.min.css" />  
	<link id='stylesheet' rel="stylesheet" href="../<?php echo $cssFile;?>" />  	
	<style>

		*{font-size:12px;font-family:Verdana,sans-serif;color:#696969;}
		body{overflow:hidden;min-width:850px;margin:0;padding:0;}


		#dashboardContainer
		{
			border:0px solid #ffffff;
			width:100%;
			height:100%;
		}

		#toolbar 
		{
			padding: 4px;    
			display: block;  
			border-width:0px 0px 1px 0px;
		}  

		#toolbar-left
		{
			display:inline;
			position:relative;
			top:2px;
		}

		#toolbar-right
		{
			display:block;
			float:right;
		}

		#lbGroups
		{
			width:200px;
		}
		#lbDashboards
		{
			width:200px;
		}

		#menu {
			display: none;
			position: absolute;
			padding: 10px;
			background-color: #ddd;
			border: 1px solid #000;
		}

		.editable
		{
			border:1px solid #000000;
			background:#ffffff;
		}

		.fl
		{
			float:left;
		}

		.fr
		{
			float:right;
		}

		.ui-menu
		{
			display:none;
			width:100px;
		}
	</style>


<script src="../js/jquery-1.9.1.js"></script>  
<script src="../js/jquery-ui-1.10.2.custom.min.js"></script>  

<script>

	var ESP={};
	ESP.sessionid = "<?php echo $sessionID;?>";
	ESP.colorid = "<?php echo $colorid;?>";


	function loadRecordValues(targetForm, oRec)
	{
		targetForm.find("*[databind]").each(function()
		{
			var fld = $(this);
			var databind = fld.attr("databind");

			if(oRec[databind]!=undefined)
			{
				fld.val(oRec[databind]);
			}
		});
	}

	function updateRecordValuesFromForm(targetForm, oRec, serviceMethod, callback)
	{
		if(oRec==false)oRec={};


		targetForm.find("*[databind]").each(function()
		{
			var fld = $(this);
			var databind = fld.attr("databind");
			if(databind!=undefined && databind!="")
			{
				oRec[databind] = fld.val();
			}
		});

		var p = oRec;
			p.sessid = ESP.sessionid;

			var serviceUrl = serviceMethod;
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
												if(callback)callback(false);
											}
											else
											{
												if(callback)callback(true);
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
															if(callback)callback(false);
														});

	}


	$(document).ready(function() 
	{
		//-- resize iframe to size of screen - toolbar height
		$(window).resize(function(){
		   var height = $(this).height() - $("#toolbar").outerHeight(true);
		   var width = $(this).width();
		   $('#dashboardContainer').height(height);
		   $('#dashboardContainer').width(width);
		});
		$(window).resize();


		$(document).bind("contextmenu", function(e) 
		{
			return false;
		});

	});

	$(function() 
	{
		//-- GROUP LISTBOX AND ACTIONS

		var lbgroup = $("#lbGroups");
		var grpBtnDisabled = (lbgroup.val())?false:true;
		$( "#btn-delete-group" ).button({text: false,icons: {primary: "ui-icon-trash"},disabled:grpBtnDisabled}).click(function()
		{
			if(confirm("Are you sure you want to delete this group and all of it's dashboards?"))
			{
				var frm = $(this);
				var p = {};
					p.sessid = ESP.sessionid;
					p.gid=lbgroup.val();

					var serviceUrl = "adminservices/deletegroup.php";
					$.post(serviceUrl, p, function(j, res,http) 
												{  
													if(j && j.state && j.state.error)
													{
														alert(j.state.error)
													}
													else
													{
														lbgroup.find("option:selected").remove();													
														lbgroup.change(); //-- trigger change event so reload dashboards

													}
												},"json").error(function(a,b,c)
																{
																	alert(b+":"+c);
																});

			}


		}); 
		$( "#btn-create-group" ).button({text: false,icons: {primary: "ui-icon-contact"},disabled:grpBtnDisabled}).click(function()
		{
			$("#group-form" ).data("datarecord",false).dialog( "open" );
		});   
		$( "#btn-prop-group" ).button({text: false,icons: {primary: "ui-icon-newwin"}}).click(function()
		{
			var p = {};
			p.sessid = ESP.sessionid;
			p.gid=lbgroup.val();

			var serviceUrl = "adminservices/getdbgrouprecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#group-form" ).data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});
		});      		 

		//-- when we change group get its dashboard list  
		lbgroup.change(function()
		{
			//-- clear current dashboard list - and disable dashboard actions
			lbdashboard.find('option').remove().end();
			enableDashboardActions(false);

			var p = {};
				p.sessid = ESP.sessionid;
				p.gid=lbgroup.val();

				var serviceUrl = "adminservices/getgroupdashboards.php";
				$.post(serviceUrl, p, function(j, res,http) 
											{  
												if(j && j.state && j.state.error)
												{
													alert(j.state.error)
												}
												else
												{
													//-- add items to select box
													if(j.data.rowData && j.data.rowData.row)
													{
														var rows = (j.data.rowData.row.length)?j.data.rowData.row:[j.data.rowData.row];
														for(var x=0;x < rows.length;x++)
														{
															lbdashboard.append($("<option></option>")
																	 .attr("value", rows[x].h_dashboard_id)
																	 .data("layout", rows[x].h_layout)
																	 .text(rows[x].h_title)); 
														}

														//-- enable dashboard toolbar actions
														enableDashboardActions(true);
													}

													lbdashboard.change();
												}
											},"json").error(function(a,b,c)
															{
																alert(b+":"+c);
															});

		});
		//-- EOF GROUP LISTBOX AND ACTIONS

		//-- DASHBOARD LISTBOX AND ACTIONS
		var lbgroup = $("#lbGroups");
		var lbdashboard = $("#lbDashboards");
		var dbBtnDisabled = (lbdashboard.val())?false:true;
		var grpBtnDisabled = (lbgroup.val())?false:true;


		$( "#btn-delete-dashboard" ).button({text: false,icons: {primary: "ui-icon-trash"},disabled:dbBtnDisabled}).click(function()
		{
			if(confirm("Are you sure you want to delete this dashboard?"))
			{
				var frm = $(this);
				var p = {};
					p.sessid = ESP.sessionid;
					p.did=lbdashboard.val();

					var serviceUrl = "adminservices/deletedashboard.php";
					$.post(serviceUrl, p, function(j, res,http) 
												{  
													if(j && j.state && j.state.error)
													{
														alert(j.state.error)
													}
													else
													{
														lbdashboard.find("option:selected").remove();													
														lbdashboard.change(); //-- trigger change event so reload dashboards

													}
												},"json").error(function(a,b,c)
																{
																	stop()
																	alert(b+":"+c);
																});

			}

		})

		$( "#btn-create-dashboard" ).button({text: false,icons: {primary: "ui-icon-calculator"},disabled:grpBtnDisabled}).click(function()
		{
			$("#dashboard-form" ).data("datarecord",false).dialog( "open" );
		}); 

		$( "#btn-prop-dashboard" ).button({text: false,icons: {primary: "ui-icon-newwin"},disabled:dbBtnDisabled}).click(function()
		{
			var p = {};
			p.sessid = ESP.sessionid;
			p.did=lbdashboard.val();

			var serviceUrl = "adminservices/getdashboardrecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#dashboard-form" ).data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});
		});      		 


		//-- when we change group get its dashboard list  
		lbdashboard.change(function()
		{
			//-- load selected dashboard into view and show toolbox
			var loadDashboard = lbdashboard.val();
			var url = "../index.php?ColourScheme="+ESP.colorid+"&sessid=" + ESP.sessionid + "&iam=1&cid="+loadDashboard;
			 $('#dashboardContainer').attr('src', url)

		});
		//-- EOF DASHBOARD LISTBOX AND ACTIONS

		function enableDashboardActions(boolEnable)
		{
			if(boolEnable==undefined)boolEnable=true;
			$( "#btn-delete-dashboard" ).button( "option", "disabled", !boolEnable );
			$( "#btn-prop-dashboard" ).button( "option", "disabled", !boolEnable );
			$( "#btn-add-widget" ).button( "option", "disabled", !boolEnable );

		}

		lbgroup.change();




	});
</script>
<body>
<div id="toolbar" class="ui-widget-header">  
	
	<!-- groups -->
	<div id="toolbar-left" class="swtheme-fontcolor">
		Group :  <select id='lbGroups'><?php echo $groupOptions;?></select>
	</div>
	<button id="btn-prop-group">group properties</button>  
	<button id="btn-delete-group">delete group and its dashboards</button>  
	<button id="btn-create-group">create a new group</button>  
	&nbsp;&nbsp;&nbsp;

	<!-- dashboards -->
	<div id="toolbar-left" class="swtheme-fontcolor">
		Dashboard :  <select id='lbDashboards'></select>
	</div>
	<button id="btn-prop-dashboard">dashboard properties</button>  
	<button id="btn-delete-dashboard">delete dashboard</button>  
	<button id="btn-create-dashboard">create a new dashboard</button>  

	<!-- actions -->
	<div id="toolbar-right">	
	</div>
	<div style="clear:both;"></div>
</div>


<!-- load dashboards in here -->
<iframe id='dashboardContainer' frameborder="0"></iframe>

<!-- GROUP FORM -->
<?php
	include('forms/frmgroup.php');
?>
<!-- DASHBOARD FORM -->
<?php
	include('forms/frmdashboard.php');
?>
</body>
</html>
