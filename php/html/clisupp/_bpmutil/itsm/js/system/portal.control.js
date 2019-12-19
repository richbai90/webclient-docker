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
}

function load_content(strURL)
{
	hide_popups();
	var strResult = app.run_php(strURL,true);
	display_content(strResult);
}

function load_actions(strURL)
{
	hide_popups();

	var strResult = app.run_php(strURL,true);
	display_actions(strResult);
}

//--
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

		
		//-- load content and actions - we reset page so stored in cache
		var strContentPHP = aLink.getAttribute('phpcontent');
		var strActionPHP = aLink.getAttribute('phpactions');
//		document.location.href = "index.php?link=" + B64.encode(aLink.id) + "&phpcontent="+B64.encode(strContentPHP)+"&phpactions="+B64.encode(strActionPHP);
		document.getElementById('goLocation').href = "index.php?link=" + B64.encode(aLink.id) + "&phpcontent="+B64.encode(strContentPHP)+"&phpactions="+B64.encode(strActionPHP);
		//document.getElementById('goLocation').click();
		//-- Support for Chrome and FF
		var href = $('#goLocation').attr('href');
		window.location.href = href;
	}
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
		if(aLink!=null)	
		{
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
			//--		
			//-- 04.10.2008 - check if passed in callref if so load its detail page
			if(intViewCallref!="")
			{
				app.open_call_detail(intViewCallref,null,true);
			}

		}
	}
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
		
		var strResult = app.run_php(strURL,true);

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
function get_form_url_data(oForm)
{
	if(oForm==null)return "";
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
			//-- if a checkbox and it is not checked then do not include
			if ((isCheckBox(oEle)) && (!oEle.checked)) continue;


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
			//-- 26.02.2008 - encode url data bug ref 66541
			strValue = getEleValue(oEle);

			if(strValue!="||--do not use--||") //-- on only use value if ok (part of radio type check)
			{
				strValue = encodeURIComponent(strValue);
				//-- check if element is mandatory (class = mandatory)
				if((oEle.className=="mandatory")&&(strValue==""))
				{
					alert("A mandatory field on the form has not been completed. Please complete all mandatory fields and re-submit.");
					return false;
				}

				strURL+=useID + "=" + strValue;

				arrElements[strID]++;
			}

		}
	}
	//alert(strURL)
	return strURL;
}

function openWin(theURL,winName,features) 
{
	//alert(theURL)
	newWin = window.open(theURL,winName,features);
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
	return ((strTag=="INPUT")&&(strType.toLowerCase()=="radio"))
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

function file_action(strAction, strFileName)
{
	if(strAction=="delete")
	{
		var strDisplayName = strFileName.substr(strFileName.indexOf('/')+1);
		 if(confirm("Are you sure you want to delete the file '"+strDisplayName+"'?")) {

		  }
		  else
			  return false;
	}
	var oEle = document.getElementById('action');
	oEle.value = strAction;
	var oEle = document.getElementById('filename');
	oEle.value = strFileName;
	fileloader.submit();
}

function checkFileType()
{
    var fname = document.getElementById("afile").value;
	if(fname=="")
	{
		alert('Please select a file before attempting to upload.');
		return false;
	}
    var parts = fname.split('.');
    var ext = parts[parts.length - 1];
    // check if fname has the desired extension
    if (ext=="xml") {
        return true;
    } else {
		alert('XML files are the only supported format, please select another file.');
        return false;
    }
}

//-- for handling customer feedback rating
window.document.onclick = check_popup_date;