<?php
	//-- NWJ - 05.06.2007
	//-- Return xml list for fat client xml listbox
	ob_start();
	
	include('php5requirements.php');
	$option = gv('option');
	
	if(strpos($option,'?'))
	{
		$arrOption = explode('?',$option);
		$option = $arrOption[0];
	}
	include("settings/".$option.".xml");
	$strValues .= ob_get_clean();
	$xmlDoc = domxml_open_mem($strValues);
	if($xmlDoc)
    {
		$root = $xmlDoc->document_element();
    }
    $array_nodes = Array();
    $childnodes = $root->child_nodes();
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
	$strValues = "";
	foreach($array_nodes as $childNode)
	{
		$strValue = $childNode->get_content();
		$att = $childNode->attributes();
		if(isset($att))
		{
			foreach($att as $attkey => $anAttribute)
			{
				if($anAttribute->name()=="value")
					$strKey = "^".$anAttribute->value();
			}
		}
		$strValues .= $strValue.$strKey."|";
	}
   echo $strValues;
?>