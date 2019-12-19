<?php

	function get_menu($root)
	{
		$strRightHTML="";
		$strLeftHTML="";

		$xmlContentLayers = $root->get_elements_by_tagname("menu");
		foreach($xmlContentLayers as $pos => $xLayer)
		{
			$xmlLayers = $xLayer->get_elements_by_tagname("centeraction");
			foreach($xmlLayers as $pos => $xaLayer)
			{
				$xmlaLayers = $xaLayer->get_elements_by_tagname("title");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strMenuTitle = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strMenuTitle = _swm_parse_string($strMenuTitle);

				}
			}
			$xmlLayers = $xLayer->get_elements_by_tagname("rightaction");
			foreach($xmlLayers as $pos => $xaLayer)
			{
				$boolAllow = true;
				$appRights = $xaLayer->get_attribute("apprights");
				if($appRights!="")
				{
					$arrRights = explode(",",$appRights);
					$boolAllow = haveappright($arrRights[0],$arrRights[1]);
				}
				$sysRights = $xaLayer->get_attribute("sysrights");
				if($sysRights!="")
				{
					$arrRights = explode(",",$sysRights);
					$boolAllow = $boolAllow && haveright($arrRights[0],$arrRights[1]);
				}

				$xmlaLayers = $xaLayer->get_elements_by_tagname("title");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strRBTitle = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strRBTitle = _swm_parse_string($strRBTitle);
				}
				$xmlaLayers = $xaLayer->get_elements_by_tagname("action");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strRBAction = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strRBAction = _swm_parse_string($strRBAction);
				}
				$xmlaLayers = $xaLayer->get_elements_by_tagname("target");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strRBTarget = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strRBTarget = _swm_parse_string($strRBTarget);
				}
				if($boolAllow)
					$strRightHTML = right($strRBTitle,$strRBAction,$strRBTarget);
				else
					$strRBTitle = "";
			}
			$xmlLayers = $xLayer->get_elements_by_tagname("leftaction");
			foreach($xmlLayers as $pos => $xaLayer)
			{
				$xmlaLayers = $xaLayer->get_elements_by_tagname("title");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strLBTitle = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strLBTitle = _swm_parse_string($strLBTitle);

				}
				$xmlaLayers = $xaLayer->get_elements_by_tagname("action");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strLBAction = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strLBAction = _swm_parse_string($strLBAction);
				}
				$xmlaLayers = $xaLayer->get_elements_by_tagname("target");
				foreach($xmlaLayers as $pos => $xfLayer)
				{
					$strNoParse = $xfLayer->get_attribute("noparse");
					$strLBTarget = $xfLayer->get_content();
					if($strNoParse=="0" || $strNoParse=="")
						$strLBTarget = _swm_parse_string($strLBTarget);

				}
				$strLeftHTML = left($strLBTitle,$strLBAction,$strLBTarget);
			}
		}

		if($strRBTitle=="")
			$strRightHTML = right_hidden();
		if($strLBTitle=="")
			$strLeftHTML = left_hidden();

		$strMenuHTML = "<table border='0' width=\"100%\" height=\"42px\" cellspacing='0' cellpadding='0' style='margin:0;padding:0;'>";
		$strMenuHTML .=	"<tr>";
		$strMenuHTML .=	$strLeftHTML;
		$strMenuHTML .=	"				<td class='sitetitle'   width='33%'  height=\"42px\" noWrap valign='middle'><span id=\"_menuHolder\"></span></td>";
		$strMenuHTML .=	$strRightHTML;
		$strMenuHTML .=	"			</tr>";
		$strMenuHTML .=	"		</table>";
		$strMenuHTML .=	"<table border='0' width=\"100%\" height=\"42px\" cellspacing='0' cellpadding='0' style='margin:0;padding:0;'>";
		$strMenuHTML .=	"<tr>";
		$strMenuHTML .=	"<td class='sitetitle'   width='100%'  height=\"42px\" noWrap'><span id=\"_menuHolder2\">"._html_encode($strMenuTitle)."</span></td>";
		$strMenuHTML .=	"</tr>";
		$strMenuHTML .=	"</table>";
		return $strMenuHTML;
	}

	function left_hidden()
	{
		$strMenuHTML =	"		<td class='sitetitle actionsleft'  width='33%' height=\"42px\" align='left'>";
		$strMenuHTML .=	"				</td>";
		return $strMenuHTML;
	}

	function left($strLBTitle,$strLBAction,$strLBTarget)
	{
		/*$strMenuHTML =	"		<td class='sitetitle actionsleft' style='width:33%;'  width='188' height=\"42px\" align='left'>";
		$strMenuHTML .=	"	<div style='width:145;'>		 <a id=\"_menuLB\" onclick=\""._html_encode($strLBAction)."\" class=\"lmb\" target=\""._html_encode($strLBTarget)."\" href=\"#\">";
		$strMenuHTML .=	"						 <span id=\"buttonHolder\" class='buttonHolder'>";
		$strMenuHTML .=	"							 <img class=\"mb_laimg\" src='client/_system/images/icons/mb_la.jpg'/>";
    	$strMenuHTML .=	"								 <span id=\"_menuLBText\" class=\"\">";
		$strMenuHTML .=	"									&nbsp;"._html_encode($strLBTitle);
		$strMenuHTML .=	"							</span>";
		$strMenuHTML .=	"							 <img class=\"mb_rimg\" src='client/_system/images/icons/mb_r.jpg'/> ";
		$strMenuHTML .=	"						</span>";
		$strMenuHTML .=	"					 </a></div>";
		$strMenuHTML .=	"				</td>";
		return $strMenuHTML;*/

		$strMenuHTML =	"		<td class='sitetitle actionsleft' style='width:188px;'  width='188' height=\"42px\" align='left'>";
		$strMenuHTML .=	"	<div style='width:180px;'>		 <a  style='cursor:pointer;' id=\"_menuLB\" onclick=\""._html_encode($strLBAction)."\" class=\"lmb\" target=\""._html_encode($strLBTarget)."\" href=\"#\">";
		$strMenuHTML .=	"						 <span id=\"buttonHolder\" class='buttonHolder'>";
		$strMenuHTML .=	"							 <img class=\"mb_laimg\" src='client/_system/images/icons/mb_la.jpg'/>";
    	$strMenuHTML .=	"								 <span id=\"_menuLBText\" class=\"buttontext\">";
		$strMenuHTML .=	"									&nbsp;"._html_encode($strLBTitle);
		$strMenuHTML .=	"							</span>";
		$strMenuHTML .=	"							 <img class=\"mb_rimg\" src='client/_system/images/icons/mb_r.jpg'/> ";
		$strMenuHTML .=	"						</span>";
		$strMenuHTML .=	"					 </a></div>";
		$strMenuHTML .=	"				</td>";
		return $strMenuHTML;

		


	/*	$strMenuHTML =	"		<td class='sitetitle actionsleft' style='width:188px;'  width='188' height=\"42px\" align='left'>";
		$strMenuHTML .=	"	<div style='width:180px;'>		 <a id=\"_menuLB\" onclick=\""._html_encode($strLBAction)."\" class=\"lmb\" target=\""._html_encode($strLBTarget)."\" href=\"#\">";
		$strMenuHTML .=	"						 <span id=\"buttonHolder\" class='buttonHolder'>";
		$strMenuHTML .=	"							 <img class=\"mb_laimg\" src='client/_system/images/icons/mb_la.jpg'/>";
		$strMenuHTML .=	"								 <span id=\"_menuLBText\" class=\"\">";
		$strMenuHTML .=	"									&nbsp;"._html_encode($strLBTitle);
		$strMenuHTML .=	"							</span>";
		$strMenuHTML .=	"							 <img class=\"mb_rimg\" src='client/_system/images/icons/mb_r.jpg'/> ";
		$strMenuHTML .=	"						</span>";
		$strMenuHTML .=	"					 </a></div>";
		$strMenuHTML .=	"				</td>";
		return $strMenuHTML;*/
	}


	function right($strTitle,$strAction,$strTarget)
	{
		$strMenuHTML =	"				<td class='sitetitle actionsright' width='33%'  height=\"42px\" align='right'>";
		$strMenuHTML .=	"			<div style='width:120px;float:right;'>		 <a style='cursor:pointer;' id=\"_menuRB\" onclick=\""._html_encode($strAction)."\" class=\"rmb\" target=\""._html_encode($strTarget)."\" href=\"#\">";
		$strMenuHTML .=	"						 <span id=\"buttonHolder\" class='buttonHolder'>";
		$strMenuHTML .=	"							 <img class=\"mb_laimg\" src='client/_system/images/icons/mb_l.jpg'/>";
		$strMenuHTML .=	"								 <span id=\"_menuRBText\" class=\"buttontext\">";
		$strMenuHTML .=	"									&nbsp;"._html_encode($strTitle);
		$strMenuHTML .=	"								 </span>";
		$strMenuHTML .=	"							 <img class=\"mb_rimg\" src='client/_system/images/icons/mb_r.jpg'/>";
		$strMenuHTML .=	"						</span>";
		$strMenuHTML .=	"					 </a></div>";
		$strMenuHTML .=	"				</td>";
		return $strMenuHTML;
	}

	function right_hidden()
	{
		$strMenuHTML =	"				<td class='sitetitle actionsright' width='33%'  height=\"42px\" align='right'>";
		$strMenuHTML .=	"				</td>";
		return $strMenuHTML;
	}

	function replace_content( &$node, $new_content )
	{
		$dom = &$node->owner_document();
		$kids = &$node->child_nodes();
		foreach ( $kids as $kid )
			if ( $kid->node_type() == XML_TEXT_NODE )
				$node->remove_child ($kid);
		$node->set_content($new_content);
	}
?>