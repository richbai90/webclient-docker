<?php 
	//-- NWJ - 05.06.2007
	//-- Return xml list for fat client xml listbox

	//-- showing images from vmcimages dir
	$d = dir(".");
	$strVpmeSCripts = "";
	while (false !== ($entry = $d->read())) 
	{
		if(is_file($entry))
		{
			$filename = explode(".",$entry); //seperate filename from extenstion
			$cnt = count($filename); 
			$cnt--; 
			$ext = $filename[$cnt]; 
			//-- F0087514
			//-- if app.call.<filename>.xml
			if((strtolower($ext) == "xml"))
			{ 	
				$strVpmeSCripts .= $filename[0]."|";
			}
		}
	}
	echo $strVpmeSCripts;
	$d->close();
?>
