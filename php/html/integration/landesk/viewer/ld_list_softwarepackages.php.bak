<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000100) == 0)
{
	print "<br><br><br><br><center>Sorry, LANDesk integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
// Custom Query Page
$query = "SELECT fileinfo.title,fileinfo.fileinfo_idn,fileinfo.version,fileinfoinstance.fileinfoinstance_idn FROM fileinfo,fileinfoinstance WHERE fileinfo.fileinfo_idn = fileinfoinstance.fileinfo_idn AND fileinfoinstance.computer_idn = ".$HTTP_GET_VARS[compid]." ORDER BY fileinfo.title";
if ($msql = odbc_connect("LANDesk","landesk","landesk"))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			$name = (trim($row[title])).' ('.(trim($row[version])).')';
			if ($name == $lastname)
			{
				if (strlen($counter)) $counter++;
				else $counter = 0;
			}
			else $counter = '';
			$lastname = $name;
			if (strlen($counter)) $name .= ' - '.$counter;
			print '<name="'.$name.'"><unit="'.(trim($row[fileinfo_idn])).'"><unit2="'.(trim($row[fileinfoinstance_idn])).'">'."\n";
		}
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