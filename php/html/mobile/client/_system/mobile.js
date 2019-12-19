	var _array_tab_selections = new Array();
	var _array_tab_viewsettings = new Array();
	var _currentLink = null;
	var _currentActiveViewTab = null;

	//-- return an elements document
	function getEleDoc(ele)
	{
		var aDoc = ele.document;
		if((aDoc!=undefined)&&(aDoc.nodeType==9)) return aDoc;

		while (ele && ele.nodeType!= 9) ele= ele.parentNode;
		return ele;
	}

	//-- fire event for an element
	function fireEvent(element,event,aDoc)
	{
		if(aDoc==undefined)aDoc=document;
		if (aDoc.createEventObject)
		{
			// dispatch for IE
			var evt = aDoc.createEventObject();
			return element.fireEvent('on'+event,evt)
		}
		else
		{
			// dispatch for firefox + others
			var evt = aDoc.createEvent("HTMLEvents");
			evt.initEvent(event, true, true ); // event type,bubbling,cancelable
			return !element.dispatchEvent(evt);
		}
	}

	function _exitout(strMessage)
	{
		var oForm  = document.getElementById("frmExit");
		if(oForm)
		{
			if(strMessage!=undefined && strMessage!="")
			{
				var oEle  = document.getElementById("_exiterror");
				if(oEle!=null)oEle.value = strMessage;
			}
			oForm.submit();
		}
	}


	//-- js for processing a tab link
	function _process_navigation(xmlDefPath)
	{
		var intActivateLevel=0;
		var intMaxLevels=0;

		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oForm = document.getElementById("frmContentLoader");
		if(oForm!=null)
		{
			var strFilePath = xmlDefPath;

			//-- store id of buton that we clicked
			var oPathEle = false;
			for(var y=0;y<oForm.childNodes.length;y++)
			{
				if(oForm.childNodes[y].id=="_definitionfilepath")
				{
					oPathEle = oForm.childNodes[y];
					break;
				}
			}

			//-- set xml def path
			if(!oPathEle)
				var oPathEle = document.getElementById("_definitionfilepath");
			oPathEle.value=xmlDefPath;

			//-- set action
			var oActionEle = document.getElementById("_action");
			oActionEle.value = "_navig";

			oForm.submit();
		}
	}
	
	function _open_call_action(aLink)
	{
		var arrVars = new Array();
		arrVars['_callaction'] = aLink.getAttribute("action");
		arrVars['_callstatus'] = aLink.getAttribute("status");

		var xmlPath ="[:_swm_app_path]/generic/callactions/calls.xml";
		_open_record(aLink,xmlPath,arrVars)
	}

	function _open_auth_action(aLink)
	{
		var arrVars = new Array();
		arrVars['_callaction'] = aLink.getAttribute("action");
		arrVars['_callstatus'] = aLink.getAttribute("status");
		arrVars['_callref'] = aLink.getAttribute("callref");
		arrVars['_callreffmt'] = aLink.getAttribute("callreffmt");

		var xmlPath ="[:_swm_app_path]/views/authorisations/auths.xml";
		_open_record(aLink,xmlPath,arrVars)
	}

	function _open_cmdb_action(aLink)
	{
		var arrVars = new Array();
		arrVars['_frmaction'] = aLink.getAttribute("action");

		var xmlPath ="[:_swm_app_path]/generic/cmdbactions/cmdb.xml";
		_open_record(aLink,xmlPath,arrVars)
	}

	function _open_cmdb_details(aLink)
	{
		var arrVars = new Array();
		arrVars['_cmdb_id'] = aLink.getAttribute("_cmdb_id");

		var xmlPath ="[:_swm_app_path]/views/assets/assets.details.xml";
		_open_record(aLink,xmlPath,arrVars)
	}

	function _open_call_diary(aLink,boolDesc)
	{
		if(boolDesc==undefined)
			boolDesc=false;

		var strLocation = "full";
		if(boolDesc)
			strLocation="first";
		var arrVars = new Array();

		var xmlPath ="[:_swm_app_path]/generic/diary/"+strLocation+".xml";
		_open_record(aLink,xmlPath,arrVars)
	}
	
	function _open_record(aLink,xmlPath,arrVars)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oForm = document.getElementById("frmContentLoader");
		if(oForm!=null)
		{

			for(strKey in arrVars)
			{
				_store_vars(oForm,strKey,arrVars[strKey]);
			}

			var oPathEle = document.getElementById("_definitionfilepath");
			oPathEle.value=xmlPath;

			//-- set action
			oForm.submit();
		}
	}

	function _store_vars(oForm,strKey,strValue)
	{
		var x = document.createElement("input"); 
		x.setAttribute("type","hidden");
		x.setAttribute("name",strKey);
		x.setAttribute("id",strKey);
		x.setAttribute("value",strValue);
		oForm.appendChild(x);
	}

	function _set_cust_searchmode(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oEle = document.getElementById("custsearchmode");
		if(oEle!=null)
		{
			var srchMode = aRow.getAttribute("mode");
			//if no customer selected
			if(srchMode==5)
			{
				var oNoCust = document.getElementById("flgnocust");
				if(oNoCust!=null)
					oNoCust.value= 1;
			}
			else
				oEle.value = srchMode;
		}
		var oForm = document.getElementById("frmCustsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _set_cust_searchcriteria(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oEle = document.getElementById("custsearchcriteria");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("criteria");
		var oForm = document.getElementById("frmCustsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _set_cust_searchname(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oVal = document.getElementById("txt_search");
		if(oVal!=null)
		{
			var oEle = document.getElementById("custsearchcriteria");
			if(oEle!=null)
				oEle.value = oVal.value;
			var oForm = document.getElementById("frmCustsearch");
			if(oForm!=null)
			{
				//-- set action
				oForm.submit();
			}
		}
	}

	function _set_cust_search(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oEle = document.getElementById("opencall_cust_id");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("keysearch");
		var oEle = document.getElementById("opencall_fk_company_id");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("companyid");

		var oEle = document.getElementById("opencall_cust_name");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("cname");

		var oEle = document.getElementById("opencall_companyname");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("compname");

		var oForm = document.getElementById("frmCustsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}
		
	function _set_sla_searchcriteria(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oEle = document.getElementById("opencall_itsm_sladef");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("slaid");

		var oEle = document.getElementById("opencall_itsm_slaname");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("slaname");

		var oEle = document.getElementById("def_priority");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("fk_sla");

		var oEle = document.getElementById("slasearchcriteria");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("criteria");

		var oForm = document.getElementById("frmSlasearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _set_sla_search(aRow)
	{
		var oEle = document.getElementById("opencall_priority");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("priority");
		var oForm = document.getElementById("frmSlasearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _submit_inc()
	{
		var oEle = document.getElementById("_frmaction");
		if(oEle!=null)
			oEle.value = "Log";
		var strClass = "incidents";
		var oEle = document.getElementById("opencall_callclass");
		if(oEle!=null)
		{
			if(oEle.value=="Change Request")
				strClass = "changes";
			else if(oEle.value=="Service Request")
				strClass = "servicerequests";
			else if(oEle.value=="Problem")
				strClass = "problems";
		}
		_process_navigation("[:_swm_app_path]/views/servicedesk/"+strClass+"/call.details.xml");
	}

	function _lc_next()
	{
		var oForm = document.getElementById("frmFileInputHolder");
		if(oForm!=null)
		{
			oForm.submit();
		}
	}

	function _lc_cmdb_next(entityVal)
	{
		var oHolder = document.getElementById(entityVal);
		if(oHolder!=null)
			oHolder.value=1;
		var oForm = document.getElementById("frmCMDBsearch");
		if(oForm!=null)
		{
			oForm.submit();
		}
	}

	function _lc_sc_next(entityVal)
	{
		var oHolder = document.getElementById(entityVal);
		if(oHolder!=null)
			oHolder.value=1;
		var oForm = document.getElementById("frmSCsearch");
		if(oForm!=null)
		{
			oForm.submit();
		}
	}

	function _set_bpm_status(aRow)
	{
		var oHolder = document.getElementById('opencall_bpm_status_id');
		if(oHolder!=null)
			oHolder.value=aRow.getAttribute('status');
		var strStatus = oHolder.value;

		if((strStatus.indexOf("Success")!=-1)||(strStatus.indexOf("Skip Task")!=-1))
		{
			//-- mark as completed - needed for vpme script
			var oHolder = document.getElementById('opencall_bpm_waitingtasks');
			if(oHolder!=null)
				oHolder.value=0;
		}

		var oForm = document.getElementById('frmCallactionLoader');
		if(oForm!=null)
		{
			oForm.submit();	
		}
	}


	function _set_cmdb_searchmode(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oEle = document.getElementById("cmdbsearchmode");
		if(oEle!=null)
		{
			var srchMode = aRow.getAttribute("mode");
			//if no customer selected
			if(srchMode==5)
			{
				var oNoCust = document.getElementById("flgnocmdb");
				if(oNoCust!=null)
					oNoCust.value= 1;
			}
			else
				oEle.value = srchMode;
		}
		var oForm = document.getElementById("frmCMDBsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _set_cmdb_searchcriteria(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oEle = document.getElementById("cmdbsearchcriteria");
		if(oEle!=null)
			oEle.value = aRow.getAttribute("criteria");
		var oForm = document.getElementById("frmCMDBsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _set_cmdb_searchname(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oVal = document.getElementById("txt_search");
		if(oVal!=null)
		{
			var oEle = document.getElementById("cmdbsearchcriteria");
			if(oEle!=null)
				oEle.value = oVal.value;
			var oForm = document.getElementById("frmCMDBsearch");
			if(oForm!=null)
			{
				//-- set action
				oForm.submit();
			}
		}
	}

	function _set_cmdb_search(aRow)
	{
		var strTarget = aRow.getAttribute("target");
		var oEle = document.getElementById(strTarget);
		if(oEle!=null)
		{
			var strCurrentValue = oEle.value;
			if(strCurrentValue!="")
				strCurrentValue +=",";
			strCurrentValue += aRow.getAttribute("pk_cmdb_id");
			oEle.value = strCurrentValue;
		}

		//reset search criteria
		var oEle = document.getElementById("cmdbsearchmode");
		if(oEle!=null)
		{
			oEle.value=0;
		}

		var oEle = document.getElementById("cmdbsearchcriteria");
		if(oEle!=null)
			oEle.value = "";

		var oForm = document.getElementById("frmCMDBsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _remove_cmdb_item(aRow)
	{
		var strTarget = aRow.getAttribute("target");
		var intRemove = aRow.getAttribute("pk_id");

		var oEle = document.getElementById(strTarget);
		if(oEle!=null)
		{
			var strCurrentValue = oEle.value;
			var arrValues = strCurrentValue.split(",");
			var strValues = "";
			
			for(x in arrValues)
			{
				var thisValue = arrValues[x];

				if(thisValue==intRemove)
				{

				}
				else
				{
					if(strValues!="")
						strValues +=",";
					strValues +=thisValue;
				}
			}
			oEle.value = strValues;
		}

		var oForm = document.getElementById("frmCMDBsearch");
		if(oForm!=null)
		{
			//-- set action
			oForm.submit();
		}
	}

	function _set_sc_service(aRow)
	{
		//-- load tab item content for given link - set iframe src to processor and pass in xml id
		var oVal = document.getElementById("opencall_itsm_fk_service");
		if(oVal!=null)
		{
			oVal.value = aRow.getAttribute("serviceid");
			var oEle = document.getElementById("subsc");
			if(oEle!=null)
			{
				oEle.value = aRow.getAttribute("subsc");
			}
			var oForm = document.getElementById("frmSCsearch");
			if(oForm!=null)
			{
				//-- set action
				oForm.submit();
			}
		}
	}

	function _sc_add_option(aRow)
	{
		var oVal = document.getElementById("sc_options");
		if(oVal!=null)
		{
			var currVal = oVal.value;
			if(currVal!="")currVal+=",";
			oVal.value = currVal+aRow.getAttribute("optionid");

			var oForm = document.getElementById("frmSCsearch");
			if(oForm!=null)
			{
				//-- set action
				oForm.submit();
			}
		}
	}

	function _sc_replace_option(aRow)
	{
		var oVal = document.getElementById("sc_options");
		if(oVal!=null)
		{
			var replaceID = aRow.getAttribute("replaceid");
			var newID = aRow.getAttribute("optionid");
			var currVal = oVal.value;
			var arrVals = currVal.split(",")
			for(x in arrVals)
			{
				if(arrVals[x]==replaceID)
				{
					arrVals[x]=newID;
					break;
				}

			}
			oVal.value = arrVals.join(",");

			var oForm = document.getElementById("frmSCsearch");
			if(oForm!=null)
			{
				//-- set action
				oForm.submit();
			}
		}
	}
	//-- load a fusion chart into a given div
	function load_chart(strDivID, strType, strDataXML)
	{
		//-- get body with and height
		var oDiv = document.getElementById(strDivID);
		if(oDiv!=null)
		{
			var myChart = new FusionCharts("../clisupp/fce/"+strType+".swf", "myChartId",  oDiv.offsetWidth, oDiv.offsetHeight, {debugMode : false , registerWithJS : true });
			myChart.autoInstallRedirect = false; //-- switch off alert box
			myChart.setDataXML(strDataXML);
					
			if(!myChart.render(strDivID)) //-- check if failed to render
			{
				//-- show link in div
				oDiv.innerHTML = "Failed to load chart";
				//oDiv.innerHTML = "<a href='http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash' target='new'>Activate Charts</a>"
			}
		}
	}