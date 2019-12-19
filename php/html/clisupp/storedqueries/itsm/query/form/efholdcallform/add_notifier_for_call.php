<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$oh_mailbox = $_POST["oh_mailbox"];
	$oh_template = $_POST["oh_template"];
	$oh_diary_entry = $_POST["oh_diary_entry"];
	$oh_period_name = $_POST["oh_period_name"];
	$oh_recipient = $_POST["oh_recipient"];
	$callref = $_POST["callref"];
	$oh_alert_time = $_POST["oh_alert_time"];
	$oh_popup_subject = $_POST["oh_popup_subject"];
	$oh_popup_message = $_POST["oh_popup_message"];

	if(!_validate_url_param($oh_mailbox,"sqlparamstrict") || !_validate_url_param($oh_template,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($oh_diary_entry,"sqlparamstrict") || !_validate_url_param($oh_period_name,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($oh_recipient,"sqlparamstrict") || !_validate_url_param($callref,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($oh_alert_time,"sqlparamstrict") || !_validate_url_param($oh_popup_subject,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($oh_popup_message,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strTable = "ONHOLD_OC_NOTIFIERS";
	$arrData['MAILBOX'] = PrepareForSql($oh_mailbox);
	$arrData['TEMPLATE'] = PrepareForSql($oh_template);
	$arrData['DIARY_ENTRY'] = PrepareForSql($oh_diary_entry);
	$arrData['ONHOLD_PERIOD'] = PrepareForSql($oh_period_name);
	$arrData['RECIPIENT'] = PrepareForSql($oh_recipient);
	$arrData['FK_CALLREF'] = PrepareForSql($callref);
	$arrData['EMAIL_SENT'] = 0;
	$arrData['NOTIF_QUEUEX'] = PrepareForSql($oh_alert_time);
	$arrData['POPUP_SUBJECT'] = PrepareForSql($oh_popup_subject);
	$arrData['POPUP_MESSAGE'] = PrepareForSql($oh_popup_message);
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
	
?>