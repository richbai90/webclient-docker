<style>
		.dashboardform
		{
			display:none;
		}
		.dashboardform *
		{
			font-size: 12px;
		}
		.dashboardform label, .dashboardform input { display:block; }
		.dashboardform input.text { margin-bottom:12px; width:95%; padding: .4em; }
		.dashboardform select.text { margin-bottom:12px; width:98%; padding: .2em; }
		.dashboardform fieldset { padding:0; border:0; margin-top:25px; }
		.dashboardform h1 { font-size: 1.2em; margin: .6em 0; }
		.dashboardform .ui-dialog .ui-state-error { padding: .3em; }
		.dashboardform .validateTips { border: 1px solid transparent; padding: 0.3em; }
</style>

<script>
$(function() {
	var name = $( ".dashboardform #name" ),
		uraccess = $( ".dashboardform #uraccess" ),
		uidaccess = $( ".dashboardform #uidaccess" ),
		layout = $( ".dashboardform #layout" ),
		allFields = $( [] ).add( name ).add( uidaccess ).add( layout ).add( uraccess ),
		tips = $( ".validateTips" );

	function updateTips( t ) {
		tips
			.text( t )
			.addClass( "ui-state-highlight" );
		setTimeout(function() {
			tips.removeClass( "ui-state-highlight", 1500 );
		}, 500 );
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

	$( "#dashboard-form" ).dialog({
		autoOpen: false,
		height: 380,
		width: 350,
		modal: true,
		buttons: {
			"Save": function() {
				var bValid = true;
				allFields.removeClass( "ui-state-error" );

				bValid = bValid && checkLength( layout, "layout", 3, 64 );
				bValid = bValid && checkLength( name, "name", 1, 64 );
				bValid = bValid && checkRegexp( name, /^[a-z]([0-9 a-z_])+$/i, "Name may consist of a-z, 0-9, underscores, begin with a letter." );

				if ( bValid ) 
				{
					var lbGrp = $("#lbGroups");
					var bCreate=true;
					var frm = $(this);
					var p = {};
						p.sessid = ESP.sessionid;
						p.h_title = name.val();
						p.h_layout = layout.val();
						p.h_uraccess=uraccess.val();
						p.h_uidaccess=uidaccess.val();
						p.gid=lbGrp.val();


						//-- create group
						if($(this).data("datarecord")==false)
						{
							var serviceUrl = "adminservices/createdashboard.php";
						}
						else
						{
							//-- edit group
							bCreate=false;
							p.did= $(this).data("datarecord").h_dashboard_id;
							var serviceUrl = "adminservices/updatedashboard.php";
						}

						$.post(serviceUrl, p, function(j, res,http) 
													{  
														if(j && j.state && j.state.error)
														{
															alert(j.state.error)
														}
														else
														{
															//-- add dashboard to select box and select
															var lbDashboard = $("#lbDashboards");
															if(bCreate)
															{
																lbDashboard.append($("<option></option>")
																	 .attr("value",j.h_dashboard_id)
																	 .text(name.val())); 

																lbDashboard.find("option:last").attr("selected","selected").data("layout",layout.val());
																lbDashboard.change();
															}
															else
															{
																lbDashboard.find("option:selected").text(name.val()).data("layout",layout.val());
															}


															frm.dialog( "close" );
														}
													},"json").error(function(a,b,c)
																	{
																		alert(b+":"+c);
																	});

				}
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		open:function(){
			var frm = $(this);


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
				//-- updating
				frm.dialog( "option", "title", "Update Dashboard" );

				loadRecordValues(frm,frm.data("datarecord"))
			}
			else
			{
				//-- creating
				frm.dialog( "option", "title", "Create New Dashboard" );
			}
		},
		close: function() {

			var frm = $(this);
			frm.data("datarecord",false);

		}
	});
});
</script>

<div id="dashboard-form" class='dashboardform'>

	<!-- tab contcrol - general / widgets -->

	<p class="validateTips"></p>
	<form>
		<fieldset>
			<label>Name</label>
			<input type="text" id="name" databind="h_title" defaultvalue="" class="text ui-widget-content" />
			<label>Column Layout (33:33:33 or 50:50 etc)</label>
			<input type="text" id="layout" databind="h_layout" defaultvalue="33:33:33" value="" class="text ui-widget-content" />
			<label>Grant Access To User Role</label>
			<select id="uraccess" databind="h_uraccess" defaultvalue="0" class="text ui-widget-content">
				<option value="0"></option>
				<option value="3">System Administrators</option>
				<option value="2">Group Managers</option>
				<option value="1">Support Analysts</option>
			</select>
			<label>Grant Access To UserIDs (comma seperated)</label>
			<input type="text" id="uidaccess" databind="h_uidaccess" defaultvalue="" value="" class="text ui-widget-content" />

		</fieldset>
	</form>
</div>
