<style>
		.form
		{
			display:none;
		}
		.form *
		{
			font-size:12px;
		}
		.form label, .form input { display:block; }
		.form input.text { margin-bottom:6px; width:95%; padding: .4em; }
		.form select.text { margin-bottom:6px; width:98%; padding: .2em; }
		.form fieldset { padding:0; border:0; margin-top:25px; }
		.form h1 { font-size: 1.2em; margin: .6em 0; }
		.form .ui-dialog .ui-state-error { padding: .3em; }
		.form .validateTips { border: 1px solid transparent; padding: 0.3em; }
</style>

<script>
$(function() {
	var name = $( ".form #name" ),
		uidaccess = $( ".form #uidaccess" ),
		uraccess = $( ".form #uraccess" ),
		allFields = $( [] ).add( name ).add( uraccess ).add( uidaccess ),
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

	$( "#group-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Save": function() {
				var bValid = true;
				allFields.removeClass( "ui-state-error" );

				bValid = bValid && checkLength( name, "name", 1, 64 );
				bValid = bValid && checkRegexp( name, /^[a-z]([0-9 a-z_])+$/i, "Name may consist of a-z, 0-9, underscores, begin with a letter." );

				if ( bValid ) 
				{
					var bCreate=true;
					var frm = $(this);
					var p = {};
						p.sessid = ESP.sessionid;
						p.h_title = name.val();
						p.h_uraccess=uraccess.val();
						p.h_uidaccess=uidaccess.val();


						//-- create group
						if($(this).data("datarecord")==false)
						{
							p.gid=name.val();
							var serviceUrl = "adminservices/creategroup.php";
						}
						else
						{
							//-- edit group
							bCreate=false;
							p.gid= $(this).data("datarecord").h_gid;
							var serviceUrl = "adminservices/updategroup.php";
						}

						$.post(serviceUrl, p, function(j, res,http) 
													{  
														if(j && j.state && j.state.error)
														{
															alert(j.state.error)
														}
														else
														{
															//-- add group to select box and select
															var lbGroup = $("#lbGroups");
															if(bCreate)
															{
																lbGroup.append($("<option></option>")
																	 .attr("value",j.groupId)
																	 .text(j.title)); 

																lbGroup.find("option:last").attr("selected","selected");
																lbGroup.change();
															}
															else
															{
																$("#lbGroups").find("option:selected").text(name.val());
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

			if(frm.data("datarecord")==false)
			{
				//-- creating
				frm.dialog( "option", "title", "Create New Group" );
			}
			else
			{
				//-- updating
				frm.dialog( "option", "title", "Update Group" );
				loadRecordValues(frm,frm.data("datarecord"))
			}
		},
		close: function() {
			var frm = $(this);
			frm.data("datarecord",false);

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
		}
	});
});
</script>

<div id="group-form" class='form'>
	<p class="validateTips"></p>
	<form>
		<fieldset>
			<label for="name">Name</label>
			<input type="text" name="name" id="name" databind="h_title" class="text ui-widget-content ui-corner-all" />
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
