

<div id="activepagecontentColumn" >
<!-- left hand col -->

<div id="formArea" style="width:100%;">
	<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
	<div id="swtInfoBody">

	<?php 		//-- if not emailing and not printing
		if(($emailmode!="1")&&($phpprintmode!="1"))
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
						<?php 							include('php/org.actions.php');
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
						<td class="titleCell" noWrap><h1>Organisation Details For <?php echo htmlentities($company_pk_company_id,ENT_QUOTES,"UTF-8");?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
	
				<table>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.pk_company_id"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('pk_company_id'),"company.pk_company_id");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.companyname"); ?> :</td><td><span id="company.companyname"><?php echo $rsME->xf('companyname');?></span></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.telephone"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('telephone'),"atelnumber");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.telephone_alt"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('telephone_alt'),"atelnumber");?></span></td>
				</tr>

				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fax"); ?> :</td><td><span><?php echo $rsME->xf('fax');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fax_alt"); ?> :</td><td><span><?php echo $rsME->xf('fax_alt');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.www_address"); ?> :</td><td><span><?php echo $rsME->xf('www_address');?></span></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.address_1"); ?> :</td><td><span><?php echo $rsME->xf('address_1');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.address_2"); ?> :</td><td><span><?php echo $rsME->xf('address_2');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.address_3"); ?> :</td><td><span><?php echo $rsME->xf('address_3');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.town"); ?> :</td><td><span><?php echo $rsME->xf('town');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.county"); ?> :</td><td><span><?php echo $rsME->xf('county');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.postcode"); ?> :</td><td><span><?php echo $rsME->xf('postcode');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.country"); ?> :</td><td><span><?php echo $rsME->xf('country');?></span></td>
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
						<td class="right" valign="right">Open Calls :</td><td><span><?php echo $intIncCount;?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right">&nbsp;</td><td><span>&nbsp;</span></td>
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
				<td class="titleCell" noWrap><h1>Outstanding Calls (<?php echo $intIncCount;?>) - Maximum of 500 displayed </h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/org.calls","","",true);?>
	</div>



	</div>
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
