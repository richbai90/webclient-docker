//-- mimic swc hsl:editrecord etc

function _hslaction(strAction,strParams,aLinkElement)
{
	if(strParams==undefined)strParams="";
	
	
	var arrRecParams = new Array();
	var arrParams = strParams.split("&");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = arrPI[1];
	}
	
	switch(strAction.toLowerCase())
	{
		case "mail":
			_hslaction_gotomailbox(arrRecParams,aLinkElement)
			break;

		case "callpanelfunction":
			_hslaction_callpanelfunction(arrRecParams,aLinkElement)
			break;

		case "swjscallback":
			_hslaction_swjscallback(arrRecParams,aLinkElement);
			break;
		case "mycalls":
			//-- switch to servicedesk view
			_hslaction_mycalls(arrRecParams,aLinkElement)
			break;
		case "mygroupcalls":
			_hslaction_mygroupcalls(arrRecParams,aLinkElement)
			break;
		case "editrecord":
			_hslaction_editrecord(arrRecParams,aLinkElement)
			break;

		case "calldetails":
			_hslaction_calldetails(arrRecParams,aLinkElement)
			break;
		case "logcall":
			_hslaction_logcall(strParams,aLinkElement)
			break;

		case "updatecall":
			_hslaction_updatecall(arrRecParams,aLinkElement)
			break;
		case "cancelcall":
			_hslaction_cancelcall(arrRecParams,aLinkElement)
			break;
		case "transfercall":
			_hslaction_transfercall(arrRecParams,aLinkElement)
			break;
		case "acceptcall":
			_hslaction_acceptcall(arrRecParams,aLinkElement)
			break;
		case "closecall":
			_hslaction_closecall(arrRecParams,aLinkElement)
			break;
		case "holdcall":
			_hslaction_holdcall(arrRecParams,aLinkElement)
			break;
		case "kbsearch":
			_hslaction_kbsearch(arrRecParams,aLinkElement)
			break;
		case "printme":
			_hslaction_printme(arrRecParams,aLinkElement)
			break;
		case "sqlsearch":
			_hslaction_sqlsearch(strParams,aLinkElement)
			break;
		case "reactivatecall":
			_hslaction_reactivatecall(strParams,aLinkElement)
			break;

		default:

			alert("_hslaction : " + strAction + ".\n\nThis action is not currently supported in the webclient");
			break;
	}
}

//-- 07.08.2013 - cr 88502 - support for switchign to a mailbox
function _hslaction_gotomailbox(arrRecParams,aLinkElement)
{
	app.setWcVar("selectmailboxname",arrRecParams["mailbox"]);
	global.SwitchSupportworksViewByType("mail");
}

function _hslaction_callpanelfunction(arrRecParams,aLinkElement)
{

	var targetPanel = arrRecParams["panel"];
	var targetFunctionName = arrRecParams["function"];

	//-- get iframe and function
	var iframe = (targetPanel=="left")?oControlFrameHolder:oWorkspaceFrameHolder;
	var funcPointer = iframe[targetFunctionName];

	if(funcPointer!=undefined && typeof funcPointer == 'function') 
	{
		var arrPassThru = [];
		for(var strParam in arrRecParams)
		{
			if(strParam!="panel" && strParam!="function")
			{
				arrPassThru.push(arrRecParams[strParam]);
			}
		}

		switch(arrPassThru.length)
		{
			case 0:
				funcPointer();
				break
			case 1:
				funcPointer(arrPassThru[0]);
				break
			case 2:
				funcPointer(arrPassThru[0],arrPassThru[1]);
				break
			case 3:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2]);
				break
			case 4:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3]);
				break
			case 5:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4]);
				break
			case 6:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5]);
				break
			case 7:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6]);
				break
			case 8:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6],arrPassThru[7]);
				break
			case 9:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6],arrPassThru[7],arrPassThru[8]);
				break
			case 10:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6],arrPassThru[7],arrPassThru[8],arrPassThru[9]);
				break

		}
	}	
	else
	{
		alert("_hslaction : callpanelfunction - The specified function ["+targetFunctionName+"] was not found in the "+targetPanel+" view frame");
	}
}

function _hslaction_reactivatecall(strParams,aLinkElement)
{
	var arrParams = app._explodeparams(strParams);
	if(arrParams['callref'])
	{
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam("callref",arrParams['callref']);
		xmlmc.SetParam("restoreWorkflow",true);
		if(xmlmc.Invoke("helpdesk","reactivateCalls"))
		{
			app.getEleDoc(aLinkElement).location.reload(false);
		}
	}
}

function _hslaction_sqlsearch(strParams,aLinkElement)
{
	//alert(strParams)
	_open_system_form("_wc_sqlsearchform", "sqlsearch", "", strParams, false, undefined,undefined,undefined,800,600);
}

function _hslaction_swjscallback(arrRecParams,aLinkElement)
{
	var strFunction = arrRecParams['function'];
	if(app[strFunction])
	{
		var strParam = "";
		for(strID in arrRecParams)
		{
			 if( strParam != "")strParam += ",";
			  strParam += strID+"="+arrRecParams[strID];
		}
		app[strFunction](strParam);
	}
	else
	{
		alert("_hslaction : swjscallback - The specified function ["+strFunction+"] was not found at the application level");
	}

}

function _hslaction_kbsearch(arrRecParams,aLinkElement)
{
	var strSearchString = arrRecParams["search"];
	app.kbase.open_search(strSearchString);

}

function _hslaction_printme(arrRecParams,aLinkElement)
{
	aLinkElement.frameholder.print();
}

function _hslaction_mycalls(arrRecParams,aLinkElement)
{
	//-- switch view
	app.hslaction_servicedesk_view("mycalls", arrRecParams);
}

function _hslaction_mygroupcalls(arrRecParams,aLinkElement)
{
	app.hslaction_servicedesk_view("mygroupcalls", arrRecParams);
}

function _hslaction_editrecord(arrRecParams,aLinkElement)
{
	//-- get form for table (ddf info)
	if(arrRecParams["formmode"]==undefined)
	{
		arrRecParams["formmode"] = (arrRecParams["key"]==undefined)?"add":"edit";
	}

	if(arrRecParams["formmode"].toLowerCase()=="edit")
	{
		var strFormName = app.dd.tables[arrRecParams["table"]].editform;
		app.OpenFormForEdit(strFormName,arrRecParams["key"],"",true);
	}
	else
	{
		var strFormName = app.dd.tables[arrRecParams["table"]].addform;
		app.OpenFormForAdd(strFormName,arrRecParams["key"],"",true);
	}
}


//-- call based links
function _hslaction_calldetails(arrRecParams,aLinkElement)
{
	_open_call_detail(arrRecParams['callref']);
}

function _hslaction_logcall(strRecParams,aLinkElement,openedFromWin)
{
	_open_logcall_form(undefined, strRecParams, openedFromWin);
}


function _hslaction_cancelcall(arrRecParams,aLinkElement)
{
	_cancelcallform(arrRecParams['callref'], window);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_acceptcall(arrRecParams,aLinkElement)
{
	_acceptcallform(arrRecParams['callref'],window);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_transfercall(arrRecParams,aLinkElement)
{
	_assigncall(arrRecParams['callref']);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_updatecall(arrRecParams,aLinkElement)
{
	_updatecallform(arrRecParams['callref'],null,[],function()
	{
		app.getEleDoc(aLinkElement).location.reload(false);
	});
}

function _hslaction_closecall(arrRecParams,aLinkElement)
{
	_resolveclosecallform(arrRecParams['callref']);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_holdcall(arrRecParams,aLinkElement)
{
	_holdcallform(arrRecParams['callref']);
	app.getEleDoc(aLinkElement).location.reload(false);
}