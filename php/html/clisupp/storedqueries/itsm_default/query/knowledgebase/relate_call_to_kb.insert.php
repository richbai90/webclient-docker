<?php

	//--
	//-- relate call  to kb document - expects callref (cr), docref (did) and relcode (rel)

	$sqlDatabase = "swdata";
	$sqlCommand =  "insert into CMN_REL_OPENCALL_KB (FK_KBDOC,FK_CALLREF,RELCODE) values ('![did]',![cr:numeric],':[rel]')";

?>