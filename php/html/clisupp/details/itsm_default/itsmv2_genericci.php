<script>
	function dtable_sort(aTH)
	{
		return false;
	}
</script>
<div id="IE6MinWidth">
	<div id="activepagewrapper">

		<div id="activepagecontentColumn">
		<!-- left hand col -->
			<div style="clear:left">
			<div id="swtPageTop" style="height:1px;"></div>

			<!-- call details -->
			<div id="formArea" style="width:100%;">
				<div id="swtInfoBody">
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1>Details For <?php echo $rsCI->xf('ck_config_item');?></h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>
						<table>
						<tr>
						<td valign=top>
							<table>
							<tr>
								<td class="right">Identifier :</td><td><span id=""><?php echo $rsCI->xf('ck_config_item');?></span></td>
							</tr>
							<tr>
								<td class="right">Configuration Type :</td><td><span id=""><?php echo $rsCI->xf('ck_config_type');?></span></td>
							</tr>
							<tr>
								<td class="right">Description :</td><td><span id=""><?php echo $rsCI->xf('description');?></span></td>
							</tr>
							<tr>
								<td class="right" valign="top">Notes :</td><td><span id=""><?php echo trim100($rsCI->xf('notes'));?></span></td>
							</tr>
							<tr>
								<td class="right">Status Level :</td><td><span id=""><?php echo $rsCI->xf('fk_status_level');?></span></td>
							</tr>
							<tr>
								<td class="right">CMDB Status :</td><td><span id=""><?php echo $rsCI->xf('cmdb_status');?></span></td>
							</tr>
							<tr>
								<td class="right"></td><td><span id="">&nbsp;</span></td>
							</tr>
							</table>
						</td>
						<td valign=top>
							<table>
							<tr>
								<td class="right">Impact Level :</td><td><span id=""><?php echo $rsCI->xf('fk_impact_level');?></span></td>
							</tr>
							<tr>
								<td class="right">Urgency Level :</td><td><span id=""><?php echo $rsCI->xf('fk_urgency_level');?></span></td>
							</tr>
							<tr>
								<td class="right">Service Level:</td><td><span id=""><?php echo $rsCI->xf('fk_sla');?></span></td>
							</tr>
							<tr>
								<td class="right">Support Group :</td><td><span id=""><?php echo $rsCI->xf('ci_support_group');?></span></td>
							</tr>
							<tr>
								<td class="right">Support Analyst :</td><td><span id=""><?php echo $rsCI->xf('ci_support_analyst');?></span></td>
							</tr>
							</table>
						</td>
						</tr>
						</table>

<!--				</div> -- id="swtInfoBody"->				
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
			</div> <!-- id="formArea"->
			<br>
			</div>

			<!-- parent cis ->
			<div style="clear:left">
			<div id="swtPageTop" style="height:1px;"></div>
			<div id="formArea" style="width:100%;">
				<div id="swtInfoBody">-->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1>Parent Associations</h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>
						<?php echo create_cicidatatable($rsCI->xf('pk_auto_id'),false,"");?>

		<!--		</div> <!-- id="swtInfoBody"->				
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
			</div> <!-- id="formArea"->
			<br>	
			</div>


			<!-- parent cis ->
			<div style="clear:left">
			<div id="swtPageTop" style="height:1px;"></div>
			<div id="formArea" style="width:100%;">
				<div id="swtInfoBody">-->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell" noWrap><h1>Child Associations</h1></td>
									<td class="endCell"></td>
								</tr>
							</table>	
						</div>
						<?php echo create_cicidatatable($rsCI->xf('pk_auto_id'),true,"");?>

			<!--	</div> <!-- id="swtInfoBody"->				
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
			</div> <!-- id="formArea"->
			<br>			
			</div>

			<!-- parent cis -->
			<?php 				if($citype!="ME->CUSTOMER")
				{
			?>
			<!--	<div style="clear:left">
				<div id="swtPageTop" style="height:1px;"></div>
				<div id="formArea" style="width:100%;">
					<div id="swtInfoBody">-->
							<div class="sectionHead">
								<table class="sectionTitle">
									<tr>
										<td class="titleCell" noWrap><h1>Customers that use <?php echo $rsCI->xf('description');?></h1></td>
										<td class="endCell"></td>
									</tr>
								</table>	
							</div>
							<?php echo create_cimedatatable($rsCI->xf('pk_auto_id'),"CUSTOMER","");?>

			<?php 
				}
			?>

					</div> <!-- id="swtInfoBody"-->				
					<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
				</div> <!-- id="formArea"-->
				<br>		
				</div>
		<!-- lefthand content -->
		</div><!--conentcolumn-->

		
		

	</div> <!-- id="wrapper"-->
</div><!--id="IE6MinWidth-->
</body>
</html>
