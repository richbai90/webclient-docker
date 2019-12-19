<?php
	//-- NWJ - Data file for itsm_index.php
	//--	   Used to fetch record counts, datasets and set the time
	include_once('stdinclude.php');
	include_once('itsmf/xmlmc/resultparser.php');

	set_time_limit (120);


	function f($strName)
	{
 	     return 	$GLOBALS[$strName];
		//return lang_decode_to_utf($GLOBALS[$strName]);
	}

	//-- return html used to display problem notifications
	function output_problem_notifications($connSWDB,$strWhere)
	{

		$strOutput = "";

		$strStateCriteria="";
		if($strWhere!="")$strStateCriteria.=" and " . $strWhere;
		$connSWDB->Query("SELECT * from opencall where callclass='Problem' and itsm_swtoday_on=1 and status < 15" . $strStateCriteria);
		
		while($connSWDB->fetch("prb"))
		{
		
			$prb_id = "problem_" . f('prb_callref');

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"".$prb_id."\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".f('prb_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".f('prb_itsm_impact_level')."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Problem Reference : </span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Problem State : </span> ".f('prb_prb_state')."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Raised on : </span> ".SwFormatDateTimeColumn("opencall.logdatex", f('prb_logdatex'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Resolve by : </span>".SwFormatDateTimeColumn("opencall.fixbyx", f('prb_fixbyx'))."<br/>" .nl2br(f('prb_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}


	function output_mail_messages($conn)
	{
		$strOutputHTML = "";
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam('analystId',$_SESSION['wc_analystid']);
		$xmlmc->Invoke("mail","getAnalystMailboxRights");
		$strLastError = $xmlmc->GetLastError();
		if($strLastError=="")
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("mailbox");
			foreach ($arrDM as $val)
			{
				$mbname =_getxml_childnode_content($val,"name");
				$MailboxNames[$mbname] = _getxml_childnode_content($val,"displayName");
			}
		}		
		if(Is_Array($MailboxNames))
		{
			while( list($mbname, $displayname) = each($MailboxNames) )
			{
				$xmlmc = new XmlMethodCall();
				$xmlmc->SetParam('mailbox',$mbname);
				$xmlmc->Invoke("mail","getMailboxList");

				$strLastError = $xmlmc->GetLastError();
				if($strLastError=="")
				{
					$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("mailbox");
					foreach ($arrDM as $val)
					{
						$MailboxTypes[$mbname] = _getxml_childnode_content($val,"type");
					}
				}
			}
		}
		

		// We are finished with the query result set, so we can use the connection for the next step
		if(Is_Array($MailboxNames))
		{
			foreach($MailboxNames as $mbname=>$displayname)
			{
				$mbtype = $MailboxTypes[$mbname];

				$xmlmc = new XmlMethodCall();
				$xmlmc->SetParam('mailbox',$mbname);
				$xmlmc->Invoke("mail","getFolderList");
				$strLastError = $xmlmc->GetLastError();
				if($strLastError=="")
				{
					$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("folder");
					foreach ($arrDM as $val)
					{
						$folderId = _getxml_childnode_content($val,"folderId");
						if($folderId==1)
						{
							$unreadcount = _getxml_childnode_content($val,"folderUnreadCount");
							continue;
						}
					}
				}
				else
				{
					$strOutputHTML .= 'Unable to query unread message count';
				}
				$xmlmc = new XmlMethodCall();
				$xmlmc->SetParam('mailbox',$mbname);
				$xmlmc->SetParam('folderId',1);
				$xmlmc->Invoke("mail","getMessageCount");
				$strLastError = $xmlmc->GetLastError();
				if($strLastError=="")
				{
						$messagecount =$xmlmc->GetParam("messageCount");
				}
				else
				{
					$strOutputHTML .= 'Unable to query unread message count';
				}
				$AppendDisplayName = ($mbtype == 1)?"'s Mail":" Mail";
			
				$strOutputHTML.='<tr>';
				$strOutputHTML.=	'<td><a href="hsl:mail?mailbox='.$mbname.'">'.$displayname.$AppendDisplayName.'</a></td>';
				$strOutputHTML.=	'<td class="actionItemCount">'.$messagecount.' (Unread '.$unreadcount.')</td>';
				$strOutputHTML.='</tr>';

			}//end while records are found
		}//end if mailbox names is an array

		return	$strOutputHTML;
	}


	function output_fsc_notifications($connSWDB)
	{
		$int_counter=0;
		$strOutput = "";
		$currTime = time();
		$connSWDB->Query("SELECT * from opencall where callclass='Change Request' and itsm_swtoday_on=1 and status < 15 and itsm_schedendx > ". $currTime . " order by itsm_schedstartx asc");
		while($connSWDB->fetch("prb"))
		{
			$int_counter++;
			$prb_id = "rfc_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$prb_id\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".f('prb_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".SwFormatDateTimeColumn("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Change Reference</span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Start Date</span> ".SwFormatDateTimeColumn("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Complete By</span> ".SwFormatDateTimeColumn("opencall.itsm_schedendx", f('prb_itsm_schedendx'))."<br/>" .nl2br(f('prb_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}

    function output_fsc_notifications_overview($connSWDB)
    {
        $int_counter=0;
        $strOutput = "";
        $currTime = time();
        $connSWDB->Query("
                        SELECT
							callref,itsm_schedstartx,itsm_title,callclass,itsm_schedendx AS overdue
                        FROM
                          opencall
                        WHERE
                          callclass IN ('Change Request', 'Release Request')
                          AND itsm_swtoday_on=1
						  AND status != 17
                          AND (
                              status < 15
                              OR itsm_schedendx > $currTime
                              )
                        ORDER BY
                          itsm_schedstartx ASC,
                          callclass ASC
                        ");
        $calls = array();
        while($connSWDB->fetch("prb"))
        {
            $calls[] = array(
                       'callref' => f('prb_callref'),
                       'start'   => f('prb_itsm_schedstartx'),
                       'finish'  => f('prb_overdue'),
                       'title'   => f('prb_itsm_title'),
                       'text'    => f('prb_prob_text'),
                       'class'   => f('prb_callclass'),
                       'overdue' => (f('prb_overdue') < $currTime),
                        );
        }
        if(count($calls) < 1)
        {
            return '';
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
                       
        $output = '<table class="fsc">';
        $headingCount = 0;
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
                if(($range['to'] === NULL || $call['start'] <= $range['to']) && $call['finish'] >= $range['from'] || ($rangeId == 0 && $call['overdue']) )
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
                        $overdueTotal   = time() - $call['finish'];
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
                            .  '<a href="hsl:calldetails?callref='.htmlentities($call['callref'],ENT_QUOTES,'UTF-8').'" class="'.htmlentities(strtolower(str_replace(' ', '', $call['class'])),ENT_QUOTES,'UTF-8').'">'
                            .  htmlentities(swcallref_str($call['callref']),ENT_QUOTES,'UTF-8')
                            .  '</a>'
                            .  htmlentities($call['title'],ENT_QUOTES,'UTF-8')
                            .  '</td>'
                            .  '</tr>'
                            ;
                }
            }
        }
        $output .= '</table>';
        
        return $output;
    }
    
    function output_fsc_calendar(&$connSWDB)
    {
        $currTime = time();
            $connSWDB->Query("
                            SELECT
								callref,itsm_schedstartx,itsm_title,callclass,itsm_schedendx AS overdue 
							FROM
                              opencall
                            WHERE
                              callclass IN ('Change Request', 'Release Request')
                              AND itsm_schedendx != 0
                              AND itsm_schedstartx != 0
							  AND status != 17
                              AND (
                                  status < 15
                                  OR itsm_schedendx > $currTime
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
					//reset dayheight so if there are no calls in the upcoming weeks they will be normal size, not max size
					$dayHeight = 10.5;
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

                        $aClass    .= ' '.htmlentities(strtolower(str_replace(' ', '', $call['class'])),ENT_QUOTES,'UTF-8');
                        if($call['overdue'])
                        {
                            $aClass .= ' fsc-call-overdue';
                        }
						 $weekOutput .= '<p class="'.$callClass.'"  style="top:'.$intItemTop.'em;">'
                                     . '<em class="'.$emClass.'"><span>'
                                     . '<a href="hsl:calldetails?callref='.htmlentities($call['callref'],ENT_QUOTES,'UTF-8').'" class="'.$aClass.'">'
                                     . htmlentities(swcallref_str($call['callref']),ENT_QUOTES,'UTF-8')
                                     . '</a>'
									 . '<br/>'.htmlentities($call['title'],ENT_QUOTES,"UTF-8")
                                     . '</span></em></p>'
									 
                                     ;
						//var_dump(htmlentities($weekOutput));
                        $data['week'][$w]['render'][] = $call;

						//calculate if the text will wrap
						$spanTextLength = $callSpan*20;
						$intLengthText = strlen($call['title']);
						$ratio = $intLengthText/$spanTextLength;

						while($ratio>1)
						{
							$callOffset++;
							$data['day'][$d]['render'][$callOffset] = $call;
							for($i = 0; $i < $callSpan; $i++)
							{
								$data['day'][$d + $i]['render'][$callOffset] = $call;
							}
							$ratio = $ratio-2;
						}

 						//-- nwj - 12-11-2008 - work out size of day div based on number of calls to be displayed in the day.
						//-- this saves uis from having to use limitation of fixed number of css styles.
                        $weekSize = max($weekSize, $callOffset + 1);
						$dayHeight=10.5;
						if($weekSize>2)
						{
							$dayHeight = (($weekSize - 2) * 4) + 10.5;
						}
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
		$connSWDB->Query("SELECT * from opencall where callclass='Release Request' and itsm_swtoday_on=1 and status < 15 and itsm_schedendx > ". $currTime . " order by itsm_schedstartx asc");
		while($connSWDB->fetch("prb"))
		{
			$int_counter++;
			$prb_id = "rel_" . $int_counter;

			$strOutput.="<div class='itemWrapper'>";
			$strOutput.=	"<table class='itemTitle'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'><img onclick='expand_collapse(this,\"$prb_id\",\"blue\");' src='img/icons/blue_expand.gif'/></td>";
			$strOutput.=			"<td class='itsmStatusInactive textblue'>".f('prb_itsm_title')."</td>";
			$strOutput.=			"<td class='itsmItemStatus textblue'>".SwFormatDateTimeColumn("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.="</div>";
			$strOutput.="<div id='".$prb_id."' expanded='0' class='itemDisplayNone'>";
			$strOutput.=	"<table class='itemDescriptionTable'>";
			$strOutput.=		"<tr>";
			$strOutput.=			"<td class='leftCol'>&nbsp;</td>";
			$strOutput.=			"<td><span class='itemDescriptionEmph'>Release Reference</span> <a href='hsl:calldetails?callref=".f('prb_callref')."'>".swcallref_str(f('prb_callref'))."</a><br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Release Date</span> ".SwFormatDateTimeColumn("opencall.itsm_schedstartx", f('prb_itsm_schedstartx'))."<br/>";
			$strOutput.=				"<span class='itemDescriptionEmph'>Complete By</span> ".SwFormatDateTimeColumn("opencall.itsm_schedendx", f('prb_itsm_schedendx'))."<br/>" .nl2br(f('prb_prob_text'));
			$strOutput.=			"</td>";
			$strOutput.=			"<td class='rightCol rightpad'>&nbsp;</td>";
			$strOutput.=		"</tr>";
			$strOutput.=	"</table>";
			$strOutput.= "</div>";
		}
		return $strOutput;
	}

	//-- create a new active page session
	$session = new ClassActivePageSession(gv('sessid'));
	$boolValidSession=true;
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		$boolValidSession=false;
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
	$connCache->Query("SELECT name AS analystname, supportgroup AS analystgroup FROM swanalysts where analystid = '".PrepareForSql($analystid)."'");
	$connCache->Fetch();
		
	//-- get incident counts
	$int_myincidentcount = $connCache->GetRecordCount("opencall", "owner = '".PrepareForSql($analystid)."' and callclass='incident' and status < 15 and appcode='ITSMF'");
	$int_escincidentcount = $connCache->GetRecordCount("opencall", "owner = '".PrepareForSql($analystid)."' and status = 9 and callclass='incident'  and appcode='ITSMF'");
	$int_groupincidentcount = $connCache->GetRecordCount("opencall", "suppgroup = '".PrepareForSql($analystgroup)."' and callclass='incident' and status < 15  and appcode='ITSMF'");	
	$int_groupescincidentcount = $connCache->GetRecordCount("opencall", "suppgroup = '".PrepareForSql($analystgroup)."' and status in (9,10,11) and callclass='incident'  and appcode='ITSMF'");


	//-- get problem counts
	$int_myproblemcount = $connCache->GetRecordCount("opencall", "owner = '".PrepareForSql($analystid)."' and callclass='problem' and status < 15  and appcode='ITSMF'");
	$int_escproblemcount = $connCache->GetRecordCount("opencall", "owner = '".PrepareForSql($analystid)."' and status = 9 and callclass='problem'  and appcode='ITSMF'");
	$int_groupproblemcount = $connCache->GetRecordCount("opencall", "suppgroup = '".PrepareForSql($analystgroup)."' and callclass='problem' and status < 15  and appcode='ITSMF'");
	$int_groupescproblemcount = $connCache->GetRecordCount("opencall", "suppgroup = '".PrepareForSql($analystgroup)."' and status in (9,10,11) and callclass='problem'  and appcode='ITSMF'");

	//-- get error counts
	$int_myerrorcount = "";//$connCache->GetRecordCount("opencall", "owner = '$analystid' and callclass='Problem' and status < 15  and prb_state='Known Error'");
	$int_escerrorcount = "";//$connCache->GetRecordCount("opencall", "owner = '$analystid' and status = 9 and callclass='Problem'  and prb_state='Known Error'");
	$int_grouperrorcount = "";//$connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and callclass='Problem' and status < 15  and prb_state='Known Error'");
	$int_groupescerrorcount = "";//$connCache->GetRecordCount("opencall", "suppgroup = '$analystgroup' and status in (9,10,11) and callclass='Problem' and prb_state='Known Error'");


	//-- get rfc counts
	$int_myrfccount = $connCache->GetRecordCount("opencall", "owner = '".PrepareForSql($analystid)."' and callclass='Change Request' and status < 15  and appcode='ITSMF'");
	$int_escrfccount = $connCache->GetRecordCount("opencall", "owner = '".PrepareForSql($analystid)."' and status = 9 and callclass='Change Request'  and appcode='ITSMF'");
	$int_grouprfccount = $connCache->GetRecordCount("opencall", "suppgroup = '".PrepareForSql($analystgroup)."' and callclass='Change Request' and status < 15 and appcode='ITSMF'");	
	$int_groupescrfccount = $connCache->GetRecordCount("opencall", "suppgroup = '".PrepareForSql($analystgroup)."' and status in (9,10,11) and callclass='Change Request' and appcode='ITSMF'");
		
	//-- determine css to use
     $cssFile = "structure.css";
     $colorid = isset($_GET['ColourScheme'])?$_GET['ColourScheme']:$_POST['ColourScheme'];
    
	//Check if in Webclient
	$boolWC = isset($GLOBALS['HTTP_SESSION_VARS']['webclientparamsxml']);
	//If in Webclient Set colorid to silver
	if($boolWC)$colorid = 4;

	switch($colorid)
	{
		//ES -- swtoday - point each colour scheme to corresponding css
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