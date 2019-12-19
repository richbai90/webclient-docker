<?php 
$val_pri	=	 $HTTP_GET_VARS[compname];
$key_pri 	=	 'computer_idn';
$col_unqid 	=	 'devicename';
$table 		=	 'computer';

include_once("../ld_incl_odbc.php");

if (!$query) $query = "SELECT ".$key_pri." FROM ".$table." WHERE ".$col_unqid."='".$val_pri."'";
if ($msql = odbc_connect($odbc_dsn, $odbc_usr, $odbc_pwd))
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
