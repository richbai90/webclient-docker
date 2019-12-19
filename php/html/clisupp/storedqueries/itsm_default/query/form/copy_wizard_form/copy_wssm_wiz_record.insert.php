<?php	

	// -- CH00124808 - Query to copy wssm_wiz record. This is used in copy_wizard_form.
	// 20160622 DTH
	// Altered to merge 4 previous stored queries to fix an issue where the jump on answer data in table wssm_wiz_qac was not modified based on 
	// the record IDs of the new data; they still used the old data, meaning that the jump would be made to the original wizard which culd feasibly be deleted. 
	IncludeApplicationPhpFile("itsm.helpers.php");
			
	$strSourceWizardName = $_POST["swn"];
	$strNewWizardName = $_POST["nwn"];
	
	// Copy the main Wizard record
	// ---------------------------
	$strSQL = "SELECT * FROM WSSM_WIZ WHERE PK_NAME = '".PrepareForSql($strSourceWizardName)."'";
	$oRS = get_recordset($strSQL,'swdata');
	
	while($oRS->Fetch())
	{
		// -- Loop through table structure and make a copy of the record
		$arrData = "";
		while (list($strColName,$varColValue) = each($oRS->row))
		{
			if(UC($strColName)=="PK_NAME") $arrData["PK_NAME"] = $strNewWizardName;
			else $arrData[$strColName] = $varColValue;
		}
		// -- Insert new record into WSSM_WIZ
		$strTable = "WSSM_WIZ";
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1!=$arc) 
		{
			throwError(100,$arc);
		}
	}
	
	// Copy the Wizard Stage records
	// -----------------------------
	$strSQL = "SELECT * FROM WSSM_WIZ_STAGE WHERE FK_WIZ = '".PrepareForSql($strSourceWizardName)."' ORDER BY SINDEX";
	$oRS = get_recordset($strSQL,'swdata');

	while($oRS->Fetch())
	{
		// -- Loop through table structure and make a copy of the record
		$arrData = "";
		while (list($strColName,$varColValue) = each($oRS->row))
		{
			if(UC($strColName)=="FK_WIZ") $arrData["FK_WIZ"] = $strNewWizardName;
			else $arrData[$strColName] = $varColValue;
		}
		// -- Insert new record into WSSM_WIZ_STAGE
		$strTable = "WSSM_WIZ_STAGE";
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1!=$arc)
		{
			throwError(100,$arc);
		}
	}
	
	// Copy the Questions in each of the Wizard Stagges
	// ------------------------------------------------
	// -- Get Source Wizard Stage and store PK_AUTO_ID for each row in arrSourceStageIDs
	// PM00141453 - added Order By to ensure that the question details are added to the correct stage
	$strSWSSQL = "SELECT PK_AUTO_ID FROM WSSM_WIZ_STAGE WHERE FK_WIZ = '".PrepareForSql($strSourceWizardName)."' ORDER BY SINDEX";
	$oRS = get_recordset($strSWSSQL,'swdata');
	$arrSourceStageIDs = ""; 
	while($oRS->Fetch()) $arrSourceStageIDs[] = get_field($oRS,'PK_AUTO_ID');
	
	// -- Get New Wizard Stage and store PK_AUTO_ID for each row in arrNewStageIDs
	// PM00141453 - added Order By to ensure that the question details are added to the correct stage
	$strNWSSQL = "SELECT PK_AUTO_ID FROM WSSM_WIZ_STAGE WHERE FK_WIZ = '".PrepareForSql($strNewWizardName)."' ORDER BY SINDEX";
	$oNS = get_recordset($strNWSSQL,'swdata');
	$arrNewStageIDs = ""; 
	while($oNS->Fetch()) $arrNewStageIDs[] = get_field($oNS,'PK_AUTO_ID');
	
	// Need an array to match / correlate the source stage IDs with the new stage IDs
	$arrMatchStageIDs = "";
	$strMatchStageIDs = "";
	for($i=0;$i<count($arrSourceStageIDs);$i++)
	{
		$arrMatchStageIDs[$arrSourceStageIDs[$i]] = $arrNewStageIDs[$i];
		$strMatchStageIDs .= $arrSourceStageIDs[$i] . "=" . $arrNewStageIDs[$i] . "\r\n";
	}
	
	// -- Get Questions from WSSM_WIZ_Q for each Stage, insert and relate to new Stage
	for($i=0;$i<count($arrSourceStageIDs);$i++)
	{
		// PM00141453 - added Order By to ensure that the question details are added to the correct stage
		$strSQL = "SELECT * FROM WSSM_WIZ_Q WHERE FK_WIZ_STAGE = ".PrepareForSql($arrSourceStageIDs[$i])." ORDER BY QINDEX";
		$oQS = get_recordset($strSQL,'swdata');
		while($oQS->Fetch())
		{
			// -- Loop through table structure and make a copy of the record
			$arrData = "";
			while (list($strColName,$varColValue) = each($oQS->row))
			{				
				if(UC($strColName)=="FK_WIZ_STAGE") $arrData["FK_WIZ_STAGE"] = $arrNewStageIDs[$i];
				else $arrData[$strColName] = $varColValue;
			}
			// -- Insert new record into WSSM_WIZ_Q
			$strTable = "WSSM_WIZ_Q";
			$arc = xmlmc_addRecord($strTable,$arrData);
			if(1!=$arc)
			{
				throwError(100,$arc);
			}
		}
	}
	
	// Need to build a list of all questions in the wizard so that nextt questions in jump on answer can be mapped from the source wizard to the new wizard
	$arrSourceQuestionIDs = "";
	$arrNewQuestionIDs = "";
	for($i=0;$i<count($arrSourceStageIDs);$i++)
	{
		// -- Get Question ID(s) for Source Wizard
		// PM00141453 - added Order By to ensure that the question details are added to the correct stage
		$strSourceSQL = "SELECT PK_QID FROM WSSM_WIZ_Q WHERE FK_WIZ_STAGE = ".PrepareForSql($arrSourceStageIDs[$i])." ORDER BY QINDEX";
		$oSQS = get_recordset($strSourceSQL,'swdata');
		$strSourceQuestionIDs = "";
		while($oSQS->Fetch()) 
		{
			$qid = get_field($oSQS,'PK_QID');
			$arrSourceQuestionIDs[] =  $qid;
			$strSourceQuestionIDs .= $qid . ", ";
		}
		
		// -- Get Question ID(s) for New Wizard
		// PM00141453 - added Order By to ensure that the question details are added to the correct stage
		$strNewSQL = "SELECT PK_QID FROM WSSM_WIZ_Q WHERE FK_WIZ_STAGE = ".PrepareForSql($arrNewStageIDs[$i])." ORDER BY QINDEX";
		$oNQS = get_recordset($strNewSQL,'swdata');
		$strNewQuestionIDs = "";
		while($oNQS->Fetch()) 
		{
			$qid = get_field($oNQS,'PK_QID');
			$arrNewQuestionIDs[] =  $qid;
			$strNewQuestionIDs .= $qid . ", ";
		}
	}
	
	// Need an array to match / correlate the source stage IDs with the new stage IDs
	$arrMatchQuestionIDs = "";
	$strMatchQuestionIDs = "";
	for($k=0;$k<count($arrSourceQuestionIDs);$k++)
	{
		$arrMatchQuestionIDs[$arrSourceQuestionIDs[$k]] = $arrNewQuestionIDs[$k];
		$strMatchQuestionIDs .= "source :: new = " . $arrSourceQuestionIDs[$k] . " :: " . $arrNewQuestionIDs[$k] . "\r\n";
	}
		
	// Go through all the questions to populate the choices and the answer choices
	for($j=0;$j<count($arrSourceQuestionIDs);$j++)
	{
		// PM00141453 - added Order By to ensure that the question details are added to the correct stage
		$strChoiceSQL = "SELECT * FROM WSSM_WIZ_QC WHERE FK_QID = ".PrepareForSql($arrSourceQuestionIDs[$j])." ORDER BY CINDEX";
		$oCS = get_recordset($strChoiceSQL,'swdata');
		while($oCS->Fetch())
		{
			// -- Loop through table structure and make a copy of the record
			$arrData = "";
			$newChoiceData = "";
			while (list($strColName,$varColValue) = each($oCS->row))
			{
				if(UC($strColName)=="FK_QID") 
				{
					$arrData["FK_QID"] = $arrNewQuestionIDs[$j];
					$newChoiceData .= "FK_QID = " . $arrData["FK_QID"]; 
				}
				else 
				{
					$arrData[$strColName] = $varColValue;
					$newChoiceData .= $strColName . " = " . $arrData[$strColName]; 
				}
				$newChoiceData .= "\r\n";
			}
			// -- Insert new record into WSSM_WIZ_QC
			$strTable = "WSSM_WIZ_QC";
			$arc = xmlmc_addRecord($strTable,$arrData);
			if(1!=$arc)
			{
				throwError(100,$arc);
			}
		}
		
		$strJumpChoiceSQL = "SELECT * FROM WSSM_WIZ_QAC WHERE FK_QID = ".$arrSourceQuestionIDs[$j];
		$oJS = get_recordset($strJumpChoiceSQL,'swdata');
		$newdata = "";
		while($oJS->Fetch())
		{
			// get the source value of the Next Wizard (fk_nextwiz) as this determines the new values for the Next Wizard, (fk_nextwiz) Next Stage (fk_nextstage)
			// and next question (f_nextq)
			// 
			$sourceQACNextWiz =  get_field($oJS,'FK_NEXTWIZ');
			$boolChangeNextFields = ($sourceQACNextWiz == $strSourceWizardName) ? true : false;

			// -- Loop through table structure and make a copy of the record
			$arrData = "";
			while (list($strColName,$varColValue) = each($oJS->row))
			{
				switch (UC($strColName))
				{
					case "FK_QID" :
						$arrData["FK_QID"] = $arrNewQuestionIDs[$j];
						$newdata .= "strColName=" . $strColName . " - " . $arrData["FK_QID"];
						break;
						
					case "FK_NEXTWIZ" :
						if ($boolChangeNextFields) $arrData[$strColName] = $strNewWizardName;
						else $arrData[$strColName] = $varColValue;
						$newdata .= "strColName=" . $strColName . " - " . $arrData[$strColName];
						break;
					
					case "FK_NEXTSTAGE" :
						if ($boolChangeNextFields) $arrData[$strColName] = $arrMatchStageIDs[$varColValue];
						else $arrData[$strColName] = $varColValue;	
						$newdata .= "strColName=" . $strColName . " - " . $arrData[$strColName];
						break;
					
					case "FK_NEXTQ" :
						if ($boolChangeNextFields) $arrData[$strColName] = $arrMatchQuestionIDs[$varColValue];
						else $arrData[$strColName] = $varColValue;						
						$newdata .= "strColName=" . $strColName . " - " . $arrData[$strColName] . " - " . $varColValue;
						break;
					
					default :
						$arrData[$strColName] = $varColValue;
						$newdata .= "strColName=" . $strColName . " - " . $arrData[$strColName];
						break;
				}
	
				$newdata .= "\r\n";
			}
			$newdata = "";
			// -- Insert new record into WSSM_WIZ_QAC
			$strTable = "WSSM_WIZ_QAC";
			$arc = xmlmc_addRecord($strTable,$arrData);	
			if(1!=$arc)
			{
				throwError(100,$arc);
			}	
		} // Fetch all QAC (Jump On Answer) data	
	} // For each question in the current wizard stage
	throwSuccess();
?>