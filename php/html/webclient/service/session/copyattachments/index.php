<?php

	//--
	//-- given formid copy files to temp path cfe_formid
	include("../../../php/session.php");
	error_reporting(E_ALL);


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/copyattachments/index.php","START","SERVI");
	}	


function recurse_copy($src,$dst) 
{ 
    $dir = @opendir($src); 
    @mkdir($dst); 
    while(false !== ( $file = @readdir($dir)) ) 
	{ 
        if (( $file != '.' ) && ( $file != '..' )) 
		{ 
            if (is_dir($src . '/' . $file) ) 
			{ 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else 
			{ 
				//-- log activity
				if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
				{
					_wc_debug("service/session/copyattachments/index.php","copied : " . $src . '/' . $file ,"SERVI");
				}	

                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    } 
    @closedir($dir); 
} 


//-- copy from
$from_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_copyfromuniqueformid"];
$from_path = str_replace("\\","/",$from_path);

//-- copy to
$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_copytouniqueid"];
$destination_path = str_replace("\\","/",$destination_path);


//-- log activity
if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
{
	_wc_debug($from_path ." -> ".$destination_path,"COPY","SERVI");
}
RecursiveMkdir($destination_path);
recurse_copy($from_path,$destination_path);

echo "ok";

//-- log activity
if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
{
	_wc_debug("service/session/copyattachments/index.php","END","SERVI");
}	


exit;
?>