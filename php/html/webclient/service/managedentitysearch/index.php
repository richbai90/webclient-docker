<?php

	//-- 02.10.2009
	//-- perform a managed entity search , get data and echo
	//-- expects [mesid] and any passed in parameters for query
	include('../../php/session.php');
	include('../../php/xml.helpers.php');
	include('../../php/db.helpers.php');


	//-- get xml file that defines the mes
	if(!isset($_POST['mesid'])) echo false;
	$strControlName = $_POST['mesid'];

	$strMesType = $_POST['mestype'];
	if($strMesType=="")$strMesType="mes";


	if($strMesType=="sfc")
	{
		include('searchforcalls.php');
		exit;
	}


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/managedentitysearch/index.php","START","SERVI");
	}	


	//-- get contents and generate workspace view
	$strFileName = $portal->fs_application_path . "xml/dbevs/Database Entity Views.xml";

	$xmlfp = file_get_contents($strFileName);
	if(!$xmlfp)
	{
		echo "Error : Could not load database entity view xml. Please contact your administrator."; 
		exit;
	}
		
	$xmlDoc = domxml_open_mem($xmlfp);	
	if($xmlDoc)
	{

		$xmlMES = null;
		$arrNodes = $xmlDoc->get_elements_by_tagname('dbev');
		foreach ($arrNodes as $aNode)
		{
			$nodeName = swxml_childnode($aNode,"name");
			if ( (strToLower($nodeName->tagname)=="name") && (strToLower($nodeName->get_content()) == strToLower($strControlName)) )
			{
				$xmlMES = $aNode;
				break;
			}
		}

		if($xmlMES==null)
		{
			echo "Error : Could not load database entity view (".$strControlName."). Please contact your administrator."; 
			exit;
		}

		//-- dsn
		$strDSN = swxml_childnode_content($xmlMES,"dsn");
		if($strDSN=="") $strDSN="swdata";

		//-- table and cols
		$strTable = swxml_childnode_content($xmlMES,"table");	
		$strSearchColumns = swxml_childnode_content($xmlMES,"searchColumns");
		$strSelectColumns = swxml_childnode_content($xmlMES,"searchResultColumns");

		//-- get keycolumn
		$strKeyCol = $_POST['_keycolumn']; 

		//-- get fixed filter
		$strFixedFilter = swxml_childnode_content($xmlMES,"filter");
		//-- 12.12.12 - 90128 - parse &[] vars
		$strFixedFilter = parseStandardDatabaseSearchFilters($strFixedFilter);

		//-- construct base sql
		$strSQL = "SELECT !!mssqltop!! ".$strKeyCol." as tpk, ". $strSelectColumns ." FROM " . $strTable . " ";
		if($strFixedFilter!="") $strSQL .= " WHERE " . $strFixedFilter;

		//-- check for passed in search parameters
		$sqlANDORoperator = $_POST['sqloperator'];
		if($sqlANDORoperator=="")$sqlANDORoperator = "OR";

		$strParamFilter = "";
		$arrSearchCols = explode(",",$strSearchColumns);
		foreach ($arrSearchCols as $strCol)
		{
			$strBinding = trim($strTable).".".trim($strCol);
			$varType = trim($strTable).".".trim($strCol);

			$strOp= @$_POST["_op_".$varType];
			$varValue = @$_POST[$strBinding];

			if($varValue!="")
			{	
				//-- prepare value?
				if($strOp!="=")
				{
					//-- strings
					$strBinding = db_case($strBinding);
					$varValue = db_case("'" . db_pfs($varValue . "%",$portal->databasetype) . "'");
					$strOperand = " LIKE ";
				}
				else
				{
					//-- used for things like call status
					$strOperand = " in ";
					$varValue = "(".$varValue.")";
				}

				if($strParamFilter!="")$strParamFilter.= " ". $sqlANDORoperator ." ";
				$strParamFilter .= $strBinding . $strOperand . $varValue;
			}
		}

		//-- add param filter to sql
		if($strParamFilter!="")
		{
			$strAND = ($strFixedFilter!="")?" AND ":" WHERE ";
			$strSQL .= $strAND. " (".$strParamFilter.")";
		}
		$strSQL .= " !!orarownum!! ";

		//-- data ordering info
		$strOrderBy = $_POST["orderby"];
		$strOrderDir = $_POST["orderdir"];
		$strApplyOrder = "";
		if($strOrderBy!="" && $strOrderBy!="null")
		{
			if($strOrderDir == "") $strOrderDir="DESC";
			$strSQL .= " order by " . $strOrderBy . " " .$strOrderDir;
		}



		//-- check for rowlimit
		$intRowLimit = $_POST['sqlrowlimit'];
		if($intRowLimit=="")$intRowLimit=100;
		$strSQL = add_db_rowlimit_to_sql($strSQL,$intRowLimit,$portal->databasetype);

		//-- run sql to get data
		$strDataOut = "";
		$result = new swphpDatabaseQuery($strSQL,$strDSN);
		if($result)
		{
			//-- execute and output table html - this is faster than sending xml to client and then processing xml into table.
			while ($row = $result->fetch()) 
			{ 
				$strDataRow = "";
				foreach($row as $fieldName => $fieldValue)
				{
					if(strToLower($fieldName)=="tpk")continue;
					if(strpos($fieldName,"@")===0)continue;

					//-- column seperator
					$formattedValue = $fieldValue; //datatable_conversion($fieldValue, $strTable.".".$fieldNamen);
					$strDataRow .= "<td noWrap><div>" . $formattedValue . "</div></td>";
				}
				//-- row seperator / new line
				$strDataOut .= "<tr keytable='".$strTable."' keycolumn='".$strKeyCol."' keyvalue='".base64_encode($row->tpk)."' onclick='app.mes_datarow_selected(this);' ondblclick='app.mes_datarow_dblclick(this);'>" . $strDataRow . "</tr>";
			}
			echo $strDataOut;

			close_dbs();
		}
	}

//-- log activity
if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
{
	_wc_debug("service/managedentitysearch/index.php","END","SERVI");
}	


?>