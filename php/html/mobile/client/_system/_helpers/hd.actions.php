<?php

	// -- Process "Call Actions" using XMLMC APIs through classXmlmcCallActions
	include_once('itsm_default/xmlmc/classxmlmccallactions.php');
	$oXmlmcCallActions = new XmlmcCallActions($_SESSION['sw_sessionid']);
	if(!$oXmlmcCallActions->isValidSession())
	{
		$callActionErrorMsg = "Session authentication failure. Please contact your Administrator.";
		$boolFailed = true;
	}

	$update_callref = $_POST['_callref'];
	$update_desc = $_POST['updatetxt'];

	$strCallAction = $_POST["_frmaction"];
	if($strCallAction=="Resolve")
	{
		$prefix = 'mprscl_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not resolved.";
			$boolFailed=true;
		}	
		else
		{
			if(!$oXmlmcCallActions->ResolveCall($update_callref, $update_desc,"Mobile Portal (".$_SESSION['aid'].")"))
			{
				$callActionErrorMsg = $oXmlmcCallActions->LastError;
				$boolFailed=true;
			}else
				$boolFailed=false;
		}
	}
	elseif($strCallAction=="Close")
	{
		$prefix = 'mprscl_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not closed.";
			$boolFailed=true;
		}	
		else
		{
			if(!$oXmlmcCallActions->CloseCall($update_callref, $update_desc,"Mobile Portal (".$_SESSION['aid'].")"))
			{
				$callActionErrorMsg = $oXmlmcCallActions->LastError;
				$boolFailed=true;
			}else
			{
				$boolFailed=false;
			}
		}
	}
	elseif($strCallAction=="Update")
	{
		$prefix = 'mpupdc_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not updated.";
			$boolFailed=true;
		}	
		else
		{
			if($update_desc=="")
			{
				$callActionErrorMsg = "You must enter an description before applying an update.";
				$boolFailed=true;
			}
			else
			{
				if(!$oXmlmcCallActions->UpdateCallDiary($update_callref, $update_desc,"Mobile Portal (".$_SESSION['aid'].")"))
				{
					$callActionErrorMsg = $oXmlmcCallActions->LastError;
					$boolFailed=true;
				}else
					$boolFailed=false;
				
			}
		}
	}
	elseif($strCallAction=="Accept")
	{
		$prefix = 'mpacpt_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not accepted.";
			$boolFailed=true;
		}	
		else
		{
			if($update_desc=="")
			{
				$callActionErrorMsg = "You must enter an description before Accepting the request..";
				$boolFailed=true;
			}else{
				$boolFailed=true;
				
				if(!$oXmlmcCallActions->UpdateCallDiary($update_callref, $update_desc,"Mobile Portal (".$_SESSION['aid'].")",'Call Accepted','', true))
				{
					$callActionErrorMsg = $oXmlmcCallActions->LastError;
					$boolFailed=true;
				}else
					$boolFailed=false;
			}
			//$boolFailed=false;
		}
	}
	elseif($strCallAction=="Assign")
	{
		$prefix = 'mpasgn_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not assigned.";
			$boolFailed=true;
		}	
		else
		{
			$assigngroup = $_POST['assigngroup'];
			$assignaid = $_POST['assignid'];
			if(!$oXmlmcCallActions->AssignCall($update_callref, $assigngroup,$assignaid))
			{
				$callActionErrorMsg = $oXmlmcCallActions->LastError;
				$boolFailed=true;
			}else
				$boolFailed=false;
		}
	}
	elseif($strCallAction=="Hold")
	{
		$prefix = 'mphold_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not placed on hold.";
			$boolFailed=true;
		}	
		else
		{
			if(isset($_POST['holdlength']))
			{
				if($_POST['holdlength']!="")
				{
					$intTime = time();
					$intTime = $intTime +$_POST['holdlength'];
					if(!$oXmlmcCallActions->PlaceCallOnHold($update_callref,$update_desc,"Mobile Portal (".$_SESSION['aid'].")","General Update",1,$intTime))
					{
						$callActionErrorMsg = $oXmlmcCallActions->LastError;
						$boolFailed=true;
					}
					$boolFailed=false;
				}
				else
				{
					$callActionErrorMsg = "Please select a length of time to put call on hold.";
					$boolFailed=true;
				}
			}
			else
			{
				$callActionErrorMsg = "Please select a length of time to put call on hold.";
				$boolFailed=true;
			}
		}
	}
	elseif($strCallAction=="Off Hold")
	{
		$prefix = 'mpohld_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not taken off hold.";
			$boolFailed=true;
		}	
		else
		{
			if(!$oXmlmcCallActions->TakeCallOffHold($update_callref))
			{
				$callActionErrorMsg = $oXmlmcCallActions->LastError;
				$boolFailed=true;
			}else
				$boolFailed=false;
		}
	}
	elseif($strCallAction=="Cancel")
	{
		$prefix = 'mpcncl_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not cancelled.";
			$boolFailed=true;
		}	
		else
		{
			$boolValidate = true;

			$cncOpt = $_POST['cncl_opt'];
			if($cncOpt==1)
			{
				$cncl_ref = $_POST['cncl_ref'];
				if($cncl_ref=="")
					$boolValidate = false;
				elseif($cncl_ref=="F0000000")
					$boolValidate = false;
				$callActionErrorMsg = "You must enter a duplicate call reference";
			}

			if($boolValidate)
			{
				$intCallref=$_POST['_callref'];
				$updatetxt = $_POST['updatetxt'];
				if(!$oXmlmcCallActions->CancelCall($intCallref,$update_callref))
				{
					$callActionErrorMsg = $oXmlmcCallActions->LastError;
					$boolFailed=true;
				}else
					$boolFailed=false;
			}
			else
				$boolFailed=true;
		}
	}
	elseif($strCallAction=="Authorise")
	{
		$prefix = 'mpauth_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not authorised.";
			$boolFailed=true;
		}	
		else
		{
			$intAuthorised = $_POST['authorise'];
			if($intAuthorised>0)
			{
				$strCode = "Request Authorised";
				if($intAuthorised=="2")
					$strCode = "Request Rejected";
				if(!$oXmlmcCallActions->UpdateCallDiary($update_callref, $update_desc,"Mobile Portal (".$_SESSION['aid'].")",$strCode,"",false,"1"))
				{
					$strMessage = $oXmlmcCallActions->LastError;
				}
				else
				{
					if(!$oXmlmcCallActions->BPM_UpdateLastAction($update_callref,"AUTHORISATION","Mobile Portal",$intAuthorised,$_SESSION['aid'],1))
					{
						$callActionErrorMsg = $oXmlmcCallActions->LastError;
						$boolFailed=true;
					}else
					{
						$boolFailed=false;
					}
				}
			}
		}
	}
	elseif($strCallAction=="Log")
	{
		$prefix = 'mplc_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The call was not logged.";
			$boolFailed=true;
		}	
		$strMandatory = "";
		$filepath = $_POST['_originfilepath'];
		$strMandatory = _check_last_mandatory($filepath);
		if($strMandatory!="")
			$boolFailed=true;
		if($strMandatory=="")
		{
			$arrSCValues = array();
			$arrCMDBValues = array();
			$arrUpdatedbValues = array();
			$arrOpencallValues = array();

			foreach($_POST as $key => $val)
			{
				if(strpos($key,"opencall_")===0)
				{
						$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrOpencallValues[$colName] = stripslashes($val);
				}
				else if (strpos($key,"updatedb_")===0)
				{
					//-- check opencall priority option
					$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrUpdatedbValues[$colName] = stripslashes($val);
				}
				else if (strpos($key,"cmdb_")===0)
				{
					//-- check opencall priority option
					$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrCMDBValues[$colName] = stripslashes($val);
				}
				else if (strpos($key,"sc_")===0)
				{
					//-- check opencall priority option
					$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrSCValues[$colName] = stripslashes($val);
				}
			}

			
			$arrOCColumns = Array();
			$arrOCColumns['callClass'] = "callclass";
			$arrOCColumns['slaName'] = "priority";
			$arrOCColumns['customerId'] = "priority";
			$arrOCColumns['customerName'] = "priority";
			$arrOCColumns['assetId'] = "equipment";
			$arrOCColumns['costCenter'] = "costcenter";
			$arrOCColumns['probCode'] = "probcode";
			$arrOCColumns['site'] = "site";
			$arrOCColumns['condition'] = "";
		//	$arrOCColumns['groupId'] = "suppgroup";
		//	$arrOCColumns['analystId'] = "owner";
			$arrOCColumns['timeSpent'] = "";

			$arrUpColumns['updateMessage'] = "updatetxt";
			$arrUpColumns['updateCode'] = "udcode";
			$arrUpColumns['updateSource'] = "udsource";

			//File//


			$xmlmc = new XmlMethodCall();
			if($arrTableFields['opencall']['status']['value']=="Incoming")
			{
				$xmlmc->SetParam("logIncoming",true);
			}
			foreach($arrOCColumns as $colName => $field)
			{
				if(isset($arrOpencallValues[$field]))
				{
					$xmlmc->SetParam($colName,$arrOpencallValues[$field]);
					unset($arrOpencallValues[$field]);
				}
			}
			foreach($arrUpColumns as $colName => $field)
			{
				if(isset($arrUpdatedbValues[$field]))
				{
					$xmlmc->SetParam($colName,$arrUpdatedbValues[$field]);
					unset($arrUpdatedbValues[$field]);
				}
			}

			$strAdditionalCallValues = "";
			$strOCExtra = "";
			foreach($arrOpencallValues as $colName => $field)
			{
				$strOCExtra .="<".$colName.">".pfx($field)."</".$colName.">";
			}
			unset($arrOpencallValues);
			if($strOCExtra!="")
			{
				$strAdditionalCallValues = "<opencall>".$strOCExtra."</opencall>";
			}
			$strUpdExtra = "";
			foreach($arrUpdatedbValues as $colName => $field)
			{
				$strUpdExtra .="<".$colName.">".pfx($field)."</".$colName.">";
			}
			unset($arrUpdatedbValues);
			if($strUpdExtra!="")
			{
				$strAdditionalCallValues .= "<updatedb>".$strUpdExtra."</updatedb>";
			}
			if(isset($arrTableFields))
			{
				foreach($arrTableFields as $tableName => $arrTable)
				{
					$boolVal = false;
					foreach($arrTable as $colName => $arrCol)
					{
						$strAdditionalCallValues .= "<".$tableName.">";
						$strAdditionalCallValues .="<".$colName.">".pfx($arrCol['value'])."</".$colName.">";
						$boolVal = true;
					}
					if($boolVal)
					{
						$strAdditionalCallValues .= "</".$tableName.">";
					}
				}
			}

			if($strAdditionalCallValues!="")
			{
					$xmlmc->SetComplexParam("additionalCallValues",$strAdditionalCallValues);
			}
				
			if($xmlmc->Invoke("helpdesk","logNewCall"))
			{
				$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
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
							if($strColName=="callref")
							{
								$new_callref = $colNode->get_content();
								$callref_num = $colNode->get_content();
							}
							elseif($strColName=="respondBy")
							{
								$respondbydate =$colNode->get_content();
							}
							elseif($strColName=="fixBy")
							{
								$fixbydate = $colNode->get_content();
							}
						}
					}
				}
			}
			else
			{
				echo $xmlmc->GetLastError();
				exit;
			}
			$oRS = new _swm_rs();
			$oRS->query("swdata","select callref,fixby,respondby from opencall where callref=".$callref_num,true,null);
			if(!$oRS->eof())
			{
				$new_callref = $oRS->_columns["callref"]->value;
				$respondbydate = $oRS->_columns["respondby"]->value;
				$fixbydate =  $oRS->_columns["fixby"]->value;
			}
			$_POST['_callreffmt'] = $new_callref;
			$_POST['_callref'] = $callref_num;
		
			foreach($arrCMDBValues as $strCode => $strKeys)
			{
				$xmlmc = new XmlMethodCall();
				$xmlmc->SetParam("table","cmn_rel_opencall_ci");
				$xmlmc->SetValue("fk_callref",$_POST['_callref']);
				$xmlmc->SetValue("relcode",$strCode);
				$arrKeys = explode(",",$strKeys);
				for($i=0;$i<count($arrKeys);$i++)
				{
					$xmlmc->SetValue("fk_ci_auto_id",$arrKeys[$i]);
					if($xmlmc->Invoke("data","addRecord"))
					{	
					}
					else
					{
						echo $xmlmc->GetLastErrorCode()." : ".$xmlmc->GetLastError();;
					}
				}
			}
			if($_POST['opencall_callclass']=="Service Request")
			{
				$strAdditionalPrice = 0;
				$intOverallCompCost = 0;
				$intSLACost = 0;
				$intSLAPrice = 0;
				$intComponentPrice = 0;
				$qty = $_POST['opencall_request_qty'];
				$subsc = $_POST['subsc'];


				$strSQL = "select * from sc_subscription where pk_id = ".$subsc;
				$rsData = new _swm_rs();
				$rsData->query("swdata",$strSQL,true,null);

				//-- check if there is any data
				if(!$rsData->eof())
				{
					$intComponentPrice = $rsData->_columns["request_price"]->value;
					$intComponentPrice = $intComponentPrice*$qty;
				}

				
				$strSQL = "select * from sc_sla where fk_sla=".$_POST['opencall_itsm_sladef']." and fk_subscription = ".$subsc;
				$rsData = new _swm_rs();
				$rsData->query("swdata",$strSQL,true,null);

				//-- check if there is any data
				if($rsData->eof())
				{
					$strSQL = "select * from sc_sla where fk_sla=".$_POST['opencall_itsm_sladef']." and fk_service = ".$_POST['opencall_itsm_fk_service'];
					$rsData = new _swm_rs();
					$rsData->query("swdata",$strSQL,true,null);
				}

				if(!$rsData->eof())
				{
					$intSLACost = $rsData->_columns["cost"]->value;
					$intSLAPrice = $rsData->_columns["price"]->value;
				}
			
				foreach($arrSCValues as $strKeys)
				{
					$strSQL = "select * from sc_rels where pk_auto_id in (".$strKeys.")";
					$rsData = new _swm_rs();
					$rsData->query("swdata",$strSQL,true,null);


					//-- check if there is any data
					while(!$rsData->eof())
					{
						$flgIsOptional = $rsData->_columns["flg_isoptional"]->value;
						$flgServiceRels = $rsData->_columns["fk_service_rels"]->value;
						
						$compUnits = $rsData->_columns["units"]->value;
						$compUnits = $compUnits*$qty;

						$compCost = $rsData->_columns["total_cost_for_item"]->value;
						$compCost = $compCost*$qty;
						$intOverallCompCost = $intOverallCompCost +$compCost;
						$compCost = sprintf("%01.2f", $compCost);

						$compPrice = $rsData->_columns["price"]->value;
						$compPrice = $compPrice*$qty;
						$compPrice = sprintf("%01.2f", $compPrice);

						if($flgIsOptional=="0")
						{
							$strThisAdditionalPrice = $compPrice;
							$strAdditionalPrice = $strAdditionalPrice+$strThisAdditionalPrice;
						}

						if($flgServiceRels>0)
						{
							$priceDiff = $rsData->_columns["price_diff"]->value;
							$strThisAdditionalPrice = $priceDiff*$qty;
							$strAdditionalPrice = $strAdditionalPrice +$strThisAdditionalPrice;
						}

						$fk_comp_id = $rsData->_columns["fk_key"]->value;
						$type = 'Per Request';

						$name = $rsData->_columns["service_id"]->value;
						$description = $rsData->_columns["description"]->value;
						$gl_code = $rsData->_columns["gl_code"]->value;
						$xmlmc = new XmlMethodCall();
						$xmlmc->SetParam("table","request_comp");

						$xmlmc->SetValue("fk_callref",$_POST['_callref']);
						$xmlmc->SetValue("fk_comp_id",$fk_comp_id);
						$xmlmc->SetValue("comp_cost",$compCost);
						$xmlmc->SetValue("comp_price",$compPrice);
						$xmlmc->SetValue("qty",$compUnits);
						$xmlmc->SetValue("description",$description);
						$xmlmc->SetValue("type",$type);
						$xmlmc->SetValue("name",$name);
						$xmlmc->SetValue("gl_code",$gl_code);

						if($xmlmc->Invoke("data","addRecord"))
						{	
						}
						else
						{
							echo $xmlmc->GetLastErrorCode()." : ".$xmlmc->GetLastError();;
						}
						$rsData->movenext();
					}
				}
				
				// -- Update Call with component info
				$intComponentPrice = floatval($intComponentPrice)+floatval($strAdditionalPrice);
				$intPrice = floatval($intSLAPrice) +$intComponentPrice;
				$request_cost = floatval($intOverallCompCost)+floatval($intSLACost);

				$intComponentPrice = sprintf("%01.2f", $intComponentPrice);
				$intOverallCompCost = sprintf("%01.2f", $intOverallCompCost);
				$intSLAPrice = sprintf("%01.2f", $intSLAPrice);
				$intSLACost = sprintf("%01.2f", $intSLACost);
				$request_cost = sprintf("%01.2f", $request_cost);
				$intPrice = sprintf("%01.2f", $intPrice);
				
				$arrAdditionalCallValues = array();
				$arrAdditionalCallValues["request_comp_price"] = $intComponentPrice;
				$arrAdditionalCallValues["request_comp_cost"] = $intOverallCompCost;
				$arrAdditionalCallValues["request_sla_cost"] = $intSLACost;
				$arrAdditionalCallValues["request_sla_price"] = $intSLAPrice;
				$arrAdditionalCallValues["request_cost"] = $request_cost;
				$arrAdditionalCallValues["request_price"] = $intPrice;
				
				if(!$oXmlmcCallActions->UpdateCallValues($_POST['_callref'],$arrAdditionalCallValues))
				{
					$callActionErrorMsg = $xmlmc->LastError;
				}
			}
		}
		

	}
	elseif($strCallAction=="Task Update")
	{
		$prefix = 'mpuptk_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$callActionErrorMsg = "Authentication failure. The task was not updated.";
			$boolFailed=true;
		}	
		else
		{
			$arrOpencallValues = Array();
			foreach ($_REQUEST as $key => $val)
			{
				//-- check if we need to split data
				if(strpos($val,ANSWER_SPLIT)!==false)$val = str_replace(ANSWER_SPLIT," and ",$val);

				if(strpos($key,"opencall_")===0)
				{
					$arrInfo = explode("_",$key,2);
					$colName = $arrInfo[1];
					$arrOpencallValues[$colName] = stripslashes($val);
				}
			}
			if(!$oXmlmcCallActions->UpdateCallValues($update_callref, $arrOpencallValues))
			{
				$callActionErrorMsg = $oXmlmcCallActions->LastError;
				$boolFailed=true;
			}
		}
	}
	// -- Print error
	echo $callActionErrorMsg;

	function _check_last_mandatory($strFilePath)
	{
		$filepath = _get_file_loc($strFilePath); 
		if (!$settingDom = domxml_open_file($filepath))
		{
			echo "Error while parsing the document.";
			exit;
		}

		$setting = $settingDom->document_element();
		if(!$setting)
		{
			echo "The application xml is not defined correctly.";
			exit;
		}
		$navXmlDef = $setting->get_elements_by_tagname("entity");
		$intCount = count($navXmlDef);
		$thisElement = $navXmlDef[$intCount-1];
		$thisType = $thisElement->get_attribute("type");
		$boolMandatory = $thisElement->get_attribute("mandatory");

		if($thisType=='customer')
		{
			$flgnocust = $_POST['flgnocust'];
			$cust_id = $_POST['opencall_cust_id'];
			if($flgnocust==1)
			{
				return "";
			}
			else
			{
				if(isset($_POST['opencall_cust_id']))
					if($_POST['opencall_cust_id']!="")
						return "";
			}
			return "Please select a customer record for this request.";
		}
		elseif($thisType=='cmdb')
		{
			$strRelType = $thisElement->get_content();
			$flgnocmdb = $_POST['flgnocmdb'];
			$strDestination = 'cmdb_'.$strRelType;
			$cmdb_id = $_POST[$strDestination];

			//If NO ITEM has been selected
			if($flgnocmdb==1)
			{
				return "";
			}
			else
			{
				if(isset($cmdb_id))
					if($cmdb_id!="")
						return "";
			}
			return "Please select a CMDB record for this request.";
		}
		elseif($thisType=='sla')
		{
			if(isset($_POST['opencall_priority']))
				if($_POST['opencall_priority']!="")
					return "";
			return "Please select a SLA/Priority for this request.";
		}
		elseif($thisType=='service_sla')
		{
			if(isset($_POST['opencall_priority']))
				if($_POST['opencall_priority']!="")
					return "";
			return "Please select a SLA/Priority for this request.";
		}
		elseif($thisType=='file')
		{
			$mandatoryTree = $thisElement->get_elements_by_tagname("mandatory");
			$mand = $mandatoryTree[0];
			$arrMandatoryFields = array();
			if($mand)
			{
				$children = $mand->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$strColDislayName = $colNode->get_content();
						$arrMandatoryFields[$strColName] = $strColDislayName;
					}
				}
			}

			$boolSearch = true;
			if(isset($_POST['entity'.$i]))
			{
				$boolSearch = false;

				foreach($arrMandatoryFields as $key=>$value)
				{
					if(!isset($_POST[$key]))
					{
						return "Please fill in the field ".$value;
					}
					else
					{
						if($_POST[$key]=="")
						{
							return "Please fill in the field ".$value;
						}
					}
				}
			}
			return "";

		}
		elseif($thisType=='bpm')
		{
			if(isset($_POST['opencall_bpm_workflow_id']))
				if($_POST['opencall_bpm_workflow_id']!="")
					return "";
			return "Please select a Workflow for this request.";
		}
		elseif($thisType=='service_catalog')
		{
			if(isset($_POST['opencall_itsm_fk_service']))
				if($_POST['opencall_itsm_fk_service']!="")
					return "";
			return "Please select a Catalog Item for this request.";
		}
	}
?>