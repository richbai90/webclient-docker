//--
//-- ALL APPLICATIONS
//-- Gadget functions that are needed for all applications

//-- load a fusion chart into a given div
function load_chart(strDivID, strType, strDataUrl)
{
	//-- get body with and height
	var oDiv = oControlFrameHolder.document.getElementById(strDivID);
	if(oDiv!=null)
	{
		var myChart = new FusionCharts(_root + "fusioncharts/"+strType+".swf", "myChartId",  oDiv.offsetWidth+10, oDiv.offsetHeight);
		myChart.setDataURL(_root + strDataUrl + "?swsessionid="+_swsessionid);
		myChart.render(oDiv);
	}
}

//-- run gadget action function - oele will have attributes of gtype and gaction from which we can determine what to do
function run_gadget_action(oEle)
{
	var strGadgetType = oEle.getAttribute("gtype");
	var strActionType = oEle.getAttribute("gactiontype");
	var strAction = oEle.getAttribute("gaction");

	//alert("run gadget action " + strActionType + " : " + strAction);

	switch (strActionType)
	{
		case "menulink":
			var arrActionInfo = strAction.split("|");
			activate_menu_item("mi_" + arrActionInfo[0], arrActionInfo[1]);
			break;
		case "popup":
			var arrActionInfo = strAction.split("|");
			//alert(arrActionInfo[0]);
			app.openWin(arrActionInfo[0],arrActionInfo[1],arrActionInfo[2]);
			break;
		case "js":
			var arrActionInfo = strAction.split("|");
			eval(arrActionInfo[0] + "("+ arrActionInfo[1] + ",oEle);");

		default:
			break;	
	}

	return false;
}

function rf()
{
	return false;
}

function expandcollapse_gadget(aDiv)
{

	var oParent = get_parent_owner_by_id(aDiv,"gadgetcontainer");
	if(!oParent)return;
	var oHolder = get_parent_child_by_id(oParent,"gadgetholder");
	if(oHolder==null)return;

	var strClass = aDiv.className;
	if(strClass=="div-expand")
	{
		aDiv.className = "div-collapse";
		//-- expand gadget holder (gadgetholder)
		oHolder.style.display="";
	}
	else
	{
		aDiv.className = "div-expand";
		//-- expand gadget holder
		oHolder.style.display="none";
	}
}

