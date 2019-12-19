<?php
	//-- call xmlc to query db
	$strAnalystId=$_SESSION['aid'];
	$strGroupId=$_SESSION['gid'];

	$strSQL = _swm_parse_string("select analystid from swanalysts where class=1");
	//echo $strSQL;
	$retAnalystRS = new _swm_rs();
	$retAnalystRS->query("sw_systemdb",$strSQL,true,null);

	$strChartXML="<chart caption='Analyst Calls by Call Status' XAxisName='Analyst' palette='2' animation='1' formatNumberScale='0' numberPrefix='' showValues='0' numDivLines='4' legendPosition='BOTTOM'>";
	$strChartXML.="<categories>";
	while(!$retAnalystRS->eof())
	{
		$strChartXML.="<category label='[:rsa.analystid.htmlvalue]' />";
		$strChartXML= ($retAnalystRS->EmbedDataIntoString("rsa",$strChartXML));
		$retAnalystRS->movenext();
	}
	$strChartXML.="</categories>";

	$strSQL = _swm_parse_string("select count(*) as callcount, owner, status from opencall group by owner, status");
	//echo $strSQL;
	$retRS = new _swm_rs();
	$retRS->query("swdata",$strSQL,true,null);

	
	$rawHTMLContent = "<div id='chartholder' style='align:left;width:315px;height:315px;'></div>";
	
	$retAnalystRS->movefirst();
	$retRS->fetch();
	while(!$retAnalystRS->eof())
	{
		$analystid = "[:rs.analystid.htmlvalue]";
			$analystid = $retAnalystRS->EmbedDataIntoString("rs",$analystid);
		$retRS->movefirst();
		while(!$retRS->eof())
		{
			
			$callowner = "[:rs.owner.htmlvalue]";
			$callowner = $retRS->EmbedDataIntoString("rs",$callowner);

			$callstatus = "[:rs.status.htmlformattedvalue]";
			$callstatus = $retRS->EmbedDataIntoString("rs",$callstatus);
			
			$callcount = "[:rs.callcount.htmlformattedvalue]";
			$callcount = $retRS->EmbedDataIntoString("rs",$callcount);
			
			//echo $callowner . " -- " .$callstatus . "-> ".$callcount."<br>";
			$arrOwnerCallArray[$callowner][$callstatus] = $callcount;

			
				$retRS->movenext();
		}

		
			/*$strChartXML.="<dataset seriesName='[:rs.status.htmlformattedvalue]'>";
			$strChartXML= ($retRS->EmbedDataIntoString("rs",$strChartXML));
			$retRS->movefirst();
			while(!$retRS->eof())
			{
				
				$strChartXML.="<set value='[:rs.callcount.htmlvalue]' />";
				$strChartXML= ($retRS->EmbedDataIntoString("rs",$strChartXML));
				$retRS->movenext();
			}
			$strChartXML.="</dataset>"; */

			echo "<pre>";
	print_r($arrOwnerCallArray);
	echo "</pre>";

		foreach($arrOwnerCallArray as $analyst=>$calls)
		{
			echo $analyst."=".$calls."<br>";
			echo strtolower($analystid)."==".strtolower($analyst)."<br>";
			if(strtolower($analystid)==strtolower($analyst))
			{
				echo "z".$analystid."==".$analyst;
				$strStatusXML="";
				foreach($calls as $status=>$count)
				{
					echo $status."=>".$count."<br>";
					if($strStatusXML=="")
						$strStatusXML="<dataset seriesName='".$status."'>";
					
					$strStatusXML.="<set value='".$count."'/>";
				}
				$strStatusXML.="</dataset>";
			}
		}
		$strChartXML.=$strStatusXML;
		$retAnalystRS->movenext();
	}
	

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
	load_chart("chartholder", "MSColumn2D", "<?php echo $strChartXML; ?>");
</script>