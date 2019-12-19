<html>
<style>
	body
	{
		margin:0;
		padding:0;
		overflow:hidden;

	}
</style>
<script language="JavaScript" src="../fusioncharts/FusionCharts.js"></script>
<script>

	function load_chart()
	{
		//-- get body with and height
		var oDiv = document.getElementById("chartdiv");
        var myChart = new FusionCharts("../FusionCharts/<?=$_GET['charttype'];?>.swf", "myChartId",  oDiv.offsetWidth, oDiv.offsetHeight);
        myChart.setDataURL("<?=$_GET['dataurl'];?>");
        myChart.render("chartdiv");


	}
</script>
<body onload="load_chart();">
<div id='chartdiv' style='width:100%;height:100%;'></div>
</body>
</html>