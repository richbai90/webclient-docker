function _swchd_update_call(strCallrefs){}function _swchd_iscallwatched(strCallrefs,strAid){var strArgs="_callrefs="+strCallrefs+"&_aid="+app.pfs(strAid);var strURL=app.get_service_url("call/callwatched","");var xmlData=app.get_http(strURL,strArgs,true,true);if(xmlData){strCallrefs+="";var arrCallrefs=strCallrefs.split(",");var arrRecs=xmlData.getElementsByTagName("rec");if(arrRecs.length==0){return false;}else{if(arrRecs.length==arrCallrefs.length){return true;}else{return -1;}}}return false;}function _swchd_assign_call(strCallrefs,strGroupID,strAnalystID,thirdPartyContract,fromWindow,callback){var bAssignedToThirdParty=false;var analChosenAnalyst=null;var strAssignTo="";strCallrefs+="";var arrCallrefs=strCallrefs.split(",");var numCalls=(strCallrefs.indexOf(",")>-1)?arrCallrefs.length:1;if(callback===undefined){callback=function(assignResult){if(assignResult){}};}var assignedToFunctionHandler=function(strGroupID,strAnalystID,thirdPartyContract){if(strGroupID==""){return false;}if(strGroupID=="_THIRDPARTY"){bAssignedToThirdParty=true;}function secondLevelProcessingSigh(){if(app.OnAssignCall!=undefined){var res=app.OnAssignCall(strCallrefs,strGroupID,strAnalystID);if(res==undefined||res==false){return;}}var strAnalystName=strAnalystID;if(strGroupID.length){strAssignTo="#";strAssignTo+=strGroupID;if(strAnalystID.length){strAssignTo+=":";strAssignTo+=strAnalystID;var rs=new SqlQuery();rs.WebclientStoredQuery("system/getAnalystName","aid="+strAnalystID);if(rs.Fetch()){strAnalystName=rs.GetValueAsString("name");}}if(thirdPartyContract.length){strAssignTo+=":";strAssignTo+=thirdPartyContract;}}if(strAnalystID.length){if(!bAssignedToThirdParty){var analystObj=session.GetAnalystStatus(strAnalystID);if(!analystObj){alert("Unable to determine analyst status. Please contact your Administrator");if(callback){callback(false);}return;}}if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS)){if(document.nUnassigned==arrCallRefs.length){alert("You do not have permission to assign this request to an Analyst. However you are allowed to assign it to a group.");if(callback){callback(false);}return false;}}if((!bAssignedToThirdParty)&&(analystObj.bAssignBlocked)){alert("Assigning calls to this analyst has been disallowed by the system administrator.");if(callback){callback(false);}return false;}if(!bAssignedToThirdParty){var strMsg="";switch(analystObj.nStatus){case ANALYST_STATUS_ATLUNCH:strMsg=ANALYST_STATUS_ATLUNCH_MSG;break;case ANALYST_STATUS_ONTRAINING:strMsg=ANALYST_STATUS_ONTRAINING_MSG;break;case ANALYST_STATUS_ONHOLIDAY:strMsg=ANALYST_STATUS_ONHOLIDAY_MSG;break;case ANALYST_STATUS_INAMEETING:strMsg=ANALYST_STATUS_INAMEETING_MSG;break;case ANALYST_STATUS_OUTOFOFFICE:strMsg=ANALYST_STATUS_OUTOFOFFICE_MSG;break;case ANALYST_STATUS_DONOTDISTURB:strMsg=ANALYST_STATUS_DONOTDISTURB_MSG;break;case ANALYST_STATUS_AVAILABLE:default:break;}if(strMsg!=""){if(!confirm(strAnalystName+" "+strMsg+"\n\n"+analystObj.strMessage+"\n\n"+"Do you still want to assign the request?")){if(callback){callback(false);}return;}}}if((!bAssignedToThirdParty)&&(analystObj.nMaxAssignedCalls>0)){var SqlRecordSetObj=new SqlQuery();SqlRecordSetObj.WebclientStoredQuery("system/getAnalystActiveCallCount","aid="+strAnalystID);if(SqlRecordSetObj.Fetch()){var nCount=SqlRecordSetObj.GetValueAsNumber(0)+numCalls;if(nCount>analystObj.nMaxAssignedCalls){if(numCalls>1){alert("Assigning these requests to this analyst will exceed the maximum number allowed ("+analystObj.nMaxAssignedCalls+"). Assignment of these requests is not possible.");}else{alert("Assigning this request to this analyst will exceed the maximum number allowed ("+analystObj.nMaxAssignedCalls+"). Assignment of this request is not possible.");}SqlRecordSetObj.Reset();if(callback){callback(false);}return;}}SqlRecordSetObj.Reset();}}else{if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS)){if(document.nUnaccepted==document.arrCallRefs.length){alert("You do not have permission to assign this request to a group.");if(callback){callback(false);}return;}}}var boolProcess=true;if(bAssignedToThirdParty){var strUseForm=app.dd.GetGlobalParamAsString("Third Party SLAs/DisplayHoldOption");if(strUseForm.toLowerCase()=="true"){app._open_system_form("_wc_assignthirdparty","assignthirdparty","","",true,function(oForm){if(oForm&&oForm._swdoc._3p_assignment_desc!=""){if(thirdPartyContract!=""){boolProcess=false;var xmlmc=new XmlMethodCall();var arrCallrefs=strCallrefs.split(",");for(var x=0;x<arrCallrefs.length;x++){xmlmc.SetParam("callref",arrCallrefs[x]);}if(oForm._swdoc._3p_assignment_hold==1){xmlmc.SetParam("assignThirdPartySupplier",strAnalystID);xmlmc.SetParam("assignThirdPartyContract",thirdPartyContract);xmlmc.SetParam("holdUntil",oForm._swdoc._3p_assignment_date);xmlmc.SetParam("updateMessage",oForm._swdoc._3p_assignment_desc);var res=xmlmc.Invoke("helpdesk","assignAndHoldCallsto3rdParty");if(res){var strMessage=app.xmlNodeTextByTag(xmlmc.xmlDOM,"message");if(strMessage!=""){if(confirm(strMessage+"\n\nWould you like to continue?")){xmlmc.SetParam("forceAssignment",true);var res=xmlmc.Invoke("helpdesk","assignAndHoldCallsto3rdParty");}}}}else{xmlmc.SetParam("timeSpent",1);xmlmc.SetParam("description",oForm._swdoc._3p_assignment_desc);xmlmc.SetParam("publicUpdate",true);xmlmc.SetParam("assignThirdPartySupplier",strAnalystID);xmlmc.SetParam("assignThirdPartyContract",thirdPartyContract);var res=xmlmc.Invoke("helpdesk","updateAndAssignCallTo3rdParty");if(res){var strMessage=app.xmlNodeTextByTag(xmlmc.xmlDOM,"message");if(strMessage!=""){if(confirm(strMessage+"\n\nWould you like to continue?")){xmlmc.SetParam("forceAssignment",true);var res=xmlmc.Invoke("helpdesk","updateAndAssignCallTo3rdParty");}}}}if(!res){alert(xmlmc.GetLastError());}if(callback){callback(res);}return res;}}if(boolProcess){var swHD=new HelpdeskSession();var res=swHD.AssignCall(strCallrefs,strGroupID,strAnalystID,thirdPartyContract);if(callback){callback(res);}return res;}});}else{if(boolProcess){var swHD=new HelpdeskSession();var res=swHD.AssignCall(strCallrefs,strGroupID,strAnalystID,thirdPartyContract);if(callback){callback(res);}return res;}}}else{if(boolProcess){var swHD=new HelpdeskSession();var res=swHD.AssignCall(strCallrefs,strGroupID,strAnalystID,thirdPartyContract);if(callback){callback(res);}return res;}}}if(bAssignedToThirdParty&&thirdPartyContract==""){var strContractNames="";var SqlRecordSetObj=new SqlQuery();SqlRecordSetObj.WebclientStoredQuery("system/getThirdPartyContractNames","company="+strAnalystID);while(SqlRecordSetObj.Fetch()){if(strContractNames!=""){strContractNames+="|";}strContractNames+=SqlRecordSetObj.GetValueAsString(0);}if(strContractNames==""){alert("You cannot assign to a Third Party without a contract");if(callback){callback(false);}return false;}else{if(strContractNames.indexOf("|")==-1){thirdPartyContract=strContractNames;}else{var strParam="_company="+strAnalystID;app._open_system_form("_wc_contractselector","assignthirdparty","",strParam,true,function(oForm){if(oForm&&oForm._swdoc._3p_assignment_contract!=""){thirdPartyContract=oForm._swdoc._3p_assignment_contract;secondLevelProcessingSigh();}else{if(callback){callback(false);}return false;}});}}secondLevelProcessingSigh();}else{secondLevelProcessingSigh();}};if(strGroupID==undefined||strGroupID==""){var picker=new PickAnalystDialog();var aRes=picker.Open("Assign Request To:",true,function(){strGroupID=picker.groupid;strAnalystID=picker.analystid;thirdPartyContract=picker.tpcontract;assignedToFunctionHandler(strGroupID,strAnalystID,thirdPartyContract);});}else{assignedToFunctionHandler(strGroupID,strAnalystID,thirdPartyContract);}}function _swchd_accept_call(strCallrefs,openfromWin,arrSpecial,callback){return _acceptcallform(strCallrefs,openfromWin,arrSpecial,callback);}function _swchd_hold_call(strCallrefs){return _holdcallform(strCallrefs,openfromWin,arrSpecial);}function _swchd_reactivate_call(strCallrefs){if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANREACTIVATECALLS)){return false;}var swHD=new HelpdeskSession();return swHD.ReactivateCall(strCallrefs);}function _swchd_offhold_call(strCallrefs){if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANTAKECALLOFFHOLD)){return false;}var oHD=new HelpdeskSession();oHD.TakeCallOffHold(strCallrefs);return true;}function _swchd_close_call(strCallrefs){}function _swchd_cancel_call(strCallrefs){}