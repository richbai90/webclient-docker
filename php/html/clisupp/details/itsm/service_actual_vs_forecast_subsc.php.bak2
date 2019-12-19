<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include_once("global.settings.php");
	include('itsm_default/xmlmc/common.php');

	$divID="dmd";
	$width = "100%";
	$height = "300px";
	$chartType = "MSLine";
	$dataURL = "charts/actual_vs_forecast_subsc.php";

	$serviceID = $_GET["target"];

	//-- connect and get those service stats
	$swData = database_connect("swdata");
	$strSelectService = "select * from sc_target where pk_auto_id=".$serviceID;
	$rsFolio = $swData->query($strSelectService,true);

	if(!$rsFolio->eof)
	{
		$urlParams = "targetid=".$serviceID;
	}

	if($urlParams!="")
	{
		$initialdataURL = $dataURL."?".$urlParams;
	}
	
	//load_chart($divID,$chartType,$dataURL);
	$strIframeHTML = "<div id='".$divID."' style='background:red;width:".$width.";height:".$height.";'></div>";
//	$strIframeHTML .= "<script autoload>app.load_chart('".$divID."','".$chartType."', '".$initialdataURL."');</script>";

?>
<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
<!--
<div class="boxWrapper" style="margin:0px auto 10px auto; width:770px;"><img src="img/structure/box_header_left.gif" width="6" height="11" alt="" border="0" /><div class="boxMiddle">
<script src="jscript/index.js"></script>-->
<script>
	var fcRequestCount;

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
		<div class="boxContent">
		<div class="spacer">&nbsp;</div>-->
				<!--<h1>Actual vs Forecasted Subscriptions</h1>-->
				
	<div id="activepagecontentColumn" >
		<div id="formArea" style="width:100%;">
				<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
				<div id="swtInfoBody">
						<div class="sectionHead">
								<table class="sectionTitle">
										<tr>
											<td class="titleCell" noWrap><h1><center>Actual vs Forecasted Subscriptions<center></h1></td>
											<td class="endCell"></td>
										</tr>
								</table>	
						</div>
				</div>
		</div>
	</div>	
<?php 	//echo htmlentities($strIframeHTML);
	echo $strIframeHTML;
?>
<!--

		<div class="spacer">&nbsp;</div>
		</div><!-- end of box content --
<!--	</div>
	<div class="boxFooter"><img src="img/structure/box_footer_left.gif" /></div>
</div>--
		</div>
		</td>
	</tr>
</table>
-->