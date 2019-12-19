//
//-- functions for managing chart designer form

$(function() 
{
	 $("#tabcontrolDesigner").tabs();
	 $("#tabcontrolProperties").tabs();

	 $( "#dialog-form" ).dialog({autoOpen: false, height: 600,width: 900, modal: true,
								buttons: {
										   "Save": function() 
													{
														//-- check we have a name
														var chartName = $("#tbChartName").val();
														if(chartName=="")
														{
															alert("Please provide a chart name before saving");
															return;
														}

														//-- monkey
														var xmlConfigStructure = ESP.constructChartXml(chartName);
														var settings = {};
														settings.type = "POST";
														settings.url = "services/designer/saveChart.php";
														settings.data = {};
														settings.data.sessid=ESP.sessionID;
														settings.data.confxml=xmlConfigStructure;
														if($("#dialog-form" ).dialog("option","forEdit"))
														{
															settings.data.editgraphname = $("#dialog-form").dialog("option","editChartName");
														}

														$.ajax(settings).done(function(result,b,c)
														{
															if(result=="OK")
															{
																$( "#dialog-form" ).dialog( "close" );

																//-- refresh selected chart
																if(settings.data.editgraphname)
																{
																	ESP.refreshCurrentChart(chartName);
																}
															}
															else
															{
																alert(result)
															}
														});		
													},
										   "Cancel": function() {$( this ).dialog( "close" );}
										 }
	 });




	$("#dialog-form").on( "dialogclose", function( event, ui ) 
	{
		$("#imgDesignChart").hide();
	});
	$("#dialog-form").on( "dialogopen", function( event, ui ) 
	{
		//-- set active tab
		$("#tabcontrolDesigner").tabs("option","active",0);
		$("#tabcontrolProperties").tabs("option","active",0);


		//-- set default values
		$(".chartProp").each(function(idx)
		{
			var tbProp = $(this);
			var defaultValue = tbProp.attr("dvalue");
			if(defaultValue!=undefined)
			{
				tbProp.val(defaultValue);
			}
		});

		var chartName = $("#dialog-form").dialog("option","editChartName");
		$("#tbChartName").val(chartName);

		//-- LOAD CHART DETAILS AND SETUP VALUES
		if($(this).dialog("option","forEdit"))
		{
			$.ajax({dataType:"json",type:"POST", url:"services/designer/getChartProperties.php",  data:{sessid:ESP.sessionID,chartname:chartName}}).done(function(jsonObject,status,httpObject)
			{
				if(jsonObject.error)
				{
					alert(jsonObject.error)
					$( "#dialog-form" ).dialog( "close" );
				}
				else
				{
					//-- load properties
					$(".chartProp").each(function(idx)
					{
						var tbProp = $(this);
						var propName = tbProp.attr("class").replace("chartProp ","");
						if(jsonObject[propName])
						{
							tbProp.val(jsonObject[propName]);
						}
					});

					$("#lbDataQuery").load("services/designer/getChartQueryListbox.php",{sessid:ESP.sessionID},function()
					{
						$("#lbChartType").val(jsonObject.ChartType)
						$("#lbDataQuery").val(jsonObject.DashboardQuery)
						$("#lbDataQuery").change();
					});		
				}
			}).fail(function(httpObject)
			{
				alert(httpObject.responseText);
				$( "#dialog-form" ).dialog( "close" );
			});

		}
		else
		{
			//-- CREATING NEW
			$("#lbDataQuery").load("services/designer/getChartQueryListbox.php",{sessid:ESP.sessionID},function()
			{
				$("#lbDataQuery").change();
			});		
		}
	});

	$("#lbDataQuery").change(function()
	{
		//-- reload data table
		var chartName = $(this).find("option:selected").val();
		$(".chartdata").load("services/designer/getChartQueryDataTable.php",{sessid:ESP.sessionID,queryname:chartName},function()
		{
			$("#lbChartType").change();
		});		
	});

	//-- user has changed property - lets make sure it is numeric if dvalue is numeric
	$(".chartProp").change(function(idx)
	{
		var newVal = $(this).val();
		var dValue = $(this).attr("dvalue");
		if(dValue!=undefined && dValue!="")
		{
			//-- check if numeric
			if(!isNaN(dValue))
			{
				if(newVal=="" || isNaN(newVal) || newVal.indexOf(".")>-1)
				{
					var parentTD = $(this).closest("TD").prev();

					alert("The property ["+parentTD.text()+"] requires a numeric integer value.\n\nThe default value for this property will be used instead.");
					$(this).val(dValue);
				}
			}
		}
		$("#lbChartType").change();
	});


	$("#lbChartType").change(function()
	{
		ESP.renderDesignableChart(true);
	});


	$("#colorPickerHolder").hide();


	$("#colorPickerHolder table tr td").click(function(ev)
	{
		ev.preventDefault();
		ev.stopPropagation();

		var td = $(this);
		var color = td.attr("bgcolor");

		if(color!=undefined)
		{
			var cp = $('#colorPickerHolder');
			cp.data("currentTarget").val(color);
			cp.data("currentTarget").change();
			$("#colorPickerHolder button.cancel").click();
		}
	});

	$("#colorPickerHolder button.cancel").click(function()
	{
		var formParent = $("#dialog-form").parent();

		var overlay = formParent.find("#overlay");
		if(overlay)
		{

			overlay.hide();
		}
		$('#colorPickerHolder').hide();
	});

	//-- bind jPicker to color elements	
	$('input[colorpicker]').mousedown(function(ev)
	{
		var cp = $('#colorPickerHolder');
		var formParent = $("#dialog-form").parent();

		var overlay = formParent.find("div#overlay");
		if(overlay.length==1)
		{
			overlay.show();
		}
		else
		{
			//-- create overlay
			jQuery('<div id="overlay"> </div>').appendTo(formParent);
		}
		cp.center($("#dialog-form"));
		cp.adjustLeft(360)
		cp.show()

		cp.data("currentTarget",$(this));

		ev.preventDefault();
		ev.stopPropagation();
	});


	$('input[colorpicker]').keydown(function(ev)
	{
		if(ev.key=="Tab")return;

		ev.preventDefault();
		ev.stopPropagation();
		$(this).mousedown();
	});


	//-- chart template tree
	$("#treeTemplates").treeview({
		animated: "fast",
		collapsed: true,
		unique: false	
	});

	$("#treeTemplates .item").click(function()
	{
		var lastItem = $("#treeTemplates").data("lastitem");
		if(lastItem)
		{
			lastItem.removeClass("selected");
		}

		$(this).addClass("selected")
		$("#treeTemplates").data("lastitem",$(this));

		//-- load properties and apply to chart
		var templatePos = $(this).attr("xpos");
		$.ajax({dataType:"json",type:"POST", url:"services/designer/getChartTemplateProperties.php",  data:{sessid:ESP.sessionID,templatepos:templatePos}}).done(function(jsonObject,status,httpObject)
		{
			if(jsonObject.error)
			{
				alert(jsonObject.error)
			}
			else
			{
				//-- load properties
				$(".chartProp").each(function(idx)
				{
					var tbProp = $(this);
					var propName = tbProp.attr("class").replace("chartProp ","");
					if(jsonObject[propName])
					{
						tbProp.val(jsonObject[propName]);
					}
				});

				$("#lbChartType").val(jsonObject.ChartType)
				ESP.renderDesignableChart(true);

			}
		}).fail(function(httpObject)
		{
			alert(httpObject.responseText);
		});

	});


});
