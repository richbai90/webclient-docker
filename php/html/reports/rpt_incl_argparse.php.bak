<?php
	# This include is NOT a function, it doesn't behave as a function and needs to be thought of as part of the main source
	# as it makes use of variables defined and set further up the template, uses global variables as passed in to the
	# template and modifies the $where_clause value used further down the template. It is here because it is the same code
	# that will ultimately be used by all templates, regardless of type, and would otherwise need embedding in all of them
	# which increases the time taken to fix bugs or add functionality and also encourages templates to use slightly varying
	# versions of the same code. Which is silly. Also, since the latest template now comfortably exceeds 800 lines of PHP
	# it seems sensible to start chopping them up into smaller bits.
	foreach ($_GET as $key => $val)
	{
		if (!preg_match("/^uv_arg[ft]?\d+$/",$key)) continue;
		$where_clause = str_replace("&[".$key."]", str_replace("'", "''", base64_decode($val)), $where_clause);

		preg_match("/uv_arg[ft]?(\d+)$/", $key, $match);
		if (($arg_types[$match[1]] == 0) || ($arg_types[$match[1]] == 5)) $val = date($fmt_title_date, (base64_decode($val) - $_GET['tz']));
		else if (($arg_types[$match[1]] == 2) || ($arg_types[$match[1]] == 4)) $val = date($fmt_title_datetime, (base64_decode($val) - $_GET['tz']));
		else if (($arg_types[$match[1]] == 1) || ($arg_types[$match[1]] == 6))
		{
			$seconds = base64_decode($val);
			$hours = (INT)($seconds/3600);
			if ($hours) $seconds -= $hours*3600;
			$minutes = (INT)($seconds/60);
			if ($minutes) $seconds -= $minutes*60;
			$val = $hours.':'.$minutes.':'.$seconds;
		}
		else $val = base64_decode($val);
		$report_title = str_replace("&[".$key."]", $val, $report_title);
	}
?>