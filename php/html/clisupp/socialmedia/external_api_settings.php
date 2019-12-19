<?php 	include('itsm_default/xmlmc/common.php');	

	$dbtable = "socmed_tp_api_keys";
	$dbkeycol = "api_name";
	$dbkeyvalue = "bit.ly";
	$_SESSION['config_ac_table'] =$dbtable;
	$_SESSION['customerpkcolumn'] =$dbkeycol;
	$_SESSION['customerpkvalue'] =$dbkeyvalue;

	$swDATA = new CSwDbConnection;
	if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
	{
		echo "Failed to create connection to (".swdsn().")";
		exit;
	}

	$strSQL = "select * from ".$dbtable." where ".$dbkeycol." = '".$dbkeyvalue."'";
	$rsAPI = $swDATA->Query($strSQL,true);
	if(!$rsAPI->eof)
	{
		$api_name = $rsAPI->f('api_name');
		$api_login = $rsAPI->f('api_login');
		$api_key = $rsAPI->f('api_key');
		$api_url = $rsAPI->f('api_url');
		$api_format = $rsAPI->f('api_format');
	}
	else
	{
		$api_name = "bit.ly";
		$api_login = "";
		$api_key = "";
		$api_url = "http://api.bit.ly/v3/";
		$api_format = "json";

		//-- Create a default entry
		$strSQL = "insert into ".$dbtable." (api_name, api_url, api_format) values ('".pfs($api_name)."','".pfs($api_url)."','".pfs($api_format)."')";
		$swDATA->Query($strSQL);
	}
?>

<!-- header -->
<div class="boxWrapper" style="margin:0px auto 10px auto; width:600px" ><img src="img/structure/box_header_left.gif" width="6" height="11" alt="" border="0" /><div class="boxMiddle">
		<div class="boxContent">
			<div class="spacer">&nbsp;</div>
				<h1>API Keys</h1>
				<p>Supportworks uses the bit.ly API to shorten URLs for use in tweets.  You can use the link below to generate your login and API key and the details can be added/updated below.
				</p>
			<div class="spacer">&nbsp;</div>
		</div>	<!-- end of box content -->
	</div>
	<div class="boxFooter"><img src="img/structure/box_footer_left.gif" /></div>
</div>

<!-- body -->
<div class="boxWrapper" style="margin:0px auto 10px auto; width:600px"><img src="img/structure/box_header_left.gif" width="6" height="11" alt="" border="0" /><div class="boxMiddle">
		<div class="boxContent">
		<div class="spacer">&nbsp;</div>

	<table width="100%">
		<tr>
			<td>
			<div id="page_holder">
			  <form id="form_updatetable" action="update.api.php" accept-charset="UTF-8">
				  <p><b>Bit.ly URL Shortener API Settings</b></br><br/>
				  Visit <a href="http://bit.ly/a/your_api_key" target="_blank">http://bit.ly/a/your_api_key</a> to sign up and generate your login and key<br/><br/>
				  <table>
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
				  </table>
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
				<input type="button" id="btn_submit" onclick="submit_httpform('form_updatetable',false,'strupdmsg','profile_updok()');" value="Update API Settings"  />
			</td>
		</tr>
	</table>


		<div class="spacer">&nbsp;</div>
		</div><!-- end of box content -->
	</div>
	<div class="boxFooter"><img src="img/structure/box_footer_left.gif" /></div>
</div>