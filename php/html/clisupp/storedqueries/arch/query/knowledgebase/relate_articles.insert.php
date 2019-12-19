<?php

	//--
	//-- relate parent and child kb documents - expects parentdoc (pd) param and childdoc (cd) params

	$sqlDatabase = "swdata";
	$sqlCommand = "insert into SWKB_RELATED (DOCREF,RELATEDDOCREF) values ('![pd]','![cd]')";

?>