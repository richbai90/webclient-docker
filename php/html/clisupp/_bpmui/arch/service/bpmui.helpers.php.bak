<?php

	//-- exort bpm data to xml graph
	$xmlExistingGraphRoot = null;
	function export_workflow_to_graph($workflowId, $strExistingGraphXml)
	{
		//-- convert xml string to object
		if($strExistingGraphXml!="")
		{
			global $xmlExistingGraphRoot;
			$dom = domxml_open_mem($strExistingGraphXml);
			$xmlExistingGraphRoot=$dom->document_element();
			$xmlExistingGraphRoot=$xmlExistingGraphRoot->get_elements_by_tagname("mxCell");
			
		}

		//-- load workflow record
		$strGraphNodesXml = "";
		$rsWorkflow = new SqlQuery();
		$rsWorkflow->Query("select fk_firststage_id,flg_active from bpm_workflow where pk_workflow_id = '".pfs($workflowId)."'");
		if($rsWorkflow->Fetch())
		{
			//-- start graph node and process first stage and then all those that are linked 
			$mxCurrentParentNodeID = 2;
			$sActive = $rsWorkflow->GetValueAsString("flg_active");
			$firstStageID = $rsWorkflow->GetValueAsNumber("fk_firststage_id");
			$strGraphNodesXml = mxgraph_start($workflowId);
			$strGraphNodesXml .= process_workflow_stage($firstStageID, $mxCurrentParentNodeID);

			//-- now get stages that are not link from start - i.e. orphans - we should still render these so user can see
			global $arrayProcessedStages;
			$bBuggered = false;
			$rsStages = new SqlQuery();
			$x=0;
			$rsStages->Query("select pk_stage_id from bpm_stage where fk_workflow_id = '".pfs($workflowId)."'");
			while($rsStages->Fetch())
			{
				$x++;
				$checkStageId = "stage_" . $rsStages->GetValueAsString("pk_stage_id");
				if($arrayProcessedStages[$checkStageId])
				{
					//-- skip as has been processed
				}
				else
				{
					$bBuggered=true;
					$strGraphNodesXml .= process_workflow_stage($rsStages->GetValueAsString("pk_stage_id"), "2.2");
				}
			}

			if($bBuggered)
			{
				$strGraphNodesXml .=mxgraph_orphanstages();
			}
		}

		if($x>5)$x="0.8";
		else if($x>10)$x="0.6";
		else if($x>15)$x="0.4";
		else if($x>20)$x="0.2";
		else if($x>30)$x="0.1";
		else $x="1";


		return mxgraph_wrapper($strGraphNodesXml,$sActive, $x);
	}

	$arrayProcessedStages = Array();
	$xCount = 0;
	function process_workflow_stage($intStageID, $mxLinkToParentNodeID, $strLinkToTitle = "", $intConditionID="")
	{
		global $arrayProcessedStages;
		global $xCount;
		$xCount++;

		//-- load a workflow stage and generate its mxgraph node xml and its link to authnode/condition nodes
		$strStageNodesXml = "";

		$rsStage = new SqlQuery();
		$rsStage->Query("select title,fk_workflow_id from bpm_stage where pk_stage_id = " . pfs($intStageID));
		if($rsStage->Fetch())
		{
			$strWorkflowID = $rsStage->GetValueAsString("fk_workflow_id");
			$strStageTitle = $rsStage->GetValueAsString("title");

			//-- set stage id (if stage is being linked to more than once redraw stage with new id)
			$mxStageNodeID = "stage_" . $intStageID;
			if(isset($arrayProcessedStages[$mxStageNodeID]))
			{
				//-- stage node xml has already been defined 
				global $useGotoStageNodes;
				//-- we want to show ref nodes (i.e. indicate to goto node els where on graph - like an offpage ref)
				if($useGotoStageNodes)
				{
					$mxStageNodeID = "stage_dup_" . $intStageID ."_".$xCount;
					$strStageNodesXml .= mxgraph_gotostage($mxStageNodeID, $mxLinkToParentNodeID,$strStageTitle, $strLinkToTitle,$intStageID,$intConditionID);
				}
				else
				{
					//-- we want to draw links instead of so we jsut need to draw a connection between the condition that is linking to the stage
					$strStageNodesXml .= mxgraph_connector($mxLinkToParentNodeID, "stage_".$intStageID,$strLinkToTitle,$intConditionID);
				}
				return $strStageNodesXml;
			}
			else
			{
				$strStageNodesXml .= mxgraph_stage($mxStageNodeID, $mxLinkToParentNodeID, $strStageTitle, $strLinkToTitle,$intStageID,$intConditionID);
				$arrayProcessedStages[$mxStageNodeID] = true;
			}

			
			//-- if has authorisation setup then add an auth node as first child of stage node
			$mxConditionParentNodeID = $mxStageNodeID;
			$rsAuths = new SqlQuery();
			$rsAuths->Query("select count(*) as cnt from bpm_stage_auth where fk_stage_id = ".pfs($intStageID));
			if($rsAuths->Fetch())
			{
				$intAuthCount = $rsAuths->GetValueAsNumber("cnt");
				if($intAuthCount>0)
				{
					$mxAuthNodeID = "auth_" . $intStageID;
					$mxConditionParentNodeID = $mxAuthNodeID;
					$strStageNodesXml .= mxgraph_auth($mxAuthNodeID, $mxStageNodeID,$intStageID);
				}
			}


			
			//-- process on start conditions
			$mxConditionNodeID = "cond_start_" . $intStageID;

			//-- fetch stage conditions
			$intAdjustNodeId = 0;
			$strConditionLinkTitle = "";
			$bEndConditions = true;
			$rsConditions = new SqlQuery();
			$rsConditions->Query("select pk_condition_id, title,set_workflow,set_stage from bpm_cond where flg_runatstart=1 and fk_stage_id = ".pfs($intStageID));
			while($rsConditions->Fetch())
			{
				$intAdjustNodeId++;
				$strConditionLinkTitle = $rsConditions->GetValueAsString("title");
				$intConditionID = $rsConditions->GetValueAsNumber("pk_condition_id");


				//-- check if it goes to another workflow - if so get jumpto node
				$jumptoWorkflowID = $rsConditions->GetValueAsString("set_workflow");
				if($jumptoWorkflowID!="" && $jumptoWorkflowID!=$strWorkflowID)
				{
					$bEndConditions = false;
					$strJumpToNodeID = "jump_" . $intStageID ."_" . $intAdjustNodeId;
					$strStageNodesXml .= mxgraph_jumpto($strJumpToNodeID, $mxConditionNodeID, $jumptoWorkflowID,$intConditionID);	
				}
				else 
				{
					//-- check if it goes to another stage - if so generate stage xml with link
					$nextStageID = $rsConditions->GetValueAsNumber("set_stage");
					if($nextStageID>0)
					{
						$bEndConditions = false;
						$strNextStageNodesXml = process_workflow_stage($nextStageID, $mxConditionNodeID, $strConditionLinkTitle,$intConditionID);
						$strStageNodesXml .=$strNextStageNodesXml;
					}
					else if($jumptoWorkflowID==$strWorkflowID)
					{
						//-- goto start - so show goto start node
						$bEndConditions = false;
						$strJumpToNodeID = "goto_start_" . $intAdjustNodeId;
						$strStageNodesXml .= mxgraph_gotostart($strJumpToNodeID, $mxConditionNodeID,$intConditionID);
					}
				}
			}
			//-- only show if we have start events
			if($intAdjustNodeId>0)$strStageNodesXml .= mxgraph_condition($mxConditionNodeID, $mxConditionParentNodeID, $bEndConditions,$intStageID,true);
			//-- eof run at start

			//-- process on status chge conditions
			$mxConditionNodeID = "cond_" . $intStageID;

			//-- fetch stage conditions
			$intAdjustNodeId = 0;
			$strConditionLinkTitle = "";
			$bEndConditions = true;
			$rsConditions = new SqlQuery();
			$rsConditions->Query("select pk_condition_id, title,set_workflow,set_stage from bpm_cond where flg_runatstart<>1 and fk_stage_id = ".pfs($intStageID));
			while($rsConditions->Fetch())
			{
				$intAdjustNodeId++;
				$strConditionLinkTitle = $rsConditions->GetValueAsString("title");
				$intConditionID = $rsConditions->GetValueAsNumber("pk_condition_id");


				//-- check if it goes to another workflow - if so get jumpto node
				$jumptoWorkflowID = $rsConditions->GetValueAsString("set_workflow");
				if($jumptoWorkflowID!="" && $jumptoWorkflowID!=$strWorkflowID)
				{
					$bEndConditions = false;
					$strJumpToNodeID = "jump_" . $intStageID ."_" . $intAdjustNodeId;
					$strStageNodesXml .= mxgraph_jumpto($strJumpToNodeID, $mxConditionNodeID, $jumptoWorkflowID,$intConditionID);	
				}
				else 
				{
					//-- check if it goes to another stage - if so generate stage xml with link
					$nextStageID = $rsConditions->GetValueAsNumber("set_stage");
					if($nextStageID>0)
					{
						$bEndConditions = false;
						$strNextStageNodesXml = process_workflow_stage($nextStageID, $mxConditionNodeID, $strConditionLinkTitle,$intConditionID);
						$strStageNodesXml .=$strNextStageNodesXml;
					}
					else if($jumptoWorkflowID==$strWorkflowID)
					{
						//-- goto start - so show goto start node
						$bEndConditions = false;
						$strJumpToNodeID = "goto_start_" . $intAdjustNodeId;
						$strStageNodesXml .= mxgraph_gotostart($strJumpToNodeID, $mxConditionNodeID,$intConditionID);
					}
				}
			}
					
			$strStageNodesXml .= mxgraph_condition($mxConditionNodeID, $mxConditionParentNodeID, $bEndConditions,$intStageID,false);


		}

		return $strStageNodesXml;

	}

	function mxgraph_wrapper($strGraphNodesXml,$isActive,$scale="1")
	{
		global $xmlExistingGraphRoot;
		$fromdb = ($xmlExistingGraphRoot==null)?"0":"1";

		$strXML = '<mxGraphModel fromdb="'.$fromdb.'" wfactive="'.$isActive.'" grid="1" guides="0" tooltips="0" connect="0" fold="0" page="0" scale="'.$scale.'" pageScale="1">';
		$strXML .='<root>';
		$strXML .=$strGraphNodesXml;
		$strXML .='</root>';
		$strXML .='</mxGraphModel>';

		return $strXML;
	}

	$arrNewCoOrds = Array();
	function getGeometry($strCellId,$strCellParentID="")
	{
		
		global $xmlExistingGraphRoot;

		$x=50;$y=50;
		if($xmlExistingGraphRoot!=null)
		{
			global $arrNewCoOrds;
			$pNode = null;
			foreach($xmlExistingGraphRoot as $node)
			{
				if($node->get_attribute("id") ==$strCellId)
				{
					$owner_document = $node->owner_document();
					$eGeoNode = $node->get_elements_by_tagname("mxGeometry");
					return $owner_document->dump_node($eGeoNode[0]);
				}
				else if($node->get_attribute("id") ==$strCellParentID)
				{
					$pNode=$node;
				}
			}

			//-- check if parent is already layed out if so position to bottom right of parent
			if($pNode)
			{
				$eGeoNode = $pNode->get_elements_by_tagname("mxGeometry");
				$eGeoNode = $eGeoNode[0];
				if($eGeoNode)
				{
					$x= $eGeoNode->get_attribute("x") + $eGeoNode->get_attribute("width") + 120;
					$y= $eGeoNode->get_attribute("y") + 100;
					$arrNewCoOrds[$strCellId] = array($x,$y);
				}
			}
			else
			{
				if($arrNewCoOrds[$strCellParentID])
				{
					$x = $arrNewCoOrds[$strCellParentID][0] + 110 + 120;
					$y = $arrNewCoOrds[$strCellParentID][1] + 100;
				}
			}
		}
	
		$strGeoXML = '<mxGeometry x="'.$x.'" y="'.$y.'" width="110" height="80" as="geometry"/>';
		return $strGeoXML;
	}

	function mxgraph_orphanstages()
	{
		$strXML .= '<mxCell id="2.2" value="Orphaned&#xa;Stages" style="shape=mxgraph.flowchart.terminator;fillColor=#FF0000;strokeColor=#000000;strokeWidth=2;shadow=1;gradientColor=#FFAA7F" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="startorphans"/>';
		$strXML .= getGeometry("2.2");
		$strXML .= '</mxCell>';
		return $strXML;
	}


	function mxgraph_start($strTitle)
	{
		$strTitle = str_replace(" ","&#xa;",pfx($strTitle));

		$strXML = '<mxCell id="0"/>';
		$strXML .= '<mxCell id="1" parent="0"/>';
		$strXML .= '<mxCell id="2" value="'.$strTitle.'" style="shape=mxgraph.flowchart.terminator;fillColor=#FFF2CC;strokeColor=#000000;strokeWidth=2;shadow=1;gradientColor=#FFFFCC" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="start"/>';
		$strXML .=  getGeometry("2");
		$strXML .= '</mxCell>';
		return $strXML;
	}

	function mxgraph_gotostart($id, $intParentID,$intConditionID="")
	{
		$strXML	= mxgraph_connector($intParentID, $id,"",$intConditionID);

		$strXML = '<mxCell id="2" value="Goto Start" style="shape=mxgraph.flowchart.terminator;fillColor=#FFF2CC;strokeColor=#000000;strokeWidth=2;shadow=1;gradientColor=#FFFFCC" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="gotostart"/>';
		$strXML .=  getGeometry($id,$intParentID);
		$strXML .= '</mxCell>';
		return $strXML;
	}

	function mxgraph_gotostage($id, $intParentID, $strTitle, $strLinkToTitle,$htlRecordID,$intConditionID="")
	{
		
		$strXML	= mxgraph_connector($intParentID, $id,$strLinkToTitle,$intConditionID);

		$strTitle = str_replace(" ","&#xa;",pfx($strTitle));


		$strXML .= '<mxCell id="'.$id.'" value="Goto&#xa;'.$strTitle.'" style="shape=mxgraph.flowchart.predefined_process;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;shadow=1;whiteSpace:wrap;gradientColor=#dddddd" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="gotostage" stagekey="'.$htlRecordID.'"/>';
		$strXML .=  getGeometry($id,$intParentID);
		$strXML .= '</mxCell>';
		return $strXML;
	}


	function mxgraph_stage($id, $intParentID, $strTitle, $strLinkToTitle,$htlRecordID,$intConditionID="")
	{
		
		$strXML	= mxgraph_connector($intParentID, $id,$strLinkToTitle,$intConditionID);

		$strTitle = str_replace(" ","&#xa;",pfx($strTitle));

		$strXML .= '<mxCell id="'.$id.'" value="'.$strTitle.'" style="shape=mxgraph.flowchart.predefined_process;fillColor=#B5739D;strokeColor=#000000;strokeWidth=2;shadow=1;whiteSpace:wrap;gradientColor=#E6D0DE" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="stage" stagekey="'.$htlRecordID.'"/>';
		$strXML .=  getGeometry($id, $intParentID);
		$strXML .= '</mxCell>';
		return $strXML;
	}

	function mxgraph_auth($id, $intParentID,$htlRecordID)
	{
		
		$strXML	= mxgraph_connector($intParentID, $id);

	    $strXML .= '<mxCell id="'.$id.'" value="Authorisation" style="shape=mxgraph.flowchart.preparation;fillColor=#9AC7BF;strokeColor=#000000;strokeWidth=2;shadow=1;gradientColor=#D5E8D4" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="auth" stagekey="'.$htlRecordID.'"/>';
		$strXML .=  getGeometry($id,$intParentID);
	    $strXML .= '</mxCell>';

		return $strXML;
	}

	function mxgraph_condition($id, $intParentID, $bEndCondition , $htlRecordID, $bRunAtStart = false)
	{
		
		$strXML	= mxgraph_connector($intParentID, $id);


		if($bRunAtStart)
		{
			$bgSetting = "fillColor=#FFFFFF;gradientColor=#73AD64;";
			$strTitle = "On Stage Start";
			$type="startcond";
		}
		else
		{
			$bgSetting = ($bEndCondition)?"fillColor=#FF3333;gradientColor=#FFCCCC;":"fillColor=#A9C4EB;gradientColor=#D4E1F5;";
			$strTitle = ($bEndCondition)?"Completed":"On Status Change";
			$type = ($bEndCondition)?"endnode":"statuscond";
		}
		$strTitle = str_replace(" ","&#xa;",pfx($strTitle));

	    $strXML .= '<mxCell  id="'.$id.'" value="'.$strTitle.'" style="shape=mxgraph.flowchart.decision;strokeColor=#000000;strokeWidth=2;shadow=1;'.$bgSetting.'" parent="1" vertex="1" >';
		$strXML .= '<Object as="htl" type="'.$type.'" stagekey="'.$htlRecordID.'"/>';
		$strXML .=  getGeometry($id,$intParentID);
	    $strXML .= '</mxCell>';
		return $strXML;
	}

	function mxgraph_jumpto($id, $intParentID, $strWorkflowName,$intConditionID="")
	{
		
		$strXML	= mxgraph_connector($intParentID, $id,"",$intConditionID);

	    $strXML .= '<mxCell  id="'.$id.'" value="'.pfx($strWorkflowName).'" style="shape=mxgraph.flowchart.display;fillColor=#FFD966;strokeColor=#000000;strokeWidth=2;gradientColor=#FFCE9F;shadow=1" parent="1" vertex="1">';
		$strXML .= '<Object as="htl" type="jumpto"/>';
		$strXML .=  getGeometry($id,$intParentID);
	    $strXML .= '</mxCell>';
		
		return $strXML;
	}


	function mxgraph_connector($sourceID, $targetID, $strTitle = "",$intConditionID="")
	{
		$strID = "link_".$sourceID."_".$targetID;
		$strXML  ='<mxCell id="'.$strID.'" value="'.pfx($strTitle).'" style="endArrow=block;edgeStyle=elbowEdgeStyle;strokeWidth=2;strokeColor=#000000" parent="1"  source="'.$sourceID.'" target="'.$targetID.'" edge="1">';
		$strXML .= '<Object as="htl" type="link" condid="'.$intConditionID.'"/>';
		$strXML .=  getGeometry($strID);
		$strXML .='</mxCell>';
		return $strXML;
	}

?>