<?php


	$customContentProviders = get_phpscripts_forlistbox("../widgets/phpcontent/contentproviders", "widgets/phpcontent/contentproviders/");
	$customDrillDownProviders = get_phpscripts_forlistbox("../widgets/phpcontent/drilldowns", "widgets/phpcontent/drilldowns/");
?>
<style>
		.customform
		{
			display:none;
			border-width:0px;
		}

		.customform label, .customform input { display:block; margin-bottom:2px;}
		.customform input.text { margin-bottom:5px; width:475px; padding: 4px; }
		.customform input.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.customform input.text-100{ margin-bottom:5px; width:100px; padding: 4px; }

		.customform textarea{overflow:auto;}
		.customform textarea.text { margin-bottom:5px; width:475px; padding: 4px; }
		.customform textarea.text-20{ margin-bottom:5px; width:20px; padding: 4px; }
		.customform textarea.text-100{ margin-bottom:5px; width:100px; padding: 4px; }
		.customform textarea.text-200{ margin-bottom:5px; width:200px; padding: 4px; }
		.customform textarea.text-300{ margin-bottom:5px; width:300px; padding: 4px; }

		.customform select { margin-bottom:5px; width:97.2%; padding: 3px; }
		.customform select.text-100 {width:100px;  padding: 3px; margin-bottom:5px;  }
		.customform select.text-200 {width:200px; padding: 3px; margin-bottom:5px; }
		.customform select.text-300 {width:300px; padding: 3px; margin-bottom:5px;  }
		.customform select.text-350 {width:350px; padding: 3px; margin-bottom:5px;  }

		.customform label.td { margin-bottom:12px}

		.customform form { padding:0; border:0; margin-top:18px; }
		.customform .ui-dialog .ui-state-error { padding: 2px; }
		.customform .validateTips { border: 1px solid transparent; padding: 0.2em; display:none; position:absolute; top:45px; left:20px;}

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
			margin-top:5px;
			height:450px;
			display:block;
			overflow:auto;
		}


		.customform .portlet-content
		{
			overflow:hidden;
			height:300px;
		}

</style>


<script type="text/javascript" src="../../fce/FusionCharts.js"></script>

<script>
$(function() {

	var bSaved = false;
	
	$("#tabcontrolcustomform").tabs({
										heightStyle: "auto",
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
	$( "#custom-form" ).dialog({
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

						updateRecordValuesFromForm($( "#custom-form" ), $( "#custom-form" ).data("datarecord"), serviceUrl,function(res, data)
						{
							if(res)
							{
								bSaved=true;
								var msg = (bCreate)?"The custom widget was successfully created": "The widget was successfully updated";
								alert(msg) ;
								if(bCreate)frm.dialog( "close" );
							}
						});
				}
			},
			Close: function() {
				$( this ).dialog( "close" );
				if(bSaved)document.location.reload();
			}
		},
		open:function(){
			var frm = $(this);

			$("#tabcontrolcustomform").tabs("option", "active", 0);

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
				frm.dialog( "option", "title", "Edit Custom Widget Properties" );
				loadRecordValues(frm,frm.data("datarecord"));
			}
			else
			{
				//-- creating
				frm.dialog( "option", "title", "Create Custom Widget" );

			}
		},
		close: function() {

			var frm = $(this);
			frm.data("datarecord",false);
		}
	});


	function ge(selector)
	{
		return $(".customform " + selector);
	}


	$(".customform #customDataProvider").change(function()
	{
		//-- refresh preview
		renderChart();
	});

	//-- chart def changed to update / create charte
	function renderChart()
	{
		ge("#chartContainer").children().remove();
		ge("#chartContainer").html("");
		$(".customform .portlet-header").text($(".customform #widgettitle").val());

		var dataProvider = $(".customform #customDataProvider").val();
		if(dataProvider!="")
		{
			var p = {};
				p.sessid = ESP.sessionid;
				p.dp = dataProvider;

				var serviceUrl = "adminservices/getcustompreview.php";
				$.post(serviceUrl, p, function(markup, res,http) 
											{  
												ge("#chartContainer").append(markup);
											}).error(function(a,b,c)
															{
																alert(b+":"+c);
															});

		}
	}


});
</script>

<div id="custom-form" class='customform  swtheme-fontcolor'>

			<!-- hidden defaults -->
			<input type="hidden" id="widgettyp" databind="h_type" defaultvalue="custom"/>

			<div id="tabcontrolcustomform" >
				<ul>
					<li><a href="#tabs-1">Properties</a></li>    
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
				<div id="tabs-3" class="tab-content">
					<label  class="validateTips"></label>
					<form>
						<table width="100%">
							<tr>
								<td>
									<label for="name">Chart Drill Down</label>
								</td>
							</tr>
							<tr>
								<td>
									<select id="customDrillDown" databind="h_drilldownprovider" >
										<option value=""></option>
										<?php echo $customDrillDownProviders;?>
									</select>
								</td>
							</tr>
						</table>

						<table width="100%">
							<tr>
								<td>
									<label for="name">Content Provider</label>
								</td>
							</tr>
							<tr>
								<td>
									<select id="customDataProvider" databind="h_dataprovider" >
										<option value=""></option>
										<?php echo $customContentProviders;?>
									</select>
								</td>
							</tr>
						</table>
						<div class="portlet">
							<div class="portlet-header htl-widget-header"></div>
							<div id="chartContainer" class="portlet-content" style="height:auto;">
								widget content will load here based on selected content provider
							</div>
						</div>
						
					</form>
				</div>
			</div>

</div>
