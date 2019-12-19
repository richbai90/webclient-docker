<?php

	//-- service/form/tidyup
	//-- 1.0.0
	//-- called when a form is closed, this is so we can delete temp files if there are any.
	include("../../../php/session.php");

	if($_POST['_uniqueformid']!="")
	{
		//-- get temp location
		chdir("../../../");

		//-- delete temp form folder for files
		$destination_path = getcwd() ."/temporaryfiles/" . $_POST["swsessionid"] ."/". $_POST["_uniqueformid"];
		$destination_path = str_replace("\\","/",$destination_path);
		SureRemoveDir($destination_path,true);

		//-- delete mime folder if one was created
		if($_POST["_mimefolder"]!="")
		{
			$destination_path = getcwd() ."/temporaryfiles/" . $_POST["swsessionid"] ."/". $_POST["_mimefolder"];
			$destination_path = str_replace("\\","/",$destination_path);
			SureRemoveDir($destination_path,true);
		}
		
	}

?>