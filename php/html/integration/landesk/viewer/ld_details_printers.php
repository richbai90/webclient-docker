<?php 
$val_pri	=	 $HTTP_GET_VARS[compid];
$val_sec	=	 $HTTP_GET_VARS[unit];
$key_pri 	=	 'computer_idn';
$key_sec 	=	 'printer_idn';
$table 		=	 'printer';
$fields		=	 '*';
//$query 		= 	 "SELECT ".$fields." FROM ".$table." WHERE ".$key_pri."=".$val_pri." AND ".$key_sec."=".$val_sec;

include_once('ld_incl_details_twin.php');
?>
