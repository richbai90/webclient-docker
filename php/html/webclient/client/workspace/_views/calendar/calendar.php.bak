<!--

20.10.2009 - initial workspace view for the calendar. Note does not support appointments going across days as per SW calendar.

-->
<html>
<style>

	.green
	{
		background-color:#D5ECBC;
	}

	*
	{
		font-size:100%;font-family:Verdana,sans-serif;
	}

	body
	{
		overflow:hidden;
		padding:0px;
		margin:0px;
	}

	/* containers for html */
	#div_calendar_holder
	{
		overflow:auto;
		left:35px;
		position:absolute;
		z-index:99999;
	}

	#div_calendar_header
	{
		z-index:99999;
		overflow:hidden;
		position:absolute;
		left:35px;
	}

	.day-cal-header
	{
		position:relative;
		display:block;
		float:left;
		padding-right:4px;
	}

	.day-cal
	{
		display:block;
		float:left;
		padding-right:4px;
	}

	.week-cal
	{
		border-width:0px 0px 0px 1px;
		border-style:solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;
	}

	/* day view hour colours */
	/*--pastel purple 2--*/
	.hour-A894CF
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#76639B;
		background-color:#A894CF;
	}
	.t30-A894CF
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#9B88C2;
		width:100%;
		height:30px;
	}

	/*--pastel mauve--*/
	.hour-00C7C8
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#009799;
		background-color:#00C7C8;
	}
	.t30-00C7C8
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#00BABB;
		width:100%;
		height:30px;
	}


	/*--pastel pink--*/
	.hour-DD8C8E
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#B36465;
		background-color:#DD8C8E;
	}
	.t30-DD8C8E
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#D28183;
		width:100%;
		height:30px;
	}


	/*--pastel orange--*/
	.hour-F7B47F
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#CA8347;
		background-color:#F7B47F;
	}
	.t30-F7B47F
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#EBA771;
		width:100%;
		height:30px;
	}

	/*--pastel green gray--*/
	.hour-899684
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#666459;
		background-color:#899684;
	}
	.t30-899684
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#818A7A;
		width:100%;
		height:30px;
	}

	/*--light yellow--*/
	.hour-FFFFD5
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#F6DBA2;
		background-color:#FFFFD5;
	}
	.t30-FFFFD5
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#F3E4B1;
		width:100%;
		height:30px;
	}

	/*--light green--*/
	.hour-D5ECBC
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#8CB468;
		background-color:#D5ECBC;
	}
	.t30-D5ECBC
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#A8CB8A;
		width:100%;
		height:30px;
	}

	/*--light blue--*/
	.hour-8B9EBF
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#617498;
		background-color:#8B9EBF;
	}
	.t30-8B9EBF
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#8093B5;
		width:100%;
		height:30px;
	}
	/*--light purple--*/
	.hour-BE86A1
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#9C657A;
		background-color:#BE86A1;
	}
	.t30-BE86A1
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#B47C95;
		width:100%;
		height:30px;
	}
	/*--light greeny --*/
	.hour-89B1A7
	{
		border-width:1px 1px 0px 1px;
		border-style:solid;
		border-color:#548E80;
		background-color:#89B1A7;
	}
	.t30-89B1A7
	{
		border-width:0px 0px 1px 0px;
		border-style:solid;
		border-color:#7BA89C;
		width:100%;
		height:30px;
	}


	/* time scale */
	#div_ts-top
	{
		position:absolute;
		z-index:99999;
		overflow:none;
		top:0px;
		left:0px;
		width:35px;
		height:71px;
		background-color:#D4D0C8;
		background-color:#D2D2D2;
	}
	#div_calendar_timescale
	{
		position:absolute;
		z-index:99999;
		overflow:hidden;
		top:71px;
		left:0px;
		width:35px;
		height:100%;
		background-color:#D2D2D2;
		color:#696969;
	}

	.tshour
	{
		border-width:0px 1px 1px 0px;
		border-style:solid;
		border-color:#808080;
		height:45px;
		*height:61px;
		font-size:90%;
		font-weight:bold;
		
		padding:15px 02px 2px 2px;
	}

	.tshour-00
	{
		font-size:50%;
		font-weight:bold;
		position:relative;
		top:-10px;
	}


	/* day view styles */		
	.day-title
	{
		display:block;

		border-width:1px 1px 1px 1px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;

		padding:3px;
		font-size:70%;
		background-color:#D4D0C8;
		background-color:#efefef;
		font-weight:bold;

		text-align:center;
		/*height:10px;*/
		*height:20px;
	}

	.day-title-date
	{
		display:block;

		border-width:0px 1px 1px 1px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;

		padding:3px;
		font-size:70%;
		background-color:#D4D0C8;
		background-color:#efefef;
		font-weight:normal;

		text-align:center;
		height:13px;
		*height:20px;
		overflow:hidden;
	}

	/* day appointments */
	.app
	{
		position:absolute;
		font-size:70%;
		border-width:1px 1px 1px 1px;
		border-style:solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;
		background-color:#FFFFFF;
		overflow:hidden;
		height:29px;
		white-space:noWrap;
		cursor:pointer;
	}

	.app-split
	{
		position:absolute;
		font-size:70%;
		border-width:0px 1px 0px 0px;
		border-style:solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;
		background-color:#FFFFFF;
		overflow:hidden;
		height:100%;
		left:5px;
	}

	/* appointment types */
	.app .busy
	{
		position:absolute;
		font-size:1%;
		background-color:blue;
		overflow:hidden;
		height:29px;
		width:2px;
		*width:5px;

	}

	.app .tentative
	{
		position:absolute;
		font-size:1%;
		background-color:gray;
		overflow:hidden;
		height:5px;
		width:2px;
		*width:5px;

	}

	.app .out_of_office
	{
		position:absolute;
		font-size:1%;
		background-color:purple;
		overflow:hidden;
		height:5px;
		width:2px;
		*width:5px;
	}

	.app .free
	{
		position:absolute;
		font-size:1%;
		background-color:#ffffff;
		overflow:hidden;
		height:5px;
		width:5px;
		border-width:1px 0px 1px 0px;
		border-style:solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;

	}

	/* appontment type colors for weeky data */
	.free
	{
		padding:2px;
		background-color:#ffffff;
		height:20px;
	}
	.busy
	{
		padding:2px;
		background-color:#7C98DF;
		height:20px;

	}
	.out_of_office
	{
		padding:2px;
		background-color:purple;
		color:#ffffff;
		height:20px;

	}
	.tentative
	{
		padding:2px;
		background-color:gray;
		height:20px;
	}

	
	/* weekly view styles */
	.td-day
	{
		border-width:0px 1px 1px 0px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;
		ackground-color:#FFFFD5;
	}

	.td-sat
	{
		border-width:0px 0px 0px 0px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;
		ackground-color:#FFFFD5;
	}

	.td-sun
	{
		border-width:1px 0px 0px 0px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;
		ackground-color:#FFFFD5;
	}

	.week-day-title
	{
		display:block;

		border-width:0px 0px 1px 0px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;

		margin:2px;
		padding:3px;
		font-size:70%;
		background-color:#D4D0C8;
		background-color:#efefef;
	
		text-align:right;
		height:13px;
		*height:20px;

	}

	.week-day-data
	{
		display:block;
		overflow:auto;
	}

	.week-day-title-selected
	{
		display:block;

		border-width:0px 0px 1px 0px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;

		margin:2px;
		padding:3px;
		font-size:70%;
		background-color:#0A246A;
		color:#ffffff;
		text-align:right;
		height:18px;
		*height:20px;
	}

	.weekday-app
	{
		border-width:1px 1px 1px 1px;
		border-style:solid solid solid solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;
		font-size:70%;
		overflow:hidden;
		cursor:pointer;

		width:99%;
		*width:100%;
		height:18px;
		*height:20px;
		margin-bottom:2px;
	}

	.weekday-app-start
	{
		border-width:1px 0px 1px 1px;
		border-style:solid solid solid solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;
		margin:1px;
		font-size:70%;
		cursor:pointer;

		width:99%;
		*width:100%;
		height:18px;
		*height:20px;

	}

	.weekday-app-middle
	{
		border-width:1px 1px 1px 0px;
		border-style:solid solid solid solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;
		margin:1px;
		font-size:70%;
		cursor:pointer;

		width:99%;
		*width:100%;
		height:18px;
		*height:20px;

	}

	.weekday-app-finish
	{
		border-width:1px 0px 1px 0px;
		border-style:solid solid solid solid;
		border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;
		margin:1px;
		font-size:70%;
		cursor:pointer;

		width:99%;
		*width:100%;
		height:18px;
		*height:20px;
	}


	/* monthly styles */

	.month-cal
	{
		border-width:0px 0px 0px 1px;
		border-style:solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;
	}


	.month-day-title
	{
		display:block;

		border-width:1px 1px 1px 0px;
		border-style:solid solid solid solid;
		border-color:#D4D0C8 #D4D0C8 #D4D0C8 #D4D0C8;

		padding:3px;
		font-size:70%;
		background-color:#D4D0C8;
		background-color:#efefef;
	
		text-align:center;
		height:13px;
		*height:20px;
		overflow:hidden;
		white-space:noWrap;
	}

	.month-day
	{
		height:99%;
		padding:2px;
	}

	.month-data-title
	{
		font-size:70%;
		overflow:hidden;
		white-space:noWrap;
		text-align:right;
	}

	.month-data-title-expand
	{
		font-size:70%;
		overflow:hidden;
		white-space:noWrap;
		background-image:url(expand.gif);
		background-repeat: no-repeat;
		background-position:0 -2;
		text-align:right;
	}


	.month-day-data
	{
		display:block;
		overflow:hidden;
		padding:2px;
	}


	/* table styles */
	table
	{
		table-layout:fixed;
	}
	td
	{
		overflow:hidden;
	}
	.td-overflow
	{
		overflow:hidden;
	}

	.day-allday
	{
		display:block;

		border-width:1px 1px 1px 1px;
		border-style:solid solid solid solid;
		border-color:#808080 #808080 #808080 #808080;

		background-color:#808080;
		height:30px;
		*height:30px;
	}


</style>

<script>
	var undefined;
	var app = (opener)?opener:top;
	var jqDoc = app.jqueryify(document); //-- so can use jquery
	
	var _DAY = 1;
	var _SEVENDAY = 7;
	var _MONTH = 31;

	var viewtype = _DAY; //-- default start up view

	var vSelectedStartCurrentDate = new Date();
	var vSelectedYYYYMMDD = app.fd_to_yyyymmdd(new Date());

	var array_cals = new Array();	
		
	//-- create new app
	function new_appointment(intID, strStartYYYYMMDD, strEndYYYYMMDD, startTime, endTime, strText, strShowAs, strCalID)
	{
		var oApp = new appointment(intID, strStartYYYYMMDD, strEndYYYYMMDD,startTime, endTime, strText, strShowAs, strCalID)
		return oApp;
	}

	//-- a calendar appointment
	function appointment(intID, strStartYYYYMMDD, strEndYYYYMMDD, startTime, endTime, strText, strShowAs, strCalID)
	{
		//-- create info object
		this.id = intID;
		this.calid = strCalID;

		this.previd = 0;
		this.rootid = 0;
		this.parentid = 0;
		this.parentoneup = 0;

		this.index = 0;
		this.leftcount = 0;
		this.rightcount = 0;
		this.leftpos = 0;
		this.imovedleftfirst = false;

		this.startdate = strStartYYYYMMDD;
		this.enddate = strEndYYYYMMDD;

		this.start = startTime;
		this.end = endTime;
		this.text = strText;	
		this.showas = strShowAs;

		this.pxwidth = 0;
		this.pxleft = 0;
		this.pxheight = 0;
		this.pxtop= 0;

		this.childlist=new Array();
	}

	function draw_appointments()
	{
		switch(viewtype)
		{
			case _DAY:

				draw_day_appointments();
				break;
			case _SEVENDAY:
				draw_week_appointments();
				break;
			case _MONTH:
				draw_month_appointments();
				break;
		}
	}

	//-- draw day data for month view
	function draw_month_appointments()
	{
		for(strCalID in array_cals)
		{
			var strTargetID = "cal_monthday_" + strCalID;
			var eTarget = document.getElementById(strTargetID);
			
			//-- set height based on parent TD that is holding the div
			eTarget.style.height=app.get_parent_owner_by_tag(eTarget,"TD").offsetHeight-24;

			var strHTML = "";
			for(strID in array_cals[strCalID])
			{
				strHTML += get_app_day_html(array_cals[strCalID][strID], eTarget);
			}
			if(strHTML!="")
			{
				app.insertBeforeEnd(eTarget,strHTML);

				//-- check if overflow exists
				if(app.has_scrollbar(eTarget))
				{
					//-- show icon to view day - change class
					if(!app.isIE)
					{
						eTarget.previousSibling.setAttribute("class","month-data-title-expand");
					}
					else
					{
						eTarget.previousSibling.setAttribute("className","month-data-title-expand");
					}
				}
			}
		}
	}

	//-- draw week day appointments
	function draw_week_appointments()
	{
		for(strCalID in array_cals)
		{
			var strTargetID = "cal_weekday_" + strCalID;
			var eTarget = document.getElementById(strTargetID);
			
			//-- set height based on parent TD that is holding the div
			eTarget.style.height=app.get_parent_owner_by_tag(eTarget,"TD").offsetHeight-28;

			var strHTML = "";
			for(strID in array_cals[strCalID])
			{
				strHTML += get_app_day_html(array_cals[strCalID][strID], eTarget);
			}

			if(strHTML!="")
			{
				app.insertBeforeEnd(eTarget,strHTML);
			}
		}
	}


	function hhmm_to_hh_mm(strHHMM)
	{
		var strHH = strHHMM.substring(0,2);
		var strMM = strHHMM.substring(2,4);
		return strHH + ":"+ strMM;
	}

	function get_app_day_html(oApp,eTarget)
	{
		var dayYYYYMMDD = eTarget.getAttribute("yyyymmdd");
		if((oApp.startdate==dayYYYYMMDD)&&(oApp.enddate==dayYYYYMMDD))
		{
			//-- start and finish on same day
			var strClass = "weekday-app";
		}
		else if (oApp.startdate==dayYYYYMMDD)
		{
			//-- starts 
			var strClass = "weekday-app-start";
		}
		else if (oApp.enddate==dayYYYYMMDD)
		{
			//-- starts 
			var strClass = "weekday-app-finish";
		}
		else
		{
			//-- middle
			var strClass = "weekday-app-middle";
		}



		var strTime = hhmm_to_hh_mm(oApp.start) + " " + hhmm_to_hh_mm(oApp.end);	
		var strHTML = '<div onclick="app.manage_calendar_toolbar(this);" ondblclick="app.open_appointment(this)" appid="'+ oApp.id +'" calid="'+oApp.calid+'" class="'+strClass+'" ><div class="'+oApp.showas+'">&nbsp;&nbsp;' + strTime + '&nbsp;&nbsp;'+oApp.text + '</div></div>';
		return strHTML;

	}
	

	//-- draw out day view apponitments
	function draw_day_appointments()
	{
	
		for(strCalID in array_cals)
		{
			store_day_positioning_info(strCalID);
	
			var strHTML = "";
			for(strID in array_cals[strCalID])
			{
				strHTML += get_app_html(array_cals[strCalID][strID]);
			}

			//document.getElementById("div_appointments").innerHTML = "";
			if(strHTML!="")
			{
				app.insertBeforeEnd(document.getElementById("div_calday_"+strCalID),strHTML);
			}
		}
	}

	function store_direct_children(strParentID)
	{
		//-- get all apps that start between this parents start and end time
		var oParent = array_cals[strCalID][strParentID]
		var bInclude = false;
		for(strChildID in array_cals[strCalID])
		{
			if(strChildID==strParentID) 
			{	
				bInclude = true;
				continue;
			}
			if(!bInclude) continue;

			var oChild = array_cals[strCalID][strChildID];

			//-- if the child start time is >= to parent start and child start time < parent end time then it is a direct child
			if((oChild.start >= oParent.start) && (oChild.start < oParent.end))
			{	
				oParent.childlist[oParent.childlist.length++] = strChildID;

				//-- store top level parent of parents
				if(array_cals[strCalID][strChildID].rootid==0) 
				{
					array_cals[strCalID][strChildID].rootid = (oParent.rootid>0)?oParent.rootid:strParentID; 
				}

				//-- store first parentid where this child intersects
				if(array_cals[strCalID][strChildID].parentid==0) 
				{
					array_cals[strCalID][strChildID].parentid = strParentID;
					array_cals[strCalID][strChildID].index = oParent.childlist.length;
				}

				//-- store direct parent up
				array_cals[strCalID][strChildID].parentoneup = strParentID;
			}
		}
		array_cals[strCalID][strParentID] = oParent;
	}

	function store_day_positioning_info(strCalID)
	{
		var eDayStart = document.getElementById("c"+strCalID+"_t0000");
		var intFarLeft = app.eleLeft(eDayStart) - 35;
		var intPageWidth = eDayStart.offsetWidth;

		//-- do some additional processing to see which appoinments co-incide with others
		for(strID in array_cals[strCalID])
		{
			store_direct_children(strID);
		}

		
		//-- work out if appoinments can be displayed to right and left of parents etc
		var array_root_ids = new Array();
		var array_skip = new Array();
		for(strID in array_cals[strCalID])
		{
			//-- work out if root parent children have children that can be moved to the far left (i.e. the childrens children do not start between root parent)
			//-- need to work out how many can move to the left...the remainder will go to the right 
			var oAppointment = array_cals[strCalID][strID];

			//-- does it have a rootparent
			if(oAppointment.rootid>0)
			{
				var strParentID = oAppointment.parentid;
				var strRootID = oAppointment.rootid;
				if(oAppointment.rootid!=oAppointment.parentid)
				{
					//-- this is a child of a child and this child can move to the far left if there is still space
					//-- check leftcount < parent index
					if(array_cals[strCalID][strParentID].leftcount < array_cals[strCalID][strParentID].index)
					{
						//alert("can move left " + strID)
						array_cals[strCalID][strID].leftpos = array_cals[strCalID][strParentID].leftcount;						
						array_cals[strCalID][strParentID].leftcount++; //-- inc parent left counter
						if(array_cals[strCalID][strParentID].leftcount==1)array_cals[strCalID][strID].imovedleftfirst = true;

					}
					else
					{
						//alert("can move left but there is no space so put right of parent [" + strParentID + "] " + strID)
						array_cals[strCalID][strRootID].rightcount++; //-- will use this to determine how to size divs
						array_cals[strCalID][strID].leftpos = array_cals[strCalID][strRootID].rightcount;
					}
				}
				else
				{
					//-- this is a child that starts between a root parent - it cannot move left
					//alert(strID + " must stay right of parent " + oAppointment.rootid + " and is child index " + oAppointment.index);
					array_cals[strCalID][strRootID].rightcount++;
					array_cals[strCalID][strID].leftpos = array_cals[strCalID][strRootID].rightcount;

				}
			}
			else
			{
				//-- this is a root parent
				//alert("root parent " + strID)
				array_root_ids[strID] = strID;
			}
		}

		//-- loop through root ids and determine the width it and its children should be
		for(strRootID in array_root_ids)
		{
			var intChildrenToTheRight = array_cals[strCalID][strRootID].rightcount;
			if(intChildrenToTheRight==0)
			{
				var intWidth = intPageWidth;
			}
			else
			{
				intChildrenToTheRight++;
				var intWidth = (intPageWidth / intChildrenToTheRight);
			}
			array_cals[strCalID][strRootID].pxwidth = intWidth -5;
			array_cals[strCalID][strRootID].pxleft = intFarLeft;
			array_cals[strCalID][strRootID].pxtop = getAppointmentTop(strCalID,strRootID);
			array_cals[strCalID][strRootID].pxheight = getAppointmentHeight(strCalID,strRootID);

			array_cals[strCalID][strRootID].apppxtop = getAppointmentTop(strCalID,strRootID,true);
			array_cals[strCalID][strRootID].apppxheight = getAppointmentHeight(strCalID,strRootID,true);

		}

		//-- now loop through children and determine their left and right post
		for(strChildID in array_cals[strCalID])
		{
			if(array_root_ids[strChildID]) continue; //- -do not process root items

			//-- parent ids
			var strParentID = array_cals[strCalID][strChildID].parentid;
			var strRootID = array_cals[strCalID][strChildID].rootid;

			//- -widrth same as root parent
			var intWidth = array_cals[strCalID][strRootID].pxwidth;
			array_cals[strCalID][strChildID].pxwidth = intWidth;

			//-- position left calc
			if(array_cals[strCalID][strChildID].imovedleftfirst)
			{
				array_cals[strCalID][strChildID].pxleft = intFarLeft;
			}
			else
			{
				array_cals[strCalID][strChildID].pxleft = ((intFarLeft) + (intWidth * (array_cals[strCalID][strChildID].leftpos))) + (5 * array_cals[strCalID][strChildID].leftpos);
			}
			array_cals[strCalID][strChildID].pxtop = getAppointmentTop(strCalID,strChildID);
			array_cals[strCalID][strChildID].pxheight = getAppointmentHeight(strCalID,strChildID);

			array_cals[strCalID][strChildID].apppxtop = getAppointmentTop(strCalID,strChildID,true);
			array_cals[strCalID][strChildID].apppxheight = getAppointmentHeight(strCalID,strChildID,true);

		}
	}

	function fix_outofsync_time(strTime,boolStart)
	{
		//-- is start time something like 12:05
		var mm = strTime.substring(strTime.length-2,strTime.length);
		var hh = strTime.substring(0,strTime.length-2);
		if(mm!="00" && mm!="30")
		{
			//-- time is something like 1234 or 1223 so need to adjust
			mm++;mm--;
			if(boolStart)
			{
				var newMin = (mm>29)?"30":"00";
				strTime = strTime.substring(0,strTime.length-2) + newMin
			}
			else
			{
				var newMin = (mm>29)?"00":"30";
				if(mm>29)
				{
					//-- need to increment hh
					hh--;hh++;hh++;
					if(hh<10)hh = "0" + hh;
				}
				else
				{
					//-- need to shift minutes to 30
					newMin="30";
				}
				strTime = hh+""+newMin;
				//alert(strTime)
			}

		}
		return strTime;
	}

	function getAppointmentTop(strCalID,strID, boolReal)
	{
		if(boolReal==undefined)boolReal=false;
		var strOrigStart = array_cals[strCalID][strID].start;
		var strStart = fix_outofsync_time(strOrigStart,true);

		var strStartEle = "c"+strCalID+"_t" + strStart;
		var intTop = 0;
		var eleS = document.getElementById(strStartEle);
		if(eleS)
		{
			intTop = app.eleTop(eleS);
			if(boolReal)
			{
				//-- adjust top if something like 11:05
				if(strOrigStart!=strStart)
				{
					var diff = strOrigStart - strStart;
					intTop =  diff
				}
				else
				{
					//-- so border is hidden
					intTop=-1;
				}
			}
			else
			{
				intTop = intTop - intTopAdjust
			}
		}
		else
		{
			alert("Invalid start time defined for an appointment. Please contact your Supportworks Administrator");
		}
		return intTop;
	}

	function timePxDiff(strGreatestTime, strShortestTime)
	{
		//alert(strGreatestTime + ":"+ strShortestTime)
		var Hmm = strGreatestTime.substring(strGreatestTime.length-2,strGreatestTime.length);
		var Lmm = strShortestTime.substring(strShortestTime.length-2,strShortestTime.length);
		Hmm++;Hmm--;
		Lmm++;Lmm--;
	
		//-- work in block of 30 so no need for hours
		//var Hhh = strGreatestTime.substring(0,strGreatestTime.length-2);
		//var Lhh = strShortestTime.substring(0,strShortestTime.length-2);

		var counto = (Lmm<=30)?30:60;
		var lmin = 0;
		while(Lmm<counto)
		{
			lmin++;
			Lmm++;
		}

		var counto = (Hmm>=30)?30:0;
		var hmin = 0;
		while(Hmm>counto)
		{
			hmin++;
			Hmm--;
		}	
		
		//-- minutes dif to hours
		var minutes = lmin + hmin;
		//var hourminutes = (Hhh-Lhh-1) * 60;
		//if(hourminutes<0)hourminutes=0;
		return minutes;// + hourminutes;
	}

	function getAppointmentHeight(strCalID,strID,boolReal)
	{
		if(boolReal==undefined)boolReal=false;

		var strOrigStart = array_cals[strCalID][strID].start;
		var strOrigEnd = array_cals[strCalID][strID].end;

		var strStart = fix_outofsync_time(strOrigStart,true);
		var strEnd = fix_outofsync_time(strOrigEnd,false);
		var strStartEle = "c"+strCalID+"_t" + strStart;
		var strEndEle = "c"+strCalID+"_t" + strEnd;
		var intHeight = 0;

		var eleS = document.getElementById(strStartEle);
		var eleE = document.getElementById(strEndEle);
		if(eleS && eleE)
		{
			var iStartTop = app.eleTop(eleS);
			var iEndBottom = app.eleTop(eleE);
			intHeight = iEndBottom - iStartTop - 1;
			if(boolReal)
			{
				//-- appointment time is between start and end not all of alloted time ie. 11:00 to 12:00 but only using 11:20 to 11:40
				//var iActualStartTop = iStartTop;
				var sdiff=0;
				if(strOrigStart!=strStart)
				{
					sdiff = strOrigStart - strStart;
					intHeight = intHeight - sdiff;
				}	

				//-- appointment time is between start and end not all of alloted time ie. 11:00 to 12:00 but only using 11:20 to 11:40
				if(strOrigEnd!=strEnd)
				{		
					var diff = timePxDiff(strEnd, strOrigEnd);
					intHeight = intHeight - diff;
				}
			}
 		}
		else
		{
			alert("Invalid start and end time defined for an appointment. Please contact your Supportworks Administrator");
		}

		return intHeight;
	}

	function thirtyminmark(strTime)
	{
		strTime+="";
		var strMin = strTime.substring(2,4);
		return(strMin=="00" || strTime=="30");
	}

	//--
	function get_app_html(oApp)
	{
		//-- append div to holder
		var intHeight = (!app.isIE)?oApp.apppxheight-3:oApp.apppxheight;
		var intDivH = (!app.isIE)?oApp.pxheight-3:oApp.pxheight;



		var strText =oApp.text;
		if(!thirtyminmark(oApp.start) || !thirtyminmark(oApp.end))
		{
			//-- we have odd app time
			strText = hhmm_to_hh_mm(oApp.start) + " " + hhmm_to_hh_mm(oApp.end) + "   " + strText;
				
		}


		var strHTML = '<div onclick="app.manage_calendar_toolbar(this);" ondblclick="app.open_appointment(this)" appid="'+oApp.id+'" calid="'+oApp.calid+'" class="app" style="left:'+oApp.pxleft+';width:'+oApp.pxwidth+';top:'+oApp.pxtop+';height:'+intDivH+';"><div class="'+oApp.showas+'" style="top:'+oApp.apppxtop+';height:'+intHeight+';"></div><div class="app-split"></div>&nbsp;&nbsp;' + strText + '</div>';
		return strHTML;
	}

	//-- draw out html based on current view type
	function draw_view_type(strID)
	{
		var intAdjustH = (intCalLength>1)?20:0;
		var strHTML = "";
		switch(viewtype)
		{
			case _DAY:
				change_view("cal1",false);
				strHTML =draw_day_calendar(strID);
				break;
			case _SEVENDAY:
				change_view("cal7",false);
				strHTML =draw_sevenday_calendar(strID)
				break;
			case _MONTH:
				change_view("cal31",false);
				strHTML = draw_month_calendar(strID)
				break;
		}
		return strHTML;
	}


	//--
	//-- draw out day calender view headers
	function draw_calendar_header(strID, strDisplayName, intWidthPerc)
	{
		var strHTML = "";
		var iWidth = (divHeaderHolder.offsetWidth / intWidthPerc)
		if(!app.isIE)iWidth = iWidth - 5; //-- firefox
		if(intWidthPerc==1)iWidth=iWidth+4;

		strHTML += "<div id='cal_header_" + strID + "' style='top:0;width:"+iWidth+"px;' class='day-cal-header' >";

		//-- onyl show title if more than one calendar
		if(intWidthPerc>1)strHTML += "<div class='day-title'>" + strDisplayName + "</div>";

		if(viewtype==_DAY)
		{
			//-- draw header day for each day selected
			
			strHTML += "<table border='0' width='100%' cellspacing='0' cellpadding='0'><tr>";
			for(var y=0;y <arraydates.length;y++)
			{
				strHTML += "<td class='td-overflow'>";
				strHTML += "<div class='day-title-date' id='day_header_" + strID + "_" + arraydates[y] + "'>" + app.fd_yyyymmdd_to_dd_month_year(arraydates[y]) + "</div>";
				strHTML += "<div class='day-allday'></div>";
				strHTML += "</td>";
			}
			strHTML += "</tr></table>";
		}

		strHTML +="</div>";
		return strHTML;
	}

	//-- draw out 7 day calendar
	function draw_sevenday_calendar(strID)
	{
		//-- get start of week (monday - given yyyymmdd)
		var startOfWeekDate = app.fd_get_sow_from_yyyymmdd(arraydates[0]);

		var strRelHeaderID = "cal_header_" + strID;
		var eCal = document.getElementById(strRelHeaderID);

		//-- start cal days holder
		var iWidth = eCal.offsetWidth-4;
		if(!app.isIE)iWidth = iWidth - 1; //-- firefox
		var intTop = 1;
		var intLeft = app.eleLeft(eCal);
		if(intCalLength==1)
		{
			intTop = 0;
			eCal.style.display="none";
		}

		var intHeight = divDayHolder.offsetHeight - intTop;// - eCal.offsetHeight;
		var strColor = arrcalendarcolours[strID];
		var strHTML = "<div id='div_calweek_"+strID+"' calid='"+strID+"' style='position:absolute;height:"+intHeight+"px;top:"+intTop+"px;left:"+intLeft+"px;width:"+iWidth+"px;' class='week-cal' >";

		//-- table 2 cells 3 rows -last cell sat/sun
		strHTML += "<table border='0' width='100%' height='100%' cellspacing='0' style='table-layout:fixed;background-color:"+strColor+"' cellpadding='0'>";
		//-- mon / tue
		strHTML += "<tr height='33%'>";
		strHTML += "<td valign='top' class='td-day'>";
		strHTML += get_sevenday_day(startOfWeekDate,strID,0);
		strHTML += "</td>";
		strHTML += "<td valign='top' class='td-day'>";
		strHTML += get_sevenday_day(startOfWeekDate,strID,3);
		strHTML += "</td>";
		strHTML += "</tr>";
		//-- wed / thu
		strHTML += "<tr height='33%'>";
		strHTML += "<td valign='top' class='td-day'>";
		strHTML += get_sevenday_day(startOfWeekDate,strID,1);
		strHTML += "</td>";
		strHTML += "<td valign='top' class='td-day'>";
		strHTML += get_sevenday_day(startOfWeekDate,strID,4);
		strHTML += "</td>";
		strHTML += "</tr>";
		//-- fri / sat & sun
		strHTML += "<tr height='33%'>";
		strHTML += "<td valign='top' class='td-day'>";
		strHTML += get_sevenday_day(startOfWeekDate,strID,2);
		strHTML += "</td>";
		strHTML += "<td valign='top' class='td-day'>";
			strHTML += "<table border='0' width='100%' height='100%' cellspacing='0' cellpadding='0'>";
			strHTML += "<tr height='50%'>";
			strHTML += "<td valign='top' class='td-sat'>";
			strHTML += get_sevenday_day(startOfWeekDate,strID,5);
			strHTML += "</td>";
			strHTML += "</tr>";
			strHTML += "<tr height='50%'>";
			strHTML += "<td valign='top' class='td-sun'>";
			strHTML += get_sevenday_day(startOfWeekDate,strID,6);
			strHTML += "</td>";
			strHTML += "</tr>";
			strHTML += "</table>";
		strHTML += "</td>";
		strHTML += "</tr>";
		strHTML += "</table>";

		strHTML += "</div>";
		//alert("draw 7 days");
		return strHTML;
	}

	function get_sevenday_day(inDate, strCalID, intInc)
	{	
		if(intInc==undefined)intInc=1;
		var aDate = new Date(inDate);
		aDate.setDate(aDate.getDate() + intInc);
		
		var strYYYYMMDD = app.fd_to_yyyymmdd(aDate);
		var strTitleClass= (vSelectedYYYYMMDD==strYYYYMMDD)?"week-day-title-selected":"week-day-title";

		var strHTML = "<div><div class='"+strTitleClass+"'>"+app.fd_dd_month(aDate)+"</div>";


		var strID = strCalID + "_" + strYYYYMMDD;
		strHTML += "<div class='week-day-data' id='cal_weekday_" + strID + "' yyyymmdd='"+strYYYYMMDD+"'></div>";
		strHTML += "</div>";
		return strHTML;
	}

	//-- draw month calendar
	function draw_month_calendar(strID)
	{
		var iOrigMonth = app.fd_yyyymmdd_to_d(arraydates[0]).getMonth();

		//-- get start of month 
		var startOfMonthDate = app.fd_get_som_from_yyyymmdd(arraydates[0]);
		var tmpyyyymmdd = app.fd_to_yyyymmdd(startOfMonthDate);
		startOfMonthDate = app.fd_get_sow_from_yyyymmdd(tmpyyyymmdd);

		var strRelHeaderID = "cal_header_" + strID;
		var eCal = document.getElementById(strRelHeaderID);

		//-- start cal days holder
		var iWidth = eCal.offsetWidth-4;
		if(!app.isIE)iWidth = iWidth - 1; //-- firefox
		var intTop = 0;
		var intLeft = app.eleLeft(eCal);

		if(intCalLength==1)	eCal.style.display="none";

		var intHeight = divDayHolder.offsetHeight - intTop;// - eCal.offsetHeight;

		var strColor = arrcalendarcolours[strID];
		var strHTML = "<div id='div_calmonth_"+strID+"' calid='"+strID+"' style='position:absolute;height:"+intHeight+"px;top:"+intTop+"px;left:"+intLeft+"px;width:"+iWidth+"px;' class='month-cal' >";
		//var strHTML = "<div id='div_calmonth_"+strID+"' calid='"+strID+"' class='month-cal' style='top:0;width:"+iWidth+"px;'>";

		//-- table 2 cells 3 rows -last cell sat/sun
		strHTML += "<table border='0' width='100%' height='100%' cellspacing='0' style='background-color:"+strColor+"' cellpadding='0'>";

		//-- headers (mon - sun)
		strHTML += "<tr>";
			strHTML += "<td><div class='month-day-title'>Monday</div></td>";
			strHTML += "<td><div class='month-day-title'>Tuesday</div></td>";
			strHTML += "<td><div class='month-day-title'>Wednesday</div></td>";
			strHTML += "<td><div class='month-day-title'>Thursday</div></td>";
			strHTML += "<td><div class='month-day-title'>Friday</div></td>";
			strHTML += "<td><div class='month-day-title'>Sat / Sun</div></td>";
		strHTML += "</tr>";

		//-- day data 6 cells 5 rows
		var incDate=0;
		for(var x=0;x<5;x++)
		{
			strHTML += "<tr height='20%'>";
				strHTML += "<td class='td-day'>"+get_month_day(startOfMonthDate,strID,incDate+0,iOrigMonth)+"</td>";
				strHTML += "<td class='td-day'>"+get_month_day(startOfMonthDate,strID,incDate+1,iOrigMonth)+"</td>";
				strHTML += "<td class='td-day'>"+get_month_day(startOfMonthDate,strID,incDate+2,iOrigMonth)+"</td>";
				strHTML += "<td class='td-day'>"+get_month_day(startOfMonthDate,strID,incDate+3,iOrigMonth)+"</td>";
				strHTML += "<td class='td-day'>"+get_month_day(startOfMonthDate,strID,incDate+4,iOrigMonth)+"</td>";
				strHTML += "<td class='td-day'><table height='100%' width='100%'cellspacing='0' cellpadding='0'><tr height='50%'><td  class='td-sat'>"+get_month_day(startOfMonthDate,strID,incDate+5,iOrigMonth)+"</td></tr><tr><td  class='td-sun' height='50%'>"+get_month_day(startOfMonthDate,strID,incDate+6,iOrigMonth)+"</td></tr></table></td>";
			strHTML += "</tr>";

			incDate = incDate + 7; //-- 1 week
		}

		strHTML += "</table>";
		strHTML += "</div>";
		return strHTML;
	}

	function get_month_day(startOfMonthDate,strCalID,intInc,origMonth)
	{
		if(intInc==undefined)intInc=1;
		var aDate = new Date(startOfMonthDate);
		aDate.setDate(aDate.getDate() + intInc);
	
		//-- 1st day so add month to title
		var strAddTitle = "";
		if(intInc==0)
		{
			strAddTitle = " " + app.fd_to_month(aDate);
		}
		else if(aDate.getDate()==1)
		{
			//-- have moved up a month
			strAddTitle = " " + app.fd_to_month(aDate);
		}

		var strYYYYMMDD = app.fd_to_yyyymmdd(aDate);	
		var strHTML = "<div class='month-day'><div class='month-data-title' onclick='expand_day_overflow(" + strCalID + "," + strYYYYMMDD + ");'>"+aDate.getDate()+ strAddTitle+"</div>";
		var strID = strCalID + "_" + strYYYYMMDD;
		strHTML += "<div class='month-day-data' id='cal_monthday_" + strID + "' yyyymmdd='"+strYYYYMMDD+"'></div>";
		strHTML += "</div>";
		return strHTML;
	}

	//-- load day view for selected calendar and date
	function expand_day_overflow(strCalID,strYYYYMMDD)
	{
		viewtype=_DAY;
		change_view("cal1",false,true);
		app.oControlFrameHolder.selectdates(undefined,strYYYYMMDD+"",strCalID+"");
	}

	//-- draw out day calendar (0000-2400)
	function draw_day_calendar(strID)
	{
		//-- get related header div so we can work out width
		var strRelHeaderID = "cal_header_" + strID;
		var eCal = document.getElementById(strRelHeaderID);

		var strColor = arrcalendarcolours[strID];

		//-- start cal days holder
		var iWidth = eCal.offsetWidth;
		if(!app.isIE)iWidth = iWidth - 4;
		var strHTML = "<div id='div_caldays_"+strID+"' calid='"+strID+"' class='day-cal' style='top:0;width:"+iWidth+"px;'>";

		//-- draw outeach day area for cal
		strHTML += "<table border='0' width='100%' cellspacing='0' cellpadding='0'><tr>";
		for(var y=0;y <arraydates.length;y++)
		{
			strHTML += "<td class='td-overflow'>";
		
			//--a day
			var divID = strID + "_" + arraydates[y];
			strHTML += "<div id='div_calday_" + divID + "' calid='" + strID + "' dayid='"+arraydates[y]+"'>";

			for(var x=0;x<24;x++)
			{
				var strPart = (x<10)?"0" + x:x+"";
				var strStartID = "c" + divID + "_t" + strPart + "00";
				var strEndID = "c" + divID + "_t" + strPart + "30";

				strHTML += "<div class='hour-"+strColor+"'>"
				strHTML += "<div id='"+strStartID+"' class='t30-"+strColor+"'></div>";
				strHTML += "<div id='"+strEndID+"' class='t30-"+strColor+"'></div>";
				strHTML += "</div>";
			}
			strHTML += "</div>"; //-- eof a day
			strHTML += "</td>";
		}
		strHTML += "</tr></table>";
		strHTML += "</div>"; //-- eof cal days holder

		return strHTML;
	}


	//-- we have passed in data
	function copy_array(inArray,outArray)
	{
		for(strPos in inArray)
		{
			outArray[strPos]=inArray[strPos];
		}
	}

	var intCalLength=0;
	var arrcalendarcolours=new Array();
	var arrcolours=new Array();
	arrcolours[0] = "FFFFD5"; //-- pastel yellow
	arrcolours[1] = "D5ECBC"; //-- pastel green
	arrcolours[2] = "8B9EBF"; //-- pastel blue
	arrcolours[3] = "BE86A1"; //-- pastel purple
	arrcolours[4] = "89B1A7"; //-- pastel green #2
	arrcolours[5] = "F7B47F"; //-- pastel orange
	arrcolours[6] = "899684"; //-- pastel green grey
	arrcolours[7] = "DD8C8E"; //-- pastel pink
	arrcolours[8] = "00C7C8"; //-- pastel mauve
	arrcolours[9] = "A894CF"; //-- pastel purple #2


	//-- 18.08.2010 - reworked to us xmlmc api xml layout
	function process_appointment_data(arrCalTitles, arrDates,arrCalandarsAppointmentsXml,arrCalsTzOffsets)
	{
		//-- re init cals
		if(arrDates==undefined)	arrDates=arraydates;
		arraydates = new Array();
		copy_array(arrDates,arraydates);
		array_cals = new Array();

		//-- if arrdats > 1 then switch to day view
		if(arrDates.length>1)
		{
			if(viewtype!=_DAY)
			{
				//-- change toolbar 
				viewtype=_DAY;
			}
		}

		//--get number of calendars
		intCalLength = 0;
		for(strCalID in arrCalTitles)intCalLength++;

		if(intCalLength==0) return false;

		//-- draw out calendar headers - 1 per calendar
		var x = 0;
		var strViewHeaderHTML = "";
		var strViewHTML = "";
		app.removeChildNodes(divHeaderHolder);	
		for(intCalID in arrCalandarsAppointmentsXml)
		{
			var strDisplayName = arrCalTitles[intCalID];

			//-- no color for this index so random one
			if(arrcolours[x]==undefined)
			{
				arrcalendarcolours[intCalID] = "";
			}
			else
			{
				arrcalendarcolours[intCalID] = arrcolours[x];
			}

			strViewHeaderHTML += draw_calendar_header(intCalID,arrCalTitles[intCalID],intCalLength);
			x++;
		}

		//-- remove child nodes and add
		app.insertBeforeEnd(divHeaderHolder,strViewHeaderHTML)
	
		//-- If more than one calendar adjust top of days
		intTopAdjust = (intCalLength==1)?50:71;
			
		//-- adjust timescale
		document.getElementById("div_ts-top").style.height = intTopAdjust +"px";
		divTimeScale.style.top = intTopAdjust +"px";
			
		//-- draw out number of days per calendar
		app.removeChildNodes(divDayHolder);
		for(intCalID in arrCalandarsAppointmentsXml)
		{
			strViewHTML += draw_view_type(intCalID);
		}
		//-- remove child nodes and add
		app.insertBeforeEnd(divDayHolder,strViewHTML);


		//-- store calendar appointments
		for(intCalID in arrCalandarsAppointmentsXml)
		{
			for(intAppID in arrCalandarsAppointmentsXml[intCalID])
			{			
				var strSubject = app.xmlNodeTextByTag(arrCalandarsAppointmentsXml[intCalID][intAppID],"subject");
				var strShowAs = app.xmlNodeTextByTag(arrCalandarsAppointmentsXml[intCalID][intAppID],"showTimeAs");
				var startTime = app.xmlNodeTextByTag(arrCalandarsAppointmentsXml[intCalID][intAppID],"startTime");
				var endTime = app.xmlNodeTextByTag(arrCalandarsAppointmentsXml[intCalID][intAppID],"endTime");

				//-- start and end time will be yyyy-mm-dd hh:mm:ssZ (gmt)
				//-- so need to convert to calendars timezone? (or analysts??)
				//var intOffset = app._arr_calendar_tz_offsets[intCalID];
				//if(intOffset==undefined)intOffset=0;

				//-- for now use analyst tz offset			
				var oStartDate = app._parseDate(startTime.substring(0,startTime.length-1),"yyyy-MM-dd HH:mm:ss");
				oStartDate = app._date_apply_offset(oStartDate,arrCalsTzOffsets[intCalID]);
				var strStartYYYYMMDD = app._formatDate(oStartDate,"yyyyMMdd");
				var strStartHHMM = app._formatDate(oStartDate,"HHmm");

				var oEndDate = app._parseDate(endTime.substring(0,endTime.length-1),"yyyy-MM-dd HH:mm:ss");
				oEndDate = app._date_apply_offset(oEndDate,arrCalsTzOffsets[intCalID]);

				var strEndYYYYMMDD = app._formatDate(oEndDate,"yyyyMMdd");
				var strEndHHMM = app._formatDate(oEndDate,"HHmm");

				//-- create array to hold info if not already set
				var unID = intCalID + "_" + strStartYYYYMMDD;
				if(array_cals[unID]==undefined)array_cals[unID] = new Array();

				//-- store for drawing
				array_cals[unID][intAppID] = new_appointment(intAppID, strStartYYYYMMDD, strEndYYYYMMDD,strStartHHMM, strEndHHMM, strSubject,strShowAs,intCalID);
			}
		}
		
		//-- draw appointments
		if(arrDates.length>0)
		{
			draw_appointments();
			divDayHolder.scrollTop = 480;
		}

	}


	//--
	//-- called from toolbar - changes the view of the calendar
	var calViewType = "";
	function change_view(strViewType,boolFetchData,changebtn)
	{
		var intAdjustH = (intCalLength>1)?20:0;
		//if(calViewType == strViewType) return;
		if(changebtn==undefined)changebtn=false;
		if(changebtn)app.switch_calendar_view_btn(viewtype);	

		var intH = (window.innerHeight)? window.innerHeight: document.body.offsetHeight;

		switch(strViewType)
		{
			case "cal1":
				divDayHolder.style.overflow = "auto";
				divDayHolder.style.width = document.body.offsetWidth - 35;
				divHeaderHolder.style.width=document.body.offsetWidth - 35 - 20;
				divDayHolder.style.top=intTopAdjust;

				//-- firefox & ie height
				divDayHolder.style.height=intH-intTopAdjust;

				//-- left
				divTimeScale.style.display="";
				divHeaderHolder.style.left=35;
				divDayHolder.style.left=35;


				viewtype = _DAY;
				break;
			case "cal7":

				divDayHolder.style.overflow = "hidden";
				divDayHolder.style.width = document.body.offsetWidth-1;
				divHeaderHolder.style.width=document.body.offsetWidth-1;

				//-- top and left
				divTimeScale.style.display="none";
				divDayHolder.style.top=intAdjustH;
				divHeaderHolder.style.left=0;
				divDayHolder.style.left=0;
				
				//-- height of day holder
				divDayHolder.style.height=intH-intAdjustH-1;

				viewtype = _SEVENDAY;
				break;
			case "cal31":


				divDayHolder.style.overflow = "hidden";
				divDayHolder.style.width = document.body.offsetWidth-1;
				divHeaderHolder.style.width=document.body.offsetWidth-1;

				//-- height
				divDayHolder.style.height=intH-intAdjustH-1;

				//-- top and left
				divTimeScale.style.display="none";
				divDayHolder.style.top=intAdjustH;
				divHeaderHolder.style.left=0;
				divDayHolder.style.left=0;


				viewtype = _MONTH;
				break;
			default:
				alert("Calendar does not support the requested view. Please contact your Supportworks Administrator");
				return;
		}

		calViewType = strViewType;
		//-- re-process appointment data for view type

		if(boolFetchData==undefined)boolFetchData=true;
		if(boolFetchData)
		{
			app.oControlFrameHolder.selectdates(undefined,vSelectedYYYYMMDD);
		}

	}

	function scroll_timescale()
	{
		divTimeScale.scrollTop =divDayHolder.scrollTop;

	}

	function draw_timescale()
	{
		var strHTML = "";
		for(var x=0;x<=25;x++)
		{
			strHour = (x<10)?"0" + x:x;
			strHTML += "<div class='tshour'>"
			strHTML += "<div>"+strHour+"<span class='tshour-00'>00</span></div>";
			strHTML += "</div>";
		}

		app.removeChildNodes(divTimeScale);
		app.insertBeforeEnd(divTimeScale,strHTML);
	}

	//-- initialise page
	var iamready=false;
	var arraydates = new Array();
	var divHeaderHolder;
	var divDayHolder;
	var divTimeScale;
	var intTopAdjust = 0;
	var oXML;
	function init()
	{
		divHeaderHolder = document.getElementById('div_calendar_header');
		divDayHolder = document.getElementById('div_calendar_holder');
		divTimeScale =document.getElementById('div_calendar_timescale');

		divDayHolder.style.width = document.body.offsetWidth - 35;

		//-- firefox
		if(window.innerHeight)divDayHolder.style.height = window.innerHeight - 51;

		divHeaderHolder.style.width=document.body.offsetWidth - 35 - 20;
		draw_timescale();

		//change_view(calViewType,false,true);

		iamready=true;
	}


	//-- all php pages loaded in workspace area should have a document_resize function so parent docs can call it if needed
	function document_resize()
	{
		if(app.oControlFrameHolder.oncollapse)app.oControlFrameHolder.oncollapse();
	}


</script>
<body onload="init();" onresize="document_resize();" oncontextmenu='return false;'>
<div id='div_ts-top' style='height:71px'></div>
<div id='div_calendar_timescale'></div>
<div id='div_calendar_header'></div>
<div id='div_calendar_holder' onscroll="scroll_timescale()"></div>
</body>
</html>