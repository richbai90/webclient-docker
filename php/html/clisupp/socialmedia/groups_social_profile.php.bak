<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');	
	$_SESSION['profileid'] = gv('strProfileID');
?>
	<table border=0>
		<tr>
			<td>Default Account for group <b><?php echo gv('strGroupID');?></b></td>
		</tr>
		<tr>
			<td>
			
			  <form id="form_updatetable<?php echo gv('strGroupID');?>" action="update.group_profiles.php" accept-charset="UTF-8">
				
<?php
			$swDATA = new CSwDbConnection;
			if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
			{
				echo "Failed to create connection to (".swdsn().")";
				exit;
			}

			$dflt_send_act="";
			$strSelect = "select dflt_send_act from socmed_groups where fk_suppgroup='".PrepareForSQL(gv('strGroupID'))."'";
			$rsNotifs = $swDATA->Query($strSelect,true);
			if(!$rsNotifs->eof)
			{
				$dflt_send_act = strtolower($rsNotifs->f('dflt_send_act'));
			}


			
			?>
			<select id="defaultsendact" name="defaultsendact">

				<option value="" selected></option>
			<?php
			$strSelect = "select * from socmed_twitter_acts";
			$strSelect .= " order by socmed_twitter_acts.sm_acc_name asc";
			$rsComp = $swDATA->Query($strSelect,true);
			while(!$rsComp->eof)
			{
				$option= "<option value=\"".strtolower($rsComp->f('sm_acc_name'))."\"";
				if($dflt_send_act==strtolower($rsComp->f('sm_acc_name')))
				{
					$option.= " selected";
				}
				
				$option.= ">".strtolower($rsComp->f('sm_acc_name'))."</option>";
				echo $option;
				$rsComp->movenext();
			}
		
?>		
			</select>
				<input type="hidden" value="blank" id="holder" />
				<input type="hidden" value="<?php echo gv('strProfileID');?>" id="profileid" name="profileid" />
				<input type="hidden" value="<?php echo gv('strGroupID');?>" id="groupid" name="groupid" />
				
			  </form>
				<center><p id='strupdmsg<?php echo gv('strGroupID');?>'></p></center>
			
			</td>
		</tr>
	</table>

	<table width="100%">
		<tr>
			<td align="right">
				<input type="button" id="btn_submit" onclick="submit_httpform('form_updatetable<?php echo gv('strGroupID');?>',false,'strupdmsg<?php echo gv('strGroupID');?>','profiles_updok()');bFormChanged=false;" value="Update Settings"  />
			</td>
		</tr>
	</table>