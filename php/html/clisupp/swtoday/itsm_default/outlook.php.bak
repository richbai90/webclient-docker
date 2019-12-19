<?php


//-- left hand outlook page for supportworks today
//-- show calendar and graphs for request counts

?>
<html>
<style>
	body
	{
		overflow:auto;
		font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
		font-size:12px;

	}

	.fcTitle
	{
		
	}
</style>
<!-- include fusion charts stuff -->
<script src="..\..\fusioncharts\FusionCharts.js"></script>
<script language="JavaScript">FusionCharts.setCurrentRenderer('javascript');</script>

<script>
	var fcRequestCount;
	function initialise_charts()
	{
		//--- my requests
		var oDivHolder = document.getElementById("fc_requestcount");
		if(oDivHolder)
		{
			var fcRequestCount = new FusionCharts("../../fusioncharts/FCF_Bar2D.swf", "fc_requestcount", oDivHolder.offsetWidth, "100");
			fcRequestCount.setDataURL("charts/request.counts.php");		
			fcRequestCount.render("fc_requestcount");
		}

		//- -groups request
		var oDivHolder = document.getElementById("fc_grprequestcount");
		if(oDivHolder)
		{
			var fcGrpRequestCount = new FusionCharts("../../fusioncharts/FCF_Bar2D.swf", "fc_grprequestcount", oDivHolder.offsetWidth, "100");
			fcGrpRequestCount.setDataURL("charts/request.counts.php");		
			fcGrpRequestCount.render("fc_grprequestcount");
		}

	//- -esc request
		var oDivHolder = document.getElementById("fc_escrequestcount");
		if(oDivHolder)
		{
			var fcEscRequestCount = new FusionCharts("../../fusioncharts/FCF_Bar2D.swf", "fc_escrequestcount", oDivHolder.offsetWidth, "100");
			fcEscRequestCount.setDataURL("charts/request.counts.php");		
			fcEscRequestCount.render("fc_escrequestcount");
		}


	}


</script>

<body onload="initialise_charts();" onresize="resize_charts();">
	<div class='fcTitle' align='center'>My Requests</div>
	<div id="fc_requestcount" align="center" style="width:100%;"></div>  

	<div class='fcTitle'align='center'>My Group Requests</div>
	<div id="fc_grprequestcount" align="center" style="width:100%;"></div>  

	<div class='fcTitle'align='center'>Escalated Requests</div>
	<div id="fc_escrequestcount" align="center" style="width:100%;"></div>  

</body>
</html>
