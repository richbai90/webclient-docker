<?php 
	function _cmdb_search($cmdb_id = "",$mandatory = 1,$cmdbsearchmode = 0,$cmdbsearchcriteria = "",$strOtherInputs = "",$strDestination = "opencall_equipment",$strItems="")
	{
		$strOtherInputs .= 	"<input type='hidden' name='cmdbsearchmode' id='cmdbsearchmode' value='"._html_encode($cmdbsearchmode)."'>";
		$strOtherInputs .= 	"<input type='hidden' name='cmdbsearchcriteria' id='cmdbsearchcriteria' value='"._html_encode($cmdbsearchcriteria)."'>";
		$strOtherInputs .= 	"<input type='hidden' name='flgnocmdb' id='flgnocmdb' value='0'>";

		if($cmdbsearchmode==0)
		{
			if(strpos($strOtherInputs,$strDestination)===false)
				$strOtherInputs .= 	"<input type='hidden' name='"._html_encode($strDestination)."' id='"._html_encode($strDestination)."' value='"._html_encode($strItems)."'>";

			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Associated Configuration Item</span></span></div><table width='100%'>
			<tr style='cursor:pointer;' onclick='_set_cmdb_searchmode(this);' mode='1'>
				<td width='100%'>by Category</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>
			<tr style='cursor:pointer;' onclick='_set_cmdb_searchmode(this);' mode='2'>
				<td width='100%'>by Configuration ID</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>
			<tr style='cursor:pointer;' onclick='_set_cmdb_searchmode(this);' mode='3'>
				<td width='100%'>by Description</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>
			<tr style='cursor:pointer;' onclick='_set_cmdb_searchmode(this);' mode='4'>
				<td width='100%'>by Status</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>";
			if($mandatory==0)
			{
				$strHTML .= "<tr style='cursor:pointer;' onclick='_set_cmdb_searchmode(this);' mode='5'>
					<td width='100%'>Skip</td>
					<td><img src='client/_system/images/icons/arrow.jpg'></td>
				</tr>
				<tr>
					<td colspan='2'>
						<div class='seperator'><div style='display:none;'></div></div>
					</td>
				</tr>";
			}
			$strHTML .= "</table>";
		}elseif($cmdbsearchmode==1)
		{
			 $strHTML = _get_category_list($cmdbsearchcriteria,$strDestination);
		}
		elseif($cmdbsearchmode==2)
		{
			 $strHTML =  _get_alpha_ciid_list($cmdbsearchcriteria,$strDestination);
		}
		elseif($cmdbsearchmode==3)
		{
			 $strHTML =  _get_alpha_description_list($cmdbsearchcriteria,$strDestination);
		}
		elseif($cmdbsearchmode==4)
		{
			 $strHTML =  _get_cmdb_status_list($cmdbsearchcriteria,$strDestination);
		}
		echo $strHTML;

		$strOrigin = $_POST['pp__originfilepath'];
		
		if($strOrigin=="")
		{
			$strOrigin= "[:_swm_app_path]/views/assets/search.xml";
		}
		$strDefin = $_POST['pp__definitionfilepath'];
		
		if($strDefin=="")
		{
			$strDefin= "[:_swm_app_path]/views/assets/search.xml";
		}
		?>
			<form id='frmCMDBsearch' target="_self" method='post' action='index.php' >
			<input type='hidden' name='_action' id='_action' value='_navig'>
			<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($strDefin);?>'>
			<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($strOrigin);?>'>
			<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
			<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
			<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
			<?php echo $strOtherInputs;?>
		</form>
		<?php 			
	}


	function _get_category_list($criteria,$strDestination)
	{
		if($criteria=="")
		{
			$strSQL = "select distinct(pk_config_type),config_typei.type_display from config_itemi, config_typei where ck_config_type=pk_config_type and pk_config_type not like 'ME->%'";

			$strSQL = "select pk_config_type,config_typei.type_display from config_typei where pk_config_type !='ME' and (fk_config_type='' or fk_config_type is null)";

			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>By Category</span></span></div><table width='100%'>";
			$template = "<tr style='cursor:pointer;' criteria='[:rs.pk_config_type.htmlvalue]' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>[:rs.type_display.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='2'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string($strSQL);
			$rsData->query("swdata",$strSQL,true,null);

			//-- check if there is any data
			if($rsData->eof())
			{
					$strOutputHTML = "There is no data available";
			}
			else
			{
				while(!$rsData->eof())
				{
					$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
					$rsData->movenext();
				}
			}
			$strHTML .= "</table>";
		}
		else
		{
			$strSQL = "select pk_config_type,flg_item,fk_config_type from config_typei where pk_config_type = '".$criteria."'";

			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string($strSQL);
			$rsData->query("swdata",$strSQL,true,null);
			$strItem.=	$rsData->EmbedDataIntoString("rs","[:rs.flg_item.value]");

			$strFKConfigtype.=	$rsData->EmbedDataIntoString("rs","[:rs.fk_config_type.value]");

			//-- if not an item
			if($strItem!="1")
			{
				$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Back </span></span></div><table width='100%'>";

				$template = "<tr style='cursor:pointer;' criteria='[:rs.pk_config_type.htmlvalue]' onclick='_set_cmdb_searchcriteria(this);'><td><img src='client/_system/images/icons/left_arrow.jpg'></td><td width='100%'>[:rs.type_display.htmlvalue]</td></tr>";
			
				$strSQL = "select pk_config_type,type_display from config_typei where pk_config_type = '".$strFKConfigtype."'";
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query("swdata",$strSQL,true,null);

				//-- check if there is any data
				if($rsData->eof())
				{
					$strHTML .= "<tr style='cursor:pointer;' criteria='' onclick='_set_cmdb_searchcriteria(this);'><td><img src='client/_system/images/icons/left_arrow.jpg'></td><td width='100%'>Top Level</td></tr>";
				}
				else
				{
					while(!$rsData->eof())
					{
						$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
						$rsData->movenext();
					}
				}
				$strHTML .= "</table>";


				$strSQL = "select pk_config_type,type_display from config_typei where fk_config_type = '".$criteria."' and (flg_item=0 or flg_item is null)";
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query("swdata",$strSQL,true,null);

				//-- check if there is any data
				if($rsData->eof())
				{
						$strOutputHTML = "There is no data available";
				}
				else
				{
					while(!$rsData->eof())
					{
						$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Category </span></span></div><table width='100%'>";
						$template = "<tr style='cursor:pointer;' criteria='[:rs.pk_config_type.htmlvalue]' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>[:rs.type_display.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

						$rsData = new _swm_rs();
						$strSQL = _swm_parse_string($strSQL);
						$rsData->query("swdata",$strSQL,true,null);

						//-- check if there is any data
						if($rsData->eof())
						{
								$strOutputHTML = "There is no data available";
						}
						else
						{
							while(!$rsData->eof())
							{
								$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
								$rsData->movenext();
							}
						}
						$strHTML .= "</table>";
					}
				}
				$strSQL = "select pk_config_type,type_display from config_typei where fk_config_type = '".$criteria."' and flg_item=1";
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query("swdata",$strSQL,true,null);

				//-- check if there is any data
				if($rsData->eof())
				{
						$strOutputHTML = "There is no data available";
				}
				else
				{
					while(!$rsData->eof())
					{
						$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Type </span></span></div><table width='100%'>";
						$template = "<tr style='cursor:pointer;' criteria='[:rs.pk_config_type.htmlvalue]' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>[:rs.type_display.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

						$rsData = new _swm_rs();
						$strSQL = _swm_parse_string($strSQL);
						$rsData->query("swdata",$strSQL,true,null);

						//-- check if there is any data
						if($rsData->eof())
						{
								$strOutputHTML = "There is no data available";
						}
						else
						{
							while(!$rsData->eof())
							{
								$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
								$rsData->movenext();
							}
						}
						$strHTML .= "</table>";
					}
				}

			}
			else
			{
				$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Back </span></span></div><table width='100%'><table>";
				
				$template = "<tr style='cursor:pointer;' criteria='[:rs.pk_config_type.htmlvalue]' onclick='_set_cmdb_searchcriteria(this);'><td><img src='client/_system/images/icons/left_arrow.jpg'></td><td width='100%'>[:rs.type_display.htmlvalue]</td></tr>";
			
				$strSQL = "select pk_config_type,type_display from config_typei where pk_config_type = '".$strFKConfigtype."'";
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query("swdata",$strSQL,true,null);

				//-- check if there is any data
				if($rsData->eof())
				{
					$strHTML .= "";
				}
				else
				{
					while(!$rsData->eof())
					{
						$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
						$rsData->movenext();
					}
				}
				$strHTML .= "</table>";


				$strSQL = "select pk_auto_id, ck_config_item, ck_config_type from config_itemi where isactivebaseline='Yes' and ck_config_type='"._swm_db_pfs($criteria)."'";
				$strHTML .= _get_ci_list($strSQL,$strDestination,_swm_db_pfs($criteria));
			}
		
		}

		return $strHTML;

	}

	function _get_alpha_ciid_list($criteria,$strDestination)
	{
		if($criteria=="")
		{
			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search CMDB by Configuration ID starting with:</span></span></div><table width='100%'>";

			$strHTML .= "<tr><td width='50%'><input type='text' name='txt_search' id='txt_search'></td></tr><tr>";
			$strHTML .= "<tr>";
			$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
			$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_set_cmdb_searchname(this);\" href=\"#\">";
			$strHTML .=	"						 <span id=\"buttonHolder\" class='ibuttonbg'>";
			$strHTML .=	"							 <img class=\"i_laimg\" src='client/_system/images/icons/ilb.jpg'/>";
			$strHTML .=	"								 <span id=\"_menuRBText\" class=\"itextHolder ibuttonbg\">";
			$strHTML .=	"									&nbsp;Search";
			$strHTML .=	"								 </span>";
			$strHTML .=	"							 <img class=\"i_rimg\" src='client/_system/images/icons/irb.jpg'/>";
			$strHTML .=	"						</span>";
			$strHTML .=	"					 </a>";
			$strHTML .=	"				</td></tr></table>";

		}
		else
		{
			$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Back </span></span></div><table width='100%'><table>";
			
			$strHTML .= "<tr style='cursor:pointer;' criteria='' onclick='_set_cmdb_searchcriteria(this);'><td><img src='client/_system/images/icons/left_arrow.jpg'></td><td width='100%'>Configuration ID selector</td></tr></table>";

			$strSQL = "select pk_auto_id, ck_config_item, ck_config_type from config_itemi where isactivebaseline='Yes' and ck_config_type not like 'ME->%' and ck_config_item like '"._swm_db_pfs($criteria)."%'";
			$strHTML .= _get_ci_list($strSQL,$strDestination,"Item ID like '"._swm_db_pfs($criteria)."'");
		}

		return $strHTML;
	}

	function _get_cmdb_status_list($criteria,$strDestination)
	{
		if($criteria=="")
		{
			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>By Status</span></span></div><table width='100%'>";
			
			$strHTML .= "<tr style='cursor:pointer;' criteria='Active' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>Active</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			$strHTML .= "<tr style='cursor:pointer;' criteria='Faulty' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>Faulty</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			$strHTML .= "<tr style='cursor:pointer;' criteria='Impacted' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>Impacted</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			$strHTML .= "<tr style='cursor:pointer;' criteria='Unavailable' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>Unavailable</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			$strHTML .= "<tr style='cursor:pointer;' criteria='Deactivated' onclick='_set_cmdb_searchcriteria(this);'><td width='100%'>Deactivated</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";
		
			$strHTML .= "</table>";
		}
		else
		{
			$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Back </span></span></div><table width='100%'><table>";
			
			$strHTML .= "<tr style='cursor:pointer;' criteria='' onclick='_set_cmdb_searchcriteria(this);'><td><img src='client/_system/images/icons/left_arrow.jpg'></td><td width='100%'>Status Selector</td></tr></table>";
			
			$strSQL = "select pk_auto_id, ck_config_item, ck_config_type from config_itemi where isactivebaseline='Yes' and ck_config_type not like 'ME->%' and cmdb_status = '"._swm_db_pfs($criteria)."'";
			$strHTML .= _get_ci_list($strSQL,$strDestination,_swm_db_pfs($criteria));
		}

		return $strHTML;
	}


	function _get_alpha_description_list($criteria,$strDestination)
	{
		if($criteria=="")
		{
			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search CMDB by Description starting with:</span></span></div><table width='100%'>";

			$strHTML .= "<tr><td width='50%'><input type='text' name='txt_search' id='txt_search'></td></tr><tr>";
			$strHTML .= "<tr>";
			$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
			$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_set_cmdb_searchname(this);\" href=\"#\">";
			$strHTML .=	"						 <span id=\"buttonHolder\" class='ibuttonbg'>";
			$strHTML .=	"							 <img class=\"i_laimg\" src='client/_system/images/icons/ilb.jpg'/>";
			$strHTML .=	"								 <span id=\"_menuRBText\" class=\"itextHolder ibuttonbg\">";
			$strHTML .=	"									&nbsp;Search";
			$strHTML .=	"								 </span>";
			$strHTML .=	"							 <img class=\"i_rimg\" src='client/_system/images/icons/irb.jpg'/>";
			$strHTML .=	"						</span>";
			$strHTML .=	"					 </a>";
			$strHTML .=	"				</td></tr></table>";

		}
		else
		{
			$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Back </span></span></div><table width='100%'><table>";
			
			$strHTML .= "<tr style='cursor:pointer;' criteria='' onclick='_set_cmdb_searchcriteria(this);'><td><img src='client/_system/images/icons/left_arrow.jpg'></td><td width='100%'>Configuration Description Selector</td></tr></table>";

			$strSQL = "select pk_auto_id, ck_config_item, ck_config_type from config_itemi where isactivebaseline='Yes' and ck_config_type not like 'ME->%' and description like '"._swm_db_pfs($criteria)."%'";
			$strHTML .= _get_ci_list($strSQL,$strDestination,"Item Description like '"._swm_db_pfs($criteria)."'");
		}

		return $strHTML;
	}

	
	function _get_ci_list($strSQL,$strDestination, $strTitle="Search Configuration Item")
	{
		$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>$strTitle</span></span></div><table width='100%'>";
		$template = "<tr style='cursor:pointer;' pk_cmdb_id='[:rs.pk_auto_id.value]' target='"._html_encode($strDestination)."' onclick='_set_cmdb_search(this);'><td width='50%'>[:rs.ck_config_item.htmlvalue]</td><td width='50%'>[:rs.ck_config_type.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";


		$i = 0;
		$limit = -1;
		if(defined("ME_SEARCH_LIMIT"))
		{
			$limit = ME_SEARCH_LIMIT;
		}
		$rsData = new _swm_rs();
		$strSQL = _swm_parse_string($strSQL);
		$rsData->query("swdata",$strSQL,true,null);

		//-- check if there is any data
		if($rsData->eof())
		{
				$strHTML .= "There are no CIs matching your search query.";
		}
		else
		{
			while(!$rsData->eof())
			{
				if($i==$limit)
				{
					$strHTML.=	 "<tr><td colspan='3'>&nbsp;</td></tr><tr><td colspan='3'><center>There are more than ".$limit." results, please refine your search</center></td></tr>";
					break;
				}
				$i++;
				$strHTML.=	$rsData->EmbedDataIntoString("rs",$template);
				$rsData->movenext();
			}
		}
		$strHTML .= "</table>";
		return $strHTML;
	}

	function _get_cmdb_next_button($strEntityVal)
	{
		$strHTML = "<table><tr>";
		$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
		$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_lc_cmdb_next('"._html_encode($strEntityVal)."');\" href=\"#\">";
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
?>