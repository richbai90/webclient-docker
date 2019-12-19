<form id='frmCallactionLoader' target="_self" method='post' action='index.php' >
<?php 	$prefix = 'mpcncl_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	if($_SESSION['callActionErrorMsg']!="")
		echo "<span class='errormsg'>"._html_encode($_SESSION['callActionErrorMsg'])."</span>";

	$strRefType = "display-none";
	$cncl_opt = $_POST['cncl_opt'];

	if($cncl_opt==1)
		$strRefType = "";
?>
<table width="100%">
	<tr height="30px">
		<td>
			<span class="blackfont nmlfontsize">
				Reason For Cancelling Call
			</span>
		</td>
		<td>
			<select id='cncl_opt' name='cncl_opt' onchange='set_cancel(this);'>
				<option value=0 <?php if($cncl_opt==0)echo "selected";?>>Customer has corrected problem</option>
				<option value=1 <?php if($cncl_opt==1)echo "selected";?>>This is a duplicate of call whose reference is</option>
				<option value=2 <?php if($cncl_opt==2)echo "selected";?>>Other reason (state below)</option>
			</select>
		</td>
		<td align="right" width="150px">
			<input type="text" class="<?php echo $strRefType;?>" width="100px" name="cncl_ref" id='cncl_ref' onchange='set_cancel_text(this);' value='<?php echo $_POST['cncl_ref'];?>'/><br />
		</td>
	<tr>
</table>
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Other Information</span></span></div>
<div style="margin:5px 5px 5px 5px;">
<textarea id="updatetxt" name="updatetxt" rows="5" readonly='true'><?php 
if(!isset($_POST['updatetxt']))
	echo "This call has been cancelled because the user has resolved the problem and called to cancel the request.";
else
	echo $_POST['updatetxt'];
?>
</textarea>
</div>
<div class='seperator'><div style='display:none;'></div></div>
<table width="100%">
<tr width="100%">
<td align="right">

<?php 		$strMenuHTML =	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
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
?></td>
</tr>
</table>
	<input type='hidden' name='_action' id='_action' value='_navig'>
	<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($_POST['pp__originfilepath']);?>'>
	<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($_POST['pp__definitionfilepath']);?>'>
	<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
	<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
	<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
	<input type='hidden' name='<?php echo $prefix;?>key' id='<?php echo $prefix;?>key' value='<?php echo $strKey;?>'>
	<?php echo $strOtherInputs;?>
</form>
