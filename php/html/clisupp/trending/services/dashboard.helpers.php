<?php


	//--
	//-- create widget markup
	function widget_markup($wid,$strTitle,$type,$mode,$dbid,$drilldown = 0,$download = 0)
	{
		$uid = "w_" . $wid;
		$strDrillDownBtn = ($drilldown==1)?'<button class="btn-drill-down">Show drill down data</button>':"";
		$strDrillDownBtn .= ($download==1)?'<button class="btn-csv-download">Download csv data</button>':"";

		return '<div class="portlet" drilldown="'.$drilldown.'" wid="'.$wid.'" type="'.$type.'" dbid="'.$dbid.'"><div class="portlet-header">'.$strTitle.$strDrillDownBtn.'</div><div class="portlet-content" active="y" id="'.$uid.'" wid="'.$wid.'" dbid="'.$dbid.'" mode="'.$mode.'" wtype="'.$type.'"></div></div>';
	}

	function get_widget_node($widgetId,$boolXmlDef = true)
	{
		$rs = new SqlQuery();
		$rs->Query("select h_definition from h_dashboard_widgets where h_widget_id = " . pfs($widgetId),"sw_systemdb");
		if($rs->Fetch())
		{
			if($boolXmlDef)
			{
				return domxml_open_mem($rs->GetValueAsString("h_definition"));
			}
			else
			{
				return $rs;
			}
		}
		return null;
	}

	function get_widgetrecord($intID,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_widgets where h_widget_id = ".pfs($intID);
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}

	function delete_widget($widID)
	{
		$rs = new SqlQuery();
		if($rs->Query("delete from h_dashboard_widgets where h_widget_id = " . pfs($widID),"sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}


	function get_widgetrecord_bytitleandtype($strTitle, $strType,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_widgets where h_title = '".pfs($strTitle)."' and h_type='".pfs($strType)."' limit 1";
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}

	}


	function widget_attributes($xmlWidget, $bAsArray = false)
	{
		$aAtts = array();
		$strAtts = "";
		$xmlAtt = xcn($xmlWidget,"attributes");
		if($xmlAtt)
		{
			$arrChildNodes = $xmlAtt->child_nodes();
			foreach($arrChildNodes as $y => $xmlChild)
			{
				if($strAttName!="#text")
				{
					if($bAsArray)
					{
						$aAtts[$xmlChild->node_name()] = xc($xmlChild);
					}
					else
					{
						$strAtts.= $xmlChild->node_name() ."='". xc($xmlChild) ."' ";
					}
	
				}
			}
		}
		return ($bAsArray)?$aAtts:$strAtts;
	}

	function get_layout_markup($strLayoutType,$dashboardId)
	{
		$arrCols = explode(":",$strLayoutType);
		$colLen = count($arrCols)-1;

		//--
		//-- get visible widgets in this dashboard
		$x= 0;
		$arrWidgetMarkup = Array();
		$rs = new SqlQuery();

		$arrWidgetCols = array();
		$loadWidgets = "-1";
		$strSql = "select h_fk_wid,h_col,h_row from h_dashboard_boardwidgets where h_active=1 and  h_fk_dbid = ".pfs($dashboardId) . " order by h_col,h_row asc";
		$rs->Query($strSql,"sw_systemdb");
		while($rs->Fetch())
		{
			$wid = $rs->GetValueAsNumber("h_fk_wid");
			if($loadWidgets!="")$loadWidgets.=",";
			$loadWidgets .= $wid;

			$col = $rs->GetValueAsNumber("h_col");

			if(!isset($arrWidgetPos[$col]))$arrWidgetPos[$col] = Array();
			$arrWidgetPos[$col][] = $wid;
		}

		//-- get standalone var
		@session_start();	
		$standaloneMode = gv("stl");
		@session_write_close();

		$iDownload = 0;
		if($standaloneMode!="1")
		{
			//-- does user have permission to download list data
			$iDownload = HaveRight("D",1073741824);
		}

		$rs->Reset();
		$strSql = "select h_widget_id,h_title,h_type,h_extra_1,h_drilldownprovider,h_dataprovider,h_sql_measure from h_dashboard_widgets where h_widget_id in(".$loadWidgets.")";
		$rs->Query($strSql,"sw_systemdb");
		while($rs->Fetch())
		{
			$wid = $rs->GetValueAsNumber("h_widget_id");				
			$title = $rs->GetValueAsString("h_title");
			$type= $rs->GetValueAsString("h_type");
			$mode= $rs->GetValueAsString("h_extra_1");

			if($standaloneMode=="1")
			{
				$iDrill = 0;
			}
			else
			{
				//-- if in fullclient - check if can download data
				$iDrill = ($type=="fusion")?1:0;
				if($rs->GetValueAsString("h_dataprovider")!="")
				{
					$iDrill= ($rs->GetValueAsString("h_drilldownprovider")!="")?1:0;
				}
			}
			$arrWidgetMarkup[$wid] = widget_markup($wid,$title,$type,$mode,$dashboardId,$iDrill,$iDownload);
		}

		$strColumnLayout = "";
		foreach($arrCols as $x => $colWidth)
		{
			$strColumnWidgets = "";
			if(isset($arrWidgetPos[$x]))
			{
				foreach($arrWidgetPos[$x] as $intWid)
				{
					$strColumnWidgets .=$arrWidgetMarkup[$intWid];
				}
			}
			$strColumnLayout.='<div class="column " colpos="'.$x.'" style="width:'.$colWidth.'%;">'.$strColumnWidgets.'</div>'; 
		} 





		return $strColumnLayout;
	}


	function get_layout_widgetlist($xmlConfig,$gid,$cid)
	{
		//-- get layout
		$strWidgetList = "";
		$arrLayout = $xmlConfig->get_elements_by_tagname("widgets");
		if($arrLayout[0])
		{
			$strWidgetMarkup = "";
			$arrColWidgets = $arrLayout[0]->get_elements_by_tagname("widget");
			foreach($arrColWidgets as $y => $xmlWidget)
			{
				$strID = xcc($xmlWidget,"id");
				$strTitle = xcc($xmlWidget,"title");
				$strWidgetMarkup .= "<div class='widget-list-item'><input id='".$strID."' gid='".$gid."' cid='".$cid."' type='checkbox'><label for='".$strID."'>".$strTitle."</label></div>";
			}
			$strWidgetList.='<div class="widget-list">'.$strWidgetMarkup.'</div>'; 
		}

		return $strWidgetList;
	}


	//--
	//-- return dashboard config xml file
	function get_dashboard_configuration($configID)
	{
		$rs = new SqlQuery();
		if($rs->Query("select * from h_dashboard_boards where h_dashboard_id = " . pfs($configID),"sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}


	function delete_group_dashboards($gid)
	{
		$rs =  get_group_dashboardlist($gid);
		while($rs->Fetch())
		{
			delete_dashboard($rs->GetValueAsNumber("h_dashboard_id"));
		}

		return true;
	}

	function delete_dashboard($did)
	{
		$rs = new SqlQuery();
		if($rs->Query("delete from h_dashboard_boards where h_dashboard_id = " . pfs($did),"sw_systemdb"))
		{
			$rs->Reset();
			if($rs->Query("delete from h_dashboard_boardwidgets where h_fk_dbid = " . pfs($did),"sw_systemdb"))
			{
				return $rs;
			}
		}
		return false;

	}

	function create_dashboard($groupID, $dbTitle,  $layout, $accessRights="",$owner="",$accessUIDs="",$accessRoles=0)
	{
		$rs = new SqlQuery();
		if($rs->Query("insert into h_dashboard_boards (h_fk_dbg,h_title,h_accessrights,h_owner,h_layout,h_uidaccess,h_uraccess) values (".pfs($groupID).",'".pfs($dbTitle)."','".pfs($accessRights)."','".pfs($owner)."','".pfs($layout)."','".pfs($accessUIDs)."',".pfs($accessRoles).")","sw_systemdb"))
		{
			return get_dashboard_by_grpandtitle($groupID,$dbTitle);
		}
		else
		{
			return false;
		}
	}


	function create_dashboard_group($grpTitle, $accessRights="",$owner="",$accessUIDs="",$accessRoles=0)
	{
		$rs = new SqlQuery();
		if($rs->Query("insert into h_dashboard_groups (h_title,h_accessrights,h_owner,h_uidaccess,h_uraccess) values ('".pfs($grpTitle)."','".pfs($accessRights)."','".pfs($owner)."','".pfs($accessUIDs)."',".pfs($accessRoles).")","sw_systemdb"))
		{
			return get_dashboard_group_by_title($grpTitle);
		}
		else
		{
			return false;
		}
	}

	function get_dashboard_group_by_title($grpTitle,$boolAsJson=false)
	{
		$strSQL = "select * from h_dashboard_groups where h_title = '" . pfs($grpTitle)."'";
		if($boolAsJson)	
		{
			return sqlAsJson($strSQL,"sw_systemdb");
		}
		else
		{

			$rs = new SqlQuery();
			if($rs->Query($strSQL,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}



	function get_dashboard_group($configID,$boolAsJson=false)
	{
		$strSQL = "select * from h_dashboard_groups where h_gid = " . pfs($configID);
		if($boolAsJson)	
		{
			return sqlAsJson($strSQL,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($strSQL,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}

	function check_dashboard_access($userid,$privLevel,$urAccessLevel,$uidAccessString)
	{
		if($urAccessLevel>0) 
		{
			//-- check user role
			if($urAccessLevel>$privLevel)
			{
				//-- user does not have role priv and there is no uid setting so exit
				if($uidAccessString=="") 
				{
					return false;
				}
				else if(!check_uid_access($userid,$uidAccessString))return false;
			}
		}
		else
		{
			//-- there was no role check so just check uid perm
			if($uidAccessString!="" && !check_uid_access($aiuseridd,$uidAccessString))return false;
		}

		return true;

	}
	function check_uid_access($userid,$accessString)
	{
		$arrUID = explode(",",$accessString);
		foreach($arrUID as $aid)
		{
			if(strToLower(trim($aid))==strToLower(trim($userid)))return true;
		}
		return false;
	}


	function get_user_accessible_dashboard_group_listboxoptions($userid,$privLevel)
	{
		global $groupID;
		$groupOptions ="";
		$rs = new SqlQuery();
		$rs->Query("SELECT * FROM h_dashboard_groups  order by h_title asc","sw_systemdb");
		while($rs->Fetch())	
		{
			//-- is user allowed to access this dashboard group
			$uidAccess = $rs->GetValueAsString("h_uidaccess");
			$urAccess = $rs->GetValueAsNumber("h_uraccess");
			if(!check_dashboard_access($userid,$privLevel,$urAccess,$uidAccess))continue;

			$strGrpID = $rs->GetValueAsNumber("h_gid");
			$strGrpTitle = $rs->GetValueAsString("h_title");

			if($groupOptions=="" && $groupID==null)$groupID=$strGrpID;

			$selected = ($groupID==$strGrpID)?"selected":"";
			$groupOptions .= '<option value="'.$strGrpID.'" '.$selected.'>'.htmlentities($strGrpTitle).'</option>';
		}

		return $groupOptions;
	}

	function get_user_accessible_dashboard_listboxoptions($userid,$privLevel,$gid,$cid=0)
	{
		$boardOptions ="";

		//-- get group dashboards - check access rights
		$rsBoards = new SqlQuery();
		$rsBoards->Query("select * from h_dashboard_boards where h_fk_dbg = " . $gid . " order by h_title asc","sw_systemdb");
		while($rsBoards->Fetch())	
		{
			//-- is user allowed to access this dashboard 
			$uidAccess = $rsBoards->GetValueAsString("h_uidaccess");
			$urAccess = $rsBoards->GetValueAsNumber("h_uraccess");
			if(!check_dashboard_access($userid,$privLevel,$urAccess,$uidAccess))continue;


			$strPortalID = $rsBoards->GetValueAsString("h_dashboard_id");
			$strPortalTitle = $rsBoards->GetValueAsString("h_title");

			$selected = ($cid==$strPortalID)?"selected":"";
			$boardOptions .= '<option value="'.$strPortalID.'" '.$selected.'>'.htmlentities($strPortalTitle).'</option>';

		}

		return $boardOptions;
	}


	function get_dashboard_groups()
	{
		$rs = new SqlQuery();
		if($rs->Query("select h_gid,h_title from h_dashboard_groups order by h_title asc","sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}

	}

	function get_group_dashboardlist($grpID)
	{
		$rs = new SqlQuery();
		if($rs->Query("select h_dashboard_id,h_title from h_dashboard_boards where h_fk_dbg = " . pfs($grpID) ." order by h_title asc","sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}

	function get_dashboardrecord($did,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_boards where h_dashboard_id = " .pfs($did);
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}


	function get_dashboard_by_grpandtitle($grpID,$dbTitle)
	{
		$rs = new SqlQuery();
		if($rs->Query("select h_dashboard_id,h_title,h_layout,h_owner from h_dashboard_boards where h_fk_dbg = " . pfs($grpID) ." and h_title='".pfs($dbTitle)."' order by h_title asc","sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}

	function get_dashboard_widgets($dbID)
	{
		$rs = new SqlQuery();
		if($rs->Query("select * from h_dashboard_boardwidgets where h_fk_dbid = " . pfs($dbID) ." order by h_title asc","sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}

	//--- return rs of all measures
	function get_measures()
	{
		$rs = new SqlQuery();
		if($rs->Query("select * from h_dashboard_measures order by h_title asc","sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}

	function get_measurerecord($mid,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_measures where h_id = " .pfs($mid);
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}

	
	function get_measurerecord_samples($intID,$intSampleCount=12,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_samples where h_fk_measure = ". pfs($intID) . " order by h_sampledate desc limit " . pfs($intSampleCount);
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}

	function get_measurerecord_samples_withinrange($intID,$intStartDatex,$intEndDatex,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_samples where h_fk_measure = ". pfs($intID) ." where h_sampledate >= " . pfs($intStartDatex) . " and h_sampledate <= " . pfs($intEndDatex) . " order by h_sampledate desc";
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}



	function get_measurerecord_bytitle($title,$boolAsJson=false)
	{
		$sql = "select * from h_dashboard_measures where h_title = '".pfs($title)."' order by h_id desc limit 1";
		if($boolAsJson)	
		{
			return sqlAsJson($sql,"sw_systemdb");
		}
		else
		{
			$rs = new SqlQuery();
			if($rs->Query($sql,"sw_systemdb"))
			{
				return $rs;
			}
			else
			{
				return false;
			}
		}
	}

	function delete_measure($mid)
	{
		//-- delete samples and then delete measure itself

		$rs = new SqlQuery();
		if($rs->Query("delete from h_dashboard_samples where h_fk_measure = " . pfs($mid),"sw_systemdb"))
		{
			$rs->Reset();
			if($rs->Query("delete from h_dashboard_measures where h_id = " . pfs($mid),"sw_systemdb"))
			{
				return $rs;
			}
		}
		return false;


	}

	function update_measure_scorestats($mid)
	{
		$rsSamples = get_measure_samples($mid,"desc",2);

		//-- LATEST SAMPLE
		if($rsSamples->Fetch())
		{
			$newScore = $rsSamples->GetValueAsNumber("h_value");
			$newSampleDate = $rsSamples->GetValueAsNumber("h_sampledate");
			$oldScore = $newScore;

			//-- this will be the previous sample - if we have one
			if($rsSamples->Fetch())
			{
				$oldScore = $rsSamples->GetValueAsNumber("h_value");
			}

			$diff = $newScore - $oldScore;

			$strSql = "update h_dashboard_measures set h_lastsampledate = ".$newSampleDate." ,h_actual = ".$newScore.", h_difference=".$diff." where h_id = ".pfs($mid);
			$rsUpd = new SqlQuery();
			if($rsUpd->Query($strSql,"sw_systemdb"))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		return false;
	}

	//--- return rs of sample data for a measure
	function get_measure_samples($measureID, $orderDir ="asc", $limit=0, $startDate = 0, $endDate = 0)
	{
		//-- check if we want to get sample data between dates
		$datefilter = "";
		if(is_int($startDate) && $startDate>0)
		{
			$datefilter = "h_sampledate >= " .$startDate;
		}
		if( is_int($endDate) && $endDate>0)
		{
			if($datefilter!="") $datefilter.= " and ";
			$datefilter .= "h_sampledate <= " .$endDate;
		}
		if($datefilter!="") $datefilter= " and " . $datefilter;

		//-- do we want to limit results
		$sqlLimit = "";
		if(is_int($limit) && $limit>0)$sqlLimit = " limit " . $limit;

		$strSQL = "select * from h_dashboard_samples where h_fk_measure = ".pfs($measureID).$datefilter." order by h_sampledate " . $orderDir . $sqlLimit;
		$rs = new SqlQuery();
		if($rs->Query($strSQL,"sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}

	function create_sample($epochTime = 0,$sampleValue = 100,$forMeasureId)
	{
		if($epochTime==0)$epochTime = time();
		$strSQL = "insert into h_dashboard_samples (h_sampledate,h_value,h_fk_measure) values (".pfs($epochTime).",".pfs($sampleValue).",".pfs($forMeasureId).")";
		$rs = new SqlQuery();
		if($rs->Query($strSQL,"sw_systemdb"))
		{
			return get_measure_samples($forMeasureId,"desc",1);
		}
		else
		{
			return false;
		}
	}

	function get_sample($sampleId)
	{
		$strSQL = "select * from h_dashboard_samples where h_pk_sid = ".pfs($sampleId);
		$rs = new SqlQuery();
		if($rs->Query($strSQL,"sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}
	function update_sample($sampleId, $epochTime = 0,$sampleValue= 100)
	{
		if($epochTime==0)$epochTime = time();
		$strSQL = "update h_dashboard_samples set h_sampledate =".pfs($epochTime)." , h_value = ".pfs($sampleValue)." where h_pk_sid = ".pfs($sampleId);
		$rs = new SqlQuery();
		if($rs->Query($strSQL,"sw_systemdb"))
		{
			return get_sample($sampleId);
		}
		else
		{
			return false;
		}
	}

	function delete_sample($sampleID)
	{
		$rs = new SqlQuery();
		if($rs->Query("delete from h_dashboard_samples where h_pk_sid = " . pfs($sampleID),"sw_systemdb"))
		{
			return $rs;
		}
		else
		{
			return false;
		}
	}


	//-- scan dir to get fusion data providers
	function get_phpscripts_forlistbox($strRootDir, $strPathPrefix,$strParentPrefix = "")
	{
		$options= "";
		if($strParentPrefix=="")$strParentPrefix =$strPathPrefix;

		$displayPrefix = str_replace($strParentPrefix,"",$strPathPrefix);
		if($displayPrefix!="")$displayPrefix .="/";

		if ($handle = @opendir($strRootDir)) 
		{
			while (false !== ($entry = readdir($handle))) 
			{
				//-- make sure is a php file

				if ($entry != "." && $entry != "..") 
				{
					if(false===is_dir($strRootDir ."/".$entry))
					{
						$pi = pathinfo($entry);
						if($pi["extension"]=="php")
						{
							$value = $strPathPrefix ."/". $entry;
							$options .="<option value='".$value."'>".$displayPrefix .str_replace(".php","",$entry)."</option>";
						}
					}
					else
					{
						$options .= get_phpscripts_forlistbox($strRootDir ."/".$entry, $strPathPrefix .$entry,$strPathPrefix);
					}
				}
			}
			closedir($handle);
		}
		return $options;
	}

	function get_sql_as_table($strSQL, $strDB, $thClass="",$trOddClass="",$trEvenClass="")
	{
		$rs = new SqlQuery();
		if($rs->Query($strSQL,$strDB,true))
		{
			return $rs->GetHtmlTable($thClass,$trOddClass,$trEvenClass);
		}
		return "";
	}

	function get_period_label($intEpoch,$periodType)
	{
		//-- break date down into parts yyyy mm dd hh mm
		$label = "N/A";
		switch($periodType)
		{
			case "hour":
				$label = date("H",$intEpoch);
				break;
			case "day":
				//-- Day sample taken between 1am and 2am, of next day.
				//-- Label should show the previous day to the sample time.
				$label = date("D j M",($intEpoch-86400));
				break;
			case "week":
				$label = "Week ". date("W",$intEpoch);
				break;
			case "month":
			case "quarter":
				$label = date("M, Y",$intEpoch);
				break;
			case "year":
				$label = date("Y",$intEpoch);
				break;
		}

		return $label;
	}

	function get_fusion_sampledataset($rsSamples,$periodType,$strUnit="")
	{
		$arrDataSet = Array();
		while($rsSamples->Fetch())
		{
			$label = get_period_label($rsSamples->GetValueAsNumber("h_sampledate"),$periodType);



			
			switch ($strUnit)
			{
				case "days":
					$value = $rsSamples->GetValueAsNumber("h_value") / 86400;
					break;
				case "hrs":
					$value = $rsSamples->GetValueAsNumber("h_value") / 3600;
					break;
				case "mins":
					$value = $rsSamples->GetValueAsNumber("h_value") / 60;
					break;
				default:
					$value = $rsSamples->GetValueAsString("h_value");
			}

			$arrDataSet[] = '<set label="'.$label.'" value="'.$value.'" />';
		}

		//-- reverse array so latest sample is shown last
		return implode("",array_reverse($arrDataSet));
	}

	function getSampleDateInfo($intEpoch)
	{
		$info = new stdClass();

		//-- work out if time to run daily collectors
		$info->hour = date('H', $intEpoch);
		$info->day = date('w', $intEpoch); //-- 0 for sunday / 6 for sat
		$info->dom = date('j', $intEpoch); //-- 1 - 31
		$info->month = date('n', $intEpoch); //-- 1 - 12
		$info->year = date('Y', $intEpoch); //-- YYYY

		return $info;
	}


	//-- return object that holds date range starttime and endtime (to use in select statements i.e. where datecol >= $o->startime and datecol <= $o->endtime)
	function get_sample_startend_timeobject($freqType,$intEpoch)
	{
		$o = new stdClass();

		$origDate =  getSampleDateInfo($intEpoch);

		//-- break date down into parts yyyy mm dd hh mm
		switch($freqType)
		{
			case "hour":
				//-- get datetime for the previous hour
				$intEpoch = $intEpoch - 3600;
				//-- get date parts
				$d = getSampleDateInfo($intEpoch);
				//-- set return object
				$o->startdatetime = strtotime("$d->year-$d->month-$d->dom $d->hour:00:00");
				$o->enddatetime = strtotime("$d->year-$d->month-$d->dom $d->hour:59:59");
				break;

			case "day":
				//-- get datetime for the previous day midnight to 23:59:59
				$intEpoch = strtotime("-1 day",$intEpoch);
				//-- get date parts
				$d = getSampleDateInfo($intEpoch);
				//-- set return object
				$o->startdatetime = strtotime("$d->year-$d->month-$d->dom 00:00:00");
				$o->enddatetime = strtotime("$d->year-$d->month-$d->dom 23:59:59");
				break;

			case "week":
				//-- get datetime for the previous week midnight monday to sun 23:59:59
				$intLastWeekEpoch = strtotime('last Week',$intEpoch);
				
				$thisWeekNum =	date("W",$intEpoch);
				$lastWeekNum =	date("W",$intLastWeekEpoch);
				
				

				$intEpochFirst = strtotime("last Monday",$intLastWeekEpoch);
				$intEpochLast = strtotime("last Sunday",$intEpoch);



				//-- get date parts
				$df = getSampleDateInfo($intEpochFirst);
				$dl = getSampleDateInfo($intEpochLast);
				//-- set return object
				$o->startdatetime = strtotime("$df->year-$df->month-$df->dom 00:00:00");
				$o->enddatetime = strtotime("$dl->year-$dl->month-$dl->dom 23:59:59");
				break;

			case "month":
				//-- get datetimes for last month
				$intEpochFirst = mktime(0, 0, 0, $origDate->month-1, 1,  $origDate->year);
				$intEpochLast = mktime(0, 0, 0, $origDate->month, 0, $origDate->year);

				//-- get date parts
				$df = getSampleDateInfo($intEpochFirst);
				$dl = getSampleDateInfo($intEpochLast);
				//-- set return object
				$o->startdatetime = strtotime("$df->year-$df->month-$df->dom 00:00:00");
				$o->enddatetime = strtotime("$dl->year-$dl->month-$dl->dom 23:59:59");
				break;

			case "quarter":
				$intEpochFirst = strtotime("-3 month",$intEpoch);
				$intEpochLast = strtotime("this month",$intEpoch);
				//-- get date parts
				$df = getSampleDateInfo($intEpochFirst);
				$dl = getSampleDateInfo($intEpochLast);
				//-- set return object
				$o->startdatetime = strtotime("$df->year-$df->month-1 00:00:00");
				$o->enddatetime = strtotime("$dl->year-$dl->month-0 23:59:59");


				break;

			case "year":
				//-- get datetimes for last year

				$year = date('Y',$intEpoch) - 1; // Get current year and subtract 1
				$intEpochFirst = mktime(0, 0, 0, 1, 1, $year);
				$intEpochLast = mktime(0, 0, 0, 12, 31, $year);

				//-- get date parts
				$df = getSampleDateInfo($intEpochFirst);
				$dl = getSampleDateInfo($intEpochLast);
				//-- set return object
				$o->startdatetime = strtotime("$df->year-$df->month-$df->dom 00:00:00");
				$o->enddatetime = strtotime("$dl->year-$dl->month-$dl->dom 23:59:59");
				break;
		}
		return $o;
	}


	//-- return array of labels for a given freqType and current timelabel for previous sample
	function get_sample_labels($freqType,$nSamples=12,$intEpoch = 0)
	{
		$arrLabels = Array();
		if($intEpoch==0)$intEpoch = time();
		
		for($xx=0;$xx<$nSamples;$xx++)
		{

			$origDate =  getSampleDateInfo($intEpoch);

			//-- break date down into parts yyyy mm dd hh mm
			switch($freqType)
			{
				case "hour":
					//-- get datetime for the previous hour
					$intEpoch = strtotime("-1 hour",$intEpoch);
					break;

				case "day":
					//-- get datetime for the previous day midnight to 23:59:59
					$intEpoch = strtotime("-1 day",$intEpoch);
					break;

				case "week":
					//-- get datetime for the previous week midnight monday to sun 23:59:59
					$intLastWeekEpoch = strtotime('last Week',$intEpoch);
					$intEpoch = strtotime("last Monday",$intLastWeekEpoch);
					break;

				case "month":
					//-- get datetimes for last month
					$intEpoch = mktime(0, 0, 0, $origDate->month-1, 1,  $origDate->year);
					break;

				case "quarter":
					$intEpoch = strtotime("-3 month",$intEpoch);
					break;

				case "year":
					//-- get datetimes for last year

					$year = date('Y',$intEpoch) - 1; // Get current year and subtract 1
					$intEpoch = mktime(0, 0, 0, 1, 1, $year);
					break;
			}

			//-- so we want to get label for intepoch
			$arrLabels[] = get_period_label($intEpoch,$freqType);
		}
		return $arrLabels;
	}


//--
//-- MultiSeriesFusion CLASS
//--
class MultiSeriesFusion
{
	var $arrMeasures = Array();

	function addMeasureByTitle($strMeasureName,$strLabel)
	{
		$o = new stdClass();
		$o->name = $strMeasureName;
		$o->label = $strLabel;
		$o->record = get_measurerecord_bytitle($strMeasureName);
		if($o->record==false)
		{
			logError("MultiSeriesFusion:addMeasureByTitle", "The measure [".$strMeasureName."] could not be found");
			return false;
		}
		//-- fetch the actual record
		$o->record = $o->record->Fetch();

		$this->arrMeasures[] = $o;
		return true;
	}

	function generateFusionXml($nSamples,$dir = "desc")
	{
		$fusionXml = $this->generateCategories($nSamples,$dir);

		//-- get each measure and generate a dataset for that measure
		$len = count($this->arrMeasures);
		for($x=0;$x<$len;$x++)
		{
			$measure = $this->arrMeasures[$x];
			
			//-- get samples for the measure
			$rsSample = get_measure_samples($measure->record->h_id, $dir, $nSamples);
			if($rsSample==false)
			{
				logError("MultiSeriesFusion:generateFusionXml", "The samples for measure [".$measure->name."] could not be fetched");
				continue;
			}
			$fusionXml .= "<dataset seriesName='".prepareForXml($measure->label)."' showValues='0'>";
			
			$fusionDataSet = Array();
			while($sample = $rsSample->Fetch())
			{
				$fusionDataSet[] = "<set value='".prepareForXml($sample->h_value)."' />";
			}

			//-- reverse array if dir is desc
			if(strToLower($dir)=="desc")
			{
				$fusionDataSet = array_reverse($fusionDataSet);
			}

			$fusionXml .= implode("",$fusionDataSet);
			$fusionXml .= "</dataset>";

		}
		return $fusionXml;
	}

	function generateCategories($nSamples,$dir)
	{
		//-- generate the categories based on the first measure provided (category is going to be the time line)
		if(!isset($this->arrMeasures[0]))
		{
			logError("MultiSeriesFusion:generateFusionXml", "There are no measures available to generate the category labels");
			return false;
		}

		$periodType = $this->arrMeasures[0]->record->h_frequency_type;
		$arrLabels = get_sample_labels($periodType,$nSamples);

		if(strToLower($dir)=="desc")
		{
			$arrLabels = array_reverse($arrLabels);
		}

		$strCatXml = "<categories>";
		for($x=0;$x<count($arrLabels);$x++)
		{
			$strCatXml .= "<category label='".prepareForXml($arrLabels[$x])."' />";
		}
		$strCatXml .= "</categories>";
		return $strCatXml;
	}
}
//--
//-- EOF MultiSeriesFusion CLASS
//--

?>