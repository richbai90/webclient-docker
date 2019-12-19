//-- CHART CONTEXT MENU FUNCTIONS

$(function() 
{
	var selected = {
					select: function( event, ui ) 
					{
						var opt = ui.item.attr("mopt");
						if(opt=="2")
						{
							if(confirm("Are you sure you want to delete this chart configuration. Once deleted it cannot be retrieved?"))
							{
								var settings = {};
								settings.type = "POST";
								settings.url = "services/deleteChart.php";
								settings.data = {};
								settings.data.sessid=ESP.sessionID;
								settings.data.deletegraphname=ESP.currentChartTitle;
								$.ajax(settings).done(function(result,b,c)
								{
									if(result=="OK")
									{
										ESP.currentChartHolder.children().hide();
										ESP.currentChartHolder.children().last().text("Right click to select a chart");
										ESP.currentChartHolder.children().last().show();
									}
									else
									{
										alert(result)
									}
								});		
							}
						}
						else if(opt=="3")
						{
							if(ESP.isIE7)
							{
								alert("Graph design features are only supported in modern browsers. To use this feature upgrade to the latest version of Internet Explorer");
								event.preventDefault();
								event.stopPropagation();
								return false;
							}
							$("#dialog-form" ).dialog("option","forEdit", true);
							$("#dialog-form" ).dialog("option","editChartName", ESP.currentChartTitle);
							$("#dialog-form").dialog("open");
						}
						else if(opt=="-1")
						{
							var cpos = ESP.currentChartHolder.attr("cpos")-0;
							ESP.arrTitles[cpos] = "";
							ESP.currentChartHolder.children().hide();
							ESP.currentChartHolder.children().last().text("Right click to select a chart");
							ESP.currentChartHolder.children().last().show();

						}
						else if(opt==undefined)
						{
							//-- load new chart img
							var chartName = ui.item.text();
							var cpos = ESP.currentChartHolder.attr("cpos")-0;
							ESP.currentChartHolder.children().first().text(chartName);
							ESP.arrTitles[cpos] = chartName;

							var fsi=(ESP.fs && ESP.imgs.length==1)?"1":"0";
							var img= ESP.currentChartHolder.children().eq(1);

							ESP.currentChartHolder.children().hide();
							var h = img.parent().height() - img.prev().outerHeight() - 2;
							var w = img.parent().width();
							var chartPos = cpos;

							img.parent().children().last().text("");
							img.parent().children().last().hide();

							var r = new Date().getTime();
							var url = "services/renderChart.php?sessid="+ESP.sessionID+"&fs="+fsi+"&chartname=" + chartName +"&chart=" + chartPos +"&h="+h+"&w="+w+"&r="+r;

							img.on("error",function(ev)
							{
								$(this).parent().children().last().text("No chart data available");
								$(this).parent().children().last().show();
							}).load(function(ev)
							{
								img.prev().show();
								img.show();
							}).attr("src",url);

						}
						else if(opt=="1")
						{
							event.preventDefault();
							event.stopPropagation();
							return;
						}
						$(this).hide();
					}
				   };

	$("#chartContextMenu").menu(selected).hide();
	$(".chartholder").bind("contextmenu", function(event,a,b,c) 
	{
		ESP.currentChartTitle = $(this).children().first().text();
		ESP.currentChartHolder = $(this);
		event.preventDefault();

		$("#chartContextMenuSelectChartList").load("services/getChartMenuListItems.php",{sessid:ESP.sessionID,queryname:$(this).val()},function()
		{
			$("#chartContextMenu").css({'top':mouseY,'left':mouseX});
			if(ESP.currentChartTitle=="")
			{
				//-- hide the delete and properties options
				$("#chartContextMenu").find("li[mopt='-1']").hide();
				$("#chartContextMenu").find("li[mopt='2']").hide();
				$("#chartContextMenu").find("li[mopt='3']").hide();
			}
			else if(ESP.currentChartTitle.indexOf("**chart no longer exists**")>-1)
			{
				$("#chartContextMenu").find("li[mopt='-1']").show();
				$("#chartContextMenu").find("li[mopt='2']").show();
				$("#chartContextMenu").find("li[mopt='3']").hide();
			}
			else
			{
				$("#chartContextMenu").find("li[mopt='-1']").show();
				$("#chartContextMenu").find("li[mopt='2']").show();
				$("#chartContextMenu").find("li[mopt='3']").show();

			}
			$("#chartContextMenu").menu().show();

		});		

	});

	$(document).bind("click", function(event) 
	{
		$("#chartContextMenu").menu().hide();
	});

	var mouseX;
	var mouseY;
	$(document).mousemove( function(e) 
	{
	   mouseX = e.pageX; 
	   mouseY = e.pageY;
	});  


});
