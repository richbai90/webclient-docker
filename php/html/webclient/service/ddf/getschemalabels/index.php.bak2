<?php

	//-- v1.0.0
	//-- ddf/getschemalabels

	//-- get schema xml for application and return list of labels per binding
	//-- includes
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');

	$strFileName = $portal->application_path . "_customisation/dbschema.xml";
	if(!file_exists($strFileName))
	{
		//-- use standard app view
	$strFileName = $portal->application_path . "/dbschema.xml";
	}
		
	$xmlfp = file_get_contents($strFileName);
	if(!$xmlfp)
	{
		exit(0);
	}

	$xmlDoc = domxml_open_mem($xmlfp);
	
	//-- get first child
    $xmlSchemas = $xmlDoc->child_nodes();
	$xmlApps=swxml_childnodes($xmlSchemas[0],"Application");
	$xmlDbs=swxml_childnodes($xmlApps[1],"Database");
	$xmlTables=swxml_childnodes($xmlDbs[1],"Tables");
	$xmlTable = $xmlTables[1];
	$strXML = "<labels>";

	$arrTables = $xmlTable->child_nodes();
	foreach ($arrTables as $aNode)
	{
		if($aNode->tagname=="Table")
		{	$strTableName = $aNode->get_attribute("name");
			$arrCols = swxml_childnodes($aNode,"Column");
			foreach ($arrCols as $aCol)
			{
				$strBinding = $strTableName.".".$aCol->get_attribute("name");
				$strXML .= "<label binding='".$strBinding."'>";
				$strXML .= pfx(swdti_getcoldispname($strBinding));
				$strXML .= "</label>";
			}
		}
	}
	$strXML .= "</labels>";

	echo $strXML;
?>