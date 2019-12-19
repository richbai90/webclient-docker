<?php
	$strTitle = "Update";
	$strOtherInputs = "<input type='hidden' name='_callref' id='_callref' value='".$_POST['_callref']."'>";
	$strOtherInputs .= "<input type='hidden' name='_callreffmt' id='_callreffmt' value='".$_POST['_callreffmt']."'>";

	include_once('itsm_default/xmlmc/classhdsession.php');

	if($_POST['_callaction']=="Accept")
	{
		include('accept.php');
		$strTitle = "Accept";
	}
	elseif($_POST['_callaction']=="Resolve \ Close")
	{
		include('close.php');
		$strTitle = "Resolve / Close";
	}
	elseif($_POST['_callaction']=="Assign")
	{
		include('assign.php');
		$strTitle = "Assign";
	}
	elseif($_POST['_callaction']=="Hold")
	{
		include('hold.php');
		$strTitle = "Hold";
	}
	elseif($_POST['_callaction']=="Off Hold")
	{
		include('offhold.php');
		$strTitle = "Off Hold";
	}
	elseif($_POST['_callaction']=="Update")
	{
		include('update.php');
		$strTitle = "Update";
	}
	elseif($_POST['_callaction']=="Authorise")
	{
		include('authorise.php');
		$strTitle = "Authorise";
	}
	elseif($_POST['_callaction']=="Task Update")
	{
		include('taskupdate.php');
		$strTitle = "Task Update";
	}
	elseif($_POST['_callaction']=="Status Update")
	{
		include('statusupdate.php');
		$strTitle = "Status Update";
	}
	elseif($_POST['_callaction']=="Cancel")
	{
		include('cancel.php');
		$strTitle = "Cancel";
	}
?>