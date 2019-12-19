<?php
	//-- get data for # of customers requests raised and status
	class fc_request_summary_by_callclass
	{
		var $xml = null;
		function prepareXML()
		{
			$intIncident = 0;
			$intProblem = 0;
			$intKnownError = 0;
			$intChangeReq = 0;
			$intReleaseReq = 0;
			$intServiceReq = 0;
			$intOther = 0;

			//-- connect and get those service stats
			$swData = database_connect("syscache");

			$strSelectCustCalls = "select callclass, count(callref) as count from OPENCALL where status !=6 and appcode IN(".gv("datasetfilterlist").") group by callclass";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);

			while(!$rsCustCalls->eof)
			{
				//-- output
				switch(strToLower($rsCustCalls->f("callclass")))
				{
					case "incident":
						$intIncident = $rsCustCalls->f("count");
						break;
					case "problem":
						$intProblem = $rsCustCalls->f("count");
						break;
					case "known error":
						$intKnownError = $rsCustCalls->f("count");
						break;
					case "change request":
						$intChangeReq = $rsCustCalls->f("count");
						break;
					case "release request":
						$intReleaseReq = $rsCustCalls->f("count");
						break;
					case "service request":
						$intServiceReq = $rsCustCalls->f("count");
						break;
					default:
						$intOther = $rsCustCalls->f("count");
						break;

				}
				$rsCustCalls->movenext();
			}
			$strTemp .="<graph decimalPrecision='0' showPercentageValues='0' showNames='1' numberPrefix='' showValues='1' showPercentageInLabel='0' nameTBDistance='1' animation='0' >";
			
			$strTemp .= $this->add_status_graph_xml_entry("Incident", $intIncident, "006F00", "Incident");
			$strTemp .= $this->add_status_graph_xml_entry("Problem", $intProblem, "0099FF", "Problem");
			$strTemp .= $this->add_status_graph_xml_entry("Known Error", $intKnownError, "CCCC00", "Known Error");
			$strTemp .= $this->add_status_graph_xml_entry("Change Request", $intChangeReq, "F984A1", "Change Request");
			$strTemp .= $this->add_status_graph_xml_entry("Release Request", $intReleaseReq, "A66EDD", "Release Request");
			$strTemp .= $this->add_status_graph_xml_entry("Service Request", $intServiceReq, "8BBA00", "Service Request");
		
			$strTemp .="</graph>";
			$this->xml = $strTemp;
		}
		//-- Function to output XML graph entries dependent on whether we are in the web or full client
		function add_status_graph_xml_entry($strName, $intValue, $strColor, $strCallClasses)
		{
			$strXML="";

			if(isset($_SESSION['sw_ap_wwwpath']))
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='javascript:_run_fsc_action(&apos;mycallclass&apos;,&apos;".$strCallClasses."&apos;,&apos;".removeQuotes(gv("datasetfilterlist"))."&apos;,100)'/>";
			}
			else
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select h_formattedcallref, callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, fixbyx from opencall where callclass IN (&apos;".$strCallClasses."&apos;) and status not in (18,17,16,15,6) and appcode IN(".gv("encoded_datasetfilterlist").") order by callref desc&amp;limit=100'/>";
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