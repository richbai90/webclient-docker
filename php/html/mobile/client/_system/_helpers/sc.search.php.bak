<?php 
	function _output_sc_catalog($service_id = "",$strOtherInputs = "")
	{
		$strOtherInputs .= 	"<input type='hidden' name='cmdbsearchmode' id='cmdbsearchmode' value='"._html_encode($cmdbsearchmode)."'>";
		$strOtherInputs .= 	"<input type='hidden' name='cmdbsearchcriteria' id='cmdbsearchcriteria' value='".($cmdbsearchcriteria)."'>";
		$strOtherInputs .= 	"<input type='hidden' name='flgnocmdb' id='flgnocmdb' value='0'>";

		if($service_id=="")
		{
			$strOtherInputs .= 	"<input type='hidden' name='subsc' id='subsc' value='0'>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_itsm_fk_service' id='opencall_itsm_fk_service' value='0'>";
			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string("select keysearch,fk_company_id,site,department,subdepartment from userdb where keysearch='"._swm_db_pfs($_POST['opencall_cust_id'])."'");
			$rsData->query("swdata",$strSQL,true,null);

			//-- check if there is any data
			if(!$rsData->eof())
			{
				$strKeysearch =	$rsData->EmbedDataIntoString("rs","[:rs.keysearch.value]");
				$strCompanyId =	$rsData->EmbedDataIntoString("rs","[:rs.fk_company_id.value]");
				$strSite =	$rsData->EmbedDataIntoString("rs","[:rs.site.value]");
				$strDepartment =	$rsData->EmbedDataIntoString("rs","[:rs.department.value]");
				$strSubDepartment =	$rsData->EmbedDataIntoString("rs","[:rs.subdepartment.value]");
			}


			$strIDs = _get_subscription_ids($strKeysearch,$strCompanyId,$strSite,$strDepartment,$strSubDepartment);
			$strSQL = "select config_itemi.ck_config_item,config_itemi.pk_auto_id,sc_subscription.pk_id from config_itemi,sc_subscription where fk_service=config_itemi.pk_auto_id and REL_TYPE='SUBSCRIPTION' and pk_id in (".$strIDs.")";

			$rsData = new _swm_rs();
			$rsData->query("swdata",$strSQL,true,null);

			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Subscribed Service</span></span></div><table width='100%'>";
			$template = "<tr style='cursor:pointer;' onclick='_set_sc_service(this);' subsc='[:rs.pk_id.htmlvalue]' serviceid='[:rs.pk_auto_id.htmlvalue]'>
				<td width='100%'>[:rs.ck_config_item.htmlvalue]</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>";
			if(!$rsData->eof())
			{
				//-- check if there is any data
				while(!$rsData->eof())
				{
					$strHTML .=	$rsData->EmbedDataIntoString("rs",$template);
					$rsData->movenext();
				}
			}
			else
			{
				$strHTML .= "No Services available for this customer.";
			}

			$strHTML .= "</table>";
		}
		else
		{
			$strOtherInputs .= 	"<input type='hidden' name='subsc' id='subsc' value='".$_POST['subsc']."'>";
			$reqQty = 1;
			if(isset($_POST['opencall_request_qty']))
				$reqQty = $_POST['opencall_request_qty'];
			$strOtherInputs .= 	"<input type='hidden' name='opencall_itsm_fk_service' id='opencall_itsm_fk_service' value='"._html_encode($service_id)."'>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_request_qty' id='opencall_request_qty' value='"._html_encode($reqQty)."'>";
			$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Subscribed Service</span></span></div><table width='100%'>";
			$strHTML .= "<tr>
				<td width='25%'>[:rs.ck_config_item.value]</td><td></td>
			</tr><tr><td>Quantity</td><td width='25%'><input type='text' onchange='var oHolder=document.getElementById(\'opencall_request_qty\');oHolder.value=this.value;' value='"._html_encode($reqQty)."'></td></tr></table>";

			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string("select * from config_itemi where pk_auto_id=".$service_id);
			$rsData->query("swdata",$strSQL,true,null);

			//-- check if there is any data
			if(!$rsData->eof())
			{
				$strHTML =	$rsData->EmbedDataIntoString("rs",$strHTML);
			}
			
			$boolFirst = true;
			$components = ($_POST['sc_options']);
			if($components!="")
			{
				$boolFirst = false;
				$strSQL = "select * from sc_rels where pk_auto_id in (".$components.")";
			}else
			{
				$strSQL = "select * from sc_rels where ". $service_id." = fk_service and apply_type='Per Request' and cost_type = 'component' and (flg_isoptional=1 or flg_isoptional IS NULL or flg_isoptional='')";
			}
			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string($strSQL);
			$rsData->query("swdata",$strSQL,true,null);

			$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Current Components</span></span></div>";
			$strHTML .="<table>";
			if($boolFirst)
				$components = "";

			$arrComps = array();
			//-- check if there is any data
			while(!$rsData->eof())
			{
				$strPK =	$rsData->EmbedDataIntoString("rs","[:rs.pk_auto_id.value]");
				$strDesc =	$rsData->EmbedDataIntoString("rs","[:rs.description.htmlvalue]");
				$arrComps[$strPK] = $strDesc;
				if($boolFirst)
				{
					if($components!="")$components.=",";
					$components .=$strPK;
				}
				$strTemplate = "<tr>
					<td width='100%'>[:rs.description.htmlvalue]</td>
				</tr>";
				$strHTML .= $rsData->EmbedDataIntoString("rs",$strTemplate);
				$rsData->movenext();
			}
			$strHTML .="</table>";

			if($components!="")
			{
				$strSQL = "select * from sc_rels where fk_service_rels in (".$components.") order by fk_service_rels asc";

				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query("swdata",$strSQL,true,null);
				if(!$rsData->eof())
				{
					$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Select Upgrading Components</span></span></div>";

					$strHTML .="<table>";
					//-- check if there is any data
					while(!$rsData->eof())
					{
						$strPK =	$rsData->EmbedDataIntoString("rs","[:rs.pk_auto_id.value]");
						$strReplacePK =	$rsData->EmbedDataIntoString("rs","[:rs.fk_service_rels.value]");
						$strTemplate = "<tr style='cursor:pointer;' replaceid='[:rs.fk_service_rels.value]' optionid='[:rs.pk_auto_id.value]' onclick='_sc_replace_option(this);'>
							<td width='50%'>Replace '".$arrComps[$strReplacePK]."' with:</td>
							<td width='100%'>[:rs.description.htmlvalue]</td>
							<td><img src='client/_system/images/icons/arrow.jpg'></td>
						</tr>";
						$strHTML .= $rsData->EmbedDataIntoString("rs",$strTemplate);
						$rsData->movenext();
					}
					$strHTML .="</table>";
				}
			}
			
			if($boolFirst)
			{
				$strSQL = "select * from sc_rels where ".$service_id." = fk_service and apply_type='Per Request' and cost_type = 'component' and (flg_isoptional=0)";
			}
			else
			{
				$strSQL = "select * from sc_rels where ".$service_id." = fk_service and apply_type='Per Request' and cost_type = 'component' and (flg_isoptional=0) and pk_auto_id not in (".$components.")";
			}

			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string($strSQL);
			$rsData->query("swdata",$strSQL,true,null);
			if(!$rsData->eof())
			{
				$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Add Optional Components</span></span></div>";

				$strHTML .="<table>";
				//-- check if there is any data
				while(!$rsData->eof())
				{
					$strPK =	$rsData->EmbedDataIntoString("rs","[:rs.pk_auto_id.value]");
					$strTemplate = "<tr style='cursor:pointer;' optionid='[:rs.pk_auto_id.value]' onclick='_sc_add_option(this);'>
						<td width='100%'>[:rs.description.htmlvalue]</td>
						<td><img src='client/_system/images/icons/arrow.jpg'></td>
					</tr>";
					$strHTML .= $rsData->EmbedDataIntoString("rs",$strTemplate);
					$rsData->movenext();
				}
				$strHTML .="</table>";
			}
			
			$strOtherInputs .= 	"<input type='hidden' name='sc_options' id='sc_options' value='".$components."'>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_itsm_fk_service' id='opencall_itsm_fk_service' value='".$service_id."'>";
		}

		echo $strHTML;
		?>
			<form id='frmSCsearch' target="_self" method='post' action='index.php' >
			<input type='hidden' name='_action' id='_action' value='_navig'>
			<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
			<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__originfilepath']);?>'>
			<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
			<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
			<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
			<?php echo $strOtherInputs;?>
		</form>
		<?php 			
	}

	function _get_sc_next_button($strEntityVal)
	{
		$strHTML = "<table><tr>";
		$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
		$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_lc_sc_next('"._html_encode($strEntityVal)."');\" href=\"#\">";
		$strHTML .=	"						 <span id=\"buttonHolder\" class='ibuttonbg'>";
		$strHTML .=	"							 <img class=\"i_laimg\" src='client/_system/images/icons/ilb.jpg'/>";
		$strHTML .=	"								 <span id=\"_menuRBText\" class=\"itextHolder ibuttonbg\">";
		$strHTML .=	"									&nbsp;Next";
		$strHTML .=	"								 </span>";
		$strHTML .=	"							 <img class=\"i_rimg\" src='client/_system/images/icons/irb.jpg'/>";
		$strHTML .=	"						</span>";
		$strHTML .=	"					 </a>";
		$strHTML .=	"				</td></tr></table>";
		return $strHTML;
	}


	function _get_subscription_ids($strKeysearch= "",$strCompanyId= "",$strSite= "",$strDepartment= "",$strSubDepartment= "")
	{
		$strIDs = "-1";
		$strServiceIDs = "-1";

		$strSQL = "select pk_id,fk_service from sc_subscription where REL_TYPE='SUBSCRIPTION' and fk_me_table = 'userdb' and fk_me_key = '"._swm_db_pfs($strKeysearch)."'";
		$rsData = new _swm_rs();
		$rsData->query("swdata",$strSQL,true,null);
		//-- check if there is any data
		while(!$rsData->eof())
		{
			if($strIDs!="")$strIDs.=",";
			$strID = $rsData->EmbedDataIntoString("rs","[:rs.pk_id.value]");
			$strIDs.=$strID;

			if($strServiceIDs!="")$strServiceIDs.=",";
			$strServiceID = $rsData->EmbedDataIntoString("rs","[:rs.fk_service.value]");
			$strServiceIDs.=$strServiceID;

			$rsData->movenext();
		}

		$strSQL = "select pk_id from sc_subscription where fk_service not in (".$strServiceIDs.") and REL_TYPE='SUBSCRIPTION' and fk_me_table = 'department' and fk_me_key = '"._swm_db_pfs($strDepartment)."'";
		$rsData = new _swm_rs();
		$rsData->query("swdata",$strSQL,true,null);
		//-- check if there is any data
		while(!$rsData->eof())
		{
			if($strIDs!="")$strIDs.=",";
			$strID = $rsData->EmbedDataIntoString("rs","[:rs.pk_id.value]");
			$strIDs.=$strID;

			if($strServiceIDs!="")$strServiceIDs.=",";
			$strServiceID = $rsData->EmbedDataIntoString("rs","[:rs.fk_service.value]");
			$strServiceIDs.=$strServiceID;

			$rsData->movenext();
		}

		$strSQL = "select pk_id from sc_subscription where fk_service not in (".$strServiceIDs.") and REL_TYPE='SUBSCRIPTION' and fk_me_table = 'site' and fk_me_key = '"._swm_db_pfs($strSite)."'";
		$rsData = new _swm_rs();
		$rsData->query("swdata",$strSQL,true,null);
		//-- check if there is any data
		while(!$rsData->eof())
		{
			if($strIDs!="")$strIDs.=",";
			$strID = $rsData->EmbedDataIntoString("rs","[:rs.pk_id.value]");
			$strIDs.=$strID;

			if($strServiceIDs!="")$strServiceIDs.=",";
			$strServiceID = $rsData->EmbedDataIntoString("rs","[:rs.fk_service.value]");
			$strServiceIDs.=$strServiceID;

			$rsData->movenext();
		}

		$strSQL = "select pk_id from sc_subscription where fk_service not in (".$strServiceIDs.") and REL_TYPE='SUBSCRIPTION' and fk_me_table = 'company' and fk_me_key = '"._swm_db_pfs($strCompanyId)."'";
		$rsData = new _swm_rs();
		$rsData->query("swdata",$strSQL,true,null);
		//-- check if there is any data
		while(!$rsData->eof())
		{
			if($strIDs!="")$strIDs.=",";
			$strID = $rsData->EmbedDataIntoString("rs","[:rs.pk_id.value]");
			$strIDs.=$strID;

			if($strServiceIDs!="")$strServiceIDs.=",";
			$strServiceID = $rsData->EmbedDataIntoString("rs","[:rs.fk_service.value]");
			$strServiceIDs.=$strServiceID;

			$rsData->movenext();
		}
		return $strIDs;
	}
?>