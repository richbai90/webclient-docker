<?php
	GLOBAL $session;
	if(HaveAppRight("B", 1, $session->currentDataDictionary))
	{
		$accessGranted= 1; //-- form is ok to display
	}
	else
	{
		$accessGranted="You are not authorised to create Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

?>