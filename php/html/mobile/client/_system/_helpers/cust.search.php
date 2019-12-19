<?php 
	function _customer_search($cust_id = "",$mandatory = 1,$custsearchmode = 0,$custsearchcriteria = "",$strOtherInputs = "")
	{
		$strOtherInputs .= 	"<input type='hidden' name='custsearchmode' id='custsearchmode' value='"._html_encode($custsearchmode)."'>";
		$strOtherInputs .= 	"<input type='hidden' name='custsearchcriteria' id='custsearchcriteria' value='"._html_encode($custsearchcriteria)."'>";
		$strOtherInputs .= 	"<input type='hidden' name='flgnocust' id='flgnocust' value='0'>";

		if($custsearchmode==0)
		{
			$strOtherInputs .= 	"<input type='hidden' name='opencall_cust_id' id='opencall_cust_id' value=''>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_fk_company_id' id='opencall_fk_company_id' value=''>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_companyname' id='opencall_companyname' value=''>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_cust_name' id='opencall_cust_name' value=''>";

			$strHTML = "<!--<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search Customer</span></span></div>--><table width='100%'>
			<tr style='cursor:pointer;' onclick='_set_cust_searchmode(this);' mode='1'>
				<td width='100%'>by Organisation</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>
			<tr style='cursor:pointer;' onclick='_set_cust_searchmode(this);' mode='2'>
				<td width='100%'>by Customer Firstname</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>
			<tr style='cursor:pointer;' onclick='_set_cust_searchmode(this);' mode='3'>
				<td width='100%'>by Customer Lastname</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>
			<tr style='cursor:pointer;' onclick='_set_cust_searchmode(this);' mode='4'>
				<td width='100%'>by Customer ID</td>
				<td><img src='client/_system/images/icons/arrow.jpg'></td>
			</tr>
			<tr>
				<td colspan='2'>
					<div class='seperator'><div style='display:none;'></div></div>
				</td>
			</tr>";
			if($mandatory==0)
			{
				$strHTML .= "<tr style='cursor:pointer;' onclick='_set_cust_searchmode(this);' mode='5'>
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
		}elseif($custsearchmode==1)
		{
			 $strHTML = _get_org_list($custsearchcriteria);
		}
		elseif($custsearchmode==2)
		{
			 $strHTML =  _get_firstname_list($custsearchcriteria);
		}
		elseif($custsearchmode==3)
		{
			 $strHTML =  _get_lastname_list($custsearchcriteria);
		}
		elseif($custsearchmode==4)
		{
			 $strHTML =  _get_keysearch_list($custsearchcriteria);
		}
		echo $strHTML;

		$strOrigin = $_POST['pp__originfilepath'];
		if($strOrigin=="")
		{
			$strOrigin= "[:_swm_app_path]/views/customer/search.xml";
		}

		$strDefin = $_POST['pp__definitionfilepath'];
		if($strDefin=="")
		{
			$strDefin= "[:_swm_app_path]/views/customer/search.xml";
		}

		?>
			<form id='frmCustsearch' target="_self" method='post' action='index.php' >
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


	function _get_org_list($criteria)
	{
		if($criteria=="")
		{
			$strSQL = "select pk_company_id,companyname from company";

			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>By Organisation</span></span></div><table width='100%'>";
			$template = "<tr style='cursor:pointer;' criteria='[:rs.pk_company_id.htmlvalue]' onclick='_set_cust_searchcriteria(this);'><!--<td width='50%'>[:rs.pk_company_id.htmlvalue]</td>--><td width='100%'>[:rs.companyname.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";
			
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
			$strSQL = "select keysearch,fullname,firstname,surname,fk_company_id,companyname from userdb where fk_company_id='"._swm_db_pfs($criteria)."' order by surname asc";
			$strHTML .= _get_customer_list($strSQL);
		}

		return $strHTML;

	}

	function _get_firstname_list($criteria)
	{
		if($criteria=="")
		{
			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search Customer by Firstname starting with:</span></span></div><table width='100%'>";

			$strHTML .= "<tr><td width='50%'><input type='text' name='txt_search' id='txt_search'></td></tr><tr>";
			$strHTML .= "<tr>";
			$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
			$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_set_cust_searchname(this);\" href=\"#\">";
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
			$strSQL = "select keysearch,fullname,fk_company_id,companyname from userdb where firstname like '"._swm_db_pfs($criteria)."%'";
			$strHTML .= _get_customer_list($strSQL);
		}

		return $strHTML;

	}
	
	function _get_lastname_list($criteria)
	{
		if($criteria=="")
		{
			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search Customer by Lastname starting with:</span></span></div><table width='100%'>";

			$strHTML .= "<tr><td width='50%'><input type='text' name='txt_search' id='txt_search'></td></tr><tr>";
			$strHTML .= "<tr>";
			$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
			$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_set_cust_searchname(this);\" href=\"#\">";
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
			$strSQL = "select keysearch,fullname,fk_company_id,companyname  from userdb where surname like '"._swm_db_pfs($criteria)."%'";
			$strHTML .= _get_customer_list($strSQL);
		}

		return $strHTML;

	}

	function _get_keysearch_list($criteria)
	{
		if($criteria=="")
		{
			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search Customer by Keysearch starting with:</span></span></div><table width='100%'>";

			$strHTML .= "<tr><td width='50%'><input type='text' name='txt_search' id='txt_search'></td></tr><tr>";
			$strHTML .= "<tr>";
			$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
			$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_set_cust_searchname(this);\" href=\"#\">";
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
			$strSQL = "select keysearch,fullname,fk_company_id,companyname  from userdb where keysearch like '"._swm_db_pfs($criteria)."%'";
			$strHTML .= _get_customer_list($strSQL);
		}

		return $strHTML;

	}

	function _get_alphabet_list()
	{
		$strHTML = "";
		for ($i = 'A'; $i < 'Z'; ++$i) {
		  $strHTML .="<tr style='cursor:pointer;' criteria='".$i."' onclick='_set_cust_searchcriteria(this);'><td width='50%'>".$i."</td><td width='50%'>".$i."</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";
		}
		return $strHTML;
	}

	
	function _get_customer_list($strSQL)
	{
		$strTitle = "[:rs.companyname.htmlvalue]";
		$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>$strTitle</span></span></div><table width='100%'>";
		$template = "<tr style='cursor:pointer;' companyid='[:rs.fk_company_id.htmlvalue]' keysearch='[:rs.keysearch.htmlvalue]' cname='[:rs.fullname.htmlvalue]' compname='[:rs.companyname.htmlvalue]' onclick='_set_cust_search(this);'><!--<td width='50%'>[:rs.keysearch.htmlvalue]</td>--><td width='100%'>[:rs.fullname.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='3'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

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
				$strHTML .= "There are no Customers matching your search query.";
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
				$strHTML=	$rsData->EmbedDataIntoString("rs",$strHTML);
				$rsData->movenext();
			}
		}
		$strHTML .= "</table>";
		return $strHTML;
	}

?>
