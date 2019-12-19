<?php

	//--
	//-- output select options
	function lb_options($conDb = "",$strTable,$strKey,$strValue = "",$strFilter = "")
	{
		if($conDb=="")$conDb = database_connect("swdata");
		if($strValue=="")$strValue = $strKey;
		if($strFilter!="")$strFilter = " where " . $strFilter;
		$strOptions = "";
		$gl_query = "SELECT * FROM $strTable $strFilter";
		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			while(!$rs->eof)
			{  
				$strOptions .="<option value='".$rs->f($strKey)."'>".$rs->f($strValue)."</option>";
				$rs->movenext();

			}//end while records returned
		}//end if query is successful
		return $strOptions;
	}

	//-- output problem profile selector
	function draw_probprofilecode_selector($conDb = "", $strLabel = "Profile Code:")
	{
		if($conDb=="")$conDb = database_connect("swdata");

		$strHTML = "";
		$strHTML .= "<table cellspacing='2' cellpadding='2' >";
		$strHTML .= "<tr><th align='right' width='100px'>".$strLabel."</th>";
		$strHTML .= "<td>";
			$strHTML .= "<select id='lb_probcode' currlevel='0' onchange='dropdown_profile_code_selected(this);' style='width:140px;'>";
			$strHTML .= "<option value=''>-----Please Select-----</option>";
			
			//-- Build query. If we have a parent category we use it and if not, we don't.
			$gl_query = 'SELECT * FROM probcode WHERE levelx = 0';
			$gl_query .= ' order by code asc';
			$rs = $conDb->Query($gl_query,true);
			if($rs)
			{
				while(!$rs->eof)
				{  
					$strHTML .="<option value='".$rs->f('code')."'>".$rs->f('descx')."</option>";
					$rs->movenext();

				}//end while records returned
			}//end if query is successful

		$strHTML .= "</td>";
		$strHTML .= "</tr>";
		$strHTML .= "<tr>";
		$strHTML .= "<td align='right' width='100px'>:</td>";
		$strHTML .= "<td> <span id='span_profilecodedesc'></span>&nbsp;</td>";
		$strHTML .= "</tr></table>";

		return $strHTML;
	}

	//--
	//-- output select options
	function load_sla_options($conDb = "",$strFilter = "")
	{
		$strKey = "pk_slad_id";
		$strValue = "slad_id";
		if($conDb=="")$conDb = database_connect("swdata");
		if($strValue=="")$strValue = $strKey;
		if($strFilter!="")$strFilter = " where " . $strFilter;
		$strOptions = "";
		$gl_query = "SELECT * FROM ITSMSP_SLAD $strFilter";
		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			while(!$rs->eof)
			{  
				$strOptions .="<option value='".$rs->f($strKey)."' defp='".$rs->f("fk_ssla")."'>".$rs->f($strValue)."</option>";
				$rs->movenext();

			}//end while records returned
		}//end if query is successful
		return $strOptions;
	}

	//--
	//-- output select options
	function load_ola_options($conDb = "",$intParentCallref = 0 )
	{
		$strKey = "pk_ola_id";
		$strValue = "slad_ola";
		if($conDb=="")$conDb = database_connect("swdata");
		if($strValue=="")$strValue = $strKey;
		if($strFilter!="")$strFilter = " where " . $strFilter;
		$strOptions = "";

		$gl_query = "select itsm_sladef from opencall where callref = ". $intParentCallref;
		$pk_slad_id = 0;
		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			if(!$rs->eof)
			{  
				$pk_slad_id = $rs->f("itsm_sladef");
			}//end while records returned
		}//end if query is successful

		
		$gl_query = "select fk_child_itemtext from config_reli where fk_parent_itemtext = ". $pk_slad_id ." and fk_parent_type='ME->SLA' and fk_child_type='ME->OLA'";

		$strOLAs = "-1";
		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			while(!$rs->eof)
			{  
				if($strOLAs!="")$strOLAs .=",";
				$strOLAs .= $rs->f("fk_child_itemtext");
				$rs->movenext();

			}//end while records returned
		}//end if query is successful
		
		$gl_query = "select * from CMN_REL_OPENCALL_CI where FK_CALLREF in (" .$intParentCallref.")";

		$strCIs = "-1";
		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			while(!$rs->eof)
			{  
				if($strCIs!="")$strCIs .=",";
				//$strCIs .= $rs->f("fk_child_itemtext");
				$strCIs .= $rs->f("fk_ci_auto_id");
				$rs->movenext();

			}//end while records returned
		}//end if query is successful


		$gl_query = "select fk_parent_itemtext from config_reli where fk_child_id in (" .$strCIs. ") and fk_parent_type='ME->OLA'";

		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			while(!$rs->eof)
			{  
				if($strOLAs!="")$strOLAs .=",";
				$strOLAs .= $rs->f("fk_parent_itemtext");
				$rs->movenext();

			}//end while records returned
		}//end if query is successful

		$gl_query = "select * from itsmsp_slad_ola where pk_ola_id in (".$strOLAs.")";
		$rs = $conDb->Query($gl_query,true);
		if($rs)
		{
			while(!$rs->eof)
			{  
				$strOptions .="<option value='".$rs->f($strKey)."'>".$rs->f($strValue)."</option>";
				$rs->movenext();

			}//end while records returned
		}//end if query is successful

		
		return $strOptions;
	}

?>