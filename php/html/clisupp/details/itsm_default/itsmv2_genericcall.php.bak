
<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<div id="activepagecontentColumn" >
<!-- left hand col -->

<div id="formArea" style="width:100%;">
	<div id="swtPageTop"><img src="img/structure/box_header_left.gif" /></div>
	<div id="swtInfoBody">

	<?php 		//-- if emailing do not show actions
		if($emailmode!="1")
		{
	?>

						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1><?php echo $callclass;?> Actions</h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>

						<!-- call actions (if in fat client) -->
						<div class="graphicActions">
						<?php 							include('php/call.actions.php');
						?>
						</div>
	<?php 		}
	?>


	<table width="100%" cellpadding="0" cellspacing="2">
	<tr>
		<td width="50%" noWrap valign="top">
			<!-- call details -->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1><?php echo $callclass;?> Details For <?php echo swcallref_str($rsCall->xf('callref'));?></h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>
						<table>
						<tr>
							<td class="right" class="dataLabel" ><?php echo  swdti_getcoldispname("opencall.owner"); ?> :</td><td><span id="opencall.owner"><?php echo $rsCall->xf('owner');?></span></td>
						</tr>
						<tr>
							<td class="right" class="dataLabel" ><?php echo  swdti_getcoldispname("opencall.suppgroup"); ?> :</td><td><span id="opencall.suppgroup"><?php echo $rsCall->xf('suppgroup');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.status"); ?> :</td><td><span id="opencall.status"><?php echo swstatus_str($rsCall->xf('status'));?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.itsm_impact_level"); ?> :</td><td><span id="opencall.itsm_impact_level"><?php echo $rsCall->xf('itsm_impact_level');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.itsm_urgency_level"); ?> :</td><td><span id="opencall.itsm_urgency_level"><?php echo $rsCall->xf('itsm_urgency_level');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.itsm_sladef"); ?> :</td><td><span id="opencall.itsm_sladef"><?php echo $rsSLA->xf('slad_id');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.priority"); ?> :</td><td><span id="opencall.priority"><?php echo $rsCall->xf('priority');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.costcenter"); ?> :</td><td><span id="opencall.costcenter"><?php echo $rsCall->xf('costcenter');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.loggedby"); ?> :</td><td><span id="opencall.loggedby"><?php echo $rsCall->xf('loggedby');?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.logdatex"); ?> :</td><td><span id="opencall.logdatex"><?php echo SwFormatDateTimeColumn("opencall.logdatex",$rsCall->xf('logdatex'));?></span></td>
						</tr>

						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.respondbyx"); ?> :</td><td><span id="opencall.logdatex"><?php echo SwFormatDateTimeColumn("opencall.respondbyx",$rsCall->xf('respondbyx'));?></span></td>
						</tr>
						<tr>
							<td class="right"><?php echo  swdti_getcoldispname("opencall.fixbyx"); ?> :</td><td><span id="opencall.logdatex"><?php echo SwFormatDateTimeColumn("opencall.fixbyx",$rsCall->xf('fixbyx'));?></span></td>
						</tr>
						</table>					

		</td>
		<td width="50%" noWrap valign="top">
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1>Customer Details</h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>
						<table>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.keysearch"); ?> :</td><td><span id="userdb.keysearch"><?php echo $rsCust->xf('keysearch');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top">Name :</td><td><span id="userdb.fullname"><?php echo $rsCust->xf('firstname') ." ". $rsCust->xf('surname') ;?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.telext"); ?> :</td><td><span id="userdb.telext"><?php echo $rsCust->xf('telext');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.mobiletel"); ?> :</td><td><span id="userdb.mobile"><?php echo $rsCust->xf('mobiletel');?></span></td>
						</tr>

						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.email"); ?> :</td><td><span id="userdb.email"><?php echo $rsCust->xf('email');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.sld"); ?> :</td><td><span id="userdb.priority"><?php echo $rsCustSLA->xf('slad_id');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.priority"); ?> :</td><td><span id="userdb.priority"><?php echo $rsCust->xf('priority');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.costcenter"); ?> :</td><td><span id="userdb.costcenter"><?php echo $rsCust->xf('costcenter');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.site"); ?> :</td><td><span id="userdb.site"><?php echo $rsCust->xf('site');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.location"); ?> :</td><td><span id="userdb.location"><?php echo $rsCust->xf('location');?></span></td>
						</tr>

						<tr>
							<td class="right" valign="top">&nbsp;</td><td></span></td>
						</tr>
						<tr>
							<td class="right" valign="top">&nbsp;</td><td></span></td>
						</tr>
						</table>
	
		</td>
	</tr>
	</table>

	</br>


	<!-- summary details -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Summary</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
	</div>
	<table>
		<tr>
			<td><span id="opencall.itsm_title"><?php echo $rsCall->xf('itsm_title');?></span></td>
		</tr>
	</table>
	</br>

	<!-- profile details -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1><?php echo $callclass;?> Category</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
	</div>
	<table>
		<tr>
			<td class="right"><?php echo  swdti_getcoldispname("opencall.probcode"); ?> :</td><td><span id="opencall.probcode"><?php echo FormatProblemCode($rsCall->xf('probcode'));?></span></td>
		</tr>
		<tr>
			<td class="right"><?php echo  swdti_getcoldispname("opencall.fixcode"); ?> :</td><td><span id="opencall.fixcode"><?php echo FormatResolutionCode($rsCall->xf('fixcode'));?></span></td>
		</tr>
	</table>
	</br>


	<!-- affected cis details -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1><?php echo $citextcode;?> Items</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
	</div>
	<?php echo create_callcidatatable($rsCall->xf('callref'),$cicallcausecode,"","call.configitems");?>
	<br>			



	<!-- diary list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1><?php echo $callclass;?> Diary</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
	</div>
	<?php echo create_calldairy_datatable($rsCall->xf('callref'));?>

	<?php 	if($callclass=="Service Request")
	{
		include('service_request_pricing.php');
	}
	?>

	</div> <!-- swtInfoBody -->
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
