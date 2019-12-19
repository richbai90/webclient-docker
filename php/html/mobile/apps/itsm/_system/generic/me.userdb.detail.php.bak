<?php
	include_once("useractions/user.actions.php");
	//-- call xmlc to query db
	$strKeysearch=$_POST['_keysearch'];

	$strSQL = _swm_parse_string("select * from userdb where keysearch='".lang_encode_from_utf(_swm_db_pfs($strKeysearch))."'");
	$retRS = new _swm_rs();
	$retRS->query("swdata",$strSQL,true,null);

	$rawHTMLContent = "";
	if(!$retRS->eof())
	{
		$rawHTMLContent = "<input type='hidden' name='menutitle' id='menutitle' title='[:rs.fullname.htmlvalue]'>";
		$rawHTMLContent .= $strCustHTML;
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Details</span></span></div>";
		$rawHTMLContent .= "<table class='calldetail' width='100%'>
								<tr>
									<td colspan='2'>
										<table class='calldetail' width='100%'>
											<tr>
												<td width='25%' align='right'>
												Name:
												</td>
												<td width='97%'>
													[:rs.fullname.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													Organisation:
												</td>
												<td width='97%'>
													[:rs.companyname.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													Site:
												</td>
												<td width='97%'>
													[:rs.site.htmlvalue]
												</td>
											</tr>		
											<tr>
												<td width='25%' align='right'>
													Department:
												</td>
												<td width='97%'>
													[:rs.department.htmlvalue]
												</td>
											</tr>		
										</table>
									</td>
								</tr>
							</table>";
		$rawHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Contact Info</span></span></div>";
		$rawHTMLContent .= "<table class='calldetail' width='100%'>
								<tr>
									<td width='3%'>
									</td>
									<td width='100%' class='boldcalldetail' colspan='3'>
										<table class='calldetail' width='100%'>
											<tr>
												<td width='3%'>
												</td>
												<td width='20%' align='right'>Telephone:</td>
												<td>[:rs.telext.htmlvalue]</td>
											</tr>
											<tr>
												<td width='3%'>
												</td>
												<td width='15%' align='right'>Mobile:</td>
												<td>[:rs.mobiletel.htmlvalue]</td>
											</tr>
											<tr>
												<td width='3%'>
												</td>
												<td width='15%' align='right'>Fax:</td>
												<td>[:rs.faxtel.htmlvalue]</td>
											</tr>
											<tr>
												<td width='3%'>
												</td>
												<td width='15%' align='right'>Email:</td>
												<td>[:rs.email.htmlvalue]</td>
											</tr>
										</table>
									</td>
								</tr>
								</table>";

		$parseHTMLContent = ($retRS->EmbedDataIntoString("rs",$rawHTMLContent));
	}
	else
	{
		echo "<span style=\"font-family:Trebuchet MS;color:black;\">Customer '"._html_encode($_POST['_keysearch'])."' could not be found on the system.</span>";
		return;
	}

	if(strpos($strOtherInputs,"<input type='hidden' name='opencall_cust_id'")===false)
		$strOtherInputs .= 	($retRS->EmbedDataIntoString("rs","<input type='hidden' name='opencall_cust_id' id='opencall_cust_id' value='[:rs.keysearch.value]'>"));
	if(strpos($strOtherInputs,"<input type='hidden' name='opencall_fk_company_id'")===false)
		$strOtherInputs .= 	($retRS->EmbedDataIntoString("rs","<input type='hidden' name='opencall_fk_company_id' id='opencall_fk_company_id' value='[:rs.fk_company_id.value]'>"));
	if(strpos($strOtherInputs,"<input type='hidden' name='opencall_companyname'")===false)
		$strOtherInputs .= 	($retRS->EmbedDataIntoString("rs","<input type='hidden' name='opencall_companyname' id='opencall_companyname' value='[:rs.companyname.value]'>"));
	if(strpos($strOtherInputs,"<input type='hidden' name='opencall_cust_name'")===false)
		$strOtherInputs .= 	($retRS->EmbedDataIntoString("rs","<input type='hidden' name='opencall_cust_name' id='opencall_cust_name' value='[:rs.fullname.value]'>"));
	if(strpos($strOtherInputs,"<input type='hidden' name='_cmdb_id'")===false)
		$strOtherInputs .= 	($retRS->EmbedDataIntoString("rs","<input type='hidden' name='_cmdb_id' id='_cmdb_id' value=''>"));
	
	$strOrigin = $_POST["pp__definitionfilepath"];
	if($strOrigin=="")
		$strOrigin = $_POST["_definitionfilepath"];
	$strOtherInputs .= '<input type="hidden" id="_originfilepath" name="_originfilepath" value="'._html_encode($strOrigin).'">';
	
	//need to check if analyst can log calls
	//check if analyst has right to raise this kind of call
	if(haveright("sla",3))
	{
		$parseHTMLLogContent = "";
		$parseHTMLLogContent .= get_log_html("Incident");
		$parseHTMLLogContent .= get_log_html("Problem");
		$parseHTMLLogContent .= get_log_html("Change Request");
		$parseHTMLLogContent .= get_log_html("Service Request");

		if($parseHTMLLogContent !="")$parseHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Log Request</span></span></div>";
		$parseHTMLContent .= $parseHTMLLogContent;
	}
	
	//need to add abililty to view customer cis. should just be a query and then create a link to cmdb details form. Can update status from there.
	$parseHTMLContent .= "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle'>Customer Items</span></span></div>";
	$parseHTMLContent .= get_user_cis($_POST['_keysearch']);
	
	echo $parseHTMLContent;
?>