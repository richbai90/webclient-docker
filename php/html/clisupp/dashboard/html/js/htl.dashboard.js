

$(function() 
{

	ESP.winWidth =$(document).width();
	ESP.winHeight =$(document).height();


	//-- hide containers
	$(".viewmode").hide();

	//-- show toolbar in collapsed mode to start with
	$("#toolbar").hide();
	$("#toolbar-control").find("#collapse").hide();
	$("#toolbar-control").find("#expand").show();


	//-- set toolbar
	$( "#optviewmode").buttonset();

	$( "#loopcharts" ).button().click(function()
	{
		ESP.loopChartsInFullscreen = $( this ).get(0).checked;
	});

	$( "#expand" ).button({text: false,icons:{primary: "ui-icon-arrowstop-1-w"}}).click(function()
	{
		$("#toolbar").show()
		$("#toolbar-control").find("#expand").hide();
		$("#toolbar-control").find("#collapse").show();
	});

	$( "#collapse" ).button({text: false,icons:{primary: "ui-icon-arrowstop-1-e"}}).click(function()
	{
		//-- collapse
		$("#toolbar").hide();
		$("#toolbar-control").find("#collapse").hide();
		$("#toolbar-control").find("#expand").show();
	});

	$( "#logout" ).button({text: false,icons:{primary: "ui-icon-power"}}).click(function()
	{
		//-- logout and redirect to index.php
		$.ajax({type:"POST", url:"services/logoff.php",  data:{sessid:ESP.sessionID}}).done(function(){window.location.replace(window.location.href.replace("index.php",""))});		
	});
	$( "#reload" ).button({text: false,icons:{primary: "ui-icon-refresh"}}).click(function()
	{
		//-- logout and redirect to index.php
		$.ajax({type:"POST", url:"services/refreshChartsData.php",  data:{sessid:ESP.sessionID}}).done(function(responseText,status,httpObject){ESP.refresh(true)});		
	});
	//-- create new chart
	$( "#newchart" ).button({text: false,icons:{primary: "ui-icon-image"}}).click(function()
	{
		if(ESP.isIE7)
		{
			alert("Graph design features are only supported in modern browsers. To use this feature upgrade to the latest version of Internet Explorer");
			return false;
		}

		$("#dialog-form"  ).dialog("option","forEdit", false);
		$("#dialog-form"  ).dialog("option","editChartName", "");
		$("#dialog-form" ).dialog("open");

	});

	//-- save layout for this specific user
	$( "#savelayout" ).button({text: false,icons:{primary: "ui-icon-disk"}}).click(function()
	{
		//-- create xml string for layout
		var arrXML = new Array();
		arrXML.push('<?xml version="1.0" encoding="UTF-8"?>\n');
		arrXML.push('<Config>\n');
		arrXML.push('\t<View mode="'+ESP.viewmode+'">\n');


		for(var x=0;x<ESP.arrTitles.length;x++)
		{
			if(ESP.arrTitles[x]==undefined)ESP.arrTitles[x]="";
			arrXML.push('\t\t<Graph DashboardName="'+ESP.arrTitles[x]+'"/>\n');
		}
		arrXML.push('\t</View>\n');
		arrXML.push('</Config>');

		$.ajax({type:"POST", url:"services/saveUserLayout.php",  data:{sessid:ESP.sessionID,layout:arrXML.join("")}}).done(function(responseText,status,httpObject)
		{
			alert(responseText);
		});		

	});

	//-- popup admin options
	$( "#resetdatasetting" ).button({text: false,icons:{primary: "ui-icon-clock"}}).click(function()
	{
		var newTime = prompt("Please enter graph data expiry time in minutes. The setting will apply to all users when they next login and all chart data will be re-generated after it has expired.",ESP.expirytime);
		if(isNaN(newTime) || newTime<1)
		{
			alert("Invalid expiry time provided - The setting was not applied.\n\nPlease provide a positive number > 0.");
			return;
		}

		ESP.expirytime = newTime;
		$(this).attr("title","Reset all chart data every "+newTime+" minutes");

		//-- cancel current time out
		clearTimeout(ESP.nextrefresh)
		ESP.nextrefresh = setTimeout(ESP.resetChartData,(ESP.expirytime * 1000 * 60));

		//-- update server
		$.ajax({type:"POST", url:"services/saveChartExpiryTime.php",  data:{sessid:ESP.sessionID,expiretime:newTime}}).done(function(responseText,status,httpObject)
		{
			alert(responseText);
		});		

	});

	//-- set default layout
	$( "#setserverdefault" ).button({text: false,icons:{primary: "ui-icon-arrowthickstop-1-n"}}).click(function()
	{
		//-- create xml string for layout
		var arrXML = new Array();
		arrXML.push('<?xml version="1.0" encoding="UTF-8"?>\n');
		arrXML.push('<Config>\n');
		arrXML.push('\t<View mode="'+ESP.viewmode+'">\n');


		for(var x=0;x<ESP.arrTitles.length;x++)
		{
			if(ESP.arrTitles[x]==undefined)ESP.arrTitles[x]="";
			arrXML.push('\t\t<Graph DashboardName="'+ESP.arrTitles[x]+'"/>\n');
		}
		arrXML.push('\t</View>\n');
		arrXML.push('</Config>');

		$.ajax({type:"POST", url:"services/saveServerLayout.php",  data:{sessid:ESP.sessionID,layout:arrXML.join("")}}).done(function(responseText,status,httpObject)
		{
			alert(responseText);
		});		

	});


	//--
	//-- change views
	$("#optviewmode label").click(function() 
	{
		var viewNum = $(this).text();		
		if(isNaN(viewNum))return;
		
		var currNum = $(this).parent().data("currentView");
		if(currNum)$(".vm" + currNum).hide();

		var viewDiv = $(".vm" + viewNum);
		if(viewDiv)
		{
			viewDiv.show();
			//--
			//-- load chart director images into each view
			ESP.imgs = viewDiv.find(".chartholder img");
			ESP.imgs.hide();
			ESP.imgs.each(function(idx)
			{
				var fsi=(ESP.fs && ESP.imgs.length==1)?"1":"0";
				var img = ESP.imgs.eq(idx);

				img.parent().children().hide();
				var h = img.parent().height() - img.prev().outerHeight() - 2;
				var w = img.parent().width();

				var chartPos = img.attr("class").split("-")[1]-1;
				if(ESP.arrTitles[chartPos]==undefined)ESP.arrTitles[chartPos]="";
				var chartname = ESP.arrTitles[chartPos];


				img.parent().children().first().text(chartname);
				img.parent().children().last().text("");

				if(chartPos <= (ESP.arrTitles.length-1) && ESP.arrTitles[chartPos]!="")
				{
					ESP.imgs.data("nextchartpos",chartPos+1);
					var r = new Date().getTime();
					var url = "services/renderChart.php?sessid="+ESP.sessionID+"&fs="+fsi+"&chartname=" + chartname +"&chart=" + chartPos +"&h="+h+"&w="+w+"&r="+r;
					img.error(function(ev)
					{
						$(this).parent().children().last().text("No chart data available");
						$(this).parent().children().last().show();
						$(this).parent().children().first().show();
					}).load(function(ev)
					{
						img.parent().children().first().show();
						img.parent().children().first().next().show();
					}).attr("src",url);

				}
				else
				{
					img.parent().children().last().text("Right click to select a chart");
					img.parent().children().last().show();
				}

			});

			ESP.viewmode = viewNum;
			$(this).parent().data("currentView",viewNum);
			ESP.currLabel = $(this);

			//-- start chart switching if in fullscreen mode and only showing 1 chart
			if(ESP.fs && viewNum=="1" && ESP.loopChartsInFullscreen)
			{
				setTimeout(ESP.fsNextChart,(ESP.intScrollTimeout*1000))
			}
		}
	});

	$(window).resize(function()
	{
		if(ESP.skipResize)return;
		setTimeout(	function()
					{
						if($(document).height()!=ESP.winHeight || $(document).width()!=ESP.winWidth)
						{
							ESP.winHeight = $(document).height();
							ESP.winWidth = $(document).width();
							ESP.currLabel.click();
						}
					},50);
	});


	//-- log out user from session when user unloads page in standalone mode 
	if(!ESP.bClientMode)
	{
		window.onbeforeunload = function() 
		{ 
			$.ajax({type:"POST", url:"services/logoff.php",async : false,  data:{sessid:ESP.sessionID}});
		}
	}

	//-- load default view
	$(document).ready(function()
	{
		$("label[for=viewmode_"+ESP.viewmode+"]").click();
		ESP.nextrefresh = setTimeout(ESP.resetChartData,(ESP.expirytime * 1000 * 60));
	});
	
	//-- detect full screen
	$(document).keydown(function(e)
	{
		if(!ESP.bClientMode && e.which==122)
		{
			ESP.skipResize=true;
			if(ESP.fs)
			{
				//-- show toolbar
				ESP.fs = false;
				//-- set title of graph
				ESP.imgs.eq(0).prev().text(ESP.arrTitles[0]);
				$( "#toolbar" ).show();
				setTimeout(ESP.refresh,500);
			}
			else
			{
				//-- hide toolbar
				ESP.fs = true;
				$("#toolbar").hide();
				setTimeout(ESP.refresh,500);
			}
		}
	});

});


function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}



//-- use full helpers
jQuery.fn.center = function(parent) 
{
    if (parent==undefined)
	{
        parent = this.parent();
    }

	this.css({
        "position": "absolute",
        "top": ((($(parent).height() - this.outerHeight()) / 2) + $(parent).scrollTop() + "px"),
        "left": ((($(parent).width() - this.outerWidth()) / 2) + $(parent).scrollLeft() + "px")
    });
	return this;
}

jQuery.fn.adjustLeft = function(intAmount) 
{

	var left = parseInt($(this).css('left'));

	this.css({
        "position": "absolute",
        "left":  left + intAmount + "px"
    });
	return this;
}