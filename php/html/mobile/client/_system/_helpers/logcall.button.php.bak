<?php		
	$prefix = 'mplc_';
	$strKey = generate_secure_key($prefix);
	$_SESSION[$prefix.'key'] = $strKey;

	$strHTML = "<table><tr>";
	$strHTML.=	"				<td class='actionsright' width='33%'  height=\"68px\" align='right'>";
	$strHTML .=	"					 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\"_submit_inc(this);\" href=\"#\">";
	$strHTML .=	"						 <span id=\"buttonHolder\" class='ibuttonbg'>";
	$strHTML .=	"							 <img class=\"i_laimg\" src='client/_system/images/icons/ilb.jpg'/>";
	$strHTML .=	"								 <span id=\"_menuRBText\" class=\"itextHolder ibuttonbg\">";
	$strHTML .=	"									&nbsp;Log Call";
	$strHTML .=	"								 </span>";
	$strHTML .=	"							 <img class=\"i_rimg\" src='client/_system/images/icons/irb.jpg'/>";
	$strHTML .=	"						</span>";
	$strHTML .=	"					 </a>";
	$strHTML .=	"				</td></tr></table>";
	$strHTML .= 	"<input type='hidden' name='_frmaction' id='_frmaction' value=''>";
	$strHTML .= 	"<input type='hidden' name='".$prefix."key' id='".$prefix."key' value='".$strKey."'>";
	echo $strHTML;
?>