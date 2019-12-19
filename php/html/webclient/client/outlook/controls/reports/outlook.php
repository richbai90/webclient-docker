<?php

//-- reports view
include('../../../../php/session.php');
include('../../../../php/db.helpers.php');




//-- get report folders xml
function xml_report_folders(&$oConn)
{
	$strXML = "";
	$strSelectFolders = "select folderid,parentid,name,flags from system_report_folders order by parentid, name";
	$folder_result = _execute_xmlmc_sqlquery($strSelectFolders,$oConn);
	while ($swFolderRow = hsl_xmlmc_rowo($folder_result)) 
	{ 
		$strXML .= "<folder fid='".$swFolderRow->folderid."' pid='".$swFolderRow->parentid."'>";
		foreach($swFolderRow as $key=>$value )
		{
			$strXML .=	"<".$key.">" . pfx($value) . "</".$key.">";
		}

		//if($swFolderRow->flags==1)
		//{
		//	$strXML .= "<childfolders>_injectfolder_".$swFolderRow->folderid."_</childfolders>";
		//}
		$strXML .= "</folder>";
	}
	
	return 	$strXML;
}


function xml_reports(&$oConn)
{
	GLOBAL $portal;
	$strXML = "";
	$strSelectFolders = "select reportid,folderid,reportname,template from system_reports_ex where datadic in('All','".$portal->application."') order by reportname";
	$dbresult = _execute_xmlmc_sqlquery($strSelectFolders,$oConn);
	while ($swFolderRow = hsl_xmlmc_rowo($dbresult)) 
	{ 
		$strXML .= "<report rid='".$swFolderRow->reportid."' fid='".$swFolderRow->folderid."'>";
		foreach($swFolderRow as $key=>$value )
		{
			$strXML .=	"<".$key.">" . pfx($value) . "</".$key.">";
		}

		$strXML .= "</report>";
	}

	return 	$strXML;
}


function custom_folders($base = "",$iParentID)
{
	GLOBAL $portal;
	if($base=="")$base = $portal->fs_sw_path . "php_reports/";

	$strXML = "";
	$x = 1;
	$repcount=1;
	$subdirectories=opendir($base);
	while (($subdirectory=readdir($subdirectories))!==false)
	{
		//-- exclude certain types of folder or file
		if($subdirectory == "cat.php")
			continue;
		if($subdirectory == "common")
			continue;
		if($subdirectory == "js")
			continue;
		if($subdirectory == "img")
			continue;
		if($subdirectory == "php")
			continue;
		if($subdirectory == "css")
			continue;
		if($subdirectory == "zz")
			continue;
		if($subdirectory == "zz_php")
			continue;

		$path=$base.$subdirectory;
		if (is_file($path) && strstr($subdirectory, ".php") && strstr($subdirectory, ".bak")===false)
		{
			//-- file
			$rid = $iParentID . "_" .$repcount++;
			$fileName = str_replace(".php","",$subdirectory);
			$strXML .= "<customreport rid='".$rid."' fid='".$iParentID."'>";
			$strXML .=	"<name>" . $fileName . "</name>";
			$strXML .= "</customreport>";
			continue;

		}
		else if (($subdirectory!='.') && ($subdirectory!='..') && !is_file($path))
		{
			//-- traverse dir for child dirs
			$fid = $x++ ."_".$iParentID;
			$strXML .= "<customfolder fid='".$fid."'>";
			$strXML .=	"<name>" . $subdirectory . "</name>";
			$strXML .=	"<parentid>" . $iParentID . "</parentid>";	
			$strXML .= "</customfolder>";
	        $strXML .= custom_folders($path.'/',$fid);
		}
	}

	return $strXML;
}


//-- connect to system db
$sysDB = connectdb("sw_systemdb",true);
$strXmlFolders = "<reports>".xml_report_folders($sysDB).xml_reports($sysDB).custom_folders("",0)."</reports>";

close_dbs();

?>

<html>
<head>
	<link rel="StyleSheet" href="tree.css" type="text/css" />
	<link rel="StyleSheet" href="reports.css" type="text/css" />
	<script>

		var undefined;
		var app = (opener)?opener:top;
		var jqDoc = app.jqueryify(document); //-- so can use jquery
		var reportTree;
		var oXmlReportInfo = app.create_xml_dom("<?php echo $strXmlFolders;?>");

		//-- load mail box folder info and change selected style
		var eSelectedDiv = null;
		function load_report_tree()
		{
			//-- init tree control
			reportTree = app.newtree('reportTree',document);
			reportTree.controlid = "div_folders";
			reportTree.config.folderLinks = true; //-- folder behave link nodes when clicked
			reportTree.config.useCookies = false;

			//
			//-- load system reports
			reportTree.add("folder_0","-1","<b>System Reports</b>",load_report_info,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,false);
			 //-- process folders 
			 var arrXFolders = oXmlReportInfo.getElementsByTagName("folder");
			 for(var x=0; x < arrXFolders.length;x++)
			{
				var strFolderPID = app.xmlNodeTextByTag(arrXFolders[x],"parentid");
				var strFolderName = app.xmlNodeTextByTag(arrXFolders[x],"name");
				var strDisplay = strFolderName;

				reportTree.add("folder_"+arrXFolders[x].getAttribute("fid"),"folder_"+strFolderPID,strDisplay,load_report_info,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,false);
			}
			 //-- process reports - 
			 var arrXFolders = oXmlReportInfo.getElementsByTagName("report");
			 for(var x=0; x < arrXFolders.length;x++)
			{
				var strTemplate = app.xmlNodeTextByTag(arrXFolders[x],"template");
				var strFolderName = app.xmlNodeTextByTag(arrXFolders[x],"reportname");
				var strDisplay = strFolderName;

				anode = reportTree.add("report_"+arrXFolders[x].getAttribute("rid"),"folder_"+arrXFolders[x].getAttribute("fid"),strDisplay,load_report_info,'','','treeimages/base.gif','treeimages/base.gif',false,true);
				anode._template = strTemplate;
				anode.ondblclick = run_report;
			}
	
			//--
			//-- load custom reports
			reportTree.add("cfolder_0","-1","<b>Custom HTML Reports</b>",rf,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,false);
			//-- custom dir structure
			 var arrXFolders = oXmlReportInfo.getElementsByTagName("customfolder");
			 for(var x=0; x < arrXFolders.length;x++)
			{
				var strFolderPID = app.xmlNodeTextByTag(arrXFolders[x],"parentid");
				var strFolderName = app.xmlNodeTextByTag(arrXFolders[x],"name");
				var strDisplay = strFolderName;

				reportTree.add("cfolder_"+arrXFolders[x].getAttribute("fid"),"cfolder_"+strFolderPID,strDisplay,rf,'','','treeimages/folder.gif','treeimages/folderopen.gif',false,false);
			}
			//-- customer reports
			 var arrXFolders = oXmlReportInfo.getElementsByTagName("customreport");
			 for(var x=0; x < arrXFolders.length;x++)
			{
				var strFolderName = app.xmlNodeTextByTag(arrXFolders[x],"name");
				var strDisplay = strFolderName;

				anode = reportTree.add("creport_"+arrXFolders[x].getAttribute("rid"),"cfolder_"+arrXFolders[x].getAttribute("fid"),strDisplay,rf,'','','treeimages/base.gif','treeimages/base.gif',false,true);
				anode._template = strTemplate;
				anode.ondblclick = run_customreport;
			}

			

			//-- output tree
			document.getElementById("div_folders").innerHTML = reportTree;
		}

		function rf(){}

		function load_report_info(aNode)
		{
			var strID = aNode.id;
			if(strID.indexOf("report_")==-1)return;

			var arrID = strID.split("_");
			var strReportID = arrID[1];

			//-- load report url in workspace iframe
			var strParams = "?ColourScheme=3&webclientreporting=1&sessid=" + app._swsessionid + "&reportid=" + strReportID +"&dd=" + app._application;
			var strURL = app.webroot +"/reports/reportinfo.php" + strParams;
			var targetDocument = app.getFrame("iform_swreports", app.oWorkspaceFrameHolder.document);
			targetDocument.document.location.href = strURL;

		}

		function run_report(aNode)
		{
			var strID = aNode.id;
			if(strID.indexOf("folder")==0)return;

			var arrID = strID.split("_");
			var strReportID = arrID[1];

			var strReportTemplate ="reportinfo.php";
			var tNode = reportTree.getNodeByID(strID);
			switch(tNode._template.toLowerCase())
			{
				case "simple list":
					strReportTemplate ="rpt_tmplt_lst.php";
					 break;
				case "group boxed list":
					strReportTemplate ="rpt_tmplt_boxgrplst.php";
					break
				 break;
				case "grouped list":
					strReportTemplate ="rpt_tmplt_grplst.php";
					 break;
				case "grouped value counter":
					strReportTemplate ="rpt_tmplt_valcnt.php";
					 break;
				case "value counter":
					strReportTemplate ="rpt_tmplt_valcntlst.php";
					 break;
			}


			//-- load report url in workspace iframe
			var strParams = "?ColourScheme=3&webclientreporting=1&sessid=" + app._swsessionid + "&reportid=" + strReportID +"&dd=" + app._application;
			var strURL = app._webserver +"reports/"+ strReportTemplate + strParams;
			var targetDocument = app.getFrame("iform_swreports", app.oWorkspaceFrameHolder.document);
			targetDocument.document.location.href = strURL;
				

		}

	function run_customreport(aNode)
	{
		var strReportPath = reportTree.getNodeTextPath("/",aNode);

		var strParams = "?ColourScheme=3&webclientreporting=1&sessid=" + app._swsessionid + "&dd=" + app._application;
		var strURL = app._webserver +"php_reports/"+strReportPath+".php"+ strParams;
		var targetDocument = app.getFrame("iform_swreports", app.oWorkspaceFrameHolder.document);
		targetDocument.document.location.href = strURL;

	}

	function initialise_outlook()
	{
		load_report_tree();
		_resize_div_folders(15)
	}

	function _resize_div_folders(iWidthAdj)
	{
		
		var oE = document.getElementById("div_folders");
		var oET = document.getElementById("div_top_title");
		if(oE!=null && oET!=null)
		{
			var iadjust = oET.offsetWidth - document.body.clientWidth;
			oE.style.width = document.body.clientWidth - iadjust - 5;

			if(app.isIE)
			{
				oE.style.height = document.body.clientHeight - oET.offsetHeight;
			}
			else
			{
				oE.style.height = document.body.clientHeight - oET.offsetHeight - 20;
			}
		}
	}

	</script>
</head>
<body onload='initialise_outlook();' onmousedown="app.hide_application_menu_divs();" onresize="_resize_div_folders(0)" onkeydown="return app._handle_portal_keystrokes(event);" oncontextmenu="return app.stopEvent();">
<div id='div_top_title' class='div-title-top'>Report Browser</div>
<div id='div_folders'></div>
</body>
</html>
