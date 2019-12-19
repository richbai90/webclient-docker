<?php
	

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');	

	$_SESSION['profileid'] = gv('strProfileID');
		
?>


	<table border=0>
		<tr>
			<td>
			
			  <form id="form_updatetable<?php echo gv('strProfileID');?>" action="update.profile_analysts.php" accept-charset="UTF-8">
				<input type="checkbox" id="selectall" name="selectall" value="true" onclick="Javascript:selectAllAnalysts('form_updatetable<?php echo gv('strProfileID');?>','selectall');bFormChanged=true;">[ Select All Analysts ]<br/>
<?php
			$swSystemDB = new CSwDbConnection;
			if(!$swSystemDB->Connect("sw_systemdb", swcuid(), swcpwd()))
			{
				echo "Failed to create connection to (Supportworks Cache)";
				exit;
			}
	
			$swDATA = new CSwDbConnection;
			if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
			{
				echo "Failed to create connection to (".swdsn().")";
				exit;
			}

			$kbNotifs = array();
			$strSelect = "select fk_analyst_id from socmed_analysts where fk_acc_id='".PrepareForSQL(gv('strProfileID'))."'";
			$rsNotifs = $swDATA->Query($strSelect,true);
			while(!$rsNotifs->eof)
			{
				$cat = strtolower($rsNotifs->f('fk_analyst_id'));
				$kbNotifs[$cat] = $cat;
				$_SESSION["kb_".$_SESSION['profileid']."_".$cat] = "1";
				$rsNotifs->movenext();
			}


			$strSelect = "select swanalysts.analystid,name from swanalysts join swanalysts_groups on swanalysts.analystid=swanalysts_groups.analystid where class=1";
			if(gv('strGroupID')!="")
				$strSelect .= " and swanalysts_groups.groupid='".pfs(gv('strGroupID'))."'";
			$strSelect .= " order by swanalysts.analystid asc";
			$rsComp = $swSystemDB->Query($strSelect,true);
			while(!$rsComp->eof)
			{
				$strChecked = "";
				$thisCat = strtolower($rsComp->f('analystid'));
				$isSubscribed = in_array($thisCat,$kbNotifs);
				if($isSubscribed)
					$strChecked = "checked=yes";

				if(!isset($_SESSION["kb_".$_SESSION['profileid']."_".$thisCat]))$_SESSION["kb_".$_SESSION['profileid']."_".$thisCat] = "0";
				
				echo "<input type=\"checkbox\" class=\"checkbox\" value=\"".$rsComp->f('name')."\" id=\"kb_".$_SESSION['profileid']."_".strtolower($rsComp->f('analystid'))."\" name=\"in_closecall\" ".$strChecked." onchange=\"Javascript:bFormChanged=true;\"><label for=\"".$rsComp->f('name')."\">".$rsComp->f('name')."</label><br>";
				$rsComp->movenext();
			}

?>		

				<input type="hidden" value="blank" id="holder" />
				<input type="hidden" value="<?php echo gv('strProfileID');?>" id="profileid" name="profileid" />
				<input type="hidden" value="<?php echo gv('strGroupID');?>" id="groupid" name="groupid" />
				
			  </form>
				<center><p id='strupdmsg<?php echo gv('strProfileID');?>'></p></center>
			
			</td>
		</tr>
	</table>

	<table width="100%">
		<tr>
			<td align="right">
				<input type="button" id="btn_submit" onclick="submit_httpform('form_updatetable<?php echo gv('strProfileID');?>',false,'strupdmsg<?php echo gv('strProfileID');?>','profiles_updok()');bFormChanged=false;" value="Update Settings"  />
			</td>
		</tr>
	</table>