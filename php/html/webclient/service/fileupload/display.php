<?php

	//-- 1.0.0
	//-- service/form/_filelist/getdata/index.php	

	//-- given a unc path get files in path and display in table
	//-- webserver has to have permission to access unc path

	//-- includes
	$excludeTokenCheck = true;
	include('../../php/session.php');


	//-- get path info
	$strUNC = $_POST["uncpath"];
	if($strUNC=="")
	{
		exit;
	}


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/display.php","START","SERVI");
	}	


	$strSqlList = "<table><colgroup><col/><col/><col/><col/></colgroup>"; //-- 3 cols (filename,  size, modified)
	$strDataRow = "";

	//-- output table data (same format as sqllist)	- replace any \ with /
	$strUNC = str_replace("\\","/",$strUNC);
	if($handle = @opendir($strUNC)) 
	{ 
		while($file = readdir($handle)) 
		{ 
			$filePath =$strUNC.'\\'.$file; 
			if(is_file($filePath)) 
			{

				//-- log activity
				if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
				{
					_wc_debug($filePath,"file","SERVI");
				}	

				$strDataRow = "<td dbvalue='sat' noWrap class='datatd'><div>". $file . "</div></td>";
				$strDataRow .= "<td dbvalue='sat' noWrap class='datatd'><div>". conversion_bytesize(filesize($filePath)) . "</div></td>";
				$strDataRow .= "<td dbvalue='sat' noWrap class='datatd'><div>". date ("Y/m/d H:i", filemtime($filePath)) . "</div></td>";
				$strDataRow .= "<td dbvalue='sat' noWrap class='datatd'><div>".stripslashes($filePath)."</div></td>";
				$strSqlList .= "<tr filepath='".$filePath."' onclick='top.sqllist_row_click(this,event);' ondblclick='top.sqllist_row_dblclick(this,event);'>" . $strDataRow . "</tr>";
			}
			clearstatcache(); 
		} 
		closedir($handle); 
		$strSqlList .= "</table>";
	} 
	else
	{
		//-- not valid
		$strSqlList .= "<div style='font-size:100%;text-align:center;color:red;'>The defined file path for this control is not accessible.<br>Please contact your Administrator.</div>";
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/display.php","END","SERVI");
	}	

	echo $strSqlList;
?>