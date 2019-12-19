<?php
	//error_log('string');
	error_reporting(E_ALL);
	IncludeApplicationPhpFile("itsm.helpers.php");

	$cmd = $_POST['cmd'];
	$qID = $_POST['qID'];
	$vType = $_POST['type'];
	$vDetails = $_POST['details'];
	$table = $_POST['table'];
	$valid_type = $_POST['valid_type'];
	$sqlDatabase = "swdata";

  // update fk_qid if it's == 0
  if($cmd == 'get_fk_qid'){
    $sqlCommand =
      "UPDATE wssm_wiz_q_valid
       SET fk_qid = ".PrepareForSQL($qID)."
       WHERE fk_qid = 0 ";
  } elseif ($cmd == 'check_fk_qid'){
      $sqlCommand =
        "DELETE FROM wssm_wiz_q_valid
          WHERE fk_qid = 0";
  } else {

    if($table == 'wssm_wiz_q'){
      $sqlCommand =
        "UPDATE wssm_wiz_q
        SET validation_type = ".PrepareForSQL($valid_type)."
        WHERE pk_qid = ".PrepareForSQL($qID)." ";
    }else{
    	if($cmd == 'remove'){
        $sqlCommand = "DELETE FROM wssm_wiz_q_valid
          WHERE fk_qid = ".PrepareForSQL($qID)."
          AND validation_type= '".PrepareForSQL($vType)."'";

    	}else{
    		// if valid type for question does exist update, else, insert
    		$strSQL = "SELECT addl_info FROM wssm_wiz_q_valid
    		WHERE fk_qid = ".PrepareForSQL($qID)."
    		AND validation_type = '".PrepareForSQL($vType)."' ";
    		$aRS = get_recordset($strSQL, 'swdata');

    		$sqlCommand = ($aRS->Fetch())?
    		"UPDATE wssm_wiz_q_valid SET addl_info = '".PrepareForSQL($vDetails)."'
    			WHERE fk_qid = ".PrepareForSQL($qID)."
    			AND validation_type= '".PrepareForSQL($vType)."'"
    		: "INSERT INTO wssm_wiz_q_valid ( fk_qid, validation_type, addl_info)
    			VALUES($qID, '$vType', '$vDetails')";
      }
    }
  }
?>
