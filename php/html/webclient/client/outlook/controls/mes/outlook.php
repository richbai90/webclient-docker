<?php
	include('../../../../php/session.php');
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>

<link rel="stylesheet" href="mes.css" type="text/css"/>

<script>
	var bError = false;
	var app = (opener)?opener.app:top;
	var jqDoc = app.jqueryify(document); //-- so can use jquery
	var strControlID = "<?php echo htmlspecialchars($_REQUEST['controlid']); ?>";
	//-- get control xml definition and creat new js dbsearch object
	
	//-- get mes node from name
	function _get_mes_node(strFindName)
	{
		var xmlOutlook = app._xmlManagedEntitySearches.getElementsByTagName("dbev");// childNodes[0].childNodes; //;getElementsByTagName("outlook")[0];
		for(var x=0;x< xmlOutlook.length;x++)
		{
			var xmlMES = xmlOutlook[x];
			var strName = app.xmlNodeTextByTag(xmlMES,"name");
			if(strName==strFindName) return xmlMES;
		}
		return undefined;
	}

	var oXML = _get_mes_node(strControlID);
	if(oXML==undefined)
	{
		 alert("outlook : Managed Entity Search.\n\nSearch fields not defined for ["+strControlID+"]. Please contact your Administrator");
		 bError = true;
	}
	else
	{
		//oXML = oXML.getElementsByTagName("SearchColumns")[0];
		//alert(oXML.xml)
		//-- init mes
		var mes = app.create_new_mes(oXML, strControlID,"mes",document);
		if(app._mes==undefined)app._mes=new Array();
		app._mes[strControlID] = mes;
	}
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
</script>
<body onload='if(!bError)app._mes[strControlID].setup_search_options();' oncontextmenu="return app.stopEvent();" onresize='if(!bError)app._mes[strControlID].resize_height();' onmousedown="app.hide_application_menu_divs();" onkeydown="return app._handle_portal_keystrokes(event);">
<div id='placeholder'>
	<!-- search fields -->
	<div id='search-fields'>
		<script>
			if(!bError)app._mes[strControlID].write_html_fields();
		</script>
	</div>

	<!-- search options title-->
	<div id='search-title-options'>Search Options</div>

	<!-- actions -->
	<div id='search-action'>
		<table width='100%' border='0' cellspacing='0'>
			<tr>
				<td colspan='2'>
					<select id='search_operator' style='width:100%;'>
						<option value='OR'>Any of the above can match</option>
						<option value='AND'>All of the above must match</option>
					</select>
				</td>
			</tr>
			<tr>
				<td colspan='2' align='right' class='lbl'>Limit returned result rows to <input type=text id='search_limit' value='' size='5'></td>
			</tr>
			<tr>
				<td align='left'>
					<button id='btn_addnew' class='button-control hidden' onClick='if(!bError){app._mes[strControlID].addNew();}'>Add New</button>
				</td>
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