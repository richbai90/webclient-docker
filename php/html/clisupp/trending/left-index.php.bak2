<?php

	//--
	//-- get list of groups and their dashboards

	include("services/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include("services/dashboard.helpers.php");


	$sessionID = gv("sessid");
	if(isset($_COOKIE['ESPSessionState']))
	{
		$_core['_nexttoken'] = $_COOKIE['ESPSessionState'];
	}
	else if($sessionID!=null)
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

	//-- 21.02.2013 - if admin then show management options
	$privLevel = -1;
	$adminMarkup = "";
	$aid = ($_POST['analystid']!="")?$_POST['analystid']:$_GET['analystid'];
	$rs = new SqlQuery();
	$rs->Query("SELECT priveligelevel FROM swanalysts where analystid = '".$aid."'","sw_systemdb");
	if($rs->Fetch()) 
	{
		$privLevel =$rs->GetValueAsNumber("priveligelevel");
		if($privLevel==3)
		{
			$adminMarkup.='<br><li class="top"><span class="dashboard-admin">Administration Activities</span>';
			$adminMarkup.='<ul><li><a class="file foldernew" href="hsl:swjscallback?function=loaddashboard_adminoption&pageid=managegroups">Setup Groups & Dashboards</a></li></ul>';
			$adminMarkup.='<ul><li><a class="file widget" href="hsl:swjscallback?function=loaddashboard_adminoption&pageid=managewidgets">Design Widgets</a></li></ul>';
			$adminMarkup.='<ul><li><a class="file managemeasures" href="hsl:swjscallback?function=loaddashboard_adminoption&pageid=managemeasures">Manage Measures</a></li></ul>';
		}
	}

	$strTreeMarkup = "";

	//-- 08-02-2013 - get groups
	$rs = new SqlQuery();
	$rs->Query("SELECT * FROM h_dashboard_groups  order by h_title asc","sw_systemdb");
	while($rs->Fetch())	
	{
		//-- is user allowed to access this dashboard group
		$uidAccess = $rs->GetValueAsString("h_uidaccess");
		$urAccess = $rs->GetValueAsNumber("h_uraccess");
		if(!check_dashboard_access($aid,$privLevel,$urAccess,$uidAccess))continue;


		$strGrpID = $rs->GetValueAsNumber("h_gid");
		$strGrpTitle = $rs->GetValueAsString("h_title");

		$strTreeMarkup.='<li class="top"><span class="folder">'.$strGrpTitle.'</span>';

		//-- get group dashboards - check access rights
		$rsBoards = new SqlQuery();
		$rsBoards->Query("select * from h_dashboard_boards where h_fk_dbg = " . $strGrpID . " order by h_title asc","sw_systemdb");
		while($rsBoards->Fetch())	
		{
			//-- is user allowed to access this dashboard 
			$uidAccess = $rsBoards->GetValueAsString("h_uidaccess");
			$urAccess = $rsBoards->GetValueAsNumber("h_uraccess");
			if(!check_dashboard_access($aid,$privLevel,$urAccess,$uidAccess))continue;


			$strPortalID = $rsBoards->GetValueAsString("h_dashboard_id");
			$strPortalTitle = $rsBoards->GetValueAsString("h_title");

			//-- if no default defined then set default to first one we find
			$strClass= "file";
			if(is_null(@$defaultGID) || is_null(@$defaultCID))
			{
				$defaultGID = $strGrpID ;
				$defaultCID = $strPortalID;
				$strClass= "file active";
			}
			else if($strPortalID==@$defaultCID && $strGrpID==@$defaultGID)
			{
				$strClass= "file active";
			}		

			$strTreeMarkup.='<ul><li><a class="'.$strClass.'" href="hsl:swjscallback?function=loaddashboard&gid='.$strGrpID.'&cid='.$strPortalID.'">'.$strPortalTitle.'</a></li></ul>';
		}
	}



	$strTreeMarkup.=$adminMarkup.'</li>';

?>
<html lang="en">
<head>  
	<meta charset="utf-8" />  
	<title>Dashboard</title>  
	<!--<link rel="stylesheet" href="http://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css" />  -->
	<link rel="stylesheet" href="css/smoothness/jquery-ui-1.10.2.custom.min.css" />  
	<link rel="stylesheet" href="css/jquery.treeview.css" />

	<style>

		*{margin:0px; padding:0px;	font-size:12px;font-family:Verdana,sans-serif;color:#696969;}

	</style>
	
	<!--<script src="http://code.jquery.com/jquery-1.8.3.js"></script>  
	<script src="http://code.jquery.com/ui/1.9.2/jquery-ui.js"></script>  -->
	<script src="js/jquery-1.9.1.js"></script>  
	<script src="js/jquery-ui-1.10.2.custom.min.js"></script>  
	<script language="JavaScript" src="js/jquery.treeview.js"></script>

	<script>
		$(document).ready(function()
		{
			$(".file").on("click",function(event)
			{  
				//-- remove default item active style when we first click another anchor
				$(".active").removeClass("active");
				$(this).addClass("active");
			});
		});
	</script>
</head>
<body>

	<ul id="browser" class="dashboardtree treeview-noline">
		<?php echo utf8_encode($strTreeMarkup);?>
	</ul>

</body>
</html>