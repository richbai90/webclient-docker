<?php 
$period = 180;
if ((!file_exists("kpi.xml")) || (filemtime("kpi.xml") < time()-$period)){ // refresh in every 2 mins
	// This script retrieves data from the database relating to key performance indicators.
	include('swdatabaseaccess.php');
	$GlenConn = new CSwDbConnection;
	if (!$GlenConn->Connect(swdsn(),swuid(),swpwd()))
	{
		print '<br>Could not extablish database connection';
		exit;
	}

	// Function to convert a number of seconds to a friendly string
	function secs2hms($seconds)
	{
		$time = (INT)$seconds;
		if ($time > 3600)
		{
			$remain = $time % 3600;
			$hours = ($time-$remain) / 3600;
		}
		else
		{
			$hours = 0;
		}
		if ($time > 60)
		{
			$time -= ($hours * 3600);
			$secs = $time % 60;
			$mins = ($time-$secs) / 60;
			$time -= $mins * 60;
		}
		else
		{
			$mins = 0;
			$secs = $time;
		}

		// $hours, $mins & $secs are all known values so time to create a nice string from them in $str
		$str = '';
		if ($hours == 1) $str .= $hours.' hour';
		else if ($hours) $str .= $hours.' hours';
		$sep = $str ? ', ' : '';
		if ($mins == 1) $str .= $sep.$mins.' minute';
		else if ($mins) $str .= $sep.$mins.' minutes';
		$sep = $str ? ' and ' : '';
		if ($secs == 1) $str .= $sep.$secs.' second';
		else if ($secs) $str .= $sep.$secs.' seconds';

		return $str;
	}

	$uxt = time();
	$START_OF_TODAY = date("Y-m-d 00-00-00",$uxt);				// Start of day in string form yyyy-mm-dd 00-00-00
	$START_OF_TODAYX = ($uxt-($uxt % 86400));					// Start of day in unix time INT

	$xml = '<ticker name="Supportworks KPIs" ' .  'expires="'. (time()+$period).'">' . "\n";

	// Calls Logged Today
	$query = 'SELECT COUNT(*) AS cnt FROM opencall WHERE logdatex > '.$START_OF_TODAYX;
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="Calls Logged Today: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// Calls Closed/Resolved Today
	$query = 'SELECT COUNT(*) AS cnt FROM opencall WHERE (status > 15 OR status = 6) AND closedatex > '.$START_OF_TODAYX;
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="Calls Closed/Resolved Today: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// Calls Meeting Response Time Today
	$query = 'SELECT COUNT(*) AS cnt FROM opencall WHERE logdatex > '.$START_OF_TODAYX.' AND withinresp = 1';
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="Calls Meeting Response Time Today: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// Closed/Resolved Calls Meeting Fix Time Today
	$query = 'SELECT COUNT(*) AS cnt FROM opencall WHERE (status > 15 OR status = 6) AND closedatex > '.$START_OF_TODAYX.' AND withinfix = 1';
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="Closed/Resolved Calls Meeting Fix Time Today: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// Average Response Time Today
	$query = 'SELECT resp_time FROM opencall WHERE logdatex > '.$START_OF_TODAYX;
	if($GlenConn->Query($query))
	{
		$cnt = 0;
		$total = 0;
		while($GlenConn->Fetch("count"))
		{
			$total += $count_resp_time;
			$cnt++;
		}
		if (($total) && ($cnt))
		{
			$xml .= "\t".'<item text="Average Response Time Today: '.(secs2hms($total/$cnt)).'" url="" hover="#00FF00"  link="#FFFFFF" sepcolor="#FF0000" SepStyle="2"/>'."\n";
		}
	}

	// Average Fix Time Today
	$query = 'SELECT fix_time FROM opencall WHERE (status > 15 OR status = 6) AND closedatex > '.$START_OF_TODAYX;
	if($GlenConn->Query($query))
	{
		$cnt = 0;
		$total = 0;
		while($GlenConn->Fetch("count"))
		{
			$total += $count_fix_time;
			$cnt++;
		}
		if (($total) && ($cnt))
		{
			$xml .= "\t".'<item text="Average Fix Time Today: '.(secs2hms($total/$cnt)).'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
		}
	}

	// Open Calls
	$query = 'SELECT COUNT(*) AS cnt FROM opencall WHERE status < 16';
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="Open Calls: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// Escalated Calls
	$query = 'SELECT COUNT(*) AS cnt FROM opencall WHERE status < 12 AND status > 8';
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="Escalated Calls: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// E-Mail Messages Received Today
	$query = 'SELECT COUNT(*) AS cnt FROM sw_messagestore.shared__helpdesk_mailbox WHERE msgfolder = 1 AND msgdate > \''.$START_OF_TODAY.'\'';
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="E-Mail Messages Received Today: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	// E-Mail Messages Sent Today
	$query = 'SELECT COUNT(*) AS cnt FROM sw_messagestore.shared__helpdesk_mailbox WHERE msgfolder = 3 AND msgdate > \''.$START_OF_TODAY.'\'';
	if($GlenConn->Query($query))
	{
		$GlenConn->Fetch("count");
		$xml .= "\t".'<item text="E-Mail Messages Sent Today: '.$count_cnt.'" url="" sepcolor="#FF0000" SepStyle="2"/>'."\n";
	}

	$xml .= '</ticker>'."\n";

	$file = fopen ("kpi.xml", "w");
	fwrite ($file, $xml);
	fclose ($file);
	}
readfile("kpi.xml");
?>


