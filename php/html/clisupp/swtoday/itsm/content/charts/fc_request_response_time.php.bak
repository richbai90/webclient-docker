<?php

	class fc_request_response_time
	{
		var $xml = null;
		function prepareXML()
		{
			//-- Set the list of callclasses to be included in the data report
			$strCallClasses = "('Incident','Problem','Known Error','Change Request','Release Request','Service Request')";

			$intRespGreaterThanFiveDays = 0;
			$intRespFiveDays = 0;
			$intRespTomorrow = 0;
			$intRespToday = 0;
			$intRespAtRisk = 0;	//-- Will code the default to be within 2 hours
			$intBreached = 0;
			//-- Get Current Time
			$dtNow = time();

			//-- Limit report for 3 months
			$intThreeMonths = $dtNow - 7889321; //-- 3 months ago
			
			//-- connect and get those service stats
			$swData = database_connect("syscache");

			$strSelectCustCalls = "select respondbyx from OPENCALL where callclass in ".$strCallClasses." and logdatex > ".$intThreeMonths." and status not in (6,18,16,15,17) and appcode IN(".gv("datasetfilterlist").") and respondbyx<".$dtNow." and respondbyx>=0 and (slaresp is null or slaresp=0)";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);
			if(is_object($rsCustCalls))
			{
				$intBreached = $rsCustCalls->recordcount;
			}
			
			$strSelectCustCalls2 = "select respondbyx from OPENCALL where callclass in ".$strCallClasses." and logdatex > ".$intThreeMonths." and status not in (6,18,16,15,17) and appcode IN(".gv("datasetfilterlist").") and respondbyx>=".$dtNow." and respondbyx<".($dtNow+7200)." and (slaresp is null or slaresp=0)";
			
			$rsCustCalls2 = $swData->query($strSelectCustCalls2,true);
			if(is_object($rsCustCalls2))
			{
				$intRespAtRisk = $rsCustCalls2->recordcount;
			}
			
			$date1 = mktime(23,59,59,date('n'),date('j'),date('Y'));
			$strSelectCustCalls3 = "select respondbyx from OPENCALL where callclass in ".$strCallClasses." and logdatex > ".$intThreeMonths." and status not in (6,18,16,15,17) and appcode IN(".gv("datasetfilterlist").") and (respondbyx * -1) >= 7200 and respondbyx <= ".$date1." and (slaresp is null or slaresp=0)";
			$rsCustCalls3 = $swData->query($strSelectCustCalls3,true);
			if(is_object($rsCustCalls3))
			{
				$intRespToday = $rsCustCalls3->recordcount;
			}

			$date2 = (mktime(23,59,59,date('n'),date('j'),date('Y')) + 86400);
			$strSelectCustCalls4 = "select respondbyx from OPENCALL where callclass in ".$strCallClasses." and logdatex > ".$intThreeMonths." and status not in (6,18,16,15,17) and appcode IN(".gv("datasetfilterlist").") and respondbyx >= ".$date1." and respondbyx <= ".$date2." and (slaresp is null or slaresp=0)";
			$rsCustCalls4 = $swData->query($strSelectCustCalls4,true);
			if(is_object($rsCustCalls4))
			{
				$intRespTomorrow = $rsCustCalls4->recordcount;
			}

			$date3 = (mktime(23,59,59,date('n'),date('j'),date('Y')) + (86400 * 5));
			$strSelectCustCalls5 = "select respondbyx from OPENCALL where callclass in ".$strCallClasses." and logdatex > ".$intThreeMonths." and status not in (6,18,16,15,17) and appcode IN(".gv("datasetfilterlist").") and respondbyx >= ".$date2." and respondbyx <= ".$date3." and (slaresp is null or slaresp=0)";
			$rsCustCalls5 = $swData->query($strSelectCustCalls5,true);
			if(is_object($rsCustCalls5))
			{
				$intRespFiveDays = $rsCustCalls5->recordcount;
			}
			
			$date4 = (mktime(23,59,59,date('n'),date('j'),date('Y')) + (86400 * 5));
			$strSelectCustCalls6 = "select respondbyx from OPENCALL where callclass in ".$strCallClasses." and logdatex > ".$intThreeMonths." and status not in (6,18,16,15,17) and appcode IN(".gv("datasetfilterlist").") and respondbyx >= ".$date4." and (slaresp is null or slaresp=0)";
			$rsCustCalls6 = $swData->query($strSelectCustCalls6,true);
			
			if(is_object($rsCustCalls6))
			{
				$intRespGreaterThanFiveDays = $var;
			}

			$strTemp .="<graph caption='' BgColor='F9FCFF' decimalPrecision='0' showPercentageValues='0' showNames='1' numberPrefix='' showValues='1' showPercentageInLabel='0' pieYScale='70' pieBorderAlpha='40' pieFillAlpha='70' pieSliceDepth='15' pieRadius='45'>";
		
			$strTemp .= $this->add_status_graph_xml_entry("Breached", $intBreached, "respondbyx&lt;".$dtNow." and respondbyx&gt;0 and logdatex &gt; ".$intThreeMonths." and respondbyx&gt;0 and (slaresp is null or slaresp=0)", "FF0000", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("At Risk", $intRespAtRisk, "(respondbyx&gt;=".$dtNow." and respondbyx&lt;".($dtNow+7200).") and logdatex &gt; ".$intThreeMonths."  and respondbyx&gt;0 and (slaresp is null or slaresp=0)", "FF6600", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Today", $intRespToday, "(respondbyx&gt;=".$dtNow." and respondbyx&lt;=".mktime(23,59,59,date('n'),date('j'),date('Y')).") and logdatex &gt; ".$intThreeMonths."  and respondbyx&gt;0 and (slaresp is null or slaresp=0)", "FF9966", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Next Day", $intRespTomorrow, "(respondbyx&gt;=".(mktime(0,0,0,date('n'),date('j'),date('Y'))+86400)." and respondbyx&lt;=".(mktime(23,59,59,date('n'),date('j'),date('Y'))+86400).") and logdatex &gt; ".$intThreeMonths."  and respondbyx&gt;0 and (slaresp is null or slaresp=0)", "4A4499", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("In Five Days", $intRespFiveDays, "(respondbyx&gt;".(mktime(23,59,59,date('n'),date('j'),date('Y'))+86400)." and respondbyx&lt;=".(mktime(23,59,59,date('n'),date('j'),date('Y'))+(86400*5)).") and logdatex &gt; ".$intThreeMonths."  and respondbyx&gt;0 and (slaresp is null or slaresp=0)", "006F00", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("> Five Days", $intRespGreaterThanFiveDays, "respondbyx&gt;".(mktime(23,59,59,date('n'),date('j'),date('Y'))+(86400*5))." and logdatex &gt; ".$intThreeMonths."  and respondbyx&gt;0 and (slaresp is null or slaresp=0)", "8BBA00", $strCallClasses);
	
			$strTemp .="</graph>";
			$this->xml = $strTemp;
		}

	//-- Function to output XML graph entries dependent on whether we are in the web or full client
	function add_status_graph_xml_entry($strName, $intValue, $timeperiod, $strColor, $strCallClasses)
	{
		$strXML="";
		$strCallClassesXML = _pfx($strCallClasses);

		if(isset($_SESSION['sw_ap_wwwpath']))
		{
			if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='javascript:_run_fsc_action(&apos;mycallaged&apos;,&apos;".$timeperiod."&apos;,&apos;".removeQuotes(gv("datasetfilterlist"))."&apos;,100)'/>";
		}
		else
		{
			if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select callref, h_formattedcallref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, respondbyx from opencall where callclass IN ".$strCallClassesXML." and status not in (18,16,15,17,6) and appcode IN(".gv("encoded_datasetfilterlist").") and ".$timeperiod." and (slaresp is null or slaresp=0) order by callref asc&amp;limit=100'/>";
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