<?php

	//-- only use compat mode if ie 9 or less
	if (isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
	{
		$IE9ORLESS = 1;
		if(strpos($_SERVER['HTTP_USER_AGENT'], 'Trident')!==false)
		{
			$IE9ORLESS = (preg_match("/Trident\/5.0/",$_SERVER['HTTP_USER_AGENT']) || preg_match("/Trident\/4.0/",$_SERVER['HTTP_USER_AGENT'])) ? 1 : 0;
		}	
		if($IE9ORLESS)
		{
			header('X-UA-Compatible: IE=edge');
		}
	}

	//error_reporting(E_ALL);
	include("services/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include("services/dashboard.helpers.php");

	function logon($uid,$pwd)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("userId",$uid);
		$xmlmc->SetParam("password",base64_encode($pwd));
		if(!$xmlmc->invoke("session","analystLogon"))
		{
			$errorMessage =$xmlmc->getLastError();
			include('login.php');
			exit();
		}
		else
		{
			$sessionID = $xmlmc->GetResultParam("SessionID");
			//-- store user id
			$_SESSION['sessid'] = $sessionID;
			$_SESSION['aid'] = $_POST["userid"];
			$_SESSION['pwd'] = $_POST["pwd"];
			$_SESSION['stl'] = "1";
		}
	}

	@session_start();


	$stlMode = gv("stl"); //-- standalone mode
	$sessionID = gv("sessid");
	if(isset($_COOKIE['ESPSessionState']))
	{
		$_core['_nexttoken'] = $_COOKIE['ESPSessionState'];
	}
	else if($sessionID!=null)
	{
		//-- bind session
		$bError=false;
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessionID);
		if(!$xmlmc->invoke("session","bindSession"))
		{
			if(gv("lo")!="1")
			{
				//-- check if we have session 
				logon($_SESSION['aid'],$_SESSION['pwd']);
			}
			else
			{
				$bError=true;
				$errorMessage =  xcc($xmlmc->xmldom,'error');
			}
		}
		else if(gv("lo")=="1") //-- logout
		{
			$bError=true;
			$xmlmc = new XmlMethodCall();
			$xmlmc->invoke("session","analystLogoff");
		}

		if($bError)
		{
			session_destroy();
			include('login.php');
			exit();
		}

	}
	else
	{
		if(isset($_POST["userid"]))
		{
			logon($_POST["userid"],$_POST["pwd"]);
		}
		else
		{
			include('login.php');
			exit();
		}
	}

	session_write_close();

	$groupID =  gv('gid'); 
	$configID = gv('cid');
	if($configID=="0")$configID=null;

	//-- check we have a passed in portal id (this will give us the dashboard configuration to load
	if(is_null($configID))
	{
		$strWhere = (is_null($groupID))?"":" where h_gid = ".pfs($groupID);
		$rs = new SqlQuery();
		$rs->Query("SELECT * FROM h_dashboard_groups $strWhere order by h_title asc","sw_systemdb");
		while($rs->Fetch())	
		{
			$strGrpID = $rs->GetValueAsNumber("h_gid");

			//-- get group dashboards - check access rights
			$rsBoards = new SqlQuery();
			$rsBoards->Query("select * from h_dashboard_boards where h_fk_dbg = " . $strGrpID . " order by h_title asc","sw_systemdb");
			if($rsBoards->Fetch())	
			{
				$configID = $rsBoards->GetValueAsString("h_dashboard_id");
				break;
			}
		}
	}

	//-- are we running in admin mode
	$intAdminMode = gv("iam");

	$portalMarkup = "";
	$widgetListMarkup = "";
	$strJavascriptIncludes = "";
	$rsConfiguration = get_dashboard_configuration($configID);
	if($rsConfiguration && $rsConfiguration->Fetch())
	{
		//-- get layout markup
		$portalMarkup = get_layout_markup($rsConfiguration->GetValueAsString("h_layout"),$configID);
		//$widgetListMarkup = get_layout_widgetlist($xmlConfiguration,$groupID,$configID);
	}
	else
	{
		if($intAdminMode!="1")echo "The dashboard configuration could not be loaded. Please contact your Administrator";
		exit;
	}

	//-- 
	if($portalMarkup=="")
	{
		echo "The dashboard configuration settings are not correctly defined. Please contact your Administrator";
		exit;
	}


	include('_css_switcher.php');
?>

<!doctype html>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<html lang="en">
<head>  
	<meta charset="utf-8" />  
	<title>Dashboard</title>  
	<link rel="stylesheet" href="css/smoothness/jquery-ui-1.10.2.custom.min.css" />  
	<link id='stylesheet' rel="stylesheet" href="css/dashboard.css" />  	
	<link id='stylesheet' rel="stylesheet" href="css/scorecard.css" />  	
	<link id='stylesheet' rel="stylesheet" href="<?php echo $cssFile;?>" />  	


	<script src="js/jquery-1.9.1.js"></script>  
	<script src="js/jquery-ui-1.10.2.custom.min.js"></script>  
	
	<script language="JavaScript" src="../fce/FusionCharts.js"></script>

	<script src="js/jquery.sparkline.min.js"></script>  


	<!-- scripting to manage each type of supported widget -->
	<script language="JavaScript" src="widgets/fusioncharts/fusionloader.js"></script>
	<script language="JavaScript" src="widgets/phpcontent/contentloader.js"></script>
	<script language="JavaScript" src="widgets/scorecard/scorecardloader.js"></script>


	<style>  
		body
		{
			overflow:auto;
		}

	</style>  

</head>
<body onload="handleFullScreen()" onresize="handleFullScreen()">
	<a id='hslanchor' href="hsl:anchor" style='display:none'></a>
	<a id='dlanchor' href="#" style='display:none'></a>
	<div id='actionToolbar' class="topRight"><button id="btn-add-widget">add a widget to dashboard</button></div>  
	
	

	<?php

		//-- running in standalone mode
		$stlMode = gv("stl");
		if($stlMode=="1")
		{
			$xmlInfo = get_session_info();
			$privLevel = xcc($xmlInfo,"privLevel");
			$aid = xcc($xmlInfo,"analystId");

			$refreshInt = gv("ri");
			if($refreshInt==null)$refreshInt=60;
		
			?>
				<div id='standaloneToolbar'>
					<table height="100%" width="100%" border="0">
						<tr>
							<td noWrap>Group :</td>
							<td><select class="dashboardCategories"><?php echoget_user_accessible_dashboard_group_listboxoptions($aid,$privLevel);?></select></td>
							<td noWrap>&nbsp;&nbsp;&nbsp;</td>
							<td noWrap>Dashboard :</td>
							<td><select  class="categoryDashboards"><?php echoget_user_accessible_dashboard_listboxoptions($aid,$privLevel,$groupID,$configID);?></select></td>
							<td noWrap>&nbsp;&nbsp;&nbsp;</td>
							<td noWrap>Refresh Time (Mins) :</td>
							<td><input size="10" class="stlRefreshInterval" value="<?php echo $refreshInt;?>"></td>
							<td width="100%" align="right"><button class="btnLogout">Logout</button></td>
						</tr>
					</table>
					
				</div>
				<div class='toolbarGap'></div>

			<?php
		}
		echo $portalMarkup;
	?>


<script>  

	var ESP = {};
	ESP.main=true;
	ESP.sessionid = "<?php echo gv('sessid');?>";
	ESP.onWidgetReadyFunctions = [];
	ESP.groupid = "<?php echo $groupID;?>";
	ESP.dashboardid = "<?php echo $configID;?>";
	ESP.adminmode = "<?php echo $intAdminMode;?>";
	ESP.stlmode = "<?php echo $stlMode;?>";

	function fetch_and_load_widget(jEle)
	{
		var strWID = jEle.attr("id");
		var strGID = jEle.attr("gid");
		var strCID =jEle.attr("cid");

		var p = {};
			p.sessid = ESP.sessionid;
			p.gid=strGID;
			p.cid=strCID;
			p.wid=strWID;

			var serviceUrl = "services/loadwidget.php";
			$.post(serviceUrl, p, function(strMarkUp) 
										{  
											//-- add to 1st col 
											
											$(".column").first().prepend(strMarkUp);
											var eWidget = $(".column").first().find(".portlet").first();

											//-- attach behaviour and style to container
											eWidget.addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" ).find( ".portlet-header" ).addClass( "htl-widget-header").end();

											//-- fetch data/initialise
											var targetWidget = eWidget.find(".portlet-content").first();
											var f = ESP.onWidgetReadyFunctions[targetWidget.attr("wtype")];
											if(f)f(targetWidget);
										});
	}


	function initialise_measure_anchors(parent)
	{
		parent.find( ".anchor-drill-down" ).click(function()
		{

			var parent = $(this).closest(".portlet");
			var type = parent.attr("type");


			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.mid = $(this).closest("tr").attr("mid");

			var serviceUrl = "administration/adminservices/getmeasurerecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#drill-form").data("type",type);
												$("#drill-form").data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});
		});
	}

	function initialise_drilldown_btns(parent)
	{
		parent.find( ".btn-drill-down" ).button({text: false,icons: {primary: "ui-icon-bookmark"}}).click(function()
		{
			var parent = $(this).closest(".portlet");
			var type = parent.attr("type");


			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.wid = parent.attr("wid");

			var serviceUrl = "administration/adminservices/getwidgetrecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#drill-form").data("type",type);
												$("#drill-form").data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});


		}).show(); 

		parent.find( ".btn-csv-download" ).button({text: false,icons: {primary: "ui-icon-circle-arrow-s"}}).click(function(e)
		{
			var parent = $(this).closest(".portlet");
			
			var p = {};
			p.sessid = ESP.sessionid;
			p.recid = parent.attr("wid");
			p.rectype = parent.attr("type");
			//-- CSV Only works for fusion Type
			if(p.rectype != "fusion")
				alert("No Data Available");
			else{
				var urlParams = $.param(p);

				if(ESP.main)
				{
					var serviceUrl = "services/executecsvexport.php?"+urlParams;
				}
				else
				{
					var serviceUrl = "../services/executecsvexport.php?"+urlParams;
				}
				
				$("#dlanchor").attr("href",serviceUrl);
				$("#dlanchor").get(0).click();
			}

		}).show(); 


	}

	function updateURLParameter(url, param, paramVal)
	{
		var TheAnchor = null;
		var newAdditionalURL = "";
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var additionalURL = tempArray[1];
		var temp = "";

		if (additionalURL) 
		{
			var tmpAnchor = additionalURL.split("#");
			var TheParams = tmpAnchor[0];
				TheAnchor = tmpAnchor[1];
			if(TheAnchor)
				additionalURL = TheParams;

			tempArray = additionalURL.split("&");

			for (i=0; i<tempArray.length; i++)
			{
				if(tempArray[i].split('=')[0] != param)
				{
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}        
		}
		else
		{
			var tmpAnchor = baseURL.split("#");
			var TheParams = tmpAnchor[0];
				TheAnchor  = tmpAnchor[1];

			if(TheParams)
				baseURL = TheParams;
		}

		if(TheAnchor)
			paramVal += "#" + TheAnchor;

		var rows_txt = temp + "" + param + "=" + paramVal;
		return baseURL + "?" + newAdditionalURL + rows_txt;
	}

	$(document).ready(function()
	{
		if(ESP.adminmode!="1")$( "#btn-add-widget" ).hide();

		initialise_measure_anchors($(document));
		initialise_drilldown_btns($(document));

		$( ".btnLogout" ).button().click(function()
		{
				var newUrl = updateURLParameter(document.location.href,"lo",1);
				document.location.href = newUrl;
		});

		$( "#btn-add-widget" ).button({text: false,icons: {primary: "ui-icon-gear"}}).click(function()
		{
			var arrWids = new Array();
			$(".portlet").each(function()
			{

				arrWids[$(this).attr("wid")]=true;
			})

			$("#widgetselector-form").data("selectedwidgets",arrWids).dialog("open");
		}); 


		//--
		//-- handle user changing what dashboard to display when in standalone mode
		if(ESP.stlmode=="1")
		{
			$( ".dashboardCategories" ).on("change",function(ev)
			{
				var newUrl = updateURLParameter(document.location.href,"gid",$( ".dashboardCategories" ).val());
				newUrl = updateURLParameter(newUrl,"cid",0);
				newUrl = updateURLParameter(newUrl,"ri",$( ".stlRefreshInterval" ).val());
				document.location.href = newUrl;
			});

			$( ".categoryDashboards" ).on("change",function(ev)
			{
				var newUrl = updateURLParameter(document.location.href,"gid",$( ".dashboardCategories" ).val());
				newUrl = updateURLParameter(newUrl,"cid",$( ".categoryDashboards" ).val());
				newUrl = updateURLParameter(newUrl,"ri",$( ".stlRefreshInterval" ).val());
				document.location.href = newUrl;
			});


			//-- polling refresh
			var reloadfunction = function()
			{
				var newUrl = updateURLParameter(document.location.href,"gid",$( ".dashboardCategories" ).val());
				newUrl = updateURLParameter(newUrl,"cid",$( ".categoryDashboards" ).val());
				newUrl = updateURLParameter(newUrl,"ri",$( ".stlRefreshInterval" ).val());
				document.location.href = newUrl;
			}

			$( ".stlRefreshInterval" ).on("change",function(ev)
			{
				var  interval = $( ".stlRefreshInterval" ).val();
				if(isNaN(interval) || interval.indexOf(".")>0)
				{
					$( ".stlRefreshInterval" ).val(60);
					alert("You entered an invalid number");
					return;
				}
				
				//-- clear timeout and set a new one
				clearTimeout(ESP.stlReloadTimer);
				ESP.stlReloadTimer = setTimeout(reloadfunction,$( ".stlRefreshInterval" ).val()*1000*60)
			});

			ESP.stlReloadTimer = setTimeout(reloadfunction,$(".stlRefreshInterval").val()*1000*60)
		}
		//-- eof standalone handlers
		//--

		//-- initialise	sortables
		var boolSavingLayout=false;
		function saveDashboardLayout(ev,ui)
		{
			if(ESP.adminmode=="1")
			{
				if(boolSavingLayout)
				{
					boolSavingLayout=false;
					return;
				}
				boolSavingLayout=true;

				//-- get position of each widget and update 
				var infoString = "";
				$(".column" ).each(function()
				{
					var colpos = $(this).attr("colpos");
					var x=0;
					$(this).find(".portlet").each(function()
					{
						if(infoString!="")infoString+=",";
						infoString += colpos + ":" + x +":"+$(this).attr("wid");
						x++;
					})
				})

				var p = {};
					p.sessid = ESP.sessionid;
					p.dbid=ui.item.attr("dbid")
					p.posinfo=infoString;

					var serviceUrl = "administration/adminservices/savedashboardwidgetpositions.php";
					$.post(serviceUrl, p, function(strMarkUp) 
												{  
													if(strMarkUp!="OK")alert(strMarkUp);
												});

			}
		}

		//-- allow admin to change dashboard layout
		if(ESP.adminmode)
		{
			$(".column" ).sortable({connectWith: ".column",tolerance: 'pointer' ,handle: ".portlet-header", update:saveDashboardLayout });     
		}

		$(".portlet" ).addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" ).find( ".portlet-header" ).addClass( "htl-widget-header").end();				
		$( ".column" ).disableSelection();  

		for(var strWidgetType in ESP.onWidgetReadyFunctions)
		{
			ESP.onWidgetReadyFunctions[strWidgetType]();
		}
	});


	function run_hsl_anchor(a)
	{
		var strHref = "";
		var type = $(a).attr("atype");
		switch (type)
		{
			case "calldetails":
				strHref = "hsl:calldetails?callref=" + $(a).attr("key");
				break;
			case "editrecord":
				strHref = "hsl:editrecord?table="+$(a).attr("table")+"&key=" + $(a).attr("key");
				break;

		}

		$("#hslanchor").attr("href",strHref);
		$("#hslanchor").get(0).click();
	}

	function _fullscreenEnabled() 
	{
		// FF provides nice flag, maybe others will add support for this later on?
		if(window['fullScreen'] !== undefined) 
		{
		  return window.fullScreen;
		}

		return (!window.screenTop && !window.screenY);
	}

	function handleFullScreen()
	{
		if(_fullscreenEnabled())
		{
			$("#standaloneToolbar").hide();
			$(".toolbarGap").hide();
		}
		else
		{
			$("#standaloneToolbar").show();
			$(".toolbarGap").show();
		}
	}

</script>


	<?php
		include('administration/forms/drilldowncontainer.php');
		include('administration/forms/frmwidgetselector.php');
	?>


</body>
</html>