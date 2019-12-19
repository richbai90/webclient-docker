<?php

	//-- check session is valid
	$excludeTokenCheck=true;
	include("../../../../php/session.php");
?>

<html>
<title>New Request Confirmation</title>
<style>
	*
	{
		font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
	}
	body
	{
		background-color:#efefef;
		font-size:12px;
		overflow:hidden;
		padding:0px;
	}
	td
	{
		font-size:11px;
	}
	#msg
	{
		background-color:#ffffff;
		height:150px;
		width:100%;
		margin:2px;
		overflow:auto;
		border:1px #dfdfdf solid;
		font-size:10px;
	}
</style>

<script>
	var undefined;
	if(window.dialogArguments!=undefined)
	{
		var info = window.dialogArguments;
	}
	else
	{
		var info = opener.__open_windows[window.name];
	}	

	var app = info.__app;
	var jqDoc = app.jqueryify(document); //-- so can use jquery
	function process_confirmation_options()
	{
		var ocbdetails = document.getElementById("cb_opendetails");
		var ocbmail = document.getElementById("cb_sendemail");
		o.opendetail = (ocbdetails.checked)?true:false;
		o.emailcustomer = (ocbmail.checked)?true:false;

		app.__open_windows[window.name].returnInfo = o;
		o._uploadfilenode = null;
	}

	var o = new Object();
	o.opendetail = true;
	o.emailcustomer = true;


	function init_form()
	{
		if(app.session.IsDefaultOption(app.ANALYST_DEFAULT_LOGSENDEMAIL))
		{
			document.getElementById("cb_sendemail").checked=true;
		}
		else
		{
			document.getElementById("cb_sendemail").checked=false;
		}

	}
</script>

<body onload="init_form();" onbeforeunload="process_confirmation_options()"  onunload="app._on_window_closed(window.name)">
<div id='msg'>
	<script>
		var arrParams = info.__params.split("=");
		var msgArray = arrParams[1].split(",");
		
		//-- do we have call confirmation text to use
		if(app._xml_logcallconfirmation)
		{
			var strTagName = (msgArray[2])?"logNewMsg":"logConfirm4Msg";
			var strConfirmationMessage = app.xmlNodeTextByTag(app._xml_logcallconfirmation,strTagName);

			strConfirmationMessage = app.string_replace(strConfirmationMessage,"\n","<br><br>",true);
			strConfirmationMessage = strConfirmationMessage.replace(/\&\[Callref]/g,msgArray[0]);	
			strConfirmationMessage = strConfirmationMessage.replace(/\&\[Customer]/g,msgArray[1]);	

			if(msgArray[2])
			{
				strConfirmationMessage = strConfirmationMessage.replace(/\&\[SlaTimezoneName]/g,msgArray[2]);					
				strConfirmationMessage = strConfirmationMessage.replace(/\&\[SlaRespTime]/g,msgArray[3]);					
				strConfirmationMessage = strConfirmationMessage.replace(/\&\[SlaFixTime]/g,msgArray[4]);					
				strConfirmationMessage = strConfirmationMessage.replace(/\&\[AnalystTimeZone]/g,msgArray[5]);
				strConfirmationMessage = strConfirmationMessage.replace(/\&\[AnalystRespTime]/g,msgArray[6]);					
				strConfirmationMessage = strConfirmationMessage.replace(/\&\[AnalystFixTime]/g,msgArray[7]);					
			}
		}
		else
		{
			//-- use default
			var strConfirmationMessage = "Request logged as : " + msgArray[0];
			if(msgArray[1]!="") strConfirmationMessage += " for " + msgArray[1];
			if(msgArray[2])
			{
				strConfirmationMessage += "<table border='0' width='100%'>";
				strConfirmationMessage += "<tr><td colspan='2'><br><b><u>SLA Local Time ("+msgArray[2]+")</u></b></td></tr>";
				strConfirmationMessage += "<tr><td>Response Time</td><td>: " + msgArray[3] + "</td></tr>";
				strConfirmationMessage += "<tr><td>Fix Time</td><td>: " +msgArray[4] + "</td></tr>";
				strConfirmationMessage += "<tr><td colspan='2'><br><br><b><u>Operator Local Time ("+msgArray[5]+")</u></b></td></tr>";
				strConfirmationMessage += "<tr><td>Response Time</td><td>: " + msgArray[6] + "</td></tr>";
				strConfirmationMessage += "<tr><td>Fix Time</td><td>: " + msgArray[7] + "</td></tr>";
				strConfirmationMessage += "</table>";
			}
		}

		document.write(strConfirmationMessage);
	</script>
</div>
<table border='0' cellspacing='2' cellpadding='2'>
	<tr><td><input id='cb_opendetails' checked type='checkbox'></td><td><label for="cb_opendetails">Open detail form for this request</label></td></tr>
	<tr><td><input id='cb_sendemail' type='checkbox'></td><td><label for="cb_sendemail">Send E-mail</label></td></tr>
</table>
<table border='0' cellspacing='2' cellpadding='2' width='100%'>
	<tr><td align='right'><input type='button' value='OK' style='width:60px;' onclick='self.close()'></td></tr>
</table>

</body>
</html>