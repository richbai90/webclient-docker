<?php 
// Custom Details Page
// Complex query with joins can't be handled in the same way as the rest but can still use the include for display!
$table = "softwarepackages"; // This is a dummy entry simply to make the lookup work
$query = "SELECT * FROM fileinfo,fileinfoinstance WHERE fileinfo.fileinfo_idn=fileinfoinstance.fileinfo_idn AND fileinfo.fileinfo_idn=".$HTTP_GET_VARS[unit]." AND fileinfoinstance.computer_idn=".$HTTP_GET_VARS[compid]." AND fileinfoinstance.fileinfoinstance_idn=".$HTTP_GET_VARS[unit2];

include_once('ld_incl_details_twin.php');
?>

