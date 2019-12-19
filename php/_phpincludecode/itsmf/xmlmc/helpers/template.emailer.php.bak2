<?php
	//-- nwj - 07.11.2007
	//-- Function to enable the send of emails from the hsl portals (selfservice / analyst portal)
	
	//--
	//-- send email to an analyst
	//-- given aid will get contact info from swanalysts
	function send_analyst_email($in_aid, $in_from, $in_fromaddress,$in_mailbox,$in_template,$in_callref = 0 ,$in_hdconclass = null)
	{
		//--
		//-- connect to supportwork cache database and get passed in analysts contact info
		@include_once('itsmf/xmlmc/classdatabaseaccess.php');
		$swcacheCon = new CSwDbConnection;
		if($swcacheCon->SwCacheConnect())
		{
			//-- select details, with option to create recordset and then close connection
			$strSelect = "select name, contacte from swanalysts where analystid = '".$in_aid."'";
			$rsResult = $swcacheCon->Query($strSelect,true);
			$swcacheCon->Close();
			if(($rsResult!=false)&&(!$rsResult->eof))
			{
				//-- 
				$strTo = $rsResult->f("name");
				$strToAddress = $rsResult->f("contacte");
				if($strToAddress!="")
				{
					$mailHDconn= $in_hdconclass->open_hd_connection(5004);
					return send_portalemail($strTo,$strToAddress, $in_from, $in_fromaddress, $in_mailbox,$in_template,$in_callref,$mailHDconn);
				}
			}		
		}
		return false;
	}

	//-- send email to a customer
	//-- given customer id will get email from userdb
	function send_customer_email($in_cid, $in_from, $in_fromaddress,$in_mailbox,$in_template,$in_callref = 0 ,$in_hdconclass = null)
	{
		//-- connect to supportwors data and get customers name a email address
		@include_once('itsmf/xmlmc/classdatabaseaccess.php');
		$swdataCon = new CSwDbConnection;
		if($swdataCon->SwDataConnect())
		{
			$strSelect = "select firstname,surname,email from userdb where keysearch = '".$in_cid."'";
			$rsResult = $swdataCon->Query($strSelect,true);
			$swdataCon->Close();
			if(($rsResult!=false)&&(!$rsResult->eof))
			{
				$strTo = $rsResult->f("firstname") . " "  . $rsResult->f("surname");
				$strToAddress = $rsResult->f("email");
				if($strToAddress!="")
				{
					$mailHDconn= $in_hdconclass->open_hd_connection(5004);
					return send_portalemail($strTo,$strToAddress, $in_from, $in_fromaddress , $in_mailbox,$in_template,$in_callref,$mailHDconn);
				}
			}
		}
		return false;
	}

	//--
	//-- actually send an email
	//-- expects to info , from info, mailbox and email template name.
	//-- if callref is supplied will perform remote query for call and parse email template subject and body.
	function send_portalemail($in_toname, $in_toaddress, $in_from, $in_fromaddress, $in_mailbox,$in_template,$in_callref = 0 , $mailHDconn = null)
	{
		//-- report errors only
		error_reporting(E_ERROR);

		//-- subject & body
		$subj = "Email generated from template.email.php";
		$bod = "This email has been sent from the analystportal template.email.php. It should use an email template which has not been supplied. Please contact your supportwors administrator";		

		//-- if we have a template go and process it and return subject and body
		if($in_template!="")
		{
			$array_info = loademailtemplate("_".$in_mailbox,$in_template,$in_callref);
			$subj = $array_info['subject'];
			$bod = $array_info['body'];
		}

		//-- include email class
		@include_once('itsmf/xmlmc/classhelpdeskmail.php');
		$swmail = new classHelpdeskMail;

		//-- set from 
		$swmail->AddRecipient($in_from,  $in_fromaddress, "from", "inet");	

		//-- set to
		$swmail->AddRecipient($in_toname,$in_toaddress, "to", "inet");
		if(!$swmail->SendEmail($mailHDconn, $subj, $bod, "_".$in_mailbox))
		{
			return false;
		}
		return true;
	}

	//--
	//-- OTHER HELPERS
	//--
	//-- function that loads a template from the database and if given a callref will parse out vars
	function loademailtemplate($mailbox,$templatename,$forcallref = 0)
	{
		//-- get remote call data that we can parse thru template
		$arrayRemoteCallData = Array();
		if($forcallref>0)
		{
			$arrayRemoteCallData = loadremotecall($forcallref);
		}

		$array_info = Array();
		$array_info['subject'] = "Email Error : Template $templatename could not be loaded";
		$array_info['body'] = "please contact your supportworks administrator. The template could not be loaded for the mailbox $mailbox";

		//-- get the email template based on mailbox and templatename
		//@include_once('itsmf/xmlmc/classdatabaseaccess.php');
		//$swcacheCon = new CSwLocalDbConnection;
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam('mailbox',$mailbox);
		$xmlmc->SetParam('templateName',$templatename);
		$xmlmc->SetParam('templateType',4);
		if($xmlmc->Invoke("mail","getMailTemplate"))
		{
			//has invoked succesfully, need to check if there is a record was returned
			$arrParams = $xmlmc->xmlDom->get_elements_by_tagname("params");
			if($arrParams[0])
			{
				$array_info['subject'] = parseEmailTemplateVariables($xmlmc->GetParam('subject'),$arrayRemoteCallData);
				$array_info['body'] = parseEmailTemplateVariables($xmlmc->GetParam('body'),$arrayRemoteCallData);
			}
		}

		return $array_info;
	}


	//-- function that loads remote call using callref and returns array holding bindings
	//-- this is used to parse out email templates
	function loadremotecall($in_callref)
	{
		@include_once('itsmf/xmlmc/classdatabaseaccess.php');

		$array_related_data = Array();
		$array_call_bindings = Array();
		$array_remotecall_bindings = Array();

		$swdataCon = new CSwDbConnection;
		$swcacheCon = new CSwLocalDbConnection;
		if($swcacheCon->SwCacheConnect())
		{
			$swdataCon->SwDataConnect(); //-- will be used to get customer info

			//-- select details, with option to create recordset and then close connection
			$strSelect = "select * from opencall where callref = ".$in_callref;
			$rsOC = $swcacheCon->CreateRecordSet($swcacheCon->Query($strSelect));
			if($rsOC!=false)
			{
				
				//-- get remote call datamerge info and store in an array
				$strSelect = "select * from system_datamergemaps where name = 'Call'";
				$rsRC =  $swcacheCon->CreateRecordSet($swcacheCon->Query($strSelect));
				if($rsRC!=false)
				{
					//-- loop thru and store opencall values first
					while(!$rsRC->eof)
					{
						$sourceTableName = $rsRC->f('sourcetable');
						$sourceFieldName = $rsRC->f('valueexpression');
						$sourceDatabinding = $sourceTableName . "." . $sourceFieldName;

						if($sourceTableName=="opencall")
						{
							$varCallValue = $rsOC->f($sourceFieldName);
							$varCallValue = swdti_formatvalue($sourceDatabinding , $varCallValue);

							$array_call_bindings[$sourceDatabinding] = $rsOC->f($sourceFieldName);
							$array_remotecall_bindings[$rsRC->f('fieldname')] = $varCallValue;
						}
						$rsRC->movenext();
					}

					//-- loop thru again and get related table data
					$rsRC->movefirst();
					while(!$rsRC->eof)
					{
						$sourceDBName = $rsRC->f('dbsource');
						$sourceTableName = $rsRC->f('sourcetable');
						$sourceFieldName = $rsRC->f('valueexpression');
						$sourceDatabinding = $sourceTableName . "." . $sourceFieldName;

						if(($sourceTableName!="")&&($sourceTableName!="opencall"))
						{
							//-- we need to get related data
							$strCriteria = $rsRC->f('sourcecriteria');
							$strCriteria = str_replace("&[", "$" , $strCriteria);
							$strCriteria = str_replace("]", "!" , $strCriteria);
							$strCriteria = parseEmailTemplateVariables($strCriteria, $array_call_bindings);

							//-- using crietia get the value we want
							$strAddSelect = "select $sourceFieldName from $sourceTableName where $strCriteria";

							if($sourceDBName=="swdata")
							{
								$rsAddInfo = $swdataCon->Query($strAddSelect,true);
							}
							else
							{
								$rsAddInfo = $swcacheCon->CreateRecordSet($swcacheCon->Query($strAddSelect));
							}

							//-- fix for when extended data is not found
							if($rsAddInfo!=false && !$rsAddInfo->eof)
							{
								$varAddValue = $rsAddInfo->f($sourceFieldName);
								$varAddValue = swdti_formatvalue($sourceDatabinding , $varAddValue);
								$array_remotecall_bindings[$rsRC->f('fieldname')] = $varAddValue;
							}
						}
						$rsRC->movenext();				
					}

					//-- Now get last update text and time spent for the call - this is %2 and %3 or remote query
					$strSelect = "SELECT timespent, updatetxt FROM updatedb where callref = ".PrepareForSql($in_callref)." order by udindex desc";
					$rsDiary =  $swcacheCon->CreateRecordSet($swcacheCon->Query($strSelect));
					if($rsDiary!=false)
					{
						$array_remotecall_bindings['description'] = $rsDiary->f('updatetxt');
						$array_remotecall_bindings['timespent'] = swdti_formatvalue("updatedb.timespent",$rsDiary->f('timespent'));
					}

				}
			}
			$swcacheCon->Close();
			$swdataCon->Close();
		}

		return $array_remotecall_bindings;
	}


	//-- given rc array values and a string parse out values
	function parseEmailTemplateVariables($parseString, $arrayDataValues)
	{
		$arrMatches = array();
		$arrReplacements = array();

		$regexp = "/\\$+([a-z]||[_]||[.]||[A-Z]*)+\\!/";

		preg_match_all($regexp, $parseString, $arrMatches);

		$arrReplace = array("$","!");
		$arrReplacements = array();

		for($i = 0 ; $i<=count($arrMatches[0]) -1; $i++)
		{
			$fieldName = str_replace($arrReplace, "", $arrMatches[0][$i]);
			
			//-- check if a special field
			$varValue = getSpecialTemplateVariables($fieldName);
			if($varValue=="NOTUSED")
			{
				$varValue = $arrayDataValues[strtolower($fieldName)];
			}
			$arrReplacements[$i] = $varValue;
		}

		$strParsed = str_replace($arrMatches[0],$arrReplacements,$parseString);
		return $strParsed;	
	}


	function getSpecialTemplateVariables($strInput)
	{
		$strInput = strtolower($strInput);
		switch ($strInput)
		{
			case "time" :
				$strPlaceHolder = date("H:i", time());
				break;
			case "date" :
				$strPlaceHolder = date("d/m/Y", time());
				break;
			default : 
				$strPlaceHolder = "NOTUSED";
				break;
		}
		return $strPlaceHolder;
	}



?>
