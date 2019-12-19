<?php
	//-- NWJ - 05.06.2007
	//-- Return xml list for fat client xml listbox

	//-- showing images from vmcimages dir
	$VCMPATH = "&[app.webroot]/clisupp/VCMImages/";
	$d = dir(".");
	echo "<list>";
	while (false !== ($entry = $d->read())) 
	{
		if (is_file($entry) && strpos($entry,".php")===false)
		{
			$value = $VCMPATH . $entry;
		  echo "<item value='".$value."'>".$entry."</item>";
		}
	}
	echo "</list>";
	$d->close();

?>
