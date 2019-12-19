<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<?php 
	include('index_data.php');
?>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Hornbill dev layout</title>

<link href="css/structure.css" rel="stylesheet" type="text/css" />
<script src="jscript/index.js"></script>
</head>
<body>

	<div id="IE6MinWidth">
	<div id="wrapper">
	
	
		<div id="contentColumn">
			
			<div id="contentWrapper">

<!-- ********** page head **********-->
			
				<div id="swtPageTop"><img src="img/structure/swt_logo.gif" title="SupportWorks Today" / ></div>
				
<!-- ********** End page head **********-->

<!-- ********** Start page body **********-->		

					<div id="swtInfoBody">
						
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Service Availability</h1></td>
									<td class="statusCell" width=100%>Status</td>
								</tr>
							</table>	
						</div>
						<?php echo  output_service_notifications($connSwdata)?>
	
						<!-- NWJ - Call php function in itsm_index_data.php	to echo out problems -->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Reported Problems</h1></td>
									<td class="statusCell">Impact</td>
								</tr>
							</table>	
						</div>
						<?php echo  output_problem_notifications($connSwdata)?>


						<!-- NWJ - Call php function in itsm_index_data.php	to echo out errors -->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Reported Known Errors</h1></td>
									<td class="statusCell">Impact</td>
								</tr>
							</table>	
						</div>
						<?php echo  output_error_notifications($connSwdata)?>
					
								
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Change Schedule</h1></td>
									<td class="statusCell" width=100%>&nbsp;</td>
								</tr>
							</table>	
						</div>
                        <?php echo  output_fsc_notifications_overview($connSwdata)?>

					</div> <!-- id="swtInfoBody"-- >				
				
				
<!-- ********** End page body **********-->



<!-- ********** Page base **********-->

				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
				
<!-- ********** End page base **********-->


				
			</div>
			
		</div>

<!-- ********** Left Column **********-->

		<div id="actionsColumn">
			
			<div class="calendar">
		  
				<table>
					<tr>
					<td class="calendarText">
						<?php echo $cal_weekday;?>
					<br/>
						<?php echo $cal_month;?>
					<br/>
						<?php echo $cal_year;?>
					</td>
					<td class="calendarDayText" ><?php echo $cal_day;?></td>
					<td class="calendarDayType" ><?php echo $cal_thrdst;?></td>
					</tr>
				</table>
			  </div>

		  
		  
	   <div class="actionBox">
		  
		 	<table >
				<tr>
				<td class="actionTitle"><a href="#" >Incidents</a></td>
				<td class="actionCount"><?php echo $int_myincidentcount?></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?tab=0&filter=Active">My Open Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_myincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?tab=0&filter=Escalated">My Escalated Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_escincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?tab=0&filter=Active">My Group's Open Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_groupincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?tab=0&filter=Escalated">My Group's Escalated Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_groupescincidentcount?></td>
					</tr>
			</table>
		  </div>	
	  
	  </div>
		  

	   <div class="actionBox">
		  
		 	<table >
				<tr>
				<td class="actionTitle"><a href="#" >Major Incidents</a></td>
				<td class="actionCount"><?php echo $int_mymajorincidentcount?></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?tab=1&filter=Active">My Open Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_mymajorincidentcount?></td>
					</tr>

					<tr>
						<td><a href="hsl:mycalls?tab=1&filter=Escalated">My Escalated Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_majorescincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?tab=1&filter=Active">My Group's Open Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_majorgroupincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?tab=1&filter=Escalated">My Group's Escalated Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_majorgroupescincidentcount?></td>
					</tr>
			</table>
		  </div>	
	  
	  </div>
		  
	   <div class="actionBox">
		  
		 	<table >
				<tr>
				<td class="actionTitle"><a href="#" >Service Requests</a></td>
				<td class="actionCount"><?php echo $int_mysrcount?></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=0&lfilter=Active">My Open Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_mysrcount?></td>
					</tr>

					<tr>
						<td><a href="hsl:mycalls?ltab=0&lfilter=Escalated">My Escalated Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_escsrcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=0&lfilter=Active">My Group's Open Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_groupsrcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=0&lfilter=Escalated">My Group's Escalated Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_groupescsrcount?></td>
					</tr>
			</table>
		  </div>	
	  
	  </div>

	   <div class="actionBox">
		 	<table>
				<tr>
				<td class="actionTitle"><a href="#" >Problems</a></td>
				<td class="actionCount"><span class="green"><?php echo $int_myproblemcount?></span></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Active">My Open Problems</a></td>
						<td class="actionItemCount"><?php echo $int_myproblemcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Escalated">My Escalated Problems</a></td>
						<td class="actionItemCount"><?php echo $int_escproblemcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Active">My Group's Open Problems</a></td>
						<td class="actionItemCount"><?php echo $int_groupproblemcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Escalated">My Group's Escalated Problems</a></td>
						<td class="actionItemCount"><?php echo $int_groupescproblemcount?></td>
					</tr>
				</table>
			</div>	
	  </div>

	   <div class="actionBox">
		 	<table>
				<tr>
				<td class="actionTitle"><a href="#" >Known Errors</a></td>
				<td class="actionCount"><span class="green"><?php echo $int_myerrorcount?></span></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Active">My Open Errors</a></td>
						<td class="actionItemCount"><?php echo $int_myerrorcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Escalated">My Escalated Errors</a></td>
						<td class="actionItemCount"><?php echo $int_escerrorcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Active">My Group's Open Errors</a></td>
						<td class="actionItemCount"><?php echo $int_grouperrorcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Escalated">My Group's Escalated Errors</a></td>
						<td class="actionItemCount"><?php echo $int_groupescerrorcount?></td>
					</tr>
				</table>
			</div>	
	  </div>

		 
	   <div class="actionBox">
		 	<table>
				<tr>
				<td class="actionTitle"><a href="#" >Change Requests</a></td>
				<td class="actionCount"><span class="green"><?php echo $int_myrfccount?></span></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=2&lfilter=Active">My Open Changes </a></td>
						<td class="actionItemCount"><?php echo $int_myrfccount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?ltab=2&lfilter=Escalated">My Escalated Changes</a></td>
						<td class="actionItemCount"><?php echo $int_escrfccount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=2&lfilter=Active">My Group's Open Changes</a></td>
						<td class="actionItemCount"><?php echo $int_grouprfccount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=2&lfilter=Escalated">My Group's Escalated Changes</a></td>
						<td class="actionItemCount"><?php echo $int_groupescrfccount?></td>
					</tr>
				</table>
			</div>	
	  </div>


		  
<!-- ********** End left Column **********-->

	</div>
	</div>
	</div>
</body>
</html>
