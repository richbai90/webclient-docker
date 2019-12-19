<?php
	//-- call xmlc to query db
	$strAnalystId=$_SESSION['aid'];
	$strGroupId=$_SESSION['gid'];
	
	$strSQL = _swm_parse_string("select count(*) as callcount, callclass from opencall where owner='".lang_encode_from_utf(_swm_db_pfs($strAnalystId))."' group by callclass");
	//echo $strSQL;
	$retRS = new _swm_rs();
	$retRS->query("swdata",$strSQL,true,null);

	$strChartXML="<chart caption='My Assigned Calls' showPercentValues='1'>";
	$rawHTMLContent = "<div id='chartholder' style='align:left;width:315px;height:315px;'></div>";
	$rawHTMLContent .= "<table class='calldetail' width='100%' border=0><tr><td><b>Call Type</b></td><td><b>Total</b></td></tr>";
	while(!$retRS->eof())
	{
		
		$rawHTMLContent .= "<tr>
									<td width='50%'>
										[:rs.callclass.htmlvalue]
									</td>
									<td width='47%'>
										[:rs.callcount.htmlvalue]
									</td>
							</tr>";
							$strChartXML.="<set label='[:rs.callclass.htmlvalue]' value='[:rs.callcount.htmlvalue]' />";
							$strChartXML= ($retRS->EmbedDataIntoString("rs",$strChartXML));
							$rawHTMLContent = ($retRS->EmbedDataIntoString("rs",$rawHTMLContent));
							
		$retRS->movenext();
	}
	$rawHTMLContent .= "					</table>";
	$strChartXML.="</chart>";
	
	
	

	
	$strOrigin = $_POST["pp__definitionfilepath"];
	if($strOrigin=="")
		$strOrigin = $_POST["_definitionfilepath"];
	$strOtherInputs .= '<input type="hidden" id="_originfilepath" name="_originfilepath" value="'._html_encode($strOrigin).'">';
	
	echo $rawHTMLContent;
?>
<!-- js to support fusion charts graphing -->
<script language="JavaScript" src="../clisupp/fce/FusionCharts.js"></script>
<script src="client/_system/mobile.js"></script>
<script>
	load_chart("chartholder", "Pie2D", "<?php echo $strChartXML; ?>");
</script>