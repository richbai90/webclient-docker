<?php
	include_once("callactions/call.actions.php");
	//-- call xmlc to query db
	$callref=$_POST['_callref'];
	
	// -- Query opencall.callref if _callref is numeric
	if(ctype_digit($callref))
	{
		$retRS = new _swm_rs();
		$strSQL = _swm_parse_string("select * from opencall where callref="._swm_db_pfs($callref));
		$retRS->query("syscache",$strSQL,true,null);
	}
	// -- Query opencall.h_formattedcallref if _callref contains non-numeric
	else
	{
		$retRS = new _swm_rs();
		$strSQL = _swm_parse_string("select * from opencall where h_formattedcallref='"._swm_db_pfs($callref)."'");
		$retRS->query("syscache",$strSQL,true,null);
	}

	$strStage = ($retRS->EmbedDataIntoString("rs","[:rs.bpm_stage_id.value]"));
	$intAwaitingAuth = ($retRS->EmbedDataIntoString("rs","[:rs.bpm_waitingauth.value]"));
	//-- Get current call bpm status value
	$strSQL = "select flg_disable_manual from bpm_stage where pk_stage_id=".$strStage;
	$rsData = new _swm_rs();
	$strSQL = _swm_parse_string($strSQL);
	$rsData->query($strDB,$strSQL,true,null);
	$intDisableManual = 0;
	//-- check if there is any data
	if($rsData->eof())
	{
			$strOutputHTML = "There is no data available";
	}
	else
	{
		if(!$rsData->eof())
		{
			$intDisableManual =	$rsData->EmbedDataIntoString("rs","[:rs.flg_disable_manual.value]");
		}
	}

	$boolStatusChange = true;
	if($intDisableManual==1)
		$boolStatusChange = false;
	if($intAwaitingAuth==1)
		$boolStatusChange = false;

	function lang_decode_to_utf($strValue)
	{
		if(function_exists("iconv"))
			return iconv('Windows-1252','UTF-8',$strValue);
		return $strValue;
	}

	$rawHTMLContent = "";
	if(!$retRS->eof())
	{
		$strWorkflow = ($retRS->EmbedDataIntoString("rs","[:rs.bpm_workflow_id.value]"));
		$strKeysearch = ($retRS->EmbedDataIntoString("rs","[:rs.cust_id.value]"));
		$strStatus = ($retRS->EmbedDataIntoString("rs","[:rs.status.value]"));
		$strCallclass = ($retRS->EmbedDataIntoString("rs","[:rs.callclass.value]"));
		
		$strCustHTML = "";
		
		$retUserdb = new _swm_rs();
		if($strKeysearch!="")
		{
			$strSQL = _swm_parse_string("select * from userdb where keysearch='".lang_encode_from_utf(_swm_db_pfs($strKeysearch))."'");
			$retUserdb->query("swdata",$strSQL,false,null);
			if(!$retUserdb->eof())
			{
				$strCustHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Customer</span></span></div>";
				$strCustHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' onclick='_open_cust_details(this);' keysearch='"._html_encode($strKeysearch)."' xmlpath='[:_swm_app_path]/generic/customer.detail.xml'>
										<td width='3%'>
										</td>
										<td width='50%'>
											<table width='100%' class='calldetail'>
												<tr>
													<td class='nmlfontsize' width='50%'>[:rs.fullname.htmlvalue]</td>
												</tr>
												<tr>
													<td width='50%'>[:rs.email.htmlvalue]</td>
												</tr>
											</table>
										</td>
										<td width='45%' align='right'>[:rs.telext.htmlvalue]</td>
										<td><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr></table>";
			}else
			{
				$strCustHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Customer</span></span></div>";
				$strCustHTML .= "The customer '"._html_encode($strKeysearch)."' could not be loaded.";
			}
		}

		$rawHTMLContent = "<input type='hidden' name='menutitle' id='menutitle' title='[:rs.h_formattedcallref.formattedvalue]'>";
		$rawHTMLContent .= $strCustHTML;
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Description</span></span></div>";
		$rawHTMLContent .= "<table class='calldetail' width='100%'>
								<tr>
									<td width='3%'>
									</td>
									<td width='97%'>
										[:rs.itsm_title.htmlvalue]
									</td>
								</tr>
								<tr>
									<td colspan='4'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
								<tr style='cursor:pointer;'  onclick='_open_call_diary(this,true);'>
									<td width='3%'>
									</td>
									<td width='100%' class='nmlfontsize' colspan='2'>Details</td>
									<td><img src='client/_system/images/icons/arrow.jpg'></td>
								</tr>
								<tr>
									<td colspan='4'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
								<tr style='cursor:pointer;'  onclick='_open_call_diary(this);'>
									<td width='3%'>
									</td>
									<td width='100%' class='nmlfontsize' colspan='2'>Diary</td>
									<td><img src='client/_system/images/icons/arrow.jpg'></td>
								</tr>
							</table>";
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Service Level</span></span></div>";
		$rawHTMLContent .= "<table class='calldetail' width='100%'>
								<tr>
									<td width='3%'>
									</td>
									<td width='100%' class='boldcalldetail' colspan='3'>
										<table class='calldetail' width='100%'>
											<tr>
												<td width='3%'>
												</td>
												<td width='20%' align='right'>SLA:</td>
												<td>[:rs.itsm_slaname.htmlvalue]</td>
											</tr>
											<tr>
												<td width='3%'>
												</td>
												<td width='15%' align='right'>Priority:</td>
												<td>[:rs.priority.htmlvalue]</td>
											</tr>
											<tr>
												<td width='3%'>
												</td>
												<td width='25%' align='right'>
												Status:
												</td>
												<td width='97%'>
													[:rs.status.formattedvalue]
												</td>
											</tr>		
											<tr>
												<td width='3%'>
												</td>
												<td width='25%' align='right'>
												Respond By:
												</td>
												<td width='97%'>
													[:rs.respondbyx.formattedvalue]
												</td>
											</tr>		
											<tr>
												<td width='3%'>
												</td>
												<td width='25%' align='right'>
													Fix By:
												</td>
												<td width='97%'>
													[:rs.fixbyx.formattedvalue]
												</td>
											</tr>		
										</table>
									</td>
								</tr>
								</table>";

		if($strWorkflow!="")
		{
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Process Details</span></span></div><table class='calldetail' width='100%'>
								<tr>
									<td width='3%'>
									</td>
									<td width='50%'>Workflow</td>
									<td>[:rs.bpm_workflow_id.htmlvalue]</td>
								</tr>
								<tr>
									<td colspan='4'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
								<tr>
									<td width='3%'>
									</td>
									<td width='50%'>Stage</td>
									<td>[:rs.bpm_stage_title.htmlvalue]</td>
								</tr>
								<tr>
									<td colspan='4'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
								<tr>
									<td width='3%'>
									</td>
									<td width='50%'>Status</td>
									<td>[:rs.bpm_status_id.htmlvalue]</td>
								</tr>";

								if($boolStatusChange)
								{
									$rawHTMLContent .= "<tr>
									<td colspan='4'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr><tr style='cursor:pointer;'  action='Status Update' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='50%'>
											<span class=\"blackfont nmlfontsize\">
											Update BPM Status
											</span>
										</td>
										<td align='right'><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr>";
								}

								$rawHTMLContent .= "</table>";

		}

		$parseHTMLContent = ($retRS->EmbedDataIntoString("rs",$rawHTMLContent));
		$parseHTMLContent = ($retUserdb->EmbedDataIntoString("rs",$parseHTMLContent));
	

		$strCallref = $retRS->EmbedDataIntoString("rs","[:rs.h_formattedcallref.formattedvalue]");
		$parseHTMLContent .= get_status_actions($strStatus,$strCallref,null,$strCallclass);
		$strOtherInputs = "<input type='hidden' name='_callref' id='_callref' value='"._html_encode($_POST['_callref'])."'>";
		$strOtherInputs .= "<input type='hidden' name='_callreffmt' id='_callreffmt' value='"._html_encode($strCallref)."'>";
		$_POST['_callreffmt'] = $strCallref;
		$strOrigin = $_POST["pp__definitionfilepath"];
		if($strOrigin=="")
			$strOrigin = $_POST["_definitionfilepath"];
		$strOtherInputs .= '<input type="hidden" id="_originfilepath" name="_originfilepath" value="'._html_encode($strOrigin).'">';

		$boolAllow=true;
		if($strCallclass=="Incident")
		{
			$boolAllow = haveappright("B",5);
		}else if($strCallclass=="Change Request")
		{
			$boolAllow = haveappright("D",5);
		}else if($strCallclass=="Problem")
		{
			$boolAllow = haveappright("C",8);
		}
		else if($strCallclass=="Service Request")
		{
			$boolAllow = haveappright("H",12);
		}
		else if($strCallclass=="B.P Task")
		{
			$boolAllow = true;
		}
		else
		{
			$boolAllow = false;
		}

		if(!$boolAllow)
		{
			$parseHTMLContent = "<span style=\"font-family:Trebuchet MS;color:black;\">You do not have permission to view ".$strCallclass." records.</span>";
		}

		

	}
	else
	{
		$parseHTMLContent = "<span style=\"font-family:Trebuchet MS;color:black;\">Request '"._html_encode($_POST['_callref'])."' could not be found on the system.</span>";
	}

	echo $parseHTMLContent;
?>