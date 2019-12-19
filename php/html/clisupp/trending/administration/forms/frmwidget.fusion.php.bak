<?php

	$fusionDataProviders = get_phpscripts_forlistbox("../widgets/fusioncharts/dataproviders", "widgets/fusioncharts/dataproviders/");
	$fusionDrillDownProviders = get_phpscripts_forlistbox("../widgets/fusioncharts/drilldowns", "widgets/fusioncharts/drilldowns/");



	//-- to be implement in the future where we can run fusion charts from measured data
	$measureDataProviders = "";
	$measureRS =  new SqlQuery();
	$select = "select h_id,h_title from h_dashboard_measures";
	if($measureRS->Query($select,"sw_systemdb"))
	{
		while($measureRS->Fetch())
		{
			$measureDataProviders .= "<option value='".$measureRS->GetValueAsNumber("h_id")."'>".pfs($measureRS->GetValueAsString("h_title"))."</option>";
		}
	}

?>
<style>
		.customform
		{
			display:none;
			border-width:0px;
		}

		.customform label, .customform input { display:block; margin-bottom:2px;}
		.customform input.text { margin-bottom:5px; width:100%; padding: 4px; }
		.customform input.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.customform input.text-100{ margin-bottom:5px; width:100px; padding: 4px; }
		.customform input.text-350{ margin-bottom:5px; width:350px; padding: 4px; }
		.customform input.text-450{ margin-bottom:5px; width:450px; padding: 4px; }

		.customform textarea{overflow:auto;}
		.customform textarea.text { margin-bottom:5px; width:475px; padding: 4px; }
		.customform textarea.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.customform textarea.text-100{ margin-bottom:5px; width:100px; padding: 4px; }
		.customform textarea.text-200{ margin-bottom:5px; width:200px; padding: 4px; }
		.customform textarea.text-300{ margin-bottom:5px; width:300px; padding: 4px; }

		.customform select { margin-bottom:5px; width:485px; padding: 3px; }
		.customform select.text-100 {width:100px;  padding: 3px; margin-bottom:5px;  }
		.customform select.text-200 {width:200px; padding: 3px; margin-bottom:5px; }
		.customform select.text-300 {width:300px; padding: 3px; margin-bottom:5px;  }
		.customform select.text-350 {width:350px; padding: 3px; margin-bottom:5px;  }
		.customform select.text-450 {width:460px; padding: 3px; margin-bottom:5px;  }

		.customform label.td { margin-bottom:12px}

		.customform form { padding:0; border:0; margin-top:4px; }
		.customform .ui-dialog .ui-state-error { padding: 2px; }
		.customform .validateTips { border: 1px solid transparent; padding: 0.2em; display:none; position:absolute; top:0px; left:20px;}

		#tabcontrolcustomform
		{
				border-width:0px;
		}

		#tabcontrolcustomform ul
		{
			border-width:0px 0px 1px 0px;
			background:transparent;
			background-color::transparent;
			filter:none;
		}


		.customform #tabs-4 .tbl-h
		{
			color:#ffffff;
			background-color:silver;
			padding:4px;
		}

		.customform .tab-content
		{
			position:relative;
			margin-top:5px;
			height:750px;
			display:block;
			overflow:visible;
		}


		.customform .portlet-content
		{
			overflow:hidden;
			height:450px;
		}

</style>


<script type="text/javascript" src="../../fce/FusionCharts.js"></script>

<script>
$(function() {

	var bSaved=false;

	$("#tabcontrolcustomform").tabs({
										heightStyle: "content",
										activate:function(e,ui)
										{
											var tab = ui.newTab.data("tabid");
											if(tab=="preview")
											{
												renderChart();
											}
											else if(tab =="datap")
											{
												$("#fusionDataProvider").change();
											}

										}
									});

	var name = $( ".customform #widgettitle" ),
		desc = $( ".customform #description" ),
		category = $( ".customform #category" ),
		definition = $( ".customform #definition" ),

		allFields = $([]).add(name).add(desc).add(category).add(definition),
		tips = $( "#tabcontrolcustomform .validateTips" );

	function updateTips( t ) {
		tips
			.text( t )
			.addClass( "ui-state-error" ).show();
		setTimeout(function() {
			tips.hide();
		}, 4000 );
	}

	function checkLength( o, n, min, max ) {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
				min + " and " + max + "." );
			return false;
		} else {
			return true;
		}
	}

	function checkRegexp( o, regexp, n ) {
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n );
			return false;
		} else {
			return true;
		}
	}
	$( "#fusion-form" ).dialog({
		autoOpen: false,
		height: 750,
		width: 550,
		modal: true,
		buttons: {
			"Save": function() {
							var frm = $(this);
				var bValid = true;
				allFields.removeClass( "ui-state-error" );

				bValid = bValid && checkLength( name, "title", 1, 128 );
				bValid = bValid && checkLength( category, "category", 1, 64 );

				if ( bValid ) 
				{
						var bCreate = false;
						if($(this).data("datarecord"))
						{
							//-- edit measure
							var serviceUrl = "adminservices/updatewidget.php";
						}
						else
						{
							//-- create measure
							bCreate = true;
							var serviceUrl = "adminservices/createwidget.php";
						}

						updateRecordValuesFromForm($( "#fusion-form" ), $( "#fusion-form" ).data("datarecord"), serviceUrl,function(res, data,http)
						{
							if(res)
							{
								bSaved=true;
								var msg = (bCreate)?"The fusion widget was successfully created": "The widget was successfully updated";
								alert(msg) ;
								if(bCreate)frm.dialog( "close" );
							}
						});
				}
			},
			Close: function() {
				$( this ).dialog( "close" );
			}
		},
		open:function(){
			var frm = $(this);

			$("#tabcontrolcustomform").tabs("option", "active", 0);


			if(frm.data("datarecord"))
			{
				//-- updating - load data samples
				frm.dialog( "option", "title", "Edit Fusion Chart Widget Properties" );
				loadRecordValues(frm,frm.data("datarecord"));
				$(".customform #fusionDataProvider").change();
			}
			else
			{
				//-- reset field values
				frm.find("*[databind]").each(function()
				{
					var fld =  $(this);
					var dv = fld.attr("defaultvalue");
					fld.removeClass( "ui-state-error" );
					if(dv!=undefined)
					{
						fld.val(dv);
					}
					else
					{
						fld.val("");
					}
				});

				//-- creating
				frm.dialog( "option", "title", "Create New Fusion Chart Widget" );

			}
		},
		close: function() {
			var frm = $(this);

			//-- reset field values
			frm.find("*[databind]").each(function()
			{
				var fld =  $(this);
				fld.val("");
			});


			frm.data("datarecord",false);
			if(bSaved)document.location.reload();
		}
	});


	$(".customform #fusionChartType").change(function()
	{
		var dp = $(this).val();
		if(dp!="")
		{

			var xmlChart = $("#definition").val();
			var arrDP = dp.split("/");
			//-- call ajax to get data
 			var p = {};
			p.sessid = ESP.sessionid;
			p.widgettemplatepath = "widgets/fusioncharts/templates/"+arrDP[arrDP.length-1].replace(".swf",".xml");

			var serviceUrl = "adminservices/getwidgettemplate.php";
			$.post(serviceUrl, p, function(markup, res,http) 
										{  
											if(markup!="")
											{
												if(xmlChart!="")
												{
													if(!confirm("The selected chart type has a predefined template. Do you want to overwrite the existing definition"))return;	
												}

												$(".customform #definition").val(markup);
											}
										}).error(function(a,b,c)
														{
															alert(b+":"+c);
														});

		}
		
	});

	/* no longer viable as we do multi series etc
	$(".customform #fusionDataProvider").change(function()
	{
		//-- get new set of data based on selection
		$(".customform #tempData").children().remove();
		var dp = $(this).val();
		if(dp!="")
		{
			//-- call ajax to get data
			var p = {};
			p.sessid = ESP.sessionid;
			p.dataprovider = dp;

			var serviceUrl = "adminservices/getwidgetdata.php";
			$.post(serviceUrl, p, function(markup, res,http) 
										{  
												$(".customform #tempData").append(markup);

										}).error(function(a,b,c)
														{
															alert(b+":"+c);
														});

		}
	});
	*/

	//-- chart def changed to update / create charte
	function renderChart()
	{
		$(".customform .portlet-header").text($(".customform #widgettitle").val());

		if(document.tempChart)
		{
			if(document.tempChart.dispose)
			{
				document.tempChart.dispose();
			}
			else
			{
				//-- brute force delete
				delete FusionCharts.items.tempChart;
			}
		}

		var xmlChart = $(".customform #definition").val();
		if(xmlChart=="")return;

		var dataProvider = $(".customform #fusionDataProvider").val();
		var measureProvider = $(".customform #measureDataProvider").val();
		var sqlGroupCol= $(".customform #sqlGroupColumn").val();
		if(dataProvider!="" || measureProvider>0 || sqlGroupCol!="")
		{
			var p = {};
				p.sessid = ESP.sessionid;

				p.dp = dataProvider;
				p.mid = measureProvider;
				p.sc = $(".customform #measureSampleCount").val();

			if(dataProvider=="" && measureProvider==0)
			{
				//-- using simple sql group by
				p.groupcol = sqlGroupCol;
				p.countcol = $(".customform #sqlCountColumn").val();
				p.sqltable = $(".customform #sqlTable").val();
				p.sqlwhere = $(".customform #sqlFilter").val();
				p.sqldir = $(".customform #sqlDir").val();
				p.sqllimit = $(".customform #sqlLimit").val();
			}

				p.xml = xmlChart;

				var serviceUrl = "adminservices/getfusionpreview.php";
				$.post(serviceUrl, p, function(markup, res,http) 
											{  
												xmlChart=markup;
												var chartType = $(".customform #fusionChartType").val();
												var myChart = new FusionCharts("../../" + chartType,"tempChart", "100%", "100%", "0");     			
												myChart.setXMLData(xmlChart);
												myChart.render("chartContainer");
											}).error(function(a,b,c)
															{
																alert(b+":"+c);
															});

		}
		else
		{
			var chartType = $(".customform #fusionChartType").val();
			var myChart = new FusionCharts("../../" + chartType,"tempChart", "100%", "100%", "0");     			
			myChart.setXMLData(xmlChart);
			myChart.render("chartContainer");
		}


	}

	function convert_table_to_fusiondata(tableBody)
	{
		var strXML = "";
		tableBody.find("TR").each(function()
		{
			var tds = $(this).find("TD");
			strXML +='<set label="'+tds.first().text()+'" value="'+tds.last().text()+'"/>';
		});

		return strXML;
	}

});
</script>

<div id="fusion-form" class='customform  swtheme-fontcolor'>

			<!-- hidden defaults -->
			<input type="hidden" id="widgettyp" databind="h_type" defaultvalue="fusion"/>

			<div id="tabcontrolcustomform" >
				<ul>
					<li><a href="#tabs-1">Properties</a></li>    
					<li data-tabid="datap"><a href="#tabs-4">Data Provider</a></li>
					<li><a href="#tabs-2">Fusion Xml</a></li>
					<li data-tabid="preview"><a href="#tabs-3">Preview</a></li>
				</ul>
				<div id="tabs-1" class="tab-content">
					<label  class="validateTips"></label>
					<form>
							<table>
								<tr>
									<td>
										<label>Title</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" id="widgettitle" databind="h_title" defaultvalue="" class="text ui-widget-content" />
									</td>
								</tr>
							</table>
							<table>
								<tr>
									<td>
										<label>Category</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" id="category" databind="h_category" defaultvalue="" class="text ui-widget-content" />
									</td>
								</tr>
							</table>
							<table>
								<tr>
									<td>
										<label>Description / Purpose</label>
									</td>
								</tr>
								<tr>
									<td>
										<textarea id="description" databind="h_description" rows="15" class="text ui-widget-content"></textarea>
									</td>
								</tr>
							</table>
							<table>
								<tr>
									<td>
										<label>For Use In Data Dictionary</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" id="forddf" databind="h_forddf" defaultvalue="All" class="text ui-widget-content" />
									</td>
								</tr>
							</table>

					</form>
				</div>  
				<div id="tabs-4" class="tab-content" style="height:580px;">
					<label  class="validateTips"></label>
					<form>

						<fieldset>
							<legend>SQL Group By Data Provider</legend>
							<table width="100%">
								<tr>
									<td>
										<label for="name">Show</label>
									</td>
									<td>
										<label for="name">#</label>
									</td>

									<td>
										<label for="name">Data Column</label>
									</td>
								</tr>
								<tr>
									<td>
										<select id="sqlDir" databind="h_sql_dir" defaultvalue="desc" class="text-100 ui-widget-content">
											<option value="desc">Top</option>
											<option value="asc">Bottom</option>
										</select>
									</td>
									<td>
										<input type="text" id="sqlLimit" databind="h_sql_limit" defaultvalue="10" class="text-100 ui-widget-content" />
									</td>
									<td>
										<input type="text" id="sqlGroupColumn" databind="h_sql_groupcolumn" defaultvalue="" class="text-100 ui-widget-content" />
									</td>
								</tr>

								<tr>
									<td>
										<label for="name">From Table</label>
									</td>
									<td>
										<label for="name">Count On</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" id="sqlTable" databind="h_sql_table" defaultvalue="opencall" class="text-100 ui-widget-content" />
									</td>
									<td>
										<input type="text" id="sqlCountColumn" databind="h_sql_countcolumn" defaultvalue="callref" class="text-100 ui-widget-content" />
									</td>

								</tr>
								<tr>
									<td colspan="3">
										<label for="name">Filter Where</label>
									</td>
								</tr>
								<tr>
									<td colspan="3">
										<input type="text" id="sqlFilter" databind="h_sql_clause" defaultvalue="status<16" class="text-450 ui-widget-content" />
									</td>
								</tr>
								<tr>
									<td colspan="3">
										<label for="name">Drill down select columns</label>
									</td>
								</tr>
								<tr>
									<td colspan="3">
										<input type="text" databind="h_drilldowncolumns" defaultvalue="callref,status,itsm_title,owner,suppgroup,cust_name,companyname" class="text-450 ui-widget-content" />
									</td>
								</tr>
							</table>
						</fieldset>
						<br/>

						<fieldset>
							<legend>Measured Data Provider</legend>
							<table width="100%">
								<tr>
									<td>
										<label for="name">Measure</label>
									</td>
								</tr>
								<tr>
									<td>
										<select id="measureDataProvider"  databind="h_sql_measure" class="text-450">
											<option value="0"></option>
											<?php echo $measureDataProviders;?>
										</select>
									</td>
								</tr>
								<tr>
									<td>
										<label for="name"># Of Samples To Use</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" id="measureSampleCount" databind="h_sql_samplecount" value="12" class="text-450 ui-widget-content" />
									</td>
								</tr>
							</table>
						</fieldset>

						<br/>
						<fieldset>
							<legend>Custom Data Provider</legend>
							<table width="100%">
								<tr>
									<td>
										<label for="name">Data Provider</label>
									</td>
								</tr>
								<tr>
									<td>
										<select id="fusionDataProvider" databind="h_dataprovider" >
											<option value=""></option>
											<?php echo $fusionDataProviders;?>
										</select>
									</td>
								</tr>
								<tr>
									<td>
										<label for="name">Drill Down</label>
									</td>
								</tr>
								<tr>
									<td>
										<select id="fusionDrillDown" databind="h_drilldownprovider" >
											<option value=""></option>
											<?php echo $fusionDrillDownProviders;?>
										</select>
									</td>
								</tr>
							</table>
						</fieldset>

					</form>
				</div>
				<div id="tabs-2" class="tab-content">
					<label  class="validateTips"></label>
					<form>
						<table>
							<tr>
								<td>
									<label for="name">Chart Type</label>
								</td>
							</tr>
							<tr>
								<td>
									<select id="fusionChartType" databind="h_extra_1">
										<option value="fce/Column2D.swf">Column 2D</option>
										<option value="fce/Column3D.swf">Column 3D</option>
										<option value="fce/Pie2D.swf">Pie 2D</option>
										<option value="fce/Pie3D.swf">Pie 3D</option>
										<option value="fce/Doughnut2D.swf">Doughnut 2D</option>
										<option value="fce/Doughnut3D.swf">Doughnut 3D</option>
										<option value="fce/Bar2D.swf">Bar</option>
										<option value="fce/Line.swf">Line</option>
										<option value="fce/Area2D.swf">Area</option>
										<option value="fce/MSColumn2D.swf">Multi-Series Column 2D</option>
										<option value="fce/MSColumn3D.swf">Multi-Series Column 3D</option>
										<option value="fce/MSBar2D.swf">Multi-Series Bar 2D</option>
										<option value="fce/MSBar3D.swf">Multi-Series Bar 3D</option>
										<option value="fce/Pie2D.swf">Multi-Series Pie 2D</option>
										<option value="fce/Pie3D.swf">Multi-Series Pie 3D</option>
										<option value="fce/MSLine.swf">Multi-Series Line</option>
										<option value="fce/MSArea.swf">Multi-Series Area</option>
									</select>
								</td>
							</tr>
						</table>

						<table>
							<tr>
								<td>
									<label for="name">Xml Definition (use :[variablename] to embed php vars from data provider)</label>
								</td>
							</tr>
							<tr>
								<td>
									<textarea id="definition" databind="h_definition" rows="20" class="text ui-widget-content"></textarea>
								</td>
							</tr>
						</table>
						<table>
							<tr>
								<td>
									<label for="name">Fusion Charts Gallery</label>
								</td>
							</tr>
							<tr>
								<td>
									<a href="http://www.fusioncharts.com/demos/gallery/" target="new">http://www.fusioncharts.com/demos/gallery/</a>
								</td>
							</tr>
						</table>

					</form>
				</div>
				<div id="tabs-3" class="tab-content">
					<label  class="validateTips"></label>
					<form>

						<table>
						<tr>
							<td>
								<label>If there is no chart displayed then there is a problem with either the data provider, xml definition or the chart type your selected. Make sure the xml definition is compatible with the chart type.<br></label>
							</td>
						</tr>
						</table>
						<div class="portlet">
							<div class="portlet-header htl-widget-header"></div>
							<div id="chartContainer" class="portlet-content">
								Fusion chart will load here when valid definition is provided
							</div>
						</div>
						
					</form>
				</div>
			</div>

</div>
