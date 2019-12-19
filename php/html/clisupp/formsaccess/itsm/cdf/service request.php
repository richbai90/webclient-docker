<?php
	GLOBAL $session;
	if(HaveAppRight("H", 1, $session->currentDataDictionary))
	{
		$accessGranted= 1; //-- form is ok to display
	}
	else
	{
		$accessGranted="You are not authorised to view Service Request records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}
?>