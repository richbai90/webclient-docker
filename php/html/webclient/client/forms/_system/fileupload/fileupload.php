<html>
<title>Supportworks File Uploader</title>
<style>
	body
	{
	font-size:12px;font-family:Verdana,sans-serif;letter-spacing:.03em;
		background-color:#efefef;
	}
</style>
<script>


	//-- running in context check
	var o = {};
	o._uploadfilenode = null;
	
	var __boolInContext = true;
	if(__boolInContext)
	{

		var info = opener.__open_windows[window.name];
		if(!info)
		{
			alert("This form has been opened outside of its intended context. Please contact your Administrator");
			window.close();
		}

		var app = info.__app;
		var jqDoc = app.jqueryify(document); //-- so can use jquery		
		
		app.__open_windows[window.name].returnInfo = o;
	}

	function onfileselected()
	{
		document.getElementById("btn_submit").disabled = false;
	}


	function boo()
	{
		if(app.isSafari || app.isIE8 || app.isIE6 || app.isChrome)
		{
			var oForm = document.getElementById("sw_fileuploader");
			oForm.submit();
		}
		else
		{
			var oF = document.getElementById("swfileupload_1");		
			o._uploadfilenode = oF.cloneNode(true); 
			app.__open_windows[window.name].returnInfo = o;
			window.close();
		}
	}


	var boolFormFileControl = true;
	function init_values()
	{
		if(!__boolInContext) return;

		if(app.isIE6)
		{
			try
			{
				window.dialogHeight="150px";
				window.resizeTo(400,150);
			}
			catch (e)
			{
			}
		}
		//-- set form action
		if(app.isSafari || app.isIE8 || app.isIE6 || app.isChrome)
		{

			document.getElementById("frm_sessiontoken").value = app.httpNextToken;
			document.getElementById("swsessionid").value = app._swsessionid;
			document.getElementById("_uniqueformid").value = info.__form['_uniqueformid'];		

			if(info.__form['_prefixfilename']!=undefined)document.getElementById("_prefixfilename").value = info.__form['_prefixfilename'];		

			boolFormFileControl = (info.__form['_uniqueformid']!=-1)?true:false;
			if(boolFormFileControl)
			{
				var oForm = document.getElementById("sw_fileuploader");
				var strAction = "service/fileupload/index.php";

				if(info.__form['filecontrol']._fileuploadservicepath!="")strAction = info.__form['filecontrol']._fileuploadservicepath;
				oForm.setAttribute("action",app._root + strAction);

				//-- set vars to pass to  prcoessor
				document.getElementById("swfileuploadcallbackfunctionid").value = info.__form['filecontrol'].name;

				//-- callback to control when loaded
				info.__form['_top'].__arr_fileupload_callbacks[info.__form['filecontrol'].name] = new Object();
				info.__form['_top'].__arr_fileupload_callbacks[info.__form['filecontrol'].name].filelist = info.__form['filecontrol'];
			}
			else
			{
				//-- calling from something like my library
				var oForm = document.getElementById("sw_fileuploader");
				oForm.setAttribute("action",app.global._fileUploadPhpSrc);
				var eGenField = document.getElementById("frm_genfieldone");
				if(eGenField!=null)
				{
					eGenField.value = info.__form['_genfieldvalue'];
				}
			}
		}
	}

	function fileuploadcomplete(strRes,strFile,strSize,strFileDate,strCallbackID, strWebRoot, strOrigFileName)
	{
		if(boolFormFileControl)
		{
			info.__form['_top'].fileuploadcomplete(strRes,strFile,strSize,strFileDate,strCallbackID, strWebRoot, strOrigFileName);
		}
		window.close();
	}
</script>
<body onload="init_values();"  onunload="app._on_window_closed(window.name)">
Please select a file to upload to the Supportworks Server. Larger files will take longer to process.<br><br>The maximum file size limit is <?php echo ini_get("upload_max_filesize");?>
<form id='sw_fileuploader' name='sw_fileuploader' method="POST" enctype="multipart/form-data" action="" target="_safloader" >
<table border='0' width="100%" cellspacing='0' cellpadding='0'>
	<tr>
		<td>
			<input type='file' style='width:100%' id='swfileupload_1' name='swfileupload_1' onchange='onfileselected()'>
			<input type='hidden' name='swsessionid'  id='swsessionid' value=''>
			<input type='hidden' name='_safari'  id='_safari' value='1'>
			<input type='hidden' name='swfileuploadcallbackfunctionid' id='swfileuploadcallbackfunctionid'  value=''>
			<input type='hidden' name='_uniqueformid' id='_uniqueformid' value=''>
			<input type='hidden' name='_prefixfilename' id='_prefixfilename' value=''>
			<input type="hidden" name="genfieldone" id="frm_genfieldone" value=''>
			<input type="hidden" name="sessiontoken" id='frm_sessiontoken' value=''>
		</td>
		<td>
			<input type='button' value='Upload File' id='btn_submit' onclick='boo()' disabled>
		</td>
	</tr>
</table>
</form>
<iframe id='_safloader' name='_safloader' style='display:none;'></iframe>
</body>
</html>