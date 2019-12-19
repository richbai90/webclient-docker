<?php

	//-- 12.10.2009
	//-- get call list for a email data table for passed in mailbox folder

	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');
	include('../../../php/db.helpers.php');
	
	//-- get xml file that defines the mes
	if(!isset($_POST['mailboxtable']))
	{	
		echo "Failed to derive mailbox info for datatable";
		exit;
	}

	
	
	
	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/email/getmaillist/index.php","START","SERVI");
	}	


	//-- get contents and generate workspace view
	$strFileName = $portal->fs_workspace_path . "_views/mail/datatable.xml";
	$xmlfp = file_get_contents($strFileName);
	if(!$xmlfp)
	{
		echo "Error : Could not load system table xml. Please contact your administrator."; 
		exit;
	}

    $xmlDoc = domxml_open_mem($xmlfp);
	//-- get first child
    $xmlDoc = $xmlDoc->child_nodes();
	$xmlDoc = $xmlDoc[0];

	//-- if we have control process
    if($xmlDoc)
    {

		$xmlmcInfo = swxml_childnode($xmlDoc,"xmlmc");
		if(!$xmlmcInfo)
		{
			echo "Failed to derive xmlmc info for datatable";
			exit;
		}
	
	
	
		//-- keycolumn
		$strKeyCol = swxml_childnode_content($xmlDoc,"keycolumn");
		if($strKeyCol=="") echo false;

		//-- select headers
		$jtXML = swxml_childnode($xmlDoc,"datatable");
		if($jtXML==null) echo false;

		//-- get field sep
		$jtSep = swxml_childnode_byatt($jtXML,"param","name", "fieldSeparator");
		if($jtSep==null)
		{
			$strSep = ",";
		}
		else
		{
			$strSep = $jtSep->get_attribute("value");
		}

		//-- get columns to select 
		$strSelectColumns = swxml_childnode_content($jtXML,"header");
		if($strSelectColumns=="") echo false;

		//-- get fixed filter
		$strFixedFilter = "";
		//$xmlFilter = swxml_childnode($xmlDoc,"filter");
		//$strFixedFilter = trim(get_xmldb_sql($xmlFilter,$portal->databasetype));

		//-- 17.08.2010 - get paging information
		if($_POST['limitrowsperpage']=="")
		{
			$intRowsPerPage = swxml_childnode_content($jtXML,"rowsperpage");
			if($intRowsPerPage=="")$intRowsPerPage = 100; //-- set limit to 100 rows which webclient should be able to handle nicely
			$_POST['limitrowsperpage'] = $intRowsPerPage;
		}

		//-- which page number do we want
		$intPageNumber = 1;
		if(isset($_POST['_pagenumber']))$intPageNumber = $_POST['_pagenumber'];

		//-- get offset (1st row # to return in page)
		$_POST['limitoffset'] = ($intPageNumber - 1) * $_POST['limitrowsperpage'];


		//--
		//-- eof get paging info

		//-- construct base sql (we want to get key field and status of call
		//$strSQL = "SELECT ".$strKeyCol." as tpk, msgstatus as tpkstatus, ". $strSelectColumns ." FROM " . $strTable;
		//if($strFixedFilter!="") $strSQL .= " WHERE " . $strFixedFilter;

		//-- now swap out any passed in parameters
		/*
		$xmlSQLParams = swxml_childnode($xmlDoc,"sqlparams");
		$xmlSQLParams = $xmlSQLParams->child_nodes();
		foreach ($xmlSQLParams as $aParam)
		{
			if($aParam->tagname=="")continue;
			//-- get parameter value - if blank ignore

			$varValue = $_POST[$aParam->tagname];
			if(isset($varValue))
			{	
				//-- prepare value
				$varValue = db_pfs($varValue,$portal->databasetype);

				//-- now replace in sql query find :[$aParam->tagname] and replace
				$strSQL = str_replace(":[params.".$aParam->tagname."]",$varValue,$strSQL);
			}
		}
		*/

		//-- run sql to get data
		$strDataOut = "";

		//-- create xmlmc call to getmessagelist
		$strRecordPath = swxml_childnode_content($xmlDoc,"xmlmcRecordPath");
		if($strRecordPath=="") $strRecordPath="data.message";
		$resultRows = swphpExecuteXmlmcFromXmlInfo($xmlmcInfo,$strRecordPath);

		if($resultRows)
		{
			//-- row onclick function
			$strSelectAction = swxml_childnode_content($xmlDoc,"onrowselected");
			if($strSelectAction=="") $strSelectAction = "app.emaillist_select_row";

			//-- row dblclick function
			$strDblClickAction = swxml_childnode_content($xmlDoc,"onrowdoubleclick");
			if($strDblClickAction=="") $strDblClickAction="app.emaillist_open_row";
			
			
			$arrDisplayColumns = explode(",",$strSelectColumns);
			
			for($x=0;$x<sizeof($resultRows);$x++)
			{ 
				$rows = $resultRows[$x];
				$strDataRow = "";
				foreach($arrDisplayColumns as $pos => $fieldName)
				{
				
					$fieldValue = @$rows->{$fieldName};
				
					//-- get format type
					$strConversion = "";
					if($fieldName=="priority")$strConversion="emailpriorityicon";
					else if($fieldName=="status")$strConversion="emailstatusicon";
					else if($fieldName=="attachmentCount")$strConversion="attachmenticon";
					else if($fieldName=="size")$strConversion="bytesize";
					

					//-- get formatted value
					$formattedValue = datatable_conversion($fieldValue, $strConversion);
					if($fieldValue==$formattedValue)$fieldValue = "sat";

					if($fieldName=="subject")$formattedValue=htmlentities($formattedValue);

					//-- column seperator
					if($rows->status==0 || $rows->status==4096)
					{
						$strDataRow .= "<td dbvalue='".$fieldValue."' noWrap ><div>" . utf8_encode($formattedValue) . "</div></td>";
					}
					else
					{
						$strDataRow .= "<td dbvalue='".$fieldValue."' noWrap ><div style='font-weight:bold;'>" . utf8_encode($formattedValue) . "</div></td>";
					}
				}
				//-- row seperator / new line
				$strDataOut .= "<tr type='sys' keycolumn='".$strKeyCol."' keyvalue='".$rows->{$strKeyCol}."' emailstatus='".$rows->status."' onclick='".$strSelectAction."(this,event);' ondblclick='".$strDblClickAction."(this,event);'>" . $strDataRow . "</tr>";
			}
			echo $strDataOut;
		}
	}


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/email/getmaillist/index.php","END","SERVI");
	}	


?>