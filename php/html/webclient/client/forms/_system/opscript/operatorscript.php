<?php

	//-- check session
	$excludeTokenCheck=true;
	include("../../../../php/session.php");
?>
<html>
<title></title>
<style>
	*
	{
		font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
	}

	body
	{
		background-color:#dfdfdf;
	}

	button
	{
		width:60px;
	}
	td
	{
		font-size:85%;
	}

	input
	{
		width:100%;
	}
	select
	{
		width:100%;
	}
	textarea
	{
		width:100%;
		height:100px;
	}
	.aradio
	{
		width:auto;
	}
	.question
	{
		padding:4px;
		font-size:85%;
		width:100%;
		height:100px;
		background-color:#ffffff;
		border:1px solid #808080;
	}

	.answer
	{
		height:100%;
		width:100%;
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
	var _params = app._explodeparams(info.__params);

	//--
	//-- use sqlquery to get operator script config and then call php to get questions
	var strSelectConfig = "select * from callscript_config where sid=" + _params.scriptid;
	var oRS = app._new_SqlQuery();
	oRS.query(strSelectConfig,"syscache");
	if(oRS.Fetch())
	{
		document.title = oRS.GetValueAsString('title');
		var strDefaultField = oRS.GetValueAsString('defaultfield');
		if(strDefaultField=="")strDefaultField="updatedb.updatetxt";

		//-- get questions and choices and put into xml string
		var strParams = "scriptid=" + _params['scriptid'];
		var strURL = app.get_service_url("operatorscript/getquestions","");
		var strXML = app.get_http(strURL, strParams, true, false);
	}
	else
	{
		alert("There is no data defined for this script. Please contact your Administrater");
		self.close();
	}

	var array_answers = new Array();
	var asked_questions = new Array();
	

	//-- handle form close
	var o = new Object();
	o._answers = new Array();
	function form_close()
	{
		app.__open_windows[window.name].returnInfo = o;
	}

	var oXmlCallscript =null;
	function initialise()
	{
		oXmlCallscript = app.create_xml_dom(strXML);

		//-- output first question
		var arrQuestions = oXmlCallscript.getElementsByTagName("q");
		output_question(arrQuestions[0])
	}


	function get_next_question()
	{
		var currentQ = asked_questions[asked_questions.length-1];
		var strCurrentQID = app.xmlNodeTextByTag(currentQ,"qid", 0);

		//-- check current question answer and get nqid
		var strNQID = store_answer_and_get_nqid(strCurrentQID);
		if(strNQID==-1)
		{
			//-- end of script
			apply_answers_to_callform();
			self.close();
			return; 
		}

		if(strNQID==-2) return; //--mandatory q not answered
		if(strNQID==-3) return; //-- next question not found;


		var xmlQuestion = null;
		var arrQuestions = oXmlCallscript.getElementsByTagName("q");
		for(var x=0;x<arrQuestions.length;x++)
		{
			var strQID = app.xmlNodeTextByTag(arrQuestions[x],"qid", 0);
			if(strQID==strNQID)
			{
				 xmlQuestion = arrQuestions[x];
				break;
			}
			else if(strNQID==0)
			{
				//-- get next question after current
				if(arrQuestions[x-1]==currentQ)
				{
					xmlQuestion = arrQuestions[x];
					break;
				}
			}
		}
		
		if(xmlQuestion==null)
		{
			alert("The next question could not be found. Please contact your administrator.");
		}
		else
		{
			//-- output next question - get answer for q (if we have gone back and forwards
			var qID = app.xmlNodeTextByTag(xmlQuestion,"qid");
			var strValue = array_answers[qID];
			output_question(xmlQuestion,strValue)
		}
		
	}

	function is_there_a_next_question(strCurrentQID,currentQ)
	{
		var divA = document.getElementById('div_answer');
		if(divA!=null)
		{
			var fNode = divA.firstChild;
			if(fNode==null)return true;
			var nQID = fNode.getAttribute("nqid");

			//-- means goto next question in sequence
			if(nQID==0)nQID = (strCurrentQID-1) + 2;

			var xmlQuestion = null;
			var arrQuestions = oXmlCallscript.getElementsByTagName("q");
			for(var x=0;x<arrQuestions.length-1;x++)
			{
				var strQID = app.xmlNodeTextByTag(arrQuestions[x],"qid", 0);
				if(strQID==nQID)
				{
					xmlQuestion = arrQuestions[x];
					break;
				}
				else if(nQID==0)
				{
					//-- get next question after current
					if(arrQuestions[x]==currentQ)
					{
						xmlQuestion = arrQuestions[x+1];
						break;
					}
				}
			}
		
			if(xmlQuestion==undefined || xmlQuestion==null) return false

			return true;
		}
		return false;
	}

	function store_answer_and_get_nqid(intCurrQID)
	{
		var divA = document.getElementById('div_answer');
		if(divA!=null)
		{
			var fNode = divA.firstChild;
			var strBinding = fNode.getAttribute("binding");
			var nQID = fNode.getAttribute("nqid");
			var captureType = fNode.getAttribute("capturetype");

			//-- means goto next question in sequence
			if(nQID==0)nQID = (intCurrQID-1) + 2;

			var strValue = "";
			var qType = fNode.getAttribute("qtype");
			if(qType=="input" || qType=="multiselect")
			{
				strValue = app.getEleValue(fNode);
			}
			else if(qType=="singleselect")
			{
				strValue = app.getEleValue(fNode);
				//- -get options next qid
				var cNQID = fNode.options[fNode.selectedIndex].getAttribute("nqid");
				if(cNQID!=null && cNQID>0)nQID = cNQID;
				
			}
			else if(qType=="radio" || qType=="checkbox")
			{
				var arrCheckedElements = app.get_children_by_tag(fNode, "INPUT",true);
				for(var x=0;x<arrCheckedElements.length;x++)
				{
					if(arrCheckedElements[x].getAttribute("checked") || arrCheckedElements[x].checked)
					{
						if(strValue != "")strValue += ",";
						strValue += arrCheckedElements[x].value;
					}
					
				}
			}

			if(captureType=="1")
			{
				//-- do not store data
				return nQID;
			}

			//-- mandatory
			if(strValue=="" && captureType=="2")
			{
				alert("You must complete this question before you can go to the next question.");
				return -2;
			}
			else
			{
				var arrQID = fNode.id.split("q_");
				var strID = arrQID[1];
				array_answers[strID] = strValue;
				return nQID;
			}
		}		
		return -3;
	}

	var prevQuestionID = 0;
	function get_previous_question()
	{
		//-- get prev question
		asked_questions.length = asked_questions.length-1;
		var xmlQuestion = asked_questions[asked_questions.length-1];

		//-- get answer for prev q
		var qID = app.xmlNodeTextByTag(xmlQuestion,"qid");
		var strValue = array_answers[qID];
		asked_questions.length = asked_questions.length-1;

		//-- output
		output_question(xmlQuestion,strValue);
	}


	var QTYPE_VERTICAL_RADIOS=1;
	var QTYPE_HORIZONTAL_RADIOS=2;
	var QTYPE_HORIZONTAL_CHECKS=3;
	var QTYPE_VERTICAL_CHECKS=4;
	var QTYPE_DROPDOWN_LISTBOX=5;
	var QTYPE_MESSAGE=6;
	var QTYPE_SLINE_INPUT=7;
	var QTYPE_MLINE_INPUT=8;
	var QTYPE_NUMERIC_INPUT=9;
	var QTYPE_MLINE_LISTBOX=10;
	var QTYPE_PASSWORD=11;
	var QTYPE_EPOCH_INPUT=12;
	var QTYPE_DATE_INPUT=13;

	//-- output a question to screen
	function output_question(xmlQuestion,strValue)
	{
		//-- enable disable back button
		var boolBackDisabled = (asked_questions.length<1);
		var btnBack = document.getElementById('btn_back');
		if(btnBack!=null)
		{
			btnBack.setAttribute("disabled",boolBackDisabled);
			btnBack.disabled = boolBackDisabled
		}
		
		//-- if nqid=-1 its an end of script
		var nQID = app.xmlNodeTextByTag(xmlQuestion,"nqid", 0);

		var boolIsNextQ = is_there_a_next_question(nQID,xmlQuestion);

		var strBtnText = (nQID==-1 || !boolIsNextQ)?"Finish":"Next";
		var btnNext = document.getElementById('btn_next');
		if(btnNext!=null)
		{
			app.setElementText(btnNext,strBtnText);
		}

		var divQ = document.getElementById('div_q');
		if(divQ!=null)
		{
			var strText = app.xmlNodeTextByTag(xmlQuestion,"qtext", 0);
			app.setElementText(divQ,strText);
		}

		var intQType = app.xmlNodeTextByTag(xmlQuestion,"type", 0);
		intQType++;intQType--;
		switch(intQType)
		{
			case QTYPE_VERTICAL_RADIOS:
				draw_radio(xmlQuestion,true,strValue);
				break;
			case QTYPE_HORIZONTAL_RADIOS:
				draw_radio(xmlQuestion,false,strValue);
				break;
			case QTYPE_HORIZONTAL_CHECKS:
				draw_checkbox(xmlQuestion,false,strValue);
				break;
			case QTYPE_VERTICAL_CHECKS:
				draw_checkbox(xmlQuestion,true,strValue);
				break;
			case QTYPE_DROPDOWN_LISTBOX:
				draw_selectbox(xmlQuestion,false,strValue);
				break;
			case QTYPE_MESSAGE:
				//-- nothing to do
				draw_message(xmlQuestion);
				break;
			case QTYPE_SLINE_INPUT:
				draw_textbox(xmlQuestion,false,false,strValue);
				break;
			case QTYPE_MLINE_INPUT:
				draw_textarea(xmlQuestion,strValue);
				break;
			case QTYPE_NUMERIC_INPUT:
				draw_textbox(xmlQuestion,false,true,strValue);
				break;
			case QTYPE_MLINE_LISTBOX:
				draw_selectbox(xmlQuestion,true,strValue);
				break;
			case QTYPE_PASSWORD:
				draw_textbox(xmlQuestion,true,strValue);
				break;
			case QTYPE_EPOCH_INPUT:
				break;
			case QTYPE_DATE_INPUT:
				break;
		}

		asked_questions[asked_questions.length++] = xmlQuestion;
	}

	function get_common_attributes(xmlQuestion)
	{
		//-- check if mandatory or do not store
		var strBinding = app.xmlNodeTextByTag(xmlQuestion,"targetfield",0)
		if(strBinding=="")strBinding = strDefaultField;

		var intSID = app.xmlNodeTextByTag(xmlQuestion,"sid",0)
		var intQID = app.xmlNodeTextByTag(xmlQuestion,"qid",0)
		var strEleID = "q_"+intQID;

		var strNextQID = app.xmlNodeTextByTag(xmlQuestion,"nqid",0)
		var intFlag = app.xmlNodeTextByTag(xmlQuestion,"flags",0)
		if (intFlag & 1)
		{
			//-- do not need to capture data (i.e. does not need to be stored on the database)
			return " id='"+strEleID+"' binding='"+strBinding+"' nqid='"+strNextQID+"' capturetype='1' ";
		}
		else if (intFlag & 2)
		{
			//-- mandatory
			return " id='"+strEleID+"'  binding='"+strBinding+"' nqid='"+strNextQID+"' class='mandatory' capturetype='2' ";
		}
		else
		{
			//-- not mandatory
			return " id='"+strEleID+"'  binding='"+strBinding+"' nqid='"+strNextQID+"' capturetype='3' ";
		}
	}

	function draw_message(xmlQuestion)
	{
		var strCaptureType = get_common_attributes(xmlQuestion);
		var strHTML = "<div " +strCaptureType+ " qtype='message'></div>";
		var divAns = document.getElementById('div_answer');
		if(divAns!=null)
		{
			divAns.innerHTML = strHTML;
		}

	}

	//-- draw textbox
	function draw_textbox(xmlQuestion,boolPassword,boolNumeric,strValue)
	{
		if(boolPassword==undefined)boolPassword=false;
		if(boolNumeric==undefined)boolNumeric=false;
		if(strValue==undefined)strValue="";

		var strCaptureType = get_common_attributes(xmlQuestion);
		var strType = (boolPassword)?"password":"text";
		var strHTML = "<input type='"+strType+"' value='"+strValue+"' qtype='input' format='" + boolNumeric + "' "+strCaptureType+">";
		var divAns = document.getElementById('div_answer');
		if(divAns!=null)
		{
			divAns.innerHTML = strHTML;
		}
	}

	//-- draw textarea
	function draw_textarea(xmlQuestion,strValue)
	{
		var strCaptureType = get_common_attributes(xmlQuestion);
		if(strValue==undefined)strValue="";
		var strHTML = "<textarea  "+strCaptureType+" qtype='input'>"+strValue+"</textarea>";
		var divAns = document.getElementById('div_answer');
		if(divAns!=null)
		{
			divAns.innerHTML = strHTML;
		}
	}

	//-- draw selectbox
	function draw_selectbox(xmlQuestion,boolMulti,strValue)
	{
		var strCaptureType = get_common_attributes(xmlQuestion);
		var strMulti = (boolMulti)?"multiple size='5'":"";
		if(strValue==undefined)strValue="";

		var strOptions = get_select_box_options(xmlQuestion,boolMulti,strValue);
		var strQType = (boolMulti)?"qtype='multiselect'":"qtype='singleselect'";
		var strHTML = "<select "+strQType+"  " + strMulti + " "+strCaptureType+">"+strOptions+"</select>";
		var divAns = document.getElementById('div_answer');
		if(divAns!=null)
		{
			divAns.innerHTML = strHTML;
		}
	}
	function get_select_box_options(xmlQuestion,boolMulti,strValue)
	{

		//-- get listbox options
		var pid = app.xmlNodeTextByTag(xmlQuestion,"qid",0)
		var sid = app.xmlNodeTextByTag(xmlQuestion,"sid",0)
		var boolOptional = (app.xmlNodeTextByTag(xmlQuestion,"flags",0)& 2)?false:true;
		var strOptions = (boolOptional && !boolMulti)?"<option value=''></option>":"";
		if(strValue==undefined)strValue="";

		var arrAns = strValue.split(",");
		var arrChoices = oXmlCallscript.getElementsByTagName("qc");
		for(var x=0;x<arrChoices.length;x++)
		{
			var intQID = app.xmlNodeTextByTag(arrChoices[x],"qid",0)
			var intSID = app.xmlNodeTextByTag(arrChoices[x],"sid",0)
			if((intSID==sid)&&(intQID==pid))
			{
				//-- its a choice
				var strNextQID = app.xmlNodeTextByTag(arrChoices[x],"tqid",0);
				var strText = app.xmlNodeTextByTag(arrChoices[x],"ctext",0);
				var strSelected = (app.xmlNodeTextByTag(arrChoices[x],"defans",0)=="1")?"selected":"";
				var strValue = strText;

				//-- is it a preselected answer (gone back and then forwards)
				for(var y=0;y<arrAns.length;y++)
				{
					if(arrAns[y] == strText)strSelected="selected";
				}
				strOptions += "<option nqid='" + strNextQID + "' " + strSelected + " value='"+strValue+"'>"+strText+"</option>";
			}
		}
		return strOptions;
	}

	//-- output radio questiom
	function draw_radio(xmlQuestion,boolVertical,strValue)
	{
		if(strValue==undefined)strValue="";
		var strCaptureType = get_common_attributes(xmlQuestion);
		var strOptions = get_radio_options(xmlQuestion,boolVertical,strValue);
		
		

		var strHTML = "<div "+strCaptureType+" qtype='radio'>"+strOptions+"</div>";
		var divAns = document.getElementById('div_answer');
		if(divAns!=null)
		{
			divAns.innerHTML = strHTML;
		}

	}
	function get_radio_options(xmlQuestion,boolVertical,strValue)
	{
		var strSep = (boolVertical)?"<br>":"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		var strOptions = "";
		if(strValue==undefined)strValue="";
		var arrAns = strValue.split(",");

		//-- get listbox options
		var pid = app.xmlNodeTextByTag(xmlQuestion,"qid",0)
		var sid = app.xmlNodeTextByTag(xmlQuestion,"sid",0)

		var arrChoices = oXmlCallscript.getElementsByTagName("qc");
		for(var x=0;x<arrChoices.length;x++)
		{
			var intQID = app.xmlNodeTextByTag(arrChoices[x],"qid",0)
			var intSID = app.xmlNodeTextByTag(arrChoices[x],"sid",0);
			var strCID = app.xmlNodeTextByTag(arrChoices[x],"cid",0);
			var strEleID = intQID + "_" + strCID;
			if((intSID==sid)&&(intQID==pid))
			{
				//-- its a choice
				var strNextQID = app.xmlNodeTextByTag(arrChoices[x],"tqid",0);
				var strText = app.xmlNodeTextByTag(arrChoices[x],"ctext",0);
				var strChecked = (app.xmlNodeTextByTag(arrChoices[x],"defans",0)=="1")?"CHECKED":"";
				var strValue = strText;

				//-- is it a preselected answer (gone back and then forwards)
				for(var y=0;y<arrAns.length;y++)
				{
					if(arrAns[y] == strText)strChecked="CHECKED";
				}

				strOptions += "<input id='"+ strEleID + "' name='rdo' type='radio' " + strChecked + "  class='aradio' nqid='" + strNextQID + "' value='" + strValue + "'>" + strText + strSep;
			}
		}
		return strOptions;
	}


	//-- output radio questiom
	function draw_checkbox(xmlQuestion,boolVertical,strValue)
	{
		if(strValue==undefined)strValue="";
		var strCaptureType = get_common_attributes(xmlQuestion);
		var strOptions = get_checkbox_options(xmlQuestion,boolVertical,strValue);


		var strHTML = "<div "+strCaptureType+" qtype='checkbox'>"+strOptions+"</div>";
		var divAns = document.getElementById('div_answer');
		if(divAns!=null)
		{
			divAns.innerHTML = strHTML;
		}

	}
	function get_checkbox_options(xmlQuestion,boolVertical,strValue)
	{
		var strSep = (boolVertical)?"<br>":"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		var strOptions = "";
		if(strValue==undefined)strValue="";
		var arrAns = strValue.split(",");

		//-- get listbox options
		var pid = app.xmlNodeTextByTag(xmlQuestion,"qid",0)
		var sid = app.xmlNodeTextByTag(xmlQuestion,"sid",0)

		var arrChoices = oXmlCallscript.getElementsByTagName("qc");
		for(var x=0;x<arrChoices.length;x++)
		{
			var intQID = app.xmlNodeTextByTag(arrChoices[x],"qid",0)
			var intSID = app.xmlNodeTextByTag(arrChoices[x],"sid",0)
			var strCID = app.xmlNodeTextByTag(arrChoices[x],"cid",0);
			var strEleID = intQID + "_" + strCID;
			if((intSID==sid)&&(intQID==pid))
			{
				//-- its a choice

				var strNextQID = app.xmlNodeTextByTag(arrChoices[x],"tqid",0);
				var strText = app.xmlNodeTextByTag(arrChoices[x],"ctext",0);
				var strChecked = (app.xmlNodeTextByTag(arrChoices[x],"defans",0)=="1")?"CHECKED":"";
				var strValue = strText;
				//-- is it a preselected answer (gone back and then forwards)
				for(var y=0;y<arrAns.length;y++)
				{
					if(arrAns[y] == strText)strChecked="CHECKED";
				}


				strOptions += "<input id='"+ strEleID + "' type='checkbox' " + strChecked + "   class='aradio' nqid='" + strNextQID + "' value='" + strValue + "'>" + strText + strSep;
			}
		}
		return strOptions;
	}

	
	//--
	function apply_answers_to_callform()
	{
		var arrQuestions = oXmlCallscript.getElementsByTagName("q");

		for(strAnswerQID in array_answers)
		{
			//-- value
			var strAnswer = array_answers[strAnswerQID];

			//-- get question xml
			for(var x=0;x<arrQuestions.length;x++)
			{
				var strQID = app.xmlNodeTextByTag(arrQuestions[x],"qid", 0);
				if(strQID==strAnswerQID)
				{

					var strBinding = app.xmlNodeTextByTag(arrQuestions[x],"targetfield",0)
					if(strBinding=="")strBinding=strDefaultField;

					//-- prefix question to answer if default field
					if(strBinding==strDefaultField) 
					{
						var strText = app.xmlNodeTextByTag(arrQuestions[x],"qtext",0)
						strAnswer = strText + " : " + strAnswer;
					}


					//-- get record and set value if exists.
					if(o._answers[strBinding]!=undefined)
					{
						o._answers[strBinding] += "\n"+ strAnswer;
					}
					else
					{
						o._answers[strBinding] = strAnswer;
					}
				}
			}
		}
	}

</script>

<body onload="initialise();" onbeforeunload="form_close();"  onunload="app._on_window_closed(window.name)">	
<table height="100%" width="100%";>
	<tr>
		<td valign="top">
			<div id='div_q' class='question'></div>
		</td>
	</tr>
	<tr>
		<td height="100%" valign="top">
			<div id='div_answer' class='answer'></div>
		</td>
	</tr>
	<tr>
		<td>
			<hr size="1"/>
		</td>
	</tr>
	<tr>
		<td align="right">
			<button id='btn_back' onclick="get_previous_question();" disabled>Back</button>&nbsp;&nbsp;	
			<button id='btn_next' onclick="get_next_question();">Next</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			<button onclick="self.close();">Cancel</button>	
		</td>
	</tr>

</table>

</body>
</html>
