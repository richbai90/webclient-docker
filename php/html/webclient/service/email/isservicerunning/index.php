<?php

//-- fast way to check if mail server is running as xmlmc api does not work if it is not running
include('../../../php/session.php');

function isRunning($serviceName)
{
	exec("sc query " .$serviceName,$output);
	return !stristr(implode("\n",$output), 'STOPPED');
}

if(isRunning('swmailservice'))
{
	echo "true";
}
else
{
	echo "false";
}
exit(0);
?>