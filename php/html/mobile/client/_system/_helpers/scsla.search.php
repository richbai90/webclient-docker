<?php 
	function _sc_sla_search($slaid = "",$slaname="",$mandatory = 1,$slasearchcriteria = "",$strOtherInputs = "")
	{
		$strOtherInputs .= 	"<input type='hidden' name='def_priority' id='def_priority' value=''>";
		$strOtherInputs .= 	"<input type='hidden' name='slasearchcriteria' id='slasearchcriteria' value='"._html_encode($slasearchcriteria)."'>";

		if($slasearchcriteria=="")
		{
			$strOtherInputs .= 	"<input type='hidden' name='opencall_itsm_sladef' id='opencall_itsm_sladef' value='"._html_encode($slaid)."'>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_itsm_slaname' id='opencall_itsm_slaname' value='"._html_encode($slaname)."'>";
			$strOtherInputs .= 	"<input type='hidden' name='opencall_priority' id='opencall_priority' value=''>";
			$strSQL = "select * from sc_sla where fk_subscription=".$_POST['subsc'];

			$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Search SLAs</span></span></div><table width='100%'>";
			$template = "<tr style='cursor:pointer;' criteria='[:rs.fk_sla.value]' slaid='[:rs.fk_sla.value]' fk_sla='' slaname='[:rs.fk_sla_name.value]' onclick='_set_sla_searchcriteria(this);'><td width='100%'>[:rs.fk_sla_name.value]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='2'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

			$rsData = new _swm_rs();
			$strSQL = _swm_parse_string($strSQL);
			$rsData->query("swdata",$strSQL,true,null);
			if($rsData->eof())
			{
				$strSQL = "select * from sc_sla where fk_service=".$_POST['opencall_itsm_fk_service'];
				$rsData = new _swm_rs();
				$strSQL = _swm_parse_string($strSQL);
				$rsData->query("swdata",$strSQL,true,null);
			}
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
			$strSQL = "select fk_priority from itsmsp_slad_priority where flg_sla=1 and fk_slad=".$slasearchcriteria;
			$strHTML .= _get_sc_priority_list($strSQL);
		}

		echo $strHTML;
		?>
			<form id='frmSlasearch' target="_self" method='post' action='index.php' >
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

	function _get_sc_priority_list($strSQL)
	{
		$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Select Priority</span></span></div><table width='100%'>";
		$template = "<tr style='cursor:pointer;' priority='[:rs.fk_priority.htmlvalue]' onclick='_set_sla_search(this);'><td width='100%'>[:rs.fk_priority.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr><tr><td colspan='2'><div class='seperator'><div style='display:none;'></div></div></td></tr>";

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
		return $strHTML;
	}

?>
