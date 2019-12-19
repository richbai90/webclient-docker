

<div id="activepagecontentColumn" >
<!-- left hand col -->

<div id="formArea" style="width:100%;">
	<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
	<div id="swtInfoBody">

	<?php 		//-- if not emailing and not printing
		//if(($emailmode!="1")&&($phpprintmode!="1"))
		if(0)
		{
	?>

						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1>Actions</h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>

						<!-- call actions (if in fat client) -->
						<div class="graphicActions">
						<?php 							include('php/cust.actions.php');
						?>
						</div>
	<?php 		}
	?>


	<table width="100%" cellpadding="0" cellspacing="2">
	<tr>
		<td width="75%" noWrap valign="top">
			<!-- call details -->
			<div class="sectionHead">
				<table class="sectionTitle">
					<tr>
						<td class="titleCell" noWrap><h1>Service Details For <?php echo $rsME->xf('ck_config_item');?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
	
				<table>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("sc_folio.service_name"); ?> :</td><td><span><?php echo $rsME->xf('ck_config_item');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("sc_folio.vsb_title"); ?> :</td><td><span><?php echo $rsME->xf('vsb_title');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.service_type"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('service_type'),"config_itemi.service_type");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.status_portfolio"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('status_portfolio'),"config_itemi.status_portfolio");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.status_lifecycle"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('status_lifecycle'),"config_itemi.status_lifecycle");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.catalog_type"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('catalog_type'),"config_itemi.catalog_type");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.fk_status_level"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('fk_status_level'),"config_itemi.fk_status_level");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.owner_it"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('owner_it'),"config_itemi.owner_it");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.owner_business"); ?> :</td><td><span><?php echo $rsME->xf('owner_business');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("config_itemi.fk_supplier"); ?> :</td><td><span><?php echo $rsME->xf('fk_supplier');?></span></td>
				</tr>
				</table>
			</div>
		</td>
		<td width="25%" noWrap valign="top">
			<!-- call details -->
			<div class="sectionHead">
				<table class="sectionTitle">
					<tr>
						<td class="titleCell" noWrap><h1>Other Information</h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
	
				<table>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("sc_folio.users_actual"); ?> :</td><td><span><?php echo $rsME->xf('users_actual');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("sc_folio.users_projected"); ?> :</td><td><span><?php echo $rsME->xf('users_projected');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("sc_folio.users_difference"); ?> :</td><td><span><?php echo $rsME->xf('users_difference');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("sc_folio.users_maximum"); ?> :</td><td><span><?php echo $rsME->xf('users_maximum');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right">Open Requests :</td><td><span><?php echo $intSRCount;?></span></td>
					</tr>
				</table>
			</div>
		</td>
	</tr>
	</table>


	<!-- outstanding call list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Subscribed Entities</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/service.custs","","",true);?>
	</div>
	

	<!-- outstanding call list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Outstanding Requests (<?php echo $intSRCount;?>)</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/service.calls","","",true);?>
	</div>



	</div>
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
