<?php
	GLOBAL $session;
	if(HaveAppRight("B", 5, $session->currentDataDictionary))
	{
		$accessGranted= 1; //-- form is ok to display
	}
	else
	{
		$accessGranted="You are not authorised to view Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}
?>