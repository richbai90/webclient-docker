<?php

//-- we have xmlc and sqlquery to hand so we can do a sql statement and construct fusion chart data set

$rs = new SqlQuery();
echo $rs->GenerateDrillDownData("suppgroup","callref,status,itsm_title,logdatex,suppgroup,owner","opencall","callclass='Incident' and status in (9,10,11,12)","sw_systemdb");


?>