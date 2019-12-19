//-- ESP FUNCTIONS FOR DASHBOARD - ESP object created in index.php

ESP.imgs = null;
ESP.currLabel = null;
ESP.fs = false;
ESP.loopChartsInFullscreen=false;
ESP.intScrollTimeout = 10;
ESP.fsMode=false;
ESP.winWidth=0;
ESP.winHeight=0;
ESP.skipResize=false;
ESP.currentChartTitle = "";
ESP.currentChartHolder = null;
ESP.nextrefresh=-1;


//-- refresh current chart
ESP.refresh = function(bForce)
{
	if(bForce || $(document).height()!=ESP.winHeight || $(document).width()!=ESP.winWidth)
	{
		ESP.winHeight = $(document).height();
		ESP.winWidth = $(document).width();
		ESP.currLabel.click();
	}
	ESP.skipResize=false;
}

ESP.resetChartData = function()
{
	//-- reset chart data on server
	$( "#reload" ).click();
	ESP.nextrefresh = setTimeout(ESP.resetChartData,(ESP.expirytime * 1000 * 60));
}

ESP.refreshCurrentChart = function(strNewTitle)
{
	var cpos = ESP.currentChartHolder.attr("cpos")-0;
	if(strNewTitle!=undefined && ESP.arrTitles[cpos] != strNewTitle)	
	{
		ESP.arrTitles[cpos] = strNewTitle;
		ESP.currentChartHolder.children().first().text(strNewTitle);

		//-- save the layout (which stores new name)
		$("#savelayout").click();
	}

	//-- refresh selected chart
	var fsi=(ESP.fs && ESP.imgs.length==1)?"1":"0";
	var img = ESP.currentChartHolder.children().eq(1);
	img.parent().children().hide();
	var h = img.parent().height() - img.prev().outerHeight() - 2;
	var w = img.parent().width();

	img.parent().children().last().text("");

	var r = new Date().getTime();
	var url = "services/renderChart.php?sessid="+ESP.sessionID+"&fs="+fsi+"&chartname=" + ESP.arrTitles[cpos] +"&chart=" + cpos +"&h="+h+"&w="+w+"&r="+r;

	img.on("error",function(ev)
	{
		$(this).parent().children().first().show();
		$(this).parent().children().last().text("No chart data available");
		$(this).parent().children().last().show();

	}).load(function(ev)
	{
		img.prev().show();
		img.show();
	}).attr("src",url);

}

//-- load next chart when in fullscreen single pane mode
ESP.fsNextChart=function()
{
	//-- reset to 1st chart
	if(!ESP.fs) 
	{
		ESP.imgs.data("nextchartpos",0);
		return;
	}

	ESP.imgs.hide();
	ESP.imgs.each(function(idx)
	{
		var fsi=(ESP.fs && ESP.imgs.length==1)?"1":"0";
		var img = ESP.imgs.eq(idx);
		var h = img.parent().height() - img.prev().outerHeight() - 2;
		var w = img.parent().width();

		var chartname = img.parent().children().first().text();
		var chartPos = ESP.imgs.data("nextchartpos");

		var r = new Date().getTime();
		var url = "services/renderChart.php?sessid="+ESP.sessionID+"&fs="+fsi+"&chartname=" + chartname +"&chart=" + chartPos +"&h="+h+"&w="+w+"&r="+r;
		img.attr("src",url);

		//-- set title of graph
		img.prev().text(ESP.arrTitles[chartPos]);

		if(chartPos==5)chartPos=-1;
		ESP.imgs.data("nextchartpos",chartPos+1);
	});
	ESP.imgs.show();							

	//-- do next loop
	if(ESP.fs)
	{
		setTimeout(ESP.fsNextChart,(ESP.intScrollTimeout*1000));
	}
}


ESP.constructChartXml = function(strChartName,bForce)
{
var xmlConfigStructure = new Array();
xmlConfigStructure.push('<Config><Graphs><Graph DashboardName="'+strChartName+'">');
xmlConfigStructure.push('\n\t\t<DashboardQuery value="'+$("#lbDataQuery").val()+'"/>');
xmlConfigStructure.push('\n\t\t<ChartType value="'+$("#lbChartType").val()+'"/>');
//-- loop properties and add
$(".chartProp").each(function(idx)
{
	var tbProp = $(this);
	var value = tbProp.val() +"";
	//if(bForce || tbProp.height()>0)
	//{
		var propName = tbProp.attr("class").replace("chartProp ","");
		xmlConfigStructure.push('\n\t\t<'+propName+' value="'+value+'"/>');
	//}
});
xmlConfigStructure.push('\n\t</Graph></Graphs></Config>');
return xmlConfigStructure.join("");
}



ESP.renderDesignableChart =function(bForce)
{
		
		var chartType = $("#lbChartType").val()+"";
		var targetImg = $("#imgDesignChart");

		//-- show pie atts and hide those not for pie
		if(chartType.indexOf("Pie")>-1)
		{
			$(".notForPIE").hide();

			if(chartType.indexOf("3D Pie")>-1)
			{
				$(".For3DPIE").show();
				$(".notFor3DPIE").hide();
			}
			else
			{
				$(".For3DPIE").hide();
				$(".notFor3DPIE").show();
			}
			$(".ForPIE").show();
		}
		else
		{
			if(chartType.indexOf("3D")>-1)
			{
				$(".For3D").show();
			}
			else
			{
				$(".For3D").hide();
			}

			$(".ForPIE").hide();
			$(".For3DPIE").hide();
			$(".notFor3DPIE").hide();
			$(".notForPIE").show();
		}

		//-- re-draw chart - construct options as xml and pass to renderer
		var xmlConfigStructure = ESP.constructChartXml("designer",bForce);
		$(".designablechart .warning").hide();
		targetImg.hide();
		var h = targetImg.height();
		var w = targetImg.width();

		var r = new Date().getTime();
		var url = "services/designer/renderDesignChart.php?sessid="+ESP.sessionID+"&confxml=" + encodeURIComponent(xmlConfigStructure) +"&h="+h+"&w="+w+"&r="+r;

		targetImg.error(function(ev) 
		{
			$(this).hide();
			$(".designablechart .warning").text("The chart could not be loaded. Please ensure that the query data results are not empty.");
			$(".designablechart .warning").show();

		}).load(function()
		{
			$(this).show();
		}).attr("src",url);
}