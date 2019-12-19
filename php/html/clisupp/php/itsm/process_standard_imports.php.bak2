<?php
//-- Hornbill 2012 - "Process Standard Imports" script
include_once('stdinclude.php');
// - Define Variables
$swInstallPath =sw_getcfgstring("InstallPath");
$DATA_IMPORT_PATH=substr($swInstallPath,0,3)."Data_import\\";
$DATA_IMPORT_BACKUP_PATH=$DATA_IMPORT_PATH."backup";
$IMPORT_FILE_DELETE_PERIOD="7";
$conf = "\\conf\\";
set_time_limit(0);

// - define static vars
$the_data_import_path = $DATA_IMPORT_PATH; //the path to the data import scrpeadsheets
$the_data_import_backup_path = $DATA_IMPORT_BACKUP_PATH; //the path to the back up folder
$the_archive_delete_period = $IMPORT_FILE_DELETE_PERIOD; //the period of time we will keep archived import source files
$process_import_files = array();
$array_counter = 0;
$date = date("Ymd");

//If Backup Ppth doesn't exist create it
if (!is_dir($the_data_import_backup_path)) 
{
    mkdir($the_data_import_backup_path);	
}
echo "<h1>Hornbill Standard Data Importer</h1>";
echo "<h2>---- Starting import - Looking for import files</h2>".$the_data_import_path;

// - Check if files exists
// - if they do exist then build an array of the file names (userdb.csv company.csv department.csv...etc)
if ($handle = opendir($the_data_import_path)) 
{
	while (false !== ($entry = readdir($handle))) 
	{
		$pos = strpos($entry, ".csv");
		if($pos!==false)
		{
			$process_import_files[$array_counter] =  $entry;
			$array_counter++;
		}
	}

    closedir($handle);
}

// - Check if we have files in our array
// - if not then we have no work to do
$files_to_process = count($process_import_files) > 0 ? true:false;
if(!$files_to_process)
{
	echo "<h2>-----! No Data files to process !</h2><h1>Goodbye</h1>";
	exit;
}

// - If we have got here then we have files to process
// - therefore we need to process the respective import script.
foreach ($process_import_files as $table)
{
	//for each import spreadsheet change the name from '<table>.csv' to 'standard_import__<table>.xml'
	$import_script = "csvImport\\standard_import_".substr_replace($table, "xml", strlen($table)-3,3);
	
	//build the full batch file path
	//we need to pass through three variables 'the import script to run', 'the data import folder' and 'the data import back up folder'
	echo "<h3>------ Running the following file<br>".$import_script." - For Table ".$table."</h3>";
	//Execute the batch file to run the import script
	exec('"'.$swInstallPath.'\bin\swdimprun.exe" -f "'.$swInstallPath.''.$conf.''.$import_script. '"');
	
	//Process userdb Extended Tables if we are importing customers.
	if($table=="userdb.csv")
	{
		echo "<h3>------ Running Userdb Rating<br></h3>";
		exec('"'.$swInstallPath.'\bin\swdimprun.exe" -f  "'.$swInstallPath.''.$conf.'csvImport\\standard_import_userdb_rating.xml"',$capture);
		echo "<h3>------ Running Userdb Site<br></h3>";
		exec('"'.$swInstallPath.'\bin\swdimprun.exe" -f  "'.$swInstallPath.''.$conf.'csvImport\\standard_import_userdb_site.xml"',$capture);
		echo "<h3>------ Running Userdb Company<br></h3>";
		exec('"'.$swInstallPath.'\bin\swdimprun.exe" -f  "'.$swInstallPath.''.$conf.'csvImport\\standard_import_userdb_company.xml"',$capture);
	}
	//Backup Import Files
	$source = ''.$the_data_import_path."".$table.'' ;
	$dest = ''.$the_data_import_path."backup\\".$date."".$table.'';
	exec("copy $source $dest",$capture);
	// Set Modified Date to Today so csv does get deleted
	if (touch($dest)) {
    echo $dest . ' modification time has been changed to present time';
	} else {
		echo 'Sorry, could not change modification time of ' . $dest;
	}
	//Delete Original
	exec("del $source",$capture);
	if($msg_body_content!='')$msg_body_content.="\r\n";
	$msg_body_content.=$table;
	
}

// -- dbmaintenance.php
$dbmaintenancePath = $swInstallPath . "\\html\\clisupp\\php\\itsm\\dbmaintenance.php";
include ($dbmaintenancePath);

//DELETE archived import scripts after n Days
$cmd = '"CMD /C del @FILE"';
$deleteArchives="forfiles /P ".$the_data_import_backup_path."\ /s /m *.* /c ".$cmd." /d -".$the_archive_delete_period."";
echo $deleteArchives;
exec($deleteArchives, $capture);
// process is completed
echo "<h1>Process completed.</h1>";
exit;
?>