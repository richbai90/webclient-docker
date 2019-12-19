<?php
//error_reporting(E_ERROR | E_PARSE );
// set_error_handler("itsm_error_handling");

/*function itsm_error_handling($intErrorNo, $strError, $strErrorFile, $strErrorLine)
{
	$errorlevel=error_reporting();
	if($intErrorNo & $errorlevel)
		echo "An unexpected error has occured. Please contact your Supportworks Administrator.<br>";
}*/

//-- nwj - do not cache pages (ie issue when using post)
header( "Expires: Mon, 20 Dec 1998 01:00:00 GMT" );
header( "Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT" );
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header( "Pragma: no-cache" );

//-- DTH New Application Code for Side By Side
define('APPCODE',"itsm_default"); //-- application code
define('ANSWER_SPLIT',"[|]");

//-- standard and class includes
include_once('stdinclude.php');						//-- standard functions
include_once('swformattimeintext.php');				//-- date formatting functions

//-- class includes for ITSM
//-- define bit flags - can be used to check permission settings i.e. webflag and analyst permissions
include_once('bitflags.php');
include_once('classanalystsession.php');     //--  class to handle analyst session info
include_once('classdatabaseaccess.php');		//-- data base access class
include_once('classdatatable.php');			//-- class to control drawing out of data tables
include_once('classhdsession.php');			//-- class to handle call activaty (log / update etc)
include_once('classpicklist.php');			 //-- class to handle creation of table record picklist
include_once('classtabcontrol.php');			//-- class to control drawing out of tab controls
include_once('classwizardcontrol.php');			 //-- class to handle creation of wssm wizard
include_once('classwssmactions.php');			//-- class to handle call activaty (log / update etc)

//-- function helpers
include_once("helpers/catalog.functions.php");
include_once('helpers/language.php');
include_once("helpers/servicetype.functions.php");
include_once("helpers/tree.data.php");		//-- functions to load and output tree data


//-- month array
$arrMonth[1] = "January";$arrMonth[2] = "February";$arrMonth[3] = "March";$arrMonth[4] = "April";$arrMonth[5] = "May";$arrMonth[6] = "June";
$arrMonth[7] = "July";$arrMonth[8] = "August";$arrMonth[9] = "September";$arrMonth[10] = "October";$arrMonth[11] = "November";$arrMonth[12] = "December";

//-- include file to check session is valid
include_once('sessioncheck.php');


//-- nwj - fix for GET requests data limit
if(isset($_SESSION[gvs('httpreqid')]))
{
	foreach ($_SESSION[gvs('httpreqid')] as $key => $val)
	{
		if($key=='httpreqid')continue;
		$_GET[$key] = $val;
	}
	unset($_SESSION[gvs('httpreqid')]);
}

//-- nwj - check for any encoded data
//-- get encoded data then split by & to get vars - see portal.control.js openWin function
$in_data = base64_decode(gvs('ied'));
$arr_data = explode("&", $in_data);
foreach ($arr_data as $pos => $aVariable) 
{
	$arr_var = explode("=", $aVariable);
	if(!isset($arr_var[1]))
	{
		$arr_var[1] = null;
	}
	$_GET[$arr_var[0]]=$arr_var[1];
	$GLOBALS[$arr_var[0]]=$arr_var[1];
}
//-- end of decoding
//--

//-- check passed in vars to make sure they are valid
check_variable_quality();


//-- check if in catalog mode
function is_catalog_mode($boolCheck)
{
	return ($boolCheck==$_SESSION['_CATALOG_MODE']);
}

// ES - check if customer's organisation is supported
function checkOrgSupport($customerID)
{
	$strSQL = "select company.supportexpiryx from company, userdb where userdb.keysearch = '".PrepareForSql($customerID)."' and company.pk_company_id = userdb.fk_company_id";
	$recSet = get_db_recordset("swdata",$strSQL);
	if($recSet->recordcount > 0)
	{
		$intExpiryEpoch = $recSet->f("supportexpiryx");
		$intCurrentEpoch = time();
		
		if($intExpiryEpoch==0 || '' == $intExpiryEpoch)
		{
			// if expiry date not set org is supported
		}
		else if($intCurrentEpoch>=$intExpiryEpoch)
		{
			// not supported
			return 0;
		}
			
	}
	return 1;
}

//-- check if in catalog mode
function is_rs_enabled()
{
	$strSQL = "select * from sw_sbs_settings where setting_name = 'REMOTESUPPORT.ENABLED' and setting_value='True' and appcode = '".$_SESSION['dataset']."'";
	$recSet = get_db_recordset("swdata",$strSQL);
	if($recSet->recordcount > 0)
	{
		$url = "";
		$strSQL = "select remote_support.url from company_rc_tools join remote_support on rc_tool=name where flg_enabled=1 and fk_company_id='".$_SESSION['userdb_fk_company_id']."'";
		$recSet = get_db_recordset("swdata",$strSQL);
		if (!$recSet->eof)
        {
            $url =  $recSet->f("url");
            $recSet->movenext();
        }
		$_SESSION['remote_support_url'] = $url;
		return $recSet->recordcount>0;
	}
	return false;
}

/* function to show/hide appropriate knowledgebase link (Default or RightAnswers) in selfservice */
function is_ra_enabled()
{
	$strSQL = "select * from sw_sbs_settings where setting_name = 'KNOWLEDGE.DEFAULT_TOOL' and appcode = '".$_SESSION['dataset']."'";
	$recSet = get_db_recordset("swdata",$strSQL);
	
		if($recSet->recordcount)
		{
			if (!$recSet->eof)
			{
				switch(strtolower(trim($recSet->f("setting_value"))))
				{
					case "supportworks":
						return false;
						break;
					case "rightanswers":
						return true;
						break;
					default:
						return false;
			}
			}
		}
		return false;
}

//-- set default values for sw selfservice kb searches
function set_sw_kbsettings()
{
	//Set defaults
	$_SESSION['ss_kb_search_type'] = 1;	// Corresponds to natural search 
	$_SESSION['ss_kb_search_scope'] = ""; // Corresponds to Entire Knowledgebase
	$_SESSION['ss_can_change_kb_search_type'] = "True";
	$_SESSION['ss_can_change_kb_search_scope'] = "True";

	$strSQL = "select * from sw_sbs_settings where setting_name like 'KNOWLEDGE%' and appcode = '".$_SESSION['dataset']."'";
	$recSet = get_db_recordset("swdata",$strSQL);
	if($recSet->recordcount)
	{
		while(!$recSet->eof)
		{
			switch(trim($recSet->f("setting_name")))
			{
				case "KNOWLEDGE.SELFSERVICE.SEARCH_TYPE":
					if($recSet->f("setting_value")!="")
						$_SESSION['ss_kb_search_type'] = $recSet->f("setting_value");
					break;
				case "KNOWLEDGE.SELFSERVICE.SEARCH_SCOPE":
					if($recSet->f("setting_value")!="")
						$_SESSION['ss_kb_search_scope'] = $recSet->f("setting_value");
					break;
				case "KNOWLEDGE.SELFSERVICE.CAN_CHANGE_SEARCH_TYPE":
					if($recSet->f("setting_value")!="")
						$_SESSION['ss_can_change_kb_search_type'] = $recSet->f("setting_value");
					break;
				case "KNOWLEDGE.SELFSERVICE.CAN_CHANGE_SEARCH_SCOPE":
					if($recSet->f("setting_value")!="")
						$_SESSION['ss_can_change_kb_search_scope'] = $recSet->f("setting_value");
					break;
				default:
					break;
			}
				
			$recSet->movenext();
			
			
			
		}
	}
	else
	{
		return false;
	}
	return true;
}

//-- check if in catalog mode
function can_view_calls($strFlag)
{
	GLOBAL $customer_session;
	eval("\$strWebFlag = ".$strFlag.";");
	return $customer_session->IsOption($strWebFlag)==true;
}


//-- will return true or false if analyst has application right
function haveappright($strGroup,$fRight)
{
	eval("\$intRight = bit".$fRight.";");
	$intRight++;$intRight--;
	return (($intRight & $_SESSION['wc_apprights'][$strGroup])>0);
}


//--
//-- These date functions are used only by analyst portal pages
//--
//--
//-- helpers


//-- checks a php variable thats been submitted by client for quality e.g. is it a string when it should be a number etc
function check_variable_quality()
{
    $strFileName = sw_getcfgstring("InstallPath") . "/html/clisupp/xml/variablechecks.xml";
    $xmlfile = load_file($strFileName);
    $xmlDoc = domxml_open_mem($xmlfile);
    if($xmlDoc)
    {
        $root = $xmlDoc->document_element();
		$arrNodes = $root->get_elements_by_tagname("check");

		foreach ($arrNodes as $nodePos => $aNode)
		{
			$varName = $aNode->get_attribute("id");
			$strVarValue = gvs($varName,true);
			if(($strVarValue!="variablenotset") && ($strVarValue!="undefined"))
			{
				//-- check if var has values that it should not contain and has values it must contain
				$arrMustNotContain = explode("|",$aNode->get_attribute("mustnotcontain"));
				for($x=0; $x < count($arrMustNotContain);$x++)
				{
					$strCheckValue = $arrMustNotContain[$x];
					if($strCheckValue=="")continue;
					if(strpos($strVarValue,$strCheckValue)===false)
					{
						//-- good to go
					}
					else
					{
						exit_on_bad_var($varName,$strVarValue);
					}
				}

				$arrMustContain = explode("|",$aNode->get_attribute("mustcontain"));
				for($x=0; $x < count($arrMustContain);$x++)
				{
					$strCheckValue = $arrMustContain[$x];
					if($strCheckValue=="")continue;
					if(strpos($strVarValue,$strCheckValue)===false)
					{
						exit_on_bad_var($varName,$strVarValue);
					}
					else
					{
						//-- good to go
					}
				}
			
				//-- got this far so check if passes check
				switch(strtolower($aNode->get_content()))
				{
					case "alphaonly":
						if($strVarValue=="")break;
						if (is_numeric($strVarValue))
						{
							//-- error var is meant to be numeric
							exit_on_bad_var($varName,$strVarValue);
						}
						break;
					case "alphaonlynotblank":
						if(($strVarValue=="")||(is_numeric($strVarValue)))
						{
							//-- error var is meant to be numeric
							exit_on_bad_var($varName,$strVarValue);
						}
						break;
					case "numericonly":
						if($strVarValue=="")break;
						if (!is_numeric($strVarValue))
						{
							//-- error var is meant to be numeric
							exit_on_bad_var($varName,$strVarValue);
						}
						break;
					case "numericonlynotblank":
						if(($strVarValue=="")||(!is_numeric($strVarValue)))
						{
							//-- error var is meant to be numeric
							exit_on_bad_var($varName,$strVarValue);
						}
						break;
					case "notblank":
						if($strVarValue=="")
						{
							//-- error var is meant to be numeric
							exit_on_bad_var($varName,$strVarValue);
						}
						break;
				}
			}
		}
    }
	return true; 

}

//-- exit application on bad var
function exit_on_bad_var($varName,$strVarValue)
{
	//echo $varName . ":" . $strVarValue;
	echo "</br><center><font color='red'>A submitted variable was identified as a possible security threat. Please contact your system Administrator.</font></center>";
	exit;
}


//-- load file content - takes into account sspi
function load_file($strPath)
{
    return file_get_contents($strPath);
}

//--
//-- open a toolbar xml def and return root document
function open_toolbarxml($strTBarName)
{
    //-- open xml file based on tabformname
    $strFileName = $GLOBALS['instance_path']."xml/toolbars/".$strTBarName.".xml";
    $xmlfile = load_file($strFileName);
    $xmlDoc = domxml_open_mem($xmlfile);
    $root = $xmlDoc->document_element();
    return $root;
}

function draw_toolbar($strTBarName)
{
    $strHTML = "<div class='toolbar' >";

    if($strTBarName!="")
    {
        //-- get bar and js function handle to use
        $oTBar = open_toolbarxml($strTBarName);
        $jsHandle = get_node_att($oTBar,"handler");

        $arrItems = getxml_childnodes($oTBar,"item");
        foreach($arrItems as $anItem)
        {
            $strItemID = get_node_att($anItem,"iid");
            $strItemImg = get_node_att($anItem,"img");

            $strHTML .= "<div id='tbi_".$strItemID."' class='toolbar-item' onMouseOver='app.toolbar_mouseover(this, event);' onMouseOut='app.toolbar_mouseout(this, event);'onClick='".$jsHandle."(\"".$strItemID."\")'>".$anItem->get_content()."</div>";
        }
    }
    $strHTML .= "</div>";
    return $strHTML;
}

//-- given a tab name create a class
function load_tab_form($strTabFormName)
{
    $retForm = new oTabForm;
    $retForm->xmlRoot = open_tabxml($strTabFormName);
    $retForm->controlname=$strTabFormName;
    return $retForm;
}

//--
//-- open a tab xml def and return root document
function open_tabxml($strTabFormName)
{
    //-- open xml file based on tabformname
    $strFileName = $GLOBALS['instance_path']."xml/tabsets/".$strTabFormName.".xml";
	//echo $strFileName;
    $xmlfile = load_file($strFileName);
	if(!$xmlfile)
	{	
		echo "<center>Unable to load xml tabset. Please contact your Supportworks Administrator<center>";
		exit;
	}
    $xmlDoc = domxml_open_mem($xmlfile);
    $root = $xmlDoc->document_element();
    return $root;
}


//-- load common table xml
function load_commontable_xml($strTableName)
{
    //-- open xml file based on tabformname
    $strFileName = $GLOBALS['instance_path']."xml\\tables\\". $strTableName. ".xml";
	//echo $strFileName;

    $xmlfile = load_file($strFileName);
    $xmlDoc = domxml_open_mem($xmlfile);
    if($xmlDoc)
    {
        $root = $xmlDoc->document_element();
    }
    else
    {
        $root=false;
    }
    return $root;

}

//--
//-- load table xml def into oxml obj
function load_table_xml($strTableName)
{
    //-- open xml file based on tabformname
    $strFileName = $GLOBALS['instance_path']."xml/tabledefs/".$strTableName.".xml";
    $xmlfile = load_file($strFileName);
    $xmlDoc = domxml_open_mem($xmlfile);
    if($xmlDoc)
    {
        $root = $xmlDoc->document_element();
    }
    else
    {
        $root=false;
    }
    return $root;
}

//--
//-- generate a new table object based on table xml
function load_data_table($oDataXML)
{
    $retTable = new oTableData;
    $retTable->xmlRoot = $oDataXML;
    return $retTable;
}

//-- get from
function get_tablehtml_fromxmlfile($strTableName,$orderBy = "", $sortDir = "", $boolCommon = false)
{
    if($boolCommon)
    {
        $oXML =	load_commontable_xml($strTableName);
    }
    else
    {
        $oXML = load_table_xml($strTableName);
    }

    if($oXML)
    {
        $oTableControl = load_data_table($oXML);
        if($oTableControl!=false)
        {
            //return $oTableControl->output_data_table($orderBy,$sortDir);
			//-- nwj - 21.07.2009 - supporting gadgets
			return $oTableControl->output_data_table($orderBy,$sortDir,0,1,-1,$strTableName);
        }
    }
    else
    {
        return "Error : The table data ($strTableName) could not be loaded";
    }
    return "";
}

//-- nwj 23.07.2009
function getxml_childnode_att($oXML,$strChildNodeName,$strAtt, $intChildPos = 0)
{
    $intcount=0;
    $childnodes = $oXML->child_nodes();
    foreach ($childnodes as $aNode)
    {
        if ($aNode->tagname==$strChildNodeName)
        {

            if(($intcount==$intChildPos)||($intChildPos==0))
            {
                return $aNode->get_attribute($strAtt);
            }
            $intcount++;
        }
    }
    return "";
}



/**
 * get node attribute function as xml_node class does not provide one
 *
 * @param string $name
 * @param array $att
 * @return String
 * @deprecated Use $element->get_attribute('name'); instead.
 */
function getAttribute($name, $att)
{
	if(is_array($att))
	{	
		foreach($att as $attkey => $anAttribute)
		{
			if($anAttribute->name()==$name)return $anAttribute->value();
		}
	}
	return "";
}

function get_node_att($oXML,$strAtt)
{
    if($oXML->has_attributes())
    {
        return  getAttribute($strAtt,$oXML->attributes());
    }
    else
    {
        return "";
    }
}

function getxml_childnode_content($oXML,$strChildNodeName,$intChildPos = 0)
{
    $childNode = getxml_childnode($oXML,$strChildNodeName,$intChildPos);
    if($childNode!=null)
    {
        return $childNode->get_content();
    }
    return "";
}

function getxml_childnode($oXML,$strChildNodeName,$intChildPos = 0)
{
    $intcount=0;
    $childnodes = $oXML->child_nodes();
    foreach ($childnodes as $aNode)
    {
        if ($aNode->tagname==$strChildNodeName)
        {

            if(($intcount==$intChildPos)||($intChildPos==0))
            {
                return $aNode;
            }
            $intcount++;
        }
    }
    return null;
}

function getxml_childnodes($oXML,$strChildNodeName = "")
{
    $array_nodes = Array();
    $childnodes = $oXML->child_nodes();
    foreach ($childnodes as $aNode)
    {
        if(($strChildNodeName=="")&&($aNode->tagname!=""))
        {
            //-- get any nodes so long as they have a tagname
            $array_nodes[sizeOf($array_nodes)+1]=$aNode;
        }
        else if (($aNode->tagname==$strChildNodeName)&&($strChildNodeName!=""))
        {
            //-- get any nodes that match
            $array_nodes[sizeOf($array_nodes)+1]=$aNode;
        }
    }

    return $array_nodes;
}

//--
//-- return xmlNode based on id
function xml_element_by_id($dom, $str_id  )
{
    $node_with_id  = null;
    $xpath = xpath_new_context($dom);
    $xpresult = xpath_eval($xpath, "//@id");
    foreach( $xpresult->nodeset as $node )
    {
        if ($node->value == $str_id) return $node->parent_node();
    }
    return $node_with_id;
}

//-- trim functions 100, 250 , 500
function trim100($strValue)
{
    return nl2br(substr($strValue,0,100));
}

function trim250($strValue)
{
    return nl2br(substr($strValue,0,250));
}

function trim500($strValue)
{
    return nl2br(substr($strValue,0,500));
}


//-- swfctv - format customer date time
function SwFCTV($intEpoch, $format = SW_DTMODE_DATETIME)
{
    if(($intEpoch=="") || ($intEpoch==0)) return "Not applicable";

    return SwFormatAnalystTimestampValue($format, $intEpoch);
}

function swformatcustomertimestampvalue($intEpoch,$format = SW_DTMODE_DATETIME)
{
    if(($intEpoch=="") || ($intEpoch==0)) return "Not applicable";
    return SwFCTV($intEpoch,$format);
}

//-- return ddf defined field label
function ddfl($strBinding)
{
	//-- 2.4 Language - encode output to UTF
	return lang_decode_to_utf(swdti_getcoldispname($strBinding));
}

//--
//-- FAT CLIENT ONLY
//-- format column name based on field binding table.col
//-- to be used in fat client php pages
function cmn_fcvformat($strValue, $strBinding)
{

    $returnValue = $strValue;
    $strDisplayName = swdti_getcoldispname($strBinding);
    //-- now if callref / equip / site etc make value a href
    switch($strBinding)
    {
        case "pence":
            $returnValue = gv('currencysymbol') . sprintf("%d.%0.2d", $strValue/100, $strValue%100);
            break;
        case "atelnumber":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                $returnValue = "<a href=\"hsl:tapidial?number=".urlencode($strValue)."\">".$strValue."</a>";
            }


            break;
        case "opencall.status":
            $returnValue = swdti_formatvalue("opencall.status",$strValue);
			break;

        case "opencall.callref":
            $intCallref = $strValue;
            if(gv('phpprintmode')=="1")
            {
                $returnValue = swcallref_str($intCallref);
            }
            else
            {
                $returnValue = "<a href=\"hsl:calldetails?callref=".urlencode($intCallref)."\">".swcallref_str($intCallref)."</a>";
            }
            break;
        case "opencall.site":
        case "equipmnt.site":
        case "userdb.site":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=site&key=".urlencode($strValue)."\">".$strValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swsite.php?site_name=".urlencode($strValue)."&ColourScheme=".$_GET['ColourScheme']."\">".$strValue."</a>";
					
		                }
            }
            break;
        case "opencall.costcenter":
        case "equipmnt.costcenter":
        case "userdb.costcenter":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=costcent&key=".urlencode($strValue)."\">".$strValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swcostcent.php?costcenter=".urlencode($strValue)."&ColourScheme=".$_GET['ColourScheme']."\">".$strValue."</a>";
                }

            }
            break;
        case "opencall.cust_id":
        case "equipmnt.owner":
        case "userdb.keysearch":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=userdb&key=".urlencode($strValue)."\">".$strValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swcust.php?keysearch=".urlencode($strValue)."&ColourScheme=".$_GET['ColourScheme']."\">".$strValue."</a>";
                }

            }
            break;
        case "opencall.equipment":
        case "equipmnt.equipid":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=equipmnt&key=".urlencode($strValue)."\">".$strValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swasset.php?equipid=".urlencode($strValue)."\">".$strValue."</a>";
                }

            }
            break;

            //-- formating for manufacturer fields
        case "equipmnt.manufactur":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=manufact&key=".urlencode($strValue)."\">".$strValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swmanufact.php?comp_name=".urlencode($strValue)."&ColourScheme=".$_GET['ColourScheme']."\">".$strValue."</a>";
                }
            }
            break;

            //-- formating for supplier
        case "equipmnt.supplier":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=supplier&key=".urlencode($strValue)."\">".$strValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swsupplier.php?company_id=".urlencode($strValue)."&ColourScheme=".$_GET['ColourScheme']."\">".$strValue."</a>";
                }

            }
            break;
    }
    return $returnValue;
}

//--
//-- FIELD CONVERSIONS - typically used in table columns
//-- convert field value based on value and field name
function common_convert_field_value($conversion,$fieldValue,$fieldName)
{
    switch($conversion)
    {
		case "service_type":
			return  swdti_formatvalue("config_itemi.service_type",$fieldValue);
			break;
		case "money":
			return  number_format($fieldValue,2);
			break;
		//-- added in itsm 2.4.0 for fat client reports
        case "hhmmss":
			$fieldValue = floor($fieldValue/60);
			if($fieldValue>59)
			{
				$fieldValue = floor($fieldValue/60).'hr(s) '.floor($fieldValue%60);
			}
			return $fieldValue.'min(s)';
			break;
        case "hh_mm":
			$fieldValue = floor($fieldValue/60);
			if($fieldValue>59)
			{
				$hrs = floor($fieldValue/60);
				$mins = floor($fieldValue%60);
				if(strlen($hrs)==1)
				{
					$hrs = "0".$hrs;
				}
				if(strlen($mins)==1)
				{
					$mins = "0".$mins;
				}
				$fieldValue = $hrs.':'.$mins;
			}else
			{
				if(strlen($fieldValue)==1)
				{
					$fieldValue = "0".$fieldValue;
				}
				$fieldValue ="00:".$fieldValue;
			}
			return $fieldValue;
			break;
         case "dayssince":
			 $fieldValue = floor(((time()-$fieldValue)/60)/60/24);
			// round();
			return $fieldValue;
			break;

		//-- trim text by 100,150,200,250 chars
        case "trim100":
            return SwConvertDateTimeInText(trim100($fieldValue));
        case "trim150":
            return SwConvertDateTimeInText(nl2br(substr($fieldValue,0,150)));
        case "trim200":
            return SwConvertDateTimeInText(nl2br(substr($fieldValue,0,200)));
        case "trim250":
            return SwConvertDateTimeInText(nl2br(substr($fieldValue,0,250)));
        case "trim500":
            return SwConvertDateTimeInText(nl2br(substr($fieldValue,0,500)));
        case "trim1000":
            return SwConvertDateTimeInText(nl2br(substr($fieldValue,0,1000)));
        case "trim1500":
            return SwConvertDateTimeInText(nl2br(substr($fieldValue,0,1500)));

            //--
            //-- trim text by first newline
        case "trimnewline":
            return SwConvertDateTimeInText(substr($fieldValue, 0, strpos($fieldValue, "\r\n")));
            break;

            //--
            //-- trim text by first newline and return right side text
        case "trimnewlineright":
            return SwConvertDateTimeInText(substr($fieldValue, strpos($fieldValue, "\r\n"), strlen($fieldValue)));
            break;


            //-- convert customer ratings to images
        case "c_rating":
            return conv_crating($fieldValue);
        case "cr_rating":
            return conv_resolvedcrating($fieldValue);

            //--
            //-- show asset link (fat client only)
        case "asset":
            if ( ($_SESSION['portalmode'] == "FATCLIENT") && (gv('phpprintmode')!="1") )
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    return "<a href='hsl:editrecord?formmode=edit&table=equipmnt&key=".$fieldValue."'>".$fieldValue."</a>";
                }
                else
                {
                    //-- open url
                    return "<a href='swasset.php?equipid=".$fieldValue."'>".$fieldValue."</a>";
                }
            }
            else
            {
                return $fieldValue;
            }
            break;

            //--
            //-- show manufact link (fat client only)
        case "manufact":
            if ( ($_SESSION['portalmode'] == "FATCLIENT") && (gv('phpprintmode')!="1") )
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    return "<a href='hsl:editrecord?formmode=edit&table=manufact&key=".$fieldValue."'>".$fieldValue."</a>";
                }
                else
                {
                    //-- open url
                    return "<a href='swmanufact.php?comp_name=".$fieldValue."'>".$fieldValue."</a>";
                }
            }
            else
            {
                return $fieldValue;
            }
            break;

            //-- format callref - if in fat client use link
        case "callref":

            if ( ($_SESSION['portalmode'] == "FATCLIENT") && (gv('phpprintmode')!="1") )
            {
                //-- callref with a hsl url to open call details
                $intCallref = $fieldValue;
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    $fieldValue = "<a href='hsl:calldetails?callref=".$intCallref."'>".swcallref_str($intCallref)."</a>";
                }
                else
                {
                    //-- open url
				   return "<a href='itsm_swcall.php?callref=".$intCallref."&ColourScheme=".$_GET['ColourScheme']."'>".swcallref_str($intCallref)."</a>";
                }
                return $fieldValue;
            }
            else
            {
                return swcallref_str($fieldValue);
            }
            break;

            //-- format callstatus
        case "callstatus":
			//-- 02.09.2009 - if in wssm dont show statuss like escalated etc as requested by jamesa
			if($_SESSION['portalmode'] == "CUSTOMER")
			{
	            return  fmt_wssm_callstatus($fieldValue);
			}
			else
			{
				return  swdti_formatvalue("opencall.status",$fieldValue);
			}
            break;

        case "wssmcallstatus":
            return  fmt_wssm_callstatus($fieldValue);
            break;

            //-- newline to <br>
        case "nl2br":
            return nl2br(SwConvertDateTimeInText($fieldValue));
            break;

            //-- format dates
        case "customerdate":
            return SwFCTV($fieldValue);
            break;
        case "dbfielddate":
            return SwFormatDateTimeColumn($fieldName, $fieldValue);
            break;
        case "analystdate":
            return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $fieldValue);
            break;

            //-- format profile codes
        case "probcode":
            return FormatProblemCode($fieldValue);
            break;
        case "fixcode":
            return FormatResolutionCode($fieldValue);
            break;

            //-- 1/0 to Y/N
        case "1_0_TO_Y_N":
            return ($fieldValue==0)?"No":"Yes";
            break;

        case "imagecmdbstatus":
            return GetCMDBStatusImage($fieldValue);
            break;

            //-- if field is blank and html &nbsp
        case "space":
            $fieldValue=($fieldValue=="")?"&nbsp;":$fieldValue;
            break;

		case "searchimage":
			return GetSearchImage($fieldValue);
			break;

		case "servicelinks":
			if ( ($_SESSION['portalmode'] != "FATCLIENT") && (gv('phpprintmode')!="1") )
            {
				return output_search_actions($fieldValue);
                
            }
            else
            {
                return "";
            }
            break;

		case "slaname":
			return get_sla_ola_name($fieldValue,true);
			break;

		case "olaname":
			return get_sla_ola_name($fieldValue,false);
			break;

		//-- display content in xml table column containing html links that have been parsed by htmlentities
		case "tablehtmltext":
			return html_entity_decode($fieldValue,ENT_QUOTES,'UTF-8');
	        break;

		default:
            return ($fieldValue);
            break;
    }
}

//--
//-- format call status based on current diary
function fmt_callstatus($varValue)
{
    return swdti_formatvalue("opencall.status",$varValue);
}

function fmt_wssm_callstatus($strStatus)
{
		switch(strToLower($strStatus))
		{
			case "16":
			case "18":
				return "Closed";
			case "17":
				return "Cancelled";
			case "6":
				return "Resolved";
			case "4":
				return "On-Hold";
			default:
				return "Active";
		}
}

//--
//-- given a string parse out context
function parse_context_vars($parseString)
{
    return eval_contextvars($parseString,"![","]!");

}

function eval_contextvars($parseString,$strStartChar,$strEndChar)
{
    $counter=0;
    while( (strstr($parseString,$strStartChar)) && (strstr($parseString,$strEndChar)) )
    {
        //-- find the first $strStartChar (place holder) and store the string upto that point
        $strBeginning = substr($parseString,0,strpos($parseString,$strStartChar));
        $strPlaceHolder = substr($parseString,strpos($parseString,$strStartChar)+strlen($strStartChar));
        $strPlaceHolder = substr($strPlaceHolder,0,strpos($strPlaceHolder,$strEndChar));

        //-- evaluate
        //echo $strBeginning . ":" . $strPlaceHolder;
		eval("\$varValue = ".$strPlaceHolder.";");
		//-- F0093737
		$varValue = lang_decode_to_utf($varValue);
		$parseString = str_replace($strStartChar.$strPlaceHolder.$strEndChar,$varValue,$parseString);
        $counter++;
        if($counter>50)return $parseString;
    }
    return $parseString;
}


//-- return image to display
function GetCMDBStatusImage($cmdbStatus)
{
    switch (strToLower($cmdbStatus))
    {
        case "active":
            $strImage= "<div class='cmdb-active'></div>";
            break;
        case "faulty":
        case "impacted":
            $strImage = "<div class='cmdb-faulty'></div>";
            break;
        case "unavailable":
        case "deactivated":
            $strImage = "<div class='cmdb-unavail'></div>";
            break;
    }
    return $strImage;
}

//-- return image - added for service search results
function GetSearchImage($imgURL)
{
	//$strHTML = "<img class='scimg' src='".str_replace("&amp;[app.webroot]","/sw",$imgURL)."'/>";

	$strHTML = "<span id='enterpriseLogo_test' width='120' style='display: inline-block;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\"".str_replace("&amp;[app.webroot]","/sw",$imgURL)."\",sizingMethod=\"scale\");width:120px;'><img class='scimg' width='120' style='filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);width:120px' src=\"".str_replace("&amp;[app.webroot]","/sw",$imgURL)."\"/></span>";

	return $strHTML;
}
//-- return small image - added for service catalog list displays
function GetSearchImageSmall($imgURL)
{
	$strHTML = "<span id='enterpriseLogo_test' width='40' style='display: inline-block;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\"".str_replace("&[app.webroot]","/sw",$imgURL)."\",sizingMethod=\"scale\");width:40px;'><img class='scimg-small' width='40' style='filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);width:40px' src=\"".str_replace("&[app.webroot]","/sw",$imgURL)."\"/></span>";

	return $strHTML;
}

//-- return current document path http://billy/something.com?hello=hello return htpp://billy/
function docURL()
{
    return dirname(docFullURL())."/";
}

//-- return current document url htpp://billy/something.com?hello=hello
function docFullURL()
{
    $s = empty($_SERVER["HTTPS"]) ? ''
    : ($_SERVER["HTTPS"] == "on") ? "s"
    : "";
    $protocol = strleft(strtolower($_SERVER["SERVER_PROTOCOL"]), "/").$s;
    $port = ($_SERVER["SERVER_PORT"] == "80") ? ""
    : (":".$_SERVER["SERVER_PORT"]);
    return $protocol."://".$_SERVER['SERVER_NAME'].$port.$_SERVER['REQUEST_URI'];
}

function strleft($s1, $s2)
{
    return substr($s1, 0, strpos($s1, $s2));
}

//--
//-- format problem code to actual info
function FormatProblemCode($probcode)
{
     if($tableODBC==null)
    {
        $tableODBC = new CSwDbConnection;
        $tableODBC->Connect(swdsn(),swuid(),swpwd());
    }

    //-- execute sql
    $strSQL = "select code,info from pcdesc where code = '" . $probcode . "'";
    $recSet = $tableODBC->Query($strSQL,true);
    if($recSet)
    {
        $strHTML = "";
        while (!$recSet->eof)
        {
            $probinfo =  $recSet->f("info");
            $recSet->movenext();
        }
    }
    return $probinfo;
}

//--
//-- format fixcode to actual info
function FormatResolutionCode($fixcode,$tableODBC=null)
{
    if($tableODBC==null)
    {
        $tableODBC = new CSwDbConnection;
        $tableODBC->Connect(swdsn(),swuid(),swpwd());
    }

    //-- execute sql
    $strSQL = "select code,info from rcdesc where code = '" . $fixcode . "'";
    $recSet = $tableODBC->Query($strSQL,true);
    if($recSet)
    {
        $strHTML = "";
        while (!$recSet->eof)
        {
            $fixinfo =  $recSet->xf("info");
            $recSet->movenext();
        }
    }
    return $fixinfo;
}

//-- helpers
//-- get problem codes and store in session (saves douing a db read each time)
function StoreProblemCodes()
{
    $_SESSION['parentcodes'] = Array();
    $_SESSION['badprobcodes'] = Array();
    $_SESSION['probcodes'] = Array();

    if(!isset($tableODBC))
    {
        $tableODBC = new CSwDbConnection;;
        $tableODBC->Connect(swdsn(),swuid(),swpwd());
    }

    //-- execute sql
    $strSQL = "select code, info from pcdesc order by code asc";
    $recSet = $tableODBC->Query($strSQL,true);
    if($recSet)
    {
        $strHTML = "";
        while (!$recSet->eof)
        {
             
            $probcode =  $recSet->xf("code");
            $probinfo =  $recSet->xf("info");

            if(strpos($probcode,"-")===false)
            {
                $_SESSION['parentcodes'][$probcode] = $probinfo;
            }
            $_SESSION['probcodes'][$probcode] = $probinfo;
            //echo $_SESSION['probcodes'][$probcode].":";
            $recSet->movenext();
        }
    }
    return true;
}

//--
//--
function conv_resolvedcrating($fieldValue)
{
    switch (strToLower($fieldValue))
    {
        case "1":
            $strImage= "<div class='call-pos'></div>";
            break;
        case "0":
            $strImage = "<div ></div>";
            break;
        case "2":
            $strImage = "<div class='call-neu'></div>";

            break;
        case "3":
            $strImage = "<div class='call-neg'></div>";
            break;
    }
    return $strImage;
}

function conv_crating($fieldValue)
{
	if (!isset($strImage)) $strImage="";
    switch (strToLower($fieldValue))
    {
        case "1":
            $strImage= "<div class='call-pos'></div>";
            break;
        case "0":
            $strImage = "<div></div>";
            break;
        case "2":
            $strImage = "<div class='call-neu'></div>";
            break;
        case "3":
            $strImage = "<div class='call-neg'></div>";
            break;
    }
    return $strImage;
}

function cmdb_addci_to_call($ciKey, $intCallref, $strCallclass)
{
    //-- create connection to swdata if we dont have one
    $swDATA = new CSwDbConnection;
    if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
    {
        echo "Failed to create connection to (".swdsn().")";
        exit;
    }

    $strCode = "";
    switch(strtoupper($strCallclass))
    {
        case strtoupper("Incoming"):
            $strCode="INCOMING";
            break;
        case strtoupper("Incident"):
            $strCode="INCIDENT";
            break;
        case strtoupper("Problem"):
            $strCode="PROBLEM-CAUSE";
            break;
        case strtoupper("Known Error"):
            $strCode="PROBLEM-CAUSE";
            break;
        case strtoupper("Change Request"):
            $strCode="RFC-CAUSE";
            break;
        case strtoupper("Release Request"):
            $strCode="REL-CAUSE";
            break;
        case strtoupper("Service Request"):
            $strCode="REQUEST";
            break;
		default:
            $strCode=$strCallclass;
			break;
    }

	//-- check if we have more than one ci to add
	if(strpos($ciKey,",")===false)
	{
	    $strInsert = "insert into cmn_rel_opencall_ci (fk_callref,fk_ci_auto_id,relcode) values (" . $intCallref . "," .$ciKey. ",'" . $strCode . "')";
		$swDATA->Query($strInsert);
	}
	else
	{
		$arrCIKeys = explode(",",$ciKey);
		if($strCode=="REQUEST-COMPONENT")
		{
			$strBaseInsert = "Insert into request_comp (fk_callref,fk_comp_id,name,type,description,qty,comp_price,comp_cost) VALUES (";
			$quantity = 1;
			foreach ($arrCIKeys as $pos => $ciKey)
			{
				$strSelect = "select * from SC_RELS where fk_key = ". $ciKey. " and fk_service = ". gv('opencall_itsm_fk_service');
				$rsComp = $swDATA->Query($strSelect,true);
				$compName = $rsComp->f('service_id');
				$compDescription = $rsComp->f('description');
				$compType = $rsComp->f('apply_type');
				$compQty = $rsComp->f('units');
				$compPrice = $rsComp->f('price');
				$compCost = $rsComp->f('total_cost_for_item');
				$compGLCode = $rsComp->f('gl_code');

				$strInsert = $strBaseInsert .$intCallref.",".$ciKey.",'".PrepareForSql($compName)."','".$compType."','".PrepareForSql($compDescription)."',".$compQty.",'".$compPrice."','".$compCost."','".PrepareForSql($compGLCode)."')";
				$swDATA->Query($strInsert);
			}
		}else
		{
			$arrKeys = explode(",",$strKeys);
			foreach ($arrCIKeys as $pos => $ciKey)
			{
				$strInsert = "insert into cmn_rel_opencall_ci (fk_callref,fk_ci_auto_id,relcode) values (" . $intCallref . "," .$ciKey. ",'" . $strCode . "')";
				$swDATA->Query($strInsert);
			}
		}
	}
}


//--
//-- file helpers


// This function creates the specified directory path using mkdir().
function RecursiveMkdir($path)
{
    if (!file_exists($path))
    {
        echo($path);
        //-- The directory doesn't exist.  Recurse, passing in the parent directory so that it gets created.
        RecursiveMkdir(dirname($path));
        mkdir($path, 0777);
    }
}


//--
//-- Common connect function for connection to dbs
function database_connect($strDSN, $strUID = "", $strPWD = "")
{
	//-- create or share a connection
	$dsnName = strtolower($strDSN);
	if(isset($GLOBALS['activepageconnections'][$dsnName]))
	{
		//-- share conn
		$tableODBC = $GLOBALS['activepageconnections'][$dsnName];
	}
	else
	{
		//-- connect
		$tableODBC = new CSwDbConnection;
		if(strToLower($strDSN)=="swdata")
		{
			//$strDSN = swdsn();
			$strUID=swuid();
			$strPWD=swpwd();
		}
		else if(strToLower($strDSN)=="syscache")
		{
			//$strDSN = "Supportworks Cache";
			$strUID = swcuid();
			$strPWD = swcpwd();
		}

		if($tableODBC->Connect($strDSN,$strUID,$strPWD)==false)
		{
			return false;
		}		

		$GLOBALS['activepageconnections'][$strDSN] = $tableODBC;
	}

    return $tableODBC;
}

//-- return filter based on name and col with encaps
function get_sql_filter($strTable,$strColName,$strColValue,$boolLike = true)
{
    $intType = swdti_getdatatype($strTable.".".$strColName);
    $strEncaps = ($intType==8||$intType==-1)?"'":"";
    if($boolLike)
    {
        if($strEncaps!="")$strColValue = $strColValue . "%";
        $strFilter = "$strColName like ".$strEncaps.PrepareForSql($strColValue).$strEncaps;
    }
    else
    {
        $strFilter = "$strColName = ".$strEncaps.PrepareForSql($strColValue).$strEncaps;
    }

    return $strFilter;
}

//--
//-- common function that will return a database recordset based on a table and a keycol and value
function get_db_record($strDSN, $strTable, $strKeyCol, $strKeyValue , $strUID = "", $strPWD = "", $boolLike = "0")
{
    if($strDSN=="")$strDSN="swdata";

    $tableODBC = database_connect($strDSN, $strUID, $strPWD);
    if($tableODBC==false)
    {
        return "Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.";
    }

    //-- get columns
    $intType = swdti_getdatatype($strTable.".".$strKeyCol);
    $strEncaps = ($intType==8||$intType==-1)?"'":"";

    if($boolLike=="1")
    {
        if($strEncaps!="")$strKeyValue = $strKeyValue . "%";
        $strSQL = "select * from $strTable where $strKeyCol like ".$strEncaps.PrepareForSql($strKeyValue).$strEncaps;
    }
    else
    {
        $strSQL = "select * from $strTable where $strKeyCol = ".$strEncaps.PrepareForSql($strKeyValue).$strEncaps;
    }

    $recSet = $tableODBC->Query($strSQL,true);
    if(!$recSet)
    {
       // return "Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator\n\n" . $strSQL . "";

		//-- nwj 28.11.2008 - remove message that shows sql query as may be security risk.
		$strHTML = "<center>Could not run SQL query required for this record. Please contact your Supportworks administrator<br></center>";
		//$strHTML = "<center>Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator<br><br>" . $strSQL . "</center>";
		if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
		{
			$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
		}
		return $strHTML;
    }

    return $recSet;
}

//--
//-- common function that will return a database recordset based on select
function get_db_recordset($strDSN, $strSelect , $strUID = "", $strPWD = "")
{
    if($strDSN=="")$strDSN="swdata";

    $tableODBC = database_connect($strDSN, $strUID, $strPWD);
    if($tableODBC==false)
    {
        return "Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.";
    }

    //-- get recset
    $recSet = $tableODBC->Query($strSelect,true);
    if(!$recSet)
    {
        //return "Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator\n\n" . $strSelect . "";
		//-- nwj 28.11.2008 - remove message that shows sql query as may be security risk.
		$strHTML = "<center>Could not run SQL query required for this recordset. Please contact your Supportworks administrator<br></center>";
		//$strHTML = "<center>Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator<br><br>" . $strSQL . "</center>";
		if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
		{
			$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
		}
		return $strHTML;
    }

    return $recSet;
}

//--
//-- common function that will return a database recordset based on a table and a keycol and value
function get_dbpicklist_options($strDSN, $strTable, $strKeyCol, $strTextCol , $strFilter = "", $strUID = "", $strPWD = "",$boolXML = false)
{
    if($strDSN=="")$strDSN="swdata";
    if($strUID=="")$strUID=swuid();
    if($strPWD=="")$strPWD=swpwd();

    //-- connect
    $tableODBC = database_connect($strDSN, $strUID, $strPWD);
    if($tableODBC==false)
    {
        return "ERROR:Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.";
    }

    //-- create sql
    $strSQL = "select $strKeyCol as keycol, $strTextCol as txtcol from $strTable";
    if($strFilter!="")$strSQL .= " where " . $strFilter;

    //echo $strSQL;
    $recSet = $tableODBC->Query($strSQL,true);
    if(!$recSet)
    {
     //   return "ERROR:Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator\n\n" . $strSQL . "";
		//-- nwj 28.11.2008 - remove message that shows sql query as may be security risk.
		$strHTML = "<center>Could not run SQL query required for this picklist. Please contact your Supportworks administrator<br></center>";
		//$strHTML = "<center>Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator<br><br>" . $strSQL . "</center>";
		if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
		{
			$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
		}
		return $strHTML;
    }

    //-- construct options
    $strOptions = "";
    while(!$recSet->eof)
    {
		if($boolXML)
			$strOptions .= "<option value='"._pfx($recSet->f('keycol'))."'>"._pfx($recSet->f('txtcol'))."</option>";
		else
			$strOptions .= "<option value='".$recSet->xf('keycol')."'>".$recSet->xf('txtcol')."</option>";
        $recSet->movenext();
    }

    return 	$strOptions;
}

function get_php_formxml($strName, $strType = "standard")
{
    $oXML = false;
    $strFileName = $GLOBALS['instance_path']."xml/forms/".$strType."/".$strName.".xml";
    $oXML = load_xml($strFileName);
    return $oXML;
}


function initialise_php_form($strName, $strType = "standard", $varKeyValue)
{
    $oForm = false;
    $oXML = get_php_formxml($strName, $strType);
    if($oXML!=false)
    {
        $oForm = new swForm($oXML,$varKeyValue);
    }
    return $oForm;
}


function load_xml($filePath)
{
    $root = false;
    $xmlfile = load_file($filePath);
    if($xmlfile!="")
    {
        $xmlDoc = domxml_open_mem($xmlfile);
        if(is_object($xmlDoc))$root = $xmlDoc->document_element();
    }
    return $root;
}


//-- get date string
function date_string()
{
    //--
    //-- 1. Get todays Day, Month and Year based on server time
    $today = getdate();
    $cal_day = $today['mday'];
    $cal_weekday = $today['weekday'];
    $cal_month = $today['month'];
    $cal_year = $today['year'];
    $cal_thrdst = get_date_dayformat($cal_day);

    return $cal_weekday . ", " . $cal_month . " " . $cal_day . "" . $cal_thrdst . " " .$cal_year;
}

//--
//-- Get the th / rd / st of the day of the month i.e. 23rd , 1st, 4th
function get_date_dayformat($my_date)
{
	//-- 15.02.2008 - nwj - bug ref 66235  
	if($my_date==1)return "st";

    //-- get last digit
    $last_digit= $my_date % 10;
    $first_digit = substr($my_date,0,1);

    $format;
    if($last_digit==1)
    {
        $format=($first_digit==1)?"th":"st";
    }
    else if($last_digit==2)
    {
        $format=($first_digit==1)?"th":"nd";
    }
    else if($last_digit==3)
    {
        $format=($first_digit==1)?"th":"rd";
    }
    else
    {
        $format="th";
    }
    return $format;
}


//--
//-- get a var value - check post/get and globals
function gvs($strVarName, $boolForVarCheck = false)
{
	//echo $strVarName . ":" . $_GET[$strVarName] .":</br>";
    if(isset($_GET[$strVarName])) return $_GET[$strVarName];
    if(isset($_POST[$strVarName])) return $_POST[$strVarName];
	if(isset($HTTP_GET_VARS[$strVarName])) return $HTTP_GET_VARS[$strVarName];
	if(isset($GLOBALS[$strVarName])) return $GLOBALS[$strVarName];

	if($boolForVarCheck)
	{
		return "variablenotset";
	}
    return "";
}

//--
//-- prepare a string for xml
/*function pfx($strValue)
{
    $xmlchars = array("&", "<", ">","'",'"');
    $escapechars = array("&amp;", "&lt;", "&gt;","&#39;","&quot;");
    return str_replace($xmlchars, $escapechars, $strValue);
}*/

//-- get server currency setting and optionally encrypt for use in fusioncharts
function get_server_currency_symbol()
{
	$unencsymbol = sw_getcfgstringxpath("ServerRegionalSettings/CurrencySymbol@value");
	$encsymbol = "";

	//-- Check for symbols that need to be encoded for fusioncharts for encoding refs see function EscapeAllSpecialCharacters
	//-- detailed at http://www.fusioncharts.com/FileMaker/Docs/Contents/FCLibScripts.html#EscapeAllSpecialCharacters
	switch($unencsymbol)
	{
		case "�":
		case "%a3":
			$encsymbol = "&#163;";
			break;
		case "�":
			$encsymbol = "&#165;";
			break;
		case "�":
			$encsymbol = "&#128;";
			break;
		default:
			return $unencsymbol;
	}

	return html_entity_decode($encsymbol,null,'UTF-8');
}

//-- get a sla name
function get_sla_ola_name($pk_id, $flg_sla = true)
{
	$strTable = "itsmsp_slad";
	$strColumn = "slad_id";
	$strKeyCol = "pk_slad_id";

    if($tableODBC==null)
    {
        $tableODBC = new CSwDbConnection;
        $tableODBC->Connect(swdsn(),swuid(),swpwd());
    }

	if(!$flg_sla)
	{
		$strTable = "itsmsp_slad_ola";
		$strColumn = "slad_ola";
		$strKeyCol = "pk_ola_id";
	}
    //-- execute sql
    $strSQL = "select * from ".$strTable." where ".$strKeyCol." = " . $pk_id;
    $recSet = $tableODBC->Query($strSQL,true);
    if($recSet)
    {
        if (!$recSet->eof)
        {
            $strResult =  $recSet->xf($strColumn);
			return $strResult;
        }
    }
    return $pk_id;
}

//-- SW Implementation of session_regenerate_id() which is not available until PHP 4.3.2
function swphp_session_regenerate_id() 
{
    $random = generate_secure_key();
	// use md5 value for id or remove capitals from string $randval
	// $random = md5($random);
	if (session_id($random)) {
		return true;
	} else {
		return false;
	}
}

//-- F0100087 - generate a random key
function generate_secure_key($prefix = "", $intKeyLenth = 32) 
{
    $strLegalCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $strRandomKey = "";
    for ($i = 1; $i <= $intKeyLenth; $i++) {
        $strRandomKey .= substr($strLegalCharacters, mt_rand(0,(strlen($strLegalCharacters) - 1)), 1);
    }
	return $strRandomKey;
}

//-- F0100087 - check request key vs value in session
function check_secure_key($strKeyIdentifier = "")
{
	$boolValid = true;
	if($strKeyIdentifier=="")
		return $boolValid;

	$strRequestKey = "";
	$strSessionKey = "";

	//-- do not use gvs
    if(isset($_GET[$strKeyIdentifier])) $strRequestKey =  $_GET[$strKeyIdentifier];
    elseif(isset($_POST[$strKeyIdentifier])) $strRequestKey =  $_POST[$strKeyIdentifier];
	elseif(isset($HTTP_GET_VARS[$strKeyIdentifier])) $strRequestKey =  $HTTP_GET_VARS[$strKeyIdentifier];

	$strSessionKey = $_SESSION[$strKeyIdentifier];

	if($strSessionKey !== $strRequestKey)
		$boolValid = false;
	return $boolValid;
}

function regex_match($strPattern = "", $strMatch = "")
{
	if($strPattern=="" || $strMatch == "")
		return false;
	$boolMatch = preg_match($strPattern,$strMatch);
	return $boolMatch=="1";
}

function ComCtrl32Format_To_JsFormat($strComCtrl32Format)
{
	$arComCtrl32Formats = array(
		"yyyy", "yy",			
		"MMMM", "MMM", "MM", "M",
		"dddd", "ddd", "dd", "d",
		"HH", "H", "hh", "h", 
		"mm", "m",
		"ss", "s",
		"tt", "t"
		);
	$arJsFormats = array(
		"@111@", "@222@", 
		"@333@", "@444@", "@555@", "@666@",	
		"@777@", "@888@", "@999@", "@101010@"
		);

	$res = str_replace($arComCtrl32Formats, $arJsFormats, $strComCtrl32Format);

	// Replace the temporary strings ...
	$arComCtrl32Formats = array("@111@", "@222@", "@333@", "@444@", "@555@", "@666@", "@777@", "@888@", "@999@", "@101010@");
	$arJsFormats = array(
		"yy", "y",
		"MM", "M", "mm", "m", 
		"DD", "D", "dd", "d");

	return str_replace($arComCtrl32Formats, $arJsFormats, $res);
}

?>