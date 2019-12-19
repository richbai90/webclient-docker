<?php
$analystId = $session->analystId;
$sqlDatabase = "sw_systemdb";
$sqlCommand = "select swanalysts.analystid as personal, group_concat(concat(swgroups.name, ':', regexp_replace(regexp_replace(groupid, '\\s', '_'), '\\W', ''))) as groups, priveligelevel as privilege from swanalysts left join swanalysts_groups on swanalysts.analystid = swanalysts_groups.analystid join swgroups on swgroups.id = swanalysts_groups.groupid where swanalysts.class = 1 and swanalysts.analystid='$analystId' group by swanalysts_groups.analystid";