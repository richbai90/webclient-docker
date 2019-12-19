<?php

//-- check for trusted key and username in php vars
include("../../../../php/_wcconfig.php");

//-- check if feedback is enabled

?>
<html>
<head>
	<title>Your Feedback - Hornbill Cares</title>
	<style>
		*{font-size:11px;font-family:Verdana,sans-serif;}
		body
		{
			background-color:#F9F9F9;
		}
		td{font-size:11px}

		.feedback-welcome
		{
			padding:0px 2px 2px 2px;
		}
		.feedback-input
		{
			width:325px;
			height:150px;
			border:1px solid #a5a5a5;

		}

		.feedback-btn
		{
			padding:2px;
			margin:2px;
		}

		.btn-mid
		{
			width:125px;
		}

		.fl-r
		{
			float:right;
		}

	</style>
	<script>
	
	//-- for some reason firefox tries to open this window (in a tab) again once closed.
	//-- work fine on all other browsers
	if(opener==null)
	{
		window.close()	
	}
	else
	{
		//-- running in context check
		var __boolInContext = true;
		var info = opener.__open_windows[window.name];

		

		var app = info.__app;

		if(app==undefined)
		{
			alert("This form has been opened outside of its intended context. Please contact your Administrator");
			window.close();
		}

		//-- 20.03.2012 - leave feedback
		function leave_feedback()
		{
			var frm = document.getElementById('lf-feedback');
			var strText = document.getElementById("feedback_text").value;
			var feedbackRecommendation = app.getSelectedRadioValue(document.getElementById("form_feedback").feedback_recommendation);
			if(feedbackRecommendation=="")feedbackRecommendation=0;


			if(strText=="")
			{
				alert("Please provide some feedback text before submitting the form.");
				return;
			}

			
			var xmlmc = app._new_xmlmethodcall();
			xmlmc.SetParam("app","Webclient");
			xmlmc.SetParam("message",strText);
			xmlmc.SetParam("nps",feedbackRecommendation);

			if(xmlmc.Invoke("system","sendProductFeedback"))
			{
				alert("Thankyou for taking the time to provide your feedback.");
				window.close();
			}
			else
			{
				alert("It appears that submitting your feedback failed. Please contact your Administrator");
			}
		}

		function cancel(e)
		{
			window.close();
		}
	}
	</script>
</head>
<body onunload="app._on_window_closed(window.name)">

	<form id='form_feedback' name='form_feedback' enctype="multipart/form-data" target="ifFeedback" style="padding:0;margin:0;">
		<table cellspacing='2' cellpadding='2' border='0'>
		<tr>
			<td valign="top">
					<textarea id='feedback_text' class="feedback-input"></textarea>
			</td>
			<td valign="top">
				<div class="feedback-welcome">We're listening and we love feedback! 
				Tell us what you think about our product, good or bad. It's important to us that our product team can hear your voice 
				and your feedback will help us shape what we do for you.
				<br/><br/>
				This form is for feedback only and no direct response or acknowledgement will be given. If you require a response, please contact your Supportworks administrator to ensure a support request is raised.
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<hr/>
				<p>
				OPTIONAL: How likely are you to recommend Supportworks to a friend or co-worker?
				</p>
			</td>
		</tr>
		<tr>
			<td colspan="2" align="center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="2" align="center">

				<table>
					<tr>
						<td>Very Unlikely</td>
						<td><input type="radio" name="feedback_recommendation" value="1"></td>
						<td><input type="radio" name="feedback_recommendation" value="2"></td>
						<td><input type="radio" name="feedback_recommendation" value="3"></td>
						<td><input type="radio" name="feedback_recommendation" value="4"></td>
						<td><input type="radio" name="feedback_recommendation" value="5"></td>
						<td><input type="radio" name="feedback_recommendation" value="6"></td>
						<td><input type="radio" name="feedback_recommendation" value="7"></td>
						<td><input type="radio" name="feedback_recommendation" value="8"></td>
						<td><input type="radio" name="feedback_recommendation" value="9"></td>
						<td><input type="radio" name="feedback_recommendation" value="10"></td>
						<td>Biggest Fan</td>
					</tr>
					<tr>
						<td></td>
						<td align="middle">1</td>
						<td align="middle">2</td>
						<td align="middle">3</td>
						<td align="middle">4</td>
						<td align="middle">5</td>
						<td align="middle">6</td>
						<td align="middle">7</td>
						<td align="middle">8</td>
						<td align="middle">9</td>
						<td align="middle">10</td>
						<td></td>
					</tr>
				</table>
			</td>
		</tr>
		<tr>
			<td>
				<button onclick="cancel(event)"  class="feedback-btn">Cancel</button>
			</td>
			<td>
				<button onclick="leave_feedback(event);" class="feedback-btn btn-mid fl-r">Send Feedback</button>
			</td>
		</tr>
		</table>
	</form>

</body>
</html>