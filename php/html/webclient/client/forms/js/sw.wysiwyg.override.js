/********************************************************************
 * openWYSIWYG settings file Copyright (c) 2006 openWebWare.com
 * Contact us at devs@openwebware.com
 * This copyright notice MUST stay intact for use.
 *
 * $Id: sw.wysiwyg.override.js 1615 2015-07-23 10:53:42Z neilwj $
 ********************************************************************/


/* rte settings for supportworks */
var SupportworksSettings = new WYSIWYG.Settings(); 
SupportworksSettings.Toolbar[0] = new Array("font","fontsize","seperator","bold","italic","underline","seperator","forecolor","seperator","insertimage","createlink","seperator","justifyfull", 
			"justifyleft", 
			"justifycenter", 
			"justifyright", 
			"seperator", 
			"unorderedlist", 
			"orderedlist",
			"seperator", 
			"outdent", 
			"indent",
			"seperator", 
			"undo", 
			"redo"	
			);
SupportworksSettings.Toolbar[1] = "";
SupportworksSettings.StatusBarEnabled = false;
SupportworksSettings.InvertIELineBreaks = true;
SupportworksSettings.ReplaceLineBreaks = true;
SupportworksSettings.ImagesDir = "thirdparty/wysiwyg/images/";
SupportworksSettings.PopupsDir = "thirdparty/wysiwyg/popups/";
SupportworksSettings.CSSFile = "thirdparty/wysiwyg/styles/wysiwyg.css";		
SupportworksSettings.DisabledStyle = "font-family: Arial; font-size: 12px; background-color: #FFFFFF";
SupportworksSettings._swplainmode = false;
SupportworksSettings._bDisableContentMenu = false;

//--
//-- override base methods with customised ones


WYSIWYG_Core.isBrowserCompatible= function() {
		// Validate browser and compatiblity
		if (!document.getElementById || !document.designMode)
		{   
			//no designMode (Safari lies)
	   		return false;
		} 
		return true;
	},


WYSIWYG.execCommand = function(n, cmd, value) 
{
			
	// When user clicks toolbar button make sure it always targets its respective WYSIWYG
	this.getEditorWindow(n).focus();
	
	// When in Text Mode these execCommands are enabled
	var textModeCommands = new Array("ViewText", "Print");
  
	// Check if in Text mode and a disabled command execute
	var cmdValid = false;
	for (var i = 0; i < textModeCommands.length; i++) {
		if (textModeCommands[i] == cmd) {
			cmdValid = true;
		}
	}
	if(this.viewTextMode[n] && !cmdValid) {
		alert("You are in TEXT Mode. This feature has been disabled.");
		return;
	} 
	
	// rbg to hex convertion implementation dependents on browser
	var toHexColor = WYSIWYG_Core.isMSIE ? WYSIWYG_Core._dec_to_rgb : WYSIWYG_Core.toHexColor;
	
	// popup screen positions
	var popupPosition = {left: parseInt(window.screen.availWidth / 3), top: parseInt(window.screen.availHeight / 3)};		
	
	// Check the insert image popup implementation
	var imagePopupFile = this.config[n].PopupsDir + 'insert_image.html';
	var imagePopupWidth = 400;
	var imagePopupHeight = 210;
	if(typeof this.config[n].ImagePopupFile != "undefined" && this.config[n].ImagePopupFile != "") {
		imagePopupFile = this.config[n].ImagePopupFile;
	}
	if(typeof this.config[n].ImagePopupWidth && this.config[n].ImagePopupWidth > 0) {
		imagePopupWidth = this.config[n].ImagePopupWidth;
	}
	if(typeof this.config[n].ImagePopupHeight && this.config[n].ImagePopupHeight > 0) {
		imagePopupHeight = this.config[n].ImagePopupHeight;
	}
	
	// switch which action have to do
	switch(cmd) 
	{
		case "PasteMC":
			WYSIWYG_ContextMenu.close(n);
			WYSIWYG.SwInsertMultiClip(n);
			break;
		case "InsertSignature":
			WYSIWYG_ContextMenu.close(n);
			WYSIWYG.SwInsertEmailSignature(n);
			break;
		case "Maximize":
			this.maximize(n);
		break;
		case "FormatBlock":
			WYSIWYG_Core.execCommand(n, cmd, "<" + value + ">");
		break;
		// ForeColor and 
		case "ForeColor":
			var rgb = this.getEditorWindow(n).document.queryCommandValue(cmd);
			var currentColor = rgb != '' ? toHexColor(this.getEditorWindow(n).document.queryCommandValue(cmd)) : "000000";
			window.open(this.config[n].PopupsDir + 'select_color.html?color=' + currentColor + '&command=' + cmd + '&wysiwyg=' + n, 'popup', 'location=0,status=0,scrollbars=0,width=210,height=165,top=' + popupPosition.top + ',left=' + popupPosition.left).focus();
		break;
		
		// BackColor
		case "BackColor":
			var currentColor = toHexColor(this.getEditorWindow(n).document.queryCommandValue(cmd));
			window.open(this.config[n].PopupsDir + 'select_color.html?color=' + currentColor + '&command=' + cmd + '&wysiwyg=' + n, 'popup', 'location=0,status=0,scrollbars=0,width=210,height=165,top=' + popupPosition.top + ',left=' + popupPosition.left).focus();
		break;
		
		// InsertImage
		case "InsertImage": 
			//-- neilwj - 08.02.2011
			//-- use SW file upload rather than specifing a url - assumes form as a file uploader called fl_imageinsert
			if(fl_imageinsert)
			{
				var strPrefixFileWith = "att."+ app.global.GetCurrentEpocTime() + ".";
				fl_imageinsert.AddFiles("CID",strPrefixFileWith);
			}

			//-- window.open(imagePopupFile + '?wysiwyg=' + n, 'popup', 'location=0,status=0,scrollbars=0,resizable=0,width=' + imagePopupWidth + ',height=' + imagePopupHeight + ',top=' + popupPosition.top + ',left=' + popupPosition.left).focus();
		break;
		
		// Remove Image
		case "RemoveImage": 
			this.removeImage(n);
		break;
		
		// Remove Link
		case "RemoveLink": 
			this.removeLink(n);
		break;
		
		// Remove a Node
		case "RemoveNode": 
			this.removeNode(n);
		break;
		
		// Create Link
		case "CreateLink": 

			var strURL = this.getLinkHref(n);
			var strURL = prompt("Please enter a URL address",strURL);
			if(strURL=="" || strURL==null) return false;
			
			this.insertLink(strURL, "_blank", "", "", "", n);
			//window.open(this.config[n].PopupsDir + 'insert_hyperlink.html?wysiwyg=' + n, 'popup', 'location=0,status=0,scrollbars=0,resizable=0,width=350,height=160,top=' + popupPosition.top + ',left=' + popupPosition.left).focus();


		break;
		
		// InsertTable
		case "InsertTable": 
			window.open(this.config[n].PopupsDir + 'create_table.html?wysiwyg=' + n, 'popup', 'location=0,status=0,scrollbars=0,resizable=0,width=500,height=260,top=' + popupPosition.top + ',left=' + popupPosition.left).focus();
		break;
		
		// ViewSource
		case "ViewSource": 
			this.viewSource(n);
		break;
		
		// ViewText
		case "ViewText": 
			this.viewText(n);
		break;
		
		// Help
		case "Help":
			window.open(this.config[n].PopupsDir + 'about.html?wysiwyg=' + n, 'popup', 'location=0,status=0,scrollbars=0,resizable=0,width=400,height=350,top=' + popupPosition.top + ',left=' + popupPosition.left).focus();
		break;
		
		// Strip any HTML added by word
		case "RemoveFormat":
			this.removeFormat(n);	
		break;
		
		// Preview thx to Korvo
		case "Preview":
			window.open(this.config[n].PopupsDir + 'preview.html?wysiwyg=' + n,'popup', 'location=0,status=0,scrollbars=1,resizable=1,width=' + this.config[n].PreviewWidth + ',height=' + this.config[n].PreviewHeight + ',top=' + popupPosition.top + ',left=' + popupPosition.left).focus();
		break;
		
		// Print
		case "Print":
			this.print(n);
		break;
		
		// Save
		case "Save":
			WYSIWYG.updateTextArea(n);
			var form = WYSIWYG_Core.findParentNode("FORM", this.getEditor(n));
			if(form == null) {
				alert("Can not submit the content, because no form element found.");
				return;
			}
			form.submit();
		break;
				 
		// Return
		case "Return":
		   location.replace(this.config[n].Opener);
		break;
					
		default: 
			WYSIWYG_Core.execCommand(n, cmd, value);
			
	}
		
	// hide node the font + font size selection
	this.closeDropDowns(n);
}


WYSIWYG.getLinkHref=function(n)
{
	// get selection and range
	var sel = this.getSelection(n);
	var range = this.getRange(sel);
	var lin = null;
	if(WYSIWYG_Core.isMSIE) {
		if(sel.type == "Control" && range.length == 1) {	
			range = this.getTextRange(range(0));
			range.select();
		}
		if (sel.type == 'Text' || sel.type == 'None') {
			sel = this.getSelection(n);
			range = this.getRange(sel);
			// find a as parent element
			lin = this.findParent("a", range);
		}
	}
	else {
		// find a as parent element
		lin = this.findParent("a", range);
	}
	
	// if no link as parent found exit here
	if(lin == null) return "http://";
		
	var strURL = lin.getAttribute("href");
	if(WYSIWYG_Core.isMSIE) strURL = WYSIWYG.stripURLPath(n, strURL, false);

	return strURL;
}


/**
 * Insert or modify a link
 * 
 * @param {String} href The url of the link
 * @param {String} target Target of the link
 * @param {String} style Stylesheet of the link
 * @param {String} styleClass Stylesheet class of the link
 * @param {String} name Name attribute of the link
 * @param {String} n The editor identifier (the textarea's ID)
 */
WYSIWYG.insertLink= function(href, target, style, styleClass, name, n) 
{
	var undefined;
	// get editor
	var doc = this.getEditorWindow(n).document;
	// get selection and range
	var sel = this.getSelection(n);
	var range = this.getRange(sel);
	var lin = null;
	
	// get element from selection
	if(WYSIWYG_Core.isMSIE) 
	{
		if(sel.type == "Control" && range.length == 1) 
		{	
			range = this.getTextRange(range(0));
			range.select();
		}
	}

	// find a as parent element
	lin = this.findParent("a", range);
	// check if parent is found
	var update = (lin == null) ? false : true;
	if(!update) 
	{
		lin = doc.createElement("a");
	}
	
	// set the attributes
	WYSIWYG_Core.setAttribute(lin, "href", href);
	WYSIWYG_Core.setAttribute(lin, "class", styleClass);
	WYSIWYG_Core.setAttribute(lin, "className", styleClass);
	WYSIWYG_Core.setAttribute(lin, "target", target);
	WYSIWYG_Core.setAttribute(lin, "name", name);
	WYSIWYG_Core.setAttribute(lin, "style", style);
	// on update exit here
	if(update) { return; }

	// Check if IE or Mozilla (other)
	if (WYSIWYG_Core.isMSIE) 
	{	
		range.select();
		if(range.htmlText=="")
		{
			lin.innerHTML = href;
		}
		else
		{
			lin.innerHTML = range.htmlText;
		}
		range.pasteHTML(lin.outerHTML);   
	} 
	else 
	{			
		if(sel=="")sel = href;
		lin.innerHTML = sel;
		this.insertNodeAtSelection(lin, n);
	}
}

/** create editor in realtime i.e. do not use load event do it right now
	added by neilwj 08.02.2011

 * @param {String} id Textarea identifier (all = all textareas)
 * @param {Settings} settings the settings which will be applied to the textarea

**/
WYSIWYG.SwCreateNow = function(id, settings) 
{	
		if(id != "all") {	
			this.setSettings(id, settings);
			WYSIWYG_Core.includeCSS(this.config[id].CSSFile);
			WYSIWYG._generate(id, settings);
		}
		else {
			WYSIWYG.attachAll(settings);
		}

		//-- trigger onhtml blue event for control - apps dev must put function at document level called controlname_OnRichTextEditorBlur
		WYSIWYG_Core.addEvent(this.getEditorWindow(id), "blur", function (){WYSIWYG.onBlur(id);});
}

//-- call swjs function to handle blur event pass in rte object and the html value
WYSIWYG.onBlur = function (id)
{
	var strFunctionName = id +"_OnRichTextEditorBlur";
	if(top[strFunctionName])
	{
		top[strFunctionName](this, this.getEditorWindow(id).document.body.innerHTML, this.SwGetHtmlContent(id), this.SwGetTextContent(id));
	}

}

//-- open email signature picker and insert text at cursor
WYSIWYG.SwInsertEmailSignature = function(n)
{
	var strFunctionName = n +"_InsertEmailSignature";
	if(top[strFunctionName])
	{
		top[strFunctionName](n,this);
	}
}

WYSIWYG.SwGetMode = function()
{
	return this._swplainmode;
}

//-- open multiclip picker and insert text at cursor
WYSIWYG.SwInsertMultiClip = function(n)
{
	var bGroupMc = app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE);
	var bPersonalMc = app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE);

	//-- check permissions
	if(!bGroupMc && !bPersonalMc)
	{
		return false;
	}

	//-- popup item selector
	var editor = this;
	app._open_system_form("multiclippicker.php", "multiclip", "", "", true,  function(oForm)
	{
		if(oForm.selected)
		{
			//-- get multiclip text
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam("itemId",oForm.multiclipid);
			if(xmlmc.Invoke("system", "multiClipGetItemData"))
			{
				var strInsertData = xmlmc.GetParam("itemData");
				if(editor._swplainmode)
				{
					if(_swdoc.mainform[n])
					{
						_swdoc.mainform[n]._insert_text_at_cursor(strInsertData);
					}
					else if(_swdoc.extform[n])
					{
						_swdoc.extform[n]._insert_text_at_cursor(strInsertData);
					}
				}
				else
				{
					//-- replace line breaks
					strInsertData = strInsertData.replace(/\n\r|\n/ig, "<br>");
					WYSIWYG.insertHTML(strInsertData,n)
				}
			}
		}
	
	}, null, window,250,250);
}

WYSIWYG.insertImage = function(src, width, height, align, border, alt, hspace, vspace, n, sCID) 
{
	// get editor
	var doc = this.getEditorWindow(n).document;
	try{doc.body.focus();}catch(e){}

	// get selection and range
	var sel = this.getSelection(n);
	var range = this.getRange(sel);
	// the current tag of range
	var img = this.findParent("img", range);
	// element is not a link
	var update = (img == null) ? false : true;
	if(!update) 
	{
		img = doc.createElement("img");
	}
	
	// set the attributes
	WYSIWYG_Core.setAttribute(img, "src", src);
	WYSIWYG_Core.setAttribute(img, "style", "width:" + width + ";height:" + height);
	if(align != "") { WYSIWYG_Core.setAttribute(img, "align", align); } else { img.removeAttribute("align"); }

	//-- 08.02.2011 neilwj - if passed in SCID then set attribute (used for emails)
	if(sCID!=undefined && sCID!="")	
	{
		WYSIWYG_Core.setAttribute(img, "swcid", sCID);
	}
	WYSIWYG_Core.setAttribute(img, "border", border);
	WYSIWYG_Core.setAttribute(img, "alt", alt);
	WYSIWYG_Core.setAttribute(img, "hspace", hspace);
	WYSIWYG_Core.setAttribute(img, "vspace", vspace);
	img.removeAttribute("width");
	img.removeAttribute("height");
	
	// on update exit here
	if(update) { return; }   
	
	// Check if IE or Mozilla (other)
	if (WYSIWYG_Core.isMSIE) 
	{
		range.pasteHTML(img.outerHTML);   
	}
	else 
	{
		this.insertNodeAtSelection(img, n);
	}

}


/* ---------------------------------------------------------------------- *\
  Function    : insertNodeAtSelection()
  Description : insert HTML into WYSIWYG in rich text (mozilla)
  Usage       : WYSIWYG.insertNodeAtSelection(insertNode, n)
  Arguments   : insertNode - The HTML being inserted (must be innerHTML inserted within a div element)
				n          - The editor identifier that the HTML will be inserted into (the textarea's ID)
\* ---------------------------------------------------------------------- */
WYSIWYG.insertNodeAtSelection=function(insertNode, n) 
{

	// get editor document
	var doc = this.getEditorWindow(n).document;
	// get current selection
	var sel = this.getSelection(n);
	
	// get the first range of the selection
	// (there's almost always only one range)
	var range = sel.getRangeAt(0);

	// deselect everything
	sel.removeAllRanges();

	// remove content of current selection from document
	range.deleteContents();
	// get location of current selection
	var container = range.startContainer;
	var pos = range.startOffset;
	
	// make a new range for the new selection
	range = doc.createRange();
	if (container.nodeType==3 && insertNode.nodeType==3) 
	{	
		// if we insert text in a textnode, do optimized insertion
		container.insertData(pos, insertNode.data);
		// put cursor after inserted text
		range.setEnd(container, pos+insertNode.length);
		range.setStart(container, pos+insertNode.length);		
	} 	
	else 
	{
	
		var afterNode;	
		var beforeNode;
		if (container.nodeType==3)
		{
			// when inserting into a textnode
			// we create 2 new textnodes
			// and put the insertNode in between
			var textNode = container;
			container = textNode.parentNode;
			var text = textNode.nodeValue;
			
			// text before the split
			var textBefore = text.substr(0,pos);
			// text after the split
			var textAfter = text.substr(pos);
			
			beforeNode = document.createTextNode(textBefore);
			afterNode = document.createTextNode(textAfter);

			// insert the 3 new nodes before the old one
			container.insertBefore(afterNode, textNode);
			container.insertBefore(insertNode, afterNode);
			container.insertBefore(beforeNode, insertNode);
			// remove the old node
			container.removeChild(textNode);
		} 
		else 
		{
			// else simply insert the node

			afterNode = container.childNodes[pos];
			container.insertBefore(insertNode, afterNode);
		}
		
		try 
		{
			range.setEnd(afterNode, 0);
			range.setStart(afterNode, 0);
		}
		catch(e) 
		{
			//alert(e);
		}
	}
	sel.addRange(range);
}

WYSIWYG._generate = function(n, settings) 
{
				
	// Get the textarea element
	var textarea = _$(n);
	// Validate if textarea exists
	if(textarea == null) {
		alert("No textarea found with the given identifier (ID: " + n + ").");
		return;
	}	    
	
	// Validate browser compatiblity
	if(!WYSIWYG_Core.isBrowserCompatible()) {
		if(this.config[n].NoValidBrowserMessage != "") { alert(this.config[n].NoValidBrowserMessage); }
		return;
	}
							
	
	// Override the width and height of the editor with the 
	// size given by the style attributes width and height
	if(textarea.style.width) {
		this.config[n].Width = textarea.style.width;
	}
	if(textarea.style.height) {
		this.config[n].Height = textarea.style.height
	}
		
	// determine the width + height
	var currentWidth = this.config[n].Width;
	var currentHeight = this.config[n].Height;

	var textAreaTop = textarea.offsetTop;
	var textAreaLeft = textarea.offsetLeft;

	//alert(textAreaTop)

	//-- neilwj 08.02.2011 - disable element and set to invisible do not hide
	//-- this allow us to get its top and left pos when resizing
	textarea.style.visibility='hidden';
	textarea.setAttribute('disabled', true); 
	// Hide the textarea 
	//textarea.style.display = 'none'; 


	// Calculate the width + height of the editor 
	var toolbarWidth = currentWidth;
	var ifrmWidth = "100%";
	var	ifrmHeight = "100%";
	if(currentWidth.search(/%/) == -1) {
		toolbarWidth = currentWidth.replace(/px/gi, "");
		toolbarWidth = (parseFloat(toolbarWidth) + 2) + "px";
		//-- nwj 08.02.2011 - let iframe be 100% by 100%
		//ifrmWidth = currentWidth;	
		//ifrmHeight = currentHeight - 100;
	}
	
	// Generate the WYSIWYG Table
	// This table holds the toolbars and the iframe as the editor
	var editor = "";
	editor += '<div id="wysiwyg_div_' + n + '" style="position:absolute;top:' + textAreaTop + ';left:' + textAreaLeft + ';height:'+currentHeight+';width:' + currentWidth  +';">';
	editor += '<table border="0" cellpadding="0" cellspacing="0" class="tableTextareaEditor" id="wysiwyg_table_' + n + '" style="width:100%; height:100%;">';
	editor += '<tr><td style="height:22px;vertical-align:top;">';
		  
	// Output all command buttons that belong to toolbar one
	for (var j = 0; j < this.config[n].Toolbar.length;j++) { 
		if(this.config[n].Toolbar[j] && this.config[n].Toolbar[j].length > 0) {
			var toolbar = this.config[n].Toolbar[j];
			
			// Generate WYSIWYG toolbar one
			editor += '<table border="0" cellpadding="0" cellspacing="0" class="toolbar1" style="width:100%;" id="toolbar' + j + '_' + n + '">';
			editor += '<tr><td style="width:6px;"><img src="' + this.config[n].ImagesDir + 'seperator2.gif" alt="" hspace="3"></td>';
			
			// Interate over the toolbar element
			for (var i = 0; i < toolbar.length;i++) { 
				var id = toolbar[i];
				if (toolbar[i]) {
					if(typeof (this.config[n].DropDowns[id]) != "undefined") {
						var dropdown = this.config[n].DropDowns[id];
						editor += '<td style="width: ' + dropdown.width + ';">';
						// write the drop down content
						editor += this.writeDropDown(n, id);
						editor += '</td>';
					}
					else {
							
						// Get the values of the Button from the global ToolbarList object
						var buttonObj = this.ToolbarList[toolbar[i]];
						if(buttonObj) {
							var buttonID = buttonObj[0];
							var buttonTitle = buttonObj[1];
							var buttonImage = this.config[n].ImagesDir + buttonObj[2];
							var buttonImageRollover  = this.config[n].ImagesDir + buttonObj[3];
								
							if (toolbar[i] == "seperator") {
								editor += '<td style="width: 12px;" align="center">';
								editor += '<img src="' + buttonImage + '" border=0 unselectable="on" width="2" height="18" hspace="2" unselectable="on">';
								editor += '</td>';
							}
							// View Source button
							else if (toolbar[i] == "viewSource"){
								editor += '<td style="width: 22px;">';
								editor += '<span id="HTMLMode' + n + '"><img src="' + buttonImage +  '" border="0" unselectable="on" title="' + buttonTitle + '" id="' + buttonID + '" class="buttonEditor" onmouseover="this.className=\'buttonEditorOver\'; this.src=\'' + buttonImageRollover + '\';" onmouseout="this.className=\'buttonEditor\'; this.src=\'' + buttonImage + '\';" onclick="WYSIWYG.execCommand(\'' + n + '\', \'' + buttonID + '\');" unselectable="on" width="20" height="20"></span>';
								editor += '<span id="textMode' + n + '"><img src="' + this.config[n].ImagesDir + 'view_text.gif" border="0" unselectable="on" title="viewText" id="ViewText" class="buttonEditor" onmouseover="this.className=\'buttonEditorOver\'; this.src=\'' + this.config[n].ImagesDir + 'view_text_on.gif\';" onmouseout="this.className=\'buttonEditor\'; this.src=\'' + this.config[n].ImagesDir + 'view_text.gif\';" onclick="WYSIWYG.execCommand(\'' + n + '\',\'ViewText\');" unselectable="on"  width="20" height="20"></span>';
								editor += '</td>';
							}
							else {
								editor += '<td style="width: 22px;">';
								editor += '<img src="' + buttonImage + '" border=0 unselectable="on" title="' + buttonTitle + '" id="' + buttonID + '" class="buttonEditor" onmouseover="this.className=\'buttonEditorOver\'; this.src=\'' + buttonImageRollover + '\';" onmouseout="this.className=\'buttonEditor\'; this.src=\'' + buttonImage + '\';" onclick="WYSIWYG.execCommand(\'' + n + '\', \'' + buttonID + '\');" unselectable="on" width="20" height="20">';
								editor += '</td>';
							}
						}
					}
				}
			}
			editor += '<td>&nbsp;</td></tr></table>';
		}
	}
	
	editor += '</td></tr><tr><td valign="top">\n';
	// Create iframe which will be used for rich text editing
	editor += '<iframe frameborder="0" id="wysiwyg' + n + '" class="iframeText" style="width:100%;height:' + ifrmHeight + ';"></iframe>\n'
	+ '</td></tr>';
	// Status bar HTML code
	if(this.config[n].StatusBarEnabled) {
		editor += '<tr><td class="wysiwyg-statusbar" style="height:10px;" id="wysiwyg_statusbar_' + n + '">&nbsp;</td></tr>';    
	}
	editor += '</table>';
	editor += '</div>';
	
	// Insert the editor after the textarea	    
	textarea.insertAdjacentHTML("afterEnd", editor);
						
	// Hide the "Text Mode" button
	// Validate if textMode Elements are prensent
	if(_$("textMode" + n)) {
		_$("textMode" + n).style.display = 'none'; 
	}
					
	// Pass the textarea's existing text over to the content variable
	var content = textarea.value;
	var doc = this.getEditorWindow(n).document;		
	

	// Replace all \n with <br> 
	if(this.config[n].ReplaceLineBreaks) {
		content = content.replace(/\n\r|\n/ig, "<br>");
	}
	
	// Write the textarea's content into the iframe
	doc.open();
	doc.write(content);
	doc.close();
			
	// Make the iframe editable in both Mozilla and IE
	// Improve compatiblity for IE + Mozilla
	if (doc.body.contentEditable) {
		doc.body.contentEditable = true;
	}
	else {
		doc.designMode = "on";	
	}

	// Set default font style
	WYSIWYG_Core.setAttribute(doc.body, "style", this.config[n].DefaultStyle);
	
	// Enable table highlighting
	WYSIWYG_Table.refreshHighlighting(n);
	
	// Event Handling
	// Update the textarea with content in WYSIWYG when user submits form
	for (var idx=0; idx < document.forms.length; idx++) {
		WYSIWYG_Core.addEvent(document.forms[idx], "submit", function xxx_aa() { WYSIWYG.updateTextArea(n); });
	}
	
	// close font selection if mouse moves over the editor window
	WYSIWYG_Core.addEvent(doc, "mouseover", function xxx_bb() { WYSIWYG.closeDropDowns(n);});
	
	// If it's true invert the line break capability of IE
	if(this.config[n].InvertIELineBreaks) {
		WYSIWYG_Core.addEvent(doc, "keypress", function xxx_cc() { WYSIWYG.invertIELineBreakCapability(n); });
	}
				
	// status bar update
	if(this.config[n].StatusBarEnabled) {
		WYSIWYG_Core.addEvent(doc, "mouseup", function xxx_dd() { WYSIWYG.updateStatusBar(n); });
	}
			
	// custom context menu
	if(this.config[n].ContextMenu) {	
		WYSIWYG_ContextMenu.init(n);		
	}
							
	// init viewTextMode var
	this.viewTextMode[n] = false;			
}


/**
 * enable or disable plain text only. If enabled hide RTE and show original textarea else hide textarea and show RTE
 * 
 * @param {String} n The editor identifier (the textarea's ID)
 */ 

WYSIWYG.SwPlainTextOnlyMode=function(n,bPlainTextOnly, bSkipMessage)
{
	if(bSkipMessage==undefined)bSkipMessage=false;
	var textarea = _$(n);
	// Validate if textarea exists
	if(textarea == null) {
		alert("No textarea found with the given identifier (ID: " + n + ").");
		return;
	}	    

	if(bPlainTextOnly)
	{
		if(!this._swplainmode && !bSkipMessage)
		{
			if(!confirm("Changing the formatting from HTML to plain text requires removing all the current formatting, including any pictures you may have included.\nAre you sure you want to do this?"))return;
		}

		this._swplainmode = true;
		textarea.value = this.SwGetTextContent(n);
		textarea.removeAttribute('disabled'); 
		textarea.style.visibility="visible";
		
		this.disable(n);
		this.SwHideEditor(n);

	}
	else
	{
		//-- already out of plain mode
		if(!this._swplainmode) 
		{
			return;
		}
		this._swplainmode = false;
		var doc = this.getEditorWindow(n).document;
		
		doc.body.innerHTML = textarea.value.replace(/(\r\n)|(\n)/ig, "<br>");
		this.enable(n);
		this.SwShowEditor(n);
		textarea.setAttribute('disabled', true); 
		textarea.style.visibility="hidden";
	}
}

WYSIWYG.SwSetHTMLValue=function(n,strHTML)
{
	var doc = this.getEditorWindow(n).document;
	doc.body.innerHTML=strHTML;
}


/* ---------------------------------------------------------------------- *\
  Function    : SwHideEditor()
  Description : Hide editor
  Usage       : WYSIWYG.SwHideEditor(n)
  Arguments   : n - The editor identifier (the textarea's ID)
\* ---------------------------------------------------------------------- */
WYSIWYG.SwHideEditor= function(n) {

	var editor = this.getEditorDiv(n);
	if(editor) {editor.style.display = "none";}
}

/* ---------------------------------------------------------------------- *\
  Function    : SwShowEditor()
  Description : show editor
  Usage       : WYSIWYG.SwShowEditor(n)
  Arguments   : n - The editor identifier (the textarea's ID)
\* ---------------------------------------------------------------------- */
WYSIWYG.SwShowEditor= function(n) {

	var editor = this.getEditorDiv(n);
	if(editor) {editor.style.display = "block";}
}


/**
 * Disable the given WYSIWYG Editor Box
 * 
 * @param {String} n The editor identifier (the textarea's ID)
 */ 
WYSIWYG.disable= function(n) {
	
	// get the editor window
	var editor = this.getEditorWindow(n);

	// Validate if editor exists
	if(editor == null) {
		alert("No editor found with the given identifier (ID: " + n + ").");
		return;
	}
	
	if(editor) {
		// disable design mode or content editable feature
		if(editor.document.body.contentEditable) {
			editor.document.body.contentEditable = false;
		}
		else {
			editor.document.designMode = "Off";		
		}
			
		// change the style of the body
		WYSIWYG_Core.setAttribute(editor.document.body, "style", this.config[n].DisabledStyle);
		
		// hide the status bar
		this.hideStatusBar(n);
						
		// hide all toolbars
		this.hideToolbars(n);
	}
}
	
/**
 * Enables the given WYSIWYG Editor Box
 * 
 * @param {String} n The editor identifier (the textarea's ID)
 */
WYSIWYG.enable= function(n) {
		
	// get the editor window
	var editor = this.getEditorWindow(n);

	// Validate if editor exists
	if(editor == null) {
		alert("No editor found with the given identifier (ID: " + n + ").");
		return;
	}
	
	if(editor) {
		// disable design mode or content editable feature
		if(editor.document.body.contentEditable){
			editor.document.body.contentEditable = true;
		}
		else {
			editor.document.designMode = "On";		
		}
			
		// change the style of the body
		WYSIWYG_Core.setAttribute(editor.document.body, "style", this.config[n].DefaultStyle);
		
		// hide the status bar
		this.showStatusBar(n);
						
		// hide all toolbars
		this.showToolbars(n);
	}
}


/* ---------------------------------------------------------------------- *\
  Function    : SwGetTextContent()
  Description : returns the text source of the WYSIWYG
  Arguments   : n   - The editor identifier (the textarea's ID)
\* ---------------------------------------------------------------------- */
WYSIWYG.SwGetTextContent= function(n) {	
	// get inner HTML
	var node = this.getEditorWindow(n).document.body;

	if(node.innerText)return node.innerText;

	if(node.textContent)
	{
		//-- create tmpnode to store modified innerHTML
		var element = document.getElementById("tmpDiv");
		if(element==null)
		{
			element = document.createElement("DIV");
			element.setAttribute("id","tmpDiv");
		}
		//-- replace line breaks and then repalce br with newline
		element.innerHTML = node.innerHTML.replace(/(\r\n)|(\n)/ig, "").replace(/<br>/ig, "\n");
		return element.textContent;
	}
	return "";
}


/* ---------------------------------------------------------------------- *\
  Function    : SwGetHtmlContent()
  Description : returns the HTML source of the WYSIWYG
  Arguments   : n   - The editor identifier (the textarea's ID)
\* ---------------------------------------------------------------------- */
WYSIWYG.SwGetHtmlContent= function(n) {	

	//-- get all images and set src to src='cid:213123123'
	
	//-- for each image get swcid att value and replace src att with cid:<swcidvalue>
	var arrImageCIDS = new Array();
	var arrImageSrcs = new Array();
	var arrImages = this.getEditorWindow(n).document.getElementsByTagName("img");
	for(var i=0;i<arrImages.length;i++) 
	{
		var swcid = arrImages[i].getAttribute("swcid");
		var src = arrImages[i].getAttribute("src");
		arrImageSrcs[i] = src;
		arrImageCIDS[i] = swcid;
		arrImages[i].setAttribute("src", "cid:" + swcid);
		arrImages[i].removeAttribute("swcid"); //-- so html will be clean
	}

	// get inner HTML
	var content = this.getEditorWindow(n).document.body.innerHTML;

	//-- for each image revert back to its normal image src
	for(var i=0;i<arrImages.length;i++) 
	{
		var swcid = arrImages[i].getAttribute("src");
		var src = arrImageSrcs[i];
		arrImages[i].setAttribute("src",src);
		arrImages[i].setAttribute("swcid",arrImageCIDS[i]);
	}

	// strip off defined URLs on IE
	content = this.stripURLPath(n, content);
	// replace all decimal color strings with hex color strings
	content = WYSIWYG_Core.replaceRGBWithHexColor(content);
	// remove line breaks before content will be updated
	if(this.config[n].ReplaceLineBreaks) { content = content.replace(/(\r\n)|(\n)/ig, ""); }

	//-- set html tag etc
	var swDoc = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">';
		swDoc += '<HTML><HEAD>';
		swDoc += '<META content="text/html; charset=windows-1252" http-equiv=Content-Type>';
		swDoc += '<META name=GENERATOR content="MSHTML 8.00.6001.18928"></HEAD>';
		swDoc += '<BODY>';
		swDoc += content;
		swDoc += '</BODY>';
		swDoc += '</HTML>';

	return swDoc;
}




/**
 * Output the context menu items
 *
 * @param n Editor identifier
 */

WYSIWYG_ContextMenu.init= function(n,optTargetDoc) 
{
	var doc = (optTargetDoc==undefined)?WYSIWYG.getEditorWindow(n).document:optTargetDoc;
		
	// create context menu div
	this.contextMenuDiv = document.createElement("div");
	this.contextMenuDiv.className = "wysiwyg-context-menu-div";
	this.contextMenuDiv.setAttribute("class", "wysiwyg-context-menu-div");
	this.contextMenuDiv.style.display = "none";
	this.contextMenuDiv.style.position = "absolute";
	this.contextMenuDiv.style.zIndex = 9999;
	this.contextMenuDiv.style.left = "0";
	this.contextMenuDiv.style.top = "0";
	this.contextMenuDiv.unselectable = "on";		
	document.body.insertBefore(this.contextMenuDiv, document.body.firstChild);

	// bind event listeners
	WYSIWYG_Core.addEvent(doc, "contextmenu", function context(e) { WYSIWYG_ContextMenu.show(e, n); });
	
	if(app.isSafari) WYSIWYG_Core.addEvent(doc, "mousedown", function context(e) { WYSIWYG_ContextMenu.show(e, n); });

	WYSIWYG_Core.addEvent(doc, "click", function context(e) { WYSIWYG_ContextMenu.close(); });
	if(optTargetDoc==undefined)WYSIWYG_Core.addEvent(doc, "keydown", function context(e) { WYSIWYG_ContextMenu.close(); });
	WYSIWYG_Core.addEvent(document, "click", function context(e) { WYSIWYG_ContextMenu.close(); });

	WYSIWYG_Core.addEvent(document, "click", function context(e) { WYSIWYG_ContextMenu.close(); });
}

WYSIWYG_ContextMenu.show= function(e, n) 
{
	//-- return as do not want to use context menu
	if(WYSIWYG._bDisableContentMenu) return false;
	
	if(this.contextMenuDiv == null) return false;

	if(app.isSafari && !e.shiftKey)
	{
		return false;
	}
	else if(!app.isSafari)
	{
		if(!e.ctrlKey && WYSIWYG._swplainmode) return false;
	}
	

	var ifrm = WYSIWYG.getEditor(n);
	var doc = WYSIWYG.getEditorWindow(n).document;

	// set the context menu position
	if(WYSIWYG._swplainmode)
	{
		var pos = new Object();
		pos.left=0;
		pos.top=0;
	}
	else
	{
		var pos = WYSIWYG_Core.getElementPosition(ifrm);		
	}
	var x = WYSIWYG_Core.isMSIE ? pos.left + e.clientX : pos.left + (e.pageX - doc.body.scrollLeft);
	var y = WYSIWYG_Core.isMSIE ? pos.top + e.clientY : pos.top + (e.pageY - doc.body.scrollTop);
				
	this.contextMenuDiv.style.left = x + "px"; 
	this.contextMenuDiv.style.top = y + "px";
	this.contextMenuDiv.style.visibility = "visible";
	this.contextMenuDiv.style.display = "block";	
	
	// call the context menu, mozilla needs some time
	window.setTimeout("WYSIWYG_ContextMenu.output('" + n + "')", 10);
		
	WYSIWYG_Core.cancelEvent(e);
	return false;
}


WYSIWYG_ContextMenu.output= function (n) 
{
	// get selection
	var sel = WYSIWYG.getSelection(n);
	var tag = null;
	var range = "";
	if(sel!=null && sel!="")
	{
		var range = WYSIWYG.getRange(sel);
		// get current selected node					
		var tag = WYSIWYG.getTag(range);
		//if(tag == null) { return; } //-- was failing in email editor
	}

	// clear context menu
	this.clear();

	// Determine kind of nodes
	var isImg = (tag && tag.nodeName == "IMG") ? true : false;
	var isLink = (tag && tag.nodeName == "A") ? true : false;
	
	// Selection is an image or selection is a text with length greater 0
	var len = 0;
	if(WYSIWYG_Core.isMSIE)
		len = (document.selection && range.text) ? range.text.length : 0;
	else
		len = range.toString().length;
	var sel = len != 0 || isImg;
	
	// Icons
	var iconLink = { enabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["createlink"][3], disabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["createlink"][2]};
	var iconImage = { enabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["insertimage"][3], disabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["insertimage"][2]};
	var iconDelete = { enabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["delete"][3], disabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["delete"][2]};
	var iconCopy = { enabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["copy"][3], disabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["copy"][2]};
	var iconCut = { enabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["cut"][3], disabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["cut"][2]};
	var iconPaste = { enabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["paste"][3], disabled: WYSIWYG.config[n].ImagesDir + WYSIWYG.ToolbarList["paste"][2]};
	
	// Create context menu html
	this.html += '<table class="wysiwyg-context-menu" border="0" cellpadding="0" cellspacing="0">';
	
	// Add items
	if(!WYSIWYG._swplainmode && app.isIE)
	{
		this.addItem(n, 'Copy', iconCopy, 'Copy', sel);
		this.addItem(n, 'Cut', iconCut, 'Cut', sel);
		this.addItem(n, 'Paste', iconPaste, 'Paste', true);
		this.addSeperator();
	}
	//-- sw items
	//-- multi clip
	var bGroupMc = app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE);
	var bPersonalMc = app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE);
	if(bGroupMc || bPersonalMc)	this.addItem(n, 'PasteMC', iconPaste, 'Paste From Multi-Clip', true);
	//-- email sig
	this.addItem(n, 'InsertSignature', iconPaste, 'Insert Signature', true);
	this.html += '</table>';
	this.contextMenuDiv.innerHTML = this.html;
}
