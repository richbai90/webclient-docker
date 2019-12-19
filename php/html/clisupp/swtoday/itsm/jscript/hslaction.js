//--
//-- fusion chart link click event handler for webclient only
//-- 
function _run_fsc_action(strChartAction)
{
	//-- depending on strChartAction we hen know what other parameters have been passed in 
	if(strChartAction=="mycallstatus")
	{
		_run_mycallstatus(arguments[1],arguments[2],arguments[3],arguments[4])
	}
	else if(strChartAction=="mycallclass")
	{
		_run_mycallclass(arguments[1],arguments[2],arguments[3])
	}
	else if(strChartAction=="mycallslastatus")
	{
		_run_mycallslastatus(arguments[1],arguments[2],arguments[3])
	}
	else if(strChartAction=="mycallolastatus")
	{
		_run_mycallolastatus(arguments[1],arguments[2],arguments[3])
	}
	else if(strChartAction=="mycallaged")
	{
		_run_mycallaged(arguments[1],arguments[2],arguments[3])
	}
	else if(strChartAction=="callstatus")
	{
		_run_callstatus(arguments[1],arguments[2],arguments[3])
	}
}

// -- Prepare string for SQL
function _psfs(strValues)
{
	var arrValues = strValues.split(",");
	var strPreparedValues = "";
	
	for(var i=0; i<arrValues.length; i++)
	{
		if(strPreparedValues!="") strPreparedValues += ",";
		strPreparedValues += "'"+arrValues[i]+"'";
	}
	return strPreparedValues;
}

//-- run dbsearch action for mycallstatus - create a function per type of hsl action we do per application
//-- note here this is itsm specific
function _run_mycallstatus(strCommaStatus, strPfsAid, strDD, intLimit)
{
	if(intLimit==undefined)intLimit=100;
	var strSQL = "select callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, fixbyx from opencall ";
    strSQL += "where callclass IN ('Incident','Problem','Known Error','Change Request','Service Request','Release Request') ";
	strSQL += "and status in("+ strCommaStatus + ") and owner='" + strPfsAid + "' and appcode IN("+_psfs(strDD)+") order by callref desc";
	var strParams = "query=" + strSQL +"&limit=" + intLimit;
	//-- call method to run action
	//top._hslaction("mycallstatus",strParams);
	top._hslaction("sqlsearch",strParams);
}

function _run_callstatus(strCommaStatus, strDD, intLimit)
{
	if(intLimit==undefined)intLimit=100;

	var strSQL = "select callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, fixbyx from opencall ";
    strSQL += "where callclass IN ('Incident','Problem','Known Error','Change Request','Service Request','Release Request') ";
	strSQL += "and status in("+ strCommaStatus + ") and appcode IN("+_psfs(strDD)+") order by callref desc";

	var strParams = "query=" + strSQL +"&limit=" + intLimit;
	//-- all method to run action
	//top._hslaction("mycallstatus",strParams);
	top._hslaction("sqlsearch",strParams);
}

function _run_mycallclass(strPfsAid, strDD, intLimit)
{
	if(intLimit==undefined)intLimit=100;

	var strSQL = "select callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, fixbyx from opencall ";
    strSQL += "where callclass IN ('" + strPfsAid + "') ";
	strSQL += "and status not in (18,17,16,15,6) and appcode IN("+_psfs(strDD)+") order by callref desc";

	var strParams = "query=" + strSQL +"&limit=" + intLimit;

	//-- call method to run action
	top._hslaction("sqlsearch",strParams);
}

function _run_mycallslastatus(timecriteria, strDD, intLimit)
{
	if(intLimit==undefined)intLimit=100;

	var strSQL = "select callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, fixbyx from opencall ";
    strSQL += "where callclass IN ('Incident','Problem','Known Error','Change Request','Service Request','Release Request') ";
	strSQL += "and status not in (18,16,15,17,6) and appcode IN("+_psfs(strDD)+") and " + timecriteria + " order by callref asc";

	var strParams = "query=" + strSQL +"&limit=" + intLimit;

	//-- call method to run action
	top._hslaction("sqlsearch",strParams);
}

function _run_mycallolastatus(timecriteria, strDD, intLimit)
{
	if(intLimit==undefined)intLimit=100;

	var strSQL = "select callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, fixbyx from opencall ";
    strSQL += "where callclass IN ('OLA Task') ";
	strSQL += "and status not in (18,16,15,17) and appcode IN("+_psfs(strDD)+") and " + timecriteria + " order by callref asc";

	var strParams = "query=" + strSQL +"&limit=" + intLimit;

	//-- call method to run action
	top._hslaction("sqlsearch",strParams);
}

function _run_mycallaged(timecriteria, strDD,  intLimit)
{
	if(intLimit==undefined)intLimit=100;

	var strSQL = "select callref, callclass, status, priority, itsm_impact_level, itsm_urgency_level,cust_name, site, respondbyx, fixbyx from opencall ";
    strSQL += "where callclass IN ('Incident','Problem','Known Error','Change Request','Service Request','Release Request') ";
	strSQL += "and status not in (18,16,15,17,6) and appcode IN("+_psfs(strDD)+") and " + timecriteria + " order by callref desc";

	var strParams = "query=" + strSQL +"&limit=" + intLimit;

	//-- call method to run action
	top._hslaction("sqlsearch",strParams);
}
