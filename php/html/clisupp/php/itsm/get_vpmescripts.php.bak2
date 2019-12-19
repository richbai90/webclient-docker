<?php
	//--
	//-- get the directory where vpme scripts reside
	include('php5requirements.php');	
	//--
	//-- get vpme subprocessess for a given path
	function get_vpme_subprocesses($filepath)
	{
		$strVpmeSCripts="";
		if (is_dir($filepath)) 
		{
			if ($dh = opendir($filepath)) 
			{
				while (($file = readdir($dh)) !== false) 
				{
					if(filetype($filepath . $file)=="file")
					{
						$filename = explode(".",$file); //seperate filename from extenstion
						$cnt = count($filename); $cnt--; 
						$ext = $filename[$cnt]; 
						$pre0 = $filename[0]; 
						$pre1 = $filename[1]; 

						//-- F0087514
						//-- if app.call.<filename>.xml
						if((strtolower($ext) == "xml")&&($pre0=="app")&&($pre1=="call"))
						{ 	
							$strVpmeSCripts .= $filename[2]."|";
						}
						elseif((strtolower($ext) == "xml")&&($pre0=="gen"))
						{ 	
							$strVpmeSCripts .= $filename[1]."|";
						}
					}
				}
				closedir($dh);
			}
		}	
		return $strVpmeSCripts;
	}

	//--
	//-- using passed in ddname get list of SYSTEM sub process scripts (app.call.<name>.xml)
	$install_path = sw_getcfgstring("InstallPath");
	$in_ddname = gv('in_ddname');

	$script_filefetch = $install_path . "\\vpme\\" . $in_ddname . "\System\\";
	$strVpmeSCripts = get_vpme_subprocesses($script_filefetch);

	$script_filefetch = $install_path . "\\vpme\\" . $in_ddname . "\User\\";
	$strVpmeSCripts .= get_vpme_subprocesses($script_filefetch);
	
	$script_allddfilefetch = $install_path . "\\vpme\\All Data Dictionaries\System\\";
	$strVpmeSCripts .= get_vpme_subprocesses($script_allddfilefetch);

	//-- echo back to client
	echo $strVpmeSCripts;
?>