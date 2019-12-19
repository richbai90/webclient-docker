<?php

//-- check for trusted key and username in php vars
include("../../../../php/_wcconfig.php");

?>
<html>
<head>
	<title>Supportworks Webclient <?php echo _VERSION;?></title>
	<style>
		*{font-size:10px;font-family:Verdana,sans-serif;letter-spacing:.03em;}
		td{font-size:10px}
	</style>
	<script src="../../../js/app.browser.js"></script>
	
	<script>
	
			var __boolInContext = true;
			if(window.dialogArguments!=undefined)
			{
				var info = window.dialogArguments;
			}
			else
			{
				var info = opener.__open_windows[window.name];
			}	

			var app = info.__app;
			var jqDoc = app.jqueryify(document); //-- so can use jquery

			if(app==undefined)
			{
				alert("This form has been opened outside of its intended context. Please contact your Administrator");
				window.close();
			}
	
	
	</script>
</head>
<body onunload="app._on_window_closed(window.name)">
	<br>
	<center><img src='../../../images/supportworks_esp_long.png'></center>
	<center><div style='width:98%;height:2px;line-height:2px;font-size:2px;background-color:#AFD2FF;margin-top:3px;margin-bottom:3px;'></div><center>
	<center>Copyright © <?php echo date('Y');?>. Hornbill Technologies. All Rights Reserved</center>
	<center><div style='width:95%;height:1px;line-height:1px;font-size:1px;background-color:#efefef;margin-top:3px;margin-bottom:3px;'></div></center>
	<table width="95%" border="0" align="center">
		<tr>
			<td width='110px'><b>Server Name :</b></td><td><?php echo $_SERVER['SERVER_NAME'];?></td>
		</tr>
		<tr>
			<td width='110px'><b>Client Browser :</b></td><td><script> document.write(BrowserDetect.browser + " " + BrowserDetect.version);</script></td>
		</tr>
		<tr>
			<td width='110px'><b>Client OS :</b></td><td><script> document.write(BrowserDetect.OS);</script></td>
		</tr>

	</table>
	<center><div style='width:95%;height:1px;line-height:1px;font-size:1px;background-color:#efefef;margin-top:3px;margin-bottom:3px;'></div></center>
	<table width="95%" border="0" align="center">
		<tr>
			<td><a href="http://www.hornbill.com" target="new">http://www.hornbill.com</a></td><td align="right"><a href="mailto:sales@hornbill.com">mailto:sales@hornbill.com</a></td>
		</tr>
	</table>

	
</body>
</html>