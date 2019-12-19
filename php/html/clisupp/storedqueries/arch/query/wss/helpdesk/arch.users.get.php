<?php

$sqlCommand = "select keysearch, CONCAT(firstname, ' ', surname) as fullname, attrib1 as aid from userdb where attrib1 != ''";