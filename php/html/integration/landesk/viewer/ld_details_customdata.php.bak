<?php 
$val_pri	=	 $HTTP_GET_VARS[compid];
$key_pri 	=	 'computer_idn';
$field1 	=	 'def';
$field2 	=	 'datastring';
$table 		=	 'unmodeleddata';
$fields		=	 '*';
$query 		= 	 "SELECT metaattributes.def,unmodeleddata.datastring FROM unmodeleddata, metaobjattrrelations, metaattributes WHERE unmodeleddata.".$key_pri." = ".$val_pri." AND unmodeleddata.metaobjattrrelations_idn = metaobjattrrelations.metaobjattrrelations_idn  AND metaobjattrrelations.metaattributes_idn = metaattributes.metaattributes_idn ORDER BY metaattributes.def";

include_once('ld_incl_details_mrow_single.php');
?>
