var application_navbar=null;function has_view_permissions(strPermission){var arrPermissions=strPermission.replace(" ","").split(",");for(var x=0;x<arrPermissions.length;x++){var arrP=arrPermissions[x].split(".");if(arrP[0]=="app"){if(!session.HaveAppRight(arrP[1],arrP[2])){return false;}}else{if(arrP[0]=="sys"){if(!session.HaveRight(arrP[1],arrP[2])){return false;}}}}return true;}function load_application_navbar(tEle){var strXML="";var strMenuItems="";var altStartView="";var strStartView=dd.GetGlobalParam("views/startupview");var expandedItems=_get_webclient_cookie("_wc_outlookbar_items");var arrItems=expandedItems.split(",");var intExpandItemLength=arrItems.length;if(expandedItems==""){intExpandItemLength=0;}var arrExpandedItems=new Array();for(var x=0;x<arrItems.length;x++){if(arrItems[x]==""){continue;}arrExpandedItems[arrItems[x]]=true;}var iMin=0;var iCounter=0;var arrViews=dd.GetGlobalParam("views");for(strViewName in arrViews){if(arrViews[strViewName].type!=undefined){var vr=arrViews[strViewName].visibilityrights;if(vr!=undefined&&vr!=""){if(!has_view_permissions(vr.toLowerCase())){continue;}}switch(arrViews[strViewName].type){case"calendar":if(_arr_xml_calendar_list.length<1){continue;}break;case"mail":if(!global.IsConnectedToMailServer()){continue;}break;case"dbsearch":continue;break;case"reports":if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANVIEWREPORTS)){continue;}break;case"knowledgebase":if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS)){continue;}break;}if(arrViews[strViewName].visible.toLowerCase()!="yes"){continue;}if(arrViews[strViewName].type=="autodbev"){if(app._xmlManagedEntitySearches==null){alert("Managed entity search functionality is switched on, however there are no definitions setup. Please contact your Administrator.");}else{var xmlOutlook=app._xmlManagedEntitySearches.getElementsByTagName("dbev");for(var x=0;x<xmlOutlook.length;x++){var xmlMES=xmlOutlook[x];var strName=app.xmlNodeTextByTag(xmlMES,"name");if(strName!=""){if(iCounter==0){altStartView=strViewName;}if(iCounter==4){iMin=1;}iCounter++;var strLeftTitle=app.xmlNodeTextByTag(xmlMES,"searchTitle");if(strLeftTitle==""){strLeftTitle=strName;}var strIcon=app.xmlNodeTextByTag(xmlMES,"icon");if(strIcon==""){strIcon=0;}if(arrExpandedItems[strName]){iMin=0;}else{if(intExpandItemLength>0){iMin=1;}}var cImage=app.xmlNodeTextByTag(xmlMES,"customicon");if(cImage!=""){cImage=_swc_parse_variablestring(cImage);}strMenuItems+='<link type="mes"	min="'+iMin+'" lefttitle="'+strLeftTitle+'" oid="'+strName+'" customimg="'+cImage+'" imgid="'+strIcon+'">'+strName+"</link>";}}}}else{if(iCounter==0){altStartView=strViewName;}if(iCounter==4){iMin=1;}iCounter++;if(arrExpandedItems[strViewName]){iMin=0;}else{if(intExpandItemLength>0){iMin=1;}}var cImage="";if(arrViews[strViewName].customicon&&arrViews[strViewName].customicon!=""){cImage=_swc_parse_variablestring(arrViews[strViewName].customicon);}var strLeftTitle=(arrViews[strViewName].viewtitle==undefined)?arrViews[strViewName].icontitle:arrViews[strViewName].viewtitle;strMenuItems+='<link type="'+arrViews[strViewName].type+'"	lefttitle="'+strLeftTitle+'" min="'+iMin+'" oid="'+strViewName+'" customimg="'+cImage+'" imgid="'+arrViews[strViewName].icon+'">'+arrViews[strViewName].icontitle+"</link>";}}}strXML="<navbar>";strXML+=strMenuItems;strXML+="</navbar>";var oXML=create_xml_dom(strXML);if(!oXML){alert("outlooks.js : load_application_navbar\n\nCould not load outlook xml string. Please contact your Administrator");return false;}app.addEvent(document.getElementById("nav-inout"),"click",showhide_navbar);application_navbar=new_navbar(oXML);application_navbar.draw(tEle);var strStartBar=(strStartView=="")?altStartView:strStartView;strStartBar=top.string_replace(strStartBar," ","_");if(strStartBar!=""){application_navbar.activatebar(strStartBar.toLowerCase());}setTimeout("check_navbar_scrolling()",100);}function forcehide_navbar(){app.eAppOutlook.style.display="none";var ele=document.getElementById("nav-inout");setElementText(document.getElementById("nav-inout")," ");_current_bar_item.setAttribute("leftpanesetting","hide");app._resize_browser_layout();}function showhide_navbar(e,bByCode){var ele=document.getElementById("nav-inout");if(bByCode==undefined&&_current_bar_item.getAttribute("leftpanesetting")=="hide"){return false;}var exp=ele.getAttribute("expanded");var strDisplay="none";var strText=">>";if(exp=="1"){exp="0";}else{exp="1";strDisplay="block";strText="<<";}app.eAppOutlook.style.display=strDisplay;setElementText(ele,strText);ele.setAttribute("expanded",exp);_current_bar_item.setAttribute("leftpanesetting",exp);app._resize_browser_layout();}function get_navbar_xml(){var strURL=app._customapplicationpath+app._navbarxmlname;var oXML=app.get_http(strURL,"",true,true,null);if(oXML){return oXML;}var strURL=app._applicationpath+app._navbarxmlname;var oXML=app.get_http(strURL,"",true,true,null);if(oXML){return oXML;}return false;}function new_navbar(oXml){var aLink;var tmpBar=new oNavbar();var arrLinks=oXml.getElementsByTagName("link");for(var x=0;x<arrLinks.length;x++){aLink=arrLinks[x];tmpBar.add_bar(aLink.getAttribute("oid"),aLink.getAttribute("type"),aLink.getAttribute("min"),app.xmlText(aLink),aLink.getAttribute("imgid"),aLink.getAttribute("lefttitle"),aLink.getAttribute("customimg"));}return tmpBar;}function oNavbar(){this.holder=null;this.array_bars=new Array();this.navitemshtml=new Array();this.activewidget=null;}oNavbar.prototype.add_bar=function(strID,strType,intMin,strText,intIcon,strLeftTitle,strCustomImage){if(intMin==null||intMin==""){intMin=1;}if(strCustomImage==null||strCustomImage==undefined){strCustomImage="";}this.array_bars[strID]=new Object();this.array_bars[strID].id=strID;this.array_bars[strID].type=strType;this.array_bars[strID].min=intMin;this.array_bars[strID].text=strText;this.array_bars[strID].imgid=intIcon;this.array_bars[strID].lefttitle=strLeftTitle;this.array_bars[strID].customimg=strCustomImage;};oNavbar.prototype.activatebar=function(strID){var eBar=app.get_parent_child_by_id(this.baritemholder,strID);if(eBar==null){return;}if(eBar.style.display=="none"){var eBar=app.get_parent_child_by_id(this.shortcutholder,strID);if(eBar==null){return;}}var eleSrc=app.get_parent_child_by_tag(eBar,"TR");activate_navbar(this.baritemholder,eleSrc);};oNavbar.prototype.draw=function(eleTarget){if(eleTarget){this.holder=eleTarget;this.widgetholder=app.get_parent_child_by_id(this.holder,"widget-holder");this.baritemholder=document.getElementById("nav-items");var oBar;for(strID in this.array_bars){this.draw_bar(strID);}this.baritemholder.innerHTML=this.navitemshtml.join("");this.holder.navbar=this;this.widgetholder.navbar=this;this.baritemholder.navbar=this;}};oNavbar.prototype.draw_bar=function(strID){var oBar=this.array_bars[strID];var strMainDisplay="bar-item";var strMinDisplay="sbar-item-hide";if(oBar.min==1){strMinDisplay="sbar-item";strMainDisplay="bar-item-hide";}var stdImage="client/outlook/images/bar/"+oBar.imgid+".png";var useImage=(oBar.customimg!="")?oBar.customimg:stdImage;this.navitemshtml.push("<div id='"+oBar.id+"' btype='"+oBar.type+"' class='sbar-item' leftitle='"+oBar.lefttitle+"' title='"+oBar.text+"'><table cellspacing='0' cellpadding='0' border='0' width='100%' height='100%'><tr><td valign='middle' align='middle'><img src='"+useImage+"'></img></td></tr></table></div>");};oNavbar.prototype.show_bar=function(strID){};oNavbar.prototype.hide_bar=function(strID){};function hilite_navbar(oItemHolder,oE){var eleSrc=app.getEventSourceElement(oE);eleSrc=app.get_parent_owner_by_tag(eleSrc,"TR");var strUseClass=(oItemHolder.currentbaritem==eleSrc)?"bar-item-selected-hilite":"bar-item-hilite";eleSrc.className=strUseClass;}function lolite_navbar(oItemHolder,oE){var eleSrc=app.getEventSourceElement(oE);eleSrc=app.get_parent_owner_by_tag(eleSrc,"TR");var strUseClass=(oItemHolder.currentbaritem==eleSrc)?"bar-item-selected":"bar-item";eleSrc.className=strUseClass;}function minimise_bar_item(oDiv,oE){app.hide_application_menu_divs();var rightclick=false;if(oE.which){rightclick=(oE.which==3);}else{if(oE.button){rightclick=(oE.button==2);}}if(rightclick){app.stopEvent(oE);var eleSrc=app.getEventSourceElement(oE);eleSrc=app.get_parent_owner_by_tag(eleSrc,"TR");var pDiv=app.get_parent_owner_by_tag(eleSrc,"DIV");var minBarItem=app.get_parent_child_by_id(application_navbar.shortcutholder,pDiv.id);if(minBarItem!=null){if(eleSrc.className=="bar-item-selected"){minBarItem.className="sbar-item-selected";application_navbar.shortcutholder.currentbaritem=minBarItem;_current_minbar_item=minBarItem;}else{minBarItem.className="sbar-item";}application_navbar.array_bars[minBarItem.id].min=1;}pDiv.style.display="none";outlookbar_save_state();return false;}}function outlookbar_save_state(){var strExpandedItems="";for(strID in application_navbar.array_bars){if(application_navbar.array_bars[strID].min==0){if(strExpandedItems!=""){strExpandedItems+=",";}strExpandedItems+=strID;}}_set_webclient_cookie("_wc_outlookbar_items",strExpandedItems);}function maximise_bar_item(oDiv,oE){app.hide_application_menu_divs();var rightclick=false;if(oE.which){rightclick=(oE.which==3);}else{if(oE.button){rightclick=(oE.button==2);}}if(rightclick){app.stopEvent(oE);var eleSrc=app.getEventSourceElement(oE);if(eleSrc.id=="shortcuts-holder"){return false;}eleSrc=app.get_parent_owner_by_tag(eleSrc,"DIV");if(eleSrc.id=="shortcuts-holder"){return false;}var mainBarItem=app.get_parent_child_by_id(application_navbar.baritemholder,eleSrc.id);if(mainBarItem!=null){var mRow=app.get_parent_child_by_tag(mainBarItem,"TR");if(eleSrc.className=="sbar-item-selected"){mRow.className="bar-item-selected";application_navbar.baritemholder.currentbaritem=mRow;_current_bar_item=mRow;mainBarItem.style.display="block";}else{mRow.className="bar-item";mainBarItem.style.display="block";}application_navbar.array_bars[mainBarItem.id].min=0;}eleSrc.className="sbar-item-hide";outlookbar_save_state();return false;}}var _current_minbar_item=null;var _current_bar_item=null;function click_minnavbar(oItemHolderTD,oE){app.hide_application_menu_divs();var eleSrc=app.getEventSourceElement(oE);if(eleSrc.id=="shortcuts-holder"){return false;}eleSrc=app.get_parent_owner_by_tag(eleSrc,"DIV");if(eleSrc.id=="shortcuts-holder"){return false;}if((oItemHolderTD.currentbaritem)&&(oItemHolderTD.currentbaritem.className!="sbar-item-hide")){oItemHolderTD.currentbaritem.className="sbar-item";}oItemHolderTD.currentbaritem=eleSrc;eleSrc.className="sbar-item-selected";_current_minbar_item=eleSrc;if((_current_bar_item!=null)&&(_current_bar_item.className!="bar-item-hide")){_current_bar_item.className="bar-item";}var strText=eleSrc.getAttribute("title");set_outlook_title(strText);set_right_title(strText);var strDate=app._formatDate(new Date(),"EE dd, MMM yyyy");app.set_right_right_title(strDate);load_outlook_control(eleSrc.getAttribute("btype"),eleSrc.getAttribute("id"),"");if(oControlFrameHolder.initialise){oControlFrameHolder.initialise();}}function click_navbar(oItemHolder,oE){var eleSrc=app.getEventSourceElement(oE);eleSrc=app.get_parent_owner_by_tag(eleSrc,"TR");activate_navbar(oItemHolder,eleSrc);}function canAccessWorkspace(){try{return(oWorkspaceFrameHolder!=null&&oWorkspaceFrameHolder.getAttribute&&oWorkspaceFrameHolder.getAttribute("externalUrl")!=true);}catch(e){return false;}}function canAccessoutlookSpace(){try{return(oControlFrameHolder!=null&&oControlFrameHolder.getAttribute&&oControlFrameHolder.getAttribute("externalUrl")!=true);}catch(e){return false;}}function activate_navbar(oItemHolder,eleSrc){app.hide_application_menu_divs();if(canAccessWorkspace()&&oWorkspaceFrameHolder.cancel_context_menus){oWorkspaceFrameHolder.cancel_context_menus();}var eDiv=app.get_parent_owner_by_tag(eleSrc,"DIV");if(eDiv==null||eDiv.getAttribute("btype")==null){return false;}if((oItemHolder.currentbaritem)&&(oItemHolder.currentbaritem.className!="bar-item-hide")){oItemHolder.currentbaritem.className="sbar-item";}eDiv.className="sbar-item-selected";oItemHolder.currentbaritem=eDiv;_current_bar_item=eleSrc;strText=eDiv.getAttribute("title");set_outlook_title(strText);set_right_title(strText);var strDate=app._formatDate(new Date(),"EE dd, MMM yyyy");app.set_right_right_title(strDate);load_outlook_control(eDiv.getAttribute("btype"),eDiv.getAttribute("id"),"");var ele=document.getElementById("nav-inout");var lpsetting=_current_bar_item.getAttribute("leftpanesetting");if(lpsetting=="1"){ele.setAttribute("expanded","0");showhide_navbar(null,true);}else{if(lpsetting=="0"){ele.setAttribute("expanded","1");showhide_navbar(null,true);}else{if(lpsetting=="hide"){ele.setAttribute("expanded","2");forcehide_navbar();}else{ele.setAttribute("expanded","0");showhide_navbar(null,true);}}}if(oControlFrameHolder.initialise){oControlFrameHolder.initialise();}}function set_outlook_title(strTitle){var oTitleDiv=document.getElementById("title-holder");app.setElementText(oTitleDiv,strTitle);}function get_outlook_left_title(){var oTitleDiv=document.getElementById("title-holder");return getElementText(oTitleDiv);}function set_right_title(strText){if(eAppTitleRight!=null){app.setElementText(eAppTitleRight,strText);}}function set_right_right_title(strText){if(eAppTitleRightRight!=null){app.setElementText(eAppTitleRightRight,strText+"   ");}}var oCurrentOutlookControl=null;var oCurrentOutlookWorkSpace=null;var oWorkspaceFrameHolder=null;var oControlFrameHolder=null;var _CurrentOutlookID="";var _CurrentOutlookType="";function load_outlook_control(strControlType,strControlID,strControlParams){strControlType=app.parsejsstr(strControlType);strControlID=app.parsejsstr(strControlID);strControlParams=app.parsejsstr(strControlParams);_CurrentOutlookID=strControlID;_CurrentOutlookType=strControlType;var oControlArea=document.getElementById("widget-holder");var oWorkspaceArea=app.eAppWorkspace;var strControlFrameID="ol_"+strControlType+"_"+strControlID;var strWorkSpaceFrameID="ws_"+strControlType+"_"+strControlID;var oControlFrame=document.getElementById(strControlFrameID);var oWorkspaceFrame=document.getElementById(strWorkSpaceFrameID);if(strControlType.toLowerCase()=="system"){var strControlDefinitionPath=_systempath+strControlType+"/"+strControlID+".xml";var strOutlookProcessingPath=_outlookcontrolpath+strControlType+"/"+strControlID+"/";var strWorkspaceProcessingPath=_workspacecontrolpath;}else{var strControlDefinitionPath=_applicationpath+"outlook/"+strControlType+"/"+strControlID+".xml";var strOutlookProcessingPath=_outlookcontrolpath+strControlType+"/";var strWorkspaceProcessingPath=_workspacecontrolpath;}if(oControlFrame!=null){if(oControlFrame!=oCurrentOutlookControl){if(strControlType=="helpdesk"&&app._helpdesk_view_tree_reload){oControlFrame.contentWindow._reload_helpdesk_tree();}oCurrentOutlookControl.style.display="none";oCurrentOutlookWorkSpace.style.display="none";oControlFrame.style.display="";oWorkspaceFrame.style.display="";var tmpWorkspaceFrameHolder=app.getFrame(strWorkSpaceFrameID,document);var tmpOutlookFrameHolder=app.getFrame(strControlFrameID,document);if(canAccessWorkspace()&&tmpWorkspaceFrameHolder.sizeup_workspace_areas){tmpWorkspaceFrameHolder.sizeup_workspace_areas();}if(canAccessoutlookSpace()&&tmpOutlookFrameHolder.sizeup_outlook_area){tmpOutlookFrameHolder.sizeup_outlook_area();}if(canAccessWorkspace()&&tmpWorkspaceFrameHolder._onshow){tmpWorkspaceFrameHolder._onshow();}if(canAccessoutlookSpace()&&tmpOutlookFrameHolder._onshow){tmpOutlookFrameHolder._onshow();}}}else{if(oCurrentOutlookControl!=null){oCurrentOutlookControl.style.display="none";oCurrentOutlookWorkSpace.style.display="none";}var strFrameHTML='<iframe id="'+strControlFrameID+'" onload="try{top._swc_check_document_hrefs(this);}catch(e){}" onreadstatechange="try{top._swc_check_document_hrefs(this);}catch(e){}" name="'+strControlFrameID+'"  style="height:100%;width:100%;" frameborder="0"></iframe>';var strWorkSpaceHTML='<iframe id="'+strWorkSpaceFrameID+'" name="'+strWorkSpaceFrameID+'" onload="try{top._swc_check_document_hrefs(this);}catch(e){}" onreadstatechange="try{top._swc_check_document_hrefs(this);}catch(e){}" style="height:100%;width:100%;" frameborder="0"></iframe>';app.insertBeforeEnd(oControlArea,strFrameHTML);app.insertBeforeEnd(oWorkspaceArea,strWorkSpaceHTML);oControlFrame=document.getElementById(strControlFrameID);oWorkspaceFrame=document.getElementById(strWorkSpaceFrameID);oControlFrame.setAttribute("swcontroltype",strControlType);oWorkspaceFrame.setAttribute("swcontroltype",strControlType);if(strControlType=="webpage"){oWorkspaceFrame.style.border="1px solid #D5D4DF";oWorkspaceFrame.style.borderTop="0px solid #D5D4DF";var strWebpageUrl=_swc_parse_variablestring(app.dd.GetGlobalParam("views/"+strControlID+"/url"));var strWebpageLeftUrl=_swc_parse_variablestring(app.dd.GetGlobalParam("views/"+strControlID+"/lefturl"));var frm=document.getElementById("form_iframeloader");frm.setAttribute("target",strControlFrameID);frm.setAttribute("action",strWebpageLeftUrl);document.getElementById("frm_swsessionid").value=_swsessionid;document.getElementById("frm_swsessid").value=_swsessionid;document.getElementById("frm_analystid").value=top.session.analystid.toUpperCase();document.getElementById("frm_webclient").value="1";document.getElementById("frm_appid").value="";document.getElementById("frm_controlid").value="";document.getElementById("frm_xmlfile").value="";document.getElementById("frm_viewid").value="";document.getElementById("frm_controltype").value="";if(strWebpageLeftUrl!=""){try{frm.submit();}catch(e){alert("Failed to open Active Page. Please check your browser for any https warnings. The active page url may be running as http when the webclient is running as https.");}}else{forcehide_navbar();}frm.setAttribute("target",strWorkSpaceFrameID);frm.setAttribute("action",strWebpageUrl);document.getElementById("frm_swsessionid").value=_swsessionid;document.getElementById("frm_swsessid").value=_swsessionid;document.getElementById("frm_webclient").value="1";document.getElementById("frm_appid").value="";document.getElementById("frm_controlid").value="";document.getElementById("frm_xmlfile").value="";document.getElementById("frm_viewid").value="";document.getElementById("frm_controltype").value="";if(strWebpageUrl!=""){try{frm.submit();}catch(e){alert("Failed to open Active Page. Please check your browser for any https warnings. The active page url may be running as http when the webclient is running as https.");}}}else{var frm=document.getElementById("form_iframeloader");frm.setAttribute("target",strControlFrameID);frm.setAttribute("action",strOutlookProcessingPath+"outlook.php");document.getElementById("frm_swsessionid").value=_swsessionid;document.getElementById("frm_webclient").value="1";document.getElementById("frm_appid").value=_application;document.getElementById("frm_controlid").value=strControlID;document.getElementById("frm_xmlfile").value=strControlDefinitionPath;document.getElementById("frm_viewid").value=strControlID;document.getElementById("frm_controltype").value=strControlType;frm.submit();frm.setAttribute("target",strWorkSpaceFrameID);frm.setAttribute("action",strWorkspaceProcessingPath+"workspace.php");frm.submit();}}oCurrentOutlookControl=oControlFrame;oCurrentOutlookWorkSpace=oWorkspaceFrame;oControlFrameHolder=app.getFrame(strControlFrameID,document);oWorkspaceFrameHolder=app.getFrame(strWorkSpaceFrameID,document);}function _swc_check_document_hrefs(aFrame,bIsDoc){if(bIsDoc==undefined){bIsDoc=false;}if(!bIsDoc){if(aFrame!=undefined){try{var aDoc=aFrame.contentWindow.document;}catch(e){return;}}}else{var aDoc=aFrame;}if(aDoc.readyState=="complete"){if(!bIsDoc){if(aFrame.getAttribute("swcontroltype")=="webpage"||aFrame.contentWindow.document.location.href.indexOf("php_reports")>0){eval("aFrame.contentWindow.app = aFrame.contentWindow;");try{aDoc.body.onmousedown=function(){};app.addEvent(aDoc,"mousedown",app.hide_application_menu_divs);}catch(e){}}else{app.addEvent(aDoc,"contextmenu",app.stopEvent);}}_scan_hsl_anchors(aDoc,aFrame.contentWindow);}}function _scan_hsl_anchors(aDoc,contentWindow){var array_hrefs=aDoc.getElementsByTagName("A");for(var x=0;x<array_hrefs.length;x++){_prepare_hsl_anchor(array_hrefs[x],contentWindow);}}function _prepare_hsl_anchor(anAnchor,contentWindow){var strHREF=anAnchor.href;if(strHREF==null||strHREF==undefined){return;}if(strHREF.indexOf("hsl:")==0){if(contentWindow!=undefined){anAnchor.frameholder=contentWindow;}anAnchor.setAttribute("hslaction",strHREF);anAnchor.href="#";app.removeEvent(anAnchor,"click",_trap_hsl_href);app.addEvent(anAnchor,"click",_trap_hsl_href);}}function _trap_hsl_href(e,b,c){var hrefAction=this.getAttribute("href");if(hrefAction.indexOf("hsl:")==0){var arrInfo=hrefAction.split("hsl:");var arrInfo=arrInfo[1].split("?");_prepare_hsl_anchor(this);}else{var hslAction=this.getAttribute("hslaction");var arrInfo=hslAction.split("hsl:");var arrInfo=arrInfo[1].split("?");}var strAction=arrInfo[0];var strParams=arrInfo[1];_hslaction(strAction,strParams,this);return false;}function navbar_scrollup(e){stopEvent(e);eNavBar.scrollTop=eNavBar.scrollTop-5;eNavBar.setAttribute("scroll","1");navbar_scroll(false);}function navbar_scrolldown(e){stopEvent(e);eNavBar.setAttribute("scroll","2");navbar_scroll(true);}function navbar_scroll(){if(eNavBar.getAttribute("scroll")=="0"){return;}var dir=eNavBar.getAttribute("scroll");if(dir=="2"){eNavBar.scrollTop=eNavBar.scrollTop+1;}else{if(eNavBar.scrollTop>0){eNavBar.scrollTop=eNavBar.scrollTop-1;}}setTimeout("navbar_scroll()",2);}function stopscrolling(e){eNavBar.setAttribute("scroll","0");}