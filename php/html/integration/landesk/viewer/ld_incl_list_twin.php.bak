<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000100) == 0)
{
	print "<br><br><br><br><center>Sorry, LANDesk integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
include_once("../ld_incl_odbc.php");
if (!$query) $query = "SELECT ".$col_unqid.",".$col_label." FROM ".$table." WHERE ".$key_pri."=".$val_pri." ORDER BY ".$col_label;
if ($msql = odbc_connect($odbc_dsn, $odbc_usr, $odbc_pwd))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			print '<name="'.(trim($row[$col_label])).'"><unit="'.(trim($row[$col_unqid])).'">'."\n";
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