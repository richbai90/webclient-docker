<?php

	function get_cmdb_actions()
	{
		$strHTML = "";
		$strHTML .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Actions</span></span></div>";
		$strHTML .= get_status_update_html();
		return $strHTML;
	}

	function get_status_update_html()
	{
		$strAssignHTML .= "<table class='calldetail' width='100%'>
									<tr  style='cursor:pointer;' action='Update Status' onclick='_open_cmdb_action(this);'>
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
												Status Update
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

?>