<?php
     $sqlDatabase = "swdata";
     $sqlCommand = "select count(*) as counter from ITSM_OC_WIZ where FK_CALLREF =![in_callref:numeric]";
?>