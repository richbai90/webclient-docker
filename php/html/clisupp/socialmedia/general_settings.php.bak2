<?php 	include('itsm_default/xmlmc/common.php');	

	$dbtable = "socmed_settings";
	$dbkeycol = "pk_id";
	$dbkeyvalue = "1";
	$_SESSION['config_ac_table'] =$dbtable;
	$_SESSION['customerpkcolumn'] =$dbkeycol;
	$_SESSION['customerpkvalue'] =$dbkeyvalue;
	
	$swDATA = new CSwDbConnection;
	if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
	{
		echo "Failed to create connection to (".swdsn().")";
		exit;
	}

	$strSQL = "select * from ".$dbtable;
	$rsSettings = $swDATA->Query($strSQL,true);
	if(!$rsSettings->eof)
	{
		$del_msg_days = $rsSettings->f('del_msg_days');
	}
	else
	{
		//-- Create a default entry
		$strSQL = "insert into ".$dbtable." (pk_id, del_msg_days) values (1,0)";
		$swDATA->Query($strSQL);
	}
?>

<!-- header -->


<div class="boxWrapper" style="margin:0px auto 10px auto; width:600px" ><img src="img/structure/box_header_left.gif" width="6" height="11" alt="" border="0" /><div class="boxMiddle">
		<div class="boxContent">
			<div class="spacer">&nbsp;</div>
				<h1>Automated Request Action Notfications</h1>
				<p><a href="Javascript:showGroupSettings('<?php echo gv('sessid');?>');">Click here to set notification sending options for each support group</a></p>
			<div class="spacer">&nbsp;</div>
		</div>	<!-- end of box content -->
	</div>
	<div class="boxFooter"><img src="img/structure/box_footer_left.gif" /></div>
</div>

<!-- body -->
<div class="boxWrapper" style="margin:0px auto 10px auto; width:600px"><img src="img/structure/box_header_left.gif" width="6" height="11" alt="" border="0" /><div class="boxMiddle">
		<div class="boxContent">
		<div class="spacer">&nbsp;</div>
		<h1>Message Storage Settings</h1>
	<table width="100%">
		<tr>
			<td>
			<div id="page_holder">
			  <form id="form_updatetable" action="update.gensettings.php" accept-charset="UTF-8">
				
				  Permanently remove deleted messages from the Supportworks Server after <input type="text" id="<?php echo $dbtable;?>.del_msg_days" value="<?php echo $del_msg_days;?>"> days.<br/><br/>
				  

				  <!--<table>
					<tr>
						<th style='text-align:right;'>Name:</th><td><input readonly="readonly" type="text" id="<?php echo $dbtable;?>.api_name" value="<?php echo $api_name;?>"></td>
					</tr>
					<tr>
						<th style='text-align:right;'>Login:</th><td><input type="text" id="<?php echo $dbtable;?>.api_login" value="<?php echo $api_login;?>"></td>
					</tr>
					<tr>
						<th style='text-align:right;'>Key:</th><td><input type="text" id="<?php echo $dbtable;?>.api_key" value="<?php echo $api_key;?>"></td>
					</tr>
					<tr>
						<th style='text-align:right;'>URL:</th><td><input type="text" id="<?php echo $dbtable;?>.api_url" value="<?php echo $api_url;?>"></td>
					</tr>
					<tr>
						<th style='text-align:right;'>Format:</th><td><input type="text" id="<?php echo $dbtable;?>.api_format" value="<?php echo $api_format;?>"></td>
					</tr>
				  </table>-->
				  </p>
				<input type="hidden" id="dbtable" value="<?php echo $dbtable;?>">
				<input type="hidden" id="dbkeycol" value="<?php echo $dbkeycol?>">
				<input type="hidden" id="dbkeyvalue" value="<?php echo $dbkeyvalue;?>">
				  
			  </form>
				<center><p id='strupdmsg'></p></center>
			</div>
			</td>
		</tr>
	</table>

	<table width="100%">
		<tr>
			<td align="right">
				<input type="button" id="btn_submit" onclick="submit_httpform('form_updatetable',false,'strupdmsg','profile_updok()');" value="Update Settings"  />
			</td>
		</tr>
	</table>


		<div class="spacer">&nbsp;</div>
		</div><!-- end of box content -->
	</div>
	<div class="boxFooter"><img src="img/structure/box_footer_left.gif" /></div>
</div>