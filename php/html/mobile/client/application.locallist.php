<?php

	//-- process xml definition

	function _swm_locallist_init(&$xmlList,&$xmlDefintionFilePath)
	{
		if(!$xmlList)return "";
		//-- connect to db and get data - return as recordset
		$oRS = _swm_locallist_fetchdata($xmlList);
		return _swm_output_data($xmlList , $oRS);
	}

	function _swm_locallist_fetchdata(&$xmlList)
	{
		$retRS = null;
		$xData = $xmlList->get_elements_by_tagname("rows");
		$xData = $xData[0];
		if($xData)
		{
			//-- complex conversion info
			$xmlConversion = null;
			$xConversion = $xData->get_elements_by_tagname("complexconversions");
			if($xConversion[0])	$xmlConversion = $xConversion[0];

			$retRS = new _swm_rs();
			$retRS->create_rs_from_local_xml($xData,$xmlConversion);
		}
		return $retRS;
	}

	function _swm_output_data(&$xmlList , &$rsData)
	{
		$strOutputHTML = "";
		if($rsData!=null)
		{
			if($rsData->QueryFailed()) 
			{
				if($rsData->GetLastErrorCode()=="0005")
				{
					//-- session expired so exit
					$_SESSION['_exiterror'] = "_exitout('".$rsData->GetLastError()."')";
				}
				return "An error occured outputting the data list. ". $rsData->GetLastError();
			}

			//-- check if there is any data
			if($rsData->eof())
			{
				$xOut= $xmlList->get_elements_by_tagname("nodataoutput");
				$xOut = $xOut[0];
				if($xOut)
				{	
					$strOutputHTML = $xOut->get_content();
				}
				else
				{
					$strOutputHTML = "There is no data available";
				}
			}
			else
			{
				$rowCount = -1;
				$xOut= $xmlList->get_elements_by_tagname("rowsnippet");
				if(count($xOut)>0)
				{
					$xmlRowCount = $xOut[0];
					$rowCount = $xmlRowCount->get_content();
				}

				$intCollapsed = 1;
				$strTitle = "";
				$strTarget = "";
				$xOut= $xmlList->get_elements_by_tagname("header");
				if(count($xOut)>0)
				{
					$xmlHeader = $xOut[0];
					$intCollapsed = $xmlHeader->get_attribute("collapsed");

					$arrTitle = $xmlHeader->get_elements_by_tagname("title");
					if(count($arrTitle)>0)
					{
						$xmlTitle = $arrTitle[0];
						$strTitle = $xmlTitle->get_content();
					}
					$arrTarget = $xmlHeader->get_elements_by_tagname("target");
					if(count($arrTarget)>0)
					{
						$xmlTarget = $arrTarget[0];
						$strTarget = $xmlTarget->get_content();
					}
				}


				$strClassExt = "";
				if($intCollapsed=="1")
				{
					$strClassExt = "-none";
				}
				$strOutputHTML = "<div class='datalist-header".$strClassExt."'>";

				$strOutputHTML .= _html_encode($strTitle);

				$strOutputHTML .= "</div>";

				$strOutputHTML .= "<div class='datalist'>";

				$xOut= $xmlList->get_elements_by_tagname("headeroutput");
				$xOut = $xOut[0];
				if($xOut)
				{	
					$strParse = $xOut->get_attribute("noparse");
					$strContent = $xOut->get_content();
					if($strParse!="1")
						$strContent = _swm_parse_string($strContent);
					$strOutputHTML .= $strContent;
				}
				//--
				//-- get row output string
				$xOut= $xmlList->get_elements_by_tagname("rowoutput");
				$xOut = $xOut[0];
				if($xOut)
				{	
					$outputTemplate = $xOut->get_content();

					//-- get name for data pointer
					$strRsName = "row";
					$xRsName= $xmlList->get_elements_by_tagname("rspointer");
					$xRsName = $xRsName[0];
					if($xRsName)$strRsName = $xRsName->get_content();

					while(!$rsData->eof())
					{
						$strOutputHTML .= $rsData->EmbedDataIntoString("rs",$outputTemplate);
						$rsData->movenext();
					}
				}

				$xOut= $xmlList->get_elements_by_tagname("footeroutput");
				$xOut = $xOut[0];
				if($xOut)
				{	
					$strOutputHTML .= _swm_parse_string($xOut->get_content());
				}

				$strOutputHTML .= "</div>";
			}
		}

		return $strOutputHTML;
	}
?>