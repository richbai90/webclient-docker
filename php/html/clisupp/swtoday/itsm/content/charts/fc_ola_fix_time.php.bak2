<?php

	//-- get data for # of customers requests raised and status
	class fc_ola_fix_time
	{
		var $xml = null;
		function prepareXML()
		{
			$intFixGreaterThanFiveDays = 0;
			$intFixFiveDays = 0;
			$intFixTomorrow = 0;
			$intFixToday = 0;
			$intFixAtRisk = 0;	//-- Will code the default to be within 2 hours
			$intBreached = 0;
			//-- Get Current Time
			$dtNow = time();
			
			//-- connect and get those service stats
			$swData = database_connect("syscache");
			
			$strSelectCustCalls = "select fixbyx from OPENCALL where callclass in ('OLA Task') and status != 6 and appcode IN(".gv("datasetfilterlist").") and fixbyx<".$dtNow."";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);
			if(is_object($rsCustCalls))
			{
				$intBreached = $rsCustCalls->recordcount;
			}
			
			$strSelectCustCalls2 = "select fixbyx from OPENCALL where callclass in ('OLA Task') and status != 6 and appcode IN(".gv("datasetfilterlist").") and fixbyx>=".$dtNow." and fixbyx<".($dtNow+7200)." ";
			
			$rsCustCalls2 = $swData->query($strSelectCustCalls2,true);
			if(is_object($rsCustCalls2))
			{
				$intFixAtRisk = $rsCustCalls2->recordcount;
			}
			
			$date1 = mktime(23,59,59,date('n'),date('j'),date('Y'));
			$strSelectCustCalls3 = "select fixbyx from OPENCALL where callclass in ('OLA Task') and status != 6 and appcode IN(".gv("datasetfilterlist").") and (fixbyx * -1) >= 7200 and fixbyx <= ".$date1."";
			$rsCustCalls3 = $swData->query($strSelectCustCalls3,true);
			if(is_object($rsCustCalls3))
			{
				$intFixToday = $rsCustCalls3->recordcount;
			}

			$date2 = (mktime(23,59,59,date('n'),date('j'),date('Y')) + 86400);
			$strSelectCustCalls4 = "select fixbyx from OPENCALL where callclass in ('OLA Task') and status != 6 and appcode IN(".gv("datasetfilterlist").") and fixbyx >= ".$date1." and fixbyx <= ".$date2."";
			$rsCustCalls4 = $swData->query($strSelectCustCalls4,true);
			if(is_object($rsCustCalls4))
			{
				$intFixTomorrow = $rsCustCalls4->recordcount;
			}

			$date3 = (mktime(23,59,59,date('n'),date('j'),date('Y')) + (86400 * 5));
			$strSelectCustCalls5 = "select fixbyx from OPENCALL where callclass in ('OLA Task') and status != 6 and appcode IN(".gv("datasetfilterlist").") and fixbyx >= ".$date2." and fixbyx <= ".$date3."";
			$rsCustCalls5 = $swData->query($strSelectCustCalls5,true);
			if(is_object($rsCustCalls5))
			{
				$intFixFiveDays = $rsCustCalls5->recordcount;
			}
			
			$date4 = (mktime(23,59,59,date('n'),date('j'),date('Y')) + (86400 * 5));
			$strSelectCustCalls6 = "select fixbyx from OPENCALL where callclass in ('OLA Task') and status != 6 and appcode IN(".gv("datasetfilterlist").") and fixbyx >= ".$date4."";
			$rsCustCalls6 = $swData->query($strSelectCustCalls6,true);
			
			if(is_object($rsCustCalls6))
			{
				$intFixGreaterThanFiveDays = $var;
			}

			
			$strTemp .= "<graph caption='' BgColor='F9FCFF' decimalPrecision='0' showPercentageValues='0' showNames='1' numberPrefix='' showValues='1' showPercentageInLabel='0' pieYScale='70' pieBorderAlpha='40' pieFillAlpha='70' pieSliceDepth='15' pieRadius='45'>";
		
			$strTemp .= $this->add_status_graph_xml_entry("Breached", $intBreached, "fixbyx&lt;".$dtNow." and fixbyx&gt;0", "FF0000");
			$strTemp .= $this->add_status_graph_xml_entry("At Risk", $intFixAtRisk, "(fixbyx&gt;=".$dtNow." and fixbyx&lt;".($dtNow+7200).")", "FF6600");
			$strTemp .= $this->add_status_graph_xml_entry("Today", $intFixToday, "(fixbyx&gt;=".$dtNow." and fixbyx&lt;=".mktime(23,59,59,date('n'),date('j'),date('Y')).")", "FF9966");
			$strTemp .= $this->add_status_graph_xml_entry("Next Day", $intFixTomorrow, "(fixbyx&gt;=".(mktime(0,0,0,date('n'),date('j'),date('Y'))+86400)." and fixbyx&lt;=".(mktime(23,59,59,date('n'),date('j'),date('Y'))+86400).")", "4A4499");
			$strTemp .= $this->add_status_graph_xml_entry("In Five Days", $intFixFiveDays, "(fixbyx&gt;".(mktime(23,59,59,date('n'),date('j'),date('Y'))+86400)." and fixbyx&lt;=".(mktime(23,59,59,date('n'),date('j'),date('Y'))+(86400*5)).")", "006F00");
			$strTemp .= $this->add_status_graph_xml_entry("> Five Days", $intFixGreaterThanFiveDays, "fixbyx&gt;".(mktime(23,59,59,date('n'),date('j'),date('Y'))+(86400*5))."", "8BBA00");
	
			$strTemp .= "</graph>";
			$this->xml = $strTemp;
		}
		//-- Function to output XML graph entries dependent on whether we are in the web or full client
		function add_status_graph_xml_entry($strName, $intValue, $timeperiod, $strColor)
		{
			$strXML="";

			if(isset($_SESSION['sw_ap_wwwpath']))
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='javascript:_run_fsc_action(&apos;mycallolastatus&apos;,&apos;".$timeperiod."&apos;,&apos;".removeQuotes(gv("datasetfilterlist"))."&apos;,100)'/>";
			}
			else
			{
				
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select callref, h_formattedcallref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, fixbyx from opencall where callclass IN (&apos;OLA Task&apos;) and status not in (18,16,15,17) and appcode IN(".gv("encoded_datasetfilterlist").") and ".$timeperiod." order by callref asc&amp;limit=100'/>";
			}		
		
			return $strXML;
		}


		function getXML()
		{
			if($this->xml==null)
				$this->prepareXML();
			return $this->xml;
		}
	}
?>