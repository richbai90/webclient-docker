<?php
	include_once("callactions/call.actions.php");
	//-- call xmlc to query db
	$callref=$_POST['_callref'];
	$strFirstDigit = substr($callref,0,1);
	if(ctype_alpha($strFirstDigit))
	{
		$callref=substr($callref,1);
	}
	$retRS = new _swm_rs();
	if(ctype_digit($callref))
	{
		$strSQL = _swm_parse_string("select * from opencall where callref="._swm_db_pfs($callref));
		$retRS->query("syscache",$strSQL,true,null);
		if($retRS->_rowcount==0)
		{
			$retRS->query("swdata",$strSQL,true,null);
		}
	}
	else
	{
		echo "<span style=\"font-family:Trebuchet MS;color:black;\">Request '"._html_encode($_POST['_callref'])."' could not be found on the system.</span>";
		return;
	}

	$rawHTMLContent = "";
	if(!$retRS->eof())
	{
		$strStatus = ($retRS->EmbedDataIntoString("rs","[:rs.status.value]"));
		$strBPMStatus = ($retRS->EmbedDataIntoString("rs","[:rs.bpm_status_id.value]"));
		
		$rawHTMLContent = "<input type='hidden' name='menutitle' id='menutitle' title='[:rs.h_formattedcallref.formattedvalue]'>";
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
								<tr style='cursor:pointer;' onclick='_open_call_diary(this,true);'>
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
								<tr  style='cursor:pointer;' onclick='_open_call_diary(this);'>
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
												<td width='20%' align='right'>Priority:</td>
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
								</tr>								</table>";
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>BPM Information</span></span></div>";
		$rawHTMLContent .= "<table class='calldetail' width='100%'>
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
									<td width='50%'>Task Status</td>
									<td>[:rs.bpm_status_id.htmlvalue]</td>
								</tr>
								</table>";

		$parseHTMLContent = ($retRS->EmbedDataIntoString("rs",$rawHTMLContent));
	}

	$strCallref = $retRS->EmbedDataIntoString("rs","[:rs.h_formattedcallref.formattedvalue]");
	$parseHTMLContent .= get_status_actions($strStatus,$strCallref,true);
	$strOtherInputs = "<input type='hidden' name='_callref' id='_callref' value='"._html_encode($_POST['_callref'])."'>";
	$strOtherInputs .= "<input type='hidden' name='_callreffmt' id='_callreffmt' value='"._html_encode($strCallref)."'>";
	$_POST['_callreffmt'] = $strCallref;
	$strOrigin = $_POST["pp__definitionfilepath"];
	if($strOrigin=="")
		$strOrigin = $_POST["_definitionfilepath"];
	$strOtherInputs .= '<input type="hidden" id="_originfilepath" name="_originfilepath" value="'._html_encode($strOrigin).'">';
	echo $parseHTMLContent;
?>