<?php
	//-- Relate ci type to kb document - expects ci type (ct), docref (did) and display type (dt)
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build addRecord
	$strTable = "CI_TYPE_RELKB";
	$arrData['FK_CONFIG_TYPE'] = '![ct]';
	$arrData['TYPE_DISPLAY'] = '![td]';
	$arrData['KB_DOCREF'] = '![did]';
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);

?>