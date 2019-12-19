<?php
	$strOtherInputs = "";
	$strHTML = "";
	
	$filepath = _get_file_loc($filepath);
	if (!$settingDom = domxml_open_file($filepath))
	{
		echo "Error while parsing the settings document.";
		exit;
	}

	$setting = $settingDom->document_element();
	if(!$setting)
	{
		echo "The application xml is not defined correctly.";
		exit;
	}

	$strOtherInputs .="<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Filter By</span></span></div>
			   <table width='100%'>";

	$strWhere = "";
	$navXmlDef = $setting->get_elements_by_tagname("searchvalues");
	$dfValues = $navXmlDef[0];
	if($dfValues)
	{
		$children = $dfValues->child_nodes();
		$dTotal = count($children);
		for ($i=0;$i<$dTotal;$i++)
		{
			$colNode = $children[$i];
			if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
			{
				$boolChecked = false;
				$strColName = $colNode->tagname();
				$strType = $colNode->get_attribute("type");
				$strTitle = $colNode->get_attribute("title");

				//check if we already have a value, if not get default from xml
				if(isset($_POST[$strColName]))
				{
					$strValue = $_POST[$strColName];
				}
				else
				{
					$strValue = $colNode->get_content();
				}

				//where to parse the string
				$strParse = $colNode->get_attribute("noparse");
				if($strParse!="1")
					$strValue = _swm_parse_string($strValue);
				
				//if we have a value, add to where
				if($strValue!="")
				{
					if($strWhere!="")
						$strWhere .= " AND ";
						if(strtolower($strType)=="checkbox")
						{
							$boolChecked = $strValue;
							$strValue = $colNode->get_attribute("filter");
							$strWhere .= $strColName . " = '"._swm_db_pfs($strValue)."'";
						}
						else
							$strWhere .= $strColName . " like '%"._swm_db_pfs($strValue)."%'";
				}

				if(strtolower($strType)=="checkbox")
				{
					$boolChecked = $strValue;
					$strValue = $colNode->get_attribute("filter");
				}

				//get input html
				switch(strtolower($strType))
				{
					case 'textbox':
						$strOtherInputs .= "<tr><td width='50%'>".$strTitle."</td><td>".create_textbox($strColName,$strValue)."</td></tr>";
						break;
					case 'checkbox':
						$strOtherInputs .= "<tr><td width='50%'>".$strTitle."</td><td align='left'>".create_checkbox($strColName,$strValue,$boolChecked)."</td></tr>";	
						break;
					case 'selectbox':
						$strOtherInputs .= "<tr><td width='50%'>".$strTitle."</td><td>".create_selectbox($colNode,$strColName,$strValue)."</td></tr>";	
						break;
					case 'status_dropdown':
						$arrData = array("1" => "Pending", "2" => "Unassigned","3"=>"Unaccepted", "4"=>"On Hold", "5"=>"Off Hold", "6"=>"Resolved", "16"=>"Closed");
						$strOtherInputs .= "<tr><td width='50%'>".$strTitle."</td><td>".create_local_dropdown($strColName,$strValue,$arrData,true,"No Status")."</td></tr>";	
						break;

						//		<owner type='checkbox' title='Status' filter="[:_swm_sqlprep_aid]">1</owner>

				}
			}
		}
	}

	$strSortBy = "";
	$navXmlDef = $setting->get_elements_by_tagname("sortvalues");
	$dfValues = $navXmlDef[0];
	if($dfValues)
	{
		$children = $dfValues->child_nodes();
		$dTotal = count($children);
		$arrData = array();
		for ($i=0;$i<$dTotal;$i++)
		{
			$colNode = $children[$i];
			if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
			{
				$strColName = $colNode->tagname();
				$strTitle = $colNode->get_attribute("title");
				$arrData[$strColName] = $strTitle;
			}
		}
		$strValue = $_POST['searchsortby'];
		if($strValue!="")
			$strSortBy = $strValue." ".$_POST['searchsortbydir'];

		$strSortDesc = "";
		if($_POST['searchsortbydir']=="DESC")
			$strSortDesc = "selected";
		$strOtherInputs .="</table><div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Sort By</span></span></div>
			   <table width='100%'>";
		$strOtherInputs .= "<tr><td width='50%'>Sort By</td><td>".create_local_dropdown("searchsortby",$strValue,$arrData,true,"No Sorting")." &nbsp; <select id='searchsortbydir' name='searchsortbydir'><option selected>ASC</option><option ".$strSortDesc.">DESC</option></select></td></tr>";	
	}
	
	$strOtherInputs .=	"				</table>";
	$strOtherInputs .=	"				<br>";
	$strOtherInputs .=	"				<br>";
	//get output list, and output, passing in additional where
	$arrDataC = $setting->get_elements_by_tagname('list');
	$strWhere = _swm_parse_string($strWhere);
	$strSortBy = _swm_parse_string($strSortBy);
	$strOtherInputs .= _swm_process_datalist($arrDataC[0],$xmlDefintionFilePath,$strWhere,$strSortBy);


	function create_textbox($strName,$strValue)
	{
		$strHTML = "<input id='".$strName."' name='".$strName."' type='text' value='".$strValue."' >";
		return $strHTML;
	}

	function create_checkbox($strName,$strValue,$boolCheck)
	{
		if($boolCheck)
		{
			$checked = "checked";
			$strHTML = "<input id='".$strName."' name='".$strName."' type='hidden' value='".$strValue."'>";
		}
		else
		{
			$checked = "";
			$strHTML = "<input id='".$strName."' name='".$strName."' type='hidden' value=''>";
		}

		$strHTML .= '<input  style="cursor:pointer;" onclick="var oHolder= document.getElementById(\''.$strName.'\');if(this.checked)oHolder.value=this.value;else oHolder.value=\'\'" id=\'cb_'.$strName."' name='cb_".$strName."' type='checkbox' value='".$strValue."' ".$checked.">";
		return $strHTML;
	}

	function create_selectbox($colNode,$strBinding,$strDefaultValue)
	{
		$strHTML = "<select id='"._html_encode($strBinding)."' name='"._html_encode($strBinding)."' type='text' >";
		$strHTML .= "<option value=''></option>";			

		$strDB = $colNode->get_attribute("db");
		$strTable = $colNode->get_attribute("table");
		$strKeyCol = $colNode->get_attribute("keycol");
		$strTxtCol = $colNode->get_attribute("txtcol");
		$strWhere = $colNode->get_attribute("filter");


		$strSQL = "select ".$strKeyCol;
		if($strTxtCol!="")
			$strSQL .= " , ".$strTxtCol;
		
		$strSQL .= " from ".$strTable;
		if($strWhere!="")
			$strSQL .= " where ".$strWhere;
			
		if($strTxtCol=="")
			$strTxtCol = $strKeyCol;

		$rsData = new _swm_rs();
		$strSQL = _swm_parse_string($strSQL);
		$rsData->query($strDB,$strSQL,true,null);

		//-- check if there is any data
		if($rsData->eof())
		{
				$strOutputHTML = "There is no data available";
		}
		else
		{
			while(!$rsData->eof())
			{
				$strKeyColValue =	$rsData->EmbedDataIntoString("rs","[:rs.".$strKeyCol.".value]");
				$strTxtColValue =	$rsData->EmbedDataIntoString("rs","[:rs.".$strTxtCol.".value]");
				$rsData->movenext();

				$checked = "";
				if($strKeyColValue==$strDefaultValue)
					$checked= "selected";

				$strHTML .= "<option value='"._html_encode($strKeyColValue)."' ".$checked.">"._html_encode($strTxtColValue)."</option>";
			}
		}


		$strHTML .= "</select>";
		return $strHTML;
	}

	function create_local_dropdown($strBinding,$strDefaultValue,$arrData,$boolKey = false,$strBlank = "")
	{
		$strHTML = "<select  id='"._html_encode($strBinding)."'  name='"._html_encode($strBinding)."' type='text' >";
		if($strBlank!="")
			$strHTML .= "<option value='' " .((""==$strDefaultValue)?'selected':'') . ">".$strBlank."</option>";			

		foreach($arrData as $key=>$val)
		{
			$checked = "";
			$strUseValue = $val;
			if($boolKey)
				$strUseValue = $key;
			if($strUseValue==$strDefaultValue)
				$checked= "selected";
			$strHTML .= "<option value='"._html_encode($strUseValue)."' ".$checked.">"._html_encode($val)."</option>";			
		}
		$strHTML .= "</select>";
		return $strHTML;
	}
?>
