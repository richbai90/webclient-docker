<?php

	//Get all orgs
	$strSQL  = "SELECT pk_company_id AS keycol, companyname AS discol
              FROM company
							ORDER BY companyname ASC";
	$sqlDatabase = "swdata";
	$sqlCommand = $strSQL;
