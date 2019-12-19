<?php
	GLOBAL $session;
	if(HaveAppRight("D", 12, $session->currentDataDictionary))
	{
		$accessGranted= 1; //-- form is ok to display
	}
	else
	{
		$accessGranted="You are not authorised to create Change Proposal records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

?>