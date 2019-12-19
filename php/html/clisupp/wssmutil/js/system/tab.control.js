var array_tabitem_ordering = new Array();
var currentTab = null;

function selecttab(aTab)
{
	if(aTab==null)return;


	if(aTab.parentNode.lastTab!=null)
	{
		aTab.parentNode.lastTab.className="";
	}
	aTab.parentNode.lastTab=aTab;
	aTab.className="current";

	currentTab = aTab;

	//-- get type and action as needed
	switch(aTab.getAttribute("contenttype"))
	{
		case "js":
			//--- run js script
			eval(aTab.getAttribute("phpcontent"));
			break;
		case "php":
			//alert(aTab.getAttribute("phpcontent"))
			load_tab_content(aTab.getAttribute("phpcontent"), aTab)
			break;
		case "datatable":
			strTableHTML = load_tab_datatable(aTab.getAttribute("id"),aTab.getAttribute("tabcontrol"),aTab.getAttribute("url"),aTab.getAttribute("orderby"),aTab.getAttribute("sortdir"),aTab.getAttribute("filteroption"),aTab.getAttribute("startfromrow"),aTab.getAttribute("showrowcount"));
			display_tab_content(strTableHTML,aTab);	
			break;
	}
}

function load_tab_datatable(strTabID,strTabControlID,strAppendURL,strOrderBy,strSortDir,intFilterOption,intStartRow,intShowRowCount)
{
	//-- inti vars if need to
	if((intFilterOption==undefined)||(intFilterOption==null))intFilterOption="0";
	if((intStartRow==undefined)||(intStartRow==null))intStartRow="1";
	if((intShowRowCount==undefined)||(intShowRowCount==null))intShowRowCount="-1";

	//--
	//-- figure out ordering of table

	//-- make sure we have arrays
	if(array_tabitem_ordering[strTabControlID]==undefined)array_tabitem_ordering[strTabControlID] = new Array();
	if(array_tabitem_ordering[strTabControlID][strTabID]==undefined)array_tabitem_ordering[strTabControlID][strTabID] = new Array();	


	if(strOrderBy==null)
	{
		strOrderBy="";
		//-- if ordered before we can get last setting
		if(array_tabitem_ordering[strTabControlID])
		{
			if(array_tabitem_ordering[strTabControlID][strTabID]['orderby'])strOrderBy=array_tabitem_ordering[strTabControlID][strTabID]['orderby'];
		}
	}
	else
	{
		array_tabitem_ordering[strTabControlID][strTabID]['orderby']=strOrderBy;
	}

	if(strSortDir==null)
	{
		strSortDir="";
		//-- if ordered before we can get last setting
		if(array_tabitem_ordering[strTabControlID])
		{
			if(array_tabitem_ordering[strTabControlID][strTabID]['sortdir'])strSortDir=array_tabitem_ordering[strTabControlID][strTabID]['sortdir'];
		}
	}
	else
	{
		array_tabitem_ordering[strTabControlID][strTabID]['sortdir']=strSortDir;
	}
	//-- eof table ordering


	if(strAppendURL==undefined)strAppendURL=""
	if(strAppendURL!="")
	{
		strAppendURL ="&" + strAppendURL + "&orderby=" + strOrderBy + "&sortdir=" + strSortDir + "&filterbyoption=" + intFilterOption +"&startatrow=" + intStartRow + "&showrowcount=" + intShowRowCount;
	}
	else
	{
		strAppendURL ="&orderby=" + strOrderBy + "&sortdir=" + strSortDir + "&filterbyoption=" + intFilterOption +"&startatrow=" + intStartRow + "&showrowcount=" + intShowRowCount;
	}

	var strURL = app.portalroot + "php/xmlhttp/get_tab_datatable.php?tabid=" + strTabID + "&tabcontrolname=" + strTabControlID + strAppendURL;
	var strResult = app.run_php(strURL,true);
	//alert(strResult)
	return strResult;
}

function load_tab_content(strURL, aTab)
{
	strURL = app.portalroot + strURL;
	var strResult = app.run_php(strURL,true);
	display_tab_content(strResult, aTab);
}

function display_tab_content(strHTML, aTab)
{
	if(aTab==undefined) aTab=app.currentTab;
	//-- load specific tab usually a popup
	var oHolder = app.get_parent_owner_by_id(aTab, "tab_holder");
	var container =	app.get_parent_child_by_id(oHolder, "tab_contentholder");
	container.innerHTML = strHTML;
	try
	{
		get_content_jsscript(strHTML);	
	}
	catch (e)
	{
		//-- try in app
		app.get_content_jsscript(strHTML);
	}
}
