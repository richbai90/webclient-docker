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
global $strTableName;
?>
<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title><?php echo $strPageTitle?></title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
<?php 
//function to turn long numbers of bytes into megs and gigs
function embify($strInput, $strUnits)
{
	if (!$strInput)
	{
		return "";
	}
	switch ($strUnits)
	{
		case "KILOBYTES":
			$strUnits = "KB";
		break;
		case "MEGABYTES":
			$strUnits = "MB";
		break;
	}
	$strInput=str_replace(",","",$strInput);
	$strInput=$strInput+0;
	if ($strInput < 1024)
	{
		return $strInput." ".$strUnits;
	}
	else
	{
		if ($strInput<1048576)
		{
			$strTempNum =  (sprintf("%.2f",($strInput/1024)));
			if ($strUnits == "KB")
			{
				return $strTempNum." MB";
			}
			else
			{
				return $strTempNum." GB";
			}
		}
		else{
			if($strInput<1073741824){
				$strTempNum =  (sprintf("%.2f",($strInput/1048576)));
				if ($strUnits == "KB")
				{
					return $strUnits." GB";
				}
				else
				{
					return $strUnits." TB";
				}
			}
		}
	}
}//end embify function

function FormatName($strUnformattedName)
{
	// This function will format names for those columns that do not have entries in the DiscPropertyDefs table,
	// based on a few simple rules.  It will chop zeroes off the end, and add spaces before capital letters that
	// do not appear to be part of an acronym.  This isn't perfect, but should return a little bit better formatting.
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

function FormatData($strString, $strDataType, $strUnits)
{
	// This function will format the data according to a specific set of rules.  If it is a datetime,
	// for example, the function will return an appropriately-formatted date string.
	if (strtoupper($strUnits) == "MEGABYTES" || strtoupper($strUnits) == "KILOBYTES")
	{
		return embify($strString,strtoupper($strUnits));
	}
	switch ($strDataType)
	{
		case "datetime":
			$tempTime = mktime(
				substr($strString,11,2),//hour
				substr($strString,14,2),//minute
				substr($strString,17,2),//second
				substr($strString,5,2),//month
				substr($strString,8,2),//day
				substr($strString,0,4)//year
				);
			//return the date based on local settings
			return strftime("%c",$tempTime);
		break;
		default:
			return $strString;
		break;
	}
}

// Retrieve the column names of the table from the Information Schema Columns table.  This is an MSSQL-specific
// table.  For this to work in mySQL, you would have to use the command "SHOW COLUMNS IN " .$strTableName
//
// It appears (MS does not provide a schema for this database) that display names for columns are stored in
// DiscPropertyDefs.PropertyName  This next bit of code does a join on the on the Information Schema/DiscPropertyDefs
// tables, which will obtain Display Names for any columns for which there are entries, and store them in an array.
// If there is no entry, a few simple formatting rules are applied, using the FormatName function.

$query = "SELECT DISTINCT 
			INFORMATION_SCHEMA.COLUMNS.TABLE_NAME, 
			INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME, 
			INFORMATION_SCHEMA.COLUMNS.DATA_TYPE, 
			DiscPropertyDefs.PropertyName, 
			InventoryClassProperty.Units,
			SMSProcParameters.Position
				FROM 
					INFORMATION_SCHEMA.COLUMNS 	LEFT JOIN	GroupMap
												ON			INFORMATION_SCHEMA.COLUMNS.TABLE_NAME = GroupMap.SpecificTableName
												LEFT JOIN	AttributeMap
												ON			(AttributeMap.ColumnName = INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME
												AND			AttributeMap.GroupKey = GroupMap.GroupKey)
												LEFT JOIN	InventoryClass
												ON			InventoryClass.SMSClassID = GroupMap.GroupClass
												LEFT JOIN	InventoryClassProperty
												ON			(InventoryClassProperty.ClassID = InventoryClass.ClassID
												AND			InventoryClassProperty.PropertyName = AttributeMap.AttributeName)
												LEFT JOIN	DiscPropertyDefs
												ON			DiscPropertyDefs.ColumnName = INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME
												LEFT JOIN	SMSProcedures
												ON			ProcedureName = 'd'+INFORMATION_SCHEMA.COLUMNS.TABLE_NAME
												LEFT JOIN	SMSProcParameters
												ON			(SMSProcParameters.SMSProcedureID = SMSProcedures.SMSProcedureID
												AND			SMSProcParameters.ParameterName = INFORMATION_SCHEMA.COLUMNS.COLUMN_NAME)
												
												WHERE
												(INFORMATION_SCHEMA.COLUMNS.TABLE_NAME = '".$strTableName."' ) ";

$arrColumnNames = Array();
$arrDisplayNames = Array();
$arrDataTypes = Array();
$arrDataUnits = Array();

if ($msql = odbc_connect($strDB, $strUser, $strPassword))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			// It appears that Property Name is the display name for columns.  Some columns
			// do not appear to have entries in this table.  For these columns, FormatName 
			// will return some basic formatting--chopping 0s off the end, and separating words
			$arrDataUnits[$row["Position"]] = $row["Units"];
			$arrColumnNames[$row["Position"]] = $row["COLUMN_NAME"];
			if ($row["PropertyName"] !== NULL)
			{
				$arrDisplayNames[$row["Position"]] = $row["PropertyName"];
			}
			else
			{
				$arrDisplayNames[$row["Position"]] = FormatName($row["COLUMN_NAME"]);
			}
			$arrDataTypes[$row["Position"]] = $row["DATA_TYPE"];
			$arrDataUnits[$row["Position"]] = $row["Units"];
			$arrDataOrder[$row["Position"]] = $row["Position"];
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
	<td>
<?php 
// alternate views based on the $view variable set in either incl_odbc.php or passed to the page in config.xml.
// the following code is for the list view:

if ($view == "list")
{
?><table border="0" cellpadding = "0" cellspacing="0" width="100%">
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
<?php 
	// display the column headings (Display names for columns)
	foreach ($arrDisplayNames as $key=>$value)
	{
		// Don't print out Primary Key values
		if ($arrColumnNames[$key] !== "MachineID" && $arrColumnNames[$key] !== "InstanceKey" && $arrColumnNames[$key] !== "RevisionID" && $arrColumnNames[$key] !== "AgentID" && $arrColumnNames[$key] !== "TimeKey")
		{
			echo '<td background="images/title.gif" nowrap><span class="header1">'.$value.'</td><td background="images/title.gif" width="3" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>';
		}
	}
	echo "</tr>";


	$query = "SELECT * FROM ".$strTableName." WHERE MachineID = ".$strCompID."";
	// if the page has been passed a TimeKey (this is a history file, and it is intended that we only print out
	// the history for one particular audit), also filter based on this criterion.
	if ($strTimeKey)
	{
		$query .= "AND TimeKey = '".$strTimeKey."'";
	}//end if

	// print out each record
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
			echo "</td>";
		
			//print out each piece of data that we have display names for, except for the primary key data (such as MachineID)
			foreach ($arrDisplayNames as $key=>$value)
			{
				if ($arrColumnNames[$key] !== "MachineID" && $arrColumnNames[$key] !== "InstanceKey" && $arrColumnNames[$key] !== "RevisionID" && $arrColumnNames[$key] !== "AgentID" && $arrColumnNames[$key] !== "TimeKey")
				{
					echo "<td nowrap>";
					echo FormatData($row[$arrColumnNames[$key]], $arrDataTypes[$key],$arrDataUnits[$key])."</td><td></td>";
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
}//end if $view = "list"
else
{
	// in this case, $view = "table"
	echo '<table border="0" cellspacing="0" cellpadding="0" width="100%">';
	$query = "SELECT * FROM ".$strTableName." WHERE MachineID = ".$strCompID."";
	// if the page has been passed a TimeKey (this is a history file, and it is intended that we only print out
	// the history for one particular audit), also filter based on this criterion.
	if ($strTimeKey)
	{
		$query .= "AND TimeKey = '".$strTimeKey."'";
	}//end if
	// print out each record
	$nResults = 0;
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			$nResults ++;
		?>
		<tr>
			<td background="images/title.gif" nowrap><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap colspan="2"><span class="header1">&nbsp;&nbsp;<?php 
			if (array_key_exists("DisplayName", $row))
			{
				echo $row["DisplayName"];
			}
			elseif (array_key_exists("DisplayName0", $row))
			{
				echo $row["DisplayName0"];
			}
			elseif (array_key_exists("DisplayName00", $row))
			{
				echo $row["DisplayName00"];
			}
			elseif (array_key_exists("Name", $row))
			{
				echo $row["Name"];
			}
			elseif (array_key_exists("Name0", $row))
			{
				echo $row["Name0"];
			}
			elseif (array_key_exists("Name00", $row))
			{
				echo $row["Name00"];
			}
			elseif (array_key_exists("Description", $row))
			{
				echo $row["Description"];
			}
			elseif (array_key_exists("Description0", $row))
			{
				echo $row["Description0"];
			}
			elseif (array_key_exists("Description00", $row))
			{
				echo $row["Description00"];
			}
			
			?>&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<?php 
			foreach ($arrColumnNames as $key=>$value)
			{
				if ($arrColumnNames[$key] !== "MachineID" && $arrColumnNames[$key] !== "InstanceKey" && $arrColumnNames[$key] !== "RevisionID" && $arrColumnNames[$key] !== "AgentID" && $arrColumnNames[$key] !== "TimeKey")
				{
			?>
			<tr>
				<td bgcolor="#CFE7FF"></td>
				<td bgcolor="#CFE7FF" align="right" nowrap>&nbsp;&nbsp;<?php echo $arrDisplayNames[$key]?>&nbsp;</td>
				<td width="100%" bgcolor="#ffffff">&nbsp;<?php echo FormatData($row[$arrColumnNames[$key]], $arrDataTypes[$key],$arrDataUnits[$key])?>&nbsp;</td>
			</tr>
			<?php 
				}
			}//end foreach
			?>
		<tr>
			<td colspan="4" bgcolor="#EFF7FF"><img src="images/space.gif" height="15" width="5" alt=""></td>
		</tr>
			<?php 
		}//end while
	}//end if results returned
	if ($nResults == 0)
	{
	?>
	<tr>
			<td colspan="4" bgcolor="#EFF7FF"><center>There are no items to show in this view</center></td>
		</tr>
	<?php 
	}
?>
	

	</table>
<?php 
}//end else $view = "table"
?>

		</td>
	</tr>
</table>	

</body>
</html>