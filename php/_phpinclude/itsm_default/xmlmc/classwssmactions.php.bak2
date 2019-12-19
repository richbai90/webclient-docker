<?php

class classWSSMActions
{

	var $xmlMethodCall = null;
	var $xmlMethodAction = null;
	var $additionValues = array();

//data::update opencall table
//selfservice::updateCallDiaryItem
//customerGetCallList
//customerGetCallDetails
//customerLogNewCall
//customerUpdateCall

	function StartCallUpdate($callref,$description, $timespent=5, $udsource = "Selfservice Portal",$udcode = "General Update",$udtype="1",$escalation)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$xmlmc->SetParam("timeSpent",$timespent);
		$xmlmc->SetParam("description",$description);

		$xmlmc->SetParam("updateSource",$udsource);
		$xmlmc->SetParam("updateCode",$udcode);
		if($escalation)
		{
			$xmlmc->paramsxml .="<extraUpdateDbValues><wss_escalation>".pfx($escalation)."</wss_escalation></extraUpdateDbValues>";
			$xmlmc->debugparamsxml .="      <extraUpdateDbValues><wss_escalation>".pfx($escalation)."</wss_escalation></extraUpdateDbValues>\r\n";
		}
		$this->xmlMethodCall = $xmlmc;
		return true;
	}

	function addFileAttachment()
	{

	}

	function StartCallValuesUpdate($callref)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);
		$this->xmlMethodCall = $xmlmc;
	}

	function sendtextfield($strField, $strValue)
	{
		$xmlmc = $this->xmlMethodCall;
		$xmlmc->SetValue($strField,$strValue);
		$this->xmlMethodCall = $xmlmc;
	}

	function sendcomplextype($strTable, $strColumn, $strValue)
	{
		$xmlmc = $this->xmlMethodCall;
		if(!isset($this->additionValues[$strTable]))
			$this->additionValues[$strTable] = array();
		$this->additionValues[$strTable][$strColumn] = $strValue;
		$this->xmlMethodCall = $xmlmc;
	}

	function CommitCallAction($strAction, $strService = "selfservice")
	{
		$xmlmc = $this->xmlMethodCall;
		if(count($this->additionValues)>0)
		{
			$strAdditionalCallValues = "";
			$strOCExtra = "";
			foreach($this->additionValues['opencall'] as $colName => $field)
			{
				$strOCExtra .="<".$colName.">".pfx($field)."</".$colName.">";
			}
			unset($this->additionValues['opencall']);
			if($strOCExtra!="")
			{
				$strAdditionalCallValues = "<opencall>".$strOCExtra."</opencall>";
			}
			
			foreach($this->additionValues as $tableName => $arrTable)
			{
				$boolVal = false;
				foreach($arrTable as $colName => $colValue)
				{
					$strAdditionalCallValues .= "<".$tableName.">";
					$strAdditionalCallValues .="<".$colName.">".pfx($colValue)."</".$colName.">";
					$boolVal = true;
				}
				if($boolVal)
				{
					$strAdditionalCallValues .= "</".$tableName.">";
				}
			}
			if($strAdditionalCallValues!="")
			{
					$xmlmc->SetComplexParam("additionalCallValues",$strAdditionalCallValues);
			}
		}
		$this->additionValues = array();
		if($xmlmc->Invoke($strService,$strAction,$_SESSION['server_name']))
		{		
			$this->xmlMethodCall = null;
			return true;
		}
		else
		{
			return false;
		}
	}
	function sendfile($fullpathname,$file_name,$mimeType="")
	{
		$xmlmc = $this->xmlMethodCall;
		$strFile = file_get_contents($fullpathname);
		$strB64File = base64_encode($strFile);

		$strEmbbededFile ="";
		if($file_name!="")
		{
			$strEmbbededFile = "<fileName>".pfx($file_name)."</fileName><fileData>".$strB64File."</fileData>";
			if($mimeType!="")
				$strEmbbededFile .= "<mimeType>".$mimeType."</mimeType>";
		
		}
		if($strEmbbededFile!="")
		{
			$xmlmc->SetComplexParam("fileAttachment",$strEmbbededFile);
			$this->xmlMethodCall = $xmlmc;
			return true;
		}
		return false;
	}


	function BPM_UpdateLastAction($callref, $actiontype, $actionbytype, $actionresult, $actionbyid,$boolRunVpme)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("callref",$callref);

		$strTable = "opencall";
		if(!isset($this->additionValues[$strTable]))
			$this->additionValues[$strTable] = array();
		$this->additionValues[$strTable]['actionVerb'] = 'BPM';
		$this->additionValues[$strTable]['bpm_laction'] = $actiontype;
		$this->additionValues[$strTable]['bpm_lactionbytype'] = $actionbytype;
		$this->additionValues[$strTable]['bpm_lactionres'] = $actionresult;
		$this->additionValues[$strTable]['bpm_lactionbyid'] = $actionbyid;
		$this->additionValues[$strTable]['bpm_execvpme'] = $boolRunVpme;

		$this->xmlMethodCall = $xmlmc;
		$this->xmlMethodAction = "customerUpdateCall";
		return $this->CommitCallAction("customerUpdateCallValues");
	}

}

?>