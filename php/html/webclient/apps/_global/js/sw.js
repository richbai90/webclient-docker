
function loaddashboard(strParams)
{
	var arrRecParams = new Array();
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = arrPI[1];
	}

	var baseHttp = "http";
	if (app.session.httpPort == 443)
	{
		baseHttp = "https";
	}
	var strURL = baseHttp+"://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/trending/index.php?sessid="+app.session.sessionId+"&gid=" + arrRecParams["gid"] + "&cid=" + arrRecParams["cid"];
	app.global.OpenEmbeddedURL(strURL,true,false);    
}


function loaddashboard_adminoption(strParams)
{
	var arrRecParams = new Array();
	var arrParams = strParams.split(",");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = decodeURIComponent(arrPI[1]);
	}

	//-- admin option expects a pageid which is what we load (it is a physical php page)
	var pageid = arrRecParams["pageid"];
	if(pageid)
	{
		var baseHttp = "http";
		if (app.session.httpPort == 443)
		{
			baseHttp = "https";
		}
		var strURL = baseHttp+"://" + app.session.server + ":" + app.session.httpPort+"/sw/clisupp/trending/administration/index.php?pageid=" + pageid + "&sessid="+app.session.sessionId;
		app.global.OpenEmbeddedURL(strURL,true,false);    
	}
	else
	{
		MessageBox("The administration page id was not specified. The administration page cannot be loaded.");
	}
}
