<?php
//-- NWJ - use to addcustom functions used with features data table

//-- HELPERS
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
		$strSQL = "select MAX(UDINDEX) as UDI from UPDATEDB where CALLREF = " . $intCallref . $strAddWhere;;
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

		$strSQL = "select UPDATETXT from UPDATEDB where CALLREF = " . $intCallref . " and UDINDEX = " . $intUDINDEX . $strAddWhere;
		$recSet = $DBConn->Query($strSQL,true);
		if(($recSet) && (!$recSet->eof))
		{
			$strData = $recSet->f('updatetxt');
			if($trimLen>0)$strData = substr($strData,0,$trimLen);
			return $strData;
		}
	}
	return "";
}

//-- output a ci table for a callref
function create_callcidatatable($inCICallref,$relCICALLType,$strAddWhere,$strTableName)
{
	//-- open xml file based on tabformname
	
	GLOBAL $portal_path;
	
	//-- make data global so we can
	$GLOBALS['relCICALLType'] = $relCICALLType;
	$GLOBALS['inCICallref'] = $inCICallref;

	$xmlfile = file_get_contents($portal_path."xml/tables/".$strTableName.".xml");
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

//-- output a ci table for a callref
function create_cicidatatable($inCI,$boolParent,$strAddWhere = "")
{
	//-- open xml file based on tabformname
	
	GLOBAL $portal_path;
	
	//-- make data global so we can
	$GLOBALS['inCI'] = $inCI;

	if($boolParent)
	{
		$xmlfile = file_get_contents($portal_path."xml/tables/ci.childconfigitems.xml");
	}
	else
	{
		$xmlfile = file_get_contents($portal_path."xml/tables/ci.parentconfigitems.xml");
	}

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

//-- output a ci table for a callref
function create_cimedatatable($inCI,$meCode,$strAddWhere = "")
{
	//-- open xml file based on tabformname
	
	GLOBAL $portal_path;
	
	//-- make data global so we can
	$GLOBALS['inCI'] = $inCI;
	$GLOBALS['inMEcode'] = $meCode;

	$xmlfile = file_get_contents($portal_path."xml/tables/ci.manentities.xml");

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

function get_column_header($strColName, $strTableName)
{
	//-- 2.4 Language - encode output to UTF
	return lang_decode_to_utf(swdti_getcoldispname($strTableName.".".$strColName));
}


//-- itsm 2.4.0 - get customers list of sites for use with in statement
function get_customer_sites($strCustomerID = "")
{
	if($_SESSION['userdb_site']=="")
	{
		//-- if customer site is blank, no list to return
		return -1;
	}

	if($strCustomerID == "")$strCustomerID = pfs($_SESSION['customerpkvalue']);

	$strSites="'".pfs($_SESSION['userdb_site'])."'";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$strSelect = "select FK_PARENT_ITEMTEXT from CONFIG_RELI where FK_CHILD_ITEMTEXT = '".prepareforsql($strCustomerID)."' and FK_PARENT_TYPE = 'ME->SITE' and FK_CHILD_TYPE='ME->CUSTOMER'";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strSites .= ",";
				$strSites .= "'" . pfs( $recSet->f('fk_parent_itemtext',true) )."'";
				$recSet->movenext();
			}
		}

	}
	return $strSites;
}


function get_customer_orgs($strCustomerID = "")
{
	if($strCustomerID == "")$strCustomerID = pfs($_SESSION['customerpkvalue']);

	$strSites="'".pfs($_SESSION['userdb_fk_company_id'])."'";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$strSelect = "select FK_ORG_ID from USERDB_COMPANY where FK_USER_ID = '".prepareforsql($strCustomerID)."'";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strSites .= ",";
				$strSites .= "'" . pfs( $recSet->f('fk_org_id',true) )."'";
				$recSet->movenext();
			}
		}

	}
	return $strSites;
}


//-- itsm 2.3.3 - get problem and ke callrefs that are impacting the customer
function get_customer_prbke_callrefs()
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		//-- get call where impacted cis are used by the customer
		$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
		$strSelect .= " where cmn_rel_opencall_ci.relcode ='PROBLEM-AFFECT' ";
		$strSelect .= " and opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Problem','Known Error') ";
		$strSelect .= " and config_reli.fk_parent_type = 'ME->CUSTOMER' ";
		$strSelect .= " and config_reli.fk_parent_itemtext = '".pfs($_SESSION['customerpkvalue'])."' ";
		$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
		$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}

		//-- 90069 add owned problems/known errors
		//-- get calls that are owned by customer
		$strSelect = "select callref from opencall";
		$strSelect .= " where opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Problem','Known Error') ";
		$strSelect .= " and opencall.cust_id = '".pfs($_SESSION['customerpkvalue'])."' ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}

		//-- get incident calls linked to problems and that are owned by customer
		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where cmn_rel_opencall_oc.relcode ='PROBLEM-INCIDENT' ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
		$strSelect .= " and opencall.cust_id = '".pfs($_SESSION['customerpkvalue'])."' ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}
	}
	return $strCallrefs;
}



//-- itsm 2.3.3 - get problem and ke callrefs that are impacting the customers sites
function get_customer_site_prbke_callrefs()
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		//-- get call where impacted cis are used by the customers site
		$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
		$strSelect .= " where cmn_rel_opencall_ci.relcode ='PROBLEM-AFFECT' ";
		$strSelect .= " and opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Problem','Known Error') ";
		$strSelect .= " and config_reli.fk_parent_type = 'ME->SITE' ";
		$strSelect .= " and config_reli.fk_parent_itemtext = '".pfs($_SESSION['userdb_site'])."' ";
		$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
		$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}

		//-- get incident calls linked to problems and that are logged against one of the customers sites
		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where cmn_rel_opencall_oc.relcode ='PROBLEM-INCIDENT' ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
		$strSelect .= " and opencall.site in (".get_customer_sites().") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}
	}
	return $strCallrefs;
}



//-- itsm 2.3.3 - get problem and ke callrefs that are impacting the customers organisation
function get_customer_org_prbke_callrefs()
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		//-- get call where impacted cis are used by the customers org
		$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
		$strSelect .= " where cmn_rel_opencall_ci.relcode ='PROBLEM-AFFECT' ";
		$strSelect .= " and opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Problem','Known Error') ";
		$strSelect .= " and config_reli.fk_parent_type = 'ME->COMPANY' ";
		$strSelect .= " and config_reli.fk_parent_itemtext = '".pfs($_SESSION['userdb_fk_company_id'])."' ";
		$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
		$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}

		//-- get incident calls linked to problems and that are owned by customers org
		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where cmn_rel_opencall_oc.relcode ='PROBLEM-INCIDENT' ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
		$strSelect .= " and opencall.fk_company_id = '".pfs($_SESSION['userdb_fk_company_id'])."' ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}
	}
	return $strCallrefs;
}



//-- itsm 2.3.4 - get rel callrefs that are associated to customer rfcs impacting the customers org
function get_customer_org_rel_callrefs($boolIncludeRFCs = true)
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$strRelatedRFCCallrefs = get_customer_org_rfcrel_callrefs();
		if($boolIncludeRFCs)$strCallrefs = $strRelatedRFCCallrefs;

		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where cmn_rel_opencall_oc.relcode ='RELEASE-RFC' ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s in(".$strRelatedRFCCallrefs.") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}
	}
	return $strCallrefs;
}


//-- itsm 2.3.3 - get change and release callrefs that are impacting the customer
function get_customer_rfcrel_callrefs()
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		//-- get call where impacted cis are used by the customer
		$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
		$strSelect .= " where (cmn_rel_opencall_ci.relcode ='RFC-AFFECT' OR cmn_rel_opencall_ci.relcode ='RELEASE-AFFECT')";
		$strSelect .= " and opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Change Request','Release Request') ";
		$strSelect .= " and config_reli.fk_parent_type = 'ME->CUSTOMER' ";
		$strSelect .= " and config_reli.fk_parent_itemtext = '".pfs($_SESSION['customerpkvalue'])."' ";
		$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
		$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}


		$strRelatedErrorCallrefs = get_customer_prbke_callrefs();
		//-- get problem calls linked to problems and that are owned by customer
		$strSelect = "select distinct(fk_callref_m) from cmn_rel_opencall_oc ";
		$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-ERROR' OR cmn_rel_opencall_oc.relcode ='RELEASE-ERROR') ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s in(".$strRelatedErrorCallrefs.") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}

		//-- get incident calls linked to rfc and that are owned by customer
		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-INCIDENT' OR cmn_rel_opencall_oc.relcode ='RELEASE-INCIDENT') ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
		$strSelect .= " and opencall.cust_id = '".pfs($_SESSION['customerpkvalue'])."' ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}

	}
	return $strCallrefs;
}

//-- itsm 2.3.4 - get change callrefs that are impacting the customers org
function get_customer_org_rfcrel_callrefs()
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		//-- get call where impacted cis are used by the customers org
		$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
		$strSelect .= " where (cmn_rel_opencall_ci.relcode ='RFC-AFFECT' OR cmn_rel_opencall_ci.relcode ='RELEASE-AFFECT')";
		$strSelect .= " and opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Change Request','Release Request') ";
		$strSelect .= " and config_reli.fk_parent_type = 'ME->COMPANY' ";
		$strSelect .= " and config_reli.fk_parent_itemtext = '".pfs($_SESSION['userdb_fk_company_id'])."' ";
		$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
		$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}


		$strRelatedErrorCallrefs = get_customer_org_prbke_callrefs();
		//-- get problem calls linked to problems and that are owned by customers org
		$strSelect = "select distinct(fk_callref_m) from cmn_rel_opencall_oc ";
		$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-ERROR' OR cmn_rel_opencall_oc.relcode ='RELEASE-ERROR') ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s in(".$strRelatedErrorCallrefs.") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}

		//-- get incident calls linked to rfc and that are owned by customer org
		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-INCIDENT' OR cmn_rel_opencall_oc.relcode ='RELEASE-INCIDENT') ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
		$strSelect .= " and opencall.fk_company_id = '".pfs($_SESSION['userdb_fk_company_id'])."' ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}

		//-- get rfc / rels owned by customer org
		$strSelect = "select callref from opencall  ";
		$strSelect .= " where opencall.callclass in('Change Request','Release Request') ";
		$strSelect .= " and opencall.fk_company_id = '".pfs($_SESSION['userdb_fk_company_id'])."' ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}


	}
	return $strCallrefs;
}

//-- itsm 2.3.4 - get change and release callrefs that are impacting the customers sites
function get_customer_site_rfcrel_callrefs()
{
	$strCallrefs = "0";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		//-- get call where impacted cis are used by the customers site
		$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
		$strSelect .= " where (cmn_rel_opencall_ci.relcode ='RFC-AFFECT' OR cmn_rel_opencall_ci.relcode ='RELEASE-AFFECT')";
		$strSelect .= " and opencall.status < 15 ";
		$strSelect .= " and opencall.callclass in('Change Request','Release Request') ";
		$strSelect .= " and config_reli.fk_parent_type = 'ME->SITE' ";
		$strSelect .= " and config_reli.fk_parent_itemtext = '".pfs($_SESSION['userdb_site'])."' ";
		$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
		$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}


		$strRelatedErrorCallrefs = get_customer_site_prbke_callrefs();
		//-- get problem calls linked to problems and that are owned by customers site
		$strSelect = "select distinct(fk_callref_m) from cmn_rel_opencall_oc ";
		$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-ERROR' OR cmn_rel_opencall_oc.relcode ='RELEASE-ERROR') ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s in(".$strRelatedErrorCallrefs.") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}

		//-- get incident calls linked to rfc or relase and that are owned by customer site
		$strSelect = "select distinct(fk_callref_m) from opencall, cmn_rel_opencall_oc ";
		$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-INCIDENT' OR cmn_rel_opencall_oc.relcode ='RELEASE-INCIDENT') ";
		$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
		$strSelect .= " and opencall.site in (".get_customer_sites().") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('fk_callref_m');
				$recSet->movenext();
			}
		}

		//-- get rfc / rels owned by customer org
		$strSelect = "select callref from opencall  ";
		$strSelect .= " where opencall.callclass in('Change Request','Release Request') ";
		$strSelect .= " and opencall.site in (".get_customer_sites().") ";
		$recSet = $DBConn->Query($strSelect,true);
		if($recSet) 
		{
			while(!$recSet->eof)
			{
				$strCallrefs .= ",";
				$strCallrefs .= $recSet->f('callref');
				$recSet->movenext();
			}
		}

	}
	return $strCallrefs;
}

function get_customer_impact_for_call()
{
	$in_callref = gv('in_callref');
	$in_callclass = gv('in_callclass');

	//-- process based on class
	switch(strToLower($in_callclass))
	{
		case "known error":
		case "problem":
			$strCustomerIDs  = get_customer_impact_for_prb($in_callref);
			break;
		case "change request":

			$strCustomerIDs  = get_customer_impact_for_rfc($in_callref);
			break;
		case "release request":
			$strCustomerIDs  = get_customer_impact_for_rel($in_callref);
			break;
	}
	if($strCustomerIDs=="")$strCustomerIDs="''";
	return $strCustomerIDs;
}

function get_company_impact_for_call()
{
	$in_callref = gv('in_callref');
	$in_callclass = gv('in_callclass');

	//-- process based on class
	switch(strToLower($in_callclass))
	{
		case "problem":
		case "known error":
			$strCustomerIDs  = get_company_impact_for_prb($in_callref);
			break;
		case "change request":
			$strCustomerIDs  = get_company_impact_for_rfc($in_callref);
			break;
		case "release request":
			$strCustomerIDs  = get_company_impact_for_rel($in_callref);
			break;
	}
	if($strCustomerIDs=="")$strCustomerIDs="''";
	return $strCustomerIDs;
}

//-- get company inpact for problem / ke calls
function get_company_impact_for_prb($intCallrefs)
{
	//-- get impacted cis linked to problem
	//-- then get customers that use the impacted cis
	$strLinkedImpactCIs = get_call_cis($intCallrefs , "PROBLEM-AFFECT", "");
	$strCiImpactedCustomerIDS = get_ci_company_ids($strLinkedImpactCIs,true);
	if($strCiImpactedCustomerIDS=="")$strCiImpactedCustomerIDS="''";

	//-- get incs linked to problem
	//-- then get customers linked to incidents and this problem
	$intIncidentCallrefs = get_slave_calls($intCallrefs,"PROBLEM-INCIDENT",false);
	if($intIncidentCallrefs!="")$intIncidentCallrefs.=",";
	$intIncidentCallrefs.=$intCallrefs;
	$strImpactedCustomerIDS = get_companies_on_calls($intIncidentCallrefs);
	if($strImpactedCustomerIDS=="")$strImpactedCustomerIDS="''";

	return $strCiImpactedCustomerIDS.",".$strImpactedCustomerIDS;
}

//-- get company inpact for rfc calls
function get_company_impact_for_rfc($intCallrefs)
{
	//-- get impacted cis linked to rfc
	//-- then get customers that use the impacted cis
	$strLinkedImpactCIs = get_call_cis($intCallrefs , "RFC-AFFECT", "");
	$strCiImpactedCustomerIDS = get_ci_company_ids($strLinkedImpactCIs,true);
	if($strCiImpactedCustomerIDS=="")$strCiImpactedCustomerIDS="''";

	//-- get incs linked to rfc
	//-- then get customers linked to incidents and this problem
	$intIncidentCallrefs = get_slave_calls($intCallrefs,"RFC-INCIDENT",false);
	if($intIncidentCallrefs!="")$intIncidentCallrefs.=",";
	$intIncidentCallrefs.=$intCallrefs;
	$strImpactedCustomerIDS = get_companies_on_calls($intIncidentCallrefs);
	if($strImpactedCustomerIDS=="")$strImpactedCustomerIDS="''";

	//-- get problems linked to rfc and then problems impacted customers
	$strPrbCustomerIds = '';
	$intProblemCallrefs = get_slave_calls($intCallrefs,"RFC-ERROR",false);
	if($intProblemCallrefs!="")	
	{
		$strPrbCustomerIds = get_company_impact_for_prb($intProblemCallrefs);
	}

	return $strImpactedCustomerIDS . "," . $strCiImpactedCustomerIDS . "," . $strPrbCustomerIds;
}

//-- get customer inpact for rfc calls
function get_company_impact_for_rel($intCallrefs)
{
	//-- get impacted cis linked to rfc
	//-- then get customers that use the impacted cis
	$strLinkedImpactCIs = get_call_cis($intCallrefs , "RELEASE", "");
	$strCiImpactedCustomerIDS = get_ci_company_ids($strLinkedImpactCIs,true);
	if($strCiImpactedCustomerIDS=="")$strCiImpactedCustomerIDS="''";

	//-- get incs linked to rfc
	//-- then get customers linked to incidents and this problem
	$intIncidentCallrefs = get_slave_calls($intCallrefs,"RELEASE-INCIDENT",false);
	if($intIncidentCallrefs!="")$intIncidentCallrefs.=",";
	$intIncidentCallrefs.=$intCallrefs;
	$strImpactedCustomerIDS = get_companies_on_calls($intIncidentCallrefs);
	if($strImpactedCustomerIDS=="")$strImpactedCustomerIDS="''";

	//-- get problems linked to rfc and then problems impacted customers
	$strPrbCustomerIds = '';
	$intProblemCallrefs = get_slave_calls($intCallrefs,"RELEASE-ERROR",false);
	if($intProblemCallrefs!="")	
	{
		$strPrbCustomerIds = get_company_impact_for_prb($intProblemCallrefs);
	}

	//-- get problems linked to rfc and then problems impacted customers
	$strRfcCustomerIds = '';
	$intRfcCallrefs = get_slave_calls($intCallrefs,"RELEASE-RFC",false);
	if($intRfcCallrefs!="")	
	{
		$strRfcCustomerIds = get_company_impact_for_rfc($intRfcCallrefs);
	}
	return $strImpactedCustomerIDS . "," . $strCiImpactedCustomerIDS . "," . $strPrbCustomerIds . "," . $strRfcCustomerIds;
}


//-- get customer inpact for problem / ke calls
function get_customer_impact_for_prb($intCallrefs)
{
	//-- get impacted cis linked to problem
	//-- then get customers that use the impacted cis
	$strLinkedImpactCIs = get_call_cis($intCallrefs , "PROBLEM-AFFECT", "");
	$strCiImpactedCustomerIDS = get_ci_customer_ids($strLinkedImpactCIs,true);
	if($strCiImpactedCustomerIDS=="")$strCiImpactedCustomerIDS="''";

	//-- get incs linked to problem
	//-- then get customers linked to incidents and this problem
	$intIncidentCallrefs = get_slave_calls($intCallrefs,"PROBLEM-INCIDENT",false);
	if($intIncidentCallrefs!="")$intIncidentCallrefs.=",";
	$intIncidentCallrefs.=$intCallrefs;
	$strImpactedCustomerIDS = get_customers_on_calls($intIncidentCallrefs);
	if($strImpactedCustomerIDS=="")$strImpactedCustomerIDS="''";

	return $strCiImpactedCustomerIDS.",".$strImpactedCustomerIDS;
}

//-- get customer inpact for rfc calls
function get_customer_impact_for_rfc($intCallrefs)
{
	//-- get impacted cis linked to rfc
	//-- then get customers that use the impacted cis
	$strLinkedImpactCIs = get_call_cis($intCallrefs , "RFC-AFFECT", "");
	$strCiImpactedCustomerIDS = get_ci_customer_ids($strLinkedImpactCIs,true);
	if($strCiImpactedCustomerIDS=="")$strCiImpactedCustomerIDS="''";

	//-- get incs linked to rfc
	//-- then get customers linked to incidents and this problem
	$intIncidentCallrefs = get_slave_calls($intCallrefs,"RFC-INCIDENT",false);
	if($intIncidentCallrefs!="")$intIncidentCallrefs.=",";
	$intIncidentCallrefs.=$intCallrefs;
	$strImpactedCustomerIDS = get_customers_on_calls($intIncidentCallrefs);
	if($strImpactedCustomerIDS=="")$strImpactedCustomerIDS="''";

	//-- get problems linked to rfc and then problems impacted customers
	$strPrbCustomerIds = '';
	$intProblemCallrefs = get_slave_calls($intCallrefs,"RFC-ERROR",false);
	if($intProblemCallrefs!="")	
	{
		$strPrbCustomerIds = get_customer_impact_for_prb($intProblemCallrefs);
	}

	return $strImpactedCustomerIDS . "," . $strCiImpactedCustomerIDS . "," . $strPrbCustomerIds;
}

//-- get customer inpact for rfc calls
function get_customer_impact_for_rel($intCallrefs)
{
	//-- get impacted cis linked to rfc
	//-- then get customers that use the impacted cis
	$strLinkedImpactCIs = get_call_cis($intCallrefs , "RELEASE", "");
	$strCiImpactedCustomerIDS = get_ci_customer_ids($strLinkedImpactCIs,true);
	if($strCiImpactedCustomerIDS=="")$strCiImpactedCustomerIDS="''";

	//-- get incs linked to rfc
	//-- then get customers linked to incidents and this problem
	$intIncidentCallrefs = get_slave_calls($intCallrefs,"RELEASE-INCIDENT",false);
	if($intIncidentCallrefs!="")$intIncidentCallrefs.=",";
	$intIncidentCallrefs.=$intCallrefs;
	$strImpactedCustomerIDS = get_customers_on_calls($intIncidentCallrefs);
	if($strImpactedCustomerIDS=="")$strImpactedCustomerIDS="''";

	//-- get problems linked to rfc and then problems impacted customers
	$strPrbCustomerIds = '';
	$intProblemCallrefs = get_slave_calls($intCallrefs,"RELEASE-ERROR",false);
	if($intProblemCallrefs!="")	
	{
		$strPrbCustomerIds = get_customer_impact_for_prb($intProblemCallrefs);
	}

	//-- get problems linked to rfc and then problems impacted customers
	$strRfcCustomerIds = '';
	$intRfcCallrefs = get_slave_calls($intCallrefs,"RELEASE-RFC",false);
	if($intRfcCallrefs!="")	
	{
		$strRfcCustomerIds = get_customer_impact_for_rfc($intRfcCallrefs);
	}
	return $strImpactedCustomerIDS . "," . $strCiImpactedCustomerIDS . "," . $strPrbCustomerIds . "," . $strRfcCustomerIds;
}




//-- given callref get customer ids on them
function get_customers_on_calls($intCallrefs)
{
	$strCustomers = "";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$strSQL = "select CUST_ID from OPENCALL where CALLREF in (".$intCallrefs.")";
		$oRS = $DBConn->Query($strSQL,true);
		while(($oRS)&&(!$oRS->eof))
		{
			$currKey = $oRS->f("cust_id");
			if ($strCustomers!="")$strCustomers .=",";
			$strCustomers .= "'" . pfs($currKey) . "'";
			$oRS->movenext();
		}
	}
	if($strCustomers=="")$strCustomers="''";
	return $strCustomers;
}

//-- given callref get company ids on them
function get_companies_on_calls($intCallrefs)
{
	$strCustomers = "";
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$strSQL = "select FK_COMPANY_ID from OPENCALL where CALLREF in (".$intCallrefs.")";
		$oRS = $DBConn->Query($strSQL,true);
		while(($oRS)&&(!$oRS->eof))
		{
			$currKey = $oRS->f("fk_company_id");
			if ($strCustomers!="")$strCustomers .=",";
			$strCustomers .= "'" . pfs($currKey) . "'";
			$oRS->movenext();
		}
	}
	if($strCustomers=="")$strCustomers="''";
	return $strCustomers;
}

//-- given callref get any slave calls associateed by relcode
function get_slave_calls($intCallrefM,$strCode,$boolActive = false)
{
	$strCallrefList = "";
	$strTable = ($boolActive) ?"CMN_REL_OPENCALL_OC, OPENCALL":"CMN_REL_OPENCALL_OC";
	$strSQL = "select FK_CALLREF_S from " . $strTable . " where FK_CALLREF_M in (" . $intCallrefM . ") ";
	if($strCode != "") $strSQL = $strSQL . " and RELCODE = '" . $strCode . "'";
	if($boolActive)	$strSQL = $strSQL . " and FK_CALLREF_S = OPENCALL.CALLREF and OPENCALL.STATUS < 15";

	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$oRS = $DBConn->Query($strSQL,true);
		while(($oRS)&&(!$oRS->eof))
		{
			$currKey = $oRS->f("fk_callref_s");
			if ($strCallrefList!="")$strCallrefList .=",";
			$strCallrefList .= $currKey;
			$oRS->movenext();
		}
	}

	if($strCallrefList=="")$strCallrefList="0";
	return $strCallrefList;
}

//-- for given calls gte associated cis by relcode
function get_call_cis($intCallref , $strCode = "", $strAdditionalFilter = "")
{
	$strCIlist = "";
	$strTable = "CMN_REL_OPENCALL_CI";
	$strSQL = "select FK_CI_AUTO_ID from " . $strTable . " where FK_CALLREF in (" . $intCallref . ") ";
	if($strCode != "") $strSQL = $strSQL . " and RELCODE = '" . $strCode . "'";
	if($strAdditionalFilter != "") $strSQL = $strSQL . " and " . $strAdditionalFilter;
	
	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$oRS = $DBConn->Query($strSQL,true);
		while(($oRS)&&(!$oRS->eof))
		{
			$currKey = $oRS->f("fk_ci_auto_id");
			if ($strCIlist!="")$strCIlist .=",";
			$strCIlist .= $currKey;
			$oRS->movenext();
		}
	}
	if($strCIlist=="")$strCIlist="0";
	return $strCIlist;
}

function get_ci_company_ids($intCI,$boolPFS = false)
{
	return get_ci_me_ids($intCI,"ME->COMPANY",$boolPFS);
}

function get_ci_customer_ids($intCI,$boolPFS = false)
{
	return get_ci_me_ids($intCI,"ME->CUSTOMER",$boolPFS);
}

function get_ci_site_ids($intCI,$boolPFS = false)
{
	return get_ci_me_ids($intCI,"ME->SITE",$boolPFS);
}
//--
//-- for cis get related me keys
function get_ci_me_ids($intCI,$strMEType,$boolPFS)
{
	if($intCI=="") return "";
	$currKey="";
	$strReflist = "";

	$strSQL = "select FK_PARENT_ITEMTEXT from CONFIG_RELI where FK_PARENT_TYPE='".$strMEType."' AND FK_CHILD_ID in (" . $intCI . ")";

	$DBConn = database_connect("swdata");	
	if($DBConn)
	{
		$oRS = $DBConn->Query($strSQL,true);
		while(($oRS)&&(!$oRS->eof))
		{
			$currKey = $oRS->f("fk_parent_itemtext");
			if ($strReflist!="")$strReflist .=",";
			if($boolPFS)$currKey = "'" . pfs($currKey) . "'";
			$strReflist .= $currKey;
			$oRS->movenext();
		}
	}
	return $strReflist;
}





?>