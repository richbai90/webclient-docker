<?php


//-- NWJ
//-- CREATE UL TREE HTML FOR PROBLEM PROFILE SELECTOR
function create_profile_tree()
{
	$tableODBC = new CSwDbConnection;;
	$tableODBC->Connect(swdsn(),swuid(),swpwd());

	$strXML = get_probcode_children("code not like '%-%'",1, $tableODBC);

	return $strXML;
}

function get_probcode_children($strFilter, $treeLevel, $odbcConn)
{

	$strTreeData = "";
	if($treeLevel==1)
	{
		$strTreeData = "<ul class='tree_branch'><span onclick='contract_expand(this.parentElement);' class='img_branch_expanded'>&nbsp;&nbsp;&nbsp;</span><a href='#'>Problem Profiles</a>";
		$strTreeData .= "<div class='tree_branch_holder_show'>";	
	}

	//-- select any children for this parent
	$strSQL = "select code, info FROM pcdesc WHERE ".$strFilter." order by info";
	$recSet = $odbcConn->Query($strSQL,true);
	if($recSet)
	{
		//-- loop though parents and get children
		while (!$recSet->eof) 
		{
			$typeCode = $recSet->f('code');
			$typeTxt = $recSet->f('info');

			$arrCodes = explode("-",$typeCode);
			$arrText = explode(" -> ",$typeTxt);
			$intLevel = sizeof($arrCodes);
			if ($treeLevel == $intLevel)
			{
				$strChildData = get_probcode_children("code like '".$typeCode."-%'",$intLevel+1, $odbcConn);

				if($strChildData!="")
				{
					$strTreeData .=  "<ul class='tree_branch'><span onclick='contract_expand(this.parentElement);' class='img_branch_contracted'>&nbsp;&nbsp;&nbsp;</span><a href='#' onclick='select_item(this)'  keyvalue='".htmlentities($typeCode)."' textvalue='".htmlentities($typeTxt)."'>".end($arrText)."</a>";
					$strTreeData .= "<div class='tree_branch_holder'>";
					$strTreeData .= $strChildData;
					$strTreeData .= "</div>";
					$strTreeData .= "</ul>";
				}
				else
				{
					$strTreeData .=  "<ul class='tree_leaf'><span>&nbsp;&nbsp;&nbsp;</span><a href='#' onclick='select_item(this)'  keyvalue='".htmlentities($typeCode)."' textvalue='".htmlentities($typeTxt)."'>".end($arrText)."</a>";
					$strTreeData .= "</ul>";
				}
			}
			$recSet->movenext();
		}
	}
	if($treeLevel==1)
	{
		$strTreeData .= "</div>";
		$strTreeData .= "</ul>";
	}
	return $strTreeData;
}

?>