<?php
$errors[1] = '<b>An error has occured:</b> <font color="#ff0000">No survey id was specified</font>';
$errors[2] = '<b>An error has occured:</b> <font color="#ff0000">No questions found for survey</font>';
$errors[3] = '<b>An error has occured:</b> <font color="#ff0000">No report specified</font>';
$errors[4] = '<b>An error has occured:</b> <font color="#ff0000">Database connection failed</font>';
$errors[5] = '<b>An error has occured:</b> <font color="#ff0000">No results found or survey ID invalid</font>';
$errors[6] = '<b>An error has occured:</b> <font color="#ff0000">No more questions found</font>';
$errors[7] = '<b>An error has occured:</b> <font color="#ff0000">Survey Not Found</font>';
$errors[8] = '<b>An error has occured:</b> <font color="#ff0000">Sorry, you have already completed this survey OR have not been invited to take part</font>';
$errors[9] = '<b>(Preview Mode)</b> All questions answered, thank you for your time';
$errors[10] = '<b>An error has occured:</b> <font color="#ff0000">Failed to create a temporary Supportworks session</font>';
$errors[11] = '<b>An error has occured:</b> <font color="#ff0000">Failed to bind to Supportworks session</font>';

include('stdinclude.php');
swphpGlobaliseRequestVars();

$_WSSM_SITE_TITLE = "Customer Survey";

$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
if (file_exists("customisation/override.php")) include('customisation/override.php'); //-- any overriding image paths (for logos)


?>
<html>
<head>
<title><?php echo $_WSSM_SITE_TITLE; ?></title>
<LINK REL=StyleSheet HREF="styles/mainstyles.php" TYPE="text/css">
<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="css/survey_elements.css" rel="stylesheet" type="text/css" />
<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
<script language="javascript">
<!--
function validate(){
	var valid = false;
	for (x = 0 ; x < document.survey.length ; x++){
		if ((document.survey.elements[x].name != 'carry') && (document.survey.elements[x].name != 'qid') && (document.survey.elements[x].name != 'withheld')){
			if (document.survey.elements[x].type == 'radio' || document.survey.elements[x].type == 'checkbox'){
				if (document.survey.elements[x].checked) valid = true;
				}
			else {
				if (document.survey.elements[x].value) valid = true;
				}
//			alert (document.survey.elements[x].type + " = " + document.survey.elements[x].name + " = " + valid);
			}
		}
	if (valid) document.survey.submit();
	else alert("Sorry: A required answer is missing.")
	}
//-->
</script>
</head>
<body>
<div id="pageArea">
<div id="topBanner">
		<div id="logoContainer"><span id="enterpriseLogo"><img src="<?php echo $_WSSM_HEADER_LOGO;?>" id="logoImage" alt="" /></span></div>
	</div>


<table align="left" style="margin-left:220px;" width="700">
<tr>
	<td>
		<table width="90%">
		<tr>
			<td align="left"><br><br><?php echo $errors[$error]?></td>
		</tr>
		</table>
	</td>
</tr>
</table>
<script language="javascript">
<!--
<?php
if ($script){
	print $script;
	?>
function setnext2(val){
	for(x = 0 ; x < items ; x++){
		if (val == option[x]) {
			document.survey.qid.value = target[x];
//			alert(target[x]);
			return;
			}
		}
	}
<?php } else { ?>
function setnext(nextqid){
	document.survey.qid.value = nextqid;
//	alert(nextqid);
	}
<?php }
print $defnext."\n";
?>
//-->
</script>
</div>
</body>
</html>
