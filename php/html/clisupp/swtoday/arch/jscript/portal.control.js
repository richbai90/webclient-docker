var undefined;
var app = top;
var isIE  = (window.ActiveXObject);
var lastTab = null;

var boolUsePostWindows = false;

//-- given html content will find any <script autoload tags and run any script between them
//-- we have to use this when we want to do jscript processing after loading content into a div
function get_content_jsscript(strHTML,aDoc)
{
	if(aDoc==undefined)aDoc=document;

    //-- Clean up content: remove inline script  comments
    repl = new RegExp('//.*?$', 'gm');
    strHTML = strHTML.replace(repl, '\n');

    //-- Clean up content: remove carriage returns
    repl = new RegExp('[\n\r]', 'g');
    strHTML = strHTML.replace(repl, ' ');

	//-- Match anything inside <script> tags
    var matches = strHTML.match(/<script autoload\b[^>]*>(.*?)<\/script>/g);
    //-- For each match that is found...
    if (matches != null)
    {
       for (countOfMatches = 0; countOfMatches < matches.length; countOfMatches++)
        {
            //-- Remove begin tag
            var repl = new RegExp('<script.*?>', 'gm');
            var script = matches[countOfMatches].replace(repl, '');

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
	if(!isNaN(strText)) return strText;
	//-- replace all occs of strFind and ignore case (gi)
	var flags = (boolGlobalreplace)?"gi":"i";
	try
	{
	var rExp = new RegExp(strFind,flags);
	return strText.replace(rExp, strReplace);
	}
	catch(e)
	{
		//-- IE6 trap - does like smart quotes
		return strText;
	}

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
	if(strHTML=="")
	{
		container.style.display="none";
	}
	else
	{
		container.style.display="block";
	}

	container.innerHTML = strHTML;
	get_content_jsscript(strHTML)


}

function load_content(strURL)
{
	hide_popups();

	//-- 80669 - use post
	var strResult = app.run_php(strURL,true);
	display_content(strResult);
}

function load_actions(strURL)
{
	hide_popups();

	//-- 80669 - use post
	var strResult = app.run_php(strURL,true);
	display_actions(strResult);
}

//--
//-- called when a menu item is selected
var lastItem = null;
var arrlink_history = new Array();
function menu_item_selected(aLink, strOnMenuSelectedFunction)
{
	if(strOnMenuSelectedFunction==undefined)
		strOnMenuSelectedFunction = "";

	//-- nwj 11.09.2009 - check displaytype if popup then don't change menu link just popup window and url
	//-- 
	var strDisplayType = aLink.getAttribute('displaytype');
	if(strDisplayType=="popup")
	{
		var strURL = aLink.getAttribute('phpcontent');		
		var strFeatures = aLink.getAttribute('features');		
		openWin(strURL,"",strFeatures);
		return true;
	}


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
		//-- prev link clear formatting
		if(lastItem!=null)
		{
			lastItem.className="";
			strPrevLink = lastItem.id;
		}
		lastItem = aLink;
		aLink.className="selected";
		arrlink_history[arrlink_history.length++] = aLink; //-- store visited link

		//-- load content and actions - we reset page so stored in cache
		var strContentPHP = aLink.getAttribute('phpcontent');
		var strActionPHP = aLink.getAttribute('phpactions');


		//-- 04.10.2008 - check if passed in callref if so load its detail page
		var strCallrefParam = "";
		if((intViewCallref!="")&&(boolLandingPage))
		{
			strCallrefParam = "&viewcallref=" + intViewCallref;
		}

		//-- post vars - so cannot manipulate them
		//-- nwj - 27.07.2009 - causes problem with back button - so post using iframe
		var strURL = "action.php?link=" + B64.encode(aLink.id) + "&phpcontent="+B64.encode(strContentPHP)+"&phpactions="+B64.encode(strActionPHP) + strCallrefParam+"&load_function="+B64.encode(strOnMenuSelectedFunction);
		run_hidden_form(strURL,"ifmenuaction",document);
	}
}

//-- run url to a hidden form
function run_hidden_form(strURL,strTarget,oDoc)
{
	var strMethod = "POST";
	var oMainForm = app.create_submit_form(strURL, strTarget, oDoc, strMethod);
	oMainForm.submit();
	destroy_submit_form(oMainForm);

}

//-- to call a menu item by id
function activate_menu_item(strMenuID, strFunctionToRun)
{
	if(strFunctionToRun==undefined)	strFunctionToRun = "";
	var aLink = document.getElementById(strMenuID);

	if(aLink!=null)	menu_item_selected(aLink,strFunctionToRun);
}

//--
//-- function to handle onload event of the portal.php page 
var boolLandingPage = false;
function onload_portal()
{

	//-- put any onload client code here
	var strLoadMainContent = B64.decode(strMainContent);
	var strLoadActionContent = B64.decode(strActionContent);

	display_actions("");
	display_content("");
	if(strLoadActionContent!="")load_actions(strLoadActionContent);
	if(strLoadMainContent!="")load_content(strLoadMainContent);

	//-- highlight link
	var useLinkID = B64.decode(strLinkID);
	if(useLinkID=="")
	{
		boolLandingPage = true;
		useLinkID = "mi_home";
		var aLink = document.getElementById(useLinkID);
		if(aLink!=null)	
		{
			menu_item_selected(aLink);
		}
		else
		{
			//-- bug fix : 73037
			//-- default item is not there so find next one in the list
			var hrefelements = document.getElementsByTagName("A");
			for(var x=0;x < hrefelements.length;x++)
			{
				if((hrefelements[x].id!="")&&(hrefelements[x].id.indexOf("mi_")==0))
				{
					if(hrefelements[x].getAttribute("phpactions")!=null)
					{	
						menu_item_selected(hrefelements[x]);
						break;
					}
				}
			}
		}
	}
	else
	{
		var aLink = document.getElementById(useLinkID);
		if(aLink==null){
			var x = useLinkID.substr(useLinkID.length-1,useLinkID.length);
			//if the last character of the string is a null (not equal to null but is the character null)
			if(escape(x)=="%00")
			{
				useLinkID = useLinkID.substr(0,useLinkID.length-1);
				var aLink = document.getElementById(useLinkID);
			}
		}

		if(aLink!=null)	
		{
			//-- clear all previous visited link formating
			for(var x=0;x<arrlink_history.length;x++)
			{
				arrlink_history[x].className="";
			}

			aLink.className="selected";

			//-- if a child expand parent
			var strParentID = aLink.getAttribute("parentid");
			if(strParentID!=null)
			{
				var eleParentLI = document.getElementById("mi_" + strParentID);
				while(eleParentLI!=null)
				{
					var childUL = document.getElementById(eleParentLI.getAttribute('ulid'));
					if(childUL)
					{
						childUL.className="childrenvisible";
						eleParentLI.className="withchildunselected";

					}
					//-- check if a subgroup if so show parent
					eleParentLI = document.getElementById("mi_" + eleParentLI.getAttribute('parentid'));
				}
			}
		
			//-- 04.10.2008 - check if passed in callref if so load its detail page
			if(intViewCallref!="")
			{
				app.open_call_detail(intViewCallref,null,true);
			}

			if(strOnMenuSelected!=undefined)
			{
				var strFunction  =strOnMenuSelected;
				eval(strFunction);
			}
		}
	}

	//-- handle resizing of window for style on IE
	//resize_portal();
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
			oImg.src="img/icons/" + strColour + "_expand.gif"
		}
		else
		{
			oEle.setAttribute("expanded","1");
			oEle.style.display="inline";
			oImg.src="img/icons/" + strColour + "_contract.gif"
		}
	}
}




//-- submit a call form

//-- nwj - 14.07.2008
var MIN_PROFILE_LEVELS = -1; //-- min number of profile levels we need customer to select
function submit_form(strFormID, oDoc)
{
	if(oDoc==undefined)oDoc=document;
	var oForm = oDoc.getElementById(strFormID);
	if(oForm!=null)
	{
		//-- if we have a profile code field then check minimum level
		var spProfile = oDoc.getElementById('span_profilecodedesc');
		if(spProfile!=null)
		{

			var arrLevels = getElementText(spProfile).split("->");
			if(arrLevels.length<MIN_PROFILE_LEVELS)
			{
				alert("Please select at least 2 profile levels before submitting your request.");
				return false;
			}
		}

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
		
		var strResult = app.run_php(strURL,true);	//-- 80669 - use post

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
	for(i=0; i<oForm.elements.length; i++)
	{
		//-- dont clear hidden
		var eleType = oForm.elements[i].getAttribute("type")
		if (eleType.toLowerCase()!="hidden")
		{
			oForm.elements[i].value="";
			//-- 15.02.2008 - nwj - only set att to blank if it already exists
			var oAtt = oForm.elements[i].getAttribute("dbvalue");
			if(oAtt!=null)oForm.elements[i].setAttribute("dbvalue","");

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
function get_form_url_data(oForm,arrElements)
{
	if(oForm==null)return "";
	//-- create url
	if(arrElements==undefined)
		arrElements = new Array();
	var strURL = "";
	var oEle;
	for(i=0; i<oForm.elements.length; i++)
	{
		oEle=oForm.elements[i];
		var strID = oEle.id;
		
		if(strID !="")
		{
			//-- if a checkbox and it is not checked then do not include
			if ((isCheckBox(oEle)) && (!oEle.checked)) continue;

			//-- see if we have a dbvalue
			//-- 26.02.2008 - encode url data bug ref 66541 - 18.0.8.2009 br : 80069 - replace smart quotes
			strValue = pfu(getEleValue(oEle));

			if(strValue!="||--do not use--||") //-- on only use value if ok (part of radio type check)
			{
				//-- check if element is mandatory (class = mandatory)
				if((oEle.className=="mandatory")&&(strValue==""))
				{
					alert("A mandatory field on the form has not been completed. Please complete all mandatory fields and re-submit.");
					return false;
				}

				//-- used for cat service requests
				var strPrefix = oEle.getAttribute("prefixq");
				if((strPrefix!=null)&&(strPrefix!=""))
				{
					 strValue = pfu(strPrefix) + " : " + strValue;
				}

				if((arrElements[strID]) && (strID=="updatedb.updatetxt"))
				{
					arrElements[strID] += pfu("\n");
					arrElements[strID] += strValue;
				}
				else
				{
					
					arrElements[strID] = strValue;
				}
			}

		}
	}

	for(strID in arrElements)
	{
		if(strURL != "")strURL += "&";
		strURL+=strID + "=" + arrElements[strID];
	}

	return strURL;
}


function openWin(theURL,winName,features) 
{
	//-- check if using post - if so we can split features to get height and width 
	strAddInfo = "";
	if(app.boolUsePostWindows)
	{
		var arrFeatures = features.split(",");
		for(var x=0;x<arrFeatures.length;x++)
		{
			var arrFeature = arrFeatures[x].split("=");
			if(arrFeature[0].toLowerCase()=="height")
			{
				var intHeight = new Number(arrFeature[1]) + 100;
				strAddInfo += "&winheight=" + intHeight;
			}
			if(arrFeature[0].toLowerCase()=="width")  strAddInfo += "&winwidth="+arrFeature[1];

		}
	}
	//-- nwj - encode url when opening new window
	var strURL = theURL;
	var intQpos  = theURL.indexOf("?");// theURL.split("?");
	if(intQpos>-1)
	{
		strURL = theURL.substring(0,intQpos);
        //-- encode the params - common.php deals with decoding them
		var strParams = theURL.substring(intQpos+1,theURL.length);
		var strEncodedParams = "?ied=" + B64.encode(strParams);
		strURL += strEncodedParams
		if(app.boolUsePostWindows) strURL +=strAddInfo;
	}
	else
	{	//-- no ?
		if(app.boolUsePostWindows) strURL += "?a=" + strAddInfo;
	}

	var newWin = null;
	if(app.boolUsePostWindows)
	{
		//--
		//-- NWJ - 29.07.2009 - submit using form - so url is hidden
		var oMainForm = app.create_submit_form(strURL, "_new", document, "POST");
		oMainForm.submit();
		destroy_submit_form(oMainForm);
	}
	else
	{
		newWin = window.open(strURL,winName,features);
	}
	return newWin;
}


function cancelEventBubble(e)
{
	//-- now cancel bubbling
	if (!e) var e = window.event; //-- ie
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;

}

//-- close date
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
	if(oDiv!=null)oDiv.style['display']='none';
	if(oIF!=null)oIF.style['display']='none';
}

//-- given an event get the source element
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
function get_parent_owner_by_tag(oEle, strTag,boolExcludeStartEle)
{
	//-- nwj - 21.07.2009
	if(boolExcludeStartEle==undefined)boolExcludeStartEle=false;
	if(!boolExcludeStartEle)
	{
		if (oEle.tagName==strTag) return oEle;
	}

	if (oEle.parentNode)
	{
		return get_parent_owner_by_tag(oEle.parentNode, strTag, false);
	}
	return false;
}

//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by tag (TABLE / TR / DIV / BODY etc)
function get_child_by_tag(oEle, strTag)
{
	if (oEle==null) return null;
	try
	{
		if (oEle.tagName==strTag) return oEle;
	}catch(e){}

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		try
		{
			if (oEle.childNodes[x].tagName==strTag) return oEle.childNodes[x];
		}catch(e){}
		var testEle = get_child_by_tag(oEle.childNodes[x],strTag)
		if(testEle!=null)
		{
			return testEle;
		}
	}
	return null;
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
//-- return parent child identified by att 
function get_child_by_att_value(oEle, strAtt, strValue)
{
	if (oEle==null) return null;
	try
	{
		if (oEle.getAttribute(strAtt)==strValue) return oEle;
	}catch(e){}

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		try
		{
			if (oEle.childNodes[x].getAttribute(strAtt)==strValue) return oEle.childNodes[x];
		}catch(e){}
		var testEle = get_child_by_att_value(oEle.childNodes[x],strAtt, strValue)
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}


//-- 16.02.2006 - NWJ
//-- return parent child identified by att 
//-- 28.04.2009 - NWJ
//-- return array children of parent by class
var g_children_by_att = new Array();
function get_children_by_att_value(oEle, strAtt, strValue)
{
	g_children_by_att = new Array();
	process_get_children_by_att_value(oEle, strAtt, strValue);
	return g_children_by_att;
}

function process_get_children_by_att_value(oEle, strAtt, strValue)
{
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		try
		{
			if (oEle.childNodes[x].getAttribute(strAtt)==strValue) g_children_by_att[g_children_by_att.length++] = oEle.childNodes[x];
		}catch(e){}

		process_get_children_by_att_value(oEle.childNodes[x],strAtt, strValue)

	}

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


//-- 28.04.2009 - NWJ
//-- return parent owner of an element identified by class
function get_parent_owner_by_class(oEle, strClass)
{
	if (oEle.className==strClass) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_class(oEle.parentNode, strClass);
	}
	return null;
}


//-- 28.04.2009 - NWJ
//-- return first child of parent by class
function get_parent_child_by_class(oEle, strClass)
{
	if (oEle==null) return null;
	if (oEle.className==strClass) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].id==strClass)return oEle.childNodes[x];
		var testEle = get_parent_child_by_id(oEle.childNodes[x], strClass);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}

//-- 28.04.2009 - NWJ
//-- return array children of parent by class
var g_children_by_class = new Array();
function get_parent_children_by_class(oEle, strClass)
{
	g_children_by_class = new Array();
	process_get_parent_children_by_class(oEle, strClass);
	return g_children_by_class;
}
function process_get_parent_children_by_class(oEle, strClass)
{
	if (oEle==null) return;
	if (oEle.className==strClass) g_children_by_class[g_children_by_class.length++] = oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		process_get_parent_children_by_class(oEle.childNodes[x], strClass);
	}
}

//-- 28.04.2009 - NWJ
//-- return array children of parent by name
var g_children_by_name = new Array();
function get_parent_children_by_name(oEle, strName)
{
	g_children_by_name = new Array();
	process_get_parent_children_by_name(oEle, strName);
	return g_children_by_name;
}
function process_get_parent_children_by_name(oEle, strName)
{
	if (oEle==null) return;
	if (oEle.name==strName) g_children_by_name[g_children_by_name.length++] = oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		process_get_parent_children_by_name(oEle.childNodes[x], strName);
	}
}

function get_next_sibling(aObj)
{
	var origObj = aObj;
	do 
	{
		aObj = aObj.nextSibling; 
	}while (aObj && aObj.nodeType != 1); 

	if(origObj == aObj) return null;
	return aObj; 
}

function get_prev_sibling(aObj)
{
	var origObj = aObj;
	do 
	{
		aObj = aObj.previousSibling; 
	}while (aObj && aObj.nodeType != 1); 

	if(origObj == aObj) return null;
	return aObj; 
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

function isCheckBox(oEle)
{
	var strTag = oEle.tagName;
	var strType = oEle.getAttribute("type");
	return ((strTag=="INPUT")&&((strType.toLowerCase()=="radio") || (strType.toLowerCase()=="checkbox") ))
}

//--
//-- setting and getting element values
function getEleValue(oEle)
{
	var strTag = oEle.tagName;

	switch (strTag)
	{
		case "INPUT":
			var strType = oEle.type;
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
			//-- check if multiple
			if(oEle.getAttribute('multiple')=='multiple')
			{
				var strRet = "";
				for(var x=0;x<oEle.options.length;x++)
				{
					if(oEle.options[x].selected)
					{
						if(strRet !="")strRet +=",";
						strRet += oEle.options[x].value;
					}
				}
			}
			else
			{
				return oEle.options[oEle.selectedIndex].value;
			}
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

//-- clone a table row to another table
function clone_table_row(aTR,aTable)
{
  var newNode = aTR.cloneNode(true);
  var tBody = aTable.getElementsByTagName('tbody')[0];
  tBody.appendChild(newNode);
  return newNode;
}

//-- delete a table row
function delete_table_row(aTR)
{
	aTR.parentNode.removeChild(aTR);
	//var i=aTR.parentNode.parentNode.rowIndex;
	//aTR.parentNode.parentNode.deleteRow(i);
}

//-- round a number
function round_by(inNum,intPlaces)
{
	inNum=Math.round(inNum*100)/100;
	return inNum;
}

//-- trim functions
function trim(stringToTrim) 
{
        return stringToTrim.replace(/^\s+|\s+$/g,"");
}
function ltrim(stringToTrim) 
{
        return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) 
{
        return stringToTrim.replace(/\s+$/,"");
}

//-- converts a value to money #####.##
function convert_to_money(inValue)
{
	inValue = new Number(inValue);
	if (isNaN(inValue))
	{
		return "0.00";
	}
	else
	{
		//-- make sure a positive number
		if (inValue < 0) return  "0.00";
		if (inValue == 0) return "0.00";

		inValue=Math.round(inValue*100)/100  //returns 2 decimal places
		inValue = new String(inValue);
		var strLen = inValue.length;
		var dotpos = inValue.indexOf(".");
		if (dotpos != -1)
		{
			//-- split by "."
			var tmpArray = inValue.split(".");
			if (tmpArray.length > 2)
			{
				//-- too many dots
				return "0.00";
			}
			else
			{
				//--
				var pounds = tmpArray[0];
				var pence = tmpArray[1];
				if (pence > 99)
				{
					return "0.00";
				}
				
				if ((pence < 10) && (pence.length < 2)) pence += "0"; 
				return pounds + "." + pence;
			}
		}
		else
		{
			//-- there is no "."
			//-- so add ".00"
			return inValue + ".00";
		}
	}
}


//-- for handling customer feedback rating
window.document.onclick = check_popup_date;

//-- hide inline frame and reshow content
function hide_inlineframe()
{
    var oContentFrameDiv = document.getElementById('contentColumnIframe');
    var oFrame = document.getElementById('inline-frame');
    if((oFrame!=null)&&(oContentFrameDiv!=null))
    {
        oContentFrameDiv.style.display="none";
        oFrame.style.display="none";
        var contentDiv = document.getElementById("contentColumn");
        if(contentDiv!=null)
        {
            contentDiv.style.display="";
        }
    }
}

//-- show inline frame and hide content div
function show_inlineframe(strURL)
{
    var oContentFrameDiv = document.getElementById('contentColumnIframe');
    var oFrame = document.getElementById('inline-frame');
    if((oFrame!=null)&&(oContentFrameDiv!=null))
    {
        var contentDiv = document.getElementById("contentColumn");
        if(contentDiv!=null)
        {
            oContentFrameDiv.style.display="inline";
            oFrame.style.display="inline";
            oFrame.style.width = (contentDiv.offsetWidth - 10) + "px";
            if(oFrame.offsetHeight < contentDiv.offsetHeight)oFrame.style.height = (contentDiv.offsetHeight + 10) + "px";
            contentDiv.style.display="none";

            if((strURL!="") &&(strURL!=undefined))
            {
                oFrame.src= strURL;
                resize_inlineframe(); //-- set frame height to match that of frame content
            }
        }
    }
}

//-- get document height of catalog iframe actual document and then
//-- resize the iframe to match (therefore should never get scrollbar)
function resize_inlineframe()
{
        var eleContent = document.getElementById("inline-frame");
        var lastURL = eleContent.getAttribute("lasturl");

        if(eleContent.src.indexOf(lastURL)==-1)
        {
            setTimeout("action_frameresize()",350);
        }
}

function action_frameresize()
{
        var eleContent = document.getElementById("inline-frame");
        var intContentHeight = frames['inline-frame'].document.body.scrollHeight;
        eleContent.style.height = intContentHeight + 25 + "px";
        eleContent.setAttribute("lasturl",eleContent.src);
}
//--

//-- defect 80069 - replace smart quotes
function replaceSQ(strValue)
{
	strValue = string_replace(strValue,"“",'"',true);
	strValue = string_replace(strValue,"”",'"',true);
	strValue = string_replace(strValue,"‘","'",true);
	strValue = string_replace(strValue,"’","'",true);
	return strValue;
}

//-- call function to prepare data for url
function pfu(strVal)
{
	return encodeURIComponent(replaceSQ(strVal));
}

function returnfalse()
{
	return false;
}

//-- load a fusion chart into a given div
function load_chart(strDivID, strType, strDataXML, strPageXML)
{
	if(strPageXML==undefined)strPageXML = "np_";
	var strUID = strPageXML+"_"+strDivID;

	//-- get body with and height
	var oDiv = document.getElementById(strDivID);
	if(oDiv!=null)
	{
		if(FusionCharts.items[strUID]==undefined)
		{
			
			var myChart = new FusionCharts("../../fce/"+strType+".swf", strUID, oDiv.offsetWidth, oDiv.offsetHeight);
			myChart.autoInstallRedirect = false; //-- switch off alert box
			myChart.setDataXML(strDataXML);
			if(!myChart.render(strDivID)) //-- check if failed to render
			{
				//-- show link in div
				oDiv.innerHTML = "Failed to load chart"
			}
		}
		else
		{
			
			
			//-- Else the object is set to set the new width that will be beign called by resize_charts()
			var myChart1 = FusionCharts(strUID);
			myChart1.dispose();
			var myChart1 = new FusionCharts("../../fce/"+strType+".swf", strUID, oDiv.offsetWidth, oDiv.offsetHeight);
			myChart1.width = oDiv.clientWidth;
			myChart1.autoInstallRedirect = false; //-- switch off alert box
			myChart1.setDataXML(strDataXML);
			if(!myChart1.render(strDivID)) //-- check if failed to render
			{
				//-- show link in div
				oDiv.innerHTML = "Failed to load chart"
			}
		}
	}
}

//-- DJH - 10.12.2009
//-- Workaround for onResize hanging issue on IE
function resize_portal() 
{  
	document.event.remove( this, "resize", resize_portal);  
	window.location=window.location;
	document.event.add( this, "resize", resize_portal);
}
