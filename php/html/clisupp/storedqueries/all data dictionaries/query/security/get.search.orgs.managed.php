<?php
$analystId = $session->analystId;
$sqlDatabase = "swdata";
$sqlCommand = "select group_concat(concat(companyname, ':', regexp_replace(regexp_replace(pk_company_id, '\\s', '_'), '\\W', ''))) as groups from company where fk_supportauthoriser_id ='$analystId' group by fk_supportauthoriser_id";