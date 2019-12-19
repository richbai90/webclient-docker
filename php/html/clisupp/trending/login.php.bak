<?php
?>
<!doctype html>
<html lang="en">
<head>  
	<meta charset="utf-8" />  
	<title>Dashboard - Login</title>  
	<link rel="stylesheet" href="css/base/jquery-ui.css" />  

	<script src="js/jquery-1.9.1.js"></script>  
	<script src="js/jquery-ui-1.10.1.min.js"></script>  

	<style>  


		*{
			font-family:"Trebuchet MS", "Helvetica", "Arial", "Verdana", "sans-serif";
			font-size:14px;
		}

		.w200
		{
			width:200px;
			border:1px solid #dedede;
		}

		.error
		{
			color:red;
		}
		form
		{
			position:absolute;
			top:50%;
			left:50%;
			width:300px;

			margin-top: -100px; /*set to a negative number 1/2 of your height*/
		    margin-left: -150px; /*set to a negative number 1/2 of your width*/

		}
		form table
		{
			border:1px solid #dedede;
			background-color:#efefef;
		}

		.title
		{
			border:1px solid #696969;
			border-bottom:0px;
			background-color:#696969;
			color:#ffffff;
			padding:3px;
			width:292px;
		}


	</style>  

	<script>


		$(document).ready(function()
		{

		});

	</script>
</head>
<body>

	<form method="post" action="index.php" >
		<input name="stl" type="hidden" value="1">
		<div class="title">Supportworks Dashboards</div>
		<table  width="300px" cellspacing="2" cellpadding="2">
			<tr>
				<td></td>
			</tr>
			<tr>
				<td align="right">Analyst ID :</td><td align="right"><input name="userid" type="text" class="w200" autofocus="autofocus"></td>
			</tr>
			<tr>
				<td align="right">Password :</td><td align="right"><input name="pwd" type="password" class="w200"></td>
			</tr>
			<tr>
				<td></td><td align="right"><input type="submit" value="Logon"></td>
			</tr>
			<tr>
				<td></td>
			</tr>
	
		</table>
	</form>
	<span class="error"><?php echo $errorMessage;?></span>
</body>
</html>
