<?php
//-- Get Post Values
$boolPaged = $_POST['paged'];
$intPageNo = $_POST['start'];
$strFilter = $_POST["sf"];
$strPIDS = $_POST["pids"];
$webclient = $_POST['webclient']; //-- Is Called By Webclient

//--Strip White Space From Filter
$strFilter = str_replace("'% ","'%",$strFilter);
$strFilter = str_replace(" %'","%'",$strFilter);

if($_POST['empty']=="1")
{
	//-- return empty recordset
	throwSuccess(0);
}

if(!isset($_POST['paged']) || $_POST['start']=="" || $_POST['pids']=="")
{
	throwSuccess();
}
//-- Include Paging Specific Helpers File
IncludeApplicationPhpFile("paging.helpers.php");

if(!$strFilter)
{
	$strFilter = " config_itemi.PK_AUTO_ID in (" . $strPIDS . ")";
}else
{
	$strFilter = " config_itemi.PK_AUTO_ID in (" . $strPIDS . ") " . $strFilter;
}

//-- Pass Filter to Paging Functions
$strPagedQuery = sql_page($strFilter, $intPageNo, swfc_selectcolumns(), swfc_fromtable(), swfc_orderby());

$sqlDatabase = swfc_source();
$sqlCommand = $strPagedQuery;
?>