
//Load sub data into the form. 
//Expects an overall form to contain the data
function get_sub_data(oFormId, strOrderByCol,strOrderDir)
{
	if(strOrderDir==undefined)strOrderDir="";
	if(strOrderByCol==undefined)strOrderByCol="";
	var oForm = document.getElementById("form"+oFormId);
	var oReportForm = document.getElementById("reportform");
	var oOverall = document.getElementById('overall');

	var strURL = '../common/php/getSubReport.php?orderbydir=' + strOrderDir + '&orderbycol=' + strOrderByCol + '&' + get_form_url_data(oReportForm) + "&" + get_div_url_data(oForm) ;
	if(strURL!=false)load_content_of_subreport(strURL,oForm);

	return true;
}

function img_exp_click(oEle,strForm)
{
	if(oEle.getAttribute("loaded")==0)
	{
		get_sub_data(strForm);
		oEle.setAttribute("loaded",1);
	}	
	expand_collapse(oEle,oEle.getAttribute("toexpand"),"blue");
}

function load_content_of_subreport(strURL,oForm)
{
	hide_popups();
	var strResult = run_php(strURL,true);
	display_sub_content(strResult,oForm);
}


function display_sub_content(strHTML,oForm)
{
	var container= get_parent_child_by_tag(oForm,"DIV");

	if(container!=null)
	{
		container.innerHTML = "<div id='subdataholder' formid='" + container.formid + "'>" + strHTML + "</div>";
		get_content_jsscript(strHTML)
		container.setAttribute("loaded",1);

		//-- if in webclient call method to check hrefs - if any use hsl: will replace
		if(top.bWebClient)
		{
			top._swc_check_document_hrefs(document,true);
		}
	}
}


//-- functions to support the datatables in portal
//-- sort table (passed in th)
function sub_table_sort(aTH)
{
	var tableData = app.get_parent_owner_by_tag(aTH, "TABLE");	
	if(tableData.rows.length<2)return;

	var strColName = aTH.getAttribute("dbname");
	var strTblName = aTH.getAttribute("tablename");
	if(strTblName!="") strColName = strTblName + "." + strColName;

	var divSubData = app.get_parent_owner_by_id(tableData, "subdataholder");	
	var strFormID = divSubData.getAttribute("formid");
	if(strFormID!=null)
	{
		var oForm = document.getElementById("table"+strFormID+"_");
		var strOrderDir = oForm.getAttribute("orderbydir");
		strOrderDir=(strOrderDir=="ASC")?"DESC":"ASC";
		oForm.setAttribute("orderbydir",strOrderDir);
		get_sub_data(strFormID, strColName,strOrderDir);
	}
}

function report_sort(aTH)
{

	var strColName = aTH.getAttribute("dbname");
	var strTblName = aTH.getAttribute("tablename");
	if(strTblName!="") strColName = strTblName + "." + strColName;

	//-- set sort col
	var oSortByEle = document.getElementById("mainreport_orderbycol");
	if(oSortByEle!=null)oSortByEle.value = strColName;

	//-- set order dir
	var oSortDirEle = document.getElementById("mainreport_orderdir");
	if(oSortDirEle!=null)
	{
		if(oSortDirEle.value=="ASC")
		{
			oSortDirEle.value="DESC";
		}
		else
		{
			oSortDirEle.value="ASC";
		}
	}
	
	app.submit_form('reportform');
	
}

function report_sub_sort(aTH,intLevel)
{
	intLevel = intLevel-1;
	var strColName = aTH.getAttribute("dbname");
	var strTblName = aTH.getAttribute("tablename");
	var strParentDiv = aTH.getAttribute("reload");
	if(strTblName!="") strColName = strTblName + "." + strColName;

	//-- set sort col
	var oSortByEle = document.getElementById("sort_level"+intLevel);
	if(oSortByEle!=null)oSortByEle.value = strColName;

	//-- set order dir
	var oSortDirEle = document.getElementById("sort_level_dir_"+intLevel);
	if(oSortDirEle!=null)
	{
		if(oSortDirEle.value=="ASC")
		{
			oSortDirEle.value="DESC";
			var strOrderDir = "DESC"
		}
		else
		{
			oSortDirEle.value="ASC";
			var strOrderDir = "ASC"
		}
	}
	get_sub_data(strParentDiv, strColName,strOrderDir);
}

//RJC
function get_parent_child_by_tag(oEle, strTag)
{
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].tagName==strTag)return oEle.childNodes[x];
		var testEle = get_parent_child_by_tag(oEle.childNodes[x], strTag);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}

//
function check_dependancies(oEle)
{
	if(oEle.id=="opencall..fk_company_id")
	{
		var strFilter="";

		var getValue = oEle.value;
		if(getValue=="")
		{
			var strFilter = "";
		}
		else
		{
			getValue = unescape(getValue);
			getValue = getValue.replace(/\+/g," ");

			if(dbtype=='swsql')
			{
				getValue = string_replace(getValue,"'","\\'",true);
			}
			else
			{
				getValue = string_replace(getValue,"'","''",true);
			}
			var strFilter = "fk_company_id='"+encodeURIComponent(getValue)+"'"
		}
		var oSite = document.getElementById("opencall..site");	
		filter_picklist(oSite,strFilter);
	}

}