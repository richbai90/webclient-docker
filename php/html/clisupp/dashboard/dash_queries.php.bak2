<?php 
# Need this to create a chart
include('swdatabaseaccess.php');

/*
#define SWTIME_SER_STARTOFTODAY			1
#define SWTIME_SER_ENDOFTODAY			2
#define SWTIME_SER_STARTOFWEEK			3
#define SWTIME_SER_ENDOFWEEK			4
#define SWTIME_SER_STARTOFMONTH			5
#define SWTIME_SER_ENDOFMONTH			6
#define SWTIME_SER_STARTOFQUATER		7
#define SWTIME_SER_ENDOFQUATER			8
#define SWTIME_SER_STARTOFYEAR			9
#define SWTIME_SER_ENDOFYEAR			10
#define SWTIME_SER_STARTOFYESTERDAY		11
#define SWTIME_SER_ENDOFTOYESTERDAY		12
#define SWTIME_SER_STARTOFLASTWEEK		13
#define SWTIME_SER_ENDOFLASTWEEK		14
#define SWTIME_SER_STARTOFLASTMONTH		15
#define SWTIME_SER_ENDOFLASTMONTH		16
#define SWTIME_SER_STARTOFLASTQUATER	17
#define SWTIME_SER_ENDOFLASTQUATER		18
#define SWTIME_SER_STARTOFLASTYEAR		19
#define SWTIME_SER_ENDOFLASTYEAR		20
*/

# Connect to the DB
$GlenConn = new CSwDbConnection;
if (!$GlenConn->Connect(swdsn(),swuid(),swpwd()))
{
	$error = 4;
	include('error.php');
	exit;
}
$GlenConn->LoadDataDictionary("Default");

# Set current time
$now = time();
$filename = $HTTP_GET_VARS["id"];

switch ($filename){
// Number of Open Calls Grouped by Status
	case "dash_opencallsbystatus.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$query = "SELECT DISTINCT status, COUNT(status) as cnt FROM opencall WHERE status < 16 GROUP BY status";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.status", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Number of Escalated Calls Grouped by Site (site)
	case "dash_esccallsbysite.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$query = "SELECT DISTINCT site, COUNT(site) as cnt FROM opencall WHERE status < 12 AND status > 8 GROUP BY site";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.site", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Number of Escalated Calls Grouped by Customer (cust_name)
	case "dash_esccallsbycustomer.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$query = "SELECT DISTINCT cust_name, COUNT(cust_name) as cnt FROM opencall WHERE status < 12 AND status > 8 GROUP BY cust_name";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.cust_name", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Number of Open Calls Grouped by Status Logged Today
	case "dash_opencallsbystatus_today.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startoftoday");
			$query = "SELECT DISTINCT status, COUNT(status) as cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY status";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.status", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Number of Open Calls Grouped by Status Logged This week
	case "dash_opencallsbystatus_tweek.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofweek");
			$query = "SELECT DISTINCT status, COUNT(status) as cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY status";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.status", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Number of Open Calls Grouped by Status Logged This month
	case "dash_opencallsbystatus_tmonth.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofmonth");
			$query = "SELECT DISTINCT status, COUNT(status) as cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY status";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.status", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Number of Open Calls Grouped by Status Logged This year
	case "dash_opencallsbystatus_tyear.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofyear");
			$query = "SELECT DISTINCT status, COUNT(status) as cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY status";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.status", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Customers (cust_name) Today
	case "dash_top10callcusts_today.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startoftoday");
			$query = "SELECT DISTINCT cust_name, COUNT( cust_name ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY cust_name ORDER BY cnt DESC  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.cust_name", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Customers (cust_name) This week
	case "dash_top10callcusts_tweek.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofweek");
			$query = "SELECT DISTINCT cust_name, COUNT( cust_name ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY cust_name ORDER BY cnt DESC  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.cust_name", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Customers (cust_name) This month
	case "dash_top10callcusts_tmonth.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofmonth");
			$query = "SELECT DISTINCT cust_name, COUNT( cust_name ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY cust_name ORDER BY cnt DESC";  // LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.cust_name", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Customers (cust_name) This year
	case "dash_top10callcusts_tyear.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofyear");
			$query = "SELECT DISTINCT cust_name, COUNT( cust_name ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY cust_name ORDER BY cnt DESC";  //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.cust_name", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Sites (gourp by site limit 10) Today
	case "dash_top10callsites_today.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startoftoday");
			$query = "SELECT DISTINCT site, COUNT( site ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY site ORDER BY cnt DESC";   //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.site", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Sites (gourp by site limit 10) This week
	case "dash_top10callsites_tweek.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofweek");
			$query = "SELECT DISTINCT site, COUNT( site ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY site ORDER BY cnt DESC";  //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.site", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Sites (gourp by site limit 10) This month
	case "dash_top10callsites_tmonth.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofmonth");
			$query = "SELECT DISTINCT site, COUNT( site ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY site ORDER BY cnt DESC";      //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.site", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Calling Sites (gourp by site limit 10) This year
	case "dash_top10callsites_tyear.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofyear");
			$query = "SELECT DISTINCT site, COUNT( site ) AS cnt FROM opencall WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY site ORDER BY cnt DESC";    //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.site", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Problem Types  (group by probcode limit 10) Today
	case "dash_top10probcodes_today.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startoftoday");
			$query = "SELECT DISTINCT info, COUNT( probcode ) AS cnt FROM opencall LEFT JOIN pcdesc ON probcode=code WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY probcode ORDER BY cnt DESC";  //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.probcode", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';
					
					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Problem Types  (group by probcode limit 10) This week
	case "dash_top10probcodes_tweek.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofweek");
			$query = "SELECT DISTINCT info, COUNT( probcode ) AS cnt FROM opencall LEFT JOIN pcdesc ON probcode=code WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY probcode ORDER BY cnt DESC";    //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.probcode", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Problem Types  (group by probcode limit 10) This month
	case "dash_top10probcodes_tmonth.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofmonth");
			$query = "SELECT DISTINCT info, COUNT( probcode ) AS cnt FROM opencall LEFT JOIN pcdesc ON probcode=code WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY probcode ORDER BY cnt DESC";  //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.probcode", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Top Ten Problem Types  (group by probcode limit 10) This year
	case "dash_top10probcodes_tyear.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$uxt = swtime("startofyear");
			$query = "SELECT DISTINCT info, COUNT( probcode ) AS cnt FROM opencall LEFT JOIN pcdesc ON probcode=code WHERE status < 16 AND logdatex > ".$uxt." AND logdatex < ".$now." GROUP BY probcode ORDER BY cnt DESC";   //  LIMIT 0 , 10";
			if($GlenConn->Query($query))
			{
				$c = 1;
				$xml = '<graphdata expires="0">';
				while($GlenConn->FetchLocal())
				{
					if (!$GlenConn->row[0]) $GlenConn->row[0] = 'No Value';
					$xml .= '<item name="'.(swdti_formatvalue("opencall.probcode", $GlenConn->row[0])).'" value="'.$GlenConn->row[1].'" />';

					$c++;
					if($c > 10) break;
				}
				$xml .= '</graphdata>';
			}
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Call Log Activity Last 24 Hours (24 bars, one for each hour)
	case "dash_calllogactivity_24hours.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$from = $now - ($now % 3600);
			$to = $from + 3599;

			$time = (INT)date("H",$from);

			$xml = '<graphdata expires="0">';
			for($x = 0 ; $x < 24 ; $x++)
			{
				$query = "SELECT COUNT(*) AS cnt FROM opencall WHERE logdatex > $from AND logdatex < $to";
				if($GlenConn->Query($query))
				{
					$GlenConn->FetchLocal();
					$xml .= '<item name="'.(sprintf("%02d",$time)).':00" value="'.$GlenConn->row[0].'" />';
				}

				$from -= 3600;
				$to -= 3600;
				if ($time > 0) $time -= 1;
				else $time = 23;

			}
			$xml .= '</graphdata>';
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Call Log Activity Last 7 Days (7 bars, one for each day)
	case "dash_calllogactivity_7days.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-500))
		{
			$date_array = getdate($now);
			
			$f_month = $date_array["mon"];
			$f_day = $date_array["mday"];
			$w_day = $date_array["wday"];
			$f_year = $date_array["year"];
			
			$daynames = array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
			$daynames[$w_day] = "Today";
			
			if ($f_year%4) $days[1] = 28;
			else $days[1] = 29;
			$from = mktime(0,0,0,$date_array["mon"],$f_day,$date_array["year"]);
			$to = mktime(23,59,59,$date_array["mon"],$f_day,$date_array["year"]);
			
			$xml = '<graphdata expires="0">';
			for($x = 0 ; $x < 7 ; $x++)
			{
				$query = "SELECT COUNT(*) AS cnt FROM opencall WHERE logdatex > $from AND logdatex < $to";
				if($GlenConn->Query($query))
				{
					$GlenConn->FetchLocal();
					$xml .= '<item name="'.$daynames[$w_day].'" value="'.$GlenConn->row[0].'" />';
				}

				$to = $from-1;
				$from-=86400;
				if ($w_day) $w_day--;
				else $w_day = 6;

			}
			$xml .= '</graphdata>';
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Call Log Activity Last 31 Days (31 bars, one for each day)
	case "dash_calllogactivity_31days.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-7200))
		{
			$date_array = getdate($now);
			
			$f_month = $date_array["mon"];
			$f_day = $date_array["mday"];
			$f_year = $date_array["year"];
			
			$days = array(31,28,31,30,31,30,31,31,30,31,30,31);
			$daynames = array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
			
			if ($f_year%4) $days[1] = 28;
			else $days[1] = 29;
			$from = mktime(0,0,0,$date_array["mon"],$f_day,$date_array["year"]);
			$to = mktime(23,59,59,$date_array["mon"],$f_day,$date_array["year"]);
			
			$xml = '<graphdata expires="0">';
			for($x = 0 ; $x < 31 ; $x++)
			{
				$query = "SELECT COUNT(*) AS cnt FROM opencall WHERE logdatex > $from AND logdatex < $to";
				if($GlenConn->Query($query))
				{
					$GlenConn->FetchLocal();
					$xml .= '<item name="'.$daynames[$f_month-1].' '.$f_day.'" value="'.$GlenConn->row[0].'" />';
				}

				$to = $from-1;
				$from-=86400;
				if ($f_day > 1) $f_day--;
				else 
				{
					if ($f_month > 1) $f_month--;
					else $f_month = 12;
					$f_day = $days[$f_month-1];
				}

			}
			$xml .= '</graphdata>';
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

// Call Log Activity Last 12 Months (12 bars, one for each month)
	case "dash_calllogactivity_12months.xml":
		if ((!file_exists($filename)) || (filemtime($filename) < time()-7200))
		{
			$date_array = getdate($now);
			
			$f_month = $date_array["mon"];
			$f_year = $date_array["year"];
			
			$days = array(31,28,31,30,31,30,31,31,30,31,30,31);
			$daynames = array("January","February","March","April","May","June","July","August","September","October","November","December");
			$daynames = array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
			
			if ($f_year%4) $days[1] = 28;
			else $days[1] = 29;
			$from = mktime(0,0,0,$date_array["mon"],1,$date_array["year"]);
			$to = mktime(23,59,59,$date_array["mon"],$days[$f_month-1],$date_array["year"]);
			
			$xml = '<graphdata expires="0">';
			for($x = 0 ; $x < 12 ; $x++)
			{
				$query = "SELECT COUNT(*) AS cnt FROM opencall WHERE logdatex > $from AND logdatex < $to";
				if($GlenConn->Query($query))
				{
					$GlenConn->FetchLocal();
					$xml .= '<item name="'.$daynames[$f_month-1].'" value="'.$GlenConn->row[0].'" />';
				}

				$to = $from-1;
			
				if ($f_month > 1) $f_month--;
				else 
				{
					$f_month = 12;
					$f_year--;
				}
				if ($f_month == 2)
				{
					if ($f_year%4) $days[1] = 28;
					else $days[1] = 29;
				}
			
				$from = $from - $days[$f_month-1]*86400;
			}
			$xml .= '</graphdata>';
			$file = fopen ($filename, "w");
			fwrite ($file, $xml);
			fclose ($file);
		}
	break;

	default:
		print "No XML Filename parameter was passed in or supplied name was not recognised";
		exit;
		break;
	}

readfile($filename);
?>
