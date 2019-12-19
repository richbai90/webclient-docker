<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000400) == 0)
{
	print "<br><br><br><br><center>Sorry, Micrsoft SMS integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
// This file will return a table of all records in the named database table 
// for the named computer

include_once("../incl_odbc.php");
global $strCompID;
global $strCompanyName;
global $strProductName;
?>
<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Hardware</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">

<table border="0" cellpadding ="0" cellspacing="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;<?php echo $strPageTitle?>&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<tr>
			<td colspan=4><center>Click on an item in the tree browser to the left to display details for that item.</center>
			</td>
		</tr>
	</table>
</body>
</html>