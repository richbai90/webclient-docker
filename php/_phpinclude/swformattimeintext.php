<?php

include_once('stdinclude.php');

//	the function is internal to this file
//	[preg_replace_callback] passes in $matches[0] as a string in this format [dd/MM/yyyy HH:mm:ss]-UTC
function pv_replace_uk_fmt_utc($matches)
{
	$sDateTimeValue = substr($matches[0], 1, strlen($matches[0])-6);
	$nUtcUnixDate = swdti_timefromstring_uk($sDateTimeValue, 1);
	if ($nUtcUnixDate < 0)
		return SW_ERR_SWDTI_TIMEFROMSTRING_UK_FAILED;
	return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
}

//	the function is internal to this file
//	[preg_replace_callback] passes in $matches[0] as a string in this format dd/MM/yyyy HH:mm:ss
function pv_replace_uk_fmt($matches)
{
	$sDateTimeValue = $matches[0];
	$nUtcUnixDate = swdti_timefromstring_uk($sDateTimeValue, 1);
	if ($nUtcUnixDate < 0)
		return SW_ERR_SWDTI_TIMEFROMSTRING_UK_FAILED;
	return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
}

//	the function is internal to this file
//	[preg_replace_callback] passes in $matches[0] as a string in this format [yyyy-MM-dd HH:mm:ss]-UTC
function pv_replace_iso_fmt_utc($matches)
{
	$sDateTimeValue = substr($matches[0], 1, strlen($matches[0])-6);
	$nUtcUnixDate = swdti_timefromstring_iso($sDateTimeValue);
	if ($nUtcUnixDate < 0)
		return SW_ERR_SWDTI_TIMEFROMSTRING_ISO_FAILED;
	return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
}

//	the function is internal to this file
//	[preg_replace_callback] passes in $matches[0] as a string in this format yyyy-MM-dd HH:mm:ssZ
function pv_replace_iso_fmt_z($matches)
{
	$sDateTimeValue = substr($matches[0], 0, strlen($matches[0])-1);
	$nUtcUnixDate = swdti_timefromstring_iso($sDateTimeValue);
	if ($nUtcUnixDate < 0)
		return SW_ERR_SWDTI_TIMEFROMSTRING_ISO_FAILED;
	return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
}

//	It replaces all occurences of UK-style date/time values with  values converted according to the
//	current logged in analyst's regional settings. 
//	The function looks only for the next patterns:
//	dd/MM/yyyy HH:mm:ss, [dd/MM/yyyy HH:mm:ss]-UTC, [yyyy-MM-dd HH:mm:ss]-UTC or yyyy-MM-dd HH:mm:ssZ
//	All date/time values that match these patterns are supposed to be represented in UTC and are treated as such.
//	It returns the resulted text.
function SwConvertDateTimeInText($subject)
{
	$subject = preg_replace_callback(SW_REGEXP_UK_DTFMT_UTC, pv_replace_uk_fmt_utc, $subject);
	//$subject = preg_replace_callback(SW_REGEXP_UK_DTFMT, pv_replace_uk_fmt, $subject);
	$subject = preg_replace_callback(SW_REGEXP_ISO8601_DTFMT_UTC, pv_replace_iso_fmt_utc, $subject);
	$subject = preg_replace_callback(SW_REGEXP_ISO8601_DTFMT_Z, pv_replace_iso_fmt_z, $subject);
	return $subject;
}

?>