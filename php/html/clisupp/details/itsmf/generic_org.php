

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
						<td class="titleCell" noWrap><h1>Organisation Details For <?php echo htmlentities($company_pk_company_id,ENT_QUOTES,'UTF-8');?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
	
				<table>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.pk_company_id"); ?> :</td><td><span><?php echo $rsME->xf('pk_company_id');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.companyname"); ?> :</td><td><span><?php echo $rsME->xf('companyname');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fk_company_id"); ?> :</td><td><span><?php echo $rsME->xf('fk_company_id');?></span></td>
				</tr>

				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fk_company_type"); ?> :</td><td><span><?php echo $rsME->xf('fk_company_type');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fk_industry_type"); ?> :</td><td><span><?php echo $rsME->xf('fk_industry_type');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fk_accountmanager_id"); ?> :</td><td><span><?php echo $rsME->xf('fk_accountmanager_id');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fk_supportauthoriser_id"); ?> :</td><td><span><?php echo $rsME->xf('fk_supportauthoriser_id');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.telephone"); ?> :</td><td><span><?php echo $rsME->xf('telephone');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("company.fax"); ?> :</td><td><span><?php echo $rsME->xf('fax');?></span></td>
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
						<td class="right" valign="right">Owned Assets :</td><td><span><?php echo $intAssetCount;?></span></td>
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
				<td class="titleCell" noWrap><h1>Outstanding Calls (<?php echo $intIncCount;?>)</h1></td>
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
