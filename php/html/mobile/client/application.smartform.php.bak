<?php 	$boolMenu = true;
	
	if(!isset($_SESSION['swstate']))
	{
		$_SESSION['swstate'] = $_POST['swstate'];
	}

	include_once(_get_file_loc("[:_swm_client_path]/_helpers/menu.php"));
	
	//-- output html for datalist
	function _swm_process_datalist($xmlList,$xmlDefintionFilePath,$strWhere = "",$strSortBy = "")
	{
		//-- perhaps include helper file here with data list actions?
		include_once("application.datalist.php");
		return _swm_datalist_init($xmlList,$xmlDefintionFilePath,$strWhere,$strSortBy);
	}

	//-- output html for local list
	function _swm_process_locallist($xmlList,$xmlDefintionFilePath)
	{
		//-- perhaps include helper file here with data list actions?
		include_once("application.locallist.php");
		return _swm_locallist_init($xmlList,$xmlDefintionFilePath);
	}

	//-- output html for search
	function _swm_process_search($xmlList,$xmlDefintionFilePath,$strWhere = "",$strSortBy = "")
	{
		//-- perhaps include helper file here with data list actions?
	}

	$strOrigTargetView = $strTargetView;
	//-- parse path in case need to swap out vars
	$strTargetView = _swm_parse_string($strTargetView);
	if(strpos($strTargetView,".xml")!==false)
	{
		//-- if we cannot find the xml file then generate error
		$filepath = _get_file_loc($strTargetView); 
		if(!file_exists($filepath))
		{
			echo "The definition file for this view is missing. Please contact your Administrator."; 
			exit;
		}

		if (!$dom = @domxml_open_file($filepath))
		{
			echo "Error while loading the requested document. Please contact your Administrator.";
			exit;
		}

		$root = $dom->document_element();
		if(!$root)
		{
			echo "The view xml is not defined correctly. Please contact your Administrator.";
			exit;
		}


		//--
		//-- accepted post params for this form and if not posted set any defaults if defined
		$xmlPostParams = $root->get_elements_by_tagname("acceptedpostparams");
		if($xmlPostParams[0])
		{
			$xmlParams = $xmlPostParams[0]->get_elements_by_tagname("param");
			foreach($xmlParams as $pos => $aParam)
			{
				//-- get name
				$xmlParamName = $aParam->get_elements_by_tagname("name");
				$strName = ($xmlParamName[0])?$xmlParamName[0]->get_content():"";

				//-- if param has not been param passed in see if we have a default value for it
				if(!isset($_POST[$strName]))
				{
					//-- get default value - parse it as it may have post param bindings in it
					$xmlParamValue = $aParam->get_elements_by_tagname("default");
					$strDefaultValue = $xmlParamValue[0]->get_content();
					$_POST[$strName] = $strDefaultValue;
				}
			}
		}

		//-- at this point we have processed any incoming var checks
		//-- so loop all posted variables as parse
		foreach($_POST as $strParam => $varValue)
		{
			if(strpos($varValue,"[:")!==false)
			{
				$_POST["pp_".$strParam] = $varValue;
				$_POST[$strParam] = _swm_parse_string($varValue);
			}
		}

		$strOutputControlHtml = "";

		//-- smartforms have defined layers - and in each layer you have a type of control (tab / activepage / touchform)
		$xmlContentLayers = $root->get_elements_by_tagname("content");
		foreach($xmlContentLayers as $pos => $xLayer)
		{
			$xmlLayers = $xLayer->get_elements_by_tagname("layer");
			foreach($xmlLayers as $pos => $xLayer)
			{
				$strOutputControlHtml .= "<div id='_swm_layer_content_".$pos."' name='_swm_layer'>";

				//--
				//-- get any layer specific includes - all post vars will be availble to these
				$xmlIncludes = $xmlLayers[0]->get_elements_by_tagname("includes");
				if($xmlIncludes[0])
				{
					$xmlIncludes = $xmlIncludes[0]->get_elements_by_tagname("include");
					foreach($xmlIncludes as $incpos => $xInclude)
					{
						$strIncludeFile = _swm_parse_string($xInclude->get_content());
						if(file_exists($strIncludeFile))include_once($strIncludeFile);
					}
				}

				//-- get type
				$strType = $xLayer->get_attribute("type");
				switch($strType)
				{
					case "datalist":
						$arrDataC = $xLayer->get_elements_by_tagname('list');
						$strOutputControlHtml .= _swm_process_datalist($arrDataC[0],$strTargetView);
						break;
					case "localrowlist":
						$arrDataC = $xLayer->get_elements_by_tagname('list');
						$strOutputControlHtml .= _swm_process_locallist($arrDataC[0],$strTargetView);
						break;
					case "activepage":
						$strContent = _swm_parse_string($xLayer->get_content());
						$strContent = _get_file_loc($strContent);
						ob_start();
						include(trim($strContent));
						$strOutputControlHtml .= trim(ob_get_clean());
						break;
					case "searchpage":
						$filepath = $strTargetView;
						include_once("application.search.php");
						break;
					case "logcall":
						$boolMenu = false;
						$filepath = $strTargetView;
						echo get_menu($root);
						if($_SESSION['callActionErrorMsg']!="")
							echo "<span class='datared'>".$_SESSION['callActionErrorMsg']."</span>";
						include_once("application.logcall.php");
						break;
					case "touchform":
						break;
					default:
						echo "The defined layer [".$strType."] is not supported. Please contact your Administrator.";
						exit;
				}

				//-- close off layer
				$strOutputControlHtml .= "</div>";
			}
		}
	}
	else if(strpos($strTargetView,".php")!==false)
	{
		foreach($_POST as $strParam => $varValue)
		{
			if(strpos($varValue,"[:")!==false)
			{
				$_POST["pp_".$strParam] = $varValue;
				$_POST[$strParam] = _swm_parse_string($varValue);
			}
		}
		@include($strTargetView);
		exit;
	}
	else if(strpos($strTargetView,".html")!==false || strpos($strTargetView,".htm")!==false)
	{
		foreach($_POST as $strParam => $varValue)
		{
			if(strpos($varValue,"[:")!==false)
			{
				$_POST["pp_".$strParam] = $varValue;
				$_POST[$strParam] = _swm_parse_string($varValue);
			}
		}
		//-- open file and echo out
		$strFileHTML = file_get_contents($strTargetView);
		echo $strFileHTML;
		exit;
	}
	else
	{
		echo "The defined target view is not supported. Please contact your Administrator.";
		exit;
	}

?>
<html>
	<head>
	<title>Hornbill Mobile Portal (ITSM)</title>
	<?php if (file_exists("client/_custom/mobile.css")) { ?>
		<link href="client/_custom/mobile.css rel="stylesheet" type="text/css" />
	<?php } ?>
	<?php if (file_exists("client/_custom/mobile.js")) { ?>
		<script src="client/_custom/mobile.js"></script>
	<?php } ?>
	<link href="client/_system/mobile.css" rel="stylesheet" type="text/css"/>
	<script src="client/_system/mobile.js"></script>
	<!--<script type="text/javascript" src="https://getfirebug.com/firebug-lite.js"></script>-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=1" />
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	</head>
	<style>
		input
		{
			width:100%;
			border:1px solid #dfdfdf;
		}
		input.radio
		{
			width:0;
		}

		textarea
		{
			border:1px solid #dfdfdf;
		}

		.tablinks
		{
			padding-top:4px;
			background-color:#F8F8F8;
		}

		.atablink
		{
			position:relative;
			top:3px;
			*top:0px;

			border:1px #dfdfdf solid;
			*border-bottom:1px #EDEFF4 solid;
			padding:4px 4px 4px 4px;
			background-color:#EDEFF4;
			color:#3B5998;

			font-size:80%;
			font-weight:bold;
			text-align:center;

			margin-left:5px;
			margin-right:2px;
		}

		.atablink-selected
		{
			position:relative;
			top:3px;
			*top:1px;

			border:1px #dfdfdf solid;
			border-bottom:1px #ffffff solid;
			padding:4px 4px 4px 4px;
			background-color:#ffffff;
			color:#3B5998;

			font-size:80%;
			font-weight:bold;
			text-align:center;

			margin-left:5px;
			margin-right:2px;
		}


		.tabcontent
		{
			height:100%;
			background-color:#ffffff;
			border:1px #dfdfdf solid;
		}
		.iftabcontent
		{
			background-color:#ffffff;
			border-width:0px;
			height:100%;
			width:100%;
		}

		.tabset-inactive
		{
			position:relative;
			margin-left:8px;
			margin-bottom:2px;
		}
		.tabset
		{
			position:relative;
		}
		.datalist-header
		{
			font-family:"Trebuchet MS";
		}

		.datalist-header-none
		{
			font-family:"Trebuchet MS";
			display:none;
		}
		.display-none
		{
			display:none;
		}
	</style>

	<!-- datalists -->
	<style>
		.viewlayout
		{
			font-family:tahoma;
			color:#3B59AA;
			background-color:#ffffff;
			overflow-x:hidden;
		}

		.listrow
		{
			padding:0px 3px 0px 3px;
			border-width:0px 0px 0px; 0px;
			border-color:#dfdfdf;
			border-style:solid;

		}

		.listrow-splitter
		{
			font-size:1px;
			border-style:solid;
			border-width:0px 0px 1px; 0px;
			border-color:#dfdfdf;
			width:100%;
			height:2px;
		}

		.condition
		{
			margin-top:5px;
			font-size:65%;
			text-align:center;
			height:16px;width:16px;
			background-color:#ffffff;
			border:1px solid #ffffff;
		}


		.escalated
		{
			background-repeat:no-repeat;
			background-position:50% 50%;

			margin-top:5px;
			font-size:80%;
			
			height:21px;width:16px;
			background-color:#ffffff;
			color:#ffffff;
			border:1px solid #ffffff;

			text-align:center;
		}


		.databold
		{
			font-weight:bold;
			font-size:75%;
		}

		.datanormal
		{
			color:#000000;
			font-size:75%;
		}

		.datared
		{
			background: none;
			color:red;
		}

		.datasmall
		{
			color:#000000;
			font-size:65%;
		}

		.dataactionnormal
		{
			border-width:0px 0px 0px 0px;
			background-color:#ffffff;
			color:#3B59AA;
			font-size:100%;
		}


		.dataactionsmall
		{
			border-width:0px 0px 0px 0px;
			background-color:#ffffff;
			color:#3B59AA;
			font-size:75%;

		}

	</style>


	<!-- layer settings styles -->
	<style>

		.layer_padding
		{
			padding:30px;
		}

		.layer_settings_icon
		{
			background-image:url(images/settings.png);
			background-repeat:no-repeat;
			background-position:50% 50%;
			width:18px;
			height:18px;
			position:absolute;
			right:1%;
			top:2px;
			background-color:#ffffff;
		}

		.layer_settings
		{
			color:#000000;
			font-family:arial;
			width:100%;
			height:100%;
			position:absolute;
			background-color: rgba(255, 255, 255, 0.6);
			*background-color:#ffffff;
			display:none;
		}

		.layer_setting
		{
			border-width:1px 1px 0px 1px;
			border-style:solid solid solid solid;
			border-color:#808080 #808080 #ffffff #808080;
			background-color: rgba(255, 255, 255, 1);
		}


		.settings_button_apply
		{
			position:relative;top:-2px;
			border-width:0px 1px 1px 1px;
			border-style:solid solid solid solid;
			border-color:#808080 #808080 #808080 #808080;
			background-color:#efefef;
			color:#000000;
			padding:5px;
			width:50%;
			font-size:150%;
		}
		.settings_button_cancel
		{
			position:relative;top:-2px;
			border-width:0px 1px 1px 0px;
			border-style:solid solid solid solid;
			border-color:#808080 #808080 #808080 #808080;
			background-color:#efefef;
			color:#000000;
			padding:5px;
			width:50%;
			font-size:150%;
		}

		.setting_title
		{
			color:#ffffff;
			background-color:#0F8ECB;
			background-color:#3B5998;
			
			font-size:80%;
			font-family:arial;
			font-weight:bold;
			padding:5px 5px 5px 5px;
		}

		.setting_label
		{
			font-size:110%;
			font-family:arial;
			color:#000000;
			padding-bottom:2px;
			padding-top:2px;
			height:18px;
		}

		.setting_label_info
		{
			font-size:75%;
			font-family:arial;
			color:#0F8ECB;
			color:#808080;

		}

		.setting_option
		{
			color:#ffffff;
			font-weight:normal;
			padding:2px 20px 5px 5px;

			border-bottom:1px solid #808080;
		}

		.setting_option_radio
		{
			background-image:url(images/forms/radio.png);
			background-repeat:no-repeat;
			background-position:50% 50%;
			width:18px;
			height:18px;
		}

		.setting_option_radio_checked
		{
			background-image:url(images/forms/radio-checked.png);
			background-repeat:no-repeat;
			background-position:50% 50%;
			width:18px;
			height:18px;
		}

		.setting_option_checkbox
		{
			background-image:url(images/forms/checkbox.png);
			background-repeat:no-repeat;
			background-position:50% 50%;
			width:18px;
			height:18px;

		}

		.setting_option_checkbox_checked
		{
			background-image:url(images/forms/checkbox-checked.png);
			background-repeat:no-repeat;
			background-position:50% 50%;
			width:18px;
			height:18px;
		}

		.seperator
		{
			border-width:1px;
			border-style:solid;
			border-color:#6D86B7;
		}

		.homepage td.count
		{
			font-size:16px;
			text-align:right;
		}

		.homepage td.limage
		{
			width:40px;
		}

		.homepage img
		{
			/*height:30px;
			padding: 0 20;*/
		}

		div.grptitle
		{
			background-image: url("client/_system/images/grp_bg.jpg");
			background-repeat: repeat-x; 
			height:34px;
			width:100%;
		}

		span.grptitlecontainer
		{
			position:relative;
			text-align:left;
			color: #FFFFFF;
			width:100%;
		}
		span.grptitle
		{
			position: absolute;
			top:35%;
			text-align:left;
			color: #FFFFFF;
			padding: 8px 0 0 10px;
			font-weight:bold;
			white-space:nowrap;
		}

		input.call_srch
		{
			width:80%;
			/*height:2.5em;
			-webkit-border-radius: 5px;
			-moz-border-radius: 5px; 
			border-radius: 5px; */
		}

		select.call_srch
		{
			/*height:3em;*/
			width:80%;
			-webkit-border-radius: 5px;
			-moz-border-radius: 5px; 
			border-radius: 5px; 
			font-size:18px;
		}

		table.calldetail
		{
			color: black;
			font-family:Trebuchet MS;
		}
		td.boldcalldetail
		{
			font-weight:bold;
		}

		.callhyperlink
		{
			COLOR: black;
			font-size:26px;
		}

		.nmlfontsize
		{
			font-size:16px;
		}

		.bluefont
		{
			COLOR: #3B59AA;
		}

		.blackfont
		{
			COLOR: black;
		}

	</style>

	<script>
		function setup_banner()
		{
			var menuHolder = document.getElementById("menutitle");
			parent.set_menu_text(menuHolder);

			var menuHolder = document.getElementById("leftaction");
			parent.set_left_action(menuHolder);

			var menuHolder = document.getElementById("rightaction");
			parent.set_right_action(menuHolder);
		}

		function set_menu_text(strTitle)
		{
			var oMenu = document.getElementById("_menuHolder");
			if(oMenu!=null)
			{
				oMenu.innerHTML = strTitle;
			}		
		}

		//-- js for processing a tab link
		function _process_row_link(aBtn)
		{
			var strDef = aBtn.getAttribute("xmldefinitionpath");
			if(strDef!="")
				_process_navigation(strDef);
			return;
		}

		function _search_call_details(aLink)
		{
			var searchEle = document.getElementById("callrefsearch");
			var searchValue = searchEle.value;
			var xmlPath = aLink.getAttribute("xmlpath");

			var arrVars = new Array();
			arrVars["_callref"]=searchValue;
			arrVars["_callreffmt"]="Search for call reference:"+searchValue;

			_open_record(aLink,xmlPath,arrVars);
			return;
		}


		function _open_cust_details(aLink)
		{
			xmlPath = aLink.getAttribute("xmlpath");

			var arrVars = new Array();
			arrVars["_keysearch"]=aLink.getAttribute("keysearch");

			_open_record(aLink,xmlPath,arrVars);
			return;
		}

		function _open_asset_details(aLink)
		{
			xmlPath = aLink.getAttribute("xmlpath");

			alert(xmlPath);
			var arrVars = new Array();
			arrVars["_cmdb_id"]=aLink.getAttribute("cmdb_id");

			alert(arrVars["_cmdb_id"]);
			_open_record(aLink,xmlPath,arrVars);
			return;
		}

		function _open_call(xmlPath,strCallref)
		{
			var arrVars = new Array();
			arrVars["_callref"]=strCallref;

			_open_record(null,xmlPath,arrVars);
		}

		function _open_call_details(aLink,xmlPath,arrVars)
		{
			xmlPath = aLink.getAttribute("xmlpath");

			var arrVars = new Array();
			arrVars["_callref"]=aLink.getAttribute("callref");
			arrVars["_callreffmt"]=aLink.getAttribute("callreffmt");

			_open_record(aLink,xmlPath,arrVars);
		}

		function _open_call_offhold_details(aLink)
		{
			xmlPath = aLink.getAttribute("xmlpath");

			var arrVars = new Array();
			arrVars["_callref"]=aLink.getAttribute("callref");
			arrVars["_frmaction"]=aLink.getAttribute("action");
			arrVars["mpohld_key"]=aLink.getAttribute("strkey");

			_open_record(aLink,xmlPath,arrVars);
		}

		function set_cancel(aSelect)
		{
			if(aSelect.value==0)
			{
				var strText = "This call has been cancelled because the user has resolved the problem and called to cancel the request.";
				var oEle = document.getElementById('cncl_ref');
				if(oEle!=null)
				{
					oEle.setAttribute("class", "display-none");
					oEle.setAttribute("className", "display-none");
				}
				var oEle = document.getElementById('updatetxt');
				if(oEle!=null)
				{
					oEle.value = strText;
					oEle.setAttribute("readOnly", true);
				}
			}
			else if(aSelect.value==1)
			{
				var strText = "This call has been cancelled because it was a duplicate log of F0000000";
				var oEle = document.getElementById('cncl_ref');
				if(oEle!=null)
				{
					oEle.setAttribute("class","");
					oEle.setAttribute("className","");
				}
				var oEle = document.getElementById('updatetxt');
				if(oEle!=null)
				{
					oEle.value = strText;
					oEle.setAttribute("readOnly", true);
				}
			}
			else if(aSelect.value==2)
			{
				var strText = "<Type your reason for cancelling the call>";
				var oEle = document.getElementById('cncl_ref');
				if(oEle!=null)
				{
					oEle.setAttribute("class", "display-none");
					oEle.setAttribute("className", "display-none");
				}
				var oEle = document.getElementById('updatetxt');
				if(oEle!=null)
				{
					oEle.value = strText;
					oEle.setAttribute("readOnly", false);
				}
			}
		}
		function set_cancel_text(aText)
		{
			var strValue = "";
			var intValue = aText.value;
			if(isNaN(intValue))
			{
				intValue = intValue.substring(1);
				if(isNaN(intValue))
				{
					strValue = "F0000000";
				}
			}

			if(strValue=="")
			{
				var strValue = intValue + "";
				var padZero = 7-strValue.length
				for(var x=0; x < padZero;x++)
				{
					strValue = "0" + strValue;
				}

				strValue = "F" + strValue;
			}

			aText.value = strValue;
			var strText = "This call has been cancelled because it was a duplicate log of "+strValue;
			var oEle = document.getElementById('updatetxt');
			if(oEle!=null)
			{
				oEle.value = strText;
			}
		}
	</script>
	<?php 		if($boolMenu)
			echo get_menu($root);
	?>
	<body class='applayout' <?php 		if($_SESSION['_exiterror']!="")
			echo 'onload="'.$_SESSION['_exiterror'].'"';
		echo ">";
		echo $strOutputControlHtml;
		?><form id='frmContentLoader' target="_self" method='post' action='index.php' >
			<input type='hidden' name='_action' id='_action' value='_navig'>
			<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
			<input type='hidden' name='swstate' id='swstate' value='<?php echo _html_encode($GLOBALS['swstate']);?>'>
			<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
			<?php echo $strOtherInputs;?>
		</form>
		<form style='display:none;' target="_self" method='post' action='index.php' id='frmExit'>
			<input type='hidden' name='_exiterror' id='_exiterror'>
		</form>
	</body>
</html>