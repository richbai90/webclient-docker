<?php

@include("../../php/_wcconfig.php");

$t = time();

?>

<html>
<title>Webclient Form</title>
<head>
<link rel="stylesheet" href="form.css" type="text/css" />

<script src='../js/jquery-1.11.1.min.js'></script>
<!-- all compressed into swform.scripts.js -->
<!--
<script src='js/min/swform.helpers.js'></script>
<script src='js/min/swform.document.js'></script>
<script src='js/min/swform.form.js'></script>
<script src='js/min/swform.data.js'></script>
<script src='js/min/swform.controls.js'></script>
-->
<script src='loadformjsfiles.php?t=<?php echo $t;?>'></script>

<script>

	var _QAMODE = '<?php echo  _QAMODE ?>';
	_QAMODE=(_QAMODE=='_QAMODE' || _QAMODE=='false')?false:true;

	//-- running in context check
	var __boolInContext = true;
	var __bFormIsModal = false;
	if(window.dialogArguments==undefined)
	{
		//-- running in normal window
		var arrServerInfo = document.location.href.split("sw/webclient");
		if(opener)
		{
			if(opener.app==undefined || opener.app.bWebClient==undefined)
			{
				//-- running page outside of webclient
				__boolInContext = false;
				var strParams = "sessionerrormsg=m2";
				opener.document.location.href = arrServerInfo[0] + "sw/webclient/?" + strParams;
			}
		}
		else
		{
			var app = top.app;
			if(app==undefined || app.bWebClient==undefined)
			{
				//-- running page outside of webclient
				__boolInContext = false;
				var strParams = "sessionerrormsg=m2";
				document.location.href = arrServerInfo[0] + "sw/webclient/?" + strParams;
			}
		}
	}



	if(__boolInContext)
	{
		var bRefreshed=false;
		if(window.dialogArguments!=undefined)
		{
			var info = window.dialogArguments;
		}
		else
		{
			try
			{
				var info = opener.__open_windows[window.name];			
			}
			catch (e)
			{
				try
				{
					var info = window.__app.__open_windows[window.name];
				}
				catch(e)
				{
					bRefreshed=true;
					__boolInContext = false;
					alert("This form cannot be loaded from a refresh. It will be closed by the system");
				}
			}
		
		}

		if((info==undefined) || (info.__formname==undefined))
		{
			if(!bRefreshed)	alert("The form information object could not be found. Please contact your administrator.");
			window.close();
		}
		else
		{
			//var _start = new Date();
			//-- pointer to main app and items
			var _swdoc = top;		
			var app = info.__app;
			var jqWin = $(window);
			var jqDoc = $(document);
			__bFormIsModal = info.__modal;
			
			//-- so we can store any default fields and values to set after a draw
			var bDrawing = false;
			var arrResolveRelatedRecordDataAfterDraw = [];
			
			
			app.debugstart("open form process","xmlform.php","",true);
			app.debugstart("browser loaded documents","xmlform.php");				
			var dd = app.dd;
			var pDDTABLES = dd.tables;
			var lsession = app.session;

			//-- get form type, name, mode etc
			var randomnumber=Math.floor(Math.random()*10000)
			var _uniqueformid = app._date_to_epoch(new Date()) + randomnumber;
			var _inserting = true;
			var _primary_key = info.__recordkey;
			var _formtype = info.__formtype;
			var _formname = info.__formname;
			var _cacheformname = _formtype + "_" + _formname;
			var _formmode = info.__formmode;
			var _systemform = false;
			var _extform_ready = false;
			var _modalCallbackFunction = info.__callback;

			//-- infor bar
			document.infobar = new _sw_infobar();
			_swdoc.infobar =document.infobar;

			//-- var for if opened from sqllist table or listboc
			var _recordsaved = false;
			var _picklist_displaycol = "";  
			var _picklist_displayvalue = ""; //-- so we can pass back the display value

			if(_formtype.indexOf("_system")==0)_systemform = true;
	
			//-- to store vars that should be in document.myvar but as we are in normal html these are in top
			var __arr_global_document_vars = new Array();
			var _arr_mainform_js_names = new Array();
			var _arr_extform_js_names = new Array();

			var strMainFormJavascript = "";
			var strExtFormJavascript = "";
			var strDocumentJS = "";

			//-- check if form info is cached
			var _CacheForm = info.__cachedata;
			
			//var _sdatetime = new Date();
			if(_CacheForm==undefined)
			{
				var strFormJson = info.__formjsonstring;
				var _swDocumentJson = eval("("+strFormJson+");");
				strDocumentJS = "";
				//-- loop document level js
				var arrMethods = _swDocumentJson.espForm.configuration.javascript.methods;
				if(arrMethods)
				{
					arrMethods = arrMethods.method;
					if(arrMethods.length==undefined)arrMethods = new Array(arrMethods);
					for(var x=0; x<arrMethods.length;x++)
					{
						var strName = arrMethods[x].name; 
						var strCode = arrMethods[x].code;

						//-- add "function" to code
						if(strName.toLowerCase()!="(globals)" && strName.toLowerCase()!="(user defined functions)")
						{
							strCode = "function " + strCode;
						}
						else
						{
							//-- try id all global variables
							_get_global_variable_names(strCode);
						}

						strDocumentJS += strCode + "\n";
					}		
					//-- replace xml chars
					if(strDocumentJS.indexOf("undefined")==0)strDocumentJS = strDocumentJS.substring(9);
					//-- document level js is added further down after data is loaded - search for 89418 
				}

				_initialise_swform_javascript();

				//-- store in cache
				var _cache = new Object()		
				_cache.formjsonstring = strFormJson; 
				_cache.arr_document_vars = __arr_global_document_vars;
				_cache.documentjs = strDocumentJS;
				_cache.mainformjs = strMainFormJavascript;
				_cache.extformjs = strExtFormJavascript;
				_cache.mainform_func_names = _arr_mainform_js_names;
				_cache.extform_func_names = _arr_extform_js_names;
				app._save_cache(_cache,_cacheformname);
			}
			else
			{
				var strFormJson = app.__cached_forms[_cacheformname].formjsonstring;
				//-- set vars from cache  - saves evaling js and loading xml from server
				if(strFormJson==undefined)
				{
					alert("The form cached meta data for " + info.__formname + " could not be processed. Please contact your Administrator.");
					window.close();
				}

				var _swDocumentJson = eval("("+strFormJson+");");
				//-- document level js is added further down after data is loaded - search for 89418 

				__arr_global_document_vars = app.__cached_forms[_cacheformname].arr_document_vars; 
				strDocumentJS = app.__cached_forms[_cacheformname].documentjs;
				strMainFormJavascript = app.__cached_forms[_cacheformname].mainformjs;
				strExtFormJavascript = app.__cached_forms[_cacheformname].extformjs;
				_arr_mainform_js_names = app.__cached_forms[_cacheformname].mainform_func_names;
				_arr_extform_js_names = app.__cached_forms[_cacheformname].extform_func_names;
			}
		}

	} //-- eof in context

	var _form_toolbar=null;
	var _form_toolbar_holder=null;
	var _swdoc_pointer=null;
	var _boolInitialised = false;

	function _regexreplace(strValue,strFind,strReplace)
	{
		  var re = new RegExp(strFind, "g");
		  strValue = strValue.replace(re, strReplace);
		  return strValue;
	}
	
	function _initialise_swdocument()
	{
	
		app.debugend("browser loaded documents","xmlform.php");	
		app.debugstart("_initialise_swdocument()","xmlform.php");	

		if(!__boolInContext) return false;

		//-- pointer to toolbar holder
		_form_toolbar_holder = document.getElementById('_form_toolbar_holder');
		
		//-- only init once
		if(_boolInitialised) return;
		_boolInitialised = true;

		app.debugstart("_initialise_swdocument:new _swdocument","xmlform.php");	
		_swdoc_pointer = new _swdocument();
		if(_swdoc_pointer._initok==false) return;
		app.debugend("_initialise_swdocument:new _swdocument","xmlform.php");	


		

		//--used by swjs call action forms to get callref and special feilds when forms opened from email etc
		_swdoc_pointer._form = new Object();
		_swdoc_pointer._form.callrefs = _primary_key + "";
		if(info.__form!=undefined)
		{
			for(strItem in info.__form)
			{
				_swdoc_pointer._form[strItem] = info.__form[strItem];
			}

			//-- known special _form values
			if(_swdoc_pointer._form["issueref"]==undefined)_swdoc_pointer._form["issueref"] = "";
			if(_swdoc_pointer._form["resolve"]==undefined)_swdoc_pointer._form["resolve"] = "0";
			if(_swdoc_pointer._form["updatetext"]==undefined)_swdoc_pointer._form["updatetext"]="";
			if(_swdoc_pointer._form["PreloadType"]==undefined)_swdoc_pointer._form["PreloadType"]="0";
			if(_swdoc_pointer._form["ProbCodeSla"]==undefined)_swdoc_pointer._form["ProbCodeSla"]="";
			if(_swdoc_pointer._form["ProbCode"]==undefined)_swdoc_pointer._form["ProbCode"]="";
			if(_swdoc_pointer._form["ProbCodeDesc"]==undefined)_swdoc_pointer._form["ProbCodeDesc"]="";
			if(_swdoc_pointer._form["attach"]==undefined)_swdoc_pointer._form["attach"]=new Array();;


			//-- contains "mailbox name\message id"
			if(_swdoc_pointer._form["_source_email"]==undefined)_swdoc_pointer._form["_source_email"]=false;
			if(_swdoc_pointer._form["subject"]==undefined)_swdoc_pointer._form["subject"]="";
			if(_swdoc_pointer._form["messagesource"]==undefined)_swdoc_pointer._form["messagesource"]="";
			if(_swdoc_pointer._form["emailsubject"]==undefined)_swdoc_pointer._form["emailsubject"]="";
			if(_swdoc_pointer._form["mailbox"]==undefined)_swdoc_pointer._form["mailbox"]="";
			if(_swdoc_pointer._form["emailid"]==undefined)_swdoc_pointer._form["emailid"]=0;
			if(_swdoc_pointer._form["callactionform"]==undefined)_swdoc_pointer._form["callactionform"]=false;
			if(_swdoc_pointer._form["emaildatetimex"]==undefined)_swdoc_pointer._form["emaildatetimex"]=0;
		}

		if(_primary_key=="" && _formmode == "add")
		{
			for(strParam in document._params)
			{
				if(document._mastertable!=null && strParam == document._mastertable._keycolumn)
				{
					_primary_key = document._params[strParam];
					_formmode = "edit";
					break;
				}
			}	
		}			

		//-- load data	
		//--
		if(document.GetArg("fromlfcresolve")=="" && _primary_key!="" && _primary_key!=undefined && _swdoc_pointer._form["callactionform"]!=true)
		{
			if(document._mastertable!=null)
			{
				app.debugstart("_initialise_swdocument:load master form data","xmlform.php");	
				document._loaddata(_primary_key);
				app.debugend("_initialise_swdocument:load master form data","xmlform.php");	
				if (document._mastertable[document._mastertable._keycolumn]=="" || document._mastertable[document._mastertable._keycolumn]==0)
				{
					alert("No record found in ["+document._mastertable._name+"] for ["+_primary_key+"].");
					document.CloseForm();
				}
			}
		}
		else
		{
			document._init_title();
			if(document.GetArg("fromlistbox")=="1" || document.GetArg("fromlfcresolve")=="1")
			{
				//-- set value that was typed in listbox
				if(document._mastertable._columns[document.GetArg("displaycolumn")]!=undefined)
				{
					document._mastertable._columns[document.GetArg("displaycolumn")]._set_value(document.GetArg("interimvalue"),document.GetArg("interimvalue"));
				}
			}
		}

		app.debugstart("_initialise_swdocument:store doc pointers","xmlform.php");	
		//--
		//-- store everything in top so functions can find them	i.e. can use just mainform.tb instead of _swdoc.mainform
		for(strItem in _swdoc_pointer)
		{
			try
			{
				if(_swdoc[strItem]==undefined)	_swdoc[strItem] = _swdoc_pointer[strItem];				
			}
			catch (e)
			{

			}
		}
		document._form.probcodesla = "";
		app.debugend("_initialise_swdocument:store doc pointers","xmlform.php");	


		window.mainform = document.mainform;
		window.extform = document.extform;

		//-- resize window to mainforms size	
		app.debugstart("_initialise_swdocument:mainform._draw()","xmlform.php");	
		top.bDrawing = true;
		document.mainform._draw();
		app.debugend("_initialise_swdocument:mainform._draw()","xmlform.php");

		//-- save form html o cache so faster drawing it next time
		if(app.__cached_forms[_cacheformname]["mainformhtml"]==undefined)
		{
			app.__cached_forms[_cacheformname]["mainformhtml"] = document.mainform._targetdocument.body.innerHTML;
		}

		if(document.extform!=undefined && document.extform!=null && document.extform._targetdocument!=null)
		{
			_wait_for_extform();
		}
		else
		{
			app.debugstart("_initialise_swdocument:mainform._targetframe._init_top_var_pointers()","xmlform.php");	
			document.mainform._targetframe._init_top_var_pointers();
			app.debugend("_initialise_swdocument:mainform._targetframe._init_top_var_pointers()","xmlform.php");	
			app.debugend("_initialise_swdocument()","xmlform.php");	
			
			_process_initial_dataload();
		}
	}

	function _wait_for_extform()
	{
		if(_extform_ready)
		{
			app.debugstart("_initialise_swdocument:extform._draw()","xmlform.php");	
			document.extform._draw();	
			app.debugend("_initialise_swdocument:extform._draw()","xmlform.php");	
		
			app.debugstart("_initialise_swdocument:mainform._targetframe._init_top_var_pointers()","xmlform.php");	
			document.mainform._targetframe._init_top_var_pointers();
			app.debugend("_initialise_swdocument:mainform._targetframe._init_top_var_pointers()","xmlform.php");	
			
			//-- save form html
			if(app.__cached_forms[_cacheformname]["extformhtml"]==undefined)
			{
				app.__cached_forms[_cacheformname]["extformhtml"]= document.extform._targetdocument.body.innerHTML;
			}
			app.debugstart("_initialise_swdocument:extform._targetframe._init_top_var_pointers()","xmlform.php");	
			document.extform._targetframe._init_top_var_pointers();
			app.debugend("_initialise_swdocument:extform._targetframe._init_top_var_pointers()","xmlform.php");	

			app.debugend("_initialise_swdocument()","xmlform.php");	
			_process_initial_dataload();
		}
		else
		{
			setTimeout("_wait_for_extform()",200);
		}
	
	}

	function _process_initial_dataload()
	{
		top.bDrawing = false;

		if(app.browserClassName!="")
		{
			$(document.body).addClass(app.browserClassName);
		}
		
		
		//-- hide loading image	
		_handle_window_resize($("#if_mainform"));				
		//if(!app.isIE8)$("#imgloader").hide();		
		setTimeout(_after_draw_dataload,10)
	}
	function _after_draw_dataload()
	{
		//-- local pointers to doc or app pointers - saves lookups in ie
		var undefined;
		var lapp = app;
		var xntbt = lapp.xmlNodeTextByTag;
		var l_swdoc = _swdoc;
		var l_swdoc_pointer = _swdoc_pointer;

		lapp.debugstart("_process_initial_dataload()","xmlform.php");	

		for(strBinding in top.arrResolveRelatedRecordDataAfterDraw)
		{
			document._set_data_value(top.arrResolveRelatedRecordDataAfterDraw[strBinding],strBinding,false);
		}
		
		//-- disable fields that are special when in call detail mode
		if(document._disable_special_bindings)
		{
			lapp.debugstart("_process_initial_dataload:_disable_special_bindings","xmlform.php");	
			document._disable_special_bindings();
			lapp.debugend("_process_initial_dataload:_disable_special_bindings","xmlform.php");	
		}
		//-- if logging from email then load in email data
		if(l_swdoc._form['PreloadType']==1 && _formtype==_LCF)
		{
			//-- set logdatex
			if(document._useEmailDateToLogCall && l_swdoc_pointer._form["emaildatetimex"]>0)
			{
				document.opencall.logdatex = l_swdoc_pointer._form["emaildatetimex"];
			}

			//-- set updatedb text
			document.updatedb.updatetxt = l_swdoc._form.updatetext;
			//-- do we have cust id for email
			if(lapp._current_email_customerid!="")
			{
				//document._params["userdb.keysearch"] = app._current_email_customerid;
				if(document._tables["userdb"])	
				{
					document._set_data_value(lapp._current_email_customerid,"userdb." + document._tables["userdb"]._keycolumn,false);
				}
			}
		}

		//-- and add attachments
		if (l_swdoc._form['PreloadType']==1)
		{
			//-- get any email attachments - add to ._['attach(n)'] 
			var oFile;
			var arrEmailFiles = lapp._copy_emailattachments_for_form(l_swdoc._form["emailid"],l_swdoc._form["mailbox"],_uniqueformid);
			for(var x=0;x<arrEmailFiles.length;x++)
			{
				oFile = new Object();
				oFile.filename = xntbt(arrEmailFiles[x],"fileName");
				oFile.filesize = xntbt(arrEmailFiles[x],"fileSize");
				oFile.timestamp = xntbt(arrEmailFiles[x],"timeStamp");
				l_swdoc._form['attach' + x] = oFile;
				l_swdoc._form['Attach' + x] = oFile; //-- because in applications have referenced Attached as key item
			}
		}


		//--
		//-- 89418 - add sw document level functions and vars into html document context after data has loaded
		var g = document.createElement('script');
		var s = document.getElementsByTagName('script')[0];
		g.text = strDocumentJS;
		s.parentNode.insertBefore(g, s);

		//-- on form loading
		app.debugstart("_initialise_swdocument:application.document._OnFormLoaded","xmlform.php");	
		document._OnFormLoading();
		app.debugend("_initialise_swdocument:application.document._OnFormLoaded","xmlform.php");	
		if(_bClosingForm) return false; //-- developer called document.CloseForm in document.onformloaded event

		//-- check if an xmlmc data driven form
		if(document._bXmlForm)
		{
			if(_primary_key=="" && _formmode == "add")
			{
				//-- inserting so shouldnt need to do anything
			}
			else
			{
				//-- updating so load data into memory
				document._FormXmlmcLoadData(_swdoc._primary_key);
			}
		}	
		//-- eof 89418 

		//-- apply data to form and filter lists
		//if(app.isIE8)$("#imgloader").hide();		
		lapp.debugstart("_process_initial_dataload:UpdateFormFromData","xmlform.php");	
		document.UpdateFormFromData(undefined,true);
		lapp.debugend("_process_initial_dataload:UpdateFormFromData","xmlform.php");	

		lapp.debugstart("_process_initial_dataload:_show_form_frame","xmlform.php");	
		$('#_tc_mainform').trigger("click");
		lapp.debugend("_process_initial_dataload:_show_form_frame","xmlform.php");	

		if(document._SetupToolbarState)
		{
			lapp.debugstart("_process_initial_dataload:_SetupToolbarState","xmlform.php");	
			document._SetupToolbarState(true);
			lapp.debugend("_process_initial_dataload:_SetupToolbarState","xmlform.php");	
		}

		lapp.debugend("_process_initial_dataload()","xmlform.php");	

		//-- exec forms on form, loaded js
		setTimeout("_load_forms()",5);
	}

	var _SWF_INCOMING_CALL = false;
	var _cdf_refresh_polling = 3000; //-- 3 seconds
	var _formIsLoading = true;
	function _load_forms()
	{		
		app.debugstart("_load_forms()","xmlform.php");	

		var undefined;
		var l_swdoc_pointer=_swdoc_pointer;
		_formIsLoading = false;

		
		
		//-- if cdf or lcf create temp workflow table
		if(_formtype==_LCF||_formtype==_CDF) 
		{
			app.debugstart("_load_forms:CreateTempWorkflowTable","xmlform.php");	
			document._CreateTempWorkflowTable();
			app.debugend("_load_forms:CreateTempWorkflowTable","xmlform.php");	
		}

		//-- if LCF and we have passed in params that match data bindings then resolve
		if(_formtype==_LCF) 
		{
			//-- load any qlc data
			if(l_swdoc_pointer._form["_qlc_data"]!=undefined)
			{
				document._process_qlc_data(l_swdoc_pointer._form["_qlc_data"]);
				l_swdoc_pointer._form["_qlc_data"] = null;
			}
			
			//-- 88784 - flag to check if we are resolving from an incoming call
			document._ResolvingIncomingRecords = false;
			for(strParam in document._params)
			{
				if(strParam.indexOf(".")>0 && document._params[strParam]!="")
				{
					var arrParam = strParam.split(".");
					if(document._tables[arrParam[0]])
					{
						document._ResolvingIncomingRecords = false;
						document.ResolveRecord(arrParam[0],arrParam[1],document._params[strParam],true,true);
					}
					else if( (arrParam[0]=="incoming") && (document.opencall[arrParam[1]]!=undefined))
					{
						//-- 88784 - set incoming value - set flag to indicating resolving from an incoming call
						document._ResolvingIncomingRecords = true;
						document._reverse_resolve_relateddata("opencall." + arrParam[1],document._params[strParam],true);
						document._set_data_value(document._params[strParam],"opencall." + arrParam[1],false);
						document._tables["opencall"][arrParam[1]] = document._params[strParam];
					}
				}
			}
			document._ResolvingIncomingRecords = false; //- 88784 - reset flag and initial resolve completed

			//-- incoming so set flag and update form data
			if((document.opencall.status==8) && (document.opencall.callref>0))
			{
				_SWF_INCOMING_CALL = true;
				if(document.updatedb!=undefined)document.updatedb.updatetxt = document.opencall.prob_text;
				document.UpdateFormFromData();
			}

		}//-- if lfc

		//-- load file attachs
		if(document.getElementById('_tc_files').style.display=='block')
		{
			var ifFiles = document.getElementById('if_files');
			if(ifFiles.contentWindow && ifFiles.contentWindow._load_form_canvas)
			{
				var f = ifFiles.contentWindow._load_form_canvas;
				setTimeout(f,1000);
			}
		}

		//-- must load ext form function first if extform exists - mimic fullclient
		if(this._load_extform && document.extform!=undefined)
		{
			app.debugstart("_load_forms:application.extform._OnFormLoaded","xmlform.php");	
			document.extform._initialise_flagcontrols();
			document.extform._OnFormLoaded(false);
			app.debugend("_load_forms:application.extform._OnFormLoaded","xmlform.php");	
			if(_bClosingForm) return false; //-- developer called document.CloseForm in extform.onformloaded event
		}

		//-- trigger mainform onformloaded events
		document._isloading = false;
		app.debugstart("_load_forms:application.mainform._OnFormLoaded","xmlform.php");	
		document.mainform._initialise_flagcontrols();
		
		//-- hide loading image
		var emsg = document.getElementById("imgloader");
		if(emsg!=null)emsg.style.display="none";
		
		
		document.mainform._OnFormLoaded(false);
		app.debugend("_load_forms:application.mainform._OnFormLoaded","xmlform.php");	
		if(_bClosingForm) return false; //-- developer called document.CloseForm in mainform.onformloaded event


		app.debugstart("_load_forms:application.document._OnFormLoaded","xmlform.php");	
		document._OnFormLoaded();

		app.debugend("_load_forms:application.document._OnFormLoaded","xmlform.php");	
		if(_bClosingForm) return false; //-- developer called document.CloseForm in document.onformloaded event


		//-- check in 3 seconds to see if call has since been updated
		if(document._CheckLastUpdateDate!=undefined)
		{
			//-- get polling info
			var inRefreshValue = app.dd.GetGlobalParamAsNumber("webclient settings/call detail/refreshpolling");
			if(inRefreshValue!="" && inRefreshValue>0)
			{
				_cdf_refresh_polling = (inRefreshValue * 1000);
			}
			setTimeout("document._CheckLastUpdateDate()",_cdf_refresh_polling);
		}

		app.debugend("_load_forms()","xmlform.php");	


		var oDebugInfo = app.debugend("open form process","xmlform.php","",true);
		/*
		if(oDebugInfo)
		{

			botRight.hide();
		
			//-- display timing info
			var strTimer = "FLT : " + oDebugInfo.time + "ms (B:"+ oDebugInfo.browsertimer +" N:"+oDebugInfo.networktimer +" S:"+oDebugInfo.phptimer+")";
			app.setElementText(document.getElementById("botright"),strTimer);
			botRight.show();
			botRight.css({"z-index":99999999});
			setTimeout("hide_timer_message()",5000);
		}
		*/
	}
	function hide_timer_message()
	{
		document.getElementById("botright").style.display = "none";
		if(!app._bDebugMode)app.debugclear();
	}

	function _parse_context_vars(strParseString, boolPFS,boolFormat)
	{	
		try
		{
			var lparsefunc = app._swc_parse_variablestring;
			strParseString +="";
			var iStart = strParseString.indexOf("&[");
			if(iStart>-1)
			{
				return lparsefunc(strParseString,document,boolPFS,boolFormat);
			}
			else
			{
				return strParseString;
			}

		}
		catch (e)
		{
			return strParseString;
		}
	}

	var _AdjustFrameiTop = 0;
	var _intToolbarHeight = 0;
	var _current_iframe = null;
	function _show_form_frame(aTab)
	{
		var lapp = app;
		var ele_tr_tabbar = document.getElementById("_tr_tabbar");
		var ele_tr_toolbar = document.getElementById("_tr_toolbar");
		var isFFLT10 = (lapp.isFirefox && lapp.BrowserDetect.version<10);
		var isFFLT11 = (lapp.isFirefox && lapp.BrowserDetect.version<11);

		if(_formtype!=_CDF && _formtype!=_LCF)
		{
			var strNewFrame = "if_"+ aTab.id.split("_")[2];
			var newFrame = document.getElementById(strNewFrame);
			_current_iframe =  newFrame;

			//-- std form
			if(app.isFirefox)
			{
				document.getElementById("if_mainform").style.top = (isFFLT11)?"-2":"2";
			}
			else
			{
				document.getElementById("if_mainform").style.top = 0;
			}
			document.getElementById("if_extform").style.top = 0;
			document.getElementById("if_diary").style.top = 0;
			document.getElementById("if_files").style.top = 0;
			document.getElementById("if_www").style.top = 0;
			document.getElementById("if_workflow").style.top = 0;


		}
		else
		{
			var tc = document.getElementById("_form_tabcontrol");
			if(tc!=null)
			{
				var strFrame = tc.getAttribute("currframe");
				var currFrame =document.getElementById(strFrame);
				
				var strNewFrame = "if_"+ aTab.id.split("_")[2];
				var newFrame = document.getElementById(strNewFrame);
				
				//-- 87313 - append session to url / 87904 parse url each time as data may have changed
				if(strNewFrame=="if_www" && document.customHtmlTab)
				{
					document.getElementById('_tc_www').innerHTML = _parse_context_vars(document.customHtmlTab.name);
					document.getElementById('if_www').src = _parse_context_vars(app._append_swsession(document.customHtmlTab.url));
				}
				
				if(currFrame!=newFrame)
				{
					var strOldFrameName = strFrame.split("_")[1];
					var ltab = document.getElementById("_tc_" + strOldFrameName);
					if(ltab!=null)	
					{
						ltab.className="tab";
						//if(app.isChrome || isFFLT11)
						//{
						//	ltab.style.top=4;
						//}
					}
					//currFrame.style.visibility = "hidden";
					currFrame.style.zIndex="0";
					//-- handle any spec ops for frame type when hiding
					if(currFrame.contentWindow && currFrame.contentWindow._onhide)currFrame.contentWindow._onhide();
				}

				if(newFrame!=null)
				{
					_current_iframe =  newFrame;				
					newFrame.style.top = ele_tr_tabbar.offsetHeight + ele_tr_toolbar.offsetHeight;
					_AdjustFrameiTop = ele_tr_tabbar.offsetTop - 1 + ele_tr_tabbar.offsetHeight;
					_intToolbarHeight =ele_tr_toolbar.offsetHeight;				
					//newFrame.style.top = _AdjustFrameiTop + 3;

					aTab.className = "tab-selected";
					//if(app.isChrome || isFFLT11)
					//{
					//	aTab.style.top=3;
					//}
					tc.setAttribute("currframe",strNewFrame);
					_current_iframe.style.zIndex=600;
					_current_iframe.style.visibility = "visible";
					
					//-- handle any spec ops for frame type when showing
					if(newFrame.contentWindow && newFrame.contentWindow._onshow)
					{
						newFrame.contentWindow._onshow();
					}
				}
			}
		}

		_handle_window_resize();
	}

	//-- 
	function _get_global_variable_names(strCode)
	{
		if(strCode.indexOf("undefined")==0)strCode = strCode.substring(9);

		var lapp = app;
		var strLine = "";
		var arrMultVar = new Array();
		var arrTmp = new Array();
		var arrVar = new Array();
		var arrCodeLines = strCode.split("\n");
		for(var x=0;x<arrCodeLines.length;x++)
		{
			if(arrCodeLines[x].indexOf("var ")>-1)
			{
				var strLine = arrCodeLines[x];
				arrVar = strLine.split(";");
				if(arrVar.length==0 || arrVar.length==1)
				{
					//-- have declared something like [var myvariable = 10\n] or [var myvariable\n] 
					arrVar = arrVar[0].split("=");
					if(arrVar[0]==undefined) continue;
					__arr_global_document_vars[__arr_global_document_vars.length++] = lapp.trim(arrVar[0].split("var ")[1]);
				}
				else 
				{
					//-- have declared something like [var myvariable; myvartwo=2; var myvar;\n]
					for(var y=0;y<arrVar.length;y++)
					{
						arrMultVar = arrVar[y].split("=");
						arrTmp = arrMultVar[0].split("var ");
						if(arrTmp.length==0)
						{
							//-- so bit in [] -- var myvariable; [myvartwo]=2; var myvar;\n
							if(arrTmp[0]==undefined) continue;
							__arr_global_document_vars[__arr_global_document_vars.length++] = lapp.trim(arrTmp[0]);
						}
						else
						{
							if(arrTmp[1]==undefined) continue;
							__arr_global_document_vars[__arr_global_document_vars.length++] = lapp.trim(arrTmp[1]);
						}
					}
				}
			}
			else if(arrCodeLines[x].indexOf("function ")>-1)
			{
				//-- store function name
				var strLine = arrCodeLines[x];
				arrVar = strLine.split("(");
				if(arrVar[0].indexOf("function ")>-1)
				{
					//-- we have a function
					arrVar = arrVar[0].split("function ");
					if(arrVar[1]==undefined) continue;
					__arr_global_document_vars[__arr_global_document_vars.length++] = lapp.trim(arrVar[1]);
				}
			}
		}
	}

	

	function _initialise_swform_javascript()
	{
		//-- store mainform and ext form js
		//-- mainform
		var fjson = _swDocumentJson.espForm;
		var layout = (fjson.layout==undefined)?fjson.layouts.layout[0]:fjson.layout;
		strMainFormJavascript = _process_jsonform_js(layout,"mainform");
		if(strMainFormJavascript==undefined)
		{
			strMainFormJavascript="";
		}
		
		//-- extform
		var jsonExtform = fjson.extendedLayout;
		if(jsonExtform!=null && jsonExtform!=undefined)
		{
			strExtFormJavascript= _process_jsonform_js(jsonExtform,"extform");
		}
		if(strExtFormJavascript==undefined)
		{
			strExtFormJavascript="";
		}

		//-- eof js stuff
		//-- 

	}

	function _process_jsonform_js(oJsonForm,strFormName)
	{
		//-- make local pointers so browser jscript does not have to do lookup each time used
		var lapp = app;
		var strJS = "";

		var strLine ="";
		var arrLine = new Array();
		var strNameLine = "";
		var arrName = new Array();
		var strName = "";
		var arrFormDefinedCode = new Array()
		var strNameL = "";
		var strCode = "";

		var MainJS = oJsonForm.javascript.methods; 
		if(MainJS!=undefined)
		{
			var arrMethods = MainJS.method;
			if(arrMethods==undefined) return "";
			if(arrMethods.length==undefined) arrMethods = new Array(arrMethods);

			for(var x=0; x<arrMethods.length;x++)
			{
				var strName = arrMethods[x].name;
				var strNameL = strName.toLowerCase();
				var strCode = arrMethods[x].code;
				if(strCode.indexOf("undefined")==0)strCode = strCode.substring(9);

				//-- add "function" to code
				if( (strNameL!="(globals)") && (strNameL!="(user defined functions)") )
				{
					if(strName.indexOf(" ")!=-1)continue; //-- do not allow function names with spaces
					if(strFormName=="mainform")
					{
						_arr_mainform_js_names[strName] = strName;
					}
					else
					{
						_arr_extform_js_names[strName] = strName;
					}

					strJS += 'function ';
				}
				else
				{
					//-- loop through code and store function names
					arrFormDefinedCode = strCode.split('\n');
					for(var y=0; y<arrFormDefinedCode.length;y++)
					{
						if(arrFormDefinedCode[y].indexOf('function ')>-1)
						{
							//-- have a function name so store it
							strLine = arrFormDefinedCode[y];
							arrLine = strLine.split('function ');
							strNameLine = arrLine[1];
							arrName = strNameLine.split("(");
							strName = lapp.trim(arrName[0]);
							if(strFormName=='mainform')
							{
								_arr_mainform_js_names[strName] = strName;
							}
							else
							{
								_arr_extform_js_names[strName] = strName;
							}
						}
					}			
				}
				strJS +=  strCode + "\n";
			}		
		}
		
		return strJS;
	}

	function find(selector,documentLevel)
	{
		if(documentLevel)
		{
			return jqDoc.find(selector,documentLevel);
		}
		else
		{
			return jqDoc.find(selector);
		}
	}
	
	function _handle_window_resize(useiframe)
	{
		if(useiframe==undefined) useiframe = (_current_iframe)?_current_iframe:$("#if_mainform");
		if(useiframe!=null)
		{
			if(useiframe.find==undefined)useiframe = $(useiframe);
			
			var tc = $("#_form_tabcontrol");
			var tbar = $("#_tr_toolbar");
			_intToolbarHeight = tbar[0].offsetHeight;
			_AdjustFrameiTop = 0;
			if(tc[0] && tc.is(":visible")!=null)
			{
				var trTabBar = $("#_tr_tabbar");
				_AdjustFrameiTop = trTabBar[0].offsetTop - 1 + trTabBar[0].offsetHeight
				
				if(app.isFirefox && app.BrowserDetect.version<10)
				{
					useiframe.css({top : _AdjustFrameiTop + _intToolbarHeight + 1});
				}
				else
				{
					useiframe.css({top : _AdjustFrameiTop + 1});
				}
				
				//-- 
				var adjustW = trTabBar.width();
				tc.width(adjustW)
				
			}
			
			useiframe.css({height:GetWinHeight() - (_intToolbarHeight + _AdjustFrameiTop),width:GetWinWidth(),visibility:"visible"});

			if(useiframe[0].contentWindow._resize_form)
			{
				useiframe[0].contentWindow._resize_form(useiframe.width(),useiframe.height());
			}

		}
	}


	var _bClosingForm = false;
	var _fClosingFormCode = null;
	window.onbeforeunload = _handle_before_close;
	function _handle_before_close()
	{
		_fClosingFormCode = null;

		if(!__boolInContext) 
		{
			return;
		}

		//-- set return object here (for chrome)
		_set_modal_return_object();

		//-- 19.07.2012 - call form closing event - check return for WC specific object
		var bForceMessage = false;
		var jsCloseHandler = document._OnFormClosing();
		if(typeof(jsCloseHandler)=="object")
		{
			//-- apps dev are handling form close
			bForceMessage = true;
			var message = jsCloseHandler.message;
			if(jsCloseHandler.onclosexecute)_fClosingFormCode = jsCloseHandler.onclosexecute
		}
		else
		{
			 //-- firefox does not allow custom message but ie/chrome and safari do
			 var message = 'There is unsaved data on the form. If you choose to close the form any unsaved data will be lost.';
		}

		//-- if save is enabled promp to save changes
		if(document._mastertable && (document._bSaveEnabled || bForceMessage))
		{
			 if (typeof evt == 'undefined') 
			 {
				evt = window.event;
			 }
			 if (evt) 
			 {
				evt.returnValue = message;
			 }
			 return message;
		}
		
	}

	window.onunload = _handle_window_close;
	function _handle_window_close()
	{
		try
		{
			//-- if cdf or lcf drop temp workflow table
			document._DropTempWorkflowTable();

			if(_fClosingFormCode)
			{
				_fClosingFormCode();
			}
		}
		catch (e)
		{
		}

		//-- call tidy up script to delete any associate temp files (call action forms)
		try
		{		
			//-- will fail if main window crashes - so put in a try
			var strParams = "swsessionid="+app._swsessionid+"&_uniqueformid=" + _uniqueformid + "&_mimefolder="+ _swdoc_pointer._form['_mimefolderid'];
			var strURL = app.get_service_url("form/tidyup","");
			app.get_http(strURL, strParams, false, false, null, null);
		}
		catch (e)
		{
		}

		//-- jul 2015 - check for modal callback function - call it and pass in the type of form we are returning
		window.__app._on_window_closed(window.name);
		
	}

	function oktocopy(varName)
	{
	
		switch(varName)
		{
			case "app":
			case "window":
			case "document":
			case "top":
			case "returnValue":
				return false;
		}
		return true;
	}
	function _set_modal_return_object()
	{
		//-- set return value so user can access form i.e. when using OpenForm in modal
		//-- any global vars 
		_swdoc_pointer = [];
			
		//-- NWJ permformance hit (see if it affect func)
		for(var x=0; x<__arr_global_document_vars.length;x++)
		{
			//-- if exists in top then add document pointer
			if(top[__arr_global_document_vars[x]]!=undefined && typeof(top[__arr_global_document_vars[x]])!="function" && oktocopy(__arr_global_document_vars[x]))
			{
				try{
						
						_swdoc_pointer[__arr_global_document_vars[x]] = top[__arr_global_document_vars[x]];//top[__arr_global_document_vars[x]];

				}
				catch(e){}
			}
		}

		for(strItemID in top)
		{
			//-- if exists in top then add document pointer
			if(typeof(_swdoc[strItemID])!="function" && _swdoc_pointer[strItemID]==undefined && oktocopy(strItemID))
			{
				//-- 0.1.9.2 - catch any error
				try
				{
					_swdoc_pointer[strItemID] = top[strItemID];						
				}
				catch (e)
				{
					//- -failed trying to copy something like clipboard or other protected document pointer
				}
			}
		}
		try
		{
			app.__open_windows[window.name].returnInfo = new Object();
			app.__open_windows[window.name].returnInfo._swdoc = _swdoc_pointer; //-- as may have sapped out document in swjs
			app.__open_windows[window.name].returnInfo.document = _swdoc_pointer;
			app.__open_windows[window.name].returnInfo.recordsaved = _recordsaved;
			app.__open_windows[window.name].returnInfo.newrecordkey = _primary_key;		
			app.__open_windows[window.name].returnInfo.picklistdisplay = _picklist_displayvalue;
		}
		catch(e){}

	}

	function _handle_drag_drop(ev)
	{
		app.stopEvent(ev);
		return false;
	}
	
	function onloadEvents()
	{
		window.focus();	
	}

</script>
<!-- load thi slast as it referes to app.-->
<script src='../js/system/swc.constants.js'></script>

</head>

<body onload="onloadEvents()" onresize='_handle_window_resize();' ondrop="return _handle_drag_drop(event);" ondragover="return _handle_drag_drop(event);" ondragenter="return _handle_drag_drop(event);" oncontextmenu="return false">
<div class="sizeHoriz"></div><div class="sizeVert"></div>
<div id='imgloader'>..initialising..please wait..</div>
<table style='position:relative;' width="100%" height="100%" border="0" cellspacing='0' cellpadding='0'>
	<tr id='_tr_toolbar'>
		<td>
			<table border="1" cellspacing='0' cellpadding='0' width="100%" style='background-color:#efefef;'>
				<tr>
					<td>
						<div id='_form_toolbar_holder' class='toolbar' style='display:none;'></div>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td height="100%" valign="top" >
			<table style='position:relative;' width="100%" height="100%" border="0" cellspacing='0' cellpadding='0'>
				<tr id='_tr_tabbar' style='display:none;'>
					<td id='_tr_tabbar_td' valign="top">
						<div id='_form_tabcontrol' class='tabcontrol' style='display:none;width:100%;' currframe='if_mainform'>
							<span id='_tc_mainform' class='tab-selected'  onclick='_show_form_frame(this);'>Details</span>
							<span id='_tc_extform'  class='tab-hidden' onclick='_show_form_frame(this);'>Extform</span>
							<span id='_tc_diary'    class='tab-hidden' onclick='_show_form_frame(this);'>Call Diary</span>
							<span id='_tc_workflow' class='tab-hidden' onclick='_show_form_frame(this);'>Workflow</span>
							<span id='_tc_files'    class='tab-hidden' onclick='_show_form_frame(this);'>File Attachments</span>
							<span id='_tc_www'		class='tab-hidden' onclick='_show_form_frame(this);'>www</span>
						</div>
					</td>
				</tr>
				<tr>
					<td class="td-iframe-holder" width='100%' valign="top">
							<iframe id='if_mainform' name='if_mainform' class='iframe_form' src='mainform.canvas.htm?<?php echo _CACHEFILEVERSION;?>' frameborder='0'></iframe>
							<iframe id='if_extform' class='iframe_form'  src='extform.canvas.htm?<?php echo _CACHEFILEVERSION;?>' frameborder='0'></iframe>
							<iframe id='if_diary'  class='iframe_form'  src='calldiary.canvas.htm?<?php echo _CACHEFILEVERSION;?>' frameborder='0'></iframe>
							<iframe id='if_workflow'   class='iframe_form'  src='workflow.canvas.htm?<?php echo _CACHEFILEVERSION;?>' frameborder='0'></iframe>
							<iframe id='if_www'  class='iframe_form'  src='noform.htm' frameborder='0'></iframe>
							<iframe id='if_files'  class='iframe_form'  src='fileform.canvas.htm?<?php echo _CACHEFILEVERSION;?>' frameborder='0'></iframe>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
<div id='botright' style='display:none'></div>
</body>
</html>