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
		_wc_debug("service/call/getservicedeskcalls/index.php","START","SERVI");
	}	

	//-- check for custom view
	$strFileName = $portal->fs_application_path . "xml/globalparams/Global Parameters.xml";
	if(!file_exists($strFileName))
	{
		echo "A serious error has occured. The global parameters xml could no be found for this application. Please contact your Administrator.";
		exit;
	}

	//-- get helpdesk view xml for this hdtable
    $xmlfp = file_get_contents($strFileName);
    $xmlDoc = domxml_open_mem($xmlfp);
	$strTableViewName = str_replace("_"," ",@$_POST['datatableid']);
	$strViewName = @$_POST['outlookid'];

	$xmlHelpdeskTableHolder = swxml_helpdesk_view($xmlDoc, $strViewName, @$_POST['tablepos'] ,$strTableViewName);

	//-- create usable table xml
	//$oXmlTable = swxml_helpdesk_table($strControlName, $xmlHelpdeskTab,$strParentControlName,$strPos);
	$xmlDoc = swxml_helpdesk_table(@$_POST['datatableid'], $xmlHelpdeskTableHolder,@$_POST['outlookid'],@$_POST['tablepos']);
	
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
		
		//-- standard opencall field to get
		$strStdOpencallFields = "opencall.lastactdatex as swlastactdatex, opencall.prob_text as prbdesc, opencall.last_text as lastdesc,";

		//-- should we apply context filter?
		$strContextFilter = swxml_childnode_content($xmlDoc,"contextfilteron");
		if(strToLower($strContextFilter)=="yes" || $strContextFilter=="")
		{
			if(@$_POST['owner']=="%" || @$_POST['owner']=='')
			{
				$strOwnerClause = "owner like '%'"; //-- show all calls for current selected group
			}
			else
			{
				$strOwnerClause = "owner = '".db_pfs(@$_POST['owner'],'swsql')."'"; //-- show calls only for selected user
			}

			if(@$_POST['thirpartycontract']!="")
			{
				$strOwnerClause .= " and tpcontract ='".db_pfs(@$_POST['thirpartycontract'],'swsql')."'";
 			}

			$strGroupClause = "suppgroup = '".db_pfs(@$_POST['suppgroup'],'swsql')."'";
			if(@$_POST['suppgroup']=="%")
			{
				$strGroupClause = "suppgroup like '%'";
			}
			$strContextFilter = "(".$strOwnerClause ." and ".$strGroupClause.")";
		}
		else
		{
			$strContextFilter = "";
		}

		//-- user defined filter - @$_POST["staticfilter"];
		$strFixedFilter = swxml_childnode_content($xmlDoc,"filter");
		//-- 12.12.12 - nwj - 90128 - parse $strSQL for currentdd,analystId, groupId, startofday etc
		$strFixedFilter = parseStandardDatabaseSearchFilters($strFixedFilter); //-- session.php function


		//-- interactive filter
		$strActiveFilter = "";
		if(@$_POST['tablefilterindex']!="")
		{
			$arrFilterNodes = $xmlDoc->get_elements_by_tagname("iafilter");
	
			foreach($arrFilterNodes as $pos => $aNode)
			{
				$arrItems = $aNode->get_elements_by_tagname("listitem");
				$aItem = $arrItems[@$_POST['tablefilterindex']];
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
		$strSqlTable = $strTable;
		if($strTable=="swissues")
		{
			$strUseStatusField = "swissues.status as tpkstatus";
			$strKeyCol = "issueref";
			$strContextFilter = "";
			$strSystemFilter="";
			$strStdOpencallFields = "";
		}
		else if($strTable=="opencall")
		{
			if($strSystemFilter != "") $strSystemFilter .= " and ";
			$strSystemFilter .= " opencall.status < 16 ";

			//-- we apply escalation filter and show off hold calls and incoming to group
			$strEscalationFilter = "(suppgroup = '".db_pfs(@$_POST['suppgroup'],'swsql')."' and status in(5,8,10)) OR (suppgroup = '".db_pfs(@$_POST['suppgroup'],'swsql')."' and owner='' and status in(2,3,9)) OR (status = 11)";
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
			$strTaskOwnerClause = "(analystid = '".db_pfs(@$_POST['owner'],'swsql')."' or (analystid is null or analystid = ''))";
			if(@$_POST['owner']=="%")
			{
				$strTaskOwnerClause = "analystid like '%'";
			}

			//-- group filter 
			$strTaskGroupClause = "groupid = '".db_pfs(@$_POST['suppgroup'],'swsql')."'";
			if(@$_POST['owner']=="%")
			{
				$strTaskGroupClause = "groupid like '%'";
			}


			$strTaskContextFilter = "(".$strTaskOwnerClause ." and ".$strTaskGroupClause .")";
			if($strSystemFilter!="") $strSystemFilter .= " and ";
			
			//-- if want to show inactive or completed items
			$addStatuses = ",-1";
			if(@$_POST['_showcompletedtasks']=="1") $addStatuses .=",16";
			if(@$_POST['_showinactivetasks']=="1")	$addStatuses .=",1";
			$strSystemFilter .= " (calltasks.status in (2,3,4,5".$addStatuses.")) and opencall.callref = calltasks.callref and " . $strTaskContextFilter;
		

			$strUseStatusField = "opencall.status as tpkstatus,calltasks.status as tpktaskstatus";
		}
		
		//-- apply interactive filter
		if($strActiveFilter!="")
		{
			if($strSystemFilter!="")
			{
				$strSystemFilter .= " AND ";		
			}
			// 10-5-2016 - RF - 92190 - Apply brackets to Active Filter to make it in line with the full client
			$strSystemFilter .= "(" . $strActiveFilter . ")";
		}


		//-- data ordering info
		$strOrderBy = @$_POST["orderby"];
		$strOrderDir = @$_POST["orderdir"];
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

		//--
		//-- eof get paging info

		//-- run sql to get data
		$strDataOut = "";
		$dsnCon = connectdb($strDSN);		
		if(!$dsnCon) return false;
		
		if($dsnCon)
		{
			//-- row onclick function
			$strSelectAction = swxml_childnode_content($xmlDoc,"onrowselected");
			if($strSelectAction=="") $strSelectAction = "app._servicedesk_select_row";

			//-- row dblclick function
			$strDblClickAction = swxml_childnode_content($xmlDoc,"onrowdoubleclick");
			if($strDblClickAction=="") $strDblClickAction="app._servicedesk_open_row";


			//-- 16.10.2014 - get paging information - we have to get all rows then cut out those we dont want - this is because we don't know how many calls there are in the list
			$intPageNumber = 1;
			$limitRowsPerPage = 100;
			if(isset($_POST['_pagenumber']))
			{
				$intPageNumber = @$_POST['_pagenumber'];
			}
			$intStartAtRowPos = ($intPageNumber - 1) * $limitRowsPerPage;
			$intEndAtRowPos = $intStartAtRowPos +  $limitRowsPerPage;

			//-- execute and output table html - this is faster than sending xml to client and then processing xml into table.
			$currRow = 0;
			
			$result = new swphpDatabaseQuery($strSQL,$dsnCon);
			$totalRows = $result->rowCount();
			
			while ($rows = @$result->fetch()) 
			{ 
		
				if($currRow < $intStartAtRowPos) 
				{
					$currRow++;
					continue;
				}

				if($currRow >= $intEndAtRowPos) 
				{
					break;
				}
				

				$strDataRow = "";
				$arrColumns = explode(",",$strSelectColumns);

				$strTextStyle = ($strTable=="calltasks" && ($rows->tpktaskstatus==16 || $rows->tpktaskstatus==1))?"class='text-strike-".$rows->tpktaskstatus."'":"";

				foreach($arrColumns as $colPos => $fieldName)
				{
					$fieldName = trim($fieldName);
					
					if(strpos($fieldName,'.')===false)
					{
						if($fieldName=="probcode" || $fieldName=="fixcode") 
						{
							$fieldValue = $rows->getColumnFormattedValue($fieldName);
						}
						else
						{
							$fieldValue = $rows->getColumnValue($fieldName);
						}
						///if($fieldName=="h_condition") 
						//{
						//	if( $fieldValue=="0") $fieldValue = "None";
						//}
						
						if($fieldName=="callref" && $rows->h_formattedcallref) 
						{
							$formattedValue = $rows->h_formattedcallref;
						}
						else
						{
							if($fieldName=="escalation" || $fieldName=="h_condition" || $fieldName=="probcode" || $fieldName=="fixcode")
							{
								$formattedValue = datatable_conversion($fieldValue,$strTable.".".$fieldName);
							}
							else
							{
								$formattedValue =  $rows->getColumnFormattedValue($fieldName);//  datatable_conversion($fieldValue,$strTable.".".$fieldName);							
							}
						}
					}
					else
					{
						$arrFieldName = explode(".",$fieldName);
						$colName = $arrFieldName[1];
						if($colName=="callref" && $rows->h_formattedcallref) 
						{
							$formattedValue = $rows->h_formattedcallref;
						}						
						else
						{
							$fieldValue = $rows->getColumnValue($colName);
							$formattedValue =  $rows->getColumnFormattedValue($colName);
						}
					}
					
					if($fieldValue==$formattedValue)
					{
						if($fieldName!="callref" && $fieldName!="calltasks.callref") 
						{
							//-- formatted value is same as dbvalue so prepare as we assume if not the same the conversion has done everything it needs to
							$fieldValue = "sat";
							$formattedValue = htmlentities($formattedValue);
						}
					}
					
					
					
					if($fieldName=="h_formattedcallref" || @$colName=="h_formattedcallref" || $fieldName=="callref" || @$colName=="callref")$fieldValue = filter_var($formattedValue, FILTER_SANITIZE_NUMBER_INT)-0;

					//-- no need to return db value for this types of list
					if($fieldName=="callref" || $fieldName=="calltasks.callref" || $fieldName=="opencall.callref" || $fieldName=="h_formattedcallref" || $fieldName=="opencall.h_formattedcallref") 
					{
					
						$formattedValue = "<a href='#' onclick='app._open_call_detail(".($fieldValue).")'>".$formattedValue."</a>";
					}
					else if($fieldName=="taskid")$formattedValue = "<a href='#' onclick='app._open_hdtask_detail(".$fieldValue.",".($rows->getColumnValue("callref")).",".$rows->tpktaskstatus.")'>".$formattedValue."</a>";
					$strDataRow .= "<td noWrap><div ".$strTextStyle.">" . $formattedValue . "</div></td>";

					
				}

				$currRow++;

				if($strTable=="calltasks")
				{
					$strDataOut .= "<tr id='sdtrow_".$rows->tpk."' name='sdcrow_".$rows->tpk."' keycolumn='".$strKeyCol."' lastactdatex='".$rows->swlastactdatex."' previewrow='0' keyvalue='".$rows->tpk."' callref='".$rows->callref."' callstatus='".$rows->tpkstatus."' taskstatus='".$rows->tpktaskstatus."' onclick='".$strSelectAction."(this,event);' ondblclick='".$strDblClickAction."(this,event);'>" . $strDataRow . "</tr>";				
				}
				else if($strTable=="swissues")
				{
					$strDataOut .= "<tr id='sdtrow_".$rows->tpk."' name='sdcrow_".$rows->tpk."' keycolumn='issueref'  keyvalue='".$rows->tpk."' issueref='".$rows->issueref."' issuestatus='".$rows->tpkstatus."' onclick='".$strSelectAction."(this,event);' ondblclick='".$strDblClickAction."(this,event);'>" . $strDataRow . "</tr>";
				}
				else
				{
					//echo "'sdcrow_".$rows->tpk."'";
					$rowStyle = "style='color:#000000;'";
					switch($rows->tpkstatus)
					{
						case 5:
						case 9:
						case 10:
						case 11:
							//-- escalated or off hold
							$rowStyle = "style='color:#800000;'";
							break;
						case 4:
							//-- onhold
							$rowStyle = "style='color:green;font-style:italic;'";
							break;
						case 2:
						case 3:
							//-- unaccepted or unassigned
							$rowStyle = "style='color:navy;'";
							break;

					}

					$strDataOut .= "<tr id='sdcrow_".$rows->tpk."' name='sdcrow_".$rows->tpk."' lastactdatex='".$rows->swlastactdatex."' keycolumn='".$strKeyCol."' previewrow='0' keyvalue='".$rows->tpk."' callstatus='".$rows->tpkstatus."'  onclick='".$strSelectAction."(this,event);' ondblclick='".$strDblClickAction."(this,event);' ".$rowStyle.">" . $strDataRow . "</tr>";
				}
			}
			close_dbs();

			

			echo $totalRows."[swhdrc]".$intPageNumber."[swhdrc]".$strDataOut;

		}
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getservicedeskcalls/index.php","END","SERVI");
	}	

?>