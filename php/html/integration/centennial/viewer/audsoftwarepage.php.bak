<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $manuid;
global $auditid;
global $displayname;
global $auditdate;
include_once("../incl_odbc.php");
//function to turn long numbers of bytes into megs and gigs
function embify($inputstring){
	$inputstring=str_replace(",","",$inputstring);
	$inputstring=$inputstring+0;
	if ($inputstring < 1024){
		return $inputstring." bytes";
	}
	else{
		if ($inputstring<1048576){
			return (sprintf("%.2f",($inputstring/1024))." KB");
		}
		else{
			if($inputstring<1073741824){
				return (sprintf("%.2f",($inputstring/1048576))." MB");
			}
			else{
				return (sprintf("%.2f",($inputstring/1073741824))." GB");
			}
		}
		
	}
}//end embify function
// Create a new connection object

if (!$auditdate){
	$query = "SELECT *, SRDProduct.Name AS FileName, Manufacturer.Name AS ManuName, ProductType.Name AS ProdName FROM SoftwareRecognisedPrimary LEFT JOIN SRDProduct ON SoftwareRecognisedPrimary.SRDProduct=SRDProduct.SRDProduct LEFT JOIN Manufacturer ON SoftwareRecognisedPrimary.Manufacturer=Manufacturer.Manufacturer LEFT JOIN ProductType ON SoftwareRecognisedPrimary.ProductType=ProductType.ProductType LEFT JOIN SRDVersion ON SoftwareRecognisedPrimary.SRDVersion=SRDVersion.SRDVersion LEFT JOIN defUsage ON SoftwareRecognisedPrimary.Frequency=defUsage.ID WHERE SoftwareRecognisedPrimary.Client='".$compid."' AND SoftwareRecognisedPrimary.Manufacturer='".$manuid."' ORDER BY SoftwareRecognisedPrimary.ProductType";
}//end if this page is not being called to display the results of an audit
else{
	switch ($displayname){
		case "Primary Software (Added) by Manufacturer":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=1 AND Discovered='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=1 ORDER BY Product";
			$addrem = "Added";
			break;
		case "Unrecognised Primary Software (Added)":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=1 AND Discovered='".$auditid."' AND SoftwareAud.Recognised=0 ORDER BY Product";
			$addrem = "Added";
			break;	
		case "Secondary Software (Added) by Manufacturer":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=0 AND Discovered='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=1 ORDER BY Product";
			$addrem = "Added";
			break;
		case "Unrecognised Secondary Software (Added)":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=0 AND Discovered='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=0 ORDER BY Product";
			$addrem = "Added";
			break;
		case "Primary Software (Removed) by Manufacturer":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=1 AND Removed='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=1 ORDER BY Product";
			$addrem = "Removed";
			break;
		case "Unrecognised Primary Software (Removed)":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=1 AND Removed='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=0 ORDER BY Product";
			$addrem = "Removed";
			break;
		case "Secondary Software (Removed) by Manufacturer":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=0 AND Removed='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=1 ORDER BY Product";
			$addrem = "Removed";
			break;
		case "Unrecognised Secondary Software (Removed)":
			$query = "SELECT *, Manufacturer.Name as ManuName FROM SoftwareAud LEFT JOIN SoftwareEmbedded ON SoftwareAud.SoftwareEmbedded=SoftwareEmbedded.SoftwareEmbedded LEFT JOIN Manufacturer ON SoftwareEmbedded.ManufacturerID = Manufacturer.Manufacturer LEFT JOIN defUsage ON SoftwareAud.Frequency=defUsage.ID WHERE KeyBit=0 AND Removed='".$auditid."' AND Manufacturer.Manufacturer='".$manuid."' AND SoftwareAud.Recognised=0 ORDER BY Product";
			$addrem = "Removed";
			break;
		default:
			$query = "SELECT *, SRDProduct.Name AS FileName, Manufacturer.Name AS ManuName, ProductType.Name AS ProdName FROM SoftwareRecognisedPrimary LEFT JOIN SRDProduct ON SoftwareRecognisedPrimary.SRDProduct=SRDProduct.SRDProduct LEFT JOIN Manufacturer ON SoftwareRecognisedPrimary.Manufacturer=Manufacturer.Manufacturer LEFT JOIN ProductType ON SoftwareRecognisedPrimary.ProductType=ProductType.ProductType LEFT JOIN SRDVersion ON SoftwareRecognisedPrimary.SRDVersion=SRDVersion.SRDVersion LEFT JOIN defUsage ON SoftwareRecognisedPrimary.Frequency=defUsage.ID WHERE SoftwareRecognisedPrimary.Client='".$compid."' AND SoftwareRecognisedPrimary.Manufacturer='".$manuid."' ORDER BY SoftwareRecognisedPrimary.ProductType";
			$addrem = "Removed";
			break;
	}//end switch/case
}//end else this page is being called as the result of an audit
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		?>
			
<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Hardware</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap colspan="9"><span class="header1">&nbsp;&nbsp;Software <?php echo $addrem?> on the <?php echo $auditdate?> Audit&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		<tr>
			<td background="images/title.gif" nowrap width="1"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Software Name&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;Manufacturer&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap ><span class="header1">&nbsp;Size&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap ><span class="header1">&nbsp;Frequency&nbsp;</span></td>
			<td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap ><span class="header1">&nbsp;LastUsed&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<?php 
		while ($row = odbc_fetch_array($results))
		{?>
		
		<tr>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;&nbsp;<?php print trim($row["Product"])." ".trim($row["Version"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;<?php print trim($row["ManuName"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;<?php print embify($row["Size"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap>&nbsp;<?php print trim($row["defFrequency"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
			<td bgcolor="#ffffff" align="left" nowrap width="100%">&nbsp;<?php print trim($row["LastUsed"]);?>&nbsp;</td>
			<td bgcolor="#ffffff"></td>
		</tr>
		
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
		<?php 
		}
		?>
	</table>
</body>
</html>
<?php 
	}
	else
	{
		print "No Rows Returned";
		exit;
	}
}
else
{
	print "No DB Connection";
	exit;
}
?>