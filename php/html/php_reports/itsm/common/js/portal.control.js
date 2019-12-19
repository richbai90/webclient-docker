var undefined;
var app = top;
var isIE  = (window.ActiveXObject);
var lastTab = null;



//-- given html content will find any <script autoload tags and run any script between them
//-- we have to use this when we want to do jscript processing after loading content into a div
function get_content_jsscript(strHTML)
{
    //-- Clean up content: remove inline script  comments
    repl = new RegExp('//.*?$', 'gm');
    strHTML = strHTML.replace(repl, '\n');

    //-- Clean up content: remove carraige returns
    repl = new RegExp('[\n\r]', 'g');
    strHTML = strHTML.replace(repl, ' ');

	//-- Match anything inside <script> tags
    var matches = strHTML.match(/<script autoload\b[^>]*>(.*?)<\/script>/g);
    //-- For each match that is found...
    if (matches != null)
    {
        for (i = 0; i < matches.length; i++)
        {
            //-- Remove begin tag
            var repl = new RegExp('<script.*?>', 'gm');
            var script = matches[i].replace(repl, '');

            //-- Remove end tag
            repl = new RegExp('</script>', 'gm');
            script = script.replace(repl, '');
            //-- Execute commands
			//alert(script)
			eval(script);
        }
    }
}

function string_replace(strText,strFind,strReplace,boolGlobalreplace)
{
	if (strText==undefined) return "";
	//-- replace all occs of strFind and ignore case (gi)
	var flags = (boolGlobalreplace)?"gi":"i";
	var rExp = new RegExp(strFind,flags);
	return strText.replace(rExp, strReplace);
}


function display_content(strHTML)
{
	var container = document.getElementById("contentColumn");
	container.innerHTML = strHTML;
	get_content_jsscript(strHTML)
}

function display_actions(strHTML)
{
	var container = document.getElementById("actionsColumn");
	container.innerHTML = strHTML;
	get_content_jsscript(strHTML)

	if(strHTML=="")
	{
		container.style.display="none";
	}
	else
	{
		container.style.display="inline";
	}
}

function load_content(strURL)
{
	hide_popups();
	var strResult = run_php(strURL,true);
	display_content(strResult);
	setup_datepickers();
}

function load_actions(strURL)
{
	hide_popups();

	var strResult = run_php(strURL,true);
	display_actions(strResult);
	setup_datepickers();
}

//-- called when a menu item is selected
var lastItem = null;
function menu_item_selected(aLink)
{
	if(aLink.getAttribute('aparent')=="1")
	{

		switch (aLink.className)
		{
			case "withchild":
				//-- need to expand
				var childUL = document.getElementById(aLink.getAttribute('ulid'));
				if(childUL)
				{
					childUL.className="childrenvisible";
					aLink.className="withchildunselected";
				}
				break;
			case "withchildunselected":
				//-- need to expand
				var childUL = document.getElementById(aLink.getAttribute('ulid'));
				if(childUL)
				{
					childUL.className="childrenhidden";
					aLink.className="withchild";
				}
				break;
			default:
		}
	}
	else
	{
		if(lastItem!=null)
		{
			lastItem.className="";
		}
		lastItem = aLink;
		aLink.className="selected";


		//-- load content
		if(aLink.getAttribute('phpactions')!="")
		{
			load_actions(aLink.getAttribute('phpactions'));
		}
		else
		{
			display_actions("");
		}

		if(aLink.getAttribute('phpcontent')!="")
		{
			load_content(aLink.getAttribute('phpcontent'));
		}
	}
}

//--
//-- load home option after loading layout
function select_default_menu_item()
{
	menu_item_selected(document.getElementById('mi_home'));
	//menu_item_selected(document.getElementById('mi_custreqs'));
}


function ge(strID)
{
	return document.getElementById(strID)
}

function expand_collapse(oImg, elementID, strColour)
{
	var oEle = ge(elementID);
	if(oEle!=null)
	{
		if(oEle.getAttribute("expanded")=="1")
		{
			oEle.setAttribute("expanded","0");
			oEle.style.display="none";
			oImg.src="../common/img/icons/" + strColour + "_expand.gif"
		}
		else
		{
			oEle.setAttribute("expanded","1");
			oEle.style.display="inline";
			oImg.src="../common/img/icons/" + strColour + "_contract.gif"
		}
	}
}

//--
//-- submit normal call form and also operator script answers
function submit_servicerequestform(strformID)
{
	var oForm = document.getElementById(strFormID);
	if(oForm!=null)
	{
		//-- get normal form url
		var strURL = get_form_url(oForm);

		if(strURL==false || strURL == '')
		{
			return false;
		}

		//-- get operator script answers

	}
}




//-- submit a call form
function submit_form(strFormID)
{
	var oForm = document.getElementById(strFormID);
	if(oForm!=null)
	{
		var strURL = get_form_url(oForm);
		if(strURL!=false)load_content(strURL);
	}
}

//-- call httpreq with form details passed in
//-- alert result and/or clear form
function submit_httpform(strFormID,boolClear,strMessageHolder,strEvalPHP)
{
	if(strEvalPHP==undefined)strEvalPHP="";
	if(boolClear==undefined)boolClear=false;
	var oForm = document.getElementById(strFormID);

	if(oForm!=null)
	{
		var strURL = get_form_url(oForm);
		if(strURL==false)return false;
		if(strEvalPHP!="")
		{
			strURL+=(strURL.indexOf("?")==-1)?"?":"&";
			strURL+="evalphp="+strEvalPHP;
		}
		
		var strResult = run_php(strURL,true);

		var oMsgHolder = document.getElementById(strMessageHolder);
		if(oMsgHolder!=null)
		{
			oMsgHolder.innerHTML=strResult;
		}
		if(boolClear)clear_form(oForm);
	}
}

function clear_form(oForm)
{
	if(oForm==null)return "";
	if(oForm.elements==null)return "";
	if(oForm.elements.length==null)return "";
	for(i=0; i<oForm.elements.length; i++)
	{
		//-- dont clear hidden
		var eleType = oForm.elements[i].getAttribute("type")
		if (eleType.toLowerCase()!="hidden")
		{
			oForm.elements[i].value="";
			oForm.elements[i].setAttribute("dbvalue","");
		}
	}
}

function get_form_url(oForm)
{
	if(oForm==null)return "";
	//-- create url
	var strURL = get_form_url_data(oForm);
	if(strURL==false) return false;

	var strAction = oForm.getAttribute("action");
	if(strURL!="")return strAction + "?" + strURL;
	
	return strAction;
}

//--
//-- for a form get its data url
function get_form_url_data(oForm)
{
	if(oForm==null)return "";
	if(oForm.elements==null)return "";
	if(oForm.elements.length==null)return "";
	//-- create url
	var arrElements = new Array();
	var strURL = "";
	var oEle;
	for(i=0; i<oForm.elements.length; i++)
	{
		if(strURL != "")strURL += "&";
		oEle=oForm.elements[i];
		var strID = oEle.id;
		
		
		if(strID !="")
		{
			var useID = strID;
			if(arrElements[strID])
			{
				//-- element is part of a control group so make __elementid
				useID = strID + "__" + arrElements[strID];
			}
			else
			{
				arrElements[strID] = 0;
			}

			//-- see if we have a dbvalue
			strValue = getEleValue(oEle);
			
			if((oEle.className=='mandatory')&&(strValue==""))
			{
				var strDisplayName = oEle.getAttribute('displayname');
				alert("The field [" + strDisplayName + "] is mandatory and requires your input.");
				return false;
			}

			
			//-- Start convert date range
				//-- If second element of daterange (i.e. ends in "__1" ) make time 23:59:59 (i.e. add 86399 seconds).
			if(oEle.getAttribute('intype')=="daterange")
			{
				
				if (useID.length >= 3)
				{
					if (useID.substr(useID.length-3,useID.length-1)=="__1")
					{
						strValue = (Number(strValue) + 86399);
					}
				}
			}
			//-- End conver date range
			
			strURL+=useID + "=" + strValue;
			arrElements[strID]++;
		}
	}
	return strURL;
	
}





function get_div_url_data(oForm)
{
	var thisEle = oForm.id.substring(4);
	if(oForm==null)return "";
	var cell = oForm.getElementsByTagName("*");
	//-- create url
	var arrElements = new Array();
	var strURL = "";
	var oEle;
	for(i=0; i<cell.length; i++)
	{
		if(strURL != "")strURL += "&";
		oEle=cell[i];
		var strID = oEle.id;
		if(strID.substring(3)==thisEle)
			return strURL;
		if(strID !="" && strID.substring(3)!=thisEle)
		{
			var useID = strID;
			if(arrElements[strID])
			{
				//-- element is part of a control group so make __elementid
				useID = strID + "__" + arrElements[strID];
			}
			else
			{
				arrElements[strID] = 0;
			}

			//-- see if we have a dbvalue
			strValue = getEleValue(oEle);
			if((oEle.className=='mandatory')&&(strValue==""))
			{
				var strDisplayName = oEle.getAttribute('displayname');
				alert("The field [" + strDisplayName + "] is mandatory and requires your input.");
				return false;
			}			

			strURL+=useID + "=" + strValue;
			arrElements[strID]++;
		}
	}
	return strURL;
	
}
function openWin(theURL,winName,features) 
{
	//alert(theURL)
	newWin = window.open(theURL,winName,features);
	return newWin;
}


//--
//-- when user clicks on c rating image display popup to select rating
var currentCratingP = null;
function popup_crating(e)
{
	var rightclick=false;
	//-- get event button
	if (!e) var e = window.event; //-- ie
	if (e.which) rightclick = (e.which == 3); //-- mozilla
	else if (e.button) rightclick = (e.button == 2);

	//-- right click we dont care
	if (rightclick) return false;

	//-- get mouse position
	//var intMouseLeft = e.clientX + document.body.scrollLeft;
	//var intMouseTop = e.clientY + document.body.scrollTop;

	//-- get element that triggered the event
	var aLink = getEventSourceElement(e);
	currentCratingP= get_parent_owner_by_tag(aLink,"P");
	var currentRow= get_parent_owner_by_tag(aLink,"TR");
	var callStatus = get_col_value(currentRow,"status");

	var oDiv = document.getElementById('call_rating');
	if(oDiv!=null)
	{
		var strUseText = "Please feedback to us how we are doing as we progress this request for you, this will help us better understand your needs.";
		if(callStatus=="6")
		{
			strUseText = "Please rate the service that you received from us in relation to this incident.  Your feedback is important to us because it helps us better understand your needs and enables us to continue to improve the service that we provide to you.";
		}

		var oText = document.getElementById('rating_text');
		if(oText)oText.innerHTML = strUseText;

		//-- reset values
		document.getElementById('crating_text').value="";
		document.getElementById('cr_pos').checked=false;
		document.getElementById('cr_avg').checked=false;
		document.getElementById('cr_neg').checked=false;

		//-- get top and left
		var arrPos = findPos(aLink); 
		posL = new Number(arrPos[0]);
		posT = new Number(arrPos[1]);

		setPos(oDiv,posL,posT);
		oDiv.style['display']='inline';
	}

	//-- now cancel bubbling
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
}

function cancelEventBubble(e)
{
	//-- now cancel bubbling
	if (!e) var e = window.event; //-- ie
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;

}

//-- user has select a call rating
function set_call_rating(e)
{
	if (!e) var e = window.event; //-- ie
	var tmpEle = getEventSourceElement(e);
	if(tmpEle)
	{
		//-- user selected radio option
		//-- get row from original selected rating <p>
		var aRow = get_parent_owner_by_tag(currentCratingP,"TR");
		if(aRow)
		{
			varKey= aRow.getAttribute("keyvalue");
			if((varKey!="")&&(varKey!=null))
			{
			
				//-- get rating #
				var intRating = get_selected_rating();

				//-- do http request to update rating
				var strURL = app.portalroot + "php/xmlhttp/updatecallrating.php?in_callref=" + varKey + "&in_crating=" + intRating + "&in_feedback=" + document.getElementById('crating_text').value;
				var strResult = run_php(strURL,true);
				if(strResult=="TRUE")
				{
					var strClass = "";
					intRating--;intRating++;
					switch(intRating)
					{
						case 1:
							strClass = "call-pos";
							break;
						case 2:
							strClass = "call-neu";
							break;
						case 3:
							strClass = "call-neg";
							break;
					}
					currentCratingP.className = strClass;

					var currentRow= get_parent_owner_by_tag(currentCratingP,"TR");
					var callStatus = get_col_value(currentRow,"status");

					if(intRating>0)	
					{
						if(callStatus!=6)
						{
							currentCratingP.innerHTML="<a href='#' onclick='popup_crating();'>change</a>";
						}
						else
						{
							currentCratingP.innerHTML="";
						}
					}

				}
				else
				{
					//-- failed to set rating
					alert("An fault occured trying to set the rating for this request. Please contact youer Supportworks Administrator.");
				}	
			}
		}
	}
	var oDiv = document.getElementById('call_rating');
	if(oDiv==null)return true;
	oDiv.style['display']='none';
}

function get_selected_rating()
{
	if	(document.getElementById('cr_pos').checked) return document.getElementById('cr_pos').value;
	if	(document.getElementById('cr_avg').checked) return document.getElementById('cr_avg').value;
	if	(document.getElementById('cr_neg').checked) return document.getElementById('cr_neg').value;

	return 0;
}

//-- if not selecting a rating make sure popup is hidden
function check_popup_callrating(e)
{
	if (!e) var e = window.event; //-- ie

	var oDiv = document.getElementById('call_rating');
	if(oDiv==null)return true;
	if(oDiv.style['display']=='inline')
	{
		//-- if not our div hide it
		var tmpEle = getEventSourceElement(e);
		if(tmpEle != oDiv)
		{
			oDiv.style['display']='none';
		}
	}

	check_popup_date(e);
	return true;
}

function check_popup_date(e)
{
	if (!e) var e = window.event; //-- ie

	var oDiv = document.getElementById('date-picker');
	var oIF = document.getElementById("date-picker-shimer");
	if(oDiv==null)return true;
	if(oDiv.style['display']=='inline')
	{
		//-- if not our div hide it
		var tmpEle = getEventSourceElement(e);
		if(tmpEle != oDiv)
		{
			oDiv.style['display']='none';
			oIF.style['display']='none';
		}
	}
	return true;
}

//-- hide all popups - called when loading new content
function hide_popups()
{
	var oDiv = document.getElementById('date-picker');
	var oIF = document.getElementById("date-picker-shimer");
	var oDivCR = document.getElementById('call_rating');
	if(oDiv!=null)oDiv.style['display']='none';
	if(oIF!=null)oIF.style['display']='none';
	if(oDivCR!=null)oDivCR.style['display']='none';
}

function getEventSourceElement(anE)
{

		if (anE.target) 
		{
			return anE.target;     //-- moz
		}
		else if (anE.srcElement) 
		{
			return anE.srcElement; //-- ie
		}
	return null;
}

//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by tag (TABLE / TR / DIV / BODY etc)
function get_parent_owner_by_tag(oEle, strTag)
{
	if (oEle.tagName==strTag) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_tag(oEle.parentNode, strTag);
	}
	return false;
}

//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by att 
function get_parent_owner_by_att(oEle, strAtt)
{
	if (oEle.getAttribute(strAtt)!=null) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_att(oEle.parentNode, strAtt);
	}
	return false;
}

//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by id
function get_parent_owner_by_id(oEle, strID)
{
	if (oEle.id==strID) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_id(oEle.parentNode, strID);
	}
	return false;
}

//-- 16.02.2006 - NWJ
//-- return child of parent by id
function get_parent_child_by_id(oEle, strID)
{
	if (oEle==null) return null;
	if (oEle.id==strID) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].id==strID)return oEle.childNodes[x];
		var testEle = get_parent_child_by_id(oEle.childNodes[x], strID);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}


//-- 16.02.2006 - NWJ
//-- return child element identified by tag (TABLE / TR / DIV / BODY etc)
function get_parent_child_by_tag(oEle, strTag)
{
	if (oEle.tagName==strTag) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].tagName==strTag)return oEle.childNodes[x];
		var testEle = get_parent_child_by_tag(oEle.childNodes[x], strTag);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}



//-- handle to fireevent for an element (executed differently depending if ie / moz)
function fireevent(oEle,strEvent, strParams)
{
	switch(strEvent)
	{
		case "click":
			if(isIE)oEle.click(strParams)
			else oEle.onclick(strParams);
			break;
		case "dblclick":
			if(isIE)oEle.dblclick(strParams)
			else oEle.ondblclick(strParams);
			break;
		case "mouseover":
			if(isIE)oEle.mouseover(strParams)
			else oEle.onmouseover(strParams);
			break;
		case "mouseout":
			if(isIE)oEle.mouseout(strParams)
			else oEle.onmouseout(strParams);
			break;
		default:
			alert("portal.control.js-fireevent : Unhandled element event(" + strEvent + ").")
	}
}


//-- return full url to load given path from root.
//-- boolCust - true  = root is where portal.php is located
//--            false = root is sw/_phpinclude/portal
function create_app_url(strPath, boolCustom)
{
	
}

function findPos(obj) 
{
	var curleft = curtop = 0;
	if (obj.offsetParent) 
	{
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) 
		{
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
}

function setPos(obj,pxLeft,pxTop)
{
	//-- convert to string
	pxLeft+="";pxTop+="";

	var strLPX=(pxLeft.indexOf("px")==-1)?"px":"";
	var	strTPX=(pxTop.indexOf("px")==-1)?"px":"";

	obj.style['left'] = pxLeft + strLPX;
	obj.style['top'] = pxTop + strTPX;
}


//--
//-- setting and getting element values
function getEleValue(oEle)
{
	var strTag = oEle.tagName;

	switch (strTag)
	{
		case "INPUT":
			var strType = oEle.getAttribute("type");
			var strDBVal = oEle.getAttribute("dbvalue");
			switch (strType.toLowerCase())
			{
				case "hidden":
				case "input":
				case "text":
				case "password":
				case "radio":
					return (strDBVal==null)?oEle.value:strDBVal;
					break;
				case "checkbox":
					
					if (oEle.checked)
					{
						return (strDBVal==null)?oEle.value:strDBVal;
					}
					else
					{
						return "";
					}
					break;
			}			
			break;
		case "SELECT":
			if(oEle.selectedIndex<0)return "";
			return oEle.options[oEle.selectedIndex].value;
			break;

		case "TEXTAREA":
			return oEle.value;
			break;
		case "SPAN":
		case "DIV":
		case "P":
			return getElementText(oEle);
			break;
	}

}

//--
//-- return elements text
function getElementText(oEle)
{
	if(oEle.text!=undefined)return blank_undef(oEle.text);
	if(oEle.innerText!=undefined)return blank_undef(oEle.innerText);
	if(oEle.textContent!=undefined)return blank_undef(oEle.textContent); //-- mozilla etc

}

function blank_undef(strValue)
{
	if((strValue==undefined)||(strValue=="undefined")) return "";
	return strValue;
}

//--
//-- set elements text
function setElementText(oEle,strText)
{
	if(oEle.textContent)oEle.textContent=blank_undef(strText); //-- mozilla etc
	else if(oEle.innerText) oEle.innerText = blank_undef(strText);
	else if(oEle.text) oEle.text = blank_undef(strText);
}

function filter_picklist(oEle,strFilter)
{
	if(oEle==null)
	{
		alert("filter_picklist : passed in element is null. Please contact your Supportworks Administrator");
		return;
	}

	oEle.options.length = 0;

	var strDSN = oEle.getAttribute("dsn");
	var strTable = oEle.getAttribute("table");
	var strKeyCol = oEle.getAttribute("keycol");
	var strTextCol = oEle.getAttribute("txtcol");
	if(strFilter==undefined)strFilter = oEle.getAttribute("applyfilter");

	if((strTextCol==null) || (strTextCol=="")) strTextCol = strKeyCol;

	var strURL  =  "../common/php/filter_listbox.php?&in_dsn=" + strDSN+ "&in_table=" + strTable + "&in_keycol=" + strKeyCol +"&in_txtcol="+ strTextCol + "&in_filter=" + strFilter;
	var strResult = app.run_php(strURL, true);
	var oXML = app.create_xml_dom(strResult);
	if(oXML)
	{
		var arrOptions = oXML.documentElement.childNodes;
		oEle.options[0] = new Option('','');
		for(var x=0;x<arrOptions.length;x++)
		{
			oEle.options[oEle.options.length++] = new Option(app.getElementText(arrOptions[x]) , arrOptions[x].getAttribute("value"));;
		}
	}
}

function setup_datepickers()
{
	$('.input-date').live('focus', function () {
		$(this).not('.hasDatePicker').datepicker(
			{
				showOn:'focus',
				dateFormat: strDateFmt,
				showButtonPanel: true,
				showButtonPanel: true,
	            closeText: 'Clear',
				todayText: 'Today',
				onClose: function(dateText, inst)
				{
					 if ($(window.event.srcElement).hasClass('ui-datepicker-close'))
					 {
						 $(this).val('');
					}
				},
				
				buttonImage: "css/images/calendar.gif", 
				onSelect: function(dateText, inst) { 
				    var epoch = $.datepicker.formatDate('@', $(this).datepicker('getDate')) / 1000;
					if(inst.input[0].getAttribute("attname")=="item_wiz_data")
					{
						//do not use epoch value, use date string
					}
					else
						inst.input[0].setAttribute('dbvalue',epoch);
				}
			}
		);
	});
}
function setup_datepickers_month_only()
{
	$('.input-date').live('focus', function () {
		$(this).not('.hasDatePicker').datepicker(
			{
				showOn:'focus',
				changeMonth: true,
				changeYear: true,
				dateFormat: strDateFmt,
				showButtonPanel: true,
	            closeText: 'Clear',
				onClose: function(dateText, inst)
				{
					var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
					var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
					var epoch = $(this).datepicker('setDate', new Date(year, month, 1));
					inst.input[0].setAttribute('dbvalue',epoch);
					if ($(window.event.srcElement).hasClass('ui-datepicker-close'))
					 {
						 $(this).val('');
					}
				},
				
				buttonImage: "css/images/calendar.gif", 
				onSelect: function(dateText, inst) { 
				    var epoch = $.datepicker.formatDate('@', $(this).datepicker('getDate')) / 1000;
					if(inst.input[0].getAttribute("attname")=="item_wiz_data")
					{
						//do not use epoch value, use date string
					}
					else
						inst.input[0].setAttribute('dbvalue',epoch);
				}
			}
		);
	});
}
//-- for handling customer feedback rating
window.document.onclick = check_popup_callrating;