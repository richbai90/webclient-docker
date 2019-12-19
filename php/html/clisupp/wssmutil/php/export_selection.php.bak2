<?php 
include_once('helpers/session_check.php');
include_once('helpers/helpers.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');

$boolDSN = false;

$strMessage="";
$boolAction = false;
$prefix = 'wizutil_export_';

//-- if page has been submitted
if(isset($_POST['dsnselected']))
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
$_SESSION[$prefix.'key'] = $strKey;

$swdsn =gv('dsn');
$swuid =gv('un');
$swpwd =gv('pw');

//Create connection
$con = new CSwDbConnection;
if(!$con->Connect($swdsn, $swuid, $swpwd))
{
	echo "Failed to connect to database, please check ODBC connection";
	exit;
}

?>

	<html>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
	<link href="../css/elements.css" rel="stylesheet" type="text/css" />
	<body style="background-color:#ffffff;overflow:hidden;">
	<script src="../js/system/portal.control.js"></script>
		<div class="boxContent" align="left" width = '500px'>
<?php

	if ($_SESSION['bAppcodeSeparatedSystem']){
		if ($_SESSION['bAppcodeStrictlySeparated']){
			$query = "SELECT pk_name, appcode FROM wssm_wiz".$_SESSION['strFilterApplications'];
		} else {
			$query = "SELECT pk_name, appcode FROM wssm_wiz";		
		}
		$query .= ' ORDER BY appcode, pk_name';
	} else {
		$query = "SELECT pk_name FROM wssm_wiz ORDER BY pk_name";	
	}
	
	if($con->Query($query))
	{
?>
			<form action="export_process.php" method="post" target="_self">
				<p>
				<h3>Select Wizard to Export: </h3>
				<p>
					<b>Data Source : <?php echo swdsn()?> </b>
				<p>
				<select id='process[]' name='process[]' multiple ='multiple' style="width:50%" size="20">
<?php
					while($con->Fetch("workflows"))	
					{
?>
						<option value=<?php echo str_replace(" ", "%20",htmlentities($workflows_pk_name))?>><?php echo htmlentities($workflows_pk_name) . (isset($workflows_appcode)?(' (' . $workflows_appcode . ')'):'') ;?></option>
<?php
					}
?>
				</select>
				<p>
				<input type="submit" value="Export Wizard">
				<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
			</form>
		</div>
<?php	
	}
	else
	{
	print_r($con);
		echo "Unable to query WSSM_WIZ table on DSN '".htmlentities($swdsn)."'</div>";
	}
?>


