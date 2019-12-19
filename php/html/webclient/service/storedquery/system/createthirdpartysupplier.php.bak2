<?php
	//--
	//-- create 3rd party supplier (used by global.Create3rdPartySupplier)
	$analystid = prepareForSql($_POST['analystid']);
	$name = prepareForSql($_POST['name']);
	$tel = prepareForSql($_POST['tel']);
	$email = prepareForSql($_POST['email']);

	$sqlDatabase = "sw_systemdb";
	$sqlCommand  = "insert into swanalysts (analystid,name,class,supportgroup,contacta,contacte) values ('".$analystid."','".$name."',3,'_THIRDPARTY','".$tel."','".$email."')";
?>