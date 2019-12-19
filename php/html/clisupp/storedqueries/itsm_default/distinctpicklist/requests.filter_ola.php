<?php
 //-- 2012.11.12
 //-- return data from sla table, filtered to current filter settings
 $parsedFilter = "";
 $intSLA = $_POST['fksla'];
 if($intSLA=="")$intSLA="-1";
 
 $strSQL  = "select fk_child_itemtext from config_reli where fk_parent_itemtext = '" .$intSLA. "' and fk_parent_type='ME->SLA' and fk_child_type='ME->OLA'";
 $oRS = new SqlQuery();
 $oRS->Query($strSQL);
 //-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
 //-- Check for XMLMC Error
 if($oRS->result==false)
 {
  //-- Function from app.helpers.php to process error message.
  handle_app_error($oRS->lastErrorResponse);
  exit(0);
 }
 //-- END
 $strOLAs = "";
 while($oRS->Fetch())
 {
  $strOLAKey  = $oRS->GetValueAsString("fk_child_itemtext");
  if($strOLAs!="")
   $strOLAs .=",";
  $strOLAs .=PrepareForSql($strOLAKey);
 }
 
 if(isset($_POST['cikeys']))
 {
  $strCIs = $_POST['cikeys'];
  if($strCIs=="")$strCIs="-1";
  $strSQL  = "select fk_parent_itemtext from config_reli where fk_child_id in (" .$strCIs. ") and fk_parent_type='ME->OLA'";
  $oRS = new SqlQuery();
  $oRS->Query($strSQL);
  //-- Check for XMLMC Error
  if($oRS->result==false)
  {
   //-- Function from app.helpers.php to process error message.
   handle_app_error($oRS->lastErrorResponse);
   exit(0);
  }
  //-- END
  while($oRS->Fetch())
  {
   $strOLAKey  = $oRS->GetValueAsString("fk_child_itemtext");
   if($strOLAKey)
   {
    if($strOLAs!="")
     $strOLAs .=",";
    $strOLAs .=PrepareForSql($strOLAKey);
   }
  }
 }
 
 if($strOLAs!="")
 {
  $parsedFilter = "pk_ola_id in (".$strOLAs.")";
 }
 // perform appcode filtering server side
 $strAppcodes = getAppcodeFilter("FILTER.APPCODE.OLA");
 
 if($strAppcodes!="")
 {
  if($parsedFilter!="") 
   $parsedFilter = " appcode in (".$strAppcodes.") and " . $parsedFilter;
  else
   $parsedFilter = " appcode in (".$strAppcodes.") " . $parsedFilter;
 }
 
 //-- if we have a filter then and the where
 if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;
 
 $sqlDatabase = "swdata";
 $sqlCommand = swfc_selectcolumns() . " from itsmsp_slad_ola ".$parsedFilter. swfc_orderby();

?>