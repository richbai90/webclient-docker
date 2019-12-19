<?php

include('swphpdll.php');
swphpGlobaliseRequestVars();

$surveyid = $_POST["surveyid"];
$filename = $_POST["filename"];

swCreateTemporarySession();

//-- show form to submit data
if($surveyid=="" || $filename=="")
{
	$result = new swphpDatabaseQuery('SELECT surveyid,surveyname FROM survey_config order by startdate desc','sw_systemdb');
	$num_rows = $result->rowCount();
	$opthtml = "";
	if ($num_rows) 
	{
	  while ($row =$result->fetch()) 
	  {
		  $opthtml .= '<option value="'.$row['surveyid'].'">' . htmlentities($row['surveyname']) . "</option>";
	  }
	}
	$html .= '</tr>';



?>
	<form name='surveyxls' target="_self">
		Survey ID : <select type='text' name='surveyid'><option value==''>Please select...</option><?php echo $opthtml;?></select><br>
		Save As Filename :<input type='text' name='filename' value='survey_results.xls'>
		<input type='submit'>
	</form>
<?php

	swCloseTemporarySession();
	exit;
}

//--
//-- want to save as xls
header("Content-type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=$filename");


//--
//-- output uestion headers
$qids = array();
$html = "<table border=1>";
$html .= "<tr><td><b>Call Reference</b></td>";
$html .= "<td><b>Customer</b></td>";

//-- select question text
$result = new swphpDatabaseQuery('SELECT qid, qtext FROM survey_q where sid='.$surveyid.' and type != 6 order by qid asc','sw_systemdb');
$num_rows = $result->rowCount();
if ($num_rows) 
{
  while ($row = $result->fetch()) 
  {
	  $html .= '<td><b>' . htmlentities($row['qtext']) . "</b></td>";
	  $qids[$row['qid']] =$row['qtext'];

  }
}
$html .= '</tr>';



//-- output answers

//-- query
$arrcustqs = array();
$names = array();
$result = new swphpDatabaseQuery('SELECT callref, custname, value, qid FROM survey_r, survey_ra where survey_r.srid = survey_ra.srid and survey_r.sid='.$surveyid.' order by qid, callref, value asc','sw_systemdb');
if($result===false)die("Could not connect : " . mysql_error());

$num_rows = $result->rowCount();
if ($num_rows) 
{
  while ($row = $result->fetch()) 
  {
	
	$avalue = $row['value'];
	if($avalue=="")$avalue="no answer";
	if(!isset($arrcustqs[$row['callref']]))
	{
		$arrcustqs[$row['callref']]=array();
		//foreach ($qids as $aqid => $txtQuestion) 
		//{
		//	$arrcustqs[$row['callref']][$aqid]="not answered";
		//}
	}
		
	if(!isset($arrcustqs[$row['callref']][$row['qid']]))
	{
		$arrcustqs[$row['callref']][$row['qid']]=stripslashes($avalue);	
	}
	else if ($arrcustqs[$row['callref']][$row['qid']]!="")
	{
		if(substr($arrcustqs[$row['callref']][$row['qid']],0,12)=="not answered")
			$arrcustqs[$row['callref']][$row['qid']] = substr($arrcustqs[$row['callref']][$row['qid']],12);
		if($arrcustqs[$row['callref']][$row['qid']]!="")
			$arrcustqs[$row['callref']][$row['qid']].=", ";
		$arrcustqs[$row['callref']][$row['qid']].=stripslashes($avalue);		
	}
	

	$arrcustqs[$row['callref']][9998]=stripslashes($row['callref']);
	$arrcustqs[$row['callref']][9999]=stripslashes($row['custname']);

	
	foreach ($qids as $aqid => $txtQuestion) 
	{
		if(!isset($arrcustqs[$row['callref']][$aqid]))
		$arrcustqs[$row['callref']][$aqid]="not answered";
	}
	

  }
}

foreach ($arrcustqs as $name => $arrq) 
{
  $html .= "<tr>";
  $html .= '<td>' . swcallref_str($arrcustqs[$name][9998]) . "</td>";
  $html .= '<td>' . $arrcustqs[$name][9999] . "</td>";

  foreach ($arrq as $aqid => $avalue) 
  {
	if($aqid!=9998 && $aqid!=9999)
	  $html .= '<td>' . htmlentities($avalue) . "</td>";
  }
  $html .= "</tr>";
}
$html .= "</table>";

echo $html;


swCloseTemporarySession();

?>