<html>
<head>
	<style>
		*
		{
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
		}


		body
		{
			padding:10px;
			margin:0px;
			min-width: 500px;  		/* MOST BROWSERS (Not IE6) */
			width:auto;
			overflow:hidden;
			
			font-size:12px;
			
		}

		.header
		{
			color:gray;
		}

		.title
		{
			font-weight:bold;
			font-size:14px;
		}

		.sectionline
		{
			border-top:2px solid #9EBEF5;
		}

		.sectionline-hi
		{
			border-top:2px solid #FFC663;
		}


		.sectiontitle
		{
			padding:5px; 5px 5px 5px;
			letter-spacing:2px;
			color:#07679A;
			background-color:#9EBEF5;			
			width:200px;
		}

		.sectiontitle-lo
		{
			padding:5px; 5px 5px 5px;
			letter-spacing:2px;
			color:gray;
			background-color:#efefef;			
			width:200px;
		}

		.sectiontitle-hi
		{
			padding:5px; 5px 5px 5px;
			letter-spacing:2px;
			color:gray;
			background-color:#FFC663;			
			width:200px;
		}



		.sectiondata
		{
			
			margin-left:200px;
			font-size:12px;
			color:gray;
		}

		.keywords
		{
			margin-left:200px;
			color:gray;
		}

		.feedback
		{
			padding:10px;
			margin-left:200px;
			width:auto;
			
			background-color:#F8F8F8;
			border:1px solid #CCCCCC;

		}

		.feedback-title
		{
			font-weight:bold;
		
		}

		.feedback-question
		{
			font-weight:bold;
			font-size:10px;
		}
		.feedback-answer
		{
		
			font-size:10px;
		}

		.fs-data
		{
			color:gray;
		}

		.fs-label
		{
			color:gray;
		}


		/* styles for users to use in kbdocument text */
		.indent
		{
			margin-left:20px;
		}
	</style>

</head>
<body>
<script>


	var __boolInContext = true;
	//-- running in normal window
	var arrServerInfo = document.location.href.split("sw/webclient");
	if(opener)
	{
		if(opener.app==undefined || opener.app.bWebClient==undefined)
		{
			//-- running page outside of webclient
			__boolInContext = false;
			var strParams = "sessionerrormsg=m2";
			opener.document.location.href = arrServerInfo[0] + "sw/webclient/?" + strParams;
		}
		var app = opener.app;
	}
	else
	{
		var app = top.app;
		if(app==undefined || app.bWebClient==undefined)
		{
			//-- running page outside of webclient
			__boolInContext = false;
			var strParams = "sessionerrormsg=m2";
			document.location.href = arrServerInfo[0] + "sw/webclient/?" + strParams;
		}
	}

	var jqDoc = app.jqueryify(document); //-- so can use jquery
	if(__boolInContext & top._kbase_current_selected_document!=undefined && top._kbase_current_selected_document!="")
	{
		//-- create new method call
		var xmlmc = top._new_xmlmethodcall();
		xmlmc.SetParam("docRef",top._kbase_current_selected_document);
		if(xmlmc.Invoke("knowledgebase","documentGetUrl"))
		{
			var strURL = xmlmc.GetParam("url");
			strURL = top._swc_parse_variablestring(strURL,top.document,false,false);
			document.write("<iframe src='"+strURL+"' style='width:100%;height:100%;'></iframe>");
		}
		else
		{
			alert(xmlmc.GetLastError());
		}
	}
</script>
</body>
</html>