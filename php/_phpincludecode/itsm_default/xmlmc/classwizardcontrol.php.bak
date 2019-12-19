<?php

include_once('classdatabaseaccess.php');	//-- data base access class

class classWizardControl
{
	var $wizardname = "";
	var $defaultbinding = "updatedb.updatetxt";
	var $arrSteps = array();
	var $thisStep = false;
	var $boolEnd = false;
	var $boolSummary = false;

	function initialise($strWizardName)
	{
		$this->wizardname = $strWizardName;

		//-- connect
		$dbSwdata = database_connect("swdata");
		if(!$dbSwdata)
		{
			echo "Could not connect to DSN [".swdsn()."]. Please contact your Supportworks Administrator";
			return false;
		}

		//-- get wizard
		$strSelectWiz = "select * from wssm_wiz where pk_name = '".pfs($strWizardName)."'";
		$rsWiz = $dbSwdata->query($strSelectWiz,true);
		if(!$rsWiz)
		{
			echo "<center>Could not fetch wizard [".$strWizardName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//-- check if no wiz
		if($rsWiz->eof)
		{
			echo "<center>There is no wizard defined for [".$strWizardName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}
		
		$this->boolSummary = $rsWiz->f('flg_summary')==1;
		
		//-- store default binding for wizard
		if ( ($rsWiz->f('defaulttable')!="") && ($rsWiz->f('defaultcolumn')!="") )$this->defaultbinding = $rsWiz->f('defaulttable').".".$rsWiz->f('defaultcolumn');
	
		$strSelectSteps = "select * from wssm_wiz_stage where fk_wiz = '".pfs($strWizardName)."' order by sindex asc";
		$rsSteps = $dbSwdata->query($strSelectSteps,true);
		if(!$rsSteps)
		{
			echo "<center>Could not fetch wizard steps for [".$strWizardName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//-- check if no steps
		if($rsSteps->eof)
		{
			echo "<center>There are no steps defined for the wizard [".$strWizardName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//if first stage is end of wiz
		if($rsSteps->f('flg_endofwiz'))
			$this->boolEnd = true;
		//or if wizard only has one stage
		$rsSteps->movenext();
		if($rsSteps->eof)
			$this->boolEnd = true;

		$this->load_wizard_step($dbSwdata, $strWizardName, 1);
		
		$_SESSION['intCurrentPage'] = 1;

		//if this is the final stage, then check if the question jumps
		if($this->boolEnd)
		{
			if(isset($classWizardStep->boolJumps))
				$this->boolEnd = false;
		}

		$_SESSION['wizard_control'][$_SESSION['intCurrentPage']] = array('wizname'=>$strWizardName,'stageid'=>$this->thisStep->pk,'firstqid'=>$this->thisStep->firstqid);
		return true;
	}

	function load_wizard_step(&$dbSwdata, $strWizName, $intStepIndex, $intQuestionIndex="")
	{
		//-- create recordset
		$strSelectSteps = "select * from wssm_wiz_stage where fk_wiz = '".pfs($strWizName)."' and sindex>=".$intStepIndex." order by sindex asc";
		$rsSteps = $dbSwdata->query($strSelectSteps,true);
		if(!$rsSteps)
		{
			echo "<center>Could not fetch wizard steps for [".$strWizName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//-- check if no steps
		if($rsSteps->eof)
		{
			echo "<center>There are no steps defined for the wizard [".$strWizName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//-- create string of wizard steps
		$strSteps = "";
		$intPKId = $rsSteps->f('pk_auto_id');
		$strTitle = $rsSteps->f('title');
		if($strSteps !="")$strSteps .= ",";
		$strSteps .= $intPKId;

		//-- store step info	
		$this->thisStep = new classWizardStep;
		$this->thisStep->pk = $intPKId;
		$this->thisStep->title = $strTitle;
		$this->thisStep->description = $rsSteps->f('description');
		$this->thisStep->defaultbinding = $this->defaultbinding;
		$this->thisStep->wizard = $strWizName;
		$this->thisStep->eow = $rsSteps->f('flg_endofwiz');
		if(!$this->thisStep->eow)
			$this->thisStep->eow = $rsSteps->recordcount ==1;

		//-- get questions for step
		$strQsWhere = "";
		if(isset($intQuestionIndex))
		{
			if($intQuestionIndex>0)
				$strQsWhere = " and qindex>=".$intQuestionIndex." ";
		}
		$strSelectQs = "select * from wssm_wiz_q where fk_wiz_stage = ".$intPKId." ".$strQsWhere."order by qindex asc";
		$rsQs = $dbSwdata->query($strSelectQs,true);
		if(!$rsQs)
		{
			echo "<center>Could not fetch wizard step questions for [".$strWizName."-".$strTitle."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//-- check if no qs and is not end of wizard
		if(($rsQs->eof)&&($this->thisStep->eow!=1))
		{
			echo "<center>There are no questions defined for the wizard step [".$strWizName."-".$strTitle."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}
		$this->thisStep->firstqid = $rsQs->f("pk_qid");

		//-- store questions against step and find out sequence i.e. which ones jump
		if($this->thisStep->process_question_sequence($rsQs,$dbSwdata,$strWizName,$this)==false) return false;

		return true;
	}
	
	function output_title()
	{
		$strHTML = "";
		$strWizardName =$this->wizardname;

		//-- connect
		$dbSwdata = database_connect("swdata");
		if(!$dbSwdata)
		{
			echo "Could not connect to DSN [".swdsn()."]. Please contact your Supportworks Administrator";
			return false;
		}

		//-- get wizard
		$strSelectWiz = "select * from wssm_wiz where pk_name = '".pfs($strWizardName)."'";
		$rsWiz = $dbSwdata->query($strSelectWiz,true);
		if(!$rsWiz)
		{
			echo "<center>Could not fetch wizard [".$strWizardName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		//-- check if no wiz
		if($rsWiz->eof)
		{
			echo "<center>There is no wizard defined for [".$strWizardName."].<br/>Please contact your Supportworks Administrator</center>";
			return false;
		}

		$strHTML = "<div>";
		$strHTML .= "<div class='wiz_title'>".$rsWiz->f('title')."</div>";
		$strHTML .= "<div class='wiz_desc'>".$rsWiz->f('description')."</div><br/>";
		$strHTML .= "</div>";
		return $strHTML;
	}


/*	function create_prefixpage($strContent)
	{
		$strHTML = "<div id='wiz_prefix_page' name='wiz_page' stepid='wiz_prefix_page' wizard='".$this->wizard."' eow='0' class='wiz_page' style='display:block;'>";
		$strHTML .= "<br/>".$strContent."</div>";
		return $strHTML;
	}

	function create_postfixpage($strContent)
	{
		$strHTML = "<div id='wiz_postfix_page' name='wiz_page' stepid='wiz_postfix_page' wizard='".$this->wizard."' eow='1' class='wiz_page' style='display:none;'>";
		$strHTML .= "<br/>".$strContent."</div>";


		$strHTML = "</div><div id='wiz_postfix_page' name='wiz_page' stepid='wiz_postfix_page' wizard='".$this->wizard."' eow='1' class='wiz_page' style='display:none;'>";
		$strHTML .= "<br/>".$strContent."</div></div>";
		return $strHTML;
	}*/

	function create_additionalpage($strContent,$intPrefixType)
	{
		//var_dump(htmlentities($strContent));
		$strPageID = "wiz_postfix_page";
		$strStyle = "none";
		$strPosition = "POST";
		$seq = 2;
		if($intPrefixType==1)
		{
			$strPosition = "PRE";
			$strStyle = "block";
			$strPageID = "wiz_prefix_page";
			$seq = 1;
		}
		$strWizard = (isset($this->wizard)) ? $this->wizard : $this->wizardname;
		$strHTML = "<div id='wiz_additional_page' name='wiz_page' stepid='wiz_additional_page' wizard='".$strWizard."' eow='1' class='wiz_page' position='".$strPosition."' style='display:".$strStyle.";' seq='".$seq."'>";
		$strHTML .= "<br/>".$strContent."</div></div>";
		return $strHTML;
	}

	function output_pages($strAdditionalHtmlToAdd = "",$intPrefixType = 0)
	{
		$boolFirst=true;
		$strHTML = "";
		$boolFirst=$_SESSION['intCurrentPage']==1;
		//-- do we want to add additional html as a sperate page at start?
		if($boolFirst && $this->boolSummary)
		{
			$strHTML .= "<div id='wiz_summary_page' name='wiz_page' stepid='wiz_summary_page' wizard='".$this->wizard."' eow='1' class='wiz_page' position='".$strPosition."' style='display:none;' seq='3'>";
			$strHTML .= "<br/>".$strContent."</div>";
		}
		$strHTML .= $this->thisStep->create_pages($boolFirst,$strAdditionalHtmlToAdd, $intPrefixType);	
		if($boolFirst)$boolFirst=false;
		if($strAdditionalHtmlToAdd!="")
			$strHTML .=$this->create_additionalpage($strAdditionalHtmlToAdd,$intPrefixType);
	//	echo htmlentities($strHTML);
		//-- post fix an end page

		return $strHTML;
	}
	function output_page($strAdditionalHtmlToAdd = "",$intPrefixType = 0)
	{
		$boolFirst=true;
		$strHTML = "";
		$boolFirst=$_SESSION['intCurrentPage']==1;
		//-- do we want to add additional html as a sperate page at start?

		$strHTML .= $this->thisStep->create_page($boolFirst,$strAdditionalHtmlToAdd, $intPrefixType);	
	/*	if($boolFirst)$boolFirst=false;
		if($strAdditionalHtmlToAdd!="")
			$strHTML .=$this->create_additionalpage($strAdditionalHtmlToAdd,$intPrefixType);*/
	//	echo htmlentities($strHTML);
		//-- post fix an end page

		return $strHTML;
	}
}

class classWizardStep
{
	var $pk=0;
	var $title = "";
	var $description = "";
	var $rsqs=false;
	var $arrPages = Array();
	var $defaultbinding = "updatedb.updatetxt";
	var $wizard="";
	var $eow = 0;
	var $boolJumps = false;
	var $firstqid = 0;

	function process_question_sequence($in_rsQs,&$in_dbSwdata,$strWizName,&$parentClass)
	{
		//-- store record set 
		$this->rsqs = $in_rsQs;

		//-- loop through questions - find out which ones jump etc and make step pages (end of a page is where a question jumps out of sequence) or is end of rs
		$intPagePos = 1;
		$intPageQPos = 1;
		$this->arrPages[$intPagePos] = Array();
		while(!$in_rsQs->eof)
		{
			//-- store question in current page
			$this->arrPages[$intPagePos][$intPageQPos] = $in_rsQs->currentrow;
			$intPageQPos++;

			//-- if question jumps based on answer then we need a new page
			if($in_rsQs->f('flg_jumponanswer')=="1")
			{
				$this->boolJumps = true;
				$this->eow = false;
				return true;
			}
			$in_rsQs->movenext();
		}
		return true;
	}

	function create_pages($boolFirst, $strAdditionalHtmlToAdd = "", $intPrefixType = 0)
	{
		//-- generate html for wizard pages
		$strHTML = "";

		//-- page div
		if(($boolFirst)&&($intPrefixType==1))
			$strStyle = "style='display:none;'";
		else
			$strStyle = "style='display:block;'";

		$strHTML .= "<div id='wiz_question_page' name='wiz_page' wizard='".$this->wizard."' class='wiz_page' ".$strStyle.">";
		$strHTML .=$this->create_page($boolFirst, $strAdditionalHtmlToAdd, $intPrefixType);
		$strHTML .= "</div>";

		return $strHTML;
	}

	function create_page($boolFirst, $strAdditionalHtmlToAdd = "", $intPrefixType = 0)
	{
		//-- connect
		$connDB = database_connect("swdata");
		if(!$connDB)
		{
			return "Could not connect to DSN [".swdsn()."]. Please contact your Supportworks Administrator";
		}

		//--
		//-- generate html for wizard pages
		$strHTML = "";
		$arrPage = $this->arrPages[1];

		//-- page div
		if(($boolFirst)&&($intPrefixType==1))
		{
			$strStyle = "style='display:none;'";
		}
		else
		{
			$strStyle = "style='display:block;'";
		}

		if($this->eow)
			$strHTML .="<div id='eowizard'></div>";
		if($boolFirst)
			$strHTML .="<div id='sowizard'></div>";

		$strHTML .= "<div class='wiz_step_title'>".$this->title."</div>";
		$strHTML .= "<div class='wiz_step_desc'>".$this->description."</div><br/>";

		if(($intPrefixType==0) && ($boolFirst) && ($strAdditionalHtmlToAdd!=""))
		{
			$strHTML.=$strAdditionalHtmlToAdd;
		}
		$boolFirst=false;

		//-- start of a page - output questions
		$strHTML .= "<table width='99%'>";
		foreach($arrPage as $intQpos => $rsQrowpos) 
		{
			$this->rsqs->currentrow = $rsQrowpos;

			//-- hide question or not
			$strDisplay = ($this->rsqs->f('flg_hidden')=="1")?"style='display:none'":"";

			//-- use question binding setting
			if($this->rsqs->f('targetcolumn')!="")
			{
				$strUseBinding = $this->rsqs->f('targetcolumn');
			}
			else
			{
				$strUseBinding = $this->defaultbinding;
			}

			$intMandatory = $this->rsqs->f('flg_mandatory');
			$strClassQ = ($intMandatory=="1")?"wiz-q-mand":"wiz-q";

			//-- get datatype string or int
			$intType = swdti_getdatatype($strUseBinding);
			$strFieldType = (($intType==8||$intType==-1))?"STR":"NUM";

			if(substr($strUseBinding,0,3)=="ci_")
				$strFieldType="NUM";
			//-- F0086648
			if($strUseBinding=="opencall.equipment")
				$strFieldType="NUM";
			$strHTML .= "<tr ".$strDisplay."><td colspan=2 class='".$strClassQ."' id='wizq_".$this->rsqs->f('pk_qid')."'>".$this->rsqs->f('question')."</td></tr>";
			$strHTML .= "<tr ".$strDisplay."><td colspan=2 class='dataform-q'>".generate_question_input($this->rsqs,$strUseBinding, $strFieldType,$connDB)."</td></tr>";
		}

		//-- end of a page questions
		$strHTML .= "</table>";

		return $strHTML;
	}

}

//-- depending on question type output a set of questions
function generate_question_input(&$rsQs,$strDefaultBinding, $strFieldType,&$connDB)
{
	//-- prefix question to ans?
	$strPK = $rsQs->f('pk_qid');
	$boolPrefix = $rsQs->f('flg_prefixq')=="1";
	$strQuestion = $rsQs->f('question');
	$boolDR = false;
	$boolMulti = false;
	$boolHidden = $rsQs->f('flg_hidden')=="1";

	if($rsQs->f('flg_jumponanswer')=="1")
	{
		//-- get answer checks
		$strQAC = "select * from wssm_wiz_qac where fk_qid = ".$rsQs->f('pk_qid');
		$rsQACs = $connDB->query($strQAC,true);
		if(!$rsQACs)
		{
			return "<center>Could not fetch answer checks for question [".$rsQs->f('question')."].<br/>Please contact your Supportworks Administrator</center>";
		}

		//-- construct check string
		$strValueChecks = "";
		while(!$rsQACs->eof)
		{

			if($strValueChecks != "")$strValueChecks .= "||";

			$strValueFuncCheck = $rsQACs->f('check_value_func');
			if($strValueFuncCheck=="")$strValueFuncCheck="^";//-- if we dont have a check - i.e. any value can jump

			$strValueChecks .= $rsQACs->f('flg_jscheck') . "|" . $strValueFuncCheck  . "|" . $rsQACs->f('fk_nextwiz'). "|" . $rsQACs->f('fk_nextstage') . "|" . $rsQACs->f('fk_nextq');
			$rsQACs->movenext();
		}

	}

	$strHTML ="Unknown form input type. Please contact your administrator.";
	switch(strtolower($rsQs->f('type')))
	{
		case 'custom picker':
			$strHTML = create_custompicker($rsQs,$connDB,$strDefaultBinding,$strFieldType,$strValueChecks);
			break;
		case 'textbox':
			$strHTML = create_textbox($rsQs,$strDefaultBinding,$strValueChecks);
			break;
		case 'multiline':
			$strHTML = create_multiline($rsQs,$strDefaultBinding,$strValueChecks);
			break;
		case 'date':
			$strHTML = create_datebox($rsQs,$strDefaultBinding, $strFieldType,$strValueChecks);	
			break;
		case 'date range':
			$strHTML = create_daterange($rsQs,$strDefaultBinding, $strFieldType,$strValueChecks);	
			$boolDR = true;
			break;
		case 'radiobox':
			$strHTML = create_radiobox($rsQs,$connDB,$strDefaultBinding,$strValueChecks);	
			$boolMulti = true;
			break;
		case 'checkbox':
			$strHTML = create_checkbox($rsQs,$connDB,$strDefaultBinding,$strValueChecks);	
			$boolMulti = true;
			break;
		case 'selectbox':
			$strHTML = create_selectbox($rsQs,$connDB,$strDefaultBinding,$strValueChecks,false);	
			break;
		case 'multiselectbox':
			$strHTML = create_selectbox($rsQs,$connDB,$strDefaultBinding,$strValueChecks,true);	
			$boolMulti = true;
			break;
        case 'option selector':
            $strHTML = create_option_picker($rsQs,$connDB,$strDefaultBinding,$strValueChecks);
			$boolMulti = true;
		    break;
	}
	$_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK] = array($strDefaultBinding,"","",$strQuestion,$boolPrefix,$boolDR,$boolMulti,$boolHidden);
	/*echo "<pre>";
	var_dump($_SESSION['wizard_input']);
	echo "</pre>";*/

	//--
	return $strHTML;
}

// -- PM00122457 - ES - Return maxDataSize (Maximum Data Size) for a table column
function getColumnMaxDataSize($strBinding)
{
	if($strBinding!="")
	{
		// -- Get the _table and _columnname
		$arrBinding = explode('.',$strBinding);
		$strTable = $arrBinding[0];
		$strColumn = $arrBinding[1];
		$strDatabase = "swdata";

		// -- Invoke XmlMethodCall for data::getColumnInfoList to grab maxDataSize
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("database",$strDatabase);
		$xmlmc->SetParam("table",$strTable);

		if($xmlmc->Invoke("data","getColumnInfoList"))
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
			$xmlMD = $arrDM[0];
			$maxDataSize = "";

			if($xmlMD)
			{
				$children = $xmlMD->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$xmlmcOutputParam = $colNode->tagname();
						// -- Return the value of MaxDataSize for $strColumn, in columnInfo
						if($xmlmcOutputParam == "columnInfo")
						{
							$xmlColumnName = _getxml_childnode_content($colNode,"name");
							if($xmlColumnName == $strColumn)
							{
								// -- Return the value of MaxDataSize
								$maxDataSize = _getxml_childnode_content($colNode,"maxDataSize");
								return $maxDataSize;
							}
						}
					}
				}
			}
		}
		else
		{
			$strErrorMessage = $xmlmc->GetLastError();
			echo $strErrorMessage;
			exit;
		}
	}
	else return "";
}

function create_textbox(&$rsQs,$strBinding,$strValueChecks)
{
	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	//var_dump($_SESSION['intCurrentPage']);
	//var_dump($_SESSION['wizard_input']);
	//var_dump($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK]);
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827
	
	// -- PM00122457 - START - Return maxDataSize to use for maxlength property of the HTML tag
	$intMaxDataSize = getColumnMaxDataSize($strBinding);
	if($intMaxDataSize!="") $strAppendMaxLength = "maxlength = '".$intMaxDataSize."'";
	else if ($intMaxDataSize=="") $strAppendMaxLength = "";
	// -- PM00122457 - END
	
	$strHTML = "<input qid='".$rsQs->f('pk_qid')."' validation='".$rsQs->f('validation_type')."' checkvalues=\"".$strValueChecks."\" prefixq='".$strPrefixQ."' id='".$strBinding."' jumpto='".$rsQs->f('flg_jumponanswer')."' attname='item_wiz_data' name='item_wiz_data' mandatory='".$intMandatory."' $classMan style='width:70%;' onkeypress='handleWizardKeyPress(event,this.form)' type='text' value='".$strDefaultValue."' ".$strAppendMaxLength." >";
	return $strHTML;
}

function create_multiline(&$rsQs,$strBinding,$strValueChecks)
{

	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827
	
	// -- PM00122457 - START - Return maxDataSize to use for maxlength property of the HTML tag
	$intMaxDataSize = getColumnMaxDataSize($strBinding);
	if($intMaxDataSize!="") $strAppendMaxLength = "maxlength = '".$intMaxDataSize."' onkeyup = testLength(this,".$intMaxDataSize.")";
	else if ($intMaxDataSize=="") $strAppendMaxLength = "";
	// -- PM00122457 - END	

	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$strHTML = "<textarea qid='".$rsQs->f('pk_qid')."' validation='".$rsQs->f('validation_type')."' checkvalues=\"".$strValueChecks."\" prefixq='".$strPrefixQ."' id='".$strBinding."' attname='item_wiz_data' name='item_wiz_data' jumpto='".$rsQs->f('flg_jumponanswer')."' mandatory='".$intMandatory."' $classMan style='width:70%;height:100px;' type='text' ".$strAppendMaxLength." >".$strDefaultValue."</textarea>";
	return $strHTML;
}

function create_datebox(&$rsQs,$strBinding,$strFieldType,$strValueChecks)
{
	$strBinding = str_replace('.','_',$strBinding);
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827

	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$strHTML = "<input id='date_".$rsQs->f('pk_qid')."' qid='".$rsQs->f('pk_qid')."'   validation='".$rsQs->f('validation_type')."' checkvalues=\"".$strValueChecks."\"  prefixq='".$strPrefixQ."' bind='".$strBinding."'  attname='item_wiz_data' name='item_wiz_data'  jumpto='".$rsQs->f('flg_jumponanswer')."'   mandatory='".$intMandatory."'  $classMan ftype='".$strFieldType."' readonly style='width:133px;' class='input-date' maxlength='10' type='text' value='".$strDefaultValue."' >";
	return $strHTML;

}

function create_daterange(&$rsQs,$strBinding,$strFieldType,$strValueChecks)
{
	$strBinding = str_replace('.','_',$strBinding);
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	//plus change the value below to use local variable default value
	if($strDefaultValue!="")
		$arrDefaultValues = explode(" - ", $strDefaultValue);
	//EOF F0103827
	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$strHTML = "<input  qid='".$rsQs->f('pk_qid')."'  validation='".$rsQs->f('validation_type')."'  checkvalues=\"".$strValueChecks."\"  prefixq='".$strPrefixQ."' id='daterange_".$rsQs->f('pk_qid')."' bind='".$strBinding."'  attname='item_wiz_data' name='item_wiz_data_".$rsQs->f('pk_qid')."'  jumpto='".$rsQs->f('flg_jumponanswer')."'  mandatory='".$intMandatory."' $classMan 		 ftype='".$strFieldType."' readonly style='width:133px;' class='input-date' maxlength='10' type='date_range' value='".$arrDefaultValues[0]."'> and <input id='daterange_".$rsQs->f('pk_qid')."__1' bind='".$strBinding."' attname='item_wiz_data' name='item_wiz_data_".$rsQs->f('pk_qid')."'  $classMan readonly style='width:133px;' class='input-date' ftype='".$strFieldType."' maxlength='10' type='date_range' value='".$arrDefaultValues[1]."' >";
	return $strHTML;
}


function create_selectbox(&$rsQs,&$connDB,$strBinding,$strValueChecks,$boolMulti)
{
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	$strMultiple = ($boolMulti)?"multiple='multiple' size='8'":"";


	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827

	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$strHTML = "<select  qid='".$rsQs->f('pk_qid')."' ".$strMultiple." validation='".$rsQs->f('validation_type')."'  checkvalues=\"".$strValueChecks."\"  prefixq='".$strPrefixQ."' id='".$strBinding."'  attname='item_wiz_data' name='item_wiz_data'  jumpto='".$rsQs->f('flg_jumponanswer')."'  mandatory='".$intMandatory."'  $classMan style='width:70%;' type='text' >";
	
	//-- PM00139048
	//-- if($rsQs->f('flg_mandatory')!="1")
	//-- {
	$strHTML .= "<option value=''></option>";			
	//-- } EOF PM00139048

	//--
	//-- get db list
	if($rsQs->f('dbtable')!="" && $rsQs->f('keycol') !="" && $rsQs->f('txtcol') !="")
	{
		$strWhere=($rsQs->f('filter')!="")?$rsQs->f('filter'):"";
		if($strWhere!="")$strWhere = " where " . parse_context_vars($strWhere);

		$strSelectChoicesDB = "select ". $rsQs->f('keycol')." as keyval, ".$rsQs->f('txtcol')." as txtval from ".$rsQs->f('dbtable')." ". $strWhere;
		$rsChoices= $connDB->Query($strSelectChoicesDB,true);
		while (!$rsChoices->eof)
		{
			$strSelected = ($strDefaultValue==$rsChoices->f('keyval'))?"selected":"";
			$choiceID = $rsQs->f('pk_qid')."_".$rsChoices->f('keyval');
			$strHTML .= "<option id='".$choiceID."' $strSelected value='".$rsChoices->f('keyval')."'>".$rsChoices->f('txtval')."</option>";
			$rsChoices->movenext();
		}

	}

	//-- then append any additional choices
	$strSelectChoicesm = "select * from wssm_wiz_qc where fk_qid = " . $rsQs->f('pk_qid') . " order by cindex asc";
	$rsChoices= $connDB->Query($strSelectChoicesm,true);
	while (!$rsChoices->eof)
	{
		$strSelected = ($strDefaultValue==$rsChoices->f('cvalue'))?"selected":"";
		$choiceID = $rsQs->f('pk_qid')."_".$rsChoices->f('pk_qcid');

		$strHTML .= "<option id='".$choiceID."' $strSelected value='".$rsChoices->f('cvalue')."'>".utf8_decode($rsChoices->f('ctext'))."</option>";
		$rsChoices->movenext();
	}
	$strHTML .= "</select>";
	return $strHTML;
}

function create_radiobox(&$rsQs,&$connDB,$strBinding,$strValueChecks)
{
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";
	
	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//--F0089012 add table formatting so radio is vertically aligned in firefox
	$strHTML = "<table>";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	$arrDefaultValues = explode("|",$strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827

	//-- connect and get question choices
	$strSelectChoicesm = "select * from wssm_wiz_qc where fk_qid = " . $rsQs->f('pk_qid') . " order by cindex asc";
	$rsChoices= $connDB->Query($strSelectChoicesm,true);
	while (!$rsChoices->eof)
	{
		$strHTML .= "<tr><td>";
		$strSelected = in_array($rsChoices->f('cvalue'),$arrDefaultValues)?"checked":"";
		$choiceID = $rsQs->f('pk_qid')."_".$rsChoices->f('pk_qcid');
		$strHTML .= "<input  qid='".$rsQs->f('pk_qid')."'  validation='".$rsQs->f('validation_type')."'   checkvalues=\"".$strValueChecks."\"  prefixq='".$strPrefixQ."' bind='".$strBinding."'  jumpto='".$rsQs->f('flg_jumponanswer')."'  attname='item_wiz_data'   name='item_wiz_data_".$rsQs->f('pk_qid')."' id='".$choiceID."'  mandatory='".$intMandatory."' $strSelected type='radio' class='radio' value='".$rsChoices->f('cvalue')."' ><label for='".$choiceID."' style='cursor:pointer'>".utf8_decode($rsChoices->f('ctext'))."</label></br>";
		$strHTML .= "</td></tr>";
		$rsChoices->movenext();
	}
	$strHTML .= "</table>";
	return $strHTML;
}

function create_checkbox(&$rsQs,&$connDB,$strBinding,$strValueChecks)
{
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	$arrDefaultValues = explode("|",$strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827
	

	//-- connect and get question choices
	$strSelectChoicesm = "select * from wssm_wiz_qc where fk_qid = " . $rsQs->f('pk_qid') . " order by cindex asc";
	$rsChoices= $connDB->Query($strSelectChoicesm,true);
	while (!$rsChoices->eof)
	{
		$strSelected = in_array($rsChoices->f('cvalue'),$arrDefaultValues)?"checked":"";
		$choiceID = $rsQs->f('pk_qid')."_".$rsChoices->f('pk_qcid');
		$strHTML .= "<input  qid='".$rsQs->f('pk_qid')."'  validation='".$rsQs->f('validation_type')."'  checkvalues=\"".$strValueChecks."\"   prefixq='".$strPrefixQ."' bind='".$strBinding."'  jumpto='".$rsQs->f('flg_jumponanswer')."' attname='item_wiz_data' name='item_wiz_data_".$rsQs->f('pk_qid')."'  id='".$choiceID."'  mandatory='".$intMandatory."'  $strSelected type='checkbox' class='radio' value='".$rsChoices->f('cvalue')."' ><label for='".$choiceID."' style='cursor:pointer'>".utf8_decode($rsChoices->f('ctext'))."</label></br>";
		$rsChoices->movenext();
	}
	return $strHTML;
}


function create_custompicker(&$rsQs,&$connDB,$strBinding,$strFieldType,$strValueChecks)
{
	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";

	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	//plus change the value below to use local variable default value
	//EOF F0103827

	//-- prefix question to ans?
	$strPrefixQ = ($rsQs->f('flg_prefixq')=="1")?$rsQs->xf('question'):"";
	$strType = "text";
	$strCustHTML = "";
	if ($rsQs->f('pickername')=="Profile Code" || $rsQs->f('pickername')=="Category")
	{
		$strType = "hidden";
		$strCustHTML = problem_profile_picker_html($strDefaultValue,$strBinding,$connDB);
		//###20140514 clean out square brackets in case [FIXD]-OPTN was used
		$strDefaultValue = str_replace(array('[',']'),'', $strDefaultValue);
	}
	elseif ($rsQs->f('pickername')=="Configuration Items")
	{
		$strCustHTML = "";
		$dbvalue = "";
		$strDefaultDisplay = "";
		$strType = "hidden";
		if($strDefaultValue!="")
		{
			$strSelect = "select pk_auto_id,description from config_itemi where pk_auto_id in (".$strDefaultValue.")";
			$rsCIs = $connDB->query($strSelect,true);
			if(!$rsCIs)
			{
				$strCustHTML = "<center>Could not fetch display value of CIs.<br/>Please contact your Supportworks Administrator</center>";
				$dbvalue =$strDefaultValue;
			}
			else
			{
				while(!$rsCIs->eof)
				{
					$dbvalue = $rsCIs->f("pk_auto_id");
					$strDefaultDisplay = $rsCIs->f("description");
					$rsCIs->movenext();
				}
			}
		}
		$strCustHTML .= ci_picker_html($strBinding,$rsQs->f('pk_qid'),$dbvalue,$strDefaultDisplay);
	}
	elseif ($rsQs->f('pickername')=="Customer Organisations")
	{
		$strCustHTML = "";
		$dbvalue = "";
		$strDefaultDisplay = "";
		$strType = "hidden";
		list($strDefaultValue,$strCustHTML) = org_picker_html($rsQs,$connDB, $strBinding,$rsQs->f('pk_qid'),$dbvalue,$strDefaultDisplay,false);
	}
	elseif ($rsQs->f('pickername')=="All Organisations")
	{
		$strCustHTML = "";
		$dbvalue = "";
		$strDefaultDisplay = "";
		$strType = "hidden";
		list($strDefaultValue,$strCustHTML) = org_picker_html($rsQs,$connDB, $strBinding,$rsQs->f('pk_qid'),$dbvalue,$strDefaultDisplay,true);
	}
	$strHTML = "<input qid='".$rsQs->f('pk_qid')."' ftype='".$strFieldType."' readonly onmousedown='wiz_custom_picker(this);' pickername='".$rsQs->f('pickername')."' validation='".$rsQs->f('validation_type')."' checkvalues=\"".$strValueChecks."\" prefixq='".$strPrefixQ."' id='".$strBinding."' jumpto='".$rsQs->f('flg_jumponanswer')."'  attname='item_wiz_data'  name='item_wiz_data'   mandatory='".$intMandatory."' $classMan style='width:70%;' type='".$strType."' value='".$strDefaultValue."' />";
	$strHTML .=$strCustHTML;
	return $strHTML;

}

//###20120724
function org_picker_html(&$rsQs,&$connDB, $strBinding,$qid,$dbvalue = "",$strDefaultValue="", $boolAll = true)
{

	if($dbvalue=="")$dbvalue = "dbvalue='".$dbvalue."'";
	if($strBinding=="")$strBinding="opencall.fk_company_id";
	if($strDefaultValue=="")$strDefaultValue = $_SESSION['userdb_fk_company_id'];
	$strHTML = '<select id="'.$qid.'__'.$strBinding.'" onchange="dropdown_company_selected(this, \'' . $strBinding . '\');" >';
	if("1" == $rsQs->f('flg_mandatory'))
	{
		$strDefaultValue = "";
		$strHTML .= "<option selected value=''></option>";			
	//	$strHTML .= "<option value=''></option>";			
	}
	if ($boolAll)
		$strSelectCompanies = "select pk_company_id, companyname from company order by companyname asc";
	else
		$strSelectCompanies = "select company.pk_company_id, company.companyname from company join userdb_company on userdb_company.fk_org_id = company.pk_company_id where userdb_company.fk_user_id = '".pfs($_SESSION['userdb_keysearch'])."' order by company.companyname asc";
	$rsChoices= $connDB->Query($strSelectCompanies,true);
	$i = 0;
	$strSelected = "";
	$strDefaultDisplay = "";
	while (!$rsChoices->eof)
	{
		if($strDefaultValue==$rsChoices->f('pk_company_id')){
			$strSelected = "selected";
			$strDefaultDisplay = $rsChoices->f('companyname');
		} else $strSelected = "";
		$i++;
		$strHTML .= "<option $strSelected value='".$rsChoices->f('pk_company_id')."'>".$rsChoices->f('companyname')."</option>";
		$rsChoices->movenext();
	}
	$strHTML .= "</select>";
	if (1 == $i) $strHTML = str_replace("<select id","<select disabled='disabled' id",$strHTML);
	if ('opencall.fk_company_id'==$strBinding) $strHTML .= "<div id='wizq_company' style='display: none;' /><input type='hidden' qid='company' targetelevalue='opencall.companyname' name='item_wiz_data'  validation='' attname='item_wiz_data' id='opencall.companyname' value='".$strDefaultDisplay."' />";
	return array($strDefaultValue,$strHTML);
}


//--
//-- out of box custom pickers
function ci_picker_html($strBinding,$qid,$dbvalue = "",$strDefaultDisplay="")
{
	if($dbvalue=="")$dbvalue = "dbvalue='".$dbvalue."'";
	if($strBinding=="")$strBinding="opencall.equipment";
	$strHTML = "<a href='javascript:wiz_custom_picker(\"".$qid."\",document);'>Request item</a> : ";
	$strHTML.= "<span id='ci_selector' seltype='ci' qid='".$qid."' ocfield='".$strBinding."' $dbvalue>".$strDefaultDisplay."</span></p>";

	return $strHTML;
}


//-- problem profile picker
function problem_profile_picker_html($strProfileCode,$strBinding,&$swDB)
{
	if($strBinding=="")$strBinding="opencall.probcode";
	//###20140514 inclusion of blocklevel
	$intBlockLevel = 0;
	if($strProfileCode!=""){
		//###20140514 clean out square brackets in case [FIXD]-OPTN was used
		if ('['==$strProfileCode[0]){
			$aGroups = explode("]",$strProfileCode);
			// first group should hold BLOCK level
			$intBlockLevel = count(explode("-",trim($aGroups[0])));
			// second group should hold remainder (current level) - gets calculated below
		}
		//clean up profile code
		$strProfileCode = str_replace(array('[',']'),'', $strProfileCode);
		$strProfileText = FormatProblemCode($strProfileCode,$swDB);
	}
	
	$strHTML = $strProfileQ.'<p><span id="span_profilecodedesc">'.$strProfileText.'</span>&nbsp';
	
	//-- split strProfileCode
	if($strProfileCode!="")
	{
			$arrCodes = explode("-",$strProfileCode);
			$intCodeLen = count($arrCodes);
			$strParentCode = ($intCodeLen==0)?"ROOT":$arrCodes[$intCodeLen-1];
	}
	else
	{
			$intCodeLen = 0;
			$strParentCode = "ROOT";
	}
	
	//-- F0099873
	//###20140514 inclusion of blocklevel
	$strHTML .= '<select id="lb_probcode" blocklevel="'.$intBlockLevel.'" currlevel="'.$intCodeLen.'" targetelevalue="'.$strBinding.'" onchange="dropdown_profile_code_selected(this,true);update_wiz_profile(this);">';
	$strHTML .=	'	<option value="">-----Please Select-----</option>';

	//###20140514 IF current level LARGER than the level where it is blocked, allow backtrack
	if($intCodeLen>$intBlockLevel)
	{
		$strHTML .=	'<option value="gobacklevel"><-- Go back a level</option>';
	}

	//-- Build query. If we have a parent category we use it and if not, we don't.
	$gl_query = "SELECT * FROM probcode WHERE levelx = ". $intCodeLen . " and parentcode='".$strParentCode."'";
	//-- 107052
	$gl_query .= " order by descx asc";
	$rsCodes = $swDB->Query($gl_query,true);
	if($rsCodes)
	{
		while(!$rsCodes->eof)
		{  
			$strHTML .= '<option value="'. $rsCodes->f('code').'">'.$rsCodes->f('descx').'</option>';
			$rsCodes->movenext();
		}//end while records returned
	}//end if query is successful
	$strHTML .= '</select> </p> </span></p>';

	return $strHTML;
}


function create_option_picker(&$rsQs,$connDB,$strBinding,$strValueChecks)
{
	$classMan = ($rsQs->f('flg_mandatory')=="1")?"":"";
	$intMandatory = $rsQs->f('flg_mandatory');
	if($rsQs->f('flg_hidden')=="1")$intMandatory="0";
	
	//F0103827 - get current value from session
	$strPK = $rsQs->f('pk_qid');
	$strDefaultValue = $rsQs->f('defaultvalue');
	if(isset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]))
	{
		$strDefaultValue = $_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1];
		unset($_SESSION['wizard_input'][$_SESSION['intCurrentPage']][$strPK][1]);
	}
	else
		$strDefaultValue = parse_context_vars($strDefaultValue);
	$arrDefaultValues = explode("|",$strDefaultValue);
	$strDefaultValue="";

	foreach($arrDefaultValues as $strVal)
	{
		if($strVal!="")
		{
			if($strDefaultValue!="")
				$strDefaultValue .= "<span>, </span>";
			$strDefaultValue .= "<span>".$strVal."</span>";
		}
	}
	//plus change the value below to use local variable default value
	//EOF F0103827

	//-- get db list of primary applications
	if($rsQs->f('dbtable')!="" && $rsQs->f('keycol') !="" )
	{
		$strLabel = $rsQs->xf('prim_lbl');
		if($strLabel=="")
			$strLabel = $rsQs->xf('question');
		$strHTML .= '<div id="tab_holder" >';
		$strHTML .= '<div class="tab_wrapper">';
		$strHTML .= '<div id="tab_items" class="tabs">';
		$strHTML .= '<ul id="tabdata_tabs">';
		$strHTML .= '<li id="options_'.$rsQs->f('pk_qid').'" class="current" onclick="if(app.selecttab){app.selecttab(this,\'\',document);}else{selecttab(this,\'\',document);};app_setup(this);" addpath="" phpcontent="php/xmlhttp/getoptions.php?in_qid='.$rsQs->f('pk_qid').'" contenttype="php" url="" vars="" apps="" tabcontrol="catalog_customerrequests">';
		$strHTML .= '<span >';
		$strHTML .= '<a href="#">'.$strLabel.'</a>';
		$strHTML .= '</span>';
		$strHTML .= '</li>';
		$strHTML .= '</ul>';
		$strHTML .= '</div>';
		$strHTML .= '</div>';
		$strHTML .= '<div id="tab_contentholder" class="panel_wrapper" style="height:;width:;">';

		$strSQL = " ". $rsQs->f('keycol')." as keyval ";
		$txtCol = $rsQs->f('txtcol');
		if($txtCol!="")
			$strSQL .= ",".$txtCol." as txtval";
		else
			$strSQL .= ",".$rsQs->f('keycol')." as txtval";

		$prim_extdet = $rsQs->f('prim_extdet');
		if($prim_extdet!="")
			$strSQL .=",".$prim_extdet." as extdet";


		$strWhere=($rsQs->f('filter')!="")?$rsQs->f('filter'):"";
		if($strWhere!="")$strWhere = " where " . parse_context_vars($strWhere);

		$strSelectChoicesDB = "select ".$strSQL."  from ".$rsQs->f('dbtable')." ". $strWhere;
		$rsChoices= $connDB->Query($strSelectChoicesDB,true);
		if($rsChoices)
		{
			$strApps = "";
			$intCount = 5;
			while (!$rsChoices->eof)
			{
				$strKeyVal = $rsChoices->f('keyval');
				if($strKeyVal=="")
				{
					$rsChoices->movenext();
					continue;
				}
				$strSelected = in_array($strKeyVal,$arrDefaultValues)?"checked":"";
				$choiceID = $rsQs->f('pk_qid')."_".$strKeyVal;
				$strApps .= "<a href='#'  validation='".$rsQs->f('validation_type')."'  checkvalues=\"".$strValueChecks."\"   prefixq='".$strPrefixQ."' bind='".$strBinding."'  jumpto='".$rsQs->f('flg_jumponanswer')."' value='".$strKeyVal."' onclick='select_application(this,".$rsQs->f('pk_qid').");' >".$rsChoices->f('txtval')."</a>";
				if($prim_extdet!="")
				{
					$strExtDetails = $rsChoices->f('extdet');
					if($strExtDetails!="")
						$strApps .= " - ".$strExtDetails;
				}
				$strApps .= "<br>";
				$intCount--;
				$rsChoices->movenext();
			}

			if($strApps!="")
			{
				$strHTML .= $strApps;
				for($i=0; $i<$intCount;$i++)
					$strHTML .= "<br>";
			}
			else
				$strHTML .='No records to display.<br>';

			$strHTML .="</div>";
			$strHTML .="</div>";
			$strHTML .= "Selections :<br><span  qid='".$rsQs->f('pk_qid')."'  validation='".$rsQs->f('validation_type')."'  checkvalues=\"".$strValueChecks."\"              prefixq='".$strPrefixQ."' id='".$strBinding."'  attname='item_wiz_data' name='item_wiz_data'  jumpto='".$rsQs->f('flg_jumponanswer')."'   mandatory='".$intMandatory."' $classMan  style='width:100%;height:100px;' type='span' appholder='true' >".$strDefaultValue."</span><br><br>";
		}
		else
		{
			$strHTML .='Unable to load primary options.<br>';
		}
	}
     return $strHTML;
}


?>