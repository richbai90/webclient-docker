<?php
  //-- Include ITSM helpers
  IncludeApplicationPhpFile("itsm.helpers.php");
  if(!isset($_POST['callref']) ||$_POST['callref']==="") {
    throwSuccess();
  }

  $boolNoSQLInjection = true;
  $intCallref = $_POST['callref'];
  $boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intCallref, "num") : false);
  $strColumns = "SELECT " . $_POST['columns'];
  $boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strColumns,"sqlparamstrict") : false);
  $strFromTable = $_POST['table'];
  $boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strFromTable,"sqlparamstrict") : false);
  $strOrderBy = $_POST['orderby'];
  $boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strOrderBy,"sqlparamstrict", true) : false);
  if($strOrderBy != "") {
    $strOrderBy = " ORDER BY ".$strOrderBy;
  }
  $strAdditionalTables = $_POST['addtables'];
  $boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strAdditionalTables,"sqlparamstrict", true) : false);

  if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Request Asset Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

  //Process table joins
  $strTableJoins = wssProcessTableJoins($strAdditionalTables);
  $strFromTable = " FROM " . $strFromTable.$strTableJoins;
  //END processing table join data

  $strWhere = " WHERE cmn_rel_opencall_ci.fk_callref = ".$intCallref;
  $strWhere .= " AND relcode IN ('INCIDENT', 'RFC-CAUSE', 'RFC-AFFECT') AND config_itemi.pk_auto_id IS NOT NULL ";

  $sqlDatabase = "swdata";
  $sqlCommand = $strColumns.$strFromTable.$strWhere.$strOrderBy;
