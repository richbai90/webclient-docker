<?php

	//-- CUSTOMERS CAN OVERRIDE SETTINGS - BASED ON THEIR ITSM VERSION
	//-- So fo example in earlier versions they do not have bpm for incident asnd problem and service request so they should modify varsr accordingly

	//-- supported callclass i.e. call classes that use bpm
	$arrSupportedCallclass =Array();
	$arrSupportedCallclass[]="Incident";
	$arrSupportedCallclass[]="Problem";
	$arrSupportedCallclass[]="Change Proposal";
	$arrSupportedCallclass[]="Change Request";
	$arrSupportedCallclass[]="Release Request";
	$arrSupportedCallclass[]="Service Request";


	//-- These var determine which tab items to hide or show when opening workflow form and stage form from bpmui 
	//-- NOTE - OLDER VERSIONS OF ITSM WILL IGNORE THIS - JUST MEANS THEY ALWAYS GET STARD FORM WITH ALL TABS VISIBLE
	//-- for earlier itsm versions to make use of this you need to alter the form code and tab controls in the customer build

	$workflowform_edit_hidetabitems = "2";
	$stageform_edit_showtabitems	= "0,1,3,6";
	$stageform_editauth_showtabitems	= "2";
	$stageform_editstartcond_showtabitems	= "4";
	$stageform_editstatuscond_showtabitems	= "5";
	
	
?>