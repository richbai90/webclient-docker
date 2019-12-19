<?php 	include('itsm_default/xmlmc/common.php');
	include_once("global.settings.php");

	$divID="dmd";
	$width = "100%";
	$height = "300px";
	$chartType = "MSColumn2D";
	$dataURL = "charts/cost_calculator.php";

	$serviceID = gv('in_service');

	//-- connect and get those service stats
	$swData = database_connect("swdata");
	$strSelectService = "select * from sc_folio where fk_cmdb_id=".pfs($serviceID);
	$rsFolio = $swData->query($strSelectService,true);

	if(!$rsFolio->eof)
	{

		$cstRequest = $rsFolio->f("cost_request");
		$cstMaint = $rsFolio->f("cost_maintenance");
		$cstSubs = $rsFolio->f("cost_subscription");
		$serviceName = $rsFolio->f("vsb_title");
		$urlParams = "sb_cost=".$cstSubs."&rq_cost=".$cstRequest."&mnt_cost=".$cstMaint."&sb_prj=&rq_prj=&mnt_prj=&sb_cnt=1&rq_cnt=1&serviceid=".$serviceID;
	}

	if($urlParams!="")
	{
		$initialdataURL = $dataURL."?".$urlParams;
	}

	$strSelectForecasts = "select * from sc_target where fk_auto_id=".pfs($serviceID);
	$rsForecasts = $swData->query($strSelectForecasts,true);
	$options = "<option disptext='' reqtarget='1' subtarget='1' value='0'></option>";
	while(!$rsForecasts->eof)
	{

		$intID = $rsForecasts->f("pk_auto_id");
		$strName = $rsForecasts->f("target_name");
		$intAveReqCost = $rsForecasts->f("ave_request_cost");
		$intAveSubsCost = $rsForecasts->f("ave_subsc_cost");
		$intReqTarget = $rsForecasts->f("request_target");
		$intSubsTarget = $rsForecasts->f("subsc_target");
		$intStartYear = $rsForecasts->f("start_year");
		$intStartMonth = $rsForecasts->f("start_month");
		$strDate = date("M", mktime(0, 0, 0, $intStartMonth));

		$options .= "<option disptext='".$strDate."-".$intStartYear."' reqtarget='".$intReqTarget."' reqcost='".$intAveReqCost."' subcost='".$intAveSubsCost."' subtarget='".$intSubsTarget."' value='".$intID."'>".$strName."</option>";
		$rsForecasts->movenext();
	}
	
	//load_chart($divID,$chartType,$dataURL);
	$strIframeHTML = "<div id='".$divID."' style='background:red;width:".$width.";height:".$height.";'></div>";

?>
<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script>
	function resize_charts()
	{
		app.load_chart('<?php echo $divID;?>','<?php echo $chartType;?>', '<?php echo $initialdataURL;?>');
		
	}

</script>
<script src="jscript/portal.control.js"></script>
<script src="../../fce/FusionCharts.js"></script>
<script language="JavaScript">FusionCharts.setCurrentRenderer('javascript');</script>
<body onload="resize_charts();" onresize="resize_charts();" style="min-width:240px;">

<!--
<div class="boxWrapper" style="margin:0px auto 10px auto; width:770px;"><img src="img/structure/box_header_left.gif" width="6" height="11" alt="" border="0" /><div class="boxMiddle">-->
	<div class="boxContent">

<!-- ES F0109085 -->				
	<body class="activepagebody">
	<div id="activepagecontentColumn" >
		<div id="formArea" style="width:100%;">
				<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
				<div id="swtInfoBody">
						<div class="sectionHead">
								<table class="sectionTitle">
										<tr>
											<td class="titleCell" noWrap><h1><center><?php echo "Cost Forecasting - "?><?php echo lang_encode_from_utf($serviceName);?><center></h1></td>
											<td class="endCell"></td>
										</tr>
								</table>	
						</div>
				</div>
		</div>
	</div>	
				
	<table width="100%" cellpadding="0" cellspacing="2">
		<tr>
			<td>
			<div id="page_holder">
			  <form id="dmd_form" action="" accept-charset="UTF-8">
				<table cellspacing="2" cellpadding="2" border="0" width="100%">
				<tr>
				<td>
					    <table cellspacing="2" cellpadding="2">
						<tr>
							<th colspan="2" align="left" class="fhead">Current Details</th>
						</tr>
						<tr>
							<td class="right" width="100px">Subscription Cost</td><td> <input type="text" id="sb_cost" style="width:200px;"  value="<?php echo $cstSubs;?>"/></td>
						</tr>
						<tr>
							<td class="right" width="100px">Request Cost</td><td> <input type="text" id="rq_cost" style="width:200px;"  value="<?php echo $cstRequest;?>"/></td>
						</tr>
						<tr>
							<td class="right" width="100px">Maintenance Cost</td><td> <input type="text" id="mnt_cost" style="width:200px;"  value="<?php echo $cstMaint;?>"/></td>
						</tr>
						</table>
				</td>
				<td valign="top">
					    <table cellspacing="2" cellpadding="2">
						<tr>
							<th colspan="2" align="left" class="fhead">Projected Cost Details</th>
						</tr>
						<tr>
							<td class="right" width="100px">Subscription Cost</td><td> <input type="text" id="sb_prj" style="width:200px;" /></td>
						</tr>
						<tr>
							<td class="right" width="100px">Request Cost</td><td> <input type="text" id="rq_prj" style="width:200px;" /></td>
						</tr>
						<tr>
							<td class="right" width="100px">Maintenance Cost</td><td> <input type="text" id="mnt_prj" style="width:200px;"/></td>
						</tr>
						</table>
				</td>
				</tr>
				<tr>
					<td>

					    <table cellspacing="2" cellpadding="2">
						<tr>
							<th colspan="2" align="left" class="fhead">Quantities</th>
						</tr>
						<tr>
							<td id='tdForecast' class="right" width="100px"></td><td id="tdForecastText" width="100px"></td>
						</tr>
						<tr>
							<td id='tdDispTextTitle' class="right" width="100px"></td><td id="tdDispText" width="100px"></td>
						</tr>
						<tr>
							<td class="right" width="100px">New Subscriptions</td><td> <input type="text" id="sb_cnt" style="width:200px;" onchange="var oID=document.getElementById('tdDispText');oID.innerHTML = '';var oID=document.getElementById('tdDispTextTitle');oID.innerHTML = '';var oID=document.getElementById('tdForecast');oID.innerHTML = '';var oID=document.getElementById('tdForecastText');oID.innerHTML = '';var oID=document.getElementById('forecast');oID.value=0;"value="1"/></td>
						</tr>
						<tr>
							<td class="right" width="100px">Number of Requests</td><td> <input type="text" id="rq_cnt" style="width:200px;" onchange="var oID=document.getElementById('tdDispText');oID.innerHTML = '';var oID=document.getElementById('tdDispTextTitle');oID.innerHTML = '';var oID=document.getElementById('tdForecast');oID.innerHTML = '';var oID=document.getElementById('tdForecastText');oID.innerHTML = '';var oID=document.getElementById('forecast');oID.value=0;" value="1" /></td>
						</tr>
						<tr>
							<td class="right" width="100px">Load Forecast</td><td><select id="forecast" onchange="var oMnt=document.getElementById('mnt_cost');var oPrjMnt=document.getElementById('mnt_prj');oPrjMnt.value =oMnt.value;var oReq=document.getElementById('sb_prj');oReq.value = this.options[this.selectedIndex].getAttribute('subcost');var oReq=document.getElementById('rq_prj');oReq.value = this.options[this.selectedIndex].getAttribute('reqcost');var oReq=document.getElementById('rq_cnt');oReq.value = this.options[this.selectedIndex].getAttribute('reqtarget');var oSub=document.getElementById('sb_cnt');oSub.value = this.options[this.selectedIndex].getAttribute('subtarget');var oID=document.getElementById('tdDispText');oID.innerHTML = this.options[this.selectedIndex].getAttribute('disptext');var oID=document.getElementById('tdDispTextTitle');oID.innerHTML = 'Year Starting:';var oID=document.getElementById('tdForecastText');oID.innerHTML = this.options[this.selectedIndex].text;var oID=document.getElementById('tdForecast');oID.innerHTML = 'Forecast:';" style="width:200px;" /><?php echo $options;?></select></td>
						</tr>
						</table>
					</td>
				</tr>
				</table>
			<input type="hidden" id="serviceid" value="<?php echo $serviceID;?>">
		  </form>
			
	<input type="button" name="btn_submit" id="btn_submit" onclick="var oForm = document.getElementById('dmd_form');
var oURL = get_form_url_data(oForm);load_chart('<?php echo $divID;?>','<?php echo $chartType;?>','<?php echo $dataURL;?>?'+oURL);" value="Recalculate" />
<?php 	echo $strIframeHTML;
?>
		<div class="spacer">&nbsp;</div>
		</div><!-- end of box content -->