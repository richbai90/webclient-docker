	//-- onload we want to fetch chart data for each chart - only if it is visible though
	$(document).ready(function() 
	{
		(function( $ ) {

		  //-- pointer to loaded charts
		  $.fn.fusionChartPointers = [];

		  //-- fetch chart data
		  $.fn.fusionChartRender = function(fusionWidget)
			{
				var wid = fusionWidget.attr("wid");
				var mode = fusionWidget.attr("mode");
				if(mode=="")mode="fce/Column2D.swf";

				var height = fusionWidget.attr("height");
				if(height=="" || height==undefined)
				{
					height="200px";
				}
					
				var chartid =fusionWidget.attr("id");

				//-- use jquery ot get data and then load into charts as jquery can POST and it allows us to handle data errors if need be
				var serviceUrl = "services/executeservice.php";
				var p = {};
				p.sessid = ESP.sessionid;
				p.wid=wid;

				$.post(serviceUrl, p, function(data) 
											{  
												//-- store pointers to charts - so we do not attempt o re-create if already made
												if($.fn.fusionChartPointers[chartid]==undefined)$.fn.fusionChartPointers[chartid] = new FusionCharts("../"+mode,"fc_" + chartid, "100%", height, "0", "1" );
												$.fn.fusionChartPointers[chartid].setDataXML(data);
												$.fn.fusionChartPointers[chartid].render(chartid);
												
											}).error(function(a,b,c)
												{

												});

			}

		  //-- will fetch chart data
		  $.fn.fusionChartsReady = function(fusionWidget) 
		  {
			if(fusionWidget)
			{
				$.fn.fusionChartRender(fusionWidget);
			}
			else
			{
				$(".portlet-content[wtype=fusion]").each(function( index ) 
				{		
					$.fn.fusionChartRender($(this));
				});
			}


		  };
		})( jQuery );

		//-- assign fusion chart function handler to widgetreadyfunctions
		ESP.onWidgetReadyFunctions["fusion"] = $.fn.fusionChartsReady;


	});
