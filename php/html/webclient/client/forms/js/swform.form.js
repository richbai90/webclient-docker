function new_swform(strFormName, oFormJson, swDocument, boolAltForm,strFormSpecificJson)
{
	var aForm = new _swform(strFormName, oFormJson, swDocument, boolAltForm,strFormSpecificJson);
	return aForm;
}

//--
//-- sw form object
function _swform(strFormName, oFormJson, swDocument, boolAltForm, strFormSpecificJson)
{
	if(boolAltForm==undefined)boolAltForm=false;
	if(strFormSpecificJson==undefined)strFormSpecificJson = strFormJson;

	if(boolAltForm || strFormName=="mainform")
	{
		//-- get form json string part and eval so we have just form json object - which makes processing faster
		var strForm = strFormSpecificJson.split('\"layout\":')[1];
		if(strForm.charAt(0)=="{")
		{
			//-- cdf or lcf
			strForm = strForm.split(',\"extendedLayout\":')[0];
			this.jform = eval("("+strForm+")");
		}
		else
		{
			//-- stf "["
			this.jform = eval("("+strForm.substring(0,strForm.length-3)+")");
			this.jform = this.jform[0];
		}
	}
	else if (strFormName=="extform")
	{
		//-- get extform json string part and eval so we have just form json object
		var strForm = strFormSpecificJson.split('\"extendedLayout\":')[1];
		this.jform = eval("("+strForm.substring(0,strForm.length-2)+")");
	}

	//-- public properties
	this._name = strFormName;
	this.elements = new Array();
	this.namedelements = new Array();
	this.boundelements = new Array();
	this.elementsbybinding = new Array();

	this._controlgroups = new Array();

	this._tabname = "Details";
	this._tabcontrols = new Array();
	this._flagcontrols = new Array()
	this._width = 0;
	this._height = 0;
	this.width = 0;
	this.height = 0;


	this._origwidth = 0;
	this._origheight = 0;

	this._readonly = false;
	this.readonly = false;
	this._binitialised = false;
	this._bDrawn=false;

	//- -special field used for diary / workflow and file attachments in lcf and cdf
	this._isaltforn = boolAltForm;
	this._xmlaltformdom = null;
	this._jsonaltformdom = null;

	//-- private properties
	this._swdoc = swDocument;
	this.document = swDocument; //-- should be ok to use

	this._targetiframe = this._swdoc.document.getElementById("if_" + strFormName);
	this._targetdocument = this._targetiframe.contentWindow.document;
	this._targetframe = this._targetiframe.contentWindow;
	this._targetframe._form = this;
	
	//-- to hold certain atts
	this._activating_menubutton = false;
	this._arr_open_menubuttons = new Array()
	this._arr_open_lists = new Array()

	this._arrtimers = new Array();
	this._initialise(oFormJson);
}

//-- private methods

_swform.prototype._close_open_menubuttons = function()
{
	for(strID in this._arr_open_menubuttons)
	{
		if(this._arr_open_menubuttons[strID])this.namedelements[strID].deactivate();
	}
}

_swform.prototype._close_open_lists = function(strExlcudeName)
{
	for(strID in this._arr_open_lists)
	{
		if(strID==strExlcudeName)continue;
		if(this._arr_open_lists[strID] && this.namedelements[strID]._dropped)	this.namedelements[strID].deactivate();
	}
}


_swform.prototype._resize_controls = function(bForce)
{
	if(!this._bDrawn) return;
	//-- has not changed size
	if(bForce==undefined)bForce=false;

	if(!bForce)
	{
		if((this._origwidth == this._width) && (this._origheight == this._height)) return;
	}

	for(var strControlID in this.namedelements)
	{
		this.namedelements[strControlID]._resize();
	}	

	app.__cached_forms[_cacheformname].width = GetWinWidth();
	app.__cached_forms[_cacheformname].height = GetWinHeight();
}

_swform.prototype._initialise = function()
{
	var oFormJson = this.jform;
	var lapp = app;
	if(!this._isaltforn)
	{
		//-- assign pointers to tables to forms (as people dont use document.opencall.callref they use opencall.callref)
		var strTable = ""
		var arrTables = this._swdoc._tables;
		for(strTable in arrTables)
		{
			this._targetframe[strTable] = arrTables[strTable];
		}
	}	

	this._origwidth =oFormJson.appearance.width;
	this._origheight = oFormJson.appearance.height;

	var strControlName = "";
	var oSwControl = null;
	var me = this;
	var arrJsonControls = oFormJson.controls;
	if(arrJsonControls)
	{
		arrJsonControls = oFormJson.controls.control;

		//-- only one control
		if(oFormJson.controls.control.objectPlacement != undefined)
		{
			arrJsonControls = new Array();
			arrJsonControls[arrJsonControls.length++] = oFormJson.controls.control;
		}

		var cLen = arrJsonControls.length;
		for(var x=0; x< cLen;x++)
		{	
			//app.debugstart(me._name+":_initialise.createcontrol["+x+"]","xmlform.php");
			oSwControl = new _swfc(arrJsonControls[x], me);		
			//app.debugend(me._name+":_initialise.createcontrol["+x+"]","xmlform.php");	
			strControlName = oSwControl.name;
			if(me.namedelements[strControlName]!=undefined)
			{
				//-- we have duplicate names - old versions of sw allowed this
				strControlName = strControlName + "_" + x;
				oSwControl.name = strControlName;
			}

			if(oSwControl._etype==FC_TABCONTROL)
			{
				me._tabcontrols[strControlName] = oSwControl;
			}
			else if(oSwControl._etype==FC_FLAGS)
			{
				me._flagcontrols[strControlName] = oSwControl;
			}

			//-- store pointer to bound elements
			if(oSwControl.binding!="")
			{
				me.boundelements[strControlName] = oSwControl;
				if(me.elementsbybinding[oSwControl.binding]==undefined)me.elementsbybinding[oSwControl.binding] = new Array();
				me.elementsbybinding[oSwControl.binding][strControlName] = oSwControl;
			}
			//-- have to store control twice as in swjs can ref elements by index or name 
			me.namedelements[strControlName] = oSwControl;
			me.elements[strControlName] = oSwControl;
			me.elements[me.namedelements.length++] = oSwControl; //-- store in numeric length position as well

			me[strControlName] = oSwControl;	//-- so can ref mainform.tb_text.value()
			me._targetframe[strControlName] = oSwControl; //-- so can ref in actual form js as tb_text.value();	

		}//-- eof aClen

	}//-- if arrJsonControls

	//-- process control groups and associate to the form object
	for(var strID in this._controlgroups)
	{
		//this.elements[strID] = this._controlgroups[strID];
		this[strID] = this._controlgroups[strID];

	}
	this._binitialised = true;

}

//-- given either an index or a name return element
_swform.prototype._elements = function(strID)
{

}

//-- loop through tab controls and hide element is inactive tabs
_swform.prototype._initialise_tabcontrols = function()
{
	//-- associate elements first
	var tC=null;
	for(strTabControlID in this._tabcontrols)
	{
		tC=this._tabcontrols[strTabControlID];
		tC._initialise_elements();
		//-- nwj - fix onform laoding hidden tabs
		if(tC._items[tC.tab].controlInfo) 
		{
			var jFlags =tC._items[tC.tab].controlInfo.flags;
			if(jFlags!=undefined)
			{
				if(jFlags.invisible=="true")
				{
					tC.ShowTabItem(tC.tab,false,true);
				}
				else
				{
					tC.ShowTabItem(tC.tab,true,true);
				}
			}
			else
			{
				tC.ShowTabItem(tC.tab,true,true);
			}
		}
	}
}

//-- loop through flag controls and set default value
_swform.prototype._initialise_flagcontrols = function()
{
	//-- associate elements first
	var fc=null;
	for(var strFlagControlID in this._flagcontrols)
	{
		fc = this._flagcontrols[strFlagControlID];
		if(!fc.datainitialised && fc.defaultValue!="")fc._value(fc.defaultValue);
	}
}


_swform.prototype._isaFilteredControl = function(oFormControl)
{
	return (oFormControl._etype==FC_SQLLIST || oFormControl._etype==FC_DBPICKLIST ||  oFormControl._etype==FC_FILELIST);
}

//-- loop through filtered controls apply filter
_swform.prototype._initialise_filters = function(strBinding,bFromUpdateFormFromData)
{
	if(bFromUpdateFormFromData==undefined)bFromUpdateFormFromData=false;
	if(strBinding==undefined)strBinding="";
	
	//-- now process them
	for(var strControlID in this.namedelements)
	{
		var oFormControl = this.namedelements[strControlID];

		if(this._isaFilteredControl(oFormControl))
		{
			//-- if we have binding check if it is in the _unparsedFilter
			if(strBinding!="")
			{
				if(strBinding.indexOf(".")==-1)strBinding +=".";
				if(oFormControl._unparsedFilter==undefined)oFormControl._unparsedFilter = oFormControl.listFilter;
				if(oFormControl._unparsedFilter.indexOf(strBinding)>-1)
				{			
					
					oFormControl.Reload(bFromUpdateFormFromData);
				}
			}
			else
			{
				oFormControl.Reload(true);
			}
		}
		else if(oFormControl._etype==FC_IMAGE)
		{
			//-- check if image url (caption) has link to passed in binding
			if(strBinding!="")
			{
				if(strBinding.indexOf(".")==-1)strBinding +=".";
				if(oFormControl.appearance.caption.indexOf(strBinding)>-1)
				{
					//-- reload image
					oFormControl._image(_parse_context_vars(oFormControl.appearance.caption));
				}
			}
		}
	}
}

//-- loop through form elements and check mandatory field
_swform.prototype._check_mandatory_fields = function(bAlertMessage)
{
	if(bAlertMessage==undefined)bAlertMessage=true;

	//-- now process them
	for(var strControlID in this.namedelements)
	{
		//-- trim the value
		var strValue  = app.trim(this.namedelements[strControlID].value);

		if(this.namedelements[strControlID].mandatory && strValue=="" && this.namedelements[strControlID].hintText.toLowerCase()!="<auto generate>" && this.namedelements[strControlID].visible == true)
		{
			//-- if we have binding check if it is in the _unparsedFilter
			var strControlName = strControlID;
			if(this.namedelements[strControlID].dataRef!="")
			{
				var arrBind = this.namedelements[strControlID].dataRef.split(".");
				try
				{
					//-- get displayname if not an xml field
					if(this.namedelements[strControlID].isXmlField())
					{
						strControlName=undefined;
					}
					else
					{ 
						strControlName = app.dd.tables[arrBind[0]].columns[arrBind[1]].DisplayName;
					}

					if(strControlName!=arrBind[1] && strControlName!=undefined)
					{
						if(bAlertMessage)alert("The form field ["+strControlName+"] is mandatory.\n\nPlease provide a value before continuing.");
						return false;
					}
					else if(strControlName==undefined)
					{
						//-- could be sys form - so check if we have label
						if(this.namedelements["lbl_" + strControlID]!=undefined)
						{

							if(bAlertMessage)alert("The form field [" + this.namedelements["lbl_" + strControlID].text + "] is mandatory.\n\nPlease provide a value before continuing.");
							return false;
						}
					}
				}
				catch(e)
				{

				}		
			}
			if(bAlertMessage)alert("A form field [" + strControlID + "] that is mandatory has not been completed.\n\nPlease provide a value before continuing.");
			return false;
		}
	}
	return true;
}

_swform.prototype._draw = function()
{
	var strCacheHTML = "";
	if(this._name=="mainform" && app.__cached_forms[_cacheformname]["mainformhtml"]!=undefined)
	{
		strCacheHTML = app.__cached_forms[_cacheformname]["mainformhtml"];
	}
	else if(this._name=="extform" && app.__cached_forms[_cacheformname]["extformhtml"]!=undefined)
	{
		strCacheHTML = app.__cached_forms[_cacheformname]["extformhtml"];
	}

	var bDrawnAlready = false;
	if(strCacheHTML!="")
	{
		bDrawnAlready = true;
		this._targetdocument.body.innerHTML = strCacheHTML;
	}
	
	for(strID in this.namedelements)
	{
		this.namedelements[strID]._draw(bDrawnAlready);
	}

	this._initialise_tabcontrols();
	this._bDrawn=true;
}


//-- event functions
_swform.prototype._OnFormLoaded = function(bDataReloaded)
{
	//-- call app developer define function
	var strFunc ="OnFormLoaded";
	if(this._targetframe[strFunc])
	{
		//-- have to put catch around in case user closes window before loading has finished
		//try
		//{
			if(!_bClosingForm)res = this._targetframe[strFunc](bDataReloaded);			
		//}
		//catch (e)
		//{
			//-- check if form is closing
		//	if(!_bClosingForm)
		//	{
				//-- form not closing so call function again to browser traps error
		//		res = this._targetframe[strFunc](bDataReloaded);			
		//	}
		//}

	}
}

_swform.prototype._OnFieldValueChanged = function(strName,strValue)
{

	//-- call app developer define function
	var strFunc ="OnFieldValueChanged";
	if(this._targetframe[strFunc])res = this._targetframe[strFunc](bDataReloaded);
}

_swform.prototype._OnSize = function(nWidth,nHeight)
{

}

_swform.prototype._OnShowWindow = function(bShow)
{

}

_swform.prototype._OnSetFocus = function()
{

}

_swform.prototype._OnKeyDown = function(nVirtualKey)
{

}


_swform.prototype._KillFocus = function()
{

}
_swform.prototype._OnLeftClick = function()
{

}

_swform.prototype._OnLeftDoubleClick = function()
{

}

_swform.prototype._OnMouseOver = function(strName,bMouseOver)
{

}

_swform.prototype._OnRightClick = function()
{

}

_swform.prototype._OnRightDoubleClick = function()
{

}


//-- public methods

//-- check if thing is defined
_swform.prototype.IsObjectDefined = function(strObjectName)
{
	try
	{
		eval("var tmp = "+strObjectName+";");		
		if(tmp!=undefined) return true;
	}
	catch (e)
	{
		return false;
	}
	return false;
}


_swform.prototype.GetReadOnly= function()
{
	return this._readonly;
}

_swform.prototype.KillTimer= function(nTimer)
{
	if(this._targetframe._KillTimer)
	{
		this._targetframe._KillTimer(nTimer)
	}
}

_swform.prototype.ResetFieldValues= function()
{
}

_swform.prototype.SetReadOnly= function(bReadOnly)
{
	this._readonly=bReadOnly;
	this.readonly = bReadOnly;
}

_swform.prototype.SetTimer= function(nTimerID, nMilliseconds)
{
	if(this._targetframe._SetTimer)
	{
		this._targetframe._SetTimer(nTimerID, nMilliseconds)
	}
}


_swform.prototype.UpdateFormFromData= function()
{
		this._swdoc.UpdateFormFromData()
}
