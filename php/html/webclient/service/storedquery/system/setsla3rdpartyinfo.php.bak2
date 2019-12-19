<?php
	//--
	//-- update  3rd party supplier (used by global.SetSla3rdPartyInfo)
	$company = prepareForSql($_POST['company']);
	$name = prepareForSql($_POST['name']);
	$tel = prepareForSql($_POST['tel']);
	$email = prepareForSql($_POST['email']);
	$notes = prepareForSql($_POST['notes']);
	$validfrom = prepareForSql($_POST['validfrom']);
	$validto = prepareForSql($_POST['validto']);
	$options = prepareForSql($_POST['options']);
	$slaid = prepareForSql($_POST['slaid']);

	if($slaid=="")
	{
		echo generateCustomErrorString("-666","The slaid field was not passed into the method call. Please contact your Administrator.");
		exit(0);
	}
	else if($options=="")
	{
		echo generateCustomErrorString("-666","The tpOptions field was not passed into the method call. Please contact your Administrator.");
		exit(0);
	}
	else if($validto=="")
	{
		echo generateCustomErrorString("-666","The tpexpireend field was not passed into the method call. Please contact your Administrator.");
		exit(0);
	}
	else if($validfrom=="")
	{
		echo generateCustomErrorString("-666","The tpValidFrom field was not passed into the method call. Please contact your Administrator.");
		exit(0);
	}
	else if($company=="")
	{
		echo generateCustomErrorString("-666","The tpcompany field was not passed into the method call. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "update system_sla set tpcompany='".$company."', tpcontactname='".$name."',tpcontacttel='".$tel."',tpcontactemail='".$email."',tpnotes='".$notes."',tpValidFrom=".$validfrom.",tpexpireend=".$validto.",tpOptions=".$options." where slaid=".$slaid;

?>