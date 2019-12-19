<?php
	//-- global.js cmdb create_clone
	
	IncludeApplicationPhpFile("cmdb.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();
	//-- can create cmdb
	if(!$cmdb->is_specialist())
	{
		$cmdb->throwError("You are not authorised to clone Configuration Items.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	else 
	{
		if(!$cmdb->can_create()) 
		{
			$cmdb->throwError("You are not authorised to create Configuration Items.\nIf you require authorisation please contact your Supportworks Administrator.");
		} 
		else	
		{
			if($cmdb->create_clone($_POST['cid'], $_POST['bln'], $_POST['cit'],$_POST['noc']))	
			{
				throwSuccess(1);
			} 
			else	
			{
				throwProcessErrorWithMsg("CMDB process create_clone did not complete properly. Please contact your Administrator"); //-- so submit will treat as error and alert out.
			}
		}
	}
?>