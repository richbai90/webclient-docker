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
<!--<table border="0" cellpadding = "0" cellspacing="0">
	<tr>-->
<?php 
function FormatName($strUnformattedName)
{
	// This function will format names for those columns that do not have entries in the DiscPropertyDefs table,
	// based on a few simple rules.  It will chop zeroes off the end, and add spaces before capital letters that
	// do not appear to be part of an acronym.  This isn't perfect, but should return a little bit better formatting.
	//
	// In the case of the Software Overview pages, the Modified Date is displayed as "Collected Date", and the
	// FileModifiedDate is displayed as "Modified Date".  So take care of these instances first.
	//
	if ($strUnformattedName == "ModifiedDate")
	{
		return "Collection Date";
	}
	if ($strUnformattedName == "FileModifiedDate")
	{
		return "Modified Date";
	}
	
	while (strrpos($strUnformattedName,"0") == strlen($strUnformattedName)-1)
	{
		$strUnformattedName = substr($strUnformattedName,0,strlen($strUnformattedName)-1);
	}
	
	// if there is a capital letter, and there are not two caps in a row (indicating an acronym)
	// add a space before the first one.  Don't add a space before the first one.
	$strReturn = "";
	for ($i=0; $i<strlen($strUnformattedName); $i++)
	{
		if ((( substr($strUnformattedName,$i,1) >= "A") && ( substr($strUnformattedName,$i,1) <= "Z"))
			&&(( substr($strUnformattedName,$i-1,1) < "A") || ( substr($strUnformattedName,$i-1,1) > "Z")))
		{
			$strReturn .= " ";
		}
		$strReturn .= substr($strUnformattedName,$i,1);
	}
	return $strReturn;
}
$query = "SELECT DISTINCT INFORMATION_SCHEMA.COLUMNS.TABLE_NAME, INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME, DiscPropertyDefs.PropertyName FROM INFORMATION_SCHEMA.COLUMNS LEFT JOIN DiscPropertyDefs ON INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME = DiscPropertyDefs.ColumnName WHERE INFORMATION_SCHEMA.COLUMNS.TABLE_NAME IN  ('SoftwareInventory','SoftwareFilePath','SoftwareFile') ";

$arrDisplayNames = Array();
if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			// It appears that Property Name is the display name for columns.  Some columns
			// do not appear to have entries in this table.  For these columns, FormatName 
			// will return some basic formatting--chopping 0s off the end, and separating words
			if ($row["PropertyName"] !== NULL)
			{
				$arrDisplayNames[$row["COLUMN_NAME"]] = $row["PropertyName"];
			}
			else
			{
				$arrDisplayNames[$row["COLUMN_NAME"]] = FormatName($row["COLUMN_NAME"]);
			}
		}
	}
}
?>
<table border="0" cellpadding ="0" cellspacing="0" width="100%">
<tr>
	<td><table border="0" cellpadding ="0" cellspacing="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;<?php echo $strPageTitle?>&nbsp;</span></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
	</table></td>
</tr>
<tr>
	<td><table border="0" cellpadding = "0" cellspacing="0" width="100%">
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
<?php 
//display column headings
foreach ($arrDisplayNames as $key=>$value)
{
	// Don't print out Primary Key values
	 if ($key !== "FileId" && $key !== "FilePathId" && $key !== "ProductId" && $key !== "ClientId" && $key !== "TimeKey")
	{
		echo '<td background="images/title.gif" nowrap><span class="header1">'.$value.'</td><td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>';
	}
}
echo "</tr>";

if ($strProductName && $strProductName !== "")
{
	$query = "SELECT * FROM SoftwareInventory JOIN SoftwareFilePath ON SoftwareInventory.FilePathId = SoftwareFilePath.FilePathId JOIN SoftwareFile ON SoftwareFile.FileId = SoftwareInventory.FileId JOIN SoftwareProduct ON SoftwareProduct.ProductId = SoftwareInventory.ProductId WHERE SoftwareInventory.ClientId = ".$strCompID." AND SoftwareProduct.CompanyName = '".$strCompanyName."' AND SoftwareProduct.ProductName = '".$strProductName."' ORDER BY SoftwareProduct.ProductVersion";
}
else
{
	$query = "SELECT * FROM SoftwareInventory JOIN SoftwareFilePath ON SoftwareInventory.FilePathId = SoftwareFilePath.FilePathId JOIN SoftwareFile ON SoftwareFile.FileId = SoftwareInventory.FileId JOIN SoftwareProduct ON SoftwareProduct.ProductId = SoftwareInventory.ProductId WHERE SoftwareInventory.ClientId = ".$strCompID." AND SoftwareProduct.CompanyName = '".$strCompanyName."' ORDER BY SoftwareProduct.ProductName, SoftwareProduct.ProductVersion";
}

$nResults = 0;
if ($results = odbc_exec($msql,$query))
{
	while ($row = odbc_fetch_array($results))
	{
		$nResults ++;
		echo "<tr><td>";
						// if an image has been specified in the URL, print it here.
				if ($strImage)
				{
					echo '<img src="images/'.$strImage.'" valign="middle" vspace="1">';
				}
				$theIndex++;
		echo "</td>";
		$theIndex = 1;
		//print out each piece of data that we have display names for, except for the primary key data (such as MachineID)
		foreach ($arrDisplayNames as $key=>$value)
		{
			if ($key !== "FileId" && $key !== "FilePathId" && $key !== "ProductId" && $key !== "ClientId" && $key !== "TimeKey")
			{
				echo "<td nowrap>";
				echo $row[$key]."</td><td></td>";
			}//end if
		}//end foreach
		echo "</tr>";
	}//end while records returned

}//end if query is successful
echo '</table>';
if ($nResults == 0)
{
	echo "<center>There are no items to show in this view</center>";
}

?>

		</td>
	</tr>
</table>	

</body>
</html>