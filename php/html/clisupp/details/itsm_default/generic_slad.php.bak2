

<div id="activepagecontentColumn" >
<!-- left hand col -->

<div id="formArea" style="width:100%;">
	<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
	<div id="swtInfoBody">


	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Service Level Agreement Details For '<?php echo $rsME->xf('slad_id');?>'</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
	<table width="100%" cellpadding="0" cellspacing="2">
	<tr>
		<td width="50%" noWrap valign="top">
			<!-- call details -->
				<table>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.pk_slad_id"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('slad_id'),"itsmsp_slad.itsmsp_slad");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.type"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('type'),"itsmsp_slad.type");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.fk_ssla"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('fk_ssla'),"itsmsp_slad.fk_ssla");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.chargeto_cc"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('chargeto_cc'),"itsmsp_slad.chargeto_cc");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.fk_aid"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('fk_aid'),"itsmsp_slad.fk_aid");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.fk_keysearch"); ?> :</td><td><span><?php echo cmn_fcvformat($rsME->xf('fk_keysearch'),"userdb.keysearch");?></span></td>
				</tr>
				</table>
		</td>
		<td width="50%" noWrap valign="top">
			<!-- call details -->
				<table>
 				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.createdonx"); ?> :</td><td><span><?php echo common_convert_field_value("analystdate",$rsME->xf('createdonx'),"itsmsp_slad.createdonx");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.expiresonx"); ?> :</td><td><span><?php echo common_convert_field_value("analystdate",$rsME->xf('expiresonx'),"itsmsp_slad.expiresonx");?></span></td>
				</tr>
				<tr>
					<td class="right" valign="top"><?php echo  swdti_getcoldispname("itsmsp_slad.nextreviewx"); ?> :</td><td><span><?php echo common_convert_field_value("analystdate",$rsME->xf('nextreviewx'),"itsmsp_slad.nextreviewx");?></span></td>
				</tr>
				</table>
		</td>
	</tr>
	</table>
	</div>


	<!-- outstanding call list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Description</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<table>
			<tr>
				<td class="right" valign="right"><?php echo $rsME->xf('descriptive');?></td>
			</tr>
		</table>
	</div>
	
	<!-- outstanding call list -->
	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Operational Level Agreement(s)</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
		<?php echo get_tablehtml_fromxmlfile("activepages/oladefs","","",true);?>
	</div>

	<div class="sectionHead">
		<table class="sectionTitle">
			<tr>
				<td class="titleCell" noWrap><h1>Associated Priorities</h1></td>
				<td class="endCell"></td>
			</tr>
		</table>	
	</div>

<?php 	while(!$rsPriorities->eof)
	{
		$selectme = "select * from system_sla where name = '" . pfs($rsPriorities->f("fk_priority")) . "'";
		$swcache->Query($selectme);
		$rsTemp = $swcache->CreateRecordSet();
		if(isset($rsTemp)==false)$rsTemp = new odbcRecordsetDummy;

		$selectme = "select * from system_sla_excludes where slaid = " . pfs($rsTemp->f("slaid"));
		$swcache->Query($selectme);
		$rsExcludes = $swcache->CreateRecordSet();
		if(isset($rsExcludes)==false)$rsExcludes = new odbcRecordsetDummy;

?>
	<table width="100%" cellpadding="0" cellspacing="2">
	<tr>
		<td width="3%" noWrap valign="top">
		</td>
		<td width="90%" noWrap valign="top">
			<table width="97%" cellpadding="0" cellspacing="2">
			<tr>
				<td width="75%" noWrap valign="top">
				<div class="sectionHead">
					<table class="sectionTitle">
						<tr>
							<td class="titleCell" noWrap><h1>Priority Details - <?php echo $rsPriorities->xf("fk_priority");?><?php if($rsPriorities->xf("fk_priority")==$rsME->xf('fk_ssla')) echo " (DEFAULT)";?></h1></td>
							<td class="endCell"></td>
						</tr>
					</table>	

					<table>
						<tr>
							<td class="right" valign="top">Name :</td><td><span><?php echo $rsTemp->xf('name');?> </span></td>
						</tr>
						<tr>
							<td class="right" valign="top">Timezone :</td><td><span><?php echo $rsTemp->xf('timezone');?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top">Response Time :</td><td><span><?php echo common_convert_field_value("hhmmss",$rsTemp->xf('resptime'),"");?></span></td>
						</tr>
						<tr>
							<td class="right" valign="top">Fix Time :</td><td><span><?php echo common_convert_field_value("hhmmss",$rsTemp->xf('fixtime'),"");?></span></td>
						</tr>
						</table>
					</div>
				</td>
				<td width="25%" noWrap valign="top">
					<!-- call details -->
					<div class="sectionHead">
						<table class="sectionTitle">
							<tr>
								<td class="titleCell" noWrap><h1>Support Hours</h1></td>
								<td class="endCell"></td>
							</tr>
						</table>	
			
						<table>
							<tr>
							<td width="10%" class="left_color" valign="top">Sunday :</td><td><span><?php echo get_time($rsTemp->xf('sun_start'),$rsTemp->xf('sun_end'));?></span></td>
							</tr>
							<tr>
							<td class="left_color" valign="top">Monday :</td><td><span><?php echo get_time($rsTemp->xf('mon_start'),$rsTemp->xf('mon_end'));?></span></td>
							</tr>
							<tr>
							<td class="left_color" valign="top">Tuesday :</td><td><span><?php echo get_time($rsTemp->xf('tue_start'),$rsTemp->xf('tue_end'));?></span></td>
							</tr>
							<tr>
							<td class="left_color" valign="top">Wednesday :</td><td><span><?php echo get_time($rsTemp->xf('wed_start'),$rsTemp->xf('wed_end'));?></span></td>
							</tr>
							<tr>
							<td class="left_color" valign="top">Thursday :</td><td><span><?php echo get_time($rsTemp->xf('thu_start'),$rsTemp->xf('thu_end'));?></span></td>
							</tr>
							<tr>
							<td class="left_color" valign="top">Friday :</td><td><span><?php echo get_time($rsTemp->xf('fri_start'),$rsTemp->xf('fri_end'));?></span></td>
							</tr>
							<tr>
							<td class="left_color" valign="top">Saturday :</td><td><span><?php echo get_time($rsTemp->xf('sat_start'),$rsTemp->xf('sat_end'));?></span></td>
							</tr>
						</table>
					</div>
				</td>
			</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td width="3%" noWrap valign="top">
		</td>
		<td width="90%" noWrap valign="top">
			<table width="97%" cellpadding="0" cellspacing="2">
				<tr>
					<td width="5%" noWrap valign="top">
					</td>
					<td width="100%" noWrap valign="top">
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1>Holiday Exclusions</h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	

							<table>
<?php 								while(!$rsExcludes->eof)
								{
?>
									<tr>
										<td class="right" valign="top">Name :</td><td valign="top"><span><?php echo $rsExcludes->xf('name');?> </span></td>
										<td class="right" valign="top">Date :</td><td valign="top"><span><?php echo $rsExcludes->xf('day').get_date_dayformat($rsExcludes->xf('day'));?>  of <?php echo $arrMonth[$rsExcludes->xf('month')];?> </span></td>
										<td class="right" valign="top">Year :</td><td valign="top"><span><?php echo $rsExcludes->xf('year')=="1970"?"Yearly":$rsExcludes->xf('year');?> </span></td>
									</tr>
<?php 									$rsExcludes->movenext();
								}
?>
							</table>
						</div>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	</table>

<?php 		$rsPriorities->movenext();
	}
?>
	</div>
	<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif"  id="swtImgBottomLeft" /></div>
</div><!-- form area -->


</div> <!-- activepagecontentColumn -->


</body>
</html>
