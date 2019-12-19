//-- object simulating form control with swjs methods
//-- each control has this basic type. when loading form bind elements to js object

//-- define img picklist image counts (how many images that are in imagelist sarting from 0)
var _img_picklists = new Array();
_img_picklists["Generic Types"] = 14;
_img_picklists["Helpdesk Icons"] = 74;

var isIE  = (window.ActiveXObject);

//-- control types
var FC_IMGPICKLIST = "Pick List (Image Mode)";
var FC_DBPICKLIST = "Distinct Pick List";
var FC_PICKLIST = "Pick List";
var FC_NUMPICKLIST = "Pick List (Numeric Mode)";
var FC_XMLPICKLIST = "Pick List (XML Source)";
var FC_TABCONTROL = "TabControl";
var FC_CAPTIONBAR = "CaptionBar";
var FC_RECTANGLE = "Rectange";
var FC_LINE = "Line";

var FC_SINGLESETCHART = "SingleSetChart";

var FC_LINKLABEL = "LinkLabel";
var FC_SQLLIST = "SqlTable";
var FC_FILELIST = "FileListTable";
var FC_FLAGS = "Form Flags";
var FC_LABEL = "Text";
var FC_FIELDLABEL = "FieldName";
var FC_EMAIL = "E-mail Address";
var FC_TEXTEDIT = "Text Edit";
var FC_PASSWORD = "Password";
var FC_SEARCHFIELD = "DualSearchField";
var FC_BUTTON = "EventButton";
var FC_MENUBUTTON = "MenuButton";
var FC_IMAGE = "Image";
var FC_DATETIME = "Date/Time Control";
var FC_FORMULA = "FormulaField";
var FC_MINUTETIME = "Minute Time Period";
var FC_SECONDTIME = "Second Time Period";
//-- counter for unamed objects
var _swfc_unnamedcounter = 1;

function _swfc(oControlJson, oForm)
{
	//-- swc properties
	this.name= "";
	this.duplicatename = ""; //-- in sw can have controls with same name - we will use this to see if there is js to run
	this.binding = "";
	this.dataRef = "";

	this._form = oForm;
	this._value_initialised=false;

	this.element = null; //-- pointer to html holding element
	this._mandatoryicon = null;
	this.htmldocument = oForm._targetdocument; //-- html document that control will be drawn on
	this.frame = oForm._targetiframe.contentWindow
		
	
	//-- pivate properties
	this._bHintText = false; //-- hint text is being shown or not.
	this._tabcontrol = null;
	this._commandkeydown = false;

	//-- appearance
	this.appearance = {};
	this.appearance.index = 0;
	this.appearance.caption = ""; //-- for labels, buttons, menubuttons, caption area or image for image control
	this.appearance.backgroundColor = "";
	this.appearance.foregroundColor = "";
	this.appearance.alignment = "Left";
	this.appearance.borderstyle = "Rectangle";
	this.appearance.fillStyle = "Solid";

	//-- font
	this.font = {};
	this.font.name = "Trebuchet MS";
	this.font.size = "8";
	this.font.bold = 0;
	this.font.underline = 0;
	this.font.strikeout = 0;

	//-- positioning
	this.position = {};
	this.position.top = 0;
	this.position.left = 0;
	this.position.bottom = 0;
	this.position.right = 0;

	this.position.origwidth = 0;
	this.position.origleft = 0;
	this.position.origtop = 0;
	this.position.origheight = 0;

	//-- scaling
	this.scaling = {};
	this.scaling.top = 0;
	this.scaling.left = 0;
	this.scaling.bottom = 0;
	this.scaling.right = 0;

	this.controlinfo = {};
	this.controlinfo.type = "";
	this.controlinfo.mouseOverCursor = "default";

	//-- generic flag properties
	this.toolbarButtonStyle=false;
	this.tabInvisible = false; //-- t/f based on tab item active for control
	this.enable=true;
	this.invisible = false;
	this.visible=true
	this.readOnly = false;
	this.mandatory = false;
	this.allowNullValue = false;
	this.allowResize = false;
	this.url = false;
	this.editUnlimitedText = false;
	this.colorDateIndicator = false;
	this.autoCompleteField = false;
	this.skipTabStop = false;
	this.disabled = false;
	this._protected = false;
	this.noMacroExpand = false;
	this.useDDPickList = false;
	this.readOnlyInit = false;
	this.showHeader = false;
	
	//-- event button - mnu button
	this.eventButtonIcon="";

	//-- listbox
	this.comboNewValues = false;//-- opposite of picklistonly so t=f f=t
	this.picklistonly = false;
	this.comboQuickAdd = false;
	this.comboAutoUpdate = false;
	this.pickListOrderDesc = false;

	//-- sqltable
	this.sortDescending = false;
	this.sortColumn = -1;
	this.hasCheckbox = false;

	//-- datebox
	this.dateFormat = "";
	this.dateFormatMode = 0; //-- 0 = datetime, 1= date, 2=time, 3 custom

	//-- sqltable
	this.selectionMode = 0; //(1= multi-select)
	this.autoLoad = false;
	this.path = "";

	//-- control specific properties
	this.storedQuery = "";
	this.sqlSource = "";
	this.table = ""; //-- sqltable
	this.distinctTable = "";
	this.distinctColumn = "";
	this.displayColumn = "";
	this.hintText = "";
	this.editRecordForm = "";
	this.addRecordForm = "";	
	this.newRecordForm = "";
	this.listFilter = "";
	this.unparsedFilter = "";
	this.extraOptions = "";
	this.listItems = "";
	this.pickList = "";
	this.defaultValue = "";
	this.textInputFormat = "Text";
	this.disabledBackgroundColor = "#eeeeee";
	this.borderColor = "#c0c0c0";
	this.controlGroup = "";

	this.transparentColor = "";
	this.transparent = false;

	this.flagItems = ""; //- formflag - a^1|b^2
	this.commands = ""; //- menubutton - a^1|b^2
	this.highlightStyle = ""; //-- sqllist
	this.value = "";
	this.text = "";
	this.display = "";

	this._originaltextcolor ="";

	//-- image
	this.imageHAlign = 1;
	this.imageVAlign=1;
	this.noImageImage = "" //-- image control

	//-- caption
	this.imageHSpace = 0;
	this.slope = 0;
	this.headerHeight = 23;
	this.hasBorder = 1;
	this.panelBorderColor="#d3c9b6";
	this.fillStyle=0;
	this.panelBackgroundColor = "#f2eedd";
	this.panelBackgroundColor2 = "#000000";
	this.image ="";	//-- something like &[app.webroot]/clisupp/formimages/itsm/assets.png

	//-- swjs common properties
	this._etype = "";
	this.binding = "";
	this.group = ""; //-- tab control assoc - tabcontrolname:tabitempos
	this.controlGroup = ""; //-- used to group controls together and set common properies
	this.xpStyle = false;

	this._initialise(oControlJson);
}

_swfc.prototype._element = function ()
{
	this.element = this.htmldocument.getElementById(this.name);
	return this.element;
}

//-- given <control> xml node setup properties
_swfc.prototype._initialise = function (oControlJson)
{
	//-- store top settings
	var jsontothis = _json_to_js;
	jsontothis(oControlJson,this);

	if(this.name.indexOf("")=="sla")poo();

	//-- store general settings
	jsontothis(oControlJson.general,this);

	//-- store flags
	jsontothis(oControlJson.controlInfo.flags,this,_cBoolean);
	jsontothis(oControlJson.general.flags,this,_cBoolean);

	//-- store appearance settings
	jsontothis(oControlJson.appearance,this.appearance);

	//-- remove double & due to full client bug
	if(this.appearance.caption.indexOf("&&")>-1)
	{
		this.appearance.caption = _regexreplace(this.appearance.caption,"&&","&");
	}

	//-- get binding
	jsontothis(oControlJson.data,this)

	//-- font
	var oFont = oControlJson.appearance.font;
	if(oFont!=undefined)
	{
		if(oFont['#text']!=undefined)this.font.name=oFont['#text'];
		if(oFont['@size']!=undefined)this.font.size=oFont['@size'];
		if(oFont['@bold']!=undefined)this.font.bold=oFont['@bold'];
		if(oFont['@italic']!=undefined)this.font.italic=oFont['@italic'];
		if(oFont['@underline']!=undefined)this.font.underline=oFont['@underline'];
		if(oFont['@strikeout']!=undefined)this.font.strikeout=oFont['@strikeout'];
	}

	jsontothis(oControlJson.objectPlacement.position,this.position);
	if(this.position.top<0)this.position.top=0; //-- fix where elements < 0 appear at bottom

	jsontothis(oControlJson.objectPlacement.scaling,this.scaling,_cNum);

	//-- store control info settings
	this._etype = this.type;	
	this.type= _element_numeric_types[this.type];

	if(this._etype==FC_FILELIST || this._etype==FC_SQLLIST)
	{
		//-- to avoid picking uip columns control info
		this._jsoncols = oControlJson.columns; //-- array of columns
		if(this._jsoncols==undefined)this._jsoncols = new Object();
		if(this._jsoncols.controlInfo==undefined || this._jsoncols.controlInfo[0]==undefined)
		{
			this._jsoncols.controlInfo = new Array(this._jsoncols.controlInfo);
		}
		jsontothis(oControlJson.controlInfo,this.controlinfo);

	}
	else
	{
		jsontothis(oControlJson.controlInfo,this.controlinfo);
		this.textInputFormat = oControlJson.controlInfo.textInputFormat;
	}
	

	//-- store property settings
	jsontothis(oControlJson.controlInfo.properties,this);

	if(this._etype=="Field")
	{
		this._etype = this.controlinfo.type;
	}
	else if(this._etype==FC_FIELDLABEL || this._etype==FC_LABEL)
	{
		this.mandatory = false;
	}
	else if(this._etype==FC_TABCONTROL)
	{
		this._items = oControlJson.items.item;
		if(this._items[0]==undefined)
		{
			this._items= new Array(this._items);
		}

	}


	//-- if have no name or name already used
	this.duplicatename = this.name;
	if(this.name=="")
	{
		this.name = "swfc_" + _swfc_unnamedcounter++;
		this.duplicatename = this.name;	
	}
	else if(this._form[this.name]!=undefined)
	{
		//-- exists already
		this.duplicatename = this.name;
		this.name = this.name + _swfc_unnamedcounter++;
	}

	//-- set transparancy - except for caption bars
	if(this.transparent && this._etype!=FC_CAPTIONBAR)this.appearance.backgroundColor="";


	this.binding = this.binding.toLowerCase();
	this.dataRef = this.binding

	//-- 06.07.2010 - set form control group
	if(this.controlGroup!="" )
	{
		if(this._form._controlgroups[this.controlGroup]==undefined)	this._form._controlgroups[this.controlGroup] = new _swform_controlgroup(this.controlGroup);	
		this._form._controlgroups[this.controlGroup]._add_element(this);
	}

	//-- have to do this in case have lost objects on form i.e. bound to tab controls that do not exist.
	if(this.group!="") this.tabInvisible=true;
}


//-- draw control
_swfc.prototype._draw = function (bDrawnAlready)
{
	if(app.isSafari && this.htmldocument.body==null)this.htmldocument = this.frame.document; //-- safari bug
	switch(this._type())
	{
		case FC_SINGLESETCHART:
			this._draw_singlesetchart(bDrawnAlready);
			break;

		case FC_LINKLABEL:
			this._draw_linklabel(bDrawnAlready);
			break;
		case FC_IMGPICKLIST:
		case FC_DBPICKLIST:
		case FC_PICKLIST:
		case FC_NUMPICKLIST:
		case FC_XMLPICKLIST:
			this._draw_picklist(bDrawnAlready);
			break;
		case FC_SQLLIST:
			this._draw_sqltable(bDrawnAlready);
			break;
		case FC_FILELIST:
			this._draw_filetable(bDrawnAlready);
			break;

		case FC_LINE:
		case FC_RECTANGLE:
			this._draw_rectangle(bDrawnAlready);	
			break;
		case FC_TEXTEDIT:
		case FC_SEARCHFIELD:
			this._draw_textedit(bDrawnAlready);
			break;
		case FC_PASSWORD:
			this._draw_password(bDrawnAlready);
			break;
		case FC_EMAIL:
			this._draw_emailbox(bDrawnAlready);
			break;
		case FC_FLAGS:
			this._draw_formflags(bDrawnAlready);
			break;	
		case FC_LABEL:
		case FC_FIELDLABEL:
			this._draw_label(bDrawnAlready);
			break;
		case FC_BUTTON:
			this._draw_button(bDrawnAlready)
			break;
		case FC_MENUBUTTON:
			this._draw_mnubutton(bDrawnAlready)
			break;
		case FC_CAPTIONBAR:
			this._draw_captionarea(bDrawnAlready);
			break;
		case FC_IMAGE:
			this._draw_image(bDrawnAlready);
			break;
		case FC_TABCONTROL:
			this._draw_tabcontrol(bDrawnAlready);
			break;
		case FC_SECONDTIME:
			this._draw_secondtime(bDrawnAlready);
			break;
		case FC_MINUTETIME:
			this._draw_minutetime(bDrawnAlready);
			break;
		case FC_DATETIME:
			this._draw_datecontrol(bDrawnAlready);
			break;

		case FC_FORMULA:
			this._draw_formula(bDrawnAlready);
			break;

	}

	//-- store bgcolor
	this._bgcolor(this.appearance.backgroundColor);

	//-- hide or show element
	this._visible(!this.invisible);

	//-- set enable property
	this.enable = (this.disabled)?false:true;

	//--
	//-- call detail form disable related table items
	if(_formtype==_CDF && !this._form._isaltforn && this.dataRef!="")
	{
		//-- if bound to related table then disable
		var arrRef = this.dataRef.split(".");
		if(arrRef[0]!=document._mastertable._name) 
		{
			var boolDisable = (document._exttable && arrRef[0]==document._exttable._name)?false:true;
			
			if(boolDisable && this._is_an_input_field())
			{
				this._enable(false);				
			}

		}
		else
		{
			this._enable(this.enable);
		}
	}
	else
	{
		this._enable(this.enable);
	}

	//-- not lcf or cdf check if field has binding and if that binding = mastertable pk make mandatory
	if(_formtype!=_CDF && _formtype!=_LCF && this.dataRef!="")
	{
		//-- dont process labels
		if(this._etype!=FC_LABEL && this._etype!=FC_FIELDLABEL)
		{
			var arrRef = this.dataRef.split(".");
			//if(document._mastertable!=null && document._mastertable._name == arrRef[0] && document._mastertable._keycolumn==arrRef[1])
			if(this._form._swdoc._mastertable!=null && this._form._swdoc._mastertable._name == arrRef[0] && this._form._swdoc._mastertable._keycolumn==arrRef[1])
			{
				this._mandatory(true);
				//-- if in edit mode set to disabled
				if(_formmode=="edit")this._enable(false);
			}
		}
	}
	return;	
}

_swfc.prototype._store_position = function ()
{
	var lnopx = app.noPx;
	var oe =this.element;
	var tp = this.position;

	tp.origwidth = oe.offsetWidth;
	tp.origleft = lnopx(oe.style.left);
	tp.origtop = lnopx(oe.style.top);
	tp.origheight = oe.offsetHeight;
}


//-- draw rectangle element
_swfc.prototype._draw_rectangle = function (bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 0; //+ (this.appearance.index-1+1);

		//-- we want to draw an iframe
		if(this.name.indexOf("_iframe_")==0)
		{
			var strStyleAtts = this._get_border_style() + ";font-size:0px;overflow:auto;position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+ this.position.top +"px;left:"+this.position.left+"px;"
			var strHTML = "<iframe id='"+ this.name+"' style='"+strStyleAtts+"' onload='app._swc_check_document_hrefs(this);' onreadstatechange='app._swc_check_document_hrefs(this);'></iframe>";
		}
		else
		{
			if(this._etype==FC_LINE)
			{
				if(this.appearance.backgroundColor=="")this.appearance.backgroundColor="#8f8f8f";
				//-- 88422 - determine if vertical or horiz
				if(intHeight>intWidth)
				{
					//-- vert
					var iAddTop = 0;
					var iAddLeft = Math.round(intWidth/2);
					intWidth=1;
				}
				else
				{
					//-- horiz
					var iAddTop = Math.round(intHeight/2);
					var iAddLeft = 0;
					intHeight=1;
				}
				var strStyleAtts = this._get_font_style() + this._get_border_style() + ";font-size:0px;overflow:auto;position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+ (this.position.top-1+iAddTop) +"px;left:"+(this.position.left-0+iAddLeft)+"px;"
			}
			else
			{
				var strStyleAtts = this._get_font_style() + this._get_border_style() + this._background_css()+";font-size:0px;overflow:auto;position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+ this.position.top +"px;left:"+this.position.left+"px;"
			}
		
			var strHTML = "<div id='"+ this.name+"' onclick='this.swfc._onleftclick(this);' style='"+strStyleAtts+"'></div>";
		}

		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;
}


//-- draw label element
_swfc.prototype._draw_label = function (bDrawnAlready)
{
	var tString  = this.appearance.caption;
	var iStart = tString.indexOf("&[");
	if(iStart>-1)
	{
		tString = _parse_context_vars(tString,false,true);
	}
	else
	{
		if(this.binding!="")
		{
			//-- cp workaround - caption is not updated in forms xml
			//-- so we need to get from ddf
			tString = app._application_labels[this.dataRef];
		}
	}
	

	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 300 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";overflow:hidden;position:absolute;padding-left:0px;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"
		var strDisabled = (this.disabled)?"DISABLED":"";
		
		//-- get span top by dividing top by 2 and then - font size (approx to px)


		var iSpanTop = (intHeight / 2) - ((this.font.size * 1.338) / 2) - 1;

		//-- set label style according to pos
		var strHTML = "<div id='"+ this.name+"' "+strDisabled+" style='"+strStyleAtts+";' onmousedown='this.swfc._onmousedown(event);'>";
		if(this.appearance.alignment.toLowerCase()=="right")
		{
			//-- right align - so need specal style for overflow left
			var strLabel = "<label id='"+this.name+"_labeltext' style='position:absolute;top:"+iSpanTop+"px;right:0;white-space:nowrap;'>" + tString + "</label>";
			strHTML +=		"<div style='height:100%;width:100%;float:left;text-align:right;display:block;overflow:hidden;position:relative;'>"+ strLabel + "</div>";
		}
		else
		{
			//-- normal
			var strMultiLine = (this.multiLine)?"":"white-space:nowrap;";
			if(this.multiLine)
			{
				//-- multiline label
				var strLabel = "<label id='"+this.name+"_labeltext'>" + tString + "</label>";
				strHTML +=		"<div style='"+this._get_font_style()+";display:block;'>"+ strLabel + "</div>";
			}
			else
			{
				var strLabel = "<label id='"+this.name+"_labeltext' style='"+strMultiLine+"'>" + tString + "</label>";
				strHTML +=	"<div style='"+this._get_font_style()+";display:block;overflow:hidden;position:relative;top:"+iSpanTop+";'>"+ strLabel + "</div>";

			}
		}
		strHTML +="</div>";

		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;

	//-- label is already drawn but it might have a binding in it " Thsi is call &[opencall.callref]"
	//-- so check ot see if needs changing
	if(bDrawnAlready && this.appearance.caption.indexOf("&[")>-1)
	{
		this._text(_parse_context_vars(this.appearance.caption,false,true));
	}
	else
	{
		this.text = tString;
	}

}




//-- draw formalua field
_swfc.prototype._draw_formula = function (bDrawnAlready)
{
	this._draw_textedit(bDrawnAlready);
	if(bDrawnAlready)
	{
		this.element.style.backgroundColor="";
		var strColor = this.appearance.foregroundColor;
		if(strColor=="")strColor="#000000";
		this.element.style.color = strColor;
	}

	this._readOnly(true);
}

_swfc.prototype._draw_minutetime = function (bDrawnAlready)
{
	this._draw_textedit(bDrawnAlready);
}

_swfc.prototype._draw_secondtime = function (bDrawnAlready)
{
	this._draw_textedit(bDrawnAlready);
}

_swfc.prototype._is_an_input_field = function()
{
	switch(this._etype)
	{
		case FC_TEXTEDIT:
		case FC_EMAIL:
		case FC_PASSWORD:
		case FC_SEARCHFIELD:
		case FC_IMGPICKLIST:
		case FC_DBPICKLIST:
		case FC_PICKLIST:
		case FC_NUMPICKLIST:
		case FC_XMLPICKLIST:
		case FC_DATETIME:
		case FC_MINUTETIME:
		case FC_SECONDTIME:
			return true;
	}
	return false;
}

//-- returns css for background setting
_swfc.prototype._background_css = function()
{
	var bgColorOne = this.appearance.backgroundColor;
	var bgColorTwo = "";
	var bFillTop = true;
	if(this.appearance.fillStyle=="Vertical Gradient")
	{
		bgColorTwo = this.backgroundColor2;
	}
	else if(this.appearance.fillStyle=="Horizontal Gradient")
	{
		bFillTop = false;
		bgColorTwo = this.backgroundColor2;
	}

	if(bgColorTwo !="")
	{
		if(app.isIE10Above)
		{
			if(bFillTop)
			{
				var strStyle = "background: -ms-linear-gradient(top, "+bgColorOne+", "+bgColorTwo+")";
			}
			else
			{
				var strStyle = "background: -ms-linear-gradient(left, "+bgColorOne+", "+bgColorTwo+")";
			}		
		}
		else if(app.isIE)
		{
			if(bFillTop)
			{
				var strStyle = "filter:progid:DXImageTransform.Microsoft.Gradient(Enabled=true,GradientType=0,StartColorStr="+bgColorOne+",EndColorStr="+bgColorTwo+")";
			}
			else
			{
				var strStyle = "filter:progid:DXImageTransform.Microsoft.Gradient(Enabled=true,GradientType=1,StartColorStr="+bgColorOne+",EndColorStr="+bgColorTwo+")";
			}
		}
		else if(app.isFirefox)
		{
			if(bFillTop)
			{
				var strStyle = "background: -moz-linear-gradient(top, "+bgColorOne+", "+bgColorTwo+")";
			}
			else
			{
				var strStyle = "background: -moz-linear-gradient(left, "+bgColorOne+", "+bgColorTwo+")";
			}
		}
		else
		{
			var strStyle = "background-color:"+bgColorOne;
		}
		
	}
	else
	{
		var strStyle = "background-color:"+bgColorOne;
	}
	return strStyle;
}

//-- draw caption area
_swfc.prototype._draw_captionarea = function (bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 1;
		//-- image
		var strIMG = "<div style='height:"+(this.headerHeight)+";'></div>";
		if(this.image!="")
		{
			strIMG = "<img src='"+ _parse_context_vars(this.image) +"'>";
		}

		//-- show title only
		if(intHeight ==	this.headerHeight)
		{
			var strStyleAtts = "position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;top:"+(this.position.top-1)+"px;left:"+this.position.left+"px;"
			strHTML = "<div id='"+ this.name+"' style='"+strStyleAtts+"'>"
		}
		else
		{
			var strStyleAtts = this._get_border_style() +  ";position:absolute;background-color:"+this.panelBackgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+(intHeight-1+2)+"px;top:"+(this.position.top-1)+"px;left:"+this.position.left+"px;"
			var strHTML = "<div id='"+ this.name+"' style='"+strStyleAtts+"'>"

		}

		//-- title
		//-- set background
		var strCaptionTitleBackground = this._background_css();
		if(intHeight ==	this.headerHeight)
		{
			var strTitleStyleAtts ="padding:0px 0px 0px 2px;"+strCaptionTitleBackground+";height:" + (this.headerHeight) + "px;border:"+this.hasBorder+"px solid " + this.borderColor+";";
		}
		else
		{
			var strTitleStyleAtts ="padding:0px 0px 0px 2px;"+strCaptionTitleBackground+";height:" + (this.headerHeight) + "px;border-bottom:"+this.hasBorder+"px solid " + this.borderColor+";";
		}


		strHTML += "<div style='"+strTitleStyleAtts+"'><table cellspacing=0 cellpadding=0 border=0><tr><td>"+strIMG+"</td><td style='"+this._get_font_style()+";color:"+this.appearance.foregroundColor+";'><div id='"+this.name+"_captiontext' style='position:relative;top:0px;padding-left:5px;'>"	+ _parse_context_vars(this.appearance.caption,false,true) + "</div></td></tr></table></div>";
		strHTML += "</div>";

		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;

	//-- reset caption header
	if(bDrawnAlready && this.appearance.caption.indexOf("&[")>-1)
	{
		var oHeader = this.htmldocument.getElementById(this.name+"_captiontext");
		if(oHeader)
		{
			app.setElementText(oHeader,_parse_context_vars(this.appearance.caption,false,true))
		}
	}

}

//-- draw caption area
_swfc.prototype._draw_image = function (bDrawnAlready)
{
	this._imageerror = false;

	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 9999 + (this.appearance.index-1+1);
		//-- transparent
		if(this.backMode=="1") this.appearance.backgroundColor="";

		var strStyleAtts = this._get_border_style() + ";background:"+this.appearance.backgroundColor+";position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+(this.position.top-1)+"px;left:"+this.position.left+"px;"

		
		var strHTML = "<div id='"+ this.name+"' style='"+strStyleAtts+"'>";
				//-- image - no image mode (stretch or exact size) defined in xml so stretch
				strHTML += "<img style='width:100%;height:100%;background:"+this.appearance.backgroundColor+";' onclick='this.parentNode.swfc._onleftclick(this);' imageborder='0'>";
		
			strHTML += "</div>";

		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;	
	

	this.element.childNodes[0].onerror = this._imgerror;
	this.element.childNodes[0].onload = this._imgloaded;
	var strSrc = _parse_context_vars(this.appearance.caption);
	if(strSrc.indexOf("/.")!=-1)
	{
		this._imageError = true;
		this.element.childNodes[0].src = _parse_context_vars(this.noImageImage);
	}
	else
	{
		this.element.childNodes[0].src = _parse_context_vars(this.appearance.caption);
	}

}

_swfc.prototype._imgloaded = function()
{
	var swfc = this.parentNode.swfc;
	swfc._imageError = false;
}

//-- if image does not load then try loading alt image
_swfc.prototype._imgerror = function()
{
	var swfc = this.parentNode.swfc;
	if(!swfc._imageError && swfc.noImageImage!="")
	{
		swfc._imageError = true; //-- so do no loop on error
		//-- set alt image
		swfc.element.childNodes[0].src = _parse_context_vars(swfc.noImageImage);
	}
}


//-- draw button
_swfc.prototype._draw_button = function (bDrawnAlready)
{
	if(this.toolbarButtonStyle)
	{
		return this._draw_mnubutton(bDrawnAlready);
	}
	
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 750 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + ";position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"

		var strDisabled = (this.disabled)?"DISABLED":"";
		var strTableStyle = "";
		if(intHeight<20) 
		{
			strTableStyle="style='position:relative;top:-1;'";
		}
		var strHTML = "<button id='"+ this.name+"' "+strDisabled+"  style='"+strStyleAtts+"'  onclick='this.swfc._onpressed();'><table cellspacing='0' cellpadding='0' border='0' align='center' "+strTableStyle+"><tr><td id='"+ this.name+"_menutext' style='"+this._get_font_style()+";text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:noWrap;'>"+ this.appearance.caption + "</td></tr></table></button>";

		
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.text = this.appearance.caption;
	this.element.swfc = this;
	this.element.style.textAlign='center';

}

//-- menu button
_swfc.prototype._draw_mnubutton = function (bDrawnAlready)
{

	if(!bDrawnAlready)
	{
		var iZindex = 1000 + (this.appearance.index-1+1);
		var strDisabled = (this.disabled)?"DISABLED":"";

		if(this.toolbarButtonStyle)
		{
			var intWidth = this.position.right - this.position.left;
			var intHeight = this.position.bottom - this.position.top -1;
			if(!isIE)
			{
				intHeight = intHeight - 3;
				this.position.top = this.position.top -1 + 2;
			}
			else
			{
				this.position.top = this.position.top - 1 + 2;
			}


			var strImagePath = _get_sw_application_image(this);
			var strImageHTML = (strImagePath=="")?"":"<td width='16px;'><img src='"+ strImagePath +"'></img></td>";
			var strStyleAtts =  this._get_border_style() + ";position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+ (this.position.top) +"px;left:"+this.position.left+"px;"
			var strHTML = "<div id='"+ this.name+"' "+strDisabled+" style='"+strStyleAtts+"' onclick='this.swfc.click();' onmouseover='this.swfc.hilite();' onmouseout='this.swfc.lolite();'><table height='"+(intHeight-2)+"' width='100%' border='0' cellspacing='0' cellpadding='0'><tr>"+strImageHTML+"<td id='"+ this.name+"_menutext' ' style='"+this._get_font_style()+";text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:noWrap;' align='middle' valign='middle' noWrap>"+ this.appearance.caption + "</td></tr></table></div>";
		}
		else
		{
			var intWidth = this.position.right - this.position.left;
			var intHeight = this.position.bottom - this.position.top;
			var iZindex = 400 + (this.appearance.index-1+1);

			var strStyleAtts = this._get_font_style() + ";position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;text-align:center;padding:0;"
			var strTableStyle = "";
			if(intHeight<20) 
			{
				strTableStyle="style='position:relative;top:-1;'";
			}
			var strHTML = "<button id='"+ this.name+"' "+strDisabled+"  style='"+strStyleAtts+"'  onclick='this.swfc.click(event);'><table cellspacing='0' cellpadding='0' border='0' align='center' "+strTableStyle+"><tr><td id='"+ this.name+"_menutext' style='"+this._get_font_style()+";text-align:center;padding-left:2px;overflow:hidden;text-overflow:ellipsis;white-space:noWrap;'>"+ this.appearance.caption + "</td><td class='mnu-button-btn'></td></tr></table></button>";

		}

		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.text = this.appearance.caption;
	this.element.swfc = this;

	//-- add control specific methods and properties
	_swfc_menubutton(this);
}

//-- draw password
_swfc.prototype._draw_password = function (bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 500 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"

		var strDisabled = (this.disabled)?"DISABLED":"";
		var strReadonly = (this.readOnly)?"readOnly":"";

		var strHTML = "<input type='password' "+strDisabled+" "+strReadonly+" id='"+ this.name+"' onblur='this.swfc._onblur(event);' onchange='this.swfc._onchange(event);' onmousedown='this.swfc._onmousedown(event);' style='"+strStyleAtts+"'>";
		
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;

	//-- init specific control properties or methods
	_swfc_textedit(this)
}


//-- draw textbox element
_swfc.prototype._draw_textedit = function (bDrawnAlready,boolLB)
{
	if(boolLB==undefined)boolLB=false;

	//-- get any defaul ddf settings
	this._ddf_settings();

	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 500 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + ";" + this._get_border_style() + ";position:absolute;resize:none;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;color:" + this.appearance.foregroundColor
		var strDisabled = (this.disabled)?"DISABLED":"";
		var strReadonly = (this.readOnly)?"readOnly":"";

		if(this.editUnlimitedText && !boolLB)
		{	
			var strHTML = "<textarea id='"+ this.name+"' "+strDisabled+" "+strReadonly+" onkeydown='return this.swfc._onkeydown(event);' onkeyup='return this.swfc._onkeyup(event);' onblur='this.swfc._onblur(event);' onchange='this.swfc._onchange(event);' onmousedown='return this.swfc._onmousedown(event);' style='"+strStyleAtts+"'></textarea>";
		}
		else
		{
			var strHTML = "<input type='text' id='"+ this.name+"'  "+strReadonly+" "+strDisabled+" onfocus='return this.swfc._onfocus(event);' onkeydown='return this.swfc._onkeydown(event);' onkeyup='return this.swfc._onkeyup(event);' onblur='this.swfc._onblur(event);' onchange='this.swfc._onchange(event);' onmousedown='return this.swfc._onmousedown(event);' style='"+strStyleAtts+"'>";
		}	
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;

	//-- if has defaulValue apply it - 13.08.2012 set default value for currency fields that have no binding
	if(this.textInputFormat=="Currency" && this.binding=="")
	{
		var val = "0";
		if(this.defaultValue!="")val = this.defaultValue;
		this._value(val,val,false);
	}
	else
	{
		if(this.defaultValue!="" && !boolLB && _formmode=="add")
		{
			//-- do not apply if has binding but binding but binding is invalid i.e. does not ref a bound table on form
			var boolSetDefault = true;
			if(this.binding!="")
			{
				//-- does binding table exist as a form table
				var arrBind = this.binding.split(".");
				if(document[arrBind[0]]==undefined)	boolSetDefault = false;
			}
			if(boolSetDefault)this._value(this.defaultValue,this.defaultValue,false);
		}
	}

	if(this.readOnly)
	{	
		this._readOnly(true);
	}

	//-- init specific control properties or methods
	_swfc_textedit(this)
}

//-- draw email textbox control
_swfc.prototype._draw_emailbox = function (bDrawnAlready)
{
	this._draw_textedit(bDrawnAlready);
	
	//-- add elipsis down icon
	//-- set dropdown icon
	if(!bDrawnAlready)
	{
		/*
		this.element.style.backgroundImage = "url(images/controls/elip.png)";
		this.element.style.backgroundPosition="right center";
		this.element.style.backgroundRepeat="no-repeat";
		*/
	}
}

//--
//-- apply any ddf settings for this control
_swfc.prototype._ddf_settings = function ()
{
	var arrBind = this.binding.split(".");
	var ddfSettings = null;
	if(pDDTABLES[arrBind[0]]!=undefined && pDDTABLES[arrBind[0]].columns[arrBind[1]]!=undefined)
	{
		ddfSettings = pDDTABLES[arrBind[0]].columns[arrBind[1]];
	}
	else
	{
		return;
	}

	//-- use ddf picklist options
	if(this.useDDPickList)
	{
		this.pickList = ddfSettings.pickOptions;
	}

	//-- use ddf default value
	//-- 24.11.2011 - default value is only applied to log call forms
	if(_formtype==_LCF && this.defaultValue=="" && ddfSettings.defaultValue!=""  && document._mastertable && arrBind[0]==document._mastertable._name)
	{
		//-- update 20.10.2011 - full client only sets default for fields that are bound to the MAIN table
		//-- so if bound table is master table then set default
		this.defaultValue = ddfSettings.defaultValue;
	}
}

//-- chart - not supported
_swfc.prototype._draw_singlesetchart = function (bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 600 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"

		var strHTML = "<div id='"+this.name+"' style='"+strStyleAtts+"'>charts are not supported</div>";
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}
	this._element();
	this.element.swfc = this;

	_swfc_chart(this);
}

function _swfc_chart(oSWFC)
{
	oSWFC.AddItem = _swfc_chart_AddItem;
	oSWFC.PlotChart = _swfc_chart_PlotChart;
	oSWFC.Reset = _swfc_chart_Reset
	oSWFC.DeleteItem = _swfc_chart_DeleteItem

}

function _swfc_chart_Reset()
{
}

function _swfc_chart_DeleteItem()
{
}

function _swfc_chart_PlotChart()
{
}

function _swfc_chart_AddItem()
{
}


//-- anchor
_swfc.prototype._draw_linklabel = function (bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 300 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"

		var strURL = _parse_context_vars(this.url);
		var strHTML = "<a id='"+this.name+"' href='"+strURL+"' style='"+strStyleAtts+"' target='new'>"+_parse_context_vars(this.appearance.caption)+"</a>";
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;
}

//-- draw picklist control
_swfc.prototype._draw_picklist = function (bDrawnAlready)
{
	//- -setup conrol properties
	this.picklistonly = this.comboNewValues;
	this.pickList = this.listItems;
	this._ddf_settings();

	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 500 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"

		//--
		//-- we have static items so draw them now
		var bLoaded = false;
		var strOptions = "";
		if(!this.mandatory)
		{
			strOptions =  "<tr><td  noWrap width='100%'>&nbsp;</td><td style='display:none;'></td></tr>";
		}

		if(this._etype!=FC_DBPICKLIST && this._etype!=FC_XMLPICKLIST)
		{
			if(this._etype==FC_IMGPICKLIST)
			{
				//-- draw out image list in picklist - value is numeric
				if(_img_picklists[this.imageList]!=undefined)
				{
					var strClass = _regexreplace(this.imageList," ","_");
					for(var x=0;x<_img_picklists[this.imageList];x++)
					{
						var ileft = x * 18;
						var strStylePos = "style='background-position: -"+ileft+"px 0;'"; 
						strOptions += "<tr ><td noWrap width='100%'><div class='"+strClass+"' "+strStylePos+"></div></td><td style='display:none;'>"+x+"</td></tr>";
					}
				}
				else
				{
					alert("An image listbox is using an image list ["+this.imageList+"] which is not supported by the Webclient. Please contact your Administrator.");
				}
			}
			else
			{
				//-- numeric or text
				//-- check if we have ddf default items to use
				var iInfo = new Array();
				var arrTextItems = new Array();
				var arrItems = this.pickList.split("|");
				this._modifiedPickList = ""; //-- if numeric picklist items but control is picklist then set item to text only store in temp var
				var aPLlen = arrItems.length;
				for(var x=0;x<aPLlen;x++)
				{
					if(arrItems[x]=="")continue;
					bLoaded = true;
					if(this._etype==FC_NUMPICKLIST)
					{
						iInfo = arrItems[x].split("^");
					
						//-- work around for calltasks - type and priority fields - which use numeric picklist control on string fields
						if(this.binding == "calltasks.priority" || this.binding == "calltasks.type")
						{
							strOptions += "<tr><td  noWrap width='100%'>"+iInfo[0]+"</td><td style='display:none;'>"+iInfo[0]+"</td></tr>";
							if(this.mandatory && this.defaultValue=="")this.defaultValue=iInfo[1];
						}
						else
						{
							strOptions += "<tr><td  noWrap width='100%'>"+iInfo[0]+"</td><td style='display:none;'>"+iInfo[1]+"</td></tr>";
							if(this.mandatory && this.defaultValue=="")this.defaultValue=iInfo[1];
						}
					}
					else
					{

						//-- if have ^ in them ignore
						var strVal = arrItems[x];
						if(arrItems[x].indexOf("^")>-1)
						{
							//-- num picklist being used in a text only picklist
							strVal = arrItems[x].split("^")[0];
							if(this._modifiedPickList!="")this._modifiedPickList+="|";
							this._modifiedPickList = strVal;

						}

						//-- check if text item already exists (some forms have issue where items have been defined twice)
						if(arrTextItems[strVal]==undefined)
						{
							
							if(this.mandatory && this.defaultValue=="")this.defaultValue=strVal;
							strOptions += "<tr><td noWrap width='100%'>"+strVal+"</td><td style='display:none;'>"+strVal+"</td></tr>";
							arrTextItems[strVal] = true;
						}

					}

					if(this._modifiedPickList!="") this.pickList = this._modifiedPickList;
					this._originalPicklist = this.pickList;
				}
			}
		}//-- eof type not db or xmlpicklist

		//-- drawlistbox - note we do nto tab to the listbox
		var strDisabled = (this.disabled)?"DISABLED":"";

		//-- create div holder and table 
		var strHTML = "<div id='_listboxdiv_" + this.name + "' class='picklist_div'  onmouseover='this.swfc._hilite(event);' onmouseout='this.swfc._lolite(event);' onmousedown='this.swfc._cancelevent(event);' onclick='this.swfc._selectitem(event);'><table border='0' cellpadding='0' cellspacing='0' style='table-layout:fixed;' width='100%'>"+strOptions+"</table></div>";
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}
	else
	{
		if(this._etype!=FC_DBPICKLIST && this._etype!=FC_XMLPICKLIST)bLoaded=true;
	}

	this._dropdiv = this.htmldocument.getElementById("_listboxdiv_" + this.name);
	this._htmltable = this._dropdiv.childNodes[0];

	this._draw_textedit(bDrawnAlready,true);

	//-- picklist icon
	if(!bDrawnAlready)
	{
		this.element.className = 'picklist_control';
		//- -check if elipsis is shown
		if(this.dropdownButtonType=="1")
		{
			this.element.style.backgroundImage="url(images/controls/elip.png)";
		}
	}

	//-- do not allow them to drop down or enter text
	if(this.readOnly)
	{
		this._readOnly(true);
	}

	//--can drop down but cannot edit text element
	if(this.picklistonly)
	{
		this.element.setAttribute("readOnly",true);
	}

	//-- adjust text input width so can see drop down
	_swfc_listbox(this);
	
	this._htmltable.swfc = this;
	this._dropdiv.swfc = this;
	this._dataloaded = bLoaded;

	this.element.swfc = this;

	//-- check default
	if(this.binding=="")
	{
		if(this._etype==FC_NUMPICKLIST)
		{
			if(this.defaultValue!="")
			{
				this._value(this.defaultValue)
			}
			else
			{
				this._value(0);
			}
		}
		else
		{
			if(this.defaultValue!="")this._value(this.defaultValue)
		}
	}
}

_swfc.prototype._draw_datecontrol = function (bDrawnAlready)
{

	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 500 + (this.appearance.index-1+1);

		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"
		var strDisabled = (this.disabled)?"DISABLED":"";
		var strReadonly = (this.readOnly)?"readOnly":"";

		var strHTML = "<input type='text' id='"+ this.name+"'  "+strReadonly+" "+strDisabled+" onclick='this.swfc._trigger_dropdown(event, document);'	onblur='this.swfc._onblur(event);' onchange='this.swfc._onchange(event);' onmousedown='this.swfc._onmousedown(event);' style='"+strStyleAtts+"'>";
		insertBeforeEnd(this.htmldocument.body,strHTML);
	}

	this._element();
	this.element.swfc = this;
	
	if(!bDrawnAlready)this.element.className = 'datetime_control';
	_swfc_datebox(this); //-- date box methods

	//-- string date controls are readonly on log call forms
	if(_formtype==_LCF)
	{
		//-- if bound to related table then disable
		if(this.dataRef.indexOf("opencall.")==-1)this._enable(false);
	}
}

//-- draw form flag control
_swfc.prototype._draw_formflags = function (bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 500 + (this.appearance.index-1+1);
		
		if(app.isIE)
		{
			this.position.top = this.position.top - 1 + 3;
		}
		else
		{
			this.position.top = this.position.top - 2;
			this.position.left = this.position.left - 1+5;
		}
		
		var strStyleAtts = this._get_font_style() + this._get_border_style() + "position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+ this.position.top +"px;left:"+this.position.left+"px;"
	
		var strDisabled = (this.disabled)?"DISABLED":"";
		var strReadonly = (this.readOnly)?"DISABLED":"";

		//var strHTML = "<div id='" + this.name + "' "+strDisabled+" "+strReadonly+" onclick='this.swfc._setflagvalue(event,document)' style='"+strStyleAtts+";overflow:hidden;'><table border='0' cellspacing='0' cellpadding='0'>"
		var arrHTML = new Array();
		arrHTML.push("<div id='" + this.name + "' "+strDisabled+" "+strReadonly+" onclick='this.swfc._setflagvalue(event,document)' style='"+strStyleAtts+";overflow:hidden;'><table border='0' cellspacing='0' cellpadding='1'>");
		var arrItems = this.flagItems.split("|");
		var aIlen = arrItems.length-1;
		for(var x=0;x<aIlen;x++)
		{
			var arrItemInfo = arrItems[x].split("^");
			//if(app.isIE)
			//{
				arrHTML.push("<tr><td style='padding-left:5px'><image src='images/controls/cb.png' "+strReadonly+"  id='"+this.name + "_" + x +"' name='"+this.name + "_" + x +"' bitvalue='"+ arrItemInfo[1] +"' checked='false'></td><td noWrap valign='middle'><label id='lbl_"+this.name + "_"+ x +"' "+strDisabled+"  style='font-family:Trebuchet MS;font-size:8pt;padding-left:4px;'>"+arrItemInfo[0]+"</label></td></tr>");
			//}
			//else
			//{
			//	arrHTML.push("<tr><td style='padding-left:5px'><image src='images/controls/cb.png' "+strReadonly+"  id='"+this.name + "_" + x +"' name='"+this.name + "_" + x +"' bitvalue='"+ arrItemInfo[1] +"' checked='false'></td><td noWrap valign='top'>&nbsp;<label id='lbl_"+this.name + "_"+ x +"' "+strDisabled+"  style='font-family:Trebuchet MS;font-size:8pt;position:relative;top:-2;'>"+arrItemInfo[0]+"</label></td></tr>");
			//}
		}
		arrHTML.push("</table></div>");
		insertBeforeEnd(this.htmldocument.body,arrHTML.join(""));
	}

	this._element();
	this.element.swfc = this;

	if(this.readOnly) this._readOnly(this.readOnly);
	if(this.disabled) this.enable = false;
	//-- init any specific methods
	_swfc_formflag(this);

}

//-- draw sqltable control
_swfc.prototype._draw_sqltable = function (bDrawnAlready)
{
	app.debugstart(this.name+"._draw_sqltable:","FORM CONTROLS");
	var xntbt = app.xmlNodeTextByTag;
	if(!bDrawnAlready)
	{
		app.debugstart(this.name+"._draw_sqltable:processcolumns","FORM CONTROLS");
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 1000 + (this.appearance.index-1+1);
		var strStyleAtts = this._get_font_style() + this._get_border_style() + ";position:absolute;background-color:"+this.appearance.backgroundColor+";z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+this.position.top+"px;left:"+this.position.left+"px;"

		//-- dont show header
		var strHeaderDisplay = (this.showHeader)?"":"style='height:0px;visibility:hidden;'";


		//-- draw table
		var strColumnHeadings = "<table cellspacing='0' cellpadding='0' border='0' "+strHeaderDisplay+"><tr>";
		var arrColHeadings = new Array();

		arrColHeadings.push("<table cellspacing='0' cellpadding='0' border='0' "+strHeaderDisplay+"><tr>");
		if(this._jsoncols)
		{
			var strText ="";
			var strcol
			var intWidth=0;
			var xmlDBCol=null;
			var	strStyle = "";
			var	bAllowResize = "";
			var	bAllowSort = "";

			var arrCol = this._jsoncols.controlInfo;
			var aClen = arrCol.length;
			for(var x=0;x<aClen;x++)
			{
				if(arrCol[x]==undefined || arrCol[x].width==undefined)continue;
			
				strText = (arrCol[x].name)?arrCol[x].name:"";
				intWidth= arrCol[x].width;
				strCol = (arrCol[x].properties)?arrCol[x].properties.column:"";
				if(strText=="" && strCol!="")
				{
					var strColText= app._application_labels[this.table+"."+ strCol];
					//-- work around for old itsm apps where updatedb colnames have not been set
					if(this.table=="updatedb" && strColText.toLowerCase() == strCol)
					{
						//-- hardcode value
						switch(strCol)
						{
							case "aaid":
								strColText = "Analyst ID";
								break;
							case "udindex":
								strColText = "#";
								break;
							case "updatetimex":
								strColText = "Date / Time";
								break;
						}
					}
					strText = strColText;				
				}
				
				//-- set flags
				var jsonFlags = arrCol[x].flags;
				if(jsonFlags==undefined)
				{
					//-- something seriously wrong here as a column should always have flags 
					strStyle = "";
					bAllowResize = "true";
					bAllowSort = "true";
				}
				else
				{				
					strStyle = jsonFlags.hidden=="true"?"style='display:none;'":"";
					bAllowSort=jsonFlags.allowSort!="true"?false:true;
					bAllowResize=jsonFlags.allowResize!="true"?false:true;
				}
				
				arrColHeadings.push("<td class='headertd' " + strStyle + " allowsort='"+bAllowSort+"'  allowresize='"+bAllowResize+"' width='"+intWidth+"px' style='width:"+intWidth+"px;white-space:noWrap;' dbname='"+strCol+"' noWrap "+strHeaderDisplay+"><div class='tdvalue' headerpos='"+x+"'  style='width:"+intWidth+"px;white-space:noWrap;' "+strHeaderDisplay+">"+ strText + "</div></td>");	
			}
			arrColHeadings.push("<td style='display:none;'><div></div></td></tr>"); //-- last cell is to compensate for scrollbars
		}
		arrColHeadings.push("</table>");
		app.debugend(this.name+"._draw_sqltable:processcolumns","FORM CONTROLS");

		app.debugstart(this.name+"._draw_sqltable:drawcontents","FORM CONTROLS");
		var arrHTML = new Array();
		arrHTML.push("<div id='"+ this.name+"' style='"+strStyleAtts+";overflow:hidden;display:none;'>");
		arrHTML.push("<div id='"+ this.name+"_pager' class='sqltable-pager'><div class='sqltable-pager-ll' onclick='this.parentNode.parentNode.swfc._pagestart(this,event);'>&nbsp;</div><div class='sqltable-pager-l' onclick='this.parentNode.parentNode.swfc._pageleft(this,event);'>&nbsp;</div><div class='sqltable-pager-input'>Page <input id='"+ this.name+"_pageinput' onchange='this.parentNode.parentNode.parentNode.swfc._setpageposition(this);' type='text' value='1'/> of <span id='"+ this.name+"_pagespan' >#</span></div><div id='"+ this.name+"_pagerR' onclick='this.parentNode.parentNode.swfc._pageright(this,event);' class='sqltable-pager-r'>&nbsp;</div><div onclick='this.parentNode.parentNode.swfc._pageend(this,event);' class='sqltable-pager-rr'>&nbsp;</div></div>");
		arrHTML.push("<div id='"+ this.name+"_header' onmousedown='this.parentNode.swfc._start_headerresize(event,document);' onmouseup='this.parentNode.swfc._stop_headerresize(event,document);' onclick='this.parentNode.swfc._sortcolumn(event,document);' onmousemove='this.parentNode.swfc._track_headercursor(event,document);' class='sqltable-header' "+strHeaderDisplay+">"+arrColHeadings.join("")+"</div>");
		arrHTML.push("<div id='"+ this.name+"_data'  class='sqltable-data' onselectstart='return false;' onscroll='this.parentNode.swfc._scroll();'></div></div>");
		insertBeforeEnd(this.htmldocument.body,arrHTML.join(""));
		
		app.debugend(this.name+"._draw_sqltable:drawcontents","FORM CONTROLS");
	
	}
	
	this._element();
	this.element.swfc = this;
	app.disableSelection(this.element);
	//-- init any specific methods
	_swfc_sqltable(this);
	if(!bDrawnAlready)
	{
		this._resize_data_area();
	}

	app.debugend(this.name+"._draw_sqltable:","FORM CONTROLS");
}

//-- draw filelist
_swfc.prototype._draw_filetable = function (bDrawnAlready)
{
	this._draw_sqltable(bDrawnAlready);

	//-- init specific properties and methods for this control
	_swfc_filetable(this);
	
	if(!bDrawnAlready)this._resize_data_area();

	//--
	//-- create iframe to hold file list control form - so we can select file and submit without using file browse button
	if(!bDrawnAlready)
	{
		var strIframeHTML = "<iframe id='"+this.name+"_iframe_fileuploader' name='"+this.name+"_iframe_fileuploader' style='display:none;'></iframe>";
		app.insertBeforeEnd(this.htmldocument.body,strIframeHTML);
	}
}



//-- draw tab control
_swfc.prototype._draw_tabcontrol = function (bDrawnAlready)
{
	//-- init any specific methods
	_swfc_tabcontrol(this);
	this._draw(bDrawnAlready);
}


//-- get border css string for control
_swfc.prototype._get_border_style = function()
{
	if(this._etype==FC_CAPTIONBAR)
	{
		strStyle="border:"+this.hasBorder+"px solid " + this.borderColor;
	}
	else if(this._etype==FC_SEARCHFIELD)
	{
		strStyle="border:1px solid " + this.borderColor;
	}
	else
	{
		switch(this.appearance.borderStyle)
		{
			case "None":
				strStyle="border:0px solid #ffffff;";
				break;
			case "3-D Sunken":
				strStyle = "";
				break;
			case "Rectangle":
				strStyle="border:1px solid "  + this.borderColor+";";
				break;
			default:
				strStyle="border-width:0px;";
		}
	}

	if(this.controlinfo.mouseOverCursor=="Hand") strStyle = strStyle + ";cursor:hand;";

	return strStyle;
}

//-- get control css font style
_swfc.prototype._get_font_style = function()
{

	var strStyle = ";text-align:"+ this.appearance.alignment.toLowerCase();
	//-- if label or caption 
	if(this._etype==FC_CAPTIONBAR || this._etype==FC_LABEL || this._etype==FC_FIELDLABEL)
	{
		strStyle += ";font-family:" + this.font.name.replace("(","").replace(")","");
	}
	else
	{
		strStyle += ";font-family:sans-serif";
	}

	strStyle += ";font-size:"+ this.font.size + "pt;";
	strStyle += ";font-underline:"+ this.font.underline;
	strStyle += ";color:"+ this.appearance.foregroundColor;



	if(_cBoolean(this.font.bold))
	{
		strStyle += ";font-weight:bold;"
	}

	strStyle += ";";
	return strStyle;
}

//-- cancel event
_swfc.prototype._cancelevent = function (oE)
{
	app.stopEvent(oE);
	return false;
}

//-- resize control
_swfc.prototype._resize = function ()
{
	if(this.tabInvisible || !this.visible) return;
	if(this._form._width==0)return;

	var iWidthAdjust = this._form._width - this._form._origwidth;
	var iHeightAdjust = this._form._height - this._form._origheight;

	var intWidth = this.element.offsetWidth; 
	var intLeft = this.element.offsetLeft; 
	var intTop = this.element.offsetTop;
	var intHeight =this.element.offsetHeight;

	if(this.position.origwidth==0)this._store_position();

	//-- scale left and width
	if(this.scaling.left > 0)
	{
		var intAddLeft = Math.round((iWidthAdjust / 100) * this.scaling.left);
		if(intAddLeft<1)
		{
			intLeft = this.position.origleft;
		}
		else
		{
			intLeft = this.position.origleft + (intAddLeft-1);
		}
	}

	if(this.scaling.right > 0)
	{
		var intAddWidth = Math.round((iWidthAdjust / 100) * (this.scaling.right - this.scaling.left));
		if(intAddWidth<1)
		{

			intWidth = this.position.origwidth;
		}
		else
		{
			intWidth = this.position.origwidth + (intAddWidth-2);
		}
	}

	//-- scale top and height
	if(this.scaling.top > 0)
	{
		var intAddtop = Math.round((iHeightAdjust / 100) * this.scaling.top);
		if(intAddtop<1)
		{
			intTop = this.position.origtop;
		}
		else
		{
			intTop = this.position.origtop + intAddtop;
		}
	}
	if(this.scaling.bottom > 0)
	{
		var intAddHeight = Math.round((iHeightAdjust / 100) * (this.scaling.bottom - this.scaling.top));
		if(intAddHeight<1)
		{
			intHeight = this.position.origheight;
		}
		else
		{
			intHeight = this.position.origheight + intAddHeight;
		}
	}

	//-- for a tab control align inner tab display erea
	if(this._align_innerelements)this._align_innerelements(intWidth, intHeight);

	var boolAdjustMand = false;

	//-- set positioning if changed
	if(!isNaN(intLeft) && intLeft!=this.element.offsetLeft) 
	{
		boolAdjustMand = true;
		this.element.style.left = intLeft;
	}
	if(!isNaN(intWidth) && intWidth!=this.element.offsetWidth) this.element.style.width = intWidth;
	if(!isNaN(intHeight) && intHeight!=this.element.offsetHeight) this.element.style.height = intHeight;
	if(!isNaN(intTop) && intTop!=this.element.offsetTop) 
	{
		boolAdjustMand = true;
		this.element.style.top = intTop;
	}

	if(this.mandatory)
	{
		this._showhide_mandatory_icon(!this.tabInvisible);
	}

	//-- if a table adjust it and align
	if(this._etype==FC_SQLLIST)
	{
		this._resize_data_area();
	}
	else if(this._etype==FC_IMGPICKLIST)
	{
		//-- move the listbox div to be aligned with control
		this._set_picklist_img();  
	}

	//-- if a list and it is open then hide when resizing
	if(this._form._arr_open_lists[this.name])
	{
		//-- hide picklist
		this._form._arr_open_lists[this.name]=false;
		this._dropped = false;
		this._dropdiv.style.display='none';
	}

	//-- if a text area check if the control has a wysiwyg editor attached
	if(this.element.tagName=="TEXTAREA")
	{
		var divWysiwyg  = this.htmldocument.getElementById("wysiwyg_div_" + this.name);
		if(divWysiwyg!=null)
		{
			divWysiwyg.style.top= intTop;
			divWysiwyg.style.left= intLeft;
			divWysiwyg.style.width= intWidth;	
			divWysiwyg.style.height= intHeight;
		}
	}

}


//-- create and show mandatory icon, or destroy it
_swfc.prototype._showhide_mandatory_icon = function (bOverride)
{
	
	//RF - 19/07/2017 - PM00147614 - Added support for both the FC_MINUTETIME & FC_SECONDTIME to show the mandatory icon
	if(this._etype!=FC_TEXTEDIT && this._etype!=FC_DATETIME && this._etype!=FC_PICKLIST && this._etype!=FC_DBPICKLIST && this._etype!=FC_XMLPICKLIST 
		&&	this._etype!=FC_NUMPICKLIST && this._etype!=FC_MINUTETIME && this._etype!=FC_SECONDTIME)return true;


	var bShow = (bOverride==undefined)?this.mandatory:bOverride;

	if(bShow)
	{
		this._mandatoryicon = this.htmldocument.getElementById(this.name + '_mand');
		//-- create and show
		if(this._mandatoryicon==null)
		{
			var strHTML = "<div id='"+ this.name +"_mand' class='mandatory'></div>";
			insertBeforeEnd(this.htmldocument.body,strHTML);
			this._mandatoryicon = this.htmldocument.getElementById(this.name + '_mand');
		}

		this._mandatoryicon.style.top = this.element.offsetTop -1 + 2;
		this._mandatoryicon.style.left = this.element.offsetLeft -1 + 2;
		this._mandatoryicon.style.zIndex = this.element.style.zIndex + 2;
		if(this._mandatoryicon.style.zIndex == this.element.style.zIndex)
		{
			this.element.style.zIndex = this.element.style.zIndex - 1;
		}
		this._mandatoryicon.style.display='block';
	}
	else
	{
		//-- hide
		if(this._mandatoryicon!=null)this._mandatoryicon.style.display='none';
	}
}


_swfc.prototype._set_hint_text = function (strUseHint)
{
	var varHintValue = this.hintText;
	if(strUseHint!=undefined && varHintValue=="")varHintValue = strUseHint;

	if(this.value=="" && varHintValue!="")
	{
		//-- set text colour
		if(this._originaltextcolor=="")	this._originaltextcolor = this.element.style.color;
		this.element.style.color='#8f8f8f';
		this.element.value = varHintValue;  
		this._bHintText = true;
	}
	else
	{
		
		this._bHintText = false;
		if(this._originaltextcolor!="")	this.element.style.color = this._originaltextcolor;
	}
}


//-- public methods

//-- return binding or set att if value passed in
_swfc.prototype._binding = function(strBinding)
{
	if(strBinding==undefined) return this.binding;

	this.binding = strBinding;
}


//-- return type or set att if value passed in
_swfc.prototype._type = function (strType)
{
	if(strType==undefined) return this._etype;

	this._etype = strType;
}

//-- return tab group or set att if value passed in
_swfc.prototype._group = function (strGroup)
{
	if(strGroup==undefined) return this.group;

	this.group = strGroup;
}


//-- return t/f is mandatory or set att if value passed in
_swfc.prototype._mandatory = function (bMandatory)
{
	if(bMandatory==undefined) 
	{
		return this.mandatory;
	}

	this.mandatory = bMandatory;

	this._showhide_mandatory_icon();
}


_swfc.prototype._onkeydown = function (oEv)
{
	var iKeyCode = app.getKeyCode(oEv);

	//-- if lcf and binding is not on opencall call document resolve record if user presses enter
	if(app.isIE && this.element.value!="" && _formtype==_LCF && this.binding!="" && this.binding.indexOf("opencall.")==-1 && this.binding.indexOf("updatedb.")==-1)
	{
		if(iKeyCode==13)
		{
			this.element.blur(oEv);
		}
		else if(app.isSafari && (iKeyCode==13 || iKeyCode==9))
		{
			//-- on resolve fields do not allow tab or enter key in safari as workaround for safari bug where it logs out if you press tab or enter
			return app.stopEvent(oEv);	
		}

	}

	//-- list box key down
	if(this._onkeydrop && (iKeyCode==40 || iKeyCode==38))
	{
		this._onkeydrop(oEv,iKeyCode)
	}

	if((this.picklistonly || this._etype==FC_IMGPICKLIST) && iKeyCode!=9) return app.stopEvent(oEv);

}

_swfc.prototype._onkeyup = function (oEv)
{
	var iKeyCode = app.getKeyCode(oEv);
	this._executejsevent("OnKeyPressed", this,this.element.value)
	return true;
}


//-- 
_swfc.prototype._onblur = function (oEv)
{
	document._current_focused_input = false;
	this._set_element_display(true);
}

//-- trap things like profile code and res code fields fields
_swfc.prototype._onfocus = function (oEv)
{
	var origContext = this;
	origContext._form._close_open_lists(origContext.name);
	if(origContext.readOnly || origContext.picklistonly || origContext._etype==FC_IMGPICKLIST)
	{
		return app.stopEvent(oEv);
	}

	//-- check if hint text is on - if so clear display and set text colour back to normal
	origContext._display("-wc-hide-hint-");

	if(origContext.dataRef!="")
	{
		if(origContext.dataRef.toLowerCase()=="opencall.probcode")
		{
			origContext.element.blur();

			//-- safari bug calls event twice so check when function was last called - if less than 500 millseconds then cancel
			if(app.isSafari)
			{
				if(origContext._probcodelastcalledtime==undefined)
				{
					origContext._probcodelastcalledtime = new Date();
				}
				else
				{
					var tDate = new Date();
					var elapsedTime = tDate - origContext._probcodelastcalledtime; //-- milliseconds
					if(elapsedTime<500) 
					{
						return false;
					}
				}
			}

		
			//-- check if we want to return false or set filter
			var strFilter = origContext._form._swdoc._profilefilter;
			if(origContext._form._swdoc._OnSetProfileCodeFilter)
			{
				//-- log call supports this
				strFilter = origContext._form._swdoc._OnSetProfileCodeFilter(strFilter);
			}

			//-- supported by call detail
			if(origContext._form._swdoc._OnChangeCallProfile)
			{
				if(!lsession.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCHANGECALLPROFILECODE,true)) 
				{
					return;
				}

				if(origContext._form._swdoc._OnChangeCallProfile()!=true) 
				{
					return;
				}
			}

			var strType = _formtype;
			app._profilecodeselector(strType,strFilter, origContext._value(), function(oForm)
			{
				if(oForm.selected)
				{
					//-- set value
					origContext._value(oForm.code,oForm.codeDescription);
					if(strType==_CDF)
					{
						//-- call helpdesk session to update profile code
						var con = new HelpdeskSession();
						var res = con.SetProfileCode(origContext._form._swdoc.opencall.callref,oForm.code);
						if(res==false)
						{
							alert("Failed to update the profile code for this request. Please contact your Administrator.");
						}
						else
						{
							if(origContext._form._swdoc._OnDataChanged)origContext._form._swdoc._OnDataChanged();
						}
					}
					else if(strType==_LCF)
					{
						var bchange = false;
						//-- set SLA
						if(oForm.sla!="")
						{
							bchange = true;
							var strOldPriorityValue = top.opencall.priority;
							origContext._form._swdoc.opencall.priority = oForm.sla;

							//-- call onrecordvalue changed if priority has changed
							if(strOldPriorityValue != oForm.sla)origContext._form._swdoc._OnRecordValueChanged('opencall', 'priority', oForm.sla, strOldPriorityValue);

							document._form.probcodesla = oForm.sla;

							//-- do we have additional sla info - do not use as full client does not support this
							//if(oForm._additional_slaid!="")
							//{
								
							//	_swdoc['opencall']['itsm_sladef'] = oForm._additional_slaid;
							//	_swdoc['opencall']['itsm_slaname'] = oForm._additional_slaname;
							//}
						}
						else
						{
							document._form.probcodesla = oForm.profilesla;
						}

						//-- description
						if(oForm.description!="")
						{
							var strOldUpdateText = origContext._form._swdoc.updatedb.updatetxt;
							if(origContext._form._swdoc.updatedb.updatetxt!="")
							{
								if(confirm("There is already some description text on this form. Do you want to append the selected profile text?\n\nOK=Append\nCancel=Overwrite"))
								{
									origContext._form._swdoc.updatedb.updatetxt +="\n\n" + oForm.description;
								}
								else
								{
									origContext._form._swdoc.updatedb.updatetxt = oForm.description;
								}
							}
							else
							{
									origContext._form._swdoc.updatedb.updatetxt = oForm.description;
							}

							//-- call onrecordvalue changed if updatetxt has changed
							if(strOldUpdateText != origContext._form._swdoc.updatedb.updatetxt)origContext._form._swdoc._OnRecordValueChanged('updatedb', 'updatetxt', origContext._form._swdoc.updatedb.updatetxt,strOldUpdateText);


							bchange = true;
						}
						
						//-- have data change so update form
						if(bchange)
						{
							origContext._form._swdoc.UpdateFormFromData("opencall",false);
							origContext._form._swdoc.UpdateFormFromData("updatedb",false);
						}


						//-- run operator script
						if(oForm.operatorScriptId>0)
						{
							bchange = false;
							app._operatorscript(oForm.operatorScriptId, window,function(oOp)
							{
								if(oOp)
								{
									for(strBinding in oOp._answers)
									{
										var arrBinding = strBinding.split(".");
										if(origContext._form._swdoc[arrBinding[0]][arrBinding[1]]!="")
										{
											origContext._form._swdoc[arrBinding[0]][arrBinding[1]] += "\n" + oOp._answers[strBinding];
										}
										else
										{
											origContext._form._swdoc[arrBinding[0]][arrBinding[1]] = oOp._answers[strBinding];
										}
										bchange=true;
									}

									if(bchange)origContext._form._swdoc.UpdateFormFromData(undefined,false);
								}
							});
						}
					}
				}
			}, null, window); //-- end of _profilecodeselector(

			//- -record last time called - as safari bug calls event twice
			if(app.isSafari)origContext._probcodelastcalledtime = new Date();

			return false;
		}
		else if(origContext.dataRef.toLowerCase()=="opencall.fixcode")
		{
			var strType = _formtype;
			app._profilecodeselector("fix","", origContext._value(), function(oForm)
			{
				if(oForm.selected)origContext._value(oForm.code,oForm.codeDescription);
				origContext.element.blur();
			}, null, window); //-- end of _profilecodeselector(
			return false;
		}
	}
	
	return true;
}


//-- return t/f is readonly or set att if value passed in
_swfc.prototype._readOnly = function (bReadOnly)
{
	if(bReadOnly==undefined) return this.readOnly;

	this.readOnly = bReadOnly;

	if(bReadOnly)
	{
		this.element.setAttribute('readOnly', bReadOnly); 
		if(this._swlb)	this._swlb.setAttribute('disabled', bReadOnly); 
	}
	else
	{
		this.element.removeAttribute('readOnly'); 
		if(this._swlb)	this._swlb.setAttribute('disabled', bReadOnly); 
	}

}

//-- return t/f is enabled or set att if value passed in
_swfc.prototype._enable = function (bEnable)
{
	if(bEnable==undefined) return !this.disabled;

	this.disabled = (!bEnable);
	this.enable = bEnable;

	//-- if bound to related table and in CDF do not allow enable
	if(bEnable && _formtype==_CDF && !this._form._isaltforn && this.dataRef!="")
	{
		var arrRef = this.dataRef.split(".");
		if(arrRef[0]!=document._mastertable._name) 
		{
			var boolDisable = (document._exttable && arrRef[0]==document._exttable._name)?false:true;
			if(boolDisable) return true;
		}
	}

	//-- set html element to read only
	this.element.disabled=this.disabled;
	this.element.setAttribute("disabled",this.disabled);
	if(!this.disabled)this.element.removeAttribute('disabled'); 

	if(this._is_an_input_field())
	{
		if(!bEnable)
		{
			this.element.style.backgroundColor = this.disabledBackgroundColor;
		}
		else
		{
			this.element.style.backgroundColor = this.appearance.backgroundColor;
		}
	}
}

//-- set item to visible or not based on parent tab item
_swfc.prototype._tabvisible = function (bVisible)
{
	if(bVisible==undefined) return !this.tabInvisible;

	this.tabInvisible = (!bVisible);

	//-- set zindex to make sure higher than associated tab control
	if(this._tabcontrol!=null)
	{
		//-- if showing elemen on tab control and he tab control zindex is greater then change 
		var intParentIndex = parseInt(this._tabcontrol.element.style.zIndex);
		var intMyIndex = parseInt(this.element.style.zIndex);
		if(intMyIndex < intParentIndex)
		{
			this.element.style.zIndex = intParentIndex + intMyIndex; //-- set element to be 1 index highter than tab item
		}
	}
	
	//-- if ele is not visible then do not process
	if(!this.visible) return;

	//-- set html element to visible or hidden
	this.element.style.visibility = (bVisible)?"visible":"hidden";
	this.element.style.display = (bVisible)?"block":"none"; //-- so dont tab into it


	if(this._etype==FC_IMGPICKLIST)
	{
		//-- move the listbox div to be aligned with control
		if(this._selected_img!=null)
		{
			this._selected_img.style.display = (bVisible)?"":"none";
		}
	}
	else if(this._etype==FC_SQLLIST && this._NotLoadedAsInvisible && bVisible)
	{
		this._fetchdata();
	}


	this._resize(bVisible);

	//-- if mandatory hide icon
	if(this.mandatory)
	{
		//-- show or hide mandatory icon
		this._showhide_mandatory_icon(bVisible);
	}

	//-- if this is a tab control then
	if(this._etype==FC_TABCONTROL)
	{
		if(bVisible)
		{
			this._show();
		}
		else
		{
			this._hide();
		}		
	}
	
	//-- tables
	if(bVisible && this._align!=undefined)
	{
		this._align();
	}
}

_swfc.prototype.isXmlField=function()
{
	if(this.binding.indexOf("x.")==0)return true;

	return false;
}

//-- return t/f is visible or set att if value passed in
_swfc.prototype._visible = function (bVisible)
{
	if(bVisible==undefined) return this.visible;

	//-- to invisible if true and on active tab
	if(this.tabInvisible) this.invisible = (!bVisible);

	this.visible = bVisible;

	if(this._etype==FC_IMGPICKLIST)
	{
		//-- move the listbox div to be aligned with control
		if(this._selected_img!=null)
		{
			this._selected_img.style.display = (this.visible)?"":"none";
		}
	}


	//-- if element is on non active tab item keep element hidden
	if(this.tabInvisible)
	{
		//-- set html element to visible or hidden
		this.element.style.visibility = "hidden";
		this.element.style.display = "none"; //-- so dont tab into it

		//-- if mandatory hide icon
		if(this.mandatory)
		{
			//-- show or hide mandatory icon
			this._showhide_mandatory_icon(false);
		}


		if(this._etype==FC_TABCONTROL)this._hide();

	}
	else
	{
		//-- set html element to visible or hidden
		this.element.style.visibility = (bVisible)?"visible":"hidden";
		this.element.style.display = (bVisible)?"block":"none"; //-- so dont tab into it

		//-- if mandatory hide icon
		if(this.mandatory)
		{
			//-- show or hide mandatory icon
			this._showhide_mandatory_icon(bVisible);
		}

		if(bVisible)
		{
			if(this._etype==FC_TABCONTROL)this._show();

			this._resize();

			//-- if table then load data
			if(this._etype==FC_SQLLIST && this._NotLoadedAsInvisible)
			{
				this._fetchdata();
			}
		}
		else
		{
			if(this._etype==FC_TABCONTROL)this._hide();
		}
	}
}

_swfc.prototype._image = function (strURI)
{
	if(strURI==undefined) return this.image;

	//-- value has not changed so exit
	if(strURI==this.image) return;

	this.image = strURI;
	this.element.childNodes[0].src = _parse_context_vars(strURI);
}

//-- handle text edit value change
_swfc.prototype._onchange = function(oEv)
{
	//-- set value
	this._value(this.element.value,this.element.value,false);
}

_swfc.prototype._onmousedown = function(oEv)
{
	if(this.readOnly)
	{
		//-- cancel bubble
		this._cancelevent(oEv);
		return false;
	}

	//-- call form defined function if exists
	if(_mousebtn(oEv)==1)
	{
		var strFunc = "OnLeftClick";
	}
	else
	{	
		var strFunc = "OnRightClick";
	}

	return this._executejsevent(strFunc);
}


_swfc.prototype._color = function (strColor)
{
	if(strColor==undefined)return this.color;
	this.color = strColor;
	if(this._is_an_input_field())this.element.style.color = strColor;
}

_swfc.prototype._bgcolor = function (strBgColor)
{
	if(strBgColor==undefined)return this.bgcolor;
	this.bgcolor = strBgColor;

	if(this._is_an_input_field())this.element.style.backgroundColor = strBgColor;
}


//-- return or set value - overridden per control type
_swfc.prototype._value = function (strValue , strFormattedValue, bFromData, bFromUser)
{

	if(this._etype==FC_LABEL || this._etype==FC_FIELDLABEL)
	{
		return this.text;
	}

	
	if(strValue==undefined) return this.value;

	//-- value has not changed and element has had any default value set 
	if(strValue==this.value && this._value_initialised) 
	{
		return;
	}

	//-- first time being set and being set to blank so set default value
	if(!this._value_initialised && strValue=="")
	{
		strValue = this.defaultValue;
		strFormattedValue = strValue;
	}
	this._value_initialised=true;
	if(bFromUser==undefined)bFromUser=false;
	//-- eof setting initial default


	if(this._etype==FC_MINUTETIME)
	{
		strFormattedValue = "";
		//-- 88668 - minute fields now actually stored in minutes where as before was stored in seconds.
		//-- _getseconds_from_uservalue(strValue,bFromData);
		strValue = _getminutes_from_uservalue(strValue);
		
	}
	else if(this._etype==FC_SECONDTIME)
	{

		strFormattedValue = "";
		strValue = _getseconds_from_uservalue(strValue,bFromData);
	}
	else if(this.textInputFormat=="Currency")
	{
		//-- 13.09.2012 - 89518 - fixed value and formatting based on if value being set from user value change or swjs change (bFromUser)
		var strDBValue = _get_sw_dbcurrency_from_value(strValue,false,bFromData,bFromUser);
		strFormattedValue = _get_sw_dbcurrency_from_value(strValue,true,bFromData,bFromUser);
		strValue = strDBValue;
	}


	this.value = strValue;
	this.text = strValue;

	//- -if setting special fields make sure formatted value gets set properly
	if(this.binding=='opencall.probcode' && strFormattedValue==strValue)strFormattedValue="";
	else if(this.binding=='opencall.fixcode' && strFormattedValue==strValue)strFormattedValue="";

	//-- set actual formatted display (if not passed in call function to set it)
	if(strFormattedValue==undefined || strFormattedValue=="") strFormattedValue = this._formatValue();
	this._display(strFormattedValue)

	//-- set record binding
	if(this.binding!="")
	{
		//-- only set if we have not need set by data i.e. updateformfromdata
		if(bFromData==undefined)bFromData=false;
		this._form._swdoc._set_data_value(strValue, this.binding,bFromData,strFormattedValue);
	}
}

//-- format display value
_swfc.prototype._formatValue = function (bFromData)
{
	//-- set depending on type i.e. date
	if(this.binding=='opencall.probcode')
	{
		if(this.value=="") return "";
		var strFormattedValue = app.global.GetProblemProfileDescription(this.value).strCodeDesc;
	}
	else if(this.binding=='opencall.fixcode')
	{
		if(this.value=="") return "";
		var strFormattedValue = app.global.GetResolutionProfileDescription(this.value).strCodeDesc;
	}
	else
	{
		if(this._etype==FC_MINUTETIME)
		{
			var strFormattedValue = _format_minutetime_field(this.value);
			//-- 0.1.9.2 - do not set text to display value
			//this.text = strFormattedValue;
		}
		else if(this._etype==FC_SECONDTIME)
		{
			var strFormattedValue = _format_secondtime_field(this.value);
			//-- 0.1.9.2 - do not set text to display value
			//this.text = strFormattedValue;
		}
		else
		{
			var strFormattedValue = this.value;
		}
	}

	return strFormattedValue;
}

//-- return or set binding (value)
_swfc.prototype._dataRef = function (strBinding)
{
	if(strBinding==undefined) return this.binding;
	this.binding = strBinding;
	this.dataRef = strBinding;
}


//-- return or set text (value)
_swfc.prototype._text = function (strText)
{
	//-- if a captio0n bar or label set the innter text
	if(this._etype==FC_CAPTIONBAR)
	{
		var divText = this.htmldocument.getElementById(this.name + "_captiontext");
		if(divText!=null)
		{
			app.setElementText(divText,_parse_context_vars(strText))
		}
	}
	else if(this._etype==FC_LABEL || this._etype==FC_FIELDLABEL)
	{
		var lblText = this.htmldocument.getElementById(this.name + "_labeltext");
		if(lblText!=null)
		{
			if(strText==undefined)
			{
				return this.text;
			}
			else
			{
				app.setElementText(lblText,_parse_context_vars(strText))
				this.text= _parse_context_vars(strText);
			}
		}

	}
	else if(this._etype==FC_MENUBUTTON)
	{
		var tdText = this.htmldocument.getElementById(this.name + "_menutext");
		if(tdText!=null)
		{
			if(strText==undefined) return app.getElementText(tdText);
			app.setElementText(tdText,_parse_context_vars(strText))
			this.text = _parse_context_vars(strText);
		}
	}
	else if(this._etype==FC_BUTTON)
	{
			var tdText = this.htmldocument.getElementById(this.name + "_menutext");
			if(tdText!=null)
			{
				if(strText==undefined) return app.getElementText(tdText);
				app.setElementText(tdText,_parse_context_vars(strText))
				this.text = _parse_context_vars(strText);
			}
			else
			{	
				if(strText==undefined) return app.getElementText(this.element)
				app.setElementText(this.element,_parse_context_vars(strText))	
				this.text = _parse_context_vars(strText);
			}
	}
	else
	{
		if(strText==undefined) return this.text;

		this.text= strText;
		this._display(strText);
	}
}

//-- return or set display
_swfc.prototype._display = function (strDisplay,boolHint)
{
	if(strDisplay==undefined) return this.display;

	if(strDisplay!="-wc-hide-hint-")
	{
		this.display = strDisplay;
	}
	this._set_element_display(boolHint,strDisplay);
}

//-- set actual element display (this method is overriden for certain types
_swfc.prototype._set_element_display = function (boolHint, strAltDisplay)
{
	if(boolHint==undefined) boolHint = false;

	var strDisplay = (strAltDisplay==undefined)?this.display:strAltDisplay;

	if(strDisplay=="" && this.hintText!="")
	{
		this._set_hint_text();
	}
	else
	{
		if(this._originaltextcolor!="")	this.element.style.color = this._originaltextcolor;
		this._bHintText = false;

		if(strDisplay=="-wc-hide-hint-")
		{
			if(this.value!="") return;
			strDisplay="";
		}
		//if(!boolHint)this.element.style.color= "";

		if(this._etype==FC_IMGPICKLIST)
		{
			this._set_picklist_img();  
		}
		else
		{
			this.element.value = strDisplay;  
		}
	}
}

//-- run passed in event type for control
_swfc.prototype._executejsevent = function (strEvent, p1,p2,p3,p4,p5,p6,p7,p8,p9,p10)
{
	var res = true;
	var strFunc = this.name + "_" + strEvent;
	var altFunc = this.duplicatename + "_" + strEvent;
	if(this.frame[strFunc])
	{
		try
		{
			app._CURRENT_JS_WINDOW = window;
			res = this.frame[strFunc](p1,p2,p3,p4,p5,p6,p7,p8,p9,p10);	
		}
		catch (e)
		{
		
		}
	}
	else if(this.duplicatename!="" && this.frame[altFunc])
	{
		try
		{
			app._CURRENT_JS_WINDOW = window;
			res = this.frame[altFunc](p1,p2,p3,p4,p5,p6,p7,p8,p9,p10);	
		}
		catch (e)
		{
		}
	}
	else if(top[strFunc])
	{
		try
		{
			app._CURRENT_JS_WINDOW = window;
			res = top[strFunc](p1,p2,p3,p4,p5,p6,p7,p8,p9,p10);	
		}
		catch (e)
		{
		}
	}
	else if(this.duplicatename!="" && top[altFunc])
	{
		try
		{
			app._CURRENT_JS_WINDOW = window;
			res = top[altFunc](p1,p2,p3,p4,p5,p6,p7,p8,p9,p10);
	
		}
		catch (e)
		{
	
		}
	}
	
	//-- if strEvent == OnValueChanged then also call OnFieldValueChanged
	if(strEvent == "OnValueChanged")
	{
		if(this.frame["OnFieldValueChanged"])
		{
			app._CURRENT_JS_WINDOW = window;
			this.frame["OnFieldValueChanged"](this.name,this.value);
		}
	}

	//-- check if function just called made any bound recordset changes
	if(strEvent!="OnKeyPressed")
	{
		this._form._swdoc._CheckFormCodeDataChange(); 
	}
	else
	{
		if (this.binding!="" && this.element.value!=this.value && document.type!=_LCF)
		{
			document._bSaveEnabled = true;
		}
	}

	return res;
}

//-- standard event handlers
_swfc.prototype._onpressed = function (anEle)
{
	//-- check if name matches a showme item if so run
	this._form._swdoc._showmeitem_exists(this.name,true);

	this._executejsevent("OnPressed");

}


_swfc.prototype._onleftclick = function (anEle)
{
	this._executejsevent("OnLeftClick");
}

//--
//--
//-- control specific methods
function _swfc_textedit(oSWFC)
{
	oSWFC._onchange = _swfc_textedit_onchange;
	oSWFC._onmousedown = _swfc_textedit_onmousedown;
	oSWFC._onblur = _swfc_textedit_onblur;

	//-- private methods
	oSWFC._show_multiclip_menu = swfc_textedit_show_multiclip_menu;
	oSWFC._hide_multiclip_menu = swfc_textedit_hide_multiclip_menu;
	oSWFC._insert_text_at_cursor = swfc_textedit_insert_text_at_cursor;

	//-- priv props
	oSWFC._rtecontextinit;
}


//-- handle text edit value change
function _swfc_textedit_onchange(oEv)
{
	this._value(this.element.value,this.element.value,false,true);
	this._executejsevent("OnValueChanged", this.value);
}

function swfc_textedit_insert_text_at_cursor(strText)
{
	//IE support
	var myField = this.element;
	if (this.htmldocument.selection) 
	{
		myField.focus();
	    sel = this.htmldocument.selection.createRange();
	    sel.text = strText;
	}
	  //MOZILLA/NETSCAPE support
	else if (myField.selectionStart || myField.selectionStart == '0') 
	{
		var startPos = myField.selectionStart;
	    var endPos = myField.selectionEnd;
	    myField.value = myField.value.substring(0, startPos)
		              + strText
			          + myField.value.substring(endPos, myField.value.length);
	}
	else 
	{
		myField.value += strText;
	}

	this._value(myField.value);
}

function swfc_textedit_hide_multiclip_menu()
{
	var divWysiwyg  = this.htmldocument.getElementById("wysiwyg_div_" + this.name);
	if(divWysiwyg!=null)
	{
		if(this._rtecontextinit)this._form._targetframe.WYSIWYG_ContextMenu.close();
	}
}

//-- load analysts multi-clip menu
function swfc_textedit_show_multiclip_menu(oEv,btnID)
{
	var divWysiwyg  = this.htmldocument.getElementById("wysiwyg_div_" + this.name);
	if(divWysiwyg!=null)
	{
		if(!this._rtecontextinit)
		{
			this._form._targetframe.WYSIWYG_ContextMenu.init(this.name,this.element);
		}
		this._rtecontextinit=true;
		if(app.isSafari)
		{
			//this._form._targetframe.WYSIWYG_ContextMenu.output(this.name);
			this._form._targetframe.WYSIWYG_ContextMenu.show(oEv, this.name);
		}
	}
	else
	{
		var bGroupMc = lsession.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE);
		var bPersonalMc = lsession.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE);

		//-- check permissions
		if(!bGroupMc && !bPersonalMc)
		{
			//-- cannot use mc at all
			return false;
		}

		//-- get position of cursor and insert a marker
		var origValue = this.element.value;
		app.insertAtCursor(this.element, "##_swmc_marker_##");
		var strCurrentValue = this.element.value;
		this.element.value = origValue;

		//-- popup item selector
		var swc = this;
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
					strCurrentValue = _regexreplace(strCurrentValue,"##_swmc_marker_##",strInsertData);
					swc._value(strCurrentValue);
				}
			}
		}, null, window,250,250);
	}
}


//-- handle text edit on click
function _swfc_textedit_onmousedown(oEv)
{
	var btnClicked = _mousebtn(oEv);
	if(app.isSafari && oEv.shiftKey)btnClicked=666;

	if(btnClicked==1)
	{
		var strFunc = "OnLeftClick";
	}
	else
	{
		if(this.readOnly)
		{
			//-- cancel bubble
			this._cancelevent(oEv);
			return false;
		}

		//-- check if text area if so show multiclip options if also hold ctrl
		if(this.element.tagName=="TEXTAREA" && (oEv.ctrlKey || btnClicked==666))
		{
			//-- draw multiclip menu
			this._show_multiclip_menu(oEv,btnClicked);

			//-- cancel bubble
			this._cancelevent(oEv);

			return false;
		}
		else if(this.element.tagName=="TEXTAREA")
		{
			this._hide_multiclip_menu();
		}
		
		var strFunc = "OnRightClick";
	}

	return this._executejsevent(strFunc);

}

//-- handle text edit on blur (check format)
function _swfc_textedit_onblur(oEv)
{
	//-- defect 86607 - (added chrome fix on 13.02.2012 added safari fix 29.06.2012 [88749]) when you minimise form in ie it does not fire the onchange event
	if((app.isIE || app.isChrome || app.isSafari))
	{
		//-- need to fire on change event - but not for any fields that have opencall.probcode
		if(this.value != this.element.value && this.element.value!= this.hintText && this.binding.toLowerCase()!="opencall.probcode")
		{
			this._onchange(oEv);
			return;
		}
	}
	this._set_element_display(true);
}

//--
//-- Date control
function _swfc_datebox(oSWFC)
{
	//-- public properties

	//-- public methods

	//-- private
	oSWFC._value = _swfc_datebox_value;
	oSWFC._text = _swfc_datebox_text;
	oSWFC._onchange = _swfc_datebox_onchange;
	oSWFC._oncalchange = _swfc_datebox_oncalchange;
	oSWFC._convertvalue = _swfc_datebox_convertvalue;
	oSWFC._trigger_dropdown = _swfc_trigger_dropdown;

	oSWFC._onmousedown = _swfc_textedit_onmousedown;
	oSWFC._onblur = _swfc_textedit_onblur;

	oSWFC._apply_timezone_offset = true;

	oSWFC._jsdate = null;

	if(oSWFC.binding.indexOf("calltasks")==0) oSWFC._apply_timezone_offset = false;

}

function _swfc_trigger_dropdown(oEv, aDoc)
{
	if(this.readOnly)return;
	app.trigger_datebox_dropdown(this.element,oEv,this._jsdate);
}

//-- called when user types in a date value
function _swfc_datebox_onchange(oEv)
{
	//-- check date format is ok
	this._value(this.element.value,"",false,true);	

	//this._executejsevent("OnValueChanged", this.value);
}

//-- called when user clicks on a date from calendar drop down
function _swfc_datebox_oncalchange(intEpoch)
{
	//-- check date format is ok
	//this._value(this.element.value,this.element.value);	
	
}

//-- set or get text
function _swfc_datebox_text(strText)
{
	if(strText==undefined)
	{
		if(this.dataRef=="")
		{
			return this.text;
		}	
		else
		{
			return this.value;
		}
	}

	this._value(strText);
}

//-- return or set value - overridden per control type
function _swfc_datebox_value(strValue , strFormattedValue, bFromData,bManualChange)
{
	
	if(strValue==undefined) return this.value;
	if(bFromData==undefined)bFromData=false;
	if(bManualChange==undefined)bManualChange=false;

	if(strValue.replace)strValue = strValue.replace("Z","");

	//-- value has not changed and element has had any default value set 
	if(strValue==this.value && this._value_initialised) return;

	//-- first time being set and being set to blank so set default value
	if(!this._value_initialised && strValue=="")
	{
		strValue = this.defaultValue;
		strFormattedValue = strValue;
	}
	this._value_initialised=true;
	//-- eof setting initial default

	if(strValue=="1" && strFormattedValue=="1")strValue="0";

	if(strValue=="0" || strValue=="")
	{
		this.value = strValue;
		this.text= strValue;
		this._display("");	
	}
	else
	{
		if(!this._convertvalue(strValue,bFromData,bManualChange))return;
	}

	//-- set record binding
	if(this.binding!="")
	{
		//-- only set if we have not need set by data i.e. updateformfromdata
		this._form._swdoc._set_data_value(this.value, this.binding,bFromData);
	}

	if(!bFromData && bManualChange)
	{
		this._executejsevent("OnValueChanged", this.value);
	}
}

function _swfc_datebox_convertvalue(varDateString,bFromData,bManualChange)
{
	//-- always store as epoch unless data binding in not numeric
	if(bFromData==undefined)bFromData=false;

	var bEpoch = false;
	var bTimeStamp = false;
	if(this.binding!="")
	{
		//-- check if numeric binding
		var arrBind = this.binding.split(".");
		if( (pDDTABLES[arrBind[0]]) && (pDDTABLES[arrBind[0]].columns[arrBind[1]]) )
		{
			if(!pDDTABLES[arrBind[0]].columns[arrBind[1]].IsNumeric()) bEpoch= false; 

			if(pDDTABLES[arrBind[0]].columns[arrBind[1]].type == "timestamp")bTimeStamp=true;
		}
		else if(arrBind[0]=="x") //-- an xmlmc date field
		{
			bTimeStamp = true;
		}
		else
		{
			alert("swform.controls : the date control ["+this.name+"] does not have a valid data binding.");
		}
	}

	//-- convert date string into a date
	var varWorkWithValue = varDateString;
	varWorkWithValue--;varWorkWithValue++;


	//-- get format from control
	var strFormat = this.dateFormat;
	if(strFormat == "")
	{
		//-- get analysts specified format based on mode
		var fTest = new Number(this.dateFormatMode);
		fTest--;fTest++;
		switch(fTest)
		{
			case 0:
				strFormat = app._analyst_datetimeformat
				break;
			case 1:
				strFormat = app._analyst_dateformat
				break;
			case 2: //-- time
				strFormat = app._analyst_timeformat
				break;
			case 3: //-- custom
				strFormat = app._analyst_datetimeformat
				break;
		}
	}

	//-- we need two things 1. GMT epoch value and 2. formatted date in analysts tz to display in fields
	var _ANALYST_DATE = null; 	//-- this will be the formatted date to analysts TZ
	var _DB_DATE = null;		//-- will be set to GMT

	//-- if value is numeric - assume epoch
	if(!isNaN(varWorkWithValue))
	{
		var _selected_date_epoch = varWorkWithValue;
		if(this._apply_timezone_offset)
		{
			//-- make sure date is UTC and takes into account users offset  
			if(bManualChange)
			{
				//-- will be in os epoch i.e. epoch value for date selected (no adjustments needed for analyst date)
				_ANALYST_DATE = app._date_from_epoch(varWorkWithValue);
			}
			else
			{
				//-- data from db - so should be already be utc epoch - adjust for analysts TZ
				_ANALYST_DATE = app._utcdate_from_epoch(varWorkWithValue,lsession.timezoneOffset);
			}
		}
		else
		{
			//-- do not apply analyst offset and use os
			_ANALYST_DATE  = app._osdate_from_epoch(varDateString,0);
		}
	}
	else
	{
		//-- user has selected a date - its a timestamp - so assume the date is from their current OS timezone
		_ANALYST_DATE = app._parseDate(varDateString,strFormat);
		if(_ANALYST_DATE==null)
		{
			_ANALYST_DATE = app._parseDate(varDateString);	
		}
	}

	//-- GET DB UTC DATE - ANALYSTS TZ OFFSET WHICH WE STORE IN .text (as per full client)
	try
	{
		_DB_DATE = app._date_from_epoch(parseInt(Date.UTC(_ANALYST_DATE.getUTCFullYear(),_ANALYST_DATE.getUTCMonth(),_ANALYST_DATE.getUTCDate(),_ANALYST_DATE.getUTCHours(),_ANALYST_DATE.getUTCMinutes(),_ANALYST_DATE.getUTCSeconds()) / 1000) - lsession.timezoneOffset);	
	}
	catch (e)
	{
		alert("The entered date format is not valid. Please use the following format [" + strFormat + "].")
		this._value(this.value);
		return false;
	}
	


	//-- format analyst date
	var strFormattedDate = app._formatDate(_ANALYST_DATE,strFormat);
	var strTextDate = app._formatDate(_DB_DATE,strFormat);
	if(_ANALYST_DATE!=null)
	{
		this._jsdate = _ANALYST_DATE;

		if(!bTimeStamp)
		{
			strDateDBValue = parseInt(Date.UTC(_ANALYST_DATE.getFullYear(),_ANALYST_DATE.getMonth(),_ANALYST_DATE.getDate(),_ANALYST_DATE.getHours(),_ANALYST_DATE.getMinutes(),_ANALYST_DATE.getSeconds()) / 1000)- lsession.timezoneOffset;
		}
		else if(bTimeStamp)
		{
			strDateDBValue = app._parseDate(_ANALYST_DATE.toUTCString(),"yyyy-MM-dd HH:mm:ss")
			//-- store time stamp in utc date
			if(bManualChange)
			{
				strDateDBValue = app._date_to_utc_timestamp(_ANALYST_DATE);
			}
			else
			{
				strDateDBValue  = app._formatDate(_ANALYST_DATE,"yyyy-MM-dd HH:mm:ss");
			}
		}
	
		this.value = strDateDBValue;
		this.text = (this.binding=="")?strTextDate:strDateDBValue;
		this._display(strFormattedDate);	
		return true;
	}
	else
	{
		if(varDateString!="")alert("The entered date format is not valid. Please use the following format [" + strFormat + "].")
		this.value = "";
		this.text= "";
		this._jsdate = null;
		this._set_hint_text();
		return false;
		//this._display(strFormat,true);	
	}
}

function _swfc_datebox_display(varFormattedDisplay)
{

}

//--
//-- listbox and distinct listbox
function _swfc_listbox(oSWFC)
{
	//-- public properties
	oSWFC._unparsedFilter = oSWFC.listFilter;
	oSWFC.filter = oSWFC.listFilter;

	//-- public methods
	oSWFC.Reload = _swfc_listbox_reload;
	oSWFC._onkeydrop = _swfc_listbox_onkeydrop;

	oSWFC.fetchType = 1; 

	oSWFC.invokeStoredQuery = _swfc_listbox_storedquery;
	oSWFC.InvokeStoredQuery = _swfc_listbox_storedquery;

	if(oSWFC.storedQuery!="")
	{
		oSWFC.fetchType = 2;
		oSWFC.storedQueryParams = oSWFC.filter;
		oSWFC.storedQueryName =oSWFC.storedQuery;
	}

	//-- priv props
	oSWFC.source = oSWFC.sqlSource;
	oSWFC.table = oSWFC.distinctTable;


	oSWFC._selected_img = null;

	//-- private methods
	oSWFC._value = _swfc_listbox_value;
	oSWFC._text = _swfc_listbox_text;
	oSWFC._extra_option_value=_swfc_listbox_extra_option_value;
	oSWFC._fetchdata = _swfc_listbox_fetchdata;
	oSWFC._filter = _swfc_listbox_filter;
	oSWFC._pickList = _swfc_listbox_pickList;
	oSWFC._extraOptions = _swfc_listbox_extraOptions;
	oSWFC._apply_extra_options=_swfc_listbox_apply_extra_options;
	oSWFC._has_databound_extraoptions=_swfc_listbox_has_databound_extraoptions;
	oSWFC._check_value=_swfc_listbox_check_value;
	oSWFC._onchange = _swfc_listbox_onchange;
	oSWFC._onblur = _swfc_listbox_onblur;

	oSWFC._addoption = _swfc_listbox_addoption;
	oSWFC._onmousedown = _swfc_listbox_ondropdown;

	oSWFC.deactivate = _swfc_listbox_deactivate;
	oSWFC._set_picklist_img = _swfc_listbox__set_picklist_img;

	oSWFC._dataloaded = false;
	oSWFC._dropped= false;

	oSWFC._systemlbmandatory = false;

	oSWFC._hilite = _swfc_listbox_hilite;
	oSWFC._lolite = _swfc_listbox_lolite;
	oSWFC._selectitem = _swfc_listbox_selectitem;
}

function _swfc_listbox_text(strText)
{
	this._value(strText);
}

function _swfc_listbox_deactivate()
{
	this._form._arr_open_lists[this.name] = false;
	this._dropped = false;
	this._dropdiv.style.display='none';
}


function _swfc_listbox__set_picklist_img()
{
	if(_img_picklists[this.imageList]!=undefined)
	{
	
		if(this._selected_img==null)
		{
			var strClass = _regexreplace(this.imageList," ","_");
			var strImgDiv = "<div id='" + this.name + "__img' class='"+strClass+"' style='position:absolute;z-Index:999;'></div>";
			insertBeforeEnd(this.htmldocument.body,strImgDiv);
			this._selected_img = this.htmldocument.getElementById(this.name + "__img");
		}

		if(this._selected_img!=null && this._selected_img.style.display!="none")
		{
			if(isNaN(this.value))this.value = 0;
			var ileft = this.value * 18;
			this._selected_img.style.backgroundPosition="-"+ileft+"px 0"; 
			this._selected_img.style.top = 	this.element.offsetTop - 1 + 3;
			this._selected_img.style.left = this.element.offsetLeft - 1 + 2;
		}
	}
}

function _swfc_listbox_onkeydrop(oEv,intForceAction)
{
	return this._onmousedown(oEv,intForceAction);
}

function _swfc_listbox_ondropdown(oEv,intForceAction)
{
	if(intForceAction==undefined)intForceAction=0;
	
	var ret = true;
	//-- call associated developer function
	ret =  this._executejsevent("OnDropDown");

	if(ret==undefined || ret==false)return app.stopEvent(oEv);

	//-- call form defined function if exists
	var strFunc = "";
	if(_mousebtn(oEv)==1)
	{
		strFunc = "OnLeftClick";
	}
	else if(_mousebtn(oEv)==2)
	{
		strFunc = "OnRightClick";
	}
	if(strFunc!="")ret = this._executejsevent(strFunc);

	if(ret==undefined || ret==false)return app.stopEvent(oEv);

	if(this.readOnly)
	{
		this._cancelevent(oEv);
		return app.stopEvent(oEv);
	}

	if(ret)
	{
		var boolDrop = (this.picklistonly || this._etype==FC_IMGPICKLIST);
		if(intForceAction==40)
		{
			this._dropped = false;
			boolDrop = true;
		}
		else if(intForceAction==38)
		{
			boolDrop = false;
		}

		var cancelEvent = boolDrop;
		if(!boolDrop)
		{
			//-- user is allowed to edit - so do not show drop down unless they have clicked on drop down area
			var arrM = app.findMousePos(oEv);
			var mLeft = arrM[0];
			var btnLeft = this.element.offsetLeft + this.element.offsetWidth - 16;
			var btnRight = this.element.offsetLeft + this.element.offsetWidth - 1;
			if((mLeft>btnLeft) && (mLeft<btnRight))
			{
				boolDrop = true;
			}
		}

		if(!this._dropped && boolDrop)
		{
			//-- close all other listboxes
			this._form._close_open_lists();

			this._dropped = true;
			this._form._arr_open_lists[this.name] = true;

			//-- populate picklist
			this._pickList();
			
			//-- drop it either down or up above depending on height
			this._dropdiv.style.top = this.element.offsetTop + this.element.offsetHeight;
			this._dropdiv.style.left = this.element.offsetLeft;
			this._dropdiv.style.width = this.element.offsetWidth;
			this._dropdiv.style.zIndex = 999999;

			//-- get form left and right widths from listbox
			var iFormLeftSpace = this.element.offsetLeft + this.element.offsetWidth;
			var iFormRightSpace = this.htmldocument.body.offsetWidth - this.element.offsetLeft;
		
			this._dropdiv.style.height = "";
			this._dropdiv.style.display="block";

			var iListHeight = this._dropdiv.offsetHeight;
			var iListWidth = this._dropdiv.offsetWidth;

			//-- workout where to position picklist to the left or right of element
			var iListBottom = iListHeight + (this.element.offsetTop + this.element.offsetHeight);
			var iFormBottom = app.eleHeight(this.htmldocument.body) - (this.element.offsetTop + this.element.offsetHeight);
			var iFormTop = this.element.offsetTop;

			//-- if list bottom goes off form bottom edge then set height of list
			this._dropdiv.style.overflow='auto';
			if(iFormBottom < iListHeight)
			{
				if(iFormTop>iFormBottom)
				{
					//-- display list above lb as there is more space
					if(iListHeight > this.element.offsetTop) iListHeight = this.element.offsetTop;
					this._dropdiv.style.height = iListHeight;
					this._dropdiv.style.top = this.element.offsetTop - iListHeight;
				}
				else
				{
					//-- display below still butadjust size of drop down to goto the bottom of form
					this._dropdiv.style.height = iFormBottom - 2;
				}
			}

			return app.stopEvent(oEv);
			
		}
		else
		{
			this._form._arr_open_lists[this.name] = false;
			this._dropped = false;
			this._dropdiv.style.display='none';
		}
	}

	return ret;
}

//-- call service to check if given value (or text) exists in db or xml picklist
function _swfc_listbox_check_value(strValue,strMode)
{
	if(strValue=="")return true;
	if(strMode==undefined)strMode="key";

	if(this._etype==FC_PICKLIST || this._etype==FC_NUMPICKLIST || this._etype==FC_IMGPICKLIST)
	{
		var bNumeric=(this._etype==FC_NUMPICKLIST)?true:false;
		if(this.binding!="")
		{
			if(this.isXmlField())
			{
				bNumeric=true;
			}
			else
			{
				var wasNumeric = bNumeric;
				var arrBind = this.binding.split(".");
				bNumeric = pDDTABLES[arrBind[0]].columns[arrBind[1]].IsNumeric();

				//-- sometime we have numeric picklists bound to string based db fields
				//-- so bNumeric will be false - but need to switch to true if test is a number
				if(wasNumeric && !bNumeric && !isNaN(strValue))bNumeric=true;
			}
		}

		strMode = (this._etype==FC_NUMPICKLIST && bNumeric)?"key":"text";
		strValue = strValue+""; //-- cast

		if(this._originalPicklist!=this.pickList || this._htmltable.rows.length==0)
		{
			//-- draw
			this._pickList();
		}

		var aRow=null;
		var arrRet = new Array();
		var aHtlen = this._htmltable.rows.length;
		var testValue = strValue.toLowerCase();
		for(var x=0;x<aHtlen;x++)
		{
			aRow = this._htmltable.rows[x];
			var strText = app.eleText(aRow.cells[0]);
			var strID = app.eleText(aRow.cells[1]);
			if(strMode!="key")
			{
				if(strText.toLowerCase() == testValue)
				{	
					//-- found
					arrRet[0] = strText;
					arrRet[1] = strText;
					return arrRet;
				}
			}
			else
			{
				if(aRow.cells[1].innerHTML.toLowerCase() == testValue)
				{	
					//-- found
					arrRet[0] = strID;
					arrRet[1] =strText;
					return arrRet;
				}
			}
		}
		return false;
	}
	else
	{
		var strParams = "dsn=" + this.source;
			strParams += "&table="+ app.pfu(this.table);
			strParams += "&filter="+ app.pfu(_parse_context_vars(this.filter,true));
			strParams += "&keycol="+ app.pfu(this.distinctColumn);
			strParams += "&textcol="+ app.pfu(this.displayColumn);
			strParams += "&checkvalue="+ app.pfu(strValue);
			strParams += "&checkmode="+ strMode;

		app.debugstart(this.name + "._check_value [listbox]","FORM CONTROLS");

		var strURL = app._root + "service/form/combo/checkvalue/index.php";
		var strRes =  app.get_http(strURL, strParams, true, false, null, null,0, this.name);

		app.debugend(this.name + "._check_value [listbox]","FORM CONTROLS");

		if(strRes.indexOf("^swwc^")==-1)return false;
		return strRes.split("^swwc^");
	}
}

//-- returns the value of an extra option
function _swfc_listbox_extra_option_value(strExtraOption)
{
	var arrAdditionalItems = this.extraOptions.split("^");
	var y = arrAdditionalItems.length;
	for(var x=0;x<y;x++)
	{
		if(arrAdditionalItems[x]=="") continue;

		if(arrAdditionalItems[x].indexOf("=")>-1)
		{
			//-- a display value and a value i.e [Use customer site]=&[userdb.site]
			iInfo = arrAdditionalItems[x].split("=");
			if(strExtraOption==iInfo[0])
			{
				if(this.binding!="" && iInfo[1].indexOf("&[")==0 )
				{
					var o = {};
					o.info = iInfo;
					o.element = this;
					document._listbox_extraoptions_bindings[this.binding] = o;
				}

				var strResolvedValue = _parse_context_vars(iInfo[1]);
				if(strResolvedValue=="")strResolvedValue=iInfo[0];
				return strResolvedValue;
			}
		}
		else
		{
			//-- is just a value
			if(strExtraOption==arrAdditionalItems[x])return arrAdditionalItems[x];
		}
	}

	return strExtraOption;
}

function _swfc_listbox_has_databound_extraoptions()
{
	var arrAdditionalItems = this.extraOptions.split("^");
	var y = arrAdditionalItems.length;
	for(var x=0;x<y;x++)
	{
		if(arrAdditionalItems[x]=="") continue;

		if(arrAdditionalItems[x].indexOf("=")>-1)
		{
			//-- a display value and a value i.e [Use customer site]=&[userdb.site]
			iInfo = arrAdditionalItems[x].split("=");
			if(iInfo[1]!=undefined)
			{
				if(app.trim(iInfo[1]).indexOf("&[")==0) return true;

			}
		}
	}
	return false;
}

function _swfc_listbox_value(strValue, strFormattedValue, bFromData,bfromChange)
{
	if(bfromChange==undefined)bfromChange=false;
	if(bFromData==undefined)bFromData=false;
	if(strValue==undefined) return this.value;
	
	//-- cast
	strValue +="";
		
	//-- value has not changed and element has had any default value set 
	if(strValue==this.value && this._value_initialised && bfromChange==false && bFromData!=false) 
	{
		return;
	}

	//-- first time being set and being set to blank so set default value
	var bSkip = false;
	if(this._etype!=FC_NUMPICKLIST && (strValue=="" || strValue=="0") && !this._value_initialised)
	{
		//-- check if default matches extra items
		if(this.defaultValue!="")
		{
			if(this._etype==FC_PICKLIST)
			{
				var bProcess=true;
				if(this.binding!="")
				{
					//-- check binding exists
					var arrBind = this.binding.split(".");
					if(document[arrBind[0]]==undefined)
					{
						if(arrBind[0]!="x")bProcess=false;
					}
				}

				if(bProcess)
				{
					strValue = this._extra_option_value(this.defaultValue);
					strFormattedValue = this.defaultValue;
				}
				bSkip = true;
			}
			else
			{
				//-- it relates to a db value - check if it is a &[
				strValue = this._extra_option_value(this.defaultValue);
				strFormattedValue = this.defaultValue;
				bSkip = true;
			}
		}
	}
	else if(this._etype==FC_NUMPICKLIST && (strValue=="" || strValue=="0") && !this._value_initialised)
	{
		if(this.defaultValue!="")
		{
			strValue = this.defaultValue;
		}
	}
	else if(strValue.indexOf("&[")==0 && !bFromData)
	{
		//-- is something like &[userdb.keysearch]
		strValue = _parse_context_vars(strValue);
		if(strValue=="undefined")strValue="**Value Not Found**";
		strFormattedValue = strValue;
	}


	this._value_initialised=true;
	//-- eof setting initial default

	//-- if this hasnt come from a element on change event (i.e. has come from onformloaded or onupdatefromfromdata)	
	if(!bfromChange  && !bSkip)
	{
		//alert("set lb value : " + bFromData)
		//-- we need to process depending on the type of list box
		if(this._etype==FC_PICKLIST || this._etype==FC_NUMPICKLIST || this._etype==FC_IMGPICKLIST)
		{
			//-- we need to swap value out for a number (mysel enum field .. see calendar appointments)
			if(this.binding!="" && arrSwapEnumBindingValues[this.binding]!=undefined)
			{
				var tmpValue = arrSwapEnumBindingValues[this.binding][strValue];
				if(tmpValue!=undefined)strValue = tmpValue;
			}

			//-- text only or numeric (not db driven)
		
			var arrValues = this._check_value(strValue,"key");
			if(arrValues==false)
			{
				//-- no match - so if a picklist where user can enter values then allow
				if(this._etype!=FC_PICKLIST)strFormattedValue = "";
			}
			else
			{
				//-- matching value
				strFormattedValue = arrValues[1];
			}
		}
		else
		{
			//-- check if value is from extra options - qlc setting value to [Use Custoner Site]
			var strExtraOptionValue = this._extra_option_value(strValue);
			if(strExtraOptionValue!=strValue)
			{
				strFormattedValue = strValue
				strValue = strExtraOptionValue;
			}
			else
			{
				//-- db or xml driven picklist so if not loaded check value on db but only when not from dataload
				if(this.distinctColumn!=this.displayColumn && this.displayColumn!="")
				{
					var arrValues = this._check_value(strValue,"key");
					if(arrValues==false)
					{
						strFormattedValue = "";
						//strFormattedValue = strValue;
						//if(strValue==0)	strFormattedValue = "";//-- always set 0 value to display of "" if no match found
					}
					else
					{
						//-- get formatted value
						strFormattedValue = arrValues[1];
					}
				}
				else
				{
					strFormattedValue = strValue;
				}
			}
		}
	}
	else
	{
		//-- user has selected a value -
		var bNumeric=false;
		if(this.binding!="")
		{
			var arrBind = this.binding.split(".");
			if(!this.isXmlField())
			{
				if(pDDTABLES[arrBind[0]] && pDDTABLES[arrBind[0]].columns[arrBind[1]])	bNumeric = pDDTABLES[arrBind[0]].columns[arrBind[1]].IsNumeric();
			}
			else
			{
				bNumeric = (this._etype==FC_NUMPICKLIST);
			}

			if(!bNumeric && this._etype==FC_NUMPICKLIST)
			{
				//-- picklist is numeric but db is not (system control form most likely)
				//-- set value to formatted value
				strValue = strFormattedValue;
			}
		}
	}
	this.value = strValue;
	
	//-- set record binding
	if(this.binding!="")
	{
		this._form._swdoc._set_data_value(strValue,this.binding,bFromData);
	}
	
	if(strFormattedValue==undefined)strFormattedValue = this.value;
	this.text = this.value;//strFormattedValue; //-- i think sw puts value into text instead of formatted value
	this._display(strFormattedValue);

	if(bfromChange)
	{
		//-- call associated developer function
		this._executejsevent("OnValueChanged",this.value);
	}

}

//-- do nothing onblur
function _swfc_listbox_onblur()
{
}

//-- called when lb textbox changes
function _swfc_listbox_onchange(oEv)
{
	//-- this function should never be called if this.picklistonly = true;

	//-- typed in text value so need to match it with list items
	var strNewValue = this.element.value;
	var arrCheck = this._check_value(strNewValue,"text");
	var bFound=(arrCheck!=false);

	if(bFound)
	{
		//if(this._etype==FC_DBPICKLIST || this._etype==FC_XMLPICKLIST)
		//{
			this._value(arrCheck[0],arrCheck[1], false,true);
		//}
	}
	else
	{
		//-- value not found so prompt them to create new record if a quick add
		if( (this.comboQuickAdd) && (strNewValue!="") && (this.newRecordForm!=""))
		{
			if(MessageBox("There is no match found for the item you entered. Please click No to try again or Yes to create a new record",app.MB_YESNO))
			{
			
					var strDisCol = (this.displayColumn=="")?this.distinctColumn:this.displayColumn;
					var strParams = "fromlistbox=1&displaycolumn="+strDisCol+"&interimvalue=" + strNewValue;
					var swfc = this;
					_open_control_form(this.newRecordForm,"add",strNewValue,strParams,function(res)
					{
						if(res.recordsaved)
						{
							//-- set value and display
							swfc.element.value = res.picklistdisplay;
							swfc._value(res.primarykey,res.picklistdisplay, false,true);
						}
						else
						{
							swfc.element.value = "";
							swfc._value("","", false,true)
						}
					});
			}
			else
			{
				this.value = "";
				this.text = "";
				this.display = "";
				this._value("","", false,true)
				return false;
			}

		}
		else
		{
			this._value(this.element.value,this.element.value,false,true);
		}
	}
	//-- call associated developer function
	//this._executejsevent("OnValueChanged",this.value);
}




//-- return or set filter
function _swfc_listbox_filter(strFilter)
{
	if(strFilter==undefined) return this.listFilter;

	this._unparsedFilter = strFilter;
	this.listFilter = _parse_context_vars(strFilter,true); //-- parse filter
	this.filter = this.listFilter;
}



//-- return or set filter
function _swfc_listbox_reload()
{
	//this._pickList();
}

function _swfc_listbox_addoption(strValue,strText)
{
	var aRow = this._htmltable.insertRow(this._htmltable.rows.length);
	var celltext = aRow.insertCell(0);
	var cellid = aRow.insertCell(1);

	celltext.setAttribute("nowrap","true");
	celltext.setAttribute("width","100%");
	celltext.innerHTML = strText;

	cellid.style.display='none';
	cellid.innerHTML = strValue;

}

//-- lo lite listbox option
function _swfc_listbox_lolite(oEv)
{
	var aRow = app.getEventSourceElement(oEv);
	if(aRow.tagName=='TR')
	{

	}
	else if(aRow.tagName=='TD')
	{
		aRow = aRow.parentNode;
	}
	else
	{
		return;
	}

	aRow.style.backgroundColor = '#ffffff';
	aRow.style.color = '#000000';

}

//-- hi lite listbox option
function _swfc_listbox_hilite(oEv)
{
	var aRow = app.getEventSourceElement(oEv);
	if(aRow.tagName=='TR')
	{
	}
	else if(aRow.tagName=='TD')
	{
		aRow = aRow.parentNode;
	}
	else
	{
		return;
	}

	aRow.style.backgroundColor = 'navy';
	aRow.style.color = '#ffffff';
}


//-- select listbox option
function _swfc_listbox_selectitem(oEv)
{
	app.stopEvent(oEv);
	var aRow = app.getEventSourceElement(oEv);
	if(aRow.tagName=='DIV')
	{
		aRow = aRow.parentNode.parentNode;
	}
	else if(aRow.tagName=='TD')
	{
		aRow = aRow.parentNode;
	}

	if(aRow.cells && aRow.cells[0]!=undefined)
	{
		this._value(app.eleText(aRow.cells[1]),app.eleText(aRow.cells[0]), false,true);
	}
	this._dropped=false;
	this._dropdiv.style.display='none';

	return false;
}


//-- return or set pickList items
function _swfc_listbox_pickList()
{
	//-- if FC_DBPICKLIST OR XMLPICKLIST
	if(this._etype==FC_DBPICKLIST || this._etype==FC_XMLPICKLIST)
	{
		//-- if autload is off and we have already loaded then get out of here 
		//-- check if filter has changed
		var testfilter = _parse_context_vars(this._unparsedFilter,true);
		if(testfilter!=this.listFilter)
		{
			this.listFilter = testfilter;
			this._dataloaded=false;
		}
		

		/* nwj  - 24.03.2011 - removed so get data each time
		if(this._dataloaded && !this.comboAutoUpdate) 
		{

			return true;
		}
		*/

		//-- fetch db or xml data
		this._dataloaded = true;
		if(!this.mandatory)
		{
			this._addoption("","");
		}

		this._fetchdata();
		this._apply_extra_options();

	}
	else
	{
		//-- STANDARD PICKLISTS (numeric, string or image (??))

		//-- if loaded then get out
		if(this.listItems!=this.pickList)this._dataloaded=false;
		if(this._dataloaded) 
		{
			return true;
		}

		this._dataloaded = true;
		this.listItems = this.pickList

		//-- remove rows
		var yLen = this._htmltable.rows.length-1;
		for(var i = yLen; i > -1; i--)
		{
			this._htmltable.deleteRow(i);
		}



		//-- do we want an optional value
		if(!this.mandatory && !this._systemlbmandatory)
		{
			this._addoption("","");
		}

		//-- check if we have ddf default items to use
		var iInfo = new Array();
		var arrItems = this.pickList.split("|");
		yLen = arrItems.length;
		for(var x=0;x<yLen;x++)
		{
			if(arrItems[x]=="") continue;

			if(this._etype==FC_NUMPICKLIST)
			{
				iInfo = arrItems[x].split("^");
				this._addoption(iInfo[1],iInfo[0]);
			}
			else
			{
				//-- if have ^ in them ignore
				var strVal = arrItems[x];
				if(arrItems[x].indexOf("^")>-1)
				{
					strVal = arrItems[x].split("^")[0];
				}

				this._addoption(strVal, strVal);
			}
		}
			
		this._apply_extra_options();
	}
	return true;
}

function _swfc_listbox_apply_extra_options()
{
	var iInfo = new Array();
	var arrAdditionalItems = this.extraOptions.split("^");
	var yLen =arrAdditionalItems.length;
	for(var x=0;x<yLen;x++)
	{
		if(arrAdditionalItems[x]=="") continue;

		if(arrAdditionalItems[x].indexOf("=")>-1)
		{
			//-- a display value and a value i.e [Use customer site]=&[userdb.site]
			iInfo = arrAdditionalItems[x].split("=");
			this._addoption(iInfo[1],iInfo[0]);
		}
		else
		{
			//-- is just a value
			this._addoption(arrAdditionalItems[x], arrAdditionalItems[x]);
		}
	}

}

//-- return or set additional items
function _swfc_listbox_extraOptions(strItems)
{
	if(strFilter==undefined) return this.extraOptions;

	this.extraOptions = strItems;

}

//-- 2012.05.15 - storedquery to get data
function _swfc_listbox_storedquery(strQueryName, strParams)
{
	this._beforeloadingvalue = this.element.value;
	this.element.value = "Loading...";

	this.fetchType = 2; //-- remote query
	this.storedQueryName = strQueryName;
	this.storedQueryParams = strParams;

	var strDesc = (this.pickListOrderDesc)?"DESC":"ASC";
	var strMand = (this.mandatory)?"1":"0";
	var displayColumn = (this.displayColumn=="")?this.distinctColumn:this.displayColumn;
	var selectColumns = (this.displayColumn=="")?this.distinctColumn:this.distinctColumn + "," + this.displayColumn;

	strParams = _parse_context_vars(strParams,true);
	if(strParams!="")strParams+="&";
	    strParams += "dsn=" + this.source;
		strParams += "&mandatory=" + strMand;
		strParams += "&table="+ this.table;
		strParams += "&columns=" + selectColumns;
		strParams += "&orderdir=" + strDesc;
		strParams += "&orderby="+ displayColumn;
		strParams += "&sessid=" + app.session.sessionId;
		strParams += "&espQueryName="+strQueryName;

	app.debugstart(this.name + ".storedquery [listbox]","FORM CONTROLS");
	var strURL = app._root + "service/form/combo/getdata/storedquery.php";
	var strRes =  app.trim(app.get_http(strURL, strParams, true, false, null, null));
	app.debugend(this.name + ".storedquery [listbox]","FORM CONTROLS");
	
	if(strRes!="")
	{
		this._dropdiv.innerHTML = strRes;
		this._htmltable = this._dropdiv.childNodes[0];
	}

	this._dataloaded=true;
	this.comboAutoUpdate=false;
	this.element.value = this._beforeloadingvalue;

}



//-- load data for pick list
function _swfc_listbox_fetchdata()
{
	//this.htmldocument.body.style.cursor = "wait";
	this._beforeloadingvalue = this.element.value;
	var strMand = (this.mandatory)?"1":"0";

	//-- get data from database
	if(this._etype==FC_DBPICKLIST)
	{
		if(this.fetchType==2)
		{ 
			this.invokeStoredQuery(this.storedQueryName, this._unparsedFilter);
			return;
		}

		//-- check table right
		if(this.source.toLowerCase()=="swdata" && lsession.CheckTableRight(this.table,_CAN_BROWSE_TABLEREC,true)!="") 
		{
			this._dropdiv.innerHTML = "";
			this._htmltable = null;
			return false;
		}

		this.element.value = "Loading...";
		
		//var start = new Date();
		if(this.displayColumn=="")this.displayColumn = this.distinctColumn;
	
		var strParams = "dsn=" + this.source;
			strParams += "&mandatory=" + strMand;
			strParams += "&table="+ app.pfu(this.table);
			strParams += "&filter="+ app.pfu(_parse_context_vars(this.filter,true));
			strParams += "&keycol="+ app.pfu(this.distinctColumn);
			strParams += "&textcol="+ app.pfu(this.displayColumn);
			strParams += "&orderdesc=" + app.pfu(this.pickListOrderDesc);

		app.debugstart(this.name + "._fetchdata [listbox]","FORM CONTROLS");
		var strURL = app._root + "service/form/combo/getdata/index.php";
		var strRes =  app.trim(app.get_http(strURL, strParams, true, false, null, null));
		app.debugend(this.name + "._fetchdata [listbox]","FORM CONTROLS");
		if(strRes!="")
		{
			this._dropdiv.innerHTML = strRes;
			this._htmltable = this._dropdiv.childNodes[0];
		}
	}
	else
	{
		//-- XML PICKLIST - get data from a url
		app.debugstart(this.name + "._fetchdata [listbox]","FORM CONTROLS");
		
		this.element.value = "Loading...";
		
		var strURL = _parse_context_vars(this.url);
		var strRes =  app.trim(app.get_http(strURL, strParams, true, false, null, null));
		app.debugend(this.name + "._fetchdata [listbox]","FORM CONTROLS");
		if(strRes!="")
		{
			var oXML = create_xml_dom(strRes);
			if(oXML)
			{
				var arrItems = oXML.getElementsByTagName("item");
				var yLen = arrItems.length;
				for(var x=0;x<yLen;x++)
				{
					var strValue = app.xmlText(arrItems[x])
					this._addoption(strValue, strValue);
				}
			}
		}

		this._dataloaded=true;
		this.comboAutoUpdate=false;
	}

	this.element.value = this._beforeloadingvalue;
}

//--
//-- FORM FLAG METHODS
//--
function _swfc_formflag(oSWFC)
{
	oSWFC.value = 0;
	oSWFC.datainitialised = false;
	oSWFC._setflagvalue = _swfc_formflag_setflagvalue;
	oSWFC._value = _swfc_formflag_value;
	oSWFC._text = _swfc_formflag_value;
	oSWFC._enable = _swfc_formflag_enable;
	oSWFC._readOnly = _swfc_formflag_readOnly;

	oSWFC._arrinputs = new Array();
	oSWFC._arrlabels = new Array();

	var x=0;
	while(1==1)
	{
		var flag = oSWFC.htmldocument.getElementById(oSWFC.name + "_" + x);
		if(flag!=null)
		{
			oSWFC._arrinputs[oSWFC._arrinputs.length++] = flag;

			//-- store label element
			var alabel = oSWFC.htmldocument.getElementById("lbl_" + oSWFC.name + "_" + x);
			oSWFC._arrlabels[oSWFC._arrlabels.length++] = alabel;

		}
		else
		{
			break;
		}
		x++;
	}

	//-- 11.12.12 - 90129 - set default value - if in insert mode
	if(oSWFC.defaultValue!="" && _primary_key=="" && _formmode == "add")
	{ 
		oSWFC.defaultValue = oSWFC.defaultValue-0;
		oSWFC._value(oSWFC.defaultValue,oSWFC.defaultValue,false);
	}
}

function _swfc_formflag_enable(bEnable)
{
	if(bEnable==undefined) return !this.disabled;
	this.disabled = (!bEnable);
	this.enable = bEnable;

	//-- set html element to read only
	this.element.disabled=this.disabled;
	if(!this.disabled)
	{
		this.element.removeAttribute('DISABLED'); 
	}
	else
	{
		this.element.setAttribute("DISABLED","1");
	}

	for (var x=0;x<this._arrinputs.length; x++)
	{
		var aFlag = this._arrinputs[x];
		if(aFlag!=null)
		{		
			aFlag.disabled=this.disabled;
			this._arrlabels[x].disabled=this.disabled;
			if(this.disabled && !app.isIE)
			{
				this._arrlabels[x].style.color = "#B4B4B4";
			}
			else if(!app.isIE)
			{
				this._arrlabels[x].style.color = "#000000";
			}
		}
	}
}

function _swfc_formflag_readOnly(bReadOnly)
{
	if(bReadOnly==undefined) return this.readOnly;
	this.readOnly = bReadOnly;
	if(this.enable)
	{
		for (var x=0;x<this._arrinputs.length; x++)
		{
			var aFlag = this._arrinputs[x];
			if(aFlag!=null)
			{
				aFlag.disabled=this.readOnly;
			}
		}
	}
}


function _swfc_formflag_value(strValue,strFormattedValue,bFromData)
{
	if(strValue==undefined) return this.value;

	this._value_initialised=true;

	if(strValue=="")strValue=0;
	
	if(bFromData)this.datainitialised=true;

	if(strValue=='true')strValue=1;
	else if(strValue=='false')strValue=0;

	this.value = strValue;
	this.text = strValue;
	this.display = strValue;

	//-- set record binding
	if(this.binding!="" && !bFromData)
	{
		//-- only set if we have not need set by data i.e. updateformfromdata
		if(bFromData==undefined)bFromData=false;
		this._form._swdoc._set_data_value(this.value, this.binding, bFromData);
		//alert("set form flag value to "  + this.value + ":"+ this.binding)
	}

	this.value--;
	this.value++;

	//-- set the visual impact i.e check flags
	//-- get child input elements
	for (var x=0;x<this._arrinputs.length; x++)
	{
		var aFlag = this._arrinputs[x];
		var testBit = aFlag.getAttribute("bitvalue");

		testBit--;testBit++;
		if(this.value & testBit)
		{
			aFlag.setAttribute("checked","true");
			aFlag.src='images/controls/cb-checked.png';
		}
		else
		{
			aFlag.setAttribute("checked","false");
			aFlag.src='images/controls/cb.png';
		}
	}
}

//-- called when flag is checked
function _swfc_formflag_setflagvalue(oEv,aDoc)
{
	//-- not enabled so return
	if(this.enable==false || this.readOnly==true)
	{
		return app.stopEvent(oEv);
	}

	//-- add or subtract bit value from control value
	if(this.value=="")this.value=0;
	this.value--;
	this.value++;
	var aFlag = app.ev_source(oEv);

	if(aFlag.tagName=="LABEL")
	{
		var strFor = aFlag.id;
		if(strFor!="")
		{
			strFor = strFor.substring(4);
			var tmpEle = this.htmldocument.getElementById(strFor);
			if(tmpEle.tagName=="IMG") aFlag=tmpEle;
		}
	}

	if(aFlag.tagName=="IMG")
	{
		var intFlag = aFlag.getAttribute("bitvalue")
		intFlag++;intFlag--;
		var bchecked =	aFlag.getAttribute("checked");
		if(bchecked=="false")
		{
			this.value = this.value + intFlag;
		}
		else
		{
			this.value = this.value - intFlag;
		}

		this._value(this.value); //-- wil lset binding if need be

		//-- call associated developer function
		this._executejsevent("OnValueChanged",this.value);
	}
}

//--
//-- SQL TABLE FUNCTIONS 
function _swfc_sqltable(oSWFC)
{
	//-- pointers to conrol divs
	oSWFC._datadiv = oSWFC.htmldocument.getElementById(oSWFC.name + "_data");
	oSWFC._headerdiv = oSWFC.htmldocument.getElementById(oSWFC.name + "_header");
	oSWFC._pagerdiv = oSWFC.htmldocument.getElementById(oSWFC.name + "_pager");
	oSWFC._pagerpagenumspan = oSWFC.htmldocument.getElementById(oSWFC.name + "_pagespan");
	oSWFC._pagerpagenuminput = oSWFC.htmldocument.getElementById(oSWFC.name + "_pageinput");
	oSWFC._datatable = null;

	//-- public properties
	oSWFC.filter = oSWFC.listFilter;
	oSWFC.rawSql = "";
	oSWFC.curSel = -1;
	
	//-- .rowCount now needs to be a method - need to ensure is swjs'd in export
	oSWFC.rowCount = _swfc_sqltable_rowcount; 
	oSWFC._rowcount=_swfc_sqltable_rowcount;

	oSWFC.colCount = 0;
	oSWFC.count = 0;
	oSWFC.selectedCount = 0;

	oSWFC._srcType = 'sql'; //-- sql / php
	oSWFC._phpSrc = ''; //-- url to get data using php
	oSWFC._phpParams = new Array(); //-- if source is a php file then we can use this array to store params we want to send as part of php get

	if(oSWFC._jsoncols)
	{
		oSWFC.colCount = oSWFC._jsoncols.controlInfo.length;
	}
	
	oSWFC.source = oSWFC.sqlSource;

	//-- if we need to reset?
	oSWFC._source = oSWFC.sqlSource;
	oSWFC._table = oSWFC.table;
	oSWFC.bJustAligned = false;
	oSWFC._currentScrollLeft = 0;
	oSWFC._currentScrollTop = 0;


	//- public methods
	oSWFC._filter = _swfc_sqltable_filter;
	oSWFC._rawSql = _swfc_sqltable_rawsql;

	oSWFC.fetchType = 1; //-- standard (2 = StoredQuery)

	oSWFC.invokeStoredQuery = _swfc_sqltable_storedquery;
	oSWFC.InvokeStoredQuery = _swfc_sqltable_storedquery;
	if(oSWFC.storedQuery!="")
	{
		oSWFC.fetchType = 2;
		oSWFC.storedQueryParams = oSWFC.filter;
		oSWFC.storedQueryName =oSWFC.storedQuery;
	}

	oSWFC.Reload = _swfc_sqltable_reload;
	oSWFC.Refresh = _swfc_sqltable_reload;
	oSWFC.EditRecord =_swfc_sqltable_EditRecord;
	oSWFC.CreateRecord =_swfc_sqltable_CreateRecord;
	oSWFC.GetColumnDisplayName =_swfc_sqltable_GetColumnDisplayName;
	oSWFC.GetColumnName =_swfc_sqltable_GetColumnName;
	oSWFC.GetItemText =_swfc_sqltable_GetItemText;
	oSWFC.GetItemTextRaw =_swfc_sqltable_GetItemTextRaw;
	oSWFC.Initialize =_swfc_sqltable_Initialize;
	oSWFC.IsRowChecked =_swfc_sqltable_IsRowChecked;
	oSWFC.IsRowSelected =_swfc_sqltable_IsRowSelected;
	oSWFC.RemoveRow =_swfc_sqltable_RemoveRow;
	oSWFC.Reset =_swfc_sqltable_Reset;
	oSWFC.SetRowChecked =_swfc_sqltable_SetRowChecked;
	oSWFC.SetRowSelected =_swfc_sqltable_SetRowSelected;
	

	//-- private properties
	oSWFC._previewcolumn = "";
	oSWFC._previewlines = 4;
	oSWFC._expandercol = "";
	oSWFC._expandercolseq = "";

	oSWFC._selectedrows = new Array();
	oSWFC._checkedrowsbyid = new Array();

	oSWFC._unparsedFilter = oSWFC.listFilter;
	oSWFC._currrow = null;
	oSWFC._autoLoad = oSWFC.autoLoad;

	oSWFC._limit = ""; 
	oSWFC._fclimit = 200;
	oSWFC._page = 1;
	oSWFC._totalpagecount=0;

	//-- falg that not fetched
	oSWFC._bDataFetched=false;
	oSWFC._NotLoadedAsInvisible = false;
	oSWFC._bFromColumnOrder = false; //-- flag indicating dataload was from a column order change
	oSWFC._hasNoPermissionOnTable = false;

	oSWFC._fatalerror = false;
	oSWFC._fatalerror_counter = 0;

	//-- private methods
	oSWFC._check_rows_aftercolumnorder = _swfc_sqltable_check_rows_aftercolumnorder;

	oSWFC._showhide_pager =	_swfc_sqltable_showhide_pager;
	oSWFC._processing=_swfc_sqltable_processing;
	oSWFC._insertrow=_swfc_sqltable_insertrow;
	oSWFC._RemoveAllRows= _swfc_sqltable_RemoveAllRows;

	oSWFC._setpageposition = _swfc_sqltable_setpageposition;
	oSWFC._pageleft= _swfc_sqltable_pageleft;
	oSWFC._pageright= _swfc_sqltable_pageright;
	oSWFC._pagestart= _swfc_sqltable_pagestart;
	oSWFC._pageend= _swfc_sqltable_pageend;


	oSWFC._match_row_preview=_swfc_sqltable_match_row_preview;
	oSWFC._get_row_from_preview=_swfc_sqltable_get_row_from_preview;

	oSWFC._primarykey_value=_swfc_sqltable_primarykey_value;
	oSWFC._primarykey_name=_swfc_sqltable_primarykey_name;

	oSWFC._resize_data_area = _swfc_sqltable_resize_data_area;
	oSWFC._fetchdata = _swfc_sqltable_fetchdata;
	oSWFC._ondatafetched = _swfc_sqltable_ondatafetched;

	oSWFC._resizingcol = false;
	oSWFC._align = _swfc_sqltable_align;
	oSWFC._scroll = _swfc_sqltable_scroll;

	oSWFC._getcol = _swfc_sqltable_getcol;
	oSWFC._getselectcolumns = _swfc_sqltable_getselectcolumns
	oSWFC._gethiddencolumns = _swfc_sqltable_gethiddencolumns;
	oSWFC._get_colwidths	= _swfc_sqltable_get_colwidths;


	oSWFC._rowclick = _swfc_sqltable_rowclick;
	oSWFC._rowdblclick = _swfc_sqltable_rowdblclick;
	oSWFC._expanderdblclick = _swfc_sqltable_expanderdblclick;
	oSWFC._expanderclick = _swfc_sqltable_expanderclick;


	oSWFC._get_colnum_by_name =_swfc_sqltable_get_colnum_by_name;
	oSWFC._get_colname_by_num =_swfc_sqltable_get_colname_by_num;
	oSWFC._getcoltd = _swfc_sqltable_getcoltd;
	oSWFC._getrowtr = _swfc_sqltable_getrowtr;
	oSWFC._getheadertd = _swfc_sqltable_getheadertd;
	oSWFC._getheadercolumns =_swfc_sqltable_getheadercolumns;

	oSWFC._toggle_row_checked=_swfc_sqltable_toggle_row_checked;
	oSWFC._toggle_row_selected=_swfc_sqltable_toggle_row_selected;

	//-- handle mouse stuff
	oSWFC._track_headercursor = _swfc_sqltable_track_headercusor;
	oSWFC._start_headerresize = _swfc_sqltable_start_headerresize;
	oSWFC._stop_headerresize = _swfc_sqltable_stop_headerresize;
	oSWFC._stop_tableresize_aftertimeout = _swfc_sqltable_stop_tableresize_aftertimeout;
	oSWFC._sortcolumn= _swfc_sqltable_sortcolumn;

	oSWFC.sortDescending=(oSWFC.sortDescending=="false")?false:true;


	oSWFC._create_bespoke_xmlcols = _swfc_sqltable_create_bespoke_xmlcols;
	oSWFC._redraw_columns = _swfc_sqltable_redraw_columns;
}

//-- this is to mimic full client behavior (which may be incorrect)

function _swfc_sqltable_check_rows_aftercolumnorder()
{
	var boolValues = false;
	for(var strKeyValue in this._checkedrowsbyid)
	{
		boolValues = true;
		break;
	}
	if(!boolValues)return;

	var strPriCol = this._primarykey_name(); 
	if(strPriCol=="")return;
	var strTestValue = "";
	var rc = this.rowCount();
	for(var x=0; x<rc;x++)
	{
		if(this._checkedrowsbyid[this.GetItemTextRaw(x,strPriCol)])
		{
			//-- check it but do not trigger events
			this.SetRowChecked(x,true); 
		}
	}
}

function _swfc_sqltable_rowcount()
{
	if(this._NotLoadedAsInvisible)this._fetchdata();

	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	if(oTable==null) return 0;
	return oTable.rows.length;
}

function _swfc_sqltable_setpageposition(oEle)
{
	if(!isNaN(oEle.value) && (oEle.value > this._totalpagecount))
	{
		this._page = oEle.value;
		this.Refresh(false, this._page);
	}
	else
	{
		oEle.value = this._page;
	}
}

function _swfc_sqltable_pagestart(oEle,oEv)
{
	this._page=1;
	this.Refresh(false, this._page);
}
function _swfc_sqltable_pageend(oEle,oEv)
{
	this._page=this._totalpagecount;
	this.Refresh(false, this._page);
}
function _swfc_sqltable_pageleft(oEle,oEv)
{
	if((this._page-1)==0)return;
	this._page--;
	this.Refresh(false, this._page);
}
function _swfc_sqltable_pageright(oEle,oEv)
{
	if((this._page+1)>this._totalpagecount)return;
	this._page++;
	this.Refresh(false, this._page);
}


//-- create bespoke xml for cols (for use in system picklists)
function _swfc_sqltable_create_bespoke_xmlcols(arrColumns, bUseLabels)	
{
	if(bUseLabels==undefined)bUseLabels=true;

	this._jsoncols = {controlInfo:[]};
	var yLen = arrColumns.length;
	for(var x=0;x < yLen;x++)
	{
			this._jsoncols.controlInfo[x] = {};
			this._jsoncols.controlInfo[x].flags = {};
			this._jsoncols.controlInfo[x].properties = {};
			this._jsoncols.controlInfo[x].flags.allowResize = "true";
			this._jsoncols.controlInfo[x].flags.allowSort = "true";
			this._jsoncols.controlInfo[x].flags.hidden = "false";
			this._jsoncols.controlInfo[x].properties.column = app.trim(arrColumns[x]);

			if(bUseLabels)
			{
				this._jsoncols.controlInfo[x].name = app._application_labels[this.table + "." + app.trim(arrColumns[x])];
			}
			else
			{
				this._jsoncols.controlInfo[x].name = arrColumns[x];
			}
			this._jsoncols.controlInfo[x].width = 120;
			this._jsoncols.controlInfo[x].dataColumn = x;
	}
	this._redraw_columns();
	this.colCount = arrColumns.length;
}

function _swfc_sqltable_redraw_columns()	
{
	var arrColumnHeadings = new Array();
	arrColumnHeadings.push("<table cellspacing='0' cellpadding='0' border='0'><tr>");

	if(this._jsoncols)
	{
		var arrCol = this._jsoncols.controlInfo;
		var aCol = null;
		var yLen = arrCol.length;
		for(var x=0;x<yLen;x++)
		{
			aCol = arrCol[x];
			var strText = aCol.name;
			var intWidth= aCol.width;
			var strCol = aCol.properties.column;
			if(strText=="")
			{
				strText= app._application_labels[this.table+"."+ strCol];
			}

			//-- set flags
			var jsonFlags = aCol.flags;
			var bHidden = jsonFlags.hidden;
			var strStyle = (bHidden=="true")?"style='display:none;'":"";
			var bAllowResize = jsonFlags.allowResize;
			var bAllowSort = jsonFlags.allowSort;

			arrColumnHeadings.push("<td class='headertd' " + strStyle + " allowsort='"+bAllowSort+"'  allowresize='"+bAllowResize+"' width='"+intWidth+"px' style='width:"+intWidth+"px;white-space:noWrap;' dbname='"+strCol+"' noWrap><div class='tdvalue' headerpos='"+x+"'  style='width:"+intWidth+"px;white-space:noWrap;'>"+ strText + "</div></td>");	
		}
		arrColumnHeadings.push("<td style='display:none;'><div></div></td></tr>"); //-- last cell is to compensate for scrollbars
	}

	arrColumnHeadings.push("</table>");
	this._headerdiv.innerHTML = arrColumnHeadings.join("");
	this._resize_data_area();
}

//-- public methods
function _swfc_sqltable_GetItemText(nRow,nCol)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();

	if(isNaN(nCol-1))nCol = this._get_colnum_by_name(nCol);

	if(this.rowCount()<1) return "";

	var strVal = "";

	var aTD = this._getcoltd(nRow,nCol)
	if(aTD!=null)	
	{
		strVal=app.eleText(aTD.childNodes[0]);
		return app.trim(strVal);
	}
	return "";

}

function _swfc_sqltable_GetItemTextRaw(nRow,nCol)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();

	if(isNaN(nCol-1))nCol = this._get_colnum_by_name(nCol);

	if(this.rowCount()<1) return "";

	var strVal = "";

	var aTD = this._getcoltd(nRow,nCol)
	if(aTD!=null)	
	{
		//strVal = aTD.getAttribute("dbvalue");
		strVal = app.eleText(aTD.childNodes[1]);
		if(strVal=="_s_")strVal=app.eleText(aTD.childNodes[0]);
	}
	return app.trim(strVal);
}

function _swfc_sqltable_EditRecord(nRow,callback)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();

	//-- get primaryKey for the row - if there is none do not process
	if(nRow==undefined)nRow= this.curSel;
	if(nRow==-1) return;

	var strKeyValue = this._primarykey_value();
	
	if(strKeyValue=="") return;

	if(this.editRecordForm=="")
	{
		//-- get form from table setting in ddf
		this.editRecordForm = pDDTABLES[this.table].editform;
	}

	var strParams = "fromsqllist=1";
	var swfc = this;
	_open_control_form(this.editRecordForm,"edit",strKeyValue, strParams,function(res)
	{
		swfc.Reload(false);
		if(callback)
		{
			callback(res);
		}
	});
	
}

function _swfc_sqltable_CreateRecord(callback)
{
	if(this.addRecordForm=="")
	{
		//-- get form from table setting in ddf
		this.addRecordForm = pDDTABLES[this.table].addform;
	}

	var strParams = "fromsqllist=1";
	var swfc = this;
	_open_control_form(this.addRecordForm,"add","", strParams,function(res)
	{
		swfc.Reload(false);
		if(callback)
		{
			callback(res);
		}
	});
}

function _swfc_sqltable_GetColumnDisplayName(nCol)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();

	if(isNaN(nCol-1))nCol = this._get_colnum_by_name(nCol);

	var aCol = this._getcol(nCol);
	if(aCol==null)return "";

	return aCol.text;
}

function _swfc_sqltable_GetColumnName(nCol)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();

	if(isNaN(nCol-1))nCol = this._get_colnum_by_name(nCol);
	nCol++;	nCol--;
	return this._get_colname_by_num(nCol);
}

//-- not sure what this does
function _swfc_sqltable_Initialize(){}

function _swfc_sqltable_IsRowChecked(nRow)
{
	var aRow = this._getrowtr(nRow)
	if(aRow!=null)
	{
		return (aRow.getAttribute("checked")=="1");
	}
	return false;
}

function _swfc_sqltable_IsRowSelected(nRow)
{
	var aRow = this._getrowtr(nRow)
	if(aRow!=null)
	{
		return (aRow.getAttribute("selected")=="1");
	}
	return false;
}

function _swfc_sqltable_RemoveRow(nRow)
{
	var aRow = this._getrowtr(nRow)
	if(aRow!=null)
	{
		aRow.parentNode.removeChild(aRow);
		return true;
	}
	return false;
}

function _swfc_sqltable_RemoveAllRows()
{
	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	if(oTable!=null)
	{
		while(oTable.rows.length>0)
		{
			var aRow = oTable.rows[oTable.rows.length-1];
			aRow.parentNode.removeChild(aRow);
		}
		this.rowCount(oTable.rows.length); 
		return true;
	}
	return false;
}


//-- not sure what this does
function _swfc_sqltable_Reset()
{
	this._RemoveAllRows();
}

function _swfc_sqltable_SetRowChecked(nRow, bChecked, bRunControlOnCheckedMethod)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();

	var aRow = this._getrowtr(nRow)
	if(aRow!=null)
	{
		if(bRunControlOnCheckedMethod==undefined)bRunControlOnCheckedMethod=true;
		this._toggle_row_checked(aRow, bChecked,bRunControlOnCheckedMethod);
		return true;
	}
	return false;
}

function _swfc_sqltable_SetRowSelected(nRow, bSelected, bKeepSelection)
{
	//-- method is being called but data has not been loaded as it is invisible - so load it
	if(this._NotLoadedAsInvisible)this._fetchdata();
	
	var aRow = this._getrowtr(nRow)
	if(aRow!=null)
	{
		if(bSelected==undefined)bSelected=true;
		if(bKeepSelection==undefined)bKeepSelection=false;

		this._toggle_row_selected(aRow, bSelected, bKeepSelection);
		return true;
	}
	return false;
}


//-- private methods for use by webclient
function _swfc_sqltable_rawsql(strRawSQL)
{
	if(strRawSQL==undefined) return this._rawSQL;
	
	this.rawSQL = strRawSQL; //-- parse filter
	this.rawSql = strRawSQL;
	this._fetchdata();

}

function _swfc_sqltable_resize_data_area()
{
	if(this._datadiv==null) return;
	if(this.tabInvisible || !this.visible) return;

	var intHeight = this.element.offsetHeight;
	var intDataHeight = intHeight - this._headerdiv.offsetHeight - this._pagerdiv.offsetHeight;
	if(intDataHeight>2)
	{
		this._datadiv.style.height = intDataHeight;
	}

}

//-- return or set filter
function _swfc_sqltable_filter(strFilter,bFromFormLoad, intPage)
{
	if(bFromFormLoad==undefined) bFromFormLoad = false;
	if(strFilter==undefined) return this.listFilter;

	if(intPage==undefined)this._page=1;

	var strTestFilter = _parse_context_vars(strFilter,true);

	if(this.filter==strTestFilter && bFromFormLoad && this._bDataFetched) return;

	this._unparsedFilter = strFilter;
	this.listFilter = strTestFilter; //_parse_context_vars(strFilter,true); //-- parsed filter
	this.filter = this.listFilter;

	//-- auto load is off and not manually called so skip
	if(bFromFormLoad && !this._autoLoad)return false;

	//-- do not process a data fetch if it is invisible and if it is from a form load
	if(this.visible==false || this.tabInvisible)
	{
		this._NotLoadedAsInvisible = true; 
		return;
	}	

	this._fetchdata();
}


//-- 2012.05.10 - storedquery to get data
function _swfc_sqltable_storedquery(strQueryName, strParams)
{
	this.fetchType = 2; //-- remote query
	this.storedQueryName = strQueryName;
	this.storedQueryParams = strParams;


	var strCB = (this.hasCheckbox)?"1":"0";
	var strOrderByCol = "";
	var strOrder = "";
	if((this.sortColumn!=-1) && ((this.colCount>this.sortColumn)))
	{
		strOrder = (this.sortDescending)?"DESC":"ASC";
		strOrderByCol = this._getcol(this.sortColumn).dbcolumn;
	}

	strParams = _parse_context_vars(strParams,true);
	if(strParams!="")strParams+="&";
	strParams += "columns=" + this._getselectcolumns();
	strParams += "&hiddencolumns=" + this._gethiddencolumns();
	strParams += "&columnwidths=" + this._gethiddencolumns();
	strParams += "&orderby="+strOrderByCol;
	strParams += "&orderdir="+strOrder;
	strParams += "&table="+ this.table;
	strParams += "&dsn="+ this.source;
	strParams += "&sessid=" + app.session.sessionId;
	strParams += "&espQueryName="+strQueryName;
	strParams += "&_limit=" + this._limit;
	strParams += "&_fclimit=" + this._fclimit;
	strParams += "&_page=" + this._page;
	strParams += "&checkbox=" + strCB;

	app.debugstart(this.name + ".invokeStoredQuery [sqltable]","FORM CONTROLS");
	var strURL = app.webroot + "/webclient/service/form/sqllistdata/storedquery.php";
	this._ondatafetched(app.get_http(strURL, strParams, true, false, null, null));
	app.debugend(this.name + ".invokeStoredQuery [sqltable]","FORM CONTROLS");
	return true;
}


//-- reload
function _swfc_sqltable_reload(bFromFormLoad, intPage)
{
	this._filter(this._unparsedFilter,bFromFormLoad, intPage);
	return true;
}


//-- private load actual data
function _swfc_sqltable_fetchdata()
{
	//-- 2012.05.10 - if using remote query
	if(this.fetchType==2)
	{
		this._NotLoadedAsInvisible = false; 
		this.invokeStoredQuery(this.storedQueryName,this._unparsedFilter);
		return;
	}


	var strCols = this._getselectcolumns();
	var strHiddenCols = this._gethiddencolumns();
	var strColWidths = this._get_colwidths();

	//-- using sql
	if(strCols=="") return;
	if(this.sqlSource=="") return;
	if(this.table=="") return;

	var strCB = (this.hasCheckbox)?"1":"0";
	var strParams = "dsn="+ app.pfu(this.source);

	//var start = new Date();
	if(this.rawSql!="")
	{
		strParams += "&rawsql="+ app.pfu(this.rawSql);
		strParams += "&table="+ app.pfu(this.table);
		strParams += "&_limit=" + this._limit;
		strParams += "&_fclimit=" + this._fclimit;
		strParams += "&_page=" + this._page;
	}
	else
	{
		//-- we already no does nto have permission so exit
		if(this._hasNoPermissionOnTable)
		{
			this._NotLoadedAsInvisible = false; 
			this._ondatafetched("");
			return false;
		}

		//-- check table right
		if(this.source.toLowerCase()=="swdata" && lsession.CheckTableRight(this.table,_CAN_BROWSE_TABLEREC,true)!="") 
		{
			//-- set to has been loaded
			this._hasNoPermissionOnTable = true;
			this._NotLoadedAsInvisible = false; 
			this._ondatafetched("");
			return false;
		}

		strParams += "&table="+ app.pfu(this.table);
		strParams += "&filter="+ app.pfu(this.filter);
		strParams += "&columns=" + strCols;
		strParams += "&hiddencolumns=" + strHiddenCols;
		strParams += "&columnwidths=" + strColWidths;

		strParams += "&colcount=" + this.colCount;
		strParams += "&previewcol=" + this._previewcolumn;
		strParams += "&previewlines=" + this._previewlines;
		strParams += "&expandercol=" + this._expandercol;
		strParams += "&expandercolseq=" + this._expandercolseq;
		strParams += "&_limit=" + this._limit;
		strParams += "&_fclimit=" + this._fclimit;
		strParams += "&_page=" + this._page;


		strParams += "&checkbox=" + strCB;
		if((this.sortColumn!=-1) && ((this.colCount>this.sortColumn)))
		{
			var strOrder = (this.sortDescending)?"DESC":"ASC";

			//-- in full client can specify sort col that does not exist 
			strParams += "&orderby="  + this._getcol(this.sortColumn).dbcolumn;
			strParams += "&orderdir=" + strOrder;
		}
	}

	//-- has not deemed to be in a loaded state 
	this._NotLoadedAsInvisible = false; 

	//-- 28.02.2011 - get table data by calling php url that will return resulting rows
	strParams += "&_sourcetype=" + this._srcType;
	if(this._srcType == 'php')
	{
		strParams += "&_sourceinclude=" + this._phpSrc;
		for(strParamName in this._phpParams)
		{
			if(strParams != "")strParams +="&" 
			strParams += strParamName +"="+ app.pfu(this._phpParams[strParamName]);
		}
	}
	app.debugstart(this.name + "._fetchdata [sqltable]","FORM CONTROLS");
	var strURL = app.webroot + "/webclient/service/form/sqllistdata/index.php";
	this._ondatafetched(app.get_http(strURL, strParams, true, false, null, null));
}

function _swfc_sqltable_ondatafetched(strTableData)
{
	app.debugend(this.name + "._fetchdata [sqltable]","FORM CONTROLS");
	this._currentScrollLeft = -1;
	this._currentScrollTop = 0;
	//-- data comes back as rowcount:page#:totalpages:strtablerows
	this._currrow = null;
	this._selectedrows = new Array();

	//-- 91855 - stored queries sometimes return 0 when they have done an exit - so jsut change to empty table 
	if(app.trim(strTableData).indexOf("<?")===0)
	{
		strTableData =	"<table cellspacing='0' cellpadding='0' border='0' rc='0' pc='0' pn='0'></table>";
	}

	this._datadiv.innerHTML = strTableData;
	strTableData = null;	

	//-- set row count
	this.rowCount(0);
	this.count = 0;
	this.selectedCount = 0;

	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	this._datatable	= oTable;
	if(oTable!=null && oTable.rows)	
	{
		this.rowCount(oTable.rows.length);
		this.count = this.rowCount();

		//--
		this._fullrowcount = this._datatable.getAttribute("rc");
		this._totalpagecount=this._datatable.getAttribute("pc");
		app.setElementText(this._pagerpagenumspan,this._totalpagecount); //-- total page count

		this._pagerpagenuminput.value = this._datatable.getAttribute("pn"); //-- c
		this._showhide_pager((this._fullrowcount>this._fclimit));

	}
	this.curSel=-1;
	this._bDataFetched=true;
	this._align(); 

	if(!this._bFromColumnOrder)this._checkedrowsbyid=new Array(); //-- clear record checked cols
}

//-- show hide pager
function _swfc_sqltable_showhide_pager(bShow)
{
	this._pagerdiv.style.display=(bShow)?"block":"none";
	this._resize_data_area();
}

//-- get comma list of hidden col names
function _swfc_sqltable_gethiddencolumns()
{
	if(this._jsoncols==null)return "";
	var strCols = ""
	var arrCols = this._jsoncols.controlInfo;
	for (var x = 0; x <arrCols.length ;x++ )
	{
		if(arrCols[x].flags.hidden=="true")
		{
			if(arrCols[x].properties)
			{
				if(strCols !="") strCols +=","
				strCols += arrCols[x].properties.column;
			}
		}
	}
	return strCols;
}

function _swfc_sqltable_getselectcolumns()
{
	if(this._jsoncols==null)return "";
	var strSelect = ""

	var arrCols = this._jsoncols.controlInfo;
	for (var x = 0; x <arrCols.length ;x++ )
	{
		if(arrCols[x].properties)
		{
			if(strSelect !="") strSelect +=","
			strSelect += arrCols[x].properties.column;
		}
	}

	return strSelect;
}


function _swfc_sqltable_getcol(nPos)
{
	if(this._jsoncols==null)return -1;

	var aCol = this._jsoncols.controlInfo[nPos];
	if(aCol==undefined || aCol==null) 
	{
		return null;
	}

	var strText =aCol.name;
	var intWidth= aCol.width;
	var strCol = aCol.properties.column;
	if(strText=="")
	{
		strText= app._application_labels[this.table+"."+ strCol]
	}

	var colNode=new Object();
	colNode.text = strText;
	colNode.width = new Number(intWidth);
	colNode.dbcolumn = strCol;
	return colNode;
}

//-- header column click
function _swfc_sqltable_sortcolumn(oEv,event)
{
	if(this._resizingcol)return;
	if(this.rawSql!="")return; //-- cannot sort raw sql

	//-- 88424 do not action if disabled
	if(this.disabled)return false;

	var orderTD = app.ev_source(oEv);
	if(orderTD.tagName=="DIV")orderTD = orderTD.parentNode;
	
	if(orderTD.tagName=="TD")
	{
		//-- are we allowed to sort by this column
		var bAllowSort = orderTD.getAttribute("allowsort");
		if(bAllowSort=="false")return;

		//-- reset header styles
		var arrCols = this._getheadercolumns();
		var yLen = arrCols.length;
		for(var x=0;x<yLen;x++)
		{
			arrCols[x].className = "headertd";
		}

		this.sortColumn = orderTD.cellIndex;
		this.sortDescending = (this.sortDescending==true)?false:true;
		var strOrder = (this.sortDescending==false)?"ASC":"DESC";

		//-- set class
		orderTD.className="headertd-" + strOrder;

		//-- always refresh
		this._bFromColumnOrder = true;
		this.Refresh();
		this._check_rows_aftercolumnorder();
		this._bFromColumnOrder = false;

		//-- call associated developer function
		this._executejsevent("OnHeaderItemClicked",strOrder,orderTD.cellIndex);
	}
}

function _swfc_sqltable_toggle_row_checked(aRow, bChecked, bFromJSCode)
{
	if(bFromJSCode==undefined)bFromJSCode=false;

	if(!bFromJSCode)
	{
		//-- 88424 do not action if disabled
		if(this.disabled)return false;
	}


	if(bChecked==undefined)
	{
		var strVal = aRow.getAttribute("checked");
		if(strVal=="1")
		{
			bChecked = false;
		}
		else
		{
			bChecked = true;
		}
	}

	var strVal =(bChecked)?"1":"0";
	aRow.setAttribute("checked",strVal)

	if(bChecked)
	{
		aRow.cells[0].childNodes[0].className='sl-checkbox-checked';
	}
	else
	{
		aRow.cells[0].childNodes[0].className='sl-checkbox';
	}

	//-- remember if this row has been checked or not - so can re-select if filter/order changes
	var strKeyValue = this._primarykey_value(aRow.rowIndex);
	if(strKeyValue!="")	this._checkedrowsbyid[strKeyValue] = bChecked;

	//-- call associated developer function only if actioned by user click
	if(!bFromJSCode)
	{
		if(!this._fatalerror)
		{
			this._executejsevent("OnItemChecked",aRow.rowIndex,bChecked);
		}
		//else
		//{
		//	this._fatalerror = false;
		//}
	}
}

function _swfc_sqltable_get_row_from_preview(aRow)
{
	if(this._previewcolumn!="")
	{
		var iRowPos = aRow.rowIndex;
		
		if(aRow.getAttribute("type")=="prev")
		{
			iRowPos--;
		}
		aRow = aRow.parentNode.rows[iRowPos];
	}
	return	aRow;
}


function _swfc_sqltable_match_row_preview(aRow)
{
	var prevRow = null;
	if(aRow.getAttribute("type")=="prev")
	{
		//-- we need to highlight prev sibling
		prevRow = aRow;
		aRow = aRow.parentNode.rows[prevRow.rowIndex-1];
	}
	else if(this._previewcolumn!="")
	{
		//-- need to also high next sibling
		prevRow = aRow.parentNode.rows[aRow.rowIndex+1];
	}

	//-- set bgcolour and text to same as aRow
	if(prevRow!=null)
	{
		prevRow.style.color = aRow.style.color;
		prevRow.style.backgroundColor=aRow.style.backgroundColor;
	}

}

function _swfc_sqltable_toggle_row_selected(aRow, bSelected, bKeepSelected)
{
	if(bSelected==undefined)bSelected=false;
	if(bKeepSelected==undefined || bSelected==false)bKeepSelected=false;

	aRow = this._get_row_from_preview(aRow);

	//-- check if mutli select
	if(bKeepSelected)
	{
		//-- has been called from user action - i.e. clicked on row
		if(bSelected!=-1) this._selectedrows[aRow.rowIndex]= bSelected;

		if(this._selectedrows[aRow.rowIndex])
		{
			//-- clicking on hirow so lo lite
			aRow.style.backgroundColor = "";
			aRow.style.color = "";
			this._selectedrows[aRow.rowIndex] = false;
			this._currrow = null;
			this.curSel = -1;
			aRow.setAttribute("selected","0");
		}
		else
		{
			//-- highlight row
			if(this._previewcolumn)
			{
				aRow.style.backgroundColor = "#efefef";
			}
			else
			{
				aRow.style.backgroundColor = "navy";
				aRow.style.color = "#ffffff";
			}

			aRow.setAttribute("selected","1");	
			//-- set last row
			this._currrow = aRow;
			this._selectedrows[aRow.rowIndex] = true;
		}
	}
	else
	{
		//-- clear selected rows
		for(iRowIndex in this._selectedrows)
		{
			if(aRow.parentNode.rows[iRowIndex]==undefined)continue;

			aRow.parentNode.rows[iRowIndex].style.backgroundColor = "";
			aRow.parentNode.rows[iRowIndex].style.color = "";
			aRow.parentNode.rows[iRowIndex].setAttribute("selected","0");
			this._match_row_preview(aRow.parentNode.rows[iRowIndex]);
		}
		this._selectedrows = new Array();
		this._currrow = null;
		this.curSel = -1;

		if(bSelected==-1 || bSelected==true)
		{
			//-- highlight single row
			if(this._previewcolumn)
			{
				aRow.style.backgroundColor = "#efefef";
			}
			else
			{
				aRow.style.backgroundColor = "navy";
				aRow.style.color = "#ffffff";
			}

			aRow.setAttribute("selected","1");
	
			//-- set last row
			this._currrow = aRow;
			this._selectedrows[aRow.rowIndex] = true;

			this.curSel = aRow.rowIndex;
		}
	}
	
	this.selectedCount=0;
	for(strIndex in this._selectedrows)
	{
		if(this._selectedrows[strIndex ])		this.selectedCount++;
	}


	this._match_row_preview(aRow);

	//-- call associated developer function
	if(!this._fatalerror)
	{
		this._executejsevent("OnItemSelected",this.curSel,aRow);
	}
	else
	{
		this._fatalerror_counter++;
		if(this._fatalerror_counter>100)
		{
			this._fatalerror_counter=0;
			alert("This sql table appears to be stuck in a loop. This is most likely due to a missing column that is being referenced by swjs.\n\nPlease contact your Administrator.")
		}
		this._fatalerror = false;
	}
}

//-- NWJ - this function is not worknig at the moment - do not use
//-- add a row and insert formatted data from array
function _swfc_sqltable_insertrow(arrData,minusLen,strRowID)
{
	if(minusLen==undefined)minusLen=0;
	if(strRowID==undefined)strRowID="";
	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	if(oTable==null)
	{	
		var strColGroup = "<colgroup>";
		for(var x=0; x <= (this.colCount - minusLen);x++)
		{
			strColGroup += "<col/>";
		}
		strColGroup += "</colgroup>";
		//-- create table
		var strTable = "<table cellspacing='0' cellpadding='0' border='0'>"+strColGroup+"</table>";
		this._datadiv.innerHTML = strTable;
		oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	}
	//-- add row to table
	var strAdjustStyle = "";
	var strDataRow ="";
	var aRow = oTable.insertRow(oTable.rows.length);

	aRow.setAttribute('rowid',strRowID)
	for(var x=0; x <= (this.colCount - minusLen);x++)
	{
		//-- set style if a checkbox list
		strAdjustStyle = "tdvalue"
		if(this._hascheckbox && x==0)
		{	strAdjustStyle = "class='sl-checkbox'";}
		else
		{	strAdjustStyle = "tdvalue";}


		var cell = aRow.insertCell(x);
		cell.setAttribute("nowrap","true");
		//cell.setAttribute("dbvalue","_s_")
		cell.className =  'datatd';
		cell.innerHTML = "<div class='"+strAdjustStyle+"'></div><div style='display:none;'>_s_</div>";
		app.setElementText(cell.childNodes[0],arrData[x])

	}

	this._align();

	//-- add row events
	app.addEvent(aRow,"click",_swfc_sqltable_rowclick);
	app.addEvent(aRow,"dblclick",_swfc_sqltable_rowdblclick);

	this.rowCount(oTable.rows.length);

	return aRow;
}



//--
//-- row selection
function _swfc_sqltable_rowclick(aRow,oEv)
{
	var swfc  = this;
	if(this.tagName!=undefined)
	{
		//-- have come from row with added event (see _insertrow)
		aRow = this;
		swfc = aRow.parentNode.parentNode.parentNode.parentNode.swfc;
	}

	//-- 88424 do not action if disabled
	if(swfc.disabled)return false;

	//-- have they checked it
	if(swfc.hasCheckbox && oEv!=undefined)
	{
		//-- see if clicked on checkbox
		var arrMouse = app.findMousePos(oEv);
		var eLeft = app.eleLeft(aRow);
		var iStart = (eLeft + 5);
		var iEnd = (eLeft + 15);
		if(arrMouse[0]>iStart && arrMouse[0]<iEnd)
		{
			swfc._toggle_row_checked(aRow)
			//-- exit
			return;
		}
	}


	if(oEv==undefined)
	{
		oEv = new Object()
		oEv.ctrlKey = false;
	}
	

	//-- not checked so select row
	swfc._toggle_row_selected(aRow, -1, (swfc.selectionMode==1 && oEv.ctrlKey))
}

function _swfc_sqltable_expanderclick(aRow,oEv)
{
	var swfc  = this;
	ret = swfc._executejsevent("OnExpanderClicked",aRow);
}


function _swfc_sqltable_expanderdblclick(aRow,oEv)
{
	//-- if row is expanded hen collapse
	var iExpanded = aRow.getAttribute('expanded');
	if(iExpanded==null)iExpanded=1;
	
	var swfc  = this;
	ret = swfc._executejsevent("OnExpanderDblClicked",aRow);
	if(ret==false) return false;

	var yLen = aRow.parentNode.rows.length;
	var cellLen = 0;
	var aTable = aRow.parentNode;

	if(iExpanded==1)
	{
		//-- collapse
		var nextRow = null;
		var currI = aRow.rowIndex;
		for(var x=currI+1;x<yLen;x++)
		{
			nextRow = aTable.rows[x];
			if(nextRow!=undefined)
			{
				if(nextRow.getAttribute("type")=="expander")break;				
				nextRow.style.display="none";
				//-- hide cells
				//cellLen = nextRow.cells.length;
				//for(var y=0;y<cellLen;y++)
				//{
				//	nextRow.cells[y].style.display="none";
				//}
			}
		}
		aRow.setAttribute('expanded',0);
	}
	else
	{
		//-- expand
		var nextRow = null;
		var currI = aRow.rowIndex;
		for(var x=currI+1;x<yLen;x++)
		{
			nextRow = aTable.rows[x];
			if(nextRow!=undefined)
			{
				if(nextRow.getAttribute("type")=="expander")break;
				nextRow.style.display="";
				//-- show cells
				//cellLen = nextRow.cells.length;
				//for(var y=0;y<cellLen;y++)
				//{
			//		nextRow.cells[y].style.display="";
			//	}
			}
		}

		aRow.setAttribute('expanded',1);
	}
}

function _swfc_sqltable_rowdblclick(aRow,oEv)
{
	var swfc  = this;
	if(this.tagName!=undefined)
	{
		//-- have come from row with added event (see _insertrow)
		aRow = this;
		swfc = aRow.parentNode.parentNode.parentNode.parentNode.swfc;
	}

	//-- 88424 do not action if disabled
	if(swfc.disabled)return false;

	aRow = swfc._get_row_from_preview(aRow);

	//-- get column that was clicked
	var nCol=0;
	var ret = true;	

	//-- call associated developer function
	swfc.curSel = aRow.rowIndex;

	if(swfc.curSel>-1)
	{
		ret = swfc._executejsevent("OnItemDoubleClicked",swfc.curSel,nCol);
	}

	if(ret==true)
	{
		//-- if filelist then open file
		if(swfc._openfile!=undefined)
		{
			swfc._openfile(swfc.curSel);
		}
		else
		{
			//-- open edit form
			if(swfc.editRecordForm!="")
			{

				var origRowPos =  swfc.curSel;
				swfc.EditRecord(swfc.curSel, function(res)
				{
					//-- call on row selected
					if(this.rowCount()< (origRowPos-1))origRowPos=0;
					this.SetRowSelected(origRowPos);
				});
			}
		}
	}
}

//-- return primary key value or ""
function _swfc_sqltable_primarykey_value(intOverrideRowNum)
{
	if(this.curSel==-1 && intOverrideRowNum==undefined) return "";
	
	var tempNum = this.curSel;
	if(intOverrideRowNum!=undefined)this.curSel=intOverrideRowNum;
	var arrCols = this._jsoncols.controlInfo;
	var yLen = arrCols.length;
	for(var x=0;x<yLen;x++)
	{
		var aCol = this._getcol(x);
		if(pDDTABLES[this.table] && (pDDTABLES[this.table].PrimaryKey.toLowerCase() == aCol.dbcolumn.toLowerCase()) )
		{
			//-- our key col so get value
			var strKeyValue = this.GetItemTextRaw(this.curSel,pDDTABLES[this.table].PrimaryKey)
			this.curSel = tempNum;
			return strKeyValue;
		}
	}
	this.curSel = tempNum;
	return "";
}


//-- return primary key name or ""
function _swfc_sqltable_primarykey_name()
{
	var arrCols = this._jsoncols.controlInfo;
	var yLen = arrCols.length;
	for(var x=0;x<yLen;x++)
	{
		var aCol = this._getcol(x);
		if(pDDTABLES[this.table] && pDDTABLES[this.table].PrimaryKey.toLowerCase() == aCol.dbcolumn.toLowerCase())
		{
			//-- our key name
			return aCol.dbcolumn;
		}
	}
	return "";
}



function _swfc_sqltable_get_colwidths()
{
	var strWidth = "";
	var oHeadeTable = app.get_parent_child_by_tag(this._headerdiv,"TABLE");//.childNodes[0];
	var yLen = oHeadeTable.rows[0].cells.length-1;
	var tableCells = oHeadeTable.rows[0].cells; 
	for(var x=0;x<yLen;x++)
	{
		if(strWidth != "")strWidth += ",";
		strWidth += tableCells[x].offsetWidth;
	}

	return strWidth;
}

//--
//-- table sizing (headers and data alignment)
function _swfc_sqltable_align(bSkipAlign)
{
	//-- if no visible do not align
	if(this.tabInvisible)return;

	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	var oHeadeTable = app.get_parent_child_by_tag(this._headerdiv,"TABLE");//.childNodes[0];

	//-- set height of data div
	if(this.element.offsetHeight>0)
	{
		this._resize_data_area();
		//this._datadiv.style.height = this.element.offsetHeight - this._headerdiv.offsetHeight - this._pagerdiv.offsetHeight;
	}

	//-- set scroll cell display none
	var lastCellPos = oHeadeTable.rows[0].cells.length-1;
	if(lastCellPos==-1)return;
	var lastCell = oHeadeTable.rows[0].cells[lastCellPos];
	lastCell.style.display='none';
	this._lastcell = lastCell;
	
	
	//-- store current scroll pos
	if(this._currentScrollLeft==-1)
	{	
		//-- data has just been fetched
		this._datadiv.scrollTop  = 0;
		this._datadiv.scrollLeft = 0;
		this._currentScrollLeft=0;
		this._currentScrollTop=0;
		this.bJustAligned=false;
	}
	else
	{
		this.bJustAligned=true;
		this._currentScrollTop = this._datadiv.scrollTop
		this._currentScrollLeft = this._datadiv.scrollLeft;
	}

	//-- resize data table
	if(oTable!=undefined)
	{
		oTable.style.width = oHeadeTable.offsetWidth;

		//--
		//-- oly align if asked to
		if(!app.isIE)bSkipAlign=false; //-- firefox and oher have to always align
		if(bSkipAlign==undefined)bSkipAlign=false;
		
		var iTableWidth= 0;

		//-- now align td widths		
		var colGroup = app.get_parent_child_by_tag(oTable, "COLGROUP");
		if(colGroup==null) 
		{
			this._bcodescroll = false;
			return;
		}

		if(!bSkipAlign)
		{
			var lnopx = app.noPx;
			var hTD;
			var dTD;
			var iTDW = 0;
			var useRow = 0;
			if(oHeadeTable.rows[0].getAttribute("type")=="expander")useRow=1;

			var iClen = oHeadeTable.rows[useRow].cells.length-1;
			for(var x=0;x<iClen;x++)
			{	
				hTD = oHeadeTable.rows[useRow].cells[x];
				dTD = colGroup.childNodes[x];
				if(dTD==undefined)break;

				if(hTD.style.display=='none')
				{
					dTD.style.display='none';
					dTD.setAttribute("width",hTD.offsetWidth);
					dTD.style.width = hTD.offsetWidth;
				}
				else 
				{	
					iTDW = (lnopx(hTD.style.width) > hTD.offsetWidth)?lnopx(hTD.style.width):hTD.offsetWidth;
					iTableWidth += iTDW;
					dTD.setAttribute("width",iTDW);
					dTD.style.width = iTDW;
				}
			}

			oTable.style.width = iTableWidth;
		}

		if(!app.isSafari && !app.isChrome)
		{
			//-- if we have scrollbars make last header col bigger (to compensate for scrollbar 
			if(this._datadiv.clientWidth < this._headerdiv.clientWidth)
			{
				//-- headerdiv table must be fixed layout in order for this to work
				lastCell.style.display='block';
				try
				{
					lastCell.childNodes[0].style.width = this._headerdiv.clientWidth-this._datadiv.clientWidth;
				}
				catch (e)
				{
				}
				
				lastCell.style.width= this._headerdiv.clientWidth-this._datadiv.clientWidth;
				lastCell.setAttribute("width",this._headerdiv.clientWidth-this._datadiv.clientWidth);
			}

			//-- adjust scrolling after drawn
			this._headerdiv.scrollLeft = this._datadiv.scrollLeft;
			//setTimeout('__aligntablescrolling("'+this.name+'","'+this._form._name+'")',10);
		}
		else
		{
			oTable.style.display="none";
			__arr_tables[this.name] = this;
			setTimeout('__showsafaritable("'+this.name+'","'+this._form._name+'")',10);
		}
	}//-- otable != undfined
}

function __aligntablescrolling(eName,frmName)
{
	//-- if we had scrolled anf then refrshed we need to move scroll bar again
	var oe = document[frmName][eName];
	if(oe)
	{
		
		oe._datadiv.scrollTop = oe._currentScrollTop;
		oe._datadiv.scrollLeft = oe._currentScrollLeft;
		oe._headerdiv.scrollLeft = oe._datadiv.scrollLeft;
		//oe._bcodescroll = false;
	}
}


var __arr_tables = new Array();
function __showsafaritable(eName,frmName)
{
	var oe=__arr_tables[eName];
	if(oe==undefined)oe = document[frmName][eName];
	if(oe)
	{
		var oTable = app.get_parent_child_by_tag(oe._datadiv,"TABLE");
		oTable.style.display="block";

		var lastCell = oe._lastcell;

		//-- if we have scrollbars make last header col bigger (to compensate for scrollbar 
		if(oe._datadiv.clientWidth < oe._headerdiv.clientWidth)
		{
			//-- headerdiv table must be fixed layout in order for this to work
			lastCell.style.display='block';
			try
			{
				lastCell.childNodes[0].style.width = oe._headerdiv.clientWidth-oe._datadiv.clientWidth;
			}
			catch (e)
			{
			}
	
			lastCell.style.width= oe._headerdiv.clientWidth-oe._datadiv.clientWidth;
			lastCell.setAttribute("width",oe._headerdiv.clientWidth-oe._datadiv.clientWidth);
		}
		//-- adjust scrolling after drawn
		oe._datadiv.scrollTop = oe._currentScrollTop;
		oe._datadiv.scrollLeft = oe._currentScrollLeft;
		oe._headerdiv.scrollLeft = oe._datadiv.scrollLeft;
	}
}

function _swfc_sqltable_track_headercusor(oEv,aDoc)
{
	if(this._resizingcol && this._resizetddiv!=null)
	{
	}
	else
	{
		//-- check if we have scrolled - if so adjust
		var iAdjust = this._datadiv.scrollLeft;
		try
		{
			var currTableResizeTD = app.ev_source(oEv);
			if(currTableResizeTD.tagName=="TD")currTableResizeTD=currTableResizeTD.childNodes[0];

			var iDiff= (app.eleLeft(currTableResizeTD) + currTableResizeTD.offsetWidth) - (app.findMousePos(oEv)[0] + iAdjust) ;
			var strInfo = (app.eleLeft(currTableResizeTD) + currTableResizeTD.offsetWidth) +":"+ (app.findMousePos(oEv)[0] + iAdjust);
			//document.mainform.tb_updatetext._value(strInfo +":"+iDiff)
			var boolOk = false;
			if(app.isIE)
			{
				boolOk=(iDiff>2 && iDiff<9);
			}
			else
			{
				boolOk=(iDiff>-6 && iDiff<-2);
			}


			if(boolOk)
			{
				this._resizetddiv = currTableResizeTD;
				this._canresizecol =true;
				if(currTableResizeTD.style.cursor!="col-resize")
				{
					currTableResizeTD.style.cursor="col-resize";
					currTableResizeTD.parentNode.parentNode.style.cursor="col-resize";
					currTableResizeTD.parentNode.parentNode.parentNode.style.cursor="col-resize";
				}
			}
			else
			{
				this._canresizecol =false;
				if(currTableResizeTD.style.cursor!="default")
				{
					currTableResizeTD.style.cursor="default";
					currTableResizeTD.parentNode.parentNode.style.cursor="default";
					currTableResizeTD.parentNode.parentNode.parentNode.style.cursor="default";
				}
			}			

		}
		catch (e)
		{
		}
	}
}
function _swfc_sqltable_start_headerresize(oEv,aDoc)
{
	if(this._canresizecol)
	{
		this._resizetddiv.style.cursor="col-resize";
		this._resizetddiv.parentNode.parentNode.style.cursor="col-resize";
		this._resizetddiv.parentNode.parentNode.parentNode.style.cursor="col-resize";
		this._resizingcol = true;
		_swfc_tablecontrol_resizing =this;
	}
}

//-- set resizingcol to false - called after timeout
var _curr_resize_control = null;
function _swfc_sqltable_stop_tableresize_aftertimeout()
{
	this._resizingcol = false;
}

function _swfc_sqltable_stop_headerresize(oEv,aDoc)
{
	if(this._resizingcol == false) return;

	//-- set timeout to set var back to false - this is so we do not trigger onheader clicked
	_curr_resize_control = this;
	setTimeout("_curr_resize_control._stop_tableresize_aftertimeout()",200);
	
	//-- set new cell size
	var iAdjust = this._datadiv.scrollLeft;
	var intNewTDWidth = app.findMousePos(oEv)[0] - app.eleLeft(this._resizetddiv) +  iAdjust;

	//var strInfo = intNewTDWidth +":"+ (app.eleLeft(this._resizetddiv) + iAdjust) +":"+ (app.findMousePos(oEv)[0]);
	//document.mainform.tb_updatetext._value(strInfo)
	if(intNewTDWidth<15)intNewTDWidth=15;
	
	this._resizetddiv.style.cursor="default";
	this._resizetddiv.parentNode.parentNode.style.cursor="default";
	this._resizetddiv.parentNode.parentNode.parentNode.style.cursor="default";

	//-- resize header
	this._resizetddiv.style.width = intNewTDWidth;
	this._resizetddiv.parentNode.style.width = intNewTDWidth;
	
	this._align();


	//-- kill vars
	this._resizetddiv = null;
}


function _swfc_sqltable_scroll()
{
	if(this._datadiv.scrollLeft!=this._headerdiv.scrollLeft)
	{
		if(this.bJustAligned)
		{
			this.bJustAligned=false;
			this._datadiv.scrollLeft = this._currentScrollLeft;
			this._datadiv.scrollTop = this._currentScrollTop;
			this._headerdiv.scrollLeft = this._datadiv.scrollLeft;
		}
		else
		{
			this._headerdiv.scrollLeft = this._datadiv.scrollLeft;
		}
	}
}

//-- get header cells
function _swfc_sqltable_getheadercolumns()
{
	var aRow = app.get_parent_child_by_tag(this._headerdiv,"TR");
	if(aRow!=undefined && aRow!=null)
	{
		return aRow.cells;			
	}
	return new Array();
}


//-- get header td given  ncol
function _swfc_sqltable_getheadertd(nCol)
{
	var aRow = app.get_parent_child_by_tag(this._headerdiv,"TR");
	if(aRow!=undefined && aRow!=null)
	{
		if(isNaN(nCol-1))nCol = this._get_colnum_by_name(nCol);
		if(nCol>aRow.cells.length-1)return null;
		try
		{
			var aTD = aRow.cells[nCol];			
		}
		catch (e)
		{
			return null;
		}

		if(aTD!=undefined && aTD!=null)
		{
			return aTD;
		}
	}

	return null
}


//-- get table td given rown and ncol
function _swfc_sqltable_getcoltd(nRow,nCol)
{
	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	if(oTable==null) return null;
	
	var aRow = oTable.rows[nRow];
	if(aRow!=undefined && aRow!=null)
	{
		if(isNaN(nCol-1))nCol = this._get_colnum_by_name(nCol);
		if(nCol==-1)return null;
		if(nCol>aRow.cells.length-1)return null;
		var aTD = aRow.cells[nCol];
		if(aTD!=undefined && aTD!=null)
		{
			return aTD;
		}
	}

	return null
}

//-- get row object
function _swfc_sqltable_getrowtr(nRow)
{
	var oTable = app.get_parent_child_by_tag(this._datadiv,"TABLE");
	if(oTable==null) return null;

	if(nRow<0)return null;
	var aRow = oTable.rows[nRow];
	if(aRow!=undefined && aRow!=null)
	{
		return aRow;
	}

	return null;
}


//-- get col num by col name
function _swfc_sqltable_get_colnum_by_name(sCol)
{
	var arrCols = this._jsoncols.controlInfo;
	var yLen = arrCols.length;
	for(var x=0;x<yLen;x++)
	{
		var aCol = this._getcol(x);
		if(aCol.dbcolumn.toLowerCase()==sCol.toLowerCase())	return x;	
	}
	this._fatalerror = true;
	return -1;
}

//-- get col num by col name
function _swfc_sqltable_get_colname_by_num(nCol)
{
	var aCol = this._getcol(nCol);
	if(aCol!=undefined && aCol!=null)return aCol.dbcolumn;

	return "";
}


//--
//-- MENU BUTTON FUNCTIONS
function _swfc_menubutton(mnuBtn)
{
	mnuBtn._dropped = false;
	mnuBtn._deactivated = false;
	mnuBtn._dropdiv = null;


	mnuBtn.hilite = _swfc_menubutton_hilite;
	mnuBtn.lolite =  _swfc_menubutton_lolite;
	mnuBtn.click = _swfc_menubutton_click;
	mnuBtn.option_execute = _swfc_menubutton_option_execute;
	mnuBtn.option_hilite = _swfc_menubutton_option_hilite;
	mnuBtn.option_lolite = _swfc_menubutton_option_lolite;
	mnuBtn.deactivate = _swfc_menubutton_deactivate;

	mnuBtn._enable = _swfc_menubutton_enable;
}

function _swfc_menubutton_enable(bEnable)
{
	if(bEnable==undefined) return !this.disabled;

	this.lolite();
	this.disabled = (!bEnable);

	//-- set html element to read only
	this.element.disabled =this.disabled;


	if(!app.isIE && this.element.tagName!="BUTTON")
	{
		//-- set textcolor
		var mnuTextEle = this.htmldocument.getElementById(this.name + "_menutext");
		if(mnuTextEle!=null)
		{
			if(this.disabled)
			{
				mnuTextEle.style.color="#8f8f8f";
			}
			else
			{
				mnuTextEle.style.color="#000000";
			}
		}
	}
}

function _swfc_menubutton_deactivate()
{
	if(this.element.tagName!="BUTTON") 
	{	
		if(this.element.style.backgroundColor==this.backgroundColor) return;
		this._dropped=false;
	}
	
	this._deactivated = true;
	this._dropdiv.style.display='none';

	this.lolite();
}

function _swfc_menubutton_hilite()
{
	if(this.disabled)return;
	if(this.element.tagName!="BUTTON")
	{
		this.element.style.border='1px solid #000000';
		this.element.style.backgroundColor=this.backgroundColor;
	}
}

function _swfc_menubutton_lolite()
{
	if(this.element.tagName=="BUTTON")return;
	
	if(!this._dropped)
	{
		this.element.style.border='0px solid #000000';
		this.element.style.backgroundColor='';
	}
	else
	{
		this.element.style.backgroundColor='';
	}
}

function _swfc_menubutton_option_execute(oRow)
{
	if(this.disabled)return;

	var strCommandID = oRow.getAttribute('value');
	strCommandID++;strCommandID--;
	var strName = oRow.childNodes[1].innerHTML;

	//-- hide drop div
	this._dropdiv.style.display='none';
	this._dropped=false;

	//-- reset btn style
	this.lolite();

	//-- call form defined function if exists
	this._executejsevent("OnMenuItem",strName, strCommandID);

	//-- check if strName matches a show me item action on this form - if so execute it
	this._form._swdoc._execute_showmeitem(-1,strName);
}

function _swfc_menubutton_option_hilite(oRow)
{
	if(this.disabled)return;
	oRow.childNodes[0].style.backgroundColor="#ffeec2";
	oRow.childNodes[1].style.backgroundColor="#ffeec2";
}

function _swfc_menubutton_option_lolite(oRow)
{
	oRow.childNodes[0].style.backgroundColor="#D8E7FC";
	oRow.childNodes[1].style.backgroundColor="#f6f6f6";
}


function _swfc_menubutton_click(eV)
{
	//-- do not process for button
	if(this.disabled)return;

	if(this.commands=="" || !isNaN(this.commands))
	{

	}
	else
	{
		if(this._deactivated) 
		{
			this._deactivated=false;
			this._dropped=true;
			if(this._dropdiv && this._dropdiv.style.display=='none')this._dropped = false;
		}


		if(this._dropped)
		{
			//-- hide drop div
			this._dropdiv.style.display='none';
			this._dropped=false;

			this._form._arr_open_menubuttons[this.name] = false;
		}
		else
		{
			//-- draw out div to show menu items
			if(this._dropdiv==null)
			{
				var strOptions = "";
				var arrCommands = this.commands.split("|");
				for(var x=0; x< arrCommands.length-1;x++)
				{
					var arrMore = arrCommands[x].split("^");
					//-- remove double ampersand
					if(arrMore[0].indexOf("&&")>-1)
					{
						arrMore[0] = _regexreplace(arrMore[0],"&&","&")
					}

					strOptions += "<tr value='" + arrMore[1] + "' onmouseover='this.parentNode.parentNode.parentNode.swfc.option_hilite(this);' onmouseout='this.parentNode.parentNode.parentNode.swfc.option_lolite(this);' onmousedown='this.parentNode.parentNode.parentNode.swfc.option_execute(this);'><td class='menubutton-option-leftspace' noWrap></td><td class='menubutton-option-text' noWrap>" + arrMore[0] + "</td></tr>"
				}
				
				var strHTML = "<div id='" + this.name + "_dropdiv' class='menubutton-dropdiv'><table cellspacing=0 cellpadding=0 border=0>"+strOptions+"</table></div>";
				insertBeforeEnd(this.htmldocument.body,strHTML);

				this._dropdiv = this.htmldocument.getElementById(this.name + "_dropdiv");
				this._dropdiv.swfc = this;
			}

			var intWidth = this.position.right - this.position.left;
			var intHeight = this.position.bottom - this.position.top;

			this._dropdiv.style.top = this.element.offsetTop - 1 + intHeight;
			this._dropdiv.style.left = this.element.offsetLeft;
			this._dropdiv.style.zIndex = 99999999;
			this._dropdiv.style.display='block';



			//-- if list bottom goes off form bottom edge then position above button
			if(app.eleHeight(this.htmldocument.body) < (this._dropdiv.offsetHeight + this._dropdiv.offsetTop))
			{
				this._dropdiv.style.top = this.element.offsetTop - this._dropdiv.offsetHeight;
			}

			//-- show menu to the left or right of button
			var divRight =  this._dropdiv.offsetWidth + this._dropdiv.offsetLeft;
			if(divRight>this.htmldocument.body.offsetWidth)
			{
				this._dropdiv.style.left = (this.element.offsetLeft + this.element.offsetWidth) - this._dropdiv.offsetWidth;
			}

			this._dropped=true;
			this._form._arr_open_menubuttons[this.name] = true;
		}
	}
	
	//-- call on pressed function
	this._executejsevent("OnPressed");

}

//-- EOF MENU BUTTON FUNCTIONS


//-- TAB CONTROL
function _swfc_tabcontrol(oSWFC)
{
	//-- public properties
	oSWFC.tab = 0;

	//-- public methods
	oSWFC.ShowTabItem = _swfc_tabcontrol_showtabitem;
	oSWFC.EnableTabItem = _swfc_tabcontrol_enabletabitem;
	oSWFC.SetTabItemText = _swfc_tabcontrol_SetTabItemText;

	//-- private props
	oSWFC._elements = new Array();
	oSWFC._associated = false;
	oSWFC._forceShow = false;

	//-- private methods
	oSWFC._activatetab = _swfc_tabcontrol_activatetab;
	oSWFC._tab = _swfc_tabcontrol_tab;
	oSWFC._draw = _swfc_tabcontrol_draw;
	oSWFC._initialise_elements = _swfc_tabcontrol_initialise;
	oSWFC._hide = _swfc_tabcontrol_hide;
	oSWFC._show = _swfc_tabcontrol_show;

	oSWFC._tiHide = _swfc_tabcontrol_item_hide;
	oSWFC._tiShow = _swfc_tabcontrol_item_show;

	oSWFC._align_innerelements = _swfc_tabcontrol_align_innerelements;
	oSWFC._scroll_tabitems = _swfc_tabcontrol_scroll_tabitems;
}

function _swfc_tabcontrol_SetTabItemText(nTab, strText)
{
	var eTabItems = this.htmldocument.getElementById(this.name +"_tabitems");
	if(eTabItems.childNodes[nTab-1+2])
	{
		app.setElementText(eTabItems.childNodes[nTab-1+2],strText);
	}
}

//-- draw tab item
function _swfc_tabcontrol_draw(bDrawnAlready)
{
	if(!bDrawnAlready)
	{
		var intWidth = this.position.right - this.position.left;
		var intHeight = this.position.bottom - this.position.top;
		var iZindex = 10 + (this.appearance.index -1 + 1);
		var strStyleAtts = "overflow:hidden;position:absolute;z-Index:"+iZindex+";width:"+ intWidth+"px;height:"+intHeight+"px;top:"+ (this.position.top) +"px;left:"+this.position.left+"px;";

		//-- draw listbox
		var arrHTML = new Array();
		arrHTML.push("<div id='"+ this.name+"' style="+ strStyleAtts +">");
		var arrSpans = new Array();

		//-- tab item colours - standard
		var strTabBgColor=this.appearance.foregroundColor;
		var strTabBgInactiveColor = "#FEFEFE";
		var strColor=this.selectedTextColor;
		var strInactiveColor=this.deselectedTextColor;

		if(strColor=="" || strColor=="#000000") strColor = "#696969";
		if(strInactiveColor=="" || strInactiveColor=="#000000") strInactiveColor = "#696969";


		//-- create tab items
		var firstVisibleTab = -1;
		var iSpanTop = (!app.isIE)?5:4;
		//if(app.isSafari)iSpanTop = 3;

		for(var x=0;x<this._items.length;x++)
		{
			var strDisabled = "";
			var strInvis = "inline";
			var strDisplay = this._items[x].name;

			//-- remove double & due to full client bug
			if(strDisplay.indexOf("&&")>-1)
			{
				strDisplay = _regexreplace(strDisplay,"&&","&")
			}

			var jFlags = undefined;
			if(this._items[x].controlInfo) jFlags =this._items[x].controlInfo.flags;
			if(jFlags!=undefined)
			{
				strDisabled = jFlags.disabled=="true"?"enabled='false'":"";
				strInvis = jFlags.invisible=="true"?"none":"inline";
				
				if(strInvis=="inline" && firstVisibleTab==-1)firstVisibleTab = x;
			}
			else
			{
				if(firstVisibleTab==-1)firstVisibleTab = x;
			}

			//-- 89260 - set colours if tab style is 2
			if(this.tabStyle=="2")
			{
				//-- use tab item specific coloring
				var strTabBgColor = this._items[x].controlInfo.properties.tabColor;
				var strColor=this._items[x].controlInfo.properties.activeTextColor;
				var strInactiveColor=this._items[x].controlInfo.properties.inactiveTextColor;
				//-- colored tab items have same active and inactive bg 
				strTabBgInactiveColor = strTabBgColor;

				if(strColor==undefined) strColor = "#696969";
				if(strInactiveColor==undefined) strInactiveColor = "#696969";
				var strUseColor = (x==0)?strColor:strInactiveColor;
				var strUseBgColor = strTabBgColor;
			}
			else
			{
				var strUseColor = (x==0)?strColor:strInactiveColor;
				var strUseBgColor = (x==0)?strTabBgColor:strTabBgInactiveColor;
			}

			//-- if disabled set color to d
			if(strDisabled!="")
			{
				strUseColor = "#A5A5A5";
			}

			//-- eof font
			arrSpans.push("<span ntab='"+x+"' activebg='"+strTabBgColor+"' inactivebg='"+strTabBgInactiveColor+"' inactivecolor='"+strInactiveColor+"' activecolor='"+strColor+"' onclick='this.parentNode.parentNode.swfc._activatetab(this);' style='"+ this._get_font_style() +";color:"+strUseColor+";display:"+strInvis+";z-Index:6;margin-right:5px;margin-left:0px;background:"+strUseBgColor+";cursor:default;position:relative;top:"+iSpanTop+"px;z-Index:99999999;border:1px solid #D5D4DF;padding:2px 5px 2px 3px;' "+strDisabled+">" + strDisplay + "</span>"); 

		}


		//-- div tab items
		arrHTML.push("<div  id='" + this.name + "_tabitems' class='tabcontrol-items-holder'><span style='width:3px;'></span>"+arrSpans.join("")+"</div>");
		arrHTML.push("<div  id='" + this.name + "_tabitems_scroll' class='tabcontrol-items-holder-scroll' style='visibility:hidden;' onmousedown='this.parentNode.swfc._scroll_tabitems(this,event,true);' onmouseup='this.parentNode.swfc._scroll_tabitems(this,event,false);'></div>");

		//-- div area
		if(app.isIE)
		{
			var strAreaStyleAtts = "position:relative;top:0px;z-Index:0;border:1px solid #D5D4DF;width:"+ intWidth+"px;height:"+(intHeight-22)+"px;";
		}
		else
		{
			var strAreaStyleAtts = "position:relative;top:0px;z-Index:0;border:1px solid #D5D4DF;width:"+ intWidth+"px;height:"+(intHeight-50)+"px;";
		}
		
		arrHTML.push("<div id='" + this.name + "_tabarea' style='"+strAreaStyleAtts+"'></div>"); 	
		arrHTML.push("</div>");
		insertBeforeEnd(this.htmldocument.body,arrHTML.join(""));


	}
	this._element();
	this.element.swfc = this;
	
	//-- set first tab item as selected
	if(!bDrawnAlready)
	{
		this.tab = firstVisibleTab;
		if(this.tab==-1)this.tab=0; //-- nwj - this occurs when developer has hidden all items at design time

		this.tab--;this.tab++;
		var eTabItems = this.htmldocument.getElementById(this.name +"_tabitems");
		eTabItems.childNodes[this.tab+1].style.borderBottom = "1px solid " + eTabItems.childNodes[this.tab+1].getAttribute("activebg");
		eTabItems.childNodes[this.tab+1].style.background = eTabItems.childNodes[this.tab+1].getAttribute("activebg");
	}
	else
	{
		//-- get first visible tab item
		for(var x=0;x<this._items.length;x++)
		{
			var jFlags = undefined;
			if(this._items[x].controlInfo) jFlags =this._items[x].controlInfo.flags;
			if(jFlags!=undefined)
			{
				if(jFlags.invisible!="true")
				{
					this.tab = x;
					break;
				}
			}
			else
			{
				this.tab = x;
				break;
			}
		}
	}

}

//-- enable tab item
function _swfc_tabcontrol_enabletabitem(nTab,bEnable)
{
	var eTabItems = this.htmldocument.getElementById(this.name +"_tabitems");
	if(eTabItems.childNodes[nTab-1+2]) //-- if tab item exists
	{
		//-- set font color 
		var span = eTabItems.childNodes[nTab-1+2];
		span.setAttribute("enabled",bEnable);
		if(nTab==this.tab)
		{
			//-- enable / disable current tab item
			span.style.color = (bEnable)?span.getAttribute("activecolor"):"#A5A5A5";
		}
		else
		{
			span.style.color = (bEnable)?span.getAttribute("inactivecolor"):"#A5A5A5";
		}
	}
}

//-- show/hide a tab item
function _swfc_tabcontrol_showtabitem(nTab,bShow,bShowOnFormDraw)
{
	if(bShowOnFormDraw==undefined)bShowOnFormDraw=false;
	var htmlTabItemPos = nTab -1 + 2;
	var eTabItems = this.htmldocument.getElementById(this.name +"_tabitems");
	if(eTabItems.childNodes[htmlTabItemPos]==undefined)
	{
		return; //-- means developer has tried to show a tab item that does not exist
	}

	eTabItems.childNodes[htmlTabItemPos].style.display = (bShow==false || bShow==0)?"none":"";

	//-- hide show scroll as hiding or showing may adjust need to show
	var eScroll = this.htmldocument.getElementById(this.name +"_tabitems_scroll");
	if(eScroll!=null)
	{		
		try
		{
			eScroll.style.visibility = (app.isWidthOverflowing(eTabItems))?"visible":"hidden";
		}
		catch (e)
		{
		}
	}

	//-- hide tab item
	if(!bShow)
	{
		//-- 13.02.2012 - query 87226 / defect 87397
		//-- select the next visible tab item - but only if this tab item is the currently selected one
		if(this.tab==htmlTabItemPos-1)
		{
			for(var x=1;x<eTabItems.childNodes.length;x++)
			{
				if(eTabItems.childNodes[x].style.display!="none")
				{
					this._tab(x-1);
					break;
				}
			}
		}
	}
	else
	{
		
		if(bShowOnFormDraw || (!this._visible() && !bShowOnFormDraw))
		{
			if(this._tabcontrol && this._tabcontrol.tab>0)
			{
				this._forceShow= true;
			}
			this._tab(nTab);
		}
		else
		{
			//-- if not currently selected
			//-- and if this is the only visible tab item and we are now showing it from a hidden state then select it.
			if(this.tab!=nTab)
			{
				var intVisibleItems=0;
				for(var x=1;x<eTabItems.childNodes.length;x++)
				{
					if(eTabItems.childNodes[x].style.display!="none")intVisibleItems++;
				}
				if(intVisibleItems==1)
				{
					//-- need to select this tab
					this._tab(nTab);
				}
			}
		}
	}
}

//-- select tab when clicked
function _swfc_tabcontrol_activatetab(aTab)
{
	if(aTab.getAttribute("enabled")=="false" || aTab.getAttribute("enabled")==false || aTab.getAttribute("enabled")=="0") return;

	var nTab = aTab.getAttribute('ntab');
	this._tab(nTab);

	nTab--;nTab++;
	this._executejsevent("OnTabSelected",nTab);

}
//-- select tab
function _swfc_tabcontrol_tab(nTab)
{
	//-- set current tab item span to unselected
	var eTabItems = this.htmldocument.getElementById(this.name +"_tabitems");
	if(this.tab !=nTab)
	{
		var spanTab = eTabItems.childNodes[this.tab-1+2];
		spanTab.style.borderBottom = "1px solid #D5D4DF";
		spanTab.style.color = spanTab.getAttribute("inactivecolor");
		// 89260 - if tab style is 2 then set to tab item bgcolor
		spanTab.style.background = spanTab.getAttribute("inactivebg");

	}
	this.tab = nTab;
	this.tab--;this.tab++;
	this._show();
}

//-- called if this tab contrl is a child of a tab control
function _swfc_tabcontrol_hide()
{
	for(var strID in this._elements)
	{
		this._elements[strID]._tabvisible(false);
	}
}

//-- called if this tab contrl is a child of a tab control
function _swfc_tabcontrol_item_hide(nTab)
{
	var strID = "";
	for( strID in this._elements)
	{
		var arrGroup = this._elements[strID].group.split(":");
		var eTabName =arrGroup[0];
		var eTabPos = new Number(arrGroup[1]);
		if(eTabPos==nTab)
		{	
			this._elements[strID]._tabvisible(false);
		}
	}
}

//-- called if this tab contrl is a child of a tab control
function _swfc_tabcontrol_item_show(nTab)
{
	var strID = "";
	for( strID in this._elements)
	{
		var arrGroup = this._elements[strID].group.split(":");
		var eTabName =arrGroup[0];
		var eTabPos = new Number(arrGroup[1]);
		if(eTabPos==nTab)
		{	
			this._elements[strID]._tabvisible(true);
		}
	}
}


//-- called if this tab control is a child of a tab control on a tab item that is just shown
function _swfc_tabcontrol_show()
{
	//-- this tab control belongs to another tab control - so need to check that parent is visible
	if(this._tabcontrol!=null && !this._forceShow)
	{
		var arrGroup = this.group.split(":");
		var eTabName = arrGroup[0];
		var eTabPos = new Number(arrGroup[1]);	
	
		//-- is on a parent tab check if that parent tab control is visible and its current tab is same as the one this tc is on
		if(this._tabcontrol.tab!=eTabPos || !this._tabcontrol._visible() || !this._tabcontrol._tabvisible()) return;
	}

	//-- set style of selected tab item
	var iHtmlTabPos = this.tab - 1 + 2;
	var eTabArea = this.htmldocument.getElementById(this.name +"_tabarea");
	var eTabItems = this.htmldocument.getElementById(this.name +"_tabitems");
	//-- 89260 - set bgcolor according to tab items
	eTabArea.style.background = eTabItems.childNodes[iHtmlTabPos].getAttribute("activebg");
	eTabItems.childNodes[iHtmlTabPos].style.borderBottom = "1px solid " + eTabItems.childNodes[iHtmlTabPos].getAttribute("activebg");
	eTabItems.childNodes[iHtmlTabPos].style.background = eTabItems.childNodes[iHtmlTabPos].getAttribute("activebg");
	eTabItems.childNodes[iHtmlTabPos].style.color = eTabItems.childNodes[iHtmlTabPos].getAttribute("activecolor");

	for(var strID in this._elements)
	{
		var arrGroup = this._elements[strID].group.split(":");
		var eTabName =arrGroup[0];
		var eTabPos = new Number(arrGroup[1]);
		if(eTabPos!=this.tab)
		{	
			this._elements[strID]._tabvisible(false);
		}
		else
		{
			this._elements[strID]._tabvisible(true);
		}
	}
}


//-- associate the elements that are bound to this tab control
function _swfc_tabcontrol_initialise()
{
	for(var strID in this._form.namedelements)
	{
		if(this._form.namedelements[strID].group=="")continue;

		var arrGroup = this._form.namedelements[strID].group.split(":");
		var eTabName = arrGroup[0];
		var eTabPos = new Number(arrGroup[1]);	
		
		if(eTabName.toLowerCase()==this.name.toLowerCase())
		{	
			this._form.namedelements[strID]._tabcontrol = this;
			this._elements[strID] = this._form.namedelements[strID];

			/*
			if(eTabPos==this.tab && this._tabvisible())
			{
				this._elements[strID]._tabvisible(true);	
			}
			else
			{
				this._elements[strID]._tabvisible(false);	
			}
			*/
		}
	}
}

//--
//-- scroll tab items
function _swfc_tabcontrol_scroll_tabitems(oEle, oEv, bScroll)
{
	if(!bScroll)
	{
		_current_scroll_div=null;
		return;
	}
	//-- position scroll
	var eItems = this.htmldocument.getElementById(this.name +"_tabitems");
	if(eItems!=null)
	{
		if(app.isWidthOverflowing(eItems))
		{
			//-- position scroll
			var eScroll = this.htmldocument.getElementById(this.name + "_tabitems_scroll");
			if(eScroll!=null)
			{		

				//-- scroll left or right - get mouse position
				var iMouseLeft = app.findMousePos(oEv)[0];
				var lpos = iMouseLeft - app.eleLeft(eScroll);
				_current_scroll_div = eItems;

				if(lpos>0 && lpos<4)
				{
					//-- scroll toward 1st tab item 
					_scroll_tab(true);

				}
				else if (lpos>10 && lpos<15)
				{
					//-- scroll toward last tab item
					_scroll_tab(false);
				}
			}
		}
	}
}



var _current_scroll_div = null;
function _scroll_tab(bLeft)
{
	if(_current_scroll_div==null)return;
	if(bLeft)
	{
		if(_current_scroll_div.scrollLeft==0)
		{
			return;
		}
		_current_scroll_div.scrollLeft =  _current_scroll_div.scrollLeft - 5;
		setTimeout("_scroll_tab(true)",20);
	}
	else
	{
		_current_scroll_div.scrollLeft =  _current_scroll_div.scrollLeft + 5;
		setTimeout("_scroll_tab(false)",20);
	}
}




//--
//-- align tab display area (after control is resized)
function _swfc_tabcontrol_align_innerelements(intParentWidth, intParentHeight)
{
	if(intParentHeight<1) return;
	var eTabArea = this.htmldocument.getElementById(this.name +"_tabarea");
	if(!isNaN(intParentWidth))
	{
		if(app.isIE)
		{
			eTabArea.style.width = intParentWidth - 2;
		}
		else
		{
			eTabArea.style.width = intParentWidth - 2;
		}
	}
	if(!isNaN(intParentHeight))
	{
		if(app.isIE)
		{
			eTabArea.style.height =intParentHeight - 22;
		}
		else
		{
			//-- adjust for ff and safari
			eTabArea.style.height =intParentHeight - 22;
		}
	}


	//-- position scroll
	var eItems = this.htmldocument.getElementById(this.name +"_tabitems");
	if(eItems!=null)
	{
		eItems.style.width = intParentWidth - 24;

		//-- position scroll
		var eScroll = this.htmldocument.getElementById(this.name +"_tabitems_scroll");
		if(eScroll!=null)
		{		
			try
			{
				eScroll.style.left = intParentWidth - 20;	
				eScroll.style.visibility = (app.isWidthOverflowing(eItems))?"visible":"hidden";
			}
			catch (e)
			{
			}
		}
	}

}

//--
//-- EOF TAB CONTROL



//--
//-- FILE TABLE FUNCTIONS 
function _swfc_filetable(oSWFC)
{
	//-- public methods
	oSWFC.AddLocalFile = _swfc_filetable_addlocalfile;
	oSWFC.AddFiles = _swfc_filetable_addfile;
	oSWFC.RemoveFile = _swfc_filetable_removefile;
	oSWFC.DeleteFile = _swfc_filetable_deletefile;
	oSWFC.RemoveSelectedFiles = _swfc_filetable_removeselectedfiles;
	oSWFC.GetItemText = _swfc_sqltable_GetItemTextRaw;
	oSWFC.AddAttachment = _swfc_sqltable_AddAttachment;
	oSWFC.MailSelectedFiles	 =	_swfc_sqltable_MailSelectedFiles;
	oSWFC.SaveAs = _swfc_sqltable_SaveAs;

	oSWFC.Refresh=_swfc_filetable_refresh;
	oSWFC.Reload = _swfc_filetable_refresh;

	//-- private methods & properties
	oSWFC._fileuploadform = null

	oSWFC._openfile =_swfc_filetable_openfile;
	oSWFC.OpenFile =_swfc_filetable_openfile;

	oSWFC._getuploadform=_swfc_filetable_getuploadform;
	oSWFC._useraddedfile=_swfc_filetable_useraddedfile;
	oSWFC._uploadfile=_swfc_filetable_uploadfile;
	oSWFC._onfileuploaded=	_swfc_filetable_onfileuploaded;
	oSWFC._fileuploadservicepath = "";

	oSWFC._getcallattachments=_swfc_filetable_getcallattachments
	oSWFC._deletecallattachment =_swfc_filetable_deletecallattachment;

	oSWFC._uploadtype = _formtype;

	
}

//-- public

//-- remove file from list but does not delete on server
function _swfc_filetable_removefile(nRow)
{
	if(this._autoLoad)
	{
		this.DeleteFile(nRow)
	}
	else
	{
		this.RemoveRow(nRow);
	}
}

function _swfc_sqltable_SaveAs()
{
	this.OpenFile()
	return rue;
}

function _swfc_sqltable_MailSelectedFiles()
{
	var arrFileNames = new Array();
	for(var x=0; x<this.rowCount();x++)
	{
		if(this.IsRowSelected(x))
		{
			arrFileNames.push(this.GetItemTextRaw(x,0));
		}
	}
	var arrSpecial = new Array();
	arrSpecial["attachments"] = arrFileNames.join(",");
	arrSpecial["attachmentsformid"] = _uniqueformid

	app._newEmail(arrSpecial);
}

//-- used to add file attachment info to sqllist (usually from email attachments) ?? or is it something else
//-- oFileAtt.filename, filesize, timestamp
function _swfc_sqltable_AddAttachment(oFileAtt)
{
	if(this._uploadtype=='cdf') 
	{
		alert("filelist.AddAttachment : Is not supported by the webclient");
		return; //-- not supported in call detail form
	}

	var arrValues = new Array();
	var arrFileType = oFileAtt.filename.split(".");

	//-- format timestamp
	if(oFileAtt.timestamp=="")	oFileAtt.timestamp = app._formatDate(new Date(),"y/MM/d HH:mm");


	if(this._uploadtype=='lcf')
	{
		arrValues[0] = oFileAtt.filename;   //-- filename
		arrValues[1] = app.getByteSize(oFileAtt.filesize);	//-- size
		arrValues[2] = app.getFileTypeInformation(arrFileType[arrFileType.length-1]); //-- file type
		if(arrValues[0]==arrValues[2])arrValues[2]="";
		arrValues[3] = oFileAtt.timestamp; //-- date
		arrValues[4] = lsession.analystid;	//-- uploader
		this._insertrow(arrValues,0);
	}
	else
	{
		arrValues[0] = oFileAtt.filename; //-- filename
		arrValues[1] = app.getByteSize(oFileAtt.filesize);		//-- size
		arrValues[2] = oFileAtt.timestamp; //-- date
		arrValues[3] = "N/A";//
		this._insertrow(arrValues,1);
	}

}

function _swfc_filetable_addlocalfile()
{
	//--
	alert("AddLocalFile is not supported by the webclient.");
}



function _swfc_filetable_openfile(nRow, bSaveAs,optFileName, optFileSaveAs)
{
	if(bSaveAs==undefined)bSaveAs=false;
	var strSave = (bSaveAs)?"save":"view";

	if((this._uploadtype=='lcf' || this._uploadtype=='cdf') && !lsession.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANREADFILESONCALLS,true)) return;


	if(!confirm("You have chosen to "+strSave+" a file that resides on the server. Depending on the file size this may take a while to process. \n\nDo you want to continue? "))return false;

	var strFileName = (optFileName!=undefined)?optFileName:this.GetItemTextRaw(nRow,0);
	if(strFileName!="")
	{
		if(strFileName.indexOf("http:")==0||strFileName.indexOf("https:")==0)
		{
			window.open(strFileName);
			return;
		}
		else
		{
			if(this._getrowtr(nRow))var rowid = this._getrowtr(nRow).getAttribute("rowid");
			var strParams = "swsessionid=" + app._swsessionid + "&_filename=" + app.pfu(strFileName) + "&_uniqueformid=" + _uniqueformid +"&_rowid="+app.pfu(rowid);

			//-- set url based on filelist type
			if(this._uploadtype=='lcf')
			{
				//-- open call attachment that is in temp files path for form
				var strURL = app._root + "service/fileopen/lcf.php?" + strParams;
			}
			else if(this._uploadtype=='cdf')
			{
				//-- open call attachment that is stored against a call
				//-- 04-10-2011 - if a .swm file open using email reader form
				if(strFileName.toLowerCase().indexOf(".swm")>0)
				{
					if(!app.global.IsConnectedToMailServer())
					{
						alert("The Supportworks mail server is not running and as such the swm file cannot be opened. Please contact your Administrator");
						return;
					}

					var strParams = "_callref=" + this._form._swdoc.opencall.callref + "&_rowid="+ app.pfu(rowid);
					app._open_system_form("_sys_swm_form", "mail", "", strParams, false,  null, null, window,250,250);
					return;
				}
				else
				{
					strParams += "&_callref=" + this._form._swdoc.opencall.callref;
					var strURL = app._root + "service/fileopen/cdf.php?" + strParams;
				}
			}
			else
			{
				//-- open attachment that is in path
				var strUNCPath = _parse_context_vars(this.path);
				//-- post to iframe in order to open file at given path
				strParams += "&_uncpath=" + app.pfu(strUNCPath);
				if(optFileSaveAs!=undefined)strParams += "&_filesaveas="+app.pfu(optFileSaveAs);
				var strURL = app._root + "service/fileopen/stf.php?" + strParams;

			}
		}
		//-- load php into hidden iframe - php echo will popup message to open, save or cancel
		//-- create iframe to post php to if not created yet
		var oIF = this.htmldocument.getElementById('iframe_fileopener');
		if(oIF==null)
		{
			var strIframeHTML = "<iframe src='javascript:false;' id='iframe_fileopener' name='iframe_fileopener' style='display:none;z-Index:999999;position:absolute;'></iframe>";
			app.insertBeforeEnd(this.htmldocument.body,strIframeHTML);
			oIF = this.htmldocument.getElementById('iframe_fileopener');
			if(oIF==null)
			{
				alert("The filetable form control [" + this.name + "] was not able to open the file. Please contact your Administrator.");
				return;
			}
		}
		oIF.src = strURL;
	}
}

//-- get form which we use to open files with
function  _swfc_filetable_getopenfileform()
{
	if(this._fileopenfileform!=null) return this._fileopenfileform;

	//-- write out form html
	var strFormName = this.name +"_fileopenerform";
	this._fileopenfileform = this.htmldocument.getElementById(strFormName);
	return this._fileopenfileform;
}




//-- remove row and delete from server
function _swfc_filetable_deletefile(nRow, bMessage, strOptFile)
{
	//-- check if we should prompt user
	if(bMessage==undefined)bMessage=false;
	if(bMessage)
	{
		if(confirm("Are you sure you want to remove the selected file?")==false) return;
	}
	
	var strFileName = (strOptFile!=undefined)?strOptFile:this.GetItemTextRaw(nRow,0);

	var strURL = app._root + "service/fileupload/remove.php";
	var strParams = "_filename=" + app.pfu(strFileName) + "&_uniqueformid=" + _uniqueformid;
	var strRes =  app.get_http(strURL, strParams, true, false, null, null);
	this.RemoveRow(nRow);
}

//-- remove selected files
function _swfc_filetable_removeselectedfiles(nRow,bMessage)
{
	//-- check if we should prompt user
	if(bMessage==undefined)bMessage=false;
	if(bMessage)
	{
		if(confirm("Are you sure you want to remove the selected files?")==false) return;
	}
	

	for(var x=0; x<this.rowCount();x++)
	{
		if(this.IsRowSelected(x))
		{
			if(this._autoLoad)
			{
				//-- this file has been sent to server so delete server file
				this.DeleteFile(x);
			}
			else
			{
				this.RemoveFile(x);
			}
		}

	}
}

function _swfc_filetable_addfile(uploadType,strPrefixFileName)
{
	//-- get input of type file and trigger click
	var oForm = this._getuploadform();

	//-- set upload type for special cases i.e. adding attachments to call form
	if(uploadType==undefined)uploadType="STF";
	this._prefixfilename = strPrefixFileName;

	//-- 23.05.2011 - mod method so check call attach permission if needed.
	var boolCheckAttachCallFilePermission = (uploadType=="cdf" || uploadType=="lfc");

	//-- store upload type
	this._uploadtype = uploadType;

	//-- check attach call file permission
	if(boolCheckAttachCallFilePermission && !app.session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANATTACHFILESTOCALLS, true)) return;

	//-- have to show popup file selector for mozilla, safari and chrome
	if(!app.isIE)
	{
		//-- popup form
		var swc = this;
		var arrField = new Array();
		arrField['filecontrol'] = this;
		arrField['_uniqueformid'] = _uniqueformid;
		arrField['_prefixfilename'] = strPrefixFileName;
		arrField['_top'] = top;
		app._open_system_form("fileupload.php", "fileupload", "", "", true, function(popupForm)
		{
			//-- no file selected
			if(popupForm._uploadfilenode==null) return;

			//-- we have a file input node - need to put it into our form
			oForm.appendChild(popupForm._uploadfilenode);
			swc._uploadfile();
		}
		,null,window,400,20,arrField);
		
		return;
	}

	//-- if autoload is false then allow use to add multiple files without uploading
	if(this._autoLoad==false && (this._uploadtype!='lcf' && this._uploadtype!='cdf'))
	{
		//-- add input element to form
		var arrInputs  = app.get_children_by_att_value(this._fileuploadform, "type", "file",true);
		var strName = "swfileupload_" + new Number(arrInputs.length+1);
		var eFile = this.htmldocument.createElement("input");
		if(eFile!=null)
		{
			eFile.swfc = this;
			eFile.setAttribute('type', 'file');
			eFile.setAttribute('name', strName);
			app.addEvent(eFile,"change",this._useraddedfile);

			if(app.isIE6 || app.isIE7)
			{
				oForm.insertAdjacentElement('beforeEnd', eFile);
			
			}
			else
			{
				oForm.appendChild(eFile);
			}
			eFile.click(); //-- trigger file click
		}
	}
	else
	{
		//- -add one file at a time and upload immediately
		var eFile = app.getEleDoc(oForm).getElementById("swfileupload_1");
		if(eFile)
		{
			oForm.removeChild(eFile);
		}

		eFile = this.htmldocument.createElement("input");
		eFile.swfc = this;
		eFile.setAttribute('type', 'file');
		eFile.setAttribute('name', 'swfileupload_1');
		eFile.setAttribute('id', 'swfileupload_1');
		app.addEvent(eFile,"change",this._useraddedfile);
		if(app.isIE6 || app.isIE7)
		{
			oForm.insertAdjacentElement('beforeEnd', eFile);
		
		}
		else
		{
			oForm.appendChild(eFile);
		}
		
		eFile.click(); //-- trigger file click
		
	}
	return true;
}

//-- private
function _swfc_filetable_uploadfile()
{	
		var swFC = this;

		//-- submit form and upload file to either a unc path or temp location as specified by form id or something
		swFC._processing(true);

		//-- get filelist control
		var eFileList = swFC.element;
		if(eFileList==null)return;
	

		var strUNCPath = _parse_context_vars(swFC.path);
		if(strUNCPath=="undefined")strUNCPath="";

		//-- get input of type file and trigger click
		var oForm = swFC._getuploadform();

		if(swFC._prefixfilename==undefined)swFC._prefixfilename="";

		//--
		//-- make sure form is setup to upload file to correct place
		if(oForm.getAttribute("defined")!="1")
		{
			//-- set form atts
			oForm.setAttribute("defined","1");

			//-- create hidden fields
			var strPathEle = "<input type='input' id='swuploadfile_copytopath' name='swuploadfile_copytopath' value='"+ strUNCPath  + "'>";
			var strSessEle = "<input type='input' name='swsessionid' value='"+app._swsessionid+"'>";
			var strCallEle = "<input type='input' name='swfileuploadcallbackfunctionid' value='"+swFC.name+"'>";
			var strUniqEle = "<input type='input' name='_uniqueformid' value='"+_uniqueformid+"'>";
			var strPrefixFileName = "<input type='input' name='_prefixfilename' value='"+swFC._prefixfilename+"'>";
			var strUploadTypeEle = "<input type='input' name='_uploadtype' value='"+swFC._uploadtype+"'>";

			app.insertBeforeEnd(oForm,strPathEle);
			app.insertBeforeEnd(oForm,strSessEle);
			app.insertBeforeEnd(oForm,strCallEle);
			app.insertBeforeEnd(oForm,strUniqEle);
			app.insertBeforeEnd(oForm,strPrefixFileName);
			app.insertBeforeEnd(oForm,strUploadTypeEle);
		}	
		else
		{
			//-- set unc path in case has changed
			for(var x=0;x<oForm.childNodes.length;x++)
			{
				if(oForm.childNodes[x].name == "swuploadfile_copytopath")
				{
					oForm.childNodes[x].value = strUNCPath;
				}
				else if(oForm.childNodes[x].name == "_prefixfilename")
				{
					oForm.childNodes[x].value = swFC._prefixfilename;
				}
			}		
		}

		//-- set service to call to process files;
		var strAction = "service/fileupload/index.php";
		if(swFC._fileuploadservicepath!="")strAction = swFC._fileuploadservicepath;
		oForm.setAttribute("action",app._root + strAction);

		//-- create iframe to take upload if not created yet
		var oIF = app.getEleDoc(oForm).getElementById('iframe_fileuploader');
		if(oIF==null)
		{
			var strIframeHTML = "<iframe src='javascript:false;' id='iframe_fileuploader' name='iframe_fileuploader' style='display:none;'></iframe>";
			app.insertBeforeEnd(app.getEleDoc(oForm).body,strIframeHTML);	
		}

		//-- callback to control when loaded
		top.__arr_fileupload_callbacks[swFC.name] = new Object();
		top.__arr_fileupload_callbacks[swFC.name].filelist = swFC;

		oForm.submit();
}

function  _swfc_filetable_getuploadform()
{
	if(this._fileuploadform!=null) return this._fileuploadform;


	//-- draw form into html
	var oIF = this.htmldocument.getElementById(this.name + '_iframe_fileuploader');
	if(oIF==null)
	{
		alert("filetable : _getuploadform\n\nThe iframe fileuploader does not exist. Please contact your Administrator.");
	}

	oIF = (oIF.contentWindow) ? oIF.contentWindow : (oIF.contentDocument.document) ? oIF.contentDocument.document : oIF.contentDocument;

	//-- write out form html
	var strFormName = this.name +"_fileform";
	var strForm = '<body><form id="' + strFormName + '" style="display:none;position:absolute;top:0px;left:0px;"  encType="multipart/form-data" method="POST" target="iframe_fileuploader"></form></body>';
	oIF.document.open();
	oIF.document.write(strForm);
	oIF.document.close();
	
	
	this._fileuploadform = oIF.document.getElementById(strFormName)
	
	return this._fileuploadform;
}

function _swfc_filetable_onfileuploaded(iResult,strFileName,strFileSize,strFileDate,strWebPath,strOrigFileName)
{
	this._processing(false);

	if(iResult!=1)
	{
		//--
		//-- file upload failed
		if(iResult==0)iResult="There was a problem uplaoding the selected file";
		if(iResult==-1)iResult="The uploaded file type has been restricted by the Supportworks security settings";
		alert(iResult +". Please contact your administrator");
		return;
	}

	var strFilePath = _parse_context_vars(this.path) + "\\" + strFileName;
	var arrFileType = strFileName.split(".");
	var strFileType = arrFileType[arrFileType.length-1];

	//-- update sqllist with info
	var arrValues = new Array();

	if(this._uploadtype=='lcf')
	{

		arrValues[0] = strFileName; //-- filename
		arrValues[1] = strFileSize;		//-- size
		arrValues[2] = app.getFileTypeInformation(strFileType); //-- file type
		if(arrValues[0]==arrValues[2])arrValues[2]="";
		arrValues[3] = strFileDate; //-- date
		arrValues[4] = lsession.analystid;		//-- uploader
		this._insertrow(arrValues,0);

	}
	else if(this._uploadtype=='cdf')
	{

		//-- call helpdesk session to attachcall
		var	hdcon = new HelpdeskSession(_swdoc._uniqueformid);
		hdcon.BeginUpdateCall(_swdoc.opencall.callref);
		hdcon.SendNumber("timespent", 1); //-- dos not accept 0 as a value
		hdcon.SendBoolean("publicupdate", false);
		hdcon.SendValue("updatedb.udsource", "File Attachment");
		hdcon.SendValue("updatedb.udcode", "Attached File");
		hdcon.SendText("updatedb.updatetxt", "The " + strFileName + " file has been added to the call by " + lsession.analystid);
		hdcon.SendFile(strFileName);
		hdcon.Commit();
		if(hdcon.GetResult())
		{
			//-- refresh list - call bespoke php to show call attachments
			this._getcallattachments();
		}
		else
		{
			alert("Failed to attach file to the call record. Please contact your administrator.");
		}
		hdcon.Close();
	}
	else
	{
		arrValues[0] = strFileName; //-- filename
		arrValues[1] = strFileSize;		//-- size
		arrValues[2] = strFileDate; //-- date
		arrValues[3] = "N/A";//
		this._insertrow(arrValues,1);
	}

	strWebPath = app.webroot + "/webclient/" + strWebPath +"/" + strFileName;
	this._executejsevent("OnFileUploaded",strFileName,strFileType, strFileSize,strFileDate,strWebPath,strOrigFileName);
}

//-- upload all files in list control
function _swfc_filetable_uploadallfiles()
{
	swFC._uploadfile();	
}

function _swfc_sqltable_processing(boolOn)
{
	if ((boolOn) && (this.element.style.display=="none" || this.element.style.visibility=="hidden"))return;

	var imgID = this.name + "_procimg";  
	var processingicon = this.htmldocument.getElementById(imgID);
	if(boolOn)
	{
		if(processingicon==null)
		{
			var strSRC = "images/controls/processing.gif";
			var strIMG = "<div style='position:absolute;z-Index:99999999;'><img id='" + imgID + "' src='"+strSRC+"' style='position:absolute;z-Index:9999;'></div>";
			insertBeforeEnd(this.htmldocument.body,strIMG);
			processingicon = this.htmldocument.getElementById(imgID);
		}
		processingicon.style.top = app.eleTop(this.element) + (this.element.offsetHeight / 2) - 4;
		processingicon.style.left = app.eleLeft(this.element) + (this.element.offsetWidth / 2) - 4;
	}
	else
	{
		if(processingicon!=null)
		{
			 processingicon.parentNode.removeChild(processingicon);
		}
	}
}


//--
//-- handle file browser change
function _swfc_filetable_useraddedfile()
{
	
	var aBtn=this;
	var swFC = this.swfc;
	var oForm = swFC._getuploadform();

	if(oForm!=null)
	{
		//-- get filelist control
		var eFileList = swFC.element;
		if(eFileList==null)return;
	
		//-- if uploadtype is CID (content for email i.e. image) then make sure file type is an image
		if(swFC._uploadtype.toLowerCase()=="cid")
		{
			var _arr_images = new Array();
			_arr_images["png"] = 1;
			_arr_images["gif"] = 1;
			_arr_images["jpg"] = 1;
			_arr_images["jpeg"] = 1;
			_arr_images["bmp"] = 1;
			_arr_images["ico"] = 1;
			_arr_images["tif"] = 1;
			_arr_images["tiff"] = 1;

			var arrInfo = aBtn.value.split("\\");
			var strFilename = arrInfo[arrInfo.length-1];
			var arrFileInfo = strFilename.split(".");
			var strFileType = arrFileInfo[arrFileInfo.length-1];
			if(_arr_images[strFileType.toLowerCase()]==undefined) 
			{
				alert("Only images can be inserted as inline content.\nPlease select a supported image type:-\n\nbmp, gif, jpg, jpeg, ico, png");
				return false;
			}
		}

		var strUNCPath = _parse_context_vars(swFC.path);

		//-- if autolaod = true uplaod file immediately
		//swFC._autoLoad = false;
		if(swFC._autoLoad || swFC._uploadtype=="lcf" || swFC._uploadtype=="cdf")
		{
			swFC._uploadfile();
		}
		else
		{
			//-- wait for command to uplaod in bulk - so get file info (what we can from js client)
			var arrInfo = aBtn.value.split("\\");
			var strFilename = arrInfo[arrInfo.length-1];
			var arrFileInfo = strFilename.split(".");
			var strFileType = arrFileInfo[arrFileInfo.length-1];

			//-- if we have a unc path then set that as path + filename (even though we have not uploaded it yet
			if(strUNCPath!="")
			{
				var strFilePath = strUNCPath + "\\"+ strFilename;
			}
			else
			{
				var strFilePath = "localmachine\\"+ strFilename;
			}
			
			var arrValues = new Array();
			arrValues[0] = strFilename; //-- filename
			arrValues[1] = "n/a";		//-- size
			arrValues[2] = app._formatDate(new Date(),"yyyy-MM-dd hh:mm:ss"); //-- date
			arrValues[3] = strFilePath;//
			arrValues[4] = app.getFileTypeInformation(strFileType); //-- file type
			arrValues[5] = lsession._analystid;		//-- uploader


			swFC._insertrow(arrValues);

			//-- call method to tell developer code file was added to list (not uploaded)
			swFC._executejsevent("OnFileAdded");
		}
	}
}

//-- reload file uncpath
function _swfc_filetable_refresh()
{
	var strRes;
	var strUNCPath = _parse_context_vars(this.path);
	if(strUNCPath=="undefined") 
	{
		strUNCPath = "";
		this.path = "";
	}

	if(strUNCPath!="")
	{
		app.debugstart(this.name + "._refresh [filetable]","FORM CONTROLS");
		app.debugstart(this.name + "._fetchdata [sqltable]","FORM CONTROLS");
		var strParams = "uncpath=" + app.pfu(strUNCPath);
		var strURL = app._root + "service/fileupload/display.php";
		var strRes =  app.get_http(strURL, strParams, true, false, null, null);
		this._ondatafetched(strRes);
		app.debugend(this.name + "._refresh [filetable]","FORM CONTROLS");
	}
	return true;
}


function _swfc_filetable_deletecallattachment()
{
	if(!lsession.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANDELETEATTACHEDFILES,true)) return;

	var aRow = this._currrow;
	if(aRow!=null)
	{
		var strName = aRow.getAttribute("attachname");
		if(confirm("Removing this attachment ("+strName+") will permanently delete it from the system.\n\nDo you wish to continue?"))
		{

			var attID = aRow.getAttribute("attachid");
			var	hdcon = new HelpdeskSession(_swdoc._uniqueformid);
			if(hdcon.DeleteCallAttachment(_swdoc.opencall.callref,attID))
			{
				//-- refresh list
				this._getcallattachments();

				//-- make call diary update so we have a record
				var	hdcon = new HelpdeskSession(_swdoc._uniqueformid);
				hdcon.BeginUpdateCall(_swdoc.opencall.callref);
				hdcon.SendBoolean("publicupdate", false);
				hdcon.SendValue("updatedb.udsource", "File Attachment");
				hdcon.SendValue("updatedb.udcode", "Removed File");
				hdcon.SendText("updatedb.updatetxt", "The " + strName + " file has been removed from the call by " + lsession.analystid);
				hdcon.Commit();
			}
		}
	}
}


function _swfc_filetable_getcallattachments()
{
	this._RemoveAllRows();

	var strParams = "_callref=" + _swdoc.opencall.callref;

	if(this.sortColumn!=-1)
	{
		var strOrder = (this.sortDescending)?"DESC":"ASC";

		strParams += "&_orderby="  + this.sortColumn;//this._getcol(this.sortColumn).dbcolumn;
		strParams += "&_orderdir=" + strOrder;
	}

	app.debugstart(this.name + "._getcallattachments [filetable]","FORM CONTROLS");
	var strURL = app._root + "service/fileupload/callattachments.php";
	var xmlFileList =  app.get_http(strURL, strParams, true, true, null, null);
	app.debugend(this.name + "._getcallattachments [filetable]","FORM CONTROLS");
	if(xmlFileList)
	{
		var xntbt = app.xmlNodeTextByTag; //- -function pointer - saves lookup each time it is used
		var arrFiles = xmlFileList.getElementsByTagName("file");
		for(var x=0;x<arrFiles.length;x++)
		{
			var strID		= xntbt(arrFiles[x],"dataid");
			var strName		= xntbt(arrFiles[x],"filename");
			var iSize		= xntbt(arrFiles[x],"sizeu");
			var strAddedBy	= xntbt(arrFiles[x],"addedby");

			//-- date
			var iTime		= xntbt(arrFiles[x],"timeadded");
			var jsDate		= app._utcdate_from_epoch(iTime,lsession.timezoneOffset);
			var strDate		=  app._formatDate(jsDate,"yyyy-MM-dd HH:mm:ss");

			//-- type
			var arrType = strName.split(".");
			var strType = app.getFileTypeInformation(arrType[arrType.length-1]);

			var arrValues = new Array();
			arrValues[0] = strName; //-- filename
			arrValues[1] = iSize;	//-- size
			arrValues[2] = strType; //-- file type
			arrValues[3] = strDate;  //-- attached on
			arrValues[4] = strAddedBy;	//-- attached by
			var newRow = this._insertrow(arrValues,0,strID);
			if(newRow!=null)
			{
				newRow.setAttribute("attachid",xntbt(arrFiles[x],"dataid"));
				newRow.setAttribute("attachname",strName);
			}
		}
	}
}
//--
//-- EOF filelist methods



//-- 
//-- form control group - used to store a collection of form elements
function _swform_controlgroup(strName)
{
	this.controls = new Array();
	this.name = strName;
	this.visible = true;
	this.enable = true;
}
_swform_controlgroup.prototype._add_element = function (oSwControl)
{
	this.controls[this.controls.length++] = oSwControl;
	this.controls[oSwControl.name] = oSwControl;
}
_swform_controlgroup.prototype._enable = function (bEnable)
{
	this.enable = bEnable;
	for(var x=0;x<this.controls.length;x++)
	{
		this.controls[x]._enable(bEnable);
	}
}
_swform_controlgroup.prototype._visible = function (bVisible)
{
	this.visible = bVisible;
	for(var x=0;x<this.controls.length;x++)
	{
		this.controls[x]._visible(bVisible);
	}
}

