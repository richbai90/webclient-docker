<?php

//-- functions for use as defualt values
function date_now($strFormat)
{
	return date($strFormat);
}

//-- get all customers subscriptions for all services (or a service)
//-- cust subs, then dep, then site and then org
//-- return array with [serviceid] = subscription id
function get_customers_subscription_ids($inServices = "", $boolAsCommaString = false , $strRelType = "SUBSCRIPTION")
{
    if (!isset($strUID)) $strUID=null;
    if (!isset($strPWD)) $strPWD=null;

    if($inServices == "")
    {
        if($strRelType=='VIEW')
        {
            if($_SESSION['sc_cust_subscriptions']!="")
            {
                if($boolAsCommaString) 
                {
                    return $_SESSION['sc_cust_subscriptions'];
                }
            }
        }
        else
        {
            if($_SESSION['sc_cust_services']!="")
            {
                if($boolAsCommaString) 
                    return $_SESSION['sc_cust_services'];
            }
        }
    }

    $strDSN = "swdata";
    $swData = false;
    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);

    $array_service_subscriptions = Array();
    $array_service_subscriptions["0"] = "-1";
    //-- get customer subscriptions

	$boolView = $strRelType=='VIEW';

	$strCols = "pk_id, fk_service";
	if($boolView)
		$strCols .= ", permis_search";

	$addWhere = "";
    if($inServices!="")$addWhere = " and fk_service in (".$inServices.")";
    
	if($strRelType=='VIEW')
    {
        $strSubscribed = get_customers_service_ids("",true,"SUBSCRIPTION");
        if($strSubscribed!="")
        {
            $addWhere .= " AND FK_SERVICE NOT IN (".$strSubscribed.")";
        }
    }


    $strSelectCustSubs = "select ".$strCols." from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'userdb' and fk_me_key = '".pfs($_SESSION['customerpkvalue'])."'  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
    $rsCustSubs = $swData->query($strSelectCustSubs,true);
    //echo "<br>NWJ: Get Customer Services :- ".$strSelectCustSubs;
    $strNotAllowedToSubscribe = "";
    while($rsCustSubs && !$rsCustSubs->eof)
    {
        //echo "<br>NWJ:Record Found - Service ID[".$rsCustSubs->f('fk_service')."] ; Subscription ID[".$rsCustSubs->f('pk_auto_id')."]";
        if($boolView)
		{
			if( $rsCustSubs->f('permis_search')=="0")
			{
				if($strNotAllowedToSubscribe!="")
					$strNotAllowedToSubscribe .=",";
				$strNotAllowedToSubscribe .= $rsCustSubs->f('fk_service');
				$rsCustSubs->movenext();
				continue;
			}
        }
        
		$array_service_subscriptions[$rsCustSubs->f('fk_service')] = $rsCustSubs->f('pk_id');
        $rsCustSubs->movenext();
    }
    if($strNotAllowedToSubscribe!="")
    {
         $addWhere .=" AND FK_SERVICE NOT IN (".$strNotAllowedToSubscribe.")";
    }

    if($_SESSION['userdb_subdepartment']!="" || $_SESSION['userdb_department']!="")
    {
        $strSelectDeptSubs = "select ".$strCols." from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'department' and (fk_me_key = '".pfs($_SESSION['userdb_subdepartment'])."' or fk_me_key = '".pfs($_SESSION['userdb_department'])."')  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
        $rsDeptSubs = $swData->query($strSelectDeptSubs,true);
        //echo "<br><br>NWJ: Get Department Services :- ".$strSelectDeptSubs;
        $strNotAllowedToSubscribe = "";
        while($rsDeptSubs && !$rsDeptSubs->eof)
        {
            //echo "<br>NWJ:Record Found - Service ID[".$rsDeptSubs->f('fk_service')."] ";
            //-- customer sub take prec over dept sub
			if($boolView)
			{
				if( $rsDeptSubs->f('permis_search')=="0")
				{
					if($strNotAllowedToSubscribe!="")
						$strNotAllowedToSubscribe .=",";
					$strNotAllowedToSubscribe .= $rsDeptSubs->f('fk_service');
					$rsDeptSubs->movenext();
					continue;
				}
			}
        
			if(!isset($array_service_subscriptions[$rsDeptSubs->f('fk_service')]))
			{
				$array_service_subscriptions[$rsDeptSubs->f('fk_service')] = $rsDeptSubs->f('pk_id');
			}
            $rsDeptSubs->movenext();
        }
    }
    if($strNotAllowedToSubscribe!="")
    {
         $addWhere .=" AND FK_SERVICE NOT IN (".$strNotAllowedToSubscribe.")";
        $strNotAllowedToSubscribe = "";
    }

    $strSites = get_customer_sites();
    if($strSites!="")
    {
        $strSelectSiteSubs = "select ".$strCols." from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'site' and fk_me_key in (".$strSites.")  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
        $rsSiteSubs = $swData->query($strSelectSiteSubs,true);
        //echo "<br><br>NWJ: Get Site Services :- ".$strSelectSiteSubs;
        while($rsSiteSubs && !$rsSiteSubs->eof)
        {
            //    echo "<br>NWJ:Record Found -  Service ID[".$rsSiteSubs->f('fk_service')."] ";
            //-- customer & dept sub take prec over site sub
			if($boolView)
			{
				if( $rsSiteSubs->f('permis_search')=="0")
				{
					if($strNotAllowedToSubscribe!="")
						$strNotAllowedToSubscribe .=",";
					$strNotAllowedToSubscribe .= $rsSiteSubs->f('fk_service');
					$rsSiteSubs->movenext();
					continue;
				}
			}

			if(!isset($array_service_subscriptions[$rsSiteSubs->f('fk_service')]))
			{
				//echo "; Subscription ID[".$rsSiteSubs->f('pk_auto_id')."]";
				$array_service_subscriptions[$rsSiteSubs->f('fk_service')] = $rsSiteSubs->f('pk_id');
			}

            $rsSiteSubs->movenext();
        }
    }
    if($strNotAllowedToSubscribe!="")
    {
         $addWhere .=" AND FK_SERVICE NOT IN (".$strNotAllowedToSubscribe.")";
        $strNotAllowedToSubscribe = "";
    }
	
    $strSelectOrgSubs = "select ".$strCols." from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'company' and fk_me_key = '".pfs($_SESSION['userdb_fk_company_id'])."'  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
    //echo "<br><br>NWJ: Get Org Services :- ".$strSelectOrgSubs;
    $rsOrgSubs = $swData->query($strSelectOrgSubs,true);

    while($rsOrgSubs && !$rsOrgSubs->eof)
    {
        //echo "<br>NWJ:Record Found -  Service ID[".$rsOrgSubs->f('fk_service')."] ";
        //-- customer, dept & site sub take prec over org sub
        if($boolView)
        {
			if($rsOrgSubs->f('permis_search')=="0")
				continue;
		}
		
		if(!isset($array_service_subscriptions[$rsOrgSubs->f('fk_service')]))
		{
			//echo "; Subscription ID[".$rsOrgSubs->f('pk_auto_id')."]";
			$array_service_subscriptions[$rsOrgSubs->f('fk_service')] = $rsOrgSubs->f('pk_id');
		}
        $rsOrgSubs->movenext();
    }

    $arrServices = array_keys($array_service_subscriptions);
    if($inServices=="")
    {
        if($strRelType=='VIEW')
        {
            $_SESSION['sc_cust_subscriptions'] = implode(",",$array_service_subscriptions);
            $_SESSION['catalog_keys_view'] = implode(",",$arrServices);
        }
        else
        {
            $_SESSION['sc_cust_services'] = implode(",",$array_service_subscriptions);
            $_SESSION['catalog_keys_sub'] = implode(",",$arrServices);
        }
    }

    //-- return as seperated string
    if($boolAsCommaString) 
    {
        return implode(",",$array_service_subscriptions);
    }
    else
    {
        return $array_service_subscriptions;
    }
}

function get_customers_managed_service_ids()
{
    $array_service_ids = Array();
    //$swData = database_connect("swdata");
    $strDSN = "swdata";
    $swData = false;

    if (!isset($strUID)) $strUID=null;
    if (!isset($strPWD)) $strPWD=null;

    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);
    
    $array_service_ids["0"] = "-1";

    $strSelectCustSubs = "select PK_AUTO_ID from CONFIG_ITEMI where  OWNER_BUSINESS = '".pfs($_SESSION['customerpkvalue'])."' and (service_archived IS NULL OR service_archived != 1) ";
    $rsCustSubs = $swData->query($strSelectCustSubs,true);
    while($rsCustSubs && !$rsCustSubs->eof)
    {
        $array_service_ids[$rsCustSubs->f('pk_auto_id')] = $rsCustSubs->f('pk_auto_id');
        $rsCustSubs->movenext();
    }
    
    return implode(",",$array_service_ids);
}

//-- get all customers services ids that they are subscribe to
//-- cust subs, then dep, then site and then org
//-- return array with [subid] = service id
function get_customers_service_ids($inSubs = "", $boolAsCommaString = false , $strRelType = "SUBSCRIPTION")
{
    $array_service_ids = Array();
    $strDSN = "swdata";
    $swData = false;
    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);

    $array_service_ids["0"] = "-1";

    //-- get customer subscriptions
    $addWhere = "";
    if($inSubs!="")$addWhere = " and pk_id in (".$inSubs.")";


    $strSelectCustSubs = "select fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'userdb' and fk_me_key = '".pfs($_SESSION['customerpkvalue'])."'  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
    $rsCustSubs = $swData->query($strSelectCustSubs,true);
    while($rsCustSubs && !$rsCustSubs->eof)
    {
        $array_service_ids[$rsCustSubs->f('fk_service')] = $rsCustSubs->f('fk_service');
        $rsCustSubs->movenext();
    }
    

    $strSelectDeptSubs = "select fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'department' and fk_me_key = '".pfs($_SESSION['userdb_fk_dept_id'])."' and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
    $rsDeptSubs = $swData->query($strSelectDeptSubs,true);
    while($rsDeptSubs && !$rsDeptSubs->eof)
    {
        //-- customer sub take prec over dept sub
        if(!isset($array_service_ids[$rsDeptSubs->f('fk_service')]))
        {
            $array_service_ids[$rsDeptSubs->f('fk_service')] = $rsDeptSubs->f('fk_service');
        }
        $rsDeptSubs->movenext();
    }

    $strSelectSiteSubs = "select fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'site' and fk_me_key in (".get_customer_sites().")  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
    $rsSiteSubs = $swData->query($strSelectSiteSubs,true);
    while($rsSiteSubs && !$rsSiteSubs->eof)
    {
        //-- customer & dept sub take prec over site sub
        if(!isset($array_service_ids[$rsSiteSubs->f('fk_service')]))
        {
            $array_service_ids[$rsSiteSubs->f('fk_service')] = $rsSiteSubs->f('fk_service');
        }
        $rsSiteSubs->movenext();
    }

    $strSelectOrgSubs = "select fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'company' and fk_me_key = '".pfs($_SESSION['userdb_fk_company_id'])."'  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ". $addWhere;
    $rsOrgSubs = $swData->query($strSelectOrgSubs,true);
    while($rsOrgSubs && !$rsOrgSubs->eof)
    {
        //-- customer, dept & site sub take prec over org sub
        if(!isset($array_service_ids[$rsOrgSubs->f('fk_service')]))
        {
            $array_service_ids[$rsOrgSubs->f('fk_service')] = $rsOrgSubs->f('fk_service');
        }
        $rsOrgSubs->movenext();
    }

    //-- return as seperated string
    if($boolAsCommaString) 
    {
        return implode(",",$array_service_ids);
    }
    else
    {
        return $array_service_ids;
    }
}

function get_cust_only_service_ids($strRelType = "SUBSCRIPTION")
{
    $array_service_ids = Array();
    $array_service_ids["0"] = "-1";
    $strDSN = "swdata";
    $swData = false;
    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);

    $strSelectCustSubs = "select pk_id, fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'userdb' and fk_me_key = '".pfs($_SESSION['customerpkvalue'])."'  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ";
    $rsCustSubs = $swData->query($strSelectCustSubs,true);
    while($rsCustSubs && !$rsCustSubs->eof)
    {
        $array_service_ids[$rsCustSubs->f('pk_id')] = $rsCustSubs->f('fk_service');
        $rsCustSubs->movenext();
    }

    //-- return as seperated string
    return implode(",",$array_service_ids);
}

function get_dept_site_org_service_ids($strRelType = "SUBSCRIPTION")
{
    $array_service_ids = Array();
    $array_service_ids["0"] = "-1";
    $strDSN = "swdata";
    $swData = false;
    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);


    $strSelectDeptSubs = "select pk_id, fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'department' and fk_me_key = '".pfs($_SESSION['userdb_fk_dept_id'])."' and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ";
    $rsDeptSubs = $swData->query($strSelectDeptSubs,true);
    while($rsDeptSubs && !$rsDeptSubs->eof)
    {
        //-- customer sub take prec over dept sub
        if(!isset($array_service_ids[$rsDeptSubs->f('pk_id')]))
        {
            $array_service_ids[$rsDeptSubs->f('pk_id')] = $rsDeptSubs->f('fk_service');
        }
        $rsDeptSubs->movenext();
    }

    $strSelectSiteSubs = "select pk_id, fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'site' and fk_me_key in (".get_customer_sites().")  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ";
    $rsSiteSubs = $swData->query($strSelectSiteSubs,true);
    while($rsSiteSubs && !$rsSiteSubs->eof)
    {
        //-- customer & dept sub take prec over site sub
        if(!isset($array_service_ids[$rsSiteSubs->f('pk_id')]))
        {
            $array_service_ids[$rsSiteSubs->f('pk_id')] = $rsSiteSubs->f('fk_service');
        }
        $rsSiteSubs->movenext();
    }

    $strSelectOrgSubs = "select pk_id, fk_service from sc_subscription, config_itemi where config_itemi.pk_auto_id = sc_subscription.fk_service and fk_me_table = 'company' and fk_me_key = '".pfs($_SESSION['userdb_fk_company_id'])."'  and rel_type='".$strRelType."' and (service_archived IS NULL OR service_archived != 1) ";
    $rsOrgSubs = $swData->query($strSelectOrgSubs,true);
    while($rsOrgSubs && !$rsOrgSubs->eof)
    {
        //-- customer, dept & site sub take prec over org sub
        if(!isset($array_service_ids[$rsOrgSubs->f('pk_id')]))
        {
            $array_service_ids[$rsOrgSubs->f('pk_id')] = $rsOrgSubs->f('fk_service');
        }
        $rsOrgSubs->movenext();
    }

    //-- return as seperated string
    return implode(",",$array_service_ids);
}


//-- availability infor to go in a one line title
function get_service_availability_info_title(&$rsServices,&$swData)
{

    //-- if not monitored dont show anything
    if($rsServices->f('flg_availmntr')!="1") return "";

    $rsCI=false;
    $cmdb_status = "norm";
    $cmdb_status_alert="";
    $msg_title = "";
    $msg_body = "";

    //-- get cmdb item
    $strSQL = "select expectresolvebyx, startedonx ,cmdb_status, selfserv_message, selfserv_title, selfserv_descfail, selfserv_descimpact from config_itemi where cmdb_status!= 'Deactivated' and (flg_showonselfservfail=1 or flg_showonselfservimpact=1 or flg_showonselfserv=1) and pk_auto_id = ". $rsServices->f('fk_cmdb_id');
    $rsCI = $swData->query($strSQL,true);
    if( ($rsCI) && (!$rsCI->eof))
    {
        //-- get status and cmdb status
        //-- get state message
        $cmdb_status = $rsCI->f('cmdb_status');
        $selfserv_message = $rsCI->f('selfserv_message');

        //-- start time and planned resolve times 
        if($rsCI->f('startedonx')>0)
        {
            $msg_body = "Issue Started On : " . SwFCTV($rsCI->f('startedonx')) ."\n";
            $msg_body .= "Expected Resolve By : " . SwFCTV($rsCI->f('expectresolvebyx'))."\n";
            $msg_body .="\n";
        }

        switch(strtolower($cmdb_status))
        {
            case "impacted":
                $msg_title = $selfserv_message;
                $msg_body .= $rsCI->f('selfserv_descimpact');
                $cmdb_status_alert = "[!]";
                break;
            case "faulty":
                $msg_title = $selfserv_message;
                $msg_body .= $rsCI->f('selfserv_descimpact');
                $cmdb_status_alert = "[!!]";
                break;
            case "unavailable":
                $msg_title = $selfserv_message;
                $msg_body .= $rsCI->f('selfserv_descfail');

                $cmdb_status_alert = "[!!!]";
                break;
            case "active":
                $msg_title = $selfserv_message;
                $cmdb_status_alert = "";
                break;
        }

    }



    $strHTML = "&nbsp;&nbsp;<span class='service-item-".strtolower($cmdb_status)."' title='".$msg_body."'>[".$msg_title."]</span>";
    //if ($msg_body!="")
    //{
    //    $strHTML .= "<p>".$msg_body."</span></p>";
    //}
    return $strHTML;
}


//-- availability info to go inside a div
function get_service_availability_info_html(&$rsServices,&$swData)
{
    //-- if not monitored dont show anything
    if($rsServices->f('flg_availmntr')!="1") return "";

    $rsCI=false;
    $cmdb_status = "norm";
    $cmdb_status_alert="";
    $msg_title = "";
    $msg_body = "";
    //-- get cmdb item
    $strSQL = "select expectresolvebyx,startedonx,cmdb_status, selfserv_message, selfserv_title, selfserv_descfail, selfserv_descimpact from config_itemi where cmdb_status!= 'Deactivated' and (flg_showonselfservfail=1 or flg_showonselfservimpact=1 or flg_showonselfserv=1) and pk_auto_id = ". $rsServices->f('fk_cmdb_id');
    $rsCI = $swData->query($strSQL,true);
    if( ($rsCI) && (!$rsCI->eof))
    {
        //-- get status and cmdb status
        //-- get state message
        $cmdb_status = $rsCI->f('cmdb_status');
        $selfserv_message = $rsCI->f('selfserv_message');

        switch(strtolower($cmdb_status))
        {
            case "impacted":
                $msg_title = $selfserv_message;
                $msg_body .= $rsCI->f('selfserv_descimpact');
                $cmdb_status_alert = "[!]";
                break;

            case "faulty":
                $msg_title = $selfserv_message;
                $msg_body .= $rsCI->f('selfserv_descimpact');
                $cmdb_status_alert = "[!!]";
                break;
            case "unavailable":
                $msg_title = $selfserv_message;
                $msg_body .= $rsCI->f('selfserv_descfail');

                $cmdb_status_alert = "[!!!]";
                break;
            case "active":
                $msg_title = $selfserv_message;
                $cmdb_status_alert = "";
                break;
        }


        $strHTML = "<div class='item-line-availability'>";
        $strHTML .= "<p class='service-item-".strtolower($cmdb_status)."'>".$msg_title."</p>";
        if($rsCI->f('startedonx')>0)$strHTML .= "<p>The issue started on " . SwFCTV($rsCI->f('startedonx')) ." and is expected to be resolved by " . SwFCTV($rsCI->f('expectresolvebyx')) ."</p>";
        if($msg_body!="")$strHTML .= "<p><b>Description of Issue :</b></br>".nl2br($msg_body)."</p>";
        $strHTML .= "</div>";
    }
    return $strHTML;
}

//--
//-- output customers favourite services list along with any status messages
function get_favourite_service_ids()
{
    $commaList = "0";
    $strDSN = "swdata";
    $swData = false;

    if (!isset($strUID)) $strUID=null;
    if (!isset($strPWD)) $strPWD=null;

    //-- create or share a connection
	$swData = database_connect($strDSN,$strUID,$strPWD);
    
    if($swData)
    {
        //-- select customers favourite
        $rsFavs = $swData->query("select fk_service_id from SC_FAVOURITES, config_itemi where config_itemi.pk_auto_id = SC_FAVOURITES.fk_service_id and FK_KEYSEARCH = '".pfs($_SESSION['customerpkvalue'])."' and (service_archived IS NULL OR service_archived != 1)",true);
        if($rsFavs)
        {
            while (!$rsFavs->eof)
            {
                if($commaList!="")$commaList.=",";
                $commaList .= $rsFavs->f('fk_service_id');
                $rsFavs->movenext();
            }
        }
    }
    $commaList .= ",0";
    return $commaList;
}

//--
//-- output customers favourite services list along with any status messages
function is_service_favourite($strServiceId)
{
    $strDSN = "swdata";
    $swData = false;

    if (!isset($strUID)) $strUID=null;
    if (!isset($strPWD)) $strPWD=null;

    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);
    
    if($swData)
    {
        //-- select customers favourite
        $rsFavs = $swData->query("select fk_service_id from SC_FAVOURITES where FK_SERVICE_ID='".$strServiceId."' AND FK_KEYSEARCH = '".pfs($_SESSION['customerpkvalue'])."'",true);
        if($rsFavs)
        {
            while (!$rsFavs->eof)
            {
                return true;
            }
        }
    }
    return false;
}

//--
//-- used in service search results - output action buttons/links for supplied cmdb id based on customer permissions 
function output_search_actions($fk_cmdb_id)
{
    //-- return buttons html
    $strHTML = "";
    $strSubscriptionIDs = "";
    $strManagedServicesIDs = $_SESSION['sc_cust_managed'];
    $arrManagedServicesIDs = explode(",",$strManagedServicesIDs);

    $strSubSubscriptionIDs =  $_SESSION['catalog_keys_sub'];
    $strViewSubscriptionIDs =  $_SESSION['catalog_keys_view'];

    if(in_array($fk_cmdb_id,$arrManagedServicesIDs))
    {
        $boolManagedServices = true;
        $strSubscriptionIDs = get_customers_managed_service_ids();
    }
    
    if(($strSubSubscriptionIDs!="-1")&&($strSubSubscriptionIDs!=""))
    {
        if($strSubscriptionIDs!=""){$strSubscriptionIDs.=",";}
        $strSubscriptionIDs .= $strSubSubscriptionIDs;
    }

    if(($strViewSubscriptionIDs!="-1")&&($strViewSubscriptionIDs!=""))
    {
        if($strSubscriptionIDs!=""){$strSubscriptionIDs.=",";}
        $strSubscriptionIDs .= $strViewSubscriptionIDs;
    }

    //-- create or share a connection
    $dsnConn = database_connect("swdata","","");

    //-- we want to exclude services fro list
    $strExcludeFilter = "";

    $strFavoriteHTML = "";
    $strActiveSupportMsg = "";
    $strActiveRequestsMsg = "";
    $strStatusImage = "";
    $strQlink = "";
    

    if($boolManagedServices)
    {
        $strSelectServiceSubscriptions = "select cmdb_status, service_name, description , catalog_type, fk_cmdb_id,vsb_key_features,vsb_title,vsb_description, type_display,flg_allow_support,flg_allow_request, fk_status_level, users_actual, users_maximum from config_itemi,sc_folio,sc_typei where sc_typei.pk_config_type = config_itemi.catalog_type and sc_folio.fk_cmdb_id in (".$strSubscriptionIDs.") and config_itemi.pk_auto_id = fk_cmdb_id ".$strExcludeFilter." order by type_display, vsb_title asc";

        $rsSubs = $dsnConn->query($strSelectServiceSubscriptions,true);

        if(!$rsSubs->eof)
        {
            $intType = 3;
            $strQlink .= "<td noWrap align='left' width='125px' style='width:125px;font-size:10px'><a href='#' style='text-decoration:none;' onClick='sc_load_service_page(".$fk_cmdb_id.",".$intType.");'>View Details&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></td>";
        }
        else
        {
            $strQlink .= "<td noWrap align='left' width='125px' style='width:125px;font-size:10px'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
        }    
    }

    
	$strSelectServiceSubscriptions = "select cmdb_status,rel_type, service_name, description , catalog_type, fk_cmdb_id,vsb_key_features,vsb_title,vsb_description, type_display,config_itemi.flg_allow_support,config_itemi.flg_allow_request,config_itemi.flg_allow_subs, sc_subscription.pk_id as pk_sub_id, fk_status_level, users_actual, users_maximum from config_itemi,sc_folio, sc_subscription,sc_typei where sc_typei.pk_config_type = config_itemi.catalog_type and sc_subscription.pk_id in (".$strSubscriptionIDs.") and config_itemi.pk_auto_id = fk_cmdb_id and fk_service = fk_cmdb_id and config_itemi.status_portfolio = 'Catalog' ".$strExcludeFilter." and fk_cmdb_id=".$fk_cmdb_id." order by catalog_type, type_display, vsb_title asc";
    $strSelectServiceSubscriptions = "select cmdb_status,rel_type, service_name, description , catalog_type, fk_cmdb_id,vsb_key_features,vsb_title,vsb_description,config_itemi.flg_allow_support,config_itemi.flg_allow_request,config_itemi.flg_allow_subs, sc_subscription.pk_id as pk_sub_id, fk_status_level, users_actual, users_maximum from config_itemi,sc_folio, sc_subscription where sc_folio.fk_cmdb_id in (".$strSubscriptionIDs.") and config_itemi.pk_auto_id = fk_cmdb_id and fk_service = fk_cmdb_id and config_itemi.status_portfolio = 'Catalog' ".$strExcludeFilter." and fk_cmdb_id=".$fk_cmdb_id." order by catalog_type, vsb_title asc";
    //echo $strSelectServiceSubscriptions;
    $rsSubs = $dsnConn->query($strSelectServiceSubscriptions,true);

    if(!$rsSubs->eof)
    {
        $intType = ($rsSubs->f("rel_type")=='SUBSCRIPTION')?1:0;
        if($intType==1)
        {
            //-- favourites html
            //-- check if service is in favorites
            GLOBAL $strFavouriteServices;
            $strChecked = (strpos($strFavouriteServices,",".$rsSubs->f("pk_sub_id").",")>0)?"checked":"";
            $strFavoriteHTML = "<br><br><a href='#' style='text-decoration:none;position:relative;top:-3px;cursor:default;'>Show as favourite</a><input name='cb_".$rsSubs->f("fk_cmdb_id")."' class='radio' onClick='alter_customer_favorites(this,".$rsSubs->f("pk_sub_id").")' type='checkbox' ".$strChecked.">";

            //-- only show image and links for subscribed services
            $strStatusImage = "<td noWrap><div title='".$rsSubs->f('fk_status_level')."' style='width:30px;'>".GetCMDBStatusImage($rsSubs->f('cmdb_status'))."</div></td>";
            $strSupportLink = "<td noWrap  width='125px' style='width:125px;visibility:hidden;'>Request Support&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

            //-- allow support
            if($rsSubs->f("flg_allow_support")=='1')
            {
                $strSupportLink = "<td noWrap align='left' width='125px' style='width:125px;font-size:10px'><button name='supportme' value='Support Me'  class='scsupportme' onClick='sc_load_service_page(".$rsSubs->f('fk_cmdb_id').",".$intType.",\"sv_support\");'/>Support Me</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            

                //-- get active support requests count
                $strSQL = "select count(*) as callcounter from OPENCALL where itsm_catreq_type = 'SUPPORT' and ITSM_FK_SERVICE=".$rsSubs->f("fk_cmdb_id")." and CUST_ID = '".pfs($_SESSION['customerpkvalue'])."' and status < 15";

                $cntRS = $dsnConn->query($strSQL,true);
                $strActiveSupportMsg = "Support<br>requests: " . $cntRS->f('callcounter');

                $strSupportLink .= "<br/><br/>".$strActiveSupportMsg."</td>";

            }
            else
            {
                $strSupportLink = "<td noWrap align='left' width='125px' style='width:125px;font-size:10px'></td>";
            }

            if($rsSubs->f("flg_allow_request")=='1')
            {

                //-- qlink html
                $strSupportLink .= "<td  noWrap align='left' width='120px' style='width:120px;font-size:10px'><button name='supportme'  class='scraiserequest' onClick='sc_load_service_page(".$rsSubs->f('fk_cmdb_id').",".$intType.",\"sv_raisenew\");'/>Raise Request</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";


                //-- get active support requests count
                $strSQL = "select count(*) as callcounter from OPENCALL where itsm_catreq_type = 'REQUEST' and ITSM_FK_SERVICE=".$rsSubs->f("fk_cmdb_id")." and CUST_ID = '".pfs($_SESSION['customerpkvalue'])."' and status < 15";
                $cntRS = $dsnConn->query($strSQL,true);
                $strActiveRequestsMsg = "Service<br>requests: " . $cntRS->f('callcounter');

                $strSupportLink .= "<br/><br/>".$strActiveRequestsMsg."</td>";
            }else
            {
                $strSupportLink .= "<td  noWrap align='left' width='120px' style='width:120px;font-size:10px'><div style='width:120px;'>&nbsp;</div></td>";
            }
        }
        else
        {
            if($strQlink=="")$strQlink.="<td></td>";
            if($rsSubs->f('users_actual') < $rsSubs->f('users_maximum'))
			{
				if($rsSubs->f('flg_allow_subs')=='1')
				{
					$strQlink .= "<td noWrap align='left' width='125px' style='width:120px;font-size:10px'><button name='Subscribe to this service'   onClick='sc_load_service_page(".$rsSubs->f('fk_cmdb_id').",".$intType.",\"sv_raisenew\");'/>Subscribe</button></td><td></td>";
				}
				else
				{
					//-- Indicate that you cannot subscribe to the service
					$strQlink = "<td colspan='2'></td><td noWrap align='left' width='125px' style='width:125px;font-size:10px'>Unable to subscribe at this time.</td>";
				}
			}
			else
			{
				//-- Indicate that maximum number of subscribers has been reached.
				$strQlink .= "<td colspan='1'></td><td noWrap align='left' width='125px' style='width:125px;font-size:10px'>Maximum Subscriber Level Reached.";
				//-- Potential Future functionality - Request to be notified when service becomes available
				//$strQlink .= "<br/><br/><a href='#' style='text-decoration:none;'>Send me an email when this item becomes available</a></td>";
				$strQlink .= "</td>";
			}
        }
    }
    else
    {
        $strQlink .= "<td></td><td></td>";
    }

    if($strStatusImage!="")
    {
        $strHTML .= $strStatusImage;
    }
    else
    {
        $strHTML .= "<td></td>";
    }

    if($strQlink!="")
    {
        $strHTML .= $strQlink;
    }
    else
    {
        $strHTML .= "<td></td>";
    }

    $strHTML .= $strSupportLink;
    
    return $strHTML;
}


function get_cust_owned_rels($boolAsCommaString=false, $strRelType)
{
    $array_rel_ids = Array();
    $strDSN = "swdata";
    $swData = false;
    //-- create or share a connection
	$swData = database_connect($strDSN,$strUID,$strPWD);
	$array_rel_ids["0"] = "-1";

    $strSelectCustRels = "select * from config_reli where fk_parent_itemtext='".pfs($_SESSION['customerpkvalue'])."' and fk_child_type='".pfs($strRelType)."'";

    $rsCustRels = $swData->query($strSelectCustRels,true);
    while($rsCustRels && !$rsCustRels->eof)
    {
        $array_rel_ids[$rsCustRels->f('fk_child_id')] = $rsCustRels->f('fk_child_id');
        $rsCustRels->movenext();
    }

    //-- return as seperated string
    if($boolAsCommaString) 
    {
        return implode(",",$array_rel_ids);
    }
    else
    {
        return $array_rel_ids;
    }
}

function get_cust_avail_rels($boolAsCommaString=false)
{
    $array_rel_ids = Array();
    $strDSN = "swdata";
    $swData = false;
    //-- create or share a connection
    $swData = database_connect($strDSN,$strUID,$strPWD);
    $array_rel_ids["0"] = "-1";

    $strSelectCustRels = "select * from config_reli where ( (fk_parent_type = 'ME->COMPANY' and fk_parent_itemtext = '".$_SESSION['userdb_fk_company_id']."') OR (fk_parent_type = 'ME->SITE' and fk_parent_itemtext = '".$_SESSION['userdb_site']."') OR (fk_parent_type = 'ME->DEPARTMENT' and fk_parent_itemtext = '".$_SESSION['userdb_department']."') OR (fk_parent_type = 'ME->DEPARTMENT' and fk_parent_itemtext = '".$_SESSION['userdb_subdepartment']."'))";

    $rsCustRels = $swData->query($strSelectCustRels,true);
    while($rsCustRels && !$rsCustRels->eof)
    {
        $array_rel_ids[$rsCustRels->f('fk_child_id')] = $rsCustRels->f('fk_child_id');
        $rsCustRels->movenext();
    }

    //-- return as seperated string
    if($boolAsCommaString) 
    {
        return implode(",",$array_rel_ids);
    }
    else
    {
        return $array_rel_ids;
    }
    
}    

?>