var SupportworksSettings=new WYSIWYG.Settings();SupportworksSettings.Toolbar[0]=new Array("font","fontsize","seperator","bold","italic","underline","seperator","forecolor","seperator","insertimage","createlink","seperator","justifyfull","justifyleft","justifycenter","justifyright","seperator","unorderedlist","orderedlist","seperator","outdent","indent","seperator","undo","redo");SupportworksSettings.Toolbar[1]="";SupportworksSettings.StatusBarEnabled=false;SupportworksSettings.InvertIELineBreaks=true;SupportworksSettings.ReplaceLineBreaks=true;SupportworksSettings.ImagesDir="thirdparty/wysiwyg/images/";SupportworksSettings.PopupsDir="thirdparty/wysiwyg/popups/";SupportworksSettings.CSSFile="thirdparty/wysiwyg/styles/wysiwyg.css";SupportworksSettings.DisabledStyle="font-family: Arial; font-size: 12px; background-color: #FFFFFF";SupportworksSettings._swplainmode=false;SupportworksSettings._bDisableContentMenu=false;WYSIWYG_Core.isBrowserCompatible=function(){if(!document.getElementById||!document.designMode){return false;}return true;},WYSIWYG.execCommand=function(n,cmd,value){this.getEditorWindow(n).focus();var textModeCommands=new Array("ViewText","Print");var cmdValid=false;for(var i=0;i<textModeCommands.length;i++){if(textModeCommands[i]==cmd){cmdValid=true;}}if(this.viewTextMode[n]&&!cmdValid){alert("You are in TEXT Mode. This feature has been disabled.");return;}var toHexColor=WYSIWYG_Core.isMSIE?WYSIWYG_Core._dec_to_rgb:WYSIWYG_Core.toHexColor;var popupPosition={left:parseInt(window.screen.availWidth/3),top:parseInt(window.screen.availHeight/3)};var imagePopupFile=this.config[n].PopupsDir+"insert_image.html";var imagePopupWidth=400;var imagePopupHeight=210;if(typeof this.config[n].ImagePopupFile!="undefined"&&this.config[n].ImagePopupFile!=""){imagePopupFile=this.config[n].ImagePopupFile;}if(typeof this.config[n].ImagePopupWidth&&this.config[n].ImagePopupWidth>0){imagePopupWidth=this.config[n].ImagePopupWidth;}if(typeof this.config[n].ImagePopupHeight&&this.config[n].ImagePopupHeight>0){imagePopupHeight=this.config[n].ImagePopupHeight;}switch(cmd){case"PasteMC":WYSIWYG_ContextMenu.close(n);WYSIWYG.SwInsertMultiClip(n);break;case"InsertSignature":WYSIWYG_ContextMenu.close(n);WYSIWYG.SwInsertEmailSignature(n);break;case"Maximize":this.maximize(n);break;case"FormatBlock":WYSIWYG_Core.execCommand(n,cmd,"<"+value+">");break;case"ForeColor":var rgb=this.getEditorWindow(n).document.queryCommandValue(cmd);var currentColor=rgb!=""?toHexColor(this.getEditorWindow(n).document.queryCommandValue(cmd)):"000000";window.open(this.config[n].PopupsDir+"select_color.html?color="+currentColor+"&command="+cmd+"&wysiwyg="+n,"popup","location=0,status=0,scrollbars=0,width=210,height=165,top="+popupPosition.top+",left="+popupPosition.left).focus();break;case"BackColor":var currentColor=toHexColor(this.getEditorWindow(n).document.queryCommandValue(cmd));window.open(this.config[n].PopupsDir+"select_color.html?color="+currentColor+"&command="+cmd+"&wysiwyg="+n,"popup","location=0,status=0,scrollbars=0,width=210,height=165,top="+popupPosition.top+",left="+popupPosition.left).focus();break;case"InsertImage":if(fl_imageinsert){var strPrefixFileWith="att."+app.global.GetCurrentEpocTime()+".";fl_imageinsert.AddFiles("CID",strPrefixFileWith);}break;case"RemoveImage":this.removeImage(n);break;case"RemoveLink":this.removeLink(n);break;case"RemoveNode":this.removeNode(n);break;case"CreateLink":var strURL=this.getLinkHref(n);var strURL=prompt("Please enter a URL address",strURL);if(strURL==""||strURL==null){return false;}this.insertLink(strURL,"_blank","","","",n);break;case"InsertTable":window.open(this.config[n].PopupsDir+"create_table.html?wysiwyg="+n,"popup","location=0,status=0,scrollbars=0,resizable=0,width=500,height=260,top="+popupPosition.top+",left="+popupPosition.left).focus();break;case"ViewSource":this.viewSource(n);break;case"ViewText":this.viewText(n);break;case"Help":window.open(this.config[n].PopupsDir+"about.html?wysiwyg="+n,"popup","location=0,status=0,scrollbars=0,resizable=0,width=400,height=350,top="+popupPosition.top+",left="+popupPosition.left).focus();break;case"RemoveFormat":this.removeFormat(n);break;case"Preview":window.open(this.config[n].PopupsDir+"preview.html?wysiwyg="+n,"popup","location=0,status=0,scrollbars=1,resizable=1,width="+this.config[n].PreviewWidth+",height="+this.config[n].PreviewHeight+",top="+popupPosition.top+",left="+popupPosition.left).focus();break;case"Print":this.print(n);break;case"Save":WYSIWYG.updateTextArea(n);var form=WYSIWYG_Core.findParentNode("FORM",this.getEditor(n));if(form==null){alert("Can not submit the content, because no form element found.");return;}form.submit();break;case"Return":location.replace(this.config[n].Opener);break;default:WYSIWYG_Core.execCommand(n,cmd,value);}this.closeDropDowns(n);};WYSIWYG.getLinkHref=function(n){var sel=this.getSelection(n);var range=this.getRange(sel);var lin=null;if(WYSIWYG_Core.isMSIE){if(sel.type=="Control"&&range.length==1){range=this.getTextRange(range(0));range.select();}if(sel.type=="Text"||sel.type=="None"){sel=this.getSelection(n);range=this.getRange(sel);lin=this.findParent("a",range);}}else{lin=this.findParent("a",range);}if(lin==null){return"http://";}var strURL=lin.getAttribute("href");if(WYSIWYG_Core.isMSIE){strURL=WYSIWYG.stripURLPath(n,strURL,false);}return strURL;};WYSIWYG.insertLink=function(href,target,style,styleClass,name,n){var undefined;var doc=this.getEditorWindow(n).document;var sel=this.getSelection(n);var range=this.getRange(sel);var lin=null;if(WYSIWYG_Core.isMSIE){if(sel.type=="Control"&&range.length==1){range=this.getTextRange(range(0));range.select();}}lin=this.findParent("a",range);var update=(lin==null)?false:true;if(!update){lin=doc.createElement("a");}WYSIWYG_Core.setAttribute(lin,"href",href);WYSIWYG_Core.setAttribute(lin,"class",styleClass);WYSIWYG_Core.setAttribute(lin,"className",styleClass);WYSIWYG_Core.setAttribute(lin,"target",target);WYSIWYG_Core.setAttribute(lin,"name",name);WYSIWYG_Core.setAttribute(lin,"style",style);if(update){return;}if(WYSIWYG_Core.isMSIE){range.select();if(range.htmlText==""){lin.innerHTML=href;}else{lin.innerHTML=range.htmlText;}range.pasteHTML(lin.outerHTML);}else{if(sel==""){sel=href;}lin.innerHTML=sel;this.insertNodeAtSelection(lin,n);}};WYSIWYG.SwCreateNow=function(id,settings){if(id!="all"){this.setSettings(id,settings);WYSIWYG_Core.includeCSS(this.config[id].CSSFile);WYSIWYG._generate(id,settings);}else{WYSIWYG.attachAll(settings);}WYSIWYG_Core.addEvent(this.getEditorWindow(id),"blur",function(){WYSIWYG.onBlur(id);});};WYSIWYG.onBlur=function(id){var strFunctionName=id+"_OnRichTextEditorBlur";if(top[strFunctionName]){top[strFunctionName](this,this.getEditorWindow(id).document.body.innerHTML,this.SwGetHtmlContent(id),this.SwGetTextContent(id));}};WYSIWYG.SwInsertEmailSignature=function(n){var strFunctionName=n+"_InsertEmailSignature";if(top[strFunctionName]){top[strFunctionName](n,this);}};WYSIWYG.SwGetMode=function(){return this._swplainmode;};WYSIWYG.SwInsertMultiClip=function(n){var bGroupMc=app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE);var bPersonalMc=app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE);if(!bGroupMc&&!bPersonalMc){return false;}var editor=this;app._open_system_form("multiclippicker.php","multiclip","","",true,function(oForm){if(oForm.selected){var xmlmc=new XmlMethodCall();xmlmc.SetParam("itemId",oForm.multiclipid);if(xmlmc.Invoke("system","multiClipGetItemData")){var strInsertData=xmlmc.GetParam("itemData");if(editor._swplainmode){if(_swdoc.mainform[n]){_swdoc.mainform[n]._insert_text_at_cursor(strInsertData);}else{if(_swdoc.extform[n]){_swdoc.extform[n]._insert_text_at_cursor(strInsertData);}}}else{strInsertData=strInsertData.replace(/\n\r|\n/ig,"<br>");WYSIWYG.insertHTML(strInsertData,n);}}}},null,window,250,250);};WYSIWYG.insertImage=function(src,width,height,align,border,alt,hspace,vspace,n,sCID){var doc=this.getEditorWindow(n).document;try{doc.body.focus();}catch(e){}var sel=this.getSelection(n);var range=this.getRange(sel);var img=this.findParent("img",range);var update=(img==null)?false:true;if(!update){img=doc.createElement("img");}WYSIWYG_Core.setAttribute(img,"src",src);WYSIWYG_Core.setAttribute(img,"style","width:"+width+";height:"+height);if(align!=""){WYSIWYG_Core.setAttribute(img,"align",align);}else{img.removeAttribute("align");}if(sCID!=undefined&&sCID!=""){WYSIWYG_Core.setAttribute(img,"swcid",sCID);}WYSIWYG_Core.setAttribute(img,"border",border);WYSIWYG_Core.setAttribute(img,"alt",alt);WYSIWYG_Core.setAttribute(img,"hspace",hspace);WYSIWYG_Core.setAttribute(img,"vspace",vspace);img.removeAttribute("width");img.removeAttribute("height");if(update){return;}if(WYSIWYG_Core.isMSIE){range.pasteHTML(img.outerHTML);}else{this.insertNodeAtSelection(img,n);}};WYSIWYG.insertNodeAtSelection=function(insertNode,n){var doc=this.getEditorWindow(n).document;var sel=this.getSelection(n);var range=sel.getRangeAt(0);sel.removeAllRanges();range.deleteContents();var container=range.startContainer;var pos=range.startOffset;range=doc.createRange();if(container.nodeType==3&&insertNode.nodeType==3){container.insertData(pos,insertNode.data);range.setEnd(container,pos+insertNode.length);range.setStart(container,pos+insertNode.length);}else{var afterNode;var beforeNode;if(container.nodeType==3){var textNode=container;container=textNode.parentNode;var text=textNode.nodeValue;var textBefore=text.substr(0,pos);var textAfter=text.substr(pos);beforeNode=document.createTextNode(textBefore);afterNode=document.createTextNode(textAfter);container.insertBefore(afterNode,textNode);container.insertBefore(insertNode,afterNode);container.insertBefore(beforeNode,insertNode);container.removeChild(textNode);}else{afterNode=container.childNodes[pos];container.insertBefore(insertNode,afterNode);}try{range.setEnd(afterNode,0);range.setStart(afterNode,0);}catch(e){}}sel.addRange(range);};WYSIWYG._generate=function(n,settings){var textarea=_$(n);if(textarea==null){alert("No textarea found with the given identifier (ID: "+n+").");return;}if(!WYSIWYG_Core.isBrowserCompatible()){if(this.config[n].NoValidBrowserMessage!=""){alert(this.config[n].NoValidBrowserMessage);}return;}if(textarea.style.width){this.config[n].Width=textarea.style.width;}if(textarea.style.height){this.config[n].Height=textarea.style.height;}var currentWidth=this.config[n].Width;var currentHeight=this.config[n].Height;var textAreaTop=textarea.offsetTop;var textAreaLeft=textarea.offsetLeft;textarea.style.visibility="hidden";textarea.setAttribute("disabled",true);var toolbarWidth=currentWidth;var ifrmWidth="100%";var ifrmHeight="100%";if(currentWidth.search(/%/)==-1){toolbarWidth=currentWidth.replace(/px/gi,"");toolbarWidth=(parseFloat(toolbarWidth)+2)+"px";}var editor="";editor+='<div id="wysiwyg_div_'+n+'" style="position:absolute;top:'+textAreaTop+";left:"+textAreaLeft+";height:"+currentHeight+";width:"+currentWidth+';">';editor+='<table border="0" cellpadding="0" cellspacing="0" class="tableTextareaEditor" id="wysiwyg_table_'+n+'" style="width:100%; height:100%;">';editor+='<tr><td style="height:22px;vertical-align:top;">';for(var j=0;j<this.config[n].Toolbar.length;j++){if(this.config[n].Toolbar[j]&&this.config[n].Toolbar[j].length>0){var toolbar=this.config[n].Toolbar[j];editor+='<table border="0" cellpadding="0" cellspacing="0" class="toolbar1" style="width:100%;" id="toolbar'+j+"_"+n+'">';editor+='<tr><td style="width:6px;"><img src="'+this.config[n].ImagesDir+'seperator2.gif" alt="" hspace="3"></td>';for(var i=0;i<toolbar.length;i++){var id=toolbar[i];if(toolbar[i]){if(typeof(this.config[n].DropDowns[id])!="undefined"){var dropdown=this.config[n].DropDowns[id];editor+='<td style="width: '+dropdown.width+';">';editor+=this.writeDropDown(n,id);editor+="</td>";}else{var buttonObj=this.ToolbarList[toolbar[i]];if(buttonObj){var buttonID=buttonObj[0];var buttonTitle=buttonObj[1];var buttonImage=this.config[n].ImagesDir+buttonObj[2];var buttonImageRollover=this.config[n].ImagesDir+buttonObj[3];if(toolbar[i]=="seperator"){editor+='<td style="width: 12px;" align="center">';editor+='<img src="'+buttonImage+'" border=0 unselectable="on" width="2" height="18" hspace="2" unselectable="on">';editor+="</td>";}else{if(toolbar[i]=="viewSource"){editor+='<td style="width: 22px;">';editor+='<span id="HTMLMode'+n+'"><img src="'+buttonImage+'" border="0" unselectable="on" title="'+buttonTitle+'" id="'+buttonID+'" class="buttonEditor" onmouseover="this.className=\'buttonEditorOver\'; this.src=\''+buttonImageRollover+"';\" onmouseout=\"this.className='buttonEditor'; this.src='"+buttonImage+"';\" onclick=\"WYSIWYG.execCommand('"+n+"', '"+buttonID+'\');" unselectable="on" width="20" height="20"></span>';editor+='<span id="textMode'+n+'"><img src="'+this.config[n].ImagesDir+'view_text.gif" border="0" unselectable="on" title="viewText" id="ViewText" class="buttonEditor" onmouseover="this.className=\'buttonEditorOver\'; this.src=\''+this.config[n].ImagesDir+"view_text_on.gif';\" onmouseout=\"this.className='buttonEditor'; this.src='"+this.config[n].ImagesDir+"view_text.gif';\" onclick=\"WYSIWYG.execCommand('"+n+'\',\'ViewText\');" unselectable="on"  width="20" height="20"></span>';editor+="</td>";}else{editor+='<td style="width: 22px;">';editor+='<img src="'+buttonImage+'" border=0 unselectable="on" title="'+buttonTitle+'" id="'+buttonID+'" class="buttonEditor" onmouseover="this.className=\'buttonEditorOver\'; this.src=\''+buttonImageRollover+"';\" onmouseout=\"this.className='buttonEditor'; this.src='"+buttonImage+"';\" onclick=\"WYSIWYG.execCommand('"+n+"', '"+buttonID+'\');" unselectable="on" width="20" height="20">';editor+="</td>";}}}}}}editor+="<td>&nbsp;</td></tr></table>";}}editor+='</td></tr><tr><td valign="top">\n';editor+='<iframe frameborder="0" id="wysiwyg'+n+'" class="iframeText" style="width:100%;height:'+ifrmHeight+';"></iframe>\n'+"</td></tr>";if(this.config[n].StatusBarEnabled){editor+='<tr><td class="wysiwyg-statusbar" style="height:10px;" id="wysiwyg_statusbar_'+n+'">&nbsp;</td></tr>';}editor+="</table>";editor+="</div>";textarea.insertAdjacentHTML("afterEnd",editor);if(_$("textMode"+n)){_$("textMode"+n).style.display="none";}var content=textarea.value;var doc=this.getEditorWindow(n).document;if(this.config[n].ReplaceLineBreaks){content=content.replace(/\n\r|\n/ig,"<br>");}doc.open();doc.write(content);doc.close();if(doc.body.contentEditable){doc.body.contentEditable=true;}else{doc.designMode="on";}WYSIWYG_Core.setAttribute(doc.body,"style",this.config[n].DefaultStyle);WYSIWYG_Table.refreshHighlighting(n);for(var idx=0;idx<document.forms.length;idx++){WYSIWYG_Core.addEvent(document.forms[idx],"submit",function xxx_aa(){WYSIWYG.updateTextArea(n);});}WYSIWYG_Core.addEvent(doc,"mouseover",function xxx_bb(){WYSIWYG.closeDropDowns(n);});if(this.config[n].InvertIELineBreaks){WYSIWYG_Core.addEvent(doc,"keypress",function xxx_cc(){WYSIWYG.invertIELineBreakCapability(n);});}if(this.config[n].StatusBarEnabled){WYSIWYG_Core.addEvent(doc,"mouseup",function xxx_dd(){WYSIWYG.updateStatusBar(n);});}if(this.config[n].ContextMenu){WYSIWYG_ContextMenu.init(n);}this.viewTextMode[n]=false;};WYSIWYG.SwPlainTextOnlyMode=function(n,bPlainTextOnly,bSkipMessage){if(bSkipMessage==undefined){bSkipMessage=false;}var textarea=_$(n);if(textarea==null){alert("No textarea found with the given identifier (ID: "+n+").");return;}if(bPlainTextOnly){if(!this._swplainmode&&!bSkipMessage){if(!confirm("Changing the formatting from HTML to plain text requires removing all the current formatting, including any pictures you may have included.\nAre you sure you want to do this?")){return;}}this._swplainmode=true;textarea.value=this.SwGetTextContent(n);textarea.removeAttribute("disabled");textarea.style.visibility="visible";this.disable(n);this.SwHideEditor(n);}else{if(!this._swplainmode){return;}this._swplainmode=false;var doc=this.getEditorWindow(n).document;doc.body.innerHTML=textarea.value.replace(/(\r\n)|(\n)/ig,"<br>");this.enable(n);this.SwShowEditor(n);textarea.setAttribute("disabled",true);textarea.style.visibility="hidden";}};WYSIWYG.SwSetHTMLValue=function(n,strHTML){var doc=this.getEditorWindow(n).document;doc.body.innerHTML=strHTML;};WYSIWYG.SwHideEditor=function(n){var editor=this.getEditorDiv(n);if(editor){editor.style.display="none";}};WYSIWYG.SwShowEditor=function(n){var editor=this.getEditorDiv(n);if(editor){editor.style.display="block";}};WYSIWYG.disable=function(n){var editor=this.getEditorWindow(n);if(editor==null){alert("No editor found with the given identifier (ID: "+n+").");return;}if(editor){if(editor.document.body.contentEditable){editor.document.body.contentEditable=false;}else{editor.document.designMode="Off";}WYSIWYG_Core.setAttribute(editor.document.body,"style",this.config[n].DisabledStyle);this.hideStatusBar(n);this.hideToolbars(n);}};WYSIWYG.enable=function(n){var editor=this.getEditorWindow(n);if(editor==null){alert("No editor found with the given identifier (ID: "+n+").");return;}if(editor){if(editor.document.body.contentEditable){editor.document.body.contentEditable=true;}else{editor.document.designMode="On";}WYSIWYG_Core.setAttribute(editor.document.body,"style",this.config[n].DefaultStyle);this.showStatusBar(n);this.showToolbars(n);}};WYSIWYG.SwGetTextContent=function(n){var node=this.getEditorWindow(n).document.body;if(node.innerText){return node.innerText;}if(node.textContent){var element=document.getElementById("tmpDiv");if(element==null){element=document.createElement("DIV");element.setAttribute("id","tmpDiv");}element.innerHTML=node.innerHTML.replace(/(\r\n)|(\n)/ig,"").replace(/<br>/ig,"\n");return element.textContent;}return"";};WYSIWYG.SwGetHtmlContent=function(n){var arrImageCIDS=new Array();var arrImageSrcs=new Array();var arrImages=this.getEditorWindow(n).document.getElementsByTagName("img");for(var i=0;i<arrImages.length;i++){var swcid=arrImages[i].getAttribute("swcid");var src=arrImages[i].getAttribute("src");arrImageSrcs[i]=src;arrImageCIDS[i]=swcid;arrImages[i].setAttribute("src","cid:"+swcid);arrImages[i].removeAttribute("swcid");}var content=this.getEditorWindow(n).document.body.innerHTML;for(var i=0;i<arrImages.length;i++){var swcid=arrImages[i].getAttribute("src");var src=arrImageSrcs[i];arrImages[i].setAttribute("src",src);arrImages[i].setAttribute("swcid",arrImageCIDS[i]);}content=this.stripURLPath(n,content);content=WYSIWYG_Core.replaceRGBWithHexColor(content);if(this.config[n].ReplaceLineBreaks){content=content.replace(/(\r\n)|(\n)/ig,"");}var swDoc='<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">';swDoc+="<HTML><HEAD>";swDoc+='<META content="text/html; charset=windows-1252" http-equiv=Content-Type>';swDoc+='<META name=GENERATOR content="MSHTML 8.00.6001.18928"></HEAD>';swDoc+="<BODY>";swDoc+=content;swDoc+="</BODY>";swDoc+="</HTML>";return swDoc;};WYSIWYG_ContextMenu.init=function(n,optTargetDoc){var doc=(optTargetDoc==undefined)?WYSIWYG.getEditorWindow(n).document:optTargetDoc;this.contextMenuDiv=document.createElement("div");this.contextMenuDiv.className="wysiwyg-context-menu-div";this.contextMenuDiv.setAttribute("class","wysiwyg-context-menu-div");this.contextMenuDiv.style.display="none";this.contextMenuDiv.style.position="absolute";this.contextMenuDiv.style.zIndex=9999;this.contextMenuDiv.style.left="0";this.contextMenuDiv.style.top="0";this.contextMenuDiv.unselectable="on";document.body.insertBefore(this.contextMenuDiv,document.body.firstChild);WYSIWYG_Core.addEvent(doc,"contextmenu",function context(e){WYSIWYG_ContextMenu.show(e,n);});if(app.isSafari){WYSIWYG_Core.addEvent(doc,"mousedown",function context(e){WYSIWYG_ContextMenu.show(e,n);});}WYSIWYG_Core.addEvent(doc,"click",function context(e){WYSIWYG_ContextMenu.close();});if(optTargetDoc==undefined){WYSIWYG_Core.addEvent(doc,"keydown",function context(e){WYSIWYG_ContextMenu.close();});}WYSIWYG_Core.addEvent(document,"click",function context(e){WYSIWYG_ContextMenu.close();});WYSIWYG_Core.addEvent(document,"click",function context(e){WYSIWYG_ContextMenu.close();});};WYSIWYG_ContextMenu.show=function(e,n){if(WYSIWYG._bDisableContentMenu){return false;}if(this.contextMenuDiv==null){return false;}if(app.isSafari&&!e.shiftKey){return false;}else{if(!app.isSafari){if(!e.ctrlKey&&WYSIWYG._swplainmode){return false;}}}var ifrm=WYSIWYG.getEditor(n);var doc=WYSIWYG.getEditorWindow(n).document;if(WYSIWYG._swplainmode){var pos=new Object();pos.left=0;pos.top=0;}else{var pos=WYSIWYG_Core.getElementPosition(ifrm);}var x=WYSIWYG_Core.isMSIE?pos.left+e.clientX:pos.left+(e.pageX-doc.body.scrollLeft);var y=WYSIWYG_Core.isMSIE?pos.top+e.clientY:pos.top+(e.pageY-doc.body.scrollTop);this.contextMenuDiv.style.left=x+"px";this.contextMenuDiv.style.top=y+"px";this.contextMenuDiv.style.visibility="visible";this.contextMenuDiv.style.display="block";window.setTimeout("WYSIWYG_ContextMenu.output('"+n+"')",10);WYSIWYG_Core.cancelEvent(e);return false;};WYSIWYG_ContextMenu.output=function(n){var sel=WYSIWYG.getSelection(n);var tag=null;var range="";if(sel!=null&&sel!=""){var range=WYSIWYG.getRange(sel);var tag=WYSIWYG.getTag(range);}this.clear();var isImg=(tag&&tag.nodeName=="IMG")?true:false;var isLink=(tag&&tag.nodeName=="A")?true:false;var len=0;if(WYSIWYG_Core.isMSIE){len=(document.selection&&range.text)?range.text.length:0;}else{len=range.toString().length;}var sel=len!=0||isImg;var iconLink={enabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["createlink"][3],disabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["createlink"][2]};var iconImage={enabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["insertimage"][3],disabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["insertimage"][2]};var iconDelete={enabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["delete"][3],disabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["delete"][2]};var iconCopy={enabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["copy"][3],disabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["copy"][2]};var iconCut={enabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["cut"][3],disabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["cut"][2]};var iconPaste={enabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["paste"][3],disabled:WYSIWYG.config[n].ImagesDir+WYSIWYG.ToolbarList["paste"][2]};this.html+='<table class="wysiwyg-context-menu" border="0" cellpadding="0" cellspacing="0">';if(!WYSIWYG._swplainmode&&app.isIE){this.addItem(n,"Copy",iconCopy,"Copy",sel);this.addItem(n,"Cut",iconCut,"Cut",sel);this.addItem(n,"Paste",iconPaste,"Paste",true);this.addSeperator();}var bGroupMc=app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE);var bPersonalMc=app.session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE);if(bGroupMc||bPersonalMc){this.addItem(n,"PasteMC",iconPaste,"Paste From Multi-Clip",true);}this.addItem(n,"InsertSignature",iconPaste,"Insert Signature",true);this.html+="</table>";this.contextMenuDiv.innerHTML=this.html;};