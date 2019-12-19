<?php
error_reporting(E_ERROR | E_PARSE );
set_error_handler("itsmf_error_handling");

/*function itsmf_error_handling($intErrorNo, $strError, $strErrorFile, $strErrorLine)
{
	$errorlevel=error_reporting();
	if($intErrorNo & $errorlevel)
		echo "An unexpected error has occured. Please contact your Supportworks Administrator.<br>";
}*/

//require_once("domxml-php4-to-php5.php");
//-- common functions used through web apps
@define('APPCODE',"ITSMF"); //-- application code
@define('ANSWER_SPLIT',"[|]");

include_once('bitflags.php');
//-- standard and class includes
include_once('stdinclude.php');						//-- standard functions
include_once('swformattimeintext.php');				//-- date formatting functions
include_once('classhdsession.php');			//-- class to handle call activaty (log / update etc)
include_once('classwssmactions.php');			//-- class to handle call activaty (log / update etc)
include_once('classtabcontrol.php');			//-- class to control drawing out of tab controls
include_once('classdatatable.php');			//-- class to control drawing out of data tables
include_once('classdatabaseaccess.php');		//-- data base access class
include_once("helpers/tree.data.php");		//-- functions to load and output tree data
include_once('classanalystsession.php');     //--  class to handle analyst session info
include_once('classpicklist.php');			 //-- class to handle creation of table record picklist
//-- Use swDecorder to decode URL
$_REQUEST['ied'] = gv('ied');
include_once('swdecoder.php');			 //-- class to handle creation of table record picklist

//$Secure = new Aes();

//-- function helpers
include_once("helpers/servicetype.functions.php");

//-- include file to check session is valid
include_once('sessioncheck.php');

error_reporting(E_ERROR | E_PARSE );

//-- month array
$arrMonth[1] = "Janury";$arrMonth[2] = "February";$arrMonth[3] = "March";$arrMonth[4] = "April";$arrMonth[5] = "May";$arrMonth[6] = "June";
$arrMonth[7] = "July";$arrMonth[8] = "August";$arrMonth[9] = "September";$arrMonth[10] = "October";$arrMonth[11] = "November";$arrMonth[12] = "December";


//-- define bit flags - can be used to check permission settings i.e. webflag and analyst permissions


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


//-- check passed in vars to make sure they are valid
check_variable_quality();


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
function check_variable_quality()
{
    $strFileName = $GLOBALS['instance_path']."xml/variablechecks.xml";
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
            return $oTableControl->output_data_table($orderBy,$sortDir);
        }
    }
    else
    {
        return "Error : The table data ($strTableName) could not be loaded";
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
    foreach($att as $attkey => $anAttribute)
    {
        if($anAttribute->name()==$name)return $anAttribute->value();
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


//--
//-- FAT CLIENT ONLY
//-- format column name based on field binding table.col
//-- to be used in fat client php pages
function cmn_fcvformat($strValue, $strBinding,$strAlinkDisplayValue = "")
{

    $returnValue = $strValue;
    $strDisplayName = swdti_getcoldispname($strBinding);
	if($strAlinkDisplayValue=="")$strAlinkDisplayValue=htmlentities($strValue,ENT_QUOTES,'UTF-8');
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
                $returnValue = "<a href=\"hsl:tapidial?number=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
            }


            break;
        case "opencall.status":
            $returnValue = swdti_formatvalue("opencall.status",$strValue);

        case "opencall.callref":
            $intCallref = $strValue;
            if(gv('phpprintmode')=="1")
            {
                $returnValue = swcallref_str($intCallref);
            }
            else
            {
                $returnValue = "<a href=\"hsl:calldetails?callref=".htmlentities(urlencode($intCallref),ENT_QUOTES,'UTF-8')."\">".swcallref_str($intCallref)."</a>";
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
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=site&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swsite.php?site_name=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
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
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=costcent&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swcostcent.php?costcenter=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
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
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=userdb&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swcust.php?keysearch=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
                }

            }
            break;
        case "opencall.fk_company_id":
        case "equipmnt.fk_company_id":
        case "userdb.fk_company_id":
            if(gv('phpprintmode')=="1")
            {
                $returnValue = $strValue;
            }
            else
            {
                if(gv('boolUseFormsInActivePageLinks'))
                {
                    //-- open form
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=company&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"sworg.php?pk_company_id=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
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
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=equipmnt&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swasset.php?equipid=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
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
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=manufact&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swmanufact.php?comp_name=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
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
                    $returnValue = "<a href=\"hsl:editrecord?formmode=edit&table=supplier&key=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."\">".$strAlinkDisplayValue."</a>";
                }
                else
                {
                    //-- open url
                    $returnValue = "<a href=\"swsupplier.php?company_id=".htmlentities(urlencode($strValue),ENT_QUOTES,'UTF-8')."&ColourScheme=".$_GET['ColourScheme']."\">".$strAlinkDisplayValue."</a>";
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

		//-- added in itsm 2.4.0 for fat client reports
        case "hhmmss":
			$fieldValue = $fieldValue/60;
			if($fieldValue>59)
			{
				$fieldValue = floor($fieldValue/60).'hrs '.$fieldValue%60;
			}
			return $fieldValue.'min';
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
		case "dayssince":
			 $fieldValue = floor(((time()-$fieldValue)/60)/60/24);
			// round();
			return $fieldValue;
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
					$ColourScheme=$_GET['ColourScheme']; //ES 27/02/2013 - added ColourScheme to link below
                    return "<a href='swasset.php?equipid=".$fieldValue."&ColourScheme=".$ColourScheme."'>".$fieldValue."</a>";
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
					$ColourScheme = $_GET['ColourScheme'];
                    return "<a href='swmanufact.php?comp_name=".$fieldValue."&ColourScheme=".$ColourScheme."'>".$fieldValue."</a>";
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
					$ColourScheme=$_GET['ColourScheme']; //ES 27/02/2013 - added ColourScheme to link below
                    return "<a href='swcall.php?callref=".$intCallref."&ColourScheme=".$ColourScheme."'>".swcallref_str($intCallref)."</a>";
                }
                return $fieldValue;
            }
            else
            {
                return swcallref_str($fieldValue);
            }
            break;


		case "issuestatus":
            return  swdti_formatvalue("swissues.status",$fieldValue);
            break;

			//-- format callstatus
        case "callstatus":
            return  swdti_formatvalue("opencall.status",$fieldValue);
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

        default:
            return $fieldValue;
            break;
    }
}

//--
//-- format call status based on current diary
function fmt_callstatus($varValue)
{
    return swdti_formatvalue("opencall.status",$varValue);
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
            $strImage= "<p class='cmdb-active'></p>";
            break;
        case "faulty":
        case "impacted":
            $strImage = "<p class='cmdb-faulty'></p>";
            break;
        case "unavailable":
            $strImage = "<p class='cmdb-unavail'></p>";
            break;
    }
    return $strImage;
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
            $fixinfo =  $recSet->f("info");
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
             
            $probcode =  $recSet->f("code");
            $probinfo =  $recSet->f("info");

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
    }
    $strInsert = "insert into cmn_rel_opencall_ci (fk_callref,fk_ci_auto_id,relcode) values (" . $intCallref . "," .$ciKey. ",'" . $strCode . "')";
    $swDATA->Query($strInsert);
}


//--
//-- file helpers


// This function creates the specified directory path using mkdir().
function RecursiveMkdir($path)
{
	if (!file_exists($path)&&$path!="")
    {
        //-- The directory doesn't exist.  Recurse, passing in the parent directory so that it gets created.
        RecursiveMkdir(dirname($path));
        mkdir($path, 0777);
    }
}


//--
//-- Common connect function for connection to dbs
function database_connect($strDSN, $strUID = "", $strPWD = "")
{
    //-- connect
    $tableODBC = new CSwDbConnection;
    if(strToLower($strDSN)=="swdata")
    {
        $strDSN = swdsn();
        $strUID=swuid();
        $strPWD=swpwd();
    }
    else if(strToLower($strDSN)=="syscache")
    {
       // $strDSN = "Supportworks Cache";
        $strUID = swcuid();
        $strPWD = swcpwd();
    }

    if($tableODBC->Connect($strDSN,$strUID,$strPWD)==false)
    {
        return false;
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
        return "Could not connect to the DSN [".htmlentities($strDSN,ENT_QUOTES,'UTF-8')."]. Please contact your Supportworks administrator.";
    }

    //-- get columns
    $intType = swdti_getdatatype($strTable.".".$strKeyCol);
    $strEncaps = ($intType==8||$intType==-1)?"'":"";

    if($boolLike=="1")
    {
        if($strEncaps!="")$strKeyValue = $strKeyValue . "";
        $strSQL = "select * from $strTable where $strKeyCol like ".$strEncaps.PrepareForSql($strKeyValue).$strEncaps;
    }
    else
    {
        $strSQL = "select * from $strTable where $strKeyCol = ".$strEncaps.PrepareForSql($strKeyValue).$strEncaps;
    }

    $recSet = $tableODBC->Query($strSQL,true);
    if(!$recSet)
    {
        return "Could not run SQL query on DSN [".htmlentities($strDSN,ENT_QUOTES,'UTF-8')."]. Please contact your Supportworks administrator\n\n" . $strSQL . "";
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
        return "Could not connect to the DSN [".htmlentities($strDSN,ENT_QUOTES,'UTF-8')."]. Please contact your Supportworks administrator.";
    }

    //-- get recset
    $recSet = $tableODBC->Query($strSelect,true);
    if(!$recSet)
    {
        return "Could not run SQL query on DSN [".htmlentities($strDSN,ENT_QUOTES,'UTF-8')."]. Please contact your Supportworks administrator\n\n" . $strSelect . "";
    }

    return $recSet;
}

//--
//-- common function that will return a database recordset based on a table and a keycol and value
function get_dbpicklist_options($strDSN, $strTable, $strKeyCol, $strTextCol , $strFilter = "", $strUID = "", $strPWD = "",$boolXML = false)
{
    if($strDSN=="")$strDSN="swdata";

    //-- connect
    $tableODBC = database_connect($strDSN, $strUID, $strPWD);
    if($tableODBC==false)
    {
        return "ERROR:Could not connect to the DSN [".htmlentities($strDSN,ENT_QUOTES,'UTF-8')."]. Please contact your Supportworks administrator.";
    }

    //-- create sql
    $strSQL = "select distinct $strKeyCol as keycol, $strTextCol as txtcol from $strTable";
    if($strFilter!="")$strSQL .= " where " . $strFilter;

    //echo $strSQL;
    $recSet = $tableODBC->Query($strSQL,true);
    if(!$recSet)
    {
        return "ERROR:Could not run SQL query on DSN [".htmlentities($strDSN,ENT_QUOTES,'UTF-8')."]. Please contact your Supportworks administrator\n\n" . $strSQL . "";
    }

    //-- construct options
    $strOptions = "";
    while(!$recSet->eof)
    {
		if($boolXML)
			$strOptions .= "<option value='".pfx($recSet->f('keycol'))."'>".pfx($recSet->f('txtcol'))."</option>";
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
    //-- get last digit
    $last_digit= $my_date % 10;
    $first_digit = substr($my_date,0,1);

    $format;
    if($last_digit==1)
    {
        if(strlen($my_date)==1)
		{
			$format="st";
		}
		else
		{
			$format=($first_digit==1)?"th":"st";
		}
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
function gvs($strVarName, $boolCheckifSet = false)
{
    if(isset($_POST[$strVarName])) return $_POST[$strVarName];
    if(isset($_GET[$strVarName])) return $_GET[$strVarName];
    if(isset($HTTP_GET_VARS[$strVarName])) return $HTTP_GET_VARS[$strVarName];
    if(isset($GLOBALS[$strVarName])) return $GLOBALS[$strVarName];

	//-- inform caller that var was not set
	if($boolCheckifSet) 
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

//-- SW Implementation of session_regenerate_id() which is not available until PHP 4.3.2
function swphp_session_regenerate_id() 
{
    $randlen = 32;
    $randval = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $random = "";
    for ($i = 1; $i <= $randlen; $i++) {
        $random .= substr($randval, rand(0,(strlen($randval) - 1)), 1);
    }
		// use md5 value for id or remove capitals from string $randval
		// $random = md5($random);
		if (session_id($random)) {
			return true;
		} else {
			return false;
		}
}

function generate_secure_key($prefix = "", $intKeyLenth = 32) 
{
    $strLegalCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $strRandomKey = "";
    for ($i = 1; $i <= $intKeyLenth; $i++) {
        $strRandomKey .= substr($strLegalCharacters, mt_rand(0,(strlen($strLegalCharacters) - 1)), 1);
    }
	return $strRandomKey;
}

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

?>