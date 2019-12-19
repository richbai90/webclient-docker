<?php


	//-- 31.10.2011 - get call detail task list using xmlmc and then output html for sqltable
	//--
	//-- get mlmx call tasks
	if($_POST["_callref"]=="")exit(0);

	include("../../../php/xml.helpers.php");

	$strTableData = "";	
	$xml = "<methodCall service='helpdesk' method='getCallWorkItems'><params><callref>".$_POST['_callref']."</callref></params></methodCall>";
	$oResult = xmlmc($portal->sw_server_ip, "5015", $_SESSION['swstate'], $xml);
	$_SESSION['swstate']=$oResult->token;
	if($oResult->status==200)
	{
		$xmlDOM = domxml_open_mem(utf8_encode($oResult->content));
		if($xmlDOM)
		{
			$arrWFG = $xmlDOM->get_elements_by_tagname('callWorkItemList');
			foreach ($arrWFG as $xmlWFG)
			{
				//-- get items in group
				$arrWFItems = $xmlWFG->get_elements_by_tagname('callWorkItemInfo');			
				$itemCount = count($arrWFItems);

				//-- get group properties
				$strGroupTitle = swxml_childnode_content($xmlWFG,"name");
				$strGroupType = swxml_childnode_content($xmlWFG,"type");
				$strGroupID = swxml_childnode_content($xmlWFG,"id");
				$strGroupTypeTitle = ($strGroupType=="open")?"Open":"Sequential";
				$strGroupTypeTitle .= ($itemCount>1)?" Items":" Item";
				$groupFlag = ($strGroupType=="open")?0:8;

				$strExpanderRow = "<tr type='expander' flags='".$groupFlag."' parentgroup='".$strGroupTitle."' itemcount='".$itemCount."' parentgroupsequence='".$strGroupID."' onclick='this.parentNode.parentNode.parentNode.parentNode.swfc._expanderclick(this,event);' ondblclick='this.parentNode.parentNode.parentNode.parentNode.swfc._expanderdblclick(this,event);'>";
				$strExpanderRow .= "<td class='datatd-expander' colspan='6'><div><b>".htmlentities($strGroupTitle)."</b> (".$itemCount." ".$strGroupTypeTitle.")</div></td><tr>";

				$strGroupDataRows = "";
				foreach ($arrWFItems as $xmlWFI)
				{
					$strTaskID = swxml_childnode_content($xmlWFI,"id");
					$formattedValue = datatable_conversion($strTaskID,"calltasks.taskid");
					$strDataRow = "<td class='datatd' noWrap><div class='tdvalue'>". $formattedValue . "</div><div style='display:none;'>".$strTaskID."</div></td>";

					$intCompleteBy = strtotime(SwConvertDateTimeInText(swxml_childnode_content($xmlWFI,"completeBy")));
					$formattedValue = datatable_conversion($intCompleteBy,"opencall.logdatex");
					$strDataRow .= "<td class='datatd' noWrap><div class='tdvalue'>".$formattedValue."</div><div style='display:none;'>".$intCompleteBy."</div></td>";

					$strStatus = swxml_childnode_content($xmlWFI,"status");
					$formattedValue = datatable_conversion($strStatus,"calltasks.status");
					$strDataRow .= "<td class='datatd' noWrap><div class='tdvalue'>". $formattedValue . "</div><div style='display:none;'>".$strStatus."</div></td>";

					$strDesc = swxml_childnode_content($xmlWFI,"description");
					$strDataRow .= "<td class='datatd' noWrap><div class='tdvalue'>". $strDesc . "</div><div style='display:none;'>_s_</div></td>";

					$strGroup = swxml_childnode_content($xmlWFI,"assignToGroup");
					$strDataRow .= "<td class='datatd' noWrap><div class='tdvalue'>". $strGroup . "</div><div style='display:none;'>_s_</div></td>";

					$strAnalyst = swxml_childnode_content($xmlWFI,"assignToAnalyst");
					$strDataRow .= "<td class='datatd' noWrap><div class='tdvalue'>". $strAnalyst . "</div><div style='display:none;'>_s_</div></td>";

					//-- hidden cols (groupseq grouptile)
					$strDataRow .= "<td class='datatd' style='display:none;' noWrap><div class='tdvalue'>". $strGroupID . "</div><div style='display:none;'>_s_</div></td>";
					$strDataRow .= "<td class='datatd' style='display:none;' noWrap><div class='tdvalue'>". $strGroupTitle . "</div><div style='display:none;'>_s_</div></td>";
					$strDataRow .= "<td class='datatd' style='display:none;' noWrap><div class='tdvalue'>". $groupFlag . "</div><div style='display:none;'>_s_</div></td>";
					$strDataRow .= "<td class='datatd' style='display:none;' noWrap><div class='tdvalue'>". $_POST["_callref"] . "</div><div style='display:none;'>_s_</div></td>";

					$strGroupDataRows .= "<tr onclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowclick(this,event);' ondblclick='this.parentNode.parentNode.parentNode.parentNode.swfc._rowdblclick(this,event);'>" . $strDataRow . "</tr>";

				}//-- for each item
				$strTableData .= $strExpanderRow . $strGroupDataRows;

			}//-- for each group

			//-- create colu group
			$strCOLS = "";
			$arrColWidths = explode(",",$_POST['columnwidths']);
			foreach ($arrColWidths as $intWidth)
			{
				$strCOLS .= "<col width='".$intWidth."px' />";
			}

		}
	}

	
	$strTableHTML = "<table cellspacing='0' cellpadding='0' border='0' rc='0' pc='0' pn='0'>".$strCOLS.$strTableData."</table>";

	echo $strTableHTML;
	exit(0);
?>