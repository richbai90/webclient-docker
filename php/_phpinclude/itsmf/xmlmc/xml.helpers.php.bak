<?php 
//@include_once('session.php');

if (!function_exists("swxml_childnodes"))
{

	function swxml_childnodes($oXML,$strChildNodeName = "")
	{
		$array_nodes = Array();

		if(!isset($oXML)) return $array_nodes;

		$childnodes = $oXML->child_nodes();
		foreach ($childnodes as $aNode)
		{
			if(($strChildNodeName=="")&&($aNode->tagname!=""))
			{
				//-- get any nodes so long as they have a tagname
				$array_nodes[sizeOf($array_nodes)+1]=$aNode;
			}
			else if ((strToLower($aNode->tagname)==strToLower($strChildNodeName))&&($strChildNodeName!=""))
			{
				//-- get any nodes that match
				$array_nodes[sizeOf($array_nodes)+1]=$aNode;
			}
		}

		return $array_nodes;
	}

	function swxml_childnode($oXML,$strChildNodeName,$intChildPos = 0)
	{
		if(!isset($oXML)) return null;

		$intcount=0;
		$childnodes = $oXML->child_nodes();
		foreach ($childnodes as $aNode)
		{
			//echo $aNode->tagname."==".$strChildNodeName; 
			if (strToLower($aNode->tagname)==strToLower($strChildNodeName))
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

	function swxml_childnode_byatt($oXML,$strChildNodeTagName,$strAttName, $strAttValue)
	{
		if(!isset($oXML)) return null;

		$intcount=0;
		$childnodes = $oXML->child_nodes();
		foreach ($childnodes as $aNode)
		{
			if (strToLower($aNode->tagname)==strToLower($strChildNodeTagName))
			{
				if($aNode->get_attribute($strAttName) == $strAttValue)
				{
					return $aNode;
				}
			}
		}
		return null;
	}


	function swxml_parent_by_childnode_content($oXML,$strChildNodeTagName,$strContent,$strParentNodeName = "")
	{
		if(!isset($oXML)) return null;
	

		$intcount=0;
		$childnodes = $oXML->get_elements_by_tagname($strChildNodeTagName);
		foreach ($childnodes as $aNode)
		{
			if (strToLower($aNode->get_content())==strToLower($strContent))
			{
				$aP = $aNode->parent_node();
				if( ($strParentNodeName!="") && ( strToLower($strParentNodeName)!=strToLower($aP->tagname) ) )
				{
					continue;
				}
				return $aP;
			
			}
		}
		return null;
	}

	function swxml_childnode_by_content($oXML,$strChildNodeTagName,$strContent,$strParentNodeName = "")
	{
		if(!isset($oXML)) return null;
	

		$intcount=0;
		$childnodes = $oXML->get_elements_by_tagname($strChildNodeTagName);
		foreach ($childnodes as $aNode)
		{
			if (strToLower($aNode->get_content())==strToLower($strContent))
			{
				$aP = $aNode->parent_node();
				if( ($strParentNodeName!="") && ( strToLower($strParentNodeName)!=strToLower($aP->tagname) ) )
				{
					continue;
				}
				return $aNode;
			
			}
		}
		return null;
	}


	function swxml_childnode_content($oXML,$strChildNodeName,$intChildPos = 0)
	{
		if(!isset($oXML)) return "";

		$childNode = swxml_childnode($oXML,$strChildNodeName,$intChildPos);
		if($childNode!=null)
		{
			return $childNode->get_content();
		}
		return "";
	}

	function swxml_gparams_value($oParamsParentXML, $strParamName)
	{
		if(!isset($oParamsParentXML)) return "";

		$xmlParams = swxml_childnode($oParamsParentXML,"params");
		$xmlParams = swxml_childnodes($xmlParams,"param");
		foreach($xmlParams as $aParam)
		{
			$strCurrParamName = swxml_childnode_content($aParam,"name");
			if(strToLower($strCurrParamName)==strToLower($strParamName))
			{
				return swxml_childnode_content($aParam,"value");
			}
		}
		return "";
	}


	//--  we expect node with children of <swsql> , <mssql> , <tsql>
	//-- depending on database type we return sql from correct node
	//-- dbtype should be sql, tsql, mssql
	function get_xmldb_sql($sqlXML,$dbtype)
	{
		if($sqlXML=="") return $sqlXML;
		$strDatabaseSQL =swxml_childnode_content($sqlXML,$dbtype);
		if($strDatabaseSQL=="")$strDatabaseSQL = swxml_childnode_content($sqlXML,"swsql");

		return $strDatabaseSQL;
	}


	function swxml_view($xmlDoc, $strViewName)
	{
		$arrNodes = $xmlDoc->child_nodes();
		$arrNodes =$arrNodes[0]->child_nodes();
		foreach($arrNodes as $aFolder)
		{
			$strName = swxml_childnode_content($aFolder,"name");
			if(strToLower($strName)=="views")
			{
				$arrViewNodes =$aFolder->child_nodes();
				foreach($arrViewNodes as $aView)
				{
					$strName = swxml_childnode_content($aView,"name");
					$strName = str_replace(" ","_",$strName);
					if(strToLower($strName)==strToLower($strViewName))
					{
						//-- got helpdesk view
						return $aView;
					}
				}
			}
		}
		return null;

	}

	//-- get helpdesk xml node (top or bottom) given global params xml
	function swxml_helpdesk_view($xmlDoc, $strControlName, $strPos = "top" , $strTableName = "")
	{

		//-- get helpdesk view
		$xmlView = swxml_view($xmlDoc, $strControlName);
		$xmlHelpdeskItems = null;
		$xmlHelpdesk = null;
		$arrChildNodes =$xmlView->child_nodes();
		foreach($arrChildNodes as $aChild)
		{
			$strName = swxml_childnode_content($aChild,"name");
			if(strToLower($strName)==$strPos)
			{
				$xmlHelpdeskItems = $aChild->get_elements_by_tagname("folder");
				break;
			}
		}


		if($xmlHelpdeskItems!= null && $strTableName!="")
		{
			foreach($xmlHelpdeskItems as $aFolder)
			{
				$strName = swxml_childnode_content($aFolder,"name");
				if(strToLower($strName)==strToLower($strTableName))
				{
					return $aFolder;
				}
			}

			return swxml_childnode_by_content($xmlHelpdeskItems,"name", $strTableName,"folder");
		}
		else
		{
			return $xmlHelpdeskItems;
		}
	}


	function swxml_helpdesk_table($strControlName, $xmlHelpdeskTab,$strParentControlName,$strPos = "top")
	{
		$strApplyContext = (string)swxml_gparams_value($xmlHelpdeskTab,"ApplyContextFilter");
		$strFilter = swxml_gparams_value($xmlHelpdeskTab,"Filter");

		$strTableColumns = swxml_gparams_value($xmlHelpdeskTab,"AvailableColumns");
		if($strTableColumns=="")
		{
			$strTableColumns= swxml_gparams_value($xmlHelpdeskTab,"VisibleColumns");
		}

		$strKeyCol = "callref";
		$strType = swxml_gparams_value($xmlHelpdeskTab,"Type");
		switch(strToLower($strType))
		{
			case "watchedcallslist":
				$strKeyCol = "opencall.callref";
				$strTable="watchcalls";
				if($strTableColumns =="")$strTableColumns = "opencall.callref, opencall.callclass, opencall.status, opencall.priority, opencall.companyname, opencall.site, opencall.cust_id, opencall.cust_name, opencall.suppgroup, opencall.owner, opencall.h_condition, opencall.escalation";
				break;
			case "calllist":
				$strKeyCol = "opencall.callref";
				$strTable="opencall";
				break;
			case "issueslist":
				$strKeyCol = "issueref";
				if($strTableColumns =="")$strTableColumns = "issueref,status,issuetype,affectedusers,description,starttimex,resolvebyx";
				$strTable="swissues";
				break;
			case "tasklist":
				$strKeyCol = "taskid";
				$strTable="calltasks";
				break;
		}

		$xmlFilter = swxml_parent_by_childnode_content($xmlHelpdeskTab,"name","Filters","folder");
		if($xmlFilter!=null)
		{
			$xmlParams = swxml_childnode($xmlFilter,"params");
			$arrFilterNodes =$xmlParams->child_nodes();//("param");
			foreach($arrFilterNodes as $aParam)
			{
				$strName = swxml_childnode_content($aParam,"name");
				$strValue = swxml_childnode_content($aParam,"value");
				$arrFilters[$strName] = $strValue;
			}			
		}
			//echo "a".$strTable."b";
		return swxml_table_xmldom($strTable, $strKeyCol, $strTableColumns,$arrFilters,"","","","",$strParentControlName, $strApplyContext,$strFilter);
	}

	function swxml_sfc_table($xmlView,$strControlName)
	{
			$strXML ="<espTable>";
			$strXML .="<table>".swxml_gparams_value($xmlView,"TableName")."</table>";
			$strXML .="<keycolumn>callref</keycolumn>";
			$strXML .="<contextfilteron>no</contextfilteron>";
			$strXML .="<outlookcontrolid></outlookcontrolid>";
			$strXML .="<ondataloadedjs></ondataloadedjs>";
			$strXML .="<filter>".pfx(swxml_gparams_value($xmlView,"Filter"))."</filter>";
			$strXML .="	<datatable>";
			$strXML .="		<header>".swxml_gparams_value($xmlView,"ResultColumns")."</header>";
			$strXML .="		<columnwidth></columnwidth>";
			$strXML .="		<columnalignment></columnalignment>";		
			$strXML .="	</datatable>";
			$strXML .="	<sqlparams>";
			$strXML .="		<status in='1'/>";
			$strXML .="		<logdatex daterange='1'/>";
			$strXML .="		<closedatex daterange='1'/>";
			$strXML .="		<probcode pfs='1'/>";
			$strXML .="</sqlparams>";
			$strXML .="</espTable>";

			return domxml_open_mem($strXML);
	}


	function swxml_sfc_to_mes_table($xmlView,$strControlName)
	{
			$strXML ="<espTable>";
			$strXML .="<table>".swxml_gparams_value($xmlView,"TableName")."</table>";
			$strXML .="<keycolumn>callref</keycolumn>";
			$strXML .="<contextfilteron>no</contextfilteron>";
			$strXML .="<outlookcontrolid></outlookcontrolid>";
			$strXML .="<ondataloadedjs></ondataloadedjs>";
			$strXML .="<filter>".pfx(swxml_gparams_value($xmlView,"Filter"))."</filter>";
			$strXML .="	<datatable>";
			$strXML .="		<header>".swxml_gparams_value($xmlView,"ResultColumns")."</header>";
			$strXML .="		<columnwidth></columnwidth>";
			$strXML .="		<columnalignment></columnalignment>";		
			$strXML .="	</datatable>";
			$strXML .="</espTable>";

			return domxml_open_mem($strXML);
	}


	function swxml_table_xmldom($strTable, $strKeyCol, $strTableColumns,$arrFilters = Array(),$strTableColumnWidths ="", $strTableColumnAlignments="",$strContextMenuXML="", $ondataloadedjs ="" , $outlookcontrolid = "", $strApplyContext = "Yes", $strFilter= "")
	{
			//$strBoolContext = (strToLower($strApplyContext)=="yes")?"true":"false";
			//echo $strFilter;
		
			$strXML ="<espTable>";
			$strXML .="<table>".$strTable."</table>";
			$strXML .="<keycolumn>".$strKeyCol."</keycolumn>";
			$strXML .="<contextfilteron>".$strApplyContext."</contextfilteron>";
			$strXML .="<outlookcontrolid>".$outlookcontrolid."</outlookcontrolid>";
			$strXML .="<ondataloadedjs>".$ondataloadedjs."</ondataloadedjs>";
			$strXML .="<filter>".pfx($strFilter)."</filter>";

			if($strContextMenuXML !="")	$strXML .="	<contextmenu>".$strContextMenuXML."</contextmenu>";

			$strXML .="	<datatable>";
			$strXML .="		<header>".$strTableColumns."</header>";
			$strXML .="		<columnwidth>".$strTableColumnWidths."</columnwidth>";
			$strXML .="		<columnalignment>".$strTableColumnAlignments."</columnalignment>";
			
			//-- get filters xml
			$strXML .= _swc_table_filters_xmlstr($arrFilters);

			

			$strXML .="	</datatable>";
			$strXML .="</espTable>";

			return domxml_open_mem($strXML);
	}

	function _swc_table_filters_xmlstr($arrFilters = Array())
	{
		if(count($arrFilters)==0) return "";
		$strXML = "<iafilter><label>Filter :</label><listitems>";
		foreach($arrFilters as $strName => $strValue)
		{
			$strXML .= "<listitem><label>".pfx($strName)."</label><applyfilter>".pfx($strValue)."</applyfilter></listitem>";			
		}
		$strXML .= "</listitems></iafilter>";
		return $strXML;

	}
	function sw_file_put_contents($strFilepath,$strContent)
{
	$fp = fopen($strFilepath, 'w');
	fwrite($fp,$strContent);
	fclose($fp);
}

function xmlreplace_content( &$node, $new_content )
{
    $dom = $node->owner_document();
    $kids = $node->child_nodes();
    foreach ( $kids as $kid )
        if ( $kid->node_type() == XML_TEXT_NODE )
            $node->remove_child ($kid);
    $node->set_content($new_content);
} 

function xmladd_newnode(&$parentNode,$strNodeName,$new_content)
{
    $dom = $parentNode->owner_document();
	$node = $dom->create_element($strNodeName);
	$newnode = $parentNode->append_child($node);
	$newnode->set_content($new_content);
}

function SureRemoveDir($dir, $DeleteMe) {
    if(!$dh = @opendir($dir)) return;
    while (false !== ($obj = readdir($dh))) {
        if($obj=='.' || $obj=='..') continue;
        if (!@unlink($dir.'/'.$obj)) SureRemoveDir($dir.'/'.$obj, true);
    }

    closedir($dh);
    if ($DeleteMe){
        @rmdir($dir);
    }
}


function xml2json($xml)
{
	return __xml2array($xml);
}

//-- Changes XML DOM to JSON
function __xml2array($xml,$boolIsArray=false) 
{	
	$obj = "";
	if ($xml->node_type() == XML_ELEMENT_NODE) 
	{ 
			//-- Create the return object
			if(!$boolIsArray)$obj .= $xml->node_name();
			
			$strAtts = "";
			//-- element
			//-- do attributes
			if ($xml->has_attributes()) 
			{
				$xmlAttributes = $xml->attributes();
				foreach($xmlAttributes as $i)
				{
					if($strAtts!="")$strAtts.=',';
					$strAtts.= '@'.$i->name(). ':"'. $i->value().'"';
				}	
			}

			//-- do children
			$boolArray=false;
			$i=0;
			$strArrayName = "";
			if ($xml->has_child_nodes()) 
			{
				$strChildren = "";
				$xmlChildNodes = $xml->child_nodes();
				$cCount = sizeOf($xmlChildNodes);
				for($x=0;$x<$cCount;$x++)
				{
					$item = $xmlChildNodes[$x];
					if($item->node_name()=="#text")
					{
						$strValue = trim($item->node_value());
						if($strValue!="")	$strChildren .= $strValue;
						continue;
					}
					
					if($item->node_type() == XML_ELEMENT_NODE)
					{
						$nextItem = $item->next_sibling();
						if($nextItem)
						{
							$nextItem =$nextItem->next_sibling();
						}
						if($nextItem)
						{
							if($item->node_name()==$nextItem->node_name())
							{
								$boolArray=true;
								$strArrayName = $item->node_name();
							}
						}
						if($boolArray)
						{
							if($strChildren!="")$strChildren.=",";
							$strChildren .= __xml2array($item,true);
						}
						else
						{
							if($strChildren!="")$strChildren.=",";
							$strChildren .= __xml2array($item);

						}
						$i++;			
					}
					
				}
			}

			if($strAtts!="" || $i>0)
			{
				if($boolArray)
				{
					if($strAtts!="")
					{
						$obj.=":{".$strAtts.",".$strArrayName.":[".$strChildren."]}";
					}
					else
					{
						$obj.=":".$strArrayName."[".$strChildren."]";
					}
				}
				else
				{
					if(!$boolIsArray)$obj.=":";
					$obj.="{".$strChildren."}";
				}
				
			}
			else if($strChildren!="")
			{
				if(!$boolIsArray)$obj.=":";
				$obj.=$strChildren;
			}
			else if($strChildren=="" && $obj!="")
			{
				$obj.=":{}";
			}
	} 
	
	return $obj;
}

//-- xml url param checking
function validate_url_params_againstxml($childnodes)
{
	GLOBAL $arrValidated;
	foreach ($childnodes as $childNode)
	{
		$arrValidated[$childNode->tagname] = true;
		if(isset($_REQUEST[$childNode->tagname]) && $_REQUEST[$childNode->tagname]!="")
		{
			//-- there is a matched param definition
			$arrPerformChecks = explode(",",$childNode->get_content());
			foreach ($arrPerformChecks as $strCheckMethod)
			{
				//-- if failed parameter checking abort out
				if(!validate_url_param($_REQUEST[$childNode->tagname],$strCheckMethod))
				{

					//-- clear down param
					$val = $_REQUEST[$childNode->tagname];
					$_REQUEST[$childNode->tagname]="";
					$_POST[$childNode->tagname]="";


					if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
					{
						_wc_debug("Param (".$childNode->tagname.") failed check [".$strCheckMethod."] for value [".$val."]","FAILURE","SECUR");
					}

					//-- xmlhttp request
					if($_REQUEST["r"]!="")
					{
						echo "PARAMERROR:[".$childNode->tagname."] Expected parameter check failed and was removed from request. Please contact your Administrator.";
						exit(0);
					}
					else
					{
					 ?>
						<script>
							alert("[<?php echo $childNode->tagname;?>] Expected parameter check failed and was removed from request. Please contact your Administrator.");
						</script>
						<?php 					}
					exit(0);
				}//-- if failed param check
			}
		}
	}//-- for each node
}//-- function validate_url_params_againstxml

function validate_url_param($varValue, $validationType)
{
	if($varValue=="")return true;

	$aValidSpecialChars = array('-', '_','.',' ',','); 
	switch($validationType)
	{
		case "":
			return true;
		case "boolean":
		case "bool":
			return (strtolower($varValue)=="true" || strtolower($varValue)=="false" || $varValue=="0" || $varValue=="1");
		case "numeric":
		case "num":
			return is_numeric($varValue);
		case "alpha":
			return ctype_alpha(str_replace($aValidSpecialChars, '', $varValue));
		case "alphanum":
		case "alphanumeric":
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
		case "nodirtraverse":
			return (strpos($varValue,"..")===false);
		case "sessionanalyst":
			return (strtolower($varValue)==strtolower($_SESSION["sw_analystid"]));
		case "sqlparamstrict": //-- do not allow ; -- # /* or ''
			return (strpos($varValue,"''")===false && strpos($varValue,";")===false && strpos($varValue,"--")===false && strpos($varValue,"/*")===false && strpos($varValue,"#")===false);
		case "sqlobjectname": //-- text num and _ allowed
			$aValidSpecialChars = array('_',':');
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
		case "sqlselectcolumns": //-- text num and _ ,allowed
			$aValidSpecialChars = array('_',',',' ');
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));

		case "filetypexml": 
			return (get_file_extension($varValue)=="xml");
		case "filetypejson": 
			return (get_file_extension($varValue)=="json");
		case "xmltag": 
			return ctype_alnum(str_replace('_' , '', $varValue));
		case "espqueryname": 
			$aValidSpecialChars = array('-', '_','.',' ','/'); 
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));

	}

	return false;
}
}
?>