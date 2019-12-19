<?php

	$measureDataProviders = get_phpscripts_forlistbox("../trending/measuresampleproviders", "trending/measuresampleproviders/");
	$measureDrillDownProviders = get_phpscripts_forlistbox("../trending/drilldowns", "trending/drilldowns/");

?>
<style>
		.measureform
		{
			display:none;
			border-width:0px;
		}

		.measureform label, .measureform input { display:block; margin-bottom:2px;}
		.measureform input.text { margin-bottom:5px; width:95%; padding: 4px; }
		.measureform input.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.measureform input.text-100{ margin-bottom:5px; width:100px; padding: 4px; }

		.measureform textarea{overflow:auto;}
		.measureform textarea.text { margin-bottom:5px; width:95%; padding: 4px; }
		.measureform textarea.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.measureform textarea.text-100{ margin-bottom:5px; width:100px; padding: 4px; }
		.measureform textarea.text-200{ margin-bottom:5px; width:200px; padding: 4px; }
		.measureform textarea.text-300{ margin-bottom:5px; width:300px; padding: 4px; }

		.measureform select { margin-bottom:5px; width:95%; padding: 3px; }
		.measureform select.text-100 {width:100px;  padding: 3px; margin-bottom:5px;  }
		.measureform select.text-200 {width:200px; padding: 3px; margin-bottom:5px; }
		.measureform select.text-300 {width:300px; padding: 3px; margin-bottom:5px;  }
		.measureform select.text-350 {width:350px; padding: 3px; margin-bottom:5px;  }

		.measureform label.td { margin-bottom:12px}

		.measureform form { padding:0; border:0; margin-top:18px; }
		.measureform .ui-dialog .ui-state-error { padding: 2px; }
		.measureform .validateTips { border: 1px solid transparent; padding: 0.2em; display:none; position:absolute; top:45px; left:20px;}

		.measureform #tabs-2 .tbl-h
		{
			color:#ffffff;
			background-color:silver;
		}

		.measureform #tabs-2 td
		{
			padding:2px 4px 2px 4px;
			font-size:10px;
		}

		.measureform .tab-content
		{
			margin-top:5px;
			height:540px;
			display:block;
			overflow:auto;
		}

		#tabcontrolMeasureForm
		{
				border-width:0px;
		}

		#tabcontrolMeasureForm ul
		{
			border-width:0px 0px 1px 0px;
			background:transparent;
			background-color::transparent;
			filter:none;
		}


		.siddate
		{
			border:1px transparent solid;
		}
		.sidvalue
		{
			text-align:right;
			border:1px transparent solid;
		}
		.focusborder
		{
			border:1px #cccccc solid;
			background-color:#FFFFD4;
		}
		.modifieddata
		{
			font-weight:bold;
		}

		.hidden
		{
			display:none;
		}
</style>

<script>
$(function() {

	
	$("#measureCalcMethod").change(function()
	{
		if($(this).val()=="perc")
		{
			$("#percentageRow").show();
		}
		else
		{
			$("#percentageRow").hide();
		}
	});

	$("#tabcontrolMeasureForm").tabs({ heightStyle: "auto" });


	$( ".btn-create-sample" ).button({text: false,icons: {primary: "ui-icon-image"}}).click(function()
	{
		//-- call php to create dummy sample in table and then reload table data

			var p = {};
				p.sessid = ESP.sessionid;
				p.mid=$( "#measure-form" ).data("datarecord").h_id;
				p.samplevalue=45;

				var serviceUrl = "adminservices/createsample.php";
				$.post(serviceUrl, p, function(j, res,http) 
											{  
												if(j && j.state && j.state.error)
												{
													alert(j.state.error)
												}
												else
												{
													var htmlRow = '<tr sid="'+j.h_pk_sid+'"><td><button class="btn-delete-sample">delete this sample</button></td><td><input type="text" class="siddate" origvalue="'+j.h_sampledate+'" value="'+j.h_sampledate+'"/></td><td align="right"><input type="text" class="sidvalue" origvalue="'+j.h_value+'" value="'+j.h_value+'"/></td></tr>';
													$("#sampleDataTable").prepend(htmlRow);

													applyDateMasking($("#sampleDataTable").find(".siddate").first());
													applyDeleteFunction($("#sampleDataTable").find(".btn-delete-sample").first());
													applyEditableDataFunctions($("#sampleDataTable").find("TR").first().find("input"));

												}
											},"json").error(function(a,b,c)
															{
																alert(b+":"+c);
															});
	}); 


	function loadMeasureSampleData(intMid,strUnitType)
	{
			var p = {};
				p.sessid = ESP.sessionid;
				p.mid=intMid;
				p.ut=strUnitType;

				var serviceUrl = "adminservices/getsampledatatable.php";
				$.post(serviceUrl, p, function(rowMarkup, res,http) 
										{
												$("#sampleDataTable").prepend(rowMarkup);

												applyDateMasking($("#sampleDataTable").find(".siddate"));
												applyDeleteFunction($("#sampleDataTable").find(".btn-delete-sample"));
												applyEditableDataFunctions($("#sampleDataTable").find("input"));


										}).error(function(a,b,c)
												{
													alert(b+":"+c);
												});

	}

	function applyEditableDataFunctions(inputs)
	{
		inputs.focus(function()
		{
			$(this).addClass("focusborder");
		});
		inputs.blur(function()
		{
			$(this).removeClass("focusborder");
		});
		inputs.change(function()
		{
			var i = $(this);
			var tr = i.closest("TR");
			i.addClass("modifieddata");
			tr.data("modified",true);

			//-- save data to db
			saveSampleData(tr);

		});
	}

	function saveSampleData(tr)
	{
		var p = {};
			p.sessid = ESP.sessionid;
			p.sid=tr.attr("sid");

			p.sampledate = tr.find("input.siddate").val();
			p.samplevalue=tr.find("input.sidvalue").val();

			var serviceUrl = "adminservices/updatesample.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												//-- show undo button ??
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});

	}

	function applyDeleteFunction(elements)
	{

		elements.button({text: false,icons: {primary: "ui-icon-trash"}}).click(function()
		{
			var tr = $(this).closest("TR");
			deleteSample(tr.attr("sid"),tr);
		}); 
	}

	function applyDateMasking(elements)
	{
		elements.mask("9999-99-99 99:99");
	}


	function deleteSample(sampleID, removeRow)
	{
		if(confirm("Are you sure you want to delete this sample record?"))
		{

			var p = {};
				p.sessid = ESP.sessionid;
				p.sid=sampleID;

				var serviceUrl = "adminservices/deletesample.php";
				$.post(serviceUrl, p, function(j, res,http) 
											{  
												if(j && j.state && j.state.error)
												{
													alert(j.state.error)
												}
												else
												{
													//- -if there is a removerowe then delete it
													if(removeRow)removeRow.remove();
												}
											},"json").error(function(a,b,c)
															{
																alert(b+":"+c);
															});
		}
	}

	var name = $( ".measureform #name" ),
		freq = $( ".measureform #freq" ),
		trendlimit = $( ".measureform #trendlimit" ),
		targetscore = $( ".measureform #targetscore" ),
		freqtype = $( ".measureform #freqtype" ),
		highisgood = $( ".measureform #highisgood" ),
		unittype = $( ".measureform #unittype" ),

		allFields = $([]).add(name).add(freq).add(trendlimit).add(targetscore).add(freqtype).add(highisgood).add(unittype),
		tips = $( ".validateTips" );

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
	$( "#measure-form" ).dialog({
		autoOpen: false,
		height: 730,
		width: 650,
		modal: true,
		buttons: {
			"Save": function() {
				var frm = $(this);
				var bValid = true;
				allFields.removeClass( "ui-state-error" );

				bValid = bValid && checkLength( name, "name", 1, 128 );
				bValid = bValid && checkRegexp( freq, /^([0-9])+$/i, "A numeric value is expected for the sample frequency." );
				bValid = bValid && checkRegexp( trendlimit, /^([0-9])+$/i, "A numeric value is expected for the trendline sample limit." );
				bValid = bValid && checkRegexp( targetscore, /^([0-9])+$/i, "A numeric value is expected for the threshold marker." );

				if ( bValid ) 
				{
						var bCreate = false;
						if($(this).data("datarecord"))
						{
							//-- edit measure
							var serviceUrl = "adminservices/updatemeasure.php";
						}
						else
						{
							//-- create measure
							bCreate = true;
							var serviceUrl = "adminservices/createmeasure.php";
						}

						updateRecordValuesFromForm($( "#measure-form" ), $( "#measure-form" ).data("datarecord"), serviceUrl,function(res, data)
						{
							if(res)
							{
								var msg = (bCreate)?"The record was successfully created": "The record was successfully updated";
								alert(msg) ;
								document.location.reload();
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

			$("#tabcontrolMeasureForm").tabs("option", "active", 0);

			
			if(frm.data("datarecord"))
			{
				//-- updating - load data samples
				frm.dialog( "option", "title", "Update Measure" );

				//-- reset field values
				frm.find("*[databind]").each(function()
				{
					var fld =  $(this);
					fld.removeClass( "ui-state-error" );
					fld.val("");
				});

				$( ".btn-create-sample" ).show();
				loadRecordValues(frm,frm.data("datarecord"))
				loadMeasureSampleData(frm.data("datarecord").h_id,frm.data("datarecord").h_unittype);
			}
			else
			{
				//-- creating
				frm.dialog( "option", "title", "Create New Measure" );

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
				});

				//-- creating rec based on an existing one
				if(frm.data("createfromrecord"))
				{
					loadRecordValues(frm,frm.data("createfromrecord"))
				}
				

				//-- hide create button on sample data
				$( ".btn-create-sample" ).hide();
			}

			$("#measureCalcMethod").change();
		},
		close: function() {

			var frm = $(this);
			frm.data("datarecord",false);
			frm.data("createfromrecord",false);

			$("#sampleDataTable").find("*").remove();
		}
	});


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
															stop();
															alert(b+":"+c);
															if(callback)callback(false);
														});

	}


});
</script>

<div id="measure-form" class='measureform  swtheme-fontcolor'>

			<div id="tabcontrolMeasureForm" >
				<ul>
					<li><a href="#tabs-1">Properties</a></li>    
					<li><a href="#tabs-2">Sampled Data</a></li>
					<li><a href="#tabs-3">Data Collection</a></li>
				</ul>
				<div id="tabs-1" class="tab-content">
					<label  class="validateTips"></label>
					<form>
							<table width="100%">
								<tr>
									<td colspan="2">
										<label for="name">Measure Name (as shown on widgets)</label>
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<input type="text" name="name" id="name" databind="h_title" defaultvalue="" class="text ui-widget-content " />
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<label for="freq">Take A Sample Every 'N' 'Time Period' </label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" id="freq" class="text-100 ui-widget-content "  databind="h_frequency"  value="1" defaultvalue="1" />
									</td>
									<td>
										<select id="freqtype" class='text-200' defaultvalue="hour"  databind="h_frequency_type">
											<option value="hour">Hour(s)</option>
											<option value="day">Day(s)</option>
											<option value="week">Week(s)</option>
											<option value="month">Month(s)</option>
											<option value="year">Year(s)</option>
										</select>
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<label for="name">Max Number Of Samples To Keep</label>
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<input type="text" name="name" id="name" databind="h_maxsamples_tostore" defaultvalue="0" class="text ui-widget-content " />
									</td>
								</tr>
							</table>

							<fieldset>
								<legend>Scorecard Settings</legend>
								<table>
									<tr>
										<td>
											<label for="targetscore">Goal</label>
										</td>
										<td>
											<label for="highisgood">Objective</label>
										</td>
										<td>
											<label for="highisgood">Unit Type</label>
										</td>
									</tr>
									<tr>
										<td>
											<input type="text" id="targetscore" class="text-100 ui-widget-content " databind="h_threshold" value="1" defaultvalue="1"/>
										</td>
										<td>
											<select id="highisgood" class='text-200'  defaultvalue="1" databind="h_highisgood">
												<option value="1">higher score is good</option>
												<option value="0">lower score is good</option>
											</select>
										</td>
										<td>
											<select id="unittype" class='text-20'  defaultvalue="" databind="h_unittype">
												<option value=""></option>
												<option value="&#37">&#37;</option>
												<option value="&pound">&pound;</option>
												<option value="&#36">&#36;</option>
												<option value="&euro">&euro;</option>
												<option value="days">Days</option>
												<option value="hrs">Hours</option>
												<option value="mins">Minutes</option>
												<option value="secs">Seconds</option>
											</select>
										</td>
									</tr>
								</table>
							</fieldset>
					</form>
				</div>  
				<div id="tabs-2" class="tab-content">
						<table>
							<tr>
								<td>
									<label for="trendlimit">Number Of Samples To Use For Trend Line Chart</label>
								</td>
								<td>
									<input type="text" id="trendlimit" databind="h_trendlimit" class="text-20 ui-widget-content " value="5"  defaultvalue="5"/>
								</td>
							</tr>
						</table>

					<table border="0"  cellspacing='2' cellpadding='2'>
						<tr>
							<td class='tbl-h'><button class="btn-create-sample">create a new sample manually</button></td>
							<td class='tbl-h'>Sample Date</td>
							<td class='tbl-h'>Recorded Score</td>
						</tr>
						<tbody id="sampleDataTable">
						</tbody>
					</table>	
				</div>
				<div id="tabs-3" class="tab-content">
					<form>

						<fieldset>
							<legend>Simple Sampling</legend>
							<table width="100%">
								<tr>
									<td>
										<label>Sample Table</label>
									</td>
									<td  colspan="2">
										<label>Primary Key</label>
									</td>

								</tr>
								<tr>
									<td>
										<input type="text" class="text ui-widget-content" databind="h_sampleon_table" defaultvalue="opencall">
									</td>
									<td>
										<input type="text" class="text ui-widget-content" databind="h_sampleon_keycolname" defaultvalue="callref">
									</td>

								</tr>
								<tr>
									<td>
										<label>Sample Column</label>
									</td>
									<td>
										<label>Sample Method</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" class="text ui-widget-content" databind="h_sampleon_valcolname" defaultvalue="callref">
									</td>
									<td>
										<select class='text'  id="measureCalcMethod" databind="h_sampleon_mathfunc" defaultvalue="count">
											<option value="count">Count</option>
											<option value="avg">Average</option>
											<option value="sum">Sum</option>
											<option value="perc">Percentage</option>
										</select>
									</td>
								</tr>
								<tr id="percentageRow" class="hidden">
									<td>
										<label>Filter % Where</label>
									</td>
									<td>
										<input type="text" class="text ui-widget-content" databind="h_sampleon_colwhere" defaultvalue="">
									</td>
								</tr>

								<tr>
									<td>
										<label>Sample Epoch Start Column</label>
									</td>
									<td>
										<label>and End Column (optional)</label>
									</td>
								</tr>
								<tr>
									<td>
										<input type="text" class="text ui-widget-content" databind="h_sampleon_datecolname1" defaultvalue="logdatex">
									</td>
									<td>
										<input type="text" class="text ui-widget-content" databind="h_sampleon_datecolname2" defaultvalue="">
									</td>
								</tr>
								<tr>
									<td>
										<label>Filter Data Where</label>
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<textarea class="text ui-widget-content" databind="h_sampleon_whereclause" defaultvalue=""></textarea>
									</td>
								</tr>
								<tr>
									<td>
										<label>Save Data Columns (10 max)</label>
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<input type="text" class="text ui-widget-content" databind="h_sampleon_savecols" defaultvalue="cust_id,callclass,status,owner,suppgroup,loggedby,loggedbygroup,resolvedby,resolvedbygroup">
									</td>
								</tr>
							</table>
						</fieldset>

						<fieldset style="margin-top:10px;">
							<legend>Advanced</legend>
							<table width="100%">
								<tr>
									<td>
										<label for="name">Measure Drill Down</label>
									</td>
								</tr>
								<tr>
									<td>
										<select id="measureDrillDown" databind="h_drilldownprovider" >
											<option value=""></option>
											<?=$measureDrillDownProviders;?>
										</select>
									</td>
								</tr>
								<tr>
									<td>
										<label for="name">Measure Data Provider</label>
									</td>
								</tr>
								<tr>
									<td>
										<select id="measureDataProvider" databind="h_dataprovider" >
											<option value=""></option>
											<?=$measureDataProviders;?>
										</select>
									</td>
								</tr>
							</table>
						</fieldset>
					</form>
				</div>
			</div>

</div>
