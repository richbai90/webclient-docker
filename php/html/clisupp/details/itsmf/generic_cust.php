
<div id="activepagecontentColumn" >
<!-- left hand col -->

<div id="formArea" >
	
	<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>

	<div id="swtInfoBody">

	<?php 		//-- if not emailing and not printing
		if(($emailmode!="1")&&($phpprintmode!="1"))
		{
	?>

						<div class="sectionHead" >
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
						<td class="titleCell" noWrap><h1>Customer Details For <?php echo htmlentities($userdb_keysearch,ENT_QUOTES,'UTF-8');?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	
	
				<table>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.companyname"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('fk_company_id'),"userdb.fk_company_id",$rsME->xf('companyname'));?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.keysearch"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('keysearch'),"userdb.keysearch");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top">Name :</td><td><span id="userdb.fullname"><?php echo $rsME->xf('firstname') ." ". $rsME->xf('surname') ;?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.telext"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('telext'),"atelnumber");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.mobiletel"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('mobiletel'),"atelnumber");?></span></td>
				</tr>

				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.email"); ?> :</td><td><span><?php echo $rsME->xf('email');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.priority"); ?> :</td><td><span><?php echo $rsME->xf('priority');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.costcenter"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('costcenter'),"userdb.costcenter");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.site"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->f('site'),"userdb.site");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.fk_dept_code"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('fk_dept_code'),"userdb.fk_dept_code");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.location"); ?> :</td><td><span><?php echo $rsME->xf('location');?></span></td>
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
				<td class="titleCell" noWrap><h1>Customer Assets(<?php echo $intAssetCount;?>)</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/cust.assets","","",true);?>
	</div>
	

	<!-- outstanding call list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Outstanding Calls (<?php echo $intIncCount;?>)</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/customer.calls","","",true);?>
	</div>



	</div>
	
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
