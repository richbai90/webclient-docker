<?php 	//--
	//-- login page for supportworks smartphone client

	//-- include processor
	$_SESSION['smart_path'] = getcwd();
	$_errormsg = $_POST['_exiterror'];
	include("client/application.processor.php");

	if($_errormsg=="")
		$_errormsg = $_SESSION['_exiterror'];

	//-- if aid is already set then it means we are logging out
	if(isset($_SESSION['aid']))
	{
		//-- logout
		include('service/session/logout.php');
		$tmpVar = $_SESSION['logintime'];
	}
	unset($_SESSION['_exiterror']);
	unset($_POST['_exiterror']);

    $strRandVals = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $strLoginKey = "";
    for ($i = 1; $i <= 32; $i++) {
        $strLoginKey .= substr($strRandVals, rand(0,(strlen($strRandVals) - 1)), 1);
    }
	$_SESSION['loginkey'] = $strLoginKey;
?>
<html>
	<head>
		<title>Hornbill Mobile Portal (ITSM)</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes" />
	</head>
<style>
	body
	{
		font-family:"Trebuchet MS";
		color:#808080;
		background-color:#ffffff;
		padding:0px 0px 0px 0px;
		margin:0px;
		overflow:hidden;
	}
	input
	{
		width:150px;
		border:1px solid #dfdfdf;
	}
	.sitetitle
	{
		font-weight:bold;
		text-align:center;
		color:#ffffff;
		background-color:#3B5998;
		background-image: url("client/_system/images/banner_bg.jpg");
		background-repeat: repeat-x; 
	}
	.logonimg
	{
		border-style:none;
		cursor:pointer;
	}
</style>
<script>
	function _process_login()
	{
		document.forms['frmL'].submit();
	}
</script>
<!-- js to support fusion charts graphing -->
<script language="JavaScript" src="../clisupp/fce/FusionCharts.js"></script>
<script src="client/_system/mobile.js"></script>
<body>
	<form name='frmL' target='_self' action='index.php' method='post'>
		<table border='0' width="100%" height="42px" cellspacing='0' cellpadding='0' >
			<tr>
				<td class='sitetitle' height="42px" noWrap valign='middle'>Supportworks Mobile</td>
			</tr>
		</table>
		<table align="center" width="170px">
			<tr>
				<td style='color:red;' align="left"><?php echo htmlentities($_errormsg);?></td>
			</tr>
			<tr>
				<td align="left">User ID:</td>
				<tr></tr><td><input type='text' name='_a' AUTOCOMPLETE="OFF"></td>
			</tr>
			<tr>
				<td align="left">Password:</td></tr><tr><td><input type='password' name='_b' AUTOCOMPLETE="OFF"></td>
			</tr>
			<tr>
				<td></td>
			</tr>
			<tr>
				<td align='center'><div title="Logon" onclick="_process_login();" style="height:23px;cursor:pointer;border: .1em solid #DFDFDF;width:90px;vertical-align:middle;"><div style="width:50%;float:left;">&nbsp;Logon</div><img style="float:right; margin:1px 0 0;" src="client/_system/images/hornbill-logo-footer2.gif" class="logonimg" ></img><div></td>
			</tr>
		</table>
		<input type='hidden' name='_action' value="_login">
		<input type='hidden' name='_lgnk' value="<?php echo $strLoginKey;?>">
		<input type='hidden' name='_definitionfilepath' id='_definitionfilepath' value="<?php echo _HOME;?>">
	</form>
</body>
</html>
