_EMAIL_READ=0;_EMAIL_NOTREAD=1;_EMAIL_FLAGGEDANDREAD=4096;_EMAIL_FLAGGEDANDNOTREAD=4097;var _current_mailbox_name="";var _current_mailbox_prefix="";var _current_mailbox="";var _current_mailbox_folder=0;var _current_mailbox_foldername="";var _currentSelectedEmailRecordDeleted=false;function _mailview_dragdrop(droppedOnNode,eleDropped){if(eleDropped!=null&&eleDropped.tagName=="TR"){var xmlmc=new XmlMethodCall();xmlmc.SetParam("mailbox",app._current_mailbox);xmlmc.SetParam("messageId",eleDropped.getAttribute("keyvalue"));xmlmc.SetParam("targetFolderId",droppedOnNode.id);if(xmlmc.Invoke("mail","moveMessage")){if(oControlFrameHolder._refresh_selected_mailbox){oControlFrameHolder._refresh_selected_mailbox(false);}}else{alert(xmlmc.GetLastError());}}}var _currentSelectedEmailRow=null;var _currentSelectedEmailRecord=0;var _currentSelectedEmailXml=null;var _current_email_customerid="";var _current_email_callref=0;function emaillist_select_row(aRow,e){if(!e){e=window.event;}if(aRow==undefined){aRow=this;}var intKeyValue=aRow.getAttribute("keyvalue");var strKeyCol=aRow.getAttribute("keycolumn");if(_currentSelectedEmailRecord==intKeyValue){_manage_emailview_toolbar(aRow);return;}top.debugstart("Email Selected","EMAIL");_currentSelectedEmailXml=null;_current_email_callref=0;_current_email_customerid="";_currentSelectedEmailRecord=intKeyValue;_currentSelectedEmailRow=aRow;top.__CURRENT_SELECTED_TABLE_ROW=aRow;app.datatable_hilight(aRow,e.ctrlKey);_email_check_from_and_subject(aRow);_load_email_preview(intKeyValue);_manage_emailview_toolbar(aRow);top.debugend("Email Selected","EMAIL");}function _email_check_from_and_subject(aRow){var strLabelCustomer="";var xmlmc=new XmlMethodCall();xmlmc.SetParam("mailbox",app._current_mailbox);xmlmc.SetParam("messageId",_currentSelectedEmailRecord);xmlmc.SetWebclientParam("_excludeFileAttachments","1");if(xmlmc.Invoke("mail","getMessage")){_currentSelectedEmailXml=xmlmc.xmlDOM;xmlmc.xmlDOM=null;if(app._current_mailbox_prefix.indexOf("user_")==0){_current_email_callref=0;_current_email_customerid="";}else{var strFromAddress="";var arrRecipients=_currentSelectedEmailXml.getElementsByTagName("mailRecipient");for(var x=0;x<arrRecipients.length;x++){var strType=app.xmlNodeTextByTag(arrRecipients[x],"class");if(strType=="from"){strFromAddress=app.xmlNodeTextByTag(arrRecipients[x],"address");break;}}var strLabelCustomer="";if(strFromAddress!=""){_current_email_customerid=_get_email_customerid(strFromAddress);if(_current_email_customerid!=""){strLabelCustomer="Customer ("+_current_email_customerid+") found matching from address";}}_current_email_callref=_get_email_callref(app.xmlNodeTextByTag(_currentSelectedEmailXml,"subject"));}}else{alert(xmlmc._lasterror);}var aDoc=app.getEleDoc(aRow);_email_setup_callactions(_current_email_callref,aDoc);app.toolbar_item_dore("emailview_toolbar","viewcustomer",(strLabelCustomer!=""),aDoc);app.toolbar_item_setlabel("emailview_toolbar","viewcustomer",strLabelCustomer,aDoc);}function _email_setup_callactions(intCallref,aDoc){var iStatus=-1;var bHaveCallref=(intCallref>0);if(bHaveCallref){iStatus=global.GetCallStatusInfo(intCallref).nStatus;}if(app._current_mailbox_prefix.indexOf("user_")==0){app.toolbar_item_sorh("emailview_toolbar","lognewcall",false,aDoc);app.toolbar_item_sorh("emailview_toolbar","viewcall",false,aDoc);app.toolbar_item_sorh("emailview_toolbar","callupdate",false,aDoc);app.toolbar_item_sorh("emailview_toolbar","callhold",false,aDoc);app.toolbar_item_sorh("emailview_toolbar","calloffhold",false,aDoc);app.toolbar_item_sorh("emailview_toolbar","callresolve",false,aDoc);app.contextmenu_item_hors(_email_contextmenu,"lognewcall",false,aDoc);app.contextmenu_item_hors(_email_contextmenu,"viewcall",false,aDoc);app.contextmenu_item_hors(_email_contextmenu,"callupdate",false,aDoc);app.contextmenu_item_hors(_email_contextmenu,"callhold",false,aDoc);app.contextmenu_item_hors(_email_contextmenu,"calloffhold",false,aDoc);app.contextmenu_item_hors(_email_contextmenu,"callresolve",false,aDoc);}else{app.toolbar_item_sorh("emailview_toolbar","lognewcall",true,aDoc);app.toolbar_item_sorh("emailview_toolbar","viewcall",true,aDoc);app.toolbar_item_sorh("emailview_toolbar","callupdate",true,aDoc);app.toolbar_item_sorh("emailview_toolbar","callhold",true,aDoc);app.toolbar_item_sorh("emailview_toolbar","calloffhold",true,aDoc);app.toolbar_item_sorh("emailview_toolbar","callresolve",true,aDoc);app.toolbar_item_dore("emailview_toolbar","lognewcall",true,aDoc);app.toolbar_item_dore("emailview_toolbar","viewcall",bHaveCallref,aDoc);app.toolbar_item_dore("emailview_toolbar","callupdate",(iStatus>0&&iStatus<15),aDoc);app.toolbar_item_dore("emailview_toolbar","callhold",(iStatus==1),aDoc);app.toolbar_item_dore("emailview_toolbar","calloffhold",(iStatus==4),aDoc);app.toolbar_item_dore("emailview_toolbar","callresolve",(iStatus==1||iStatus==6),aDoc);app.toolbar_item_dore("emailview_toolbar","callupdate",(iStatus>0&&iStatus<15),aDoc);app.toolbar_item_dore("emailview_toolbar","callhold",(iStatus==1),aDoc);app.toolbar_item_dore("emailview_toolbar","calloffhold",(iStatus==4),aDoc);app.toolbar_item_dore("emailview_toolbar","callresolve",(iStatus==1||iStatus==6),aDoc);app.contextmenu_item_hors(_email_contextmenu,"lognewcall",true,aDoc);app.contextmenu_item_hors(_email_contextmenu,"viewcall",true,aDoc);app.contextmenu_item_hors(_email_contextmenu,"callupdate",true,aDoc);app.contextmenu_item_hors(_email_contextmenu,"callhold",true,aDoc);app.contextmenu_item_hors(_email_contextmenu,"calloffhold",true,aDoc);app.contextmenu_item_hors(_email_contextmenu,"callresolve",true,aDoc);app.contextmenu_item_dore(_email_contextmenu,"lognewcall",true,aDoc);app.contextmenu_item_dore(_email_contextmenu,"viewcall",bHaveCallref,aDoc);app.contextmenu_item_dore(_email_contextmenu,"callupdate",(iStatus>0&&iStatus<15),aDoc);app.contextmenu_item_dore(_email_contextmenu,"callhold",(iStatus==1),aDoc);app.contextmenu_item_dore(_email_contextmenu,"calloffhold",(iStatus==4),aDoc);app.contextmenu_item_dore(_email_contextmenu,"callresolve",(iStatus==1||iStatus==6),aDoc);}}function _get_email_callref(strSubject){var arrMatches=strSubject.match(/\b[Ff]\S*/g);if(arrMatches==null){return 0;}for(var x=0;x<arrMatches.length;x++){var strCallref=arrMatches[x].substring(1);strCallref=strCallref.replace(/[^\d]/g,"");strCallref++;strCallref--;if(!isNaN(strCallref)){return strCallref;}}return 0;}function _get_email_customerid(strEmail){var mbXML=global.GetSharedMailboxXmlNode(app._current_mailbox);if(mbXML==undefined||mbXML==null){return"";}var strTable=app.xmlNodeTextByTag(mbXML,"contactTable");if(strTable!=""){var strKeyCol=app.xmlNodeTextByTag(mbXML,"contactId");var strEmailCol=app.xmlNodeTextByTag(mbXML,"contactEmail");}else{return"";}var strCustID="";var strParams="keycol="+strKeyCol+"&table="+strTable+"&emailcol="+strEmailCol+"&emailaddress="+strEmail;var aRS=new SqlQuery();aRS.WebclientStoredQuery("system/getCustomerIdFromEmail",strParams);while(aRS.Fetch()){strCustID=aRS.GetValueAsString(strKeyCol.toLowerCase());}return strCustID;}function _email_open_attachment(aLink){if(confirm("You are opening a file attachment that is stored on the server. Large attachments can take some time to download depending on your network speed.\n\nDo you wish to continue?")){app.oControlFrameHolder.open_attachment(aLink);}}function emaillist_open_row(aRow,e){if(!e){e=window.event;}var intKeyValue=aRow.getAttribute("keyvalue");var strKeyCol=aRow.getAttribute("keycolumn");_mark_email_read(_currentSelectedEmailRecord,app._current_mailbox);_manage_emailview_toolbar(_currentSelectedEmailRow);var strParams="addnew=0&msgid="+intKeyValue;var strParams="addnew=0&_emailaction=RE:&_emailid="+_currentSelectedEmailRecord+"&_mailbox="+app._current_mailbox;app._open_system_form("_sys_email_formcompose","mail","",strParams,false,null,null,window);}function _emailview_closed(){}function _load_email_preview(intKeyValue){var strParams="emailid="+app.pfu(intKeyValue)+"&mailbox="+app.pfu(app._current_mailbox);var strURL=app._workspacecontrolpath+"_views/mail/mailpreview.php?"+strParams;var targetDocument=app.getFrameDoc("iform_mail_"+app._CurrentOutlookID,app.oWorkspaceFrameHolder.document);if(targetDocument!=undefined){app.load_iform(strURL,targetDocument);}}function _emailview_toolbar_action(strToolBarItemID){var aDoc=app.oWorkspaceFrameHolder.document;var bRefreshCallButtons=false;var _arrSpecial=new Array();switch(strToolBarItemID){case"emailnew":if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true)){return;}var strParams="addnew=0&_emailid=0";app._open_system_form("_sys_email_formcompose","mail","",strParams,false,null,null,window,undefined,undefined,_arrSpecial);break;case"emailview":var strParams="addnew=0&_emailid="+_currentSelectedEmailRecord+"&_mailbox="+app._current_mailbox;app._open_system_form("_sys_email_formview","mail","",strParams,false,null,null,window,undefined,undefined,_arrSpecial);break;case"emailreply":if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true)){return;}var strParams="addnew=0&_emailaction=RE:&_emailid="+_currentSelectedEmailRecord+"&_mailbox="+app._current_mailbox;app._open_system_form("_sys_email_formcompose","mail","",strParams,false,null,null,window,undefined,undefined,_arrSpecial);break;case"emailreplyall":if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true)){return;}var strParams="addnew=0&_emailaction=REA:&_emailid="+_currentSelectedEmailRecord+"&_mailbox="+app._current_mailbox;app._open_system_form("_sys_email_formcompose","mail","",strParams,false,null,null,window,undefined,undefined,_arrSpecial);break;case"emailforward":if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true)){return;}var strParams="addnew=0&_emailaction=FW:&_emailid="+_currentSelectedEmailRecord+"&_mailbox="+app._current_mailbox;app._open_system_form("_sys_email_formcompose","mail","",strParams,false,null,null,window,undefined,undefined,_arrSpecial);break;case"emailmarkasunread":_mark_email_unread(_currentSelectedEmailRecord,app._current_mailbox);break;case"emailmarkasread":_mark_email_read(_currentSelectedEmailRecord,app._current_mailbox);break;case"emailflag":_flag_email(_currentSelectedEmailRecord,app._current_mailbox,true);break;case"emailunflag":_flag_email(_currentSelectedEmailRecord,app._current_mailbox,false);break;case"emaildelete":if(_delete_email(_currentSelectedEmailRecord,app._current_mailbox)){if(oControlFrameHolder._refresh_selected_mailbox){_currentSelectedEmailRecordDeleted=true;oControlFrameHolder._refresh_selected_mailbox(false);}}break;case"lognewcall":_open_system_form("_wc_lognewcallclass","lcfpicker","","",true,function(){_manage_emailview_toolbar(_currentSelectedEmailRow);_email_setup_callactions(_current_email_callref,aDoc);},undefined,window,undefined,undefined,_email_prepare_form_params(true));break;case"viewcustomer":_email_viewcustomer_record(_current_email_customerid);break;case"viewcall":_open_call_detail(_current_email_callref+"");break;case"callupdate":_updatecallform(_current_email_callref+"",window,_email_prepare_form_params(),function(){_manage_emailview_toolbar(_currentSelectedEmailRow);_email_setup_callactions(_current_email_callref,aDoc);});break;case"callhold":_holdcallform(_current_email_callref+"",window,_email_prepare_form_params(),function(){_manage_emailview_toolbar(_currentSelectedEmailRow);_email_setup_callactions(_current_email_callref,aDoc);});break;case"calloffhold":_offholdcall(_current_email_callref+"");_email_setup_callactions(_current_email_callref,aDoc);break;case"callresolve":_resolveclosecallform(_current_email_callref+"",window,_email_prepare_form_params(),function(){_manage_emailview_toolbar(_currentSelectedEmailRow);_email_setup_callactions(_current_email_callref,aDoc);});break;default:alert("Email View Toolbar Action "+strToolBarItemID);break;}_manage_emailview_toolbar(_currentSelectedEmailRow);}function _email_prepare_form_params(bLogNew){if(bLogNew==undefined){bLogNew=false;}var _EmailParams=new Array();if(_currentSelectedEmailXml!=null){_EmailParams["_source_email"]=true;_EmailParams["PreloadType"]=1;_EmailParams["messagesource"]=app._current_mailbox+"\\"+_currentSelectedEmailRecord;_EmailParams["mailbox"]=app._current_mailbox;_EmailParams["emailid"]=_currentSelectedEmailRecord;_EmailParams["subject"]=app.xmlNodeTextByTag(_currentSelectedEmailXml,"subject");_EmailParams["emailsubject"]=_EmailParams["subject"];var strTimeReceived=app.string_replace(app.xmlNodeTextByTag(_currentSelectedEmailXml,"timeReceived"),"Z","");var epochDateReceived=app._date_to_epoch(app._parseDate(strTimeReceived,"yyyy-MM-dd HH:mm:ss"));_EmailParams["emaildatetimex"]=epochDateReceived;var dateReceived=app._date_from_epoch(epochDateReceived,app._analyst_timezoneoffset);strTimeReceived=app._formatDate(dateReceived,"yyyy-MM-dd HH:mm:ss");var strTopTitle="Logged From Inbound Email (Mailbox: "+app._current_mailbox_name+", Received at: "+strTimeReceived+")";var strFrom="";var strTo="";var strCc="";var strBcc="";var arrRecipients=_currentSelectedEmailXml.getElementsByTagName("mailRecipient");for(var x=0;x<arrRecipients.length;x++){var strType=app.xmlNodeTextByTag(arrRecipients[x],"class");if(strType=="from"){var strName=app.xmlNodeTextByTag(arrRecipients[x],"name");var strAdd=app.xmlNodeTextByTag(arrRecipients[x],"address");if(strName==""){strName=strAdd;}if(strName==strAdd){strFrom+=app.xmlNodeTextByTag(arrRecipients[x],"name")+"; ";}else{strFrom+=app.xmlNodeTextByTag(arrRecipients[x],"name")+" ("+app.xmlNodeTextByTag(arrRecipients[x],"address")+"); ";}}if(strType=="to"){var strName=app.xmlNodeTextByTag(arrRecipients[x],"name");var strAdd=app.xmlNodeTextByTag(arrRecipients[x],"address");if(strName==""){strName=strAdd;}if(strName==strAdd){strTo+=app.xmlNodeTextByTag(arrRecipients[x],"name")+"; ";}else{strTo+=app.xmlNodeTextByTag(arrRecipients[x],"name")+" ("+app.xmlNodeTextByTag(arrRecipients[x],"address")+"); ";}}if(strType=="cc"){var strName=app.xmlNodeTextByTag(arrRecipients[x],"name");var strAdd=app.xmlNodeTextByTag(arrRecipients[x],"address");if(strName==""){strName=strAdd;}if(strName==strAdd){strCc+=app.xmlNodeTextByTag(arrRecipients[x],"name")+"; ";}else{strCc+=app.xmlNodeTextByTag(arrRecipients[x],"name")+" ("+app.xmlNodeTextByTag(arrRecipients[x],"address")+"); ";}}}var strEmailUpdateText="";if(bLogNew&&app.session.IsDefaultOption(ANALYST_DEFAULT_INCLUDESUBJECT)){strEmailUpdateText+=strTopTitle;strEmailUpdateText+="\nFrom: "+strFrom;strEmailUpdateText+="\nTo: "+strTo;if(strCc!=""){strEmailUpdateText+="\nCc: "+strCc;}strEmailUpdateText+="\nSubject: "+_EmailParams["subject"];strEmailUpdateText+="\n\n";}strEmailUpdateText+=app.xmlNodeTextByTag(_currentSelectedEmailXml,"body");_EmailParams["updatetext"]=strEmailUpdateText;}return _EmailParams;}function _email_viewcustomer_record(strCustomerID){var strFormName=app.dd.tables["userdb"].editform;if(strFormName!=""){app.OpenFormForEdit(strFormName,strCustomerID,"",false,null,window);}else{alert("There is no customer form defined against the customer table. Please contact your Administrator");}}function _delete_email(intMessageID,strMailbox){if(!_email_checkright(_EM_CANDELETE,strMailbox,true)){return;}var bPurge=(top._current_mailbox_folder==4)?true:false;if(bPurge){if(!confirm("Message will be permantly deleted. Continue?")){return;}}var xmlmc=new XmlMethodCall;xmlmc.SetParam("mailbox",strMailbox);var eDataTable=app.get_row_datatable(_currentSelectedEmailRow);var strCurrIndexes=app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);var arrIndexes=strCurrIndexes.split(",");if(strCurrIndexes==""){arrIndexes=new Array();}for(var x=0;x<arrIndexes.length;x++){var currRow=eDataTable.rows[arrIndexes[x]];var intMessageID=currRow.getAttribute("keyvalue");xmlmc.SetParam("messageId",intMessageID);}xmlmc.SetParam("purge",bPurge);if(xmlmc.Invoke("mail","deleteMessage")){return true;}return false;}function _flag_email(intMessageID,strMailbox,boolFlag){if(!_email_checkright(_EM_CANFLAGUNFLAG,strMailbox,true)){return;}var xmlmc=new XmlMethodCall;xmlmc.SetParam("mailbox",strMailbox);xmlmc.SetParam("messageId",intMessageID);xmlmc.SetParam("flagged",""+boolFlag);if(xmlmc.Invoke("mail","setMessageFlagged")){var eDataTable=app.get_row_datatable(_currentSelectedEmailRow);var strCurrIndexes=app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);var arrIndexes=strCurrIndexes.split(",");if(strCurrIndexes==""){arrIndexes=new Array();}for(var x=0;x<arrIndexes.length;x++){var currRow=eDataTable.rows[arrIndexes[x]];var intStatusValue=currRow.getAttribute("emailstatus");intStatusValue++;intStatusValue--;if(boolFlag){intStatusValue=intStatusValue+4096;}else{intStatusValue=intStatusValue-4096;}currRow.setAttribute("emailstatus",intStatusValue);_conversion_email_status_icon(currRow,intStatusValue);}return true;}return false;}function _mark_email_unread(intMessageID,strMailbox){if(!_email_checkright(_EM_CANFLAGUNREAD,strMailbox,true)){return;}var xmlmc=new XmlMethodCall;xmlmc.SetParam("mailbox",strMailbox);xmlmc.SetParam("messageId",intMessageID);if(xmlmc.Invoke("mail","markMessageUnread")){var eDataTable=app.get_row_datatable(_currentSelectedEmailRow);var strCurrIndexes=app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);var arrIndexes=strCurrIndexes.split(",");if(strCurrIndexes==""){arrIndexes=new Array();}for(var x=0;x<arrIndexes.length;x++){var currRow=eDataTable.rows[arrIndexes[x]];for(var y=0;y<currRow.cells.length;y++){if(currRow.cells[y].childNodes[0]){currRow.cells[y].childNodes[0].style.fontWeight="bold";}}var intStatusValue=currRow.getAttribute("emailstatus");intStatusValue++;intStatusValue--;intStatusValue++;currRow.setAttribute("emailstatus",intStatusValue);_conversion_email_status_icon(currRow,intStatusValue);}return true;}return false;}function _mark_email_read(intMessageID,strMailbox){var xmlmc=new XmlMethodCall;xmlmc.SetParam("mailbox",strMailbox);xmlmc.SetParam("messageId",intMessageID);if(xmlmc.Invoke("mail","markMessageRead")){var eDataTable=app.get_row_datatable(_currentSelectedEmailRow);var strCurrIndexes=app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);var arrIndexes=strCurrIndexes.split(",");if(strCurrIndexes==""){arrIndexes=new Array();}for(var x=0;x<arrIndexes.length;x++){var currRow=eDataTable.rows[arrIndexes[x]];for(var y=0;y<currRow.cells.length;y++){if(currRow.cells[y].childNodes[0]){currRow.cells[y].childNodes[0].style.fontWeight="normal";}}var intStatusValue=currRow.getAttribute("emailstatus");intStatusValue++;intStatusValue--;intStatusValue--;currRow.setAttribute("emailstatus",intStatusValue);_conversion_email_status_icon(currRow,intStatusValue);}return true;}return false;}function _conversion_email_status_icon(aRow,intStatus){var strImgCellHTML="";switch(intStatus){case 0:strImgCellHTML="<img src='_controls/datatable/tableimages/email-read.png'>";break;case 1:strImgCellHTML="<img src='_controls/datatable/tableimages/email-unread.png'>";break;case 4096:strImgCellHTML="<img src='_controls/datatable/tableimages/email-flagread.png'>";break;case 4097:strImgCellHTML="<img src='_controls/datatable/tableimages/email-flagunread.png'>";break;}aRow.cells[1].childNodes[0].innerHTML=strImgCellHTML;}function _disable_emailview_toolbar(aTable){if(aTable==null||aTable==undefined){return;}var aDoc=app.getEleDoc(aTable);_currentSelectedEmailXml=null;app.toolbar_item_dore("emailview_toolbar","emailmarkasread",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailmarkasunread",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailflag",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailunflag",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emaildelete",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailview",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailreply",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailreplyall",false,aDoc);app.toolbar_item_dore("emailview_toolbar","emailforward",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailmarkasread",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailmarkasunread",false,aDoc);app.toolbar_item_dore("emailview_toolbar","lognewcall",false,aDoc);app.toolbar_item_dore("emailview_toolbar","callupdate",false,aDoc);app.toolbar_item_dore("emailview_toolbar","callhold",false,aDoc);app.toolbar_item_dore("emailview_toolbar","calloffhold",false,aDoc);app.toolbar_item_dore("emailview_toolbar","callresolve",false,aDoc);_email_NumRowsSelected=0;app.contextmenu_item_dore(_email_contextmenu,"emailflag",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailunflag",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emaildelete",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailview",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailreply",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailreplyall",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"emailforward",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"lognewcall",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"callupdate",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"callhold",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"calloffhold",false,aDoc);app.contextmenu_item_dore(_email_contextmenu,"callresolve",false,aDoc);var ifShimmer=aDoc.getElementById("app-context-menu");if(ifShimmer!=null){ifShimmer.innerHTML="";ifShimmer.style.display="none";}}var _email_contextmenu=null;function _manage_emailview_contextmenu(oContextMenu){if(_currentSelectedEmailRecord==0){return;}var aDoc=app.getEleDoc(oContextMenu);app.contextmenu_item_dore(oContextMenu,"emailmarkasread",(_email_NumRowsSelected>0)&&_email_bNotRead,aDoc);app.contextmenu_item_dore(oContextMenu,"emailmarkasunread",(_email_NumRowsSelected>0)&&_email_bRead&&_email_checkright(_EM_CANFLAGUNREAD,app._current_mailbox),aDoc);app.contextmenu_item_dore(oContextMenu,"emailflag",(_email_NumRowsSelected>0)&&!_email_bFlaggedRead&&_email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox),aDoc);app.contextmenu_item_dore(oContextMenu,"emailunflag",(_email_NumRowsSelected>0)&&_email_bFlaggedRead&&_email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox),aDoc);app.contextmenu_item_dore(oContextMenu,"emaildelete",(_email_NumRowsSelected>0)&&_email_checkright(_EM_CANDELETE,app._current_mailbox),aDoc);app.contextmenu_item_dore(oContextMenu,"emailview",(_email_NumRowsSelected==1),aDoc);app.contextmenu_item_dore(oContextMenu,"emailreply",(_email_NumRowsSelected==1)&&_email_checkright(_EM_CANSEND,app._current_mailbox),aDoc);app.contextmenu_item_dore(oContextMenu,"emailreplyall",(_email_NumRowsSelected==1)&&_email_checkright(_EM_CANSEND,app._current_mailbox),aDoc);app.contextmenu_item_dore(oContextMenu,"emailforward",(_email_NumRowsSelected==1)&&_email_checkright(_EM_CANSEND,app._current_mailbox),aDoc);}var _email_bRead=false;var _email_bNotRead=false;var _email_bFlaggedRead=false;var _email_bFlaggedNotRead=false;var _email_NumRowsSelected=0;function _manage_emailview_toolbar(aRow){_email_bRead=false;_email_bNotRead=false;_email_bFlaggedRead=false;_email_bFlaggedNotRead=false;var arrIndexes=[];if(aRow){var eDataTable=app.get_row_datatable(aRow);var strCurrIndexes=app.get_row_datatable_selectedindexes(aRow);var arrIndexes=strCurrIndexes.split(",");if(strCurrIndexes==""){arrIndexes=new Array();}for(var x=0;x<arrIndexes.length;x++){var intStatusValue=eDataTable.rows[arrIndexes[x]].getAttribute("emailstatus");intStatusValue++;intStatusValue--;switch(intStatusValue){case _EMAIL_READ:_email_bRead=true;break;case _EMAIL_NOTREAD:_email_bNotRead=true;break;case _EMAIL_FLAGGEDANDREAD:_email_bRead=true;_email_bFlaggedRead=true;break;case _EMAIL_FLAGGEDANDNOTREAD:_email_bFlaggedRead=true;_email_bNotRead=true;break;}}}var aDoc=(aRow)?app.getEleDoc(aRow):document;if(!aDoc){aDoc=document;}app.toolbar_item_dore("emailview_toolbar","emailmarkasread",_email_bNotRead,aDoc);app.toolbar_item_dore("emailview_toolbar","emailmarkasunread",_email_bRead&&_email_checkright(_EM_CANFLAGUNREAD,app._current_mailbox),aDoc);app.toolbar_item_dore("emailview_toolbar","emailflag",!_email_bFlaggedRead&&_email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox),aDoc);app.toolbar_item_dore("emailview_toolbar","emailunflag",_email_bFlaggedRead&&_email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox),aDoc);app.toolbar_item_dore("emailview_toolbar","emaildelete",_email_checkright(_EM_CANDELETE,app._current_mailbox),aDoc);_email_NumRowsSelected=arrIndexes.length;app.toolbar_item_dore("emailview_toolbar","emailview",(arrIndexes.length==1),aDoc);app.toolbar_item_dore("emailview_toolbar","emailreply",(arrIndexes.length==1)&&_email_checkright(_EM_CANSEND,app._current_mailbox),aDoc);app.toolbar_item_dore("emailview_toolbar","emailreplyall",(arrIndexes.length==1)&&_email_checkright(_EM_CANSEND,app._current_mailbox),aDoc);app.toolbar_item_dore("emailview_toolbar","emailforward",(arrIndexes.length==1)&&_email_checkright(_EM_CANSEND,app._current_mailbox),aDoc);}function _copy_emailattachments_for_form(intEmailID,strMailbox,strFormID,oEmailXML){if(oEmailXML==undefined){var xmlmc=new XmlMethodCall;xmlmc.SetParam("mailbox",strMailbox);xmlmc.SetParam("messageId",intEmailID);if(xmlmc.Invoke("mail","getMessage")){oEmailXML=xmlmc.xmlDOM;xmlmc=null;}else{alert("_copy_emailattachments_for_form : Email file attachments could not be copied for us by the form");return false;}}var strFiles="";var arrFiles=oEmailXML.getElementsByTagName("fileAttachment");for(var x=0;x<arrFiles.length;x++){if(strFiles!=""){strFiles+=",";}strFiles+=app.xmlNodeTextByTag(arrFiles[x],"swFileId");}if(strFiles!=""){var strURL=app.get_service_url("email/getemailattachmentsforform","");var strParams="_mailbox="+strMailbox+"&_fileids="+strFiles+"&_uniqueformid="+strFormID;app.get_http(strURL,strParams,false,false);}return arrFiles;}var _email_serverpoll_timeout=-1;function _email_poll_mailboxrefresh(){if(_email_serverpoll_timeout==-1){var intRefreshValue=app.dd.GetGlobalParamAsNumber("views/E-Mail/webclient settings/refreshpolling");if(intRefreshValue!=""&&intRefreshValue>0){_email_serverpoll_timeout=intRefreshValue;}else{if(intRefreshValue<0){return;}_email_serverpoll_timeout=300;}}setTimeout("_email_action_mailboxrefresh()",(_email_serverpoll_timeout*1000));}function _email_action_mailboxrefresh(){if(oControlFrameHolder._refresh_selected_mailbox){app.debugstart("_email_action_mailboxrefresh","POLLING");oControlFrameHolder._refresh_selected_mailbox(true);setTimeout("_email_action_mailboxrefresh()",(_email_serverpoll_timeout*1000));app.debugend("_email_action_mailboxrefresh","POLLING");}}var _bool__current_mailbox_permissions_fetched=false;var _current_mailbox_permissions=new Array();function _email_getmailbox_permissions(){if(_bool__current_mailbox_permissions_fetched){return true;}_bool__current_mailbox_permissions_fetched=true;_current_mailbox_permissions=new Array();var xmlmc=new XmlMethodCall;xmlmc.SetParam("analystId",session.analystid);if(xmlmc.Invoke("mail","getAnalystMailboxRights")){var arrMailBox=xmlmc.xmlDOM.getElementsByTagName("mailbox");for(var x=0;x<arrMailBox.length;x++){var strName=app.xmlNodeTextByTag(arrMailBox[x],"name").toLowerCase();var intRights=parseInt(app.xmlNodeTextByTag(arrMailBox[x],"rights"));if(intRights>0){_current_mailbox_permissions[strName]=intRights;}}return true;}return false;}function _email_checkright(intRightToCheck,strMailboxName,bShowMessage){if(bShowMessage==undefined){bShowMessage=false;}if(strMailboxName=="%"){for(strMailboxID in _current_mailbox_permissions){if(_email_checkright(intRightToCheck,strMailboxID)){return true;}}return false;}else{if(_current_mailbox_permissions[strMailboxName.toLowerCase()]==undefined){return false;}}var intMailboxRights=_current_mailbox_permissions[strMailboxName.toLowerCase()];var res=(intRightToCheck&intMailboxRights);if(bShowMessage&&!res){if(_EM_RIGHTS_MSG[intRightToCheck]!=undefined){alert(_EM_RIGHTS_MSG[intRightToCheck]);}}return res;}function _email_page_left(oTD){var divFilterHolder=app.get_parent_owner_by_tag(oTD,"DIV");if(divFilterHolder!=null){var divHolder=app.get_parent_owner_by_tag(divFilterHolder,"DIV");}var intPage=divHolder.getAttribute("page");intPage--;if(intPage==0){return;}divHolder.setAttribute("page",intPage);oControlFrameHolder.refresh_data(divHolder);}function _email_page_start(oTD){var divFilterHolder=app.get_parent_owner_by_tag(oTD,"DIV");if(divFilterHolder!=null){var divHolder=app.get_parent_owner_by_tag(divFilterHolder,"DIV");}divHolder.setAttribute("page","1");oControlFrameHolder.refresh_data(divHolder);}function _email_page_right(oTD){var divFilterHolder=app.get_parent_owner_by_tag(oTD,"DIV");if(divFilterHolder!=null){var divHolder=app.get_parent_owner_by_tag(divFilterHolder,"DIV");}var maxPage=divHolder.getAttribute("totalpages");var intPage=divHolder.getAttribute("page");intPage++;if(intPage>maxPage){return;}divHolder.setAttribute("page",intPage);oControlFrameHolder.refresh_data(divHolder);}function _email_page_end(oTD){var divFilterHolder=app.get_parent_owner_by_tag(oTD,"DIV");if(divFilterHolder!=null){var divHolder=app.get_parent_owner_by_tag(divFilterHolder,"DIV");}var intPage=divHolder.getAttribute("page");var maxPage=divHolder.getAttribute("totalpages");divHolder.setAttribute("page",maxPage);oControlFrameHolder.refresh_data(divHolder);}