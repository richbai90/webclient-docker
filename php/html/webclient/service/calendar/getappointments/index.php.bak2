<?php

	//-- 15.10.2009
	//-- return calendar appointment information

	//-- expects vars:-
	//--				"calids" which is comman sep list of cal ids
	//--				"indates" which is formatted as "yyyy-mm-dd,yyyy-mm-dd,.." (a range of dats to brings back (14 at the most like exchange)
	//-- 
	//-- returns xml string

	include('../../../php/session.php');
	include('../../../php/db.helpers.php');

	//- -takes date yyyy-mm-dd hh:mm:ss and returns yyyymmdd
	function fd_yyyymmdd($strMySqlDate)
	{
		$arrInfo = explode(" ",$strMySqlDate);
		$arrInfo = explode("-",$arrInfo[0]);
		return  $arrInfo[0].$arrInfo[1].$arrInfo[2];
	}

	$strReturnData="<appointmentdata>";

	if($_POST['calids']!="")
	{
		//-- connect to calendar db
		$calDB = connectdb("sw_calendar",true);
		if($calDB)
		{
			//-- get calendar table names
			$strSelectCals = "select id ,display_name, table_name from calendars where id in(".$_POST['calids'].")";
			$result_id = _execute_xmlmc_sqlquery($strSelectCals,$calDB);
			if($result_id)
			{
				//-- create date filter
				$strDateFilter ="";
				$arrDays = explode(",",$_POST["indates"]);
				foreach($arrDays as $pos => $strDateValue)
				{
					if($strDateFilter!="")$strDateFilter.= " OR ";
					$strDateFilter .="start_time like '".$strDateValue."%'";
				}
	
				//- -for each calendar get appointments
				while ($rsCal = hsl_xmlmc_rowo($result_id)) 
				{ 
					$strReturnData.="<calendar id='".$rsCal->id."' displayname='".pfx($rsCal->display_name)."'>";

					//-- now for each cal get appointments

					$strCurrDay = "";
					$strSelectApps = "select * from ".$rsCal->table_name ." where " .$strDateFilter. " order by start_time asc";
					$appsresult_id = _execute_xmlmc_sqlquery($strSelectApps,$calDB);
					while ($rsApp = hsl_xmlmc_rowo($appsresult_id)) 
					{ 
						//-- start new day
						$strDay = fd_yyyymmdd($rsApp->start_time);
						if($strCurrDay!=$strDay)
						{
							if($strCurrDay!="")$strReturnData.="</day>";
							$strReturnData.= "<day yyyymmdd='".$strDay."'>";
							$strCurrDay=$strDay;
						}
						$strReturnData.="<appointment>";

							foreach($rsApp as $fieldName => $fieldValue)
							{
								$strReturnData.="<".$fieldName.">";
								$strReturnData.= pfx($fieldValue);
								$strReturnData.="</".$fieldName.">";
							}
						$strReturnData.="</appointment>";
					}
					if($strCurrDay!="")$strReturnData.="</day>";
					$strReturnData.="</calendar>";
				}
			} //-- bad result (likely no calids)
		}//- connect
		close_dbs();
	}
	$strReturnData.="</appointmentdata>";
	echo $strReturnData;
?>