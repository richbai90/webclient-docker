<?php
	# This include is NOT a function. It forms part of the main source and has been separated into an include simply
	# because the same exact code is used by many templates and it is more efficient to maintain it in just one place.
	# Strip any backslashes the server may have thoughtfully inserted & swap " for '
	foreach ($_POST as $key => $val)
	{
		if (!$val) continue;
		$_POST[$key] = stripslashes(str_replace('"',"'",$val));
	}

	# Parse all the inputs into something useful using a bunch of regular expressions, string functions & logic.
	foreach ($_POST as $key => $val)
	{
		if (!$val) continue;
		if (substr($key,0,5) == "filt_")
		{
			$key = str_replace("filt_","",str_replace("!DOT!",".",$key));

			# User friendliness instructions. Try to make sure that the where clause is valid whatever the user entered
			$val = trim(str_replace("<>","!=",str_replace("==","=",$val)));

			# If the filter string contains AND or OR, expert mode is assumed and all user-friendliness features bypassed
			if ((!strpos(strtoupper($val)," AND ")) && (!strpos(strtoupper($val)," OR ")))
			{
				# Extract the opertaor (case insensitive) or set a default 0f = if none is found
				if (preg_match("/^(\!=|<=|>=|=|>|<|LIKE|NOT LIKE|REGEXP|IN|NOT IN)/i",$val,$match))
				{
					$operator = $match[1];
					$val = trim(str_replace($operator,"",$val));
				}
				else $operator = '=';
				$operator = strtoupper($operator);

				# Extract whatever sits between quotes in the string passed in as a filter, if found, set $quoted to true
				# & $val to the string
				if (preg_match("/^'([\D\d]+)'$/",$val,$match))
				{
					$quoted = true;
					$val = $match[1];
				}
				else $quoted = false;

				# Does the operator require an integer operand
				if (!strpos(",=,!=,LIKE,NOT LIKE,IN,NOT IN,REGEXP,",$operator))
				{
					# Test to make sure it is
					if (!preg_match("/^\d+(.?\d+)?$/",$val))
					{
						$error = "Error: You have used numeric operator (".(str_replace("<","&lt;",str_replace(">","&gt;",$operator))).") but supplied a non-numeric operand (".$val.")";
						include('rpt_page_filterlst_err.php');
						exit;
					}
				}
				else if (!$quoted)
				{
					# This would mean that the operator is  = or != but the supplied string was not quoted. A non-quoted string
					# comparison will cause an SQL error so here we can quote it automatically.
	
					# After discussing the issue with Will, we decided to escape and quote the string, unless it is a valid
					# number of course, so here goes:-
					# EXCEPTIONS ADDED if the comparison is an IN or contains AND (is a multiple match), do not auto-quote
					if ((!preg_match("/^\d+(.?\d+)?$/",$val)) && (!strlen(strpos($operator,"IN")))) $val = "'".(str_replace("'","''",$val))."'";
				}
				else
				{
					# String was supplied quoted and needs to remain so so we requote it here, same line as above
					$val = "'".(str_replace("'","''",$val))."'";
				}
			}

			# Add the operand and operator to the WHERE clause with an AND if needed
			if ($where_clause) $where_clause .= " AND ".$key.' '.$operator.' '.$val;
			else $where_clause = $key.' '.$operator.' '.$val;
		}
	}
?>