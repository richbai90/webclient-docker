<?php
$errors[1] = '<font color="#ff0000">Query produced a syntax error</font>';
$errors[2] = '<font color="#ff0000">No results found</font>';
$errors[3] = '<font color="#ff0000">No report specified</font>';
$errors[4] = '<font color="#ff0000">Database connection failed</font>';
$errors[5] = '<font color="#ff0000">Failed to create chart arguments in system table. You might not have permissions on the required table.</font>';
$errors[6] = '<font color="#ff0000">Report was not found.</font>';
$errors[7] = '<font color="#ff0000">Failed to modify the report chart structure in xmlwrite file.</font>';
?>
<!--
<html>
<head>
	<title>HTML Reports</title>
	<LINK REL=StyleSheet HREF="styles/mainstyles.php" RTYPE="text/css">
-->
<script language="JavaScript">

function show_query(){
	document.getElementById("qrybox").innerHTML = "<?php echo str_replace('"','\\"',htmlentities($query))?>";
	}



</script>
<!--
</head>
<body background="images/gradient.gif" topmargin="0" leftmargin="0" rightmargin="0" bottommargin="0" marginheight="0" marginwidth="0">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
	<td align="right" bgcolor="#dee8fe"><br /><br /><img src="images/html_reports.gif" width="160" height="30" alt="" border="0" hspace="0" vspace="0"></td>
</tr>
</table>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
  </tr>
  <tr> 
    <td width="22" bgcolor="#ccd4ee"><img src="images/space.gif" width="22" height="25"></td>
    <td bgcolor="#ccd4ee" align="left" valign="middle" class="company" width="100%"><b>Sorry!</b></span></td>
  </tr>
  <tr>
  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
  </tr>
  <tr>
  	<td colspan="2" align="right">
		<table width="90%">
		<tr>
			<td align="left">
			-->
			<b>An error has occured because:</b> <?php echo $errors[$error]?>
			<!--</td>
		</tr>
-->
<?php
if ($query) print '<br /><br /><b><a href="javascript:show_query();">View Query</a></b><br /><br />';
?>
<!--		<tr>
			<td align="left">-->
			<br /><div id="qrybox">&nbsp;</div><br /><br />
			<!--</td>
		</tr>
		</table>
	</td>
  </tr>
</table>

</body>
</html>

-->


