<?php
	//-- 2012.11.07
	//-- return data from swdata.swlist with passed in list id to be used within filter filter
	$inListID = $_POST["lid"];

	//-- check we have listid to filter by and check it for invalid chars (sql injection attempts)
	if($inListID!="" &&  _validate_url_param($inListID,"sqlparamstrict"))
	{
		$sqlDatabase = "swdata";
		$sqlCommand = "select value, display_name from swlists where list_id in (".prepareStringCommaDelimitedValues($inListID).") order by display_name asc";
	}
	else
	{
		echo generateCustomErrorString("-100","An invalid list type was specified. Please contact your Administrator.");
		exit(0);
	}

?>