	var undefined;
	var arr_months =  new Array("January","February","March","April","May","June","July","August","September","October","November","December");
	
	function objCalendar(varname,oDivholder,number_of_months,strFormat)
	{
			this.type="calendar";

			this.name =  varname;
			this.oHolder = oDivholder;
			this.format  = strFormat; //-- dd/mm/yyyy - mm/dd/yyyy	

			var tmpDate = new Date();
			var start_month = tmpDate.getMonth();
			var start_year = tmpDate.getFullYear();
			var day = tmpDate.getDate();

			//pad(day) + "/" + pad(start_month+1) + "/" + start_year;
			this.today = format_date(strFormat,pad(day),pad(start_month+1),start_year);
			this.todaynum = start_year + pad(start_month+1) + pad(day);

			this.bgcolor= "white";
			this.cell_color = "black";
			this.cellselect_color = "white";
			this.cellselect_bgcolor = "navy";

			this.array_selecteddates = new Array();
			this.array_displayed_dates = new Array(); //-- array of dates displayed on the calendar 
			
			this.startmonth = start_month+1;
			this.startyear = start_year;
			this.numberofmonths = number_of_months;
			this.prevnext_jumpcount = number_of_months; //-- user can override so only jump 1 month etc

			this.firstdatenum="";
			this.lastdatenum="";
			this.lowestselecteddatenum = -1;
			this.highestselecteddatenum = -1;
			this.selectedcell=null;

			this.defaultselecttoday=true;	//-- auto select todays date
			this.multiselecting=true;
			this.multiselectwason=false;
			this.shiftoff = false;
			this.ctrloff = false;
			

			this.adateisselected = false;	//-- indicator to show if a date is populated

			this.onDateSelected = null;		//-- store function to call when a date is selected
			this.onMultiDateSelected = null;	//-- function to call after selecting multidates
			this.onCalendarDrawn = null;	//-- function to call when calendar has finished drawing
			this.onRedraw = null;				//-- function to call after selecting next/prev month
	}

	objCalendar.prototype.create_calendar	= pt_create_calendar;
	objCalendar.prototype.todaysdate		= pt_todaysdate;	
	objCalendar.prototype.nextmonth			= next_month;
	objCalendar.prototype.prevmonth			= previous_month;

	objCalendar.prototype.highlightdate				=	pt_highlightdate;		
	objCalendar.prototype.highlightbetweendates		=	pt_highlightbetweendates;
	objCalendar.prototype.selectdate				=	pt_selectdate;
	objCalendar.prototype.highlight_selected_dates	=	pt_highlight_selected_dates;
	objCalendar.prototype.restorecellcolor			=	pt_restorecellcolor;
	objCalendar.prototype.clearselecteddates		=	pt_clearselecteddates;
	objCalendar.prototype.check_multi_select		=	pt_check_multi_select;
	
	objCalendar.prototype.selecteddates_list		=	pt_selecteddates_list;
	objCalendar.prototype.isadateselected			=	pt_isadateselected;



	//-- 09.04.2004
	//-- NWJ
	//-- Called when user clicks on a cell (handles single or multi select)

	function pt_selectdate(e)
	{
		//-- loop through visible calendars 
		//-- and find date and highlight

		var evtobj=window.event? event : e; 



		//try
		//{
			var oCell = this;

			//-- get select type (single, shift, ctrl)
			var ctrlSelect = false;
			var shiftSelect = false;
			var singleSelect = false;
			switch (oCell.oCalendar.check_multi_select(evtobj))
			{
				case 0:
					shiftSelect = true;
					break;
				case 1:
					ctrlSelect = true;
					break;
			}

			//-- doing a shift select
			if (shiftSelect)
			{
				//-- highlight from lowest selected date to highest selected date
				if (oCell.oCalendar.selectedcell)
				{
					//-- the selected cell is our starting point
					//-- oCell is our end point
					if (oCell.oCalendar.selectedcell.numdate > oCell.numdate)
					{
						oCell.oCalendar.clearselecteddates();
						oCell.oCalendar.highlightbetweendates(oCell.numdate,oCell.oCalendar.selectedcell.numdate,undefined,undefined,true)				
					}
					else
					{
						oCell.oCalendar.clearselecteddates();
						oCell.oCalendar.highlightbetweendates(oCell.oCalendar.selectedcell.numdate,oCell.numdate,undefined,undefined,true)				
					}

					if (oCell.oCalendar.onDateSelected != null)
					{
						//-- attach event - trigger it - detach it
						oCell.oCalendar.onDateSelected(oCell);
					}
					oCell.oCalendar.selectedcell = oCell;
					//-- oCell.oCalendar.selectedcell = null;
				}
				else
				{
					singleSelect = true;
				}
			}
			else if (ctrlSelect)
			{
				//-- doing s ctrl select so here we dont need to do
				//-- anything just leave it as it is
				oCell.oCalendar.multiselectwason=true;
				oCell.oCalendar.selectedcell = null;
			}
			else
			{
				//-- doing a single select so clear any highlighted dates
				singleSelect = true;
				oCell.oCalendar.multiselectwason=false;
				oCell.oCalendar.clearselecteddates();
				oCell.oCalendar.lowestselecteddatenum = -1;
				oCell.oCalendar.highestselecteddatenum=-1;
			}
			

			//if (oCell.oCalendar.selectedcell.highlighted)oCell.oCalendar.restorecellcolor(oCell.oCalendar.selectedcell.numdate);
			//-- already highlighted so unhighlight it
			var boolRemove = false;
			if (oCell.highlighted)
			{
				oCell.oCalendar.restorecellcolor(oCell.numdate);
				
				//-- remove from array
				oCell.oCalendar.array_selecteddates[oCell.id] = null;
				boolRemove = true;
			}
		
			//-- trigger on select function		
			//-- if doing a single select clear other highlighted dates
			if (singleSelect) oCell.oCalendar.clearselecteddates();			

			if (!shiftSelect && !boolRemove)oCell.oCalendar.highlightdate(oCell.numdate);
			
			//-- add date to selecteddates array
			if(!boolRemove)
		    {
				oCell.highlighted =true;
				oCell.oCalendar.array_selecteddates[oCell.id] = oCell.numdate;
				if ((oCell.oCalendar.lowestselecteddatenum == -1) || (oCell.oCalendar.lowestselecteddatenum > oCell.numdate))
				{
					oCell.oCalendar.lowestselecteddatenum = oCell.numdate;
				}
				if ((oCell.oCalendar.highestselecteddatenum == -1) || (oCell.oCalendar.highestselecteddatenum < oCell.numdate))
				{
					oCell.oCalendar.highestselecteddatenum = oCell.numdate;
				}
			
				//--
				//-- execute the ondateselected function when doing single select only
				//if (singleSelect) 
				//{
				oCell.oCalendar.selectedcell = oCell;
			}
					//try
					//{
						if (oCell.oCalendar.onDateSelected != null)
						{
							oCell.oCalendar.onDateSelected(oCell);
						}
					//}
					//catch(e)
					//{
					//	alert("function pt_selectdate(in_datenum,in_bgcolour,in_fontcolour) : Could not call onclick date function " + e.description) ;
					//}
				//}
		

			//-- set flag to show if 1 or more dates are selected
			oCell.oCalendar.adateisselected=oCell.oCalendar.isadateselected();

		//}
		//catch(e){}
	}

	//-- 09.06.2004
	//-- NWJ
	//-- return true or false depending if we have a date selected
	function pt_isadateselected()
	{
		for (cellid in this.array_selecteddates)
		{
			try
			{
				var cell_date = this.array_selecteddates[cellid];
				if (cell_date != null)
				{
					return true;
				}
			}
			catch(e){}
		}
		return false;
	}

	//-- 09.06.2004
	//-- NWJ
	//-- Call to highlight in_datenum with given colours or calendar default colours
	function pt_highlightdate(in_datenum,in_bgcolour,in_fontcolour,store)
	{
		//try
		//{
			if (in_datenum != undefined) 
			{
				var strcellid = this.oHolder.id + "_" + in_datenum;
				var doc = app.getEleDoc(this.oHolder)
				var oCell = doc.getElementById(this.oHolder.id + "_" + in_datenum);
			}
			else
			{
				var oCell = this;
			}

			if (!store)
			{
				oCell.Origcolor=undefined;
				oCell.Origfontcolor=undefined;
			}

			//-- make sure we only store orig color if not already stored
			if (oCell.Origcolor == undefined) oCell.Origcolor = (in_bgcolour != undefined)?in_bgcolour:oCell.style.background;
			if (oCell.Origfontcolor == undefined) oCell.Origfontcolor  = (in_fontcolour != undefined)?in_fontcolour: oCell.style.color;
			if (in_bgcolour == undefined) in_bgcolour		= oCell.oCalendar.cellselect_bgcolor;
			if (in_fontcolour == undefined) in_fontcolour	= oCell.oCalendar.cellselect_color;

			//-- set style
			oCell.style.background = in_bgcolour;
			oCell.style.color = in_fontcolour;
			if (store)
			{
				oCell.oCalendar.array_selecteddates[oCell.id] = oCell.numdate;
				if ((oCell.oCalendar.lowestselecteddatenum == -1) || (oCell.oCalendar.lowestselecteddatenum > oCell.numdate))
				{
					oCell.oCalendar.lowestselecteddatenum = oCell.numdate;
				}
				if ((oCell.oCalendar.highestselecteddatenum == -1) || (oCell.oCalendar.highestselecteddatenum < oCell.numdate))
				{
					oCell.oCalendar.highestselecteddatenum = oCell.numdate;
				}
			}

		//}
		//catch(e){}
	}


	//-- loop through selected_dates_array and for each one that is in our date range
	//-- highlight
	function pt_highlightbetweendates(in_startdatenum,in_enddatenum,in_bgcolour,in_fontcolour,store)
	{
		var strhighlighteddates = "";
		for (cell_numdate in this.array_displayed_dates)
		{
			if ( (cell_numdate >= in_startdatenum) && (cell_numdate <= in_enddatenum) )
			{
				//-- highlight cell
				this.highlightdate(cell_numdate,in_bgcolour,in_fontcolour,store);
				if (strhighlighteddates != "") strhighlighteddates += ",";
				strhighlighteddates += cell_numdate;
			}

			//-- do not carry on as now passed range
			if (cell_numdate > in_enddatenum) return strhighlighteddates;
		}
		return strhighlighteddates;
	}


	//-- restore a cell to its original colour and remove it from the array_selecteddates
	function pt_restorecellcolor(in_datenum)
	{
		try
		{
			var doc = app.getEleDoc(this.oHolder);
			var oCell = doc.getElementById(this.oHolder.id + "_" + in_datenum);
		
			if (oCell.Origcolor != undefined)  oCell.style.background=oCell.Origcolor;
			if (oCell.Origfontcolor != undefined) oCell.style.color = oCell.Origfontcolor;
			
			this.array_selecteddates[oCell.id] = null;

			oCell.highlighted=false;
		}
		catch(e){}
	}


	//-- 09.06.2004
	//-- NWJ
	//-- run through the array_selecteddates and highlight all cells that are currently visible
	function pt_highlight_selected_dates()
	{
		for (cellid in this.array_selecteddates)
		{
			try
			{
				var cell_date = this.array_selecteddates[cellid];
				if (cell_date != null)
				{
					this.highlightdate(cell_date);
				}
			}
			catch(e){}
		}
	}

	//-- 09.06.2004
	//-- NWJ
	//-- run through the array_selecteddates and unselect all selected cells
	function pt_clearselecteddates()
	{
		for (cellid in this.array_selecteddates)
		{
			try
			{
				var cell_date = this.array_selecteddates[cellid];
				if (cell_date != null)
				{
					this.restorecellcolor(cell_date);
				}
			}
			catch(e){}
		}
		this.array_selecteddates = new Array();
		this.adateisselected=false;
		this.lowestselecteddatenum=-1;
	}

	//-- 09.06.2004
	//-- NWJ
	//-- is the shift key or ctrl key being used
	//-- return values depending
	function pt_check_multi_select(evtobj)
	{
		//-- multi select is switched off
		
		if (!this.multiselecting) return -1;
				
		//-- get key event
		var SHIFTselect = evtobj.shiftKey;
		var CTRLselect = evtobj.ctrlKey;

		//-- if shift and shift select is switched on return 0
		if ((SHIFTselect) && (!this.shiftoff) ) return 0;

		//-- if ctrl and ctrl select is switched on return 0
		if ((CTRLselect)&& (!this.ctrloff)) return 1;

		//-- nothing so
		return -1;
	}

	//-- 09.03.2004
	//-- NWJ
	//-- create comma delimited list of selected dates
	function pt_selecteddates_list(strDelimiter)
	{
		var retString = "";
		for (cellid in this.array_selecteddates)
		{
			var cell_date = this.array_selecteddates[cellid];
			if (cell_date != null)
			{
					if (retString != "") retString += strDelimiter;
					retString += cell_date;
			}
		}
		return retString;
	}

	//-- 04.04.2004
	//-- NWJ
	//-- return today date
	function pt_todaysdate()
	{
		return this.today;
	}

	function retfalse()
	{
		return false;
	}

	function pt_create_calendar()
	{
		//-- for each month create a div to hold instance
		var monthtodo				= this.startmonth;
		var yeartodo				= this.startyear;		
		this.array_displayed_dates	= new Array();
		this.firstdatenum			= "";
		this.lastdatenum			= "";

		this.oHolder.innerHTML = "";
		var aDoc = app.getEleDoc(this.oHolder);
		for (var y=0; y < this.numberofmonths;y++)
		{
				var boolDrawHeader=false;
				var aDiv = aDoc.getElementById(this.name + "_" + y);
				if (aDiv==null)
				{
					boolDrawHeader=true;
					//this.oHolder.style.width="100";
					var strDiv = "<div id='" + this.name + "_" + y + "' class='date-calendar' style='background:" + this.bgcolor + "' calendarobjectname='" + this.name + "'></div>";
					this.oHolder.onselectstart=retfalse;
					

					app.insertBeforeEnd(this.oHolder,strDiv);
					var aDiv = aDoc.getElementById(this.name + "_" + y);

					//--this.oHolder.insertAdjacentHTML('beforeEnd', strDiv);			
					this.oHolder.oCalendar = this;
				}		

				var showarrows = false;
				if (y == 0)showarrows = true;
				if(boolDrawHeader)
				{
					create_header(aDiv,showarrows,this.name);
					create_body(aDiv,this.name);
				}


				
				if (monthtodo > 12)
				{
						monthtodo = monthtodo - 12;
						yeartodo++;
				}
				set_calendar_monthyear(aDiv,monthtodo,yeartodo,this);
				monthtodo++;
		}
		
		if (this.onCalendarDrawn != null) this.onCalendarDrawn();

	}
		

	//-- 04.04.2004
	//-- NWJ
	//-- Process a previous month click	
	function previous_month(varname)
	{
		if (varname == undefined)
		{
			var oCalendar = this;
		}
		else
		{
			var oCalendar = eval(varname);
		}


		if (oCalendar.prevnext_jumpcount > 1)
		{
			oCalendar.startmonth= oCalendar.startmonth - oCalendar.prevnext_jumpcount + 1;
		}
		else
		{
			oCalendar.startmonth= oCalendar.startmonth - oCalendar.prevnext_jumpcount;			
		}
		if (oCalendar.startmonth <1)
		{
			//-- gone back a year
			oCalendar.startmonth = 12 + oCalendar.startmonth;
			oCalendar.startyear--;
		}

		oCalendar.create_calendar();

		//-- 09.06.2004
		//-- NWJ
		//-- highlight any of our selected dates
		//oCalendar.highlight_selected_dates();
		//-- eof

		if (oCalendar.onRedraw!= null)oCalendar.onRedraw();		
	}


	//-- 04.04.2004
	//-- NWJ
	//-- Process a next month click
	function next_month(varname)
	{
	
		if (varname == undefined)
		{
			var oCalendar = this;
		}
		else
		{
			var oCalendar = eval(varname);
		}
	
		//-- jump ahead how ever many moths are shown
		if (oCalendar.prevnext_jumpcount>1)
		{
			oCalendar.startmonth= oCalendar.startmonth + oCalendar.prevnext_jumpcount -1;
		}
		else
		{
			oCalendar.startmonth= oCalendar.startmonth + oCalendar.prevnext_jumpcount;	
		}
			
		if (oCalendar.startmonth > 12)
		{
			//-- gone forward a year
			oCalendar.startmonth = oCalendar.startmonth - 12;
			oCalendar.startyear++;
		}
		oCalendar.create_calendar();
	
		//-- 09.06.2004
		//-- NWJ
		//-- highlight any of our selected dates
		//oCalendar.highlight_selected_dates();
		//-- eof

		if (oCalendar.onRedraw!= null)oCalendar.onRedraw();
	}
	
			
	function monthtext(in_month_number)
	{
		return arr_months[in_month_number-1];
	}

	function set_calendar_monthyear(in_oHolder,in_month,in_year,oCalendar)
	{
		app.setElementText(document.getElementById("tb_monthyear_" + in_oHolder.id), monthtext(in_month) + " " + in_year);
		var in_date = new Date();
		in_date.setYear(in_year);
		in_date.setMonth(in_month-1);
		var mydate = new Date();
		mydate.setYear(in_date.getFullYear());
		mydate.setMonth(in_date.getMonth());
		mydate.setDate(1);
		currmonth = getmonth(mydate);
		checkmonth = getmonth(mydate);
		lastweek=1;
		var x=2;
		var tmpDate = new Date();
		var highlightday = false;
		var thisyear = tmpDate.getFullYear();
		if ((currmonth == getmonth(tmpDate))&&(in_year == thisyear)){highlightday=true;}

		var currday = getdayofweek(mydate);
		var currweek = getweek(mydate);
		set_calendarday(currweek-1, currday-1, 1,in_oHolder,highlightday,in_month,in_year,oCalendar);
		
				
		while(checkmonth == currmonth)
		{
			mydate.setDate(x);
			//--check which week we are on
			var currweek = getweek(mydate);

			//-- we have moved onto an new month
			if (lastweek > currweek) break;
			lastweek = currweek;

			//--put x in this table cell, for current week
			currday = getdayofweek(mydate);
			set_calendarday(currweek-1, currday, x,in_oHolder,highlightday,in_month,in_year,oCalendar);
			checkmonth = getmonth(mydate);
			x++;
		}
				
	}
	function create_body(objDivholder,objectcalendarname)
	{
		var strHTML = "";		
		//--- table holding the days headers 
		strHTML += '<table width="150px" border="0" cellspacing="0" cellpadding="0" class="daysheader" align=center >';
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
		strHTML += '<table id="tbl_days" width="150px" border="0" cellspacing="0" cellpadding="0" class="daysholder"  align="center" calendarobjectname="' + objectcalendarname + '" >';

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

	
	function create_header(objDivholder , control_arrows,objectcalendarname)
	{
		var strHTML = "";
		strHTML += '<table width="150px" border="0" cellspacing="0" cellpadding="0" class="monthyear">';
		strHTML += '	<tr height="16px">';
		if (control_arrows) strHTML += '		<td><image src="arr_left.ico" align=left onclick="previous_month(this.getAttribute(\'calendarobjectname\'))" calendarobjectname="' + objectcalendarname + '" ></td>';
		strHTML += '		<td  id="tb_monthyear_' + objDivholder.id + '" valign="middle"  align="middle" width="100%" class="monthyeartext"></td>';
		if (control_arrows) strHTML += '		<td><image src="arr_right.ico" align=right onclick="next_month(this.getAttribute(\'calendarobjectname\'))" calendarobjectname="' + objectcalendarname + '" ></td>';
		strHTML += '	</tr>';
		strHTML += '</table>';
		//-- write html to div
		app.insertBeforeEnd(objDivholder,strHTML);

	}


	//-- add a zero
	function pad(instring)
	{
		var num = new Number(instring);
		if (num < 10) instring =  "0" + instring;
		return instring;
	}

function get_child(strName,oParent)
{
	for (x=0;x < oParent.childNodes.length;x++)
	{
		if (oParent.childNodes[x].id==strName) return oParent.childNodes[x];
	}

	return null;
}

function set_calendarday(in_week, in_daypos, in_day,in_oHolder,hilighttoday,in_month,in_year,oCalendar)
{
	//try
	//{
		if (in_daypos == -1) 
		{
			in_daypos = 6;
		}

		//var oCell = in_oHolder.childNodes['tbl_days'].rows[in_week].cells[in_daypos];
		var oCell = app.get_parent_child_by_id(in_oHolder,'tbl_days').rows[in_week].cells[in_daypos];
		//alert(oCell)

		//-- create pointer to calendar
		oCell.oCalendar = oCalendar;

		//-- cell methods (bespoke)
		app.addEvent(oCell,"click",oCalendar.selectdate);
		//oCell.onclick	= oCell.oCalendar.selectdate;		//-- function called when cell is clicked on
		//oCell.onclick = selectme;		//-- function called when cell is clicked on
		//oCell.onmousedown = selectdate;	//-- function that highlights cell when mouseisdown
		app.addEvent(oCell,"dragstart",dragdate);
		//oCell.ondragstart = dragdate;	//-- function that allows user to drag a selected date into a text box

		//-- cell display properties
		app.setElementText(oCell,in_day);
		oCell.style.color	= oCalendar.cell_color;

		//-- cell custom properties
		//pad(in_day) + "/" + pad(in_month) + "/" + in_year;
		oCell.date		= format_date(oCalendar.format,pad(in_day),pad(in_month), in_year);
		oCell.day		= pad(in_day);
		oCell.month		= pad(in_month);
		oCell.year		= pad(in_year);		
		oCell.numdate	= in_year +""+ pad(in_month) +""+ pad(in_day);
		oCell.id		= oCalendar.oHolder.id + "_" + oCell.numdate;
		oCalendar.array_displayed_dates[oCell.numdate] = oCell.numdate;

		//-- store last and first date in calendar
		if (oCalendar.firstdatenum == "")
		{
			oCalendar.firstdatenum = oCell.numdate;
		}
		oCalendar.lastdatenum=oCell.numdate

		if (hilighttoday) 
		{
			//-- if todays date then highlight
			var tmpdate = new Date();
			var today = tmpdate.getDate();
			if (today == in_day)
			{
				oCell.style.background = "silver";
			}
		}
	//}
	//catch(e)
	//{
	//	alert(in_week + " : " + in_daypos);
	//}
}

	function dragdate()
	{
		//-- start dragging selected cell date
		var ocell = this;
		event.dataTransfer.setData("Text", ocell.date);
	}



	
	
//-- 04.04.2004
//-- HELPER FUNCTIONS

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
	
function format_date(strFormat,dd,mm,yyyy)
{
	strDate = string_replace(strFormat,"dd",dd,true);
	strDate = string_replace(strDate,"mm",mm,true);
	strDate = string_replace(strDate,"yyyy",yyyy,true);
	return strDate;
}


function isObject(HTMLele)	
{
	//not an object so do nothing
	if ((typeof HTMLele != 'object') || (HTMLele == null)) return false;
	return true;
}	




function string_replace(strText,strFind,strReplace,boolGlobalreplace)
{
	//-- replace all occs of strFind and ignore case (gi)
	var flags = (boolGlobalreplace)?"gi":"i";
	var rExp = new RegExp(strFind,flags);
	return strText.replace(rExp, strReplace);
}

//-- get epoch from date parts
function convert_dateepoch(intYear,intMonth,intDay,intHour,intMinutes,intSeconds)
{
    var humDate = new Date(Date.UTC(intYear,intMonth-1,intDay,intHour,intMinutes,intSeconds));
    var epochDate = new Number((humDate.getTime()/1000.0));
    return epochDate;
}

function convert_epochdate(intEpoch)
{
	if (intEpoch <0)
	{
		intEpoch = (1073741824-(intEpoch*-1))+1073741824;
	}
	return new Date(intEpoch * 1000);
}