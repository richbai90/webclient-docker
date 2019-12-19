<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');

$prefix = 'bpmutil_import_';
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
		<p>
		<form name="fileloader" action="import_process.php" target="_self" method="post" style="width:500px;">
		<p>
			<h3>Select Process(es) to Import: </h3>
		<p>
			<b>Connection Details :</b>
		<p>
		<table>
			<tr>
				<td>
					<span class="sizeOfElements">Data Source :</span>
				</td>
				<td>
					<input  class="sizeOfElements" type="text" id="dsnname" name="dsnname" value="Supportworks Data">
				</td>
			</tr>
			<tr>
				<td>
					<span class="sizeOfElements">Username :</span>
				</td>
				<td>
					<input type="text" id="username" name="username" class="sizeOfElements" value="root">
				</td>
			</tr>
			<tr>
				<td>
					<span class="sizeOfElements">Password :<span>
				</td>
				<td>
					<input type="password" id="password" name="password" class="sizeOfElements" size="21">
				</td>
			</tr>
		</table>
		<br>
		<b>Note: Processes marked with a * were not exported from the current Data Dictionary.
		   Importing these processes will associate them with the current Data Dictionary.</b>
		<br><br>
		<select id='filenames[]' name='filenames[]' multiple ='multiple' style="width:50%" size="10">
		<?php 			$arrDIRs = array();
			//read processes from directory
			for($x = 0; $x<count($_SESSION['arrApplications']); $x++)
			{
				//$strCurrentApp = str_replace("'","",$_SESSION['arrApplications'][$x]);
				$strCurrentApp = gv('dataset');
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
								<option value=<?php echo str_replace(" ", "%20",formatFile($strCurrentApp.'/'.$file))?>><?php echo formatFile($file)?></option>;
								<?php 							} 
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
					if (isset($arrFiles[1] ))
					{
						if($arrFiles[1] == $file_extension) //compare file extention 
						{     
							?>
							<option value=<?php echo str_replace(" ", "%20",formatFile($file))?>>* <?php echo formatFile($file)?></option>;
							<?php
						}
					}
				}	
			}
			closedir($mydir);
		?>
		</select>
		<p>
		<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
		<input type="hidden" id="currAppCode" name="currAppCode" value="<?php echo $strCurrentApp;?>"/>
		<input type="submit" value="Import Process">
	</form>
</div>

