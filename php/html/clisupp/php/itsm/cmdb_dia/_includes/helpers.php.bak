<?php
	if($strVerbose)log_action("Loaded: helpers.php");

	//-- include the script which should set a var $sqlCommand and optionally $sqlDatabase
	$sqlDatabase = swfc_source();
	$sqlCommand  = "";
	
	//-- handle instance we dev has set alt name 
	if($sqlDatabase=="syscache"||$sqlDatabase=="swcache")$sqlDatabase = "sw_systemdb";


	function getSharedData()
	{
		global $includepath;
		$sharedData = @file_get_contents($includepath."sqsstore.ser");
		if($sharedData===false) 
		{
			$sharedData = new stdClass();
			$sharedData->tables = Array();
			$sharedData->tablePrimaryKeys = Array();
			setSharedData($dataObject);
		}
		else
		{
			$sharedData = unserialize($sharedData);
		}
		return $sharedData;
	}

	function setSharedData($dataObject)
	{
		global $includepath;
		$s = serialize($dataObject);
		$fp = fopen($includepath."sqsstore.ser", 'w');
		fwrite($fp,$s);
		fclose($fp);
	}

	

	//-- a param can be <postvar>:<optionalvalidationcheck>:<optionalvalidationcheck> ..
	function validateSqlParam($strParam, $boolEmptyIsOK)
	{
		$arrParamParts = explode(":",$strParam);
		$strParamValue = $_POST[$arrParamParts[0]];

		if(!$boolEmptyIsOK && $strParamValue=="")
		{
			//-- throw error
			throwError("-100","Missing value for mandatory parameter (".$arrParamParts[0]."). Please contact your Administrator.");
		}
		
		$boolSplitAndPfs = false;
		$boolEncaps = false;
		for($x=1;$x<count($arrParamParts);$x++)
		{
			$valType = strToLower($arrParamParts[$x]);


			//--
			//-- do we want to call a class method to validate value i.e. cmdb->can_delete(boolShowMessage) will always pass in true param as the 
			//-- class permission method should accept boolean as to wether or not to throw error
			if(strpos($valType,".")!==false)
			{
				$arrClass = explode(".",$valType);
				$className = $arrClass[0]; 
				global ${$className};
				if(isset(${$className}))
				{
					$methodName = $arrClass[1];
					if(method_exists(${$className},$methodName))
					{
						$res =  ${$className}->{$methodName}(true);
						if(!$res)
						{
							throwError("-100","You do not have sufficient privileges to perform this operation. Please contact your Administrator.");
						}
					}
					else
					{
						throwError("-100","Invalid privileges validation type [".$valType."]. Please contact your Administrator.");
					}
				}
			}
			else if($valType=="array")
			{
				$boolSplitAndPfs = true;
			}
			else if ($valType=="sarray")
			{
				$boolSplitAndPfs = true;
				$boolEncaps = true;
			}
			else if(!_validate_url_param($strParamValue,$valType,$boolEmptyIsOK))
			{
				throwError("-100","Incoming parameter failed url validation. Please contact your Administrator.");
			}
		}
		

		//-- do we need to split and prepare comma list
		if($boolSplitAndPfs)
		{
			$strEncaps = ($boolEncaps)?"'":"";
			$strReturnValue = "";
			$arrValues = explode(",",$strParamValue);

			for($x=0;$x<count($arrValues);$x++)
			{
				//-- if array of numbers and current val is not numeric error
				if(!$boolEncaps && !is_numeric($arrValues[$x]))
				{
					throwError("-100","Incoming parameter failed url validation. Please contact your Administrator.");
				}

				if($strReturnValue != "") $strReturnValue .= ",";
				$strReturnValue .= $strEncaps . pfs($arrValues[$x]) . $strEncaps;
			}
			return $strReturnValue;
		}
		else
		{
			return pfs($strParamValue);
		}
	}

	//-- load session info - if not already loaded
	function loadSessionInfo()
	{
		global $_core, $strVerbose;
		if($_core['_sessioninfo'] == null)
		{
			if(isset($_SESSION["getsessioninfo2"]))
			{
				//-- webclient session info
				$dom = domxml_open_mem($_SESSION["getsessioninfo2"]);
				$_core['_sessioninfo'] = generatesessionobject($dom);
			}else if (isset($_POST["sessioninfo2"]))
			{
				//-- c++ session info
				$dom = domxml_open_mem($_POST["sessioninfo2"]);
				$_core['_sessioninfo'] = generatesessionobject($dom);
			}else
			{
				//-- get session info using xmlmc - use existing session id
				$xmlmc = new XmlMethodCall();
				if(!$xmlmc->invoke("session","getSessionInfo2"))
				{
					echo $xmlmc->xmlresult;
					if($strVerbose)log_action($xmlmc->xmlresult);
					exit(0);
				}
				$_core['_sessioninfo'] = generatesessionobject($xmlmc->xmlDom);
			}
		}
		return $_core['_sessioninfo'];
	}

	function setContentType($bJson = "")
	{
		if($bJson=="" && $_POST['asjson'])
		{
			header('Content-type: text/json');
		}
		else
		{
			header('Content-type: text/xmlmc');
		}
	}

	function prepareCommaDelimitedValues($strCommaValues, $strTable, $strWhereCol, $db="swdata")
	{
		$arrKeyValues = explode(",",$strCommaValues);
		$strPreparedKeys = "";
		while (list($pos,$keyValue) = each($arrKeyValues))
		{
			if($strPreparedKeys != "")$strPreparedKeys .= ",";
			$strPreparedKeys .= encapsulate($strTable, $strWhereCol,$keyValue,$db);
		}

		return $strPreparedKeys;
	}

	function prepareStringCommaDelimitedValues($strCommaValues)
	{
		$arrKeyValues = explode(",",$strCommaValues);
		$strPreparedKeys = "";
		while (list($pos,$keyValue) = each($arrKeyValues))
		{
			if($strPreparedKeys != "")$strPreparedKeys .= ",";
			$strPreparedKeys .= "'".pfs($keyValue)."'";
		}
		return $strPreparedKeys;
	}

	function prepareNumericCommaDelimitedValues($strCommaValues)
	{
		$arrKeyValues = explode(",",$strCommaValues);
		$strPreparedKeys = "";
		while (list($pos,$keyValue) = each($arrKeyValues))
		{
			if(!is_numeric($keyValue))
			{
				throwError(-100,"Numeric delimited validation failed. One of the values is not numeric.");
				exit;
			}
			if($strPreparedKeys != "")$strPreparedKeys .= ",";
			$strPreparedKeys .= pfs($keyValue);
		}
		return $strPreparedKeys;
	}

	function getAppcodeFilter($strArea, $strCurrentDD)
	{
		$strAppcode = "";
		$strSQL = "select SETTING_VALUE from SW_SETTINGS where PK_SETTING = '" . PrepareForSql($strArea)."'";
		$oRS = new SqlQuery();
		$oRS->Query($strSQL);
		if($oRS->Fetch())
		{
			$strSetting  = $oRS->GetValueAsString("SETTING_VALUE");
			$arrAppcodes = explode("|",$strSetting);
			foreach($arrAppcodes as $indAppcode)
			{
				if("![CURRENT.DD]!"==$indAppcode)
					$indAppcode = $strCurrentDD;
				if($strAppcode!="")
					$strAppcode .=",";
				$strAppcode .="'".PrepareForSql($indAppcode)."'";
			}
		}
		return $strAppcode;
	}

	//-- append app code to current filter
	function getAppcodeFilterClause($parsedFilter)
	{
		global $session;
		$boolUseAppCode = isset($_POST["_ac"]);

		//-- app code in
		if($_POST['_acin']!="")
		{
			$colValue = prepareStringCommaDelimitedValues($_POST['_acin']);

			//-- oracle mods
			if($session->oracleInUse)
			{
				$strAppCodeString = " UPPER(APPCODE) IN (".UC($colValue ).")";
			}
			else
			{
				$strAppCodeString = " APPCODE IN (".$colValue.")";
			}

			if($parsedFilter =="")
			{
				$parsedFilter  = $strAppCodeString;
			}
			else
			{
				$parsedFilter = "(".$strAppCodeString.") AND (" . $parsedFilter . ")";
			}
		}
		else if($boolUseAppCode || isset($_POST[$sPrefix."appcode"])) //-- appcode =
		{
				$colName = "appcode";
				$colValue = "'" . PrepareForSql($session->currentDataDictionary) . "'";

				//-- oracle mods
				if($session->oracleInUse)
				{
					$colName = " UPPER(" . $colName . ") ";
					$colValue = " UPPER(" . $colValue . ") ";
				}

				if($parsedFilter =="")
				{
					$parsedFilter  = $colName . " = ". $colValue;
				}
				else
				{
					$parsedFilter = "(".$colName . " = ". $colValue.") AND (" . $parsedFilter . ")";
				}
		}
		return $parsedFilter;
	}

	function checkMandatoryParams($strParams)
	{
		$arrParams = explode(",",$strParams);
		while (list($pos,$paramName) = each($arrParams))
		{
			if(!isset($_POST[$paramName]) || $_POST[$paramName]=="")
			{
				throwError(-100,"Missing expected parameter. Please contact your Administrator.");
			}
		}
	}

	function checkParamsExist($strParams)
	{
		$arrParams = explode(",",$strParams);
		while (list($pos,$paramName) = each($arrParams))
		{
			if(!isset($_POST[$paramName]))
			{
				throwError(-100,"Missing expected parameter. Please contact your Administrator.");
			}
		}
	}

	//-- exit script with a row count response
	function throwRowCountResponse($intCount = 0)
	{
		setContentType();
		echo generateRowCountString($intCount);
		exit(0);
	}
	
	//-- exit with success
	function throwSuccess($iRowsAffected = 0)
	{
		setContentType();
		echo generateSuccessString($iRowsAffected);
		exit(0);
	}

	//-- global.js submitsqp - exit with true and message
	function throwProcessSuccessWithMsg($msg)
	{
		setContentType();
		echo generateProcessSuccessString(-3, $msg);
		exit(0);
	}

	//-- global.js submitsqp - exits with a string to return to caller
	function throwProcessSuccessWithResponse($response)
	{
		setContentType();
		echo generateProcessSuccessString(-4, "", $response);
		exit(0);
	}

	//-- global.js submitsqp - exit with string to return and optional message to alert
	function throwProcessSuccessWithResponseAndMsg($response, $msg)
	{
		setContentType();
		echo generateProcessSuccessString(-4, $msg,$response);
		exit(0);
	}


	//-- global.js submitsqp - exit with false and on message
	function throwProcessSilentError()
	{
		setContentType();
		echo generateProcessSuccessString(-2);
		exit(0);
	}

	//-- exit with error and message
	function throwProcessErrorWithMsg($msg)
	{
		setContentType();
		echo generateProcessSuccessString(-2,$msg);
		exit(0);
	}

	//-- exit with error
	function throwError($code,$msg)
	{
		setContentType();
		echo generateCustomErrorString($code, $msg);
		exit(0);
	}

	function parseFloat($var)
	{
		return floatval($var);
	}
	function parseInt($var)
	{
		return intval($var);
	}
	function parseBool($var,$bEmtpyIsTrue=false)
	{
		if($bEmtpyIsTrue && $var=="")return true;

		if(LC($var)=="true" || $var=="1" || $var==1 || $var===true)return true;
		return false;
	}

	function format_float_to_decimal_str($fltNumber)
	{
		$fltNumber = (string) $fltNumber;
		$newNum = "";
		$strIndex = strpos($fltNumber,".",0);
		if($strIndex > -1)
		{
			$newNum = substr($fltNumber,0, $strIndex+3);
			if(($strIndex+3)-strlen($newNum))$newNum .= "0";
		}
		else
		{
			if($fltNumber=="")$fltNumber = "0";
			$newNum = $fltNumber.".00";
		}
		return $newNum;
	}

	function get_readable_datetime($nTime = time)
	{
		return date("d/m/Y H:i:s",$nTime);                   
	}

	function number_to_time($intTime)
	{
		$intTime = (string)$intTime;

		if(strpos($intTime,"."))
		{
			//-- we have something like 1.30
			$arrTime = explode(".",$intTime);
			$hh = parseInt($arrTime[0]);
			$mm = parseInt($arrTime[1]);
			$iNum = $hh + ($mm/60);
			$intTime = $iNum;
		}
		return convert_to_money($intTime);
	}
	function convert_to_money($inValue)
	{
		$inValue = parseFloat($inValue);
		if (!is_numeric($inValue))
		{
			return "0.00";
		}
		else
		{
			//-- make sure a positive number
			if ($inValue < 0) return  "0.00";
			if ($inValue == 0) return "0.00";

			$inValue=round($inValue*100)/100; //returns 2 decimal places
			$inValue = strval($inValue);
			$strLen = strlen($inValue);
			$dotpos = strpos($inValue,".");
			if ($dotpos!==false)
			{
				//-- split by "."
				$tmpArray = explode($inValue,".");
				if (count($tmpArray) > 2)
				{
					//-- too many dots
					return "0.00";
				}
				else
				{
					//--
					$pounds = $tmpArray[0];
					$pence = $tmpArray[1];
					if ($pence > 99)
					{
						return "0.00";
					}
					
					if (($pence < 10) && (strlen($pence) < 2)) $pence .= "0"; 
					return $pounds . "." . $pence;
				}
			}
			else
			{
				//-- there is no "."
				//-- so add ".00"
				return $inValue . ".00";
			}
		}
	}
	function mins_from_perc($intTime)
	{
		$intTime = strval($intTime);

		if(strpos($intTime,".")!==false)
		{
			//-- we have something like 1.30
			$arrTime = explode($intTime,".");
			$hh = parseInt($arrTime[0]);
			$mm = parseInt($arrTime[1]);
									
			//--87281 times by ten if below ten (30 percent is 3 here)
			if($mm<10)
			{
				$mm = $mm*10;
			}

			$iNum = (($mm/100)*60);
			//--87281 round the value to the nearest minute (17.9999999999 rounds to 18mins)
			$iNum = round($iNum);

			if($iNum < 10) $iNum = $iNum . "0";
			$intTime =  $hh .".".$iNum;
		}

		return $intTime;
	}


	function fix_epoch($intEpoch)
	{
		if ($intEpoch <0)
		{
			$intEpoch = (1073741824-($intEpoch*-1))+1073741824;
		}
		return $intEpoch;
	}

	function UC($strVar)
	{
		return strToUpper($strVar);
	}
	function LC($strVar)
	{
		return strToLower($strVar);
	}

	//-- run sql statement - returns only true or false
	function submitsql($query,$db = "swdata")
	{
		$oRS = new SqlQuery();
		return $oRS->Query($query,$db);
	}

	function SqlExecute($db,$query)
	{
		$oRS = new SqlQuery();
		$oRS->Query($query,$db);
		return $oRS->rowsAffected; 
	}

	function get_rowcount($strTable,$strWhere = "",$strDatabase="swdata")
	{
		//-- count sql
		$query = "select count(*) as counter from " . UC($strTable);
		if($strWhere!="")
		{
			$query .= " where ". $strWhere;
		}

		$oRS = new SqlQuery();
		if($oRS->Query($query,$strDatabase))
		{
			$oRS->Fetch();
			return $oRS->row->counter-0;
		}

		return -1;

	}

	function get_recordwhere($strTable,$strWhere)
	{
		$query = "select * from " . $strTable . " where ". $strWhere;
		$oRS = new SqlQuery();
		if($oRS->Query($query))
		{
			$oRS->Fetch();
			$arrData = array();
			while (list($strColName,$varColValue) = each($oRS->row))
			{
				$arrData[$strColName] = $varColValue;
			}
			return $arrData;
		}

		return false;

	}

	function get_record($strTable,$strKey, $db = "swdata", $strOverrideCol = "")
	{	
		if( $strOverrideCol=="")
		{
			$keyColumn = getTablePrimaryKeyName($strTable, $db);
		}
		else
		{
			$keyColumn = $strOverrideCol;
		}

		$query = "select * from " . $strTable . " where ". $keyColumn . " = " . encapsulate($strTable,$keyColumn,$strKey);
		$oRS = new SqlQuery();
		if($oRS->Query($query,$db))
		{
			if($oRS->Fetch())
			{
				$arrData = array();
				while (list($strColName,$varColValue) = each($oRS->row))
				{
					$arrData[$strColName] = $varColValue;
				}
				return $arrData;
			}
		}
		return false;
	}

	function get_field($aRS,$strCol){
		return $aRS->GetColumnValue($strCol);
	}

	//-- run sql statement - returns only true or false
	function get_recordset($query,$db = "swdata")
	{
		$oRS = new SqlQuery();
		$oRS->Query($query,$db);
		return $oRS;
	}


	class dd
	{
		var $tables=array();
		function dd($strLoadTables = "" , $db = "swdata")
		{
			if($strLoadTables=="")return;

			$arrTables = explode(",",$strLoadTables);
			while (list($pos,$tableName) = each($arrTables))
			{
				$this->loadTable($tableName, $db);
			}
		}

		function loadTable($strTable, $db = "swdata", $bSkipError = false)
		{
			//-- fetch table info  
			if(!isset($this->tables[$strTable]))
			{
				//--
				//-- check if in shared memory
				$sharedData = getSharedData();
				if($sharedData->tables[$strTable])
				{
					$this->tables[$strTable] = $sharedData->tables[$strTable];
				}
				else
				{
					$this->tables[$strTable] = new ddTable($strTable, $db,$bSkipError);

					if(count($this->tables[$strTable]->columns)==0) $this->tables[$strTable] = false;

					//-- store in _sw_sqs
					$sharedData->tables[$strTable] = $this->tables[$strTable];
					setSharedData($sharedData);
				}
			}
			return $this->tables[$strTable];
		}
	}

	class ddTable
	{
		var $Name = "";
		var $columns = array();
		var $namedcolumns = array();
		var $db = "swdata";
		var $tableXmlDom = "";
		function ddTable($strTable, $db = "swdata", $bSkipError = false)
		{
			if($strTable=="")
			{
				throwError(-100,"Missing table name for dd instance creation. Please contact your Administrator.");
			}

			$this->db = $db;
			$this->Name = $strTable;
			$tableXmlDom = getTableColumnInfo($strTable, $db);
			
			if($tableXmlDom)
			{
				$arrColumnsDom = $tableXmlDom->get_elements_by_tagname("columnInfo");
				while (list($pos,$columnNode) = each($arrColumnsDom))
				{
					$colName = gxc($columnNode,"name");
					$colDisplay = gxc($columnNode,"displayName");
					$colDataType = gxc($columnNode,"dataType");
					$aCol = new ddColumn($colName,$colDisplay,$colDataType);

					array_push($this->columns, $aCol);
					$this->namedcolumns[LC($colName)] = $aCol;
				}
			}
			else
			{
				if(!$bSkipError)throwError(-100,"Unknown table name [".$strTable."] for dd [".$db."] table instance creation. Please contact your Administrator.");
			}
		}

		function PrimaryKey()
		{
			return getTablePrimaryKeyName($this->Name,$this->db);
		}
	}
	class ddColumn
	{
		var $Name = "";
		var $DisplayName = "";
		var $DataType = "";
		function ddColumn($colName,$colDisplay,$colDataType)
		{
			$this->Name = $colName;
			$this->DisplayName = $colDisplay;
			$this->DataType = intval($colDataType);
		}

		function IsNumeric()
		{
			return ($this->DataType==18);

			switch($this->DataType)
			{
				case SW_SQLTYPE_Unknown:
				case SW_SQLTYPE_VARCHAR:
				case SW_SQLTYPE_BLOB:
				case SW_SQLTYPE_TEXT:
				case SW_SQLTYPE_DATETIME:
					return false;
			}
			return true;
		}
	}

	//-- class to mimic basic js sqlquery class - so can run query and loop result set 
	class SqlQuery
	{
		var $result = false;
		var $currentrow = -1;
		var $rowsAffected=-1;
		var $row = 	null;
		var $nrow = null;
		var $colnames = null;
		var $xmlmc = null;
		var $lastErrorResponse = "";
		function Query($strSQL,$strDB = "swdata")
		{
			//-- replace any instances of ![] :[] with posted vars and run any defined checks
			//$strSQL = parseEmbeddedParameters($strSQL);

			$this->Reset();

			if($strDB=="syscache")$strDB="sw_systemdb";

			$this->xmlmc = new XmlMethodCall ();
			$this->xmlmc->SetParam("database",$strDB);
			$this->xmlmc->SetParam("query",$strSQL);
			$this->xmlmc->SetParam("formatValues","false");
			$this->xmlmc->SetParam("returnMeta","true");
			$this->xmlmc->SetParam("returnRawValues","true");
			$this->result = $this->xmlmc->invoke("data","sqlQuery");	
			if($this->result)
			{
				$this->rowsAffected = gxc($this->xmlmc->xmlDom,"rowsEffected");
			}
			else
			{
				$this->lastErrorResponse = $this->xmlmc->xmlresult;
			}

			return $this->result;
		}

		function HasError()
		{
			return ($this->result)?false:true;
		}
		function GetLastError()
		{
			return $this->lastErrorResponse;
		}

		function Fetch()
		{
			if(!$this->result) return false;

			//-- move to next row
			$arrData = $this->xmlmc->xmlDom->get_elements_by_tagname("rowData");
			if($arrData[0])
			{
				$rowData = $arrData[0]->get_elements_by_tagname("row");
				if($rowData[$this->currentrow+1])
				{
					$this->currentrow++;

					//-- have a row so store col values in row array
					$this->row = new stdClass();
					$this->colnames = array();
					$this->nrow = array();
					$childnodes = $rowData[$this->currentrow]->child_nodes();
					foreach ($childnodes as $aColumn)
					{
						if($aColumn->tagname!="")
						{
							//-- get any nodes so long as they have a tagname
							array_push($this->colnames,strToLower($aColumn->tagname));
							array_push($this->nrow,$aColumn->get_content());
							$this->row->{strToLower($aColumn->tagname)} = $aColumn->get_content();
						}
					}
					return true;
				}
			}
			return false;
		} //-- eof function FETCH

		function GetColumnCount()
		{
			return sizeof($this->colnames);
		}

		function GetColumnName($intPos)
		{
			if(is_numeric($intPos))
			{
				$intPos = $this->colnames[$intPos];
			}
			return $intPos;
		}

		function IsColNumeric($strCol)
		{
			if(is_numeric($strCol))
			{
				$strCol = $this->colnames[$strCol];
			}

			$arrData = $this->xmlmc->xmlDom->get_elements_by_tagname("metaData");
			if($arrData[0])
			{
				$colData = $arrData[0]->get_elements_by_tagname(LC($strCol));
				if($colData[0])
				{
						$strType = gxc($colData[0],"dataType");
						if($strType!="string" && $strType!="varchar" && $strType!="text")return true;
				}
			}
			return false;
		}

		function GetValueAsString($strCol)
		{
			if(is_numeric($strCol))
			{
				return $this->nrow[$strCol];
			}
			else
			{
				return $this->row->{strToLower($strCol)};
			}
		}

		function GetColumnValue($strCol)
		{
			if(is_numeric($strCol))
			{
				return $this->nrow[$strCol];
			}
			return $this->row->{strToLower($strCol)};
		}


		function GetValueAsNumber($strCol)
		{
			if(is_numeric($strCol))
			{
				return $this->nrow[$strCol]-0;
			}
			else
			{
				return $this->row->{strToLower($strCol)}-0;
			}
		}

		function Reset()
		{
			$this->row = new StdClass();
			$this->nrow = array();
			$this->colnames = array();
			$this->rowsAffected=-1;
			$this->currentrow = -1;
			$this->xmlmc=null;
			$this->lastErrorResponse="";
			$this->result=false;
		}
	}

	//-- wrapper for php time
	function GetCurrentEpocTime()
	{
		return time();
	}

	function copyRecord($strTable, $copyFromColumn,$copyFromKeyValue,$copyToKeyValue, $boolReturnFalseOnError = true)
	{
		//-- select record to copy
		$strPrimaryKey = getTablePrimaryKeyName($strTable);
		if($strPrimaryKey=="")
		{
			throwError(-200,"Failed to get primary key column for [".$strTable."]. Please contact your administrator."); //-- fail and exit
		}

		//-- if primary key is same as from from col then we will need to set it
		if($copyFromColumn==$strPrimaryKey)$strPrimaryKey="";

		$strSelect = "select * from " . $strTable . " where " . $copyFromColumn . " = " . encapsulate($strTable,$copyFromColumn,$copyFromKeyValue);
		$oRS = new SqlQuery();
		if(!$oRS->Query($strSelect))
		{
			throwError(-200,"Failed to select record for copy on [".$strTable."]. Please contact your administrator."); //-- fail and exit
		}

		while($oRS->Fetch())
		{
			$strCols = "";
			$strValues = "";
			while (list($colName,$colValue) = each($oRS->row))
			{
				if ($colName != $strPrimaryKey)
				{
					if (strToUpper($colName) == strToUpper($copyFromColumn))$colValue = $copyToKeyValue;

					if($strCols != "")$strCols .= ",";
					$strCols .= strToUpper($colName);
				
					if($strValues != "")$strValues .= ",";
					$strValues .= encapsulate($strTable,$colName,$colValue);		
				}
			}
			
			$strInsertSQL = "insert into " . strToUpper($strTable) . " ( " . $strCols . ") values (" . $strValues . ")";
			if(!submitsql($strInsertSQL))
			{
				if($boolReturnFalseOnError) return false;
			}
		}
		return true;
	}

	function dd_isnumeric($strTable,$strColumn,$db="swdata")
	{
		return isColNumeric($strTable, $strColumn);
	}

	function dd_fieldlabel($strTable,$strColumn,$db="swdata")
	{
		global $dbs;
		$tbl = $dbs->loadTable($strTable,$db);
		if(is_numeric($strColumn))
		{
			return $tbl->columns[$strColumn]->DisplayName;
		}
		else
		{
			if(!isset($tbl->namedcolumns[LC($strColumn)]))
			{
				throwError(-100,"dd_fieldlabel Failure : [".$strTable."][".$strColumn."] does not exist. Please contact your Administrator");
			}
			return $tbl->namedcolumns[LC($strColumn)]->DisplayName;
		}

	}


	function dd_primarykey($strTable, $db = "swdata") //-- mimic global.js
	{
		return getTablePrimaryKeyName($strTable, $db);
	}

	function getDatabaseTables($database = "swdata")
	{
		global $_core;

		$storedKey = "dbinfo_".$database;
		if(!isset($_core[$storedKey]))
		{
			$xmlmc = new XmlMethodCall ();
			$xmlmc->SetParam("database",$database);
			if($xmlmc->invoke("data","getTableInfoList"))
			{
				//-- store
				$_core[$storedKey] = $xmlmc->xmlDom;
			}
			else
			{
				echo generateCustomErrorString("-666","Failed to get table list on ".$database.". Please contact your Administrator.");
				exit(0);
			}
		}

		return $_core[$storedKey];
	}

	function getTableColumnInfo($strTable, $database = "swdata")
	{
		global $_core;
			
		$storedKey = "tableinfo_".$database."_".$strTable;
		if(!isset($_core[$storedKey]))
		{
			//-- get table columns
			$xmlmc = new XmlMethodCall ();
			$xmlmc->SetParam("database",$database);
			$xmlmc->SetParam("table",$strTable);
			if($xmlmc->Invoke("data","getColumnInfoList"))
			{
				//-- store
				$_core[$storedKey] = $xmlmc->xmlDom;
			}
		}
		return $_core[$storedKey];
	}

	function getTablePrimaryKeyName($inTableName,$database = "swdata")
	{
		global $_core;
		$inTableName = LC($inTableName);
		$storedKey = "tablekey_".$database."_".$inTableName;
		if(!isset($_core[$storedKey]))
		{
			$sharedData = getSharedData();
			if(isset($sharedData->tablePrimaryKeys[$storedKey]))
			{
				$_core[$storedKey] = $sharedData->tablePrimaryKeys[$storedKey];
			}
			else
			{
				//-- get table info for database and store all keys - and store in shared memory
				//-- so should only ever be called twice (across lifetime of all sessions) once for each db
				$dbInfo=getDatabaseTables($database);

				//-- find table in xmlDom
				$arrTables = $dbInfo->get_elements_by_tagname("tableInfo");
				while (list($pos,$tableNode) = each($arrTables))
				{
					$tableName = LC(gxc($tableNode,"name"));
					$priKeyName = gxc($tableNode,"primaryKey");

					//--
					//-- fix for systemdb.opencall where callref prikey is not set
					if($priKeyName=="" && $inTableName=="opencall")
					{
						$priKeyName = "callref";
					}

					//-- set return var
					if($tableName==$inTableName)
					{
						$_core[$storedKey] = $priKeyName;
					}

					//-- store in shared data object
					$altStoredKey = "tablekey_".$database."_".$tableName;
					$sharedData->tablePrimaryKeys[$altStoredKey] = $priKeyName;
				}

				//-- update shared data in memory
				setSharedData($sharedData);
			}
		}
		//-- if we get here table does not have a pk
		return $_core[$storedKey];
	}

	//-- do table update using key value
	function createTableUpdateFromParams($tableName,$keyValue, $db="swdata", $sPrefix = "_swc_")
	{
		$tableName = strToLower($tableName);

		global $dbs;
		$dbs->loadTable($tableName,$db);

		$strSets = "";
		foreach($_POST as $colName => $colValue) 
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));

				//-- check if $colName exists in schema
				$ddCol = $dbs->tables[$tableName]->namedcolumns[$colName];
				if($ddCol)
				{
					//-- prepare and encaps
					$colValue = PrepareForSql($colValue);
					if(!$ddCol->IsNumeric())$colValue = "'".$colValue."'";

					//-- if oracle use upper setting
					if($session->oracleInUse)$colName = strToUpper($colName);		

					if($strSets!="")$strSets .=",";
					$strSets .= UC($colName) ."=".$colValue;
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		//-- prepare key
		$keyCol = dd_primarykey($tableName, $db);
		$keyValue = PrepareForSql($keyValue);
		if(!isColNumeric($tableName, $keyCol, $db))$keyValue = "'".$keyValue."'";

		$strUpdate = "UPDATE " . UC($tableName) . " SET " . $strSets . " WHERE " . UC($keyCol) . "=" . $keyValue;
		return $strUpdate;

	}

	function createTableInsertFromParams($tableName, $db = "swdata",$sPrefix = "_swc_")
	{
		$tableName = strToLower($tableName);

		global $dbs;
		$dbs->loadTable($tableName,$db);

		$strCols = "";
		$strValues = "";
		foreach($_POST as $colName => $colValue) 
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));

				//-- check if $colName exists in schema
				$ddCol = $dbs->tables[$tableName]->namedcolumns[$colName];
				if($ddCol)
				{
					//-- prepare and encaps
					$colValue = PrepareForSql($colValue);
					if(!$ddCol->IsNumeric())$colValue = "'".$colValue."'";

					//-- if oracle use upper setting
					if($session->oracleInUse)$colName = strToUpper($colName);
				
					if($strValues!="")$strValues .=",";
					$strValues .= $colValue;

					if($strCols!="")$strCols .=",";
					$strCols .= UC($colName);
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		$strInsert = "INSERT INTO " . strToUpper($tableName) . " (".$strCols.") VALUES (".$strValues.")";
		return $strInsert;
	}

	function selectTableByCols($tableName, $db = "swdata", $bForCount = false, $sPrefix = "_swc_" )
	{
		global $session;
		$boolUseAppCode = isset($_POST["_ac"]);
		$tableName = strToLower($tableName);

		$bLoadTableInfo = ($db=="swdata" || $tableName=="opencall" || $tableName=="updatedb" || $tablename=="calltasks")?false:true;
		$bSet = false; 
		$parsedFilter = "";
		foreach($_POST as $colName => $colValue) 
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				if($bSet==false && $bLoadTableInfo)
				{
					$bSet=true;
					global $dbs;
					$dbs->loadTable($tableName,$db);
				}
				
				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));

				//-- check if $colName exists in schema
				$bColOk = false;
				if(!$bLoadTableInfo)
				{ 
					$bColOk = (swdti_getdatatype($tableName.".".$colName)!=-1);
				}
				else
				{
					$bColOk = $dbs->tables[$tableName]->namedcolumns[$colName];
				}
				if($bColOk)
				{
					//-- prepare and encaps
					$colValue = PrepareForSql($colValue);
					if(!isColNumeric($tableName,$colName))$colValue = "'".$colValue."'";

					//-- if oracle use upper setting
					if($session->oracleInUse)
					{
						$colName = " UPPER(" . $colName . ") ";
						$colValue = " UPPER(" . $colValue . ") ";
					}
					if($parsedFilter !="")$parsedFilter .= " AND ";
					$parsedFilter .= UC($colName) . " = " . $colValue;
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","selectTableByCols: Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		if($parsedFilter=="")
		{
			//-- exit
			echo generateCustomErrorString("-101","selectTableByCols: Where clause construction failed. Please contact your Administrator.");
			exit(0);
		}

		//-- are there any dates we need to add to filter (using between)
		$sDatePrefix = str_replace("_date","date_",$sPrefix . "date");
		$filteredbyDates = createDateBetweenFilter($tableName, $db,$sDatePrefix);
		if($filteredbyDates!="")
		{
			if($parsedFilter !="") $parsedFilter .= ($boolAND)?" AND ": " OR ";
			$parsedFilter .= $filteredbyDates;
		}

		//-- add appcode filter
		$parsedFilter = getAppcodeFilterClause($parsedFilter);

		if($bForCount)
		{
			$strSelect = "select count(*) as counter from ". strToUpper($tableName) . " where " . $parsedFilter;
		}
		else
		{
			$selectCols = "";
			if(isset($_POST['_distinct_']))
			{
				$selectCols = " distinct ";
			}
			if(isset($_POST['_select_']))
			{
				$selectCols = pfs($_POST['_select_']);
			}
			else
			{
				$selectCols .= "*";
			}
			$strSelect = "select ".UC($selectCols)." from ". strToUpper($tableName) . " where " . $parsedFilter;
		}
        return $strSelect;
	}

	function createPicklistFilterFromParams($tableName, $db="swdata", $sPrefix = "_swc_",$boolLike=true)
	{
		global $session;

		$boolAND		= true;
		$boolUseAppCode = false;

		$strLike = ($boolLike)?" like " : " = ";

		$bLoadTableInfo = ($db=="swdata" || $tableName=="opencall" || $tableName=="updatedb" || $tablename=="calltasks")?false:true;
		$bSet = false; 
		$parsedFilter = "";
		foreach($_POST as $colName => $colValue) 
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				if($bSet==false && $bLoadTableInfo)
				{
					$bSet=true;
					global $dbs;
					$dbs->loadTable($tableName,$db);
				}
				//-- remove prefix
				//$colName = str_replace($sPrefix,"",$colName);
				$colName = LC(str_replace($sPrefix,"",$colName));
				if($colName=="appcode")
					continue;

				//-- check if $colName exists in schema
				$bColOk = false;
				if(!$bLoadTableInfo)
				{ 
					$bColOk = (swdti_getdatatype($tableName.".".$colName)!=-1);
				}
				else
				{
					$bColOk = $dbs->tables[$tableName]->namedcolumns[$colName];
				}
				if($bColOk)
				{
					//-- prepare and encaps
					if(is_array($colValue))
					{
						$newColValue = "";
						foreach($colValue as $val)
						{
							if($newColValue!="")$newColValue.=",";
							if($session->oracleInUse)
							{
								$val = " UPPER(" . $val . ") ";
							}
							$val = PrepareForSql($val);
							if(!isColNumeric($tableName, $colName))$val = "'".$val."'";
							$newColValue .= $val;
						}
						if ($parsedFilter != "") $parsedFilter .= ($boolAND)?" AND ": " OR ";
						$parsedFilter .= $colName . " in (" . $newColValue .")";
					}
					else
					{
						$colValue = PrepareForSql($colValue);
						if(!isColNumeric($tableName, $colName))
						{
							if($boolLike)$colValue = "'".$colValue."%'";
							else $colValue = "'".$colValue."'";
						}
						else
						{
							$numVal =$colValue; 
						}

						//-- if oracle use upper setting
						if($session->oracleInUse)
						{
							$colName = " UPPER(" . $colName . ") ";
							$colValue = " UPPER(" . $colValue . ") ";
						}

						if ($parsedFilter != "") $parsedFilter .= ($boolAND)?" AND ": " OR ";
						if(isColNumeric($tableName, $colName))
						{
							if($numVal=="0")$parsedFilter .= "(" . UC($colName) . " = " . $colValue . " OR ". $colName . " is null)";
							else $parsedFilter .= UC($colName) . " = " . $colValue;
						}
						else
						{
							$parsedFilter .= $colName . $strLike . $colValue;
						}
					}
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		//-- app code in
		$parsedFilter = getAppcodeFilterClause($parsedFilter);

		return $parsedFilter;
	}


	function createTableFilterFromParams($tableName, $db="swdata", $sPrefix = "_swc_",$boolLike=true)
	{
		global $session;

		$boolAND = parseBool($_POST["_and"],true);
		
		$boolUseAppCode = isset($_POST["_ac"]);

		$tableName = strToLower($tableName);
		$strLike = ($boolLike)?" like " : " = ";

		$bLoadTableInfo = ($db=="swdata" || $tableName=="opencall" || $tableName=="updatedb" || $tablename=="calltasks")?false:true;
		$bSet = false;
		$parsedFilter = "";
		foreach($_POST as $colName => $colValue) 
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				if($bSet==false && $bLoadTableInfo)
				{
					$bSet=true;
					global $dbs;
					$dbs->loadTable($tableName,$db);
				}

				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));
				$bColOk = false;
				if(!$bLoadTableInfo)
				{ 
					$bColOk = (swdti_getdatatype($tableName.".".$colName)!=-1);
				}
				else
				{
					$bColOk = $dbs->tables[$tableName]->namedcolumns[$colName];
				}
				if($bColOk)
				{
					//-- prepare and encaps
					$bColNumeric = isColNumeric($tableName,$colName);
					$colValue = PrepareForSql($colValue);
					if(!$bColNumeric)
					{
						if($boolLike)$colValue = "'".$colValue."%'";
						else $colValue = "'".$colValue."'";
					}
					else
					{
						$numVal = $colValue;
					}

					//-- if oracle use upper setting

					if($session->oracleInUse)
					{
						$colName = " UPPER(" . $colName . ") ";
						$colValue = " UPPER(" . $colValue . ") ";
					}

					if ($parsedFilter != "") $parsedFilter .= ($boolAND)?" AND ": " OR ";
					if($bColNumeric)
					{
						if($numVal=="0")$parsedFilter .= "(" . UC($colName) . " = " . $colValue . " OR ". $colName . " is null)";
						else $parsedFilter .= UC($colName) . " = " . $colValue;

					}
					else
					{
						$parsedFilter .= UC($colName) . $strLike . $colValue;
					}
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		//-- are there any dates we need to add to filter (using between)
		$sDatePrefix = str_replace("_date","date_",$sPrefix . "date");
		$filteredbyDates = createDateBetweenFilter($tableName, $db,$sDatePrefix);
		if($filteredbyDates!="")
		{
			if($parsedFilter !="") $parsedFilter .= ($boolAND)?" AND ": " OR ";
			$parsedFilter .= $filteredbyDates;
		}

		//-- app code in
		$parsedFilter = getAppcodeFilterClause($parsedFilter);

		return $parsedFilter;
	}

	//-- find date params for filter i.e. _swcd_logdatex
	//-- filter will create between operator on each i.e. logate between value1 and value2
	//-- of if only one value supplied will do a >
	//-- parap value should be "epochvalue1,epochvalue2"
	function createDateBetweenFilter($tableName, $db="swdata", $sPrefix = "_swcdate_")
	{
		global $session;

		$boolAND		= parseBool($_POST["_and"],true);
		$boolUseAppCode = isset($_POST["_ac"]);

		$tableName = strToLower($tableName);
		
		$bLoadTableInfo = ($db=="swdata" || $tableName=="opencall" || $tableName=="updatedb" || $tablename=="calltasks")?false:true;
		$bSet = false;
		$parsedFilter = "";
		foreach($_POST as $colName => $colValue) 
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				if($bSet==false && $bLoadTableInfo)
				{
					$bSet=true;
					global $dbs;
					$dbs->loadTable($tableName,$db);
				}

				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));
				//-- check if $colName exists in schema
				$bColOk = false;
				if(!$bLoadTableInfo)
				{ 
					$bColOk = (swdti_getdatatype($tableName.".".$colName)!=-1);
				}
				else
				{
					$bColOk = $dbs->tables[$tableName]->namedcolumns[$colName];
				}
				if($bColOk)
				{
					//-- preparevalue
					$colValue = PrepareForSql($colValue);
					$arrDateValues = explode(",",$colValue);

					//-- if oracle use upper setting
					if($session->oracleInUse)
					{
						$colName = " UPPER(" . $colName . ") ";
						$colValue = " UPPER(" . $colValue . ") ";
					}

					if ($parsedFilter != "") $parsedFilter .= ($boolAND)?" AND ": " OR ";
					if(!isset($arrDateValues[1]))
					{
						$parsedFilter .=  UC($colName) . " > " . $arrDateValues[0];
					}
					else
					{
						$parsedFilter .= "(". UC($colName) . " between " . $arrDateValues[0] ." and ". $arrDateValues[1].")";
					}
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		return $parsedFilter;
	}


	function isColNumeric($strTable, $strColumn, $db = "swdata")
	{
		$res = swdti_getdatatype($strTable.".".$strColumn);
		if($res==-1)
		{
			//-- could not find in swdata schema info so load from xmlmc
			global $dbs;
			$tbl = $dbs->loadTable($strTable,$db);
			if(is_numeric($strColumn))
			{
				return $tbl->columns[$strColumn]->IsNumeric();
			}
			else
			{
				if(!isset($tbl->namedcolumns[LC($strColumn)]))
				{
					throwError(-100,"isColNumeric Failure : [".$strTable."][".$strColumn."] does not exist. Please contact your Administrator");
				}
				return $tbl->namedcolumns[LC($strColumn)]->IsNumeric();
			}
		}
		else
		{
			return ($res==18);
		}
	}

	function encapsulate($strTable, $strColumn,$strValue,$db = "swdata")
	{
		$strValue = PrepareForSql($strValue);
		if(!isColNumeric($strTable, $strColumn,$db))
		{
			$strValue = "'".$strValue."'";
		}
		return $strValue;
	}

	function swfc_source()
	{
		$dsn = (isset($_POST["dsn"])) ? $_POST["dsn"] : "";
		if($dsn=="")$dsn="swdata";
		if($dsn=="syscache")$dsn="sw_systemdb";
		if($dsn=="sw_systemdb" || $dsn=="swdata")
		{
			return $dsn;
		}
		else
		{
			echo generateCustomErrorString("-401","Invalid dsn source specified. Please contact your Administrator.");
			exit(0);
		}
	}

	function swfc_table()
	{
		return swfc_tablename();
	}
	function swfc_tablename()
	{
		$table = $_POST['table'];
		if(_validate_url_param($table,"sqlobjectname"))
		{
			return prepareForSql($table);
		}
		else
		{
			echo generateCustomErrorString("-402","Invalid table name specified (".$table."). Please contact your Administrator.");
			exit(0);
		}

	}

	function swfc_fromtable()
	{
		$table = $_POST['table'];
		if(_validate_url_param($table,"sqlobjectname"))
		{
			return " from " . prepareForSql($table) . " ";
		}
		else
		{
			echo generateCustomErrorString("-402","Invalid form control table name specified. Please contact your Administrator.");
			exit(0);
		}
	}
	function swfc_selectcolumns()
	{
		global $swfc_picklist;
		$columns = $_POST['columns'];
		if(_validate_url_param($columns,"sqlselectcolumns"))
		{
			if($swfc_picklist==1)
			{
				return "select distinct " . prepareForSql($columns) . " ";
			}
			else
			{
				return "select " . prepareForSql($columns) . " ";
			}
		}
		else
		{
			echo generateCustomErrorString("-403","Invalid form control columns specified. Please contact your Administrator.");
			exit(0);
		}
	}
	function swfc_orderby()
	{
		$orderby = "";
		if(($_POST['orderby'])!="")
		{
			$orderby = " order by " . $_POST['orderby'];
			if($_POST['orderdir']!="")
			{
				$orderby .= " " . $_POST['orderdir'];
			}
			return $orderby;
		}
		return "";
	}
	function prepareForXml($strValue)
	{
		$xmlchars = array("&", "<", ">",'"',"'");
		$escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
		return utf8_encode(str_replace($xmlchars, $escapechars, $strValue));
	}
	/*function pfs($var) //-- mimic global.js
	{
		return prepareForSql($var);
	}
	function prepareForSql($var)
	{
		$var = str_replace("'","''",$var);
		return $var;
	}*/
	function gxc($dom,$tag)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if(isset($a[0]))return $a[0]->get_content();
		return "";
	}
	function gxa($dom,$tag,$attName)
	{
		$a = $dom->get_elements_by_tagname($tag);
		if($a[0])return $a[0]->get_attribute($attName);
		return "";
	}


	function _validate_url_param($varValue, $validationType, $boolEmptyOk = false)
	{
		if($varValue=="" && $boolEmptyOk)return true;

		$aValidSpecialChars = array('-', '_','.',' ',','); 
		switch($validationType)
		{
			case "":
				return true;
			case "boolean":
			case "bool":
				return (strtolower($varValue)=="true" || strtolower($varValue)=="false" || $varValue=="0" || $varValue=="1");
			case "numeric":
			case "num":
				return is_numeric($varValue);
			case "csnum":
			case "csnumeric":
                return preg_match( '/^[0-9,\-]+$/', $varValue);
			case "alpha":
				return ctype_alpha(str_replace($aValidSpecialChars, '', $varValue));
			case "alphanum":
			case "alphanumeric":
				return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
			case "nodirtraverse":
				return (strpos($varValue,"..")===false);
			case "sessionanalyst":
				return (strtolower($varValue)==strtolower($_SESSION["sw_analystid"]));
			case "sqlparamstrict": //-- do not allow ; -- # /* or ''
				return (strpos($varValue,"''")===false && strpos($varValue,";")===false && strpos($varValue,"--")===false && strpos($varValue,"/*")===false && strpos($varValue,"#")===false);
			case "sqlobjectname": //-- text num and _ allowed
				$aValidSpecialChars = array('_');
				return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
			case "sqlselectcolumns": //-- text num and _ ,allowed
				$aValidSpecialChars = array('_',',',' ');
				return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
			case "filetypexml": 
				return (get_file_extension($varValue)=="xml");
			case "filetypejson": 
				return (get_file_extension($varValue)=="json");
			case "xmltag": 
				return ctype_alnum(str_replace('_' , '', $varValue));
		}

		throwError("-100","Invalid url parameter validation type [".$validationType."]. Please contact your Administrator.");
		return false;
	}

	function generatesessionobject($xmlDom)
	{
		$c =  new StdClass();
		$c->xmlDom = $xmlDom;
		
		$basic = $xmlDom->get_elements_by_tagname("params");
		$basic = $basic[0];

		$c->sessionId = gxc($basic,"sessionId");
		$c->connectionId = gxc($basic,"connectionId");
		$c->sessionType = gxc($basic,"sessionType");
		$c->sessionState = gxc($basic,"sessionState");
		$c->lastActivity = gxc($basic,"lastActivity");
		$c->connectedSince = gxc($basic,"connectedSince");
		$c->analystName = gxc($basic,"analystName");
		$c->analystId = gxc($basic,"analystId");
		$c->contextAnalystId = gxc($basic,"contextAnalystId");
		$c->contextGroupId = gxc($basic,"contextGroupId");
		$c->group = gxc($basic,"group");
		$c->notifyPort = gxc($basic,"notifyPort");
		$c->maxUdpSize = gxc($basic,"maxUdpSize");
		$c->currentDataDictionary = gxc($basic,"currentDataDictionary");
		$c->dataDictionary = $c->currentDataDictionary; 
		$c->dateTimeFormat = gxc($basic,"dateTimeFormat");
		$c->dateFormat = gxc($basic,"dateFormat");
		$c->timeFormat = gxc($basic,"timeFormat");
		$c->currencySymbol = gxc($basic,"currencySymbol");
		$c->timeZone = gxc($basic,"timeZone");
		$c->timeZoneOffset = gxc($basic,"timeZoneOffset");
		$c->privLevel = gxc($basic,"privLevel");
		$c->oracleInUse = gxc($basic,"oracleInUse");
		$c->npaProtocol = gxc($basic,"npaProtocol");
		$c->sla = gxc($basic,"sla");
		$c->slb = gxc($basic,"slb");
		$c->slc = gxc($basic,"slc");
		$c->sld = gxc($basic,"sld");
		$c->sle = gxc($basic,"sle");
		$c->slf = gxc($basic,"slf");
		$c->slg = gxc($basic,"slg");
		$c->slh = gxc($basic,"slh");
		$c->msSqlInUse = gxc($basic,"msSqlInUse");
		$c->validateOutput = gxc($basic,"validateOutput");

		//-- analyst properties
		$analystDom = $xmlDom->get_elements_by_tagname("analystInfo");
		$analystDom = $analystDom[0];
		$c->analyst =  new StdClass();

		$c->analyst->AnalystID = gxc($analystDom,"AnalystID");
		$c->analyst->Name = gxc($analystDom,"Name");
		$c->analyst->Class = gxc($analystDom,"Class");
		$c->analyst->Role = $c->analyst->Class;
		$c->analyst->SupportGroup = gxc($analystDom,"SupportGroup");
		$c->analyst->privilegeLevel = gxc($analystDom,"privilegeLevel");
		$c->analyst->RightsA = gxc($analystDom,"RightsA");
		$c->analyst->RightsB = gxc($analystDom,"RightsB");
		$c->analyst->RightsC = gxc($analystDom,"RightsC");
		$c->analyst->RightsD = gxc($analystDom,"RightsD");
		$c->analyst->RightsE = gxc($analystDom,"RightsE");
		$c->analyst->RightsF = gxc($analystDom,"RightsF");
		$c->analyst->RightsG = gxc($analystDom,"RightsG");
		$c->analyst->RightsH = gxc($analystDom,"RightsH");
		$c->analyst->UserDefaults = gxc($analystDom,"UserDefaults");
		$c->analyst->MaxBackdatePeriod = gxc($analystDom,"MaxBackdatePeriod");
		$c->analyst->TimeZone = gxc($analystDom,"TimeZone");
		$c->analyst->DataDictionary = gxc($analystDom,"DataDictionary");
		$c->analyst->AvailableStatus = gxc($analystDom,"AvailableStatus");
		$c->analyst->AvailableStatusMessage = gxc($analystDom,"AvailableStatusMessage");
		$c->analyst->Country = gxc($analystDom,"Country");
		$c->analyst->Language = gxc($analystDom,"Language");
		$c->analyst->DateTimeFormat = gxc($analystDom,"DateTimeFormat");
		$c->analyst->DateFormat = gxc($analystDom,"DateFormat");
		$c->analyst->TimeFormat = gxc($analystDom,"TimeFormat");
		$c->analyst->CurrencySymbol = gxc($analystDom,"CurrencySymbol");
		$c->analyst->MaxAssignedCalls = gxc($analystDom,"MaxAssignedCalls");
		$c->analyst->LastLogOnTime = gxc($analystDom,"LastLogOnTime");
		$c->analyst->CloseLevel = gxc($analystDom,"CloseLevel");
		$c->analyst->LogLevel = gxc($analystDom,"LogLevel");

		//-- apprights
		$c->apprights = $xmlDom->get_elements_by_tagname("appRight");

		return $c;
	}

	function HaveRight($strGroup,$intRight)
	{
		global $session;
		$$rightGroup = "Rights".$strGroup;
		$session->analyst->$$rightGroup--;$session->analyst->$$rightGroup++;

		return ($session->analyst->$$rightGroup & $intRight) ? 1 : 0;
	}

	function HaveAppRight($strGroup,$intRight,$strApp = "")
	{
		global $session;
		if($strApp=="")$strApp=$session->currentDataDictionary;
		$rightGroup = "right".strToUpper($strGroup);
		foreach ($session->apprights as $index => $xmlNode)
		{
			//-- if we have app rights we want to work with
			if(LC(gxc($xmlNode,"appName"))==LC($strApp))
			{
				$intRightSetting = gxc($xmlNode,$rightGroup);

				eval("\$intRight = bit".$intRight.";");
				$intRight++;$intRight--;
				
				

				$intRightSetting++;$intRightSetting--;
				return ($intRight & $intRightSetting)?1:0;
			}
		}
		return 0;
	}

	function IsDefaultOption($intOption)
	{
		global $session;
		$session->analyst->UserDefaults--;
		$session->analyst->UserDefaults++;

		return ($session->analyst->UserDefaults & $intOption) ? 1 : 0;
	}

	//-- include file is <ddf>/_phpinclude/<$filename>
	function IncludeApplicationPhpFile($fileName)
	{
		global $session;
		IncludePhpFile($session->dataDictionary . "/_includes/".$fileName);
	}

	function IncludePhpFile($filePath)
	{
		global $includepath;
		if(!file_exists($includepath.$filePath))
		{
			echo generateCustomErrorString("-601","The specified include file [". $filePath ."] could not be found. Please contact your Administrator");
			exit(0);
		}

		include($includepath.$filePath);
	}

	//-- xmlmc api functions
	//--
	function _fwrite_stream($fp, $string)
	{
		for($written = 0; $written < strlen($string); $written += $fwrite)
		{
			$fwrite = fwrite($fp, substr($string, $written));
			if(!$fwrite)
			{
				return $fwrite;
			}
		}
		return $written;
	}

	function _xmlmc($xmlmc,$port, $host,$boolAsJson=false)
	{
		global $_core,$contentXMLMC;
		$contentXMLMC = null;
		$errNo  = NULL;
		$errStr = NULL;
		if(($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE)
		{
			return FALSE;
		}    
		$acceptType = ($boolAsJson)?"text/json":"text/xmlmc";
		$request = array(
					'POST /xmlmc HTTP/1.1',
					'Host: '.$host,
					'User-Agent: Hornbill PHP',
					'Connection: close',
					'Cache-Control: no-cache',
					'Accept: '.$acceptType,
					'Accept-Charset: utf-8',
					'Accept-Language: en-GB',
					'Cookie: ESPSessionState='.$_core['_nexttoken'],
					'Content-Type: text/xmlmc; charset=utf-8',
					'Content-Length: '.strlen($xmlmc),
				   );

		$request = implode("\r\n", $request)
				 . "\r\n\r\n"
				 . $xmlmc;
		_fwrite_stream($fp, $request);
		$resCode   = NULL;
		$headers   = NULL;
		$content   = NULL;
		$newToken  = $espToken;
		$inContent = FALSE;
		while(!feof($fp))
		{
			if($inContent)
			{
				$content .= fread($fp, 8192);
			}
			else
			{
				$headers .= fread($fp, 8192);
				if($resCode === NULL && strlen($headers) >= 13)
				{
					if(!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13)))
					{
						fclose($fp);
						// Invalid http response
						return FALSE;
					}
					$resCode = (integer) substr($headers, 9, 3);
				}
				if(($eoh = strpos($headers, "\r\n\r\n")) !== FALSE)
				{
					$content = (string) substr($headers, $eoh + 4);
					$headers = substr($headers, 0, $eoh);
					if(preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts))
					{
						$newToken = $parts[1];
					}
					$headers   = explode("\r\n", $headers);
					$inContent = TRUE;
					array_shift($headers);
				}
			}
		}
		fclose($fp);
		if($newToken!="")
		{
			$_core['_nexttoken'] = $newToken;
			//-- set webclient espsessionstate
			if(isset($_SESSION['swstate']))$_SESSION['swstate'] = $newToken;
			//else if(isset($_COOKIE['ESPSessionState'])) setcookie('ESPSessionState',$newToken,0,"/sw");
		}
		$o = new StdClass();
		$o->status  = $resCode;
		$o->headers = $headers;
		$o->content = utf8_encode($content);
		$contentXMLMC = utf8_encode($content);
		//print_r($o->content);
		$o->xmlDom = null;
		$o->asjson = $boolAsJson;
		if(!$boolAsJson)$o->xmlDom = domxml_open_mem(utf8_encode($content));
		return $o;
	}  

	//--
	//-- xmlmc processor - have to use swphp.dll as xmlmc api does not have a method to use existing session
	if (!function_exists('generateCustomErrorString')) 
	{
		function generateCustomErrorString($code,$msg)
		{
			$msg = $_POST['espQueryName'] . " : " . $msg;
			if($_POST['asjson'])
			{
				$xmls = '{"@status":"fail","state":{"code":"'.$code.'","error":"'.$msg.'"}}';
			}
			else
			{
				$xmls = "<?xml version='1.0' encoding='utf-8'?>";
				$xmls .= '<methodCallResult status="fail">';
				$xmls .= '<state>';
				$xmls .= '<code>'.$code .'</code>';
				$xmls .= '<error>'.prepareForXml($msg).'</error>';
				$xmls .= '</state>';
				$xmls .= '</methodCallResult>';
			}
			return $xmls;
		}

		function generateProcessSuccessString($code="1",$msg ="",$response ="")
		{
			if($_POST['asjson'])
			{
				$xmls = '{"@status":true,"params":{"rowsEffected":"1"},"data":{"metaData":{"code":{"dataType":"integer","tableName":"opencall","columnName":"code","dataSize":"12","displayName":"code"},"message":{"dataType":"varchar","tableName":"opencall","columnName":"message","dataSize":"1024","displayName":"message"},"response":{"dataType":"varchar","tableName":"opencall","columnName":"response","dataSize":"1000000","displayName":"response"}},"rowData":{"row":{"code":"'.$code.'","message":"'.$msg.'","response":"'.$response.'"}}}}';
			}
			else
			{
				$xmls = "<?xml version='1.0' encoding='utf-8'?>";
				$xmls .= '<methodCallResult status="ok">';
				$xmls .= '<params>';
				$xmls .= '<rowsEffected>1</rowsEffected>';
				$xmls .= '</params>';
				$xmls .= '<data>';
				$xmls .= '<metaData>';
				$xmls .= '<code>';
				$xmls .= '<dataType>varchar</dataType>';
				$xmls .= '<tableName>opencall</tableName>';
				$xmls .= '<columnName>code</columnName>';
				$xmls .= '<dataSize>12</dataSize>';
				$xmls .= '<displayName>code</displayName>';
				$xmls .= '</code>';
				$xmls .= '<message>';
				$xmls .= '<dataType>varchar</dataType>';
				$xmls .= '<tableName>opencall</tableName>';
				$xmls .= '<columnName>message</columnName>';
				$xmls .= '<dataSize>1024</dataSize>';
				$xmls .= '<displayName>message</displayName>';
				$xmls .= '</message>';
				$xmls .= '<response>';
				$xmls .= '<dataType>varchar</dataType>';
				$xmls .= '<tableName>opencall</tableName>';
				$xmls .= '<columnName>response</columnName>';
				$xmls .= '<dataSize>1000000</dataSize>';
				$xmls .= '<displayName>Message</displayName>';
				$xmls .= '</response>';
				$xmls .= '</metaData>';
				$xmls .= '<rowData>';
				$xmls .= '<row>';
				$xmls .= '<code>'.$code.'</code>';
				$xmls .= '<message>'.$msg.'</message>';
				$xmls .= '<response>'.$response.'</response>';
				$xmls .= '</row>';
				$xmls .= '</rowData>';
				$xmls .= '</data>';
				$xmls .= '</methodCallResult>';
			}
			return $xmls;
		}

		function generateRowCountString($intCount = 0)
		{
			if($_POST['asjson'])
			{
				$xmls = '{"@status":true,"params":{"rowsEffected":"1"},"data":{"rowData":{"row":{"count":"'.$intCount.'"}}}}';
			}
			else
			{

				$xmls = "<?xml version='1.0' encoding='utf-8'?>";
				$xmls .= '<methodCallResult status="ok">';
				$xmls .= '<params>';
				$xmls .= '<rowsEffected>1</rowsEffected>';
				$xmls .= '</params>';
				$xmls .= '<data>';
				$xmls .= '<rowData>';
				$xmls .= '<row>';
				$xmls .= '<count>'.$intCount.'</count>';
				$xmls .= '</row>';
				$xmls .= '</rowData>';
				$xmls .= '</data>';
				$xmls .= '</methodCallResult>';
			}
			return $xmls;
		}



		function generateSuccessString($rowsAffected=0)
		{
			if($_POST['asjson'])
			{
				$xmls = '{"@status":"true","params":{"rowsEffected":"'.$rowsAffected.'"},"data":{}}';
			}
			else
			{
				$xmls = "<?xml version='1.0' encoding='utf-8'?>";
				$xmls .= '<methodCallResult status="ok">';
				$xmls .= '<params>';
				$xmls .= '<rowsEffected>'.$rowsAffected.'</rowsEffected>';
				$xmls .= '</params>';
				$xmls .= '<data>';
				$xmls .= '<rowData>';
				$xmls .= '</rowData>';
				$xmls .= '</data>';
				$xmls .= '</methodCallResult>';
			}
			return $xmls;
		}
		class HelpersXmlMethodCall 
		{
			var $swserver = "";
			var $params = Array();
			var $data = Array();
			var $xmlresult = "";
			var $xmlDom = null;

			function HelpersXmlMethodCall ($server="127.0.0.1")
			{
				$this->swserver = $server;
			}

			function reset()
			{
				$this->params = Array();
			}

			function SetComplexValue($parentParamName, $paramName,$paramValue)
			{
				if(!isset($this->params[$parentParamName]))$this->params[$parentParamName] = Array();
				$this->params[$parentParamName][$paramName] = $paramValue;
			}
			function SetParam($paramName,$paramValue)
			{
				$this->params[$paramName] = $paramValue;
			}
		
			function SetDataComplexValue($parentParamName, $paramName,$paramValue)
			{
				if(!isset($this->data[$parentParamName]))$this->data[$parentParamName] = Array();
				$this->data[$parentParamName][$paramName] = $paramValue;
			}
			function SetData($paramName,$paramValue)
			{
				$this->data[$paramName] = $paramValue;
			}

			//-- return xml string
			function generatexmlcall($service,$method)
			{
				$xml = '<?xml version="1.0" encoding="UTF-8"?>';
				$xml .= "<methodCall service='".$service."' method='".$method."'>";
				//-- params
				$bParams = false;
				foreach ($this->params as $paramName => $paramValue)
				{
					if($bParams==false)
					{
						$xml .= "<params>";
						$bParams=true;
					}
					$xml .= "<".$paramName.">".prepareForXml(utf8_encode($paramValue))."</".$paramName.">";
				}
				
				if($bParams)$xml .= "</params>";
				$xml .= "</methodCall>";
				return $xml;
			}

			function invoke($service,$method,$bAsJson=false)
			{
				global $strVerbose;
				$port=5015;
				if($service=="mail"||$service=="addressbook")$port=5014;
				else if($service=="calendar")$port=5013;
				if($strVerbose)log_action("XMLMC Method -Service: ".$service." -Method: ".$method." -Post: ".$port." -Host: ".$this->swserver);
				$result  = _xmlmc($this->generatexmlcall($service,$method), $port, $this->swserver,$bAsJson);
				return $this->_processresultstring($result);
			}

			function _processresultstring($xmlmcResult)
			{
				if($xmlmcResult==false)
				{
					$this->xmlresult=generateCustomErrorString("-300","Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.");
					return false;
				}

				if($xmlmcResult->status!=200)
				{
					//-- some http error has occured
					$this->xmlresult=generateCustomErrorString($xmlmcResult->status,"An http error has occurred. Please contact your Administrator.");
					return false;
				}
				else
				{
					//-- get result - convert string to xmlDom
					$this->xmlresult = $xmlmcResult->content;
					if($xmlmcResult->xmlDom!=null)
					{
						$this->xmlDom = $xmlmcResult->xmlDom->document_element();
						$status = $this->xmlDom->get_attribute('status'); 
						return ($status=="fail")?false:true;
					}
					return true;
				}

			}
		}
	}

//-- static definitions
//-- analyst right groups
define('ANALYST_RIGHT_A_GROUP', "A");
define('ANALYST_RIGHT_B_GROUP', "B");
define('ANALYST_RIGHT_C_GROUP', "C");
define('ANALYST_RIGHT_D_GROUP', "D");
define('ANALYST_RIGHT_E_GROUP', "E");
define('ANALYST_RIGHT_F_GROUP', "F");

//-- analyst groups speciic rights
define('ANALYST_RIGHT_A_CANASSIGNCALLS', 1 );
define('ANALYST_RIGHT_A_CANCLOSECALLS', 2 );
define('ANALYST_RIGHT_A_CANLOGCALLS', 4 );
define('ANALYST_RIGHT_A_CANUPDATECALLS', 8); 
define('ANALYST_RIGHT_A_CANMODIFYCALLS', 16 );
define('ANALYST_RIGHT_A_CANSWITCHREP', 32 );
define('ANALYST_RIGHT_A_CANSWITCHGROUP', 64 );
define('ANALYST_RIGHT_A_CANCANCELCALLS', 128 );
define('ANALYST_RIGHT_A_CANDELETEWORKITEMS', 256 );
define('ANALYST_RIGHT_A_CANPLACECALLONHOL', 512 );
define('ANALYST_RIGHT_A_CANTAKECALLOFFHOLD', 1024 );
define('ANALYST_RIGHT_A_CANCHANGEPRIORITY', 2048 );
define('ANALYST_RIGHT_A_CANATTACHFILESTOCALLS', 4096 );
define('ANALYST_RIGHT_A_CANREADFILESONCALLS', 8192 );
define('ANALYST_RIGHT_A_CANCREATESCHEDCALLS', 262144 );
define('ANALYST_RIGHT_A_CANEDITSCHEDCALLS',524288);
define('ANALYST_RIGHT_A_CANDELETESCHEDCALLS',1048576);
define('ANALYST_RIGHT_A_CANCREATENEWTASKS',2097152);
define('ANALYST_RIGHT_A_CANCHANGETASKOWNERSHIPGRP',4194304);
define('ANALYST_RIGHT_A_CANCHANGETASKOWNERSHIP',8388608);
define('ANALYST_RIGHT_A_MODIFYTASKGRP',16777216);
define('ANALYST_RIGHT_A_MODIFYTASK',33554432);
define('ANALYST_RIGHT_A_CANUPDATENONOWNEDCALLS',67108864);
define('ANALYST_RIGHT_A_CANRESOLVECALLS',134217728);
define('ANALYST_RIGHT_A_CANCHANGECALLPROFILECODE',268435456);
define('ANALYST_RIGHT_A_CANREACTIVATECALLS',536870912);
define('ANALYST_RIGHT_A_CANUPDATECALLDIARYITEMS',1073741824);
define('ANALYST_RIGHT_A_CANDELETEATTACHEDFILES',2147483648);
define('ANALYST_RIGHT_B_CANCHANGECALLCLASS',1);
define('ANALYST_RIGHT_B_CANCHANGECALLCONDITION',2);
define('ANALYST_RIGHT_B_CANCREATEISSUES',4);
define('ANALYST_RIGHT_B_CANMODIFYISSUES',8);
define('ANALYST_RIGHT_B_CANCLOSEISSUES',16);
define('ANALYST_RIGHT_B_CANBACKDATENEWCALLLOGS',32);
define('ANALYST_RIGHT_C_CANMANAGECALLPROFILES',1);
define('ANALYST_RIGHT_C_CANMANAGESLAS',2);
define('ANALYST_RIGHT_C_CANMANAGEWORKFLOWTEMPLATES',4);
define('ANALYST_RIGHT_C_CANMANAGESKILLS',8);
define('ANALYST_RIGHT_C_CANMANAGECALLCLASSES',16);
define('ANALYST_RIGHT_C_CANMANAGECUSTOMERWEBACCESS',32);
define('ANALYST_RIGHT_C_CANADDSLA',64);
define('ANALYST_RIGHT_C_CANADDGENERICCODES',128);
define('ANALYST_RIGHT_C_CANADDCODES',256);
define('ANALYST_RIGHT_C_CANMANAGEANALYSTWEBACCESS',512);
define('ANALYST_RIGHT_C_CANMANAGECALLSCRIPTS',1024);
define('ANALYST_RIGHT_C_CANMANAGEDATAMERGES',2048);
define('ANALYST_RIGHT_C_CANMODIFYSLA',32768);
define('ANALYST_RIGHT_C_CANMODIFYGENERICCODES',65536);
define('ANALYST_RIGHT_C_CANMODIFYCODES',131072);
define('ANALYST_RIGHT_C_CANADDTOGAL',262144);
define('ANALYST_RIGHT_C_CANEDITGAL',524288);
define('ANALYST_RIGHT_C_CANDELETEFROMGAL',1048576);
define('ANALYST_RIGHT_C_CANDELETESLA',16777216);
define('ANALYST_RIGHT_C_CANDELETEGENERICCODES',33554432);
define('ANALYST_RIGHT_C_CANDELETECODES',67108864);
define('ANALYST_RIGHT_C_CANADDTOKNOWLEDGEBASE',134217728);
define('ANALYST_RIGHT_D_CANVIEWREPORTS',1);
define('ANALYST_RIGHT_D_CANEDITFOLDERS',2);
define('ANALYST_RIGHT_D_CANCREATEEDITREPORTS',4);
define('ANALYST_RIGHT_D_CANDELETEREPORTS',8);
define('ANALYST_RIGHT_D_IMPORTEMPORTREPORTS',16);
define('ANALYST_RIGHT_D_CANSCHEDULEREPORTS',32);
define('ANALYST_RIGHT_D_CANCREATECUSTOMSEARCHES',512);
define('ANALYST_RIGHT_D_CANRUNCUSTOMSEARCHES',1048);
define('ANALYST_RIGHT_D_CANDELETECUSTOMSEARCHES',2048);
define('ANALYST_RIGHT_D_CANCHANGEPERSONELSTATUS',8192);
define('ANALYST_RIGHT_D_CANSENDPOPUPMESSAGES',16384);
define('ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE',32768);
define('ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE',65536);
define('ANALYST_RIGHT_D_CANEDITPERSONALMULTIPASTE',131072);
define('ANALYST_RIGHT_D_CANEDITGROUPMULTIPASTE',262144);
define('ANALYST_RIGHT_D_CANEDITKEYBOARDSHORTCUTS',524288);
define('ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS',148576);
define('ANALYST_RIGHT_D_CANADDKBDOCUMENTS',4194304);
define('ANALYST_RIGHT_D_CANADDEXTKBDOCUMENTS',8388608);
define('ANALYST_RIGHT_D_CANEDITKBDOCUMENTS',16777216);
define('ANALYST_RIGHT_D_CANDELKBDOCUMENTS',33554432);
define('ANALYST_RIGHT_D_CANMANAGEKBCATALOGS',67108864);
define('ANALYST_RIGHT_D_CANMANAGECUSTOMTOOLS',134217728);
define('ANALYST_RIGHT_E_CANRUNSQLSELECT',1);
define('ANALYST_RIGHT_E_CANRUNSQLINSERT',2);
define('ANALYST_RIGHT_E_CANRUNSQLUPDATE',4);
define('ANALYST_RIGHT_E_CANRUNSQLDELETE',8);
define('ANALYST_RIGHT_E_CANRUNSQLDROPINDEX',16);
define('ANALYST_RIGHT_E_CANRUNSQLDROPTABLE',32);
define('ANALYST_RIGHT_E_CANRUNSQLALTER',64);
define('ANALYST_RIGHT_E_CANRUNSQLTRUNCATE',128);
define('ANALYST_RIGHT_E_CANRUNSQLDESCRIBE',512);
define('ANALYST_RIGHT_E_CANRUNSQLTRANSACT',1024);
define('ANALYST_RIGHT_E_CANRUNSQLGRANTREVOKE',2048);
define('ANALYST_RIGHT_E_CANRUNSQLCREATEINDEX',4096);
define('ANALYST_RIGHT_E_CANRUNSQLCREATETABLE',8192);
define('ANALYST_RIGHT_F_CANCREATEDATADICTIONARIES',1);
define('ANALYST_RIGHT_F_CANEDITDATADICTIONARY',2);
define('ANALYST_RIGHT_F_CANSWITCHDATADICTIONARIES',4);
define('ANALYST_RIGHT_F_CANDELETEDATADICTIONARIES',8);

//-- default options
define('ANALYST_DEFAULT_UPDATEPRIVATE', 1);
define('ANALYST_DEFAULT_UPDATESENDEMAIL', 2);
define('ANALYST_DEFAULT_HOLDPRIVATE', 4);
define('ANALYST_DEFAULT_HOLDSENDEMAIL', 8);
define('ANALYST_DEFAULT_CLOSEPRIVATE', 16);
define('ANALYST_DEFAULT_CLOSESENDEMAIL', 32);
define('ANALYST_DEFAULT_CLOSEKNOWLEDGEBASE', 64);
define('ANALYST_DEFAULT_CLOSECHARGABLE', 128);
define('ANALYST_DEFAULT_FORCEUPDATEWHENACCEPCALL', 1024);
define('ANALYST_DEFAULT_AUTOFILLPROBLEMTEXT', 2048);
define('ANALYST_DEFAULT_AUTOFILLRESOLUTIONTEXT', 4096);
define('ANALYST_DEFAULT_RESOLVEBYDEFAULT', 8192);
define('ANALYST_DEFAULT_LOGSENDEMAIL', 16384);
define('ANALYST_DEFAULT_INCLUDESUBJECT', 32768);
define('ANALYST_DEFAULT_DISABLESENDSURVEY', 65536); 
define('ANALYST_DEFAULT_SETSENDSURVEY', 131072);


//-- bit flags
define("bit1",1);
define("bit2", 2);
define("bit3", 4);
define("bit4", 8);
define("bit5", 16);
define("bit6", 32);
define("bit7", 64);
define("bit8", 128);
define("bit9", 256);
define("bit10", 512);
define("bit11", 1024);
define("bit12", 2048);
define("bit13", 4096);
define("bit14", 8192);
define("bit15", 16384);
define("bit16", 32768);
define("bit17", 65536);
define("bit18", 131072);
define("bit19", 262144);
define("bit20", 524288);
define("bit21", 1048576);
define("bit22", 2097152);
define("bit23", 4194304);
define("bit24", 8388608);
define("bit25", 16777216);
define("bit26", 33554432);
define("bit27", 67108864);
define("bit28", 134217728);
define("bit29", 268435456);
define("bit30", 536870912);
define("bit31", 1073741824);


define('SW_SQLTYPE_Unknown', 0);		// Unknown type
define('SW_SQLTYPE_VARCHAR',1);			// Variable char string
define('SW_SQLTYPE_BLOB',2);			// Huge binary data
define('SW_SQLTYPE_TEXT',3);			// Text/Memo
define('SW_SQLTYPE_SMALLINT',4);		// 16 bit integer
define('SW_SQLTYPE_INTEGER', 5);        // 32 bit integer
define('SW_SQLTYPE_BIGINT',6);          // 64 bit integer
define('SW_SQLTYPE_DECIMAL', 7);        // Decimal Number/Currency
define('SW_SQLTYPE_DOUBLE', 8);         // Double Precision
define('SW_SQLTYPE_DATETIME', 9);       // Date/Time value

?>