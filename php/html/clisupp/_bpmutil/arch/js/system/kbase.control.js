//--
//-- client side functions for kb search form

var strLastResultSet = "<center>Please perform a knowledgebase search to get a list of results</center>";
function perform_kbase_search(oForm)
{
	//-- create url
	var strURL = app.get_form_url(oForm);
	//alert(strURL)
	strLastResultSet = app.run_php(strURL,true);
	//-- auto select the search tab
	selecttab(document.getElementById('kbresults'));
}

//-- the tab "kbresults" calls this function (as set in knowledgebase.xml tab definition file).
function load_resultset()
{
	display_tab_content(strLastResultSet);
}
