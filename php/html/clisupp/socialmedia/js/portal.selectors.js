//-- functions to support selectors i.e. profile code selector , ci selector, date selector

//--
//-- js ci selector
var winciselector = null;
var ciselectortarget = null;
var boolShowCIServiceRequests = false;
function select_ci(boolUseCiServiceRequests,targetElement)
{
	ciselectortarget = targetElement;
	if(boolUseCiServiceRequests==undefined)boolUseCiServiceRequests=false;
	boolShowCIServiceRequests = boolUseCiServiceRequests;
	var strURL = "content/popups/ciselector.php";
	winciselector = openWin(strURL,"ciselector","scrollbars=yes,resizable=no,menubar=no,toolbar=no,height=400,width=760");
}


//-- called from ci popup selector
function ci_selected(aCiRow)
{
	var varKey = aCiRow.getAttribute("keyvalue");
	var varText = getRowColValue(aCiRow,"description");

	if(ciselectortarget==undefined || ciselectortarget==null)
	{
		//-- if the is an element called opencall.equipid populate its dbvalue with this key 
		var arrSpans=document.getElementsByTagName("span");
		for(var x=0;x< arrSpans.length;x++)
		{
			if(arrSpans[x].getAttribute('seltype')=="ci")
			{
				var varText = getRowColValue(aCiRow,"description");
				var strFieldName =  arrSpans[x].getAttribute('ocfield');
				if(strFieldName!="")
				{
					var StoreInField = document.getElementById(strFieldName);
					if(StoreInField!=null)
					{
						var existingValue = StoreInField.getAttribute('dbvalue');
						if(existingValue==null)
							existingValue = "";
						else
							existingValue +=",";
						StoreInField.setAttribute("dbvalue",existingValue+varKey);
						StoreInField.value=varText;
					}
				}
				arrSpans[x].setAttribute("dbvalue",varKey);
				arrSpans[x].innerHTML = varText;
			}
		}
	}
	else
	{
		if(ciselectortarget.getAttribute("ftype")=="STR")
		{
			ciselectortarget.setAttribute("dbvalue",varText);
		}
		else
		{
			ciselectortarget.setAttribute("dbvalue",varKey);
		}
		ciselectortarget.value=varText;

		if(ciselectortarget.getAttribute("attname")=="item_wiz_data")
		{
			var ciselectorQID = ciselectortarget.getAttribute("qid");
			var arrSpans=document.getElementsByTagName("span");
			for(var x=0;x< arrSpans.length;x++)
			{
				if(arrSpans[x].getAttribute('seltype')=="ci")
				{
					var spanQID = arrSpans[x].getAttribute('qid');
					if(spanQID == ciselectorQID)
					{
						var strFieldName =  arrSpans[x].getAttribute('ocfield');
						if(strFieldName!="")
						{
							var StoreInField = document.getElementById(strFieldName);
							if(StoreInField!=null)
							{
								var existingValue = StoreInField.getAttribute('dbvalue');
								if(existingValue==null)
									existingValue = "";
								else
									existingValue +=",";
								StoreInField.setAttribute("dbvalue",existingValue+varKey);
								StoreInField.value=varText;
							}
						}
						arrSpans[x].setAttribute("dbvalue",varKey);
						arrSpans[x].innerHTML = varText;
					}
				}
			}
		}
		ciselectortarget=null;
	}

	if(winciselector)
	{
		winciselector.close();
	}

	//--
	//-- get list of request types that can be run for this ci item
	if((varKey!="")&&(boolShowCIServiceRequests))
	{
		var strResult = run_php(app.portalroot + "php/xmlhttp/get.ci.servicerequests.php?in_ciid=" + varKey,true);
		//-- if we have items load list into page
		var oSpan = document.getElementById('ciselector_requests');
		if(oSpan!=null)
		{
			oSpan.innerHTML = strResult;
		}
	}

	return varKey;
}


//-- select ci type
var wincitypeselector = null;
var citypeselectortarget = null;
function select_citype(oTarget)
{
	citypeselectortarget = oTarget;
	var strURL = "content/popups/citypeselector.php";
	wincitypeselector = openWin(strURL,"citypeselector","scrollbars=no,resizable=no,menubar=no,toolbar=no,height=400,width=600");
	wincitypeselector.onselect = app.citype_selected;
}

function citype_selected(strCITypeCode)
{

	if(citypeselectortarget==undefined || citypeselectortarget==null)
	{

		//-- if the is an element called opencall.equipid populate its dbvalue with this key 
		var arrSpans=document.getElementsByTagName("span");
		for(var x=0;x< arrSpans.length;x++)
		{
			if(arrSpans[x].getAttribute('seltype')=="citype")
			{
				var strFieldName =  arrSpans[x].getAttribute('ocfield');
				if(strFieldName!="")
				{
					var StoreInField = document.getElementById(strFieldName);
					if(StoreInField!=null)
					{
						StoreInField.setAttribute("dbvalue",strCITypeCode);
						StoreInField.value=strCITypeCode;
					}
				}
				arrSpans[x].setAttribute("dbvalue",strCITypeCode);
				arrSpans[x].innerHTML = strCITypeCode;
			}
		}
	}
	else
	{
		citypeselectortarget.setAttribute("dbvalue",strCITypeCode);
		citypeselectortarget.value=strCITypeCode;
		citypeselectortarget=null;
	}

	if(wincitypeselector)
	{
		wincitypeselector.close();
	}

	return strCITypeCode;

}


//-- profile code selector
function select_probcode()
{
	//var strURL = "content/popups/profileselector.php";
	var strURL = "content/popups/profileselector.php";
	winprofileselector = openWin(strURL,"profileselector","scrollbars=no,resizable=no,menubar=no,toolbar=no,height=300,width=300");
	winprofileselector.onselect = 	app.probcode_selected;
}

var winprofileselector=null;
function probcode_selected(aProfileItem)
{
	var varKey = aProfileItem.keyvalue;
	var varText = aProfileItem.text;

	//-- if the is an element called opencall.equipid populate its dbvalue with this key 
	var arrSpans=document.getElementsByTagName("span");
	for(var x=0;x< arrSpans.length;x++)
	{
		if(arrSpans[x].getAttribute('seltype')=="profile")
		{
			var strFieldName =  arrSpans[x].getAttribute('ocfield');
			if(strFieldName!="")
			{
				var StoreInField = document.getElementById(strFieldName);
				if(StoreInField!=null)
				{
					StoreInField.setAttribute("dbvalue",varKey);
					StoreInField.value=varText
				}
			}
			arrSpans[x].setAttribute("dbvalue",varKey);
			arrSpans[x].innerHTML = varText;
		}
	}
	if(winprofileselector)
	{
		winprofileselector.close();
	}

	return varKey;
}



//-- nwj - 29.04.2009 - show fix / problem codes
var profilecodetarget = null;
function select_profilecode(strType, target)
{
	profilecodetarget = target;
	frames["if_profilecodes"].callbackfunction = returnCode;
	frames["if_profilecodes"].showcodetype(strType);

	//-- popup iframe in middle of this window - also hover div over rest of update window so cannot click on other stuff
	document.getElementById("if_profilecodes").style.display='block';
	document.getElementById("div_disable").style.display='block';
}

function returnCode(strCode,strText,strType)
{
	var eleText = (strType=="fix")?document.getElementById("ahref_fixcodetext"):document.getElementById("ahref_probcodetext");
	var eleCode = (strType=="fix")?document.getElementById("in_fixcode"):document.getElementById("in_probcode");
	
	profilecodetarget.setAttribute("dbvalue",strCode);
	profilecodetarget.value = strText;
}


//-- helpers
//-- get col value from a datatable
function getRowColValue(aRow,ColName)
{
	for(var y=0;y<aRow.childNodes.length;y++)
	{
		var dbCol = aRow.childNodes[y].getAttribute("dbname");
		if (dbCol==ColName)
		{
			return aRow.childNodes[y].getAttribute("dbvalue");
		}
	}
	return "";
}


//-- date selector
//-- popup a date selector (div) to input value to a field
var currDateFocus = null;
function get_dateinput(e)
{
	if (!e) var e = window.event; //-- ie
	//-- cancel bubbling
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

	var oEle = getEventSourceElement(e);

	currDateFocus = oEle;
	show_date(e,paste_date);
}

function paste_date(aDate)
{
	hide_date();

	var strType = currDateFocus.getAttribute("ftype");
	var dateValue = date_epoch(aDate);
	if(strType=="STR")dateValue=date_yyyymmdd(aDate);
	currDateFocus.setAttribute("dbvalue",dateValue);
	currDateFocus.value = date_yyyymmdd(aDate);
}


//-- run a service request script
function launch_service_request(strServiceRequestID)
{
	var strURL = "content/servicerequest.launch.php?in_requestid=" + strServiceRequestID;
	app.load_content(strURL);
}

//-- drop down profile code selected - reload list
function dropdown_profile_code_selected(oLB,boolUseMaxLevels)
{
	//-- get holders
	if(boolUseMaxLevels==undefined)boolUseMaxLevels=true;
	//var oSpan = ge("span_profilecodedesc");
	var oParent = get_parent_owner_by_tag(oLB, "P");
	var oSpan = get_child_by_att_value(oParent, "id", "span_profilecodedesc");

	var oPCholder = ge("opencall.probcode");	

	var strTargetEle = oLB.getAttribute("targetelevalue");
	if((strTargetEle!=null) && (strTargetEle!=""))
	{
		oPCholder = ge(strTargetEle);	
	}

	//-- get values
	var strUseNewValue = oLB.value;
	var strUseNewText = oLB.options[oLB.selectedIndex].text;

	var strCurrentProfileCode = oPCholder.value;
	var strParentCode = oLB.value;
	var intLevel = oLB.getAttribute("currlevel");
	if(intLevel==null)intLevel=0;

	if(strUseNewValue=="gobacklevel")
	{
		//-- we have a level to go back
		if(strCurrentProfileCode.indexOf("-")>0)
		{
			var arrCodes = strCurrentProfileCode.split("-");
			var arrText = oSpan.innerHTML.split("-&gt;");
			strParentCode = arrCodes[arrCodes.length-2];

			//-- set display and value back one
			strUseNewText = "";
			strUseNewValue = "";
			oPCholder.value	= "";
			for(var x=0; x< arrCodes.length-1;x++)
			{
				if(strUseNewValue!="")
				{
					strUseNewText+="->";
					strUseNewValue+="-";
				}
				strUseNewValue += arrCodes[x];				
				strUseNewText  += arrText[x]
			}
			intLevel=x;

			//-- set elemtn values and clear vars
			oSpan.innerHTML = strUseNewText; 
			if(oPCholder!=null)oPCholder.value  = strUseNewValue;
			strUseNewValue	= "";
			strUseNewText	= "";
			
		}
		else
		{
			intLevel		= 0;
			strParentCode	= "ROOT";
			if(oPCholder!=null)oPCholder.value	= "";
			oSpan.innerHTML	= "";
			strUseNewValue	= "";
			strUseNewText	= "";
		}	
	}
	else
	{
		intLevel++;
	}

	oLB.setAttribute("currlevel",intLevel);

	//-- set profile code text
	if(strUseNewText!="")
	{
		var strCurrentText = oSpan.innerHTML;
		if(strCurrentText!="") strCurrentText += "->";
		strCurrentText += strUseNewText;
		oSpan.innerHTML = strCurrentText;
	}
	//-- store value
	if(strUseNewValue!="")
	{
		if(oPCholder!=null)
		{
			if (oPCholder.value!="") oPCholder.value += "-";
			oPCholder.value += strUseNewValue
		}
	}

	//-- now get next level of items
	oLB.options.length=1;
	if(oPCholder.value!="")oLB.options[oLB.options.length++] = new Option("<-- Go back a level","gobacklevel");

	//-- ensure only select number of levels specified
	if((SS_LOGPROFILELEVELS==intLevel)&&(boolUseMaxLevels)) return;

	
	
	var strURL = "php/xmlhttp/get_profilecodes.php?in_level="  + intLevel + "&in_parentcode=" + strParentCode;
	var strOptions = app.run_php(strURL,true);

	//-- create xml loop to process options
	var oXML = app.create_xml_dom(strOptions);
	if(oXML)
	{
		for(var x=0 ; x < oXML.documentElement.childNodes.length; x++)
		{
			var oOption = oXML.documentElement.childNodes[x];
			var strValue = oOption.getAttribute("value");
			var strText =  getElementText(oOption);

			oLB.options[oLB.options.length++] = new Option(strText,strValue);
		}
	}
}