<?php

	//-- 16.03.2011 - upload file to my library
	include('../../../php/session.php');

	if($_POST["genfieldone"]=="")
	{
		echo "<html><script>alert('There was a problem uploading the selected file. Please contact your Administrator');</script></html>";
		exit(1);
	}

	$strFileName = "";
	foreach($_FILES as $strFieldName => $aFile)
	{ 
		if($aFile['error']>0)
		{
			$result = "";
			switch ($aFile['error'])
			{  
				case 1:
					$result ='The file is bigger than the php installation allows. ';
					break;
				 case 2:
					$result ='The file is bigger than the form allows. ';
					break;
				 case 3:
					$result ='Only part of the file was uploaded. ';
					break;
				 case 4:
					$result ='No file was uploaded. ';
					break;
			}
			echo "<script>alert('There was a problem adding the selected file. ".$result."Please contact your Administrator');</script>";
			exit(0);
		}
		else
		{
			$strFileName = $aFile["name"];

			//-- 2013-09-09
			if(!checkUploadedFileTypeAllowed($strFileName,"FileService"))
			{
				$strFileType = pathinfo($strFileName, PATHINFO_EXTENSION);
				echo "<script>alert('The type of file being uploaded has been denied by the Supportworks Server.')</script>";
				exit(0);
			}

			$strFileData = base64_encode(file_get_contents($aFile["tmp_name"]));

			$fullLibPath = $_POST["genfieldone"];
			
			//-- add to my library
			$xml="<?xml version='1.0' encoding='utf-8'?><methodCall service='mylibrary' method='putFile'><params><path>".$fullLibPath."</path><forceOverwrite>true</forceOverwrite><file><fileName>".$strFileName."</fileName><fileData>".$strFileData."</fileData></file></params></methodCall>";
			$oResult = xmlmc($portal->sw_server_ip, "5015", $_SESSION['swstate'], $xml);
			$_SESSION['swstate']=$oResult->token;

			if($oResult->status==200)
			{
				//-- create xmldom so we can get info
				$xmlFile = @domxml_open_mem($oResult->content);
				if($xmlFile==false)
				{
					echo "<script>alert('There was a problem adding the selected file. Please contact your Administrator');</script>";
					exit(1);
				}
			}
			else
			{
					echo "<script>alert('There was a problem running xmlmc mylibrary:putFile. Please contact your Administrator');</script>";
					exit(1);
			}
		}
	}


?>
<script>
	top.app.SwMyLibrary.onnewfileadded("<?php echo $strFileName;?>");
</script>

<?php

if($_POST["_uniqueformid"]=="-1")
{
	?>
	<script>
		top.window.close();
	</script>
	<?php
}

?>
