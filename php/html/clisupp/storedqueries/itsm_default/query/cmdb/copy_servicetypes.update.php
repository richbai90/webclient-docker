<?php
	
	//-- move ct_profiles from one ci to another - used in global.js copy_servicetypes
	$sqlDatabase = "swdata";
	$sqlCommand = "update CT_PROFILES set FK_CONFIG_ITEM = ![intCopyToCIkey:numeric] where FK_CONFIG_ITEM =  ![intCopyFromCIKey:numeric]";

?>