<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
$boolDSN = false;

$strMessage="";
$boolAction = false;
$prefix = 'bpmutil_export_';

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

if($boolAction)
{
	if(isset($_POST['dsnselected']))
	{
		$swdsn = $_POST['dsnname'];
		$swuid = $_POST['username'];
		$swpwd = $_POST['password'];

		if($swdsn=="")
		{
			$swdsn = swdsn();
			$swuid = swuid();
			$swpwd = swpwd();
			$boolDSN = true;
		}
		else
		{
			if($swuid=="")
				echo "Please provide a username for the DSN.<br>";
			else
			{
				$boolDSN = true;
			}
		}
	}
}
else
{
	$boolDSN = false;
}
if(!$boolDSN)
{
	?>
	<html>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
	<link href="../css/elements.css" rel="stylesheet" type="text/css" />
	<body style="background-color:#ffffff;overflow:hidden;">
	<script src="../js/system/portal.control.js"></script>
	<div class="boxContent" align="left" width = '500px'>
	<p>
	<form name="dsnselector" action="export_selection.php" method="post" target="_self">
		<p>
		<h3>Enter DSN credentials to export from Server: </h3>
		<span style="font-size:70%">
			<table>
				<tr>
					<td>
						<span  class="sizeOfElements">Data Source :</span>
					</td>
					<td>
						<input  class="sizeOfElements" type="text" id="dsnname" name="dsnname" value="Supportworks Data">
					</td>
				</tr>
				<tr>
					<td>
						<span  class="sizeOfElements">Username :</span>
					</td>
					<td>
						<input  class="sizeOfElements" type="text" id="username" name="username" value="root">
					</td>
				</tr>
				<tr>
					<td>
						<span  class="sizeOfElements">Password :<span>
					</td>
					<td>
						<input  class="sizeOfElements" type="password" id="password" name="password" size="21">
					</td>
				</tr>
			</table>
			</span>
			<br>
			<input type="hidden" id="dsnselected" name="dsnselected" value="1">
			<input type="submit" value="View Processes">
			<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
		</form>
	</div>
	<?php 	exit;
}

$_SESSION['dsn'] = $swdsn;
$_SESSION['un'] = $swuid;
$_SESSION['pw'] = $swpwd;

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
			<p>

<?php 	if(!$_SESSION['boolApplications'])
	{
		$strAppcodeFilter = getAppcodeFilter('FILTER.APPCODE.BPM');
		if($strAppcodeFilter!="")
			$_SESSION['boolApplications'] = true;
		
		$_SESSION['arrApplications'] = explode(",",$strAppcodeFilter);
		$_SESSION['strFilterApplications'] = " WHERE APPCODE IN (".$strAppcodeFilter.")";
	}
	
	$query = "SELECT pk_workflow_id FROM bpm_workflow".$_SESSION['strFilterApplications'];
	if($con->Query($query))
	{
?>
			<form action="export_process.php" method="post" target="_self">
				<p>
				<h3>Select Process to Export: </h3>
				<p>
					<b>Data Source : <?php echo $swdsn?> </b>
				<p>
				<select id='process[]' name='process[]' multiple ='multiple' style="width:50%" size="20">
<?php 					while($con->Fetch("workflows"))	
					{
?>
						<option value=<?php echo str_replace(" ", "%20",htmlentities($workflows_pk_workflow_id))?>><?php echo htmlentities($workflows_pk_workflow_id)?></option>
<?php 					}
?>
				</select>
				<p>
				<input type="submit" value="Export Process">
				<input type="hidden" id="<?php echo $prefix;?>key" name="<?php echo $prefix;?>key" value="<?php echo $strKey;?>"/>
			</form>
		</div>
<?php 
	}
	else
	{
		echo "Unable to query BPM_WORKFLOW table on DSN '".htmlentities($swdsn)."'</div>";
	}
?>


