<?php

	//-- passes in dd which is the application name i.e ITSM, ITSMF, DEFAULT
	//-- use this file to do any post processing on exported files

	//--
	//-- unlink stored queries cache file (which hold db schema info for stored queries) - as db schema may have changed since as part of restart
	@unlink("../clisupp/storedqueries/sqsstore.ser");
	@unlink("client/application.scripting.js");

	//-- check that core files exist (clissupp dependencies)
	@include('php/core/checkfiles.php');
	echo "ok";
?>