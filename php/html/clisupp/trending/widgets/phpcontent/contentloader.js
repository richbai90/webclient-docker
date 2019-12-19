	//-- onload we want to fetch chart data for each chart - only if it is visible though
	$(document).ready(function() 
	{
		(function( $ ) {

		  //-- fetch table content
		  $.fn.tablelistRender = function(tableWidget)
			{
				var gid = tableWidget.attr("gid");
				var cid = tableWidget.attr("cid");
				var wid = tableWidget.attr("wid");
				var height = tableWidget.attr("height");
				if(height!="")tableWidget.height(height);
						

				//-- use jquery ot get data and then load into charts as jquery can POST and it allows us to handle data errors if need be
				var serviceUrl = "services/executeservice.php";
				var p = {};
				p.sessid = ESP.sessionid;
				p.gid=gid;
				p.cid=cid;
				p.wid=wid;
				
				$.post(serviceUrl, p, function(data) 
											{  
												tableWidget.html(data);
											});

			}

		  //-- will fetch table data
		  $.fn.tablelistsReady = function(tableWidget) 
		  {
			if(tableWidget)
			{
				$.fn.tablelistRender(tableWidget);
			}
			else
			{
				$(".portlet-content[wtype=custom]").each(function( index ) 
				{		
					$.fn.tablelistRender($(this));
				});
			}


		  };
		})( jQuery );

		//-- assign  function handler to widgetreadyfunctions
		ESP.onWidgetReadyFunctions["custom"] = $.fn.tablelistsReady;


	});
