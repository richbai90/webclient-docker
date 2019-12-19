<?php

	//-- make sure running in context
	if(!isset($_core))
	{
		echo "This page is running outside of it's intended context. Please contact your Administrator";
		exit(0);
	}


	function table_struct($rows,$charttype)
	{
		$table = '<table border="0"  cellspacing="2" cellpadding="2" ><tr><td  class="ui-widget-header"><button class="btn-create-widget" data-charttype="'.$charttype.'">create a new widget</button></td><td class="ui-widget-header"></td><td noWrap class="swtheme-fontcolor ui-widget-header">Title</td><td noWrap class="swtheme-fontcolor ui-widget-header">Category</td><td class="swtheme-fontcolor ui-widget-header">Description</td><td class="swtheme-fontcolor ui-widget-header">Owner</td></tr>';
		$table .=$rows;
		$table .= '</table>';

		return $table;
	}

	//-- get a list of widgets based on type
	function get_widget_managementlist($chartType)
	{
		$actions = 	'<button class="btn-edit-widget" data-charttype="'.$chartType.'">Edit widget properties</button><button class="btn-delete-widget">delete widget from the system</button>';  
		$tabledata="";

		$rs = new SqlQuery();
		$strSql = "select h_widget_id,h_type,h_category,h_title,h_description,h_owner,h_drilldownprovider,h_dataprovider,h_drilldowncolumns,h_sql_measure from h_dashboard_widgets where h_type = '".pfs($chartType)."' order by h_category,h_title asc";
		if($rs->Query($strSql,"sw_systemdb"))
		{
			while($rs->Fetch())
			{
				$strStyle = "";	
				if($rs->GetValueAsString("h_dataprovider")!="" && $rs->GetValueAsString("h_drilldownprovider")=="")
				{
					$strStyle = "style='display:none;'";
				}
				else if($rs->GetValueAsNumber("h_sql_measure")>0)
				{
				}
				else if($rs->GetValueAsString("h_drilldowncolumns")=="")
				{
					$strStyle = "style='display:none;'";
				}


				$tabledata.="<tr wid='".$rs->GetValueAsNumber("h_widget_id")."'>";
				$tabledata.="<td valign='top' noWrap>".$actions."</td>";
				$tabledata.='<td valign="top"><button class="btn-widget-data" '.$strStyle.'>View widget drill down data</button></td>';
				$tabledata.="<td valign='top' noWrap>".$rs->GetValueAsString("h_title")."</td>";
				$tabledata.="<td valign='top' noWrap>".$rs->GetValueAsString("h_category")."</td>";
				$tabledata.="<td valign='top'>".$rs->GetValueAsString("h_description")."</td>";
				$tabledata.="<td valign='top'>".$rs->GetValueAsString("h_owner")."</td>";




				$tabledata.="</tr>";
			}
		}


		return table_struct($tabledata,$chartType);
	}

	include("../_css_switcher.php");

?>
<!DOCTYPE html>
<html>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta charset="utf-8" />  

	<link rel="stylesheet" href="../css/smoothness/jquery-ui-1.10.2.custom.min.css" />  
	<link rel="stylesheet" href="../css/dashboard.css" />  
	<link rel="stylesheet" href="../css/scorecard.css" />  
	<link id='stylesheet' rel="stylesheet" href="../<?php echo $cssFile;?>" />  	
	<style>

		*{font-size:12px;font-family:Verdana,sans-serif;color:#696969;}
		body{overflow-y:scroll; overflow:hidden;min-width:800px;margin:0;padding:0;}


		#tabcontrolWidget
		{
			border-width:0px;
			display:none;
		}

		#tabcontrolWidget ul
		{
			border-width:0px 0px 1px 0px;
			background:transparent;
			background-color:transparent;
			filter:none;
		}

	</style>

<script src="../js/jquery-1.9.1.js"></script>  
<script src="../js/jquery-ui-1.10.2.custom.min.js"></script>  
<script src="../js/jquery.sparkline.min.js"></script>  

<script>
	var ESP={};
	ESP.sessionid = "<?php echo $sessionID;?>";


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


	function loadRecordValues(targetForm, oRec)
	{
		targetForm.find("*[databind]").each(function()
		{
			var fld = $(this);
			var databind = fld.attr("databind");

			if(oRec[databind]!=undefined)
			{
				fld.val(oRec[databind]);
			}
		});
	}

	function updateRecordValuesFromForm(targetForm, oRec, serviceMethod, callback)
	{
		if(oRec==false)oRec={};


		targetForm.find("*[databind]").each(function()
		{
			var fld = $(this);
			var databind = fld.attr("databind");
			if(databind!=undefined && databind!="")
			{
				oRec[databind] = fld.val();
			}
		});

		var p = oRec;
			p.sessid = ESP.sessionid;

			var serviceUrl = serviceMethod;
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
												if(callback)callback(false);
											}
											else
											{
												if(callback)callback(true);
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
															if(callback)callback(false);
														});

	}


	$(document).ready(function() 
	{
		$("#tabcontrolWidget").tabs({ heightStyle: "auto" });


		$( ".btn-widget-data" ).button({text: false,icons: {primary: "ui-icon-bookmark"}}).click(function()
		{
			var tr = $(this).closest("TR");

			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.wid=tr.attr("wid");

			var serviceUrl = "adminservices/getwidgetrecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#drill-form").data("type","widget");
												$("#drill-form").data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});


		}); 


		$( ".btn-create-widget" ).button({text: false,icons: {primary: "ui-icon-calculator"}}).click(function()
		{
			var formid = "#"+ $(this).data("charttype") + "-form";
			$(formid).data("datarecord",false).dialog( "open" );
		}); 

		$( ".btn-delete-widget" ).button({text: false,icons: {primary: "ui-icon-trash"}}).click(function()
		{
			if(confirm("Are you sure you want to delete the widget from the system?"))
			{
				var tr = $(this).closest("TR");

				//-- fetch measure record then once fetched open form
				var p = {};
				p.sessid = ESP.sessionid;
				p.wid=tr.attr("wid");

				var serviceUrl = "adminservices/deletewidget.php";
				$.post(serviceUrl, p, function(j, res,http) 
											{  
												if(j && j.state && j.state.error)
												{
													alert(j.state.error)
												}
												else
												{
													tr.remove();
												}
											},"json").error(function(a,b,c)
															{
																alert(b+":"+c);
															});
			
			}
		}); 

		$( ".btn-edit-widget" ).button({text: false,icons: {primary: "ui-icon-newwin"}}).click(function()
		{
			var formid = "#"+ $(this).data("charttype") + "-form";
			var tr = $(this).closest("TR");

			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.wid=tr.attr("wid");

			var serviceUrl = "adminservices/getwidgetrecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$(formid).data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});


		}); 

		$("#tabcontrolWidget").show();

	});
	
</script>
<body>
	<a id='hslanchor' href="hsl:anchor" style='display:none'></a>

	<!-- tab control for the different widget types -->
	<div id="tabcontrolWidget">
		<ul>
			<li><a href="#tabs-1">Charts</a></li>    
			<li><a href="#tabs-2">Scorecards</a></li>
			<li><a href="#tabs-3">Custom</a></li>
		</ul>
		<div id="tabs-1" class="tab-content">
			<?php echo get_widget_managementlist("fusion");?>
		</div>
		<div id="tabs-2" class="tab-content">
			<?php echo get_widget_managementlist("scorecard");?>
		</div>
		<div id="tabs-3" class="tab-content">
			<?php echo get_widget_managementlist("custom");?>		
		</div>

	</div>


<?php	
	include('forms/drilldowncontainer.php');
	include("forms/frmwidget.fusion.php");
	include("forms/frmwidget.scorecard.php");
	include("forms/frmwidget.custom.php");
?>

</body>
</html>
