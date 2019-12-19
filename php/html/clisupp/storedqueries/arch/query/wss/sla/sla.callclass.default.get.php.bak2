<?php
	// Takes Relationship ID, Relationship Type and Call Class
	// then returns default SLA ID, SLA Name & Priority
	// Available relationship types:
	// SERV: Services
	// SUBS: Service Subscriptions
	// CUST: Customers
	// DEPT: Departments
	// SITE: Sites
	// ORGN: Organisations

	$strRelID = $_POST['relid'];
	$strRelType = $_POST['reltype'];
	$strCallClass = $_POST['callclass'];

	if(	!_validate_url_param($strRelType,"sqlparamstrict") ||
			!_validate_url_param($strCallClass,"sqlparamstrict") ||
			!_validate_url_param($strRelID,"sqlparamstrict")){
		echo generateCustomErrorString("-303","Failed to retrieve Default SLA information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT fk_slad, fk_slad_name, fk_priority
									FROM itsm_sla_class_matrix
									WHERE fk_rel_id = '".PrepareForSQL($strRelID)."'
									AND reltype = '".PrepareForSQL($strRelType)."'
									AND callclass = '".PrepareForSQL($strCallClass)."'";
