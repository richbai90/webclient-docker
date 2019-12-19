<?php 
include_once('helpers/session_check.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include('helpers/helpers.php');

$strCurrentAppcode = gv('dataset');


if(!check_secure_key('wizutil_export_key'))
{
	//-- set uploading to zero (determines if action is being taken)
	echo "Authentication failure. The action to export was not performed.";
	unset($_SESSION['wizutil_export_key']);
	exit;
}	



function get_info($table,$filter_id)
{
	global $doc;
	
	$con = new CSwDbConnection;
	if(!$con->Connect(swdsn(),swuid(),swpwd()))
	{
		echo "Failed to connect to database, please check ODBC connection";
		exit;
	}
	$table_fields = get_table_fields($table);
	if ($table_fields=="")
	{
		echo "Failed to get table info. Please contact your Supportworks Administrator";
		exit;
	}

	$prefix = uniqid($table);
	
	
	//echo $table . "<BR>";

	switch($table)
	{
		case 'wssm_wiz':
			$data_query = "SELECT * FROM " . $table . " WHERE pk_name =  '" . pfx($filter_id) . "'";
			$group_name = 'wizards';
			$single_name = 'wizard';
		break;
		case 'wssm_wiz_stage':
			$data_query = "SELECT * FROM " . $table . " WHERE fk_wiz =  '" . pfx($filter_id) . "'";
			$group_name = 'stages';
			$single_name = 'stage';
		break;
		case 'wssm_wiz_q':
			$data_query = "SELECT * FROM " . $table . " WHERE fk_wiz_stage =  ".$filter_id;
			$group_name = 'questions';
			$single_name = 'question';
		break;
		case 'wssm_wiz_qc':
			$data_query = "SELECT * FROM " . $table . " WHERE fk_qid =  ".$filter_id;
			$group_name = 'choices';
			$single_name = 'choice';
		break;
		case 'wssm_wiz_qac':
			$data_query = "SELECT * FROM " . $table . " WHERE fk_qid =  ".$filter_id;
			$group_name = 'jumps';
			$single_name = 'jump';
		break;

		default: return;
	}

	$xml_group = '';
	//echo $data_query . "<BR>";
	

	if($con->Query($data_query))
	{
		
		while($con->Fetch($prefix))	
		{
			if (''==$xml_group) $xml_group = $doc->create_element($group_name);

		
			$snippet = $doc->create_element($single_name);
			//$snippet->set_attribute("table", $table);
			
			foreach ($table_fields as $field_name){
				if ('appcode' == $field_name) continue;
				if (''==gv($prefix.'_'.$field_name)) continue;
				$field = $doc->create_element($field_name);
				$field->append_child($doc->create_text_node(gv($prefix.'_'.$field_name)));
				//$newnode = $snippet->append_child($field);
				$snippet->append_child($field);
				//echo $field_name . ' : ' . $GLOBALS[$prefix.'_'.$field_name] . '<br />';
			}

			switch ($table){
				case 'wssm_wiz':
					$x = get_info('wssm_wiz_stage', gv($prefix.'_pk_name'));
					if ($x!=null)
					{
						$snippet->append_child($x);
					}
				break;
				case 'wssm_wiz_stage':
					$x = get_info('wssm_wiz_q', gv($prefix.'_pk_auto_id'));
					if ($x!=null)
					{
						$snippet->append_child($x);
					}
				break;
				case 'wssm_wiz_q':
					$x = get_info('wssm_wiz_qc', gv($prefix.'_pk_qid'));
					if ($x!=null)
					{
						$snippet->append_child($x);
					}
					$x = get_info('wssm_wiz_qac', gv($prefix.'_pk_qid'));
					if ($x!=null)
					{
						$snippet->append_child($x);
					}
				break;
			}
			$xml_group->append_child($snippet);

		}
		
	}
	return $xml_group;
}


function _tidy($str){
	return str_replace(array('<','>'),array('[',']'),$str);
}

$outputFiles = '';


if (count($_POST['process'])>0){

	$arrWorkflow = $_POST['process'];

	foreach ($arrWorkflow as $w){
		$w = str_replace('%20',' ',$w); //don't ask
	// create a new XML document
		$doc = domxml_new_doc('1.0');
//		$root = $doc->create_element('wix');
	
		$x = get_info('wssm_wiz', $w);
//		$root->append_child($x);
//		$doc->append_child($root);
		$doc->append_child($x);
		
		$xml_string = $doc->dump_mem(true);


		$arrChars = array('/','\\','?','%','*',':','|','"','<','>','.');
		$FileName = str_replace($arrChars, "_", $w).".xml";
		$strCurrentAppcode = str_replace($arrChars, "_", $strCurrentAppcode);
		//--Get Workign directory from session varaibles
		$workingdir = $_SESSION['strDirectory'];
		if (!is_dir($workingdir.$strCurrentAppcode)) {
			mkdir($workingdir.$strCurrentAppcode);
		}
		//echo $workingdir.$strCurrentAppcode.'/'.$FileName;
		$fh = fopen($workingdir.$strCurrentAppcode.'/'.$FileName, 'w') or die("can't open file");
		$outputFiles .= '<li>' . $FileName . '</li>';
		fwrite($fh, $xml_string);
		fclose($fh);
		
	}

}


?><html>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link href="../css/structure_ss.css" rel="stylesheet" type="text/css" />
	<link href="../css/elements.css" rel="stylesheet" type="text/css" />
	<body style="background-color:#ffffff;overflow:hidden;">
<?php
 if ('' != $outputFiles){
	echo "<p> Export Complete. The following file(s) have been created:<br /><ul>" . $outputFiles . '</ul></p>';
	//echo "<p>The files are located in '".$workingdir.$strCurrentAppcode."'.";
}
else
{
	echo "<p> No process has been selected.";
}

?>
</p></body></html>

