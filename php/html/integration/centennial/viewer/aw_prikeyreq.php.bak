<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
$val_pri	=	 $HTTP_GET_VARS[compname];
$key_pri 	=	 'Client';
$col_unqid 	=	 'sysMachine';
$table 		=	 'Client';

include_once("../incl_odbc.php");

if (!$query) $query = "SELECT ".$key_pri." FROM ".$table." WHERE ".$col_unqid."='".$val_pri."'";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		$row = odbc_fetch_array($results);
		print '<variables><variable name="compid" value="'.(trim($row[$key_pri])).'"/></variables>'."\n";
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
