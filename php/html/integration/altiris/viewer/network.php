<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00001000) == 0)
{
	print "<br><br><br><br><center>Sorry, Altiris integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $description;
include_once("../incl_odbc.php");
$query = "SELECT * FROM computer WHERE computer_id='".$compid."'";
// Create a new connection object
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		?>
			
		


<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Devices</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<?php 
		if ($row = odbc_fetch_array($results))
		{?>
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Network Configuration &nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>

		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;Microsoft Networking&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Computer Name:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["computer_name"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Domain:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["msnet_dns_domain"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;NetBIOS Domain:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["domain_name"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Active Directory OU:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["msnet_domain_ou"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;Netware Settings&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Preferred Tree/Server:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["nw_pref_tree"]." ".$row["nw_pref_server"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;NDS User/Context:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["nw_user_name"]." ".$row["nw_nds_context"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;User Information&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Registered User:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["lic_os_user"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Organisation:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["lic_os_org"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td bgcolor="#CFE7FF"></td>
			<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;Product Key:&nbsp;</td>
			<td width="100%" bgcolor="#ffffff">&nbsp;<?php print trim($row["lic_os_key"]);?>&nbsp;</td>
		</tr>
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		
		<?php 
		}//end if record found
		else{?>
		<tr>
			<td></td>
			<td colspan="2" bgcolor="#ffffff">&nbsp;&nbsp;No information for this computer in the Altiris database</td>
			<td></td>
		</tr>
		<?php 
		}//end else record not found
		?>
	</table>
</body>
</html>
<?php 
	}//end if results
	else
	{
		print "No Rows Returned";
		exit;
	}
}//end if db connection
else
{
	print "No DB Connection";
	exit;
}
?>