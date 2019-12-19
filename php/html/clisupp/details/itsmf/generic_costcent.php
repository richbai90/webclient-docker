

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
						<?php 							include('php/costcent.actions.php');
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
						<td class="titleCell" noWrap><h1><?php echo swdti_getcoldispname("costcent.costcenter");?> Details For <?php echo $rsME->xf('costcenter');?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	

				<table>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("costcent.costcenter"); ?> :</td><td><span><?php echo $rsME->xf('costcenter');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="top"><?php echo  swdti_getcoldispname("costcent.companyname"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('fk_company_id'),"userdb.fk_company_id",$rsME->xf('companyname'));?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("costcent.department"); ?> :</td><td><span><?php echo nl2br($rsME->xf('department'));?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("costcent.rate"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('rate'),"pence");?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("costcent.priority"); ?> :</td><td><span><?php echo $rsME->xf('priority');?></span></td>
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
						<td class="right" valign="right">Assigned Assets :</td><td><span><?php echo $intAssetCount;?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right">Customer Count :</td><td><span><?php echo $intCustCount;?></span></td>
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
				<td class="titleCell" noWrap><h1>Outstanding Incidents (<?php echo $intIncCount;?>)</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/costcent.calls","","",true);?>
	</div>

	</div>
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
