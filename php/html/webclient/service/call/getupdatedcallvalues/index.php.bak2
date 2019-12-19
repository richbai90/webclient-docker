<?php

	//-- 06.10.2009
	//-- get call list for a given hewlpdesk data table for passed in owner / suppgroup
	//-- expects [servicedeskdatatableid] and any passed in parameters for query
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');
	include('../../../php/db.helpers.php');
	
	//-- get xml file that defines the mes
	if(!isset($_POST['datatableid'])) echo false;

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getupdatedcallvalues/index.php","START","SERVI");
	}	

	//-- check for custom view
	$strFileName = $portal->fs_application_path . "_customisation/xml/globalparams/Global Parameters.xml";
	if(!file_exists($strFileName))
	{
		//-- get contents and generate workspace view
		$strFileName = $portal->fs_application_path . "xml/globalparams/Global Parameters.xml";
	}

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

		//-- callrefs 
		$strCallrefs = $_POST['_callrefs'];
		if($strCallrefs=="")$strCallrefs="0";

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
		if(strToLower($strContextFilter)=="yes")
		{
			$strOwnerClause = "owner = '".db_pfs($_POST['owner'],'swsql')."'";
			if($_POST['owner']=="%")
			{
				$strOwnerClause = "owner like '%'";
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
		$strSystemFilter = $strFixedFilter;
		$strSqlTable = $strTable;
		if($strTable=="opencall")
		{
			if($strSystemFilter != "") $strSystemFilter .= " and ";
			$strSystemFilter .= " opencall.status < 16 ";

			//-- should we apply escalation filter?
			$strEscalationFilter = "(suppgroup = '".db_pfs($_POST['suppgroup'],'swsql')."' and status in(2,5,10)) OR (suppgroup = '".db_pfs($_POST['suppgroup'],'swsql')."' and owner='' and status in(9)) OR (status = 11)";
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
			$strSystemFilter = "opencall.callref = watchcalls.callref and opencall.status < 16  and watchcalls.analystid = '".strToLower(db_pfs($oAnalyst->analystid,'swsql'))."'";		
		}
		else if($strTable=="calltasks")
		{
			$strSqlTable="calltasks,opencall";
			//-- task owner filter
			$strTaskOwnerClause = "analystid = '".db_pfs($_POST['owner'],'swsql')."'";
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
			$strSystemFilter .= " opencall.callref = calltasks.callref and " . $strTaskContextFilter;
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


		//-- construct base sql (we want to get key field and status of call
		$strSQL = "SELECT ".$strKeyCol." as tpk, opencall.status as tpkstatus, opencall.prob_text as prbdesc, opencall.last_text as lastdesc, ". $strSelectColumns ." FROM " . $strSqlTable;
		$strSQL .= " WHERE (opencall.callref in (".$strCallrefs.") )";

		//-- only apply system filter if we dont have callrefs to get
		if($strSystemFilter!="" && $strCallrefs=="0") $strSQL .= " and ( " . $strSystemFilter . ")";
		$strSQL.=$strApplyOrder; //-- apply any ordering

	
		$oConn = swsys_connectdb($strDSN);		

		$strXMLRS = "<resultset>";
		$result_id =_execute_xmlmc_sqlquery($strSQL,$oConn);
		if($result_id)
		{	
			//-- get row
			$aRow = hsl_xmlmc_rowo($result_id);
			while($aRow)
			{
				$strXMLRS .= db_record_as_xml($aRow,"row","","opencall",0,true);
				$aRow = hsl_xmlmc_rowo($result_id);
			}
		}
		else
		{
			//-- get last error
		}
		$strXMLRS .= "</resultset>";

		close_dbs();

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/call/getupdatedcallvalues/index.php","END","SERVI");
		}	

		echo $strXMLRS;
	}
?>