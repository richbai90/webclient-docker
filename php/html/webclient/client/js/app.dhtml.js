var undefined;
var _XML_TEXT_NODE = 3;
var isIE  = (window.ActiveXObject);

var TEXTBOX		= "textbox";
var DATEBOX		= "datebox";
var COMBOBOX	= "combobox";
var BUTTON		= "button";
var MNUBUTTON	= "mnubutton";
var RADIOBOX	= "radiobox";
var FORMFLAG	= "formflag";
var TEXTAREA	= "textarea";
var LABEL		= "label";
var IMAGE		= "image";
var DIVFRAME	= "divframe";
var TABCONTROL	= "tabcontrol";
var SQLLIST 	= "sqllist";
var FILELIST 	= "filelist";
var SQLLISTCOL 	= "sqllistcol";
var FILELISTCOL = "filelistcol";
var FILEUP		= "fileupload";

function jqueryify(element,docLevel)
{
	if(docLevel)return $(element,docLevel);
	else return $(element);
	
}

function get_style(element,strStyleName)
{
	//-- convert to readable style
	var strStyleName = top.toStyleCase(strStyleName);
	var value = element.style[strStyleName];

	if(!value)
	{
		if(document.defaultView)
		{
			value = document.defaultView.getComputedStyle(element, "").getPropertyValue(strStyleName);
		}
		else if(element.currentStyle)
		{
			value = element.currentStyle[strStyleName];
		}
	}

	var retValue = new String(value);
	if (retValue.indexOf("px")!=-1) retValue = top.strreplace(retValue,"px","",true);

	//-- return style value (remove any px from value)
	return retValue;
}


function hasClass(element,strClass) {
    return element.className.match(new RegExp('(\\s|^)'+strClass+'(\\s|$)'));
}

function addClass(element,strClass) {
    if (!hasClass(element,strClass)) element.className += " "+strClass;
}

function removeClass(element,cls) {
    if (hasClass(element,strClass)) {
        var reg = new RegExp('(\\s|^)'+strClass+'(\\s|$)');
        element.className=element.className.replace(reg,' ');
    }
}


function gn(oParent,strName)
{
	var arrChildren = new Array();
	for (var x=0;x< oParent.children.length;x++)
	{
		aChild = oParent.children[x];
		if (aChild.name == strName) arrChildren[arrChildren.length++] = aChild;
	}
	return arrChildren;
}

//-- Converts string input to a camel cased version of itself.
//-- For example:	toStyleCase("z-index"); returns "zIndex"
//--				toStyleCase("border-bottom-style"); returns "borderBottomStyle"
function toStyleCase(s) 
{
	for(var exp = toStyleCase.exp; exp.test(s); s = s.replace(exp, RegExp.$1.toUpperCase()) );
	return s;
}
toStyleCase.exp = /-([a-z])/;

function _print_url(strURL)
{
	var aWin = null;
	if(app._CURRENT_JS_WINDOW!=null)
	{
		aWin = app._CURRENT_JS_WINDOW.open(strURL,"","width=800,height=600,top=5,left=5,location=0,status=0,resizable=1,scrollbars=1,menubar=0");
	}
	else
	{
		aWin = window.open(strURL,"","width=800,height=600,top=5,left=5,location=0,status=0,resizable=1,scrollbars=1,menubar=0");
	}
}

//--
//-- given a string parse out any js variables
var VAR_START = "@@";
var VAR_END = "@@";
function parsejsstr(strParse)
{

	if(strParse==undefined)return "";
	var startPos = strParse.indexOf(VAR_START);
	
	while (startPos != -1)
	{
		cutString = strParse.substring(startPos,strParse.length);
		endPos = cutString.indexOf(VAR_END,2);
	
		strFullVariable = cutString.substring(0,endPos+2);
		strValVariable = cutString.substring(2,endPos);
		strActualValue = eval(strValVariable);
		strParse = string_replace(strParse, strFullVariable,strActualValue,true);
		
		startPos = strParse.indexOf(VAR_START);
	}
	return strParse;
}

//-- string replace
function string_replace(strText,strFind,strReplace,boolGlobalreplace)
{
	if (strText==undefined) return "";
	if (!isNaN(strText)) return strText;

	if(strFind==".")
	{
		if(boolGlobalreplace)
			var useregex =/[.\s]+/g;
		else
			var useregex =/[.\s]+/;
			
		return strText.replace(useregex, strReplace);
	}
	//-- replace all occs of strFind and ignore case (gi)
	var flags = (boolGlobalreplace)?"gi":"i";
	try
	{
		//-- IE 6 issue with smart quotes
		var rExp = new RegExp(strFind,flags);
		return strText.replace(rExp, strReplace);
	}
	catch(e)
	{
		return strText;
	}
}
//--

//-- return an elements document
function getEleDoc(ele)
{
	var aDoc = ele.document;
	if((aDoc!=undefined)) return aDoc;

    while (ele && ele.nodeType!= 9) ele= ele.parentNode;
    return ele;
}

//-- get document element return object or null
function ge(strID, aDoc)
{
	if(aDoc==undefined)aDoc=document;
	return document.getElementById(strID);
}

//-- set innert text and textContent (mozilla etc)
function setElementText(oEle,strText)
{
	if(oEle==null)return;
	oEle.innerText = oEle.textContent = strText;
}

function getElementText(oEle)
{
	if(oEle==null)return;
	if(oEle.textContent)return oEle.textContent; //-- mozilla etc
	if(oEle.innerText)return oEle.innerText;
}



function toggleDisabled (el, boolDisable) 
{
	if(boolDisable==undefined)boolDisable=true;
	try 
	{
		el.disabled = boolDisable;                
		//el.setAttribute("wcdisabled",boolDisable);
	}
	catch(e){}


	//if (el.childNodes && el.childNodes.length > 0) 
	//{
	//	for (var x = 0; x < el.childNodes.length; x++) 
	//	{
	//		toggleDisabled(el.childNodes[x],boolDisable);                    
	//	}
	//}

}



function toggleReadOnly(el, boolDisable) 
{
	if(boolDisable==undefined)boolDisable=true;
	try 
	{
		el.readOnly = boolDisable;                
	}
	catch(e){}
	if (el.childNodes && el.childNodes.length > 0) 
	{
		for (var x = 0; x < el.childNodes.length; x++) 
		{
			toggleReadOnly(el.childNodes[x],boolDisable);                    
		}
	}
}


//-- return frame
function getFrame(strFrameName, aDoc)
{
	if(aDoc==undefined)aDoc = document;
	f = aDoc.frames ? aDoc.frames[strFrameName] : aDoc.getElementById(strFrameName).contentWindow;
	return f;
}

//-- return frame document so can call function in it
function getFrameDoc(strFrameName, aDoc)
{
	var f = getFrame(strFrameName, aDoc);
	var d = f.document || f.contentWindow.document;
	return d;
}

//-- return frame document so can call function in it
function getoFrameDoc(f)
{
	var d = f.document || f.contentWindow.document;
	return d;
}


function has_scrollbar(oEle) 
{ 
   return (oEle.clientHeight < oEle.scrollHeight);
} 


//--
//-- return page size with or without scroll taking into consideration
function getPageSize(boolWithScroll,oDoc)
{     
	if(oDoc==undefined)oDoc = document;

	var win = window;

	var intWidth = 0;
	var intHeight = 0;

	if(boolWithScroll==undefined)boolWithScroll=false;
	if (win.innerHeight && win.scrollMaxY) 
	{
		//-- Firefox         
		var intScrollY = (boolWithScroll)?win.scrollMaxY:0;
		var intScrollX = (boolWithScroll)?win.scrollMaxX:0;
		intHeight = win.innerHeight + intScrollY;
		intWidth = win.innerWidth + intScrollX;     
	} 
    if (oDoc.body.scrollHeight > oDoc.body.offsetHeight)
	{ 
		//-- all but Explorer Mac         
		if(boolWithScroll)
		{
			intHeight = oDoc.body.scrollHeight;         
			intWidth = oDoc.body.scrollWidth;     
		}
		else
		{
			intHeight = oDoc.body.offsetHeight;         
			intWidth = oDoc.body.offsetWidth;       
		}
	} 
	else 
	{ 
		//-- works in Explorer 6 Strict, Mozilla (not FF) and Safari         
		intHeight = oDoc.body.offsetHeight;         
		intWidth = oDoc.body.offsetWidth;       
	}     
	
	var info = new Object();
	info.width = intWidth;
	info.height = intHeight;
	return info;
} 

function addEvent( obj, type, fn ) 
{
	if ( obj.attachEvent ) 
	{
		obj['e'+type+fn] = fn;
	    obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
		obj.attachEvent( 'on'+type, obj[type+fn] );
	}
	else
	{
		obj.addEventListener( type, fn, false );
	}
}
function removeEvent( obj, type, fn ) {
	try
	{
	  if ( obj.detachEvent ) {
		obj.detachEvent( 'on'+type, obj[type+fn] );
		obj[type+fn] = null;
	  } else
		obj.removeEventListener( type, fn, false );
		
	}
	catch (e)
	{
	}
}

function getEvent(anE,aWin)
{
	if(aWin==undefined)aWin=window;
	if((anE==null)||(anE==undefined))anE = aWin.event;
	return anE;
}


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


//-- get elemen that mouse vent came from
function getMouseFromElement(e) 
{
	if (!e) var e = window.event;
	var relTarg = e.relatedTarget || e.fromElement;
	return relTarg;
}

//-- get element that mouse event is going to
function getMouseToElement(e) 
{
	if (!e) var e = window.event;
	var relTarg = e.relatedTarget || e.toElement;
	return relTarg;
}

//--
//-- get event source element
function getEventSourceElement(anE)
{
	if((anE==null)||(anE==undefined))anE = window.event;
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

//-- get event key press
function getKeyChar(intKeyCode) 
{
	return String.fromCharCode(intKeyCode);
}

//-- get event key press
function getKeyCode(anE) 
{
	if (anE.keyCode) 
	{
		var key = anE.keyCode;
	} 
	else 
	{
		var key = anE.charCode; //-- moz
	}
	
	return key;
}


//--
//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by tag (TABLE / TR / DIV / BODY etc)
function get_parent_owner_by_tag(oEle, strTag)
{
	if (oEle.parentNode)
	{
		if (oEle.parentNode.tagName==strTag) return oEle.parentNode;
		return get_parent_owner_by_tag(oEle.parentNode, strTag);
	}
	return null;
}

//- -get parent by class
function get_parent_owner_by_class(oEle, strClass)
{
	if (oEle.parentNode)
	{
		if (oEle.parentNode.className==strClass) return oEle.parentNode;
		return get_parent_owner_by_class(oEle.parentNode, strClass);
	}
	return null;
}


//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by att 
function get_parent_owner_by_att(oEle, strAtt)
{
	if(oEle.getAttribute==undefined)return null;

	if (oEle.getAttribute(strAtt)!=null) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_att(oEle.parentNode, strAtt);
	}
	return null;
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
	return null;
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
//-- return child of parent by name
function get_parent_child_by_name(oEle, strID)
{
	if (oEle==null) return null;
	if (oEle.id==strID) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].name==strID)return oEle.childNodes[x];
		var testEle = get_parent_child_by_name(oEle.childNodes[x], strID);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}



//-- 16.02.2006 - NWJ
//-- return child of parent by class
function get_parent_child_by_class(oEle, strID)
{
	if (oEle==null) return null;
	if (oEle.className==strID) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].className==strID)return oEle.childNodes[x];
		var testEle = get_parent_child_by_class(oEle.childNodes[x], strID);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}


//-- 16.02.2006 - NWJ
//-- return child of an element identified by tag (TABLE / TR / DIV / BODY etc)
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


//-- 28.04.2009 - NWJ
//-- return array children of parent by class
var g_children_by_att = new Array();
function get_children_by_att(oEle, strAtt, boolToplevelOnly)
{
	g_children_by_att = new Array();
	process_get_children_by_att(oEle, strAtt,boolToplevelOnly);
	return g_children_by_att;
}

function process_get_children_by_att(oEle, strAtt,boolToplevelOnly)
{
	if(boolToplevelOnly==undefined)boolToplevel=false;
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].getAttribute==undefined)continue;

		try
		{
			var strAttVal = oEle.childNodes[x].getAttribute(strAtt);
			if (strAttVal!=null) g_children_by_att[g_children_by_att.length++] = oEle.childNodes[x];
		}catch(e){}

		//-- if we want all children then process
		if(!boolToplevelOnly)process_get_children_by_att(oEle.childNodes[x],strAtt);

	}
}


//-- 28.04.2009 - NWJ
//-- return array children of parent by class
var g_children_by_att = new Array();
function get_children_by_att_value(oEle, strAtt, strValue,boolToplevelOnly)
{
	g_children_by_att = new Array();
	strValue=strValue+"";
	process_get_children_by_att_value(oEle, strAtt, strValue.toLowerCase(),boolToplevelOnly);
	return g_children_by_att;
}

function process_get_children_by_att_value(oEle, strAtt, strValue,boolToplevelOnly)
{
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].getAttribute==undefined)continue;
		try
		{
			if (oEle.childNodes[x].getAttribute(strAtt)==strValue)
			{
				g_children_by_att[g_children_by_att.length++] = oEle.childNodes[x];
			}
		}catch(e){}

		//-- if we want all children then process
		if(!boolToplevelOnly)
		{
			process_get_children_by_att_value(oEle.childNodes[x],strAtt, strValue,boolToplevelOnly);
		}
	}

}

//-- 28.04.2009 - NWJ
//-- return array children of parent by tagname
var g_children_by_tag = new Array();
function get_children_by_tag(oEle, strTag,boolToplevelOnly)
{
	g_children_by_tag = new Array();
	process_get_children_by_tag(oEle, strTag,boolToplevelOnly);
	return g_children_by_tag;
}

function process_get_children_by_tag(oEle, strTag,boolToplevelOnly)
{
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		try
		{
			if (oEle.childNodes[x].tagName==strTag)
			{
				g_children_by_tag[g_children_by_tag.length++] = oEle.childNodes[x];
			}
		}catch(e){}

		//-- if we want all children then process
		if(!boolToplevelOnly)
		{
			process_get_children_by_tag(oEle.childNodes[x],strTag,boolToplevelOnly);
		}
	}

}

function removeChildNodes(ctrl)
{  
	while (ctrl.childNodes[0])  
	{    
		ctrl.removeChild(ctrl.childNodes[0]);  
	}
}


//-- Creates and returns element from html chunk
function toElement(d,html)
{
	var div = d.createElement('div');
	div.innerHTML = html;
	var el = div.childNodes[0];
	div.removeChild(el);
	return el;
}


//-- 04.06.2004 - NWJ - given node and html insert that html into the node (used for creating elements)
function insertBeforeEnd(node,html)
{

	if(node.insertAdjacentHTML)
	{
		node.insertAdjacentHTML('beforeEnd', html);		
	}
	else
	{
		//--
		//-- netscape way of inserting html ()
		var r = node.ownerDocument.createRange();
		r.setStartBefore(node);
		var parsedHTML = r.createContextualFragment(html);
		node.appendChild(parsedHTML);
	}

	return node.lastChild;
}


//--
//-- get element true position regardless of positioning type
function getRealPosition(obj) 
{
	var origObj = obj;
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
	origObj.realLeft = curleft;
	origObj.realTop = curtop;
	return origObj;
}

//-- Determines if the passed element is overflowing its bounds, 
function isOverflowing(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var bOverflowing = el.offsetWidth < el.scrollWidth || el.offsetHeight < el.scrollHeight; 
   el.style.overflow = curOverflow; 
 
   return bOverflowing; 
} 

//-- 
function isWidthOverflowing(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var bOverflowing = el.offsetWidth < el.scrollWidth; 
  // alert(el.offsetWidth +" < "+ el.scrollWidth )
   el.style.overflow = curOverflow; 
    return bOverflowing; 
} 

//-- 
function isHeightOverflowing(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var bOverflowing = el.offsetHeight < el.scrollHeight; 
   el.style.overflow = curOverflow; 
   return bOverflowing; 
} 

function getOverflowWH(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var intWidth = (el.offsetWidth - el.scrollWidth); 
   var intHeight = (el.offsetHeight - el.scrollHeight); 

   el.style.overflow = curOverflow; 
   var a = new Object();
   a.width= intWidth;
   a.height = intHeight;
   return a;

}

function getOverflowWidth(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var intWidth = (el.scrollWidth-el.offsetWidth); 

   el.style.overflow = curOverflow; 
   return intWidth;
} 

function getOverflowHeight(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var intHeight = (el.scrollHeight-el.offsetHeight); 

   el.style.overflow = curOverflow; 
   return intHeight;
} 

function eleTop(obj) 
{
	var curtop = 0;
	if (obj.offsetParent) 
	{
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) 
		{
			curtop += obj.offsetTop;
		}
	}
	curtop--;curtop++;
	return  curtop;
}


function eleHeight(obj)
{
	if(obj.clientHeight)return obj.clientHeight;
	return obj.offsetHeight;
}

function eleLeft(obj) 
{
	var curleft = 0;
	if (obj.offsetParent) 
	{
		curleft = obj.offsetLeft
		while (obj = obj.offsetParent) 
		{
			curleft += obj.offsetLeft
		}
	}
	curleft--;curleft++;
	return  curleft;
}


function boolMouseRightClick(e)
{
	if(e==undefined)return false;
	var rightclick = 0;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	return rightclick;
}

function boolMouseLeftClick(e)
{
	if(e==undefined)return false;
	var leftclick = 0;
	if (e.which) leftclick = (e.which == 0);
	else if (e.button) leftclick = (e.button == 1);
	return leftclick;
}


function findMousePos(oEv)
{
	if (!oEv) var oEv = window.event; //-- ie
	if(oEv==null)return[0,0];
	var posx = 0;
	var posy = 0;
	if (oEv.pageX || oEv.pageY) 	
	{
		var intLeft = oEv.pageX;
		var intTop = oEv.pageY;
	}
	else if (oEv.clientX || oEv.clientY) 	
	{
		var intLeft = oEv.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var intTop = oEv.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return [intLeft,intTop];
}

function disableSelection(target, boolChildren)
{
	if(target==null)return;
	if (typeof target.onselectstart!="undefined") //IE route
	{
		try{
		target.onselectstart=function(){return false}
		}catch(e){}
	}
	else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
	{
		target.style.MozUserSelect="none";
	}
	else //All other route (ie: Opera)
	{
		target.onmousedown=function(){return false}
	}
	//target.style.cursor = "default"
	if(boolChildren==undefined)boolChildren=false;
	if(boolChildren)
	{
		if (target.childNodes && target.childNodes.length > 0) 
		{
			for (var x = 0; x < target.childNodes.length; x++) 
			{
				disableSelection(target.childNodes[x],boolChildren);                    
			}
		}
	}
}

function _rf()
{
	return false;
}

function ev_target(e)
{
	if (!e) var e = window.event;
	var relTarg = e.relatedTarget || e.toElement;
	return relTarg;
}

function ev_source(e)
{
	var targ;
	if (!e) var e = window.event;
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;

	return targ;
}

function ev_coords(e)
{
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	
	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	
	{
		posx = e.clientX + document.body.scrollLeft	+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	return [posx,posy];
}

//-- find element pos
function findPos(obj) 
{
	var curleft = curtop = 0;
	if (obj.offsetParent) 
	{
		do 
		{
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

//-- find element pos
function getParentByTag(obj,strTag) 
{
	if (obj.offsetParent) 
	{
		do 
		{
			if ((obj.offsetParent)&&(obj.offsetParent.tagName == strTag))return obj.offsetParent;
		} while (obj = obj.offsetParent);
	}
	return null;
}


//-- call function to prepare data for url
function pfu(strVal)
{
	return encodeURIComponent(replaceSQ(strVal));
}

//-- defect 80069 - replace smart quotes
function replaceSQ(strValue)
{
	strValue = string_replace(strValue,"�",'"',true);
	strValue = string_replace(strValue,"�",'"',true);
	strValue = string_replace(strValue,"�","'",true);
	strValue = string_replace(strValue,"�","'",true);
	return strValue;
}

function getEleVisualValue(oEle)
{
	return getEleValue(oEle,true)
}
//-- setting and getting element values
function getEleValue(oEle,boolVisualOnly)
{
	if(boolVisualOnly==undefined)boolVisualOnly=false;
	var strTag = oEle.tagName;


	if(oEle.getAttribute("hint")==oEle.value)return "";

	var strFormType = oEle.getAttribute("formtype");
	switch (strTag)
	{
		case "INPUT":
			var strType = oEle.type;
			var strDBVal = (boolVisualOnly)?null:oEle.getAttribute("dbvalue");
			if(oEle.getAttribute("donotusedbvalue")=="true") strDBVal=null;

			switch (strType.toLowerCase())
			{
				case "hidden":
				case "input":
				case "text":
				case "password":

					return (strDBVal==null)?oEle.value:strDBVal;
				case "radio":
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
			if(oEle.getAttribute('multiple')==true)
			{
				var strRet = "";
				for(var x=0;x<oEle.options.length;x++)
				{
					if(oEle.options[x].selected)
					{
						if(strRet !="")strRet +=",";
						if(boolVisualOnly)
						{
							strRet += oEle.options[x].text;
						}
						else
						{
							strRet += oEle.options[x].value;
						}
					}
				}
				return strRet;
			}
			else
			{
				if(boolVisualOnly)
				{
					return oEle.options[oEle.selectedIndex].text;
				}
				else
				{
					return oEle.options[oEle.selectedIndex].value;
				}
			}
			break;
		case "TEXTAREA":
			return oEle.value;
			break;
		case "SPAN":
		case "DIV":
		case "P":
			if(oEle.getAttribute("formtype")==FORMFLAG)
			{
				var strDBVal = oEle.getAttribute("dbvalue");
				if(strDBVal!=null && strDBVal!="")return strDBVal; //-- form flags
				return 0;
			}
			return getElementText(oEle);
			break;
	}
	debug("app.dhtml.js : getEleValue - cannot get element value for tag " + strTag);
}


function isDecimal(value,min,max) 
{   //Accepts number with decimal but it must have at least the min and at most the max places after the decimal  

	if(min==undefined)min = 1;
	if(max==undefined)max = 2;

	var re = new RegExp("^-?\\d+\\.\\d{" + min + "," + max + "}?$");  
	return re.test(value);
}


var _application_labels = new Array();
function setEleValue(oEle,strValue,parseFilterDocument,elementVisualValue)
{
	var stime = new Date().getTime();
	app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype"),"setEleValue","START");

	var strTag = oEle.tagName;
	var strFormType = oEle.getAttribute("formtype");

	//-- set datebox display value
	if(strFormType=="datebox" && elementVisualValue==undefined)
	{
		if(strValue=="<multiple calls>")
		{
			oEle.setAttribute("dbvalue",0);
			oEle.value= strValue;
			var etime = new Date().getTime();
			var ms = etime-stime;
			app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype"),"setEleValue","COMPLETED");

			return;
		}
		else
		{
			var tmpV = strValue;
			tmpV--;tmpV++;
			if(isNaN(tmpV))
			{
				if(strValue!="")set_datebox_string_displayvalue(oEle,strValue,true);
			}
			else
			{
				if(strValue!="")set_datebox_epoch_displayvalue(oEle,strValue,true);
			}
			var etime = new Date().getTime();
			var ms = etime-stime;
			app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype"),"setEleValue","COMPLETED");
			 return;
		}
	}


	//-- means we need to store dbvalue and show visual value (ie. probcode fields)
	if(elementVisualValue!=undefined)
	{
		oEle.setAttribute("dbvalue",strValue);
		strValue = elementVisualValue;
	}
	else
	{
		//-- apply formatting
		if(oEle.swformat)
		{
			var res = oEle.swformat(oEle,strValue);
			if(res=="")
			{
				return;
			}
		}
	}

	//-- check if we have hint text if value is blank
	if(strValue=="")
	{
		var strHint = oEle.getAttribute("hint");
		if(strHint!=null && strHint!="")
		{
			strValue = strHint;
			var strColor=oEle.getAttribute("origcolor");
			if(strColor==null || strColor=="")
			{
				oEle.setAttribute("origcolor",oEle.style.color);
			}
			//-- change color so they know its hint
			oEle.style.color = "#808080";
		}
	}
	else
	{
		//-- reset color
		var strHint = oEle.getAttribute("hint");
		if(strHint!=null && strHint!="")
		{			
			var strColor=oEle.getAttribute("origcolor");
			if(strColor!=null)oEle.style.color = strColor;
		}
	}

	switch (strTag)
	{
		case "INPUT":
			var strType = oEle.type;
			switch (strType.toLowerCase())
			{
				case "hidden":
				case "input":
				case "text":
				case "password":
				case "radio":
					oEle.value=strValue;
					break;
				case "checkbox":
					var intFormFlag = oEle.getAttribute("flagvalue");
					if(intFormFlag!=null)
					{
						oEle.checked = (intFormFlag & strValue);
					}
					else
					{
						oEle.checked = strValue;
					}
					break;
			}			
			break;
		case "SELECT":
			break;
		case "TEXTAREA":
			oEle.value = strValue;
			break;
		case "SPAN":
		case "DIV":
		case "P":
			if(oEle.getAttribute("formtype")=='sqllistcol')
			{
				if(oEle.getAttribute("swautolabel")=="true")
				{
					//-- set label
					var strBinding = oEle.getAttribute("binding");
					if((strBinding!="") &&(strBinding!=null))
					{
						var strValue = get_label_from_binding(strBinding);
						setElementText(oEle,strValue);

						var etime = new Date().getTime();
						var ms = etime-stime;
						app.debug(oEle.id + ":" + oEle.tagName + " (autolabel) :" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");

						return;
					}
				}
				else
				{
					return;
				}

			}
			else if((oEle.getAttribute("formtype")==FORMFLAG))
			{
				app.set_form_flag_value(oEle, strValue)

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");


				return;
			}
			else
			{
				setElementText(oEle,strValue);

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");


				return;
			}
		case "LABEL":
			//-- if has binding get label value for binding
			var strBinding = oEle.getAttribute("binding");
			if((strBinding!="") &&(strBinding!=null))
			{
				var bParseValue = oEle.getAttribute("parsevalue")
				if(bParseValue=="true")
				{
					if(strBinding.indexOf("&[")==-1)strBinding = "&[" + strBinding + "]";
					var strValue = parseFilterDocument.parse_filter(strBinding,false,"");
				}
				else
				{
					var strValue = get_label_from_binding(strBinding);
				}

		
				setElementText(oEle,strValue);

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + " (parsed):" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");
			
				return;
			}
			else
			{

				 setElementText(oEle,strValue);

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + " (unparsed) :" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");

				return;
			}
			break;
	
	}

	var etime = new Date().getTime();
	var ms = etime-stime;
	app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype") + ":" + strValue + ":" + ms + "ms","setEleValue","COMPLETED");
}


function select_selectbox_value(oEle,strValue)
{
	//-- set by value
	for(var x=0;x<oEle.options.length;x++)
	{
		if(oEle.options[x].value == strValue || oEle.options[x].text == strValue)
		{
			oEle.selectedIndex=x;
			return true;
		}
	}
	return false;
}

function get_label_from_binding(strBinding)
{
	if(_application_labels[strBinding]!=undefined)
	{
		return _application_labels[strBinding];
	}
	else
	{
		//-- call xmlhttp to get label - and store in array so dont have to call again
		var strURL = app.get_service_url("ddf/getlabel","");
		var strParams = "binding=" + strBinding;
		var strLabelValue = app.get_http(strURL, strParams, true, false, null);
		_application_labels[strBinding] = strLabelValue;
		return strLabelValue;
	}
}

function stopEvent(e)
{
	if (!e) var e = window.event;
	if(e==undefined) return false;
	try
	{
		e.cancelBubble = true;
	}catch(e){}

	if (e.preventDefault) e.preventDefault();
	if (e.stopPropagation) e.stopPropagation();
	return false;
}

//--
//-- append session to a url
function _append_swsession(strURL)
{
	var strPrefix = (strURL.indexOf("&")>-1)?"&":"?";
	strURL += strPrefix + "sessid=" + app._swsessionid;
	return strURL;
}

//-- parse string
var __do_not_pfs_systemvars = new Array(); //-- items not to pfs
__do_not_pfs_systemvars['app._exclude_log_forms'] = true;
function _swc_parse_variablestring(strToParse,aDoc,boolPFS,boolFormat)
{
	if(strToParse==undefined) return strToParse;
	if(boolPFS==undefined)boolPFS=false;
	if(boolFormat==undefined)boolFormat=false;

	//-- cast
	strToParse = strToParse + "";

	var strPartOne = "";
	var strPartTwo = "";
	var strParseVar = "";
	var iStart = strToParse.indexOf("&[");
	var counter=0;
	while(iStart>-1)
	{
		counter++;
		if(counter>100)
		{
			alert("_swc_parse_variablestring : possible loop error. Please contact your Supportworks administrator")
			return strToParse;
		}
		strPartOne = strToParse.substring(iStart+2,strToParse.length);
		iEnd = strPartOne.indexOf("]");
		if(iEnd>-1)
		{
			strParseVar = strPartOne.substring(0,iEnd);

			var tempPFS = boolPFS;
			if(__do_not_pfs_systemvars[strParseVar]) tempPFS = false;

			var parsed = _get_context_var(strPartOne.substring(0,iEnd),aDoc, tempPFS,boolFormat)
			strToParse = strToParse.replace("&["+strParseVar+"]",parsed);
		}
		else{break;}

		iStart = strToParse.indexOf("&[");
	}

	return strToParse;
}

function _get_context_var(strVar,oDoc,boolPFS,boolFormat)
{
	if(boolPFS==undefined)boolPFS=false;
	if(boolFormat==undefined)boolFormat=false;
	var bDoc=true;
	if(oDoc==undefined)
	{
		bDoc=false;
		oDoc = top;
	}
	var arrVar = strVar.split(".");

	if( (oDoc[arrVar[0]]==undefined) || (oDoc[arrVar[0]][arrVar[1]]==undefined) )
	{
		if(bDoc)
		{
			if(top[arrVar[0]]==undefined)
			{
				return strValue;
			}
			else
			{
				var strValue = top[arrVar[0]][arrVar[1]];
			}
		}
	}
	else
	{
			var strValue = oDoc[arrVar[0]][arrVar[1]];
	}

	//-- if something like opencall.callref or opencall.status
	if(boolFormat)
	{
		//-- if coming from a form doc see if we have formatted data to hand
		if(oDoc && oDoc._tables && oDoc._tables[arrVar[0]] && oDoc._tables[arrVar[0]]._columns &&  oDoc._tables[arrVar[0]]._columns[arrVar[1]])
		{
			return oDoc._tables[arrVar[0]]._columns[arrVar[1]].displayvalue;
		}
		else if(app.dd.tables[arrVar[0]] && app.dd.tables[arrVar[0]].columns[arrVar[1]])
		{
			strValue = app.dd.tables[arrVar[0]].columns[arrVar[1]].FormatValue(strValue);
		}
	}

	if(boolPFS) strValue = PrepareForSql(strValue);
	return strValue;
}

//-- return html element text
function eleText(obj)
{
	var strRet = (obj.innerText) ? obj.innerText : (obj.textContent) ? obj.textContent : ""; 
	return app.trim(strRet);
}


//-- XML BASED FUNCTIONS

//-- return text from xml node
function xmlText(oNode)
{
	if(oNode==null)return "";

	if(oNode.text)return oNode.text;
    if(typeof(oNode.textContent) != "undefined") return oNode.textContent;  
	if(oNode.nodeValue && oNode.nodeValue!="") return oNode.nodeValue;
	if(oNode.firstChild) 
	{
		return oNode.firstChild.nodeValue;
	}
	
	return "";
}


function getXmlNodeById(oXML, strID)
{
	return getXmlNodeByAtt(oXML, "id", strID);
}

function getXmlNodeByAtt(oXML, strAtt, strValue)
{
	if(oXML==null) return null;
	for (var i=0;i<oXML.childNodes.length;i++)
	{
		if(oXML.childNodes[i].nodeType!=_XML_TEXT_NODE)		
		{
			var strAttValue = oXML.childNodes[i].getAttribute(strAtt);
			//-- alert(strAtt + " : " + strAttValue)
			if(strAttValue==strValue)
			{
				return oXML.childNodes[i];
			}
			else
			{
				var oNode = getXmlNodeByAtt(oXML.childNodes[i], strAtt, strValue);
				if(oNode!=null)return oNode;
			}
		}
		else
		{
			var oNode = getXmlNodeByAtt(oXML.childNodes[i], strAtt, strValue);
			if(oNode!=null)return oNode;
		}
	}	

	return null;
}


function xmlNodeTextByTag(oXMLNode,strTag, intPos)
{
	if(typeof oXMLNode!="object")return "";
	if(oXMLNode==null)return ""
	if(intPos==undefined)intPos=0;

	var arrNodes =oXMLNode.getElementsByTagName(strTag);
	if(arrNodes.length==0)return "";
	return xmlText(arrNodes[intPos].childNodes[0]);
}

function xmlNodeByTag(oXMLNode,strTag, intPos)
{
	if(typeof oXMLNode!="object")return "";
	if(oXMLNode==null)return ""
	if(intPos==undefined)intPos=0;

	var arrNodes =oXMLNode.getElementsByTagName(strTag);
	if(arrNodes.length==0)return "";
	return arrNodes[intPos];
}


function xmlNodeTextByID(oXMLNode,strID)
{
	var aNode = getXmlNodeById(oXMLNode,strID)
	if(aNode!=null)
	{
		return aNode.childNodes[0].nodeValue;
	}
	return "";
}




function load_form(strURL, strKey , strFrameName)
{
	var strFullURL = _applicationpath + _forms + strURL;
	if((strFrameName==undefined)||(strFrameName==""))
	{
		//-- popup window
		window.open(strFullURL,"","location=no,menubar=no,resizable=yes,scrollbars=no,toolbar=no");
	}
	else
	{
		//-- load frame
		document.frames[strFrameName].location.href = strFullURL;
	}
}




function noPx(strPX)
{
	if((strPX==undefined)||(strPX=="")) return 0;
	return new Number(string_replace(strPX+"", "px","",false));
}

function trim(stringToTrim) 
{
	stringToTrim +="";
	var tmpString = string_replace(stringToTrim," ","",true);
	if(tmpString=="") return tmpString;

	return stringToTrim.replace(/^\s+|\s+$/g,"");
}
function ltrim(stringToTrim) 
{
	stringToTrim +="";

	var tmpString = string_replace(stringToTrim," ","",true);
	if(tmpString=="") return tmpString;

	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) 
{
	stringToTrim +="";

	var tmpString = string_replace(stringToTrim," ","",true);
	if(tmpString=="") return tmpString;

	return stringToTrim.replace(/\s+$/,"");
}



//-- load an inline form in workspace
function load_iform(strURL, targetDoc)
{
	//-- add session id 
	if(strURL.indexOf("?")>0)
	{
		strURL +="&sessid=" + _swsessionid+"&swsessionid=" + _swsessionid;
	}
	else
	{
		strURL +="?sessid=" + _swsessionid+"&swsessionid=" + _swsessionid;
	}

	if(strURL.toLowerCase().indexOf("http")>-1)
	{
		//-- leave as is
	}
	else
	{
		strURL = _root + strURL;
	}

	var sForm = app.create_submit_form(strURL, "_self", targetDoc, "POST");
	sForm.submit();
}



//-- create form
function create_submit_form(strURL, strTarget, oDoc, strMethod)
{
	if(oDoc==undefined) oDoc=document;
	if(strMethod==undefined) strMethod="POST";
	var submitForm = oDoc.createElement("FORM");
	oDoc.body.appendChild(submitForm);
	submitForm.method = strMethod;


	var arrURL  = strURL.split("?");
	var strURL  = arrURL[0];
	if(arrURL.length>1)
	{
		var arrVars = arrURL[1].split("&");
		for(var x = 0; x < arrVars.length;x++)
		{
			var arrParam = arrVars[x].split("=");
			create_form_element(submitForm, arrParam[0], arrParam[1]);
		}
	}

	//-- add token
	create_form_element(submitForm, "sessiontoken", app.httpNextToken);

	submitForm.action= strURL;
	submitForm.target= strTarget;
	return submitForm;
}

//-- function to add elements to a form
function create_form_element(oForm, elementName, elementValue)
{
	var newElement = insertBeforeEnd(oForm,"<input name='" + elementName + "' type='hidden' value='" + elementValue + "'>");
	return newElement;
}

function destroy_submit_form(oForm)
{
	oForm.parentNode.removeChild(oForm);
}


function _addSelectOption(oEle,strValue,strText)
{
	var elOptNew = app.getEleDoc(oEle).createElement('option');
	elOptNew.text = strText
	elOptNew.value = strValue
	

  try {
    oEle.add(elOptNew, null); // standards compliant; doesn't work in IE
  }
  catch(ex) {
    oEle.add(elOptNew); // IE only
  }

}

function _selectOptionExists(oEle,strValue)
{
	for(var x=0; x< oEle.options.length;x++)
	{
		if(oEle.options[x].value==strValue)return true;
	}
	return false;
}


function _params_from_array(arrValues, strPrefix)
{
	if(strPrefix==undefined)strPrefix="";

	var strParams = "";
	for(strParam in arrValues)
	{
		if(strParams != "")strParams += "&";
		strParams += strPrefix + strParam + "=" + pfu(arrValues[strParam]);
	}
	return strParams;
}

//-- get random color
function randcolor()
{
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function expand_collapse(oImg, elementID, strColour)
{

	var aDoc = app.getEleDoc(oImg)
	var oEle = aDoc.getElementById(elementID);
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

//-- check mandatroy fields
function check_mandatory_fields(aDoc)
{

	for(strEleID in aDoc.__ELEMENTS)
	{
		var oE = aDoc.__ELEMENTS[strEleID];

		if((oE.getAttribute("formtype")!=null)&&(oE.getAttribute("swmandatory")=="1"))
		{
			var varValue = app.getEleValue(oE);
			if(varValue=="")
			{
				var strAlert = "A mandatory field on the form has not been populated. Please check the mandatory fields and try again.";
				var strBinding = oE.getAttribute("binding");
				if(strBinding!=null && strBinding!="" && strBinding.indexOf("_xmlmc.")==-1)
				{
					var strLabelValue = get_label_from_binding(strBinding);
					if(strLabelValue!=strBinding)
					{
						strAlert = "The field [" + strLabelValue + "] is mandatory but has not been populated. Please check the field and try again.";
					}
				}
				return strAlert;
			}
		}
	}
	return true;
}


//-- prepare a value for sql on the client side.
function PrepareForSQL(strValue)
{
	return PrepareForSql(strValue)
}
function PrepareForSql(strValue)
{
	
	//if(app._dbtype!='swsql')
	//{
	//	strValue = string_replace(strValue,"'","\\'",true);
	//}
	//else
	//{
		strValue = string_replace(strValue,"'","''",true);
	//}
	return strValue;
}


function set_form_flag_value(oDiv, intFlagValue)
{
	var oTable = app.get_parent_child_by_tag(oDiv,"TABLE");

	var test = intFlagValue - 1;
	if(isNaN(test))
	{
		//-- trying to set text so assume flag is only one flag and set the label
		for(var x=0;x<oTable.rows.length;x++)
		{
			var oTD = app.get_parent_child_by_class(oTable.rows[x],"fftd");
			if(oTD!=null)
			{
				app.setElementText(oTD,intFlagValue);
			}
		}

	}
	else
	{
		var intValue = 0;
		//-- add up all ticked values
		for(var x=0;x<oTable.rows.length;x++)
		{
			var oCB = app.get_parent_child_by_tag(oTable.rows[x],"INPUT");
			if(oCB!=null)
			{
				if(oCB.value & intFlagValue)
				{
					oCB.checked=true;
				}
				else
				{
					oCB.checked=false;
				}
			}
		}

		//-- set div value
		oDiv.setAttribute("dbvalue",intFlagValue+"");
		oDiv.setAttribute("value",intFlagValue+"");

		//-- get div holder and set binding value
		var strBinding = oDiv.getAttribute("binding");
		if((strBinding!=null)&&(strBinding!="") && (strBinding.indexOf("_xmlmc.")==-1))
		{
			var arrI = strBinding.split(".");
			oDiv.swdoc[arrI[0]][arrI[1]] = intFlagValue;
		}
	}
}


//-- same as php number format
function number_format(number, decimals, dec_point, thousands_sep)
{
	var n = !isFinite(+number) ? 0 : +number, 
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
	return s.join(dec);
}

//-- return byte size in kb, mb etc
function getByteSize(intByteSize)
{
	var size = intByteSize / 1024; 
    if(intByteSize < 1024) 
    { 
		size = intByteSize;
		size += ' bytes'; 
    }  
    else  
    { 
	    if(size < 1024) 
		{ 
			size = number_format(size, 2); 
			size += ' Kb'; 
		}
		else if(size / 1024 < 1024)  
		{ 
			size = number_format(size / 1024, 2); 
            size += ' Mb'; 
        }  
        else if (size / 1024 / 1024 < 1024)   
        { 
            size = number_format(size / 1024 / 1024, 2); 
            size += ' Gb'; 
        }  
	} 
    return size; 
}
//--
//-- return text for type i.e doc = Microsoft Word Document
function getFileTypeInformation(strType)
{
	var strText = strType;
	switch(strType.toLowerCase())
	{
		case "doc":
			strText = "Microsoft Word Document";
			break;
		case "txt":
			strText = "Text Document";
			break;
		case "png":
			strText = "Image - Portable Network Graphic";
			break;
		case "gif":
			strText = "Image - GIF";
			break;
		case "bmp":
			strText = "Image - Bit Map Picture";
			break;
		case "jpg":
			strText = "Image - JPG";
			break;
		case "jpeg":
			strText = "Image - JPEG";
			break;
		case "pdf":
			strText = "Printable Document Format";
			break;
		case "ddf":
			strText = "Supportworks Data Dictionary";
			break;
		case "php":
			strText = "Server-side Processing File";
			break;
		case "js":
			strText = "Client-side Javascript File";
			break;
		case "xls":
			strText = "Microsoft Excel Spreadsheet";
			break;
		case "sql":
			strText = "Database SQL File";
			break;
		case "xml":
			strText = "Extensible Markup Language File";
			break;
		case "html":
			strText = "Hype-Text Markup Language File";
			break;
		case "htm":
			strText = "Hype-Text Markup File";
			break;
	}

	return strText;
}




//-- drag and drop
var DragHandler = {
 
 
	// private property.
	_oElem : null,
	_oDoc : null,
 
	// public method. Attach drag handler to an element.
	attach : function(oDoc, oElem) {
		oDoc.onmousedown = DragHandler._dragBegin;
		DragHandler._oDoc = oDoc;
		DragHandler._oElem = oElem;
 
		// callbacks
		oDoc.dragBegin = new Function();
		oDoc.drag = new Function();
		oDoc.dragEnd = new Function();
 
		return oElem;
	},
 
 
	// private method. Begin drag process.
	_dragBegin : function(e) {
		var oElem = DragHandler._oElem;// = this;
 
		if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = '0px'; }
		if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = '0px'; }
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
		oElem.mouseX = e.clientX - 10;
		oElem.mouseY = e.clientY - 10;
 
		DragHandler._oDoc.dragBegin(oElem, x, y);
 
		DragHandler._oDoc.onmousemove = DragHandler._drag;
		DragHandler._oDoc.onmouseup = DragHandler._dragEnd;
		return false;
	},
 
 
	// private method. Drag (move) element.
	_drag : function(e) {
		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
//		oElem.style.left = x + (e.clientX - oElem.mouseX) + 'px';
//		oElem.style.top = y + (e.clientY - oElem.mouseY) + 'px';

		oElem.style.left = e.clientX + 10 + 'px';
		oElem.style.top = e.clientY + 10 + 'px';


		window.status = oElem.style.left +":" + oElem.style.top;
		oElem.mouseX = e.clientX - 10;
		oElem.mouseY = e.clientY - 10;
 
		DragHandler._oDoc.drag(oElem, x, y);
 
		return false;
	},
 
 
	// private method. Stop drag process.
	_dragEnd : function() {
		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		DragHandler._oDoc.dragEnd(DragHandler._oDoc, oElem, x, y);
 
		DragHandler._oDoc.onmousemove = null;
		DragHandler._oDoc.onmouseup = null;
		//DragHandler._oElem = null;
	}
 
}


//--
//-- inserting text at cursor pos
function getCaretPosition (ctrl) 
{
	var CaretPos = 0;	// IE Support
	if (document.selection) 
	{
		ctrl.focus();
		var Sel = ctrl.document.selection.createRange();
		Sel.moveStart ('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
	{
		CaretPos = ctrl.selectionStart;
	}
	return (CaretPos);
}


function insertAtCursor(myField, myValue) 
{
	//-- IE support
	if (document.selection) 
	{
		myField.focus();
		//-- ie10 ownerDocument check
		var useDoc = (myField.ownerDocument)?myField.ownerDocument:myField.document;
		sel = useDoc.selection.createRange();
		sel.text = myValue;
	}
	else if (myField.selectionStart || myField.selectionStart == '0') 
	{
		//-- MOZILLA/NETSCAPE support
		var startPos = myField.selectionStart;
	    var endPos = myField.selectionEnd;
		myField.value = myField.value.substring(0, startPos)
                  + myValue
                  + myField.value.substring(endPos, myField.value.length);
	} 
	else 
	{
		myField.value += myValue;
	}
}


//-- check if clicked element in right hand corder box (for dates and profile selectors etc
function _clicked_ele_trigger(oEle,e)
{
	if(isNaN(e))
	{
		var mLeft = app.findMousePos(e)[0];
	}
	else
	{
		var mLeft = e;
	}

	var eleMaxRight = oEle.offsetWidth + app.eleLeft(oEle);
	var eleMinRight = eleMaxRight - 16;

	if((mLeft>eleMinRight)&&(mLeft<eleMaxRight))
	{
		return true;
	}
	return false;
}

function jA(jsonObject)
{
	var isArray = (jsonObject instanceof Array);
	if(!isArray)
	{
		return new Array(jsonObject);
	}
	return jsonObject;
}

function jVal(jPointer)
{
	if(jPointer==undefined)return "";
	return jPointer;
}

function getSelectedRadio(buttonGroup) {
    // returns the array number of the selected radio button or -1 if no button is selected
    if (buttonGroup[0]) { // if the button group is an array (one button is not an array)
       for (var i=0; i<buttonGroup.length; i++) {
          if (buttonGroup[i].checked) {
             return i
          }
       }
    } else {
       if (buttonGroup.checked) { return 0; } // if the one button is checked, return zero
    }
    // if we get to this point, no radio button is selected
    return -1;
 } // Ends the "getSelectedRadio" function
 
function getSelectedRadioValue(buttonGroup) {
    // returns the value of the selected radio button or "" if no button is selected
    var i = getSelectedRadio(buttonGroup);
    if (i == -1) {
       return "";
    } else {
       if (buttonGroup[i]) { // Make sure the button group is an array (not just one button)
          return buttonGroup[i].value;
       } else { // The button group is just the one button, and it is checked
          return buttonGroup.value;
       }
    }
 } // Ends the "getSelectedRadioValue" function
 
 function deselectSelectedRadio(buttonGroup) {
    // returns the array number of the selected radio button or -1 if no button is selected
    if (buttonGroup[0]) 
	{ // if the button group is an array (one button is not an array)
		for (var i=0; i<buttonGroup.length; i++) 
		{
			if (buttonGroup[i].checked) buttonGroup[i].checked=false;
       }
    }
	else
	{
       if (buttonGroup.checked)buttonGroup.checked=false;
    }

 }