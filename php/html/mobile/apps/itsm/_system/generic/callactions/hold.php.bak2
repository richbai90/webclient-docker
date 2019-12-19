<form id='frmCallactionLoader' target="_self" method='post' action='index.php' >
<?php 	if($_SESSION['callActionErrorMsg']!="")
		echo "<span class='errormsg'>"._html_encode($_SESSION['callActionErrorMsg'])."</span>";

	$prefix = 'mphold_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	$thisFile = _get_file_loc("[:_swm_app_path]/settings.xml"); 
	if(!file_exists($thisFile))
	{
		echo "The definition file for this view is missing. Please contact your Administrator."; 
		exit;
	}

	if (!$domSettings = @domxml_open_file($thisFile))
	{
		echo "Error while loading the requested document. Please contact your Administrator.";
		exit;
	}

	$settingXML = $domSettings->document_element();
	if(!$settingXML)
	{
		echo "The view xml is not defined correctly. Please contact your Administrator.";
		exit;
	}

	$arrHoldValues = array();
	$children = $settingXML->child_nodes();
	$dTotal = count($children);
	for ($i=0;$i<$dTotal;$i++)
	{
		$colNode = $children[$i];
		if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
		{
			$strColName = $colNode->tagname();
			if($strColName=="holdvalues")
			{
				$entries = $colNode->get_elements_by_tagname("entry");
				$intCount = count($entries);
				for($x = 0; $x<	$intCount;$x++)
				{
					$thisElement = $entries[$x];
					$strDisplay = $thisElement->get_elements_by_tagname("display");
					$intValue = $thisElement->get_elements_by_tagname("value");
					$strDisplay = $strDisplay[0]->get_content();
					$intValue = $intValue[0]->get_content();
					$arrHoldValues[$strDisplay] = $intValue;
				}
				break;
			}
		}
	}

?>
<table width="100%">
	<tr height="30px">
		<td>
			<span class="blackfont nmlfontsize">
				On Hold Length
			</span>
		</td>
		<td align="right">
			<select id="holdlength" name="holdlength">
			<?php 				foreach($arrHoldValues as $key=>$value)
				{
					echo "<option value='".$value."'";
					if($value==$_POST['holdlength'])
						echo "selected";
					echo ">".$key."</option>";
				}

			?>
			</select>
		</td>
	<tr>
</table>
<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Note</span></span></div>
<div style="margin:5px 5px 5px 5px;">
<textarea id="updatetxt" name="updatetxt" rows="5"><?php echo _html_encode($_POST['updatetxt']);?>
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
