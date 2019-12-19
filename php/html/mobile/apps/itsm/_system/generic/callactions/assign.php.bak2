<?php 	if($_SESSION['callActionErrorMsg']!="")
		echo "<span class='errormsg'>"._html_encode($_SESSION['callActionErrorMsg'])."</span>";
	$prefix = 'mpasgn_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	$strCallAction = "";

	$strOrigin = $_POST['pp__definitionfilepath'];
	$strDefin = $_POST['pp__originfilepath'];

	$boolGroup = true;

	if(isset($_POST['assigngroup']))
	{
		$strID = "<table width='100%'><tr  style='cursor:pointer;' onclick=\"var oForm = document.getElementById('frmCallactionLoader');oForm.submit();\"><td width='50%'>NO ANALYST</td><td width='50%'>ASSIGN TO GROUP</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr></table><div class='seperator'><div style='display:none;'></div></div>";
		$strSupportgroup = $_POST['assigngroup'];
		$boolGroup = false;
		$strCallAction = "Assign";
		$strHolder = $strOrigin;
		$strOrigin = $strDefin;
		$strDefin = $strOrigin;
		$strSQL = "select swanalysts.analystid,swanalysts.name from swanalysts_groups,swanalysts where swanalysts.analystid=swanalysts_groups.analystid and swanalysts_groups.groupid='"._swm_db_pfs($strSupportgroup)."' ";
		$strHTML = "<table width='100%'><tr  style='cursor:pointer;' id='[:rs.analystid.htmlvalue]' onclick=\"var oHolder = document.getElementById('assignid');oHolder.value=this.getAttribute('id');var oForm = document.getElementById('frmCallactionLoader');oForm.submit();\"><td width='50%'>[:rs.analystid.htmlvalue]</td><td width='50%'>[:rs.name.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr></table><div class='seperator'><div style='display:none;'></div></div>";
	}
	else
	{
		$strID = "";
		$strSupportgroup = "";
		$strSQL = "select * from swgroups where id not like '_SYSTEM%'";
		$strHolder = $strOrigin;
		$strOrigin = $strDefin;
		$strDefin = $strHolder;
		$strHTML = "<table width='100%'><tr  style='cursor:pointer;' id='[:rs.id.htmlvalue]' onclick=\"var oHolder = document.getElementById('assigngroup');oHolder.value=this.getAttribute('id');var oForm = document.getElementById('frmCallactionLoader');oForm.submit();\"><td width='50%'>[:rs.id.htmlvalue]</td><td width='50%'>[:rs.name.htmlvalue]</td><td><img src='client/_system/images/icons/arrow.jpg'></td></tr></table><div class='seperator'><div style='display:none;'></div></div>";
	}

?><form id='frmCallactionLoader' target="_self" method='post' action='index.php' style='margin:0;'><div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Note</span></span></div><?php 
	$rsData = new _swm_rs();
	$strSQL = _swm_parse_string($strSQL);
	$rsData->query("syscache",$strSQL,true,null);

	//-- check if there is any data
	if($rsData->eof())
	{
			$strOutputHTML = "There is no data available";
	}
	else
	{
		while(!$rsData->eof())
		{
			$strID.=	$rsData->EmbedDataIntoString("rs",$strHTML);
			$rsData->movenext();
		}
	}
	$strMenuHTML =	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
	$strMenuHTML .=	"					 <a  style='cursor:pointer;'  id=\"_menuRB\" onclick=\"var oForm = document.getElementById('frmCallactionLoader');oForm.submit();\" class=\"rmb\" target=\"".htmlentities($strTarget)."\" href=\"#\">";
	$strMenuHTML .=	"						 <span id=\"buttonHolder\" class='ibuttonbg'>";
	$strMenuHTML .=	"							 <img class=\"i_laimg\" src='client/_system/images/icons/ilb.jpg'/>";
	$strMenuHTML .=	"								 <span id=\"_menuRBText\" class=\"itextHolder ibuttonbg\">";
	$strMenuHTML .=	"									&nbsp;Save";
	$strMenuHTML .=	"								 </span>";
	$strMenuHTML .=	"							 <img class=\"i_rimg\" src='client/_system/images/icons/irb.jpg'/>";
	$strMenuHTML .=	"						</span>";
	$strMenuHTML .=	"					 </a>";
	$strMenuHTML .=	"				</td>";
?><?php echo $strID;?>
	<input type='hidden' name='_action' id='_action' value='_navig'>
	<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value='<?php echo _html_encode($strDefin);?>'>
	<input type='hidden' name='_originfilepath' id='_originfilepath' value='<?php echo _html_encode($strOrigin);?>'>
	<input type='hidden' name='_callaction' id='_callaction' value='<?php echo _html_encode($_POST['_callaction']);?>'>
	<input type='hidden' name='_callreffmt' id='_callreffmt' value='<?php echo _html_encode($_POST['_callreffmt']);?>'>
	<input type='hidden' name='assigngroup' id='assigngroup' value='<?php echo _html_encode($strSupportgroup);?>'>
	<input type='hidden' name='assignid' id='assignid'>
	<input type='hidden' name='_frmaction' id='_frmaction' value='<?php echo $strCallAction;?>'>
	<input type='hidden' name='<?php echo $prefix;?>key' id='<?php echo $prefix;?>key' value='<?php echo $strKey;?>'>
	<?php echo $strOtherInputs;?>
</form>