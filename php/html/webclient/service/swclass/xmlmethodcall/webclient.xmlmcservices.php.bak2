<?php

//-- 28.02.2011 - this is a wrapper for webclient custom xmlmc requests to services that do not exist in c++ api
//--			  the services requested are specific to webclient and are processed using php
//--			  for each method have a corresponding php function that actions that method

if(!defined("RUNNING_INWC"))
{
	echo "ERROR:File called out of context.";
	exit(0);
}

//-- check valid session
@include_once("../../../php/session.php");

//-- inserts a record into a db using xmlmc
function insertRecord()
{
	$xmlResultString = "";
	$strInsertDb = "swdata";
	$strInsertTable = "";
	$strInsertIntoCols = "";
	$strInsertIntoValues = "";

	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcparam_")===0)
		{
			//-- get param name
			$arrParam = explode("_xmlmcparam_",$strParamName,2);
			$strParam = $arrParam[1];

			//-- might be a groupie (we are submitting same param more than once i.e. group of callrefs
			$arrParam = explode("__grpcounter__",$strParam,2);
			$strParam = $arrParam[0];

			if($strParam=="_tablename")
			{
				$targetInfo = explode(".",$varValue);
				if(@$targetInfo[1])
				{
					$strInsertDb = $targetInfo[0];
					$strInsertTable = $targetInfo[1];
				}
				else $strInsertTable = $varValue;
			}
			else if($strParam=="_keycolumn")
			{
				//-- ignore
			}		
			else
			{
				//-- construct sql parts
				if($strInsertIntoCols!="")$strInsertIntoCols .= ",";
				$strInsertIntoCols .= $strParam;

				if($strInsertIntoValues!="")$strInsertIntoValues .= ",";
				$strInsertIntoValues .= "'".db_pfs($varValue,'swsql')."'"; //-- do not care about numerics as  auto converts
			}
		}
	}

	//-- execute sql insert using odbc connector (not using api)
	$strSQL = "insert into ".$strInsertTable." (".$strInsertIntoCols.") values (".$strInsertIntoValues.")";
	$xmlmcf = new swphpXmlMethodCall();
	$xmlmcf->SetParam("database",$strInsertDb);
	$xmlmcf->SetParam("query",$strSQL);
	$xmlmcf->Invoke("data","sqlQuery");
	echo $xmlmcf->xmlresult;
}

//-- update a record into a db using xmlmc
function updateRecord()
{
	$xmlResultString = "";
	$strUpdateDb = "swdata";
	$strUpdateTable = "";
	$strUpdateCols = "";
	$strUpdateWhere = "";
	$keyCols = Array();
	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcparam_")===0)
		{
			//-- get param name
			$arrParam = explode("_xmlmcparam_",$strParamName,2);
			$strParam = $arrParam[1];

			//-- might be a groupie (we are submitting same param more than once i.e. group of callrefs
			$arrParam = explode("__grpcounter__",$strParam,2);
			$strParam = $arrParam[0];

			if($strParam=="_tablename")
			{
				$targetInfo = explode(".",$varValue);
				if(@$targetInfo[1])
				{
					$strUpdateDb = $targetInfo[0];
					$strUpdateTable = $targetInfo[1];
				}
				else $strUpdateTable = $varValue;
			}
			else if($strParam=="_keycolumn")
			{
				$keyColInfo = explode(",",$varValue);
				for($x=0;$x<count($keyColInfo);$x++)
				{
					$keyCols[$keyColInfo[$x]]=true;
				}
			}
			else
			{
				//-- construct sql parts
				if(@$keyCols[$strParam])
				{
					if($strUpdateWhere!="")$strUpdateWhere.= " AND " ;
					$strUpdateWhere .= $strParam . " = '".db_pfs($varValue,'swsql')."' ";
				}
				else
				{
					if($strUpdateCols!="")$strUpdateCols.= " , " ;
					$strUpdateCols .= $strParam . " = '".db_pfs($varValue,'swsql')."' ";
				}
			}
		}
	}

	//-- execute sql insert using odbc connector (not using api)
	$strSQL = "update ".$strUpdateTable." set ".$strUpdateCols;
	if($strUpdateWhere!="")$strSQL.= " WHERE " . $strUpdateWhere;
	
	$xmlmcf = new swphpXmlMethodCall();
	$xmlmcf->SetParam("database",$strUpdateDb);
	$xmlmcf->SetParam("query",$strSQL);
	$xmlmcf->Invoke("data","sqlQuery");
	echo $xmlmcf->xmlresult;
}


//--
//-- inserts temp workflow item into tempdb using odbc connector
function insertTemporaryWorkflowItem()
{
	$xmlResultString = "";
	$strInsertTable = "";
	$strInsertIntoCols = "";
	$strInsertIntoValues = "";

	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcparam_")===0)
		{
			//-- get param name
			$arrParam = explode("_xmlmcparam_",$strParamName,2);
			$strParam = $arrParam[1];

			//-- might be a groupie (we are submitting same param more than once i.e. group of callrefs
			$arrParam = explode("__grpcounter__",$strParam,2);
			$strParam = $arrParam[0];

			if($strParam=="_tablename")
			{
				$strInsertTable = $varValue;
			}
			else
			{
				//-- construct sql parts
				if($strInsertIntoCols!="")$strInsertIntoCols .= ",";
				$strInsertIntoCols .= $strParam;

				if($strInsertIntoValues!="")$strInsertIntoValues .= ",";
				$strInsertIntoValues .= "'".db_pfs($varValue,'swsql')."'"; //-- do not care about numerics as auto converts
			}
		}
	}

	//-- execute sql insert using odbc connector (not using api)
	$strSQL = "insert into wc_calltasks (".$strInsertIntoCols.") values (".$strInsertIntoValues.")";
	$res = _execute_xmlmc_sqlquery($strSQL,"sw_systemdb");
	if($res)
	{
		$xmlResultString = "<xmlMethodCall status='OK'></xmlMethodCall>";
	}
	else
	{
		$xmlResultString = "ERROR:Failed to insert temporary workflow record.";
	}
	echo $xmlResultString;
}

//--
//-- returns temp workflow items from a given temp table
function getTemporaryWorkflowRecords()
{
	$xmlResultString = "";
	$strSelectFromTable = "";
	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcparam_")===0)
		{
			//-- get param name
			$arrParam = explode("_xmlmcparam_",$strParamName,2);
			$strParam = $arrParam[1];

			//-- might be a groupie (we are submitting same param more than once i.e. group of callrefs
			$arrParam = explode("__grpcounter__",$strParam,2);
			$strParam = $arrParam[0];

			if($strParam=="_tablename")
			{
				$strSelectFromTable = $varValue;
			}
		}
	}
	
	//-- execute sql
	$strSQL = "select * from wc_calltasks where sessionid = '" . $strSelectFromTable ."' order by parentgroupsequence,taskid asc";
	$result_id = _execute_xmlmc_sqlquery($strSQL,"sw_systemdb");
	if($result_id)
	{
		//-- return recordset in xml
		$strXMLRS = "<rowData status='ok'>";
		//-- get row
		$aRow = hsl_xmlmc_rowo($result_id);
		while($aRow)
		{
			$strXMLRS .= db_record_as_xml($aRow,"row","","",0);
			$aRow = hsl_xmlmc_rowo($result_id);
		}
		$strXMLRS .= "</rowData>";
		$xmlResultString = "<xmlMethodCall status='OK'>".$strXMLRS."</xmlMethodCall>";			
	}
	else
	{
		$xmlResultString = "<xmlMethodCall status='fail'><code>-666</code><error>Failed to select task records for [".$strSelectFromTable."]</error></xmlMethodCall>";
	}
	echo $xmlResultString;
}


//-- get temp workflow item to be used in a form for editing
function getTemporaryWorkflowItem()
{
	$xmlResultString = "";
	$strSelectFromTable = "";
	$strTaskID = "";
	$strGroupID = "";
	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcparam_")===0)
		{
			//-- get param name
			$arrParam = explode("_xmlmcparam_",$strParamName,2);
			$strParam = $arrParam[1];

			//-- might be a groupie (we are submitting same param more than once i.e. group of callrefs
			$arrParam = explode("__grpcounter__",$strParam,2);
			$strParam = $arrParam[0];

			if($strParam=="_tablename")
			{
				$strSelectFromTable = $varValue;
			}
			elseif($strParam=="taskId")
			{
				$strTaskID = $varValue;
			}
			elseif($strParam=="parentGroup")
			{
				$strGroupID = pd_pfs($varValue,'swsql');
			}
		}
	}
	
	//-- execute sql
	$strSQL = "select * from wc_calltasks where sessionid = '" . $strSelectFromTable ."' and taskid=".$strTaskID." and parentgroup='".$strGroupID."'";
	$result_id = _execute_xmlmc_sqlquery($strSQL,"sw_systemdb");
	if($result_id)
	{
		//-- return recordset in xml
		$strXMLRS = "<rowData>";
		//-- get row
		$aRow = hsl_xmlmc_rowo($result_id,false);
		while($aRow)
		{
			$strXMLRS .= db_record_as_xml($aRow,"row","","",0);
			$aRow = hsl_xmlmc_rowo($result_id,false);
		}
		$strXMLRS .= "</rowData>";
		$xmlResultString = "<xmlMethodCall status='OK'>".$strXMLRS."</xmlMethodCall>";			
	}
	else
	{
		$xmlResultString = "<xmlMethodCall status='fail'><code>-666</code><error>Failed to select task record from temporary table</error></xmlMethodCall>";
	}
	echo $xmlResultString;
}

//-- create user resource for mylibrary
function mylibCreateWWW()
{
	global $oAnalyst;
	//-- execute sql
	$strSQL = "insert into swanalysts_userres (name,password,analystid,url,sitelabel) values ('','','".db_pfs($oAnalyst->analystid)."','".db_pfs($_POST['resourceUrl'])."','".db_pfs($_POST['displayName'])."')";
	$result_id = _execute_xmlmc_sqlquery($strSQL,"sw_systemdb");
	if($result_id)
	{
		$xmlResultString = "<xmlMethodCall status='OK'></xmlMethodCall>";			
	}
	else
	{
		$xmlResultString = "<xmlMethodCall status='fail'><code>-666</code><error>Failed to create URL Resource ".$strSQL."</error></xmlMethodCall>";
	}
	echo $xmlResultString;
}

//-- call function
runUserDefinedFunction($_POST["_xmlmcmethod"]);


?>