<?php

//-- original : NWJ (april 07)
//-- reporting class - helps to draw out reports and the user input form for wssm and ap
//-- requires the db class to be loaded in memory


//-- 30/10/2008 - new modified class file provided by professional services (ryanc) that enables class to be used in php_reports as well as ap and wssm

class classReport
{
	var $xmlRoot = Null;
	var $xmlFileName = Null;
	var $criteria = Null;
	var $graphHeader = Null;
	var $graphValue = Null;
	var $graphLabels = Null;
	var $levelOfSelect = Null;
	var $isLastLevel = Null;
	var $graphTitle = Null;
	var $intGraphValueStringMaxLength = 120;

	//-- load report xml file from <app_path>\xml\reports
	function load_report($reportFileName)
	{
		$this->xmlRoot = Null;
		$this->xmlFileName = $reportFileName;
		$this->levelOfSelect = 1;

		$xmlFileName = $GLOBALS['instance_path']."xml/reports/".$reportFileName.".xml";
		$xmlfile = file_get_contents($xmlFileName);
		//-- create dom instance of the xml file
		$xmlDoc = domxml_open_mem($xmlfile);
		if($xmlDoc)$this->xmlRoot = $xmlDoc->document_element();
		return $xmlDoc;
	}

	function get_title()
	{
		$strTitle = "";
		if($this->xmlRoot)
		{
			//-- report title
			$strTitle = getAttribute("title", $this->xmlRoot->attributes());
		}
		return $strTitle;
	}

	//-- output html for the user input aspects of the report
	function output_input()
	{
		$strInputHTML = "";
		if($this->xmlRoot)
		{
			$strInputHTML = get_inputs($this);
		}
		return $strInputHTML;
	}

	function isTrendingReport(){
			if( strtolower(getAttribute("reportstyle", $this->xmlRoot->attributes()))=='trend'){
				return true;
			}
		return false;
	}
	//-- create the select from part of the search and return
	function construct_select($arrCriteria,$strOrderByColumn = "", $strOrderByDir = "ASC")
	{
		$arrAgg = array('avg(','bit_and(','bit_or(','bit_xor(','count(','count(','group_concat(','max(','min(','std(','stddev_pop(','stddev_samp(','stddev(','sum(','var_pop(','var_samp(','variance(');
		$strSelect = "";
		$strTables = "";
		$strJoins = "";
		$strGroupBy = "";
		$strOrderBy = "";
		$boolIsAggregate = false;

		if($this->xmlRoot)
		{
			//-- get columns to select and from which tables
			$strDistinct= $this->xmlRoot->get_attribute("distinct");
			if($strDistinct=="1") $strDistinct=" distinct ";

			$xmlTables = $this->xmlRoot->get_elements_by_tagname("table");
			$xmlColumns = $this->xmlRoot->get_elements_by_tagname("column");
			$xmlAggregate = $this->xmlRoot->get_elements_by_tagname("aggregate");
			$xmlOrder = $this->xmlRoot->get_elements_by_tagname("order");
			$xmlfreetext = $this->xmlRoot->get_elements_by_tagname("freetext");

			$max = 0;
			//-- process select columns
			foreach($xmlColumns as $colKey => $aCol)
			{
				//-- create select cols
				$strLevel = getAttribute("level", $aCol->attributes());
				if($max<$strLevel)
					$max = $strLevel;
				if($strLevel==$this->levelOfSelect){
					$strColName = getAttribute("dbname", $aCol->attributes());
					$strColTable = getAttribute("dbtable", $aCol->attributes());
					$bColAlias = getAttribute("dbtablealias", $aCol->attributes());
					if(($bColAlias)&&($arrCriteria['db_type']=='oracle'))
					{
						$selCol = '"'.$strColTable. '".' . $strColName;
					}
					else
					{
						$selCol = $strColTable. "." . $strColName;
					}
					$strCast = getAttribute("casttype", $aCol->attributes());
					if($strCast!="")
					{
						$strPrecision = getAttribute("precision", $aCol->attributes());
						$selColas = $selCol;
						$selCol = get_cast($selCol,$strCast,$strPrecision,$arrCriteria['db_type']);
						
						if($strSelect != "")$strSelect .= " , ";
						if($arrCriteria['db_type']=='oracle')
						{
							$strSelect .= $selCol .' "'.$strColName.'"';
						}
						else
						{
							$strColNameStriped = str_replace("(","",$strColName);				
							$strColNameStriped = str_replace(")","",$strColNameStriped);				
							$strSelect .= $selCol ." as ".$strColNameStriped."";
						}
						if($strGroupBy != "")$strGroupBy .= " , ";
						$strGroupBy .= $selColas;	
					}else
					{
						if($strSelect != "")$strSelect .= " , ";
						$strSelect .= $selCol;
						if($strGroupBy != "")$strGroupBy .= " , ";
						$strGroupBy .= $selCol;	
						
					}	
				}
			}

			
			foreach($xmlAggregate as $colKey => $aCol)
			{
				//-- create select cols
				$strLevel = getAttribute("level", $aCol->attributes());
				if($max<$strLevel)
					$max = $strLevel;
				if($strLevel==$this->levelOfSelect){
					$strColName = getAttribute("dbname", $aCol->attributes());
					$strColTable = getAttribute("dbtable", $aCol->attributes());
					$strColConv = getAttribute("aggFunction", $aCol->attributes());
					$strCast = getAttribute("casttype", $aCol->attributes());
					if($strCast!="")
					{
						$strPrecision = getAttribute("precision", $aCol->attributes());
						$selCol = $strColConv."(".get_cast($strColTable. "." . $strColName,$strCast,$strPrecision,$arrCriteria['db_type']).")";
						$selColas = $strColConv."(".$strColTable. "." . $strColName.")";
					}else
					{
						$selCol = $strColConv."(".$strColTable. "." . $strColName.")";
						$selColas = $selCol;
					}
					if($strSelect != "")$strSelect .= " , ";
					//var_dump($selCol);
					//$strSelect .= $selCol. " as '".$selColas."'";
					if($arrCriteria['db_type']=='oracle')
					{
						$strSelect .= $selCol .' "'.$selColas.'"';
					}
					else
					{
						$strColNameStriped = str_replace("(","",$selColas);				
						$strColNameStriped = str_replace(")","",$strColNameStriped);				
						$strColNameStriped = str_replace(".","",$strColNameStriped);				
						$strSelect .= $selCol ." as ".$strColNameStriped."";
					}
					$boolIsAggregate = true;
				}
			}

			foreach($xmlfreetext as $colKey => $aCol)
			{
				$strLevel = getAttribute("level", $aCol->attributes());
				if($max<$strLevel)
					$max = $strLevel;
				if($strLevel==$this->levelOfSelect){
					$statement = $aCol->get_content();
					$strColName = getAttribute("dbname", $aCol->attributes());
					$selCol = $statement.' as '.$strColName.' ';
					if($arrCriteria['db_type']=='oracle')
					{
						$selCol = $statement.' "'.$strColName.'" ';
					}
					else
					{
						$selCol = $statement.' as '.$strColName.' ';
					}

					if($strSelect != "")$strSelect .= " , ";
					$strSelect .= $selCol;
					foreach($arrAgg as $aggFunction)
						if(strpos($strSelect,$aggFunction)!==false)
							$boolIsAggregate = true;
				}
			}

			if($this->levelOfSelect==$max)
				$this->isLastLevel = true;
			else
				$this->isLastLevel = false;
			
			if($strOrderByColumn!="")
			{
				$direction = $strOrderByDir;
				$strOrderBy = $strOrderByColumn;
				$strOrderBy = substr($strOrderBy,0,-1);
			}
			else
			{
				foreach($xmlOrder as $colKey => $aCol)
				{
					$direction = 'ASC';
					//-- create select cols
					$strColName = getAttribute("dbname", $aCol->attributes());
					$strColTable = getAttribute("dbtable", $aCol->attributes());
					$strColOrder = getAttribute("order", $aCol->attributes());

					if($strColName=="")continue;
					if($strColTable!="")$strColName = $strColTable. "." . $strColName;
					$selCol = $strColName;

					if($strOrderBy != "")$strOrderBy .= " , ";
					$strOrderBy .= $selCol;
					$direction = $strColOrder ;
				}
			}

			//-- if not set select all
			if($strSelect=="")$strSelect = " * ";

			//-- process from tables
			foreach($xmlTables as $tableKey => $aTable)
			{
				$strTableName = getAttribute("name", $aTable->attributes());
				$strType = getAttribute("type", $aTable->attributes());
				$strJoin = getAttribute("join", $aTable->attributes());
				$strJoinType = getAttribute("join_type", $aTable->attributes());

				//the master table goes top
				if($strType=="master")
				{
				//if($strTables != "")$strTables .= " , ";
					$strTables = $strTableName.$strTables;
				}
				else
				{
					if($arrCriteria['db_type']=='oracle')
					{
						//check for hardcoded alias which requires alternative syntax in Oracle
						if(strpos(strtolower($strTableName)," as "))
						{
							$arrTableName = explode(" as ",strtolower($strTableName));
							$strTableName = $arrTableName[0].' "'.$arrTableName[1].'"';
							$strJoin.=" ";
							$strJoin=str_replace((' '.$arrTableName[1].'.'), '"'.$arrTableName[1].'".', $strJoin);
							$strTables = $strTables." ".$strJoinType." JOIN ".$strTableName." ON ".$strJoin;
						}
						else
						{
							$strTables = $strTables." ".$strJoinType." JOIN ".$strTableName." ON ".$strJoin;
						}
					}
					else
					{
						$strTables = $strTables." ".$strJoinType." JOIN ".$strTableName." ON ".$strJoin;
					}
				}

				//if($strTables != "")$strTables .= " , ";
				//$strTables .= $strTableName;
				
				/*if($strJoin != "")
				{
					if($strJoins != "")$strJoins .= " and ";
					$strJoins .=$strJoin;
				}*/
			}
		}
		$strSelectStatement = $strSelect . " from " . $strTables;
		if($strJoins != "") $strSelectStatement .= " where " . $strJoins . " and ";
		$strWhereClause = $this->construct_criteria($arrCriteria);
				
		if (($strWhereClause !="") && (strpos($strSelectStatement,"where")!==false) )
		{
			$strSelectStatement .= "  " . $strWhereClause;
		}
		elseif ($strWhereClause !="")
		{
			$strSelectStatement .= " where " . $strWhereClause;
		}

		//--nwj - altered for itsm 2.4.0
		//-- only do if user hasnt put the group by in the static where clause
		if(strpos($strWhereClause,"group by")===false)
		{
			if($strGroupBy != "" && $boolIsAggregate)
			{
				//if user has order by in static, insert group by
				if(strpos($strWhereClause,"order by")===false)
				{
					$strSelectStatement .= " GROUP BY " .  $strGroupBy ;
				}
				else
				{
					$strSelectStatement = str_replace("order by"," GROUP BY " .  $strGroupBy." ORDER BY " ,$strSelectStatement);
				}
			}
		}
		
		//--nwj - altered for itsm 2.4.0
		//-- only do if user hasnt put the order by in the static where clause
		if(strpos($strWhereClause,"order by")===false)
		{
			if($strOrderBy != "") $strSelectStatement .= " ORDER BY " .  $strOrderBy . ' '.$direction.' ';
		}

		$strLimit = getLimit($this);
		if($strLimit!=''){
			if($arrCriteria['db_type']=='oracle')
			{
				return "SELECT e.* FROM (select ". $strDistinct . $strSelectStatement.") e WHERE rownum < ".($strLimit+1);
			}
			else if($arrCriteria['db_type']=='mssql')
				$strSelectStatement = ' TOP ' .$strLimit.' '. $strSelectStatement;
			else
				$strSelectStatement =  $strSelectStatement.' LIMIT ' .$strLimit.' ';
		}
		//var_dump( "select " . $strSelectStatement);	
		return "select " . $strDistinct . $strSelectStatement;
	}

	//-- make up the user input criteria with static
	function construct_criteria($arrCriteria)
	{
		$strUserCriteria = "";
		if($this->xmlRoot)
		{
			//-- get user input settings
			$arrBindings = Array();
			$xmlUserInputs = $this->xmlRoot->get_elements_by_tagname("userinput");
			foreach($xmlUserInputs as $inputKey => $anInput)
			{
				//-- determine which ones the user has submitted
				$strType = getAttribute("type", $anInput->attributes());
				$strBinding = getAttribute("binding", $anInput->attributes());
				$useBinding = $strBinding;
				$strOp = getAttribute("op", $anInput->attributes());
				$strInt = getAttribute("int", $anInput->attributes());

				if (isset($arrBindings[$strBinding]))
				{
					$useBinding = $strBinding . "__" . $arrBindings[$strBinding];
				}
				else
				{
					$arrBindings[$strBinding]=0;
				}

				if(strtolower($strBinding)=='numberofrecords'){
					
				}else
				if(isset($arrCriteria[$useBinding]) && $arrCriteria[$useBinding]!="") 
				{
					if($strUserCriteria != "")$strUserCriteria .= " and ";
			
					if($strType=="daterange")
					{
						$xmlStaticCriteria = $this->xmlRoot->get_elements_by_tagname("trend");
						foreach($xmlStaticCriteria as $inputKey => $anInput)
						{
							$strDBName = getAttribute("dbname", $anInput->attributes());
							$strDBColumn = getAttribute("dbtable", $anInput->attributes());
						}
						//-- numeric
						if($strDBColumn.".".$strDBName!=$useBinding){
						$strUserCriteria .= $strBinding . " between ". $arrCriteria[$strBinding] . " and " . $arrCriteria[$strBinding ."__1"] . "";}
					}
					else
					{
						if($strInt=="1")
						{
							//-- numeric
							$strUserCriteria .= $strBinding . " " . $strOp . " " . $arrCriteria[$useBinding];
						}
						else
						{
							//-- string based
							$strUserCriteria .= $strBinding . " " . $strOp . " '" . prepareforSQL($arrCriteria[$useBinding]) . "'";
						}
						$arrBindings[$strBinding]++;
					}
				}
			}
		}
		
		if($arrCriteria['static_link']!=''){
			if($strUserCriteria != "")
				$strUserCriteria .= " and ";
			$strUserCriteria .= $arrCriteria['static_link'];
		}

		if(isset($arrCriteria["trend_upper"]) && isset($arrCriteria["trend_lower"]))
		{
			//-- get trend criteria
			$xmlStaticCriteria = $this->xmlRoot->get_elements_by_tagname("trend");
			foreach($xmlStaticCriteria as $inputKey => $anInput)
			{
					$strDBName = getAttribute("dbname", $anInput->attributes());
					$strDBColumn = getAttribute("dbtable", $anInput->attributes());
					if($strUserCriteria != "")$strUserCriteria .= " and ";

					$strUserCriteria .= $strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
					if($arrCriteria["static_link"]=="")
						$arrCriteria["static_link"]=$strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
					else
						$arrCriteria["static_link"] .= " and  ".$strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";

			}
		}
		//-- get static criteria
		$xmlStaticCriteria = $this->xmlRoot->get_elements_by_tagname("static");
		$strStaticCriteria = $xmlStaticCriteria[0]->get_content();
		if($strStaticCriteria!="")
		{
			
			if($strUserCriteria != "")$strUserCriteria .= " and ";
			$strUserCriteria .= $strStaticCriteria;
		}
		
		return $strUserCriteria;
	}

	function output_results($oRS,$strOrderByColumn = "", $strOrderByDir = "ASC")
	{
		$arrSummaryCols  = get_columns($this);
		if($this->isLastLevel)
			$strHTML = output_table_datalist($oRS, $arrSummaryCols, $this,$strOrderByColumn, $strOrderByDir);
		else
			$strHTML = output_summary_datalist($oRS, $arrSummaryCols, $this,$strOrderByColumn, $strOrderByDir);
		return $strHTML;
	}

	//-- given search criteria and what we want to search for connect to db and search
	function perform_search($arrCriteria,$level = 1, $strOrderByColumn = "", $strOrderByDir = "ASC")
	{
		foreach($arrCriteria as $key=>$val)
		{
			$arrCriteria[$key] = html_entity_decode($val);
		}
		$firstfmt = $GLOBALS['datetimefmt'];
		$firstfmt1 = $GLOBALS['datefmt'];

		$GLOBALS['datetimefmt'] = $GLOBALS['datefmt'];
		$strResults ="";
		$this->criteria = $arrCriteria;

		$this->levelOfSelect = $level;
		$strSelect = $this->construct_select($arrCriteria,$strOrderByColumn,$strOrderByDir);
		//$this->con = $con; - nwj - test
		//-- get dbto use and connect
		$reportODBC = new CSwDbConnection;;
		$strDSN=getAttribute("dsn",$this->xmlRoot->attributes());
		if($strDSN=="syscache")
		{
			$strDSN = "Supportworks Cache";
			$strUID = swcuid();    
			$strPWD = swcpwd();
			$boolConnected = $reportODBC->Connect($strDSN,$strUID,$strPWD);
		}
		else if($strDSN=="swdata")
		{
			$strDSN = swdsn();
			$strUID = swuid();    
			$strPWD = swpwd();
			$boolConnected = $reportODBC->Connect($strDSN,$strUID,$strPWD);
		}else if($strDSN=="knowledgebase")
		{
			$reportODBC = new CSwKnowldgeBaseAccess;
			$boolConnected = $reportODBC->SwKbCacheConnect();
		}
		else
		{
			//-- expect userid and password in the xml node
			$strUID = getAttribute("uid",$this->xmlRoot->attributes());;    
			$strPWD = getAttribute("pwd",$this->xmlRoot->attributes());
			$boolConnected = $reportODBC->Connect($strDSN,$strUID,$strPWD);
		}

		if($boolConnected==false)
		{
			return "<center>Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.</center>";
		}
		else
		{
			//$reportODBC = $this->con;
			//-- execute sql
			$strSQL = parse_context_vars($strSelect);
			//echo 'SQL :'.$strSQL.'<br><br>';
			//var_dump($strSQL);
			$recSet = $reportODBC->Query($strSQL,true); //-- select and return recset
			//var_dump($recSet);
			if(!$recSet)
			{
				//-- F0094609
				$strHTML = "<center>Could not run SQL query required for this report. Please contact your Supportworks administrator<br></center>";
				if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
				{
					$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
				}
				return $strHTML;			
			}
			else
			{
				$strResults = $this->output_results($recSet,$strOrderByColumn, $strOrderByDir);
			}
			unset($recset);
		}
		$reportODBC->Close();
		unset($reportODBC);
		$GLOBALS['datetimefmt'] = $firstfmt;

		return $strResults;
	}


	function create_graph()
	{
		return get_graph($this);
	}

	function perform_trend_search($arrCriteria,$thisdummy, $strOrderByColumn = "", $strOrderByDir = "ASC")
	{
	
			//Get the selected trend period
			$strPeriodOfTime = $arrCriteria['trend_value'];
			if($strPeriodOfTime==''){
				return "<center>No Period of Time has been selected</center>";

			}
			$column = 'tm_mon';

			//get the trend column
			$xmlTrendCriteria = $this->xmlRoot->get_elements_by_tagname("trend");
			foreach($xmlTrendCriteria as $inputKey => $anInput)
			{
				$strDBName = getAttribute("dbname", $anInput->attributes());
				$strDBColumn = getAttribute("dbtable", $anInput->attributes());
			}

			//if start time is set, get the value and clear
			if(isset($arrCriteria[$strDBColumn.'.'.$strDBName])){
				$intTime =  $arrCriteria[$strDBColumn.'.'.$strDBName];
				$arrCriteria[$strDBColumn.'.'.$strDBName] = '';
			}

			if($intTime=='')
				$arrStartTime = parseTime(time());
			else
				$arrStartTime = parseTime($intTime);

			
			//if end time is set, get the value and clear
			if(isset($arrCriteria[$strDBColumn.'.'.$strDBName.'__1'])){
				$intTime =  $arrCriteria[$strDBColumn.'.'.$strDBName.'__1'];
				$arrCriteria[$strDBColumn.'.'.$strDBName.'__1'] = '';
			}

			if($intTime=='')
				$arrEndTime = parseTime(time());
			else
				$arrEndTime = parseTime($intTime);

			$arrEndTime = prepare_time($arrEndTime,$strPeriodOfTime,false);
			$arrStartTime = prepare_time($arrStartTime,$strPeriodOfTime,true);

			$col = $arrStartTime['column'];
			$interval = $arrStartTime['interval'];

			$currentStart = mktime($arrStartTime['tm_hour'],$arrStartTime['tm_min'],$arrStartTime['tm_sec'],$arrStartTime['tm_mon'],$arrStartTime['tm_mday'],$arrStartTime['tm_year']);

			$arrStartTime[$col]=	$arrStartTime[$col]+$interval;
			$currentEnd = mktime($arrStartTime['tm_hour'],$arrStartTime['tm_min'],$arrStartTime['tm_sec']-1,$arrStartTime['tm_mon'],$arrStartTime['tm_mday'],$arrStartTime['tm_year']);

			$finalEnd = mktime($arrEndTime['tm_hour'],$arrEndTime['tm_min'],$arrEndTime['tm_sec']-1,$arrEndTime['tm_mon'],$arrEndTime['tm_mday'],$arrEndTime['tm_year']);

			$numberOfIterations = 0;
			//While the current start point is less than the final end point
			$arrHolder = array();
			$strOutput = '';
			$dt_fmt = $arrEndTime['dt_fmt'];
			if($arrCriteria['table_pass']!="")
					$temp = $arrCriteria['table_pass'];

			$this->graphTitle = $arrCriteria['trend_value']." Report from ".date($dt_fmt,$currentStart).' to '.date($dt_fmt,$finalEnd);
					
			while($currentStart<$finalEnd)
			{
				$numberOfIterations++;
				//Put the current time period into labels
				if($this->graphLabels==''){
					$this->graphLabels =date($dt_fmt,$currentStart).' to '.date($dt_fmt,$currentEnd+1);
				}else{
					$this->graphLabels = $this->graphLabels.',,,'.date($dt_fmt,$currentStart).' to '.date($dt_fmt,$currentEnd+1);
				}

				//Add another entry to any existing data
				$arrGraphValues = explode('___',$this->graphValue);
				if(!$arrGraphValues || $arrGraphValues[0]==''){

				}else{
					for($i=0;$i<count($arrGraphValues);$i++){
						$arrGraphValues[$i] = $arrGraphValues[$i].',,,0';
					}

				}
				$this->graphValue = implode('___',$arrGraphValues);

				//Update the current selection criteria
				$arrCriteria['trend_lower'] = $currentStart ;
				$arrCriteria['trend_upper'] = $currentEnd;
				$arrCriteria['table_pass'] = $temp.'_pass'.$numberOfIterations.'_';
				$strOutput .= "<div style='width:95%;float:right;overflow:hidden;'>";
				$strOutput .= 	$this->perform_search($arrCriteria,1,$strOrderByColumn, $strOrderByDir);
				$strOutput .= "</div>";

				//Update the next selection period
				$currentStart = $currentEnd + 1;
				$arrStartTime[$col]=	$arrStartTime[$col]+$interval;
				$currentEnd = mktime($arrStartTime['tm_hour'],$arrStartTime['tm_min'],$arrStartTime['tm_sec']-1,$arrStartTime['tm_mon'],$arrStartTime['tm_mday'],$arrStartTime['tm_year']);


			}
			return $strOutput;
	}
	
	function single_trending()
	{
		$strLevel = getAttribute("singlelevel", $this->xmlRoot->attributes());
		if($strLevel=="")
			$strLevel = 0;
		return $strLevel==1;
		
	}
}//--eof class

class classTrendReport extends classReport
{
	
	//-- output html for the user input aspects of the report
	function output_input()
	{
		$strInputHTML = "";
		if($this->xmlRoot)
		{
			$strInputHTML = get_inputs($this);

			//always add the trend picker to Trending Reports
			$strInputHTML .= $this->create_trend_picker();
		}
		return $strInputHTML;
	}

	function isTrendingReport(){
		return true;
	}

	//-- make up the user input criteria with static
	function construct_criteria($arrCriteria)
	{
		$strUserCriteria = "";
		if($this->xmlRoot)
		{
			//-- get user input settings
			$arrBindings = Array();
			$xmlUserInputs = $this->xmlRoot->get_elements_by_tagname("userinput");
			foreach($xmlUserInputs as $inputKey => $anInput)
			{
				//-- determine which ones the user has submitted
				$strType = getAttribute("type", $anInput->attributes());
				$strBinding = getAttribute("binding", $anInput->attributes());
				$useBinding = $strBinding;
				$strOp = getAttribute("op", $anInput->attributes());
				$strInt = getAttribute("int", $anInput->attributes());

				if (isset($arrBindings[$strBinding]))
				{
					$useBinding = $strBinding . "__" . $arrBindings[$strBinding];
				}
				else
				{
					$arrBindings[$strBinding]=0;
				}

				if(strtolower($strBinding)=='numberofrecords'){
					
				}else
				if(isset($arrCriteria[$useBinding]) && $arrCriteria[$useBinding]!="") 
				{
					if($strUserCriteria != "")$strUserCriteria .= " and ";
			
					if($strType=="daterange")
					{
						//-- numeric
						$strUserCriteria .= $strBinding . " between ". $arrCriteria[$strBinding] . " and " . $arrCriteria[$strBinding ."__1"] . "";
					}
					else
					{
						if($strInt=="1")
						{
							//-- numeric
							$strUserCriteria .= $strBinding . " " . $strOp . " " . $arrCriteria[$useBinding];
						}
						else
						{
							//-- string based
							$strUserCriteria .= $strBinding . " " . $strOp . " '" . prepareforSQL($arrCriteria[$useBinding]) . "'";
						}
						$arrBindings[$strBinding]++;
					}
				}
			}
		}

		if($arrCriteria['static_link']!=''){
			if($strUserCriteria != "")$strUserCriteria .= " and ";
			$strUserCriteria .= $arrCriteria['static_link'];
		}

		if(isset($arrCriteria["trend_upper"]) && isset($arrCriteria["trend_lower"]))
		{
			//-- get trend criteria
			$xmlStaticCriteria = $this->xmlRoot->get_elements_by_tagname("trend");
			foreach($xmlStaticCriteria as $inputKey => $anInput)
			{
					$strDBName = getAttribute("dbname", $anInput->attributes());
					$strDBColumn = getAttribute("dbtable", $anInput->attributes());
					if($strUserCriteria != "")$strUserCriteria .= " and ";
					//$strUserCriteria .= $strStaticCriteria;
					$strUserCriteria .= $strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
					if($arrCriteria["static_link"]=="")
						$arrCriteria["static_link"]=$strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
					else
						$arrCriteria["static_link"] .= " and  ".$strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";

			}
		}
		//-- get static criteria
		$xmlStaticCriteria = $this->xmlRoot->get_elements_by_tagname("static");
		$strStaticCriteria = $xmlStaticCriteria[0]->get_content();
		if($strStaticCriteria!="")
		{
			
			if($strUserCriteria != "")$strUserCriteria .= " and ";
			$strUserCriteria .= $strStaticCriteria;
		}


		return $strUserCriteria;
	}

	function output_results($oRS,$strOrderByColumn = "", $strOrderByDir = "ASC")
	{
		$arrSummaryCols  = get_columns($this);
		$strHTML = output_trend_datalist($oRS, $arrSummaryCols, $this,$strOrderByColumn, $strOrderByDir);
		return $strHTML;
	}

	function perform_trend_search($arrCriteria,$thisdummy, $strOrderByColumn = "", $strOrderByDir = "ASC")
	{
		//Get the selected trend period
		$strPeriodOfTime = $arrCriteria['trend_value'];
		if($strPeriodOfTime==''){
			return "<center>No Period of Time has been selected</center>";

		}
		$column = 'tm_mon';

		//get the trend column
		$xmlTrendCriteria = $this->xmlRoot->get_elements_by_tagname("trend");
		foreach($xmlTrendCriteria as $inputKey => $anInput)
		{
			$strDBName = getAttribute("dbname", $anInput->attributes());
			$strDBColumn = getAttribute("dbtable", $anInput->attributes());
		}

		//if start time is set, get the value and clear
		if(isset($arrCriteria[$strDBColumn.'.'.$strDBName])){
			$intTime =  $arrCriteria[$strDBColumn.'.'.$strDBName];
			$arrCriteria[$strDBColumn.'.'.$strDBName] = '';
		}

		if($intTime=='')
			$arrStartTime = parseTime(time());
		else
			$arrStartTime = parseTime($intTime);

		
		//if end time is set, get the value and clear
		if(isset($arrCriteria[$strDBColumn.'.'.$strDBName.'__1'])){
			$intTime =  $arrCriteria[$strDBColumn.'.'.$strDBName.'__1'];
			$arrCriteria[$strDBColumn.'.'.$strDBName.'__1'] = '';
		}

		if($intTime=='')
			$arrEndTime = parseTime(time());
		else
			$arrEndTime = parseTime($intTime);

		$arrEndTime = prepare_time($arrEndTime,$strPeriodOfTime,false);
		$arrStartTime = prepare_time($arrStartTime,$strPeriodOfTime,true);

		$col = $arrStartTime['column'];
		$interval = $arrStartTime['interval'];

		$currentStart = mktime($arrStartTime['tm_hour'],$arrStartTime['tm_min'],$arrStartTime['tm_sec'],$arrStartTime['tm_mon'],$arrStartTime['tm_mday'],$arrStartTime['tm_year']);

		$arrStartTime[$col]=	$arrStartTime[$col]+$interval;
		$currentEnd = mktime($arrStartTime['tm_hour'],$arrStartTime['tm_min'],$arrStartTime['tm_sec']-1,$arrStartTime['tm_mon'],$arrStartTime['tm_mday'],$arrStartTime['tm_year']);

		$finalEnd = mktime($arrEndTime['tm_hour'],$arrEndTime['tm_min'],$arrEndTime['tm_sec']-1,$arrEndTime['tm_mon'],$arrEndTime['tm_mday'],$arrEndTime['tm_year']);

		$numberOfIterations = 0;

		//While the current start point is less than the final end point
		$arrHolder = array();
		$strOutput = '';
		$dt_fmt = $arrEndTime['dt_fmt'];
		if($arrCriteria['table_pass']!="")
				$temp = $arrCriteria['table_pass'];

		$this->graphTitle = $arrCriteria['trend_value']." Report from ".date($dt_fmt,$currentStart).' to '.date($dt_fmt,$finalEnd);

		//Loop while the current start of the periods time is less than the final end time
		while($currentStart < $finalEnd)
		{
			$numberOfIterations++;
			//Put the current time period into labels
			if($this->graphLabels==''){
				$this->graphLabels =date($dt_fmt,$currentStart).' to '.date($dt_fmt,$currentEnd+1);
			}else{
				$this->graphLabels = $this->graphLabels.',,,'.date($dt_fmt,$currentStart).' to '.date($dt_fmt,$currentEnd+1);
			}

			//Add another entry to any existing data
			$arrGraphValues = explode('___',$this->graphValue);
			if(!$arrGraphValues || $arrGraphValues[0]==''){

			}else
			{
				for($i=0;$i<count($arrGraphValues);$i++)
					{
					$arrGraphValues[$i] = $arrGraphValues[$i].',,,0';
				}
			}
			$this->graphValue = implode('___',$arrGraphValues);

			//Update the current selection criteria
			$arrCriteria['trend_lower'] = $currentStart ;
			$arrCriteria['trend_upper'] = $currentEnd;
			$arrCriteria['table_pass'] = $temp.'_pass'.$numberOfIterations.'_';

			//conduct the search
			$strOutput .= 	$this->perform_search($arrCriteria,1,$strOrderByColumn, $strOrderByDir);
			$strOutput .= "</div>";
			//Update the next selection period
			$currentStart = $currentEnd + 1;
			$arrStartTime[$col]=	$arrStartTime[$col]+$interval;
			$currentEnd = mktime($arrStartTime['tm_hour'],$arrStartTime['tm_min'],$arrStartTime['tm_sec']-1,$arrStartTime['tm_mon'],$arrStartTime['tm_mday'],$arrStartTime['tm_year']);

		}
	//		$strOutput .= "</div>";
		return $strOutput;
	}
	
	function create_trend_picker()
	{
		$strHTML = "<p>Select Period of Time<br/><select id='trend_value' style='width:300px;' intype='strpicklist' op='' class='mandatory' displayname='Period Of Time'>";
		$strHTML .= "<option value=''></option>";
		$strHTML .= "<option value='Hourly'>Hourly</option>";
		$strHTML .= "<option value='Daily'>Daily</option>";
		$strHTML .= "<option value='Weekly'>Weekly</option>";
		$strHTML .= "<option value='Monthly'>Monthly</option>";
		$strHTML .= "<option value='Quarter'>Quarter</option>";
		$strHTML .= "</select></p>";
		return $strHTML;
	}
	
}//--eof class

//-- helpers - generate html input types
function create_report_inputtext($binding,$op,$prompt,$xmlInput)
{
	$strHTML = "<p>".$prompt."<br/><input style='width:300px;' type='text' id='".$binding."' intype='inputtext' op='".$op."'></p>";
	return $strHTML;
}

function create_report_daterange($binding,$op,$prompt,$xmlInput)
{
	$strHTML = "<p>".$prompt."<br/><input onclick='app.get_dateinput(event);' readonly style='width:133px;' class='input-date' maxlength=10 type='text' id='".$binding."' intype='daterange' op='>='> and <input readonly onclick='app.get_dateinput(event);' class='input-date' maxlength=10 style='width:133px;' type='text' id='".$binding."' intype='daterange' op='<='></p>";
	return $strHTML;
}

function create_report_date($binding,$op,$prompt,$xmlInput)
{
	$strHTML = "<p>".$prompt."<br/><input onclick='app.get_dateinput(event);' readonly style='width:133px;'  class='input-date' maxlength=10 type='text' id='".$binding."' intype='date' op='".$op."'></p>";
	return $strHTML;
}

function create_report_profilecode($binding,$op,$prompt,$xmlInput)
{
	$strHTML = "<p>".$prompt."<br/><input style='width:300px;' type='text' id='".$binding."' intype='profilecode' op='".$op."'></p>";
	return $strHTML;
}

function create_report_dbpicklist($binding,$op,$prompt,$xmlInput)
{
	$strDSN = getAttribute("dsn", $xmlInput->attributes());
	$strTable = getAttribute("dbtable", $xmlInput->attributes());
	$strKeyCol = getAttribute("keycol", $xmlInput->attributes());
	$strTxtCol = getAttribute("txtcol", $xmlInput->attributes());
	$strFilter = getAttribute("filter", $xmlInput->attributes());

	//-- get db pick list data
	$strDSN=getAttribute("dsn",$xmlInput->attributes());
	if($strDSN=="syscache")
	{
		$strDSN = "Supportworks Cache";
		$strUID = swcuid();    
		$strPWD = swcpwd();
	}
	else if($strDSN=="swdata")
	{
		$strDSN = swdsn();
		$strUID = swuid();    
		$strPWD = swpwd();
	}
	else
	{
		//-- expect userid and password in the xml node
		$strUID = getAttribute("uid",$xmlInput->attributes());;    
		$strPWD = getAttribute("pwd",$xmlInput->attributes());
	}
	//-- the select to get data
	$strSelect = "select ".$strKeyCol." as keycol, ".$strTxtCol." as txtcol from ".$strTable." ".$strFilter;
	$tableODBC = new CSwDbConnection;
	if($tableODBC->Connect($strDSN,$strUID,$strPWD)==false)
	{
		return "<center>Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.</center>";
	}
	else
	{
		//-- execute sql
		$strSQL = parse_context_vars($strSelect);
		$recSet = $tableODBC->Query($strSQL,true);
		if(!$recSet)
		{
			$strHTML = "<center>Could not run SQL query required for this picklist. Please contact your Supportworks administrator<br></center>";
			if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
			{
				$strHTML .="<br><br><center>DSN : [".$tableODBC->DSN."] <br> SQL : " . $strSQL . "</center>";
			}
			return $strHTML;
		}
		else
		{

			//-- loop through and create data (check fields for conversion)
			$strHTML = "<p>".$prompt."<br/><select id='".$binding."' style='width:300px;' intype='dbpicklist' op='".$op."' onchange='check_dependancies(this);' dsn='".$strDSN."' table='".$strTable."' keycol='".$strKeyCol."' txtcol='".$strTxtCol."' applyfilter=''>";
			$strHTML .= "<option value=''></option>";
			while (!$recSet->eof) 
			{
				//--
				//-- for each field in the record
				$keycol = $recSet->xf("keycol");
				$txtcol = $recSet->f("txtcol");
				$strHTML .= "<option value='".$keycol."'>".$txtcol."</option>";
				$recSet->movenext();
			}
			$strHTML .= "</select></p>";
		}
		$recSet = null;
	}
	$tableODBC->Close();
	$tableODBC=null;
	return $strHTML;
}

function create_report_strpicklist($binding,$op,$prompt,$xmlInput)
{
	$strItems = getAttribute("items", $xmlInput->attributes());
	$arrItems = explode_assoc("=>","|",$strItems);
	$strHTML = "<p>".$prompt."<br/><select id='".$binding."' style='width:300px;' intype='strpicklist' op='".$op."' onchange='check_dependancies(this);'>";
	$strHTML .= "<option value=''></option>";
	foreach($arrItems as $key => $strItem)
	{
		$strHTML .= "<option value='".$key."'>".$strItem."</option>";
	}
	$strHTML .= "</select></p>";
	return $strHTML;
}

function create_report_numpicklist($binding,$op,$prompt,$xmlInput)
{
	$strItems = getAttribute("items", $xmlInput->attributes());
	$arrItems = explode("|",$strItems);
	$strHTML = "<p>".$prompt."<br/><select id='".$binding."' style='width:300px;' intype='numpicklist' op='".$op."' onchange='check_dependancies(this);'>";
	$strHTML .= "<option value=''></option>";
	foreach($arrItems as $key => $strItem)
	{
		$arrItem = explode("^",$strItem);
		$strHTML .= "<option value='".$arrItem[0]."'>".$arrItem[1]."</option>";
	}
	$strHTML .= "</select></p>";
	return $strHTML;
}



function explode_assoc($glue1, $glue2, $array)
{
	  $array2=explode($glue2, $array);
	  foreach($array2 as  $val)
	  {
				$pos=strpos($val,$glue1);
				if($pos!==false){
					$key=substr($val,0,$pos);
					$array3[$key] =substr($val,strlen($glue1)+$pos,strlen($val));
				}else{
					$key=$val;
					$array3[$key] =$val;
				}
	  }
	  return $array3;
}



//-- helpers to output report results (i.e. list , grouped list , charts etc) this will need expanding


//-- create straight data list
function output_table_datalist(&$oRS, $arrXmlCols, $xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	$strHeader = create_table_header($arrXmlCols,$xmlReport,$strOrderByColumn, $strOrderByDir);
	$strDataRows = create_table_datalist($oRS, $arrXmlCols, $xmlReport);
	$strFooter = create_table_footer($oRS);

	$arrCrit=$xmlReport->criteria;
	$idLink = $arrCrit['table_pass'];
	if($idLink==null)
	{
		$idLink = 0;
	}
	
	//F008866 have a flag so we know to not clear left as mozilla will display under menu
//	if($arrCrit['wssm']==true)
//	{
		$style = "clear:left;width: 98%; background: #FFFFDD; overflow-x:scroll;overflow-y:hidden;";
//	}else
//	{
//		$style = "clear:left;width: 98%; background: #FFFFDD; overflow-x:scroll;overflow-y:hidden;";
//	}
	
	$strHTML = "";
	$strHTML .= "<div id='table".$idLink."' orderbydir='".$strOrderByDir."' formid='". $idLink ."' style=\"".$style." \">";
	$strHTML .= "<table id='table".$idLink."' orderbydir='".$strOrderByDir."' class='dataTable' width='100%' border=0 formid='". $idLink ."' >";
	$strHTML .= "	<thead>";
	$strHTML .=			$strHeader;
	$strHTML .= "	</thead>";
	$strHTML .= "	<tbody>";
	$strHTML .= 		$strDataRows;
	$strHTML .= "	</tbody>";
	$strHTML .= "	<tfoot>";
	$strHTML .=			$strFooter;
	$strHTML .= "	</tfoot>";
	$strHTML .= "</table>";
	$strHTML .= "	</div>";

	return $strHTML;
}


//-- outputing data helpers
function create_table_header($xmlCols,$xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	$numCol=0;
	$arrLabels = explode(',,,',$xmlReport->graphLabels);

	if(!empty($arrLabels) && $arrLabels[0]!="")
		$strHTML .= "&nbsp;&nbsp;&nbsp;".end($arrLabels). "";
	//--
	//-- read xml columns and construct header
	foreach ($xmlCols as $nodePos => $aCol)
	{
		$numCol++;
		if($aCol->has_attributes())
		{
			$strDBname=getAttribute("dbname",$aCol->attributes());
			if($strDBname!="")
			{
				$strDBtable=getAttribute("dbtable",$aCol->attributes());
				$strFullDbName = $strDBtable.".".$strDBname;
				$strColName = $strDBname; //$strDBtable.".".$strDBname; - nwj 21.10.2008

				//-- is this the column we are sorting by
				//var_dump($xmlReport->criteria);
				$strImg="";
				if($numCol==$strOrderByColumn||($strFullDbName==$strOrderByColumn)||($strColName==$strOrderByColumn))
				{
					$strAppVal = "";
					if(isset($_SESSION['thisAppValue']))
						$strAppVal = "/".$_SESSION['thisAppValue'];

					$dir .= (strtolower($strOrderByDir) == "asc")?"up":"down";
					if($xmlReport->criteria['wssm']==true)
						$strImg = "&nbsp;<img src='img/icons/arr_".$dir.".gif'>";
					else
						$strImg = "&nbsp;<img src='../common".$strAppVal."/img/icons/arr_".$dir.".gif'>";
				}

				$strHeader=$aCol->get_content();		
				if($aCol->tagname=='freetext')
						$strHeader=str_replace("_"," ",$strDBname);

				if($xmlReport->levelOfSelect==1)
				{
					$strHTML .=	"<th onclick='report_sort(this);' class='report-tbl-header'  tablename='".$numCol."' dbname='' align='left'>".$strHeader.$strImg."</th>";
				}
				else
				{
					$strHTML .=	"<th noWrap onclick='sub_table_sort(this);' class='report-tbl-header' tablename='".$numCol."' dbname='' align='left'>".$strHeader.$strImg."</th>";
				}
			}
		}
		
	}
	return $strHTML;
}

function create_table_datalist($oRS,$xmlCols, $xmlReport)
{
	$strHTML = "";
	$numberOfRows = 0;

	$widthPerColumn = get_col_width($xmlCols,$xmlReport->levelOfSelect);

	while (!$oRS->eof) 
	{
		$numberOfRows++;
		$displayRow = true;
		$strHeading ='';
		$criteria = '';
		$graphValue = '';
		$strRow = "";
		$strRow .= "<tr>";

		foreach ($xmlCols as $nodePos => $aCol)
		{
			$boolIsAggregate = false;
			if($aCol->has_attributes())
			{
				$strDBname=getAttribute("dbname",$aCol->attributes());
				if($strDBname!="")
				{
					if(getAttribute("hidden",$aCol->attributes())){
						//do not display if hidden
					}
					else
					{
						$strMandatory=getAttribute("mandatory",$aCol->attributes());
						
						$strDBtable=getAttribute("dbtable",$aCol->attributes());
						$strConversion=getAttribute("conversion",$aCol->attributes());
						$strAggFunction=getAttribute("aggFunction",$aCol->attributes());
						$strDBname = strtolower($strDBname);
						$boolIsAggregate=getAttribute("aggregate",$aCol->attributes());
						if($boolIsAggregate){
								$strDBname = strtolower($strAggFunction.$strDBtable.$strDBname);
						}
						if($aCol->tagname=='freetext')
							$boolIsAggregate=true;
		
						//--
						//-- get display value as may need converting
						$fieldValue = $oRS->xf($strDBname);
						if($strMandatory && $fieldValue=="")
							$displayRow = false;

						if(getAttribute("graph",$aCol->attributes()))
							$graphValue = $fieldValue;
						if($strDBtable!="")$strDBname = $strDBtable . "." . $strDBname;

						if($strConversion=="callref")
						{
							if ( ($_SESSION['portalmode'] == "FATCLIENT") && (gv('phpprintmode')!="1") )
							{
								$strDoc = "http://".$GLOBALS['SERVER_NAME']."/sw/clisupp/details/ITSMF/";
								if ($_SERVER['HTTPS'] =="on")$strDoc=str_replace("http://","https://", $strDoc);
								$DisplayfieldValue = "<a href='".$strDoc."swcall.php?callref=".$fieldValue."'>".swcallref_str($fieldValue)."</a>";
							}
							else
							{
								$DisplayfieldValue = swcallref_str($fieldValue);
							}
						}else
						{
							$DisplayfieldValue = common_convert_field_value($strConversion,$fieldValue,$strDBname);
						}

						$strRow .= "<td class='report-tbl-data'>".$DisplayfieldValue.'</td>';
						if(!$boolIsAggregate){
							if($strHeading!='')$strHeading .='-';
							$strHeading .=$DisplayfieldValue;
						}
					}
				}
			}
		}
		$strRow .= "</tr>";
		$isTopLayer = $xmlReport->levelOfSelect=='1';
		if($isTopLayer){

			if($graphValue!="")
			{
				$arrData =create_graph_data($strHeading,$xmlReport->graphHeader,$graphValue,$xmlReport->graphLabels,$xmlReport->graphValue);
				$xmlReport->graphHeader = $arrData['Header'];
				$xmlReport->graphValue = $arrData['Value'];
				$xmlReport->graphLabels = $arrData['Labels'];
			}
		}
		if($displayRow)
			$strHTML .= $strRow;
		$oRS->movenext();
	}
	$oRS = null;
	return $strHTML;
}

function create_table_footer($oRS)
{
	return "";
}

function output_summary_datalist(&$oRS, $arrXmlCols, $xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	//F008866 have a flag so we know to not clear left as mozilla will display under menu
	if($xmlReport->criteria['wssm']==true)
	{
		$style = "width: 100%;  overflow:hidden;display:inline;float:right; ";
	}else
	{
		$style = "clear:left;width: 100%;  overflow:hidden;display:inline;float:right; ";
	}

	$strHeader = create_summary_table_header($arrXmlCols,$xmlReport,$strOrderByColumn, $strOrderByDir);
	$strDataRows = create_summary_table_datalist($oRS, $arrXmlCols, $xmlReport);
	$strHTML = "";

	$strHTML .= "<div id='testing' style=\"".$style."\">";

	$strHTML .= "<div class='header' style=\"width:100%;display:inline;float:right; \">";
	$strHTML .=			$strHeader;
	$strHTML .= "</div>";

	$strHTML .= "<div style=\"height:1px; width:90%; background-position: bottom;  background-image: url(../common";
	if(isset($_SESSION['thisAppValue']))
		$strHTML .= "/".$_SESSION['thisAppValue'];
	$strHTML .= "/img/structure/dotted_underline.gif); display:inline;overflow:hidden;float:right;margin-right:20px \"></div>";


	$strHTML .= "<div style=\"width: 95%;  overflow:hidden;display:inline;float:right; \">";
	$strHTML .= 		$strDataRows;
	$strHTML .= "</div>";
	$strHTML .= "</div>";
	return $strHTML;
}

function create_summary_table_header($xmlCols,$xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	$widthPerColumn =  get_col_width($xmlCols,$xmlReport->levelOfSelect);
	$arrLabels = explode(',,,',$xmlReport->graphLabels);

	if(!empty($arrLabels) && $arrLabels[0]!="")
	{
		$strHTML .= "&nbsp;&nbsp;&nbsp;".end($arrLabels). "";
		$strHTML .= "</div><div class='header' style=\"clear:right;width:100%;display:inline;float:right; \">";
	}

	$strHTML .= "<div class='report' style='display:inline;align:right;'>";

		$strHTML .="<div class='li-report-tbl-img' style=\"width:15;display:inline;clear:left;\">";

		$strHTML .="";

		$strHTML .="</div>";

	//-- read xml columns and construct header
	$colNum = 0;
	foreach ($xmlCols as $nodePos => $aCol)
	{
		$colNum++;
		if($aCol->has_attributes())
		{
			if(!getAttribute("hidden",$aCol->attributes())){
				$strDBname=getAttribute("dbname",$aCol->attributes());
				if($strDBname!="")
				{
					$strDBtable=getAttribute("dbtable",$aCol->attributes());
					$strFullDbName = $strDBtable.".".$strDBname;
					$strColName=$strDBname;
					$strHeader=$aCol->get_content();		

					//-- is this the column we are sorting by
					$strImg="";
					if($colNum==$strOrderByColumn)
					{
						$dir .= (strtolower($strOrderByDir) == "asc")?"up":"down";
						if($xmlReport->criteria['wssm']==true)
							$strImg = "&nbsp;<img src='img/icons/arr_".$dir.".gif'>";
						else
						{
							$strImg = "&nbsp;<img src='../common/img/icons/arr_".$dir.".gif'>";
							if(isset($_SESSION['thisAppValue']))
								$strImg = "&nbsp;<img src='../common/".$_SESSION['thisAppValue']."/img/icons/arr_".$dir.".gif'>";
						}
					}

				
					if($aCol->tagname=='freetext')
						$strHeader=str_replace("_"," ",$strDBname);

					if($xmlReport->levelOfSelect==1)
					{
						//$strHTML .=	"<li onclick='report_sort(this);' class='li-report-tbl-header' style=\"width: ".$widthPerColumn.";\" tablename='".$strDBtable."' dbname='".$strColName."' align='left'>".$strHeader.$strImg."</li>";
						$strHTML .=	"<div onclick='report_sort(this);' class='li-report-tbl-header' style=\"width: ".$widthPerColumn.";\" tablename='".$colNum."' dbname='' align='left'>".$strHeader.$strImg."</div>";

					}
					else
					{
						$arrCriteria = $xmlReport->criteria;
						$pass = $arrCriteria['table_pass'];
						$parentDiv = substr($pass,0,-1);
						$strHTML .=	"<div onclick='report_sub_sort(this,\"".$xmlReport->levelOfSelect."\");' class='li-report-tbl-header' style=\"width: ".$widthPerColumn.";\" reload=\"".$parentDiv."\" tablename='".$colNum."' dbname='' align='left'>".$strHeader.$strImg."</div>";

					}

				}
			}
		}
		
	}
	$strHTML .=	"</div>";
	return $strHTML;
}

function create_summary_table_datalist($oRS,$xmlCols, $xmlReport)
{
	$arrCriteria =  $xmlReport->criteria;
	if(!isset($arrCriteria['table_pass']))
		$arrCriteria['table_pass']='';

	$strHTML = "";
	$numberOfRows = 0;
	$widthPerColumn = get_col_width($xmlCols,$xmlReport->levelOfSelect);

	while (!$oRS->eof) 
	{
		$numberOfRows++;

		$strHeading ='';
		$criteria = '';
		$graphValue = '';

		$strHTML .= "<div class='report' style='display:inline;clear:left;'>";
		$strHTML .="<div class='li-report-tbl-img' style=\"width:10;display:inline;clear:left;\">";
		$img = 	"../common/img/icons/blue_expand.gif";
		if(isset($_SESSION['thisAppValue']))
			$img = 	"../common/".$_SESSION['thisAppValue']."/img/icons/blue_expand.gif";

		if($xmlReport->criteria['wssm']==true)
			$img = 	"img/icons/blue_expand.gif";		
		
		$strHTML .="<img onclick='img_exp_click(this,\"".$arrCriteria['table_pass'].$numberOfRows."\")' id='img".$arrCriteria['table_pass'] .$numberOfRows."' toexpand=\"div".$arrCriteria['table_pass'].$numberOfRows."\" readfrom=\"form".$arrCriteria['table_pass'].$numberOfRows."\" src='".$img."' width='10' height='10' expanded='0' loaded='0' style='padding:4px -5px auto auto;'>";

		$strHTML .="</div>";

		foreach ($xmlCols as $nodePos => $aCol)
		{
			$boolIsAggregate = false;
			if($aCol->has_attributes())
			{
				$strDBname=getAttribute("dbname",$aCol->attributes());
				if($strDBname!="")
				{
					if(getAttribute("hidden",$aCol->attributes())){
					}else{
						$numberOfCols++;
						$strDBtable=getAttribute("dbtable",$aCol->attributes());
						$strConversion=getAttribute("conversion",$aCol->attributes());
						$strAggFunction=getAttribute("aggFunction",$aCol->attributes());
						$strDBname = strtolower($strDBname);
						$boolIsAggregate=getAttribute("aggregate",$aCol->attributes());
						if($boolIsAggregate){
								$strDBname = strtolower($strAggFunction.$strDBtable.$strDBname);
						}
						if($aCol->tagname=='freetext')
							$boolIsAggregate=true;
		
						//--
						//-- get display value as may need converting
						$fieldValue = $oRS->xf($strDBname);
						$isNullFieldValue = $oRS->is_field_null($strDBname);
						if($strDBtable!="")$strDBname = $strDBtable . "." . $strDBname;
						$DisplayfieldValue = common_convert_field_value($strConversion,$fieldValue,$strDBname);
						if(getAttribute("graph",$aCol->attributes()))
							$graphValue = $DisplayfieldValue;

						$strHTML .= "<div class='li-report-tbl-data' style=\"word-wrap:break-word;width: ".$widthPerColumn.";\"  align='left'>".$DisplayfieldValue.'</div>';
						if(!$boolIsAggregate){
							if($strHeading!='')$strHeading .='-';
							$strHeading .=$DisplayfieldValue;
							if($criteria==''){
								if($isNullFieldValue){
									$criteria = ' '.$strDBname.' IS NULL ';

								}elseif($fieldValue=='')
									$criteria = ' '.$strDBname.' = \'\'';
								else
									$criteria = $strDBname.' = \''.$fieldValue.'\'' ;
							}else{					
								if($isNullFieldValue){
									$criteria = $criteria .' AND '.$strDBname.' IS NULL ';

								}elseif($fieldValue=='')
									$criteria =  $criteria.' AND '.'  '.$strDBname.'  = \'\' ';
								else
									$criteria =  $criteria.' AND '.$strDBname.' = \''.$fieldValue.'\'' ;

							}
						}
					}
				}
			}
		}
		$oRS->movenext();
		$isTopLayer = $xmlReport->levelOfSelect=='1';
		if($isTopLayer){

			if($graphValue!="")
			{
				$arrData =create_graph_data($strHeading,$xmlReport->graphHeader,$graphValue,$xmlReport->graphLabels,$xmlReport->graphValue);
				$xmlReport->graphHeader = $arrData['Header'];
				$xmlReport->graphValue = $arrData['Value'];
				$xmlReport->graphLabels = $arrData['Labels'];
			}
		}
		if(isset($arrCriteria["trend_upper"]) && isset($arrCriteria["trend_lower"]))
		{
			//-- get trend criteria
			$xmlStaticCriteria = $xmlReport->xmlRoot->get_elements_by_tagname("trend");
			foreach($xmlStaticCriteria as $inputKey => $anInput)
			{
					$strDBName = getAttribute("dbname", $anInput->attributes());
					$strDBColumn = getAttribute("dbtable", $anInput->attributes());
					if($strUserCriteria != "")$strUserCriteria .= " and ";

					$strUserCriteria .= $strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
					
					if($arrCriteria["static_link"]=="")
						$arrCriteria["static_link"]=$strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
					else
						$arrCriteria["static_link"] .= " and  ".$strDBColumn.'.'. $strDBName ." between ".$arrCriteria["trend_lower"] ." and " . $arrCriteria["trend_upper"]. "";
			}
		}

		$strHTML .= "</div>";
		if($arrCriteria['static_link']!="")
		{
			if($criteria!="")$criteria.=" and ";
			$criteria .= $arrCriteria['static_link'];
		}
		$arrCriteria['table_link'] = $arrCriteria['table_pass'] . $numberOfRows;
		$tempStr = '<div style=\'clear:left;width:100%;\' id="form'.$arrCriteria['table_link'].'">';
		$tempStr .=  '<input type="hidden" id="static_link" value="'. urlencode($criteria).'">';
		$tempStr .=  '<input type="hidden" id="reportname" value="'. urlencode($xmlReport->xmlFileName).'">';
		$tempStr .=  '<input type="hidden" id="table_pass" value="'. $arrCriteria['table_link'].'_">';
		$tempStr .=  '<input type="hidden" id="level" value="'. $xmlReport->levelOfSelect.'">';
		$tempStr .=  '<input type="hidden" id="sort_level'. $xmlReport->levelOfSelect.'" value="'.$arrCriteria['sort_level'.$xmlReport->levelOfSelect].'">';
		$tempStr .=  '<input type="hidden" id="sort_level_dir_'. $xmlReport->levelOfSelect.'" value="'.$arrCriteria['sort_level_dir_'.$xmlReport->levelOfSelect].'">';
		$tempStr .= "<div style='clear:left;width:100%;display:none;' formid='".$arrCriteria['table_link']."' id='div".$arrCriteria['table_link']."' loaded='0' expanded='0'></div>";
		$tempStr .= '</div>';
		$strHTML .=$tempStr;
	}
	$oRS = null;
	return $strHTML;
}

//-- create trending data list - top level
function output_trend_datalist(&$oRS, $arrXmlCols, $xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	$strHeader = create_trend_table_header($arrXmlCols,$xmlReport,$strOrderByColumn, $strOrderByDir);
	$strGrpHeader = create_trend_table_grp_header($arrXmlCols,$xmlReport,$strOrderByColumn, $strOrderByDir);
	$strDataRows = create_trend_table_datalist($oRS, $arrXmlCols, $xmlReport);

	$strHTML = "";
	$strHTML .= "<div id='testing' style=\"clear:right;width: 100%;  overflow:hidden;display:inline;float:right; \">";
	$strHTML .= "<div class='header' style=\"width: 99%; display:inline;float:right; \">";
	$strHTML .=			$strHeader;
	$strHTML .= "</div>";
	$strHTML .= "<div class='header' style=\"clear:right;width: 99%; display:inline;float:right; \">";
	$strHTML .=			$strGrpHeader;
	$strHTML .= "</div>";
	$strHTML .= "<div style=\"height:1px; width:95%; background-position: bottom;  background-image: url(../common";
	if(isset($_SESSION['thisAppValue']))
		$strHTML .= "/".$_SESSION['thisAppValue'];
	$strHTML .= "/img/structure/dotted_underline.gif); display:inline; overflow:hidden;float:right;margin-right:20px;\"></div>";
	$strHTML .= "<div style=\"width: 95%;  overflow:hidden;display:inline;float:right;\">";
	$strHTML .= 		$strDataRows;
	$strHTML .= "</div>";
	return $strHTML;
}

function create_trend_table_grp_header($xmlCols,$xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	//get width of the columns
	$widthPerColumn =  get_col_width($xmlCols,0);

	$arrCriteria = $xmlReport->criteria;
	$colNum = 0;
	$strHTML="<div class='report' style='display:inline;align:right;'>";

	//-- read xml columns and construct header
	foreach ($xmlCols as $nodePos => $aCol)
	{
		$colNum++;
		if($aCol->has_attributes())
		{
			if(!getAttribute("hidden",$aCol->attributes())){
				$strDBname=getAttribute("dbname",$aCol->attributes());
				if($strDBname!="")
				{
					$strDBtable=getAttribute("dbtable",$aCol->attributes());
					$strFullDbName = $strDBtable.".".$strDBname;
					$strColName=$strDBname;
					$strHeader=$aCol->get_content();		

					//-- is this the column we are sorting by
					$strImg="";
					if($colNum==$strOrderByColumn)
					{
						$dir .= (strtolower($strOrderByDir) == "asc")?"up":"down";
						if($xmlReport->criteria['wssm']==true)
							$strImg = "&nbsp;<img src='img/icons/arr_".$dir.".gif'>";
						else
						{
							$strImg = "&nbsp;<img src='../common/img/icons/arr_".$dir.".gif'>";
							if(isset($_SESSION['thisAppValue']))
								$strImg = "&nbsp;<img src='../common/".$_SESSION['thisAppValue']."/img/icons/arr_".$dir.".gif'>";
						}
					}

					if($aCol->tagname=='freetext')
						$strHeader=str_replace("_"," ",$strDBname);
					$strHTML .=	"<div onclick='report_sort(this);' class='li-report-tbl-header' style=\"width: ".$widthPerColumn.";\" tablename='".$colNum."' dbname='' align='left'>".$strHeader.$strImg."</div>";
				}
			}
		}
		
	}
	$strHTML .= "</div>";

	return $strHTML;
}

function create_trend_table_header($xmlCols,$xmlReport,$strOrderByColumn = "", $strOrderByDir = "ASC")
{
	//get width of the columns
	$widthPerColumn =  get_col_width($xmlCols,0);

	//split graph label
	$arrLabels = explode(',,,',$xmlReport->graphLabels);
	$headerTitle = end($arrLabels);
	$strHTML .="<div class='report' style='display:inline;align:right;'>";

	$arrCriteria = $xmlReport->criteria;
	$strHTML .= "";

	$img = 	"../common/img/icons/blue_expand.gif";	
	if(isset($_SESSION['thisAppValue']))
		$img = 	"../common/".$_SESSION['thisAppValue']."/img/icons/blue_expand.gif";	
	if($xmlReport->criteria['wssm']==true)
		$img = 	"img/icons/blue_expand.gif";

	$strLevel = getAttribute("singlelevel", $xmlReport->xmlRoot->attributes());
	if($strLevel=="")
		$strLevel = 0;
	if($xmlReport->isLastLevel==false ||$strLevel==0)
			$strHTML .="<img style='margin-left:22px;' onclick='img_exp_click(this,\"".$arrCriteria['table_pass'] ."\");' id='img".$arrCriteria['table_pass'] ."' toexpand=\"div".$arrCriteria['table_pass'] ."\" src='".$img."' width='10' height='10' expanded='0' loaded='0'>";

	if($headerTitle!="")
	{
		$strHTML .= "<span>".$headerTitle."</span>";
	}
	$strHTML .="</div>";
	return $strHTML;
}

function create_trend_table_datalist($oRS,$xmlCols, $xmlReport)
{
	$arrCriteria =  $xmlReport->criteria;

	if(!isset($arrCriteria['table_pass']))
		$arrCriteria['table_pass']='';

	$strHTML = "";
	$numberOfRows = 0;

	$strLevel = getAttribute("singlelevel", $xmlReport->xmlRoot->attributes());
	if($strLevel=="")
		$strLevel=0;
	
	$widthPerColumn = get_col_width($xmlCols,0);
	$xmlStaticCriteria = $xmlReport->xmlRoot->get_elements_by_tagname("trend");
	foreach($xmlStaticCriteria as $inputKey => $anInput)
	{
		$strDBName = getAttribute("dbname", $anInput->attributes());
		$strDBColumn = getAttribute("dbtable", $anInput->attributes());
		$strFullDbName = $strDBColumn.'.'. $strDBName;
	}
	//while there are rows of data
	while (!$oRS->eof) 
	{
		$numberOfRows++;
		$strHeading ='';
		$graphValue = '';
		$strHTML .= "<div class='report' style='display:inline;clear:right;'>";
		//$strHTML .="<div class='report' style=\"width:10;\"></div>";

		//foreach column
		foreach ($xmlCols as $nodePos => $aCol)
		{
			$boolIsAggregate = false;
			if($aCol->has_attributes())
			{
				$strDBname=getAttribute("dbname",$aCol->attributes());
				if($strDBname!="")
				{
					if(getAttribute("hidden",$aCol->attributes())){
					}else{
						$numberOfCols++;
						$strDBtable=getAttribute("dbtable",$aCol->attributes());
						$strConversion=getAttribute("conversion",$aCol->attributes());
						$strAggFunction=getAttribute("aggFunction",$aCol->attributes());
						$strDBname = strtolower($strDBname);
						$boolIsAggregate=getAttribute("aggregate",$aCol->attributes());
						if($boolIsAggregate){
								$strDBname = strtolower($strAggFunction.$strDBtable.$strDBname);
						}
						if($aCol->tagname=='freetext')
							$boolIsAggregate=true;
		
						//--
						//-- get display value as may need converting
						$fieldValue = $oRS->xf($strDBname);
						if(getAttribute("graph",$aCol->attributes()))
							$graphValue = $fieldValue;
						if($strDBtable!="")$strDBname = $strDBtable . "." . $strDBname;
						$DisplayfieldValue = common_convert_field_value($strConversion,$fieldValue,$strDBname);

						$strHTML .= "<div class='li-report-tbl-data' style=\"word-wrap:break-word;width: ".$widthPerColumn.";\">".$DisplayfieldValue.'</div>';

						if(!$boolIsAggregate || count($xmlCols)==1){
							if($strHeading!='')$strHeading .='-';
							$strHeading .=$DisplayfieldValue;
						}
					}
				}
			}
		}
		$oRS->movenext();

		if($graphValue!="")
		{
			$arrData =create_graph_data($strHeading,$xmlReport->graphHeader,$graphValue,$xmlReport->graphLabels,$xmlReport->graphValue);
			$xmlReport->graphHeader = $arrData['Header'];
			$xmlReport->graphValue = $arrData['Value'];
			$xmlReport->graphLabels = $arrData['Labels'];
		}


		$strHTML .= "</div>";
		$arrCriteria['table_link'] = $arrCriteria['table_pass'] . $numberOfRows;

		//use a div as a form - this is the div containing the top level of trend - which can be split down into smaller time scales
		$tempStr = '<div id="form'.$arrCriteria['table_pass'].'">';

		//pass through to the next level the trend time period (upper and lower limit for this grouping)
		$tempStr .=  '<input type="hidden" id="'.str_replace(".","..",$strFullDbName).'__1" value="'. $arrCriteria["trend_upper"].'">';
		$tempStr .=  '<input type="hidden" id="'.str_replace(".","..",$strFullDbName).'" value="'. $arrCriteria["trend_lower"].'">';

		//pass through the table link, file name and level.
		$tempStr .=  '<input type="hidden" id="reportname" value="'. urlencode($xmlReport->xmlFileName).'">';
		$tempStr .=  '<input type="hidden" id="table_pass" value="'. $arrCriteria['table_link'].'_">';
		$tempStr .=  '<input type="hidden" id="level" value="'.$strLevel.'">';

		//nwj added this - why?
		$tempStr .= "<div formid='".$arrCriteria['table_pass']."' id='div".$arrCriteria['table_pass']."'  loaded='0' expanded='0'></div>";
		$tempStr .= '</div>';
	}

	//If there is no data for this period - setup dummy div
	if($strHTML=="")
	{
		//use a div as a form - this is the div containing the top level of trend - which can be split down into smaller time scales
		$tempStr = '<div id="form'.$arrCriteria['table_pass'].'">';

		//pass through to the next level the trend time period (upper and lower limit for this grouping)
		$tempStr .=  '<input type="hidden" id="'.str_replace(".","..",$strFullDbName).'__1" value="'. $arrCriteria["trend_upper"].'">';
		$tempStr .=  '<input type="hidden" id="'.str_replace(".","..",$strFullDbName).'" value="'. $arrCriteria["trend_lower"].'">';

		//pass through the table link, file name and level.
		$tempStr .=  '<input type="hidden" id="reportname" value="'. urlencode($xmlReport->xmlFileName).'">';
		$tempStr .=  '<input type="hidden" id="table_pass" value="'. $arrCriteria['table_link'].'_">';
		$strLevel = getAttribute("singlelevel", $xmlReport->xmlRoot->attributes());
		if($strLevel=="")
			$strLevel=0;
		$tempStr .=  '<input type="hidden" id="level" value="'.$strLevel.'">';
		
		$tempStr .= "<div formid='".$arrCriteria['table_link']."' id='div".$arrCriteria['table_link']."' style='font-size:12px;clear:right; overflow-x:hidden;overflow-y:hidden; display:none;background: #FFFFDD;' loaded='0' expanded='0'></div>";
		$tempStr .= '</div>';

	}	$strHTML .=$tempStr;
	$oRS = null;
	return $strHTML;
}




function get_col_width($xmlCols,$offset = 1)
{
	$NumberOfCols=0;
	foreach ($xmlCols as $nodePos => $aCol)
	{
		if($aCol->has_attributes())
		{
			if(!getAttribute("hidden",$aCol->attributes())){

				$NumberOfCols++;

			}
		}
	}
	$widthPerColumn = (100 - $offset*5)/$NumberOfCols-3;
	$widthPerColumn .= "%";
	return $widthPerColumn;
}



//This function is used to mimic the php 5 function strptime
function parseTime($timeStamp){
	$arrTime = array();
	$arrTime['tm_mon']= intval(date('m',$timeStamp));
	$arrTime['tm_mday']=  intval(date('j',$timeStamp));
	$arrTime['tm_year']=  intval(date('Y',$timeStamp));
	$arrTime['tm_hour']= intval(date('H',$timeStamp));
	$arrTime['tm_min']=  intval(date('i',$timeStamp));
	$arrTime['tm_sec']=  intval(date('s',$timeStamp));
	$arrTime['tm_wday']= intval(date('w',$timeStamp));
	return $arrTime;
}

function prepare_time($arrEndTime,$column,$isStartConversion){

	$arrEndTime['tm_sec'] = 0;
	$arrEndTime['tm_min'] = 0;
	$arrEndTime['tm_hour'] = 0;
	$arrEndTime['dt_fmt'] = "Y-m-d H:i:s";
	switch($column)
	{
		case "Hourly":
			if($isStartConversion){
				$arrEndTime['tm_sec'] = 0;
				$arrEndTime['tm_min'] = 0;
				$arrEndTime['tm_hour'] = 7;
			}else{
				$arrEndTime['tm_sec'] = 0;
				$arrEndTime['tm_min'] = 0;
				$arrEndTime['tm_hour'] = 20;
			}
			$arrEndTime['column'] = 'tm_hour';
			$arrEndTime['interval'] = 1;
			break;
		case "Daily":
			if($isStartConversion){
				$arrEndTime['tm_mday']= $arrEndTime['tm_mday'];
			}else{
				$arrEndTime['tm_mday']= $arrEndTime['tm_mday']+1;
			}
			$arrEndTime['column'] = 'tm_mday';
			$arrEndTime['interval'] = 1;
			$arrEndTime['dt_fmt'] = "Y-m-d";
			break;
		case "Weekly":
			if($isStartConversion){
				$arrEndTime['tm_mday']= $arrEndTime['tm_mday']-$arrEndTime['tm_wday'];
			}else{
				$arrEndTime['tm_mday']=  $arrEndTime['tm_mday']+(7-$arrEndTime['tm_wday']);
			}
			$arrEndTime['column'] = 'tm_mday';
			$arrEndTime['interval'] = 7;
			$arrEndTime['dt_fmt'] = "Y-m-d";
			break;
		case "Monthly":
			if($isStartConversion){
				$arrEndTime['tm_mday']= 1;
				$arrEndTime['tm_mon']=$arrEndTime['tm_mon']  ;
			}else{
				$arrEndTime['tm_mday']= 1;
				$arrEndTime['tm_mon']=$arrEndTime['tm_mon']  +1;
			}
			$arrEndTime['column'] = 'tm_mon';
			$arrEndTime['interval'] = 1;
			$arrEndTime['dt_fmt'] = "Y-m";
			break;
		case "Quarter":
			if($isStartConversion){
				while(($arrEndTime['tm_mon']%3)>0){
					$arrEndTime['tm_mon'] = $arrEndTime['tm_mon']-1;
				}
				$arrEndTime['tm_mon'] = $arrEndTime['tm_mon']+1;
				$arrEndTime['tm_mday']= 1;
			}else{
				$arrEndTime['tm_mday']= 1;
				while(($arrEndTime['tm_mon']%3)>0){
					$arrEndTime['tm_mon'] = $arrEndTime['tm_mon']+1;
				}
				$arrEndTime['tm_mon'] = $arrEndTime['tm_mon']+1;
			}
			$arrEndTime['column'] = 'tm_mon';
			$arrEndTime['interval'] = 3;
			$arrEndTime['dt_fmt'] = "Y-m";
			break;
		default:
			break;
	}
	return $arrEndTime;
}


function create_graph_data($strData,$strExistingKeys,$strValue,$strLabels,$strExistingValues){
		if($strLabels=='' ||$strLabels===Null ){
		
		//NO LABELS, SO IS BAR GRAPH
		$arrExistingValues = explode(',,,',$strExistingValues);
		$arrExistingKeys = explode(',,,',$strExistingKeys);
		if(!$arrExistingKeys || $arrExistingKeys[0]=='')
			return array('Header'=>$strData,'Value'=>$strValue,'Labels'=>'');
	
		//If already exists - should not happen
		for($i=0;$i<count($arrExistingKeys);$i++){
			if($arrExistingKeys[$i]==$strData)
				return array('Header'=>$strExistingKeys,'Value'=>$strExistingValues,'Labels'=>'');
		}
		
		$strData = html_entity_decode($strData);
		array_push($arrExistingKeys,$strData);
		array_push($arrExistingValues,$strValue);

		$returnArray = array('Header'=>implode(',,,',$arrExistingKeys),'Value'=>implode(',,,',$arrExistingValues),'Labels'=>'');
		
		return	$returnArray;
	}else{
		//There are labels, so this is the line graph

		$arrExistingValues = explode('___',$strExistingValues);
		$arrExistingKeys = explode(',,,',$strExistingKeys);
		$arrExistingLabels = explode(',,,',$strLabels);

		if(!$arrExistingKeys || $arrExistingKeys[0]==''){
			if(count($arrExistingLabels)>1){

				$strInput = '0';
				for($i=2;$i<count($arrExistingLabels);$i++){
					$strInput .= ',,,0';
				}
				$strInput .= ',,,'.$strValue;
			}else
				$strInput = $strValue;
			return array('Header'=>$strData,'Value'=>$strInput,'Labels'=>$strLabels);
		}
		//If already exists
		for($i=0;$i<count($arrExistingKeys);$i++){
			if($arrExistingKeys[$i]==$strData)
			{
				$vals = explode(',,,',$arrExistingValues[$i]);
				array_pop($vals);
				array_push($vals, $strValue );
				$arrExistingValues[$i] = implode(',,,',$vals);
				return array('Header'=>$strExistingKeys,'Value'=>implode('___',$arrExistingValues),'Labels'=>$strLabels);
			}
		}
		if(count($arrExistingLabels)>1){
			$strInput = '0';
			for($i=2;$i<count($arrExistingLabels);$i++){
				$strInput .= ',,,0';
			}
			$strInput .= ',,,'.$strValue;
		}else
			$strInput = $strValue;

		$strData = html_entity_decode($strData);
		array_push($arrExistingKeys,$strData);
		array_push($arrExistingValues,$strInput);

		$returnArray = array('Header'=>implode(',,,',$arrExistingKeys),'Value'=>implode('___',$arrExistingValues),'Labels'=>$strLabels);
		return	$returnArray;
	}
}


	function getLimit($xmlReport)
	{
		$arrCriteria = $xmlReport->criteria;
		$strUserCriteria = "";
		if($xmlReport->xmlRoot)
		{
			if($xmlReport->levelOfSelect>1)
				return "";
			//-- get user input settings
			$arrBindings = Array();
			$xmlUserInputs = $xmlReport->xmlRoot->get_elements_by_tagname("userinput");
			foreach($xmlUserInputs as $inputKey => $anInput)
			{
				//-- determine which ones the user has submitted
				$strBinding = getAttribute("binding", $anInput->attributes());
				if($strBinding=='numberofrecords'){
					$useBinding = $strBinding;
					if(isset($arrCriteria[$useBinding]) && $arrCriteria[$useBinding]!="") 
					{
						//-- numeric
						$strUserCriteria .= $arrCriteria[$useBinding];
						
					}
				}
			}
			$xmlUserInputs = $xmlReport->xmlRoot->get_elements_by_tagname("numberofrecords");
			foreach($xmlUserInputs as $inputKey => $anInput)
			{
				$hardCodedValue = $anInput->get_content();
				if($strUserCriteria != "")
				{
					if($hardCodedValue<$strUserCriteria)
						$strUserCriteria= $hardCodedValue;
				}else{
					$strUserCriteria= $hardCodedValue;
				}
			}

		}
		return $strUserCriteria;
	}
	function get_graph($xmlReport)
	{
		
//no data so return
		if($xmlReport->graphValue=='')
			return '';
		if($xmlReport->graphValue=='' && $xmlReport->graphHeader=='')
			return '';
		//setup variables
		if($xmlReport->graphLabels==''||strpos($xmlReport->graphLabels,',,,')===false){
			$arrGraphHeader = explode(',,,',$xmlReport->graphHeader);
			//-- check length of values to see width for text on graph, default to 300 if exceeding that to prevent small graphs
			foreach($arrGraphHeader as $header)
			{
				if((strlen($header)*7) > $xmlReport->intGraphValueStringMaxLength)
					$xmlReport->intGraphValueStringMaxLength = (strlen($header)*7);
			}
			if($xmlReport->intGraphValueStringMaxLength > 300)
				$xmlReport->intGraphValueStringMaxLength=300;
			
			//No Labels, so this is a bar graph
			$labels = html_entity_decode($xmlReport->graphHeader);
			if($xmlReport->graphLabels=='')
				$data = $xmlReport->graphValue;
			else{
				$data = explode('___',$xmlReport->graphValue);
				$data = implode(',,,',$data);
			}
			$copts='';
			$old_query='';
			$top_config = '<Config><Graphs><Graph name="TOP"><SizeX value="650"/><SizeY value="300"/><PlotX value="'.(600-$xmlReport->intGraphValueStringMaxLength).'"/><PlotY value="245"/><MarginLeft value="'.$xmlReport->intGraphValueStringMaxLength.'"/><MarginTop value="25"/><ChartOffsetX value=""/><ChartOffsetY value=""/><PieScalingFactor value=""/><Title value="'.$xmlReport->graphTitle.'"/><XTitle value=""/><YTitle value=""/><LabelAngle value="0"/><LineColor value="#DFDFDF"/><TextColor value=""/><VLineVisible value="1"/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value="1"/><Depth value="5"/><Perspective value=""/><Transparency value=""/><Border value="0"/><Legend value=""/><LegendX value="0"/><LegendY value="0"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value=""/><ChartType value="3D Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value="Default Palette"/><ElementColor value=""/><MultiDepth value=""/><SortMethod Value="ValueDesc"/><ExplodePie value=""/><ExplodeSector value=""/><ExplodeDistance value=""/><StartAngle value=""/></Graph></Graphs></Config>';
		}else{
			//Labels are set, so this is a multi line graph
			$labels = html_entity_decode($xmlReport->graphHeader);
			$data = $xmlReport->graphValue;
			$copts='';
			$options = $xmlReport->graphLabels;
			$old_query='';
			$top_config = '<Config>		<Graphs>
			<Graph name="TOP">
				<SizeX value="600"/>
				<SizeY value="480"/>
				<PlotX value="480"/>
				<PlotY value="245"/>
				<MarginLeft value="90"/>
				<MarginTop value="25"/>
				<ChartOffsetX value=""/>
				<ChartOffsetY value=""/>
				<PieScalingFactor value=""/>
				<Title value="'.$xmlReport->graphTitle.'"/>
				<XTitle value=""/>
				<YTitle value=""/>
				<LabelAngle value="60"/>
				<LineColor value="#DFDFDF"/>
				<TextColor value=""/>
				<VLineVisible value="1"/>
				<HLineVisible value="1"/>
				<EdgeVisible value="1"/>
				<SwapXY value="0"/>
				<Depth value="5"/>
				<Perspective value=""/>
				<Transparency value="1"/>
				<Border value="0"/>
				<Legend value=""/>
				<LegendX value="1"/>
				<LegendY value="1"/>
				<DiscAbove value=""/>
				<DiscBelow value=""/>
				<Transpose value=""/>
				<ChartType value="Multi Bar"/>
				<BackgroundType value="Plain Colour"/>
				<BackgroundColor value="#FFFFFF"/>
				<BackgroundGradient value=""/>
				<FillType value="Default Palette"/>
				<ElementColor value=""/>
				<MultiDepth value=""/>
				<ExplodePie value=""/>
				<ExplodeSector value=""/>
				<ExplodeDistance value=""/>
				<StartAngle value=""/>
			</Graph>
		</Graphs>
		</Config>';
		}
		$start_time = time();

		//create query
		$conf_type = $GLOBALS['conf_type'];
		$conf_user = swcuid();
		$conf_pass = swcpwd();
		$conf_srvr = $GLOBALS['conf_srvr'];
		$conf_dbselect = $GLOBALS['conf_dbselect']	;			// Only for MySQL
		$conf_port = $GLOBALS['conf_port'];							// Only for PostgreSQL
		$conf_underlying = $GLOBALS['conf_underlying'];							// Only for ODBC ('mssql' changes how the class finds the last insert ID)

		$conf_table = $GLOBALS['conf_table'];			// Table where report configs will be
		$conf_tmpdb = $GLOBALS['conf_tmpdb'];				// Database for temporary args, can be same db (REQUIRED)
		$conf_tmptable = $GLOBALS['conf_tmptable'];//"tmp_graph_args";			// Table for temporary args

		
		$_SESSION['graph_ckeys'] = str_replace("'","''",$labels);
		$_SESSION['graph_cvals'] = $data;
		$_SESSION['graph_copts'] = $options;
		$_SESSION['graph_xmlconf'] = $top_config;

		# Make the chart according to the border and chart editable settings and output it
		$html_chart = '<img src="../common/php/report.graph.php" border="0">';
		if (strpos($top_config,'<Border value="1"/>')) $html_chart = '<table border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#000000" colspan="3"></td></tr><tr><td bgcolor="#000000"></td><td>'.$html_chart.'</td><td bgcolor="#000000"></td></tr><tr><td bgcolor="#000000" colspan="3"></td></tr></table>';
		$conf_conn = null;
		$html_chart .= "<br><br>";
		return $html_chart;

	}

	function get_columns($xmlReport)
	{
		$xmlColumns = $xmlReport->xmlRoot->get_elements_by_tagname("column");
		$arrColumns = array();
		foreach($xmlColumns as $colKey => $aCol)
		{
			//-- create select cols
			$strLevel = getAttribute("level", $aCol->attributes());
			if($strLevel==$xmlReport->levelOfSelect){
				$arrColumns[$colKey] = $aCol;
			}

		}

		$xmlColumns = $xmlReport->xmlRoot->get_elements_by_tagname("aggregate");
		$arrAggregate = array();
		foreach($xmlColumns as $colKey => $aCol)
		{
			//-- create select cols
			$strLevel = getAttribute("level", $aCol->attributes());
			if($strLevel==$xmlReport->levelOfSelect){
				$arrAggregate[$colKey] = $aCol;
			}

		}

		$arrSummaryCols  = array_merge($arrColumns,$arrAggregate);

		$xmlColumns = $xmlReport->xmlRoot->get_elements_by_tagname("freetext");
		$arrFreeText = array();
		foreach($xmlColumns as $colKey => $aCol)
		{
			//-- create select cols
			$strLevel = getAttribute("level", $aCol->attributes());
			if($strLevel==$xmlReport->levelOfSelect){
				$arrFreeText[$colKey] = $aCol;
			}

		}

		$arrSummaryCols  = array_merge($arrSummaryCols,$arrFreeText);
		return $arrSummaryCols;
	}

	function get_inputs($xmlReport)
	{
		$xmlUserInputs = $xmlReport->xmlRoot->get_elements_by_tagname("userinput");
		foreach($xmlUserInputs as $inputKey => $anInput)
		{
			if($anInput->has_attributes())
			{
				//-- determine type and generic attributes
				$strType = getAttribute("type", $anInput->attributes());

				$strBinding = getAttribute("binding", $anInput->attributes());
				$strBinding = str_replace(".","..",$strBinding);

				$strOp = getAttribute("op", $anInput->attributes());
				$xmlPrompt = $anInput->get_elements_by_tagname("prompt");
				$strPrompt = parse_context_vars($xmlPrompt[0]->get_content());

				switch($strType)
				{
					case "inputtext":
						$strInputHTML .= create_report_inputtext($strBinding,$strOp,$strPrompt,$anInput);
						break;
					case "daterange":
						$strInputHTML .= create_report_daterange($strBinding,$strOp,$strPrompt,$anInput);
						break;
					case "date":
						$strInputHTML .= create_report_date($strBinding,$strOp,$strPrompt,$anInput);
						break;
					case "profilecode":
						$strInputHTML .= create_report_profilecode($strBinding,$strOp,$strPrompt,$anInput);
						break;
					case "dbpicklist":
						$strInputHTML .= create_report_dbpicklist($strBinding,$strOp,$strPrompt,$anInput);
						break;
					case "strpicklist":
						$strInputHTML .= create_report_strpicklist($strBinding,$strOp,$strPrompt,$anInput);
						break;
					case "numpicklist":
						$strInputHTML .= create_report_numpicklist($strBinding,$strOp,$strPrompt,$anInput);
						break;
					default:
						$strInputHTML .= "<p>Ivalid input type specified. Please contact Supportworks Administrator.</p>";
						break;
				}
			}
		}
		return $strInputHTML;
	}

	function get_cast($strColumn,$strCast,$strPrecision,$strDBType)
	{
		if($strDBType=='oracle')
		{
			if($strCast=='float')
			{
				return "cast(".$strColumn." as NUMBER(15,".$strPrecision."))";
			}

		}elseif($strDBType=='mssql')
		{
			if($strCast=='float')
			{
				return "cast(".$strColumn." as Decimal(15,".$strPrecision."))";
			}

		}else
		{
			if($strCast=='float')
			{
				return "cast(".$strColumn." as UNSIGNED)+0.00";
			}

		}
	}
?>
