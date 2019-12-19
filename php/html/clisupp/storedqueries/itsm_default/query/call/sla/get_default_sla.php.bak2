<?php
	/*
		SteveG 20150730
		This SQ takes the following inputs, then calculates and outputs the required SLA and Priority (if applicable):
		callclass - Call Class: STRING: MANDATORY
		workflowid - BPM Workflow Key: STRING: OPTIONAL
		profileid - Profile Code: STRING: OPTIONAL
		custid - Customer Key: STRING: OPTIONAL
		orgid - Organisation Key: STRING: OPTIONAL
		siteid - Site Key: STRING: OPTIONAL
		deptid - Department Key: STRING: OPTIONAL
		chargeid - Charge Centre Key: STRING: OPTIONAL
		ciid - Config Item Key: Comma-Separated STRING of CI PKs: OPTIONAL
		servid - Service Key: Comma-Separated STRING of Service PKs: OPTIONAL
	*/

	if(!isset($_POST['callclass']) || $_POST['callclass'] == "") throwSuccess();

	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strCallClass = $_POST['callclass'];

	$boolSLAFound = false;
	$intUseSLAID = 0;
	$strUseSLAName = "";
	$strUsePriority = "";
	
	//Get the application specific rules for the passed through call class
	$strSQL = "SELECT sla_rule, longest_sla FROM itsm_sla_rules WHERE callclass='".$strCallClass."'";
	$strSQL .= " AND appcode = '".$_core['_sessioninfo']->dataset . "'";
	$strSQL .= " AND sla_rule != ''";
	$strSQL .= " ORDER BY seq ASC";

	$aRS = get_recordset($strSQL, "swdata");
	while ($aRS->Fetch() && !$boolSLAFound)
	{
		$boolVarExists = false;
 		$strRule = get_field($aRS,"sla_rule");
		$strSLAType = get_field($aRS,"longest_sla");
		switch($strRule)
		{
			case "BUSP":
				//Get BPM Workflow specific SLA
				if(isset($_POST['workflowid']) && $_POST['workflowid'] != "")
				{
					$strMatrixSQL = "SELECT fk_default_sla AS fk_priority, fk_default_sla_new AS fk_slad, fk_default_sla_name AS fk_slad_name";
					$strMatrixSQL .= " FROM bpm_workflow";
					$strMatrixSQL .= " WHERE pk_workflow_id = '".$_POST['workflowid']."'";
					$strMatrixSQL .= " AND fk_default_sla_new > 0";
					$strMatrixSQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
					$aSLA = get_recordset($strMatrixSQL);
					if ($aSLA->Fetch())	$boolSLAFound = true;
				}
				break;
				
			case "PRPR":
				//Get Problem Profile specific SLA
				if(isset($_POST['profileid']) && $_POST['profileid'] != "")
				{
					$strMatrixSQL = "SELECT itsm_sla AS fk_slad, sla AS fk_priority, slad_id AS fk_slad_name";
					$strMatrixSQL .= " FROM pcinfo LEFT JOIN itsmsp_slad ON pcinfo.itsm_sla = itsmsp_slad.pk_slad_id";
					$strMatrixSQL .= " WHERE code = '".$_POST['profileid']."'";
					$strMatrixSQL .= " AND itsm_sla > 0";
					$aSLA = get_recordset($strMatrixSQL);
					if ($aSLA->Fetch())	$boolSLAFound = true;
				}
				break;
				
			default:
				//This will capture Customer, Organisation, Site, Department, Charge Centre, CI, Service & Subscription			
				
				//Set the correct Foreign key value for the SLA Rule SQL dependant on current rule
				if($strRule == "CUST" && isset($_POST['custid']) && $_POST['custid'] != "")
				{
					$relVar = $_POST['custid'];
					$boolVarExists = true;
				}
				if($strRule == "ORGN" && isset($_POST['orgid']) && $_POST['orgid'] != "")
				{
					$relVar = $_POST['orgid'];
					$boolVarExists = true;
				}						
				if($strRule == "SITE" && isset($_POST['siteid']) && $_POST['siteid'] != "")
				{
					$relVar = $_POST['siteid'];
					$boolVarExists = true;
				}	
				if($strRule == "DEPT" && isset($_POST['deptid']) && $_POST['deptid'] != "")
				{
					$relVar = $_POST['deptid'];
					$boolVarExists = true;
				}	
				if($strRule == "CHCT" && isset($_POST['chargeid']) && $_POST['chargeid'] != "")
				{
					$relVar = $_POST['chargeid'];
					$boolVarExists = true;
				}	
				if($strRule == "CITM" && isset($_POST['ciid']) && $_POST['ciid'] != "")
				{
					if(strpos($_POST['ciid'], ",") > 0) 
					{	
						//Multiple CIs - work out which has shortest/longest SLA
						$arrCIPriority = array();
						$strPrioritySQL = "SELECT fk_rel_id, fk_priority FROM itsm_sla_class_matrix";
						$strPrioritySQL .= " WHERE callclass = '".$strCallClass."'";
						$strPrioritySQL .= " AND reltype = '".$strRule."'";
						$strPrioritySQL .= " AND fk_priority != ''";
						$strPrioritySQL .= " AND fk_priority IS NOT NULL";
						$strPrioritySQL .= " AND fk_rel_id IN (".$_POST['ciid'].")";
						$strPrioritySQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
						$strPriority = "";

						$aPriority = get_recordset($strPrioritySQL);
						while ($aPriority->Fetch())
						{
							$strOutPriority = get_field($aPriority,"fk_priority");
							$strOutCI = get_field($aPriority,"fk_rel_id");
							if($strPriority == "") $strPriority = "'".$strOutPriority."'";
							else $strPriority .= ", '".$strOutPriority."'";
							
							$arrCIPriority[$strOutPriority] = $strOutCI;
						}
						if($strPriority !="")
						{
							$currFixTime = -1;
							$currRespTime = -1;
							$useSLA = "";
							$strName = "";
							$intFixTime = "";
							$intRespTime = "";
							$strPTimesSQL = "select name , fixtime , resptime from system_sla where name in ($strPriority)";

							$aPTimes = get_recordset($strPTimesSQL, "sw_systemdb");
							
							while ($aPTimes->Fetch())
							{
								$strName = get_field($aPTimes,"name");
								$intFixTime = get_field($aPTimes,"fixtime");
								$intRespTime = get_field($aPTimes,"resptime");
								
								if($currFixTime>-1 && $strSLAType == "Longest")
								{
									//-- have a possible longer sla
									if($currFixTime <= $intFixTime)
									{
										//-- fix time for both slas is the same so check response time
										if ($currFixTime == $intFixTime)
										{
											if ($currRespTime < $intRespTime)
											{
												//-- found new longest sla
												$currFixTime = $intFixTime;
												$currRespTime = $intRespTime;
												$useSLA = $strName;
											}
										}
										else
										{
											//-- new longest sla
											$currFixTime = $intFixTime;
											$currRespTime = $intRespTime;
											$useSLA = $strName;
										}
									}
								}
								else if($currFixTime>-1 && $strSLAType == "Shortest")
								{
									//-- have a possible longer sla
									if($currFixTime >= $intFixTime)
									{
										//-- fix time for both slas is the same so check response time
										if ($currFixTime == $intFixTime)
										{
											if ($currRespTime > $intRespTime)
											{
												//-- found new longest sla
												$currFixTime = $intFixTime;
												$currRespTime = $intRespTime;
												$useSLA = $strName;
											}
										}
										else
										{
											//-- new longest sla
											$currFixTime = $intFixTime;
											$currRespTime = $intRespTime;
											$useSLA = $strName;
										}
									}
								}								
								else
								{
									//-- first loop
									$currFixTime = $intFixTime;
									$currRespTime = $intRespTime;
									$useSLA = $strName;
								}
							}
							if($useSLA != "")
							{
								$relVar = $arrCIPriority[$useSLA];
								$boolVarExists = true;
							}
						}
					}
					else
					{
						//Single CI - process as normal
						$relVar = $_POST['ciid'];
						$boolVarExists = true;
					}
				}	
				if($strRule == "SERV" && isset($_POST['servid']) && $_POST['servid'] != "")
				{
					if(strpos($_POST['servid'], ",") > 0) 
					{	
						//Multiple Services - work out which has shortest/longest SLA
						$arrServPriority = array();
						$strPrioritySQL = "SELECT fk_rel_id, fk_priority FROM itsm_sla_class_matrix";
						$strPrioritySQL .= " WHERE callclass = '".$strCallClass."'";
						$strPrioritySQL .= " AND reltype = '".$strRule."'";
						$strPrioritySQL .= " AND fk_priority != ''";
						$strPrioritySQL .= " AND fk_priority IS NOT NULL";
						$strPrioritySQL .= " AND fk_rel_id IN (".$_POST['servid'].")";
						$strPrioritySQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
						$strPriority = "";

						$aPriority = get_recordset($strPrioritySQL);
						while ($aPriority->Fetch())
						{
							$strOutPriority = get_field($aPriority,"fk_priority");
							$strOutCI = get_field($aPriority,"fk_rel_id");
							if($strPriority == "") $strPriority = "'".$strOutPriority."'";
							else $strPriority .= ", '".$strOutPriority."'";
							
							$arrServPriority[$strOutPriority] = $strOutCI;
						}
						if($strPriority !="")
						{
							$currFixTime = -1;
							$currRespTime = -1;
							$useSLA = "";
							$strName = "";
							$intFixTime = "";
							$intRespTime = "";
							$strPTimesSQL = "select name , fixtime , resptime from system_sla where name in ($strPriority)";

							$aPTimes = get_recordset($strPTimesSQL, "sw_systemdb");
							
							while ($aPTimes->Fetch())
							{
								$strName = get_field($aPTimes,"name");
								$intFixTime = get_field($aPTimes,"fixtime");
								$intRespTime = get_field($aPTimes,"resptime");
								
								if($currFixTime>-1 && $strSLAType == "Longest")
								{
									//-- have a possible longer sla
									if($currFixTime <= $intFixTime)
									{
										//-- fix time for both slas is the same so check response time
										if ($currFixTime == $intFixTime)
										{
											if ($currRespTime < $intRespTime)
											{
												//-- found new longest sla
												$currFixTime = $intFixTime;
												$currRespTime = $intRespTime;
												$useSLA = $strName;
											}
										}
										else
										{
											//-- new longest sla
											$currFixTime = $intFixTime;
											$currRespTime = $intRespTime;
											$useSLA = $strName;
										}
									}
								}
								else if($currFixTime>-1 && $strSLAType == "Shortest")
								{
									//-- have a possible longer sla
									if($currFixTime >= $intFixTime)
									{
										//-- fix time for both slas is the same so check response time
										if ($currFixTime == $intFixTime)
										{
											if ($currRespTime > $intRespTime)
											{
												//-- found new longest sla
												$currFixTime = $intFixTime;
												$currRespTime = $intRespTime;
												$useSLA = $strName;
											}
										}
										else
										{
											//-- new longest sla
											$currFixTime = $intFixTime;
											$currRespTime = $intRespTime;
											$useSLA = $strName;
										}
									}
								}								
								else
								{
									//-- first loop
									$currFixTime = $intFixTime;
									$currRespTime = $intRespTime;
									$useSLA = $strName;
								}
							}
							if($useSLA != "")
							{
								$relVar = $arrServPriority[$useSLA];
								$boolVarExists = true;
							}
						}
					}
					else
					{
						$relVar = $_POST['servid'];
						$boolVarExists = true;
					}
				}	
				if($strRule == "SUBS" && isset($_POST['servid']) && $_POST['servid'] != "")
				{
					//Get Customer Subscription
					if(isset($_POST['custid']) && $_POST['custid'] != "")
					{
						$strSubsSQL = "	SELECT pk_id 
										FROM sc_subscription 
										WHERE fk_service = ".$_POST['servid']."
										AND fk_me_table = 'userdb' 
										AND fk_me_key = '".$_POST['custid']."' 
										AND rel_type='SUBSCRIPTION'";
						$aSub = get_recordset($strSubsSQL);
						if ($aSub->Fetch())
						{
							//We have a Subscription ! Check default sla exists against found CUSTOMER subscription
							$relVar = get_field($aSub,"pk_id");
							$strMatrixSQL = "SELECT fk_slad, fk_slad_name, fk_priority FROM itsm_sla_class_matrix";
							$strMatrixSQL .= " WHERE callclass = '".$strCallClass."'";
							$strMatrixSQL .= " AND reltype = '".$strRule."'";
							$strMatrixSQL .= " AND fk_slad > 0";
							$strMatrixSQL .= " AND fk_rel_id= '".$relVar."'";
							$strMatrixSQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
							$aSubSLA = get_recordset($strMatrixSQL);
							if ($aSubSLA->Fetch())	$boolSLAFound = true;							
						}
					}

					//Get Department Subscription
					if(!$boolSLAFound && isset($_POST['deptid']) && $_POST['deptid'] != "")
					{
						$strSubsSQL = "	SELECT pk_id 
										FROM sc_subscription 
										WHERE fk_service = ".$_POST['servid']."
										AND fk_me_table = 'department' 
										AND fk_me_key = '".$_POST['deptid']."' 
										AND rel_type='SUBSCRIPTION'";
						$aSub = get_recordset($strSubsSQL);
						if ($aSub->Fetch())
						{
							//We have a Subscription! Check default sla exists against found DEPARTMENT subscription
							$relVar = get_field($aSub,"pk_id");
							$strMatrixSQL = "SELECT fk_slad, fk_slad_name, fk_priority FROM itsm_sla_class_matrix";
							$strMatrixSQL .= " WHERE callclass = '".$strCallClass."'";
							$strMatrixSQL .= " AND reltype = '".$strRule."'";
							$strMatrixSQL .= " AND fk_slad > 0";
							$strMatrixSQL .= " AND fk_rel_id= '".$relVar."'";
							$strMatrixSQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
							$aSubSLA = get_recordset($strMatrixSQL);
							if ($aSubSLA->Fetch())	$boolSLAFound = true;	
						}
					}
					//Get Organisation Subscription
					if(!$boolSLAFound && isset($_POST['orgid']) && $_POST['orgid'] != "")
					{
						$strSubsSQL = "	SELECT pk_id 
										FROM sc_subscription 
										WHERE fk_service = ".$_POST['servid']."
										AND fk_me_table = 'company' 
										AND fk_me_key = '".$_POST['orgid']."' 
										AND rel_type='SUBSCRIPTION'";
						$aSub = get_recordset($strSubsSQL);
						if ($aSub->Fetch())
						{
							//We have a Subscription! Check default sla exists against found ORGANISATION subscription
							$relVar = get_field($aSub,"pk_id");
							$strMatrixSQL = "SELECT fk_slad, fk_slad_name, fk_priority FROM itsm_sla_class_matrix";
							$strMatrixSQL .= " WHERE callclass = '".$strCallClass."'";
							$strMatrixSQL .= " AND reltype = '".$strRule."'";
							$strMatrixSQL .= " AND fk_slad > 0";
							$strMatrixSQL .= " AND fk_rel_id= '".$relVar."'";
							$strMatrixSQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
							$aSubSLA = get_recordset($strMatrixSQL);
							if ($aSubSLA->Fetch())	$boolSLAFound = true;	
						}
					}						
				}					
				if($boolVarExists)
				{
					$strMatrixSQL = "SELECT fk_slad, fk_slad_name, fk_priority FROM itsm_sla_class_matrix";
					$strMatrixSQL .= " WHERE callclass = '".$strCallClass."'";
					$strMatrixSQL .= " AND reltype = '".$strRule."'";
					$strMatrixSQL .= " AND fk_slad > 0";
					$strMatrixSQL .= " AND fk_rel_id= '".$relVar."'";
					$strMatrixSQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
					$aSLA = get_recordset($strMatrixSQL);
					if ($aSLA->Fetch())	$boolSLAFound = true;
				}
				break;
		}
	}

	if(!$boolSLAFound)
	{
		//No SLA found against rules, so get default SLA for Call Class
		$strMatrixSQL = "SELECT fk_slad, fk_slad_name, fk_priority FROM itsm_sla_default";
		$strMatrixSQL .= " WHERE callclass = '".$strCallClass."'";
		$strMatrixSQL .= " AND fk_slad > 0";
		$strMatrixSQL .= " AND appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
		$aSLA = get_recordset($strMatrixSQL);
		if ($aSLA->Fetch())	$boolSLAFound = true;
	}
	
	if($boolSLAFound)
	{
		//We have an SLA to pass back! Run the SQL to throw details back to Global.js
		$sqlDatabase = "swdata";
		$sqlCommand = $strMatrixSQL;
	}
	else
	{
		//No SLA found from rules and defaults - don't send back an SLA
		throwSuccess();
		//echo generateCustomErrorString("-666",$strMatrixSQL);
        //exit(0);
	}
?>