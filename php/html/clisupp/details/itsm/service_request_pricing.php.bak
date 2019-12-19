<?php 	//-- if cust sla is not empty load SLA record
	if($rsCust->xf("sld")!="")
	{
		$selcust = "select * from request_comp where fk_callref = " . pfs($rsCall->xf("callref"));
		$rsReqComps =$swconn->Query($selcust,true);
		//$rsCust = $swconn->CreateRecordSet();
	}
	if(isset($rsReqComps)==false)$rsReqComps = new odbcRecordsetDummy;

?>
	<div class="sectionHead">
			<table class="sectionTitle">
				<tr>
					<td class="titleCell" noWrap><h1><?php echo $callclass;?> Prices</h1></td>
					<td class="endCell"></td>
				</tr>
			</table>	
	<table>
	<tr>
		<td width="50%" noWrap valign="top">
			<table>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.request_sla_cost"); ?> :</td><td><span id="opencall.fixcode"><?php echo $rsCall->xf('request_sla_cost');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.request_comp_cost"); ?> :</td><td><span id="opencall.fixcode"><?php echo $rsCall->xf('request_comp_cost');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.request_cost"); ?> :</td><td><span id="opencall.fixcode"><?php echo $rsCall->xf('request_cost');?></span></td>
				</tr>
			</table>
		</td>
		<td width="50%" noWrap valign="top">
			<table>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.request_sla_price"); ?> :</td><td><span id="opencall.fixcode"><?php echo $rsCall->xf('request_sla_price');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.request_comp_price"); ?> :</td><td><span id="opencall.fixcode"><?php echo $rsCall->xf('request_comp_price');?></span></td>
				</tr>
				<tr>
					<td class="right"><?php echo  swdti_getcoldispname("opencall.request_price"); ?> :</td><td><span id="opencall.probcode"><?php echo $rsCall->xf('request_price');?></span></td>
				</tr>
			</table>
		</tr>
	</table>
		</div>
		<div class="sectionHead">
			<table class="sectionTitle">
				<tr>
					<td class="titleCell" noWrap><h1>Component Prices</h1></td>
					<td class="endCell"></td>
				</tr>
			</table>	
		</div>
		<?php 				$strDefaultComps = "";
				$strUpgradeComps = "";
				$strOptionalComps = "";
				$oc_service = $rsCall->xf("itsm_fk_service");
				$strSQL = "SELECT request_comp.description, qty, comp_price, flg_isoptional
				FROM sc_rels, request_comp
				WHERE request_comp.fk_callref = ".$rsCall->xf("callref")."
				AND sc_rels.service_id = request_comp.name
				AND fk_service = ".$oc_service."
				ORDER BY flg_isoptional DESC, description ASC";
				$connSWDATA = new CSwDbConnection;
				$connSWDATA->SwDataConnect();
				$rsStage = $connSWDATA->query($strSQL,true);
				while(!$rsStage->eof)
				{
					$strDescription = $rsStage->xf("description");
					$strQty = $rsStage->xf("qty");
					$strPrice = $rsStage->xf("comp_price");
					$strOptional = $rsStage->xf("flg_isoptional");

					//INCLUDED DEFAULTS
					if($strOptional==1)
						$strDefaultComps .= $strQty."x'".$strDescription."' is a standard component<br>";
					else
						$strOptionalComps .= $strQty."x'".$strDescription."' is optional at a price of ".$strPrice."<br>";
					$rsStage->movenext();
				}
				$strSQL = "select a.description as override,a.units as overqty,b.*,request_comp.qty,request_comp.comp_price from sc_rels a, sc_rels b,request_comp where a.fk_service=".$oc_service." and a.pk_auto_id=b.fk_service_rels and b.description=request_comp.description and fk_callref=".$rsCall->xf("callref");				
				$rsStage = $connSWDATA->query($strSQL,true);
				while(!$rsStage->eof)
				{
					$strDescription = $rsStage->xf("description");
					$strQty = $rsStage->xf("qty");
					$strPrice = $rsStage->xf("comp_price");
					$strOrig = $rsStage->xf("override");
					$strOrigQty = $rsStage->xf("overqty");
					$strDiff = $rsStage->xf("price_diff");
					$strUpgradeComps .= "Replacing ".$strOrigQty."x'".$strOrig."' with ".$strQty."x'".$strDescription."' at a price of ".$strDiff."<br>";
					$rsStage->movenext();
				}
				$strComponentPriceHTML = "";
				if($strDefaultComps!="")
				{
					$strComponentPriceHTML .= $strDefaultComps;
				}
				if($strUpgradeComps!="")
				{
					$strComponentPriceHTML .= $strUpgradeComps;
				}
				if($strOptionalComps!="")
				{
					$strComponentPriceHTML .= $strOptionalComps;
				}
				echo $strComponentPriceHTML;
		?>
	<table>
		<?php 		//while(!$rsReqComps->eof)
		while(false)
		{
		?>
			<tr>
				<td class="right"><?php echo  swdti_getcoldispname("request_comp.comp_price"); ?> :</td><td><span id="opencall.fixcode"><?php echo $rsReqComps->xf('comp_price');?></span></td>
			</tr>
		<?php 		$rsReqComps->movenext();
		}
		?>
	</table>



	</br>
