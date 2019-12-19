<?php 	
	include("service/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include_once("domxml-php4-to-php5.php");
	$sessionID = gv("sessid");
	$workflowID = gv("wid");
	$workflowCallclass = gv("callclass");
	$selectCellID= gv("selectcell");

	if(is_null($workflowID))
	{
		include('splash.php');
		exit(0); //-- we are waiting for workflow id to be passed in
	}


	//-- get session id and bind - if no session id exit
	$sessionID = gv("sessid");
	if($sessionID!=null)
	{
		//-- bind session
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessionID);
		if(!$xmlmc->invoke("session","bindSession"))
		{
			echo $xmlmc->xmlresult;
			exit(0);
		}
	}
	else
	{
		echo "The Supportworks ESP session id was not found. Please contact your Administrator";
		exit(0);
	}

	//-- settings
	include('config.php'); //-- out of box settings
	@include("config.custom.php"); //-- customer can add their settings here

?>

<html>
<head>
    <title>Graph Editor</title>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" type="text/css" href="styles/grapheditor.css">
	<script type="text/javascript">


		// Public global variables
		var MAX_REQUEST_SIZE = 10485760;
		var MAX_WIDTH = 6000;
		var MAX_HEIGHT = 6000;
	
		// URLs for save and export
		var EXPORT_URL = '/export';
		var SAVE_URL = '/save';
		var OPEN_URL = '/open';
		var RESOURCES_PATH = 'resources';
		var RESOURCE_BASE = RESOURCES_PATH + '/grapheditor';
		var STENCIL_PATH = 'resources';
		var IMAGE_PATH = 'styles/images';
		var STYLE_PATH = 'styles';
		var CSS_PATH = 'styles';

		// Specifies connection mode for touch devices (at least one should be true)
		var tapAndHoldStartsConnection = true;
		var showConnectorImg = true;

		// Parses URL parameters. Supported parameters are:
		// - lang=xy: Specifies the language of the user interface.
		// - touch=1: Enables a touch-style user interface.
		// - storage=local: Enables HTML5 local storage.
		var urlParams = (function(url)
		{
			var result = new Object();
			var idx = url.lastIndexOf('?');
	
			if (idx > 0)
			{
				var params = url.substring(idx + 1).split('&');
				
				for (var i = 0; i < params.length; i++)
				{
					idx = params[i].indexOf('=');
					
					if (idx > 0)
					{
						result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
					}
				}
			}
			
			return result;
		})(window.location.href);

		// Sets the base path, the UI language via URL param and configures the
		// supported languages to avoid 404s. The loading of all core language
		// resources is disabled as all required resources are in grapheditor.
		// properties. Note that in this example the loading of two resource
		// files (the special bundle and the default bundle) is disabled to
		// save a GET request. This requires that all resources be present in
		// each properties file since only one file is loaded.
		mxLoadResources = false;
		mxBasePath = '../../../src';
		mxLanguage = urlParams['lang'];
		mxLanguages = ['en'];
	</script>
	<!-- core mxclient js -->
	<script type="text/javascript" src="js/core/mxClient.js"></script>

	<!-- application files -->
	<script type="text/javascript" src="js/Editor.js"></script>
	<script type="text/javascript" src="js/Graph.js"></script>
	<script type="text/javascript" src="js/EditorUi.js"></script>
	<script type="text/javascript" src="js/Actions.js"></script>
	<script type="text/javascript" src="js/Menus.js"></script>

</head>
<body class="geEditor">

	<!-- hsl anchor for performing fullclient actions - like opening forms  -->
	<a id='hslaction' href='hsl:swjscallback?function=nothing'></a>

	<script type="text/javascript">

		var ESP = {};
		ESP.sessionid = "<?php echo $sessionID?>";
		ESP.workflowid = "<?php echo htmlentities($workflowID)?>";
		ESP.workflowactive = false;
		ESP.callclass = "<?php echo $workflowCallclass;?>";
		ESP.selectcellid = "<?php echo $selectCellID;?>";


		//-- tab items to hide show
		ESP.workflowform_edit_hidetabitems = "<?php echo $workflowform_edit_hidetabitems;?>";
		ESP.stageform_edit_showtabitems = "<?php echo $stageform_edit_showtabitems;?>";
		ESP.stageform_editauth_showtabitems = "<?php echo $stageform_editauth_showtabitems;?>";
		ESP.stageform_editstartcond_showtabitems = "<?php echo $stageform_editstartcond_showtabitems;?>";
		ESP.stageform_editstatuscond_showtabitems = "<?php echo $stageform_editstatuscond_showtabitems;?>";

		function loadBpmWorkflow(strSelectCellID)	
		{
			var eui = ESP.editorUi;
			
			if(strSelectCellID==undefined && eui.editor && eui.editor.graph)
			{
				var aCell = eui.editor.graph.getSelectionCell();
				if(aCell)strSelectCellID = aCell.getId();
			}
			
			var time =  (new Date).getTime();
			var req = mxUtils.load("service/workflow/loadworkflow.php?wid="+encodeURIComponent(ESP.workflowid)+"&sessid=" + encodeURIComponent(ESP.sessionid) + "&t=" + time);
			eui.editor.setGraphXml(req.getXml().documentElement);
			var xmlDoc = req.getXml().documentElement;
			var bAutoLayout = (xmlDoc.getAttribute("fromdb")=="0");
			ESP.workflowactive = (xmlDoc.getAttribute("wfactive")=="1");

			//-- will happen first time load graph - or when graph has been modified outside of this ui
			if(bAutoLayout)
			{
				//-- always auto layout as its just neater - can't go wrong
				var layout = new mxHierarchicalLayout(eui.editor.graph);//,mxConstants.DIRECTION_WEST
				layout.intraCellSpacing = 200;
				layout.interRankCellSpacing =60;
				layout.disableEdgeStyle=false;

				//set layout
				eui.editor.graph.getModel().beginUpdate();
				layout.execute(eui.editor.graph.getDefaultParent());
				eui.editor.graph.getModel().endUpdate();

				//-- save it in db
				eui.editor.saveBpmGraphXml();

				eui.setStatusText("Workflow " + ESP.workflowid + " ready (auto layout)");
			}
			else
			{
				eui.setStatusText("Workflow " + ESP.workflowid + " ready (loaded from database)");
			}			
			
			var selectCell = (strSelectCellID==undefined)?"2":strSelectCellID;
			var getCell =  eui.editor.graph.getModel().getCell(selectCell);
			if(getCell)
			{
				eui.editor.graph.setSelectionCell(getCell);
				eui.editor.graph.scrollCellToVisible(getCell);
			}


			//-- make sure left hand pane shows workflow as inactive or active - depending on state (as may have changed state while editing)
			var alink = document.getElementById('hslaction');
			alink.removeAttribute("href");
			alink.setAttribute("href","hsl:callpanelfunction?panel=left&function=set_wf_linkstate&active="+xmlDoc.getAttribute("wfactive"));
			alink.click();
			
		}

		// Extends EditorUi to update I/O action states
		(function()
		{
			var editorUiInit = EditorUi.prototype.init;
			
			EditorUi.prototype.init = function()
			{
				editorUiInit.apply(this, arguments);

				//-- load workflow
				this.setStatusText("Loading workflow " + ESP.workflowid + "...please wait...");

				setTimeout("loadBpmWorkflow(ESP.selectcellid)",50);
			};
		})();

	
		ESP.editorUi = new EditorUi(new Editor());



	</script>
</body>
</html>


