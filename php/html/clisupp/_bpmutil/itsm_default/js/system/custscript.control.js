	var QS_PER_PAGE	= 3;

	var QTYPE_VERTICAL_RADIOS =		"1";
	var QTYPE_HORIZONTAL_RADIOS =	"2";
	var QTYPE_HORIZONTAL_CHECKS =	"3";
	var QTYPE_VERTICAL_CHECKS =		"4";
	var QTYPE_DROPDOWN_LISTBOX =	"5";
	var QTYPE_MESSAGE =				"6";
	var QTYPE_SLINE_INPUT =			"7";
	var QTYPE_MLINE_INPUT =			"8";
	var QTYPE_NUMERIC_INPUT =		"9";
	var QTYPE_MLINE_LISTBOX =		"10";
	var QTYPE_PASSWORD=				"11";
	var QTYPE_EPOCH_INPUT=			"12";
	var QTYPE_DATE_INPUT=			"13";


	//-- browser type
	var IE = (document.all);

	//-- determine page class
	var pageHideClass = "page-hide";
	var pageShowClass = "page-show";

	//-- global js vars
	var arrSUBMITANSWERS = new Array();

	//-- element pointers
	var ele_current_page;
	var ele_next;
	var ele_prev;

	//-- delimiters
	var pageDEL = "&";
	var questionDEL = "=";
	var answerDEL	= "[|]";

	var OVERRIDE_NEXT_QUESTION_ID = "0";
	var array_trail_questions = new Array();

	//-- given a listbox return t/f if an item is select
	function listbox_item_selected(oLB)
	{
		for (var y=0; y<oLB.length ;y++ )
		{
			if(oLB.options[y].selected) 
			{
				return true;
			}
		}
		return false;
	}

	//-- given a listbox return selected values delimieted by |
	function listbox_selected_items(oLB)
	{
		var strItems = "";
		for (var y=0; y<oLB.length ;y++ )
		{
			if(oLB.options[y].selected) 
			{
				OVERRIDE_NEXT_QUESTION_ID = oLB.options[y].getAttribute("gotoqid");
				if(strItems!="")strItems +=answerDEL;
				strItems += oLB.options[y].text;
			}
		}
		return strItems;
	}

	//--
	//-- return true false if the question jumps out of sync to another question
	function does_question_jump(aQuestion)
	{
		var strAnswerID   = "answer_" + aQuestion.getAttribute("qid");

		switch (aQuestion.getAttribute("qtype"))
		{
			//-- radios
			case QTYPE_VERTICAL_RADIOS:
			case QTYPE_HORIZONTAL_RADIOS:
				//-- check each radio and check if it will jump
				var array_answers = document.getElementsByName(strAnswerID);
				for (var x=0; x<array_answers.length;x++ )
				{
					var nextID = array_answers[x].getAttribute("gotoqid");
					if ((nextID != null) && (nextID != 0)) return true;
				}
				break;

			//-- list boxes
			case QTYPE_DROPDOWN_LISTBOX:
			case QTYPE_MLINE_LISTBOX:
				//-- check each list box item and check if it will jump
				var oLB = document.getElementsByName(strAnswerID)[0];
				if (oLB!=null)
				{
					for (var y=0; y<  oLB.length ;y++ )
					{

						var nextID = oLB.options[y].getAttribute("gotoqid");
						if ((nextID != null) && (nextID != 0)) return true;
					}
				}
				break;
			default:
				//-- check if next qid is incremental
				var currID = new Number(aQuestion.getAttribute("qid"));
				var nextID = new Number(aQuestion.getAttribute("nqid"));
				if ((nextID != null) && (nextID != 0) && (nextID != (currID+1) )) return true;
				break;
		}

		return false;
	}

	//-- for a question get answer (if multi del each answer with a ¦
	function get_question_answer(questionPage)
	{
		//-- get answer element/s
		var strAnswerID   = "answer_" + questionPage.getAttribute("qid");

		var checkBoxItems = "";

		//-- check if we have answers
		var array_answers = document.getElementsByName(strAnswerID);
		for (var x=0; x < array_answers.length ; x++)
		{
			switch (questionPage.getAttribute("qtype"))
			{
				//-- radios
				case QTYPE_VERTICAL_RADIOS:
				case QTYPE_HORIZONTAL_RADIOS:
					if (array_answers[x].checked)
					{
						OVERRIDE_NEXT_QUESTION_ID = array_answers[x].getAttribute("gotoqid");
						return array_answers[x].value;
					}
					break;

				// checkboxes
				case QTYPE_VERTICAL_CHECKS:
				case QTYPE_HORIZONTAL_CHECKS:
					if (array_answers[x].checked)
					{
						if(checkBoxItems!="")checkBoxItems += answerDEL;
						checkBoxItems += array_answers[x].value;
					}
					break;

				//-- list boxes
				case QTYPE_DROPDOWN_LISTBOX:
				case QTYPE_MLINE_LISTBOX:
					return listbox_selected_items(array_answers[x]);
					break;

				//-- text input
				default:
					return array_answers[x].value;
			}
		}

		return checkBoxItems;
	}

	function check_numeric(questionPage)
	{
		//-- get answer element/s
		var strAnswerID   = "answer_" + questionPage.getAttribute("qid");

		var checkBoxItems = "";

		//-- check if we have answers
		var array_answers = document.getElementsByName(strAnswerID);
		for (var x=0; x < array_answers.length ; x++)
		{
			switch (questionPage.getAttribute("qtype"))
			{
				case QTYPE_NUMERIC_INPUT:
					return(!isNaN(array_answers[x].value));
					break;
			}
		}

		return true;
	}

	function isnumeric(questionPage)
	{
		switch (questionPage.getAttribute("qtype"))
		{
			case QTYPE_NUMERIC_INPUT:
				return true;
				break;
		}
		return false;
	}


	//-- need to check question page for mandatory input
	function passed_mandatory_check(questionPage)
	{
		//-- get answer element/s
		var strAnswerID   = "answer_" + questionPage.getAttribute("qid");

		//-- check if we have answers
		var array_answers = document.getElementsByName(strAnswerID);
		for (var x=0; x < array_answers.length ; x++)
		{
			switch (questionPage.getAttribute("qtype"))
			{
				//-- radios
				case QTYPE_VERTICAL_RADIOS:
				case QTYPE_HORIZONTAL_RADIOS:
					if (array_answers[x].checked) return true;
					break;

				// checkboxes
				case QTYPE_VERTICAL_CHECKS:
				case QTYPE_HORIZONTAL_CHECKS:
					if (array_answers[x].checked) return true;
					break;

				//-- list boxes
				case QTYPE_DROPDOWN_LISTBOX:
				case QTYPE_MLINE_LISTBOX:
					if(listbox_item_selected(array_answers[x])) return true;
					break;

				//-- text input
				default:
					if (array_answers[x].value != "") return true;
			}
		}


		show_message("The question, highlighted in red, requires your input.");
		return false;
	}

	//-- NWJ 13.04.2006 - use erro msg span instead of alert
	function show_message(strMessage)
	{
		document.getElementById("error_msg").innerHTML = strMessage;
		//-- alert(strMessage);
	}

	//-- validate each question on the current page	
	//-- returns true or false
	var currFailedQ = null;
	function validate_page_answers()
	{
		for(aQuestionID in array_page_questions)
		{
			var strQID = "question_" + aQuestionID;
			var questionTextElement = document.getElementById(strQID);

			questionTextElement.style["color"] = "#000000";
			currFailedQ=questionTextElement;
			//-- check if mandatory
			var capturType = array_page_questions[aQuestionID].getAttribute("capturetype");
			if (capturType=="2")
			{
				if(!passed_mandatory_check(array_page_questions[aQuestionID])) 
				{
					questionTextElement.style["color"] = "#D40000";
					return false;
				}
			}

			//-- if a numeric field check it is a number
			if(!check_numeric(array_page_questions[aQuestionID]))
			{
				questionTextElement.style["color"] = "#D40000";
				show_message("The question, highlighted in red, requires numeric value.");
				return false;
			}

			//--
			//-- store the answer in array 
			arrSUBMITANSWERS[aQuestionID] = get_question_answer(array_page_questions[aQuestionID]);

		}
		return true;
	}

	//--
	//-- move to the next page
	function next_page()
	{

		if(ele_next.value.indexOf("Submit")!=-1)
		{
			//-- we are submitting the request
			submit_survey();
			return;
		}

		if((boolCustomerRequestFields)&&(boolOnIntro))
		{
			//-- need to load page one 
			load_page(1);
			document.getElementById('servicerequestform').className= pageHideClass;
			document.getElementById('opscript_holder').className= pageShowClass;
			ele_prev.style['display'] = "inline";
			showStepImage(true);
			CURRENT_PAGE++;
			return;
		}
		


		OVERRIDE_NEXT_QUESTION_ID="0";

		if(!validate_page_answers()) return false;

		//-- get next question id (checking if next q has been overriden by a choice tqid)
		if ((OVERRIDE_NEXT_QUESTION_ID=="")||(OVERRIDE_NEXT_QUESTION_ID==null)) OVERRIDE_NEXT_QUESTION_ID="0";
		var next_q_id = (OVERRIDE_NEXT_QUESTION_ID=="0")?array_page_questions[aQuestionID].getAttribute("nqid"):OVERRIDE_NEXT_QUESTION_ID;


		//-- hide current questions
		for(aQuestionID in array_page_questions)
		{
			array_page_questions[aQuestionID].className = "q_hide";
		}


		//-- load page
		showStepImage(true);
		++CURRENT_PAGE;
		load_page(next_q_id);

	}

	function showStepImage(boolNext)
	{
		//--
		//-- show step progress
		if(boolNext)
		{
			if(boolOnIntro)
			{
				boolOnIntro=false;
				lastStep=document.getElementById("script_step0");
				show_message("");
			}
			stepPage = CURRENT_PAGE+1;
		}
		else
		{
			if((CURRENT_PAGE==1)&&(boolCustomerRequestFields))
			{			
				boolOnIntro=true;
				if(currFailedQ!=null)currFailedQ.style["color"] = "#000000";
				show_message("");
			}
			stepPage = CURRENT_PAGE-1;
		}
		var stepID = "script_step" + stepPage;
		var aStep = document.getElementById(stepID);
		if(aStep)
		{
			aStep.className="stepOn";
			if(lastStep!=null)lastStep.className="stepToDo";
			lastStep=aStep;
		}

	}
	//--
	//-- move to the previous page
	function prev_page()
	{
		if((boolCustomerRequestFields)&&(CURRENT_PAGE==1))
		{
			//-- need to load page one 
			ele_prev.style['display'] = "none";
			document.getElementById('opscript_holder').className= pageHideClass;
			document.getElementById('servicerequestform').className= pageShowClass;
			showStepImage(false);
			CURRENT_PAGE=0;
			return true;
		}

		for(aQuestionID in array_page_questions)
		{
			array_page_questions[aQuestionID].className = "q_hide";

			//--
			//-- remove the last answer from array
			arrSUBMITANSWERS[aQuestionID] = null;
		}

		//-- load prev page
		showStepImage(false);
		--CURRENT_PAGE;

		int_load_last_q = array_start_questions[array_start_questions.length-2];
		array_start_questions.length--;	array_start_questions.length--;
		load_page(int_load_last_q);

	}

	//--
	//-- show a page and at the same time hide the current page
	var array_page_questions = new Array();
	var array_start_questions = new Array();
	var lastStep=null;
	function load_page(intFirstPageQuestion)
	{
		intFirstPageQuestion--;
		QS_PER_PAGE++;QS_PER_PAGE--;

		//-- get the questions we want to show on this page
		var int_counter = 0;
		var int_first_previous_q = -1;

			var int_currq = intFirstPageQuestion;
			array_page_questions = new Array();
			while (int_counter < QS_PER_PAGE)
			{
				if (ARRAY_ALL_QUESTIONS[int_currq])	
				{
					if (int_first_previous_q==-1)
					{
						array_start_questions[array_start_questions.length++] = int_currq+1;
						int_first_previous_q = 1;
					}
			
					array_page_questions[ARRAY_ALL_QUESTIONS[int_currq].getAttribute("qid")] = ARRAY_ALL_QUESTIONS[int_currq];
					//-- check if a multi choice (radios / listbox) that can jump to other questions if so end page
					if (does_question_jump(ARRAY_ALL_QUESTIONS[int_currq]))
					{
						break;
					}
					nextq = ARRAY_ALL_QUESTIONS[int_currq].getAttribute("nqid");
					int_currq = nextq - 1;
				}
				int_counter++;
			}

		//-- now show each question for this page
		var boolLastPage = false;
		for(aQuestionID in array_page_questions)
		{
			array_page_questions[aQuestionID].className = "q_show";
			boolLastPage = (array_page_questions[aQuestionID].getAttribute("nqid")=="end");

			//-- if mandatory then bold the question
			var strQID = "question_" + aQuestionID;
			var questionTextElement = document.getElementById(strQID);
			var capturType = array_page_questions[aQuestionID].getAttribute("capturetype");
			if (capturType=="2")
			{
				questionTextElement.style["fontWeight"] = "bold";
			}
		}

		//-- empty message area
		show_message("");

		//-- show/hide submit button
		var strDisplay = (boolLastPage)?"Submit Request":"Next Step";
		ele_next.value = strDisplay;

		//-- show/hide prev button
		var strDisplayBack = (CURRENT_PAGE>0)?"inline":"none";
		ele_prev.style['display'] = strDisplayBack;

	}


	//-- submit the survey results
	function submit_survey()
	{
		if(!validate_page_answers()) return false;

		//-- collate all the answers into one string
		var strSubmitData = "";
		for(strQID in arrSUBMITANSWERS)
		{
			if (arrSUBMITANSWERS[strQID]!=null)
			{
				if(strSubmitData!="")strSubmitData += pageDEL;
				strSubmitData += "question_" + strQID + questionDEL + arrSUBMITANSWERS[strQID];

				//--
				//-- store target field (if required)
				var oQuestion =document.getElementById('q_' + strQID);
				var strFlag = oQuestion.getAttribute("flags");
				if(strFlag!="1")
				{
					strSubmitData += pageDEL;
					var strTarget = oQuestion.getAttribute("qtarget");
					strSubmitData += "qtarget_" + strQID + questionDEL + strTarget;
					//-- dtype (0=str/1=num)
					strSubmitData += pageDEL;
					var intDType = isnumeric(oQuestion)?"1":"0";
					strSubmitData += "qdtype_" + strQID + questionDEL +	intDType;

					//-- question text - what was asked
					var strQuestionText = document.getElementById('question_' + strQID).innerHTML;
					strSubmitData += pageDEL;
					strSubmitData += "qtext_" + strQID + questionDEL +	strQuestionText;
				}
			}
		}

		if(boolCustomerRequest)
		{
			//-- we need to process standard customer request fields so get url
			var strURL = get_form_url_data(document.getElementById("servicerequestform"));
			if(strURL!="")strSubmitData += "&" + strURL;
			
		}

		strSubmitData += "&scriptid=" + document.getElementById("hdn_scriptid").value;

		//--
		//-- uncomment below when you are developing and want to check answers
		//--
		//arrayQuestions = strSubmitData.split(pageDEL);
		//for(y=0;y<arrayQuestions.length;y++)
		//{
		//	arrayAnswer = arrayQuestions[y].split(questionDEL);
		//	alert("Question " + arrayAnswer[0] + " = " + arrayAnswer[1].split(answerDEL))
		//}
		//alert(strSubmitData)
		if(boolCustomerRequest)
		{
			process_customerrequest_onserver(strSubmitData);
		}
		else
		{
			//-- just processing a op script
			process_operatorscript_onserver(strSubmitData);
		}
	}

	function process_customerrequest_onserver(strData)
	{
		var strURL = "php/xmlhttp/servicerequest.submit.php?" + strData;
		load_content(strURL);
	}


	function process_operatorscript_onserver(strData)
	{
		var strURL = "php/xmlhttp/operatorscript.submit.php?" + strData;
		load_content(strURL);
	}

	//-- handle any onload activities here
	var boolCustomerRequest = false;
	var boolCustomerRequestFields = false;
	var boolOnIntro=false;
	var ARRAY_ALL_QUESTIONS = new Array();
	var CURRENT_PAGE = 0;

	function initialise_customer_script()
	{
		boolCustomerRequest = (document.getElementById("servicerequestform")!=null);
		boolCustomerRequestFields=(document.getElementById("servicerequestformfields")!=null);


		ARRAY_ALL_QUESTIONS = new Array();
		CURRENT_PAGE = 0;

		//-- store all of the questions in an array
		var array_spans = document.getElementsByTagName("SPAN");
		for (var x=0;x<array_spans.length;x++)
		{
			if (array_spans[x].getAttribute("aquestion"))
			{
				//-- this is a valid question
				ARRAY_ALL_QUESTIONS[ARRAY_ALL_QUESTIONS.length++] = array_spans[x];
			}
		}


		//-- create script steps spans
		var	intpagecount = new String((ARRAY_ALL_QUESTIONS.length / QS_PER_PAGE));
		if(intpagecount.indexOf(".")!=-1)
		{
			intpagecount = intpagecount.split(".")[0];
			intpagecount++;
		}

		var strSteps="";
		var numSteps=intpagecount;
		if(boolCustomerRequestFields)numSteps++;
		for(var x=0;x<numSteps;x++)
		{
			strClass = (x==0)?"stepOn":"stepToDo";
			strSteps += "<span id='script_step"+x+"' class='"+strClass+"'>" + (x+1) + "</span>";
		}
		document.getElementById("script_steps").innerHTML = "Step: "+strSteps;

		ele_prev  = document.getElementById('btn_prev_page');
		ele_next  = document.getElementById('btn_next_page');

		lastStep = document.getElementById("script_step0");

		//-- need a way to show standard fields then op script
		if(boolCustomerRequestFields)
		{
			boolOnIntro=true;
			ele_prev.style['display']='none';
		}
		else
		{
			document.getElementById('opscript_holder').className= pageShowClass;
			//-- load the first page / question
			load_page(1);
		}
	}