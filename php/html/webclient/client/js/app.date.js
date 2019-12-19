//--
//-- functions to help with all date stuff


//--
//-- date stuff
var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

var month=new Array(7);
month[0]="January";
month[1]="Feburary";
month[2]="March";
month[3]="April";
month[4]="May";
month[5]="June";
month[6]="July";
month[7]="August";
month[8]="September";
month[9]="October";
month[10]="November";
month[11]="December";


//-- 04.04.2004
//-- HELPER FUNCTIONS

function _getyear(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysyear = todaysdate.getFullYear();
	return todaysyear;
}

function _getmonth(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysmonth = todaysdate.getMonth();
	return todaysmonth;
}

function _getweek(in_date)
{
	dayof = in_date.getDate();
	in_date.setDate(1);

	//-- so we have the first day of that month
	//-- lets find the day of week, then loop until increasing day of week
	week=1;
	for (x=1; x < dayof; x++)
	{
		in_date.setDate(x);
		y = _getdayofweek(in_date);
		if (y == 0 ) week++;
	}
	return week;
}

function _getdayofweek(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysday = todaysdate.getDay();
	return todaysday;
}


//-- get start of month
function fd_get_som_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);


	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var currmonth = aDate.getMonth();
	var imonth = aDate.getMonth()-1;
	if(imonth==-1)imonth=11;
	while(imonth != currmonth)
	{
		aDate.setDate(aDate.getDate()-1);
		currmonth = aDate.getMonth();
	}
	//-- gone back one month so go back to start
	aDate.setDate(aDate.getDate()+1);
	return aDate;
}

//-- get eom of month
function fd_get_eom_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);


	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var origmonth = aDate.getMonth();
	var imonth = -1;
	var intDay = aDate.getDay();
	while(imonth != origmonth)
	{
		aDate.setDate(aDate.getDate()+1);
		imonth = aDate.getMonth();
	}
	//-- gone back one month so go back to start
	aDate.setDate(aDate.getDate()+1);
	return aDate;
}


//-- get start of week date object (from monday)
function fd_get_sow_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);

	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var intDay = aDate.getDay();
	while(intDay!=1)
	{
		aDate.setDate(aDate.getDate()-1);
		intDay = aDate.getDay();
	}

	return aDate;
}

//-- get end of week date object (from monday)
function fd_get_eow_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);


	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var intDay = aDate.getDay();
	while(intDay!=0)
	{
		aDate.setDate(aDate.getDate()+1);
		intDay = aDate.getDay();
	}

	return aDate;
}


function fd_dd_month(aDate, strSep)
{
	if(strSep==undefined)strSep=" ";
	return aDate.getDate() + strSep + month[aDate.getMonth()];
}



function fd_to_yyyymmdd(aDate)
{
	var intMonth = aDate.getMonth() + 1;
	var intDay = aDate.getDate();
	var strMonth = (intMonth<10)?"0" + intMonth:intMonth + "";
	var strDay = (intDay<10)?"0" + intDay:intDay + "";
	return aDate.getFullYear() + strMonth + strDay;
}

function fd_to_month(aDate)
{
	return month[aDate.getMonth()];
}

function fd_yyyymmdd_to_dd_month(strYYYYMMDD, strSep)
{
	if(strSep==undefined)strSep=" ";
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);
	
	return strDay + strSep + month[strMonth-1]
}

function format_dateparts(strFormat,intOffset, strYear,strMonth,strDay,strHH,strMM,strSS)
{
	var aDate= new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);
	aDate.setHours(strHH);
	aDate.setMinutes(strMM);
	aDate.setSeconds(strSS);


	var intEpoch = _date_to_epoch(aDate);
	var aDate = _date_from_epoch(intEpoch,intOffset);
	return _formatDate(aDate,strFormat);
}

function fd_yyyymmdd_to_d(strYYYYMMDD)
{
	var aDate= new Date();
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);

	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);
	return aDate;
}

function fd_yyyymmdd_to_dd_month_year(strYYYYMMDD, strSep)
{
	if(strSep==undefined)strSep=" ";
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);

	return strDay + strSep + month[strMonth-1] + strSep + strYear;
}

//-- given "hh:mm" return number of seconds since midnight - used for sla timing
function _convert_hhmm_to_epoch(strTime)
{
	var arrTime = strTime.split(":");
	var intHours = arrTime[0]-1+1;
	var intMins = arrTime[1]-1+1;

	var intTotalSeconds = (intHours * 3600) + (intMins * 60);
	return intTotalSeconds;
}

function df_yyyymmdd_to_yyyy_mm_dd(strYYYYMMDD, strSep)
{
	if(strSep==undefined)strSep=" ";
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);
	
	var data = strYear + strSep + strMonth + strSep + strDay;
	return data;
}

function _date_to_utc_timestamp(aDate)
{
	var strYear = aDate.getUTCFullYear();
	var strMonth =aDate.getUTCMonth() + 1;
	if(strMonth<10)strMonth = "0" + strMonth;

	var strDay =aDate.getUTCDate() 
	if(strDay<10)strDay = "0" + strDay;

	var strHours =aDate.getUTCHours()
	if(strHours<10)strHours = "0" + strHours;
	var strMinutes =aDate.getUTCMinutes()
	if(strMinutes<10)strMinutes = "0" + strMinutes;
	var strSecs =aDate.getUTCSeconds()
	if(strSecs<10)strSecs = "0" + strSecs;

	
	var strDate = strYear +"-" + strMonth + "-" + strDay + " " + strHours +":"+strMinutes + ":"+strSecs;
	return strDate;
}

function _date_to_timestamp(aDate)
{
	var strYear = aDate.getFullYear();
	var strMonth =aDate.getMonth() + 1;
	if(strMonth<10)strMonth = "0" + strMonth;

	var strDay =aDate.getDate() 
	if(strDay<10)strDay = "0" + strDay;

	var strHours =aDate.getHours()
	if(strHours<10)strHours = "0" + strHours;
	var strMinutes =aDate.getMinutes()
	if(strMinutes<10)strMinutes = "0" + strMinutes;
	var strSecs =aDate.getSeconds()
	if(strSecs<10)strSecs = "0" + strSecs;

	
	var strDate = strYear +"-" + strMonth + "-" + strDay + " " + strHours +":"+strMinutes + ":"+strSecs;
	return strDate;
}


function fd_to_yyyy_mm_dd(aDate,strSep)
{
	var strYYYYMMDD = fd_to_yyyymmdd(aDate);
	return df_yyyymmdd_to_yyyy_mm_dd(strYYYYMMDD, strSep);

}


function _date_from_epoch(intEpoch,intOffset, intTime)
{
	if(intTime==undefined)intTime=0;
	//if(intOffset==undefined)intTime=0;

	var dDate = new Date();

	var mEpoch = parseInt(intEpoch);

	if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
	dDate.setTime(mEpoch)

	//-- now add offset
	if(intOffset!=undefined)
	{
		var intUTCEpoch = _date_to_epoch(dDate);
		intOffset++;intOffset--;
		intUTCEpoch = intUTCEpoch + intOffset;

		if(intUTCEpoch<10000000000) intUTCEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
		dDate.setTime(intUTCEpoch)
	}

	
	return dDate;
}

//-- get utc date time from epoch regardless of os date settings
function _utcdate_from_epoch(intEpoch,intOffset, intTime)
{
	if(intTime==undefined)intTime=0;

	var dDate = new Date();

	var mEpoch = parseInt(intEpoch);

	if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
	dDate.setTime(mEpoch)
	
	//-- convert date to utc
	dDate = _date_to_utc_date(dDate);

	//-- now add offset
	if(intOffset!=undefined)
	{
		var intUTCEpoch = _date_to_epoch(dDate);
		intOffset++;intOffset--;
		intUTCEpoch = intUTCEpoch + intOffset;

		if(intUTCEpoch<10000000000) intUTCEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
		dDate.setTime(intUTCEpoch)
	}


	//-- check if we need to set time of day
	if(intTime==1)
	{
		dDate = _set_date_sod(dDate);
	}
	else if(intTime==2)
	{
		dDate = _set_date_eod(dDate);
	}
  
	return dDate;
}

//-- get os date/time given an epoch value - intTime [0=as is,1=00:00:00, 2 = 23:59.59]
function _osdate_from_epoch(intEpoch, intTime)
{
	if(intTime==undefined)intTime=0;

	var dDate = new Date();
	if(intEpoch!=undefined)
	{
		var mEpoch = parseInt(intEpoch); 
		if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
		dDate.setTime(mEpoch)
	}

	//-- check if we need to set time of day
	if(intTime==1)
	{
		dDate = _set_date_sod(dDate);
	}
	else if(intTime==2)
	{
		dDate = _set_date_eod(dDate);
	}
  
	return dDate;
}

//-- set date to be start of day
function _set_date_sod(dDate)
{
	dDate.setHours(0);
	dDate.setMinutes(0);
	dDate.setSeconds(0);
	return dDate;
}
//-- set date to be end of day
function _set_date_eod(dDate)
{
	dDate.setHours(23);
	dDate.setMinutes(59);
	dDate.setSeconds(59);
	return dDate;
}

function _date_to_epoch(dDate)
{
	if(dDate==null)return 0;

	//var intOsOffsetMilliseconds = dDate.getTimezoneOffset() * 60000;
	return parseInt(dDate.getTime()-dDate.getMilliseconds())/1000;
}

//-- convert a date to utc date and time
function _date_to_utc_date(aDate)
{
	if(aDate==undefined) aDate=new Date();

	var intOsOffsetMilliseconds = aDate.getTimezoneOffset() * 60000;
	var intDateMilliseconds = aDate.getTime();
	intDateMilliseconds = intDateMilliseconds + intOsOffsetMilliseconds;

	aDate.setTime(intDateMilliseconds);

	return aDate;
}

//-- return gmt epoch
function _gmt_epoch(aDate)
{
	if(aDate==undefined)aDate = new Date();
	return parseInt(Date.UTC(aDate.getUTCFullYear(),aDate.getUTCMonth(),aDate.getUTCDate(),aDate.getUTCHours(),aDate.getUTCMinutes(),aDate.getUTCSeconds(),aDate.getUTCMilliseconds())/1000);
}

function _epoch_to_timestamp(intEpoch,boolUTC)
{
	if(boolUTC)
	{
		var aDate = _utcdate_from_epoch(intEpoch);
	}
	else
	{
		var aDate = _date_from_epoch(intEpoch);
	}
	return _date_to_timestamp(aDate);
}

function _date_to_utc_epoch(aDate)
{

	if(aDate==undefined) aDate=new Date();

	var intOsOffsetMilliseconds = aDate.getTimezoneOffset() * 60000;
	var intDateMilliseconds = aDate.getTime();
	intDateMilliseconds = intDateMilliseconds + intOsOffsetMilliseconds;
	return parseInt(intDateMilliseconds / 1000);
}

function _date_apply_offset(aDate,intOffsetSeconds)
{
	var intEpoch = _date_to_epoch(aDate);
	return _date_from_epoch(intEpoch,intOffsetSeconds);

}

function _date_to_utc_date(aDate)
{
	if(aDate==undefined)aDate = new Date();

	aDate.setFullYear(aDate.getUTCFullYear())
	aDate.setMonth(aDate.getUTCMonth())
	aDate.setDate(aDate.getUTCDate())
	aDate.setHours(aDate.getUTCHours())
	aDate.setMinutes(aDate.getUTCMinutes())
    return aDate;
}


//-- form date control changed
function onformdate_control_change(targetEle,intTime)
{
	if(targetEle.swfc!=undefined)
	{
		//-- a form control
		targetEle.swfc._oncalchange(intTime);
		return;
	}

	//-- some other type of date control i.e. call search
	var strFormatType = targetEle.getAttribute("formattype");
	if((strFormatType=="date")||(strFormatType==null))
	{
		return ondatechange_element(targetEle);
	}
	else if(strFormatType=="time")
	{
		return ontimechange_element(targetEle);
	}
	else
	{
	
		return ondatetimechange_element(targetEle);
	}

}

//-- given utc epoch set the display value optionally adjust for analyst offset
function set_datebox_epoch_displayvalue(oEle,strEpochValue,boolAnalystOffset)
{
	var intOffset = (boolAnalystOffset)?_analyst_timezoneoffset:0;
	var numEpochValue = new Number(strEpochValue);
	var intEpoch = numEpochValue + intOffset;

	//-- format settings
	var strFormat = oEle.getAttribute("format");
	if((strFormat==null)||(strFormat==""))
	{
		var strFormatType = oEle.getAttribute("formattype");
		if(strFormatType=="date")
		{
			var strFormat=app._analyst_dateformat;
		}
		else if(strFormatType=="time")
		{
			var strFormat=app._analyst_timeformat;
		}
		else
		{
			var strFormat=app._analyst_datetimeformat;
		}
	}

	//-- set element att and value
	var jsDate = _osdate_from_epoch(intEpoch);
	oEle.setAttribute("dbvalue",strEpochValue);
	oEle.value = _formatDate(jsDate,strFormat);
}


function get_displayvalueforfield_fromepochvalue(strEpochValue,strFormat,boolAnalystOffset)
{
	var intOffset = (boolAnalystOffset)?new Number(_analyst_timezoneoffset):0;
	var numEpochValue = new Number(strEpochValue);
	var intEpoch = numEpochValue + intOffset;

	//-- format settings
	strFormat = strFormat.toLowerCase();
	if(strFormat=="date")
	{
		strFormat=app._analyst_dateformat;
	}
	else if(strFormat=="time")
	{
		strFormat=app._analyst_timeformat;
	}
	else if(strFormat=="datetime")
	{
		strFormat=app._analyst_datetimeformat;
	}

	//-- set element att and value
	var jsDate = _osdate_from_epoch(intEpoch);
	if(boolAnalystOffset)jsDate=_date_to_utc_date(jsDate);

	return _formatDate(jsDate,strFormat);
}


function format_datestring(strDateString,strFormat)
{

	var jsDate = _parseDate(strDateString,strFormat);
	if(jsDate)
	{
		return _formatDate(jsDate,strFormat);
	}
	return strDateString;

}


//-- given string date set the display value optionally adjust for analyst offset
function set_datebox_string_displayvalue(oEle,strDateValue,boolAnalystOffset)
{
	//-- format settings
	var strFormat = oEle.getAttribute("format");
	if((strFormat==null)||(strFormat==""))
	{
		var strFormatType = oEle.getAttribute("formattype");
		if(strFormatType=="date")
		{
			var strFormat=app._analyst_dateformat;
		}
		else if(strFormatType=="time")
		{
			var strFormat=app._analyst_timeformat;
		}
		else
		{
			var strFormat=app._analyst_datetimeformat;
		}
	}

	if(strDateValue==undefined)strDateValue="";
	if(strDateValue=="")
	{
		var jsDate = new Date();
	}
	else
	{
		var jsDate = _parseDate(strDateValue,strFormat);
	}
	if(jsDate)
	{
		oEle.value = _formatDate(jsDate,strFormat);
		oEle.setAttribute("dbvalue",oEle.value);
	}
	else
	{
			alert("The provided date string was not recognised. Please contact your Administrator.");
	}
}


//--
//-- format value after user types it in
function ondatechange_element(targetEle,intTime)
{
	var strFormat = targetEle.getAttribute("format");
	if(strFormat==null||strFormat=="")strFormat=app._analyst_dateformat;

	var jsDate = _parseDate(targetEle.value,strFormat);
	if(jsDate)
	{
		//-- check if we need to sod or eod date
		//-- staore epoch value in dbvalue
		if(intTime==1)jsDate=_set_date_sod(jsDate);
		if(intTime==2)jsDate=_set_date_eod(jsDate);
		var intEpochValue = _date_to_utc_epoch(jsDate); //-- get epoch value

		targetEle.setAttribute("dbvalue",intEpochValue);
		targetEle.value = _formatDate(jsDate,strFormat);
	}
	else
	{
		if(targetEle.value=="")
		{
			targetEle.setAttribute("dbvalue","");
		}
		else
		{
			alert("The entered date format was not recognised. Please use the format [" + strFormat + "]");
			targetEle.value="";
		}
	}
	return jsDate;
}

//-- 
//-- format value after user types it in
function ondatetimechange_element(targetEle,intTime)
{
	var strFormat = targetEle.getAttribute("format");
	if(strFormat==null||strFormat=="")strFormat=app._analyst_datetimeformat;

	var jsDate = _parseDate(targetEle.value,strFormat);
	if(jsDate)
	{

		//-- check if we need to sod or eod date
		//-- staore epoch value in dbvalue
		if(intTime==1)jsDate=_set_date_sod(jsDate);
		if(intTime==2)jsDate=_set_date_eod(jsDate);
		var intEpochValue = _date_to_utc_epoch(jsDate); //-- get epoch value
		targetEle.setAttribute("dbvalue",intEpochValue);
		targetEle.value = _formatDate(jsDate,strFormat);
	}
	else
	{
		if(targetEle.value=="")
		{
			targetEle.setAttribute("dbvalue","");
		}
		else
		{
			alert("The entered date format was not recognised. Please use the format [" + strFormat + "]");
			targetEle.value="";
		}
	}
	return jsDate;
}


//-- given an element show date selector and then populate date element
//-- also format date to element date format setting - if not element date format use analysts format
function select_element_date(targetEle, epochDate)
{
	set_datebox_epoch_displayvalue(targetEle,epochDate,true);
	return;
}

function select_element_datetime(targetEle)
{
	set_datebox_epoch_displayvalue(targetEle,epochDate,true);
	return;
}

function popup_date_selected(targetEle,epochDate)
{
	set_datebox_epoch_displayvalue(targetEle,epochDate,true);
	return;
}



function todaysdatetime()
{
	var strFormat=app._analyst_datetimeformat;
	var jsDate = new Date();
	return _formatDate(jsDate,strFormat);
}

function todaysdate()
{
	var strFormat=app._analyst_dateformat;
	var jsDate = new Date();
	return _formatDate(jsDate,strFormat);
}

function format_analyst_datetime(aDate)
{
	var strFormat=app._analyst_datetimeformat;
	return _formatDate(aDate,strFormat);
}

function format_analyst_date(aDate)
{
	var strFormat=app._analyst_dateformat;
	return _formatDate(aDate,strFormat);
}

//-- DATE FORMATTING FUNCTION


// ===================================================================
// Author: Matt Kruse <matt@mattkruse.com>
// WWW: http://www.mattkruse.com/
//
// NOTICE: You may use this code for any purpose, commercial or
// private, without any further permission from the author. You may
// remove this notice from your final code if you wish, however it is
// appreciated by the author if at least my web site address is kept.
//
// You may *NOT* re-distribute this code in any way except through its
// use. That means, you can include it in your product, or your web
// site, or any other form where the code is actually being used. You
// may not put the plain javascript up on your site for download or
// include it in your javascript libraries for download. 
// If you wish to share this code with others, please just point them
// to the URL instead.
// Please DO NOT link directly to my .js files from your site. Copy
// the files to your server and use them there. Thank you.
// ===================================================================

// HISTORY
// ------------------------------------------------------------------
// May 17, 2003: Fixed bug in _parseDate() for dates <1970
// March 11, 2003: Added _parseDate() function
// March 11, 2003: Added "NNN" formatting option. Doesn't match up
//                 perfectly with SimpleDateFormat formats, but 
//                 backwards-compatability was required.

// ------------------------------------------------------------------
// These functions use the same 'format' strings as the 
// java.text.SimpleDateFormat class, with minor exceptions.
// The format string consists of the following abbreviations:
// 
// Field        | Full Form          | Short Form
// -------------+--------------------+-----------------------
// Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
// Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
//              | NNN (abbr.)        |
// Day of Month | dd (2 digits)      | d (1 or 2 digits)
// Day of Week  | EE (name)          | E (abbr)
// Hour (1-12)  | hh (2 digits)      | h (1 or 2 digits)
// Hour (0-23)  | HH (2 digits)      | H (1 or 2 digits)
// Hour (0-11)  | KK (2 digits)      | K (1 or 2 digits)
// Hour (1-24)  | kk (2 digits)      | k (1 or 2 digits)
// Minute       | mm (2 digits)      | m (1 or 2 digits)
// Second       | ss (2 digits)      | s (1 or 2 digits)
// AM/PM        | a                  |
//
// NOTE THE DIFFERENCE BETWEEN MM and mm! Month=MM, not mm!
// Examples:
//  "MMM d, y" matches: January 01, 2000
//                      Dec 1, 1900
//                      Nov 20, 00
//  "M/d/yy"   matches: 01/20/00
//                      9/2/00
//  "MMM dd, yyyy hh:mm:ssa" matches: "January 01, 2000 12:30:45AM"
// ------------------------------------------------------------------

var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');
function LZ(x) {return(x<0||x>9?"":"0")+x}

// ------------------------------------------------------------------
// isDate ( date_string, format_string )
// Returns true if date string matches format of format string and
// is a valid date. Else returns false.
// It is recommended that you trim whitespace around the value before
// passing it to this function, as whitespace is NOT ignored!
// ------------------------------------------------------------------
function isDate(val,format) {
	var date=_getDateFromFormat(val,format);
	if (date==0) { return false; }
	return true;
	}

// -------------------------------------------------------------------
// compareDates(date1,date1format,date2,date2format)
//   Compare two date strings to see which is greater.
//   Returns:
//   1 if date1 is greater than date2
//   0 if date2 is greater than date1 of if they are the same
//  -1 if either of the dates is in an invalid format
// -------------------------------------------------------------------
function compareDates(date1,dateformat1,date2,dateformat2) {
	var d1=_getDateFromFormat(date1,dateformat1);
	var d2=_getDateFromFormat(date2,dateformat2);
	if (d1==0 || d2==0) {
		return -1;
		}
	else if (d1 > d2) {
		return 1;
		}
	return 0;
	}

// ------------------------------------------------------------------
// _formatDate (date_object, format)
// Returns a date in the output format specified.
// The format string uses the same abbreviations as in _getDateFromFormat()
// ------------------------------------------------------------------
function _formatDate(date,format) {
	format=format+"";
	var result="";
	var i_format=0;
	var c="";
	var token="";
	var y=date.getYear()+"";
	var M=date.getMonth()+1;
	var d=date.getDate();
	var E=date.getDay();
	var H=date.getHours();
	var m=date.getUTCMinutes();
	var s=date.getUTCSeconds();
	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
	// Convert real date parts into formatted versions
	var value=new Object();
	if (y.length < 4) {y=""+(y-0+1900);}
	value["y"]=""+y;
	value["yyyy"]=y;
	value["yy"]=y.substring(2,4);
	value["M"]=M;
	value["MM"]=LZ(M);
	value["MMM"]=MONTH_NAMES[M-1];
	value["NNN"]=MONTH_NAMES[M+11];
	value["d"]=d;
	value["dd"]=LZ(d);
	value["E"]=DAY_NAMES[E+7];
	value["EE"]=DAY_NAMES[E];
	value["H"]=H;
	value["HH"]=LZ(H);
	if (H==0){value["h"]=12;}
	else if (H>12){value["h"]=H-12;}
	else {value["h"]=H;}
	value["hh"]=LZ(value["h"]);

	if (H>11){value["K"]=H-12;} else {value["K"]=H;}
	value["k"]=H+1;
	value["KK"]=LZ(value["K"]);
	value["kk"]=LZ(value["k"]);

	if (H > 11) 
	{ value["a"]="PM"; value["tt"]="PM"; }
	else { value["a"]="AM"; value["tt"]="AM";}
	value["m"]=m;
	value["mm"]=LZ(m);
	value["s"]=s;
	value["ss"]=LZ(s);

	while (i_format < format.length) 
	{
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length))
		{
			token += format.charAt(i_format++);
		}
		
		if (value[token] != null) 
		{ 
			result=result + value[token]; 
		}
		else 
		{ 
			result=result + token; 
		}
	}
	return result;
}
	
// ------------------------------------------------------------------
// Utility functions for parsing in _getDateFromFormat()
// ------------------------------------------------------------------
function _isInteger(val) {
	var digits="1234567890";
	for (var i=0; i < val.length; i++) {
		if (digits.indexOf(val.charAt(i))==-1) { return false; }
		}
	return true;
	}
function _getInt(str,i,minlength,maxlength) {
	for (var x=maxlength; x>=minlength; x--) {
		var token=str.substring(i,i+x);
		if (token.length < minlength) { return null; }
		if (_isInteger(token)) { return token; }
		}
	return null;
	}
	

function _getDateFromFormat(val,format) 
{
	val=val+"";
	format=format+"";
	var i_val=0;
	var i_format=0;
	var c="";
	var token="";
	var token2="";
	var x,y;
	var now=new Date();
	var year=now.getYear();
	var month=now.getMonth()+1;
	var date=1;
	var hh=now.getHours();
	var mm=now.getMinutes();
	var ss=now.getSeconds();
	var ampm="";


	while (i_format < format.length) {
		// Get next token from format string
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length)) 
		{
			token += format.charAt(i_format++);
		}

		// Extract contents of value based on format token
		if (token=="yyyy" || token=="yy" || token=="y") {
			if (token=="yyyy") { x=4;y=4; }
			if (token=="yy")   { x=2;y=2; }
			if (token=="y")    { x=2;y=4; }
			year=_getInt(val,i_val,x,y);

			if (year==null) { return 0; }
			i_val += year.length;
			if (year.length==2) {
				if (year > 70) { year=1900+(year-0); }
				else { year=2000+(year-0); }
				}
			}
		else if (token=="MMM"||token=="NNN"){
			month=0;
			for (var i=0; i<MONTH_NAMES.length; i++) {
				var month_name=MONTH_NAMES[i];
				if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
					if (token=="MMM"||(token=="NNN"&&i>11)) {
						month=i+1;
						if (month>12) { month -= 12; }
						i_val += month_name.length;
						break;
						}
					}
				}
			if ((month < 1)||(month>12)){return 0;}
			}
		else if (token=="EE"||token=="E"){
			for (var i=0; i<DAY_NAMES.length; i++) {
				var day_name=DAY_NAMES[i];
				if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
					i_val += day_name.length;
					break;
					}
				}
			}
		else if (token=="MM"||token=="M") {
			month=_getInt(val,i_val,token.length,2);
			if(month==null||(month<1)||(month>12)){return 0;}
			i_val+=month.length;}
		else if (token=="dd"||token=="d") {
			date=_getInt(val,i_val,token.length,2);
			if(date==null||(date<1)||(date>31)){return 0;}
			i_val+=date.length;}
		else if (token=="hh"||token=="h") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>12)){return 0;}
			i_val+=hh.length;}
		else if (token=="HH"||token=="H") 
		{
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>23)){return 0;}
			i_val+=hh.length;
		}
		else if (token=="KK"||token=="K") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>11)){return 0;}
			i_val+=hh.length;}
		else if (token=="kk"||token=="k") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>24)){return 0;}
			i_val+=hh.length;hh--;}
		else if (token=="mm"||token=="m") 
		{
			mm=_getInt(val,i_val,token.length,2);

			if(mm==null||(mm<0)||(mm>59)){return 0;}
			i_val+=mm.length;
		}
		else if (token=="ss"||token=="s") {
			ss=_getInt(val,i_val,token.length,2);
			if(ss==null||(ss<0)||(ss>59)){return 0;}
			i_val+=ss.length;}
		else if (token=="a" || token=="tt") {
			if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
			else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
			else {return 0;}
			i_val+=2;}
		else {
			if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
			else {i_val+=token.length;}
			}
		}

	// If there are any trailing characters left in the value, it doesn't match
	if (i_val != val.length) { return 0; }
	// Is date valid for month?
	if (month==2) {
		// Check for leap year
		if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
			if (date > 29){ return 0; }
			}
		else { if (date > 28) { return 0; } }
		}
	if ((month==4)||(month==6)||(month==9)||(month==11)) {
		if (date > 30) { return 0; }
		}

	// Correct hours value
	if (hh<12 && ampm=="PM") 
	{ hh=hh-0+12; 
	}
	else if (hh>11 && ampm=="AM") 
	{ 
		hh-=12; 
	}
	

	var newdate=new Date(year,month-1,date,hh,mm,ss);

	return newdate.getTime();
	}

// ------------------------------------------------------------------
// _parseDate( date_string [, prefer_euro_format] )
//
// This function takes a date string and tries to match it to a
// number of possible date formats to get the value. It will try to
// match against the following international formats, in this order:
// y-M-d   MMM d, y   MMM d,y   y-MMM-d   d-MMM-y  MMM d
// M/d/y   M-d-y      M.d.y     MMM-d     M/d      M-d
// d/M/y   d-M-y      d.M.y     d-MMM     d/M      d-M
// A second argument may be passed to instruct the method to search
// for formats like d/M/y (european format) before M/d/y (American).
// Returns a Date object or null if no patterns match.
// ------------------------------------------------------------------
function _parseDate(val, strDateFormat) {
	
	var preferEuro=(arguments.length==2)?arguments[1]:false;
	generalFormats=new Array('d-M-y','d/M/y','y/M/d','y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','d-M-Y HH:mm','d/M/y HH:mm','y/M/d HH:mm','y-M-d HH:mm','MMM d, y HH:mm','MMM d,y HH:mm','y-MMM-d HH:mm','d-MMM-y HH:mm','MMM d HH:mm','d-M-y','d/M/y','y/M/d','y-M-d','MMM d, yyyy','MMM d,yyyy','yyyy-MMM-d','d-MMM-yyyy','MMM d','yyyy-M-d HH:mm:ss','d-M-YYYY HH:mm','d/M/yyyy HH:mm','yyyy/M/d HH:mm','yyyy-M-d HH:mm','MMM d, yyyy HH:mm','MMM d,yyyy HH:mm','yyyy-MMM-d HH:mm','d-MMM-yyyy HH:mm','d-M-YYYY HH:mm:ss','d/M/yyyy HH:mm:ss','MMM d, yyyy HH:mm:ss','MMM d,yyyy HH:mm:ss','yyyy-MMM-d HH:mm:ss','d-MMM-yyyy HH:mm:ss','d-MM-yyyy HH:mm:ss','dd-MM-yyyy HH:mm:ss','yyyy-MM-dd HH:mm:ss','yyyy-MM-dd HH:mm','yyyy-MM-dd','dd-MM-yyyy hh:mm:ss','dd-MM-yy hh:mm:ss','dd-MM-yy hh:mm','dd-MM-yy','M/d/yyyy H:mm tt','M/d/yyyy H:mm:ss tt','M/d/yyyy HH:mm:ss tt','M-d-yyyy H:mm tt','M-d-yyyy H:mm:ss tt','M-d-yyyy HH:mm:ss tt','MM/d/yyyy H:mm tt','MM/d/yyyy H:mm:ss tt','MM/d/yyyy HH:mm:ss tt','MM-d-yyyy H:mm tt','MM-d-yyyy H:mm:ss tt','MM-d-yyyy HH:mm:ss tt','MM/dd/yyyy H:mm tt','MM/dd/yyyy H:mm:ss tt','MM/dd/yyyy HH:mm:ss tt','MM-dd-yyyy H:mm tt','MM-dd-yyyy H:mm:ss tt','MM-dd-yyyy HH:mm:ss tt','M/dd/yyyy H:mm tt','M/dd/yyyy H:mm:ss tt','M/dd/yyyy HH:mm:ss tt','M-dd-yyyy H:mm tt','M-dd-yyyy H:mm:ss tt','M-dd-yyyy HH:mm:ss tt','dd/MM/yyyy H:mm tt','dd/MM/yyyy H:mm:ss tt','dd/MM/yyyy HH:mm tt','dd/MM/yyyy HH:mm:ss tt','dd-MM-yyyy H:mm tt','dd-MM-yyyy H:mm:ss tt','dd-MM-yyyy HH:mm tt','dd-MM-yyyy HH:mm:ss tt','dd-MM-yy HH:mm:ss tt','dd-MM-yy HH:mm tt','dd/MM/yy HH:mm:ss tt','dd/MM/yy HH:mm tt');
	monthFirst=new Array('M/d/y','M-d-y','M.d.y','MMM-d','M/d','M-d','M/d/y HH:mm','M-d-y HH:mm','M.d.y HH:mm','MMM-d HH:mm','M/d HH:mm','M-d HH:mm','M/d/yyyy','M-d-yyyy','M.d.yyyy','M/d/yyyy HH:mm','M/d/yyyy HH:mm','M/d/yyyy h:mm:ss tt','M-d-yyyy h:mm:ss tt','M.d.yyyy HH:mm');
	dateFirst =new Array('d/M/y','d-M-y','d.M.y','d-MMM','d/M','d-M','d-M-y','d/M/y HH:mm','d-M-y HH:mm','d.M.y HH:mm','d-MMM HH:mm','d/M HH:mm','d-M HH:mm','d-M-y HH:mm','d/M/yyyy','d-M-yyyy','d.M.yyyy','d-MMM','d/M','d-M','d-M-yyyy','d/M/yyyy HH:mm','d-M-yyyy HH:mm','d.M.yyyy HH:mm','d-MMM HH:mm','d/M HH:mm','d-M HH:mm','d-M-yyyy HH:mm','d/M/yyyy HH:mm:ss','d-M-yyyy HH:mm:ss','d.M.yyyy HH:mm:ss','d-MMM HH:mm:ss','d/M HH:mm:ss','d-M HH:mm:ss','d-M-yyyy HH:mm:ss');

	var checkList=new Array('generalFormats',preferEuro?'dateFirst':'monthFirst',preferEuro?'monthFirst':'dateFirst');
	var d=null;
	//var strDateFormat = undefined;
	if(strDateFormat!=undefined)
	{
				d=_getDateFromFormat(val,strDateFormat);
				if (d!=0) { return new Date(d); }
	}
	else
	{
		for (var i=0; i<checkList.length; i++) {
			var l=window[checkList[i]];
			for (var j=0; j<l.length; j++) {
				d=_getDateFromFormat(val,l[j]);
				if (d!=0) { return new Date(d); }
				}
			}
	}
	return null;
	
}




function clicked_datebox_trigger(oEle,e)
{
	return app._clicked_ele_trigger(oEle,e);
}
//-- create date picker
function trigger_datebox_dropdown(oEle,e, oJsDate)
{
	if(clicked_datebox_trigger(oEle,e))
	{
		var undefined;
		hide_form_element_date_picker(oEle,undefined,oJsDate);
		return app.stopEvent(e);
	}
	
}

//-- form date selected - get parent holder and element then set date of element
function _datecontrol_selectdate()
{
	var oDoc = app.getEleDoc(this);
	if(oDoc)
	{
		//oDoc['_datecontrol_clicked'] = true;

		var oHolder = oDoc.getElementById("__sw_element_date_picker");
		if(oHolder!=null)
		{
			var aDate= new Date();
			aDate.setYear(oHolder.getAttribute("showyear"));
			aDate.setMonth(oHolder.getAttribute("showmonth"));
			aDate.setDate(app.getElementText(this));
			var epochDate = app._date_to_epoch(aDate);

			if(oHolder.targetelement.swfc!=undefined)
			{
				oHolder.targetelement.swfc._value(epochDate,"",false,true);
			}
			else
			{
				var eDate = app.select_element_date(oHolder.targetelement, epochDate);

				if(oHolder.targetelement.onchangefunction)
				{

					oHolder.targetelement.onchangefunction(oHolder.targetelement,eDate,false);
				}
				else
				{

					process_form_date_control_changed(oHolder.targetelement,eDate);
				}
			}
			hide_form_element_date_picker(oHolder.targetelement,true);
		}
	}
}


function process_form_date_control_changed(oEle,newDate,tWindow)
{
	var oDoc = app.getEleDoc(oEle);

	//-- get date from value
	if(newDate==undefined)
	{
		newDate = app.onformdate_control_change(oEle);
		if(newDate==false)return false;
	}

	//-- check if want to set to start or end of day
	var intTime=oEle.getAttribute("settime");
	if(intTime==1)
	{
		newDate.setHours(0);
		newDate.setMinutes(0);
		newDate.setSeconds(0);
	}
	else if(intTime==2)
	{
		newDate.setHours(23);
		newDate.setMinutes(59);
		newDate.setSeconds(59);
	}

	//- set element date and epoch attribs so other funcs written by dev can use then if need be
	oEle.date = newDate;
	oEle.epoch = app._date_to_epoch(newDate);
	oEle.setAttribute("dbvalue",app._date_to_epoch(newDate));

	//-- if element has binding then set it
	var strBinding = oEle.getAttribute("binding");
	if((strBinding!="")&&(strBinding!=null))
	{
		var arrI = strBinding.split(".");
		if (oDoc[arrI[0]]!=undefined)
		{
			//-- call document level 
			oDoc[arrI[0]][arrI[1]]=epochDate;
			oDoc[arrI[0]].__changedvalues[arrI[1]] = epochDate;
			oDoc[arrI[0]].__modified = true;
		}
	}

}



//-- function to show or hide form date picker for an element
function hide_form_element_date_picker(oEle,boolHide,oJsDate)
{
	var undefined;
	var doc = app.getEleDoc(oEle);
	if(doc==null) return;
	if(boolHide==undefined)
	{
		var boolHidden = oEle.getAttribute("datehidden");
		if(boolHidden==null)boolHidden="true";
		if(boolHidden=="true")
		{
			boolHide=false;
			oEle.setAttribute("datehidden","false");
		}
		else
		{
			boolHide=true;
			oEle.setAttribute("datehidden","true");
		}
	}

	//-- check if we have date picker already
	var formDP = doc.getElementById("__sw_element_date_picker");
	var aShimmer = doc.getElementById("__sw_element_date_picker_shimmer");
	
	//-- 88552 - always run through create date picker function as it sets default values for month etc based on oJsDate
	//if(formDP==null)
	//{
		//-- need to create new date picker for form
		formDP = create_form_datepicker(doc,undefined,undefined,oJsDate);
		aShimmer = doc.getElementById("__sw_element_date_picker_shimmer");
	//}
	
	if(!boolHide)
	{
		var calOne = doc.getElementById("__sw_element_date_picker_1");
		if(calOne!=null)
		{
			if(oJsDate==null)
			{
				oJsDate = new Date();
			}
			_set_calendar_monthyear(calOne,oJsDate.getMonth(),oJsDate.getFullYear(),doc,oJsDate.getDate());
		}
	}

	//-- show hide datepicker
	formDP.style.display =(boolHide==true)?"none":"block";
	//-- have to use shimmer for IE6
	if(app.isIE6)aShimmer.style.display = formDP.style.display;

	if(!boolHide)
	{
		formDP.style.left = app.eleLeft(oEle);

		//-- if left and width is great than body
		var iRight = app.eleLeft(oEle) + formDP.offsetWidth;
		if(iRight > doc.body.offsetWidth)
		{
			var eRight = app.eleLeft(oEle) + oEle.offsetWidth;
			var iAdjust = iRight - eRight;
			formDP.style.left =  formDP.offsetLeft - iAdjust;
		}

		//-- if drop down will go off bottom of screen
		var iDropHeight = formDP.offsetHeight;
		var iDropBottom = iDropHeight + (oEle.offsetTop + oEle.offsetHeight);
		var iFormBottom = (app.isFirefox)?doc.body.clientHeight:doc.body.offsetHeight; //- (oEle.offsetTop + oEle.offsetHeight);
		if(iFormBottom<iDropBottom)
		{
			//-- show above
			formDP.style.top = app.eleTop(oEle) - iDropHeight - 1;
		}
		else
		{
			//-- show below
			formDP.style.top = app.eleTop(oEle) + oEle.offsetHeight + 1;
		}

		if(app.isIE6)
		{
			aShimmer.style.position='absolute';
			aShimmer.style.zIndex=999998;
			formDP.style.zIndex=999999;
			aShimmer.style.left=formDP.style.left;
			aShimmer.style.top=formDP.style.top;
			aShimmer.style.width=formDP.offsetWidth;
			aShimmer.style.height=formDP.offsetHeight;
		}

		formDP.targetelement = oEle;
	}
}

function create_form_datepicker(aDoc,monthtodo,yeartodo,oJsDate)
{
	//-- create cal holder if does not exist
	var boolFirstTime = false;
	var oHolder = aDoc.getElementById("__sw_element_date_picker");
	var	aDiv = aDoc.getElementById("__sw_element_date_picker_1");
	if(oHolder==null)
	{
		boolFirstTime = true;
		var strDivHolder = "<div id='__sw_element_date_picker' class='form_date_picker'><div id='__sw_element_date_picker_1'  class='date-calendar'  style='background-color:#ffffff;'></div></div><iframe id='__sw_element_date_picker_shimmer' src='' style='display:none;'></iframe>";
		app.insertBeforeEnd(aDoc.body,strDivHolder);
		oHolder = aDoc.getElementById("__sw_element_date_picker");
		aDiv = aDoc.getElementById("__sw_element_date_picker_1");	
	}

	if(oJsDate!=null)
	{
		oHolder.setAttribute("showyear",oJsDate.getFullYear());
		oHolder.setAttribute("showmonth",oJsDate.getMonth());
	}
	else
	{
		oHolder.setAttribute("showyear",app._getyear());
		oHolder.setAttribute("showmonth",app._getmonth());
	}


	//-- create header and body info
	if(boolFirstTime)
	{
		_create_datepicker_header(aDiv,true,aDoc);
		_create_datepicker_body(aDiv,aDoc);
	}
	//-- if want same month and year that is already set then do not process days
	var currmonthtodo = new Number(oHolder.getAttribute("showmonth"));
	var curryeartodo = new Number(oHolder.getAttribute("showyear"));
	//-- if not passed in month and year then use current.

	if(monthtodo==undefined)monthtodo=currmonthtodo;
	if(yeartodo==undefined)yeartodo=curryeartodo;

	if((!boolFirstTime)&&(currmonthtodo==monthtodo)&&(curryeartodo==yeartodo)) return oHolder;
	if (monthtodo > 12)
	{
		monthtodo = monthtodo - 12;
		yeartodo++;
	}

	oHolder.setAttribute("showyear",yeartodo);
	oHolder.setAttribute("showmonth",monthtodo);

	//_set_calendar_monthyear(aDiv,monthtodo,yeartodo,aDoc);

	return oHolder;
}

function _set_calendar_monthyear(oHolder,setmonth,setyear,aDoc, inthighlightDay)
{
	//var s = new Date().getTime();

	//-- set calendar header
	var oHeader = aDoc.getElementById(oHolder.parentNode.id + "_monthyeartext");
	app.setElementText(oHeader, app.month[setmonth] + " " + setyear);

	//-- set date month and year
	var usedate = new Date();
	usedate.setYear(setyear);
	usedate.setMonth(setmonth);
	usedate.setDate(1);

	var currmonth = usedate.getMonth();
	var checkmonth = usedate.getMonth();

	var lastweek=1;
	var x=2;

	//-- find out if we need to highlight day
	var tmpDate = new Date();
	var highlightday = false;
	var thisyear = tmpDate.getFullYear();
	if ((setmonth == tmpDate.getMonth())&&(setyear == thisyear)){highlightday=true;}

	//-- clear down calendar cells
	var oTable = aDoc.getElementById(oHolder.parentNode.id + '_tbl_days');
	for(var z=0;z<oTable.rows.length;z++)
	{
		for(var zz=0;zz<oTable.rows[z].cells.length;zz++)
		{
			var oCell = oTable.rows[z].cells[zz];
			if(oCell)
			{
				app.removeEvent(oCell,"click",_datecontrol_selectdate);
				//-- clear cell display properties
				app.setElementText(oCell,"");
				oCell.style.background = "#ffffff";
			}
		}
	}



	var currday = usedate.getDay();
	var currweek = app._getweek(usedate);
	_set_calendarday(currweek-1, currday-1, 1,oHolder,highlightday,setmonth,setyear,aDoc,inthighlightDay);
					
	while(checkmonth == currmonth)
	{
		usedate.setDate(x);
		//--check which week we are on
		var currweek = app._getweek(usedate);

		//-- we have moved onto an new month
		if (lastweek > currweek) break;
		lastweek = currweek;

		//--put x in this table cell, for current week
		currday = usedate.getDay();
		_set_calendarday(currweek-1, currday, x,oHolder,highlightday,setmonth,setyear,aDoc,inthighlightDay);
		checkmonth = usedate.getMonth();
		x++;
	}
			
	//var e = new Date().getTime();
	//app.debug((e-s) + " ms","set_calendar_monthyear","COMPLETED");


}

function _set_calendarday(in_week, in_daypos, in_day,in_oHolder,hilighttoday,in_month,in_year,aDoc, inthighlightDay)
{
	var undefined;
	//var s = new Date().getTime();

	if (in_daypos == -1) 
	{
		in_daypos = 6;
	}


	var oTable = aDoc.getElementById(in_oHolder.parentNode.id + '_tbl_days');
	var oCell = oTable.rows[in_week].cells[in_daypos];
		//app.get_parent_child_by_id(in_oHolder,'tbl_days').rows[in_week].cells[in_daypos];

	//-- cell methods (bespoke)
	app.addEvent(oCell,"click",_datecontrol_selectdate);

	//-- cell display properties
	app.setElementText(oCell,in_day);
	oCell.style.color	= "#000000";
	oCell.style.background = "#ffffff";
	if (hilighttoday) 
	{
		//-- if todays date then highlight
		var tmpdate = new Date();
		var today = tmpdate.getDate();
		if (today == in_day)
		{
			oCell.style.color	= "#ffffff";
			oCell.style.background = "navy";
		}
	}

	if(inthighlightDay!=undefined && oCell.style.background!="navy")
	{
		//-- 27.04.2011
		//-- if we have a highlighted day already then select it
		if (inthighlightDay == in_day)
		{
			oCell.style.color	= "#ffffff";
			oCell.style.background = "#8CB1E5";
		}
	}
		
	//var e = new Date().getTime();
	//app.debug((e-s) + " ms","set_calendar_day","COMPLETED");

}


function _create_datepicker_body(objDivholder)
{
	var strHTML = "";		
	//--- table holding the days headers 
	strHTML += '<table id="'+objDivholder.parentNode.id+'_daysheader" width="150px" border="0" cellspacing="0" cellpadding="0" class="daysheader" align=center >';
	strHTML += '<tr height="15px" >';
		strHTML += '<td class="daycell" valign="bottom" align="right">M</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">T</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">W</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">T</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">F</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">S</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">S</td>';
	strHTML += '</tr>';
	strHTML += '</table>';

	//--- table holding the actual days  (160px)
	strHTML += '<table id="'+objDivholder.parentNode.id +'_tbl_days" width="150px" border="0" cellspacing="0" cellpadding="0" class="daysholder"  align="center">';

	for (var x = 0 ; x < 6; x++)
	{
		strHTML += '<tr>';
			strHTML += '<td class="daycell" valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
		strHTML += '</tr>';
	}
	strHTML += '</table>';

	//-- write html to div
	app.insertBeforeEnd(objDivholder,strHTML);
}


function _create_datepicker_header(objDivholder , control_arrows)
{
	var strHTML = "";
	strHTML += '<table id="monthyear" width="150px" border="0" cellspacing="0" cellpadding="0" class="monthyear">';
	strHTML += '	<tr height="16px">';
	if (control_arrows) strHTML += '		<td class="calendar-leftarrow" onclick="app._datecontrol_previous_month(this);">&nbsp;&nbsp;&nbsp;&nbsp;</td>';
	strHTML += '		<td valign="middle"  align="middle" width="100%" id="'+objDivholder.parentNode.id+'_monthyeartext" class="monthyeartext"></td>';
	if (control_arrows) strHTML += '		<td class="calendar-rightarrow" onclick="app._datecontrol_next_month(this);">&nbsp;&nbsp;&nbsp;&nbsp;</td>';
	strHTML += '	</tr>';
	strHTML += '</table>';
	//-- write html to div
	app.insertBeforeEnd(objDivholder,strHTML);

}

function _datecontrol_previous_month(oTD)
{
	var aDoc = app.getEleDoc(oTD);
	aDoc['_datecontrol_clicked'] = true;

	var oHolder = aDoc.getElementById("__sw_element_date_picker");
	var aDiv = aDoc.getElementById("__sw_element_date_picker_1");


	var yeartodo = oHolder.getAttribute("showyear");
	var monthtodo = oHolder.getAttribute("showmonth");
	monthtodo--;
	if (monthtodo < 0)
	{
		monthtodo = 11;
		yeartodo--;
	}
	_set_calendar_monthyear(aDiv,monthtodo,yeartodo,aDoc);

	oHolder.setAttribute("showyear",yeartodo);
	oHolder.setAttribute("showmonth",monthtodo);
}

function _datecontrol_next_month(oTD)
{
	var aDoc = app.getEleDoc(oTD);
	aDoc['_datecontrol_clicked'] = true;

	var oHolder = aDoc.getElementById("__sw_element_date_picker");
	var aDiv = aDoc.getElementById("__sw_element_date_picker_1");


	var yeartodo = oHolder.getAttribute("showyear");
	var monthtodo = oHolder.getAttribute("showmonth");
	monthtodo++;
	if (monthtodo > 11)
	{
		monthtodo = 0;
		yeartodo++;
	}
	_set_calendar_monthyear(aDiv,monthtodo,yeartodo,aDoc);

	oHolder.setAttribute("showyear",yeartodo);
	oHolder.setAttribute("showmonth",monthtodo);
}