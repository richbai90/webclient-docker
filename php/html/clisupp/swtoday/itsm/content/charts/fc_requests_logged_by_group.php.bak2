<?php
	//-- get data for # of customers requests raised and status
	class fc_requests_logged_by_group
	{
		var $xml = null;
		function prepareXML()
		{
			//-- Set the list of callclasses to be included in the data report
			$strCallClasses = "('Incident','Problem','Known Error','Change Request','Release Request','Service Request')";

			//-- connect and get those service stats
			$swData = database_connect("swdata");
			$swCache = database_connect("syscache");
			//-- Build array of groups and analysts with that group as the main group
			$arrGroupAnalysts = $this->GetGroupAnalysts($swCache);

			//-- create an array to hold counts of calls against groups
			$arrSuppGroupCallCounts = array();
			$strSelectCustCalls = "select count(callref) as cnt, suppgroup from OPENCALL where appcode IN(".gv("datasetfilterlist").") and status not in (6,16,17) group by suppgroup";
			$rsCustCalls = $swData->query($strSelectCustCalls,true);
			$i = 0;
			while(!$rsCustCalls->eof)
			{
				$oc_suppgroup = $rsCustCalls->f("suppgroup");
				if($oc_suppgroup != "")
				{
					if (strpos($oc_suppgroup, '/') !== false) // if SuppGroup contains a '/' it's a sub group
					{
						$oc_suppgroup = substr($oc_suppgroup, 0, strpos($oc_suppgroup, '/'));
					}
					$arrSuppGroupCallCounts[$oc_suppgroup] += $rsCustCalls->f("cnt");
				}
				$rsCustCalls->movenext();
			}		
			
			$strTemp ="<graph caption='' BgColor='F9FCFF'  xAxisName='' yAxisName='' showNames='1' numdivlines='0' decimalPrecision='0' showColumnShadow='0' bgAlpha='100' canvasBorderThickness='1' canvasBorderColor='789AC5' canvasBgAlpha='100' showLimits='0' formatNumberScale='0'>";
	   
			$arrColours=array('4A4499','FF6600','FF9966','FF0000','006F00','0099FF','CCCC00','F984A1','A66EDD','8BBA00','F6BD0F','AFD8F8');
			$x=0;			
			
			foreach($arrSuppGroupCallCounts as $group => $count)
			{
				$strTemp .= "<set name='".$arrGroupAnalysts[$group]."' value='".$count."' color='".$arrColours[$x]."'/>";
				$x++;
				if($x==12) $x=0;
			}
			
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
				$groupid = strToLower($rsGroups->f("id"));
				$groupname = strToLower($rsGroups->f("name"));

				if(!in_array($analystid,$arrGroupAnalysts))
				{
					$arrGroupAnalysts[strtoupper($groupid)] = ucwords($groupname);
				}

				$rsGroups->movenext();
			}

			return $arrGroupAnalysts;
		}

		function getXML()
		{
			if($this->xml==null)
				$this->prepareXML();
			return $this->xml;
		}
	}
?>