<?php
	// WARNING: Do not modify this file. Support-Works relies on this file to 
	// operate correctly and modifying this could cause some parts of Support-Works 
	// to fail.

	// The following code gives us a dirctory listing used by the Support-Works
	// client report tree control to get a folder and report listings

	include('stdinclude.php');
	swphpGlobaliseRequestVars();
	
	// We want to get our current directory
	$d = dir(".");

	if(!isset($mode))
	{
		$mode = gv('mode');
	}
	
	// Read each entry from

	while($entry = $d->read())
	{
		// We dont want local or parent virtuals. Just skip them
		if($entry == "." || $entry == "..")
			continue;

		// We dont want our self to be reported in the listing
		if($entry == "cat.php")
			continue;
		if($entry == "common")
			continue;
		if($entry == "js")
			continue;
		if($entry == "img")
			continue;
		if($entry == "php")
			continue;
		if($entry == "css")
			continue;
		if($entry == "zz")
			continue;
		if($entry == "zz_php")
			continue;

		if($mode != "rlist")
		{
			// We dont want files, so just make sure we are looking at a folder
			if(is_dir("./" . $entry))
			{
				// The tree control needs to know if this folder has child folders.
				// It uses this information to add the expand option to the tree
				// node. We need to build a path and see if there are any sub folders

				$dChild = dir("./" . $entry);
				$hasChildren = 0;
				while($cEntry = $dChild->read())
				{

					// We dont want local or parent virtuals. Just skip them
					if($cEntry == "styles" || $cEntry == "images" || $cEntry == "." || $cEntry == ".." || $cEntry == "cat.php")
						continue;
					
					if(strstr($cEntry, ".php") || !is_dir("./" . $entry . "/" . $cEntry))
					{
						$hasChildren = 1;
						break;
					}
				}
				$dChild->close();
				echo "<dir=\"" . $entry . "\", $hasChildren/>\n";
			}		
		}
		else
		{
			if(strstr($entry, ".php"))
			{
				// We want files, so ignore if this is a folder
				if(!is_dir("./" . $entry))
				{
					echo "<file=\"" . $entry . "\"/>\n";
				}
			}	
		}
	}
	// Close the directory now
	$d->close();
?>

