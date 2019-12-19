<?php

	//-- global.js clone_priority_events
	$nFromSla = PrepareForSql($_POST['fsla']);
	$nToSla = PrepareForSql($_POST['tsla']);


	$strSQL = "select * from system_sla_events where slaid =" . $nFromSla;
	$oRS = get_recordset($strSQL,"syscache");
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	if($oRS->HasError())
	{
		echo $oRS->GetLastError();
		exit;
	}

	//-- delete existing to sla excludes	
	$strDelete = "delete from system_sla_excludes where slaid=".$nToSla;
	if(!submitsql($strDelete,"syscache"))
	{
		throwError(-100,"clone_priority_events the existing sla events could not be deleted before cloning. Please contact your Administrator");
	}

	//-- loop through event records for priority you are copying
	while ($oRS->Fetch())
	{
		$colName = "";
		$colValue = "";
		$strCols = "";
		$strValues = "";

		$intCols = $oRS->GetColumnCount();
		//-- loop through columns of event record
		for ($x=0; $x < $intCols;$x++)
		{
			//-- get values for new event record
			$colName = $oRS->GetColumnName($x);
			if(UC($colName)!="EVTID")
			{
				$colValue = $oRS->GetColumnValue($colName);
				$isNumeric = $oRS->IsColNumeric($x);
				$strQuotes = ($isNumeric)?"":"'";

				if(UC($colName)=="SLAID")
				{
					//-- set the priority ID to that of the new priority
					$colValue = $nToSla;
				}

				if($strCols!="")$strCols.=",";
				if($strValues!="")$strValues.=",";

				$strCols.= $colName;
				$strValues.= $strQuotes.pfs($colValue).$strQuotes;
			}
		}
		//-- insert event record
		$strInsertSQL = "insert into SYSTEM_SLA_EVENTS ( " . $strCols . ") values (" . $strValues . ")";
		if(!submitsql($strInsertSQL,"sw_systemdb"))
		{
			throwError(-101,"Failed to copy SLA events. Please contact your Administrator");
		}
	}
	throwSuccess(0); //-- ok and exit
?>