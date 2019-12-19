<?php
	GLOBAL $session;
	if(HaveAppRight("C", 9, $session->currentDataDictionary))
	{
		$accessGranted= 1; //-- form is ok to display
	}
	else
	{
		$accessGranted="You are not authorised to view Known Error records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}
?>