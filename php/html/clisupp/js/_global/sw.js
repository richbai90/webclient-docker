
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
	if (session.httpPort == 443)
	{
		baseHttp = "https";
	}
	var strURL = baseHttp+"://" + session.server + ":" + session.httpPort+"/sw/clisupp/trending/index.php?sessid="+session.sessionId+"&gid=" + arrRecParams["gid"] + "&cid=" + arrRecParams["cid"];
	OpenEmbeddedURL(strURL,true,false);    
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
		if (session.httpPort == 443)
		{
			baseHttp = "https";
		}
		var strURL = baseHttp+"://" + session.server + ":" + session.httpPort+"/sw/clisupp/trending/administration/index.php?pageid=" + pageid + "&sessid="+session.sessionId;
		OpenEmbeddedURL(strURL,true,false);    
	}
	else
	{
		alert("The administration page id was not specified. The administration page cannot be loaded.");
	}
}
