<?php

	function get_authorise_actions($strStatus,$strCallref, $strAuthoriseStatus)
	{
		$strHTML = "";
		$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Actions</span></span></div>";
		$strHTML .= get_update_html($strStatus);
		if(strtolower($strAuthoriseStatus)=="pending authorisation")
			$strHTML .= get_authorise_html();
		return $strHTML;
	}

	function get_status_actions($strStatus,$strCallref,$boolTask = false,$strCallclass= "Incident")
	{
		$strHTML = "";
			$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Actions</span></span></div>";
		if($boolTask && (($strStatus!= 6)&&($strStatus <16)))
			$strHTML .= get_bpmupdate_html();
		if($strStatus=="1")
		{
			$strHTML .= get_update_html($strStatus).get_assign_html().get_close_html($strStatus,$strCallclass).get_hold_html().get_cancel_html($strCallclass);
		}elseif($strStatus=="2" || $strStatus=="3" || $strStatus=="5")
		{
			$strHTML .= get_update_html($strStatus).get_accept_html().get_assign_html().get_cancel_html($strCallclass);
		}
		elseif($strStatus=="4")
		{
			$strHTML .= get_update_html($strStatus).get_offhold_html().get_cancel_html($strCallclass);
		}
		elseif($strStatus=="6")
		{
			$strHTML .= get_update_html($strStatus).get_assign_html().get_close_html($strStatus,$strCallclass).get_cancel_html($strCallclass);
		}
		elseif($strStatus=="9")
		{
			$strHTML .= get_update_html($strStatus).get_assign_html().get_close_html($strStatus,$strCallclass).get_hold_html().get_cancel_html($strCallclass);
		}
		elseif($strStatus=="10")
		{
			$strHTML .= get_update_html($strStatus).get_accept_html().get_assign_html().get_cancel_html($strCallclass);
		}
		elseif($strStatus=="11")
		{
			$strHTML .= get_update_html($strStatus).get_accept_html().get_assign_html().get_cancel_html($strCallclass);
		}
		return $strHTML;
	}

	function get_assign_html()
	{
		$strAssignHTML = "";
		if(haveright("sla",1))
		{
			$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Assign' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Assign
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
		return $strAssignHTML;
	}

	function get_accept_html()
	{
		$strAssignHTML = "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Accept' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Accept
											</span>
										</td>
										<td><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr>								<tr>
									<td colspan='3'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
			</table>";
		return $strAssignHTML;
	}

	function get_close_html($strStatus=0,$strCallclass)
	{
		$strGroup = "";
		$strRight = "";
		if($strCallclass=="Incident")
		{
			$strGroup = "B";
			$strRight = "12";
		}
		elseif($strCallclass=="Change Request")
		{
			$strGroup = "D";
			$strRight = "4";
		}
		elseif($strCallclass=="Service Request")
		{
			$strGroup = "H";
			$strRight = "14";
		}

		$boolContinue = true;
		if($strGroup!="")
		{
			$boolContinue = haveappright($strGroup,$strRight);
		}
		//if can resolve/close this call type
		if($boolContinue)
		{
			if($strStatus==6)
			{
				//if resolved, must be allowed to close calls
				$boolContinue = haveright("sla",2);
			}
			else
			{
				//else must be allowed to either close or resolve
				$boolContinue = haveright("sla",2) || haveright("sla",28);
			}
		}
		if($boolContinue)
		{
			$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Resolve \ Close' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Resolve/Close
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
		else  
			$strAssignHTML= "";
		return $strAssignHTML;
	}
	function get_hold_html()
	{
		$strAssignHTML = "";
		if(haveright("sla",10))
		{
			$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Hold' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											On Hold
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
		return $strAssignHTML;
	}

	function get_offhold_html()
	{
		$strAssignHTML = "";
		if(haveright("sla",11))
		{
			$prefix = 'mpohld_';
			$strKey = generate_secure_key($prefix);
			$_SESSION[$prefix.'key'] = $strKey;

			$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Off Hold' strkey='".$strKey."' callref='".$_POST['_callref']."' xmlpath='".$_POST['pp__definitionfilepath']."' onclick='_open_call_offhold_details(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Off Hold
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
		return $strAssignHTML;
	}

	function get_update_html($strStatus)
	{
		$strAssignHTML = "";
		$boolContinue = haveright("sla",4);
		if($boolContinue)
		{
			//can update calls
			if($strStatus!="1")
			{
				//if not pending, check can update non pending
				$boolContinue = haveright("sla",27);
			}
		}
		if($boolContinue)
		{
			$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Update' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Update
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
		return $strAssignHTML;
	}

	function get_bpmupdate_html()
	{
		$boolContinue=true;
		$boolContinue = haveappright("G",6);
		if($boolContinue)
		{
			$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Task Update' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Update Task Status
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
		else
			$strAssignHTML = "";
		return $strAssignHTML;
	}

	function get_authorise_html()
	{
		$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Authorise' status='".$strStatus."' onclick='_open_call_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											Authorise
											</span>
										</td>
										<td><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr>								<tr>
									<td colspan='3'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
			</table>";
		return "";
	}
	function get_cancel_html($strCallclass)
	{
		$strAssignHTML = "";
		if(haveright("sla",8))
		{
			if($strCallclass=="Incident")
			{
				$strGroup = "B";
				$strRight = "3";
			}
			elseif($strCallclass=="Change Request")
			{
				$strGroup = "D";
				$strRight = "3";
			}
			elseif($strCallclass=="Problem")
			{
				$strGroup = "C";
				$strRight = "5";
			}
			elseif($strCallclass=="Service Request")
			{
				$strGroup = "H";
				$strRight = "15";
			}

			$boolContinue = true;
			if($strGroup!="")
			{
				$boolContinue = haveappright($strGroup,$strRight);
			}

			if($boolContinue)
			{
				$strAssignHTML .= "<table class='calldetail' width='100%'>
										<tr  style='cursor:pointer;' action='Cancel' status='' onclick='_open_call_action(this);'>
											<td width='3%'>
											</td>
											<td width='95%'>
												<span class=\"blackfont nmlfontsize\">
												Cancel
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
		}
		return $strAssignHTML;
	}

?>