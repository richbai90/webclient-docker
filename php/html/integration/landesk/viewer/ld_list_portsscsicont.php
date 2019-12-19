<?php 
$val_pri	=	 $HTTP_GET_VARS[compid];
$key_pri 	=	 'computer_idn';
$col_label 	= 	 'controlnum';
$col_unqid 	=	 'scsicontrol_idn';
$table 		=	 'scsicontrol';
#$query = "SELECT ".$col_unqid.",".$col_label." FROM ".$table." WHERE ".$key_pri."=".$val_pri." ORDER BY ".$col_label;

include_once('ld_incl_list_twin.php');
?>
