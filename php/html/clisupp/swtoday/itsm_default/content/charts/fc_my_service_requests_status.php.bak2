<?php
	//-- get data for # of customers requests raised and status
	class fc_my_service_requests_status
	{
	    
		var $xml = null;
		function prepareXML()
		{
			//-- Set the list of callclasses to be included in the data report
			$strCallClasses = "('Incident','Problem','Known Error','Change Request','Release Request','Service Request')";
			
			//-- Counters for storing statuc counts
			$intActive = 0;
			$intClosedChg = 0;
			$intCancelled = 0;
			$intClosed = 0;
			$intEscalatedAll = 0;
			$intEscalatedGroup = 0;
			$intEscalatedOwner = 0;
			$intIncoming = 0;
			$intDeferred = 0;
			$intResolved = 0;
			$intOffHold = 0;
			$intOnHold = 0;
			$intUnaccepted = 0;
			$intUnassigned = 0;
			$intPending = 0;
			//-- connect and get those service stats
			$swData = database_connect("syscache");
			$strSelectCustCalls = "select STATUS, count(status) as count from OPENCALL where appcode IN(".gv("datasetfilterlist").") group by status";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);
			while(!$rsCustCalls->eof)
			{
				//-- output
				switch(strToLower($rsCustCalls->f("status")))
				{
					case "11":
						$intEscalatedAll = $rsCustCalls->f("count");
						break;
					case "10":
						$intEscalatedGroup = $rsCustCalls->f("count");
						break;
					case "9":
						$intEscalatedOwner = $rsCustCalls->f("count");
						break;
					case "8":
						$intIncoming = $rsCustCalls->f("count");
						break;
					case "7":
						$intDeferred = $rsCustCalls->f("count");
						break;
					case "6":
						$intResolved = $rsCustCalls->f("count");
						break;
					case "5":
						$intOffHold = $rsCustCalls->f("count");
						break;
					case "4":
						$intOnHold = $rsCustCalls->f("count");
						break;
					case "3":
						$intUnaccepted = $rsCustCalls->f("count");
						break;
					case "2":
						$intUnassigned = $rsCustCalls->f("count");
						break;
					case "1":
						$intPending = $rsCustCalls->f("count");
						break;
					default:
						$intActive = $rsCustCalls->f("count");
						break;

				}
				$rsCustCalls->movenext();
			}

			
			$strTemp = "";
			$strTemp .="<graph caption='' BgColor='F9FCFF'  xAxisName='' yAxisName='' showNames='1' numdivlines='4' decimalPrecision='0' showColumnShadow='0' bgAlpha='100' canvasBorderThickness='1' canvasBorderColor='789AC5' canvasBgAlpha='100' showLimits='0' formatNumberScale='0'>";
		
			$strTemp .= $this->add_status_graph_xml_entry("Escalated(A)", $intEscalatedAll, 11, "FF6600", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Escalated(G)", $intEscalatedGroup, 10, "FF9966", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Escalated(O)", $intEscalatedOwner, 9, "FF0000", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Incoming", $intIncoming, 8, "006F00", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Deferred", $intDeferred, 7, "0099FF", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Resolved", $intResolved, 6, "CCCC00", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Off Hold", $intOffHold, 5, "F984A1", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("On Hold", $intOnHold, 4, "A66EDD", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Unaccepted", $intUnaccepted, 3, "8BBA00", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Unassigned", $intUnassigned, 2, "F6BD0F", $strCallClasses);
			$strTemp .= $this->add_status_graph_xml_entry("Pending", $intPending, 1, "AFD8F8", $strCallClasses);
		
			$strTemp .="</graph>";
			$this->xml = $strTemp;
		}

		//-- Function to output XML graph entries dependent on whether we are in the web or full client
		function add_status_graph_xml_entry($strName, $intValue, $intStatusValue, $strColor, $strCallClasses)
		{
			$strXML="";
			$strCallClassesXML = _pfx($strCallClasses);

			if(isset($_SESSION['sw_ap_wwwpath']))
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='javascript:_run_fsc_action(&apos;callstatus&apos;,&apos;".$intStatusValue."&apos;,&apos;".stripQuotes(gv("datasetfilterlist"))."&apos;,100)'/>";
			}
			else
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select h_formattedcallref, callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, fixbyx from opencall where callclass IN ".$strCallClassesXML." and status=".pfs($intStatusValue)." and appcode IN(".gv("encoded_datasetfilterlist").") order by callref desc&amp;limit=100'/>";
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
	// -- Function to remove quotes from a String for Web Client
	function stripQuotes($strValue)
	{
		return str_replace("'","",$strValue);
	}	
?>