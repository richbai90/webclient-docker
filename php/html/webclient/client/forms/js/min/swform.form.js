function new_swform(strFormName,oFormJson,swDocument,boolAltForm,strFormSpecificJson){var aForm=new _swform(strFormName,oFormJson,swDocument,boolAltForm,strFormSpecificJson);return aForm;}function _swform(strFormName,oFormJson,swDocument,boolAltForm,strFormSpecificJson){if(boolAltForm==undefined){boolAltForm=false;}if(strFormSpecificJson==undefined){strFormSpecificJson=strFormJson;}if(boolAltForm||strFormName=="mainform"){var strForm=strFormSpecificJson.split('"layout":')[1];if(strForm.charAt(0)=="{"){strForm=strForm.split(',"extendedLayout":')[0];this.jform=eval("("+strForm+")");}else{this.jform=eval("("+strForm.substring(0,strForm.length-3)+")");this.jform=this.jform[0];}}else{if(strFormName=="extform"){var strForm=strFormSpecificJson.split('"extendedLayout":')[1];this.jform=eval("("+strForm.substring(0,strForm.length-2)+")");}}this._name=strFormName;this.elements=new Array();this.namedelements=new Array();this.boundelements=new Array();this.elementsbybinding=new Array();this._controlgroups=new Array();this._tabname="Details";this._tabcontrols=new Array();this._flagcontrols=new Array();this._width=0;this._height=0;this.width=0;this.height=0;this._origwidth=0;this._origheight=0;this._readonly=false;this.readonly=false;this._binitialised=false;this._bDrawn=false;this._isaltforn=boolAltForm;this._xmlaltformdom=null;this._jsonaltformdom=null;this._swdoc=swDocument;this.document=swDocument;this._targetiframe=this._swdoc.document.getElementById("if_"+strFormName);this._targetdocument=this._targetiframe.contentWindow.document;this._targetframe=this._targetiframe.contentWindow;this._targetframe._form=this;this._activating_menubutton=false;this._arr_open_menubuttons=new Array();this._arr_open_lists=new Array();this._arrtimers=new Array();this._initialise(oFormJson);}_swform.prototype._close_open_menubuttons=function(){for(strID in this._arr_open_menubuttons){if(this._arr_open_menubuttons[strID]){this.namedelements[strID].deactivate();}}};_swform.prototype._close_open_lists=function(strExlcudeName){for(strID in this._arr_open_lists){if(strID==strExlcudeName){continue;}if(this._arr_open_lists[strID]&&this.namedelements[strID]._dropped){this.namedelements[strID].deactivate();}}};_swform.prototype._resize_controls=function(bForce){if(!this._bDrawn){return;}if(bForce==undefined){bForce=false;}if(!bForce){if((this._origwidth==this._width)&&(this._origheight==this._height)){return;}}for(var strControlID in this.namedelements){this.namedelements[strControlID]._resize();}app.__cached_forms[_cacheformname].width=GetWinWidth();app.__cached_forms[_cacheformname].height=GetWinHeight();};_swform.prototype._initialise=function(){var oFormJson=this.jform;var lapp=app;if(!this._isaltforn){var strTable="";var arrTables=this._swdoc._tables;for(strTable in arrTables){this._targetframe[strTable]=arrTables[strTable];}}this._origwidth=oFormJson.appearance.width;this._origheight=oFormJson.appearance.height;var strControlName="";var oSwControl=null;var me=this;var arrJsonControls=oFormJson.controls;if(arrJsonControls){arrJsonControls=oFormJson.controls.control;if(oFormJson.controls.control.objectPlacement!=undefined){arrJsonControls=new Array();arrJsonControls[arrJsonControls.length++]=oFormJson.controls.control;}var cLen=arrJsonControls.length;for(var x=0;x<cLen;x++){oSwControl=new _swfc(arrJsonControls[x],me);strControlName=oSwControl.name;if(me.namedelements[strControlName]!=undefined){strControlName=strControlName+"_"+x;oSwControl.name=strControlName;}if(oSwControl._etype==FC_TABCONTROL){me._tabcontrols[strControlName]=oSwControl;}else{if(oSwControl._etype==FC_FLAGS){me._flagcontrols[strControlName]=oSwControl;}}if(oSwControl.binding!=""){me.boundelements[strControlName]=oSwControl;if(me.elementsbybinding[oSwControl.binding]==undefined){me.elementsbybinding[oSwControl.binding]=new Array();}me.elementsbybinding[oSwControl.binding][strControlName]=oSwControl;}me.namedelements[strControlName]=oSwControl;me.elements[strControlName]=oSwControl;me.elements[me.namedelements.length++]=oSwControl;me[strControlName]=oSwControl;me._targetframe[strControlName]=oSwControl;}}for(var strID in this._controlgroups){this[strID]=this._controlgroups[strID];}this._binitialised=true;};_swform.prototype._elements=function(strID){};_swform.prototype._initialise_tabcontrols=function(){var tC=null;for(strTabControlID in this._tabcontrols){tC=this._tabcontrols[strTabControlID];tC._initialise_elements();if(tC._items[tC.tab].controlInfo){var jFlags=tC._items[tC.tab].controlInfo.flags;if(jFlags!=undefined){if(jFlags.invisible=="true"){tC.ShowTabItem(tC.tab,false,true);}else{tC.ShowTabItem(tC.tab,true,true);}}else{tC.ShowTabItem(tC.tab,true,true);}}}};_swform.prototype._initialise_flagcontrols=function(){var fc=null;for(var strFlagControlID in this._flagcontrols){fc=this._flagcontrols[strFlagControlID];if(!fc.datainitialised&&fc.defaultValue!=""){fc._value(fc.defaultValue);}}};_swform.prototype._isaFilteredControl=function(oFormControl){return(oFormControl._etype==FC_SQLLIST||oFormControl._etype==FC_DBPICKLIST||oFormControl._etype==FC_FILELIST);};_swform.prototype._initialise_filters=function(strBinding,bFromUpdateFormFromData){if(bFromUpdateFormFromData==undefined){bFromUpdateFormFromData=false;}if(strBinding==undefined){strBinding="";}for(var strControlID in this.namedelements){var oFormControl=this.namedelements[strControlID];if(this._isaFilteredControl(oFormControl)){if(strBinding!=""){if(strBinding.indexOf(".")==-1){strBinding+=".";}if(oFormControl._unparsedFilter==undefined){oFormControl._unparsedFilter=oFormControl.listFilter;}if(oFormControl._unparsedFilter.indexOf(strBinding)>-1){oFormControl.Reload(bFromUpdateFormFromData);}}else{oFormControl.Reload(true);}}else{if(oFormControl._etype==FC_IMAGE){if(strBinding!=""){if(strBinding.indexOf(".")==-1){strBinding+=".";}if(oFormControl.appearance.caption.indexOf(strBinding)>-1){oFormControl._image(_parse_context_vars(oFormControl.appearance.caption));}}}}}};_swform.prototype._check_mandatory_fields=function(bAlertMessage){if(bAlertMessage==undefined){bAlertMessage=true;}for(var strControlID in this.namedelements){var strValue=app.trim(this.namedelements[strControlID].value);if(this.namedelements[strControlID].mandatory&&strValue==""&&this.namedelements[strControlID].hintText.toLowerCase()!="<auto generate>"&&this.namedelements[strControlID].visible==true){var strControlName=strControlID;if(this.namedelements[strControlID].dataRef!=""){var arrBind=this.namedelements[strControlID].dataRef.split(".");try{if(this.namedelements[strControlID].isXmlField()){strControlName=undefined;}else{strControlName=app.dd.tables[arrBind[0]].columns[arrBind[1]].DisplayName;}if(strControlName!=arrBind[1]&&strControlName!=undefined){if(bAlertMessage){alert("The form field ["+strControlName+"] is mandatory.\n\nPlease provide a value before continuing.");}return false;}else{if(strControlName==undefined){if(this.namedelements["lbl_"+strControlID]!=undefined){if(bAlertMessage){alert("The form field ["+this.namedelements["lbl_"+strControlID].text+"] is mandatory.\n\nPlease provide a value before continuing.");}return false;}}}}catch(e){}}if(bAlertMessage){alert("A form field ["+strControlID+"] that is mandatory has not been completed.\n\nPlease provide a value before continuing.");}return false;}}return true;};_swform.prototype._draw=function(){var strCacheHTML="";if(this._name=="mainform"&&app.__cached_forms[_cacheformname]["mainformhtml"]!=undefined){strCacheHTML=app.__cached_forms[_cacheformname]["mainformhtml"];}else{if(this._name=="extform"&&app.__cached_forms[_cacheformname]["extformhtml"]!=undefined){strCacheHTML=app.__cached_forms[_cacheformname]["extformhtml"];}}var bDrawnAlready=false;if(strCacheHTML!=""){bDrawnAlready=true;this._targetdocument.body.innerHTML=strCacheHTML;}for(strID in this.namedelements){this.namedelements[strID]._draw(bDrawnAlready);}this._initialise_tabcontrols();this._bDrawn=true;};_swform.prototype._OnFormLoaded=function(bDataReloaded){var strFunc="OnFormLoaded";if(this._targetframe[strFunc]){if(!_bClosingForm){res=this._targetframe[strFunc](bDataReloaded);}}};_swform.prototype._OnFieldValueChanged=function(strName,strValue){var strFunc="OnFieldValueChanged";if(this._targetframe[strFunc]){res=this._targetframe[strFunc](bDataReloaded);}};_swform.prototype._OnSize=function(nWidth,nHeight){};_swform.prototype._OnShowWindow=function(bShow){};_swform.prototype._OnSetFocus=function(){};_swform.prototype._OnKeyDown=function(nVirtualKey){};_swform.prototype._KillFocus=function(){};_swform.prototype._OnLeftClick=function(){};_swform.prototype._OnLeftDoubleClick=function(){};_swform.prototype._OnMouseOver=function(strName,bMouseOver){};_swform.prototype._OnRightClick=function(){};_swform.prototype._OnRightDoubleClick=function(){};_swform.prototype.IsObjectDefined=function(strObjectName){try{eval("var tmp = "+strObjectName+";");if(tmp!=undefined){return true;}}catch(e){return false;}return false;};_swform.prototype.GetReadOnly=function(){return this._readonly;};_swform.prototype.KillTimer=function(nTimer){if(this._targetframe._KillTimer){this._targetframe._KillTimer(nTimer);}};_swform.prototype.ResetFieldValues=function(){};_swform.prototype.SetReadOnly=function(bReadOnly){this._readonly=bReadOnly;this.readonly=bReadOnly;};_swform.prototype.SetTimer=function(nTimerID,nMilliseconds){if(this._targetframe._SetTimer){this._targetframe._SetTimer(nTimerID,nMilliseconds);}};_swform.prototype.UpdateFormFromData=function(){this._swdoc.UpdateFormFromData();};