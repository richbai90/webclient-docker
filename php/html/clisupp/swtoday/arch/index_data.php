<?php
	//-- NWJ - Data file for itsm_index.php
	//--	   Used to fetch record counts, datasets and set the time
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	//-- F0088746, change from SwFormatDateTimeColumn to SwFormatAnalystTimestampValue
	
	//-- SW Today setting names
	define("_SERVICEAVAILABILITY", "SWTODAY.NOTIFICATION.SA.SHOW");
	define("_PROBLEMS", "SWTODAY.NOTIFICATION.PROBLEMS.SHOW");
	define("_KE", "SWTODAY.NOTIFICATION.KE.SHOW");
	define("_CHANGESCHEDULE", "SWTODAY.NOTIFICATION.CS.SHOW");
	define("_AUTH", "SWTODAY.NOTIFICATION.AUTH.SHOW");
	define("_MI", "SWTODAY.NOTIFICATION.MI.SHOW");

	function f($strName)
	{
		return htmlentities(utf8_decode($GLOBALS[$strName]),ENT_QUOTES,'UTF-8');
	}

	//-- F0103274 - return html used to display Major Incident notifications
	function output_mi_notifications($connSWDB)
	{
		if(!show_notifications(_MI)) return false;

		$int_counter=0;
	
		$strOutput="<div class='sectionHead'>";
		$strOutput.="	<table class='sectionTitle'>";
		$strOutput.="		<tr>";
		$strOutput.="			<td class='titleCell'><h1>Current Major Incidents</h1></td>";
		$strOutput.="			<td class='statusCell'>Impact</td>";
		$strOutput.="		</tr>";
		$strOutput.="	</table>";
		$strOutput.="</div>";

		$connSWDB->Query("SELECT callref, logdatex, itsm_title, fixbyx, itsm_impact_level, prob_text from opencall where callclass='Incident' and itsm_majorinc=1 and status<15 and status!=6 and appcode IN(".gv("datasetfilterlist").")");
		while($connSWDB->fetch("mi"))
		{
			$int_counter++;
			$mi_id = "mi_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"".$mi_id."\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".swcallref_str(f('mi_callref'))." - ".f('mi_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".f('mi_itsm_impact_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$mi_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Incident Reference</span> <a href='hsl:calldetails?callref=".f('mi_callref')."'>".swcallref_str(f('mi_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Raised on</span> ".SwFormatAnalystTimestampValue("opencall.logdatex", f('mi_logdatex'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Resolve by</span> ".SwFormatAnalystTimestampValue("opencall.fixbyx", f('mi_fixbyx'))."<br/>" .nl2br(f('mi_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}
	
	
	//-- return html used to display problem notifications
	function output_problem_notifications($connSWDB)
	{
		if(!show_notifications(_PROBLEMS)) return false;

		$int_counter=0;
	
		$strOutput="<div class='sectionHead'>";
		$strOutput.="	<table class='sectionTitle'>";
		$strOutput.="		<tr>";
		$strOutput.="			<td class='titleCell'><h1>Reported Problems</h1></td>";
		$strOutput.="			<td class='statusCell'>Impact</td>";
		$strOutput.="		</tr>";
		$strOutput.="	</table>";
		$strOutput.="</div>";

		$connSWDB->Query("SELECT opencall.callref, itsm_title, itsm_impact_level, opencall.logdatex, fixbyx, prb_title, prb_info from opencall, itsm_opencall_problem where callclass='Problem' and itsm_swtoday_on=1 and opencall.callref = itsm_opencall_problem.callref and status < 15 and status!=6 and appcode IN(".gv("datasetfilterlist").")");
		while($connSWDB->fetch("prb"))
		{
			$int_counter++;
			$prb_id = "problem_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"".$prb_id."\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".swcallref_str(f('prb_callref'))." - ".f('prb_prb_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".f('prb_itsm_impact_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Problem Reference</span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Raised on</span> ".SwFormatAnalystTimestampValue("opencall.logdatex", f('prb_logdatex'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Resolve by</span> ".SwFormatAnalystTimestampValue("opencall.fixbyx", f('prb_fixbyx'))."<br/>" .nl2br(f('prb_prb_info'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}

	//-- return html used to display error notifications
	function output_error_notifications($connSWDB)
	{
		if(!show_notifications(_KE)) return false;

		$int_counter=0;

		$strOutput="<div class='sectionHead'>";
		$strOutput.="	<table class='sectionTitle'>";
		$strOutput.="		<tr>";
		$strOutput.="			<td class='titleCell'><h1>Reported Known Errors</h1></td>";
		$strOutput.="			<td class='statusCell'>Impact</td>";
		$strOutput.="		</tr>";
		$strOutput.="	</table>";
		$strOutput.="</div>";

		$connSWDB->Query("SELECT opencall.callref, itsm_impact_level, opencall.logdatex, fixbyx, prob_text, itsm_title from opencall, itsm_opencall_problem where callclass='Known Error' and itsm_swtoday_on=1 and opencall.callref = itsm_opencall_problem.callref and status < 15 and status!=6 and appcode IN(".gv("datasetfilterlist").")");
		while($connSWDB->fetch("prb"))
		{
			$int_counter++;
			$prb_id = "error_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$prb_id\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".swcallref_str(f('prb_callref'))." - ".f('prb_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".f('prb_itsm_impact_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Error Reference</span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Raised on</span> ".SwFormatAnalystTimestampValue("opencall.logdatex", f('prb_logdatex'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Resolve by</span>".SwFormatAnalystTimestampValue("opencall.fixbyx", f('prb_fixbyx'))."<br/>" .nl2br(f('prb_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}

	//-- return html used to display service notifications
	function output_service_notifications($connSWDB)
	{
		//-- Check If Set to display
		//if(!showServiceAvailability()) return false;
		if(!show_notifications(_SERVICEAVAILABILITY)) return false;

		$int_counter=0;
		
		$strOutput="<div class='sectionHead'>";
		$strOutput.="	<table class='sectionTitle'>";
		$strOutput.="		<tr>";
		$strOutput.="			<td class='titleCell'><h1>Service Availability</h1></td>";
		$strOutput.="			<td class='statusCell' width=100%>Status</td>";
		$strOutput.="		</tr>";
		$strOutput.="	</table>";	
		$strOutput.="</div>";

		//-- get active ci that are unavail, and we want to show on page (so people know its current status)
		$connSWDB->Query("SELECT config_itemi.* from config_itemi join config_typei on config_typei.pk_config_type = config_itemi.ck_config_type where flg_showonswtodayfail=1 and (isunavailable='Yes' or isdeactivated='Yes') and isactivebaseline='Yes' and (flg_canmonitor=1 OR flg_availmntr=1)");
		while($connSWDB->fetch("ci"))
		{
			$int_counter++;
			$service_id = "service_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$service_id\",\"red\");' src='img/icons/red_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive'><a href='hsl:editrecord?table=config_itemi&key=".f('ci_pk_auto_id')."'>(".f('ci_ck_config_item').") ".f('ci_description')."</a> : " .f('ci_swtoday_titlefail') ."</td>";
			$strOutput.=			"<td class='itsmItemStatus itsmStatusInactive'>".f('ci_fk_status_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$service_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Unavailability started on <span class='textblue'>".SwFormatAnalystTimestampValue("config_itemi.startedonx", f('ci_startedonx')). "</span> and is expected to be resolved by <span class='textblue'>" .SwFormatAnalystTimestampValue("config_itemi.expectresolvebyx", f('ci_expectresolvebyx')) . "</span></span></br>";
			$strOutput.=				"".nl2br(f('ci_swtoday_descfail'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}


		//-- get impacted ci that are not unavail, and we want to show on page (so people know its current status)
		$connSWDB->Query("SELECT config_itemi.* from config_itemi join config_typei on config_typei.pk_config_type = config_itemi.ck_config_type where flg_showonswtodayimpact=1 and (isimpacted='Yes' OR isfaulty='Yes') and isactivebaseline='Yes' and isdeactivated='No' and (flg_canmonitor=1 OR flg_availmntr=1)");
		while($connSWDB->fetch("ci"))
		{
			$int_counter++;
			$service_id = "service_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$service_id\",\"amber\");' src='img/icons/amber_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusImpacted'><a href='hsl:editrecord?formobj=tabCI&tab=Availability&table=config_itemi&key=".f('ci_pk_auto_id')."'>(".f('ci_ck_config_item').") ".f('ci_description')."</a> : " .f('ci_swtoday_titleimpact') ."</td>";
			$strOutput.=			"<td class='itsmItemStatus itsmStatusImpacted'>".f('ci_fk_status_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$service_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Impact (or fault) started on <span class='textblue'>".SwFormatAnalystTimestampValue("config_itemi.startedonx", f('ci_startedonx')). "</span> and is expected to be resolved by <span class='textblue'>" .SwFormatAnalystTimestampValue("config_itemi.expectresolvebyx", f('ci_expectresolvebyx')) . "</span></span></br>";
			$strOutput.=				"".nl2br(f('ci_swtoday_descimpact'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";

		}


		//-- get active ci that are not unavail, and we want to show on page (so people know its current status)
		$connSWDB->Query("SELECT config_itemi.* from config_itemi join config_typei on config_typei.pk_config_type = config_itemi.ck_config_type where flg_showonswtoday=1 and isactive='Yes' and  isactivebaseline='Yes' and isdeactivated='No' and (flg_canmonitor=1 OR flg_availmntr=1)");
		while($connSWDB->fetch("ci"))
		{
			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img src='img/icons/green_arrow.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusActive'><a href='hsl:editrecord?formobj=tabCI&tab=Availability&table=config_itemi&key=".f('ci_pk_auto_id')."'>(".f('ci_ck_config_item').") ".f('ci_description')."</a> : " .f('ci_swtoday_title') ."</td>";
			$strOutput.=			"<td class='itsmItemStatus itsmStatusActive'>".f('ci_fk_status_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
		}
	

		return $strOutput;
	}

	function output_fsc_notifications($connSWDB)
	{
		$int_counter=0;
		$strOutput = "";
		$currTime = time();
		$strSql="SELECT * from opencall where callclass='Change Request' and appcode IN(".gv("datasetfilterlist").") and status < 15 and status!=6 and itsm_schedendx > ". $currTime . " order by itsm_schedstartx asc";
		$connSWDB->Query($strSql);
		while($connSWDB->fetch("prb"))
		{
			$int_counter++;
			$prb_id = "rfc_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$prb_id\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".f('prb_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".SwFormatAnalystTimestampValue("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Change Reference</span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Start Date</span> ".SwFormatAnalystTimestampValue("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Complete By</span> ".SwFormatAnalystTimestampValue("opencall.itsm_schedendx", f('prb_itsm_schedendx'))."<br/>" .nl2br(f('prb_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}
	
	//-- ADDED
	function output_wss_notifications($connSWDB)
	{
		$int_counter=0;
		$strOutput  = "<div class='sectionHead'>";
		$strOutput .= "	<table class='sectionTitle'>";
		$strOutput .= "		<tr>";
		$strOutput .= "			<td class='titleCell'><h1>SelfService Notifications</h1></td>";
		$strOutput .= "			<td class='statusCell' width=100%>&nbsp;</td>";
		$strOutput .= "		</tr>";
		$strOutput .= "	</table>";
		$strOutput .= "</div>";
		
		$currTime = time();
		$strSql="SELECT * FROM wss_notif WHERE flg_active=1 AND ". $currTime ." < enddatex AND ". $currTime ." > startdatex AND appcode IN(".gv('datasetfilterlist').") ORDER BY sequence";
		$connSWDB->Query($strSql);
		while($connSWDB->fetch("wss"))
		{	
			$strImageColour = strToLower(f('wss_class'));

			$strOutput .=	"<table class='itemDescriptionTable'>";
			$strOutput .=		"<tr>";
			$strOutput .=			"<td class='leftCol'><img src='img/icons/".$strImageColour."_arrow.gif'/></td>";
			$strOutput .=				"<td>";
			$strOutput .= 					"<a style='text-decoration: none;color:black' href='hsl:editrecord?table=wss_notif&key=".f('wss_pk_auto_id')."'>".f('wss_description')."</a>";
			$strOutput .=				"</td>";
			$strOutput .=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput .=		"</tr>";
			$strOutput .=	"</table>";
		}
		return $strOutput;
	}
	

    function output_fsc_notifications_overview($connSWDB, $bForceShow=false, $bShowHeader=true, $bShowNarrowSummary=false)
    {
		if(!show_notifications(_CHANGESCHEDULE) && !$bForceShow) return false;

        $int_counter=0;
        
		if($bShowHeader)
		{
			$output="<div class='sectionHead'>";
			$output.="	<table class='sectionTitle'>";
			$output.="		<tr>";
			$output.="			<td class='titleCell'><h1>Change Schedule</h1></td>";
			$output.="			<td class='statusCell' width=100%>&nbsp;</td>";
			$output.="		</tr>";
			$output.="	</table>";
			$output.="</div>";
		}

		$currTime = time();
		            $connSWDB->Query("
							SELECT ci_schedule.*, callref,startx as itsm_schedstartx,itsm_title,callclass,endx AS overdue FROM opencall,ci_schedule WHERE ci_schedule.fk_callref=opencall.callref AND status != 17 AND appcode IN(".gv("datasetfilterlist").") AND ci_schedule.flg_disp_swtoday=1 AND ( status < 15 OR itsm_schedendx > 0) ORDER BY itsm_schedstartx ASC, callclass ASC ");
            $calls = array();
            while($connSWDB->fetch("prb"))
            {
                $calls[] = array(
                           'callref' => f('prb_callref'),
                           'start'   => f('prb_itsm_schedstartx'),
                           'finish'  => f('prb_overdue'),
                           'title'   => f('prb_itsm_title'),
                           'activity_title'   => f('prb_title'),
                           'activity'   => f('prb_activity'),
                           'text'    => f('prb_prob_text'),
                           'class'   => f('prb_callclass'),
                           'overdue' => (f('prb_overdue') < $currTime),
                            );
                $maxTime = max($maxTime, f('prb_overdue'));                            
			}

        if(count($calls) < 1)
        {
            return $output;
        }
        $timeRange    = array();
        $timeRange[0] = array(
                        'title'      => 'Today',
                        'from'       => strtotime('today 00:00:00'),
                        'to'         => strtotime('today 23:59:59'),
                        'dateFormat' => 'H:i',
                        );
        $timeRange[1] = array(
                        'title'      => 'Tomorrow',
                        'from'       => strtotime('tomorrow 00:00:00'),
                        'to'         => strtotime('tomorrow 23:59:59'),
                        'dateFormat' => 'H:i',
                        );
        $timeRange[2] = array(
                        'title'      => 'Later This Week',
                        'from'       => $timeRange[1]['to']+1,
                        'to'         => strtotime('tomorrow 23:59:59') + ((3600*24) * (7 - (date('w') == 0 ? 7 : date('w')+1))),
                        'dateFormat' => 'l H:i',
                        );
        $timeRange[3] = array(
                        'title'      => 'Next Week',
                        'from'       => $timeRange[2]['to']+1,
                        'to'         => $timeRange[2]['to'] + ((3600*24) * (7 - date('w', $timeRange[2]['to']))),
                        'dateFormat' => 'l H:i',
                        );
        $timeRange[4] = array(
                        'title'      => 'Later This Month',
                        'from'       => $timeRange[3]['to']+1,
                        'to'         => mktime(23, 59, 59, date('n')+1, 0, date('Y')),
                        'dateFormat' => 'D j M',
                        );
        $timeRange[5] = array(
                        'title'      => 'Next Month',
                        'from'       => max($timeRange[3]['to']+1, mktime(0, 0, 0, date('n')+1, 1, date('Y'))),
                        'to'         => mktime(23, 59, 59, date('n')+2, 0, date('Y')),
                        'dateFormat' => 'D j M',
                        );
        $timeRange[6] = array(
                        'title'      => 'Forthcoming',
                        'from'       => $timeRange[5]['to']+1,
                        'to'         => NULL,
                        'dateFormat' => 'j M Y',
                        );

        if($bShowNarrowSummary)
		{
			$output .= '<table class="fscnarrow">';
		}
		else
		{
			$output .= '<table class="fsc">';
		}
        $headingCount = 0;

		//--F0090984 - summary calendar not displayed in analyst timezone (displayed in GMT)
		$useVariableArray = &$GLOBALS;
		if (array_key_exists('config_datetimefmt', $GLOBALS))$prefix = 'config_';
		if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION))
		{
			$useVariableArray = &$_SESSION;
			$prefix = 'wc_';
		}

		$ntime = swdti_get_crt_timezone_offset($useVariableArray[$prefix.'timezone']);
		if($ntime<-1000)
			$ntime=0;

		for($x =0;$x<count($calls);$x++)
		{
			$calls[$x]['start'] = $calls[$x]['start']+$ntime;
			$calls[$x]['finish'] = $calls[$x]['finish']+$ntime;
		}
		//--END F0090984 - summary calendar not displayed in analyst timezone (displayed in GMT)

		foreach($timeRange as $rangeId=>$range)
        {
            if($range['from'] >= $range['to'] && $range['to'] !== NULL)
            {
                continue;
            }
            $hasCalls = FALSE;
            foreach($calls as $call)
            {
                if(($range['to'] === NULL || $call['start'] <= $range['to']) && $call['finish'] >= $range['from'])
                {
                    $hasCalls = TRUE;                    
                }elseif($rangeId == 0 && $call['overdue'])
                {
                    $hasCalls = TRUE;
                }
            }

            if(!$hasCalls)
            {
				continue;
            }

            $rangeStr = date('l jS M Y', $range['from']);
            if($range['to'] != NULL)
            {
                if(date('l jS M Y', $range['from']) != date('l jS M Y', $range['to']))
                {
                    $rangeStr .= ' - '
                              .  date('l jS M Y', $range['to'])
                              ;
                }
            }
            else
            {
                $rangeStr .= ' +';
            }
            $output .= '<tr>';
            if($headingCount == 0)
            {
                $output .= '<th colspan="4" class="first" title="'.htmlentities($rangeStr,ENT_QUOTES,'UTF-8').'">';
            }
            else
            {
                $output .= '<th colspan="4" title="'.htmlentities($rangeStr,ENT_QUOTES,'UTF-8').'">';
            }
            $headingCount++;
            $output .=  htmlentities($range['title'],ENT_QUOTES,'UTF-8')
                    .  '</th></tr>'
                    ;
            foreach($calls as $call)
            {
                if(($range['to'] === NULL || $call['start'] <= $range['to']) && $call['finish'] >= $range['from'] || ($rangeId == 0 && 

$call['overdue']) )
                {
                    $time = array('start'=>'', 'finish'=>'');
                    if($range['to'] !== NULL && $call['start'] < $range['from'] && $call['finish'] > $range['to'])
                    {
                        $time = NULL;
                    }
                    else
                    {
                        if($call['start'] >= $range['from'])
                        {
                            $time['start'] = date($range['dateFormat'], $call['start']);
                        }
                        if($call['finish'] <= $range['to'] || $range['to'] === NULL)
                        {
                            $time['finish'] = date($range['dateFormat'], $call['finish']);
                        }
                    }
                    if($call['start'] <= time() && $call['finish'] > time())
                    {
                        $output .= '<tr class="active">';                        
                    }
                    elseif($call['overdue'])
                    {
                        $output .= '<tr class="overdue">';
                    }
                    else
                    {
                        $output .= '<tr>';
                    }
                    if($time === NULL)
                    {
                        $output .= '<td colspan="2" class="ongoing" title="Ongoing since '.htmlentities(date('l jS M Y H:i', $call['start']),ENT_QUOTES,'UTF-8').'">Ongoing</td>';
                    }
                    elseif($call['overdue'])
                    {
						//--F0090984 - calculation done in GMT so take off timezone
                        $overdueTotal   = time() - $call['finish']+$ntime;
						//--END F0090984 - calculation done in GMT so take off timezone
                        $overdueDays    = floor($overdueTotal / (3600 * 24));
                        $overdueHours   = floor(($overdueTotal - ($overdueDays * (3600 * 24))) / 3600);
                        $overdueMinutes = floor(($overdueTotal - ($overdueDays * (3600 * 24)) - ($overdueHours * 3600)) / 60);
                        $overdueLabel   = 'Overdue ';
                        if($overdueDays > 0)
                        {
                            $overdueLabel .= sprintf('%1$d days %2$02d hours %3$02d minutes', $overdueDays, $overdueHours, $overdueMinutes);
                        }
                        elseif($overdueHours > 0)
                        {
                            $overdueLabel .= sprintf('%2$02d hours %3$02d minutes', $overdueDays, $overdueHours, $overdueMinutes);
                        }
                        else
                        {
                            $overdueLabel .= sprintf('%3$02d minutes', $overdueDays, $overdueHours, $overdueMinutes);
                        }
                        $output .= '<td colspan="2" class="overdue" title="Due '.htmlentities(date('l jS M Y H:i', $call['finish']),ENT_QUOTES,'UTF-8').'">'.htmlentities($overdueLabel,ENT_QUOTES,'UTF-8').'</td>';
                    }
                    else
                    {
                        if($time['start'])
                        {
                            $output .= '<td class="starttime" title="'.htmlentities(date('l jS M Y H:i', $call['start']),ENT_QUOTES,'UTF-8').'">'.htmlentities($time['start'],ENT_QUOTES,'UTF-8').'</td>';
                            $hasStart = TRUE;
                        }
                        else
                        {
                            $output .= '<td class="ongoing" title="Ongoing since '.htmlentities(date('l jS M Y H:i', $call['start']),ENT_QUOTES,'UTF-8').'">Ongoing</td>';
                            //$output .= '<td></td>';
                            $hasStart = FALSE;
                        }
                        if($time['finish'])
                        {
                            if($hasStart)
                            {
                                $startParts  = explode(' ', $time['start']);
                                $finishParts = explode(' ', $time['finish']);
                                for($i = 0; $i < count($startParts); $i++)
                                {
                                    if($finishParts[$i] != $startParts[$i])
                                    {
                                        $time['finish'] = implode(' ', array_slice($finishParts, $i));
                                        break;
                                    }
                                }
                                if($time['finish'] == '')
                                {
                                    $time['finish'] = implode(' ', $finishParts);
                                }
                            }
                            $output .= '<td class="finishtime" title="'.htmlentities(date('l jS M Y H:i', $call['finish']),ENT_QUOTES,'UTF-8').'">'.htmlentities($time['finish'],ENT_QUOTES,'UTF-8').'</td>';
                        }
                        else
                        {
                            $output .= '<td class="ongoing" title="Ongoing until '.htmlentities(date('l jS M Y H:i', $call['finish']),ENT_QUOTES,'UTF-8').'">Ongoing</td>';
                            //$output .= '<td></td>';
                        }
                    }
                    $output .= '<td class="info">'
                            .  '<a href="hsl:calldetails?callref='.swcallref_str($call['callref']).'" class="'.strtolower(str_replace(' ', '', $call['class'])).'">'
                            .  swcallref_str($call['callref'])
                            .  '</a>'
                            .  $call['title'];
							if($call['activity']!="")
								$output .= ' - '.$call['activity'];
							if($call['activity_title']!="")
								$output .= ' - '.$call['activity_title'];
                             $output.=  '</td>'
                            .  '</tr>'
                            ;
                }
            }
        }
        $output .= '</table>';
        
        return $output;
    }
    	
	////F0102566: OutPut HTML Used for Show BPM Authorisations
	
	function output_bpm_authorisations($connSWDB)
	{
		if(!show_notifications(_AUTH)) return false;
		$strOutput ='';
		$int_counter=0;

		$strOutput="<div class='sectionHead'>";
		$strOutput.="	<table class='sectionTitle'>";
		$strOutput.="		<tr>";
		$strOutput.="			<td class='titleCell'><h1>Requests Awaiting Authorisation</h1></td>
								<td class='statusCell' width=100%>&nbsp;</td>";
		$strOutput.="		</tr>";
		$strOutput.="	</table>";
		$strOutput.="</div>";
		
		$connSWDB->Query("SELECT callref, itsm_title, logdatex, fixbyx, prob_text from opencall, bpm_oc_auth where bpm_oc_auth.fk_auth_id ='".pfs(gv("analystid"))."' and opencall.callref = bpm_oc_auth.fk_callref and bpm_oc_auth.status = 'Pending authorisation' AND bpm_stage_id = fk_stage_id and bpm_oc_auth.authortype = 'Analyst' and opencall.status < 15 and opencall.status!=6 and appcode IN(".gv("datasetfilterlist").")");
		while($connSWDB->fetch("auth"))
		{
			$int_counter++;
			$prb_id = "auth_" . $int_counter;
			
			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"".$prb_id."\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".swcallref_str(f('auth_callref'))." - ".f('auth_itsm_title')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Call Reference</span> <a href='hsl:calldetails?callref=".f('auth_callref')."'>".swcallref_str(f('auth_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Raised on</span> ".SwFormatAnalystTimestampValue("opencall.logdatex", f('auth_logdatex'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Resolve by</span> ".SwFormatAnalystTimestampValue("opencall.fixbyx", f('auth_fixbyx'))."<br/>" .nl2br(f('auth_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		
		return $strOutput;
	}
	
    function output_fsc_calendar(&$connSWDB)
    {
        $currTime = time();
            $connSWDB->Query("
							SELECT ci_schedule.*, callref,startx as itsm_schedstartx,itsm_title,callclass,endx AS overdue FROM
                              opencall,ci_schedule
                            WHERE
							  ci_schedule.fk_callref=opencall.callref 
							  AND appcode IN(".gv("datasetfilterlist").")
                              AND (
                                  status < 15
                                  OR itsm_schedendx > 0
                                  )
                            ORDER BY
                              itsm_schedstartx ASC,
                              callclass ASC
                            ");
            $maxTime = strtotime('next month');
            $calls = array();
            while($connSWDB->fetch("prb"))
            {
                $calls[] = array(
                           'callref' => f('prb_callref'),
                           'start'   => f('prb_itsm_schedstartx'),
                           'finish'  => f('prb_overdue'),
                           'title'   => f('prb_itsm_title'),
                           'activity_title'   => f('prb_title'),
                           'activity'   => f('prb_activity'),
                           'text'    => f('prb_prob_text'),
                           'class'   => f('prb_callclass'),
                           'overdue' => (f('prb_overdue') < $currTime),
                            );
                $maxTime = max($maxTime, f('prb_overdue'));                            
            }

			if(count($calls) < 1)
            {
                $y = date('Y');
                $m = date('m');
                $d = 1;
            }
            else
            {
                $y = date('Y', $calls[0]['start']);
                $m = date('m', $calls[0]['start']);
                $d = 1;                
            }
            $output = '<div class="fsc-container">';
            
            $today = date('Ymd');
            
                        
            $start  = mktime(0, 0, 0, $m, $d, $y);
            $finish = mktime(0, 0, -1, date('m', $maxTime) + 1, $d, date('Y', $maxTime));
            
            $dMin = $d;
            $dMax = $d;
            // Make sure we start on a monday
            while(1)
            {
                $time = mktime(0, 0, 0, $m, $dMin, $y);
                if(date('w', $time) == 1)
                {
                    break;
                }
                $dMin--;
            }
            // Make sure we end on a sunday
            while(1)
            {
                $time = mktime(0, 0, 0, $m, $dMax, $y);
                if($time > $finish && date('w', $time) == 0)
                {
                    break;
                }
                $dMax++;
            }
            // Build meta data...
            $data = array(
                    'week' => array(
                              0 => array(
                                   'itemCount' => 0,
                                   'render'    => array(),
                                   ),
                              ),
                    'day'  => array(),
                    );
            $w = 0;
            for($d = $dMin; $d <= $dMax; $d++)
            {
                $dayStart  = mktime(0, 0, 0, $m, $d, $y);
                $dayFinish = mktime(0, 0, -1, $m, $d + 1, $y);
                $data['day'][$d] = array(
                                   'item'   => array(),
                                   'render' => array(),
                                   );
                foreach($calls as $call)
                {
                    if(
                         ($call['start'] >= $dayStart && $call['start'] <= $dayFinish)
                      || ($call['finish'] >= $dayStart && $call['finish'] <= $dayFinish)
                      || ($call['start'] <= $dayStart && $call['finish'] >= $dayFinish)                         
                      || ($call['overdue'] && date('Ymd', $dayStart) >= $call['start'])
                      )
                    {
                        $data['day'][$d]['item'][] = $call;
                    }
                }
                $data['week'][$w]['itemCount'] = max($data['week'][$w]['itemCount'], count($data['day'][$d]['item']));
                if($d > $dMin && date('w', $dayStart) == 1)
                {
                    $w++;
                    $data['week'][$w] = array(
                                        'itemCount' => 0,
                                        'render'    => array(),
                                        );
                }                    
            }
            // Render output.
            $weekOutput = '';
            $weekSize   = 1;
            $w = 0;
            for($d = $dMin; $d <= $dMax; $d++)
            {
                $dayStart  = mktime(0, 0, 0, $m, $d, $y);
                $dayFinish = mktime(0, 0, -1, $m, $d + 1, $y);
                $class  = 'fsc-day';
                $class .= ' fsc-day-'.strtolower(date('l', $dayStart));
                if(date('Ymd', $dayStart) == date('Ymd'))
                {
                    $class .= ' fsc-day-today';
                }
                if(date('n', $dayStart) % 2 == 0)
                {
                    if(substr(date('D', $dayStart), 0, 1) == 'S')
                    {
                        $class .= ' fsc-month-even-weekend';
                    }
                    else
                    {
                        $class .= ' fsc-month-even';
                    }                    
                }
                else
                {                    
                    if(substr(date('D', $dayStart), 0, 1) == 'S')
                    {
                        $class .= ' fsc-month-odd-weekend';
                    }
                    else
                    {
                        $class .= ' fsc-month-odd';
                    }                    
                }                
                if($d > $dMin && date('w', $dayStart) == 1)
                {
                    //$output .= '<div class="fsc-week fsc-week-size'.$weekSize.'">'.$weekOutput.'</div>';
					$output .= '<div class="fsc-week" style="height:'.$dayHeight.'em">'.$weekOutput.'</div>';

                    $w++;
                    $weekOutput = '';
                    $weekSize   = 1;
                }
                $weekOutput .= '<div class="'.$class.'">';
                if(date('Ymd', $dayStart) == $today)
                {
                    $weekOutput .= '<a name="today"></a>';
                }
                $weekOutput .= '<p class="fsc-daylabel">'.htmlentities(date('j M Y', $dayStart),ENT_QUOTES,'UTF-8').'</p>';
                foreach($data['day'][$d]['item'] as $call)
                {
                    if(!in_array($call, $data['week'][$w]['render']))
                    {
                        $callClass  = 'fsc-call';
                        $emClass    = '';
                        $aClass     = '';
                        // calculate call span value
                        $callSpan   = 1;
                        if(date('w', $dayStart) != 0)
                        {
                            for($i = date('w', $dayStart); $i <= 6; $i++)
                            {
                                if(date('Ymd', $call['start']) == date('Ymd', mktime(0, 0, -1, $m, $d + $callSpan, $y)))
                                {
                                    $emClass .= ' fsc-call-start'; 
                                }
                                if($call['finish'] >= mktime(0, 0, -1, $m, $d + $callSpan, $y))
                                {
                                    $callSpan++;
                                }
                                if(date('Ymd', $call['finish']) == date('Ymd', mktime(0, 0, -1, $m, $d + $callSpan, $y)))
                                {
                                    $emClass .= ' fsc-call-finish'; 
                                }
                            }
                            $callClass .= ' fsc-call-span'.$callSpan;
                        }elseif (date('w', $dayStart) ==0)
						{
                                    $emClass .= ' fsc-call-start'; 
                            $callClass .= ' fsc-call-span1';
						}
                        // calculate render stack offset...
                        $callOffset = -1;
                        while(1)
                        {
                            $callOffset++;
                            if(isset($data['day'][$d]['render'][$callOffset]))
                            {
                                continue;
                            }
                            for($i = 1; $i < $callSpan; $i++)
                            {
                                if(isset($data['day'][$d + 1]['render'][$callOffset]))
                                {
                                    continue 2;
                                }
                            }
                            break;
                        }        
                        for($i = 0; $i < $callSpan; $i++)
                        {
                            $data['day'][$d + $i]['render'][$callOffset] = $call;
                        }

						//-- nwj - 12-11-2008 - work out size of day div based on number of calls to be displayed in the day.
						//-- this saves uis from having to use limitation of fixed number of css styles.
                        $weekSize = max($weekSize, $callOffset + 1);
						$dayHeight=10.5;
						if($weekSize>2)
						{
							$dayHeight = (($weekSize - 2) * 4) + 10.5;
						}
                        // render...
                        
						//--
						//-- nwj - 15.03.2010 -	#84217 set item top so does not overlap after 14.
						if($callOffset==0)
						{
							$intItemTop = 2;
						}
						else
						{
							$intItemTop = ($callOffset * 4) + 2;
						}
                        $callClass .= ''; //'fsc-call-offset'.$callOffset;
						//-- eof #84217


                        $aClass    .= ' '.strtolower(str_replace(' ', '', $call['class']));
                        if($call['overdue'])
                        {
                            $aClass .= ' fsc-call-overdue';
                        }
						$displayText = $call['title'];
						if($call['activity']!="")
							$displayText .= ' - '.$call['activity'];
						if($call['activity_title']!="")
							$displayText .= ' - '.$call['activity_title'];
						//-- #84217 - add intitemtop
                        $weekOutput .= '<p class="'.$callClass.'"  style="top:'.$intItemTop.'em;">'
                                     . '<em class="'.$emClass.'"><span title="'.$displayText.'">'
                                     . '<a href="hsl:calldetails?callref='.swcallref_str($call['callref']).'" title="'.swcallref_str($call['callref']).'" class="'.$aClass.'">'
                                     . swcallref_str($call['callref'])
                                     . '</a>'
									 . '<br />'.$displayText;
                                    $weekOutput .= '</span></em></p>';

                        $data['week'][$w]['render'][] = $call;
                    }
                }
                $weekOutput .= '</div>';
            }
			
           // $output .= '<div class="fsc-week fsc-week-size'.$weekSize.'">'.$weekOutput.'</div>';
			$output .= '<div class="fsc-week" style="height:'.$dayHeight.'em">'.$weekOutput.'</div>';
            $output .= '</div>';
            $output .= '</div>';
            return $output;
            
    }    
	
	function output_fsr_notifications($connSWDB)
	{
		$int_counter=0;
		$strOutput = "";
		$currTime = time();
		$connSWDB->Query("SELECT * from opencall where callclass='Release Request' and appcode IN(".gv("datasetfilterlist").") and itsm_swtoday_on=1 and status < 15 and itsm_schedendx > ". $currTime . " order by itsm_schedstartx asc");
		while($connSWDB->fetch("prb"))
		{
			$int_counter++;
			$prb_id = "rel_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$prb_id\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".f('prb_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".SwFormatAnalystTimestampValue("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Release Reference</span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Release Date</span> ".SwFormatAnalystTimestampValue("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Complete By</span> ".SwFormatAnalystTimestampValue("opencall.itsm_schedendx", f('prb_itsm_schedendx'))."<br/>" .nl2br(f('prb_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}

	//-- create a new active page session
	$session = new classActivePageSession(gv('sessid'));
	$boolValidSession=true;
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		$boolValidSession=false;
		?>
			<html>
				<head>
					<meta http-equiv="Pragma" content="no-cache">
					<meta http-equiv="Expires" content="-1">
					<title>Support-Works Session Authentication Failure</title>
						<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
				</head>
					<body>
						<br><br>
						<center>
							<span class="error">
								There has been a session authentication error<br>
								Please contact your system administrator.
							</span>
						</center>
					</body>
			</html>
		<?php	
		exit;
	}//end if session is not valid

	//-- make sure we have analystid
	$analystid = strToLower(gv('analystid'));
	$password = gv('password');

	//--
	//-- Create connection to syscache
	$connCache = new CSwDbConnection();
	if(!$connCache->CacheConnect($analystid,$password))
	{
		echo "Failed to connect to the Supportworks system database. Please contact your Administrator";
		exit;
	}

	//--
	//-- load datadictionary info
	//swdti_load($dd);

	//$connCache->LoadDataDictionary($dd);


	//-- create a connection to swdata
	$connSwdata = new CSwDbConnection();
	if(!$connSwdata->Connect(swdsn(),swuid(),swpwd()))
	{
		echo "Failed to connect to ".swdsn().". Please contact your Administrator";
		exit;
	}

	//--
	//-- 1. Get todays Day, Month and Year based on server time
	$today = getdate();
	$cal_day = $today['mday'];
	$cal_weekday = $today['weekday'];
	$cal_month = $today['month'];
	$cal_year = $today['year'];
	$cal_thrdst = get_date_dayformat($cal_day);

	//--
	//-- 2. Get a counter values for incidents, problems, known errors, change requests and known errors for this user and his/her group
	$connCache->Query("SELECT name AS analystname, supportgroup AS analystgroup FROM swanalysts where analystid = '".pfs($analystid)."'");
	$connCache->Fetch();
		
	//-- get incident counts
	$int_myincidentcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='incident' and status < 15 and itsm_majorinc!=1");
	$int_escincidentcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='incident' and itsm_majorinc!=1");
	$int_groupincidentcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='incident' and status < 15 and itsm_majorinc!=1");	
	$int_groupescincidentcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='incident' and itsm_majorinc!=1");

	//-- get major incident counts
	$int_mymajorincidentcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='incident' and status < 15 and itsm_majorinc=1");
	$int_majorescincidentcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='incident' and itsm_majorinc=1");
	$int_majorgroupincidentcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='incident' and status < 15 and itsm_majorinc=1");	
	$int_majorgroupescincidentcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='incident' and itsm_majorinc=1");


	//-- get service request counts
	$int_mysrcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='Service Request' and status < 15");
	$int_escsrcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='Service Request'");
	$int_groupsrcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='Service Request' and status < 15");	
	$int_groupescsrcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='Service Request'");

	//-- get problem counts
	$int_myproblemcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='problem' and status < 15");
	$int_escproblemcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='problem'");
	$int_groupproblemcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='problem' and status < 15");	
	$int_groupescproblemcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='problem'");

	//-- get error counts
	$int_myerrorcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='known error' and status < 15");
	$int_escerrorcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='known error'");
	$int_grouperrorcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='known error' and status < 15");	
	$int_groupescerrorcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='known error'");
	
	//-- get rfc counts
	$int_myrfccount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='change request' and status < 15");
	$int_escrfccount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='change request'");
	$int_grouprfccount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='change request' and status < 15");	
	$int_groupescrfccount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='change request'");
		
	//-- get rel counts
	$int_myrelcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and callclass='release request' and status < 15");
	$int_escrelcount = $connCache->GetRecordCount("opencall", "owner = '".pfs($analystid)."' and appcode IN(".gv("datasetfilterlist").") and status = 9 and callclass='release request'");
	$int_grouprelcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and callclass='release request' and status < 15");	
	$int_groupescrelcount = $connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and appcode IN(".gv("datasetfilterlist").") and status in (9,10,11) and callclass='release request'");

	//--
	//-- 3. Get a counter values for problems and known errors that should be displayed on swtoday
	$int_problemcount = $connCache->GetRecordCount("opencall", "callclass='problem' and appcode IN(".gv("datasetfilterlist").") and status < 15 and itsm_swtoday_on = 1");
	$int_errorcount = $connCache->GetRecordCount("opencall", "callclass='known error' and appcode IN(".gv("datasetfilterlist").") and status < 15 and itsm_swtoday_on = 1");



	//--
	//-- DJH - New Code for Summary charts Section
	//--

	function showCharts($strTabFormName)
	{
		$retForm = new oTabForm;
		$retForm->xmlRoot = open_chartxml($strTabFormName);
		$retForm->controlname=$strTabFormName;
		return $retForm;	
	}

	//--
	//-- open a tab xml def and return root document
	function open_chartxml($strTabFormName)
	{
		//-- open xml file based on tabformname
		$strFileName = $GLOBALS['swInstallPath']."\html\clisupp\swtoday\\".$GLOBALS['dd']."\charts\xml\\".$strTabFormName.".xml";
//		echo $strFileName;
		$xmlfile = load_file($strFileName);
		$xmlDoc = domxml_open_mem($xmlfile);
		$root = $xmlDoc->document_element();
		return $root;
	}



	//-- DJH - Access function to determine whether to show specific report tabs as set in general settings->SW Today
	function showSWReportTab($tabid)
	{
		global $rsSWTodaySettings;
		
		if(count($rsSWTodaySettings)!=0)
		{
				return $rsSWTodaySettings["SWTODAY.REPORTTAB" . $tabid . ".SHOW"]=="True";
		}
		return false;
	}

	function loadSWTodaySettings()
	{
		global $rsSWTodaySettings;
		//-- connect to swdata
		$connDB = new CSwDbConnection;
		if($connDB->SwDataConnect())
		{
			$strQuery="select setting_name, setting_value from sw_sbs_settings where toplevelcategory = 'SWTODAY' and appcode = '" . gv('dataset') . "'";
			$connDB->Query($strQuery);
			
			while($connDB->Fetch())
			{
				$arrSystemSettings[$connDB->GetValue("setting_name")] = $connDB->GetValue("setting_value");
			}
			return $arrSystemSettings;
		}
	}

	function showReportTabs()
	{	
		global $rsSWTodaySettings;

		if(count($rsSWTodaySettings)!=0)
		{
			if(($rsSWTodaySettings["SWTODAY.REPORTTAB1.SHOW"]=="True") || ($rsSWTodaySettings["SWTODAY.REPORTTAB2.SHOW"]=="True") || ($rsSWTodaySettings["SWTODAY.REPORTTAB3.SHOW"]=="True"))
			{
				return true;
			}
		}
		return false;
	}	

	function show_notifications($strSettingName)
	{
		global $rsSWTodaySettings;
		
		if(count($rsSWTodaySettings)!=0)
		{
			return $rsSWTodaySettings[$strSettingName]=="True";
		}
		return false;
		
	}
	
	//-- determine css to use
	$cssFile = "structure.css";
	$colorid = isset($_GET['ColourScheme'])?$_GET['ColourScheme']:$_POST['ColourScheme'];
	//Check are we in webclient
	$boolWC = isset($GLOBALS['_webclient']);
	//If In Webclient Set ColorID to Silver
	if($boolWC)$colorid = 4;
	switch($colorid)
	{
		//ES -- ITSM Active Pages - point each colour scheme to corresponding css
		case 1: //Office 2007 > Light Blue
		case 2: //Office 2007 > Blue
			$cssFile = "blue.css";
			break;
		case 3: //Office 2007 > Black
		case 4: //Office 2007 > Silver
		case 7: //Office 2010 > Black
		Case 8: //Office 2010> Silver
			$cssFile = "silver.css";
			break;
		case 5: //Office 2007 > Aqua
			$cssFile = "aqua.css";
			break;
		case 6: //Office 2010 > Blue
			$cssFile = "2010_blue.css";
			break;	
		case 10: //Vista > Blue
		case 11: //Vista > Black
		Case 12: //Vista > Silver
			$cssFile = "vista_colour.css";
			break;
		case 13: //WinXp > Royale
		case 16: //WinXp > Luna Blue
			$cssFile = "winxp1.css";
			break;
		case 14: //Luna Homestead
			$cssFile = "green.css";
			break;
		case 15: //Luna Metallic
			$cssFile = "winxp2.css";
			break;
			
		default: //default to be Silver
			$cssFile = "silver.css";
	}
	//-- eof scheme check
?>