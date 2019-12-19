<?php
	//-- recordset processor
	class _swm_rs
	{
		var $_lasterror = "";
		var $_xmlDom = null;
		var $_xmlDomFormatted = null;
		var $_rowposition = -1;
		var $_rowcount = 0;
		var $_columns = Array();


		var $_formattedrs = null;

		function query($strDB,$strSQL,$strFormat = false,$xmlComplexConversions = null, $intRowLimit = "", $strServer = "localhost")
		{
			$this->_columns = Array();
			$this->_xmlDomFormatted = null;
			$this->_xmlDom = null;
			$this->_rowcount = 0;
			$this->_rowposition = -1;
			$this->_lasterror = "";
			$this->_lasterrorcode = 0;
			$this->_failed = false;

			if($strDB=="syscache")$strDB="sw_systemdb";

			$xmlmc = new XmlMethodCall();
			$xmlmc->SetParam("database",$strDB);
			$xmlmc->SetParam("query",$strSQL);
			$xmlmc->SetParam("returnMeta","true");
			if($intRowLimit!="")$xmlmc->SetParam("maxResults",$intRowLimit);
			if($xmlmc->Invoke("data","sqlQuery",$strServer))
			{			
				$this->_xmlDom = $xmlmc->xmlDom;

				//-- check if we need fomatted values - if so get sql again and store formated xml
				if($strFormat=="true")
				{
					$xmlmcf = new XmlMethodCall();
					$xmlmcf->SetParam("database",$strDB);
					$xmlmcf->SetParam("query",$strSQL);
					$xmlmcf->SetParam("formatValues","true");
					if($intRowLimit!="")$xmlmcf->SetParam("maxResults",$intRowLimit);
					if($xmlmcf->Invoke("data","sqlQuery",$strServer))
					{
						$this->_xmlDomFormatted = $xmlmcf->xmlDom;
					}
				}

				//-- move to first row
				$this->_process_metadata($xmlComplexConversions); //-- store col info
				$this->movefirst();
				$this->_failed = false;
				return true;
			}
			else
			{
				$this->_lasterrorcode = $xmlmc->GetLastErrorCode();
				$this->_lasterror = $xmlmc->GetLastError();
				$this->_failed = true;
				return false;
			}
		}


		//-- store bespoke function names aagainst defined columns

		//-- store column names
		function _process_metadata($xmlComplexConversions = null)
		{
					var_dump(0);
		//-- get any complexconversion info
			$this->_columns = Array();
			$arrDM = $this->_xmlDom->get_elements_by_tagname("metaData");
			$xmlMD = $arrDM[0];
			if($xmlMD)
			{
				var_dump(1);
				$children = $xmlMD->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					var_dump(2);
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$this->$strColName = new _swm_Column("","");
						$this->_columns[$strColName] = $this->$strColName;

						//-- now get the complex defs for this column	
						if($xmlComplexConversions)
						{
							$complexChild = $xmlComplexConversions->get_elements_by_tagname($strColName);
							if($complexChild[0])
							{
								$this->_columns[$strColName]->_complexfunctions = Array();
								$complexChildren = $complexChild[0]->child_nodes();
								$xTotal = count($complexChildren);
								for ($x=0;$x<$xTotal;$x++)
								{
									$complexNode = $complexChildren[$x];
									if($complexNode->node_name()!="#text" && $complexNode->node_name()!="#comment")
									{
										//echo $strColName .".".$complexNode->node_name()."=".$strConversionFunctionName ."<br>";
										$strConversionFunctionName = $complexNode->get_content();
										$this->_columns[$strColName]->_complexfunctions[$complexNode->node_name()] = $strConversionFunctionName;
									}
								}
							}
						}
					}
				}
			}
		}

		function eof()
		{
			if($this->_xmlDom==null)
				return true;
			$arrRows = $this->_xmlDom->get_elements_by_tagname("row");
			return ($this->_rowposition==count($arrRows) || $this->_rowposition==-1)?true:false;
		}

		function bof()
		{
			return ($this->_rowposition==0)?true:false;
		}

		function fetch()
		{
			//-- load current row columns into column class that has .value and .formattedvalue
			$arrRows = $this->_xmlDom->get_elements_by_tagname("row");
			if($arrRows[$this->_rowposition])
			{
				//-- set data values for returned columns
				foreach($this->_columns as $strColName => $aCol)
				{
					$xmlCol = $arrRows[$this->_rowposition]->get_elements_by_tagname($strColName);
					if($xmlCol[0])
					{
						$strRawValue = $xmlCol[0]->get_content();
						$strFormattedValue = "";
						//-- set formatted value if we have one
						if($this->_xmlDomFormatted!=null)
						{
							$arrFormattedRows = $this->_xmlDomFormatted->get_elements_by_tagname("row");
							$formattedchildren = $arrFormattedRows[$this->_rowposition]->get_elements_by_tagname($strColName);
							if($formattedchildren[0])
							{
								$formattedColNode = $formattedchildren[0];
								$strFormattedValue = $formattedColNode->get_content();
							}
							else
							{
								$strFormattedValue = ""; //-- something like date epoch that is 0 so returns nothing
							}

						}
						
						//-- set values
						$this->_columns[$strColName]->value = $strRawValue;
						$this->_columns[$strColName]->_formattedvalue = $strFormattedValue;

					}
					else
					{
						$this->_columns[$strColName]->value = "";
						$this->_columns[$strColName]->_formattedvalue = "";
					}

				}//-- eof for each column
				//-- get complex values
				foreach($this->_columns as $strColName => $aCol)
				{
					foreach($aCol->_complexfunctions as $strComplexName => $strFunctionName)
					{
						if(function_exists($strFunctionName))
						{
							$this->_columns[$strColName]->$strComplexName = $strFunctionName($aCol->value,$aCol->_formattedvalue,$this->_columns);
						}
						else
						{
							$aCol>$strComplexName = "";
						}
					}
				}
			}
		}

		function movenext()
		{
			$this->_rowposition++;
			$arrRows = $this->_xmlDom->get_elements_by_tagname("row");
			if($arrRows[$this->_rowposition])
			{
				return $this->fetch();
			}
			else
			{
				$this->_rowposition=-1;
				return false;
			}
		}

		function moveprev()
		{
			$this->_rowposition--;
			$arrRows = $this->_xmlDom->get_elements_by_tagname("row");
			if($arrRows[$this->_rowposition])
			{
				return $this->fetch();

			}
			else
			{
				$this->_rowposition=-1;
				return false;
			}
		}

		function movefirst()
		{
			$arrRows = $this->_xmlDom->get_elements_by_tagname("row");
			if(count($arrRows)>0)
			{
				$this->_rowposition=0;
				$temp = $this->fetch();
				return $temp;
			}
			else
			{
				$this->_rowposition=-1;
				return false;
			}
		}

		function movelast()
		{
			$arrRows = $this->_xmlDom->get_elements_by_tagname("row");
			if(count($arrRows)>0)
			{
				$this->_rowposition=count($arrRows)-1;
				return $this->fetch();
			}
			else
			{
				$this->_rowposition=-1;
			}
		}

		function GetLastError()
		{
			return $this->_lasterror;
		}
		function GetLastErrorCode()
		{
			return $this->_lasterrorcode;
		}

		function QueryFailed()
		{
			return $this->_failed;
		}

		function EmbedDataIntoString($strPointerName, $strOriginal)
		{
			$arrFind = Array();
			$arrReplace = Array();

			//-- store class method names
			$class_methods = get_class_methods("_swm_Column");

			foreach($this->_columns as $sColName => $aCol)
			{
				//-- get each public var in aCol as this is a valid value to check for
	            foreach($aCol as $varName => $varValue) 
				{
					//-- private vars begin with _
					if(strpos($varName,"_")===0) continue;

					$strFindValueString = "[:".$strPointerName .".".$sColName.".".$varName."]";			
					if(strpos($strOriginal,$strFindValueString)!==false)
					{
						$strReplaceValueString = $varValue;
					
						//-- add to the find and replace arrays
						$arrFind[] = $strFindValueString;
						$arrReplace[] = $strReplaceValueString;
					}
				}

				//--
				//-- now get any function generated values
				foreach ($class_methods as $method_name)
				{
					//-- private mehods begin with _
					if(strpos($method_name,"_")===0) continue;

					//-- find pointer 
					$strFindValueString = "[:".$strPointerName .".".$sColName.".".$method_name."]";			
					if(strpos($strOriginal,$strFindValueString)!==false)
					{

						//- -we have a pointer so get swap value and store
						$strReplaceValueString = $aCol->$method_name($this);
						//-- add to the find and replace arrays
						$arrFind[] = $strFindValueString;
						$arrReplace[] = $strReplaceValueString;
					}
				}
			}

			$strReplaced = str_replace($arrFind, $arrReplace, $strOriginal);
			return $strReplaced;
		}

		function create_rs_from_local_xml($xmlData,$xmlConversion)
		{
			$this->_xmlDom = $xmlData;
			$this->_process_metadata($xmlConversion); 
			$this->movefirst();
		}

	}

	/*//-- column class
	class _swm_Column
	{
		var $value = "";
		var $_formattedvalue = "";
		var $_complexfunctions = Array();
		function _swm_Column($strRawValue,$strFormattedValue = "")
		{
			$this->value = $strRawValue;
			$this->_formattedvalue = $strFormattedValue;
		}

		//--
		//-- functions to return different type of formatting of values
		//-- called in outputprocessor as [:rs.colname.functionaname] i.e. [:row.status.formattedvalue]
		
		function formattedvalue()
		{
			if($this->_formattedvalue=="")return $this->value;
			return $this->_formattedvalue;
		}

		//-- return html ready value
		function htmlvalue()
		{
			return nl2br(_html_encode($this->value));
		}
		//- -return the formatted value as html ready
		function htmlformattedvalue()
		{
			//-- no formatted value so try raw
			if($this->_formattedvalue=="")return  $this->htmlvalue();
			return nl2br(_html_encode($this->formattedvalue()));
		}
		//-- return N/A is value is blank
		function navalue()
		{
			if($this->value=="")return "N/A";
			return $this->value;
		}
		//-- return N/A if formatted value and value is blank
		function naformattedvalue()
		{
			if($this->_formattedvalue=="")return  $this->navalue();
			return $this->formattedvalue();
		}

		//-- return N/A is htmlvalue is blank
		function nahtmlvalue()
		{
			if($this->value=="")return "N/A";
			return $this->htmlvalue();
		}

		//-- return N/A if html formatted value and html value is blank
		function nahtmlformattedvalue()
		{
			if($this->_formattedvalue=="")return  $this->nahtmlvalue();
			return $this->htmlformattedvalue();
		}

		//-- return epoch formatted according to aid settings for datetime
		function datetime()
		{
			return _get_analyst_formatted_datetime($this->value);
		}

		//-- return epoch value formatted according to aid settings for date
		function date()
		{
			return _get_analyst_formatted_date($this->value);
		}

		//-- return epoch converted date if already set by api otherwise convert ourselves
		function epochformatted()
		{
			$val = $this->formattedvalue();
			if(is_numeric($val)) return "";
			return $val;
		}
		
		//-- return epoch converted date or N/A not formatted 0
		function epochnaformatted()
		{
			$val = $this->formattedvalue();
			if(is_numeric($val)) 
			{
				return "N/A";
			}
			return $val;
		}

		//-- return raw value with any Z/-UTC dates in it formatted
		function valuedates()
		{
			return _get_text_formatted_date($this->value);
		}

		//-- return formatted value with any Z/-UTC dates in it formatted
		function formatteddates()
		{
			return _get_text_formatted_date($this->formattedvalue());
		}
		//-- return html formatted value with any Z/-UTC dates in it formatted
		//-- return raw value with any Z/-UTC dates in it formatted
		function htmlvaluedates()
		{
			return _get_text_formatted_date($this->htmlvalue());
		}

		//-- return formatted value with any Z/-UTC dates in it formatted
		function htmlformatteddates()
		{
			return _get_text_formatted_date($this->htmlformattedvalue());
		}

	}*/


?>