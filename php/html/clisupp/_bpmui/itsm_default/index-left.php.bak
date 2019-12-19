<?php 	//-- list out application workflows 
	include("domxml-php4-to-php5.php");
	include("service/data.helpers.php"); //-- xmlmethocall & sqlquery classes

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
	
	//-- Get Session DataDictionary
	if($sessionID!=null)
	{
		//-- bind session
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessionID);
		if(!$xmlmc->invoke("session","getSessionInfo2"))
		{
			echo $xmlmc->xmlresult;
			exit(0);
		}else
		{
			$basic = $xmlmc->xmldom->get_elements_by_tagname("params");
			$basic = $basic[0];
			$DataSetFilterList = gxc($basic,"datasetFilterList");
			$dd = gxc($basic,"currentDataDictionary");
		}
	}

	//--
	//-- get list of workflows - by supported callclass
	include('config.php'); //-- out of box settings
	@include("config.custom.php"); //-- customer can add their settings here

	$defaultWID = null;
	$strWorkflowMarkup = "";
	if($dd == "") $dd="Default";
	$rs = new SqlQuery();	
	for($x=0;$x<count($arrSupportedCallclass);$x++)	{
		$filterClass = $arrSupportedCallclass[$x];
		$strWorkflowMarkup .= '<li class="top"><span class="folder">'.$filterClass.' Workflows 	<a href="#" class="actionbtn" act="addnew" callclass="'.$filterClass.'">Add New</a></span>';

		$rs->Query("select pk_workflow_id,flg_active from bpm_workflow where callclass= '".$filterClass."' and appcode IN (".$DataSetFilterList.") order by pk_workflow_id asc");
		while($rs->Fetch())
		{
			$wid = $rs->GetValueAsString("pk_workflow_id");
			$flgActive = $rs->GetValueAsNumber("flg_active");

			$strClass= "file";
			if($flgActive>0)$strClass.= " activated";
			$strWorkflowMarkup .= '<ul><li><a class="'.$strClass.'" href="hsl:swjscallback?function=load_workflow_ui&callclass='.$filterClass.'&wid='.htmlentities($wid).'">'.htmlentities($wid).'</a></li></ul>';		
		}

		$strWorkflowMarkup .= "</li>";
	}


?>
<html lang="en">
<head>  
	<meta charset="utf-8" />  
	<title>Dashboard</title>  
	<script language="JavaScript" src="../../jquery/jquery.min.js"></script>
	<script language="JavaScript" src="../../jquery/ui/jquery-ui.min.js"></script>
	<link rel="stylesheet" href="styles/jquery.treeview.css" />

	<style>

		*{margin:0px; padding:0px;	font-size:12px;font-family:Verdana,sans-serif;color:#696969;}

		body
		{
			overflow:auto;
			padding:2px 8x 2px 2px;
			margin-top:20px;
		}
		.hidden
		{
			display:none;
		}

		.actionbtn
		{
			font-size:11px;
			color:navy;
			padding:2px;
			float:right;
			position:relative;
			top:-2px;
			*top:-18px;
		}
		.importbtn
		{
			position:absolute;
			right:8px;
			top:0px;
			float:right;		
		}
	</style>
	
		<script language="JavaScript" src="../../jquery/jquery.min.js"></script>
	<script language="JavaScript" src="../../jquery/ui/jquery-ui.min.js"></script> 
	<script language="JavaScript" src="js/jquery.treeview.js"></script>

	<script>
		var loaded = false;
		$(document).ready(function()
		{
			$(".file").on("click",function(event)
			{  
				//-- remove default item active style when we first click another anchor
				$(".active").removeClass("active");
				$(this).addClass("active");

				$(".editdetails").show();
			});

			$(".actionbtn").on("click",function(event)
			{  
				//-- call hsl:action
				var alink = document.getElementById('hslAction');
				var strAction = $(this).attr("act");
				if(strAction=="addnew")
				{
					//-- prompt user for workflow name
					var forClass = $(this).attr("callclass");
					alink.setAttribute("href","hsl:swjscallback?function=bpmui_add_workflow&bpm_workflow.callclass=" + encodeURIComponent(forClass));
					alink.click();
				}

			});
		
		
		});

		function set_wf_linkstate(sActive)
		{
			if(sActive=="1")
			{
				$(".active").addClass("activated");
			}
			else
			{
				$(".active").removeClass("activated");
			}
		}
		
	</script>
</head>
<body>
	<a class="importbtn" href="hsl:swjscallback?function=load_workflow_import_export&bpm_workflow.callclass=123">Import / Export</a>
	<a id='hslAction' class="hidden" href="hsl:temp">Hsl Action Link To Perform Actions</a>
	<ul id="browser" class="workflowtree treeview-noline">
		<?php echo utf8_encode($strWorkflowMarkup);?>
	</ul>

</body>
</html>