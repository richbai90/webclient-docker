<?php


	//-- get data for # of customers requests raised and status
	class fc_requests_logged_vs_closed
	{
		var $xml = null;
		function prepareXML()
		{
	
			//-- Set the list of callclasses to be included in the data report
			$strCallClasses = "('Incident','Problem','Known Error','Change Request','Release Request','Service Request')";

			$arrIntLogged = array();
			$arrIntResolved = array();
			
			// new code to cater for 12 previous months ending at the end of last month
			
			//-- Current Year
			$year = date('Y') - 1; // start a year ago
			$thisMonthNum = date('m');
			$thisMonthNum += 0; // converts 01 to 1 so that array elements can be accurately identified
			$thisMonth = date('M',mktime(0,0,0,$thisMonthNum,1,$year));
		
			$strCategories = "<categories>";
			
			for($i=1;$i < 13;$i++)
			{
				$strMonth = date('M',mktime(0,0,0,$thisMonthNum,1,$year));
				$months[] = $thisMonthNum;	
				$arrIntLogged[$thisMonthNum] = 0;
				$arrIntResolved[$thisMonthNum] = 0;				
				$startDate[$thisMonthNum] = mktime(0, 0, 0, $thisMonthNum, 1, $year);
				$endDate[$thisMonthNum] = mktime(0, 0, 0, ($thisMonthNum + 1), 1, $year);

				// for MS SQL we only need the start and end of the full period
				if ($i == 1) // First month in the range - use it to generate the start date
				{
					$startPeriod = $startDate[$thisMonthNum];
				}
				if ($i == 12) // End month in the range - use it to generate the end date
				{
					$endPeriod = $endDate[$thisMonthNum];
				}		
				
				$strCategories .= "<category name='".$strMonth."' hovertext='".$strMonth."'/>";
				
				// want calls up to the end of last month (start of this month)
				if ($thisMonthNum == 12)
				{
					$thisMonthNum = 1;
					$year++;
				}
				else
					$thisMonthNum++; 
			}
			
			//-- connect and get those service stats
			$swData = database_connect("swdata");
			
			// Get the database type - we'll use this to choose the quicker SQL script
			$strDbType = $swData->get_database_type();
			
			// Logged			
			if ($strDbType == "mssql")
			{						
				$strSelectLoggedCustCalls = "select month(dateadd(s,logdatex,'19700101')) as mth,";
				$strSelectLoggedCustCalls .= " count(callref) as cnt";
				$strSelectLoggedCustCalls .= " from opencall";
				$strSelectLoggedCustCalls .= " where logdatex >= " . $startPeriod . " and logdatex < ". $endPeriod;
				$strSelectLoggedCustCalls .= " and callclass in ('Incident','Problem','Known Error','Change Request','Release Request','Service Request') ";
				$strSelectLoggedCustCalls .= " and status not in (15,17)";
				$strSelectClosedCustCalls .= " and appcode IN(".gv("datasetfilterlist").")";
				$strSelectLoggedCustCalls .= " group by month(dateadd(s,logdatex,'19700101'))";
				
				// Run the SQL
				$rsLoggedCustCalls = $swData->query($strSelectLoggedCustCalls,true);
				while(!$rsLoggedCustCalls->eof)
				{
					$strLogged = $rsLoggedCustCalls->f("cnt");
					$dataMonth = $rsLoggedCustCalls->f("mth");
					
					$arrIntLogged[$dataMonth] = $strLogged;
					
					$rsLoggedCustCalls->movenext();
				}
				
				// Closed				
				$strSelectClosedCustCalls = "select month(dateadd(s,closedatex,'19700101')) as mth,";
				$strSelectClosedCustCalls .= " count(callref) as cnt";
				$strSelectClosedCustCalls .= " from opencall";
				$strSelectClosedCustCalls .= " where closedatex >= " . $startPeriod . " and closedatex < ". $endPeriod;
				$strSelectClosedCustCalls .= " and callclass in ('Incident','Problem','Known Error','Change Request','Release Request','Service Request') ";
				$strSelectClosedCustCalls .= " and status in (18,16,6)";
				$strSelectClosedCustCalls .= " and appcode IN(".gv("datasetfilterlist").")";
				$strSelectClosedCustCalls .= " group by month(dateadd(s,closedatex,'19700101'))";
				
				// Run the SQL
				$rsClosedCustCalls = $swData->query($strSelectClosedCustCalls,true);
				while(!$rsClosedCustCalls->eof)
				{
					$strClosed = $rsClosedCustCalls->f("cnt");
					$dataMonth = $rsClosedCustCalls->f("mth");
					$arrIntResolved[$dataMonth] = $strClosed;
					
					$rsClosedCustCalls->movenext();
				}
			} // if mssql
			else // non mssql database
			{			
				//-- For Each start and end of the month get unix time for both
				foreach($months as $month => $value)
				{
					$startofmonth = $startDate[$value];
					$endofmonth = $endDate[$value];	
					
					$strSelectLoggedCustCalls = "select count(callref) as cnt from OPENCALL where callclass in ".$strCallClasses." and status not in (15,17) and appcode IN(".gv("datasetfilterlist").") and logdatex >= ".$startofmonth." and logdatex < ".$endofmonth;
					$rsLoggedCustCalls = $swData->query($strSelectLoggedCustCalls,true);
					while(!$rsLoggedCustCalls->eof)
					{
						$strLogged = $rsLoggedCustCalls->f("cnt");
						//$arrIntLogged[date("M", mktime(0, 0, 0, $month + 1, 10))] = $strLogged;
						$arrIntLogged[$value] = $strLogged;
						$rsLoggedCustCalls->movenext();
					}					
				}

				// Resolved & Closed
				//-- For Each start and end of the month get unix time for both
				foreach($months as $month => $value)
				{
					$startofmonth = $startDate[$value];
					$endofmonth = $endDate[$value];	
					
					$strSelectResolvedCustCalls = "select count(callref) as cnt from OPENCALL where callclass in ".$strCallClasses." and status in (18,16,6) and appcode IN(".gv("datasetfilterlist").") and closedatex >= ".$startofmonth." and closedatex < ".$endofmonth;
					$rsResolvedCustCalls = $swData->query($strSelectResolvedCustCalls,true);
					while(!$rsResolvedCustCalls->eof)
					{
						$strResolved = $rsResolvedCustCalls->f("cnt");
						//$arrIntResolved[date("M", mktime(0, 0, 0, $month + 1, 10))] = $strResolved;
						$arrIntResolved[$value] = $strResolved;
						$rsResolvedCustCalls->movenext();
					}					
				}
			} // else (not mssql)
			
			
			$strTemp .="<graph caption='' subCaption='' xAxisName='' yAxisName='Calls' canvasBgColor='F9FCFF' canvasBaseColor='FE6E54' hovercapbgColor='FFECAA' hovercapborder='F47E00' divlinecolor='789AC5' bgAlpha='100' canvasBorderThickness='1' canvasBorderColor='789AC5' canvasBgAlpha='100' yaxisminvalue='100' yaxismaxvalue='' numberPrefix='' limitsDecimalPrecision='0' divLineDecimalPrecision='0' decimalPrecision='0' rotateNames='1' showAnchors='1'>";
			$strDataSet1 = "<dataset seriesname='Logged' color='4A4499' showValue='1' lineThickness='1'>";
			$strDataSet2 = "<dataset seriesname='Resolved/Closed' color='FF6600' showValue='1' lineThickness='1'>";

			foreach($arrIntLogged as $category => $count)
			{
				//-- Set Data Set Values for Set 1
				$strDataSet1 .= "<set value='".$count."'/>";
			}

			foreach($arrIntResolved as $category => $count)
			{
				//-- Set Data Set Values for Set 1
				$strDataSet2 .= "<set value='".$count."'/>";
			}

			$strCategories .= "</categories>";
			$strDataSet1 .= "</dataset>";
			$strDataSet2 .= "</dataset>";

			$strTemp .= $strCategories.$strDataSet1.$strDataSet2;
		
			$strTemp .="</graph>";
			$this->xml = $strTemp;
			
		}
		function GetGroupAnalysts($swCache)
		{
			$arrGroupAnalysts = array();
			
			$strGroupSelect = "select swgroups.id, swgroups.name, swanalysts.analystid from swgroups left join swanalysts on swgroups.id = swanalysts.supportgroup where swgroups.id <> '_SYSTEM'";

			$rsGroups = $swCache->query($strGroupSelect,true);

			while(!$rsGroups->eof)
			{
				$groupid = strToLower($rsGroups->f("name"));
				$analystid = strToLower($rsGroups->f("analystid"));

				//-- output
				if(!in_array($analystid,$arrGroupAnalysts))
				{
					$arrGroupAnalysts[$analystid] = $groupid;
				}

				$rsGroups->movenext();
			}

			return $arrGroupAnalysts;
		}	
		
		//-- Function to output XML graph entries dependent on whether we are in the web or full client
		function add_status_graph_xml_entry($strName, $intValue, $timeperiod, $strColor, $strCallClasses)
		{
			$strXML="";
			$strCallClassesXML = _pfx($strCallClasses);

			if(isset($_SESSION['sw_ap_wwwpath']))
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='javascript:_run_fsc_action(&apos;mycallslastatus&apos;,&apos;".$timeperiod."&apos;,".gv("encoded_datasetfilterlist").",100)'/>";
			}
			else
			{
				if($intValue>0)$strXML="<set name='".$strName."' value='".$intValue."' color='".$strColor."' link='hsl:sqlsearch?query=select h_formattedcallref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, fixbyx from opencall where callclass IN ".$strCallClassesXML." and status not in (18,16,15,17,6) and appcode IN(".gv("encoded_datasetfilterlist").") and ".$timeperiod." order by callref asc&amp;limit=100'/>";
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