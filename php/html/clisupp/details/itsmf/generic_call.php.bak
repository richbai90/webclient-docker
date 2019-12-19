
<div id="activepagecontentColumn" >
<!-- left hand col -->

<div id="formArea" style="width:100%;">
	<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
	<div id="swtInfoBody">

	<?php 		//-- if emailing do not show actions
		if($phpprintmode!="1")
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
			<?php 				include('php/call.actions.php');
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
						<td class="titleCell" noWrap><h1><?php echo $callclass;?> Details For <?php echo $rsCall->xf('h_formattedcallref')?></h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	

				<table>
				<tr>
					<td class="right" class="dataLabel" ><?php echo  swdti_getcoldispname("opencall.owner"); ?> :</td><td><span><?php echo $rsCall->xf('owner');?></span></td>
				</tr>
				<tr>
					<td class="right" class="dataLabel" ><?php echo  swdti_getcoldispname("opencall.suppgroup"); ?> :</td><td><span><?php echo $rsCall->xf('suppgroup');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.status"); ?> :</td><td><span><?php echo swstatus_str($rsCall->f('status'));?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.priority"); ?> :</td><td><span><?php echo $rsCall->xf('priority');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.costcenter"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCall->f('costcenter'),"opencall.costcenter");?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.site"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCall->f('site'),"opencall.site");?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.fk_dept_code"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCall->xf('fk_dept_code'),"opencall.fk_dept_code");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top">&nbsp;</td><td></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.loggedby"); ?> :</td><td><span><?php echo $rsCall->xf('loggedby');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.logdatex"); ?> :</td><td><span><?php echo SwFormatDateTimeColumn("opencall.logdatex",$rsCall->xf('logdatex'));?></span></td>
				</tr>

				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.respondbyx"); ?> :</td><td><span><?php echo SwFormatDateTimeColumn("opencall.respondbyx",$rsCall->xf('respondbyx'));?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.fixbyx"); ?> :</td><td><span><?php echo SwFormatDateTimeColumn("opencall.fixbyx",$rsCall->xf('fixbyx'));?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.closedby"); ?> :</td><td><span><?php echo $rsCall->xf('closedby');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.totaltime"); ?> :</td><td><span><?php echo $rsCall->xf('totaltime');?> minutes</span></td>
				</tr>
				</table>					

			</div>

		</td>
		<td width="50%" noWrap valign="top">
			<div class="sectionHead">
				<table class="sectionTitle">
					<tr>
						<td class="titleCell" noWrap><h1>Customer Details</h1></td>
						<td class="endCell"></td>
					</tr>
				</table>	

				<table>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("userdb.companyname"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->f('fk_company_id'),"userdb.fk_company_id",$rsCust->xf('companyname'));?></span></td>
				</tr>
		
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.keysearch"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->f('keysearch'),"userdb.keysearch");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top">Name :</td><td><span id="userdb.fullname"><?php echo $rsCust->xf('firstname') ." ". $rsCust->xf('surname') ;?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.telext"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->xf('telext'),"atelnumber");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.mobiletel"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->xf('mobiletel'),"atelnumber");?></span></td>
				</tr>

				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.email"); ?> :</td><td><span><?php echo $rsCust->xf('email');?></span></td>
				</tr>

				<tr>
					<td class="right" valign="top">&nbsp;</td><td></span></td>
				</tr>

				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.priority"); ?> :</td><td><span><?php echo $rsCust->xf('priority');?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.costcenter"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->f('costcenter'),"userdb.costcenter");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.site"); ?> :</td><td><span><?php echo cmn_fcvformat($rsCust->f('site'),"userdb.site");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("userdb.location"); ?> :</td><td><span><?php echo $rsCust->xf('location');?></span></td>
				</tr>
				</table>
			</div>	
		</td>
	</tr>
	</table>

	</br>

	<!-- equipment details if any -->
	<?php 	if(!$rsEquip->eof)
	{
	?>
		<div class="sectionHead">
			<table class="sectionTitle">
				<tr>
					<td class="titleCell" noWrap><h1>Asset Details</h1></td>
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
					<td class="right"><?php echo  swdti_getcoldispname("equipmnt.manufactur"); ?> :</td><td><span><?php echo cmn_fcvformat($rsEquip->f('manufactur'),"equipmnt.manufactur");?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("equipmnt.model"); ?> :</td><td><span><?php echo $rsEquip->xf('model');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("equipmnt.costcenter"); ?> :</td><td><span><?php echo $rsEquip->xf('costcenter');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("equipmnt.priority"); ?> :</td><td><span><?php echo $rsEquip->xf('priority');?></span></td>
				</tr>
			</table>
		</div>
		
	<?php 	}
	?>


	<!-- profile details -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1><?php echo $callclass;?> Profiling</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	

		<table>
			<tr>
				<td class="right"><?php echo  swdti_getcoldispname("opencall.probcode"); ?> :</td><td><span id="opencall.probcode"><?php echo FormatProblemCode($rsCall->xf('probcode'));?></span></td>
			</tr>
			<tr>
				<td class="right"><?php echo  swdti_getcoldispname("opencall.fixcode"); ?> :</td><td><span id="opencall.fixcode"><?php echo FormatResolutionCode($rsCall->xf('fixcode'));?></span></td>
			</tr>
		</table>
	</div>

	<!-- diary list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1><?php echo $callclass;?> Diary</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo create_calldairy_datatable($rsCall->xf('callref'));?>
	</div>


	</div><!--sw body info-->
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
