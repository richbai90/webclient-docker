<?php

	//-- out of box complex conversion functions for use in data lists


	//-- given condition value get color integer for use with ccs style names 
	function _get_oc_condition_level($rawValue)
	{
		switch($rawValue)
		{
			case 1:case 2: case 3: case 4:case 5:case 6:
				return "!";
				break;
			case 7:case 8: case 9: case 10:case 11:case 12:
				return "!!";
				break;
			case 13:case 14: case 15: case 16:case 17:case 18:
				return "!!!";
				break;
			case 19:case 20: case 21: case 22:case 23:case 24:
				return "!!!!";
				break;
		}
		return "";
	}

	function _get_oc_condition_styling($rawValue)
	{
		$fontcolor = "#000000";
		$bgcolor = "#ffffff";
		$border = "border-color:#808080;";
		switch($rawValue)
		{
			case 6:case 12: case 18: case 24:
				$bgcolor = "red";
				break;
			case 2:case 8:case 14:case 20:
				$bgcolor = "green";
				break;
			case 1:case 7:case 13:case 19:
				$bgcolor = "gray";
				break;
			case 3:case 9:case 15:case 21:  
				$bgcolor = "orange";
				break;
			case 5:case 11:case 17:case 23:
				$bgcolor = "magenta";
				break;
			case 4:case 10:case 16:case 22:
				$bgcolor = "#0000FF";
				break;
		}

		if($bgcolor == "#ffffff")
		{
			$fontcolor="#ffffff";
			$border="";
		}
		$strStyle= "color:".$fontcolor.";background-color:".$bgcolor.";".$border;
		return $strStyle;
	}

	//-- given escalation value return html div indication progress
	function _get_oc_escalation_progressbar($intEscalationValue)
	{
		$LEVEL1 = 0x00000001;
		$LEVEL2 = 0x00000002;
		$LEVEL3 = 0x00000003;
		$LEVEL4 = 0x00000004;
		$LEVEL5 = 0x00000005;
		$LEVEL6 = 0x00000006;

		$GREY = 0x00010000;
		$GREEN = 0x00020000;
		$AMBER = 0x00030000;
		$BLUE = 0x00040000;
		$MAGENTA = 0x00050000;
		$RED = 0x00060000;

		$arrColor = Array('','gray','green','orange','blue','magenta','red');

		$high= $intEscalationValue>>16;
		$low = $intEscalationValue & 65535;

		if($low>6)$low=6;
		if($high>6)$high=6;

		$percW = ($low/6) * 100;
		if($intEscalationValue==0 || $intEscalationValue=="")return "";

		$strColor = $arrColor[$high];
		$strHTML = "<div style='font-size:0px;height:100%;width:".$percW."%;background-color:".$strColor.";'></div>";
		return $strHTML;
	}


	//-- date formatters
	//--
	//-- given epoch will convert date to analysts date time format
	function _get_analyst_formatted_datetime($intEpoch)
	{
		$res = SwFormatTimestampValue(SW_DTMODE_DATETIME, $intEpoch);
		if($res=="") return "Not Applicable";
		return $res;
	}

	//-- format value to analysts date format
	function _get_analyst_formatted_date($intEpoch)
	{
		$res = SwFormatTimestampValue(SW_DTMODE_DATE, $intEpoch);
		if($res=="") return "Not Applicable";
		return $res;
	}

	//-- format value to analysts date format
	function _get_analyst_formatted_time($intEpoch)
	{
		$res = SwFormatTimestampValue(SW_DTMODE_TIME, $intEpoch);
		if($res=="") return "Not Applicable";
		return $res;
	}


	//-- format value to yyyymmdd date format
	function _get_yyyymmdd_formatted_date($intEpoch)
	{
	}

	//-- format value to yyyymmdd date format
	function _get_ddmmyyyy_formatted_date($intEpoch)
	{
	}

	function _get_text_formatted_date($strText)
	{
		$res = SwConvertDateTimeInText($strText);
		if($res=="") return "Not Applicable";
		return $res;
	}

	function _get_htmltext_formatted_date($strText)
	{
		return _html_encode(_get_text_formatted_date($strText));
	}
	//-- eof date formatters

	//-- sw_messenger formatters
	function _get_messenger_from_indicator_style($rawValue)
	{
		$strDiv = "<div style='width:16px;'></div>";
		if($rawValue=="SystemAlerter")
		{
			$strDiv = "<div style='width:16px;height:16px;border:1px solid #808080;background-color:red;text-align:center;margin-top:9px;'>!</div>";
		}
		return $strDiv;
	}

	function _get_messenger_status_indicator_style($rawValue,$formattedValue, &$oRow)
	{
		if($oRow['status']->value==0)
		{
			return "<div style='font-weight:normal'>"._html_encode($rawValue)."</div>";
		}
		else
		{
			return "<div style='font-weight:bold'>"._html_encode($rawValue)."</div>";
		}
	}

	//-- function to get a value when performing a sql count()
	function _get_rs_count($rawSQL,$formattedValue, &$oRow)
	{
		if($rawSQL=="")
			return "";
		$retRS = new _swm_rs();

		$strSQL = _swm_parse_string($rawSQL);
		$strDB = $oRow['db']->value;

		$retRS->query($strDB ,$strSQL);
		if(!$retRS->eof())
		{
			//return the first rows, first columns value
			$returnedColumns = $retRS->_columns;
			foreach($returnedColumns as $key =>$colObject)
			{
				return $colObject->value;
			}
		}
		else
		{
			if($retRS->GetLastErrorCode()=="0005")
			{
				//-- session expired so exit
				$_SESSION['_exiterror'] = "_exitout('".$retRS->GetLastError()."')";
			}
			return "Count of records failed. ". $retRS->GetLastError();
		}
		return "Count of records failed.";
	}

	function _get_callref_format($rawValue,$strFormattedValue,$cols)
	{
		$boolRed = false;
		$intWithinFix = $cols['withinfix']->value;
		$intFixbyx = $cols['fixbyx']->value;
		$intSlafix = $cols['slafix']->value;

		//got a sla fix
		if($intSlafix>0)
		{
			//if not met, make font red
			if($intWithinFix<1)
				$boolRed = true;
		}
		else
		{
			//no response yet.

			//if supposed to be fixed by now
			if($intFixbyx<time())
				$boolRed = true;
		}

		if($boolRed)
			return "<span class='datared'>".$strFormattedValue."&nbsp;</span>";
		return $strFormattedValue;
	}
?>