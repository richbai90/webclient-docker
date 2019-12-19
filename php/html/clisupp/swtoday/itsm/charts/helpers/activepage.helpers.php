<?php

	//- -so we can share connections
	$GLOBALS['activepageconnections'] = array();

	//-- functions to output types of gadgets
	function process_gadget_html($xmlGadgets,$strPageXML)
	{
		//-- get box style
		$strMainStyle = $xmlGadgets->get_attribute("style");
		if($strMainStyle=="")$strMainStyle = "gadgets-holder";

		$arrNodes = $xmlGadgets->get_elements_by_tagname("gadget");
		foreach ($arrNodes as $nodePos => $aNode)
		{
			//-- can we process this gadget
			$strFunctionToEval = $aNode->get_attribute("processfunction");
			if($strFunctionToEval!="")
			{
				$strFunctionToEval=parse_context_vars($strFunctionToEval);
				eval("\$boolOK = ".$strFunctionToEval.";");
				if($boolOK==false)continue;
			}

			//-- get box style
			$strStyle = $aNode->get_attribute("style");
			if($strStyle=="")$strStyle = "gadget";

			//-- get title style
			$strTitleStyle = $aNode->get_attribute("titlestyle");
			if($strTitleStyle=="")$strTitleStyle = "gadget-title";

			//-- get gadget style
			$strGadgetStyle = $aNode->get_attribute("gadgetstyle");

			//-- gadget title / bar

			$strTitle = parse_context_vars(getxml_childnode_content($aNode,"title"));
			$strRightTitleHTML = "";
			$strRightTitle = parse_context_vars(getxml_childnode_content($aNode,"righttitle"));
			if($strRightTitle!="")
			{
				$strRightTitleStyle = getxml_childnode_att($aNode,"righttitle","style");
				if($strRightTitleStyle=="")$strRightTitleStyle = "title-action-link";
				$strRightTitleAction = getxml_childnode_att($aNode,"righttitle","action");
				$strRightTitleActionType = getxml_childnode_att($aNode,"righttitle","actiontype");
				//-- get style oand any action stuff
				$strRightTitleHTML  = "<div onClick='run_gadget_action(this);' gtype='righttitle'  gactiontype='".$strRightTitleActionType."' gaction='".$strRightTitleAction."' class='".$strRightTitleStyle."' >".$strRightTitle."</div>";
			}

			//-- get gadget type and process accordingly
			$strGadgetType = $aNode->get_attribute("type");
			$strGadgetTypeHTML = process_gadget_type($strGadgetType,$aNode,$strPageXML);
		

			//-- check if collapseable
			$strCollapseStyle="";
			$strCollapseHMTL = "";
			$strCollapse = $aNode->get_attribute("collapse");
			if($strCollapse!="")
			{
				//-- can collapse or expand - get default
				if($strCollapse=="1")
				{
					//-- draw collapsed
					$strCollapseStyle="style='display:none;'";
					$strCollapseHMTL = "<div class='div-expand' onClick='expandcollapse_gadget(this);'></div>";
				}
				else
				{
					//-- draw expanded
					$strCollapseHMTL = "<div class='div-collapse' onClick='expandcollapse_gadget(this);'></div>";
				}
			}

		
			$chartHeight = $aNode->get_attribute("chartheight");
			//$strGadgetHTML .= "<div id='gadgetcontainer' class='".$strStyle."'>".curve_top($strTitleStyle)."<div class='".$strTitleStyle."'>".$strTitle.$strRightTitleHTML.$strCollapseHMTL."</div>".curve_bottom($strTitleStyle)."<div id='gadgetholder' class='".$strGadgetStyle."' ".$strCollapseStyle.">".$strGadgetTypeHTML."</div></div>";
			$strCollapseStyle='style="height:'.$chartHeight.';text-align:center;"';
			$strGadgetHTML .= "<div id='gadgetcontainer' class='".$strStyle."'>".curve_top($strTitleStyle).curve_bottom($strTitleStyle)."<div id='gadgetholder' class='".$strGadgetStyle."' ".$strCollapseStyle."><div class='gadgettitle'>".$strTitle."</div>".$strGadgetTypeHTML."</div></div>";
			
		}	
		$strGadgetWidth = "width:100%;height:100%;";
		$strGadgetHTML = "<div class='".$strMainStyle."' style='".$strGadgetWidth."'>".$strGadgetHTML."</div>";
		return $strGadgetHTML;
	}

	function curve_top($strTitleStyle)
	{
		if(strpos($strTitleStyle,"curve")>0)
		{
			return '<div id="nifty"><b class="rtop"><b class="r1"></b><b class="r2"></b><b class="r3"></b><b class="r4"></b></b>'; 
		}
		return '';
	}

	function curve_bottom($strTitleStyle)
	{
		if(strpos($strTitleStyle,"curve")>0)
		{
			return  '<b class="rbottom"><b class="r4"></b><b class="r3"></b><b class="r2"></b><b class="r1"></b></b></div>';
		}
		return '';

	}

	//-- process types of gadgets
	function process_gadget_type($strGadgetType,$aGadget,$strPageXML)
	{
		GLOBAL $customer_session;

		//-- can we process this gadget
		$strFunctionToEval = $aGadget->get_attribute("accessfunction");
		if($strFunctionToEval!="")
		{
			$strFunctionToEval=parse_context_vars($strFunctionToEval);
			eval("\$boolOK = ".$strFunctionToEval.";");
			if($boolOK==false)return "";
		}

		//-- check webflag
		$strFlagToEval = $aGadget->get_attribute("webflag");
		if($strFlagToEval!="")
		{
			//-- test customers permission
			eval("\$strWebFlag = ".$strFlagToEval.";");
			if($customer_session->IsOption($strWebFlag)==false)
			{
				//-- user does not have menu permission
				$boolOK=false;
			}
			if($boolOK==false)return "";
		}

		//-- check config flag
		$strFlagToEval = $aGadget->get_attribute("configflag");
		if($strFlagToEval!="")
		{
			//-- test config permission
			eval("\$strConfigFlag = ".$strFlagToEval.";");
			if(!($_SESSION['config_flags']&$strConfigFlag))
			{
				//-- config does not have menu permission
				$boolOK=false;
			}
			if($boolOK==false)return "";
		}


		//-- ok to process
		$strHTML = "";
		switch($strGadgetType)
		{
			case "shortcuts":
				$strHTML = process_shortcut_html($aGadget);
				break;
			case "valuecounter":
				$strHTML = process_counter_html($aGadget);
				break;
			case "text":
				$strText = getxml_childnode_content($aGadget,"output");
				$strHTML = nl2br(parse_context_vars($strText));
				break;
			case "datatable":
				$strXmlFile = getxml_childnode_content($aGadget,"xmlfile");
				$strHTML = get_tablehtml_fromxmlfile($strXmlFile);
				break;
			case "tabcontrol":
				$strXmlFile = getxml_childnode_content($aGadget,"xmlfile");
				$strHeight = $aGadget->get_attribute("height");
				$oTabControl = load_tab_form($strXmlFile);
				$strHTML = $oTabControl->draw($strHeight,'');
				break;
			case "iframe":
				$strHTML = process_iframe_html($aGadget);
				break;
			case "fusionchart":
				$strHTML = process_fusionchart($aGadget,$strPageXML);
				break;


			default:
		}
		return $strHTML;
	}

	//-- output a fusion chart
	function process_fusionchart($xmlGagdet,$strPageXML)
	{
		$chartType = getxml_childnode_content($xmlGagdet,"charttype");
		$dataURL = getxml_childnode_content($xmlGagdet,"dataurl");
		$height = getxml_childnode_content($xmlGagdet,"height");
		$width = getxml_childnode_content($xmlGagdet,"width");
		$bgcolor = getxml_childnode_content($xmlGagdet,"bgcolor");
		$divID = getxml_childnode_content($xmlGagdet,"divid");
		$height= "90%";
		if($divID=="")$divID="fuschart";
		if($width=="")$width="100%";
		if($height=="")$height="100px";
		//--91050
		$dataURL=parse_context_vars($dataURL);
		//--EOF F0091050
		include($dataURL);
		$strClassName =  basename($dataURL,".php");
		$oFusionChartData = new $strClassName;
		$strGraphXML = $oFusionChartData->getXML();

		//-- nwj 14.09.2009 - remove use of iframe and just use a div
		//$strURL = "fusioncharts/standard.php?charttype=" . $chartType ."&dataurl=" .$dataURL; 
		//$strIframeHTML = "<iframe src='".$strURL."' frameborder='0' border='0' style='width:".$width.";height:".$height.";'></iframe>";
		$strIframeHTML = "<div id='".$divID."' style='width:".$width.";height:".$height.";'></div>";
//		$strIframeHTML .= "<script autoload>alert('".$divID."'+'".$chartType."'+ \"".$strGraphXML."\"+'".$strPageXML."');</script>";
		$strIframeHTML .= "<script autoload>app.load_chart('".$divID."','".$chartType."', \"".$strGraphXML."\",'".$strPageXML."');</script>";
		return $strIframeHTML;
	}


	//-- function to output iframe gadget
	function process_iframe_html($xmlIframe)
	{
			//-- get url and output iframe
			$strURL = getxml_childnode_content($xmlIframe,"url");
			$strIframeHTML = "<iframe src='".$strURL."' frameborder='0' border='0' style='width:100%;height:100%;'></iframe>";
			return $strIframeHTML;
	}

	//--
	//-- function to output shortcuts
	function process_shortcut_html($xmlShortCut)
	{
		GLOBAL $customer_session;

		$arrNodes = $xmlShortCut->get_elements_by_tagname("shortcut");
		foreach ($arrNodes as $nodePos => $aNode)
		{
			//-- can we process this shortcut
			$boolOK=true;
			$strFunctionToEval = $aNode->get_attribute("accessfunction");
			if($strFunctionToEval!="")
			{
				$strFunctionToEval=parse_context_vars($strFunctionToEval);
				eval("\$boolOK = ".$strFunctionToEval.";");
				if($boolOK==false)continue;
			}

			//-- check webflag
			$strFlagToEval = $aNode->get_attribute("webflag");
			if($strFlagToEval!="")
			{
				//-- test customers permission
				eval("\$strWebFlag = ".$strFlagToEval.";");
				if($customer_session->IsOption($strWebFlag)==false)
				{
					//-- user does not have menu permission
					$boolOK=false;
				}
				if($boolOK==false)continue;
			}

			//-- check config flag
			$strFlagToEval = $aNode->get_attribute("configflag");
			if($strFlagToEval!="")
			{
				//-- test config permission
				eval("\$strConfigFlag = ".$strFlagToEval.";");
				if(!($_SESSION['config_flags']&$strConfigFlag))
				{
					//-- config does not have menu permission
					$boolOK=false;
				}
				if($boolOK==false)continue;
			}

			//-- get box style
			$strStyle = $aNode->get_attribute("style");
			if($strStyle=="")$strStyle = "shortcut";

			//-- get title style
			$strTitleStyle = $aNode->get_attribute("titlestyle");
			if($strTitleStyle=="")$strTitleStyle = "shortcut-title";

			//-- get info style
			$strInfoStyle = $aNode->get_attribute("infostyle");
			if($strInfoStyle=="")$strInfoStyle = "shortcut-info";

			//-- get image style - easy to change image and position then
			$strImgStyle = $aNode->get_attribute("imgstyle");
			if($strImgStyle=="")$strImgStyle = "shortcut-img-default";
	
			$strTitle = parse_context_vars(getxml_childnode_content($aNode,"title"));
			$strInfo = parse_context_vars(getxml_childnode_content($aNode,"info"));

			//-- get action node and process : 
			$arrActionNodes = $aNode->get_elements_by_tagname("action");
			$nodeAction = $arrActionNodes[0];
			$strActionType = $nodeAction->get_attribute('type');
			$strAction = $nodeAction->get_content();

			$strShortCutHTML .= "<div class='".$strStyle."'><div class='".$strTitleStyle."'>".$strTitle."</div><div class='".$strImgStyle."' onClick='run_gadget_action(this);' gtype='shortcut'  gactiontype='".$strActionType."' gaction='".$strAction."' ></div><div class='".$strInfoStyle."'><a href='#' onClick='run_gadget_action(this);' gtype='shortcut'  gactiontype='".$strActionType."' gaction='".$strAction."' class='shortcut-a'>". $strInfo. "</a></div></div>";
		}	

		return $strShortCutHTML;
	}

	//-- generate output for a counter gadget
	function process_counter_html($xmlCounter)
	{
		$strHTML = "";
		$arrNodes = $xmlCounter->get_elements_by_tagname("counter");
		foreach ($arrNodes as $nodePos => $aCounter)
		{
			$strCountType = $aCounter->get_attribute("type");
			switch ($strCountType)
			{
				case "sql":
						$strHTML .= process_sql_counter($aCounter);
					break;
				case "php":
						$strHTML .= process_phpeval_counter($aCounter);
					break;

			}
		}
		
		//-- no counter so display defualt message
		if($strHTML=="")
		{
			$arrNodes = $xmlCounter->get_elements_by_tagname("defaultmessage");
			if($arrNodes)
			{
				$strDefaultMessage = parse_context_vars($arrNodes[0]->get_content("defaultmessage"));
				$strStyle = $arrNodes[0]->get_attribute("style");
				if($strStyle=="")$strStyle="counter-default";
			}

			$strHTML="<div class='".$strStyle."'>".$strDefaultMessage."</div>";
		}
		return $strHTML;
	}

	function process_sql_counter($xmlCounter)
	{
		//-- dsn info and connect
		$strDSN = $xmlCounter->get_attribute("dsn");
		$strUID = $xmlCounter->get_attribute("user");
		$strPWD = $xmlCounter->get_attribute("pwd");

		//-- create or share a connection
		if(isset($GLOBALS['activepageconnections'][$strDSN]))
		{
			//-- share conn
			$dsnConn = $GLOBALS['activepageconnections'][$strDSN];
		}
		else
		{
			$dsnConn = database_connect($strDSN,$strUID,$strPWD);
			$GLOBALS['activepageconnections'][$strDSN] = $dsnConn;
		}

		//-- exec sql
		if($dsnConn)
		{
			//-- execute sql
			$strSQL = parse_context_vars(getxml_childnode_content($xmlCounter,"sql"));
			$oRS = $dsnConn->Query($strSQL,true);
			if($oRS)
			{
				//-- call function to determine counter output
				$countValue = $oRS->f('counter');
				$strHTML = process_counter_value_output($xmlCounter, $countValue);
				return $strHTML;
			}
			else
			{
				return "Could not execute sql";
			}
		}
		else
		{
			return "Could not connect to DSN";
		}
	}

	function process_phpeval_counter($xmlCounter)
	{
		//-- call php function to get a return value

		//-- call function to determine counter output
		$strHTML = process_counter_value_output($xmlCounter, $countValue);
		return $strHTML;

	}

	function process_counter_value_output($xmlCounter, $countValue = 0)
	{
		//-- work out which style to use
		$strStyle = $xmlCounter->get_attribute("style");
		if($strStyle=="")$strStyle = "counter-default";

		//-- a href style
		$strHrefStyle = $xmlCounter->get_attribute("hrefstyle");
		if($strHrefStyle=="")$strHrefStyle = "counter-a";


		//-- should we show counter value - so we can hide if need be
		$iShowCount = $xmlCounter->get_attribute("showcount");
		if($iShowCount=="")$iShowCount = 1;

		//-- get expressions to determine style
		$arrNodes = $xmlCounter->get_elements_by_tagname("expression");
		foreach ($arrNodes as $nodePos => $aExp)
		{
			$strEval = $aExp->get_content();
			
			eval("\$boolExpTrue = ($countValue $strEval);");
			if ($boolExpTrue)
			{
				//-- check if we should skip this counter?
				$strSkip = $aExp->get_attribute("skip");
				if($strSkip=="1") return "";

				//-- override href style i.e change color depending on the count value!!
				$overrideStyle = $aExp->get_attribute("style");
				if($overrideStyle!="")$strHrefStyle = $overrideStyle;
			}
		}

		//-- get title and info then return html
		$strTitle = parse_context_vars(getxml_childnode_content($xmlCounter,"title"));
		$strAction = parse_context_vars(getxml_childnode_content($xmlCounter,"action"));
		$strActionType = getxml_childnode_att($xmlCounter,"action","type");
		$strCounterValue = ($iShowCount==0)?"":$countValue . " ";
		$strHTML = "<div class='".$strStyle."'><a href='#' onClick='run_gadget_action(this);' gtype='counter' counter='".$countValue."' gactiontype='".$strActionType."' gaction='".$strAction."' class='".$strHrefStyle."'>". $strCounterValue . $strTitle . "</a></div>";
	
		return $strHTML;
	}

	//-- end of counter functions
?>