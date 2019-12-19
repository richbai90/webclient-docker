<?php
	//-- get data for # of customers requests raised and status
	class fc_my_requests_status
	{
		var $xml = null;
		function prepareXML()
		{
			$strCallClasses = "('Incident','Problem','Change Request')";
			$appcode = "ITSMF";
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
			$swData = database_connect("swdata");
			$strSelectCustCalls = "select STATUS from OPENCALL where callclass in ('Incident','Problem','Known Error','Change Request') and status not in (18,16,15,17) and owner = '".$GLOBALS['analystid']."' and appcode = '".$appcode."'";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);

			while(!$rsCustCalls->eof)
			{
				//-- output
				switch(strToLower($rsCustCalls->f("status")))
				{
					case "11":
						$intEscalatedAll++;
						break;
					case "10":
						$intEscalatedGroup++;
						break;
					case "9":
						$intEscalatedOwner++;
						break;
					case "8":
						$intIncoming++;
						break;
					case "7":
						$intDeferred++;
						break;
					case "6":
						$intResolved++;
						break;
					case "5":
						$intOffHold++;
						break;
					case "4":
						$intOnHold++;
						break;
					case "3":
						$intUnaccepted++;
						break;
					case "2":
						$intUnassigned++;
						break;
					case "1":
						$intPending++;
						break;
					default:
						$intActive++;
						break;

				}
				$rsCustCalls->movenext();
			}
			$strTemp .="<graph caption='' BgColor='FFFFFF'  xAxisName='' yAxisName='' showNames='1' numdivlines='0' decimalPrecision='0'  numberPrefix='  ' showColumnShadow='0' bgAlpha='100' BorderThickness='1' BorderColor='#FFFFFF' canvasBorderThickness='1' canvasBorderColor='' canvasBgAlpha='100' showLimits='0' formatNumberScale='0'>";
			$strTemp .= $this->add_status_graph_xml_entry("Escalated(A)", $intEscalatedAll, 11, "FF6600", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Escalated(G)", $intEscalatedGroup, 10, "FF9966", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Escalated(O)", $intEscalatedOwner, 9, "FF0000", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Incoming", $intIncoming, 8, "006F00", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Deferred", $intDeferred, 7, "0099FF", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Resolved", $intResolved, 6, "CCCC00", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Off Hold", $intOffHold, 5, "F984A1", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("On Hold", $intOnHold, 4, "A66EDD", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Unaccepted", $intUnaccepted, 3, "8BBA00", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Unassigned", $intUnassigned, 2, "F6BD0F", $strCallClasses, $appcode);
			$strTemp .= $this->add_status_graph_xml_entry("Pending", $intPending, 1, "AFD8F8", $strCallClasses, $appcode);
			$strTemp .="</graph>";
			$this->xml = $strTemp;
		}

		//-- Function to output XML graph entries dependent on whether we are in the web or full client
		function add_status_graph_xml_entry($strName, $intValue, $intStatusValue, $strColor, $strCallClasses, $appcode)
		{
			$strXML="";
			$strCallClassesXML = pfx($strCallClasses);
			if(gv('_webclient')=="1")
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='javascript:_run_fsc_action(&apos;mycallstatus&apos;,&apos;".$intStatusValue."&apos;,&apos;".pfs($GLOBALS['analystid'])."&apos;,&apos;".$appcode."&apos;,100)'/>";
			}
			else
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select h_formattedcallref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, fixbyx, callref from opencall where callclass IN ".$strCallClassesXML." and status=".pfs($intStatusValue)." and owner=&apos;".$GLOBALS['analystid']."&apos; and appcode=&apos;".$appcode."&apos; order by callref desc&amp;limit=100'/>";
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