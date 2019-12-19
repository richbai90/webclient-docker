<?php
	// -- Hornbill - CMDB Determine Import Action
	// -- FILE: cmdb_dia.functions.php
	
	function get_time()
	{
		$time = explode(' ', microtime());
		$time = $time[1] + $time[0];
		return $time;
	}
	
	// -- PrepareForSql and Escape slashes
	function pfs_escape_slashes($var)
	{
		$var = str_replace("'","''",$var);
		$var = str_replace("\\","\\\\",$var);
		return $var;
	}
	
	// -- Log info/errors into a log file
	function log_actions($message, $type = "INFO")
	{
		global $SW_InstallPath;
		$msg = date("Y-m-d H:i:s")." [CMDB_DIA]:[".$type."]: ".trim($message).chr(13).chr(10);
		$log = fopen($SW_InstallPath."\log\cmdb_dia.log", "a+");
		echo nl2br($msg);
		fwrite($log,$msg);
		fclose($log);
	}
	
	// -- Submit a SQL query using existing connection
	function submitsqlODBC($strSQL)
	{
		global $strVerbose, $conn3;	
		$oResult = $conn3->query($strSQL);
		if($oResult)
		{
			if($strVerbose) log_actions("Executed SQL Query: " . $strSQL);
			return true;
		}
		else
		{
			if($strVerbose) log_actions("Failed to execute SQL Query: " . $strSQL,"ERROR");
			return false;
		}
	}
	
	// -- get row value
	function grv($aRow,$strColName)
	{
	   if(isset($aRow->$strColName))
	   {
		  return $aRow->$strColName;
	   }
	   else
	   {
		  $uColName = strToUpper($strColName);
		  return $aRow->$uColName;
	   }
	}
	
	//-- START PROCESS - Update process record in cmdb_stage_audit table
	function start_process($strProcessID)
	{
		log_action("Process Start - Updating [cmdb_audit_stage] table");
		
		$strTable = "CMDB_STAGE_AUDIT";
		// -- Update process in cmdb_stage_audit table
		$strSQL = "update $strTable set EXE_STARTX = '".time()."' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Start Process - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)","ERROR");
			log_actions("CMDB Determine Import Action", "END");
			exit();
		}
		// -- Update process status in cmdb_stage_audit table
		$strSQL = "update $strTable set STATUS = 'Processing' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Start Process - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)","ERROR");
			log_actions("CMDB Determine Import Action", "END");
			exit();
		}
	}
	
	// -- System field check
	function isSystemField($colName)
	{
		switch($colName)
		{
			case "baselineid":
			case "cmdb_status":
			case "flg_inherit_reqtypes":
			case "import_action":
			case "import_analystid":
			case "import_datex":
			case "import_newtype":
			case "import_status":	
			case "ck_config_item":
			case "fk_status_level":		
				return true;
		}
		return false;
	}
	
	// -- UPDATE PROCESS - Update process progress (percentage)
	function update_process($strProcessID,$strPerc)
	{
		//-- Update Percentage
		$strSQL = "update CMDB_STAGE_AUDIT set PER_COMPLETE = '".$strPerc."'where pk_id = '".$strProcessID."'";
		if(submitsqlODBC($strSQL))
		{
			log_actions("Progress Update - Updated [CMDB_STAGE_AUDIT]");
		}else
		{
			log_actions("Progress Update - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)","ERROR");
		}
	}
	
	// -- END PROCESS - Update cmdb_stage_audit table when ending process
	function end_process($strProcessID,$intProcessCount)
	{
		log_action("Process End - Updating [cmdb_audit_stage] table");
		
		$time = time();
		$strSQL = "update CMDB_STAGE_AUDIT set EXE_ENDX = '".$time."' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("End Process - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)");
		}
		
		// -- Update process vount
		$strSQL = "update CMDB_STAGE_AUDIT set RECORD_PROC = '".$intProcessCount."' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Process Count Update - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)", "ERROR");
		}
		
		//-- Set Status to Complete
		$strSQL = "update CMDB_STAGE_AUDIT set STATUS = 'Complete' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Status Update - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)", "ERROR");
		}
		//-- Set Result to Sucess
		$strSQL = "update CMDB_STAGE_AUDIT set RESULT = 'Success' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Status Update - Failed to update[CMDB_STAGE_AUDIT] (SQL: $strSQL)", "ERROR");
		}
	}
	
	//-- FAIL PROCESS
	//-- Used if script needs to exit then attempt to update Audit table first then exit script
	function fail_process($strProcessID,$strError)
	{	
		log_action("Process Failed - Updating [cmdb_audit_stage] table");
		
		$time = time();
		//--Update Audit Table Time
		$strSQL = "update CMDB_STAGE_AUDIT set EXE_ENDX = '".$time."' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Failed Process - Failed to update [CMDB_STAGE_AUDIT] (SQL: $strSQL)");
		}
		$strSQL = "update CMDB_STAGE_AUDIT set STATUS = 'Error' where pk_id = '".$strProcessID."'";
		if(submitsqlODBC($strSQL))
		{
			log_actions("Unable to Update Audit Table");
		}
		//-- Update Result
		$strSQL = "update CMDB_STAGE_AUDIT set RESULT = '".pfs_escape_slashes($strError)."' where pk_id = '".$strProcessID."'";
		if(!submitsqlODBC($strSQL))
		{
			log_actions("Unable to Update Audit Table ".$strError);
			log_actions("CMDB Determine Import Action", "END");
			exit();
		}
	}
	
	class xml2Array {
    
    var $arrOutput = array();
    var $resParser;
    var $strXmlData;
    
		function parse($strInputXML) {
		
			$this->resParser = xml_parser_create ();
			xml_set_object($this->resParser,$this);
			xml_set_element_handler($this->resParser, "tagOpen", "tagClosed");
			
			xml_set_character_data_handler($this->resParser, "tagData");
		
			$this->strXmlData = xml_parse($this->resParser,$strInputXML );
			if(!$this->strXmlData) {
			   die(sprintf("XML error: %s at line %d",
			xml_error_string(xml_get_error_code($this->resParser)),
			xml_get_current_line_number($this->resParser)));
			}
							
			xml_parser_free($this->resParser);
			
			return $this->arrOutput;
		}
		function tagOpen($parser, $name, $attrs) {
		   $tag=array("name"=>$name,"attrs"=>$attrs); 
		   array_push($this->arrOutput,$tag);
		}
		
		function tagData($parser, $tagData) {
			if(trim($tagData)) {
				if(isset($this->arrOutput[count($this->arrOutput)-1]['tagData'])) {
					$this->arrOutput[count($this->arrOutput)-1]['tagData'] .= $tagData;
				} 
				else {
					$this->arrOutput[count($this->arrOutput)-1]['tagData'] = $tagData;
				}
			}
		}
		
		function tagClosed($parser, $name) {
		   $this->arrOutput[count($this->arrOutput)-2]['children'][] = $this->arrOutput[count($this->arrOutput)-1];
		   array_pop($this->arrOutput);
		}
	}
?>