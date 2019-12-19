<?php

	//-- NWJ
	//--
	//-- Class to draw out customer scripts based on standard operator scripts
	//-- functions that given a question object will generate the html required to present the question
	include_once('common.php');


	//-- question types
	define("QTYPE_VERTICAL_RADIOS",		1);
	define("QTYPE_HORIZONTAL_RADIOS",	2);
	define("QTYPE_HORIZONTAL_CHECKS",	3);
	define("QTYPE_VERTICAL_CHECKS",		4);
	define("QTYPE_DROPDOWN_LISTBOX",	5);
	define("QTYPE_MESSAGE",				6);
	define("QTYPE_SLINE_INPUT",			7);
	define("QTYPE_MLINE_INPUT",			8);
	define("QTYPE_NUMERIC_INPUT",		9);
	define("QTYPE_MLINE_LISTBOX",		10);
	define("QTYPE_PASSWORD",			11);
	define("QTYPE_EPOCH_INPUT",			12);
	define("QTYPE_DATE_INPUT",			13);

	//-- store info about a survey
	class aScript
	{
		var $id;
		var $name;
		var $title;
		var $defaultfield;
		var $notvalid=false;
		var $array_questions = array();

		//-- constructor
		function aScript($in_id,$cacheDB)
		{
			$this->id   = $in_id;

			//-- get script info
			$query = "SELECT * FROM callscript_config WHERE sid=".$this->id."";
			$cacheDB->Query($query);
			$aRS = $cacheDB->CreateRecordSet();
			if(($aRS)&&(!$aRS->eof))
			{
				$this->name=$aRS->f('scriptname');
				$this->title=$aRS->f('title');
				$this->defaultfield=$aRS->f('defaultfield');
				$this->get_script_questions($cacheDB);
			}
			else
			{
				$this->notvalid=true;
			}
		}

		//-- connect and get questions and question choices
		function get_script_questions($cacheDB)
		{
			//-- select all questions for the script order by question id
			$query = "SELECT * FROM callscript_q WHERE sid=".$this->id." order by qid asc";
			$cacheDB->Query($query);

			$this->array_questions = array();
			$int_last_qid=0;
			$boolQsFound = false;
			$aRS = $cacheDB->CreateRecordSet();
			if($aRS)
			{
				while(!$aRS->eof)
				{
					$strTargetField = $aRS->f('targetfield');
					if($strTargetField=="") $strTargetField = $this->defaultfield;
					//echo $strTargetField . " : " . $this->defaultfield;

					$this->array_questions[$aRS->f('qid')] = new aQuestion($int_script_id, $aRS->f('type'),$aRS->f('qtext'),$aRS->f('qid'),$aRS->f('nqid'),$int_last_qid,$aRS->f('flags'),$strTargetField);
					$int_last_qid = $aRS->f('qid');
					$boolQsFound = true;
					$aRS->movenext();
				}
			}

			//-- no questions defined		
			if(!$boolQsFound)
			{
				$failMessage = "Failed to fetch any questions for the survey using [".$query."]";
			}

			//-- now select all question choices for this script
			//-- select all questions for the script order by question id
			$query = "SELECT * FROM callscript_qc WHERE sid=".$this->id." order by qid,cid asc";
			$cacheDB->Query($query);
			$aRS = $cacheDB->CreateRecordSet();
			if($aRS)
			{
				while(!$aRS->eof)
				{
					//-- store each question choice in an array		
					$this->array_questions[$aRS->f('qid')]->array_choices[$aRS->f('cid')] = new aChoice($aRS->f('cid'),$aRS->f('ctext'),$aRS->f('tqid'),$aRS->f('defans'));
					$aRS->movenext();
				}
			}
		}
	}
	//-- eof survey class

	//-- store information about a question
	class aQuestion
	{
		var $script_id;
		var $type;
		var $q_text;
		var $q_id;
		var $next_q_id;
		var $prev_q_id;
		var $flags;
		var $target;

		var $array_choices = array();
		var $html = ""; //-- hold html to generate question on screen

		//-- constructor
		function aQuestion($in_script_id,$in_type,$in_q_text,$in_q_id,$in_next_q_id,$in_prev_q_id,$in_flags,$in_target)
		{
			$this->script_id = $in_script_id;
			$this->type = $in_type;
			
			$this->q_text = nl2br($in_q_text);
			$this->q_id = $in_q_id;
			$this->next_q_id = $in_next_q_id;
			$this->prev_q_id = $in_prev_q_id;
			$this->flags = $in_flags;		
			$this->target = $in_target;		
		}

		//-- create html for a question
		function generate_html()
		{
			switch($this->type)
			{
				case QTYPE_VERTICAL_RADIOS:
					return draw_vertical_radios($this);
					break;
				case QTYPE_HORIZONTAL_RADIOS:
					return draw_horizontal_radios($this);
					break;
				case QTYPE_HORIZONTAL_CHECKS:
					return draw_horizontal_checkboxes($this);
					break;
				case QTYPE_VERTICAL_CHECKS:
					return draw_vertical_checkboxes($this);
					break;
				case QTYPE_DROPDOWN_LISTBOX:
					return draw_dropdown_listbox($this);
					break;
				case QTYPE_MESSAGE:
					return draw_message($this);
					break;
				case QTYPE_SLINE_INPUT:
					return draw_singleline_input($this);
					break;
				case QTYPE_PASSWORD:
					return draw_password_input($this);
					break;
				case QTYPE_MLINE_INPUT:
					return draw_multiline_input($this);
					break;
				case QTYPE_NUMERIC_INPUT:
					return draw_numeric_input($this);
					break;
				case QTYPE_MLINE_LISTBOX:
					return draw_mline_listbox($this);
					break;
			}
		}
	}
	//-- eof question class

	class aChoice
	{
		var $choice_id;
		var $choice_text;
		var $choice_goto_q_id;
		var $bool_default;

		//-- constructor
		function aChoice($in_cid,$in_ctext,$in_c_goto_qid,$in_default)
		{
			$this->choice_id		= $in_cid;
			$this->choice_text		= $in_ctext;
			$this->choice_goto_q_id	= $in_c_goto_qid;
			$this->bool_default		= $in_default;
		}
	}
	//-- eof choice class


	function get_capturetype_attribute($in_question)
	{
		//-- check if mandatory or do not store
		if ($in_question->flags & 1)
		{
			//-- do not need to capture data (i.e. does not need to be stored on the database)
			return " capturetype='1' ";
		}
		else if ($in_question->flags & 2)
		{
			//-- mandatory
			return " capturetype='2' ";
		}
		else
		{
			//-- not mandatory
			return " capturetype='3' ";
		}
	}

	//-- output html for vertical radios
	function draw_vertical_radios($in_question)
	{

		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.$in_question->q_text.'</span><br/>';
		$strInput	 = '<table border="0" cellspacing="0" cellpadding="2">';

		$answerID    = ' name="answer_'.$in_question->q_id.'"';


		foreach($in_question->array_choices as $choice_id => $currChoice)
		{
			$strChecked = ($currChoice->bool_default)?"checked":"";
			$strChoice .= '<tr>';
			$strChoice .= '<td><input '.$answerID.' type=radio ' . $strChecked . ' class="q_radio" gotoqid="'.$currChoice->choice_goto_q_id.'" value="'.($currChoice->choice_text).'"></td>';
			$strChoice .= '<td>'.($currChoice->choice_text).'</td>';
			$strChoice .= '</tr>';
		}

		$strInput	.= $strChoice . '</table>';
		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}

	//-- output html for horizont radios
	function draw_horizontal_radios($in_question)
	{

		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<table border="0" cellspacing="0" cellpadding="2"><tr>';

		$answerID    = ' name="answer_'.$in_question->q_id.'"';

		foreach($in_question->array_choices as $choice_id => $currChoice)
		{
			$strChecked = ($currChoice->bool_default)?"checked":"";
			$strChoice .= '<td><input '.$answerID.' type=radio ' . $strChecked . '   class="q_radio" gotoqid="'.$currChoice->choice_goto_q_id.'" value="'.($currChoice->choice_text).'"></td>';
			$strChoice .= '<td>'.($currChoice->choice_text).'</td>';
		}

		$strInput	.= $strChoice . '</tr></table>';
		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}

	//-- output html for horizont check boxes
	function draw_horizontal_checkboxes($in_question)
	{

		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<table border="0" cellspacing="0" cellpadding="2"><tr>';

		$answerID    = ' name="answer_'.$in_question->q_id.'"';

		foreach($in_question->array_choices as $choice_id => $currChoice)
		{
			$strChecked = ($currChoice->bool_default)?"checked":"";
			$strChoice .= '<td><input  '.$answerID.'  type=checkbox ' . $strChecked . '  class="q_check"  value="'.($currChoice->choice_text).'"></td>';
			$strChoice .= '<td>'.($currChoice->choice_text).'</td>';
		}

		$strInput	.= $strChoice . '</tr></table>';
		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}

	function draw_vertical_checkboxes($in_question)
	{

		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<table border="0" cellspacing="0" cellpadding="2">';

		$answerID    = ' name="answer_'.$in_question->q_id.'"';

		foreach($in_question->array_choices as $choice_id => $currChoice)
		{
			$strChecked = ($currChoice->bool_default)?"checked":"";
			$strChoice .= '<tr>';
			$strChoice .= '<td><input  '.$answerID.' type=checkbox ' . $strChecked . '  class="q_check"  value="'.($currChoice->choice_text).'"></td>';
			$strChoice .= '<td>'.($currChoice->choice_text).'</td>';
			$strChoice .= '</tr>';
		}

		$strInput	.= $strChoice . '</table>';
		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}


	//-- draw a drop down listbox
	function draw_dropdown_listbox($in_question)
	{
		$answerID    = ' name="answer_'.$in_question->q_id.'"';
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<select  '.$answerID.' class="q_sline_select"><option></option>';

		foreach($in_question->array_choices as $choice_id => $currChoice)
		{
			$strChecked = ($currChoice->bool_default)?"selected=TRUE":"";
			$strChoice .= '<option  ' . $strChecked . '  gotoqid="'.$currChoice->choice_goto_q_id.'">'.($currChoice->choice_text).'</option>';
		}

		$strInput	.= $strChoice . '</select>';
		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;

	}

	//-- draw a multi select listbox
	function draw_mline_listbox($in_question)
	{
		$answerID    = ' name="answer_'.$in_question->q_id.'"';
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<select  '.$answerID.' MULTIPLE class="q_mline_select" ';


		$intSize = 0;
		foreach($in_question->array_choices as $choice_id => $currChoice)
		{
			$intSize++;
			$strChecked = ($currChoice->bool_default)?"selected":"";
			$strChoice .= '<option type=checkbox ' . $strChecked . '>'.($currChoice->choice_text).'</option>';
		}

		$strInput	.= ' size='. $intSize. '>'.$strChoice . '</select>';
		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;

	}

	//-- draw out a message
	function draw_message($in_question)
	{
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML = '<p ' . $questionID . '>'.($in_question->q_text).'</p>';
		return $strHTML;
	}


	//-- draw out a text input
	function draw_singleline_input($in_question)
	{
		//-- get the options
		$answerID    = ' name="answer_'.$in_question->q_id.'"';
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<input  '.$answerID.' class="q_textbox" type=text>';

		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}

	//-- draw out a text password input
	function draw_password_input($in_question)
	{
		//-- get the options
		$answerID    = ' name="answer_'.$in_question->q_id.'"';
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<input  '.$answerID.' class="q_textbox" type=password>';

		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}



	function draw_multiline_input($in_question)
	{
		$answerID    = ' name="answer_'.$in_question->q_id.'"';
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<textarea  '.$answerID.' class="q_textarea"></textarea>';

		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}


	//-- draw out a input box for numeric input
	function draw_numeric_input($in_question)
	{
		$answerID    = ' name="answer_'.$in_question->q_id.'"';
		$questionID = ' id="question_'.$in_question->q_id.'"';
		//-- get the options
		$strHTML	 = '';
		$strQuestion = '<span><span ' . $questionID . '>'.($in_question->q_text).'</span><br/>';
		$strInput	 = '<input  '.$answerID.' type=text class="q_textbox" vtype="numeric"><br/>(a numeric value is expected for this field)';

		$strHTML	.= $strQuestion.$strInput.'</span>';
		return $strHTML;
	}
?>