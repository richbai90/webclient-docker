<?php
	include('../../../../php/session.php');
?>
<head>
	<link rel="StyleSheet" href="calendar.css" type="text/css" />
	<link rel="stylesheet" href="popupcalendar.css" type="text/css">
	<script src="min/objcalendar.js"></script>

	<script>

		var undefined;
		var app = (opener)?opener:top;
		var jqDoc = app.jqueryify(document); //-- so can use jquery		

		var oDateSelector = null;
		var arrSelectedDates = new Array();
		var _strSelectedDates = "";

		var intDefaultCalendarID = 0;
		var _strSelectedCalendars = "";

		//-- use xmlmc o get calendar list
		function _setup_calendar_list()
		{
			var oDiv = document.getElementById("div_calendars");
			if(oDiv!=null)
			{
				var strHTML = "";
				for(var x=0;x<app._arr_xml_calendar_list.length;x++)
				{
					var strChecked = (x==0)?"checked":"";

					var strID = app.xmlNodeTextByTag(app._arr_xml_calendar_list[x],"calendarId");
					var strDisplay = app.xmlNodeTextByTag(app._arr_xml_calendar_list[x],"displayName");
					var strTimeZone = app.xmlNodeTextByTag(app._arr_xml_calendar_list[x],"timezone");
					strHTML+= "<div class='user_calander'><table cellspacing=0 cellpadding=0 border=0><tr><td><input type='checkbox' "+strChecked+" onclick='load_calendars(false,this);' id='cal_"+strID+"' calid='"+strID+"' timezone='" + strTimeZone + "'></td><td width='100%'><label for='cal_"+strID+"'>"+strDisplay+"</label></td></tr></table></div>";

					if(intDefaultCalendarID==0)intDefaultCalendarID = strID;
				}

				if(strHTML!="")
				{
					oDiv.innerHTML = strHTML;
					return true;
				}
			}
			return false;
		}

		//-- use xmlmc to get calendar appointment dates - loop through and remove any that are not in include dates
		function _get_xmlmc_appointments(iCalID,strStartDate,strEndDate,strIncludeDates,intOffset)
		{
			//-- apply calendar offset to the dates so we can search for correct data
			if(intOffset==undefined)intOffset=0;

			var oStartDate = app._parseDate(strStartDate + " 00:00:00","yyyy-MM-dd HH:mm:ss");
			var oEndDate = app._parseDate(strEndDate + " 23:59:59","yyyy-MM-dd HH:mm:ss");

			//-- get appointments between dates
			var arrIncludedAppointmentsXml = new Array();
			var xmlmc = app._new_xmlmethodcall();
			xmlmc.SetParam("calendarId", iCalID);
			xmlmc.SetParam("dateStart",app._date_to_utc_timestamp(oStartDate));
			xmlmc.SetParam("dateEnd", app._date_to_utc_timestamp(oEndDate));
			if(xmlmc.Invoke("calendar", "getAppointments"))
			{
				var arrAllAppointments = xmlmc.xmlDOM.getElementsByTagName("appointment");
				for (var x=0;x<arrAllAppointments.length;x++)
				{
					//-- check if start date is in strIncludeDates
					var strAppStartDate = app.xmlNodeTextByTag(arrAllAppointments[x],"startTime");
					strAppStartDate = strAppStartDate.substring(0,10);
					if(strIncludeDates.indexOf(strAppStartDate)!=-1)
					{
						//-- we want this appointment
						var strAppID = app.xmlNodeTextByTag(arrAllAppointments[x],"appointmentId");
						arrIncludedAppointmentsXml[strAppID] = arrAllAppointments[x];
					}
				}
			}
			else
			{
				alert(xmlmc.GetLastError());
			}
			return arrIncludedAppointmentsXml;
		}

		var __CURRENT_DATA_XML = new Array();
		function load_calendars(bSkipDataLoad,evtCheckBox)
		{
			if(bSkipDataLoad==undefined || __CURRENT_DATA_XML.length==0)bSkipDataLoad=false;
			if(!bSkipDataLoad && __CURRENT_DATA_XML.length>0)__CURRENT_DATA_XML = new Array();


			//-- use api ?? but no way to get data for multiple calendars and no way to get data for say 3 dates
			//-- SO EITHER NEED TO MAKE CALENDAR VIEW LIKE FULLCLIENT OR USE DB ACCESS TO GET LIST
			var arrDates = _strSelectedDates.split(",");
			var strStartDate = arrDates[0];
			var strEndDate = arrDates[arrDates.length-1];

			//-- get selected calendars
			_strSelectedCalendars ="";

			var arrCalAppointmentXml = new Array();
			var arrCalTitles = new Array();
			var arrCalTzOffsets = new Array();
			var strCals = "";
			var strCalNames = ""; 
			var arrCheckedCB = app.get_children_by_tag(document.getElementById("div_calendars"), "INPUT", false);
			var arrSpans = app.get_children_by_tag(document.getElementById("div_calendars"), "LABEL", false);

			if(evtCheckBox!=undefined)
			{
				var checkedCount = 0;
				for(var x=0; x < arrCheckedCB.length;x++)
				{
					if(arrCheckedCB[x]!=undefined && arrCheckedCB[x].checked)
					{
						checkedCount++;
						break;
					}
				}

				//-- no calendars are checked - so check the first one
				if(checkedCount==0)evtCheckBox.checked=true;
			}

			for(var x=0; x < arrCheckedCB.length;x++)
			{
				if(arrCheckedCB[x]!=undefined && arrCheckedCB[x].checked)
				{
					if(strCals!="")
					{	
						strCals+=",";
						_strSelectedCalendars +="|";
					}
			
					var iCalID = arrCheckedCB[x].getAttribute("calid");
					
					strCals += iCalID;
					_strSelectedCalendars += iCalID +"^" + app.getElementText(arrSpans[x]);
					arrCalTitles[iCalID] = app.getElementText(arrSpans[x]);
					if(arrCalTzOffsets[iCalID]==undefined)
					{
						var strCalTimeZone = arrCheckedCB[x].getAttribute("timezone");
						arrCalTzOffsets[iCalID] = app.global._getTimeZoneOffset(strCalTimeZone);
					}

					//-- get appointments xml
					if(!bSkipDataLoad)
					{
						arrCalAppointmentXml[iCalID] = _get_xmlmc_appointments(iCalID,strStartDate,strEndDate,_strSelectedDates, arrCalTzOffsets[iCalID]);
						__CURRENT_DATA_XML[iCalID] = arrCalAppointmentXml[iCalID]; 
					}
					else
					{
						arrCalAppointmentXml[iCalID] = __CURRENT_DATA_XML[iCalID]
					}
				}
			}

			var targetDocument = app.getFrame("iform_calendar_" +app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);		
			targetDocument.process_appointment_data(arrCalTitles, arrSelectedDates,arrCalAppointmentXml,arrCalTzOffsets);
		}

		function set_calendar(strCalID)
		{
			var arrCheckedCB = app.get_children_by_tag(document.getElementById("div_calendars"), "INPUT", false);
			for(var x=0; x < arrCheckedCB.length;x++)
			{
				if(arrCheckedCB[x]!=undefined)
				{
					if(arrCheckedCB[x].id=="cal_" + strCalID)
					{
						arrCheckedCB[x].checked=true;
					}
					else
					{
						arrCheckedCB[x].checked=false;
					}
				}
			}

		}
	
		//-- initalise outlook - and load default data for today
		function init()
		{
			_setup_calendar_list(); //-- get list of cals

			create_calendar();

			var tmpdate = new Date();
			var strDate = app.fd_to_yyyy_mm_dd(tmpdate,"-");
			_strSelectedDates=strDate;
			arrSelectedDates[arrSelectedDates.length++] = app.fd_to_yyyymmdd(tmpdate);

			app.disableSelection(document.body,false);

		}

		//-- check if claendar preview document is ready - if so draw default data for today
		var __LAST_BODY_WIDTH = -1;
		function check_document_ready(bSkipDataLoad)
		{
			var targetDocument = app.getFrame("iform_calendar_" + app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
			if((targetDocument!=undefined)&&(targetDocument.iamready))
			{
				if(document.body.offsetWidth==__LAST_BODY_WIDTH)
				{
					return;
				}
				load_calendars(bSkipDataLoad);
				__LAST_BODY_WIDTH = document.body.offsetWidth;
			}
			else
			{
				if(bSkipDataLoad)setTimeout("check_document_ready(true)",100);
				else setTimeout("check_document_ready(false)",100);
			}
		}

		//-- methos called when user expands or collapse the left pane
		function oncollapse()
		{
			__LAST_BODY_WIDTH = -1;
			check_document_ready(true);
		}

		function onexpand()
		{
			__LAST_BODY_WIDTH = -1;
			check_document_ready(true);
		
		}

		function resize()
		{
			var bodyHeight =(window.innerHeight)?window.innerHeight: document.body.offsetHeight;
			if(!app.isIE)bodyHeight=bodyHeight-5;

			document.getElementById("div_dateselectors").style.height= bodyHeight - document.getElementById("div_calendars").offsetHeight -  document.getElementById("div_top_title").offsetHeight - document.getElementById("div_middle").offsetHeight;
			
			//-- width for ff
			var bodyWidth =(window.innerHeight)?window.innerWidth: document.body.offsetWidth;
			if(!app.isIE)document.getElementById("div_dateselectors").style.width = bodyWidth-10;
		}

		function create_calendar()
		{
			//-- setup and display the actuall calendar
			oDateSelector = new objCalendar("oDateSelector",document.getElementById("div_dateselectors"),12,"mm/dd/yyyy");
			oDateSelector.multiselecting = true;
			oDateSelector.prevnext_jumpcount = 1; //-- when user click prev or next will only move form or back 1 month

			//-- assign funcs to call when user slects a date or a multi date
			oDateSelector.onDateSelected = selectdates;
			oDateSelector.onMultiDateSelected = selectdates;

			//-- show at 0,0
			oDateSelector.oHolder.style.pixelTop = 0;
			oDateSelector.oHolder.style.pixelLeft = 0;
			oDateSelector.create_calendar();
			oDateSelector.oHolder.style.display = "inline";
		}

		

		function selectdates(oCell,strForceDate,strForceCalendar)
		{
			//-- check specific calendar
			if(strForceCalendar!=undefined)set_calendar(strForceCalendar);

			//-- display the date and time
			arrSelectedDates = new Array();
			_strSelectedDates = "";

			var arrTemp = new Array();
			var strFirstDate = "";
			var strLastDate = "";

			if(strForceDate==undefined)
			{
				//-- get dates we are interested in
				for(aCell in oDateSelector.array_selecteddates)
				{
					if(oDateSelector.array_selecteddates[aCell]==null)continue;
					var strYYYYMMDD = oDateSelector.array_selecteddates[aCell];
					arrTemp[arrTemp.length++] = strYYYYMMDD;
				}
			}
			else
			{
				arrTemp[arrTemp.length++] = strForceDate;
			}

			//-- sort
			arrTemp.sort();
			for(strPos in arrTemp)
			{
				var strDate = arrTemp[strPos];
				if(_strSelectedDates!="")_strSelectedDates+=",";
				_strSelectedDates += app.df_yyyymmdd_to_yyyy_mm_dd(strDate,"-");
				arrSelectedDates[arrSelectedDates.length++] = strDate;
				
				if(strFirstDate=="")
				{
					var targetDocument = app.getFrame("iform_calendar_" + app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
					if(targetDocument==undefined)return false;
					targetDocument.vSelectedYYYYMMDD = strDate;
					strFirstDate = app.fd_yyyymmdd_to_dd_month_year(strDate);
				}
				strLastDate = app.fd_yyyymmdd_to_dd_month_year(strDate);
			}

			//--
			//-- if calendar view is week or month we need to get dates and we have only selected 1 date
			if((strFirstDate==strLastDate)&&(targetDocument.viewtype!=1))
			{
				//- -get start date depending if viewing month or week
				var aStartDate = (targetDocument.viewtype==7)?app.fd_get_sow_from_yyyymmdd(strDate):app.fd_get_som_from_yyyymmdd(strDate);

				var i=0;
				var iMonth = aStartDate.getMonth();

				var sWDyyyymmdd = app.fd_to_yyyymmdd(aStartDate);
				var strTemp = app.df_yyyymmdd_to_yyyy_mm_dd(sWDyyyymmdd,"-");
				strFirstDate = app.fd_yyyymmdd_to_dd_month_year(sWDyyyymmdd); //-- reset first date
				_strSelectedDates = strTemp;
				while(1==1)
				{
					aStartDate.setDate(aStartDate.getDate() + 1);
					sWDyyyymmdd = app.fd_to_yyyymmdd(aStartDate);
					strTemp = app.df_yyyymmdd_to_yyyy_mm_dd(sWDyyyymmdd,"-");

					if(targetDocument.viewtype==7)
					{
						//-- break on i=6 - week
						i++;
						if(i==7)break;
					}
					else if(aStartDate.getDate()==1) 
					{
						//-- break on next month
						break;
					}

					//-- append to dates
					_strSelectedDates += ",";
					_strSelectedDates += strTemp;

				}
				strLastDate = app.fd_yyyymmdd_to_dd_month_year(sWDyyyymmdd); //-- reset last date
			}
			//alert(_strSelectedDates)
			//-- set right title so show 1st date - last date
			var strRightTitle = (strFirstDate==strLastDate)?strFirstDate:strFirstDate + " - " + strLastDate;
			app.set_right_right_title(strRightTitle);

			//-- go get calendar data
			load_calendars();
		}

	</script>
</head>
<body onload="init();" onresize="resize();" onmousedown="app.hide_application_menu_divs();" oncontextmenu="return app.stopEvent();" onselectstart="return false;" onkeydown="return app._handle_portal_keystrokes(event);">
<div id='div_top_title' class='div-title-top'>Calendars</div>
<div id='div_calendars'></div>
<div id='div_middle' class='div-space-middle'></div>
<div id='div_dateselectors'></div>
</body>
</html>