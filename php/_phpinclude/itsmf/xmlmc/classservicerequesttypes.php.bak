<?php
	include_once('classdatabaseaccess.php');
	include_once('classcustomerscript.php');


//-- load type record
function load_service_request_type($strTypeCode,$connDB)
{
	$rsType=new odbcRecordsetDummy;
	//-- connect to swdata and get record
	if(!isset($connDB))
	{
		$connDB = new CSwDbConnection;
		$connDB->SwDataConnect();
	}

	$strQuery="select * from ssrequesttype where pk_code = '" .pfs($strTypeCode)."'";
	$rsType = $connDB->query($strQuery,true);
	return $rsType;
}


function get_ci_record($intCI,$connDB)
{
	$rsCI=new odbcRecordsetDummy;
	//-- connect to swdata and get record
	if(!isset($connDB))
	{
		$connDB = new CSwDbConnection;
		$connDB->SwDataConnect();
	}
	$strQuery="select * from config_itemi where pk_auto_id = " .PrepareForSql($intCI);
	$rsCI = $connDB->query($strQuery,true);
	return $rsCI;

}

function get_operator_script($scriptID)
{
	if($scriptID=="")
	{
		echo "ERROR:The script id required to run this request is missing. Please contact your Supportworks administrator.";
		exit;
	}

	$cacheDB = new CSwLocalDbConnection;
	if(!$cacheDB->connect("sw_systemdb",swcuid(),swcpwd()))
	{
		echo "ERROR:Unable to connect to the Supportworks system database. Please contact your Supportworks administrator.";
		exit;
	}


	//-- load script
	$active_script = new aScript($scriptID,$cacheDB);
	if($active_script->notvalid)
	{
		echo "ERROR:The requested script does not exist within the system. Please contact your Supportworks administrator.";
		exit;
	}

	return $active_script;
}

function generate_operator_script($active_script)
{
	//-- if we have additional questions procss them now
	//--
	//-- Now get q html per question
	$outputHTML = "";
	$questionHTML = "";
	$qcounter=0;
	$array_q_html = Array();
	foreach($active_script->array_questions as $current_qid => $current_question)
	{
		//-- construct question html and attach to outputhtml
		$questionID = "q_".$current_qid;
		//$questionID = "q_".$questionNumber;
		
		if($current_question->next_q_id=="0")
		{
				$next_qid=$current_qid + 1;
		}
		else
		{
			//-- either the end or a jumper
			$next_qid=$current_question->next_q_id;
			if ($next_qid=="-1") 
			{
				$next_qid = "end";
			}
		}
	
		//--
		//-- previous question id
		$prev_qid	= $current_question->prev_q_id;			

		//--
		//-- store question HTML
		$qHTML = $current_question->generate_html();
		$outputHTML .= "<p><span id='".$questionID."' aquestion='1' qtarget='".$current_question->target."' flags='".$current_question->flags."' qtype='".$current_question->type."' qid='".$current_qid."' pqid='".$prev_qid."' nqid='".$next_qid."' ".get_capturetype_attribute($current_question)." class='q_hide'>".$qHTML."</span></p>";
		//$questionNumber++;
	}
	return $outputHTML;
}

?>