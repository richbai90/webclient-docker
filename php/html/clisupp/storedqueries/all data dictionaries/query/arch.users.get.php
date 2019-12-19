<?php
$sqlDatabase = "swdata";
$sqlCommand = "select keysearch, CONCAT(firstname, ' ', surname) as fullname, userdb.attrib1 as aid from userdb join sw_systemdb.swanalysts on userdb.attrib1 = swanalysts.analystid where swanalysts.supportgroup like 'arch/%'";