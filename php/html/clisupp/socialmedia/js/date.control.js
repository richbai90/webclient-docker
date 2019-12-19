var arr_months =  new Array("January","February","March","April","May","June","July","August","September","October","November","December");

function getEventEle(anEvent)
{
	if (!anEvent) anEvent = window.event;
	var oTargeEle = (isIE)?anEvent.srcElement:anEvent.target;
	return oTargeEle;
}

function getEventL(anEvent)
{
	if (!anEvent) anEvent = window.event;
	var intX = (isIE)?anEvent.offsetX:anEvent.layerX;
	return intX;
}

function getEventT(anEvent)
{
	if (!anEvent) anEvent = window.event;
	var intY = (isIE)?anEvent.offsetY:anEvent.layerY;
	return intY;
}


function getyear(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysyear = todaysdate.getFullYear();
	return todaysyear;
}

function getmonth(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysmonth = todaysdate.getMonth() + 1;
	return todaysmonth;
}

function getweek(in_date)
{
	dayof = in_date.getDate();
	in_date.setDate(1);

	//-- so we have the first day of that month
	//-- lets find the day of week, then loop until increasing day of week
	week=1;
	for (x=1; x < dayof; x++)
	{
		in_date.setDate(x);
		y = getdayofweek(in_date);
		if (y == 0 ) week++;
	}
	return week;
}

function getdayofweek(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysday = todaysdate.getDay();
	return todaysday;
}

function get_last_day(aDate)
{
	currMonth = aDate.getMonth();
	for(var x=1;x < 32;x++)
	{
		aDate.setDate(x);
		if(aDate.getMonth() != currMonth) 
		{
			return x-1;
		}
	}
	return 31;
}

function hover_in_day(anEvent)
{
	srcEle = getEventEle(anEvent);
	if(srcEle.tagName =="TD")
	{
		if(srcEle.parentNode.rowIndex > 0)
		{
			var hoverClass = srcEle.className + "-hover";
			if (srcEle.className != hoverClass) srcEle.className = hoverClass;

			window.status = srcEle.offsetWidth;
		}
	}
}

function hover_out_day(anEvent)
{
	srcEle = getEventEle(anEvent);
	if(srcEle.tagName =="TD")
	{
		if(srcEle.parentNode.rowIndex > 0)
		{
			var hoverClass = srcEle.className;
			var origClass  = hoverClass.substring(0,hoverClass.indexOf("-hover"));
			if (srcEle.className.indexOf("-hover") !=-1) srcEle.className = origClass;
		}		
	}	
}

function select_day(anEvent)
{
	var srcEle = getEventEle(anEvent);
	if(srcEle.tagName =="TD")
	{
		if(srcEle.parentNode.rowIndex > 0)
		{
			if(srcEle.className.indexOf("soft")==-1)
			{
				var strDay = srcEle.innerHTML;
				var strMonth = srcEle.getAttribute("month");

				if(strDay<10)strDay = "0" + strDay;
				if(strMonth<10)strMonth = "0" + strMonth;
				var strDate = strDay + "-" +  strMonth + "-" + srcEle.getAttribute("year");

				var oDiv = document.getElementById("date-picker");
				oDiv.date.setDate(strDay);
				oDiv.callback(oDiv.date);
				return true;
			}
		}	
	}

	anEvent.cancelBubble = true;
	if (anEvent.stopPropagation) anEvent.stopPropagation();
	return false;

}

function prev_month(e)
{
	var oDiv = document.getElementById("date-picker");

	oDiv.date.setMonth(oDiv.date.getMonth()-1)
	set_days_view(oDiv.date);

	if (!e) var e = window.event; //-- ie
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

}

function next_month(e)
{
	var oDiv = document.getElementById("date-picker");
	oDiv.date.setMonth(oDiv.date.getMonth() + 1)
	set_days_view(oDiv.date);

	if (!e) var e = window.event; //-- ie
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

}

function prev_year(e)
{
	var oDiv = document.getElementById("date-picker");

	oDiv.date.setYear(oDiv.date.getFullYear()-1)
	set_days_view(oDiv.date);

	if (!e) var e = window.event; //-- ie
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

}

function next_year(e)
{
	var oDiv = document.getElementById("date-picker");
	oDiv.date.setYear(oDiv.date.getFullYear() + 1)
	set_days_view(oDiv.date);

	if (!e) var e = window.event; //-- ie
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

}


function create_days_html(showDate)
{
	strHTML = '<table class="calendar-table" onClick="select_day(event)" onmouseover="hover_in_day(event)" onmouseOut="hover_out_day(event)" border=0 cellspacing=0 cellpadding=2>';
	strHTML += '<tr>';
	strHTML += '<td  class="calendar-daysrow">Mon</td><td  class="calendar-daysrow">Tue</td>';
	strHTML += '<td  class="calendar-daysrow">Wed</td><td  class="calendar-daysrow">Thu</td><td  class="calendar-daysrow">Fri</td>';
	strHTML += '<td  class="calendar-daysrow-red">Sat</td><td  class="calendar-daysrow-red">Sun</td>';
	strHTML += '</tr>';

	//-- 42 days find first day (mon, tue, wed) etc so we know where to start
	currmonth = getmonth(showDate);
	curryear  = showDate.getFullYear();

	var loopdate = new Date();
	loopdate.setDate(1);
	loopdate.setYear(showDate.getFullYear());
	loopdate.setMonth(showDate.getMonth()-1);
	var intLastDay = get_last_day(loopdate);

	//-- F0095351
	var setdate = new Date();
	setdate.setDate(1);
	setdate.setYear(showDate.getFullYear());
	setdate.setMonth(showDate.getMonth());

	var actualDate = new Date();
	var actualDay = actualDate.getDate();
	var actualMonth = getmonth();
	var actualYear = getyear();

	var boolReached = false;
	var intAdjust = 0;
	var intRow = 0;
	var dayCount = -1;
	var arrDays = new Array();

	for(var x=0; x < 42;x++)
	{
		intDay = getdayofweek(setdate)
		intDay--;
		if(intDay==-1)intDay=6;

		if (intDay == x)
		{
			intAdjust=x-1;
			break;
		}
	}

	var currDay = setdate.getDate();
	for(var x=0; x < 42;x++)
	{
		if(intRow==0)strHTML += '<tr>';
		intRow++;	

		intDay = getdayofweek(setdate)
		intDay--;
		if(intDay==-1)intDay=6;

		strClass= (intRow > 5)?"calendar-redday":"calendar-day";
		if (intDay == x)
		{
			boolReached=true;
			if(curryear==actualYear)
			{
				if(currmonth==actualMonth)
				{
					if(currDay==actualDay)
					{
						strClass = "calendar-today "+strClass;
					}
				}
			}
			strHTML += '<td class="' + strClass + '" month="' + currmonth + '" year="' + curryear + '">' + setdate.getDate() + '</td>';
			setdate.setDate(setdate.getDate()+1);
			var currDay = setdate.getDate();
		}
		else
		{
			if(boolReached)
			{
				checkmonth = getmonth(setdate);
				if(checkmonth!=currmonth)strClass += "-soft";

				if(curryear==actualYear)
				{
					if(currmonth==actualMonth)
					{
						if(currDay==actualDay)
						{
							strClass = "calendar-today "+strClass;
						}
					}
				}

				strHTML += '<td class="' + strClass + '" month="' + currmonth + '" year="' + curryear + '">' + setdate.getDate() + '</td>';
				setdate.setDate(setdate.getDate()+1);
				var currDay = setdate.getDate();
			}
			else
			{			
				//-- F0095351
				loopdate.setDate(intLastDay - intAdjust)
				strHTML += '<td class="' + strClass + '-soft" month="' + currmonth + '" year="' + curryear + '">' + loopdate.getDate() + '</td>';
				intAdjust--;
				loopdate.setDate(intLastDay - intAdjust)
				var currDay = loopdate.getDate();
			}
		}

		if(intRow==7)
		{
			intRow=0;
			strHTML += '</tr>'
		}
	}
	strHTML += '</table>';


	document.getElementById("cal_date").innerHTML = arr_months[showDate.getMonth()] + ", " + showDate.getFullYear();


	return strHTML;
}

function hide_date()
{
	var oDiv = document.getElementById("date-picker");
	var oIF = document.getElementById("date-picker-shimer");
	oDiv.style['display'] = "none";
	oIF.style['display'] = "none";
}

function show_date(anEvent, callbackFunction)
{

	var srcEle = getEventSourceElement(anEvent);
	var showDate = new Date();

	var arrPos = findPos(srcEle); 

	posL = new Number(arrPos[0]);
	posT = new Number(arrPos[1]);

	//alert(srcEle.offsetHeight)
	var oDiv = document.getElementById("date-picker");
	setPos(oDiv,posL,(posT + srcEle.offsetHeight));
	oDiv.style['display'] = "block";

	if(isIE)
	{
		var oIF = document.getElementById("date-picker-shimer");
		oIF.style['display'] = "block";
		setPos(oIF,posL,(posT + srcEle.offsetHeight));
	}

	set_days_view(showDate)

	//-- set attributes
	//-- F0095351
	oDiv.callback = callbackFunction;
	showDate.setDate(1);
	oDiv.date = showDate;

	//-- hides context menu
	return false;
}

function set_days_view(showDate)
{
	var oDaysDiv = document.getElementById("date-picker-days");
	if(oDaysDiv!=null)
	{
		oDaysDiv.innerHTML = create_days_html(showDate); 

	}
}

//--
//-- date formatting


//-- given a yyyy and mm and dd value create an epoch date
function create_epoch_yyyymmddhhmm(yyyy,mm,dd,hh,MM)
{
	//-- subtract moth as js date month starts at 0 - 11
	mm--;

	if(hh==undefined)hh=0;
	if(MM==undefined)MM=0;
	
	var tmpDate = new Date();
	tmpDate.setYear(yyyy);
	tmpDate.setMonth(mm);
	tmpDate.setDate(dd);
	tmpDate.setHours(hh);
	tmpDate.setMinutes(MM);

	var epochDate = new Number((tmpDate.getTime()/1000));
	return 	Math.round(epochDate);
}

function date_ddmmyyyy(aDate,strSplit)
{
	if(strSplit==undefined)strSplit="-";
	var strDay = aDate.getDate();
	if(strDay<10)strDay = "0" + strDay;

	var strMonth = aDate.getMonth() + 1;
	if(strMonth<10)strMonth = "0" + strMonth;

	var strYear = aDate.getFullYear();

	return strDay + strSplit + strMonth + strSplit + strYear;
}

function date_yyyymmdd(aDate,strSplit)
{
	if(strSplit==undefined)strSplit="-";
	var strDay = aDate.getDate();
	if(strDay<10)strDay = "0" + strDay;

	var strMonth = aDate.getMonth() + 1;
	if(strMonth<10)strMonth = "0" + strMonth;

	var strYear = aDate.getFullYear();

	return strYear + strSplit + strMonth + strSplit + strDay;
}


function date_epoch(aDate)
{

	aDate.setHours(00);
	aDate.setMinutes(01);

	var epochDate = new Number((aDate.getTime()/1000));
	return 	Math.round(epochDate);
}


function create_date_epoch(intEpoch)
{
	if (intEpoch <0)
	{
		intEpoch = (1073741824-(intEpoch*-1))+1073741824;
	}
	return new Date(intEpoch * 1000);
}



