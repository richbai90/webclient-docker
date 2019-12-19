<?php
	@session_start();
	
	//--get rights
	$_SESSION['wc_apprights'] = array();
	
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("sessionId",$_SESSION['sw_sessionid']);
	if($xmlmc->Invoke("session","getSessionInfo"))
	{
		$thisXmlDom = $xmlmc->xmlDom;

		$arrDM = $thisXmlDom->get_elements_by_tagname("data");
		$xmlMD = $arrDM[0];
		if($xmlMD)
		{
			$children = $xmlMD->child_nodes();
			$dTotal = count($children);
			for ($i=0;$i<$dTotal;$i++)
			{
				$colNode = $children[$i];
				if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
				{
					$strColName = $colNode->tagname();
					if($strColName=="CurrentDataDictionary")
					{
						//$_SESSION['app_path'] = $_SESSION['smart_path'] . "/apps/".$colNode->get_content(); -- Mobile is not Data Dictionary specific
						$_SESSION['app_path'] = $_SESSION['smart_path'] . "/apps/itsm";
						if(!is_dir($_SESSION['app_path']))
						{
							echo "<center>The Mobile Portal is not setup for the Data Dictionary '".$colNode->get_content()."'.";
							echo "<br>Please contact your Supportworks Administrator.</center>";
							exit;
						}
						$_SESSION['dd'] = $colNode->get_content();
					}

					if($strColName=="sla")
					{
						$_SESSION['sla'] = $colNode->get_content();
						$_SESSION['sla'] = floatval($_SESSION['sla']);
					}

					if($strColName=="ContextGroupID")
						$_SESSION['gid'] = $colNode->get_content();
				}
			}
		}

		//-- F0097762
 		$arrDM = $thisXmlDom->get_elements_by_tagname("appRights");
		$xmlMD = $arrDM[0];
		if($xmlMD)
		{
			$children = $xmlMD->child_nodes();
			$dTotal = count($children);
			for ($i=0;$i<$dTotal;$i++)
			{
				$colNode = $children[$i];
				if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
				{
					$strColName = $colNode->tagname();
					$arrAtts = $colNode->attributes();
					$strName = strtolower($colNode->get_attribute("name"));
					if(strtolower($_SESSION['dd'])==$strName)
					{
						$children = $colNode->child_nodes();
						$dTotal = count($children);
						for ($i=0;$i<$dTotal;$i++)
						{
							$colNode = $children[$i];
							if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
							{
								$_SESSION['wc_apprights'][substr($colNode->tagname(),-1)] = $colNode->get_content();
							}
						}
					}
				}
			}
		}
	}
	
	// -- Load session->getSessionInfo2
	if($xmlmc->Invoke("session","getSessionInfo2"))
	{
		$strLastError = $xmlmc->GetLastError();
		
		if($strLastError=="")
		{
			$arrRows = $xmlmc->xmlDom->get_elements_by_tagname("params");
			foreach($arrRows as $cats)
			{
				$children = $cats->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = strtolower($colNode->tagname());						
						// -- Currently, only storing DD's dataset and datasetFilterList in $_SESSION
						if($strColName == 'dataset') $_SESSION['dataset'] = $colNode->get_content();
						if($strColName == 'datasetfilterlist') $_SESSION['datasetfilterlist'] = $colNode->get_content();
					}
				}
			}
		}
	}
	
	$thisFile = _get_file_loc("[:_swm_app_path]/settings.xml"); 
	if(!file_exists($thisFile))
	{
		echo "The definition file for this view is missing. Please contact your Administrator."; 
		exit;
	}

	if (!$domSettings = @domxml_open_file($thisFile))
	{
		echo "Error while loading the requested document. Please contact your Administrator.";
		exit;
	}

	$settingXML = $domSettings->document_element();
	if(!$settingXML)
	{
		echo "The view xml is not defined correctly. Please contact your Administrator.";
		exit;
	}

	$children = $settingXML->child_nodes();
	$dTotal = count($children);
	for ($i=0;$i<$dTotal;$i++)
	{
		$colNode = $children[$i];
		if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
		{
			$strColName = $colNode->tagname();
			$strColValue = $colNode->get_content();
			if($strColValue!="")
				define(strtoupper($strColName),$strColValue);
		}
	}

	//--
	//-- process application init file and output top actions, title and navigation control
	//--

	//--
	//-- get <top> node and return object containing info
	function _swm_process_top(&$xml)
	{
		$retObject = new swObject();
		$topXmlDef = $xml->get_elements_by_tagname("top");
		if($topXmlDef[0])
		{
			//-- get title
			$xmlTitle = $topXmlDef[0]->get_elements_by_tagname("title");
			$retObject->title = $xmlTitle[0]->get_content();

			//-- get left actions
			$actionsleft = $topXmlDef[0]->get_elements_by_tagname("actionsleft");
			$actionsleft = $actionsleft[0]->get_elements_by_tagname("actions");

			//-- get right actions
			$actionsright = $topXmlDef[0]->get_elements_by_tagname("actionsright");
			$actionsright = $actionsright[0]->get_elements_by_tagname("actions");
		}

		return $retObject;
	}


	//--
	//-- get <navigation> node and return object containing info
	function _swm_process_navigation(&$xml)
	{
		$retArray = Array();
		$navXmlDef = $xml->get_elements_by_tagname("navigation");
		if($navXmlDef[0])
		{
			$links = $navXmlDef[0]->get_elements_by_tagname("link");
			foreach($links as $pos => $xmlLink)
			{
				$aLink = new swObject();
				$aLink->position = $pos;

				$arrLabel = $xmlLink->get_elements_by_tagname("label");
				$aLink->label = $arrLabel[0]->get_content();
				$retArray[$pos] = $aLink;
			}
		}

		return $retArray;
	}

	//-- get application .xml file and load into memory
	//-- if we cannot find the xml file then generate critical error (cannot use swsmart)
	$filepath = _get_file_loc("[:_swm_app_path]/init.xml"); 
	if (!$dom = domxml_open_file($filepath))
	{
		echo "Error while parsing the document.";
		exit;
	}

	$root = $dom->document_element();
	if(!$root)
	{
		echo "The application xml is not defined correctly.";
		exit;
	}

	$oTop   = _swm_process_top($root);
	$arrLinks = _swm_process_navigation($root);

?>