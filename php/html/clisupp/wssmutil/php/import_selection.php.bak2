<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');

$prefix = 'wssmutil_import_';
$strKey = generate_secure_key($prefix);
$_SESSION[$prefix.'key'] = $strKey;
?>
	<html>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
	<link href="../css/elements.css" rel="stylesheet" type="text/css" />
	<body style="background-color:#ffffff;overflow:hidden;">
	<script src="../js/system/portal.control.js"></script>

	<div class="boxContent" id="import" align="left">
		<form name="fileloader" action="import_process.php" target="_self" method="post" style="width:500px;">
		<h3>Select Wizard(s) to Import: </h3>
		<br />
		<p>
		<select id='filenames[]' name='filenames[]' multiple ='multiple' style="width:50%" size="10">
		<?php
			$arrDIRs = array();
			//read processes from directory
			for($x = 0; $x<count($_SESSION['arrApplications']); $x++)
			{
				$strCurrentApp = str_replace("'","",$_SESSION['arrApplications'][$x]);
				
				if(!isset($arrDIRs[$strCurrentApp]))
				{
					//Get workingdir from session variable
					$workingdir = $_SESSION['strDirectory'];
					$mydir = opendir($workingdir.$strCurrentApp.'/');	
					$file_extension = 'xml';
					while(($file = readdir($mydir)) !== false) 
					{			
						if ($file != "." && $file != "..") 
						{			
							$arrFiles = explode(".", $file); 
							if($arrFiles[1] == $file_extension) //compare file extention 
							{     
								?>
								<option value=<?php echo str_replace(" ", "%20",formatFile($strCurrentApp.'/'.$file))?>><?php echo formatFile($file)?> (<?php echo $strCurrentApp; ?>)</option>;
								<?php
							} 
						}	
					}
					closedir($mydir);
					$arrDIRs[$strCurrentApp] = true;
				}
			}
			//Read processes that are not application specific from workflows root 
			//Get workingdir from session variable
			$workingdir = $_SESSION['strDirectory'];
			$mydir = opendir($workingdir);	
			$file_extension = 'xml';
			while(($file = readdir($mydir)) !== false) 
			{			
				if ($file != "." && $file != "..") 
				{			
					$arrFiles = explode(".", $file); 
					if (isset($arrFiles[1]))
					{
						if($arrFiles[1] == $file_extension) //compare file extention 
						{     
							?>
							<option value=<?php echo str_replace(" ", "%20",formatFile($file))?>><?php echo formatFile($file)?></option>;
							<?php
						}
					}
				}	
			}
			closedir($mydir);
		?>
		</select>
		</p><p>
		<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
		<?php
		$bDisplayAppcodeOptions = (!($_SESSION['bAppcodeStrictlySeparated']) || count($_SESSION['arrApplications']) > 1);
		if ($bDisplayAppcodeOptions){
			echo '<select id="currAppCode" name="currAppCode">';
			foreach ($_SESSION['arrApplications'] as $cApp){
				$cApp = str_replace("'","",$cApp);
				echo '<option' . ((strtolower(gv('dataset')) == strtolower($cApp))?' selected ':'') . '>' . $cApp . '</option>';
			}
			echo '</select>';
		} else {
		?>
		<input type="hidden" id="currAppCode" name="currAppCode" value="<?php echo gv('dataset');?>"/>
		<?php } ?>
		<input type="submit" value="Import Wizard">
		</p>
	</form>
</div>

