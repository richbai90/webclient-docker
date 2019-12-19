

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
				<?php 					include('php/manufact.actions.php');
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
						<td class="titleCell" noWrap><h1>Manufacturer Details For <?php echo htmlentities($manufact_name,ENT_QUOTES,'UTF-8');?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
				<table>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.comp_name"); ?> :</td><td><span><?php echo $rsME->xf('comp_name');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right">Address :</td><td><span><?php echo nl2br($rsME->xf('address1'));?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right">&nbsp;</td><td><span><?php echo nl2br($rsME->xf('address2'));?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right">&nbsp;</td><td><span><?php echo nl2br($rsME->xf('address3'));?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.postcode"); ?> :</td><td><span><?php echo $rsME->xf('postcode');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.country"); ?> :</td><td><span><?php echo $rsME->xf('country');?></span></td>
					</tr>

					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.contact"); ?> :</td><td><span><?php echo $rsME->xf('contact');?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.telephone"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('telephone'),"atelnumber");?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.altphone"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('telephone'),"atelnumber");?></span></td>
					</tr>
					<tr>
						<td class="right" valign="right"><?php echo  swdti_getcoldispname("manufact.fax"); ?> :</td><td><span><?php echo $rsME->xf('fax');?></span></td>
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
						<td class="right" valign="right">Asset Count :</td><td><span><?php echo $intAssetCount;?></span></td>
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
		<?php echo get_tablehtml_fromxmlfile("activepages/manufact.calls","","",true);?>
	</div>


	</div>
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
