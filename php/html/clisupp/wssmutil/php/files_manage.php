<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');

$strMessage="";
$boolAction = false;
$prefix = 'wssmutil_file_';
//-- Get Workingdir from session
$workingdir = gv('strDirectory');

//-- if page has been submitted

if (isset($_FILES['afile']))
{
	$strTempName =   $_FILES['afile']['tmp_name'];
}
else
{
	 $strTempName = "";
}


if(isset($_POST['action']) || $strTempName!="")
{
	//-- check if key matches
	if(!check_secure_key($prefix.'key'))
	{
		//-- set uploading to zero (determines if action is being taken)
		echo "Authentication failure. The action was not performed.";
	}	
	else
		$boolAction = true;
}
$strKey = generate_secure_key($prefix);

//only perform action if key is valid
if($boolAction)
{
	if(isset($_POST['action']))
	{
		if($_POST['action']=="download")
		{
			include('files_download.php');
		}
		if($_POST['action']=="delete")
		{
			unlink($workingdir.$_POST['filename'].".xml");
		}
	}

	if($strTempName!="")
	{
		$tmp_name = $_FILES['afile']['tmp_name'];
		$file_name = $_FILES['afile']['name'];
		$file_type = $_FILES['afile']['type'];
		if($file_type!="text/xml")
		{
			echo "The file you have tried to upload is not an xml file, and has not been added.";
		}
		else
		{
			
			$subdir = strtoupper(trim($_POST['currAppCode']));
			if ( !in_array("'" . $subdir . "'", $_SESSION['arrApplications']) ) $subdir = '';
			if (!is_dir($workingdir.$subdir)) {
				mkdir($workingdir.$subdir);
			}
			move_uploaded_file($tmp_name, $workingdir . $subdir . '/' . $file_name);
			
			/* Seriously?!
			$xmlfile = file_get_contents($tmp_name);
			$FileName = $file_name;
						
			if (!is_dir($workingdir.gv('dataset'))) {
				mkdir($workingdir.gv('dataset'));
			}
			$fh = fopen($workingdir.gv('dataset').'/'.$FileName, 'w') or die("can't open file");
			fwrite($fh, $xmlfile);
			fclose($fh);
			*/
			echo "<script type='text/javascript'>alert('The XML file is successfully uploaded.');</script>";
			
		}
	}
}
$_SESSION[$prefix.'key'] = $strKey;
?>
<html>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="../css/elements.css" rel="stylesheet" type="text/css" />
<body style="background-color:#ffffff;overflow:hidden;overflow-y:auto;">
<script src="../js/system/portal.control.js"></script>

<div class="boxContent" id="import" align="left">
<p>
	<form name="fileloader" action="files_manage.php" target="_self" enctype="multipart/form-data" method="post" style="width:500px;">
			<h3>Manage Files on Server: </h3>
		<table>
		<?php
			$boolNoFiles = true;
			$arrDIRs = array();
			$iApps = count($_SESSION['arrApplications']);
			if ($iApps > 0){
				?>
				<tr>
				<th colspan="3">Applications</th></tr>
				<?php
			}
			$file_extension = 'xml';
			for($x = 0; $x<$iApps; $x++)
			{
				$strCurrentApp = str_replace("'","",$_SESSION['arrApplications'][$x]);
				if(!isset($arrDIRs[$strCurrentApp]))
				{
					//read processes from directory
					$mydir = opendir($workingdir.$strCurrentApp.'/');	
					if ($mydir !== false) echo '<tr><td colspan="3" style="font-size:70%"><strong>' . $strCurrentApp . '</strong></td></tr>';
					while(($file = readdir($mydir)) !== false) 
					{			
						if ($file != "." && $file != "..") 
						{			
							$arrFiles = explode(".", $file); 
							if($arrFiles[count($arrFiles)-1] == $file_extension) //compare file extention 
							{     
								$boolNoFiles = false;
								?>
								<tr>
								<td><span style="font-size:70%"><?php echo formatFile($file)?></span></td><td><a href="#"  style="font-size:70%" onclick="file_action('download','<?php echo formatFile($strCurrentApp.'/'.$file)?>');">download</a></td><td><a href="#"  onclick="file_action('delete','<?php echo formatFile($strCurrentApp.'/'.$file)?>');" style="font-size:70%">delete</a></td></tr>
								<?php
							} 
						}	
					}
					closedir($mydir);
					
					$arrDIRs[$strCurrentApp] = true;
				}
			}
			//Read processes that are not application specific from workflows root 
			$mydir = opendir($workingdir);	
				?>
				<tr>
				<!--<th colspan="3">Generic</th></tr>-->
				<?php
			while(($file = readdir($mydir)) !== false) 
			{			
				if ($file != "." && $file != "..") 
				{			
					$arrFiles = explode(".", $file); 
					if (isset($arrFiles[1]))
					{
						if($arrFiles[1] == $file_extension) //compare file extention 
						{     
							$boolNoFiles = false;
							?>
							<tr>
							<td><span style="font-size:70%"><?php echo formatFile($file)?></span></td><td><a href="#"  style="font-size:70%" onclick="file_action('download','<?php echo formatFile($file)?>');">download</a></td><td><a href="#"  onclick="file_action('delete','<?php echo formatFile($file)?>');" style="font-size:70%">delete</a></td></tr>
							<?php
						}
					}
				}	
			}
			closedir($mydir);
			if($boolNoFiles)
			{
			?>
				<tr>
						<td><span style="font-size:70%">No files in directory</span></td>
				</tr>
			<?php
			}

		?>
		
		<input type="hidden" id="action" name ="action">
		<input type="hidden" id="filename" name ="filename">
		<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
		</table>
	</form>
		<p>
			<b>Upload a file:</b><br>
			Upload the xml file of your wizard. This will overwrite any file with the same name.
		</p>
	<form name="fileuploader" action="files_manage.php" target="_self" enctype="multipart/form-data" method="post" style="width:500px;" onsubmit="return checkFileType();">
		<p><input type="file" name="afile" id="afile" style="width:100%;"/>
		<input type="hidden" id="files_selected" name ="files_selected">
		
		<?php
		$bDisplayAppcodeOptions = (!($_SESSION['bAppcodeStrictlySeparated']) || count($_SESSION['arrApplications']) > 1);
		if ($bDisplayAppcodeOptions){
			echo '<select id="currAppCode" name="currAppCode">';
			echo '<option value="![--SHARED--]!">-- Shared Area --</option>';
			foreach ($_SESSION['arrApplications'] as $cApp){
				$cApp = str_replace("'","",$cApp);
				echo '<option' . ((strtolower(gv('dataset')) == strtolower($cApp))?' selected ':'') . '>' . $cApp . '</option>';
			}
			echo '</select>';
		} else {
		?>
		<input type="hidden" id="currAppCode" name="currAppCode" value="<?php $gv('dataset');?>"/>
		<?php } ?>
		
		</p><p>
		<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
		<input type="submit" value="Upload File"></p>
	</form>
</div>

