<?php

	//-- save file to temporary filesystem as part of call action (i.e. update, accept, hold etc)
	//-- pass in apsessionid, epoch unique call action id and file

	//-- files stored as tempfiles/apsession/epochformid/filename.fileext

	//-- this means can upload files during call action.
	//-- then when submitting call we get these temp files and attach to call.


	//-- 1.0.0
	//-- service/call/fileattach/ca/index.php
	include('../../../../php/session.php');


	//-- session temp file path
	$destination_path = $portal->fs_root_path ."temporaryfiles/" .$_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
	$destination_path = str_replace("\\","/",$destination_path);

	//-- make directory path in app root working dir
	RecursiveMkdir($destination_path);
	//chdir("../../../../");
	//mkdir("temporaryfiles");
	//chdir("temporaryfiles");
	//mkdir($_POST["swsessionid"]);
	//chdir($_POST["swsessionid"]);
	//mkdir($_POST["_uniqueformid"]);

	$result = 0;   
	$strfilename="";
	$strfilesize="";
	$strfiledate="";

	foreach($_FILES as $strFieldName => $aFile)
	{ 
		$strfilename = $aFile["name"];

		$target_path = $destination_path . "/". basename($aFile["name"]);
		if(@move_uploaded_file($aFile["tmp_name"], $target_path)) 
		{
			sleep(1);
			$result = 1;   
			$strfilesize=conversion_bytesize(filesize($target_path));
			$strfiledate= date ("Y/m/d H:i", filemtime($target_path)) ;
			$strfilename = $aFile["name"];
		}
	}

	//-- call js to handle completion of upload request
	$strHTML  =	"<script language='javascript' type='text/javascript'>";   
	$strHTML .= "top.app.fileuploadcomplete(".$result.",'".$strfilename."','".$strfilesize."','".$strfiledate."','".$_POST['swfileuploadcallbackfunctionid']."');";
	$strHTML .= "</script>";
	echo $strHTML;

?>