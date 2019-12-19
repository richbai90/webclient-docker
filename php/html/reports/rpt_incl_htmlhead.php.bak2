<?php

	include('_css_switcher.php');

?>
<html>
<head>
<title>HTML Reports</title>
<style type="text/css">
<!--


*{
	font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
	font-size:12px;
}

body {
	overflow:auto;
	margin:0px;
	}


		<?php

		if($_GET["webclientreporting"]=="1")
		{
		?>
			.reportheader
			{
			}

			.title 
			{
				font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;

				border-width:0px 0px 1px 0px;
				border-style:solid solid solid solid;
				border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;

				padding:3px;
				font-size:12px;
				width:100%;
				color:#696969;

				filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFFFFF', endColorstr='#E1E1E1'); 
				background: -webkit-gradient(linear, left top, left bottom, from(#FFFFFF), to(#E1E1E1)); 
				background: -moz-linear-gradient(top,  #FFFFFF,  #E1E1E1);
			}


		<?php
		}
		else
		{
		?>
			.reportheader
			{
				width:100%;
				height:25px;
				display:block;
				background-color:#B2B7C2;
			}

			.title 
			{
				font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;
				font-size : 11px;

				padding:2px 2px 2px 4px;
				width:100%;
				color : #3C3C3C;

				filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#F1F1F1', endColorstr='#D8D8D8');
				background: -webkit-gradient(linear, left top, left bottom, from(#B8BAC2), to(#7B8395)); 
				background: -moz-linear-gradient(top,  #B8BAC2,  #7B8395); 

				border-top:1px solid #ffffff;
				border-bottom:1px solid #B2B7C2;

				display:block;
			}

		<?php
		}
		?>

		.header
		{
			background:#ffffff;
			background-color:#ffffff;
			font-size:12px;
		}

		.header2
		{
			background-color:none;
			font-size:12px;
			font-weight:normal;
		}

		.surveyname 
		{
			font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;
			font-size : 8px; 
		}

		.divider 
		{
			background-color:#D0D3D7; color:#D0D3D7; border:0; height:1;
		}
		.colhead 
		{
			
			font-weight:bold;
			font-size : 10;
		}
		.data 
		{
			
			font-size : 9;
		}
		.datasum 
		{
			
			font-size : 9;
		}
		.footer 
		{
			color : #808080;
			font-size : 10;
		}

		a {color : #404060;}
		a:hover {color : #A0A0C0;}
		td { color: #B4B4B4; font-size: 12px;}

		.data
		{
			color: #B4B4B4; font-size: 12px;
		}


//-->
</style>

<LINK REL=StyleSheet HREF="styles/<?php echo $cssFile;?>" RTYPE="text/css">

</head>
<body background="" topmargin="0" leftmargin="0" rightmargin="0" bottommargin="0" marginheight="0" marginwidth="0">
<div class="reportheader"></div>
<div class="title">Report : <?php echo $report_title?></div>
<br>