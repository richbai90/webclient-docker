<?php

	//-- get data for # of customers requests raised and status
	class fc_aged_requests
	{
		var $xml = null;
		function prepareXML()
		{
			//-- Set the list of callclasses to be included in the data report
			$strCallClasses = "('Incident','Problem','Known Error','Change Request','Release Request','Service Request')";

			//-- Counters for storing static counts
			$intOneWeek = 0;
			$intThreeWeeks = 0;
			$intSixWeeks = 0;
			$dtToday = time();

			//-- connect and get those service stats
			$swData = database_connect("syscache");
			
			$strSelectCustCalls = "select count(callref) as count from OPENCALL where (((".$dtToday."- logdatex) > 604800) and ((".$dtToday." - logdatex) < 1814400)) and callclass in ".$strCallClasses." and status !=6 and appcode IN(".gv("datasetfilterlist").")";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);

			while(!$rsCustCalls->eof)
			{
				$intOneWeek = $rsCustCalls->f("count");
				$rsCustCalls->movenext();
			}
			$strSelectCustCalls = "select count(callref) as count from OPENCALL where (((".$dtToday."- logdatex) > 1814400) and ((".$dtToday." - logdatex) < 3628800)) and callclass in ".$strCallClasses." and status !=6  and appcode IN(".gv("datasetfilterlist").")";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);

			while(!$rsCustCalls->eof)
			{
				$intThreeWeeks = $rsCustCalls->f("count");
				$rsCustCalls->movenext();
			}
			$strSelectCustCalls = "select count(callref) as count from OPENCALL where ((".$dtToday."- logdatex) >= 3628800) and callclass in ".$strCallClasses." and status !=6  and appcode IN(".gv("datasetfilterlist").")";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);

			while(!$rsCustCalls->eof)
			{
				$intSixWeeks = $rsCustCalls->f("count");
				$rsCustCalls->movenext();
			}
			$strTemp .="<graph caption='' BgColor='F9FCFF'  xAxisName='' yAxisName='' showNames='1' numdivlines='4' decimalPrecision='0' showColumnShadow='0' bgAlpha='100' canvasBorderThickness='1' canvasBorderColor='789AC5' canvasBgAlpha='100' showLimits='0' formatNumberScale='0'>";
			$strTemp .= $this->add_status_graph_xml_entry("&gt; 1 Week", $intOneWeek, "(opencall.logdatex &lt; ".($dtToday-604800)." and opencall.logdatex &gt; ".($dtToday-1814400).")", "F6BD0F", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("&gt; 3 Weeks", $intThreeWeeks, "(opencall.logdatex &lt;= ".($dtToday-1814400)." and opencall.logdatex &gt; ".($dtToday-3628800).")", "FF6600", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("&gt; 6 Weeks", $intSixWeeks, "opencall.logdatex &lt;= ".($dtToday-3628800)."", "FF0000", $strCallClasses);
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
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select callref, h_formattedcallref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, fixbyx from opencall where callclass IN ".$strCallClassesXML." and status not in (18,16,15,17,6) and appcode IN(".gv("encoded_datasetfilterlist").") and ".$timeperiod." order by callref desc&amp;limit=100'/>";
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