<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	$_SESSION['sessid'] = $_REQUEST['sessid'];
	echo $_SESSION['sessid'];
	//-- Include our standard include functions page
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	//include_once('itsm_default/xmlmc/xmlmc.php');

	//error_reporting(E_ERROR | E_PARSE );

	// Create Session
	$session = new classActivePageSession($_SESSION['sessid']);
	
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
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
						The Supportworks record could not be found<br>
						Please contact your system administrator.
					</span>
					</center>
				</body>
		</html>
	<?php
		exit;
	}
	//-- Construct a new active page session
	$callref = $_GET['callref'];
	//if($callref=="")	$callref = gv('CALLREF');

	//-- create our database connects to swdata and systemdb
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());

	$sysconn = new CSwLocalDbConnection();
	$sysconn->SwCacheConnect();
	$sysconn->LoadDataDictionary($dd);

	//-- try get call from cache
	$swconn->Query("SELECT * FROM opencall where callref = ".$callref."");
	$rsCall = $swconn->CreateRecordSet();

	if((!$rsCall)||($rsCall->eof))
	{
		//-- failed to get call from cache so get it from swdata
		$swconn->Query("SELECT * FROM opencall where callref = $callref");
		$rsCall = $swconn->CreateRecordSet();
		if((!$rsCall)||($rsCall->eof))
		{
			//-- call not found ?? in theory should never happen
			?>
			<html>
				<head>
					<meta http-equiv="Pragma" content="no-cache">
					<meta http-equiv="Expires" content="-1">
					<title>Support-Works Call Search Failure 1</title>
						<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
				</head>
					<body>
						<br><br>
						<center>
						<span class="error">
							The Supportworks record could not be found<br>
							Please contact your system administrator.
						</span>
						</center>
					</body>
			</html>
			<?php
			exit;
		}
	}	

	$sysconn->Query("SELECT * FROM opencall where bpm_parentcallref = ".$rsCall->f('callref'));
	$rsOLAs = $sysconn->CreateRecordSet();
	if((!$rsOLAs)||($rsOLAs->eof))
	{
		//-- failed to get call from cache so get it from swdata
		$swconn->Query("SELECT * FROM opencall where bpm_parentcallref = ".$rsCall->f('callref'));
		$rsOLAs = $swconn->CreateRecordSet();
		if((!$rsOLAs)||($rsOLAs->eof))
		{
		}
	}

	$boolDisplayTodayLine = true; // whether to display a line for today
	$strChartTitle = "Incident OLAs";
	$labels = array();
	$tasks = array();
	$strStartTimes = "";
	$strEndTimes = "";
	$strActualStartDate = "";
	$strActualEndDate = "";
	$filename = "";

	$color = array(0x0000aa, 0x0000aa, 0x0000aa, 0x0000aa, 0x0000aa, 0x0000aa, 0x0000aa,
		0x0000aa, 0x0000aa, 0x0000aa, 0x0000aa, 0x0000aa);

	$color2 = array(0x00cc00, 0x00cc00, 0xcc0000, 0x00cc00, 0x00cc00, 0x00cc00, 0x00cc00,
		0x00cc00, 0x00cc00, 0x00cc00, 0x00cc00, 0x00cc00);

	$color = array();
	$color2 = array();

	$currTime = time();

	$logdatex = $rsCall->xf('logdatex');
	$fixby = $rsCall->xf('fixbyx');
	$fixtime = $rsCall->xf('fix_time');
	$strStartTimes .=$logdatex;

	$strEndTimes.=$fixby;

	$strActualStartDate.=$logdatex;

	if($fixtime=="0")
	{
		$strActualEndDate.= $currTime;
		if($currTime>$fixby)
		{
			array_push($color2, 0xcc0000);
		}else
		{
			array_push($color2, 0x00cc00);
		}
	}
	else
	{
		$strActualEndDate.= $fixtime;
		if($fixtime>$fixby)
		{
			array_push($color2, 0xcc0000);
		}else
		{
			array_push($color2, 0x00cc00);
		}

	}
	
	$group = $rsCall->xf('itsm_title');
	$callref = $rsCall->xf('callref');
	array_push($labels, "Master Call - ".swcallref_str($callref)."\n".$group);
	array_push($tasks,count($labels)-1);
	array_push($color,0xAFD8F8);


	$rsOLAs->movefirst();
	while(!$rsOLAs->eof)
	{
		$logdatex = $rsOLAs->xf('logdatex');
		$fixby = $rsOLAs->xf('fixbyx');
		$fixtime = $rsOLAs->xf('fix_time');

		if($strStartTimes!="")
			$strStartTimes .=",";
		$strStartTimes .=$logdatex;

		if($strEndTimes!="")
			$strEndTimes.=",";
		$strEndTimes.=$fixby;

		if($strActualStartDate!="")
			$strActualStartDate.=",";
		$strActualStartDate.=$logdatex;

		if($strActualEndDate!="")
			$strActualEndDate.=",";
		if($fixtime=="0")
		{
			$strActualEndDate.= $currTime;
			if($currTime>$fixby)
			{
				array_push($color2, 0xcc0000);
			}else
			{
				array_push($color2, 0x00cc00);
			}
		}
		else
		{
			$strActualEndDate.= $fixtime;
			if($fixtime>$fixby)
			{
				array_push($color2, 0xcc0000);
			}else
			{
				array_push($color2, 0x00cc00);
			}

		}
		
		$group = $rsOLAs->xf('itsm_title');
	
		$intIndex = array_search($group,$labels);
		if($intIndex===false)
		{
			//array_push($labels,$group);
			//array_push($tasks,count($labels)-1);
		}
		else
		{
			// array_push($tasks,$intIndex);
		}

		$callref = $rsOLAs->xf('callref');

		//-- split long title into multiple lines as needed to avoid text being cut off
		$strGroup = "";
		$intCharCount = 65;
		$arrWords = explode(" ", $group);
		foreach($arrWords as $word)
		{
			if((strlen($strGroup)+strlen($word)) < $intCharCount)
			{
				$strGroup .= " ".$word;
			}
			else
			{
				$strGroup .= "\n".$word;
				$intCharCount = $intCharCount+65;
			}
		}
		
		array_push($labels, swcallref_str($callref)."\n".$strGroup);
		array_push($tasks,count($labels)-1);
		array_push($color,0xAFD8F8);
		$rsOLAs->movenext();
	}

	create_activity_chart($strStartTimes,$strEndTimes,$strActualStartDate,$strActualEndDate,$strChartTitle,$labels,$tasks,$color,$color2,$filename,$boolDisplayTodayLine);

	function create_activity_chart($strStartTimes,$strEndTimes,$strActualStartDate,$strActualEndDate,$strChartTitle,$labels,$tasks,$color,$color2,$filename,$boolDisplayTodayLine)
	{
		require_once("phpchartdir.php");

		# the planned start dates and actual start dates for the tasks
		$minYear = date("Y");
		$minMonth = date("n");
		$minDay = date("j");

		$startDate = array();
		$arrStartTimesEpoch = explode(",",$strStartTimes);
		foreach($arrStartTimesEpoch as $time)
		{
			//get year, month, and day of this time
			$thisYear = date("Y",$time);
			$thisMonth = date("n",$time);
			$thisDay = date("j",$time);
			$thisHour = date("G",$time);
			$thisMinute = date("i",$time);
			$thisSecond = date("s",$time);

			//calculate whether this is the minimum value
			if($thisYear<$minYear)
			{
				$minYear = $thisYear;
				$minMonth = $thisMonth;
				$minDay = $thisDay;
			}elseif($thisYear==$minYear && $thisMonth<$minMonth)
			{
				$minMonth = $thisMonth;
				$minDay = $thisDay;
			}elseif($thisYear==$minYear && $thisMonth==$minMonth && $thisDay<$minDay)
			{
				$minDay = $thisDay;
			}

			//put value in output data
			array_push($startDate,chartTime($thisYear, $thisMonth, $thisDay,$thisHour,$thisMinute,$thisSecond));
		}

		$actualStartDate = array();
		$strActualStartDateEpoch = explode(",",$strActualStartDate);
		foreach($strActualStartDateEpoch as $time)
		{
			//get year, month, and day of this time
			$thisYear = date("Y",$time);
			$thisMonth = date("n",$time);
			$thisDay = date("j",$time);
			$thisHour = date("G",$time);
			$thisMinute = date("i",$time);
			$thisSecond = date("s",$time);

			//calculate whether this is the minimum value
			if($thisYear<$minYear)
			{
				$minYear = $thisYear;
				$minMonth = $thisMonth;
				$minDay = $thisDay;
			}elseif($thisYear==$minYear && $thisMonth<$minMonth)
			{
				$minMonth = $thisMonth;
				$minDay = $thisDay;
			}elseif($thisYear==$minYear && $thisMonth==$minMonth && $thisDay<$minDay)
			{
				$minDay = $thisDay;
			}

			//put value in output data
			array_push($actualStartDate,chartTime($thisYear, $thisMonth, $thisDay,$thisHour,$thisMinute,$thisSecond));
		}

		$startChartDate = chartTime($minYear, $minMonth, $minDay);

		# the planned end dates and actual end dates for the tasks up to now
		$maxYear = date("Y");
		$maxMonth = date("n");
		$maxDay = date("j");

		$endDate = array();
		$arrEndTimesEpoch = explode(",",$strEndTimes);
		foreach($arrEndTimesEpoch as $time)
		{
			//get year, month, and day of this time
			$thisYear = date("Y",$time);
			$thisMonth = date("n",$time);
			$thisDay = date("j",$time);
			$thisHour = date("G",$time);
			$thisMinute = date("i",$time);
			$thisSecond = date("s",$time);

			//calculate whether this is the minimum value
			if($thisYear>$maxYear)
			{
				$maxYear = $thisYear;
				$maxMonth = $thisMonth;
				$maxDay = $thisDay;
			}elseif($thisYear==$maxYear && $thisMonth>$maxMonth)
			{
				$maxMonth = $thisMonth;
				$maxDay = $thisDay;
			}elseif($thisYear==$maxYear && $thisMonth==$maxMonth && $thisDay>$maxDay)
			{
				$maxDay = $thisDay;
			}

			//put value in output data
			array_push($endDate,chartTime($thisYear, $thisMonth, $thisDay,$thisHour,$thisMinute,$thisSecond));
		}
		$actualEndDate = array();
		$arrActualEndDateEpoch = explode(",",$strActualEndDate);
		foreach($arrActualEndDateEpoch as $time)
		{
			//get year, month, and day of this time
			$thisYear = date("Y",$time);
			$thisMonth = date("n",$time);
			$thisDay = date("j",$time);
			$thisHour = date("G",$time);
			$thisMinute = date("i",$time);
			$thisSecond = date("s",$time);

			//calculate whether this is the minimum value
			if($thisYear>$maxYear)
			{
				$maxYear = $thisYear;
				$maxMonth = $thisMonth;
				$maxDay = $thisDay;
			}elseif($thisYear==$maxYear && $thisMonth>$maxMonth)
			{
				$maxMonth = $thisMonth;
				$maxDay = $thisDay;
			}elseif($thisYear==$maxYear && $thisMonth==$maxMonth && $thisDay>$maxDay)
			{
				$maxDay = $thisDay;
			}

			//put value in output data
			array_push($actualEndDate,chartTime($thisYear, $thisMonth, $thisDay,$thisHour,$thisMinute,$thisSecond));
		}

		$chartScale = 86400 * 7; // 1 week
		if($minYear==$maxYear && $minMonth==$maxMonth && ($maxDay+1-$minDay)<6)
		{
			$maxDay = $minDay +6;
			$chartScale = 86400; // 1 day
		}
		$endChartDate = chartTime($maxYear, $maxMonth, $maxDay+1);

		# Create a XYChart object of size 890 x 600 pixels. Set background color to light
		# green (ccffcc) with 1 pixel 3D border effect.
		$c = new XYChart(890, 600, 0xefeff7, 0x000000, 1);

		# Add a title to the chart using 14 points Arial font, with dark grey
		# (666666) text on a light grey (0xcccccc) background
		$textBoxObj = $c->addTitle($strChartTitle, "arial.ttf", 14,
			0x666666);
		$textBoxObj->setBackground(0xcccccc);

		# Set the plotarea at (370, 55) and of size 500 x 450 pixels. Use alternative
		# white/grey background. Enable both horizontal and vertical grids by setting their
		# colors to grey (c0c0c0). Set vertical major grid (represents month boundaries) 2
		# pixels in width
		$plotAreaObj = $c->setPlotArea(370, 55, 500, 450, 0xffffff, 0xeeeeee, LineColor,
			0xc0c0c0, 0xc0c0c0);
		$plotAreaObj->setGridWidth(2, 1, 1, 1);

		# swap the x and y axes to create a horziontal box-whisker chart
		$c->swapXY();

		# Set the y-axis scale
		$c->yAxis->setDateScale($startChartDate , $endChartDate , $chartScale);

		# Add a red (ff0000) dash line to represent the current day
		if($boolDisplayTodayLine)
			$c->yAxis->addMark(chartTime(date("Y"), date("n"), date("j"), date("G"), date("i"), date("s")), $c->dashLineColor(0xff0000, DashLine));

		# Set multi-style axis label formatting. Month labels are in Arial Bold font in "mmm
		# d" format. Weekly labels just show the day of month and use minor tick (by using
		# '-' as first character of format string).
		$c->yAxis->setMultiFormat(StartOfMonthFilter(), "<*font=arialbd.ttf*>{value|mmm d}",
			StartOfDayFilter(), "-{value|d}");

		# Set the y-axis to shown on the top (right + swapXY = top)
		$c->setYAxisOnRight();

		# Set the labels on the x axis
		$c->xAxis->setLabels($labels);

		# Reverse the x-axis scale so that it points downwards.
		$c->xAxis->setReverse();

		# Set the horizontal ticks and grid lines to be between the bars
		$c->xAxis->setTickOffset(0.5);

		//$c->addScatterLayer(array(1,2), array(chartTime(2009, 8, 32),chartTime(2009, 8, 32)), "Response", Cross2Shape(), 13, 0xffff00);

		# Add a box-whisker layer to represent the actual date
		$boxLayerObj = $c->addBoxWhiskerLayer2($actualStartDate, $actualEndDate, null, null, null, $color2);
		# Set the bar height to 8 pixels so they will not block the bottom bar
		$boxLayerObj->setDataWidth(8);
		$boxLayerObj->setXData($tasks);

		# Add a box-whisker layer to represent the planned ola dates
		$boxLayerObj = $c->addBoxWhiskerLayer2($startDate, $endDate, null, null, null, $color);
		$boxLayerObj->setDataWidth(45);
		$boxLayerObj->setXData($tasks);

		# Add a legend box on the top right corner (870, 525) of the plot area with 8 pt Arial
		# Bold font. Use a semi-transparent grey (80808080) background.
		$b = $c->addLegend(870, 525, false, "arialbd.ttf", 8);
		$b->setAlignment(TopRight);
		$b->setBackground(0x80808080, -1, 2);


		# The keys for the scatter layers (update/milestone symbols) will automatically be added to
		# the legend box. We just need to add keys to show the meanings of the bar colors.
		$b->addKey("Target Fix Period", 0xAFD8F8);
		$b->addKey("Within Fix", 0x00cc00);
		$b->addKey("Breached Fix", 0xcc0000);
		

		# Output the chart
		if($filename!="")
			print($c->makeChart($filename));
		else
		{
			header("Content-type: image/png");
			print($c->makeChart2(PNG));
		}
	}
?>