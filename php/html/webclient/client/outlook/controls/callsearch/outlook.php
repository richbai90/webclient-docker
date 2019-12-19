<?php
	include('../../../../php/session.php');
?>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<link rel="stylesheet" href="sfc.css" type="text/css"/>
<script>

	var app = (opener)?opener.app:top;
	var jqDoc = app.jqueryify(document); //-- so can use jquery

	var bError = false;
	var strControlID = "<?php echo htmlspecialchars($_REQUEST['controlid']);?>";


	//-- callsearch is stored in global params - so get info and contruct xml
	var strXML ="<callsearch>";
		strXML +="<Name>callsearch</Name>";
		strXML +="<SearchTitle>" + app.pfx(app.dd.GetGlobalParam("views/Search For Calls View/SearchTitle")) + "</SearchTitle>";
		strXML +="<icon></icon>";
		strXML +="<table>opencall</table>";
		strXML +="<searchColumns>" + app.pfx(app.dd.GetGlobalParam("views/Search For Calls View/SearchColumns")) + "</searchColumns>";
		strXML +="<searchResultColumns>" + app.pfx(app.dd.GetGlobalParam("views/Search For Calls View/ResultColumns")) + "</searchResultColumns>";
		strXML +="<maxSearchResults>" + app.pfx(app.dd.GetGlobalParam("views/Search For Calls View/DefMaxSearchResults")) + "</maxSearchResults>";
		strXML +="<searchOptions>" + app.pfx(app.dd.GetGlobalParam("views/Search For Calls View/DefSearchoptions")) + "</searchOptions>";
		strXML +="<SearchFilter>" + app.pfx(app.dd.GetGlobalParam("views/Search For Calls View/Filter")) + "</SearchFilter>";
		strXML +="<FormType></FormType>";
		strXML +="<Form></Form>";
		strXML +="</callsearch>";

	//-- get control xml definition and creat new js dbsearch object
	var oXML = app.create_xml_dom(strXML);

	var mes = app.create_new_mes(oXML, strControlID,"sfc",document);
	if(app._mes==undefined)app._mes=new Array();
	app._mes[strControlID] = mes;

	//--
	//-- get searchforcalls search options
	var strCustomURL = app._outlookcontrolpath + "callsearch/searchoptions.xml";
	var _xmlSearchOptions = app.get_http(strCustomURL, "", true,true, null);
	if(typeof _xmlSearchOptions!="object")
	{
		alert("Could not load search for calls options definition. Please contact your Administrator");
		bError=true;
	}

	app._mes[strControlID].xmlsearchoptions = _xmlSearchOptions;


	function initialise()
	{
		if(bError)return;


		if(app._mes[strControlID].rowcount > -1)
		{
			app._mes[strControlID].set_right_title_count();
		}
	
	}

	function refresh_data()
	{
		var btn = document.getElementById("mes_search");
		if(btn!=null)btn.click();
	}

	
	function hide_popups(oEv)
	{
		if(document['_datecontrol_clicked']==undefined)document['_datecontrol_clicked']=false;
		if(document['_datecontrol_clicked'])
		{
			document['_datecontrol_clicked']=false;
			return;	
		}

		var formDP = document.getElementById("__sw_element_date_picker");
		if(oEv==undefined)
		{
			if(formDP!=null)
			{
				formDP.style.display="none";
				formDP.targetelement.setAttribute("datehidden","true");
			}
		}
		else
		{
			//- -check if we have date picker already
			var srcEle = app.ev_source(oEv);
			if(formDP!=null)
			{
				if(formDP.targetelement == srcEle) 
				{
					if(app.clicked_datebox_trigger(srcEle,oEv))return true;
				}
				
				formDP.style.display="none";
				formDP.targetelement.setAttribute("datehidden","true");
			}
		}
	}

</script>
<body onclick="hide_popups(event);" onload='if(!bError)app._mes[strControlID].setup_search_options();' onmousedown="app.hide_application_menu_divs();" onresize='if(!bError){hide_popups();app._mes[strControlID].resize_height();}' onkeydown="return app._handle_portal_keystrokes(event);" oncontextmenu="return app.stopEvent();" >
<div id='placeholder'>
	<!-- search fields -->
	<div id='search-fields'>
		<script>
			if(!bError)app._mes[strControlID].write_html_fields();
		</script>
	</div>

	<!-- search options title-->
	<div id='search-title-options'>Search Options</div>
	<div id='search-calloptions'>
		<script>
			if(!bError)app._mes[strControlID].write_sfc_html_fields();
		</script>
	</div>

	<!-- actions -->
	<div id='search-action'>
		<table width='100%' border='0' cellspacing='0'>
			<tr>
				<td>
					<select id='search_operator' style='width:100%;'>
						<option value='OR'>Any of the above can match</option>
						<option value='AND'>All of the above must match</option>
					</select>
				</td>
			</tr>
			<tr>
				<td align='right' class='lbl'>Limit returned result rows to <input type=text id='search_limit' value='' size='5'>
				</td>
			</tr>
			<tr>
				<td align='right'>
					<button class='button-control' onClick='if(!bError){app._mes[strControlID].reset();}'>Reset</button>
					&nbsp;
					<button id='mes_search' class='button-control' onClick='if(!bError){app._mes[strControlID].search();}'>Search</button>
				</td>
			</tr>
		</table>
	</div>
</div>
</body>

</html>