//-- funtions for getting and setting form data
//-- form data table -

var _MASTER = "Main Details Table";
var _RELATED = "Related Table";
var _EXTENDED = "Extended Details Table";
var _DIARY = "Diary Updates Table";

function _swfTable(oJsonDefinition,oSwDoc,jsonCols)
{
	this._swdoc = oSwDoc;
	this._dsn = "";
	this._name = "";
	this._keycolumn = "";
	this._keyvalue = "";
	this._maindetailscolumn = ""
	this._type = ""; //-- master, extended, diary or related
	this._addrecordform ="";
	this._editrecordform ="";
	this._updateverb = "";
	this._maindetailassignments = new Array();

	this._isloaded = false;
	this._columns = new Array();
	this._numcols = new Array();
	this._numericCols = new Array();
	this._colcount=0;
	this._picklist = "";

	this._bRecordDataChanged = true;
	this._bUserDataChanged = false;
	this._initresult =  this._initialise(oJsonDefinition,jsonCols);
}
//-- public

//-- number of cols
_swfTable.prototype.GetCount = function()
{
	return this._colcount;
}

//-- set fields to equal document
_swfTable.prototype.ResetModified =function()
{

	this._bUserDataChanged = false;

	var nColCount = this.GetCount();
	for(var x=0; x<nColCount; x++)
	{
		var strName = this._numcols[x];
		if(strName==undefined) continue;
		this._columns[strName].value = this[strName]
	}
}

//-- has col been modified
_swfTable.prototype.IsModified =function(nCol)
{
	var strName = this._numcols[nCol];
	if(strName==undefined) return false;

	return (this._columns[strName].originalvalue!=this[strName]);
}

_swfTable.prototype.GetColumnName =function(nCol)
{
	var strName = this._numcols[nCol];
	if(strName==undefined) return "";

	return strName;

}
_swfTable.prototype.GetValue =function(nCol)
{
	var strName = this._numcols[nCol];
	if(strName==undefined) return "";
	return this[strName]+"";
}


//-- private table methods
_swfTable.prototype._initialise=function(oJsonDefinition,jsonCols)
{
	var lapp = app;

	this._dsn = oJsonDefinition.dsn;
	if(this._dsn=="" || this._dsn==undefined)this._dsn="swdata";

	this._name = oJsonDefinition.name;

	//-- dd.tables pointer
	var lddt = lapp.dd.tables[this._name];
	if(lddt==undefined)
	{
		alert("The table [" + this._name + "] used by this form does not exist. Please contact your Administrator.");
		return false;
	}
	

	this._type = oJsonDefinition.type;
	this._keycolumn = lddt.PrimaryKey.toLowerCase();


	this._description = oJsonDefinition.description;
	this._picklist = oJsonDefinition.recordPicklist;
	this._maindetailscolumn = oJsonDefinition.mainDetailsColumn;
	this._addrecordform = oJsonDefinition.addRecordForm;
	this._editrecordform = oJsonDefinition.editRecordForm;
	this._updateverb = oJsonDefinition.updateVerb;
	
	var strFromColumn = "";
	var strToColumn = "";
	var arrAssignments= oJsonDefinition.assignments;
	this._maindetailassignments = new Array();
	if(arrAssignments)
	{
		//-- 13.02.2012 - query 87227 / defect 87398
		//-- only one binding so make into array
		if(arrAssignments.assignment.length==undefined) 
		{
			arrAssignments = new Array(arrAssignments.assignment);
		}
		else
		{
			arrAssignments = arrAssignments.assignment;
		}

		var yLen =arrAssignments.length;
		for(var x=0;x< yLen;x++)
		{
			strFromColumn = arrAssignments[x].expression;
			strToColumn = arrAssignments[x].masterRecordColumn;
			this._maindetailassignments[strToColumn] = strFromColumn
		}
	}

	if(this._type==_MASTER)
	{
		//-- set document master pointer and also get data
		this._swdoc._mastertable = this;
	}
	else if(this._type==_EXTENDED)
	{
		this._swdoc._exttable = this;
	}

	//-- set fields to "" or 0
	var undefined;
	var aCol = null;
	var strColID = "";
	var varValue = "";
	var bNumeric = false;
	
	app.debugstart("_swfTable:_initialise:"+this._name+".columns?","xmlform.php");	
	var colLen = jsonCols.length;
	for(var x=0;x<colLen;x++)
	{
		aCol = jsonCols[x]; 
		if(aCol["@sqlType"].indexOf("VARCHAR")>-1)
		{
			varValue="";
		}
		else
		{
			this._numericCols[aCol["@name"]] = true;
			varValue=0;
		}
		this._columns[aCol["@name"]] = _swjsonCol(aCol["@name"], varValue, "",this);
	}
	app.debugend("_swfTable:_initialise:"+this._name+".columns?","xmlform.php");	
	return true;
}


//-- got json data record so add to table[colname]
_swfTable.prototype._initialise_jsondata=function(jsonData)
{
	var me = this;
	var lapp = app;
	if(!_systemform)
	{
		//-- check table right to _CAN_VIEW_TABLEREC
		if(lapp.session.CheckTableRight(me._name,_CAN_VIEW_TABLEREC,true)!="") return false;
	}

	me._columns = new Array();
	me._numcols = new Array();

	var strColName = "";
	for(strColName in jsonData.rawValues)
	{
		me._columns[strColName] = _swjsonCol(strColName, jsonData.rawValues[strColName], jsonData.displayValues[strColName],me);

		//-- store table pk
		if(strColName == me._keycolumn) me._keyvalue= jsonData.rawValues[strColName];
		else if(strColName=="taskid" && me._name == "calltasks") me._keyvalue= jsonData.rawValues[strColName];

	}
	console.log(me._columns)
	me._isloaded = true;
	me._bRecordDataChanged = true;
}




//-- got xml data record so add to table[colname]
_swfTable.prototype._initialise_data=function(xmlData)
{
	var me = this;
	var lapp = app;
	if(!_systemform)
	{
		//-- check table right to _CAN_VIEW_TABLEREC
		if(lapp.session.CheckTableRight(me._name,_CAN_VIEW_TABLEREC,true)!="") return false;
	}

	me._columns = new Array();
	me._numcols = new Array();

	var arrChildNodes = xmlData.childNodes;
	var yLen = arrChildNodes.length;
	var node = null;
	var xntbt = lapp.xmlNodeTextByTag;
	var strColName = "";
	var strColValue = "";
	for(var x=0;x<yLen;x++)
	{
		node = arrChildNodes[x]; 
		if(node.tagName!="")
		{
			strColName = node.tagName;
			strColValue = xntbt(node,"value");
			me._columns[strColName] = _swjsonCol(strColName, strColValue, xntbt(node,"display"),me);

			//-- store table pk
			if(strColName == me._keycolumn) me._keyvalue= strColValue;
			else if(strColName=="taskid" && me._name == "calltasks") me._keyvalue= strColValue;

		}
	}
	me._isloaded = true;
	me._bRecordDataChanged = true;
}

_swfTable.prototype._reset=function()
{
	for(strColID in this._columns)
	{
		var varValue = (app.dd.tables[this._name].columns[strColID].IsNumeric())?0:"";
		this._columns[strColID] = _swjsonCol(strColID, varValue, varValue,this);
			
		//new _swdcolumn(strColID, varValue, varValue,this);
		this[strColID] = varValue;
	}
	this._bRecordDataChanged = true;
}

//--
//-- loop through this record create xml and call service to save data
_swfTable.prototype._savedata=function(boolMasterTable)
{
	var boolSave = false;

	var strFormType = _swdoc.type;
	if(_systemform)strFormType = "system";

	if(boolMasterTable==undefined)boolMasterTable=false;
	
	var strTableName = (this._type==_MASTER && _swdoc._overide_master_save_table!="")?_swdoc._overide_master_save_table:this._name;
	var strDSN = (this._type==_MASTER && _swdoc._overide_dsn!="")?_swdoc._overide_dsn:this._dsn;

	var strAction = (this._keyvalue=="")?"add":"edit";
	var strKeyColumn=this._keycolumn; 
	
	if(!_systemform)
	{
		//-- check table right to addnew or update
		var iCheckAction = (this._keyvalue=="")?_CAN_ADDNEW_TABLEREC:_CAN_UPDATE_TABLEREC;
		if(app.session.CheckTableRight(this._name,iCheckAction,true)!="") return false;;
	}

	//var start = new Date();
	//-- 
	if(this._name=="calltasks" && _swdoc._overide_master_save_table!="")
	{
		strKeyColumn = "taskid:parentgroup";
		this._columns["taskid"].originalvalue = "";
		this._columns["parentgroup"].originalvalue = "";
		this._columns["parentgroupsequence"].originalvalue = "";
	}
	else if(this._name=="calltasks")
	{
		strKeyColumn = "taskid:callref";
		this._columns["taskid"].originalvalue = "";
		this._columns["callref"].originalvalue = "";
		this._columns["parentgroupsequence"].originalvalue = "";
	}

	var bPrimaryKeyOnly = true;
	var strXML = "<dbaction action='"+strAction+"' type='"+strFormType+"' dsn='"+ strDSN+"' table='"+strTableName+"' primarycolumn='"+ strKeyColumn +"'>";
	strXML += "<"+strTableName+">";
	for(strColID in this._columns)
	{
		//-- only send it if it has changed
		if ( (this._columns[strColID].originalvalue!=document[this._name][strColID]) || (strColID.toLowerCase()==this._keycolumn.toLowerCase()) )
		{

			//-- if keycol is auto inc and we are in add mode then do not send it
			if(app.dd.tables[this._name].columns[strColID].autoinc.toLowerCase()=="yes" && strAction=="add" && (strColID.toLowerCase()==this._keycolumn.toLowerCase()) ) continue;

			//-- check if value is something like &[userdb.site] i.e. [use customers site]
			var varSendValue = document[this._name][strColID];
			varSendValue += ""; //-- cast
			if(varSendValue.indexOf("&[")==0) 
			{
				varSendValue = _parse_context_vars(varSendValue);
			}

			//-- is a number that has not been set - so do not bother sending
			if(varSendValue=='' && app.dd.tables[this._name].columns[strColID].IsNumeric()) continue;

			//-- are we sending something other than pkey
			if(bPrimaryKeyOnly && strColID.toLowerCase()!=this._keycolumn.toLowerCase()) bPrimaryKeyOnly = false;


			boolSave = true;
			var strPFS = (app.dd.tables[this._name].columns[strColID].IsNumeric())?"0":"1";
			strXML += "<"+strColID+" pfs='"+strPFS+"'>";
			strXML += ""+ app.pfx(varSendValue)+"";
			strXML += "</"+strColID+">";
		}
	}

	//-- nothing has changed at all so exit (typicall when saving extended data
	if(strAction=="edit" && bPrimaryKeyOnly)return true;

	strXML += "</"+strTableName+"></dbaction>";

	var bStatus = false;	
	if(boolSave)
	{
		//-- call service
		var strURL = app.webroot + "/webclient/service/form/savedata/index.php";;
		var strRes = app.get_http(strURL, "submitxml="+app.pfu(strXML), true, false,  null, null);
	
		var xmlDOM = app.create_xml_dom(strRes);
		var childPos = (xmlDOM.childNodes[1]!=null && xmlDOM.childNodes[1].getAttribute("status")!=null && xmlDOM.childNodes[1].getAttribute("status")!="") ?1:0;
		var strFail = xmlDOM.childNodes[childPos].getAttribute("status");
		bStatus = (strFail=="fail")?false:true;
		if(!bStatus)
		{
			var strCode = app.xmlNodeTextByTag(xmlDOM.childNodes[childPos],"code");
			var strMsg = app.xmlNodeTextByTag(xmlDOM.childNodes[childPos],"error");			
			alert(strMsg); //-- xmlmc doesnt put out decent error messagimg?
		}
		else
		{
			//-- set key value from insert
			if(strAction=="add" && boolMasterTable)
			{
				var newPrimaryKey = app.xmlNodeTextByTag(xmlDOM.childNodes[childPos],"lastInsertId");
				if(newPrimaryKey=="")
				{
					//-- xmlmc does not return lastInsertId if pri column is a string
					newPrimaryKey = app.xmlNodeTextByTag(xmlDOM.childNodes[childPos],strKeyColumn);
				}

				if(newPrimaryKey!="")

				{
					document._mastertable._columns[this._keycolumn].value = newPrimaryKey;
					this._keyvalue = newPrimaryKey;
				}
			}
			this._bRecordDataChanged = true;
			this._bUserDataChanged = false;
			this._swdoc._EnableSave(false);
		}
	}

	return bStatus;
}

//-- returns true if data has changed i.e. swjs code has done opencall.cust_id = 'neilwj'
_swfTable.prototype._check_data_changed = function()
{

	//-- 13.02.2012 - enable save if data has changed at all
	if(this._bUserDataChanged) 
	{
		this._bUserDataChanged = false;
		return true;
	}

	var nColCount = this.GetCount();
	for(var x=0; x<nColCount; x++)
	{
		var strName = this._numcols[x];
		if(strName==undefined) continue;
		if(this._columns[strName].value != this._swdoc[this._name][strName])
		{
			return true;
		}
	}
	return false;
}

//-- update a form field with given value from binding
_swfTable.prototype._update_form_field = function (oEle, strBinding, bInternal)
{
	var arrBind = strBinding.split(".")
	if(arrBind[1]==undefined) return;

	var strTableName = arrBind[0];
	var strColName = arrBind[1];

	//-- dual search field
	if(strColName.indexOf("!")!=-1)
	{
		var arrBind = strColName.split("!")		
		if(this._columns[arrBind[0]]!=undefined && this._columns[arrBind[1]]!=undefined)
		{
			var varValueOne = _swdoc[this._name][arrBind[0]];
			var varValueTwo = _swdoc[this._name][arrBind[1]];

			this._columns[arrBind[0]]._set_value(varValueOne);
			this._columns[arrBind[1]]._set_value(varValueTwo);
			if(varValueOne!="" && varValueTwo!="")
			{
				var strEleValue = varValueOne + " " + varValueTwo;
			}
			else
			{
				var strEleValue = varValueOne + "" + varValueTwo;
			}

			if(oEle.value==strEleValue && !bInternal)
			{
				return;//-- value has not changed so exit
			}

			if(oEle._value(strEleValue,strEleValue,true)!=false)
			{
				if(!bInternal)
				{
					this._bRecordDataChanged = true;
					this._bUserDataChanged=true;
				}
			}
		}

	}
	else if(strBinding.indexOf("&[")!=-1)
	{
		//-- something like a formula field used for labels i.e. : &[userdb.title]
		var eleValue = _parse_context_vars(strBinding,false,true);
		if(oEle.value==eleValue && !bInternal) 
		{
			return;//-- value has not changed so exit
		}

		if(oEle._value(eleValue,eleValue,true)!=false)
		{
			if(!bInternal)
			{
				this._bRecordDataChanged = true;
				this._bUserDataChanged=true;
			}
		}

	}
	else
	{
		if(this._columns[strColName]!=undefined)
		{	
			if(this._type == _MASTER && _formmode=="edit")
			{
				//-- check if field is pk - if so and form mode is disable
				if(strColName==this._keycolumn)
				{
					if(oEle._etype!=FC_LABEL && oEle._etype!=FC_FIELDLABEL)
					{
						oEle._enable(false);
					}
				}
			}
			
			var varValue = this._columns[strColName].value;
			var varDisplayValue = this._columns[strColName].displayvalue;
			if(varValue!=_swdoc[this._name][strColName])
			{
				//-- mismatch - something has been missed some where - this should never happen
				varValue = _swdoc[this._name][strColName];
				varDisplayValue = varValue; //-- as we have no formatter
				this._columns[strColName]._set_value(varValue);
			}

			if(oEle.value==varValue && !bInternal) 
			{
				return;//-- value has not changed so exit
			}

			if(oEle._value(varValue,varDisplayValue,true)!=false)
			{
				if(!bInternal)
				{
					this._bRecordDataChanged = true;
					this._bUserDataChanged=true;
				}
			}
		}
	}
}


function _swjsonCol(strName, strValue, strDisplayValue,oTable)
{
	if(strDisplayValue==undefined || strDisplayValue=="")strDisplayValue=strValue;
	oTable[strName] = strValue;
	oTable._colcount++;
	oTable._numcols[oTable._numcols.length++] = strName;

	//-- make sure numeric fields are set a numeric - 87223 (set colname to lowercase as dd. only uses lowercase)
	//-- 21.03.2012 - do not use ddf numeric check as takes ages in IE
	//if(oTable._namedcols[strName.toLowerCase()]._bIsNumeric && typeof(strValue)!="number" && !isNaN(strValue))
	if(typeof(strValue)!="number" && oTable._numericCols[strName.toLowerCase()])
	{
		strValue--;strValue++;
		oTable[strName]=strValue;
	}

	return {
			"_table"		: oTable,
			"name"			: strName,
			"originalvalue" : strValue,
			"value"			: strValue,
			"displayvalue"	: strDisplayValue,

			_set_value : function(strValue, strFormattedValue)
			{
				this._table[this.name] = strValue;
				this.value = strValue;

				//-- shouldnt need this - 
				if(strFormattedValue=undefined)strFormattedValue=strValue;
				this.displayvalue = strValue;//this._format();
				this._table[this.name] = strValue;
			},

			_format : function()
			{
				return app.dd.tables[this._table._name].columns[this.name.toLowerCase()].FormatValue(this.value);
			}
		};
}

//-- form data table column
function _swdcolumn(strName, strValue, strDisplayValue,oTable)
{
	return _swjsonCol(strName, strValue, strDisplayValue,oTable)
}
