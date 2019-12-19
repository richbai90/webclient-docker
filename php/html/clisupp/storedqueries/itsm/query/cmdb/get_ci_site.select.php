<?php

	//-- global.js cmdb get_ci_mes
	$strGetCol = $_POST['strGetCol'];
	$strTypeCol = $_POST['strTypeCol'];
	$strIDCol = $_POST['strIDCol'];
	$pk = $_POST['pk'];
	

	
	
	
	$sqlDatabase = "swdata";
	$sqlCommand = "select ".$strGetCol." from CONFIG_RELI where ".$strTypeCol." = 'ME->COMPANY' AND ".$strIDCol." = '".$pk."' AND FK_CHILD_TYPE NOT LIKE 'ME->%'";
	if(isset($_POST["rc"])) $sqlCommand .= " and CODE = '![rc]'";


?>