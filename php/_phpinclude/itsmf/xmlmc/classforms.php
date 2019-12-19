<?php
class swForm
{
	var $toolbar   = "";
	var $maintable = "";
	var $keycolumn = "";
	var $keyvalue = "";
	var $arrMasterDataColumns = "";
	var $jscript = "";
	var $html = "";
	var $tabcontrolhtml = "";
	var $firstformname = "";


	function swForm($oXML,$varKeyValue,$boolInserting = true)
	{
		//-- get toolbar filename that we want to use
		$strFormType = get_node_att($oXML,"formtype");
		$strFormName = get_node_att($oXML,"formname");
		
		
		$this->width  = get_node_att($oXML,"width");
		$this->height =  get_node_att($oXML,"height");

		$this->keyvalue = $varKeyValue;
		$this->toolbar = getxml_childnode_content($oXML,"toolbar");
		$this->tabcontrolhtml = $this->output_form_tabcontrol($oXML);
	
		$strFormJavaScript  .= "var _FORMTYPE=\"$strFormType\";var _FORMNAME=\"$strFormName\";	document.tables= new Array();document.extendedtables = new Array();document.relatedtables = new Array();";

		//-- get main table details
		$xmlDataTable = getxml_childnode($oXML,"datatables");
		$xmlMainTable= getxml_childnode($xmlDataTable ,"main");

		if($xmlMainTable!=null)
		{
			$strFormJavaScript .= $this->get_maintable_script($xmlMainTable);

			if($this->error) 
			{
				$this->jscript = $strFormJavaScript;
				return true;
			}


			//-- get extended table details
			$xmlExtTables= getxml_childnodes($xmlDataTable ,"extended");
			foreach($xmlExtTables as $aTable)
			{
				$strFormJavaScript .= $this->get_extendedtable_script($aTable);
				if($this->error) 
				{
					$this->jscript = $strFormJavaScript;
					return true;
				}

			}

			//-- get related table details
			$xmlRelTables= getxml_childnodes($xmlDataTable ,"related");
			foreach($xmlRelTables as $aTable)
			{
				$xmlRelTable= getxml_childnode($aTable ,"relatedtable");
				if($xmlRelTable!=null)
				{
					$strFormJavaScript .= $this->get_relatedtable_script($xmlRelTable);
					if($this->error) 
					{
						$this->jscript = $strFormJavaScript;
						return true;
					}
				}
			}

		}

		$this->construct_form_html($oXML);
		$this->jscript = $strFormJavaScript;

		return true;
	}

	function get_maintable_script($xmlTable)
	{
		$strDSN  = getxml_childnode_content($xmlTable,"dsn");
		$strUID  = getxml_childnode_content($xmlTable,"uid");
		$strPWD  = getxml_childnode_content($xmlTable,"pwd");
		$strTable  = getxml_childnode_content($xmlTable,"table");
		$strKeyCol = getxml_childnode_content($xmlTable,"keycol");

		if($strTable=="") return "";


		$this->maintable = $strTable;
		$this->keycolumn = $strKeyCol;
		$this->error = false;

		//-- initialise the master record
		$strScript = "	document.$this->maintable = app.new_record('$this->maintable','$this->keycolumn','$this->keyvalue');";
		$strScript .= "	document.$this->maintable.__tabletype = 'MASTER';";
		$strScript .= "	document.maintable = document.$this->maintable;";
		$strScript .= "	document.tables['".$this->maintable."'] = document.$this->maintable;";

		//--
		//-- if we have a key value load its record and add to script
		if ($this->keyvalue!="")
		{
			//-- load master table record and populate fields
			$rsMain = get_db_record($strDSN, $strTable, $strKeyCol, $this->keyvalue , $strUID, $strPWD);
			if(is_object($rsMain)==false)
			{
				$this->error = true;
				$strScript = "alert('Failed to load the main table ($strTable : $strKeyCol : $this->keyvalue) record for this form. Please contact your Administrator.')";
			}
			else
			{
				if (!$rsMain->eof) 
				{						
					//--for each column
					$currRow = $rsMain->row();
					foreach($currRow as $fieldName => $aField)
					{
						$strFieldName = strToLower($fieldName);
						$intType = swdti_getdatatype($strTable.".".$strFieldName);
						$strEncaps = ($intType==8 || $intType==-1)?"'":"";
						$strValue = $strEncaps . $aField->value . $strEncaps;
						
						$strScript .= "	document.".$strTable.".".$strFieldName." = ".$strValue .";";
						$strScript .= "	document.".$strTable.".__origvalues['".$strFieldName."'] = ".$strValue . ";";				

						//-- store this so we can use values when getting related table data
						//-- note: storing unencapsed version of value
						$this->arrMasterDataColumns[$strFieldName] = $aField->value;
					}
				}
			}
		}
		return $strScript;
	}

	function get_extendedtable_script($xmlTable)
	{
		$strDSN  = getxml_childnode_content($xmlTable,"dsn");
		$strUID  = getxml_childnode_content($xmlTable,"uid");
		$strPWD  = getxml_childnode_content($xmlTable,"pwd");
		$strTable  = getxml_childnode_content($xmlTable,"table");
		$strKeyCol = getxml_childnode_content($xmlTable,"keycol");

		if($strTable=="") return "";

		$this->error = false;

		//-- initialise the extended record
		$strScript  = "	document.$strTable = app.new_record('$strTable','$strKeyCol','');";
		$strScript .= "	document.$strTable.__tabletype = 'RELATED';";
		$strScript .= "	document.extendedtables['".$strTable."'] = document.$strTable;";
		$strScript .= "	document.tables['".$strTable."'] = document.$strTable;";
		$strScript .= "	var $strTable = document.$strTable;";

		//-- if we have a key value
		if ($this->keyvalue!="")
		{
			//-- load extended table record and populate fields
			$rsExt = get_db_record($strDSN, $strTable, $strKeyCol, $this->keyvalue, $strUID, $strPWD);
			if(is_object($rsExt)==false)
			{
				$this->error = true;
				$strScript = "alert('Failed to load the extended table ($strTable : $strKeyCol : $this->keyvalue) record for this form. Please contact your Administrator.')";
			}
			else
			{
				if (!$rsExt->eof) 
				{						
					//--for each column
					$currRow = $rsExt->row();
					foreach($currRow as $fieldName => $aField)
					{
						$strFieldName = strToLower($fieldName);
						$intType = swdti_getdatatype($strTable.".".$strFieldName);
						$strEncaps = ($intType==8)?"'":"";
						$strValue = $strEncaps . $aField->value . $strEncaps;

						$strScript .= "	document.".$strTable.".".$strFieldName." = ".$strValue .";";
						$strScript .= "	document.".$strTable.".__origvalues['".$strFieldName."'] = ".$strValue . ";";				
					}
				}
			}
		}
		return $strScript;
	}

	function get_relatedtable_script($xmlTable)
	{
		$strDSN  = getxml_childnode_content($xmlTable,"dsn");
		$strUID  = getxml_childnode_content($xmlTable,"uid");
		$strPWD  = getxml_childnode_content($xmlTable,"pwd");
		$strTable  = getxml_childnode_content($xmlTable,"table");
		$strKeyCol = getxml_childnode_content($xmlTable,"keycol");
		$strForeignKeyCol = getxml_childnode_content($xmlTable,"fkcol");

		//-- forms to use when adding a new record or editing
		$strAddRecordForm = getxml_childnode_content($xmlTable,"addrecordform");
		$strEditRecordForm = getxml_childnode_content($xmlTable,"editrecordform");

		//-- get attributes
		$strResolve = get_node_att($xmlTable,"autoresolve");
		if($strResolve!="1")$strResolve="0";

		$strMandatory = get_node_att($xmlTable,"mandatory");
		if($strMandatory!="1")$strMandatory="0";

		$strPicklist = get_node_att($xmlTable,"picklist");

		if($strTable=="") return "";
		$this->error = false;

		//-- initialise the related  record
		//-- get the key value based on foreign key value in master record
		$strKeyValue = $this->arrMasterDataColumns[$strForeignKeyCol];

		$strScript  = "	document.$strTable = app.new_record('$strTable','$strKeyCol','$strKeyValue');";
		$strScript .= "	document.$strTable.__tabletype = 'RELATED';";
		$strScript .= "	document.$strTable.__mandatory = $strMandatory;";
		$strScript .= "	document.$strTable.__autoresolve = $strResolve;";
		$strScript .= "	document.$strTable.__parentcolumn = '".$strForeignKeyCol."';";
		$strScript .= "	document.$strTable.__editform = '".$strEditRecordForm."';";
		$strScript .= "	document.$strTable.__addform = '".$strAddRecordForm."';";
		$strScript .= "	document.$strTable.__picklist = '".$strPicklist."';";
		$strScript .= "	document.$strTable.__bindings = new Array();";
		$strScript .= "	document.relatedtables['".$strTable."'] = document.$strTable;";
		$strScript .= "	document.tables['".$strTable."'] = document.$strTable;";
		$strScript .= "	var $strTable = document.$strTable;";

		//-- set bindings
		$xmlBindingSets= getxml_childnodes($xmlTable ,"bindings");
		foreach($xmlBindingSets as $aBindingSet)
		{
			$xmlBindings= getxml_childnodes($aBindingSet ,"bind");
			foreach($xmlBindings as $aBinding)
			{
				$strColumn = get_node_att($aBinding,"source");
				$strTarget = get_node_att($aBinding,"target");
				$strScript .= "	document.$strTable.__bindings['".$strColumn."'] = '".$strTarget."';";
			}
		}

		//-- if we have a key value
		if ($strKeyValue!="")
		{
			//-- load related table record and populate fields
			$rsRel = get_db_record($strDSN, $strTable, $strKeyCol, $strKeyValue, $strUID, $strPWD);
			if(is_object($rsRel)==false)
			{
				$this->error = true;
				$strScript = "alert(\"Failed to load the related table ($strTable : $strKeyCol : $strKeyValue) record for this form. Please contact your Administrator.\")";
			}
			else
			{
				if (!$rsRel->eof) 
				{						
					//--for each column
					$currRow = $rsRel->row();
					foreach($currRow as $fieldName => $aField)
					{
						$strFieldName = strToLower($fieldName);
						$intType = swdti_getdatatype($strTable.".".$strFieldName);
						$strEncaps = ($intType==8)?"'":"";
						$strValue = $strEncaps . $aField->value . $strEncaps;
						
						$strScript .= "	document.".$strTable.".".$strFieldName." = ".$strValue .";";
						$strScript .= "	document.".$strTable.".__origvalues['".$strFieldName."'] = ".$strValue . ";";				
					}
				}
			}
		}
		return $strScript;
	}

	//--
	//-- just output jscript record definitions required to support this form
	//-- NOTE: In future we can hold javascript functions in xml file and then out put these to the client as well.
	//--       such as document level functions
	function output_form_script()
	{
		return $this->jscript;
	}

	//-- output this forms tab control
	//-- based on the child items
	function output_form_tabcontrol($oXML)
	{
		$strTabItemHTML = "";
		$intTabCount=0;
		$xmlFormArea = getxml_childnode($oXML,"formarea");
		$formnodes =  getxml_childnodes($xmlFormArea);
		foreach ($formnodes as $aForm) 
		{
		    $strFormName = $aForm->tagname;
			$strTabText = get_node_att($aForm,"title");

			//-- default tab item is always the first - so set up start of control html
			if($intTabCount==0)
			{
				$strTop = "4px";
				if($this->toolbar!="")
				{
					$strTop = "33px";
				}

				$this->firstformname = $strFormName;

				$strTabControlHTML =  "<div id='tabForm' class='formtabcontrol' current_tabindex='0' current_tabid='".$strFormName."' style='position:absolute;top:".$strTop.";left:1px;width:100%;height:100%'><div class='tabcontrol-tabitems'>";
				$strTabItemHTML .="<label class='tabitem-selected' tabcontrol='tabForm' tabindex='".$intTabCount."' tabid='".$strFormName."' onClick='select_formtabcontrol_item(this);'>$strTabText</label>";
			}
			else
			{
				$strTabItemHTML .="<label class='tabitem' tabcontrol='tabForm' tabindex='".$intTabCount."' tabid='".$strFormName."' onClick='select_formtabcontrol_item(this);'>$strTabText</label>";
			}

			$intTabCount++;
		}
			
		$strTabControlHTML .= $strTabItemHTML."</div><div class='tabspace'></div></div>";
		return $strTabControlHTML;
	}

	//--
	//-- output form elements based on xml definition
	//-- NOTE: Have option to display values in elements as well if we have records available (this will save client side processing)
	function construct_form_html($oXML)
	{
		$strHTML = "";
		//-- get form areas
		$xmlFormArea = getxml_childnode($oXML,"formarea");
		$formnodes =  getxml_childnodes($xmlFormArea);
		foreach ($formnodes as $aForm) 
		{
			 //-- form each form create a div to hold it (mainform / extform etc) and we will eventually create a tab control to flip between them
			 $strFormName = $aForm->tagname;
			 $formHTML = "<div id='".$strFormName."' class='form-area'>";
			
				$elementnodes = getxml_childnodes($aForm);
				foreach ($elementnodes as $anElement) 
				{

					$strElementType = $anElement->tagname;
					switch($strElementType)
					{
						case "tabcontrol";
							$formHTML .= $this->html_tabcontrol($anElement,$strFormName);
							break;
						case "sqllist";
							$formHTML .= $this->html_sqllist($anElement,$strFormName);
							break;
						case "label";
							$formHTML .= $this->html_label($anElement,$strFormName);
							break;

						case "tree";
							$formHTML .= $this->html_tree($anElement,$strFormName);
							break;


						case "textbox";
							$formHTML .= $this->html_textbox($anElement,$strFormName);
							break;
		
						case "checkbox";
							$formHTML .= $this->html_checkbox($anElement,$strFormName);
							break;
								
						case "datebox";
							$formHTML .= $this->html_datebox($anElement,$strFormName);
							break;
						case "formflag";
							$formHTML .= $this->html_formflag($anElement,$strFormName);
							break;
						case "panel";
							$formHTML .= $this->html_panel($anElement,$strFormName);
							break;
						case "button";
							$formHTML .= $this->html_button($anElement,$strFormName);
							break;

						case "menubutton";
							$formHTML .= $this->html_menubutton($anElement,$strFormName);
							break;

						case "image";
							$formHTML .= $this->html_image($anElement,$strFormName);
							break;

						case "picklist";
						case "numericpicklist";
							$formHTML .= $this->html_picklist($anElement,$strFormName);
							break;
						case "distinctpicklist";
							$formHTML .= $this->html_distinctpicklist($anElement,$strFormName);
							break;
					}
				}		
				
			 $formHTML .= "</div>";
			 $strHTML .= $formHTML;
		}
		$this->html = $strHTML;
	}
	
	function output_form_elements()
	{
		return $this->html;
	}

	//--
	//-- helpers for drawing out form controls


	//--
	//-- create html label
	var $elecounter =1;
	function html_label($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "lbl_" . $elecounter++;
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$useBinding = "";
		$strBinding = getxml_childnode_content($oXML,"binding");
		$strType = getxml_childnode_content($oXML,"type");
		if($strType=="data")
		{
			$useBinding = "binding='".$strBinding."'";
			$strDisplayName = "";
		}
		else
		{
			//-- normal label - check for post and prefix
			$strPre = getxml_childnode_content($oXML,"prefix");
			$strPost = getxml_childnode_content($oXML,"postfix");

			$strDisplayName = $strPre . swdti_getcoldispname($strBinding) . $strPost;
		}

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";

		//-- using table to position the label vertically in the middle
		$strElement = "<label $strVisible formname='".$strFormName."' id='".$strID."' $strSizing $useBinding tabcontrol='".$strTabControl."' style='".$strStyling."'>".$strDisplayName."</label>";
		return $strElement;
	}




	//-- create html textbox
	function html_checkbox($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "cb_" . $elecounter++;

		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strBinding = getxml_childnode_content($oXML,"binding");
		$strDataType= swdti_getdatatype($strBinding);

		$strDefault = getxml_childnode_content($oXML,"default");

		$strFlagsHTML = "";
		$xmlItems =  getxml_childnode($oXML,"flags");
		if(is_object($xmlItems))
		{
			$strDisabled		= (get_node_att($oXML,"disabled")=="1")?" disabled ":"";

			$strFlagsHTML = "<table border='0' cellspacing='0' cellpadding='0'>";
			$arrItems =  getxml_childnodes($xmlItems,"flag");
			foreach ($arrItems as $anItem) 
			{
				$strBit = get_node_att($anItem,"bit");
				$strText = $anItem->get_content();

				$strFlagID = $strID . "_" . $strBit;

				$strFlagsHTML .="<tr>";
				$strFlagsHTML .= "<td valign='middle'><input id='".$strFlagID."'  $strDisabled onClick='__form_flag_changed(this);' type='checkbox' bit='".$strBit."'></td><td valign='middle'  $strDisabled><label for='".$strFlagID."'>".$strText."</label></td>";
				$strFlagsHTML .="</tr>";
			}
			$strFlagsHTML .="</table>";
		}


		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strElement = "<div formname='".$strFormName."'  $strVisible onFocus='__form_field_focus(this);'  defaultvalue='".$strDefault."'  tabcontrol='".$strTabControl."' id='".$strID."' type='checkbox' datatype='".$strDataType."' binding='".$strBinding."' class='flagcontrol' style='".$strStyling."' $strSizing>".$strFlagsHTML."</div>";	
		return $strElement;
	}


	//-- create html textbox
	function html_textbox($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "tb_" . $elecounter++;

		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);
		$strPicker = getxml_childnode_content($oXML,"picker");

		$strBinding = getxml_childnode_content($oXML,"binding");
		$strDataType= swdti_getdatatype($strBinding);

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";

		//-- set defualt or hint text if no value to put in
		$strHint = getxml_childnode_content($oXML,"hint");
		$strDefault = getxml_childnode_content($oXML,"default");
		if($strDefault=="")
		{
			$strDefault = $strHint;
			if($strHint!="")
			{
				$strStyling .=";color:#c0c0c0;";
			}
		}

		//-- check mandatory
		$strMandatory = getxml_childnode_content($oXML,"mandatory");

		$strMultiline = getxml_childnode_content($oXML,"multiline");
		if($strMultiline=="true")
		{
			$strElement = "<textarea formname='".$strFormName."' $strVisible onFocus='__form_field_focus(this);' mandatory='".$strMandatory."' pickaction='".$strPicker."' onChange='__form_field_changed(this);' hint='".$strHint."' defaultvalue='".$strDefault."' $strSizing  tabcontrol='".$strTabControl."' id='".$strID."' class='textarea' datatype='".$strDataType."' binding='".$strBinding."' style='".$strStyling."'>".$strDefault."</textarea>";
		}
		else
		{
			$strElement = "<input formname='".$strFormName."'  $strVisible onFocus='__form_field_focus(this);'  mandatory='".$strMandatory."' pickaction='".$strPicker."'  onChange='__form_field_changed(this);' hint='".$strHint."'  defaultvalue='".$strDefault."'  $strSizing tabcontrol='".$strTabControl."' id='".$strID."' type='text' datatype='".$strDataType."' binding='".$strBinding."' class='textbox' style='".$strStyling."' value='".$strDefault."'>";	
		}

		return $strElement;
	}

	//-- draw a image
	function html_image($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "img_" . $elecounter++;

		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		if(getxml_childnode_content($oXML,"border")=="no")
		{
			$strStyling .= ";border-width:0px;";
		}

		$strSrc = getxml_childnode_content($oXML,"src");
		$strNoImgSrc = getxml_childnode_content($oXML,"noimg");

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");
		$strElement = "<img src='".$strSrc."' origsrc='".$strSrc."' altsrc='".$strNoImgSrc."' formname='".$strFormName."' onerror='__on_image_error(this);' $strVisible  $strSizing   tabcontrol='".$strTabControl."' id='".$strID."' class='frmimage' style='".$strStyling."''>";
		return $strElement;
	}


	//-- draw a tree control
	function html_tree($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "tree_" . $elecounter++;

		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strBinding = getxml_childnode_content($oXML,"binding");
		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		//-- get data
		$strTreeData = get_tree_data($oXML);
		$strElement = "<div formname='".$strFormName."' $strVisible $strSizing  tabcontrol='".$strTabControl."' id='".$strID."' binding='".$strBinding."' class='tree' style='".$strStyling."'>$strTreeData</div>";
		return $strElement;
	}


	//-- draw a datebox
	function html_datebox($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "dt_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strBinding = getxml_childnode_content($oXML,"binding");
		$strDataType= swdti_getdatatype($strBinding);

		//-- check mandatory
		$strMandatory = getxml_childnode_content($oXML,"mandatory");

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$strElement = "<input formname='".$strFormName."' $strVisible onFocus='__form_field_focus(this);' onChange='__form_field_changed(this);'  mandatory='".$strMandatory."'   $strSizing  tabcontrol='".$strTabControl."' id='".$strID."' type='text' datatype='".$strDataType."' binding='".$strBinding."' class='datebox' style='".$strStyling."' maxlength='22'>";
		return $strElement;
	}

	function html_formflag($oXML, $strFormName)
	{

	}

	//-- draw a picklist
	function html_picklist($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "lb_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strBinding = getxml_childnode_content($oXML,"binding");
		$strTextBinding = getxml_childnode_content($oXML,"textbinding");

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$strDataType= swdti_getdatatype($strBinding);
		$strMandatory = getxml_childnode_content($oXML,"mandatory");

		$strDefault = getxml_childnode_content($oXML,"default");

		//-- add mandatory option or not
		$strOptions = "";
		if($strMandatory!="true")
		{
			$strOptions = "<option value=''></option>";		
		}

		$xmlItems =  getxml_childnode($oXML,"items");
		if(is_object($xmlItems))
		{
			$arrItems =  getxml_childnodes($xmlItems,"item");
			foreach ($arrItems as $anItem) 
			{
				$strValue = get_node_att($anItem,"value");
				$strText = $anItem->get_content();
				if($strValue=="")$strValue=$strText;

				if($strDefault==$strText)
				{
					$strDefault = $strValue;
					$strOptions .= "<option value='".$strValue."' selected>".$strText."</option>";
				}
				else
				{
					$strOptions .= "<option value='".$strValue."'>".$strText."</option>";
				}

			}
		}

		$strElement = "<select formname='".$strFormName."' $strVisible onFocus='__form_field_focus(this);'  mandatory='".$strMandatory."' defaultvalue='".$strDefault."' onChange='__form_field_changed(this);' $strSizing tabcontrol='".$strTabControl."'  id='".$strID."' datatype='".$strDataType."' binding='".$strBinding."'  textbinding='".$strTextBinding."' class='picklist' style='".$strStyling."'>$strOptions</select>";
		return $strElement;
	}

	function html_distinctpicklist($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "dlb_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strBinding = getxml_childnode_content($oXML,"binding");
		$strTextBinding = getxml_childnode_content($oXML,"textbinding");

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$strDataType= swdti_getdatatype($strBinding);
		$strMandatory = getxml_childnode_content($oXML,"mandatory");

		$strDefault = getxml_childnode_content($oXML,"default");
	
		//-- add mandatory option or not
		$strOptions = "";
		if($strMandatory!="true")
		{
			$strOptions = "<option value=''></option>";		
		}


		//--
		//-- do we want to display statics options as well as db options??
		$xmlItems =  getxml_childnode($oXML,"items");
		if(is_object($xmlItems))
		{
			$arrItems =  getxml_childnodes($xmlItems,"item");
			foreach ($arrItems as $anItem) 
			{
				$strValue = get_node_att($anItem,"value");
				$strText = $anItem->get_content();
				if($strValue=="")$strValue=$strText;

				if($strDefault==$strText)
				{
					$strDefault = $strValue;
					$strOptions .= "<option value='".$strValue."' selected>".$strText."</option>";
				}
				else
				{
					$strOptions .= "<option value='".$strValue."'>".$strText."</option>";
				}
			}
		}

		//--
		//-- connect to db and go get data
		$strDSN  = getxml_childnode_content($oXML,"dsn");
		$strUID  = getxml_childnode_content($oXML,"uid");
		$strPWD  = getxml_childnode_content($oXML,"pwd");
		$strTable  = getxml_childnode_content($oXML,"table");
		$strKeyCol = getxml_childnode_content($oXML,"keycol");
		$strTextCol = getxml_childnode_content($oXML,"txtcol");
		$strFilter = getxml_childnode_content($oXML,"filter");

		//echo $strKeyCol;
		$strDatabaseOptions = get_dbpicklist_options($strDSN, $strTable, $strKeyCol, $strTextCol , $strFilter, $strUID, $strPWD , $strDefault);
		if(strPos($strDatabaseOptions,"ERROR:")===0)
		{
			//-- failed to process
			$strOptions .= "<option>$strDatabaseOptions</option>";
		}
		else
		{
			$strOptions .= $strDatabaseOptions;
		}

		$strElement = "<select formname='".$strFormName."' $strVisible  onFocus='__form_field_focus(this);' onChange='__form_field_changed(this);' mandatory='".$strMandatory."' defaultvalue='".$strDefault."'  $strSizing filter=\"".$strFilter."\" tabcontrol='".$strTabControl."' id='".$strID."' datatype='".$strDataType."' binding='".$strBinding."'  textbinding='".$strTextBinding."' class='dbpicklist' style='".$strStyling."'>$strOptions</select>";
		return $strElement;
	}

	function html_tabcontrol($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "tabc_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$arrItems =  getxml_childnodes($oXML,"tabitem");
		$tabCount=0;

		$strCurrentTabID = "0";
		$strTabItemDiv = "<div class='tabcontrol-tabitems'>";
		foreach ($arrItems as $anItem) 
		{
			$strTabID = get_node_att($anItem,"tabid");
			$strTabLabel = $anItem->get_content();

			//-- if no specific id then use count
			if($strTabID=="")$strTabID = $tabCount;

			if($tabCount==0)
			{
				//$strTabItemDiv .= "<label class='tabitem-selected' tabcontrol='".$strID."' tabindex='".$tabCount."' tabid='".$strTabID."' onClick='app.select_tabcontrol_item(this);'><table border='0' height='100%' cellspacing='0' cellpadding='0'><tr><td valign='middle'>".$strTabLabel."</td></tr></table></label>";
				$strCurrentTabID = $strTabID;
				$strTabItemDiv .= "<span class='fe-tabitem-selected' tabcontrol='".$strID."' tabindex='".$tabCount."' tabid='".$strTabID."' onClick='select_tabcontrol_item(this);'>".$strTabLabel."</span>";
			}
			else
			{
				//$strTabItemDiv .= "<label class='tabitem' tabcontrol='".$strID."' tabindex='".$tabCount."' tabid='".$strTabID."' onClick='app.select_tabcontrol_item(this);'><table border='0' height='100%' cellspacing='0' cellpadding='0'><tr><td valign='middle'>".$strTabLabel."</td></tr></table></label>";
				$strTabItemDiv .= "<span class='fe-tabitem' tabcontrol='".$strID."' tabindex='".$tabCount."' tabid='".$strTabID."' onClick='select_tabcontrol_item(this);'>".$strTabLabel."</span>";
			}
			$tabCount++;
		}
		$strTabItemDiv .= "</div>";
		$strTabSpaceDiv = "<div class='fe-tabspace'></div>";
		$strElement = "<div formname='".$strFormName."' $strSizing current_tabindex='0' current_tabid='" . $strCurrentTabID . "' tabcontrol='".$strTabControl."' id='".$strID."' class='fe-tabcontrol' style='".$strStyling."'>".$strTabItemDiv . $strTabSpaceDiv."</div>";
		return $strElement;
	}

	//--
	//-- draw out html sqllist control - 
	function html_sqllist($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "sqllist_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);
		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$boolCheckbox = (get_node_att($oXML,"usecheckbox")=="1");

		$intSelectOnCheck = get_node_att($oXML,"selectoncheck");

		$strTable = "<table width='100%' cellspacing='0' cellpadding='0'><tr>";

		//--
		//-- get column headings
		$xmlColumns =  getxml_childnode($oXML,"columns");
		$arrColumns =  getxml_childnodes($xmlColumns,"column");
		$strColumnHTML = "";
		foreach ($arrColumns as $aColumn) 
		{
			$strColID = getxml_childnode_content($aColumn,"colid");
			$strColBinding = getxml_childnode_content($aColumn,"binding");
			$strVisible = getxml_childnode_content($aColumn,"visible");

			$strColStyle = "";
			if($strVisible=="false")
			{
				$strColStyle = "display:none;";
			}

			$strColLabel = getxml_childnode_content($aColumn,"label");
			if($strColLabel=="")
			{
				//-- use sw dti to get col name using dbid
				$strColLabel = swdti_getcoldispname($strColBinding);
			}

			$strColumnHTML .= "<td noWrap class='sqllist-header'  $strSizing  style='".$strColStyle."' colid='".$strColID."' binding='".$strColBinding."' onClick='order_sqllist_column(this);' valign='middle'>".$strColLabel."</td>";
		}

		$strTable .= $strColumnHTML;
		$strTable .= "</tr>";

		//--
		//-- if auto load == true go get data
		$strDSN  = getxml_childnode_content($oXML,"dsn");
		$strUID  = getxml_childnode_content($oXML,"uid");
		$strPWD  = getxml_childnode_content($oXML,"pwd");

		$strFilter =  getxml_childnode_content($oXML,"filter");
		$strOrderBy  = getxml_childnode_content($oXML,"orderby");
		$strOrderDir  = getxml_childnode_content($oXML,"orderdir");
		if($strOrderDir=="")$strOrderDir = "ASC";

		$strAutoLoad  = getxml_childnode_content($oXML,"autoload");	

		$rowcount=0;
		$strTableData = "";
		if($strAutoLoad=="true")
		{
			//-- create select statement
			$strSelect = "select ";
			$strSelectColumns = "";
			foreach ($arrColumns as $aColumn) 
			{
				$strColID = getxml_childnode_content($aColumn,"colid");
				$strColBinding = getxml_childnode_content($aColumn,"binding");
				if($strColID=="")$strColID=$strColBinding;

				if($strSelectColumns!="")$strSelectColumns.=",";
				$strSelectColumns .= $strColBinding . " as " . $strColID;
			}
			$strSelect .= $strSelectColumns;

			//-- get from tables
			$strFromTables = "";
			$xmlTables =  getxml_childnode($oXML,"tables");
			$arrTables =  getxml_childnodes($xmlTables,"table");
			foreach ($arrTables as $aTable) 
			{
				$strTableID = get_node_att($aTable,"tableid");
				$strTableAs = get_node_att($aTable,"tableas");
				if($strTableAs=="")$strTableAs = $strTableID;

				if($strFromTables!="")$strFromTables.=",";
				$strFromTables .= $strTableID . " as " . $strTableAs;
			}
			$strSelect .= " from " . $strFromTables;

			//-- set where
			if(trim($strFilter)!="")
			{
				$strSelect .= " where "	. $strFilter;
			}
			//-- get order by
			if(trim($strOrderBy)!="")
			{
				$strSelect .= " order by  "	. $strOrderBy;

				//-- set order dir
				$strSelect .= " "	. $strOrderDir;
			}

			//-- get data
			$oTableSet = get_db_recordset($strDSN, $strSelect , $strUID, $strPWD);
			if(is_object($oTableSet))
			{
				$count=0;
				while(!$oTableSet->eof)
				{
					$rowcount++;
					$strTableData .= "<tr onClick='__select_sqllist_row(this)'>";
					foreach ($arrColumns as $aColumn) 
					{
						$strColID = getxml_childnode_content($aColumn,"colid");
						$strColBinding = getxml_childnode_content($aColumn,"binding");
						$strVisible = getxml_childnode_content($aColumn,"visible");
						$strColStyle = "";
						if($strVisible=="false")
						{
							$strColStyle = "display:none;";
						}
						else
						{
							$count++;
						}

						$strCheckBox = "";
						if (($boolCheckbox)&&($count==1))
						{
							//-- we want to show checkbox in first column
							$strCheckBox = "<input type='checkbox' onClick='__check_sqllist_row(this)'>";
						}

						//-- format value using binding
						$strValue = $oTableSet->f($strColID);
						$boolDate = (swdti_getfieldtype($strColBinding)==5);
						if($boolDate)
						{
							$strValue = SwFormatDateTimeColumn($strColBinding, $strValue);
						}
						else
						{
							if ($strColBinding=="opencall.probcode")
							{
								$strValue = FormatProblemCode($strValue);
							}
							else if($strColBinding=="opencall.fixcode")
							{
								$strValue = FormatResolutionCode($strValue);
							}
							else
							{
								$strValue = swdti_formatvalue($strColBinding,$strValue);
							}
						}
						if(trim($strValue)=="")$strValue="&nbsp;";


						$strTableData .= "<td noWrap class='sqllist-datacol' style='".$strColStyle."'>".$strCheckBox.$strValue."</td>";
					}
					$strTableData .= "</tr>";
					$oTableSet->movenext();
				}
			}
			else
			{
				$strTableData = "<tr><td colspan='*'>$oTableSet</td></tr>.";
			}
		}

		$strTable .= $strTableData;
		$strTable .= "</table>";
		$strElement = "<div formname='".$strFormName."'  $strSizing rowCount=".$rowcount." selectoncheck='".$intSelectOnCheck."' tabcontrol='".$strTabControl."' id='".$strID."' dsn='".$strDSN."' autoload='".$strAutoLoad."' filter=\"".$strFilter."\" orderdir=\"".$strOrderDir."\" orderby=\"".$strOrderBy."\" uid='".$strUID."'  pwd='".$strPWD."' class='sqllist' style='".$strStyling."'>$strTable</div>";
		return $strElement;
	}


	//-- html button
	function html_button($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "btn_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$strTitle = getxml_childnode_content($oXML,"caption");

		$strElement = "<button formname='".$strFormName."' $strVisible onclick='__button_pressed(this)' $strSizing tabcontrol='".$strTabControl."' id='".$strID."' class='button' style='".$strStyling."'>$strTitle</button>";
		return $strElement;
	}


	function html_menubutton($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "btn_" . $elecounter++;

		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");
		$strTitle = getxml_childnode_content($oXML,"caption");

		$strMenuItems = "";
		$xmlItems =  getxml_childnode($oXML,"items");
		if(is_object($xmlItems))
		{
			$arrItems =  getxml_childnodes($xmlItems,"item");
			foreach ($arrItems as $anItem) 
			{
				$strValue = get_node_att($anItem,"value");
				$strText = $anItem->get_content();
				if($strValue=="")$strValue=$strText;

				if($strMenuItems!="")$strMenuItems.="|";
				$strMenuItems .= "$strValue^$strText";
			}
		}

		$strElement = "<button formname='".$strFormName."' $strVisible onclick='__button_pressed(this,event)' $strSizing tabcontrol='".$strTabControl."' id='".$strID."' menuitems='".$strMenuItems."' class='menubutton' style='".$strStyling."'><span>$strTitle</span></button>";
		return $strElement;
	}


	//-- html panel
	function html_panel($oXML, $strFormName)
	{
		GLOBAL $elecounter;
		$strID		= get_node_att($oXML,"id");
		if($strID=="")$strID = "panel_" . $elecounter++;

		//$strVisible = ($strFormName==$this->firstformname)?"":" style='display:none' ";
		$strVisible = ($strFormName==$this->firstformname)?"":" style='visiblity:hidden' ";
		$strStyling = html_element_style($oXML,$this->toolbar);
		$strSizing = html_element_sizing($oXML);

		$strTabControl = getxml_childnode_content($oXML,"tabcontrol");

		$strImage = getxml_childnode_content($oXML,"image");
		$strTitle = getxml_childnode_content($oXML,"caption");

		//-- OVERRIDING STYLES
		//-- check if we have a panel font
		$strPanelFont = getxml_childnode_content($oXML,"panelfont");
		if($strPanelFont!="")
		{
			$strPanelFont="font:".$strPanelFont.";";
		}
		//-- panel height
		$strPanelHeight = getxml_childnode_content($oXML,"panelheight");
		if($strPanelHeight!="")
		{
			$strPanelHeight="height:".$strPanelHeight.";";
		}
		//-- panel font color
		$strPanelFontColour = getxml_childnode_content($oXML,"panelfontcolor");
		if($strPanelFontColour!="")
		{
			$strPanelFontColour="color:".$strPanelFontColour.";";
		}

		//-- check ifg we have a panel bgcolour
		$strPanelBgColor = getxml_childnode_content($oXML,"panelbgcolour");
		if($strPanelBgColor!="")
		{
			$strPanelBgColor="background-color:".$strPanelBgColor.";";
		}

		//-- check if we have a area bgcolour
		$strBgColor = getxml_childnode_content($oXML,"bgcolour");
		if($strBgColor!="")
		{
			$strBgColor="background-color:".$strBgColor.";";
		}

		$strTitleDiv = "";
		if($strTitle!="")
		{
			$addStyle="";
			if($strImage!="")
			{
				$addStyle = "background-image:url($strImage);";
				$addStyle .="background-repeat:no-repeat;";
				$addStyle .="background-position:2px center;";
				$addStyle .="padding-left:25px;";
			}

			$strTitleDiv = "<div class='paneltitle' style='".$addStyle."".$strPanelFont."".$strPanelBgColor.$strPanelFontColour.$strPanelHeight."' >&nbsp;$strTitle</div>";
		}
		$strElement = "<div formname='".$strFormName."' $strVisible $strSizing tabcontrol='".$strTabControl."' id='".$strID."'  class='panel' style='".$strStyling."".$strBgColor ."'>$strTitleDiv</div>";
		return $strElement;
	}

}



//-- filtering helpers
//-- i.e. given sqllist xml and filter get the sqllist table html / given picklist xml and filter get picklist options

//-- FILTER A SQLLIST
function filter_sqllist($oXML, $strApplyFilter , $strApplyOrderby = "", $strApplyOrderDir = "ASC")
{

	$boolCheckbox = (get_node_att($oXML,"usecheckbox")=="1");

	$strTable = "<table width='100%' cellspacing='0' cellpadding='0'><tr>";

	//--
	//-- get column headings
	$xmlColumns =  getxml_childnode($oXML,"columns");
	$arrColumns =  getxml_childnodes($xmlColumns,"column");
	$strColumnHTML = "";
	foreach ($arrColumns as $aColumn) 
	{
		$strColID = getxml_childnode_content($aColumn,"colid");
		$strColBinding = getxml_childnode_content($aColumn,"binding");
		$strVisible = getxml_childnode_content($aColumn,"visible");

		$strColStyle = "";
		if($strVisible=="false")
		{
			$strColStyle = "display:none;";
		}

		$strColLabel = getxml_childnode_content($aColumn,"label");
		if($strColLabel=="")
		{
			//-- use sw dti to get col name using dbid
			$strColLabel = swdti_getcoldispname($strColBinding);
		}

		$strColumnHTML .= "<td noWrap class='sqllist-header'  $strSizing  style='".$strColStyle."' colid='".$strColID."' binding='".$strColBinding."' onClick='__order_sqllist_column(this);' valign='middle'>".$strColLabel."</td>";
	}

	$strTable .= $strColumnHTML;
	$strTable .= "</tr>";

	//--
	//-- if auto load == true go get data
	$strDSN  = getxml_childnode_content($oXML,"dsn");
	$strUID  = getxml_childnode_content($oXML,"uid");
	$strPWD  = getxml_childnode_content($oXML,"pwd");
	$strFilter  = $strApplyFilter;
	$strAutoLoad  = getxml_childnode_content($oXML,"autoload");	


	$strTableData = "";

	//-- create select statement
	$strSelect = "select ";
	$strSelectColumns = "";
	foreach ($arrColumns as $aColumn) 
	{
		$strColID = getxml_childnode_content($aColumn,"colid");
		$strColBinding = getxml_childnode_content($aColumn,"binding");
		if($strColID=="")$strColID=$strColBinding;

		if($strSelectColumns!="")$strSelectColumns.=",";
		$strSelectColumns .= $strColBinding . " as " . $strColID;
	}
	$strSelect .= $strSelectColumns;

	//-- get from tables
	$strFromTables = "";
	$xmlTables =  getxml_childnode($oXML,"tables");
	$arrTables =  getxml_childnodes($xmlTables,"table");
	foreach ($arrTables as $aTable) 
	{
		$strTableID = get_node_att($aTable,"tableid");
		$strTableAs = get_node_att($aTable,"tableas");
		if($strTableAs=="")$strTableAs = $strTableID;

		if($strFromTables!="")$strFromTables.=",";
		$strFromTables .= $strTableID . " as " . $strTableAs;
	}
	$strSelect .= " from " . $strFromTables;

	if(trim($strFilter)!="")
	{
		$strSelect .= " where "	. $strFilter;
	}

	//-- get order by
	$strOrderBy  = ($strApplyOrderby!="")?$strApplyOrderby:getxml_childnode_content($oXML,"orderby");
	if(trim($strOrderBy)!="")
	{	
		//-- set order by and dir
		$strSelect .= " order by "	. $strOrderBy;
		$strSelect .= " "	. $strApplyOrderDir;
		//echo $strSelect;
	}

	//-- get data
	$oTableSet = get_db_recordset($strDSN, $strSelect , $strUID, $strPWD);
	if(is_object($oTableSet))
	{
		while(!$oTableSet->eof)
		{
			$count=0;
				$strTableData .= "<tr onClick='__select_sqllist_row(this)'>";
			foreach ($arrColumns as $aColumn) 
			{
			
				$strColID = getxml_childnode_content($aColumn,"colid");
				$strColBinding = getxml_childnode_content($aColumn,"binding");
				$strVisible = getxml_childnode_content($aColumn,"visible");
				$strColStyle = "";
				if($strVisible=="false")
				{
					$strColStyle = "display:none;";
				}
				else
				{
					$count++;
				}

				$strCheckBox = "";
				if (($boolCheckbox)&&($count==1))
				{
					//-- we want to show checkbox in first column
					$strCheckBox = "<input type='checkbox' onClick='__check_sqllist_row(this)'>";
				}


				//-- format value using binding
				$strValue = $oTableSet->f($strColID);
				$boolDate = (swdti_getfieldtype($strColBinding)==5);
				if($boolDate)
				{
					$strValue = SwFormatDateTimeColumn($strColBinding, $strValue);
				}
				else
				{
					if ($strColBinding=="opencall.probcode")
					{
						$strValue = FormatProblemCode($strValue);
					}
					else if($strColBinding=="opencall.fixcode")
					{
						$strValue = FormatResolutionCode($strValue);
					}
					else
					{
						$strValue = swdti_formatvalue($strColBinding,$strValue);
					}
				}
				if(trim($strValue)=="")$strValue="&nbsp;";


				$strTableData .= "<td noWrap class='sqllist-datacol' style='".$strColStyle."'>".$strCheckBox.$strValue."</td>";
			}
			$strTableData .= "</tr>";
			$oTableSet->movenext();
		}
	}

	$strTable .= $strTableData;
	$strTable .= "</table>";
	return $strTable;
}


//-- FILTER A DB PICKLIST
function filter_picklist($oXML, $strApplyFilter)
{
}

	//-- returns common style info for an element
	function html_element_style($oXML,$toolbar)
	{
		$strTop				= get_node_att($oXML,"top");
		$strLeft			= get_node_att($oXML,"left");
		$strWidth			= get_node_att($oXML,"width");
		$strHeight			= get_node_att($oXML,"height");

		$strStyling = "";
		if(($strTop!="")&&($strLeft!=""))
		{
			if($toolbar!="")
			{
				$strTop= $strTop + 60; //-- to compensate for the toolbar
			}
			else
			{
				$strTop= $strTop + 27; //-- to compensate for the toolbar
			}

			$strStyling = "position:absolute;top:".$strTop."px;left:".$strLeft."px;width:".$strWidth."px;height:".$strHeight."px;";
		}

		$strTextAlign = getxml_childnode_content($oXML,"textalign");
		if($strTextAlign!="")
		{
			$strStyling .= "text-align:".$strTextAlign.";";
		}
		
		return $strStyling;
	}

	function html_element_sizing($oXML)
	{
		$strResizeWidth		= get_node_att($oXML,"resizew");
		$strResizeHeight	= get_node_att($oXML,"resizeh");
		$strResizeTop		= get_node_att($oXML,"resizet");
		$strResizeLeft		= get_node_att($oXML,"resizel");

		$strDisable		= (get_node_att($oXML,"disable")=="1")?"disabled":"";
		$strReadOnly	= (get_node_att($oXML,"readonly")=="1")?"readOnly":"";
		$strResizing = "resize='width:".$strResizeWidth.";height:".$strResizeHeight.";top:".$strResizeTop.";left:".$strResizeLeft.";' ".$strDisable." " .$strReadOnly;

		return $strResizing;
	}

	function get_tree_data($oXML)
	{

		$strDSN = getxml_childnode_content($oXML,"dsn");
		$strUID = getxml_childnode_content($oXML,"uid");
		$strPWD = getxml_childnode_content($oXML,"pwd");

		$boolLoadAll = (getxml_childnode_content($oXML,"loadall")=="true");

		$branchtable = getxml_childnode_content($oXML,"branchtable");
		$branchkeycol = getxml_childnode_content($oXML,"branchkeycol");
		$branchtxtcol = getxml_childnode_content($oXML,"branchtxtcol");
		$fkbranch = getxml_childnode_content($oXML,"fkbranch");
		$root = getxml_childnode_content($oXML,"root");
		$orderby = getxml_childnode_content($oXML,"orderby");

		$whereRoot =($boolLoadAll)?"":" where $fkbranch  = '".$root."'";
		$strHTML = "";

		$strSelect = "select $branchkeycol as keycol, $branchtxtcol as txtcol , $fkbranch as pcol from $branchtable $whereRoot $orderby";
		$oTreeSet = get_db_recordset($strDSN, $strSelect , $strUID, $strPWD);
		if(is_object($oTreeSet))
		{
			$strHTML.= output_tree_data($oTreeSet, $root,true);
		}

		return $strHTML;
	}

	function output_tree_data($oRec, $strParentColValue,$boolRoot = false)
	{
		$strHTML = "";
		$oRec->movefirst();
		while(!$oRec->eof)
		{
			if($oRec->f("pcol")==$strParentColValue)
			{
				$strHTML.= "<div class='tree-branch' value='".$oRec->f("keycol")."' onClick='__tree_branch_clicked(this,event);'><span onClick='__tree_item_selected(this,event);'>".$oRec->f("txtcol")."</span>";
					$strHTML.= "<div class='tree-branch-holder'>";
					//--now check if it has children
					$strHTML.= output_tree_data($oRec, $oRec->f("keycol"),false);
					$strHTML.= "</div>";
				$strHTML.= "</div>";
			}
			$oRec->movenext();
		}
		return $strHTML;
	}
?>