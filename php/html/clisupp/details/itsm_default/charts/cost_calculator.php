<?php 
	//-- get data for # of customers requests raised and status - used in homepage.xml
	include('itsm_default/xmlmc/common.php');

	$serviceID = $_GET['serviceid'];
	$sbCost = $_GET['sb_cost'];
	$rqCost = $_GET['rq_cost'];
	$mntCost = $_GET['mnt_cost'];

	$sbCnt = $_GET['sb_cnt'];
	$rqCnt = $_GET['rq_cnt'];

	$sbCost = $sbCost * $sbCnt;
	$rqCost = $rqCost * $rqCnt;

	$prjsbCost = $_GET['sb_prj'];
	$prjrqCost = $_GET['rq_prj'];
	$prjmntCost = $_GET['mnt_prj'];

	$prjsbCost = $prjsbCost * $sbCnt;
	$prjrqCost = $prjrqCost * $rqCnt;
	
	$totalCost = floatval($sbCost)+floatval($rqCost)+floatval($mntCost);
	$totalProjCost = floatval($prjsbCost)+floatval($prjrqCost)+floatval($prjmntCost);

?>
<!--
<graph caption='' BgColor='F9FCFF'  xAxisName='' yAxisName='' showNames='1' numdivlines='0' decimalPrecision='0' showColumnShadow='0' bgAlpha='100' canvasBorderThickness='0' canvasBorderColor='F9FCFF' canvasBgAlpha='0' showLimits='0' formatNumberScale='0'>
   <?php 
	if($intActive>0)echo "<set name='Active' value='".$intActive."' color='4A4499' link=\"JavaScript:parent.show_customers_active_calls('custreqs',0);\"/>";
	if($intResolved>0)echo "<set name='Resolved' value='".$intResolved."' color='009C00' link=\"JavaScript:parent.show_customers_resolved_calls('custreqs',0);\"/>";
	if($intOnHold>0)echo "<set name='On-Hold' value='".$intOnHold."' color='F6BD0F' link=\"JavaScript:parent.show_customers_hold_calls('custreqs',0);\"/>";
	?>
</graph>
-->
<graph  caption="Cost Forecast" 
                shownames="1" 
                showvalues="1" 
                numberPrefix="$" 
                bgColor="E4E7D9" 
                bgAlpha='40' 
                showAlternateHGridColor='1' 
                AlternateHGridAlpha='30' 
                AlternateHGridColor='E4E7D9' 
                divLineColor='E4E7D9' 
                divLineAlpha='80' 
                canvasBorderThickness='1' 
                canvasBorderColor='114B78' 
                limitsDecimalPrecision='0' 
                divLineDecimalPrecision='0' 
                decimalPrecision="2">

<categories>
        <category name="Maintenance"/>
        <category name="Subscription"/>
        <category name="Request"/>
        <category name="Total"/>
</categories>

<dataset seriesName="Current" color="F6BD0F">
        <set value="<?php echo $mntCost;?>"/>
        <set value="<?php echo $sbCost;?>"/>
        <set value="<?php echo $rqCost;?>"/>
        <set value="<?php echo $totalCost;?>"/>
</dataset>

<dataset seriesName="Projected" color="AFD8F8">
        <set value="<?php echo $prjmntCost;?>"/>
        <set value="<?php echo $prjsbCost;?>"/>
        <set value="<?php echo $prjrqCost;?>"/>
        <set value="<?php echo $totalProjCost;?>"/>
</dataset>

</graph>
