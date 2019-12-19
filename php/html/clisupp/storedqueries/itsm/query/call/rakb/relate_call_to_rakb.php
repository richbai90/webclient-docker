<?php

	//-- insert relationship between call and right answers doc - used in global.js - relate_call_to_rakb

	$SqlDatabase = "swdata";
	$SqlCommand = "INSERT INTO (FK_KBDOC,FK_CALLREF,RELCODE) values ('![radid]',![cr:num],':[relcode]')";

?>