<?php

function getResultVar($output, $data, $tagname)
{
	$var="";
	if($output=='xml')
	{
			$xmlDoc = domxml_open_mem($data);
			if($xmlDoc) $root = $xmlDoc->document_element();
		
		$node = $root->get_elements_by_tagname($tagname);
		if($node) $var = $node[0]->get_content();
		
	}
	else if($output=='other')
	{
		$elements = $data->child_nodes();
		foreach ($elements as $aNode)
		{
			if (($aNode->tagname==$tagname)&&($tagname!=""))
			{
				$var = $aNode->get_content();
			}
		}	
	
	}
	return $var;
}

function getResultElement($output, $data, $tagname)
{
	$var="";
	if($output=='xml')
	{
		$xmlDoc = domxml_open_mem($data);
		if($xmlDoc) $root = $xmlDoc->document_element();
		$node = $root->get_elements_by_tagname($tagname);
		//if($node) $var = $node[0]->get_content();
		
	}
	return $node[0];
}



/*
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
}*



/**
 * get node attribute function as xml_node class does not provide one
 *
 * @param string $name
 * @param array $att
 * @return String
 * @deprecated Use $element->get_attribute('name'); instead.
 *
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
*/

function _getxml_childnode_content($oXML,$strChildNodeName,$intChildPos = 0)
{
    $childNode = _getxml_childnode($oXML,$strChildNodeName,$intChildPos);
    if($childNode!=null)
    {
        return $childNode->get_content();
    }
    return "";
}

function _getxml_childnode($oXML,$strChildNodeName,$intChildPos = 0)
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
?>