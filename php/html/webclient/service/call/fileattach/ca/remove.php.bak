<?php

	
	//-- 13.01.2009
	//-- 1.0.0
	//-- service/call/fileattach/ca/remove.php
	
	//-- given unique call action form id and a filename, remove the file from temp file store so it will not be included in call update action
	include('../../../../php/session.php');

	//-- session temp file path
	$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_POST["swsessionid"] . "/" . $_POST["_uniqueformid"];
	$destination_path = str_replace("\\","/",$destination_path);

	$destination_path .= "/" .  $_POST["_filename"];



	chdir("../../../../");
	chdir("temporaryfiles");
	chdir($_POST["swsessionid"]);
	chdir($_POST["_uniqueformid"]);


	if(is_file($destination_path)) 
	{
		unlink($destination_path);
		echo "1";
	}
	else
	{
		echo "0";
	}
?>