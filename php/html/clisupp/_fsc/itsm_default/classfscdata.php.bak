<?php
class oFSCData
{
	var $connSWDB;
	var $arrEvents;
	var $output;
	var $strAdditionalFilter;
	var $strViewType;
	function oFSCData($oDBConn)
	{
		$this->connSWDB = $oDBConn;
		$this->arrEvents = array();
		$this->output = array();
		$this->strAdditionalFilter = "";
		$this->strViewType = "month";
		return true;
	}
	
	//-- CH00125373 load calendar items/change freezes function
	function load_calendar_items($intCalStart,$intCalEnd,$strType)
	{
		$oDBConn = $this->connSWDB;
		$strSQL = "SELECT pk_auto_id,title, startx, endx FROM fsc_item where type='" . pfs($strType) . "'";
		$oDBConn->Query($strSQL);
		while($oDBConn->fetch("itm"))
		{
			$intID = $this->f('itm_pk_auto_id');
			$intStart = $this->f('itm_startx');
			$intEnd = $this->f('itm_endx');
			$strTitle =  $this->f('itm_title');

			if($strType=="Change Freeze")
			{
				$strColour = "red";
			}
			else
			{
				$strColour = "black";
			}
			$boolAllDay = false;
			 
			if($this->strViewType=='agendaDay')
			{
				if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				else
				{
					if(($intEnd-$intStart)<1380)
						$intEnd = $intStart+1380;
				}
			}
			$strURL = $this->get_si_url_link($intID);
			array_push($this->output,array(
				'id' => $intID,
				'title' => $strTitle,
				'allDay' => $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL,
				'color' => $strColour
			));		
		}
	}
	
	
	function load_activites($intCalStart,$intCalEnd,$boolCallSummary = false, $strActivityType = "")
	{
		$strFilter = "";
		if($strActivityType!="")
			$strFilter = " AND ci_schedule.activity='".pfs($strActivityType)."'";
		$oDBConn = $this->connSWDB;
		$strSQL = " SELECT ci_schedule.*, callref,startx as itsm_schedstartx,itsm_title,callclass,endx AS overdue FROM opencall,ci_schedule WHERE (ci_schedule.flg_proposed != 1 or ci_schedule.flg_proposed is null) AND ci_schedule.fk_callref=opencall.callref AND (ci_schedule.flg_hide_fsc is null or ci_schedule.flg_hide_fsc=0) AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND status != 17 AND appcode IN(".gv('wc_datasetfilterlist').") AND status < 15 AND ( startx>".$intCalStart." AND startx<".$intCalEnd." AND endx>0 OR endx>".$intCalStart." AND endx<".$intCalEnd." AND startx>0 OR endx>".$intCalEnd." AND startx<".$intCalStart." AND startx>0 )".$this->strAdditionalFilter.$strFilter." ORDER BY itsm_schedstartx ASC, callclass ASC ";
		$oDBConn->Query($strSQL);
		//var_dump($strSQL);
		while($oDBConn->fetch("prb"))
		{
			 $strID = "act_".$this->f('prb_pk_auto_id');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			 if($this->f('prb_activity')!="")
				$strTitle .= ' - '.$this->f('prb_activity');
			 if($this->f('prb_title')!="")
				$strTitle .= ' - '.$this->f('prb_title');
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 $strURL = $this->get_url_link($this->f('prb_callref'));
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' => $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL,
				 'color' => green
			));		
		}
	}

	function load_changes($intCalStart,$intCalEnd,$boolCallSummary)
	{
		$oDBConn = $this->connSWDB;
		$oDBConn->Query("SELECT callref,requested_start_datex as itsm_schedstartx,itsm_title,callclass,requested_end_datex as overdue FROM opencall WHERE callclass IN ('Change Request') AND status < 15 AND appcode IN(".gv('wc_datasetfilterlist').") AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND ( requested_start_datex>".$intCalStart." AND requested_start_datex<".$intCalEnd." AND requested_end_datex>0 OR requested_end_datex>".$intCalStart." AND requested_end_datex<".$intCalEnd." AND requested_start_datex>0 OR requested_end_datex>".$intCalEnd." AND requested_start_datex<".$intCalStart." AND requested_start_datex>0 )  ".$this->strAdditionalFilter." ORDER BY itsm_schedstartx ASC, callclass ASC ");
		while($oDBConn->fetch("prb"))
		{
			 $strID = "req_".$this->f('prb_callref');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			 $strTitle .= ' - Desired Dates';
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');
			 $strURL = $this->get_url_link($this->f('prb_callref'));

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' =>  $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL
			));		
		}
	}
	//-- Releases
	function load_rel($intCalStart,$intCalEnd,$boolCallSummary,$strActivityType = "")
	{
		$strFilter = "";
		if($strActivityType!="")
			$strFilter = " AND ci_schedule.activity='".pfs($strActivityType)."'";
		$oDBConn = $this->connSWDB;
		$strSQL = " SELECT ci_schedule.*, callref,startx as itsm_schedstartx,itsm_title,callclass,endx AS overdue FROM opencall,ci_schedule WHERE (ci_schedule.flg_proposed != 1 or ci_schedule.flg_proposed is null) AND ci_schedule.fk_callref=opencall.callref AND (ci_schedule.flg_hide_fsc is null or ci_schedule.flg_hide_fsc=0) AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND opencall.callclass IN ('Release Request') AND status != 17 AND appcode IN(".gv('wc_datasetfilterlist').") AND status < 15 AND ( startx>".$intCalStart." AND startx<".$intCalEnd." AND endx>0 OR endx>".$intCalStart." AND endx<".$intCalEnd." AND startx>0 OR endx>".$intCalEnd." AND startx<".$intCalStart." AND startx>0 )".$this->strAdditionalFilter.$strFilter." ORDER BY itsm_schedstartx ASC, callclass ASC ";
		$oDBConn->Query($strSQL);
		//var_dump($strSQL);
		while($oDBConn->fetch("prb"))
		{
			 $strID = "act_".$this->f('prb_pk_auto_id');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			 if($this->f('prb_activity')!="")
				$strTitle .= ' - '.$this->f('prb_activity');
			 if($this->f('prb_title')!="")
				$strTitle .= ' - '.$this->f('prb_title');
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 $strURL = $this->get_url_link($this->f('prb_callref'));
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' => $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL,
				 'color' => green
			));		
		}
	}
	//-- Releases
	function load_rel_chg($intCalStart,$intCalEnd,$boolCallSummary,$strActivityType = "")
	{
		$strFilter = "";
		if($strActivityType!="")
			$strFilter = " AND ci_schedule.activity='".pfs($strActivityType)."'";
		$oDBConn = $this->connSWDB;
		$strSQL = " select distinct ci_schedule.*, callref, itsm_title, relcode, fk_callref_s, startx as itsm_schedstartx, endx AS overdue from opencall, cmn_rel_opencall_oc, ci_schedule where opencall.callref=cmn_rel_opencall_oc.fk_callref_m and (ci_schedule.fk_callref = fk_callref_s or ci_schedule.fk_callref = fk_callref_m) and opencall.callclass = 'Release Request' and relcode = 'RELEASE-RFC' AND (ci_schedule.flg_hide_fsc is null or ci_schedule.flg_hide_fsc=0) AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND opencall.callclass IN ('Release Request','Change Request') AND status != 17 AND appcode IN(".gv('wc_datasetfilterlist').") AND status < 15 AND ( startx>".$intCalStart." AND startx<".$intCalEnd." AND endx>0 OR endx>".$intCalStart." AND endx<".$intCalEnd." AND startx>0 OR endx>".$intCalEnd." AND startx<".$intCalStart." AND startx>0 )".$this->strAdditionalFilter.$strFilter." ORDER BY itsm_schedstartx ASC, callclass ASC limit 1";
		$oDBConn->Query($strSQL);
		//var_dump($strSQL);
		$myFile = "testFile.txt";
			$fh = fopen($myFile, 'w') or die("can't open file");
		while($oDBConn->fetch("prb"))
		{
			$stringData = "START - ";
			fwrite($fh, $stringData);
			$stringData = " ID : ".$this->f('prb_pk_auto_id')."\n - ";
			fwrite($fh, $stringData);
			$stringData = " Callref : ".$this->f('prb_callref')."\n - ";
			fwrite($fh, $stringData);
			$stringData = " Title : ".$this->f('prb_itsm_title')."\n - ";
			fwrite($fh, $stringData);
			$stringData = " Activity : ".$this->f('prb_activity')."\n - ";
			fwrite($fh, $stringData);
			$stringData = " Start Time : ".$this->f('prb_itsm_schedstartx')."\n - ";
			fwrite($fh, $stringData);
			$stringData = " End Time : ".$this->f('prb_overdue')."\n - ";
			fwrite($fh, $stringData);
			$stringData = " - END";
			fwrite($fh, $stringData);
			
			 $strID = "act_".$this->f('prb_pk_auto_id');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			 if($this->f('prb_activity')!="")
				$strTitle .= ' - '.$this->f('prb_activity');
			 if($this->f('prb_title')!="")
				$strTitle .= ' - '.$this->f('prb_title');
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 $strURL = $this->get_url_link($this->f('prb_callref'));
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' => $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL,
				 'color' => Orange
			));		
		}
		fclose($fh);
	}
	//-- PSO View
	function load_pso($intCalStart,$intCalEnd,$boolCallSummary)
	{
		$oDBConn = $this->connSWDB;
		$oDBConn->Query("SELECT distinct(callref),requested_start_datex as itsm_schedstartx,itsm_title,callclass,config_itemi.ck_config_item ,requested_end_datex as overdue FROM opencall RIGHT JOIN cmn_rel_opencall_ci ON opencall.callref = cmn_rel_opencall_ci.fk_callref  LEFT JOIN config_itemi ON cmn_rel_opencall_ci.fk_ci_auto_id = config_itemi.pk_auto_id WHERE callclass IN ('Change Request') AND status < 15 AND opencall.appcode IN(".gv('wc_datasetfilterlist').") AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND ( requested_start_datex>".$intCalStart." AND requested_start_datex<".$intCalEnd." AND requested_end_datex>0 OR requested_end_datex>".$intCalStart." AND requested_end_datex<".$intCalEnd." AND requested_start_datex>0 OR requested_end_datex>".$intCalEnd." AND requested_start_datex<".$intCalStart." AND requested_start_datex>0 ) AND config_itemi.ck_config_type = 'ME->SERVICE' ".$this->strAdditionalFilter." ORDER BY itsm_schedstartx ASC, callclass ASC");
		while($oDBConn->fetch("prb"))
		{
			 $strID = "req_".$this->f('prb_callref');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			$strTitle .= ' - Desired Dates';
			//$strTitle .= ' - '.$this->f('config_itemi.ck_config_item');
	
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');
			 $strURL = $this->get_url_link($this->f('prb_callref'));

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' =>  $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL
			));		
		}
	}
	
	function load_proposal_activites($intCalStart,$intCalEnd,$boolCallSummary = false, $strActivityType = "")
	{
		$strFilter = "";
		if($strActivityType!="")
			$strFilter = " AND ci_schedule.activity='".pfs($strActivityType)."'";
		$oDBConn = $this->connSWDB;
		$strSQL = " SELECT ci_schedule.*, callref,startx as itsm_schedstartx,itsm_title,callclass,endx AS overdue FROM opencall,ci_schedule WHERE ci_schedule.flg_proposed = 1 AND ci_schedule.fk_callref=opencall.callref AND (ci_schedule.flg_hide_fsc is null or ci_schedule.flg_hide_fsc=0) AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND status != 17 AND appcode IN(".gv('wc_datasetfilterlist').") AND status < 15 AND ( startx>".$intCalStart." AND startx<".$intCalEnd." AND endx>0 OR endx>".$intCalStart." AND endx<".$intCalEnd." AND startx>0 OR endx>".$intCalEnd." AND startx<".$intCalStart." AND startx>0 )".$this->strAdditionalFilter.$strFilter." ORDER BY itsm_schedstartx ASC, callclass ASC ";
		$oDBConn->Query($strSQL);
		//var_dump($strSQL);
		while($oDBConn->fetch("prb"))
		{
			 $strID = "act_".$this->f('prb_pk_auto_id');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			 if($this->f('prb_activity')!="")
				$strTitle .= ' - '.$this->f('prb_activity');
			 if($this->f('prb_title')!="")
				$strTitle .= ' - '.$this->f('prb_title');
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 $strURL = $this->get_url_link($this->f('prb_callref'));
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' => $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL,
				 'color' => orange
			));		
		}
	}

	function load_proposals($intCalStart,$intCalEnd,$boolCallSummary)
	{
		$oDBConn = $this->connSWDB;
		$oDBConn->Query("SELECT callref,requested_start_datex as itsm_schedstartx,itsm_title,callclass,requested_end_datex as overdue FROM opencall WHERE callclass IN ('Change Proposal') AND status < 15 AND appcode IN(".gv('wc_datasetfilterlist').") AND (opencall.itsm_hide_fsc is null or opencall.itsm_hide_fsc=0) AND ( requested_start_datex>".$intCalStart." AND requested_start_datex<".$intCalEnd." AND requested_end_datex>0 OR requested_end_datex>".$intCalStart." AND requested_end_datex<".$intCalEnd." AND requested_start_datex>0 OR requested_end_datex>".$intCalEnd." AND requested_start_datex<".$intCalStart." AND requested_start_datex>0 )  ".$this->strAdditionalFilter." ORDER BY itsm_schedstartx ASC, callclass ASC ");
		while($oDBConn->fetch("prb"))
		{
			 $strID = "req_".$this->f('prb_callref');
			 $strTitle =  swcallref_str($this->f('prb_callref'));
			 if($boolCallSummary)
				 $strTitle .=  ' - '.$this->f('prb_itsm_title');
			 $strTitle .= ' - Desired Dates';
			 $intStart = $this->f('prb_itsm_schedstartx');
			 $intEnd = $this->f('prb_overdue');
			 $strURL = $this->get_url_link($this->f('prb_callref'));

			 $boolAllDay = false;
			 
			 //105614
			  if($this->strViewType=='agendaDay')
			 {
				 if($intStart<$intCalStart && $intEnd>$intCalEnd)
					$boolAllDay = true;
				 else
				 {
					 if(($intEnd-$intStart)<1380)
						 $intEnd = $intStart+1380;
				 }
			 }
			 
			 array_push($this->output,array(
				'id' => $strID,
				'title' => $strTitle,
				'allDay' =>  $boolAllDay,
				'start' => $intStart,
				'end' => $intEnd,
				'url' => $strURL,
				'color' => purple
			));		
		}
	}
	function set_filter($strFilter)
	{
		$this->strAdditionalFilter = $strFilter;
	}

	function set_view_type($strView)
	{
		$this->strViewType = $strView;
	}

	function get_output()
	{
		return $this->output;
	}
	function get_events($strFilter)
	{
		return $this->arrEvents;
	}

	function f($strName)
	{
		return htmlentities($GLOBALS[$strName],ENT_QUOTES,'UTF-8');
	}
	//-- get url for opening call details depending on webclient/fullcient
	function get_url_link($intCallref)
	{
		$strURL = "";
		if(isset($_SESSION['sw_ap_wwwpath']))
		{
			$strURL= "JAVASCRIPT:top._open_call_detail(".$intCallref.");";
		}
		else
		{
			$strURL= "hsl:calldetails?callref=".$intCallref;
		}
		return $strURL;
	}
	
	//-- get url for opening scheduled item details depending on webclient/fullcient
	function get_si_url_link($strID)
	{
		$strURL = "";
		if(isset($_SESSION['sw_ap_wwwpath']))
		{
			$strURL= "JAVASCRIPT:top.OpenFormForEdit('fsc_item'," . $strID . ");";
		}
		else
		{
			$strURL= "hsl:swjscallback?function=load_scheduled_item_form&id=" . $strID;
		}
		return $strURL;
	}
}
?>