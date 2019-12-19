<?php

	$strMeasureOptions = "";
	$rsMeasures =   get_measures();
	while($rsMeasures->Fetch())
	{
		$strMeasureOptions .= "<option value='".$rsMeasures->GetValueAsNumber('h_id')."'>".$rsMeasures->GetValueAsString('h_title')."</option>";
	}

?>
<style>
		.scorecardform
		{
			display:none;
			border-width:0px;
		}

		.scorecardform #measuresContainer
		{
			overflow:auto;
		}

		.scorecard-form .portlet-content
		{
			height:auto;
		}

		.scorecardform label, .scorecardform input { display:block; margin-bottom:2px;}
		.scorecardform input.text { margin-bottom:5px; width:475px; padding: 4px; }
		.scorecardform input.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.scorecardform input.text-100{ margin-bottom:5px; width:100px; padding: 4px; }

		.scorecardform textarea{overflow:auto;}
		.scorecardform textarea.text { margin-bottom:5px; width:475px; padding: 4px; }
		.scorecardform textarea.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.scorecardform textarea.text-100{ margin-bottom:5px; width:100px; padding: 4px; }
		.scorecardform textarea.text-200{ margin-bottom:5px; width:200px; padding: 4px; }
		.scorecardform textarea.text-300{ margin-bottom:5px; width:300px; padding: 4px; }

		.scorecardform select { margin-bottom:5px; width:485px; padding: 3px; }
		.scorecardform select.text-100 {width:100px;  padding: 3px; margin-bottom:5px;  }
		.scorecardform select.text-200 {width:200px; padding: 3px; margin-bottom:5px; }
		.scorecardform select.text-225 {width:225px; padding: 3px; margin-bottom:5px; }
		.scorecardform select.text-300 {width:300px; padding: 3px; margin-bottom:5px;  }
		.scorecardform select.text-350 {width:350px; padding: 3px; margin-bottom:5px;  }

		.scorecardform label.td { margin-bottom:12px}

		.scorecardform form { padding:0; border:0; margin-top:18px; }
		.scorecardform .ui-dialog .ui-state-error { padding: 2px; }
		.scorecardform .validateTips { border: 1px solid transparent; padding: 0.2em; display:none; position:absolute; top:45px; left:20px;}

		#tabcontrolscorecardform
		{
				border-width:0px;
		}

		#tabcontrolscorecardform ul
		{
			border-width:0px 0px 1px 0px;
			background:transparent;
			background-color::transparent;
			filter:none;
		}


		.scorecardform #tabs-4 .tbl-h
		{
			color:#ffffff;
			background-color:silver;
			padding:4px;
		}

		.scorecardform .tab-content
		{
			margin-top:5px;
			height:480px;
			display:block;
			overflow:auto;
		}


</style>

<script>
$(function() {

	var bSaved = false;
	
	$("#tabcontrolscorecardform").tabs({
										heightStyle: "auto",
										activate:function(e,ui)
										{
											var tab = ui.newTab.data("tabid");
											if(tab=="preview")
											{
												renderWidget();
											}
										}
									});

	var name = $( ".scorecardform #widgettitle" ),
		desc = $( ".scorecardform #description" ),
		category = $( ".scorecardform #category" ),
		definition = $( ".scorecardform #definition" ),

		allFields = $([]).add(name).add(desc).add(category).add(definition),
		tips = $( "#tabcontrolscorecardform .validateTips" );

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
	$( "#scorecard-form" ).dialog({
		autoOpen: false,
		height: 650,
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
						
						getAssignedMeasureIds(); //-- PM00129353
						
						updateRecordValuesFromForm($( "#scorecard-form" ), $( "#scorecard-form" ).data("datarecord"), serviceUrl,function(res, data)
						{
							if(res)
							{
								bSaved=true;
								var msg = (bCreate)?"The scorecard widget was successfully created": "The widget was successfully updated";
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

			$("#tabcontrolscorecardform").tabs("option", "active", 0);
			ge("#selectedMeasures").children().remove();
			ge("#availableMeasures").children().remove();

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

			if(frm.data("datarecord"))
			{
				//-- updating - load data samples
				frm.dialog( "option", "title", "Edit Scorecard Widget Properties" );
				loadRecordValues(frm,frm.data("datarecord"));

				getAvailableMeasures(function()
				{
					moveSelectedMeasuresFromAvailableListbox(ge("#tbassignedmeasures").val());
				})

				
				setVisibleColumns(ge("#tbhidecols").val())
			}
			else
			{
				//-- creating
				frm.dialog( "option", "title", "Create New Scorecard Widget" );
				getAvailableMeasures();
			}
		},
		close: function() {

			var frm = $(this);
			frm.data("datarecord",false);
			if(bSaved)document.location.reload();
		}
	});


	function getAvailableMeasures(callback)
	{
		var p = {};
			p.sessid = ESP.sessionid;

			var serviceUrl = "adminservices/getavailablemeasuresforlb.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  

											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												//-- add items to select box
												if(j.data.rowData && j.data.rowData.row)
												{
													var lb = ge("#availableMeasures");
													var rows = (j.data.rowData.row.length)?j.data.rowData.row:[j.data.rowData.row];
													for(var x=0;x < rows.length;x++)
													{
														lb.append($("<option></option>")
																 .attr("value", rows[x].h_id)
																 .text(rows[x].h_title)); 
													}

													if(callback)callback();
												}
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});

	}


	//-- chart def changed to update / create charte
	function renderWidget()
	{
		$(".scorecardform .portlet-header").text($(".scorecardform #widgettitle").val());
		ge("#measuresContainer").children().remove();

		var hidecols = getHiddenCols();
		var measures = getAssignedMeasureIds();
		var p = {};
			p.sessid = ESP.sessionid;
			p.um = measures;
			p.hc =hidecols;

			var serviceUrl = "adminservices/getscorecardpreview.php";
			$.post(serviceUrl, p, function(markup, res,http) 
										{  
											ge("#measuresContainer").append(markup)
										}).error(function(a,b,c)
														{
															alert(b+":"+c);
														});


	}


	ge("INPUT[col]").change(function()
	{
		renderWidget();
	});

	function getHiddenCols()
	{
		var strHideCols = "";
		ge("INPUT[col]").each(function()
		{

			if($(this).prop("checked")==false)
			{
				if(strHideCols!="")strHideCols+=",";
				strHideCols +=$(this).attr("col");
			}
		});
		ge("#tbhidecols").val(strHideCols);

		return strHideCols;
	}

	function getAssignedMeasureIds()
	{
		var csMeasures = "";
		ge("#selectedMeasures").find("OPTION").each(function()
		{
			if(csMeasures != "")csMeasures += ",";
			csMeasures += $(this).val();
		});

		ge("#tbassignedmeasures").val(csMeasures);
		return csMeasures;
	}

	function setVisibleColumns(csCols)
	{
		ge("INPUT[col]").each(function()
		{
			$(this).prop("checked",csCols.indexOf($(this).attr("col"))==-1)
		});

	}

	function moveSelectedMeasuresFromAvailableListbox(csMeasures)
	{
		if(csMeasures==undefined)return;
		var arrMeasures = csMeasures.split(",")
		for(var x=0;x<arrMeasures.length;x++)
		{
			//-- find value in lb
			ge("#availableMeasures > [value="+arrMeasures[x]+"]").appendTo(ge("#selectedMeasures"));
		}
	}

	function ge(selector)
	{
		return $(".scorecardform " + selector);
	}
	
	ge("#availableMeasures").dblclick(function()
	{
		var selectedVal = $(this).val();
		var found = false;

		//-- check if exists in assigned lb
		ge("#selectedMeasures").find("OPTION").each(function()
		{
			if($(this).val()==selectedVal)
			{
				found=true;
				return false;
			}
		});

		if(!found)
		{
			//-- add option to selected listbox
			ge("#availableMeasures > option:selected").appendTo(ge("#selectedMeasures"))
		}
	});

	ge("#selectedMeasures").dblclick(function()
	{
		ge("#selectedMeasures > option:selected").appendTo(ge("#availableMeasures"))
	});

});
</script>

<div id="scorecard-form" class='scorecardform  swtheme-fontcolor'>

			<!-- hidden defaults -->
			<input type="hidden" id="widgettyp" databind="h_type" defaultvalue="scorecard"/>
			<input type="hidden" id="tbassignedmeasures" databind="h_extra_1" defaultvalue=""/>
			<input type="hidden" id="tbhidecols" databind="h_extra_2" defaultvalue="scoreboard,freq,diff"/>

			<div id="tabcontrolscorecardform" >
				<ul>
					<li><a href="#tabs-1">Properties</a></li>    
					<li><a href="#tabs-2">Assign Measures</a></li>
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
				<div id="tabs-2" class="tab-content">
					<label  class="validateTips"></label>
					<form>
						<table width="100%" align="center">
							<tr>
								<td>
									<label>Available Measures (double click to assign)</label>
								</td>
							</tr>
							<tr>
								<td>
									<select id="availableMeasures" size="15" class="text">
									</select>
								</td>
							</tr>
							<tr>
								<td>
									<label>Assigned Measures (double click to remove)</label>
								</td>
							</tr>
							<tr>
								<td>
									<select id="selectedMeasures" size="10" class="text">
									</select>
								</td>
							</tr>


						</table>

					</form>
				</div>
				<div id="tabs-3" class="tab-content">
					<label  class="validateTips"></label>
					<form>
						<table width="100%">
							<tr>
								<td colspan="6">
									<label class="bold">Show Columns</label>
								</td>
							</tr>
							<tr>
								<td align="center">
									Frequency<br>
									<input col="freq" type="checkbox"/>
								</td>

								<td align="center">
									Scoreboard<br>
									<input col="scoreboard" type="checkbox"/>
								</td>
								<td align="center">
									Trendline<br>
									<input col="trendline" type="checkbox" checked/>
								</td>
								<td align="center">
									Target<br>
									<input col="target" type="checkbox" checked/>
								</td>

								<td align="center">
									Latest<br>
									<input col="current" type="checkbox" checked/>
								</td>
								<td align="center">
									Difference<br>
									<input col="diff" type="checkbox"/>
								</td>
								<td align="center">
									Indicator<br>
									<input col="ind" type="checkbox" checked/>
								</td>
							</tr>
						</table>

						<div class="portlet">
							<div class="portlet-header htl-widget-header"></div>
							<div id="measuresContainer" class="portlet-content">
							</div>
						</div>
						
					</form>
				</div>
			</div>

</div>
