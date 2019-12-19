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

?>