<?php

	function get_widget_selectionlist($type,$forDashboard,$intAdmin=0)
	{
		$tabledata="";
		$selectbyIds = "";

		//-- we want to get available widgets for this dashboard only, not all widgets (so in user mode not admin mode)
		if(!$intAdmin)
		{
			$rs = new SqlQuery();
			$strSql = "select h_fk_wid from h_dashboard_boardwidgets where h_fk_dbid = ".pfs($forDashboard);
			if($rs->Query($strSql,"sw_systemdb"))
			{
				$availableWidgets = "-1";
				while($rs->Fetch())
				{
					$availableWidgets .= "," .$rs->GetValueAsNumber("h_fk_wid");
				}
				$selectbyIds = "and h_widget_id in(".$availableWidgets.")";
			}
		}

		$rs = new SqlQuery();
		$strSql = "select h_widget_id,h_type,h_category,h_title,h_description from h_dashboard_widgets where h_type = '".pfs($type)."' ".$selectbyIds." order by h_category,h_title asc";
		if($rs->Query($strSql,"sw_systemdb"))
		{
			while($rs->Fetch())
			{
				$tabledata.="<tr wid='".$rs->GetValueAsNumber("h_widget_id")."'>";
				$tabledata.="<td align='middle'><input type='checkbox'></td>";
				$tabledata.="<td valign='top' noWrap>".$rs->GetValueAsString("h_title")."</td>";
				$tabledata.="<td valign='top' noWrap>".$rs->GetValueAsString("h_category")."</td>";

				$info = trim($rs->GetValueAsString("h_description"));
				if($info!="")
				{
					$tabledata.='<td align="middle" class="c-pointer" title="'.$info.'">?</td>';
				}
				else
				{
					$tabledata.="<td></td>";
				}
				$tabledata.="</tr>";
			}
		}
		return table_struct($tabledata);
	}


	function table_struct($rows)
	{
		$table = '<table border="0"  cellspacing="2" cellpadding="2"><tr class="ui-widget-header"><td>Selected</td><td noWrap>Title</td><td noWrap>Category</td><td title="hover over ? to see widget description">Info</td></tr>';
		$table .=$rows;
		$table .= '</table>';

		return $table;
	}

?>

<style>

	#tabcontrolWidgetSelector
	{
		border-width:0px;
		display:none;
	}

	#tabcontrolWidgetSelector ul
	{
		border-width:0px 0px 1px 0px;
		background:transparent;
		background-color::transparent;
			filter:none;
	}
</style>

<script>

		$(function() 
		{
			$("#tabcontrolWidgetSelector").tabs({heightStyle: "auto"}).show();

			$("#widgetselector-form" ).dialog(
			{
				autoOpen: false,
				height: 600,
				width: 650,
				modal: true,
				buttons: {
					"Save": function() 
					{
							saveWidgetSelection();
					},
					"Close": function() 
					{
						$( this ).dialog( "close" );
					}
				},
				open:function()
				{
					var frm = $(this);
					if(ESP.adminmode=="1")
					{
						frm.dialog( "option", "title", "Assign Widgets To Dashboard" );
						var arrWids = frm.data("selectedwidgets");
						$("#widgetselector-form" ).find("input[type=checkbox]").each(function()
						{
							if(arrWids[$(this).closest("tr").attr("wid")])
							{
								$(this).prop("checked",true);
							}
						})
					}
					else
					{
						frm.dialog( "option", "title", "Show / Hide Widgets On Dashboard" );
					}
					$("#tabcontrolWidgetSelector").tabs("option", "active", 0);

				}
			});


			function saveWidgetSelection()
			{
						//-- get all inputs that are checked
						var csAssignWidgets = "";
						$("#widgetselector-form").find("input[type=checkbox]" ).each(function()
						{
							var cb = $(this)
							
							if(cb.prop("checked"))
							{
								if(csAssignWidgets!="")csAssignWidgets += ",";
								csAssignWidgets += cb.closest("tr").attr("wid");
							}
						});

						var p = {};
							p.sessid = ESP.sessionid;
							p.wids = csAssignWidgets;
							p.dbid = ESP.dashboardid;

							var serviceUrl = "administration/adminservices/assignwidgetstodashboard.php";
							$.post(serviceUrl, p, function(msg, res,http) 
														{  
															if(msg!="OK")
															{
																alert(msg);
															}
															else
															{
																document.location.reload();
															}

														}).error(function(a,b,c)
																		{
																			stop()
																			alert(b+":"+c);
																		});
			}

		});

</script>

<div id="widgetselector-form" class='widgetselectorform swtheme-fontcolor'>

	<!-- tab control for the different widget types -->
	<div id="tabcontrolWidgetSelector">
		<ul>
			<li><a href="#tabs-1">Fusion</a></li>    
			<li><a href="#tabs-2">Scorecards</a></li>
			<li><a href="#tabs-3">Custom</a></li>
		</ul>
		<div id="tabs-1" class="tab-content">

			<?php echo get_widget_selectionlist("fusion",$configID,$intAdminMode);?>
		</div>
		<div id="tabs-2" class="tab-content">
			<?php echo get_widget_selectionlist("scorecard",$configID,$intAdminMode);?>
		</div>
		<div id="tabs-3" class="tab-content">
			<?php echo get_widget_selectionlist("custom",$configID,$intAdminMode);?>		
		</div>
	</div>

</div>