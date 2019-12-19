<?php

	//-- Web-based HIB for webclient
	//-- will accept sessionid as passthru
	//-- should be capable of running on is own

	//-- check session
	$excludeTokenCheck=true;
	include("../../../../php/session.php");

?>
<head>
<title>Hornbill Information Browser</title>
</head>
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

		//-- init any passed in params
		var _arr_viewer_vars = new Array();
		var arrParams = info.__params.split("&");
		for(var x=0;x<arrParams.length;x++)
		{
			var arrT = arrParams[x].split("=");
			top[arrT[0]] = arrT[1];
		}
	
		//-- set hib title
		var _hibTitleHolder=null;
		var _hibPrefixTitleString=null;
		var _hibPrefixTitleImage=null; //-- will be a bpm that is made up of many images
		function _set_hib_view_title(oTagertEle)
		{
			if(_hibTitleHolder==null)
			{
				//-- set pointer and then get root title from xml
				_hibTitleHolder = oTagertEle;
				var xmlView = oHibXML.getElementsByTagName("View");
				_hibPrefixTitleString = xmlView[0].getAttribute("display")
				_hibPrefixTitleImage = xmlView[0].getAttribute("imagefile");

				_hibTitleHolder.innerHTML = _hibPrefixTitleString + " - " + top._assetid;
			}
			else
			{
				//-- oTargetEle is a string to which to set the title
				_hibTitleHolder.innerHTML = _hibPrefixTitleString + " - " + top._assetid + "\\" + oTagertEle;
			}
		}

		//-- parse aw specific vars
		function replace_aw_vars(strString)
		{
			for(strVar in _arr_viewer_vars)
			{
				strString = strString.replace(strVar, _arr_viewer_vars[strVar])
			}
			return strString;
		}

		//-- get list of viewer viariable values
		function _get_viewer_variables()
		{
			//-- common vars
			_arr_viewer_vars["&[app.webroot]"] = top._url;
			_arr_viewer_vars["%compname%"] = top._assetid;
			_arr_viewer_vars["%dfmt%"] = top.app._analyst_dateformat;
			_arr_viewer_vars["%dtfmt%"] = top.app._analyst_datetimeformat;
			_arr_viewer_vars["%tfmt%"] = top.app._analyst_timeformat;

			var xmlVars = oHibXML.getElementsByTagName("VariableRequest");
			if(xmlVars[0])
			{
				var strURL = xmlVars[0].getAttribute("url");
				strURL = replace_aw_vars(strURL);
				var oVarXML = app.get_http(strURL, "", true, true);
				if(oVarXML)
				{
					//- -store mandatory ones and exit message if not found
					var arrMand = new Array();
					var xmlMandatoryVars = oHibXML.getElementsByTagName("MandatoryValue");
					for (var x=0;x<xmlMandatoryVars.length;x++)
					{
						var strName = xmlMandatoryVars[x].getAttribute("value");
						var strMessage = xmlMandatoryVars[x].getAttribute("exitmessage");
						arrMand[strName] = strMessage;
					}


					var xmlRetVars = oVarXML.getElementsByTagName("variable");
					for (var x=0;x<xmlRetVars.length;x++)
					{
						var strName = xmlRetVars[x].getAttribute("name");
						var strValue = xmlRetVars[x].getAttribute("value");
						if(strValue == "" && arrMand[strName]!=undefined)
						{
							//- -is mandatory but is not returned - so error and exit
							alert(replace_aw_vars(arrMand[strName]));
							window.close();
							return false;
						}
						
						//-- store var
						_arr_viewer_vars["%" + strName +"%"] = strValue;
					}
				}
			}
		}//-- eof get viewer vars


		try
		{
			var strConfigURL = "_hibconfig=" + top._url + "/config.xml";
			var strURL = app.get_service_url("hib/getconfigfile","");	
			var oHibXML =	app.get_http(strURL, strConfigURL, true, true);
			if(oHibXML)
			{
				var arrErrors = oHibXML.getElementsByTagName("error");
				if(arrErrors.length>0)
				{
					alert(app.xmlText(arrErrors[0]))
					window.close();
				}
				else
				{
					//-- will be ok to create js tree
					_get_viewer_variables();
				}
			}
			else
			{
				window.close();
			}

		}
		catch (e)
		{
			alert("Failed to load configuration file. Please contact your Administrator.");
			window.close();
		}
	</script>


	<frameset rows="30,*"  >
		<frame name='_nav' src='title.php'frameborder="1"/>
		<frameset cols="250,*">
			<frame name='_nav' src='navigation.php' frameborder="1"/>
			<frame name='_content' src='blank.php'  frameborder="1"/>
		</frameset>
	</frameset>
</html>