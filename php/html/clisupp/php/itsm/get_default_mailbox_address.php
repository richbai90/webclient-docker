<?php

	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/helpers/language.php');
	include_once('itsm_default/xmlmc/session_check.php');
	

	$default=0;
	$result="";

	$sessid = gv('sessid');
	
	$session = new classActivePageSession($sessid);
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Session Authentication Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							There has been a session authentication error<br>
							Please contact your system administrator.
						</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}

	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam('type',2);
	
	if($xmlmc->Invoke("mail","getMailboxList")){

		$arrayMailboxResult = $xmlmc->xmlDom->get_elements_by_tagname("mailbox");

		foreach($arrayMailboxResult as $infoMailbox){
			$children = $infoMailbox->child_nodes();
			$dTotal = count($children);


			for ($j=0;$j<$dTotal;$j++){
				
				echo ($children[$j]->node_name());

				if ((strcmp($children[$j]->node_name(),"default")==0) && ($children[$j]->get_content()==1)){
					$default=1;
				}
				else {
					 if (($default==1) && (strcmp($children[$j]->node_name(),"address")==0)){
					 	$result=$children[$j]->get_content();
					 	$record_found = 1;
					 	break;
					 }
				}
				echo(" : " .$default."<br/>");
			}

			if ($record_found)
				break;
		}
	}
	

	header("Content-Type: text/xml");
	echo "<params>";
	echo "<defaultHelpdeskAddress>".$result."</defaultHelpdeskAddress>";
	echo "</params>";

?>
