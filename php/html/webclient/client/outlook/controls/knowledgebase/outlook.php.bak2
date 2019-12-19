<?php

	include('../../../../php/session.php');
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

	<link rel="StyleSheet" href="tree.css" type="text/css" />
	<link rel="StyleSheet" href="kbase.css" type="text/css" />
	<script>

		var undefined;
		var app = (opener)?opener:top;
		var jqDoc = app.jqueryify(document); //-- so can use jquery		

		var catalogTree;
		var oXmlCatalogInfo = null;

		//-- get catalog tree xml
		var xmlmc = app._new_xmlmethodcall();
		if(xmlmc.Invoke("knowledgebase","catalogList"))
		{
			oXmlCatalogInfo = xmlmc.xmlDOM;
		}

		
		function select_catalog(aNode)
		{
			strSearchInCatalog = aNode.id;
		}

		function load_catalog_tree()
		{
			var aDiv = document.getElementById("kbase_cattree");

			//-- init tree control
			catalogTree = app.newtree('catalogTree',document);
			catalogTree.controlid = aDiv.id;
			catalogTree.config.folderLinks = true; //-- folder behave link nodes when clicked
			catalogTree.config.useCookies = false;
			catalogTree.add("0","-1","Entire KnowledgeBase",select_catalog,'','','','treeimages/kbase.png',true);
			 
			 if(oXmlCatalogInfo!=null)
			{
				 //-- load catalog folders - get folders and then output tree control
				 var arrXFolders = oXmlCatalogInfo.getElementsByTagName("folder");
				 for(var x=1; x < arrXFolders.length;x++)
				{
					var strCatPID = app.xmlNodeTextByTag(arrXFolders[x],"parentId");;
					var strCatID = app.xmlNodeTextByTag(arrXFolders[x],"catalogId");
					var strCatalogName = app.xmlNodeTextByTag(arrXFolders[x],"name");


					catalogTree.add(strCatID,strCatPID,strCatalogName,select_catalog,'','','treeimages/catalog.png','treeimages/catalog.png',false,true);
				}
			}
			
			//-- output tree
			aDiv.innerHTML = catalogTree;
			resize_height();
			initialise();
		}


		function resize_height()
		{
			var divCont = document.getElementById("container");
			var divFields = document.getElementById("search-fields");
			var divOptionsTitle =document.getElementById("search-title-options");
			var divOptions = document.getElementById("search-action");
			var divSearchOptions = document.getElementById("search-calloptions");
			var iSFCH = (divSearchOptions==null)?0:divSearchOptions.offsetHeight;

			if(!app.isIE)
			{
				var iHeight = divCont.offsetHeight;
			}
			else
			{
					var iHeight = document.body.offsetHeight;
			}

			var iAdjust = new Number(divOptionsTitle.offsetHeight) + new Number(divOptions.offsetHeight) + new Number(iSFCH);
			var iSearchHeight = iHeight - iAdjust;
			if(iSearchHeight>1)
			{
				if(!app.isIE)iSearchHeight=iSearchHeight-15;
				divFields.style.height = iSearchHeight - 5;
			}
		}

		var _boolKbaseSearched = false;
		var strSearchInCatalog = "";
		var arrOrderCols = new Array();
		arrOrderCols['docref'] = 1;
		arrOrderCols['docdate'] = 2;
		arrOrderCols['title'] = 3;
		arrOrderCols['Relevance'] = 4;
		function kbase_search()
		{
			var targetTable = app.oWorkspaceFrameHolder.getElement(top._CurrentOutlookID);
			if(targetTable==null) return false;

			_boolKbaseSearched = true;

			//-- make sure just hasnt entered spaces
			var strSearchText = document.getElementById("kbase_question").value;
			var spaceFix = / /gi; 
	        var testStr = strSearchText.replace(spaceFix,"");
			if(testStr=="")
			{
				alert("You must enter one or more keywords to search for.");
				return false;
			}
			var strSearchMethod = document.getElementById("kbase_method").value;
			var bitSearchFlag = get_kb_flagvalue();
			
			//-- get sorting information
			var intSortCol = arrOrderCols[targetTable.getAttribute('orderby')];
			var boolSortAsc = (targetTable.getAttribute('orderdir')=="DESC")?"false":"true";

			var intLimit=document.getElementById("search_limit").value;
			var intRowCount = app.kbase.get_search_results(strSearchText,strSearchMethod, bitSearchFlag, strSearchInCatalog,intLimit,intSortCol,boolSortAsc,targetTable);
			app.set_right_title("KnowledgeBase - " + intRowCount + " articles matched");
		}

		//-- called when data table hear is clicked
		function refresh_data()
		{
			if(_boolKbaseSearched)kbase_search();
		}

		function get_kb_flagvalue()
		{
			var intValue = 0;
			var checked_flags = document.getElementsByName("kb_optionflag");
			for(var x=0;x<checked_flags.length;x++)
			{
				if(checked_flags[x].checked)	intValue += new Number(checked_flags[x].value);
			}
			return intValue;
		}

		function reset_kb_flagvalue()
		{
			var intValue = 0;
			var checked_flags = document.getElementsByName("kb_optionflag");
			for(var x=0;x<checked_flags.length;x++)
			{
				checked_flags[x].checked=true;
			}
		}


		function kbase_reset()
		{
			document.getElementById("kbase_question").value="";
			document.getElementById("kbase_method").selectedIndex=0;
			reset_kb_flagvalue();
			document.getElementById("search_limit").value=100;
		}

		function initialise()
		{
			if(app.kbase._searchstring!="")
			{
				kbase_reset();
				document.getElementById("kbase_question").value=app.kbase._searchstring;
				app.kbase._searchstring = "";

				setTimeout("_ready_to_search()",100);
			}
		}

		function _ready_to_search()
		{
			var targetTable = app.oWorkspaceFrameHolder.getElement(top._CurrentOutlookID);
			if(targetTable==null) 
			{
				setTimeout("_ready_to_search()",100);
			}
			else
			{
				kbase_search();
			}

		}
	
	</script>
</head>
<body onload="load_catalog_tree();" onresize="resize_height();" oncontextmenu='return false;'  onmousedown="app.hide_application_menu_divs();" onkeydown="return app._handle_portal_keystrokes(event);">
<div id='container' style='height:100%;'>
		<div id='search-fields'>
			<label>Ask a Question</label>
			<textarea id='kbase_question'></textarea>
			<br><br>
			<label>Search Method</label>
			<select id='kbase_method'>
				<option value="1">Natural language query (ask a question)</option>
				<option value="2">Word search (all words must match)</option>
				<option value="3">Word search (any words can match)</option>
			</select>
			<br><br>
			<label>Elements to include in search</label>
			<div id='kbase_includeoptions'>
				<table cellspacing="0" cellpadding="0" border="0">
					<tr>
						<td><input id='so_dk' name="kb_optionflag" value='1' type='checkbox' checked></td><td><label for='so_dk'>Document Keywords</label></td>
					</tr>
					<tr>
						<td><input id='so_dt'  name="kb_optionflag" value='2' type='checkbox' checked></td><td><label for='so_dt'>Document Title</label></td>
					</tr>
					<tr>
						<td><input id='so_dpt'  name="kb_optionflag" value='4' type='checkbox' checked></td><td><label for='so_dpt'>Document Problem Text</label></td>
					</tr>
					<tr>
						<td><input id='so_dst'  name="kb_optionflag" value='8' type='checkbox' checked></td><td><label for='so_dst'>Document Solution Text</label></td>
					</tr>
				</table>
			</div>
			<br>
			<label>Available Knowledgebase Catalogues</label>
			<div id='kbase_cattree'>
			</div>
		</div>

		<!-- search options title and actions-->
		<div id='search-title-options'>Search Options</div>

		<div id='search-action'>
			<table width='100%' border='0' cellspacing='0'>
				<tr>
					<td align='right' class="lbl">Limit returned result rows to <input type=text id='search_limit' value='100' size='5'>
					</td>
				</tr>
				<tr>
					<td align='right'>
						<button class='button-control' onClick='kbase_reset();'>Reset</button>
						&nbsp;
						<button class='button-control' onClick='kbase_search()'>Search</button>
					</td>
				</tr>
			</table>
		</div>
</div>
</body>
</html>