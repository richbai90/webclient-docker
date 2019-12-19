<?php
	//-- service/form/resolverecord/index.php
	//-- v 1.0.1
	//-- 24.11.2009

	//-- given a table, column and value resolve record

	//-- includes
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');
	include('../../../php/db.helpers.php');


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/resolverecord/index.php","START","SERVI");
	}	


	//-- get form xml def 
	if($_POST['customised']=="true")
	{
		$strFileName = $portal->application_path."_customised/forms/". $_POST['formtype'] . "/" . $_POST['form'].".xml";
	}
	else
	{
		$strFileName = $portal->application_path."forms/".  $_POST['formtype'] . "/" .$_POST['form'].".xml";
	}

	$fp = file_get_contents($strFileName);
	if($fp==false)
	{
		//-- return error message
		echo "error:The XML defiition file for [".$_POST['form']."] was not found. Please contact your Administrator";
		exit;
	}

	//-- get table associations xml 
	$xmlDOC = domxml_open_mem($fp);
	$xmlFormDef = swxml_childnode($xmlDOC,"form");
	$xmlTablesDef = swxml_childnode($xmlFormDef,"tableassociations");
	if($xmlTablesDef!=null)
	{
		//-- process related and extended table
		$childnodes = $xmlTablesDef->child_nodes();
		foreach ($childnodes as $aTable)
		{
			//-- get table info
			if($aTable->tagname=="")continue;
			$strDSN = $aTable->get_attribute("dsn");
			if($strDSN=="")$strDSN ="swdata";
			$strTable = $aTable->get_attribute("table");
			$strRsID = $aTable->get_attribute("rsid");
			if($strRsID=="")$strRsID==$strTable;

			if($strRsID!=$_POST['resolvetable'])continue;


			$strKeyCol = $aTable->get_attribute("keycolumn");
			$intPFS = $aTable->get_attribute("pfs");

			//-- check table type and get data
			if(strToLower($aTable->tagname)=="primarytable")
			{
				//-- skip
			}
			else 
			{
				$strColumn = $_POST['resolvecolumn'];
				if(strpos($strColumn,"!")!==false)
				{
					$strWhere = "";
					//-- something like firstname!surname
					$arrValues = explode(" ",$_POST['resolvevalue'],2);
					$arrCols = explode("!",$strColumn);
					foreach($arrCols as $pos => $strCol)
					{
						$strResValue = $arrValues[$pos];
						if($strResValue=="")$strResValue=$arrValues[$pos-1];

						$operator = " like ";
						$boolPFS = boolColumnIsString($strTable.".".$strCol);
						if($boolPFS)
						{
							$varResolveValue = "'". db_pfs($strResValue) ."%'";
						}
						else
						{
							$operator = " = ";
							$varResolveValue = $strResValue;
						}

						if($strWhere!="")
						{
							$strWhere .=(sizeOf($arrValues)==1)?" or ":" and ";
						}
						$strWhere .= $strCol . $operator . $varResolveValue;
					}
					$strSQL = "select count(*) as counter from ".$strTable." where ". $strWhere;
				}
				else
				{
					//-- construct normal where
					$operator = " like ";
					$boolPFS = boolColumnIsString($strTable.".".$strColumn);
					if($boolPFS)
					{
						$varResolveValue = "'". db_pfs($_POST['resolvevalue']) ."%'";
					}
					else
					{
						$operator = " = ";
						$varResolveValue = $_POST['resolvevalue'];
					}
					$strWhere =$strColumn . $operator . $varResolveValue;
					$strSQL = "select count(*) as counter from ".$strTable." where ". $strWhere;
				}

				//-- sql to fetch results
				$oConn = connectdb($strDSN);
				if($oConn)
				{
					$result_id = @_execute_xmlmc_sqlquery($strSQL,$oConn);
					if($result_id)
					{
						$aRow = hsl_xmlmc_rowo($result_id);
						if($aRow->counter==1)
						{
							//-- full select
							$strSQL = "select * from ".$strTable." where ". $strWhere;
							$rsTbl = _xmlmc_query_record($strSQL,$oConn);

							//-- we have one matching record so return record
							$strXMLRS = "<".$aTable->tagname.">";
							$strXMLRS .= db_record_as_xml($rsTbl,$strRsID,$strKeyCol,$strTable,$intPFS);
							$strXMLRS .= "</".$aTable->tagname.">";
						}
						else if($aRow->counter>1)
						{
							//-- more than one
							$strXMLRS = "morethanonerecord";
						}
						else
						{
							//-- no records to need to prompt them to create a new one
							$strXMLRS = "norecords";
						}
					}
					else
					{
						//-- return error message
						$strXMLRS = "error:The record could not be resolved against the database. Please contact your Administrator";
					}
				}
				break;
			}
			close_dbs();
		}
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/resolverecord/index.php","END","SERVI");
	}	

	echo $strXMLRS;
	exit;
?>