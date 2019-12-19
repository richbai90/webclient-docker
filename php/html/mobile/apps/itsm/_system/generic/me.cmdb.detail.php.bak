<?php
	include_once("cmdbactions/cmdb.actions.php");
	//-- call xmlc to query db
	$strId=$_POST['_cmdb_id'];

	$strSQL = _swm_parse_string("select * from config_itemi where pk_auto_id="._swm_db_pfs($strId));
	$retRS = new _swm_rs();
	$retRS->query("swdata",$strSQL,true,null);

	$rawHTMLContent = "";
	if(!$retRS->eof())
	{
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Details</span></span></div>";
		$rawHTMLContent .= "<table class='calldetail' width='100%'>
								<tr>
									<td colspan='2'>
										<table class='calldetail' width='100%'>
											<tr>
												<td width='25%' align='right'>
												Configuration ID:
												</td>
												<td width='97%'>
													[:rs.ck_config_item.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													Description:
												</td>
												<td width='97%'>
													[:rs.description.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													Type:
												</td>
												<td width='97%'>
													[:rs.ck_config_type.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													Status:
												</td>
												<td width='97%'>
													[:rs.fk_status_level.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													CMDB Status:
												</td>
												<td width='97%'>
													[:rs.cmdb_status.htmlvalue]
												</td>
											</tr>		
										</table>
									</td>
								</tr>
							</table>";

		$parseHTMLContent = ($retRS->EmbedDataIntoString("rs",$rawHTMLContent));
	}
	else
	{
		echo "<span style=\"font-family:Trebuchet MS;color:black;\">CI '"._html_encode($strId)."' could not be found on the system.</span>";
		return;
	}
	$isActiveBaseline = $retRS->EmbedDataIntoString("rs","[:rs.isactivebaseline.value]");
	if($isActiveBaseline=="Yes")
		if(haveappright("F",3))
			$parseHTMLContent .= get_cmdb_actions();
	$strOtherInputs = "<input type='hidden' name='cmdb_holder' id='cmdb_holder' value='"._html_encode($_POST['_cmdb_id'])."'>";
	$strOrigin = $_POST["pp__definitionfilepath"];
	if($strOrigin=="")
		$strOrigin = $_POST["_definitionfilepath"];
	$strOtherInputs .= '<input type="hidden" id="_originfilepath" name="_originfilepath" value="'._html_encode($strOrigin).'">';
	echo $parseHTMLContent;
?>