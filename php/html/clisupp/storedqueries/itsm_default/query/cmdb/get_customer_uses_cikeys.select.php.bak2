<?php

$sqlCommand = "select CONFIG_ITEMI.PK_AUTO_ID from CONFIG_ITEMI right join config_reli on CONFIG_ITEMI.pk_auto_id = config_reli.fk_child_id where FK_CHILD_TYPE not like 'ME->%' and FK_PARENT_TYPE = 'ME->CUSTOMER' and FK_PARENT_ID IN (![mids:sarray]) and isactivebaseline = 'YES'";
?>