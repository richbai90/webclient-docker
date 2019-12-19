<style>
		.drillform
		{
			display:none;
		}
		.drillform *
		{
			font-size:12px;
		}
</style>

<script>
$(function() {

	$( "#drill-form" ).dialog({
		autoOpen: false,
		width: "95%",
		modal: true,
		open:function(){

			var frm = $(this);
			frm.children().remove();
			frm.html("");

		    var wHeight = $(window).height();
	        var dHeight = wHeight * 0.9;
			frm.dialog( "option", "height", dHeight);

			if(frm.data("datarecord"))
			{
				frm.dialog( "option", "title", frm.data("datarecord").h_title + " - Drill Down");

				if(frm.data("datarecord").h_widget_id)
				{
					//-- get widget drill down
					getDrillDownContent(frm.data("datarecord").h_widget_id, "widget");
				}
				else if(frm.data("datarecord").h_id)
				{
					//-- get measure drilldown
					getDrillDownContent(frm.data("datarecord").h_id, "measure");
				}
				else
				{
					alert("Drill down for this widget type is not supported. Please Contact your administrator.");
				}
			}
		},
		close: function() {
			var frm = $(this);
			frm.data("title","");
			frm.children().remove();
			frm.html("");
		}
	});

	function getDrillDownContent(varRecId , strType)
	{

		var p = {};
		p.sessid = ESP.sessionid;
		p.recid = varRecId;
		p.rectype = strType;

		if(ESP.main)
		{
			var serviceUrl = "services/executedrilldown.php";
		}
		else
		{
			var serviceUrl = "../services/executedrilldown.php";
		}
		$.post(serviceUrl, p, function(markup, res,http) 
									{  
										$( "#drill-form" ).append(markup);

									}).error(function(a,b,c)
													{
														alert(b+":"+c);
													});


	}
});
</script>

<div id="drill-form" class='drillform'>
<!-- php content loaded here -->
</div>
