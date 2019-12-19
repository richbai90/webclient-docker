<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000100) == 0)
{
	print "<br><br><br><br><center>Sorry, LANDesk integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
$query = "SELECT computer_idn,displayname FROM computer ORDER BY displayname";
if ($msql = odbc_connect("LANDesk","landesk","landesk"))
{
	if ($results = odbc_exec($msql,$query))
	{
		print "<list>\n";
		while ($row = odbc_fetch_array($results))
		{
			print "<item>\n".'<compid="'.$row[computer_idn].'"/><name="'.(trim($row[displayname])).'"/>'."\n</item>\n";
		}
		print "</list>\n";
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