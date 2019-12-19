<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000100) == 0)
{
	print "<br><br><br><br><center>Sorry, LANDesk integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
$query = "SELECT seqkey FROM manufacturer WHERE computer_idn=".$HTTP_GET_VARS[compid];
if ($msql = odbc_connect("LANDesk","landesk","landesk"))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<a href="ld_details_biosmanufacturer.php?compid='.$HTTP_GET_VARS[compid].'&unit='.(trim($row[seqkey])).'">Manufacturer - '.(trim($row[seqkey])).'</a><br>'."\n";
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