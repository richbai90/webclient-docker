<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	include_once("global.settings.php");

	$sessid = gvs('sessid');

	$current_dd = $_SESSION['current_dd'];
	
	//-- F0100079 - check session variable
	if((!regex_match("/^[a-zA-Z0-9]{14}-[a-zA-Z0-9]{4,5}-[a-zA-Z0-9]{8}$/",$sessid)) && (!regex_match("/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}$/",$sessid)))
	{
		//-- call not found ?? in theory should never happen
		?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Call Search Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br></br>
					<center>
					<span class="error">
						A submitted variable was identified as a possible security threat.<br> 
						Please contact your system Administrator.
					</span>
					</center>
				</body>
		</html>
		<?php 		exit;
	}	
	
	//$bInWebclient = $GLOBALS['_webclient'];
	$bInWebclient = gv('_webclient');

	//-- Construct a new active page session
	$session = new classActivePageSession($sessid);
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Session Authentication Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							There has been a session authentication error<br>
							Please contact your system administrator.
						</span>
					</center>
				</body>
		</html>
	<?php 		exit;
	}
	$_SESSION['sessid'] = gvs('sessid');

	$strDefaultView = 'month';
	$strDefaultEventType = 0;
	$strDefaultCallSummary = False;
	//-- create a connection to swdata
	$oDBConn = database_connect('swdata');
	if($oDBConn)
	{
		$oRec = $oDBConn->Query("SELECT setting_value from sw_sbs_settings where setting_name='CHANGESCHEDULE.DEFAULTVIEW'",true);
		if(!$oRec->eof)
		{
			$strTempVal = $oRec->f('setting_value');
			if($strTempVal=="Week")
				$strDefaultView = "basicWeek";
			if($strTempVal=="Day")
				$strDefaultView = "agendaDay";
		}
		$oRec = $oDBConn->Query("SELECT setting_value from sw_sbs_settings where setting_name='CHANGESCHEDULE.DISPLAYCALLSUMMARY'",true);
		if(!$oRec->eof)
		{
			$strDefaultCallSummary = $oRec->f('setting_value');
		}
		$oRec = $oDBConn->Query("SELECT setting_value from sw_sbs_settings where setting_name='CHANGESCHEDULE.DEFAULTINCLUDEFILTER'",true);
		if(!$oRec->eof)
		{
			$strDefaultEventType = $oRec->f('setting_value');
		}
	}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
<link rel='stylesheet' type='text/css' href='css/fullcalendar.css' />
<link rel='stylesheet' type='text/css' href='css/fullcalendar.print.css' media='print' />
<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
<script type='text/javascript' src='../../jquery/jquery-1.7.1.min.js'></script>
<script type='text/javascript' src='../../jquery/jquery-ui-1.8.17.custom.min.js'></script>
<script type='text/javascript' src='jscript/fullcalendar.js'></script>
<script type='text/javascript'>

	var calendarfilters={
		view:'<?php echo $strDefaultView;?>',
		eventtype:'<?php echo $strDefaultEventType;?>',
		callsummary:'<?php echo $strDefaultCallSummary;?>'
	};
	$(document).ready(function() {
	
		$('#calendar').fullCalendar({
			defaultView:'<?php echo $strDefaultView;?>',
				//allow dates to be selectable
			selectable: true,
				//cannot move an event
			disableDragging: true,
				//cannot lengthen an event
			lazyFetching : false,
			editable: false,
			axisFormat : 'H:mm',
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,agendaDay'
			},
			titleFormat:{
				month: 'MMMM yyyy',                             // September 2009
				agendaWeek: "<?php echo $GLOBALS['datefmt'];?>{ '&#8212;' <?php echo $GLOBALS['datefmt'];?>}", // Sep 7 - 13 2009
				basicWeek: "<?php echo $GLOBALS['datefmt'];?>{ '&#8212;' <?php echo $GLOBALS['datefmt'];?>}", // Sep 7 - 13 2009
				agendaDay: 'dddd, MMMM dS, yyyy',                  // Tuesday, Sep 8, 2009
				basicDay: 'dddd, MMMM dS, yyyy'                  // Tuesday, Sep 8, 2009
			},
			columnFormat:{
				month: 'ddd',                             // September 2009
				agendaWeek: "<?php echo $GLOBALS['datefmt'];?>", // Sep 7 - 13 2009
				basicWeek: "<?php echo $GLOBALS['datefmt'];?>", // Sep 7 - 13 2009
				agendaDay: "dddd <?php echo $GLOBALS['datefmt'];?>",                  // Tuesday, Sep 8, 2009
				basicDay: "dddd <?php echo $GLOBALS['datefmt'];?>"                  // Tuesday, Sep 8, 2009
			},
			timeFormat:{
				'month': '',
				'basicWeek': '',
				'agendaDay': ''
			},
			eventRender: function(event, element) {                                          
				if(element.find('span.fc-event-title').text()!="")
					element.find('span.fc-event-title').html(element.find('span.fc-event-title').text());					  
				else
					element.find('div.fc-event-title').html(element.find('div.fc-event-title').text());					  
			},
			events: {
				url: '/sw/clisupp/_fsc/<?php echo $current_dd;?>/fsc_data.php',
				type: 'POST',
				error: function() {
					alert('There was an error while fetching data!');
				},
				cache:false,
				data:calendarfilters
			},
			viewDisplay: function(view) {
				calendarfilters['view'] = view.name;
			},
			//when a day is clicked store date, so switching view will still include date
			dayClick: function(date, allDay, jsEvent, view) {
				$('#calendar').fullCalendar('gotoDate', date);
			},
			//when a period is clicked store date, so switching view will still include date
			select: function(startDate, endDate, allDay, jsEvent, view) {

				var date = new Date(startDate);
				var newYear = date.getFullYear();
				var newMonth = date.getMonth();
				var newDay = date.getDate();

				var date = new Date($('#calendar').fullCalendar('getDate'));
				var oldYear = date.getFullYear();
				var oldMonth = date.getMonth();
				var oldDay = date.getDate();

				// if not the same day, set day and reselect
				if(oldYear!=newYear || oldMonth!=newMonth || oldDay!=newDay)
				{
					$('#calendar').fullCalendar('gotoDate', newYear,newMonth,newDay);
					$('#calendar').fullCalendar( 'select', startDate, endDate, allDay);
				}
			}
		});//end of calendar
		
		//if an input which is type calendar filter is changed, then set data object and requery
        $(':input').change(function(){
			
			if ($(this).prop('type') == "checkbox")
			{
				//-- CH00125373 if a checkbox is changed post checkbox values
				if ($('#cfinclude').prop('checked'))
				{
					calendarfilters['cfinclude'] = "checked";
				}
				else
				{
					calendarfilters['cfinclude'] = "unchecked";
				}
				if ($('#sinclude').prop('checked'))
				{
					calendarfilters['sinclude'] = "checked";
				}
				else
				{
					calendarfilters['sinclude'] = "unchecked";
				}
			}
			else
			{
				calendarfilters[$(this).attr('paramname')] = $(this).val();
			}
            $('#calendar').fullCalendar('refetchEvents');
        });//end of filter value change

		$(':input').keypress(function(e) {
			if(e.which == 13) {
				calendarfilters[$(this).attr('paramname')] = $(this).val();
				$('#calendar').fullCalendar('refetchEvents');
			}
		});

		$('.fc-button-update').hover(
			  function () {
				$(this).addClass("fc-state-hover");
			  }, 
			  function () {
				$(this).removeClass("fc-state-hover");
			  }
		  ).mousedown(
			  function () {
				$(this).addClass("fc-state-down");
			  }
		  ).mouseup(
			  function () {
				$(this).removeClass("fc-state-down");
			  }
		  ).click(
			  function(){
				calendarfilters[$(this).attr('paramname')] = $(this).val();
				$('#calendar').fullCalendar('refetchEvents');
			  }
		  );
		$('.fc-button-add').click(
			  function(event){
				//-- Launch load scheduled item form
				if (top.bWebClient)
				{
					top.OpenForm('fsc_item');
				}
				else
				{
					window.location.href = "hsl:swjscallback?function=load_scheduled_item_form";
				}
				//-- After form is closed refresh calendar items
				/*calendarfilters[$(this).attr('paramname')] = $(this).val();
				$('#calendar').fullCalendar('refetchEvents');*/
			  }
		  );  	
	});//end of docuemnt onready

</script>
<style type='text/css'>

	body {
		margin-top: 40px;
		font-size: 14px;
		font-family: "Lucida Grande",Helvetica,Arial,Verdana,sans-serif;
		}

	#calendar {
		width: 900px;
		margin: 0 auto;
		}
	#calendarfilter {
		width: 900px;
		margin: 0 auto;
		}
	
</style>
</head>
<body>


	<div id="IE6MinWidth">
		<div id="wrapper">
			<div id="contentWrapper" >
			<table id="calendarfilter" cellspacing="1" border="0" cellpadding="1">
			<tr>
				<td valign="top">

					<table class="form-dataTable" style="width:100%">
						<tbody>
							<tr>
								<td class="dataLabel"></td> <!--spacer -->
								<td class="dataValue"><b>Schedule Filtering</b></td>
								<td>
									<span style=left:46px; class="fc-button fc-button-add fc-state-default fc-corner-left fc-corner-right">
										<span class="fc-button-inner">
											<span class="fc-button-content">Add</span>
											<span class="fc-button-effect"><span></span>
											</span>
										</span>
									</span>
								</td>
							</tr>
							<tr>
								<td class="dataLabel">Call Reference</td>
								<td class="dataValue"><input name="callref" paramname="callref" fldtype="calfilter"/></td>
							</tr>
							<tr>
								<td class="dataLabel">Support Group</td>
								<td class="dataValue"><select name="suppgroup" paramname="suppgroup" fldtype="calfilter">
									<option value=""></option>
								<?php 									//-- create a connection to swdata
									$oDBConn = database_connect('syscache');
									if($oDBConn)
									{
										$oDBConn->Query("SELECT id,name from swgroups where id!='_SYSTEM'");
										while($oDBConn->fetch("grp"))
										{
											 echo "<option value='".htmlentities($GLOBALS['grp_id'],ENT_QUOTES,'UTF-8')."'>".htmlentities($GLOBALS['grp_name'],ENT_QUOTES,'UTF-8')."</option>";
										}
									}
								?>
								</select></td>
							</tr>
							<tr>
								<td class="dataLabel">Include</td>
								<td class="dataValue">
								<select name="eventtype" paramname="eventtype" fldtype="calfilter">
								<?php 									echo '<option value="6">All Requests, Proposals and Activities</option>';
									
									echo '<option disabled></option>';
									
									echo '<option value="0" ';
										if($strDefaultEventType==0) 
											echo 'selected="selected"';
									echo '>Change Requests and Request Activities</option>';
									
									echo '<option value="2" ';
										if($strDefaultEventType==2) 
											echo 'selected="selected"';
									echo '>Change Requests</option>';

									echo '<option value="1" ';
										if($strDefaultEventType==1) 
											echo 'selected="selected"';
									echo '>Request Activities</option>';
									
									echo '<option value="8">Release Request Activities</option>';
									
									echo '<option disabled></option>';
									
									echo '<option value="5">Change Proposals and Activities</option>';									
									
									echo '<option value="4">Change Proposals</option>';
									
									echo '<option value="3">Change Proposal Activities</option>';
											
									echo '<option disabled></option>';

									echo '<option value="7">Projected Service Outage</option>';
									?>
								</select></td>
							</tr>
							<tr>
								<td class="dataLabel">
								<td><input id="cfinclude" type="checkbox" fldtype="calfilter" checked>Change Freeze Items</td>
							</tr>
							<tr>
								<td class="dataLabel">
								<td><input id="sinclude" type="checkbox" fldtype="calfilter" checked>Calendar Items</td>
							</tr>
							<tr>
								<td class="dataLabel">Show activities of type</td>
								<td class="dataValue"><select name="acttype" paramname="acttype" fldtype="calfilter">
									<option value=""></option>
								<?php 									//-- create a connection to swdata
									$oDBConn = database_connect('swdata');
									if($oDBConn)
									{
										$oDBConn->Query("SELECT distinct(value) as value from swlists where list_id='FSCACTIVITY'");
										while($oDBConn->fetch("lst"))
										{
											 echo "<option>".htmlentities($GLOBALS['lst_value'],ENT_QUOTES,'UTF-8')."</option>";
										}
									}
								?>
								</select></td>
							</tr>							
							<tr>
								<td class="dataLabel"></td>
								<td class="dataValue">				
									<span class="fc-button fc-button-update fc-state-default fc-corner-left fc-corner-right">
										<span class="fc-button-inner">
											<span class="fc-button-content">Refresh Schedule</span>
											<span class="fc-button-effect"><span></span>
										</span>
									</span>
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
			</tbody>
			</table>
			<div id='calendar'></div>
			</div>
		</div>
	</div>
</body>
</html>
