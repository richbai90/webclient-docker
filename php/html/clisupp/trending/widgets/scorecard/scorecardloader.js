	//-- onload we want to fetch chart data for each chart - only if it is visible though
	$(document).ready(function() 
	{
		(function( $ ) {

		  //-- fetch table content
		  $.fn.scorecardRender = function(scorecardWidget)
			{
				var gid = scorecardWidget.attr("gid");
				var cid = scorecardWidget.attr("cid");
				var wid = scorecardWidget.attr("wid");
				var height = scorecardWidget.attr("height");
				if(height!="")scorecardWidget.height(height);
						

				//-- use jquery ot get data and then load into charts as jquery can POST and it allows us to handle data errors if need be
				var serviceUrl = "services/executeservice.php";
				var p = {};
				p.sessid = ESP.sessionid;
				p.gid=gid;
				p.cid=cid;
				p.wid=wid;
				
				$.post(serviceUrl, p, function(data) 
											{  
												scorecardWidget.html(data).end();
												initialise_measure_anchors(scorecardWidget);
											});

			}

		  //-- will fetch table data
		  $.fn.scorecardsReady = function(scorecardWidget) 
		  {
			if(scorecardWidget)
			{
				scorecardWidget.addClass("scrollable");
				$.fn.scorecardRender(scorecardWidget);
			}
			else
			{
				$(".portlet-content[wtype=scorecard]").each(function( index ) 
				{		
					$(this).addClass("scrollable");
					$.fn.scorecardRender($(this));
				});
			}


		  };
		})( jQuery );

		//-- assign  function handler to widgetreadyfunctions
		ESP.onWidgetReadyFunctions["scorecard"] = $.fn.scorecardsReady;


	});
