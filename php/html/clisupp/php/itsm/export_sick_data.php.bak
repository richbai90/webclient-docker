<?php

//-- This script will export sick data for a specified call to a csv file
//-- This script is currently triggered via VPME onCallResolved event

session_start();
$_SESSION['portalmode'] = "FATCLIENT";

include_once('stdinclude.php');
include_once('itsm_default/xmlmc/classactivepagesession.php');
include_once('itsm_default/xmlmc/classdatabaseaccess.php');
include_once('itsm_default/xmlmc/xmlmc.php');
include_once('itsm_default/xmlmc/helpers/language.php');
@include('itsm_default/xmlmc/common.php');
	
$sessid = gv('sessid');

//-- Construct a new active page session
$session = new classActivePageSession($sessid);
//-- Initialise the session
$session->IsValidSession();
	
$swData = database_connect("swdata");

//$strSQL = "select * from request_comp join opencall on request_comp.fk_callref=opencall.callref join sc_folio on opencall.itsm_fk_service = sc_folio.fk_cmdb_id where fk_callref=".$_GET['callref'];
$strSQL = "select * from opencall where callref=".gv('callref');
$rsCosts = $swData->query($strSQL,true);

if (!function_exists('fputcsv')) 
{
  
  function fputcsv(&$handle, $fields = array(), $delimiter = ',', $enclosure = '') 
  {
    $str = '';
    $escape_char = '\\';
    foreach ($fields as $value) 
    {
      if (strpos($value, $delimiter) !== false ||
          strpos($value, $enclosure) !== false ||
          strpos($value, "\n") !== false ||
          strpos($value, "\r") !== false ||
          strpos($value, "\t") !== false ||
          strpos($value, ' ') !== false) 
      {
        $str2 = $enclosure;
        $escaped = 0;
        $len = strlen($value);
        for ($i=0;$i<$len;$i++) 
        {
          if ($value[$i] == $escape_char) 
            $escaped = 1;
          else if (!$escaped && $value[$i] == $enclosure) 
            $str2 .= $enclosure;
          else 
            $escaped = 0;
          $str2 .= $value[$i];
        }
        $str2 .= $enclosure;
        $str .= $str2.$delimiter;
      } 
      else 
        $str .= $value.$delimiter;
    }
    $str = substr($str,0,-1);
    $str .= "\n";
    return fwrite($handle, $str);
  }

}

function WriteCsv($fileName, $delimiter = ',', $records)
{

  $result = array();
  foreach($records as $key => $value)
    $results[] = implode($delimiter, $value);
  $fp = fopen($fileName, 'w');
  foreach ($results as $result) 
    fputcsv($fp, explode($delimiter, $result));
  fclose($fp);
}

# =================== Run Output ====================

define('CSV_SEPERATOR',',');
define('CSV_PATH','\\hr system exports\\');
define('CSV_FILENAME','sicknessrecord_'.gv('callref').'.csv');

$records = array ();

//--add titles
$titles = array ('Employee Name','Sick Date','Reason');
array_push($records,$titles);

//-- add data
while(!$rsCosts->eof)
{
	$temp = array(substr($rsCosts->f('emp_sick_name'),(strpos($rsCosts->f('emp_sick_name'),':')+2)),substr($rsCosts->f('emp_sick_startdate'),(strpos($rsCosts->f('emp_sick_startdate'),':')+2)),substr($rsCosts->f('emp_sick_reason'),(strpos($rsCosts->f('emp_sick_reason'),':')+2)));
	array_push($records,$temp);
	$rsCosts->movenext();
}
                 
$fileName = sw_getcfgstring("InstallPath") . CSV_PATH . CSV_FILENAME; 
WriteCsv ($fileName,',',$records);                 

?>