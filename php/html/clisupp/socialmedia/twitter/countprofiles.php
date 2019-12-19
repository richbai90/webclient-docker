<?php 


		//-- Return no of profile records being managed
		//-- NOTE: This should be migrated to use the API calls rather than DB in future
		include_once('stdinclude.php');								//-- standard functions
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class

		//-- create our database connects to swdata and systemdb
		$swconn = new CSwDbConnection();
		$swconn->Connect(swdsn(), swuid(), swpwd());
					
		$strSQL = "select count(*) as profilecount from socmed_twitter_acts";
		
		$swconn->Query($strSQL);
		if($swconn->fetch())
		{
			echo $profilecount;
			exit;
		}
		
		echo 0; 
	?>