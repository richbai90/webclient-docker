<?php

	//-- 23.07.2010
	//-- given tableid etc get list of updated call or added call records

	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');
	include('../../../php/db.helpers.php');
	
	//-- get xml file that defines the mes
	if(!isset($_POST['datatableid'])) echo false;


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getupdatedcallslist/newcalls.php","START","SERVI");
	}	

	$strFileName = $portal->fs_application_path . "xml/globalParams/Global Parameters.xml";

	//-- get helpdesk view xml for this hdtable
    $xmlfp = file_get_contents($strFileName);
    $xmlDoc = domxml_open_mem($xmlfp);
	$strTableViewName = str_replace("_"," ",$_POST['datatableid']);
	$strViewName = $_POST['outlookid'];

	$xmlHelpdeskTableHolder = swxml_helpdesk_view($xmlDoc, $strViewName, $_POST['tablepos'] ,$strTableViewName);

	//-- create usable table xml
	//$oXmlTable = swxml_helpdesk_table($strControlName, $xmlHelpdeskTab,$strParentControlName,$strPos);
	$xmlDoc = swxml_helpdesk_table($_POST['datatableid'], $xmlHelpdeskTableHolder,$_POST['outlookid'],$_POST['tablepos']);
	
	//-- if we have control process
    if($xmlDoc)
    {
		$xmlDoc=$xmlDoc->document_element();

		//-- dsn
		$strDSN = @$_POST['odbcdsn'];
		if($strDSN=="") $strDSN = "syscache";

		//-- table
		$strTable = swxml_childnode_content($xmlDoc,"table");

		//-- keycolumn
		$strKeyCol = swxml_childnode_content($xmlDoc,"keycolumn");
		if($strKeyCol=="") $strKeyCol = "opencall.callref";
		

		//-- should we apply context filter?
		$strContextFilter = swxml_childnode_content($xmlDoc,"contextfilteron");
		if(strToLower($strContextFilter)=="yes" || $strContextFilter=="")
		{
			
			if($_POST['owner']=="%" || $_POST['owner']=='')
			{
				$strOwnerClause = "owner like '%'"; //-- get all call for current group context
			}
			else
			{
				$strOwnerClause = "owner = '".db_pfs($_POST['owner'],'swsql')."'"; //-- get all calls for current select analyst
			}

			if($_POST['thirpartycontract']!="")
			{
				$strOwnerClause .= " and tpcontract ='".db_pfs($_POST['thirpartycontract'],'swsql')."'";
 			}

			$strGroupClause = "suppgroup = '".db_pfs($_POST['suppgroup'],'swsql')."'";
			if($_POST['suppgroup']=="%")
			{
				$strGroupClause = "suppgroup like '%'";
			}
			$strContextFilter = "(".$strOwnerClause ." and ".$strGroupClause.")";

		}
		else
		{
			$strContextFilter = "";
		}

		//-- user defined filter
		$strFixedFilter = swxml_childnode_content($xmlDoc,"filter");

		//-- interactive filter
		$strActiveFilter = "";
		if($_POST['tablefilterindex']!="")
		{
			$arrFilterNodes = $xmlDoc->get_elements_by_tagname("iafilter");
	
			foreach($arrFilterNodes as $pos => $aNode)
			{
				$arrItems = $aNode->get_elements_by_tagname("listitem");
				$aItem = $arrItems[$_POST['tablefilterindex']];
				if($aItem)	
				{
					$strActiveFilter = swxml_childnode_content($aItem, "applyfilter");
					$strActiveFilter =  _sw_parse_vars($strActiveFilter);
				}
			}
		}

		//-- get fixed filter
		$strUseStatusField = "opencall.status as tpkstatus";
		$strSystemFilter = $strFixedFilter;

		if($strSystemFilter!="") $strSystemFilter.= " AND ";
		$strSystemFilter .= "opencall.callref in (". $_POST['_callrefs'].") ";

		//-- standard opencall field to get
		$strStdOpencallFields = "opencall.lastactdatex as swlastactdatex, opencall.prob_text as prbdesc, opencall.last_text as lastdesc,";

		$strSqlTable = $strTable;
		if($strTable=="swissues")
		{
			$strUseStatusField = "swissues.status as tpkstatus";
			$strKeyCol = "issueref";
			$strContextFilter = "";
			$strSystemFilter="status < 16";
			$strStdOpencallFields = "";
		}
		else if($strTable=="opencall" && $_POST['_callrefs']!='')
		{
			if($strSystemFilter != "") $strSystemFilter .= " and ";
			$strSystemFilter .= " opencall.status < 16 ";

			//-- apply escalation filter and get off hold calls
			$strEscalationFilter = "(suppgroup = '".db_pfs($_POST['suppgroup'],'swsql')."' and status in(5,10)) OR (suppgroup = '".db_pfs($_POST['suppgroup'],'swsql')."' and owner='' and status in(2,3,9)) OR (status = 11)";
			if($strFixedFilter!="")
			{
				$strEscalationFilter = "(".$strFixedFilter. " and (".$strEscalationFilter."))";
			}	

			//-- create sys filter		
			if($strContextFilter!="" && $strEscalationFilter!="")
			{
				$strSystemFilter .= " and (" . $strContextFilter . " OR " . $strEscalationFilter . ")";
			}
			elseif($strContextFilter!="")
			{
				$strSystemFilter .= " and " . $strContextFilter;
			}
			elseif($strEscalationFilter!="")
			{
				$strSystemFilter .= " or (" . $strEscalationFilter .")";
			}
		}
		else if($strTable=="watchcalls")
		{
			$strSqlTable="watchcalls,opencall";
			$strContextFilter = "";
			$strActiveFilter = "";
			$strSystemFilter .= " and opencall.callref = watchcalls.callref and opencall.status < 16  and watchcalls.analystid = '".strToLower(db_pfs($oAnalyst->analystid,'swsql'))."'";		
		}
		else if($strTable=="calltasks"  && $_POST['_callrefs']!='')
		{
			$strSqlTable="calltasks,opencall";
			//-- task owner filter
			$strTaskOwnerClause = "(analystid = '".db_pfs($_POST['owner'],'swsql')."' or (analystid is null or analystid = ''))";
			if($_POST['owner']=="%")
			{
				$strTaskOwnerClause = "analystid like '%'";
			}

			//-- group filter 
			$strTaskGroupClause = "groupid = '".db_pfs($_POST['suppgroup'],'swsql')."'";
			if($_POST['owner']=="%")
			{
				$strTaskGroupClause = "groupid like '%'";
			}

			$strTaskContextFilter = "(".$strTaskOwnerClause ." and ".$strTaskGroupClause .")";
			if($strSystemFilter!="") $strSystemFilter .= " and ";
			
			//-- if want to show inactive or completed items
			$addStatuses = ",-1";
			if($_POST['_showcompletedtasks']=="1") $addStatuses .=",16";
			if($_POST['_showinactivetasks']=="1")	$addStatuses .=",1";
			$strSystemFilter .= " (calltasks.status in (2,3,4,5".$addStatuses.")) and opencall.callref = calltasks.callref and " . $strTaskContextFilter;

			$strUseStatusField = "opencall.status as tpkstatus,calltasks.status as taskstatus";
		}
		else if($_POST['_callrefs']=='')
		{
			echo "<updatedcalls tableid='".$_POST['datatableid']."'></updatedcalls>";
			exit;
		}

		//-- apply interactive filter
		if($strActiveFilter!="")
		{
			if($strSystemFilter!="")
			{
				$strSystemFilter .= " AND ";		
			}
			$strSystemFilter .= $strActiveFilter;
		}


		//-- data ordering info
		$strOrderBy = $_POST["orderby"];
		$strOrderDir = $_POST["orderdir"];
		$strApplyOrder = "";
		if($strOrderBy!="")
		{
			if($strOrderDir == "") $strOrderDir="DESC";
			$strApplyOrder = " order by " . $strOrderBy . " " .$strOrderDir;
		}


		//-- select headers
		$jtXML = swxml_childnode($xmlDoc,"datatable");
		if($jtXML==null) echo false;

		$strSelectColumns = swxml_childnode_content($jtXML,"header");
		
		//-- make sure all cols are slecing form opencall
		if($strTable=="watchcalls")		
		{
			$arrCols = explode(",",$strSelectColumns);
			$strSelectColumns = "";
			foreach($arrCols as $ipos => $colName)
			{
				if($strSelectColumns!="")$strSelectColumns.=",";
				if(strpos($colName,"opencall.")===false)
				{
					$strSelectColumns .= "opencall.".$colName;
				}
				else
				{
					$strSelectColumns .= $colName;
				}
			}
		}


		//-- construct base sql (we want to get key field and status of call
		$strSQL = "SELECT ".$strKeyCol." as tpk, ".$strUseStatusField.", ". $strStdOpencallFields . $strSelectColumns ." FROM " . $strSqlTable;

		if($strSystemFilter!="") $strSQL .= " WHERE " . $strSystemFilter;
		$strSQL.=$strApplyOrder; //-- apply any ordering

		//
		//echo $strSQL;

		$returnxml = "";

		//-- run sql to get data
		$strDataOut = "";
		$dsnCon = connectdb($strDSN);		
		if(!$dsnCon) return false;

		if($dsnCon)
		{
			//-- execute and output table html - this is faster than sending xml to client and then processing xml into table.
			$result_id = _execute_xmlmc_sqlquery($strSQL,$dsnCon);
			while ($rows = hsl_xmlmc_rowo($result_id)) 
			{ 
			
				$returnxml .= db_record_as_xml($rows,"row",$strKeyCol,$strTable,0,true);
			}	

			close_dbs();


			echo "<updatedcalls tableid='".$_POST['datatableid']."'>".$returnxml."</updatedcalls>";

			//-- log activity
			if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
			{
				_wc_debug("service/call/getupdatedcallslist/newcalls.php","END","SERVI");
			}	

			exit;
		}
	}
?>