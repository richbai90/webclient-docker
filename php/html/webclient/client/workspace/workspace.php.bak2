<?php

	//header("x-frame-options","SAMEORIGIN");

	error_reporting(E_ERROR);

	include('../../php/session.php');
	include('../../php/xml.helpers.php');


	$strParams = "'" . $_REQUEST['controltype'] ."','".$_REQUEST['controlid']."'";

	//-- control processors
	include("_controls/hslviews.processing.php"); //-- functions to read in hsl views defs and then use controls to draw them out
	include('_controls/tabcontrol/tabcontrol.php');
	include('_controls/datatable/tablecontrol.php');
	include('_controls/toolbar/toolbarcontrol.php');
	

	//-- use standard app view
	$strFileName = "_views/". $_REQUEST['controltype'] . "/layout.xml";


	//-- get contents and generate workspace view
	$arrDropMenus = Array();
    $xmlfp = file_get_contents($strFileName);
    $xmlDoc = domxml_open_mem($xmlfp);
    if($xmlDoc)
    {
		$intViewCount = 0;
		$boolLoop = false;
		$strLayoutHtml = "";
		//-- either two columns or just one
		$strLastControl = "";
		$arrViewNodes = $xmlDoc->get_elements_by_tagname("view");
		foreach ($arrViewNodes as $aViewNode)
		{	
			//-- if we have done more than a loop then need to add a resizer
			if($intViewCount>0)
			{
				if($strLastControl!="toolbar")
				{
					$strLayoutHtml .= "<div id='workspace-resizer' onmousedown='start_resize_workspace(this,".($intViewCount-1).",".($intViewCount).");' style='font-size:3px;cursor:s-resize;height:3px;'></div>";
				}
			}

			//-- check if view is fixed height
			$strHeight = $aViewNode->get_attribute("height");
			if($strHeight=="")$strHeight="auto";
		

			$strID = "td_workspace_". $intViewCount;

			$strContextJS = "";
			$strContentMenuHandler = $aViewNode->get_attribute("contexthandler");
			if($strContentMenuHandler) $strContextJS = "oncontextmenu='return ".$strContentMenuHandler."(this,event);'";

			$strClickJS = "";
			$strClickHandler = $aViewNode->get_attribute("clickhandler");
			if($strClickHandler) $strClickJS = "onclick='return ".$strClickHandler."(this,event);'";

			//-- create div container
			$strLayoutHtml .= "<div class='workspace-div' id='".$strID."' style='height:".$strHeight.";' ".$strContextJS." ".$strClickJS.">";
			
			//-- get control layout html
			$strControlType = $aViewNode->get_attribute("type");
			$strLastControl = $strControlType;
			$strLayoutHtml .= process_control_html($strControlType);

			//-- end layout
			$strLayoutHtml .="</div>";

			//-- ind that we have done one loop
			$intViewCount++;
		}
		//$strLayoutHtml .= "</table>";
	}


	function process_control_html($strControlType)
	{
		$_controltype = $_REQUEST['controltype'];
		$_controlid = $_REQUEST['controlid'];
		$_appid = $_REQUEST['appid'];

		switch(strToLower($strControlType))
		{
			case "helpdesk_top":
			case "helpdesk_bottom":
				$strFunction = "_swc_".$strControlType;
				$strHTML = $strFunction($_appid, $_controlid,$_controltype);        
				break;
			case "toolbar":
				$strFunction = "_swc_toolbar";
				$strHTML = $strFunction($_appid, $_controlid,$_controltype);        
				break;
			case "datatable":
				$strFunction = "_swc_table_".$_controltype;
				$strHTML = $strFunction($_appid, $_controlid,$_controltype);        
				break;
			case "activepage":
				$strFunction = "_swc_activepage_".$_controltype;
				$strHTML = $strFunction($_appid, $_controlid,$_controltype);        
				break;
			case "systempage":
				$strFunction = "_swc_systempage_".$_controltype;
				$strHTML = $strFunction($_appid, $_controlid,$_controltype);        
				break;
			case "systemtable":
				$strFunction = "_swc_systemtable";
				$strHTML = $strFunction($_appid, $_controlid,$_controltype);        
				break;
			default:
				$strHTML = "unsupported control type [".$strControlType."]. Please contact your Supportworks Administrator";
				break;
		}
	 	return $strHTML;
		
	}




?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<script>
var strControl = "<?php echo $_REQUEST['controltype'] .':' .$_REQUEST['controlid'];?>";
top.debugstart(strControl,"LOAD WORKSPACE")
</script>
<link rel="StyleSheet" href="_controls/tabcontrol/tabcontrol.css" type="text/css" />
<link rel="StyleSheet" href="_controls/datatable/datatable.css" type="text/css" />
<link rel="StyleSheet" href="_controls/toolbar/toolbar.css" type="text/css" />
<script src='../js/jquery-1.11.1.min.js'></script>
<script src="workspace.js"></script>

<style>

	*
	{
		/*font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;*/
		font-size:12px;font-family:Verdana,sans-serif;
	}

	body
	{
		padding:0px;
		margin:0px;
		ackground-color:#BFDBFF; /*ms exch blue */
		background-color:#F5F5F5; /* whitesmoke */
		background-color:#FAFAFA;
		overflow:hidden;
	}

	.workspace-div
	{
		display:block;
		width:99%;
		*width:100%;
		padding:0;
		margin:0;

		border-width:0px 0px 0px 0px;
		border-style:solid;
		border-color:#808080;

		overflow:hidden;
	}

	.layout-holder
	{
		overflow:hidden;
		display:block;
		width:100%;
		height:100%;
	}

	.activepage
	{
		border-width:1px;
		border-style:solid;
		border-color:#D5D4DF;
		height:100%;
		width:100%;
	
	}

	.notopborder
	{
		border-top:0px solid #D5D4DF;
	}

	#app-layout-vmover
	{
		display:none;
		position:absolute;
		height:3px;
		width:100%;
		font-size:3px;
		cursor:s-resize;
		background-color:#efefef;
		z-Index:99999;
	}

	pre
	{
		margin:0; padding:0;
	}

	#app-layout-float-div
	{
		display:none;
		position:absolute;
		height:100%;
		width:100%;
		background-color:#efefef;
		z-Index:9999;

		opacity: .0; 
		-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"; 
		filter: alpha(opacity=0); 

	}


</style>
<body onload="initialise();" onmouseup="end_resize_workspace();" onmousedown="app.hide_application_menu_divs(event)" oncontextmenu="return app.stopEvent(event);"  ondragstart="return false;" onselectstart="return false;" onResize="document_resize();" onkeydown="return _handlekeydown(event);" onkeyup="return _handlekeyup(event);">
<div id='app-layout-float-div'></div>
<div id='app-layout-holder' class='layout-holder'>
<?php echo $strLayoutHtml;?>
</div>
<div id='app-layout-vmover'></div>
<div id='datatable-colresizer'></div>
<div id='app-context-menu' class='menu-holder'></div>
<?php echo implode(",",$arrDropMenus);?>
</body>
</html>