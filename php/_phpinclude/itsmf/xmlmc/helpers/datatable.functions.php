<?php

	//--
	//-- example custom function to create datatable filter options
	//--
	//-- the function should just return the <options></options>
	//-- need additional function to use when actually creating table data, to get the actual filter criteria

	//-- create the text items to display in the filter also set 
	//-- bespoke attribute of each option (filter) , this will be used to actually filter the list.
	function create_bespoke_filter_options($activeFilterOptionIndex)
	{
		//--
		//-- activeFilterOptionIndex is the current filter item selected 
		//-- so if looping options have a coujnter and if counter == activeFilterOptionIndex set option to selected
		$strOptions = "";

		//-- could do a db select to get info - in tjhis exmaple getting customer names
		$swdataODBC = database_connect("swdata");
		$recSet = $swdataODBC->Query("select fullname from userdb order by surname",true);
		if($recSet)
		{
			$counter=0;
			while(!$recSet->eof)
			{
				//-- create option (set option to selected in counter == activeFilterOptionIndex
				$strText = $recSet->f('fullname');
				$strSelected =($counter==$activeFilterOptionIndex)?" selected ":"";
				$strOptions .= "<option $strSelected>$strText</option>";		
				$counter++;

				//-- get next record
				$recSet->movenext();
			}
			unset($recSet);
		}
		return $strOptions;
	}

	//--
	//-- given the activefilterindex we can  get the specific filter criteria
	function get_bespoke_filter($activeFilterOptionIndex)
	{
		//--
		//-- activeFilterOptionIndex is the current filter item selected 
		//-- so if looping records keep a counter and when counter = activeFilterOptionIndex
		//-- we know we are at the record we want to filter by so get the actual filter criteria, not the display text
		$strFilter = "";

		//-- note the where clause is same as getting display options but now getting value we want to filter by
		$swdataODBC = database_connect("swdata");
		$recSet = $swdataODBC->Query("select keysearch from userdb order by surname",true);
		if($recSet)
		{
			//-- we know which row number we need by using the activeFilterOptionIndex
			//- -get keysearch as we want to filter by this
			$recSet->currentrow = $activeFilterOptionIndex;
			$strFilterValue = $recSet->f('keysearch');

			//-- construct filter (note pfs = prepareforsql)
			//-- note have to know if need AND OR in fact jsut a WHERE - depends if xml file <where> tag has a clause if so need AND or OR.
			$strFilter = " AND cust_id = '" . pfs($strFilterValue) ."'";
			unset($recSet);
		}
		return $strFilter;
	}



//-- HELPERS

//- -get list of problems that are affecting incidents raised for any of customers sites
function get_cust_site_related_probs($strCustomerID)
{
	$strPrbList = "0";
	//-- note the where clause is same as getting display options but now getting value we want to filter by
	$swdataODBC = database_connect("syscache");
	$strSQL = "select prb_callref from opencall where (cust_id = '" . pfs($strCustomerID) . "' or site in (". get_customer_sites($strCustomerID).") )and prb_callref > 0 and callclass = 'Incident'";
	//echo $strSQL;
	$recSet = $swdataODBC->Query($strSQL,true);
	if($recSet)
	{	
		while(!$recSet->eof)
		{
			if($strPrbList !="")$strPrbList .= ",";
			$strPrbList .=  pfs($recSet->f('prb_callref'));
			$recSet->movenext();
		}
	}
	return $strPrbList;
}


//-- get a list of comma delimited sites that the customer works at.
function get_customer_sites($strCustomerID)
{
	$strSiteList = "'". pfs($_SESSION['userdb_site'])."'";
	//-- note the where clause is same as getting display options but now getting value we want to filter by
	$swdataODBC = database_connect("swdata");
	$strSQL = "select FK_SITE_NAME from USERDB_SITE where FK_KEYSEARCH = '" . pfs($strCustomerID) . "'";
	$recSet = $swdataODBC->Query($strSQL,true);
	if($recSet)
	{
		while(!$recSet->eof)
		{
			if($strSiteList !="")$strSiteList .= ",";
			$strSiteList .= "'" . pfs($recSet->f('fk_site_name')) ."'";
			$recSet->movenext();
		}
	}
	return $strSiteList;
}


function get_call_last_update_text($intCallref, $strDSN,$trimLen=0,$intPublicOnly=1)
{
	$DBConn = database_connect($strDSN);	
	if($DBConn)
	{
		$strDB = $DBConn->get_database_type();
		if($strDB=="oracle")
		{
			$strAddWhere= ($intPublicOnly==1)?" and BITAND(udtype,512) = 0 ":"";
		}
		else
		{
			$strAddWhere= ($intPublicOnly==1)?" and udtype in (1,257) ":"";
		}
		$strSQL = "select MAX(UDINDEX) as UDI from UPDATEDB where CALLREF = " . PrepareForSql($intCallref) . $strAddWhere;
		$recSet = $DBConn->Query($strSQL,true);
		if(($recSet) && (!$recSet->eof))
		{
			return get_call_update_text($intCallref,$recSet->f("udi"),$strDSN,$trimLen,$intPublicOnly);
		}
	}
	return "";
}

function get_call_first_update_text($intCallref, $strDSN, $trimLen=0,$intPublicOnly=1)
{
	return get_call_update_text($intCallref,0,$strDSN,$trimLen,$intPublicOnly);
}

function get_call_update_text($intCallref,$intUDINDEX,$strDSN,$trimLen=0,$intPublicOnly=1)
{
	$DBConn = database_connect($strDSN);
	if($DBConn)
	{
		$strDB = $DBConn->get_database_type();
		if($strDB=="oracle")
		{
			$strAddWhere= ($intPublicOnly==1)?" and BITAND(udtype,512) = 0 ":"";
		}
		else
		{
			$strAddWhere= ($intPublicOnly==1)?" and udtype in (1,257) ":"";
		}

		$strSQL = "select UPDATETXT from UPDATEDB where CALLREF = " . PrepareForSql($intCallref) . " and UDINDEX = " . $intUDINDEX . $strAddWhere;
		$recSet = $DBConn->Query($strSQL,true);
		if(($recSet) && (!$recSet->eof))
		{
			$strData = $recSet->xf('updatetxt');
			if($trimLen>0)$strData = substr($strData,0,$trimLen);
			return nl2br($strData);
		}
	}
	return "";
}

//-- output a diary table for a callref
function create_calldairy_datatable($in_calldiary_callref, $strAddWhere = "")
{
	//-- open xml file based on tabformname
	GLOBAL $portal_path;
	
	$in_calldiary_access="udtype >-1";
	if($_SESSION['portalmode']=="CUSTOMER")$in_calldiary_access="udtype in(1,257)";

	//-- make data global so we can
	$GLOBALS['in_calldiary_callref'] = $in_calldiary_callref;
	$GLOBALS['in_calldiary_access'] = $in_calldiary_access;

	
	$xmlfile = file_get_contents($portal_path."xml/tables/call.diary.xml");
	if($xmlfile=="")return  "";
	//-- create dom instance of the xml file
	$xmlDoc = domxml_open_mem($xmlfile);
	$root = $xmlDoc->document_element();

	$dataTable = new oTableData;
	$dataTable->xmlRoot = $root;
	if($dataTable!=false)
	{
		return $dataTable->output_data_table("","",0,$strAddWhere);
	}
	return "";
}

//-- get column header
function get_column_header($strColName, $strTableName)
{
	return swdti_getcoldispname($strTableName.".".$strColName);
}

?>