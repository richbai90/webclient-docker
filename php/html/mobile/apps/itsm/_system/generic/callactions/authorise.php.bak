<?php 	$prefix = 'mpauth_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	if($_SESSION['callActionErrorMsg']!="")
		echo "<span class='errormsg'>"._html_encode($_SESSION['callActionErrorMsg'])."</span>";
	$retRS = new _swm_rs();
	$strSQL = _swm_parse_string("select * from bpm_oc_auth,bpm_stage where bpm_oc_auth.fk_auth_id='[:_swm_sqlprep_aid]' and bpm_oc_auth.authortype='Analyst' and bpm_oc_auth.fk_stage_id = bpm_stage.pk_stage_id and bpm_oc_auth.fk_callref =".$_POST['_callref']);

	$retRS->query("swdata",$strSQL,true,null);

	if(!$retRS->eof())
	{

	}
	$strDisabled="";
	$authorise = $retRS->_columns['flg_status']->value;
	if(isset($_POST['authorise']))
		$authorise = $_POST['authorise'];
	switch($authorise)
	{
		case 0:
			$strDisabled="";
			break;
		case 1:
			$strDisabled=" disabled";
			break;
		case 2:
			$strDisabled=" disabled";
			break;

	}



?>
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Title</span></span></div>
<?php echo _html_encode($retRS->_columns['title']->value);?>
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Description</span></span></div>
<?php echo nl2br(_html_encode($retRS->_columns['description']->value));?>
<form id='frmCallactionLoader' target="_self" method='post' action='index.php' >
<table width="100%">
	<tr height="30px" >
		<td align="right">
			<span>
				Name :
			</span>
		</td>
		<td>
			<span>
				<?php echo nl2br(_html_encode($retRS->_columns['authorname']->value));?>
			</span>
		</td>
		<td align="right">
			<span>
				Status :
			</span>
		</td>
		<td>
	<!--
					<input type="radio" id="auth_0"  name="authorise" class="radio" value="0" <?php echo $strOpt0Checked;?>><label for="auth_0">Un-decided</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
					<input type="radio" id="auth_1"  name="authorise" class="radio" value="1" <?php echo $strOpt1Checked;?>><label for="auth_1">Authorised</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					<input  type="radio" id="auth_2" name="authorise" class="radio" value="2" <?php echo $strOpt2Checked;?>><label for="auth_2">Rejected</label>
-->		<select id='authorise' name='authorise' <?php echo $strDisabled; ?>>
				<option value="0" <?php  if($authorise =="0")echo "selected";?>>Pending Authorisation</option>
				<option value="1" <?php  if($authorise =="1")echo "selected";?>>Authorised</option>
				<option value="2" <?php  if($authorise =="2")echo "selected";?>>Rejected</option>
			</select>
		</td>
	<tr>
</table>
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Comments</span></span></div>
<div style="margin:5px 5px 5px 5px;">
<textarea id="updatetxt" name="updatetxt" rows="5" <?php echo $strDisabled; ?>><?php echo _html_encode($_POST['updatetxt']);?>
</textarea>
</div>
<div class='seperator'><div style='display:none;'></div></div>
<table width="100%">
<tr width="100%">
<td align="right">

<?php 	if($strDisabled=="")
	{
		$strMenuHTML =	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
		$strMenuHTML .=	"					 <a  style='cursor:pointer;' id=\"_menuRB\" onclick=\"var oForm = document.getElementById('frmCallactionLoader');oForm.submit();\" class=\"rmb\" target=\""._html_encode($strTarget)."\" href=\"#\">";
		$strMenuHTML .=	"						 <span id=\"buttonHolder\" class='ibuttonbg'>";
		$strMenuHTML .=	"							 <img class=\"i_laimg\" src='client/_system/images/icons/ilb.jpg'/>";
		$strMenuHTML .=	"								 <span id=\"_menuRBText\" class=\"itextHolder ibuttonbg\">";
		$strMenuHTML .=	"									&nbsp;Save";
		$strMenuHTML .=	"								 </span>";
		$strMenuHTML .=	"							 <img class=\"i_rimg\" src='client/_system/images/icons/irb.jpg'/>";
		$strMenuHTML .=	"						</span>";
		$strMenuHTML .=	"					 </a>";
		$strMenuHTML .=	"				</td>";
		echo $strMenuHTML;
		}
?></td>
</tr>
</table>
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Request Details</span></span></div>
<table class='calldetail' width='100%'>
									<tr xmlpath="[:_swm_app_path]/views/authorisations/call.details.xml" callreffmt="<?php echo _html_encode($_POST['_callreffmt']);?>" callref="<?php echo _html_encode($_POST['_callref']);?>" onclick="_process_navigation('[:_swm_app_path]/views/authorisations/call.details.xml');">
										<td width='3%'>
										</td>
										<td width='95%'>
											<span class=\"blackfont nmlfontsize\">
											View request details of <?php echo _html_encode($_POST['_callreffmt']);?>
											</span>
										</td>
										<td><img src='client/_system/images/icons/arrow.jpg'></td>
									</tr>								<tr>
									<td colspan='3'>
										<div class='seperator'><div style='display:none;'></div></div>
									</td>
								</tr>
			</table>
	<input type='hidden' name='_action' id='_action' value='_navig'>
	<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__originfilepath']);?>'>
	<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
	<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
	<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
	<input type='hidden' name='_callref' id='_callref' value='<?php echo _html_encode($_POST['_callref']);?>'>
	<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
	<input type='hidden' name='<?php echo $prefix;?>key' id='<?php echo $prefix;?>key' value='<?php echo $strKey;?>'>
	<?php echo $strOtherInputs;?>
</form>
