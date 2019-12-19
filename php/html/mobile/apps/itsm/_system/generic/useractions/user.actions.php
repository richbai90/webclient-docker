<?php

function get_log_html($strCallclass)
	{
		if($strCallclass=="Incident")
		{
			$strGroup = "B";
			$strRight = "1";
			$strCallTypeFolder="incidents";
		}
		elseif($strCallclass=="Change Request")
		{
			$strGroup = "D";
			$strRight = "1";
			$strCallTypeFolder="changes";
		}
		elseif($strCallclass=="Problem")
		{
			$strGroup = "C";
			$strRight = "1";
			$strCallTypeFolder="problems";
		}
		elseif($strCallclass=="Service Request")
		{
			$strGroup = "H";
			$strRight = "11";
			$strCallTypeFolder="servicerequests";
		}

		$boolContinue = true;
		if($strGroup!="")
		{
			$boolContinue = haveappright($strGroup,$strRight);
		}

		if($boolContinue)
		{
			$parseHTMLContent .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' ";
			$parseHTMLContent .=	'					onclick="_process_navigation(\'[:_swm_app_path]/views/servicedesk/'.$strCallTypeFolder.'/log.settings.xml\')">';
			$parseHTMLContent .="<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
												Log $strCallclass
											</span>
										</td>
										<td><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr>								<tr>
									<td colspan='3'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
							</table>";
		}	

		return $parseHTMLContent;
	}

function get_user_cis($keysearch)
{
	//-- Get "Used" CI IDs
	$strSQL = _swm_parse_string("select fk_ci_id from config_relme, config_itemi where fk_ci_id = config_itemi.pk_auto_id and fk_me_key in ('"._swm_db_pfs($keysearch)."') and code='CUSTOMER'");
	$uCIRS = new _swm_rs();
	$uCIRS->query("swdata",$strSQL,true,null);

	$strCIs="";
	while(!$uCIRS->eof())
	{
		if($strCIs!="")
			$strCIs .= ",";
		$strCIs .= $uCIRS->EmbedDataIntoString("rs","[:rs.fk_ci_id.htmlvalue]");
		$uCIRS->movenext();
	}
	
	//-- Get "Owned" CI IDs
	$strSQL = _swm_parse_string("select pk_auto_id from config_itemi where fk_userdb in ('"._swm_db_pfs($keysearch)."')");
	$uOIRS = new _swm_rs();
	$uOIRS->query("swdata",$strSQL,true,null);

	while(!$uOIRS->eof())
	{
		if($strCIs!="")
			$strCIs .= ",";
		$strCIs .= $uOIRS->EmbedDataIntoString("rs","[:rs.pk_auto_id.htmlvalue]");
		$uOIRS->movenext();
	}

	//-- Get CIs matching above IDs
	$strSQL = _swm_parse_string("select pk_auto_id, ck_config_item from config_itemi where pk_auto_id IN ("._swm_db_pfs($strCIs).") order by ck_config_item asc");
	$retRS = new _swm_rs();
	$retRS->query("swdata",$strSQL,true,null);

	$parseHTMLContent = "";
	while(!$retRS->eof())
	{
		
			$parseHTMLContent .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' ";
			$parseHTMLContent .=	"_cmdb_id='".$retRS->EmbedDataIntoString("rs","[:rs.pk_auto_id.htmlvalue]")."' onclick='_open_cmdb_details(this);' >";
			$parseHTMLContent .="<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">";
			$parseHTMLContent .=				$retRS->EmbedDataIntoString("rs","[:rs.ck_config_item.htmlvalue]");
			$parseHTMLContent .="			</span>
										</td>
										<td><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr>								<tr>
									<td colspan='3'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
							</table>";
		$retRS->movenext();
	}
		

		return $parseHTMLContent;
}

?>