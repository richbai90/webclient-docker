<?php 	$boolMandatory = false;
	$strOtherInputs = "";
	$strHTML = "";
	//-- if we cannot find the xml file then generate critical error (cannot use swsmart)
	$filepath = _get_file_loc($filepath); 
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

	foreach($_POST as $key => $val)
	{
		if(strpos($key,"opencall_")===0)
		{
			$strOtherInputs .= 	"<input type='hidden' name='"._html_encode($key)."' id='"._html_encode($key)."' value='"._html_encode(stripslashes($val))."'>";
		}
		else if (strpos($key,"updatedb_")===0)
		{
			$strOtherInputs .= 	"<input type='hidden' name='"._html_encode($key)."' id='"._html_encode($key)."' value='"._html_encode(stripslashes($val))."'>";
		}
		else if (strpos($key,"cmdb_")===0)
		{
			$strOtherInputs .= 	"<input type='hidden' name='"._html_encode($key)."' id='"._html_encode($key)."' value='"._html_encode(stripslashes($val))."'>";
		}
	}


	$retArray = Array();
	$navXmlDef = $setting->get_elements_by_tagname("entity");

	for($i=0;$i<count($navXmlDef);$i++)
	{
		$boolLast = false;
		if(($i+1)==count($navXmlDef))
			$boolLast = true;

		$thisElement = $navXmlDef[$i];
		$thisType = $thisElement->get_attribute("type");
		$boolMandatory = $thisElement->get_attribute("mandatory");

		if($thisType=='customer')
		{
			$flgnocust = $_POST['flgnocust'];
			$cust_id = $_POST['opencall_cust_id'];
			$searchmode = $_POST['custsearchmode'];
			$searchcriteria = $_POST['custsearchcriteria'];
			if($flgnocust==1)
			{
				$strOtherInputs .= 	"<input type='hidden' name='flgnocust' id='flgnocust' value='1'>";
				$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Customer</span></span></div><table width='100%'><tr><td width='50%'>Customer: </td><td>NO CUSTOMER</td></tr></table>";
				echo $strHTML;
			}
			else
			{
				include(_get_file_loc("[:_swm_client_path]/_helpers/cust.search.php"));
				$boolSearch = true;
				if(isset($_POST['opencall_cust_id']))
					if($_POST['opencall_cust_id']!="")
						$boolSearch = false;
				if(!$boolSearch)
				{
					$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Customer</span></span></div><table><tr><td width='50%'>Organisation</td><td>"._html_encode($_POST['opencall_fk_company_id'])."</td></tr><tr><td>Customer</td><td>"._html_encode($_POST['opencall_cust_id'])."</td></tr></table>";
					echo $strHTML;
					if($boolLast)
					{
						ob_start();
						include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
						$strOtherInputs .= ob_get_clean();
						$strOtherInputs .= get_defaults($setting);
					}
				}else
				{
					_customer_search($cust_id,$boolMandatory,$searchmode,$searchcriteria,$strOtherInputs);
					break;
				}
			}
		}
		elseif($thisType=='cmdb')
		{
			$boolCurrent = true;
			if(isset($_POST['entity'.$i]))
				if($_POST['entity'.$i]=="1")
					$boolCurrent = false;

			$strRelType = $thisElement->get_content();
			$flgnocmdb = $_POST['flgnocmdb'];
			$strDestination = 'cmdb_'.$strRelType;
			$cmdb_id = $_POST[$strDestination];
			$searchmode = $_POST['cmdbsearchmode'];
			$searchcriteria = $_POST['cmdbsearchcriteria'];

			$boolMutli = $thisElement->get_attribute("multi");

			//If NO ITEM has been selected
			if($flgnocmdb==1)
			{
				$boolShowButtons = true;
				$strOtherInputs .= 	"<input type='hidden' name='flgnocmdb' id='flgnocmdb' value='1'>";
				$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
				$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Configuration Item</span></span></div><table width='100%'><tr><td width='50%'>Configuration Item: </td><td>NO ITEM</td></tr></table>";
				echo $strHTML;
			}
			else
			{
				$boolHasItem = false;
				if(isset($cmdb_id))
					if($cmdb_id!="")
					{
						$boolHasItem = true;
						$boolShowButtons = true;
					}

				//Want an item
				include(_get_file_loc("[:_swm_client_path]/_helpers/cmdb.search.php"));

				if($boolHasItem)
				{
					if($boolMutli=="0")
						$boolCurrent = false;
					$boolShowButtons = true;
					$rsData = new _swm_rs();
					$strSQL = "select description,ck_config_item,pk_auto_id from config_itemi where pk_auto_id in (".$cmdb_id.")";
					$strSQL = _swm_parse_string($strSQL);
					$rsData->query("swdata",$strSQL,true,null);

					$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Configuration Item</span></span></div><table>";
					$template ="<tr><td>Configuration Item</td><td>[:rs.ck_config_item.htmlvalue]</td></tr><tr><td>Descripion</td><td>[:rs.description.htmlvalue]</td></tr>";
					if($boolCurrent)
						$template ="<tr style='cursor:pointer;' target='"._html_encode($strDestination)."' pk_id='[:rs.pk_auto_id.value]' onclick='_remove_cmdb_item(this);'><td width='100%'><table><tr><td>Configuration</td><td> Item</td><td>[:rs.ck_config_item.htmlvalue]</td></tr><tr><td>Descripion</td><td>[:rs.description.htmlvalue]</td></tr></table></td><td align='right'><img src='client/_system/images/icons/cross.png'></td></tr>";

					//-- check if there is any data
					while(!$rsData->eof())
					{
						$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
						$rsData->movenext();
					}
					$strHTML.=	"</table>";
					echo $strHTML;

				}
				
				if($boolCurrent)
				{
					$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='0'>";
					_cmdb_search($$cmdb_id,$boolMandatory,$searchmode,$searchcriteria,$strOtherInputs,$strDestination,$cmdb_id);
					if($boolShowButtons)
					{
						if($boolLast)
						{
							$strOtherInputs .=$strInputHTML;
							ob_start();
							include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
							$strOtherInputs .= ob_get_clean();
							$strOtherInputs .= get_defaults($setting);
						}
						else
						{
							$strButtonHTML =_get_cmdb_next_button('entity'.$i);
							echo $strButtonHTML;
						}
					}

					break;
				}
				else
					$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
			}
		}
		elseif($thisType=='sla')
		{
			include(_get_file_loc("[:_swm_client_path]/_helpers/sla.search.php"));
			$sla = $_POST['opencall_itsm_sladef'];
			$slaname = $_POST['opencall_itsm_slaname'];
			$searchcriteria = $_POST['slasearchcriteria'];
			$boolSearch = true;
			if(isset($_POST['opencall_priority']))
				if($_POST['opencall_priority']!="")
					$boolSearch = false;

			if(!$boolSearch)
			{
				$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Priority</span></span></div><table><tr><td width='50%'>SLA</td><td>"._html_encode($_POST['opencall_itsm_slaname'])."</td></tr><tr><td>Priority</td><td>"._html_encode($_POST['opencall_priority'])."</td></tr></table>";
				echo $strHTML;
				if($boolLast)
				{
					ob_start();
					include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
					$strOtherInputs .= ob_get_clean();
					$strOtherInputs .= get_defaults($setting);
				}
			}
			else
			{
				_sla_search($sla,$slaname,$boolMandatory,$searchcriteria,$strOtherInputs);
				break;
			}
		}
		elseif($thisType=='service_sla')
		{
			include(_get_file_loc("[:_swm_client_path]/_helpers/scsla.search.php"));
			$sla = $_POST['opencall_itsm_sladef'];
			$slaname = $_POST['opencall_itsm_slaname'];
			$searchcriteria = $_POST['slasearchcriteria'];
			$boolSearch = true;
			if(isset($_POST['opencall_priority']))
				if($_POST['opencall_priority']!="")
					$boolSearch = false;

			if(!$boolSearch)
			{
				$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Service Selected Priority</span></span></div><table><tr><td width='50%'>SLA</td><td>"._html_encode($_POST['opencall_itsm_slaname'])."</td></tr><tr><td>Priority</td><td>"._html_encode($_POST['opencall_priority'])."</td></tr></table>";
				echo $strHTML;
				if($boolLast)
				{
					ob_start();
					include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
					$strOtherInputs .= ob_get_clean();
					$strOtherInputs .= get_defaults($setting);
				}
			}
			else
			{
				_sc_sla_search($sla,$slaname,$boolMandatory,$searchcriteria,$strOtherInputs);
				break;
			}
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
						array_push($arrMandatoryFields,$strColName);
					}
				}
			}

			$boolSearch = true;
			if(isset($_POST['entity'.$i]))
			{
				$boolSearch = false;

				for($x=0;$x<count($arrMandatoryFields);$x++)
				{
					$fldName = $arrMandatoryFields[$x];
					if(!isset($_POST[$fldName]))
					{
						$boolSearch = true;
						$boolMandatory = true;
					}
					else
					{
						if($_POST[$fldName]=="")
						{
							$boolSearch = true;
							$boolMandatory = true;
						}
					}
				}
			}

			if($boolSearch)
			{
				$fileloctree = $thisElement->get_elements_by_tagname("fileloc");
				$fileloc = $fileloctree[0];
				$strContent = $fileloc->get_content();

				$strContent = _get_file_loc($strContent);
				ob_start();
				include(trim($strContent));
				$strInputHTML .= ob_get_clean();

				if($boolLast)
				{
					$strOtherInputs .=$strInputHTML;
					ob_start();
					include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
					$strOtherInputs .= ob_get_clean();
					$strOtherInputs .= get_defaults($setting);
				}
				else
				{
					ob_start();
					include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.nextbutton.php"));
					$strButtonHTML .= ob_get_clean();
					?>
					<form id='frmFileInputHolder' target="_self" method='post' action='index.php' >
					<input type='hidden' name='_action' id='_action' value='_navig'>
					<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
					<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__originfilepath']);?>'>
					<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
					<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
					<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
					<input type='hidden' name='entity<?php echo $i;?>' id='entity<?php echo $i;?>' value='1'>
						<?php echo $strOtherInputs;?>
						<?php echo $strInputHTML;?>
						<?php echo $strButtonHTML;?>
					</form>
					<?php 					$strOtherInputs .="<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
				}
				break;
			}
			else
			{
				$fileloctree = $thisElement->get_elements_by_tagname("filecompleteloc");
				$fileloc = $fileloctree[0];
				$thisComplete = $fileloc->get_content();

				if($thisComplete !="")
				{
					ob_start();
					include(_swm_parse_string($thisComplete));
					$includeHTML .= ob_get_clean();
					echo $includeHTML;
				}
				$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
			}
		}
		elseif($thisType=='bpm')
		{
			$boolSearch = true;
			if(isset($_POST['entity'.$i]))
				$boolSearch = false;

			if($boolSearch)
			{
				$strCallclass = $thisElement->get_attribute("callclass");
				$strInputHTML = "";

				$strSQL = "select fk_def_bpm from sys_sett_defbpm where pk_callclass='"._swm_db_pfs($strCallclass)."' and appcode IN(" .$_SESSION['datasetfilterlist']. ")";

				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query($strDB,$strSQL,true,null);

				if(!$rsData->eof())
				{
					$strDefaultProcess .= $rsData->EmbedDataIntoString("rs","[:rs.fk_def_bpm.value]");
				}
				
				$strSQL = "select * from bpm_workflow where flg_active=1 and callclass='".$strCallclass."'";
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query($strDB,$strSQL,true,null);

				$strInputHTML .="<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Business Process</span></span></div><select id='opencall_bpm_workflow_id' name='opencall_bpm_workflow_id'>";
				if($boolMandatory=="0")
					$strInputHTML .="<option selected/>";
				while(!$rsData->eof())
				{
					$strValue = $rsData->EmbedDataIntoString("rs","[:rs.pk_workflow_id.value]");
					$strHTMLValue = $rsData->EmbedDataIntoString("rs","[:rs.pk_workflow_id.htmlvalue]");
					$strSelected = "";
					if($strValue==$strDefaultProcess)
						$strSelected = "selected";
					$strInputHTML .= "<option ".$strSelected.">".$strHTMLValue."</option>";
					$rsData->movenext();
				}
				$strInputHTML .="</select>";
				
				if($boolLast)
				{
					$strOtherInputs .=$strInputHTML;
					ob_start();
					include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
					$strOtherInputs .= ob_get_clean();
					$strOtherInputs .= get_defaults($setting);
				}
				else
				{
					ob_start();
					include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.nextbutton.php"));
					$strButtonHTML .= ob_get_clean();
					?>
					<form id='frmFileInputHolder' target="_self" method='post' action='index.php' >
					<input type='hidden' name='_action' id='_action' value='_navig'>
					<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
					<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__originfilepath']);?>'>
					<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
					<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
					<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
					<input type='hidden' name='entity<?php echo $i;?>' id='entity<?php echo $i;?>' value='1'>
						<?php echo $strOtherInputs;?>
						<?php echo $strInputHTML;?>
						<?php echo $strButtonHTML;?>
					</form>
					<?php 				}
				$strOtherInputs .="<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
				break;
			}
			else
			{
				$includeHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Business Process</span></span></div><table><tr><td width='50%'>Process</td><td>"._html_encode($_POST['opencall_bpm_workflow_id'])."</td></tr></table>";
				echo $includeHTML;
				$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
			}
		}
		elseif($thisType=='service_catalog')
		{
			if(!isset($_POST['opencall_cust_id']))
			{
				echo "No Customer selected";
				return;
			}
			$service_id = $_POST['opencall_itsm_fk_service'];

			$boolSearch = true;
			if(isset($_POST['entity'.$i]))
			{
				if($_POST['entity'.$i]=="1")
					$boolSearch = false;
			}

			if(!$boolSearch)
			{
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string("select * from config_itemi where pk_auto_id=".$service_id);
				$rsData->query("swdata",$strSQL,true,null);
				if(!$rsData->eof())
				{
					$strServiceName =	$rsData->EmbedDataIntoString("rs","[:rs.ck_config_item.htmlvalue]");
				}
				$includeHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Service Request Details</span></span></div><table><tr><td width='50%'></td><td>".$strServiceName."</td></tr><tr><td width='50%'></td><td>Quantity:"._html_encode($_POST['opencall_request_qty'])."</td></tr></table>";
				$includeHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Service Request Components</span></span></div><table>";
				$template = "<tr><td width='50%'></td><td>[:rs.description.htmlvalue]</td></tr>";
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string("select * from sc_rels where pk_auto_id in (".$_POST['sc_options'].")");
				$rsData->query("swdata",$strSQL,true,null);
				while(!$rsData->eof())
				{
					$includeHTML .=	$rsData->EmbedDataIntoString("rs",$template);
					$rsData->movenext();
				}
				$includeHTML .=	"</table>";
				echo $includeHTML;
				$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='1'>";
				$strOtherInputs .= 	"<input type='hidden' name='sc_options' id='sc_options' value='".$_POST['sc_options']."'>";
				$strOtherInputs .= 	"<input type='hidden' name='subsc' id='subsc' value='".$_POST['subsc']."'>";
			}
			else
			{
				$strOtherInputs .= 	"<input type='hidden' name='entity".$i."' id='entity".$i."' value='0'>";
				include(_get_file_loc("[:_swm_client_path]/_helpers/sc.search.php"));
				$boolSearch = true;
				_output_sc_catalog($service_id,$strOtherInputs);

				if(isset($service_id))
				{
					if($boolLast)
					{
						$strOtherInputs .=$strInputHTML;
						ob_start();
						include(_get_file_loc("[:_swm_client_path]/_helpers/logcall.button.php"));
						$strOtherInputs .= ob_get_clean();
						$strOtherInputs .= get_defaults($setting);
					}
					else
					{
						$strButtonHTML =_get_sc_next_button('entity'.$i);
						echo $strButtonHTML;
					}
				}
				break;			
			
			
			}
		}
	}

	function get_defaults($setting)
	{
		$strHTML = "";
		$navXmlDef = $setting->get_elements_by_tagname("defaultvalues");
		$dfValues = $navXmlDef[0];
		if($dfValues)
		{
			$children = $dfValues->child_nodes();
			$dTotal = count($children);
			for ($i=0;$i<$dTotal;$i++)
			{
				$colNode = $children[$i];
				if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
				{
					$strColName = $colNode->tagname();
					$strValue = $colNode->get_content();
					$strParse = $colNode->get_attribute("noparse");
					if($strParse!="1")
						$strValue = _swm_parse_string($strValue);
					$strHTML .= 	"<input type='hidden' name='"._html_encode($strColName)."' id='"._html_encode($strColName)."' value='"._html_encode($strValue)."'>";
				}
			}
		}
		return $strHTML;
	}
?>