

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
						<?php 							include('php/asset.actions.php');
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
						<td class="titleCell" noWrap><h1>Asset Details For <?php echo htmlentities($asset_equipid,ENT_QUOTES,'UTF-8');?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
				<table>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.equipid"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('equipid'),"equipmnt.equipid");?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.serialno"); ?> :</td><td><span><?php echo $rsEquip->xf('serialno');?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.asset_no"); ?> :</td><td><span><?php echo $rsEquip->xf('asset_no');?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.manufactur"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('manufactur'),"equipmnt.manufactur");?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.model"); ?> :</td><td><span><?php echo $rsEquip->xf('model');?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.supplier"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('supplier'),"equipmnt.supplier");?></span></td>
					</tr>


					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.priority"); ?> :</td><td><span><?php echo $rsEquip->xf('priority');?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.costcenter"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('costcenter'),"equipmnt.costcenter");?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.companyname"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('fk_company_id'),"equipmnt.fk_company_id",$rsEquip->xf('companyname'));?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.site"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('site'),"equipmnt.site");?></span></td>
					</tr>
					<tr>
						<td class="right"><?php echo  swdti_getcoldispname("equipmnt.location"); ?> :</td><td><span id="equipmnt.location"><?php echo $rsEquip->xf('location');?></span></td>
					</tr>
				</table>
			</DIV>

		</td>
		<td width="50%" noWrap valign="top">
			<div class="sectionHead">
					<table class="sectionTitle">
						<tr>
							<td class="titleCell" noWrap><h1>Owner Details</h1></td>
							<td class="endCell"></td>
						</tr>
					</table>	

				<table>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.keysearch"); ?> :</td><td><span id=""><?php echo cmn_fcvformat($rsCust->f('keysearch'),"userdb.keysearch");?></span></td>
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
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.priority"); ?> :</td><td><span id="userdb.priority"><?php echo $rsCust->xf('priority');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.companyname"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->f('fk_company_id'),"userdb.fk_company_id",$rsCust->xf('companyname'));?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.costcenter"); ?> :</td><td><span id="userdb.costcenter"><?php echo cmn_fcvformat($rsCust->f('costcenter'),"userdb.costcenter");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.site"); ?> :</td><td><span id="userdb.site"><?php echo cmn_fcvformat($rsCust->f('site'),"userdb.site");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.location"); ?> :</td><td><span id="userdb.location"><?php echo $rsCust->xf('location');?></span></td>
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
		<?php echo get_tablehtml_fromxmlfile("activepages/asset.calls","","",true);?>
	</div>


	</div>
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
