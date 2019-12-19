<html>
<!-- simulate swjs messagebox options -->
<title>Supportworks</title>

<style>
	*
	{
		font:12px arial,sans-serif;
	}
	body
	{
		background-color:#dfdfdf;
		background-color:#ffffff;
		padding:5px 10px 10px 5px;
	}

	button
	{
		margin-right:8px;
		width:70px;
		display:none;
	}
</style>
<script>


	var undefined;
	var msgInfo = opener.__open_windows[window.name];

	var app = msgInfo.__app;
	var jqDoc = app.jqueryify(document); //-- so can use jquery

	function _check_height()
	{
		init_buttons();
		var intHeight = document.getElementById("_msgTableDiv").offsetHeight;
		if(app.isIE)
		{
			if(app.BrowserDetect.version==6)
			{
				//-- ie6 fix
				intHeight = intHeight + 65;
			}
			else
			{
				intHeight = intHeight + 25;
			}
		}
		else if (app.isSafari)
		{
			intHeight = intHeight + 65;
		}
		else if (app.isChrome)
		{
			intHeight = intHeight + 95;
		}
		else
		{
			intHeight = intHeight + 115;
		}
		try
		{
			window.resizeTo(400,intHeight);
		}
		catch (e)
		{
			
		}
	}

	function nl2br(text)
	{
		var re_nlchar = "";
		text = escape(text);
		if(text.indexOf('%0D%0A') > -1)
		{
				re_nlchar = /%0D%0A/g ;
		}
		else if(text.indexOf('%0A') > -1)
		{		re_nlchar = /%0A/g ;
		}
		else if(text.indexOf('%0D') > -1)
		{
			re_nlchar = /%0D/g ;
		}

		return unescape( text.replace(re_nlchar,'<br />') );
	}



//-- buttons
var MB_OK =0; 
var MB_OKCANCEL = 1;
var MB_ABORTRETRYIGNORE = 2; 
var MB_YESNOCANCEL = 3;
var MB_YESNO = 4;
var MB_RETRYCANCEL = 5;
var MB_CANCELTRYCONTINUE = 6;

//-- icon
var MB_ICONSTOP = 16 
var MB_ICONQUESTION = 32 
var MB_ICONEXCLAMATION = 48 
var MB_ICONINFORMATION = 64 
//-- def btn
var MB_DEFBUTTON1 = 1
var MB_DEFBUTTON2 = 2
var MB_DEFBUTTON3 = 3
var MB_DEFBUTTON4 = 4
 
//-- btn responses
var IDOK = 1;
var IDCANCEL = 2
var IDABORT = 3;
var IDRETRY = 4;
var IDIGNORE = 5;
var IDYES = 6;
var IDNO = 7;
var IDRETRYOTHER = 10;
var IDCONTINUE = 11;

function init_buttons()
{
	var noptions = msgInfo.noptions;
	var intBtn = 0;
	if(noptions<7)
	{
		//-- buttons only no image
		intBtn = noptions;
	}
	else if(noptions<23)
	{
		// button and icon stop
		intBtn = noptions-16;
	}
	else if(noptions<39)
	{
		// button and icon question
			intBtn = noptions-32;
	}
	else if(noptions<55)
	{
		// button and icon exc
			intBtn = noptions-48;
	}
	else if(noptions<71)
	{
		// button and icon inf
		intBtn = noptions-64;
	}

	switch(intBtn)		
	{
		case  MB_OK: 
			eb('ok');
			break;
		case  MB_OKCANCEL :
			eb('ok');
			eb('cancel');
			break;
		case  MB_ABORTRETRYIGNORE : 
			eb('abort');			
			eb('retry');
			eb('ignore');
			break;
		case  MB_YESNOCANCEL  :
			eb('yes');			
			eb('no');
			eb('cancel');
			break;
		case  MB_YESNO :
			eb('yes');			
			eb('no');
			break;
		case  MB_RETRYCANCEL  :
			eb('retry');
			eb('cancel');
			break;
		case  MB_CANCELTRYCONTINUE  :
			eb('cancel');
			eb('continue');
			break;
	}
}

function eb(strName)
{	
	document.getElementById(strName).style.display="inline";
}	

var o = new Object();
o.result = 0;

function _process_click(aBTN)
{
	var intRes = aBTN.getAttribute("bvalue");
	intRes++;
	intRes--;
	o.result = intRes;
	window.close();
}

function setElementText(oEle,strText)
{
	if(oEle==null)return;
	oEle.innerText = oEle.textContent = strText;
}

function _onload()
{
	setElementText(document.getElementById("displaytext"),	msgInfo.message);
	_check_height();
}

function _onunload()
{
	app.__open_windows[window.name].returnInfo = o.result;
}
</script>

<body onload='_onload();' onbeforeunload="_onunload()" onunload="app._on_window_closed(window.name)">
<div id='_msgTableDiv'>
<center>
	<table id='_msgtable' border="0" cellspacing="0" cellpadding="0">
		<tr>
			<td colspan="10"><div id='displaytext'></div><br><br></td>
		</tr>
		<tr>
			<td noWrap align='center' style='padding-left:8px;'>
				<button id='ok' bvalue='1' onclick='_process_click(this);'>OK</button>
				<button id='yes' bvalue='6' onclick='_process_click(this);'>Yes</button>
				<button id='no' bvalue='7' onclick='_process_click(this);'>No</button>
				<button id='abort' bvalue='3' onclick='_process_click(this);'>Abort</button>	
				<button id='retry' bvalue='4' onclick='_process_click(this);'>Retry</button>	
				<button id='ignore' bvalue='5' onclick='_process_click(this);'>Ignore</button>	
				<button id='cancel' bvalue='2' onclick='_process_click(this);'>Cancel</button>
				<button id='continue' bvalue='11' onclick='_process_click(this);'>Continue</button>	
			</td>
		</tr>	
	</table>
</center>
</div>
</body>
</html>