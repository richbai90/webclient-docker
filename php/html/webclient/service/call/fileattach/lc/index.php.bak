<?php

	//-- v1.0.0
	//-- service/call/fileattach/lc
	include('../../../../php/swDecoder.php');

	//-- require callref
	if($_POST['callref']=="")exit;

	$strFiles = "";
	//-- attach files to a call that has just been logged - do not show call diary updates for logged call
	foreach($_FILES as $strFieldName => $aFile)
	{
		if($strFiles!="")$strFiles.="|";
		$strFiles .= $aFile["name"];
	}



	//-- call js to handle completion of upload request
	$strHTML  =	"<script language='javascript' type='text/javascript'>";   
	$strHTML .= "top.app.fileuploadcomplete(".$_POST['callref'].",'".$strFiles."','','','".$_POST['swfileuploadcallbackfunctionid']."');";
	$strHTML .= "</script>";
	echo $strHTML;
?> 
 