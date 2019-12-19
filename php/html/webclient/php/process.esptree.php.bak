<?php

@include_once('session.php');

//--
//-- create tree from db
function generate_db_tree($aRootNode,$strRootKey)
{
	$strJSReturn = "";

	//-- connect to db
	$strdb = $aRootNode->get_attribute("db");
	if($strdb=="")$strdb="swdata";
	$dbconn = connectdb($strdb);
	if($dbconn)
	{

		//-- get branch information
		$xmlBranch = swxml_childnode($aRootNode,"branch");
		if($xmlBranch)
		{
			//-- branch settings
			$strSQL = swxml_childnode_content($xmlBranch,"swsql");
			$strBranchKey = swxml_childnode_content($xmlBranch,"key");
			$strBranchTxt = swxml_childnode_content($xmlBranch,"displaytext");
			$strParentBranchKey = swxml_childnode_content($xmlBranch,"parentbranchkey");
			$strBranchImage = swxml_childnode_content($xmlBranch,"defaultimage");
			$strBranchOpenImage = swxml_childnode_content($xmlBranch,"openimage");
			$strBranchOnSelect = swxml_childnode_content($xmlBranch,"onselectjs");

			//-- get support groups (branches)
			$arr_branches = Array();
			$result_id = _execute_xmlmc_sqlquery( $strSQL,$dbconn);
			while ($swbranches = hsl_xmlmc_rowo($result_id)) 
			{ 
				//if(strpos($swgroup->id,"_")===0)continue;
				$strBranchID = $swbranches->$strBranchKey;
				$strBranchTXT = $swbranches->$strBranchTxt;
				$strParentID = $swbranches->$strParentBranchKey;
				if($strParentID=="")$strParentID=$strRootKey;

				$strJSReturn .= 'd.add("'.$strBranchID.'","'.$strParentID.'","'.$strBranchTXT.'",'.$strBranchOnSelect.',"'.$strBranchTXT.'","","'.$strBranchImage.'","'.$strBranchOpenImage.'",false,false);';

				//-- store name for title 
				$arr_branches[$strBranchID] = $strBranchTXT;
			}
		}

		//-- get node information
		$xmlNode = swxml_childnode($aRootNode,"node");
		if($xmlNode)
		{
			$strSQL = swxml_childnode_content($xmlNode,"swsql");
			$strNodeKey = swxml_childnode_content($xmlNode,"key");
			$strNodeTxt = swxml_childnode_content($xmlNode,"displaytext");

			$strNodeImage = swxml_childnode_content($xmlNode,"defaultimage");
			$strNodeOnSelect = swxml_childnode_content($xmlNode,"onselectjs");

			//-- create node name array by id
			$arr_nodes = Array();
			$result_id = _execute_xmlmc_sqlquery($strSQL,$dbconn);
			while ($swnodes = hsl_xmlmc_rowo($result_id)) 
			{ 
				$arr_nodes[$swnodes->$strNodeKey] = $swnodes->$strNodeTxt;
			}
		}

		//-- get node branch relation information
		$xmlNodeBranch = swxml_childnode($aRootNode,"nodebranch");
		if($xmlNodeBranch)
		{
			$strSQL = swxml_childnode_content($xmlNodeBranch,"swsql");
			$strNodeKey = swxml_childnode_content($xmlNodeBranch,"nodekey");
			$strBranchKey = swxml_childnode_content($xmlNodeBranch,"branchkey");


			//-- now get analysts and group rel
			$result_id = _execute_xmlmc_sqlquery($strSQL,$dbconn);
			while ($swnodebranch = hsl_xmlmc_rowo($result_id)) 
			{ 
				if(isset($arr_nodes[$swnodebranch->$strNodeKey]))
				{
					$strNodeName = $arr_nodes[$swnodebranch->$strNodeKey];
					$strNodeTitle = $arr_branches[$swnodebranch->$strBranchKey] . " / " . $strNodeName;
					$strJSReturn .= 'd.add("'.$swnodebranch->$strNodeKey.'","'.$swnodebranch->$strBranchKey.'","'.$strNodeName.'",'.$strNodeOnSelect.',"'.$strNodeTitle.'","","'.$strNodeImage.'","'.$strNodeImage.'",false,true);';
				}
			}
		}
	}
	return 	$strJSReturn;
}

?>